import React from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { CATEGORIES } from '../data/products';

interface CatalogControlsProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategorySlug: string;
  onCategorySelect: (slug: string) => void;
  sortBy: 'default' | 'price-asc' | 'price-desc' | 'name-asc';
  onSortChange: (sort: 'default' | 'price-asc' | 'price-desc' | 'name-asc') => void;
  totalFiltered: number;
}

export const CatalogControls: React.FC<CatalogControlsProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategorySlug,
  onCategorySelect,
  sortBy,
  onSortChange,
  totalFiltered,
}) => {
  return (
    <div className="space-y-4 bg-white p-4 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs">
      {/* Top Search & Sort Row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Tìm theo tên sản phẩm, cần câu, mồi câu, thương hiệu..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-10 py-2.5 text-xs sm:text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-[#EE4D2D]/30 focus:border-[#EE4D2D] transition-all placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-2 shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-slate-500 hidden sm:inline" />
          <span className="text-xs font-bold text-slate-600 hidden sm:inline">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as any)}
            className="w-full sm:w-auto bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-bold rounded-2xl px-3 py-2.5 focus:outline-hidden focus:ring-2 focus:ring-[#EE4D2D]/30 cursor-pointer"
          >
            <option value="default">Mặc định</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="name-asc">Tên: A - Z</option>
          </select>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategorySlug === cat.slug;
          return (
            <button
              key={cat.slug}
              onClick={() => onCategorySelect(cat.slug)}
              className={`px-3.5 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#EE4D2D] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </div>

      {/* Results Count Banner */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
        <span>Hiển thị <strong>{totalFiltered}</strong> sản phẩm active</span>
        {(searchQuery || selectedCategorySlug !== 'tat-ca') && (
          <button
            onClick={() => {
              onSearchChange('');
              onCategorySelect('tat-ca');
              onSortChange('default');
            }}
            className="text-[#EE4D2D] font-bold hover:underline cursor-pointer"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>
    </div>
  );
};
