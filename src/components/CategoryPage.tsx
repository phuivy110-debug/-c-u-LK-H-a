import React, { useMemo, useState } from 'react';
import { Product } from '../types';
import { CATEGORIES } from '../data/products';
import { ChevronRight, ArrowLeft, AlertCircle, BookOpen, HelpCircle, CheckCircle2, Table, Info } from 'lucide-react';
import { ProductCard } from './ProductCard';
import { CatalogControls } from './CatalogControls';

interface CategoryPageProps {
  categorySlug: string;
  products: Product[];
  onNavigate: (path: string) => void;
  onOpenDetail: (product: Product) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  categorySlug,
  products,
  onNavigate,
  onOpenDetail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price-asc' | 'price-desc' | 'name-asc'>('default');

  const currentCategory = useMemo(() => {
    return CATEGORIES.find((c) => c.slug === categorySlug);
  }, [categorySlug]);

  const categoryName = currentCategory ? currentCategory.name : 'Danh Mục Sản Phẩm';
  const categoryDesc = currentCategory ? currentCategory.description : '';

  // Filter products by category & active status
  const filteredProducts = useMemo(() => {
    let list = products.filter((p) => p.status === 'active');

    if (categorySlug !== 'tat-ca') {
      list = list.filter((p) => {
        if (!p.category) return false;
        const normCat = p.category
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]/g, '');

        const normTarget = categoryName
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/đ/g, 'd')
          .replace(/[^a-z0-9]/g, '');

        const slugTarget = categorySlug.replace(/-/g, '');

        return normCat.includes(normTarget) || normCat.includes(slugTarget);
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
      list = list.filter((p) => {
        const normName = p.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
        const normDesc = (p.description || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');
        return normName.includes(q) || normDesc.includes(q);
      });
    }

    // Sort
    if (sortBy === 'price-asc') {
      list.sort((a, b) => {
        const pa = a.referencePrice || Number.MAX_SAFE_INTEGER;
        const pb = b.referencePrice || Number.MAX_SAFE_INTEGER;
        return pa - pb;
      });
    } else if (sortBy === 'price-desc') {
      list.sort((a, b) => {
        const pa = a.referencePrice || 0;
        const pb = b.referencePrice || 0;
        return pb - pa;
      });
    } else if (sortBy === 'name-asc') {
      list.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    }

    return list;
  }, [products, categorySlug, categoryName, searchQuery, sortBy]);

  // Top 3 real products for comparison table
  const sampleComparisonProducts = useMemo(() => {
    return filteredProducts.slice(0, 3);
  }, [filteredProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-500 font-medium flex-wrap">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
          }}
          className="hover:text-[#EE4D2D] transition-colors"
        >
          Trang Chủ
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <a
          href="/san-pham"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/san-pham');
          }}
          className="hover:text-[#EE4D2D] transition-colors"
        >
          Sản Phẩm
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold">{categoryName}</span>
      </nav>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-orange-950 text-white p-6 sm:p-8 rounded-3xl shadow-md border border-slate-800 space-y-3">
        <div className="inline-block bg-[#EE4D2D] text-white font-extrabold text-[10px] sm:text-xs px-2.5 py-1 rounded-md uppercase tracking-wider">
          Danh Mục Đồ Câu
        </div>
        <h1 className="text-2xl sm:text-4xl font-black">{categoryName} LK Hòa</h1>
        {categoryDesc && <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">{categoryDesc}</p>}
        <div className="text-xs text-orange-400 font-semibold pt-1">
          Đồng bộ đầy đủ <strong>{filteredProducts.length}</strong> sản phẩm chính hãng với liên kết mua trên Shopee Mall & TikTok Shop
        </div>
      </div>

      {/* Controls */}
      <CatalogControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategorySlug={categorySlug}
        onCategorySelect={(slug) => onNavigate(`/danh-muc/${slug}`)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalFiltered={filteredProducts.length}
      />

      {/* Product Grid */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenDetail}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/80 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Không có sản phẩm nào</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Hiện chưa có sản phẩm active phù hợp với bộ lọc trong danh mục này.
          </p>
          <button
            onClick={() => {
              setSearchQuery('');
              onNavigate('/san-pham');
            }}
            className="bg-[#EE4D2D] text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      )}

      {/* RICH CATEGORY SEO CONTENT SECTION */}
      <section className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 space-y-8 mt-12 text-slate-800">
        <div className="space-y-3">
          <div className="text-xs font-extrabold text-[#EE4D2D] uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            <span>Kinh Nghiệm & Hướng Dẫn Mua Sắm</span>
          </div>
          <h2 className="text-xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tổng Quan Danh Mục {categoryName} LK Hòa
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Danh mục {categoryName} tại cửa hàng LK Hòa được tuyển chọn kỹ lưỡng, phục vụ từ cần thủ mới gia nhập cho đến các cần thủ chuyên nghiệp câu giải trí, câu thi đấu. Dưới đây là phân tích chi tiết và bảng so sánh các sản phẩm tiêu biểu trong danh mục này.
          </p>
        </div>

        {/* Real Product Comparison Table */}
        {sampleComparisonProducts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <Table className="w-4 h-4 text-[#EE4D2D]" />
              <span>Bảng So Sánh Mẫu Sản Phẩm Thật Trong Danh Mục</span>
            </h3>
            <div className="overflow-x-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-900 font-extrabold">
                    <th className="p-3 border-b border-slate-200">Tên Sản Phẩm</th>
                    <th className="p-3 border-b border-slate-200">Phân Loại</th>
                    <th className="p-3 border-b border-slate-200">Giá Tham Khảo</th>
                    <th className="p-3 border-b border-slate-200">Nơi Mua Chính Hãng</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-slate-700">
                  {sampleComparisonProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold text-slate-900">{prod.name}</td>
                      <td className="p-3">{prod.category}</td>
                      <td className="p-3 font-semibold text-[#EE4D2D]">
                        {prod.referencePrice ? `${prod.referencePrice.toLocaleString('vi-VN')}đ` : 'Kiểm tra trên sàn'}
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                          Shopee Mall & TikTok
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Buying Tips & Price Explanation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#EE4D2D]" />
              <span>Hướng Dẫn Lựa Chọn Chuẩn Kỹ Thuật</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Khi chọn sản phẩm thuộc nhóm {categoryName}, hãy cân nhắc kỹ nhu cầu sử dụng thực tế (câu bờ sông, hồ dịch vụ, cá lóc, cá chép, hay cá trắm lớn) để chọn đúng phân loại và kích thước phù hợp nhất.
            </p>
          </div>

          <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <Info className="w-4 h-4 text-[#EE4D2D]" />
              <span>Giải Thích Về Giá Tham Khảo</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mức giá niêm yết trên website là giá tham khảo từ nguồn Google Sheet chính thức của thương hiệu LK Hòa. Mức giá này có thể thay đổi tùy thuộc vào các chương trình khuyến mãi, voucher giảm giá diễn ra trực tiếp trên Shopee Mall & TikTok Shop.
            </p>
          </div>
        </div>

        {/* Category FAQ */}
        <div className="space-y-4">
          <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
            <HelpCircle className="w-4 h-4 text-[#EE4D2D]" />
            <span>Câu Hỏi Thường Gặp Về {categoryName} LK Hòa</span>
          </h3>
          <div className="space-y-3">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                1. Sản phẩm trong danh mục {categoryName} có mua trực tiếp trên website được không?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Website LK Hòa cung cấp thông tin chi tiết và dẫn trực tiếp liên kết chính thức sang gian hàng Shopee Mall và TikTok Shop để đảm bảo anh em mua hàng chính hãng và được bảo vệ thanh toán.
              </p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-1">
              <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
                2. Làm sao để kiểm tra tình trạng còn hàng và khuyến mãi mới nhất?
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Bấm nút "Shopee" hoặc "Tiktok" tại từng sản phẩm để xem số lượng tồn kho theo thời gian thực và áp mã giảm giá vận chuyển.
              </p>
            </div>
          </div>
        </div>

        {/* Guides Internal Links */}
        <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-black text-slate-900">Xem thêm bài viết kinh nghiệm liên quan</h4>
            <p className="text-xs text-slate-500">Tham khảo cẩm nang hướng dẫn sử dụng và bảo quản đồ câu LK Hòa</p>
          </div>
          <a
            href="/cam-nang"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/cam-nang');
            }}
            className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Đọc Cẩm Nang Câu Cá</span>
          </a>
        </div>
      </section>
    </div>
  );
};
