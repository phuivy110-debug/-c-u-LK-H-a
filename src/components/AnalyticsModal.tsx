import React, { useEffect, useState } from 'react';
import {
  X,
  Activity,
  Users,
  Eye,
  Smartphone,
  Monitor,
  RefreshCw,
  BarChart3,
  ShieldCheck,
  Database,
} from 'lucide-react';
import { AnalyticsStats } from '../types';
import { fetchAnalyticsStats } from '../utils/analyticsService';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async (isManual = false) => {
    if (isManual) setLoading(true);
    const data = await fetchAnalyticsStats();
    setStats(data);
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
                  Thống Kê Truy Cập Website LK Hòa
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  REAL-TIME
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Chỉ số lưu lượng thực tế đo lường trực tiếp từ server
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
        <div className="p-6 overflow-y-auto space-y-6">
          {stats ? (
            <>
              {/* Stat Cards Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <span>Đang Online</span>
                  </div>
                  <div className="text-2xl font-black text-emerald-400">
                    {stats.activeUsersOnline}
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                    <Eye className="w-4 h-4 text-orange-400" />
                    <span>Hôm Nay</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {stats.todayPageViews.toLocaleString('vi-VN')}
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                    <BarChart3 className="w-4 h-4 text-sky-400" />
                    <span>Tổng Lượt Xem</span>
                  </div>
                  <div className="text-2xl font-black text-white">
                    {stats.totalPageViews.toLocaleString('vi-VN')}
                  </div>
                </div>

                <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl">
                  <div className="flex items-center gap-2 text-slate-400 text-xs font-semibold mb-1">
                    <Smartphone className="w-4 h-4 text-purple-400" />
                    <span>Di Động / Máy Tính</span>
                  </div>
                  <div className="text-sm font-bold text-white mt-1">
                    {stats.mobilePercent}% mobile / {stats.desktopPercent}% desktop
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              {stats.recentActivities && stats.recentActivities.length > 0 && (
                <div className="bg-slate-800/30 border border-slate-800/80 rounded-2xl p-4">
                  <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Hoạt Động Người Dùng Mới Nhất</span>
                  </h4>
                  <div className="space-y-2">
                    {stats.recentActivities.map((act) => (
                      <div
                        key={act.id}
                        className="bg-slate-800/60 p-2.5 rounded-xl text-xs flex items-center justify-between gap-2"
                      >
                        <span className="text-slate-200 font-medium truncate">{act.action}</span>
                        <span className="text-[10px] text-slate-400 shrink-0 font-mono">
                          {act.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Database className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
              <div className="text-base font-bold text-slate-300">Chưa có dữ liệu thống kê</div>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Hệ thống đang ghi nhận lưu lượng truy cập thực tế.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
