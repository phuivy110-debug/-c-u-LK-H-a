import React, { useState } from 'react';
import { ImageOff, ShoppingBag, ShoppingCart, Zap } from 'lucide-react';
import type { Product } from '../types';
import { InternalLink } from './InternalLink';
import { formatPrice, productDiscount, productPrice } from '../utils/catalog';
import type { AffiliateContext } from '../utils/analyticsService';
import { useCart } from '../utils/CartContext';
import { getProductDetailData } from '../data/productVariants';
import { validateAffiliateUrl } from './AffiliateButtons';
import { SHARED_TIKTOK_URL } from '../utils/googleSheetSync';

export const ProductCard = ({
  product,
  onOpenDetail,
  onQuickBuy,
}: {
  product: Product;
  onOpenDetail?: (product: Product) => void;
  onQuickBuy?: (product: Product) => void;
} & AffiliateContext) => {
  const { addToCart } = useCart();
  const [imgFailed, setImgFailed] = useState(false);

  const detail = getProductDetailData(product);
  const price = productPrice(product);
  const originalPrice = product.originalPrice || 0;
  const discount = productDiscount(product);
  const open = onOpenDetail ? () => onOpenDetail(product) : undefined;
  const href = `/san-pham/${product.slug}`;

  const shopee = validateAffiliateUrl(product.shopeeUrl, 'shopee');
  const tiktok = validateAffiliateUrl(product.tiktokUrl, 'tiktok') || SHARED_TIKTOK_URL;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, detail.variants[0], 1, true);
  };

  const handleBuyNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, detail.variants[0], 1, false);
    if (onQuickBuy) {
      onQuickBuy(product);
    } else if (typeof window !== 'undefined') {
      window.history.pushState({}, '', '/thanh-toan');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  return (
    <article className="product-card-container group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] transition-all duration-200 hover:-translate-y-0.5 hover:border-emerald-700/80 hover:shadow-xl">
      <InternalLink
        href={href}
        onNavigate={open}
        tabIndex={-1}
        aria-hidden="true"
        className="relative block aspect-square overflow-hidden bg-slate-900"
      >
        {product.imageUrl && !imgFailed ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            loading="lazy"
            width="360"
            height="360"
            referrerPolicy="no-referrer"
            onError={() => setImgFailed(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-xs font-medium text-slate-400 bg-gradient-to-br from-slate-900 to-[#14532D]/40">
            <ImageOff className="h-8 w-8 text-slate-500" aria-hidden="true" />
            <span>{product.name}</span>
          </span>
        )}

        {discount > 0 && (
          <span className="absolute right-2 top-2 z-10 rounded-md bg-[#F97316] px-2 py-0.5 text-[11px] font-black text-white shadow-md tabular-nums">
            -{discount}%
          </span>
        )}
      </InternalLink>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 truncate">
          <span>Chính Hãng LK Hòa</span>
          {typeof detail.soldCount === 'number' && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400 tabular-nums">Đã bán {detail.soldCount}</span>
            </>
          )}
        </div>

        <h3 className="mb-3 min-h-10 text-xs sm:text-sm font-bold leading-snug text-white">
          <InternalLink href={href} onNavigate={open} className="line-clamp-2 transition-colors hover:text-[#FACC15]">
            {product.name}
          </InternalLink>
        </h3>

        <div className="mt-auto space-y-2.5 border-t border-slate-800 pt-3">
          {price ? (
            <div className="flex flex-wrap items-baseline gap-2">
              <strong className="text-base sm:text-lg font-black text-[#FACC15] tabular-nums">
                {formatPrice(price)}
              </strong>
              {originalPrice > price && (
                <span className="text-xs font-medium text-slate-400 line-through tabular-nums">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-300">Liên hệ hoặc xem trên sàn</p>
          )}

          {/* Primary Quick Actions: Add to Cart & Buy Now */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleAddToCart}
              className="min-h-11 px-2.5 py-2 rounded-lg bg-[#14532D] hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5 shrink-0" />
              <span>Thêm vào giỏ</span>
            </button>
            <button
              type="button"
              onClick={handleBuyNow}
              data-cta="true"
              className="cta-btn min-h-11 px-2.5 py-2 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer whitespace-nowrap"
            >
              <Zap className="w-3.5 h-3.5 shrink-0" />
              <span>Mua ngay</span>
            </button>
          </div>

          {/* Secondary Marketplace Links preserved for SEO & Shopee/TikTok hunters */}
          <div className="flex items-center justify-between gap-2 pt-1 text-[11px] text-slate-400">
            {shopee ? (
              <a
                href={shopee}
                target="_blank"
                rel="nofollow sponsored noopener"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-1 hover:text-[#F97316] transition-colors truncate"
              >
                <ShoppingBag className="w-3 h-3 shrink-0" />
                <span>Săn Shopee</span>
              </a>
            ) : (
              <span>COD đồng kiểm</span>
            )}
            <a
              href={tiktok}
              target="_blank"
              rel="nofollow sponsored noopener"
              onClick={(e) => e.stopPropagation()}
              className="hover:text-white transition-colors truncate"
            >
              TikTok Shop
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};
