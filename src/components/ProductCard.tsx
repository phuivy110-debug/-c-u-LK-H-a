import React from 'react';
import { Product } from '../types';
import { ExternalLink, Tag, Copy, Eye, ShieldCheck, ImageOff } from 'lucide-react';
import { trackUserAction } from '../utils/analyticsService';
import { AffiliateButtons } from './AffiliateButtons';

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
  const formatVND = (num?: number) => {
    if (!num || num <= 0) return null;
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const displayPrice = product.price;
  const displayOrigPrice = product.originalPrice;
  const discountPercent =
    displayOrigPrice > displayPrice && displayPrice > 0
      ? Math.round(((displayOrigPrice - displayPrice) / displayOrigPrice) * 100)
      : 0;

  const handleCardClick = () => {
    trackUserAction(`Xem chi tiết: ${product.name.substring(0, 25)}...`);
    onOpenDetail(product);
  };

  const imageUrl = product.imageUrl;

  return (
    <div
      onClick={handleCardClick}
      className="bg-white p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-square bg-slate-100 rounded-xl sm:rounded-2xl mb-2 sm:mb-3 overflow-hidden flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={product.name}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
              <ImageOff className="w-8 h-8 stroke-1" />
              <span className="text-[10px] sm:text-xs font-medium">Đang cập nhật hình ảnh</span>
            </div>
          )}

          {/* Discount Tag Overlay */}
          {discountPercent > 0 && (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-[#EE4D2D] text-white text-[10px] sm:text-xs font-black px-1.5 sm:px-2 py-0.5 rounded-md sm:rounded-lg shadow-xs z-10">
              -{discountPercent}%
            </div>
          )}

          {/* Quick Actions */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent p-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopyLink(product);
              }}
              className="p-1.5 bg-white text-slate-800 rounded-lg shadow-xs hover:scale-105 transition-all"
              title="Sao chép link sản phẩm chính hãng"
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

        {/* Category Label */}
        {product.category && (
          <div className="text-[10px] sm:text-xs text-[#EE4D2D] font-bold mb-1 truncate">
            {product.category}
          </div>
        )}

        {/* Title */}
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#EE4D2D] transition-colors line-clamp-2 leading-snug mb-1.5 min-h-[2.25rem] sm:min-h-[2.5rem]">
          {product.name}
        </h3>
      </div>

      <div className="space-y-1.5 sm:space-y-2 mt-1 pt-1.5 sm:mt-2 sm:pt-2 border-t border-slate-100">
        {/* Price Row */}
        <div className="flex items-baseline justify-between gap-1 flex-wrap">
          {displayPrice > 0 ? (
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-xs text-slate-500 font-normal">Giá tham khảo:</span>
              <span className="text-sm sm:text-base font-black text-[#EE4D2D]">
                {formatVND(displayPrice)}
              </span>
              {displayOrigPrice > displayPrice && (
                <span className="text-[10px] sm:text-xs text-slate-400 line-through">
                  {formatVND(displayOrigPrice)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-xs font-semibold text-slate-500">Kiểm tra giá mới nhất</span>
          )}
        </div>

        {/* Affiliate CTA Buttons */}
        <AffiliateButtons
          productId={product.id}
          productName={product.name}
          shopeeUrl={product.shopeeUrl}
          tiktokUrl={product.tiktokUrl}
          compact={true}
        />
      </div>
    </div>
  );
};
