import React from 'react';
import { Flame, ImageOff, Zap } from 'lucide-react';
import type { Product } from '../types';
import { AffiliateButtons } from './AffiliateButtons';
import { ProductCard } from './ProductCard';
import { InternalLink } from './InternalLink';
import { formatPrice, productDiscount, productPrice } from '../utils/catalog';
import { NotFoundPage } from './NotFoundPage';

export function ProductDetailPage({ productSlug, products, onNavigate, onOpenDetail }: {
  productSlug: string; products: Product[]; onNavigate: (path: string) => void; onOpenDetail?: (product: Product) => void;
}) {
  const product = products.find(item => item.slug === productSlug);
  if (!product) return <NotFoundPage />;
  if (product.status !== 'active') return <div className="mx-auto max-w-4xl space-y-4 px-4 py-12"><h1 className="text-2xl font-bold">{product.name}</h1><p>Sản phẩm hiện không có trong danh mục đang giới thiệu.</p><InternalLink href="/san-pham" onNavigate={onNavigate}>Xem sản phẩm khác</InternalLink></div>;

  const price = productPrice(product);
  const originalPrice = product.originalPrice || 0;
  const discount = productDiscount(product);
  const savings = discount > 0 && originalPrice > price ? originalPrice - price : 0;
  const related = products.filter(item => item.status === 'active' && item.category === product.category && item.id !== product.id).slice(0, 4);

  return <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 sm:px-6 lg:px-8">
    <nav aria-label="Breadcrumb" className="flex flex-wrap gap-2 text-sm text-slate-600">
      <InternalLink href="/" onNavigate={onNavigate}>Trang Chủ</InternalLink><span>/</span><InternalLink href="/san-pham" onNavigate={onNavigate}>Sản Phẩm</InternalLink><span>/ {product.category}</span>
    </nav>

    <section className="grid grid-cols-1 gap-6 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm md:grid-cols-2 sm:gap-10 sm:p-8">
      <div className="relative flex aspect-square max-h-[560px] items-center justify-center overflow-hidden rounded-2xl border border-slate-200/60 bg-slate-100">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} referrerPolicy="no-referrer" width="600" height="600" className="h-full w-full object-cover" /> : <span className="flex flex-col items-center gap-2 text-slate-500"><ImageOff className="h-10 w-10" />Đang cập nhật ảnh sản phẩm</span>}
        {discount > 0 && <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-red-600 to-[#EE4D2D] px-3 py-1.5 text-xs font-black text-white shadow-lg sm:text-sm">
          {product.isFlashSale ? <Flame className="h-4 w-4 fill-yellow-300 text-yellow-300" aria-hidden="true" /> : <Zap className="h-4 w-4 fill-yellow-300 text-yellow-300" aria-hidden="true" />}GIẢM {discount}%
        </span>}
      </div>

      <div className="flex flex-col space-y-5">
        <div>
          <p className="mb-2 text-xs font-extrabold uppercase tracking-wider text-[#EE4D2D]">{product.category}</p>
          <h1 className="text-xl font-black leading-tight text-slate-900 sm:text-3xl">{product.name}</h1>
        </div>

        <div className="space-y-3 rounded-2xl border border-orange-200/90 bg-gradient-to-br from-orange-50 via-red-50/50 to-amber-50 p-4 shadow-sm sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-extrabold text-slate-700">Deal giá tham khảo</span>
            {discount > 0 && <span className="rounded-md bg-[#EE4D2D] px-2 py-1 text-xs font-black text-white">-{discount}%</span>}
          </div>
          {price ? <>
            <div className="flex flex-wrap items-baseline gap-3">
              <strong className="text-3xl font-black text-[#EE4D2D] sm:text-4xl">{formatPrice(price)}</strong>
              {originalPrice > price && <span className="text-base font-semibold text-slate-400 line-through">{formatPrice(originalPrice)}</span>}
            </div>
            {savings > 0 && <p className="inline-flex rounded-lg border border-emerald-200 bg-white/80 px-3 py-1 text-sm font-bold text-emerald-700">Tiết kiệm {formatPrice(savings)}</p>}
          </> : <strong className="text-xl text-[#EE4D2D]">Kiểm tra giá mới nhất trên sàn</strong>}
          <p className="text-xs leading-relaxed text-slate-600">Giá, phân loại và ưu đãi cuối cùng có thể thay đổi; vui lòng xác nhận trên trang sản phẩm trước khi mua.</p>
        </div>

        <AffiliateButtons productId={product.id} productName={product.name} shopeeUrl={product.shopeeUrl} tiktokUrl={product.tiktokUrl} tiktokLinkStatus={product.tiktokLinkStatus} placement="product_detail" />

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <h2 className="mb-2 font-extrabold text-slate-900">Thông tin & Đặc điểm sản phẩm</h2>
          <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{product.description || 'Chưa có mô tả chi tiết trong danh mục. Vui lòng xem thông số và phân loại trên trang sản phẩm của người bán.'}</p>
        </div>
      </div>
    </section>

    {related.length > 0 && <section className="space-y-4">
      <div className="flex items-center gap-2"><Flame className="h-5 w-5 text-[#EE4D2D]" aria-hidden="true" /><h2 className="text-xl font-black text-slate-900">Sản Phẩm Cùng Danh Mục</h2></div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">{related.map(item => <ProductCard key={item.id} product={item} onOpenDetail={onOpenDetail || (selected => onNavigate(`/san-pham/${selected.slug}`))} placement="product_related" />)}</div>
    </section>}
  </div>;
}
