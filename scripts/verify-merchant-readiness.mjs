import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { loadServerProducts, generateGoogleMerchantXml } = require('../api/_bundled_seo.cjs');
const products = loadServerProducts().filter((product) => product.status === 'active');
assert.ok(products.length >= 75, `Expected at least 75 active products, got ${products.length}`);
for (const product of products) {
  assert.ok(product.id && product.slug && product.name, `Missing identity: ${product.name}`);
  assert.ok(product.imageUrl && /^https?:\/\//.test(product.imageUrl), `Missing image: ${product.name}`);
  assert.ok(Number(product.referencePrice || product.salePrice || product.originalPrice) > 0, `Missing price: ${product.name}`);
  assert.ok((product.description || '').length >= 180, `Thin description: ${product.name}`);
  assert.ok((product.description || '').length >= 180 || (product.variants || []).length > 1 || (product.specs || []).length >= 3, `Thin merchandising data: ${product.name}`);
}
const xml = generateGoogleMerchantXml(products);
assert.equal((xml.match(/<g:id>/g) || []).length, products.length, 'Merchant feed item count mismatch');
for (const tag of ['g:id', 'g:title', 'g:description', 'g:link', 'g:image_link', 'g:availability', 'g:brand']) {
  assert.equal((xml.match(new RegExp(`<${tag}>`, 'g')) || []).length, products.length, `Missing ${tag}`);
}
assert.ok((xml.match(/<g:price>/g) || []).length >= products.length, 'Missing product/shipping prices');
console.log(`PASS Merchant readiness: ${products.length} products, enriched descriptions/variants, required feed fields complete.`);
