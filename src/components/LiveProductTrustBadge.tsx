import React, { useMemo } from 'react';
import { Users, Flame, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface LiveProductTrustBadgeProps {
  productId: string;
  variant?: 'compact' | 'full' | 'inline';
}

export const LiveProductTrustBadge: React.FC<LiveProductTrustBadgeProps> = ({
  productId,
  variant = 'inline',
}) => {
  // Deterministic organic viewers count between 8 and 36 based on product ID and current hour
  const viewerCount = useMemo(() => {
    let hash = 0;
    for (let i = 0; i < productId.length; i++) {
      hash = (hash << 5) - hash + productId.charCodeAt(i);
      hash |= 0;
    }
    const currentHour = new Date().getHours();
    const base = Math.abs(hash % 20) + 9;
    const hourBonus = currentHour >= 8 && currentHour <= 22 ? 6 : 0;
    return base + hourBonus;
  }, [productId]);

  if (variant === 'compact') {
    return (
      <div className="inline-flex items-center gap-1.5 bg-orange-500/10 text-orange-700 border border-orange-200/80 px-2 py-0.5 rounded-md text-[10px] font-bold">
        <Flame className="w-3 h-3 text-orange-500 fill-orange-500 animate-pulse" />
        <span>{viewerCount} đang xem</span>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <div className="bg-gradient-to-r from-orange-50 via-amber-50 to-emerald-50 border border-orange-200/80 rounded-2xl p-3 sm:p-3.5 space-y-2">
        <div className="flex items-center justify-between gap-2 flex-wrap text-xs">
          <div className="flex items-center gap-1.5 font-bold text-orange-900">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <Flame className="w-4 h-4 text-[#EE4D2D] fill-[#EE4D2D]" />
            <span>{viewerCount} cần thủ đang cùng xem sản phẩm này</span>
          </div>
          <div className="flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Hàng chính hãng 100%</span>
          </div>
        </div>

        <div className="text-[11px] text-slate-600 flex items-center justify-between gap-2 border-t border-orange-100/80 pt-2">
          <span>✔️ Hơn 2.400+ đơn hàng xuất xưởng LK Hòa</span>
          <span className="font-semibold text-orange-600">Shopee Mall & TikTok Shop</span>
        </div>
      </div>
    );
  }

  // Inline default
  return (
    <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200/60">
      <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
      <span>{viewerCount} người đang cùng xem</span>
    </div>
  );
};
