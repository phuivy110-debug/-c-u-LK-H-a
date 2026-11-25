import type { Product } from '../types';
import { CATEGORIES } from '../data/products';

export type ProductSort = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'discount-desc';
const PRODUCT_PREFIX_RE = /^(?:\s*\[[^\]]+\]\s*)+/u;
const PROMO_BRACKET_RE = /\[([^\]]*(?:mua|tặng|ra mắt|mở bán|bst|giới hạn)[^\]]*)\]/giu;

const PRODUCT_TERM_CASE: Record<string, string> = {
  lk: 'LK',
  mg: 'MG',
  sv: 'SV',
  pe: 'PE',
  x4: 'X4',
  x8: 'X8',
  daiwa: 'Daiwa',
  carbon: 'Carbon',
  mono: 'Mono',
  lure: 'Lure',
  cod: 'COD',
};

function sentenceCaseProductName(value: string): string {
  const normalized = value.trim().replace(/\s+/g, ' ').toLocaleLowerCase('vi');
  const restored = normalized.replace(/\b(lk|mg|sv|pe|x4|x8|daiwa|carbon|mono|lure|cod)\b/giu, (term) => (
    PRODUCT_TERM_CASE[term.toLocaleLowerCase('vi')] || term
  ));
  return restored ? restored.charAt(0).toLocaleUpperCase('vi') + restored.slice(1) : '';
}

export function productDisplayName(product: Pick<Product, 'name'>): string {
  const withoutPromo = product.name
    .replace(PROMO_BRACKET_RE, ' ')
    .replace(PRODUCT_PREFIX_RE, ' ')
    .replace(/\s*[,|]\s*/g, ' · ')
    .replace(/\s+/g, ' ')
    .trim();
  return sentenceCaseProductName(withoutPromo || product.name);
}

export function productPromoLabel(product: Pick<Product, 'name' | 'isFlashSale'>): string | undefined {
  if (!product.isFlashSale) return undefined;
  const matches = [...product.name.matchAll(PROMO_BRACKET_RE)];
  const label = matches[0]?.[1]?.trim();
  return label ? sentenceCaseProductName(label) : 'Ưu đãi có thời hạn';
}

export const isPromotedProduct = (product: Product) => Boolean(product.isFlashSale);
export const normalizeSearch = (value: string) => value.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim().replace(/\s+/g, ' ');
export const productPrice = (product: Product) => {
  const value = product.referencePrice || product.salePrice || 0;
  return Number.isFinite(value) && value > 0 ? value : 0;
};
export const productDiscount = (product: Product) => {
  if (!isPromotedProduct(product)) return 0;
  const price = productPrice(product), original = product.originalPrice || 0;
  return Number.isFinite(original) && original > price && price > 0
    ? Math.round((original - price) / original * 100) : 0;
};
export const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

function matchesCategorySlug(product: Product, category: string): boolean {
  if (category === 'tat-ca') return true;
  const text = normalizeSearch(`${product.name} ${product.category}`);
  if (category === 'combo') {
    return /\b(combo|bo 2|full bo|tang|bộ 2|bộ)\b/i.test(text);
  }
  if (category === 'moi-lure') {
    return (normalizeSearch(product.category).includes('moi') && /(chuot|lure|coc|bo lk|ca sat|chem|skipping|soft)/i.test(text));
  }
  if (category === 'moi-dai') {
    return (normalizeSearch(product.category).includes('moi') && /(dai|cam|chep|ro phi|thinh|huong lieu|tram)/i.test(text));
  }
  const categoryName = CATEGORIES.find(item => item.slug === category)?.name || category;
  const compact = (value: string) => normalizeSearch(value).replace(/[^a-z0-9]/g, '');
  return compact(product.category).includes(compact(categoryName));
}

export function selectProducts(products: Product[], category: string, query: string, sort: ProductSort, discountedOnly = false) {
  const q = normalizeSearch(query);
  const list = products.filter(product => product.status === 'active'
    && matchesCategorySlug(product, category)
    && (!discountedOnly || productDiscount(product) > 0)
    && (!q || normalizeSearch(`${product.name} ${product.description || ''} ${product.category}`).includes(q)));
  return list.sort((a, b) => {
    if (sort === 'name-asc') return a.name.localeCompare(b.name, 'vi');
    if (sort === 'discount-desc') return productDiscount(b) - productDiscount(a);
    if (sort === 'price-asc' || sort === 'price-desc') {
      const pa = productPrice(a), pb = productPrice(b);
      if (!pa || !pb) return pa ? -1 : pb ? 1 : 0;
      return sort === 'price-asc' ? pa - pb : pb - pa;
    }
    return 0;
  });
}
