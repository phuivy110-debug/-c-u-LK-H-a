import React from 'react';
import { GUIDE_ARTICLES, GuideArticle } from '../data/guides';
import { Home, ChevronRight, Clock, User, Calendar, BookOpen, ExternalLink, ArrowLeft } from 'lucide-react';
import { Product } from '../types';

interface GuideDetailPageProps {
  guideSlug: string;
  products: Product[];
  onNavigate: (path: string) => void;
  onOpenDetail?: (product: Product) => void;
}

export const GuideDetailPage: React.FC<GuideDetailPageProps> = ({
  guideSlug,
  products,
  onNavigate,
  onOpenDetail,
}) => {
  const article = GUIDE_ARTICLES.find((a) => a.slug === guideSlug) || GUIDE_ARTICLES[0];

  // Find related products in the category if available
  const relatedProducts = products
    .filter((p) => p.status === 'active')
    .slice(0, 4);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-500 flex-wrap">
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
        <a
          href="/cam-nang"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/cam-nang');
          }}
          className="hover:text-[#EE4D2D] transition-colors"
        >
          Cẩm Nang
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-extrabold truncate max-w-[200px] sm:max-w-xs">
          {article.title}
        </span>
      </nav>

      <button
        onClick={() => onNavigate('/cam-nang')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#EE4D2D] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách bài viết</span>
      </button>

      {/* Article Header */}
      <header className="space-y-4 border-b border-slate-200 pb-6">
        <div className="inline-block bg-orange-100 text-[#EE4D2D] text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider">
          {article.category}
        </div>

        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          {article.title}
        </h1>

        <p className="text-base text-slate-600 leading-relaxed font-medium">
          {article.summary}
        </p>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-2 flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-700 font-bold">
            <User className="w-4 h-4 text-[#EE4D2D]" />
            {article.author}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-slate-400" />
            {article.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-slate-400" />
            {article.readTime}
          </span>
        </div>
      </header>

      {/* Article Main HTML Body */}
      <div
        className="prose prose-slate max-w-none prose-headings:font-black prose-headings:text-slate-900 prose-h2:text-xl prose-h2:sm:text-2xl prose-h2:mt-8 prose-h2:mb-3 prose-p:text-slate-700 prose-p:leading-relaxed prose-li:text-slate-700 prose-strong:text-slate-900"
        dangerouslySetInnerHTML={{ __html: article.contentHtml }}
      />

      {/* Internal Links to Recommended Categories / Products */}
      <div className="mt-12 bg-orange-50/80 border border-orange-200/80 rounded-3xl p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-[#EE4D2D] font-black text-sm uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          <span>Sản Phẩm Đề Xuất Từ LK Hòa</span>
        </div>
        <h3 className="text-xl font-black text-slate-900">
          Khám Phá Dụng Cụ Câu Cá Phù Hợp Bài Viết
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Tra cứu thông số kỹ thuật, giá tham khảo và liên kết mua Shopee Mall chính hãng cho các dòng sản phẩm đồ câu LK Hòa.
        </p>

        <div className="pt-2 flex flex-wrap gap-2">
          <a
            href="/danh-muc/can-cau"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/danh-muc/can-cau');
            }}
            className="bg-white hover:bg-orange-500 hover:text-white text-slate-800 border border-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            Cần Câu LK Hòa
          </a>
          <a
            href="/danh-muc/moi-cau"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/danh-muc/moi-cau');
            }}
            className="bg-white hover:bg-orange-500 hover:text-white text-slate-800 border border-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            Mồi Câu LK Hòa
          </a>
          <a
            href="/danh-muc/day-cau"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/danh-muc/day-cau');
            }}
            className="bg-white hover:bg-orange-500 hover:text-white text-slate-800 border border-slate-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            Dây Câu LK Hòa
          </a>
          <a
            href="/san-pham"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/san-pham');
            }}
            className="bg-[#EE4D2D] hover:bg-orange-600 text-white text-xs font-extrabold px-4 py-2 rounded-xl transition-all shadow-xs"
          >
            Xem Tất Cả 66 Sản Phẩm
          </a>
        </div>
      </div>
    </div>
  );
};
