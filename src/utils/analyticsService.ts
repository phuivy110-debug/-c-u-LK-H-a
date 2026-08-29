import { AnalyticsStats } from '../types';

const GA_MEASUREMENT_ID = 'G-1JRLR76R0H';

type GtagCommand = 'config' | 'event' | 'js';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: GtagCommand, target: string | Date, parameters?: Record<string, unknown>) => void;
  }
}

const sendToGoogleAnalytics = (
  command: GtagCommand,
  target: string | Date,
  parameters?: Record<string, unknown>
) => {
  if (typeof window === 'undefined') return;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === 'function') {
    window.gtag(command, target, parameters);
    return;
  }

  window.dataLayer.push([command, target, parameters]);
};

export const trackPageView = (path: string) => {
  if (typeof window === 'undefined') return;

  sendToGoogleAnalytics('event', 'page_view', {
    send_to: GA_MEASUREMENT_ID,
    page_title: document.title,
    page_location: window.location.href,
    page_path: path,
  });
};

export const trackAffiliateClick = (
  platform: 'shopee' | 'tiktok',
  destinationUrl: string,
  productId?: string,
  productName?: string
) => {
  sendToGoogleAnalytics('event', 'affiliate_click', {
    send_to: GA_MEASUREMENT_ID,
    affiliate_platform: platform,
    destination_url: destinationUrl,
    product_id: productId || 'unknown',
    product_name: productName || 'unknown',
    page_location: typeof window !== 'undefined' ? window.location.href : '',
  });
};

// Retrieve persistent unique client identifier
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

let pageViewReportedThisSession = false;

// Send heartbeat / ping to server
export const pingAnalytics = async (action?: string): Promise<number | null> => {
  try {
    let isNewView = false;
    if (typeof window !== 'undefined') {
      const alreadyReported = sessionStorage.getItem('lkhoa_pv_reported');
      if (!alreadyReported && !pageViewReportedThisSession) {
        isNewView = true;
        pageViewReportedThisSession = true;
        sessionStorage.setItem('lkhoa_pv_reported', 'true');
      }
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

// Track specific user action (e.g. view product, click affiliate link)
export const trackUserAction = (actionName: string) => {
  pingAnalytics(actionName);

  sendToGoogleAnalytics('event', 'user_action', {
    send_to: GA_MEASUREMENT_ID,
    event_category: 'interaction',
    event_label: actionName,
  });
};

// Fetch real stats from server, return null if unavailable (no fake stats)
export const fetchAnalyticsStats = async (): Promise<AnalyticsStats | null> => {
  try {
    const res = await fetch('/api/analytics/stats');
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data.todayPageViews === 'number') {
        return data;
      }
    }
  } catch (err) {
    console.warn('Fetch analytics stats endpoint failed:', err);
  }
  return null;
};
