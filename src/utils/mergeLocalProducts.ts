import type { Product } from '../types';
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';

export function mergeWithLocalAdditions(incoming: Product[]): Product[] {
  const namesWithoutShopee = new Set(incoming.filter(product => !product.shopeeUrl).map(product => product.name.trim()));
  const existingKeys = new Set(
    incoming.flatMap(product => [product.id, product.slug, product.shopeeUrl].filter(Boolean)),
  );
  const localAdditions = FALLBACK_PRODUCTS.filter(product => {
    if (!product.shopeeUrl && namesWithoutShopee.has(product.name.trim())) return false;
    return ![product.id, product.slug, product.shopeeUrl].filter(Boolean).some(key => existingKeys.has(key));
  });
  return [...localAdditions, ...incoming];
}
