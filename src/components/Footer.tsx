import React from 'react';
import { Fish, ShieldCheck, ArrowUp, Send, Facebook, Youtube } from 'lucide-react';

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
              <div className="w-9 h-9 rounded-xl bg-[#EE4D2D] flex items-center justify-center text-white font-bold">
                <Fish className="w-5 h-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                Đồ Câu <span className="text-[#EE4D2D]">LK Hòa</span>
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Website chia sẻ & săn deal cần câu, máy câu, mồi câu và phụ kiện đồ câu cá LK Hòa chính hãng từ Shopee Mall. Cam kết chất lượng, thông số chuẩn xác.
            </p>

            <div className="inline-flex items-center gap-2 bg-slate-900 border border-slate-800 text-slate-300 text-xs px-3.5 py-1.5 rounded-full font-semibold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Link Đồ Câu LK Hòa Chính Hãng 100%</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Lối Tắt Nhanh</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#hero" className="hover:text-white transition-colors">
                  Trang chủ săn deal đồ câu
                </a>
              </li>
              <li>
                <a href="#catalog" className="hover:text-white transition-colors">
                  Cần câu & Máy câu hot
                </a>
              </li>
              <li>
                <a href="#reasons" className="hover:text-white transition-colors">
                  Cam kết uy tín LK Hòa
                </a>
              </li>
            </ul>
          </div>

          {/* Social Links & Disclaimer */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Kết Nối Đồ Câu LK Hòa</h4>
            <div className="flex items-center gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-[#EE4D2D] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Facebook Đồ Câu LK Hòa"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-[#EE4D2D] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Telegram Mã Giảm Giá Đồ Câu"
              >
                <Send className="w-5 h-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noreferrer"
                className="w-10 h-10 rounded-xl bg-slate-900 hover:bg-[#EE4D2D] text-slate-300 hover:text-white flex items-center justify-center transition-colors"
                title="Kênh YouTube Đồ Câu LK Hòa"
              >
                <Youtube className="w-5 h-5" />
              </a>
            </div>

            <div className="bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3.5 text-xs text-slate-400">
              <span className="font-bold text-slate-200 block mb-1">Quyền riêng tư tuyệt đối:</span>
              Không cần đăng nhập, chuyển hướng an toàn 100% sang ứng dụng Shopee chính thức.
            </div>
          </div>

        </div>

        {/* Disclaimer & Copyright */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 text-center sm:text-left">
          <div>
            <p className="font-semibold text-slate-400">
              Chuyên trang chia sẻ deal ngon đồ câu cá chính hãng LK Hòa.
            </p>
            <p className="text-[11px] mt-0.5">
              © 2026 Đồ Câu LK Hòa. Mọi thông tin sản phẩm và thương hiệu thuộc về nhà bán hàng chính hãng trên Shopee.
            </p>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
          >
            <span>Về Đầu Trang</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
};
