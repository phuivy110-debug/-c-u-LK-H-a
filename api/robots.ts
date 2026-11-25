import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);

export default function handler(_req: VercelRequest, res: VercelResponse) {
  const { generateRobotsTxt } = require('./_bundled_seo.cjs');
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(generateRobotsTxt());
}
