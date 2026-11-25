import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
import {
  loadServerProducts,
  generateSitemapXml,
  generateRssXml,
  generateRobotsTxt,
  renderSeoPage
} from './src/utils/serverSeoRenderer';
import { createApiApp } from './src/server/createApiApp';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
  app.use(express.json({ limit: '2mb' }));

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

  // Mount shared REST & B2A API routes (also used by Vercel Serverless Functions in /api/[...route].ts)
  app.use(createApiApp());

  function generateSmartFishingReply(userQuery: string, productsList: any[] = []): string {
    const q = (userQuery || '').toLowerCase();
    const prods = Array.isArray(productsList) ? productsList : [];

    if (
      q.includes('địa chỉ') ||
      q.includes('ở đâu') ||
      q.includes('vị trí') ||
      q.includes('chỉ đường') ||
      q.includes('bản đồ') ||
      q.includes('map') ||
      q.includes('nghĩa lâm') ||
      q.includes('nghĩa đàn') ||
      q.includes('nghệ an') ||
      q.includes('tọa độ')
    ) {
      return `Chào Bác! 🎣 Thông tin vị trí chính thức của **Cửa Hàng Đồ Câu LK Hòa**:

📍 **Địa chỉ cửa hàng:**
Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Xã Nghĩa Lâm, Huyện Nghĩa Đàn, Tỉnh Nghệ An.
(Tọa độ: 19.4154285, 105.4515155)

🗺️ **Bản đồ Google Maps & Chỉ đường:**
👉 https://maps.app.goo.gl/Q6qLVcFnBdv7LiZu6

📞 **Hotline tư vấn:** 0933 040 999
💬 **Chat Zalo chính thức:** https://zalo.me/3835730533921276555`;
    }

    const formatProd = (p: any) =>
      `• **${p.name || p.title}**\n  👉 Giá bán: **${p.referencePrice ? p.referencePrice.toLocaleString('vi-VN') + 'đ' : 'Kiểm tra giá mới nhất'}**\n  👉 Link: ${p.shopeeUrl || p.tiktokUrl || 'https://docaulkhoa.vn/san-pham'}`;

    const matchedAll = prods.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)
    );
    const displayList = matchedAll.length > 0 ? matchedAll.slice(0, 3) : prods.slice(0, 3);

    return `Chào Bác! 🎣 Em là **Trợ Lý Tư Vấn Đồ Câu LK Hòa**.

Dưới đây là các sản phẩm đồ câu chất lượng cao tại cửa hàng LK Hòa:

${displayList.map(formatProd).join('\n\n')}`;
  }

  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, products, selectedModel, userLocation } = req.body || {};
      const lastUserMsg =
        (messages || []).slice().reverse().find((m: any) => m.role === 'user')?.content || '';

      const isMapQuery =
        selectedModel === 'gemini-3.5-flash' ||
        /địa chỉ|ở đâu|vị trí|chỉ đường|bản đồ|google map|maps|cửa hàng|shop|nghệ an|nghĩa đàn|nghĩa lâm|tọa độ|điểm câu|hồ câu|sông/i.test(
          lastUserMsg
        );

      const ai = getAiClient();
      if (!ai) {
        const smartReply = generateSmartFishingReply(lastUserMsg, products);
        const fallbackPlaces = isMapQuery
          ? [
              {
                uri: 'https://maps.app.goo.gl/Q6qLVcFnBdv7LiZu6',
                title: 'Đồ câu LK Hoà (Cửa hàng chính thức)',
                snippet: 'Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Xã Nghĩa Lâm, Huyện Nghĩa Đàn, Tỉnh Nghệ An',
              },
            ]
          : [];
        return res.json({ reply: smartReply, groundingPlaces: fallbackPlaces });
      }

      try {
        const modelName = isMapQuery ? 'gemini-3.5-flash' : selectedModel || 'gemini-3.5-flash';
        let productContext = '';
        if (Array.isArray(products) && products.length > 0) {
          productContext =
            `\n\nDANH SÁCH SẢN PHẨM CÓ SẴN TRÊN WEBSITE (ĐỒ CÂU LK HÒA):\n` +
            products
              .slice(0, 50)
              .map(
                (p: any, i: number) =>
                  `${i + 1}. [${p.category}] ${p.name} - Giá: ${p.referencePrice ? p.referencePrice.toLocaleString('vi-VN') + 'đ' : 'Liên hệ'} - Link Shopee: ${p.shopeeUrl || 'Chưa có'}`
              )
              .join('\n');
        }

        const systemInstruction = `Bạn là "Trợ Lý Tư Vấn Đồ Câu LK Hòa" - chuyên gia tư vấn câu cá chuyên nghiệp, nhiệt tình.
- Hỗ trợ đặt trực tiếp trên website (COD đồng kiểm hoặc VietQR, Freeship đơn >= 300.000đ hoặc có Cần câu) và qua Shopee/TikTok Shop.
- Địa chỉ: Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Xã Nghĩa Lâm, Huyện Nghĩa Đàn, Tỉnh Nghệ An (https://maps.app.goo.gl/Q6qLVcFnBdv7LiZu6).
- Hotline/Zalo: 0933 040 999 / https://zalo.me/3835730533921276555.${productContext}`;

        const formattedContents = (messages || []).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: String(msg.content || '').slice(0, 2000) }],
        }));

        const genConfig: any = {
          systemInstruction,
          temperature: 0.7,
        };

        if (modelName === 'gemini-3.5-flash') {
          genConfig.tools = [{ googleMaps: {} }];
          const lat = Number(userLocation?.latitude) || 19.4154285;
          const lng = Number(userLocation?.longitude) || 105.4515155;
          genConfig.toolConfig = {
            retrievalConfig: {
              latLng: { latitude: lat, longitude: lng },
            },
          };
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: formattedContents,
          config: genConfig,
        });

        const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
        const groundingPlaces: Array<{ uri: string; title: string; snippet?: string }> = [];
        for (const chunk of chunks as any[]) {
          if (chunk.maps?.uri) {
            groundingPlaces.push({
              uri: chunk.maps.uri,
              title: chunk.maps.title || 'Địa điểm trên Google Maps',
              snippet: chunk.maps.placeAnswerSources?.reviewSnippets?.[0]?.reviewText,
            });
          }
        }
        if (isMapQuery && !groundingPlaces.some((p) => p.uri.includes('Q6qLVcFnBdv7LiZu6'))) {
          groundingPlaces.unshift({
            uri: 'https://maps.app.goo.gl/Q6qLVcFnBdv7LiZu6',
            title: 'Đồ câu LK Hoà (Cửa hàng chính thức)',
            snippet: 'Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Xã Nghĩa Lâm, Huyện Nghĩa Đàn, Tỉnh Nghệ An',
          });
        }

        if (response.text) {
          return res.json({ reply: response.text, groundingPlaces });
        }
        return res.json({ reply: generateSmartFishingReply(lastUserMsg, products), groundingPlaces });
      } catch {
        const fallbackPlaces = isMapQuery
          ? [
              {
                uri: 'https://maps.app.goo.gl/Q6qLVcFnBdv7LiZu6',
                title: 'Đồ câu LK Hoà (Cửa hàng chính thức)',
                snippet: 'Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Xã Nghĩa Lâm, Huyện Nghĩa Đàn, Tỉnh Nghệ An',
              },
            ]
          : [];
        return res.json({ reply: generateSmartFishingReply(lastUserMsg, products), groundingPlaces: fallbackPlaces });
      }
    } catch {
      return res.status(500).json({ error: 'Đã xảy ra lỗi khi kết nối máy chủ tư vấn AI.' });
    }
  });

  const serverProducts = loadServerProducts();

  app.get('/sitemap.xml', (_req, res) => {
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(generateSitemapXml(serverProducts));
  });

  app.get(['/feed.xml', '/rss.xml'], (_req, res) => {
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(generateRssXml(serverProducts));
  });

  app.get('/robots.txt', (_req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(generateRobotsTxt());
  });

  app.get('/google:id.html', (req, res) => {
    const filename = `google${req.params.id}.html`;
    const filePath = path.join(process.cwd(), 'public', filename);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    return res.status(404).send('File Google verification không tồn tại');
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: false,
        ws: false,
      },
      appType: 'custom',
    });

    app.use(vite.middlewares);

    app.get('*', async (req, res, next) => {
      if (req.path.startsWith('/api/')) return next();
      try {
        const indexPath = path.join(process.cwd(), 'index.html');
        const rawIndexHtml = fs.readFileSync(indexPath, 'utf-8');
        const rendered = renderSeoPage(req.path, req.query, rawIndexHtml, serverProducts);
        const finalHtml = await vite.transformIndexHtml(req.originalUrl, rendered);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(finalHtml);
      } catch (err) {
        console.error('Dev SEO render error:', err);
        return next(err);
      }
    });
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));

    app.get('*', (req, res) => {
      try {
        const indexPath = path.join(distPath, 'index.html');
        const indexHtml = fs.readFileSync(indexPath, 'utf-8');
        const rendered = renderSeoPage(req.path, req.query, indexHtml, serverProducts);
        res.setHeader('Content-Type', 'text/html; charset=utf-8');
        return res.status(200).send(rendered);
      } catch {
        return res.sendFile(path.join(distPath, 'index.html'));
      }
    });
  }

  httpServer.on('error', (err: any) => {
    if (err && err.code === 'EADDRINUSE') {
      console.warn(`[server] Port ${PORT} is already in use by another instance.`);
    } else {
      console.error('[server] Error:', err);
    }
  });

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
