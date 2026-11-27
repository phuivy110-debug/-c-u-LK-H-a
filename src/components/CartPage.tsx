import React, { useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../utils/CartContext';
import { formatPrice } from '../utils/catalog';
import { getProductDetailData } from '../data/productVariants';
import { CartUpdateNotice } from './CartUpdateNotice';

interface CartPageProps {
  products: Product[];
  onNavigate: (path: string) => void;
}

export const CartPage: React.FC<CartPageProps> = ({ products, onNavigate }) => {
  const {
    items,
    totalQuantity,
    couponCode,
    couponResult,
    availableCoupons,
    totals,
    updateQuantity,
    removeItem,
    changeItemVariant,
    applyCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponFeedback, setCouponFeedback] = useState('');

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyCoupon(couponInput);
    setCouponFeedback(res.message);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('/san-pham')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#FACC15] mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tiếp tục chọn đồ câu</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
            Giỏ Hàng Của Bạn ({totalQuantity} sản phẩm)
          </h1>
        </div>
      </div>

      <CartUpdateNotice />

      {/* Freeship Progress Banner */}
      <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4 space-y-2">
        <div className="flex items-center gap-2 text-xs sm:text-sm">
          {totals.isFreeship ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span className="font-bold text-emerald-300">{totals.shippingReason}</span>
            </>
          ) : (
            <>
              <Truck className="w-5 h-5 text-[#FACC15] shrink-0" />
              <span className="text-slate-200">
                Mua thêm <strong className="text-[#FACC15] tabular-nums">{formatPrice(totals.amountToFreeship)}</strong> để được <strong>MIỄN PHÍ VẬN CHUYỂN</strong> toàn quốc (Freeship từ 300.000đ hoặc khi có Cần câu).
              </span>
            </>
          )}
        </div>
        <div className="h-2.5 w-full rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${totals.isFreeship ? 'bg-emerald-500' : 'bg-[#FACC15]'}`}
            style={{ width: `${totals.freeshipProgressPercent}%` }}
          />
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-10 text-center space-y-4">
          <ShoppingBag className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-lg font-bold text-white">Giỏ hàng của bạn hiện đang trống</h2>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Khám phá các dòng cần solid tải tĩnh 10kg, mồi chuột LK và dây dù Red X8 đang sẵn kho.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('/san-pham')}
            className="min-h-11 px-6 py-3 rounded-xl bg-[#FACC15] text-[#0F172A] text-sm font-black cursor-pointer"
          >
            Xem danh mục sản phẩm
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 space-y-3">
            {items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              const detail = product ? getProductDetailData(product) : null;
              return (
                <div
                  key={item.key}
                  className="rounded-2xl border border-slate-800 bg-[#111827] p-4 flex flex-col sm:flex-row gap-4"
                >
                  <button
                    type="button"
                    onClick={() => onNavigate(`/san-pham/${item.slug}`)}
                    className="w-24 h-24 rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shrink-0 cursor-pointer"
                  >
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">LK Hòa</div>
                    )}
                  </button>

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => onNavigate(`/san-pham/${item.slug}`)}
                        className="text-left text-sm sm:text-base font-bold text-white hover:text-[#FACC15] cursor-pointer"
                      >
                        {item.name}
                      </button>
                      <button
                        type="button"
                        onClick={() => removeItem(item.key)}
                        aria-label={`Xóa ${item.name}`}
                        className="p-2 text-slate-400 hover:text-red-400 cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <p className="text-xs font-mono-tabular text-slate-400">
                      SKU: {item.sku} · {item.category}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                      {detail && detail.variants.length > 1 ? (
                        <select
                          value={item.variantId}
                          onChange={(e) => {
                            const next = detail.variants.find((v) => v.id === e.target.value);
                            if (next && product) changeItemVariant(item.key, product, next);
                          }}
                          aria-label={`Đổi phân loại cho ${item.name}`}
                          className="rounded-lg bg-[#0F172A] border border-slate-700 px-3 py-2 text-xs text-slate-200 focus:border-[#FACC15] focus:outline-none"
                        >
                          {detail.variants.map((v) => (
                            <option key={v.id} value={v.id}>
                              {v.label} — {formatPrice(v.price)}
                            </option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-400">
                          Phân loại: {item.variantLabel}
                        </span>
                      )}

                      <div className="flex items-center gap-4">
                        <div className="inline-flex items-center rounded-lg border border-slate-700 bg-[#0F172A]">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, -1)}
                            aria-label="Giảm số lượng"
                            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-9 text-center text-sm font-bold text-white tabular-nums">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.key, 1)}
                            aria-label="Tăng số lượng"
                            className="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <strong className="text-base font-black text-[#FACC15] tabular-nums">
                          {formatPrice(item.price * item.quantity)}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Summary Card */}
          <aside className="lg:col-span-4 rounded-2xl border border-slate-800 bg-[#111827] p-5 space-y-4 sticky top-28">
            <h2 className="font-display text-lg font-black text-white">Tóm Tắt Đơn Hàng</h2>

            <form onSubmit={handleCouponSubmit} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Mã giảm giá (LKHOA10)"
                    className="w-full h-11 pl-9 pr-3 rounded-xl bg-[#0F172A] border border-slate-700 text-xs text-white uppercase focus:border-[#FACC15] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 cursor-pointer"
                >
                  Áp dụng
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {availableCoupons.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      setCouponInput(c.code);
                      const res = applyCoupon(c.code);
                      setCouponFeedback(res.message);
                    }}
                    className={`px-2.5 py-1 rounded font-mono-tabular font-bold cursor-pointer border ${
                      couponCode === c.code
                        ? 'bg-[#14532D] border-emerald-600 text-[#FACC15]'
                        : 'bg-[#0F172A] border-slate-700 text-slate-300'
                    }`}
                  >
                    {c.code}
                  </button>
                ))}
              </div>
              {(couponFeedback || couponResult.message) && (
                <p className={`text-xs font-semibold ${couponResult.valid ? 'text-emerald-400' : 'text-[#F97316]'}`}>
                  {couponFeedback || couponResult.message}
                </p>
              )}
            </form>

            <div className="space-y-2 border-t border-slate-800 pt-3 text-sm">
              <div className="flex justify-between text-slate-300">
                <span>Tạm tính:</span>
                <span className="font-bold tabular-nums">{formatPrice(totals.subtotal)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Giảm giá:</span>
                  <span className="font-bold tabular-nums">-{formatPrice(totals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Phí giao hàng:</span>
                <span className="font-bold tabular-nums">
                  {totals.shippingFee === 0 ? '0đ (Freeship)' : formatPrice(totals.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline border-t border-slate-800 pt-3 font-black text-white">
                <span>Tổng cộng:</span>
                <span className="text-xl text-[#FACC15] tabular-nums">{formatPrice(totals.total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigate('/thanh-toan')}
              data-cta="true"
              className="cta-btn w-full min-h-12 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Tiến hành thanh toán</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};
