import React from 'react';
import { CATEGORIES } from '../data/products';
import { CategoryId, BadgeType } from '../types';
import {
  Sparkles,
  Fish,
  Compass,
  Feather,
  Waves,
  Anchor,
  ShieldCheck,
  Filter,
  ArrowUpDown,
  Flame,
  Award,
  Zap,
  Search,
  X,
} from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: CategoryId;
  onSelectCategory: (id: CategoryId) => void;
  selectedBadge: BadgeType | 'all';
  onSelectBadge: (badge: BadgeType | 'all') => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryCounts: Record<CategoryId, number>;
}

const categoryIconMap: Record<string, React.ReactNode> = {
  Sparkles: <Sparkles className="w-4 h-4" />,
  Fish: <Fish className="w-4 h-4" />,
  Compass: <Compass className="w-4 h-4" />,
  Feather: <Feather className="w-4 h-4" />,
  Waves: <Waves className="w-4 h-4" />,
  Anchor: <Anchor className="w-4 h-4" />,
  ShieldCheck: <ShieldCheck className="w-4 h-4" />,
};

const badgeOptions: { label: string; value: BadgeType | 'all'; icon: React.ReactNode }[] = [
  { label: 'Tất cả nhãn', value: 'all', icon: <Filter className="w-3.5 h-3.5" /> },
  { label: 'Deal hot', value: 'Deal hot', icon: <Flame className="w-3.5 h-3.5 text-orange-500" /> },
  { label: 'Bán chạy', value: 'Bán chạy', icon: <Award className="w-3.5 h-3.5 text-amber-500" /> },
  { label: 'Giảm sâu', value: 'Giảm sâu', icon: <Zap className="w-3.5 h-3.5 text-purple-500" /> },
  { label: 'Shopee Mall', value: 'Shopee Mall', icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> },
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  selectedBadge,
  onSelectBadge,
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
            placeholder="Lọc nhanh tên sản phẩm, thương hiệu..."
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
            <option value="discount">Giảm giá nhiều nhất (%)</option>
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá: Thấp đến Cao</option>
            <option value="price-desc">Giá: Cao đến Thấp</option>
            <option value="rating">Đánh giá sao cao nhất</option>
          </select>
        </div>
      </div>

      {/* Main Category Tabs (Highlighted & Scrollable) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EE4D2D]" />
            <span>Danh Mục Đồ Câu Cần Tìm</span>
          </span>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            Chọn để lọc nhanh sản phẩm
          </span>
        </div>

        {/* Scrollable category pills grid */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat.id;
            const count = categoryCounts[cat.id] || 0;

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 sm:px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border ${
                  isActive
                    ? 'bg-gradient-to-r from-[#EE4D2D] to-orange-600 text-white border-transparent shadow-md shadow-orange-500/25 scale-[1.02]'
                    : 'bg-slate-50 hover:bg-orange-50/60 text-slate-700 border-slate-200/80 hover:border-orange-200 hover:text-[#EE4D2D]'
                }`}
              >
                <div
                  className={`p-1 rounded-lg ${
                    isActive ? 'bg-white/20 text-white' : 'bg-orange-100/60 text-[#EE4D2D]'
                  }`}
                >
                  {categoryIconMap[cat.iconName]}
                </div>
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200/80 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Badge Filter Chips (Deal hot, Bán chạy, Giảm sâu, Shopee Mall) */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-xs font-semibold text-slate-400 shrink-0 mr-1">Lọc theo:</span>
        {badgeOptions.map((b) => {
          const isActive = selectedBadge === b.value;
          return (
            <button
              key={b.value}
              onClick={() => onSelectBadge(b.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {b.icon}
              <span>{b.label}</span>
            </button>
          );
        })}
      </div>

    </div>
  );
};
