import React from 'react';
import {
  ArrowUp,
  Clock,
  Compass,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Store,
} from 'lucide-react';
import { LkHoaLogo } from './LkHoaLogo';
import { SHARED_TIKTOK_URL } from '../utils/googleSheetSync';
import {
  GOOGLE_MAPS_STORE_URL,
  STORE_ADDRESS,
  STORE_EMAIL,
  STORE_HOTLINE,
  STORE_HOURS,
  STORE_NAME,
  ZALO_CHAT_URL,
} from '../utils/site';

interface FooterProps {
  onNavigate?: (path: string) => void;
}

const TikTokIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-2.901 2.89 2.893 2.893 0 0 1-2.89-2.89 2.893 2.893 0 0 1 2.89-2.89c.28 0 .543.044.793.122v-3.52a6.333 6.333 0 0 0-.793-.05A6.338 6.338 0 0 0 3.125 15.68 6.338 6.338 0 0 0 9.463 22a6.338 6.338 0 0 0 6.338-6.32V9.043a8.163 8.163 0 0 0 4.788 1.536V7.134a4.832 4.832 0 0 1-1.000-.448z" />
  </svg>
);

export const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLink = (e: React.MouseEvent, path: string) => {
    if (onNavigate && e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey) {
      e.preventDefault();
      onNavigate(path);
    }
  };

  return (
    <footer className="bg-[#0B1120] text-slate-300 pt-14 pb-24 md:pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-slate-800">
          {/* Column 1: Official Brand & Store Info */}
          <div className="md:col-span-4 space-y-4">
            <LkHoaLogo variant="tactical" size={36} />
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Hệ thống bán lẻ trang bị câu cá thực chiến chính hãng <strong>{STORE_NAME}</strong> (docaulkhoa.vn). Giao hàng toàn quốc, đóng ống PVC bảo vệ ngọn cần, hỗ trợ COD đồng kiểm &amp; VietQR.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-400">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>Đổi mới 1-1 trong 7 ngày · Bảo hành ngọn cần</span>
            </div>
          </div>

          {/* Column 2: Contact Info Matching Google Maps */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Thông Tin Cửa Hàng Chính Chủ
            </h3>
            <div className="space-y-2.5 text-xs text-slate-300">
              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-[#FACC15] shrink-0 mt-0.5" />
                <a
                  href={GOOGLE_MAPS_STORE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-[#FACC15] transition-colors leading-relaxed"
                >
                  {STORE_ADDRESS}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <a href={`tel:${STORE_HOTLINE.replace(/\s+/g, '')}`} className="font-bold text-white hover:text-[#FACC15]">
                  Hotline / Đặt hàng: {STORE_HOTLINE}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-[#F97316] shrink-0" />
                <a href={`mailto:${STORE_EMAIL}`} className="hover:text-[#FACC15]">
                  Email hỗ trợ: {STORE_EMAIL}
                </a>
              </div>
              <div className="flex items-center gap-2.5">
                <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Giờ làm việc: {STORE_HOURS}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MessageCircle className="w-4 h-4 text-sky-400 shrink-0" />
                <a
                  href={ZALO_CHAT_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-sky-400 hover:underline"
                >
                  Chat Zalo Hỗ Trợ Kỹ Thuật
                </a>
              </div>
            </div>
          </div>

          {/* Column 3: 4 Mandatory Google Merchant Center Policies */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Chính Sách Mua Hàng
            </h3>
            <nav aria-label="Chính sách Google Merchant Center" className="flex flex-col gap-2.5 text-xs">
              <a
                href="/chinh-sach-bao-hanh-doi-tra"
                onClick={(e) => handleLink(e, '/chinh-sach-bao-hanh-doi-tra')}
                className="text-slate-300 hover:text-[#FACC15] transition-colors"
              >
                Chính sách bảo hành &amp; Đổi trả
              </a>
              <a
                href="/chinh-sach-van-chuyen"
                onClick={(e) => handleLink(e, '/chinh-sach-van-chuyen')}
                className="text-slate-300 hover:text-[#FACC15] transition-colors"
              >
                Chính sách vận chuyển &amp; Giao nhận
              </a>
              <a
                href="/chinh-sach-thanh-toan"
                onClick={(e) => handleLink(e, '/chinh-sach-thanh-toan')}
                className="text-slate-300 hover:text-[#FACC15] transition-colors"
              >
                Chính sách thanh toán
              </a>
              <a
                href="/quyen-rieng-tu"
                onClick={(e) => handleLink(e, '/quyen-rieng-tu')}
                className="text-slate-300 hover:text-[#FACC15] transition-colors"
              >
                Chính sách bảo mật thông tin
              </a>
              <a
                href="/gioi-thieu-phuong-phap-danh-gia"
                onClick={(e) => handleLink(e, '/gioi-thieu-phuong-phap-danh-gia')}
                className="text-slate-300 hover:text-[#FACC15] transition-colors"
              >
                Giới thiệu &amp; Kiểm nghiệm
              </a>
            </nav>
          </div>

          {/* Column 4: Store Channels */}
          <div className="md:col-span-2 space-y-3">
            <h3 className="text-xs font-black text-white uppercase tracking-wider">
              Kênh Chính Hãng
            </h3>
            <div className="flex flex-col gap-2 text-xs">
              <a
                href={GOOGLE_MAPS_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#111827] hover:border-slate-600 p-2.5 font-semibold text-slate-200"
              >
                <Compass className="w-4 h-4 text-[#FACC15] shrink-0" />
                <span>Google Maps Cửa Hàng</span>
              </a>
              <a
                href="https://s.shopee.vn/7fYvAFHqaP"
                target="_blank"
                rel="nofollow sponsored noopener"
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#111827] hover:border-[#F97316] p-2.5 font-semibold text-[#F97316]"
              >
                <Store className="w-4 h-4 shrink-0" />
                <span>Gian hàng Shopee</span>
              </a>
              <a
                href={SHARED_TIKTOK_URL}
                target="_blank"
                rel="nofollow sponsored noopener"
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-[#111827] hover:border-slate-600 p-2.5 font-semibold text-white"
              >
                <TikTokIcon className="w-4 h-4 shrink-0" />
                <span>Gian hàng TikTok Shop</span>
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            © {new Date().getFullYear()} {STORE_NAME} (docaulkhoa.vn). Tất cả sản phẩm và liên kết sàn đều được xác thực chính chủ.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-[#111827] hover:bg-slate-800 text-slate-200 px-3.5 py-2 text-xs font-bold cursor-pointer shrink-0"
          >
            <span>Về Đầu Trang</span>
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>
      </div>
    </footer>
  );
};
