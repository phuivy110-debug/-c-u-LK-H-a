import { InternalLink } from './InternalLink';
import { useHistoryState } from '../utils/useHistoryState';
import React from 'react';
import {
  BookOpen,
  ArrowRight,
  Clock,
  User,
  ChevronRight,
  Sparkles,
  Fish,
  Feather,
  Waves,
  Tag,
  Compass,
} from 'lucide-react';
import { GUIDE_ARTICLES } from '../data/guides';

interface HomeGuidesSectionProps {
  onNavigate: (path: string) => void;
}

const TOPIC_FILTERS = [
  { id: 'all', name: 'Tất cả bài viết' },
  { id: 'cam-nang', name: 'Cẩm nang câu cá', icon: Compass },
  { id: 'kinh-nghiem-cau-ca', name: 'Kinh nghiệm câu lure & suối', icon: Fish },
  { id: 'kien-thuc-loai-ca', name: 'Kiến thức loài cá', icon: Feather },
  { id: 'do-cau', name: 'Kỹ thuật đồ câu', icon: Waves },
];

export const HomeGuidesSection: React.FC<HomeGuidesSectionProps> = ({ onNavigate }) => {
  const [selectedTopic, setSelectedTopic] = useHistoryState<string>('home-topic', 'all');

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
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6" id="home-guides-section">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-2 bg-[#14532D]/40 text-emerald-300 border border-[#14532D] text-xs px-3 py-1 rounded-md font-bold uppercase tracking-wider">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Cẩm Nang & Hướng Dẫn Thực Chiến</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight font-display">
            Bí Quyết & Kỹ Thuật Câu Cá Từ LK Hòa
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
            Hướng dẫn chọn cần, pha mồi và lên thẻo dây theo từng địa hình thực tế hồ dịch vụ và sông suối tự nhiên.
          </p>
        </div>

        <button
          onClick={() => onNavigate('/cam-nang')}
          data-cta="true"
          className="cta-btn self-start sm:self-auto bg-slate-900 hover:bg-[#F97316] text-white border border-slate-700 hover:border-[#F97316] font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shrink-0 transition-colors"
        >
          <span>Xem tất cả cẩm nang ({GUIDE_ARTICLES.length})</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Topic Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {TOPIC_FILTERS.map((topic) => {
          const isSelected = selectedTopic === topic.id;
          const Icon = topic.icon;
          return (
            <button
              key={topic.id}
              onClick={() => setSelectedTopic(topic.id)}
              className={`px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                isSelected
                  ? 'bg-[#FACC15] text-slate-950 font-extrabold shadow-xs'
                  : 'bg-[#111827] text-slate-300 border border-slate-800 hover:border-slate-600 hover:text-white'
              }`}
            >
              {Icon && <Icon className="w-3.5 h-3.5" />}
              <span>{topic.name}</span>
            </button>
          );
        })}
      </div>

      {/* Main Guides Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {featuredArticle && (
          <div className="lg:col-span-5 flex flex-col">
            <InternalLink
              href={`/cam-nang/${featuredArticle.slug}`}
              onNavigate={onNavigate}
              className="bg-gradient-to-br from-[#111827] via-[#0F172A] to-[#14532D]/40 text-white rounded-2xl p-6 sm:p-7 border border-slate-800 hover:border-[#FACC15]/50 transition-all cursor-pointer flex-1 flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
                <Fish className="w-56 h-56 text-[#FACC15]" />
              </div>

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="bg-[#F97316]/20 text-orange-300 border border-[#F97316]/40 text-xs font-extrabold px-2.5 py-1 rounded-md flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Bài Viết Nổi Bật</span>
                  </span>

                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{featuredArticle.readTime}</span>
                  </span>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-[#FACC15] uppercase tracking-wide block">
                    {featuredArticle.category}
                  </span>
                  <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-[#FACC15] transition-colors leading-snug font-display">
                    {featuredArticle.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-300 line-clamp-3 leading-relaxed">
                    {featuredArticle.summary}
                  </p>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs relative z-10">
                <span className="text-slate-400 flex items-center gap-1.5 font-medium">
                  <User className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>{featuredArticle.author}</span>
                </span>

                <span className="bg-[#F97316] group-hover:bg-orange-500 text-white font-extrabold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors">
                  <span>Đọc Chi Tiết</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </InternalLink>
          </div>
        )}

        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sideArticles.map((article) => (
            <InternalLink
              key={article.slug}
              href={`/cam-nang/${article.slug}`}
              onNavigate={onNavigate}
              className="bg-[#111827] rounded-2xl border border-slate-800 hover:border-[#FACC15]/50 transition-all cursor-pointer p-4 sm:p-5 flex flex-col justify-between group"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="bg-slate-800 text-[#FACC15] font-bold px-2.5 py-0.5 rounded-md text-[11px]">
                    {article.category}
                  </span>
                  <span className="text-slate-400 text-[11px] flex items-center gap-1 font-medium">
                    <Clock className="w-3 h-3" />
                    {article.readTime}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-extrabold text-white group-hover:text-[#FACC15] transition-colors leading-snug line-clamp-2">
                  {article.title}
                </h4>

                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {article.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-bold text-[#F97316]">
                <span className="text-slate-400 text-[11px] font-normal truncate max-w-[120px]">
                  {article.author.split('-')[0].trim()}
                </span>
                <span className="flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Xem bài</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </InternalLink>
          ))}
        </div>
      </div>

      {/* Quick Topic Shortcuts */}
      <div className="p-4 rounded-2xl bg-[#111827] border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-200">
          <Tag className="w-4 h-4 text-[#FACC15]" />
          <span>Chủ đề được cần thủ quan tâm nhiều nhất:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onNavigate('/cam-nang/cach-chon-can-cau-lure-cho-nguoi-moi')}
            className="bg-slate-900 hover:bg-[#F97316] hover:text-white text-slate-300 border border-slate-700 hover:border-[#F97316] px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer text-xs"
          >
            #Cần Lure Cho Người Mới
          </button>
          <button
            onClick={() => onNavigate('/cam-nang/cach-chon-do-cung-can-cau-dai')}
            className="bg-slate-900 hover:bg-[#F97316] hover:text-white text-slate-300 border border-slate-700 hover:border-[#F97316] px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer text-xs"
          >
            #Độ Cứng Cần Đài 5H-8H
          </button>
          <button
            onClick={() => onNavigate('/cam-nang/cach-chon-moi-cau-chep')}
            className="bg-slate-900 hover:bg-[#F97316] hover:text-white text-slate-300 border border-slate-700 hover:border-[#F97316] px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer text-xs"
          >
            #Công Thức Mồi Chép LK
          </button>
          <button
            onClick={() => onNavigate('/cam-nang/cach-chon-day-pe-cau-lure')}
            className="bg-slate-900 hover:bg-[#F97316] hover:text-white text-slate-300 border border-slate-700 hover:border-[#F97316] px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer text-xs"
          >
            #Dây PE X8 Siêu Bền
          </button>
        </div>
      </div>
    </section>
  );
};
