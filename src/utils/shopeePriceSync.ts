import { Product, RealtimeShopeePrice, ShopeePriceMap } from '../types';

const SHOPEE_PRICE_CACHE_KEY = 'lkhoa_shopee_realtime_prices_v1';

/**
 * Load locally cached Shopee realtime prices
 */
export function getLocalShopeePriceCache(): ShopeePriceMap {
  try {
    const raw = localStorage.getItem(SHOPEE_PRICE_CACHE_KEY);
    if (raw) {
      return JSON.parse(raw) as ShopeePriceMap;
    }
  } catch (e) {
    console.warn('Failed to load local Shopee price cache:', e);
  }
  return {};
}

/**
 * Save Shopee realtime prices to localStorage
 */
export function saveLocalShopeePriceCache(priceMap: ShopeePriceMap): void {
  try {
    localStorage.setItem(SHOPEE_PRICE_CACHE_KEY, JSON.stringify(priceMap));
  } catch (e) {
    console.warn('Failed to save local Shopee price cache:', e);
  }
}

/**
 * Fetch latest real-time Shopee prices from server
 */
export async function fetchLiveShopeePrices(): Promise<ShopeePriceMap> {
  try {
    const res = await fetch('/api/shopee-prices', {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.prices) {
        saveLocalShopeePriceCache(data.prices);
        return data.prices;
      }
    }
  } catch (err) {
    console.warn('Live Shopee prices API fetch error:', err);
  }
  return getLocalShopeePriceCache();
}

/**
 * Trigger immediate real-time sync on server
 */
export async function triggerShopeePriceSync(): Promise<{ success: boolean; count: number; prices: ShopeePriceMap; message?: string }> {
  try {
    const res = await fetch('/api/shopee-prices/sync', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data && data.prices) {
        saveLocalShopeePriceCache(data.prices);
        return {
          success: true,
          count: Object.keys(data.prices).length,
          prices: data.prices,
          message: data.message,
        };
      }
    }
    return { success: false, count: 0, prices: {}, message: 'Không thể kết nối máy chủ đồng bộ giá Shopee.' };
  } catch (err: any) {
    return { success: false, count: 0, prices: {}, message: err.message || 'Lỗi kết nối máy chủ' };
  }
}

/**
 * Merge realtime Shopee prices into Product[] array
 */
export function mergeRealtimeShopeePrices(products: Product[], priceMap: ShopeePriceMap): Product[] {
  if (!priceMap || Object.keys(priceMap).length === 0) {
    return products;
  }

  return products.map((product) => {
    // Match by ID, slug, or technical ID
    const livePrice = priceMap[product.id] || priceMap[product.slug];

    if (!livePrice || !livePrice.salePrice) {
      return product;
    }

    const salePrice = livePrice.salePrice;
    let originalPrice = livePrice.originalPrice || product.originalPrice;
    let referencePrice = salePrice;

    // If originalPrice wasn't provided or is less than sale price, check product's initial referencePrice
    if (!originalPrice && product.referencePrice && product.referencePrice > salePrice) {
      originalPrice = product.referencePrice;
    }

    let discountPercent = livePrice.discountPercent;
    if (!discountPercent && originalPrice && originalPrice > salePrice) {
      discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
    }

    const isFlashSale = livePrice.isFlashSale || (discountPercent !== undefined && discountPercent >= 15);

    return {
      ...product,
      salePrice,
      referencePrice,
      originalPrice,
      saleDiscountPercent: discountPercent,
      isFlashSale,
      priceSource: 'shopee-live',
      liveShopeeUpdated: livePrice.syncedAt || new Date().toISOString(),
    };
  });
}
