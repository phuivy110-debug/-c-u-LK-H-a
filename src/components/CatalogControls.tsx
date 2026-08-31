import React from 'react';
import { Search, X } from 'lucide-react';
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
  return <div className="space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
    <div className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1 min-w-0">
        <Search aria-hidden="true" className="w-4 h-4 absolute left-3 top-4 text-slate-500" />
        <input id="catalog-search" aria-label="Tìm sản phẩm" type="search" value={searchQuery} onChange={event => onSearchChange(event.target.value)}
          placeholder="Tên sản phẩm, loại đồ câu…" className="w-full min-h-11 pl-10 pr-12 py-3 rounded-xl border border-slate-300 text-base" />
        {searchQuery && <button aria-label="Xóa từ khóa" onClick={() => onSearchChange('')} className="absolute right-0 top-0 min-w-11 min-h-11 flex items-center justify-center"><X className="w-4 h-4" /></button>}
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        Sắp xếp
        <select value={sortBy} onChange={event => onSortChange(event.target.value as ProductSort)} className="min-h-11 flex-1 min-w-0 rounded-xl border border-slate-300 px-3 text-sm">
          <option value="default">Mặc định</option>
          <option value="discount-desc">Giảm giá theo danh mục</option>
          <option value="price-asc">Giá: Thấp đến Cao</option>
          <option value="price-desc">Giá: Cao đến Thấp</option>
          <option value="name-asc">Tên: A - Z</option>
        </select>
      </label>
    </div>
    <div className="flex gap-2 overflow-x-auto pb-1" aria-label="Lọc sản phẩm">
      {CATEGORIES.map(category => <button key={category.slug} aria-pressed={selectedCategorySlug === category.slug}
        onClick={() => onCategorySelect(category.slug)} className={`min-h-11 px-3 rounded-xl whitespace-nowrap text-sm ${selectedCategorySlug === category.slug ? 'bg-[#EE4D2D] text-white' : 'bg-slate-100 text-slate-700'}`}>{category.name}</button>)}
      {onToggleSaleOnly && <button aria-pressed={Boolean(showSaleOnly)} onClick={onToggleSaleOnly}
        className={`min-h-11 px-3 rounded-xl whitespace-nowrap text-sm border ${showSaleOnly ? 'bg-orange-50 border-orange-500' : 'border-slate-200'}`}>Có giảm giá trong danh mục ({saleCount || 0})</button>}
    </div>
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
      <span role="status">Hiển thị {totalFiltered} sản phẩm · Giá tham khảo</span>
      {(searchQuery || sortBy !== 'default' || showSaleOnly) && <button className="min-h-11 text-[#EE4D2D] font-semibold" onClick={() => {
        onSearchChange(''); onSortChange('default'); if (showSaleOnly) onToggleSaleOnly?.();
      }}>Xóa bộ lọc</button>}
    </div>
  </div>;
}
