import { DOCAULKHOA_SOURCE_PRODUCTS } from '../data/docaulkhoaSourceData';
import { MECUABIN_SHOPEE_LINKS } from '../data/mecuabinShopeeLinks';
import { SHOPEE_VARIANT_SNAPSHOT } from '../data/shopeeVariantSnapshot';
import type { Product } from '../types';

// Only map listings that identify the same physical product with high confidence.
// Similar-looking products are intentionally left unmapped to avoid incorrect
// sizes, prices or compatibility claims.
export const SOURCE_PRODUCT_SLUG_BY_CATALOG_SLUG: Record<string, string> = {
  'lk-hoa-combo-can-sv-may-mg-46818226062': 'combo-cau-lure-can-lk-sv-may-daiwa-mg',
  'lk-hoa-can-lure-carbon-mono-57368864059': 'can-cau-lure-mono-lk',
  'lk-hoa-combo-cheap-daiwa-mg-28827886331': 'bo-can-cau-lure-cheap-lk-may-daiwa-mg',
  'lk-hoa-mu-luoi-trai-57718929625': 'mu-lk-hoa-phien-ban-limited',
  'lk-hoa-can-lure-gap-gon-5-khuc-52713792350': 'can-5-khuc-lk',
  'lk-hoa-mua-01-can-soil-tang-01-cuon-du-lk-x4-can-solid-da-nang-tai-tinh-10kg': 'can-cau-lure-solid-lk-hoa',
  'ra-mat---mo-ban-can-cau-lure-dung-1-khuc-tieu-lk-can-cau-chuyen-lure-tieu-lk': 'can-cau-lure-tieu-lk',
  'bst-gioi-han-can-cau-chuyen-lure-lk-special-ca-map-can-cau-chuyen-lure-special': 'can-cau-lure-lk-special-phien-ban-ca-map',
  'lk-hoa-can-cau-dai-ban-ro-chep-2026': 'can-ro-chep-lk-hoa-2026',
  'lk-hoa-can-dai-lk-pro-2025-phien-ban-tong-hop-do-cung-5h-can-cau-dai-lk-pro-2025': 'can-lk-pro-tong-hop-2025',
  'lk-hoa-can-cau-chuyen-lure-tieu-hoc-sinh-lk-can-lure-lk-1-khuc-tieu-hoc': 'can-cau-lure-tieu-hoc-lk',
  'lk-hoa-can-cau-dai-5h-lk-tong-hop-2026': 'can-cau-dai-lk-tong-hop-2026',
  'mua-01-can-tang-01-chuot-tieu-lk-can-cau-lure-can-go-lk-can-cau-chuyen-lure': 'can-cau-lure-lk-can-go',
  'can-cau-chuyen-lure-cheap-lk-gia-hoc-sinh-sinh-vien-can-lure-lk-cheap-chuyen-lure': 'can-cau-lure-cheap-lk',
  'lk-hoa-mua-01-can-tang-01-goi-cam-chep-lk-can-cau-lk-hoa---phien-ban-tong-hop---5h': 'can-tong-hop-lk-ban-thuong',
  'lk-hoa-khi-mua-01-can-duoc-tang-01-cai-phao-so-5-can-dai-vip-lk-phien-ban-moi-2024': 'can-dai-lk-ban-vip-2024',
  'lk-hoa-bo-2-san-pham-can-cau-cheap-lk-va-may-daiwa-rs-bo-can-may-chuyen-cau-lure': 'bo-can-cau-lure-cheap-lk-may-daiwa-rs',
  'lk-hoa-mua-01-can-tang-01-du-lk-x4-can-sv-sinh-vien-pro-phien-ban-moi-nhat-2025-can-cau-lure-sv-2025': 'can-cau-lure-sv-pro-2025',
  'lk-hoa-mua-01-can-tang-01-du-lk-x4-can-cau-solid-pro-lk-2026': 'can-solid-pro-2026',
  'lk-hoa-can-cau-chuyen-lure-star-lk-can-1-khuc-star': 'can-cau-lure-star-lk',
  'llk-hoa-can-cau-ul-lk-chuyen-danh-cac-dong-ca-suoi-va-ca-be-di-cau-bat-ca': 'can-lure-suoi-lk',
  'lk-hoa-mua-01-can-tang-01-goi-cam-chep-vang-can-dai-lk-ro-chep-pro-2025-phien-ban-4hchuyen-cau-dai-bat-ca-di-cau': 'can-lk-pro-ro-chep-2025',
  'lk-hoa-bo-2-san-pham-can-cheap-va-may-daiwa-mg-bo-2-can-chuyen-cau-lure': 'bo-can-cau-lure-cheap-lk-may-daiwa-mg',
  'lk-hoa-can-cau-chuyen-lure-suoi-lk-khoen-fuji-can-chuyen-danh-cac-dong-ca-suoi-va-ca-be': 'can-lure-suoi-lk',
  'lk-hoa-combo-chuyen-lure-can-lk-may-dung-rs-moi-du-full-bo-07-san-pham': 'combo-cau-lure-can-cheap-lk-may-daiwa-rs',
  'lk-hoa-mua-01-can-tang-01-tui-luoi-ro-chep-12-cai-can-cau-tay-lk-hoa---phien-ban-san-ro-chep---4h': 'can-ro-chep-lk-ban-thuong-4h',
  'lk-hoa-mua-01-can-tang-01-cuon-du-lk-x4-can-lure-lk-sv-sinh-vien-can-lure-lk-phien-ban-moi-can-chuyen-cau-lure-lk': 'can-cau-lure-lk-sinh-vien',
  'lk-hoa-can-two-lk-can-lure-2-ngon-lk-can-cau-chuyen-lure-lk': 'can-cau-lure-two-lk',
  'lk-hoa-can-cau-chuyen-lure-lk-hoc-sinh-can-lure-lk-gia-re-phien-ban-hoc-sinh': 'can-lure-hoc-sinh-lk-hoa',
  'lk-hoa-may-cau-chuyen-lure-daiwa-mg-may-cau-dung-chuyen-cau-lure-hang-daiwa-di-cau-bat-ca': 'may-cau-lure-daiwa-mg',
  'lk-hoa-mua-01-may-tang-01-moi-lure-ca-sat-may-cau-ca-daiwa-rs-chuyen-lure---dong-may-chinh-hang-daiwa': 'may-cau-lure-daiwa-rs',
  'lk-hoa-moi-cau-dai-lk-moi-chuyen-dung-cho-cau-ro-phi-chep-tram-co': 'moi-cau-dai-lk-tong-hop',
  'moi-cau-ca-chuyen-lure-chuot-lk--full-phien-ban-skin-s-m-l': 'moi-cau-lure-chuot-lk',
  'lk-hoa-moi-cau-chuyen-lure-chuot-lk-action-noi-va-lung-s7g-m8g-mskin8g-va-l12g-lung': 'moi-cau-lure-chuot-lk',
  'moi-cau-chuyen-cau-lure-coc-lk': 'moi-cau-lure-coc-lk',
  'moi-cau-dai-lk-moi-chuyen-dung-cho-cau-ro-phi-chep-tram-co': 'moi-cau-dai-lk-tong-hop',
  'moi-cau-chuyen-lure-chuot-tieu-lk---chuyen-danh-size-bu-binh---action-noi-size-5g-di-cau-cau-ca-fishing-fish-bat-ca': 'moi-cau-lure-chuot-tieu-lk',
  'lk-hoa-moi-cau-chuyen-lure-bo-lk-moi-cau-chuyen-lure-lk': 'moi-cau-lure-bo-lk',
  'lk-hoa-cam-chep-lk-series-2-moi-cau-chep-the-he-moi': 'cam-chep-den-lk',
  'mo-ban-moi-cau-chuot-tron-lk-chuot-tron-phien-ban-moi-moi-hoi-chuot-tron-lk-chuyen-cau-lure': 'chuot-tron-lk-hoa-chinh-hang',
  'lk-hoa-khi-mua-05-con-se-duoc-tang-them-01-ca-sat-lk-moi-cau-lure-ca-sat-lk-moi-ca-sat-chuyen-lure-cau-ca-bat-ca': 'moi-cau-lure-buom-sat-lk',
  'lk-hoa-moi-cau-ro-phi-lk-hoa-moi-cau-dai-chuyen-ro-phi-lk': 'moi-ro-phi-lk',
  'lk-hoa-moi-cam-chep-re-lk-moi-chuyen-chep-re-lk': 'cam-chep-do-lk',
  'moi-cau-chuyen-lure-chem-mang-vuoc--combo-5in1-skinking': 'moi-cau-lure-chem-mang-vuoc',
  'lk-hoa-truc-cau-dai-lk-chuyen-ro-chep-truc-chuyen-cau-ro-chep-lk': 'truc-ro-chep-lk',
  'mo-ban-day-du-chuyen-cau-lure-lk-hoa--dai-100m-va-150m-cho-enh-em-lua-chon-full-size-06-30': 'du-cau-lure-lk-hoa-x8',
  'lk-hoa-du-pe-x4-lk-chuyen-cau-lure-fishing': 'du-pe-x4-lk-hoa',
  'day-cuoc-chuyen-cau-ca-lk-black-carp---lam-leader-day-link-truc-theo': 'cuoc-lk-hoa',
  'lk-hoa-khoa-link-chuyen-cau-lure-snap-lk-di-cau-bat-ca': 'khoa-link-snap-lk',
  'lk-hoa-theo-cau-dai-buoc-san-lk-chuyen-ro-chep-theo-lk-lam-san-cau-ro-chep': 'theo-ro-chep-lk',
  'lk-hoa-mua-01-cuon-du-tang-01-bich-khoa-link-du-lk-x8-chuyen-lure-the-he-moi-du-lk-x8-mau-den-chuyen-cau-lure': 'du-lk-x8-mau-den',
  'lk-hoa-day-du-chuyen-cau-lure-lk-red-x8-day-cau-chuyen-lure-lk-red-150m-day-lk-red-khong-phai-mau': 'du-cau-lure-lk-red-x8',
  'lk-hoa-luoi-cau-don-lk---luoi-cau-ro-chep-lk': 'luoi-ro-chep-lk',
  'luoi-cau-ar-15-luoi-cau-lure': 'luoi-cau-moi-mem-ar-15',
  'lk-hoa-kim-go-luoi-go-ca-va-vong-ring-lk-kim-da-nang-cat-day-leader-va-day-pe': 'kim-lk',
  'lk-hoa-tui-dung-ca-lk-tui-cau-dung-ca-hoac-dung-phu-kien-di-cau': 'tui-dung-ca-lk',
  'lk-hoa-mo-ban-cuoc-ruby-hong-lk-500m-cau-da-nang-day-nylon-lk': 'day-cau-cuoc-lk',
  'lk-hoa-mo-ban-can-cau-jig-lk-can-chuyen-jig': 'can-cau-jig-lk',
  'lk-hoa-mo-ban-can-suoi-5-khuc-can-gap-gon': 'can-lure-suoi-5-khuc-lk',
};

function normalizeSourceDescription(description: string): string {
  return description
    .replaceAll('docaulkhoa.com', 'docaulkhoa.vn')
    .replace(/an toàn tuyệt đối/gi, 'an toàn hơn');
}

export function applySourceProductEnrichment(product: Product): Product {
  const sourceSlug = SOURCE_PRODUCT_SLUG_BY_CATALOG_SLUG[product.slug];
  const source = sourceSlug ? DOCAULKHOA_SOURCE_PRODUCTS[sourceSlug] : undefined;
  if (!source) return applyShopeeVariantFallback(product);

  const variants = source.variants.map((variant) => {
    const sourceSuffix = variant.id.replace(`${sourceSlug}-`, '');
    const generatedSourceSku = variant.sku.startsWith(`${sourceSlug}-`);
    return {
      ...variant,
      id: `${product.id}-${sourceSuffix}`,
      sku: generatedSourceSku ? `${product.id}-${sourceSuffix}` : variant.sku,
      optionValues: variant.label.split(' · ').map((value) => value.trim()),
    };
  }).sort((left, right) => Number(left.stock === 0) - Number(right.stock === 0));
  const groupNames = source.variants[0]?.groupName.split(' · ').map((value) => value.trim()) || [];
  const variantGroups = groupNames.map((name, index) => ({
    name,
    options: [...new Set(variants.map((variant) => variant.optionValues?.[index]).filter((value): value is string => Boolean(value)))],
  }));
  return {
    ...product,
    sku: product.sku || variants[0]?.sku,
    description: normalizeSourceDescription(source.description),
    specs: source.specs.length ? source.specs : product.specs,
    variants: variants.length ? variants : product.variants,
    variantGroups: variantGroups.length ? variantGroups : product.variantGroups,
  };
}

function productPrice(product: Product): number {
  return product.salePrice || product.referencePrice || product.originalPrice || 0;
}

function applyShopeeVariantFallback(product: Product): Product {
  if (product.variants?.length) return product;
  const normalizedName = product.name.toLocaleLowerCase('vi-VN').replace(/[^a-z0-9à-ỹ]+/g, ' ').trim();
  const entry = MECUABIN_SHOPEE_LINKS.find((item) =>
    item.url === product.shopeeUrl ||
    normalizedName.includes(item.name.toLocaleLowerCase('vi-VN').replace(/[^a-z0-9à-ỹ]+/g, ' ').trim()) ||
    item.name.toLocaleLowerCase('vi-VN').replace(/[^a-z0-9à-ỹ]+/g, ' ').trim().includes(normalizedName)
  );
  const snapshot = entry ? SHOPEE_VARIANT_SNAPSHOT.find((item) => item.i === entry.itemId) : undefined;
  if (!snapshot) return product;

  const unavailable = new Set(snapshot.u.map((indices) => indices.join(':')));
  const combinations = snapshot.v.reduce<number[][]>(
    (rows, group) => rows.flatMap((row) => group.o.map((_, index) => [...row, index])),
    [[]],
  );
  const price = productPrice(product);
  const variants = combinations.map((indices, variantIndex) => {
    const optionValues = indices.map((optionIndex, groupIndex) => snapshot.v[groupIndex].o[optionIndex]);
    return {
      id: `${product.id}-shopee-${variantIndex + 1}`,
      label: optionValues.filter(Boolean).join(' · ') || 'Phiên bản tiêu chuẩn',
      groupName: snapshot.v.map((group) => group.n || 'Phân loại').join(' · '),
      price,
      originalPrice: product.originalPrice && product.originalPrice > price ? product.originalPrice : undefined,
      sku: `LK-${snapshot.i}-${indices.map((index) => index + 1).join('-')}`,
      stock: unavailable.has(indices.join(':')) ? 0 : 1,
      optionValues,
    };
  }).sort((left, right) => Number(left.stock === 0) - Number(right.stock === 0));

  return {
    ...product,
    sku: product.sku || variants[0]?.sku,
    variants,
    variantGroups: snapshot.v.map((group) => ({
      name: group.n || 'Phân loại',
      options: group.o.filter(Boolean),
    })),
  };
}

export function applySourceCatalogEnrichment(products: Product[]): Product[] {
  return products.map(applySourceProductEnrichment);
}
