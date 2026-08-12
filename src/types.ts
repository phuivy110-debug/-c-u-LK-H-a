export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  iconName: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  originalPrice: number;
  imageUrl: string;
  shopeeUrl: string;
  tiktokUrl: string;
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
  systemStatus?: string;
  updateCycle?: string;
}
