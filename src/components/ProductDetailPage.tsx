import React, { useMemo, useState } from 'react';
import { Product } from '../types';
import { ArrowLeft, ImageOff, Flame, ChevronRight, AlertCircle, ShoppingBag, ShieldCheck, CheckCircle2, Info, Zap, RefreshCw } from 'lucide-react';
import { AffiliateButtons } from './AffiliateButtons';
import { ProductCard } from './ProductCard';
import { triggerShopeePriceSync } from '../utils/shopeePriceSync';

interface ProductDetailPageProps {
  productSlug: string;
  products: Product[];
  onNavigate: (path: string) => void;
  onOpenDetail?: (product: Product) => void;
  onRefreshPrices?: () => Promise<void>;
}

export const ProductDetailPage: React.FC<ProductDetailPageProps> = ({
  productSlug,
  products,
  onNavigate,
  onOpenDetail,
  onRefreshPrices,
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshSuccess, setRefreshSuccess] = useState(false);

  const product = useMemo(() => {
    return products.find((p) => p.slug === productSlug);
  }, [products, productSlug]);

  const formatVND = (num?: number) => {
    if (!num || num <= 0) return null;
    return new Intl.NumberFormat('vi-VN').format(num) + 'đ';
  };

  // 404 Page if product not found
  if (!product) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-orange-100 text-[#EE4D2D] rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-900 mb-2">Không tìm thấy sản phẩm</h1>
        <p className="text-slate-600 mb-6 text-sm">
          Sản phẩm bạn đang tìm kiếm không tồn tại hoặc đã bị gỡ khỏi danh mục.
        </p>
        <button
          onClick={() => onNavigate('/san-pham')}
          className="inline-flex items-center gap-2 bg-[#EE4D2D] hover:bg-orange-600 text-white font-extrabold px-6 py-3 rounded-2xl shadow-md transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại danh sách sản phẩm</span>
        </button>
      </div>
    );
  }

  // Handle inactive product state
  if (product.status === 'inactive') {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 bg-slate-100 text-slate-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-8 h-8" />
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">{product.name}</h1>
        <div className="inline-block bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded-full text-xs mb-4">
          Trạng thái: Hiện không còn hoạt động
        </div>
        <p className="text-slate-500 mb-6 text-sm max-w-md mx-auto">
          Sản phẩm này hiện ngưng kinh doanh hoặc tạm ngừng hiển thị trên sàn. Vui lòng tham khảo các sản phẩm khác.
        </p>
        <button
          onClick={() => onNavigate('/san-pham')}
          className="inline-flex items-center gap-2 bg-slate-900 hover:bg-black text-white font-bold px-5 py-2.5 rounded-xl transition-all cursor-pointer text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Xem các sản phẩm khác</span>
        </button>
      </div>
    );
  }

  const refPrice = product.referencePrice || product.salePrice;
  const origPrice = product.originalPrice;
  const hasValidDiscount =
    origPrice && refPrice && origPrice > refPrice && refPrice > 0;
  const discountPercent = product.saleDiscountPercent || (
    hasValidDiscount && origPrice && refPrice
      ? Math.round(((origPrice - refPrice) / origPrice) * 100)
      : 0
  );
  const savingsAmount = hasValidDiscount && origPrice && refPrice ? origPrice - refPrice : 0;
  const isSale = Boolean((product.salePrice && product.salePrice > 0) || discountPercent > 0 || product.isFlashSale);

  const handleManualPriceRefresh = async () => {
    setIsRefreshing(true);
    setRefreshSuccess(false);
    try {
      if (onRefreshPrices) {
        await onRefreshPrices();
      } else {
        await triggerShopeePriceSync();
      }
      setRefreshSuccess(true);
      setTimeout(() => setRefreshSuccess(false), 3000);
    } catch (e) {
      console.warn('Manual refresh failed:', e);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Compute related products in same category
  const relatedProducts = products.filter(
    (p) => p.status === 'active' && p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8">
      {/* Breadcrumb Navigation */}
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
        {product.category && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-700 font-bold">{product.category}</span>
          </>
        )}
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-slate-900 font-bold truncate max-w-[200px] sm:max-w-xs">
          {product.name}
        </span>
      </nav>

      {/* Main Detail Section */}
      <div className="bg-white rounded-3xl p-4 sm:p-8 shadow-xs border border-slate-200/80 grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
        {/* Product Image */}
        <div className="relative bg-slate-100 aspect-square rounded-2xl overflow-hidden flex items-center justify-center border border-slate-200/60">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-400 gap-2 p-6 text-center">
              <ImageOff className="w-12 h-12 stroke-1" />
              <span className="text-sm font-medium">Đang cập nhật hình ảnh sản phẩm</span>
            </div>
          )}

          {discountPercent > 0 ? (
            <div className="absolute top-4 left-4 bg-gradient-to-r from-red-600 to-[#EE4D2D] text-white font-black text-xs sm:text-sm px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
              {product.isFlashSale ? <Flame className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" /> : <Zap className="w-4 h-4 text-yellow-300 fill-yellow-300" />}
              <span>GIẢM {discountPercent}%</span>
            </div>
          ) : isSale ? (
            <div className="absolute top-4 left-4 bg-[#EE4D2D] text-white font-black text-xs px-3 py-1.5 rounded-xl shadow-md flex items-center gap-1">
              <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
              <span>GIÁ SALE</span>
            </div>
          ) : null}
        </div>

        {/* Info & Buy Section */}
        <div className="flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Back Button */}
            <button
              onClick={() => onNavigate('/san-pham')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#EE4D2D] transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Quay lại danh sách</span>
            </button>

            {/* Category Tag */}
            {product.category && (
              <div className="text-xs font-extrabold text-[#EE4D2D] uppercase tracking-wider">
                {product.category}
              </div>
            )}

            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {product.name}
            </h1>

            {/* Realtime Shopee Price Box */}
            <div className="bg-gradient-to-br from-orange-50/90 via-red-50/40 to-amber-50/60 rounded-2xl p-4 sm:p-5 border border-orange-200/90 space-y-3 shadow-xs">
              <div className="flex items-center justify-between gap-2 border-b border-orange-200/60 pb-2">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wide">
                    {isSale ? '⚡ Giá Sale Realtime Shopee' : 'Giá Tham Khảo Shopee'}
                  </span>
                </div>
                <button
                  onClick={handleManualPriceRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-orange-700 hover:text-[#EE4D2D] bg-white px-2 py-1 rounded-lg border border-orange-200 shadow-2xs transition-all cursor-pointer disabled:opacity-50"
                  title="Cập nhật lại giá sale realtime từ Shopee"
                >
                  <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin text-[#EE4D2D]' : ''}`} />
                  <span>{isRefreshing ? 'Đang tải...' : refreshSuccess ? 'Đã làm mới!' : 'Làm mới giá'}</span>
                </button>
              </div>

              <div className="space-y-1">
                <div className="flex items-baseline gap-3 flex-wrap">
                  {refPrice && refPrice > 0 ? (
                    <>
                      <span className="text-2xl sm:text-3xl font-black text-[#EE4D2D]">
                        {formatVND(refPrice)}
                      </span>
                      {hasValidDiscount && origPrice && (
                        <span className="text-sm sm:text-base text-slate-400 line-through font-medium">
                          {formatVND(origPrice)}
                        </span>
                      )}
                      {discountPercent > 0 && (
                        <span className="bg-[#EE4D2D] text-white font-black text-xs px-2 py-0.5 rounded-md">
                          -{discountPercent}%
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="text-base font-bold text-slate-700">
                      Kiểm tra giá mới nhất trên sàn Shopee
                    </span>
                  )}
                </div>

                {savingsAmount > 0 && (
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/80 px-2.5 py-0.5 rounded-md">
                    <span>✨ Tiết kiệm {formatVND(savingsAmount)} khi đặt mua hôm nay</span>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-slate-500 pt-1">
                Giá sale và ưu đãi voucher giảm giá được áp dụng trực tiếp khi mở ứng dụng Shopee.
              </div>
            </div>

            {/* Product Details & Specifications */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200/80 space-y-3 text-xs sm:text-sm text-slate-700">
              <div className="font-extrabold text-slate-900 text-sm border-b border-slate-200 pb-2">
                Thông tin & Đặc điểm sản phẩm
              </div>
              {product.description ? (
                <p className="leading-relaxed">{product.description}</p>
              ) : (
                <p className="leading-relaxed">
                  Sản phẩm đồ câu <strong>{product.name}</strong> chính hãng thuộc danh mục <strong>{product.category}</strong> của LK Hòa. Được thiết kế chuyên dụng cho cần thủ câu giải trí và câu thi đấu, đảm bảo độ bền cao và trải nghiệm tuyệt vời.
                </p>
              )}

              {/* Target Use Case & Pre-buy Check */}
              <div className="pt-2 space-y-2 border-t border-slate-200/80 text-xs">
                <div className="flex items-start gap-1.5 font-semibold text-slate-800">
                  <CheckCircle2 className="w-4 h-4 text-[#EE4D2D] shrink-0 mt-0.5" />
                  <span><strong>Đối tượng & Nhu cầu:</strong> Thích hợp cho cần thủ câu đài, câu lure, câu sông hồ tự nhiên hoặc hồ dịch vụ.</span>
                </div>
                <div className="flex items-start gap-1.5 font-semibold text-slate-800">
                  <ShieldCheck className="w-4 h-4 text-[#EE4D2D] shrink-0 mt-0.5" />
                  <span><strong>Kiểm tra trước khi mua:</strong> Chọn đúng phân loại kích thước, độ cứng hoặc màu sắc mong muốn trên sàn trước khi chốt đơn.</span>
                </div>
              </div>
            </div>

            {/* Mandatory Affiliate Disclaimer Notice */}
            <div className="text-xs text-slate-500 bg-amber-50/60 border border-amber-200/80 p-3 rounded-xl italic flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>Ghi chú: Mức giá niêm yết trên website được đồng bộ realtime theo thông tin sàn. Giá bán thực tế và các ưu đãi voucher giảm giá phụ thuộc vào chương trình áp dụng tại thời điểm mua trên gian hàng Shopee và TikTok Shop.</span>
            </div>
          </div>

          {/* Unified Affiliate Buttons */}
          <div className="pt-4 border-t border-slate-100">
            <AffiliateButtons
              productId={product.id}
              productName={product.name}
              shopeeUrl={product.shopeeUrl}
              tiktokUrl={product.tiktokUrl}
              compact={false}
            />
          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-[#EE4D2D]" />
            <h2 className="text-lg font-black text-slate-900">Sản Phẩm Cùng Danh Mục</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {relatedProducts.map((relProd, idx) => (
              <ProductCard
                key={`${relProd.id}-rel-${idx}`}
                product={relProd}
                onOpenDetail={() => {
                  if (onOpenDetail) onOpenDetail(relProd);
                  else onNavigate(`/san-pham/${relProd.slug}`);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
