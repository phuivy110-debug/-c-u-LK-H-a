import React from 'react';

export function NotFoundPage() {
  return (
    <section className="max-w-4xl mx-auto px-4 py-16 text-center space-y-4">
      <h1 className="text-2xl font-black text-white font-display">Không tìm thấy trang</h1>
      <p className="text-slate-400">Đường dẫn này không tồn tại hoặc đã thay đổi.</p>
      <a href="/san-pham" className="inline-block font-bold text-[#FACC15] hover:underline">
        Xem danh mục sản phẩm LK Hòa
      </a>
    </section>
  );
}
