require('dotenv').config();
const { default: makeWASocket, useMultiFileAuthState, DisconnectReason, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } = require('@whiskeysockets/baileys');
const qrcode = require('qrcode-terminal');
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const pino = require('pino');
const NodeCache = require('node-cache');

// --- Configuration & Clients ---
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);
const msgRetryCounterCache = new NodeCache();

const app = express();
app.use(express.json());

// --- Bot State ---
let sock = null;

app.get('/', (req, res) => res.send('Yadaway Bot: Online'));

// --- API Endpoints ---

/**
 * Endpoint to send OTP via WhatsApp
 * Body: { userId: string, phone: string, mode: 'verify' | 'reset' }
 */
app.post('/api/send-otp', async (req, res) => {
    const { userId, phone, mode } = req.body;

    if (!userId || !phone || !mode) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!sock) {
        return res.status(503).json({ error: 'WhatsApp bot is not connected' });
    }

    try {
        const prefix = mode === 'reset' ? 'RESET-' : 'VERIFY-';
        const rawCode = Math.floor(100000 + Math.random() * 900000).toString();
        const fullCode = `${prefix}${rawCode}`;

        // 1. Save to Supabase
        const { error: dbError } = await supabase.from('phone_verifications').insert({
            user_id: userId,
            phone_number: phone,
            verification_code: fullCode,
            status: 'pending',
            expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 mins
        });

        if (dbError) throw dbError;

        // 2. Send via WhatsApp
        const jid = `${phone.replace('+', '')}@s.whatsapp.net`;
        const otpMessage = mode === 'reset'
            ? `*يَدَوِي | Yadaway* 🔑\n\nكود استعادة كلمة المرور الخاص بك هو: *${rawCode}*\n\nلا تشارك هذا الكود مع أحد. الكود صالح لمدة 10 دقائق.`
            : `*يَدَوِي | Yadaway* 🌿\n\nكود تفعيل حسابك هو: *${rawCode}*\n\nأدخله في الموقع لإتمام عملية التسجيل. الكود صالح لمدة 10 دقائق.`;

        await sock.sendMessage(jid, { text: otpMessage });

        res.json({ success: true, message: 'OTP sent successfully' });
    } catch (err) {
        console.error('❌ Error sending OTP:', err.message);
        res.status(500).json({ error: 'Failed to send OTP' });
    }
});

/**
 * Endpoint to verify OTP
 * Body: { userId: string, code: string, mode: 'verify' | 'reset' }
 */
app.post('/api/verify-otp', async (req, res) => {
    const { userId, code, mode } = req.body;

    if (!userId || !code) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    try {
        const prefix = mode === 'reset' ? 'RESET-' : 'VERIFY-';
        const fullCode = code.startsWith(prefix) ? code : `${prefix}${code}`;

        // 1. Check in DB
        const { data: verification, error: fetchError } = await supabase
            .from('phone_verifications')
            .select('*')
            .eq('user_id', userId)
            .eq('verification_code', fullCode)
            .eq('status', 'pending')
            .maybeSingle();

        if (fetchError || !verification) {
            return res.status(400).json({ error: 'كود غير صحيح أو منتهي الصلاحية' });
        }

        if (new Date(verification.expires_at) < new Date()) {
            await supabase.from('phone_verifications').update({ status: 'expired' }).eq('id', verification.id);
            return res.status(400).json({ error: 'انتهت صلاحية هذا الكود' });
        }

        // 2. Process based on mode
        if (mode === 'verify') {
            // Create profile as before
            const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(userId);
            if (userError || !user) throw new Error('User not found');

            const metadata = user.user_metadata || {};

            const { error: profileError } = await supabase.from('profiles').insert({
                id: userId,
                name: metadata.name || user.email.split('@')[0],
                email: user.email,
                phone: verification.phone_number,
                role: metadata.role || 'customer',
                governorate: metadata.governorate || 'القاهرة',
                is_phone_verified: true,
                avatar_url: 'https://xruorzvokjoszybxqaaj.supabase.co/storage/v1/object/public/assets/default-avatar.png'
            });

            if (profileError && profileError.code !== '23505') throw profileError;

            await supabase.auth.admin.updateUserById(userId, {
                phone: verification.phone_number,
                phone_confirm: true
            });
        }

        // 3. Mark as verified
        await supabase.from('phone_verifications').update({ status: 'verified' }).eq('id', verification.id);

        res.json({ success: true });
    } catch (err) {
        console.error('❌ Verification API Error:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// --- Messages ---
const ACK_MESSAGE = `أهلاً بك في يدوي | Yadaway 🌿

تم استلام رمز التفعيل الخاص بك بنجاح، وجاري مراجعة الحساب الآن من قبل فريقنا.

⏳ حالة الطلب: قيد المراجعة
سنقوم بإشعارك عبر هذه المحادثة فور إتمام عملية التفعيل لتتمكن من إكمال طلبك.

شكراً لتفهمك وصبرك!`;

const SUCCESS_MESSAGE = `مرحباً بك مجدداً! ✨

يسعدنا إعلامك بأنه تم تفعيل حسابك بنجاح على منصة يدوي | Yadaway.

🚀 يمكنك الآن العودة للمتجر وإكمال طلبك بسهولة.
نتمنى لك تجربة تسوق رائعة!

لأي استفسار، فريق الدعم دائماً في خدمتك.`;

// --- Bot Logic ---
async function startBot() {
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys');
    const { version } = await fetchLatestBaileysVersion();

    sock = makeWASocket({
        version,
        auth: {
            creds: state.creds,
            keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })),
        },
        printQRInTerminal: true,
        logger: pino({ level: 'silent' }),
        msgRetryCounterCache,
    });

    sock.ev.on('creds.update', saveCreds);

    sock.ev.on('connection.update', (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const shouldReconnect = lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
            console.log('🔄 Reconnecting...', shouldReconnect);
            if (shouldReconnect) startBot();
        } else if (connection === 'open') {
            console.log('✅ Yadaway Bot is Online!');
        }
    });

    // Handle Incoming Messages
    sock.ev.on('messages.upsert', async (m) => {
        const msg = m.messages[0];
        if (!msg.message || msg.key.fromMe) return;

        const jid = msg.key.remoteJid;
        const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').trim().toUpperCase();

        // Extract the code (it might be followed by the phone number)
        const parts = text.split(' ');
        const code = parts[0];

        if (code.startsWith('VERIFY-')) {
            console.log(`📩 Processing verification code: ${code} from ${jid}`);

            // 1. Find verification request
            const { data: verification, error: fetchError } = await supabase
                .from('phone_verifications')
                .select('*')
                .eq('verification_code', code)
                .eq('status', 'pending')
                .maybeSingle();

            if (fetchError || !verification) {
                console.log(`❌ Invalid or expired code: ${code}`);
                return;
            }

            // 2. Check Expiration
            if (new Date(verification.expires_at) < new Date()) {
                await supabase.from('phone_verifications').update({ status: 'expired' }).eq('id', verification.id);
                await sock.sendMessage(jid, { text: '⏰ عذراً، انتهت صلاحية هذا الكود. يرجى طلب كود جديد من الموقع.' });
                return;
            }

            // 3. Create Profile & Verify User
            try {
                // Get user details from Auth
                const { data: { user }, error: userError } = await supabase.auth.admin.getUserById(verification.user_id);

                if (userError || !user) throw new Error('User not found in Auth');

                const metadata = user.user_metadata || {};
                const name = metadata.name || user.email.split('@')[0];

                // Create row in public.profiles (ONLY NOW)
                const { error: profileError } = await supabase.from('profiles').insert({
                    id: user.id,
                    name: name,
                    email: user.email,
                    phone: verification.phone_number,
                    role: metadata.role || 'customer',
                    governorate: metadata.governorate || 'القاهرة',
                    is_phone_verified: true,
                    avatar_url: 'https://xruorzvokjoszybxqaaj.supabase.co/storage/v1/object/public/assets/default-avatar.png'
                });

                if (profileError) {
                   if (profileError.code === '23505') {
                       // Duplicate phone in verified profile
                       await sock.sendMessage(jid, { text: '❌ هذا الرقم مفعل ومسجل بحساب آخر بالفعل، يرجى تسجيل الدخول.' });
                       return;
                   }
                   throw profileError;
                }

                // --- Sync phone to Auth system to allow Phone+Password login ---
                await supabase.auth.admin.updateUserById(user.id, {
                    phone: verification.phone_number,
                    phone_confirm: true
                });

                // Update verification status
                await supabase.from('phone_verifications').update({
                    status: 'verified',
                    whatsapp_jid: jid,
                    notification_sent: true
                }).eq('id', verification.id);

                // Send Success Message
                await sock.sendMessage(jid, { text: SUCCESS_MESSAGE });
                console.log(`🎉 User ${user.id} verified successfully!`);

            } catch (err) {
                console.error('🔥 Verification Error:', err.message);
                await sock.sendMessage(jid, { text: '❌ حدث خطأ أثناء تفعيل حسابك، يرجى التواصل مع الدعم الفني.' });
            }
        } else if (code.startsWith('RESET-')) {
            console.log(`📩 Processing reset code: ${code} from ${jid}`);

            // 1. Find the reset request
            const { data: verification, error: fetchError } = await supabase
                .from('phone_verifications')
                .select('*')
                .eq('verification_code', code)
                .eq('status', 'pending')
                .maybeSingle();

            if (fetchError || !verification) {
                console.log(`❌ Invalid or expired reset code: ${code}`);
                return;
            }

            // 2. Mark as verified so the frontend redirect can happen
            await supabase
                .from('phone_verifications')
                .update({ status: 'verified', whatsapp_jid: jid })
                .eq('id', verification.id);

            // 3. Send confirmation to user
            const resetLink = `https://yadaway.store/#reset-verified?code=${code}`;
            await sock.sendMessage(jid, {
                text: `✅ تم التحقق من هويتك بنجاح. \n\nيرجى الضغط على الرابط التالي لتعيين كلمة مرور جديدة: \n${resetLink}`
            });

            console.log(`🔑 Reset request for user ${verification.user_id} verified.`);
        }
    });
}

startBot();

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`📡 Health check on port ${PORT}`));
