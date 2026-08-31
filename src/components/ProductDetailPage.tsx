import React from 'react';
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
  if (product.status !== 'active') return <div className="max-w-4xl mx-auto px-4 py-12 space-y-4"><h1 className="text-2xl font-bold">{product.name}</h1><p>Sản phẩm hiện không có trong danh mục đang giới thiệu.</p><InternalLink href="/san-pham" onNavigate={onNavigate}>Xem sản phẩm khác</InternalLink></div>;
  const price = productPrice(product), discount = productDiscount(product);
  const related = products.filter(item => item.status === 'active' && item.category === product.category && item.id !== product.id).slice(0, 4);
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 space-y-6">
    <nav aria-label="Breadcrumb" className="text-sm text-slate-600 flex gap-2 flex-wrap">
      <InternalLink href="/" onNavigate={onNavigate}>Trang Chủ</InternalLink><span>/</span><InternalLink href="/san-pham" onNavigate={onNavigate}>Sản Phẩm</InternalLink><span>/ {product.category}</span>
    </nav>
    <section className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
      <div className="aspect-square max-h-72 md:max-h-none bg-slate-50 rounded-xl overflow-hidden flex items-center justify-center">
        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} referrerPolicy="no-referrer" width="600" height="600" className="w-full h-full object-contain" /> : <span>Đang cập nhật ảnh sản phẩm</span>}
      </div>
      <div className="space-y-4">
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-relaxed break-words">{product.name}</h1>
        <div className="space-y-1">
          <p className="text-sm text-slate-600">Giá tham khảo</p>
          <div className="flex items-baseline flex-wrap gap-3"><strong className="text-2xl sm:text-3xl text-[#EE4D2D]">{price ? formatPrice(price) : 'Kiểm tra giá trên sàn'}</strong>
            {discount > 0 && <span className="text-sm text-slate-600">−{discount}% so với giá gốc trong danh mục</span>}</div>
        </div>
        <AffiliateButtons productId={product.id} productName={product.name} shopeeUrl={product.shopeeUrl} tiktokUrl={product.tiktokUrl} tiktokLinkStatus={product.tiktokLinkStatus} placement="product_detail" />
        <p className="text-sm text-slate-600 leading-relaxed">Kiểm tra đúng phân loại, giá cuối cùng và chính sách người bán trước khi đặt mua. Website có thể nhận hoa hồng qua liên kết tiếp thị; giá trên đây không phải báo giá trực tiếp từ sàn.</p>
      </div>
      <div className="md:col-span-2 border-t border-slate-200 pt-5 space-y-3">
        <h2 className="text-lg font-bold">Thông tin & Đặc điểm sản phẩm</h2>
        <p className="text-base leading-relaxed whitespace-pre-line">{product.description || 'Chưa có mô tả chi tiết trong danh mục. Vui lòng xem thông số và phân loại trên trang sản phẩm của người bán.'}</p>
      </div>
    </section>
    {related.length > 0 && <section className="space-y-4"><h2 className="text-xl font-bold">Sản Phẩm Cùng Danh Mục</h2><div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">{related.map(item => <ProductCard key={item.id} product={item} onOpenDetail={onOpenDetail || (selected => onNavigate(`/san-pham/${selected.slug}`))} placement="product_related" />)}</div></section>}
  </div>;
}
