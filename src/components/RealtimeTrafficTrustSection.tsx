import React from 'react';
import {
  ShieldCheck,
  PackageCheck,
  Headphones,
  Truck,
  Phone,
  MessageCircle,
  Sparkles,
  ArrowRight,
  Store
} from 'lucide-react';
import { SHARED_TIKTOK_URL } from '../utils/googleSheetSync';

interface RealtimeTrafficTrustSectionProps {
  onScrollToCatalog?: () => void;
}

export const RealtimeTrafficTrustSection: React.FC<RealtimeTrafficTrustSectionProps> = ({
  onScrollToCatalog,
}) => {
  return (
    <section className="py-8 sm:py-10 bg-gradient-to-b from-[#F6F7FB] via-white to-[#F6F7FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-orange-100 text-[#EE4D2D] px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Uy Tín Tạo Nên Thương Hiệu</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 flex-wrap">
              <span>Cam Kết Chất Lượng & Dịch Vụ Đồ Câu LK Hòa</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              100% sản phẩm đồ câu chính hãng, được kiểm định thực tế và đóng gói cẩn thận trước khi gửi đến tay anh em cần thủ trên mọi miền tổ quốc.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
            <a
              href="https://s.shopee.vn/7fYvAFHqaP"
              target="_blank"
              rel="sponsored nofollow noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-[#EE4D2D] hover:bg-orange-600 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <Store className="w-4 h-4" />
              <span>Shopee Mall LK Hòa</span>
            </a>
          </div>
        </div>

        {/* 4 Core Trust Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          
          {/* Card 1: 100% Chính Hãng */}
          <div className="relative bg-white p-5 rounded-2xl sm:rounded-3xl border border-orange-100 shadow-xs hover:shadow-md transition-shadow group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#EE4D2D] flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  100% Chính Hãng LK Hòa
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                  Sản phẩm nguồn gốc rõ ràng, kiểm định chất lượng nghiêm ngặt trước khi xuất xưởng đến tay khách hàng.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-orange-600 font-bold flex items-center gap-1">
                <span>✓ Đảm bảo quyền lợi tuyệt đối</span>
              </div>
            </div>
          </div>

          {/* Card 2: Đóng Gói Ống Nhựa Chống Gãy */}
          <div className="relative bg-white p-5 rounded-2xl sm:rounded-3xl border border-blue-100 shadow-xs hover:shadow-md transition-shadow group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <PackageCheck className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Đóng Gói Ống Nhựa Chống Gãy
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                  Cần câu được bảo vệ bằng ống nhựa PVC chịu lực và bọt xốp chuyên dụng, chống va đập và gãy ngọn khi vận chuyển.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-blue-600 font-bold flex items-center gap-1">
                <span>✓ An tâm tuyệt đối khi nhận hàng</span>
              </div>
            </div>
          </div>

          {/* Card 3: Tư Vấn Kỹ Thuật 24/7 */}
          <div className="relative bg-white p-5 rounded-2xl sm:rounded-3xl border border-emerald-100 shadow-xs hover:shadow-md transition-shadow group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                <Headphones className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Tư Vấn Kỹ Thuật Đồ Câu
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                  Đội ngũ cần thủ dày dặn kinh nghiệm luôn sẵn sàng tư vấn chọn đúng cần, mồi và dây câu phù hợp từng địa hình.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span>✓ Hotline / Zalo: 0933 040 999</span>
              </div>
            </div>
          </div>

          {/* Card 4: Giao Nhanh Toàn Quốc */}
          <div className="relative bg-white p-5 rounded-2xl sm:rounded-3xl border border-amber-100 shadow-xs hover:shadow-md transition-shadow group">
            <div className="space-y-3">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>

              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  Giao Hàng & Đồng Kiểm
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">
                  Vận chuyển hỏa tốc toàn quốc qua các đơn vị uy tín, hỗ trợ đồng kiểm và đổi trả nhanh chóng theo quy định.
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-amber-600 font-bold flex items-center gap-1">
                <span>✓ Hỗ trợ thanh toán linh hoạt</span>
              </div>
            </div>
          </div>

        </div>

        {/* Quick Contact & Consultation Bar */}
        <div className="bg-slate-900 text-slate-200 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/30">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-white">
                Cần tư vấn đồ câu phù hợp với nhu cầu của bạn?
              </div>
              <div className="text-xs text-slate-400">
                Liên hệ ngay đội ngũ Đồ Câu LK Hòa để được hỗ trợ kỹ thuật và nhận ưu đãi tốt nhất.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="tel:0933040999"
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-colors"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Gọi 0933 040 999</span>
            </a>

            <a
              href="https://zalo.me/0933040999"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-extrabold transition-colors"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>Chat Zalo</span>
            </a>
          </div>
        </div>

      </div>
    </section>
  );
};
