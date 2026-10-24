import assert from 'node:assert/strict';
import { FALLBACK_PRODUCTS } from '../src/data/fallbackProducts';
import { RESEARCHED_PRODUCT_COPY } from '../src/data/researchedProductCopy';
import { generateSeoProductDescription, getProductDescription } from '../src/utils/productDescription';

const productsByShopeeUrl = new Map(
  FALLBACK_PRODUCTS.map(product => [product.shopeeUrl, product]),
);
const researchedProducts = Object.entries(RESEARCHED_PRODUCT_COPY);

assert.equal(FALLBACK_PRODUCTS.length, 75);
// Two catalog entries share the same verified Shopee item and researched copy.
assert.equal(researchedProducts.length, 24);
assert.equal(FALLBACK_PRODUCTS.filter(product => product.shopeeUrl && RESEARCHED_PRODUCT_COPY[product.shopeeUrl]).length, 25);

for (const [shopeeUrl, copy] of researchedProducts) {
  const product = productsByShopeeUrl.get(shopeeUrl);
  assert.ok(product, `No catalog product for ${shopeeUrl}`);
  assert.match(copy.sourceUrl, /^https:\/\/docaulkhoa\.com\/san-pham\//);
  assert.ok(copy.detail.length > 200, `Description too short for ${shopeeUrl}`);
  assert.ok(getProductDescription(product).includes(copy.detail), `Research missing from ${product.name}`);
  const oldGeneratedDescription = generateSeoProductDescription({ ...product, shopeeUrl: undefined });
  assert.ok(getProductDescription({ ...product, description: oldGeneratedDescription }).includes(copy.detail));
  const editorialDescription = `Thông tin đã biên tập cho ${product.name}. `.repeat(12);
  assert.equal(getProductDescription({ ...product, description: editorialDescription }), editorialDescription.trim());
}

for (const product of FALLBACK_PRODUCTS) {
  assert.ok(getProductDescription(product).length > 200, `Description too short for ${product.name}`);
}

console.log(`Verified ${researchedProducts.length} researched descriptions and all ${FALLBACK_PRODUCTS.length} catalog products.`);
