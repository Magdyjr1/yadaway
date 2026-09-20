import React, { useState, useMemo } from 'react';
import { 
  ArrowRight, 
  MapPin, 
  Star, 
  Sparkles, 
  MessageCircle, 
  Calendar, 
  Package, 
  CheckCircle2, 
  ShieldCheck, 
  Scissors, 
  Clock, 
  Share2,
  Check,
  Award,
  Layers,
  ShoppingBag
} from 'lucide-react';
import { Artisan, Product, Review } from '../types';
import { ProductCard } from './ProductCard';

interface ArtisanStorefrontViewProps {
  artisan: Artisan;
  allProducts: Product[];
  favorites: string[];
  onToggleFavorite: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onOpenCustomOrder: (artisan: Artisan, product?: Product) => void;
  onBack: () => void;
  reviews?: Review[];
}

export const ArtisanStorefrontView: React.FC<ArtisanStorefrontViewProps> = ({
  artisan,
  allProducts = [],
  favorites,
  onToggleFavorite,
  onSelectProduct,
  onAddToCart,
  onOpenCustomOrder,
  onBack,
  reviews = []
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [copiedLink, setCopiedLink] = useState(false);

  // Products belonging to this artisan
  const artisanProducts = useMemo(() => {
    const list = Array.isArray(allProducts) ? allProducts : [];
    return list.filter(p => p && p.artisan && (p.artisan.id === artisan.id || p.artisan.name === artisan.name));
  }, [allProducts, artisan]);

  // Categories present in this artisan's catalog
  const availableCategories = useMemo(() => {
    const cats = Array.from(new Set(artisanProducts.map(p => p.category)));
    return cats;
  }, [artisanProducts]);

  // Filtered by subcategory
  const filteredProducts = useMemo(() => {
    if (selectedCategory === 'all') return artisanProducts;
    return artisanProducts.filter(p => p.category === selectedCategory);
  }, [artisanProducts, selectedCategory]);

  // Reviews for this artisan's products
  const artisanReviews = useMemo(() => {
    const prodIds = new Set(artisanProducts.map(p => p.id));
    const safeReviews = Array.isArray(reviews) ? reviews : [];
    return safeReviews.filter(r => r && r.productId && prodIds.has(r.productId));
  }, [artisanProducts, reviews]);

  const handleShare = async () => {
    const text = `تفضل بزيارة ورشة الصانع ${artisan.name} على منصة يدوي: ${window.location.href}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: `ورشة ${artisan.name}`, text, url: window.location.href });
        return;
      } catch {
        // fallback
      }
    }
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 text-right">
      
      {/* Top Breadcrumb & Share */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#254D3F] hover:text-[#1A372D] transition-colors p-2 px-3 rounded-xl bg-white border border-[#E6E1D3] card-shadow cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع للمشغولات اليدوية</span>
        </button>

        <button
          onClick={handleShare}
          className="p-2 px-3 rounded-xl bg-white border border-[#E6E1D3] text-[#6B7280] hover:text-[#1F2937] transition-colors card-shadow flex items-center gap-1.5 text-xs font-bold cursor-pointer"
          title="مشاركة رابط الورشة"
        >
          {copiedLink ? (
            <>
              <Check className="w-4 h-4 text-emerald-600" />
              <span className="text-emerald-600">تم نسخ الرابط</span>
            </>
          ) : (
            <>
              <Share2 className="w-4 h-4" />
              <span>مشاركة الورشة</span>
            </>
          )}
        </button>
      </div>

      {/* Artisan Profile Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-l from-[#254D3F] via-[#1E3F34] to-[#162E26] text-white border border-[#254D3F] card-shadow-lg mb-10">
        
        {/* Subtle Moroccan/Islamic pattern background glow */}
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#F6F4ED_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

        <div className="relative p-6 sm:p-10 flex flex-col md:flex-row items-center md:items-start gap-6 sm:gap-8">
          
          {/* Artisan Avatar & Verified Badge */}
          <div className="relative shrink-0">
            <img
              src={artisan.avatar}
              alt={artisan.name}
              className="w-28 h-28 sm:w-36 sm:h-36 rounded-3xl object-cover border-4 border-white/20 shadow-2xl"
            />
            <div className="absolute -bottom-2 -left-2 bg-[#C97A57] text-white px-2.5 py-0.5 rounded-full text-[10px] font-black shadow-md flex items-center gap-1 border border-white/30">
              <CheckCircle2 className="w-3 h-3" />
              <span>صانع معتمد</span>
            </div>
          </div>

          {/* Details & Bios */}
          <div className="flex-1 text-center md:text-right space-y-3">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2">
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[#E6E1D3] text-xs font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#C97A57]" />
                <span>ورشة يدوية أصيلة</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-[#E6E1D3] text-xs font-medium flex items-center gap-1">
                <Calendar className="w-3 h-3 text-[#C97A57]" />
                <span>عضو في يدوي منذ {artisan.joinedYear}</span>
              </span>
            </div>

            <h1 className="font-display font-black text-2xl sm:text-4xl text-white">
              {artisan.name}
            </h1>

            <p className="text-sm sm:text-base font-semibold text-[#E6E1D3]">
              {artisan.title}
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-[#A3B8B0]">
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#C97A57]" />
                <strong className="text-white">{artisan.location}</strong> ({artisan.governorate})
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-300">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <strong className="text-white">{artisan.rating}</strong> تقييم عام
              </span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Package className="w-3.5 h-3.5 text-[#C97A57]" />
                <strong className="text-white">{artisan.salesCount}</strong> قطعة مشغولة مباعة
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[#E6E1D3]/90 leading-relaxed max-w-3xl pt-2 border-t border-white/10">
              "{artisan.bio}"
            </p>

            {/* Action Buttons: Custom Order & Platform Guarantee */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-4">
              <button
                onClick={() => onOpenCustomOrder(artisan)}
                className="px-6 py-2.5 rounded-xl bg-[#C97A57] hover:bg-[#B36846] text-white text-xs sm:text-sm font-bold flex items-center gap-2 shadow-md transition-all cursor-pointer active:scale-98"
              >
                <Scissors className="w-4 h-4" />
                <span>طلب تفصيل قطعة خاصة من الورشة عبر المنصة</span>
              </button>

              <div className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 text-white text-xs backdrop-blur-xs border border-white/15">
                <ShieldCheck className="w-4 h-4 text-[#C97A57]" />
                <span>حماية المشتري والصانع: التوصيل والتحصيل حصرياً بواسطة يدوي وشركة الشحن المعتمدة</span>
              </div>
            </div>

          </div>

        </div>

        {/* Value Highlights Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-white/10 bg-black/20 text-center py-3 px-4 text-xs font-bold text-[#E6E1D3] gap-2">
          <div className="flex items-center justify-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#C97A57]" />
            <span>خامات مصرية 100%</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#C97A57]" />
            <span>ضمان جودة وتغليف آمن</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Scissors className="w-3.5 h-3.5 text-[#C97A57]" />
            <span>متاح حفر أسماء وتعديل مقاسات</span>
          </div>
          <div className="flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#C97A57]" />
            <span>شحن مباشر من الورشة للعميل</span>
          </div>
        </div>

      </div>

      {/* Workshop Catalog Section */}
      <section className="mb-14">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="font-display font-black text-xl sm:text-2xl text-[#1F2937]">
              معرض مشغولات ورشة {artisan.name} ({artisanProducts.length})
            </h2>
            <p className="text-xs text-[#6B7280]">
              جميع القطع المعروضة مصنوعة يدوياً بالكامل في ورشة الصانع
            </p>
          </div>

          {/* Subcategory Filter Pills */}
          {availableCategories.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                  selectedCategory === 'all'
                    ? 'bg-[#254D3F] text-white shadow-xs'
                    : 'bg-white text-[#4B5563] border border-[#E6E1D3] hover:bg-[#F6F4ED]'
                }`}
              >
                الكل ({artisanProducts.length})
              </button>
              {availableCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
                    selectedCategory === cat
                      ? 'bg-[#254D3F] text-white shadow-xs'
                      : 'bg-white text-[#4B5563] border border-[#E6E1D3] hover:bg-[#F6F4ED]'
                  }`}
                >
                  {cat === 'pottery' ? 'فخار' : cat === 'leather' ? 'جلود' : cat === 'crochet' ? 'كروشيه' : cat === 'wood' ? 'أرابيسك' : 'نحاس'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Products Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                isFavorite={favorites.includes(product.id)}
                onToggleFavorite={onToggleFavorite}
                onSelectProduct={onSelectProduct}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        ) : (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#E6E1D3] card-shadow">
            <Package className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-gray-700">لا توجد قطع معروضة في هذا التصنيف حالياً</p>
          </div>
        )}
      </section>

      {/* Workshop Reviews Section */}
      <section className="border-t border-[#E6E1D3] pt-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="font-display font-black text-xl text-[#1F2937]">
              تجارب وآراء زبائن الورشة ({artisanReviews.length > 0 ? artisanReviews.length : '3'})
            </h3>
            <p className="text-xs text-[#6B7280]">
              مشترون استلموا قطعاً حقيقية صنعتها أنامل {artisan.name}
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E6E1D3] card-shadow text-xs font-bold text-[#1F2937]">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{artisan.rating} من 5</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {(artisanReviews.length > 0 ? artisanReviews : reviews.slice(0, 3)).map(rev => (
            <div
              key={rev.id}
              className="p-5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-[#F59E0B] text-[#F59E0B]" />
                    ))}
                  </div>
                  <span className="text-[11px] text-[#9CA3AF]">{rev.date}</span>
                </div>
                <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed mb-3">
                  "{rev.comment}"
                </p>
              </div>

              <div className="flex items-center justify-between text-xs pt-3 border-t border-[#E6E1D3]">
                <span className="font-bold text-[#1F2937]">{rev.author}</span>
                <span className="text-[11px] text-[#6B7280]">{rev.location}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
