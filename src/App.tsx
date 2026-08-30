import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductCard } from './components/ProductCard';
import { ProductDetailPage } from './components/ProductDetailPage';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CatalogPage } from './components/CatalogPage';
import { CategoryPage } from './components/CategoryPage';
import { GuidePage } from './components/GuidePage';
import { GuideDetailPage } from './components/GuideDetailPage';
import { AboutReviewPage, PrivacyPage } from './components/TrustPages';
import { WhyUsSection } from './components/WhyUsSection';
import { FaqSection } from './components/FaqSection';
import { AffiliateGuideModal } from './components/AffiliateGuideModal';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { ChatBot } from './components/ChatBot';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { FloatingTrafficWidget } from './components/FloatingTrafficWidget';
import { AnalyticsModal } from './components/AnalyticsModal';
import { SeoToolkitModal } from './components/SeoToolkitModal';
import { HomeGuidesSection } from './components/HomeGuidesSection';
import { GUIDE_ARTICLES } from './data/guides';
import { Product } from './types';
import { CATEGORIES } from './data/products';
import { FALLBACK_PRODUCTS } from './data/fallbackProducts';
import { Flame, ArrowRight, RefreshCw, FileSpreadsheet, ChevronRight, ShieldCheck, Fish, Compass, Feather, Waves, Anchor } from 'lucide-react';
import { fetchProductsFromGoogleSheet, DEFAULT_SHEET_URL, loadProductsCache, saveProductsCache, ensureUniqueProductIds } from './utils/googleSheetSync';
import { fetchLiveShopeePrices, mergeRealtimeShopeePrices, triggerShopeePriceSync } from './utils/shopeePriceSync';
import { trackAffiliateClick, trackPageView } from './utils/analyticsService';

const SHEET_URL_KEY = 'lkhoa_sheet_url_v2';

export default function App() {
  // Products state (defaults to cached or fallback products with active discounts)
  const [products, setProductsState] = useState<Product[]>(() => {
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

  // Client Routing State
  const [currentPath, setCurrentPath] = useState<string>(() => {
    return window.location.pathname || '/';
  });

  // Listen to popstate (browser back/forward buttons)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || '/');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Track every SPA route once, including browser back/forward navigation.
  useEffect(() => {
    trackPageView(currentPath);
  }, [currentPath]);

  // Track affiliate links rendered inside editorial content.
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
    window.history.pushState({}, '', path);
    setCurrentPath(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Google Sheet Sync State
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    return localStorage.getItem(SHEET_URL_KEY) || DEFAULT_SHEET_URL;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Search & Filter State in Hero
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Feedback
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAnalyticsModalOpen, setIsAnalyticsModalOpen] = useState(false);
  const [isSeoModalOpen, setIsSeoModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Admin status toggle (URL ?admin=true or double click logo)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true' || urlParams.get('admin') === '1') {
        return true;
      }
      return localStorage.getItem('lkhoa_is_admin') === 'true';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    localStorage.setItem(SHEET_URL_KEY, sheetUrl);
  }, [sheetUrl]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const [isShopeePriceRefreshing, setIsShopeePriceRefreshing] = useState(false);

  // Sync Google Sheet Function
  const handleSyncGoogleSheet = useCallback(
    async (targetUrl?: string, quiet = false) => {
      const urlToFetch = targetUrl || sheetUrl;
      setIsSyncing(true);
      setSyncError(null);
      try {
        const fetchedProducts = await fetchProductsFromGoogleSheet(urlToFetch);
        if (fetchedProducts.length > 0) {
          // Fetch live Shopee prices in parallel and merge
          const livePrices = await fetchLiveShopeePrices();
          const merged = mergeRealtimeShopeePrices(fetchedProducts, livePrices);
          setProducts(merged);
          saveProductsCache(merged, urlToFetch);
          const timeStr = new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          setLastSyncTime(timeStr);
          if (!quiet) {
            showToast(`Đồng bộ thành công ${fetchedProducts.length} sản phẩm & cập nhật giá Shopee realtime!`);
          }
        } else {
          setSyncError('Google Sheet không có dữ liệu phù hợp.');
        }
      } catch (err: any) {
        console.error('Failed to sync Google Sheet:', err);
        setSyncError(err.message || 'Không thể kết nối Google Sheet.');
        // Fall back to cache if available
        const cached = loadProductsCache(urlToFetch);
        if (cached && cached.products.length > 0) {
          setProducts(cached.products);
        }
      } finally {
        setIsSyncing(false);
      }
    },
    [sheetUrl]
  );

  // Manual or background Shopee realtime price refresh
  const handleRefreshShopeePrices = useCallback(async () => {
    setIsShopeePriceRefreshing(true);
    try {
      // First trigger background scraping if needed
      await triggerShopeePriceSync();
      // Fetch latest prices store
      const livePrices = await fetchLiveShopeePrices();
      setProductsState((currentProds) => {
        const updated = mergeRealtimeShopeePrices(currentProds, livePrices);
        saveProductsCache(updated, sheetUrl);
        return updated;
      });
      showToast('Đã cập nhật giá sale realtime từ Shopee!');
    } catch (e) {
      console.warn('Shopee price refresh failed:', e);
    } finally {
      setIsShopeePriceRefreshing(false);
    }
  }, [sheetUrl]);

  // Auto sync Google Sheet on mount and fetch Shopee prices
  useEffect(() => {
    handleSyncGoogleSheet(sheetUrl, true);
    // Periodic refresh of Shopee prices every 5 minutes
    const interval = setInterval(() => {
      fetchLiveShopeePrices().then((livePrices) => {
        if (livePrices && Object.keys(livePrices).length > 0) {
          setProductsState((currentProds) => mergeRealtimeShopeePrices(currentProds, livePrices));
        }
      });
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenDetailModal = (product: Product) => {
    setSelectedDetailProduct(product);
  };

  // Filter active products
  const activeProducts = useMemo(() => {
    return products.filter((p) => p.status === 'active');
  }, [products]);

  // Featured/New active products for homepage
  const homepageProducts = useMemo(() => {
    return activeProducts.slice(0, 8);
  }, [activeProducts]);

  // Handle route matching
  const renderContent = () => {
    if (currentPath === '/gioi-thieu-phuong-phap-danh-gia') {
      return <AboutReviewPage />;
    }

    if (currentPath === '/quyen-rieng-tu') {
      return <PrivacyPage />;
    }

    // 1. Route: /san-pham/:productSlug
    if (currentPath.startsWith('/san-pham/')) {
      const productSlug = currentPath.replace('/san-pham/', '').trim();
      return (
        <ProductDetailPage
          productSlug={productSlug}
          products={products}
          onNavigate={navigate}
          onOpenDetail={handleOpenDetailModal}
          onRefreshPrices={handleRefreshShopeePrices}
        />
      );
    }

    // 2. Route: /danh-muc/:categorySlug
    if (currentPath.startsWith('/danh-muc/')) {
      const categorySlug = currentPath.replace('/danh-muc/', '').trim();
      return (
        <CategoryPage
          categorySlug={categorySlug}
          products={products}
          onNavigate={navigate}
          onOpenDetail={handleOpenDetailModal}
        />
      );
    }

    // 3. Route: /cam-nang/:guideSlug
    if (currentPath.startsWith('/cam-nang/')) {
      const guideSlug = currentPath.replace('/cam-nang/', '').trim();
      return (
        <GuideDetailPage
          guideSlug={guideSlug}
          products={products}
          onNavigate={navigate}
          onOpenDetail={handleOpenDetailModal}
        />
      );
    }

    // 4. Route: /cam-nang
    if (currentPath === '/cam-nang') {
      return <GuidePage onNavigate={navigate} />;
    }

    // Direct Guide Slug route (e.g., /cach-cau-ca-loc-bang-lure)
    const directGuide = GUIDE_ARTICLES.find((g) => `/${g.slug}` === currentPath);
    if (directGuide) {
      return (
        <GuideDetailPage
          guideSlug={directGuide.slug}
          products={products}
          onNavigate={navigate}
          onOpenDetail={handleOpenDetailModal}
        />
      );
    }

    // 5. Route: /san-pham
    if (currentPath === '/san-pham') {
      return (
        <CatalogPage
          products={products}
          onNavigate={navigate}
          onOpenDetail={handleOpenDetailModal}
          initialQuery={searchQuery}
          onRefreshPrices={handleRefreshShopeePrices}
          isRefreshingPrices={isShopeePriceRefreshing}
        />
      );
    }

    // 4. Default Route: / (Homepage)
    return (
      <div className="space-y-10 sm:space-y-16 pb-12">
        {/* Hero */}
        <Hero
          onScrollToCatalog={() => {
            navigate('/san-pham');
          }}
          searchQuery={searchQuery}
          onSearchChange={(q) => {
            setSearchQuery(q);
            if (q.trim()) {
              navigate('/san-pham');
            }
          }}
          activeCount={activeProducts.length}
        />

        {/* Featured Category Section */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-extrabold text-[#EE4D2D] uppercase tracking-wider mb-1">
                Danh Mục Nổi Bật
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Khám Phá Theo Nhu Cầu Câu Cá
              </h2>
            </div>
            <button
              onClick={() => navigate('/san-pham')}
              className="text-xs sm:text-sm font-bold text-[#EE4D2D] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>Xem tất cả ({activeProducts.length})</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {CATEGORIES.filter((c) => c.slug !== 'tat-ca').map((cat) => {
              const catCount = activeProducts.filter((p) => {
                if (!p.category) return false;
                const normCat = p.category.toLowerCase();
                return normCat.includes(cat.name.toLowerCase()) || normCat.includes(cat.slug);
              }).length;

              return (
                <div
                  key={cat.slug}
                  onClick={() => navigate(`/danh-muc/${cat.slug}`)}
                  className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-orange-300 transition-all cursor-pointer flex flex-col justify-between group"
                >
                  <div className="space-y-2">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#EE4D2D] flex items-center justify-center group-hover:scale-110 transition-transform">
                      {cat.slug === 'can-cau' && <Fish className="w-5 h-5" />}
                      {cat.slug === 'may-cau' && <Compass className="w-5 h-5" />}
                      {cat.slug === 'moi-cau' && <Feather className="w-5 h-5" />}
                      {cat.slug === 'day-cau' && <Waves className="w-5 h-5" />}
                      {cat.slug === 'phao-luoi' && <Anchor className="w-5 h-5" />}
                      {cat.slug === 'phu-kien' && <ShieldCheck className="w-5 h-5" />}
                    </div>
                    <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-[#EE4D2D] transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-tight">
                      {cat.description}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-[#EE4D2D]">
                    <span>{catCount} sản phẩm</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Newly Updated Active Products */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="w-6 h-6 text-[#EE4D2D] fill-[#EE4D2D]" />
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Sản Phẩm Mới Cập Nhật</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                  Đã kiểm tra liên kết Shopee Mall & TikTok Shop chính hãng
                </p>
              </div>
            </div>

            <button
              onClick={() => navigate('/san-pham')}
              className="bg-[#EE4D2D] hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <span>Xem tất cả</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {homepageProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6">
              {homepageProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={handleOpenDetailModal}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-8 rounded-3xl border border-slate-200 text-center text-slate-500 text-sm">
              Đang tải danh sách sản phẩm từ Google Sheet...
            </div>
          )}
        </section>

        {/* Fishing Guides & Knowledge Section */}
        <HomeGuidesSection onNavigate={navigate} />

        {/* FAQ Section */}
        <FaqSection />

        {/* Why Us */}
        <WhyUsSection />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col text-slate-800">
      {/* Header */}
      <Header
        onOpenAdmin={() => setIsAdminOpen(true)}
        productCount={activeProducts.length}
        showAdminButton={isAdmin}
        categories={CATEGORIES.map((c) => ({ name: c.name, slug: c.slug }))}
        onNavigate={navigate}
        currentPath={currentPath}
      />

      {/* Main Content Area */}
      <main className="flex-1">{renderContent()}</main>

      {/* Footer */}
      <Footer />

      {/* Realtime Traffic & Trust Dashboard Modal */}
      <AnalyticsModal
        isOpen={isAnalyticsModalOpen}
        onClose={() => setIsAnalyticsModalOpen(false)}
      />

      {/* SEO Toolkit & Google Search Console Guide Modal */}
      <SeoToolkitModal
        isOpen={isSeoModalOpen}
        onClose={() => setIsSeoModalOpen(false)}
        productCount={activeProducts.length}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedDetailProduct}
        allProducts={products}
        onClose={() => setSelectedDetailProduct(null)}
        onCopyLink={() => {}}
        onSelectProduct={(p) => setSelectedDetailProduct(p)}
      />

      {/* Admin Google Sheet Configuration Modal */}
      <AffiliateGuideModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onUpdateProducts={setProducts}
        onResetDefault={() => {}}
        sheetUrl={sheetUrl}
        onUpdateSheetUrl={setSheetUrl}
        onTriggerSync={() => handleSyncGoogleSheet(sheetUrl)}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
        onOpenSeoModal={() => setIsSeoModalOpen(true)}
      />

      {/* Chatbot */}
      <ChatBot products={activeProducts} />

      {/* Floating Scroll To Top */}
      <ScrollToTopButton />

      {/* Toast Feedback */}
      <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
    </div>
  );
}
