import { productDisplayName, selectProducts, type ProductSort } from '../utils/catalog';
import { useHistoryState } from '../utils/useHistoryState';
import React, { useMemo } from 'react';
import { Product } from '../types';
import { CATEGORIES } from '../data/products';
import { ChevronRight, AlertCircle, BookOpen, HelpCircle, CheckCircle2, Table, Info } from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useHistoryState('category-query', '');
  const [sortBy, setSortBy] = useHistoryState<ProductSort>('category-sort', 'default');

  const currentCategory = useMemo(() => {
    return CATEGORIES.find((c) => c.slug === categorySlug);
  }, [categorySlug]);

  const categoryName = currentCategory ? currentCategory.name : 'Danh Mục Sản Phẩm';
  const categoryDesc = currentCategory ? currentCategory.description : '';

  const filteredProducts = useMemo(
    () => selectProducts(products, categorySlug, searchQuery, sortBy),
    [products, categorySlug, searchQuery, sortBy]
  );

  const sampleComparisonProducts = useMemo(() => {
    return filteredProducts.slice(0, 3);
  }, [filteredProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 font-medium flex-wrap">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/');
          }}
          className="hover:text-[#FACC15] transition-colors"
        >
          Trang Chủ
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        <a
          href="/san-pham"
          onClick={(e) => {
            e.preventDefault();
            onNavigate('/san-pham');
          }}
          className="hover:text-[#FACC15] transition-colors"
        >
          Sản Phẩm
        </a>
        <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
        <span className="text-white font-bold">{categoryName}</span>
      </nav>

      <header className="space-y-2">
        <h1 className="font-display text-2xl sm:text-3xl font-black text-white">{categoryName} LK Hòa</h1>
        {categoryDesc && <p className="text-sm text-slate-300">{categoryDesc}</p>}
      </header>

      <CatalogControls
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedCategorySlug={categorySlug}
        onCategorySelect={(slug) => onNavigate(slug === 'tat-ca' ? '/san-pham' : `/danh-muc/${slug}`)}
        sortBy={sortBy}
        onSortChange={setSortBy}
        totalFiltered={filteredProducts.length}
      />

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onOpenDetail={onOpenDetail}
              onQuickBuy={() => onNavigate('/thanh-toan')}
              placement="category"
            />
          ))}
        </div>
      ) : (
        <div className="bg-[#111827] p-12 rounded-2xl border border-slate-800 text-center space-y-4">
          <div className="w-12 h-12 bg-slate-800 text-slate-400 rounded-full flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Không có sản phẩm nào</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Hiện chưa có sản phẩm phù hợp với bộ lọc trong danh mục này.
          </p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              onNavigate('/san-pham');
            }}
            data-cta="true"
            className="cta-btn bg-[#FACC15] text-[#0F172A] text-xs font-black px-4 py-2.5 rounded-xl cursor-pointer"
          >
            Xem tất cả sản phẩm
          </button>
        </div>
      )}

      <section className="bg-[#111827] rounded-2xl border border-slate-800 p-6 sm:p-8 space-y-6 text-slate-200">
        <div className="space-y-2">
          <p className="text-xs font-bold text-[#FACC15] uppercase tracking-wider flex items-center gap-1.5">
            <Info className="w-4 h-4" />
            <span>Kinh Nghiệm &amp; Hướng Dẫn Mua Sắm</span>
          </p>
          <h2 className="font-display text-xl sm:text-2xl font-black text-white tracking-tight">
            Tổng Quan Danh Mục {categoryName} LK Hòa
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Danh mục {categoryName} tại Đồ Câu LK Hòa được kiểm nghiệm thực tế trước khi xuất kho, hỗ trợ đặt hàng trực tiếp COD đồng kiểm / VietQR hoặc qua Shopee &amp; TikTok Shop.
          </p>
        </div>

        {sampleComparisonProducts.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
              <Table className="w-4 h-4 text-[#FACC15]" />
              <span>Bảng So Sánh Sản Phẩm Tiêu Biểu</span>
            </h3>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs sm:text-sm border-collapse">
                <thead>
                  <tr className="bg-[#0F172A] text-white font-bold">
                    <th className="p-3 border-b border-slate-800">Tên Sản Phẩm</th>
                    <th className="p-3 border-b border-slate-800">Phân Loại</th>
                    <th className="p-3 border-b border-slate-800">Giá Bán</th>
                    <th className="p-3 border-b border-slate-800">Kênh Mua</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {sampleComparisonProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-900/60">
                      <td className="p-3 font-bold text-white">{productDisplayName(prod)}</td>
                      <td className="p-3">{prod.category}</td>
                      <td className="p-3 font-bold text-[#FACC15] tabular-nums">
                        {prod.referencePrice ? `${prod.referencePrice.toLocaleString('vi-VN')}đ` : 'Xem chi tiết'}
                      </td>
                      <td className="p-3 text-emerald-400 font-semibold">
                        COD / VietQR / Shopee
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0F172A] p-5 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Hướng Dẫn Lựa Chọn Chuẩn Kỹ Thuật</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Hãy chọn đúng chiều dài, độ cứng cần hoặc size dây phù hợp môi trường câu (sông, đập thủy điện hay hồ dịch vụ). Liên hệ Zalo LK Hòa nếu cần tư vấn phối bộ đồng bộ.
            </p>
          </div>

          <div className="bg-[#0F172A] p-5 rounded-xl border border-slate-800 space-y-2">
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-[#FACC15]" />
              <span>Giao Hàng &amp; Đồng Kiểm</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Miễn phí vận chuyển toàn quốc cho đơn từ 300.000đ hoặc đơn có kèm cần câu. Tất cả cần câu đều được đóng ống nhựa cứng PVC chống gãy đọt.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h4 className="text-sm font-bold text-white">Xem thêm bài viết kinh nghiệm liên quan</h4>
            <p className="text-xs text-slate-400">Tham khảo cẩm nang hướng dẫn sử dụng và phối mồi LK Hòa</p>
          </div>
          <a
            href="/cam-nang"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/cam-nang');
            }}
            className="inline-flex items-center gap-1.5 bg-[#14532D] hover:bg-emerald-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Đọc Cẩm Nang Câu Cá</span>
          </a>
        </div>
      </section>
    </div>
  );
};
