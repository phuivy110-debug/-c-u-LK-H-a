import type { Product } from '../types';
import { normalizeSearch, productPrice } from './catalog';
import { generateSeoProductDescription, getProductDescription } from './productDescription';

export interface ProductCopySection {
  title: string;
  body: string;
}

export interface ProductFaqItem {
  question: string;
  answer: string;
}

export interface ProductDescriptionLayout {
  intro: string;
  highlights: string[];
  sections: ProductCopySection[];
  faq: ProductFaqItem[];
}

const CATEGORY_PATHS: Record<string, string> = {
  'Cần Câu': '/danh-muc/can-cau',
  'Máy Câu': '/danh-muc/may-cau',
  'Mồi Câu': '/danh-muc/moi-cau',
  'Dây Câu': '/danh-muc/day-cau',
  'Phao & Lưỡi': '/danh-muc/phao-luoi',
  'Phao & Lưỡi Câu': '/danh-muc/phao-luoi',
  'Phụ Kiện': '/danh-muc/phu-kien',
};

const CATEGORY_SELECTION_CRITERIA: Record<string, string[]> = {
  'Cần Câu': ['Chiều dài cần', 'Độ cứng / action', 'Máy đứng hoặc máy ngang', 'Tải mồi / tải cá', 'Màu hoặc phiên bản'],
  'Máy Câu': ['Size máy', 'Tay quay', 'Tỷ số truyền', 'Lực phanh', 'Cối và sức chứa dây'],
  'Mồi Câu': ['Size / trọng lượng', 'Màu hoặc mùi', 'Action nổi / lửng / chìm', 'Số lượng trong gói'],
  'Dây Câu': ['Cỡ dây', 'Chiều dài cuộn', 'Màu dây', 'X4 / X8 / nylon', 'Tải công bố'],
  'Phao & Lưỡi': ['Size', 'Mẫu phao / lưỡi', 'Có ngạnh / không ngạnh', 'Số lượng trong gói'],
  'Phao & Lưỡi Câu': ['Size', 'Mẫu phao / lưỡi', 'Có ngạnh / không ngạnh', 'Số lượng trong gói'],
  'Phụ Kiện': ['Kích thước', 'Màu sắc', 'Phiên bản', 'Số lượng / bộ'],
};

function cleanProductCopy(value: string): string {
  return value
    .replace(/\s+/g, ' ')
    .replace(/\b(tuyệt đối|hoàn hảo|100%)\b/giu, '')
    .replace(/\s+([,.!?])/g, '$1')
    .trim();
}

function isFaqHeading(value: string): boolean {
  return /^câu hỏi thường gặp\??$/iu.test(value.trim());
}

function isQuestion(value: string): boolean {
  return /^\d+[.)]\s+.+\?$/u.test(value.trim()) || (/\?$/.test(value.trim()) && value.trim().length < 180);
}

function isSectionHeading(value: string): boolean {
  const text = value.trim();
  if (!text || text.length > 130 || /[.!?]$/.test(text)) return false;
  return /^(ưu điểm|đặc điểm|điểm nổi bật|thông số|thành phần|thiết kế|khám phá|chi tiết|các phiên bản|phân loại|đối tượng|ứng dụng|kích thước|hướng dẫn|cách dùng|cách chọn|bảng thông số|khả năng)/iu.test(text);
}

function sentenceHighlights(value: string): string[] {
  return cleanProductCopy(value)
    .split(/(?<=[.!?])\s+/u)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length >= 35 && sentence.length <= 180);
}

function fallbackFaq(product: Product): ProductFaqItem[] {
  const groups = product.variantGroups?.filter((group) => group.options.length) || [];
  const criteria = getVariantSelectionCriteria(product);
  const result: ProductFaqItem[] = [];

  if (groups.length) {
    result.push({
      question: `${product.name} có những phiên bản nào?`,
      answer: groups
        .map((group) => `${group.name}: ${group.options.slice(0, 8).join(', ')}`)
        .join('. ') + '.',
    });
  }

  result.push({
    question: 'Nên kiểm tra gì trước khi đặt hàng?',
    answer: `Hãy đối chiếu ${criteria.slice(0, 4).join(', ').toLocaleLowerCase('vi')} với nhu cầu thực tế. Nếu còn phân vân, hãy nhắn LK Hòa để được xác nhận đúng phiên bản trước khi chốt đơn.`,
  });
  return result;
}

export function getProductDescriptionLayout(product: Product): ProductDescriptionLayout {
  const primaryBlocks = getProductDescription(product).split(/\n\s*\n/).map((value) => value.trim()).filter(Boolean);
  const generatedBlocks = generateSeoProductDescription(product).split(/\n\s*\n/).map((value) => value.trim()).filter(Boolean);
  const blocks = primaryBlocks.length >= 3 ? primaryBlocks : [...primaryBlocks, ...generatedBlocks];
  const faqStart = blocks.findIndex(isFaqHeading);
  const contentBlocks = (faqStart >= 0 ? blocks.slice(0, faqStart) : blocks).filter((value) => !isFaqHeading(value));
  const faqBlocks = faqStart >= 0 ? blocks.slice(faqStart + 1) : [];
  const intro = cleanProductCopy(contentBlocks.find((value) => !isSectionHeading(value) && !/^[-•]/u.test(value)) || generatedBlocks[0] || product.name);
  const sections: ProductCopySection[] = [];
  let currentTitle = '';

  for (const rawBlock of contentBlocks.slice(1)) {
    if (isSectionHeading(rawBlock)) {
      currentTitle = cleanProductCopy(rawBlock);
      continue;
    }
    const body = cleanProductCopy(rawBlock.replace(/^(Thông tin nhận diện|Thông tin sử dụng thực tế|Cách dùng):\s*/iu, ''));
    if (!body || /^[-•]/u.test(rawBlock)) continue;
    const last = sections.at(-1);
    if (last && last.title === currentTitle) last.body = `${last.body} ${body}`;
    else sections.push({ title: currentTitle || 'Thông tin sản phẩm', body });
  }

  const bulletHighlights = contentBlocks
    .filter((value) => /^[-•]/u.test(value))
    .map((value) => cleanProductCopy(value.replace(/^[-•]\s*/u, '')));
  const featureText = sections
    .filter((section) => /ưu điểm|đặc điểm|nổi bật|thiết kế|khả năng/iu.test(section.title))
    .flatMap((section) => sentenceHighlights(section.body));
  const highlights = [...new Set([...bulletHighlights, ...featureText, ...sentenceHighlights(intro)])]
    .filter((value) => value.length >= 20)
    .slice(0, 5);

  const faq: ProductFaqItem[] = [];
  for (let index = 0; index < faqBlocks.length; index += 1) {
    if (!isQuestion(faqBlocks[index])) continue;
    const answer = cleanProductCopy(faqBlocks[index + 1] || '');
    if (answer && !isQuestion(answer)) {
      faq.push({ question: cleanProductCopy(faqBlocks[index].replace(/^\d+[.)]\s*/u, '')), answer });
      index += 1;
    }
  }

  return {
    intro,
    highlights: highlights.length ? highlights : getVariantSelectionCriteria(product).slice(0, 4),
    sections: sections
      .filter((section) => section.body !== intro)
      .slice(0, 4),
    faq: (faq.length ? faq : fallbackFaq(product)).slice(0, 3),
  };
}

export function getProductCopySections(product: Product): ProductCopySection[] {
  const layout = getProductDescriptionLayout(product);

  return [{ title: 'Tổng quan sản phẩm', body: layout.intro }, ...layout.sections];
}

export function getVariantSelectionCriteria(product: Product): string[] {
  const criteria = [...(CATEGORY_SELECTION_CRITERIA[product.category] || ['Kích thước', 'Mẫu / phiên bản'])];
  const name = normalizeSearch(product.name);

  if (/combo|bo 2|full bo/.test(name)) criteria.unshift('Thành phần combo');
  if (/5h|6h|8h|4h/.test(name)) criteria.unshift('Độ cứng đúng phiên bản');
  if (/lure|ul|suoi/.test(name) && !criteria.includes('Máy đứng hoặc máy ngang')) criteria.unshift('Máy đứng hoặc máy ngang');
  if (/mau|mu|chuot|nhai|ca sat/.test(name) && !criteria.includes('Màu hoặc phiên bản')) criteria.unshift('Màu hoặc phiên bản');

  return [...new Set(criteria)].slice(0, 6);
}

export function categoryPath(category: string): string {
  return CATEGORY_PATHS[category] || '/san-pham';
}

export function getComplementaryCategories(product: Product): string[] {
  const name = normalizeSearch(product.name);
  if (product.category === 'Cần Câu') {
    return /dai|ro chep|5h|6h|8h/.test(name)
      ? ['Dây Câu', 'Phao & Lưỡi Câu', 'Mồi Câu', 'Phụ Kiện']
      : ['Máy Câu', 'Dây Câu', 'Mồi Câu', 'Phụ Kiện'];
  }
  if (product.category === 'Máy Câu') return ['Cần Câu', 'Dây Câu', 'Mồi Câu', 'Phụ Kiện'];
  if (product.category === 'Mồi Câu') return ['Cần Câu', 'Dây Câu', 'Phao & Lưỡi Câu', 'Phụ Kiện'];
  if (product.category === 'Dây Câu') return ['Cần Câu', 'Máy Câu', 'Mồi Câu', 'Phụ Kiện'];
  if (product.category.startsWith('Phao & Lưỡi')) return ['Dây Câu', 'Mồi Câu', 'Cần Câu', 'Phụ Kiện'];
  return ['Cần Câu', 'Dây Câu', 'Mồi Câu', 'Máy Câu'];
}

function compatibilityScore(candidate: Product, source: Product, categoryOrder: string[]): number {
  const categoryIndex = categoryOrder.indexOf(candidate.category);
  if (categoryIndex < 0) return -1;

  const sourceText = normalizeSearch(`${source.name} ${source.description || ''}`);
  const candidateText = normalizeSearch(`${candidate.name} ${candidate.description || ''}`);
  let score = 100 - categoryIndex * 15;
  const sharedIntents = ['lure', 'ro chep', 'ca loc', 'suoi', 'cau dai', 'x4', 'x8'];
  score += sharedIntents.filter((term) => sourceText.includes(term) && candidateText.includes(term)).length * 20;
  if (candidate.featured) score += 4;
  if (productPrice(candidate) > 0 && productPrice(candidate) <= productPrice(source) * 0.6) score += 3;
  return score;
}

export function getComplementaryProducts(source: Product, products: Product[], limit = 4): Product[] {
  const categories = getComplementaryCategories(source);
  const ranked = products
    .filter((candidate) => candidate.status === 'active' && candidate.id !== source.id && categories.includes(candidate.category))
    .map((candidate) => ({ candidate, score: compatibilityScore(candidate, source, categories) }))
    .sort((a, b) => b.score - a.score || a.candidate.sourceRow - b.candidate.sourceRow);

  const selected: Product[] = [];
  for (const category of categories) {
    const match = ranked.find(({ candidate }) => candidate.category === category && !selected.some((item) => item.id === candidate.id));
    if (match) selected.push(match.candidate);
    if (selected.length === limit) return selected;
  }

  for (const { candidate } of ranked) {
    if (!selected.some((item) => item.id === candidate.id)) selected.push(candidate);
    if (selected.length === limit) break;
  }
  return selected;
}

