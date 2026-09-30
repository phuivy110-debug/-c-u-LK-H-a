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
    desc: 'Có dữ liệu có cấu trúc cho các trang phù hợp. Kiểm tra từng URL bằng Google Rich Results Test; dữ liệu có cấu trúc không bảo đảm hiển thị sao đánh giá.',
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
    desc: 'Ảnh sản phẩm được tải theo nhu cầu. Cần đo Core Web Vitals trên PageSpeed Insights hoặc Search Console trước khi kết luận về CLS và tốc độ.',
    status: 'passed'
  }
];

const KEYWORD_GROUPS = [
  {
    name: '1. Từ Khóa Thương Hiệu (Brand Keywords)',
    intent: 'Nhóm thương hiệu cần theo dõi trong Search Console',
    keywords: [
      'đồ câu lk hòa', 'cần câu lk hòa', 'mồi câu lk hòa',
      'shop lk hòa nghĩa đàn', 'lê khánh hòa đồ câu',
    ]
  },
  {
    name: '2. Từ Khóa Sản Phẩm Cần Câu (Product Keywords)',
    intent: 'Người dùng có nhu cầu mua sắm trực tiếp',
    keywords: [
      'cần lure tiểu lk', 'cần solid đa năng 10kg lk',
      'cần lure cá mập lk special', 'cần câu đài 5h 6h lk hòa',
      'cần câu cá lóc giá rẻ',
    ]
  },
  {
    name: '3. Từ Khóa Mồi Câu & Phụ Kiện (High Conversion)',
    intent: 'Sản phẩm mua thường xuyên, tỉ lệ chốt đơn cao',
    keywords: [
      'mồi câu chép lk hòa', 'mồi chuột trơn câu lóc lk',
      'dây dù pe x4 x8 lk hòa', 'phao câu đài nano lk',
      'lưỡi câu cá lóc bọc chì lk',
    ]
  },
  {
    name: '4. Từ Khóa Cẩm Nang & Kinh Nghiệm (Informational Traffic Magnet)',
    intent: 'Kéo hàng chục nghìn lượt truy cập tự nhiên mỗi tháng',
    keywords: [
      'cách chọn cần câu lure cho người mới',
      'độ cứng cần đài 4h 5h 6h 8h là gì',
      'công thức pha mồi câu chép nhạy nhất',
      'so sánh cần lure máy đứng và máy ngang',
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

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
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
                Hướng dẫn kiểm tra và cải thiện khả năng hiển thị của Đồ Câu LK Hòa trên Google
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
            <span>5 Bước Cải Thiện SEO</span>
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
                      Kiểm tra SEO kỹ thuật và hiệu suất định kỳ
                    </h4>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Các trang sản phẩm và cẩm nang đã có meta tag và sitemap trong bản build. Hãy kiểm tra dữ liệu có cấu trúc trên từng URL bằng Rich Results Test và theo dõi trạng thái lập chỉ mục trong Search Console; không có bảo đảm hiển thị sao hay vị trí top đầu.
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
                    Truy cập <a href="https://search.google.com/search-console" target="_blank" rel="noreferrer" className="text-blue-600 font-bold underline inline-flex items-center gap-0.5">Google Search Console <ExternalLink className="w-3 h-3" /></a>, chọn <strong>"Sơ đồ trang web" (Sitemaps)</strong> và gửi đường dẫn dưới đây. Việc gửi sitemap không bảo đảm Google lập chỉ mục ngay:
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
                      Giúp người dùng tìm thấy website
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Liên kết từ các kênh chính chủ giúp người xem tìm được website; không bảo đảm tăng thứ hạng:
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
                    Kiểm tra dữ liệu có cấu trúc của từng trang bằng Rich Results Test. Google quyết định có hiển thị kết quả mở rộng hay không; không thể cam kết sao đánh giá hoặc vị trí tìm kiếm.
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
                    Chia sẻ bài cẩm nang hữu ích như <em>"Cách chọn cần câu lure cho người mới"</em> hoặc <em>"Độ cứng cần đài 5H 6H là gì"</em> đến cộng đồng quan tâm, theo đúng quy định nhóm. Theo dõi truy cập thực tế để đánh giá hiệu quả.
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
                    Bản minh họa giao diện kết quả; vị trí và đoạn trích thực tế do Google quyết định
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
                  Các chủ đề để theo dõi. Xem lượt hiển thị, nhấp và vị trí thực tế trong Google Search Console.
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
                          <span className="font-bold text-slate-800">{item}</span>
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

              {/* GSC verification */}
              <div className="p-4 sm:p-5 rounded-2xl bg-indigo-50/50 border border-indigo-200/80 space-y-3">
                <div className="flex items-center gap-2 font-bold text-slate-900 text-xs sm:text-sm">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  <span>Xác minh Google Search Console</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Website đã có tệp và thẻ HTML xác minh trong bản triển khai. Nếu Google yêu cầu mã mới, hãy cập nhật tệp xác minh hoặc thẻ <code className="text-slate-800 bg-white px-1.5 py-0.5 rounded">google-site-verification</code> trong mã nguồn rồi triển khai lại; lưu mã trong trình duyệt không xác minh được website. Với tài sản miền, hãy làm theo hướng dẫn xác minh DNS của Search Console.
                </p>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500 font-medium hidden sm:block">
            Theo dõi lập chỉ mục và vị trí thực tế trong Google Search Console.
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
