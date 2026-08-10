import React from 'react';
import { ShieldCheck, ArrowUp, Phone, MessageCircle, MapPin, Store, Share2 } from 'lucide-react';
import { LkHoaLogo } from './LkHoaLogo';
import { AnalyticsWidget } from './AnalyticsWidget';

interface FooterProps {
  onOpenAnalytics?: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenAnalytics }) => {
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
              Website tổng hợp link Affiliate cần câu, máy câu, mồi câu và phụ kiện đồ câu cá LK Hòa chính hãng từ Shopee Mall & TikTok Shop. Cam kết chất lượng, thông số chuẩn xác.
            </p>

            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3.5 py-1.5 rounded-full font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Link Đồ Câu LK Hòa Chính Hãng 100%</span>
            </div>
          </div>

          {/* Detailed Contact Info */}
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
                    Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Nghĩa Lâm, Nghĩa Đàn, Nghệ An 70000, Việt Nam.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Social Links & Disclaimer */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Share2 className="w-3.5 h-3.5 text-orange-400" />
              <span>Mạng Xã Hội LK Hòa</span>
            </h4>
            
            <div className="grid grid-cols-2 gap-2 text-xs">
              <a
                href="https://www.tiktok.com/@botoctroiday.lkhoa"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 p-2 rounded-xl transition-colors font-semibold text-slate-300 hover:text-white"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-3.04-1.15z" />
                </svg>
                <span>TikTok</span>
              </a>

              <a
                href="https://s.shopee.vn/AKZfxdJSku"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 p-2 rounded-xl transition-colors font-semibold text-orange-400"
              >
                <Store className="w-3.5 h-3.5 shrink-0" />
                <span>Shopee</span>
              </a>

              <a
                href="https://www.youtube.com/@botoctroidaylk"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 p-2 rounded-xl transition-colors font-semibold text-red-400"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>YouTube</span>
              </a>

              <a
                href="https://www.facebook.com/lkhoa0933040999"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 p-2 rounded-xl transition-colors font-semibold text-blue-400"
              >
                <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>

        </div>

        {/* Disclaimer, Copyright & Traffic Counter */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center md:text-left">
          <div>
            <p className="font-semibold text-slate-400">
              Chuyên trang chia sẻ deal ngon đồ câu cá chính hãng LK Hòa.
            </p>
            <p className="text-[11px] mt-0.5">
              © 2026 Đồ Câu LK Hòa. Mọi thông tin sản phẩm và thương hiệu thuộc về nhà bán hàng chính hãng trên Shopee.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3">
            {/* Traffic Analytics Button Widget */}
            <AnalyticsWidget onOpenModal={onOpenAnalytics || (() => {})} variant="footer" />

            <button
              onClick={scrollToTop}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3.5 py-2 rounded-2xl text-xs font-bold transition-colors cursor-pointer shrink-0"
            >
              <span>Về Đầu Trang</span>
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};

