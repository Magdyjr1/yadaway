import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { 
  ShoppingBag, 
  Heart, 
  Menu, 
  X, 
  Store, 
  Sparkles,
  User,
  LogOut,
  LayoutGrid,
  Truck,
  Headphones,
  Search,
  Flame
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, UserProfile, Category, DEFAULT_USER_AVATAR, Product, Artisan, ShowcaseItem, VendorPortfolio } from '../types';
import { YadawyLogo } from './YadawyLogo';
import { SmartSearchModal } from './SmartSearchModal';

export type AppView = 'home' | 'product' | 'dashboard' | 'checkout' | 'favorites' | 'catalog' | 'storefront' | 'tracking' | 'support' | 'bazaar' | 'vendor-showcase' | 'legal' | 'reset-password';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  cartItems: CartItem[];
  favoritesCount: number;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onOpenCart: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onOpenProfile: () => void;
  onLogout: () => void;
  categories?: Category[];
  selectedCategory?: string;
  onSelectCategory?: (categoryId: string) => void;
  products?: Product[];
  showcaseItems?: ShowcaseItem[];
  vendorPortfolios?: VendorPortfolio[];
  artisans?: Artisan[];
  onSelectProduct?: (product: Product) => void;
  onSelectArtisan?: (artisanId: string) => void;
  onViewShowcase?: (artisanId: string) => void;
  onSelectShowcaseItem?: (item: ShowcaseItem) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  cartItems,
  favoritesCount,
  searchQuery = '',
  onSearchChange,
  onOpenCart,
  currentUser,
  onOpenAuth,
  onOpenProfile,
  onLogout,
  categories,
  selectedCategory,
  onSelectCategory,
  products = [],
  showcaseItems = [],
  vendorPortfolios = [],
  artisans = [],
  onSelectProduct,
  onSelectArtisan,
  onViewShowcase,
  onSelectShowcaseItem,
}) => {
  const [sideDrawerOpen, setSideDrawerOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [topSearch, setTopSearch] = useState(searchQuery);
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTopSearch(searchQuery);
  }, [searchQuery]);

  // Listen for Ctrl+K or Cmd+K to open Smart Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Lock body scroll when drawer is open, and handle Escape for drawer and search
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    if (sideDrawerOpen) {
      document.body.style.overflow = 'hidden';
    }
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchOpen) setSearchOpen(false);
        if (sideDrawerOpen) setSideDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [sideDrawerOpen, searchOpen]);

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);
  const totalCartPrice = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);

  return (
    <header className="sticky top-0 z-40 bg-[#F6F4ED]/95 backdrop-blur-md border-b border-[#E6E1D3] transition-all">
      {/* Top Heritage Notice Bar (Clean banner without upgrade buttons) */}
      <div className="bg-[#254D3F] text-[#F6F4ED] text-xs py-1.5 px-4 text-center font-medium">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 mx-auto sm:mx-0">
            <Sparkles className="w-3.5 h-3.5 text-[#C97A57]" />
            <span>من أيدي حِرفيي مصر إلى بيتك مباشرة • شحن لجميع محافظات مصر والدفع عند الاستلام</span>
          </div>
          
          {/* Subtle status/auth hint */}
          <div className="hidden sm:flex items-center gap-3 text-[11px]">
            {!currentUser ? (
              <>
                <button
                  onClick={() => onOpenAuth('register')}
                  className="text-white hover:underline font-bold cursor-pointer"
                >
                  إنشاء حساب جديد
                </button>
                <span>|</span>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="text-[#C97A57] hover:underline font-bold cursor-pointer"
                >
                  تسجيل الدخول
                </button>
              </>
            ) : (
              <span className="text-[#A3B8B0]">
                أهلاً بك في يدوي، <strong className="text-white">{currentUser.name}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 gap-3 sm:gap-4">
          {/* Logo & Desktop Navigation Links */}
          <div className="flex items-center gap-4 lg:gap-6 shrink-0">
            <button 
              onClick={() => onNavigate('home')}
              className="text-right group cursor-pointer focus:outline-none shrink-0"
              aria-label="الصفحة الرئيسية - منصة يدوي"
            >
              <YadawyLogo 
                variant="horizontal" 
                size="md" 
                subtitle="سوق الحرف والفنون المصرية" 
              />
            </button>

            {/* Desktop Navigation Links (No Artisan Portal, No Upgrade Button) */}
            <div className="hidden lg:flex items-center gap-1.5">
              <button
                onClick={() => onNavigate('home')}
                className={`px-3 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                  currentView === 'home'
                    ? 'text-[#254D3F] bg-[#254D3F]/10'
                    : 'text-[#4B5563] hover:text-[#1F2937]'
                }`}
              >
                الرئيسية
              </button>

              {/* The Bazaar Public Showcase Wall - "السوق" */}
              <button
                onClick={() => onNavigate('bazaar')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer ${
                  currentView === 'bazaar'
                    ? 'text-white bg-[#C97A57] shadow-sm'
                    : 'text-[#1F2937] hover:text-[#C97A57] hover:bg-[#F6F4ED]'
                }`}
                title="معرض الفاترينات وبورتفوليو سوابق أعمال الحرفيين"
              >
                <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                <span>السوق (الفاترينات)</span>
              </button>

              {/* Dedicated Crafts Catalog Link */}
              <button
                onClick={() => onNavigate('catalog')}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${
                  currentView === 'catalog'
                    ? 'text-[#254D3F] bg-[#254D3F]/10'
                    : 'text-[#4B5563] hover:text-[#1F2937]'
                }`}
              >
                <LayoutGrid className="w-4 h-4 text-[#C97A57]" />
                <span>سوق المشغولات</span>
              </button>
            </div>
          </div>

          {/* Right Actions: Search Icon Button, Shopping Cart & Side Drawer Button */}
          <div className="flex items-center gap-2 shrink-0">
            
            {/* Search Icon Button (Click to open smart search modal) */}
            <button
              onClick={() => setSearchOpen(true)}
              className="flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-[#E6E1D3] hover:border-[#254D3F] hover:bg-[#254D3F]/5 text-[#254D3F] transition-all card-shadow cursor-pointer relative group"
              title="البحث الذكي في المشغولات والورش والفاترينات (Ctrl+K)"
              aria-label="فتح البحث الذكي"
            >
              <Search className="w-4.5 h-4.5 text-[#254D3F] group-hover:scale-110 transition-transform" />
              {searchQuery && searchQuery.trim().length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#C97A57]" />
              )}
            </button>

            {/* Shopping Cart Button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white transition-all card-shadow cursor-pointer h-10"
              aria-label="سلة الشراء"
            >
              <ShoppingBag className="w-4 h-4 text-[#F6F4ED]" />
              <span className="hidden sm:inline text-xs font-bold">السلة</span>
              {totalCartCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#C97A57] text-white text-[11px] font-bold flex items-center justify-center animate-scaleIn">
                  {totalCartCount}
                </span>
              )}
            </button>

            {/* Side Drawer Toggle (House for User Account Menu & Platform Pages) */}
            <button
              onClick={() => setSideDrawerOpen(true)}
              className="flex items-center gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-white border border-[#E6E1D3] hover:border-[#254D3F] hover:bg-[#254D3F]/5 text-xs font-bold text-[#1F2937] transition-all card-shadow cursor-pointer h-10"
              title="فتح القائمة الجانبية وحساب المستخدم"
              aria-label="فتح القائمة الجانبية"
            >
              {currentUser ? (
                <img
                  src={currentUser.avatar || DEFAULT_USER_AVATAR}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover border border-[#E6E1D3]"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <Menu className="w-4 h-4 text-[#254D3F]" />
              )}
              <span className="hidden sm:inline">القائمة الجانبية</span>
            </button>
          </div>
        </div>
      </div>

      {/* Slide-over Side Drawer (القائمة الجانبية) - Rendered via Portal */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {sideDrawerOpen && (
            <div className="fixed inset-0 z-[99999] overflow-hidden" dir="rtl">
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 bg-black/60 backdrop-blur-xs cursor-pointer"
                onClick={() => setSideDrawerOpen(false)}
              />

              {/* Drawer Panel */}
              <motion.div 
                initial={{ x: '100%' }}
                animate={{ x: 0 }}
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 28, stiffness: 280 }}
                className="fixed inset-y-0 right-0 max-w-sm sm:max-w-md w-full bg-[#F6F4ED] shadow-2xl flex flex-col h-screen h-[100dvh] text-right border-l border-[#E6E1D3] z-[100000] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* 1. Pinned Drawer Header */}
                <div className="p-4 border-b border-[#E6E1D3] flex items-center justify-between bg-white shrink-0 shadow-xs">
                  <div className="flex items-center gap-2">
                    <YadawyLogo variant="horizontal" size="sm" />
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#254D3F]/10 text-[#254D3F] font-bold">
                      القائمة الجانبية
                    </span>
                    <button
                      onClick={() => setSideDrawerOpen(false)}
                      className="w-9 h-9 rounded-xl bg-[#F6F4ED] hover:bg-[#E6E1D3] text-[#1F2937] flex items-center justify-center transition-colors cursor-pointer"
                      aria-label="إغلاق القائمة"
                      title="إغلاق القائمة (Esc)"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* 2. Scrollable Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 text-right">
                  
                  {/* USER ACCOUNT CARD & MENU (MOVED HERE AS REQUESTED) */}
                  <div className="p-4 rounded-2xl bg-white border border-[#E6E1D3] card-shadow space-y-3">
                    {currentUser ? (
                      <div>
                        {/* User Identity Header */}
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={currentUser.avatar || DEFAULT_USER_AVATAR}
                              alt={currentUser.name}
                              className="w-11 h-11 rounded-xl object-cover border border-[#E6E1D3] shadow-2xs"
                              referrerPolicy="no-referrer"
                            />
                            <div>
                              <div className="text-xs font-bold text-[#1F2937] line-clamp-1">{currentUser.name}</div>
                              <span className="text-[10px] text-[#C97A57] font-semibold block">
                                {currentUser.role === 'artisan' ? 'صانع وحرفي معتمد 🏺' : 'متسوق يدوي 🛍️'}
                              </span>
                              <span className="text-[10px] text-[#6B7280]">{currentUser.email}</span>
                            </div>
                          </div>
                          <button
                            onClick={() => {
                              setSideDrawerOpen(false);
                              onOpenProfile();
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#F6F4ED] hover:bg-[#E6E1D3] text-[#254D3F] text-xs font-bold transition-colors cursor-pointer"
                          >
                            الملف
                          </button>
                        </div>

                        {/* Account Actions & Pages */}
                        <div className="space-y-1 pt-2 border-t border-[#F0ECE1]">
                          <button
                            onClick={() => {
                              setSideDrawerOpen(false);
                              onOpenProfile();
                            }}
                            className="w-full text-right px-3 py-2 rounded-xl text-xs text-gray-700 hover:bg-[#F6F4ED] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <User className="w-3.5 h-3.5 text-[#254D3F]" />
                            <span>الملف الشخصي والبيانات</span>
                          </button>

                          {currentUser.role === 'artisan' && (
                            <button
                              onClick={() => {
                                setSideDrawerOpen(false);
                                onNavigate('dashboard');
                              }}
                              className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-[#254D3F] bg-[#254D3F]/10 hover:bg-[#254D3F]/15 flex items-center gap-2 cursor-pointer transition-colors"
                            >
                              <Store className="w-3.5 h-3.5 text-[#C97A57]" />
                              <span>لوحة ورشتي (بوابة الحِرفي)</span>
                            </button>
                          )}

                          <button
                            onClick={() => {
                              setSideDrawerOpen(false);
                              onNavigate('favorites');
                            }}
                            className="w-full text-right px-3 py-2 rounded-xl text-xs text-gray-700 hover:bg-[#F6F4ED] flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Heart className="w-3.5 h-3.5 text-[#C97A57]" />
                              <span>مشغولاتي المفضلة</span>
                            </div>
                            {favoritesCount > 0 && (
                              <span className="px-2 py-0.5 rounded-full bg-[#C97A57] text-white text-[10px] font-bold">
                                {favoritesCount}
                              </span>
                            )}
                          </button>

                          <button
                            onClick={() => {
                              setSideDrawerOpen(false);
                              onNavigate('tracking');
                            }}
                            className="w-full text-right px-3 py-2 rounded-xl text-xs text-gray-700 hover:bg-[#F6F4ED] flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <Truck className="w-3.5 h-3.5 text-[#254D3F]" />
                            <span>تتبع شحناتي وطلباتي</span>
                          </button>

                          <button
                            onClick={() => {
                              setSideDrawerOpen(false);
                              onNavigate('support');
                            }}
                            className="w-full text-right px-3 py-2 rounded-xl text-xs text-gray-700 hover:bg-[#F6F4ED] flex items-center justify-between cursor-pointer transition-colors"
                          >
                            <div className="flex items-center gap-2">
                              <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                              <span>خدمة العملاء وشات الدعم</span>
                            </div>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                              24/7
                            </span>
                          </button>

                          <div className="border-t border-[#F0ECE1] my-1" />

                          <button
                            onClick={() => {
                              setSideDrawerOpen(false);
                              onLogout();
                            }}
                            className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 cursor-pointer transition-colors"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            <span>تسجيل الخروج</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <User className="w-4 h-4 text-[#C97A57]" />
                          <span className="text-xs font-bold text-[#1F2937]">حسابك في يدوي</span>
                        </div>
                        <p className="text-[11px] text-[#6B7280] mb-3 leading-relaxed">
                          سجّل دخولك لحفظ مشغولاتك المفضلة وتتبع طلباتك والتواصل مع الحرفيين
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => {
                              setSideDrawerOpen(false);
                              onOpenAuth('login');
                            }}
                            className="py-2 px-3 rounded-xl bg-[#254D3F] text-white text-xs font-bold text-center hover:bg-[#1A372D] transition-colors cursor-pointer"
                          >
                            تسجيل الدخول
                          </button>
                          <button
                            onClick={() => {
                              setSideDrawerOpen(false);
                              onOpenAuth('register');
                            }}
                            className="py-2 px-3 rounded-xl bg-white border border-[#254D3F] text-[#254D3F] text-xs font-bold text-center hover:bg-[#F6F4ED] transition-colors cursor-pointer"
                          >
                            حساب جديد
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Shopping Cart Summary Card */}
                  <div className="p-3.5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow">
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-[#254D3F]/10 text-[#254D3F] flex items-center justify-center shrink-0">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1F2937]">سلة المشتريات</div>
                          <div className="text-[10px] text-[#6B7280]">
                            {totalCartCount > 0 
                              ? `${totalCartCount} قطع مختارة باليد` 
                              : 'السلة فارغة حالياً'}
                          </div>
                        </div>
                      </div>
                      {totalCartCount > 0 && (
                        <span className="font-mono text-xs font-black text-[#C97A57]">
                          {totalCartPrice.toLocaleString('ar-EG')} ج.م
                        </span>
                      )}
                    </div>
                    
                    <button
                      onClick={() => {
                        setSideDrawerOpen(false);
                        onOpenCart();
                      }}
                      className="w-full py-2 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <ShoppingBag className="w-3.5 h-3.5 text-[#C97A57]" />
                      <span>{totalCartCount > 0 ? 'عرض السلة وإتمام الطلب' : 'تصفح السلة والمنتجات'}</span>
                    </button>
                  </div>

                  {/* Primary Platform Pages Navigation */}
                  <div className="space-y-1 bg-white p-3 rounded-2xl border border-[#E6E1D3] card-shadow">
                    <div className="text-[11px] font-bold text-[#8C827A] px-2 py-1 uppercase tracking-wider">
                      صفحات المنصة الرئيسية
                    </div>

                    <button
                      onClick={() => {
                        setSideDrawerOpen(false);
                        onNavigate('home');
                      }}
                      className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        currentView === 'home' ? 'bg-[#254D3F] text-white' : 'text-[#1F2937] hover:bg-[#F6F4ED]'
                      }`}
                    >
                      <span>الرئيسية</span>
                      <span className="text-[10px] opacity-70">←</span>
                    </button>

                    <button
                      onClick={() => {
                        setSideDrawerOpen(false);
                        onNavigate('bazaar');
                      }}
                      className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        currentView === 'bazaar' ? 'bg-[#C97A57] text-white' : 'text-[#1F2937] hover:bg-[#F6F4ED]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                        <span>السوق (معرض الفاترينات)</span>
                      </div>
                      <span className="text-[10px] opacity-80 bg-white/20 px-1.5 py-0.5 rounded">بورتفوليو</span>
                    </button>

                    <button
                      onClick={() => {
                        setSideDrawerOpen(false);
                        onNavigate('catalog');
                      }}
                      className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        currentView === 'catalog' ? 'bg-[#254D3F] text-white' : 'text-[#1F2937] hover:bg-[#F6F4ED]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <LayoutGrid className="w-4 h-4 text-[#C97A57]" />
                        <span>سوق المشغولات والحرف</span>
                      </div>
                      <span className="text-[10px] opacity-70">كل المعروضات</span>
                    </button>

                    <button
                      onClick={() => {
                        setSideDrawerOpen(false);
                        onNavigate('favorites');
                      }}
                      className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        currentView === 'favorites' ? 'bg-[#C97A57] text-white' : 'text-[#1F2937] hover:bg-[#F6F4ED]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Heart className={`w-4 h-4 text-[#C97A57] ${favoritesCount > 0 ? 'fill-[#C97A57]' : ''}`} />
                        <span>مشغولاتي المفضلة</span>
                      </div>
                      {favoritesCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-[#C97A57] text-white text-[10px] font-bold">
                          {favoritesCount}
                        </span>
                      )}
                    </button>

                    <button
                      onClick={() => {
                        setSideDrawerOpen(false);
                        onNavigate('tracking');
                      }}
                      className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        currentView === 'tracking' ? 'bg-[#254D3F] text-white' : 'text-[#1F2937] hover:bg-[#F6F4ED]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 text-[#254D3F]" />
                        <span>تتبع شحناتي وطلباتي</span>
                      </div>
                      <span className="text-[10px] text-[#6B7280]">مسار المندوب</span>
                    </button>

                    <button
                      onClick={() => {
                        setSideDrawerOpen(false);
                        onNavigate('support');
                      }}
                      className={`w-full text-right px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                        currentView === 'support' ? 'bg-[#254D3F] text-white' : 'text-[#1F2937] hover:bg-[#F6F4ED]'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Headphones className="w-4 h-4 text-emerald-600" />
                        <span>شات الدعم الفني 24/7</span>
                      </div>
                      <span className="flex items-center gap-1 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        متصل
                      </span>
                    </button>
                  </div>

                </div>

                {/* 3. Pinned Drawer Footer */}
                <div className="p-3.5 border-t border-[#E6E1D3] bg-white shrink-0 text-center">
                  <div className="text-[11px] text-[#6B7280] font-medium leading-relaxed">
                    يدوي • سوق الحرف التراثية الأصيلة بأيدي صناع مصر 🇪🇬
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

      {/* Smart Search Modal */}
      <SmartSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        products={products}
        showcaseItems={showcaseItems}
        vendorPortfolios={vendorPortfolios}
        artisans={artisans}
        initialQuery={topSearch}
        onSelectProduct={(prod) => {
          if (onSelectProduct) {
            onSelectProduct(prod);
          } else {
            onNavigate('product');
          }
        }}
        onSelectArtisan={(artId) => {
          if (onSelectArtisan) {
            onSelectArtisan(artId);
          } else if (onViewShowcase) {
            onViewShowcase(artId);
          } else {
            onNavigate('storefront');
          }
        }}
        onViewShowcase={(artId) => {
          if (onViewShowcase) {
            onViewShowcase(artId);
          } else {
            onNavigate('vendor-showcase');
          }
        }}
        onSelectShowcaseItem={(item) => {
          if (onSelectShowcaseItem) {
            onSelectShowcaseItem(item);
          } else if (onViewShowcase && item.artisanId) {
            onViewShowcase(item.artisanId);
          } else {
            onNavigate('bazaar');
          }
        }}
        onSubmitSearch={(term) => {
          setTopSearch(term);
          if (onSearchChange) onSearchChange(term);
          onNavigate('catalog');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
      />
    </header>
  );
};
