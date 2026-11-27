# Báo cáo kiểm thử website LK Hòa

- Ngày kiểm thử: 27/11/2026 (Asia/Ho_Chi_Minh)
- Môi trường: production `https://docaulkhoa.vn` và mã nguồn trên GitHub
- Phạm vi: route công khai, API, sản phẩm/biến thể, giỏ hàng, SEO/merchant feed, ảnh, bảo mật cơ bản, hiệu suất build

## Kết luận

Website đang vận hành ổn định, chưa phát hiện lỗi P0 làm sập website hoặc lỗi nghiêm trọng ở route công khai. GMC được giữ lại, chưa đưa feed vào GMC theo chỉ đạo.

## Đã đạt

- Lint: PASS.
- Bộ kiểm thử UX/catalog: PASS.
- Merchant readiness: PASS; 75 sản phẩm, đủ trường bắt buộc.
- Audit ảnh: PASS; 75/75 sản phẩm có ảnh, 0 lỗi.
- Merchant feed: PASS; 75 sản phẩm.
- Sitemap: 73/73 URL sản phẩm HTTP 200; 50/50 URL cẩm nang HTTP 200.
- Homepage, catalog, cart, checkout và admin routes: HTTP 200.
- Trang sản phẩm có Product schema, giá, SKU, biến thể, thêm giỏ, mua ngay và liên kết cẩm nang nội bộ.
- API coupon active sau bản sửa rewrite: HTTP 200.
- Endpoint nhạy cảm không đăng nhập đều từ chối đúng: orders/connectors/coupons trả HTTP 401.
- Security headers: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy.
- Bundle entry đã giảm còn khoảng 415 KB nhờ tách chunk.

## Lỗi đã phát hiện và xử lý

### P0 — đã xử lý

`/api/coupons/active` từng trả HTTP 404 trên production vì thiếu Vercel rewrite. Đã bổ sung rewrite về `/api/index`, deploy production thành công và kiểm tra lại endpoint trả HTTP 200.

## Việc cần theo dõi

### P1

1. Nên theo dõi thêm coupon API vì lần gọi đầu trong một phiên kiểm thử từng trả 404; sau deployment và retry hiện đã 200.
2. Chưa tạo đơn thật với dữ liệu khách hàng; cần một đơn COD test/staging trước khi bán rộng.
3. Kiểm thử affiliate/voucher bằng `tsx` bị sandbox chặn tạo pipe (EPERM), đây là giới hạn môi trường kiểm thử, chưa phải lỗi website.
4. 44/50 bài cẩm nang có mapping sản phẩm đã xác minh; 6 bài còn lại là bài thông tin, cần rà soát nếu muốn tất cả bài đều có CTA sản phẩm.

### P2

- Giảm tiếp vendor chunk khoảng 514 KB.
- Kiểm thử checkout trên thiết bị mobile thật.
- Bổ sung test cho mã hết hạn, tồn kho 0, biến thể hết hàng, ngưỡng freeship và timeout Neon/API.
- Chạy end-to-end order trong staging, sau đó mới test một đơn production có kiểm soát.

## Bổ sung sau vòng sửa lỗi

- B2A quote đã được sửa để dùng cùng danh sách mã giảm giá quản trị như checkout, tránh báo sai tổng tiền khi CMS có chiến dịch mới.
- Tách thêm chunk icons, motion, markdown và React runtime; không còn chunk vendor vượt 500 KB.
- Các script schema, voucher và affiliate đã chuyển sang cách chạy ổn định bằng `node --import tsx`; toàn bộ đều PASS trong môi trường kiểm thử.

## Khuyến nghị thứ tự tiếp theo

1. Hoàn thành test đơn COD staging/end-to-end.
2. Rà soát 6 bài cẩm nang chưa có mapping sản phẩm.
3. Tối ưu vendor chunk và đo Lighthouse trên mobile.
4. Sau khi các bước trên đạt, mới chuyển sang chuẩn hóa và đưa feed vào GMC.

Apple OS demo vẫn giữ ở chế độ local `?demo=apple`, chưa đưa lên production.
