import React, { useEffect, useState } from 'react';
import { Activity, Users, Eye, TrendingUp, BarChart3 } from 'lucide-react';
import { fetchAnalyticsStats, pingAnalytics } from '../utils/analyticsService';

interface AnalyticsWidgetProps {
  onOpenModal: () => void;
  variant?: 'pill' | 'footer' | 'floating';
}

export const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({
  onOpenModal,
  variant = 'pill',
}) => {
  const [onlineCount, setOnlineCount] = useState<number>(24);
  const [todayViews, setTodayViews] = useState<number>(1240);

  const refreshData = async () => {
    const stats = await fetchAnalyticsStats();
    if (stats) {
      setOnlineCount(stats.activeUsersOnline);
      setTodayViews(stats.todayPageViews);
    }
  };

  useEffect(() => {
    // Initial ping and data fetch
    pingAnalytics();
    refreshData();

    // 24/7 Real-time polling every 3.5 seconds
    const interval = setInterval(() => {
      refreshData();
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  if (variant === 'floating') {
    return (
      <button
        onClick={onOpenModal}
        className="fixed bottom-20 left-4 z-30 bg-slate-900/95 hover:bg-slate-900 text-white border border-slate-700/80 shadow-2xl px-3.5 py-2 rounded-2xl flex items-center gap-2.5 backdrop-blur-md transition-all hover:scale-105 active:scale-95 cursor-pointer group"
        title="Bấm xem Thống kê truy cập web"
      >
        <div className="relative">
          <Activity className="w-4 h-4 text-emerald-400 group-hover:animate-spin" />
          <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
        </div>
        <div className="text-left text-xs">
          <div className="flex items-center gap-1 font-bold text-white leading-none">
            <span className="text-emerald-400">{onlineCount}</span>
            <span className="text-[10px] text-slate-300 font-normal">đang lướt</span>
          </div>
          <div className="text-[10px] text-slate-400 leading-tight">
            {todayViews.toLocaleString('vi-VN')} xem hôm nay
          </div>
        </div>
        <BarChart3 className="w-3.5 h-3.5 text-orange-400 ml-1" />
      </button>
    );
  }

  if (variant === 'footer') {
    return (
      <button
        onClick={onOpenModal}
        className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white px-4 py-2 rounded-2xl text-xs font-semibold transition-all cursor-pointer shadow-sm group"
      >
        <div className="flex items-center gap-1.5 text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span className="font-extrabold">{onlineCount}</span>
          <span className="text-slate-400 text-[11px]">Online</span>
        </div>
        <span className="text-slate-700">|</span>
        <div className="flex items-center gap-1 text-slate-300">
          <Eye className="w-3.5 h-3.5 text-orange-400" />
          <span>Hôm nay: <strong className="text-white">{todayViews.toLocaleString('vi-VN')}</strong></span>
        </div>
        <BarChart3 className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform ml-1" />
      </button>
    );
  }

  // Default 'pill' for Header
  return (
    <button
      onClick={onOpenModal}
      className="inline-flex items-center gap-2 bg-emerald-50/90 hover:bg-emerald-100/90 border border-emerald-200 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer shadow-xs group"
      title="Xem Thống Kê Truy Cập Web"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
      <span className="text-emerald-700 font-extrabold">{onlineCount}</span>
      <span className="text-emerald-600 font-normal hidden sm:inline">online</span>
      <span className="text-emerald-300">|</span>
      <span className="text-emerald-800">{todayViews.toLocaleString('vi-VN')} lượt xem</span>
      <BarChart3 className="w-3.5 h-3.5 text-emerald-600 group-hover:rotate-12 transition-transform" />
    </button>
  );
};
