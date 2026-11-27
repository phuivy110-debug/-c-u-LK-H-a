import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Copy,
  Download,
  Lock,
  LogOut,
  Package,
  PlugZap,
  RefreshCw,
  Search,
  Send,
  Settings2,
  ShieldCheck,
  Store,
  Trash2,
  Truck,
  Webhook,
  XCircle,
} from 'lucide-react';
import type {
  ConnectorProviderId,
  ConnectorSummary,
  OrderRecord,
  OrderStatus,
  ShippingCarrierId,
} from '../types';
import { formatPrice } from '../utils/catalog';
import { loadLocalOrders, updateLocalOrder } from '../utils/cartStore';
import { OrderSummaryDashboard } from './OrderSummaryDashboard';

const LOCAL_BROWSER_MODE_TOKEN = '__local_browser_mode__';

const DEFAULT_CONNECTOR_SUMMARIES: ConnectorSummary[] = [
  { provider: 'pancake', name: 'Pancake POS', connected: false, source: 'none', autoSync: true },
  { provider: 'ghn', name: 'Giao Hàng Nhanh (GHN)', connected: false, source: 'none', autoSync: false },
  { provider: 'ghtk', name: 'Giao Hàng Tiết Kiệm (GHTK)', connected: false, source: 'none', autoSync: false },
  { provider: 'viettelpost', name: 'Viettel Post (VTP)', connected: false, source: 'none', autoSync: false },
  { provider: 'webhook', name: 'Webhook POS Mở Rộng (Sapo / KiotViet / n8n)', connected: false, source: 'none', autoSync: true },
  { provider: 'telegram', name: 'Telegram báo đơn mới', connected: false, source: 'none', autoSync: true },
];

interface OrderManagementPageProps {
  onNavigate: (path: string) => void;
}

interface AdminStatusResponse {
  hasConfiguredPasscode: boolean;
  usingEnvPasscode: boolean;
  authenticated: boolean;
}

const STATUS_LABELS: Record<OrderStatus, { label: string; badgeClass: string }> = {
  pending: { label: 'Chờ xác nhận', badgeClass: 'bg-amber-500/20 text-[#FACC15] border-amber-500/40' },
  confirmed: { label: 'Đã xác nhận', badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  packing: { label: 'Đang đóng ống PVC', badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  shipping: { label: 'Đang giao hàng', badgeClass: 'bg-orange-500/20 text-[#F97316] border-orange-500/40' },
  delivered: { label: 'Giao thành công', badgeClass: 'bg-emerald-600/30 text-emerald-200 border-emerald-500/60' },
  cancelled: { label: 'Đã hủy', badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
};

const CARRIER_NAMES: Record<ShippingCarrierId, string> = {
  ghn: 'Giao Hàng Nhanh (GHN)',
  ghtk: 'Giao Hàng Tiết Kiệm (GHTK)',
  viettelpost: 'Viettel Post',
  manual: 'Tự giao / Bưu cục',
};

const CONNECTOR_META: Record<
  ConnectorProviderId,
  {
    badge: string;
    subtitle: string;
    guide: string;
    envHint: string;
    needsShopId?: boolean;
    needsWarehouseId?: boolean;
    needsWebhookUrl?: boolean;
    needsChatId?: boolean;
    supportsAutoSync?: boolean;
    tokenLabel: string;
    tokenPlaceholder: string;
  }
> = {
  pancake: {
    badge: 'Phần mềm bán hàng POS',
    subtitle: 'Đồng bộ đơn hàng trực tiếp về Pancake POS (pos.pages.fm) & trừ tồn kho tự động.',
    guide: 'Lấy API Key và Shop ID tại Pancake POS → Cấu hình → Tích hợp API.',
    envHint: 'PANCAKE_API_KEY, PANCAKE_SHOP_ID',
    needsShopId: true,
    needsWarehouseId: true,
    supportsAutoSync: true,
    tokenLabel: 'Pancake API Key',
    tokenPlaceholder: 'Dán API Key từ pos.pages.fm...',
  },
  ghn: {
    badge: 'Đơn vị vận chuyển',
    subtitle: 'Đẩy vận đơn 1 chạm sang Giao Hàng Nhanh kèm tiền thu hộ COD & ống nhựa PVC.',
    guide: 'Lấy Token API và Shop ID tại khachhang.ghn.vn → Quản lý cửa hàng.',
    envHint: 'GHN_TOKEN, GHN_SHOP_ID',
    needsShopId: true,
    tokenLabel: 'GHN Token API',
    tokenPlaceholder: 'Dán GHN Token...',
  },
  ghtk: {
    badge: 'Đơn vị vận chuyển',
    subtitle: 'Tạo đơn Giao Hàng Tiết Kiệm đường bộ / đường bay trực tiếp từ Admin.',
    guide: 'Lấy API Token tại khachhang.giaohangtietkiem.vn → Thông tin shop.',
    envHint: 'GHTK_TOKEN',
    tokenLabel: 'GHTK API Token',
    tokenPlaceholder: 'Dán GHTK Token...',
  },
  viettelpost: {
    badge: 'Đơn vị vận chuyển',
    subtitle: 'Kết nối tạo vận đơn Viettel Post toàn quốc phủ sóng tuyến huyện xã.',
    guide: 'Lấy Token đối tác từ tài khoản Viettel Post API (partner.viettelpost.vn).',
    envHint: 'VTP_TOKEN',
    tokenLabel: 'Viettel Post Token',
    tokenPlaceholder: 'Dán VTP Token...',
  },
  webhook: {
    badge: 'POS Mở rộng / Tự động hóa',
    subtitle: 'Bắn JSON đơn hàng mới sang Sapo, KiotViet, Haravan, n8n hoặc Make qua HTTPS.',
    guide: 'Nhập URL HTTPS Webhook công khai từ phần mềm POS hoặc luồng n8n/Make của bạn.',
    envHint: 'Cấu hình trực tiếp trong Admin',
    needsWebhookUrl: true,
    supportsAutoSync: true,
    tokenLabel: 'Header X-Webhook-Secret (tùy chọn)',
    tokenPlaceholder: 'Nhập mã bí mật xác thực chữ ký (nếu có)...',
  },
  telegram: {
    badge: 'Thông báo thời gian thực',
    subtitle: 'Nhận thông báo ngay trong Telegram mỗi khi website có đơn hàng mới.',
    guide: 'Tạo bot bằng @BotFather, lấy Bot Token. Sau đó nhắn /start cho bot và nhập Chat ID của tài khoản hoặc nhóm nhận thông báo.',
    envHint: 'TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID',
    needsChatId: true,
    supportsAutoSync: true,
    tokenLabel: 'Telegram Bot Token',
    tokenPlaceholder: '123456789:AA... (lấy từ @BotFather)',
  },
};

export const OrderManagementPage: React.FC<OrderManagementPageProps> = ({ onNavigate }) => {
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const isLocalBrowserMode = adminToken === LOCAL_BROWSER_MODE_TOKEN;

  const [adminStatus, setAdminStatus] = useState<AdminStatusResponse | null>(null);
  const [checkingStatus, setCheckingStatus] = useState<boolean>(true);
  const [statusError, setStatusError] = useState<string>('');
  const [passcodeInput, setPasscodeInput] = useState('');
  const [confirmPasscodeInput, setConfirmPasscodeInput] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<'orders' | 'shipping'>('orders');
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [connectors, setConnectors] = useState<ConnectorSummary[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Carrier Push Modal State
  const [pushOrderTarget, setPushOrderTarget] = useState<OrderRecord | null>(null);
  const [pushCarrier, setPushCarrier] = useState<'ghn' | 'ghtk' | 'viettelpost'>('ghn');
  const [pkgWeight, setPkgWeight] = useState(700);
  const [pkgLength, setPkgLength] = useState(120);
  const [pkgWidth, setPkgWidth] = useState(8);
  const [pkgHeight, setPkgHeight] = useState(8);
  const [pushing, setPushing] = useState(false);
  const [pushingPancakeCode, setPushingPancakeCode] = useState<string | null>(null);

  // Connector Configuration Modal State
  const [editingConnector, setEditingConnector] = useState<ConnectorProviderId | null>(null);
  const [cfgToken, setCfgToken] = useState('');
  const [cfgShopId, setCfgShopId] = useState('');
  const [cfgChatId, setCfgChatId] = useState('');
  const [cfgWarehouseId, setCfgWarehouseId] = useState('');
  const [cfgWebhookUrl, setCfgWebhookUrl] = useState('');
  const [cfgAutoSync, setCfgAutoSync] = useState(true);
  const [savingConnector, setSavingConnector] = useState(false);
  const [testingProvider, setTestingProvider] = useState<ConnectorProviderId | null>(null);

  // Manual Tracking Code Edits
  const [trackingDrafts, setTrackingDrafts] = useState<Record<string, string>>({});
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const loadAdminStatus = useCallback(async () => {
    setCheckingStatus(true);
    setStatusError('');
    try {
      const res = await fetch('/api/admin/status', { cache: 'no-store' });
      const raw = await res.text();
      let data: AdminStatusResponse | null = null;
      try {
        data = JSON.parse(raw);
      } catch {
        data = null;
      }
      if (res.ok && data && typeof data.hasConfiguredPasscode === 'boolean') {
        setAdminStatus(data);
      } else {
        setAdminStatus(null);
        setStatusError(
          `Máy chủ API chưa phản hồi hợp lệ (HTTP ${res.status}). Nếu đang chạy trên Vercel, hãy triển khai lại bản mới nhất có /api/index.`
        );
      }
    } catch {
      setAdminStatus(null);
      setStatusError('Không thể kết nối tới máy chủ API (/api/admin/status).');
    } finally {
      setCheckingStatus(false);
    }
  }, []);

  useEffect(() => {
    loadAdminStatus();
  }, [loadAdminStatus]);

  const parseSafeJson = useCallback(async (res: Response) => {
    const raw = await res.text();
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }, []);

  const fetchDashboardData = useCallback(async (token: string) => {
    if (token === LOCAL_BROWSER_MODE_TOKEN) {
      setOrders(loadLocalOrders());
      setConnectors(DEFAULT_CONNECTOR_SUMMARIES);
      setLoadingOrders(false);
      return;
    }
    setLoadingOrders(true);
    try {
      const [ordersRes, connRes] = await Promise.all([
        fetch('/api/orders', { headers: { Authorization: `Bearer ${token}` } }),
        fetch('/api/connectors', { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      if (ordersRes.status === 401 || connRes.status === 401) {
        setAdminToken(null);
        setAuthError('Phiên đăng nhập quản trị đã hết hạn. Vui lòng đăng nhập lại.');
        return;
      }

      const ordersData = await parseSafeJson(ordersRes);
      const connData = await parseSafeJson(connRes);

      if (!ordersRes.ok || !ordersData) {
        setFeedback({
          type: 'error',
          text: ordersData?.error || `Không thể tải danh sách đơn hàng (HTTP ${ordersRes.status}).`,
        });
      } else {
        let serverOrders: OrderRecord[] = Array.isArray(ordersData.orders) ? ordersData.orders : [];
        const serverCodes = new Set(serverOrders.map((o) => o.orderCode));
        const unsyncedLocal = loadLocalOrders().filter((o) => !serverCodes.has(o.orderCode));
        if (unsyncedLocal.length > 0) {
          let syncedCount = 0;
          let failedCount = 0;
          let lastSyncError = '';
          for (const localOrder of unsyncedLocal) {
            try {
              const syncRes = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  ...localOrder,
                  idempotencyKey: localOrder.orderCode,
                }),
              });
              const syncData = await parseSafeJson(syncRes);
              if (syncRes.ok && syncData?.order) {
                if (!serverCodes.has(syncData.order.orderCode)) {
                  serverOrders = [syncData.order, ...serverOrders];
                  serverCodes.add(syncData.order.orderCode);
                }
                syncedCount += 1;
              } else {
                failedCount += 1;
                lastSyncError = syncData?.error || `HTTP ${syncRes.status}`;
              }
            } catch {
              failedCount += 1;
              lastSyncError = 'Không thể kết nối máy chủ (/api/orders)';
            }
          }
          if (failedCount > 0) {
            setFeedback({
              type: 'error',
              text:
                syncedCount > 0
                  ? `Đã đồng bộ ${syncedCount} đơn từ trình duyệt, nhưng còn ${failedCount} đơn chưa đồng bộ được (${lastSyncError}).`
                  : `Có ${failedCount} đơn lưu trên trình duyệt chưa đồng bộ được lên máy chủ (${lastSyncError}).`,
            });
          } else if (syncedCount > 0) {
            setFeedback({
              type: 'success',
              text: `Đã tự động đồng bộ ${syncedCount} đơn hàng lưu trên trình duyệt lên máy chủ.`,
            });
          }
        }
        setOrders(serverOrders);
      }

      if (!connRes.ok || !connData) {
        setFeedback((prev) =>
          prev || {
            type: 'error',
            text: connData?.error || `Không thể tải cấu hình cổng kết nối (HTTP ${connRes.status}).`,
          }
        );
      } else {
        setConnectors(Array.isArray(connData.connectors) ? connData.connectors : []);
      }
    } catch {
      setFeedback({ type: 'error', text: 'Không thể tải dữ liệu quản trị từ máy chủ.' });
    } finally {
      setLoadingOrders(false);
    }
  }, [parseSafeJson]);

  useEffect(() => {
    if (adminToken) {
      fetchDashboardData(adminToken);
    }
  }, [adminToken, fetchDashboardData]);

  const handleClaimAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    if (passcodeInput.trim().length < 6) {
      setAuthError('Mật khẩu quản trị phải có ít nhất 6 ký tự.');
      return;
    }
    if (passcodeInput.trim() !== confirmPasscodeInput.trim()) {
      setAuthError('Mật khẩu nhập lại không khớp.');
      return;
    }
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/claim', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput.trim() }),
      });
      const data = await parseSafeJson(res);
      if (!res.ok || !data?.token) {
        setAuthError(
          data?.error ||
            `Máy chủ chưa thiết lập được mật khẩu (HTTP ${res.status}). Hãy cài ADMIN_PASSCODE trong Vercel Environment Variables.`
        );
        return;
      }
      setAdminToken(data.token);
      setPasscodeInput('');
      setConfirmPasscodeInput('');
    } catch {
      setAuthError('Không thể kết nối máy chủ (/api/admin/claim).');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ passcode: passcodeInput.trim() }),
      });
      const data = await parseSafeJson(res);
      if (!res.ok || !data?.token) {
        setAuthError(
          data?.error ||
            `Máy chủ không phản hồi JSON hợp lệ (HTTP ${res.status}). Vui lòng kiểm tra /api/index trên Vercel.`
        );
        return;
      }
      setAdminToken(data.token);
      setPasscodeInput('');
    } catch {
      setAuthError('Không thể kết nối máy chủ (/api/admin/login).');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleUpdateOrder = async (
    orderCode: string,
    patch: { status?: OrderStatus; shippingCarrier?: ShippingCarrierId; trackingCode?: string }
  ) => {
    if (!adminToken) return;
    setFeedback(null);
    if (isLocalBrowserMode) {
      const updated = updateLocalOrder(orderCode, patch);
      if (!updated) {
        setFeedback({ type: 'error', text: 'Không tìm thấy đơn hàng trong bộ nhớ trình duyệt.' });
        return;
      }
      setOrders((prev) => prev.map((o) => (o.orderCode === orderCode ? updated : o)));
      setFeedback({ type: 'success', text: `Đã cập nhật đơn #${orderCode} trên trình duyệt.` });
      return;
    }
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderCode)}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify(patch),
      });
      const data = await parseSafeJson(res);
      if (!res.ok || !data?.order) {
        setFeedback({ type: 'error', text: data?.error || `Cập nhật đơn hàng thất bại (HTTP ${res.status}).` });
        return;
      }
      setOrders((prev) => prev.map((o) => (o.orderCode === orderCode ? data.order : o)));
      setFeedback({ type: 'success', text: `Đã cập nhật đơn #${orderCode}.` });
    } catch {
      setFeedback({ type: 'error', text: 'Lỗi kết nối khi cập nhật đơn hàng.' });
    }
  };

  const handlePushToCarrier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !pushOrderTarget) return;
    if (isLocalBrowserMode) {
      setFeedback({
        type: 'error',
        text: 'Đang ở chế độ trình duyệt (không kết nối máy chủ). Hãy bấm "Xuất CSV Đẩy Đơn Hàng Loạt" để tải lên GHN/GHTK/Viettel Post hoặc đăng nhập trên máy chủ AI Studio.',
      });
      setPushOrderTarget(null);
      return;
    }
    setPushing(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/shipping/push-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          orderCode: pushOrderTarget.orderCode,
          carrier: pushCarrier,
          weightGrams: pkgWeight,
          lengthCm: pkgLength,
          widthCm: pkgWidth,
          heightCm: pkgHeight,
        }),
      });
      const data = await parseSafeJson(res);
      if (!res.ok || !data?.order) {
        setFeedback({
          type: 'error',
          text: data?.error || `Không thể đẩy đơn sang đơn vị vận chuyển (HTTP ${res.status}).`,
        });
        return;
      }
      setOrders((prev) =>
        prev.map((o) => (o.orderCode === pushOrderTarget.orderCode ? data.order : o))
      );
      setFeedback({
        type: 'success',
        text: `Đã tạo vận đơn ${CARRIER_NAMES[pushCarrier]} thành công! Mã vận đơn: ${data.trackingCode}`,
      });
      setPushOrderTarget(null);
    } catch {
      setFeedback({ type: 'error', text: 'Lỗi kết nối khi gọi API đơn vị vận chuyển.' });
    } finally {
      setPushing(false);
    }
  };

  const handlePushToPancake = async (orderCode: string) => {
    if (!adminToken) return;
    if (isLocalBrowserMode) {
      setFeedback({
        type: 'error',
        text: 'Đang ở chế độ trình duyệt. Hãy bấm "Xuất CSV Đẩy Đơn Hàng Loạt" để nhập nhanh vào Pancake POS hoặc mở trang quản trị trên máy chủ AI Studio.',
      });
      return;
    }
    setPushingPancakeCode(orderCode);
    setFeedback(null);
    try {
      const res = await fetch('/api/pos/pancake/push-order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ orderCode }),
      });
      const data = await parseSafeJson(res);
      if (data?.order) {
        setOrders((prev) => prev.map((o) => (o.orderCode === orderCode ? data.order : o)));
      }
      if (!res.ok || !data?.pancakeOrderId) {
        setFeedback({
          type: 'error',
          text: data?.error || `Không thể đẩy đơn sang Pancake POS (HTTP ${res.status}).`,
        });
        return;
      }
      setFeedback({
        type: 'success',
        text: `Đã đồng bộ đơn #${orderCode} sang Pancake POS! Mã Pancake: ${data.pancakeOrderId}`,
      });
    } catch {
      setFeedback({ type: 'error', text: 'Lỗi kết nối khi đẩy đơn sang Pancake POS.' });
    } finally {
      setPushingPancakeCode(null);
    }
  };

  const openConnectorConfig = (conn: ConnectorSummary) => {
    if (isLocalBrowserMode) {
      setFeedback({
        type: 'error',
        text: 'Lưu API Key bảo mật cần kết nối máy chủ. Hiện bạn vẫn có thể xuất CSV đơn hàng để nhập sang POS/Ship.',
      });
      return;
    }
    setEditingConnector(conn.provider);
    setCfgToken('');
    setCfgShopId(conn.shopId || '');
    setCfgChatId(conn.chatId || '');
    setCfgWarehouseId(conn.warehouseId || '');
    setCfgWebhookUrl(conn.webhookUrl || '');
    setCfgAutoSync(conn.autoSync ?? true);
  };

  const handleSaveConnector = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminToken || !editingConnector || isLocalBrowserMode) return;
    setSavingConnector(true);
    setFeedback(null);
    try {
      const res = await fetch(`/api/connectors/${editingConnector}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({
          token: cfgToken.trim() || undefined,
          shopId: cfgShopId.trim(),
          warehouseId: cfgWarehouseId.trim(),
          chatId: cfgChatId.trim(),
          webhookUrl: cfgWebhookUrl.trim(),
          autoSync: cfgAutoSync,
        }),
      });
      const data = await parseSafeJson(res);
      if (!res.ok || !data?.connector) {
        setFeedback({
          type: 'error',
          text: data?.error || `Không thể lưu cấu hình cổng kết nối (HTTP ${res.status}).`,
        });
        return;
      }
      setConnectors((prev) =>
        prev.map((c) => (c.provider === editingConnector ? data.connector : c))
      );
      setFeedback({ type: 'success', text: data.message || 'Đã lưu cấu hình kết nối thành công.' });
      setEditingConnector(null);
      setCfgToken('');
    } catch {
      setFeedback({ type: 'error', text: 'Lỗi kết nối khi lưu cổng kết nối.' });
    } finally {
      setSavingConnector(false);
    }
  };

  const handleTestConnector = async (provider: ConnectorProviderId) => {
    if (!adminToken || isLocalBrowserMode) return;
    setTestingProvider(provider);
    setFeedback(null);
    try {
      const res = await fetch(`/api/connectors/${provider}/test`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await parseSafeJson(res);
      if (data?.connector) {
        setConnectors((prev) => prev.map((c) => (c.provider === provider ? data.connector : c)));
      }
      setFeedback({
        type: res.ok && data?.success ? 'success' : 'error',
        text: data?.message || data?.error || `Kiểm tra kết nối thất bại (HTTP ${res.status}).`,
      });
    } catch {
      setFeedback({ type: 'error', text: 'Lỗi mạng khi kiểm tra kết nối.' });
    } finally {
      setTestingProvider(null);
    }
  };

  const handleDisconnectConnector = async (provider: ConnectorProviderId) => {
    if (!adminToken || isLocalBrowserMode) return;
    setFeedback(null);
    try {
      const res = await fetch(`/api/connectors/${provider}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await parseSafeJson(res);
      if (res.ok && data?.connector) {
        setConnectors((prev) => prev.map((c) => (c.provider === provider ? data.connector : c)));
        setFeedback({ type: 'success', text: `Đã ngắt kết nối ${data.connector.name}.` });
      } else {
        setFeedback({ type: 'error', text: data?.error || `Không thể ngắt kết nối (HTTP ${res.status}).` });
      }
    } catch {
      setFeedback({ type: 'error', text: 'Không thể ngắt kết nối.' });
    }
  };

  const handleExportCsv = () => {
    const header = [
      'MaDonHang',
      'NgayDat',
      'TrangThai',
      'TenNguoiNhan',
      'SoDienThoai',
      'DiaChi',
      'PhuongXa',
      'QuanHuyen',
      'TinhThanh',
      'SanPham',
      'HinhThucThanhToan',
      'TienThuHoCOD',
      'PhiShip',
      'GhiChu',
      'DonViVanChuyen',
      'MaVanDon',
      'MaPancakePOS',
    ];
    const escapeCsv = (val: unknown) => {
      const str = String(val ?? '').replace(/"/g, '""');
      return `"${str}"`;
    };
    const rows = filteredOrders.map((o) => [
      o.orderCode,
      o.createdAt,
      STATUS_LABELS[o.status]?.label || o.status,
      o.customer.fullName,
      o.customer.phone,
      o.customer.address,
      o.customer.ward,
      o.customer.district,
      o.customer.province,
      o.items.map((i) => `${i.name} (${i.variantLabel}) x${i.quantity}`).join(' | '),
      o.paymentMethod === 'cod' ? 'COD' : 'VietQR',
      o.paymentMethod === 'cod' ? o.total : 0,
      o.shippingFee,
      o.customer.note || '',
      o.shippingCarrier || '',
      o.trackingCode || '',
      o.pancakeOrderId || '',
    ]);
    const csv = '\uFEFF' + [header, ...rows].map((r) => r.map(escapeCsv).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `don-hang-lk-hoa-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (key: string, value: string) => {
    navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const filteredOrders = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return orders.filter((o) => {
      const matchStatus = statusFilter === 'all' || o.status === statusFilter;
      const matchQuery =
        !q ||
        o.orderCode.toLowerCase().includes(q) ||
        o.customer.fullName.toLowerCase().includes(q) ||
        o.customer.phone.includes(q) ||
        (o.trackingCode || '').toLowerCase().includes(q) ||
        (o.pancakeOrderId || '').toLowerCase().includes(q);
      return matchStatus && matchQuery;
    });
  }, [orders, searchQuery, statusFilter]);

  const connectedCount = useMemo(
    () => connectors.filter((c) => c.connected).length,
    [connectors]
  );

  const originBase = typeof window !== 'undefined' ? window.location.origin : 'https://docaulkhoa.vn';

  // AUTHENTICATION / FIRST-RUN ADMIN GATE
  if (!adminToken) {
    const isClaimMode = Boolean(adminStatus && !adminStatus.hasConfiguredPasscode && !adminStatus.usingEnvPasscode);
    return (
      <div className="max-w-md mx-auto px-4 py-12 space-y-6">
        <button
          type="button"
          onClick={() => onNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#FACC15] cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Quay lại trang chủ</span>
        </button>

        <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-[#14532D] border border-emerald-700/60 text-[#FACC15] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h1 className="font-display text-xl font-black text-white">
                {checkingStatus
                  ? 'Đang Kiểm Tra Cổng Quản Trị...'
                  : statusError
                    ? 'Cổng Quản Trị Chưa Kết Nối API'
                    : isClaimMode
                      ? 'Thiết Lập Quản Trị Đơn Hàng'
                      : 'Đăng Nhập Quản Lý Đơn Hàng'}
              </h1>
              <p className="text-xs text-slate-400">
                Quản lý đơn COD/VietQR &amp; kết nối Pancake POS, GHN, GHTK, Viettel Post
              </p>
            </div>
          </div>

          {checkingStatus ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Đang kiểm tra trạng thái mật khẩu quản trị từ máy chủ...
            </div>
          ) : statusError ? (
            <div className="space-y-3">
              <div className="rounded-xl border border-orange-700/60 bg-orange-950/30 p-3.5 text-xs text-orange-200 leading-relaxed space-y-2">
                <p className="font-bold text-[#F97316]">Chưa kết nối được máy chủ đơn hàng trực tuyến</p>
                <p>
                  Bạn vẫn có thể bấm nút màu vàng bên dưới để mở ngay trang quản lý đơn hàng lưu trên trình duyệt này (xem thống kê, cập nhật trạng thái và xuất CSV) mà không cần cấu hình Vercel.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAdminToken(LOCAL_BROWSER_MODE_TOKEN)}
                className="w-full min-h-11 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] text-sm font-black cursor-pointer"
              >
                Mở Quản Lý Ngay (Không cần máy chủ)
              </button>
              <button
                type="button"
                onClick={loadAdminStatus}
                className="w-full min-h-10 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-300 cursor-pointer"
              >
                Thử kết nối lại máy chủ
              </button>
            </div>
          ) : isClaimMode ? (
            <form onSubmit={handleClaimAdmin} className="space-y-4">
              <div className="rounded-xl border border-emerald-800/60 bg-[#14532D]/20 p-3 text-xs text-emerald-200 leading-relaxed">
                Lần đầu truy cập: tự đặt mật khẩu mới (tối thiểu 6 ký tự) để mở trang quản lý đơn hàng ngay lập tức.
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Mật khẩu quản trị mới</label>
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white focus:border-[#FACC15] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Nhập lại mật khẩu</label>
                <input
                  type="password"
                  value={confirmPasscodeInput}
                  onChange={(e) => setConfirmPasscodeInput(e.target.value)}
                  placeholder="Xác nhận mật khẩu"
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white focus:border-[#FACC15] focus:outline-none"
                />
              </div>
              {authError && <p className="text-xs font-semibold text-[#F97316]">{authError}</p>}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full min-h-11 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] text-sm font-black cursor-pointer disabled:opacity-60"
              >
                {authLoading ? 'Đang thiết lập...' : 'Tạo mật khẩu & Mở quản lý đơn'}
              </button>
              <button
                type="button"
                onClick={() => setAdminToken(LOCAL_BROWSER_MODE_TOKEN)}
                className="w-full min-h-10 rounded-xl border border-slate-800 hover:bg-slate-800/70 text-xs font-semibold text-slate-400 cursor-pointer"
              >
                Hoặc mở nhanh đơn lưu trên trình duyệt
              </button>
            </form>
          ) : (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-3 text-[11px] text-slate-400 leading-relaxed">
                Nhập mật khẩu quản trị bạn đã tạo trước đó. Không cần cài đặt thêm trên Vercel.
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Mật khẩu quản trị</label>
                <input
                  type="password"
                  value={passcodeInput}
                  onChange={(e) => setPasscodeInput(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị..."
                  className="w-full h-11 px-3.5 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white focus:border-[#FACC15] focus:outline-none"
                />
              </div>
              {authError && <p className="text-xs font-semibold text-[#F97316]">{authError}</p>}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full min-h-11 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] text-sm font-black cursor-pointer disabled:opacity-60"
              >
                {authLoading ? 'Đang xác thực...' : 'Đăng nhập'}
              </button>
              <button
                type="button"
                onClick={() => setAdminToken(LOCAL_BROWSER_MODE_TOKEN)}
                className="w-full min-h-10 rounded-xl border border-slate-800 hover:bg-slate-800/70 text-xs font-semibold text-slate-400 cursor-pointer"
              >
                Mở nhanh đơn lưu trên trình duyệt (Không cần mật khẩu)
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  const editingMeta = editingConnector ? CONNECTOR_META[editingConnector] : null;
  const editingSummary = editingConnector
    ? connectors.find((c) => c.provider === editingConnector) || null
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-[#FACC15] mb-1.5 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Về cửa hàng</span>
          </button>
          <h1 className="font-display text-2xl sm:text-3xl font-black text-white">
            Quản Lý Đơn Hàng &amp; Cổng Kết Nối POS / Vận Chuyển
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Đồng bộ đơn hàng sang Pancake POS, đẩy vận đơn GHN / GHTK / Viettel Post hoặc Webhook POS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => fetchDashboardData(adminToken)}
            className="min-h-10 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loadingOrders ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </button>
          <button
            type="button"
            onClick={() => setAdminToken(null)}
            className="min-h-10 px-3.5 py-2 rounded-xl border border-slate-700 hover:bg-slate-800 text-xs font-bold text-slate-300 flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{isLocalBrowserMode ? 'Đổi sang máy chủ' : 'Đăng xuất'}</span>
          </button>
        </div>
      </div>

      {isLocalBrowserMode && (
        <div className="rounded-xl border border-amber-600/40 bg-amber-950/20 px-4 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-amber-200">
          <p className="leading-relaxed">
            Đang dùng <strong>Chế độ Trình Duyệt (Không cần cấu hình Vercel)</strong>: bạn có thể xem biểu đồ doanh thu, cập nhật trạng thái đơn, lưu mã vận đơn và xuất file CSV để tải lên GHTK / GHN / Viettel Post / Pancake POS.
          </p>
          <button
            type="button"
            onClick={() => {
              setAdminToken(null);
              loadAdminStatus();
            }}
            className="px-3 py-1.5 rounded-lg bg-[#FACC15] text-[#0F172A] font-extrabold whitespace-nowrap shrink-0 cursor-pointer"
          >
            Kết nối lại máy chủ
          </button>
        </div>
      )}

      {/* Summary Dashboard with Recharts */}
      <OrderSummaryDashboard
        orders={orders}
        connectors={connectors}
        loading={loadingOrders}
        activeStatusFilter={statusFilter}
        onSelectStatusFilter={(nextStatus) => {
          setStatusFilter(nextStatus);
          setActiveTab('orders');
        }}
        onRefresh={() => fetchDashboardData(adminToken)}
        onOpenConnectors={() => setActiveTab('shipping')}
      />

      {/* Navigation Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-800 pb-3">
        <button
          type="button"
          onClick={() => setActiveTab('orders')}
          className={`min-h-11 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer ${
            activeTab === 'orders'
              ? 'bg-[#FACC15] text-[#0F172A]'
              : 'bg-[#111827] text-slate-300 border border-slate-800 hover:border-slate-600'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Danh sách đơn hàng ({orders.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('shipping')}
          className={`min-h-11 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold flex items-center gap-2 cursor-pointer ${
            activeTab === 'shipping'
              ? 'bg-[#FACC15] text-[#0F172A]'
              : 'bg-[#111827] text-slate-300 border border-slate-800 hover:border-slate-600'
          }`}
        >
          <PlugZap className="w-4 h-4" />
          <span>Cổng Kết Nối POS &amp; Vận Chuyển ({connectedCount}/{connectors.length || 5})</span>
        </button>
      </div>

      {feedback && (
        <div
          className={`rounded-xl border px-4 py-3 text-xs sm:text-sm font-semibold ${
            feedback.type === 'success'
              ? 'border-emerald-700 bg-[#14532D]/40 text-emerald-200'
              : 'border-orange-700 bg-orange-950/50 text-orange-200'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {activeTab === 'orders' ? (
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#111827] p-4 rounded-2xl border border-slate-800">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm mã đơn, SĐT, mã vận đơn..."
                  className="w-full h-10 pl-9 pr-3 rounded-xl bg-[#0F172A] border border-slate-700 text-xs text-white focus:border-[#FACC15] focus:outline-none"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | OrderStatus)}
                aria-label="Lọc trạng thái đơn hàng"
                className="h-10 px-3 rounded-xl bg-[#0F172A] border border-slate-700 text-xs font-bold text-white focus:border-[#FACC15] focus:outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                {Object.entries(STATUS_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>
                    {v.label}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={handleExportCsv}
              disabled={filteredOrders.length === 0}
              className="min-h-10 px-4 py-2 rounded-xl bg-[#14532D] hover:bg-emerald-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-4 h-4" />
              <span>Xuất CSV Đẩy Đơn Hàng Loạt</span>
            </button>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-10 text-center space-y-2">
              <Package className="w-10 h-10 text-slate-500 mx-auto" />
              <p className="text-base font-bold text-white">Chưa có đơn hàng nào khớp bộ lọc</p>
              <p className="text-xs text-slate-400">
                Mọi đơn hàng khách đặt qua trang Thanh toán (COD / VietQR) sẽ hiển thị tự động tại đây.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => {
                const statusInfo = STATUS_LABELS[order.status] || STATUS_LABELS.confirmed;
                const draftTracking = trackingDrafts[order.orderCode] ?? order.trackingCode ?? '';
                return (
                  <article
                    key={order.orderCode}
                    className="rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:p-5 space-y-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono-tabular text-sm sm:text-base font-black text-[#FACC15]">
                          #{order.orderCode}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-md border text-[11px] font-bold ${statusInfo.badgeClass}`}>
                          {statusInfo.label}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-200 text-[11px] font-bold">
                          {order.paymentMethod === 'cod' ? 'COD đồng kiểm' : 'VietQR'}
                        </span>
                        {order.channel === 'b2a-agent' && (
                          <span className="px-2 py-0.5 rounded-md bg-violet-950 border border-violet-700 text-violet-200 text-[11px] font-bold">
                            B2A Agent{order.agentName ? `: ${order.agentName}` : ''}
                          </span>
                        )}
                        {order.trackingCode && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950 border border-emerald-700 text-emerald-300 text-[11px] font-mono-tabular font-bold">
                            {order.shippingCarrier?.toUpperCase() || 'SHIP'}: {order.trackingCode}
                          </span>
                        )}
                        {order.pancakeOrderId && (
                          <span className="px-2 py-0.5 rounded-md bg-sky-950 border border-sky-700 text-sky-300 text-[11px] font-mono-tabular font-bold">
                            Pancake POS: #{order.pancakeOrderId}
                          </span>
                        )}
                        {order.webhookSyncedAt && !order.webhookSyncError && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-[11px] font-bold">
                            Webhook: Đã đồng bộ
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400 tabular-nums">
                        {new Date(order.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>

                    {(order.pancakeSyncError || order.webhookSyncError) && (
                      <div className="rounded-xl border border-orange-700/60 bg-orange-950/35 px-3 py-2 text-xs text-orange-200 space-y-1">
                        {order.pancakeSyncError && (
                          <p>
                            <strong className="text-[#F97316]">Lỗi đồng bộ Pancake POS:</strong> {order.pancakeSyncError}
                          </p>
                        )}
                        {order.webhookSyncError && (
                          <p>
                            <strong className="text-[#F97316]">Lỗi đồng bộ Webhook:</strong> {order.webhookSyncError}
                          </p>
                        )}
                      </div>
                    )}

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 text-xs sm:text-sm">
                      <div className="lg:col-span-5 space-y-1 text-slate-300">
                        <p className="font-bold text-white">
                          {order.customer.fullName} ·{' '}
                          <span className="font-mono-tabular text-[#FACC15]">{order.customer.phone}</span>
                        </p>
                        <p className="text-xs text-slate-400">
                          {order.customer.address}, {order.customer.ward}, {order.customer.district},{' '}
                          {order.customer.province}
                        </p>
                        {order.customer.note && (
                          <p className="text-xs text-amber-300">Ghi chú: {order.customer.note}</p>
                        )}
                      </div>

                      <div className="lg:col-span-4 space-y-1 text-xs">
                        {order.items.map((item) => (
                          <div key={item.key} className="flex justify-between gap-2 text-slate-300">
                            <span className="truncate">
                              {item.name} ({item.variantLabel}) x{item.quantity}
                            </span>
                            <span className="tabular-nums font-semibold shrink-0">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                        <div className="pt-1 border-t border-slate-800 flex justify-between font-black text-white">
                          <span>Tổng ({order.paymentMethod === 'cod' ? 'Thu hộ COD' : 'Đã CK/Chờ CK'}):</span>
                          <span className="text-[#FACC15] tabular-nums">{formatPrice(order.total)}</span>
                        </div>
                      </div>

                      {/* Order Actions */}
                      <div className="lg:col-span-3 flex flex-col gap-2">
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleUpdateOrder(order.orderCode, { status: e.target.value as OrderStatus })
                          }
                          aria-label={`Trạng thái đơn ${order.orderCode}`}
                          className="h-9 px-2.5 rounded-lg bg-[#0F172A] border border-slate-700 text-xs font-bold text-white"
                        >
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v.label}
                            </option>
                          ))}
                        </select>

                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={draftTracking}
                            onChange={(e) =>
                              setTrackingDrafts((d) => ({ ...d, [order.orderCode]: e.target.value }))
                            }
                            placeholder="Nhập mã vận đơn..."
                            className="flex-1 min-w-0 h-9 px-2.5 rounded-lg bg-[#0F172A] border border-slate-700 text-xs text-white font-mono-tabular"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateOrder(order.orderCode, {
                                trackingCode: draftTracking,
                                shippingCarrier: order.shippingCarrier || 'manual',
                              })
                            }
                            className="h-9 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white cursor-pointer"
                          >
                            Lưu
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPushOrderTarget(order)}
                            className="h-9 px-2.5 rounded-lg bg-[#F97316] hover:bg-orange-500 text-white text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3.5 h-3.5" />
                            <span>Đẩy Vận Chuyển</span>
                          </button>
                          <button
                            type="button"
                            disabled={pushingPancakeCode === order.orderCode}
                            onClick={() => handlePushToPancake(order.orderCode)}
                            className="h-9 px-2.5 rounded-lg bg-sky-700 hover:bg-sky-600 text-white text-[11px] font-black flex items-center justify-center gap-1 cursor-pointer disabled:opacity-60"
                          >
                            <Store className="w-3.5 h-3.5" />
                            <span>{pushingPancakeCode === order.orderCode ? 'Đang đẩy...' : 'Đẩy Pancake'}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        /* TAB 2: READY-TO-CONNECT POS & SHIPPING GATEWAYS */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-7 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-5 sm:p-6 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-display text-lg font-black text-white flex items-center gap-2">
                  <PlugZap className="w-5 h-5 text-[#FACC15]" />
                  <span>Cổng Kết Nối POS &amp; Vận Chuyển Cài Sẵn</span>
                </h2>
                <span className="text-[11px] font-bold text-emerald-300 bg-[#14532D]/40 border border-emerald-700/50 px-2.5 py-1 rounded-md">
                  Bảo mật máy chủ
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Chọn cổng bạn muốn dùng rồi bấm <strong className="text-white">Kết nối / Cấu hình</strong> để nhập API Key &amp; Shop ID ngay sau khi đăng nhập Admin. Token được mã hóa bảo mật trên máy chủ; nếu triển khai nhiều instance Serverless (Vercel), nên cài thêm trong{' '}
                <strong className="text-[#FACC15]">Settings → Secrets</strong>.
              </p>

              <div className="space-y-3">
                {connectors.map((conn) => {
                  const meta = CONNECTOR_META[conn.provider];
                  const isTesting = testingProvider === conn.provider;
                  return (
                    <div
                      key={conn.provider}
                      className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 space-y-3"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="space-y-1 max-w-md">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-bold text-white text-sm sm:text-base">{conn.name}</p>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                              {meta.badge}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 leading-relaxed">{meta.subtitle}</p>
                        </div>

                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold shrink-0 inline-flex items-center gap-1 ${
                            conn.connected
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-600/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {conn.connected ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>
                                {conn.source === 'env' ? 'Đã kết nối (Secrets)' : 'Đã kết nối (Admin)'}
                              </span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3.5 h-3.5" />
                              <span>Chưa kết nối</span>
                            </>
                          )}
                        </span>
                      </div>

                      {/* Connection Metadata Row */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400">
                        {conn.shopId && (
                          <span>
                            Shop ID: <strong className="text-slate-200 font-mono-tabular">{conn.shopId}</strong>
                          </span>
                        )}
                        {conn.maskedToken && (
                          <span>
                            Token: <strong className="text-slate-200 font-mono-tabular">{conn.maskedToken}</strong>
                          </span>
                        )}
                        {conn.webhookUrl && (
                          <span className="truncate max-w-xs">
                            URL: <strong className="text-slate-200 font-mono-tabular">{conn.webhookUrl}</strong>
                          </span>
                        )}
                        {meta.supportsAutoSync && conn.connected && (
                          <span className={conn.autoSync ? 'text-[#FACC15] font-bold' : ''}>
                            Tự động đẩy đơn mới: {conn.autoSync ? 'Đang BẬT' : 'Tắt (Đẩy thủ công)'}
                          </span>
                        )}
                      </div>

                      {conn.lastTestMessage && (
                        <p
                          className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-lg border ${
                            conn.lastTestOk
                              ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                              : 'bg-orange-950/40 border-orange-800/60 text-orange-300'
                          }`}
                        >
                          {conn.lastTestMessage}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => openConnectorConfig(conn)}
                          className="h-9 px-3 rounded-lg bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] text-xs font-black inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Settings2 className="w-3.5 h-3.5" />
                          <span>{conn.connected ? 'Cập nhật cấu hình' : 'Kết nối ngay'}</span>
                        </button>

                        {conn.connected && (
                          <>
                            <button
                              type="button"
                              disabled={isTesting}
                              onClick={() => handleTestConnector(conn.provider)}
                              className="h-9 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
                            >
                              <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                              <span>{isTesting ? 'Đang kiểm tra...' : 'Test kết nối'}</span>
                            </button>

                            {conn.source === 'admin-ui' && (
                              <button
                                type="button"
                                onClick={() => handleDisconnectConnector(conn.provider)}
                                className="h-9 px-3 rounded-lg border border-rose-800/70 hover:bg-rose-950/60 text-rose-300 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Ngắt kết nối</span>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-[#111827] p-6 space-y-4">
              <h2 className="font-display text-lg font-black text-white flex items-center gap-2">
                <Webhook className="w-5 h-5 text-emerald-400" />
                <span>Webhook Nhận Trạng Thái Từ Hãng Ship</span>
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Dán đường dẫn Webhook tương ứng vào trang quản trị GHN / GHTK / Viettel Post để hệ thống tự động chuyển đơn sang <strong>Đang giao</strong> hoặc <strong>Giao thành công</strong>.
              </p>

              {(['ghn', 'ghtk', 'viettelpost'] as const).map((carrier) => {
                const webhookUrl = `${originBase}/api/shipping/webhook/${carrier}`;
                return (
                  <div key={carrier} className="rounded-xl border border-slate-800 bg-[#0F172A] p-3 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#FACC15] uppercase">{carrier} Webhook URL</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(carrier, webhookUrl)}
                        className="inline-flex items-center gap-1 text-slate-300 hover:text-white cursor-pointer"
                      >
                        {copiedKey === carrier ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === carrier ? 'Đã sao chép' : 'Copy'}</span>
                      </button>
                    </div>
                    <p className="text-[11px] font-mono-tabular text-slate-400 break-all">{webhookUrl}</p>
                  </div>
                );
              })}

              <div className="rounded-xl border border-emerald-800/50 bg-[#14532D]/20 p-3 text-xs text-slate-200 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  API Key/Token nhập trong Admin được mã hóa AES-256-GCM trên máy chủ và không bao giờ trả ngược về trình duyệt. Nếu triển khai trên Vercel đa vùng, bạn nên khai báo thêm trong <strong>Settings → Secrets</strong>.
                </span>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-3 text-xs text-slate-300 flex items-start gap-2">
                <Truck className="w-4 h-4 text-[#F97316] shrink-0 mt-0.5" />
                <span>
                  Mẹo dùng ngay không cần API: Bấm <strong>Xuất CSV Đẩy Đơn Hàng Loạt</strong> ở tab Danh sách đơn hàng rồi nhập file lên Pancake POS, Sapo, GHN hoặc GHTK.
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configure Connector Modal */}
      {editingConnector && editingMeta && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#111827] p-6 space-y-4 shadow-2xl">
            <h2 className="font-display text-lg font-black text-white">
              Cấu Hình {editingSummary?.name || editingConnector.toUpperCase()}
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">{editingMeta.guide}</p>

            <form onSubmit={handleSaveConnector} className="space-y-3.5 text-xs">
              {editingMeta.needsWebhookUrl && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Webhook URL (Bắt buộc HTTPS)</label>
                  <input
                    type="url"
                    required
                    value={cfgWebhookUrl}
                    onChange={(e) => setCfgWebhookUrl(e.target.value)}
                    placeholder="https://hook.eu1.make.com/..."
                    className="w-full h-11 px-3 rounded-xl bg-[#0F172A] border border-slate-700 text-xs text-white focus:border-[#FACC15] focus:outline-none"
                  />
                </div>
              )}

              {editingMeta.needsShopId && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Shop ID</label>
                  <input
                    type="text"
                    required
                    value={cfgShopId}
                    onChange={(e) => setCfgShopId(e.target.value)}
                    placeholder="Ví dụ: 123456"
                    className="w-full h-11 px-3 rounded-xl bg-[#0F172A] border border-slate-700 text-xs text-white font-mono-tabular focus:border-[#FACC15] focus:outline-none"
                  />
                </div>
              )}

              {editingMeta.needsChatId && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Telegram Chat ID</label>
                  <input
                    type="text"
                    required
                    value={cfgChatId}
                    onChange={(e) => setCfgChatId(e.target.value)}
                    placeholder="Ví dụ: 123456789 hoặc -100... cho group"
                    className="w-full h-11 px-3 rounded-xl bg-[#0F172A] border border-slate-700 text-xs text-white font-mono-tabular focus:border-[#FACC15] focus:outline-none"
                  />
                </div>
              )}

              {editingMeta.needsWarehouseId && (
                <div>
                  <label className="block font-bold text-slate-300 mb-1.5">Warehouse ID (tùy chọn)</label>
                  <input
                    type="text"
                    value={cfgWarehouseId}
                    onChange={(e) => setCfgWarehouseId(e.target.value)}
                    placeholder="Để trống nếu dùng kho mặc định của Shop"
                    className="w-full h-11 px-3 rounded-xl bg-[#0F172A] border border-slate-700 text-xs text-white font-mono-tabular focus:border-[#FACC15] focus:outline-none"
                  />
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-300 mb-1.5">
                  {editingMeta.tokenLabel}
                  {editingSummary?.maskedToken && (
                    <span className="ml-2 text-emerald-400 font-normal">
                      (Hiện tại: {editingSummary.maskedToken})
                    </span>
                  )}
                </label>
                <input
                  type="password"
                  required={!editingSummary?.connected && !editingMeta.needsWebhookUrl}
                  value={cfgToken}
                  onChange={(e) => setCfgToken(e.target.value)}
                  placeholder={editingMeta.tokenPlaceholder}
                  className="w-full h-11 px-3 rounded-xl bg-[#0F172A] border border-slate-700 text-xs text-white font-mono-tabular focus:border-[#FACC15] focus:outline-none"
                />
              </div>

              {editingMeta.supportsAutoSync && (
                <label className="flex items-start gap-2.5 p-3 rounded-xl border border-slate-800 bg-[#0F172A] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={cfgAutoSync}
                    onChange={(e) => setCfgAutoSync(e.target.checked)}
                    className="mt-0.5 accent-[#FACC15]"
                  />
                  <span className="text-slate-200 leading-relaxed">
                    <strong>Tự động đồng bộ ngay khi có đơn mới</strong> (Khách vừa đặt COD/VietQR là tự bắn đơn về hệ thống ngay).
                  </span>
                </label>
              )}

              <p className="text-[11px] text-slate-400">
                Biến Secret tương ứng: <code className="text-[#FACC15]">{editingMeta.envHint}</code>
              </p>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditingConnector(null)}
                  className="flex-1 h-11 rounded-xl border border-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingConnector}
                  className="flex-1 h-11 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] font-black cursor-pointer disabled:opacity-60"
                >
                  {savingConnector ? 'Đang lưu...' : 'Lưu & Kết nối'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Push To Carrier Modal */}
      {pushOrderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-[#111827] p-6 space-y-4 shadow-2xl">
            <h2 className="font-display text-lg font-black text-white">
              Đẩy Đơn #{pushOrderTarget.orderCode} Sang Vận Chuyển
            </h2>
            <form onSubmit={handlePushToCarrier} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-300 mb-1.5">Chọn đơn vị vận chuyển</label>
                <select
                  value={pushCarrier}
                  onChange={(e) => setPushCarrier(e.target.value as 'ghn' | 'ghtk' | 'viettelpost')}
                  className="w-full h-11 px-3 rounded-xl bg-[#0F172A] border border-slate-700 text-sm text-white"
                >
                  <option value="ghn">Giao Hàng Nhanh (GHN)</option>
                  <option value="ghtk">Giao Hàng Tiết Kiệm (GHTK)</option>
                  <option value="viettelpost">Viettel Post (VTP)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Khối lượng (gram)</label>
                  <input
                    type="number"
                    min={100}
                    value={pkgWeight}
                    onChange={(e) => setPkgWeight(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Dài ống PVC (cm)</label>
                  <input
                    type="number"
                    min={10}
                    value={pkgLength}
                    onChange={(e) => setPkgLength(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Rộng (cm)</label>
                  <input
                    type="number"
                    min={5}
                    value={pkgWidth}
                    onChange={(e) => setPkgWidth(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white font-mono-tabular"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 mb-1">Cao (cm)</label>
                  <input
                    type="number"
                    min={5}
                    value={pkgHeight}
                    onChange={(e) => setPkgHeight(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-lg bg-[#0F172A] border border-slate-700 text-white font-mono-tabular"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-3 text-slate-300 space-y-1">
                <p>
                  Khách nhận: <strong className="text-white">{pushOrderTarget.customer.fullName}</strong> (
                  {pushOrderTarget.customer.phone})
                </p>
                <p>
                  Tiền thu hộ COD:{' '}
                  <strong className="text-[#FACC15]">
                    {pushOrderTarget.paymentMethod === 'cod'
                      ? formatPrice(pushOrderTarget.total)
                      : '0đ (Khách chuyển khoản VietQR)'}
                  </strong>
                </p>
              </div>

              <div className="flex gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setPushOrderTarget(null)}
                  className="flex-1 h-11 rounded-xl border border-slate-700 text-slate-300 font-bold cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={pushing}
                  className="flex-1 h-11 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] font-black cursor-pointer disabled:opacity-60"
                >
                  {pushing ? 'Đang gửi đơn...' : 'Xác nhận đẩy vận đơn'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

