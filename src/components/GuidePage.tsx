import React from 'react';
import { GUIDE_ARTICLES, GuideArticle } from '../data/guides';
import { BookOpen, Calendar, Clock, User, ArrowRight, ChevronRight, Home, Fish } from 'lucide-react';

interface GuidePageProps {
  onNavigate: (path: string) => void;
}

export const GuidePage: React.FC<GuidePageProps> = ({ onNavigate }) => {
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
            <span>Kinh Nghiệm & Kỹ Thuật Câu Cá</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
            Cẩm Nang Đồ Câu LK Hòa
          </h1>
          <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
            Tổng hợp kinh nghiệm chọn cần câu, kỹ thuật trộn mồi chép, chọn dây PE X8 và bí quyết đi câu giải trí đỉnh cao từ LK Hòa.
          </p>
        </div>
        <div className="absolute right-4 bottom-4 opacity-10 pointer-events-none hidden sm:block">
          <Fish className="w-64 h-64 text-orange-400" />
        </div>
      </div>

      {/* Guide Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GUIDE_ARTICLES.map((article) => (
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

              <h2 className="text-lg font-extrabold text-slate-900 group-hover:text-[#EE4D2D] transition-colors leading-snug">
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
    </div>
  );
};
