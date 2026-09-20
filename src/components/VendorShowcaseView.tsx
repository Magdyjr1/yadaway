import React, { useState } from 'react';
import { 
  Store, 
  Heart, 
  MapPin, 
  Share2, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Clock, 
  Edit3, 
  ShieldCheck,
  Tag,
  Camera,
  Grid2X2,
  Square
} from 'lucide-react';
import { VendorPortfolio, ShowcaseItem, UserProfile } from '../types';

interface VendorShowcaseViewProps {
  portfolio: VendorPortfolio;
  items?: ShowcaseItem[];
  currentUser?: UserProfile | null;
  onBackToBazaar?: () => void;
  onBack?: () => void;
  onSelectItem?: (item: ShowcaseItem) => void;
  onLikePortfolio?: (artisanId: string) => void;
  onLikeItem?: (itemId: string) => void;
  likedItemIds?: string[];
  isPortfolioLiked?: boolean;
  onRequestCustomOrder?: (artisanId: string, artisanName: string) => void;
  onRequestSimilar?: (item: ShowcaseItem) => void;
  onManageShowcase?: () => void;
  onOpenManager?: () => void;
  isOwner?: boolean;
}

export const VendorShowcaseView: React.FC<VendorShowcaseViewProps> = ({
  portfolio,
  items = [],
  currentUser = null,
  onBackToBazaar,
  onBack,
  onSelectItem = (_item: ShowcaseItem) => {},
  onLikePortfolio = (_artisanId: string) => {},
  onLikeItem = (_itemId: string) => {},
  likedItemIds = [],
  isPortfolioLiked = false,
  onRequestCustomOrder,
  onRequestSimilar,
  onManageShowcase,
  onOpenManager,
  isOwner: propIsOwner,
}) => {
  const [copied, setCopied] = useState(false);
  const [mobileLayout, setMobileLayout] = useState<'single' | 'double'>('double');
  const handleBack = onBackToBazaar || onBack || (() => window.history.back());
  const handleManage = onManageShowcase || onOpenManager;
  const isOwner = propIsOwner !== undefined 
    ? propIsOwner 
    : (currentUser?.role === 'artisan' && (currentUser.id === portfolio.artisanId || currentUser.workshopName === portfolio.workshopName));

  const handleCustomOrder = () => {
    if (onRequestCustomOrder) {
      onRequestCustomOrder(portfolio.artisanId, portfolio.artisanName);
    } else if (items.length > 0 && onRequestSimilar) {
      onRequestSimilar(items[0]);
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-right py-6 sm:py-10" id="vendor-showcase-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
        
        {/* Back navigation & Quick bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#4B5563] hover:text-[#254D3F] transition-colors cursor-pointer bg-white px-3.5 py-2 rounded-xl border border-[#EAE6DC] shadow-2xs"
          >
            <ArrowRight className="w-4 h-4" />
            <span>العودة إلى سوق الفاترينات</span>
          </button>

          {isOwner && handleManage && (
            <button
              onClick={handleManage}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs sm:text-sm font-bold shadow-2xs transition-all cursor-pointer"
            >
              <Edit3 className="w-4 h-4 text-[#C97A57]" />
              <span>إدارة وتعديل فاترينتي</span>
            </button>
          )}
        </div>

        {/* Hero Cover & Creator Profile Card (Behance Profile Style) */}
        <div className="bg-white rounded-3xl border border-[#EAE6DC] overflow-hidden shadow-sm relative">
          {/* Panoramic Workshop Cover */}
          <div className="h-44 sm:h-60 md:h-72 w-full relative bg-stone-900 overflow-hidden">
            <img
              src={portfolio.coverImage}
              alt={portfolio.workshopName}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
            
            {/* Top actions */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <button
                onClick={handleShare}
                className="px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-stone-800 text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copied ? 'تم النسخ!' : 'مشاركة'}</span>
              </button>

              <button
                onClick={() => onLikePortfolio(portfolio.artisanId)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs ${
                  isPortfolioLiked
                    ? 'bg-[#C97A57] text-white shadow-sm ring-2 ring-white/40'
                    : 'bg-white/90 hover:bg-white text-stone-800 hover:text-[#C97A57]'
                }`}
                title={isPortfolioLiked ? 'إلغاء الإعجاب بالفاترينة' : 'إعجاب بالفاترينة'}
              >
                <Heart className={`w-3.5 h-3.5 transition-transform ${isPortfolioLiked ? 'fill-current scale-110' : ''}`} />
                <span className="font-mono">{portfolio.likesCount.toLocaleString('ar-EG')}</span>
              </button>
            </div>
          </div>

          {/* Profile Details Bar */}
          <div className="px-6 sm:px-8 pb-6 sm:pb-8 pt-2 relative">
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-5 mb-6">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-right">
                {/* Avatar with negative margin over cover photo */}
                <div className="-mt-14 sm:-mt-16 shrink-0 relative z-10">
                  <img
                    src={portfolio.avatar}
                    alt={portfolio.artisanName}
                    className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-lg bg-white"
                  />
                </div>

                {/* Workshop Name & Meta - Generously spaced away from the cover background */}
                <div className="space-y-1.5 pt-3 sm:pt-6">
                  <div className="flex items-center justify-center sm:justify-start gap-2.5 flex-wrap">
                    <h1 className="font-display font-black text-2xl sm:text-3xl text-[#1F2937] tracking-tight">
                      {portfolio.workshopName}
                    </h1>
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#254D3F]/10 text-[#254D3F]">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>فاترينة موثقة</span>
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm font-semibold text-[#C97A57]">
                    بإشراف الصانع: {portfolio.artisanName} • {portfolio.category}
                  </p>

                  <div className="flex items-center justify-center sm:justify-start gap-3 text-xs text-[#6B7280] pt-1">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#254D3F]" />
                      <span>{portfolio.governorate}</span>
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Camera className="w-3.5 h-3.5 text-[#6B7280]" />
                      <span>{items.length} قطع في المعرض</span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-center sm:justify-end gap-3 shrink-0 pt-2 md:pt-6">
                <button
                  onClick={handleCustomOrder}
                  className="px-5 py-2.5 rounded-xl bg-[#C97A57] hover:bg-[#b56847] text-white text-xs sm:text-sm font-bold shadow-2xs hover:shadow-sm transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>طلب تفصيل خاص من الورشة</span>
                </button>
              </div>
            </div>

            {/* Behance Minimalist Metrics Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-2xl bg-[#FAF8F5] border border-[#EAE6DC] mb-5">
              <div className="text-center sm:text-right px-2">
                <span className="text-[10px] text-[#6B7280] block">الأعمال المعروضة</span>
                <span className="font-mono font-bold text-sm sm:text-base text-[#1F2937]">{items.length} قطع</span>
              </div>
              <div className="text-center sm:text-right px-2 border-r border-[#EAE6DC]">
                <span className="text-[10px] text-[#6B7280] block">إجمالي الإعجابات</span>
                <span className="font-mono font-bold text-sm sm:text-base text-[#C97A57]">{portfolio.likesCount}</span>
              </div>
              <div className="text-center sm:text-right px-2 border-r border-[#EAE6DC]">
                <span className="text-[10px] text-[#6B7280] block">الحرفة الأساسية</span>
                <span className="font-bold text-xs sm:text-sm text-[#254D3F] truncate block">{portfolio.category}</span>
              </div>
              <div className="text-center sm:text-right px-2 border-r border-[#EAE6DC]">
                <span className="text-[10px] text-[#6B7280] block">التفصيل حسب الطلب</span>
                <span className="font-bold text-xs sm:text-sm text-emerald-700">
                  {portfolio.customOrdersAccepted ? '✓ متاح بالطلب' : 'معرض فقط'}
                </span>
              </div>
            </div>

            {/* Bio */}
            <div className="p-4 rounded-xl bg-white border border-[#EAE6DC]">
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                {portfolio.bio}
              </p>
            </div>
          </div>
        </div>

        {/* Gallery Section - Behance Project Grid */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#254D3F]" />
                <h2 className="font-display font-black text-lg sm:text-xl text-[#1F2937]">
                  سابقة الأعمال والمعروضات الفنية ({items.length})
                </h2>
              </div>
              <p className="text-xs text-[#6B7280] mt-0.5">
                تصفح أدق تفاصيل المشغولات بالصور، واطلب تنفيذ قطع شبيهة تناسب ذوقك ومقاساتك
              </p>
            </div>

            {/* Mobile View Switcher (1 large item vs 2 items per row) */}
            {items.length > 0 && (
              <div className="flex sm:hidden items-center justify-between bg-white px-3 py-2 rounded-2xl border border-[#EAE6DC] shadow-2xs">
                <span className="text-[11px] font-bold text-[#4B5563]">
                  طريقة العرض بالموبايل:
                </span>
                <div className="flex items-center gap-1 bg-[#FAF8F5] p-0.5 rounded-xl border border-[#EAE6DC]">
                  <button
                    type="button"
                    onClick={() => setMobileLayout('single')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      mobileLayout === 'single'
                        ? 'bg-white text-[#254D3F] shadow-xs'
                        : 'text-[#6B7280] hover:text-[#1F2937]'
                    }`}
                    aria-label="عرض عمل واحد كبير"
                  >
                    <Square className="w-3.5 h-3.5" />
                    <span>كل واحد لوحده وكبيرة</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setMobileLayout('double')}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                      mobileLayout === 'double'
                        ? 'bg-[#254D3F] text-white shadow-xs'
                        : 'text-[#6B7280] hover:text-[#1F2937]'
                    }`}
                    aria-label="عرض 2 جنب بعض"
                  >
                    <Grid2X2 className="w-3.5 h-3.5" />
                    <span>2 جنب بعض</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {items.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#EAE6DC] p-12 text-center space-y-3">
              <Store className="w-10 h-10 mx-auto text-[#C97A57] opacity-50" />
              <h3 className="font-bold text-base text-[#1F2937]">لا توجد قطع مضافة في الفاترينة حالياً</h3>
              <p className="text-xs text-[#6B7280]">سيقوم الصانع برفع صور أعماله ومقتنياته التراثية قريباً.</p>
            </div>
          ) : (
            <div className={`grid ${
              mobileLayout === 'single'
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                : 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-6'
            }`}>
              {items.map((item) => {
                const isLiked = likedItemIds.includes(item.id) || Boolean(item.likedBy && currentUser?.id && item.likedBy.includes(currentUser.id));
                return (
                  <div
                    key={item.id}
                    className="group bg-white rounded-2xl border border-[#EAE6DC] overflow-hidden hover:border-[#254D3F]/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between"
                  >
                    {/* Image Area with Behance overlay */}
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

                      {/* Status badge */}
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
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

                      {/* Like button on card */}
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

                        <span className="hidden sm:inline-block text-[11px] font-bold text-white bg-white/20 backdrop-blur-md px-2.5 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          معاينة العمل ✦
                        </span>
                      </div>
                    </div>

                    {/* Card Content - Behance Metadata */}
                    <div className="p-2.5 sm:p-4 flex-1 flex flex-col justify-between space-y-2 sm:space-y-3">
                      <div className="space-y-1 sm:space-y-1.5">
                        <h3 
                          onClick={() => onSelectItem(item)}
                          className="font-bold text-xs sm:text-[15px] text-[#1F2937] hover:text-[#254D3F] transition-colors cursor-pointer line-clamp-1 leading-snug"
                        >
                          {item.title}
                        </h3>

                        <p className="hidden sm:block text-xs text-[#6B7280] line-clamp-2 leading-relaxed font-normal">
                          {item.description}
                        </p>
                      </div>

                      {/* Card Footer Actions */}
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
                            onClick={() => onRequestSimilar ? onRequestSimilar(item) : onSelectItem(item)}
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
