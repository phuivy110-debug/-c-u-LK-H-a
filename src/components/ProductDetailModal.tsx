import React from 'react';
import { Product } from '../types';
import { X, ExternalLink, ShieldCheck, Star, Copy, Tag, Check, ShoppingCart } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onCopyLink: (product: Product) => void;
  onCopyCoupon: (code: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onCopyLink,
  onCopyCoupon,
}) => {
  if (!product) return null;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const handleBuy = () => {
    window.open(product.affiliateUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 sm:grid-cols-2">
          {/* Image */}
          <div className="relative bg-slate-100 aspect-square sm:aspect-auto">
            <img
              src={product.image}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {product.discountPercent > 0 && (
              <div className="absolute top-4 left-4 bg-[#EE4D2D] text-white font-black text-sm px-3 py-1 rounded-xl shadow-md">
                GIẢM {product.discountPercent}%
              </div>
            )}
          </div>

          {/* Details */}
          <div className="p-6 flex flex-col justify-between space-y-4">
            <div>
              {/* Badges & Shop */}
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                {product.isMall && (
                  <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Shopee Mall
                  </span>
                )}
                {product.badges.map((b) => (
                  <span
                    key={b}
                    className="bg-orange-100 text-[#EE4D2D] text-[10px] font-extrabold px-2 py-0.5 rounded"
                  >
                    {b}
                  </span>
                ))}
              </div>

              {/* Title */}
              <h2 className="text-lg font-extrabold text-slate-900 leading-snug mb-2">
                {product.title}
              </h2>

              {/* Shop & Star */}
              <div className="flex items-center gap-3 text-xs text-slate-500 font-medium mb-4">
                <span className="font-bold text-slate-700">{product.shopName}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-amber-600 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {product.rating}
                </span>
                <span>•</span>
                <span>Đã bán {product.soldCount}</span>
              </div>

              {/* Price Breakdown */}
              <div className="bg-orange-50/70 rounded-2xl p-3.5 border border-orange-200/60 mb-4">
                <div className="text-xs text-slate-500 font-medium mb-1">Giá ưu đãi hôm nay:</div>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl font-black text-[#EE4D2D]">
                    {formatVND(product.dealPrice)}
                  </span>
                  <span className="text-sm text-slate-400 line-through font-medium">
                    {formatVND(product.originalPrice)}
                  </span>
                </div>
                <div className="text-xs font-bold text-emerald-600 mt-1">
                  ✓ Bạn tiết kiệm được {formatVND(product.originalPrice - product.dealPrice)} khi mua qua link này!
                </div>
              </div>

              {/* Coupon Code section */}
              {product.couponCode && (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-emerald-600" />
                    <div>
                      <div className="text-[11px] font-semibold text-emerald-800">
                        Mã giảm giá độc quyền:
                      </div>
                      <div className="text-sm font-black text-emerald-900">{product.couponCode}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => onCopyCoupon(product.couponCode!)}
                    className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    Sao chép mã
                  </button>
                </div>
              )}

              {/* Description */}
              {product.description && (
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
                  {product.description}
                </p>
              )}
            </div>

            {/* CTAs */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <button
                onClick={handleBuy}
                className="w-full bg-[#EE4D2D] hover:bg-orange-600 text-white font-extrabold text-base py-3.5 px-4 rounded-xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.99]"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>MUA NGAY TRÊN SHOPEE</span>
                <ExternalLink className="w-4 h-4" />
              </button>

              <button
                onClick={() => onCopyLink(product)}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Copy className="w-4 h-4" />
                <span>Sao Chép Link Affiliate</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
