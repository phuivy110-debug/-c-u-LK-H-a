import React, { useState } from 'react';
import {
  Settings,
  Menu,
  X,
  Phone,
  MessageCircle,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Share2,
  Search,
} from 'lucide-react';
import { LkHoaLogo } from './LkHoaLogo';
import { SHARED_TIKTOK_URL } from '../utils/googleSheetSync';

interface HeaderProps {
  onOpenAdmin: () => void;
  productCount: number;
  showAdminButton?: boolean;
  categories?: { name: string; slug: string }[];
  onNavigate: (path: string) => void;
  currentPath: string;
}

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-3.5 h-3.5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.901 2.89 2.893 2.893 0 0 1-2.89-2.89 2.893 2.893 0 0 1 2.89-2.89c.28 0 .543.044.793.122v-3.52a6.333 6.333 0 0 0-.793-.05A6.338 6.338 0 0 0 3.125 15.68 6.338 6.338 0 0 0 9.463 22a6.338 6.338 0 0 0 6.338-6.32V9.043a8.163 8.163 0 0 0 4.788 1.536V7.134a4.832 4.832 0 0 1-1.000-.448z" />
  </svg>
);

export const Header: React.FC<HeaderProps> = ({
  onOpenAdmin,
  productCount,
  showAdminButton = false,
  categories = [],
  onNavigate,
  currentPath,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);

  const handleCategoryClick = (slug: string) => {
    setMobileMenuOpen(false);
    onNavigate(`/danh-muc/${slug}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-100 shadow-xs">
      {/* Top Banner Bar */}
      <div className="bg-gradient-to-r from-orange-600 via-slate-900 to-slate-950 text-white text-xs font-semibold py-1.5 px-4 text-center flex items-center justify-center gap-2 flex-wrap">
        <span>Trang Chủ Đồ Câu LK Hòa – Mồi Câu, Cần Câu, Phụ Kiện & Kinh Nghiệm Câu Cá</span>
        <div className="flex items-center gap-1.5 ml-1">
          <a
            href="https://s.shopee.vn/7fYvAFHqaP"
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="bg-[#EE4D2D] hover:bg-orange-600 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors"
          >
            <span>Shopee LK Hòa</span>
          </a>
          <a
            href={SHARED_TIKTOK_URL}
            target="_blank"
            rel="sponsored nofollow noopener noreferrer"
            className="bg-black hover:bg-slate-800 text-white px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-1 transition-colors border border-slate-700"
          >
            <TikTokIcon className="w-2.5 h-2.5 fill-current text-white" />
            <span>TikTok Shop</span>
          </a>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <button
            onClick={() => onNavigate('/')}
            className="flex items-center gap-2 cursor-pointer border-none bg-transparent"
            aria-label="Trang chủ LK Hòa"
          >
            <LkHoaLogo size={42} />
          </button>

          {/* Main Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-5 text-sm font-bold text-slate-700">
            <button
              onClick={() => onNavigate('/')}
              className={`hover:text-[#EE4D2D] transition-colors cursor-pointer ${
                currentPath === '/' ? 'text-[#EE4D2D]' : ''
              }`}
            >
              Trang Chủ
            </button>
            <button
              onClick={() => onNavigate('/san-pham')}
              className={`hover:text-[#EE4D2D] transition-colors cursor-pointer flex items-center gap-1 ${
                currentPath.startsWith('/san-pham') ? 'text-[#EE4D2D]' : ''
              }`}
            >
              <span>Sản Phẩm</span>
              <span className="bg-orange-100 text-[#EE4D2D] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                {productCount}
              </span>
            </button>
            <button
              onClick={() => onNavigate('/danh-muc/can-cau')}
              className="hover:text-[#EE4D2D] transition-colors cursor-pointer"
            >
              Cần Câu
            </button>
            <button
              onClick={() => onNavigate('/danh-muc/may-cau')}
              className="hover:text-[#EE4D2D] transition-colors cursor-pointer"
            >
              Máy Câu
            </button>
            <button
              onClick={() => onNavigate('/danh-muc/moi-cau')}
              className="hover:text-[#EE4D2D] transition-colors cursor-pointer"
            >
              Mồi Câu
            </button>
            <button
              onClick={() => onNavigate('/danh-muc/phu-kien')}
              className="hover:text-[#EE4D2D] transition-colors cursor-pointer"
            >
              Phụ Kiện
            </button>

            {/* Admin Button */}
            {showAdminButton && (
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer ml-2"
                title="Cấu hình Google Sheet"
              >
                <Settings className="w-3.5 h-3.5 text-orange-400" />
                <span>Admin</span>
              </button>
            )}
          </nav>

          {/* Right Controls */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => onNavigate('/san-pham')}
              className="p-2 text-slate-600 hover:text-[#EE4D2D] rounded-xl hover:bg-slate-50 cursor-pointer"
              aria-label="Tìm kiếm sản phẩm"
            >
              <Search className="w-5 h-5" />
            </button>

            <a
              href={SHARED_TIKTOK_URL}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 text-white hover:bg-black px-3.5 py-2 rounded-xl text-xs font-bold transition-all group/tt"
              title="Ghé TikTok Shop LK Hòa"
            >
              <TikTokIcon className="w-3.5 h-3.5 fill-current text-white" />
              <span>Xem gian hàng TikTok</span>
              <ExternalLink className="w-3 h-3 text-slate-300 opacity-70 group-hover/tt:opacity-100" />
            </a>
          </div>

          {/* Mobile Toggle */}
          <div className="flex items-center gap-2 lg:hidden">
            <button
              onClick={() => onNavigate('/san-pham')}
              className="p-2 text-slate-700 rounded-xl hover:bg-slate-100"
              aria-label="Tìm kiếm sản phẩm"
            >
              <Search className="w-5 h-5" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 rounded-xl hover:bg-slate-100 focus:outline-hidden cursor-pointer"
              aria-label="Mở menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-100 bg-white px-4 pt-3 pb-6 space-y-4 shadow-xl max-h-[88vh] overflow-y-auto">
          <div className="space-y-1">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/');
              }}
              className="w-full text-left py-2.5 px-3 text-sm font-bold text-slate-800 rounded-xl hover:bg-slate-50 transition-colors"
            >
              🏠 Trang Chủ
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/san-pham');
              }}
              className="w-full text-left py-2.5 px-3 text-sm font-bold text-slate-800 rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-between"
            >
              <span>🎣 Tất Cả Sản Phẩm</span>
              <span className="bg-orange-100 text-[#EE4D2D] text-xs px-2 py-0.5 rounded-full">
                {productCount}
              </span>
            </button>

            {/* Categories Accordion */}
            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/50 overflow-hidden">
              <button
                onClick={() => setCategoriesOpen(!categoriesOpen)}
                className="w-full flex items-center justify-between p-3 text-sm font-extrabold text-slate-800 hover:bg-slate-100/60 transition-colors cursor-pointer"
              >
                <span>📁 Danh Mục Sản Phẩm</span>
                {categoriesOpen ? (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                )}
              </button>

              {categoriesOpen && (
                <div className="px-2 pb-2.5 space-y-1 pt-1 border-t border-slate-200/60 bg-white">
                  {categories.map((cat) => (
                    <button
                      key={cat.slug}
                      onClick={() => handleCategoryClick(cat.slug)}
                      className="w-full text-left flex items-center justify-between py-2 px-3 text-xs font-bold text-slate-700 hover:text-[#EE4D2D] hover:bg-orange-50 rounded-xl transition-all cursor-pointer"
                    >
                      <span>{cat.name}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 space-y-2">
            <a
              href={SHARED_TIKTOK_URL}
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="w-full bg-slate-900 text-white font-extrabold py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <TikTokIcon className="w-4 h-4 fill-current text-white" />
              <span>Xem gian hàng TikTok</span>
            </a>
          </div>

          {/* Contact Details */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#EE4D2D]" />
                <span>Liên hệ cửa hàng</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-start gap-2 font-medium">
                <Phone className="w-3.5 h-3.5 text-[#EE4D2D] shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Hotline:</span>
                  <a href="tel:0933040999" className="font-extrabold text-slate-900 hover:text-[#EE4D2D]">
                    0933 040 999
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2 font-medium">
                <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 block text-[10px]">Địa chỉ Cửa hàng:</span>
                  <span className="font-semibold text-slate-800 leading-tight block">
                    Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Nghĩa Lâm, Nghĩa Đàn, Nghệ An
                  </span>
                </div>
              </div>
            </div>
          </div>

          {showAdminButton && (
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenAdmin();
              }}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white font-bold py-3 rounded-xl text-xs"
            >
              <Settings className="w-4 h-4 text-orange-400" />
              <span>Quản Lý Admin</span>
            </button>
          )}
        </div>
      )}
    </header>
  );
};
