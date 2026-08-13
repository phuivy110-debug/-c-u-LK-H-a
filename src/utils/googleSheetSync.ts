import Papa from 'papaparse';
import { Product, ProductCache } from '../types';
import { generateSlug } from '../data/products';
import { validateAffiliateUrl } from '../components/AffiliateButtons';

export const DEFAULT_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoGVq7tIOSj8pAr-80FuQxNYY_JHVtyZdk6SJd59baBkVlMllh-hDwvm0Zen4FHAcmjtpYQPai9S_w/pubhtml?gid=0&single=true';

export const SHARED_TIKTOK_URL = 'https://vt.tiktok.com/ZS9kJHJuDnoUp-AeYDB/';
export const LKHOA_PRODUCTS_CACHE_V2 = 'lkhoa_products_cache_v2';

export function convertSheetUrlToCsvUrl(url: string): string {
  if (!url || !url.trim()) return url;
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

export function parsePriceNumber(raw: any): number | undefined {
  if (raw === undefined || raw === null || raw === '') return undefined;
  const str = String(raw).replace(/[^\d]/g, '');
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

export function generateStableTechnicalId(name: string, shopeeUrl: string = ''): string {
  const input = name.trim().toLowerCase() + '|' + shopeeUrl.trim().toLowerCase();
  let h1 = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h1 ^= input.charCodeAt(i);
    h1 = Math.imul(h1, 0x01000193);
  }
  const hex = (h1 >>> 0).toString(36);
  return `tech-${generateSlug(name).slice(0, 30)}-${hex}`;
}

export function saveProductsCache(products: Product[]): void {
  try {
    const cache: ProductCache = {
      schemaVersion: 2,
      source: 'google-sheet',
      syncedAt: new Date().toISOString(),
      products,
    };
    localStorage.setItem(LKHOA_PRODUCTS_CACHE_V2, JSON.stringify(cache));
  } catch (err) {
    console.warn('Failed to save product cache:', err);
  }
}

export function loadProductsCache(): ProductCache | null {
  try {
    const raw = localStorage.getItem(LKHOA_PRODUCTS_CACHE_V2);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      parsed.schemaVersion === 2 &&
      parsed.source === 'google-sheet' &&
      Array.isArray(parsed.products)
    ) {
      return parsed as ProductCache;
    }
  } catch {
    // Ignore corrupt cache
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
  const csvUrl = convertSheetUrlToCsvUrl(sheetUrl);
  let csvText = '';

  try {
    const response = await fetch(csvUrl, { cache: 'no-store' });
    if (response.ok) {
      csvText = await response.text();
    }
  } catch (err) {
    console.warn('Direct client fetch from Google Sheet failed, trying server proxy fallback:', err);
  }

  if (!csvText) {
    try {
      const proxyEndpoint =
        typeof window !== 'undefined'
          ? `/api/sync-sheet?url=${encodeURIComponent(sheetUrl)}`
          : `http://localhost:3000/api/sync-sheet?url=${encodeURIComponent(sheetUrl)}`;
      const proxyRes = await fetch(proxyEndpoint);
      if (proxyRes.ok) {
        csvText = await proxyRes.text();
      } else {
        const errJson = await proxyRes.json().catch(() => null);
        throw new Error(errJson?.error || `Không thể tải dữ liệu Sheet (mã ${proxyRes.status})`);
      }
    } catch (proxyErr: any) {
      console.warn('Server proxy fetch for Google Sheet also failed:', proxyErr);
      throw new Error(
        proxyErr.message ||
          'Không thể kết nối với Google Sheet. Vui lòng kiểm tra lại link đã Chia Sẻ Công Khai chưa.'
      );
    }
  }

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedProducts: Product[] = [];
          const slugCounts = new Map<string, number>();

          for (let index = 0; index < results.data.length; index++) {
            const row = results.data[index];
            const sourceRow = index + 2; // 1-based header is row 1

            const name = getExactColumnValue(row, [
              'tensanpham',
              'productname',
              'ten',
              'sanpham',
              'title',
              'name',
            ]);

            if (!name) continue; // Skip rows without product name

            const rawId = getExactColumnValue(row, ['id', 'masp', 'masanpham', 'ma']);

            let rawShopee = getExactColumnValue(row, [
              'linkaffiliateshopee',
              'linkshopee',
              'shopeeurl',
              'linkaffshopee',
              'shopee',
              'linkaff',
            ]);

            let rawTikTok = getExactColumnValue(row, [
              'linkaffiliatetiktok',
              'linktiktok',
              'tiktokurl',
              'tiktokshop',
              'linkafftiktok',
              'tiktok',
            ]);

            if (rawShopee && (rawShopee.includes('tiktok.com') || rawShopee.includes('vt.tiktok'))) {
              if (!rawTikTok) rawTikTok = rawShopee;
              rawShopee = '';
            }
            if (rawTikTok && (rawTikTok.includes('shopee') || rawTikTok.includes('shp.ee'))) {
              if (!rawShopee) rawShopee = rawTikTok;
              rawTikTok = '';
            }

            const validShopee = validateAffiliateUrl(rawShopee, 'shopee');
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

            const id = rawId ? rawId.trim() : generateStableTechnicalId(name, validShopee || '');

            const baseSlug = generateSlug(name) || 'san-pham';
            let slug = baseSlug;

            if (slugCounts.has(baseSlug)) {
              const count = slugCounts.get(baseSlug)! + 1;
              slugCounts.set(baseSlug, count);
              slug = `${baseSlug}-${count}`;
            } else {
              slugCounts.set(baseSlug, 1);
            }

            const categoryRaw = getExactColumnValue(row, [
              'giathamkhao',
              'danhmuc',
              'hangmuc',
              'category',
              'loai',
              'nhom',
            ]);
            let category = categoryRaw || 'Chưa phân loại';
            if (category === categoryRaw && categoryRaw.match(/^\d+$/)) {
              category = 'Chưa phân loại';
            }

            const description = getExactColumnValue(row, ['mota', 'description', 'thongso', 'chitiet']);

            const refPriceRaw = getExactColumnValue(row, [
              'giathamkhao',
              'giaban',
              'giadagiam',
              'referenceprice',
              'price',
            ]);
            const origPriceRaw = getExactColumnValue(row, [
              'giagoc',
              'originalprice',
              'niemyet',
            ]);

            const referencePrice = parsePriceNumber(refPriceRaw);
            const originalPrice = parsePriceNumber(origPriceRaw);

            const imageRaw = getExactColumnValue(row, [
              'linkanh',
              'anhsanpham',
              'imageurl',
              'image',
              'hinhanh',
              'anh',
            ]);
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

          saveProductsCache(parsedProducts);
          resolve(parsedProducts);
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
