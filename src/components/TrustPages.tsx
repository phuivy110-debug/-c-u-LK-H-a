import React from 'react';
import {
  BadgeCheck,
  BookOpenCheck,
  Clock,
  CreditCard,
  ExternalLink,
  FileCheck2,
  Mail,
  MapPin,
  Navigation,
  PackageCheck,
  Phone,
  RefreshCw,
  Scale,
  ShieldCheck,
  Truck,
  UserRound,
} from 'lucide-react';
import {
  DOMAIN,
  GOOGLE_MAPS_STORE_URL,
  STORE_ADDRESS,
  STORE_BANK_INFO,
  STORE_EMAIL,
  STORE_HOTLINE,
  STORE_HOURS,
  ZALO_CHAT_URL,
} from '../utils/site';

const DEFAULT_TITLE = 'Đồ Câu LK Hòa – Cần Câu, Mồi Câu, Phụ Kiện & Kinh Nghiệm Câu Cá';
const DEFAULT_DESCRIPTION =
  'Đồ Câu LK Hòa chính hãng: Cần câu solid, cần lure, cần đài 5H, mồi chuột LK, máy câu và dây dù PE. Đặt hàng COD đồng kiểm, VietQR, Freeship từ 300K.';

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
  <section className="rounded-2xl border border-slate-800 bg-[#111827] p-6 sm:p-8">
    <div className="mb-4 flex items-center gap-3">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#14532D]/50 border border-emerald-800/60 text-[#FACC15]">
        {icon}
      </span>
      <h2 className="font-display text-lg font-black tracking-tight text-white sm:text-xl">
        {title}
      </h2>
    </div>
    <div className="space-y-3 text-sm leading-relaxed text-slate-300 sm:text-base">
      {children}
    </div>
  </section>
);

export const WarrantyReturnPolicyPage: React.FC = () => {
  useTrustPageMetadata(
    'Chính sách bảo hành & Đổi trả | Đồ Câu LK Hòa',
    'Chính sách đổi mới 1-1 trong 7 ngày và bảo hành ngọn cần chính hãng tại Đồ Câu LK Hòa.',
    '/chinh-sach-bao-hanh-doi-tra'
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="rounded-2xl border border-slate-800 bg-[#111827] px-6 py-8 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#FACC15]">
          Chính Sách Google Merchant Center · Đồ Câu LK Hòa
        </p>
        <h1 className="mt-2 font-display text-2xl font-black tracking-tight text-white sm:text-4xl">
          Chính Sách Bảo Hành &amp; Đổi Trả
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
          Đồ Câu LK Hòa cam kết bảo vệ tối đa quyền lợi người mua khi đặt hàng trực tiếp tại docaulkhoa.vn với cơ chế đổi mới 1-1 trong 7 ngày và hỗ trợ bảo hành ngọn cần chính hãng.
        </p>
      </header>

      <Section icon={<RefreshCw className="h-5 w-5" />} title="1. Chính sách đổi mới 1-1 trong 7 ngày">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Thời hạn áp dụng:</strong> Trong vòng <strong>07 ngày</strong> kể từ ngày khách hàng nhận được đơn hàng thành công.
          </li>
          <li>
            <strong>Điều kiện đổi trả miễn phí (LK Hòa chịu 100% phí vận chuyển 2 chiều):</strong> Sản phẩm bị gãy đọt, nứt lóng, bung khoen do vận chuyển; giao nhầm mẫu, nhầm size/chiều dài cần; hoặc lỗi kỹ thuật từ nhà sản xuất.
          </li>
          <li>
            <strong>Đổi hoặc trả theo nhu cầu:</strong> Trong 07 ngày, khách có thể đề nghị đổi phân loại hoặc trả hàng nếu sản phẩm còn nguyên tem mác, đầy đủ phụ kiện/quà tặng và chưa qua sử dụng thực tế. Khách thanh toán phí gửi hàng về; LK Hòa không thu phí nhập kho.
          </li>
          <li>
            <strong>Trường hợp không áp dụng:</strong> Sản phẩm đã sử dụng, bị tự ý sửa chữa, thiếu phụ kiện/quà tặng, hư hỏng do dùng sai hướng dẫn hoặc gửi yêu cầu sau thời hạn 07 ngày. Quyền bảo hành lỗi kỹ thuật riêng vẫn được áp dụng theo mục 2.
          </li>
        </ul>
      </Section>

      <Section icon={<ShieldCheck className="h-5 w-5" />} title="2. Chính sách bảo hành ngọn cần & lóng cần">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Hỗ trợ thay ngọn / lóng cần chính hãng:</strong> Đối với các dòng cần đài và cần lure LK Hòa chính hãng (LK Solid, LK Special Cá Mập, LK Pro 5H/6H...), khách hàng được hỗ trợ đặt lóng/ngọn thay thế chuẩn thông số gốc với chi phí hỗ trợ từ hãng.
          </li>
          <li>
            <strong>Điều kiện kiểm tra:</strong> Vui lòng giữ lại mã đơn hàng (hoặc số điện thoại đặt hàng) và quay video mở gói hàng khi kiểm tra để được xử lý đổi mới ngay trong ngày.
          </li>
        </ul>
      </Section>

      <Section icon={<Phone className="h-5 w-5" />} title="3. Cách gửi trả hàng & hoàn tiền">
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            Liên hệ Hotline/Zalo <strong className="text-white">{STORE_HOTLINE}</strong> hoặc email{' '}
            <strong className="text-white">{STORE_EMAIL}</strong>, cung cấp mã đơn hàng, lý do đổi trả và ảnh/video tình trạng sản phẩm.
          </li>
          <li>
            Sau khi được xác nhận tiếp nhận, đóng gói đầy đủ sản phẩm và gửi về: <strong className="text-white">{STORE_ADDRESS}</strong>. Không tự gửi hàng thu tiền người nhận khi chưa được LK Hòa xác nhận.
          </li>
          <li>
            LK Hòa kiểm tra hàng hoàn trong 01–02 ngày làm việc sau khi nhận. Khoản hoàn được chuyển về tài khoản khách cung cấp trong 01–03 ngày làm việc; thời gian ngân hàng ghi có có thể kéo dài thêm tùy ngân hàng.
          </li>
        </ol>
      </Section>
    </div>
  );
};

export const ShippingPolicyPage: React.FC = () => {
  useTrustPageMetadata(
    'Chính sách vận chuyển & Giao nhận | Đồ Câu LK Hòa',
    'Quy cách đóng gói ống nhựa cứng PVC chống gãy đọt, cho phép đồng kiểm khi nhận hàng và biểu phí vận chuyển tại Đồ Câu LK Hòa.',
    '/chinh-sach-van-chuyen'
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="rounded-2xl border border-slate-800 bg-[#111827] px-6 py-8 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#FACC15]">
          Giao Nhận Toàn Quốc · Đồ Câu LK Hòa
        </p>
        <h1 className="mt-2 font-display text-2xl font-black tracking-tight text-white sm:text-4xl">
          Chính Sách Vận Chuyển &amp; Giao Nhận
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
          Tất cả cần câu tại Đồ Câu LK Hòa đều được đóng gói bằng ống nhựa cứng PVC chuyên dụng và hỗ trợ mở hàng đồng kiểm trước khi thanh toán.
        </p>
      </header>

      <Section icon={<PackageCheck className="h-5 w-5" />} title="1. Quy cách đóng gói ống nhựa cứng & đồng kiểm">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Đóng ống nhựa PVC bảo vệ:</strong> Mọi đơn hàng có cần câu tay, cần lure, cần solid đều được bọc xốp chống sốc ở hai đầu ngọn và lồng trong ống nhựa cứng PVC chịu lực cao, chống va đập khi vận chuyển đường dài.
          </li>
          <li>
            <strong>Quyền đồng kiểm khi nhận hàng:</strong> Khách hàng được phép yêu cầu bưu tá cho mở gói hàng kiểm tra đúng mẫu mã, chiều dài, khoen cần nguyên vẹn rồi mới thanh toán tiền COD.
          </li>
        </ul>
      </Section>

      <Section icon={<Truck className="h-5 w-5" />} title="2. Biểu phí vận chuyển & Thời gian giao hàng">
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong>Miễn phí vận chuyển (0đ):</strong> Áp dụng cho toàn bộ đơn hàng có giá trị từ <strong className="text-[#FACC15]">300.000đ trở lên</strong> hoặc đơn hàng có chứa <strong>Cần câu</strong> (hoặc áp dụng mã <strong>FREESHIP</strong>).
          </li>
          <li>
            <strong>Đồng giá 30.000đ toàn quốc:</strong> Áp dụng cho các đơn phụ kiện/mồi lẻ dưới 300.000đ không kèm cần câu.
          </li>
          <li>
            <strong>Thời gian giao hàng dự kiến:</strong> 1–2 ngày làm việc tại Nghệ An, Thanh Hóa, Hà Tĩnh, Hà Nội, TP.HCM; 2–4 ngày làm việc đối với các tỉnh thành khác trên toàn quốc.
          </li>
        </ul>
      </Section>
    </div>
  );
};

export const PaymentPolicyPage: React.FC = () => {
  useTrustPageMetadata(
    'Chính sách thanh toán | Đồ Câu LK Hòa',
    'Hướng dẫn thanh toán khi nhận hàng (COD đồng kiểm) và chuyển khoản ngân hàng VietQR chính chủ tại Đồ Câu LK Hòa.',
    '/chinh-sach-thanh-toan'
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="rounded-2xl border border-slate-800 bg-[#111827] px-6 py-8 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#FACC15]">
          Thanh Toán Minh Bạch · Đồ Câu LK Hòa
        </p>
        <h1 className="mt-2 font-display text-2xl font-black tracking-tight text-white sm:text-4xl">
          Chính Sách Thanh Toán
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
          Website docaulkhoa.vn hỗ trợ 2 phương thức thanh toán an toàn, minh bạch: Thanh toán khi nhận hàng (COD) và Chuyển khoản ngân hàng qua mã VietQR tự động.
        </p>
      </header>

      <Section icon={<CreditCard className="h-5 w-5" />} title="1. Thanh toán khi nhận hàng (COD)">
        <p>
          Khách hàng thanh toán tiền mặt trực tiếp cho nhân viên giao hàng sau khi đã mở hộp/ống nhựa đồng kiểm đúng sản phẩm và số lượng đặt mua. Không phát sinh phụ phí thu hộ.
        </p>
      </Section>

      <Section icon={<BadgeCheck className="h-5 w-5" />} title="2. Chuyển khoản ngân hàng (VietQR chính chủ)">
        <p>
          Khi chọn thanh toán chuyển khoản tại trang Checkout, hệ thống tự động tạo mã VietQR kèm đúng số tiền và nội dung chuyển khoản là Mã đơn hàng để xác nhận nhanh chóng.
        </p>
        <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 space-y-1.5 text-sm">
          <p>Ngân hàng: <strong className="text-white">{STORE_BANK_INFO.bankName}</strong></p>
          <p>Số tài khoản: <strong className="font-mono-tabular text-[#FACC15]">{STORE_BANK_INFO.accountNo}</strong></p>
          <p>Chủ tài khoản: <strong className="text-white">{STORE_BANK_INFO.accountName}</strong></p>
        </div>
      </Section>
    </div>
  );
};

export const AboutReviewPage: React.FC = () => {
  useTrustPageMetadata(
    'Giới thiệu Đồ Câu LK Hòa & phương pháp kiểm nghiệm | docaulkhoa.vn',
    'Thông tin cửa hàng chính hãng Đồ Câu LK Hòa, địa chỉ thực tế tại Nghệ An và quy trình kiểm nghiệm trang bị câu cá.',
    '/gioi-thieu-phuong-phap-danh-gia'
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="rounded-2xl border border-slate-800 bg-[#111827] px-6 py-8 sm:px-10 sm:py-10">
        <p className="text-xs font-bold uppercase tracking-widest text-[#FACC15]">
          Thương Hiệu Chính Chủ · docaulkhoa.vn
        </p>
        <h1 className="mt-2 font-display text-2xl font-black tracking-tight text-white sm:text-4xl">
          Giới Thiệu Đồ Câu LK Hòa &amp; Phương Pháp Kiểm Nghiệm
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-slate-300 sm:text-base">
          Đồ Câu LK Hòa (tên miền chính thức: <strong className="text-white">docaulkhoa.vn</strong>) cung cấp trang bị câu cá thực chiến chính hãng, cho phép đặt mua trực tiếp COD/VietQR hoặc qua gian hàng Shopee &amp; TikTok Shop chính thức.
        </p>
      </header>

      <Section icon={<UserRound className="h-5 w-5" />} title="Thông tin đơn vị vận hành chính thức">
        <p>
          <strong>Đồ Câu LK Hòa</strong> trực tiếp kiểm định phôi cần, độ bền dây PE và hiệu quả bài mồi trước khi phân phối tới anh em cần thủ toàn quốc.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
          <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-3.5 flex items-center gap-2.5">
            <Phone className="w-4 h-4 text-[#FACC15] shrink-0" />
            <span>Hotline / Zalo: <strong className="text-white">{STORE_HOTLINE}</strong></span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-3.5 flex items-center gap-2.5">
            <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Email: <strong className="text-white">{STORE_EMAIL}</strong></span>
          </div>
          <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-3.5 flex items-center gap-2.5 sm:col-span-2">
            <Clock className="w-4 h-4 text-[#F97316] shrink-0" />
            <span>Giờ làm việc: <strong className="text-white">{STORE_HOURS}</strong></span>
          </div>
        </div>
      </Section>

      <Section icon={<BookOpenCheck className="h-5 w-5" />} title="Quy trình kiểm nghiệm trang bị tại LK Hòa">
        <ol className="list-decimal space-y-2 pl-5">
          <li>Đối chiếu thông số thực tế: chiều dài thật, trọng lượng, tải tĩnh và chất lượng khoen/pat máy.</li>
          <li>Thử nghiệm thực địa tại sông hồ tự nhiên để đánh giá action mồi và độ nảy cần.</li>
          <li>Tách bạch thông số công bố và ghi chú điều kiện sử dụng thực tế trong từng bài cẩm nang.</li>
          <li>Đóng gói ống nhựa cứng PVC và cho phép khách hàng đồng kiểm trước khi thanh toán.</li>
        </ol>
      </Section>

      <Section icon={<Scale className="h-5 w-5" />} title="Minh bạch kênh mua hàng Hybrid">
        <p>
          Khách hàng có thể đặt mua trực tiếp trên website docaulkhoa.vn để nhận hỗ trợ kỹ thuật, giao COD đồng kiểm và tích hợp mã giảm giá riêng của shop; hoặc chọn nút chuyển sang Shopee / TikTok Shop (gắn <code className="text-xs text-[#FACC15]">rel="nofollow sponsored noopener"</code>) khi muốn dùng voucher của sàn thương mại điện tử.
        </p>
      </Section>

      <Section icon={<FileCheck2 className="h-5 w-5" />} title="Cửa hàng & Bản đồ chỉ đường Google Maps">
        <div className="rounded-xl border border-slate-800 bg-[#0F172A] p-4 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-[#FACC15]" />
              <div>
                <div className="font-bold text-white text-sm">Cửa hàng Đồ Câu LK Hòa</div>
                <div className="text-xs text-slate-300 mt-0.5">{STORE_ADDRESS}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <a
                href={ZALO_CHAT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-[#14532D] hover:bg-emerald-800 text-white px-4 py-2 rounded-xl text-xs font-bold"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Chat Zalo</span>
              </a>
              <a
                href={GOOGLE_MAPS_STORE_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-1.5 bg-[#FACC15] hover:bg-yellow-300 text-[#0F172A] px-4 py-2 rounded-xl text-xs font-black"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>Chỉ đường Google Maps</span>
              </a>
            </div>
          </div>

          <div className="w-full h-56 rounded-xl overflow-hidden border border-slate-800 bg-slate-900">
            <iframe
              title="Bản đồ vị trí Đồ Câu LK Hòa"
              src="https://maps.google.com/maps?q=19.4154285,105.4515155&hl=vi&z=15&output=embed"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </Section>
    </div>
  );
};

export const PrivacyPage: React.FC = () => {
  useTrustPageMetadata(
    'Chính sách bảo mật thông tin khách hàng | Đồ Câu LK Hòa',
    'Chính sách bảo mật thông tin người nhận hàng, đơn hàng COD/VietQR và dữ liệu truy cập tại docaulkhoa.vn.',
    '/quyen-rieng-tu'
  );

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <header className="rounded-2xl border border-slate-800 bg-[#111827] px-6 py-8 sm:px-10">
        <p className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Bảo Mật Thông Tin · Đồ Câu LK Hòa
        </p>
        <h1 className="mt-2 font-display text-2xl font-black tracking-tight text-white sm:text-4xl">
          Chính Sách Bảo Mật Thông Tin Khách Hàng
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
          Chính sách này giải thích cách Đồ Câu LK Hòa (docaulkhoa.vn) thu thập, sử dụng và bảo vệ thông tin cá nhân của khách hàng khi đặt mua sản phẩm hoặc truy cập website.
        </p>
      </header>

      <Section icon={<FileCheck2 className="h-5 w-5" />} title="1. Mục đích và phạm vi thu thập thông tin">
        <p>
          Khi khách hàng đặt đơn trực tiếp tại docaulkhoa.vn, chúng tôi chỉ thu thập các thông tin cần thiết để giao nhận hàng gồm: <strong>Họ và tên, Số điện thoại, Địa chỉ giao hàng và Ghi chú đơn hàng</strong>.
        </p>
        <p>
          Thông tin này chỉ dùng cho mục đích xác nhận đơn, đóng gói gửi hàng qua đơn vị vận chuyển, hỗ trợ bảo hành ngọn cần và xử lý đổi trả. LK Hòa không bán, chia sẻ hay trao đổi thông tin cá nhân khách hàng cho bên thứ ba ngoài mục đích giao vận.
        </p>
      </Section>

      <Section icon={<ShieldCheck className="h-5 w-5" />} title="2. Lưu trữ giỏ hàng & Cookie phân tích">
        <p>
          Website lưu giữ trạng thái giỏ hàng trên trình duyệt của bạn (LocalStorage) để không bị mất sản phẩm khi tải lại trang. Google Analytics 4 được dùng ở mức tổng hợp để cải thiện tốc độ và trải nghiệm tìm kiếm sản phẩm.
        </p>
      </Section>

      <Section icon={<ExternalLink className="h-5 w-5" />} title="3. Liên kết sang Shopee, TikTok Shop & Zalo">
        <p>
          Khi bạn chủ động bấm sang Shopee, TikTok Shop hoặc Zalo, các nền tảng đó áp dụng chính sách quyền riêng tư và thanh toán độc lập của họ.
        </p>
      </Section>

      <Section icon={<Phone className="h-5 w-5" />} title="4. Quyền chỉnh sửa hoặc xóa thông tin cá nhân">
        <p>
          Khách hàng có thể yêu cầu kiểm tra, cập nhật hoặc xóa lịch sử thông tin giao hàng bất cứ lúc nào qua Hotline{' '}
          <a className="font-bold text-[#FACC15]" href={`tel:${STORE_HOTLINE.replace(/\s+/g, '')}`}>
            {STORE_HOTLINE}
          </a>{' '}
          hoặc Email <strong className="text-white">{STORE_EMAIL}</strong>.
        </p>
      </Section>
    </div>
  );
};
