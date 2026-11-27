import React, { useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  BadgeCheck,
  CircleAlert,
  ExternalLink,
  ImageOff,
  Layers3,
  Link2,
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
import { formatPrice, isPromotedProduct, productDisplayName, productPrice, productPromoLabel } from '../utils/catalog';
import { NotFoundPage } from './NotFoundPage';
import { getProductDetailData } from '../data/productVariants';
import { useCart } from '../utils/CartContext';
import { validateAffiliateUrl } from './AffiliateButtons';
import { SHARED_TIKTOK_URL } from '../utils/googleSheetSync';
import { trackAffiliateClick, trackCommerceEvent } from '../utils/analyticsService';
import { loadVerifiedShopeeGallery } from '../utils/shopeeGallery';
import { GUIDE_ARTICLES } from '../data/guides';
import {
  categoryPath,
  getComplementaryCategories,
  getComplementaryProducts,
  getProductDescriptionLayout,
  getVariantSelectionCriteria,
} from '../utils/productMerchandising';

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
  const displayName = product ? productDisplayName(product) : '';
  const promoLabel = product ? productPromoLabel(product) : undefined;

  const baseDetail = useMemo(() => (product ? getProductDetailData(product) : null), [product]);
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
  const [variantRequest, setVariantRequest] = useState('');
  const [verifiedGallery, setVerifiedGallery] = useState<string[]>([]);
  const detail = useMemo(() => {
    if (!baseDetail) return null;
    const gallery = [...baseDetail.gallery, ...verifiedGallery]
      .filter((url, index, values) => values.indexOf(url) === index);
    return { ...baseDetail, gallery };
  }, [baseDetail, verifiedGallery]);

  const verifiedFields = useMemo(() => {
    if (!product) return [];
    return [
      product.imageUrl ? 'Ảnh sản phẩm' : null,
      productPrice(product) > 0 ? 'Giá website' : null,
      product.variants?.length ? 'Phân loại & SKU' : null,
      product.specs?.length ? 'Thông số kỹ thuật' : null,
    ].filter((item): item is string => Boolean(item));
  }, [product]);

  useEffect(() => {
    if (baseDetail?.variants?.[0]) {
      setSelectedVariantId(baseDetail.variants[0].id);
      setQuantity(1);
      setActiveImageIndex(0);
      setShowVideo(false);
      setActiveTab('description');
      setVariantRequest('');
    }
  }, [productSlug, baseDetail]);

  useEffect(() => {
    let cancelled = false;
    setVerifiedGallery([]);
    loadVerifiedShopeeGallery(product?.shopeeUrl).then((gallery) => {
      if (!cancelled) setVerifiedGallery(gallery);
    });
    return () => {
      cancelled = true;
    };
  }, [product?.shopeeUrl]);

  useEffect(() => {
    if (!product || !detail) return;
    const firstVariant = detail.variants[0];
    trackCommerceEvent('view_item', {
      value: firstVariant?.price || 0,
      items: [{
        item_id: product.id,
        item_name: productDisplayName(product),
        item_category: product.category,
        item_variant: firstVariant?.label,
        price: firstVariant?.price,
        quantity: 1,
      }],
    });
  }, [product?.id]);

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
        <h1 className="text-2xl font-bold text-white">{displayName}</h1>
        <p>Sản phẩm hiện tạm ngưng kinh doanh trong danh mục.</p>
        <InternalLink href="/san-pham" onNavigate={onNavigate} className="text-[#FACC15] font-bold">
          Xem sản phẩm khác
        </InternalLink>
      </div>
    );
  }

  const selectedVariant =
    detail.variants.find((v) => v.id === selectedVariantId) || detail.variants[0];
  const variantGroups = product.variantGroups?.filter((group) => group.options.length) || [];
  const selectedOptionValues = selectedVariant.optionValues || [selectedVariant.label];
  const hasVerifiedVariants = Boolean(product.variants?.length);
  const effectiveVariant = !hasVerifiedVariants && variantRequest.trim()
    ? {
        ...selectedVariant,
        id: `${selectedVariant.id}-requested`,
        label: `Yêu cầu: ${variantRequest.trim()}`,
      }
    : selectedVariant;
  const price = selectedVariant.price;
  const originalPrice = selectedVariant.originalPrice || product.originalPrice || 0;
  const discount =
    isPromotedProduct(product) && originalPrice > price && price > 0
      ? Math.round(((originalPrice - price) / originalPrice) * 100)
      : 0;
  const savings = discount > 0 ? originalPrice - price : 0;

  const shopeeUrl = validateAffiliateUrl(product.shopeeUrl, 'shopee');
  const tiktokUrl = validateAffiliateUrl(product.tiktokUrl, 'tiktok') || SHARED_TIKTOK_URL;
  const similarProducts = products
    .filter((item) => item.status === 'active' && item.category === product.category && item.id !== product.id)
    .slice(0, 4);
  const complementaryProducts = getComplementaryProducts(product, products, 4);
  const complementaryCategories = getComplementaryCategories(product);
  const selectionCriteria = getVariantSelectionCriteria(product);
  const descriptionLayout = getProductDescriptionLayout(product);
  const relatedGuides = GUIDE_ARTICLES
    .filter((guide) => guide.relatedCategorySlug && (
      (product.category.includes('Cần') && guide.relatedCategorySlug === 'can-cau')
      || (product.category.includes('Mồi') && guide.relatedCategorySlug === 'moi-cau')
      || (product.category.includes('Dây') && guide.relatedCategorySlug === 'day-cau')
      || (product.category.includes('Phụ') && guide.relatedCategorySlug === 'phu-kien')
      || ((product.category.includes('Phao') || product.category.includes('Lưỡi')) && guide.relatedCategorySlug === 'phao-luoi')
    ))
    .slice(0, 3);

  const allReviews = [...customReviews, ...detail.reviews];
  const hasDetailedSpecs = Boolean(product.specs?.length);
  const hasRiggingGuide = Boolean(detail.riggingGuide?.trim());
  const availableTabs: { id: TabKey; label: string }[] = [
    { id: 'description', label: 'Mô tả chi tiết' },
    { id: 'specs', label: 'Thông số & phân loại' },
    ...(hasRiggingGuide ? [{ id: 'rigging' as TabKey, label: 'Hướng dẫn phối đồ / bài mồi' }] : []),
    { id: 'reviews', label: `Đánh giá (${allReviews.length})` },
  ];
  const activeImage = detail.gallery[activeImageIndex] || product.imageUrl;

  const handleAddToCart = () => {
    addToCart(product, effectiveVariant, quantity, true);
  };

  const handleVariantOptionSelect = (groupIndex: number, option: string) => {
    const exact = detail.variants.find((variant) =>
      variant.stock !== 0 &&
      variant.optionValues?.every((value, index) =>
        index === groupIndex ? value === option : value === selectedOptionValues[index]
      )
    );
    const compatible = exact || detail.variants.find((variant) =>
      variant.stock !== 0 && variant.optionValues?.[groupIndex] === option
    );
    if (compatible) setSelectedVariantId(compatible.id);
  };

  const handleBuyNowCod = () => {
    addToCart(product, effectiveVariant, quantity, false);
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

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-6 pb-24 sm:px-6 md:pb-10 lg:px-8">
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
                title={detail.youtubeTitle || displayName}
                src={`https://www.youtube.com/embed/${detail.youtubeId}?autoplay=1`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="w-full h-full border-0"
              />
            ) : activeImage ? (
              <>
                <img
                  src={activeImage}
                  alt={`${displayName} - ${selectedVariant.label}`}
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
              {(product.sku || product.variants?.length) && (
                <>
                  <span className="font-mono-tabular">SKU: {selectedVariant.sku}</span>
                  <span aria-hidden="true">·</span>
                </>
              )}
              <span className="inline-flex items-center gap-1 text-emerald-300 font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" />
                {typeof selectedVariant.stock === 'number'
                  ? selectedVariant.stock > 0
                    ? `Còn hàng (${selectedVariant.stock})`
                    : 'Tạm hết hàng'
                  : 'Có thể đặt hàng'}
              </span>
            </div>

            <h1 className="font-display text-xl font-black leading-tight text-white sm:text-3xl">
              {displayName}
            </h1>
            {promoLabel && (
              <p className="text-sm font-bold text-[#F97316]">{promoLabel}</p>
            )}

            {(typeof detail.rating === 'number' ||
              typeof detail.reviewCount === 'number' ||
              typeof detail.soldCount === 'number') && (
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                {typeof detail.rating === 'number' && (
                  <span className="inline-flex items-center gap-1 font-bold text-[#FACC15] tabular-nums">
                    <Star className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
                    {detail.rating.toFixed(1)}
                  </span>
                )}
                {typeof detail.reviewCount === 'number' && (
                  <span className="tabular-nums">{detail.reviewCount} đánh giá</span>
                )}
                {typeof detail.soldCount === 'number' && (
                  <span className="tabular-nums">Đã bán {detail.soldCount}</span>
                )}
              </div>
            )}
          </div>

          {/* Dynamic Price Panel */}
          <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {hasVerifiedVariants ? 'Giá theo phiên bản đang chọn' : 'Giá tham khảo từ'}
            </p>
            <div className="flex flex-wrap items-baseline gap-3">
              <strong className="text-3xl sm:text-4xl font-black text-[#FACC15] tabular-nums">
                {formatPrice(price)}
              </strong>
              {discount > 0 && originalPrice > price && (
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

          <div className="rounded-xl border border-emerald-900/70 bg-emerald-950/20 p-4">
            <div className="flex items-start gap-2.5">
              <BadgeCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
              <div>
                <p className="text-xs font-extrabold text-emerald-300">Dữ liệu mua hàng đã đối soát</p>
                <p className="mt-1 text-xs leading-relaxed text-slate-300">
                  {verifiedFields.join(' · ')}
                  {!product.specs?.length
                    ? '. Thông số chi tiết chưa có nguồn chính thức sẽ không được tự suy đoán; vui lòng xác nhận với LK Hòa trước khi đặt.'
                    : '. Vui lòng chọn đúng phiên bản trước khi thêm vào giỏ.'}
                </p>
              </div>
            </div>
          </div>

          {/* Variant Selector / truthful request fallback */}
          {hasVerifiedVariants && variantGroups.length > 0 ? (
            <div className="space-y-4">
              {variantGroups.map((group, groupIndex) => (
                <div key={group.name} className="space-y-2">
                  <div className="flex items-center justify-between gap-3 text-xs">
                    <span className="font-bold uppercase tracking-wider text-slate-300">
                      Chọn {group.name}:
                    </span>
                    <span className="font-bold text-[#FACC15]">{selectedOptionValues[groupIndex]}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {group.options.map((option) => {
                      const isSelected = selectedOptionValues[groupIndex] === option;
                      const hasAvailableCombination = detail.variants.some((variant) =>
                        variant.stock !== 0 && variant.optionValues?.[groupIndex] === option
                      );
                      return (
                        <button
                          key={option}
                          type="button"
                          disabled={!hasAvailableCombination}
                          onClick={() => handleVariantOptionSelect(groupIndex, option)}
                          className={`min-h-11 rounded-lg border px-3.5 py-2 text-xs font-bold transition-colors ${
                            isSelected
                              ? 'bg-[#14532D] border-[#FACC15] text-[#FACC15]'
                              : !hasAvailableCombination
                                ? 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-600 line-through'
                                : 'bg-[#0F172A] border-slate-700 text-slate-200 hover:border-slate-500'
                          }`}
                        >
                          {option}{!hasAvailableCombination ? ' · Hết hàng' : ''}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
              <p className="text-xs text-slate-400">
                Phiên bản đã chọn: <span className="font-bold text-slate-200">{selectedVariant.label}</span>
              </p>
            </div>
          ) : hasVerifiedVariants ? (
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
                  const isUnavailable = variant.stock === 0;
                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={isUnavailable}
                      onClick={() => setSelectedVariantId(variant.id)}
                      className={`min-h-11 px-3.5 py-2 rounded-lg text-xs font-bold border transition-colors whitespace-nowrap ${
                        isSelected
                          ? 'bg-[#14532D] border-[#FACC15] text-[#FACC15]'
                          : isUnavailable
                            ? 'cursor-not-allowed border-slate-800 bg-slate-950 text-slate-600 line-through'
                          : 'bg-[#0F172A] border-slate-700 text-slate-200 hover:border-slate-500'
                      }`}
                    >
                      {variant.label}{isUnavailable ? ' · Hết hàng' : ''}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4">
              <div className="flex items-start gap-2.5">
                <Layers3 className="mt-0.5 h-4 w-4 shrink-0 text-[#FACC15]" aria-hidden="true" />
                <div className="space-y-1">
                  <p className="text-sm font-black text-white">Xác nhận đúng phiên bản trước khi giao</p>
                  <p className="text-xs leading-relaxed text-slate-300">
                    Sản phẩm có thể có nhiều size, màu hoặc cấu hình. Bảng biến thể và giá theo từng lựa chọn đang được đối soát; LK Hòa sẽ xác nhận lại trước khi chốt đơn.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {selectionCriteria.map((criterion) => (
                  <span key={criterion} className="rounded-full border border-slate-700 bg-[#0F172A] px-2.5 py-1 text-xs font-semibold text-slate-300">
                    {criterion}
                  </span>
                ))}
              </div>
              <div>
                <label htmlFor="variant-request" className="mb-1.5 block text-xs font-bold text-slate-200">
                  Phiên bản anh/chị muốn mua <span className="font-medium text-slate-500">(không bắt buộc)</span>
                </label>
                <input
                  id="variant-request"
                  type="text"
                  value={variantRequest}
                  onChange={(event) => setVariantRequest(event.target.value)}
                  placeholder="VD: cần 2m1, máy đứng, độ cứng MH, màu đỏ"
                  className="h-11 w-full rounded-lg border border-slate-700 bg-[#0F172A] px-3 text-sm text-white placeholder:text-slate-500 focus:border-[#FACC15] focus:outline-none"
                />
                <p className="mt-1.5 text-xs text-slate-400">Yêu cầu sẽ được lưu cùng sản phẩm trong giỏ để nhân viên xác nhận chính xác.</p>
              </div>
            </div>
          )}

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
              <span>
                {hasVerifiedVariants
                  ? 'MUA NGAY - THANH TOÁN KHI NHẬN HÀNG (COD)'
                  : 'ĐẶT HÀNG COD - XÁC NHẬN PHÂN LOẠI TRƯỚC KHI GIAO'}
              </span>
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
                    trackAffiliateClick('shopee', shopeeUrl, product.id, displayName, {
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
                  trackAffiliateClick('tiktok', tiktokUrl, product.id, displayName, {
                    placement: 'product_detail',
                    destinationType: 'product',
                  })
                }
                className="min-h-11 px-3 py-2.5 rounded-xl bg-[#0F172A] border border-slate-700 hover:border-slate-500 text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 text-center"
              >
                <span>
                  {product.tiktokLinkStatus === 'verified-product'
                    ? 'Mua qua TikTok Shop'
                    : 'Xem gian hàng TikTok Shop'}
                </span>
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
          {availableTabs.map((tab) => (
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
            <article className="space-y-8">
              <header className="max-w-4xl space-y-3">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#FACC15]">Thông tin sản phẩm</p>
                <h2 className="font-display text-xl font-black leading-tight text-white sm:text-2xl">
                  {displayName}
                </h2>
                <p className="text-sm leading-7 text-slate-300 sm:text-base sm:leading-8">
                  {descriptionLayout.intro}
                </p>
              </header>

              <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
                <div className="space-y-8">
                  <section aria-labelledby="product-highlights">
                    <h3 id="product-highlights" className="mb-4 text-base font-black text-white">Điểm nổi bật</h3>
                    <ul className="grid gap-x-6 gap-y-3 sm:grid-cols-2">
                      {descriptionLayout.highlights.map((highlight) => (
                        <li key={highlight} className="flex items-start gap-2.5 text-sm leading-6 text-slate-300">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                          <span>{highlight}</span>
                        </li>
                      ))}
                    </ul>
                  </section>

                  {descriptionLayout.sections.length > 0 && (
                    <section className="divide-y divide-slate-800 border-y border-slate-800">
                      {descriptionLayout.sections.map((section, index) => (
                        <div key={`${section.title}-${index}`} className="py-5 first:pt-0 last:pb-0">
                          <h3 className="mb-2 text-base font-black text-white">{section.title}</h3>
                          <p className="text-sm leading-7 text-slate-300">{section.body}</p>
                        </div>
                      ))}
                    </section>
                  )}

                  {hasRiggingGuide && (
                    <section className="rounded-xl border-l-4 border-[#FACC15] bg-[#0F172A]/70 px-4 py-4 sm:px-5">
                      <div className="mb-2 flex items-center gap-2">
                        <Wrench className="h-4 w-4 text-[#FACC15]" aria-hidden="true" />
                        <h3 className="text-sm font-black text-white">Hướng dẫn sử dụng nhanh</h3>
                      </div>
                      <p className="text-sm leading-7 text-slate-300">{detail.riggingGuide}</p>
                    </section>
                  )}
                </div>

                <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
                  <section className="overflow-hidden rounded-xl border border-slate-700 bg-[#0F172A]/80">
                    <div className="flex items-center gap-2 border-b border-slate-800 px-4 py-3">
                      <Layers3 className="h-4 w-4 text-[#FACC15]" aria-hidden="true" />
                      <h3 className="text-sm font-black text-white">Thông số nhanh</h3>
                    </div>
                    <dl className="divide-y divide-slate-800 text-xs">
                      {detail.specs.slice(0, 6).map((spec) => (
                        <div key={spec.label} className="grid grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-3 px-4 py-3">
                          <dt className="font-bold text-slate-400">{spec.label}</dt>
                          <dd className="text-right font-semibold text-slate-100">{spec.value}</dd>
                        </div>
                      ))}
                    </dl>
                  </section>

                  <section className="rounded-xl border border-slate-700 bg-[#0F172A]/80 p-4">
                    <h3 className="mb-3 text-sm font-black text-white">Chọn đúng phiên bản</h3>
                    {variantGroups.length > 0 ? (
                      <div className="space-y-3">
                        {variantGroups.slice(0, 3).map((group) => (
                          <div key={group.name}>
                            <p className="mb-1.5 text-xs font-bold text-slate-400">{group.name}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {group.options.slice(0, 8).map((option) => (
                                <span key={option} className="rounded-md border border-slate-700 bg-slate-900 px-2 py-1 text-[11px] font-semibold text-slate-200">
                                  {option}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <ul className="space-y-2 text-xs text-slate-300">
                        {selectionCriteria.slice(0, 5).map((criterion) => (
                          <li key={criterion} className="flex gap-2"><span className="text-[#FACC15]">•</span>{criterion}</li>
                        ))}
                      </ul>
                    )}
                    <p className="mt-3 border-t border-slate-800 pt-3 text-[11px] leading-5 text-slate-400">
                      Chọn phân loại ở khu vực mua hàng phía trên hoặc liên hệ LK Hòa nếu cần đối chiếu cấu hình.
                    </p>
                  </section>
                </aside>
              </div>

              {descriptionLayout.faq.length > 0 && (
                <section className="max-w-4xl border-t border-slate-800 pt-6">
                  <h3 className="mb-3 text-base font-black text-white">Câu hỏi thường gặp</h3>
                  <div className="divide-y divide-slate-800 rounded-xl border border-slate-800 bg-[#0F172A]/50 px-4">
                    {descriptionLayout.faq.map((item, index) => (
                      <details key={item.question} className="group py-4" open={index === 0}>
                        <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-bold text-white">
                          <span>{item.question}</span>
                          <Plus className="h-4 w-4 shrink-0 text-[#FACC15] transition-transform group-open:rotate-45" aria-hidden="true" />
                        </summary>
                        <p className="pt-3 text-sm leading-7 text-slate-300">{item.answer}</p>
                      </details>
                    ))}
                  </div>
                </section>
              )}

              <aside className="rounded-xl border border-emerald-900/70 bg-emerald-950/20 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  <h3 className="text-sm font-black text-white">Mua kèm để hoàn thiện bộ câu</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {complementaryProducts.slice(0, 3).map((item) => (
                    <InternalLink
                      key={item.id}
                      href={`/san-pham/${item.slug}`}
                      onNavigate={() => onNavigate(`/san-pham/${item.slug}`)}
                      className="rounded-lg border border-emerald-800/80 bg-[#0F172A] px-3 py-2 text-xs font-bold text-emerald-300 hover:border-[#FACC15] hover:text-[#FACC15]"
                    >
                      {productDisplayName(item)} · {formatPrice(productPrice(item))}
                    </InternalLink>
                  ))}
                </div>
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs">
                  {complementaryCategories.slice(0, 3).map((category) => (
                    <InternalLink
                      key={category}
                      href={categoryPath(category)}
                      onNavigate={() => onNavigate(categoryPath(category))}
                      className="font-bold text-slate-300 hover:text-[#FACC15]"
                    >
                      Xem toàn bộ {category.toLocaleLowerCase('vi')}
                    </InternalLink>
                  ))}
                </div>
              </aside>

              {relatedGuides.length > 0 && (
                <aside className="rounded-xl border border-slate-800 bg-[#0F172A]/70 p-4">
                  <h3 className="mb-3 text-sm font-black text-white">Hướng dẫn chọn và sử dụng</h3>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {relatedGuides.map((guide) => (
                      <InternalLink
                        key={guide.slug}
                        href={`/cam-nang/${guide.slug}`}
                        onNavigate={() => onNavigate(`/cam-nang/${guide.slug}`)}
                        className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-bold leading-5 text-slate-300 hover:border-[#FACC15] hover:text-[#FACC15]"
                      >
                        {guide.title}
                      </InternalLink>
                    ))}
                  </div>
                </aside>
              )}
            </article>
          )}

          {activeTab === 'specs' && (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-black text-white">
                Bảng thông số và phân loại
              </h2>
              {!hasDetailedSpecs && (
                <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-slate-300">
                  <CircleAlert className="mt-0.5 h-4 w-4 shrink-0 text-[#FACC15]" aria-hidden="true" />
                  <p>
                    Bảng dưới đây mới gồm dữ liệu cơ bản đã xác minh. Kích thước, màu, độ cứng, loại máy và giá theo từng biến thể sẽ chỉ hiển thị khi có nguồn chính thức; website không tự suy đoán thông số.
                  </p>
                </div>
              )}
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
                  {allReviews.length === 0 && (
                    <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 text-sm leading-relaxed text-slate-400">
                      Chưa có đánh giá mua hàng đã xác minh cho sản phẩm này. LK Hòa không hiển thị nhận xét giả hoặc tự tạo số lượt đánh giá.
                    </div>
                  )}
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
                  <h3 className="text-sm font-bold text-white">Ghi chú trải nghiệm trên thiết bị này</h3>
                  <p className="text-xs leading-relaxed text-slate-400">
                    Nội dung này chỉ lưu trên trình duyệt hiện tại và không được gắn nhãn “đã mua hàng”.
                  </p>
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

      {/* Complementary cross-sell products */}
      {complementaryProducts.length > 0 && (
        <section className="space-y-4 rounded-2xl border border-emerald-900/60 bg-emerald-950/10 p-4 sm:p-6">
          <div className="space-y-1">
            <h2 className="font-display text-xl font-black text-white">
              Hoàn Thiện Bộ Câu
            </h2>
            <p className="text-sm text-slate-400">
              Gợi ý mua kèm theo kiểu câu và nhóm trang bị của sản phẩm đang xem.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {complementaryProducts.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                onOpenDetail={onOpenDetail || ((selected) => onNavigate(`/san-pham/${selected.slug}`))}
                onQuickBuy={() => onNavigate('/thanh-toan')}
                placement="product_cross_sell"
              />
            ))}
          </div>
        </section>
      )}

      {/* Similar products */}
      {similarProducts.length > 0 && (
        <section className="space-y-4">
          <h2 className="font-display text-xl font-black text-white">
            So Sánh Thêm Sản Phẩm Cùng Nhóm
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4">
            {similarProducts.map((item) => (
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
          <p className="text-[10px] text-slate-400 truncate">
            {hasVerifiedVariants ? effectiveVariant.label : variantRequest.trim() || 'Xác nhận phân loại trước khi giao'}
          </p>
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
            alt={displayName}
            referrerPolicy="no-referrer"
            className="max-h-[88vh] max-w-full rounded-xl object-contain"
          />
        </div>
      )}
    </div>
  );
}
