import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createApiApp } from '../src/server/createApiApp';

const apiApp = createApiApp();

export default function handler(req: VercelRequest, res: VercelResponse) {
  return apiApp(req as any, res as any);
}
