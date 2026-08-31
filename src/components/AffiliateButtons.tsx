import React from 'react';
import { ExternalLink } from 'lucide-react';
import type { Product } from '../types';
import { trackAffiliateClick, type AffiliateContext } from '../utils/analyticsService';
import { SHARED_TIKTOK_URL, SHOPEE_HOSTNAMES } from '../utils/googleSheetSync';

export const TIKTOK_HOSTNAMES = ['tiktok.com', 'vt.tiktok.com', 'shop.tiktok.com', 'www.tiktok.com', 'm.tiktok.com'];
export function validateAffiliateUrl(rawUrl: string | undefined | null, platform: 'shopee' | 'tiktok'): string | undefined {
  if (typeof rawUrl !== 'string' || !/^https?:\/\//.test(rawUrl.trim())) return undefined;
  try {
    const parsed = new URL(rawUrl.trim());
    const hosts = platform === 'shopee' ? SHOPEE_HOSTNAMES : TIKTOK_HOSTNAMES;
    if (hosts.some(host => parsed.hostname === host || parsed.hostname.endsWith('.' + host))) return rawUrl.trim();
  } catch { /* Invalid destinations are never rendered as purchase links. */ }
  return undefined;
}

type Props = AffiliateContext & {
  productId?: string; productName?: string; shopeeUrl?: string; tiktokUrl?: string;
  tiktokLinkStatus?: Product['tiktokLinkStatus']; compact?: boolean;
};
export function AffiliateButtons({ productId, productName, shopeeUrl, tiktokUrl, tiktokLinkStatus,
  compact = false, placement = 'product_detail', articleSlug }: Props) {
  const shopee = validateAffiliateUrl(shopeeUrl, 'shopee');
  const tiktok = validateAffiliateUrl(tiktokUrl, 'tiktok') || SHARED_TIKTOK_URL;
  const directTikTok = tiktokLinkStatus === 'verified-product' && tiktok !== SHARED_TIKTOK_URL;
  const context = { placement, articleSlug };
  return <div data-affiliate-tracked="true" className={`grid gap-2 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
    {shopee ? <a href={shopee} target="_blank" rel="sponsored nofollow noopener noreferrer"
      aria-label={`Xem ${productName || 'sản phẩm'} trên Shopee`}
      onClick={event => { event.stopPropagation(); trackAffiliateClick('shopee', shopee, productId, productName, { ...context, destinationType: 'product' }); }}
      className="min-h-11 px-3 py-3 rounded-xl bg-[#EE4D2D] hover:bg-orange-700 text-white text-sm font-bold flex items-center justify-center gap-1.5 text-center">
      Xem trên Shopee <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
    </a> : <span className="text-sm text-slate-600 py-3">Chưa có link sản phẩm Shopee</span>}
    <a href={tiktok} target="_blank" rel="sponsored nofollow noopener noreferrer"
      onClick={event => { event.stopPropagation(); trackAffiliateClick('tiktok', tiktok, productId, productName, { ...context, destinationType: directTikTok ? 'product' : 'store' }); }}
      className="min-h-11 px-3 py-3 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-sm font-semibold flex items-center justify-center gap-1.5 text-center">
      {directTikTok ? 'Xem trên TikTok' : 'Gian hàng TikTok'} <ExternalLink aria-hidden="true" className="w-3.5 h-3.5 shrink-0" />
    </a>
  </div>;
}
