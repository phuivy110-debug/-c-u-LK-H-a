import { writeFile } from 'node:fs/promises';

const SOURCE_ORIGIN = 'https://docaulkhoa.com';
const SITEMAP_URL = `${SOURCE_ORIGIN}/product-sitemap.xml`;

type SourceVariation = {
  id: string;
  label: string;
  groupName: string;
  price: number;
  originalPrice?: number;
  sku: string;
  stock?: number;
};

type SourceProduct = {
  sourceUrl: string;
  sourceSlug: string;
  name: string;
  description: string;
  variants: SourceVariation[];
  specs: Array<{ label: string; value: string }>;
};

function decodeHtml(value: string): string {
  const named: Record<string, string> = {
    amp: '&', quot: '"', apos: "'", lt: '<', gt: '>', nbsp: ' ', ndash: '–', mdash: '—', hellip: '…',
  };
  return value
    .replace(/&#(x?[0-9a-f]+);/gi, (_, raw: string) => {
      const hex = raw.toLowerCase().startsWith('x');
      return String.fromCodePoint(Number.parseInt(hex ? raw.slice(1) : raw, hex ? 16 : 10));
    })
    .replace(/&([a-z]+);/gi, (full, key: string) => named[key.toLowerCase()] ?? full);
}

function cleanText(value: string): string {
  return decodeHtml(value)
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p\s*>/gi, '\n\n')
    .replace(/<\/h[1-6]\s*>/gi, '\n\n')
    .replace(/<li\b[^>]*>/gi, '• ')
    .replace(/<\/li\s*>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractBalancedDiv(html: string, marker: string): string {
  const markerIndex = html.indexOf(marker);
  if (markerIndex < 0) return '';
  const start = html.lastIndexOf('<div', markerIndex);
  if (start < 0) return '';
  const tagPattern = /<\/?div\b[^>]*>/gi;
  tagPattern.lastIndex = start;
  let depth = 0;
  let match: RegExpExecArray | null;
  while ((match = tagPattern.exec(html))) {
    if (match[0].startsWith('</')) depth -= 1;
    else depth += 1;
    if (depth === 0) return html.slice(start, tagPattern.lastIndex);
  }
  return '';
}

function titleCaseSlug(value: string): string {
  const preserved: Record<string, string> = {
    m: 'M', ml: 'ML', mh: 'MH', h: 'H', xh: 'XH', ul: 'UL', pe: 'PE', x4: 'X4', x8: 'X8',
  };
  return value.split('-').filter(Boolean).map((part) => preserved[part] || `${part[0]?.toUpperCase() || ''}${part.slice(1)}`).join(' ');
}

function parseAttributeOptions(html: string): Map<string, { group: string; options: Map<string, string> }> {
  const result = new Map<string, { group: string; options: Map<string, string> }>();
  const selectPattern = /<select\b([^>]*)>([\s\S]*?)<\/select>/gi;
  let selectMatch: RegExpExecArray | null;
  while ((selectMatch = selectPattern.exec(html))) {
    const attrs = selectMatch[1];
    const name = attrs.match(/data-attribute_name=["']([^"']+)["']/i)?.[1]
      || attrs.match(/name=["']([^"']+)["']/i)?.[1];
    if (!name?.startsWith('attribute_')) continue;
    const id = attrs.match(/id=["']([^"']+)["']/i)?.[1];
    const labelPattern = id ? new RegExp(`<label[^>]*for=["']${id}["'][^>]*>([\\s\\S]*?)<\\/label>`, 'i') : null;
    const group = cleanText(labelPattern?.exec(html)?.[1] || titleCaseSlug(name.replace(/^attribute_pa_/, '').replace(/^attribute_/, '')));
    const options = new Map<string, string>();
    const optionPattern = /<option\b[^>]*value=["']([^"']*)["'][^>]*>([\s\S]*?)<\/option>/gi;
    let optionMatch: RegExpExecArray | null;
    while ((optionMatch = optionPattern.exec(selectMatch[2]))) {
      if (optionMatch[1]) options.set(decodeHtml(optionMatch[1]), cleanText(optionMatch[2]));
    }
    result.set(name, { group, options });
  }
  return result;
}

function parseVariations(html: string, sourceSlug: string): SourceVariation[] {
  const encoded = html.match(/data-product_variations=(?:"([\s\S]*?)"|'([\s\S]*?)')\s*>/i)?.slice(1).find(Boolean);
  if (!encoded || encoded === 'false') return [];
  let raw: Array<Record<string, unknown>>;
  try {
    raw = JSON.parse(decodeHtml(encoded));
  } catch {
    return [];
  }
  const attributes = parseAttributeOptions(html);
  return raw.filter((item) => item.variation_is_active !== false).map((item, index) => {
    const values = Object.entries((item.attributes || {}) as Record<string, string>);
    const groups = values.map(([key]) => attributes.get(key)?.group || titleCaseSlug(key.replace(/^attribute_pa_/, '').replace(/^attribute_/, '')));
    const labels = values.map(([key, value]) => attributes.get(key)?.options.get(value) || titleCaseSlug(value));
    const price = Number(item.display_price || 0);
    const originalPrice = Number(item.display_regular_price || 0);
    const maxQty = Number(item.max_qty);
    return {
      id: `${sourceSlug}-${String(item.variation_id || index + 1)}`,
      label: labels.filter(Boolean).join(' · ') || 'Phiên bản tiêu chuẩn',
      groupName: groups.filter(Boolean).join(' · ') || 'Phân loại',
      price,
      originalPrice: originalPrice > price ? originalPrice : undefined,
      sku: String(item.sku || `${sourceSlug}-${item.variation_id || index + 1}`),
      stock: Number.isFinite(maxQty) && maxQty >= 0 && maxQty < 100000 ? maxQty : undefined,
    };
  }).filter((variant) => variant.price > 0);
}

function parseSpecs(description: string, variations: SourceVariation[]): Array<{ label: string; value: string }> {
  const specs: Array<{ label: string; value: string }> = [];
  for (const line of description.split('\n')) {
    const normalized = line.replace(/^•\s*/, '').trim();
    const match = normalized.match(/^([^:：]{2,50})\s*[:：]\s*(.{1,180})$/);
    if (!match) continue;
    const label = match[1].replace(/^[-–—]\s*/, '').trim();
    const value = match[2].trim();
    if (!label || !value || specs.some((item) => item.label.toLowerCase() === label.toLowerCase())) continue;
    specs.push({ label, value });
    if (specs.length >= 14) break;
  }
  if (variations.length) {
    const groups = [...new Set(variations.flatMap((variant) => variant.groupName.split(' · ')))];
    for (const group of groups) {
      const values = [...new Set(variations.map((variant) => {
        const groupIndex = variant.groupName.split(' · ').indexOf(group);
        return variant.label.split(' · ')[groupIndex];
      }).filter(Boolean))];
      if (values.length && !specs.some((item) => item.label.toLowerCase() === group.toLowerCase())) {
        specs.unshift({ label: group, value: values.join(', ') });
      }
    }
  }
  return specs.slice(0, 16);
}

function parseProduct(url: string, html: string): SourceProduct {
  const sourceSlug = new URL(url).pathname.split('/').filter(Boolean).pop() || '';
  const name = cleanText(html.match(/<h1\b[^>]*class=["'][^"']*product_title[^"']*["'][^>]*>([\s\S]*?)<\/h1>/i)?.[1] || sourceSlug);
  const descriptionHtml = extractBalancedDiv(html, 'id="tab-description"') || extractBalancedDiv(html, "id='tab-description'");
  const shortHtml = html.match(/<div\b[^>]*class=["'][^"']*woocommerce-product-details__short-description[^"']*["'][^>]*>([\s\S]*?)<\/div>/i)?.[1] || '';
  const description = cleanText(descriptionHtml || shortHtml);
  const variants = parseVariations(html, sourceSlug);
  return { sourceUrl: url, sourceSlug, name, description, variants, specs: parseSpecs(description, variants) };
}

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { 'user-agent': 'LK-Hoa-catalog-sync/1.0' } });
  if (!response.ok) throw new Error(`${response.status} ${url}`);
  return response.text();
}

async function mapConcurrent<T, R>(items: T[], concurrency: number, mapper: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results = new Array<R>(items.length);
  let next = 0;
  const workers = Array.from({ length: concurrency }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await mapper(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}

const sitemap = await fetchText(SITEMAP_URL);
const urls = [...sitemap.matchAll(/<loc>(https:\/\/docaulkhoa\.com\/san-pham\/[^<]+)<\/loc>/g)].map((match) => decodeHtml(match[1]));
const products = await mapConcurrent(urls, 6, async (url, index) => {
  const product = parseProduct(url, await fetchText(url));
  console.log(`[${index + 1}/${urls.length}] ${product.sourceSlug}: ${product.variants.length} biến thể, ${product.description.length} ký tự`);
  return product;
});

const output = process.argv[2] || '/tmp/docaulkhoa-source-products.json';
const generatedAt = new Date().toISOString();
if (output.endsWith('.ts')) {
  const compactProducts = Object.fromEntries(products.map((product) => [product.sourceSlug, {
    sourceUrl: product.sourceUrl,
    name: product.name,
    description: product.description,
    variants: product.variants,
    specs: product.specs,
  }]));
  const source = `// Generated by scripts/sync-docaulkhoa-source.ts from ${SITEMAP_URL}\n`
    + `// Generated at ${generatedAt}. Do not edit product facts by hand.\n`
    + `import type { ProductSpec, ProductVariant } from '../types';\n\n`
    + `export interface DocaulkhoaSourceProduct {\n  sourceUrl: string;\n  name: string;\n  description: string;\n  variants: ProductVariant[];\n  specs: ProductSpec[];\n}\n\n`
    + `export const DOCAULKHOA_SOURCE_PRODUCTS: Record<string, DocaulkhoaSourceProduct> = ${JSON.stringify(compactProducts, null, 2)};\n`;
  await writeFile(output, source, 'utf8');
} else {
  await writeFile(output, `${JSON.stringify({ generatedAt, source: SITEMAP_URL, products }, null, 2)}\n`, 'utf8');
}
console.log(`Đã lưu ${products.length} sản phẩm vào ${output}`);
