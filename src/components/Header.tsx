import React, { useState } from 'react';
import { Fish, ShieldCheck, Settings, Menu, X, Flame } from 'lucide-react';

interface HeaderProps {
  onOpenAdmin: () => void;
  onSearchFocus?: () => void;
  productCount: number;
}

export const Header: React.FC<HeaderProps> = ({ onOpenAdmin, productCount }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-500 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2">
        <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
        <span>Đồ Câu LK Hòa - Săn Deal Cần Câu & Máy Câu Shopee Chính Hãng</span>
        <span className="hidden sm:inline-block bg-white/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
          Mã Giảm Shopee Mall
        </span>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo */}
          <a href="#" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#EE4D2D] flex items-center justify-center text-white shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform duration-200">
              <Fish className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
                  Đồ Câu <span className="text-[#EE4D2D]">LK Hòa</span>
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-semibold hidden sm:block">
                Cần câu, máy câu chính hãng Shopee
              </p>
            </div>
          </a>

          {/* Shopee Mall Verified Badge & Quick Info */}
          <div className="hidden md:flex items-center gap-2 bg-orange-50/80 border border-orange-200/60 text-[#EE4D2D] px-3.5 py-1.5 rounded-full text-xs font-bold">
            <ShieldCheck className="w-4 h-4 text-[#EE4D2D]" />
            <span>Link Sản Phẩm Chính Hãng</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping ml-1" />
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-semibold text-slate-700">
            <a href="#hero" className="hover:text-[#EE4D2D] transition-colors">
              Trang Chủ
            </a>
            <a href="#catalog" className="hover:text-[#EE4D2D] transition-colors flex items-center gap-1">
              <span>Catalog Deal</span>
              <span className="bg-orange-100 text-[#EE4D2D] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {productCount}
              </span>
            </a>
            <a href="#reasons" className="hover:text-[#EE4D2D] transition-colors">
              Lý Do Chọn
            </a>

            {/* Admin / Easy Link Manager Button */}
            <button
              onClick={onOpenAdmin}
              className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
              title="Hướng dẫn & Chỉnh sửa Link Affiliate"
            >
              <Settings className="w-3.5 h-3.5 text-slate-500" />
              <span>Quản Lý Link Affiliate</span>
            </button>
          </nav>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={onOpenAdmin}
              className="p-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              title="Quản lý link"
            >
              <Settings className="w-5 h-5 text-slate-700" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 rounded-xl hover:bg-slate-100 focus:outline-hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-5 space-y-3 shadow-lg">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-[#EE4D2D] border border-orange-200 px-3 py-1.5 rounded-full text-xs font-bold w-full justify-center">
            <ShieldCheck className="w-4 h-4" />
            <span>Link Sản Phẩm Chính Hãng</span>
          </div>

          <a
            href="#hero"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-slate-800 border-b border-slate-100"
          >
            Trang Chủ
          </a>
          <a
            href="#catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-slate-800 border-b border-slate-100 flex items-center justify-between"
          >
            <span>Danh Mục Sản Phẩm</span>
            <span className="bg-orange-100 text-[#EE4D2D] text-xs px-2 py-0.5 rounded-full font-bold">
              {productCount} deal
            </span>
          </a>
          <a
            href="#reasons"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-base font-semibold text-slate-800 border-b border-slate-100"
          >
            Lý Do Nên Mua Ở Đây
          </a>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenAdmin();
            }}
            className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-xl text-sm"
          >
            <Settings className="w-4 h-4" />
            <span>Quản Lý Link Affiliate & Thêm Deal</span>
          </button>
        </div>
      )}
    </header>
  );
};
