import React from 'react';

export function NotFoundPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-16 text-center">
      <h1 className="text-2xl font-black text-slate-900 mb-3">Không tìm thấy trang</h1>
      <p className="text-slate-600 mb-6">Đường dẫn này không tồn tại hoặc đã thay đổi.</p>
      <a href="/san-pham" className="font-bold text-[#EE4D2D] underline">Xem danh mục sản phẩm</a>
    </section>
  );
}
