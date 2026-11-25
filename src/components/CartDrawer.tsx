import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Minus,
  Plus,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import type { Product } from '../types';
import { useCart } from '../utils/CartContext';
import { formatPrice } from '../utils/catalog';
import { AVAILABLE_COUPONS } from '../utils/cartStore';
import { getProductDetailData } from '../data/productVariants';
import { CartUpdateNotice } from './CartUpdateNotice';

interface CartDrawerProps {
  products: Product[];
  onNavigate: (path: string) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({ products, onNavigate }) => {
  const {
    items,
    totalQuantity,
    couponCode,
    couponResult,
    totals,
    isDrawerOpen,
    closeDrawer,
    updateQuantity,
    removeItem,
    changeItemVariant,
    applyCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponFeedback, setCouponFeedback] = useState<string>('');

  useEffect(() => {
    setCouponInput(couponCode);
  }, [couponCode]);

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyCoupon(couponInput);
    setCouponFeedback(res.message);
  };

  const handleQuickCoupon = (code: string) => {
    setCouponInput(code);
    const res = applyCoupon(code);
    setCouponFeedback(res.message);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label="Giỏ hàng Đồ Câu LK Hòa">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
      />

      <aside className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#0F172A] border-l border-slate-800 text-slate-100 shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
          <div className="flex items-center gap-2.5">
            <ShoppingBag className="w-5 h-5 text-[#FACC15]" />
            <h2 className="font-display text-base font-black text-white">
              Giỏ Hàng ({totalQuantity})
            </h2>
          </div>
          <button
            type="button"
            onClick={closeDrawer}
            aria-label="Đóng giỏ hàng"
            className="min-w-10 min-h-10 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-4 pt-3">
          <CartUpdateNotice compact />
        </div>

        {/* Freeship Progress Bar */}
        <div className="border-b border-slate-800 bg-[#111827] px-4 py-3 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            {totals.isFreeship ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="font-bold text-emerald-300">
                  {totals.shippingReason}
                </span>
              </>
            ) : (
              <>
                <Truck className="w-4 h-4 text-[#FACC15] shrink-0" />
                <span className="text-slate-200">
                  Mua thêm <strong className="text-[#FACC15] tabular-nums">{formatPrice(totals.amountToFreeship)}</strong> để được <strong>MIỄN PHÍ VẬN CHUYỂN</strong> (hoặc chọn Cần câu)
                </span>
              </>
            )}
          </div>
          <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${
                totals.isFreeship ? 'bg-emerald-500' : 'bg-[#FACC15]'
              }`}
              style={{ width: `${totals.freeshipProgressPercent}%` }}
            />
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-14 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-slate-800/80 flex items-center justify-center text-slate-400">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-white">Giỏ hàng đang trống</p>
                <p className="text-xs text-slate-400 max-w-xs">
                  Chọn cần câu, mồi chuột LK hoặc dây dù PE thực chiến để nhận ưu đãi Freeship từ 300.000đ.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  onNavigate('/san-pham');
                }}
                className="min-h-11 px-5 py-2.5 rounded-xl bg-[#FACC15] text-[#0F172A] text-xs font-black cursor-pointer"
              >
                Khám phá đồ câu ngay
              </button>
            </div>
          ) : (
            items.map((item) => {
              const product = products.find((p) => p.id === item.productId);
              const detail = product ? getProductDetailData(product) : null;
              return (
                <div
                  key={item.key}
                  className="rounded-xl border border-slate-800 bg-[#111827] p-3 space-y-2.5"
                >
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        closeDrawer();
                        onNavigate(`/san-pham/${item.slug}`);
                      }}
                      className="w-18 h-18 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-800 cursor-pointer"
                    >
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
                          LK Hòa
                        </div>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            closeDrawer();
                            onNavigate(`/san-pham/${item.slug}`);
                          }}
                          className="text-left text-xs font-bold text-white hover:text-[#FACC15] line-clamp-2 cursor-pointer"
                        >
                          {item.name}
                        </button>
                        <button
                          type="button"
                          onClick={() => removeItem(item.key)}
                          aria-label={`Xóa ${item.name}`}
                          className="p-1.5 text-slate-400 hover:text-red-400 cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      <p className="text-[11px] font-mono-tabular text-slate-400 mt-0.5">
                        SKU: {item.sku}
                      </p>

                      {detail && detail.variants.length > 1 ? (
                        <div className="mt-2">
                          <label className="sr-only" htmlFor={`drawer-variant-${item.key}`}>
                            Đổi biến thể
                          </label>
                          <select
                            id={`drawer-variant-${item.key}`}
                            value={item.variantId}
                            onChange={(e) => {
                              const next = detail.variants.find((v) => v.id === e.target.value);
                              if (next && product) changeItemVariant(item.key, product, next);
                            }}
                            className="w-full rounded-lg bg-[#0F172A] border border-slate-700 px-2 py-1.5 text-xs text-slate-200 focus:border-[#FACC15] focus:outline-none"
                          >
                            {detail.variants.map((v) => (
                              <option key={v.id} value={v.id}>
                                {v.label} — {formatPrice(v.price)}
                              </option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-400 font-semibold mt-1">
                          Phân loại: {item.variantLabel}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-800/80">
                    <div className="inline-flex items-center rounded-lg border border-slate-700 bg-[#0F172A]">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, -1)}
                        aria-label="Giảm số lượng"
                        className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-white tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.key, 1)}
                        aria-label="Tăng số lượng"
                        className="w-9 h-9 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-[#FACC15] tabular-nums">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer Summary + Coupon + Checkout CTA */}
        {items.length > 0 && (
          <div className="border-t border-slate-800 bg-[#111827] px-4 py-4 space-y-3">
            {/* Coupon Form */}
            <form onSubmit={handleApplyCoupon} className="space-y-2">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    placeholder="Nhập mã giảm giá (LKHOA10, FREESHIP)"
                    aria-label="Mã giảm giá"
                    className="w-full h-10 pl-8 pr-3 rounded-lg bg-[#0F172A] border border-slate-700 text-xs text-white placeholder:text-slate-500 uppercase focus:border-[#FACC15] focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="h-10 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 cursor-pointer whitespace-nowrap"
                >
                  Áp dụng
                </button>
              </div>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="text-slate-400">Mã gợi ý:</span>
                {AVAILABLE_COUPONS.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => handleQuickCoupon(c.code)}
                    className={`px-2 py-0.5 rounded font-mono-tabular font-bold cursor-pointer border ${
                      couponCode === c.code
                        ? 'bg-[#14532D] border-emerald-600 text-[#FACC15]'
                        : 'bg-[#0F172A] border-slate-700 text-slate-300 hover:border-slate-500'
                    }`}
                    title={c.description}
                  >
                    {c.code}
                  </button>
                ))}
              </div>
              {(couponFeedback || couponResult.message) && (
                <p className={`text-[11px] font-semibold ${couponResult.valid ? 'text-emerald-400' : 'text-[#F97316]'}`}>
                  {couponFeedback || couponResult.message}
                </p>
              )}
            </form>

            {/* Totals Breakdown */}
            <div className="space-y-1.5 text-xs border-t border-slate-800 pt-3">
              <div className="flex justify-between text-slate-300">
                <span>Tạm tính:</span>
                <span className="font-bold tabular-nums">{formatPrice(totals.subtotal)}</span>
              </div>
              {totals.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Giảm giá ({couponCode}):</span>
                  <span className="font-bold tabular-nums">-{formatPrice(totals.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Phí vận chuyển:</span>
                <span className="font-bold tabular-nums">
                  {totals.shippingFee === 0 ? 'Miễn phí (0đ)' : formatPrice(totals.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-sm font-black text-white pt-1 border-t border-slate-800">
                <span>Tổng thanh toán:</span>
                <span className="text-lg text-[#FACC15] tabular-nums">{formatPrice(totals.total)}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  onNavigate('/thanh-toan');
                }}
                data-cta="true"
                className="cta-btn w-full min-h-12 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] text-sm font-black flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>THANH TOÁN NGAY (COD / VIETQR)</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => {
                  closeDrawer();
                  onNavigate('/gio-hang');
                }}
                className="w-full min-h-10 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-200 cursor-pointer"
              >
                Xem chi tiết giỏ hàng
              </button>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};
