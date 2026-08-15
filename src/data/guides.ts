import { PRODUCT_GUIDES_BATCH_1 } from './productGuidesBatch1';
import { PRODUCT_GUIDES_BATCH_2 } from './productGuidesBatch2';
import { PRODUCT_GUIDES_BATCH_3 } from './productGuidesBatch3';

export interface GuideArticle {
  slug: string;
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  keywords?: string[];
  category: string;
  categorySlug: string;
  summary: string;
  contentMarkdown: string;
  contentHtml?: string;
  author: string;
  date: string;
  readTime: string;
  relatedProducts?: string[];
  relatedCategorySlug?: string;
}

const BASE_GUIDE_ARTICLES: GuideArticle[] = [
  // BÀI 0 — CẨM NANG CÂU CÁ NƯỚC NGỌT (BÀI TRỤ)
  {
    slug: 'cam-nang-cau-ca-nuoc-ngot',
    title: 'Cẩm nang câu cá nước ngọt: Từ câu lure cá lóc đến câu cá suối nước chảy',
    metaTitle: 'Cẩm nang câu cá nước ngọt cho người mới bắt đầu | Đồ Câu LK Hòa',
    metaDescription: 'Cẩm nang câu cá nước ngọt tổng hợp: câu lure cá lóc đồng, nhận biết cá lóc ôm trứng, câu cá suối nước chảy và tìm hiểu loài cá quý hiếm. Kinh nghiệm thực chiến từ LK Hòa.',
    keywords: ['cẩm nang câu cá', 'câu cá nước ngọt', 'câu cá lóc', 'câu cá suối', 'hướng dẫn câu cá'],
    category: 'Cẩm Nang',
    categorySlug: 'cam-nang',
    summary: 'Cẩm nang câu cá nước ngọt dành cho người mới: chọn mồi, chọn điểm câu, kỹ thuật câu lure cá lóc, câu cá suối nước chảy và những lưu ý bảo tồn nguồn lợi.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-08-15',
    readTime: '7 phút đọc',
    relatedCategorySlug: 'can-cau',
    contentMarkdown: `# Cẩm nang câu cá nước ngọt: Từ câu lure cá lóc đến câu cá suối nước chảy

**Meta description:** Cẩm nang câu cá nước ngọt dành cho người mới: chọn mồi, chọn điểm câu, kỹ thuật câu lure cá lóc, câu cá suối nước chảy và những lưu ý bảo tồn nguồn lợi.

---

## Giới thiệu

Câu cá nước ngọt ở Việt Nam rất đa dạng: từ cá lóc đồng trong các vùng nước nhỏ giữa đồng ruộng, đến cá suối ở các lạch nước chảy từ núi xuống. Mỗi môi trường đòi hỏi bộ mồi, kỹ thuật và cách đọc điểm câu khác nhau.

Cẩm nang này tổng hợp kinh nghiệm thực chiến từ các chuyến đi câu của LK Hòa — dân câu chuyên nghiệp với kho video hành trình câu cá thực tế.

## Các bài viết trong cẩm nang

### 1. Câu cá lóc bằng lure (mồi giả)

- **Bài chi tiết:** [Cách câu cá lóc bằng lure cho người mới](/cam-nang/cach-cau-ca-loc-bang-lure)
- Nội dung chính: chọn mồi lure nhỏ vừa tay (Snake mini), thời điểm cá lóc bắt cặp, kỹ thuật quăng – giật, xử lý khi cá mắc cỏ.

### 2. Nhận biết cá lóc có trứng và "khui túi mù"

- **Bài chi tiết:** [Cách nhận biết cá lóc có trứng](/cam-nang/cach-nhan-biet-ca-loc-co-trung)
- Nội dung chính: dấu hiệu cá lóc ôm trứng, kiểm tra bao tử trước khi mổ, cách nướng cá lóc kiểu dân câu.

### 3. Câu cá suối nước chảy

- **Bài chi tiết:** [Kinh nghiệm câu cá suối](/cam-nang/kinh-nghiem-cau-ca-suoi)
- Nội dung chính: 5 loại mồi hiệu quả (minnow, cá sắt, mồi thìa, spinner, chuột lure), chọn điểm câu gần vực, kỹ thuật câu nước chảy, lưu ý an toàn thực phẩm.

### 4. Loài cá quý hiếm và bảo tồn

- **Bài chi tiết:** [Cá tiến vua (pa mí) — loài cá quý hiếm](/cam-nang/ca-tien-vua-pa-mi-loai-ca-quy-hiem)
- Nội dung chính: vì sao loài cá này hiếm, tác động của đập thủy điện, thói quen "câu rồi thả".

## So sánh nhanh: Câu cá đồng vs câu cá suối

| Tiêu chí | Câu cá lóc đồng | Câu cá suối |
|---|---|---|
| Môi trường | Nước tĩnh, vùng nước nhỏ giữa đồng | Nước chảy, lạch suối, chân vực |
| Mồi chính | Lure nhỏ (dạng rắn/snake) | Spinner, mồi thìa, minnow, cá sắt |
| Điểm câu | Ven bờ, mép cỏ, kẹt đất | Lạch nước từ núi xuống, chân thác |
| Kỹ thuật | Đánh nổi, giật ngắt quãng | Thả xuôi dòng, thu cắt ngang dòng |
| Loài cá chính | Cá lóc (lóc đen) | Cá suối, cá chuối |

## Lưu ý chung khi đi câu

1. **Chuẩn bị mồi đa dạng** — mỗi điểm câu, mỗi mùa cần loại mồi khác nhau.
2. **Đọc địa hình trước khi quăng** — tránh vướng cây, dây điện, nguy hiểm trơn trượt.
3. **Câu rồi thả** — giữ lại đủ ăn, thả cá con và cá đang mang trứng.
4. **An toàn thực phẩm** — thận trọng với cá bắt ở khu vực có quả rừng rụng xuống nước.
5. **Tôn trọng quy định** — không dùng kích điện, không khai thác loài quý hiếm.

## Kết luận

Câu cá nước ngọt không chỉ là kỹ thuật mà còn là hành trình đọc thiên nhiên: đọc dòng nước, đọc hành vi cá và đọc cả sự thay đổi của môi trường. Bắt đầu từ những bài học cơ bản trong cẩm nang này, bạn sẽ tự tin hơn trên mọi dòng sông, con suối.

---

*Nguồn tham khảo: tổng hợp từ các chuyến đi câu được ghi hình của LK Hòa. Nội dung mang tính kinh nghiệm quan sát, cần đối chiếu hình ảnh và nguồn chuyên môn khi cần thông tin chính xác tuyệt đối.*`
  },

  // BÀI 1 — CÁCH CÂU CÁ LÓC BẰNG LURE CHO NGƯỜI MỚI
  {
    slug: 'cach-cau-ca-loc-bang-lure',
    title: 'Cách câu cá lóc bằng lure cho người mới: Mồi, kỹ thuật và kinh nghiệm thực chiến',
    metaTitle: 'Cách câu cá lóc bằng lure cho người mới | Hướng dẫn chi tiết từ A-Z',
    metaDescription: 'Hướng dẫn câu cá lóc bằng lure chi tiết: chọn mồi lure nhỏ, kỹ thuật đánh nổi, chọn điểm câu giữa đồng, cách xử lý khi cá mắc cỏ. Kinh nghiệm thực chiến từ LK Hòa.',
    keywords: ['câu cá lóc bằng lure', 'mồi lure cá lóc', 'câu lure cá lóc đồng', 'mồi snake mini', 'kỹ thuật câu lure'],
    category: 'Kinh Nghiệm Câu Cá',
    categorySlug: 'kinh-nghiem-cau-ca',
    summary: 'Hướng dẫn câu cá lóc bằng lure từ A-Z: chọn mồi lure nhỏ vừa tay, kỹ thuật đánh nổi, chọn điểm câu giữa đồng, cách xử lý khi cá mắc cỏ. Kinh nghiệm thực chiến từ chuyến câu của LK Hòa.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-08-15',
    readTime: '6 phút đọc',
    relatedCategorySlug: 'can-cau',
    contentMarkdown: `# Cách câu cá lóc bằng lure cho người mới: Mồi, kỹ thuật và kinh nghiệm thực chiến

**Meta description:** Hướng dẫn câu cá lóc bằng lure từ A-Z: chọn mồi lure nhỏ vừa tay, kỹ thuật đánh nổi, chọn điểm câu giữa đồng, cách xử lý khi cá mắc cỏ. Kinh nghiệm thực chiến từ chuyến câu của LK Hòa.

---

## Câu cá lóc bằng lure là gì?

Câu cá lóc bằng lure là hình thức dùng mồi giả (mồi nhử) mô phỏng con mồi sống để kích thích cá lóc tấn công, thay vì ngồi chờ cắn câu với mồi tự nhiên. Đây là kiểu câu chủ động, di chuyển liên tục và có nhịp độ cao — phù hợp với cá lóc vì loài này săn mồi theo thị giác rất mạnh.

Bài viết này tổng hợp kinh nghiệm thực chiến từ chuyến câu lure cá lóc được ghi hình của LK Hòa: từ khâu chọn mồi, chọn điểm, kỹ thuật quăng – giật cho đến xử lý tình huống khi cá mắc cỏ.

## 1. Chọn mồi lure cá lóc: nhỏ vừa tay là tối ưu

Kinh nghiệm đầu tiên được ghi nhận trong chuyến đi: **mồi lure nhỏ, vừa lòng bàn tay** hoạt động rất tốt với cá lóc đồng. Trong video, loại mồi được giới thiệu là **Snake mini** (tên theo transcript tự động, chưa xác minh chính tả chính xác — cần đối chiếu hình ảnh sản phẩm trước khi khẳng định tên thương mại).

Điểm cần lưu ý:

- **Kích thước nhỏ** giúp cá lóc dễ ngậm gọn, tăng tỷ lệ dính câu.
- Lure dạng rắn/thân dài mô phỏng con mồi tự nhiên trong đồng.
- Khi cá đang ở giai đoạn "ăn nổi" (tấn công mồi trên mặt nước), lure nhỏ quét ngang mặt nước rất hiệu quả.

> **Lưu ý cho bài đăng:** tên mồi "Snake mini" lấy từ transcript tự động, có thể sai chính tả. Nên xác nhận tên sản phẩm chính xác (ảnh mồi trong video hoặc danh mục sản phẩm) trước khi xuất bản.

## 2. Thời điểm vàng: lúc cá lóc bắt cặp

Một chi tiết quan trọng trong video: chuyến đi diễn ra **đúng lúc cá lóc bắt cặp đi kiếm bộ** (mùa sinh sản). Đây được xem là thời điểm cá hoạt động mạnh, dễ tấn công mồi lure.

Dấu hiệu thực tế ghi nhận được:

- Cá lóc bắt cặp thường đi thành đôi, di chuyển tìm nơi làm tổ.
- Cá có xu hướng "ăn nổi" — lao lên mặt nước đớp mồi.
- Vào mùa này, những con cá lóc cái thường mang trứng ("ôm trứng"), cũng là lúc người câu dễ gặp cá lớn.

## 3. Chọn điểm câu: ưu tiên vùng nước nhỏ giữa đồng

Trong video, điểm câu đầu tiên là **một vùng nước nhỏ nằm giữa đồng** — đây là địa hình điển hình cho cá lóc đồng:

- Nước nhỏ, tĩnh, có bèo hoặc cỏ — nơi cá lóc trú ngụ.
- Khu vực gần kênh mương, "lô dao" (luồng nước nhỏ) cũng được nhắc đến như điểm hứa hẹn.
- Cá lóc thích nằm ven bờ, dưới đám cỏ hoặc trong các kẹt đất — nơi có bóng mát và chỗ phục kích.

Mẹo quan sát từ thực tế: để ý những chỗ **cá thở trên mặt nước** (trồi đầu lên thở) gần ven — đó là dấu hiệu có cá đang ở khu vực đó.

## 4. Kỹ thuật quăng – giật cơ bản

Từ diễn biến trong video, có thể rút ra chuỗi thao tác cơ bản:

1. **Quăng lure** về phía điểm nghi có cá (ven bờ, mép cỏ, vùng nước nhỏ).
2. **Thu mồi với nhịp giật ngắt quãng** — "đánh nổi" để lure bơi sát mặt nước, tạo tiếng động kích thích cá.
3. **Nếu quăng trượt một đường**, kéo lure quay lại theo đường cũ — nhiều khả năng cá sẽ lao ra đớp ngay phát thứ hai.
4. Khi cá tấn công, **giật cần dứt khoát** để lưỡi câu ghim chắc vào miệng cá.

Trong video ghi nhận nhiều pha cá đớp mồi ngay sau khi mồi đi qua — cho thấy cá lóc đồng phản ứng rất nhanh với lure nhỏ chạy sát mặt nước.

## 5. Xử lý khi cá mắc cỏ: tình huống ai cũng gặp

Một tình huống rất thật trong video: cá cắn câu rồi **lao vào đám cỏ, dây vướng rong**. Cách xử lý ghi nhận được:

- **Giữ cần, không siết phanh gấp** khi cá còn chạy trong đám cỏ — siết sớm dễ tuột lưỡi.
- Để cá chạy một đoạn, chờ nó đuối rồi mới kéo ra khỏi đám cỏ.
- Có người hỗ trợ cầm vợt hoặc kéo dây sẽ giảm rủi ro mất cá.
- Nếu cá vẫn quẫy mạnh, ưu tiên thả lỏng phanh, "để cả sắt" (cho cá kéo) rồi mới thu.

Kết quả trong video: có con thoát (mắc cỏ, tuột câu) — đây cũng là bài học thật: **không phải lần dính câu nào cũng kết thúc bằng việc bắt được cá**.

## 6. Một số lưu ý an toàn và đạo đức khi câu lure

- Kiểm tra khu vực xung quanh trước khi quăng lure — lure có lưỡi câu, rất dễ vướng vào người, cây cối hoặc dây điện.
- Bắt cá xong nếu không dùng đến nên thả lại, nhất là cá con và cá đang mang trứng.
- Khi câu ở đồng, chú ý bờ trơn, rắn và côn trùng.

## Câu hỏi thường gặp (FAQ)

**Hỏi: Mồi lure cỡ nào phù hợp cho cá lóc đồng?**
Trả lời: Theo kinh nghiệm trong video, lure nhỏ — cỡ vừa lòng bàn tay — hoạt động tốt với cá lóc đồng. Cỡ nhỏ giúp cá dễ ngậm gọn và tăng tỷ lệ dính câu.

**Hỏi: Câu lure cá lóc vào thời điểm nào tốt nhất?**
Trả lời: Giai đoạn cá lóc bắt cặp (mùa sinh sản) và buổi sáng sớm là những thời điểm cá hoạt động mạnh, dễ tấn công mồi nổi. (Nhận định này dựa trên diễn biến quan sát được, chưa phải kết luận khoa học.)

**Hỏi: Cá cắn câu rồi chui vào cỏ thì xử lý sao?**
Trả lời: Không siết phanh gấp, để cá chạy cho đuối rồi mới kéo ra khỏi đám cỏ; nhờ người hỗ trợ cầm vợt nếu có. Tránh kéo mạnh khi cá còn trong cỏ vì dễ tuột lưỡi.

---

*Nguồn tham khảo: chuyến câu lure cá lóc trong video của LK Hòa "Đưa Khách Quý Đi Lure Dạo & Khui Túi Mù Pịa Cá Lóc Trứng Cực Ngon" (phân tích transcript tự động tiếng Việt, chưa đối chiếu từng khung hình). Các chi tiết kỹ thuật mang tính quan sát, chưa phải tài liệu chuyên môn được kiểm chứng độc lập.*`
  },

  // BÀI 2 — CÁCH NHẬN BIẾT CÁ LÓC CÓ TRỨNG & BÍ QUYẾT KHUI TÚI MÙ
  {
    slug: 'cach-nhan-biet-ca-loc-co-trung',
    title: "Cách nhận biết cá lóc có trứng và bí quyết 'khui túi mù' chuẩn dân câu",
    metaTitle: 'Cách nhận biết cá lóc ôm trứng | Bí quyết khui túi mù của dân câu đồng',
    metaDescription: "Kinh nghiệm nhận biết cá lóc có trứng (cá lóc ôm trứng): quan sát bụng, chọn cá chắc chắn có 'bộ', cách xử lý khi bao tử phình lạ, và cách nướng cá lóc đúng kiểu dân câu.",
    keywords: ['cá lóc có trứng', 'cá lóc ôm trứng', 'khui túi mù', 'nhận biết cá lóc trứng', 'nướng cá lóc'],
    category: 'Kinh Nghiệm Câu Cá',
    categorySlug: 'kinh-nghiem-cau-ca',
    summary: 'Bí quyết chọn cá lóc ôm trứng như dân câu chuyên nghiệp: dấu hiệu nhận biết qua bụng cá, cách kiểm tra bao tử trước khi mổ, mẹo nướng cá lóc giữ trọn độ béo và cách chấm điểm "bộ" trứng.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-08-15',
    readTime: '5 phút đọc',
    relatedCategorySlug: 'moi-cau',
    contentMarkdown: `# Cách nhận biết cá lóc có trứng và bí quyết "khui túi mù" chuẩn dân câu

**Meta description:** Bí quyết chọn cá lóc ôm trứng như dân câu chuyên nghiệp: dấu hiệu nhận biết qua bụng cá, cách kiểm tra bao tử trước khi mổ, mẹo nướng cá lóc giữ trọn độ béo và cách chấm điểm "bộ" trứng.

---

## "Khui túi mù" là gì?

Trong giới câu cá đồng, **"khui túi mù"** là cách gọi vui cho khoảnh khắc mổ bụng con cá lóc vừa câu được để xem bên trong có "bộ" (bộ lòng, trứng) đẹp hay không. Nó giống một trò "nổ hũ": chưa mở ra thì không ai biết con cá đó có trứng hay không, bộ to hay bộ nhỏ.

Trong chuyến câu được ghi hình, nhóm đã "khui" nhiều con cá lóc và chấm điểm từng bộ — có bộ được chấm **8 điểm**, có bộ đạt **10 điểm**, thậm chí có thang điểm vui kiểu "11 cho 100 điểm".

## 1. Dấu hiệu nhận biết cá lóc có trứng

Theo kinh nghiệm quan sát trong video, cá lóc cái mang trứng thường có những đặc điểm sau:

- **Bụng to, căng tròn** hơn cá lóc đực cùng kích thước.
- Vào mùa sinh sản, cá lóc bắt cặp và con cái thường "ôm trứng" — đây là lúc dễ gặp cá có bộ.
- Khi cầm lên, phần bụng dưới có độ đầy, săn chắc.

> **Lưu ý:** Đây là kinh nghiệm dân gian quan sát từ video, chưa phải tài liệu khoa học. Không phải con cá lóc nào bụng to cũng chắc chắn có trứng.

## 2. Kiểm tra bao tử trước khi quyết định "khui"

Một mẹo rất đáng chú ý được nhắc đến trong video: **trước khi mổ, nên quan sát bao tử của cá**.

- Nếu **bao tử phình bất thường** — nên suy xét lại: bên trong có thể là lưỡi câu, hoặc con cá rô mà cá lóc vừa nuốt (cá lóc ăn cả con mồi nhỏ như cá rô).
- Nếu **bao tử nhỏ, gọn** — yên tâm mổ, khả năng cao bên trong là bộ trứng đẹp.
- Cách làm thường thấy: sờ/nắn nhẹ bụng trước, rồi mới rạch từ bụng để mở.

Đây chính là bước "kiểm tra" trước khi mở, giúp tránh mở phải con cá chứa đầy mồi — điều mà dân câu gọi vui là "ăn phải cục thịt không thể để mất một miếng".

## 3. Cách nướng cá lóc kiểu dân câu

Sau khi câu được cá, phần thưởng xứng đáng nhất là món cá lóc nướng. Trong video, cách làm ghi nhận được:

1. **Nướng trên lửa than/trấu** — lửa cháy to, nướng từ lúc trời sáng đến khi trời tối (nói vui cho thấy nướng kỹ).
2. Cá chín đều, phần da hơi cháy cạnh — tạo mùi thơm đặc trưng.
3. **"Phải gạt ra mới xịt được"** — tức là phải gạt than/lửa ra mới lấy cá, tránh bỏng.
4. Khi ăn, **bóc từ phần đế/bụng**, thêm ớt, chấm nước mắm — "bộ" (trứng + lòng) ăn kèm là phần được chấm điểm cao nhất.

## 4. Vì sao trứng cá lóc được đánh giá cao?

Trong video có một so sánh thú vị: **trứng cá lóc được cho là "đủ vị đắng cay ngọt bùi"**, trong khi trứng cá tầm (caviar) bị nhận xét là mặn. Đây là góc nhìn ẩm thực dân dã, mang tính chủ quan của người trong video — không phải đánh giá khoa học.

Điểm đặc biệt khiến "bộ cá lóc ôm trứng" được săn đón:

- Trứng cá lóc **béo, ngậy**, có độ giòn nhẹ.
- Khi nướng chung với cá, trứng giữ được độ ngọt tự nhiên.
- Đây là món "hiếm" — không phải con cá lóc nào cũng có trứng, nên bộ trứng được ví như phần thưởng may mắn.

## 5. Nhường khách — nét đẹp trong văn hóa câu cá đồng

Một chi tiết ấm áp trong video: chủ nhà (người câu) **nhường phần ngon nhất cho khách** — "thi con to nhường khách, mình ăn con bé". Đây là nét văn hóa mến khách rất đặc trưng của dân câu đồng miền Tây, cũng là một phần sức hút của nội dung.

## Câu hỏi thường gặp (FAQ)

**Hỏi: Làm sao biết cá lóc có trứng trước khi mổ?**
Trả lời: Quan sát bụng cá căng tròn (thường là cá cái vào mùa sinh sản), kết hợp sờ/nắn nhẹ. Nếu bao tử phình bất thường, nên kiểm tra kỹ trước khi mổ vì có thể là mồi cá vừa nuốt, không phải trứng.

**Hỏi: "Bộ" của cá lóc là gì?**
Trả lời: Là cách gọi dân dã của bộ lòng và trứng cá lóc. Khi cá lóc cái mang trứng, phần này được xem là "hàng hiếm", ăn kèm cá nướng rất được ưa chuộng.

**Hỏi: Cá lóc nướng kiểu nào ngon nhất?**
Trả lời: Theo kinh nghiệm trong video: nướng trên than/trấu lửa to cho chín đều, ăn kèm bộ trứng, thêm ớt và chấm nước mắm. (Khẩu vị có thể khác nhau ở mỗi người.)

---

*Nguồn tham khảo: chuyến câu và bữa ăn trong video LK Hòa "Đưa Khách Quý Đi Lure Dạo & Khui Túi Mù Pịa Cá Lóc Trứng Cực Ngon". Các nhận xét ẩm thực là quan điểm của người trong video, mang tính chủ quan.*`
  },

  // BÀI 3 — KINH NGHIỆM CÂU CÁ SUỐI
  {
    slug: 'kinh-nghiem-cau-ca-suoi',
    title: 'Kinh nghiệm câu cá suối: Chọn mồi, chọn điểm và kỹ thuật câu nước chảy',
    metaTitle: 'Kinh nghiệm câu cá suối cho người mới | Mồi câu cá suối hiệu quả',
    metaDescription: 'Hướng dẫn câu cá suối: các loại mồi hiệu quả (minnow, cá sắt, mồi thìa, spinner, chuột lure), cách chọn điểm câu ở lạch nước chảy từ núi, kỹ thuật câu nước chảy và mẹo giữ cá.',
    keywords: ['câu cá suối', 'mồi câu cá suối', 'câu spinner', 'câu cá nước chảy', 'mồi thìa câu cá'],
    category: 'Kinh Nghiệm Câu Cá',
    categorySlug: 'kinh-nghiem-cau-ca',
    summary: 'Kinh nghiệm câu cá suối từ chuyến đi thực tế: chọn mồi minnow, cá sắt, mồi thìa, spinner, chuột lure; tìm điểm câu ở lạch nước chảy từ núi; kỹ thuật câu nước chảy và cách xử lý cá dính câu.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-08-15',
    readTime: '6 phút đọc',
    relatedCategorySlug: 'day-cau',
    contentMarkdown: `# Kinh nghiệm câu cá suối: Chọn mồi, chọn điểm và kỹ thuật câu nước chảy

**Meta description:** Kinh nghiệm câu cá suối từ chuyến đi thực tế: chọn mồi minnow, cá sắt, mồi thìa, spinner, chuột lure; tìm điểm câu ở lạch nước chảy từ núi; kỹ thuật câu nước chảy và cách xử lý cá dính câu.

---

## Câu cá suối khác gì câu cá đồng?

Câu cá suối diễn ra ở môi trường nước chảy — lạch suối, chân thác, khu vực nước dâng ngập cây rừng. So với câu cá đồng (nước tĩnh), câu cá suối đòi hỏi:

- Chọn mồi phù hợp với dòng chảy.
- Đọc được địa hình để tìm điểm cá tụ.
- Kỹ thuật thả mồi và giật cần khác biệt vì nước chảy liên tục.

Bài viết này tổng hợp từ chuyến đi câu cá suối được ghi hình của LK Hòa tại một con đập tự nhiên ở khu vực rừng nguyên sinh (địa điểm cụ thể chưa xác minh).

## 1. Mồi câu cá suối: 5 loại được dùng thực tế

Trong video, các loại mồi được chuẩn bị cho chuyến câu cá suối gồm:

1. **Minnow** (mồi giả dạng cá con) — mô phỏng cá nhỏ, phù hợp nước chảy.
2. **Cá sắt** (lure kim loại dạng cá) — nặng, đi xa, rung mạnh trong nước chảy.
3. **Mồi thìa (spoon)** — lắc lư lấp lánh khi thu, kích thích cá suối tấn công.
4. **Spinner** — cánh quay tạo rung động và phản quang, một trong những mồi được người trong video ưa thích nhất khi đi suối.
5. **Chuột lure** (mồi giả dạng chuột) — cho các loài cá săn mồi lớn.

> **Lưu ý:** Tên các loại mồi ghi theo transcript tự động (minnow, cá sắt, mồi thìa, spinner, chuột tiểu lure). Cần đối chiếu hình ảnh trong video để xác nhận chính xác từng loại trước khi xuất bản.

## 2. Chọn điểm câu: "càng gần vực suối, cá càng to"

Kinh nghiệm quan trọng nhất được nhắc đi nhắc lại trong video:

- **Cá suối thường tụ về nơi có nước từ trên núi chảy xuống** — lạch nước, cửa thác, chân vực.
- Trong một con đập lớn, những điểm có dòng chảy vào (kiểu "dòng thác chạy xuống") là nơi cá tập trung.
- **"Càng gần vực suối thì cá càng to"** — vực sâu, nước chảy mạnh là nơi trú ngụ của cá lớn.
- Khu vực rừng bị ngập nước (cây khô, cây mục chìm) là nơi cá suối trú ẩn và kiếm ăn.

Mẹo đọc điểm câu:
- Đến một lạch nước chảy từ núi xuống → gần như chắc chắn có cá suối.
- Những khúc quanh, nơi nước đổ xuống tạo xoáy → cá đứng chờ mồi trôi qua.
- Cạnh gốc cây chìm, bụi cây ven bờ → nơi cá ẩn nấp.

## 3. Kỹ thuật câu nước chảy cơ bản

Từ diễn biến thực tế trong video:

- **Thả mồi xuôi theo dòng chảy** về phía vực/lạch nước, để mồi tự nhiên trôi như con mồi thật.
- **Thu mồi ngược dòng hoặc cắt ngang dòng** với nhịp giật — tạo chuyển động rung lắc cho lure.
- Khi cá tấn công, **giật cần dứt khoát** ngay — cá suối cắn câu thường nhanh và mạnh.
- **Chú ý dây vướng gốc cây chìm** — địa hình suối nhiều chướng ngại, dễ mất mồi.

Trong video ghi nhận những pha cá cắn câu dữ dội ngay tại khu vực gần vực, và cả những pha cá tuột mồi hoặc đứt dây — minh chứng cho độ khó của địa hình nước chảy.

## 4. Cá chuối và mùa ăn quả rơi

Một chi tiết thú vị trong video: ở khu vực có cây rừng trĩu quả bên bờ suối, **cá chuối (cá lóc suối) thường rình ăn quả rơi xuống nước**. Người trong video còn cảnh báo:

- Một số loại **quả rừng có độc** — cá ăn quả đó thì thịt có thể nhiễm độc, ăn vào dễ bị mệt/mửa.
- Vì vậy **mùa quả rụng, nên thận trọng khi ăn cá chuối bắt được ở khu vực đó**.
- Đây là lưu ý an toàn thực phẩm hiếm khi được nhắc đến — rất đáng giá cho người câu cá tự nhiên.

## 5. Thả cá — giữ gìn nguồn lợi

Điểm đáng ghi nhận trong video: những con cá đẹp được **thả lại tự nhiên** ("đẹp là phải thả"), chỉ giữ lại một phần đủ ăn. Đây là thói quen nên khuyến khích:

- Chỉ giữ cá đủ bữa ăn.
- Thả cá nhỏ và cá đang mang trứng.
- Giữ gìn môi trường suối, không xả rác, không dùng kích điện.

## 6. Thưởng thức: cá suối nướng ngay tại chỗ

Phần thú vị nhất của chuyến đi: **nướng cá suối ngay bên bờ** — nhóm lửa, nướng cá vừa câu được, bọc lá chuối. Kinh nghiệm ghi nhận:

- Cá suối bắt xong nướng liền tại chỗ là "đỉnh" — thịt ngọt, béo.
- **Phần đầu cá suối được nhận xét là béo và nhiều thịt nhất** — một số người còn nghi ngờ nhưng khi ăn thử thì xác nhận.
- Thịt cá suối được mô tả ngọt, chắc, khác hẳn cá nuôi.

## Câu hỏi thường gặp (FAQ)

**Hỏi: Câu cá suối dùng mồi gì tốt nhất?**
Trả lời: Theo kinh nghiệm trong video, các loại hiệu quả gồm minnow, cá sắt, mồi thìa, spinner và chuột lure. Spinner được người trong video đặc biệt ưa thích khi câu suối vì tạo rung động mạnh trong nước chảy.

**Hỏi: Nên câu cá suối ở đâu trong con suối?**
Trả lời: Ưu tiên các lạch nước chảy từ núi xuống, chân vực, cửa thác và khu vực có cây chìm. Kinh nghiệm trong video: càng gần vực suối, cá càng to.

**Hỏi: Ăn cá suối bắt ở khu vực có cây rừng có an toàn không?**
Trả lời: Cần thận trọng vào mùa quả rụng — một số quả rừng có độc, cá ăn quả đó có thể nhiễm độc. Nên kiểm tra nguồn nước và khu vực trước khi ăn.

---

*Nguồn tham khảo: chuyến đi câu cá suối trong video LK Hòa "Lang Thang Ở Lào Tìm Loài Cá Tiến Vua Quý Hiếm". Transcript là phụ đề tự động tiếng Việt, một số chi tiết có thể sai chính tả hoặc chưa khớp hình.*`
  },

  // BÀI 4 — CÁ TIẾN VUA (PA MÍ) — LOÀI CÁ QUÝ HIẾM
  {
    slug: 'ca-tien-vua-pa-mi-loai-ca-quy-hiem',
    title: 'Cá tiến vua (pa mí) — Loài cá quý hiếm và câu chuyện săn tìm ở dòng suối Lào',
    metaTitle: 'Cá tiến vua pa mí là cá gì? | Loài cá quý hiếm sông suối Lào',
    metaDescription: "Tìm hiểu về loài cá quý hiếm được gọi là 'cá tiến vua' (pa mí): vì sao ngày càng hiếm, tác động của đập thủy điện, và hành trình săn tìm loài cá này ở dòng suối Lào.",
    keywords: ['cá tiến vua', 'cá pa mí', 'cá quý hiếm Lào', 'cá suối quý hiếm', 'săn cá tiến vua'],
    category: 'Kiến Thức Loài Cá',
    categorySlug: 'kien-thuc-loai-ca',
    summary: '"Cá tiến vua" (pa mí) là loài cá quý hiếm được nhắc đến trong chuyến đi câu tại Lào. Tìm hiểu vì sao loài cá này ngày càng hiếm, ảnh hưởng của đập thủy điện và hành trình săn tìm của dân câu chuyên nghiệp.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-08-15',
    readTime: '5 phút đọc',
    relatedCategorySlug: 'phao-luoi',
    contentMarkdown: `# Cá tiến vua (pa mí) — Loài cá quý hiếm và câu chuyện săn tìm ở dòng suối Lào

**Meta description:** "Cá tiến vua" (pa mí) là loài cá quý hiếm được nhắc đến trong chuyến đi câu tại Lào. Tìm hiểu vì sao loài cá này ngày càng hiếm, ảnh hưởng của đập thủy điện và hành trình săn tìm của dân câu chuyên nghiệp.

---

## Loài cá được gọi là "cá tiến vua"

Trong chuyến đi câu được ghi hình tại một con đập tự nhiên ở Lào, nhóm câu thủ đặt mục tiêu tìm một loài cá quý hiếm được gọi là **"pa mí"** (tên theo transcript tự động, có thể là "pa mí" hoặc "pami" — **chưa xác minh được tên loài chính xác**).

> **Cảnh báo dữ kiện:** Tên loài "pa mí/pami" và tên gọi "cá tiến vua" lấy từ transcript tự động tiếng Việt của video. Chưa có nguồn khoa học hoặc hình ảnh xác nhận đây là loài nào (có thể là một loài cá nước ngọt quý hiếm ở khu vực Đông Dương). **Không khẳng định tên loài chính xác khi chưa có nguồn kiểm chứng.**

## 1. Vì sao loài cá này ngày càng hiếm?

Theo lời giới thiệu trong video, có hai nguyên nhân chính được nêu ra:

**Nguyên nhân 1 — Đập thủy điện chặn đường di cư:**
Việc xây dựng các đập thủy điện làm loài cá này **không thể ngược dòng lên suối để sinh sản**, khiến số lượng suy giảm nghiêm trọng. Đây là vấn đề chung của nhiều loài cá di cư ở các con sông lớn khu vực Đông Nam Á.

**Nguyên nhân 2 — Thịt ngon nên bị khai thác mạnh:**
Loài cá này được mô tả có **thịt cực kỳ ngon** — đây được xem là lý do khiến chúng bị săn bắt nhiều hơn cả tác động của đập thủy điện.

## 2. Hành trình săn tìm: mục tiêu và thực tế

Chuyến đi được thiết lập với mục tiêu rõ ràng: tìm và chiêm ngưỡng vẻ đẹp của loài cá quý hiếm này **ngoài tự nhiên**. Điểm đến là:

- Một **con đập tự nhiên** nằm trong khu vực rừng nguyên sinh.
- Khu vực nước dâng ngập cây rừng — cây khô, cây mục chìm dưới nước.
- Các **lạch nước chảy từ trên núi xuống** — nơi tập trung cá suối.

Trong chuyến đi, nhóm câu được nhiều loại cá suối, trong đó có khoảnh khắc được nhắc đến với sự phấn khích: **"lần đầu tiên câu được con cá pa mí"** (theo transcript) — tuy nhiên chi tiết này **chưa xác minh bằng hình ảnh** rõ ràng.

## 3. Bài học bảo tồn từ câu chuyện

Câu chuyện về loài cá quý hiếm này gợi lên vài điều đáng suy nghĩ cho người câu cá và người yêu thiên nhiên:

1. **Cá di cư cần hành lang sinh sản** — đập thủy điện cần thiết kế đường cho cá vượt qua (fishway) nếu muốn bảo tồn nguồn lợi.
2. **Khai thác hợp lý** — loài quý hiếm, thịt ngon dễ bị khai thác cạn kiệt; cần quy định mùa vụ và kích thước tối thiểu.
3. **Câu rồi thả** — trong video, những con cá đẹp được thả lại tự nhiên ("đẹp là phải thả"), một thói quen nên nhân rộng.
4. **Ghi chép và chia sẻ** — những chuyến đi như thế này giúp cộng đồng hiểu hơn về loài quý hiếm và áp lực lên môi trường sống của chúng.

## 4. Góc nhìn cho người câu cá

Nếu bạn muốn trải nghiệm câu cá suối kiểu này:

- Chuẩn bị mồi đa dạng: minnow, cá sắt, mồi thìa, spinner, chuột lure (xem bài "Kinh nghiệm câu cá suối").
- Tôn trọng quy định địa phương — một số loài quý hiếm bị cấm khai thác.
- Nếu tình cờ bắt được loài quý hiếm, nên chụp ảnh làm kỷ niệm rồi thả lại.
- Ghi rõ địa điểm, thời gian và đặc điểm cá để đóng góp dữ liệu cho cộng đồng nghiên cứu.

## Câu hỏi thường gặp (FAQ)

**Hỏi: Cá tiến vua (pa mí) là cá gì?**
Trả lời: Theo video của LK Hòa, đây là loài cá nước ngọt quý hiếm ở khu vực Lào, được mô tả có thịt rất ngon và đang suy giảm do đập thủy điện chặn đường sinh sản. Tên loài khoa học chính xác chưa được xác minh trong nguồn hiện có.

**Hỏi: Vì sao cá tiến vua ngày càng hiếm?**
Trả lời: Hai nguyên nhân chính được nêu trong video: đập thủy điện ngăn cá ngược dòng sinh sản, và thịt ngon khiến loài bị khai thác mạnh.

**Hỏi: Có nên săn bắt loài cá quý hiếm này không?**
Trả lời: Nên tôn trọng quy định địa phương và ưu tiên bảo tồn. Thói quen "câu rồi thả" đối với loài quý hiếm là điều nên làm.

---

*Nguồn tham khảo: video LK Hòa "Lang Thang Ở Lào Tìm Loài Cá Tiến Vua Quý Hiếm". Toàn bộ thông tin về loài cá lấy từ lời giới thiệu trong video (transcript tự động), chưa được kiểm chứng độc lập.*`
  },

  // Existing Knowledge Articles
  {
    slug: 'cach-chon-can-cau-lure-cho-nguoi-moi',
    title: 'Cách chọn cần câu lure cho người mới bắt đầu',
    metaTitle: 'Cách chọn cần câu lure cho người mới bắt đầu | Đồ Câu LK Hòa',
    metaDescription: 'Hướng dẫn chi tiết chọn độ dài, độ cứng (ML, M, MH) và chất liệu carbon cần câu lure LK Hòa chuẩn kỹ thuật cho cần thủ mới gia nhập.',
    keywords: ['cần câu lure', 'chọn cần lure', 'cần lure người mới', 'đồ câu lk hòa'],
    category: 'Chọn cần câu',
    categorySlug: 'can-cau',
    summary: 'Hướng dẫn chi tiết chọn độ dài, độ cứng (ML, M, MH) và chất liệu carbon cần câu lure LK Hòa chuẩn kỹ thuật cho cần thủ mới gia nhập.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-08-10',
    readTime: '6 phút đọc',
    relatedCategorySlug: 'can-cau',
    contentMarkdown: `## 1. Giới thiệu kỹ thuật câu lure và tầm quan trọng của chọn cần
Câu lure (câu mồi giả) là bộ môn đòi hỏi sự linh hoạt và cảm giác tay cao. Đối với người mới bắt đầu, việc chọn đúng cây cần câu lure sẽ quyết định đến 70% sự thành công của chuyến đi câu.

## 2. Chọn loại máy đứng (Spinning) hay máy ngang (Baitcasting)?
Đối với cần thủ mới tập lure, **cần lure máy đứng** là lựa chọn tối ưu nhất vì ít bị rối dây, dễ ném mồi xa và thao tác đơn giản hơn cần máy ngang.

## 3. Độ cứng cần lure phù hợp cho người mới
- **Độ cứng L / ML (Light / Medium Light):** Thích hợp câu mồi nhỏ, mồi ruồi, bắt cá chẽm, cá măng nhỏ.
- **Độ cứng M / MH (Medium / Medium Heavy):** Độ cứng quốc dân cho người mới. Tải mồi từ 7g - 21g, đánh lóc, chẽm, trắm đen rất đầm tay.

## 4. Chiều dài cần lure lý tưởng
Nên chọn chiều dài từ **1.98m (6.6ft) đến 2.1m (7.0ft)**. Độ dài này giúp kiểm soát đường ném chính xác ở cả bờ sông hẹp lẫn hồ rộng.`
  },
  {
    slug: 'cach-chon-do-cung-can-cau-dai',
    title: 'Cách chọn độ cứng cần câu đài: 3H, 4H, 5H, 6H hay 8H?',
    metaTitle: 'Cách chọn độ cứng cần câu đài 3H 4H 5H 6H 8H | Đồ Câu LK Hòa',
    metaDescription: 'Phân tích chi tiết độ cứng H trong câu đài, cách chọn cần câu rô diếc, chép hồ dịch vụ và cần bạo lực săn hàng trắm đen.',
    keywords: ['độ cứng cần đài', 'cần đài 5h', 'cần đài 6h', 'cần đài 8h'],
    category: 'Chọn cần câu',
    categorySlug: 'can-cau',
    summary: 'Phân tích chi tiết độ cứng H trong câu đài, cách chọn cần câu rô diếc, chép hồ dịch vụ và cần bạo lực săn hàng trắm đen.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-08-05',
    readTime: '7 phút đọc',
    relatedCategorySlug: 'can-cau',
    contentMarkdown: `## 1. Độ cứng "H" trong cần câu đài là gì?
"H" là viết tắt của Hardness (độ cứng của lóng cần). Chỉ số H càng cao thì thân cần càng cứng, độ nảy nhanh và tải cá nặng khỏe hơn.

## 2. Bảng phân loại độ cứng H chuẩn
- **3H - 4H:** Dẻo, êm tay, phù hợp câu cá rô phi, cá diếc nhỏ, cho cảm giác dòng cá rất phê.
- **5H - 6H:** Độ cứng đa năng nhất, đánh cá chép, trôi từ 1kg - 5kg cả hồ dịch vụ lẫn sông tự nhiên.
- **8H trở lên:** Cần săn hàng bạo lực, chuyên bo cá trắm đen khủng trên 10kg.`
  },
  {
    slug: 'cach-chon-moi-cau-chep',
    title: 'Bí quyết chọn và pha mồi câu cá chép siêu nhạy',
    metaTitle: 'Bí quyết pha mồi câu cá chép siêu nhạy | Đồ Câu LK Hòa',
    metaDescription: 'Tổng hợp công thức ủ cám nền, tinh mùi hoa quả và cách trạng thái mồi tơi xốp dụ cá chép củ vào ổ nhanh nhất.',
    keywords: ['mồi câu chép', 'pha mồi câu chép', 'mồi lk hòa'],
    category: 'Mồi câu cá',
    categorySlug: 'moi-cau',
    summary: 'Tổng hợp công thức ủ cám nền, tinh mùi hoa quả và cách trạng thái mồi tơi xốp dụ cá chép củ vào ổ nhanh nhất.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-07-28',
    readTime: '6 phút đọc',
    relatedCategorySlug: 'moi-cau',
    contentMarkdown: `## 1. Tập tính ăn mồi của cá chép
Cá chép là loài ăn đáy, rất nhạy cảm với mùi thơm ngậy lên men tự nhiên và vị ngọt bùi của ngũ cốc ngô nếp.

## 2. Công thức pha mồi chuẩn LK Hòa
- **Cám nền chép LK:** 60%
- **Bột ngũ cốc / mầm lúa mạch:** 20%
- **Tinh mùi chép / sữachép:** 2-3 giọt
- Trộn đều với nước hồ theo tỉ lệ 1 mồi : 0.8 nước để trạng thái mồi tơi xốp bung tỏa dưới đáy hồ.`
  },
  {
    slug: 'cach-chon-day-pe-cau-lure',
    title: 'Kinh nghiệm chọn dây PE X8 chống xoắn câu lure cá lóc',
    metaTitle: 'Kinh nghiệm chọn dây PE X8 câu lure cá lóc | Đồ Câu LK Hòa',
    metaDescription: 'So sánh dây PE X4 và PE X8, cách chọn size dây #1.5, #2.0 câu lóc chẽm và dây leader chống ma sát cắn đứt.',
    keywords: ['dây pe x8', 'dây câu lure', 'dây pe lk hòa'],
    category: 'Dây câu cá',
    categorySlug: 'day-cau',
    summary: 'So sánh dây PE X4 và PE X8, cách chọn size dây #1.5, #2.0 câu lóc chẽm và dây leader chống ma sát cắn đứt.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-07-20',
    readTime: '5 phút đọc',
    relatedCategorySlug: 'day-cau',
    contentMarkdown: `## 1. Sự khác biệt giữa dây PE X4 và Dây PE X8
Dây PE X8 được bện từ 8 sợi dệt siêu mịn, bề mặt tròn mịn giúp ném mồi xa hơn, mượt hơn và chìm nhanh hơn so với dây X4.

## 2. Chọn cỡ dây PE chuẩn
Nên chọn dây PE X8 LK Hòa size #1.5 đến #2.0 cho cá lóc sông/hồ, vừa chống sờn ma sát vừa bảo vệ khoen cần.`
  }
];

export const GUIDE_ARTICLES: GuideArticle[] = [
  ...BASE_GUIDE_ARTICLES,
  ...PRODUCT_GUIDES_BATCH_1,
  ...PRODUCT_GUIDES_BATCH_2,
  ...PRODUCT_GUIDES_BATCH_3
];
