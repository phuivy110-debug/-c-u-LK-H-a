import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApiApp } from '../src/server/createApiApp';

let cachedApp: ReturnType<typeof createApiApp> | null = null;

function getApiApp() {
  if (!cachedApp) {
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
