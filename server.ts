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

      // Direct image URL check
      if (
        targetUrl.match(/\.(jpeg|jpg|gif|png|webp)($|\?)/i) ||
        targetUrl.includes('susercontent.com') ||
        targetUrl.includes('cf.shopee.vn')
      ) {
        return res.json({ success: true, imageUrl: targetUrl });
      }

      // Fetch landing page following redirects with realistic browser User-Agent
      const response = await fetch(targetUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
          'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        },
        redirect: 'follow',
      });

      const html = await response.text();

      // 1. Check og:image meta tag
      const ogMatch =
        html.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
      if (ogMatch && ogMatch[1]) {
        return res.json({ success: true, imageUrl: ogMatch[1] });
      }

      // 2. Check twitter:image meta tag
      const twMatch =
        html.match(/<meta[^>]*name=["']twitter:image["'][^>]*content=["']([^"']+)["']/i) ||
        html.match(/<meta[^>]*content=["']([^"']+)["'][^>]*name=["']twitter:image["']/i);
      if (twMatch && twMatch[1]) {
        return res.json({ success: true, imageUrl: twMatch[1] });
      }

      // 3. Regex search for Shopee image CDN patterns
      const cdnMatch = html.match(
        /https:\/\/(down-vn\.img\.susercontent\.com|down-tx-vn\.img\.susercontent\.com|cf\.shopee\.vn)\/file\/[a-zA-Z0-9_-]+/
      );
      if (cdnMatch && cdnMatch[0]) {
        return res.json({ success: true, imageUrl: cdnMatch[0] });
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
