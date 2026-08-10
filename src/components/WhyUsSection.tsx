import React from 'react';
import { ShieldCheck, BadgePercent, CheckCircle2, Clock, Sparkles } from 'lucide-react';
import { WHY_US_ITEMS } from '../data/products';

const iconMap: Record<string, React.ReactNode> = {
  ShieldCheck: <ShieldCheck className="w-6 h-6 text-[#EE4D2D]" />,
  BadgePercent: <BadgePercent className="w-6 h-6 text-amber-500" />,
  CheckCircle2: <CheckCircle2 className="w-6 h-6 text-emerald-500" />,
  Clock: <Clock className="w-6 h-6 text-blue-500" />,
};

export const WhyUsSection: React.FC = () => {
  return (
    <section id="reasons" className="py-12 sm:py-16 bg-[#F6F7FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 bg-orange-100/80 text-[#EE4D2D] px-3.5 py-1 rounded-full text-xs font-bold mb-2">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Cam Kết Uy Tín & Min Báo</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Lý Do Nên Mua Qua Website Này
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-slate-500 font-medium">
            Chúng tôi giúp bạn tiết kiệm thời gian săn deal, mua đúng sản phẩm chính hãng với giá thực sự ưu đãi.
          </p>
        </div>

        {/* Bento Grid layout for Why Us */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {WHY_US_ITEMS.map((item, index) => {
            // First item gets a wider col-span for bento variation
            const isWide = index === 0;
            return (
              <div
                key={item.id}
                className={`${
                  isWide ? 'md:col-span-6 bg-white border border-slate-200/80' : 'md:col-span-6 lg:col-span-3 bg-white border border-slate-200/80'
                } p-6 sm:p-8 rounded-[2rem] shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow`}
              >
                <div>
                  <div className="w-12 h-12 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center mb-4">
                    {iconMap[item.icon]}
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400 font-medium">
                  <span className="text-[#EE4D2D] font-bold">✓ Cam kết 100%</span>
                  <span>Shopee Mall</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Shopee Guarantee Bento Banner */}
        <div className="mt-6 bg-[#EE4D2D] p-6 sm:p-8 rounded-[2rem] text-white shadow-lg shadow-orange-500/15 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1.5 text-center md:text-left">
            <span className="bg-white/20 text-white text-[11px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
              An Tâm Săn Deal
            </span>
            <h3 className="text-lg sm:text-2xl font-black">
              Chuyển Hướng Trực Tiếp Tới Shopee App & Web
            </h3>
            <p className="text-xs sm:text-sm text-orange-100 max-w-xl">
              Không thu thập dữ liệu cá nhân, không đăng nhập. Hưởng đầy đủ xu Shopee, mã giảm giá ship và chính sách bảo hành chính hãng.
            </p>
          </div>
          <a
            href="#catalog"
            className="bg-white hover:bg-orange-50 text-[#EE4D2D] font-black text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-sm transition-transform active:scale-95 whitespace-nowrap cursor-pointer shrink-0"
          >
            Khám Phá Deal Hot →
          </a>
        </div>

      </div>
    </section>
  );
};
