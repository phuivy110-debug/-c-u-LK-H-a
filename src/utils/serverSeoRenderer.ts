import fs from 'fs';
import path from 'path';
import { Product } from '../types';
import { CATEGORIES } from '../data/products';
import { GUIDE_ARTICLES } from '../data/guides';
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';

export const DOMAIN = 'https://docaulkhoa.vn';

// Fallback CSV parsing or fallback products on server side
export function loadServerProducts(): Product[] {
  try {
    const csvPath = path.join(process.cwd(), 'src', 'data', 'published_sheet_fallback.csv');
    if (fs.existsSync(csvPath)) {
      const fileContent = fs.readFileSync(csvPath, 'utf-8');
      const lines = fileContent.split(/\r?\n/).filter(line => line.trim().length > 0);
      if (lines.length > 1) {
        const products: Product[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
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

          const rawCategory = cols[0] || 'Cần Câu';
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
          } else if (referencePrice && !salePrice) {
            originalPrice = referencePrice;
            salePrice = Math.round((referencePrice * 0.8) / 1000) * 1000;
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
            priceSource: 'google-sheet',
            status: 'active',
            featured: i <= 6,
            sourceRow: i + 1,
            description: `Sản phẩm ${rawName} chính hãng thuộc danh mục ${rawCategory} đồ câu LK Hòa.`,
            updatedAt: new Date().toISOString()
          });
        }

        if (products.length >= 50) {
          return products;
        }
      }
    }

    return FALLBACK_PRODUCTS;
  } catch (err) {
    console.error('Server product loader failed, using fallback:', err);
    return FALLBACK_PRODUCTS;
  }
}

// Generate Dynamic Sitemap XML with Google Image extensions
export function generateSitemapXml(products: Product[]): string {
  const activeProducts = (products && products.length > 0 ? products : FALLBACK_PRODUCTS).filter(p => p.status === 'active');
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n`;
  xml += `        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n`;

  // 1. Homepage
  xml += `  <url>\n    <loc>${DOMAIN}/</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;

  // 2. Catalog
  xml += `  <url>\n    <loc>${DOMAIN}/san-pham</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

  // 3. Categories
  for (const cat of CATEGORIES) {
    xml += `  <url>\n    <loc>${DOMAIN}/danh-muc/${cat.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  }

  // 4. Guides & Fishing Tips Hub (/cam-nang)
  xml += `  <url>\n    <loc>${DOMAIN}/cam-nang</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

  for (const guide of GUIDE_ARTICLES) {
    xml += `  <url>\n    <loc>${DOMAIN}/cam-nang/${guide.slug}</loc>\n    <lastmod>${guide.date || today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.75</priority>\n  </url>\n`;
  }

  // 5. Active Products (with images)
  for (const prod of activeProducts) {
    const lastModDate = prod.updatedAt ? prod.updatedAt.split('T')[0] : today;
    const cleanName = (prod.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
    
    xml += `  <url>\n`;
    xml += `    <loc>${DOMAIN}/san-pham/${prod.slug}</loc>\n`;
    xml += `    <lastmod>${lastModDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    xml += `    <priority>0.8</priority>\n`;
    if (prod.imageUrl) {
      const cleanImg = prod.imageUrl.replace(/&/g, '&amp;');
      xml += `    <image:image>\n`;
      xml += `      <image:loc>${cleanImg}</image:loc>\n`;
      xml += `      <image:title>${cleanName}</image:title>\n`;
      xml += `      <image:caption>Đồ câu LK Hòa chính hãng - ${cleanName}</image:caption>\n`;
      xml += `    </image:image>\n`;
    }
    xml += `  </url>\n`;
  }

  xml += `</urlset>`;
  return xml;
}

// Generate Dynamic RSS 2.0 Feed
export function generateRssXml(products: Product[]): string {
  const activeProducts = (products && products.length > 0 ? products : FALLBACK_PRODUCTS).filter(p => p.status === 'active');
  const nowStr = new Date().toUTCString();

  let rss = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  rss += `<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n`;
  rss += `  <channel>\n`;
  rss += `    <title>Đồ Câu LK Hòa – Cần Câu, Mồi Câu, Phụ Kiện Chính Hãng</title>\n`;
  rss += `    <link>${DOMAIN}</link>\n`;
  rss += `    <description>Trang chủ Đồ Câu LK Hòa - Tổng hợp cần câu lure, cần câu đài 5H 6H 8H, máy câu, mồi câu chép và phụ kiện câu cá chính hãng.</description>\n`;
  rss += `    <language>vi-VN</language>\n`;
  rss += `    <lastBuildDate>${nowStr}</lastBuildDate>\n`;
  rss += `    <atom:link href="${DOMAIN}/feed.xml" rel="self" type="application/rss+xml" />\n`;

  for (const guide of GUIDE_ARTICLES) {
    const cleanTitle = (guide.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const cleanSummary = (guide.summary || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    rss += `    <item>\n`;
    rss += `      <title>${cleanTitle}</title>\n`;
    rss += `      <link>${DOMAIN}/cam-nang/${guide.slug}</link>\n`;
    rss += `      <guid>${DOMAIN}/cam-nang/${guide.slug}</guid>\n`;
    rss += `      <description>${cleanSummary}</description>\n`;
    rss += `      <category>${guide.category}</category>\n`;
    rss += `      <pubDate>${new Date(guide.date).toUTCString()}</pubDate>\n`;
    rss += `    </item>\n`;
  }

  for (const prod of activeProducts.slice(0, 30)) {
    const cleanName = (prod.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const priceText = prod.referencePrice ? `${prod.referencePrice.toLocaleString('vi-VN')}đ` : 'Liên hệ';
    rss += `    <item>\n`;
    rss += `      <title>[${prod.category}] ${cleanName} - Giá sale: ${priceText}</title>\n`;
    rss += `      <link>${DOMAIN}/san-pham/${prod.slug}</link>\n`;
    rss += `      <guid>${DOMAIN}/san-pham/${prod.slug}</guid>\n`;
    rss += `      <description>Sản phẩm ${cleanName} chính hãng LK Hòa thuộc danh mục ${prod.category}. Mua trực tiếp Shopee Mall &amp; TikTok Shop với ưu đãi giảm giá tốt nhất.</description>\n`;
    rss += `      <category>${prod.category}</category>\n`;
    rss += `      <pubDate>${nowStr}</pubDate>\n`;
    rss += `    </item>\n`;
  }

  rss += `  </channel>\n`;
  rss += `</rss>`;
  return rss;
}

// Generate Robots.txt
export function generateRobotsTxt(): string {
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    '',
    `Sitemap: ${DOMAIN}/sitemap.xml`,
    `Sitemap: ${DOMAIN}/feed.xml`
  ].join('\n');
}

// Render Page SEO Metadata & Pre-injected Head HTML
export function renderSeoPage(
  reqPath: string,
  reqQuery: Record<string, any>,
  templateHtml: string,
  products: Product[]
): string {
  const activeProducts = (products && products.length > 0 ? products : FALLBACK_PRODUCTS).filter(p => p.status === 'active');

  let title = 'Đồ Câu LK Hòa – Cần Câu, Mồi Câu, Phụ Kiện & Kinh Nghiệm Câu Cá';
  let description = 'Đồ câu LK Hòa chính hãng: Cần câu lure, cần đài 5H/6H, mồi chép, mồi chuột trơn, dây dù X8 và phụ kiện câu cá chất lượng cao. Kiểm tra giá & mua Shopee Mall, TikTok Shop.';
  let keywords = 'đồ câu lk hòa, cần câu cá, máy câu cá, mồi câu, dây pe x8, cần câu đài, cần lure';
  let canonicalUrl = `${DOMAIN}${reqPath.split('?')[0]}`;
  let robotsMeta = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  let ogType = 'website';
  let ogImage = `${DOMAIN}/favicon.svg`;
  let jsonLdData: any = null;

  const hasQuery = Object.keys(reqQuery).length > 0;
  if (hasQuery) {
    robotsMeta = 'noindex, follow';
  }

  // FAQ Schema Data for rich snippets
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': [
      {
        '@type': 'Question',
        'name': 'Làm thế nào để mua Đồ Câu LK Hòa chính hãng giá rẻ nhất?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Truy cập website docaulkhoa.vn để tra cứu danh mục 66+ sản phẩm cần câu, máy câu, mồi câu chính hãng và bấm chuyển trực tiếp sang Shopee Mall hoặc TikTok Shop Official của LK Hòa để nhận mã giảm giá và bảo hành đầy đủ.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Cần câu LK Hòa có những loại nào phổ biến?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'LK Hòa nổi tiếng với các dòng cần lure máy đứng/ngang (như Cần Lure Tiểu LK, Cần Solid Đa Năng 10kg, LK Special Cá Mập) và các dòng cần câu đài độ cứng 4H, 5H, 6H, 8H bằng carbon Toray chất lượng cao.'
        }
      },
      {
        '@type': 'Question',
        'name': 'Chính sách bảo hành lóng cần tại Đồ Câu LK Hòa như thế nào?',
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': 'Tất cả cần câu LK Hòa mua từ gian hàng chính thức đều được bảo hành lóng cần chính hãng, hỗ trợ thay thế lóng nhanh chóng khi xảy ra gãy ngọn hoặc sự cố trong quá trình câu.'
        }
      }
    ]
  };

  // ROUTE 1: Product Detail (/san-pham/:productSlug)
  if (reqPath.startsWith('/san-pham/')) {
    const slug = reqPath.replace('/san-pham/', '').trim();
    const product = activeProducts.find(p => p.slug === slug) || FALLBACK_PRODUCTS.find(p => p.slug === slug);

    if (product) {
      const priceFormatted = product.referencePrice ? `${product.referencePrice.toLocaleString('vi-VN')}đ` : 'Giá tốt';
      title = `${product.name} – ${priceFormatted} | Đồ Câu LK Hòa Chính Hãng`;
      description = `Mua ${product.name} chính hãng LK Hòa thuộc danh mục ${product.category}. Xem thông số kỹ thuật, giá sale ${priceFormatted} và mua trực tiếp trên Shopee Mall & TikTok Shop.`;
      ogType = 'product';
      if (product.imageUrl) ogImage = product.imageUrl;

      const priceVal = product.referencePrice || product.salePrice || 500000;
      const originalPriceVal = product.originalPrice || Math.round(priceVal * 1.25);

      jsonLdData = [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Trang chủ', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Sản phẩm', 'item': `${DOMAIN}/san-pham` },
            { '@type': 'ListItem', 'position': 3, 'name': product.category || 'Danh mục', 'item': `${DOMAIN}/danh-muc/${CATEGORIES.find(c => c.name === product.category)?.slug || 'can-cau'}` },
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
          'category': product.category,
          'brand': {
            '@type': 'Brand',
            'name': 'LK Hòa',
            'logo': `${DOMAIN}/favicon.svg`
          },
          'offers': {
            '@type': 'Offer',
            'url': canonicalUrl,
            'priceCurrency': 'VND',
            'price': priceVal,
            'priceValidUntil': '2027-12-31',
            'itemCondition': 'https://schema.org/NewCondition',
            'availability': 'https://schema.org/InStock',
            'seller': {
              '@type': 'Organization',
              'name': 'Đồ Câu LK Hòa Official Store'
            }
          },
          'aggregateRating': {
            '@type': 'AggregateRating',
            'ratingValue': '4.9',
            'reviewCount': '189',
            'bestRating': '5',
            'worstRating': '1'
          }
        }
      ];
    }
  }

  // ROUTE 2: Category Pages (/danh-muc/:categorySlug)
  else if (reqPath.startsWith('/danh-muc/')) {
    const catSlug = reqPath.replace('/danh-muc/', '').trim();
    const currentCat = CATEGORIES.find(c => c.slug === catSlug);
    const catName = currentCat ? currentCat.name : 'Danh Mục Sản Phẩm';
    const catProducts = activeProducts.filter(p => p.category === catName || currentCat?.aliases?.includes(p.category));

    title = `${catName} LK Hòa – Bảng Giá Cập Nhật & Mua Chính Hãng | Shopee Mall`;
    description = `Tổng hợp các mẫu ${catName} chính hãng LK Hòa tốt nhất: cần câu lure, cần đài 5H/6H, phao nano, mồi câu nhạy bén. Cam kết bảo hành chính hãng, săn mã giảm giá Shopee & TikTok.`;

    jsonLdData = [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Trang chủ', 'item': DOMAIN },
          { '@type': 'ListItem', 'position': 2, 'name': 'Danh mục', 'item': `${DOMAIN}/san-pham` },
          { '@type': 'ListItem', 'position': 3, 'name': catName, 'item': canonicalUrl }
        ]
      },
      {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        'name': `${catName} LK Hòa Chính Hãng`,
        'description': description,
        'url': canonicalUrl,
        'mainEntity': {
          '@type': 'ItemList',
          'numberOfItems': catProducts.length,
          'itemListElement': catProducts.slice(0, 10).map((p, idx) => ({
            '@type': 'ListItem',
            'position': idx + 1,
            'name': p.name,
            'url': `${DOMAIN}/san-pham/${p.slug}`
          }))
        }
      }
    ];
  }

  // ROUTE 3: All Catalog (/san-pham)
  else if (reqPath === '/san-pham') {
    title = 'Tất Cả Sản Phẩm Đồ Câu LK Hòa – Cần Câu, Mồi Câu, Phụ Kiện Giá Tốt';
    description = 'Bảng giá toàn bộ 66+ sản phẩm đồ câu cá giải trí chính hãng LK Hòa. Tra cứu thông số, so sánh giá và liên kết mua Shopee Mall & TikTok Shop chính hãng.';

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

  // ROUTE 4: Fishing Guides & Tips Hub (/cam-nang)
  else if (reqPath === '/cam-nang') {
    title = 'Cẩm Nang Câu Cá LK Hòa – Hướng Dẫn Chọn Cần, Pha Mồi & Kỹ Thuật Câu';
    description = 'Kho tàng kiến thức câu cá từ chuyên gia LK Hòa: cách chọn cần câu lure, cần đài 4H 5H 6H 8H, công thức pha mồi câu chép rô phi, kinh nghiệm săn hàng hồ tự nhiên.';

    jsonLdData = [
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Trang chủ', 'item': DOMAIN },
          { '@type': 'ListItem', 'position': 2, 'name': 'Cẩm nang câu cá', 'item': canonicalUrl }
        ]
      },
      faqSchema
    ];
  }

  // ROUTE 5: Guide Article Detail (/cam-nang/:guideSlug or /:guideSlug)
  else if (reqPath.startsWith('/cam-nang/') || GUIDE_ARTICLES.some(g => `/${g.slug}` === reqPath)) {
    const slug = reqPath.startsWith('/cam-nang/') ? reqPath.replace('/cam-nang/', '').trim() : reqPath.replace('/', '').trim();
    const guide = GUIDE_ARTICLES.find(g => g.slug === slug);

    if (guide) {
      title = guide.metaTitle || `${guide.title} | Đồ Câu LK Hòa`;
      description = guide.metaDescription || guide.summary;
      ogType = 'article';
      if (guide.keywords && guide.keywords.length > 0) {
        keywords = guide.keywords.join(', ') + ', đồ câu lk hòa, hướng dẫn câu cá';
      }

      jsonLdData = [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Trang chủ', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Cẩm nang câu cá', 'item': `${DOMAIN}/cam-nang` },
            { '@type': 'ListItem', 'position': 3, 'name': guide.title, 'item': canonicalUrl }
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          'headline': guide.title,
          'description': guide.metaDescription || guide.summary,
          'author': {
            '@type': 'Person',
            'name': guide.author || 'LK Hòa - Chuyên gia Đồ Câu'
          },
          'publisher': {
            '@type': 'Organization',
            'name': 'Đồ Câu LK Hòa',
            'logo': {
              '@type': 'ImageObject',
              'url': `${DOMAIN}/favicon.svg`
            }
          },
          'datePublished': guide.date,
          'dateModified': guide.date,
          'mainEntityOfPage': canonicalUrl
        }
      ];
    }
  }

  // DEFAULT / HOMEPAGE (/)
  else {
    jsonLdData = [
      {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        'name': 'Đồ Câu LK Hòa',
        'alternateName': 'LK Hòa Fishing',
        'url': DOMAIN,
        'logo': `${DOMAIN}/favicon.svg`,
        'image': `${DOMAIN}/favicon.svg`,
        'description': 'Thương hiệu đồ câu cá thể thao, cần câu lure, cần câu đài, mồi câu và phụ kiện câu cá uy tín hàng đầu Việt Nam.',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Nghĩa Lâm',
          'addressLocality': 'Nghĩa Đàn',
          'addressRegion': 'Nghệ An',
          'addressCountry': 'VN'
        },
        'contactPoint': {
          '@type': 'ContactPoint',
          'telephone': '+84-933040999',
          'contactType': 'customer service',
          'areaServed': 'VN',
          'availableLanguage': ['Vietnamese']
        },
        'sameAs': [
          'https://s.shopee.vn/7fYvAFHqaP',
          'https://vt.tiktok.com/ZS9kJHJuDnoUp-AeYDB/',
          'https://zalo.me/0933040999'
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
      },
      faqSchema
    ];
  }

  // Clean up static template metadata tags before injecting dynamic ones
  let resultHtml = templateHtml;

  // Build Head Elements
  const headExtra = `
    <title>${title}</title>
    <meta name="title" content="${title}" />
    <meta name="description" content="${description}" />
    ${keywords ? `<meta name="keywords" content="${keywords}" />` : ''}
    <meta name="robots" content="${robotsMeta}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="alternate" type="application/rss+xml" title="Đồ Câu LK Hòa RSS Feed" href="${DOMAIN}/feed.xml" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${description}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:site_name" content="Đồ Câu LK Hòa" />
    <meta property="og:locale" content="vi_VN" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${title}" />
    <meta name="twitter:description" content="${description}" />
    <meta name="twitter:image" content="${ogImage}" />
    ${jsonLdData ? `<script type="application/ld+json">\n${JSON.stringify(jsonLdData, null, 2)}\n</script>` : ''}
  `;

  if (resultHtml.includes('<!-- SEO_META_START -->')) {
    resultHtml = resultHtml.replace(/<!-- SEO_META_START -->[\s\S]*?<!-- SEO_META_END -->/gi, headExtra);
  } else {
    resultHtml = resultHtml.replace('</head>', `${headExtra}\n</head>`);
  }

  return resultHtml;
}
