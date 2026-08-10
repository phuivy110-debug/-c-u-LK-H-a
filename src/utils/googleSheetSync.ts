import Papa from 'papaparse';
import { Product, CategoryId, BadgeType } from '../types';

export const DEFAULT_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoGVq7tIOSj8pAr-80FuQxNYY_JHVtyZdk6SJd59baBkVlMllh-hDwvm0Zen4FHAcmjtpYQPai9S_w/pubhtml?gid=0&single=true';

const FALLBACK_IMAGES: Record<CategoryId, string[]> = {
  rods: [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
  ],
  reels: [
    'https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=800&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534043464124-3be32fe000c9?q=80&w=800&auto=format&fit=crop',
  ],
  baits: [
    'https://images.unsplash.com/photo-1498654896293-37aacf113fd9?q=80&w=800&auto=format&fit=crop',
  ],
  lines: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop',
  ],
  floats: [
    'https://images.unsplash.com/photo-1516724562728-afc824a36e84?q=80&w=800&auto=format&fit=crop',
  ],
  accessories: [
    'https://images.unsplash.com/photo-1585515320310-259814833e62?q=80&w=800&auto=format&fit=crop',
  ],
  all: [
    'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop',
  ],
};

export function convertSheetUrlToCsvUrl(url: string): string {
  let csvUrl = url.trim();
  if (csvUrl.includes('/pubhtml')) {
    csvUrl = csvUrl.replace('/pubhtml', '/pub');
  }
  if (!csvUrl.includes('output=csv')) {
    if (csvUrl.includes('?')) {
      csvUrl += '&output=csv';
    } else {
      csvUrl += '?output=csv';
    }
  }
  return csvUrl;
}

export function parsePriceNumber(raw: any): number {
  if (!raw) return 0;
  const str = String(raw).replace(/[^\d]/g, '');
  const parsed = parseInt(str, 10);
  return isNaN(parsed) ? 0 : parsed;
}

export function mapCategoryNameToId(catName: string): CategoryId {
  if (!catName) return 'rods';
  const norm = catName.toLowerCase().trim();
  if (norm.includes('cần')) return 'rods';
  if (norm.includes('máy')) return 'reels';
  if (norm.includes('mồi') || norm.includes('thính')) return 'baits';
  if (norm.includes('dây') || norm.includes('thẻo')) return 'lines';
  if (norm.includes('phao') || norm.includes('lưỡi')) return 'floats';
  if (norm.includes('thùng') || norm.includes('phụ kiện')) return 'accessories';
  return 'rods';
}

// Helper to search row object for keys matching candidates (case-insensitive & space-insensitive)
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
      
      // Skip if key contains excluded keywords
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
  // If it's already a direct CDN image URL
  if (
    url.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ||
    url.includes('susercontent.com') ||
    url.includes('cf.shopee.vn')
  ) {
    return url;
  }

  try {
    const res = await fetch('/api/extract-shopee-image', {
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
  } catch (err) {
    console.warn('Failed to extract image from affiliate URL:', err);
  }
  return null;
}

export async function fetchProductsFromGoogleSheet(sheetUrl: string): Promise<Product[]> {
  const csvUrl = convertSheetUrlToCsvUrl(sheetUrl);

  const response = await fetch(csvUrl, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(csvText, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          const parsedProducts: Product[] = [];

          for (let index = 0; index < results.data.length; index++) {
            const row = results.data[index];
            const categoryRaw = getRowValue(row, ['hạngmục', 'category', 'danhmục', 'loại']);
            const title = getRowValue(row, ['tênsảnphẩm', 'productname', 'tên', 'sảnphẩm']);

            if (!title) continue; // skip empty rows

            const DEFAULT_TIKTOK_URL = 'https://vt.tiktok.com/ZS9hEsGU3kHau-stx7x/';
            const DEFAULT_SHOPEE_URL = 'https://s.shopee.vn/7fYvAFHqaP';

            let affiliateUrl = getRowValue(
              row,
              ['linkaffshopee', 'linkshopee', 'shopee', 'linkaffiliate', 'affiliatelink', 'linkaff', 'link', 'url'],
              ['tiktok', 'ttshop', 'vt.tiktok']
            );
            let tiktokUrl = getRowValue(
              row,
              ['linkafftiktok', 'linktiktok', 'tiktokurl', 'tiktokshop', 'shoptiktok', 'tiktoklink', 'afftiktok', 'tiktok'],
              ['shopee', 'shp']
            );

            // Auto-detect and swap if URLs were miscategorized
            if (affiliateUrl && (affiliateUrl.includes('tiktok.com') || affiliateUrl.includes('vt.tiktok'))) {
              if (!tiktokUrl || !tiktokUrl.includes('tiktok')) {
                tiktokUrl = affiliateUrl;
              }
              affiliateUrl = '';
            }

            if (tiktokUrl && (tiktokUrl.includes('shopee') || tiktokUrl.includes('shp.ee'))) {
              if (!affiliateUrl || (!affiliateUrl.includes('shopee') && !affiliateUrl.includes('shp.ee'))) {
                affiliateUrl = tiktokUrl;
              }
              tiktokUrl = '';
            }

            // Full row scan fallback if links are still missing
            if (!tiktokUrl || !tiktokUrl.includes('tiktok')) {
              for (const cellVal of Object.values(row)) {
                if (typeof cellVal === 'string' && (cellVal.includes('tiktok.com') || cellVal.includes('vt.tiktok'))) {
                  tiktokUrl = cellVal.trim();
                  break;
                }
              }
            }

            if (!affiliateUrl || (!affiliateUrl.includes('shopee') && !affiliateUrl.includes('shp.ee'))) {
              for (const cellVal of Object.values(row)) {
                if (typeof cellVal === 'string' && (cellVal.includes('shopee.vn') || cellVal.includes('shp.ee') || cellVal.includes('shopee.com'))) {
                  affiliateUrl = cellVal.trim();
                  break;
                }
              }
            }

            let formattedTikTokUrl = tiktokUrl ? tiktokUrl.trim() : undefined;
            if (formattedTikTokUrl && !formattedTikTokUrl.startsWith('http://') && !formattedTikTokUrl.startsWith('https://')) {
              formattedTikTokUrl = 'https://' + formattedTikTokUrl;
            }
            if (!formattedTikTokUrl) {
              formattedTikTokUrl = DEFAULT_TIKTOK_URL;
            }

            let formattedShopeeUrl = affiliateUrl ? affiliateUrl.trim() : undefined;
            if (formattedShopeeUrl && !formattedShopeeUrl.startsWith('http://') && !formattedShopeeUrl.startsWith('https://')) {
              formattedShopeeUrl = 'https://' + formattedShopeeUrl;
            }
            if (!formattedShopeeUrl) {
              formattedShopeeUrl = DEFAULT_SHOPEE_URL;
            }
            const imageRaw = getRowValue(row, ['ảnhsảnphẩm', 'image', 'hìnhảnh', 'ảnh', 'picture', 'photo']);
            const origPriceRaw = getRowValue(row, ['giágốc', 'originalprice', 'niêmyết']);
            const dealPriceRaw = getRowValue(row, ['giáưuđãi', 'giábán', 'dealprice', 'giákhuyếnmãi', 'giágảm']);

            let origPrice = parsePriceNumber(origPriceRaw);
            let dealPrice = parsePriceNumber(dealPriceRaw);
            const categoryId = mapCategoryNameToId(categoryRaw);

            if (origPrice === 0 && dealPrice > 0) {
              origPrice = Math.round(dealPrice * 1.35);
            } else if (dealPrice === 0 && origPrice > 0) {
              dealPrice = Math.round(origPrice * 0.75);
            } else if (origPrice === 0 && dealPrice === 0) {
              origPrice = 500000;
              dealPrice = 380000;
            }

            if (dealPrice > origPrice) {
              const temp = origPrice;
              origPrice = dealPrice;
              dealPrice = temp;
            }

            const discountPercent =
              origPrice > 0
                ? Math.round(((origPrice - dealPrice) / origPrice) * 100)
                : 25;

            // Image handling: if image is missing or is an affiliate link URL, extract directly from Shopee link
            let image = imageRaw;
            if (
              !image ||
              !image.startsWith('http') ||
              (image.includes('shopee') && !image.includes('susercontent.com') && !image.includes('cf.shopee.vn'))
            ) {
              // Try auto extracting from affiliateUrl if available
              if (affiliateUrl && (affiliateUrl.includes('shopee') || affiliateUrl.includes('shope.ee'))) {
                const extracted = await extractShopeeImageFromLink(affiliateUrl);
                if (extracted) {
                  image = extracted;
                }
              }
            }

            if (!image || !image.startsWith('http')) {
              const fallbacks = FALLBACK_IMAGES[categoryId] || FALLBACK_IMAGES.rods;
              image = fallbacks[index % fallbacks.length];
            }

            const badges: BadgeType[] = ['Shopee Mall'];
            if (discountPercent >= 25) {
              badges.unshift('Giảm sâu');
            } else {
              badges.unshift('Deal hot');
            }
            if (
              title.toUpperCase().includes('MUA') ||
              title.toUpperCase().includes('COMBO') ||
              title.toUpperCase().includes('TẶNG')
            ) {
              badges.push('Bán chạy');
            }

            const rating = +(4.7 + (index % 3) * 0.1).toFixed(1);
            const soldCount = `${(2.5 + (index % 15) * 1.8).toFixed(1)}k`;

            parsedProducts.push({
              id: `sheet-${index + 1}`,
              title,
              category: categoryId,
              originalPrice: origPrice,
              dealPrice: dealPrice,
              discountPercent,
              image,
              badges,
              affiliateUrl: formattedShopeeUrl,
              tiktokUrl: formattedTikTokUrl,
              shopName: 'Đồ Câu LK Hòa Official Store',
              rating,
              soldCount,
              isMall: true,
              couponCode: discountPercent >= 30 ? 'LKHOAMM30' : 'LKHOA10K',
              description: `Sản phẩm đồ câu cá chính hãng LK Hòa trên Shopee Mall. Cam kết chất lượng cao, đúng mô tả, phôi carbon xịn & bảo hành uy tín.`,
              updatedAt: 'Vừa cập nhật từ Google Sheet',
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
