import React, { useMemo } from 'react';
import type { Product } from '../types';
import { ProductCard } from './ProductCard';
import { CatalogControls } from './CatalogControls';
import { InternalLink } from './InternalLink';
import { productDiscount, selectProducts, type ProductSort } from '../utils/catalog';
import { useHistoryState } from '../utils/useHistoryState';

export function CatalogPage({
  products,
  onNavigate,
  onOpenDetail,
  initialQuery = '',
}: {
  products: Product[];
  onNavigate: (path: string) => void;
  onOpenDetail: (product: Product) => void;
  initialQuery?: string;
}) {
  const [searchQuery, setSearchQuery] = useHistoryState('catalog-query', initialQuery);
  const [sortBy, setSortBy] = useHistoryState<ProductSort>('catalog-sort', 'default');
  const [showSaleOnly, setShowSaleOnly] = useHistoryState('catalog-sale', false);
  const [visibleCount, setVisibleCount] = useHistoryState('catalog-count', 16);

  const filteredProducts = useMemo(
    () => selectProducts(products, 'tat-ca', searchQuery, sortBy, showSaleOnly),
    [products, searchQuery, sortBy, showSaleOnly]
  );
  const saleCount = products.filter(
    (product) => product.status === 'active' && productDiscount(product) > 0
  ).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      <nav aria-label="Breadcrumb" className="text-sm text-slate-400">
        <InternalLink href="/" onNavigate={onNavigate} className="hover:text-[#FACC15]">
          Trang Chủ
        </InternalLink>{' '}
        / <span className="text-slate-200 font-semibold">Sản phẩm</span>
      </nav>
      <header className="space-y-2">
        <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
          Danh Sách Trang Bị Đồ Câu LK Hòa
        </h1>
        <p className="text-sm text-slate-300">
          Chọn biến thể, đặt hàng trực tiếp COD đồng kiểm / VietQR hoặc săn voucher trên Shopee &amp; TikTok Shop.
        </p>
      </header>
      <CatalogControls
        searchQuery={searchQuery}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setVisibleCount(16);
        }}
        selectedCategorySlug="tat-ca"
        onCategorySelect={(slug) =>
          onNavigate(slug === 'tat-ca' ? '/san-pham' : `/danh-muc/${slug}`)
        }
        sortBy={sortBy}
        onSortChange={(value) => {
          setSortBy(value);
          setVisibleCount(16);
        }}
        showSaleOnly={showSaleOnly}
        onToggleSaleOnly={() => {
          setShowSaleOnly((value) => !value);
          setVisibleCount(16);
        }}
        totalFiltered={filteredProducts.length}
        saleCount={saleCount}
      />
      {filteredProducts.length ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
            {filteredProducts.slice(0, visibleCount).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetail={onOpenDetail}
                onQuickBuy={() => onNavigate('/thanh-toan')}
                placement="catalog"
              />
            ))}
          </div>
          {visibleCount < filteredProducts.length && (
            <div className="text-center pt-2">
              <button
                type="button"
                data-cta="true"
                className="cta-btn min-h-11 px-6 py-3 bg-[#14532D] hover:bg-emerald-800 border border-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                onClick={() => setVisibleCount((value) => value + 16)}
              >
                Xem thêm sản phẩm ({filteredProducts.length - visibleCount} còn lại)
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="p-8 text-center bg-[#111827] rounded-2xl border border-slate-800 space-y-3">
          <h2 className="font-bold text-white">Chưa tìm thấy sản phẩm phù hợp</h2>
          <p className="text-sm text-slate-400">Thử từ khóa ngắn hơn hoặc xóa bộ lọc.</p>
          <button
            type="button"
            data-cta="true"
            className="cta-btn min-h-11 px-4 text-[#FACC15] font-bold cursor-pointer"
            onClick={() => {
              setSearchQuery('');
              setSortBy('default');
              setShowSaleOnly(false);
            }}
          >
            Xóa tìm kiếm &amp; xem tất cả
          </button>
        </div>
      )}
    </div>
  );
}
