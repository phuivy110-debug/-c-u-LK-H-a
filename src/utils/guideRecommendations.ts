import type { GuideArticle } from '../data/guides';
import type { Product } from '../types';
import { GUIDE_PRODUCT_SLUGS } from '../data/guideRecommendations';
import { normalizeSearch } from './catalog';

export function recommendedProducts(article: GuideArticle, products: Product[]): Product[] {
  const explicit = [...(article.relatedProducts || []), ...(GUIDE_PRODUCT_SLUGS[article.slug] || [])];
  const links = [...article.contentMarkdown.matchAll(/\]\(([^\s)]+)(?:\s[^)]*)?\)/g)].map(match => match[1]);
  const ordered = [...explicit.flatMap(key => products.filter(p => p.slug === key || p.id === key)),
    ...products.filter(p => links.includes(`/san-pham/${p.slug}`) || Boolean(p.shopeeUrl && links.includes(p.shopeeUrl)))];
  const seen = new Set<string>();
  return ordered.filter(p => {
    if (p.status !== 'active' || !p.shopeeUrl || seen.has(p.slug)) return false;
    seen.add(p.slug);
    return true;
  }).slice(0, 3);
}

export function relatedGuides(article: GuideArticle, guides: GuideArticle[], products: Product[]): GuideArticle[] {
  const slugs = new Set(recommendedProducts(article, products).map(p => p.slug));
  const keywords = new Set((article.keywords || []).map(normalizeSearch));
  return guides.filter(item => item.slug !== article.slug).map(item => ({ item,
    score: recommendedProducts(item, products).filter(p => slugs.has(p.slug)).length * 3
      + (item.keywords || []).filter(word => keywords.has(normalizeSearch(word)) && !['lk hoa', 'do cau lk hoa'].includes(normalizeSearch(word))).length,
  })).filter(entry => entry.score > 0).sort((a, b) => b.score - a.score).slice(0, 3).map(entry => entry.item);
}

export function guideSections(markdown: string) {
  let fenced = false;
  return markdown.split('\n').flatMap((line, index) => {
    if (/^\s*(```|~~~)/.test(line)) { fenced = !fenced; return []; }
    const match = !fenced && line.match(/^##\s+(.+?)\s*#*$/);
    return match ? [{ id: `muc-${index + 1}`, title: match[1].replace(/[*_`]/g, '') }] : [];
  });
}
