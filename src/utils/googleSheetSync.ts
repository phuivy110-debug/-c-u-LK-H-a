import Papa from 'papaparse';
import { Product } from '../types';
import { generateSlug } from '../data/products';
import { validateAffiliateUrl } from '../components/AffiliateButtons';

export const DEFAULT_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoGVq7tIOSj8pAr-80FuQxNYY_JHVtyZdk6SJd59baBkVlMllh-hDwvm0Zen4FHAcmjtpYQPai9S_w/pubhtml?gid=0&single=true';

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

export function parsePriceNumber(raw: any): number {
  if (raw === undefined || raw === null || raw === '') return 0;
  const str = String(raw).replace(/[^\d]/g, '');
  if (!str) return 0;
  const parsed = parseInt(str, 10);
  return isNaN(parsed) || parsed < 0 ? 0 : parsed;
}

export function mapCategoryName(catName: string): string {
  if (!catName || !catName.trim()) return 'Chưa phân loại';
  return catName.trim();
}

function getRowValue(
  row: Record<string, string>,
  candidateSubstrings: string[],
  excludeSubstrings: string[] = []
): string {
  const rowKeys = Object.keys(row);
  for (const candidate of candidateSubstrings) {
    const normCandidate = candidate.toLowerCase().replace(/\s+/g, '');
    for (const key of rowKeys) {
      const normKey = key.toLowerCase().replace(/\s+/g, '');

      const isExcluded = excludeSubstrings.some((ex) => normKey.includes(ex.toLowerCase()));
      if (isExcluded) continue;

      if (normKey.includes(normCandidate) || normCandidate.includes(normKey)) {
        if (row[key] !== undefined && row[key] !== null) {
          const val = String(row[key]).trim();
          if (val) return val;
        }
      }
    }
  }
  return '';
}

export async function extractShopeeImageFromLink(affiliateUrl: string): Promise<string | null> {
  if (!affiliateUrl || !affiliateUrl.trim()) return null;

  const url = affiliateUrl.trim();
  if (
    url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ||
    url.includes('susercontent.com') ||
    url.includes('cf.shopee.vn')
  ) {
    return url;
  }

  try {
    const endpoint = typeof window !== 'undefined' ? '/api/extract-shopee-image' : 'http://localhost:3000/api/extract-shopee-image';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url }),
    });
    if (res.ok) {
      const data = await res.json();
      if (data.success && data.imageUrl) {
        return data.imageUrl;
      }
    }
  } catch {
    // Silent fail if image extraction is unavailable
  }
  return null;
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
      const proxyEndpoint = typeof window !== 'undefined' 
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
      throw new Error(proxyErr.message || 'Không thể kết nối với Google Sheet. Vui lòng kiểm tra lại link đã Chia Sẻ Công Khai chưa.');
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
            const name = getRowValue(row, ['tênsảnphẩm', 'productname', 'tên', 'sảnphẩm', 'name']);

            if (!name) continue; // Skip rows without name

            const baseSlug = generateSlug(name) || 'san-pham';
            let slug = baseSlug;

            if (slugCounts.has(baseSlug)) {
              const count = slugCounts.get(baseSlug)! + 1;
              slugCounts.set(baseSlug, count);
              slug = `${baseSlug}-${count}`;
            } else {
              slugCounts.set(baseSlug, 1);
            }

            const rawId = getRowValue(row, ['id', 'mãsp', 'mãsảnphẩm', 'mã']);
            const id = rawId ? rawId.trim() : `prod-${slug}`;

            const categoryRaw = getRowValue(row, ['hạngmục', 'category', 'danhmục', 'loại', 'nhóm']);
            const category = mapCategoryName(categoryRaw);

            // Affiliate URLs
            let rawShopee = getRowValue(
              row,
              ['linkaffiliateshopee', 'linkshopee', 'shopee', 'linkaffshopee', 'shopeeurl', 'linkaff', 'link', 'url'],
              ['tiktok', 'ttshop', 'vt.tiktok']
            );
            let rawTikTok = getRowValue(
              row,
              ['linkaffiliatetiktok', 'linktiktok', 'tiktokshop', 'tiktokurl', 'linkafftiktok', 'tiktok'],
              ['shopee', 'shp']
            );

            // Auto-detect and swap if misplaced
            if (rawShopee && (rawShopee.includes('tiktok.com') || rawShopee.includes('vt.tiktok'))) {
              if (!rawTikTok) rawTikTok = rawShopee;
              rawShopee = '';
            }
            if (rawTikTok && (rawTikTok.includes('shopee') || rawTikTok.includes('shp.ee'))) {
              if (!rawShopee) rawShopee = rawTikTok;
              rawTikTok = '';
            }

            const validShopee = validateAffiliateUrl(rawShopee, 'shopee');
            const validTikTok = validateAffiliateUrl(rawTikTok, 'tiktok');

            // Image handling
            let imageRaw = getRowValue(row, ['linkảnh', 'ảnhsảnphẩm', 'imageurl', 'image', 'hìnhảnh', 'ảnh', 'picture', 'photo']);
            let imageUrl = imageRaw && imageRaw.startsWith('http') ? imageRaw : '';

            if (!imageUrl && validShopee) {
              const extracted = await extractShopeeImageFromLink(validShopee);
              if (extracted) imageUrl = extracted;
            }

            // Prices
            const origPriceRaw = getRowValue(row, ['giágốc', 'originalprice', 'niêmyết']);
            const dealPriceRaw = getRowValue(row, ['giá', 'giáthamkhảo', 'giábán', 'dealprice', 'giáưuđãi', 'giákhuyếnmãi']);

            const origPrice = parsePriceNumber(origPriceRaw);
            const dealPrice = parsePriceNumber(dealPriceRaw);

            parsedProducts.push({
              id,
              slug,
              name,
              category,
              price: dealPrice,
              originalPrice: origPrice,
              imageUrl,
              shopeeUrl: validShopee,
              tiktokUrl: validTikTok,
            });
          }

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
