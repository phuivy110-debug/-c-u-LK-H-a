import fs from 'fs';
import path from 'path';
import { Product } from '../types';
import { CATEGORIES } from '../data/products';
import { GUIDE_ARTICLES } from '../data/guides';

export const DOMAIN = 'https://docaulkhoa.vn';

// Fallback CSV parsing on server side
export function loadServerProducts(): Product[] {
  try {
    const csvPath = path.join(process.cwd(), 'src', 'data', 'published_sheet_fallback.csv');
    if (!fs.existsSync(csvPath)) return [];
    
    const fileContent = fs.readFileSync(csvPath, 'utf-8');
    const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
    if (lines.length <= 1) return [];

    const products: Product[] = [];
    // Process CSV lines (skip header)
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      // Simple CSV regex for quoted/unquoted values
      const cols: string[] = [];
      let current = '';
      let inQuotes = false;
      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          cols.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      cols.push(current.trim());

      const rawCategory = cols[0] || '';
      const rawName = cols[1] || '';
      const rawShopee = cols[2] || '';
      const rawImage = cols[3] || '';
      const rawSalePrice = cols[4] || '';
      const rawRefPrice = cols[5] || '';
      const rawTiktok = cols[6] || '';

      if (!rawName) continue;

      const parsePrice = (val: string) => {
        const cleaned = val.replace(/[^0-9]/g, '');
        return cleaned ? parseInt(cleaned, 10) : undefined;
      };

      const parsedSale = parsePrice(rawSalePrice);
      const parsedRef = parsePrice(rawRefPrice);

      let salePrice: number | undefined = parsedSale;
      let referencePrice: number | undefined = parsedRef;
      let originalPrice: number | undefined = undefined;

      if (salePrice && referencePrice) {
        if (referencePrice > salePrice) {
          originalPrice = referencePrice;
          referencePrice = salePrice;
        } else if (salePrice > referencePrice) {
          originalPrice = salePrice;
        }
      } else if (salePrice && !referencePrice) {
        referencePrice = salePrice;
      }

      let saleDiscountPercent: number | undefined = undefined;
      let isFlashSale = false;
      if (originalPrice && referencePrice && originalPrice > referencePrice) {
        saleDiscountPercent = Math.round(((originalPrice - referencePrice) / originalPrice) * 100);
        if (saleDiscountPercent >= 15) {
          isFlashSale = true;
        }
      }

      const generateSlug = (text: string) => {
        return text
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-');
      };

      const nameSlug = generateSlug(rawName);
      const uniqueId = `sp_${i}_${nameSlug.substring(0, 15)}`;

      products.push({
        id: uniqueId,
        slug: nameSlug,
        name: rawName,
        category: rawCategory,
        shopeeUrl: rawShopee || 'https://s.shopee.vn/7fYvAFHqaP',
        tiktokUrl: rawTiktok || 'https://vt.tiktok.com/ZS9kJHJuDnoUp-AeYDB/',
        tiktokLinkStatus: rawTiktok ? 'verified-product' : 'shared-unverified',
        imageUrl: rawImage,
        originalPrice,
        referencePrice,
        salePrice,
        saleDiscountPercent,
        isFlashSale,
        priceSource: salePrice ? 'google-sheet' : 'default',
        status: 'active',
        featured: false,
        sourceRow: i + 1,
        description: `Sản phẩm ${rawName} chính hãng thuộc danh mục ${rawCategory} đồ câu LK Hòa.`,
        updatedAt: new Date().toISOString()
      });
    }

    return products;
  } catch (err) {
    console.error('Server product loader failed:', err);
    return [];
  }
}

// Generate Dynamic Sitemap XML
export function generateSitemapXml(products: Product[]): string {
  const activeProducts = products.filter(p => p.status === 'active');
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

  // 1. Homepage
  xml += `  <url>\n    <loc>${DOMAIN}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // 2. Catalog
  xml += `  <url>\n    <loc>${DOMAIN}/san-pham</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

  // 3. Categories (6 categories)
  const categorySlugs = ['can-cau', 'may-cau', 'moi-cau', 'day-cau', 'phao-luoi', 'phu-kien'];
  for (const slug of categorySlugs) {
    xml += `  <url>\n    <loc>${DOMAIN}/danh-muc/${slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
  }

  // 4. Active Products (66 products)
  for (const prod of activeProducts) {
    const lastModDate = prod.updatedAt ? prod.updatedAt.split('T')[0] : today;
    xml += `  <url>\n    <loc>${DOMAIN}/san-pham/${prod.slug}</loc>\n    <lastmod>${lastModDate}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

// Generate Robots.txt
export function generateRobotsTxt(): string {
  return "User-agent: *\nAllow: /\n\nSitemap: " + DOMAIN + "/sitemap.xml\n";
}

// Render Page SEO Metadata & Pre-injected Head HTML
export function renderSeoPage(
  reqPath: string,
  reqQuery: Record<string, any>,
  templateHtml: string,
  products: Product[]
): string {
  const activeProducts = products.filter(p => p.status === 'active');

  let title = 'Đồ Câu LK Hòa – Cần Câu, Mồi Câu, Phụ Kiện & Kinh Nghiệm Câu Cá';
  let description = 'Đồ câu LK Hòa chính hãng: Cần câu lure, cần đài 5H/6H, mồi chép, mồi chuột trơn, dây dù X8 và phụ kiện câu cá chất lượng cao. Kiểm tra giá & mua Shopee Mall, TikTok Shop.';
  let canonicalUrl = `${DOMAIN}${reqPath.split('?')[0]}`;
  let robotsMeta = 'index, follow';
  let ogType = 'website';
  let ogImage = `${DOMAIN}/og-image.jpg`;
  let jsonLdData: any = null;

  const hasQuery = Object.keys(reqQuery).length > 0;
  if (hasQuery) {
    robotsMeta = 'noindex, follow';
  }

  // ROUTE 1: Product Detail (/san-pham/:productSlug)
  if (reqPath.startsWith('/san-pham/')) {
    const slug = reqPath.replace('/san-pham/', '').trim();
    const product = products.find(p => p.slug === slug);

    if (product && product.status === 'active') {
      title = `${product.name} – Giá Tham Khảo & Link Mua Shopee | LK Hòa`;
      description = `${product.name} chính hãng LK Hòa thuộc danh mục ${product.category}. Xem thông số kỹ thuật, giá tham khảo và liên kết mua trực tiếp trên Shopee Mall & TikTok Shop.`;
      ogType = 'og:product';
      if (product.imageUrl) ogImage = product.imageUrl;

      // JSON-LD: BreadcrumbList + Product (No Offer schema per affiliate policy)
      jsonLdData = [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Trang chủ', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Sản phẩm', 'item': `${DOMAIN}/san-pham` },
            { '@type': 'ListItem', 'position': 3, 'name': product.category || 'Danh mục', 'item': `${DOMAIN}/danh-muc/can-cau` },
            { '@type': 'ListItem', 'position': 4, 'name': product.name, 'item': canonicalUrl }
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          'name': product.name,
          'image': product.imageUrl ? [product.imageUrl] : [ogImage],
          'description': product.description || description,
          'sku': product.id,
          'brand': { '@type': 'Brand', 'name': 'LK Hòa' }
        }
      ];
    }
  }

  // ROUTE 2: Category Pages (/danh-muc/:categorySlug)
  else if (reqPath.startsWith('/danh-muc/')) {
    const catSlug = reqPath.replace('/danh-muc/', '').trim();
    const currentCat = CATEGORIES.find(c => c.slug === catSlug);
    const catName = currentCat ? currentCat.name : 'Danh Mục Sản Phẩm';

    title = `${catName} LK Hòa – Chính Hãng Giá Tốt | Mua Shopee Mall`;
    description = `Tổng hợp sản phẩm ${catName} chính hãng LK Hòa. Xem thông số, giá tham khảo và liên kết mua trực tiếp trên Shopee Mall & TikTok Shop chính hãng.`;

    jsonLdData = [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Trang chủ', 'item': DOMAIN },
          { '@type': 'ListItem', 'position': 2, 'name': 'Sản phẩm', 'item': `${DOMAIN}/san-pham` },
          { '@type': 'ListItem', 'position': 3, 'name': catName, 'item': canonicalUrl }
        ]
      }
    ];
  }

  // ROUTE 3: All Catalog (/san-pham)
  else if (reqPath === '/san-pham') {
    title = 'Tất Cả Sản Phẩm Đồ Câu LK Hòa – Cần Câu, Mồi Câu, Phụ Kiện';
    description = 'Toàn bộ 66 sản phẩm đồ câu cá giải trí chính hãng LK Hòa. Tra cứu thông số, so sánh giá và liên kết mua Shopee Mall & TikTok Shop.';

    jsonLdData = [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Trang chủ', 'item': DOMAIN },
          { '@type': 'ListItem', 'position': 2, 'name': 'Tất cả sản phẩm', 'item': canonicalUrl }
        ]
      }
    ];
  }

  // ROUTE 4: Unapproved Guides (/cam-nang & /cam-nang/:guideSlug) -> Set noindex
  else if (reqPath.startsWith('/cam-nang')) {
    title = 'Cẩm Nang Câu Cá LK Hòa';
    description = 'Kinh nghiệm câu cá LK Hòa.';
    robotsMeta = 'noindex, follow';
  }

  // DEFAULT / HOMEPAGE (/)
  else {
    jsonLdData = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Đồ Câu LK Hòa',
        'url': DOMAIN,
        'logo': `${DOMAIN}/logo.png`,
        'contactPoint': {
          '@type': 'ContactPoint',
          'telephone': '+84-933040999',
          'contactType': 'customer service',
          'areaServed': 'VN',
          'availableLanguage': 'Vietnamese'
        },
        'sameAs': [
          'https://s.shopee.vn/7fYvAFHqaP',
          'https://vt.tiktok.com/ZS9kJHJuDnoUp-AeYDB/'
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'WebSite',
        'name': 'Đồ Câu LK Hòa',
        'url': DOMAIN,
        'potentialAction': {
          '@type': 'SearchAction',
          'target': `${DOMAIN}/san-pham?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }
    ];
  }

  // Clean up static template metadata tags before injecting dynamic ones
  let resultHtml = templateHtml;

  // Build Head Elements
  const headExtra = `
    <title>${title}</title>
    <meta name="title" content="${title}" />
    <meta name="description" content="${description}" />
    <meta name="robots" content="${robotsMeta}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:site_name" content="Đồ Câu LK Hòa" />
    ${jsonLdData ? `<script type="application/ld+json">\n${JSON.stringify(jsonLdData, null, 2)}\n</script>` : ''}
  `;

  if (resultHtml.includes('<!-- SEO_META_START -->')) {
    resultHtml = resultHtml.replace(/<!-- SEO_META_START -->[\s\S]*?<!-- SEO_META_END -->/gi, headExtra);
  } else {
    resultHtml = resultHtml.replace('</head>', `${headExtra}\n</head>`);
  }

  return resultHtml;
}
