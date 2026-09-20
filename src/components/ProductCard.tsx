import React from 'react';
import { Heart, Star, Sparkles, Plus, Clock, MapPin } from 'lucide-react';
import { Product, Artisan } from '../types';

interface ProductCardProps {
  product: Product;
  isFavorite: boolean;
  onToggleFavorite: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onSelectArtisan?: (artisan: Artisan, e: React.MouseEvent) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  isFavorite,
  onToggleFavorite,
  onSelectProduct,
  onAddToCart,
  onSelectArtisan,
}) => {
  return (
    <div
      onClick={() => onSelectProduct(product)}
      className="group bg-white rounded-2xl border border-[#E6E1D3] overflow-hidden card-shadow hover:border-[#254D3F]/40 hover:shadow-lg transition-all duration-300 flex flex-col justify-between cursor-pointer text-right"
    >
      {/* Product Image & Badges */}
      <div className="relative aspect-4/3 w-full bg-[#EAE6DC] overflow-hidden">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
        />

        {/* Pure Wishlist Favorite Heart Button (No Social Like Counter) */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite(product);
          }}
          aria-label={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
          title={isFavorite ? 'إزالة من المفضلة' : 'حفظ في المفضلة'}
          className={`absolute top-2.5 left-2.5 sm:top-3 sm:left-3 w-7 h-7 sm:w-8 sm:h-8 rounded-full backdrop-blur-xs flex items-center justify-center shadow-xs hover:scale-110 active:scale-95 transition-all z-10 cursor-pointer ${
            isFavorite
              ? 'bg-[#C97A57] text-white shadow-sm ring-2 ring-white/60'
              : 'bg-white/90 text-[#6B7280] hover:text-[#C97A57] hover:bg-white'
          }`}
        >
          <Heart
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${
              isFavorite
                ? 'fill-white text-white scale-110'
                : 'text-[#6B7280]'
            }`}
          />
        </button>

        {/* Unique Piece / Handcrafted Badge */}
        <div className="absolute top-2.5 right-2.5 sm:top-3 sm:right-3 flex flex-col gap-1 z-10">
          {product.isUniquePiece && (
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[11px] font-bold bg-[#254D3F] text-[#F6F4ED] shadow-xs">
              قطعة فريدة
            </span>
          )}
          {product.stock <= 3 && product.stock > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold bg-[#C97A57] text-white shadow-xs">
              متبقي {product.stock} فقط
            </span>
          )}
        </div>

        {/* Crafting Time Pill */}
        <div className="absolute bottom-2 right-2 sm:bottom-2.5 sm:right-2.5 bg-black/60 backdrop-blur-xs text-white text-[9px] sm:text-[11px] font-medium px-1.5 sm:px-2 py-0.5 rounded-md flex items-center gap-1">
          <Clock className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#C97A57]" />
          <span>صنع يدوي: {product.craftingTimeDays} أيام</span>
        </div>
      </div>

      {/* Card Content Details */}
      <div className="p-3 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Artisan & Location */}
          <div className="flex items-center justify-between text-[11px] sm:text-xs text-[#6B7280] mb-1 sm:mb-1.5">
            <span 
              onClick={(e) => {
                if (onSelectArtisan) {
                  e.stopPropagation();
                  onSelectArtisan(product.artisan, e);
                }
              }}
              className="font-semibold text-[#254D3F] hover:text-[#C97A57] hover:underline flex items-center gap-1 transition-colors truncate max-w-[65%]"
              title={`زيارة ورشة الصانع ${product.artisan.name}`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#254D3F] shrink-0" />
              <span className="truncate">{product.artisan.name}</span>
            </span>
            <span className="flex items-center gap-0.5 text-[10px] sm:text-[11px] text-[#9CA3AF] shrink-0">
              <MapPin className="w-3 h-3 text-[#C97A57]" />
              <span>{product.artisan.governorate}</span>
            </span>
          </div>

          {/* Product Title */}
          <h3 className="font-display font-bold text-xs sm:text-base text-[#1F2937] leading-snug line-clamp-2 group-hover:text-[#254D3F] transition-colors mb-1.5 sm:mb-2">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 text-[11px] sm:text-xs text-[#6B7280] mb-2 sm:mb-3">
            <div className="flex items-center text-[#F59E0B]">
              <Star className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-[#F59E0B]" />
              <span className="font-bold text-[#1F2937] mr-1">{product.rating}</span>
            </div>
            <span className="text-[10px] sm:text-xs">({product.reviewCount})</span>
          </div>
        </div>

        {/* Price & Action Button */}
        <div className="pt-2 sm:pt-3 border-t border-[#E6E1D3] flex items-center justify-between gap-1.5 sm:gap-2">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-sm sm:text-lg font-black text-[#1F2937]">
                {product.price.toLocaleString('ar-EG')}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-[#6B7280]">ج.م</span>
            </div>
            {product.originalPrice && (
              <span className="text-[10px] sm:text-xs text-[#9CA3AF] line-through font-mono">
                {product.originalPrice.toLocaleString('ar-EG')} ج.م
              </span>
            )}
          </div>

          {/* Quick Add to Cart Button in Terracotta */}
          <button
            onClick={(e) => onAddToCart(product, e)}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-[#C97A57] hover:bg-[#B36846] text-white text-[11px] sm:text-xs font-bold transition-all shadow-xs active:scale-95 cursor-pointer shrink-0"
            aria-label="أضف إلى السلة"
          >
            <Plus className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            <span className="hidden xs:inline">أضف للسلة</span>
          </button>
        </div>
      </div>
    </div>
  );
};
