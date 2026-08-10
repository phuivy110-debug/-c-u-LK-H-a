import React from 'react';
import { Product } from '../types';
import { ExternalLink, Star, ShieldCheck, Tag, Copy, Eye, Flame, Award, Zap } from 'lucide-react';
import { trackUserAction } from '../utils/analyticsService';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  onCopyLink: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetail,
  onCopyLink,
}) => {
  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const handleBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackUserAction(`Bấm mua Shopee: ${product.title.substring(0, 25)}...`);
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  const handleCardClick = () => {
    trackUserAction(`Xem chi tiết: ${product.title.substring(0, 25)}...`);
    onOpenDetail(product);
  };

  const getBadgeStyle = (badge: string) => {
    switch (badge) {
      case 'Deal hot':
        return 'bg-red-500 text-white font-bold';
      case 'Bán chạy':
        return 'bg-orange-500 text-white font-bold';
      case 'Giảm sâu':
        return 'bg-purple-600 text-white font-bold';
      case 'Shopee Mall':
        return 'bg-red-700 text-white font-extrabold';
      default:
        return 'bg-slate-800 text-white font-bold';
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="bg-white p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-square bg-slate-100 rounded-xl sm:rounded-2xl mb-2 sm:mb-3 overflow-hidden">
          <img
            src={product.image}
            alt={product.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Discount Tag Overlay (Top Right) */}
          {product.discountPercent > 0 && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-[#EE4D2D] text-white text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg shadow-xs z-10">
              -{product.discountPercent}%
            </div>
          )}

          {/* Badges Stack (Top Left) */}
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 flex flex-col gap-1 z-10">
            {product.isMall && (
              <span className="bg-red-600 text-white text-[9px] sm:text-[10px] font-black px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1 shadow-xs">
                <ShieldCheck className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                <span>Mall</span>
              </span>
            )}
            {product.badges.slice(0, 1).map((badge) => (
              <span
                key={badge}
                className={`text-[9px] sm:text-[10px] px-1.5 sm:px-2 py-0.5 rounded uppercase tracking-wider shadow-xs ${getBadgeStyle(
                  badge
                )}`}
              >
                {badge}
              </span>
            ))}
          </div>

          {/* Quick Actions Hover */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent p-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyLink(product);
              }}
              className="p-1.5 bg-white text-slate-800 rounded-lg shadow-xs hover:scale-105 transition-all"
              title="Sao chép link affiliate"
            >
              <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(product);
              }}
              className="p-1.5 bg-white text-slate-800 rounded-lg shadow-xs hover:scale-105 transition-all"
              title="Xem chi tiết"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Shop Name & Rating */}
        <div className="flex items-center justify-between text-[10px] sm:text-xs text-slate-500 font-medium mb-1">
          <span className="truncate max-w-[80px] sm:max-w-[130px] font-semibold text-slate-600">
            {product.shopName}
          </span>
          <div className="flex items-center gap-0.5 sm:gap-1 shrink-0 bg-amber-50 text-amber-700 px-1 sm:px-1.5 py-0.5 rounded-md text-[10px] sm:text-[11px]">
            <Star className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-amber-400 text-amber-400" />
            <span className="font-bold">{product.rating}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#EE4D2D] transition-colors line-clamp-2 leading-snug mb-1.5 min-h-[2.25rem] sm:min-h-[2.5rem]">
          {product.title}
        </h3>

        {/* Coupon Tag */}
        {product.couponCode && (
          <div className="inline-flex items-center gap-1 text-[9px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 sm:px-2 py-0.5 rounded-md mb-1.5 truncate max-w-full">
            <Tag className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-emerald-600 shrink-0" />
            <span className="truncate">Mã: {product.couponCode}</span>
          </div>
        )}
      </div>

      <div className="space-y-1.5 sm:space-y-2 mt-1 pt-1.5 sm:mt-2 sm:pt-2 border-t border-slate-100">
        {/* Price Row */}
        <div className="flex items-baseline justify-between gap-1 flex-wrap">
          <div className="flex items-baseline gap-1 flex-wrap">
            <span className="text-sm sm:text-lg font-black text-[#EE4D2D]">
              {formatVND(product.dealPrice)}
            </span>
            <span className="text-[10px] sm:text-xs text-slate-400 line-through">
              {formatVND(product.originalPrice)}
            </span>
          </div>
        </div>

        {/* Primary CTA Button */}
        <button
          onClick={handleBuyClick}
          className="w-full bg-[#EE4D2D] hover:bg-[#d73a1c] text-white py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold transition-colors flex items-center justify-center gap-1 cursor-pointer shadow-xs uppercase"
        >
          <span>Mua trên Shopee</span>
          <ExternalLink className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
        </button>
      </div>
    </div>
  );
};
