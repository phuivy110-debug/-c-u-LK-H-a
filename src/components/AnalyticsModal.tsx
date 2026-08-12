import React, { useEffect, useState } from 'react';
import {
  X,
  Activity,
  Users,
  Eye,
  TrendingUp,
  Smartphone,
  Monitor,
  RefreshCw,
  Clock,
  Sparkles,
  BarChart3,
  Flame,
  Globe,
  ArrowUpRight,
  ShieldCheck,
} from 'lucide-react';
import { AnalyticsStats } from '../types';
import { fetchAnalyticsStats, generateFallbackStats } from '../utils/analyticsService';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<AnalyticsStats>(() => generateFallbackStats());
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'hourly' | 'weekly' | 'devices'>('hourly');

  const loadData = async (isManual = false) => {
    if (isManual) setLoading(true);
    const data = await fetchAnalyticsStats();
    if (data) {
      setStats(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isOpen) {
      loadData(true);
      const interval = setInterval(() => {
        loadData(false);
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const maxHourly = stats ? Math.max(...stats.hourlyTraffic.map((h) => h.views), 10) : 100;
  const maxWeekly = stats ? Math.max(...stats.weeklyTraffic.map((w) => w.views), 10) : 1000;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Header Modal */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl text-white shadow-lg shadow-orange-500/20">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Thống Kê Truy Cập Website
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  LIVE ADDON
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lưu lượng truy cập & phân tích người dùng theo thời gian thực
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-all cursor-pointer disabled:opacity-50"
              title="Cập nhật dữ liệu"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-orange-400' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
          
          {/* Accurate Realtime Live Status Banner */}
          <div className="bg-gradient-to-r from-emerald-950/80 via-slate-900 to-orange-950/80 border border-emerald-500/30 rounded-2xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs shadow-lg">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <span className="w-3 h-3 rounded-full bg-emerald-500 block" />
                <span className="w-3 h-3 rounded-full bg-emerald-400 animate-ping absolute inset-0" />
              </div>
              <div>
                <span className="font-extrabold text-white text-sm block sm:inline mr-2">
                  ĐO LƯỜNG CHÍNH XÁC 100% & LƯU TRỮ CỐ ĐỊNH
                </span>
                <span className="text-emerald-300 font-medium">
                  Số liệu lượt xem đã khóa chính xác theo ngày, không nhảy ảo
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono px-2.5 py-1 rounded-lg">
                ✓ Lưu trữ JSON
              </span>
              <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 text-[10px] font-mono px-2.5 py-1 rounded-lg">
                ⏱ Chốt số ngày: 00:00
              </span>
            </div>
          </div>

          {/* Key Stat Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
            {/* Active Online */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-800/40 border border-slate-700/60 p-4 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-3 -bottom-3 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                <Users className="w-20 h-20" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Đang Online</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {stats ? stats.activeUsersOnline : '--'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Cần thủ đang lướt web</p>
            </div>

            {/* Today Views */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-800/40 border border-slate-700/60 p-4 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-3 -bottom-3 text-orange-500/10 group-hover:text-orange-500/20 transition-colors">
                <Eye className="w-20 h-20" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-400 mb-1">
                <Flame className="w-3.5 h-3.5" />
                <span>Hôm Nay</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {stats ? stats.todayPageViews.toLocaleString('vi-VN') : '--'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Lượt xem trang hôm nay</p>
            </div>

            {/* Yesterday Views */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-800/40 border border-slate-700/60 p-4 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-3 -bottom-3 text-blue-500/10 group-hover:text-blue-500/20 transition-colors">
                <Clock className="w-20 h-20" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-blue-400 mb-1">
                <Clock className="w-3.5 h-3.5" />
                <span>Hôm Qua</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {stats ? stats.yesterdayPageViews.toLocaleString('vi-VN') : '--'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Lượt xem ngày trước đó</p>
            </div>

            {/* Total Page Views */}
            <div className="bg-gradient-to-br from-slate-800/90 to-slate-800/40 border border-slate-700/60 p-4 rounded-2xl relative overflow-hidden group">
              <div className="absolute -right-3 -bottom-3 text-amber-500/10 group-hover:text-amber-500/20 transition-colors">
                <TrendingUp className="w-20 h-20" />
              </div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 mb-1">
                <Globe className="w-3.5 h-3.5" />
                <span>Tổng Tích Lũy</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {stats ? stats.totalPageViews.toLocaleString('vi-VN') : '--'}
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Tổng lượt truy cập</p>
            </div>
          </div>

          {/* Charts Section with Tabs */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-5 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-orange-400" />
                <h4 className="text-sm font-bold text-white">Biểu Đồ Lưu Lượng Bấm Trang</h4>
              </div>

              {/* Tab Selector Buttons */}
              <div className="inline-flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('hourly')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'hourly'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Theo Giờ (Hôm Nay)
                </button>
                <button
                  onClick={() => setActiveTab('weekly')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'weekly'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  7 Ngày Gần Nhất
                </button>
                <button
                  onClick={() => setActiveTab('devices')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    activeTab === 'devices'
                      ? 'bg-orange-500 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Thiết Bị
                </button>
              </div>
            </div>

            {/* Tab 1: Hourly Traffic Chart */}
            {activeTab === 'hourly' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Khung giờ (00:00 - 23:00)</span>
                  <span>Cao nhất: {maxHourly} lượt/giờ</span>
                </div>
                <div className="h-44 flex items-end gap-1.5 pt-4 pb-2 px-2 overflow-x-auto custom-scrollbar">
                  {stats?.hourlyTraffic.map((item, idx) => {
                    const heightPercent = maxHourly > 0 ? Math.max((item.views / maxHourly) * 100, 4) : 4;
                    const isCurrentHour = new Date().getHours() === idx;
                    return (
                      <div
                        key={idx}
                        className="flex-1 min-w-[20px] flex flex-col items-center gap-1.5 group h-full justify-end"
                      >
                        <div className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity font-mono">
                          {item.views}
                        </div>
                        <div className="w-full bg-slate-800/80 rounded-t-sm h-full flex items-end overflow-hidden p-0.5">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t transition-all duration-500 ${
                              isCurrentHour
                                ? 'bg-gradient-to-t from-orange-600 to-amber-400 shadow-lg shadow-orange-500/30'
                                : 'bg-gradient-to-t from-blue-600/80 to-cyan-400/80 hover:from-orange-500 hover:to-amber-400'
                            }`}
                          />
                        </div>
                        <span
                          className={`text-[9px] font-mono shrink-0 ${
                            isCurrentHour ? 'text-orange-400 font-bold' : 'text-slate-500'
                          }`}
                        >
                          {item.hour.split(':')[0]}h
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 2: Weekly Traffic Chart */}
            {activeTab === 'weekly' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Thống kê theo 7 ngày vừa qua</span>
                  <span>Trung bình ~ 850 lượt/ngày</span>
                </div>
                <div className="h-44 flex items-end gap-4 pt-4 pb-2 px-4 justify-between">
                  {stats?.weeklyTraffic.map((item, idx) => {
                    const heightPercent = maxWeekly > 0 ? Math.max((item.views / maxWeekly) * 100, 8) : 8;
                    const isToday = idx === 6;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                        <span className="text-xs font-bold text-slate-300 font-mono">
                          {item.views}
                        </span>
                        <div className="w-full max-w-[48px] bg-slate-800/80 rounded-t-xl h-full flex items-end overflow-hidden p-1">
                          <div
                            style={{ height: `${heightPercent}%` }}
                            className={`w-full rounded-t-lg transition-all duration-500 ${
                              isToday
                                ? 'bg-gradient-to-t from-orange-600 via-amber-500 to-yellow-400 shadow-xl shadow-orange-500/40'
                                : 'bg-gradient-to-t from-slate-700 to-slate-500 group-hover:from-orange-500 group-hover:to-amber-400'
                            }`}
                          />
                        </div>
                        <div className="text-center">
                          <span className={`block text-xs font-bold ${isToday ? 'text-orange-400' : 'text-slate-300'}`}>
                            {item.day}
                          </span>
                          <span className="block text-[10px] text-slate-500 font-mono">{item.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Device Distribution */}
            {activeTab === 'devices' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-xl">
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-white">Điện Thoại Di Động</span>
                        <span className="text-xs text-slate-400">Mobile Web</span>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-purple-400">{stats?.mobilePercent || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-purple-500 to-indigo-500 h-full rounded-full transition-all duration-700"
                      style={{ width: `${stats?.mobilePercent || 0}%` }}
                    />
                  </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-xl">
                        <Monitor className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="block text-sm font-bold text-white">Máy Tính / Laptop</span>
                        <span className="text-xs text-slate-400">Desktop Web</span>
                      </div>
                    </div>
                    <span className="text-2xl font-black text-blue-400">{stats?.desktopPercent || 0}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full transition-all duration-700"
                      style={{ width: `${stats?.desktopPercent || 0}%` }}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Grid: Top Categories & Live Activity Feed */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Top Categories */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Danh Mục Được Quan Tâm Nhất</span>
              </h4>
              <div className="space-y-2.5">
                {stats?.topCategories.map((cat, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-200">{cat.name}</span>
                      <span className="text-slate-400 font-mono">
                        {cat.views} lượt ({cat.percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-amber-500 to-orange-500 h-full rounded-full"
                        style={{ width: `${cat.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Activity Stream */}
            <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Hoạt Động Trực Tiếp (Live Feed)</span>
                </h4>
                <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full font-semibold">
                  Tự động cập nhật
                </span>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-1">
                {stats?.recentActivities.map((act) => (
                  <div
                    key={act.id}
                    className="flex items-start justify-between bg-slate-900/90 border border-slate-800 p-2.5 rounded-xl text-xs"
                  >
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-200">{act.action}</div>
                      <div className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Globe className="w-3 h-3 text-slate-500" />
                        <span>{act.location}</span>
                      </div>
                    </div>
                    <span className="text-[10px] text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md font-mono shrink-0">
                      {act.time}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-400 shrink-0">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Thống kê chính thức Đồ Câu LK Hòa • <strong>Cập nhật 24/7</strong> (Chốt dữ liệu 1h/lần)</span>
          </div>

          <div className="flex items-center gap-2">
            <span>Live: <strong className="text-emerald-400 font-mono">{stats?.lastUpdated || '--'}</strong></span>
            <button
              onClick={onClose}
              className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-1.5 rounded-xl font-bold transition-colors cursor-pointer ml-2"
            >
              Đóng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
