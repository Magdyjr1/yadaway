import React, { useState, useMemo } from 'react';
import { 
  Store, 
  Heart, 
  Sparkles, 
  Search, 
  Filter, 
  Flame, 
  Trophy, 
  MapPin, 
  CheckCircle2, 
  ArrowLeft, 
  Layers, 
  Clock, 
  Eye, 
  Share2,
  SlidersHorizontal,
  Compass,
  Grid2X2,
  Square
} from 'lucide-react';
import { ShowcaseItem, VendorPortfolio, Category, UserProfile } from '../types';
import { CATEGORIES } from '../data/mockData';

interface BazaarViewProps {
  showcaseItems?: ShowcaseItem[];
  items?: ShowcaseItem[];
  portfolios?: VendorPortfolio[];
  categories?: Category[];
  currentUser?: UserProfile | null;
  onSelectItem?: (item: ShowcaseItem) => void;
  onSelectPortfolio?: (artisanId: string) => void;
  onViewPortfolio?: (artisanId: string) => void;
  onLikeItem?: (itemId: string) => void;
  onLikePortfolio?: (artisanId: string) => void;
  likedItemIds?: string[];
  likedPortfolioIds?: string[];
  onRequestSimilar?: (item: ShowcaseItem) => void;
  onOpenArtisanDashboard?: () => void;
  onNavigateToDashboard?: () => void;
  onOpenAuth?: () => void;
}

export const BazaarView: React.FC<BazaarViewProps> = ({
  showcaseItems: propShowcaseItems,
  items: propItems,
  portfolios = [],
  categories: propCategories,
  currentUser = null,
  onSelectItem = (_item: ShowcaseItem) => {},
  onSelectPortfolio,
  onViewPortfolio,
  onLikeItem = (_itemId: string) => {},
  onLikePortfolio = (_artisanId: string) => {},
  likedItemIds = [],
  likedPortfolioIds = [],
  onRequestSimilar = (_item: ShowcaseItem) => {},
  onOpenArtisanDashboard,
  onNavigateToDashboard,
  onOpenAuth = () => {},
}) => {
  const allItems = propShowcaseItems || propItems || [];
  const safePortfolios = portfolios || [];
  const categories = (propCategories && propCategories.length > 0) ? propCategories : CATEGORIES;
  const handleSelectPortfolio = onSelectPortfolio || onViewPortfolio || (() => {});
  const handleOpenDashboard = onOpenArtisanDashboard || onNavigateToDashboard;

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'repeatable' | 'portfolio_only'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [mobileLayout, setMobileLayout] = useState<'single' | 'double'>(() => {
    try {
      const saved = localStorage.getItem('yadawy_bazaar_mobile_layout');
      if (saved === 'single' || saved === 'double') return saved;
    } catch {
      // ignore
    }
    return 'double';
  });

  const handleMobileLayoutChange = (mode: 'single' | 'double') => {
    setMobileLayout(mode);
    try {
      localStorage.setItem('yadawy_bazaar_mobile_layout', mode);
    } catch {
      // ignore
    }
  };

  // Calculate trending portfolios sorted by likes
  const trendingPortfolios = useMemo(() => {
    return [...safePortfolios]
      .sort((a, b) => (b.likesCount || 0) - (a.likesCount || 0))
      .slice(0, 3);
  }, [safePortfolios]);

  // Filtered showcase items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) {
        return false;
      }
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title?.toLowerCase().includes(query);
        const matchArtisan = item.artisanName?.toLowerCase().includes(query);
        const matchDesc = item.description?.toLowerCase().includes(query);
        const matchWorkshop = item.workshopName?.toLowerCase().includes(query) || false;
        return matchTitle || matchArtisan || matchDesc || matchWorkshop;
      }
      return true;
    });
  }, [allItems, selectedCategory, selectedStatus, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-right py-6 sm:py-10" id="bazaar-feed-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 sm:space-y-10">

        {/* Hero Section - Minimalist Behance Discover Header with Artisanal Warmth */}
        <div className="relative rounded-3xl bg-[#1A372D] text-white p-6 sm:p-10 overflow-hidden shadow-sm border border-[#254D3F]/40">
          {/* Subtle background ambient craft accents */}
          <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-[#C97A57]/15 blur-3xl pointer-events-none" />
          <div className="absolute right-0 bottom-0 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-[11px] font-bold text-[#E6E1D3]">
              <Sparkles className="w-3.5 h-3.5 text-[#C97A57]" />
              <span>فاترينات الحرف اليدوية المصرية • بورتفوليو الصناع</span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight leading-tight">
              استكشف روائع الحرفيين، سوابق أعمالهم، وفاتريناتهم الحية
            </h1>

            <p className="text-sm sm:text-base text-[#D1DDD7] leading-relaxed max-w-2xl font-normal">
              معرض نخبوي مفتوح يُبرز مهارة وتاريخ الأيدي المصرية المبدعة. تصفح سوابق المشغولات، ادعم ورش الحرفيين بإعجابك، واطلب تنفيذ قطع مخصوصة شبيهة بمقاساتك مع حماية كاملة للدفعة.
            </p>

            {/* Quick Actions */}
            <div className="flex items-center gap-3 pt-2 flex-wrap">
              <span className="text-xs text-[#A3B8B0] flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>توثيق رسمي للورش والقطع</span>
              </span>
              <span className="text-xs text-[#A3B8B0] flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                <Store className="w-3.5 h-3.5 text-[#C97A57]" />
                <span>طلب مباشر من الصانع</span>
              </span>

              {currentUser?.role === 'artisan' && handleOpenDashboard && (
                <button
                  onClick={handleOpenDashboard}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#C97A57] hover:bg-[#b56847] text-white text-xs font-bold transition-all shadow-sm cursor-pointer mr-auto"
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>إدارة فاترينتي وأعمالي</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 1: Trending Portfolios (الفاترينات المتصدرة - Behance Featured Creatives Style) */}
        <div className="space-y-4">
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#C97A57]" />
                <h2 className="font-display font-black text-lg sm:text-xl text-[#1F2937]">
                  فاترينات الصناع الأكثر تفاعلاً هذا الأسبوع
                </h2>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                فاترينات حية تتصدر باختيارات وإعجابات عشاق التراث اليدوي
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {trendingPortfolios.map((portfolio, idx) => {
              const rankBadges = [
                { label: 'الأعلى تفاعلاً 🥇', bg: 'bg-[#C97A57] text-white' },
                { label: 'المركز الثاني 🥈', bg: 'bg-[#254D3F] text-white' },
                { label: 'المركز الثالث 🥉', bg: 'bg-stone-700 text-white' },
              ];
              const rank = rankBadges[idx] || rankBadges[0];
              const isLiked = likedPortfolioIds.includes(portfolio.artisanId) || Boolean(portfolio.likedBy && currentUser?.id && portfolio.likedBy.includes(currentUser.id));

              return (
                <div
                  key={portfolio.artisanId}
                  className="group relative bg-white rounded-2xl border border-[#EAE6DC] overflow-hidden hover:border-[#254D3F]/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Visual Cover Area */}
                  <div 
                    className="relative aspect-16/9 bg-stone-100 overflow-hidden cursor-pointer"
                    onClick={() => handleSelectPortfolio(portfolio.artisanId)}
                  >
                    <img
                      src={portfolio.coverImage}
                      alt={portfolio.workshopName}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                    {/* Rank pill */}
                    <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-xs backdrop-blur-xs ${rank.bg}`}>
                      {rank.label}
                    </span>

                    {/* Minimalist Like pill */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onLikePortfolio(portfolio.artisanId);
                      }}
                      className={`absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-bold backdrop-blur-md transition-all active:scale-90 cursor-pointer flex items-center gap-1.5 shadow-sm ${
                        isLiked
                          ? 'bg-[#C97A57] text-white shadow-sm ring-2 ring-white/40'
                          : 'bg-white/90 text-stone-700 hover:text-[#C97A57]'
                      }`}
                      title={isLiked ? 'إلغاء الإعجاب بالفاترينة' : 'إعجاب بالفاترينة'}
                    >
                      <Heart className={`w-3.5 h-3.5 transition-transform ${isLiked ? 'fill-current scale-110' : ''}`} />
                      <span className="font-mono text-[11px]">{portfolio.likesCount}</span>
                    </button>

                    {/* Bottom strip inside image */}
                    <div className="absolute bottom-3 right-3 left-3 flex items-center justify-between text-white text-xs">
                      <span className="font-bold flex items-center gap-1 drop-shadow-sm">
                        <MapPin className="w-3.5 h-3.5 text-[#C97A57]" />
                        <span>{portfolio.governorate}</span>
                      </span>
                      <span className="text-[11px] bg-black/50 backdrop-blur-xs px-2 py-0.5 rounded-md font-mono">
                        {portfolio.itemCount || 5} أعمال
                      </span>
                    </div>
                  </div>

                  {/* Body Content - Behance Profile Footer with Generous Spacing */}
                  <div className="p-5 pt-4 flex-1 flex flex-col justify-between space-y-3.5 bg-white">
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-3.5 relative z-10">
                        <img
                          src={portfolio.avatar}
                          alt={portfolio.artisanName}
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-sm ring-1 ring-black/5 shrink-0 -mt-8 bg-white"
                        />
                        <div className="min-w-0 flex-1 pt-1">
                          <h3 
                            onClick={() => handleSelectPortfolio(portfolio.artisanId)}
                            className="font-bold text-[15px] text-[#1F2937] hover:text-[#254D3F] transition-colors cursor-pointer truncate leading-snug"
                          >
                            {portfolio.workshopName}
                          </h3>
                          <p className="text-xs text-[#C97A57] font-medium truncate mt-0.5">
                            {portfolio.artisanName} • {portfolio.category}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs text-[#6B7280] line-clamp-2 leading-relaxed font-normal pt-1">
                        {portfolio.bio}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#EAE6DC] flex items-center justify-between gap-2">
                      <span className="text-[11px] text-[#6B7280]">
                        {portfolio.customOrdersAccepted ? '✓ يستقبل التفصيل المخصوص' : 'معرض أعمال وتوثيق'}
                      </span>

                      <button
                        onClick={() => handleSelectPortfolio(portfolio.artisanId)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#FAF8F5] hover:bg-[#254D3F] text-[#254D3F] hover:text-white border border-[#EAE6DC] hover:border-[#254D3F] text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shadow-2xs"
                      >
                        <span>استعراض الفاترينة</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: Minimalist Toolbar & Category Navigation (Behance Style) */}
        <div className="space-y-3 pt-2">
          {/* Search & Type filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-2 sm:p-2.5 rounded-2xl border border-[#EAE6DC] shadow-2xs">
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث بالاسم، الحرفة، أو الورشة..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-[#FAF8F5] border border-transparent focus:border-[#254D3F] focus:bg-white text-xs sm:text-sm text-[#1F2937] placeholder:text-[#9CA3AF] focus:outline-none transition-all"
              />
              <Search className="w-4 h-4 text-[#9CA3AF] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            {/* Status Segmented Control */}
            <div className="flex items-center gap-1 bg-[#FAF8F5] p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
              <button
                onClick={() => setSelectedStatus('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedStatus === 'all'
                    ? 'bg-white text-[#1F2937] shadow-2xs border border-[#EAE6DC]'
                    : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                جميع الأعمال ({allItems.length})
              </button>
              <button
                onClick={() => setSelectedStatus('repeatable')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedStatus === 'repeatable'
                    ? 'bg-white text-[#254D3F] shadow-2xs border border-[#EAE6DC]'
                    : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                ✓ متاح تنفيذ شبيهة
              </button>
              <button
                onClick={() => setSelectedStatus('portfolio_only')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  selectedStatus === 'portfolio_only'
                    ? 'bg-white text-[#C97A57] shadow-2xs border border-[#EAE6DC]'
                    : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                سابقة أعمال توثيقية
              </button>
            </div>
          </div>

          {/* Categories Horizontal Minimalist Filter Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                selectedCategory === 'all'
                  ? 'bg-[#254D3F] text-white shadow-2xs'
                  : 'bg-white text-[#4B5563] border border-[#EAE6DC] hover:border-[#254D3F] hover:text-[#254D3F]'
              }`}
            >
              كل الحرف التراثية
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap shrink-0 cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-[#254D3F] text-white shadow-2xs'
                    : 'bg-white text-[#4B5563] border border-[#EAE6DC] hover:border-[#254D3F] hover:text-[#254D3F]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* SECTION 3: Minimalist Behance-Style Project Grid (معرض الأعمال والمشغولات) */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-[#6B7280]">
            <div className="flex items-center justify-between sm:justify-start gap-3">
              <span className="font-medium">
                عرض <strong>{filteredItems.length}</strong> مشغولة فنية
              </span>
              <span className="hidden sm:inline text-[#9CA3AF]">
                انقر على أي عمل لمشاهدة تفاصيل الصور وطلب تنفيذ قطعة مماثلة
              </span>
            </div>

            {/* Mobile View Switcher (Icon-only buttons) */}
            {filteredItems.length > 0 && (
              <div className="flex sm:hidden items-center justify-between bg-white px-3 py-2 rounded-2xl border border-[#EAE6DC] shadow-2xs">
                <span className="text-[11px] font-bold text-[#4B5563]">
                  طريقة العرض:
                </span>
                <div className="flex items-center gap-1 bg-[#FAF8F5] p-0.5 rounded-xl border border-[#EAE6DC]">
                  <button
                    type="button"
                    onClick={() => handleMobileLayoutChange('single')}
                    className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                      mobileLayout === 'single'
                        ? 'bg-white text-[#254D3F] shadow-xs'
                        : 'text-[#6B7280] hover:text-[#1F2937]'
                    }`}
                    aria-label="عرض عمل واحد كبير"
                    title="عرض عمل واحد كبير"
                  >
                    <Square className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMobileLayoutChange('double')}
                    className={`p-1.5 rounded-lg transition-all flex items-center justify-center cursor-pointer ${
                      mobileLayout === 'double'
                        ? 'bg-[#254D3F] text-white shadow-xs'
                        : 'text-[#6B7280] hover:text-[#1F2937]'
                    }`}
                    aria-label="عرض 2 جنب بعض"
                    title="عرض 2 جنب بعض"
                  >
                    <Grid2X2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {filteredItems.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#EAE6DC] p-12 text-center space-y-3">
              <Compass className="w-10 h-10 mx-auto text-[#C97A57] opacity-50" />
              <h3 className="font-bold text-base text-[#1F2937]">لا توجد قطع مطابقة للبحث</h3>
              <p className="text-xs text-[#6B7280]">جرب اختيار تصنيف آخر أو إعادة ضبط الفلترة.</p>
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSelectedStatus('all');
                  setSearchQuery('');
                }}
                className="px-4 py-2 rounded-xl bg-[#254D3F] text-white text-xs font-bold cursor-pointer hover:bg-[#1E3F34] transition-colors"
              >
                عرض كل المشغولات
              </button>
            </div>
          ) : (
            <div className={`grid ${
              mobileLayout === 'single'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6'
            }`}>
              {filteredItems.map((item) => {
                const isLiked = likedItemIds.includes(item.id) || Boolean(item.likedBy && currentUser?.id && item.likedBy.includes(currentUser.id));
                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl border border-[#EAE6DC] overflow-hidden hover:border-[#254D3F]/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Image Presentation Container (Aspect 4:3) */}
                    <div 
                      className="relative aspect-4/3 overflow-hidden bg-stone-100 cursor-pointer"
                      onClick={() => onSelectItem(item)}
                    >
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                      />

                      {/* Subtle Vignette Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 opacity-60 group-hover:opacity-80 transition-opacity duration-300" />

                      {/* Top Status & Craft Tag */}
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 flex items-center gap-1.5 z-10">
                        {item.status === 'repeatable' ? (
                          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#254D3F]/90 text-white backdrop-blur-xs flex items-center gap-1 shadow-2xs">
                            <CheckCircle2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-300" />
                            <span>متاح تكراره</span>
                          </span>
                        ) : (
                          <span className="px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold bg-stone-900/80 text-amber-200 backdrop-blur-xs shadow-2xs">
                            <span>سابقة أعمال</span>
                          </span>
                        )}
                      </div>

                      {/* Top Left Like Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onLikeItem(item.id);
                        }}
                        className={`absolute top-2 sm:top-3 left-2 sm:left-3 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full backdrop-blur-md transition-all active:scale-90 cursor-pointer flex items-center gap-1 text-[10px] sm:text-xs font-bold z-10 shadow-2xs ${
                          isLiked
                            ? 'bg-[#C97A57] text-white shadow-sm ring-2 ring-white/40'
                            : 'bg-white/90 text-stone-700 hover:text-[#C97A57]'
                        }`}
                        title={isLiked ? 'إلغاء الإعجاب' : 'إعجاب بالقطعة'}
                      >
                        <Heart className={`w-3 h-3 sm:w-3.5 sm:h-3.5 transition-transform ${isLiked ? 'fill-current scale-110' : ''}`} />
                        <span className="font-mono text-[10px] sm:text-[11px]">{item.likesCount.toLocaleString('ar-EG')}</span>
                      </button>

                      {/* Bottom Info inside image: Photo Count & Quick View CTA on hover */}
                      <div className="absolute bottom-2 sm:bottom-3 right-2 sm:right-3 left-2 sm:left-3 flex items-center justify-between z-10">
                        <span className="px-1.5 sm:px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[9px] sm:text-[10px] font-mono font-medium">
                          {item.images.length} صور
                        </span>

                        {/* Hover Action Pill */}
                        <span className="hidden sm:inline-block text-[11px] font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          معاينة العمل ✦
                        </span>
                      </div>
                    </div>

                    {/* Minimalist Behance Metadata Footer */}
                    <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                      <div className="space-y-1 sm:space-y-1.5">
                        {/* Title */}
                        <h3 
                          onClick={() => onSelectItem(item)}
                          className="font-bold text-xs sm:text-[15px] text-[#1F2937] hover:text-[#254D3F] transition-colors cursor-pointer line-clamp-1 leading-snug"
                        >
                          {item.title}
                        </h3>

                        {/* Studio & Artisan Line */}
                        <div 
                          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer group/artisan"
                          onClick={() => handleSelectPortfolio(item.artisanId)}
                        >
                          <img
                            src={item.artisanAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'}
                            alt={item.artisanName}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full object-cover border border-[#EAE6DC] shrink-0"
                          />
                          <span className="text-[11px] sm:text-xs text-[#4B5563] group-hover/artisan:text-[#254D3F] transition-colors truncate">
                            {item.workshopName || item.artisanName}
                          </span>
                          <span className="hidden sm:inline text-[10px] text-[#9CA3AF] shrink-0">
                            • {item.artisanGovernorate}
                          </span>
                        </div>

                        {/* Subtle Description */}
                        <p className="hidden sm:block text-xs text-[#6B7280] line-clamp-2 leading-relaxed font-normal pt-1">
                          {item.description}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="pt-2 sm:pt-3 border-t border-[#EAE6DC] flex items-center justify-between gap-1 sm:gap-2">
                        {item.estimatedPriceNote ? (
                          <span className="text-[11px] sm:text-xs font-bold text-[#C97A57] font-mono truncate">
                            {item.estimatedPriceNote}
                          </span>
                        ) : (
                          <span className="text-[10px] sm:text-[11px] text-[#9CA3AF] truncate">
                            حرفة يدوية
                          </span>
                        )}

                        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                          <button
                            onClick={() => onSelectItem(item)}
                            className="hidden sm:inline-block px-2.5 py-1 rounded-lg text-xs font-bold text-[#4B5563] hover:text-[#254D3F] hover:bg-[#FAF8F5] transition-colors cursor-pointer"
                          >
                            التفاصيل
                          </button>

                          <button
                            onClick={() => onRequestSimilar(item)}
                            className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg bg-[#254D3F] hover:bg-[#1A372D] text-white text-[10px] sm:text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                          >
                            <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#C97A57]" />
                            <span>طلب شبيهة</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
