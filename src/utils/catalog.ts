import type { Product } from '../types';
import { CATEGORIES } from '../data/products';

export type ProductSort = 'default' | 'price-asc' | 'price-desc' | 'name-asc' | 'discount-desc';
export const normalizeSearch = (value: string) => value.toLowerCase().normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').trim().replace(/\s+/g, ' ');
export const productPrice = (product: Product) => {
  const value = product.referencePrice || product.salePrice || 0;
  return Number.isFinite(value) && value > 0 ? value : 0;
};
export const productDiscount = (product: Product) => {
  const price = productPrice(product), original = product.originalPrice || 0;
  return Number.isFinite(original) && original > price && price > 0
    ? Math.round((original - price) / original * 100) : 0;
};
export const formatPrice = (price: number) => new Intl.NumberFormat('vi-VN').format(price) + 'đ';

export function selectProducts(products: Product[], category: string, query: string, sort: ProductSort, discountedOnly = false) {
  const categoryName = CATEGORIES.find(item => item.slug === category)?.name || category;
  const compact = (value: string) => normalizeSearch(value).replace(/[^a-z0-9]/g, '');
  const q = normalizeSearch(query);
  const list = products.filter(product => product.status === 'active'
    && (category === 'tat-ca' || compact(product.category).includes(compact(categoryName)))
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
