import Papa from 'papaparse';
import { Product, ProductCache } from '../types';
import { generateSlug } from '../data/products';
import { validateAffiliateUrl } from '../components/AffiliateButtons';

export const DEFAULT_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1KO_7U5VJJNKBphq_NNM4MnwbsfDq1GEg6mRGxz4y3B8/edit?gid=0#gid=0';

export const PUBLISHED_FALLBACK_CSV_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoGVq7tIOSj8pAr-80FuQxNYY_JHVtyZdk6SJd59baBkVlMllh-hDwvm0Zen4FHAcmjtpYQPai9S_w/pub?output=csv&gid=0';

export const PRODUCT_CACHE_KEY = 'lkhoa_products_google_sheet_v3';
export const SHARED_TIKTOK_URL = 'https://vt.tiktok.com/ZS9kJHJuDnoUp-AeYDB/';

export const SHOPEE_HOSTNAMES = [
  's.shopee.vn',
  'shopee.vn',
  'www.shopee.vn',
  'shp.ee',
  'shope.ee',
];

export function extractSpreadsheetId(url: string): string {
  if (!url) return '1KO_7U5VJJNKBphq_NNM4MnwbsfDq1GEg6mRGxz4y3B8';
  const match = url.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (match && match[1]) return match[1];
  return '1KO_7U5VJJNKBphq_NNM4MnwbsfDq1GEg6mRGxz4y3B8';
}

export function convertSheetUrlToCsvUrl(url: string): string {
  if (!url || !url.trim()) return PUBLISHED_FALLBACK_CSV_URL;
  let cleanUrl = url.trim();

  if (cleanUrl.includes('/pubhtml') || cleanUrl.includes('/pub')) {
    if (cleanUrl.includes('/pubhtml')) {
      cleanUrl = cleanUrl.replace('/pubhtml', '/pub');
    }
    if (!cleanUrl.includes('output=csv')) {
      cleanUrl += cleanUrl.includes('?') ? '&output=csv' : '?output=csv';
    }
    return cleanUrl;
  }

  const docIdMatch = cleanUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (docIdMatch && docIdMatch[1]) {
    const docId = docIdMatch[1];
    if (docId === '1KO_7U5VJJNKBphq_NNM4MnwbsfDq1GEg6mRGxz4y3B8') {
      return PUBLISHED_FALLBACK_CSV_URL;
    }
    let gid = '0';
    const gidMatch = cleanUrl.match(/[?&]gid=(\d+)/) || cleanUrl.match(/#gid=(\d+)/);
    if (gidMatch && gidMatch[1]) {
      gid = gidMatch[1];
    }
    return `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;
  }

  if (!cleanUrl.includes('output=csv') && !cleanUrl.includes('export?format=csv')) {
    cleanUrl += cleanUrl.includes('?') ? '&output=csv' : '?output=csv';
  }
  return cleanUrl;
}

export function isValidShopeeUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) return false;
  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();
    return SHOPEE_HOSTNAMES.some((valid) => hostname === valid || hostname.endsWith('.' + valid));
  } catch {
    return false;
  }
}

export function parsePriceNumber(raw: any): number | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  const trimmed = String(raw).trim();
  if (trimmed.startsWith('-')) return undefined;
  const str = trimmed.replace(/[^\d]/g, '');
  if (!str) return undefined;
  const parsed = parseInt(str, 10);
  return isNaN(parsed) || parsed <= 0 ? undefined : parsed;
}

export function normalizeHeader(header: string): string {
  if (!header) return '';
  return header
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]/g, '');
}

export const HEADER_ALIASES = {
  category: ['hangmuccategory', 'hangmuc', 'danhmuc', 'category', 'nhom', 'loai'],
  name: ['tensanpham', 'productname', 'ten', 'sanpham', 'title', 'name'],
  shopeeUrl: [
    'linkaffiliate',
    'linkaffiliateshopee',
    'linkaffshopee',
    'linkshopee',
    'shopeeurl',
  ],
  tiktokUrl: [
    'linkaffiliatetiktok',
    'linktiktok',
    'linkafftiktok',
    'tiktokurl',
  ],
  image: ['anhsanpham', 'linkanh', 'imageurl', 'image', 'hinhanh', 'anh'],
  salePrice: [
    'giasale',
    'giasaleshopee',
    'giakhuyenmai',
    'giadagiam',
    'saleprice',
    'giamgia',
    'sale',
    'giashopee',
  ],
  referencePrice: [
    'giathamkhao',
    'referenceprice',
    'giaban',
    'price',
    'thamkhao',
  ],
  originalPrice: [
    'giagoc',
    'originalprice',
    'niemyet',
    'giachuagiam',
    'giatruockhuyenmai',
  ],
};

export function getExactColumnValue(
  row: Record<string, string>,
  targetNormalizedKeys: string[]
): string {
  const keys = Object.keys(row);
  for (const targetKey of targetNormalizedKeys) {
    for (const key of keys) {
      if (normalizeHeader(key) === targetKey) {
        const val = row[key];
        if (val !== undefined && val !== null) {
          const trimmed = String(val).trim();
          if (trimmed) return trimmed;
        }
      }
    }
  }
  return '';
}

export function generateStableTechnicalId(name: string, shopeeUrl: string = '', sourceRow?: number): string {
  const input = name.trim().toLowerCase() + '|' + shopeeUrl.trim().toLowerCase() + (sourceRow ? `|row${sourceRow}` : '');
  let h1 = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  const hex = (h1 >>> 0).toString(36);
  return `tech-${generateSlug(name).slice(0, 30)}-${hex}`;
}

export function ensureUniqueProductIds(products: Product[]): Product[] {
  const seenIds = new Set<string>();
  return products.map((p, idx) => {
    let id = p.id || `prod-${idx + 1}`;
    if (seenIds.has(id)) {
      id = `${id}-row${p.sourceRow || idx + 1}`;
      let counter = 1;
      while (seenIds.has(id)) {
        id = `${p.id || 'prod'}-row${p.sourceRow || idx + 1}-${counter}`;
        counter++;
      }
    }
    seenIds.add(id);
    return { ...p, id };
  });
}

export function cleanupLegacyCaches(): void {
  if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
  const legacyKeys = [
    'dealngon247_products_data_v1',
    'lkhoa_products_cache_v2',
    'lkhoa_products_cache',
    'products_data',
    'dealngon247_products',
  ];
  legacyKeys.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {}
  });
}

export function saveProductsCache(products: Product[], spreadsheetUrl: string = DEFAULT_SHEET_URL): void {
  try {
    cleanupLegacyCaches();
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return;
    const sanitizedProducts = ensureUniqueProductIds(products);
    const cache: ProductCache = {
      schemaVersion: 3,
      source: 'google-sheet',
      spreadsheetId: extractSpreadsheetId(spreadsheetUrl),
      syncedAt: new Date().toISOString(),
      products: sanitizedProducts,
    };
    localStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(cache));
  } catch (err) {
    console.warn('Failed to save product cache:', err);
  }
}

export function loadProductsCache(spreadsheetUrl: string = DEFAULT_SHEET_URL): ProductCache | null {
  try {
    cleanupLegacyCaches();
    if (typeof window === 'undefined' || typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(PRODUCT_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    const expectedSpreadsheetId = extractSpreadsheetId(spreadsheetUrl);

    if (
      parsed &&
      parsed.schemaVersion === 3 &&
      parsed.source === 'google-sheet' &&
      parsed.spreadsheetId === expectedSpreadsheetId &&
      Array.isArray(parsed.products)
    ) {
      const hasInvalidSchema = parsed.products.some(
        (p: any) => !p || 'affiliateUrl' in p || 'shopee_url' in p
      );
      if (hasInvalidSchema) {
        localStorage.removeItem(PRODUCT_CACHE_KEY);
        return null;
      }

      const sanitized = ensureUniqueProductIds(parsed.products);
      return {
        ...parsed,
        products: sanitized,
      } as ProductCache;
    } else {
      localStorage.removeItem(PRODUCT_CACHE_KEY);
    }
  } catch {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      localStorage.removeItem(PRODUCT_CACHE_KEY);
    }
  }
  return null;
}

export async function extractShopeeImageFromLink(url: string): Promise<string | undefined> {
  if (!url) return undefined;
  try {
    const response = await fetch('/api/extract-shopee-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    const data = await response.json();
    if (data.success && data.imageUrl) {
      return data.imageUrl;
    }
  } catch (err) {
    console.warn('Failed to extract Shopee image:', err);
  }
  return undefined;
}

export async function fetchProductsFromGoogleSheet(sheetUrl: string): Promise<Product[]> {
  let csvUrl = convertSheetUrlToCsvUrl(sheetUrl);

  try {
    const urlObj = new URL(csvUrl);
    urlObj.searchParams.set('_sync', Date.now().toString());
    csvUrl = urlObj.toString();
  } catch {}

  let csvText = '';

  try {
    const response = await fetch(csvUrl, {
      cache: 'no-store',
      headers: { Accept: 'text/csv,text/plain,*/*' },
    });
    if (response.ok) {
      const text = await response.text();
      if (text && !text.includes('<!DOCTYPE html>') && !text.includes('<html')) {
        csvText = text;
      }
    }
  } catch (err) {
    console.warn('Direct client fetch from Google Sheet failed, trying server proxy fallback:', err);
  }

  if (!csvText) {
    try {
      const proxyEndpoint =
        typeof window !== 'undefined'
          ? `/api/sync-sheet?url=${encodeURIComponent(sheetUrl)}&_sync=${Date.now()}`
          : `http://localhost:3000/api/sync-sheet?url=${encodeURIComponent(sheetUrl)}&_sync=${Date.now()}`;
      const proxyRes = await fetch(proxyEndpoint, { cache: 'no-store' });
      if (proxyRes.ok) {
        const text = await proxyRes.text();
        if (text && !text.includes('<!DOCTYPE html>') && !text.includes('<html')) {
          csvText = text;
        }
      }
    } catch (proxyErr: any) {
      console.warn('Server proxy fetch for Google Sheet also failed:', proxyErr);
    }
  }

  if (!csvText && PUBLISHED_FALLBACK_CSV_URL) {
    try {
      const fallbackUrl = `${PUBLISHED_FALLBACK_CSV_URL}&_sync=${Date.now()}`;
      const fallbackRes = await fetch(fallbackUrl, { cache: 'no-store' });
      if (fallbackRes.ok) {
        const text = await fallbackRes.text();
        if (text && !text.includes('<!DOCTYPE html>') && !text.includes('<html')) {
          csvText = text;
        }
      }
    } catch (fbErr) {
      console.warn('Published fallback fetch failed:', fbErr);
    }
  }

  if (!csvText) {
    throw new Error(
      'Không thể kết nối với Google Sheet. Vui lòng kiểm tra lại đường dẫn chia sẻ.'
    );
  }

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        try {
          const parsedProducts: Product[] = [];
          const slugCounts = new Map<string, number>();

          for (let index = 0; index < results.data.length; index++) {
            const row = results.data[index];
            const sourceRow = index + 2; // 1-based header is row 1

            const name = getExactColumnValue(row, HEADER_ALIASES.name);
            if (!name) continue;

            const rawId = getExactColumnValue(row, ['id', 'masp', 'masanpham', 'ma']);

            let rawShopee = getExactColumnValue(row, HEADER_ALIASES.shopeeUrl);
            let rawTikTok = getExactColumnValue(row, HEADER_ALIASES.tiktokUrl);

            if (rawShopee && (rawShopee.includes('tiktok.com') || rawShopee.includes('vt.tiktok'))) {
              if (!rawTikTok) rawTikTok = rawShopee;
              rawShopee = '';
            }
            if (rawTikTok && (rawTikTok.includes('shopee') || rawTikTok.includes('shp.ee'))) {
              if (!rawShopee) rawShopee = rawTikTok;
              rawTikTok = '';
            }

            const validShopee = isValidShopeeUrl(rawShopee) ? rawShopee.trim() : undefined;
            let validTikTok = validateAffiliateUrl(rawTikTok, 'tiktok');

            let tiktokLinkStatus: 'verified-product' | 'shared-unverified' | 'none' = 'none';
            if (validTikTok) {
              if (
                validTikTok.includes('ZS9kJHJuDnoUp-AeYDB') ||
                validTikTok === SHARED_TIKTOK_URL
              ) {
                tiktokLinkStatus = 'shared-unverified';
              } else {
                tiktokLinkStatus = 'verified-product';
              }
            } else {
              validTikTok = SHARED_TIKTOK_URL;
              tiktokLinkStatus = 'shared-unverified';
            }

            const id = rawId ? rawId.trim() : generateStableTechnicalId(name, validShopee || '', sourceRow);

            const baseSlug = generateSlug(name) || 'san-pham';
            let slug = baseSlug;

            if (slugCounts.has(baseSlug)) {
              const count = slugCounts.get(baseSlug)! + 1;
              slugCounts.set(baseSlug, count);
              slug = `${baseSlug}-${count}`;
            } else {
              slugCounts.set(baseSlug, 1);
            }

            const categoryRaw = getExactColumnValue(row, HEADER_ALIASES.category);
            let category = categoryRaw || 'Chưa phân loại';
            if (category === categoryRaw && categoryRaw.match(/^\d+$/)) {
              category = 'Chưa phân loại';
            }

            const description = getExactColumnValue(row, ['mota', 'description', 'thongso', 'chitiet']);

            const rawSalePrice = parsePriceNumber(getExactColumnValue(row, HEADER_ALIASES.salePrice));
            const rawRefPrice = parsePriceNumber(getExactColumnValue(row, HEADER_ALIASES.referencePrice));
            const rawOrigPrice = parsePriceNumber(getExactColumnValue(row, HEADER_ALIASES.originalPrice));

            let salePrice: number | undefined = rawSalePrice;
            let referencePrice: number | undefined = rawRefPrice;
            let originalPrice: number | undefined = rawOrigPrice;

            // Intelligent Price Reconciliation:
            if (salePrice && referencePrice) {
              if (referencePrice > salePrice) {
                // referencePrice is higher, so treat it as original price and salePrice as active sale price
                if (!originalPrice) originalPrice = referencePrice;
                referencePrice = salePrice;
              } else if (salePrice > referencePrice) {
                if (!originalPrice) originalPrice = salePrice;
              }
            } else if (salePrice && !referencePrice) {
              referencePrice = salePrice;
            } else if (referencePrice && !salePrice) {
              if (originalPrice && originalPrice <= referencePrice) {
                originalPrice = undefined;
              }
            }

            let saleDiscountPercent: number | undefined = undefined;
            let isFlashSale = false;

            if (originalPrice && referencePrice && originalPrice > referencePrice) {
              saleDiscountPercent = Math.round(((originalPrice - referencePrice) / originalPrice) * 100);
              if (saleDiscountPercent >= 15) {
                isFlashSale = true;
              }
            }

            const imageRaw = getExactColumnValue(row, HEADER_ALIASES.image);
            const imageUrl = imageRaw && (imageRaw.startsWith('http://') || imageRaw.startsWith('https://'))
              ? imageRaw
              : undefined;

            const statusRaw = getExactColumnValue(row, ['trangthai', 'status', 'tinhtrang']).toLowerCase();
            const status: 'active' | 'inactive' =
              ['inactive', 'an', 'off', 'disabled', '0', 'khonghoatdong'].includes(statusRaw)
                ? 'inactive'
                : 'active';

            const featuredRaw = getExactColumnValue(row, ['noibat', 'featured', 'hot', 'ishot']).toLowerCase();
            const featured = ['1', 'true', 'yes', 'co', 'hot', 'x'].includes(featuredRaw);

            parsedProducts.push({
              id,
              slug,
              name,
              category,
              description: description || undefined,
              referencePrice,
              originalPrice,
              salePrice,
              saleDiscountPercent,
              isFlashSale,
              liveShopeeUpdated: new Date().toISOString(),
              priceSource: salePrice ? 'google-sheet' : 'default',
              imageUrl,
              shopeeUrl: validShopee,
              tiktokUrl: validTikTok,
              tiktokLinkStatus,
              status,
              featured,
              updatedAt: new Date().toISOString(),
              sourceRow,
            });
          }

          const finalProducts = ensureUniqueProductIds(parsedProducts);
          saveProductsCache(finalProducts, sheetUrl);
          resolve(finalProducts);
        } catch (err) {
          reject(err);
        }
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}
