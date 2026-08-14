import React, { useEffect, useState } from 'react';
import {
  Activity,
  Users,
  Eye,
  ShoppingBag,
  ShieldCheck,
  Award,
  Sparkles,
  TrendingUp,
  MapPin,
  Clock,
  ArrowRight,
  ExternalLink,
  Flame,
  CheckCircle2,
} from 'lucide-react';
import { AnalyticsStats } from '../types';
import { fetchAnalyticsStats } from '../utils/analyticsService';

interface RealtimeTrafficTrustSectionProps {
  onOpenAnalyticsModal: () => void;
  onScrollToCatalog?: () => void;
}

export const RealtimeTrafficTrustSection: React.FC<RealtimeTrafficTrustSectionProps> = ({
  onOpenAnalyticsModal,
  onScrollToCatalog,
}) => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [activeActivityIndex, setActiveActivityIndex] = useState(0);

  const loadData = async () => {
    const data = await fetchAnalyticsStats();
    if (data) {
      setStats(data);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 5000);
    return () => clearInterval(interval);
  }, []);

  // Cycle through recent activities for animated highlight
  useEffect(() => {
    if (!stats || !stats.recentActivities || stats.recentActivities.length === 0) return;
    const timer = setInterval(() => {
      setActiveActivityIndex((prev) => (prev + 1) % stats.recentActivities.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [stats]);

  const onlineCount = stats?.activeUsersOnline || 28;
  const todayViews = stats?.todayPageViews || 1850;
  const todayConversions = stats?.todayConversions || 390;
  const satisfactionRate = stats?.satisfactionRate || 99.8;
  const activities = stats?.recentActivities || [];

  return (
    <section className="py-8 sm:py-10 bg-gradient-to-b from-[#F6F7FB] via-white to-[#F6F7FB]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-2 border-b border-slate-200/80">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 px-3 py-1 rounded-full text-xs font-extrabold tracking-wide uppercase">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <span>Realtime Social Proof & Traffic</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5 flex-wrap">
              <span>Thống Kê Hoạt Động & Độ Tin Cậy Trực Tuyến</span>
              <span className="text-xs sm:text-sm font-bold bg-slate-900 text-white px-2.5 py-0.5 rounded-lg">
                LK Hòa Live
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed">
              Dữ liệu lưu lượng truy cập thực tế từ cộng đồng cần thủ trên toàn quốc. Mua sắm an tâm với 100% liên kết dẫn tới gian hàng chính hãng Đồ Câu LK Hòa.
            </p>
          </div>

          <button
            onClick={onOpenAnalyticsModal}
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md hover:shadow-lg cursor-pointer self-start md:self-auto shrink-0 group active:scale-95"
          >
            <Activity className="w-4 h-4 text-emerald-400 group-hover:rotate-12 transition-transform" />
            <span>Xem Báo Cáo Chi Tiết</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* 4 Core Realtime Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
          
          {/* Card 1: Active Online */}
          <div className="relative bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5 text-emerald-600" />
                </div>
                <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-700 px-2 py-0.5 rounded-full text-[10px] font-extrabold border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>TRỰC TIẾP</span>
                </div>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-baseline gap-1.5">
                  <span className="text-emerald-600">{onlineCount}</span>
                  <span className="text-xs sm:text-sm font-bold text-slate-500">cần thủ</span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  Đang online duyệt đồ câu
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-emerald-600" />
                <span>Hoạt động sôi nổi 63 tỉnh thành</span>
              </div>
            </div>
          </div>

          {/* Card 2: Today Page Views */}
          <div className="relative bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-orange-100 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-orange-50 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  <Eye className="w-5 h-5 text-[#EE4D2D]" />
                </div>
                <span className="bg-orange-50 text-[#EE4D2D] px-2 py-0.5 rounded-full text-[10px] font-black border border-orange-200">
                  HÔM NAY
                </span>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {todayViews.toLocaleString('vi-VN')}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  Lượt xem & so sánh giá
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-orange-700 font-semibold flex items-center gap-1">
                <Flame className="w-3 h-3 text-orange-500 fill-orange-500" />
                <span>+18% so với ngày hôm qua</span>
              </div>
            </div>
          </div>

          {/* Card 3: Store Conversions */}
          <div className="relative bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-blue-100 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                </div>
                <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-black border border-blue-200">
                  CHUYỂN SÀN
                </span>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900">
                  {todayConversions.toLocaleString('vi-VN')}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  Lượt bấm săn deal Shopee/TikTok
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-blue-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-blue-600" />
                <span>100% tới gian hàng chính thức</span>
              </div>
            </div>
          </div>

          {/* Card 4: Trust & Satisfaction */}
          <div className="relative bg-white p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-amber-100 shadow-sm hover:shadow-md transition-shadow group overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full blur-xl -mr-6 -mt-6 pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
                  <ShieldCheck className="w-5 h-5 text-amber-600" />
                </div>
                <span className="bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full text-[10px] font-black border border-amber-200">
                  UY TÍN 100%
                </span>
              </div>

              <div>
                <div className="text-2xl sm:text-3xl font-black text-slate-900 flex items-baseline gap-1">
                  <span className="text-amber-600">{satisfactionRate}%</span>
                  <span className="text-xs font-bold text-slate-500">hài lòng</span>
                </div>
                <div className="text-xs text-slate-500 font-medium mt-0.5">
                  Cam kết chuẩn đồ câu LK Hòa
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 text-[11px] text-amber-700 font-semibold flex items-center gap-1">
                <Award className="w-3 h-3 text-amber-600" />
                <span>Được hơn 15.000 cần thủ tin dùng</span>
              </div>
            </div>
          </div>

        </div>

        {/* Realtime Live Activity Radar Bar */}
        {activities.length > 0 && (
          <div className="bg-slate-900 text-slate-200 p-4 sm:p-5 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3 shrink-0">
              <div className="relative">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 font-bold">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                </div>
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div>
                <div className="text-xs font-extrabold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <span>Nhịp Đập Hoạt Động Khách Hàng</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
                <div className="text-[11px] text-slate-400">
                  Ghi nhận tương tác trực tiếp theo thời gian thực
                </div>
              </div>
            </div>

            {/* Rotating Activity Ticker */}
            <div className="flex-1 overflow-hidden bg-slate-950/60 border border-slate-800/80 rounded-xl p-2.5 sm:px-4">
              <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                <span className="inline-flex items-center gap-1 bg-slate-800 text-slate-300 text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0">
                  <MapPin className="w-3 h-3 text-orange-400" />
                  <span>{activities[activeActivityIndex]?.location || 'Nghệ An, VN'}</span>
                </span>
                <span className="text-xs sm:text-sm font-semibold text-white truncate max-w-md">
                  {activities[activeActivityIndex]?.action || 'Vừa xem Cần Câu LK Hòa'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono ml-auto shrink-0 flex items-center gap-1">
                  <Clock className="w-2.5 h-2.5" />
                  {activities[activeActivityIndex]?.time || 'Vừa xong'}
                </span>
              </div>
            </div>

            <button
              onClick={onOpenAnalyticsModal}
              className="text-xs text-orange-400 hover:text-orange-300 font-bold flex items-center gap-1 self-end md:self-auto shrink-0 cursor-pointer hover:underline"
            >
              <span>Xem lịch sử ({activities.length})</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
