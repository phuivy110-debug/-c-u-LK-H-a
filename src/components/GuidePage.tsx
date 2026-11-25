import { normalizeSearch } from '../utils/catalog';
import { useHistoryState } from '../utils/useHistoryState';
import { InternalLink } from './InternalLink';
import React, { useMemo } from 'react';
import { GUIDE_ARTICLES } from '../data/guides';
import { Clock, User, ArrowRight, ChevronRight, Home, Search } from 'lucide-react';

interface GuidePageProps {
  onNavigate: (path: string) => void;
}

export const GuidePage: React.FC<GuidePageProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useHistoryState<string>('guide-category', 'all');
  const [searchQuery, setSearchQuery] = useHistoryState<string>('guide-query', '');

  const categories = useMemo(() => {
    const cats = Array.from(new Set(GUIDE_ARTICLES.map((a) => a.category)));
    return ['Tất cả', ...cats];
  }, []);

  const filteredArticles = useMemo(() => {
    return GUIDE_ARTICLES.filter((article) => {
      const matchCat =
        selectedCategory === 'all' ||
        selectedCategory === 'Tất cả' ||
        article.category === selectedCategory;
      const q = normalizeSearch(searchQuery);
      const matchQuery =
        !q ||
        normalizeSearch(article.title).includes(q) ||
        normalizeSearch(article.summary).includes(q) ||
        (article.keywords && article.keywords.some((k) => normalizeSearch(k).includes(q)));
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-400">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
          }}
          className="hover:text-[#FACC15] flex items-center gap-1 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Trang Chủ</span>
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-white font-extrabold">Cẩm Nang Câu Cá LK Hòa</span>
      </nav>

      <header className="space-y-2">
        <h1 className="text-2xl sm:text-3xl font-black text-white font-display">
          Cẩm Nang Đồ Câu LK Hòa
        </h1>
        <p className="text-sm text-slate-400">
          Kinh nghiệm câu cá thực chiến và hướng dẫn chọn đồ câu theo từng địa hình.
        </p>
      </header>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#111827] p-4 rounded-2xl border border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto min-w-0 w-full sm:flex-1 sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected =
              (selectedCategory === 'all' && cat === 'Tất cả') || selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === 'Tất cả' ? 'all' : cat)}
                className={`min-h-11 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#FACC15] text-slate-950 font-extrabold'
                    : 'bg-slate-900 text-slate-300 border border-slate-800 hover:border-slate-600'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div className="relative w-full sm:w-64 sm:shrink-0">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            aria-label="Tìm cẩm nang"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm cẩm nang..."
            className="w-full min-h-11 pl-9 pr-3 py-2 bg-[#0F172A] border border-slate-700 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-hidden focus:border-[#FACC15]"
          />
        </div>
      </div>

      {/* Guide Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12 bg-[#111827] rounded-2xl border border-slate-800 p-8 space-y-3">
          <p className="text-slate-400 text-sm font-semibold">
            Không tìm thấy bài viết phù hợp với từ khóa.
          </p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-[#FACC15] hover:underline cursor-pointer"
          >
            Xem tất cả bài viết
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <InternalLink
              key={article.slug}
              href={`/cam-nang/${article.slug}`}
              onNavigate={onNavigate}
              className="bg-[#111827] rounded-2xl border border-slate-800 hover:border-[#FACC15]/50 transition-all cursor-pointer flex flex-col justify-between p-5 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="bg-slate-800 text-[#FACC15] font-extrabold px-2.5 py-1 rounded-md">
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    {article.readTime}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-extrabold text-white group-hover:text-[#FACC15] transition-colors leading-snug">
                  {article.title}
                </h2>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-[#F97316]">
                <span className="flex items-center gap-1 text-slate-400 font-normal">
                  <User className="w-3.5 h-3.5" />
                  {article.author}
                </span>
                <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Đọc bài viết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </InternalLink>
          ))}
        </div>
      )}
    </div>
  );
};
