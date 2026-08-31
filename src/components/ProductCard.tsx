import React from 'react';
import type { Product } from '../types';
import { AffiliateButtons } from './AffiliateButtons';
import { InternalLink } from './InternalLink';
import { formatPrice, productDiscount, productPrice } from '../utils/catalog';
import type { AffiliateContext } from '../utils/analyticsService';

export const ProductCard = ({ product, onOpenDetail, placement = 'product_card', articleSlug }:
  { product: Product; onOpenDetail?: (product: Product) => void } & AffiliateContext) => {
  const price = productPrice(product), discount = productDiscount(product);
  const open = onOpenDetail ? () => onOpenDetail(product) : undefined;
  const href = `/san-pham/${product.slug}`;
  return (
    <article className="product-card-container bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 flex flex-col gap-3 min-w-0">
      <InternalLink href={href} onNavigate={open} tabIndex={-1} aria-hidden="true" className="block aspect-square bg-slate-50 rounded-xl overflow-hidden">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} loading="lazy" width="360" height="360" referrerPolicy="no-referrer" className="w-full h-full object-contain" />
          : <span className="flex h-full items-center justify-center text-sm text-slate-500">Đang cập nhật ảnh</span>}
      </InternalLink>
      <p className="text-xs text-slate-600">{product.category}</p>
      <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-relaxed break-words">
        <InternalLink href={href} onNavigate={open} className="hover:text-[#EE4D2D] hover:underline">{product.name}</InternalLink>
      </h3>
      <div className="mt-auto space-y-2">
        <p className="text-xs text-slate-600">Giá tham khảo</p>
        <div className="flex flex-wrap items-baseline gap-2">
          <strong className="text-lg text-[#EE4D2D]">{price ? formatPrice(price) : 'Xem giá trên sàn'}</strong>
          {discount > 0 && <span className="text-xs text-slate-600" title="Chênh lệch so với giá gốc trong danh mục">−{discount}% theo danh mục</span>}
        </div>
        <AffiliateButtons productId={product.id} productName={product.name} shopeeUrl={product.shopeeUrl} tiktokUrl={product.tiktokUrl}
          tiktokLinkStatus={product.tiktokLinkStatus} compact placement={placement} articleSlug={articleSlug} />
      </div>
    </article>
  );
};
