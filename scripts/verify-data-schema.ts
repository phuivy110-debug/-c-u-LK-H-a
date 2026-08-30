import {
  parsePriceNumber,
  convertSheetUrlToCsvUrl,
  generateStableTechnicalId,
  ensureUniqueProductIds,
  fetchProductsFromGoogleSheet,
  loadProductsCache,
  saveProductsCache,
  DEFAULT_SHEET_URL,
} from '../src/utils/googleSheetSync';
import { Product } from '../src/types';

// Mock localStorage for node test runner
const store: Record<string, string> = {};
(globalThis as any).window = globalThis;
(globalThis as any).localStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => {
    store[key] = value;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const k in store) delete store[k];
  },
};

let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`  ✓ ${message}`);
    passedTests++;
  } else {
    console.error(`  ✕ FAIL: ${message}`);
    failedTests++;
  }
}

async function runTests() {
  console.log('====================================================');
  console.log('🧪 RUNNING LK HOA GOOGLE SHEET & AFFILIATE SYNC TESTS');
  console.log('====================================================\n');

  // ----------------------------------------------------
  // Test Group 0: Default Google Sheet URL Conversion
  // ----------------------------------------------------
  console.log('🔹 Test Group 0: Default Google Sheet URL Conversion');
  const convertedCsvUrl = convertSheetUrlToCsvUrl(DEFAULT_SHEET_URL);
  assert(
    convertedCsvUrl.includes('output=csv'),
    'Google Sheet URL is correctly converted to output=csv'
  );

  // ----------------------------------------------------
  // Test Group 1: Price Parsing & Missing Price Handling
  // ----------------------------------------------------
  console.log('🔹 Test Group 1: Price Parsing');
  assert(parsePriceNumber(undefined) === undefined, 'undefined price yields undefined');
  assert(parsePriceNumber(null) === undefined, 'null price yields undefined');
  assert(parsePriceNumber('') === undefined, 'empty string price yields undefined');
  assert(parsePriceNumber('150.000đ') === 150000, 'formatted "150.000đ" parses to 150000');
  assert(parsePriceNumber('2,500,000') === 2500000, 'formatted "2,500,000" parses to 2500000');

  // ----------------------------------------------------
  // Test Group 2: Product ID Stability & Uniqueness
  // ----------------------------------------------------
  console.log('\n🔹 Test Group 2: Product ID Stability & Uniqueness');
  const id1 = generateStableTechnicalId('Cần câu LK Hòa 5H', 'https://s.shopee.vn/test', 2);
  const id1_repeat = generateStableTechnicalId('Cần câu LK Hòa 5H', 'https://s.shopee.vn/test', 2);
  assert(id1 === id1_repeat, 'generateStableTechnicalId is deterministic for same inputs');
  assert(id1.startsWith('tech-'), 'Generated ID starts with "tech-" prefix');

  const duplicateProductsMock: Product[] = [
    {
      id: 'tech-can-cau-lk',
      slug: 'can-cau-lk-1',
      name: 'Cần câu LK 1',
      category: 'Cần câu',
      status: 'active',
      featured: true,
      tiktokLinkStatus: 'none',
      sourceRow: 2,
    },
    {
      id: 'tech-can-cau-lk',
      slug: 'can-cau-lk-2',
      name: 'Cần câu LK 2',
      category: 'Cần câu',
      status: 'active',
      featured: false,
      tiktokLinkStatus: 'none',
      sourceRow: 3,
    },
  ];

  const deduplicated = ensureUniqueProductIds(duplicateProductsMock);
  const uniqueIdsSet = new Set(deduplicated.map((p) => p.id));
  assert(deduplicated.length === duplicateProductsMock.length, 'No items dropped during deduplication');
  assert(uniqueIdsSet.size === duplicateProductsMock.length, 'All product IDs are completely unique');

  // ----------------------------------------------------
  // Test Group 3: Real Fetching & Syncing 66 Products
  // ----------------------------------------------------
  console.log('\n🔹 Test Group 3: Real Fetching & Syncing from Google Sheet');
  try {
    const products = await fetchProductsFromGoogleSheet(DEFAULT_SHEET_URL);
    assert(products.length === 66, `Fetched exactly 66 products from Google Sheet (got ${products.length})`);

    const shopeeCount = products.filter((p) => p.shopeeUrl && p.shopeeUrl.startsWith('https://s.shopee.vn/')).length;
    assert(shopeeCount === 66, `All 66 products have valid https://s.shopee.vn/ links (got ${shopeeCount})`);

    const shopeeUrls = products.map((p) => p.shopeeUrl);
    const uniqueShopeeUrls = new Set(shopeeUrls);
    assert(uniqueShopeeUrls.size === 66, `All 66 Shopee links are unique (got ${uniqueShopeeUrls.size})`);

    const legacyPropertyCount = products.filter((p: any) => 'affiliateUrl' in p || 'shopee_url' in p).length;
    assert(legacyPropertyCount === 0, `No product contains legacy affiliateUrl or shopee_url properties`);

    // Verify Cache
    saveProductsCache(products, DEFAULT_SHEET_URL);
    const cache = loadProductsCache(DEFAULT_SHEET_URL);
    assert(cache !== null, 'Product cache loaded successfully');
    assert(cache?.schemaVersion === 5, 'Cache schemaVersion is 5');
    assert(cache?.source === 'google-sheet', 'Cache source is "google-sheet"');
    assert(
      cache?.spreadsheetId === '1KO_7U5VJJNKBphq_NNM4MnwbsfDq1GEg6mRGxz4y3B8',
      'Cache spreadsheetId is correct'
    );
    assert(cache?.products.length === 66, 'Cached products count is 66');

  } catch (err: any) {
    console.error('Fetch test failed:', err);
    assert(false, `Fetch failed with error: ${err.message}`);
  }

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`📊 TEST SUMMARY: ${passedTests} PASSED, ${failedTests} FAILED`);
  console.log('====================================================');

  if (failedTests > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests();
