import type { Product } from '../types';
import { MECUABIN_SHOPEE_LINKS } from './mecuabinShopeeLinks';
import { applySourceProductEnrichment } from '../utils/sourceProductEnrichment';

// Reference prices transcribed from the user's Shopee export dated 2026-10-23.
// Product imagery is sourced from the matching LK Hoa Shopee item ID.
const additions = [
  {
    itemId: '46818226062',
    slug: 'lk-hoa-combo-can-sv-may-mg-46818226062',
    category: 'Cần Câu',
    referencePrice: 2500000,
    imageUrl: 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mtdkk49yudxdeb',
    gallery: [
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mtdkk49yudxdeb',
      'https://down-vn.img.susercontent.com/file/vn-11134201-81ztc-mtt4ddg2g3k685',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mtdkk3n5tg5k42',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mtdkk65q75z9d5',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mtdkk3zyfi8527',
    ],
    specs: [
      { label: 'Cấu hình combo', value: 'Cần SV + máy MG' },
      { label: 'Kiểu câu', value: 'Lure' },
      { label: 'Kênh đối soát', value: 'Gian hàng Shopee LK Hòa' },
    ],
    riggingGuide: 'Chọn đúng phiên bản cần SV và máy MG đang hiển thị. Trước khi câu, lắp máy chắc vào chân cần, kiểm tra khoen và phối dây, leader, mồi theo tải của đúng phiên bản được LK Hòa xác nhận.',
    description: 'Combo câu lure LK gồm cần SV và máy MG. Khách có thể đặt trực tiếp trên website bằng COD đồng kiểm hoặc VietQR; vui lòng chọn đúng phân loại và kiểm tra thành phần combo hiển thị trước khi xác nhận đơn. Shopee và TikTok Shop là kênh mua thay thế khi khách muốn sử dụng ưu đãi của sàn.',
  },
  {
    itemId: '57368864059',
    slug: 'lk-hoa-can-lure-carbon-mono-57368864059',
    category: 'Cần Câu',
    referencePrice: 2000000,
    imageUrl: 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mu1i91sbxh5679',
    gallery: [
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mu1i91sbxh5679',
      'https://down-vn.img.susercontent.com/file/vn-11134201-81ztc-muplhqouw6ps79',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mu1i7gsxzy125a',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mu1i7gu3fp4xce',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mu1i7gu0bbpe82',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mu1i7gubv3t061',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mu1i7gtysjk837',
    ],
    specs: [
      { label: 'Dòng sản phẩm', value: 'Cần lure Carbon Mono LK' },
      { label: 'Kiểu câu', value: 'Lure' },
      { label: 'Thông số theo phiên bản', value: 'Xác nhận chiều dài, độ cứng và tải mồi khi chọn phân loại' },
    ],
    riggingGuide: 'Xác định loại máy và trọng lượng mồi thường dùng trước khi chọn phân loại. Lắp cần đúng khớp, kiểm tra khoen và không dùng cần để nhấc cá trực tiếp lên bờ.',
    description: 'Cần lure Carbon Mono LK dành cho nhu cầu câu lure thực chiến. Khách có thể đặt trực tiếp trên website bằng COD đồng kiểm hoặc VietQR. Chiều dài, độ cứng, tải mồi và loại chân máy cần được chọn theo phân loại thực tế đang hiển thị trước khi xác nhận đơn.',
  },
  {
    itemId: '28827886331',
    slug: 'lk-hoa-combo-cheap-daiwa-mg-28827886331',
    category: 'Cần Câu',
    referencePrice: 1900000,
    imageUrl: 'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m6s4gwnz360o9c',
    gallery: [
      'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m6s4gwnz360o9c',
      'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m6s4gwnz361k0c',
      'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m6s4gwnz1rg818',
      'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m6s4gwnz4km044',
      'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m6s4gwnz1rh444',
      'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m6s4gwnz0cwo42',
      'https://down-vn.img.susercontent.com/file/vn-11134207-7ra0g-m6s4gwnz0cvs2b',
    ],
    specs: [
      { label: 'Cấu hình combo', value: 'Cần Cheap LK + máy Daiwa MG' },
      { label: 'Kiểu câu', value: 'Lure' },
      { label: 'Đối tượng phù hợp', value: 'Người mới cần bộ phối sẵn' },
    ],
    riggingGuide: 'Chọn đúng chân máy và độ cứng của cần Cheap LK, sau đó đối chiếu size máy Daiwa MG. Quấn dây đều trên cối, chỉnh phanh và kiểm tra khóa mồi trước lần ném đầu tiên.',
    description: 'Combo cần Cheap LK và máy Daiwa MG dành cho người mới bắt đầu hoặc cần một bộ câu lure đồng bộ. Đây là một cấu hình sản phẩm riêng; khách cần kiểm tra đúng thành phần combo, loại máy và phụ kiện hiển thị trước khi đặt trực tiếp trên website.',
  },
  {
    itemId: '57718929625',
    slug: 'lk-hoa-mu-luoi-trai-57718929625',
    category: 'Phụ Kiện',
    referencePrice: 250000,
    imageUrl: 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mu2xex0g1xje3e',
    gallery: [
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mu2xex0g1xje3e',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mu2xex0fmhac5a',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mu2xex0jg4xx83',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mu2xex0h82kh7a',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mu2xex0dd0co87',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mu2xex0k5f5y7b',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mu2xex0j943k36',
    ],
    specs: [
      { label: 'Loại sản phẩm', value: 'Mũ lưỡi trai' },
      { label: 'Danh mục', value: 'Phụ kiện đi câu' },
      { label: 'Màu sắc / phiên bản', value: 'Chọn theo phân loại đang hiển thị' },
    ],
    riggingGuide: 'Chọn đúng màu và phiên bản trên trang sản phẩm. Không mặc định khả năng chống nước hoặc chỉ số chống nắng khi nhà bán chưa công bố thông số tương ứng.',
    description: 'Mũ lưỡi trai LK thuộc nhóm phụ kiện đi câu. Khách có thể đặt trực tiếp trên website; vui lòng chọn đúng màu sắc và phiên bản đang hiển thị. Các đặc tính chưa được công bố như chống nước hoặc chỉ số chống nắng sẽ không được mặc định cam kết.',
  },
  {
    itemId: '52713792350',
    slug: 'lk-hoa-can-lure-gap-gon-5-khuc-52713792350',
    category: 'Cần Câu',
    referencePrice: 1900000,
    imageUrl: 'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mqiez575ab65d0',
    gallery: [
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mqiez575ab65d0',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mqiez57e0ydn55',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mqiez57e2cy38a',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mqiez575bpql11',
      'https://down-vn.img.susercontent.com/file/vn-11134207-81ztc-mqiez57dk3k056',
    ],
    specs: [
      { label: 'Kết cấu', value: 'Cần 5 khúc gấp gọn' },
      { label: 'Kiểu câu', value: 'Lure / câu suối tùy phiên bản' },
      { label: 'Thông số theo phiên bản', value: 'Xác nhận chiều dài lắp, độ cứng và tải mồi khi chọn phân loại' },
    ],
    riggingGuide: 'Lắp lần lượt từng khúc và kiểm tra các khớp đã kín, dàn khoen thẳng hàng trước khi ném. Sau buổi câu, vệ sinh khớp nối và cất cần khi đã khô.',
    description: 'Cần lure LK gấp gọn 5 khúc thuận tiện mang theo khi di chuyển. Đây là sản phẩm riêng với dòng cần suối 5 khúc. Khách cần kiểm tra chiều dài lắp, chiều dài thu gọn, loại máy, tải mồi, độ cứng và phụ kiện hiển thị trước khi đặt trực tiếp trên website.',
  },
];

export const NEW_SHOPEE_PRODUCTS: Product[] = additions.map((item, index) => {
  const entry = MECUABIN_SHOPEE_LINKS.find(link => link.itemId === item.itemId);
  if (!entry?.url) throw new Error(`Missing mecuabin affiliate link for new product ${item.itemId}`);
  return applySourceProductEnrichment({
    id: `shopee_${item.itemId}`,
    slug: item.slug,
    name: entry.name,
    category: item.category,
    description: item.description,
    shopeeUrl: entry.url,
    referencePrice: item.referencePrice,
    imageUrl: item.imageUrl,
    gallery: item.gallery,
    specs: item.specs,
    riggingGuide: item.riggingGuide,
    priceSource: 'default',
    tiktokLinkStatus: 'none',
    status: 'active',
    featured: true,
    sourceRow: 72 + index,
    updatedAt: '2026-11-25T15:20:00+07:00',
  });
});
