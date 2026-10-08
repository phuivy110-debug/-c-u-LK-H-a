export interface ShopeeVoucher {
  code: string;
  discount: number;
  minSpend: number;
  startsAt: string;
  endsAt: string;
  periodLabel: string;
}

export const SHOPEE_VOUCHER_SCOPE_NOTE = 'Mã áp dụng cho một số shop tham gia chương trình Tiếp thị liên kết người bán.';

// Thời gian theo Asia/Ho_Chi_Minh (UTC+7), lấy từ ảnh chương trình Shopee tháng 10/2026.
export const SHOPEE_VOUCHERS: ShopeeVoucher[] = [
  { code: 'AFFNXNX', discount: 49000, minSpend: 169000, startsAt: '2026-10-01T00:00:00+07:00', endsAt: '2026-10-02T23:59:59+07:00', periodLabel: '01.10 – 02.10' },
  { code: 'AFFATVN', discount: 30000, minSpend: 99000, startsAt: '2026-10-01T00:00:00+07:00', endsAt: '2026-10-02T23:59:59+07:00', periodLabel: '01.10 – 02.10' },
  { code: 'AFFOGIO', discount: 100000, minSpend: 350000, startsAt: '2026-10-10T00:00:00+07:00', endsAt: '2026-10-10T23:59:59+07:00', periodLabel: 'Chỉ ngày 10.10' },
  { code: 'AFFYQM', discount: 59000, minSpend: 209000, startsAt: '2026-10-10T00:00:00+07:00', endsAt: '2026-10-10T23:59:59+07:00', periodLabel: 'Chỉ ngày 10.10' },
  { code: 'AFFOMUA', discount: 35000, minSpend: 135000, startsAt: '2026-10-10T00:00:00+07:00', endsAt: '2026-10-10T23:59:59+07:00', periodLabel: 'Chỉ ngày 10.10' },
  { code: 'AFFKOO', discount: 69000, minSpend: 250000, startsAt: '2026-10-01T00:00:00+07:00', endsAt: '2026-10-31T23:59:59+07:00', periodLabel: '01.10 – 31.10' },
  { code: 'AFF10OC', discount: 50000, minSpend: 199000, startsAt: '2026-10-01T00:00:00+07:00', endsAt: '2026-10-31T23:59:59+07:00', periodLabel: '01.10 – 31.10' },
  { code: 'AFFVISA', discount: 39000, minSpend: 150000, startsAt: '2026-10-01T00:00:00+07:00', endsAt: '2026-10-31T23:59:59+07:00', periodLabel: '01.10 – 31.10' },
  { code: 'AFFOCTT', discount: 29000, minSpend: 99000, startsAt: '2026-10-01T00:00:00+07:00', endsAt: '2026-10-31T23:59:59+07:00', periodLabel: '01.10 – 31.10' },
];

export function getActiveShopeeVouchers(now: Date = new Date(), vouchers: ShopeeVoucher[] = SHOPEE_VOUCHERS): ShopeeVoucher[] {
  const time = now.getTime();
  return vouchers.filter((voucher) => Date.parse(voucher.startsAt) <= time && time <= Date.parse(voucher.endsAt));
}

export function formatVnd(value: number): string {
  if (value % 1000 === 0) return `${value / 1000}K`;
  return `${value.toLocaleString('vi-VN')}đ`;
}
