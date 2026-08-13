import React from 'react';
import { ShieldCheck, ArrowRight, Search, Check, ExternalLink, ShoppingBag } from 'lucide-react';
import { SHARED_TIKTOK_URL } from '../utils/googleSheetSync';

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.901 2.89 2.893 2.893 0 0 1-2.89-2.89 2.893 2.893 0 0 1 2.89-2.89c.28 0 .543.044.793.122v-3.52a6.333 6.333 0 0 0-.793-.05A6.338 6.338 0 0 0 3.125 15.68 6.338 6.338 0 0 0 9.463 22a6.338 6.338 0 0 0 6.338-6.32V9.043a8.163 8.163 0 0 0 4.788 1.536V7.134a4.832 4.832 0 0 1-1.000-.448z" />
  </svg>
);

interface HeroProps {
  onScrollToCatalog: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  activeCount: number;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToCatalog,
  searchQuery,
  onSearchChange,
  activeCount,
}) => {
  return (
    <section id="hero" className="py-6 sm:py-8 bg-[#F6F7FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Main Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-8 bg-[#EE4D2D] p-6 sm:p-10 rounded-[2rem] text-white shadow-xl shadow-orange-500/15 relative overflow-hidden flex flex-col justify-between min-h-[360px]">
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xs flex-wrap">
                <ShieldCheck className="w-4 h-4 text-yellow-300" />
                <span>Trang Chủ Chính Thức Đồ Câu LK Hòa</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15]">
                Đồ Câu LK Hòa – <br className="hidden sm:inline" />
                <span className="text-yellow-300">Cần Câu, Mồi Câu, Máy Câu & Phụ Kiện</span>
              </h1>

              <p className="text-orange-100 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
                Nơi tổng hợp thông tin sản phẩm và liên kết mua hàng chính thức tới các gian hàng Đồ Câu LK Hòa trên Shopee & TikTok Shop. Tra cứu dễ dàng, thông tin minh bạch.
              </p>
            </div>

            <div className="relative z-10 mt-8 space-y-4">
              <div className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-lg max-w-xl focus-within:ring-2 focus-within:ring-yellow-300 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  placeholder="Tìm kiếm đồ câu (Cần tay 6H, Máy Shimano, Mồi chép LK Hòa...)"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-sm text-slate-800 focus:outline-hidden placeholder:text-slate-400"
                />
                <button
                  onClick={onScrollToCatalog}
                  className="bg-[#EE4D2D] hover:bg-orange-600 text-white font-bold px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Tìm Kiếm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onScrollToCatalog}
                  className="bg-white text-[#EE4D2D] hover:bg-orange-50 font-extrabold text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <span>Xem Sản Phẩm ({activeCount})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Side Promises */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-[2rem] shadow-xs border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Thông Tin Sản Phẩm LK Hòa
                </h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              </div>

              <div className="space-y-3.5 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Liên Kết Trực Tiếp</div>
                    <div className="text-[11px] text-slate-500">Dẫn trực tiếp tới gian hàng chính hãng</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">An Toàn & Bảo Mật</div>
                    <div className="text-[11px] text-slate-500">Mở trực tiếp ứng dụng Shopee / TikTok Shop</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-orange-50/60 border border-orange-100">
                  <div className="w-7 h-7 rounded-full bg-[#EE4D2D] text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Thông Số Thực Tế</div>
                    <div className="text-[11px] text-slate-500">Nội dung sản phẩm được đồng bộ chính xác</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Đồ câu giải trí LK Hòa
              </span>
            </div>
          </div>
        </div>

        {/* E-Commerce Stores Navigation Card */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5 text-[#EE4D2D]" />
              <span>Gian Hàng Chính Thức LK Hòa</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Gian Hàng Trên Sàn Thương Mại Điện Tử
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Kiểm tra thông tin cuối cùng và giá chính thức trên ứng dụng bán hàng
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Shopee Card */}
            <div className="bg-gradient-to-br from-orange-500 to-[#EE4D2D] text-white p-6 rounded-2xl shadow-md border border-orange-400/40 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="bg-white text-[#EE4D2D] font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    SHOPEE
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Gian Hàng Shopee LK Hòa
                </h3>
                <p className="text-orange-100 text-xs sm:text-sm font-medium leading-relaxed">
                  Xem toàn bộ danh mục sản phẩm đồ câu cá và đặt mua trực tiếp trên Shopee.
                </p>
              </div>

              <div className="pt-6 relative z-10">
                <a
                  href="https://s.shopee.vn/7fYvAFHqaP"
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="w-full bg-white hover:bg-orange-50 text-[#EE4D2D] font-extrabold py-3 px-5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Xem gian hàng Shopee</span>
                  <ExternalLink className="w-4 h-4 text-[#EE4D2D]" />
                </a>
              </div>
            </div>

            {/* TikTok Shop Card */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6 rounded-2xl shadow-md border border-slate-800 relative overflow-hidden flex flex-col justify-between">
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="bg-white text-black font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                    <TikTokIcon className="w-3.5 h-3.5 fill-current text-black" />
                    TIKTOK SHOP
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Gian Hàng TikTok LK Hòa
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                  Ghé gian hàng chung TikTok Shop chính thức của LK Hòa để theo dõi video trải nghiệm và mua hàng.
                </p>
              </div>

              <div className="pt-6 relative z-10">
                <a
                  href={SHARED_TIKTOK_URL}
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="w-full bg-white hover:bg-slate-100 text-slate-950 font-extrabold py-3 px-5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <TikTokIcon className="w-4 h-4 fill-current text-slate-950" />
                  <span>Xem gian hàng TikTok</span>
                  <ExternalLink className="w-4 h-4 text-slate-950" />
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
