/**
 * Short, product-only guides that overlapped a stronger editorial guide.
 *
 * These URLs stay reachable through permanent redirects.  They are omitted from
 * the guide hub, RSS, and sitemap so Google receives one clear destination per
 * search intent instead of several near-identical product pages.
 */
export const CONSOLIDATED_GUIDE_REDIRECTS: Record<string, string> = {
  // Beginner lure rods → one comparison and selection guide.
  'can-ca-ty-hon': '/cam-nang/top-can-lure-lk-hoa-cho-nguoi-moi',
  'can-lure-star': '/cam-nang/top-can-lure-lk-hoa-cho-nguoi-moi',
  'can-lure-two': '/cam-nang/top-can-lure-lk-hoa-cho-nguoi-moi',
  'can-lure-hoc-sinh': '/cam-nang/top-can-lure-lk-hoa-cho-nguoi-moi',
  'can-lure-sv-pro': '/cam-nang/top-can-lure-lk-hoa-cho-nguoi-moi',
  'can-ul-suoi': '/cam-nang/top-can-lure-lk-hoa-cho-nguoi-moi',

  // Lure shapes → one intent-led lure selection guide.
  'moi-lure-bo': '/cam-nang/top-moi-lure-ca-loc-lk-hoa',
  'moi-ca-sat': '/cam-nang/top-moi-lure-ca-loc-lk-hoa',
  'moi-cau-rua': '/cam-nang/top-moi-lure-ca-loc-lk-hoa',
  'moi-lure-10g-to': '/cam-nang/top-moi-lure-ca-loc-lk-hoa',
  'moi-snake-mini': '/cam-nang/top-moi-lure-ca-loc-lk-hoa',
  'moi-nhai-hoi': '/cam-nang/top-moi-lure-ca-loc-lk-hoa',
  'nhai-hoi-bkk': '/cam-nang/top-moi-lure-ca-loc-lk-hoa',

  // Near-duplicate product guides → the corresponding buying decision guide.
  'can-dai-ro-chep-2026': '/cam-nang/so-sanh-can-lk-tong-hop-va-lk-ro-chep',
  'can-dai-ro-chep-pro-4h': '/cam-nang/so-sanh-can-lk-tong-hop-va-lk-ro-chep',
  'phao-cau-luc': '/cam-nang/cach-chon-phao-cau-dai-lk-hoa',
  'du-lk-red-x8': '/cam-nang/du-lk-x8',
  'luoi-cau-don': '/cam-nang/luoi-san-hang',
  'luoi-cau-dai': '/cam-nang/luoi-san-hang',

  // Two standalone accessory listings → the relevant shopping category.
  'khoa-link-snap': '/danh-muc/phu-kien',
  'kep-gap-ca': '/danh-muc/phu-kien',
};

export function isConsolidatedGuide(slug: string): boolean {
  return Object.hasOwn(CONSOLIDATED_GUIDE_REDIRECTS, slug);
}
