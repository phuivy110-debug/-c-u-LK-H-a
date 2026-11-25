export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  slug: string;
  iconName?: string;
  description?: string;
  aliases?: string[];
}

export interface ProductVariant {
  id: string;
  label: string;
  groupName: string;
  price: number;
  originalPrice?: number;
  sku: string;
  stock: number;
  weightLabel?: string;
}

export interface ProductSpec {
  label: string;
  value: string;
}

export interface ProductReview {
  id: string;
  author: string;
  rating: number;
  date: string;
  variant?: string;
  comment: string;
  verifiedPurchase: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  description?: string;
  sku?: string;

  referencePrice?: number;
  originalPrice?: number;
  salePrice?: number;
  saleDiscountPercent?: number;
  isFlashSale?: boolean;
  liveShopeeUpdated?: string;
  priceSource?: 'shopee-live' | 'google-sheet' | 'default';

  imageUrl?: string;
  gallery?: string[];
  youtubeUrl?: string;
  soldCount?: number;
  rating?: number;
  reviewCount?: number;
  variants?: ProductVariant[];
  specs?: ProductSpec[];
  riggingGuide?: string;

  shopeeUrl?: string;
  tiktokUrl?: string;
  tiktokLinkStatus: 'verified-product' | 'shared-unverified' | 'none';

  status: 'active' | 'inactive';
  featured: boolean;
  updatedAt?: string;
  sourceRow: number;
}

export interface CartItem {
  key: string;
  productId: string;
  slug: string;
  name: string;
  category: string;
  imageUrl?: string;
  variantId: string;
  variantLabel: string;
  sku: string;
  price: number;
  originalPrice?: number;
  quantity: number;
  shopeeUrl?: string;
  tiktokUrl?: string;
}

export interface OrderCustomerInfo {
  fullName: string;
  phone: string;
  province: string;
  district: string;
  ward: string;
  address: string;
  note?: string;
}

export type OrderStatus = 'pending' | 'confirmed' | 'packing' | 'shipping' | 'delivered' | 'cancelled';
export type ShippingCarrierId = 'ghn' | 'ghtk' | 'viettelpost' | 'manual';
export type ConnectorProviderId = 'pancake' | 'ghn' | 'ghtk' | 'viettelpost' | 'webhook';

export interface ConnectorSummary {
  provider: ConnectorProviderId;
  name: string;
  connected: boolean;
  source: 'env' | 'admin-ui' | 'none';
  autoSync: boolean;
  shopId?: string;
  warehouseId?: string;
  webhookUrl?: string;
  maskedToken?: string;
  lastTestedAt?: string;
  lastTestOk?: boolean;
  lastTestMessage?: string;
}

export interface OrderRecord {
  orderCode: string;
  createdAt: string;
  customer: OrderCustomerInfo;
  paymentMethod: 'cod' | 'vietqr';
  items: CartItem[];
  subtotal: number;
  discountCode?: string;
  discountAmount: number;
  shippingFee: number;
  shippingReason: string;
  total: number;
  estimatedDelivery: string;
  status: OrderStatus;
  shippingCarrier?: ShippingCarrierId;
  trackingCode?: string;
  packageWeightGrams?: number;
  pushedToCarrierAt?: string;
  pancakeOrderId?: string;
  pancakeSyncedAt?: string;
  pancakeSyncError?: string;
  webhookSyncedAt?: string;
  webhookSyncError?: string;
  channel?: 'web' | 'b2a-agent';
  agentName?: string;
  updatedAt?: string;
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
