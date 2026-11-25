import React, { useEffect, useMemo, useState } from 'react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { ArrowUpRight, Package, RefreshCw, Truck } from 'lucide-react';
import type { ConnectorSummary, OrderRecord, OrderStatus } from '../types';
import { formatPrice } from '../utils/catalog';

interface OrderSummaryDashboardProps {
  orders: OrderRecord[];
  connectors: ConnectorSummary[];
  loading?: boolean;
  activeStatusFilter: 'all' | OrderStatus;
  onSelectStatusFilter: (status: 'all' | OrderStatus) => void;
  onRefresh?: () => void;
  onOpenConnectors?: () => void;
}

type TimeRangeKey = '7d' | '14d' | '30d' | 'all';
type ChartMetricMode = 'both' | 'revenue' | 'orders';

interface DailyPoint {
  isoDate: string;
  label: string;
  revenue: number;
  orders: number;
  codRevenue: number;
  vietqrRevenue: number;
}

interface StatusPoint {
  status: OrderStatus;
  label: string;
  shortLabel: string;
  count: number;
  revenue: number;
  color: string;
}

const TIME_RANGES: { key: TimeRangeKey; label: string }[] = [
  { key: '7d', label: '7 ngày' },
  { key: '14d', label: '14 ngày' },
  { key: '30d', label: '30 ngày' },
  { key: 'all', label: 'Tất cả' },
];

const PIPELINE_STAGES: {
  status: OrderStatus;
  label: string;
  shortLabel: string;
  color: string;
}[] = [
  { status: 'pending', label: 'Chờ xác nhận', shortLabel: 'Chờ XN', color: '#FACC15' },
  { status: 'confirmed', label: 'Đã xác nhận', shortLabel: 'Đã XN', color: '#34D399' },
  { status: 'packing', label: 'Đang đóng ống PVC', shortLabel: 'Đóng PVC', color: '#38BDF8' },
  { status: 'shipping', label: 'Đang giao hàng', shortLabel: 'Đang giao', color: '#F97316' },
  { status: 'delivered', label: 'Giao thành công', shortLabel: 'Giao xong', color: '#10B981' },
  { status: 'cancelled', label: 'Đã hủy', shortLabel: 'Đã hủy', color: '#F43F5E' },
];

function toLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDayMonth(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}`;
}

function formatCompactVnd(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    return `${millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1)}tr`;
  }
  if (value >= 1_000) {
    return `${Math.round(value / 1_000)}k`;
  }
  return `${value}`;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{
    dataKey?: string;
    value?: number;
    payload?: DailyPoint;
  }>;
  label?: string | number;
}

const DailyTrendTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-xl border border-slate-700 bg-[#0F172A] px-3.5 py-2.5 shadow-xl text-xs space-y-1.5 min-w-[190px]">
      <div className="font-bold text-white border-b border-slate-800 pb-1 flex items-center justify-between gap-4">
        <span>Ngày {point.label}</span>
        <span className="font-mono-tabular text-[#FACC15]">{point.orders} đơn</span>
      </div>
      <div className="flex items-center justify-between gap-4 text-slate-300">
        <span>Doanh thu:</span>
        <span className="font-mono-tabular font-bold text-emerald-400">
          {formatPrice(point.revenue)}
        </span>
      </div>
      {point.revenue > 0 && (
        <div className="text-[11px] text-slate-400 flex items-center justify-between gap-3 pt-0.5">
          <span>COD: {formatCompactVnd(point.codRevenue)}</span>
          <span>VietQR: {formatCompactVnd(point.vietqrRevenue)}</span>
        </div>
      )}
    </div>
  );
};

interface StatusTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<{
    payload?: StatusPoint;
  }>;
}

const StatusBreakdownTooltip: React.FC<StatusTooltipProps> = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const item = payload[0]?.payload;
  if (!item) return null;

  return (
    <div className="rounded-xl border border-slate-700 bg-[#0F172A] px-3.5 py-2.5 shadow-xl text-xs space-y-1">
      <p className="font-bold text-white">{item.label}</p>
      <p className="text-slate-300">
        Số lượng: <strong className="font-mono-tabular text-[#FACC15]">{item.count} đơn</strong>
      </p>
      <p className="text-slate-400">
        Tổng giá trị: <strong className="font-mono-tabular text-slate-200">{formatPrice(item.revenue)}</strong>
      </p>
    </div>
  );
};

export const OrderSummaryDashboard: React.FC<OrderSummaryDashboardProps> = ({
  orders,
  connectors,
  loading = false,
  activeStatusFilter,
  onSelectStatusFilter,
  onRefresh,
  onOpenConnectors,
}) => {
  const [timeRange, setTimeRange] = useState<TimeRangeKey>('all');
  const [chartMode, setChartMode] = useState<ChartMetricMode>('both');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const scopedOrders = useMemo(() => {
    if (timeRange === 'all') return orders;
    const days = timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : 30;
    const cutoff = new Date();
    cutoff.setHours(0, 0, 0, 0);
    cutoff.setDate(cutoff.getDate() - (days - 1));
    const cutoffMs = cutoff.getTime();
    return orders.filter((order) => {
      const ts = Date.parse(order.createdAt);
      return Number.isFinite(ts) ? ts >= cutoffMs : false;
    });
  }, [orders, timeRange]);

  const metrics = useMemo(() => {
    const totalOrders = scopedOrders.length;
    const nonCancelled = scopedOrders.filter((o) => o.status !== 'cancelled');
    const pendingShipments = scopedOrders.filter(
      (o) => o.status === 'pending' || o.status === 'confirmed' || o.status === 'packing'
    ).length;
    const inTransit = scopedOrders.filter((o) => o.status === 'shipping').length;
    const needsTracking = scopedOrders.filter(
      (o) =>
        (o.status === 'pending' || o.status === 'confirmed' || o.status === 'packing') &&
        !o.trackingCode
    ).length;
    const deliveredCount = scopedOrders.filter((o) => o.status === 'delivered').length;
    const revenue = nonCancelled.reduce((sum, o) => sum + (o.total || 0), 0);
    const codRevenue = nonCancelled
      .filter((o) => o.paymentMethod === 'cod')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const vietqrRevenue = nonCancelled
      .filter((o) => o.paymentMethod === 'vietqr')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const avgOrderValue = nonCancelled.length > 0 ? Math.round(revenue / nonCancelled.length) : 0;
    const completionRate =
      nonCancelled.length > 0 ? Math.round((deliveredCount / nonCancelled.length) * 100) : 0;
    const connectedCount = connectors.filter((c) => c.connected).length;

    return {
      totalOrders,
      activeCount: nonCancelled.length,
      pendingShipments,
      inTransit,
      needsTracking,
      deliveredCount,
      revenue,
      codRevenue,
      vietqrRevenue,
      avgOrderValue,
      completionRate,
      connectedCount,
      totalConnectors: connectors.length || 5,
    };
  }, [scopedOrders, connectors]);

  const dailySeries = useMemo<DailyPoint[]>(() => {
    const bucketMap = new Map<string, { revenue: number; orders: number; codRevenue: number; vietqrRevenue: number }>();

    for (const order of scopedOrders) {
      const parsed = new Date(order.createdAt);
      if (Number.isNaN(parsed.getTime())) continue;
      const key = toLocalDateKey(parsed);
      const current = bucketMap.get(key) || {
        revenue: 0,
        orders: 0,
        codRevenue: 0,
        vietqrRevenue: 0,
      };
      current.orders += 1;
      if (order.status !== 'cancelled') {
        const orderTotal = order.total || 0;
        current.revenue += orderTotal;
        if (order.paymentMethod === 'cod') {
          current.codRevenue += orderTotal;
        } else {
          current.vietqrRevenue += orderTotal;
        }
      }
      bucketMap.set(key, current);
    }

    const windowDays =
      timeRange === '7d' ? 7 : timeRange === '14d' ? 14 : timeRange === '30d' ? 30 : 14;
    const endDate = new Date();
    endDate.setHours(0, 0, 0, 0);

    const points: DailyPoint[] = [];
    for (let offset = windowDays - 1; offset >= 0; offset -= 1) {
      const d = new Date(endDate);
      d.setDate(endDate.getDate() - offset);
      const iso = toLocalDateKey(d);
      const bucket = bucketMap.get(iso);
      points.push({
        isoDate: iso,
        label: formatDayMonth(d),
        revenue: bucket?.revenue || 0,
        orders: bucket?.orders || 0,
        codRevenue: bucket?.codRevenue || 0,
        vietqrRevenue: bucket?.vietqrRevenue || 0,
      });
    }

    return points;
  }, [scopedOrders, timeRange]);

  const statusSeries = useMemo<StatusPoint[]>(() => {
    return PIPELINE_STAGES.map((stage) => {
      const matching = scopedOrders.filter((o) => o.status === stage.status);
      return {
        status: stage.status,
        label: stage.label,
        shortLabel: stage.shortLabel,
        count: matching.length,
        revenue: matching.reduce((sum, o) => sum + (o.total || 0), 0),
        color: stage.color,
      };
    });
  }, [scopedOrders]);

  if (loading && orders.length === 0) {
    return (
      <section aria-label="Bảng tóm tắt hiệu suất đơn hàng" className="space-y-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[0, 1, 2, 3].map((idx) => (
            <div
              key={idx}
              className="rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:p-5 space-y-3 skeleton-shimmer"
            >
              <div className="h-3.5 w-24 rounded bg-slate-800" />
              <div className="h-8 w-32 rounded bg-slate-800" />
              <div className="h-3 w-40 rounded bg-slate-800/70" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <div className="lg:col-span-7 h-[330px] rounded-2xl border border-slate-800 bg-[#111827] p-5 skeleton-shimmer" />
          <div className="lg:col-span-5 h-[330px] rounded-2xl border border-slate-800 bg-[#111827] p-5 skeleton-shimmer" />
        </div>
      </section>
    );
  }

  return (
    <section aria-label="Bảng tóm tắt hiệu suất đơn hàng" className="space-y-4">
      {/* Header Row & Timeframe Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-base sm:text-lg font-extrabold text-white">
            Tổng Quan Hiệu Suất Đơn Hàng
          </h2>
          <p className="text-xs text-slate-400">
            Theo dõi nhanh số lượng đơn, hàng chờ xuất kho và doanh thu thực tế
          </p>
        </div>

        <div
          role="group"
          aria-label="Chọn khoảng thời gian thống kê"
          className="inline-flex items-center gap-1 p-1 rounded-xl bg-[#111827] border border-slate-800 self-start sm:self-auto"
        >
          {TIME_RANGES.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTimeRange(item.key)}
              className={`min-h-8 px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                timeRange === item.key
                  ? 'bg-[#FACC15] text-[#0F172A]'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/70'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* KPI 1: Total Orders */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:p-5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400">Tổng đơn hàng</span>
            {activeStatusFilter !== 'all' && (
              <button
                type="button"
                onClick={() => onSelectStatusFilter('all')}
                className="text-[11px] font-bold text-[#FACC15] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                Xem tất cả
              </button>
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono-tabular tracking-tight">
            {metrics.totalOrders}
          </p>
          <p className="text-xs text-slate-400 font-mono-tabular truncate">
            {metrics.activeCount} hợp lệ · TB {formatPrice(metrics.avgOrderValue)}
          </p>
        </div>

        {/* KPI 2: Pending Shipments */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:p-5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400">Chờ giao vận</span>
            {metrics.pendingShipments > 0 && (
              <button
                type="button"
                onClick={() =>
                  onSelectStatusFilter(activeStatusFilter === 'pending' ? 'all' : 'pending')
                }
                className="text-[11px] font-bold text-[#FACC15] hover:underline whitespace-nowrap shrink-0 cursor-pointer"
              >
                {activeStatusFilter === 'pending' ? 'Bỏ lọc' : 'Lọc đơn chờ'}
              </button>
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-black text-[#FACC15] font-mono-tabular tracking-tight">
            {metrics.pendingShipments}
          </p>
          <p className="text-xs text-slate-400 font-mono-tabular truncate">
            {metrics.inTransit} đang giao · {metrics.needsTracking} thiếu vận đơn
          </p>
        </div>

        {/* KPI 3: Revenue */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:p-5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400">Doanh thu</span>
            <span className="text-[11px] font-semibold text-emerald-400 whitespace-nowrap shrink-0">
              Không tính hủy
            </span>
          </div>
          <p className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono-tabular tracking-tight truncate">
            {formatPrice(metrics.revenue)}
          </p>
          <p className="text-xs text-slate-400 font-mono-tabular truncate">
            COD {formatCompactVnd(metrics.codRevenue)} · VietQR {formatCompactVnd(metrics.vietqrRevenue)}
          </p>
        </div>

        {/* KPI 4: Delivery Completion & Gateways */}
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:p-5 flex flex-col justify-between gap-2">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-400">Giao thành công</span>
            {onOpenConnectors && (
              <button
                type="button"
                onClick={onOpenConnectors}
                className="inline-flex items-center gap-0.5 text-[11px] font-bold text-slate-300 hover:text-[#FACC15] whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>{metrics.connectedCount}/{metrics.totalConnectors} cổng</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <p className="text-2xl sm:text-3xl font-black text-white font-mono-tabular tracking-tight">
            {metrics.deliveredCount}
            <span className="ml-2 text-sm font-bold text-slate-400">
              ({metrics.completionRate}%)
            </span>
          </p>
          <p className="text-xs text-slate-400 truncate">
            {metrics.connectedCount > 0
              ? `${metrics.connectedCount} cổng POS / Ship sẵn sàng`
              : 'Chưa nối cổng vận chuyển tự động'}
          </p>
        </div>
      </div>

      {/* Charts Section */}
      {orders.length === 0 ? (
        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-8 sm:p-10 text-center space-y-3">
          <div className="w-12 h-12 rounded-xl bg-slate-800/80 border border-slate-700 text-[#FACC15] flex items-center justify-center mx-auto">
            <Package className="w-6 h-6" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-display text-base font-bold text-white">
              Chưa có dữ liệu đơn hàng để vẽ biểu đồ
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ngay khi có khách đặt đơn COD đồng kiểm, chuyển khoản VietQR hoặc đặt qua B2A Agent, biểu đồ doanh thu và tiến độ vận chuyển sẽ tự động cập nhật tại đây.
            </p>
          </div>
          {onRefresh && (
            <button
              type="button"
              onClick={onRefresh}
              className="min-h-10 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white inline-flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Kiểm tra đơn mới</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* Chart 1: Revenue & Orders Trend */}
          <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:p-5 flex flex-col justify-between gap-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-sm sm:text-base font-extrabold text-white">
                  Doanh Thu &amp; Lưu Lượng Đơn ({timeRange === 'all' ? '14 ngày gần nhất' : TIME_RANGES.find((r) => r.key === timeRange)?.label})
                </h3>
                <p className="text-xs text-slate-400">
                  Cột vàng: Số đơn · Đường xanh: Doanh thu hợp lệ theo ngày
                </p>
              </div>

              <div
                role="group"
                aria-label="Chế độ hiển thị biểu đồ xu hướng"
                className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#0F172A] border border-slate-800"
              >
                {(
                  [
                    { key: 'both', label: 'Cả hai' },
                    { key: 'revenue', label: 'Doanh thu' },
                    { key: 'orders', label: 'Số đơn' },
                  ] as const
                ).map((mode) => (
                  <button
                    key={mode.key}
                    type="button"
                    onClick={() => setChartMode(mode.key)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-bold whitespace-nowrap shrink-0 cursor-pointer transition-colors ${
                      chartMode === mode.key
                        ? 'bg-slate-800 text-[#FACC15]'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {mode.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="w-full h-[250px] min-w-0">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
                  <ComposedChart data={dailySeries} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="lkhoaRevenueGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" vertical={false} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      axisLine={{ stroke: '#334155' }}
                      tickLine={false}
                      interval="preserveStartEnd"
                    />
                    {chartMode !== 'orders' && (
                      <YAxis
                        yAxisId="revenue"
                        tickFormatter={formatCompactVnd}
                        tick={{ fill: '#94A3B8', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={46}
                      />
                    )}
                    {chartMode !== 'revenue' && (
                      <YAxis
                        yAxisId="orders"
                        orientation={chartMode === 'orders' ? 'left' : 'right'}
                        allowDecimals={false}
                        tick={{ fill: '#FACC15', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={32}
                      />
                    )}
                    <Tooltip
                      content={<DailyTrendTooltip />}
                      cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                    />
                    {chartMode !== 'revenue' && (
                      <Bar
                        yAxisId="orders"
                        dataKey="orders"
                        name="Số đơn"
                        fill="#FACC15"
                        fillOpacity={0.85}
                        radius={[4, 4, 0, 0]}
                        maxBarSize={20}
                      />
                    )}
                    {chartMode !== 'orders' && (
                      <Area
                        yAxisId="revenue"
                        type="monotone"
                        dataKey="revenue"
                        name="Doanh thu"
                        stroke="#10B981"
                        strokeWidth={2.25}
                        fill="url(#lkhoaRevenueGradient)"
                        activeDot={{ r: 5, fill: '#10B981', stroke: '#0F172A', strokeWidth: 2 }}
                      />
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full rounded-xl bg-[#0F172A] border border-slate-800/80" />
              )}
            </div>
          </div>

          {/* Chart 2: Shipment & Status Pipeline */}
          <div className="lg:col-span-5 rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:p-5 flex flex-col justify-between gap-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-sm sm:text-base font-extrabold text-white">
                  Trạng Thái Xử Lý &amp; Giao Vận
                </h3>
                <p className="text-xs text-slate-400">
                  Bấm vào trạng thái để lọc nhanh danh sách đơn bên dưới
                </p>
              </div>
              <Truck className="w-4 h-4 text-[#F97316] shrink-0 mt-1" aria-hidden="true" />
            </div>

            <div className="w-full h-[210px] min-w-0">
              {isMounted ? (
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={190}>
                  <BarChart
                    data={statusSeries}
                    layout="vertical"
                    margin={{ top: 2, right: 16, left: 4, bottom: 2 }}
                  >
                    <CartesianGrid stroke="#1E293B" strokeDasharray="3 3" horizontal={false} />
                    <XAxis
                      type="number"
                      allowDecimals={false}
                      tick={{ fill: '#94A3B8', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      type="category"
                      dataKey="shortLabel"
                      width={74}
                      tick={{ fill: '#E2E8F0', fontSize: 11, fontWeight: 600 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      content={<StatusBreakdownTooltip />}
                      cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                    />
                    <Bar
                      dataKey="count"
                      radius={[0, 6, 6, 0]}
                      barSize={18}
                      onClick={(data: any) => {
                        const clickedStatus = data?.status as OrderStatus | undefined;
                        if (clickedStatus) {
                          onSelectStatusFilter(
                            activeStatusFilter === clickedStatus ? 'all' : clickedStatus
                          );
                        }
                      }}
                      className="cursor-pointer"
                    >
                      {statusSeries.map((entry) => (
                        <Cell
                          key={entry.status}
                          fill={entry.color}
                          fillOpacity={
                            activeStatusFilter === 'all' || activeStatusFilter === entry.status
                              ? 0.92
                              : 0.3
                          }
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="w-full h-full rounded-xl bg-[#0F172A] border border-slate-800/80" />
              )}
            </div>

            {/* Interactive Stage Quick-Filter Buttons (Accessible Complement to Chart Bars) */}
            <div className="flex flex-wrap gap-1.5 pt-1 border-t border-slate-800/80">
              {statusSeries.map((stage) => {
                const isSelected = activeStatusFilter === stage.status;
                return (
                  <button
                    key={stage.status}
                    type="button"
                    onClick={() => onSelectStatusFilter(isSelected ? 'all' : stage.status)}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold font-mono-tabular whitespace-nowrap shrink-0 transition-colors cursor-pointer border ${
                      isSelected
                        ? 'bg-[#FACC15] text-[#0F172A] border-[#FACC15]'
                        : 'bg-[#0F172A] text-slate-300 border-slate-800 hover:border-slate-600'
                    }`}
                  >
                    {stage.shortLabel}: {stage.count}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
