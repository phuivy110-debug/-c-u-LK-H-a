import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, X, ChevronLeft, ChevronRight, Gift } from 'lucide-react';
import { InternalLink } from './InternalLink';

interface Announcement {
  id: string;
  badge: string;
  text: string;
  linkText: string;
  href: string;
}

const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'promo-2026',
    badge: 'Ưu Đãi 2026',
    text: 'Tặng kèm mồi câu & phụ kiện khi mua cần câu LK Hòa chính hãng',
    linkText: 'Xem sản phẩm',
    href: '/san-pham',
  },
  {
    id: 'freeship',
    badge: 'Freeship',
    text: 'Hỗ trợ mã giảm giá & miễn phí vận chuyển đơn hàng Shopee từ 50K',
    linkText: 'Khám phá ngay',
    href: '/san-pham',
  },
  {
    id: 'authentic-guarantee',
    badge: 'Chính Hãng',
    text: 'Cam kết 100% đồ câu LK Hòa chuẩn nguồn gốc, bảo hành uy tín',
    linkText: 'Đọc cam kết',
    href: '/gioi-thieu-phuong-phap-danh-gia',
  },
];

export function AnnouncementBanner({ onNavigate }: { onNavigate?: (path: string) => void }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const isDismissed = sessionStorage.getItem('lk_banner_dismissed');
        if (isDismissed === 'true') {
          setIsVisible(false);
        }
      }
    } catch {
      // Ignore storage access errors
    }
  }, []);

  useEffect(() => {
    if (!isVisible || isPaused || ANNOUNCEMENTS.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5500);
    return () => clearInterval(interval);
  }, [isVisible, isPaused]);

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.setItem('lk_banner_dismissed', 'true');
      }
    } catch {
      // Ignore storage error
    }
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  };

  if (!isVisible) return null;

  const current = ANNOUNCEMENTS[currentIndex];

  return (
    <div
      id="header-announcement-banner"
      role="region"
      aria-label="Thông báo khuyến mãi từ LK Hòa"
      className="relative bg-gradient-to-r from-orange-600 via-[#EE4D2D] to-red-600 text-white text-xs py-1.5 px-3 sm:px-4 shadow-inner"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left Arrow Controls (Desktop) */}
        <button
          id="announcement-prev-btn"
          type="button"
          onClick={handlePrev}
          aria-label="Thông báo trước"
          className="hidden sm:inline-flex p-1 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer shrink-0"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>

        {/* Center Announcement Content */}
        <div className="flex-1 flex items-center justify-center gap-2 overflow-hidden text-center min-w-0">
          <span className="hidden xs:inline-flex items-center gap-1 bg-white/20 backdrop-blur-xs text-white font-extrabold text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
            <Sparkles className="w-2.5 h-2.5" />
            <span>{current.badge}</span>
          </span>

          <span className="truncate font-medium text-white text-[11px] sm:text-xs">
            {current.text}
          </span>

          <InternalLink
            id="announcement-cta-link"
            href={current.href}
            onNavigate={onNavigate}
            className="inline-flex items-center gap-1 font-bold text-white underline hover:no-underline text-[11px] sm:text-xs shrink-0 ml-1 transition-opacity hover:opacity-90"
          >
            <span>{current.linkText}</span>
            <ArrowRight className="w-3 h-3" />
          </InternalLink>
        </div>

        {/* Right Arrow Controls & Close */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            id="announcement-next-btn"
            type="button"
            onClick={handleNext}
            aria-label="Thông báo kế tiếp"
            className="hidden sm:inline-flex p-1 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            id="announcement-close-btn"
            type="button"
            onClick={handleDismiss}
            aria-label="Đóng thông báo"
            className="p-1 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-colors cursor-pointer"
            title="Đóng thông báo này"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
