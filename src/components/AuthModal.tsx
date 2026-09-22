import React, { useState } from 'react';
import {
  X,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Mail,
  Lock,
  User,
  Phone,
  MapPin,
  Store,
  ShoppingBag
} from 'lucide-react';
import { UserProfile, UserRole, DEFAULT_USER_AVATAR } from '../types';
import { YadawyEmblem } from './YadawyLogo';
import { signInWithGoogle, signInWithEmail, signUpWithEmail } from '../services/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
  initialRole?: UserRole;
}

const GOVERNORATES = [
  'القاهرة', 'الجيزة', 'الإسكندرية', 'الفيوم', 'القليوبية',
  'الشرقية', 'المنوفية', 'الدقهلية', 'الغربية', 'البحيرة',
  'دمياط', 'بورسعيد', 'الإسماعيلية', 'السويس', 'كفر الشيخ',
  'المنيا', 'أسيوط', 'سوهاج', 'قنا', 'الأقصر', 'أسوان',
  'البحر الأحمر', 'الوادي الجديد', 'مطروح', 'شمال سيناء', 'جنوب سيناء'
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'login',
  initialRole = 'customer'
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode === 'register' ? 'register' : 'login');
  const [role, setRole] = useState<UserRole>(initialRole);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Form Fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [workshopName, setWorkshopName] = useState('');

  if (!isOpen) return null;

  // ── Forgot Password Logic ───────────────────────────────────────────────
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMessage('يرجى إدخال البريد الإلكتروني أولاً.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const { error } = await resetPassword(email);
    setIsLoading(false);

    if (error) {
      setErrorMessage(error);
    } else {
      setSuccessMessage('تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني بنجاح!');
    }
  };

  // ── Google OAuth ──────────────────────────────────────────────────────────
  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    const { error } = await signInWithGoogle();
    setIsLoading(false);

    if (error) {
      setErrorMessage(error);
    } else {
      setSuccessMessage('جارٍ تحويلك لتسجيل الدخول بـ Google...');
    }
  };

  // ── Email/Password Auth ───────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (!email || !password) {
      setErrorMessage('يرجى ملء جميع الحقول الإلزامية.');
      setIsLoading(false);
      return;
    }

    if (mode === 'login') {
      const { user, error } = await signInWithEmail(email, password);
      setIsLoading(false);
      if (error) {
        setErrorMessage(error);
      } else if (user) {
        setSuccessMessage('تم تسجيل الدخول بنجاح!');
        setTimeout(() => {
          onLoginSuccess(user);
          onClose();
        }, 1000);
      }
    } else {
      if (!name) {
        setErrorMessage('يرجى إدخال الاسم بالكامل.');
        setIsLoading(false);
        return;
      }
      if (role === 'artisan' && !workshopName) {
        setErrorMessage('يرجى إدخال اسم الورشة أو المعرض.');
        setIsLoading(false);
        return;
      }

      if (phone && !/^\d{10,11}$/.test(phone)) {
        setErrorMessage('يرجى إدخال رقم هاتف صحيح');
        setIsLoading(false);
        return;
      }

      const { user, error, needsEmailConfirmation } = await signUpWithEmail({
        email,
        password,
        name,
        phone: phone ? (phone.startsWith('0') ? `+20${phone.substring(1)}` : `+20${phone}`) : undefined,
        governorate,
        role,
        workshopName: role === 'artisan' ? workshopName : undefined
      });

      setIsLoading(false);
      if (error) {
        setErrorMessage(error);
      } else if (user) {
        setSuccessMessage('تم إنشاء الحساب بنجاح! جارٍ تحويلك لتأكيد الواتساب...');
        setTimeout(() => {
          onLoginSuccess(user);
          onClose();
        }, 1500);
      }
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn text-right"
      dir="rtl"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-[#F6F4ED] rounded-3xl border border-[#E6E1D3] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#254D3F] text-white p-5 px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <YadawyEmblem size={36} isDark={true} />
            <div>
              <h2 className="font-display font-bold text-lg text-white leading-tight">
                {mode === 'login' ? 'تسجيل الدخول' : mode === 'register' ? 'إنشاء حساب جديد' : 'استعادة كلمة المرور'}
              </h2>
              <p className="text-[11px] text-[#A3B8B0]">
                سوق الحرف والفنون المصرية الأصيلة
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs for Login / Register */}
        <div className={`flex border-b border-[#E6E1D3] shrink-0 ${mode === 'forgot' ? 'hidden' : ''}`}>
          <button
            className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${
              mode === 'login'
                ? 'border-[#254D3F] text-[#254D3F] bg-[#254D3F]/5'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setMode('login');
              setErrorMessage('');
              setSuccessMessage('');
            }}
          >
            تسجيل الدخول
          </button>
          <button
            className={`flex-1 py-3 text-sm font-bold transition-all border-b-2 ${
              mode === 'register'
                ? 'border-[#254D3F] text-[#254D3F] bg-[#254D3F]/5'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => {
              setMode('register');
              setErrorMessage('');
              setSuccessMessage('');
            }}
          >
            إنشاء حساب
          </button>
        </div>

        {/* Body Container (Scrollable if content overflows on small mobile screens) */}
        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Success Message */}
          {successMessage && (
            <div className="flex items-start gap-2 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs leading-relaxed">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* Error Message */}
          {errorMessage && (
            <div className="flex items-center gap-2 p-3 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'register' && (
              <>
                {/* Role Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-700 block">نوع الحساب</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('customer')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        role === 'customer'
                          ? 'border-[#254D3F] bg-[#254D3F]/10 text-[#254D3F]'
                          : 'border-[#E6E1D3] bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>متسوق / مشتري</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setRole('artisan')}
                      className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        role === 'artisan'
                          ? 'border-[#C97A57] bg-[#C97A57]/10 text-[#C97A57]'
                          : 'border-[#E6E1D3] bg-white text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>حرفي / صاحب ورشة</span>
                    </button>
                  </div>
                </div>

                {/* Name Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">الاسم بالكامل</label>
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      placeholder="محمد أحمد"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs py-2.5 pr-9 pl-3 rounded-xl bg-white border border-[#E6E1D3] focus:outline-none focus:border-[#254D3F] transition-colors"
                      required
                    />
                  </div>
                </div>

                {/* Workshop Name (Only for artisan) */}
                {role === 'artisan' && (
                  <div className="space-y-1 animate-slideDown">
                    <label className="text-xs font-bold text-gray-700 block">اسم الورشة / المشروع الحرفي</label>
                    <div className="relative">
                      <Store className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="ورشة الفخار الأصيل"
                        value={workshopName}
                        onChange={(e) => setWorkshopName(e.target.value)}
                        className="w-full text-xs py-2.5 pr-9 pl-3 rounded-xl bg-white border border-[#E6E1D3] focus:outline-none focus:border-[#C97A57] transition-colors"
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Phone Field */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">رقم الهاتف (اختياري)</label>
                  <div className="relative">
                    <Phone className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="tel"
                      placeholder="01xxxxxxxxx"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full text-xs py-2.5 pr-9 pl-3 rounded-xl bg-white border border-[#E6E1D3] focus:outline-none focus:border-[#254D3F] transition-colors"
                    />
                  </div>
                </div>

                {/* Governorate Selector */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700 block">المحافظة</label>
                  <div className="relative">
                    <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <select
                      value={governorate}
                      onChange={(e) => setGovernorate(e.target.value)}
                      className="w-full text-xs py-2.5 pr-9 pl-3 rounded-xl bg-white border border-[#E6E1D3] focus:outline-none focus:border-[#254D3F] transition-colors appearance-none"
                    >
                      {GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* Email Field */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-gray-700 block">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs py-2.5 pr-9 pl-3 rounded-xl bg-white border border-[#E6E1D3] focus:outline-none focus:border-[#254D3F] transition-colors text-left"
                  dir="ltr"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            {mode !== 'forgot' && (
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 block">كلمة المرور</label>
                  {mode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[10px] font-bold text-[#C97A57] hover:underline"
                    >
                      نسيت كلمة السر؟
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs py-2.5 pr-9 pl-3 rounded-xl bg-white border border-[#E6E1D3] focus:outline-none focus:border-[#254D3F] transition-colors text-left"
                    dir="ltr"
                    required
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              onClick={mode === 'forgot' ? handleForgotPassword : undefined}
              className="w-full py-3 px-4 mt-2 rounded-xl bg-[#254D3F] hover:bg-[#1b382e] text-white text-xs font-bold transition-all shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span>
                  {mode === 'login' ? 'تسجيل الدخول' : mode === 'register' ? 'تأكيد إنشاء الحساب' : 'استعادة عبر واتساب'}
                </span>
              )}
            </button>

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  // Dispatch event to open reset password view
                  window.dispatchEvent(new CustomEvent('navigate-to-reset'));
                }}
                className="w-full text-center text-[10px] font-bold text-[#C97A57] hover:underline mt-2"
              >
                استعادة كلمة المرور عبر واتساب 💬
              </button>
            )}

            {mode === 'login' && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  window.dispatchEvent(new CustomEvent('navigate-to-reset'));
                }}
                className="w-full text-center text-[10px] font-bold text-[#C97A57] hover:underline mt-2"
              >
                استعادة كلمة المرور عبر واتساب 💬
              </button>
            )}

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs font-bold text-[#254D3F] hover:underline"
              >
                العودة لتسجيل الدخول
              </button>
            )}
          </form>

          {/* Divider */}
          <div className="relative flex items-center justify-center pt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#E6E1D3]" />
            </div>
            <span className="relative bg-[#F6F4ED] px-3 text-[11px] text-[#9CA3AF]">
              أو يمكنك المتابعة عبر
            </span>
          </div>

          {/* Google Sign In Button */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white hover:bg-[#F9F8F5] border border-[#254D3F]/20 hover:border-[#254D3F] text-[#1F2937] text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
            <span>الدخول بحساب Google</span>
          </button>

          {/* Security Note */}
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#9CA3AF] pt-2 border-t border-[#E6E1D3]/50">
            <ShieldCheck className="w-3.5 h-3.5 text-[#254D3F]" />
            <span>تسجيل آمن ومشفر بالكامل عبر Supabase Auth</span>
          </div>
        </div>
      </div>
    </div>
  );
};
