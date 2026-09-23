import React from 'react';
import { RefreshCw } from 'lucide-react';

export const ProductCardSkeleton: React.FC = () => {
  return (
    <article
      aria-hidden="true"
      className="product-card-container relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs sm:rounded-3xl animate-pulse"
    >
      {/* Product Image Thumbnail Placeholder */}
      <div className="skeleton-shimmer relative aspect-square w-full bg-slate-200/70 overflow-hidden">
        {/* Subtle photo placeholder icon */}
        <div className="absolute inset-0 flex items-center justify-center text-slate-300">
          <svg
            className="w-10 h-10 sm:w-12 sm:h-12 opacity-40"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
            />
          </svg>
        </div>

        {/* Top-right badge placeholder */}
        <div className="absolute right-2 top-2 h-5 w-16 rounded-lg bg-slate-300/80" />
      </div>

      {/* Content Skeleton */}
      <div className="flex flex-1 flex-col p-3 sm:p-4">
        {/* Category line */}
        <div className="mb-2 h-3 w-20 rounded bg-slate-200/80" />

        {/* Title lines (2 lines) */}
        <div className="mb-1.5 h-4 w-11/12 rounded bg-slate-200/90" />
        <div className="mb-3 h-4 w-3/4 rounded bg-slate-200/70" />

        {/* Pricing & action footer */}
        <div className="mt-auto space-y-2 border-t border-slate-100 pt-3">
          {/* Price label line */}
          <div className="flex items-center justify-between gap-2">
            <div className="h-3 w-16 rounded bg-slate-200/70" />
            <div className="h-4 w-10 rounded-md bg-slate-200/80" />
          </div>

          {/* Large Price Display */}
          <div className="flex items-baseline gap-2">
            <div className="h-6 w-28 rounded-md bg-slate-200/90" />
            <div className="h-3.5 w-16 rounded bg-slate-200/60" />
          </div>

          {/* Savings Badge */}
          <div className="h-4 w-24 rounded bg-slate-200/60" />

          {/* Affiliate buttons skeleton (Shopee & TikTok) */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <div className="h-8 rounded-xl bg-orange-100/70" />
            <div className="h-8 rounded-xl bg-slate-200/70" />
          </div>

          {/* Verification note */}
          <div className="h-2.5 w-4/5 rounded bg-slate-200/60 mt-1" />
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
  message = 'Đang kết nối và đồng bộ dữ liệu mới nhất từ Google Sheet...',
  showHeader = true,
  className = '',
}) => {
  return (
    <div className={`space-y-4 ${className}`} role="status" aria-live="polite" aria-busy="true">
      {showHeader && message && (
        <div className="flex items-center justify-between rounded-2xl bg-orange-50/90 border border-orange-200/70 px-4 py-2.5 text-xs text-orange-950 shadow-2xs">
          <div className="flex items-center gap-2.5 font-medium">
            <RefreshCw className="w-3.5 h-3.5 text-[#EE4D2D] animate-spin shrink-0" />
            <span className="font-semibold text-slate-800">{message}</span>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold text-[#EE4D2D] bg-white px-2 py-0.5 rounded-full border border-orange-200 shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EE4D2D] animate-ping" />
            Google Sheet Live
          </span>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
        {Array.from({ length: count }).map((_, idx) => (
          <ProductCardSkeleton key={`product-skeleton-${idx}`} />
        ))}
      </div>
      <span className="sr-only">Đang đồng bộ dữ liệu sản phẩm từ Google Sheet...</span>
    </div>
  );
};
