import React, { useState } from 'react';
import { Eye, ImageOff, ShoppingCart } from 'lucide-react';
import type { Product } from '../types';
import { InternalLink } from './InternalLink';
import { formatPrice, productDiscount, productDisplayName, productPrice, productPromoLabel } from '../utils/catalog';
import type { AffiliateContext } from '../utils/analyticsService';
import { trackCommerceEvent } from '../utils/analyticsService';
import { useCart } from '../utils/CartContext';
import { getProductDetailData } from '../data/productVariants';

export const ProductCard = ({
  product,
  onOpenDetail,
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
  const displayName = productDisplayName(product);
  const promoLabel = productPromoLabel(product);
  const open = onOpenDetail ? () => {
    trackCommerceEvent('select_item', {
      item_list_name: 'product_grid',
      items: [{ item_id: product.id, item_name: displayName, item_category: product.category, price }],
    });
    onOpenDetail(product);
  } : undefined;
  const href = `/san-pham/${product.slug}`;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, detail.variants[0], 1, true);
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
            alt={displayName}
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
            <span>{displayName}</span>
          </span>
        )}

        {promoLabel && discount > 0 && (
          <span className="absolute right-2 top-2 z-10 rounded-md bg-[#F97316] px-2 py-0.5 text-[11px] font-black text-white shadow-md tabular-nums">
            {promoLabel} · -{discount}%
          </span>
        )}
      </InternalLink>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-400 truncate">
          <span>{product.category}</span>
          {typeof detail.soldCount === 'number' && (
            <>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-400 tabular-nums">Đã bán {detail.soldCount}</span>
            </>
          )}
        </div>

        <h3 className="mb-3 min-h-10 text-xs sm:text-sm font-bold leading-snug text-white">
          <InternalLink href={href} onNavigate={open} className="line-clamp-2 transition-colors hover:text-[#FACC15]">
            {displayName}
          </InternalLink>
        </h3>

        <div className="mt-auto space-y-2.5 border-t border-slate-800 pt-3">
          {price ? (
            <div className="flex flex-wrap items-baseline gap-2">
              <strong className="text-base sm:text-lg font-black text-[#FACC15] tabular-nums">
                {formatPrice(price)}
              </strong>
              {discount > 0 && originalPrice > price && (
                <span className="text-xs font-medium text-slate-400 line-through tabular-nums">
                  {formatPrice(originalPrice)}
                </span>
              )}
            </div>
          ) : (
            <p className="text-xs font-semibold text-slate-300">Liên hệ hoặc xem trên sàn</p>
          )}

          <div className="grid grid-cols-[1fr_44px] gap-2">
            <InternalLink
              href={href}
              onNavigate={open}
              className="cta-btn min-h-11 rounded-lg bg-[#FACC15] px-3 py-2 text-xs font-black text-[#0F172A] flex items-center justify-center gap-1.5 hover:bg-yellow-300"
            >
              <Eye className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>Xem chi tiết</span>
            </InternalLink>
            <button
              type="button"
              onClick={handleAddToCart}
              aria-label={`Thêm ${displayName} vào giỏ hàng`}
              title="Thêm vào giỏ"
              className="min-h-11 rounded-lg bg-[#14532D] hover:bg-emerald-800 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <ShoppingCart className="w-4 h-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
