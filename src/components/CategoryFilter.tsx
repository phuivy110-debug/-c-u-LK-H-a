import React from 'react';
import { Search, X, ArrowUpDown, Tag } from 'lucide-react';

interface CategoryFilterProps {
  categories: string[];
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryCounts: Record<string, number>;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selectedCategory,
  onSelectCategory,
  sortBy,
  onSortChange,
  searchQuery,
  onSearchChange,
  categoryCounts,
}) => {
  return (
    <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200/80 mb-8 space-y-5">
      {/* Search & Sort Header Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        {/* Search input in filter bar */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Lọc nhanh tên sản phẩm..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-sm text-slate-800 pl-10 pr-9 py-2.5 rounded-xl border border-slate-200/80 focus:border-[#EE4D2D] focus:ring-2 focus:ring-[#EE4D2D]/20 focus:outline-hidden transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <ArrowUpDown className="w-4 h-4 text-slate-500 shrink-0" />
          <span className="text-xs font-semibold text-slate-500 shrink-0">Sắp xếp:</span>
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="bg-slate-50 border border-slate-200 text-slate-800 text-xs sm:text-sm font-semibold rounded-xl px-3 py-2 focus:ring-2 focus:ring-[#EE4D2D]/20 focus:border-[#EE4D2D] focus:outline-hidden cursor-pointer"
          >
            <option value="default">Mặc định từ Sheet</option>
            <option value="discount">Giảm giá nhiều nhất (%)</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
          </select>
        </div>
      </div>

      {/* Main Category Tabs */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EE4D2D]" />
            <span>Danh Mục Sản Phẩm</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Chọn để lọc sản phẩm
          </span>
        </div>

        {/* Scrollable category pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const count = categoryCounts[cat] || 0;

            return (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#EE4D2D] to-orange-600 text-white border-transparent shadow-md shadow-orange-500/25 scale-[1.02]'
                    : 'bg-slate-50 hover:bg-orange-50/60 text-slate-700 border-slate-200/80 hover:border-orange-200 hover:text-[#EE4D2D]'
                }`}
              >
                <Tag className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-[#EE4D2D]'}`} />
                <span>{cat}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
