import fs from 'fs';
import path from 'path';
import {
  generateRobotsTxt,
  generateRssXml,
  generateSitemapXml,
  loadServerProducts,
  renderSeoPage,
} from '../src/utils/serverSeoRenderer';
import { CATEGORIES } from '../src/data/products';
import { GUIDE_ARTICLES } from '../src/data/guides';

const outputDirectory = path.join(process.cwd(), 'public', 'seo');
const products = loadServerProducts();

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, 'robots.txt'), generateRobotsTxt(), 'utf8');
fs.writeFileSync(path.join(outputDirectory, 'sitemap.xml'), generateSitemapXml(products), 'utf8');
fs.writeFileSync(path.join(outputDirectory, 'rss.xml'), generateRssXml(products), 'utf8');

const templateHtml = fs.readFileSync(path.join(process.cwd(), 'index.html'), 'utf8');
const prerenderRoutes = [
  '/',
  '/san-pham',
  '/cam-nang',
  '/gioi-thieu-phuong-phap-danh-gia',
  '/quyen-rieng-tu',
  ...CATEGORIES.filter(category => category.slug !== 'tat-ca').map(category => `/danh-muc/${category.slug}`),
  ...products.filter(product => product.status === 'active').map(product => `/san-pham/${product.slug}`),
  ...GUIDE_ARTICLES.map(guide => `/cam-nang/${guide.slug}`),
];

for (const route of new Set(prerenderRoutes)) {
  const routeDirectory = route === '/'
    ? path.join(process.cwd(), 'public')
    : path.join(process.cwd(), 'public', ...route.split('/').filter(Boolean));
  fs.mkdirSync(routeDirectory, { recursive: true });
  fs.writeFileSync(
    path.join(routeDirectory, 'index.html'),
    renderSeoPage(route, {}, templateHtml, products),
    'utf8',
  );
}
