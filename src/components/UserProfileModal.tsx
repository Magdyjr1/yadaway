import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Store, 
  LogOut, 
  CheckCircle,
  Package,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { UserProfile, Order, DEFAULT_USER_AVATAR } from '../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  orders: Order[];
  onUpdateUser: (updatedUser: UserProfile) => void;
  onLogout: () => void;
  onNavigateToDashboard: () => void;
  onNavigateToOrders: () => void;
  onTrackOrder?: (orderNumber: string) => void;
  initialTab?: 'profile' | 'upgrade';
}

const EGYPT_GOVERNORATES = [
  'القاهرة',
  'الجيزة',
  'الإسكندرية',
  'الفيوم (قرية تونس)',
  'مطروح (سيوة)',
  'القليوبية',
  'الشرقية',
  'الدقهلية',
  'البحيرة',
  'المنوفية',
  'الغربية',
  'كفر الشيخ',
  'دمياط',
  'بورسعيد',
  'الإسماعيلية',
  'السويس',
  'بني سويف',
  'المنيا',
  'أسيوط',
  'سوهاج (أخميم)',
  'قنا',
  'الأقصر',
  'أسوان',
  'البحر الأحمر',
  'الوادي الجديد',
  'شمال سيناء',
  'جنوب سيناء'
];

const CRAFT_TYPES = [
  'فخار وخزف يدوي (قرية تونس والفسطاط)',
  'جلود طبيعية مدبوغة نباتياً',
  'كروشيه وتطريز سيوي قطن مصري',
  'أرابيسك وتطعيم صدف بحري',
  'نحاس أحمر وأصفر مطروق يدوياً',
  'كليم وسجاد نول يدوي أخميمي',
  'شموع طبيعية وعطور تراثية',
  'فنون أخرى'
];

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  orders,
  onUpdateUser,
  onLogout,
  onNavigateToDashboard,
  onNavigateToOrders,
  onTrackOrder,
  initialTab = 'profile'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [phone, setPhone] = useState(user.phone || '');
  const [governorate, setGovernorate] = useState(user.governorate || 'القاهرة');
  const [address, setAddress] = useState(user.address || '');
  const [workshopName, setWorkshopName] = useState(user.workshopName || '');
  const [bio, setBio] = useState(user.bio || '');

  // Upgrade to Artisan state
  const [isUpgrading, setIsUpgrading] = useState(initialTab === 'upgrade');
  const [upgradeWorkshopName, setUpgradeWorkshopName] = useState(user.workshopName || `ورشة ${user.name}`);
  const [upgradeCraftType, setUpgradeCraftType] = useState(user.craftType || CRAFT_TYPES[0]);
  const [upgradeWhatsapp, setUpgradeWhatsapp] = useState(user.phone || user.whatsapp || '01012345678');
  const [upgradeGovernorate, setUpgradeGovernorate] = useState(user.governorate || 'الفيوم (قرية تونس)');
  const [upgradeBio, setUpgradeBio] = useState(user.bio || 'صانع وحرفي مهتم بإحياء التراث اليدوي المصري الأصيل');
  const [upgradeError, setUpgradeError] = useState('');
  const [upgradeSuccess, setUpgradeSuccess] = useState(false);
  const [isSubmittingUpgrade, setIsSubmittingUpgrade] = useState(false);

  if (!isOpen) return null;

  // Filter orders made by this user or general
  const userOrders = orders.filter(
    (o) => o.customerName === user.name || o.customerPhone === user.phone
  );

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      phone,
      governorate,
      address,
      workshopName: user.role === 'artisan' ? workshopName : undefined,
      bio: user.role === 'artisan' ? bio : undefined
    });
    setIsEditing(false);
  };

  const handleConfirmUpgrade = (e: React.FormEvent) => {
    e.preventDefault();
    setUpgradeError('');

    if (!upgradeWorkshopName.trim()) {
      setUpgradeError('يرجى إدخال اسم الورشة أو البراند الحرفي');
      return;
    }
    if (!upgradeWhatsapp.trim()) {
      setUpgradeError('يرجى إدخال رقم الواتساب الخاص بالورشة للتواصل مع الزبائن');
      return;
    }

    setIsSubmittingUpgrade(true);

    setTimeout(() => {
      setIsSubmittingUpgrade(false);
      const upgradedUser: UserProfile = {
        ...user,
        role: 'artisan',
        workshopName: upgradeWorkshopName.trim(),
        craftType: upgradeCraftType,
        whatsapp: upgradeWhatsapp.trim(),
        phone: upgradeWhatsapp.trim(),
        governorate: upgradeGovernorate,
        bio: upgradeBio.trim(),
        isVerified: true
      };

      onUpdateUser(upgradedUser);
      setUpgradeSuccess(true);
      setIsUpgrading(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn text-right">
      <div 
        className="relative w-full max-w-lg bg-[#F6F4ED] rounded-3xl border border-[#E6E1D3] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#254D3F] text-white p-5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={user.avatar || DEFAULT_USER_AVATAR}
                alt={user.name}
                className="w-12 h-12 rounded-2xl object-cover border-2 border-white/40 shadow-xs"
                referrerPolicy="no-referrer"
              />
              <span className={`absolute -bottom-1 -left-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                user.role === 'artisan' ? 'bg-[#C97A57]' : 'bg-emerald-500'
              }`}>
                <CheckCircle className="w-2.5 h-2.5 text-white" />
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base text-white">{user.name}</h3>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  user.role === 'artisan'
                    ? 'bg-[#C97A57] text-white'
                    : 'bg-emerald-600 text-white'
                }`}>
                  {user.role === 'artisan' ? 'صانع / صاحب ورشة' : 'حساب مستخدم'}
                </span>
              </div>
              <p className="text-xs text-[#A3B8B0] flex items-center gap-1.5 mt-0.5">
                <span>{user.email}</span>
                {user.provider === 'google' && (
                  <span className="text-[10px] bg-white/10 px-1.5 py-0.2 rounded text-white">Google</span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* Upgrade Celebration Banner */}
          {upgradeSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 animate-fadeIn space-y-3">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-emerald-950 mb-1">
                    🎉 مبارك! تم ترقية حسابك بنجاح إلى صانع وبائع معتمد!
                  </h4>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    تم فتح بوابة الحرفي لك رسمياً. يمكنك الآن الدخول إلى لوحة إدارة الورشة، إضافة مشغولاتك اليدوية وتحديد أسعارها، واستقبال طلبات الزبائن مباشرة.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onNavigateToDashboard();
                }}
                className="w-full py-2.5 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Store className="w-4 h-4 text-[#C97A57]" />
                <span>الدخول إلى بوابة الحِرفي (لوحة الصانع) الآن</span>
              </button>
            </div>
          )}

          {/* Quick Action Banner for Existing Artisan */}
          {user.role === 'artisan' && !upgradeSuccess && (
            <div className="p-4 rounded-2xl bg-[#F7ECE6] border border-[#C97A57]/30 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#C97A57] block mb-0.5">
                  ورشة: {user.workshopName || 'أتيليه الفنون اليدوية'}
                </span>
                <p className="text-[11px] text-[#4B5563]">
                  {user.craftType || 'فخار وخزف يدوي'} • {user.governorate}
                </p>
              </div>
              <button
                onClick={() => {
                  onClose();
                  onNavigateToDashboard();
                }}
                className="px-3 py-1.5 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Store className="w-3.5 h-3.5" />
                <span>لوحة الورشة</span>
              </button>
            </div>
          )}

          {/* Upgrade to Artisan Box (Available for Standard Users) */}
          {user.role === 'customer' && !isUpgrading && !upgradeSuccess && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-[#254D3F]/10 via-[#C97A57]/10 to-[#F7ECE6] border border-[#C97A57]/40 shadow-xs text-right">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#C97A57] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-bold text-[#1F2937]">هل تصنع مشغولات أو حرفاً يدوية؟</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#C97A57] text-white font-bold">ترقية فورية</span>
                  </div>
                  <p className="text-[11px] text-[#4B5563] leading-relaxed mb-3">
                    رقّ حسابك الآن إلى صانع وبائع في منصة يَدَوِي مجاناً، وافتح ورشتك لعرض وبيع إبداعاتك وإدارة طلبياتك في لوحة خاصة بالحرفيين.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsUpgrading(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C97A57] hover:bg-[#b56846] text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>ترقية حسابي إلى صانع / بائع</span>
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Upgrade Form */}
          {user.role === 'customer' && isUpgrading && (
            <form onSubmit={handleConfirmUpgrade} className="bg-white rounded-2xl p-5 border border-[#C97A57]/40 space-y-3.5 shadow-xs animate-fadeIn">
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D3]">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-[#C97A57]" />
                  <h4 className="text-xs font-bold text-[#1F2937]">ترقية الحساب إلى صانع وحرفي</h4>
                </div>
                <button
                  type="button"
                  onClick={() => setIsUpgrading(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

              {upgradeError && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{upgradeError}</span>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] mb-1">
                  اسم الورشة أو العلامة التجارية الحرفية *
                </label>
                <input
                  type="text"
                  value={upgradeWorkshopName}
                  onChange={(e) => setUpgradeWorkshopName(e.target.value)}
                  placeholder="مثال: ورشة الفخار الأصيل / إبداعات الكروشيه"
                  className="w-full px-3 py-2 rounded-xl bg-[#F6F4ED] border border-[#E6E1D3] text-xs text-[#1F2937] focus:outline-none focus:border-[#C97A57]"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] mb-1">
                  التخصص الحِرفي الأساسي *
                </label>
                <select
                  value={upgradeCraftType}
                  onChange={(e) => setUpgradeCraftType(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-[#F6F4ED] border border-[#E6E1D3] text-xs text-[#1F2937] focus:outline-none focus:border-[#C97A57]"
                >
                  {CRAFT_TYPES.map((craft) => (
                    <option key={craft} value={craft}>{craft}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#4B5563] mb-1">
                    رقم هاتف الورشة (خاص بالتنسيق مع المنصة وشركة الشحن فقط) *
                  </label>
                  <input
                    type="tel"
                    value={upgradeWhatsapp}
                    onChange={(e) => setUpgradeWhatsapp(e.target.value)}
                    placeholder="01012345678"
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4ED] border border-[#E6E1D3] text-xs text-right focus:outline-none focus:border-[#C97A57]"
                    required
                  />
                  <p className="text-[10px] text-[#6B7280] mt-1">
                    * لا يتم مشاركة رقمك مع المشترين، فالمنصة وشركة الشحن تتوليان كل التواصل والتسليم.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-[#4B5563] mb-1">
                    محافظة الورشة ومكان التصنيع *
                  </label>
                  <select
                    value={upgradeGovernorate}
                    onChange={(e) => setUpgradeGovernorate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4ED] border border-[#E6E1D3] text-xs text-[#1F2937] focus:outline-none focus:border-[#C97A57]"
                  >
                    {EGYPT_GOVERNORATES.map((gov) => (
                      <option key={gov} value={gov}>{gov}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#4B5563] mb-1">
                  نبذة عن الورشة وتاريخ الحرفة اليدوية
                </label>
                <textarea
                  value={upgradeBio}
                  onChange={(e) => setUpgradeBio(e.target.value)}
                  rows={2}
                  placeholder="اكتب نبذة مختصرة عن خبرتك والمواد الطبيعية التي تستخدمها..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F6F4ED] border border-[#E6E1D3] text-xs text-[#1F2937] focus:outline-none focus:border-[#C97A57]"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmittingUpgrade}
                className="w-full py-2.5 rounded-xl bg-[#C97A57] hover:bg-[#b56846] text-white text-xs font-bold shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {isSubmittingUpgrade ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    <span>تأكيد ترقية الحساب وفتح بوابة الصانع</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Details / Edit Form */}
          {!isEditing ? (
            <div className="bg-white rounded-2xl p-4 border border-[#E6E1D3] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D3]">
                <h4 className="text-xs font-bold text-[#1F2937]">البيانات الشخصية</h4>
                <button
                  onClick={() => setIsEditing(true)}
                  className="text-xs font-bold text-[#254D3F] hover:underline cursor-pointer"
                >
                  تعديل البيانات
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-3.5 h-3.5 text-[#C97A57]" />
                  <span className="font-semibold text-gray-500">هاتف استلام الشحن:</span>
                  <span dir="ltr">{user.phone || 'غير مسجل'}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="w-3.5 h-3.5 text-[#C97A57]" />
                  <span className="font-semibold text-gray-500">المحافظة:</span>
                  <span>{user.governorate || 'القاهرة'}</span>
                </div>
                {user.address && (
                  <div className="flex items-center gap-2 text-gray-700 sm:col-span-2">
                    <MapPin className="w-3.5 h-3.5 text-[#C97A57]" />
                    <span className="font-semibold text-gray-500">العنوان:</span>
                    <span>{user.address}</span>
                  </div>
                )}
                {user.role === 'artisan' && user.bio && (
                  <div className="sm:col-span-2 p-2.5 rounded-xl bg-[#F6F4ED] text-[11px] text-gray-700">
                    <span className="font-bold block mb-1">نبذة عن الورشة:</span>
                    {user.bio}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} className="bg-white rounded-2xl p-4 border border-[#E6E1D3] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#E6E1D3]">
                <h4 className="text-xs font-bold text-[#1F2937]">تعديل البيانات</h4>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="text-xs text-gray-500 hover:text-gray-700 cursor-pointer"
                >
                  إلغاء
                </button>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">رقم الموبايل</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs text-right"
                  dir="ltr"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">المحافظة</label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs"
                >
                  {EGYPT_GOVERNORATES.map((gov) => (
                    <option key={gov} value={gov}>{gov}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 mb-1">العنوان بالتفصيل</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="الشارع، رقم العمارة، الحي..."
                  className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs"
                />
              </div>

              {user.role === 'artisan' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">اسم الورشة</label>
                    <input
                      type="text"
                      value={workshopName}
                      onChange={(e) => setWorkshopName(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 mb-1">نبذة عن الورشة</label>
                    <textarea
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      rows={2}
                      className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs"
                    />
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs font-bold shadow-xs cursor-pointer"
              >
                حفظ التغييرات
              </button>
            </form>
          )}

          {/* Recent Orders Section */}
          <div className="bg-white rounded-2xl p-4 border border-[#E6E1D3]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-[#254D3F]" />
                <h4 className="text-xs font-bold text-[#1F2937]">
                  {user.role === 'artisan' ? 'آخر طلبات الورشة' : 'طلباتي السابقة'}
                </h4>
              </div>
              <span className="text-[11px] text-gray-500 font-semibold">
                ({orders.length} طلب)
              </span>
            </div>

            <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
              {orders.slice(0, 3).map((ord) => (
                <div 
                  key={ord.id}
                  className="p-2.5 rounded-xl bg-[#F6F4ED] border border-[#E6E1D3] flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-[#1F2937] font-mono">{ord.orderNumber}</div>
                    <div className="text-[10px] text-gray-500">
                      {ord.customerName} • {ord.governorate}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-left">
                      <div className="font-bold text-[#254D3F]">{ord.totalAmount} ج.م</div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold block">
                        {ord.status === 'new' ? 'جديد' : ord.status === 'processing' ? 'قيد التنفيذ' : ord.status === 'shipped' ? 'بالشحن' : 'مكتمل'}
                      </span>
                    </div>
                    {onTrackOrder && (
                      <button
                        type="button"
                        onClick={() => {
                          onClose();
                          onTrackOrder(ord.orderNumber);
                        }}
                        className="px-2 py-1 rounded-lg bg-[#254D3F] text-white text-[10px] font-bold hover:bg-[#1A372D] transition-colors cursor-pointer"
                      >
                        تتبع
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={() => {
              onLogout();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>تسجيل الخروج من الحساب</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#6B7280]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#254D3F]" />
            <span>بيانات حسابك مؤمنة بالكامل في يَدَوِي</span>
          </div>

        </div>

      </div>
    </div>
  );
};
