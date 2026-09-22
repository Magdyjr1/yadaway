import React, { useState } from 'react';
import { Lock, ShieldCheck, CheckCircle2, Loader2, X, AlertCircle } from 'lucide-react';
import { supabase } from '../services/supabase';
import { YadawyEmblem } from './YadawyLogo';

interface UpdatePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  resetCode?: string; // Optional code to invalidate
}

export const UpdatePasswordModal: React.FC<UpdatePasswordModalProps> = ({ isOpen, onClose, onSuccess, resetCode }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setError('كلمة المرور يجب أن لا تقل عن 6 أحرف');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
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

      setIsSuccess(true);
      setIsLoading(false);

      setTimeout(() => {
        setIsSuccess(false);
        onSuccess();
        onClose();
      }, 3000);

    } catch (err: any) {
      setIsLoading(false);
      if (err.message?.includes('Auth session missing')) {
        setError('انتهت جلسة التحقق. يرجى طلب رمز استعادة جديد من صفحة الدخول.');
      } else {
        setError(err.message || 'حدث خطأ أثناء تحديث كلمة المرور');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn" dir="rtl">
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-[#E6E1D3] shadow-2xl overflow-hidden animate-scaleIn">

        {/* Header */}
        <div className="bg-[#254D3F] text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <YadawyEmblem size={32} isDark={true} />
            <h2 className="font-display font-bold text-lg">تحديث كلمة المرور</h2>
          </div>
          {!isSuccess && (
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="p-8 text-center">
          {isSuccess ? (
            <div className="py-6 space-y-4 animate-fadeIn">
              <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto animate-bounce">
                <CheckCircle2 className="w-12 h-12" />
              </div>
              <h3 className="font-display font-black text-xl text-[#1F2937]">تم التحديث بنجاح!</h3>
              <p className="text-sm text-[#6B7280]">تم تحديث كلمة المرور بنجاح، يمكنك تسجيل الدخول الآن.</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 rounded-2xl bg-[#C97A57]/10 text-[#C97A57] flex items-center justify-center mx-auto mb-6">
                <Lock className="w-8 h-8" />
              </div>

              <h3 className="font-display font-black text-xl text-[#1F2937] mb-2">تعيين كلمة مرور جديدة</h3>
              <p className="text-sm text-[#6B7280] mb-8 leading-relaxed">
                تم التأكد من هويتك بنجاح عبر واتساب. يرجى إدخال كلمة المرور الجديدة لحسابك.
              </p>

              <form onSubmit={handleUpdatePassword} className="space-y-4 text-right">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">كلمة المرور الجديدة</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-3 px-4 rounded-xl bg-[#F6F4ED] border border-[#E6E1D3] focus:outline-none focus:border-[#254D3F] text-center ltr font-mono"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">تأكيد كلمة المرور</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full py-3 px-4 rounded-xl bg-[#F6F4ED] border border-[#E6E1D3] focus:outline-none focus:border-[#254D3F] text-center ltr font-mono"
                    required
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 text-red-700 text-xs font-bold">
                    <AlertCircle className="w-4 h-4" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-4 rounded-2xl bg-[#254D3F] text-white font-bold shadow-lg hover:bg-[#1A372D] transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'تحديث كلمة المرور والدخول'}
                </button>
              </form>
            </>
          )}
        </div>

        <div className="p-4 bg-gray-50 border-t border-[#E6E1D3] flex items-center justify-center gap-2 text-[10px] text-gray-400">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>تشفير كامل للبيانات عبر بروتوكول SSL آمن</span>
        </div>
      </div>
    </div>
  );
};
