Warning: truncated output (original token count: 26186)
Total output lines: 2548

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
 …24186 tokens truncated…discountAmount,
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
