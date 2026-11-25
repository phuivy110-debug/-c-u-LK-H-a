import type { Product, ProductReview, ProductSpec, ProductVariant } from '../types';
import { productPrice } from '../utils/catalog';

export interface ProductDetailData {
  sku: string;
  soldCount?: number;
  rating?: number;
  reviewCount?: number;
  stockCount?: number;
  gallery: string[];
  youtubeId?: string;
  youtubeTitle?: string;
  variants: ProductVariant[];
  specs: ProductSpec[];
  riggingGuide?: string;
  reviews: ProductReview[];
}

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
  const active = products.filter((product) => product.status === 'active');
  const flagship = FLAGSHIP_SLUGS
    .map((slug) => active.find((product) => product.slug === slug))
    .filter((product): product is Product => Boolean(product));
  const usedIds = new Set(flagship.map((product) => product.id));
  return [...flagship, ...active.filter((product) => !usedIds.has(product.id))].slice(0, count);
}

function buildStandardVariant(product: Product): ProductVariant {
  const price = productPrice(product);
  return {
    id: `${product.id}-standard`,
    label: 'Phiên bản tiêu chuẩn',
    groupName: 'Phân loại',
    price,
    originalPrice:
      product.originalPrice && product.originalPrice > price ? product.originalPrice : undefined,
    sku: product.sku || product.id,
  };
}

function youtubeIdFromUrl(url?: string): string | undefined {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1) || undefined;
    if (parsed.hostname.endsWith('youtube.com')) {
      return parsed.searchParams.get('v') || parsed.pathname.split('/').filter(Boolean).pop();
    }
  } catch {
    return undefined;
  }
  return undefined;
}

export function getProductDetailData(product: Product): ProductDetailData {
  const variants = product.variants?.length ? product.variants : [buildStandardVariant(product)];
  const gallery = [product.imageUrl, ...(product.gallery || [])]
    .filter((url): url is string => Boolean(url))
    .filter((url, index, values) => values.indexOf(url) === index);
  const knownStocks = variants
    .map((variant) => variant.stock)
    .filter((stock): stock is number => typeof stock === 'number' && Number.isFinite(stock));

  return {
    sku: product.sku || variants[0].sku,
    soldCount: product.soldCount,
    rating: product.rating,
    reviewCount: product.reviewCount,
    stockCount: knownStocks.length === variants.length
      ? knownStocks.reduce((sum, stock) => sum + stock, 0)
      : undefined,
    gallery,
    youtubeId: youtubeIdFromUrl(product.youtubeUrl),
    youtubeTitle: product.youtubeUrl ? `Video thực tế ${product.name}` : undefined,
    variants,
    specs: product.specs || [
      { label: 'Danh mục', value: product.category },
      { label: 'Tình trạng', value: 'Đang kinh doanh' },
      { label: 'Kiểm tra hàng', value: 'Hỗ trợ đồng kiểm khi nhận COD' },
    ],
    riggingGuide: product.riggingGuide,
    reviews: [],
  };
}
