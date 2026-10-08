import React, { useEffect, useMemo, useState } from 'react';
import { Check, Copy, Info, TicketPercent } from 'lucide-react';
import { formatVnd, getActiveShopeeVouchers, SHOPEE_VOUCHER_SCOPE_NOTE } from '../data/shopeeVouchers';

const HOW_TO_STEPS = [
  'Chọn sản phẩm trên website và bấm nút mua để mở đúng trang Shopee.',
  'Thêm vào giỏ hoặc bấm “Mua ngay”, kiểm tra đơn đã đạt mức tối thiểu của mã.',
  'Tại bước thanh toán, chọn “Shopee Voucher”, dán mã đã sao chép rồi bấm “Áp dụng”.',
  'Kiểm tra số tiền được giảm trước khi bấm “Đặt hàng”.',
];

export const ShopeeVoucherSection: React.FC = () => {
  const [now, setNow] = useState(() => new Date());
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!copiedCode) return;
    const timer = window.setTimeout(() => setCopiedCode(null), 2000);
    return () => window.clearTimeout(timer);
  }, [copiedCode]);

  const vouchers = useMemo(() => getActiveShopeeVouchers(now), [now]);

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
    } catch {
      window.prompt('Sao chép mã voucher:', code);
    }
  };

  return (
    <section
      id="shopee-voucher"
      aria-labelledby="shopee-voucher-heading"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
    >
      <div className="bg-white rounded-3xl border border-orange-200 shadow-xs p-5 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
          <div>
            <div className="text-xs font-extrabold text-[#EE4D2D] uppercase tracking-wider mb-1">
              Deal Shopee Tháng 10
            </div>
            <h2 id="shopee-voucher-heading" className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <TicketPercent className="w-7 h-7 text-[#EE4D2D]" />
              Mã Giảm Giá Shopee Đang Áp Dụng
            </h2>
          </div>
          <p className="text-xs text-slate-500 font-medium">Giờ áp dụng: 00h00 – 23h59 (giờ Việt Nam)</p>
        </div>

        {vouchers.length > 0 ? (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {vouchers.map((voucher) => (
              <li
                key={voucher.code}
                className="relative flex flex-col justify-between rounded-2xl border border-dashed border-orange-300 bg-orange-50/60 p-4"
              >
                <div className="space-y-1">
                  <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-[#EE4D2D] bg-white border border-orange-200 rounded-full px-2 py-0.5">
                    {voucher.periodLabel}
                  </span>
                  <p className="text-2xl font-black text-[#EE4D2D]">Giảm {formatVnd(voucher.discount)}</p>
                  <p className="text-xs font-semibold text-slate-600">Đơn tối thiểu {formatVnd(voucher.minSpend)}</p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-2 rounded-xl bg-white border border-orange-200 pl-3 pr-1 py-1">
                  <code className="font-mono font-black text-slate-900 tracking-wider">{voucher.code}</code>
                  <button
                    type="button"
                    onClick={() => handleCopy(voucher.code)}
                    aria-label={`Sao chép mã ${voucher.code}`}
                    className="cta-btn inline-flex items-center gap-1 bg-[#EE4D2D] hover:bg-orange-600 text-white text-xs font-extrabold px-3 py-2 rounded-lg cursor-pointer"
                  >
                    {copiedCode === voucher.code ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedCode === voucher.code ? 'Đã chép' : 'Sao chép'}</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-2xl bg-slate-50 border border-slate-200 p-5 text-sm text-slate-600 text-center">
            Hiện chưa có mã mới được cập nhật. Bạn vẫn có thể kiểm tra voucher ngay tại bước thanh toán trên Shopee.
          </p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 rounded-2xl bg-slate-50 border border-slate-200 p-4 sm:p-5">
            <h3 className="text-sm font-extrabold text-slate-900 mb-3">Cách áp dụng voucher</h3>
            <ol className="space-y-2 text-sm text-slate-600">
              {HOW_TO_STEPS.map((step, index) => (
                <li key={step} className="flex gap-3">
                  <span className="shrink-0 w-6 h-6 rounded-full bg-[#EE4D2D] text-white text-xs font-black flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-4 sm:p-5 text-sm text-amber-900 space-y-2">
            <h3 className="font-extrabold flex items-center gap-1.5">
              <Info className="w-4 h-4" />
              Lưu ý
            </h3>
            <p>{SHOPEE_VOUCHER_SCOPE_NOTE}</p>
            <p>Mã có thể giới hạn lượt dùng và hết sớm. Nếu không áp dụng được, hãy kiểm tra thời gian, giá trị đơn tối thiểu và shop có tham gia chương trình hay không.</p>
          </div>
        </div>
      </div>
    </section>
  );
};
