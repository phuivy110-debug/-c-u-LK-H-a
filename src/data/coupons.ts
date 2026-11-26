export type CouponDiscountType = 'fixed' | 'percent' | 'free_shipping';

export interface ManagedCoupon {
  code: string;
  title: string;
  description: string;
  discountType: CouponDiscountType;
  discountValue: number;
  minSpend: number;
  maxDiscount?: number;
  startsAt: string;
  endsAt: string;
  enabled: boolean;
  campaign: string;
  channel: 'website' | 'shopee' | 'all';
}

export const DEFAULT_COUPONS: ManagedCoupon[] = [
  { code: 'LKHOA10', title: 'Ưu đãi khách mới', description: 'Giảm 10.000đ cho mọi đơn website', discountType: 'fixed', discountValue: 10000, minSpend: 0, startsAt: '2026-01-01T00:00:00+07:00', endsAt: '2027-01-01T00:00:00+07:00', enabled: true, campaign: 'Website thường trực', channel: 'website' },
  { code: 'LKHOA30', title: 'Mua từ 500K', description: 'Giảm 30.000đ cho đơn từ 500.000đ', discountType: 'fixed', discountValue: 30000, minSpend: 500000, startsAt: '2026-01-01T00:00:00+07:00', endsAt: '2027-01-01T00:00:00+07:00', enabled: true, campaign: 'Website thường trực', channel: 'website' },
  { code: 'FREESHIP', title: 'Miễn phí vận chuyển', description: 'Miễn phí vận chuyển toàn quốc', discountType: 'free_shipping', discountValue: 0, minSpend: 0, startsAt: '2026-01-01T00:00:00+07:00', endsAt: '2027-01-01T00:00:00+07:00', enabled: true, campaign: 'Website thường trực', channel: 'website' },
  { code: 'BLACKFRIDAY', title: 'Black Friday', description: 'Giảm 10% tối đa 100.000đ', discountType: 'percent', discountValue: 10, minSpend: 500000, maxDiscount: 100000, startsAt: '2026-11-27T00:00:00+07:00', endsAt: '2026-11-30T23:59:59+07:00', enabled: true, campaign: 'Black Friday', channel: 'website' },
  { code: 'SALE1212', title: 'Đại tiệc 12.12', description: 'Giảm 12% tối đa 120.000đ', discountType: 'percent', discountValue: 12, minSpend: 500000, maxDiscount: 120000, startsAt: '2026-12-12T00:00:00+07:00', endsAt: '2026-12-12T23:59:59+07:00', enabled: true, campaign: 'Shopee 12.12 / Website', channel: 'all' },
];

export function getActiveManagedCoupons(now = new Date(), coupons = DEFAULT_COUPONS): ManagedCoupon[] {
  const time = now.getTime();
  return coupons.filter((coupon) => coupon.enabled && Date.parse(coupon.startsAt) <= time && time <= Date.parse(coupon.endsAt));
}

export function couponStatus(coupon: ManagedCoupon, now = new Date()): 'active' | 'scheduled' | 'expired' | 'disabled' {
  if (!coupon.enabled) return 'disabled';
  const time = now.getTime();
  if (time < Date.parse(coupon.startsAt)) return 'scheduled';
  if (time > Date.parse(coupon.endsAt)) return 'expired';
  return 'active';
}
