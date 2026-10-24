import { MECUABIN_SHOPEE_LINKS, type ShopeeAffiliateAssignment } from '../data/mecuabinShopeeLinks';

const byUrl = new Map<string, ShopeeAffiliateAssignment>();
const byItemId = new Map<string, ShopeeAffiliateAssignment>();
const byName = new Map<string, ShopeeAffiliateAssignment[]>();

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/đ/g, 'd').normalize('NFD').replace(/[^a-z0-9]/g, '');
}

for (const entry of MECUABIN_SHOPEE_LINKS) {
  byItemId.set(entry.itemId, entry);
  for (const url of [...(entry.previousUrls || []), ...(entry.articleUrls || []), ...(entry.url ? [entry.url] : [])]) {
    byUrl.set(url, entry);
  }
  for (const name of new Set([entry.name, ...(entry.previousNames || [])].map(normalizeName))) {
    byName.set(name, [...(byName.get(name) || []), entry]);
  }
}

export function getMecuabinShopeeUrl(name: string, currentUrl?: string): string | undefined {
  const url = currentUrl?.trim();
  const itemId = url?.match(/^https:\/\/(?:www\.)?shopee\.vn\/(?:product|opaanlp)\/469572823\/(\d+)(?:[/?#]|$)/)?.[1];
  const names = byName.get(normalizeName(name));
  // Identical combo names can represent different item IDs; never guess between them.
  const entry = (url && byUrl.get(url)) || (itemId && byItemId.get(itemId)) ||
    (names?.length === 1 ? names[0] : undefined);
  return entry ? entry.url ?? undefined : currentUrl;
}
