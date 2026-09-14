import type { Product } from '../types';

const CATEGORY_LABELS: Record<string, string> = {
  'Cần Câu': 'cần câu',
  'Máy Câu': 'máy câu',
  'Mồi Câu': 'mồi câu',
  'Dây Câu': 'dây câu',
  'Phao & Lưỡi Câu': 'phao và lưỡi câu',
  'Phao & Lưỡi': 'phao và lưỡi câu',
  'Phụ Kiện': 'phụ kiện đồ câu',
};

const CATEGORY_INTENTS: Record<string, string> = {
  'Cần Câu': 'chọn cần câu phù hợp với kiểu câu, kinh nghiệm và ngân sách',
  'Máy Câu': 'chọn máy câu đồng bộ với cần, dây và nhu cầu sử dụng',
  'Mồi Câu': 'chọn mồi câu theo loài cá, tầng nước và điều kiện điểm câu',
  'Dây Câu': 'chọn dây câu có thông tin rõ ràng theo kiểu câu và bộ đồ đang dùng',
  'Phao & Lưỡi Câu': 'chuẩn bị bộ phao, lưỡi và phụ kiện đầu câu phù hợp',
  'Phao & Lưỡi': 'chuẩn bị bộ phao, lưỡi và phụ kiện đầu câu phù hợp',
  'Phụ Kiện': 'bổ sung phụ kiện đồ câu giúp buổi câu gọn gàng và thuận tiện hơn',
};

function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] || category.toLowerCase() || 'đồ câu';
}

function categoryIntent(category: string): string {
  return CATEGORY_INTENTS[category] || `tìm hiểu và chọn ${categoryLabel(category)} phù hợp`;
}

function isThinDescription(description: string | undefined): boolean {
  if (!description) return true;
  const normalized = description.trim().toLowerCase();
  return normalized.length < 180 || normalized.startsWith('sản phẩm ');
}

/**
 * Creates useful, factual copy from catalog fields when the source sheet has no
 * editorial description. It intentionally avoids inventing dimensions,
 * materials, load ratings, or performance claims that are not in the source.
 */
export function generateSeoProductDescription(product: Pick<Product, 'name' | 'category' | 'referencePrice' | 'originalPrice'>): string {
  const itemType = categoryLabel(product.category);
  const intent = categoryIntent(product.category);
  const priceNote = product.referencePrice
    ? `Mức giá tham khảo hiện được ghi nhận là ${new Intl.NumberFormat('vi-VN').format(product.referencePrice)}đ`
    : 'Giá bán được cập nhật theo thông tin trên sàn';

  return [
    `${product.name} là ${itemType} LK Hòa được nhiều cần thủ quan tâm khi tìm đồ câu chính hãng, thông tin sản phẩm rõ ràng và nơi mua thuận tiện.`,
    `Trang này giúp bạn ${intent}. Tên sản phẩm, danh mục, hình ảnh và mức giá được tổng hợp để dễ so sánh trước khi chuyển sang gian hàng LK Hòa trên Shopee hoặc TikTok Shop.`,
    `Với sản phẩm này, ${priceNote}. Tồn kho, phân loại, phí vận chuyển và mã giảm giá có thể thay đổi theo từng thời điểm hoặc chương trình của sàn.`,
    'Để chọn đúng sản phẩm, hãy mở gian hàng chính thức để kiểm tra thông số, phiên bản, kích thước và chính sách đổi trả trước khi đặt mua. Giá khách hàng thanh toán không tăng khi sử dụng liên kết giới thiệu trên website.',
  ].join('\n\n');
}

export function getProductDescription(product: Product): string {
  return isThinDescription(product.description)
    ? generateSeoProductDescription(product)
    : product.description!.trim();
}

export function getProductDescriptionExcerpt(product: Product, maxLength = 132): string {
  const firstParagraph = getProductDescription(product).split(/\n\n/)[0];
  if (firstParagraph.length <= maxLength) return firstParagraph;
  return `${firstParagraph.slice(0, maxLength - 1).trimEnd()}…`;
}
