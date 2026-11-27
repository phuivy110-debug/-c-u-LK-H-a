

const GA_MEASUREMENT_ID = 'G-1JRLR76R0H';

export interface AffiliateContext {
  placement?: string;
  articleSlug?: string;
  destinationType?: 'product' | 'store';
}

export interface CommerceItem {
  item_id: string;
  item_name: string;
  item_category?: string;
  item_variant?: string;
  price?: number;
  quantity?: number;
}

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
  if (typeof window === 'undefined' || !['docaulkhoa.vn', 'www.docaulkhoa.vn'].includes(window.location.hostname)) return;

  window.dataLayer = window.dataLayer || [];
  if (typeof window.gtag === 'function') {
    window.gtag(command, target, parameters);
    return;
  }

  window.dataLayer.push([command, target, parameters]);
};

export const trackPageView = (path: string) => {
  if (typeof window === 'undefined') return;

  const clientIdKey = 'lkhoa_analytics_client_id';
  let clientId = window.localStorage?.getItem(clientIdKey);
  if (!clientId) {
    clientId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    window.localStorage?.setItem(clientIdKey, clientId);
  }
  const payload = JSON.stringify({ clientId, isNewView: true, isMobile: window.matchMedia?.('(max-width: 768px)').matches, path });
  try {
    if (navigator.sendBeacon) navigator.sendBeacon('/api/analytics/ping', new Blob([payload], { type: 'application/json' }));
    else void fetch('/api/analytics/ping', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
  } catch { /* analytics must never block navigation */ }

  sendToGoogleAnalytics('event', 'page_view', {
    send_to: GA_MEASUREMENT_ID,
    page_title: document.title,
    page_location: window.location.href,
    page_path: path,
  });
};

export const trackCommerceEvent = (
  eventName: 'view_item' | 'select_item' | 'add_to_cart' | 'begin_checkout' | 'purchase' | 'search',
  parameters: Record<string, unknown>,
) => {
  sendToGoogleAnalytics('event', eventName, {
    send_to: GA_MEASUREMENT_ID,
    currency: 'VND',
    ...parameters,
  });
  if (typeof window !== 'undefined' && ['docaulkhoa.vn', 'www.docaulkhoa.vn'].includes(window.location.hostname)) {
    const item = Array.isArray(parameters.items) ? parameters.items[0] : undefined;
    const payload = JSON.stringify({ eventName, item });
    try {
      if (navigator.sendBeacon) navigator.sendBeacon('/api/analytics/commerce', new Blob([payload], { type: 'application/json' }));
      else void fetch('/api/analytics/commerce', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: payload, keepalive: true });
    } catch { /* analytics must never block checkout */ }
  }
};

export const trackAffiliateClick = (
  platform: 'shopee' | 'tiktok',
  destinationUrl: string,
  productId?: string,
  productName?: string,
  context: AffiliateContext = {},
) => {
  sendToGoogleAnalytics('event', 'affiliate_click', {
    send_to: GA_MEASUREMENT_ID,
    affiliate_platform: platform,
    destination_url: destinationUrl,
    product_id: productId || 'unknown',
    product_name: productName || 'unknown',
    link_placement: context.placement || 'inline_link',
    article_slug: context.articleSlug || '',
    destination_type: context.destinationType || 'product',
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
