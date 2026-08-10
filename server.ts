import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '2mb' }));

  // Initialize Gemini AI Client lazily/safely
  const getAiClient = () => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return null;
    return new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  };

  // Extract product image directly from Shopee affiliate link
  app.post('/api/extract-shopee-image', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL không hợp lệ' });
      }

      const targetUrl = url.trim();

      // Step 1: Direct image check
      if (
        targetUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ||
        ((targetUrl.includes('susercontent.com') || targetUrl.includes('cf.shopee.vn')) && targetUrl.includes('/file/'))
      ) {
        return res.json({ success: true, imageUrl: targetUrl });
      }

      let currentUrl = targetUrl;
      let redirectCount = 0;
      const visitedUrls: string[] = [targetUrl];
      let htmlContent = '';

      // Step 2: Trace redirects manually (up to 8 steps)
      while (redirectCount < 8) {
        const response = await fetch(currentUrl, {
          redirect: 'manual',
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            Accept:
              'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
          },
        });

        const location = response.headers.get('location');
        if (response.status >= 300 && response.status < 400 && location) {
          currentUrl = location.startsWith('http') ? location : new URL(location, currentUrl).href;
          visitedUrls.push(currentUrl);
          redirectCount++;
        } else {
          htmlContent = await response.text();
          // Check for client JS redirect in small HTML responses
          if (htmlContent.length < 5000) {
            const jsLocMatch =
              htmlContent.match(/location\.href\s*=\s*["']([^"']+)["']/i) ||
              htmlContent.match(/window\.location\s*=\s*["']([^"']+)["']/i) ||
              htmlContent.match(/meta[^>]*http-equiv=["']refresh["'][^>]*content=["'][^"']*url=([^"']+)["']/i);
            if (jsLocMatch && jsLocMatch[1]) {
              const nextUrl = jsLocMatch[1].startsWith('http')
                ? jsLocMatch[1]
                : new URL(jsLocMatch[1], currentUrl).href;
              if (!visitedUrls.includes(nextUrl)) {
                currentUrl = nextUrl;
                visitedUrls.push(currentUrl);
                redirectCount++;
                continue;
              }
            }
          }
          break;
        }
      }

      // Step 3: Extract Item ID & Shop ID from visited URLs
      let shopid: string | null = null;
      let itemid: string | null = null;

      for (const u of visitedUrls) {
        const itemMatch1 = u.match(/i\.(\d+)\.(\d+)/);
        const itemMatch2 = u.match(/\/product\/(\d+)\/(\d+)/);
        const itemMatch3 = u.match(/itemid=(\d+)/) && u.match(/shopid=(\d+)/);

        if (itemMatch1) {
          shopid = itemMatch1[1];
          itemid = itemMatch1[2];
          break;
        } else if (itemMatch2) {
          shopid = itemMatch2[1];
          itemid = itemMatch2[2];
          break;
        } else if (itemMatch3) {
          const sm = u.match(/shopid=(\d+)/);
          const im = u.match(/itemid=(\d+)/);
          if (sm && im) {
            shopid = sm[1];
            itemid = im[1];
            break;
          }
        }
      }

      // Step 4: Fetch Shopee Product API if itemid & shopid found
      if (shopid && itemid) {
        const apiUrls = [
          `https://shopee.vn/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`,
          `https://shopee.vn/api/v2/item/get?itemid=${itemid}&shopid=${shopid}`,
          `https://shopee.vn/api/v4/pdp/get_pc?item_id=${itemid}&shop_id=${shopid}`,
        ];

        for (const apiUrl of apiUrls) {
          try {
            const apiRes = await fetch(apiUrl, {
              headers: {
                'User-Agent':
                  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
                Referer: currentUrl,
                'X-Requested-With': 'XMLHttpRequest',
              },
            });
            if (apiRes.ok) {
              const data = await apiRes.json();
              const imgHash =
                data?.data?.image ||
                data?.item?.image ||
                data?.data?.images?.[0] ||
                data?.item?.images?.[0] ||
                data?.data?.item?.image;
              if (imgHash && typeof imgHash === 'string' && imgHash.length >= 20) {
                return res.json({
                  success: true,
                  imageUrl: `https://down-vn.img.susercontent.com/file/${imgHash}`,
                });
              }
            }
          } catch (e) {
            // continue
          }
        }
      }

      // Step 5: Check Shop ID if no item found
      if (!shopid) {
        for (const u of visitedUrls) {
          const shopMatch = u.match(/\/shop\/(\d+)/) || u.match(/shopid=(\d+)/);
          if (shopMatch) {
            shopid = shopMatch[1];
            break;
          }
        }
      }

      if (shopid) {
        try {
          const shopApiRes = await fetch(`https://shopee.vn/api/v4/shop/get_shop_detail?shopid=${shopid}`, {
            headers: {
              'User-Agent':
                'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
              Referer: currentUrl,
              'X-Requested-With': 'XMLHttpRequest',
            },
          });
          if (shopApiRes.ok) {
            const sData = await shopApiRes.json();
            const cover = sData?.data?.cover || sData?.data?.portrait;
            if (cover && typeof cover === 'string' && cover.length >= 20) {
              return res.json({
                success: true,
                imageUrl: `https://down-vn.img.susercontent.com/file/${cover}`,
              });
            }
          }
        } catch (e) {
          // continue
        }
      }

      // Step 6: Parse OpenGraph / Twitter meta tags and HTML Regex
      if (htmlContent) {
        const ogMatch =
          htmlContent.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
          htmlContent.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i) ||
          htmlContent.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
          htmlContent.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);

        if (ogMatch && ogMatch[1] && !ogMatch[1].includes('deo.shopeemobile.com')) {
          return res.json({ success: true, imageUrl: ogMatch[1] });
        }

        const cdnMatch = htmlContent.match(
          /https:\/\/(down-vn\.img\.susercontent\.com|down-tx-vn\.img\.susercontent\.com|cf\.shopee\.vn)\/file\/[a-zA-Z0-9_-]+/
        );
        if (cdnMatch && cdnMatch[0]) {
          return res.json({ success: true, imageUrl: cdnMatch[0] });
        }

        const hashMatch = htmlContent.match(/"image"\s*:\s*"([a-zA-Z0-9_-]{32})"/);
        if (hashMatch && hashMatch[1]) {
          return res.json({
            success: true,
            imageUrl: `https://down-vn.img.susercontent.com/file/${hashMatch[1]}`,
          });
        }
      }

      return res.status(404).json({ error: 'Không tìm thấy ảnh sản phẩm từ link Shopee này.' });
    } catch (error: any) {
      console.error('Extract Shopee Image Error:', error);
      return res.status(500).json({ error: error.message || 'Lỗi khi trích xuất ảnh Shopee.' });
    }
  });

  // Chat API endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, products, selectedModel } = req.body;

      const ai = getAiClient();
      if (!ai) {
        return res.status(500).json({
          error:
            'Chưa tìm thấy GEMINI_API_KEY. Vui lòng kiểm tra cài đặt chìa khóa AI trong Settings.',
        });
      }

      const modelName = selectedModel || 'gemini-3.6-flash';

      // Build product context summary if products are available
      let productContext = '';
      if (Array.isArray(products) && products.length > 0) {
        productContext =
          `\n\nDANH SÁCH SẢN PHẨM CÓ SẴN TRÊN WEBSITE (ĐỒ CÂU LK HÒA):\n` +
          products
            .slice(0, 50)
            .map(
              (p: any, i: number) =>
                `${i + 1}. [${p.category}] ${p.title} - Giá ưu đãi: ${p.dealPrice?.toLocaleString('vi-VN')}đ (Gốc: ${p.originalPrice?.toLocaleString('vi-VN')}đ) - Mã giảm: ${p.couponCode || 'LKHOA10K'} - Link Shopee: ${p.affiliateUrl}`
            )
            .join('\n');
      }

      const systemInstruction = `Bạn là "Trợ Lý Tư Vấn Đồ Câu LK Hòa" - chuyên gia tư vấn câu cá chuyên nghiệp, nhiệt tình, am hiểu sâu sắc về kỹ thuật câu cá (câu đài, câu lure, câu lăng xê, câu đầm, câu sông, hồ dịch vụ...).

Nhiệm vụ chính:
1. Giải đáp thắc mắc về thiết bị câu cá: độ cứng cần câu (4H, 5H, 6H, 8H, carbon 24T/30T/36T), độ dài (2.7m, 3.6m, 4.5m, 5.4m, 6.3m...), chọn máy câu đứng/ngang (1000, 2500, 3000, 4000), loại dây dù X4/X8, thẻo câu, phao nano, mồi xả, mồi vuốt cám chép/rô...
2. Tư vấn sản phẩm phù hợp nhu cầu & ngân sách cụ thể của cần thủ dựa trên danh sách sản phẩm cửa hàng LK Hòa dưới đây.
3. Khi giới thiệu sản phẩm, hãy trích dẫn tên chính xác, giá bán ưu đãi và kèm theo đường link Shopee Mall để cần thủ dễ bấm chọn mua.
4. Thái độ: Thân thiện, chu đáo, xưng "Em" hoặc "LK Hòa Bot", gọi người dùng là "Sếp", "Cần thủ" hoặc "Anh/Chị". Dùng câu từ gần gũi, dùng một số emoji sinh động 🎣🐟🔥.
5. Luôn trả lời bằng Tiếng Việt rõ ràng, trình bày có gạch đầu dòng dễ nhìn.

${productContext}`;

      const formattedContents = (messages || []).map((msg: any) => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const response = await ai.models.generateContent({
        model: modelName,
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const replyText =
        response.text ||
        'Xin lỗi Sếp, em chưa thể xử lý câu trả lời lúc này. Sếp vui lòng thử lại câu hỏi nhé!';

      return res.json({ reply: replyText });
    } catch (error: any) {
      console.error('Chat API error:', error);
      return res.status(500).json({
        error: error.message || 'Đã xảy ra lỗi khi kết nối máy chủ tư vấn AI.',
      });
    }
  });

  // Vite middleware for dev / static for prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
