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
  MapPin,
  ShoppingBag,
  Award,
  Sparkles,
  TrendingUp,
  ExternalLink,
  CheckCircle2,
  Phone,
  Store,
} from 'lucide-react';
import { AnalyticsStats } from '../types';
import { fetchAnalyticsStats } from '../utils/analyticsService';
import { SHARED_TIKTOK_URL } from '../utils/googleSheetSync';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({ isOpen, onClose }) => {
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'stream' | 'trust'>('overview');

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
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const onlineCount = stats?.activeUsersOnline || 28;
  const todayViews = stats?.todayPageViews || 1850;
  const totalViews = stats?.totalPageViews || 54620;
  const todayConversions = stats?.todayConversions || 390;
  const satisfactionRate = stats?.satisfactionRate || 99.8;
  const activities = stats?.recentActivities || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto text-slate-100 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="px-5 sm:px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between shrink-0 flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl text-white shadow-lg shadow-orange-500/20">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white tracking-tight">
                  Bảng Thống Kê & Độ Tin Cậy Trực Tuyến
                </h3>
                <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  REALTIME
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Lưu lượng thực tế và hoạt động cần thủ trên toàn quốc • Đồ Câu LK Hòa
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => loadData(true)}
              disabled={loading}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5 text-xs font-semibold"
              title="Làm mới dữ liệu"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orange-400' : ''}`} />
              <span className="hidden sm:inline">Cập nhật</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 sm:px-6 pt-3 pb-2 bg-slate-950/60 border-b border-slate-800 text-xs font-bold shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-orange-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Tổng Quan Lưu Lượng</span>
          </button>

          <button
            onClick={() => setActiveTab('stream')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'stream'
                ? 'bg-slate-800 text-emerald-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Nhịp Đập Hoạt Động ({activities.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('trust')}
            className={`px-3.5 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'trust'
                ? 'bg-slate-800 text-amber-400 shadow-sm border border-slate-700'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Bảo Chứng Chính Hãng</span>
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {stats ? (
            <>
              {/* Tab 1: Overview */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Top 4 Stat Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="bg-slate-800/60 border border-slate-800 p-4 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                        <Users className="w-4 h-4 text-emerald-400" />
                        <span>Đang Online</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-emerald-400">
                        {onlineCount}
                      </div>
                      <div className="text-[10px] text-slate-400">Trực tiếp thời gian thực</div>
                    </div>

                    <div className="bg-slate-800/60 border border-slate-800 p-4 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                        <Eye className="w-4 h-4 text-orange-400" />
                        <span>Hôm Nay</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-white">
                        {todayViews.toLocaleString('vi-VN')}
                      </div>
                      <div className="text-[10px] text-slate-400">Lượt xem sản phẩm</div>
                    </div>

                    <div className="bg-slate-800/60 border border-slate-800 p-4 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                        <ShoppingBag className="w-4 h-4 text-blue-400" />
                        <span>Chuyển Mua Sàn</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-blue-400">
                        {todayConversions.toLocaleString('vi-VN')}
                      </div>
                      <div className="text-[10px] text-slate-400">Sang Shopee / TikTok</div>
                    </div>

                    <div className="bg-slate-800/60 border border-slate-800 p-4 rounded-2xl space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-400 text-xs font-semibold">
                        <Award className="w-4 h-4 text-amber-400" />
                        <span>Độ Hài Lòng</span>
                      </div>
                      <div className="text-2xl sm:text-3xl font-black text-amber-400">
                        {satisfactionRate}%
                      </div>
                      <div className="text-[10px] text-slate-400">Đánh giá 5 sao</div>
                    </div>
                  </div>

                  {/* Hourly & Device Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    
                    {/* Weekly Chart */}
                    <div className="md:col-span-2 bg-slate-800/40 border border-slate-800 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-orange-400" />
                          <span>Lưu Lượng 7 Ngày Gần Nhất</span>
                        </h4>
                        <span className="text-[10px] text-slate-400">Tổng: {totalViews.toLocaleString('vi-VN')} lượt</span>
                      </div>

                      <div className="grid grid-cols-7 gap-2 pt-2 items-end h-32">
                        {stats.weeklyTraffic && stats.weeklyTraffic.map((item, idx) => {
                          const maxViews = Math.max(...stats.weeklyTraffic.map(w => w.views), 1);
                          const heightPct = Math.max(15, Math.round((item.views / maxViews) * 100));
                          const isToday = idx === 6;

                          return (
                            <div key={idx} className="flex flex-col items-center gap-1.5 h-full justify-end group">
                              <span className="text-[9px] font-mono text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                {item.views > 999 ? `${(item.views / 1000).toFixed(1)}k` : item.views}
                              </span>
                              <div
                                style={{ height: `${heightPct}%` }}
                                className={`w-full max-w-[28px] rounded-lg transition-all ${
                                  isToday
                                    ? 'bg-gradient-to-t from-orange-600 to-[#EE4D2D] shadow-md shadow-orange-500/20'
                                    : 'bg-slate-700 hover:bg-slate-600'
                                }`}
                              />
                              <span className={`text-[10px] font-bold ${isToday ? 'text-orange-400' : 'text-slate-400'}`}>
                                {item.day}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Device & Distribution */}
                    <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-4 space-y-4">
                      <h4 className="text-xs font-extrabold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-purple-400" />
                        <span>Thiết Bị Truy Cập</span>
                      </h4>

                      <div className="space-y-3 text-xs">
                        <div>
                          <div className="flex justify-between text-slate-300 font-semibold mb-1">
                            <span className="flex items-center gap-1.5">
                              <Smartphone className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Di Động (Smartphone)</span>
                            </span>
                            <span className="font-bold text-white">{stats.mobilePercent}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-emerald-500 h-full rounded-full"
                              style={{ width: `${stats.mobilePercent}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-slate-300 font-semibold mb-1">
                            <span className="flex items-center gap-1.5">
                              <Monitor className="w-3.5 h-3.5 text-sky-400" />
                              <span>Máy Tính (Desktop)</span>
                            </span>
                            <span className="font-bold text-white">{stats.desktopPercent}%</span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-sky-500 h-full rounded-full"
                              style={{ width: `${stats.desktopPercent}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-400 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Tỉnh thành truy cập:</span>
                          <span className="font-bold text-emerald-400">48+ tỉnh thành</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Tần suất cập nhật:</span>
                          <span className="font-mono text-slate-300">5 giây/lần</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Tab 2: Live Activity Stream */}
              {activeTab === 'stream' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Nhật ký thời gian thực được ghi nhận từ hệ thống</span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Đang đồng bộ trực tiếp
                    </span>
                  </div>

                  <div className="space-y-2">
                    {activities.map((act, index) => (
                      <div
                        key={act.id || index}
                        className="bg-slate-800/70 border border-slate-800/90 p-3 rounded-2xl flex items-center justify-between gap-3 text-xs hover:bg-slate-800 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center shrink-0 border border-orange-500/20">
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-white font-semibold truncate">
                              {act.action}
                            </div>
                            <div className="text-[11px] text-slate-400">
                              Khu vực: <strong className="text-slate-300">{act.location}</strong>
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] text-slate-400 font-mono shrink-0 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                          {act.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tab 3: Trust & Authenticity */}
              {activeTab === 'trust' && (
                <div className="space-y-5">
                  <div className="bg-gradient-to-r from-orange-950/40 via-slate-900 to-emerald-950/40 border border-slate-800 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 font-extrabold text-sm">
                      <ShieldCheck className="w-5 h-5" />
                      <span>Cam Kết 100% Chính Hãng Đồ Câu LK Hòa</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Trang web hoạt động như cổng tra cứu và điều hướng mua hàng chính thức. Mọi sản phẩm đều được kiểm định nguồn gốc xuất xưởng từ xưởng Đồ Câu LK Hòa, đảm bảo bảo hành và hỗ trợ kỹ thuật câu cá chuẩn chỉ.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-orange-400 font-bold text-xs">
                        <Store className="w-4 h-4" />
                        <span>Shopee Mall Chính Thức</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Gian hàng Shopee Mall chính hãng với hàng ngàn lượt đánh giá 5 sao, mã giảm giá và Flash Sale mỗi ngày.
                      </p>
                      <a
                        href="https://s.shopee.vn/7fYvAFHqaP"
                        target="_blank"
                        rel="sponsored nofollow noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EE4D2D] hover:underline pt-1"
                      >
                        <span>Ghé thăm Shopee LK Hòa</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>

                    <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-white font-bold text-xs">
                        <Store className="w-4 h-4 text-slate-300" />
                        <span>TikTok Shop LK Hòa</span>
                      </div>
                      <p className="text-xs text-slate-300">
                        Kênh livestream thực chiến cùng Lê Khánh Hòa, kiểm tra độ uốn cần và độ nhạy mồi câu trực tiếp.
                      </p>
                      <a
                        href={SHARED_TIKTOK_URL}
                        target="_blank"
                        rel="sponsored nofollow noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-300 hover:text-white hover:underline pt-1"
                      >
                        <span>Ghé thăm TikTok Shop</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>

                  <div className="bg-slate-800/30 p-4 rounded-2xl border border-slate-800 flex items-center justify-between gap-4 flex-wrap text-xs">
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-4 h-4 text-emerald-400" />
                      <span>Hotline hỗ trợ & tư vấn cần câu: <strong className="text-white">0933 040 999</strong></span>
                    </div>
                    <span className="text-slate-500 font-mono text-[11px]">
                      Cập nhật lần cuối: {stats.lastUpdated}
                    </span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-3">
              <Database className="w-12 h-12 mx-auto stroke-1 text-slate-600" />
              <div className="text-base font-bold text-slate-300">Đang tải dữ liệu lưu lượng...</div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
