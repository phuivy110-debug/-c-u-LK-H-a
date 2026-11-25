import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ExternalLink,
  ImageOff,
  Minus,
  Play,
  Plus,
  ShieldCheck,
  ShoppingCart,
  Star,
  Truck,
  Wrench,
  X,
  Zap,
  ZoomIn,
} from 'lucide-react';
import type { Product, ProductReview } from '../types';
import { ProductCard } from './ProductCard';
import { InternalLink } from './InternalLink';
import { formatPrice } from '../utils/catalog';
import { NotFoundPage } from './NotFoundPage';
import { getProductDescription } from '../utils/productDescription';
import { getProductDetailData } from '../data/productVariants';
import { useCart } from '../utils/CartContext';
import { validateAffiliateUrl } from './AffiliateButtons';
import { SHARED_TIKTOK_URL } from '../utils/googleSheetSync';
import { trackAffiliateClick } from '../utils/analyticsService';
import { DOMAIN } from '../utils/site';

type TabKey = 'description' | 'specs' | 'rigging' | 'reviews';

export function ProductDetailPage({
  productSlug,
  products,
  onNavigate,
  onOpenDetail,
}: {
  productSlug: string;
  products: Product[];
  onNavigate: (path: string) => void;
  onOpenDetail?: (product: Product) => void;
}) {
  const { addToCart } = useCart();
  const product = products.find((item) => item.slug === productSlug);

  const detail = useMemo(() => (product ? getProductDetailData(product) : null), [product]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showVideo, setShowVideo] = useState(false);
  const [isZoomOpen, setIsZoomOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>('description');
  const [customReviews, setCustomReviews] = useState<ProductReview[]>([]);
  const [reviewAuthor, setReviewAuthor] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);

  useEffect(() => {
    if (detail?.variants?.[0]) {
      setSelectedVariantId(detail.variants[0].id);
      setQuantity(1);
      setActiveImageIndex(0);
      setShowVideo(false);
    }
  }, [productSlug, detail]);

  useEffect(() => {
    if (!product || typeof window === 'undefined') return;
    try {
      const raw = localStorage.getItem(`lkhoa_reviews_${product.id}`);
      if (raw) setCustomReviews(JSON.parse(raw));
      else setCustomReviews([]);
    } catch {
      setCustomReviews([]);
    }
  }, [product]);

  if (!product || !detail) return <NotFoundPage />;
  if (product.status !== 'active') {
    return (
      <div className="mx-auto max-w-4xl space-y-4 px-4 py-12 text-slate-200">
        <h1 className="text-2xl font-bold text-white">{product.name}</h1>
        <p>Sản phẩm hiện tạm ngưng kinh doanh trong danh mục.</p>
        <InternalLink href="/san-pham" onNavigate={onNavigate} className="text-[#FACC15] font-bold">
          Xem sản phẩm khác
        </InternalLink>
      </div>
    );
  }

  const selectedVariant =
    detail.variants.find((v) => v.id === selectedVariantId) || detail.variants[0];
  const price = selectedVariant.price;
  const originalPrice = selectedVariant.originalPrice || product.originalPrice || 0;
  const discount =
    originalPrice > price && price > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;
  const savings = discount > 0 ? originalPrice - price : 0;

  const shopeeUrl = validateAffiliateUrl(product.shopeeUrl, 'shopee');
  const tiktokUrl = validateAffiliateUrl(product.tiktokUrl, 'tiktok') || SHARED_TIKTOK_URL;
  const related = products
    .filter((item) => item.status === 'active' && item.category === product.category && item.id !== product.id)
    .slice(0, 4);

  const allReviews = [...customReviews, ...detail.reviews];
  const activeImage = detail.gallery[activeImageIndex] || product.imageUrl;

  const handleAddToCart = () => {
    addToCart(product, selectedVariant, quantity, true);
  };

  const handleBuyNowCod = () => {
    addToCart(product, selectedVariant, quantity, false);
    onNavigate('/thanh-toan');
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) return;
    const newReview: ProductReview = {
      id: `rev_${Date.now()}`,
      author: reviewAuthor.trim(),
      rating: reviewRating,
      date: new Date().toISOString().split('T')[0],
      variant: selectedVariant.label,
      comment: reviewComment.trim(),
      verifiedPurchase: false,
    };
    const next = [newReview, ...customReviews];
    setCustomReviews(next);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(`lkhoa_reviews_${product.id}`, JSON.stringify(next));
    }
    setReviewAuthor('');
    setReviewComment('');
  };

  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: selectedVariant.sku,
    mpn: selectedVariant.sku,
    image: detail.gallery.length > 0 ? detail.gallery : [`${DOMAIN}/favicon.svg`],
    description: getProductDescription(product),
    brand: {
      '@type': 'Brand',
      name: 'Đồ Câu LK Hòa',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: detail.rating.toFixed(1),
      reviewCount: detail.reviewCount + customReviews.length,
    },
    offers: {
      '@type': 'Offer',
      url: `${DOMAIN}/san-pham/${product.slug}`,
      priceCurrency: 'VND',
      price,
      priceValidUntil: '2027-12-31',
      itemCondition: 'https://schema.org/NewCondition',
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Đồ Câu LK Hòa',
        url: DOMAIN,
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingRate: {
          '@type': 'MonetaryAmount',
          value:
            price >= 300000 ||
            product.category.toLowerCase().includes('cần') ||
            /\bcần\b/i.test(product.name)
              ? 0
              : 30000,
          currency: 'VND',
        },
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'VN',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 0, maxValue: 1, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 4, unitCode: 'DAY' },
        },
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'VN',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 7,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
    },
  };

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 pb-24 sm:px-6 md:pb-10 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-400">
        <InternalLink href="/" onNavigate={onNavigate} className="hover:text-[#FACC15]">
          Trang Chủ
        </InternalLink>
        <span>/</span>
        <InternalLink href="/san-pham" onNavigate={onNavigate} className="hover:text-[#FACC15]">
          Sản Phẩm
        </InternalLink>
        <span>/</span>
        <span className="text-slate-200 font-semibold">{product.category}</span>
      </nav>

      {/* Main 2-Column Hybrid PDP Module */}
      <section className="grid grid-cols-1 gap-6 rounded-2xl border border-slate-800 bg-[#111827] p-4 sm:p-8 lg:grid-cols-12 lg:gap-10">
        {/* Left Column: Zoomable Gallery + Video Embed */}
        <div className="lg:col-span-6 space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-xl border border-slate-800 bg-slate-900 group">
            {showVideo && detail.youtubeId ? (
              <iframe
                title={detail.youtubeTitle || product.name}
                src={`https://www.youtube.com/embed/${detail.youtubeId}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : activeImage ? (
              <>
                <img
                  src={activeImage}
                  alt={`${product.name} - ${selectedVariant.label}`}
                  referrerPolicy="no-referrer"
                  width="640"
                  height="640"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105 cursor-zoom-in"
                  onClick={() => setIsZoomOpen(true)}
                />
                <button
                  type="button"
                  onClick={() => setIsZoomOpen(true)}
                  aria-label="Phóng to ảnh sản phẩm"
                  className="absolute right-3 bottom-3 min-h-10 px-3 py-1.5 rounded-lg bg-[#0F172A]/85 border border-slate-700 text-xs font-bold text-white flex items-center gap-1.5 cursor-pointer"
                >
                  <ZoomIn className="w-3.5 h-3.5 text-[#FACC15]" />
                  <span>Phóng to</span>
                </button>
              </>
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-400">
                <ImageOff className="h-10 w-10" />
                <span>Đang cập nhật ảnh sản phẩm</span>
              </div>
            )}

            {discount > 0 && !showVideo && (
              <span className="absolute left-3 top-3 rounded-md bg-[#F97316] px-2.5 py-1 text-xs font-black text-white shadow-lg tabular-nums">
                GIẢM {discount}%
              </span>
            )}
          </div>

          {/* Thumbnails + Video Toggle */}
          <div className="flex items-center gap-2.5 overflow-x-auto pb-1">
            {detail.gallery.map((imgUrl, idx) => (
              <button
                key={`${imgUrl}-${idx}`}
                type="button"
                onClick={() => {
                  setShowVideo(false);
                  setActiveImageIndex(idx);
                }}
                className={`w-16 h-16 rounded-lg overflow-hidden border-2 shrink-0 cursor-pointer ${
                  !showVideo && activeImageIndex === idx
                    ? 'border-[#FACC15]'
                    : 'border-slate-800 opacity-75 hover:opacity-100'
                }`}
              >
                <img src={imgUrl} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
              </button>
            ))}

            {detail.youtubeId && (
              <button
                type="button"
                onClick={() => setShowVideo((v) => !v)}
                className={`h-16 px-3 rounded-lg border-2 shrink-0 flex items-center gap-2 text-xs font-bold cursor-pointer ${
                  showVideo
                    ? 'border-[#FACC15] bg-[#14532D] text-[#FACC15]'
                    : 'border-slate-700 bg-[#0F172A] text-slate-200 hover:border-slate-500'
                }`}
              >
                <Play className="w-4 h-4 fill-current text-[#F97316]" />
                <span className="whitespace-nowrap">Video thực chiến</span>
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Purchase Module */}
        <div className="lg:col-span-6 flex flex-col space-y-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
              <span className="font-bold text-emerald-400">Chính Hãng LK Hòa</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular">SKU: {selectedVariant.sku}</span>
              <span aria-hidden="true">·</span>
              <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Còn hàng ({selectedVariant.stock})
              </span>
            </div>

            <h1 className="font-display text-xl font-black leading-tight text-white sm:text-3xl">
              {product.name}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1 font-bold text-[#FACC15] tabular-nums">
                <Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
                {detail.rating.toFixed(1)}
              </span>
              <span className="text-slate-600">·</span>
              <span className="tabular-nums">{detail.reviewCount + customReviews.length} đánh giá</span>
              <span className="text-slate-600">·</span>
              <span className="tabular-nums">Đã bán {detail.soldCount}</span>
            </div>
          </div>

          {/* Dynamic Price Panel */}
          <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 space-y-2">
            <div className="flex flex-wrap items-baseline gap-3">
              <strong className="text-3xl sm:text-4xl font-black text-[#FACC15] tabular-nums">
                {formatPrice(price)}
              </strong>
              {originalPrice > price && (
                <span className="text-base font-semibold text-slate-400 line-through tabular-nums">
                  {formatPrice(originalPrice)}
                </span>
              )}
              {discount > 0 && (
                <span className="rounded bg-[#F97316] px-2 py-0.5 text-xs font-black text-white tabular-nums">
                  Tiết kiệm {formatPrice(savings)}
                </span>
              )}
            </div>
            <p className="text-xs text-emerald-300 flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span>
                {price >= 300000 || product.category === 'Cần Câu'
                  ? 'Miễn phí vận chuyển toàn quốc · Đóng ống nhựa PVC bảo vệ'
                  : 'Freeship đơn từ 300.000đ · Đồng kiểm trước khi thanh toán'}
              </span>
            </p>
          </div>

          {/* Variant Selector */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold uppercase tracking-wider text-slate-300">
                Chọn {selectedVariant.groupName}:
              </span>
              <span className="font-bold text-[#FACC15]">{selectedVariant.label}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {detail.variants.map((variant) => {
                const isSelected = variant.id === selectedVariant.id;
                return (
                  <button
                    key={variant.id}
                    type="button"
                    onClick={() => setSelectedVariantId(variant.id)}
                    className={`min-h-11 px-3.5 py-2 rounded-lg text-xs font-bold border transition-colors cursor-pointer whitespace-nowrap ${
                      isSelected
                        ? 'bg-[#14532D] border-[#FACC15] text-[#FACC15]'
                        : 'bg-[#0F172A] border-slate-700 text-slate-200 hover:border-slate-500'
                    }`}
                  >
                    {variant.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quantity Stepper */}
          <div className="flex items-center gap-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Số lượng:</span>
            <div className="inline-flex items-center rounded-lg border border-slate-700 bg-[#0F172A]">
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                aria-label="Giảm số lượng"
                className="w-11 h-11 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-10 text-center text-sm font-black text-white tabular-nums">
                {quantity}
              </span>
              <button
                type="button"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
                aria-label="Tăng số lượng"
                className="w-11 h-11 flex items-center justify-center text-slate-300 hover:text-white cursor-pointer"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* 4-Tier Hybrid CTA Cluster */}
          <div className="space-y-2.5 pt-1">
            {/* Tier 1: Primary Direct COD / Checkout CTA */}
            <button
              type="button"
              onClick={handleBuyNowCod}
              data-cta="true"
              className="cta-btn w-full min-h-13 px-4 py-3 rounded-xl bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] text-sm sm:text-base font-black flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-5 h-5 shrink-0" />
              <span>MUA NGAY - THANH TOÁN KHI NHẬN HÀNG (COD)</span>
            </button>

            {/* Tier 2: Secondary Add to Cart Drawer */}
            <button
              type="button"
              onClick={handleAddToCart}
              className="w-full min-h-12 px-4 py-3 rounded-xl bg-[#14532D] hover:bg-emerald-800 border border-emerald-700 text-white text-sm font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <ShoppingCart className="w-4 h-4 shrink-0" />
              <span>THÊM VÀO GIỎ HÀNG</span>
            </button>

            {/* Tier 3 & 4: Marketplace Affiliate Buttons */}
            <div data-affiliate-tracked="true" className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              {shopeeUrl ? (
                <a
                  href={shopeeUrl}
                  target="_blank"
                  rel="nofollow sponsored noopener"
                  onClick={() =>
                    trackAffiliateClick('shopee', shopeeUrl, product.id, product.name, {
                      placement: 'product_detail',
                      destinationType: 'product',
                    })
                  }
                  className="min-h-11 px-3 py-2.5 rounded-xl bg-[#F97316]/15 border border-[#F97316]/50 hover:bg-[#F97316]/25 text-[#F97316] text-xs font-bold flex items-center justify-center gap-1.5 text-center"
                >
                  <span>Mua qua Shopee (Săn Freeship)</span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                </a>
              ) : (
                <span className="text-xs text-slate-500 py-2.5 text-center">Chưa có link Shopee</span>
              )}

              <a
                href={tiktokUrl}
                target="_blank"
                rel="nofollow sponsored noopener"
                onClick={() =>
                  trackAffiliateClick('tiktok', tiktokUrl, product.id, product.name, {
                    placement: 'product_detail',
                    destinationType: 'product',
                  })
                }
                className="min-h-11 px-3 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 text-center"
              >
                <span>Mua qua TikTok Shop</span>
                <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Đổi mới 1-1 trong 7 ngày</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4 text-[#FACC15] shrink-0" />
              <span>Hỗ trợ bảo hành ngọn cần</span>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Product Detail Information Tabs */}
      <section className="rounded-2xl border border-slate-800 bg-[#111827] overflow-hidden">
        <div className="flex overflow-x-auto border-b border-slate-800 bg-[#0F172A] px-2 sm:px-4">
          {(
            [
              { id: 'description', label: 'Mô tả chi tiết' },
              { id: 'specs', label: 'Thông số kỹ thuật' },
              { id: 'rigging', label: 'Hướng dẫn phối đồ / bài mồi' },
              { id: 'reviews', label: `Đánh giá (${allReviews.length})` },
            ] as { id: TabKey; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`min-h-12 px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap shrink-0 border-b-2 transition-colors cursor-pointer ${
                activeTab === tab.id
                  ? 'text-[#FACC15] border-[#FACC15]'
                  : 'text-slate-400 border-transparent hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5 sm:p-8">
          {activeTab === 'description' && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-black text-white">
                Mô tả chi tiết {product.name}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-300">
                {getProductDescription(product)}
              </p>
            </div>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-black text-white">
                Bảng thông số kỹ thuật
              </h2>
              <div className="overflow-x-auto rounded-xl border border-slate-800">
                <table className="w-full text-left text-xs sm:text-sm">
                  <tbody className="divide-y divide-slate-800">
                    {detail.specs.map((spec) => (
                      <tr key={spec.label} className="bg-[#0F172A]/60">
                        <th className="py-3 px-4 font-bold text-slate-300 w-2/5">{spec.label}</th>
                        <td className="py-3 px-4 text-white tabular-nums">{spec.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'rigging' && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-black text-white">
                Hướng dẫn phối đồ &amp; sử dụng thực chiến
              </h2>
              <p className="text-sm leading-relaxed text-slate-300">
                {detail.riggingGuide}
              </p>
            </div>
          )}

          {activeTab === 'reviews' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                <div className="md:col-span-7 space-y-3">
                  <h2 className="font-display text-lg font-black text-white">
                    Nhận xét từ cần thủ đã mua
                  </h2>
                  {allReviews.map((rev) => (
                    <div key={rev.id} className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 space-y-1.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="text-sm font-bold text-white">{rev.author}</span>
                        <span className="text-xs text-slate-400 tabular-nums">{rev.date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-[#FACC15] font-bold">
                          {'★'.repeat(rev.rating)}
                        </span>
                        {rev.variant && <span className="text-slate-400">· Phân loại: {rev.variant}</span>}
                        {rev.verifiedPurchase && (
                          <span className="text-emerald-400 font-semibold">· Đã mua hàng</span>
                        )}
                      </div>
                      <p className="text-sm text-slate-300 leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>

                <form
                  onSubmit={handleSubmitReview}
                  className="md:col-span-5 rounded-xl border border-slate-800 bg-[#0F172A] p-4 space-y-3 h-fit"
                >
                  <h3 className="text-sm font-bold text-white">Gửi đánh giá của bạn</h3>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Số sao</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((n) => (
                        <button
                          key={n}
                          type="button"
                          onClick={() => setReviewRating(n)}
                          className={`p-1.5 rounded cursor-pointer ${
                            n <= reviewRating ? 'text-[#FACC15]' : 'text-slate-600'
                          }`}
                          aria-label={`${n} sao`}
                        >
                          <Star className="w-5 h-5 fill-current" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={reviewAuthor}
                    onChange={(e) => setReviewAuthor(e.target.value)}
                    placeholder="Tên của bạn (VD: Anh Minh - Hà Nội)"
                    className="w-full h-10 px-3 rounded-lg bg-[#111827] border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:border-[#FACC15] focus:outline-none"
                  />
                  <textarea
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Chia sẻ trải nghiệm thực tế về sản phẩm..."
                    className="w-full p-3 rounded-lg bg-[#111827] border border-slate-700 text-xs text-white placeholder:text-slate-500 focus:border-[#FACC15] focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="w-full min-h-10 rounded-lg bg-[#14532D] hover:bg-emerald-800 text-white text-xs font-bold cursor-pointer"
                  >
                    Gửi đánh giá
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-black text-white">
            Trang Bị Cùng Danh Mục
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {related.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onOpenDetail={onOpenDetail || ((selected) => onNavigate(`/san-pham/${selected.slug}`))}
                onQuickBuy={() => onNavigate('/thanh-toan')}
                placement="product_related"
              />
            ))}
          </div>
        </section>
      )}

      {/* Mobile Sticky Bottom CTA Bar (<= 64px height) */}
      <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-[#0F172A]/95 backdrop-blur-md border-t border-slate-800 px-3 py-2 flex items-center justify-between gap-2 shadow-2xl">
        <div className="min-w-0">
          <p className="text-[10px] text-slate-400 truncate">{selectedVariant.label}</p>
          <strong className="text-base font-black text-[#FACC15] tabular-nums">
            {formatPrice(price)}
          </strong>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleAddToCart}
            className="min-h-11 px-3 rounded-lg bg-[#14532D] text-white text-xs font-bold whitespace-nowrap cursor-pointer"
          >
            Thêm Giỏ
          </button>
          <button
            type="button"
            onClick={handleBuyNowCod}
            className="min-h-11 px-3.5 rounded-lg bg-[#FACC15] text-[#0F172A] text-xs font-black whitespace-nowrap cursor-pointer"
          >
            Đặt Hàng Ngay
          </button>
        </div>
      </div>

      {/* Image Zoom Lightbox */}
      {isZoomOpen && activeImage && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsZoomOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setIsZoomOpen(false)}
            aria-label="Đóng ảnh phóng to"
            className="absolute top-4 right-4 w-11 h-11 rounded-full bg-slate-800 text-white flex items-center justify-center cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <img
            src={activeImage}
            alt={product.name}
            referrerPolicy="no-referrer"
            className="max-h-[88vh] max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
