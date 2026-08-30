import React from 'react';
import {
  BadgeCheck,
  BookOpenCheck,
  ExternalLink,
  FileCheck2,
  MapPin,
  Phone,
  Scale,
  ShieldCheck,
  UserRound,
} from 'lucide-react';

const DOMAIN = 'https://docaulkhoa.vn';
const DEFAULT_TITLE = 'Đồ Câu LK Hòa – Cần Câu, Mồi Câu, Phụ Kiện & Kinh Nghiệm Câu Cá';
const DEFAULT_DESCRIPTION = 'Đồ câu LK Hòa chính hãng: cần câu lure, cần đài, mồi câu và phụ kiện câu cá. Tra cứu thông tin và liên kết mua trên Shopee hoặc TikTok Shop.';

function setMetaDescription(value: string) {
  let element = document.querySelector('meta[name="description"]');
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute('name', 'description');
    document.head.appendChild(element);
  }
  element.setAttribute('content', value);
}

function setCanonical(href: string) {
  let element = document.querySelector('link[rel="canonical"]');
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', 'canonical');
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

function useTrustPageMetadata(title: string, description: string, path: string) {
  React.useEffect(() => {
    document.title = title;
    setMetaDescription(description);
    setCanonical(`${DOMAIN}${path}`);

    return () => {
      document.title = DEFAULT_TITLE;
      setMetaDescription(DEFAULT_DESCRIPTION);
      setCanonical(`${DOMAIN}/`);
    };
  }, [description, path, title]);
}

const Section: React.FC<{
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}> = ({ icon, title, children }) => (
  <section className="rounded-3xl border border-slate-200 bg-white p-6 sm:p-8 shadow-xs">
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-orange-50 text-[#EE4D2D]">
        {icon}
      </span>
      <h2 className="text-xl font-black tracking-tight text-slate-900 sm:text-2xl">{title}</h2>
    </div>
    <div className="space-y-3 text-sm leading-relaxed text-slate-700 sm:text-base">{children}</div>
  </section>
);

export const AboutReviewPage: React.FC = () => {
  useTrustPageMetadata(
    'Giới thiệu LK Hòa & phương pháp đánh giá | docaulkhoa.vn',
    'Tìm hiểu người chịu trách nhiệm nội dung, nguyên tắc kiểm chứng, phương pháp review sản phẩm và chính sách affiliate của docaulkhoa.vn.',
    '/gioi-thieu-phuong-phap-danh-gia',
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="rounded-3xl bg-slate-950 px-6 py-8 text-white sm:px-10 sm:py-12">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-orange-300">
          <BadgeCheck className="h-4 w-4" />
          Thông tin chịu trách nhiệm nội dung
        </div>
        <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
          Giới thiệu LK Hòa và phương pháp đánh giá
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
          docaulkhoa.vn tập trung vào đồ câu, hướng dẫn chọn dụng cụ và bài so sánh giúp người đọc
          kiểm tra đúng phiên bản trước khi mua. Tên miền chính thức của website này là
          <strong className="text-white"> docaulkhoa.vn</strong>.
        </p>
      </header>

      <Section icon={<UserRound className="h-5 w-5" />} title="Ai viết và chịu trách nhiệm?">
        <p>
          <strong>Người viết và chịu trách nhiệm nội dung: LK Hòa.</strong> Tất cả bài cẩm nang,
          review và so sánh trên website được hiển thị thống nhất dưới tên LK Hòa để người đọc biết
          rõ ai đứng sau nhận định trong bài.
        </p>
        <p>
          Website chỉ xuất bản trong phạm vi đồ câu và kỹ thuật câu cá. Khi một đặc tính chưa có số
          đo hoặc bằng chứng thực địa, bài viết phải ghi rõ đó là thông số công bố, dữ liệu danh mục
          hoặc nhận định cần kiểm chứng thêm.
        </p>
      </Section>

      <Section icon={<BookOpenCheck className="h-5 w-5" />} title="Cách chúng tôi làm bài review">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Đối chiếu tên sản phẩm, biến thể, ảnh và liên kết với danh mục đang được quản lý.</li>
          <li>Tách thông số do người bán công bố khỏi kết quả thử nghiệm thực tế.</li>
          <li>So sánh theo tình huống sử dụng, ngân sách, khả năng tương thích và hạn chế.</li>
          <li>Chỉ gọi là “đã thử” khi có ảnh, video, điều kiện thử hoặc ghi chép đủ để kiểm tra lại.</li>
          <li>Ghi ngày cập nhật và kiểm tra lại liên kết trước khi sửa khuyến nghị mua.</li>
        </ol>
      </Section>

      <Section icon={<Scale className="h-5 w-5" />} title="Nguyên tắc độc lập và liên kết affiliate">
        <p>
          Một số liên kết trên website là liên kết tiếp thị liên kết. LK Hòa có thể nhận hoa hồng khi
          người đọc mua qua liên kết, nhưng giá thanh toán của người mua không tăng vì việc này.
        </p>
        <p>
          Mức hoa hồng không được dùng làm tiêu chí xếp hạng sản phẩm. Bài viết phải nêu cả đối tượng
          phù hợp, trường hợp không nên mua và những thông tin cần xác nhận lại trên sàn.
        </p>
      </Section>

      <Section icon={<FileCheck2 className="h-5 w-5" />} title="Sửa sai và cập nhật nội dung">
        <p>
          Giá, voucher, tồn kho và cấu hình sản phẩm có thể thay đổi. Người đọc nên kiểm tra thông tin
          cuối cùng trên Shopee hoặc TikTok Shop trước khi thanh toán. Khi phát hiện tên sản phẩm,
          đường link hoặc thông số sai, LK Hòa sẽ ưu tiên sửa phần có thể ảnh hưởng quyết định mua.
        </p>
        <p>Cập nhật chính sách nội dung gần nhất: 29/08/2026.</p>
      </Section>

      <Section icon={<ShieldCheck className="h-5 w-5" />} title="Liên hệ LK Hòa">
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href="tel:0933040999"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 font-bold text-slate-900 transition-colors hover:border-orange-300 hover:text-[#EE4D2D]"
          >
            <Phone className="h-5 w-5" /> 0933 040 999
          </a>
          <a
            href="https://zalo.me/0933040999"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 rounded-2xl border border-slate-200 p-4 font-bold text-slate-900 transition-colors hover:border-blue-300 hover:text-blue-600"
          >
            <ExternalLink className="h-5 w-5" /> Zalo LK Hòa
          </a>
        </div>
        <p className="flex items-start gap-2 pt-2">
          <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#EE4D2D]" />
          Đường mòn Hồ Chí Minh, Xóm Yên Lâm, Nghĩa Lâm, Nghĩa Đàn, Nghệ An.
        </p>
      </Section>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  useTrustPageMetadata(
    'Chính sách quyền riêng tư | Đồ Câu LK Hòa',
    'Chính sách quyền riêng tư của docaulkhoa.vn về Google Analytics 4, cookie, liên kết ngoài và dữ liệu người dùng.',
    '/quyen-rieng-tu',
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold uppercase tracking-wider text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Quyền riêng tư
        </div>
        <h1 className="text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">
          Chính sách quyền riêng tư
        </h1>
        <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
          Chính sách này giải thích dữ liệu nào có thể được xử lý khi bạn sử dụng docaulkhoa.vn.
          Cập nhật gần nhất: 29/08/2026.
        </p>
      </header>

      <Section icon={<FileCheck2 className="h-5 w-5" />} title="Dữ liệu thống kê website">
        <p>
          Website sử dụng Google Analytics 4 để ghi nhận dữ liệu tổng hợp như trang đã xem, nguồn truy
          cập, loại thiết bị và sự kiện bấm liên kết affiliate. Dữ liệu này giúp LK Hòa biết nội dung
          nào hữu ích và phát hiện lỗi điều hướng.
        </p>
        <p>
          Website không yêu cầu người đọc cung cấp thông tin thẻ thanh toán. Việc mua hàng và thanh
          toán diễn ra trên nền tảng Shopee hoặc TikTok theo chính sách riêng của các nền tảng đó.
        </p>
      </Section>

      <Section icon={<ShieldCheck className="h-5 w-5" />} title="Cookie và lựa chọn của người dùng">
        <p>
          Google Analytics có thể dùng cookie hoặc mã nhận dạng tương tự để phân biệt phiên truy cập.
          Bạn có thể xoá hoặc chặn cookie trong cài đặt trình duyệt; một số chức năng đo lường có thể
          không hoạt động đầy đủ sau khi chặn.
        </p>
      </Section>

      <Section icon={<ExternalLink className="h-5 w-5" />} title="Liên kết sang nền tảng bên ngoài">
        <p>
          Khi bạn bấm liên kết mua hàng, bạn sẽ rời docaulkhoa.vn. Shopee, TikTok, Zalo và các dịch vụ
          bên ngoài tự chịu trách nhiệm về chính sách quyền riêng tư, cookie và hoạt động xử lý dữ liệu
          trên nền tảng của họ.
        </p>
      </Section>

      <Section icon={<Phone className="h-5 w-5" />} title="Liên hệ về dữ liệu">
        <p>
          Nếu cần hỏi về nội dung chính sách hoặc yêu cầu xem xét một vấn đề liên quan dữ liệu, vui
          lòng liên hệ LK Hòa qua số <a className="font-bold text-[#EE4D2D]" href="tel:0933040999">0933 040 999</a>.
        </p>
      </Section>
    </div>
  );
};
