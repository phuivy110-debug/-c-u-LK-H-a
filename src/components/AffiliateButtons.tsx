import React from 'react';
import { ExternalLink } from 'lucide-react';
import { trackUserAction } from '../utils/analyticsService';
import { SHARED_TIKTOK_URL, SHOPEE_HOSTNAMES } from '../utils/googleSheetSync';

export const TIKTOK_HOSTNAMES = ['tiktok.com', 'vt.tiktok.com', 'shop.tiktok.com', 'www.tiktok.com', 'm.tiktok.com'];

export function validateAffiliateUrl(
  rawUrl: string | undefined | null,
  platform: 'shopee' | 'tiktok'
): string | undefined {
  if (!rawUrl || typeof rawUrl !== 'string') return undefined;
  const trimmed = rawUrl.trim();
  if (!trimmed) return undefined;

  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
    return undefined;
  }

  try {
    const parsed = new URL(trimmed);
    const hostname = parsed.hostname.toLowerCase();
    const validHostnames = platform === 'shopee' ? SHOPEE_HOSTNAMES : TIKTOK_HOSTNAMES;
    const isValidHost = validHostnames.some((valid) => hostname === valid || hostname.endsWith('.' + valid));

    if (isValidHost) {
      return trimmed;
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.901 2.89 2.893 2.893 0 0 1-2.89-2.89 2.893 2.893 0 0 1 2.89-2.89c.28 0 .543.044.793.122v-3.52a6.333 6.333 0 0 0-.793-.05A6.338 6.338 0 0 0 3.125 15.68 6.338 6.338 0 0 0 9.463 22a6.338 6.338 0 0 0 6.338-6.32V9.043a8.163 8.163 0 0 0 4.788 1.536V7.134a4.832 4.832 0 0 1-1.000-.448z" />
  </svg>
);

interface AffiliateButtonsProps {
  productId?: string;
  productName?: string;
  shopeeUrl?: string;
  tiktokUrl?: string;
  compact?: boolean;
}

export const AffiliateButtons: React.FC<AffiliateButtonsProps> = ({
  productId = 'product',
  productName = 'Sản phẩm',
  shopeeUrl,
  tiktokUrl,
  compact = false,
}) => {
  const validShopee = validateAffiliateUrl(shopeeUrl, 'shopee');
  const validTikTok = validateAffiliateUrl(tiktokUrl, 'tiktok') || SHARED_TIKTOK_URL;

  const handleShopeeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackUserAction(`Bấm Shopee [${productId}]: ${productName.slice(0, 25)}`);
  };

  const handleTikTokClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    trackUserAction(`Bấm TikTok [${productId}]: ${productName.slice(0, 25)}`);
  };

  if (compact) {
    return (
      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
        {validShopee ? (
          <a
            href={validShopee}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            onClick={handleShopeeClick}
            className="w-full bg-[#EE4D2D] hover:bg-[#d73a1c] text-white py-2 px-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs uppercase truncate no-underline"
            title={`Xem ${productName} trên Shopee`}
          >
            <span className="truncate">Xem trên Shopee</span>
            <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
          </a>
        ) : (
          <div className="w-full bg-slate-100 text-slate-500 py-2 px-1 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] text-center font-medium truncate flex items-center justify-center">
            Đang cập nhật link mua trực tiếp
          </div>
        )}

        <a
          href={validTikTok}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          onClick={handleTikTokClick}
          className="w-full bg-slate-900 hover:bg-black text-white py-2 px-1 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-xs uppercase truncate no-underline"
          title={`Xem gian hàng TikTok LK Hòa`}
        >
          <TikTokIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0 fill-current text-white" />
          <span className="truncate">Gian hàng TikTok</span>
          <ExternalLink className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
        </a>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full">
      {validShopee ? (
        <a
          href={validShopee}
          target="_blank"
          rel="sponsored nofollow noopener noreferrer"
          onClick={handleShopeeClick}
          className="w-full bg-[#EE4D2D] hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm py-2.5 sm:py-3 px-3 rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99] uppercase no-underline"
        >
          <span>Xem trên Shopee</span>
          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
        </a>
      ) : (
        <div className="w-full bg-slate-100 text-slate-500 font-semibold text-xs sm:text-sm py-2.5 sm:py-3 px-3 rounded-xl text-center flex items-center justify-center">
          Đang cập nhật link mua trực tiếp
        </div>
      )}

      <a
        href={validTikTok}
        target="_blank"
        rel="sponsored nofollow noopener noreferrer"
        onClick={handleTikTokClick}
        className="w-full bg-slate-900 hover:bg-black text-white font-extrabold text-xs sm:text-sm py-2.5 sm:py-3 px-3 rounded-xl shadow-md shadow-slate-900/20 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-[0.99] uppercase no-underline"
      >
        <TikTokIcon className="w-4 h-4 shrink-0 fill-current text-white" />
        <span>Xem gian hàng TikTok</span>
        <ExternalLink className="w-3.5 h-3.5 shrink-0" />
      </a>
    </div>
  );
};
