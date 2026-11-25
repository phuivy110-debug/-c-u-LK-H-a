import React, { useMemo, useState } from 'react';
import {
  Fish,
  GraduationCap,
  Mountain,
  PackageCheck,
  Target,
  Waves,
} from 'lucide-react';
import type { Product } from '../types';
import { formatPrice, productDisplayName, productPrice } from '../utils/catalog';
import { InternalLink } from './InternalLink';

type NeedId = 'new' | 'lure' | 'pond' | 'stream' | 'combo' | 'accessory';

const NEEDS: Array<{
  id: NeedId;
  label: string;
  summary: string;
  query: string;
  icon: React.ComponentType<{ className?: string }>;
  matches: (product: Product) => boolean;
}> = [
  {
    id: 'new',
    label: 'Người mới bắt đầu',
    summary: 'Bộ dễ phối, dễ chọn và có mức đầu tư hợp lý.',
    query: 'combo',
    icon: GraduationCap,
    matches: (product) => /combo|full bộ|sinh viên|cheap|tiểu học/i.test(product.name),
  },
  {
    id: 'lure',
    label: 'Lure cá lóc',
    summary: 'Cần, máy, dây PE và mồi giả cho bài ném rê.',
    query: 'lure',
    icon: Target,
    matches: (product) => /lure|chuột|cóc|nhái|cá lóc/i.test(`${product.name} ${product.description || ''}`),
  },
  {
    id: 'pond',
    label: 'Câu rô chép hồ',
    summary: 'Cần đài, mồi, phao và trục cho hồ dịch vụ.',
    query: 'rô chép',
    icon: Fish,
    matches: (product) => /rô|chép|câu đài|5h|6h|8h|cám/i.test(`${product.name} ${product.description || ''}`),
  },
  {
    id: 'stream',
    label: 'Câu suối gọn nhẹ',
    summary: 'Trang bị nhẹ, gấp gọn cho khe suối và điểm hẹp.',
    query: 'suối',
    icon: Mountain,
    matches: (product) => /suối|ul|gấp gọn|5 khúc|cá bé/i.test(`${product.name} ${product.description || ''}`),
  },
  {
    id: 'combo',
    label: 'Mua trọn bộ',
    summary: 'Giảm thời gian tự phối cần, máy, dây và phụ kiện.',
    query: 'combo',
    icon: PackageCheck,
    matches: (product) => /combo|full bộ|bộ \d+|mua .* tặng/i.test(product.name),
  },
  {
    id: 'accessory',
    label: 'Bổ sung phụ kiện',
    summary: 'Dây, khóa, lưỡi, phao và đồ hỗ trợ buổi câu.',
    query: 'phụ kiện',
    icon: Waves,
    matches: (product) => /Dây Câu|Phao|Lưỡi|Phụ Kiện/i.test(product.category),
  },
];

export function ShopByNeedSection({
  products,
  onNavigate,
}: {
  products: Product[];
  onNavigate: (path: string) => void;
}) {
  const [selectedNeed, setSelectedNeed] = useState<NeedId>('new');
  const selected = NEEDS.find((need) => need.id === selectedNeed) || NEEDS[0];
  const matches = useMemo(() => {
    const exact = products.filter(selected.matches);
    const fallback = products.filter((product) => !exact.some((item) => item.id === product.id));
    return [...exact, ...fallback].slice(0, 4);
  }, [products, selected]);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-labelledby="shop-by-need-title">
      <div className="overflow-hidden rounded-2xl border border-emerald-900/70 bg-[#111827]">
        <div className="grid lg:grid-cols-[0.85fr_1.15fr]">
          <div className="border-b border-slate-800 p-5 sm:p-7 lg:border-b-0 lg:border-r">
            <p className="text-xs font-extrabold uppercase tracking-wider text-[#FACC15]">Chọn đúng ngay từ đầu</p>
            <h2 id="shop-by-need-title" className="mt-1 text-2xl font-black text-white sm:text-3xl">
              Bác đang muốn câu kiểu nào?
            </h2>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-slate-300">
              Chọn nhu cầu thực tế, hệ thống sẽ gom nhanh nhóm trang bị liên quan để bác không phải tự dò từng danh mục.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-2">
              {NEEDS.map((need) => {
                const Icon = need.icon;
                const active = need.id === selectedNeed;
                return (
                  <button
                    key={need.id}
                    type="button"
                    onClick={() => setSelectedNeed(need.id)}
                    aria-pressed={active}
                    className={`min-h-16 rounded-xl border p-3 text-left transition-colors cursor-pointer ${
                      active
                        ? 'border-[#FACC15] bg-[#FACC15] text-[#0F172A]'
                        : 'border-slate-700 bg-[#0F172A] text-slate-200 hover:border-emerald-600'
                    }`}
                  >
                    <Icon className="mb-1.5 h-4 w-4" aria-hidden="true" />
                    <span className="block text-xs font-extrabold leading-snug sm:text-sm">{need.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-5 sm:p-7" aria-live="polite">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-black text-white">Gợi ý cho: {selected.label}</h3>
                <p className="mt-1 text-sm text-slate-400">{selected.summary}</p>
              </div>
              <button
                type="button"
                onClick={() => onNavigate(`/san-pham?q=${encodeURIComponent(selected.query)}#catalog-search`)}
                className="shrink-0 rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold text-[#FACC15] hover:border-[#FACC15] cursor-pointer"
              >
                Xem đầy đủ
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {matches.map((product) => (
                <InternalLink
                  key={product.id}
                  href={`/san-pham/${product.slug}`}
                  onNavigate={() => onNavigate(`/san-pham/${product.slug}`)}
                  className="group overflow-hidden rounded-xl border border-slate-800 bg-[#0F172A] hover:border-emerald-700"
                >
                  <div className="aspect-square overflow-hidden bg-slate-900">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={productDisplayName(product)}
                        loading="lazy"
                        width="220"
                        height="220"
                        referrerPolicy="no-referrer"
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : null}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-2 min-h-9 text-xs font-bold leading-snug text-white group-hover:text-[#FACC15]">
                      {productDisplayName(product)}
                    </p>
                    <p className="mt-2 text-sm font-black text-[#FACC15] tabular-nums">
                      {productPrice(product) ? formatPrice(productPrice(product)) : 'Xem giá'}
                    </p>
                  </div>
                </InternalLink>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
