# Đánh giá thẩm mỹ mascot + icon (ghi nhận 05/08/2026 — CHƯA SỬA, chờ người dùng quyết)

Người dùng so bản vẽ của agent với mẫu brand board tham chiếu (đom đóm bóng bẩy thay chữ i) và nhận xét: mascot + icon xấu, đặc biệt outline; nghi filled chỉ là "đảo màu vẽ viền ra ngoài". Kiểm chứng bằng cách đọc source SVG: **nhận xét đúng phần lớn**.

## Khoảng cách thực tế (mẫu vs bản mình)

Mẫu tham chiếu là ILLUSTRATION: bụng giọt nước có radial gradient phát sáng, quầng mờ dần ra trong suốt, 4 cánh trong suốt xếp lớp, silhouette liền mạch, râu cong có chấm đầu, lấp lánh xung quanh.

Bản mình (firefly-glowing.svg) là FLAT CLIPART: 3 hình phẳng chồng nhau (đầu tròn + thân ellipse + đốm ellipse đè lên thân), halo là **hình tròn phẳng opacity 0.3 có rìa cứng** (glow giả — glow thật cần gradient fade-to-transparent), 2 cánh ellipse phẳng, không tầng lớp.

Icon: outline ở mức "tạm được, generic kiểu lucide"; filled đúng như người dùng đoán — **dẫn xuất cơ học từ outline** (offset centerline ±0.875 + khoét evenodd), không được thiết kế theo ngữ pháp filled riêng. Có artifact thật: `filled/lesson.svg` khe gáy khoét tới y=19.3 trong khi đáy sách ở y≈18.5 → khấc lòi ra ngoài silhouette.

## Nguyên nhân gốc (xếp theo tầng)

1. **Ràng buộc do kiến trúc sư đặt quá hẹp (nguyên nhân chính)**: hợp đồng phong cách + brand:check cấm mọi thứ ngoài flat fill và hex-trong-var() → loại bỏ radialGradient, filter blur, stop-opacity — những công cụ SVG bắt buộc phải có để làm "phát sáng". Đã nhầm lẫn "kỷ luật token màu" với "chỉ được tô phẳng". Gradient 1 màu (amber → transparent bằng stop-opacity) hoàn toàn không phá kỷ luật màu.
2. **Vòng lặp thiếu thước đo thẩm mỹ**: brief không kèm ảnh tham chiếu; implementer soi browser để kiểm "đúng hợp đồng/không vỡ hình", reviewer kiểm "đúng spec" — không ai chấm "đẹp so với mẫu". Gate xanh ≠ đẹp.
3. **Phương pháp dựng filled sai hướng**: dẫn xuất hình học từ outline thay vì vẽ lại theo ngữ pháp filled (hình đặc, chi tiết tối giản hơn outline chứ không phải copy mọi nét thành khe khoét).
4. **Silhouette mascot lắp ghép**: 3 hình rời thay vì một đường bao liền — cần dựng lại bằng 1-2 path bezier liền.
5. **Giới hạn phương pháp**: agent vẽ bằng tọa độ số, sửa qua mô tả text — thiếu vòng render-so-mẫu-chỉnh đủ dày để hội tụ về chất lượng illustration.

## Hướng khắc phục ĐỀ XUẤT (chưa làm, chờ chốt)

- **Mascot (đáng làm lại nhất)**: nới ràng buộc có kiểm soát — cho phép radialGradient/stop-opacity/blur với đúng các hex whitelist hiện có; dựng lại silhouette liền bằng bezier; thêm lớp cánh; kèm ảnh mẫu tham chiếu vào brief + vòng chấm thẩm mỹ so mẫu (browser screenshot từng vòng).
- **Icon filled**: vẽ lại theo ngữ pháp filled thay vì offset từ outline; sửa artifact lesson.
- **Icon outline**: cân nhắc phương án rẻ hơn — lấy bộ mã nguồn mở license thoáng (vd Lucide, ISC) làm khung rồi restyle theo brand (đổi stroke, thêm accent) thay vì tự vẽ 21 hình từ số 0; tự vẽ chỉ những icon đặc thù domain (spark, mastery-map, mock-exam...).
- Giữ nguyên: motifs/flight-path/pattern/lockup (sinh từ code, đạt), checker (chỉ cần nới rule gradient), pose structure + quy tắc cảm xúc (đã đúng luật).

## Bổ sung cùng ngày: đánh giá hướng "logo mềm" (mẫu thứ hai người dùng gửi)

Mẫu: wordmark "Rangi" chữ thường rounded (kiểu Poppins Rounded), đuôi chữ "g" cuộn dài thành nét bay, chuỗi 3 chấm nhỏ→to dẫn tới chấm i hổ phách ("gradual growth"), palette mint nhạt. Người dùng thấy nhận xét "logo hiện tại quá cứng" là hợp lý. Đánh giá:

**Đồng tình một phần**: PhuDu 700 uppercase đúng là đậm/góc tính — "cứng" so với chuẩn category edtech trẻ em (Monkey/Duolingo/Khan Kids đều rounded). Đáng chú ý: mọi chi tiết đắt của mẫu đều là motif mình ĐÃ CHỐT được diễn đạt lại — đuôi g ≈ đường bay chấm gạch, chuỗi chấm to dần = "tiến bộ nhỏ mỗi ngày", chấm i hổ phách = mascot spark. Tức hướng mềm TƯƠNG THÍCH câu chuyện thương hiệu và giữ nguyên kiến trúc "chấm i = mascot" — đây là đổi cách thể hiện wordmark, không phá quyết định nền.

**Phải cân nhắc trước khi chốt**:

1. Wordmark PhuDu là quyết định đã chốt CÓ LÝ DO (font Việt, song ngữ, khác biệt hóa khỏi đồng phục rounded của category) — đổi là mở lại quyết định thương hiệu, cần vòng nghiên cứu ngắn + người dùng duyệt, không đổi chớp nhoáng.
2. "Poppins Rounded" không phải Google Font chính chủ (Poppins gốc không rounded). Ứng viên rounded có vietnamese subset chuẩn: **Quicksand, Baloo 2**. BẮT BUỘC test dấu tiếng Việt trước khi chốt (bài học Nunito).
3. Palette mẫu (mint #6BD4B2, #FFC94D) lệch bảng đã chốt — chỉ lấy tinh thần bố cục, không lấy hex (giống lần review board trước).
4. Chi phí kỹ thuật THẤP: wordmark sinh từ code (fontkit) — đổi font wordmark = thay 1 file font + chạy lại generator, mọi biến thể tự cập nhật. Đây là lợi thế của pipeline hiện tại.
5. Phương án trung dung nếu muốn giữ khác biệt: wordmark rounded mới + PhuDu vẫn giữ vai display heading trong UI (hai quyết định độc lập).

**Ảnh mẫu**: agent không có file ảnh để tự lưu (chỉ thấy trong hội thoại) — người dùng cần kéo 2 ảnh vào `docs/brand/refs/` (đề xuất tên `ref-logo-mem-2026-08-05-*.png`) hoặc `private/` nếu không muốn commit.

## Trạng thái

Ghi nhận theo yêu cầu người dùng: "đánh giá và note lại thôi, tìm nguyên nhân, không sửa ngay". Các task 9-11 tiếp tục theo plan hiện tại; việc làm lại thẩm mỹ mascot/icon là SPEC MỚI sau khi người dùng quyết hướng.
