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
  { id: 'all', slug: 'tat-ca', name: 'Tất Cả Sản Phẩm', iconName: 'Sparkles', description: 'Toàn bộ danh mục đồ câu cá giải trí LK Hòa' },
  { id: 'can-cau', slug: 'can-cau', name: 'Cần Câu', iconName: 'Fish', description: 'Cần câu tay, cần carbon 5H, 6H, 8H, cần lure cao cấp' },
  { id: 'may-cau', slug: 'may-cau', name: 'Máy Câu', iconName: 'Compass', description: 'Máy câu đứng, máy câu ngang chính hãng LK Hòa' },
  { id: 'moi-cau', slug: 'moi-cau', name: 'Mồi Câu', iconName: 'Feather', description: 'Mồi cám chép, mồi xả, thính dụ cá LK Hòa' },
  { id: 'day-cau', slug: 'day-cau', name: 'Dây Câu', iconName: 'Waves', description: 'Dây dù X8, dây cước trục thẻo siêu bền' },
  { id: 'phao-luoi', slug: 'phao-luoi', name: 'Phao & Lưỡi', iconName: 'Anchor', description: 'Phao câu đài nano, phao đêm, lưỡi câu bén' },
  { id: 'phu-kien', slug: 'phu-kien', name: 'Phụ Kiện', iconName: 'ShieldCheck', description: 'Thùng đựng cá, chân chống cần, gác cần, rế đựng cám' },
];

export const INITIAL_PRODUCTS: Product[] = [];

export const WHY_US_ITEMS: ReasonItem[] = [
  {
    id: 'reason-1',
    title: 'Website Danh Mục & Affiliate LK Hòa',
    description: 'Tổng hợp thông tin sản phẩm và liên kết trực tiếp tới gian hàng chính hãng LK Hòa trên Shopee & TikTok Shop.',
    icon: 'ShieldCheck'
  },
  {
    id: 'reason-2',
    title: 'Tra Cứu Nhanh & Mua Sắm Dễ Dàng',
    description: 'Tra cứu thông số kỹ thuật và chọn mua trực tiếp trên các sàn thương mại điện tử uy tín.',
    icon: 'BadgePercent'
  },
  {
    id: 'reason-3',
    title: 'Liên Kết Mua Hàng Chính Thức',
    description: 'Mọi liên kết mua hàng đều mở trực tiếp ứng dụng hoặc website chính thức của sàn.',
    icon: 'CheckCircle2'
  },
  {
    id: 'reason-4',
    title: 'Hỗ Trợ Thông Tin 24/7',
    description: 'Trợ lý AI hỗ trợ giải đáp thắc mắc, tư vấn chọn đồ câu phù hợp với nhu cầu.',
    icon: 'Clock'
  }
];
