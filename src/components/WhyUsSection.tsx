import React from 'react';
import { CheckCircle2, Headphones, PackageCheck, ShieldCheck } from 'lucide-react';
import { WHY_US_ITEMS } from '../data/products';

export const WhyUsSection: React.FC = () => {
  const renderIcon = (icon: string) => {
    if (icon === 'CheckCircle2') return <CheckCircle2 className="w-5 h-5 text-[#FACC15]" />;
    if (icon === 'PackageCheck') return <PackageCheck className="w-5 h-5 text-emerald-400" />;
    if (icon === 'ShieldCheck') return <ShieldCheck className="w-5 h-5 text-[#F97316]" />;
    return <Headphones className="w-5 h-5 text-[#FACC15]" />;
  };

  return (
    <section id="why-us" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div className="rounded-2xl border border-emerald-900/60 bg-gradient-to-br from-[#111827] via-[#0F172A] to-[#14532D]/40 p-6 sm:p-8 space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[#FACC15]">
              Cam Kết Thương Hiệu Chính Hãng
            </p>
            <h2 className="font-display text-2xl sm:text-3xl font-black text-white mt-1">
              Tiêu Chuẩn Thực Chiến Từ Đồ Câu LK Hòa
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md">
            Mỗi đơn hàng xuất kho đều được kiểm tra khoen đọt và đóng ống nhựa PVC cứng bảo vệ an toàn đến tay cần thủ.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {WHY_US_ITEMS.map((item) => (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800 bg-[#0F172A]/85 p-5 space-y-3"
            >
              <div className="w-10 h-10 rounded-lg bg-[#14532D]/50 border border-emerald-800/70 flex items-center justify-center">
                {renderIcon(item.icon)}
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                {item.title}
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
