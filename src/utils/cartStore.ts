import type { CartItem, OrderCustomerInfo, OrderRecord, Product, ProductVariant } from '../types';
import { FLAT_SHIPPING_FEE, FREESHIP_THRESHOLD, STORE_BANK_INFO } from './site';

export const CART_STORAGE_KEY = 'lkhoa_cart_v1';
export const COUPON_STORAGE_KEY = 'lkhoa_coupon_v1';
export const ORDERS_STORAGE_KEY = 'lkhoa_orders_v1';

export interface CouponValidationResult {
  valid: boolean;
  code: string;
  discountAmount: number;
  freeShipping: boolean;
  message: string;
}

export const AVAILABLE_COUPONS = [
  { code: 'LKHOA10', description: 'Giảm 10.000đ cho mọi đơn hàng' },
  { code: 'LKHOA30', description: 'Giảm 30.000đ cho đơn từ 500.000đ' },
  { code: 'FREESHIP', description: 'Miễn phí vận chuyển toàn quốc 0đ' },
];

export function evaluateCoupon(rawCode: string, subtotal: number): CouponValidationResult {
  const code = rawCode.trim().toUpperCase();
  if (!code) {
    return { valid: false, code: '', discountAmount: 0, freeShipping: false, message: '' };
  }
  if (code === 'LKHOA10') {
    return {
      valid: true,
      code,
      discountAmount: Math.min(10000, subtotal),
      freeShipping: false,
      message: 'Đã áp dụng mã LKHOA10: Giảm 10.000đ trực tiếp vào đơn hàng.',
    };
  }
  if (code === 'LKHOA30') {
    if (subtotal < 500000) {
      return {
        valid: false,
        code,
        discountAmount: 0,
        freeShipping: false,
        message: 'Mã LKHOA30 áp dụng cho đơn từ 500.000đ trở lên.',
      };
    }
    return {
      valid: true,
      code,
      discountAmount: 30000,
      freeShipping: false,
      message: 'Đã áp dụng mã LKHOA30: Giảm 30.000đ trực tiếp vào đơn hàng.',
    };
  }
  if (code === 'FREESHIP') {
    return {
      valid: true,
      code,
      discountAmount: 0,
      freeShipping: true,
      message: 'Đã áp dụng mã FREESHIP: Miễn phí vận chuyển 0đ toàn quốc.',
    };
  }
  return {
    valid: false,
    code,
    discountAmount: 0,
    freeShipping: false,
    message: 'Mã giảm giá không hợp lệ. Thử: LKHOA10, LKHOA30 hoặc FREESHIP.',
  };
}

export function cartHasFishingRod(items: CartItem[]): boolean {
  return items.some(
    (item) =>
      item.category.toLowerCase().includes('cần') ||
      /\bcần\b/i.test(item.name)
  );
}

export interface CheckoutTotals {
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  shippingReason: string;
  total: number;
  amountToFreeship: number;
  freeshipProgressPercent: number;
  isFreeship: boolean;
}

export function calculateCheckoutTotals(items: CartItem[], couponCode: string): CheckoutTotals {
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const coupon = evaluateCoupon(couponCode, subtotal);
  const discountAmount = coupon.valid ? coupon.discountAmount : 0;
  const hasRod = cartHasFishingRod(items);
  const qualifiesBySubtotal = subtotal >= FREESHIP_THRESHOLD;

  let shippingFee = items.length === 0 ? 0 : FLAT_SHIPPING_FEE;
  let shippingReason = 'Đồng giá 30.000đ toàn quốc (Đơn dưới 300.000đ)';

  if (items.length === 0) {
    shippingFee = 0;
    shippingReason = 'Chưa có sản phẩm trong giỏ';
  } else if (hasRod) {
    shippingFee = 0;
    shippingReason = 'Miễn phí vận chuyển (Đơn có Cần câu + đóng ống PVC bảo vệ)';
  } else if (qualifiesBySubtotal) {
    shippingFee = 0;
    shippingReason = 'Miễn phí vận chuyển (Đơn hàng từ 300.000đ)';
  } else if (coupon.valid && coupon.freeShipping) {
    shippingFee = 0;
    shippingReason = 'Miễn phí vận chuyển (Áp dụng mã FREESHIP)';
  }

  const total = Math.max(0, subtotal - discountAmount + shippingFee);
  const amountToFreeship = hasRod || (coupon.valid && coupon.freeShipping)
    ? 0
    : Math.max(0, FREESHIP_THRESHOLD - subtotal);
  const freeshipProgressPercent = amountToFreeship === 0
    ? 100
    : Math.min(100, Math.round((subtotal / FREESHIP_THRESHOLD) * 100));

  return {
    subtotal,
    discountAmount,
    shippingFee,
    shippingReason,
    total,
    amountToFreeship,
    freeshipProgressPercent,
    isFreeship: shippingFee === 0 && items.length > 0,
  };
}

export function estimateDeliveryWindow(province: string): string {
  const normalized = province.toLowerCase();
  if (/nghệ an|hà tĩnh|thanh hóa|hà nội|hồ chí minh|tp\.hcm/.test(normalized)) {
    return '1–2 ngày làm việc (Giao nhanh khu vực trọng điểm)';
  }
  return '2–4 ngày làm việc (Giao hàng toàn quốc, đồng kiểm)';
}

export function validateVietnamesePhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s.-]/g, '');
  return /^0[35789][0-9]{8}$/.test(cleaned);
}

export function generateOrderCode(): string {
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const rand = String(Math.floor(1000 + Math.random() * 9000));
  return `LK${mm}${dd}${rand}`;
}

export function buildVietQrImageUrl(amount: number, orderCode: string): string {
  const addInfo = encodeURIComponent(`THANH TOAN ${orderCode}`);
  const accountName = encodeURIComponent(STORE_BANK_INFO.accountName);
  return `https://img.vietqr.io/image/${STORE_BANK_INFO.bankId}-${STORE_BANK_INFO.accountNo}-compact2.png?amount=${Math.max(0, Math.round(amount))}&addInfo=${addInfo}&accountName=${accountName}`;
}

export function makeCartItem(product: Product, variant: ProductVariant, quantity: number): CartItem {
  return {
    key: `${product.id}::${variant.id}`,
    productId: product.id,
    slug: product.slug,
    name: product.name,
    category: product.category,
    imageUrl: product.imageUrl,
    variantId: variant.id,
    variantLabel: variant.label,
    sku: variant.sku,
    price: variant.price,
    originalPrice: variant.originalPrice,
    quantity: Math.max(1, quantity),
    shopeeUrl: product.shopeeUrl,
    tiktokUrl: product.tiktokUrl,
  };
}

export function loadSavedCart(): CartItem[] {
  if (typeof localStorage === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCartToStorage(items: CartItem[]): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  } catch {
    // Ignore storage quota issues
  }
}

export function loadSavedCoupon(): string {
  if (typeof localStorage === 'undefined') return '';
  try {
    return localStorage.getItem(COUPON_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function saveCouponToStorage(code: string): void {
  if (typeof localStorage === 'undefined') return;
  try {
    localStorage.setItem(COUPON_STORAGE_KEY, code);
  } catch {
    // Ignore storage quota issues
  }
}

export function saveOrderLocally(order: OrderRecord): void {
  if (typeof localStorage === 'undefined') return;
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    const list: OrderRecord[] = raw ? JSON.parse(raw) : [];
    list.unshift(order);
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(list.slice(0, 20)));
  } catch {
    // Ignore storage quota issues
  }
}

export function buildOrderRecord(
  customer: OrderCustomerInfo,
  paymentMethod: 'cod' | 'vietqr',
  items: CartItem[],
  couponCode: string
): OrderRecord {
  const totals = calculateCheckoutTotals(items, couponCode);
  return {
    orderCode: generateOrderCode(),
    createdAt: new Date().toISOString(),
    customer,
    paymentMethod,
    items,
    subtotal: totals.subtotal,
    discountCode: totals.discountAmount > 0 || (couponCode.trim().toUpperCase() === 'FREESHIP' && totals.isFreeship)
      ? couponCode.trim().toUpperCase()
      : undefined,
    discountAmount: totals.discountAmount,
    shippingFee: totals.shippingFee,
    shippingReason: totals.shippingReason,
    total: totals.total,
    estimatedDelivery: estimateDeliveryWindow(customer.province),
    status: 'pending',
  };
}
