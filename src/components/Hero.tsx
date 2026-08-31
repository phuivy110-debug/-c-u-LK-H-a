import React from 'react';
import { ShieldCheck, ArrowRight, Search, ExternalLink, ShoppingBag } from 'lucide-react';
import { SHARED_TIKTOK_URL } from '../utils/googleSheetSync';

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.901 2.89 2.893 2.893 0 0 1-2.89-2.89 2.893 2.893 0 0 1 2.89-2.89c.28 0 .543.044.793.122v-3.52a6.333 6.333 0 0 0-.793-.05A6.338 6.338 0 0 0 3.125 15.68 6.338 6.338 0 0 0 9.463 22a6.338 6.338 0 0 0 6.338-6.32V9.043a8.163 8.163 0 0 0 4.788 1.536V7.134a4.832 4.832 0 0 1-1.000-.448z" />
  </svg>
);

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
    <section id="hero" className="py-6 sm:py-8 bg-[#F6F7FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Main Banner */}
        <div className="grid grid-cols-1 gap-6">
          <div className="bg-[#EE4D2D] p-6 sm:p-10 rounded-[2rem] text-white shadow-xl shadow-orange-500/15 relative overflow-hidden flex flex-col justify-between min-h-[360px]">
            <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 space-y-4">
              <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md border border-white/25 px-3.5 py-1.5 rounded-full text-xs font-bold text-white shadow-xs flex-wrap">
                <ShieldCheck className="w-4 h-4 text-yellow-300" />
                <span>Danh Mục Đồ Câu LK Hòa</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15]">
                Đồ Câu LK Hòa – <br className="hidden sm:inline" />
                <span className="text-yellow-300">Cần Câu, Mồi Câu, Máy Câu & Phụ Kiện</span>
              </h1>

              <p className="text-orange-100 text-sm sm:text-base font-medium max-w-xl leading-relaxed">
                Tra cứu đồ câu và liên kết tới sản phẩm hoặc gian hàng trên Shopee & TikTok Shop. Kiểm tra phân loại, giá và chính sách của người bán trước khi đặt mua.
              </p>
            </div>

            <div className="relative z-10 mt-8 space-y-4">
              <form role="search" onSubmit={event => { event.preventDefault(); onSearch(); }} className="relative flex items-center bg-white rounded-2xl p-1.5 shadow-lg max-w-xl focus-within:ring-2 focus-within:ring-yellow-300 transition-all">
                <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
                <input
                  type="text"
                  aria-label="Tìm kiếm đồ câu"
                  enterKeyHint="search"
                  onKeyDown={event => {
                    if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
                      event.preventDefault();
                      onSearch();
                    }
                  }}
                  placeholder="Tìm kiếm đồ câu (Cần tay 6H, Máy Shimano, Mồi chép LK Hòa...)"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full bg-transparent px-3 py-2 text-sm text-slate-800 focus:outline-hidden placeholder:text-slate-400"
                />
                <button
                  type="submit"
                  className="bg-[#EE4D2D] hover:bg-orange-600 text-white font-bold px-4 sm:px-6 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shrink-0 transition-transform active:scale-95 cursor-pointer"
                >
                  <span>Tìm Kiếm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

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

        </div>

        {/* Compact E-Commerce Stores Navigation Card */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-5 border border-slate-200/90 shadow-xs">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Title / Subtitle Compact */}
            <div className="flex items-center gap-3 text-center md:text-left">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#EE4D2D] flex items-center justify-center shrink-0 border border-orange-100">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center justify-center md:justify-start gap-2">
                  <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
                    Gian Hàng Thương Mại Điện Tử LK Hòa
                  </h2>
                  <span className="hidden sm:inline-flex bg-orange-100 text-[#EE4D2D] text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                    Liên kết sàn
                  </span>
                </div>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  Đặt mua trực tiếp và áp mã voucher ưu đãi trên ứng dụng Shopee & TikTok Shop
                </p>
              </div>
            </div>

            {/* Compact Action Buttons */}
            <div className="grid grid-cols-2 gap-2.5 w-full md:w-auto shrink-0">
              {/* Compact Shopee Button */}
              <a
                href="https://s.shopee.vn/7fYvAFHqaP"
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="bg-gradient-to-r from-orange-500 to-[#EE4D2D] hover:from-orange-600 hover:to-[#d73f21] text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer group"
              >
                <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
                <span className="font-extrabold">Shopee LK Hòa</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
              </a>

              {/* Compact TikTok Shop Button */}
              <a
                href={SHARED_TIKTOK_URL}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="bg-slate-900 hover:bg-black text-white px-4 py-2.5 rounded-xl text-xs font-bold shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer border border-slate-800 group"
              >
                <TikTokIcon className="w-3.5 h-3.5 fill-current text-white" />
                <span className="font-extrabold">TikTok Shop LK</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
