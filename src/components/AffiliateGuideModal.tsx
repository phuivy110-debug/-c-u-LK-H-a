import React, { useState } from 'react';
import { Product } from '../types';
import { X, Code, FileCode, Copy, Save, HelpCircle, Check, ExternalLink, RefreshCw, FileSpreadsheet, Image as ImageIcon, Sparkles, Loader2 } from 'lucide-react';
import { extractShopeeImageFromLink } from '../utils/googleSheetSync';

interface AffiliateGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (newProducts: Product[]) => void;
  onResetDefault: () => void;
  sheetUrl: string;
  onUpdateSheetUrl: (newUrl: string) => void;
  onTriggerSync: () => void;
  isSyncing: boolean;
  lastSyncTime: string | null;
}

export const AffiliateGuideModal: React.FC<AffiliateGuideModalProps> = ({
  isOpen,
  onClose,
  products,
  onUpdateProducts,
  onResetDefault,
  sheetUrl,
  onUpdateSheetUrl,
  onTriggerSync,
  isSyncing,
  lastSyncTime,
}) => {
  const [activeTab, setActiveTab] = useState<'sheet' | 'editor' | 'guide'>('sheet');
  const [editingProducts, setEditingProducts] = useState<Product[]>(products);
  const [inputSheetUrl, setInputSheetUrl] = useState<string>(sheetUrl);
  const [copiedTs, setCopiedTs] = useState(false);
  const [loadingExtractId, setLoadingExtractId] = useState<string | null>(null);
  const [isBatchExtracting, setIsBatchExtracting] = useState(false);

  const handleExtractSingleImage = async (id: string, url: string) => {
    if (!url) return;
    setLoadingExtractId(id);
    const extracted = await extractShopeeImageFromLink(url);
    if (extracted) {
      setEditingProducts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, image: extracted } : p))
      );
    }
    setLoadingExtractId(null);
  };

  const handleExtractAllImages = async () => {
    setIsBatchExtracting(true);
    for (const p of editingProducts) {
      if (p.affiliateUrl && (p.affiliateUrl.includes('shopee') || p.affiliateUrl.includes('shope.ee'))) {
        const extracted = await extractShopeeImageFromLink(p.affiliateUrl);
        if (extracted) {
          setEditingProducts((prev) =>
            prev.map((item) => (item.id === p.id ? { ...item, image: extracted } : item))
          );
        }
      }
    }
    setIsBatchExtracting(false);
  };

  if (!isOpen) return null;

  const handleLinkChange = (id: string, newUrl: string) => {
    const updated = editingProducts.map((p) =>
      p.id === id ? { ...p, affiliateUrl: newUrl } : p
    );
    setEditingProducts(updated);
  };

  const handlePriceChange = (id: string, field: 'originalPrice' | 'dealPrice', val: number) => {
    const updated = editingProducts.map((p) => {
      if (p.id === id) {
        const orig = field === 'originalPrice' ? val : p.originalPrice;
        const deal = field === 'dealPrice' ? val : p.dealPrice;
        const percent = orig > 0 ? Math.round(((orig - deal) / orig) * 100) : 0;
        return {
          ...p,
          [field]: val,
          discountPercent: Math.max(0, percent),
        };
      }
      return p;
    });
    setEditingProducts(updated);
  };

  const handleTitleChange = (id: string, val: string) => {
    const updated = editingProducts.map((p) =>
      p.id === id ? { ...p, title: val } : p
    );
    setEditingProducts(updated);
  };

  const handleSaveLive = () => {
    onUpdateProducts(editingProducts);
    onClose();
  };

  const generateTsFileContent = () => {
    return `// Copy toàn bộ nội dung này dán vào file src/data/products.ts
import { Product } from '../types';

export const INITIAL_PRODUCTS: Product[] = ${JSON.stringify(editingProducts, null, 2)};
`;
  };

  const handleCopyTsCode = () => {
    navigator.clipboard.writeText(generateTsFileContent());
    setCopiedTs(true);
    setTimeout(() => setCopiedTs(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Bar */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#EE4D2D] flex items-center justify-center font-bold">
              <Code className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Quản Lý & Chỉnh Sửa Link Affiliate</h2>
              <p className="text-xs text-slate-400">Thay đổi link Shopee trực tiếp hoặc xuất mã file data</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tab Headers */}
        <div className="bg-slate-100 px-6 pt-3 border-b border-slate-200 flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={() => setActiveTab('sheet')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'sheet'
                ? 'bg-white text-[#EE4D2D] border-t-2 border-[#EE4D2D] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileSpreadsheet className="w-4 h-4 text-[#EE4D2D]" />
            <span>Đồng Bộ Google Sheet</span>
            <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              Tự động
            </span>
          </button>
          <button
            onClick={() => setActiveTab('editor')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'editor'
                ? 'bg-white text-[#EE4D2D] border-t-2 border-[#EE4D2D] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <FileCode className="w-4 h-4" />
            <span>Chỉnh Sửa Trực Tiếp ({editingProducts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors cursor-pointer ${
              activeTab === 'guide'
                ? 'bg-white text-[#EE4D2D] border-t-2 border-[#EE4D2D] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>Hướng Dẫn File Code</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {activeTab === 'sheet' ? (
            <div className="space-y-5">
              <div className="bg-emerald-50 border border-emerald-200/80 rounded-2xl p-4 text-emerald-900 text-xs sm:text-sm space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-950">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
                  <span>Website Tự Động Đọc Dữ Liệu Từ Google Sheet Đã Xuất Bản</span>
                </div>
                <p className="text-emerald-800 text-xs leading-relaxed">
                  Khi bạn thay đổi, thêm bớt sản phẩm hoặc cập nhật giá trong file Google Sheet, website sẽ tự động tải danh sách mới nhất về mà không cần sửa code hay rebuild app.
                </p>
                {lastSyncTime && (
                  <div className="text-[11px] font-semibold text-emerald-700 pt-1 border-t border-emerald-200/60 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Lần đồng bộ thành công gần nhất: <strong>{lastSyncTime}</strong> ({products.length} sản phẩm)</span>
                  </div>
                )}
              </div>

              {/* Sheet URL Field & Sync Button */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
                <label className="block text-xs font-bold text-slate-700">
                  Đường dẫn Google Sheet (Đã xuất bản Web):
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    type="text"
                    value={inputSheetUrl}
                    onChange={(e) => setInputSheetUrl(e.target.value)}
                    placeholder="https://docs.google.com/spreadsheets/d/e/.../pubhtml..."
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:border-[#EE4D2D] focus:outline-hidden"
                  />
                  <button
                    onClick={() => {
                      onUpdateSheetUrl(inputSheetUrl);
                      onTriggerSync();
                    }}
                    disabled={isSyncing}
                    className="bg-[#EE4D2D] hover:bg-orange-600 disabled:bg-slate-400 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? 'Đang tải sheet...' : 'Lưu & Đồng Bộ Ngay'}</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Hỗ trợ định dạng link <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">/pubhtml</code> hoặc <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">/pub?output=csv</code>
                </p>
              </div>

              {/* Data Sample Preview */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Xem Trước {products.length} Sản Phẩm Từ Sheet Hiện Tại:
                </h4>
                <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl bg-white divide-y divide-slate-100 text-xs">
                  {products.slice(0, 10).map((p, idx) => (
                    <div key={p.id} className="p-3 flex items-center justify-between gap-3 hover:bg-slate-50">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-bold text-slate-400 w-5 text-right">{idx + 1}.</span>
                        <img src={p.image} alt="" className="w-8 h-8 rounded-lg object-cover bg-slate-100 shrink-0" />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-800 truncate">{p.title}</div>
                          <div className="text-[11px] text-slate-400 font-mono truncate">{p.affiliateUrl}</div>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-extrabold text-[#EE4D2D]">{p.dealPrice.toLocaleString('vi-VN')}đ</div>
                        <div className="text-[10px] text-slate-400 bg-orange-50 px-1.5 py-0.2 rounded inline-block">{p.category}</div>
                      </div>
                    </div>
                  ))}
                  {products.length > 10 && (
                    <div className="p-3 text-center text-xs text-slate-400 font-medium bg-slate-50">
                      ... và {products.length - 10} sản phẩm khác từ Google Sheet.
                    </div>
                  )}
                </div>
              </div>

            </div>
          ) : activeTab === 'editor' ? (
            <div className="space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 font-medium flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Hệ thống hỗ trợ lấy ảnh trực tiếp từ Link Shopee!</span>
                    <p className="text-[11px] text-amber-800 mt-0.5">
                      Dán link affiliate Shopee và bấm nút <strong>"Lấy ảnh từ link"</strong> bên dưới để tự động tải hình ảnh sản phẩm thực tế từ Shopee.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleExtractAllImages}
                  disabled={isBatchExtracting}
                  className="bg-[#EE4D2D] hover:bg-orange-600 disabled:bg-slate-400 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  {isBatchExtracting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  <span>{isBatchExtracting ? 'Đang tự lấy ảnh...' : '⚡ Trích xuất ảnh tất cả SP'}</span>
                </button>
              </div>

              {/* Product Table / Cards Editor */}
              <div className="space-y-3">
                {editingProducts.map((p, index) => (
                  <div
                    key={p.id}
                    className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 hover:border-orange-300 transition-colors"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                      <div className="flex items-center gap-2">
                        <img
                          src={p.image}
                          alt=""
                          referrerPolicy="no-referrer"
                          className="w-7 h-7 rounded-lg object-cover bg-slate-200 border border-slate-300"
                        />
                        <span>Sản phẩm #{index + 1} ({p.id})</span>
                      </div>
                      <span className="bg-orange-100 text-[#EE4D2D] px-2 py-0.5 rounded text-[11px]">
                        {p.shopName}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      {/* Title */}
                      <div className="md:col-span-4">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1">
                          Tên Sản Phẩm:
                        </label>
                        <input
                          type="text"
                          value={p.title}
                          onChange={(e) => handleTitleChange(p.id, e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold focus:border-[#EE4D2D] focus:outline-hidden"
                        />
                      </div>

                      {/* Prices */}
                      <div className="md:col-span-3 grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Giá gốc (đ):
                          </label>
                          <input
                            type="number"
                            value={p.originalPrice}
                            onChange={(e) =>
                              handlePriceChange(p.id, 'originalPrice', Number(e.target.value))
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-semibold focus:border-[#EE4D2D] focus:outline-hidden"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 mb-1">
                            Giá ưu đãi (đ):
                          </label>
                          <input
                            type="number"
                            value={p.dealPrice}
                            onChange={(e) =>
                              handlePriceChange(p.id, 'dealPrice', Number(e.target.value))
                            }
                            className="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-bold text-[#EE4D2D] focus:border-[#EE4D2D] focus:outline-hidden"
                          />
                        </div>
                      </div>

                      {/* Affiliate Link Input & Extract Button */}
                      <div className="md:col-span-5">
                        <label className="block text-[11px] font-bold text-slate-600 mb-1 flex items-center justify-between">
                          <span className="flex items-center gap-1">
                            <ExternalLink className="w-3 h-3 text-[#EE4D2D]" />
                            Link Affiliate Shopee:
                          </span>
                          <button
                            onClick={() => handleExtractSingleImage(p.id, p.affiliateUrl)}
                            disabled={loadingExtractId === p.id}
                            className="text-[#EE4D2D] hover:underline text-[10px] font-extrabold flex items-center gap-0.5 cursor-pointer disabled:opacity-50"
                          >
                            {loadingExtractId === p.id ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <Sparkles className="w-3 h-3" />
                            )}
                            <span>{loadingExtractId === p.id ? 'Đang tải...' : 'Lấy ảnh từ link'}</span>
                          </button>
                        </label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={p.affiliateUrl}
                            onChange={(e) => handleLinkChange(p.id, e.target.value)}
                            placeholder="https://shope.ee/..."
                            className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-800 focus:border-[#EE4D2D] focus:outline-hidden"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Image URL row */}
                    <div className="pt-2 border-t border-slate-200/60 flex items-center gap-2">
                      <ImageIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] font-bold text-slate-500 shrink-0">Link ảnh hiện tại:</span>
                      <input
                        type="text"
                        value={p.image}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingProducts((prev) =>
                            prev.map((item) => (item.id === p.id ? { ...item, image: val } : item))
                          );
                        }}
                        placeholder="https://down-vn.img.susercontent.com/file/..."
                        className="flex-1 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-[11px] font-mono text-slate-700 focus:border-[#EE4D2D] focus:outline-hidden"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-slate-700 text-sm leading-relaxed">
              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-blue-900">
                <h4 className="font-extrabold text-base mb-1">Cách Chỉnh Sửa File Code</h4>
                <p className="text-xs">
                  Mọi sản phẩm và link affiliate được định nghĩa tập trung tại file:
                  <code className="bg-blue-100 px-2 py-0.5 rounded font-mono font-bold text-blue-950 ml-1">
                    src/data/products.ts
                  </code>
                </p>
              </div>

              <ol className="list-decimal list-inside space-y-2 text-xs font-medium bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <li>Mở file <code className="font-mono bg-slate-200 px-1.5 py-0.5 rounded">src/data/products.ts</code> trong code editor.</li>
                <li>Tìm sản phẩm bạn muốn sửa thông tin (ví dụ: <code className="font-mono">affiliateUrl</code>).</li>
                <li>Thay thế đường link Shopee cũ bằng link affiliate cá nhân của bạn.</li>
                <li>Lưu file, giao diện sẽ tự động cập nhật lại toàn bộ danh mục!</li>
              </ol>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">
                    Mã nguồn file <code className="font-mono text-[#EE4D2D]">products.ts</code> hiện tại:
                  </span>
                  <button
                    onClick={handleCopyTsCode}
                    className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    {copiedTs ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedTs ? 'Đã sao chép!' : 'Sao Chép TypeScript Code'}</span>
                  </button>
                </div>
                <pre className="bg-slate-900 text-slate-200 text-xs p-4 rounded-2xl overflow-x-auto max-h-60 font-mono">
                  {generateTsFileContent()}
                </pre>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-between shrink-0">
          <button
            onClick={onResetDefault}
            className="text-xs font-bold text-slate-500 hover:text-slate-800 underline cursor-pointer"
          >
            Khôi phục mẫu mặc định
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              Hủy
            </button>
            <button
              onClick={handleSaveLive}
              className="bg-[#EE4D2D] hover:bg-orange-600 text-white font-extrabold text-xs sm:text-sm px-6 py-2.5 rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
            >
              <Save className="w-4 h-4" />
              <span>Lưu Thay Đổi Ngay</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
