import React, { useState, useEffect } from 'react';
import { Smartphone, CheckCircle2, ArrowRight, ShieldCheck, Loader2, MessageSquare } from 'lucide-react';
import { UserProfile } from '../types';
import { updateProfile, createPhoneVerification, supabase, checkPhoneExists } from '../services/supabase';

interface OnboardingViewProps {
  user: UserProfile;
  onComplete: (updatedUser: UserProfile) => void;
  onLogout?: () => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ user, onComplete, onLogout }) => {
  const [phone, setPhone] = useState(user.phone?.replace('+20', '') || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'phone' | 'verify' | 'success'>(user.phone ? 'verify' : 'phone');
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  const ADMIN_WHATSAPP = '201275356468'; // Official Yadawy Bot Number

  // 1. Listen for real-time verification status change
  useEffect(() => {
    if (step === 'verify' && verificationCode) {
      const channel = supabase
        .channel('phone_verification_updates')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'phone_verifications',
            filter: `verification_code=eq.${verificationCode}`
          },
          (payload) => {
            if (payload.new.status === 'verified') {
              setStep('success');
              setTimeout(() => {
                onComplete({ ...user, phone: `+20${phone}`, isPhoneVerified: true });
              }, 2000);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [step, verificationCode, onComplete, user, phone]);

  // If we already have a phone from previous session, generate a code immediately
  useEffect(() => {
    if (user.phone && !verificationCode && step === 'verify') {
      createPhoneVerification(user.id, user.phone).then(({ code }) => {
        if (code) setVerificationCode(code);
      });
    }
  }, [user.phone, user.id, verificationCode, step]);

  const handleSavePhone = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone: 10 digits
    if (!/^\d{10}$/.test(phone)) {
      setError('يرجى إدخال 10 أرقام صحيحة بعد +20');
      return;
    }

    const fullPhone = `+20${phone}`;

    setIsLoading(true);
    setError('');

    // Check if phone already exists and is verified
    const exists = await checkPhoneExists(fullPhone);
    if (exists) {
      setError('هذا الرقم مسجل به بالفعل، يرجى تسجيل الدخول.');
      setIsLoading(false);
      return;
    }

    // 1. Save phone to profile
    const { error: updateError } = await updateProfile(user.id, { phone: fullPhone });
    if (updateError) {
      setError(updateError);
      setIsLoading(false);
      return;
    }

    // 2. Create verification request
    const { code, error: verifError } = await createPhoneVerification(user.id, fullPhone);
    setIsLoading(false);

    if (verifError) {
      setError(verifError);
    } else if (code) {
      setVerificationCode(code);
      setStep('verify');
    }
  };

  const openWhatsAppVerification = () => {
    const message = encodeURIComponent(verificationCode);
    const link = `https://wa.me/${ADMIN_WHATSAPP}?text=${message}`;
    window.open(link, '_blank');
    setIsVerifying(true);
  };

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-[#E6E1D3] text-center card-shadow-md animate-fadeIn" dir="rtl">
      {step === 'success' ? (
        <div className="py-6 space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="font-display font-black text-2xl text-[#1F2937]">تم التأكيد بنجاح!</h2>
          <p className="text-sm text-[#6B7280]">مرحباً بك في مجتمع يدوي، جارٍ توجيهك للرئيسية...</p>
        </div>
      ) : (
        <>
          <div className="w-16 h-16 rounded-2xl bg-[#254D3F]/10 text-[#254D3F] flex items-center justify-center mx-auto mb-4">
            <Smartphone className="w-8 h-8" />
          </div>

          {step === 'phone' ? (
            <>
              <h2 className="font-display font-black text-xl text-[#1F2937] mb-2">إكمال بيانات التسجيل</h2>
              <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
                أهلاً بك في يدوي! يرجى إضافة رقم الواتساب الخاص بك لمتابعة طلباتك والتواصل مع الحرفيين.
              </p>

              <form onSubmit={handleSavePhone} className="space-y-4">
                <div className="text-right">
                  <label className="text-xs font-bold text-gray-700 block mb-1">رقم الواتساب</label>
                  <div className="relative flex items-center" dir="ltr">
                    <div className="absolute left-3 flex items-center gap-2 pointer-events-none">
                      <span className="text-sm font-bold text-[#254D3F] font-mono">+20</span>
                      <div className="w-px h-4 bg-gray-300" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '');
                        if (val.startsWith('0')) val = val.substring(1);
                        setPhone(val.slice(0, 10));
                      }}
                      placeholder="01xxxxxxxxx"
                      className="w-full py-2.5 pl-14 pr-4 rounded-xl bg-[#F6F4ED] border border-[#E6E1D3] focus:outline-none focus:border-[#254D3F] transition-colors font-mono text-left text-sm"
                      required
                    />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-2 text-center">ادخل الرقم (مثال: 1012345678)</p>
                </div>

                {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-[#254D3F] text-white text-sm font-bold shadow-md hover:bg-[#1A372D] flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'حفظ ومتابعة'}
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </button>

                {onLogout && (
                  <button
                    type="button"
                    onClick={onLogout}
                    className="text-xs text-gray-400 hover:text-red-500 mt-4"
                  >
                    تسجيل الخروج
                  </button>
                )}
              </form>
            </>
          ) : (
            <>
              <h2 className="font-display font-black text-xl text-[#1F2937] mb-2">تأكيد رقم الهاتف عبر واتساب</h2>
              <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
                اضغط على الزر أدناه لإرسال كود التأكيد الخاص بك. <br/>
                كود التأكيد: <span className="font-mono font-bold text-[#C97A57]">{verificationCode}</span>
              </p>

              <button
                onClick={openWhatsAppVerification}
                className="w-full py-4 rounded-xl bg-[#25D366] text-white text-sm font-bold shadow-md hover:bg-[#128C7E] flex items-center justify-center gap-2 mb-4 transition-all active:scale-95"
              >
                <MessageSquare className="w-5 h-5" />
                <span>إرسال كود التأكيد عبر واتساب</span>
              </button>

              {isVerifying && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center gap-3 mb-4">
                  <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
                  <span className="text-xs font-bold text-emerald-800">بانتظار استلام رسالتك...</span>
                </div>
              )}

              <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                لا تغلق هذه الصفحة. سيتم تفعيل حسابك تلقائياً بمجرد إرسال الرسالة من تطبيق واتساب الخاص بك.
              </p>

              <div className="flex flex-col gap-2 mt-4">
                <button
                  onClick={() => setStep('phone')}
                  className="text-[10px] text-[#254D3F] font-bold hover:underline"
                >
                  تغيير رقم الموبايل؟
                </button>
                {onLogout && (
                  <button
                    onClick={onLogout}
                    className="text-[10px] text-gray-400 hover:text-red-500"
                  >
                    تسجيل الخروج
                  </button>
                )}
              </div>
            </>
          )}
        </>
      )}

      <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] text-[#9CA3AF] border-t border-[#E6E1D3] pt-4">
        <ShieldCheck className="w-3.5 h-3.5 text-[#254D3F]" />
        <span>بياناتك محمية ومشفرة وفق أعلى معايير الأمان</span>
      </div>
    </div>
  );
};
