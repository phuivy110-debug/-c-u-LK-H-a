import { ProductCard } from './ProductCard';
import { InternalLink } from './InternalLink';
import { recommendedProducts, relatedGuides, guideSections } from '../utils/guideRecommendations';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { GUIDE_ARTICLES } from '../data/guides';
import { Home, ChevronRight, Clock, User, Calendar, ArrowLeft } from 'lucide-react';
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
  const suggestions = recommendedProducts(article, products);
  const readingNext = relatedGuides(article, GUIDE_ARTICLES, products);
  const sections = guideSections(articleContent);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs font-semibold text-slate-400 flex-wrap">
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
        <a
          href="/cam-nang"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/cam-nang');
          }}
          className="hover:text-[#FACC15] transition-colors"
        >
          Cẩm Nang
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
        <span className="text-white font-extrabold truncate max-w-[200px] sm:max-w-xs">
          {article.title}
        </span>
      </nav>

      <button
        onClick={() => onNavigate('/cam-nang')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#FACC15] transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Quay lại danh sách cẩm nang</span>
      </button>

      {/* Article Header */}
      <header className="space-y-4 border-b border-slate-800 pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-[#14532D] text-emerald-200 text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider">
            {article.category}
          </span>
        </div>

        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight font-display">
          {article.title}
        </h1>

        <p className="text-base text-slate-300 leading-relaxed font-medium">
          {article.summary}
        </p>

        <div className="flex items-center gap-4 text-xs font-semibold text-slate-400 pt-3 flex-wrap border-t border-slate-800/80 mt-3">
          <a
            href="/gioi-thieu-phuong-phap-danh-gia"
            onClick={(event) => {
              event.preventDefault();
              onNavigate('/gioi-thieu-phuong-phap-danh-gia');
            }}
            className="flex items-center gap-1.5 font-bold text-slate-200 transition-colors hover:text-[#FACC15]"
            rel="author"
          >
            <User className="w-4 h-4 text-[#FACC15]" />
            {article.author}
          </a>
          <span className="flex items-center gap-1">
            <Calendar className="w-4 h-4 text-slate-500" />
            {article.date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-slate-500" />
            {article.readTime}
          </span>
        </div>
      </header>

      <aside className="rounded-2xl border border-[#FACC15]/30 bg-[#14532D]/20 px-4 py-3 text-xs sm:text-sm text-slate-200 leading-relaxed">
        <strong className="text-[#FACC15]">Minh bạch nội dung:</strong> Sản phẩm chính hãng do Đồ Câu LK Hòa trực tiếp phân phối hoặc liên kết tới gian hàng Shopee / TikTok Shop. Giá thanh toán của bạn luôn công khai, minh bạch.
      </aside>

      {sections.length >= 5 && (
        <details className="rounded-xl border border-slate-800 bg-[#111827] p-4">
          <summary className="min-h-11 flex items-center cursor-pointer font-bold text-white">
            Mục lục bài viết
          </summary>
          <nav aria-label="Mục lục">
            <ol className="list-decimal pl-5 text-slate-300">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="block py-2 text-sm text-[#FACC15] hover:underline"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        </details>
      )}

      {/* Article Markdown Body */}
      <div className="guide-markdown-content bg-[#111827] rounded-2xl p-4 sm:p-8 border border-slate-800 space-y-6 text-slate-200 leading-relaxed text-base">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-6 mb-4 pb-2 border-b border-slate-800">
                {children}
              </h1>
            ),
            h2: ({ children, node }) => (
              <h2
                id={`muc-${node?.position?.start.line}`}
                className="scroll-mt-28 text-xl sm:text-2xl font-black text-white tracking-tight mt-8 mb-3 pt-3 border-t border-slate-800 flex items-center gap-2 font-display"
              >
                <span className="w-2 h-5 bg-[#FACC15] rounded-full inline-block shrink-0"></span>
                <span>{children}</span>
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-lg sm:text-xl font-extrabold text-[#FACC15] mt-6 mb-2">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="text-slate-300 text-base leading-relaxed my-3">{children}</p>
            ),
            strong: ({ children }) => (
              <strong className="font-extrabold text-white">{children}</strong>
            ),
            ul: ({ children }) => (
              <ul className="list-disc pl-6 space-y-2 my-3 text-base text-slate-300">{children}</ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal pl-6 space-y-2 my-3 text-base text-slate-300">{children}</ol>
            ),
            li: ({ children }) => <li className="leading-relaxed">{children}</li>,
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-[#FACC15] bg-slate-900 rounded-r-2xl p-4 my-4 text-xs sm:text-sm text-slate-200 italic">
                {children}
              </blockquote>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-6 rounded-2xl border border-slate-800">
                <table className="w-full text-left text-xs sm:text-sm text-slate-200 divide-y divide-slate-800">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-slate-900 font-black text-[#FACC15]">{children}</thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-slate-800 bg-[#0F172A]">{children}</tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-slate-800/50 transition-colors">{children}</tr>
            ),
            th: ({ children }) => <th className="px-4 py-3 font-extrabold">{children}</th>,
            td: ({ children }) => <td className="px-4 py-3 align-top">{children}</td>,
            hr: () => <hr className="my-6 border-slate-800" />,
            img: ({ src, alt }) => (
              <span className="block my-6 text-center">
                <img
                  src={src}
                  alt={alt || ''}
                  className="mx-auto max-w-full rounded-2xl border border-slate-800 shadow-md max-h-[500px] object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
              </span>
            ),
            em: ({ children }) => (
              <em className="text-slate-400 text-xs sm:text-sm block text-center mt-1.5 mb-4 italic font-normal">
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
                  target={isInternal || href?.startsWith('#') ? undefined : '_blank'}
                  rel={
                    isAffiliate
                      ? 'nofollow sponsored noopener noreferrer'
                      : isInternal
                      ? undefined
                      : 'noopener noreferrer'
                  }
                  onClick={(e) => {
                    if (
                      isInternal &&
                      targetHref &&
                      e.button === 0 &&
                      !e.metaKey &&
                      !e.ctrlKey &&
                      !e.shiftKey &&
                      !e.altKey
                    ) {
                      e.preventDefault();
                      onNavigate(targetHref);
                    }
                  }}
                  className="font-bold text-[#FACC15] hover:underline inline-flex items-center gap-0.5"
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

      {suggestions.length > 0 && (
        <section aria-labelledby="article-products" className="space-y-4 pt-6 border-t border-slate-800">
          <h2 id="article-products" className="text-xl font-bold text-white font-display">
            Sản phẩm liên quan trong bài
          </h2>
          <p className="text-sm text-slate-400">
            Bạn có thể đặt mua trực tiếp COD / VietQR trên website hoặc đối chiếu ưu đãi trên sàn Shopee/TikTok Shop.
          </p>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((product) => (
              <ProductCard
                key={product.slug}
                product={product}
                onOpenDetail={onOpenDetail || ((selected) => onNavigate(`/san-pham/${selected.slug}`))}
                onQuickBuy={() => onNavigate('/thanh-toan')}
                placement="article_related"
                articleSlug={article.slug}
              />
            ))}
          </div>
        </section>
      )}

      {readingNext.length > 0 && (
        <section className="pt-6 border-t border-slate-800 space-y-4">
          <h2 className="text-lg font-bold text-white font-display">Bài Viết Cùng Chủ Đề</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {readingNext.map((related) => (
              <InternalLink
                key={related.slug}
                href={`/cam-nang/${related.slug}`}
                onNavigate={onNavigate}
                className="block bg-[#111827] p-4 rounded-2xl border border-slate-800 hover:border-[#FACC15]/50 space-y-2 transition-colors"
              >
                <h3 className="font-bold text-white">{related.title}</h3>
                <p className="text-sm text-slate-400">{related.summary}</p>
              </InternalLink>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
