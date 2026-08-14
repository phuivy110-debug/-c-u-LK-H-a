import React, { useMemo, useState } from 'react';
import { Product } from '../types';
import { ChevronRight, AlertCircle } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { CatalogControls } from './CatalogControls';
import { CATEGORIES } from '../data/products';

interface CatalogPageProps {
  products: Product[];
  onNavigate: (path: string) => void;
  onOpenDetail: (product: Product) => void;
  initialCategorySlug?: string;
  initialQuery?: string;
  onRefreshPrices?: () => Promise<void>;
  isRefreshingPrices?: boolean;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({
  products,
  onNavigate,
  onOpenDetail,
  initialCategorySlug = 'tat-ca',
  initialQuery = '',
  onRefreshPrices,
  isRefreshingPrices = false,
}) => {
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState(initialCategorySlug);
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'discount-desc'>('default');
  const [showSaleOnly, setShowSaleOnly] = useState(false);
  const [visibleCount, setVisibleCount] = useState(16);

  const saleProductsCount = useMemo(() => {
    return products.filter((p) => p.status === 'active' && (p.salePrice || (p.originalPrice && p.referencePrice && p.originalPrice > p.referencePrice) || p.isFlashSale)).length;
  }, [products]);

  // Active products filter & search & category & sort
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.status === 'active');

    // Sale only filter
    if (showSaleOnly) {
      list = list.filter((p) => Boolean(
        p.salePrice ||
        (p.originalPrice && p.referencePrice && p.originalPrice > p.referencePrice) ||
        p.isFlashSale
      ));
    }

    // Category filter
    if (selectedCategorySlug && selectedCategorySlug !== 'tat-ca') {
      const catObj = CATEGORIES.find((c) => c.slug === selectedCategorySlug);
      const catName = catObj ? catObj.name : selectedCategorySlug;

      list = list.filter((p) => {
        if (!p.category) return false;
        const normCat = p.category
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]/g, '');

        const normTarget = catName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]/g, '');

        const slugTarget = selectedCategorySlug.replace(/-/g, '');

        return normCat.includes(normTarget) || normCat.includes(slugTarget);
      });
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
      list = list.filter((p) => {
        const normName = p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
        const normDesc = (p.description || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
        const normCat = (p.category || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
        return normName.includes(q) || normDesc.includes(q) || normCat.includes(q);
      });
    }

    // Sort
    if (sortBy === 'discount-desc') {
      list.sort((a, b) => {
        const da = a.saleDiscountPercent || (a.originalPrice && a.referencePrice && a.originalPrice > a.referencePrice ? Math.round(((a.originalPrice - a.referencePrice) / a.originalPrice) * 100) : 0);
        const db = b.saleDiscountPercent || (b.originalPrice && b.referencePrice && b.originalPrice > b.referencePrice ? Math.round(((b.originalPrice - b.referencePrice) / b.originalPrice) * 100) : 0);
        return db - da;
      });
    } else if (sortBy === 'price-asc') {
      list.sort((a, b) => {
        const pa = a.referencePrice || a.salePrice || Number.MAX_SAFE_INTEGER;
        const pb = b.referencePrice || b.salePrice || Number.MAX_SAFE_INTEGER;
        return pa - pb;
      });
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => {
        const pa = a.referencePrice || a.salePrice || 0;
        const pb = b.referencePrice || b.salePrice || 0;
        return pb - pa;
      });
    } else if (sortBy === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }

    return list;
  }, [products, selectedCategorySlug, searchQuery, sortBy, showSaleOnly]);

  const displayedProducts = useMemo(() => {
    return filteredProducts.slice(0, visibleCount);
  }, [filteredProducts, visibleCount]);

  const handleCategorySelect = (slug: string) => {
    setSelectedCategorySlug(slug);
    setVisibleCount(16);
    if (slug !== 'tat-ca') {
      onNavigate(`/danh-muc/${slug}`);
    } else {
      onNavigate('/san-pham');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium">
        <button
          onClick={() => onNavigate('/')}
          className="hover:text-[#EE4D2D] transition-colors cursor-pointer"
        >
          Trang Chủ
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">Tất Cả Sản Phẩm</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-orange-600 to-[#EE4D2D] text-white p-6 sm:p-8 rounded-3xl shadow-md space-y-2">
        <div className="inline-block bg-white/20 text-white font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-md uppercase tracking-wider">
          Đồ Câu LK Hòa
        </div>
        <h1 className="text-2xl sm:text-4xl font-black">Danh Sách Sản Phẩm Đồ Câu</h1>
        <p className="text-xs sm:text-sm text-orange-100 max-w-2xl">
          Tra cứu toàn bộ cần câu cá, máy câu, mồi câu và phụ kiện đồ câu chính hãng LK Hòa. Bấm vào sản phẩm để xem chi tiết và truy cập gian hàng Shopee & TikTok Shop.
        </p>
      </div>

      {/* Controls */}
      <CatalogControls
        searchQuery={searchQuery}
        onSearchChange={(q) => {
          setSearchQuery(q);
          setVisibleCount(16);
        }}
        selectedCategorySlug={selectedCategorySlug}
        onCategorySelect={handleCategorySelect}
        sortBy={sortBy}
        onSortChange={setSortBy}
        showSaleOnly={showSaleOnly}
        onToggleSaleOnly={() => {
          setShowSaleOnly((prev) => !prev);
          setVisibleCount(16);
        }}
        onRefreshPrices={onRefreshPrices}
        isRefreshingPrices={isRefreshingPrices}
        totalFiltered={filteredProducts.length}
        saleCount={saleProductsCount}
      />

      {/* Grid */}
      {displayedProducts.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onOpenDetail={onOpenDetail}
              />
            ))}
          </div>

          {/* Load More Button */}
          {visibleCount < filteredProducts.length && (
            <div className="text-center pt-4">
              <button
                onClick={() => setVisibleCount((prev) => prev + 16)}
                className="bg-slate-900 hover:bg-black text-white font-bold text-xs sm:text-sm px-8 py-3 rounded-2xl shadow-md transition-all cursor-pointer active:scale-95"
              >
                Xem thêm sản phẩm ({filteredProducts.length - visibleCount} còn lại)
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Chưa tìm thấy sản phẩm phù hợp</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Vui lòng kiểm tra lại từ khóa tìm kiếm hoặc chọn danh mục khác.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedCategorySlug('tat-ca');
              setSortBy('default');
            }}
            className="bg-[#EE4D2D] text-white text-xs font-bold px-5 py-2.5 rounded-xl cursor-pointer shadow-xs"
          >
            Xóa tìm kiếm & xem tất cả
          </button>
        </div>
      )}
    </div>
  );
};
