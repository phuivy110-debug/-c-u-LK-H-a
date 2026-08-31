import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { loadServerProducts } from '../src/utils/serverSeoRenderer';
import { FALLBACK_PRODUCTS } from '../src/data/fallbackProducts';
import { GUIDE_ARTICLES } from '../src/data/guides';
import { GUIDE_PRODUCT_SLUGS } from '../src/data/guideRecommendations';
import { selectProducts, normalizeSearch, productDiscount } from '../src/utils/catalog';
import { recommendedProducts, relatedGuides, guideSections } from '../src/utils/guideRecommendations';
import { sanitizeGuideMarkdown } from '../src/utils/guideContent';
import { AffiliateButtons, validateAffiliateUrl } from '../src/components/AffiliateButtons';
import { GuideDetailPage } from '../src/components/GuideDetailPage';
import { SHARED_TIKTOK_URL } from '../src/utils/googleSheetSync';
import { trackAffiliateClick } from '../src/utils/analyticsService';

const products = loadServerProducts();
assert.equal(normalizeSearch('  CÁM   CHÉP ĐỎ '), 'cam chep do');
const findGuides = (q: string) => GUIDE_ARTICLES.filter(a => [a.title, a.summary, ...(a.keywords || [])].some(value => normalizeSearch(value).includes(normalizeSearch(q)))).map(a => a.slug);
assert.deepEqual(findGuides('cam chep'), findGuides('cám chép'));
for (const source of [products, FALLBACK_PRODUCTS]) {
  for (const category of ['tat-ca', 'can-cau', 'moi-cau']) {
    const sorted = selectProducts(source, category, '', 'discount-desc');
    assert.ok(sorted.every((p, i) => i === 0 || productDiscount(sorted[i - 1]) >= productDiscount(p)));
  }
  assert.deepEqual(selectProducts(source, 'tat-ca', 'cam chep', 'default'), selectProducts(source, 'tat-ca', 'cám chép', 'default'));
}
assert.equal(productDiscount({ ...products[0], referencePrice: 0, salePrice: 0, saleDiscountPercent: 90 }), 0);
const missing = { ...products[0], id: 'missing', referencePrice: 0, salePrice: 0 };
for (const sort of ['price-asc', 'price-desc'] as const) assert.equal(selectProducts([missing, products[0]], 'tat-ca', '', sort).at(-1)?.id, 'missing');

for (const [guide, slugs] of Object.entries(GUIDE_PRODUCT_SLUGS)) {
  assert.ok(GUIDE_ARTICLES.some(a => a.slug === guide), `Unknown article mapping: ${guide}`);
  for (const slug of slugs) assert.ok(products.some(p => p.slug === slug) || FALLBACK_PRODUCTS.some(p => p.slug === slug), `Unknown product mapping: ${slug}`);
}
let covered = 0;
for (const article of GUIDE_ARTICLES) {
  const recommended = recommendedProducts(article, products);
  if (recommended.length) covered++;
  assert.ok(recommended.length <= 3);
  assert.equal(new Set(recommended.map(p => p.slug)).size, recommended.length);
  assert.ok(recommended.every(p => p.status === 'active' && validateAffiliateUrl(p.shopeeUrl, 'shopee')));
  assert.equal(recommendedProducts(article, products.map(p => ({ ...p, status: 'inactive' }))).length, 0);
  const html = renderToString(<GuideDetailPage guideSlug={article.slug} products={products} onNavigate={() => {}} />);
  const sections = guideSections(sanitizeGuideMarkdown(article.contentMarkdown));
  if (sections.length >= 5) {
    assert.ok(html.includes('Mục lục bài viết'));
    for (const section of sections) assert.ok(html.includes(`id="${section.id}"`), `Missing heading: ${article.slug} ${section.id}`);
  }
  if (recommended.length && relatedGuides(article, GUIDE_ARTICLES, products).length) assert.ok(html.indexOf('id="article-products"') < html.indexOf('Bài Viết Cùng Chủ Đề'));
}
assert.equal(recommendedProducts({ ...GUIDE_ARTICLES[0], slug: 'not-mapped', relatedProducts: [], contentMarkdown: 'Không có sản phẩm.' }, products).length, 0);
const fiveH = recommendedProducts(GUIDE_ARTICLES.find(a => a.slug === 'so-sanh-can-cau-dai-lk-hoa-5h-6h-8h')!, products);
assert.equal(fiveH.length, 2);
assert.ok(fiveH.every(p => /5H/i.test(p.name)));
for (const slug of ['cach-pha-moi-cam-chep-lk', 'so-sanh-day-pe-x4-va-x8-lk-hoa']) assert.ok(recommendedProducts(GUIDE_ARTICLES.find(a => a.slug === slug)!, products).length >= 2);

// Exercise click handlers locally with a fake GA sink: never open a marketplace or send traffic.
const events: unknown[][] = [];
const previousWindow = globalThis.window;
try {
  Object.assign(globalThis, { window: { location: { hostname: 'docaulkhoa.vn', href: 'https://docaulkhoa.vn/cam-nang/test' }, gtag: (...args: unknown[]) => events.push(args) } });
  const buttons = AffiliateButtons({ productId: 'test-product', productName: 'Test', shopeeUrl: 'https://s.shopee.vn/test', tiktokUrl: SHARED_TIKTOK_URL, tiktokLinkStatus: 'verified-product', placement: 'article_related', articleSlug: 'test' });
  const anchors = React.Children.toArray(buttons.props.children).filter((child): child is React.ReactElement<any> => React.isValidElement(child) && child.type === 'a');
  for (const anchor of anchors) anchor.props.onClick({ stopPropagation() {} });
  assert.equal(events.length, 2, 'Exactly one affiliate event per click');
  assert.equal(events[0][1], 'affiliate_click');
  assert.equal((events[0][2] as any).link_placement, 'article_related');
  assert.equal((events[0][2] as any).article_slug, 'test');
  assert.equal((events[1][2] as any).destination_type, 'store');
  for (const hostname of ['localhost', '127.0.0.1', 'preview.vercel.app']) {
    (window.location as any).hostname = hostname;
    trackAffiliateClick('shopee', 'https://s.shopee.vn/test');
  }
  assert.equal(events.length, 2, 'Local and preview traffic must not reach GA');
} finally {
  if (previousWindow) Object.assign(globalThis, { window: previousWindow });
  else Reflect.deleteProperty(globalThis, 'window');
}
const template = fs.readFileSync('index.html', 'utf8');
assert.ok(template.includes("['docaulkhoa.vn', 'www.docaulkhoa.vn'].includes(window.location.hostname)"));
assert.ok(!template.includes('<script async src="https://www.googletagmanager.com'));
console.log(`PASS UI/UX: search, sorts, exact mappings, ${covered}/${GUIDE_ARTICLES.length} articles with verified catalogue matches, all article TOCs, and isolated affiliate tracking.`);
