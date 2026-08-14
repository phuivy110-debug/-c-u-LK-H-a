import React, { useEffect, useState } from 'react';
import {
  Activity,
  Users,
  Eye,
  ChevronUp,
  ChevronDown,
  X,
  ShieldCheck,
  MapPin,
  Flame,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { AnalyticsStats } from '../types';
import { fetchAnalyticsStats, pingAnalytics } from '../utils/analyticsService';

interface FloatingTrafficWidgetProps {
  onOpenModal: () => void;
}

export const FloatingTrafficWidget: React.FC<FloatingTrafficWidgetProps> = ({ onOpenModal }) => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [activityIdx, setActivityIdx] = useState(0);

  const loadStats = async () => {
    const data = await fetchAnalyticsStats();
    if (data) {
      setStats(data);
    }
  };

  useEffect(() => {
    pingAnalytics();
    loadStats();
    const interval = setInterval(loadStats, 6000);
    return () => clearInterval(interval);
  }, []);

  // Rotate activity every 4.5 seconds
  useEffect(() => {
    if (!stats || !stats.recentActivities || stats.recentActivities.length === 0) return;
    const timer = setInterval(() => {
      setActivityIdx((prev) => (prev + 1) % stats.recentActivities.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [stats]);

  if (isDismissed || !stats) {
    if (isDismissed) {
      // Tiny collapsed trigger pill
      return (
        <button
          onClick={() => setIsDismissed(false)}
          className="fixed bottom-20 left-4 z-40 bg-slate-900/90 hover:bg-slate-900 text-white p-2 rounded-full shadow-lg border border-slate-700/80 backdrop-blur-md transition-transform hover:scale-110 cursor-pointer"
          title="Mở bảng thống kê lưu lượng online"
        >
          <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
        </button>
      );
    }
    return null;
  }

  const onlineCount = stats.activeUsersOnline || 28;
  const todayViews = stats.todayPageViews || 1850;
  const latestActivity = stats.recentActivities && stats.recentActivities.length > 0 ? stats.recentActivities[activityIdx] : null;

  return (
    <div className="fixed bottom-20 left-4 z-40 max-w-xs sm:max-w-sm">
      <div className="bg-slate-950/95 text-white border border-slate-800/90 rounded-2xl sm:rounded-3xl shadow-2xl backdrop-blur-xl p-3 sm:p-3.5 space-y-2.5 transition-all duration-300 animate-fade-in">
        
        {/* Main Bar Line */}
        <div className="flex items-center justify-between gap-2">
          
          <button
            onClick={onOpenModal}
            className="flex items-center gap-2 text-left cursor-pointer group flex-1"
            title="Bấm xem đầy đủ bảng thống kê lưu lượng"
          >
            <div className="relative">
              <div className="w-7 h-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Users className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="leading-tight">
              <div className="flex items-center gap-1.5 font-extrabold text-xs text-white">
                <span className="text-emerald-400 text-sm font-black">{onlineCount}</span>
                <span className="text-[11px] text-slate-300 font-medium">cần thủ online</span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center gap-1">
                <Eye className="w-2.5 h-2.5 text-orange-400" />
                <span>{todayViews.toLocaleString('vi-VN')} xem hôm nay</span>
              </div>
            </div>
          </button>

          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
              title={isExpanded ? 'Thu gọn' : 'Xem hoạt động'}
            >
              {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1 text-slate-500 hover:text-slate-300 rounded-lg hover:bg-slate-800/80 transition-colors cursor-pointer"
              title="Ẩn tạm thời"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Live Mini Activity Toast (Always visible or in compact mode) */}
        {latestActivity && (
          <div
            onClick={onOpenModal}
            className="bg-slate-900/80 hover:bg-slate-800/80 border border-slate-800 p-2 rounded-xl text-[11px] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
            <div className="truncate text-slate-300 flex-1">
              <span className="font-bold text-white mr-1">{latestActivity.location}:</span>
              <span>{latestActivity.action}</span>
            </div>
            <span className="text-[9px] text-slate-500 font-mono shrink-0">
              {latestActivity.time}
            </span>
          </div>
        )}

        {/* Expanded View with More Details */}
        {isExpanded && (
          <div className="pt-2 border-t border-slate-800/80 space-y-2 text-xs">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Chuyển Shopee/TikTok:</span>
                <span className="font-extrabold text-orange-400 text-xs">
                  {stats.todayConversions || 390}+ lượt
                </span>
              </div>
              <div className="bg-slate-900 p-2 rounded-xl border border-slate-800/60">
                <span className="text-slate-400 block text-[10px]">Độ tin cậy:</span>
                <span className="font-extrabold text-emerald-400 text-xs">
                  {stats.satisfactionRate || 99.8}% chính hãng
                </span>
              </div>
            </div>

            <button
              onClick={onOpenModal}
              className="w-full bg-[#EE4D2D] hover:bg-orange-600 text-white font-bold py-1.5 rounded-xl text-[11px] flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Xem chi tiết lưu lượng hệ thống</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
