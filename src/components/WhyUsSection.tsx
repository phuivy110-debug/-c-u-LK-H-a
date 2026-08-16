import React from 'react';
import {
  ShieldCheck,
  PackageCheck,
  Headphones,
  Truck,
  Phone,
  MessageCircle,
  Sparkles,
  Store,
  CheckCircle2,
  BadgePercent,
  Clock,
  ArrowRight
} from 'lucide-react';
import { WHY_US_ITEMS } from '../data/products';

export const WhyUsSection: React.FC = () => {
  return (
    <section id="why-us" className="py-12 sm:py-16 bg-[#F6F7FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 bg-orange-100 text-[#EE4D2D] px-3.5 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Uy Tín Tạo Nên Thương Hiệu</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Cam Kết Chất Lượng & Lý Do Chọn Đồ Câu LK Hòa
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
            100% sản phẩm đồ câu chính hãng, được kiểm định thực tế và đóng gói cẩn thận bằng ống nhựa chuyên dụng trước khi gửi đến tay anh em cần thủ trên mọi miền tổ quốc.
          </p>
        </div>

        {/* 4 Core Quality & Service Commitment Cards */}
        <div>
          <div className="text-xs font-extrabold text-[#EE4D2D] uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#EE4D2D]" />
            <span>4 Cam Kết Dịch Vụ & Đóng Gói Vận Chuyển</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            
            {/* Card 1: 100% Chính Hãng */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-orange-100 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-orange-50 text-[#EE4D2D] flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
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
              </div>
              <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] text-[#EE4D2D] font-bold flex items-center gap-1">
                <span>✓ Đảm bảo quyền lợi tuyệt đối</span>
              </div>
            </div>

            {/* Card 2: Đóng Gói Ống Nhựa Chống Gãy */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-100 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
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
              </div>
              <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] text-blue-600 font-bold flex items-center gap-1">
                <span>✓ An tâm tuyệt đối khi nhận hàng</span>
              </div>
            </div>

            {/* Card 3: Tư Vấn Kỹ Thuật 24/7 */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-emerald-100 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
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
              </div>
              <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                <span>✓ Hotline / Zalo: 0933 040 999</span>
              </div>
            </div>

            {/* Card 4: Giao Nhanh Toàn Quốc */}
            <div className="bg-white p-5 sm:p-6 rounded-2xl sm:rounded-3xl border border-amber-100 shadow-xs hover:shadow-md transition-all group flex flex-col justify-between">
              <div className="space-y-3">
                <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold group-hover:scale-105 transition-transform">
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
              </div>
              <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] text-amber-600 font-bold flex items-center gap-1">
                <span>✓ Hỗ trợ thanh toán linh hoạt</span>
              </div>
            </div>

          </div>
        </div>

        {/* 4 Reasons & Advantages Grid */}
        <div>
          <div className="text-xs font-extrabold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-400" />
            <span>Tiện Ích Tra Cứu & Trải Nghiệm Mua Hàng</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {WHY_US_ITEMS.map((item, index) => {
              return (
                <div
                  key={item.id}
                  className="bg-white p-5 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-xs flex flex-col justify-between hover:shadow-md transition-all group"
                >
                  <div className="space-y-2.5">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-700 group-hover:bg-orange-50 group-hover:text-[#EE4D2D] transition-colors">
                      {index === 0 && <ShieldCheck className="w-5 h-5 text-[#EE4D2D]" />}
                      {index === 1 && <BadgePercent className="w-5 h-5 text-amber-500" />}
                      {index === 2 && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
                      {index === 3 && <Clock className="w-5 h-5 text-blue-500" />}
                    </div>
                    <h4 className="text-sm font-extrabold text-slate-900">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-100 text-[11px] text-slate-400 font-medium flex items-center justify-between">
                    <span className="text-[#EE4D2D] font-bold">✓ Minh bạch</span>
                    <span>LK Hòa Official</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Shopee & TikTok Guarantee Banner + Fast Consultation */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          
          {/* Marketplace Direct Guarantee */}
          <div className="lg:col-span-7 bg-[#EE4D2D] p-6 sm:p-7 rounded-2xl sm:rounded-3xl text-white shadow-lg shadow-orange-500/15 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[11px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider">
                <Store className="w-3.5 h-3.5" />
                <span>An Tâm Mua Sắm 100%</span>
              </div>
              <h3 className="text-lg sm:text-xl font-black">
                Mở Trực Tiếp Trên Ứng Dụng Shopee & TikTok Shop
              </h3>
              <p className="text-xs sm:text-sm text-orange-100 leading-relaxed">
                Nút bấm chuyển hướng thẳng tới Cửa Hàng LK Hòa chính hãng trên ứng dụng Shopee & TikTok Shop. Không cần nhập mật khẩu trên web, tuyệt đối an toàn và hỗ trợ áp mã giảm giá chính thức.
              </p>
            </div>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <a
                href="https://s.shopee.vn/7fYvAFHqaP"
                target="_blank"
                rel="sponsored nofollow noopener noreferrer"
                className="bg-white hover:bg-orange-50 text-[#EE4D2D] font-black text-xs px-4 py-2.5 rounded-xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 cursor-pointer"
              >
                <span>Shopee Mall LK Hòa</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </a>
              <a
                href="#catalog"
                className="bg-orange-700/60 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl transition-colors"
              >
                <span>Xem danh mục sản phẩm</span>
              </a>
            </div>
          </div>

          {/* Quick Technical Contact Bar */}
          <div className="lg:col-span-5 bg-slate-900 text-slate-200 p-6 sm:p-7 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-sm flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Hỗ Trợ Kỹ Thuật Trực Tiếp</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">
                Cần Tư Vấn Chọn Cần & Mồi Câu?
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Liên hệ ngay đội ngũ Đồ Câu LK Hòa để được hướng dẫn chọn cần câu, mồi cám chép, mồi rô phi và phụ kiện chuẩn bài nhất.
              </p>
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <a
                href="tel:0933040999"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 px-3 rounded-xl text-xs font-extrabold transition-colors shadow-xs"
              >
                <Phone className="w-3.5 h-3.5" />
                <span>Gọi 0933 040 999</span>
              </a>

              <a
                href="https://zalo.me/0933040999"
                target="_blank"
                rel="noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white py-2.5 px-3 rounded-xl text-xs font-extrabold transition-colors shadow-xs"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Chat Zalo</span>
              </a>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
};
