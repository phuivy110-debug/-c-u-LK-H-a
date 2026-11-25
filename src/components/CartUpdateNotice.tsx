import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { useCart } from '../utils/CartContext';

export function CartUpdateNotice({ compact = false }: { compact?: boolean }) {
  const { cartNotice, clearCartNotice } = useCart();
  if (!cartNotice) return null;

  return (
    <div
      role="status"
      className={`flex items-start gap-2 rounded-xl border border-amber-500/50 bg-amber-500/10 text-amber-100 ${compact ? 'p-3 text-xs' : 'p-4 text-sm'}`}
    >
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FACC15]" aria-hidden="true" />
      <p className="flex-1 leading-relaxed">{cartNotice}</p>
      <button
        type="button"
        onClick={clearCartNotice}
        aria-label="Đóng thông báo cập nhật giỏ hàng"
        className="flex min-h-8 min-w-8 items-center justify-center rounded-lg text-amber-200 hover:bg-amber-500/15 hover:text-white"
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
