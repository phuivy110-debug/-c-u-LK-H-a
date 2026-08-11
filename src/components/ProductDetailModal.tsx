import React, { useMemo } from 'react';
import { Product } from '../types';
import { X, ExternalLink, ShieldCheck, Star, Copy, Tag, ShoppingCart, Flame, ChevronRight } from 'lucide-react';

// Helper TikTok SVG Icon
const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.901 2.89 2.893 2.893 0 0 1-2.89-2.89 2.893 2.893 0 0 1 2.89-2.89c.28 0 .543.044.793.122v-3.52a6.333 6.333 0 0 0-.793-.05A6.338 6.338 0 0 0 3.125 15.68 6.338 6.338 0 0 0 9.463 22a6.338 6.338 0 0 0 6.338-6.32V9.043a8.163 8.163 0 0 0 4.788 1.536V7.134a4.832 4.832 0 0 1-1.000-.448z" />
  </svg>
);

interface ProductDetailModalProps {
  product: Product | null;
  allProducts?: Product[];
  onClose: () => void;
  onCopyLink: (product: Product) => void;
  onCopyCoupon: (code: string) => void;
  onSelectProduct?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  allProducts = [],
  onClose,
  onCopyLink,
  onCopyCoupon,
  onSelectProduct,
}) => {
  if (!product) return null;

  const formatVND = (num: number) => {
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  const handleBuy = () => {
    // Native <a> link navigation handles redirection
  };

  const DEFAULT_TIKTOK_URL = 'https://vt.tiktok.com/ZS9hEsGU3kHau-stx7x/';

  const handleBuyTikTok = () => {
    // Native <a> link navigation handles redirection
  };

  // Compute similar products (same category first, fallback to other top deals)
  const similarProducts = useMemo(() => {
    if (!product || !allProducts.length) return [];
    const sameCategory = allProducts.filter(
      (p) => p.categoryId === product.categoryId && p.id !== product.id
    );
    if (sameCategory.length >= 4) {
      return sameCategory.slice(0, 4);
    }
    const others = allProducts.filter(
      (p) => p.categoryId !== product.categoryId && p.id !== product.id
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
        {/* Sticky Header with Close button */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur-md px-4 py-3 border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EE4D2D] animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-800">
              Chi Tiết Sản Phẩm & Ưu Đãi
            </span>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* Main Product Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {/* Image */}
            <div className="relative bg-slate-100 aspect-square rounded-2xl overflow-hidden shrink-0">
              <img
                src={product.image}
                alt={product.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              {product.discountPercent > 0 && (
                <div className="absolute top-3 left-3 bg-[#EE4D2D] text-white font-black text-xs px-2.5 py-1 rounded-lg shadow-md">
                  GIẢM {product.discountPercent}%
                </div>
              )}
            </div>

            {/* Details */}
            <div className="flex flex-col justify-between space-y-4">
              <div>
                {/* Badges & Shop */}
                <div className="flex items-center gap-1.5 mb-2 flex-wrap">
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
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 leading-snug mb-2">
                  {product.title}
                </h2>

                {/* Shop & Star */}
                <div className="flex items-center gap-2 text-xs text-slate-500 font-medium mb-3 flex-wrap">
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
                <div className="bg-orange-50/70 rounded-2xl p-3 sm:p-3.5 border border-orange-200/60 mb-3">
                  <div className="text-[11px] text-slate-500 font-semibold mb-0.5">Giá ưu đãi hôm nay:</div>
                  <div className="flex items-baseline gap-2.5">
                    <span className="text-xl sm:text-2xl font-black text-[#EE4D2D]">
                      {formatVND(product.dealPrice)}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-400 line-through font-medium">
                      {formatVND(product.originalPrice)}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-emerald-600 mt-1">
                    ✓ Tiết kiệm {formatVND(product.originalPrice - product.dealPrice)} khi mua trực tiếp hôm nay
                  </div>
                </div>

                {/* Coupon Code section */}
                {product.couponCode && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600 shrink-0" />
                      <div>
                        <div className="text-[10px] font-semibold text-emerald-800">
                          Mã giảm giá độc quyền:
                        </div>
                        <div className="text-xs font-black text-emerald-900">{product.couponCode}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => onCopyCoupon(product.couponCode!)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
                    >
                      Sao chép mã
                    </button>
                  </div>
                )}

                {/* Description */}
                {product.description && (
                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-3">
                    {product.description}
                  </p>
                )}
              </div>

              {/* Action Buttons: Shopee & TikTok */}
              <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
                <a
                  href={product.affiliateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleBuy}
                  className="w-full bg-[#EE4D2D] hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm py-2.5 sm:py-3 px-3 rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99] uppercase no-underline"
                >
                  <ShoppingCart className="w-4 h-4 shrink-0" />
                  <span>MUA TRÊN SHOPEE MALL</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>

                <a
                  href={product.tiktokUrl || DEFAULT_TIKTOK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleBuyTikTok}
                  className="w-full bg-slate-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm py-2.5 sm:py-3 px-3 rounded-xl shadow-md shadow-slate-900/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99] uppercase no-underline"
                >
                  <TikTokIcon className="w-4 h-4 shrink-0 fill-current text-white" />
                  <span>MUA TRÊN TIKTOK SHOP</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              </div>
            </div>
          </div>

          {/* Section: Sản Phẩm Tương Tự (Similar Products) */}
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
                <span className="text-[11px] text-slate-400 font-semibold">
                  Gợi ý deal hot khác
                </span>
              </div>

              {/* Similar products grid */}
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
                      {/* Image */}
                      <div className="relative aspect-square bg-slate-200/60 rounded-xl overflow-hidden mb-1.5">
                        <img
                          src={simProd.image}
                          alt={simProd.title}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {simProd.discountPercent > 0 && (
                          <div className="absolute top-1 right-1 bg-[#EE4D2D] text-white font-black text-[9px] px-1.5 py-0.5 rounded">
                            -{simProd.discountPercent}%
                          </div>
                        )}
                      </div>

                      {/* Title */}
                      <h4 className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-tight group-hover:text-[#EE4D2D] mb-1">
                        {simProd.title}
                      </h4>
                    </div>

                    <div className="mt-1 pt-1 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-xs font-black text-[#EE4D2D]">
                        {formatVND(simProd.dealPrice)}
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

