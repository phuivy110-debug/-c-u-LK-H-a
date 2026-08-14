import React from 'react';
import { Product } from '../types';
import { ExternalLink, Tag, Copy, Eye, ImageOff, Zap, Flame } from 'lucide-react';
import { trackUserAction } from '../utils/analyticsService';
import { AffiliateButtons } from './AffiliateButtons';
import { LiveProductTrustBadge } from './LiveProductTrustBadge';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  onCopyLink?: (product: Product) => void;
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

  const refPrice = product.referencePrice || product.salePrice;
  const origPrice = product.originalPrice;
  const isSale = Boolean(
    (product.salePrice && product.salePrice > 0) ||
    (origPrice && refPrice && origPrice > refPrice) ||
    product.isFlashSale
  );

  const hasValidDiscount =
    origPrice && refPrice && origPrice > refPrice && refPrice > 0;

  const discountPercent = product.saleDiscountPercent || (
    hasValidDiscount && origPrice && refPrice
      ? Math.round(((origPrice - refPrice) / origPrice) * 100)
      : 0
  );

  const savingsAmount = hasValidDiscount && origPrice && refPrice ? origPrice - refPrice : 0;

  const handleCardClick = () => {
    trackUserAction(`Xem chi tiết: ${product.name.substring(0, 25)}...`);
    onOpenDetail(product);
  };

  return (
    <div
      onClick={handleCardClick}
      className="product-card-container bg-white p-2.5 sm:p-4 rounded-2xl sm:rounded-3xl shadow-xs border border-slate-200/80 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 transition-all group cursor-pointer relative"
    >
      <div>
        {/* Product Image Container */}
        <div className="relative aspect-square bg-slate-100 rounded-xl sm:rounded-2xl mb-2 sm:mb-3 overflow-hidden flex items-center justify-center">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
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

          {/* Discount / Flash Sale Tag Overlay */}
          {discountPercent > 0 ? (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-gradient-to-r from-red-600 via-[#EE4D2D] to-orange-500 text-white text-[11px] sm:text-xs font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-lg shadow-md shadow-red-500/25 z-10 flex items-center gap-1 border border-white/20">
              {product.isFlashSale ? (
                <>
                  <Flame className="w-3.5 h-3.5 text-yellow-300 animate-pulse fill-yellow-300 shrink-0" />
                  <span>GIẢM {discountPercent}%</span>
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300 shrink-0" />
                  <span>-{discountPercent}%</span>
                </>
              )}
            </div>
          ) : isSale ? (
            <div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 bg-[#EE4D2D] text-white text-[10px] sm:text-xs font-black px-2 py-0.5 sm:py-1 rounded-lg shadow-md z-10 flex items-center gap-1 border border-white/20">
              <Zap className="w-3 h-3 text-yellow-300 fill-yellow-300 shrink-0" />
              <span>GIÁ SALE</span>
            </div>
          ) : null}

          {/* Realtime Shopee badge */}
          {product.shopeeUrl && (
            <div className="absolute bottom-1.5 left-1.5 bg-slate-950/70 backdrop-blur-xs text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1 z-10">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>Shopee Live</span>
            </div>
          )}

          {/* Quick Actions */}
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/60 to-transparent p-2 flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
            {onCopyLink && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onCopyLink(product);
                }}
                className="p-1.5 bg-white text-slate-800 rounded-lg shadow-xs hover:scale-105 transition-all"
                title="Sao chép link sản phẩm"
              >
                <Copy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}
            <button
              onClick={(e) => {
                e.stopPropagation();
                onOpenDetail(product);
              }}
              className="p-1.5 bg-white text-slate-800 rounded-lg shadow-xs hover:scale-105 transition-all"
              title="Xem chi tiết sản phẩm"
            >
              <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>

        {/* Category & Live Viewer Badge */}
        <div className="flex items-center justify-between gap-1 mb-1">
          {product.category ? (
            <div className="text-[10px] sm:text-xs text-[#EE4D2D] font-bold truncate">
              {product.category}
            </div>
          ) : <div />}
          <LiveProductTrustBadge productId={product.id} variant="compact" />
        </div>

        {/* Title */}
        <h3 className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-[#EE4D2D] transition-colors line-clamp-2 leading-snug mb-1.5 min-h-[2.25rem] sm:min-h-[2.5rem]">
          {product.name}
        </h3>
      </div>

      <div className="space-y-1.5 sm:space-y-2 mt-1 pt-1.5 sm:mt-2 sm:pt-2 border-t border-slate-100">
        {/* Price Box */}
        <div className="flex flex-col gap-0.5">
          {refPrice && refPrice > 0 ? (
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-1">
                <span className="text-[10px] sm:text-[11px] font-extrabold text-slate-600 flex items-center gap-1">
                  {discountPercent > 0 ? (
                    <>
                      <Zap className="w-3 h-3 text-[#EE4D2D] fill-[#EE4D2D]" />
                      <span>Giá Sale Shopee:</span>
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    </>
                  ) : (
                    <span>Giá tham khảo:</span>
                  )}
                </span>
                {discountPercent > 0 && (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md bg-red-600 text-white text-[10px] font-black shadow-2xs">
                    -{discountPercent}%
                  </span>
                )}
              </div>
              <div className="flex items-baseline gap-1.5 flex-wrap">
                <span className="text-base sm:text-lg font-black text-[#EE4D2D]">
                  {formatVND(refPrice)}
                </span>
                {origPrice && origPrice > refPrice && (
                  <span className="text-[11px] sm:text-xs text-slate-400 line-through font-semibold">
                    {formatVND(origPrice)}
                  </span>
                )}
              </div>
              {savingsAmount > 0 && (
                <div className="text-[10px] sm:text-[11px] font-bold text-emerald-700 bg-emerald-50/90 border border-emerald-200/80 px-2 py-0.5 rounded-md inline-flex items-center gap-1">
                  <span>Tiết kiệm: {formatVND(savingsAmount)}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="text-xs font-semibold text-slate-500 py-1">
              Kiểm tra giá mới nhất trên Shopee
            </div>
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
