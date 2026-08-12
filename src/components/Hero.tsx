import React from 'react';
import { ShieldCheck, Flame, ArrowRight, Search, Check, ExternalLink, ShoppingBag } from 'lucide-react';

// TikTok Icon SVG
const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.901 2.89 2.893 2.893 0 0 1-2.89-2.89 2.893 2.893 0 0 1 2.89-2.89c.28 0 .543.044.793.122v-3.52a6.333 6.333 0 0 0-.793-.05A6.338 6.338 0 0 0 3.125 15.68 6.338 6.338 0 0 0 9.463 22a6.338 6.338 0 0 0 6.338-6.32V9.043a8.163 8.163 0 0 0 4.788 1.536V7.134a4.832 4.832 0 0 1-1.000-.448z" />
  </svg>
);

interface HeroProps {
  onScrollToCatalog: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  totalDeals: number;
}

export const Hero: React.FC<HeroProps> = ({
  onScrollToCatalog,
  searchQuery,
  onSearchChange,
  totalDeals,
}) => {
  return (
    <section id="hero" className="py-6 sm:py-8 bg-[#F6F7FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Bento Grid Header Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Hero Bento Card (8 columns on desktop) */}
          <div className="lg:col-span-8 bg-[#EE4D2D] p-6 sm:p-10 rounded-[2rem] text-white shadow-xl shadow-orange-500/15 relative overflow-hidden flex flex-col justify-between min-h-[360px]">
            {/* Background Glow */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xs flex-wrap">
                <ShieldCheck className="w-4 h-4 text-yellow-300" />
                <span>Trang Chủ Chính Thức Đồ Câu LK Hòa</span>
                <div className="flex items-center gap-1">
                  <span className="bg-white text-[#EE4D2D] px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
                    Shopee
                  </span>
                  <span className="bg-black text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border border-white/30">
                    TikTok Shop
                  </span>
                </div>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15]">
                Đồ Câu LK Hòa – <br className="hidden sm:inline" />
                <span className="text-yellow-300">Tổng Hợp Deal Hot & Mã Giảm Giá Độc Quyền</span>
              </h1>

              {/* Subtitle */}
              <p className="text-orange-100 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
                Lỡ nhịp săn voucher khi xem Livestream? Đừng lo! Đây là Trang Chủ Chính Thức của <strong>Đồ Câu LK Hòa</strong> – Nơi lưu trữ đầy đủ mã giảm giá và link đặt hàng trực tiếp an toàn từ 2 gian hàng chính hãng <strong>Shopee Mall</strong> & <strong>TikTok Shop</strong> với giá hời nhất.
              </p>
            </div>

            {/* Bottom Actions Row */}
            <div className="relative z-10 mt-8 space-y-4">
              {/* Search Bar inside Hero */}
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
                  <span>Lấy Mã Deal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onScrollToCatalog}
                  className="bg-white text-[#EE4D2D] hover:bg-orange-50 font-extrabold text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Flame className="w-4 h-4 text-[#EE4D2D] fill-[#EE4D2D] animate-pulse" />
                  <span>Săn Deal Giá Hời LK Hòa ({totalDeals})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-xs text-orange-100 font-medium hidden sm:inline">
                  ⚡ Mua trực tiếp từ cửa hàng LK Hòa chính hãng
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Bento Card: "Why Choose Us" Stats (4 columns on desktop) */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-[2rem] shadow-xs border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Cam kết từ LK Hòa
                </h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="space-y-3.5 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Không Lo Bỏ Lỡ Voucher</div>
                    <div className="text-[11px] text-slate-500">Lấy lại mã giảm giá ngon kể cả khi đã hết Live</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">An Toàn Tuyệt Đối 100%</div>
                    <div className="text-[11px] text-slate-500">Mở trực tiếp Shopee App / TikTok App chính hãng</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-orange-50/60 border border-orange-100">
                  <div className="w-7 h-7 rounded-full bg-[#EE4D2D] text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Cửa Hàng Chính Thức LK Hòa</div>
                    <div className="text-[11px] text-slate-500">Hưởng đầy đủ bảo hành lóng cần & 1 đổi 1</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Guarantee Banner */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-semibold">
              <span className="flex items-center gap-1.5 text-slate-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                Miễn phí 100%
              </span>
              <a href="#reasons" className="text-[#EE4D2D] hover:underline font-bold">
                Chi tiết →
              </a>
            </div>
          </div>

        </div>

        {/* Dedicated Side-by-Side E-Commerce Stores Banner (Cam - Shopee vs Đen - TikTok Shop) */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-6">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <div className="inline-flex items-center gap-2 bg-slate-100 text-slate-800 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider">
              <ShoppingBag className="w-3.5 h-3.5 text-[#EE4D2D]" />
              <span>Gian Hàng Chính Hãng LK Hòa</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Mua Hàng Trực Tiếp Qua 2 Sàn TMĐT Uy Tín
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm font-medium">
              Lựa chọn nền tảng mua sắm yêu thích của bạn để nhận mã giảm giá và bảo hành chính hãng LK Hòa
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {/* Shopee Card - Orange */}
            <div className="bg-gradient-to-br from-orange-500 to-[#EE4D2D] text-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all border border-orange-400/40 relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="bg-white text-[#EE4D2D] font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-xs">
                    SHOPEE
                  </span>
                  <span className="text-xs font-bold text-orange-100 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-yellow-300" />
                    Cửa Hàng LK Hòa
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Gian Hàng Shopee LK Hòa
                </h3>
                <p className="text-orange-100 text-xs sm:text-sm font-medium leading-relaxed">
                  Săn voucher Freeship Extra, mã giảm giá Shopee hấp dẫn và mua sắm chính hãng LK Hòa.
                </p>
              </div>

              <div className="pt-6 relative z-10">
                <a
                  href="https://s.shopee.vn/7fYvAFHqaP"
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="w-full bg-white hover:bg-orange-50 text-[#EE4D2D] font-extrabold py-3 px-5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                >
                  <span>MUA NGAY TRÊN SHOPEE</span>
                  <ExternalLink className="w-4 h-4 text-[#EE4D2D] transition-transform group-hover/btn:translate-x-0.5" />
                </a>
              </div>
            </div>

            {/* TikTok Shop Card - Black */}
            <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-black text-white p-6 rounded-2xl shadow-md hover:shadow-lg transition-all border border-slate-800 relative overflow-hidden flex flex-col justify-between group">
              <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-cyan-500/10 rounded-full blur-xl pointer-events-none group-hover:scale-125 transition-transform" />
              
              <div className="space-y-3 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="bg-white text-black font-black text-xs px-3 py-1 rounded-full uppercase tracking-wider shadow-xs flex items-center gap-1.5">
                    <TikTokIcon className="w-3.5 h-3.5 fill-current text-black" />
                    TIKTOK SHOP
                  </span>
                  <span className="text-xs font-bold text-slate-300 flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4 text-cyan-400" />
                    Kênh Livestream LK Hòa
                  </span>
                </div>

                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  Gian Hàng TikTok Shop LK Hòa
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                  Xem video review thực tế test tải cần câu, săn deal chớp thời cơ khi livestream và mua hàng trực tiếp cực nhanh.
                </p>
              </div>

              <div className="pt-6 relative z-10">
                <a
                  href="https://vt.tiktok.com/ZS9hEsGU3kHau-stx7x/"
                  target="_blank"
                  rel="sponsored nofollow noopener noreferrer"
                  className="w-full bg-white hover:bg-slate-100 text-slate-950 font-extrabold py-3 px-5 rounded-xl text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 group/btn cursor-pointer"
                >
                  <TikTokIcon className="w-4 h-4 fill-current text-slate-950" />
                  <span>MUA NGAY TRÊN TIKTOK SHOP</span>
                  <ExternalLink className="w-4 h-4 text-slate-950 transition-transform group-hover/btn:translate-x-0.5" />
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};


