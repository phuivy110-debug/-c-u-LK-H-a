import fs from 'fs';
import path from 'path';
import {
  generateRobotsTxt,
  generateRssXml,
  generateSitemapXml,
  loadServerProducts,
  renderSeoPage,
} from '../src/utils/serverSeoRenderer';
import React from 'react';
import { renderToString } from 'react-dom/server';
import App from '../src/App';
import { publicRoutes } from '../src/utils/routes';

const buildDirectory = path.join(process.cwd(), 'dist');
const outputDirectory = path.join(buildDirectory, 'seo');
const products = loadServerProducts();

fs.mkdirSync(outputDirectory, { recursive: true });
fs.writeFileSync(path.join(outputDirectory, 'robots.txt'), generateRobotsTxt(), 'utf8');
fs.writeFileSync(path.join(outputDirectory, 'sitemap.xml'), generateSitemapXml(products), 'utf8');
fs.writeFileSync(path.join(outputDirectory, 'rss.xml'), generateRssXml(products), 'utf8');

// Use Vite's compiled template so every route references the actual hashed JS/CSS.
const templateHtml = fs.readFileSync(path.join(buildDirectory, 'index.html'), 'utf8');
if (!templateHtml.includes('/assets/') || templateHtml.includes('/src/main.tsx')) {
  throw new Error('Run vite build before generating route HTML.');
}
const prerenderRoutes = publicRoutes(products);

for (const route of new Set(prerenderRoutes)) {
  const routeDirectory = route === '/'
    ? buildDirectory
    : path.join(buildDirectory, ...route.split('/').filter(Boolean));
  fs.mkdirSync(routeDirectory, { recursive: true });
  fs.writeFileSync(
    path.join(routeDirectory, 'index.html'),
    renderSeoPage(route, {}, templateHtml, products, renderToString(React.createElement(App, { initialPath: route, initialProducts: products }))),
    'utf8',
  );
}
console.log(`Generated ${prerenderRoutes.length} full HTML pages using compiled assets.`);
