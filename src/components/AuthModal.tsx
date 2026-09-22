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
  Smartphone,
  MapPin,
  Store,
  ShoppingBag,
  Loader2
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
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [governorate, setGovernorate] = useState('القاهرة');
  const [workshopName, setWorkshopName] = useState('');

  if (!isOpen) return null;

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    if (mode === 'login') {
      if (!phone || !password) {
        setErrorMessage('يرجى إدخال رقم الموبايل وكلمة المرور.');
        setIsLoading(false);
        return;
      }

      const { user, error } = await signInWithEmail(phone, password);
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
      // Register Mode
      if (!name || !phone || !password) {
        setErrorMessage('يرجى ملء الحقول الإلزامية: الاسم، رقم الموبايل، وكلمة المرور.');
        setIsLoading(false);
        return;
      }

      if (role === 'artisan' && !workshopName) {
        setErrorMessage('يرجى إدخال اسم الورشة أو المشروع.');
        setIsLoading(false);
        return;
      }

      const rawPhone = phone.replace(/\D/g, '');
      if (!/^\d{10,11}$/.test(rawPhone)) {
        setErrorMessage('يرجى إدخال رقم موبايل صحيح (واتساب).');
        setIsLoading(false);
        return;
      }

      // Final technical email for Auth system
      const finalEmail = email.trim() || `${rawPhone}@yadaway.local`;

      const { user, error } = await signUpWithEmail({
        email: finalEmail,
        password,
        name,
        phone: rawPhone.startsWith('0') ? `+20${rawPhone.substring(1)}` : `+20${rawPhone}`,
        governorate,
        role,
        workshopName: role === 'artisan' ? workshopName : undefined
      });

      setIsLoading(false);
      if (error) {
        setErrorMessage(error);
      } else if (user) {
        setSuccessMessage('تم إنشاء الحساب بنجاح! كود التفعيل يصلك الآن على واتساب...');
        setTimeout(() => {
          onLoginSuccess(user);
          onClose();
        }, 1500);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn" dir="rtl">
      <div className="relative w-full max-w-md bg-white rounded-[2rem] border border-[#E6E1D3] shadow-2xl overflow-hidden max-h-[95vh] flex flex-col transition-all">

        {/* Modern Header */}
        <div className="bg-gradient-to-l from-[#254D3F] to-[#1a372d] text-white p-6 pb-8 relative overflow-hidden shrink-0">
          {/* Subtle Background Pattern */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#C97A57]/10 rounded-full -ml-12 -mb-12 blur-xl pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center shadow-inner">
                <YadawyEmblem size={32} isDark={true} />
              </div>
              <div className="text-right">
                <h2 className="font-display font-black text-xl text-white tracking-tight">
                  {mode === 'login' ? 'مرحباً بعودتك' : 'انضم إلى يَدَوِي'}
                </h2>
                <p className="text-[11px] text-[#A3B8B0] font-medium">
                  {mode === 'login' ? 'ادخل بياناتك لمتابعة أعمالك' : 'ابدأ رحلتك في سوق الحرف المصرية'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer group"
              aria-label="إغلاق"
            >
              <X className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>

        {/* Tab Switcher - Rounded Pill Style */}
        <div className="px-6 -mt-5 relative z-20 shrink-0">
          <div className="bg-white p-1.5 rounded-2xl shadow-lg border border-[#E6E1D3] flex items-center">
            <button
              onClick={() => { setMode('login'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${
                mode === 'login' ? 'bg-[#254D3F] text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              تسجيل الدخول
            </button>
            <button
              onClick={() => { setMode('register'); setErrorMessage(''); setSuccessMessage(''); }}
              className={`flex-1 py-3 text-sm font-black rounded-xl transition-all ${
                mode === 'register' ? 'bg-[#254D3F] text-white shadow-md' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50'
              }`}
            >
              حساب جديد
            </button>
          </div>
        </div>

        {/* Form Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">

          {/* Alerts */}
          {successMessage && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs font-bold leading-relaxed animate-slideDown">
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{successMessage}</span>
            </div>
          )}

          {errorMessage && (
            <div className="flex items-start gap-3 p-4 rounded-2xl bg-red-50 border border-red-100 text-red-700 text-xs font-bold leading-relaxed animate-slideDown">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            {/* 1. Common Field: Phone Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-black text-gray-700 mr-1 flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-[#254D3F]" />
                <span>رقم الموبايل (واتساب) *</span>
              </label>
              <div className="relative group">
                <input
                  type="tel"
                  placeholder="01xxxxxxxxx"
                  value={phone}
                  onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, '');
                    setPhone(val.slice(0, 11));
                  }}
                  className="w-full py-4 px-5 rounded-2xl bg-[#F6F4ED] border-2 border-transparent focus:border-[#254D3F] focus:bg-white transition-all text-sm font-mono tracking-wider outline-none"
                  required
                />
              </div>
            </div>

            {mode === 'register' && (
              <div className="space-y-4 animate-fadeIn">

                {/* Account Type Selection */}
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('customer')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                      role === 'customer'
                        ? 'border-[#254D3F] bg-[#254D3F]/5 text-[#254D3F]'
                        : 'border-[#E6E1D3] text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <ShoppingBag className="w-5 h-5" />
                    <span className="text-[10px] font-black">متسوق</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('artisan')}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all ${
                      role === 'artisan'
                        ? 'border-[#C97A57] bg-[#C97A57]/5 text-[#C97A57]'
                        : 'border-[#E6E1D3] text-gray-400 hover:border-gray-300'
                    }`}
                  >
                    <Store className="w-5 h-5" />
                    <span className="text-[10px] font-black">حرفي / صانع</span>
                  </button>
                </div>

                {/* Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-700 mr-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#254D3F]" />
                    <span>الاسم بالكامل *</span>
                  </label>
                  <input
                    type="text"
                    placeholder="محمد علي"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full py-4 px-5 rounded-2xl bg-[#F6F4ED] border-2 border-transparent focus:border-[#254D3F] focus:bg-white transition-all text-sm outline-none"
                    required
                  />
                </div>

                {/* Workshop Name for Artisan */}
                {role === 'artisan' && (
                  <div className="space-y-1.5 animate-slideDown">
                    <label className="text-xs font-black text-gray-700 mr-1 flex items-center gap-1.5">
                      <Store className="w-3.5 h-3.5 text-[#C97A57]" />
                      <span>اسم الورشة أو المعرض *</span>
                    </label>
                    <input
                      type="text"
                      placeholder="ورشة الفنون الأصيلة"
                      value={workshopName}
                      onChange={(e) => setWorkshopName(e.target.value)}
                      className="w-full py-4 px-5 rounded-2xl bg-[#F6F4ED] border-2 border-transparent focus:border-[#C97A57] focus:bg-white transition-all text-sm outline-none"
                      required
                    />
                  </div>
                )}

                {/* Governorate */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-700 mr-1 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#254D3F]" />
                    <span>المحافظة *</span>
                  </label>
                  <select
                    value={governorate}
                    onChange={(e) => setGovernorate(e.target.value)}
                    className="w-full py-4 px-5 rounded-2xl bg-[#F6F4ED] border-2 border-transparent focus:border-[#254D3F] focus:bg-white transition-all text-sm outline-none appearance-none"
                  >
                    {GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>

                {/* Email (Optional) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-gray-700 mr-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>البريد الإلكتروني (اختياري)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full py-4 px-5 rounded-2xl bg-[#F6F4ED] border-2 border-transparent focus:border-[#254D3F] focus:bg-white transition-all text-sm outline-none text-left"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between mr-1">
                <label className="text-xs font-black text-gray-700 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#254D3F]" />
                  <span>كلمة المرور *</span>
                </label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => { onClose(); window.dispatchEvent(new CustomEvent('navigate-to-reset')); }}
                    className="text-[10px] font-black text-[#C97A57] hover:underline"
                  >
                    نسيت كلمة السر؟
                  </button>
                )}
              </div>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-4 px-5 rounded-2xl bg-[#F6F4ED] border-2 border-transparent focus:border-[#254D3F] focus:bg-white transition-all text-sm outline-none text-left"
                dir="ltr"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-4 rounded-[1.25rem] bg-[#254D3F] hover:bg-[#1a372d] text-white font-black text-sm transition-all shadow-xl shadow-[#254D3F]/20 flex items-center justify-center gap-3 disabled:opacity-70 active:scale-95 cursor-pointer"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <span>{mode === 'login' ? 'دخول إلى حسابي' : 'إنشاء حسابي الآن'}</span>
                  <ArrowRight className="w-4 h-4 rotate-180" />
                </>
              )}
            </button>
          </form>

          {/* Alternative Auth */}
          <div className="space-y-4 pt-2">
            <div className="flex items-center gap-4 text-gray-300">
              <div className="flex-1 h-px bg-gray-100" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">أو يمكنك المتابعة عبر</span>
              <div className="flex-1 h-px bg-gray-100" />
            </div>

            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl bg-white hover:bg-gray-50 border-2 border-gray-100 text-gray-700 text-xs font-black transition-all active:scale-98 cursor-pointer"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>دخول سريع بـ Google</span>
            </button>
          </div>
        </div>

        {/* Security Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-center gap-2 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 text-[#254D3F]" />
          <span className="text-[10px] text-gray-400 font-bold">تشفير كامل للبيانات وحماية عبر Supabase Auth</span>
        </div>
      </div>
    </div>
  );
};

// Simple ArrowRight icon for the button
const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14M12 5l7 7-7 7"/>
  </svg>
);
