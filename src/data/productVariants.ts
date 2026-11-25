import type { Product, ProductReview, ProductSpec, ProductVariant } from '../types';
import { productPrice } from '../utils/catalog';

export interface ProductDetailData {
  sku: string;
  soldCount: number;
  rating: number;
  reviewCount: number;
  stockCount: number;
  gallery: string[];
  youtubeId?: string;
  youtubeTitle?: string;
  variants: ProductVariant[];
  specs: ProductSpec[];
  riggingGuide: string;
  reviews: ProductReview[];
}

// Re-export type properly by keeping module self-contained
export type { ProductVariant, ProductSpec, ProductReview };

const FLAGSHIP_SLUGS = [
  'lk-hoa-mua-01-can-soil-tang-01-cuon-du-lk-x4-can-solid-da-nang-tai-tinh-10kg',
  'bst-gioi-han-can-cau-chuyen-lure-lk-special-ca-map-can-cau-chuyen-lure-special',
  'lk-hoa-can-cau-dai-5h-lk-tong-hop-2026',
  'lk-hoa-moi-cau-chuyen-lure-chuot-lk-action-noi-va-lung-s7g-m8g-mskin8g-va-l12g-lung',
  'lk-hoa-may-cau-chuyen-lure-daiwa-mg-may-cau-dung-chuyen-cau-lure-hang-daiwa-di-cau-bat-ca',
  'lk-hoa-day-du-chuyen-cau-lure-lk-red-x8-day-cau-chuyen-lure-lk-red-150m-day-lk-red-khong-phai-mau',
  'lk-hoa-cam-chep-lk-series-2-moi-cau-chep-the-he-moi',
  'lk-hoa-combo-chuyen-lure-can-lk-may-dung-rs-moi-du-full-bo-07-san-pham',
];

export function isFlagshipProduct(slug: string): boolean {
  return FLAGSHIP_SLUGS.includes(slug);
}

export function pickFeaturedProducts(products: Product[], count = 8): Product[] {
  const active = products.filter((p) => p.status === 'active');
  const flagship = FLAGSHIP_SLUGS
    .map((slug) => active.find((p) => p.slug === slug))
    .filter((p): p is Product => Boolean(p));
  const usedIds = new Set(flagship.map((p) => p.id));
  const rest = active.filter((p) => !usedIds.has(p.id));
  return [...flagship, ...rest].slice(0, count);
}

function deterministicHash(input: string): number {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return Math.abs(hash);
}

export function getProductSku(product: Product): string {
  if (product.sku) return product.sku;
  const prefix = product.category === 'Cần Câu'
    ? 'LKH-ROD'
    : product.category === 'Máy Câu'
    ? 'LKH-REEL'
    : product.category === 'Mồi Câu'
    ? 'LKH-LURE'
    : product.category === 'Dây Câu'
    ? 'LKH-LINE'
    : 'LKH-GEAR';
  const num = String((deterministicHash(product.slug) % 899) + 100);
  return `${prefix}-${num}`;
}

export function getProductSoldCount(product: Product): number {
  if (typeof product.soldCount === 'number') return product.soldCount;
  return 120 + (deterministicHash(product.slug) % 680);
}

const FLAGSHIP_CUSTOM_DATA: Record<string, Partial<ProductDetailData>> = {
  'lk-hoa-mua-01-can-soil-tang-01-cuon-du-lk-x4-can-solid-da-nang-tai-tinh-10kg': {
    sku: 'LKH-SOLID-10KG',
    soldCount: 1248,
    rating: 4.9,
    reviewCount: 312,
    youtubeId: 'VNi3chnx42k',
    youtubeTitle: 'Test thực chiến cần Solid & săn cá lóc hồ tự nhiên - LK Hòa',
    gallery: [
      'https://i.postimg.cc/nzGjcVbq/vn-11134207-7r98o-lxfag3jyd0ij24.webp',
      '/images/craftsmanship-rod-test.jpg',
      '/images/hero-tactical-fishing.jpg',
    ],
    variants: [
      { id: 'solid-1m8', label: '1m8 (Máy Đứng)', groupName: 'Chiều dài & Kiểu máy', price: 890000, originalPrice: 1120000, sku: 'LKH-SOLID-18D', stock: 24 },
      { id: 'solid-2m1', label: '2m1 (Máy Đứng)', groupName: 'Chiều dài & Kiểu máy', price: 990000, originalPrice: 1240000, sku: 'LKH-SOLID-21D', stock: 31 },
      { id: 'solid-2m4', label: '2m4 (Máy Đứng)', groupName: 'Chiều dài & Kiểu máy', price: 1090000, originalPrice: 1360000, sku: 'LKH-SOLID-24D', stock: 18 },
      { id: 'solid-2m7', label: '2m7 (Săn Hàng)', groupName: 'Chiều dài & Kiểu máy', price: 1190000, originalPrice: 1490000, sku: 'LKH-SOLID-27D', stock: 12 },
    ],
    specs: [
      { label: 'Thương hiệu', value: 'Đồ Câu LK Hòa' },
      { label: 'Chất liệu phôi', value: 'Carbon Solid đặc nguyên khối' },
      { label: 'Tải tĩnh thực tế', value: '10 kg (Test nhấc bổng tại shop)' },
      { label: 'Khoen cần', value: 'Khoen sứ chống xoắn chịu tải cao' },
      { label: 'Quà tặng kèm', value: '01 cuộn dù LK X4 chính hãng' },
      { label: 'Đóng gói giao hàng', value: 'Ống nhựa cứng PVC chống gãy đọt' },
    ],
    riggingGuide: 'Phối chuẩn với máy câu đứng size 2500–4000 (như Daiwa RS hoặc Daiwa MG) và dây dù PE #1.5 đến #2.5 kèm leader Fluorocarbon 0.35mm. Phù hợp câu lure cá lóc bông, câu ngâm, câu sông hồ có vật cản.',
    reviews: [
      { id: 'r1', author: 'Nguyễn Văn Thắng (Nghệ An)', rating: 5, date: '2026-09-14', variant: '2m1 (Máy Đứng)', comment: 'Cần solid đặc cầm cực đầm tay, đóng ống nhựa cứng rất yên tâm. Tặng kèm cuộn dù X4 đánh cá lóc 3kg kéo lên bờ nhẹ nhàng.', verifiedPurchase: true },
      { id: 'r2', author: 'Trần Minh Quân (Thanh Hóa)', rating: 5, date: '2026-09-02', variant: '2m4 (Máy Đứng)', comment: 'Mình chọn bản 2m4 câu đập thủy điện rất khỏe, cho kiểm tra hàng trước khi trả tiền COD.', verifiedPurchase: true },
    ],
  },
  'bst-gioi-han-can-cau-chuyen-lure-lk-special-ca-map-can-cau-chuyen-lure-special': {
    sku: 'LKH-SHARK-2026',
    soldCount: 864,
    rating: 5.0,
    reviewCount: 204,
    youtubeId: 'kOGjYkhxOOs',
    youtubeTitle: 'Câu lure sau mưa đầu mùa cùng bộ trang bị LK Hòa',
    gallery: [
      'https://down-vn.img.susercontent.com/file/vn-11134207-7ras8-m3riuxpvqlrw39',
      '/images/hero-tactical-fishing.jpg',
      '/images/craftsmanship-rod-test.jpg',
    ],
    variants: [
      { id: 'shark-2m1-m', label: '2m1 · Độ cứng M (Máy Đứng)', groupName: 'Phiên bản', price: 1290000, originalPrice: 1540000, sku: 'LKH-SHK-21M', stock: 16 },
      { id: 'shark-2m1-mh', label: '2m1 · Độ cứng MH (Máy Ngang)', groupName: 'Phiên bản', price: 1350000, originalPrice: 1620000, sku: 'LKH-SHK-21MH', stock: 11 },
      { id: 'shark-2m4-mh', label: '2m4 · Độ cứng MH (Săn Lóc Bông)', groupName: 'Phiên bản', price: 1420000, originalPrice: 1690000, sku: 'LKH-SHK-24MH', stock: 9 },
    ],
    specs: [
      { label: 'Dòng sản phẩm', value: 'BST Giới Hạn LK Special Cá Mập' },
      { label: 'Tải mồi khuyến nghị', value: '7g – 28g (M / MH)' },
      { label: 'Khoen dẫn dây', value: 'Chống rối Alconite tản nhiệt' },
      { label: 'Cán cần', value: 'EVA Tactical nhám chống trượt khi ướt' },
      { label: 'Bảo hành', value: 'Đổi mới 1-1 trong 7 ngày · Hỗ trợ thay ngọn' },
    ],
    riggingGuide: 'Kết hợp Chuột LK 8g–12g hoặc Mồi Mềm Skipping kèm dây dù LK RED X8 #1.5–#2.0. Thích hợp săn cá lóc bông, cá chẽm tại đầm cỏ bèo và bờ đập nhiều gốc cây.',
  },
  'lk-hoa-can-cau-dai-5h-lk-tong-hop-2026': {
    sku: 'LKH-DAI5H-26',
    soldCount: 932,
    rating: 4.9,
    reviewCount: 245,
    youtubeId: 'nw9Hxj6B3RE',
    youtubeTitle: 'Hướng dẫn câu cá chép bằng bài mồi & cần đài LK Hòa',
    variants: [
      { id: 'dai5h-3m6', label: '3m6 (Câu rô, chép nhanh)', groupName: 'Chiều dài cần đài', price: 850000, originalPrice: 1050000, sku: 'LKH-5H-36', stock: 22 },
      { id: 'dai5h-4m5', label: '4m5 (Đa năng hồ dịch vụ)', groupName: 'Chiều dài cần đài', price: 950000, originalPrice: 1180000, sku: 'LKH-5H-45', stock: 28 },
      { id: 'dai5h-5m4', label: '5m4 (Săn chép, trắm tự nhiên)', groupName: 'Chiều dài cần đài', price: 1050000, originalPrice: 1290000, sku: 'LKH-5H-54', stock: 19 },
      { id: 'dai5h-6m3', label: '6m3 (Đánh xa bờ hồ lớn)', groupName: 'Chiều dài cần đài', price: 1250000, originalPrice: 1520000, sku: 'LKH-5H-63', stock: 10 },
    ],
    specs: [
      { label: 'Độ cứng & Phân bổ lực', value: '5H · Phân bổ 28i nảy đều' },
      { label: 'Vật liệu', value: 'Carbon xoắn X đa lớp nhẹ tay' },
      { label: 'Đầu bu chống xoắn', value: 'Xoay 360 độ chống rối trục' },
      { label: 'Đối tượng cá', value: 'Rô phi, cá chép, trắm cỏ 1–6 kg' },
    ],
    riggingGuide: 'Dùng trục câu đài LK 2.0–2.5 kết hợp thẻo buộc sẵn 1.0–1.5, phao hố đấu Nano 2.2g và Cám Chép LK Series 2.',
  },
  'lk-hoa-moi-cau-chuyen-lure-chuot-lk-action-noi-va-lung-s7g-m8g-mskin8g-va-l12g-lung': {
    sku: 'LKH-CHUOT-LK',
    soldCount: 2410,
    rating: 4.9,
    reviewCount: 538,
    youtubeId: 'kOGjYkhxOOs',
    youtubeTitle: 'Thực chiến rê mồi Chuột LK qua thảm cỏ săn cá lóc',
    variants: [
      { id: 'chuot-s-7g', label: 'Size S · 7g (Nổi - Cá nhỏ/suối)', groupName: 'Trọng lượng & Action', price: 95000, originalPrice: 120000, sku: 'LKH-CH-S7', stock: 85 },
      { id: 'chuot-m-8g', label: 'Size M · 8g (Nổi - Đa địa hình)', groupName: 'Trọng lượng & Action', price: 99000, originalPrice: 129000, sku: 'LKH-CH-M8', stock: 110 },
      { id: 'chuot-mskin-8g', label: 'Size M Skin · 8g (Da nhám thực chiến)', groupName: 'Trọng lượng & Action', price: 109000, originalPrice: 139000, sku: 'LKH-CH-MS8', stock: 64 },
      { id: 'chuot-l-12g', label: 'Size L · 12g (Lửng - Săn Lóc Bông)', groupName: 'Trọng lượng & Action', price: 115000, originalPrice: 149000, sku: 'LKH-CH-L12', stock: 52 },
    ],
    specs: [
      { label: 'Action', value: 'Nổi (Topwater 7g/8g) & Lửng (12g)' },
      { label: 'Chất liệu thân', value: 'Cao su tự nhiên đàn hồi cao, chống rách' },
      { label: 'Lưỡi câu', value: 'Lưỡi đôi ôm thân chống vướng cỏ bèo' },
      { label: 'Phụ kiện đi kèm', value: 'Thìa tạo sóng / Chì cân tâm chuẩn' },
    ],
    riggingGuide: 'Móc trực tiếp vào khóa Link Snap LK (không dùng chì kẹp) để chuột giữ chuẩn action lắc đuôi. Chờ 1–2 giây sau khi cá táp mới đóng cần.',
  },
  'lk-hoa-may-cau-chuyen-lure-daiwa-mg-may-cau-dung-chuyen-cau-lure-hang-daiwa-di-cau-bat-ca': {
    sku: 'LKH-DAIWA-MG',
    soldCount: 642,
    rating: 4.9,
    reviewCount: 158,
    variants: [
      { id: 'mg-2000', label: 'Size 2000 (Câu suối / UL)', groupName: 'Kích cỡ máy', price: 790000, originalPrice: 950000, sku: 'LKH-MG-2000', stock: 18 },
      { id: 'mg-2500', label: 'Size 2500 (Lure cá lóc chuẩn)', groupName: 'Kích cỡ máy', price: 850000, originalPrice: 1020000, sku: 'LKH-MG-2500', stock: 25 },
      { id: 'mg-3000', label: 'Size 3000 (Lure bạo lực / Ngâm)', groupName: 'Kích cỡ máy', price: 890000, originalPrice: 1080000, sku: 'LKH-MG-3000', stock: 20 },
      { id: 'mg-4000', label: 'Size 4000 (Săn hàng / Hồ lớn)', groupName: 'Kích cỡ máy', price: 960000, originalPrice: 1150000, sku: 'LKH-MG-4000', stock: 12 },
    ],
    specs: [
      { label: 'Thương hiệu', value: 'Daiwa chính hãng (Phân phối bởi LK Hòa)' },
      { label: 'Spool (Cối dây)', value: 'Hợp kim nhôm CNC vát mép chống ma sát' },
      { label: 'Tay quay', value: 'Kim loại gập gọn, đổi trái/phải linh hoạt' },
      { label: 'Phù hợp', value: 'Câu lure nước ngọt, lure chẽm, câu đơn ngâm' },
    ],
    riggingGuide: 'Size 2500–3000 vào vừa khít 1 cuộn dây dù LK RED X8 150m size #1.0 hoặc #1.5 mà không cần độn dây lót nhiều.',
  },
  'lk-hoa-day-du-chuyen-cau-lure-lk-red-x8-day-cau-chuyen-lure-lk-red-150m-day-lk-red-khong-phai-mau': {
    sku: 'LKH-REDX8-150',
    soldCount: 1875,
    rating: 4.9,
    reviewCount: 412,
    gallery: [
      'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m7g3kj9upjxvd0',
      '/images/craftsmanship-rod-test.jpg',
    ],
    variants: [
      { id: 'redx8-08', label: 'Size #0.8 (0.14mm · 150m)', groupName: 'Size dây PE', price: 179000, originalPrice: 230000, sku: 'LKH-RX8-08', stock: 62 },
      { id: 'redx8-10', label: 'Size #1.0 (0.16mm · 150m)', groupName: 'Size dây PE', price: 189000, originalPrice: 240000, sku: 'LKH-RX8-10', stock: 74 },
      { id: 'redx8-15', label: 'Size #1.5 (0.20mm · 150m)', groupName: 'Size dây PE', price: 189000, originalPrice: 240000, sku: 'LKH-RX8-15', stock: 81 },
      { id: 'redx8-20', label: 'Size #2.0 (0.23mm · 150m)', groupName: 'Size dây PE', price: 199000, originalPrice: 250000, sku: 'LKH-RX8-20', stock: 54 },
      { id: 'redx8-30', label: 'Size #3.0 (0.28mm · 150m)', groupName: 'Size dây PE', price: 215000, originalPrice: 270000, sku: 'LKH-RX8-30', stock: 33 },
    ],
    specs: [
      { label: 'Cấu trúc bện', value: '8 sợi PE mật độ cao, bề mặt tròn mịn' },
      { label: 'Chiều dài cuộn', value: '150m chuẩn' },
      { label: 'Màu sắc', value: 'Đỏ Ruby giữ màu bền bỉ' },
      { label: 'Ưu điểm', value: 'Thoát dây êm qua khoen, hạn chế rối khi ném ngược gió' },
    ],
    riggingGuide: 'Buộc nút FG hoặc Albright nối dây dù Red X8 với đoạn leader Fluorocarbon 60–80cm để chống mài mòn khi cá chui vào đá hoặc cỏ.',
  },
  'lk-hoa-cam-chep-lk-series-2-moi-cau-chep-the-he-moi': {
    sku: 'LKH-CAM-S2',
    soldCount: 1560,
    rating: 4.8,
    reviewCount: 289,
    youtubeId: 'nw9Hxj6B3RE',
    youtubeTitle: 'Cách pha cám chép LK dụ cá nhanh tránh cá con phá ổ',
    variants: [
      { id: 'cam-1goi', label: '1 Gói Lẻ (500g)', groupName: 'Quy cách đóng gói', price: 199000, originalPrice: 245000, sku: 'LKH-CS2-01', stock: 95 },
      { id: 'cam-3goi', label: 'Combo 3 Gói (Tiết kiệm + Freeship)', groupName: 'Quy cách đóng gói', price: 549000, originalPrice: 735000, sku: 'LKH-CS2-03', stock: 42 },
      { id: 'cam-5goi', label: 'Combo 5 Gói (Đánh giải / Săn hàng)', groupName: 'Quy cách đóng gói', price: 890000, originalPrice: 1225000, sku: 'LKH-CS2-05', stock: 26 },
    ],
    specs: [
      { label: 'Dòng mồi', value: 'Cám Chép LK Series 2 thế hệ mới' },
      { label: 'Hương vị', value: 'Ngũ cốc lên men tự nhiên + Đạm thủy sinh' },
      { label: 'Cách dùng', value: 'Pha câu vuốt, câu vê hoặc làm mồi xả ổ' },
      { label: 'Hạn sử dụng', value: '12 tháng (Bảo quản nơi khô thoáng)' },
    ],
    riggingGuide: 'Tỉ lệ chuẩn 1 phần cám : 0.8 phần nước hồ, ủ 5 phút cho hạt tơi rồi vê nhẹ quanh lưỡi. Nếu nhiều cá con, tăng độ dẻo bằng cách bóp thêm 10–15% cám khô.',
  },
  'lk-hoa-combo-chuyen-lure-can-lk-may-dung-rs-moi-du-full-bo-07-san-pham': {
    sku: 'LKH-COMBO-07',
    soldCount: 518,
    rating: 5.0,
    reviewCount: 147,
    youtubeId: 'VNi3chnx42k',
    youtubeTitle: 'Mở hộp và test thực chiến Combo 07 món chuyên Lure LK Hòa',
    variants: [
      { id: 'combo-2m1', label: 'Cần 2m1 + Máy RS 2500 + Full 07 món', groupName: 'Cấu hình Combo', price: 2290000, originalPrice: 2790000, sku: 'LKH-CB7-21', stock: 14 },
      { id: 'combo-2m4', label: 'Cần 2m4 + Máy RS 3000 + Full 07 món', groupName: 'Cấu hình Combo', price: 2390000, originalPrice: 2890000, sku: 'LKH-CB7-24', stock: 11 },
    ],
    specs: [
      { label: 'Trọn bộ bao gồm', value: 'Cần Lure LK + Máy Daiwa RS + Dây Dù + Chuột LK + Mồi mềm + Khóa Snap + Kìm' },
      { label: 'Phù hợp', value: 'Người mới chơi hoặc cần thủ muốn bộ đồng bộ sẵn sàng đi câu' },
      { label: 'Vận chuyển', value: 'Freeship 0đ · Đóng ống nhựa PVC bảo vệ' },
    ],
    riggingGuide: 'LK Hòa hỗ trợ vào sẵn dây dù vào máy trước khi gửi nếu anh em ghi chú trong đơn hàng.',
  },
};

function buildDynamicVariants(product: Product): ProductVariant[] {
  const basePrice = productPrice(product) || 199000;
  const orig = product.originalPrice && product.originalPrice > basePrice ? product.originalPrice : undefined;
  const sku = getProductSku(product);
  const name = product.name.toLowerCase();

  if (product.category === 'Cần Câu') {
    if (/đài|tay|4h|5h|6h|8h|rô chép/i.test(name)) {
      return [
        { id: `${product.id}-2m7`, label: '2m7', groupName: 'Chiều dài cần', price: Math.max(99000, Math.round(basePrice * 0.82 / 1000) * 1000), originalPrice: orig ? Math.round(orig * 0.82 / 1000) * 1000 : undefined, sku: `${sku}-27`, stock: 18 },
        { id: `${product.id}-3m6`, label: '3m6', groupName: 'Chiều dài cần', price: Math.max(99000, Math.round(basePrice * 0.9 / 1000) * 1000), originalPrice: orig ? Math.round(orig * 0.9 / 1000) * 1000 : undefined, sku: `${sku}-36`, stock: 24 },
        { id: `${product.id}-4m5`, label: '4m5', groupName: 'Chiều dài cần', price: basePrice, originalPrice: orig, sku: `${sku}-45`, stock: 29 },
        { id: `${product.id}-5m4`, label: '5m4', groupName: 'Chiều dài cần', price: Math.round(basePrice * 1.12 / 1000) * 1000, originalPrice: orig ? Math.round(orig * 1.12 / 1000) * 1000 : undefined, sku: `${sku}-54`, stock: 15 },
        { id: `${product.id}-6m3`, label: '6m3', groupName: 'Chiều dài cần', price: Math.round(basePrice * 1.24 / 1000) * 1000, originalPrice: orig ? Math.round(orig * 1.24 / 1000) * 1000 : undefined, sku: `${sku}-63`, stock: 9 },
      ];
    }
    return [
      { id: `${product.id}-1m8`, label: '1m8 (M)', groupName: 'Chiều dài & Độ cứng', price: Math.max(99000, Math.round(basePrice * 0.95 / 1000) * 1000), originalPrice: orig, sku: `${sku}-18M`, stock: 22 },
      { id: `${product.id}-2m1`, label: '2m1 (MH)', groupName: 'Chiều dài & Độ cứng', price: basePrice, originalPrice: orig, sku: `${sku}-21MH`, stock: 30 },
      { id: `${product.id}-2m4`, label: '2m4 (MH)', groupName: 'Chiều dài & Độ cứng', price: Math.round(basePrice * 1.08 / 1000) * 1000, originalPrice: orig ? Math.round(orig * 1.08 / 1000) * 1000 : undefined, sku: `${sku}-24MH`, stock: 17 },
    ];
  }

  if (product.category === 'Máy Câu') {
    return [
      { id: `${product.id}-2000`, label: 'Size 2000', groupName: 'Kích cỡ máy', price: Math.max(99000, basePrice - 40000), originalPrice: orig, sku: `${sku}-2000`, stock: 19 },
      { id: `${product.id}-2500`, label: 'Size 2500', groupName: 'Kích cỡ máy', price: basePrice, originalPrice: orig, sku: `${sku}-2500`, stock: 26 },
      { id: `${product.id}-3000`, label: 'Size 3000', groupName: 'Kích cỡ máy', price: basePrice + 40000, originalPrice: orig ? orig + 40000 : undefined, sku: `${sku}-3000`, stock: 21 },
    ];
  }

  if (product.category === 'Dây Câu') {
    return [
      { id: `${product.id}-08`, label: 'Size #0.8', groupName: 'Size dây', price: basePrice, originalPrice: orig, sku: `${sku}-08`, stock: 45 },
      { id: `${product.id}-10`, label: 'Size #1.0', groupName: 'Size dây', price: basePrice, originalPrice: orig, sku: `${sku}-10`, stock: 58 },
      { id: `${product.id}-15`, label: 'Size #1.5', groupName: 'Size dây', price: basePrice, originalPrice: orig, sku: `${sku}-15`, stock: 50 },
      { id: `${product.id}-20`, label: 'Size #2.0', groupName: 'Size dây', price: basePrice + 10000, originalPrice: orig ? orig + 10000 : undefined, sku: `${sku}-20`, stock: 38 },
    ];
  }

  if (product.category === 'Mồi Câu') {
    if (/chuột|lure|cóc|bọ|nhái|cá sắt/i.test(name)) {
      return [
        { id: `${product.id}-7g`, label: '7g · Màu Đen Tự Nhiên', groupName: 'Trọng lượng & Màu', price: basePrice, originalPrice: orig, sku: `${sku}-7G`, stock: 64 },
        { id: `${product.id}-8g`, label: '8g · Màu Xám Nổi', groupName: 'Trọng lượng & Màu', price: basePrice, originalPrice: orig, sku: `${sku}-8G`, stock: 72 },
        { id: `${product.id}-12g`, label: '12g · Action Lửng', groupName: 'Trọng lượng & Màu', price: basePrice + 15000, originalPrice: orig ? orig + 15000 : undefined, sku: `${sku}-12G`, stock: 40 },
      ];
    }
    return [
      { id: `${product.id}-1`, label: '1 Gói Tiêu Chuẩn', groupName: 'Quy cách', price: basePrice, originalPrice: orig, sku: `${sku}-01`, stock: 90 },
      { id: `${product.id}-3`, label: 'Combo 3 Gói', groupName: 'Quy cách', price: Math.round(basePrice * 2.8 / 1000) * 1000, originalPrice: basePrice * 3, sku: `${sku}-03`, stock: 45 },
    ];
  }

  return [
    { id: `${product.id}-std`, label: 'Phiên bản Tiêu Chuẩn LK Hòa', groupName: 'Phân loại', price: basePrice, originalPrice: orig, sku, stock: 40 },
  ];
}

export function getProductDetailData(product: Product): ProductDetailData {
  const custom = FLAGSHIP_CUSTOM_DATA[product.slug] || {};
  const sku = custom.sku || getProductSku(product);
  const soldCount = custom.soldCount ?? getProductSoldCount(product);
  const variants = product.variants && product.variants.length > 0
    ? product.variants
    : custom.variants || buildDynamicVariants(product);

  const gallery = [
    ...(product.imageUrl ? [product.imageUrl] : []),
    ...(custom.gallery || []),
    '/images/craftsmanship-rod-test.jpg',
  ].filter((url, idx, arr) => Boolean(url) && arr.indexOf(url) === idx);

  const specs: ProductSpec[] = custom.specs || [
    { label: 'Thương hiệu', value: 'Đồ Câu LK Hòa Chính Hãng' },
    { label: 'Mã sản phẩm (SKU)', value: sku },
    { label: 'Danh mục', value: product.category },
    { label: 'Tình trạng kho', value: 'Còn hàng · Giao ngay trong ngày' },
    { label: 'Kiểm tra hàng', value: 'Cho phép đồng kiểm khi nhận COD' },
  ];

  const reviews: ProductReview[] = custom.reviews || [
    {
      id: `${product.id}-rev-1`,
      author: 'Hoàng Đức Anh (Hà Nội)',
      rating: 5,
      date: '2026-09-10',
      variant: variants[0]?.label,
      comment: 'Hàng chuẩn LK Hòa, đóng gói kỹ lưỡng, giao nhanh 2 ngày nhận được rồi. Tư vấn phối đồ qua Zalo rất nhiệt tình.',
      verifiedPurchase: true,
    },
    {
      id: `${product.id}-rev-2`,
      author: 'Lê Quốc Bảo (Nghệ An)',
      rating: 5,
      date: '2026-08-27',
      variant: variants[1]?.label || variants[0]?.label,
      comment: 'Mua đợt này được đồng kiểm trước khi trả tiền nên rất yên tâm, chất lượng hoàn thiện tốt trong tầm giá.',
      verifiedPurchase: true,
    },
  ];

  return {
    sku,
    soldCount,
    rating: custom.rating ?? 4.9,
    reviewCount: custom.reviewCount ?? (45 + (deterministicHash(product.slug) % 180)),
    stockCount: variants.reduce((sum, v) => sum + v.stock, 0),
    gallery,
    youtubeId: custom.youtubeId,
    youtubeTitle: custom.youtubeTitle,
    variants,
    specs,
    riggingGuide: custom.riggingGuide || `Kiểm tra đồng bộ cần, dây và khóa link trước khi ra hồ. Nhắn trực tiếp qua Zalo LK Hòa nếu bạn cần tư vấn chọn ${variants[0]?.groupName.toLowerCase() || 'phân loại'} theo điểm câu thực tế.`,
    reviews,
  };
}
