import React from 'react';
import { Heart, ArrowRight, ShoppingBag } from 'lucide-react';
import { Product } from '../types';
import { ProductCard } from './ProductCard';

interface FavoritesViewProps {
  favoriteProducts: Product[];
  onToggleFavorite: (product: Product) => void;
  onSelectProduct: (product: Product) => void;
  onAddToCart: (product: Product, e: React.MouseEvent) => void;
  onBackToShopping: () => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({
  favoriteProducts,
  onToggleFavorite,
  onSelectProduct,
  onAddToCart,
  onBackToShopping
}) => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-right">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6 pb-3 border-b border-[#E6E1D3]">
        <div>
          <button
            onClick={onBackToShopping}
            className="inline-flex items-center gap-2 text-xs font-bold text-[#254D3F] hover:text-[#1A372D] mb-2 p-1.5 rounded-lg bg-white border border-[#E6E1D3]"
          >
            <ArrowRight className="w-3.5 h-3.5" />
            <span>العودة للرئيسية</span>
          </button>
          <div className="flex items-center gap-2">
            <Heart className="w-6 h-6 fill-[#C97A57] text-[#C97A57]" />
            <h1 className="font-display font-black text-2xl text-[#1F2937]">
              مشغولاتي المفضلة ({favoriteProducts.length})
            </h1>
          </div>
          <p className="text-xs text-[#6B7280]">
            القطع التي أعجبتك وحفظتها للرجوع إليها لاحقاً
          </p>
        </div>
      </div>

      {favoriteProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {favoriteProducts.map((prod) => (
            <ProductCard
              key={prod.id}
              product={prod}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              onSelectProduct={onSelectProduct}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-3xl border border-[#E6E1D3] p-8 max-w-md mx-auto card-shadow">
          <div className="w-14 h-14 rounded-2xl bg-[#F7ECE6] text-[#C97A57] flex items-center justify-center mx-auto mb-3">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-display font-bold text-lg text-[#1F2937] mb-1">
            لا توجد مشغولات في المفضلة بعد
          </h3>
          <p className="text-xs text-[#6B7280] mb-5">
            اضغط على علامة القلب في أي منتج يعجبك لحفظه هنا ومتابعته
          </p>
          <button
            onClick={onBackToShopping}
            className="px-5 py-2.5 rounded-xl bg-[#254D3F] text-white text-xs font-bold shadow-xs hover:bg-[#1A372D]"
          >
            استكشف المشغولات اليدوية
          </button>
        </div>
      )}

    </div>
  );
};
