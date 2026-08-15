import React, { useState } from 'react';
import {
  BookOpen,
  ArrowRight,
  Clock,
  User,
  ChevronRight,
  Sparkles,
  Award,
  CheckCircle2,
  Fish,
  Feather,
  Waves,
  Tag,
  Compass
} from 'lucide-react';
import { GUIDE_ARTICLES, GuideArticle } from '../data/guides';

interface HomeGuidesSectionProps {
  onNavigate: (path: string) => void;
}

const TOPIC_FILTERS = [
  { id: 'all', name: 'Tất cả bài viết' },
  { id: 'cam-nang', name: 'Cẩm nang câu cá', icon: Compass },
  { id: 'kinh-nghiem-cau-ca', name: 'Kinh nghiệm câu lure & suối', icon: Fish },
  { id: 'kien-thuc-loai-ca', name: 'Kiến thức loài cá', icon: Feather },
  { id: 'do-cau', name: 'Kỹ thuật đồ câu', icon: Waves }
];

export const HomeGuidesSection: React.FC<HomeGuidesSectionProps> = ({ onNavigate }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('all');

  const filteredArticles = GUIDE_ARTICLES.filter((art) => {
    if (selectedTopic === 'all') return true;
    if (selectedTopic === 'cam-nang') return art.categorySlug === 'cam-nang';
    if (selectedTopic === 'kinh-nghiem-cau-ca') return art.categorySlug === 'kinh-nghiem-cau-ca';
    if (selectedTopic === 'kien-thuc-loai-ca') return art.categorySlug === 'kien-thuc-loai-ca';
    if (selectedTopic === 'do-cau') return ['can-cau', 'moi-cau', 'day-cau', 'phao-luoi', 'phu-kien'].includes(art.categorySlug);
    return true;
  });

  const featuredArticle = filteredArticles[0] || GUIDE_ARTICLES[0];
  const sideArticles = filteredArticles.slice(1, 5);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8" id="home-guides-section">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200/80 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-orange-500/10 to-amber-500/10 text-[#EE4D2D] border border-orange-500/20 text-xs px-3 py-1 rounded-full font-extrabold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cẩm Nang & Kinh Nghiệm Thực Chiến</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Bí Quyết & Kỹ Thuật Câu Cá Từ LK Hòa
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl font-medium">
            Tổng hợp kinh nghiệm thực chiến: từ cách chọn cần lure, cần đài 5H-8H, bí quyết pha mồi chép, chọn dây PE X8 đến kỹ thuật săn hàng khủng.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/cam-nang')}
          className="self-start sm:self-auto bg-slate-900 hover:bg-[#EE4D2D] text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer shrink-0"
        >
          <span>Xem tất cả cẩm nang ({GUIDE_ARTICLES.length})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Quick Topic Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TOPIC_FILTERS.map((topic) => {
          const isSelected = selectedTopic === topic.id;
          const Icon = topic.icon;
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-[#EE4D2D] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200/80 hover:bg-slate-50 hover:border-orange-200'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{topic.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Guides Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left: Featured Spotlight Article (5 columns on large screen) */}
        {featuredArticle && (
          <div className="lg:col-span-5 flex flex-col">
            <article
              onClick={() => onNavigate(`/cam-nang/${featuredArticle.slug}`)}
              className="bg-gradient-to-br from-slate-900 via-slate-800 to-orange-950 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-slate-800 hover:border-orange-500/50 transition-all cursor-pointer flex-1 flex flex-col justify-between group relative overflow-hidden"
            >
              {/* Background watermark */}
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
                <Fish className="w-56 h-56 text-orange-400" />
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-xs font-black px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bài Viết Nổi Bật</span>
                  </span>

                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{featuredArticle.readTime}</span>
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-orange-400 uppercase tracking-wide block">
                    {featuredArticle.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-orange-300 transition-colors leading-snug">
                    <a
                      href={`/cam-nang/${featuredArticle.slug}`}
                      onClick={(e) => {
                        e.preventDefault();
                        onNavigate(`/cam-nang/${featuredArticle.slug}`);
                      }}
                      className="hover:underline"
                    >
                      {featuredArticle.title}
                    </a>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed font-normal">
                    {featuredArticle.summary}
                  </p>
                </div>

                {/* Practical Advice Highlights */}
                <div className="bg-white/5 backdrop-blur-xs rounded-2xl p-4 border border-white/10 space-y-2 text-xs text-slate-200">
                  <div className="flex items-center gap-2 font-bold text-orange-300">
                    <Award className="w-4 h-4 text-orange-400" />
                    <span>Điểm cốt lõi cần nhớ:</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-300 list-disc pl-4 leading-relaxed">
                    <li>Được đúc kết từ kinh nghiệm thực chiến hàng ngàn chuyến câu của LK Hòa.</li>
                    <li>Áp dụng chuẩn xác cho địa hình sông tự nhiên &amp; hồ câu dịch vụ tại Việt Nam.</li>
                  </ul>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs relative z-10">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-orange-400" />
                  <span>{featuredArticle.author}</span>
                </span>

                <span className="bg-orange-500 hover:bg-orange-600 text-white font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs">
                  <span>Đọc Chi Tiết</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </article>
          </div>
        )}

        {/* Right: Grid of 4 compact articles (7 columns on large screen) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sideArticles.map((article) => (
            <article
              key={article.slug}
              onClick={() => onNavigate(`/cam-nang/${article.slug}`)}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-300 transition-all cursor-pointer p-4 sm:p-5 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-orange-50 text-[#EE4D2D] font-extrabold px-2.5 py-0.5 rounded-lg text-[11px]">
                    {article.category}
                  </span>
                  <span className="text-slate-400 text-[11px] flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-[#EE4D2D] transition-colors leading-snug line-clamp-2">
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
                </h4>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#EE4D2D]">
                <span className="text-slate-400 text-[11px] font-normal truncate max-w-[120px]">
                  {article.author.split('-')[0].trim()}
                </span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Xem bài</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Quick Search Tag Chips */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-50 via-orange-50/40 to-slate-50 border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Tag className="w-4 h-4 text-[#EE4D2D]" />
          <span>Chủ đề được cần thủ quan tâm nhiều nhất:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('/cam-nang/cach-chon-can-cau-lure-cho-nguoi-moi')}
            className="bg-white hover:bg-orange-500 hover:text-white text-slate-700 border border-slate-200 hover:border-orange-500 px-3 py-1 rounded-full font-bold transition-colors cursor-pointer text-xs"
          >
            #Cần Lure Cho Người Mới
          </button>
          <button
            onClick={() => onNavigate('/cam-nang/cach-chon-do-cung-can-cau-dai')}
            className="bg-white hover:bg-orange-500 hover:text-white text-slate-700 border border-slate-200 hover:border-orange-500 px-3 py-1 rounded-full font-bold transition-colors cursor-pointer text-xs"
          >
            #Độ Cứng Cần Đài 5H-8H
          </button>
          <button
            onClick={() => onNavigate('/cam-nang/cach-chon-moi-cau-chep')}
            className="bg-white hover:bg-orange-500 hover:text-white text-slate-700 border border-slate-200 hover:border-orange-500 px-3 py-1 rounded-full font-bold transition-colors cursor-pointer text-xs"
          >
            #Công Thức Mồi Chép LK
          </button>
          <button
            onClick={() => onNavigate('/cam-nang/cach-chon-day-pe-cau-lure')}
            className="bg-white hover:bg-orange-500 hover:text-white text-slate-700 border border-slate-200 hover:border-orange-500 px-3 py-1 rounded-full font-bold transition-colors cursor-pointer text-xs"
          >
            #Dây PE X8 Siêu Bền
          </button>
        </div>
      </div>
    </section>
  );
};
