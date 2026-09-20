import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { 
  Search, 
  X, 
  Clock, 
  TrendingUp, 
  Store, 
  Package, 
  Sparkles, 
  MapPin, 
  ArrowLeft, 
  Tag, 
  ChevronLeft,
  Flame,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Product, Artisan } from '../types';
import { ShowcaseItem, VendorPortfolio } from '../types';
import { serperWebSearch, isSerperAvailable, type SerperOrganicResult } from '../services/serper';

export function normalizeArabic(text: string): string {
  if (!text) return '';
  return text
    .replace(/[\u064B-\u065F\u0670]/g, '') // remove tashkeel/harakat
    .replace(/[ـ]/g, '') // remove tatweel
    .replace(/[أإآ]/g, 'ا')
    .replace(/[ة]/g, 'ه')
    .replace(/[ى]/g, 'ي')
    .replace(/[ؤئ]/g, 'ء')
    .toLowerCase()
    .trim();
}

// Highlight matched search letters within text
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query || !query.trim()) return <span>{text}</span>;
  
  const normalizedText = normalizeArabic(text);
  const normalizedQuery = normalizeArabic(query.trim());
  const words = normalizedQuery.split(/\s+/).filter(Boolean);

  if (words.length === 0) return <span>{text}</span>;

  // Find index of first matching word
  let bestIdx = -1;
  let matchLen = 0;

  for (const w of words) {
    const idx = normalizedText.indexOf(w);
    if (idx !== -1 && (bestIdx === -1 || idx < bestIdx)) {
      bestIdx = idx;
      matchLen = w.length;
    }
  }

  if (bestIdx === -1) return <span>{text}</span>;

  const before = text.slice(0, bestIdx);
  const matched = text.slice(bestIdx, bestIdx + matchLen);
  const after = text.slice(bestIdx + matchLen);

  return (
    <span>
      {before}
      <span className="bg-amber-100 text-[#254D3F] font-bold px-0.5 rounded">
        {matched}
      </span>
      {after}
    </span>
  );
}

// Popular craft keywords
const POPULAR_SEARCHES = [
  'فخار قرية تونس',
  'نحاس خان الخليلي',
  'دار الأرابيسك',
  'كليم يدوي صوف',
  'خيامية الدرب الأحمر',
  'خوص وسعف النوبة',
  'صدف البحر الأحمر',
  'شال كروشيه قطن'
];

type SearchTab = 'all' | 'products' | 'showcase' | 'workshops';

interface SmartSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  showcaseItems?: ShowcaseItem[];
  vendorPortfolios?: VendorPortfolio[];
  artisans?: Artisan[];
  initialQuery?: string;
  onSelectProduct: (product: Product) => void;
  onSelectArtisan?: (artisanId: string) => void;
  onViewShowcase?: (artisanId: string) => void;
  onSelectShowcaseItem?: (item: ShowcaseItem) => void;
  onSubmitSearch: (query: string) => void;
}

export const SmartSearchModal: React.FC<SmartSearchModalProps> = ({
  isOpen,
  onClose,
  products = [],
  showcaseItems = [],
  vendorPortfolios = [],
  artisans = [],
  initialQuery = '',
  onSelectProduct,
  onSelectArtisan,
  onViewShowcase,
  onSelectShowcaseItem,
  onSubmitSearch
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>('all');
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('yadawy_recent_searches');
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return ['فخار الفيوم', 'نحاس أصفر', 'أرابيسك'];
  });

  // ── Serper (Google Search) state ─────────────────────────────────────────
  const [serperResults, setSerperResults] = useState<SerperOrganicResult[]>([]);
  const [serperLoading, setSerperLoading] = useState(false);
  const serperTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  // Sync initial query
  useEffect(() => {
    if (isOpen) {
      setQuery(initialQuery);
      setActiveTab('all');
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen, initialQuery]);

  // Lock body scroll & ESC key handling
  useEffect(() => {
    if (isOpen) {
      const original = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onClose();
        }
      };
      window.addEventListener('keydown', handleKey);
      return () => {
        document.body.style.overflow = original;
        window.removeEventListener('keydown', handleKey);
      };
    }
  }, [isOpen, onClose]);

  // ── Serper: debounced Google search (fires 600ms after typing stops) ──────
  useEffect(() => {
    if (serperTimerRef.current) clearTimeout(serperTimerRef.current);

    const trimmed = query.trim();
    if (!trimmed || !isSerperAvailable()) {
      setSerperResults([]);
      setSerperLoading(false);
      return;
    }

    setSerperLoading(true);
    serperTimerRef.current = setTimeout(async () => {
      const res = await serperWebSearch(trimmed, 5);
      setSerperResults(res.organic);
      setSerperLoading(false);
    }, 600);

    return () => {
      if (serperTimerRef.current) clearTimeout(serperTimerRef.current);
    };
  }, [query]);

  // Save to recent searches
  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(t => t.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('yadawy_recent_searches', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const removeRecentSearch = (termToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(t => t !== termToRemove);
      try {
        localStorage.setItem('yadawy_recent_searches', JSON.stringify(updated));
      } catch {
        // ignore
      }
      return updated;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    try {
      localStorage.removeItem('yadawy_recent_searches');
    } catch {
      // ignore
    }
  };

  // Perform smart search across products, showcase items, and artisan workshops (NO regular customer user names)
  const searchResults = useMemo(() => {
    const q = normalizeArabic(query);
    if (!q) {
      return {
        products: [],
        showcaseItems: [],
        workshops: [],
        total: 0
      };
    }

    const words = q.split(/\s+/).filter(Boolean);

    // 1. MATCH PRODUCTS
    const matchedProducts = products.filter(product => {
      const pTitle = normalizeArabic(product.title);
      const pDesc = normalizeArabic(product.description || '');
      const pCategory = normalizeArabic(product.category || '');
      const pMaterials = (product.materials || []).map(normalizeArabic).join(' ');
      const pMaker = normalizeArabic(product.artisan?.name || '');
      const pGov = normalizeArabic(product.artisan?.governorate || '');

      const fullText = `${pTitle} ${pDesc} ${pCategory} ${pMaterials} ${pMaker} ${pGov}`;
      return words.every(w => fullText.includes(w));
    });

    // 2. MATCH SHOWCASE ITEMS (الفاترينات وسوابق الأعمال)
    const matchedShowcase = showcaseItems.filter(item => {
      const sTitle = normalizeArabic(item.title);
      const sWorkshop = normalizeArabic(item.workshopName || '');
      const sDesc = normalizeArabic(item.description || '');
      const sMaterials = (item.materials || []).map(normalizeArabic).join(' ');
      const sGov = normalizeArabic(item.artisanGovernorate || '');

      const fullText = `${sTitle} ${sWorkshop} ${sDesc} ${sMaterials} ${sGov}`;
      return words.every(w => fullText.includes(w));
    });

    // 3. MATCH WORKSHOPS & ARTISANS (الورش الحرفية فقط - بدون مستخدمين عاديين)
    // Combine vendorPortfolios and artisans
    const workshopMap = new Map<string, {
      artisanId: string;
      workshopName: string;
      artisanName: string;
      governorate: string;
      avatar: string;
      category: string;
      bio: string;
      likesCount?: number;
      itemCount?: number;
    }>();

    // Add vendorPortfolios
    vendorPortfolios.forEach(vp => {
      workshopMap.set(vp.artisanId, {
        artisanId: vp.artisanId,
        workshopName: vp.workshopName,
        artisanName: vp.artisanName,
        governorate: vp.governorate,
        avatar: vp.avatar,
        category: vp.category,
        bio: vp.bio,
        likesCount: vp.likesCount,
        itemCount: vp.itemCount
      });
    });

    // Add artisans who may not have a vendorPortfolio entry yet
    artisans.forEach(art => {
      if (!workshopMap.has(art.id)) {
        workshopMap.set(art.id, {
          artisanId: art.id,
          workshopName: `ورشة ${art.name}`,
          artisanName: art.name,
          governorate: art.governorate,
          avatar: art.avatar,
          category: art.title,
          bio: art.bio
        });
      }
    });

    const allWorkshops = Array.from(workshopMap.values());
    const matchedWorkshops = allWorkshops.filter(ws => {
      const wName = normalizeArabic(ws.workshopName);
      const aName = normalizeArabic(ws.artisanName);
      const wBio = normalizeArabic(ws.bio || '');
      const wGov = normalizeArabic(ws.governorate || '');
      const wCat = normalizeArabic(ws.category || '');

      const fullText = `${wName} ${aName} ${wBio} ${wGov} ${wCat}`;
      return words.every(w => fullText.includes(w));
    });

    return {
      products: matchedProducts,
      showcaseItems: matchedShowcase,
      workshops: matchedWorkshops,
      total: matchedProducts.length + matchedShowcase.length + matchedWorkshops.length
    };
  }, [query, products, showcaseItems, vendorPortfolios, artisans]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQuery = query.trim();
    if (!cleanQuery) return;
    saveRecentSearch(cleanQuery);
    onSubmitSearch(cleanQuery);
    onClose();
  };

  const handleSelectRecentOrPopular = (term: string) => {
    setQuery(term);
    saveRecentSearch(term);
    onSubmitSearch(term);
    onClose();
  };

  const handleProductClick = (product: Product, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    saveRecentSearch(query || product.title);
    onSelectProduct(product);
    onClose();
  };

  const handleWorkshopClick = (artisanId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    saveRecentSearch(query || 'ورشة');
    if (onViewShowcase) {
      onViewShowcase(artisanId);
    } else if (onSelectArtisan) {
      onSelectArtisan(artisanId);
    }
    onClose();
  };

  const handleShowcaseClick = (item: ShowcaseItem, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    saveRecentSearch(query || item.title);
    if (onSelectShowcaseItem) {
      onSelectShowcaseItem(item);
    } else if (onViewShowcase && item.artisanId) {
      onViewShowcase(item.artisanId);
    } else {
      onSubmitSearch(item.title);
    }
    onClose();
  };

  if (!isOpen || typeof document === 'undefined') return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-start pt-4 sm:pt-14 px-3 sm:px-6">
      {/* Dark overlay backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm cursor-pointer"
        aria-hidden="true"
      />

      {/* Modal Dialog Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: -12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: -12 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="relative w-full max-w-3xl bg-[#FAF8F5] rounded-2xl sm:rounded-3xl border border-[#E6E1D3] shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh] sm:max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label="البحث الذكي في منصة يدوي"
      >
        {/* Top Search Input Bar */}
        <div className="p-3.5 sm:p-4 bg-white border-b border-[#E6E1D3]">
          <form onSubmit={handleSubmit} className="relative flex items-center">
            <Search className="w-5 h-5 text-[#254D3F] absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="ابحث عن سلعة، خامة، فاترينة، أو اسم ورشة..."
              className="w-full pr-11 pl-24 sm:pl-28 py-3 rounded-xl sm:rounded-2xl bg-[#F6F4ED] border border-transparent focus:border-[#254D3F] focus:bg-white text-sm sm:text-base text-[#1F2937] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#254D3F]/15 transition-all"
            />
            
            <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    inputRef.current?.focus();
                  }}
                  className="p-1.5 text-[#6B7280] hover:text-[#1F2937] rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
                  title="مسح النص"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              <button
                type="submit"
                className="px-3 sm:px-4 py-1.5 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                بحث
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                title="إغلاق (Esc)"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Quick Filter Tabs (Only shown when query exists and results are found) */}
          {query.trim().length > 0 && searchResults.total > 0 && (
            <div className="flex items-center gap-1.5 sm:gap-2 mt-3 overflow-x-auto pb-1 text-xs no-scrollbar">
              <button
                type="button"
                onClick={() => setActiveTab('all')}
                className={`px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                  activeTab === 'all'
                    ? 'bg-[#254D3F] text-white shadow-xs'
                    : 'bg-[#F6F4ED] text-[#4B5563] hover:bg-[#EAE6DA]'
                }`}
              >
                الكل ({searchResults.total})
              </button>
              {searchResults.products.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'products'
                      ? 'bg-[#254D3F] text-white shadow-xs'
                      : 'bg-[#F6F4ED] text-[#4B5563] hover:bg-[#EAE6DA]'
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>مشغولات للشراء ({searchResults.products.length})</span>
                </button>
              )}
              {searchResults.workshops.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('workshops')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'workshops'
                      ? 'bg-[#254D3F] text-white shadow-xs'
                      : 'bg-[#F6F4ED] text-[#4B5563] hover:bg-[#EAE6DA]'
                  }`}
                >
                  <Store className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ورش التراث ({searchResults.workshops.length})</span>
                </button>
              )}
              {searchResults.showcaseItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => setActiveTab('showcase')}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-full font-bold whitespace-nowrap transition-all cursor-pointer ${
                    activeTab === 'showcase'
                      ? 'bg-[#254D3F] text-white shadow-xs'
                      : 'bg-[#F6F4ED] text-[#4B5563] hover:bg-[#EAE6DA]'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>فاترينات وأعمال ({searchResults.showcaseItems.length})</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Body Content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-6">
          {/* STATE 1: EMPTY QUERY -> SHOW RECENT SEARCHES & TRENDING */}
          {!query.trim() && (
            <div className="space-y-6">
              {/* Recent Searches */}
              {recentSearches.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-2 text-xs font-bold text-[#4B5563]">
                      <Clock className="w-3.5 h-3.5 text-[#C97A57]" />
                      <span>آخر عمليات البحث</span>
                    </span>
                    <button
                      type="button"
                      onClick={clearAllRecent}
                      className="text-[11px] text-[#9CA3AF] hover:text-[#C97A57] transition-colors cursor-pointer"
                    >
                      مسح السجل
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((term, i) => (
                      <div
                        key={i}
                        onClick={() => handleSelectRecentOrPopular(term)}
                        className="group flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E6E1D3] hover:border-[#254D3F] hover:bg-[#254D3F]/5 text-xs text-[#1F2937] transition-all cursor-pointer shadow-2xs"
                      >
                        <Clock className="w-3 h-3 text-[#9CA3AF] group-hover:text-[#254D3F]" />
                        <span>{term}</span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="p-0.5 text-gray-300 hover:text-red-500 rounded cursor-pointer"
                          title="حذف من السجل"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular & Trending Crafts */}
              <div>
                <div className="flex items-center gap-2 mb-3 text-xs font-bold text-[#4B5563]">
                  <Flame className="w-3.5 h-3.5 text-amber-500" />
                  <span>الأكثر بحثاً في يدوي</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {POPULAR_SEARCHES.map((term, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => handleSelectRecentOrPopular(term)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E6E1D3] hover:border-[#C97A57] hover:bg-[#C97A57]/5 text-xs font-medium text-[#1F2937] transition-all cursor-pointer shadow-2xs"
                    >
                      <TrendingUp className="w-3 h-3 text-[#C97A57]" />
                      <span>{term}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Heritage Discovery Tags */}
              <div className="p-4 rounded-2xl bg-[#254D3F]/5 border border-[#254D3F]/10">
                <p className="text-xs font-bold text-[#254D3F] mb-2 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#C97A57]" />
                  <span>بحث ذكي ومخصص للتراث</span>
                </p>
                <p className="text-xs text-[#4B5563] leading-relaxed">
                  يمكنك البحث باسم المحافظة (مثل الفيوم، الجمالية، أسوان، سيوة)، أو باسم الخامة (طين أسواني، نحاس أحمر، صدف بحري)، أو باسم الورشة الحرفية مباشرة.
                </p>
              </div>
            </div>
          )}

          {/* STATE 2: QUERY WITH MATCHING RESULTS */}
          {query.trim() && searchResults.total > 0 && (
            <div className="space-y-6">
              
              {/* SECTION A: WORKSHOPS & HERITAGE STUDIOS (ورش التراث فقط) */}
              {(activeTab === 'all' || activeTab === 'workshops') && searchResults.workshops.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#254D3F]">
                      <Store className="w-4 h-4 text-emerald-700" />
                      <span>ورش وصناع التراث ({searchResults.workshops.length})</span>
                    </span>
                    <span className="text-[11px] text-[#6B7280]">فاترينات معتمدة</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {searchResults.workshops.map(ws => (
                      <button
                        type="button"
                        key={ws.artisanId}
                        onClick={(e) => handleWorkshopClick(ws.artisanId, e)}
                        className="w-full text-right group flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E6E1D3] hover:border-[#254D3F] hover:bg-[#254D3F]/5 active:scale-[0.98] transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#254D3F]/20"
                      >
                        <img
                          src={ws.avatar}
                          alt={ws.workshopName}
                          className="w-12 h-12 rounded-xl object-cover border border-[#E6E1D3] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-xs sm:text-sm text-[#1F2937] group-hover:text-[#254D3F] truncate">
                              <HighlightMatch text={ws.workshopName} query={query} />
                            </h4>
                          </div>
                          <p className="text-[11px] text-[#6B7280] truncate mt-0.5">
                            الصانع: <HighlightMatch text={ws.artisanName} query={query} />
                          </p>
                          <div className="flex items-center gap-2 mt-1 text-[10px] text-[#4B5563]">
                            <span className="flex items-center gap-0.5 text-emerald-700">
                              <MapPin className="w-3 h-3" />
                              <span>{ws.governorate}</span>
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-[#F6F4ED] text-[#4B5563]">
                              زيارة الفاترينة ←
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION B: PRODUCTS (مشغولات جاهزة للشراء) */}
              {(activeTab === 'all' || activeTab === 'products') && searchResults.products.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#254D3F]">
                      <Package className="w-4 h-4 text-[#C97A57]" />
                      <span>مشغولات متاحة للشراء ({searchResults.products.length})</span>
                    </span>
                    <span className="text-[11px] text-[#6B7280]">قطع أصلية ومضمونة</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {searchResults.products.map(product => (
                      <button
                        type="button"
                        key={product.id}
                        onClick={(e) => handleProductClick(product, e)}
                        className="w-full text-right group flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E6E1D3] hover:border-[#254D3F] hover:bg-[#254D3F]/5 active:scale-[0.98] transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#254D3F]/20"
                      >
                        <img
                          src={product.images?.[0]}
                          alt={product.title}
                          className="w-13 h-13 rounded-xl object-cover border border-[#E6E1D3] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs sm:text-sm text-[#1F2937] group-hover:text-[#254D3F] truncate">
                            <HighlightMatch text={product.title} query={query} />
                          </h4>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-bold text-xs text-[#C97A57]">
                              {product.price.toLocaleString()} ج.م
                            </span>
                            <span className="text-[10px] text-[#6B7280] truncate">
                              {product.artisan?.governorate}
                            </span>
                          </div>
                          {product.materials && product.materials.length > 0 && (
                            <div className="flex items-center gap-1 mt-1 overflow-hidden text-[10px] text-gray-500">
                              <Tag className="w-2.5 h-2.5 text-[#C97A57] shrink-0" />
                              <span className="truncate">{product.materials.slice(0, 2).join(' • ')}</span>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* SECTION C: SHOWCASE ITEMS (فاترينات وسوابق أعمال) */}
              {(activeTab === 'all' || activeTab === 'showcase') && searchResults.showcaseItems.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="flex items-center gap-1.5 text-xs font-bold text-[#254D3F]">
                      <Sparkles className="w-4 h-4 text-amber-500" />
                      <span>فاترينات وسوابق أعمال ({searchResults.showcaseItems.length})</span>
                    </span>
                    <span className="text-[11px] text-[#6B7280]">بورتفوليو الورش للتفصيل والطلب</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {searchResults.showcaseItems.map(item => (
                      <button
                        type="button"
                        key={item.id}
                        onClick={(e) => handleShowcaseClick(item, e)}
                        className="w-full text-right group flex items-center gap-3 p-3 rounded-2xl bg-white border border-[#E6E1D3] hover:border-[#254D3F] hover:bg-[#254D3F]/5 active:scale-[0.98] transition-all cursor-pointer shadow-xs focus:outline-none focus:ring-2 focus:ring-[#254D3F]/20"
                      >
                        <img
                          src={item.images?.[0]}
                          alt={item.title}
                          className="w-13 h-13 rounded-xl object-cover border border-[#E6E1D3] shrink-0"
                          referrerPolicy="no-referrer"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 font-bold">
                              فاترينة
                            </span>
                            <h4 className="font-bold text-xs sm:text-sm text-[#1F2937] group-hover:text-[#254D3F] truncate">
                              <HighlightMatch text={item.title} query={query} />
                            </h4>
                          </div>
                          <p className="text-[11px] text-[#4B5563] truncate mt-0.5">
                            <HighlightMatch text={item.workshopName || ''} query={query} />
                          </p>
                          {item.estimatedPriceNote && (
                            <p className="text-[10px] text-[#C97A57] font-semibold truncate mt-0.5">
                              {item.estimatedPriceNote}
                            </p>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

          {/* STATE 3: QUERY WITH ZERO LOCAL RESULTS – show Google results if available */}
          {query.trim() && searchResults.total === 0 && (
            <div className="text-center py-10 px-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-3 border border-amber-200">
                <Search className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-base text-[#1F2937] mb-1">
                لم نجد نتائج مطابقة لـ "{query}"
              </h3>
              <p className="text-xs text-[#6B7280] max-w-sm mx-auto mb-5 leading-relaxed">
                تأكد من كتابة الكلمة بشكل صحيح، أو جرّب البحث بخامة مثل (فخار، نحاس، صدف، صوف)، أو اسم ورشة، أو محافظة.
              </p>

              <div className="flex flex-wrap justify-center gap-2 max-w-md mx-auto">
                {POPULAR_SEARCHES.slice(0, 5).map((term, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelectRecentOrPopular(term)}
                    className="text-xs px-3 py-1.5 rounded-xl bg-white border border-[#E6E1D3] hover:border-[#254D3F] text-[#254D3F] font-bold cursor-pointer"
                  >
                    جرّب: {term}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECTION D: Google Search Results via Serper (always shown when query exists) */}
          {query.trim() && (serperLoading || serperResults.length > 0) && (activeTab === 'all') && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#254D3F]">
                  <Search className="w-4 h-4 text-blue-500" />
                  <span>نتائج من Google</span>
                  {isSerperAvailable() && (
                    <span className="text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-normal">مشغّل</span>
                  )}
                </span>
                <span className="text-[11px] text-[#6B7280]">بحث خارجي عن الحرف</span>
              </div>

              {serperLoading && (
                <div className="flex items-center gap-2 p-4 rounded-2xl bg-white border border-[#E6E1D3]">
                  <div className="w-4 h-4 border-2 border-[#254D3F] border-t-transparent rounded-full animate-spin shrink-0" />
                  <span className="text-xs text-[#6B7280]">جارٍ البحث في Google...</span>
                </div>
              )}

              {!serperLoading && serperResults.length > 0 && (
                <div className="space-y-2">
                  {serperResults.map((result, i) => (
                    <a
                      key={i}
                      href={result.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => saveRecentSearch(query)}
                      className="flex flex-col gap-1 p-3 rounded-2xl bg-white border border-[#E6E1D3] hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer shadow-xs group"
                    >
                      <span className="text-[11px] text-blue-500 truncate">{result.link.replace(/^https?:\/\//, '').split('/')[0]}</span>
                      <span className="font-bold text-xs sm:text-sm text-[#1F2937] group-hover:text-blue-700 leading-snug">
                        {result.title}
                      </span>
                      <span className="text-[11px] text-[#6B7280] line-clamp-2 leading-relaxed">
                        {result.snippet}
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Bar */}
        {query.trim() && (
          <div className="p-3 sm:p-4 bg-white border-t border-[#E6E1D3] flex items-center justify-between text-xs">
            <span className="text-[#6B7280]">
              تم العثور على <strong className="text-[#254D3F]">{searchResults.total}</strong> نتيجة
            </span>
            <button
              type="button"
              onClick={() => handleSubmit()}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white font-bold transition-all shadow-xs cursor-pointer"
            >
              <span>عرض جميع النتائج في سوق المشغولات</span>
              <ArrowLeft className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </motion.div>
    </div>,
    document.body
  );
};
