import type { GuideArticle } from './guides';

type ReviewInput = {
  slug: string;
  title: string;
  description: string;
  keywords: string[];
  category: string;
  categorySlug: string;
  audience: string;
  verdict: string;
  criteria: Array<[string, string]>;
  recommendations: string[];
  cautions: string[];
};

const buildReview = (item: ReviewInput): GuideArticle => ({
  slug: item.slug,
  title: item.title,
  metaTitle: `${item.title} | Đồ Câu LK Hòa`,
  metaDescription: item.description,
  keywords: item.keywords,
  category: item.category,
  categorySlug: item.categorySlug,
  summary: item.description,
  author: 'Ban biên tập Đồ Câu LK Hòa',
  date: '2026-08-29',
  readTime: '7 phút đọc',
  relatedCategorySlug: item.categorySlug,
  contentMarkdown: `# ${item.title}

> **Minh bạch đánh giá:** Bài viết phân tích dữ liệu danh mục LK Hòa, thông số công bố và tình huống sử dụng được ghi nhận trong nội dung thực tế của thương hiệu. Chúng tôi không tuyên bố đã kiểm thử độc lập những đặc tính chưa có số đo. Giá và ưu đãi có thể thay đổi tại Shopee/TikTok Shop.

## Kết luận nhanh

${item.verdict}

**Phù hợp nhất với:** ${item.audience}

## Tiêu chí chọn và so sánh

| Tiêu chí | Nhận định có thể kiểm chứng |
|---|---|
${item.criteria.map(([name, value]) => `| ${name} | ${value} |`).join('\n')}

## Nên chọn phương án nào?

${item.recommendations.map((text, index) => `${index + 1}. ${text}`).join('\n')}

## Hạn chế cần biết trước khi bấm mua

${item.cautions.map(text => `- ${text}`).join('\n')}

## Cách kiểm tra trước khi đặt hàng

1. Mở liên kết sản phẩm và đối chiếu đúng tên phiên bản, độ cứng, chiều dài hoặc trọng lượng mồi.
2. Kiểm tra giá sau voucher, phí vận chuyển và chính sách đổi trả ngay trên sàn.
3. Nhắn shop xác nhận phụ kiện đi kèm nếu mô tả có nhiều biến thể.
4. Quay video khi mở kiện để có bằng chứng nếu sản phẩm giao sai hoặc hư hỏng.

## Công bố liên kết

Bài viết có liên kết tiếp thị liên kết. Đồ Câu LK Hòa có thể nhận hoa hồng khi người đọc mua qua liên kết, nhưng giá thanh toán của người mua không tăng vì việc này.`,
});

export const AFFILIATE_REVIEW_GUIDES: GuideArticle[] = [
  buildReview({
    slug: 'so-sanh-can-cau-dai-lk-hoa-5h-6h-8h',
    title: 'So sánh cần câu đài LK Hòa 5H, 6H và 8H: chọn độ cứng nào?',
    description: 'So sánh cần LK Hòa 5H, 6H và 8H theo độ cứng, khả năng kiểm soát cá, cảm giác sử dụng và nhu cầu câu hồ dịch vụ.',
    keywords: ['cần LK Hòa 5H', 'cần câu 6H', 'cần câu 8H', 'so sánh độ cứng cần câu'],
    category: 'Review & So sánh', categorySlug: 'can-cau',
    audience: 'người câu đài muốn chọn độ cứng theo cỡ cá và cách đánh',
    verdict: '5H cân bằng và dễ làm quen; 6H ưu tiên kiểm soát cá nhanh hơn; 8H chỉ phù hợp khi người dùng thực sự cần thân cần rất cứng và đã quen thao tác.',
    criteria: [['Độ cứng', '5H < 6H < 8H; con số cao hơn không đồng nghĩa tốt hơn cho mọi người'], ['Cảm giác', '5H thường dễ cảm nhận cá hơn, 8H thiên về ghì và đưa cá nhanh'], ['Người mới', 'Nên bắt đầu với 5H hoặc bản tổng hợp có thông số rõ'], ['Điểm câu', 'Hồ dịch vụ và mật độ chướng ngại ảnh hưởng lựa chọn nhiều hơn tên phiên bản']],
    recommendations: ['Chọn 5H nếu cần một cây đa dụng và chưa xác định rõ hồ câu.', 'Chọn 6H khi thường câu cá vừa/lớn và cần kiểm soát nhanh.', 'Chọn 8H khi đã hiểu tải dây, thẻo và kỹ thuật ghì cá.'],
    cautions: ['Độ cứng H không phải chuẩn tuyệt đối giữa mọi dòng cần.', 'Không suy ra tải cá chỉ từ nhãn 5H/6H/8H.', 'Cần đối chiếu đúng chiều dài và phiên bản trên sàn.'],
  }),
  buildReview({
    slug: 'so-sanh-can-lk-tong-hop-va-lk-ro-chep',
    title: 'Cần LK Tổng Hợp và LK Rô Chép: dòng nào hợp nhu cầu của bạn?',
    description: 'So sánh hai nhóm cần LK Tổng Hợp và LK Rô Chép theo đối tượng cá, cách sử dụng, độ linh hoạt và ngân sách.',
    keywords: ['cần LK Tổng Hợp', 'cần LK Rô Chép', 'so sánh cần LK Hòa'],
    category: 'Review & So sánh', categorySlug: 'can-cau',
    audience: 'người phân vân giữa cần đa dụng và cần thiên về rô, chép',
    verdict: 'Bản Tổng Hợp hợp người cần một cây dùng nhiều tình huống; bản Rô Chép hợp người có điểm câu và đối tượng cá tương đối ổn định.',
    criteria: [['Mục đích', 'Tổng Hợp ưu tiên độ linh hoạt; Rô Chép ưu tiên đúng nhóm cá mục tiêu'], ['Lựa chọn size', 'Cả hai có nhiều chiều dài, cần chọn theo khoảng cách điểm câu'], ['Ngân sách', 'So sánh giá cuối sau voucher thay vì giá gạch ngang'], ['Phụ kiện', 'Dây, phao và thẻo đúng tải quan trọng không kém thân cần']],
    recommendations: ['Chọn Tổng Hợp nếu mới chơi hoặc thường đổi hồ.', 'Chọn Rô Chép nếu chủ yếu câu hai nhóm cá này.', 'Ưu tiên size thường dùng thay vì mua cây dài nhất.'],
    cautions: ['Tên dòng không thay thế thông số thực tế.', 'Cùng tên nhưng biến thể chiều dài có thể khác giá và trọng lượng.', 'Hỏi shop về phụ kiện/bảo hành lóng trước khi mua.'],
  }),
  buildReview({
    slug: 'top-can-lure-lk-hoa-cho-nguoi-moi',
    title: 'Top cần lure LK Hòa cho người mới: chọn theo ngân sách và điểm câu',
    description: 'Hướng dẫn chọn cần lure LK Hòa cho người mới theo máy đứng/ngang, chiều dài, độ cứng và ngân sách thực tế.',
    keywords: ['cần lure LK Hòa', 'cần lure người mới', 'cần lure giá rẻ'],
    category: 'Review & So sánh', categorySlug: 'can-cau',
    audience: 'người mới tập lure cá lóc, cá chẽm hoặc câu giải trí',
    verdict: 'Người mới nên ưu tiên cần máy đứng, chiều dài dễ thao tác và độ cứng M/MH; chưa cần mua bản nặng hoặc quá cứng chỉ vì tải tĩnh quảng cáo cao.',
    criteria: [['Loại máy', 'Máy đứng dễ làm quen hơn máy ngang'], ['Độ cứng', 'M/MH thường linh hoạt cho người mới'], ['Chiều dài', 'Phải phù hợp bờ hẹp, thuyền hoặc không gian quăng'], ['Tổng chi phí', 'Tính cả máy, dây PE, leader và mồi chứ không chỉ giá cần']],
    recommendations: ['Chọn combo máy đứng nếu chưa có thiết bị.', 'Chọn cần rời nếu đã có máy và hiểu cỡ dây.', 'Ưu tiên sản phẩm có biến thể, phụ kiện và chính sách rõ.'],
    cautions: ['Không dùng tải tĩnh làm tải cá thực tế.', 'Máy ngang cần thời gian học chống rối dây.', 'Kiểm tra chuẩn khoen và loại cán trước khi đặt.'],
  }),
  buildReview({
    slug: 'combo-can-may-lure-lk-hoa-duoi-2-trieu',
    title: 'Combo cần máy lure LK Hòa dưới 2 triệu: mua combo hay ghép riêng?',
    description: 'So sánh combo lure LK Hòa với phương án ghép cần, máy, dây và mồi riêng trong ngân sách dưới 2 triệu đồng.',
    keywords: ['combo lure LK Hòa', 'combo cần máy dưới 2 triệu', 'bộ cần lure người mới'],
    category: 'Review & So sánh', categorySlug: 'can-cau',
    audience: 'người muốn mua một bộ lure có thể sử dụng sớm và dễ kiểm soát chi phí',
    verdict: 'Combo thuận tiện và ít sai tương thích; ghép riêng có lợi khi người mua đã biết rõ máy, tỷ số truyền, cỡ dây và loại mồi sẽ dùng.',
    criteria: [['Tương thích', 'Combo giảm rủi ro sai chân máy hoặc cỡ dây'], ['Linh hoạt', 'Ghép riêng cho phép nâng chất lượng từng món'], ['Chi phí', 'Cần so tổng giá sau voucher và phụ kiện còn thiếu'], ['Bảo hành', 'Kiểm tra từng thành phần có chính sách riêng hay chung']],
    recommendations: ['Người mới chọn combo mô tả đầy đủ thành phần.', 'Người đã có dây/mồi nên cân nhắc cần + máy.', 'Giữ lại 10–20% ngân sách cho leader, khóa và mồi.'],
    cautions: ['“Full bộ” không luôn bao gồm mọi món trong ảnh.', 'Giá combo có thể cao hơn ghép riêng khi hết voucher.', 'Xác nhận size máy và tay quay trước khi mua.'],
  }),
  buildReview({
    slug: 'so-sanh-day-pe-x4-va-x8-lk-hoa',
    title: 'Dây PE X4 và X8 LK Hòa: loại nào hợp câu lure hơn?',
    description: 'So sánh dây PE X4 và X8 LK Hòa về độ mịn, đường kính, khoảng ném, khả năng chịu ma sát và chi phí.',
    keywords: ['dây PE X4', 'dây PE X8 LK Hòa', 'dây câu lure'],
    category: 'Review & So sánh', categorySlug: 'day-cau',
    audience: 'người câu lure cần chọn dây theo địa hình và ngân sách',
    verdict: 'X8 thường mượt và hỗ trợ ném tốt; X4 có thể kinh tế và hợp nơi nhiều ma sát hơn. Chọn size đúng quan trọng hơn chạy theo số lõi.',
    criteria: [['Bề mặt', 'X8 thường tròn và mịn hơn'], ['Khoảng ném', 'Dây mịn hỗ trợ thoát khoen tốt khi bộ máy phù hợp'], ['Ma sát', 'Địa hình đá/cỏ cần leader và kiểm tra dây thường xuyên'], ['Chi phí', 'X4 thường dễ tiếp cận hơn']],
    recommendations: ['Chọn X8 cho nhu cầu ném mượt ở địa hình thoáng.', 'Chọn X4 nếu ưu tiên chi phí và thay dây thường xuyên.', 'Ghép leader phù hợp thay vì tăng size PE quá mức.'],
    cautions: ['Số lõi không đảm bảo chất lượng nếu đường kính công bố thiếu chính xác.', 'Màu dây có thể phai theo thời gian.', 'Kiểm tra đủ chiều dài cuộn khi nhận hàng.'],
  }),
  buildReview({
    slug: 'so-sanh-moi-chep-do-va-chep-den-lk-hoa',
    title: 'Mồi chép đỏ và chép đen LK Hòa: dùng loại nào theo điều kiện hồ?',
    description: 'So sánh mồi chép đỏ và chép đen LK Hòa theo mục tiêu sử dụng, cách pha thử và phương pháp chọn mồi tại hồ.',
    keywords: ['mồi chép đỏ LK Hòa', 'mồi chép đen LK Hòa', 'mồi câu cá chép'],
    category: 'Review & So sánh', categorySlug: 'moi-cau',
    audience: 'người câu chép muốn thử mồi có kiểm soát thay vì trộn quá nhiều phụ gia',
    verdict: 'Không có một màu mồi thắng ở mọi hồ. Nên thử từng loại với lượng nhỏ, giữ nguyên các biến khác và ghi nhận thời gian cá vào ổ.',
    criteria: [['Điều kiện hồ', 'Nước, thời tiết và thức ăn sẵn có làm thay đổi phản ứng cá'], ['Cách thử', 'Pha hai mẻ nhỏ cùng độ ẩm để so sánh'], ['Độ kết dính', 'Điều chỉnh theo dòng nước và cách câu'], ['Chi phí', 'Tính số buổi dùng được thay vì chỉ giá một gói']],
    recommendations: ['Bắt đầu với công thức đơn giản theo hướng dẫn bao bì.', 'Chỉ đổi một biến mỗi lần thử.', 'Ghi nhật ký hồ, thời tiết và thời gian cá ăn.'],
    cautions: ['Không khẳng định hiệu quả tuyệt đối chỉ từ một buổi câu.', 'Tránh trộn nhiều tinh mùi ngay lần đầu.', 'Bảo quản kín và kiểm tra hạn dùng.'],
  }),
  buildReview({
    slug: 'top-moi-lure-ca-loc-lk-hoa',
    title: 'Top mồi lure cá lóc LK Hòa: chuột, rắn, rùa hay mồi mềm?',
    description: 'So sánh các dạng mồi lure cá lóc LK Hòa theo tầng nước, độ vướng, cách rê và điều kiện điểm câu.',
    keywords: ['mồi lure cá lóc LK Hòa', 'chuột lure', 'mồi rắn', 'mồi mềm cá lóc'],
    category: 'Review & So sánh', categorySlug: 'moi-cau',
    audience: 'người câu cá lóc ở ruộng, kênh, ao có cỏ hoặc mặt nước thoáng',
    verdict: 'Chuột/rắn/rùa phù hợp đánh mặt và nơi có cỏ; mồi mềm linh hoạt hơn ở nhiều tầng nước nhưng cách gắn lưỡi quyết định độ chống vướng.',
    criteria: [['Tầng nước', 'Mồi nổi đánh mặt; mồi mềm có thể điều chỉnh tầng'], ['Độ vướng', 'Thiết kế lưỡi và cách rig quan trọng hơn hình con mồi'], ['Kích thước', 'Phải cân bằng với cần, dây và cỡ cá mục tiêu'], ['Action', 'Cần kiểm tra action thực tế sau khi gắn khóa/lưỡi']],
    recommendations: ['Mang ít nhất một mồi mặt và một mồi mềm.', 'Dùng màu tương phản khi nước đục.', 'Thử tốc độ thu trước khi đổi mồi.'],
    cautions: ['Không có mồi nào chống vướng tuyệt đối.', 'Lưỡi sắc cần được che và bảo quản an toàn.', 'Không mua nhiều màu trước khi biết action phù hợp.'],
  }),
  buildReview({
    slug: 'cach-chon-phao-cau-dai-lk-hoa',
    title: 'Chọn phao câu đài LK Hòa: phao ngày, phao đêm và phao hồ đấu',
    description: 'So sánh các nhóm phao LK Hòa theo ánh sáng, độ sâu, tải chì và khả năng quan sát tín hiệu cá.',
    keywords: ['phao câu đài LK Hòa', 'phao đêm', 'phao hồ đấu'],
    category: 'Review & So sánh', categorySlug: 'phao-luoi',
    audience: 'người câu đài cần chọn phao theo thời gian và điều kiện mặt nước',
    verdict: 'Chọn phao theo tải chì, độ sâu và khả năng quan sát; không nên chọn chỉ vì thân nhỏ hoặc giá cao.',
    criteria: [['Ánh sáng', 'Phao ngày và phao đêm giải quyết hai nhu cầu khác nhau'], ['Tải chì', 'Phải cân với trục, thẻo và độ sâu'], ['Mặt nước', 'Gió/sóng cần tín hiệu đủ ổn định'], ['Khả năng nhìn', 'Khoảng cách và thị lực người câu ảnh hưởng màu ngọn phao']],
    recommendations: ['Chọn phao ngày dễ cân cho buổi tập đầu.', 'Dùng phao đêm đúng pin và kiểm tra chống nước.', 'Mang hai tải phao để thích ứng gió.'],
    cautions: ['Thông số tải chì cần được cân lại tại hồ.', 'Ngọn quá mảnh không luôn dễ đọc.', 'Kiểm tra thân phao cong/nứt khi nhận.'],
  }),
  buildReview({
    slug: 'bo-do-cau-ro-phi-ho-dich-vu',
    title: 'Bộ đồ câu rô phi hồ dịch vụ: cần, phao, dây và mồi nên ghép thế nào?',
    description: 'Gợi ý bộ câu rô phi hồ dịch vụ theo ngân sách, gồm cần, dây trục, thẻo, phao và cách thử mồi có kiểm soát.',
    keywords: ['bộ câu rô phi', 'đồ câu hồ dịch vụ', 'mồi rô phi LK Hòa'],
    category: 'Review & So sánh', categorySlug: 'moi-cau',
    audience: 'người muốn lắp một bộ câu rô phi đồng bộ, dễ thay thế và không mua thừa',
    verdict: 'Một bộ cân bằng giữa cần, dây, phao và thẻo hiệu quả hơn việc dồn ngân sách vào riêng thân cần. Nên chọn theo cỡ cá phổ biến của hồ.',
    criteria: [['Cần', 'Độ dài và độ cứng theo khoảng cách/cỡ cá'], ['Dây', 'Trục và thẻo phải có chênh lệch tải hợp lý'], ['Phao', 'Tải chì phù hợp độ sâu và gió'], ['Mồi', 'Thử tỷ lệ nước và thời gian ngấm trước khi thêm phụ gia']],
    recommendations: ['Hỏi hồ về cỡ cá và độ sâu trước khi mua.', 'Chuẩn bị thẻo dự phòng.', 'Dùng một công thức mồi cơ sở để đọc phản ứng cá.'],
    cautions: ['Không dùng dây quá lớn làm mất tín hiệu.', 'Bộ bán sẵn có thể thiếu phụ kiện nhỏ.', 'Giá mồi thấp nhưng dùng sai tỷ lệ vẫn tốn chi phí.'],
  }),
  buildReview({
    slug: 'do-cau-lk-hoa-cho-nguoi-moi-duoi-1-trieu',
    title: 'Đồ câu LK Hòa cho người mới dưới 1 triệu: nên mua gì trước?',
    description: 'Danh sách ưu tiên mua đồ câu LK Hòa cho người mới với ngân sách dưới 1 triệu, tránh mua thừa và dễ nâng cấp.',
    keywords: ['đồ câu LK Hòa dưới 1 triệu', 'đồ câu cho người mới', 'combo câu cá giá rẻ'],
    category: 'Review & So sánh', categorySlug: 'phu-kien',
    audience: 'người mới chưa có bộ đồ và muốn bắt đầu với ngân sách kiểm soát',
    verdict: 'Ưu tiên bộ tối thiểu dùng được ngay: cần phù hợp kiểu câu, dây, lưỡi/khóa, một ít mồi và dụng cụ an toàn. Chưa cần mua nhiều phụ kiện chuyên sâu.',
    criteria: [['Mục tiêu', 'Chọn câu đài hoặc lure trước khi mua'], ['Ngân sách', 'Dành phần dự phòng cho dây, lưỡi và vận chuyển'], ['Khả năng nâng cấp', 'Chọn món tiêu chuẩn, dễ thay thế'], ['Tần suất dùng', 'Không mua số lượng lớn trước buổi trải nghiệm đầu']],
    recommendations: ['Chốt kiểu câu và điểm câu thường đi.', 'Mua bộ cơ bản rồi bổ sung sau 2–3 buổi.', 'Ưu tiên dụng cụ an toàn và hộp bảo quản lưỡi.'],
    cautions: ['Không trộn thiết bị câu đài và lure nếu chưa hiểu tương thích.', 'Combo rẻ có thể cần thay dây/lưỡi.', 'Đối chiếu đúng danh sách món trong gói.'],
  }),
];
