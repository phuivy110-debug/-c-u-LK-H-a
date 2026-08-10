export type BadgeType = 'Deal hot' | 'Bán chạy' | 'Giảm sâu' | 'Shopee Mall';

export type CategoryId = 'all' | 'rods' | 'reels' | 'lines' | 'baits' | 'floats' | 'accessories';

export interface Category {
  id: CategoryId;
  name: string;
  iconName: string;
}

export interface Product {
  id: string;
  title: string;
  category: CategoryId;
  originalPrice: number;
  dealPrice: number;
  image: string;
  badges: BadgeType[];
  affiliateUrl: string;
  shopName: string;
  rating: number;
  soldCount: string;
  discountPercent: number;
  isMall?: boolean;
  couponCode?: string;
  description?: string;
  updatedAt?: string;
  tiktokUrl?: string;
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
  mobilePercent: number;
  desktopPercent: number;
  hourlyTraffic: { hour: string; views: number }[];
  weeklyTraffic: { date: string; day: string; views: number }[];
  topCategories: { name: string; views: number; percent: number }[];
  recentActivities: { id: string; time: string; location: string; action: string }[];
  lastUpdated: string;
}
