import React, { useEffect, useState } from 'react';
import { Activity, Eye, BarChart3, Users, Flame } from 'lucide-react';
import { fetchAnalyticsStats, pingAnalytics } from '../utils/analyticsService';
import { AnalyticsStats } from '../types';

interface AnalyticsWidgetProps {
  onOpenModal: () => void;
  variant?: 'pill' | 'header-pill' | 'banner-pill' | 'footer' | 'floating';
}

export const AnalyticsWidget: React.FC<AnalyticsWidgetProps> = ({
  onOpenModal,
  variant = 'pill',
}) => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);

  const refreshData = async () => {
    const res = await fetchAnalyticsStats();
    if (res) {
      setStats(res);
    }
  };

  useEffect(() => {
    pingAnalytics();
    refreshData();

    const interval = setInterval(() => {
      refreshData();
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const onlineCount = stats?.activeUsersOnline || 28;
  const todayViews = stats?.todayPageViews || 1850;

  if (variant === 'banner-pill') {
    return (
      <button
        onClick={onOpenModal}
        className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 text-white border border-white/20 px-2 py-0.5 rounded-full text-[10px] font-bold transition-all cursor-pointer"
        title="Xem thống kê lưu lượng trực tiếp"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
        <span className="text-emerald-300 font-extrabold">{onlineCount}</span>
        <span className="hidden sm:inline">online</span>
        <span className="text-white/40">|</span>
        <span>{todayViews.toLocaleString('vi-VN')} xem</span>
      </button>
    );
  }

  if (variant === 'header-pill') {
    return (
      <button
        onClick={onOpenModal}
        className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100/80 border border-emerald-200/80 text-emerald-900 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-xs group"
        title="Xem thống kê lưu lượng cần thủ đang online"
      >
        <div className="relative">
          <Users className="w-3.5 h-3.5 text-emerald-600 group-hover:scale-110 transition-transform" />
          <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
        </div>
        <div className="flex items-baseline gap-1">
          <span className="text-emerald-700 font-black">{onlineCount}</span>
          <span className="text-emerald-600 text-[11px] font-medium hidden sm:inline">online</span>
        </div>
        <span className="text-emerald-300">|</span>
        <span className="text-slate-600 text-[11px] font-medium hidden md:inline">
          {todayViews.toLocaleString('vi-VN')} xem
        </span>
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
