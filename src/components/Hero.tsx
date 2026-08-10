import React from 'react';
import { ShieldCheck, Flame, ArrowRight, CheckCircle2, Search, Check } from 'lucide-react';

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Bento Grid Header Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Main Hero Bento Card (8 columns on desktop) */}
          <div className="lg:col-span-8 bg-[#EE4D2D] p-6 sm:p-10 rounded-[2rem] text-white shadow-xl shadow-orange-500/15 relative overflow-hidden flex flex-col justify-between min-h-[360px]">
            {/* Background Glow */}
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              {/* Top Badge */}
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xs">
                <ShieldCheck className="w-4 h-4 text-yellow-300" />
                <span>Shop Đồ Câu LK Hòa Chính Hãng</span>
                <span className="bg-white text-[#EE4D2D] px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ml-1">
                  Shopee Mall
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15]">
                Đồ Câu LK Hòa – <br className="hidden sm:inline" />
                <span className="text-yellow-300">Cần Câu, Máy Câu & Mồi Câu Chính Hãng</span>
              </h1>

              {/* Subtitle */}
              <p className="text-orange-100 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
                Tổng hợp mã giảm giá Shopee độc quyền & sản phẩm đồ câu cá chính hãng LK Hòa. Chọn lọc kỹ càng, test tải thực tế, không nâng giá ảo.
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
                  <span>Tìm Deal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={onScrollToCatalog}
                  className="bg-white text-[#EE4D2D] hover:bg-orange-50 font-extrabold text-sm px-6 py-3 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                >
                  <Flame className="w-4 h-4 text-[#EE4D2D] fill-[#EE4D2D] animate-pulse" />
                  <span>Xem Deal Hot Hôm Nay ({totalDeals})</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <span className="text-xs text-orange-100 font-medium hidden sm:inline">
                  ⚡ Cập nhật liên tục 24/7
                </span>
              </div>
            </div>
          </div>

          {/* Secondary Bento Card: "Why Choose Us" Stats (4 columns on desktop) */}
          <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-[2rem] shadow-xs border border-slate-200/80 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-lg text-slate-900 tracking-tight">
                  Tại sao chọn chúng tôi?
                </h3>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="space-y-3.5 mb-6">
                <div className="flex items-start gap-3 p-3 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                  <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Chọn lọc deal thật 100%</div>
                    <div className="text-[11px] text-slate-500">Đã kiểm duyệt shop uy tín & lượt mua cao</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-blue-50/60 border border-blue-100">
                  <div className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Không bao giờ tăng giá ảo</div>
                    <div className="text-[11px] text-slate-500">Giá gốc và giá giảm chuẩn xác 100%</div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-2xl bg-orange-50/60 border border-orange-100">
                  <div className="w-7 h-7 rounded-full bg-[#EE4D2D] text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
                    <Check className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-extrabold text-slate-900">Link chính hãng Shopee Mall</div>
                    <div className="text-[11px] text-slate-500">Mở trực tiếp app Shopee an toàn</div>
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

      </div>
    </section>
  );
};

