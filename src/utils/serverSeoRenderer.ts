import fs from 'fs';
import { FAQS } from '../data/faqs';
import path from 'path';
import { Product } from '../types';
import { CATEGORIES } from '../data/products';
import { GUIDE_ARTICLES } from '../data/guides';
import { FALLBACK_PRODUCTS } from '../data/fallbackProducts';
import { sanitizeGuideMarkdown } from './guideContent';
import { getProductDescription } from './productDescription';
import { getMecuabinShopeeUrl } from './shopeeAffiliateLinks';
import { mergeWithLocalAdditions } from './mergeLocalProducts';
import { productDisplayName } from './catalog';

import { DOMAIN } from './site';
export { DOMAIN } from './site';

// Fallback CSV parsing or fallback products on server side
export function loadServerProducts(): Product[] {
  try {
    const candidatePaths = [
      path.join(process.cwd(), 'src', 'data', 'published_sheet_fallback.csv'),
      path.join(process.cwd(), 'api', '_published_sheet_fallback.csv'),
      ...(typeof __dirname !== 'undefined'
        ? [path.join(__dirname, '_published_sheet_fallback.csv')]
        : []),
    ];
    const csvPath = candidatePaths.find((p) => fs.existsSync(p));
    if (csvPath) {
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
            shopeeUrl: getMecuabinShopeeUrl(rawName, rawShopee || undefined),
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
          return mergeWithLocalAdditions(products);
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
  for (const cat of CATEGORIES.filter(category => category.slug !== 'tat-ca')) {
    xml += `  <url>\n    <loc>${DOMAIN}/danh-muc/${cat.slug}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>daily</changefreq>\n    <priority>0.85</priority>\n  </url>\n`;
  }

  // 4. Guides & Fishing Tips Hub (/cam-nang)
  xml += `  <url>\n    <loc>${DOMAIN}/cam-nang</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;

  xml += `  <url>\n    <loc>${DOMAIN}/gioi-thieu-phuong-phap-danh-gia</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.6</priority>\n  </url>\n`;
  xml += `  <url>\n    <loc>${DOMAIN}/quyen-rieng-tu</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>yearly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`;
  xml += `  <url>\n    <loc>${DOMAIN}/chinh-sach-bao-hanh-doi-tra</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
  xml += `  <url>\n    <loc>${DOMAIN}/chinh-sach-van-chuyen</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;
  xml += `  <url>\n    <loc>${DOMAIN}/chinh-sach-thanh-toan</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.5</priority>\n  </url>\n`;

  for (const guide of GUIDE_ARTICLES) {
    xml += `  <url>\n    <loc>${DOMAIN}/cam-nang/${guide.slug}</loc>\n    <lastmod>${guide.date || today}</lastmod>\n    <changefreq>monthly</changefreq>\n    <priority>0.75</priority>\n  </url>\n`;
  }

  // 5. Active Products (with images)
  const emittedProductSlugs = new Set<string>();
  for (const prod of activeProducts) {
    if (emittedProductSlugs.has(prod.slug)) continue;
    emittedProductSlugs.add(prod.slug);
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

  const escapeXml = (value: unknown) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

  for (const guide of GUIDE_ARTICLES) {
    const cleanTitle = (guide.title || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const cleanSummary = (guide.summary || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    rss += `    <item>\n`;
    rss += `      <title>${cleanTitle}</title>\n`;
    rss += `      <link>${DOMAIN}/cam-nang/${guide.slug}</link>\n`;
    rss += `      <guid>${DOMAIN}/cam-nang/${guide.slug}</guid>\n`;
    rss += `      <description>${cleanSummary}</description>\n`;
    rss += `      <category>${escapeXml(guide.category)}</category>\n`;
    rss += `      <pubDate>${new Date(guide.date).toUTCString()}</pubDate>\n`;
    rss += `    </item>\n`;
  }

  for (const prod of activeProducts.slice(0, 30)) {
    const cleanName = (prod.name || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    const priceText = prod.referencePrice ? `${prod.referencePrice.toLocaleString('vi-VN')}đ` : 'Liên hệ';
    rss += `    <item>\n`;
    rss += `      <title>[${escapeXml(prod.category)}] ${cleanName} - Giá bán: ${priceText}</title>\n`;
    rss += `      <link>${DOMAIN}/san-pham/${prod.slug}</link>\n`;
    rss += `      <guid>${DOMAIN}/san-pham/${prod.slug}</guid>\n`;
    rss += `      <description>Sản phẩm ${cleanName} chính hãng LK Hòa thuộc danh mục ${escapeXml(prod.category)}. Đặt trực tiếp trên docaulkhoa.vn bằng COD đồng kiểm hoặc VietQR.</description>\n`;
    rss += `      <category>${escapeXml(prod.category)}</category>\n`;
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
    'Allow: /api/agent/',
    'Disallow: /api/',
    '',
    `Sitemap: ${DOMAIN}/sitemap.xml`,
    `# RSS: ${DOMAIN}/feed.xml`,
    `# AI & B2A Agent Discovery: ${DOMAIN}/llms.txt`,
    `# B2A Agent Manifest: ${DOMAIN}/.well-known/agent.json`
  ].join('\n');
}

// Render Page SEO Metadata & Pre-injected Head HTML
export function renderSeoPage(
  reqPath: string,
  reqQuery: Record<string, any>,
  templateHtml: string,
  products: Product[],
  prerenderedBody?: string,
): string {
  const activeProducts = (products && products.length > 0 ? products : FALLBACK_PRODUCTS).filter(p => p.status === 'active');

  let title = 'Đồ Câu LK Hòa – Cần Câu, Mồi Câu, Phụ Kiện & Kinh Nghiệm Câu Cá';
  let description = 'Đồ câu LK Hòa chính hãng: cần câu lure, cần đài, máy câu, mồi câu, dây câu và phụ kiện. Đặt trực tiếp COD đồng kiểm hoặc VietQR, giao hàng toàn quốc.';
  let keywords = 'đồ câu lk hòa, cần câu cá, máy câu cá, mồi câu, dây pe x8, cần câu đài, cần lure';
  let canonicalUrl = `${DOMAIN}${reqPath.split('?')[0]}`;
  let robotsMeta = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';
  let ogType = 'website';
  let ogImage = `${DOMAIN}/favicon.svg`;
  let jsonLdData: any = null;
  let seoBodyHtml = '';

  const escapeHtml = (value: unknown) => String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

  const hasQuery = Object.keys(reqQuery).length > 0;
  if (hasQuery) {
    robotsMeta = 'noindex, follow';
  }

  // Use the same factual answers in visible HTML and structured data.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  };

  // ROUTE 1: Product Detail (/san-pham/:productSlug)
  if (reqPath.startsWith('/san-pham/')) {
    const slug = reqPath.replace('/san-pham/', '').trim();
    const product = activeProducts.find(p => p.slug === slug) || FALLBACK_PRODUCTS.find(p => p.slug === slug);

    if (product) {
      const displayName = productDisplayName(product);
      const priceFormatted = product.referencePrice ? `${product.referencePrice.toLocaleString('vi-VN')}đ` : 'Giá tốt';
      title = `${displayName} – ${priceFormatted} | Đồ Câu LK Hòa Chính Hãng`;
      description = `Mua ${displayName} chính hãng tại Đồ Câu LK Hòa (docaulkhoa.vn): giá ${priceFormatted}, giao hàng toàn quốc, đóng ống PVC bảo vệ ngọn cần, hỗ trợ COD đồng kiểm & VietQR.`;
      ogType = 'product';
      if (product.imageUrl) ogImage = product.imageUrl;
      const productDescription = getProductDescription(product);
      const isFreeShippingItem =
        (product.referencePrice || 0) >= 300000 ||
        (product.category || '').toLowerCase().includes('cần') ||
        /\bcần\b/i.test(product.name || '');
      seoBodyHtml = `<main><article><h1>${escapeHtml(displayName)}</h1><p>${escapeHtml(productDescription).replace(/\n\n/g, '</p><p>')}</p><p>Danh mục: ${escapeHtml(product.category)}. Giá bán: ${escapeHtml(priceFormatted)}. Hỗ trợ đặt trực tiếp COD đồng kiểm / VietQR hoặc qua Shopee &amp; TikTok Shop.</p><p><strong>Chính sách giao nhận &amp; bảo hành:</strong> ${isFreeShippingItem ? 'Miễn phí vận chuyển toàn quốc' : 'Miễn phí vận chuyển đơn từ 300.000đ (đồng giá 30.000đ đơn dưới 300.000đ)'}, đổi mới 1-1 trong 7 ngày.</p><p><a href="${DOMAIN}/danh-muc/${CATEGORIES.find(c => c.name === product.category)?.slug || 'can-cau'}">Xem thêm sản phẩm ${escapeHtml(product.category)} LK Hòa</a></p></article></main>`;

      jsonLdData = [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Trang chủ', 'item': DOMAIN },
            { '@type': 'ListItem', 'position': 2, 'name': 'Sản phẩm', 'item': `${DOMAIN}/san-pham` },
            { '@type': 'ListItem', 'position': 3, 'name': product.category || 'Danh mục', 'item': `${DOMAIN}/danh-muc/${CATEGORIES.find(c => c.name === product.category)?.slug || 'can-cau'}` },
            { '@type': 'ListItem', 'position': 4, 'name': displayName, 'item': canonicalUrl }
          ]
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Product',
          'name': displayName,
          'image': product.imageUrl ? [product.imageUrl] : [ogImage],
          'description': productDescription,
          ...(product.sku ? { 'sku': product.sku } : {}),
          'category': product.category,
          ...(product.referencePrice ? {
            'offers': {
              '@type': 'Offer',
              'priceCurrency': 'VND',
              'price': product.referencePrice,
              'itemCondition': 'https://schema.org/NewCondition',
              'availability': 'https://schema.org/InStock',
              'url': canonicalUrl,
              'seller': {
                '@type': 'Organization',
                'name': 'Đồ Câu LK Hòa',
                'url': DOMAIN
              },
              'shippingDetails': {
                '@type': 'OfferShippingDetails',
                'shippingRate': {
                  '@type': 'MonetaryAmount',
                  'value': isFreeShippingItem ? 0 : 30000,
                  'currency': 'VND'
                },
                'shippingDestination': {
                  '@type': 'DefinedRegion',
                  'addressCountry': 'VN'
                },
                'deliveryTime': {
                  '@type': 'ShippingDeliveryTime',
                  'handlingTime': { '@type': 'QuantitativeValue', 'minValue': 0, 'maxValue': 1, 'unitCode': 'DAY' },
                  'transitTime': { '@type': 'QuantitativeValue', 'minValue': 1, 'maxValue': 4, 'unitCode': 'DAY' }
                }
              },
              'hasMerchantReturnPolicy': {
                '@type': 'MerchantReturnPolicy',
                'applicableCountry': 'VN',
                'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
                'merchantReturnDays': 7,
                'returnMethod': 'https://schema.org/ReturnByMail'
              }
            }
          } : {}),
          'url': canonicalUrl
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

    title = `${catName} LK Hòa – Bảng Giá & Đặt Hàng Chính Hãng`;
    description = `Danh mục ${catName} chính hãng LK Hòa, giá công khai và hỗ trợ đặt trực tiếp COD đồng kiểm hoặc VietQR. Giao hàng toàn quốc và có lựa chọn mua qua sàn.`;
    seoBodyHtml = `<main><h1>${escapeHtml(catName)} LK Hòa</h1><p>${escapeHtml(description)}</p><ul>${catProducts.slice(0, 12).map(p => `<li><a href="${DOMAIN}/san-pham/${escapeHtml(p.slug)}">${escapeHtml(p.name)}</a></li>`).join('')}</ul></main>`;

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
    description = 'Bảng giá sản phẩm đồ câu LK Hòa chính hãng. Tra cứu thông tin, chọn phân loại và đặt trực tiếp COD đồng kiểm hoặc VietQR trên docaulkhoa.vn.';
    seoBodyHtml = `<main><h1>Tất cả sản phẩm Đồ Câu LK Hòa</h1><p>${escapeHtml(description)}</p><ul>${activeProducts.slice(0, 20).map(p => `<li><a href="${DOMAIN}/san-pham/${escapeHtml(p.slug)}">${escapeHtml(p.name)}</a></li>`).join('')}</ul></main>`;

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

  // ROUTE 4: About, author and editorial method
  else if (reqPath === '/gioi-thieu-phuong-phap-danh-gia') {
    title = 'Giới thiệu LK Hòa & phương pháp đánh giá | docaulkhoa.vn';
    description = 'Tìm hiểu người chịu trách nhiệm nội dung, nguyên tắc kiểm chứng, phương pháp review sản phẩm và chính sách affiliate của docaulkhoa.vn.';
    keywords = 'LK Hòa, giới thiệu LK Hòa, phương pháp đánh giá đồ câu, chính sách affiliate';
    seoBodyHtml = `<main><article><h1>Giới thiệu LK Hòa và phương pháp đánh giá</h1><p><strong>Người viết và chịu trách nhiệm nội dung: LK Hòa.</strong></p><p>docaulkhoa.vn tập trung vào đồ câu, hướng dẫn chọn dụng cụ và bài so sánh. Tên miền chính thức của website này là docaulkhoa.vn.</p><h2>Phương pháp review</h2><p>Nội dung đối chiếu tên sản phẩm, biến thể, ảnh và liên kết trong danh mục. Thông số công bố được tách khỏi kết quả thử nghiệm thực tế; website chỉ gọi là đã thử khi có ảnh, video, điều kiện thử hoặc ghi chép đủ để kiểm tra lại.</p><h2>Minh bạch affiliate</h2><p>Website có thể nhận hoa hồng từ liên kết mua hàng nhưng mức hoa hồng không quyết định thứ tự khuyến nghị.</p><p><a href="${DOMAIN}/cam-nang">Đọc cẩm nang và bài so sánh</a> · <a href="${DOMAIN}/quyen-rieng-tu">Chính sách quyền riêng tư</a></p></article></main>`;
    jsonLdData = [
      {
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        'name': 'Giới thiệu LK Hòa và phương pháp đánh giá',
        'description': description,
        'url': canonicalUrl,
        'mainEntity': {
          '@type': 'Person',
          'name': 'LK Hòa',
          'url': canonicalUrl,
          'worksFor': {
            '@type': 'Organization',
            'name': 'Đồ Câu LK Hòa',
            'url': DOMAIN
          }
        }
      },
      {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Trang chủ', 'item': DOMAIN },
          { '@type': 'ListItem', 'position': 2, 'name': 'Giới thiệu và phương pháp đánh giá', 'item': canonicalUrl }
        ]
      }
    ];
  }

  // ROUTE 5: Privacy policy
  else if (reqPath === '/quyen-rieng-tu') {
    title = 'Chính sách quyền riêng tư | Đồ Câu LK Hòa';
    description = 'Chính sách quyền riêng tư và bảo vệ thông tin khách hàng đặt hàng trực tiếp COD/VietQR tại docaulkhoa.vn.';
    keywords = 'chính sách quyền riêng tư docaulkhoa.vn, bảo mật thông tin đơn hàng, Google Analytics 4';
    seoBodyHtml = `<main><article><h1>Chính sách quyền riêng tư</h1><p>docaulkhoa.vn thu thập họ tên, số điện thoại và địa chỉ giao hàng chỉ nhằm xác nhận đơn hàng, đóng gói vận chuyển và bảo hành ngọn cần chính hãng cho khách hàng.</p><p>Website không lưu trữ số thẻ tín dụng hay mật khẩu ngân hàng; giao dịch thực hiện qua COD đồng kiểm hoặc chuyển khoản VietQR. Khi người dùng chọn chuyển sang Shopee hoặc TikTok Shop, chính sách của sàn tương ứng được áp dụng.</p><h2>Cookie và liên kết ngoài</h2><p>Người dùng có thể quản lý cookie hoặc giỏ hàng trong trình duyệt. Liên hệ về dữ liệu: <a href="tel:0933040999">0933 040 999</a>.</p></article></main>`;
    jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Chính sách quyền riêng tư',
      'description': description,
      'url': canonicalUrl,
      'isPartOf': {
        '@type': 'WebSite',
        'name': 'Đồ Câu LK Hòa',
        'url': DOMAIN
      }
    };
  }

  // ROUTE 5b: Warranty & Return Policy
  else if (reqPath === '/chinh-sach-bao-hanh-doi-tra') {
    title = 'Chính Sách Bảo Hành & Đổi Trả 1-1 | Đồ Câu LK Hòa';
    description = 'Chính sách bảo hành ngọn cần, đổi mới 1-1 trong 7 ngày và hướng dẫn kiểm tra hàng khi nhận tại Đồ Câu LK Hòa.';
    keywords = 'bảo hành đồ câu lk hòa, đổi trả cần câu, thay lóng ngọn cần';
    seoBodyHtml = `<main><article><h1>Chính sách bảo hành &amp; đổi trả Đồ Câu LK Hòa</h1><p>Đổi mới 1-1 trong 7 ngày nếu sản phẩm lỗi từ nhà sản xuất hoặc hư hỏng trong quá trình vận chuyển. Hỗ trợ thay thế lóng cần, ngọn cần chính hãng trọn đời cho khách hàng mua tại docaulkhoa.vn.</p></article></main>`;
    jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Chính sách bảo hành & đổi trả',
      'description': description,
      'url': canonicalUrl,
      'isPartOf': { '@type': 'WebSite', 'name': 'Đồ Câu LK Hòa', 'url': DOMAIN }
    };
  }

  // ROUTE 5c: Shipping & Delivery Policy
  else if (reqPath === '/chinh-sach-van-chuyen') {
    title = 'Chính Sách Vận Chuyển & Đồng Kiểm | Đồ Câu LK Hòa';
    description = 'Miễn phí vận chuyển đơn từ 300.000đ hoặc đơn có cần câu. Đóng gói ống nhựa PVC cứng chống gãy đọt và đồng kiểm toàn quốc.';
    keywords = 'chính sách vận chuyển đồ câu lk hòa, freeship 300k, đóng ống nhựa pvc';
    seoBodyHtml = `<main><article><h1>Chính sách vận chuyển &amp; giao nhận Đồ Câu LK Hòa</h1><p>Miễn phí vận chuyển toàn quốc cho đơn hàng từ 300.000đ hoặc đơn có chứa cần câu. Đồng giá 30.000đ cho đơn dưới 300.000đ. Cần câu được đóng gói trong ống nhựa PVC cứng chống va đập và cho phép đồng kiểm khi nhận hàng.</p></article></main>`;
    jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Chính sách vận chuyển & giao nhận',
      'description': description,
      'url': canonicalUrl,
      'isPartOf': { '@type': 'WebSite', 'name': 'Đồ Câu LK Hòa', 'url': DOMAIN }
    };
  }

  // ROUTE 5d: Payment Policy
  else if (reqPath === '/chinh-sach-thanh-toan') {
    title = 'Chính Sách Thanh Toán COD & VietQR | Đồ Câu LK Hòa';
    description = 'Hỗ trợ thanh toán khi nhận hàng (COD đồng kiểm) và chuyển khoản ngân hàng qua mã QR VietQR chính chủ Đồ Câu LK Hòa.';
    keywords = 'chính sách thanh toán lk hòa, cod đồng kiểm, chuyển khoản vietqr';
    seoBodyHtml = `<main><article><h1>Chính sách thanh toán Đồ Câu LK Hòa</h1><p>Khách hàng có thể lựa chọn thanh toán khi nhận hàng (COD) sau khi đồng kiểm hoặc chuyển khoản nhanh qua mã VietQR kèm nội dung mã đơn hàng.</p></article></main>`;
    jsonLdData = {
      '@context': 'https://schema.org',
      '@type': 'WebPage',
      'name': 'Chính sách thanh toán',
      'description': description,
      'url': canonicalUrl,
      'isPartOf': { '@type': 'WebSite', 'name': 'Đồ Câu LK Hòa', 'url': DOMAIN }
    };
  }

  // ROUTE 6: Fishing Guides & Tips Hub (/cam-nang)
  else if (reqPath === '/cam-nang') {
    title = 'Cẩm Nang Câu Cá LK Hòa – Hướng Dẫn Chọn Cần, Pha Mồi & Kỹ Thuật Câu';
    description = 'Kho tàng kiến thức câu cá từ chuyên gia LK Hòa: cách chọn cần câu lure, cần đài 4H 5H 6H 8H, công thức pha mồi câu chép rô phi, kinh nghiệm săn hàng hồ tự nhiên.';
    seoBodyHtml = `<main><h1>Cẩm nang câu cá và review đồ câu LK Hòa</h1><p>${escapeHtml(description)}</p><ul>${GUIDE_ARTICLES.slice(0, 24).map(g => `<li><a href="${DOMAIN}/cam-nang/${escapeHtml(g.slug)}">${escapeHtml(g.title)}</a></li>`).join('')}</ul></main>`;

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

      const imgMatch = guide.contentMarkdown.match(/!\[.*?\]\((.*?)\)/);
      if (imgMatch && imgMatch[1]) {
        const rawImg = imgMatch[1];
        ogImage = rawImg.startsWith('http') ? rawImg : `${DOMAIN}${rawImg.startsWith('/') ? '' : '/'}${rawImg}`;
      }

      if (guide.keywords && guide.keywords.length > 0) {
        keywords = guide.keywords.join(', ') + ', đồ câu lk hòa, hướng dẫn câu cá';
      }
      const cleanGuideMarkdown = sanitizeGuideMarkdown(guide.contentMarkdown);
      const readableExcerpt = cleanGuideMarkdown
        .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
        .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
        .replace(/[#>*_`|~-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, 1800);
      seoBodyHtml = `<main><article><h1>${escapeHtml(guide.title)}</h1><p>${escapeHtml(guide.summary)}</p><p>Tác giả: ${escapeHtml(guide.author)} · Cập nhật: ${escapeHtml(guide.date)} · ${escapeHtml(guide.readTime)}</p><p>${escapeHtml(readableExcerpt)}</p><p><strong>Công bố affiliate:</strong> Bài có thể chứa liên kết tiếp thị. Nội dung đánh giá độc lập với mức hoa hồng.</p><p><a href="${DOMAIN}/cam-nang">Xem thêm cẩm nang và bài so sánh</a></p></article></main>`;

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
          'image': [ogImage],
          'description': guide.metaDescription || guide.summary,
          'author': {
            '@type': 'Person',
            'name': guide.author || 'LK Hòa',
            'url': `${DOMAIN}/gioi-thieu-phuong-phap-danh-gia`
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
    seoBodyHtml = `<main><h1>Đồ Câu LK Hòa – Cần câu, mồi câu và phụ kiện</h1><p>${escapeHtml(description)}</p><p><a href="${DOMAIN}/san-pham">Xem danh mục sản phẩm</a> · <a href="${DOMAIN}/cam-nang">Đọc cẩm nang và bài review</a></p></main>`;
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
          'https://zalo.me/3835730533921276555',
          'https://maps.app.goo.gl/Q6qLVcFnBdv7LiZu6'
        ],
        'hasMap': 'https://maps.app.goo.gl/Q6qLVcFnBdv7LiZu6',
        'geo': {
          '@type': 'GeoCoordinates',
          'latitude': 19.4154285,
          'longitude': 105.4515155
        }
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
    <title>${escapeHtml(title)}</title>
    <meta name="title" content="${escapeHtml(title)}" />
    <meta name="description" content="${escapeHtml(description)}" />
    ${keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : ''}
    <meta name="robots" content="${robotsMeta}" />
    <link rel="canonical" href="${canonicalUrl}" />
    <link rel="alternate" type="application/rss+xml" title="Đồ Câu LK Hòa RSS Feed" href="${DOMAIN}/feed.xml" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:type" content="${ogType}" />
    <meta property="og:url" content="${canonicalUrl}" />
    <meta property="og:image" content="${ogImage}" />
    <meta property="og:site_name" content="Đồ Câu LK Hòa" />
    <meta property="og:locale" content="vi_VN" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${ogImage}" />
    ${jsonLdData ? `<script type="application/ld+json">\n${JSON.stringify(jsonLdData, null, 2).replace(/</g, '\\u003c')}\n</script>` : ''}
  `;

  if (resultHtml.includes('<!-- SEO_META_START -->')) {
    resultHtml = resultHtml.replace(/<!-- SEO_META_START -->[\s\S]*?<!-- SEO_META_END -->/gi, () => headExtra);
  } else {
    resultHtml = resultHtml.replace('</head>', `${headExtra}\n</head>`);
  }

  if (prerenderedBody !== undefined) seoBodyHtml = prerenderedBody;
  if (seoBodyHtml) {
    resultHtml = resultHtml.replace('<div id="root"></div>', () => `<div id="root">${seoBodyHtml}</div>`);
  }

  return resultHtml;
}
