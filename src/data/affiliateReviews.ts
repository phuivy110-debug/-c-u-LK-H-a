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
  contentMarkdown?: string;
  readTime?: string;
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
  author: 'LK Hòa',
  date: '2026-08-29',
  readTime: item.readTime || '7 phút đọc',
  relatedCategorySlug: item.categorySlug,
  contentMarkdown: item.contentMarkdown || `# ${item.title}

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
    readTime: '11 phút đọc',
    contentMarkdown: `# So sánh cần câu đài LK Hòa 5H, 6H và 8H: chọn độ cứng nào?

> **Phạm vi kiểm chứng:** Bảng sản phẩm LK Hòa được đối chiếu ngày 29/08/2026 hiện có các mẫu ghi rõ **5H**, chưa có SKU 6H hoặc 8H tách biệt. Vì vậy phần 6H/8H dưới đây giải thích cách chọn độ cứng, không giả định website đang bán một mẫu chưa có trong danh mục và không thay thế thông số của từng cây cần.

## Kết luận nhanh

- **5H:** điểm bắt đầu hợp lý khi cần một cây câu đài đa dụng, vẫn muốn cảm nhận cá và chưa cần tốc độ đưa cá quá cao.
- **6H:** chỉ đáng cân nhắc khi điểm câu, cỡ cá và cách đánh thực sự đòi hỏi thân cần cứng hơn.
- **8H:** là lựa chọn chuyên biệt; không nên mua chỉ vì nghĩ con số lớn hơn chắc chắn tốt hơn.

Nếu chưa biết chọn gì, hãy bắt đầu từ **5H đúng chiều dài**, rồi ghép dây trục, thẻo và phao theo cỡ cá thực tế của hồ.

## Đừng xem chữ H như một chuẩn đo tuyệt đối

Chữ H mô tả xu hướng độ cứng trong cùng một hệ sản phẩm, nhưng không phải chuẩn đo thống nhất giữa mọi hãng hoặc mọi đời cần. Hai cây cùng ghi 5H vẫn có thể khác nhau ở độ nảy, phân bố lực, trọng lượng và cảm giác đầu cần. Bởi vậy, nhãn 5H/6H/8H chỉ là bước lọc đầu tiên.

| Lựa chọn | Cảm giác sử dụng thường gặp | Tình huống nên cân nhắc | Trường hợp nên tránh |
|---|---|---|---|
| 5H | Cân bằng giữa độ nảy và khả năng kiểm soát | Người mới, câu rô–chép, hồ dịch vụ thông thường | Khi bắt buộc phải đưa cá rất nhanh khỏi chướng ngại |
| 6H | Thân cứng hơn, phản hồi nhanh hơn | Người đã quen ghì cá, hồ có mật độ cá/cường độ câu cao | Khi ưu tiên cảm giác cá nhỏ hoặc dùng bộ dây quá nhẹ |
| 8H | Thiên về tốc độ và lực kiểm soát | Tình huống chuyên biệt, người đã biết rõ bộ dây và kỹ thuật | Người mới, câu giải trí nhẹ, mua chỉ vì “H cao hơn” |

## Bốn biến quan trọng hơn việc tăng từ 5H lên 8H

### 1. Cỡ cá phổ biến, không phải con cá lớn nhất từng xuất hiện

Chọn cần theo nhóm cá gặp thường xuyên. Nếu phần lớn buổi câu là cá vừa, một cây quá cứng có thể làm bộ câu mất cân bằng và khó đọc tín hiệu hơn.

### 2. Chiều dài cần và khoảng cách điểm câu

Cùng độ cứng nhưng chiều dài khác nhau sẽ cho đòn bẩy và cảm giác khác nhau. Chốt chiều dài thực sự dùng được trước, sau đó mới so độ cứng.

### 3. Dây trục, thẻo và lưỡi

Cần cứng không bù được một bộ dây ghép sai. Thẻo phải là điểm bảo vệ có chủ đích; không tăng đồng loạt mọi thông số chỉ để “chắc hơn”.

### 4. Chướng ngại và quy định của hồ

Hồ thoáng cho phép xử lý cá mềm hơn. Điểm có bèo, cọc hoặc bờ dốc có thể cần kiểm soát nhanh, nhưng vẫn phải tuân theo cỡ dây và giới hạn của cây cần.

## Mẫu 5H đang có trong danh mục LK Hòa

Giá dưới đây là ảnh chụp dữ liệu ngày 29/08/2026 và có thể thay đổi theo voucher.

| Sản phẩm đã đối chiếu | Giá sale trong danh mục | Điều cần kiểm tra trên sàn |
|---|---:|---|
| [Cần câu đài 5H LK Tổng Hợp 2026](https://s.shopee.vn/5LB1Lgzjtf) | 1.050.000đ | Chiều dài, phụ kiện đi kèm, chính sách lóng |
| [Cần LK Hòa phiên bản Tổng Hợp 5H](https://s.shopee.vn/3qMDYyviHy) | 990.000đ | Đúng biến thể, quà tặng, giá cuối sau voucher |

Hai listing cùng ghi 5H nhưng không nên mặc định là một sản phẩm giống hệt nhau. Hãy đối chiếu ảnh, biến thể và mô tả ở trang thanh toán.

## Quy trình chọn trong ba phút

1. Ghi lại loại cá và cỡ cá thường gặp ở hồ.
2. Chốt chiều dài cần theo khoảng cách đánh.
3. Xác định bộ dây trục–thẻo đang dùng.
4. Nếu vẫn chưa có lý do rõ để lên 6H/8H, giữ lựa chọn 5H.
5. Nhắn shop xác nhận biến thể và bảo hành trước khi đặt.

## Ai không nên chọn 8H?

- Người mới chưa quen nhấc và dẫn cá.
- Người chủ yếu câu cá nhỏ hoặc câu thư giãn.
- Người đang dùng thẻo nhẹ nhưng chưa kiểm soát lực giật.
- Người chỉ dựa vào quảng cáo tải tĩnh mà chưa xem cấu hình thực tế.

## Minh bạch nội dung

Bài viết do **LK Hòa** biên soạn từ dữ liệu danh mục hiện có và nguyên tắc ghép bộ câu. Bài không tuyên bố đã thử độc lập một mẫu 6H/8H chưa xuất hiện trong danh mục. Liên kết Shopee là liên kết affiliate; giá người mua không tăng khi sử dụng liên kết.`,
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
    readTime: '12 phút đọc',
    contentMarkdown: `# Top cần lure LK Hòa cho người mới: chọn theo ngân sách và điểm câu

> **Cách đánh giá:** Bài này so sánh các listing đang có trong danh mục LK Hòa ngày 29/08/2026. Ảnh bên dưới là ảnh sản phẩm trong danh mục, không được trình bày như ảnh kiểm thử độc lập. Những thông số chưa xuất hiện rõ trong tên/biến thể phải được xác nhận lại trên sàn.

## Kết luận nhanh theo ngân sách

- **Ngân sách thấp nhất:** Cần Lure Tiểu Học LK, giá danh mục 319.000đ.
- **Muốn cần đứng một khúc:** so sánh Tiểu LK và STAR LK, kiểm tra lại chiều dài và độ cứng của đúng biến thể.
- **Muốn hai ngọn để đổi tình huống:** Cần TWO LK là listing duy nhất trong nhóm ghi rõ hai ngọn.
- **Chưa có máy:** cân nhắc combo CHEAP LK + Daiwa RS thay vì mua từng món mà chưa hiểu tương thích.

Không có cây “tốt nhất cho mọi người”. Người mới nên chọn cây phù hợp điểm câu và loại mồi trước khi chọn theo tên phiên bản.

## Bảng đối chiếu năm lựa chọn đang bán

Giá là dữ liệu danh mục tại thời điểm cập nhật, có thể thay đổi sau voucher và phí vận chuyển.

| Lựa chọn | Giá sale | Điều tên listing xác nhận | Phải hỏi thêm trước khi mua |
|---|---:|---|---|
| [Cần Lure Tiểu Học LK](https://s.shopee.vn/2qTgN58yOH) | 319.000đ | Phân khúc giá thấp, cần chuyên lure | Chiều dài, power, tải mồi, máy đứng/ngang |
| [Cần Lure Đứng 1 Khúc Tiểu LK](https://s.shopee.vn/7psMKARxov) | 450.000đ | Máy đứng, một khúc | Chiều dài vận chuyển, độ cứng, tải mồi |
| [Cần STAR LK 1 Khúc](https://s.shopee.vn/80BmWjcStk) | 459.000đ | Một khúc | Loại máy, power, khoen và tải mồi |
| [Cần Lure CHEAP LK](https://s.shopee.vn/5Arb9PvItR) | 590.000đ | Dòng giá học sinh–sinh viên | Cấu hình từng biến thể và phụ kiện |
| [Cần TWO LK 2 Ngọn](https://s.shopee.vn/6Ak8LVJsZR) | 620.000đ | Có hai ngọn | Power của từng ngọn, loại máy, tải mồi |

![Cần Lure Tiểu Học LK trong danh mục](https://i.postimg.cc/pr7n3GMc/vn-11134207-81ztc-mqifhmyoyeww59.webp)

*Ảnh listing Cần Lure Tiểu Học LK dùng để nhận diện sản phẩm; không phải ảnh test thực địa.*

## Chọn theo điểm câu, không chọn theo quảng cáo tải lớn

### Bờ hẹp, nhiều cây hoặc cần di chuyển nhiều

Ưu tiên cây dễ xoay trở và dễ vận chuyển. Cần một khúc có lợi về cấu trúc nhưng bất tiện khi chở; hãy đo cốp xe hoặc cách mang cần trước khi chốt.

### Bờ thoáng, cần ném xa

Chiều dài cần, tải mồi, cỡ dây và cách quấn máy cùng quyết định khoảng ném. Không thể kết luận ném xa chỉ từ tên sản phẩm.

### Bèo, cỏ và chướng ngại

Bạn cần một bộ cân bằng giữa độ cứng cần, dây PE, leader và kiểu lưỡi. Tăng riêng độ cứng của cần không giải quyết được mọi tình huống chống vướng.

### Câu suối hoặc cá nhỏ

Ưu tiên cảm giác và tải mồi nhỏ. Dòng cần lure suối là một nhóm riêng; không nên dùng bảng xếp hạng cá lóc để chọn cần UL.

## Máy đứng hay máy ngang cho buổi đầu?

Máy đứng thường có đường học ngắn hơn vì ít yêu cầu xử lý spool khi quăng. Máy ngang cho khả năng kiểm soát tốt khi đã quen, nhưng người mới có thể mất nhiều thời gian xử lý rối dây. Nếu mục tiêu là ra hồ và tập action sớm, bắt đầu bằng máy đứng là lựa chọn ít rủi ro hơn.

## Khi nào nên mua combo?

Nếu chưa có máy và dây, listing [Cần CHEAP LK + máy Daiwa RS](https://s.shopee.vn/8V837aM9xd) có giá danh mục 1.290.000đ. Combo giảm nguy cơ mua sai chân máy hoặc size máy, nhưng phải đọc danh sách thành phần thay vì suy đoán từ ảnh bìa.

Mua cần rời hợp hơn khi bạn đã có máy, biết cỡ dây và muốn kiểm soát từng món trong bộ.

## Kiểm tra tại nhà ngay khi nhận cần

1. Quay video mở kiện và đối chiếu đúng biến thể.
2. Nhìn dọc thân cần để kiểm tra khoen có thẳng hàng hay không.
3. Kiểm tra chân máy, tay cầm, khớp nối hoặc hai ngọn nếu có.
4. Không thử quá tải bằng cách treo vật nặng ngoài hướng dẫn.
5. Lắp máy và luồn dây, thử thao tác ở không gian an toàn trước khi ra hồ.

## Lựa chọn của LK Hòa cho ba kiểu người mới

- **Muốn bắt đầu rẻ và tự ghép bộ:** Tiểu Học LK, nhưng phải xác nhận power/tải mồi.
- **Muốn cần một khúc, máy đứng:** Tiểu LK là listing mô tả rõ nhất về kiểu máy và kết cấu.
- **Muốn linh hoạt hai ngọn:** TWO LK đáng xem, với điều kiện hai ngọn có thông số phù hợp loại mồi bạn dùng.

## Minh bạch nội dung

Bài do **LK Hòa** biên soạn từ danh mục sản phẩm và tiêu chí tương thích bộ lure. Bài không gán kết quả quăng xa, độ bền hoặc tải cá khi chưa có log test chuẩn hoá. Liên kết mua là affiliate; thứ tự so sánh không dựa trên mức hoa hồng.`,
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
    readTime: '10 phút đọc',
    contentMarkdown: `# Mồi chép đỏ và chép đen LK Hòa: dùng loại nào theo điều kiện hồ?

> **Phạm vi dữ liệu:** Danh mục affiliate được đối chiếu ngày 29/08/2026 chưa có hai SKU tách biệt mang đúng tên “mồi chép đỏ” và “mồi chép đen”. Bài này không tạo link mua thay thế và không khẳng định một màu mồi hiệu quả hơn khi chưa có nhật ký thử tại cùng điều kiện hồ.

## Kết luận nhanh

Không thể chọn mồi chép chỉ bằng màu bao bì. Cách chắc chắn nhất là pha hai mẻ nhỏ, giữ nguyên lượng nước và bộ câu, rồi ghi lại phản ứng cá. Nếu thay cả mồi, phụ gia, điểm đánh và thẻo cùng lúc, kết quả không còn cho biết yếu tố nào tạo khác biệt.

![Mồi chép đỏ LK Hòa](/images/cam-chep-do.webp)

*Ảnh nhận diện mồi chép đỏ trong kho nội dung docaulkhoa.vn.*

![Mồi chép đen LK Hòa](/images/cam-chep-den.webp)

*Ảnh nhận diện mồi chép đen trong kho nội dung docaulkhoa.vn.*

## Những gì có thể và chưa thể kết luận

| Có thể kiểm tra | Không nên suy đoán |
|---|---|
| Đúng bao bì, khối lượng, hạn dùng và hướng dẫn pha | Màu đỏ hoặc đen tự động hợp một loại hồ |
| Độ ẩm, độ tơi và thời gian tan của mẻ đã pha | Hiệu quả tuyệt đối chỉ từ một buổi câu |
| Thời gian đến tín hiệu đầu tiên trong cùng buổi | Công thức thành phần khi nhãn không công bố rõ |
| Số tín hiệu, số cá lên trong cùng khoảng thời gian | Một loại luôn thắng trong mọi mùa và mọi nguồn nước |

## Cách thử hai loại mồi có kiểm soát

### Bước 1: Chia mẻ nhỏ

Cân hoặc đong hai phần mồi bằng nhau. Không pha cả gói ngay trong lần thử đầu để tránh lãng phí và còn khả năng điều chỉnh.

### Bước 2: Giữ nguyên lượng nước ban đầu

Dùng cùng dụng cụ đong và ghi lượng nước thực tế. Sau thời gian ngấm, chỉ bổ sung từng ít nước nếu cần. Đừng dùng cảm giác “ước chừng” nếu mục tiêu là so sánh.

### Bước 3: Không thêm phụ gia trong vòng đầu

Tinh mùi, tơ nhện hoặc mồi nền khác có thể che mất sự khác biệt giữa hai mẻ. Chỉ thêm sau khi đã có một vòng thử cơ sở.

### Bước 4: Luân phiên có thời gian

Cho mỗi mẻ cùng một khoảng thời gian đánh. Nếu đổi điểm câu, hãy ghi rõ vì vị trí và ổ cá có thể ảnh hưởng mạnh hơn loại mồi.

### Bước 5: Ghi số liệu tối thiểu

| Dữ liệu cần ghi | Mẻ đỏ | Mẻ đen |
|---|---:|---:|
| Lượng mồi khô |  |  |
| Lượng nước |  |  |
| Thời gian ngấm |  |  |
| Thời gian đến tín hiệu đầu |  |  |
| Số tín hiệu rõ |  |  |
| Số cá lên bờ |  |  |
| Gió, nhiệt độ, màu nước |  |  |

Sau ít nhất vài buổi ở cùng hồ, bảng này có giá trị hơn một nhận xét “mồi nào nhạy hơn” không kèm điều kiện.

## Điều chỉnh theo kiểu câu

### Cần mồi xả nhanh

Giữ mẻ tơi hơn và kiểm tra tốc độ bung trong chậu nước trước. Không tăng nước quá nhanh vì rất khó đưa mồi đã nhão về trạng thái ban đầu.

### Cần mồi bám lưỡi lâu

Tăng độ kết dính từng bước nhỏ. Chỉ thêm phụ gia sau khi mồi cơ sở đã đạt độ ẩm ổn định.

### Hồ có cá dè hoặc nhiều người đánh

Giảm số biến thay đổi. Đánh mẻ nhỏ, theo dõi tín hiệu và tránh liên tục đổi mùi khiến bạn không đọc được phản ứng cá.

## Khi nào nên bỏ một mẻ mồi?

- Bao bì hở, mùi bất thường hoặc quá hạn.
- Mồi bị ẩm trước khi pha hoặc có dấu hiệu nấm mốc.
- Sau khi pha không thể đạt độ tơi/kết dính phù hợp dù đã làm đúng hướng dẫn.
- Kết quả kém lặp lại qua nhiều buổi trong cùng điều kiện, trong khi mẻ đối chứng ổn định hơn.

## Liên kết nội bộ hữu ích

- [Cách pha mồi cám chép LK Hòa: tỷ lệ nước, mồi vê, mồi xả](/cam-nang/cach-pha-moi-cam-chep-lk)
- [Xem nhóm mồi câu đang có trong danh mục](/danh-muc/moi-cau)

## Minh bạch nội dung

Bài do **LK Hòa** biên soạn theo phương pháp thử đối chứng. Hai ảnh dùng để nhận diện sản phẩm; chúng không phải bằng chứng một loại đã thắng loại còn lại. Khi danh mục có SKU và link tách biệt đã được xác nhận, website mới bổ sung liên kết mua tương ứng.`,
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
