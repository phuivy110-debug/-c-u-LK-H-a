import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  CreditCard,
  MapPin,
  MessageCircle,
  PackageCheck,
  QrCode,
  ShieldCheck,
  Tag,
  Truck,
} from 'lucide-react';
import type { OrderCustomerInfo, OrderRecord } from '../types';
import { useCart } from '../utils/CartContext';
import { formatPrice } from '../utils/catalog';
import {
  AVAILABLE_COUPONS,
  buildOrderRecord,
  buildVietQrImageUrl,
  estimateDeliveryWindow,
  saveOrderLocally,
  validateVietnamesePhone,
} from '../utils/cartStore';
import { STORE_BANK_INFO, STORE_HOTLINE, ZALO_CHAT_URL } from '../utils/site';
import { CartUpdateNotice } from './CartUpdateNotice';
import { trackCommerceEvent } from '../utils/analyticsService';

const VIETNAM_PROVINCES = [
  'Hà Nội',
  'TP. Hồ Chí Minh',
  'Hải Phòng',
  'Đà Nẵng',
  'Cần Thơ',
  'Huế',
  'An Giang',
  'Bắc Ninh',
  'Cà Mau',
  'Cao Bằng',
  'Đắk Lắk',
  'Điện Biên',
  'Đồng Nai',
  'Đồng Tháp',
  'Gia Lai',
  'Hà Tĩnh',
  'Hưng Yên',
  'Khánh Hòa',
  'Lai Châu',
  'Lâm Đồng',
  'Lạng Sơn',
  'Lào Cai',
  'Nghệ An',
  'Ninh Bình',
  'Phú Thọ',
  'Quảng Ngãi',
  'Quảng Ninh',
  'Quảng Trị',
  'Sơn La',
  'Tây Ninh',
  'Thái Nguyên',
  'Thanh Hóa',
  'Tuyên Quang',
  'Vĩnh Long',
];

interface CheckoutPageProps {
  onNavigate: (path: string) => void;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ onNavigate }) => {
  const { items, couponCode, couponResult, totals, applyCoupon, clearCart } = useCart();

  const [customer, setCustomer] = useState<OrderCustomerInfo>({
    fullName: '',
    phone: '',
    province: '',
    district: '',
    ward: '',
    address: '',
    note: 'Cho kiểm tra hàng trước khi thanh toán',
  });
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'vietqr'>('cod');
  const [couponInput, setCouponInput] = useState(couponCode);
  const [couponFeedback, setCouponFeedback] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<OrderRecord | null>(null);
  const [submitError, setSubmitError] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [qrImageError, setQrImageError] = useState(false);

  const previewOrderCode = useMemo(() => 'LKH2026', []);
  const estimatedDelivery = useMemo(() => estimateDeliveryWindow(customer.province), [customer.province]);

  useEffect(() => {
    if (items.length === 0) return;
    trackCommerceEvent('begin_checkout', {
      value: totals.total,
      coupon: couponCode || undefined,
      items: items.map((item) => ({
        item_id: item.productId,
        item_name: item.name,
        item_category: item.category,
        item_variant: item.variantLabel,
        price: item.price,
        quantity: item.quantity,
      })),
    });
    // Checkout entry is measured once; later catalogue changes are covered by cart reconciliation.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCopy = (label: string, value: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(value);
      setCopiedField(label);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const res = applyCoupon(couponInput);
    setCouponFeedback(res.message);
  };

  const validateForm = (): boolean => {
    const nextErrors: Record<string, string> = {};
    if (!customer.fullName.trim() || customer.fullName.trim().length < 2) {
      nextErrors.fullName = 'Vui lòng nhập họ và tên người nhận.';
    }
    if (!validateVietnamesePhone(customer.phone)) {
      nextErrors.phone = 'Số điện thoại không hợp lệ (cần đúng 10 số Việt Nam, ví dụ 0933040999).';
    }
    if (!customer.province.trim()) {
      nextErrors.province = 'Vui lòng chọn Tỉnh/Thành phố.';
    }
    if (!customer.district.trim()) {
      nextErrors.district = 'Vui lòng nhập Quận/Huyện.';
    }
    if (!customer.ward.trim()) {
      nextErrors.ward = 'Vui lòng nhập Phường/Xã.';
    }
    if (!customer.address.trim() || customer.address.trim().length < 5) {
      nextErrors.address = 'Vui lòng nhập số nhà, tên đường hoặc thôn/xóm chi tiết.';
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const syncOrderToServer = async (orderPayload: OrderRecord): Promise<{
    synced: boolean;
    savedOrder: OrderRecord;
    note: string;
  }> => {
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...orderPayload,
          idempotencyKey: orderPayload.orderCode,
        }),
      });
      const raw = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }
      if (res.ok && data?.success && data?.order) {
        saveOrderLocally(data.order);
        return { synced: true, savedOrder: data.order, note: '' };
      }
      const errMsg =
        data?.error ||
        (res.ok
          ? 'Máy chủ trả về phản hồi không hợp lệ khi lưu đơn.'
          : `Máy chủ chưa ghi nhận đơn (HTTP ${res.status})`);
      return { synced: false, savedOrder: orderPayload, note: errMsg };
    } catch {
      return {
        synced: false,
        savedOrder: orderPayload,
        note: 'Không thể kết nối tới máy chủ đơn hàng (/api/orders).',
      };
    }
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;
    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitError('');
    const draftOrder = buildOrderRecord(customer, paymentMethod, items, couponCode);
    saveOrderLocally(draftOrder);

    const syncResult = await syncOrderToServer(draftOrder);
    setIsSubmitting(false);
    if (!syncResult.synced) {
      setSubmitError(
        `Hệ thống chưa ghi nhận đơn hàng. Giỏ hàng vẫn được giữ nguyên. ${syncResult.note} Vui lòng thử lại hoặc liên hệ hotline/Zalo.`
      );
      return;
    }
    setCompletedOrder(syncResult.savedOrder);
    trackCommerceEvent('purchase', {
      transaction_id: syncResult.savedOrder.orderCode,
      value: syncResult.savedOrder.total,
      shipping: syncResult.savedOrder.shippingFee,
      coupon: syncResult.savedOrder.discountCode || undefined,
      payment_type: syncResult.savedOrder.paymentMethod,
      items: syncResult.savedOrder.items.map((item) => ({
        item_id: item.productId,
        item_name: item.name,
        item_category: item.category,
        item_variant: item.variantLabel,
        price: item.price,
        quantity: item.quantity,
      })),
    });
    clearCart();
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ORDER SUCCESS STATE
  if (completedOrder) {
    const qrUrl = buildVietQrImageUrl(completedOrder.total, completedOrder.orderCode);
    const zaloConfirmText = encodeURIComponent(
      `Xin chào LK Hòa, mình vừa đặt đơn hàng #${completedOrder.orderCode} - SĐT: ${completedOrder.customer.phone} - Tổng: ${formatPrice(completedOrder.total)}. Nhờ shop xác nhận giúp!`
    );

    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-6">
        <div className="rounded-2xl border border-emerald-700/60 bg-[#14532D]/30 p-6 sm:p-8 text-center space-y-3">
          <CheckCircle2 className="w-14 h-14 text-[#FACC15] mx-auto" />
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">
            Đã ghi nhận đơn hàng lên hệ thống
          </p>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
            Mã đơn hàng #{completedOrder.orderCode}
          </h1>
          <p className="text-sm text-slate-200 max-w-xl mx-auto">
            Cảm ơn <strong>{completedOrder.customer.fullName}</strong> đã đặt hàng tại Đồ Câu LK Hòa. Đơn hàng sẽ được đóng ống nhựa bảo vệ cẩn thận trước khi giao.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <section className="rounded-2xl border border-slate-800 bg-[#111827] p-5 space-y-4">
            <h2 className="font-display text-base font-black text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[#FACC15]" />
              <span>Thông tin giao nhận</span>
            </h2>
            <dl className="space-y-2 text-xs sm:text-sm text-slate-300">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-400">Người nhận:</dt>
                <dd className="font-bold text-white text-right">{completedOrder.customer.fullName}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-400">Số điện thoại:</dt>
                <dd className="font-mono-tabular font-bold text-white">{completedOrder.customer.phone}</dd>
              </div>
              <div>
                <dt className="text-slate-400 mb-0.5">Địa chỉ giao hàng:</dt>
                <dd className="font-semibold text-white">
                  {completedOrder.customer.address}, {completedOrder.customer.ward}, {completedOrder.customer.district}, {completedOrder.customer.province}
                </dd>
              </div>
              <div className="flex justify-between gap-2 pt-1 border-t border-slate-800">
                <dt className="text-slate-400">Dự kiến giao:</dt>
                <dd className="font-semibold text-emerald-400 text-right">{completedOrder.estimatedDelivery}</dd>
              </div>
              <div className="flex justify-between gap-2">
                <dt className="text-slate-400">Thanh toán:</dt>
                <dd className="font-bold text-[#FACC15] text-right">
                  {completedOrder.paymentMethod === 'cod'
                    ? 'COD (Đồng kiểm khi nhận hàng)'
                    : 'Chuyển khoản VietQR'}
                </dd>
              </div>
            </dl>

            <div className="pt-2 space-y-2.5">
              <a
                href={`${ZALO_CHAT_URL}?text=${zaloConfirmText}`}
                target="_blank"
                rel="noopener noreferrer"
                data-cta="true"
                className="cta-btn w-full min-h-12 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] text-sm font-black flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chat Zalo xác nhận đơn nhanh</span>
              </a>
              <button
                type="button"
                onClick={() => onNavigate('/san-pham')}
                className="w-full min-h-11 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-200 cursor-pointer"
              >
                Tiếp tục xem sản phẩm khác
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-800 bg-[#111827] p-5 space-y-4">
            <h2 className="font-display text-base font-black text-white flex items-center gap-2">
              <PackageCheck className="w-4 h-4 text-emerald-400" />
              <span>Chi tiết sản phẩm</span>
            </h2>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {completedOrder.items.map((item) => (
                <div key={item.key} className="flex justify-between gap-3 text-xs border-b border-slate-800 pb-2">
                  <div>
                    <p className="font-bold text-white">{item.name}</p>
                    <p className="text-slate-400">
                      {item.variantLabel} · SL: {item.quantity}
                    </p>
                  </div>
                  <span className="font-bold text-[#FACC15] tabular-nums shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-1.5 text-xs pt-1">
              <div className="flex justify-between text-slate-300">
                <span>Tạm tính:</span>
                <span className="tabular-nums font-semibold">{formatPrice(completedOrder.subtotal)}</span>
              </div>
              {completedOrder.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Giảm giá ({completedOrder.discountCode}):</span>
                  <span className="tabular-nums font-semibold">-{formatPrice(completedOrder.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-slate-300">
                <span>Phí vận chuyển:</span>
                <span className="tabular-nums font-semibold">
                  {completedOrder.shippingFee === 0 ? 'Miễn phí (0đ)' : formatPrice(completedOrder.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline text-sm font-black text-white border-t border-slate-800 pt-2">
                <span>Tổng thanh toán:</span>
                <span className="text-lg text-[#FACC15] tabular-nums">{formatPrice(completedOrder.total)}</span>
              </div>
            </div>

            {completedOrder.paymentMethod === 'vietqr' && (
              <div className="rounded-xl border border-emerald-700/60 bg-[#0F172A] p-4 space-y-3 text-center">
                <p className="text-xs font-bold text-[#FACC15]">
                  Quét mã VietQR để chuyển khoản nhanh
                </p>
                {!qrImageError ? (
                  <img
                    src={qrUrl}
                    alt={`Mã VietQR thanh toán đơn hàng ${completedOrder.orderCode}`}
                    onError={() => setQrImageError(true)}
                    className="w-48 h-48 mx-auto rounded-xl bg-white p-2 object-contain"
                  />
                ) : (
                  <div className="w-48 h-48 mx-auto rounded-xl bg-white text-[#0F172A] p-3 flex flex-col items-center justify-center gap-2">
                    <QrCode className="w-16 h-16" />
                    <span className="text-[11px] font-bold">MB Bank · {STORE_BANK_INFO.accountNo}</span>
                  </div>
                )}
                <div className="text-xs text-left space-y-1.5 bg-[#111827] p-3 rounded-lg border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ngân hàng:</span>
                    <span className="font-bold text-white">{STORE_BANK_INFO.bankName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Số tài khoản:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('stk', STORE_BANK_INFO.accountNo)}
                      className="inline-flex items-center gap-1 font-mono-tabular font-bold text-[#FACC15] cursor-pointer"
                    >
                      <span>{STORE_BANK_INFO.accountNo}</span>
                      {copiedField === 'stk' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Nội dung CK:</span>
                    <button
                      type="button"
                      onClick={() => handleCopy('nd', `THANH TOAN ${completedOrder.orderCode}`)}
                      className="inline-flex items-center gap-1 font-mono-tabular font-bold text-emerald-400 cursor-pointer"
                    >
                      <span>THANH TOAN {completedOrder.orderCode}</span>
                      {copiedField === 'nd' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    );
  }

  // EMPTY CART GUARD
  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
          Thanh Toán Đơn Hàng
        </h1>
        <p className="text-sm text-slate-400">
          Chưa có sản phẩm nào trong giỏ hàng. Hãy chọn sản phẩm trước khi tiến hành thanh toán.
        </p>
        <button
          type="button"
          onClick={() => onNavigate('/san-pham')}
          className="min-h-11 px-6 py-3 rounded-xl bg-[#FACC15] text-[#0F172A] text-sm font-black cursor-pointer"
        >
          Chọn đồ câu ngay
        </button>
      </div>
    );
  }

  const liveQrPreviewUrl = buildVietQrImageUrl(totals.total, previewOrderCode);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-6">
      <div>
        <button
          type="button"
          onClick={() => onNavigate('/gio-hang')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#FACC15] mb-2 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại giỏ hàng</span>
        </button>
        <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
          Thanh Toán &amp; Tính Phí Vận Chuyển
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 mt-1">
          Giao hàng toàn quốc · Hỗ trợ đồng kiểm trước khi thanh toán COD · Đóng ống nhựa bảo vệ cần câu.
        </p>
      </div>

      <CartUpdateNotice />

      <form onSubmit={handleSubmitOrder} noValidate className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Shipping Address & Payment Method */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Form */}
          <section className="rounded-2xl border border-slate-800 bg-[#111827] p-5 sm:p-6 space-y-4">
            <h2 className="font-display text-lg font-black text-white flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#FACC15]" />
              <span>1. Thông Tin Người Nhận</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="checkout-name" className="block text-xs font-bold text-slate-300 mb-1.5">
                  Họ và tên *
                </label>
                <input
                  id="checkout-name"
                  type="text"
                  autoComplete="name"
                  value={customer.fullName}
                  onChange={(e) => setCustomer((c) => ({ ...c, fullName: e.target.value }))}
                  placeholder="Nguyễn Văn A"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:border-[#FACC15] focus:outline-none"
                />
                {errors.fullName && <p className="text-xs text-[#F97316] mt-1">{errors.fullName}</p>}
              </div>

              <div>
                <label htmlFor="checkout-phone" className="block text-xs font-bold text-slate-300 mb-1.5">
                  Số điện thoại (10 số Việt Nam) *
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  inputMode="numeric"
                  autoComplete="tel"
                  value={customer.phone}
                  onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))}
                  placeholder="0933040999"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white font-mono-tabular placeholder:text-slate-500 focus:border-[#FACC15] focus:outline-none"
                />
                {errors.phone && <p className="text-xs text-[#F97316] mt-1">{errors.phone}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label htmlFor="checkout-province" className="block text-xs font-bold text-slate-300 mb-1.5">
                  Tỉnh / Thành phố *
                </label>
                <select
                  id="checkout-province"
                  autoComplete="address-level1"
                  value={customer.province}
                  onChange={(e) => setCustomer((c) => ({ ...c, province: e.target.value }))}
                  className="w-full h-11 px-3 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white focus:border-[#FACC15] focus:outline-none"
                >
                  <option value="" disabled>Chọn tỉnh / thành phố</option>
                  {VIETNAM_PROVINCES.map((prov) => (
                    <option key={prov} value={prov}>
                      {prov}
                    </option>
                  ))}
                </select>
                {errors.province && <p className="text-xs text-[#F97316] mt-1">{errors.province}</p>}
              </div>

              <div>
                <label htmlFor="checkout-district" className="block text-xs font-bold text-slate-300 mb-1.5">
                  Quận / Huyện *
                </label>
                <input
                  id="checkout-district"
                  type="text"
                  autoComplete="address-level2"
                  value={customer.district}
                  onChange={(e) => setCustomer((c) => ({ ...c, district: e.target.value }))}
                  placeholder="VD: Nghĩa Đàn"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:border-[#FACC15] focus:outline-none"
                />
                {errors.district && <p className="text-xs text-[#F97316] mt-1">{errors.district}</p>}
              </div>

              <div>
                <label htmlFor="checkout-ward" className="block text-xs font-bold text-slate-300 mb-1.5">
                  Phường / Xã *
                </label>
                <input
                  id="checkout-ward"
                  type="text"
                  autoComplete="address-level3"
                  value={customer.ward}
                  onChange={(e) => setCustomer((c) => ({ ...c, ward: e.target.value }))}
                  placeholder="VD: Xã Nghĩa Lâm"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:border-[#FACC15] focus:outline-none"
                />
                {errors.ward && <p className="text-xs text-[#F97316] mt-1">{errors.ward}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="checkout-address" className="block text-xs font-bold text-slate-300 mb-1.5">
                Địa chỉ chi tiết (Số nhà, tên đường, thôn/xóm) *
              </label>
              <input
                id="checkout-address"
                type="text"
                autoComplete="street-address"
                value={customer.address}
                onChange={(e) => setCustomer((c) => ({ ...c, address: e.target.value }))}
                placeholder="VD: Đường mòn Hồ Chí Minh, Xóm Yên Lâm"
                className="w-full h-11 px-3.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:border-[#FACC15] focus:outline-none"
              />
              {errors.address && <p className="text-xs text-[#F97316] mt-1">{errors.address}</p>}
            </div>

            <div>
              <label htmlFor="checkout-note" className="block text-xs font-bold text-slate-300 mb-1.5">
                Ghi chú đơn hàng
              </label>
              <textarea
                id="checkout-note"
                rows={2}
                value={customer.note}
                onChange={(e) => setCustomer((c) => ({ ...c, note: e.target.value }))}
                placeholder="VD: Giao giờ hành chính, cho kiểm tra hàng, vào sẵn dây dù..."
                className="w-full p-3 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white placeholder:text-slate-500 focus:border-[#FACC15] focus:outline-none"
              />
            </div>
          </section>

          {/* Shipping Calculation Info */}
          <section className="rounded-2xl border border-slate-800 bg-[#111827] p-5 sm:p-6 space-y-3">
            <h2 className="font-display text-lg font-black text-white flex items-center gap-2">
              <Truck className="w-5 h-5 text-emerald-400" />
              <span>2. Vận Chuyển Tự Động</span>
            </h2>
            <div className="rounded-xl border border-emerald-800/60 bg-[#14532D]/25 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="space-y-1">
                <p className="text-sm font-bold text-white">{totals.shippingReason}</p>
                <p className="text-xs text-slate-300">
                  Thời gian giao dự kiến tới <strong>{customer.province}</strong>: <span className="text-emerald-300 font-semibold">{estimatedDelivery}</span>
                </p>
              </div>
              <strong className="text-lg font-black text-[#FACC15] tabular-nums shrink-0">
                {totals.shippingFee === 0 ? '0đ' : formatPrice(totals.shippingFee)}
              </strong>
            </div>
          </section>

          {/* Payment Methods */}
          <section className="rounded-2xl border border-slate-800 bg-[#111827] p-5 sm:p-6 space-y-4">
            <h2 className="font-display text-lg font-black text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#FACC15]" />
              <span>3. Phương Thức Thanh Toán</span>
            </h2>

            <div className="grid grid-cols-1 gap-3">
              <label
                className={`rounded-xl border p-4 cursor-pointer flex items-start gap-3 transition-colors ${
                  paymentMethod === 'cod'
                    ? 'border-[#FACC15] bg-[#0F172A]'
                    : 'border-slate-800 bg-[#0F172A]/60 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={paymentMethod === 'cod'}
                  onChange={() => setPaymentMethod('cod')}
                  className="mt-1 accent-[#FACC15]"
                />
                <div className="space-y-1">
                  <span className="text-sm font-bold text-white block">
                    Thanh toán khi nhận hàng (COD)
                  </span>
                  <span className="text-xs text-slate-400 block">
                    Nhận hàng, mở ống kiểm tra đúng sản phẩm &amp; số lượng rồi mới thanh toán tiền mặt cho bưu tá.
                  </span>
                </div>
              </label>

              <label
                className={`rounded-xl border p-4 cursor-pointer flex items-start gap-3 transition-colors ${
                  paymentMethod === 'vietqr'
                    ? 'border-[#FACC15] bg-[#0F172A]'
                    : 'border-slate-800 bg-[#0F172A]/60 hover:border-slate-600'
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value="vietqr"
                  checked={paymentMethod === 'vietqr'}
                  onChange={() => setPaymentMethod('vietqr')}
                  className="mt-1 accent-[#FACC15]"
                />
                <div className="space-y-1 flex-1">
                  <span className="text-sm font-bold text-white block">
                    Chuyển khoản ngân hàng (Tự động sinh mã QR VietQR)
                  </span>
                  <span className="text-xs text-slate-400 block">
                    Quét mã VietQR kèm đúng số tiền {formatPrice(totals.total)} và nội dung chuyển khoản là Mã đơn hàng sau khi bấm đặt hàng.
                  </span>
                </div>
              </label>
            </div>

            {paymentMethod === 'vietqr' && (
              <div className="rounded-xl border border-slate-700 bg-[#0F172A] p-4 flex flex-col sm:flex-row items-center gap-4">
                {!qrImageError ? (
                  <img
                    src={liveQrPreviewUrl}
                    alt="Xem trước mã VietQR Đồ Câu LK Hòa"
                    onError={() => setQrImageError(true)}
                    className="w-36 h-36 rounded-xl bg-white p-1.5 object-contain shrink-0"
                  />
                ) : (
                  <div className="w-36 h-36 rounded-xl bg-white text-[#0F172A] flex flex-col items-center justify-center p-2 text-center shrink-0">
                    <QrCode className="w-12 h-12" />
                    <span className="text-[11px] font-bold mt-1">VietQR MB Bank</span>
                  </div>
                )}
                <div className="text-xs space-y-1.5 text-slate-300">
                  <p className="font-bold text-[#FACC15]">Xem trước thông tin VietQR:</p>
                  <p>Ngân hàng: <strong className="text-white">{STORE_BANK_INFO.bankName}</strong></p>
                  <p>Số tài khoản: <strong className="font-mono-tabular text-white">{STORE_BANK_INFO.accountNo}</strong></p>
                  <p>Chủ tài khoản: <strong className="text-white">{STORE_BANK_INFO.accountName}</strong></p>
                  <p>Số tiền: <strong className="text-[#FACC15] tabular-nums">{formatPrice(totals.total)}</strong></p>
                  <p className="text-slate-400">Mã đơn chính thức sẽ được gán vào nội dung chuyển khoản ngay khi bạn xác nhận đặt hàng.</p>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Right: Order Summary */}
        <aside className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#111827] p-5 sm:p-6 space-y-4 lg:sticky lg:top-28">
          <h2 className="font-display text-lg font-black text-white">
            Đơn Hàng ({items.reduce((s, i) => s + i.quantity, 0)} sản phẩm)
          </h2>

          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {items.map((item) => (
              <div key={item.key} className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="w-14 h-14 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                  {item.imageUrl && (
                    <img src={item.imageUrl} alt={item.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-white line-clamp-2">{item.name}</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {item.variantLabel} · SL: <strong className="text-slate-200">{item.quantity}</strong>
                  </p>
                </div>
                <span className="text-xs font-black text-[#FACC15] tabular-nums shrink-0">
                  {formatPrice(item.price * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          {/* Coupon inside Checkout */}
          <div className="space-y-2 border-b border-slate-800 pb-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                  placeholder="Mã giảm giá (LKHOA10, FREESHIP)"
                  className="w-full h-10 pl-8 pr-3 rounded-lg bg-[#0F172A] border border-slate-700 text-xs text-white uppercase focus:border-[#FACC15] focus:outline-none"
                />
              </div>
              <button
                type="button"
                onClick={handleApplyCoupon}
                className="h-10 px-3.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white border border-slate-700 cursor-pointer"
              >
                Áp dụng
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {AVAILABLE_COUPONS.map((c) => (
                <button
                  key={c.code}
                  type="button"
                  onClick={() => {
                    setCouponInput(c.code);
                    const res = applyCoupon(c.code);
                    setCouponFeedback(res.message);
                  }}
                  className={`px-2 py-0.5 rounded font-mono-tabular font-bold cursor-pointer border ${
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
          </div>

          <div className="space-y-2 text-sm">
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
              <span>Phí giao hàng:</span>
              <span className="font-bold tabular-nums">
                {totals.shippingFee === 0 ? '0đ (Miễn phí)' : formatPrice(totals.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between items-baseline border-t border-slate-800 pt-3 font-black text-white">
              <span>Tổng thanh toán:</span>
              <span className="text-2xl text-[#FACC15] tabular-nums">{formatPrice(totals.total)}</span>
            </div>
          </div>

          {submitError && (
            <div
              role="alert"
              className="rounded-xl border border-red-500/50 bg-red-950/40 px-4 py-3 text-sm leading-relaxed text-red-200"
            >
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            data-cta="true"
            className="cta-btn w-full min-h-12 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] text-sm font-black flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <ShieldCheck className="w-5 h-5" />
            <span>{isSubmitting ? 'Đang tạo đơn hàng...' : 'HOÀN TẤT ĐẶT HÀNG'}</span>
          </button>

          <p className="text-[11px] text-slate-400 text-center leading-relaxed">
            Cần hỗ trợ gấp? Gọi hotline <strong className="text-white">{STORE_HOTLINE}</strong> hoặc nhắn Zalo LK Hòa.
          </p>
        </aside>
      </form>
    </div>
  );
};
