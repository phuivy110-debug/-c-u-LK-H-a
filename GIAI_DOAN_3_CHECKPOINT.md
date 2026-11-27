# LK Hòa – Giai đoạn 3 checkpoint

Cập nhật: 2026-11-27 (Asia/Ho_Chi_Minh)

## Đã hoàn tất

- P0: server catalog áp dụng `applySourceCatalogEnrichment()` trước khi render SEO/feed/API.
- P0: 75 sản phẩm active có mô tả nguồn dài, biến thể/SKU hoặc thông số; không dùng nội dung placeholder làm dữ liệu chính.
- P0: Google Merchant feed `/merchant-feed.xml` có ID, title, description, link, image, availability, price, brand, shipping.
- P0: giá feed dùng cùng `productPrice()` với trang sản phẩm; phí vận chuyển khớp quy tắc website.
- P1: trang sản phẩm có liên kết nội bộ tới cẩm nang liên quan theo danh mục/ý định mua.
- P1: server-rendered product HTML cũng có các liên kết cẩm nang để Google crawl được.
- P1: thêm `scripts/verify-merchant-readiness.mjs` và lệnh `npm run test:merchant`.

## Kiểm thử gần nhất

- `npm run lint`: PASS
- `npm run build`: PASS; 140 trang prerender, sitemap và bundle Vercel tạo sạch.
- Merchant feed local: 75 items, required fields complete.
- `npm run test:ux`: PASS; all article TOCs and affiliate tracking checks pass.
- Image audit: 75/75 ảnh phản hồi hợp lệ và đạt kiểm tra kích thước tối thiểu 500×500.
- P2 bundle optimization: entry chunk giảm từ khoảng 1.3MB xuống khoảng 415KB; tách vendor, charts, catalog-source và guides-data.
- Sau khi deploy phải kiểm tra lại `https://docaulkhoa.vn/merchant-feed.xml` và mục Needs attention trong GMC.

## Đóng Giai đoạn 3

- Code/SEO/feed/performance P0–P2 đã hoàn tất và sẵn sàng nghiệm thu.
- Việc còn ngoài code là thao tác tài khoản: xác minh/claim domain, cấu hình shipping/returns và upload feed trong GMC.
- Sau khi GMC xử lý 24–72 giờ, đọc Needs attention và sửa theo từng mã lỗi.

## Quy tắc tiếp tục

- Không reset hoặc xóa các thay đổi demo Apple local chưa deploy.
- Không tự bịa GTIN/MPN, giá, tồn kho hoặc thông số chưa có nguồn.
- Mọi lần deploy production phải chạy lint, build và test merchant trước.
