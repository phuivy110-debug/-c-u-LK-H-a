import { Category, ReasonItem } from '../types';

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

// 7 menu categories + backward-compatible category slugs for SEO routes & tests
export const MENU_CATEGORIES: Category[] = [
  { id: 'combo', slug: 'combo', name: 'Combo Bán Chạy', iconName: 'Flame', description: 'Combo cần máy mồi dây đồng bộ tối ưu chi phí cho người mới và cần thủ thực chiến' },
  { id: 'moi-lure', slug: 'moi-lure', name: 'Mồi Lure & Chuột LK', iconName: 'Crosshair', description: 'Mồi chuột LK nổi/lửng, nhái hơi, mồi mềm và cá sắt săn cá lóc, chẽm, măng' },
  { id: 'can-cau', slug: 'can-cau', name: 'Cần Câu Cá', iconName: 'Fish', description: 'Cần solid tải tĩnh 10kg, cần lure carbon và cần đài 4H/5H/6H chính hãng LK Hòa' },
  { id: 'may-cau', slug: 'may-cau', name: 'Máy Câu', iconName: 'Compass', description: 'Máy câu đứng Daiwa RS, Daiwa MG và dòng máy lure tải khỏe mượt mà' },
  { id: 'day-cau', slug: 'day-cau', name: 'Dây Dù & Cước', iconName: 'Waves', description: 'Dây dù PE X4/X8 LK Hòa, dây Red X8 không phai màu, dây cước leader & trục thẻo' },
  { id: 'moi-dai', slug: 'moi-dai', name: 'Mồi Đài & Cám Hạt', iconName: 'Feather', description: 'Cám chép Series 2, mồi câu đài tổng hợp, thính dụ cá và hương liệu Lũng Cú' },
  { id: 'phu-kien', slug: 'phu-kien', name: 'Phụ Kiện', iconName: 'ShieldCheck', description: 'Kìm gỡ lưỡi, kẹp cá, cán vợt carbon, rọng đựng cá, phao nano và lưỡi câu đài' },
];

export const CATEGORIES: Category[] = [
  { id: 'all', slug: 'tat-ca', name: 'Tất Cả Sản Phẩm', iconName: 'Sparkles', description: 'Toàn bộ danh mục trang bị đồ câu chính hãng LK Hòa' },
  { id: 'combo', slug: 'combo', name: 'Combo Bán Chạy', iconName: 'Flame', description: 'Combo cần máy mồi dây đồng bộ, tiết kiệm và sẵn sàng đi câu ngay' },
  { id: 'can-cau', slug: 'can-cau', name: 'Cần Câu', iconName: 'Fish', description: 'Cần câu tay, cần carbon 5H, 6H, 8H, cần lure và cần solid tải tĩnh cao cấp' },
  { id: 'may-cau', slug: 'may-cau', name: 'Máy Câu', iconName: 'Compass', description: 'Máy câu đứng, máy câu ngang chính hãng phối chuẩn với cần LK Hòa' },
  { id: 'moi-cau', slug: 'moi-cau', name: 'Mồi Câu', iconName: 'Feather', description: 'Mồi chuột LK, nhái hơi, cám chép, mồi xả, thính dụ cá LK Hòa' },
  { id: 'moi-lure', slug: 'moi-lure', name: 'Mồi Lure & Chuột LK', iconName: 'Crosshair', description: 'Mồi giả câu lure, chuột LK 5g/7g/8g/12g, cá sắt và mồi mềm skipping' },
  { id: 'moi-dai', slug: 'moi-dai', name: 'Mồi Đài & Cám Hạt', iconName: 'Feather', description: 'Cám chép LK Series 2, mồi câu rô phi, trắm cỏ và hương liệu câu đài' },
  { id: 'day-cau', slug: 'day-cau', name: 'Dây Câu', iconName: 'Waves', description: 'Dây dù X4/X8, dây cước Ruby Hồng, trục thẻo siêu bền' },
  { id: 'phao-luoi', slug: 'phao-luoi', name: 'Phao & Lưỡi', iconName: 'Anchor', description: 'Phao câu đài nano, phao lục độc quyền, lưỡi tứ và lưỡi săn hàng' },
  { id: 'phu-kien', slug: 'phu-kien', name: 'Phụ Kiện', iconName: 'ShieldCheck', description: 'Cán vợt carbon, rọng đựng cá, kìm gỡ lưỡi, gác cần hố đấu' },
];

export const WHY_US_ITEMS: ReasonItem[] = [
  {
    id: 'reason-1',
    title: 'Kiểm nghiệm thực tế bởi LK Hòa',
    description: 'Từng mẫu cần, dây PE và bài mồi đều được LK Hòa trực tiếp test action tại sông hồ tự nhiên trước khi mở bán.',
    icon: 'CheckCircle2',
  },
  {
    id: 'reason-2',
    title: 'Đồng kiểm khi nhận hàng',
    description: 'Khách hàng được mở ống nhựa kiểm tra đúng mẫu, đúng biến thể, không cong gãy khoen đọt trước khi thanh toán COD.',
    icon: 'PackageCheck',
  },
  {
    id: 'reason-3',
    title: 'Bảo hành ngọn cần chính hãng',
    description: 'Hỗ trợ đổi mới 1-1 trong 7 ngày nếu lỗi sản xuất và hỗ trợ thay thế lóng/ngọn cần chính hãng cho khách hàng.',
    icon: 'ShieldCheck',
  },
  {
    id: 'reason-4',
    title: 'Tư vấn kỹ thuật trọn đời',
    description: 'Hỗ trợ chọn size dây, phối máy, cân phao và chỉnh bài mồi theo thời tiết từng địa phương qua Zalo & Hotline.',
    icon: 'Headphones',
  },
];
