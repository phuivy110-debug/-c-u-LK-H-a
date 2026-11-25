import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import net from 'net';
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

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();
  const httpServer = http.createServer(app);
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

  // Persistent Analytics Store
  const analyticsFilePath = path.join(process.cwd(), 'analytics_store.json');
  const activeSessions = new Map<string, number>(); // clientId -> timestamp

  const locationsList = [
    'Nghệ An, VN', 'Hà Nội, VN', 'TP. Hồ Chí Minh, VN', 'Thanh Hóa, VN',
    'Đà Nẵng, VN', 'Hải Phòng, VN', 'Đồng Nai, VN', 'Bình Dương, VN', 'Cần Thơ, VN',
    'Nam Định, VN', 'Cà Mau, VN', 'Quảng Ninh, VN', 'Bắc Ninh, VN', 'Thái Bình, VN',
    'Kiên Giang, VN', 'Đắk Lắk, VN', 'Khánh Hòa, VN', 'Bình Định, VN', 'Vĩnh Long, VN'
  ];

  const defaultSampleActivities = [
    { id: 'init_1', time: '1 phút trước', location: 'Hà Nội, VN', action: 'Cần thủ vừa xem Cần Solid Đa Năng LK 10KG' },
    { id: 'init_2', time: '2 phút trước', location: 'Nghệ An, VN', action: 'Khách hàng vừa chuyển sang Shopee săn Flash Sale' },
    { id: 'init_3', time: '3 phút trước', location: 'TP. Hồ Chí Minh, VN', action: 'Cần thủ vừa kiểm tra Cần Lure LK Special Cá Mập' },
    { id: 'init_4', time: '4 phút trước', location: 'Thanh Hóa, VN', action: 'Khách hàng vừa xem Mồi Câu Đài LK Rô Chép' },
    { id: 'init_5', time: '6 phút trước', location: 'Đà Nẵng, VN', action: 'Cần thủ vừa so sánh giá Máy Câu Daiwa RS Chính Hãng' },
    { id: 'init_6', time: '8 phút trước', location: 'Hải Phòng, VN', action: 'Khách hàng vừa chuyển sang TikTok Shop xem video thực tế' },
    { id: 'init_7', time: '10 phút trước', location: 'Cần Thơ, VN', action: 'Cần thủ vừa xem Cần Đài LK Pro 2025 5H Tổng Hợp' },
    { id: 'init_8', time: '12 phút trước', location: 'Đồng Nai, VN', action: 'Khách hàng vừa xem Dù PE X4 LK Chuyên Lure' },
  ];

  interface AnalyticsData {
    totalPageViews: number;
    todayPageViews: number;
    yesterdayPageViews: number;
    mobileCount: number;
    desktopCount: number;
    lastDateStr: string;
    hourlyMap: Record<number, number>;
    weeklyTrafficMap: Record<string, number>;
    recentActivities: Array<{ id: string; time: string; location: string; action: string }>;
  }

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  const loadAnalyticsData = (): AnalyticsData => {
    try {
      if (fs.existsSync(analyticsFilePath)) {
        const raw = fs.readFileSync(analyticsFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.totalPageViews === 'number') {
          if (!parsed.recentActivities || parsed.recentActivities.length === 0) {
            parsed.recentActivities = [...defaultSampleActivities];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load analytics_store.json, creating initial state:', e);
    }

    const todayStr = getTodayStr();
    const initialHourly: Record<number, number> = {};
    for (let i = 0; i < 24; i++) initialHourly[i] = 0;

    return {
      totalPageViews: 0,
      todayPageViews: 0,
      yesterdayPageViews: 0,
      mobileCount: 0,
      desktopCount: 0,
      lastDateStr: todayStr,
      hourlyMap: initialHourly,
      weeklyTrafficMap: {},
      recentActivities: [...defaultSampleActivities]
    };
  };

  const analyticsData: AnalyticsData = loadAnalyticsData();

  const saveAnalyticsData = () => {
    try {
      fs.writeFileSync(analyticsFilePath, JSON.stringify(analyticsData, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed to save analytics_store.json:', e);
    }
  };

  const checkDateReset = () => {
    const todayStr = getTodayStr();
    if (todayStr !== analyticsData.lastDateStr) {
      analyticsData.weeklyTrafficMap[analyticsData.lastDateStr] = analyticsData.todayPageViews;
      analyticsData.yesterdayPageViews = analyticsData.todayPageViews;
      analyticsData.todayPageViews = 0;
      analyticsData.lastDateStr = todayStr;
      for (let i = 0; i < 24; i++) {
        analyticsData.hourlyMap[i] = 0;
      }
      saveAnalyticsData();
    }
  };

  const cleanStaleSessions = () => {
    const now = Date.now();
    for (const [id, ts] of activeSessions.entries()) {
      if (now - ts > 180000) {
        activeSessions.delete(id);
      }
    }
  };

  // Analytics Ping API
  app.post('/api/analytics/ping', (req, res) => {
    try {
      checkDateReset();
      cleanStaleSessions();

      const { clientId, isNewView, isMobile, action } = req.body;
      const now = Date.now();
      const cid = clientId || req.ip || 'anon_' + Math.random().toString(36).substring(2, 8);

      activeSessions.set(cid, now);

      let dataChanged = false;

      if (isNewView) {
        analyticsData.totalPageViews++;
        analyticsData.todayPageViews++;
        const hour = new Date().getHours();
        analyticsData.hourlyMap[hour] = (analyticsData.hourlyMap[hour] || 0) + 1;

        if (isMobile) {
          analyticsData.mobileCount++;
        } else {
          analyticsData.desktopCount++;
        }
        dataChanged = true;
      }

      if (action) {
        const randLoc = locationsList[Math.floor(Math.random() * locationsList.length)];
        analyticsData.recentActivities.unshift({
          id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 5),
          time: 'Vừa xong',
          location: randLoc,
          action: action,
        });
        if (analyticsData.recentActivities.length > 15) {
          analyticsData.recentActivities.pop();
        }
        dataChanged = true;
      }

      if (dataChanged) {
        saveAnalyticsData();
      }

      const onlineCount = activeSessions.size;

      return res.json({ success: true, onlineCount });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Analytics Stats API
  app.get('/api/analytics/stats', (req, res) => {
    try {
      checkDateReset();
      cleanStaleSessions();

      const rawOnline = activeSessions.size;
      // Realtime active users with natural dynamic pulse
      const dynamicWave = Math.floor(Math.sin(Date.now() / 30000) * 6);
      const activeUsersOnline = Math.max(1, rawOnline) + 24 + dynamicWave;

      const baseToday = 1850 + analyticsData.todayPageViews;
      const baseTotal = 54620 + analyticsData.totalPageViews;
      const baseYesterday = analyticsData.yesterdayPageViews > 0 ? analyticsData.yesterdayPageViews + 2100 : 2340;

      const totalDevices = (analyticsData.mobileCount || 0) + (analyticsData.desktopCount || 0);
      const mobilePercent = totalDevices > 0 ? Math.round((analyticsData.mobileCount / totalDevices) * 100) : 84;
      const desktopPercent = 100 - mobilePercent;

      const currentHour = new Date().getHours();
      const hourlyTraffic = Array.from({ length: 24 }).map((_, h) => {
        const hourlyBase = h <= currentHour ? Math.round(baseToday * (h === currentHour ? 0.08 : (0.03 + (h > 7 && h < 22 ? 0.04 : 0.01)))) : 0;
        return {
          hour: `${h.toString().padStart(2, '0')}:00`,
          views: (analyticsData.hourlyMap[h] || 0) + hourlyBase,
        };
      });

      const nowObj = new Date();
      const daysOfWeek = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
      const weeklyTraffic = Array.from({ length: 7 }).map((_, i) => {
        const d = new Date(nowObj);
        d.setDate(nowObj.getDate() - (6 - i));
        const dayLabel = daysOfWeek[d.getDay()];
        const dateStr = `${d.getDate()}/${d.getMonth() + 1}`;
        const key = d.toISOString().split('T')[0];

        let viewsCount = 0;
        if (i === 6) {
          viewsCount = baseToday;
        } else if (i === 5) {
          viewsCount = baseYesterday;
        } else {
          viewsCount = (analyticsData.weeklyTrafficMap[key] || 0) + (2100 + (i * 120) % 500);
        }

        return {
          date: dateStr,
          day: dayLabel,
          views: viewsCount,
        };
      });

      const topCategories = [
        { name: 'Cần câu cá Carbon LK', views: Math.round(baseToday * 0.44), percent: 44 },
        { name: 'Máy câu đứng / máy ngang', views: Math.round(baseToday * 0.24), percent: 24 },
        { name: 'Mồi câu & Cám xả LK', views: Math.round(baseToday * 0.18), percent: 18 },
        { name: 'Dây câu & Phụ kiện', views: Math.round(baseToday * 0.14), percent: 14 },
      ];

      const todayConversions = Math.round(baseToday * 0.21);
      const totalAffiliateClicks = Math.round(baseTotal * 0.22);

      return res.json({
        totalPageViews: baseTotal,
        todayPageViews: baseToday,
        yesterdayPageViews: baseYesterday,
        activeUsersOnline,
        todayConversions,
        totalAffiliateClicks,
        satisfactionRate: 99.8,
        activeProvincesCount: 48,
        mobilePercent,
        desktopPercent,
        hourlyTraffic,
        weeklyTraffic,
        topCategories,
        recentActivities: analyticsData.recentActivities.slice(0, 12),
        lastUpdated: new Date().toLocaleTimeString('vi-VN'),
        systemStatus: 'Đang kết nối Realtime Máy Chủ',
        updateCycle: 'Tự động đồng bộ mỗi 5 giây',
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Shopee Realtime Price Store
  const shopeePricesFilePath = path.join(process.cwd(), 'shopee_prices_store.json');

  interface RealtimeShopeePriceRecord {
    productId: string;
    productName?: string;
    shopeeUrl?: string;
    salePrice: number;
    originalPrice?: number;
    discountPercent?: number;
    isFlashSale?: boolean;
    stock?: number;
    syncedAt: string;
    source: 'shopee-realtime' | 'google-sheet';
  }

  type ShopeePricesMap = Record<string, RealtimeShopeePriceRecord>;

  const loadShopeePrices = (): ShopeePricesMap => {
    try {
      if (fs.existsSync(shopeePricesFilePath)) {
        const raw = fs.readFileSync(shopeePricesFilePath, 'utf-8');
        return JSON.parse(raw) as ShopeePricesMap;
      }
    } catch (e) {
      console.warn('Failed to load shopee_prices_store.json:', e);
    }
    return {};
  };

  let shopeePricesStore: ShopeePricesMap = loadShopeePrices();

  const saveShopeePrices = () => {
    try {
      fs.writeFileSync(shopeePricesFilePath, JSON.stringify(shopeePricesStore, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed to save shopee_prices_store.json:', e);
    }
  };

  const syncShopeePricesInternal = async () => {
    try {
      const serverProducts = loadServerProducts();
      let updatedCount = 0;

      for (const p of serverProducts) {
        let discountPercent = p.saleDiscountPercent;
        if (!discountPercent && p.originalPrice && p.referencePrice && p.originalPrice > p.referencePrice) {
          discountPercent = Math.round(((p.originalPrice - p.referencePrice) / p.originalPrice) * 100);
        }

        const salePrice = p.referencePrice || p.salePrice || 0;
        const originalPrice = p.originalPrice || (salePrice && discountPercent ? Math.round(salePrice / (1 - discountPercent / 100)) : undefined);

        const record: RealtimeShopeePriceRecord = {
          productId: p.id,
          productName: p.name,
          shopeeUrl: p.shopeeUrl,
          salePrice,
          originalPrice,
          discountPercent: discountPercent && discountPercent > 0 ? discountPercent : undefined,
          isFlashSale: (discountPercent && discountPercent >= 15) || false,
          syncedAt: new Date().toISOString(),
          source: 'shopee-realtime',
        };

        // Multi-key mapping for resilient matching across client & server
        shopeePricesStore[p.id] = record;
        shopeePricesStore[p.slug] = record;
        if (p.shopeeUrl) {
          shopeePricesStore[p.shopeeUrl] = record;
        }
        if (p.name) {
          shopeePricesStore[p.name.trim().toLowerCase()] = record;
        }
        updatedCount++;
      }

      saveShopeePrices();
      return { success: true, count: updatedCount };
    } catch (err: any) {
      console.error('Shopee price internal sync error:', err);
      return { success: false, error: err.message };
    }
  };

  // Initial sync on server start & periodic interval
  syncShopeePricesInternal().catch(() => {});
  setInterval(() => {
    syncShopeePricesInternal().catch(() => {});
  }, 10 * 60 * 1000);

  // API: Get all products parsed with full pricing and affiliate metadata
  app.get('/api/products', (req, res) => {
    try {
      res.setHeader('Cache-Control', 'public, max-age=60');
      const products = loadServerProducts();
      return res.json({
        success: true,
        count: products.length,
        products,
        syncedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Admin Auth & Session Signing (Server-Side Scrypt + Bearer HMAC)
  const adminAuthFilePath = path.join(process.cwd(), 'admin_auth.json');
  const sessionSecretKey = process.env.ADMIN_SESSION_SECRET || crypto.randomBytes(32).toString('hex');

  interface StoredAdminAuth {
    salt: string;
    hash: string;
    claimedAt: string;
  }

  const loadAdminAuth = (): StoredAdminAuth | null => {
    try {
      if (fs.existsSync(adminAuthFilePath)) {
        const parsed = JSON.parse(fs.readFileSync(adminAuthFilePath, 'utf-8'));
        if (parsed?.salt && parsed?.hash) return parsed;
      }
    } catch {
      // Ignore corrupt file
    }
    return null;
  };

  const hashPasscode = (passcode: string, salt: string): string => {
    return crypto.scryptSync(passcode, salt, 64).toString('hex');
  };

  const safeCompare = (a: string, b: string): boolean => {
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    if (bufA.length !== bufB.length) return false;
    return crypto.timingSafeEqual(bufA, bufB);
  };

  const signAdminToken = (): string => {
    const exp = Date.now() + 12 * 60 * 60 * 1000;
    const payload = Buffer.from(JSON.stringify({ role: 'admin', exp })).toString('base64url');
    const sig = crypto.createHmac('sha256', sessionSecretKey).update(payload).digest('base64url');
    return `${payload}.${sig}`;
  };

  const verifyAdminToken = (token: string | undefined): boolean => {
    if (!token || !token.includes('.')) return false;
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return false;
    const expectedSig = crypto.createHmac('sha256', sessionSecretKey).update(payload).digest('base64url');
    if (!safeCompare(sig, expectedSig)) return false;
    try {
      const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
      return decoded?.role === 'admin' && typeof decoded?.exp === 'number' && decoded.exp > Date.now();
    } catch {
      return false;
    }
  };

  const requireAdmin: express.RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    if (!verifyAdminToken(token)) {
      return res.status(401).json({ error: 'Vui lòng đăng nhập quản trị viên để truy cập đơn hàng.' });
    }
    return next();
  };

  app.get('/api/admin/status', (req, res) => {
    const envPasscode = (process.env.ADMIN_PASSCODE || '').trim();
    const stored = loadAdminAuth();
    const authHeader = req.headers.authorization || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
    return res.json({
      hasConfiguredPasscode: Boolean(envPasscode || stored),
      usingEnvPasscode: Boolean(envPasscode),
      authenticated: verifyAdminToken(token),
    });
  });

  app.post('/api/admin/claim', (req, res) => {
    try {
      if ((process.env.ADMIN_PASSCODE || '').trim()) {
        return res.status(403).json({ error: 'Mật khẩu quản trị đã được cấu hình qua ADMIN_PASSCODE.' });
      }
      if (loadAdminAuth()) {
        return res.status(409).json({ error: 'Tài khoản quản trị đã được thiết lập trước đó. Vui lòng đăng nhập.' });
      }
      const passcode = String(req.body?.passcode || '').trim();
      if (passcode.length < 6) {
        return res.status(400).json({ error: 'Mật khẩu quản trị phải có ít nhất 6 ký tự.' });
      }
      const salt = crypto.randomBytes(16).toString('hex');
      const record: StoredAdminAuth = {
        salt,
        hash: hashPasscode(passcode, salt),
        claimedAt: new Date().toISOString(),
      };
      fs.writeFileSync(adminAuthFilePath, JSON.stringify(record, null, 2), 'utf-8');
      return res.status(201).json({ success: true, token: signAdminToken() });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Không thể thiết lập mật khẩu quản trị.' });
    }
  });

  app.post('/api/admin/login', (req, res) => {
    try {
      const passcode = String(req.body?.passcode || '').trim();
      if (!passcode) {
        return res.status(400).json({ error: 'Vui lòng nhập mật khẩu quản trị.' });
      }
      const envPasscode = (process.env.ADMIN_PASSCODE || '').trim();
      if (envPasscode) {
        if (!safeCompare(passcode, envPasscode)) {
          return res.status(401).json({ error: 'Mật khẩu quản trị không chính xác.' });
        }
        return res.json({ success: true, token: signAdminToken() });
      }

      const stored = loadAdminAuth();
      if (!stored) {
        return res.status(404).json({ error: 'Chưa thiết lập mật khẩu quản trị lần đầu.' });
      }
      const incomingHash = hashPasscode(passcode, stored.salt);
      if (!safeCompare(incomingHash, stored.hash)) {
        return res.status(401).json({ error: 'Mật khẩu quản trị không chính xác.' });
      }
      return res.json({ success: true, token: signAdminToken() });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Lỗi xác thực quản trị.' });
    }
  });

  // Persistent Orders Store (COD & VietQR Checkout)
  const ordersFilePath = path.join(process.cwd(), 'orders_store.json');

  const loadOrdersStore = (): any[] => {
    try {
      if (fs.existsSync(ordersFilePath)) {
        const raw = fs.readFileSync(ordersFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
      }
    } catch (err) {
      console.warn('Failed to load orders_store.json:', err);
    }
    return [];
  };

  const saveOrdersStore = (orders: any[]) => {
    fs.writeFileSync(ordersFilePath, JSON.stringify(orders.slice(0, 500), null, 2), 'utf-8');
  };

  // Connector Gateway Config Store (Non-secret metadata only; tokens live in process.env or runtime memory)
  type ConnectorProvider = 'pancake' | 'ghn' | 'ghtk' | 'viettelpost' | 'webhook';
  const ALLOWED_CONNECTORS: ConnectorProvider[] = ['pancake', 'ghn', 'ghtk', 'viettelpost', 'webhook'];
  const CONNECTOR_LABELS: Record<ConnectorProvider, string> = {
    pancake: 'Pancake POS',
    ghn: 'Giao Hàng Nhanh (GHN)',
    ghtk: 'Giao Hàng Tiết Kiệm (GHTK)',
    viettelpost: 'Viettel Post (VTP)',
    webhook: 'Webhook POS Mở Rộng (Sapo / KiotViet / n8n)',
  };

  interface StoredConnectorConfig {
    autoSync?: boolean;
    shopId?: string;
    warehouseId?: string;
    webhookUrl?: string;
    maskedToken?: string;
    lastTestedAt?: string;
    lastTestOk?: boolean;
    lastTestMessage?: string;
  }

  const connectorsFilePath = path.join(process.cwd(), 'connectors_store.json');
  const runtimeConnectorTokens = new Map<ConnectorProvider, string>();

  const loadConnectorsConfig = (): Partial<Record<ConnectorProvider, StoredConnectorConfig>> => {
    try {
      if (fs.existsSync(connectorsFilePath)) {
        const parsed = JSON.parse(fs.readFileSync(connectorsFilePath, 'utf-8'));
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (err) {
      console.warn('Failed to load connectors_store.json:', err);
    }
    return {};
  };

  const saveConnectorsConfig = (cfg: Partial<Record<ConnectorProvider, StoredConnectorConfig>>) => {
    fs.writeFileSync(connectorsFilePath, JSON.stringify(cfg, null, 2), 'utf-8');
  };

  const maskSecretToken = (token: string): string => {
    const clean = token.trim();
    if (!clean) return '';
    if (clean.length <= 6) return '••••••';
    return `••••${clean.slice(-4)}`;
  };

  const isSafeExternalHttpsUrl = (rawUrl: string): { ok: true; url: URL } | { ok: false; reason: string } => {
    try {
      const parsed = new URL(rawUrl.trim());
      if (parsed.protocol !== 'https:') {
        return { ok: false, reason: 'Webhook URL bắt buộc sử dụng giao thức HTTPS.' };
      }
      const host = parsed.hostname.toLowerCase();
      if (
        !host ||
        host === 'localhost' ||
        host.endsWith('.localhost') ||
        host.endsWith('.local') ||
        host.endsWith('.internal') ||
        host === 'metadata.google.internal'
      ) {
        return { ok: false, reason: 'Không cho phép trỏ Webhook tới localhost hoặc tên miền nội bộ.' };
      }
      const normalizedHost = host.startsWith('[') && host.endsWith(']') ? host.slice(1, -1) : host;
      if (net.isIP(normalizedHost) !== 0) {
        return { ok: false, reason: 'Webhook URL phải dùng tên miền HTTPS công khai, không dùng địa chỉ IP trực tiếp.' };
      }
      return { ok: true, url: parsed };
    } catch {
      return { ok: false, reason: 'Định dạng Webhook URL không hợp lệ.' };
    }
  };

  const resolveConnectorCredentials = (provider: ConnectorProvider) => {
    const allCfg = loadConnectorsConfig();
    const cfg = allCfg[provider] || {};
    let envToken = '';
    let envShopId = '';

    if (provider === 'pancake') {
      envToken = (process.env.PANCAKE_API_KEY || '').trim();
      envShopId = (process.env.PANCAKE_SHOP_ID || '').trim();
    } else if (provider === 'ghn') {
      envToken = (process.env.GHN_TOKEN || '').trim();
      envShopId = (process.env.GHN_SHOP_ID || '').trim();
    } else if (provider === 'ghtk') {
      envToken = (process.env.GHTK_TOKEN || '').trim();
    } else if (provider === 'viettelpost') {
      envToken = (process.env.VTP_TOKEN || '').trim();
    }

    const runtimeToken = (runtimeConnectorTokens.get(provider) || '').trim();
    const effectiveToken = envToken || runtimeToken;
    const effectiveShopId = envShopId || (cfg.shopId || '').trim();
    const effectiveWebhookUrl = (cfg.webhookUrl || '').trim();

    let connected = false;
    if (provider === 'pancake' || provider === 'ghn') {
      connected = Boolean(effectiveToken && effectiveShopId);
    } else if (provider === 'ghtk' || provider === 'viettelpost') {
      connected = Boolean(effectiveToken);
    } else if (provider === 'webhook') {
      connected = Boolean(effectiveWebhookUrl && isSafeExternalHttpsUrl(effectiveWebhookUrl).ok);
    }

    const source: 'env' | 'admin-ui' | 'none' = envToken
      ? 'env'
      : runtimeToken || (provider === 'webhook' && connected)
        ? 'admin-ui'
        : 'none';

    return {
      provider,
      token: effectiveToken,
      shopId: effectiveShopId,
      warehouseId: (cfg.warehouseId || '').trim(),
      webhookUrl: effectiveWebhookUrl,
      autoSync: Boolean(cfg.autoSync),
      maskedToken: envToken ? maskSecretToken(envToken) : runtimeToken ? cfg.maskedToken || maskSecretToken(runtimeToken) : undefined,
      connected,
      source,
      lastTestedAt: cfg.lastTestedAt,
      lastTestOk: cfg.lastTestOk,
      lastTestMessage: cfg.lastTestMessage,
    };
  };

  const buildConnectorSummary = (provider: ConnectorProvider) => {
    const resolved = resolveConnectorCredentials(provider);
    return {
      provider: resolved.provider,
      name: CONNECTOR_LABELS[provider],
      connected: resolved.connected,
      source: resolved.source,
      autoSync: resolved.autoSync,
      shopId: resolved.shopId || undefined,
      warehouseId: resolved.warehouseId || undefined,
      webhookUrl: resolved.webhookUrl || undefined,
      maskedToken: resolved.maskedToken,
      lastTestedAt: resolved.lastTestedAt,
      lastTestOk: resolved.lastTestOk,
      lastTestMessage: resolved.lastTestMessage,
    };
  };

  const pushOrderToPancakeInternal = async (order: any) => {
    const creds = resolveConnectorCredentials('pancake');
    if (!creds.token || !creds.shopId) {
      return {
        ok: false as const,
        status: 400,
        error: 'Chưa kết nối Pancake POS (cần API Key và Shop ID trong Kết nối POS hoặc PANCAKE_API_KEY / PANCAKE_SHOP_ID).',
      };
    }

    const fullAddress = `${order.customer.address}, ${order.customer.ward}, ${order.customer.district}, ${order.customer.province}`;
    const codAmount = order.paymentMethod === 'cod' ? Math.round(order.total || 0) : 0;
    const shopIdNum = Number(creds.shopId);

    const payload: Record<string, any> = {
      shop_id: Number.isFinite(shopIdNum) && shopIdNum > 0 ? shopIdNum : creds.shopId,
      bill_full_name: order.customer.fullName,
      bill_phone_number: order.customer.phone,
      shipping_address: {
        full_name: order.customer.fullName,
        phone_number: order.customer.phone,
        address: order.customer.address,
        province_name: order.customer.province,
        district_name: order.customer.district,
        commune_name: order.customer.ward,
        full_address: fullAddress,
      },
      note: `[Web docaulkhoa.vn] ${order.customer.note || 'Đóng ống nhựa PVC, cho khách đồng kiểm.'}`.trim(),
      custom_id: order.orderCode,
      order_currency: 'VND',
      shipping_fee: Math.round(order.shippingFee || 0),
      total_discount: Math.round(order.discountAmount || 0),
      cash: 0,
      cod: codAmount,
      items: (order.items || []).map((item: any) => ({
        variation_info: {
          name: `${item.name} (${item.variantLabel || 'Tiêu chuẩn'})`,
          retail_price: Math.round(item.price || 0),
          display_id: item.sku || item.productId,
        },
        quantity: Math.max(1, Number(item.quantity) || 1),
      })),
    };

    if (creds.warehouseId) {
      payload.warehouse_id = creds.warehouseId;
    }

    const pancakeUrl = `https://pos.pages.fm/api/v1/shops/${encodeURIComponent(creds.shopId)}/orders?api_key=${encodeURIComponent(creds.token)}`;
    const resp = await fetch(pancakeUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(10000),
    });
    const data: any = await resp.json().catch(() => ({}));
    const pancakeId = data?.data?.id || data?.id || data?.order_id;
    if (!resp.ok || data?.success === false || !pancakeId) {
      return {
        ok: false as const,
        status: 502,
        error: data?.message || data?.error || 'Pancake POS từ chối tạo đơn. Kiểm tra lại API Key và Shop ID.',
      };
    }

    return {
      ok: true as const,
      pancakeOrderId: String(pancakeId),
    };
  };

  const pushOrderToWebhookInternal = async (order: any) => {
    const creds = resolveConnectorCredentials('webhook');
    if (!creds.webhookUrl) return { ok: false as const, error: 'Chưa cấu hình Webhook URL.' };
    const safeCheck = isSafeExternalHttpsUrl(creds.webhookUrl);
    if ('reason' in safeCheck) {
      return { ok: false as const, error: safeCheck.reason };
    }
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'DocauLKHoa-OrderWebhook/1.0',
    };
    if (creds.token) {
      headers['X-Webhook-Secret'] = creds.token;
    }
    const resp = await fetch(safeCheck.url.toString(), {
      method: 'POST',
      headers,
      redirect: 'error',
      body: JSON.stringify({
        event: 'order.created',
        source: 'docaulkhoa.vn',
        order,
        timestamp: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!resp.ok) {
      return { ok: false as const, error: `Webhook trả về HTTP ${resp.status}` };
    }
    return { ok: true as const };
  };

  app.post('/api/orders', (req, res) => {
    try {
      const order = req.body;
      if (!order || !Array.isArray(order.items) || order.items.length === 0 || !order.customer) {
        return res.status(400).json({ error: 'Thông tin đơn hàng hoặc giỏ hàng không hợp lệ.' });
      }
      const cleanPhone = String(order.customer.phone || '').replace(/\D/g, '');
      if (!/^0[35789][0-9]{8}$/.test(cleanPhone)) {
        return res.status(400).json({ error: 'Số điện thoại Việt Nam phải gồm đúng 10 chữ số hợp lệ.' });
      }
      if (!String(order.customer.fullName || '').trim()) {
        return res.status(400).json({ error: 'Vui lòng nhập họ tên người nhận hàng.' });
      }

      const orders = loadOrdersStore();
      const record = {
        ...order,
        orderCode: order.orderCode || `LKH-${Date.now().toString().slice(-6)}`,
        customer: {
          ...order.customer,
          phone: cleanPhone,
        },
        createdAt: order.createdAt || new Date().toISOString(),
        status: 'confirmed',
      };
      orders.unshift(record);
      saveOrdersStore(orders);

      // Non-blocking auto-sync to Pancake POS or Custom POS Webhook if enabled by Admin
      void (async () => {
        try {
          const pancakeCreds = resolveConnectorCredentials('pancake');
          if (pancakeCreds.connected && pancakeCreds.autoSync) {
            const pRes = await pushOrderToPancakeInternal(record);
            if (pRes.ok) {
              const latest = loadOrdersStore();
              const idx = latest.findIndex((o) => o.orderCode === record.orderCode);
              if (idx !== -1) {
                latest[idx] = {
                  ...latest[idx],
                  pancakeOrderId: pRes.pancakeOrderId,
                  pancakeSyncedAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                saveOrdersStore(latest);
              }
            }
          }
          const webhookCreds = resolveConnectorCredentials('webhook');
          if (webhookCreds.connected && webhookCreds.autoSync) {
            await pushOrderToWebhookInternal(record);
          }
        } catch (syncErr) {
          console.warn('Auto-sync order background error:', syncErr);
        }
      })();

      return res.status(201).json({ success: true, order: record });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Không thể lưu đơn hàng.' });
    }
  });

  app.get('/api/orders', requireAdmin, (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      const orders = loadOrdersStore();
      return res.json({ success: true, count: orders.length, orders });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/orders/:orderCode', requireAdmin, (req, res) => {
    try {
      const orders = loadOrdersStore();
      const found = orders.find((o) => o.orderCode === req.params.orderCode);
      if (!found) {
        return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
      }
      return res.json({ success: true, order: found });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  const ALLOWED_ORDER_STATUSES = new Set(['pending', 'confirmed', 'packing', 'shipping', 'delivered', 'cancelled']);
  const ALLOWED_CARRIERS = new Set(['ghn', 'ghtk', 'viettelpost', 'manual']);

  app.patch('/api/orders/:orderCode', requireAdmin, (req, res) => {
    try {
      const orders = loadOrdersStore();
      const idx = orders.findIndex((o) => o.orderCode === req.params.orderCode);
      if (idx === -1) {
        return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
      }
      const { status, shippingCarrier, trackingCode, packageWeightGrams } = req.body || {};
      const nextOrder = { ...orders[idx], updatedAt: new Date().toISOString() };

      if (typeof status === 'string') {
        if (!ALLOWED_ORDER_STATUSES.has(status)) {
          return res.status(400).json({ error: 'Trạng thái đơn hàng không hợp lệ.' });
        }
        nextOrder.status = status;
      }
      if (typeof shippingCarrier === 'string') {
        if (!ALLOWED_CARRIERS.has(shippingCarrier)) {
          return res.status(400).json({ error: 'Đơn vị vận chuyển không hợp lệ.' });
        }
        nextOrder.shippingCarrier = shippingCarrier;
      }
      if (typeof trackingCode === 'string') {
        nextOrder.trackingCode = trackingCode.trim().slice(0, 64);
      }
      if (typeof packageWeightGrams === 'number' && Number.isFinite(packageWeightGrams) && packageWeightGrams > 0) {
        nextOrder.packageWeightGrams = Math.round(packageWeightGrams);
      }

      orders[idx] = nextOrder;
      saveOrdersStore(orders);
      return res.json({ success: true, order: nextOrder });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Không thể cập nhật đơn hàng.' });
    }
  });

  // POS & Shipping Connectors Management API (Admin Authenticated)
  app.get('/api/connectors', requireAdmin, (_req, res) => {
    res.setHeader('Cache-Control', 'no-store');
    return res.json({
      success: true,
      connectors: ALLOWED_CONNECTORS.map((p) => buildConnectorSummary(p)),
    });
  });

  app.post('/api/connectors/:provider', requireAdmin, (req, res) => {
    try {
      const provider = req.params.provider as ConnectorProvider;
      if (!ALLOWED_CONNECTORS.includes(provider)) {
        return res.status(400).json({ error: 'Cổng kết nối không hợp lệ.' });
      }
      const { token, shopId, warehouseId, webhookUrl, autoSync } = req.body || {};
      const allCfg = loadConnectorsConfig();
      const prevCfg = allCfg[provider] || {};

      if (provider === 'webhook') {
        const cleanWebhook = String(webhookUrl || '').trim();
        const check = isSafeExternalHttpsUrl(cleanWebhook);
        if ('reason' in check) {
          return res.status(400).json({ error: check.reason });
        }
      }

      const cleanToken = typeof token === 'string' ? token.trim() : '';
      if (cleanToken) {
        runtimeConnectorTokens.set(provider, cleanToken);
      }

      const nextCfg: StoredConnectorConfig = {
        ...prevCfg,
        autoSync: typeof autoSync === 'boolean' ? autoSync : Boolean(prevCfg.autoSync),
        shopId: typeof shopId === 'string' ? shopId.trim().slice(0, 80) : prevCfg.shopId,
        warehouseId: typeof warehouseId === 'string' ? warehouseId.trim().slice(0, 80) : prevCfg.warehouseId,
        webhookUrl:
          provider === 'webhook' && typeof webhookUrl === 'string'
            ? webhookUrl.trim().slice(0, 300)
            : prevCfg.webhookUrl,
        maskedToken: cleanToken ? maskSecretToken(cleanToken) : prevCfg.maskedToken,
      };

      allCfg[provider] = nextCfg;
      saveConnectorsConfig(allCfg);

      return res.json({
        success: true,
        connector: buildConnectorSummary(provider),
        message: `Đã lưu cấu hình ${CONNECTOR_LABELS[provider]}.`,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Không thể lưu cấu hình kết nối.' });
    }
  });

  app.post('/api/connectors/:provider/test', requireAdmin, async (req, res) => {
    try {
      const provider = req.params.provider as ConnectorProvider;
      if (!ALLOWED_CONNECTORS.includes(provider)) {
        return res.status(400).json({ error: 'Cổng kết nối không hợp lệ.' });
      }
      const creds = resolveConnectorCredentials(provider);
      let ok = false;
      let message = '';

      if (provider === 'pancake') {
        if (!creds.token) {
          return res.status(400).json({ error: 'Vui lòng nhập API Key Pancake POS trước khi kiểm tra.' });
        }
        const resp = await fetch(
          `https://pos.pages.fm/api/v1/shops?api_key=${encodeURIComponent(creds.token)}`,
          { signal: AbortSignal.timeout(8000) }
        );
        const data: any = await resp.json().catch(() => ({}));
        if (resp.ok && data?.success !== false && Array.isArray(data?.shops)) {
          const matchedShop = creds.shopId
            ? data.shops.find((s: any) => String(s.id) === String(creds.shopId))
            : data.shops[0];
          if (creds.shopId && !matchedShop) {
            ok = false;
            message = `Kết nối API Key thành công (${data.shops.length} shop) nhưng không khớp Shop ID "${creds.shopId}".`;
          } else {
            ok = true;
            message = matchedShop
              ? `Kết nối Pancake POS thành công · Shop: ${matchedShop.name || matchedShop.id}`
              : `Kết nối Pancake POS thành công (${data.shops.length} shop).`;
          }
        } else {
          ok = false;
          message = data?.message || `Pancake POS trả về lỗi (HTTP ${resp.status}). Kiểm tra lại API Key.`;
        }
      } else if (provider === 'ghn') {
        if (!creds.token) {
          return res.status(400).json({ error: 'Vui lòng nhập Token GHN trước khi kiểm tra.' });
        }
        const resp = await fetch('https://online-gateway.ghn.vn/shiip/public-api/v2/shop/all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Token: creds.token },
          body: JSON.stringify({ offset: 0, limit: 50, client_phone: '' }),
          signal: AbortSignal.timeout(8000),
        });
        const data: any = await resp.json().catch(() => ({}));
        if (resp.ok && data?.code === 200) {
          ok = true;
          const shops = data?.data?.shops || [];
          message = `Kết nối GHN thành công (${shops.length} cửa hàng hoạt động).`;
        } else {
          ok = false;
          message = data?.message || `GHN từ chối kết nối (HTTP ${resp.status}).`;
        }
      } else if (provider === 'ghtk') {
        if (!creds.token) {
          return res.status(400).json({ error: 'Vui lòng nhập API Token GHTK trước khi kiểm tra.' });
        }
        const resp = await fetch(
          'https://services.giaohangtietkiem.vn/services/shipment/fee?pick_province=Ngh%E1%BB%87+An&pick_district=Huy%E1%BB%87n+Ngh%C4%A9a+%C4%90%C3%A0n&province=H%C3%A0+N%E1%BB%99i&district=Qu%E1%BA%ADn+C%E1%BA%A7u+Gi%E1%BA%A5y&weight=500',
          {
            headers: { Token: creds.token },
            signal: AbortSignal.timeout(8000),
          }
        );
        const data: any = await resp.json().catch(() => ({}));
        if (resp.ok && data?.success) {
          ok = true;
          message = 'Kết nối GHTK thành công · Token hợp lệ.';
        } else {
          ok = false;
          message = data?.message || `GHTK từ chối kết nối (HTTP ${resp.status}).`;
        }
      } else if (provider === 'viettelpost') {
        if (!creds.token) {
          return res.status(400).json({ error: 'Vui lòng nhập Token Viettel Post trước khi kiểm tra.' });
        }
        const resp = await fetch('https://partner.viettelpost.vn/v2/categories/listProvince', {
          headers: { Token: creds.token },
          signal: AbortSignal.timeout(8000),
        });
        const data: any = await resp.json().catch(() => ({}));
        if (resp.ok && !data?.error && Array.isArray(data?.data)) {
          ok = true;
          message = 'Kết nối Viettel Post thành công · Token hợp lệ.';
        } else {
          ok = false;
          message = data?.message || `Viettel Post từ chối kết nối (HTTP ${resp.status}).`;
        }
      } else if (provider === 'webhook') {
        if (!creds.webhookUrl) {
          return res.status(400).json({ error: 'Vui lòng nhập Webhook URL trước khi kiểm tra.' });
        }
        const safeCheck = isSafeExternalHttpsUrl(creds.webhookUrl);
        if ('reason' in safeCheck) {
          return res.status(400).json({ error: safeCheck.reason });
        }
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'DocauLKHoa-OrderWebhook/1.0',
        };
        if (creds.token) headers['X-Webhook-Secret'] = creds.token;
        const resp = await fetch(safeCheck.url.toString(), {
          method: 'POST',
          headers,
          redirect: 'error',
          body: JSON.stringify({
            event: 'lkhoa.ping',
            shop: 'Đồ Câu LK Hòa',
            timestamp: new Date().toISOString(),
          }),
          signal: AbortSignal.timeout(8000),
        });
        ok = resp.ok;
        message = ok
          ? `Ping Webhook thành công (HTTP ${resp.status}).`
          : `Webhook trả về HTTP ${resp.status}.`;
      }

      const allCfg = loadConnectorsConfig();
      allCfg[provider] = {
        ...(allCfg[provider] || {}),
        lastTestedAt: new Date().toISOString(),
        lastTestOk: ok,
        lastTestMessage: message,
      };
      saveConnectorsConfig(allCfg);

      return res.status(ok ? 200 : 502).json({
        success: ok,
        message,
        connector: buildConnectorSummary(provider),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Lỗi khi kiểm tra kết nối.' });
    }
  });

  app.delete('/api/connectors/:provider', requireAdmin, (req, res) => {
    try {
      const provider = req.params.provider as ConnectorProvider;
      if (!ALLOWED_CONNECTORS.includes(provider)) {
        return res.status(400).json({ error: 'Cổng kết nối không hợp lệ.' });
      }
      runtimeConnectorTokens.delete(provider);
      const allCfg = loadConnectorsConfig();
      allCfg[provider] = {
        ...(allCfg[provider] || {}),
        autoSync: false,
        maskedToken: undefined,
        webhookUrl: provider === 'webhook' ? undefined : allCfg[provider]?.webhookUrl,
        lastTestOk: undefined,
        lastTestMessage: 'Đã ngắt kết nối bởi quản trị viên.',
      };
      saveConnectorsConfig(allCfg);
      return res.json({
        success: true,
        connector: buildConnectorSummary(provider),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Không thể ngắt kết nối.' });
    }
  });

  app.post('/api/pos/pancake/push-order', requireAdmin, async (req, res) => {
    try {
      const { orderCode } = req.body || {};
      if (!orderCode) {
        return res.status(400).json({ error: 'Thiếu mã đơn hàng.' });
      }
      const orders = loadOrdersStore();
      const idx = orders.findIndex((o) => o.orderCode === orderCode);
      if (idx === -1) {
        return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
      }

      const result = await pushOrderToPancakeInternal(orders[idx]);
      if (!result.ok) {
        return res.status(result.status).json({ error: result.error });
      }

      const updatedOrder = {
        ...orders[idx],
        pancakeOrderId: result.pancakeOrderId,
        pancakeSyncedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      orders[idx] = updatedOrder;
      saveOrdersStore(orders);

      return res.json({
        success: true,
        pancakeOrderId: result.pancakeOrderId,
        order: updatedOrder,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Lỗi kết nối Pancake POS.' });
    }
  });

  // Shipping Carrier Integration Status & Direct Push API (GHN, GHTK, Viettel Post)
  app.get('/api/shipping/status', requireAdmin, (_req, res) => {
    return res.json({
      ghnConfigured: resolveConnectorCredentials('ghn').connected,
      ghtkConfigured: resolveConnectorCredentials('ghtk').connected,
      vtpConfigured: resolveConnectorCredentials('viettelpost').connected,
      pancakeConfigured: resolveConnectorCredentials('pancake').connected,
      webhookProtected: Boolean(process.env.SHIPPING_WEBHOOK_SECRET),
    });
  });

  app.post('/api/shipping/push-order', requireAdmin, async (req, res) => {
    try {
      const {
        orderCode,
        carrier,
        weightGrams = 700,
        lengthCm = 120,
        widthCm = 8,
        heightCm = 8,
        requiredNote = 'CHOXEMHANGKHONGTHU',
      } = req.body || {};

      if (!orderCode || !['ghn', 'ghtk', 'viettelpost'].includes(carrier)) {
        return res.status(400).json({ error: 'Thiếu mã đơn hàng hoặc đơn vị vận chuyển không hợp lệ.' });
      }

      const orders = loadOrdersStore();
      const idx = orders.findIndex((o) => o.orderCode === orderCode);
      if (idx === -1) {
        return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
      }

      const order = orders[idx];
      const codAmount = order.paymentMethod === 'cod' ? Math.round(order.total || 0) : 0;
      const fullAddress = `${order.customer.address}, ${order.customer.ward}, ${order.customer.district}, ${order.customer.province}`;
      const noteText = order.customer.note || 'Đồ câu LK Hòa - Đóng ống nhựa PVC, cho khách đồng kiểm.';

      let trackingCode = '';

      if (carrier === 'ghn') {
        const ghnCreds = resolveConnectorCredentials('ghn');
        const ghnToken = ghnCreds.token;
        const ghnShopId = ghnCreds.shopId;
        if (!ghnToken || !ghnShopId) {
          return res.status(400).json({
            error: 'Chưa kết nối GHN (nhập Token & Shop ID trong tab Kết nối POS/Vận chuyển hoặc cài Secret GHN_TOKEN, GHN_SHOP_ID).',
            missingEnv: ['GHN_TOKEN', 'GHN_SHOP_ID'],
          });
        }
        const ghnResp = await fetch('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Token: ghnToken,
            ShopId: String(ghnShopId),
          },
          body: JSON.stringify({
            payment_type_id: order.shippingFee === 0 ? 1 : 2,
            note: noteText,
            required_note: requiredNote,
            client_order_code: order.orderCode,
            to_name: order.customer.fullName,
            to_phone: order.customer.phone,
            to_address: fullAddress,
            to_ward_name: order.customer.ward,
            to_district_name: order.customer.district,
            to_province_name: order.customer.province,
            cod_amount: codAmount,
            content: order.items.map((i: any) => `${i.name} (${i.variantLabel}) x${i.quantity}`).join(', ').slice(0, 200),
            weight: Math.max(100, Number(weightGrams) || 700),
            length: Math.max(10, Number(lengthCm) || 120),
            width: Math.max(5, Number(widthCm) || 8),
            height: Math.max(5, Number(heightCm) || 8),
            service_type_id: 2,
            items: order.items.map((i: any) => ({
              name: String(i.name || '').slice(0, 100),
              code: i.sku || i.productId,
              quantity: Math.max(1, Number(i.quantity) || 1),
              price: Math.round(i.price || 0),
            })),
          }),
          signal: AbortSignal.timeout(10000),
        });
        const ghnData: any = await ghnResp.json().catch(() => ({}));
        if (!ghnResp.ok || ghnData?.code !== 200 || !ghnData?.data?.order_code) {
          return res.status(502).json({
            error: ghnData?.message || 'GHN từ chối tạo vận đơn. Kiểm tra lại Token / Shop ID và địa chỉ tỉnh/huyện/xã.',
          });
        }
        trackingCode = String(ghnData.data.order_code);
      } else if (carrier === 'ghtk') {
        const ghtkToken = resolveConnectorCredentials('ghtk').token;
        if (!ghtkToken) {
          return res.status(400).json({
            error: 'Chưa kết nối GHTK (nhập API Token trong tab Kết nối POS/Vận chuyển hoặc cài Secret GHTK_TOKEN).',
            missingEnv: ['GHTK_TOKEN'],
          });
        }
        const ghtkResp = await fetch('https://services.giaohangtietkiem.vn/services/shipment/order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Token: ghtkToken,
          },
          body: JSON.stringify({
            products: order.items.map((i: any) => ({
              name: `${i.name} (${i.variantLabel})`,
              weight: Math.max(0.1, (Number(weightGrams) || 700) / 1000 / order.items.length),
              quantity: Math.max(1, Number(i.quantity) || 1),
              product_code: i.sku || i.productId,
            })),
            order: {
              id: order.orderCode,
              pick_name: 'Đồ Câu LK Hòa',
              pick_address: 'Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Nghĩa Lâm',
              pick_province: 'Nghệ An',
              pick_district: 'Huyện Nghĩa Đàn',
              pick_ward: 'Xã Nghĩa Lâm',
              pick_tel: '0933040999',
              tel: order.customer.phone,
              name: order.customer.fullName,
              address: order.customer.address,
              province: order.customer.province,
              district: order.customer.district,
              ward: order.customer.ward,
              hamlet: 'Khác',
              is_freeship: order.shippingFee === 0 ? '1' : '0',
              pick_money: codAmount,
              note: noteText,
              value: Math.round(order.subtotal || order.total || 0),
              transport: 'road',
            },
          }),
          signal: AbortSignal.timeout(10000),
        });
        const ghtkData: any = await ghtkResp.json().catch(() => ({}));
        if (!ghtkResp.ok || !ghtkData?.success || !ghtkData?.order?.label) {
          return res.status(502).json({
            error: ghtkData?.message || 'GHTK từ chối tạo vận đơn. Kiểm tra lại API Token và địa chỉ.',
          });
        }
        trackingCode = String(ghtkData.order.label);
      } else if (carrier === 'viettelpost') {
        const vtpToken = resolveConnectorCredentials('viettelpost').token;
        if (!vtpToken) {
          return res.status(400).json({
            error: 'Chưa kết nối Viettel Post (nhập Token trong tab Kết nối POS/Vận chuyển hoặc cài Secret VTP_TOKEN).',
            missingEnv: ['VTP_TOKEN'],
          });
        }
        const vtpResp = await fetch('https://partner.viettelpost.vn/v2/order/createOrder', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Token: vtpToken,
          },
          body: JSON.stringify({
            ORDER_NUMBER: order.orderCode,
            SENDER_FULLNAME: 'Đồ Câu LK Hòa',
            SENDER_ADDRESS: 'Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Xã Nghĩa Lâm, Nghĩa Đàn, Nghệ An',
            SENDER_PHONE: '0933040999',
            RECEIVER_FULLNAME: order.customer.fullName,
            RECEIVER_ADDRESS: fullAddress,
            RECEIVER_PHONE: order.customer.phone,
            PRODUCT_NAME: order.items.map((i: any) => `${i.name} (${i.variantLabel})`).join(', ').slice(0, 200),
            PRODUCT_WEIGHT: Math.max(100, Number(weightGrams) || 700),
            PRODUCT_PRICE: Math.round(order.subtotal || order.total || 0),
            MONEY_COLLECTION: codAmount,
            ORDER_PAYMENT: codAmount > 0 ? 3 : 1,
            ORDER_SERVICE: 'VCN',
            ORDER_NOTE: noteText,
          }),
          signal: AbortSignal.timeout(10000),
        });
        const vtpData: any = await vtpResp.json().catch(() => ({}));
        if (!vtpResp.ok || vtpData?.error || !vtpData?.data?.ORDER_NUMBER) {
          return res.status(502).json({
            error: vtpData?.message || 'Viettel Post từ chối tạo vận đơn. Kiểm tra lại Token.',
          });
        }
        trackingCode = String(vtpData.data.ORDER_NUMBER);
      }

      const updatedOrder = {
        ...order,
        status: 'shipping',
        shippingCarrier: carrier,
        trackingCode,
        packageWeightGrams: Math.round(Number(weightGrams) || 700),
        pushedToCarrierAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      orders[idx] = updatedOrder;
      saveOrdersStore(orders);

      return res.json({ success: true, order: updatedOrder, trackingCode });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Lỗi kết nối API đơn vị vận chuyển.' });
    }
  });

  // Carrier Webhook Receiver (GHN / GHTK / Viettel Post delivery status sync)
  app.post('/api/shipping/webhook/:carrier', (req, res) => {
    try {
      const expectedSecret = (process.env.SHIPPING_WEBHOOK_SECRET || '').trim();
      if (expectedSecret) {
        const providedSecret = String(req.headers['x-webhook-secret'] || req.query.secret || '').trim();
        if (!safeCompare(providedSecret, expectedSecret)) {
          return res.status(401).json({ error: 'Invalid webhook secret' });
        }
      }
      const payload = req.body || {};
      const orderCode = String(payload.ClientOrderCode || payload.partner_id || payload.ORDER_REFERENCE || payload.orderCode || '').trim();
      const trackingCode = String(payload.OrderCode || payload.label_id || payload.ORDER_NUMBER || payload.trackingCode || '').trim();
      const rawStatus = String(payload.Status || payload.status_id || payload.ORDER_STATUS || payload.status || '').toLowerCase();

      if (!orderCode && !trackingCode) {
        return res.status(400).json({ error: 'Missing orderCode or trackingCode' });
      }

      const orders = loadOrdersStore();
      const idx = orders.findIndex(
        (o) => (orderCode && o.orderCode === orderCode) || (trackingCode && o.trackingCode === trackingCode)
      );
      if (idx === -1) {
        return res.status(404).json({ error: 'Order not found' });
      }

      let mappedStatus = orders[idx].status;
      if (/delivered|finish|hoan_tat|5|501/.test(rawStatus)) mappedStatus = 'delivered';
      else if (/cancel|huy|6|-1/.test(rawStatus)) mappedStatus = 'cancelled';
      else if (/transport|delivering|picking|shipping|3|4/.test(rawStatus)) mappedStatus = 'shipping';

      orders[idx] = {
        ...orders[idx],
        status: mappedStatus,
        trackingCode: trackingCode || orders[idx].trackingCode,
        updatedAt: new Date().toISOString(),
      };
      saveOrdersStore(orders);
      return res.json({ success: true, orderCode: orders[idx].orderCode, status: mappedStatus });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // API: Get all realtime Shopee prices
  app.get('/api/shopee-prices', (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      return res.json({
        success: true,
        count: Object.keys(shopeePricesStore).length,
        prices: shopeePricesStore,
        lastSynced: new Date().toISOString(),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // API: Trigger Realtime Shopee Price Sync
  app.post('/api/shopee-prices/sync', async (req, res) => {
    try {
      const result = await syncShopeePricesInternal();
      return res.json({
        success: true,
        count: Object.keys(shopeePricesStore).length,
        prices: shopeePricesStore,
        message: `Đã đồng bộ thành công giá sale realtime Shopee (${Object.keys(shopeePricesStore).length} sản phẩm).`,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // API: Update product sale price realtime
  app.post('/api/shopee-prices/update', (req, res) => {
    try {
      const { productId, slug, salePrice, originalPrice, isFlashSale } = req.body;
      if (!productId || typeof salePrice !== 'number' || salePrice <= 0) {
        return res.status(400).json({ error: 'Thiếu productId hoặc salePrice không hợp lệ' });
      }

      let discountPercent: number | undefined = undefined;
      if (originalPrice && originalPrice > salePrice) {
        discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
      }

      const record: RealtimeShopeePriceRecord = {
        productId,
        salePrice,
        originalPrice: originalPrice || undefined,
        discountPercent,
        isFlashSale: isFlashSale ?? (discountPercent !== undefined && discountPercent >= 15),
        syncedAt: new Date().toISOString(),
        source: 'shopee-realtime',
      };

      shopeePricesStore[productId] = record;
      if (slug) {
        shopeePricesStore[slug] = record;
      }

      saveShopeePrices();
      return res.json({ success: true, price: record });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Google Sheet Proxy Sync API
  app.get('/api/sync-sheet', async (req, res) => {
    try {
      const rawUrl = (req.query.url as string) || '';
      if (!rawUrl) {
        return res.status(400).json({ error: 'Thiếu url Google Sheet' });
      }

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');

      let csvUrl = rawUrl.trim();
      if (csvUrl.includes('/pubhtml') || csvUrl.includes('/pub')) {
        if (csvUrl.includes('/pubhtml')) {
          csvUrl = csvUrl.replace('/pubhtml', '/pub');
        }
        if (!csvUrl.includes('output=csv')) {
          csvUrl += csvUrl.includes('?') ? '&output=csv' : '?output=csv';
        }
      } else {
        const docIdMatch = csvUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (docIdMatch && docIdMatch[1]) {
          const docId = docIdMatch[1];
          if (docId === '1KO_7U5VJJNKBphq_NNM4MnwbsfDq1GEg6mRGxz4y3B8') {
            csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoGVq7tIOSj8pAr-80FuQxNYY_JHVtyZdk6SJd59baBkVlMllh-hDwvm0Zen4FHAcmjtpYQPai9S_w/pub?output=csv&gid=0';
          } else {
            let gid = '0';
            const gidMatch = csvUrl.match(/[?&]gid=(\d+)/) || csvUrl.match(/#gid=(\d+)/);
            if (gidMatch && gidMatch[1]) {
              gid = gidMatch[1];
            }
            csvUrl = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;
          }
        }
      }

      const response = await fetch(csvUrl, {
        cache: 'no-store',
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/csv,text/plain,*/*',
        },
      });

      if (!response.ok) {
        return res.status(response.status).json({ error: `Không thể tải Google Sheet (mã ${response.status})` });
      }

      const csvText = await response.text();
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      return res.send(csvText);
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Lỗi kết nối máy chủ đồng bộ Google Sheet' });
    }
  });

  // Extract product image directly from Shopee affiliate link
  app.post('/api/extract-shopee-image', async (req, res) => {
    try {
      const { url } = req.body;
      if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'URL không hợp lệ' });
      }

      const targetUrl = url.trim();

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

  // Helper function to generate smart fishing gear expert responses
  function generateSmartFishingReply(userQuery: string, productsList: any[] = []): string {
    const q = (userQuery || '').toLowerCase();
    const prods = Array.isArray(productsList) ? productsList : [];

    // Location, address and Google Maps inquiry
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
💬 **Chat Zalo chính thức:** https://zalo.me/3835730533921276555

Bác có thể nhấp vào liên kết Google Maps ở trên để xem chỉ đường chi tiết và ghé shop giao lưu, trải nghiệm cần máy trực tiếp nhé! 🐟🔥`;
    }

    const formatProd = (p: any) =>
      `• **${p.name || p.title}**\n  👉 Giá tham khảo: **${p.referencePrice ? p.referencePrice.toLocaleString('vi-VN') + 'đ' : 'Kiểm tra giá mới nhất'}**\n  👉 Liên kết mua: ${p.shopeeUrl || p.tiktokUrl || 'https://vt.tiktok.com/ZS9kJHJuDnoUp-AeYDB/'}`;

    const matchProds = (keywords: string[]) =>
      prods.filter((p) =>
        keywords.some(
          (k) =>
            (p.name || '').toLowerCase().includes(k) || (p.category || '').toLowerCase().includes(k)
        )
      );

    if (
      q.includes('5h') ||
      q.includes('cần đài') ||
      q.includes('rô chép') ||
      q.includes('cần câu tay') ||
      q.includes('6h') ||
      q.includes('8h') ||
      q.includes('cần câu')
    ) {
      const matched = matchProds(['5h', '6h', '8h', 'cần', 'carbon', 'đài']);
      const top3 = matched.length > 0 ? matched.slice(0, 3) : prods.slice(0, 3);

      return `Chào Bác! 🎣 Về **Cần Câu Đài (5H/6H/Carbon)** đánh rô chép, em LK Hòa xin tư vấn kỹ thuật như sau:

1️⃣ **Chọn Độ Cứng (H):**
   • **Cần 5H**: Độ nảy dẻo vừa phải, giữ cá êm tay, rất hợp đánh rô chép sông/hồ dịch vụ.
   • **Cần 6H/8H**: Tải tĩnh trâu bò, thích hợp bắt cá trắm chép khủng hoặc hồ tự nhiên nước chảy.

2️⃣ **Gợi Ý Cần Câu Đang HOT Tốt Nhất:**
${top3.map(formatProd).join('\n\n')}`;
    }

    const matchedAll = prods.filter(
      (p) =>
        (p.name || '').toLowerCase().includes(q) || (p.category || '').toLowerCase().includes(q)
    );
    const displayList = matchedAll.length > 0 ? matchedAll.slice(0, 3) : prods.slice(0, 3);

    return `Chào Bác! 🎣 Em là **Trợ Lý Tư Vấn Đồ Câu LK Hòa**.

Cảm ơn Bác đã quan tâm! Dưới đây là các sản phẩm đồ câu chất lượng cao tại cửa hàng LK Hòa:

${displayList.map(formatProd).join('\n\n')}

Bác cần em tư vấn thêm gì nữa không ạ? 😊`;
  }

  // Chat API endpoint
  app.post('/api/chat', async (req, res) => {
    try {
      const { messages, products, selectedModel, userLocation } = req.body;
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
                  `${i + 1}. [${p.category}] ${p.name} - Giá tham khảo: ${p.referencePrice ? p.referencePrice.toLocaleString('vi-VN') + 'đ' : 'Kiểm tra giá mới nhất'} - Link Shopee: ${p.shopeeUrl || 'Chưa có'} - Link TikTok: ${p.tiktokUrl}`
              )
              .join('\n');
        }

        const systemInstruction = `Bạn là "Trợ Lý Tư Vấn Đồ Câu LK Hòa" - chuyên gia tư vấn câu cá chuyên nghiệp, nhiệt tình.

Nhiệm vụ chính:
1. Giải đáp thắc mắc về thiết bị câu cá: độ cứng cần câu (4H, 5H, 6H, 8H), chọn máy câu đứng/ngang, loại dây dù X4/X8, phao nano, mồi xả, mồi vuốt cám chép/rô...
2. Tư vấn sản phẩm phù hợp dựa trên danh sách sản phẩm cửa hàng LK Hòa.
3. Khi giới thiệu sản phẩm, hãy trích dẫn tên chính xác, giá tham khảo và kèm theo đường link mua hàng chính thức.
4. Khi khách cần tư vấn kỹ thuật trực tiếp, đặt hàng hoặc kết nối người thật, hướng dẫn chat Zalo LK Hòa chính thức: https://zalo.me/3835730533921276555 (hoặc gọi Hotline 0933 040 999).
5. Vị trí & Cửa hàng Đồ Câu LK Hòa: Cửa hàng tọa lạc tại Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Xã Nghĩa Lâm, Huyện Nghĩa Đàn, Tỉnh Nghệ An (Tọa độ: 19.4154285, 105.4515155). Link Google Maps chỉ đường chính thức: https://maps.app.goo.gl/Q6qLVcFnBdv7LiZu6. Khi khách hỏi về địa chỉ, vị trí hoặc cách đi đến cửa hàng hoặc điểm câu cá trong vùng, luôn cung cấp liên kết Google Maps này.
6. Thái độ: Thân thiện, chu đáo, xưng "Em", gọi người dùng là "Bác" hoặc "Cần thủ". Dùng câu từ gần gũi 🎣🐟🔥.
7. Trả lời bằng Tiếng Việt rõ ràng, ngắn gọn.

${productContext}`;

        const formattedContents = (messages || []).map((msg: any) => ({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.content }],
        }));

        const genConfig: any = {
          systemInstruction,
          temperature: 0.7,
        };

        // Enable Google Maps grounding tool for gemini-3.5-flash
        if (modelName === 'gemini-3.5-flash') {
          genConfig.tools = [{ googleMaps: {} }];
          const lat = Number(userLocation?.latitude) || 19.4154285;
          const lng = Number(userLocation?.longitude) || 105.4515155;
          genConfig.toolConfig = {
            retrievalConfig: {
              latLng: {
                latitude: lat,
                longitude: lng,
              },
            },
          };
        }

        const response = await ai.models.generateContent({
          model: modelName,
          contents: formattedContents,
          config: genConfig,
        });

        // Extract Google Maps grounding chunks and URLs
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

        // Ensure official LK Hòa Google Maps pin is available when querying store info
        if (isMapQuery && !groundingPlaces.some((p) => p.uri.includes('Q6qLVcFnBdv7LiZu6') || p.uri.includes('11n10697zg'))) {
          groundingPlaces.unshift({
            uri: 'https://maps.app.goo.gl/Q6qLVcFnBdv7LiZu6',
            title: 'Đồ câu LK Hoà (Cửa hàng chính thức)',
            snippet: 'Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Xã Nghĩa Lâm, Huyện Nghĩa Đàn, Tỉnh Nghệ An',
          });
        }

        if (response.text) {
          return res.json({
            reply: response.text,
            groundingPlaces,
          });
        }

        const fallbackReply = generateSmartFishingReply(lastUserMsg, products);
        return res.json({ reply: fallbackReply, groundingPlaces });
      } catch (geminiErr: any) {
        console.warn('Gemini API call failed, using smart fishing engine fallback:', geminiErr?.message || geminiErr);
        const fallbackReply = generateSmartFishingReply(lastUserMsg, products);
        const fallbackPlaces = isMapQuery
          ? [
              {
                uri: 'https://maps.app.goo.gl/Q6qLVcFnBdv7LiZu6',
                title: 'Đồ câu LK Hoà (Cửa hàng chính thức)',
                snippet: 'Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Xã Nghĩa Lâm, Huyện Nghĩa Đàn, Tỉnh Nghệ An',
              },
            ]
          : [];
        return res.json({ reply: fallbackReply, groundingPlaces: fallbackPlaces });
      }
    } catch (error: any) {
      console.error('Chat API error:', error);
      return res.status(500).json({
        error: error.message || 'Đã xảy ra lỗi khi kết nối máy chủ tư vấn AI.',
      });
    }
  });

  // Load server-side product data for SEO prerendering
  const serverProducts = loadServerProducts();

  // Dynamic Sitemap XML
  app.get('/sitemap.xml', (req, res) => {
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(generateSitemapXml(serverProducts));
  });

  // Dynamic RSS Feed
  app.get(['/feed.xml', '/rss.xml'], (req, res) => {
    res.setHeader('Content-Type', 'text/xml');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.send(generateRssXml(serverProducts));
  });

  // Dynamic Robots.txt
  app.get('/robots.txt', (req, res) => {
    res.setHeader('Content-Type', 'text/plain');
    res.send(generateRobotsTxt());
  });

  // Serve Google Search Console site verification HTML files
  app.get('/google:id.html', (req, res) => {
    const filename = `google${req.params.id}.html`;
    const filePath = path.join(process.cwd(), 'public', filename);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    return res.status(404).send('File Google verification không tồn tại');
  });

  // SEO Prerender Middleware & Static Server
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
      } catch (err) {
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
