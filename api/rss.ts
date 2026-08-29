import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  generateRssXml,
  loadServerProducts,
} from '../src/utils/serverSeoRenderer';

export default function handler(_req: VercelRequest, res: VercelResponse) {
  res.setHeader('Content-Type', 'application/rss+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=3600, stale-while-revalidate=86400');
  return res.status(200).send(generateRssXml(loadServerProducts()));
}
