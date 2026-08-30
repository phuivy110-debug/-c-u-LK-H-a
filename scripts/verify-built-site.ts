import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { GUIDE_ARTICLES } from '../src/data/guides';
import { loadServerProducts, DOMAIN } from '../src/utils/serverSeoRenderer';
import { normalizeInternalPath, publicRoutes } from '../src/utils/routes';

const build = path.resolve('dist');
const products = loadServerProducts();
const routes = publicRoutes(products);
const sitemap = fs.readFileSync(path.join(build, 'seo/sitemap.xml'), 'utf8');
const sitemapRoutes = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => new URL(match[1]).pathname);
assert.deepEqual(sitemapRoutes.sort(), [...routes].sort(), 'Sitemap and generated routes must match exactly');
assert.equal(normalizeInternalPath('/danh-muc/moi-cau'), '/danh-muc/moi-cau');
assert.equal(normalizeInternalPath('/danh-muc/tat-ca'), '/san-pham');
assert.equal(normalizeInternalPath('/danh-muc/moi-cau?sort=price#items'), '/danh-muc/moi-cau?sort=price#items');
assert.equal(normalizeInternalPath(`/${GUIDE_ARTICLES[0].slug}`), `/cam-nang/${GUIDE_ARTICLES[0].slug}`);

const invalidLinks = new Set<string>();
for (const route of routes) {
  const file = path.join(build, route, 'index.html');
  assert.ok(fs.existsSync(file), `Missing HTML: ${route}`);
  const html = fs.readFileSync(file, 'utf8');
  assert.ok(!html.includes('/src/main.tsx'), `Uncompiled script: ${route}`);
  assert.ok(!/\d+ (?:đang xem|người đang cùng xem|cần thủ đang cùng xem)|Shopee Live|hàng ngàn chuyến câu|an toàn tuyệt đối|bảo mật tuyệt đối|đồng bộ realtime|Giá Sale Shopee Realtime/i.test(html), `Unsupported claim or simulated count: ${route}`);
  assert.equal((html.match(/<h1[ >]/g) || []).length, 1, `Expected one H1: ${route}`);
  assert.ok(html.includes('<header') && html.includes('<footer'), `Missing full layout: ${route}`);
  assert.ok(html.includes(`rel="canonical" href="${DOMAIN}${route}"`), `Wrong canonical: ${route}`);
  const assets = [...html.matchAll(/(?:src|href)="(\/assets\/[^"?#]+)"/g)].map(match => match[1]);
  assert.ok(assets.some(asset => asset.endsWith('.js')) && assets.some(asset => asset.endsWith('.css')), `Missing compiled assets: ${route}`);
  for (const asset of assets) assert.ok(fs.existsSync(path.join(build, asset)), `Missing asset: ${asset}`);
  for (const match of html.matchAll(/<a\b[^>]*\bhref="(\/(?!\/)[^"?#]*)[^\"]*"/g)) {
    const target = match[1].replace(/\/$/, '') || '/';
    if (!routes.includes(target) && !fs.existsSync(path.join(build, target))) invalidLinks.add(`${route} -> ${target}`);
  }
  if (route.startsWith('/san-pham/') || route.startsWith('/danh-muc/')) {
    assert.ok(/<a\b[^>]*href="https:\/\/s\.shopee\.vn\//.test(html), `No purchase link in HTML: ${route}`);
  }
  const guide = GUIDE_ARTICLES.find(item => route === `/cam-nang/${item.slug}`);
  if (guide) {
    const headings = [...guide.contentMarkdown.matchAll(/^##\s+(.+)$/gm)];
    const lastHeading = headings.at(-1)?.[1].replace(/\*\*/g, '').replace(/&/g, '&amp;');
    if (lastHeading) assert.ok(html.includes(lastHeading), `Article truncated: ${route} missing ${lastHeading}`);
  }
}
assert.deepEqual([...invalidLinks], [], 'Internal links must resolve to generated pages');
console.log(`PASS: ${routes.length} pages, full layout/content, compiled assets, sitemap, purchase links and internal destinations.`);
