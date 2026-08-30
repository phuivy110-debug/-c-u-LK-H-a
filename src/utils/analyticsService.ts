

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

// User interactions are recorded in GA4, not a simulated traffic counter.
export const trackUserAction = (actionName: string) => {
  sendToGoogleAnalytics('event', 'user_action', {
    send_to: GA_MEASUREMENT_ID,
    event_category: 'interaction',
    event_label: actionName,
  });
};
