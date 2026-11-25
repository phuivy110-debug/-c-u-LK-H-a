import React from 'react';
import { ArrowRight, ExternalLink, Search, ShieldCheck, Truck, Wrench } from 'lucide-react';
import { SHARED_TIKTOK_URL } from '../utils/googleSheetSync';

interface HeroProps {
  onScrollToCatalog: () => void;
  onSearch: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCount: number;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToCatalog,
  onSearch,
  searchQuery,
  onSearchChange,
  activeCount,
}) => {
  return (
    <section id="hero" className="bg-[#0F172A] border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Column: Tactical Brand Value Prop & Primary CTA */}
          <div className="lg:col-span-6 bg-[#111827] border border-slate-800 rounded-2xl p-6 sm:p-8 flex flex-col justify-between gap-6">
            <div className="space-y-4">
              <p className="text-xs font-bold uppercase tracking-widest text-[#FACC15]">
                Đồ Câu LK Hòa · Trang Bị Thực Chiến Chính Hãng
              </p>

              <h1 className="text-3xl sm:text-4xl lg:text-[2.75rem] font-black tracking-tight text-white leading-[1.15]">
                Đồ Câu LK Hòa – Trang Bị Thực Chiến Cho Mọi Địa Hình
              </h1>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                Đặt hàng trực tiếp chính hãng với thanh toán COD đồng kiểm hoặc chuyển khoản VietQR, miễn phí vận chuyển từ 300.000đ và đóng ống nhựa PVC bảo vệ ngọn cần toàn quốc.
              </p>

              <form
                className="flex overflow-hidden rounded-xl border border-slate-700 bg-[#0F172A] focus-within:border-[#FACC15]"
                onSubmit={(event) => {
                  event.preventDefault();
                  onSearch();
                }}
                role="search"
              >
                <Search className="ml-4 h-5 w-5 self-center text-slate-400" aria-hidden="true" />
                <label htmlFor="hero-product-search" className="sr-only">Tìm sản phẩm hoặc nhu cầu câu</label>
                <input
                  id="hero-product-search"
                  value={searchQuery}
                  onChange={(event) => onSearchChange(event.target.value)}
                  placeholder="Ví dụ: lure cá lóc, cần 5H, combo người mới..."
                  className="min-w-0 flex-1 bg-transparent px-3 py-3 text-sm text-white outline-none placeholder:text-slate-500"
                />
                <button
                  type="submit"
                  className="m-1 min-h-10 rounded-lg bg-[#FACC15] px-4 text-sm font-black text-[#0F172A] hover:bg-yellow-300 cursor-pointer"
                >
                  Tìm nhanh
                </button>
              </form>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs text-slate-200">
                <div className="flex items-center gap-2 rounded-lg bg-[#0F172A] border border-slate-800 px-3 py-2.5">
                  <Truck className="w-4 h-4 text-[#FACC15] shrink-0" />
                  <span className="font-semibold">Freeship từ 300K</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-[#0F172A] border border-slate-800 px-3 py-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="font-semibold">Đồng kiểm khi nhận</span>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-[#0F172A] border border-slate-800 px-3 py-2.5">
                  <Wrench className="w-4 h-4 text-[#F97316] shrink-0" />
                  <span className="font-semibold">Bảo hành ngọn cần</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onScrollToCatalog}
                  data-cta="true"
                  className="cta-btn min-h-12 px-6 py-3 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] font-black text-sm flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                >
                  <span>Xem Bộ Sưu Tập Thực Chiến ({activeCount})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400 pt-1">
                <span>Săn voucher sàn TMĐT:</span>
                <a
                  href="https://s.shopee.vn/7fYvAFHqaP"
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="inline-flex items-center gap-1 font-bold text-[#F97316] hover:text-orange-300"
                >
                  <span>Gian hàng Shopee</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
                <a
                  href={SHARED_TIKTOK_URL}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  className="inline-flex items-center gap-1 font-bold text-slate-200 hover:text-white"
                >
                  <span>Gian hàng TikTok Shop</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Tactical Outdoor Fishing Visual */}
          <div className="lg:col-span-6 relative rounded-2xl overflow-hidden border border-slate-800 bg-[#14532D]/30 min-h-[260px] sm:min-h-[340px]">
            <img
              src="/images/hero-tactical-fishing.jpg"
              alt="Cần câu carbon, máy câu đứng và mồi lure chính hãng Đồ Câu LK Hòa bên bờ sông"
              width="1280"
              height="720"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-[#0F172A]/35 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-[#FACC15] uppercase tracking-wider">
                  Kiểm nghiệm thực tế bởi LK Hòa
                </p>
                <p className="text-sm sm:text-base font-bold text-white mt-0.5">
                  Cần Solid tải tĩnh 10KG · Mồi Chuột LK · Dây Dù Red X8
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
