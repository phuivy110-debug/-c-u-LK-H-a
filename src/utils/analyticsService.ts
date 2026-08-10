import { AnalyticsStats } from '../types';

// Generate or retrieve persistent unique client identifier
const getClientId = (): string => {
  let cid = localStorage.getItem('lkhoa_analytics_cid');
  if (!cid) {
    cid = 'cid_' + Math.random().toString(36).substring(2, 10) + '_' + Date.now().toString(36);
    localStorage.setItem('lkhoa_analytics_cid', cid);
  }
  return cid;
};

// Check if device is mobile
const checkIsMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

let hasReportedPageView = false;

// Send heartbeat / ping to server
export const pingAnalytics = async (action?: string): Promise<number | null> => {
  try {
    const isNewView = !hasReportedPageView;
    if (isNewView) {
      hasReportedPageView = true;
    }

    const res = await fetch('/api/analytics/ping', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId: getClientId(),
        isNewView,
        isMobile: checkIsMobile(),
        action,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.onlineCount || null;
    }
  } catch (err) {
    console.warn('Analytics ping silent catch:', err);
  }
  return null;
};

// Track specific user action (e.g. view product, copy code)
export const trackUserAction = (actionName: string) => {
  pingAnalytics(actionName);

  // Send event to Google Analytics (gtag.js) if available
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'user_action', {
      event_category: 'interaction',
      event_label: actionName,
    });
  }
};

// Fetch complete traffic analytics
export const fetchAnalyticsStats = async (): Promise<AnalyticsStats | null> => {
  try {
    const res = await fetch('/api/analytics/stats');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.error('Fetch analytics stats error:', err);
  }
  return null;
};
