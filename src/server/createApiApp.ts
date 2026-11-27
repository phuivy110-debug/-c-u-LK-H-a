import express from 'express';
import path from 'path';
import fs from 'fs';
import os from 'os';
import crypto from 'crypto';
import net from 'net';
import { loadServerProducts } from '../utils/serverSeoRenderer';
import { getProductDetailData } from '../data/productVariants';
import {
  AVAILABLE_COUPONS,
  buildVietQrImageUrl,
  calculateCheckoutTotals,
  estimateDeliveryWindow,
  generateOrderCode,
  normalizeVietnamesePhone,
} from '../utils/cartStore';
import {
  DOMAIN,
  FLAT_SHIPPING_FEE,
  FREESHIP_THRESHOLD,
  STORE_ADDRESS,
  STORE_HOTLINE,
  STORE_NAME,
} from '../utils/site';
import type { CartItem, Product } from '../types';
import { DEFAULT_COUPONS, getActiveManagedCoupons, type ManagedCoupon } from '../data/coupons';
import {
  getPersistenceHealth,
  loadCoupons,
  saveCoupon,
  deleteCoupon,
  loadConnectorConfigs,
  loadOrders,
  saveConnectorConfigs,
  saveOrders,
} from './persistence';

const isServerlessRuntime = Boolean(
  process.env.VERCEL || process.env.NOW_REGION || process.env.AWS_LAMBDA_FUNCTION_NAME
);

function detectMutableDir(): string {
  const tmpDir = path.join(os.tmpdir(), 'lkhoa-data');
  if (isServerlessRuntime) return tmpDir;
  try {
    fs.accessSync(process.cwd(), fs.constants.W_OK);
    return process.cwd();
  } catch {
    return tmpDir;
  }
}

const mutableDataDir = detectMutableDir();

function ensureMutableDir() {
  if (!fs.existsSync(mutableDataDir)) {
    fs.mkdirSync(mutableDataDir, { recursive: true });
  }
}

function resolveReadPath(filename: string): string {
  const mutablePath = path.join(mutableDataDir, filename);
  if (fs.existsSync(mutablePath)) return mutablePath;
  const cwdPath = path.join(process.cwd(), filename);
  if (fs.existsSync(cwdPath)) return cwdPath;
  if (typeof __dirname !== 'undefined') {
    const dirPath = path.join(__dirname, filename);
    if (fs.existsSync(dirPath)) return dirPath;
  }
  return cwdPath;
}

function resolveWritePath(filename: string): string {
  ensureMutableDir();
  return path.join(mutableDataDir, filename);
}

const globalForAuth = globalThis as unknown as {
  __lkhoaSessionKey?: string;
  __lkhoaRuntimeConnectorTokens?: Map<string, string>;
};

function getSessionSecretKey(): string {
  const envSecret = (process.env.ADMIN_SESSION_SECRET || '').trim();
  if (envSecret) return envSecret;

  const envPasscode = (process.env.ADMIN_PASSCODE || '').trim();
  if (envPasscode) {
    return crypto.scryptSync(envPasscode, 'lkhoa-vercel-session-v1', 32).toString('hex');
  }

  try {
    const authPath = resolveReadPath('admin_auth.json');
    if (fs.existsSync(authPath)) {
      const parsed = JSON.parse(fs.readFileSync(authPath, 'utf-8'));
      if (parsed?.hash && typeof parsed.hash === 'string') {
        return crypto.scryptSync(parsed.hash, 'lkhoa-local-session-v1', 32).toString('hex');
      }
    }
  } catch {
    // Fall back to runtime secret
  }

  if (!globalForAuth.__lkhoaSessionKey) {
    globalForAuth.__lkhoaSessionKey = crypto.randomBytes(32).toString('hex');
  }
  return globalForAuth.__lkhoaSessionKey;
}

export function createApiApp(): express.Express {
  const app = express();

  // Safely parse JSON only when not already parsed (e.g. Vercel Serverless pre-parses req.body)
  const jsonParser = express.json({ limit: '2mb' });
  app.use((req, res, next) => {
    if (typeof req.body === 'string') {
      try {
        req.body = JSON.parse(req.body);
      } catch {
        // Leave as-is if invalid JSON string
      }
      return next();
    }
    if (req.body !== undefined) return next();
    return jsonParser(req, res, next);
  });

  // Persistent Analytics Store
  const activeSessions = new Map<string, number>();

  const defaultSampleActivities: AnalyticsData['recentActivities'] = [];

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
      const p = resolveReadPath('analytics_store.json');
      if (fs.existsSync(p)) {
        const parsed = JSON.parse(fs.readFileSync(p, 'utf-8'));
        if (parsed && typeof parsed.totalPageViews === 'number') {
          if (!parsed.recentActivities || parsed.recentActivities.length === 0) {
            parsed.recentActivities = [...defaultSampleActivities];
          }
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to load analytics_store.json:', e);
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
      recentActivities: [...defaultSampleActivities],
    };
  };

  const analyticsData: AnalyticsData = loadAnalyticsData();

  const saveAnalyticsData = () => {
    try {
      fs.writeFileSync(resolveWritePath('analytics_store.json'), JSON.stringify(analyticsData, null, 2), 'utf-8');
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
      if (now - ts > 180000) activeSessions.delete(id);
    }
  };

  app.post('/api/analytics/ping', (req, res) => {
    try {
      checkDateReset();
      cleanStaleSessions();

      const { clientId, isNewView, isMobile, action } = req.body || {};
      const now = Date.now();
      const cid = clientId || req.ip || 'anon_' + Math.random().toString(36).substring(2, 8);
      activeSessions.set(cid, now);

      let dataChanged = false;
      if (isNewView) {
        analyticsData.totalPageViews++;
        analyticsData.todayPageViews++;
        const hour = new Date().getHours();
        analyticsData.hourlyMap[hour] = (analyticsData.hourlyMap[hour] || 0) + 1;
        if (isMobile) analyticsData.mobileCount++;
        else analyticsData.desktopCount++;
        dataChanged = true;
      }

      if (action) {
        analyticsData.recentActivities.unshift({
          id: Date.now().toString() + '_' + Math.random().toString(36).substring(2, 5),
          time: 'Vừa xong',
          location: 'Không xác định',
          action,
        });
        if (analyticsData.recentActivities.length > 15) analyticsData.recentActivities.pop();
        dataChanged = true;
      }

      if (dataChanged) saveAnalyticsData();
      return res.json({ success: true, onlineCount: activeSessions.size });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/analytics/stats', (_req, res) => {
    try {
      checkDateReset();
      cleanStaleSessions();

      const rawOnline = activeSessions.size;
      const activeUsersOnline = rawOnline;
      const baseToday = analyticsData.todayPageViews;
      const baseTotal = analyticsData.totalPageViews;
      const baseYesterday = analyticsData.yesterdayPageViews;

      const totalDevices = (analyticsData.mobileCount || 0) + (analyticsData.desktopCount || 0);
      const mobilePercent = totalDevices > 0 ? Math.round((analyticsData.mobileCount / totalDevices) * 100) : 84;
      const desktopPercent = 100 - mobilePercent;

      const hourlyTraffic = Array.from({ length: 24 }).map((_, h) => {
        return {
          hour: `${h.toString().padStart(2, '0')}:00`,
          views: analyticsData.hourlyMap[h] || 0,
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
        if (i === 6) viewsCount = baseToday;
        else if (i === 5) viewsCount = baseYesterday;
        else viewsCount = analyticsData.weeklyTrafficMap[key] || 0;

        return { date: dateStr, day: dayLabel, views: viewsCount };
      });

      return res.json({
        totalPageViews: baseTotal,
        todayPageViews: baseToday,
        yesterdayPageViews: baseYesterday,
        activeUsersOnline,
        mobilePercent,
        desktopPercent,
        hourlyTraffic,
        weeklyTraffic,
        topCategories: [],
        recentActivities: analyticsData.recentActivities.slice(0, 12),
        lastUpdated: new Date().toLocaleTimeString('vi-VN'),
        systemStatus: 'Đang kết nối Máy Chủ',
        updateCycle: 'Tự động đồng bộ',
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Shopee Price Store
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
      const p = resolveReadPath('shopee_prices_store.json');
      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, 'utf-8')) as ShopeePricesMap;
      }
    } catch (e) {
      console.warn('Failed to load shopee_prices_store.json:', e);
    }
    return {};
  };

  let shopeePricesStore: ShopeePricesMap = loadShopeePrices();

  const saveShopeePrices = () => {
    try {
      fs.writeFileSync(resolveWritePath('shopee_prices_store.json'), JSON.stringify(shopeePricesStore, null, 2), 'utf-8');
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
          isFlashSale: Boolean(p.isFlashSale),
          syncedAt: new Date().toISOString(),
          source: 'shopee-realtime',
        };

        shopeePricesStore[p.id] = record;
        shopeePricesStore[p.slug] = record;
        if (p.shopeeUrl) shopeePricesStore[p.shopeeUrl] = record;
        if (p.name) shopeePricesStore[p.name.trim().toLowerCase()] = record;
        updatedCount++;
      }

      saveShopeePrices();
      return { success: true, count: updatedCount };
    } catch (err: any) {
      console.error('Shopee price internal sync error:', err);
      return { success: false, error: err.message };
    }
  };

  if (!isServerlessRuntime) {
    syncShopeePricesInternal().catch(() => {});
    setInterval(() => {
      syncShopeePricesInternal().catch(() => {});
    }, 10 * 60 * 1000);
  }

  app.get('/api/products', (_req, res) => {
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
  interface StoredAdminAuth {
    salt: string;
    hash: string;
    claimedAt: string;
  }

  const loadAdminAuth = (): StoredAdminAuth | null => {
    try {
      const p = resolveReadPath('admin_auth.json');
      if (fs.existsSync(p)) {
        const parsed = JSON.parse(fs.readFileSync(p, 'utf-8'));
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
    const sig = crypto.createHmac('sha256', getSessionSecretKey()).update(payload).digest('base64url');
    return `${payload}.${sig}`;
  };

  const verifyAdminToken = (token: string | undefined): boolean => {
    if (!token || !token.includes('.')) return false;
    const [payload, sig] = token.split('.');
    if (!payload || !sig) return false;
    const expectedSig = crypto.createHmac('sha256', getSessionSecretKey()).update(payload).digest('base64url');
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

  const loadManagedCoupons = async (): Promise<ManagedCoupon[]> => {
    const stored = await loadCoupons();
    const byCode = new Map(DEFAULT_COUPONS.map((coupon) => [coupon.code, coupon]));
    for (const coupon of stored) {
      if (coupon?.code) byCode.set(String(coupon.code).toUpperCase(), coupon as ManagedCoupon);
    }
    return [...byCode.values()];
  };

  app.get('/api/coupons/active', async (_req, res) => {
    try {
      const coupons = await loadManagedCoupons();
      return res.json({ coupons: getActiveManagedCoupons(new Date(), coupons) });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Không thể tải mã giảm giá.' });
    }
  });

  app.get('/api/admin/coupons', requireAdmin, async (_req, res) => {
    try { return res.json({ coupons: await loadManagedCoupons() }); }
    catch (err: any) { return res.status(500).json({ error: err?.message || 'Không thể tải danh sách mã.' }); }
  });

  app.put('/api/admin/coupons/:code', requireAdmin, async (req, res) => {
    try {
      const code = String(req.params.code || '').trim().toUpperCase();
      const body = req.body || {};
      if (!/^[A-Z0-9_-]{4,32}$/.test(code)) return res.status(400).json({ error: 'Tên mã không hợp lệ.' });
      const coupon: ManagedCoupon = {
        code,
        title: String(body.title || code).trim().slice(0, 80),
        description: String(body.description || '').trim().slice(0, 180),
        discountType: ['fixed', 'percent', 'free_shipping'].includes(body.discountType) ? body.discountType : 'fixed',
        discountValue: Math.max(0, Number(body.discountValue) || 0),
        minSpend: Math.max(0, Number(body.minSpend) || 0),
        maxDiscount: body.maxDiscount ? Math.max(0, Number(body.maxDiscount) || 0) : undefined,
        startsAt: String(body.startsAt || '').trim(),
        endsAt: String(body.endsAt || '').trim(),
        enabled: body.enabled !== false,
        campaign: String(body.campaign || 'Website').trim().slice(0, 100),
        channel: ['website', 'shopee', 'all'].includes(body.channel) ? body.channel : 'website',
      };
      if (!coupon.startsAt || !coupon.endsAt || Date.parse(coupon.endsAt) <= Date.parse(coupon.startsAt)) return res.status(400).json({ error: 'Thời gian hiệu lực không hợp lệ.' });
      await saveCoupon(coupon);
      return res.json({ success: true, coupon });
    } catch (err: any) { return res.status(500).json({ error: err?.message || 'Không thể lưu mã.' }); }
  });

  app.delete('/api/admin/coupons/:code', requireAdmin, async (req, res) => {
    try { await deleteCoupon(String(req.params.code || '').trim().toUpperCase()); return res.json({ success: true }); }
    catch (err: any) { return res.status(500).json({ error: err?.message || 'Không thể xóa mã.' }); }
  });

  app.get('/api/admin/storage-status', requireAdmin, async (_req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      const storage = await getPersistenceHealth();
      return res.json({ success: true, storage });
    } catch (err: any) {
      return res.status(503).json({
        success: false,
        error: err?.message || 'Không thể kết nối kho dữ liệu đơn hàng.',
      });
    }
  });

  app.post('/api/admin/claim', (req, res) => {
    try {
      if (isServerlessRuntime) {
        return res.status(403).json({
          error: 'Thiết lập quản trị lần đầu đã bị khóa trên production. Hãy cấu hình ADMIN_PASSCODE trong Vercel.',
        });
      }
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
      fs.writeFileSync(resolveWritePath('admin_auth.json'), JSON.stringify(record, null, 2), 'utf-8');
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

  // Persistent Orders Store
  const ordersStorePath = resolveWritePath('orders_store.json');
  const loadOrdersStore = () => loadOrders(ordersStorePath);
  const saveOrdersStore = (orders: any[]) => saveOrders(ordersStorePath, orders);

  // Connector Gateway Config Store
  type ConnectorProvider = 'pancake' | 'ghn' | 'ghtk' | 'viettelpost' | 'webhook' | 'telegram';
  const ALLOWED_CONNECTORS: ConnectorProvider[] = ['pancake', 'ghn', 'ghtk', 'viettelpost', 'webhook', 'telegram'];
  const CONNECTOR_LABELS: Record<ConnectorProvider, string> = {
    pancake: 'Pancake POS',
    ghn: 'Giao Hàng Nhanh (GHN)',
    ghtk: 'Giao Hàng Tiết Kiệm (GHTK)',
    viettelpost: 'Viettel Post (VTP)',
    webhook: 'Webhook POS Mở Rộng (Sapo / KiotViet / n8n)',
    telegram: 'Telegram báo đơn mới',
  };

  interface StoredConnectorConfig {
    autoSync?: boolean;
    shopId?: string;
    warehouseId?: string;
    webhookUrl?: string;
    chatId?: string;
    maskedToken?: string;
    encryptedToken?: string;
    lastTestedAt?: string;
    lastTestOk?: boolean;
    lastTestMessage?: string;
  }

  if (!globalForAuth.__lkhoaRuntimeConnectorTokens) {
    globalForAuth.__lkhoaRuntimeConnectorTokens = new Map<string, string>();
  }
  const runtimeConnectorTokens = globalForAuth.__lkhoaRuntimeConnectorTokens;

  const deriveConnectorCipherKey = (): Buffer => {
    return crypto.createHash('sha256').update(`lkhoa-connector-cipher:${getSessionSecretKey()}`).digest();
  };

  const encryptConnectorToken = (plainToken: string): string => {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv('aes-256-gcm', deriveConnectorCipherKey(), iv);
    const encrypted = Buffer.concat([cipher.update(plainToken, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();
    return `v1:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
  };

  const decryptConnectorToken = (payload: string | undefined): string => {
    if (!payload || !payload.startsWith('v1:')) return '';
    try {
      const [, ivHex, tagHex, dataHex] = payload.split(':');
      if (!ivHex || !tagHex || !dataHex) return '';
      const decipher = crypto.createDecipheriv(
        'aes-256-gcm',
        deriveConnectorCipherKey(),
        Buffer.from(ivHex, 'hex')
      );
      decipher.setAuthTag(Buffer.from(tagHex, 'hex'));
      const decrypted = Buffer.concat([
        decipher.update(Buffer.from(dataHex, 'hex')),
        decipher.final(),
      ]);
      return decrypted.toString('utf8').trim();
    } catch {
      return '';
    }
  };

  const connectorsStorePath = resolveWritePath('connectors_store.json');
  let connectorsConfigCache: Partial<Record<ConnectorProvider, StoredConnectorConfig>> = {};
  let connectorsConfigLoaded = false;

  const hydrateConnectorsConfig = async (force = false) => {
    if (!connectorsConfigLoaded || force) {
      connectorsConfigCache = (await loadConnectorConfigs(connectorsStorePath)) as Partial<
        Record<ConnectorProvider, StoredConnectorConfig>
      >;
      connectorsConfigLoaded = true;
    }
    return connectorsConfigCache;
  };

  const loadConnectorsConfig = () => connectorsConfigCache;

  const saveConnectorsConfig = async (cfg: Partial<Record<ConnectorProvider, StoredConnectorConfig>>) => {
    connectorsConfigCache = cfg;
    connectorsConfigLoaded = true;
    await saveConnectorConfigs(connectorsStorePath, cfg as Record<string, Record<string, any>>);
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
    } else if (provider === 'telegram') {
      envToken = (process.env.TELEGRAM_BOT_TOKEN || '').trim();
    }

    let persistedToken = (runtimeConnectorTokens.get(provider) || '').trim();
    if (!persistedToken && cfg.encryptedToken) {
      persistedToken = decryptConnectorToken(cfg.encryptedToken);
      if (persistedToken) {
        runtimeConnectorTokens.set(provider, persistedToken);
      }
    }

    const effectiveToken = envToken || persistedToken;
    const effectiveShopId = envShopId || (cfg.shopId || '').trim();
    const effectiveWebhookUrl = (cfg.webhookUrl || '').trim();
    const effectiveChatId = (process.env.TELEGRAM_CHAT_ID || cfg.chatId || '').trim();

    let connected = false;
    if (provider === 'pancake' || provider === 'ghn') {
      connected = Boolean(effectiveToken && effectiveShopId);
    } else if (provider === 'ghtk' || provider === 'viettelpost') {
      connected = Boolean(effectiveToken);
    } else if (provider === 'webhook') {
      connected = Boolean(effectiveWebhookUrl && isSafeExternalHttpsUrl(effectiveWebhookUrl).ok);
    } else if (provider === 'telegram') {
      connected = Boolean(effectiveToken && effectiveChatId);
    }

    const source: 'env' | 'admin-ui' | 'none' = envToken
      ? 'env'
      : persistedToken || (provider === 'webhook' && connected)
        ? 'admin-ui'
        : 'none';

    return {
      provider,
      token: effectiveToken,
      shopId: effectiveShopId,
      warehouseId: (cfg.warehouseId || '').trim(),
      webhookUrl: effectiveWebhookUrl,
      chatId: effectiveChatId,
      autoSync: Boolean(cfg.autoSync),
      maskedToken: envToken
        ? maskSecretToken(envToken)
        : persistedToken
          ? cfg.maskedToken || maskSecretToken(persistedToken)
          : undefined,
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
      chatId: resolved.chatId || undefined,
      maskedToken: resolved.maskedToken,
      lastTestedAt: resolved.lastTestedAt,
      lastTestOk: resolved.lastTestOk,
      lastTestMessage: resolved.lastTestMessage,
    };
  };

  const pushOrderToPancakeInternal = async (order: any, timeoutMs = 10000) => {
    const creds = resolveConnectorCredentials('pancake');
    if (!creds.token || !creds.shopId) {
      return {
        ok: false as const,
        status: 400,
        error: 'Chưa kết nối Pancake POS (cần API Key và Shop ID trong Kết nối POS hoặc PANCAKE_API_KEY / PANCAKE_SHOP_ID).',
      };
    }

    const fullAddress = [
      order.customer.address,
      order.customer.ward,
      order.customer.district,
      order.customer.province,
    ]
      .filter(Boolean)
      .join(', ');
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

    if (creds.warehouseId) payload.warehouse_id = creds.warehouseId;

    const pancakeUrl = `https://pos.pages.fm/api/v1/shops/${encodeURIComponent(creds.shopId)}/orders?api_key=${encodeURIComponent(creds.token)}`;
    try {
      const resp = await fetch(pancakeUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const data: any = await resp.json().catch(() => ({}));
      const pancakeId = data?.data?.id || data?.id || data?.order_id;
      if (!resp.ok || data?.success === false || !pancakeId) {
        return {
          ok: false as const,
          status: 502,
          error:
            data?.message ||
            data?.error ||
            `Pancake POS từ chối tạo đơn (HTTP ${resp.status}). Kiểm tra lại API Key và Shop ID.`,
        };
      }

      return { ok: true as const, pancakeOrderId: String(pancakeId) };
    } catch (err: any) {
      return {
        ok: false as const,
        status: 502,
        error: `Lỗi kết nối Pancake POS: ${err?.message || 'Timeout / Không thể truy cập pos.pages.fm'}`,
      };
    }
  };

  const pushOrderToWebhookInternal = async (order: any, timeoutMs = 8000) => {
    const creds = resolveConnectorCredentials('webhook');
    if (!creds.webhookUrl) return { ok: false as const, error: 'Chưa cấu hình Webhook URL.' };
    const safeCheck = isSafeExternalHttpsUrl(creds.webhookUrl);
    if ('reason' in safeCheck) return { ok: false as const, error: safeCheck.reason };

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'DocauLKHoa-OrderWebhook/1.0',
    };
    if (creds.token) headers['X-Webhook-Secret'] = creds.token;

    try {
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
        signal: AbortSignal.timeout(timeoutMs),
      });
      if (!resp.ok) return { ok: false as const, error: `Webhook trả về HTTP ${resp.status}` };
      return { ok: true as const };
    } catch (err: any) {
      return {
        ok: false as const,
        error: `Lỗi gửi Webhook: ${err?.message || 'Timeout / Không thể kết nối Webhook URL'}`,
      };
    }
  };

  const formatTelegramOrderMessage = (order: any) => {
    const items = (order.items || [])
      .map((item: any) => `• ${String(item.name || 'Sản phẩm').slice(0, 80)} (${String(item.variantLabel || 'Tiêu chuẩn').slice(0, 60)}) × ${Math.max(1, Number(item.quantity) || 1)}`)
      .join('\n');
    const customer = order.customer || {};
    const address = [customer.address, customer.ward, customer.district, customer.province].filter(Boolean).join(', ');
    return [
      '🛒 <b>ĐƠN HÀNG MỚI — ĐỒ CÂU LK HÒA</b>',
      `Mã đơn: <b>${String(order.orderCode || '').replace(/[<>&]/g, '')}</b>`,
      `Khách: ${String(customer.fullName || '').replace(/[<>&]/g, '')}`,
      `Điện thoại: <a href="tel:${String(customer.phone || '').replace(/[^0-9+]/g, '')}">${String(customer.phone || '')}</a>`,
      `Địa chỉ: ${String(address || '').replace(/[<>&]/g, '')}`,
      '',
      '<b>Sản phẩm:</b>', items || '• Không có sản phẩm',
      '',
      `Tạm tính: <b>${Math.round(order.subtotal || 0).toLocaleString('vi-VN')}đ</b>`,
      `Phí ship: ${Math.round(order.shippingFee || 0).toLocaleString('vi-VN')}đ`,
      `Tổng thu: <b>${Math.round(order.total || 0).toLocaleString('vi-VN')}đ</b>`,
      `Thanh toán: ${order.paymentMethod === 'vietqr' ? 'VietQR' : 'COD'}`,
      `Giao dự kiến: ${String(order.estimatedDelivery || '')}`,
    ].join('\n');
  };

  const pushOrderToTelegramInternal = async (order: any, timeoutMs = 4500) => {
    const creds = resolveConnectorCredentials('telegram');
    if (!creds.token || !creds.chatId) return { ok: false as const, error: 'Chưa cấu hình Telegram Bot Token và Chat ID.' };
    try {
      const resp = await fetch(`https://api.telegram.org/bot${encodeURIComponent(creds.token)}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chat_id: creds.chatId, text: formatTelegramOrderMessage(order), parse_mode: 'HTML', disable_web_page_preview: true }),
        signal: AbortSignal.timeout(timeoutMs),
      });
      const data: any = await resp.json().catch(() => ({}));
      if (!resp.ok || data?.ok !== true) return { ok: false as const, error: data?.description || `Telegram trả về HTTP ${resp.status}` };
      return { ok: true as const };
    } catch (err: any) {
      return { ok: false as const, error: `Lỗi gửi Telegram: ${err?.message || 'Timeout'}` };
    }
  };

  const signAgentOrderStatusToken = (orderCode: string): string => {
    return crypto
      .createHmac('sha256', getSessionSecretKey())
      .update(`agent-order:${orderCode}`)
      .digest('base64url');
  };

  interface AgentRequestedItem {
    productId?: string;
    slug?: string;
    sku?: string;
    variantId?: string;
    quantity?: number;
    price?: number;
    name?: string;
    category?: string;
    variantLabel?: string;
    imageUrl?: string;
  }

  const resolveAuthoritativeItems = (rawItems: AgentRequestedItem[]): { ok: true; items: CartItem[] } | { ok: false; error: string } => {
    const activeProducts = loadServerProducts().filter((p) => p.status === 'active');
    const resolvedItems: CartItem[] = [];

    for (const raw of rawItems) {
      const qty = Math.min(99, Math.max(1, Math.round(Number(raw?.quantity) || 1)));
      if (!Number.isFinite(qty) || qty < 1) {
        return { ok: false, error: 'Số lượng sản phẩm không hợp lệ.' };
      }

      const skuLower = String(raw?.sku || '').trim().toLowerCase();
      const idTarget = String(raw?.productId || '').trim();
      const slugTarget = String(raw?.slug || '').trim();

      let matchedProduct: Product | undefined = activeProducts.find(
        (p) => (idTarget && p.id === idTarget) || (slugTarget && p.slug === slugTarget)
      );

      let matchedDetail = matchedProduct ? getProductDetailData(matchedProduct) : null;
      let matchedVariant = matchedDetail
        ? matchedDetail.variants.find(
            (v) =>
              (raw?.variantId && v.id === raw.variantId) ||
              (skuLower && v.sku.toLowerCase() === skuLower)
          )
        : undefined;

      if (!matchedProduct && skuLower) {
        for (const p of activeProducts) {
          const d = getProductDetailData(p);
          const v = d.variants.find((item) => item.sku.toLowerCase() === skuLower);
          if (v) {
            matchedProduct = p;
            matchedDetail = d;
            matchedVariant = v;
            break;
          }
        }
      }

      if (matchedProduct && matchedDetail) {
        const chosenVariant = matchedVariant || matchedDetail.variants[0];
        resolvedItems.push({
          key: `${matchedProduct.id}::${chosenVariant.id}`,
          productId: matchedProduct.id,
          slug: matchedProduct.slug,
          name: matchedProduct.name,
          category: matchedProduct.category,
          imageUrl: matchedProduct.imageUrl,
          variantId: chosenVariant.id,
          variantLabel: chosenVariant.label,
          sku: chosenVariant.sku,
          price: chosenVariant.price,
          originalPrice: chosenVariant.originalPrice,
          quantity: qty,
          shopeeUrl: matchedProduct.shopeeUrl,
          tiktokUrl: matchedProduct.tiktokUrl,
        });
      } else {
        // Fallback for custom items synced dynamically from external Google Sheet
        const fallbackPrice = Number(raw?.price);
        if (!Number.isFinite(fallbackPrice) || fallbackPrice <= 0 || !String(raw?.name || '').trim()) {
          return {
            ok: false,
            error: `Không tìm thấy sản phẩm hoặc SKU hợp lệ (${raw?.sku || raw?.slug || raw?.productId || 'không xác định'}).`,
          };
        }
        const safeId = idTarget || slugTarget || `custom_${resolvedItems.length + 1}`;
        const safeVariantId = String(raw?.variantId || 'default');
        resolvedItems.push({
          key: `${safeId}::${safeVariantId}`,
          productId: safeId,
          slug: slugTarget || safeId,
          name: String(raw.name).trim().slice(0, 180),
          category: String(raw?.category || 'Phụ Kiện').trim().slice(0, 60),
          imageUrl: typeof raw?.imageUrl === 'string' ? raw.imageUrl : undefined,
          variantId: safeVariantId,
          variantLabel: String(raw?.variantLabel || 'Tiêu chuẩn').trim().slice(0, 80),
          sku: String(raw?.sku || safeId).trim().slice(0, 64),
          price: Math.round(fallbackPrice),
          quantity: qty,
        });
      }
    }

    return { ok: true, items: resolvedItems };
  };

  const sanitizeOrderForPublicClient = (order: any) => {
    const { pancakeSyncError: _pe, webhookSyncError: _we, idempotencyKey: _ik, ...publicOrder } = order;
    return publicOrder;
  };

  const createVerifiedOrderRecord = async (params: {
    customer: any;
    paymentMethod: 'cod' | 'vietqr';
    rawItems: AgentRequestedItem[];
    couponCode?: string;
    orderCode?: string;
    idempotencyKey?: string;
    channel?: 'web' | 'b2a-agent';
    agentName?: string;
  }) => {
    const cleanPhone = normalizeVietnamesePhone(String(params.customer?.phone || ''));
    if (!/^0[35789][0-9]{8}$/.test(cleanPhone)) {
      return { ok: false as const, status: 400, error: 'Số điện thoại Việt Nam phải gồm đúng 10 chữ số hợp lệ.' };
    }
    const fullName = String(params.customer?.fullName || '').trim();
    if (fullName.length < 2) {
      return { ok: false as const, status: 400, error: 'Vui lòng nhập họ tên người nhận hàng.' };
    }
    const province = String(params.customer?.province || '').trim();
    const address = String(params.customer?.address || '').trim();
    if (!province || address.length < 4) {
      return { ok: false as const, status: 400, error: 'Vui lòng cung cấp đầy đủ Tỉnh/Thành phố và địa chỉ nhận hàng.' };
    }

    const itemRes = resolveAuthoritativeItems(params.rawItems);
    if ('error' in itemRes) {
      return { ok: false as const, status: 400, error: itemRes.error };
    }

    const orders = await loadOrdersStore();
    const idempotencyKey = params.idempotencyKey ? String(params.idempotencyKey).trim().slice(0, 96) : '';
    if (idempotencyKey) {
      const existing = orders.find((o) => o.idempotencyKey === idempotencyKey);
      if (existing) {
        return { ok: true as const, order: existing, deduplicated: true };
      }
    }

    const couponInput = String(params.couponCode || '').trim().toUpperCase();
    const totals = calculateCheckoutTotals(itemRes.items, couponInput, await loadManagedCoupons());
    const orderCode =
      typeof params.orderCode === 'string' && /^[A-Z0-9-]{5,24}$/.test(params.orderCode.trim())
        ? params.orderCode.trim()
        : generateOrderCode();

    const createdAt = new Date().toISOString();
    const record: any = {
      orderCode,
      createdAt,
      customer: {
        fullName: fullName.slice(0, 120),
        phone: cleanPhone,
        province: province.slice(0, 80),
        district: String(params.customer?.district || '').trim().slice(0, 80),
        ward: String(params.customer?.ward || '').trim().slice(0, 80),
        address: address.slice(0, 220),
        note: String(params.customer?.note || 'Cho kiểm tra hàng trước khi thanh toán').trim().slice(0, 240),
      },
      paymentMethod: params.paymentMethod === 'vietqr' ? 'vietqr' : 'cod',
      items: itemRes.items,
      subtotal: totals.subtotal,
      discountCode:
        totals.discountAmount > 0 || (couponInput === 'FREESHIP' && totals.isFreeship)
          ? couponInput
          : undefined,
      discountAmount: totals.discountAmount,
      shippingFee: totals.shippingFee,
      shippingReason: totals.shippingReason,
      total: totals.total,
      estimatedDelivery: estimateDeliveryWindow(province),
      status: 'confirmed',
      statusHistory: [{ status: 'confirmed', at: createdAt, source: params.channel || 'web' }],
      channel: params.channel || 'web',
      ...(params.agentName ? { agentName: String(params.agentName).trim().slice(0, 80) } : {}),
      ...(idempotencyKey ? { idempotencyKey } : {}),
    };

    orders.unshift(record);
    await saveOrdersStore(orders);

    // Run enabled auto-sync integrations and persist their outcomes before returning HTTP 201
    // (critical on serverless runtimes where background tasks terminate after res.json)
    await hydrateConnectorsConfig();
    const pancakeCreds = resolveConnectorCredentials('pancake');
    const webhookCreds = resolveConnectorCredentials('webhook');
    const telegramCreds = resolveConnectorCredentials('telegram');

    const syncTasks: Promise<void>[] = [];
    let syncedUpdates: Record<string, any> = {};

    if (pancakeCreds.connected && pancakeCreds.autoSync) {
      syncTasks.push(
        pushOrderToPancakeInternal(record, 4500).then((pRes) => {
          if (pRes.ok) {
            syncedUpdates = {
              ...syncedUpdates,
              pancakeOrderId: pRes.pancakeOrderId,
              pancakeSyncedAt: new Date().toISOString(),
              pancakeSyncError: undefined,
            };
          } else {
            syncedUpdates = {
              ...syncedUpdates,
              pancakeSyncError: pRes.error,
            };
          }
        })
      );
    }

    if (webhookCreds.connected && webhookCreds.autoSync) {
      syncTasks.push(
        pushOrderToWebhookInternal(record, 4500).then((wRes) => {
          if (wRes.ok) {
            syncedUpdates = {
              ...syncedUpdates,
              webhookSyncedAt: new Date().toISOString(),
              webhookSyncError: undefined,
            };
          } else {
            syncedUpdates = {
              ...syncedUpdates,
              webhookSyncError: wRes.error,
            };
          }
        })
      );
    }

    if (telegramCreds.connected && telegramCreds.autoSync) {
      syncTasks.push(
        pushOrderToTelegramInternal(record, 4500).then((tRes) => {
          syncedUpdates = {
            ...syncedUpdates,
            telegramSyncedAt: tRes.ok ? new Date().toISOString() : undefined,
            telegramSyncError: tRes.ok ? undefined : tRes.error,
          };
        })
      );
    }

    if (syncTasks.length > 0) {
      await Promise.allSettled(syncTasks);
      const latest = await loadOrdersStore();
      const idx = latest.findIndex((o) => o.orderCode === record.orderCode);
      if (idx !== -1) {
        const merged = {
          ...latest[idx],
          ...syncedUpdates,
          updatedAt: new Date().toISOString(),
        };
        latest[idx] = merged;
        await saveOrdersStore(latest);
        return { ok: true as const, order: merged, deduplicated: false };
      }
    }

    return { ok: true as const, order: record, deduplicated: false };
  };

  app.post('/api/orders', async (req, res) => {
    try {
      const order = req.body;
      if (!order || !Array.isArray(order.items) || order.items.length === 0 || !order.customer) {
        return res.status(400).json({ error: 'Thông tin đơn hàng hoặc giỏ hàng không hợp lệ.' });
      }
      const result = await createVerifiedOrderRecord({
        customer: order.customer,
        paymentMethod: order.paymentMethod === 'vietqr' ? 'vietqr' : 'cod',
        rawItems: order.items,
        couponCode: order.discountCode || order.couponCode || '',
        orderCode: order.orderCode,
        idempotencyKey: order.idempotencyKey,
        channel: 'web',
      });
      if (!result.ok) {
        return res.status(result.status).json({ error: result.error });
      }
      return res.status(result.deduplicated ? 200 : 201).json({
        success: true,
        deduplicated: result.deduplicated,
        order: sanitizeOrderForPublicClient(result.order),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Không thể lưu đơn hàng.' });
    }
  });

  app.get('/api/orders', requireAdmin, async (_req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      const orders = await loadOrdersStore();
      return res.json({ success: true, count: orders.length, orders });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/orders/:orderCode', requireAdmin, async (req, res) => {
    try {
      const orders = await loadOrdersStore();
      const found = orders.find((o) => o.orderCode === req.params.orderCode);
      if (!found) return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
      return res.json({ success: true, order: found });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  const ALLOWED_ORDER_STATUSES = new Set(['pending', 'confirmed', 'packing', 'shipping', 'delivered', 'cancelled']);
  const ALLOWED_CARRIERS = new Set(['ghn', 'ghtk', 'viettelpost', 'manual']);

  app.patch('/api/orders/:orderCode', requireAdmin, async (req, res) => {
    try {
      const orders = await loadOrdersStore();
      const idx = orders.findIndex((o) => o.orderCode === req.params.orderCode);
      if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });

      const { status, shippingCarrier, trackingCode, packageWeightGrams } = req.body || {};
      const nextOrder: Record<string, any> = { ...orders[idx], updatedAt: new Date().toISOString() };

      if (typeof status === 'string') {
        if (!ALLOWED_ORDER_STATUSES.has(status)) return res.status(400).json({ error: 'Trạng thái đơn hàng không hợp lệ.' });
        if (status !== orders[idx].status) {
          nextOrder.statusHistory = [
            ...(Array.isArray(orders[idx].statusHistory) ? orders[idx].statusHistory : []),
            { status, at: nextOrder.updatedAt, source: 'admin' },
          ];
        }
        nextOrder.status = status;
      }
      if (typeof shippingCarrier === 'string') {
        if (!ALLOWED_CARRIERS.has(shippingCarrier)) return res.status(400).json({ error: 'Đơn vị vận chuyển không hợp lệ.' });
        nextOrder.shippingCarrier = shippingCarrier;
      }
      if (typeof trackingCode === 'string') nextOrder.trackingCode = trackingCode.trim().slice(0, 64);
      if (typeof packageWeightGrams === 'number' && Number.isFinite(packageWeightGrams) && packageWeightGrams > 0) {
        nextOrder.packageWeightGrams = Math.round(packageWeightGrams);
      }

      orders[idx] = nextOrder;
      await saveOrdersStore(orders);
      return res.json({ success: true, order: nextOrder });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Không thể cập nhật đơn hàng.' });
    }
  });

  // POS & Shipping Connectors Management API
  app.get('/api/connectors', requireAdmin, async (_req, res) => {
    await hydrateConnectorsConfig();
    res.setHeader('Cache-Control', 'no-store');
    return res.json({
      success: true,
      connectors: ALLOWED_CONNECTORS.map((p) => buildConnectorSummary(p)),
    });
  });

  app.post('/api/connectors/:provider', requireAdmin, async (req, res) => {
    try {
      const provider = req.params.provider as ConnectorProvider;
      if (!ALLOWED_CONNECTORS.includes(provider)) return res.status(400).json({ error: 'Cổng kết nối không hợp lệ.' });

      await hydrateConnectorsConfig();
      const { token, shopId, warehouseId, webhookUrl, chatId, autoSync } = req.body || {};
      const allCfg = loadConnectorsConfig();
      const prevCfg = allCfg[provider] || {};

      if (provider === 'webhook') {
        const cleanWebhook = String(webhookUrl || '').trim();
        const check = isSafeExternalHttpsUrl(cleanWebhook);
        if ('reason' in check) return res.status(400).json({ error: check.reason });
      }

      const cleanToken = typeof token === 'string' ? token.trim() : '';
      if (cleanToken) runtimeConnectorTokens.set(provider, cleanToken);

      const nextCfg: StoredConnectorConfig = {
        ...prevCfg,
        autoSync: typeof autoSync === 'boolean' ? autoSync : Boolean(prevCfg.autoSync),
        shopId: typeof shopId === 'string' ? shopId.trim().slice(0, 80) : prevCfg.shopId,
        warehouseId: typeof warehouseId === 'string' ? warehouseId.trim().slice(0, 80) : prevCfg.warehouseId,
        webhookUrl:
          provider === 'webhook' && typeof webhookUrl === 'string'
            ? webhookUrl.trim().slice(0, 300)
            : prevCfg.webhookUrl,
        chatId:
          provider === 'telegram' && typeof chatId === 'string'
            ? chatId.trim().slice(0, 120)
            : prevCfg.chatId,
        maskedToken: cleanToken ? maskSecretToken(cleanToken) : prevCfg.maskedToken,
        encryptedToken: cleanToken ? encryptConnectorToken(cleanToken) : prevCfg.encryptedToken,
      };

      allCfg[provider] = nextCfg;
      await saveConnectorsConfig(allCfg);

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
      if (!ALLOWED_CONNECTORS.includes(provider)) return res.status(400).json({ error: 'Cổng kết nối không hợp lệ.' });

      await hydrateConnectorsConfig();
      const creds = resolveConnectorCredentials(provider);
      let ok = false;
      let message = '';

      if (provider === 'pancake') {
        if (!creds.token) return res.status(400).json({ error: 'Vui lòng nhập API Key Pancake POS trước khi kiểm tra.' });
        const resp = await fetch(`https://pos.pages.fm/api/v1/shops?api_key=${encodeURIComponent(creds.token)}`, {
          signal: AbortSignal.timeout(8000),
        });
        const data: any = await resp.json().catch(() => ({}));
        if (resp.ok && data?.success !== false && Array.isArray(data?.shops)) {
          const matchedShop = creds.shopId ? data.shops.find((s: any) => String(s.id) === String(creds.shopId)) : data.shops[0];
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
        if (!creds.token) return res.status(400).json({ error: 'Vui lòng nhập Token GHN trước khi kiểm tra.' });
        const resp = await fetch('https://online-gateway.ghn.vn/shiip/public-api/v2/shop/all', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Token: creds.token },
          body: JSON.stringify({ offset: 0, limit: 50, client_phone: '' }),
          signal: AbortSignal.timeout(8000),
        });
        const data: any = await resp.json().catch(() => ({}));
        if (resp.ok && data?.code === 200) {
          ok = true;
          message = `Kết nối GHN thành công (${(data?.data?.shops || []).length} cửa hàng hoạt động).`;
        } else {
          ok = false;
          message = data?.message || `GHN từ chối kết nối (HTTP ${resp.status}).`;
        }
      } else if (provider === 'ghtk') {
        if (!creds.token) return res.status(400).json({ error: 'Vui lòng nhập API Token GHTK trước khi kiểm tra.' });
        const resp = await fetch(
          'https://services.giaohangtietkiem.vn/services/shipment/fee?pick_province=Ngh%E1%BB%87+An&pick_district=Huy%E1%BB%87n+Ngh%C4%A9a+%C4%90%C3%A0n&province=H%C3%A0+N%E1%BB%99i&district=Qu%E1%BA%ADn+C%E1%BA%A7u+Gi%E1%BA%A5y&weight=500',
          { headers: { Token: creds.token }, signal: AbortSignal.timeout(8000) }
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
        if (!creds.token) return res.status(400).json({ error: 'Vui lòng nhập Token Viettel Post trước khi kiểm tra.' });
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
        if (!creds.webhookUrl) return res.status(400).json({ error: 'Vui lòng nhập Webhook URL trước khi kiểm tra.' });
        const safeCheck = isSafeExternalHttpsUrl(creds.webhookUrl);
        if ('reason' in safeCheck) return res.status(400).json({ error: safeCheck.reason });

        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'User-Agent': 'DocauLKHoa-OrderWebhook/1.0',
        };
        if (creds.token) headers['X-Webhook-Secret'] = creds.token;
        const resp = await fetch(safeCheck.url.toString(), {
          method: 'POST',
          headers,
          redirect: 'error',
          body: JSON.stringify({ event: 'lkhoa.ping', shop: 'Đồ Câu LK Hòa', timestamp: new Date().toISOString() }),
          signal: AbortSignal.timeout(8000),
        });
        ok = resp.ok;
        message = ok ? `Ping Webhook thành công (HTTP ${resp.status}).` : `Webhook trả về HTTP ${resp.status}.`;
      } else if (provider === 'telegram') {
        if (!creds.token || !creds.chatId) return res.status(400).json({ error: 'Vui lòng nhập Telegram Bot Token và Chat ID trước khi kiểm tra.' });
        const resp = await fetch(`https://api.telegram.org/bot${encodeURIComponent(creds.token)}/getMe`, { signal: AbortSignal.timeout(8000) });
        const data: any = await resp.json().catch(() => ({}));
        ok = resp.ok && data?.ok === true;
        message = ok ? `Telegram kết nối thành công · Bot: @${data?.result?.username || data?.result?.first_name || 'đã xác thực'}.` : (data?.description || `Telegram trả về HTTP ${resp.status}.`);
      }

      const allCfg = loadConnectorsConfig();
      allCfg[provider] = {
        ...(allCfg[provider] || {}),
        lastTestedAt: new Date().toISOString(),
        lastTestOk: ok,
        lastTestMessage: message,
      };
      await saveConnectorsConfig(allCfg);

      return res.status(ok ? 200 : 502).json({
        success: ok,
        message,
        connector: buildConnectorSummary(provider),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Lỗi khi kiểm tra kết nối.' });
    }
  });

  app.delete('/api/connectors/:provider', requireAdmin, async (req, res) => {
    try {
      const provider = req.params.provider as ConnectorProvider;
      if (!ALLOWED_CONNECTORS.includes(provider)) return res.status(400).json({ error: 'Cổng kết nối không hợp lệ.' });

      await hydrateConnectorsConfig();
      runtimeConnectorTokens.delete(provider);
      const allCfg = loadConnectorsConfig();
      allCfg[provider] = {
        ...(allCfg[provider] || {}),
        autoSync: false,
        maskedToken: undefined,
        encryptedToken: undefined,
        webhookUrl: provider === 'webhook' ? undefined : allCfg[provider]?.webhookUrl,
        lastTestOk: undefined,
        lastTestMessage: 'Đã ngắt kết nối bởi quản trị viên.',
      };
      await saveConnectorsConfig(allCfg);
      return res.json({ success: true, connector: buildConnectorSummary(provider) });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Không thể ngắt kết nối.' });
    }
  });

  app.post('/api/pos/pancake/push-order', requireAdmin, async (req, res) => {
    try {
      const { orderCode } = req.body || {};
      if (!orderCode) return res.status(400).json({ error: 'Thiếu mã đơn hàng.' });
      await hydrateConnectorsConfig();
      const orders = await loadOrdersStore();
      const idx = orders.findIndex((o) => o.orderCode === orderCode);
      if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });

      const result = await pushOrderToPancakeInternal(orders[idx]);
      if (!result.ok) {
        const failedOrder = {
          ...orders[idx],
          pancakeSyncError: result.error,
          updatedAt: new Date().toISOString(),
        };
        orders[idx] = failedOrder;
        await saveOrdersStore(orders);
        return res.status(result.status).json({ error: result.error, order: failedOrder });
      }

      const updatedOrder = {
        ...orders[idx],
        pancakeOrderId: result.pancakeOrderId,
        pancakeSyncedAt: new Date().toISOString(),
        pancakeSyncError: undefined,
        updatedAt: new Date().toISOString(),
      };
      orders[idx] = updatedOrder;
      await saveOrdersStore(orders);

      return res.json({ success: true, pancakeOrderId: result.pancakeOrderId, order: updatedOrder });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Lỗi kết nối Pancake POS.' });
    }
  });

  app.get('/api/shipping/status', requireAdmin, async (_req, res) => {
    await hydrateConnectorsConfig();
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

      await hydrateConnectorsConfig();
      const orders = await loadOrdersStore();
      const idx = orders.findIndex((o) => o.orderCode === orderCode);
      if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });

      const order = orders[idx];
      const codAmount = order.paymentMethod === 'cod' ? Math.round(order.total || 0) : 0;
      const fullAddress = [
        order.customer.address,
        order.customer.ward,
        order.customer.district,
        order.customer.province,
      ]
        .filter(Boolean)
        .join(', ');
      const noteText = order.customer.note || 'Đồ câu LK Hòa - Đóng ống nhựa PVC, cho khách đồng kiểm.';

      if (
        (carrier === 'ghn' || carrier === 'ghtk') &&
        (!String(order.customer?.district || '').trim() || !String(order.customer?.ward || '').trim())
      ) {
        return res.status(400).json({
          error: `Đơn #${order.orderCode} đang thiếu Quận/Huyện hoặc Phường/Xã nên không thể tạo vận đơn ${carrier.toUpperCase()}.`,
        });
      }

      let trackingCode = '';

      if (carrier === 'ghn') {
        const ghnCreds = resolveConnectorCredentials('ghn');
        if (!ghnCreds.token || !ghnCreds.shopId) {
          return res.status(400).json({
            error: 'Chưa kết nối GHN (nhập Token & Shop ID trong tab Kết nối POS/Vận chuyển hoặc cài Secret GHN_TOKEN, GHN_SHOP_ID).',
            missingEnv: ['GHN_TOKEN', 'GHN_SHOP_ID'],
          });
        }
        const ghnResp = await fetch('https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Token: ghnCreds.token, ShopId: String(ghnCreds.shopId) },
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
          headers: { 'Content-Type': 'application/json', Token: ghtkToken },
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
          headers: { 'Content-Type': 'application/json', Token: vtpToken },
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
        statusHistory: [
          ...(Array.isArray(order.statusHistory) ? order.statusHistory : []),
          { status: 'shipping', at: new Date().toISOString(), source: carrier },
        ],
        shippingCarrier: carrier,
        trackingCode,
        packageWeightGrams: Math.round(Number(weightGrams) || 700),
        pushedToCarrierAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      orders[idx] = updatedOrder;
      await saveOrdersStore(orders);

      return res.json({ success: true, order: updatedOrder, trackingCode });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Lỗi kết nối API đơn vị vận chuyển.' });
    }
  });

  app.post('/api/pos/pancake/webhook', async (req, res) => {
    try {
      const expectedSecret = String(process.env.PANCAKE_WEBHOOK_SECRET || '').trim();
      if (!expectedSecret) {
        return res.status(503).json({ error: 'Pancake webhook chưa được cấu hình.' });
      }
      const providedSecret = String(req.headers['x-webhook-secret'] || req.query.secret || '').trim();
      if (!safeCompare(providedSecret, expectedSecret)) {
        return res.status(401).json({ error: 'Invalid webhook secret' });
      }

      const body = req.body || {};
      const eventData = Array.isArray(body)
        ? body[0]
        : Array.isArray(body.data)
          ? body.data[0]
          : body.data || body.order || body;
      const pancakeOrderId = String(eventData?.id || eventData?.order_id || eventData?.system_id || '').trim();
      const orderCode = String(eventData?.custom_id || eventData?.order_code || eventData?.client_order_code || '').trim();
      if (!pancakeOrderId && !orderCode) {
        return res.status(400).json({ error: 'Webhook không có mã đơn Pancake hoặc custom_id.' });
      }

      const orders = await loadOrdersStore();
      const idx = orders.findIndex(
        (order) =>
          (orderCode && order.orderCode === orderCode) ||
          (pancakeOrderId && String(order.pancakeOrderId || '') === pancakeOrderId)
      );
      if (idx === -1) return res.status(404).json({ error: 'Order not found' });

      const pancakeStatus = Number(eventData?.status);
      const statusMap: Record<number, string> = {
        0: 'confirmed',
        1: 'confirmed',
        2: 'shipping',
        3: 'delivered',
        6: 'cancelled',
        7: 'cancelled',
        8: 'packing',
        9: 'packing',
        11: 'confirmed',
        12: 'packing',
        13: 'packing',
        16: 'delivered',
        17: 'confirmed',
        20: 'confirmed',
      };
      const mappedStatus = statusMap[pancakeStatus] || orders[idx].status;
      const now = new Date().toISOString();
      const statusChanged = mappedStatus !== orders[idx].status;
      const partner = eventData?.partner || {};
      const trackingCode = String(
        partner?.extend_code || partner?.tracking_id || eventData?.tracking_code || orders[idx].trackingCode || ''
      ).trim();

      orders[idx] = {
        ...orders[idx],
        status: mappedStatus,
        pancakeOrderId: pancakeOrderId || orders[idx].pancakeOrderId,
        pancakeStatus: Number.isFinite(pancakeStatus) ? pancakeStatus : orders[idx].pancakeStatus,
        pancakeStatusName: String(eventData?.status_name || '').trim() || orders[idx].pancakeStatusName,
        trackingCode: trackingCode || orders[idx].trackingCode,
        statusHistory: statusChanged
          ? [
              ...(Array.isArray(orders[idx].statusHistory) ? orders[idx].statusHistory : []),
              { status: mappedStatus, at: now, source: 'pancake' },
            ]
          : orders[idx].statusHistory,
        updatedAt: now,
      };
      await saveOrdersStore(orders);
      return res.json({ success: true, orderCode: orders[idx].orderCode, status: mappedStatus });
    } catch (err: any) {
      return res.status(500).json({ error: err?.message || 'Không thể xử lý webhook Pancake.' });
    }
  });

  app.post('/api/shipping/webhook/:carrier', async (req, res) => {
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

      if (!orderCode && !trackingCode) return res.status(400).json({ error: 'Missing orderCode or trackingCode' });

      const orders = await loadOrdersStore();
      const idx = orders.findIndex(
        (o) => (orderCode && o.orderCode === orderCode) || (trackingCode && o.trackingCode === trackingCode)
      );
      if (idx === -1) return res.status(404).json({ error: 'Order not found' });

      let mappedStatus = orders[idx].status;
      if (/delivered|finish|hoan_tat|5|501/.test(rawStatus)) mappedStatus = 'delivered';
      else if (/cancel|huy|6|-1/.test(rawStatus)) mappedStatus = 'cancelled';
      else if (/transport|delivering|picking|shipping|3|4/.test(rawStatus)) mappedStatus = 'shipping';

      const statusChanged = mappedStatus !== orders[idx].status;
      orders[idx] = {
        ...orders[idx],
        status: mappedStatus,
        statusHistory: statusChanged
          ? [
              ...(Array.isArray(orders[idx].statusHistory) ? orders[idx].statusHistory : []),
              { status: mappedStatus, at: new Date().toISOString(), source: req.params.carrier },
            ]
          : orders[idx].statusHistory,
        trackingCode: trackingCode || orders[idx].trackingCode,
        updatedAt: new Date().toISOString(),
      };
      await saveOrdersStore(orders);
      return res.json({ success: true, orderCode: orders[idx].orderCode, status: mappedStatus });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/shopee-prices', (_req, res) => {
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

  app.post('/api/shopee-prices/sync', async (_req, res) => {
    try {
      await syncShopeePricesInternal();
      return res.json({
        success: true,
        count: Object.keys(shopeePricesStore).length,
        prices: shopeePricesStore,
        message: `Đã đồng bộ thành công giá sale Shopee (${Object.keys(shopeePricesStore).length} sản phẩm).`,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/shopee-prices/update', (req, res) => {
    try {
      const { productId, slug, salePrice, originalPrice, isFlashSale } = req.body || {};
      if (!productId || typeof salePrice !== 'number' || salePrice <= 0) {
        return res.status(400).json({ error: 'Thiếu productId hoặc salePrice không hợp lệ' });
      }
      let discountPercent: number | undefined;
      if (originalPrice && originalPrice > salePrice) {
        discountPercent = Math.round(((originalPrice - salePrice) / originalPrice) * 100);
      }
      const record: RealtimeShopeePriceRecord = {
        productId,
        salePrice,
        originalPrice: originalPrice || undefined,
        discountPercent,
        isFlashSale: isFlashSale === true,
        syncedAt: new Date().toISOString(),
        source: 'shopee-realtime',
      };
      shopeePricesStore[productId] = record;
      if (slug) shopeePricesStore[slug] = record;
      saveShopeePrices();
      return res.json({ success: true, price: record });
    } catch (err: any) {
      return res.status(500).json({ error: err.message });
    }
  });

  // Google Sheet Proxy Sync API (restricted to docs.google.com HTTPS)
  app.get('/api/sync-sheet', async (req, res) => {
    try {
      const rawUrl = (req.query.url as string) || '';
      if (!rawUrl) return res.status(400).json({ error: 'Thiếu url Google Sheet' });

      let parsedInput: URL;
      try {
        parsedInput = new URL(rawUrl.trim());
      } catch {
        return res.status(400).json({ error: 'URL Google Sheet không hợp lệ' });
      }
      if (parsedInput.protocol !== 'https:' || parsedInput.hostname !== 'docs.google.com') {
        return res.status(400).json({ error: 'Chỉ hỗ trợ đồng bộ trực tiếp từ docs.google.com' });
      }

      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
      let csvUrl = rawUrl.trim();
      if (csvUrl.includes('/pubhtml') || csvUrl.includes('/pub')) {
        if (csvUrl.includes('/pubhtml')) csvUrl = csvUrl.replace('/pubhtml', '/pub');
        if (!csvUrl.includes('output=csv')) csvUrl += csvUrl.includes('?') ? '&output=csv' : '?output=csv';
      } else {
        const docIdMatch = csvUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
        if (docIdMatch && docIdMatch[1]) {
          const docId = docIdMatch[1];
          if (docId === '1KO_7U5VJJNKBphq_NNM4MnwbsfDq1GEg6mRGxz4y3B8') {
            csvUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRoGVq7tIOSj8pAr-80FuQxNYY_JHVtyZdk6SJd59baBkVlMllh-hDwvm0Zen4FHAcmjtpYQPai9S_w/pub?output=csv&gid=0';
          } else {
            let gid = '0';
            const gidMatch = csvUrl.match(/[?&]gid=(\d+)/) || csvUrl.match(/#gid=(\d+)/);
            if (gidMatch && gidMatch[1]) gid = gidMatch[1];
            csvUrl = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv&gid=${gid}`;
          }
        }
      }

      const response = await fetch(csvUrl, {
        cache: 'no-store',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
          Accept: 'text/csv,text/plain,*/*',
        },
        signal: AbortSignal.timeout(10000),
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

  // Extract product image from Shopee affiliate link
  app.post('/api/extract-shopee-image', async (req, res) => {
    try {
      const { url } = req.body || {};
      if (!url || typeof url !== 'string') return res.status(400).json({ error: 'URL không hợp lệ' });

      const targetUrl = url.trim();
      let parsedStart: URL;
      try {
        parsedStart = new URL(targetUrl);
      } catch {
        return res.status(400).json({ error: 'Định dạng URL không hợp lệ' });
      }
      const allowedHost = (host: string) =>
        ['shopee.vn', 's.shopee.vn', 'shope.ee', 'susercontent.com', 'cf.shopee.vn'].some(
          (d) => host === d || host.endsWith('.' + d)
        );
      if (parsedStart.protocol !== 'https:' || !allowedHost(parsedStart.hostname.toLowerCase())) {
        return res.status(400).json({ error: 'Chỉ hỗ trợ liên kết Shopee chính thức' });
      }

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
        const curParsed = new URL(currentUrl);
        if (curParsed.protocol !== 'https:' || !allowedHost(curParsed.hostname.toLowerCase())) break;

        const response = await fetch(currentUrl, {
          redirect: 'manual',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.7',
          },
          signal: AbortSignal.timeout(8000),
        });

        const location = response.headers.get('location');
        if (response.status >= 300 && response.status < 400 && location) {
          currentUrl = location.startsWith('http') ? location : new URL(location, currentUrl).href;
          visitedUrls.push(currentUrl);
          redirectCount++;
        } else {
          htmlContent = await response.text();
          break;
        }
      }

      let shopid: string | null = null;
      let itemid: string | null = null;

      for (const u of visitedUrls) {
        const itemMatch1 = u.match(/i\.(\d+)\.(\d+)/);
        const itemMatch2 = u.match(/\/product\/(\d+)\/(\d+)/);
        if (itemMatch1) {
          shopid = itemMatch1[1];
          itemid = itemMatch1[2];
          break;
        } else if (itemMatch2) {
          shopid = itemMatch2[1];
          itemid = itemMatch2[2];
          break;
        }
      }

      if (shopid && itemid) {
        for (const apiUrl of [
          `https://shopee.vn/api/v4/item/get?itemid=${itemid}&shopid=${shopid}`,
          `https://shopee.vn/api/v2/item/get?itemid=${itemid}&shopid=${shopid}`,
        ]) {
          try {
            const apiRes = await fetch(apiUrl, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122.0.0.0 Safari/537.36',
                Referer: currentUrl,
                'X-Requested-With': 'XMLHttpRequest',
              },
              signal: AbortSignal.timeout(6000),
            });
            if (apiRes.ok) {
              const data = await apiRes.json();
              const imgHash = data?.data?.image || data?.item?.image || data?.data?.images?.[0];
              if (imgHash && typeof imgHash === 'string' && imgHash.length >= 20) {
                return res.json({ success: true, imageUrl: `https://down-vn.img.susercontent.com/file/${imgHash}` });
              }
            }
          } catch {
            // continue
          }
        }
      }

      if (htmlContent) {
        const ogMatch =
          htmlContent.match(/<meta[^>]*property=["']og:image["'][^>]*content=["']([^"']+)["']/i) ||
          htmlContent.match(/<meta[^>]*content=["']([^"']+)["'][^>]*property=["']og:image["']/i);
        if (ogMatch && ogMatch[1] && !ogMatch[1].includes('deo.shopeemobile.com')) {
          return res.json({ success: true, imageUrl: ogMatch[1] });
        }
      }

      return res.status(404).json({ error: 'Không tìm thấy ảnh sản phẩm từ link Shopee này.' });
    } catch (error: any) {
      return res.status(500).json({ error: error.message || 'Lỗi khi trích xuất ảnh Shopee.' });
    }
  });

  // ============================================================================
  // B2A (Business-to-Agent) Structured Commerce Endpoints
  // Enables AI shopping & procurement agents to discover, quote, checkout & track
  // ============================================================================
  app.use('/api/agent', (_req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Idempotency-Key');
    next();
  });

  app.options('/api/agent/*', (_req, res) => {
    return res.status(204).end();
  });

  app.get('/api/agent/manifest', (_req, res) => {
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.json({
      schemaVersion: '1.0',
      protocol: 'b2a-commerce',
      merchant: {
        name: STORE_NAME,
        domain: DOMAIN,
        address: STORE_ADDRESS,
        hotline: STORE_HOTLINE,
        currency: 'VND',
        country: 'VN',
      },
      shippingRules: {
        freeShippingThresholdVnd: FREESHIP_THRESHOLD,
        freeShippingForFishingRods: true,
        flatShippingFeeVnd: FLAT_SHIPPING_FEE,
        codInspectionAllowed: true,
      },
      returnPolicy: {
        returnWindowDays: 7,
        exchangeType: '1-to-1',
        policyUrl: `${DOMAIN}/chinh-sach-bao-hanh-doi-tra`,
      },
      availableCoupons: AVAILABLE_COUPONS,
      paymentMethods: ['cod', 'vietqr'],
      actions: {
        searchCatalog: {
          method: 'GET',
          endpoint: `${DOMAIN}/api/agent/catalog`,
          queryParams: ['q', 'category', 'maxPrice', 'freeShippingOnly', 'limit'],
        },
        quoteOrder: {
          method: 'POST',
          endpoint: `${DOMAIN}/api/agent/quote`,
          bodySchema: {
            items: [{ sku: 'string (or productId / slug)', variantId: 'optional string', quantity: 'number >= 1' }],
            couponCode: 'optional string (LKHOA10 | LKHOA30 | FREESHIP)',
            province: 'optional string (default: Nghệ An)',
          },
        },
        placeOrder: {
          method: 'POST',
          endpoint: `${DOMAIN}/api/agent/checkout`,
          bodySchema: {
            idempotencyKey: 'optional unique string for safe retries',
            agentName: 'optional string (e.g. ChatGPT-Shopping, Gemini-Agent)',
            paymentMethod: 'cod | vietqr',
            couponCode: 'optional string',
            customer: {
              fullName: 'string',
              phone: '10-digit Vietnamese phone starting with 03/05/07/08/09',
              province: 'string',
              district: 'string',
              ward: 'string',
              address: 'string',
              note: 'optional string',
            },
            items: [{ sku: 'string (or productId / slug)', variantId: 'optional string', quantity: 'number >= 1' }],
          },
        },
        trackOrderStatus: {
          method: 'GET',
          endpoint: `${DOMAIN}/api/agent/orders/{orderCode}/status`,
          queryParams: ['token (returned from checkout) OR phoneLast4'],
        },
      },
    });
  });

  app.get('/api/agent/catalog', (req, res) => {
    try {
      res.setHeader('Cache-Control', 'public, max-age=120');
      const q = String(req.query.q || '').trim().toLowerCase();
      const categoryFilter = String(req.query.category || '').trim().toLowerCase();
      const maxPrice = Number(req.query.maxPrice);
      const freeShippingOnly = req.query.freeShippingOnly === 'true';
      const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 30));

      const activeProducts = loadServerProducts().filter((p) => p.status === 'active');
      const catalog = activeProducts
        .map((product) => {
          const detail = getProductDetailData(product);
          const minPrice = Math.min(...detail.variants.map((v) => v.price));
          const maxVarPrice = Math.max(...detail.variants.map((v) => v.price));
          const isRod =
            product.category.toLowerCase().includes('cần') ||
            /\bcần\b/i.test(product.name);
          const freeShippingEligible = isRod || minPrice >= FREESHIP_THRESHOLD;
          const hasKnownStock = typeof detail.stockCount === 'number';
          const availability = hasKnownStock
            ? detail.stockCount! > 0
              ? 'in_stock'
              : 'out_of_stock'
            : 'available_to_order';

          return {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            category: product.category,
            url: `${DOMAIN}/san-pham/${product.slug}`,
            imageUrl: product.imageUrl || `${DOMAIN}/favicon.svg`,
            currency: 'VND',
            minPriceVnd: minPrice,
            maxPriceVnd: maxVarPrice,
            availability,
            ...(hasKnownStock ? { stockCount: detail.stockCount } : {}),
            ...(typeof detail.rating === 'number'
              ? { rating: Number(detail.rating.toFixed(1)) }
              : {}),
            ...(typeof detail.reviewCount === 'number'
              ? { reviewCount: detail.reviewCount }
              : {}),
            freeShippingEligible,
            shippingFeeVnd: freeShippingEligible ? 0 : FLAT_SHIPPING_FEE,
            variants: detail.variants.map((v) => ({
              variantId: v.id,
              sku: v.sku,
              label: v.label,
              priceVnd: v.price,
              originalPriceVnd: v.originalPrice || null,
              stock: typeof v.stock === 'number' ? v.stock : null,
              inStock: typeof v.stock === 'number' ? v.stock > 0 : null,
            })),
            marketplaceAlternatives: {
              shopeeUrl: product.shopeeUrl || null,
              tiktokUrl: product.tiktokUrl || null,
            },
          };
        })
        .filter((entry) => {
          if (q && !entry.name.toLowerCase().includes(q) && !entry.category.toLowerCase().includes(q) && !entry.variants.some((v) => v.sku.toLowerCase().includes(q))) {
            return false;
          }
          if (categoryFilter && !entry.category.toLowerCase().includes(categoryFilter)) {
            return false;
          }
          if (Number.isFinite(maxPrice) && maxPrice > 0 && entry.minPriceVnd > maxPrice) {
            return false;
          }
          if (freeShippingOnly && !entry.freeShippingEligible) {
            return false;
          }
          return true;
        });

      return res.json({
        success: true,
        currency: 'VND',
        totalMatched: catalog.length,
        returned: Math.min(catalog.length, limit),
        items: catalog.slice(0, limit),
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Không thể tải danh mục B2A.' });
    }
  });

  app.post('/api/agent/quote', async (req, res) => {
    try {
      const { items, couponCode = '', province = 'Nghệ An' } = req.body || {};
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ error: 'Danh sách items không được để trống.' });
      }
      const resolved = resolveAuthoritativeItems(items);
      if ('error' in resolved) {
        return res.status(400).json({ error: resolved.error });
      }
      const cleanCoupon = String(couponCode || '').trim().toUpperCase();
      // Quote must use the same managed coupon set as checkout. Otherwise an
      // admin-created campaign can appear on the homepage but be ignored by
      // B2A agents when they ask for a pre-checkout total.
      const totals = calculateCheckoutTotals(resolved.items, cleanCoupon, await loadManagedCoupons());
      return res.json({
        success: true,
        currency: 'VND',
        province: String(province || 'Nghệ An'),
        estimatedDelivery: estimateDeliveryWindow(String(province || 'Nghệ An')),
        items: resolved.items.map((i) => ({
          sku: i.sku,
          productId: i.productId,
          slug: i.slug,
          name: i.name,
          variantId: i.variantId,
          variantLabel: i.variantLabel,
          quantity: i.quantity,
          unitPriceVnd: i.price,
          lineTotalVnd: i.price * i.quantity,
        })),
        subtotalVnd: totals.subtotal,
        appliedCoupon: totals.discountAmount > 0 || (cleanCoupon === 'FREESHIP' && totals.isFreeship) ? cleanCoupon : null,
        discountVnd: totals.discountAmount,
        shippingFeeVnd: totals.shippingFee,
        shippingReason: totals.shippingReason,
        totalVnd: totals.total,
        availablePaymentMethods: ['cod', 'vietqr'],
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Không thể tính báo giá đơn hàng.' });
    }
  });

  app.post('/api/agent/checkout', async (req, res) => {
    try {
      const { customer, items, paymentMethod = 'cod', couponCode = '', idempotencyKey, agentName } = req.body || {};
      if (!Array.isArray(items) || items.length === 0 || !customer) {
        return res.status(400).json({ error: 'Yêu cầu customer và danh sách items hợp lệ.' });
      }
      const headerIdempotency = String(req.headers['idempotency-key'] || '').trim();
      const result = await createVerifiedOrderRecord({
        customer,
        paymentMethod: paymentMethod === 'vietqr' ? 'vietqr' : 'cod',
        rawItems: items,
        couponCode,
        idempotencyKey: idempotencyKey || headerIdempotency,
        channel: 'b2a-agent',
        agentName: agentName || 'External-B2A-Agent',
      });
      if (!result.ok) {
        return res.status(result.status).json({ error: result.error });
      }
      const order = result.order;
      const statusLookupToken = signAgentOrderStatusToken(order.orderCode);
      return res.status(result.deduplicated ? 200 : 201).json({
        success: true,
        deduplicated: result.deduplicated,
        orderCode: order.orderCode,
        status: order.status,
        currency: 'VND',
        subtotalVnd: order.subtotal,
        discountVnd: order.discountAmount,
        shippingFeeVnd: order.shippingFee,
        totalVnd: order.total,
        paymentMethod: order.paymentMethod,
        vietqrUrl: order.paymentMethod === 'vietqr' ? buildVietQrImageUrl(order.total, order.orderCode) : null,
        estimatedDelivery: order.estimatedDelivery,
        statusLookupToken,
        statusEndpoint: `${DOMAIN}/api/agent/orders/${order.orderCode}/status?token=${encodeURIComponent(statusLookupToken)}`,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Không thể tạo đơn hàng B2A.' });
    }
  });

  app.get('/api/agent/orders/:orderCode/status', async (req, res) => {
    try {
      res.setHeader('Cache-Control', 'no-store');
      const orderCode = String(req.params.orderCode || '').trim();
      const token = String(req.query.token || '').trim();
      const phoneLast4 = String(req.query.phoneLast4 || '').trim();

      const orders = await loadOrdersStore();
      const found = orders.find((o) => o.orderCode === orderCode);
      if (!found) {
        return res.status(404).json({ error: 'Không tìm thấy đơn hàng.' });
      }

      const expectedToken = signAgentOrderStatusToken(orderCode);
      const tokenOk = token.length > 0 && safeCompare(token, expectedToken);
      const phoneOk =
        /^[0-9]{4}$/.test(phoneLast4) &&
        typeof found.customer?.phone === 'string' &&
        found.customer.phone.endsWith(phoneLast4);

      if (!tokenOk && !phoneOk) {
        return res.status(401).json({ error: 'Thiếu token xác thực hoặc 4 số cuối điện thoại.' });
      }

      return res.json({
        success: true,
        orderCode: found.orderCode,
        status: found.status,
        paymentMethod: found.paymentMethod,
        totalVnd: found.total,
        shippingFeeVnd: found.shippingFee,
        trackingCode: found.trackingCode || null,
        shippingCarrier: found.shippingCarrier || null,
        statusHistory: Array.isArray(found.statusHistory) ? found.statusHistory : [],
        estimatedDelivery: found.estimatedDelivery,
        createdAt: found.createdAt,
        updatedAt: found.updatedAt || found.createdAt,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Không thể tra cứu trạng thái đơn hàng.' });
    }
  });

  return app;
}
