import React, { useState } from 'react';
import { 
  ArrowRight, 
  Heart, 
  Share2, 
  Star, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  Truck, 
  MessageCircle, 
  Sparkles, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Check, 
  Copy,
  Info,
  Layers,
  Award,
  Store,
  Scissors,
  Send
} from 'lucide-react';
import { Product, CartItem, Review, Artisan, UserProfile } from '../types';

interface ProductDetailsViewProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onAddToCart: (product: Product, quantity: number) => void;
  onInstantBuy: (product: Product, quantity: number) => void;
  onBack: () => void;
  relatedProducts: Product[];
  onSelectProduct: (product: Product) => void;
  reviews?: Review[];
  onAddReview?: (productId: string, review: { author: string; location: string; rating: number; comment: string }) => void;
  onOpenCustomOrder?: (artisan: Artisan, product?: Product) => void;
  onSelectArtisan?: (artisan: Artisan) => void;
  currentUser?: UserProfile | null;
}

export const ProductDetailsView: React.FC<ProductDetailsViewProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onAddToCart,
  onInstantBuy,
  onBack,
  relatedProducts,
  onSelectProduct,
  reviews = [],
  onAddReview,
  onOpenCustomOrder,
  onSelectArtisan,
  currentUser = null
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copiedLink, setCopiedLink] = useState(false);
  const [addedToast, setAddedToast] = useState(false);

  // Review form state
  const [newRating, setNewRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewAuthor, setReviewAuthor] = useState(currentUser?.name || '');
  const [reviewLocation, setReviewLocation] = useState(currentUser?.governorate || 'القاهرة');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccessToast, setReviewSuccessToast] = useState(false);
  const [isAddingReview, setIsAddingReview] = useState(false);

  // Safe reviews array to prevent any TypeError
  const safeReviews = Array.isArray(reviews) ? reviews : [];
  const productReviews = safeReviews.filter(r => r && r.productId === product.id);
  const displayReviews = productReviews.length > 0 ? productReviews : safeReviews.slice(0, 3);

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2400);
  };

  const handleShare = async () => {
    const text = `تفضل بمشاهدة قطعة "${product.title}" الحرفية الأصيلة على منصة يدوي: ${window.location.href}`;
    if (navigator.share) {
      try {
        await navigator.share({ title: product.title, text, url: window.location.href });
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
      
      {/* Breadcrumb / Back Button */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-[#254D3F] hover:text-[#1A372D] transition-colors p-2 rounded-xl bg-white border border-[#E6E1D3] card-shadow cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع للمشغولات اليدوية</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShare}
            className="p-2 rounded-xl bg-white border border-[#E6E1D3] text-[#6B7280] hover:text-[#1F2937] transition-colors card-shadow"
            title="مشاركة الرابط"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            onClick={() => onToggleFavorite(product)}
            className={`px-3.5 py-2 rounded-xl border transition-all card-shadow flex items-center gap-2 cursor-pointer ${
              isFavorite
                ? 'bg-[#C97A57] border-[#C97A57] text-white shadow-md'
                : 'bg-white border-[#E6E1D3] text-[#6B7280] hover:text-[#C97A57]'
            }`}
            title={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
          >
            <Heart className={`w-4 h-4 transition-transform ${isFavorite ? 'fill-white text-white scale-110' : 'text-[#6B7280]'}`} />
            <span className="text-xs font-bold">
              {isFavorite ? 'محفوظ بالمفضلة' : 'حفظ بالمفضلة'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">
        
        {/* Left / Right 1: Product Imagery Gallery (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Main Hero Photo */}
          <div className="relative aspect-4/3 w-full rounded-3xl overflow-hidden bg-[#EAE6DC] border border-[#E6E1D3] card-shadow-md">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />

            {/* Unique Handcrafted Badge */}
            {product.isUniquePiece && (
              <div className="absolute top-4 right-4 bg-[#254D3F] text-[#F6F4ED] text-xs font-bold px-3 py-1 rounded-full shadow-sm flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C97A57]" />
                <span>قطعة فريدة واحدة فقط</span>
              </div>
            )}

            {/* Crafting Time Pill */}
            <div className="absolute bottom-4 right-4 bg-black/60 backdrop-blur-xs text-white text-xs font-medium px-3 py-1 rounded-lg flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#C97A57]" />
              <span>مدة الصنع اليدوي: {product.craftingTimeDays} أيام</span>
            </div>
          </div>

          {/* Thumbnails Row */}
          {product.images.length > 1 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                    selectedImageIndex === idx
                      ? 'border-[#254D3F] ring-2 ring-[#254D3F]/20 scale-102'
                      : 'border-[#E6E1D3] hover:border-[#254D3F]/50 opacity-75 hover:opacity-100'
                  }`}
                >
                  <img
                    src={img}
                    alt={`صورة ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Guarantee & Craftsmanship Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#254D3F]/10 text-[#254D3F] flex items-center justify-center shrink-0">
                <Award className="w-5 h-5 text-[#254D3F]" />
              </div>
              <div>
                <h4 className="font-bold text-xs sm:text-sm text-[#1F2937]">صناعة مصرية حرفية أصيلة</h4>
                <p className="text-[11px] text-[#6B7280]">تم فحص الجودة والتأكد من المواد الطبيعية المستخدمة</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-[#254D3F] font-bold">
              <Truck className="w-4 h-4 text-[#C97A57]" />
              <span>تغليف آمن ضد الكسر والخدش</span>
            </div>
          </div>

        </div>

        {/* Right 2: Product Info, Artisan & Purchase Actions (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-between space-y-6">
          
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#254D3F]/10 text-[#254D3F]">
                {product.category === 'pottery' ? 'فخار وخزف' : 
                 product.category === 'wood' ? 'أرابيسك وخشب' :
                 product.category === 'crochet' ? 'كروشيه وتطريز' :
                 product.category === 'copper' ? 'نحاس ومعادن' :
                 product.category === 'leather' ? 'جلود طبيعية' : 'سجاد وكليم'}
              </span>

              <div className="flex items-center gap-1.5 text-xs text-[#6B7280]">
                <div className="flex items-center text-[#F59E0B]">
                  <Star className="w-4 h-4 fill-[#F59E0B]" />
                  <span className="font-bold text-[#1F2937] mr-1">{product.rating}</span>
                </div>
                <span>({product.reviewCount} تقييم مشترين حقيقيين)</span>
              </div>
            </div>

            {/* Product Title */}
            <h1 className="font-display font-black text-2xl sm:text-3xl text-[#1F2937] leading-tight mb-3">
              {product.title}
            </h1>

            {/* Price Box with Custom Deposit Support */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow mb-6 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-[#6B7280] font-medium block mb-0.5">
                    {product.isCustomOrder ? 'سعر القطعة الإجمالي:' : 'السعر بالجنيه المصري:'}
                  </span>
                  <div className="flex items-baseline gap-2">
                    <span className="font-mono text-3xl font-black text-[#1F2937]">
                      {product.price.toLocaleString('ar-EG')}
                    </span>
                    <span className="text-sm font-bold text-[#6B7280]">ج.م</span>
                    {product.originalPrice && (
                      <span className="text-sm text-[#9CA3AF] line-through font-mono">
                        {product.originalPrice.toLocaleString('ar-EG')} ج.م
                      </span>
                    )}
                  </div>
                </div>

                <div className="text-left">
                  {product.isCustomOrder ? (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-[#C97A57]/15 text-[#C97A57] border border-[#C97A57]/30 block">
                      تفصيل بالطلب (Custom)
                    </span>
                  ) : (
                    <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 block">
                      متوفر جاهز للشحن ({product.stock} قطع)
                    </span>
                  )}
                </div>
              </div>

              {/* Custom Order Deposit Breakdown & Escrow Notice */}
              {product.isCustomOrder && product.requiredDeposit && (
                <div className="pt-3 border-t border-[#E6E1D3] space-y-2">
                  <div className="grid grid-cols-2 gap-2 bg-[#F6F4ED] p-3 rounded-xl border border-[#E6E1D3]/80 text-xs">
                    <div>
                      <span className="text-[#6B7280] block text-[11px]">العربون المطلوب للتنفيذ:</span>
                      <span className="font-mono font-black text-sm text-[#C97A57]">
                        {product.requiredDeposit.toLocaleString('ar-EG')} ج.م
                      </span>
                      <span className="text-[10px] text-[#254D3F] font-bold block mt-0.5">
                        (يُدفع إلكترونياً ويُحفظ بالضمان)
                      </span>
                    </div>
                    <div>
                      <span className="text-[#6B7280] block text-[11px]">المتبقي عند المعاينة:</span>
                      <span className="font-mono font-black text-sm text-[#1F2937]">
                        {(product.price - product.requiredDeposit).toLocaleString('ar-EG')} ج.م
                      </span>
                      <span className="text-[10px] text-[#6B7280] block mt-0.5">
                        (بعد استلامك وفحص القطعة)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-[#254D3F] bg-[#254D3F]/5 p-2.5 rounded-xl border border-[#254D3F]/15">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-[#254D3F]" />
                    <span>
                      <strong>حماية يدوي (Escrow):</strong> عربونك محفوظ بأمان في المنصة، ولا يتم تحويله للورشة إلا بعد استلامك للمشغولة ومطابقتها للمواصفات.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="font-bold text-sm text-[#1F2937] mb-1.5">عن هذه المشغولة:</h3>
              <p className="text-xs sm:text-sm text-[#4B5563] leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Materials & Specs Pills */}
            <div className="p-4 rounded-2xl bg-[#EAE6DC]/50 border border-[#E6E1D3] mb-6 space-y-3">
              <div>
                <span className="text-xs font-bold text-[#254D3F] block mb-1.5 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  <span>الخامات الطبيعية المستخدمة:</span>
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {product.materials.map((mat, i) => (
                    <span
                      key={i}
                      className="text-xs bg-white text-[#1F2937] px-2.5 py-1 rounded-lg border border-[#E6E1D3] font-medium"
                    >
                      {mat}
                    </span>
                  ))}
                </div>
              </div>

              {product.dimensions && (
                <div className="flex items-center justify-between text-xs text-[#6B7280] pt-2 border-t border-[#E6E1D3]/80">
                  <span className="font-bold">المقاسات والأبعاد:</span>
                  <span className="font-medium text-[#1F2937]">{product.dimensions}</span>
                </div>
              )}

              {product.weight && (
                <div className="flex items-center justify-between text-xs text-[#6B7280]">
                  <span className="font-bold">الوزن التقريبي:</span>
                  <span className="font-medium text-[#1F2937]">{product.weight}</span>
                </div>
              )}
            </div>

            {/* The Story Behind The Piece */}
            {product.story && (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 mb-6">
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 mb-1">
                  <Sparkles className="w-3.5 h-3.5 text-[#C97A57]" />
                  <span>قصة القطعة من ورشة الصانع:</span>
                </div>
                <p className="text-xs text-stone-700 leading-relaxed italic">
                  "{product.story}"
                </p>
              </div>
            )}

            {/* Artisan Profile Snippet & WhatsApp Direct Contact */}
            <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#E6E1D3] card-shadow mb-6">
              <span className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider block mb-3">
                صُنع في ورشة:
              </span>

              <div 
                onClick={() => onSelectArtisan(product.artisan)}
                className="flex items-center gap-3 mb-3 p-2 -mx-2 rounded-xl hover:bg-[#F6F4ED] transition-colors cursor-pointer group"
                title="اضغط لزيارة صفحة ورشة الصانع"
              >
                <img
                  src={product.artisan.avatar}
                  alt={product.artisan.name}
                  className="w-13 h-13 rounded-2xl object-cover border-2 border-[#254D3F] group-hover:scale-105 transition-transform"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-display font-bold text-base text-[#1F2937] group-hover:text-[#254D3F] transition-colors">
                      {product.artisan.name}
                    </h4>
                    <span className="text-[11px] text-[#C97A57] font-bold flex items-center gap-1">
                      <Store className="w-3.5 h-3.5" />
                      <span>عرض الورشة</span>
                    </span>
                  </div>
                  <p className="text-xs text-[#254D3F] font-semibold">{product.artisan.title}</p>
                  <p className="text-[11px] text-[#6B7280] flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#C97A57]" />
                    <span>{product.artisan.location} ({product.artisan.governorate})</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons & Platform Guarantee */}
              <div className="space-y-2 pt-2 border-t border-[#E6E1D3]">
                <button
                  type="button"
                  onClick={() => onOpenCustomOrder(product.artisan, product)}
                  className="w-full py-2.5 px-3 rounded-xl bg-[#C97A57] hover:bg-[#B36846] text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Scissors className="w-3.5 h-3.5" />
                  <span>طلب تفصيل خاص / مقاس أو حفر اسم عبر المنصة</span>
                </button>

                <div className="flex items-center gap-2 p-2 rounded-xl bg-[#254D3F]/5 border border-[#254D3F]/15 text-[11px] text-[#254D3F]">
                  <ShieldCheck className="w-4 h-4 shrink-0 text-[#254D3F]" />
                  <span>جميع المعاملات والتسليم تتم بضمان <strong>يدوي</strong> وشركة الشحن المعتمدة دون مشاركة أرقام شخصية.</span>
                </div>
              </div>
            </div>

            {/* Quantity Selector & Action Buttons */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-[#1F2937]">الكمية:</span>
                <div className="flex items-center border border-[#E6E1D3] bg-white rounded-xl overflow-hidden card-shadow">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-[#F6F4ED] text-[#1F2937] transition-colors"
                    aria-label="إنقاص الكمية"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-mono font-bold text-sm px-4 text-[#1F2937]">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                    className="p-2 hover:bg-[#F6F4ED] text-[#1F2937] transition-colors"
                    aria-label="زيادة الكمية"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <span className="text-[11px] text-[#6B7280]">
                  (المتبقي: {product.stock} قطع)
                </span>
              </div>

              {/* Add to Cart in Terracotta (#C97A57) */}
              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  id="add-to-cart-btn"
                  onClick={handleAddToCart}
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-xl bg-[#C97A57] hover:bg-[#B36846] text-white font-bold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <span>أضف إلى السلة ({(product.price * quantity).toLocaleString('ar-EG')} ج.م)</span>
                </button>

                <button
                  onClick={() => onInstantBuy(product, quantity)}
                  className="w-full sm:w-auto py-3.5 px-6 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white font-bold text-sm sm:text-base shadow-md transition-all active:scale-98 cursor-pointer"
                >
                  <span>شراء فوري</span>
                </button>
              </div>

              {addedToast && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fadeIn">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>تمت إضافة القطعة إلى سلتك بنجاح!</span>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* Customer Reviews Section */}
      <section className="mb-16 border-t border-[#E6E1D3] pt-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h3 className="font-display font-black text-xl sm:text-2xl text-[#1F2937]">
              تقييمات وتجارب المشترين ({productReviews.length > 0 ? productReviews.length : product.reviewCount})
            </h3>
            <p className="text-xs text-[#6B7280]">
              آراء حقيقية من مقتني هذه القطعة اليدوية من ورشة {product.artisan.name}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white border border-[#E6E1D3] card-shadow">
              <Star className="w-5 h-5 fill-[#F59E0B] text-[#F59E0B]" />
              <span className="font-bold text-base text-[#1F2937]">{product.rating}</span>
              <span className="text-xs text-[#6B7280]">/ 5.0</span>
            </div>

            <button
              onClick={() => setIsAddingReview(!isAddingReview)}
              className="px-4 py-2 rounded-xl bg-[#254D3F] hover:bg-[#1A372D] text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#C97A57]" />
              <span>{isAddingReview ? 'إلغاء' : 'أضف تقييمك ورأيك'}</span>
            </button>
          </div>
        </div>

        {/* Add Review Box */}
        {isAddingReview && (
          <div className="p-6 rounded-3xl bg-white border border-[#254D3F]/30 card-shadow-md mb-8 animate-fadeIn">
            <h4 className="font-display font-bold text-base text-[#1F2937] mb-2 flex items-center gap-2">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>أضف تقييمك ورأيك في هذه القطعة اليدوية</span>
            </h4>
            <p className="text-xs text-[#6B7280] mb-4">
              شاركنا رأيك حول جودة الخامة، دقة المقاس، التغليف وحرفية الصانع لمساعدة الآخرين.
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!reviewAuthor || !reviewComment) return;
                onAddReview(product.id, {
                  author: reviewAuthor,
                  location: reviewLocation,
                  rating: newRating,
                  comment: reviewComment
                });
                setReviewComment('');
                setIsAddingReview(false);
                setReviewSuccessToast(true);
                setTimeout(() => setReviewSuccessToast(false), 3000);
              }}
              className="space-y-4"
            >
              {/* Interactive Star Picker */}
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1.5">
                  التقييم بالنجوم:
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="p-1 text-2xl cursor-pointer transition-transform hover:scale-115"
                      title={`${star} من 5 نجوم`}
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          (hoverRating || newRating) >= star
                            ? 'fill-[#F59E0B] text-[#F59E0B]'
                            : 'text-gray-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-[#254D3F] mr-2">
                    ({hoverRating || newRating} نجوم من 5)
                  </span>
                </div>
              </div>

              {/* Author & Location Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    اسمك:
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="مثال: مريم الألفي"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4ED] border border-[#E6E1D3] text-xs text-[#1F2937] focus:outline-none focus:border-[#254D3F]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1F2937] mb-1">
                    المحافظة / المدينة:
                  </label>
                  <input
                    type="text"
                    required
                    value={reviewLocation}
                    onChange={(e) => setReviewLocation(e.target.value)}
                    placeholder="مثال: المعادي، القاهرة"
                    className="w-full px-3 py-2 rounded-xl bg-[#F6F4ED] border border-[#E6E1D3] text-xs text-[#1F2937] focus:outline-none focus:border-[#254D3F]"
                  />
                </div>
              </div>

              {/* Review Textarea */}
              <div>
                <label className="block text-xs font-bold text-[#1F2937] mb-1">
                  رأيك وتجربتك بالتفصيل:
                </label>
                <textarea
                  rows={3}
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="كيف وجدت القطعة اليدوية على الحقيقة؟ هل الخامات والتغليف كانا ممتازين؟"
                  className="w-full px-3 py-2 rounded-xl bg-[#F6F4ED] border border-[#E6E1D3] text-xs text-[#1F2937] focus:outline-none focus:border-[#254D3F]"
                />
              </div>

              {/* Submit */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddingReview(false)}
                  className="px-4 py-2 rounded-xl border border-[#E6E1D3] text-xs font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#C97A57] hover:bg-[#B36846] text-white text-xs font-bold shadow-sm transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>نشر التقييم فوراً</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {reviewSuccessToast && (
          <div className="p-3 mb-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold text-center flex items-center justify-center gap-2 animate-fadeIn">
            <Check className="w-4 h-4 text-emerald-600" />
            <span>شكراً لمشاركتك! تمت إضافة تقييمك ودعمك للصانع بنجاح.</span>
          </div>
        )}

        {/* Reviews Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayReviews.map((rev) => (
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
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#1F2937]">{rev.author}</span>
                  {rev.verifiedBuyer && (
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.2 rounded font-medium border border-emerald-200">
                      مشترٍ مؤكد
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-[#6B7280]">{rev.location}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-[#E6E1D3] pt-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-black text-xl text-[#1F2937]">
              مشغولات يدوية أخرى قد تنال إعجابك
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((rel) => (
              <div
                key={rel.id}
                onClick={() => {
                  onSelectProduct(rel);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="bg-white rounded-2xl border border-[#E6E1D3] overflow-hidden card-shadow hover:shadow-md transition-all cursor-pointer"
              >
                <div className="aspect-4/3 w-full bg-[#EAE6DC] overflow-hidden">
                  <img
                    src={rel.images[0]}
                    alt={rel.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-3.5">
                  <span className="text-[11px] text-[#254D3F] font-semibold block mb-1">
                    {rel.artisan.name}
                  </span>
                  <h4 className="font-display font-bold text-sm text-[#1F2937] line-clamp-1 mb-2">
                    {rel.title}
                  </h4>
                  <div className="flex items-baseline justify-between">
                    <span className="font-mono text-base font-black text-[#1F2937]">
                      {rel.price.toLocaleString('ar-EG')} ج.م
                    </span>
                    <span className="text-xs text-[#C97A57] font-bold">عرض التفاصيل</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
