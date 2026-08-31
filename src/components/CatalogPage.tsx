import React, { useMemo } from 'react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import { CatalogControls } from './CatalogControls';
import { InternalLink } from './InternalLink';
import { productDiscount, selectProducts, type ProductSort } from '../utils/catalog';
import { useHistoryState } from '../utils/useHistoryState';

export function CatalogPage({ products, onNavigate, onOpenDetail, initialQuery = '' }: {
  products: Product[]; onNavigate: (path: string) => void; onOpenDetail: (product: Product) => void; initialQuery?: string;
}) {
  const [searchQuery, setSearchQuery] = useHistoryState('catalog-query', initialQuery);
  const [sortBy, setSortBy] = useHistoryState<ProductSort>('catalog-sort', 'default');
  const [showSaleOnly, setShowSaleOnly] = useHistoryState('catalog-sale', false);
  const [visibleCount, setVisibleCount] = useHistoryState('catalog-count', 16);
  const filteredProducts = useMemo(() => selectProducts(products, 'tat-ca', searchQuery, sortBy, showSaleOnly), [products, searchQuery, sortBy, showSaleOnly]);
  const saleCount = products.filter(product => product.status === 'active' && productDiscount(product) > 0).length;
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
    <nav aria-label="Breadcrumb" className="text-sm text-slate-600"><InternalLink href="/" onNavigate={onNavigate}>Trang Chủ</InternalLink> / Sản phẩm</nav>
    <header className="space-y-2">
      <h1 className="text-2xl sm:text-3xl font-black text-slate-900">Danh Sách Sản Phẩm Đồ Câu</h1>
      <p className="text-sm text-slate-600">Tìm đồ câu, xem thông tin và kiểm tra giá cuối cùng trên sàn trước khi mua.</p>
    </header>
    <CatalogControls searchQuery={searchQuery} onSearchChange={value => { setSearchQuery(value); setVisibleCount(16); }}
      selectedCategorySlug="tat-ca" onCategorySelect={slug => onNavigate(slug === 'tat-ca' ? '/san-pham' : `/danh-muc/${slug}`)}
      sortBy={sortBy} onSortChange={value => { setSortBy(value); setVisibleCount(16); }} showSaleOnly={showSaleOnly}
      onToggleSaleOnly={() => { setShowSaleOnly(value => !value); setVisibleCount(16); }} totalFiltered={filteredProducts.length} saleCount={saleCount} />
    {filteredProducts.length ? <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {filteredProducts.slice(0, visibleCount).map(product => <ProductCard key={product.id} product={product} onOpenDetail={onOpenDetail} placement="catalog" />)}
      </div>
      {visibleCount < filteredProducts.length && <div className="text-center"><button className="min-h-11 px-6 py-3 bg-slate-900 text-white rounded-xl font-semibold" onClick={() => setVisibleCount(value => value + 16)}>Xem thêm sản phẩm ({filteredProducts.length - visibleCount} còn lại)</button></div>}
    </> : <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 space-y-3">
      <h2 className="font-bold">Chưa tìm thấy sản phẩm phù hợp</h2>
      <p className="text-sm text-slate-600">Thử từ khóa ngắn hơn hoặc xóa bộ lọc.</p>
      <button className="min-h-11 px-4 text-[#EE4D2D] font-bold" onClick={() => { setSearchQuery(''); setSortBy('default'); setShowSaleOnly(false); }}>Xóa tìm kiếm & xem tất cả</button>
    </div>}
  </div>;
}
