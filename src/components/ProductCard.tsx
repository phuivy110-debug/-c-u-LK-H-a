import React from 'react';
import { Flame, ImageOff, Zap } from 'lucide-react';
import type { Product } from '../types';
import { AffiliateButtons } from './AffiliateButtons';
import { InternalLink } from './InternalLink';
import { formatPrice, productDiscount, productPrice } from '../utils/catalog';
import type { AffiliateContext } from '../utils/analyticsService';

export const ProductCard = ({ product, onOpenDetail, placement = 'product_card', articleSlug }:
  { product: Product; onOpenDetail?: (product: Product) => void } & AffiliateContext) => {
  const price = productPrice(product);
  const originalPrice = product.originalPrice || 0;
  const discount = productDiscount(product);
  const savings = discount > 0 && originalPrice > price ? originalPrice - price : 0;
  const hasSalePrice = Boolean(product.salePrice && product.salePrice > 0);
  const open = onOpenDetail ? () => onOpenDetail(product) : undefined;
  const href = `/san-pham/${product.slug}`;

  return (
    <article className="product-card-container group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-orange-200 hover:shadow-lg sm:rounded-3xl">
      <InternalLink href={href} onNavigate={open} tabIndex={-1} aria-hidden="true" className="relative block aspect-square overflow-hidden bg-slate-100">
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" width="360" height="360" referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-xs font-medium text-slate-500">
            <ImageOff className="h-8 w-8" aria-hidden="true" />Đang cập nhật ảnh
          </span>
        )}

        {discount > 0 ? (
          <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-lg border border-white/30 bg-gradient-to-r from-red-600 via-[#EE4D2D] to-orange-500 px-2 py-1 text-[11px] font-black text-white shadow-md sm:text-xs">
            {product.isFlashSale ? <Flame className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" aria-hidden="true" /> : <Zap className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" aria-hidden="true" />}
            GIẢM {discount}%
          </span>
        ) : hasSalePrice ? (
          <span className="absolute right-2 top-2 z-10 inline-flex items-center gap-1 rounded-lg bg-[#EE4D2D] px-2 py-1 text-[11px] font-black text-white shadow-md">
            <Zap className="h-3.5 w-3.5 fill-yellow-300 text-yellow-300" aria-hidden="true" />GIÁ SALE
          </span>
        ) : null}
      </InternalLink>

      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <p className="mb-1 truncate text-[10px] font-bold uppercase tracking-wide text-[#EE4D2D] sm:text-xs">{product.category}</p>
        <h3 className="mb-3 min-h-10 text-sm font-bold leading-snug text-slate-900 sm:text-base">
          <InternalLink href={href} onNavigate={open} className="line-clamp-2 transition-colors hover:text-[#EE4D2D]">{product.name}</InternalLink>
        </h3>

        <div className="mt-auto space-y-2 border-t border-slate-100 pt-3">
          <div className="flex items-center justify-between gap-2">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-slate-600 sm:text-xs">
              {discount > 0 && <Zap className="h-3 w-3 fill-[#EE4D2D] text-[#EE4D2D]" aria-hidden="true" />}
              Giá tham khảo
            </span>
            {discount > 0 && <span className="rounded-md bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white">-{discount}%</span>}
          </div>

          {price ? (
            <>
              <div className="flex flex-wrap items-baseline gap-1.5">
                <strong className="text-lg font-black text-[#EE4D2D] sm:text-xl">{formatPrice(price)}</strong>
                {originalPrice > price && <span className="text-xs font-semibold text-slate-400 line-through">{formatPrice(originalPrice)}</span>}
              </div>
              {savings > 0 && <p className="inline-flex rounded-md border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700 sm:text-[11px]">Tiết kiệm {formatPrice(savings)}</p>}
            </>
          ) : <p className="text-xs font-semibold text-slate-500">Kiểm tra giá mới nhất trên sàn</p>}

          <AffiliateButtons productId={product.id} productName={product.name} shopeeUrl={product.shopeeUrl} tiktokUrl={product.tiktokUrl}
            tiktokLinkStatus={product.tiktokLinkStatus} compact placement={placement} articleSlug={articleSlug} />
          <p className="text-[10px] leading-snug text-slate-500">Giá và ưu đãi cuối cùng được xác nhận trên sàn.</p>
        </div>
      </div>
    </article>
  );
};
