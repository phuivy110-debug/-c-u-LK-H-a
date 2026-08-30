import React from 'react';

export const WhyUsSection: React.FC = () => (
  <section id="why-us" className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
    <h2 className="text-xl font-bold text-slate-900">Thông tin minh bạch</h2>
    <p className="mt-3 text-sm text-slate-600 leading-relaxed">
      docaulkhoa.vn tổng hợp thông tin đồ câu và liên kết mua hàng.
      Thông số từ danh mục không thay thế kết quả thử thực tế; giá và chính sách cần kiểm tra lại với người bán.
    </p>
    <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-[#EE4D2D]">
      <a href="/gioi-thieu-phuong-phap-danh-gia" className="hover:underline">Phương pháp đánh giá</a>
      <a href="/san-pham" className="hover:underline">Xem danh mục sản phẩm</a>
    </div>
  </section>
);
