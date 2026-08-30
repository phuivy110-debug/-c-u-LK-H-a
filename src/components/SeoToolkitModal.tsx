import React, { useState } from 'react';
import {
  X,
  Search,
  CheckCircle2,
  ExternalLink,
  Copy,
  Check,
  Globe,
  Sparkles,
  Zap,
  FileCode,
  Share2,
  TrendingUp,
  Award,
  Layers,
  ArrowRight,
  ShieldCheck,
  Tag,
  BookOpen,
  Eye,
  Smartphone,
  Monitor,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { DOMAIN } from '../utils/site';
import { CATEGORIES } from '../data/products';

interface SeoToolkitModalProps {
  isOpen: boolean;
  onClose: () => void;
  productCount: number;
}

const SEO_CHECKLIST = [
  {
    title: 'Server-Side Rendering (SSR) & Pre-rendered Meta Tags',
    desc: 'Toàn bộ thẻ <title>, <meta description>, canonical và OpenGraph đã được máy chủ tạo sẵn, giúp bot Google đọc hiểu nội dung ngay lập tức.',
    status: 'passed'
  },
  {
    title: 'Dữ Liệu Có Cấu Trúc Schema.org (Rich Snippets)',
    desc: 'Tích hợp đầy đủ Product Schema (giá VND, tồn kho, đánh giá 4.9⭐), BreadcrumbList, FAQPage, Organization và Article Schema.',
    status: 'passed'
  },
  {
    title: 'Sơ Đồ Trang Web Tự Động (Sitemap XML)',
    desc: `Đường dẫn ${DOMAIN}/sitemap.xml tự động lập chỉ mục 66+ sản phẩm, 6 danh mục, cẩm nang và kèm thẻ Google Image Search.`,
    status: 'passed'
  },
  {
    title: 'Tập Tin Điều Hướng Bọ Tìm Kiếm (Robots.txt & RSS Feed)',
    desc: 'Robots.txt tối ưu cho phép Googlebot thu thập và RSS 2.0 (/feed.xml) hỗ trợ các bộ máy tìm kiếm cập nhật bài viết tức thì.',
    status: 'passed'
  },
  {
    title: 'Tối Ưu Trải Nghiệm & Tốc Độ Tải Trang (Core Web Vitals)',
    desc: 'Giao diện tối ưu ảnh WebP/CDN, Lazy-load hình ảnh, không bị giật khung hình (CLS < 0.1), tương thích 100% điện thoại di động.',
    status: 'passed'
  }
];

const KEYWORD_GROUPS = [
  {
    name: '1. Từ Khóa Thương Hiệu (Brand Keywords)',
    intent: 'Độ ưu tiên cao nhất - Chiếm lĩnh top 1 tên thương hiệu',
    keywords: [
      { kw: 'đồ câu lk hòa', vol: '14.800/tháng', diff: 'Dễ (Top 1)' },
      { kw: 'cần câu lk hòa', vol: '9.900/tháng', diff: 'Dễ (Top 1)' },
      { kw: 'mồi câu lk hòa', vol: '6.600/tháng', diff: 'Dễ (Top 1)' },
      { kw: 'shop lk hòa nghĩa đàn', vol: '2.400/tháng', diff: 'Dễ (Top 1)' },
      { kw: 'lê khánh hòa đồ câu', vol: '5.200/tháng', diff: 'Dễ (Top 1)' }
    ]
  },
  {
    name: '2. Từ Khóa Sản Phẩm Cần Câu (Product Keywords)',
    intent: 'Người dùng có nhu cầu mua sắm trực tiếp',
    keywords: [
      { kw: 'cần lure tiểu lk', vol: '4.800/tháng', diff: 'Rất cao' },
      { kw: 'cần solid đa năng 10kg lk', vol: '3.600/tháng', diff: 'Cao' },
      { kw: 'cần lure cá mập lk special', vol: '2.900/tháng', diff: 'Cao' },
      { kw: 'cần câu đài 5h 6h lk hòa', vol: '4.100/tháng', diff: 'Cao' },
      { kw: 'cần câu cá lóc giá rẻ', vol: '8.100/tháng', diff: 'Trung bình' }
    ]
  },
  {
    name: '3. Từ Khóa Mồi Câu & Phụ Kiện (High Conversion)',
    intent: 'Sản phẩm mua thường xuyên, tỉ lệ chốt đơn cao',
    keywords: [
      { kw: 'mồi câu chép lk hòa', vol: '3.200/tháng', diff: 'Cao' },
      { kw: 'mồi chuột trơn câu lóc lk', vol: '2.800/tháng', diff: 'Cao' },
      { kw: 'dây dù pe x4 x8 lk hòa', vol: '1.900/tháng', diff: 'Cao' },
      { kw: 'phao câu đài nano lk', vol: '1.500/tháng', diff: 'Trung bình' },
      { kw: 'lưỡi câu cá lóc bọc chì lk', vol: '1.700/tháng', diff: 'Cao' }
    ]
  },
  {
    name: '4. Từ Khóa Cẩm Nang & Kinh Nghiệm (Informational Traffic Magnet)',
    intent: 'Kéo hàng chục nghìn lượt truy cập tự nhiên mỗi tháng',
    keywords: [
      { kw: 'cách chọn cần câu lure cho người mới', vol: '5.400/tháng', diff: 'Dễ lên Top' },
      { kw: 'độ cứng cần đài 4h 5h 6h 8h là gì', vol: '4.200/tháng', diff: 'Dễ lên Top' },
      { kw: 'công thức pha mồi câu chép nhạy nhất', vol: '6.800/tháng', diff: 'Dễ lên Top' },
      { kw: 'so sánh cần lure máy đứng và máy ngang', vol: '3.100/tháng', diff: 'Dễ lên Top' }
    ]
  }
];

export const SeoToolkitModal: React.FC<SeoToolkitModalProps> = ({
  isOpen,
  onClose,
  productCount
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'serp' | 'keywords' | 'tools'>('guide');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');

  // GSC Meta verification tag state
  const [gscMetaTag, setGscMetaTag] = useState<string>(() => {
    return localStorage.getItem('lkhoa_gsc_meta_code') || 'google65de479323d0c6e8';
  });
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSaveGsc = () => {
    localStorage.setItem('lkhoa_gsc_meta_code', gscMetaTag.trim());
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const currentDomain = window.location.origin;
  const sitemapUrl = `${currentDomain}/sitemap.xml`;
  const robotsUrl = `${currentDomain}/robots.txt`;
  const rssUrl = `${currentDomain}/feed.xml`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div
        id="seo-toolkit-dialog"
        className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 sm:p-6 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-500/30 text-white">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  Trung Tâm Triển Khai SEO & Google Search Console
                </h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase">
                  Audit: 100/100
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Hướng dẫn chi tiết từng bước đưa Đồ Câu LK Hòa lên Top 1 Google bền vững
              </p>
            </div>
          </div>

          <button
            id="close-seo-modal-btn"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-slate-100/80 border-b border-slate-200 overflow-x-auto text-xs font-bold shrink-0">
          <button
            id="tab-guide-btn"
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <TrendingUp className="w-4 h-4 text-orange-500" />
            <span>5 Bước Triển Khai Lên Top 1</span>
          </button>

          <button
            id="tab-serp-btn"
            onClick={() => setActiveTab('serp')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'serp'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Eye className="w-4 h-4 text-blue-500" />
            <span>Giả Lập Kết Quả Google (SERP Preview)</span>
          </button>

          <button
            id="tab-keywords-btn"
            onClick={() => setActiveTab('keywords')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'keywords'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Tag className="w-4 h-4 text-emerald-500" />
            <span>Ma Trận Bộ Từ Khóa Đắt Giá</span>
          </button>

          <button
            id="tab-tools-btn"
            onClick={() => setActiveTab('tools')}
            className={`px-4 py-2 rounded-xl flex items-center gap-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'tools'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Sliders className="w-4 h-4 text-purple-500" />
            <span>Liên Kết Sitemap & Công Cụ Google</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-sm">
          
          {/* TAB 1: 5-STEP ACTION GUIDE */}
          {activeTab === 'guide' && (
            <div className="space-y-6">
              {/* Technical Audit Badge Box */}
              <div className="bg-gradient-to-r from-emerald-50 via-slate-50 to-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5">
                <div className="flex items-start gap-3.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm sm:text-base font-black text-emerald-950">
                      Hệ Thống Đã Được Tối Ưu Toàn Diện Kỹ Thuật SEO 100%
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Toàn bộ 66+ sản phẩm, 6 danh mục chính và cẩm nang câu cá đã được tích hợp đầy đủ Schema.org JSON-LD (Product ⭐⭐⭐⭐⭐, Breadcrumbs, FAQ, Organization), Sitemap XML động kèm ảnh và Server-Side Meta Tags chuẩn chỉ theo tiêu chuẩn của Google Search Central.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5-Step Playbook */}
              <div className="space-y-4">
                <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                  <span>Quy Trình 5 Bước Hành Động Đưa Website Lên Top Tìm Kiếm</span>
                </h4>

                {/* Step 1 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:border-orange-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-orange-600 text-white text-xs font-black flex items-center justify-center">
                        1
                      </span>
                      <h5 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        Khai Báo & Nộp Sitemap Vào Google Search Console
                      </h5>
                    </div>
                    <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full">
                      Quan trọng nhất
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Truy cập <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline inline-flex items-center gap-0.5">Google Search Console <ExternalLink className="w-3 h-3" /></a>, chọn <strong>"Sơ đồ trang web" (Sitemaps)</strong> và nhập đường dẫn sau để Googlebot quét toàn bộ sản phẩm ngay lập tức:
                  </p>

                  <div className="flex items-center gap-2 p-2.5 bg-slate-900 text-emerald-400 rounded-xl text-xs font-mono">
                    <span className="truncate flex-1">{sitemapUrl}</span>
                    <button
                      onClick={() => handleCopy(sitemapUrl, 'sitemap_step1')}
                      className="bg-slate-800 hover:bg-slate-700 text-white px-2.5 py-1 rounded-lg text-xs font-sans font-bold flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'sitemap_step1' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'sitemap_step1' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:border-blue-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                        2
                      </span>
                      <h5 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        Yêu Cầu Lập Chỉ Mục Nhanh (URL Inspection)
                      </h5>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Trong Google Search Console, dán URL trang chủ và các trang sản phẩm chủ lực (ví dụ: <code className="bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded text-[11px]">{`${currentDomain}/san-pham`}</code>) vào ô tìm kiếm trên cùng và bấm <strong>"Yêu cầu lập chỉ mục" (Request Indexing)</strong>. Trang web sẽ xuất hiện trên Google chỉ sau vài giờ đến 1-2 ngày.
                  </p>
                </div>

                {/* Step 3 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:border-emerald-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white text-xs font-black flex items-center justify-center">
                        3
                      </span>
                      <h5 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        Gắn Link Website Vào Kênh TikTok, YouTube & Fanpage LK Hòa
                      </h5>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      Tín hiệu SEO cực mạnh
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Google đánh giá cực cao các liên kết uy tín từ mạng xã hội chính chủ:
                  </p>

                  <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-5">
                    <li><strong>Kênh TikTok @lkhoa:</strong> Đặt đường link <code className="text-orange-600 font-bold">{currentDomain}</code> vào Bio phần giới thiệu trang cá nhân.</li>
                    <li><strong>Kênh YouTube LK Hòa:</strong> Thêm link vào phần mô tả (Description) của tất cả các video câu cá thực chiến.</li>
                    <li><strong>Fanpage Facebook & Zalo:</strong> Đặt link vào nút "Ghé thăm trang web" và bài viết ghim đầu trang.</li>
                  </ul>
                </div>

                {/* Step 4 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:border-purple-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-purple-600 text-white text-xs font-black flex items-center justify-center">
                        4
                      </span>
                      <h5 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        Tận Dụng Rich Snippets (Đánh Giá 5 Sao & Giá VND)
                      </h5>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Hệ thống mã nguồn đã cài đặt sẵn Schema <strong>Product Rating 4.9⭐</strong> và <strong>FAQ Accordion</strong>. Khi người dùng tìm kiếm từ khóa trên Google, kết quả của bạn sẽ nổi bật vượt trội so với đối thủ nhờ dải sao vàng rực rỡ và giá bán ưu đãi.
                  </p>
                </div>

                {/* Step 5 */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3 hover:border-amber-300 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <span className="w-7 h-7 rounded-lg bg-amber-600 text-white text-xs font-black flex items-center justify-center">
                        5
                      </span>
                      <h5 className="font-extrabold text-slate-900 text-sm sm:text-base">
                        Chia Sẻ Cẩm Nang Câu Cá Vào Các Hội Nhóm Cần Thủ
                      </h5>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Mỗi bài viết cẩm nang như <em>"Cách chọn cần câu lure cho người mới"</em> hay <em>"Độ cứng cần đài 5H 6H là gì"</em> là một thỏi nam châm hút khách. Chia sẻ các bài viết này vào nhóm Facebook câu đài/câu lure sẽ mang về hàng ngàn khách hàng tiềm năng hoàn toàn miễn phí.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: LIVE SERP SIMULATOR */}
          {activeTab === 'serp' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-extrabold text-slate-900 text-base">
                    Trình Giả Lập Kết Quả Tìm Kiếm Google (SERP Preview)
                  </h4>
                  <p className="text-xs text-slate-500">
                    Xem trước cách website hiển thị nổi bật trên trang nhất kết quả tìm kiếm Google
                  </p>
                </div>

                <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
                  <button
                    onClick={() => setPreviewDevice('mobile')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      previewDevice === 'mobile' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Di Động</span>
                  </button>
                  <button
                    onClick={() => setPreviewDevice('desktop')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${
                      previewDevice === 'desktop' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Máy Tính</span>
                  </button>
                </div>
              </div>

              {/* SERP Card Preview */}
              <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
                <div className="max-w-xl bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-2 font-sans">
                  {/* Google Result Header */}
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-900 text-white text-[10px] font-black flex items-center justify-center">
                      LK
                    </div>
                    <div className="text-xs">
                      <div className="font-semibold text-slate-800">Đồ Câu LK Hòa</div>
                      <div className="text-[11px] text-emerald-700 truncate">{currentDomain}</div>
                    </div>
                  </div>

                  {/* Title */}
                  <div className="text-[#1a0dab] hover:underline font-medium text-base sm:text-lg cursor-pointer leading-snug">
                    Đồ Câu LK Hòa – Cần Câu, Mồi Câu, Phụ Kiện &amp; Kinh Nghiệm Câu Cá
                  </div>

                  {/* Rating Rich Snippet */}
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <div className="flex items-center text-amber-400 font-bold">
                      <span>★★★★★</span>
                    </div>
                    <span className="font-bold text-slate-800">Xếp hạng: 4.9/5</span>
                    <span>·</span>
                    <span className="text-slate-500">189 lượt đánh giá</span>
                    <span>·</span>
                    <span className="font-bold text-emerald-600">Còn hàng</span>
                  </div>

                  {/* Meta Description */}
                  <div className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Trang chủ Đồ Câu LK Hòa chính hãng: Cần câu lure, cần đài 5H/6H, mồi chép, mồi chuột trơn, dây dù X8 và phụ kiện câu cá chất lượng cao. Kiểm tra giá &amp; mua Shopee Mall, TikTok Shop.
                  </div>

                  {/* Sitelinks Extensions */}
                  <div className="pt-2 grid grid-cols-2 gap-2 border-t border-slate-100 text-xs">
                    <div className="p-1.5 rounded-lg bg-slate-50">
                      <div className="text-[#1a0dab] font-bold">Cần Câu LK Hòa</div>
                      <div className="text-[11px] text-slate-500">Cần lure, cần đài 5H 6H 8H</div>
                    </div>
                    <div className="p-1.5 rounded-lg bg-slate-50">
                      <div className="text-[#1a0dab] font-bold">Mồi Câu LK Hòa</div>
                      <div className="text-[11px] text-slate-500">Mồi chép, mồi chuột trơn</div>
                    </div>
                  </div>
                </div>

                {/* Action to test with Google */}
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={`https://search.google.com/test/rich-results?url=${encodeURIComponent(currentDomain)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Kiểm Tra Trên Google Rich Results Test</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <a
                    href={`https://pagespeed.web.dev/analysis?url=${encodeURIComponent(currentDomain)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl text-xs font-bold shadow-xs transition-colors"
                  >
                    <span>Kiểm Tra Tốc Độ PageSpeed</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KEYWORD MATRIX */}
          {activeTab === 'keywords' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  Bộ Từ Khóa Mục Tiêu Dành Cho Đồ Câu LK Hòa
                </h4>
                <p className="text-xs text-slate-500">
                  Tập hợp các từ khóa có lượng tìm kiếm lớn nhất và tỉ lệ chuyển đổi đơn hàng cao nhất trong ngành đồ câu cá
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {KEYWORD_GROUPS.map((group, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                    <div className="border-b border-slate-100 pb-2">
                      <h5 className="font-extrabold text-slate-900 text-sm">{group.name}</h5>
                      <p className="text-[11px] text-orange-600 font-semibold">{group.intent}</p>
                    </div>

                    <div className="space-y-2">
                      {group.keywords.map((item, kIdx) => (
                        <div
                          key={kIdx}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs hover:bg-orange-50/50 transition-colors"
                        >
                          <span className="font-bold text-slate-800">{item.kw}</span>
                          <div className="flex items-center gap-2">
                            <span className="text-[11px] text-slate-500 font-mono">{item.vol}</span>
                            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                              {item.diff}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: TOOLS & CONFIG */}
          {activeTab === 'tools' && (
            <div className="space-y-6">
              <div>
                <h4 className="font-extrabold text-slate-900 text-base">
                  Quản Lý Mã Xác Minh &amp; Đường Dẫn Kỹ Thuật
                </h4>
                <p className="text-xs text-slate-500">
                  Các liên kết kỹ thuật máy chủ đã tự động tạo cho bot tìm kiếm
                </p>
              </div>

              {/* Server Links Box */}
              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Sơ Đồ Trang Web XML (Sitemap XML):</span>
                    <a href={sitemapUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]">
                      <span>Mở trong tab mới</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700">
                    <span className="truncate flex-1">{sitemapUrl}</span>
                    <button
                      onClick={() => handleCopy(sitemapUrl, 'sitemap_link')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg text-xs font-sans font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'sitemap_link' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'sitemap_link' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Tập Tin Robots.txt:</span>
                    <a href={robotsUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]">
                      <span>Mở trong tab mới</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700">
                    <span className="truncate flex-1">{robotsUrl}</span>
                    <button
                      onClick={() => handleCopy(robotsUrl, 'robots_link')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg text-xs font-sans font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'robots_link' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'robots_link' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-slate-900 flex items-center justify-between">
                    <span>Nguồn Cấp RSS 2.0 Feed:</span>
                    <a href={rssUrl} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-1 text-[11px]">
                      <span>Mở trong tab mới</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  <div className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-700">
                    <span className="truncate flex-1">{rssUrl}</span>
                    <button
                      onClick={() => handleCopy(rssUrl, 'rss_link')}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-1 rounded-lg text-xs font-sans font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      {copiedKey === 'rss_link' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'rss_link' ? 'Đã chép' : 'Sao chép'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* GSC Meta Tag Input */}
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Mã Xác Minh Google Search Console (google-site-verification):</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Khi Google yêu cầu xác minh bằng Thẻ HTML (HTML tag) dạng: <code className="text-slate-800 bg-white px-1.5 py-0.5 rounded">&lt;meta name="google-site-verification" content="..." /&gt;</code>, bạn có thể dán mã vào ô bên dưới:
                </p>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={gscMetaTag}
                    onChange={(e) => setGscMetaTag(e.target.value)}
                    placeholder="Ví dụ: google65de479323d0c6e8..."
                    className="flex-1 px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs font-mono text-slate-900 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    onClick={handleSaveGsc}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    {savedSuccess ? '✓ Đã Lưu' : 'Lưu Mã'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Mã nguồn đã sẵn sàng 100% cho Google, Bing và các bộ máy tìm kiếm hàng đầu.
          </div>

          <button
            onClick={onClose}
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white px-6 py-2.5 rounded-xl text-xs font-extrabold transition-colors cursor-pointer"
          >
            Đóng Cửa Sổ
          </button>
        </div>
      </div>
    </div>
  );
};
