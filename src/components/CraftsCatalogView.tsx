import React, { useState, useMemo } from 'react';
import { 
  Sparkles, 
  Search, 
  SlidersHorizontal, 
  RotateCcw, 
  Check, 
  ArrowRight,
  ShieldCheck,
  Truck,
  HeartHandshake,
  Gem,
  PackageCheck,
  Grid2X2,
  Square
} from 'lucide-react';
import { Category, Product, Artisan } from '../types';
import { ProductCard } from './ProductCard';
import { CATEGORIES } from '../data/mockData';

interface CraftsCatalogViewProps {
  products: Product[];
  categories: Category[];
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  favorites: string[];
  onToggleFavorite: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onBackToHome: () => void;
  onSelectArtisan?: (artisan: Artisan) => void;
}

export const CraftsCatalogView: React.FC<CraftsCatalogViewProps> = ({
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
  onBackToHome,
  onSelectArtisan
}) => {
  const [sortBy, setSortBy] = useState<'bestseller' | 'featured' | 'price-asc' | 'price-desc' | 'rating'>('bestseller');
  const [onlyUnique, setOnlyUnique] = useState<boolean>(false);
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [mobileLayout, setMobileLayout] = useState<'single' | 'double'>(() => {
    try {
      const saved = localStorage.getItem('yadawy_catalog_mobile_layout');
      if (saved === 'single' || saved === 'double') return saved;
    } catch {
      // ignore
    }
    return 'double';
  });

  const handleMobileLayoutChange = (mode: 'single' | 'double') => {
    setMobileLayout(mode);
    try {
      localStorage.setItem('yadawy_catalog_mobile_layout', mode);
    } catch {
      // ignore
    }
  };

  // Filter products based on category, search query, and toggles
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;

      // Search filter
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === '' ||
        product.title.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q) ||
        product.artisan.name.toLowerCase().includes(q) ||
        product.materials.some(m => m.toLowerCase().includes(q));

      // Unique piece toggle
      const matchesUnique = !onlyUnique || product.isUniquePiece;

      // In stock toggle
      const matchesStock = !inStockOnly || product.stock > 0;

      return matchesCategory && matchesSearch && matchesUnique && matchesStock;
    });
  }, [products, selectedCategory, searchQuery, onlyUnique, inStockOnly]);

  // Sort products
  const sortedProducts = useMemo(() => {
    return [...filteredProducts].sort((a, b) => {
      if (sortBy === 'bestseller') {
        return (b.reviewCount || 0) - (a.reviewCount || 0);
      }
      if (sortBy === 'price-asc') {
        return a.price - b.price;
      }
      if (sortBy === 'price-desc') {
        return b.price - a.price;
      }
      if (sortBy === 'rating') {
        return b.rating - a.rating;
      }
      // 'featured'
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [filteredProducts, sortBy]);

  const hasActiveFilters = 
    selectedCategory !== 'all' || 
    searchQuery.trim() !== '' || 
    onlyUnique || 
    inStockOnly;

  const handleResetFilters = () => {
    onSelectCategory('all');
    onSearchChange('');
    setOnlyUnique(false);
    setInStockOnly(false);
    setSortBy('bestseller');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-right">
      
      {/* 1. Header & Breadcrumbs */}
      <div>
        <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-3">
          <button 
            onClick={onBackToHome}
            className="hover:text-[#254D3F] transition-colors cursor-pointer"
          >
            الرئيسية
          </button>
          <span>/</span>
          <span className="text-[#254D3F] font-bold">سوق المشغولات اليدوية</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E6E1D3]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#254D3F]/10 text-[#254D3F] text-xs font-bold mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#C97A57]" />
              <span>معرض القطع الأصيلة</span>
            </div>
            <h1 className="font-display font-black text-2xl sm:text-4xl text-[#1F2937] tracking-tight">
              سوق المشغولات اليدوية المصرية
            </h1>
            <p className="text-xs sm:text-sm text-[#6B7280] mt-1 max-w-2xl leading-relaxed">
              تصفح التشكيلة الكاملة من إبداعات ورش مصر التراثية. كل قطعة صُنعت يدوياً بالكامل بعناية وشغف لتصلك من يد الحرفي إلى باب بيتك.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="px-4 py-2.5 rounded-xl border border-[#E6E1D3] bg-white hover:bg-[#F6F4ED] text-xs font-bold text-[#1F2937] transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <ArrowRight className="w-4 h-4 text-[#254D3F]" />
              <span>العودة للرئيسية</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Main Content Area: Sidebar + Products Grid */}
      <div className="flex flex-col md:flex-row gap-8 items-start">
        
        {/* Sidebar: Categories & Filters */}
        <aside className="w-full md:w-64 shrink-0 space-y-6 md:sticky md:top-24">
          
          {/* Categories Sidebar List */}
          <div className="bg-white rounded-3xl border border-[#E6E1D3] p-6 card-shadow">
            <h3 className="text-sm font-black text-[#1F2937] mb-4 pb-2 border-b border-[#F6F4ED] flex items-center gap-2">
              <LayoutGrid className="w-4 h-4 text-[#C97A57]" />
              <span>تصنيفات الحرف</span>
            </h3>
            <div className="flex flex-col gap-1.5">
              <button
                onClick={() => onSelectCategory('all')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group cursor-pointer ${
                  selectedCategory === 'all'
                    ? 'bg-[#254D3F] text-white shadow-md'
                    : 'text-[#4B5563] hover:bg-[#F6F4ED]'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Sparkles className={`w-3.5 h-3.5 ${selectedCategory === 'all' ? 'text-white' : 'text-[#C97A57]'}`} />
                  <span>جميع المشغولات</span>
                </div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  selectedCategory === 'all' ? 'bg-white/20' : 'bg-gray-100'
                }`}>
                  {products.length}
                </span>
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                const count = products.filter(p => p.category === cat.id).length;
                return (
                  <button
                    key={cat.id}
                    onClick={() => onSelectCategory(cat.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all group cursor-pointer ${
                      isSelected
                        ? 'bg-[#254D3F] text-white shadow-md'
                        : 'text-[#4B5563] hover:bg-[#F6F4ED]'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-4 h-4 rounded-md object-cover"
                      />
                      <span>{cat.name}</span>
                    </div>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20' : 'bg-gray-100'
                    }`}>
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Additional Filter Options */}
          <div className="bg-white rounded-3xl border border-[#E6E1D3] p-6 card-shadow space-y-4">
             <h3 className="text-sm font-black text-[#1F2937] mb-2 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#C97A57]" />
              <span>خيارات التصفية</span>
            </h3>

            <div className="space-y-3">
              <label className="flex items-center justify-between p-2.5 rounded-xl border border-[#E6E1D3] hover:border-[#254D3F] transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <Gem className="w-4 h-4 text-[#C97A57]" />
                  <span className="text-[11px] font-bold text-[#4B5563]">قطع فريدة فقط</span>
                </div>
                <input
                  type="checkbox"
                  checked={onlyUnique}
                  onChange={(e) => setOnlyUnique(e.target.checked)}
                  className="w-4 h-4 rounded text-[#254D3F] focus:ring-[#254D3F]"
                />
              </label>

              <label className="flex items-center justify-between p-2.5 rounded-xl border border-[#E6E1D3] hover:border-[#254D3F] transition-colors cursor-pointer group">
                <div className="flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-[#254D3F]" />
                  <span className="text-[11px] font-bold text-[#4B5563]">المتاح فوراً</span>
                </div>
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-[#254D3F] focus:ring-[#254D3F]"
                />
              </label>
            </div>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-all cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>إعادة ضبط الفلاتر</span>
              </button>
            )}
          </div>
        </aside>

        {/* Products Grid Section */}
        <div className="flex-1 space-y-6">
          {/* Controls & Search Summary */}
          <div className="bg-white rounded-2xl border border-[#E6E1D3] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 card-shadow">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-[#6B7280] absolute right-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ابحث في السوق..."
                className="w-full pr-9 pl-4 py-2 rounded-xl bg-[#F6F4ED]/60 border border-[#E6E1D3] text-xs focus:outline-none focus:border-[#254D3F]"
              />
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="flex-1 sm:flex-none text-xs font-bold bg-[#F6F4ED] border border-[#E6E1D3] rounded-xl px-3 py-2 text-[#1F2937] focus:outline-none"
              >
                <option value="bestseller">الأكثر طلباً ومبيعاً</option>
                <option value="featured">المميز</option>
                <option value="rating">الأعلى تقييماً</option>
                <option value="price-asc">السعر: تصاعدي</option>
                <option value="price-desc">السعر: تنازلي</option>
              </select>

              <div className="hidden sm:flex items-center gap-1 bg-[#F6F4ED] p-1 rounded-xl border border-[#E6E1D3]">
                <button onClick={() => handleMobileLayoutChange('single')} className={`p-1.5 rounded-lg transition-all ${mobileLayout === 'single' ? 'bg-white shadow-xs text-[#254D3F]' : 'text-[#6B7280]'}`}><Square className="w-4 h-4" /></button>
                <button onClick={() => handleMobileLayoutChange('double')} className={`p-1.5 rounded-lg transition-all ${mobileLayout === 'double' ? 'bg-[#254D3F] text-white shadow-xs' : 'text-[#6B7280]'}`}><Grid2X2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6B7280] px-1">
             <div>تم العثور على <strong className="text-[#1F2937]">{sortedProducts.length}</strong> مشغولة يدوية</div>
             {sortedProducts.length > 0 && <div className="flex items-center gap-1 text-[#254D3F] font-bold"><PackageCheck className="w-3.5 h-3.5 text-[#C97A57]" /><span>شحن مباشر من الورشة</span></div>}
          </div>

          {/* Grid */}
          {sortedProducts.length > 0 ? (
            <div className={`grid ${
              mobileLayout === 'single'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6'
            }`}>
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isFavorite={favorites.includes(product.id)}
                  onToggleFavorite={onToggleFavorite}
                  onSelectProduct={onSelectProduct}
                  onAddToCart={onAddToCart}
                  onSelectArtisan={onSelectArtisan}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-[#E6E1D3] p-8 max-w-lg mx-auto">
              <Search className="w-12 h-12 text-gray-200 mx-auto mb-4" />
              <h3 className="font-display font-bold text-lg text-gray-900 mb-2">لا يوجد نتائج</h3>
              <p className="text-sm text-gray-500 mb-6">جرب استخدام كلمات بحث أخرى أو تغيير الفلاتر.</p>
              <button onClick={handleResetFilters} className="text-xs font-bold text-[#254D3F] hover:underline">عرض جميع المنتجات</button>
            </div>
          )}
        </div>
      </div>

      {/* 4. Products Grid */}
      {sortedProducts.length > 0 ? (
        <div className={`grid ${
          mobileLayout === 'single'
            ? 'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6'
            : 'grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-6'
        }`}>
          {sortedProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              isFavorite={favorites.includes(product.id)}
              onToggleFavorite={onToggleFavorite}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
              onSelectArtisan={onSelectArtisan}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#E6E1D3] p-8 max-w-lg mx-auto card-shadow">
          <div className="w-16 h-16 rounded-2xl bg-[#F6F4ED] text-[#C97A57] flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-display font-black text-xl text-[#1F2937] mb-2">
            لم نجد مشغولات تطابق الفلاتر المحددة
          </h3>
          <p className="text-xs sm:text-sm text-[#6B7280] mb-6 leading-relaxed">
            جرب كتابة اسم مختلف، أو اختيار تصنيف حرفي آخر، أو قم بإلغاء تحديد خيارات المحافظة.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-6 py-3 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>عرض جميع مشغولات المتجر ({products.length} قطعة)</span>
          </button>
        </div>
      )}

      {/* 5. Trust & Quality Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-[#E6E1D3]">
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#E6E1D3]">
          <div className="w-10 h-10 rounded-xl bg-[#254D3F]/10 text-[#254D3F] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5 text-[#C97A57]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1F2937]">صناعة يدوية 100%</h4>
            <p className="text-[11px] text-[#6B7280]">قطع أصلية بدون خطوط إنتاج صناعية</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#E6E1D3]">
          <div className="w-10 h-10 rounded-xl bg-[#254D3F]/10 text-[#254D3F] flex items-center justify-center shrink-0">
            <Truck className="w-5 h-5 text-[#254D3F]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1F2937]">شحن آمن لكل مصر</h4>
            <p className="text-[11px] text-[#6B7280]">تغليف واقٍ ضد الكسر والتلف</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#E6E1D3]">
          <div className="w-10 h-10 rounded-xl bg-[#254D3F]/10 text-[#254D3F] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5 text-[#254D3F]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1F2937]">معاينة قبل الاستلام</h4>
            <p className="text-[11px] text-[#6B7280]">دفع عند الاستلام مع إمكانية الفحص</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-[#E6E1D3]">
          <div className="w-10 h-10 rounded-xl bg-[#254D3F]/10 text-[#254D3F] flex items-center justify-center shrink-0">
            <HeartHandshake className="w-5 h-5 text-[#C97A57]" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#1F2937]">دعم مباشر للحرفيين</h4>
            <p className="text-[11px] text-[#6B7280]">تصل أموالك لأيدي الصانع المصري مباشرة</p>
          </div>
        </div>
      </div>

    </div>
  );
};
