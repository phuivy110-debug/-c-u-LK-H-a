import assert from 'node:assert/strict';
import fs from 'node:fs';
import React from 'react';
import { renderToString } from 'react-dom/server';
import Papa from 'papaparse';
import { MECUABIN_SHOPEE_LINKS } from '../src/data/mecuabinShopeeLinks';
import { FALLBACK_PRODUCTS } from '../src/data/fallbackProducts';
import { getMecuabinShopeeUrl } from '../src/utils/shopeeAffiliateLinks';
import { AffiliateButtons } from '../src/components/AffiliateButtons';
import {
  DEFAULT_SHEET_URL, ensureUniqueProductIds, fetchProductsFromGoogleSheet,
  generateStableTechnicalId, loadProductsCache, saveProductsCache,
} from '../src/utils/googleSheetSync';
import { loadServerProducts } from '../src/utils/serverSeoRenderer';

const enabled = MECUABIN_SHOPEE_LINKS.filter(entry => entry.url !== null);
const disabled = MECUABIN_SHOPEE_LINKS.filter(entry => entry.url === null);
const allowed = new Set(enabled.map(entry => entry.url));
assert.equal(enabled.length, 72);
assert.equal(disabled.length, 2);
assert.equal(allowed.size, 72);
assert.equal(new Set(MECUABIN_SHOPEE_LINKS.map(entry => entry.itemId)).size, 74);
assert.equal(MECUABIN_SHOPEE_LINKS.flatMap(entry => entry.previousUrls || []).length, 70);

for (const entry of MECUABIN_SHOPEE_LINKS) {
  const expected = entry.url ?? undefined;
  assert.equal(getMecuabinShopeeUrl(entry.name, `https://shopee.vn/product/469572823/${entry.itemId}`), expected);
  for (const url of entry.previousUrls || []) {
    assert.equal(getMecuabinShopeeUrl(entry.name, url), expected);
    assert.equal(getMecuabinShopeeUrl('A renamed product', url), expected);
  }
  for (const name of entry.previousNames || []) {
    assert.equal(getMecuabinShopeeUrl(name), expected);
  }
  if (entry.url) {
    assert.match(entry.url, /^https:\/\/s\.shopee\.vn\/[A-Za-z0-9]+$/);
    assert.equal(getMecuabinShopeeUrl(entry.name, entry.url), entry.url);
  }
}
const ambiguous = enabled.find(entry => enabled.some(other => other !== entry && other.name === entry.name));
assert.ok(ambiguous);
assert.equal(getMecuabinShopeeUrl(ambiguous.name), undefined, 'Never guess between same-name item IDs');
assert.equal(getMecuabinShopeeUrl('Unlisted product', 'https://s.shopee.vn/unknown'), 'https://s.shopee.vn/unknown');

for (const products of [FALLBACK_PRODUCTS, loadServerProducts()]) {
  assert.equal(products.length, 70);
  assert.equal(products.filter(product => product.shopeeUrl).length, 68);
  for (const product of products) {
    if (product.shopeeUrl) assert.ok(allowed.has(product.shopeeUrl), `Old link for ${product.slug}`);
    const html = renderToString(React.createElement(AffiliateButtons, {
      productName: product.name, shopeeUrl: product.shopeeUrl, tiktokUrl: product.tiktokUrl,
    }));
    assert.equal(html.includes('href="https://s.shopee.vn/'), !!product.shopeeUrl);
    assert.ok(html.includes('TikTok'), 'TikTok remains available');
  }
}

// Optional source argument verifies the checked-in assignments against the untouched Shopee export.
if (process.argv[2]) {
  const parsed = Papa.parse<string[]>(fs.readFileSync(process.argv[2], 'utf8'), { skipEmptyLines: true });
  assert.deepEqual(parsed.errors, []);
  const rows = parsed.data.slice(1);
  assert.equal(rows.length, enabled.length);
  for (const row of rows) {
    const entry = enabled.find(item => item.itemId === row[0]);
    assert.ok(entry, `Missing exported item ${row[0]}`);
    assert.equal(entry.name, row[1]);
    assert.equal(entry.url, row[8]);
    assert.equal(row[7], `https://shopee.vn/product/469572823/${entry.itemId}`);
  }
}

const legacyRows = MECUABIN_SHOPEE_LINKS.flatMap(entry =>
  (entry.previousUrls || []).map(url => ({
    name: entry.previousNames?.[0] || entry.name, shopeeUrl: url, category: 'Cần Câu',
    salePrice: '100000', referencePrice: '100000', originalPrice: '150000',
  })),
);
const originalFetch = globalThis.fetch;
const descriptors = ['window', 'localStorage'].map(key => [key, Object.getOwnPropertyDescriptor(globalThis, key)] as const);
const store = new Map<string, string>();
Object.defineProperty(globalThis, 'window', { configurable: true, value: globalThis });
Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, value); },
    removeItem: (key: string) => { store.delete(key); },
  },
});
try {
  globalThis.fetch = async () => new Response(Papa.unparse(legacyRows), { status: 200 });
  const synced = await fetchProductsFromGoogleSheet(DEFAULT_SHEET_URL);
  assert.equal(synced.length, 70);
  assert.equal(synced.filter(product => product.shopeeUrl).length, 68);
  for (const [index, product] of synced.entries()) {
    assert.equal(product.shopeeUrl, getMecuabinShopeeUrl(legacyRows[index].name, legacyRows[index].shopeeUrl));
    assert.equal(product.id, generateStableTechnicalId(product.name, legacyRows[index].shopeeUrl, index + 2));
    assert.equal(product.referencePrice, 100000);
  }
  const stale = FALLBACK_PRODUCTS.map(product => {
    const entry = MECUABIN_SHOPEE_LINKS.find(item =>
      item.url ? item.url === product.shopeeUrl : item.name === product.name);
    assert.ok(entry);
    return { ...product, shopeeUrl: entry.previousUrls?.[0] };
  });
  assert.deepEqual(ensureUniqueProductIds(stale).map(product => product.shopeeUrl), FALLBACK_PRODUCTS.map(product => product.shopeeUrl));
  saveProductsCache(stale);
  assert.deepEqual(loadProductsCache()?.products.map(product => product.shopeeUrl), FALLBACK_PRODUCTS.map(product => product.shopeeUrl));
} finally {
  globalThis.fetch = originalFetch;
  for (const [key, descriptor] of descriptors) {
    if (descriptor) Object.defineProperty(globalThis, key, descriptor);
    else Reflect.deleteProperty(globalThis, key);
  }
}
console.log('PASS affiliate: 72 export links, 68 catalog replacements, 2 hidden links, SSR/buttons/sheet/cache and stable IDs.');
