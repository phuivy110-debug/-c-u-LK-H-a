import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
let cachedApp: any = null;

function getApiApp() {
  if (!cachedApp) {
    const { createApiApp } = require('./_bundled_api.cjs');
    cachedApp = createApiApp();
  }
  return cachedApp;
}

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const app = getApiApp();
    return app(req as any, res as any);
  } catch (err: any) {
    console.error('Vercel API handler error:', err);
    return res.status(500).json({
      error: err?.message || 'Lỗi khởi tạo máy chủ API trên Vercel.',
    });
  }
}
