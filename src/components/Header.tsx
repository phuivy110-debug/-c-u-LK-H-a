import React, { useState } from 'react';
import {
  ShieldCheck,
  Settings,
  Menu,
  X,
  Flame,
  Phone,
  MessageCircle,
  MapPin,
  ExternalLink,
  Store,
  ChevronDown,
  ChevronRight,
  Fish,
  Compass,
  Feather,
  Waves,
  Anchor,
  Share2,
} from 'lucide-react';
import { LkHoaLogo } from './LkHoaLogo';
import { AnalyticsWidget } from './AnalyticsWidget';
import { CATEGORIES } from '../data/products';
import { CategoryId } from '../types';

interface HeaderProps {
  onOpenAdmin: () => void;
  onOpenAnalytics?: () => void;
  onSearchFocus?: () => void;
  productCount: number;
  showAdminButton?: boolean;
  onLogoClickCount?: () => void;
  onSelectCategory?: (categoryId: CategoryId) => void;
}

// Helper TikTok Icon
const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.901 2.89 2.893 2.893 0 0 1-2.89-2.89 2.893 2.893 0 0 1 2.89-2.89c.28 0 .543.044.793.122v-3.52a6.333 6.333 0 0 0-.793-.05A6.338 6.338 0 0 0 3.125 15.68 6.338 6.338 0 0 0 9.463 22a6.338 6.338 0 0 0 6.338-6.32V9.043a8.163 8.163 0 0 0 4.788 1.536V7.134a4.832 4.832 0 0 1-1.000-.448z" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  onOpenAdmin,
  onOpenAnalytics,
  productCount,
  showAdminButton = false,
  onLogoClickCount,
  onSelectCategory,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(true);

  const handleCategoryClick = (id: CategoryId) => {
    if (onSelectCategory) {
      onSelectCategory(id);
    }
    setMobileMenuOpen(false);
    const catalogEl = document.getElementById('catalog');
    if (catalogEl) {
      catalogEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-orange-600 via-slate-900 to-slate-950 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 flex-wrap">
        <Flame className="w-4 h-4 text-yellow-300 animate-pulse" />
        <span>Đồ Câu LK Hòa – Tổng Hợp Link Affiliate Chính Hãng Qua Shopee & TikTok Shop</span>
        <div className="flex items-center gap-1.5 ml-1">
          <a
            href="https://s.shopee.vn/7fYvAFHqaP"
            target="_blank"
            rel="noreferrer"
            className="bg-[#EE4D2D] hover:bg-orange-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
          >
            <span>Shopee</span>
          </a>
          <a
            href="https://vt.tiktok.com/ZS9hEsGU3kHau-stx7x/"
            target="_blank"
            rel="noreferrer"
            className="bg-black hover:bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors border border-slate-700"
          >
            <TikTokIcon className="w-2.5 h-2.5 fill-current text-white" />
            <span>TikTok Shop</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          
          {/* Brand Logo with exact LK Hòa hexagon symbol */}
          <a
            href="#"
            onClick={(e) => {
              if (onLogoClickCount) onLogoClickCount();
            }}
            className="flex items-center gap-2 group cursor-pointer"
          >
            <LkHoaLogo size={42} />
          </a>

          {/* Shopee & TikTok Side-by-Side Official Badges */}
          <div className="hidden lg:flex items-center gap-2">
            {/* Shopee Mall Badge */}
            <a
              href="https://s.shopee.vn/7fYvAFHqaP"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-[#EE4D2D] hover:bg-orange-100 px-3 py-1.5 rounded-full text-xs font-extrabold transition-all group/shop"
              title="Ghé Gian Hàng Shopee Mall Chính Hãng LK Hòa"
            >
              <div className="w-2 h-2 rounded-full bg-[#EE4D2D] animate-ping" />
              <span>Shopee Mall LK Hòa</span>
              <ExternalLink className="w-3 h-3 text-[#EE4D2D] opacity-70 group-hover/shop:opacity-100" />
            </a>

            {/* TikTok Shop Badge */}
            <a
              href="https://vt.tiktok.com/ZS9hEsGU3kHau-stx7x/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-white hover:bg-black px-3 py-1.5 rounded-full text-xs font-extrabold transition-all group/tt"
              title="Ghé TikTok Shop Chính Hãng LK Hòa"
            >
              <TikTokIcon className="w-3.5 h-3.5 fill-current text-white" />
              <span>TikTok Shop LK Hòa</span>
              <ExternalLink className="w-3 h-3 text-slate-300 opacity-70 group-hover/tt:opacity-100" />
            </a>
            
            {/* Live Visitor Analytics Pill */}
            <AnalyticsWidget onOpenModal={onOpenAnalytics || (() => {})} variant="pill" />
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
            <a href="#contact-mobile" className="hover:text-[#EE4D2D] transition-colors flex items-center gap-1">
              <span>Liên Hệ</span>
            </a>

            {/* Admin Button (Hidden from regular customers) */}
            {showAdminButton && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-sm"
                title="Quản lý link & Cấu hình Sheet"
              >
                <Settings className="w-3.5 h-3.5 text-orange-400" />
                <span>Quản Lý (Admin)</span>
              </button>
            )}
          </nav>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            {/* Mobile Analytics Quick Pill */}
            <AnalyticsWidget onOpenModal={onOpenAnalytics || (() => {})} variant="pill" />

            {showAdminButton && (
              <button
                onClick={onOpenAdmin}
                className="p-2 text-white bg-slate-900 rounded-xl"
                title="Quản lý (Admin)"
              >
                <Settings className="w-5 h-5 text-orange-400" />
              </button>
            )}
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

      {/* Mobile Drawer (Menu 3 Gạch Ngang) */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl max-h-[88vh] overflow-y-auto">
          <div className="inline-flex items-center gap-2 bg-orange-50 text-[#EE4D2D] border border-orange-200 px-3 py-1.5 rounded-full text-xs font-bold w-full justify-center">
            <ShieldCheck className="w-4 h-4" />
            <span>Shopee Mall Offical LK Hòa</span>
          </div>

          {/* Primary Mobile Navigation Links */}
          <div className="space-y-1">
            <a
              href="#hero"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 text-sm font-bold text-slate-800 rounded-xl hover:bg-slate-50 transition-colors"
            >
              🏠 Trang Chủ
            </a>

            {/* Accordion: Danh Mục Sản Phẩm Đồ Câu */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="w-full flex items-center justify-between p-3 text-sm font-extrabold text-slate-800 hover:bg-slate-100/60 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <span>🎣</span>
                  <span>Danh Mục Sản Phẩm Đồ Câu</span>
                </span>
                {categoriesOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {categoriesOpen && (
                <div className="px-2 pb-2.5 space-y-1 pt-1 border-t border-slate-200/60 bg-white">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategoryClick(cat.id)}
                      className="w-full text-left flex items-center justify-between py-2 px-3 text-xs font-bold text-slate-700 hover:text-[#EE4D2D] hover:bg-orange-50 rounded-xl transition-all"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <a
              href="#reasons"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-3 text-sm font-bold text-slate-800 rounded-xl hover:bg-slate-50 transition-colors"
            >
              ⭐ Lý Do Nên Chọn LK Hòa
            </a>
          </div>

          {/* Dedicated Contact Section ("Liên hệ") */}
          <div id="contact-mobile" className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#EE4D2D]" />
                <span>Liên hệ</span>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Tư vấn 24/7
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2 font-medium">
                <Phone className="w-3.5 h-3.5 text-[#EE4D2D] shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">SĐT / Hotline:</span>
                  <a href="tel:0933040999" className="font-extrabold text-slate-900 hover:text-[#EE4D2D]">
                    0933 040 999
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2 font-medium">
                <MessageCircle className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Zalo Hỗ Trợ:</span>
                  <a
                    href="https://zalo.me/0933040999"
                    target="_blank"
                    rel="noreferrer"
                    className="font-extrabold text-blue-600 hover:underline"
                  >
                    Shop đồ câu Lê Khánh Hòa (0933040999)
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2 font-medium">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Địa chỉ Cửa hàng:</span>
                  <span className="font-semibold text-slate-800 leading-tight block">
                    Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Nghĩa Lâm, Nghĩa Đàn, Nghệ An 70000, Việt Nam.
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Contact Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href="https://zalo.me/0933040999"
                target="_blank"
                rel="noreferrer"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat Zalo</span>
              </a>
              <a
                href="tel:0933040999"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Gọi 0933040999</span>
              </a>
            </div>
          </div>

          {/* Social Media Section ("Mục Mạng Xã Hội") */}
          <div className="bg-slate-900 text-white rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-orange-400 border-b border-slate-800 pb-2">
              <Share2 className="w-3.5 h-3.5 text-orange-400" />
              <span>Mạng Xã Hội LK Hòa</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              {/* TikTok */}
              <a
                href="https://www.tiktok.com/@botoctroiday.lkhoa"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 p-2 rounded-xl transition-colors font-bold text-slate-200"
              >
                <svg className="w-4 h-4 fill-white shrink-0" viewBox="0 0 24 24">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-3.04-1.15z" />
                </svg>
                <span>TikTok LK Hòa</span>
              </a>

              {/* Shopee */}
              <a
                href="https://s.shopee.vn/AKZfxdJSku"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-orange-600/30 hover:bg-orange-600/50 border border-orange-500/40 p-2 rounded-xl transition-colors font-bold text-orange-300"
              >
                <Store className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Shopee LK Hòa</span>
              </a>

              {/* YouTube */}
              <a
                href="https://www.youtube.com/@botoctroidaylk"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-red-950/60 hover:bg-red-900/60 border border-red-800/40 p-2 rounded-xl transition-colors font-bold text-red-300"
              >
                <svg className="w-4 h-4 fill-red-500 shrink-0" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                </svg>
                <span>YouTube LK Hòa</span>
              </a>

              {/* Facebook */}
              <a
                href="https://www.facebook.com/lkhoa0933040999"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 bg-blue-950/60 hover:bg-blue-900/60 border border-blue-800/40 p-2 rounded-xl transition-colors font-bold text-blue-300"
              >
                <svg className="w-4 h-4 fill-blue-400 shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Facebook</span>
              </a>
            </div>
          </div>

          {showAdminButton && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full mt-2 flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-xl text-sm shadow-md"
            >
              <Settings className="w-4 h-4 text-orange-400" />
              <span>Quản Lý (Admin)</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};


