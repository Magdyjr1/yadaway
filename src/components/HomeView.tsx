import React, { useMemo } from 'react';
import { 
  Sparkles, 
  ArrowLeft, 
  ShieldCheck, 
  Truck, 
  HeartHandshake, 
  Clock, 
  MessageCircle, 
  MapPin, 
  Flame, 
  Star,
  Award,
  ArrowRight,
  TrendingUp,
  Package,
  Headphones
} from 'lucide-react';
import { Category, Product, Artisan } from '../types';
import { ProductCard } from './ProductCard';
import { CATEGORIES, ARTISANS } from '../data/mockData';
import { YadawyEmblem } from './YadawyLogo';

interface HomeViewProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  favorites: string[];
  onToggleFavorite: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  onSelectArtisan: (artisan: Artisan) => void;
  onNavigateToCatalog: (categoryId?: string) => void;
  onNavigateToBazaar?: () => void;
  onNavigateSupport?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  products,
  categories,
  selectedCategory,
  onSelectCategory,
  favorites,
  onToggleFavorite,
  onSelectProduct,
  onAddToCart,
  searchQuery,
  onSearchChange,
  onSelectArtisan,
  onNavigateToCatalog,
  onNavigateToBazaar,
  onNavigateSupport
}) => {
  // Top 3 best selling products (based on reviewCount and sales momentum)
  const topThreeBestSellers = useMemo(() => {
    return [...products]
      .sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0))
      .slice(0, 3);
  }, [products]);

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      
      {/* 1. Hero Section: Warm & Welcoming */}
      <section className="relative overflow-hidden pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl bg-[#254D3F] text-[#F6F4ED] p-6 sm:p-12 lg:p-16 overflow-hidden card-shadow-lg">
            
            {/* Background Texture & Ornamentation */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-[#326352]/30 blur-2xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-80 h-80 rounded-full bg-[#C97A57]/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-xs border border-white/15 text-xs font-bold mb-4">
                <YadawyEmblem size={18} isDark={true} />
                <span>السوق المصري الأول للصناع المستقلين والحرف الأصيلة</span>
              </div>

              <h1 className="font-display font-black text-3xl sm:text-5xl lg:text-5xl leading-tight sm:leading-tight mb-4 tracking-tight">
                من أيدي حِرَفِيّي مصر.. <br />
                <span className="text-[#C97A57]">إلى بيتك مباشرة.</span>
              </h1>

              <p className="text-sm sm:text-base text-[#E6E1D3] leading-relaxed mb-8 max-w-xl">
                اكتشف قطعاً فنية صُنعت بكل صبر وحب في ورش الفخار بالفيوم، وأزقة خان الخليلي، ونخيل سيوة، وأنوال أخميم. كل قطعة تحمل قصة صانعها ودعماً مباشراً له.
              </p>

              {/* Hero Search & CTA */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => onNavigateToCatalog()}
                  className="px-6 py-3.5 rounded-xl bg-[#C97A57] hover:bg-[#B36846] text-white font-bold text-sm sm:text-base transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <span>استكشف كل المشغولات اليدوية</span>
                  <ArrowLeft className="w-4 h-4" />
                </button>

                {onNavigateToBazaar && (
                  <button
                    onClick={onNavigateToBazaar}
                    className="px-5 py-3.5 rounded-xl bg-white/15 hover:bg-white/25 text-white font-bold text-sm transition-all border border-white/20 flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Flame className="w-4 h-4 text-amber-400" />
                    <span>تصفح الفاترينات (السوق)</span>
                  </button>
                )}

                <div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/15 text-xs text-[#E6E1D3]">
                  <div className="flex -space-x-2 space-x-reverse">
                    {ARTISANS.slice(0, 3).map((a) => (
                      <img 
                        key={a.id} 
                        src={a.avatar} 
                        alt={a.name} 
                        className="w-8 h-8 rounded-full border-2 border-[#254D3F] object-cover" 
                      />
                    ))}
                  </div>
                  <div>
                    <span className="font-bold text-white block">مصر فيها أكثر من 3 مليون حِرفي</span>
                    <span className="text-[11px] text-[#E6E1D3]/80">نجمع نخبة أمهرهم في منصة يدوي</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Subtle Right Art Preview (desktop) */}
            <div className="hidden lg:block absolute left-10 top-1/2 -translate-y-1/2 w-88 aspect-square rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-500">
              <img
                src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=700&q=80"
                alt="فخار قرية تونس اليدوي"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex flex-col justify-end p-5 text-right">
                <span className="text-xs text-[#C97A57] font-bold">قرية تونس، الفيوم</span>
                <span className="text-sm font-bold text-white">فازة خزفية يدوية بأكاسيد النيل</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Value Props (لماذا يدوي؟) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E1D3] card-shadow flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#254D3F]/10 text-[#254D3F] flex items-center justify-center shrink-0">
              <Sparkles className="w-5 h-5 text-[#254D3F]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1F2937]">صناعة يدوية 100%</h4>
              <p className="text-xs text-[#6B7280]">قطع أصلية بدون تصنيع تجاري</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E1D3] card-shadow flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C97A57]/15 text-[#C97A57] flex items-center justify-center shrink-0">
              <HeartHandshake className="w-5 h-5 text-[#C97A57]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1F2937]">دعم مباشر للصانع</h4>
              <p className="text-xs text-[#6B7280]">عائد البيع يذهب لورشة الحرفي</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E1D3] card-shadow flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#254D3F]/10 text-[#254D3F] flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 text-[#254D3F]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1F2937]">شحن لكل المحافظات</h4>
              <p className="text-xs text-[#6B7280]">تغليف آمن ومحكم للمنتجات</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#E6E1D3] card-shadow flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C97A57]/15 text-[#C97A57] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 text-[#C97A57]" />
            </div>
            <div>
              <h4 className="font-bold text-sm text-[#1F2937]">دفع عند الاستلام</h4>
              <p className="text-xs text-[#6B7280]">أو إنستاباي ومحافظ إلكترونية</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Horizontal Scrollable Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-[#1F2937]">
              تصفح حسب الحِرفة المصرية
            </h2>
            <p className="text-xs sm:text-sm text-[#6B7280]">
              اختر الفن أو المادة التي تبحث عنها للانتقال لسوق المشغولات
            </p>
          </div>

          <button
            onClick={() => onNavigateToCatalog('all')}
            className="text-xs font-bold text-[#254D3F] hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>عرض كل المشغولات</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Scrollable Container */}
        <div className="flex items-center gap-3 overflow-x-auto pb-4 pt-1 no-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
          {/* "All" category button */}
          <button
            onClick={() => onNavigateToCatalog('all')}
            className="shrink-0 flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all border cursor-pointer bg-[#254D3F] text-white border-[#254D3F] shadow-sm hover:bg-[#1A372D]"
          >
            <Sparkles className="w-4 h-4 text-[#C97A57]" />
            <span>جميع المشغولات</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-white/20 text-white">
              {products.length}
            </span>
          </button>

          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onNavigateToCatalog(cat.id)}
              className="shrink-0 flex items-center gap-2.5 px-4 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all border cursor-pointer bg-white text-[#1F2937] border-[#E6E1D3] hover:border-[#254D3F]"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="w-6 h-6 rounded-lg object-cover"
              />
              <span>{cat.name}</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-[#EAE6DC] text-[#4B5563]">
                {products.filter(p => p.category === cat.id).length}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* 4. Top 3 Best-Sellers Only Section */}
      <section id="bestsellers-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-3 border-b border-[#E6E1D3]">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-xl bg-[#C97A57]/15 text-[#C97A57]">
                <Flame className="w-5 h-5 fill-[#C97A57]" />
              </span>
              <h2 className="font-display font-black text-xl sm:text-3xl text-[#1F2937]">
                أكثر 3 مشغولات طلباً ومبيعاً
              </h2>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#254D3F] text-white">
                الأعلى تقييماً
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
              القطع التراثية الأكثر طلباً واقتناءً من زبائن يَدَوِي في مختلف المحافظات
            </p>
          </div>

          <button
            onClick={() => onNavigateToCatalog()}
            className="self-start sm:self-auto inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-[#254D3F] text-[#254D3F] hover:text-white border border-[#254D3F]/30 hover:border-[#254D3F] text-xs font-bold transition-all shadow-xs cursor-pointer group"
          >
            <span>عرض كل المشغولات اليدوية ({products.length} قطعة)</span>
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 3 Top Best Sellers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {topThreeBestSellers.map((product, idx) => {
            const rankLabel = idx === 0 ? 'الأكثر مبيعاً #1' : idx === 1 ? 'الأكثر مبيعاً #2' : 'الأكثر مبيعاً #3';
            const badgeBg = idx === 0 
              ? 'bg-amber-500 text-white shadow-amber-500/20' 
              : idx === 1 
              ? 'bg-[#254D3F] text-white shadow-emerald-900/20' 
              : 'bg-[#C97A57] text-white shadow-[#C97A57]/20';

            return (
              <div key={product.id} className="relative group">
                {/* Ranking Tag */}
                <div className={`absolute -top-3 right-4 z-20 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black shadow-md ${badgeBg}`}>
                  <Award className="w-3.5 h-3.5" />
                  <span>{rankLabel}</span>
                </div>
                <div className="pt-2 h-full">
                  <ProductCard
                    product={product}
                    isFavorite={favorites.includes(product.id)}
                    onToggleFavorite={onToggleFavorite}
                    onSelectProduct={onSelectProduct}
                    onAddToCart={onAddToCart}
                    onSelectArtisan={onSelectArtisan}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Prominent Banner to View Full Crafts Page */}
        <div className="mt-8 rounded-3xl bg-[#254D3F] text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 card-shadow-lg">
          <div className="text-right space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 text-xs text-[#C97A57] font-bold">
              <Package className="w-4 h-4" />
              <span>متاح تشكيلة أوسع في كافة الحرف</span>
            </div>
            <h3 className="font-display font-black text-xl sm:text-2xl text-white">
              هل تبحث عن قطع مميزة أخرى أو تفصيل مخصص؟
            </h3>
            <p className="text-xs sm:text-sm text-[#E6E1D3] leading-relaxed">
              استكشف سوق المشغولات الكامل الذي يضم فخار الفيوم، كروشيه الإسكندرية، جلود المدابغ الطبيعية، سجاد أخميم ونحاس المعز الفاطمي مع فلاتر حسب المحافظة والمادة.
            </p>
          </div>

          <button
            onClick={() => onNavigateToCatalog()}
            className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-[#C97A57] hover:bg-[#B36846] text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-98 shrink-0"
          >
            <span>تصفح سوق المشغولات اليدوية</span>
            <ArrowLeft className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* 5. Artisan Spotlight (حكاية صانع) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-white border border-[#E6E1D3] p-6 sm:p-10 card-shadow-md">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            
            <div className="lg:max-w-xl text-right">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C97A57]/15 text-[#C97A57] text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                <span>حكاية صانع هذا الشهر</span>
              </div>

              <h2 className="font-display font-black text-2xl sm:text-3xl text-[#1F2937] mb-2 leading-tight">
                عم إبراهيم النوبي • فيلسوف الفخار في قرية تونس
              </h2>

              <p className="text-xs sm:text-sm text-[#254D3F] font-bold mb-3 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-[#C97A57]" />
                <span>قرية تونس، ضفاف بحيرة قارون - محافظة الفيوم</span>
              </p>

              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed mb-6">
                "الفخار مش مجرد طين بيتحرق في الفرن.. الفخار هو صبر الأرض المصرية ونبض النيل. كل فازة بشتغلها بتاخد من روحي 4 أيام عشان لما تدخل بيتك تحس بالدفا والبركة."
              </p>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => onSelectArtisan(ARTISANS[0])}
                  className="px-5 py-2.5 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer flex items-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-[#C97A57]" />
                  <span>زيارة متجر ومعروضات ورشة عم إبراهيم</span>
                </button>

                <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#254D3F]/10 text-[#254D3F] text-xs font-semibold">
                  <ShieldCheck className="w-4 h-4 text-[#254D3F]" />
                  <span>الطلب والشحن حصرياً عبر يدوي وشركة الشحن المعتمدة</span>
                </div>
              </div>
            </div>

            {/* Artisan Visual Banner */}
            <div 
              onClick={() => onSelectArtisan(ARTISANS[0])}
              className="relative w-full lg:w-96 aspect-4/3 rounded-2xl overflow-hidden border border-[#E6E1D3] shadow-md shrink-0 cursor-pointer group hover:scale-[1.01] transition-transform"
              title="اضغط لزيارة متجر ورشة عم إبراهيم"
            >
              <img
                src={ARTISANS[0].avatar}
                alt={ARTISANS[0].name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex flex-col justify-end p-5 text-right text-white">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="w-4 h-4 fill-[#F59E0B] text-[#F59E0B]" />
                  <span className="font-bold text-sm">4.9 / 5.0</span>
                  <span className="text-xs text-stone-300">({ARTISANS[0].salesCount} قطعة مباعة)</span>
                </div>
                <h4 className="font-display font-bold text-lg flex items-center justify-between">
                  <span>{ARTISANS[0].name}</span>
                  <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#C97A57] text-white">زيارة الورشة</span>
                </h4>
                <p className="text-xs text-stone-200">{ARTISANS[0].title}</p>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 24/7 Dedicated Support Banner for Customers & Artisans */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-l from-[#254D3F] to-[#1A372D] text-white p-6 sm:p-8 border border-[#254D3F] shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-right">
            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0 shadow-inner">
              <Headphones className="w-7 h-7 text-[#E6E1D3]" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="font-display font-black text-lg sm:text-xl text-white">
                  شات الدعم وخدمة العملاء والورش (24 ساعة)
                </h3>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  متواجدون دائماً
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#C5D3CE] max-w-xl leading-relaxed">
                هل لديك استفسار عن طلبك أو موعد وصول مندوب شركة الشحن؟ هل أنت صاحب ورشة وتحتاج مساعدة في استلام الطرود؟ شات مخصص للتواصل الفوري معي على مدار الساعة لحل كل مشاكلك.
              </p>
            </div>
          </div>

          {onNavigateSupport && (
            <button
              onClick={onNavigateSupport}
              className="w-full md:w-auto px-6 py-3.5 rounded-2xl bg-[#C97A57] hover:bg-[#B36846] text-white text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Headphones className="w-4 h-4" />
              <span>بدء محادثة الدعم المباشر الآن</span>
            </button>
          )}
        </div>
      </section>

    </div>
  );
};
