import React, { useState } from 'react';
import { Smartphone, CheckCircle2, ArrowRight, ShieldCheck, Loader2 } from 'lucide-react';
import { UserProfile } from '../types';
import { sendOtpViaWhatsApp, verifyOtpCode, checkPhoneExists, fetchUserProfile } from '../services/supabase';

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

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate phone: 10 digits after +20
    if (!/^\d{10}$/.test(phone)) {
      setError('يرجى إدخال 10 أرقام صحيحة بعد +20');
      return;
    }

    const fullPhone = `+20${phone}`;
    setIsLoading(true);
    setError('');

    try {
      // 1. Check if phone already exists and is verified
      const exists = await checkPhoneExists(fullPhone);
      if (exists) {
        setError('هذا الرقم مفعل ومسجل بحساب آخر بالفعل، يرجى تسجيل الدخول');
        setIsLoading(false);
        return;
      }

      // 2. Send OTP via Bot API
      const { success, error: otpError } = await sendOtpViaWhatsApp(user.id, fullPhone, 'verify');
      setIsLoading(false);

      if (success) {
        setStep('verify');
      } else {
        setError(otpError || 'حدث خطأ أثناء إرسال كود التحقق، يرجى المحاولة لاحقاً.');
      }
    } catch (err) {
      setIsLoading(false);
      setError('فشل الاتصال بخدمة التحقق، يرجى المحاولة لاحقاً.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode.length !== 6) {
      setError('يرجى إدخال كود التحقق المكون من 6 أرقام');
      return;
    }

    setIsVerifying(true);
    setError('');

    try {
      const { success, error: verifError } = await verifyOtpCode(user.id, verificationCode, 'verify');

      if (success) {
        setStep('success');
        // Small delay before redirecting to allow user to see success state
        setTimeout(async () => {
          const updated = await fetchUserProfile(user.id);
          if (updated) onComplete(updated);
        }, 2000);
      } else {
        setIsVerifying(false);
        setError(verifError || 'كود التحقق غير صحيح، يرجى المحاولة مرة أخرى');
      }
    } catch (err) {
      setIsVerifying(false);
      setError('حدث خطأ أثناء التأكد من الكود، يرجى المحاولة لاحقاً.');
    }
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

          {step === 'verify' ? (
            <>
              <h2 className="font-display font-black text-xl text-[#1F2937] mb-2">تأكيد رقم الهاتف</h2>
              <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
                لقد أرسلنا كود التفعيل إلى رقمك عبر واتساب. يرجى إدخال الرمز المكون من 6 أرقام للمتابعة.
              </p>

              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="flex justify-center gap-2" dir="ltr">
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="------"
                    className="w-full py-4 text-center text-2xl font-black tracking-[0.5em] rounded-2xl bg-[#F6F4ED] border-2 border-[#E6E1D3] focus:border-[#254D3F] outline-none transition-all placeholder:opacity-30"
                    required
                  />
                </div>

                {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

                <button
                  type="submit"
                  disabled={isVerifying}
                  className="w-full py-4 rounded-2xl bg-[#254D3F] text-white text-sm font-bold shadow-lg hover:bg-[#1A372D] flex items-center justify-center gap-2 transition-all active:scale-95"
                >
                  {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تأكيد الرمز والدخول'}
                </button>

                <div className="flex flex-col gap-2 mt-4">
                  <button
                    type="button"
                    onClick={() => setStep('phone')}
                    className="text-[10px] text-[#254D3F] font-bold hover:underline"
                  >
                    تغيير رقم الموبايل؟
                  </button>
                </div>
              </form>
            </>
          ) : (
            <>
              <h2 className="font-display font-black text-xl text-[#1F2937] mb-2">إكمال بيانات التسجيل</h2>
              <p className="text-sm text-[#6B7280] mb-6 leading-relaxed">
                أهلاً بك في يدوي! يرجى إضافة رقم الواتساب الخاص بك لتلقي كود التفعيل ومتابعة طلباتك.
              </p>

              <form onSubmit={handleSendOtp} className="space-y-4">
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
                </div>

                {error && <p className="text-xs text-red-600 font-bold">{error}</p>}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-xl bg-[#254D3F] text-white text-sm font-bold shadow-md hover:bg-[#1A372D] flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'إرسال كود التفعيل'}
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
          ) }        </>
      )}

      <div className="mt-8 flex items-center justify-center gap-1.5 text-[10px] text-[#9CA3AF] border-t border-[#E6E1D3] pt-4">
        <ShieldCheck className="w-3.5 h-3.5 text-[#254D3F]" />
        <span>بياناتك محمية ومشفرة وفق أعلى معايير الأمان</span>
      </div>
    </div>
  );
};
