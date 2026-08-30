import { CATEGORIES } from '../data/products';
import { GUIDE_ARTICLES } from '../data/guides';
import type { Product } from '../types';

export function normalizeInternalPath(href: string): string {
  if (!href.startsWith('/') || href.startsWith('//')) return href;
  const [, pathname, suffix] = href.match(/^([^?#]*)(.*)$/)!;
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (clean === '/danh-muc/tat-ca') return `/san-pham${suffix}`;
  if (GUIDE_ARTICLES.some(guide => `/${guide.slug}` === clean)) {
    return `/cam-nang${clean}${suffix}`;
  }
  return `${clean}${suffix}`;
}

export function publicRoutes(products: Product[]): string[] {
  return [...new Set([
    '/', '/san-pham', '/cam-nang', '/gioi-thieu-phuong-phap-danh-gia', '/quyen-rieng-tu',
    ...CATEGORIES.filter(category => category.slug !== 'tat-ca').map(category => `/danh-muc/${category.slug}`),
    ...products.filter(product => product.status === 'active').map(product => `/san-pham/${product.slug}`),
    ...GUIDE_ARTICLES.map(guide => `/cam-nang/${guide.slug}`),
  ])];
}
