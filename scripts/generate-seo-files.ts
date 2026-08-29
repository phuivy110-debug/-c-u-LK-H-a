import fs from 'fs';
import path from 'path';
import {
  generateRobotsTxt,
  generateRssXml,
  generateSitemapXml,
  loadServerProducts,
} from '../src/utils/serverSeoRenderer';

const outputDirectory = path.join(process.cwd(), 'public', 'seo');
const products = loadServerProducts();

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, 'robots.txt'), generateRobotsTxt(), 'utf8');
fs.writeFileSync(path.join(outputDirectory, 'sitemap.xml'), generateSitemapXml(products), 'utf8');
fs.writeFileSync(path.join(outputDirectory, 'rss.xml'), generateRssXml(products), 'utf8');
