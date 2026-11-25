import React, { Suspense, lazy, useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailPage } from './components/ProductDetailPage';
import { CatalogPage } from './components/CatalogPage';
import { CategoryPage } from './components/CategoryPage';
import { GuidePage } from './components/GuidePage';
import { GuideDetailPage } from './components/GuideDetailPage';
import {
  AboutReviewPage,
  PaymentPolicyPage,
  PrivacyPage,
  ShippingPolicyPage,
  WarrantyReturnPolicyPage,
} from './components/TrustPages';
import { WhyUsSection } from './components/WhyUsSection';
import { FaqSection } from './components/FaqSection';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { ChatBot } from './components/ChatBot';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { HomeGuidesSection } from './components/HomeGuidesSection';
import { ProductSkeletonGrid } from './components/ProductSkeleton';
import { CartDrawer } from './components/CartDrawer';
import { GUIDE_ARTICLES } from './data/guides';
import { Product } from './types';
import { CATEGORIES, MENU_CATEGORIES } from './data/products';
import { FALLBACK_PRODUCTS } from './data/fallbackProducts';
import { Flame, ArrowRight, ChevronRight, ShieldCheck, Fish, Compass, Feather, Waves, Anchor, ShoppingBag } from 'lucide-react';
import { fetchProductsFromGoogleSheet, DEFAULT_SHEET_URL, loadProductsCache, saveProductsCache, ensureUniqueProductIds } from './utils/googleSheetSync';
import { trackAffiliateClick, trackPageView } from './utils/analyticsService';
import { normalizeInternalPath, publicRoutes } from './utils/routes';
import { NotFoundPage } from './components/NotFoundPage';
import { DOMAIN } from './utils/site';
import { mergeWithLocalAdditions } from './utils/mergeLocalProducts';
import { CartProvider } from './utils/CartContext';

const SHEET_URL_KEY = 'lkhoa_sheet_url_v2';
const CartPage = lazy(() => import('./components/CartPage').then(module => ({ default: module.CartPage })));
const CheckoutPage = lazy(() => import('./components/CheckoutPage').then(module => ({ default: module.CheckoutPage })));
const OrderManagementPage = lazy(() => import('./components/OrderManagementPage').then(module => ({ default: module.OrderManagementPage })));

export default function App({ initialPath, initialProducts }: { initialPath?: string; initialProducts?: Product[] } = {}) {
  const [products, setProductsState] = useState<Product[]>(() => {
    if (initialProducts) return ensureUniqueProductIds(initialProducts);
    const cached = loadProductsCache(DEFAULT_SHEET_URL);
    if (cached && cached.products && cached.products.length > 0) {
      const hasValidDiscounts = cached.products.some((p) => (p.saleDiscountPercent || 0) > 0);
      if (hasValidDiscounts) {
        return ensureUniqueProductIds(cached.products);
      }
    }
    return ensureUniqueProductIds(FALLBACK_PRODUCTS);
  });

  const setProducts = useCallback((newProds: Product[] | ((prev: Product[]) => Product[])) => {
    setProductsState((prev) => {
      const resolved = typeof newProds === 'function' ? newProds(prev) : newProds;
      return ensureUniqueProductIds(resolved);
    });
  }, []);

  const [currentPath, setCurrentPath] = useState<string>(() => {
    return normalizeInternalPath(initialPath ?? (typeof window !== 'undefined' ? window.location.pathname : '/'));
  });
  const [routeVersion, setRouteVersion] = useState(0);
  const restoreScroll = useRef<number | null>(null);
  const activeLocation = useRef(typeof window === 'undefined' ? initialPath || '/' : window.location.pathname + window.location.search);

  useEffect(() => {
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    const initialLocation = window.location.pathname + window.location.search + window.location.hash;
    const normalizedInitialLocation = normalizeInternalPath(initialLocation);
    if (normalizedInitialLocation !== initialLocation) {
      window.history.replaceState(window.history.state, '', normalizedInitialLocation);
      activeLocation.current = window.location.pathname + window.location.search;
      setCurrentPath(normalizedInitialLocation.split(/[?#]/)[0]);
    }
    const handlePopState = () => {
      const location = window.location.pathname + window.location.search;
      if (location === activeLocation.current) return;
      activeLocation.current = location;
      restoreScroll.current = window.history.state?.scrollY ?? 0;
      setCurrentPath(normalizeInternalPath(window.location.pathname || '/'));
      setRouteVersion(value => value + 1);
    };
    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.history.scrollRestoration = previousRestoration;
    };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      if (restoreScroll.current !== null) {
        window.scrollTo({ top: restoreScroll.current, behavior: 'instant' });
        restoreScroll.current = null;
      } else if (window.location.hash === '#catalog-search') {
        document.getElementById('catalog-search')?.focus();
      } else if (window.location.hash && document.getElementById(window.location.hash.slice(1))) {
        document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: 'start' });
      } else if (routeVersion > 0) {
        document.querySelector<HTMLElement>('main')?.focus({ preventScroll: true });
        window.scrollTo({ top: 0, behavior: 'instant' });
      }
    });
    return () => cancelAnimationFrame(frame);
  }, [currentPath, routeVersion]);

  const metadataPath = useRef(currentPath);
  useEffect(() => {
    if (metadataPath.current !== currentPath) {
      document.querySelectorAll('head script[type="application/ld+json"]').forEach(node => node.remove());
      metadataPath.current = currentPath;
    }
    const guide = GUIDE_ARTICLES.find(item => `/cam-nang/${item.slug}` === currentPath);
    const heading = document.querySelector('main h1')?.textContent?.trim() || 'Đồ Câu LK Hòa';
    const title = guide?.metaTitle || `${heading}${currentPath === '/' ? '' : ' | Đồ Câu LK Hòa'}`;
    const description = guide?.metaDescription || guide?.summary || document.querySelector('main p')?.textContent?.trim().slice(0, 180) || heading;
    document.title = title;
    const canonical = document.querySelector('link[rel="canonical"]') || document.head.appendChild(document.createElement('link'));
    canonical.setAttribute('rel', 'canonical');
    canonical.setAttribute('href', `${DOMAIN}${currentPath}`);
    for (const [key, value] of Object.entries({ description, 'og:title': title, 'og:description': description, 'og:url': `${DOMAIN}${currentPath}`, 'twitter:title': title, 'twitter:description': description })) {
      const attribute = key.startsWith('og:') ? 'property' : 'name';
      const meta = document.querySelector(`meta[${attribute}="${key}"]`) || document.head.appendChild(document.createElement('meta'));
      meta.setAttribute(attribute, key);
      meta.setAttribute('content', value);
    }
  }, [currentPath]);

  useEffect(() => {
    trackPageView(currentPath);
  }, [currentPath]);

  useEffect(() => {
    const handleAffiliateLink = (event: MouseEvent) => {
      const target = event.target as Element | null;
      const anchor = target?.closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || anchor.closest('[data-affiliate-tracked="true"]')) return;

      try {
        const hostname = new URL(anchor.href).hostname.toLowerCase();
        if (hostname === 'shopee.vn' || hostname.endsWith('.shopee.vn')) {
          trackAffiliateClick('shopee', anchor.href);
        } else if (hostname === 'tiktok.com' || hostname.endsWith('.tiktok.com')) {
          trackAffiliateClick('tiktok', anchor.href);
        }
      } catch {
        // Ignore malformed or relative URLs.
      }
    };

    document.addEventListener('click', handleAffiliateLink);
    return () => document.removeEventListener('click', handleAffiliateLink);
  }, []);

  const navigate = useCallback((path: string) => {
    const target = normalizeInternalPath(path);
    if (target === `${window.location.pathname}${window.location.search}${window.location.hash}`) {
      if (target.endsWith('#catalog-search')) document.getElementById('catalog-search')?.focus();
      else if (window.location.hash) document.getElementById(window.location.hash.slice(1))?.scrollIntoView({ block: 'start' });
      return;
    }
    window.history.replaceState({ ...window.history.state, scrollY: window.scrollY }, '');
    window.history.pushState({}, '', target);
    activeLocation.current = window.location.pathname + window.location.search;
    setCurrentPath(target.split(/[?#]/)[0]);
    setRouteVersion(value => value + 1);
  }, []);

  const [sheetUrl] = useState<string>(() => {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(SHEET_URL_KEY) || DEFAULT_SHEET_URL : DEFAULT_SHEET_URL;
  });
  const [isSyncing, setIsSyncing] = useState<boolean>(() => {
    return typeof window !== 'undefined' && !initialProducts;
  });
  const [, setLastSyncTime] = useState<string | null>(null);
  const [, setSyncError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(SHEET_URL_KEY, sheetUrl);
    }
  }, [sheetUrl]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const handleSyncGoogleSheet = useCallback(
    async (targetUrl?: string, quiet = false) => {
      const urlToFetch = targetUrl || sheetUrl;
      setIsSyncing(true);
      setSyncError(null);
      try {
        const fetchedProducts = await fetchProductsFromGoogleSheet(urlToFetch);
        if (fetchedProducts.length > 0) {
          const mergedProducts = mergeWithLocalAdditions(fetchedProducts);
          setProducts(mergedProducts);
          saveProductsCache(mergedProducts, urlToFetch);
          const timeStr = new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          setLastSyncTime(timeStr);
          if (!quiet) {
            showToast(`Đồng bộ thành công ${fetchedProducts.length} sản phẩm từ danh mục!`);
          }
        } else {
          setSyncError('Google Sheet không có dữ liệu phù hợp.');
        }
      } catch (err: any) {
        console.error('Failed to sync Google Sheet:', err);
        setSyncError(err.message || 'Không thể kết nối Google Sheet.');
        const cached = loadProductsCache(urlToFetch);
        if (cached && cached.products.length > 0) {
          setProducts(mergeWithLocalAdditions(cached.products));
        }
      } finally {
        setIsSyncing(false);
      }
    },
    [setProducts, sheetUrl]
  );

  useEffect(() => {
    handleSyncGoogleSheet(sheetUrl, true);
  }, []);

  const handleOpenDetail = (product: Product) => {
    navigate(`/san-pham/${product.slug}`);
  };

  const activeProducts = useMemo(() => {
    return products.filter((p) => p.status === 'active');
  }, [products]);

  const homepageProducts = useMemo(() => {
    return activeProducts.slice(0, 8);
  }, [activeProducts]);

  const renderContent = () => {
    if (currentPath === '/gio-hang') {
      return (
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-center text-sm text-slate-400">Đang tải giỏ hàng...</div>}>
          <CartPage products={activeProducts} onNavigate={navigate} />
        </Suspense>
      );
    }

    if (currentPath === '/thanh-toan') {
      return (
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-center text-sm text-slate-400">Đang tải trang thanh toán...</div>}>
          <CheckoutPage onNavigate={navigate} />
        </Suspense>
      );
    }

    if (currentPath === '/quan-ly-don-hang') {
      return (
        <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-12 text-center text-sm text-slate-400">Đang tải cổng quản trị đơn hàng...</div>}>
          <OrderManagementPage onNavigate={navigate} />
        </Suspense>
      );
    }

    if (!publicRoutes(products).includes(currentPath)) return <NotFoundPage />;

    if (currentPath === '/gioi-thieu-phuong-phap-danh-gia') {
      return <AboutReviewPage />;
    }

    if (currentPath === '/quyen-rieng-tu') {
      return <PrivacyPage />;
    }

    if (currentPath === '/chinh-sach-bao-hanh-doi-tra') {
      return <WarrantyReturnPolicyPage />;
    }

    if (currentPath === '/chinh-sach-van-chuyen') {
      return <ShippingPolicyPage />;
    }

    if (currentPath === '/chinh-sach-thanh-toan') {
      return <PaymentPolicyPage />;
    }

    if (currentPath.startsWith('/san-pham/')) {
      const productSlug = currentPath.replace('/san-pham/', '').trim();
      return (
        <ProductDetailPage
          productSlug={productSlug}
          products={products}
          onNavigate={navigate}
          onOpenDetail={handleOpenDetail}
        />
      );
    }

    if (currentPath.startsWith('/danh-muc/')) {
      const categorySlug = currentPath.replace('/danh-muc/', '').trim();
      return (
        <CategoryPage
          categorySlug={categorySlug}
          products={products}
          onNavigate={navigate}
          onOpenDetail={handleOpenDetail}
        />
      );
    }

    if (currentPath.startsWith('/cam-nang/')) {
      const guideSlug = currentPath.replace('/cam-nang/', '').trim();
      return (
        <GuideDetailPage
          guideSlug={guideSlug}
          products={products}
          onNavigate={navigate}
          onOpenDetail={handleOpenDetail}
        />
      );
    }

    if (currentPath === '/cam-nang') {
      return <GuidePage onNavigate={navigate} />;
    }

    const directGuide = GUIDE_ARTICLES.find((g) => `/${g.slug}` === currentPath);
    if (directGuide) {
      return (
        <GuideDetailPage
          guideSlug={directGuide.slug}
          products={products}
          onNavigate={navigate}
          onOpenDetail={handleOpenDetail}
        />
      );
    }

    if (currentPath === '/san-pham') {
      return (
        <CatalogPage
          products={products}
          onNavigate={navigate}
          onOpenDetail={handleOpenDetail}
          initialQuery={typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get('q') || ''}
        />
      );
    }

    return (
      <div className="space-y-10 sm:space-y-14 pb-12">
        <Hero
          onScrollToCatalog={() => navigate('/san-pham')}
          onSearch={() => navigate(`/san-pham?q=${encodeURIComponent(searchQuery.trim())}#catalog-search`)}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          activeCount={activeProducts.length}
        />

        {/* Featured 7 Standard Tactical Categories */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-extrabold text-[#FACC15] uppercase tracking-wider mb-1">
                7 Danh Mục Thực Chiến Chính Hãng
              </p>
              <h2 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight">
                Khám Phá Trang Bị Theo Địa Hình Câu
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate('/san-pham')}
              className="text-xs sm:text-sm font-bold text-[#FACC15] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
            >
              <span>Xem tất cả ({activeProducts.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {MENU_CATEGORIES.map((cat) => (
              <button
                key={cat.slug}
                type="button"
                onClick={() => navigate(`/danh-muc/${cat.slug}`)}
                className="bg-[#111827] hover:bg-[#14532D]/35 p-4 rounded-2xl border border-slate-800 hover:border-emerald-700 transition-all cursor-pointer flex flex-col justify-between text-left group min-h-28"
              >
                <div className="w-9 h-9 rounded-xl bg-[#14532D]/50 border border-emerald-800/70 text-[#FACC15] flex items-center justify-center group-hover:scale-105 transition-transform">
                  {cat.slug === 'combo' && <Flame className="w-4 h-4" />}
                  {cat.slug === 'moi-lure-chuot-lk' && <Feather className="w-4 h-4" />}
                  {cat.slug === 'can-cau' && <Fish className="w-4 h-4" />}
                  {cat.slug === 'may-cau' && <Compass className="w-4 h-4" />}
                  {cat.slug === 'day-cau' && <Waves className="w-4 h-4" />}
                  {cat.slug === 'moi-dai-cam-hat' && <Anchor className="w-4 h-4" />}
                  {cat.slug === 'phu-kien' && <ShoppingBag className="w-4 h-4" />}
                </div>
                <div className="mt-3 flex items-center justify-between gap-1">
                  <h3 className="text-xs sm:text-sm font-extrabold text-white group-hover:text-[#FACC15] leading-snug">
                    {cat.name}
                  </h3>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#FACC15] shrink-0" />
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Featured Products Grid: 2 cols Mobile, 4 cols PC */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2.5">
              <Flame className="w-6 h-6 text-[#F97316] fill-[#F97316] shrink-0" />
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-black text-white">
                  Sản Phẩm Thực Chiến Nổi Bật
                </h2>
                <p className="text-xs sm:text-sm text-slate-400 font-medium">
                  Đặt COD đồng kiểm hoặc chuyển khoản VietQR · Freeship từ 300.000đ
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/san-pham')}
              data-cta="true"
              className="cta-btn bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {isSyncing ? (
            <ProductSkeletonGrid count={8} message="Đang đồng bộ danh mục sản phẩm chính hãng LK Hòa..." />
          ) : homepageProducts.length > 0 ? (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {homepageProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={handleOpenDetail}
                  onQuickBuy={() => navigate('/thanh-toan')}
                />
              ))}
            </div>
          ) : (
            <div className="bg-[#111827] p-8 rounded-2xl border border-slate-800 text-center text-slate-400 text-sm">
              Đang tải danh sách sản phẩm chính hãng Đồ Câu LK Hòa...
            </div>
          )}
        </section>

        {/* 4 Brand Trust Commitments */}
        <WhyUsSection />

        {/* Fishing Guides & Knowledge Section */}
        <HomeGuidesSection onNavigate={navigate} />

        {/* FAQ Section */}
        <FaqSection />
      </div>
    );
  };

  return (
    <CartProvider products={activeProducts} catalogReady={!isSyncing}>
      <div className="min-h-screen bg-[#0F172A] flex flex-col text-slate-100">
        <Header
          onOpenAdmin={() => navigate('/quan-ly-don-hang')}
          productCount={activeProducts.length}
          products={activeProducts}
          showAdminButton={false}
          categories={CATEGORIES.map((c) => ({ name: c.name, slug: c.slug }))}
          onNavigate={navigate}
          currentPath={currentPath}
        />

        <main key={`${currentPath}:${routeVersion}`} tabIndex={-1} className="flex-1 outline-none">
          {renderContent()}
        </main>

        <Footer onNavigate={navigate} />

        <CartDrawer products={activeProducts} onNavigate={navigate} />

        <ChatBot products={activeProducts} />
        <ScrollToTopButton />
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      </div>
    </CartProvider>
  );
}
