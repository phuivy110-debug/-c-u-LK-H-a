import React from 'react';
import { RefreshCw } from 'lucide-react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <article
      aria-hidden="true"
      className="product-card-container relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-[#111827] animate-pulse"
    >
      <div className="skeleton-shimmer relative aspect-square w-full bg-slate-800/80 overflow-hidden" />
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        <div className="mb-2 h-3 w-28 rounded bg-slate-800" />
        <div className="mb-1.5 h-4 w-11/12 rounded bg-slate-800" />
        <div className="mb-4 h-4 w-3/4 rounded bg-slate-800/70" />
        <div className="mt-auto space-y-2.5 border-t border-slate-800 pt-3">
          <div className="h-6 w-28 rounded bg-slate-800" />
          <div className="grid grid-cols-2 gap-2">
            <div className="h-11 rounded-lg bg-emerald-950/60" />
            <div className="h-11 rounded-lg bg-slate-800" />
          </div>
        </div>
      </div>
    </article>
  );
};

export interface ProductSkeletonGridProps {
  count?: number;
  message?: string;
  showHeader?: boolean;
  className?: string;
}

export const ProductSkeletonGrid: React.FC<ProductSkeletonGridProps> = ({
  count = 8,
  message = 'Đang đồng bộ danh mục sản phẩm mới nhất từ Google Sheet...',
  showHeader = true,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`} role="status" aria-live="polite" aria-busy="true">
      {showHeader && message && (
        <div className="flex items-center justify-between rounded-xl bg-[#111827] border border-slate-800 px-4 py-2.5 text-xs text-slate-200">
          <div className="flex items-center gap-2.5 font-medium">
            <RefreshCw className="w-3.5 h-3.5 text-[#FACC15] animate-spin shrink-0" />
            <span>{message}</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
        {Array.from({ length: count }).map((_, idx) => (
          <ProductCardSkeleton key={`product-skeleton-${idx}`} />
        ))}
      </div>
      <span className="sr-only">Đang tải danh sách sản phẩm...</span>
    </div>
  );
};
