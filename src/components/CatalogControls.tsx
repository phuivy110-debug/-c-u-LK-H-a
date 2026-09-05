import React from 'react';
import { Flame, Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES } from '../data/products';
import type { ProductSort } from '../utils/catalog';

interface Props {
  searchQuery: string; onSearchChange: (q: string) => void;
  selectedCategorySlug: string; onCategorySelect: (slug: string) => void;
  sortBy: ProductSort; onSortChange: (sort: ProductSort) => void;
  showSaleOnly?: boolean; onToggleSaleOnly?: () => void;
  totalFiltered: number; saleCount?: number;
}
export function CatalogControls({ searchQuery, onSearchChange, selectedCategorySlug, onCategorySelect,
  sortBy, onSortChange, showSaleOnly, onToggleSaleOnly, totalFiltered, saleCount }: Props) {
  return <div className="space-y-4 rounded-3xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-6">
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 min-w-0">
        <Search aria-hidden="true" className="w-4 h-4 absolute left-3 top-4 text-slate-500" />
        <input id="catalog-search" aria-label="Tìm sản phẩm" type="search" value={searchQuery} onChange={event => onSearchChange(event.target.value)}
          placeholder="Tên sản phẩm, loại đồ câu…" className="w-full min-h-11 pl-10 pr-12 py-3 rounded-xl border border-slate-300 text-base" />
        {searchQuery && <button aria-label="Xóa từ khóa" onClick={() => onSearchChange('')} className="absolute right-0 top-0 min-w-11 min-h-11 flex items-center justify-center"><X className="w-4 h-4" /></button>}
      </div>
      <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
        <SlidersHorizontal className="hidden h-4 w-4 sm:block" aria-hidden="true" />Sắp xếp
        <select value={sortBy} onChange={event => onSortChange(event.target.value as ProductSort)} className="min-h-11 flex-1 min-w-0 rounded-xl border border-slate-300 px-3 text-sm">
          <option value="default">Mặc định</option>
          <option value="discount-desc">🔥 Giảm giá nhiều nhất</option>
          <option value="price-asc">Giá: Thấp đến Cao</option>
          <option value="price-desc">Giá: Cao đến Thấp</option>
          <option value="name-asc">Tên: A - Z</option>
        </select>
      </label>
    </div>
    <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Lọc sản phẩm">
      {onToggleSaleOnly && <button aria-pressed={Boolean(showSaleOnly)} onClick={onToggleSaleOnly}
        className={`inline-flex min-h-11 items-center gap-1.5 whitespace-nowrap rounded-2xl border px-3.5 text-sm font-bold transition-all ${showSaleOnly ? 'border-red-600 bg-gradient-to-r from-red-600 to-[#EE4D2D] text-white shadow-sm' : 'border-red-200 bg-red-50 text-red-700 hover:bg-red-100'}`}>
        <Flame className="h-4 w-4 fill-current" aria-hidden="true" />Deal đang giảm giá ({saleCount || 0})
      </button>}
      {CATEGORIES.map(category => <button key={category.slug} aria-pressed={selectedCategorySlug === category.slug}
        onClick={() => onCategorySelect(category.slug)} className={`min-h-11 px-3 rounded-xl whitespace-nowrap text-sm ${selectedCategorySlug === category.slug ? 'bg-[#EE4D2D] text-white' : 'bg-slate-100 text-slate-700'}`}>{category.name}</button>)}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
      <span role="status">Hiển thị <strong>{totalFiltered}</strong> sản phẩm · Giá tham khảo, kiểm tra lại trên sàn</span>
      {(searchQuery || sortBy !== 'default' || showSaleOnly) && <button className="min-h-11 text-[#EE4D2D] font-semibold" onClick={() => {
        onSearchChange(''); onSortChange('default'); if (showSaleOnly) onToggleSaleOnly?.();
      }}>Xóa bộ lọc</button>}
    </div>
  </div>;
}
