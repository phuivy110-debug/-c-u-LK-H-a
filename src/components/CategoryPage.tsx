import React, { useMemo, useState } from 'react';
import { Product } from '../types';
import { CATEGORIES } from '../data/products';
import { ChevronRight, ArrowLeft, AlertCircle } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { CatalogControls } from './CatalogControls';

interface CategoryPageProps {
  categorySlug: string;
  products: Product[];
  onNavigate: (path: string) => void;
  onOpenDetail: (product: Product) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug,
  products,
  onNavigate,
  onOpenDetail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc'>('default');

  const currentCategory = useMemo(() => {
    return CATEGORIES.find((c) => c.slug === categorySlug);
  }, [categorySlug]);

  const categoryName = currentCategory ? currentCategory.name : 'Danh Mục Sản Phẩm';
  const categoryDesc = currentCategory ? currentCategory.description : '';

  // Filter products by category & active status
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.status === 'active');

    if (categorySlug !== 'tat-ca') {
      list = list.filter((p) => {
        if (!p.category) return false;
        const normCat = p.category
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]/g, '');

        const normTarget = categoryName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]/g, '');

        const slugTarget = categorySlug.replace(/-/g, '');

        return normCat.includes(normTarget) || normCat.includes(slugTarget);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
      list = list.filter((p) => {
        const normName = p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
        const normDesc = (p.description || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
        return normName.includes(q) || normDesc.includes(q);
      });
    }

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => {
        const pa = a.referencePrice || Number.MAX_SAFE_INTEGER;
        const pb = b.referencePrice || Number.MAX_SAFE_INTEGER;
        return pa - pb;
      });
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => {
        const pa = a.referencePrice || 0;
        const pb = b.referencePrice || 0;
        return pb - pa;
      });
    } else if (sortBy === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }

    return list;
  }, [products, categorySlug, categoryName, searchQuery, sortBy]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium flex-wrap">
        <button
          onClick={() => onNavigate('/')}
          className="hover:text-[#EE4D2D] transition-colors cursor-pointer"
        >
          Trang Chủ
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <button
          onClick={() => onNavigate('/san-pham')}
          className="hover:text-[#EE4D2D] transition-colors cursor-pointer"
        >
          Danh Mục
        </button>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">{categoryName}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-950 text-white p-6 sm:p-8 rounded-3xl shadow-md border border-slate-800 space-y-2">
        <div className="inline-block bg-[#EE4D2D] text-white font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-md uppercase tracking-wider">
          Danh Mục Đồ Câu
        </div>
        <h1 className="text-2xl sm:text-4xl font-black">{categoryName}</h1>
        {categoryDesc && <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">{categoryDesc}</p>}
        <div className="text-xs text-orange-400 font-semibold pt-1">
          Tổng số <strong>{filteredProducts.length}</strong> sản phẩm active trong danh mục
        </div>
      </div>

      {/* Controls */}
      <CatalogControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategorySlug={categorySlug}
        onCategorySelect={(slug) => onNavigate(`/danh-muc/${slug}`)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalFiltered={filteredProducts.length}
      />

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Không có sản phẩm nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hiện chưa có sản phẩm active phù hợp với bộ lọc trong danh mục này.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              onNavigate('/san-pham');
            }}
            className="bg-[#EE4D2D] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      )}
    </div>
  );
};
