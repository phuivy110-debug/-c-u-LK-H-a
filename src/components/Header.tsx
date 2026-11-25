import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Menu,
  X,
  Search,
  ShoppingCart,
  Settings,
  ArrowRight,
  ChevronRight,
  Phone,
  MapPin,
} from 'lucide-react';
import { LkHoaLogo } from './LkHoaLogo';
import { MENU_CATEGORIES } from '../data/products';
import type { Product } from '../types';
import { useCart } from '../utils/CartContext';
import { formatPrice, normalizeSearch, productPrice } from '../utils/catalog';
import { GOOGLE_MAPS_STORE_URL, SEARCH_SUGGESTIONS, STORE_HOTLINE } from '../utils/site';

interface HeaderProps {
  onOpenAdmin: () => void;
  productCount: number;
  products?: Product[];
  showAdminButton?: boolean;
  categories?: { name: string; slug: string }[];
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenAdmin,
  products = [],
  showAdminButton = false,
  onNavigate,
  currentPath,
}) => {
  const { totalQuantity, openDrawer } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const searchBoxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMobileMenuOpen(false);
    setSearchFocused(false);
  }, [currentPath]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchBoxRef.current && !searchBoxRef.current.contains(event.target as Node)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (!mobileMenuOpen) return;
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false);
        document.getElementById('mobile-menu-toggle')?.focus();
      }
    };
    document.addEventListener('keydown', close);
    return () => document.removeEventListener('keydown', close);
  }, [mobileMenuOpen]);

  const liveMatches = useMemo(() => {
    const q = normalizeSearch(searchTerm);
    if (!q) return [];
    return products
      .filter((p) => p.status === 'active' && normalizeSearch(`${p.name} ${p.category}`).includes(q))
      .slice(0, 5);
  }, [products, searchTerm]);

  const handleSubmitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const q = searchTerm.trim();
    setSearchFocused(false);
    setMobileMenuOpen(false);
    onNavigate(q ? `/san-pham?q=${encodeURIComponent(q)}` : '/san-pham');
  };

  const handleSelectSuggestion = (keyword: string) => {
    setSearchTerm(keyword);
    setSearchFocused(false);
    setMobileMenuOpen(false);
    onNavigate(`/san-pham?q=${encodeURIComponent(keyword)}`);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#0F172A]/95 backdrop-blur-md border-b border-slate-800 shadow-lg">
      {/* Row 1: Brand + Smart Search + Cart */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 sm:gap-8 h-16">
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="flex items-center cursor-pointer bg-transparent border-0 p-0 shrink-0"
            aria-label="Trang chủ Đồ Câu LK Hòa - Chính Hãng"
          >
            <LkHoaLogo variant="tactical" size={34} />
          </button>

          {/* Desktop Smart Search Bar */}
          <div ref={searchBoxRef} className="hidden md:block relative flex-1 max-w-lg">
            <form onSubmit={handleSubmitSearch} role="search" className="relative flex items-center">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none" />
              <input
                type="search"
                value={searchTerm}
                onFocus={() => setSearchFocused(true)}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setSearchFocused(true);
                }}
                placeholder="Tìm Chuột LK, Cần Solid, Dù PE, Cám chép..."
                aria-label="Tìm kiếm sản phẩm đồ câu LK Hòa"
                className="w-full h-10 pl-10 pr-24 rounded-lg bg-[#111827] border border-slate-700 text-sm text-white placeholder:text-slate-400 focus:border-[#FACC15] focus:outline-none"
              />
              <button
                type="submit"
                className="absolute right-1 h-8 px-3 rounded-md bg-[#14532D] hover:bg-emerald-800 text-white text-xs font-bold whitespace-nowrap cursor-pointer transition-colors"
              >
                Tìm kiếm
              </button>
            </form>

            {searchFocused && (
              <div className="absolute left-0 right-0 top-12 rounded-xl bg-[#111827] border border-slate-700 shadow-2xl p-3 space-y-3 z-50">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Từ khóa tìm kiếm phổ biến
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {SEARCH_SUGGESTIONS.map((kw) => (
                      <button
                        key={kw}
                        type="button"
                        onClick={() => handleSelectSuggestion(kw)}
                        className="px-2.5 py-1.5 rounded-md bg-slate-800 hover:bg-[#14532D] text-xs font-semibold text-slate-200 hover:text-[#FACC15] transition-colors cursor-pointer"
                      >
                        {kw}
                      </button>
                    ))}
                  </div>
                </div>

                {liveMatches.length > 0 && (
                  <div className="border-t border-slate-800 pt-2.5 space-y-1.5">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                      Sản phẩm khớp từ khóa
                    </p>
                    {liveMatches.map((prod) => (
                      <button
                        key={prod.id}
                        type="button"
                        onClick={() => {
                          setSearchFocused(false);
                          onNavigate(`/san-pham/${prod.slug}`);
                        }}
                        className="w-full flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-slate-800/80 text-left cursor-pointer transition-colors"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {prod.imageUrl && (
                            <img
                              src={prod.imageUrl}
                              alt={prod.name}
                              referrerPolicy="no-referrer"
                              className="w-9 h-9 rounded object-cover shrink-0 bg-slate-800"
                            />
                          )}
                          <span className="text-xs font-semibold text-slate-100 truncate">{prod.name}</span>
                        </div>
                        <span className="text-xs font-bold text-[#FACC15] tabular-nums shrink-0">
                          {productPrice(prod) ? formatPrice(productPrice(prod)) : 'Xem giá'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Controls: Cart + Mobile Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            {showAdminButton && (
              <button
                type="button"
                onClick={onOpenAdmin}
                className="hidden lg:inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 cursor-pointer whitespace-nowrap"
              >
                <Settings className="w-3.5 h-3.5 text-[#FACC15]" />
                <span>Admin</span>
              </button>
            )}

            <button
              type="button"
              onClick={openDrawer}
              aria-label={`Mở giỏ hàng (${totalQuantity} sản phẩm)`}
              className="relative min-h-11 px-3 sm:px-4 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer whitespace-nowrap shrink-0 transition-colors"
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Giỏ hàng</span>
              <span className="inline-flex items-center justify-center min-w-5 h-5 px-1 rounded bg-[#0F172A] text-[#FACC15] text-[11px] font-bold tabular-nums">
                {totalQuantity}
              </span>
            </button>

            <button
              type="button"
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen((v) => !v)}
              aria-label={mobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className="lg:hidden min-w-11 min-h-11 p-2 rounded-lg bg-slate-800/80 text-slate-100 hover:bg-slate-700 flex items-center justify-center cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Row 2: Desktop 7 Standard Categories Navigation */}
      <nav
        aria-label="Danh mục trang bị LK Hòa"
        className="hidden lg:block border-t border-slate-800/80 bg-[#111827]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-4 h-11 overflow-x-auto">
          <div className="flex items-center gap-5">
            {MENU_CATEGORIES.map((cat) => {
              const path = `/danh-muc/${cat.slug}`;
              const active = currentPath === path;
              return (
                <button
                  key={cat.slug}
                  type="button"
                  onClick={() => onNavigate(path)}
                  className={`text-xs font-bold whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                    active
                      ? 'text-[#FACC15] border-[#FACC15]'
                      : 'text-slate-300 border-transparent hover:text-white hover:border-slate-500'
                  }`}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-5 shrink-0">
            <button
              type="button"
              onClick={() => onNavigate('/san-pham')}
              className={`text-xs font-bold whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                currentPath === '/san-pham'
                  ? 'text-[#FACC15] border-[#FACC15]'
                  : 'text-slate-300 border-transparent hover:text-white'
              }`}
            >
              Tất Cả SP
            </button>
            <button
              type="button"
              onClick={() => onNavigate('/cam-nang')}
              className={`text-xs font-bold whitespace-nowrap shrink-0 py-1 border-b-2 transition-colors cursor-pointer ${
                currentPath.startsWith('/cam-nang')
                  ? 'text-[#FACC15] border-[#FACC15]'
                  : 'text-slate-300 border-transparent hover:text-white'
              }`}
            >
              Cẩm Nang
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div
          id="mobile-menu"
          className="lg:hidden border-t border-slate-800 bg-[#111827] px-4 py-4 space-y-4 max-h-[82vh] overflow-y-auto shadow-2xl"
        >
          <form onSubmit={handleSubmitSearch} role="search" className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm Chuột LK, Cần Solid, Dù PE..."
                className="w-full h-11 pl-9 pr-3 rounded-lg bg-[#0F172A] border border-slate-700 text-sm text-white placeholder:text-slate-400 focus:border-[#FACC15] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-11 px-4 rounded-lg bg-[#FACC15] text-[#0F172A] text-xs font-extrabold whitespace-nowrap cursor-pointer"
            >
              Tìm
            </button>
          </form>

          <div className="flex flex-wrap gap-1.5">
            {SEARCH_SUGGESTIONS.slice(0, 4).map((kw) => (
              <button
                key={kw}
                type="button"
                onClick={() => handleSelectSuggestion(kw)}
                className="px-2.5 py-1.5 rounded bg-slate-800 text-xs font-semibold text-slate-200 cursor-pointer"
              >
                {kw}
              </button>
            ))}
          </div>

          <div className="space-y-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-1 pb-1">
              7 Danh Mục Chính Hãng
            </p>
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate(`/danh-muc/${cat.slug}`);
                }}
                className="w-full min-h-11 px-3 py-2.5 rounded-lg flex items-center justify-between text-sm font-semibold text-slate-100 hover:bg-slate-800 cursor-pointer"
              >
                <span>{cat.name}</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/san-pham');
              }}
              className="w-full min-h-11 px-3 py-2.5 rounded-lg flex items-center justify-between text-sm font-bold text-[#FACC15] hover:bg-slate-800 cursor-pointer"
            >
              <span>Tất cả sản phẩm LK Hòa</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onNavigate('/cam-nang');
              }}
              className="w-full min-h-11 px-3 py-2.5 rounded-lg flex items-center justify-between text-sm font-semibold text-slate-200 hover:bg-slate-800 cursor-pointer"
            >
              <span>Cẩm Nang & Kỹ Thuật Câu</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
            <a href={`tel:${STORE_HOTLINE.replace(/\s+/g, '')}`} className="flex items-center gap-2 font-bold text-white">
              <Phone className="w-4 h-4 text-[#FACC15]" />
              Hotline đặt hàng: {STORE_HOTLINE}
            </a>
            <a
              href={GOOGLE_MAPS_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-2 text-slate-400 hover:text-white"
            >
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>Nghĩa Lâm, Nghĩa Đàn, Nghệ An (Xem Google Maps)</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
};
