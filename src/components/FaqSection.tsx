import React, { useState } from 'react';
import { HelpCircle, ChevronDown, ShieldCheck, Sparkles, ShoppingBag } from 'lucide-react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: 'Làm thế nào để lấy mã giảm giá Đồ Câu LK Hòa giá hời nhất?',
    answer: 'Bạn chỉ cần chọn sản phẩm cần mua trên trang chủ Đồ Câu LK Hòa. Hệ thống sẽ tự động cập nhật các mã giảm giá, mã miễn phí vận chuyển Extra từ Shopee Mall & TikTok Shop. Bấm nút "Shopee" hoặc "TikTok" để mở trực tiếp ứng dụng mua hàng với giá ưu đãi đã áp mã.'
  },
  {
    question: 'Sản phẩm tại Đồ Câu LK Hòa có đảm bảo chính hãng 100% không?',
    answer: 'Cam kết 100% tất cả sản phẩm cần câu, máy câu, mồi câu, phao đài và phụ kiện đều dẫn trực tiếp đến Cửa Hàng Chính Thức (Shopee Mall & TikTok Shop Official) của LK Hòa. Hàng nguyên tem mác, đầy đủ giấy tờ bảo hành chính hãng.'
  },
  {
    question: 'Chính sách bảo hành lóng cần và đổi trả tại LK Hòa như thế nào?',
    answer: 'Tất cả cần câu carbon LK Hòa mua trực tiếp từ hệ thống chính hãng đều được hưởng chính sách bảo hành lóng miễn phí hoặc hỗ trợ lóng thay thế chính hãng 100%. Nếu sản phẩm gặp lỗi do nhà sản xuất hoặc hư hỏng trong quá trình vận chuyển, bạn được đổi trả 1 đổi 1 nhanh chóng qua gian hàng Shopee/TikTok Shop.'
  },
  {
    question: 'Nếu lỡ nhịp Livestream không lấy kịp mã thì sao?',
    answer: 'Đừng lo lắng! Website này là nơi lưu trữ và cập nhật liên tục các mã deal hot kể cả khi buổi Livestream đã kết thúc. Bạn luôn có thể truy cập vào đây bất cứ lúc nào để lấy link mua hàng với giá hời nhất.'
  },
  {
    question: 'Bấm nút mua hàng trên website này có an toàn tuyệt đối không?',
    answer: 'Nút bấm trên website tự động kích hoạt ứng dụng Shopee App hoặc TikTok App đã cài trên điện thoại của bạn. Bạn không cần đăng nhập mật khẩu hay nhập thông tin thẻ ngân hàng trên website này, đảm bảo an toàn bảo mật tuyệt đối 100%.'
  }
];

export const FaqSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-10 bg-white border-t border-b border-slate-100">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center space-y-2 mb-8">
          <div className="inline-flex items-center gap-1.5 bg-orange-100 text-[#EE4D2D] px-3.5 py-1 rounded-full text-xs font-bold">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Giải Đáp Thắc Mắc SEO & Mua Hàng</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Câu Hỏi Thường Gặp Về Đồ Câu LK Hòa
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-xl mx-auto">
            Giải đáp chi tiết về cách lấy mã giảm giá, chính sách bảo hành lóng cần và hướng dẫn mua hàng chính hãng an toàn.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-3">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="border border-slate-200/80 rounded-2xl overflow-hidden transition-all bg-slate-50/50 hover:bg-slate-50"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full text-left p-4 sm:p-5 flex items-center justify-between gap-4 font-bold text-sm sm:text-base text-slate-800 hover:text-[#EE4D2D] transition-colors cursor-pointer"
                >
                  <span className="flex items-center gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-orange-100 text-[#EE4D2D] text-xs font-black flex items-center justify-center shrink-0">
                      ?
                    </span>
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen ? 'rotate-180 text-[#EE4D2D]' : ''
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 bg-white">
                    <p>{faq.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* SEO Trust Banner */}
        <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-slate-50 to-orange-50 border border-orange-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#EE4D2D] text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs sm:text-sm font-extrabold text-slate-900">
                Trang Chủ Chính Thức Đồ Câu LK Hòa
              </div>
              <div className="text-[11px] text-slate-500 font-medium">
                Tìm kiếm Google: &quot;Đồ Câu LK Hòa&quot; hoặc &quot;Cần Câu LK Hòa chính hãng&quot;
              </div>
            </div>
          </div>
          <a
            href="https://s.shopee.vn/7fYvAFHqaP"
            target="_blank"
            rel="noreferrer"
            className="bg-[#EE4D2D] hover:bg-orange-600 text-white font-extrabold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-all flex items-center gap-1.5 shrink-0"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Ghé Gian Hàng Official</span>
          </a>
        </div>
      </div>
    </section>
  );
};
