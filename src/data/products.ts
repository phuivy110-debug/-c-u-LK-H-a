import { Category, Product, ReasonItem } from '../types';

export function generateSlug(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

export const CATEGORIES: Category[] = [
  { id: 'all', name: 'Tất Cả Đồ Câu', iconName: 'Sparkles' },
  { id: 'rods', name: 'Cần Câu Cá', iconName: 'Fish' },
  { id: 'reels', name: 'Máy Câu Cá', iconName: 'Compass' },
  { id: 'baits', name: 'Mồi Câu & Thính LK', iconName: 'Feather' },
  { id: 'lines', name: 'Dây Câu & Thẻo', iconName: 'Waves' },
  { id: 'floats', name: 'Phao & Lưỡi Câu', iconName: 'Anchor' },
  { id: 'accessories', name: 'Thùng & Phụ Kiện', iconName: 'ShieldCheck' },
];

export const INITIAL_PRODUCTS: Product[] = [];

export const WHY_US_ITEMS: ReasonItem[] = [
  {
    id: 'reason-1',
    title: 'Website Danh Mục & Affiliate Chính Thức LK Hòa',
    description: 'Nơi tổng hợp thông tin sản phẩm và liên kết trực tiếp tới gian hàng chính hãng LK Hòa trên Shopee Mall & TikTok Shop.',
    icon: 'ShieldCheck'
  },
  {
    id: 'reason-2',
    title: 'Cập Nhật Link Nhanh - Mua Sắm Dễ Dàng',
    description: 'Dễ dàng tra cứu thông tin sản phẩm và mở trực tiếp ứng dụng Shopee hoặc TikTok Shop để hoàn tất mua hàng.',
    icon: 'BadgePercent'
  },
  {
    id: 'reason-3',
    title: 'Chính Hãng & An Toàn',
    description: 'Mọi liên kết mua hàng đều mở ứng dụng hoặc website chính thức của sàn thương mại điện tử.',
    icon: 'CheckCircle2'
  },
  {
    id: 'reason-4',
    title: 'Hỗ Trợ Thông Tin 24/7',
    description: 'Trợ lý tư vấn AI hỗ trợ tra cứu sản phẩm, thông số kỹ thuật và chọn loại đồ câu phù hợp.',
    icon: 'Clock'
  }
];
