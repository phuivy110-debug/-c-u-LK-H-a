import React, { useMemo } from 'react';
import { Product } from '../types';
import { X, ShieldCheck, Tag, Flame, ChevronRight, ImageOff } from 'lucide-react';
import { AffiliateButtons } from './AffiliateButtons';

interface ProductDetailModalProps {
  product: Product | null;
  allProducts?: Product[];
  onClose: () => void;
  onCopyLink: (product: Product) => void;
  onCopyCoupon?: (code: string) => void;
  onSelectProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts = [],
  onClose,
  onSelectProduct,
}) => {
  if (!product) return null;

  const formatVND = (num?: number) => {
    if (!num || num <= 0) return null;
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const name = product.name;
  const imageUrl = product.imageUrl;
  const displayPrice = product.price;
  const displayOrigPrice = product.originalPrice;
  const discountPercent =
    displayOrigPrice > displayPrice && displayPrice > 0
      ? Math.round(((displayOrigPrice - displayPrice) / displayOrigPrice) * 100)
      : 0;

  // Compute similar products (same category first)
  const similarProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];
    const sameCategory = allProducts.filter(
      (p) => p.category === product.category && p.id !== product.id
    );
    if (sameCategory.length >= 4) {
      return sameCategory.slice(0, 4);
    }
    const others = allProducts.filter(
      (p) => p.category !== product.category && p.id !== product.id
    );
    return [...sameCategory, ...others].slice(0, 4);
  }, [product, allProducts]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-6 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EE4D2D] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Chi Tiết Sản Phẩm & Mua Hàng
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Image */}
            <div className="relative bg-slate-100 aspect-square rounded-2xl overflow-hidden shrink-0 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
                  <ImageOff className="w-10 h-10 stroke-1" />
                  <span className="text-xs font-medium">Đang cập nhật hình ảnh</span>
                </div>
              )}

              {discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-[#EE4D2D] text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md">
                  GIẢM {discountPercent}%
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                {/* Category Label */}
                {product.category && (
                  <div className="text-xs font-bold text-[#EE4D2D] uppercase tracking-wider mb-1">
                    {product.category}
                  </div>
                )}

                {/* Title */}
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug mb-2">
                  {name}
                </h2>

                {/* Price Breakdown */}
                {displayPrice > 0 ? (
                  <div className="bg-orange-50/70 rounded-2xl p-3 sm:p-3.5 border border-orange-200/60 mb-3">
                    <div className="text-[11px] text-slate-500 font-semibold mb-0.5">Giá tham khảo:</div>
                    <div className="flex items-baseline gap-2.5">
                      <span className="text-xl sm:text-2xl font-black text-[#EE4D2D]">
                        {formatVND(displayPrice)}
                      </span>
                      {displayOrigPrice > displayPrice && (
                        <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">
                          {formatVND(displayOrigPrice)}
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200 mb-3 text-xs font-semibold text-slate-600">
                    Kiểm tra giá mới nhất trên ứng dụng Shopee / TikTok Shop
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 border-t border-slate-100">
                <AffiliateButtons
                  productId={product.id}
                  productName={name}
                  shopeeUrl={product.shopeeUrl}
                  tiktokUrl={product.tiktokUrl}
                  compact={false}
                />
              </div>
            </div>
          </div>

          {/* Section: Similar Products */}
          {similarProducts.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-orange-100 text-[#EE4D2D] flex items-center justify-center font-bold">
                    <Flame className="w-3.5 h-3.5" />
                  </div>
                  <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 uppercase tracking-wider">
                    Sản Phẩm Tương Tự
                  </h3>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {similarProducts.map((simProd) => (
                  <div
                    key={simProd.id}
                    onClick={() => {
                      if (onSelectProduct) {
                        onSelectProduct(simProd);
                      }
                    }}
                    className="bg-slate-50 hover:bg-orange-50/50 border border-slate-200/80 hover:border-orange-300 p-2 rounded-2xl flex flex-col justify-between transition-all cursor-pointer group hover:-translate-y-0.5 hover:shadow-xs"
                  >
                    <div>
                      <div className="relative aspect-square bg-slate-200/60 rounded-xl overflow-hidden mb-1.5 flex items-center justify-center">
                        {simProd.imageUrl ? (
                          <img
                            src={simProd.imageUrl}
                            alt={simProd.name}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <ImageOff className="w-6 h-6 text-slate-400 stroke-1" />
                        )}
                      </div>

                      <h4 className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#EE4D2D] mb-1">
                        {simProd.name}
                      </h4>
                    </div>

                    <div className="mt-1 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-xs font-black text-[#EE4D2D]">
                        {formatVND(simProd.price) || 'Xem giá'}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#EE4D2D] transition-colors" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
