import React from 'react';
import { ShieldCheck, ArrowUp, Phone, MessageCircle, MapPin, Store, Share2 } from 'lucide-react';
import { LkHoaLogo } from './LkHoaLogo';
import { SHARED_TIKTOK_URL } from '../utils/googleSheetSync';

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.89-2.89 2.893 2.893 0 0 1-2.89-2.89 2.893 2.893 0 0 1 2.89-2.89c.28 0 .543.044.793.122v-3.52a6.333 6.333 0 0 0-.793-.05A6.338 6.338 0 0 0 3.125 15.68 6.338 6.338 0 0 0 9.463 22a6.338 6.338 0 0 0 6.338-6.32V9.043a8.163 8.163 0 0 0 4.788 1.536V7.134a4.832 4.832 0 0 1-1.000-.448z" />
  </svg>
);

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-slate-950 text-slate-400 pt-16 pb-12 border-t border-slate-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-900">
          
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center gap-2.5">
              <LkHoaLogo variant="white" size={40} />
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Trang chủ chính thức của Đồ Câu LK Hòa – Nơi tổng hợp thông tin sản phẩm cần câu, máy câu, mồi câu và phụ kiện chính hãng LK Hòa mua trực tiếp từ Shopee & TikTok Shop.
            </p>

            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3.5 py-1.5 rounded-full font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cửa Hàng Chính Thức Đồ Câu LK Hòa</span>
            </div>
          </div>

          {/* Contact Info */}
          <div className="md:col-span-4 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#EE4D2D]" />
              <span>Thông Tin Liên Hệ</span>
            </h4>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[11px]">SĐT / Hotline:</span>
                  <a href="tel:0933040999" className="font-extrabold text-white hover:text-[#EE4D2D]">
                    0933 040 999
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[11px]">Zalo Hỗ Trợ:</span>
                  <a
                    href="https://zalo.me/0933040999"
                    target="_blank"
                    rel="noreferrer"
                    className="font-extrabold text-blue-400 hover:underline"
                  >
                    Shop đồ câu Lê Khánh Hòa (0933040999)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-500 block text-[11px]">Địa chỉ Cửa Hàng:</span>
                  <span className="text-slate-300 font-medium leading-relaxed block">
                    Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Nghĩa Lâm, Nghĩa Đàn, Nghệ An
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Store Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-orange-400" />
              <span>Gian Hàng Chính Thức</span>
            </h4>
            
            <div className="flex flex-col gap-2 text-xs">
              <a
                href="https://s.shopee.vn/7fYvAFHqaP"
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 p-2.5 rounded-xl transition-colors font-bold text-orange-400"
              >
                <Store className="w-4 h-4 shrink-0" />
                <span>Gian hàng Shopee Mall</span>
              </a>

              <a
                href={SHARED_TIKTOK_URL}
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 p-2.5 rounded-xl transition-colors font-bold text-white"
              >
                <TikTokIcon className="w-4 h-4 fill-current text-white shrink-0" />
                <span>Xem gian hàng TikTok</span>
              </a>
            </div>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center md:text-left">
          <div>
            <p className="font-semibold text-slate-400">
              Trang Chủ Danh Mục Sản Phẩm Đồ Câu LK Hòa.
            </p>
            <p className="text-[11px] mt-0.5">
              Mọi liên kết mua hàng được chuyển hướng trực tiếp tới trang sản phẩm / gian hàng chính thức trên Shopee & TikTok Shop.
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3.5 py-2 rounded-2xl text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <span>Về Đầu Trang</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
};
