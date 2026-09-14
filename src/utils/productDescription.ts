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

function nameFacts(name: string): string[] {
  const facts: string[] = [];
  const normalized = name.toLowerCase();
  const patterns: Array<[RegExp, string]> = [
    [/\b(ul)\b/i, 'cần UL, phù hợp khi ưu tiên cảm giác câu nhẹ và các dòng cá nhỏ'],
    [/\b(\d+h)\b/i, '$1, thông tin độ cứng được thể hiện trong tên sản phẩm'],
    [/\b(\d+)\s*khúc\b/i, '$1 khúc, cần lưu ý cách lắp và kích thước khi di chuyển'],
    [/\b(\d+)\s*ngọn\b/i, '$1 ngọn, phù hợp khi cần chủ động thay đổi lựa chọn sử dụng'],
    [/\b(\d+)\s*m\b/i, '$1 m dây theo thông tin nhận diện trong tên sản phẩm'],
    [/\b(x[48])\b/i, 'dây dù $1, nên đối chiếu đúng size và chiều dài ở phân loại'],
    [/\b(\d+)\s*kg\b/i, 'tải tĩnh tham khảo $1kg theo tên sản phẩm; cần đọc điều kiện tải của nhà bán'],
  ];

  for (const [pattern, template] of patterns) {
    const match = normalized.match(pattern);
    if (match) facts.push(template.replace('$1', match[1].toUpperCase()));
  }

  if (/rô\s*chép|chép/i.test(normalized)) facts.push('hướng đến câu rô, chép hoặc các bài câu đài tương ứng');
  if (/cá\s*lóc|chuột|lure/i.test(normalized)) facts.push('hướng đến câu lure, rê mồi và săn cá theo điều kiện điểm câu');
  if (/cá\s*suối|cá\s*bé|suối/i.test(normalized)) facts.push('hướng đến câu suối và các dòng cá nhỏ');
  if (/rô\s*phi|trắm\s*cỏ/i.test(normalized)) facts.push('phù hợp tham khảo cho bài câu rô phi, chép hoặc trắm cỏ');
  if (/combo|bộ\s+\d+|full\s*bộ/i.test(normalized)) facts.push('là combo/bộ sản phẩm, cần kiểm tra đầy đủ thành phần trước khi đặt');
  if (/tặng|khuyến\s*mãi/i.test(normalized)) facts.push('có thông tin quà tặng hoặc ưu đãi trong tên; quà tặng thực tế cần xác nhận tại thời điểm mua');

  return [...new Set(facts)];
}

function usageGuide(category: string, name: string): string {
  const normalized = name.toLowerCase();
  if (category === 'Cần Câu' && /lure|ul|suối|cá bé/i.test(normalized)) {
    return 'Cách dùng: lắp cần đúng khớp, phối máy và dây theo phân loại, sau đó chọn mồi và trọng lượng ném theo hướng dẫn của nhà bán. Khi câu lure nên kiểm tra khoen, đầu cần và khóa mồi trước mỗi buổi câu.';
  }
  if (category === 'Cần Câu') {
    return 'Cách dùng: lắp cần đúng khớp, kiểm tra đọt và dây trước khi câu; chọn chiều dài, độ cứng và phân loại theo loài cá, kiểu câu và không gian hồ/sông thực tế.';
  }
  if (category === 'Máy Câu') {
    return 'Cách dùng: gắn máy chắc vào cán cần, quấn dây đều trên spool, chỉnh phanh và lực kéo trước khi ném. Luôn đối chiếu size máy, tay quay và phân loại với cần đang sử dụng.';
  }
  if (category === 'Mồi Câu') {
    return 'Cách dùng: xem hướng dẫn pha hoặc sử dụng trên gian hàng, thử lượng mồi nhỏ trước rồi điều chỉnh theo thời tiết, độ sâu và phản ứng của cá tại điểm câu.';
  }
  if (category === 'Dây Câu') {
    return 'Cách dùng: chọn đúng size và chiều dài, quấn dây đều, kiểm tra nút nối và đoạn dây gần mồi trước khi câu; thay dây khi có dấu hiệu xước hoặc giảm độ bền.';
  }
  if (/Phao|Lưỡi/.test(category)) {
    return 'Cách dùng: chọn đúng size theo bộ câu, buộc lưỡi chắc và cân phao trước khi thả; kiểm tra độ bén và thay lưỡi nếu bị cong, gỉ hoặc mẻ.';
  }
  return 'Cách dùng: kiểm tra kích thước, chất liệu, phụ kiện đi kèm và khả năng tương thích với bộ đồ câu trước khi sử dụng.';
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
  const facts = nameFacts(product.name);
  const priceNote = product.referencePrice
    ? `Mức giá tham khảo hiện được ghi nhận là ${new Intl.NumberFormat('vi-VN').format(product.referencePrice)}đ`
    : 'Giá bán được cập nhật theo thông tin trên sàn';

  return [
    `${product.name} là ${itemType} LK Hòa dành cho người đang tìm sản phẩm có thông tin rõ ràng để cân nhắc trước khi mua. Nội dung dưới đây giúp bạn ${intent}.`,
    facts.length > 0
      ? `Thông tin nhận diện: ${facts.join('; ')}. Đây là các dữ kiện được thể hiện trong tên sản phẩm, không thay thế bảng thông số chính thức của nhà bán.`
      : 'Thông tin nhận diện: sản phẩm được phân loại theo danh mục và tên đăng bán; các thông số như kích thước, trọng lượng, size hoặc phiên bản cần đối chiếu tại gian hàng.',
    usageGuide(product.category, product.name),
    `${priceNote}. Tồn kho, phân loại, phí vận chuyển và mã giảm giá có thể thay đổi theo từng thời điểm hoặc chương trình của sàn.`,
    'Trước khi đặt mua, hãy kiểm tra ảnh thật, bảng thông số, phân loại đang chọn, thành phần combo và chính sách đổi trả trên gian hàng LK Hòa tại Shopee hoặc TikTok Shop. Giá khách hàng thanh toán không tăng khi sử dụng liên kết giới thiệu trên website.',
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
