import React, { useState, useEffect } from 'react';
import { Lock, ShieldCheck, CheckCircle2, MessageSquare, Loader2, ArrowRight } from 'lucide-react';
import { initiatePasswordResetWhatsApp, supabase } from '../services/supabase';

interface ResetPasswordViewProps {
  onSuccess: () => void;
  onBack?: () => void;
}

export const ResetPasswordView: React.FC<ResetPasswordViewProps> = ({ onSuccess, onBack }) => {
  const [phone, setPhone] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'verify' | 'new_password' | 'success'>('input');
  const [resetCode, setResetCode] = useState('');

  const ADMIN_WHATSAPP = '201275356468';

  // Listen for reset navigation event & URL Detection
  useEffect(() => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.split('?')[1]);
    const codeFromUrl = urlParams.get('code') || sessionStorage.getItem('yadawy_active_reset_code');

    if (codeFromUrl && codeFromUrl.startsWith('RESET-')) {
      setResetCode(codeFromUrl);
      setStep('new_password');
    }
  }, []);

  const handleInitiateReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('يرجى إدخال 10 أرقام صحيحة بعد +20');
      return;
    }

    setIsLoading(true);
    setError('');

    const fullPhone = `+20${phone}`;
    const { userId: uid, error: resetError } = await initiatePasswordResetWhatsApp(fullPhone);
    setIsLoading(false);

    if (resetError) {
      setError(resetError);
    } else if (uid) {
      setStep('verify');
      // In ResetPasswordView, we don't have the uid passed in props,
      // but initiatePasswordResetWhatsApp returns it after finding the user by phone.
      // We'll store it temporarily to verify the OTP later.
      (window as any)._temp_reset_uid = uid;
      (window as any)._temp_reset_phone = fullPhone;
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const uid = (window as any)._temp_reset_uid;
    if (!uid) {
      setError('حدث خطأ في الجلسة، يرجى المحاولة من جديد');
      setStep('input');
      return;
    }

    setIsLoading(true);
    setError('');

    const { success, error: verifError } = await verifyOtpCode(uid, resetCode, 'reset');
    setIsLoading(false);

    if (success) {
      setStep('new_password');
    } else {
      setError(verifError || 'كود التحقق غير صحيح');
    }
  };

  const handleInitiateReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      setError('يرجى إدخال 10 أرقام صحيحة بعد +20');
      return;
    }

    setIsLoading(true);
    setError('');

    const { code, error: resetError } = await initiatePasswordResetWhatsApp(`+20${phone}`);
    setIsLoading(false);

    if (resetError) {
      setError(resetError);
    } else if (code) {
      setResetCode(code);
      setStep('verify');
    }
  };

  const openWhatsAppReset = () => {
    // نرسل الكود ورقم التليفون معاً في الرسالة للواتساب لسهولة التعرف عليه
    const fullPhoneWithZero = `0${phone}`;
    const message = encodeURIComponent(`${resetCode} ${fullPhoneWithZero}`);
    const link = `https://wa.me/${ADMIN_WHATSAPP}?text=${message}`;
    window.open(link, '_blank');
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن لا تقل عن 6 أحرف');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      // 1. Update Auth password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) throw updateError;

      // 2. Invalidate the reset code in DB for security
      const finalCode = resetCode || sessionStorage.getItem('yadawy_active_reset_code');
      if (finalCode) {
        await supabase
          .from('phone_verifications')
          .update({ status: 'completed' })
          .eq('verification_code', finalCode);

        sessionStorage.removeItem('yadawy_active_reset_code');
      }

      // 3. Success!
      setIsLoading(false);
      setStep('success');

      // Clean up URL hash
      window.location.hash = '';

      setTimeout(() => {
        onSuccess(); // This should trigger AuthModal opening in App.tsx
      }, 2500);

    } catch (err: any) {
      setIsLoading(false);
      setError(err.message || 'حدث خطأ أثناء تحديث كلمة المرور');
    }
  };

  return (
    <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-[#E6E1D3] text-center card-shadow-md animate-fadeIn" dir="rtl">
      <div className="w-16 h-16 rounded-2xl bg-[#C97A57]/10 text-[#C97A57] flex items-center justify-center mx-auto mb-4">
        <Lock className="w-8 h-8" />
      </div>

      {step === 'input' && (
        <>
          <h2 className="font-display font-black text-xl text-[#1F2937] mb-2">استعادة كلمة المرور</h2>
          <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
            يرجى إدخال رقم الواتساب المرتبط بحسابك الموثق لاستلام رمز الاستعادة.
          </p>

          <form onSubmit={handleInitiateReset} className="space-y-4">
            <div className="text-right">
              <label className="text-xs font-bold text-gray-700 block mb-1">رقم الواتساب</label>
              <div className="relative flex items-center" dir="ltr">
                <div className="absolute left-3 flex items-center gap-2 pointer-events-none">
                  <span className="text-sm font-bold text-[#254D3F] font-mono">+20</span>
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="10xxxxxxxx"
                  className="w-full py-2.5 pl-14 pr-4 rounded-xl bg-[#F6F4ED] border border-[#E6E1D3] focus:outline-none focus:border-[#254D3F] transition-colors font-mono text-left text-sm"
                  required
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#C97A57] text-white text-sm font-bold shadow-md hover:bg-[#b56846] flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'استعادة عبر واتساب'}
            </button>

            {onBack && (
              <button type="button" onClick={onBack} className="text-xs text-gray-500 hover:underline">
                العودة لتسجيل الدخول
              </button>
            )}
          </form>
        </>
      )}

      {step === 'verify' && (
        <>
          <h2 className="font-display font-black text-xl text-[#1F2937] mb-2">تأكيد الهوية</h2>
          <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
            لقد أرسلنا كود استعادة كلمة المرور إلى رقمك عبر واتساب. يرجى إدخال الرمز المكون من 6 أرقام.
          </p>

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="flex justify-center gap-2" dir="ltr">
              <input
                type="text"
                maxLength={6}
                value={resetCode}
                onChange={(e) => setResetCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="------"
                className="w-full py-4 text-center text-2xl font-black tracking-[0.5em] rounded-2xl bg-[#F6F4ED] border-2 border-[#E6E1D3] focus:border-[#C97A57] outline-none transition-all placeholder:opacity-30"
                required
              />
            </div>

            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 rounded-2xl bg-[#C97A57] text-white text-sm font-bold shadow-lg hover:bg-[#b56846] flex items-center justify-center gap-2 transition-all active:scale-95"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تأكيد الكود ومتابعة'}
            </button>

            <button
              type="button"
              onClick={() => setStep('input')}
              className="text-[10px] text-[#C97A57] font-bold hover:underline"
            >
              تغيير رقم الموبايل؟
            </button>
          </form>
        </>
      )}

      {step === 'new_password' && (
        <>
          <h2 className="font-display font-black text-xl text-[#1F2937] mb-2">تعيين كلمة مرور جديدة</h2>
          <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
            تم التأكد من هويتك بنجاح. يرجى إدخال كلمة المرور الجديدة.
          </p>

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="كلمة المرور الجديدة"
              className="w-full py-3 px-4 rounded-xl bg-[#F6F4ED] border border-[#E6E1D3] focus:outline-none focus:border-[#254D3F] text-center"
              required
            />
            {error && <p className="text-xs text-red-600 font-bold">{error}</p>}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-[#254D3F] text-white text-sm font-bold shadow-md hover:bg-[#1A372D]"
            >
              {isLoading ? 'جاري التحديث...' : 'تحديث كلمة المرور'}
            </button>
          </form>
        </>
      )}

      {step === 'success' && (
        <div className="py-6 space-y-4">
          <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
            <CheckCircle2 className="w-12 h-12" />
          </div>
          <h2 className="font-display font-black text-2xl text-[#1F2937]">تم التحديث بنجاح!</h2>
          <p className="text-sm text-[#6B7280]">تم تغيير كلمة المرور، يمكنك الآن تسجيل الدخول.</p>
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] text-[#9CA3AF] border-t border-[#E6E1D3] pt-4">
        <ShieldCheck className="w-3.5 h-3.5 text-[#254D3F]" />
        <span>جميع عمليات يدوِي محمية وموثقة بالكامل</span>
      </div>
    </div>
  );
};
