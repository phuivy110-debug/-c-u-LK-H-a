import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { CategoryFilter } from './components/CategoryFilter';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { WhyUsSection } from './components/WhyUsSection';
import { FaqSection } from './components/FaqSection';
import { AffiliateGuideModal } from './components/AffiliateGuideModal';
import { Footer } from './components/Footer';
import { Toast } from './components/Toast';
import { ChatBot } from './components/ChatBot';
import { AnalyticsModal } from './components/AnalyticsModal';
import { AnalyticsWidget } from './components/AnalyticsWidget';
import { ScrollToTopButton } from './components/ScrollToTopButton';
import { INITIAL_PRODUCTS } from './data/products';
import { Product } from './types';
import { Flame, RefreshCw, Layers, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { fetchProductsFromGoogleSheet, DEFAULT_SHEET_URL } from './utils/googleSheetSync';

const STORAGE_KEY = 'dealngon247_products_data_v1';
const SHEET_URL_KEY = 'dealngon247_sheet_url_v1';

export default function App() {
  // Products state with local storage fallback
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to load saved products:', e);
    }
    return INITIAL_PRODUCTS;
  });

  // Google Sheet Sync State
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    return localStorage.getItem(SHEET_URL_KEY) || DEFAULT_SHEET_URL;
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<string | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  // Filtering & Sorting State
  const [selectedCategory, setSelectedCategory] = useState<string>('Tất cả');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [visibleCount, setVisibleCount] = useState<number>(16);

  // Reset pagination when filters change
  useEffect(() => {
    setVisibleCount(16);
  }, [selectedCategory, searchQuery, sortBy]);

  // Modals & Feedback
  const [selectedDetailProduct, setSelectedDetailProduct] = useState<Product | null>(null);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Hidden Admin Mode state (hidden from customers)
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('admin') === 'true' || urlParams.get('admin') === '1') {
        return true;
      }
      return localStorage.getItem('dealngon247_is_admin') === 'true';
    } catch {
      return false;
    }
  });

  const [logoClicks, setLogoClicks] = useState(0);

  const handleLogoClick = () => {
    setLogoClicks((prev) => {
      const next = prev + 1;
      if (next >= 5) {
        const newAdminState = !isAdmin;
        setIsAdmin(newAdminState);
        localStorage.setItem('dealngon247_is_admin', String(newAdminState));
        showToast(newAdminState ? '🔓 Đã bật chế độ Quản Lý (Admin)' : '🔒 Đã ẩn chế độ Quản Lý');
        return 0;
      }
      return next;
    });
  };

  // Save products to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    } catch (e) {
      console.error('Failed to save products:', e);
    }
  }, [products]);

  // Save sheet URL to local storage
  useEffect(() => {
    localStorage.setItem(SHEET_URL_KEY, sheetUrl);
  }, [sheetUrl]);

  // Handle Toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // Sync Google Sheet Function
  const handleSyncGoogleSheet = useCallback(
    async (targetUrl?: string, quiet = false) => {
      const urlToFetch = targetUrl || sheetUrl;
      setIsSyncing(true);
      setSyncError(null);
      try {
        const fetchedProducts = await fetchProductsFromGoogleSheet(urlToFetch);
        if (fetchedProducts.length > 0) {
          setProducts(fetchedProducts);
          const timeStr = new Date().toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          });
          setLastSyncTime(timeStr);
          if (!quiet) {
            showToast(`Đồng bộ thành công ${fetchedProducts.length} sản phẩm từ Google Sheet!`);
          }
        } else {
          setSyncError('Google Sheet không có dữ liệu phù hợp.');
        }
      } catch (err: any) {
        console.error('Failed to sync Google Sheet:', err);
        setSyncError('Không thể kết nối Google Sheet. Đang hiển thị danh sách lưu sẵn.');
      } finally {
        setIsSyncing(false);
      }
    },
    [sheetUrl]
  );

  // Auto sync quietly on initial load for all visitors
  useEffect(() => {
    handleSyncGoogleSheet(sheetUrl, true);
  }, []);

  const handleCopyLink = (p: Product) => {
    const linkToCopy = p.shopeeUrl || p.tiktokUrl || '';
    if (linkToCopy) {
      navigator.clipboard.writeText(linkToCopy);
      showToast(`Đã sao chép link mua chính hãng "${p.name.slice(0, 25)}..."!`);
    } else {
      showToast('Sản phẩm hiện chưa có link mua hàng.');
    }
  };

  const handleCopyCoupon = (code: string) => {
    navigator.clipboard.writeText(code);
    showToast(`Đã sao chép mã giảm giá "${code}"!`);
  };

  const handleResetDefault = () => {
    setProducts(INITIAL_PRODUCTS);
    localStorage.removeItem(STORAGE_KEY);
    showToast('Đã khôi phục danh sách deal mặc định thành công.');
  };

  // Scroll to catalog section
  const handleScrollToCatalog = () => {
    const el = document.getElementById('catalog');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Dynamic categories list
  const categories = useMemo(() => {
    const catSet = new Set<string>();
    products.forEach((p) => {
      if (p.category) catSet.add(p.category);
    });
    return ['Tất cả', ...Array.from(catSet)];
  }, [products]);

  // Compute category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {
      'Tất cả': products.length,
    };
    products.forEach((p) => {
      const cat = p.category || 'Chưa phân loại';
      counts[cat] = (counts[cat] || 0) + 1;
    });
    return counts;
  }, [products]);

  // Filter & Sort Logic
  const filteredProducts = useMemo(() => {
    return products
      .filter((p) => {
        // Category filter
        if (selectedCategory !== 'Tất cả' && p.category !== selectedCategory) {
          return false;
        }

        // Search query
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim();
          const pName = (p.name || '').toLowerCase();
          const matchTitle = pName.includes(q);
          const matchCategory = (p.category || '').toLowerCase().includes(q);
          if (!matchTitle && !matchCategory) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        if (sortBy === 'discount') {
          const discountA = a.originalPrice > a.price && a.price > 0 ? (a.originalPrice - a.price) / a.originalPrice : 0;
          const discountB = b.originalPrice > b.price && b.price > 0 ? (b.originalPrice - b.price) / b.originalPrice : 0;
          return discountB - discountA;
        }
        if (sortBy === 'price-asc') {
          return priceA - priceB;
        }
        if (sortBy === 'price-desc') {
          return priceB - priceA;
        }
        return 0; // default order
      });
  }, [products, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-[#F6F7FB] flex flex-col text-slate-800">
      
      {/* Header */}
      <Header
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAnalytics={() => setIsAnalyticsOpen(true)}
        productCount={products.length}
        showAdminButton={isAdmin}
        onLogoClickCount={handleLogoClick}
        categories={categories}
        onSelectCategory={(catName) => {
          setSelectedCategory(catName);
          setVisibleCount(16);
        }}
      />

      {/* Hero Section */}
      <Hero
        onScrollToCatalog={handleScrollToCatalog}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        totalDeals={products.length}
      />

      {/* Catalog Main Section */}
      <main id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 flex-1 w-full space-y-6">
        
        {/* Google Sheet Live Auto-Sync Banner (Hidden from customers, visible only in Admin mode) */}
        {isAdmin && (
          <div className="bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-900 text-white rounded-2xl p-4 sm:p-5 shadow-lg border border-emerald-800/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 font-bold text-sm text-emerald-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span>Tự Động Đồng Bộ Google Sheet</span>
                  <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded-full font-extrabold uppercase tracking-wider">
                    Admin Live
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  {lastSyncTime ? (
                    <>Lần cập nhật gần nhất lúc <strong className="text-emerald-300">{lastSyncTime}</strong> ({products.length} sản phẩm từ sheet)</>
                  ) : (
                    <>Đang kết nối file Google Sheet...</>
                  )}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <button
                onClick={() => handleSyncGoogleSheet(sheetUrl)}
                disabled={isSyncing}
                className="flex-1 sm:flex-none bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                <span>{isSyncing ? 'Đang cập nhật...' : 'Cập Nhật Tức Thì'}</span>
              </button>

              <button
                onClick={() => setIsAdminOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold px-3.5 py-2.5 rounded-xl transition-colors cursor-pointer whitespace-nowrap"
              >
                Cấu hình Sheet
              </button>
            </div>
          </div>
        )}

        {/* Section Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div>
            <div className="flex items-center gap-2 text-[#EE4D2D] text-xs font-bold uppercase tracking-wider mb-1">
              <Flame className="w-4 h-4 fill-[#EE4D2D]" />
              <span>Sản Phẩm & Deal Hot LK Hòa</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Danh Mục Sản Phẩm Đang Giảm Giá
            </h2>
          </div>

          <div className="text-xs text-slate-500 font-semibold bg-white px-3.5 py-2 rounded-xl border border-slate-200/80 shadow-2xs">
            Hiển thị <span className="text-[#EE4D2D] font-extrabold">{Math.min(visibleCount, filteredProducts.length)}</span> / {filteredProducts.length} deal ngon
          </div>
        </div>

        {/* Category Filter Bar */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={(cat) => {
            setSelectedCategory(cat);
            setVisibleCount(16);
          }}
          sortBy={sortBy}
          onSortChange={setSortBy}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          categoryCounts={categoryCounts}
        />

        {/* Product Cards Grid - 2 columns on mobile, responsive on larger screens */}
        {filteredProducts.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-6">
              {filteredProducts.slice(0, visibleCount).map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onOpenDetail={setSelectedDetailProduct}
                  onCopyLink={handleCopyLink}
                />
              ))}
            </div>

            {/* Load More Button (Xem Thêm) */}
            {filteredProducts.length > visibleCount && (
              <div className="text-center pt-4">
                <button
                  onClick={() => setVisibleCount((prev) => prev + 16)}
                  className="bg-white hover:bg-orange-50 text-slate-800 hover:text-[#EE4D2D] font-extrabold text-xs sm:text-sm px-8 py-3.5 rounded-2xl border-2 border-slate-200 hover:border-[#EE4D2D] shadow-sm transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4 text-[#EE4D2D]" />
                  <span>
                    Xem thêm sản phẩm (Còn {filteredProducts.length - visibleCount} deal hot)
                  </span>
                </button>
              </div>
            )}
          </div>
        ) : (
          /* Empty State */
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-lg mx-auto space-y-4 my-8">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-[#EE4D2D] flex items-center justify-center mx-auto">
              <Layers className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-900">
              Không tìm thấy sản phẩm phù hợp
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Thử tìm kiếm với từ khóa khác hoặc bỏ lọc nhãn để xem tất cả deal hot hôm nay.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('Tất cả');
              }}
              className="inline-flex items-center gap-2 bg-[#EE4D2D] text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md hover:bg-orange-600 transition-colors cursor-pointer"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Đặt lại bộ lọc</span>
            </button>
          </div>
        )}

      </main>

      {/* SEO & Customer FAQ Section */}
      <FaqSection />

      {/* Why Us Section */}
      <WhyUsSection />

      {/* Footer */}
      <Footer onOpenAnalytics={() => setIsAnalyticsOpen(true)} />

      {/* Floating Traffic Analytics Widget (Bottom Left) */}
      <AnalyticsWidget
        onOpenModal={() => setIsAnalyticsOpen(true)}
        variant="floating"
      />

      {/* Web Traffic Statistics Addon Modal */}
      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
      />

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedDetailProduct}
        allProducts={products}
        onClose={() => setSelectedDetailProduct(null)}
        onCopyLink={handleCopyLink}
        onCopyCoupon={handleCopyCoupon}
        onSelectProduct={(product) => setSelectedDetailProduct(product)}
      />

      {/* Affiliate Link Guide & Admin Editor Modal */}
      <AffiliateGuideModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
        products={products}
        onUpdateProducts={setProducts}
        onResetDefault={handleResetDefault}
        sheetUrl={sheetUrl}
        onUpdateSheetUrl={setSheetUrl}
        onTriggerSync={() => handleSyncGoogleSheet(sheetUrl)}
        isSyncing={isSyncing}
        lastSyncTime={lastSyncTime}
      />

      {/* AI Customer Assistant Chatbot */}
      <ChatBot products={products} />

      {/* Scroll To Top Floating Button (Auto appears when scrolled > 500px) */}
      <ScrollToTopButton />

      {/* Toast Feedback */}
      <Toast
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />

    </div>
  );
}
