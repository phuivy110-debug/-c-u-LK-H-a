import React, { useState, useMemo } from 'react';
import { GUIDE_ARTICLES, GuideArticle } from '../data/guides';
import { BookOpen, Clock, User, ArrowRight, ChevronRight, Home, Fish, Search, Filter } from 'lucide-react';

interface GuidePageProps {
  onNavigate: (path: string) => void;
}

export const GuidePage: React.FC<GuidePageProps> = ({ onNavigate }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

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
      const q = searchQuery.toLowerCase().trim();
      const matchQuery =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.summary.toLowerCase().includes(q) ||
        (article.keywords && article.keywords.some((k) => k.toLowerCase().includes(q)));
      return matchCat && matchQuery;
    });
  }, [selectedCategory, searchQuery]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
          }}
          className="hover:text-[#EE4D2D] flex items-center gap-1 transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          <span>Trang Chủ</span>
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-extrabold">Cẩm Nang Câu Cá LK Hòa</span>
      </nav>

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white rounded-3xl p-6 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="relative z-10 space-y-3 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs px-3 py-1 rounded-full font-bold">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Kinh Nghiệm, Kỹ Thuật & Đánh Giá Sản Phẩm</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Cẩm Nang Đồ Câu LK Hòa
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
            Tổng hợp kinh nghiệm câu cá thực chiến, kỹ thuật chọn cần câu, mồi câu, máy câu và cẩm nang chi tiết cho toàn bộ sản phẩm LK Hòa.
          </p>
        </div>
        <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none hidden sm:block">
          <Fish className="w-64 h-64 text-orange-400" />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isSelected =
              (selectedCategory === 'all' && cat === 'Tất cả') || selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat === 'Tất cả' ? 'all' : cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#EE4D2D] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm kiếm cẩm nang..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-orange-500/20 focus:border-[#EE4D2D]"
          />
        </div>
      </div>

      {/* Guide Articles Grid */}
      {filteredArticles.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-8 space-y-3">
          <p className="text-slate-500 text-sm font-semibold">Không tìm thấy bài viết phù hợp với từ khóa.</p>
          <button
            onClick={() => {
              setSelectedCategory('all');
              setSearchQuery('');
            }}
            className="text-xs font-bold text-[#EE4D2D] hover:underline"
          >
            Xem tất cả bài viết
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredArticles.map((article) => (
            <article
              key={article.slug}
              onClick={() => onNavigate(`/cam-nang/${article.slug}`)}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-300 transition-all cursor-pointer flex flex-col justify-between p-5 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="bg-orange-50 text-[#EE4D2D] font-extrabold px-2.5 py-1 rounded-lg">
                    {article.category}
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {article.readTime}
                  </span>
                </div>

                <h2 className="text-base sm:text-lg font-extrabold text-slate-900 group-hover:text-[#EE4D2D] transition-colors leading-snug">
                  <a
                    href={`/cam-nang/${article.slug}`}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(`/cam-nang/${article.slug}`);
                    }}
                    className="hover:underline"
                  >
                    {article.title}
                  </a>
                </h2>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#EE4D2D]">
                <span className="flex items-center gap-1 text-slate-400 font-normal">
                  <User className="w-3.5 h-3.5" />
                  {article.author}
                </span>
                <span className="flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  <span>Đọc bài viết</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

