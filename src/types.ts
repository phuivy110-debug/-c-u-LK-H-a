export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  slug: string;
  iconName?: string;
  description?: string;
  aliases?: string[];
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  description?: string;

  referencePrice?: number;
  originalPrice?: number;
  salePrice?: number;
  saleDiscountPercent?: number;
  isFlashSale?: boolean;
  liveShopeeUpdated?: string;
  priceSource?: 'shopee-live' | 'google-sheet' | 'default';

  imageUrl?: string;
  shopeeUrl?: string;
  tiktokUrl?: string;
  tiktokLinkStatus: 'verified-product' | 'shared-unverified' | 'none';

  status: 'active' | 'inactive';
  featured: boolean;
  updatedAt?: string;
  sourceRow: number;
}

export interface RealtimeShopeePrice {
  productId: string;
  productName?: string;
  shopeeUrl?: string;
  salePrice: number;
  originalPrice?: number;
  discountPercent?: number;
  isFlashSale?: boolean;
  stock?: number;
  syncedAt: string;
  source: 'shopee-realtime' | 'google-sheet';
}

export type ShopeePriceMap = Record<string, RealtimeShopeePrice>;

export interface ProductCache {
  schemaVersion: number;
  source: 'google-sheet';
  spreadsheetId: string;
  syncedAt: string;
  products: Product[];
}

export interface ReasonItem {
  id: string;
  title: string;
  description: string;
  icon: string;
}

export interface AnalyticsStats {
  totalPageViews: number;
  todayPageViews: number;
  yesterdayPageViews: number;
  activeUsersOnline: number;
  todayConversions?: number;
  totalAffiliateClicks?: number;
  satisfactionRate?: number;
  activeProvincesCount?: number;
  mobilePercent: number;
  desktopPercent: number;
  hourlyTraffic: { hour: string; views: number }[];
  weeklyTraffic: { date: string; day: string; views: number }[];
  topCategories: { name: string; views: number; percent: number }[];
  recentActivities: { id: string; time: string; location: string; action: string }[];
  lastUpdated: string;
  systemStatus?: string;
  updateCycle?: string;
}
