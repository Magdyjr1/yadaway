import React, { useState } from 'react';
import { 
  X, 
  Heart, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  MapPin, 
  Clock, 
  Layers, 
  Share2, 
  CheckCircle2, 
  Store,
  Info,
  ShieldCheck,
  Tag
} from 'lucide-react';
import { ShowcaseItem, VendorPortfolio } from '../types';

interface ShowcaseDetailModalProps {
  item: ShowcaseItem | null;
  portfolio?: VendorPortfolio | null;
  isOpen?: boolean;
  onClose: () => void;
  onLikeItem?: (itemId: string) => void;
  onLike?: (itemId: string) => void;
  isLiked?: boolean;
  onRequestSimilar: (item: ShowcaseItem) => void;
  onViewVendorShowcase?: (artisanId: string) => void;
  onViewPortfolio?: (artisanId: string) => void;
}

export const ShowcaseDetailModal: React.FC<ShowcaseDetailModalProps> = ({
  item,
  portfolio,
  isOpen = true,
  onClose,
  onLikeItem,
  onLike,
  isLiked = false,
  onRequestSimilar,
  onViewVendorShowcase,
  onViewPortfolio,
}) => {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleLike = onLikeItem || onLike || (() => {});
  const handleViewVendor = onViewVendorShowcase || onViewPortfolio || (() => {});

  if (!isOpen || !item) return null;

  const images = item.images && item.images.length > 0 ? item.images : ['https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=800&q=80'];

  const nextImage = () => {
    setActiveImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setActiveImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] overflow-y-auto border border-[#E6E1D3] card-shadow-lg text-right relative my-auto animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
        id="showcase-detail-modal"
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-md px-5 sm:px-6 py-3.5 border-b border-[#E6E1D3] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#254D3F]/10 text-[#254D3F] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-[#C97A57]" />
              <span>فاترينة الأعمال التراثية</span>
            </span>
            {item.status === 'repeatable' ? (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>متاح تنفيذ شبيهة بالطلب</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200 flex items-center gap-1">
                <Info className="w-3 h-3" />
                <span>سابقة أعمال للعرض والتوثيق</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-[#E6E1D3] text-[#4B5563] hover:text-[#254D3F] hover:bg-[#F6F4ED] transition-colors cursor-pointer text-xs font-bold flex items-center gap-1"
              title="مشاركة رابط القطعة"
            >
              <Share2 className="w-4 h-4" />
              <span className="hidden sm:inline">{copied ? 'تم النسخ!' : 'مشاركة'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-5 sm:p-7 space-y-6">
          {/* Top Gallery - Up to 8 Images */}
          <div className="space-y-3">
            <div className="relative aspect-4/3 sm:aspect-16/10 rounded-2xl overflow-hidden bg-stone-900 border border-[#E6E1D3] shadow-inner group">
              <img
                src={images[activeImageIndex]}
                alt={item.title}
                className="w-full h-full object-contain sm:object-cover transition-all duration-300"
              />

              {/* Navigation arrows for images */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={prevImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer group-hover:scale-105"
                    aria-label="الصورة السابقة"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                  <button
                    onClick={nextImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition-all cursor-pointer group-hover:scale-105"
                    aria-label="الصورة التالية"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                </>
              )}

              {/* Counter Badge */}
              <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-xs font-mono font-bold">
                {activeImageIndex + 1} / {images.length} صورة
              </div>

              {/* Heart like button on image */}
              <button
                onClick={() => handleLike(item.id)}
                title={isLiked ? 'إلغاء الإعجاب' : 'إعجاب بالقطعة'}
                className={`absolute top-3 left-3 px-3 py-1.5 rounded-xl backdrop-blur-md flex items-center gap-1.5 text-xs font-bold transition-transform active:scale-90 cursor-pointer ${
                  isLiked
                    ? 'bg-rose-500 text-white shadow-rose-500/30 shadow-md ring-2 ring-white/50'
                    : 'bg-white/90 text-gray-700 hover:text-rose-500 shadow-sm'
                }`}
              >
                <Heart className={`w-4 h-4 transition-transform ${isLiked ? 'fill-current scale-110' : ''}`} />
                <span>{item.likesCount.toLocaleString('ar-EG')}</span>
              </button>
            </div>

            {/* Thumbnail Row */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-[#254D3F] ring-2 ring-[#254D3F]/30 scale-105'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt={`${item.title} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            {/* Main Info */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h2 className="font-display font-black text-xl sm:text-2xl text-[#1F2937] leading-snug">
                  {item.title}
                </h2>
                {item.estimatedPriceNote && (
                  <p className="text-sm font-bold text-[#C97A57] mt-1 flex items-center gap-1.5">
                    <Tag className="w-4 h-4" />
                    <span>ملاحظة السعر: {item.estimatedPriceNote}</span>
                  </p>
                )}
              </div>

              {/* Description */}
              <div className="p-4 rounded-2xl bg-[#F6F4ED]/80 border border-[#E6E1D3] space-y-2">
                <h4 className="text-xs font-bold text-[#1F2937] flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#254D3F]" />
                  <span>قصة وتفاصيل صناعة القطعة:</span>
                </h4>
                <p className="text-sm text-[#4B5563] leading-relaxed whitespace-pre-line">
                  {item.description}
                </p>
              </div>

              {/* Materials */}
              {item.materials && item.materials.length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-[#1F2937]">المكونات والخامات المستخدمة:</h4>
                  <div className="flex flex-wrap gap-2">
                    {item.materials.map((mat, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-xl bg-white border border-[#E6E1D3] text-xs font-medium text-[#4B5563]"
                      >
                        {mat}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Crafting Time note */}
              {item.estimatedCraftDays && (
                <div className="flex items-center gap-2 text-xs text-[#6B7280]">
                  <Clock className="w-4 h-4 text-[#C97A57]" />
                  <span>متوسط مدة الصنع اليدوي: <strong>{item.estimatedCraftDays} يوماً</strong></span>
                </div>
              )}
            </div>

            {/* Artisan Sidebar Card & Request CTA */}
            <div className="space-y-4">
              <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow space-y-4">
                <div className="flex items-center gap-3">
                  <img
                    src={item.artisanAvatar || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
                    alt={item.artisanName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#254D3F]"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-[#1F2937]">
                      {item.artisanName}
                    </h3>
                    <p className="text-xs text-[#C97A57] font-semibold">
                      {item.workshopName || 'ورشة تراثية معتمدة'}
                    </p>
                    <div className="flex items-center gap-1 text-[11px] text-[#6B7280] mt-0.5">
                      <MapPin className="w-3 h-3 text-[#254D3F]" />
                      <span>{item.artisanGovernorate || 'مصر'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#E6E1D3]">
                  <button
                    onClick={() => {
                      onClose();
                      handleViewVendor(item.artisanId);
                    }}
                    className="w-full py-2.5 rounded-xl border border-[#254D3F]/30 text-[#254D3F] hover:bg-[#254D3F]/5 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Store className="w-4 h-4" />
                    <span>تصفح فاترينة الصانع كاملة</span>
                  </button>
                </div>
              </div>

              {/* Request Custom Order Button */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-[#254D3F] to-[#1A372D] text-white space-y-3 card-shadow-lg">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-[#E6E1D3] mb-1">
                    <Sparkles className="w-4 h-4 text-[#C97A57]" />
                    <span>تفصيل مخصص بالطلب</span>
                  </div>
                  <h4 className="font-bold text-base leading-tight">
                    أعجبتك القطعة وتريد شبيهاً لها؟
                  </h4>
                  <p className="text-[11px] text-[#A3B8B0] mt-1 leading-relaxed">
                    لا يوجد شراء مباشر فوري؛ يمكنك طلب تنفيذ قطعة بمقاساتك ونقوشك المفضلة مع حماية كاملة للعربون عبر نظام الضمان (Escrow).
                  </p>
                </div>

                <button
                  onClick={() => {
                    onClose();
                    onRequestSimilar(item);
                  }}
                  className="w-full py-3 rounded-xl bg-[#C97A57] hover:bg-[#b56847] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>اطلب قطعة شبيهة الآن</span>
                </button>

                <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#A3B8B0]">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span>عربونك في أمان تام حتى تستلم القطعة وتوافق عليها</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
