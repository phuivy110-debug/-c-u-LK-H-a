import type { Product } from '../types';
import { MECUABIN_SHOPEE_LINKS } from './mecuabinShopeeLinks';

// Reference prices transcribed from the user's Shopee export dated 2026-10-23.
const additions = [
  {
    itemId: '46818226062',
    slug: 'lk-hoa-combo-can-sv-may-mg-46818226062',
    category: 'Cần Câu',
    referencePrice: 2500000,
    description: 'Combo câu lure gồm cần LK SV và máy MG theo tên listing trong file Shopee. Giá xuất hiển thị 2,5 triệu đồng và chỉ dùng để tham khảo. Trước khi mua, kiểm tra danh sách thành phần, loại máy, phân loại cần và giá cuối cùng trên Shopee. Tên listing có nhắc quà tặng mũ; quà tặng thực tế cần xác nhận với người bán tại thời điểm đặt hàng.',
  },
  {
    itemId: '57368864059',
    slug: 'lk-hoa-can-lure-carbon-mono-57368864059',
    category: 'Cần Câu',
    referencePrice: 2000000,
    description: 'Cần lure Carbon Mono LK theo danh sách sản phẩm Shopee do chủ website cung cấp. Giá tham khảo trong file xuất hiển thị 2,0 triệu đồng, không phải báo giá theo thời gian thực. Cần kiểm tra chiều dài, độ cứng, tải mồi, chân máy và phân loại đang chọn trên Shopee; website chưa có bảng thông số để xác nhận các cấu hình này.',
  },
  {
    itemId: '28827886331',
    slug: 'lk-hoa-combo-cheap-daiwa-mg-28827886331',
    category: 'Cần Câu',
    referencePrice: 1900000,
    description: 'Listing combo cần Cheap và máy Daiwa MG, mã sản phẩm Shopee 28827886331. Đây là listing riêng với combo cùng tên đã có trong danh mục; không mặc định hai listing có cùng phân loại, phụ kiện hoặc giá. File xuất hiển thị giá tham khảo 1,9 triệu đồng. Hãy đọc đầy đủ thành phần bộ sản phẩm, loại máy và điều kiện của người bán trước khi đặt.',
  },
  {
    itemId: '57718929625',
    slug: 'lk-hoa-mu-luoi-trai-57718929625',
    category: 'Phụ Kiện',
    referencePrice: 250000,
    description: 'Mũ lưỡi trai LK, mã sản phẩm Shopee 57718929625, thuộc nhóm phụ kiện đi câu. File xuất ghi giá tham khảo 250.000 đồng. Kiểm tra màu sắc, kích thước, cách điều chỉnh, chất liệu và hướng dẫn vệ sinh trên gian hàng trước khi chọn; website chưa xác minh thông số chất liệu hoặc các tính năng chống nắng, chống nước.',
  },
  {
    itemId: '52713792350',
    slug: 'lk-hoa-can-lure-gap-gon-5-khuc-52713792350',
    category: 'Cần Câu',
    referencePrice: 1900000,
    description: 'Cần lure LK gấp gọn 5 khúc theo tên listing, mã sản phẩm Shopee 52713792350. Listing này khác mã với cần suối 5 khúc đang có trên website. Giá trong file xuất hiển thị 1,9 triệu đồng và chỉ mang tính tham khảo. Khi chọn cần, kiểm tra chiều dài lắp và thu gọn, loại máy, tải mồi, độ cứng, các khớp nối và phụ kiện đi kèm trên Shopee.',
  },
];

export const NEW_SHOPEE_PRODUCTS: Product[] = additions.map((item, index) => {
  const entry = MECUABIN_SHOPEE_LINKS.find(link => link.itemId === item.itemId);
  if (!entry?.url) throw new Error(`Missing mecuabin affiliate link for new product ${item.itemId}`);
  return {
    id: `shopee_${item.itemId}`,
    slug: item.slug,
    name: entry.name,
    category: item.category,
    description: item.description,
    shopeeUrl: entry.url,
    referencePrice: item.referencePrice,
    priceSource: 'default',
    tiktokLinkStatus: 'none',
    status: 'active',
    featured: true,
    sourceRow: 72 + index,
    updatedAt: '2026-10-24T11:08:49+07:00',
  };
});
