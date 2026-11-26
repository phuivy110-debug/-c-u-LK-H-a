import type { Product } from '../types';
import { normalizeSearch, productPrice } from './catalog';
import { generateSeoProductDescription, getProductDescription } from './productDescription';

export interface ProductCopySection {
  title: string;
  body: string;
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

function sectionTitle(paragraph: string, index: number): string {
  const normalized = paragraph.toLocaleLowerCase('vi');
  if (normalized.startsWith('thông tin nhận diện')) return 'Thông tin nhận diện';
  if (normalized.startsWith('thông tin sử dụng thực tế')) return 'Kinh nghiệm sử dụng thực tế';
  if (normalized.startsWith('cách dùng')) return 'Cách dùng và bảo quản';
  if (normalized.startsWith('giá bán') || normalized.startsWith('giá ')) return 'Giá và điều kiện đặt hàng';
  if (normalized.startsWith('trước khi đặt')) return 'Kiểm tra trước khi đặt';
  return index === 0 ? 'Sản phẩm này phù hợp với ai?' : `Thông tin cần biết ${index + 1}`;
}

export function getProductCopySections(product: Product): ProductCopySection[] {
  const primaryParagraphs = getProductDescription(product).split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const generatedParagraphs = generateSeoProductDescription(product).split(/\n\s*\n/).map((paragraph) => paragraph.trim()).filter(Boolean);
  const paragraphs = primaryParagraphs.length >= 4
    ? primaryParagraphs
    : [...primaryParagraphs, ...generatedParagraphs.filter((paragraph) => !primaryParagraphs.includes(paragraph))];

  return paragraphs
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => ({
      title: sectionTitle(paragraph, index),
      body: paragraph.replace(/^(Thông tin nhận diện|Thông tin sử dụng thực tế|Cách dùng):\s*/iu, ''),
    }));
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

