import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GUIDE_ARTICLES, GuideArticle } from '../data/guides';
import { Home, ChevronRight, Clock, User, Calendar, BookOpen, ArrowLeft, Tag } from 'lucide-react';
import { Product } from '../types';
import { sanitizeGuideMarkdown } from '../utils/guideContent';
import { normalizeInternalPath } from '../utils/routes';
import { NotFoundPage } from './NotFoundPage';

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
  const article = GUIDE_ARTICLES.find((a) => a.slug === guideSlug);
  const articleContent = React.useMemo(
    () => sanitizeGuideMarkdown(article?.contentMarkdown || ''),
    [article?.contentMarkdown],
  );

  React.useEffect(() => {
    if (article) {
      document.title = article.metaTitle || `${article.title} | Đồ Câu LK Hòa`;
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', article.metaDescription || article.summary);

      if (article.keywords && article.keywords.length > 0) {
        let metaKw = document.querySelector('meta[name="keywords"]');
        if (!metaKw) {
          metaKw = document.createElement('meta');
          metaKw.setAttribute('name', 'keywords');
          document.head.appendChild(metaKw);
        }
        metaKw.setAttribute('content', article.keywords.join(', '));
      }
    }
  }, [article]);

  if (!article) return <NotFoundPage />;

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
        <span>Quay lại danh sách cẩm nang</span>
      </button>

      {/* Article Header */}
      <header className="space-y-4 border-b border-slate-200 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-orange-100 text-[#EE4D2D] text-xs font-black px-3 py-1 rounded-lg uppercase tracking-wider">
            {article.category}
          </span>
          {article.keywords && article.keywords.slice(0, 3).map((kw, i) => (
            <span key={i} className="bg-slate-100 text-slate-600 text-xs font-bold px-2.5 py-0.5 rounded-md flex items-center gap-1">
              <Tag className="w-3 h-3 text-slate-400" />
              <span>#{kw}</span>
            </span>
          ))}
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
          {article.title}
        </h1>

        <p className="text-base text-slate-600 leading-relaxed font-medium">
          {article.summary}
        </p>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-2 flex-wrap border-t border-slate-100 mt-3">
          <a
            href="/gioi-thieu-phuong-phap-danh-gia"
            onClick={(event) => {
              event.preventDefault();
              onNavigate('/gioi-thieu-phuong-phap-danh-gia');
            }}
            className="flex items-center gap-1.5 font-bold text-slate-700 transition-colors hover:text-[#EE4D2D]"
            rel="author"
          >
            <User className="w-4 h-4 text-[#EE4D2D]" />
            {article.author}
          </a>
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

      <aside className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs sm:text-sm text-amber-950 leading-relaxed">
        <strong>Minh bạch nội dung:</strong> Một số liên kết trong bài là liên kết tiếp thị liên kết.
        Website có thể nhận hoa hồng nếu bạn mua qua liên kết, nhưng giá thanh toán của bạn không tăng.
        Nhận định trong bài được tách biệt với mức hoa hồng.
      </aside>

      {/* Article Markdown Body */}
      <div className="guide-markdown-content bg-white rounded-3xl p-6 sm:p-10 border border-slate-200/80 shadow-xs space-y-6 text-slate-800 leading-relaxed text-base">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-6 mb-4 pb-2 border-b border-slate-200">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-8 mb-3 pt-3 border-t border-slate-100 flex items-center gap-2">
                <span className="w-2 h-5 bg-[#EE4D2D] rounded-full inline-block"></span>
                <span>{children}</span>
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 mt-6 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-slate-700 text-sm sm:text-base leading-relaxed my-3">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-extrabold text-slate-900">{children}</strong>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 space-y-2 my-3 text-sm sm:text-base text-slate-700">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 space-y-2 my-3 text-sm sm:text-base text-slate-700">
                {children}
              </ol>
            ),
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-amber-500 bg-amber-50/80 rounded-r-2xl p-4 my-4 text-xs sm:text-sm text-slate-700 italic">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 rounded-2xl border border-slate-200 shadow-2xs">
                <table className="w-full text-left text-xs sm:text-sm text-slate-700 divide-y divide-slate-200">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-slate-100 font-black text-slate-900">{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-slate-100 bg-white">{children}</tbody>
            ),
            tr: ({ children }) => <tr className="hover:bg-slate-50/80 transition-colors">{children}</tr>,
            th: ({ children }) => <th className="px-4 py-3 font-extrabold">{children}</th>,
            td: ({ children }) => <td className="px-4 py-3 align-top">{children}</td>,
            hr: () => <hr className="my-6 border-slate-200" />,
            img: ({ src, alt }) => (
              <figure className="my-6 text-center">
                <img
                  src={src}
                  alt={alt || ''}
                  className="mx-auto max-w-full rounded-2xl border border-slate-200 shadow-md max-h-[500px] object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </figure>
            ),
            em: ({ children }) => (
              <em className="text-slate-500 text-xs sm:text-sm block text-center mt-1.5 mb-4 italic font-normal">
                {children}
              </em>
            ),
            a: ({ href, children }) => {
              const isInternal = Boolean(href?.startsWith('/') && !href.startsWith('//'));
              const targetHref = isInternal && href ? normalizeInternalPath(href) : href;
              const isAffiliate = Boolean(href && /(shopee\.|s\.shopee\.|tiktok\.|vt\.tiktok\.)/i.test(href));
              return (
                <a
                  href={targetHref}
                  target={isInternal ? undefined : '_blank'}
                  rel={isAffiliate ? 'sponsored nofollow noopener noreferrer' : (isInternal ? undefined : 'noopener noreferrer')}
                  onClick={(e) => {
                    if (isInternal && targetHref && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
                      e.preventDefault();
                      onNavigate(targetHref);
                    }
                  }}
                  className="font-bold text-[#EE4D2D] hover:underline inline-flex items-center gap-0.5"
                >
                  {children}
                </a>
              );
            },
          }}
        >
          {articleContent}
        </ReactMarkdown>
      </div>

      {/* Other Related Guides */}
      <div className="pt-6 border-t border-slate-200 space-y-4">
        <h3 className="text-lg font-black text-slate-900">
          Bài Viết Cùng Chủ Đề
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {GUIDE_ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 4).map((related) => (
            <div
              key={related.slug}
              onClick={() => onNavigate(`/cam-nang/${related.slug}`)}
              className="bg-white p-4 rounded-2xl border border-slate-200 hover:border-orange-300 hover:shadow-xs transition-all cursor-pointer space-y-1.5"
            >
              <div className="flex items-center justify-between text-xs">
                <span className="text-[#EE4D2D] font-bold text-[11px] bg-orange-50 px-2 py-0.5 rounded">
                  {related.category}
                </span>
                <span className="text-slate-400 text-[11px] flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {related.readTime}
                </span>
              </div>
              <h4 className="text-sm font-extrabold text-slate-900 line-clamp-2 hover:text-[#EE4D2D] transition-colors">
                {related.title}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                {related.summary}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Internal Links to Recommended Categories / Products */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200/80 rounded-3xl p-6 sm:p-8 space-y-4">
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
