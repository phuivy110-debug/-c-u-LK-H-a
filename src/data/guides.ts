export interface GuideArticle {
  slug: string;
  title: string;
  category: string;
  categorySlug: string;
  summary: string;
  contentHtml: string;
  author: string;
  date: string;
  readTime: string;
  relatedProducts?: string[]; // product slugs
  relatedCategorySlug?: string;
}

export const GUIDE_ARTICLES: GuideArticle[] = [
  {
    slug: 'cach-chon-can-cau-lure-cho-nguoi-moi',
    title: 'Cách chọn cần câu lure cho người mới bắt đầu',
    category: 'Chọn cần câu',
    categorySlug: 'can-cau',
    summary: 'Hướng dẫn chi tiết chọn độ dài, độ cứng (ML, M, MH) và chất liệu carbon cần câu lure LK Hòa chuẩn kỹ thuật cho cần thủ mới gia nhập.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-08-10',
    readTime: '6 phút đọc',
    relatedCategorySlug: 'can-cau',
    contentHtml: `
      <h2>1. Giới thiệu kỹ thuật câu lure và tầm quan trọng của chọn cần</h2>
      <p>Câu lure (câu mồi giả) là bộ môn đòi hỏi sự linh hoạt và cảm giác tay cao. Đối với người mới bắt đầu, việc chọn đúng cây cần câu lure sẽ quyết định đến 70% sự thành công của chuyến đi câu và sự thoải mái khi thao tác suốt nhiều giờ.</p>

      <h2>2. Chọn loại máy đứng (Spinning) hay máy ngang (Baitcasting)?</h2>
      <p>Đối với cần thủ mới tập lure, <strong>cần lure máy đứng</strong> là lựa chọn tối ưu nhất vì ít bị rối dây (ổ chim), dễ ném mồi xa và thao tác đơn giản hơn cần máy ngang.</p>

      <h2>3. Độ cứng cần lure phù hợp cho người mới</h2>
      <ul>
        <li><strong>Độ cứng L / ML (Light / Medium Light):</strong> Thích hợp câu mồi nhỏ, mồi ruồi, bắt cá chẽm, cá măng nhỏ.</li>
        <li><strong>Độ cứng M / MH (Medium / Medium Heavy):</strong> Độ cứng quốc dân cho người mới. Tải mồi từ 7g - 21g, đánh lóc, chẽm, trắm đen rất đầm tay.</li>
      </ul>

      <h2>4. Chiều dài cần lure lý tưởng</h2>
      <p>Nên chọn chiều dài từ <strong>1.98m (6.6ft) đến 2.1m (7.0ft)</strong>. Độ dài này giúp kiểm soát đường ném chính xác ở cả bờ sông hẹp lẫn hồ rộng.</p>

      <h2>5. Gợi ý sản phẩm cần lure LK Hòa</h2>
      <p>Các dòng cần như <em>Cần Lure Tiểu LK</em> hoặc <em>Cần Solid Đa Năng Tải Tĩnh 10kg LK Hòa</em> là những mẫu cần lure được cộng đồng đánh giá cao nhờ ngọn dẻo, tải cá khỏe và giá thành hợp lý.</p>
    `
  },
  {
    slug: 'can-lure-may-dung-va-may-ngang-khac-nhau-the-nao',
    title: 'Cần lure máy đứng và máy ngang khác nhau thế nào?',
    category: 'Chọn cần câu',
    categorySlug: 'can-cau',
    summary: 'So sánh ưu nhược điểm giữa cần máy đứng (Spinning) và cần máy ngang (Baitcasting) để chọn đúng thiết bị theo nhu cầu.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-08-08',
    readTime: '5 phút đọc',
    relatedCategorySlug: 'can-cau',
    contentHtml: `
      <h2>1. Khác biệt về thiết kế khoen và khoang máy</h2>
      <p>Cần máy đứng có khoen gốc lớn và quay xuống dưới, trong khi cần máy ngang có khoen nhỏ hơn, quay hướng lên trên và có thêm cựa (trigger) ở tay cầm.</p>

      <h2>2. Ưu nhược điểm cần máy đứng</h2>
      <p>Ném mồi xa, dễ dùng, không lo rối dây, thích hợp mồi nhẹ dưới 7g.</p>

      <h2>3. Ưu nhược điểm cần máy ngang</h2>
      <p>Độ chính xác cực cao, thu dây nhanh, kiểm soát mồi tốt nhưng yêu cầu kỹ thuật ngón tay cái để tránh bị rối dây.</p>
    `
  },
  {
    slug: 'cach-chon-do-cung-can-cau-dai',
    title: 'Cách chọn độ cứng cần câu đài (4H, 5H, 6H, 8H)',
    category: 'Chọn cần câu',
    categorySlug: 'can-cau',
    summary: 'Giải thích chỉ số H trên cần đài, cách chọn độ cứng 4H dẻo giữ cá, 5H-6H đa năng, 8H săn hàng khủng.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-08-05',
    readTime: '7 phút đọc',
    relatedCategorySlug: 'can-cau',
    contentHtml: `
      <h2>1. Chỉ số H trong cần câu đài là gì?</h2>
      <p>Ký hiệu H (Hardness) thể hiện độ cứng và khả năng chịu tải của cần. H càng cao thì thân cần càng cứng, cong ít hơn khi có lực kéo.</p>

      <h2>2. Đánh giá chi tiết từng phân khúc H</h2>
      <ul>
        <li><strong>Cần 4H:</strong> Rất dẻo, cảm giác phê tay khi bắt cá rô chép nhỏ, giảm bớt áp lực lên đường thẻo.</li>
        <li><strong>Cần 5H - 6H:</strong> Phân khúc phổ biến nhất. Đủ dẻo để giữ cá rô chép, đủ cứng để ép cá trắm cỏ, trắm đen nhỡ.</li>
        <li><strong>Cần 8H:</strong> Cần săn hàng bạo lực, chuyên đánh hồ dịch vụ, bắt trắm đen khủng từ 8kg - 15kg+.</li>
      </ul>
    `
  },
  {
    slug: 'cach-chon-moi-cau-chep',
    title: 'Cách chọn mồi câu chép hiệu quả nhất cho hồ tự nhiên và dịch vụ',
    category: 'Chọn mồi câu',
    categorySlug: 'moi-cau',
    summary: 'Bí quyết pha mồi xả, mồi câu chép LK Hòa nhạy bén theo từng mùa và nhiệt độ nước.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-08-02',
    readTime: '6 phút đọc',
    relatedCategorySlug: 'moi-cau',
    contentHtml: `
      <h2>1. Tập tính săn mồi của cá chép</h2>
      <p>Cá chép là loài cá đáy tinh ranh, thích hương vị thơm ngọt, vị hoa quả hoặc tanh nhẹ tùy thuộc độ đục của nước và thời tiết.</p>

      <h2>2. Công thức mồi câu chép LK Hòa</h2>
      <p>Kết hợp 60% mồi cám chép thơm LK Hòa + 20% mồi xả hạt dụ cá + 20% tơ hươu tạo độ dính vừa phải. Mồi rơi xuống đáy tỏa mùi thơm lan tỏa nhanh.</p>
    `
  },
  {
    slug: 'moi-lure-noi-lung-va-chim-khac-nhau-the-nao',
    title: 'Mồi lure nổi, lửng và chìm khác nhau thế nào?',
    category: 'Chọn mồi câu',
    categorySlug: 'moi-cau',
    summary: 'Phân biệt Topwater (nổi), Suspending (lửng) và Sinking (chìm) để chọn mồi lure chuẩn theo tầng nước.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-07-28',
    readTime: '5 phút đọc',
    relatedCategorySlug: 'moi-cau',
    contentHtml: `
      <h2>1. Mồi nổi (Topwater / Popper / Nhái hơi)</h2>
      <p>Chuyên đánh tầng mặt, lướt qua bèo nhái, kích thích cá lóc táp mồi cực kỳ đẹp mắt.</p>

      <h2>2. Mồi chìm (Sinking / Minnow / Vib / Chuột trơn LK)</h2>
      <p>Đánh tầng trung và tầng đáy, tiếp cận cá săn mồi ẩn nấp trong các hốc đá hoặc luồng nước sâu.</p>
    `
  },
  {
    slug: 'cach-bao-quan-moi-cau-va-dung-cu',
    title: 'Cách bảo quản mồi câu và dụng cụ câu cá sau mỗi chuyến đi',
    category: 'Bảo quản dụng cụ',
    categorySlug: 'phu-kien',
    summary: 'Mẹo vệ sinh cần carbon, tra dầu máy câu và bảo quản mồi xả khô ráo chống ẩm mốc.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-07-25',
    readTime: '4 phút đọc',
    relatedCategorySlug: 'phu-kien',
    contentHtml: `
      <h2>1. Rửa sạch nước mặn/phèn trên cần và máy</h2>
      <p>Sau mỗi chuyến câu, dùng khăn mềm ẩm lau sạch bụi bẩn và phèn đọng trên khoen cần. Tra 1-2 giọt dầu máy chuyên dụng vào bạc đạn.</p>

      <h2>2. Bảo quản mồi cám xả</h2>
      <p>Mồi cám chưa dùng hết cần đậy kín túi zip, để nơi khô ráo thoáng mát để giữ nguyên hương vị đặc trưng.</p>
    `
  },
  {
    slug: 'cach-chon-day-pe-cau-lure',
    title: 'Cách chọn dây PE câu lure chìm nhanh, siêu tải',
    category: 'Chọn dây câu',
    categorySlug: 'day-cau',
    summary: 'So sánh dây PE X4 và PE X8 LK Hòa, chọn cỡ dây #1.0, #1.5, #2.0 theo loại mồi và cá mục tiêu.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-07-20',
    readTime: '5 phút đọc',
    relatedCategorySlug: 'day-cau',
    contentHtml: `
      <h2>1. Sự khác biệt giữa dây PE X4 và Dây PE X8</h2>
      <p>Dây PE X8 được bện từ 8 sợi dệt siêu mịn, bề mặt tròn mịn giúp ném mồi xa hơn, mượt hơn và chìm nhanh hơn so với dây X4.</p>

      <h2>2. Chọn cỡ dây PE chuẩn</h2>
      <p>Nên chọn dây PE X8 LK Hòa size #1.5 đến #2.0 cho cá lóc sông/hồ, vừa chống sờn ma sát vừa bảo vệ khoen cần.</p>
    `
  },
  {
    slug: 'cach-chon-luoi-cau-phu-hop',
    title: 'Cách chọn lưỡi câu phù hợp cho từng loại cá',
    category: 'Phao & Lưỡi',
    categorySlug: 'phao-luoi',
    summary: 'Cách chọn lưỡi không ngạnh cho câu đài rô chép tốc độ và lưỡi có ngạnh săn hàng cá trắm đen.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-07-15',
    readTime: '5 phút đọc',
    relatedCategorySlug: 'phao-luoi',
    contentHtml: `
      <h2>1. Lưỡi không ngạnh (Thanh mộc)</h2>
      <p>Giúp gỡ cá nhanh, không làm tổn thương miệng cá, rất thích hợp cho câu đài thi đấu và câu rô chép giải trí.</p>

      <h2>2. Lưỡi có ngạnh dày dặn</h2>
      <p>Giữ mồi chắc, đóng cá sâu, chống sổng cá khi giật mạnh với cá béo nặng từ 5kg trở lên.</p>
    `
  },
  {
    slug: 'bo-phu-kien-cau-ca-cho-nguoi-moi',
    title: 'Bộ phụ kiện câu cá cần thiết cho người mới nhập môn',
    category: 'Phụ kiện câu',
    categorySlug: 'phu-kien',
    summary: 'Danh sách 5 món phụ kiện không thể thiếu: thùng đựng cá, gác cần inox, rế đựng cám, kéo cắt dây và kẹp gỡ lưỡi.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-07-10',
    readTime: '6 phút đọc',
    relatedCategorySlug: 'phu-kien',
    contentHtml: `
      <h2>1. Thùng đựng cá và gác cần inox</h2>
      <p>Thùng cá LK Hòa chịu lực tốt, tích hợp khay gác cần và rế trộn mồi giúp trải nghiệm câu cá gọn gàng, chuyên nghiệp.</p>

      <h2>2. Kéo cắt dây PE và kềm gỡ lưỡi</h2>
      <p>Hai dụng cụ nhỏ nhưng bắt buộc có trong giỏ đồ câu để xử lý sự cố rối dây hoặc gỡ lưỡi an toàn.</p>
    `
  },
  {
    slug: 'kiem-tra-bo-can-may-truoc-chuyen-cau',
    title: 'Cách kiểm tra bộ cần máy trước chuyến đi câu',
    category: 'Kinh nghiệm câu',
    categorySlug: 'phu-kien',
    summary: 'Checklist 4 bước kiểm tra khoen cần, thắng nhấp (drag), nút thắt dây leader và lưỡi câu trước khi ra hồ.',
    author: 'LK Hòa - Chuyên gia Đồ Câu',
    date: '2026-07-05',
    readTime: '4 phút đọc',
    relatedCategorySlug: 'phu-kien',
    contentHtml: `
      <h2>1. Kiểm tra khoen cần (Guide rings)</h2>
      <p>Dùng bông gòn rà qua lòng khoen để phát hiện các vết nứt xước nhỏ có thể làm đứt dây PE khi vụt mồi.</p>

      <h2>2. Kiểm tra bộ thắng drag máy câu</h2>
      <p>Chỉnh nút xiết drag vừa phải, không quá cứng để cá lớn chạy không đứt dây, không quá dẻo để đóng lưỡi chắc chắn.</p>
    `
  }
];
