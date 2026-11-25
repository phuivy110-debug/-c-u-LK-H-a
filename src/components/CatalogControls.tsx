import React from 'react';
import { Flame, Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import type { ProductSort } from '../utils/catalog';

interface Props {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategorySlug: string;
  onCategorySelect: (slug: string) => void;
  sortBy: ProductSort;
  onSortChange: (sort: ProductSort) => void;
  showSaleOnly?: boolean;
  onToggleSaleOnly?: () => void;
  totalFiltered: number;
  saleCount?: number;
}

export function CatalogControls({
  searchQuery,
  onSearchChange,
  selectedCategorySlug,
  onCategorySelect,
  sortBy,
  onSortChange,
  showSaleOnly,
  onToggleSaleOnly,
  totalFiltered,
  saleCount,
}: Props) {
  return (
    <div className="space-y-4 rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search aria-hidden="true" className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            id="catalog-search"
            aria-label="Tìm sản phẩm"
            type="search"
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Tìm Chuột LK, Cần Solid, Dù PE, Cám chép..."
            className="w-full min-h-11 pl-10 pr-12 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm sm:text-base text-white placeholder:text-slate-400 focus:border-[#FACC15] focus:outline-none"
          />
          {searchQuery && (
            <button
              type="button"
              aria-label="Xóa từ khóa"
              onClick={() => onSearchChange('')}
              className="absolute right-0 top-0 min-w-11 min-h-11 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        <label className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-300">
          <SlidersHorizontal className="hidden h-4 w-4 sm:block text-[#FACC15]" aria-hidden="true" />
          <span>Sắp xếp</span>
          <select
            value={sortBy}
            onChange={(event) => onSortChange(event.target.value as ProductSort)}
            className="min-h-11 flex-1 min-w-0 rounded-xl bg-[#0F172A] border border-slate-700 px-3 text-sm text-white focus:border-[#FACC15] focus:outline-none"
          >
            <option value="default">Mặc định</option>
            {((saleCount || 0) > 0 || sortBy === 'discount-desc') && (
              <option value="discount-desc" disabled={(saleCount || 0) === 0}>Giảm giá nhiều nhất</option>
            )}
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="name-asc">Tên: A - Z</option>
          </select>
        </label>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Lọc sản phẩm">
        {onToggleSaleOnly && (saleCount || 0) > 0 && (
          <button
            type="button"
            aria-pressed={Boolean(showSaleOnly)}
            onClick={onToggleSaleOnly}
            className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-xl border px-3.5 text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
              showSaleOnly
                ? 'border-[#F97316] bg-[#F97316] text-white'
                : 'border-slate-700 bg-[#0F172A] text-[#F97316] hover:border-[#F97316]'
            }`}
          >
            <Flame className="h-4 w-4 fill-current" aria-hidden="true" />
            <span>Đang giảm giá ({saleCount || 0})</span>
          </button>
        )}
        {CATEGORIES.map((category) => (
          <button
            key={category.slug}
            type="button"
            aria-pressed={selectedCategorySlug === category.slug}
            onClick={() => onCategorySelect(category.slug)}
            className={`min-h-11 px-3.5 rounded-xl whitespace-nowrap text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
              selectedCategorySlug === category.slug
                ? 'bg-[#FACC15] border-[#FACC15] text-[#0F172A]'
                : 'bg-[#0F172A] border-slate-700 text-slate-300 hover:border-slate-500 hover:text-white'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm text-slate-400">
        <span role="status">
          Hiển thị <strong className="text-white tabular-nums">{totalFiltered}</strong> sản phẩm chính hãng LK Hòa
        </span>
        {(searchQuery || sortBy !== 'default' || showSaleOnly) && (
          <button
            type="button"
            className="min-h-10 text-[#FACC15] font-bold hover:underline cursor-pointer"
            onClick={() => {
              onSearchChange('');
              onSortChange('default');
              if (showSaleOnly) onToggleSaleOnly?.();
            }}
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
}
