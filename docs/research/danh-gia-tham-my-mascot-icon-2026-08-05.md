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

## KẾT QUẢ vòng mockup v2 (06/08/2026) — "tạm ổn, CHƯA chốt hẳn"

Đã chạy vòng prototype theo hướng trên, người dùng duyệt qua nhiều vòng bẻ trực tiếp. Toàn bộ code + thành phẩm lưu tại **`frontend/scripts/brand/proto-v2/`** (chạy `node assemble.mjs` để tái sinh; giữ đầy đủ mọi hàm sinh SVG theo yêu cầu người dùng, kể cả phương án đã loại).

**Các quyết định chốt trong vòng này:**

1. **Logo: GIỮ NGUYÊN bản chính thức** (RANG in hoa PhuDu + chữ i đốm sáng). Phương án wordmark mềm vẽ tay monoline đã thử đến nơi đến chốn và bị người dùng LOẠI ("một trời một vực" so với mẫu tham chiếu) — hàm `wordmarkSVG()` giữ trong assemble.mjs làm tư liệu, KHÔNG dùng. Motif đường bay dưới logo cũng bị loại. Mục backlog "logo mềm" ĐÓNG.
2. **Mascot v2 (soft illustrated) — hướng đúng, tỷ lệ đã chuẩn hóa từ SVG trace người dùng cung cấp**: đầu Ø ≈ 1.05× bề ngang thân (thân THON, không phải đầu nhỏ); thân dài/rộng 2.75; khe đầu–thân ≈ 0.26 Ø đầu; râu chữ V tách đỉnh đầu, dài ≈ 0.8 Ø; cánh GIỌT NƯỚC đầu ngoài tròn bầu (không phải hình lá nhọn), 2 cặp gần ngang (trên chếch lên ~7°, dưới chúc xuống ~24°), sải ≈ 4× bề ngang thân; gradient thân radial 5 stop + lõi sáng blur; glow radial 5 stop mượt; không vẽ mặt. 8 file SVG pose (4 pose × 2 nền) tại `proto-v2/mascot-v2/`.
3. **Icon v2 (42 file tại `proto-v2/icons/`)**: người dùng duyệt "tạm ok" — filled thiết kế theo ngữ pháp filled riêng, 4 icon đổi ẩn dụ.

**Còn mở (người dùng nói rõ "chưa ổn hẳn") — việc cho vòng tích hợp production:**

- Tinh chỉnh thêm mascot theo cảm nhận người dùng (gradient/chi tiết) trước khi thay bộ `frontend/public/brand/mascot/` v1.
- Khi tích hợp thật: nới rule mascot trong `check-icons.mjs` (viewBox 220×252, cho phép gradient stop trong họ màu brand) + cập nhật sổ tay thương hiệu §3.3-3.4 + spec mới theo đúng quy trình.
- Icon v2 thay production đồng loạt hay chọn lọc — chưa quyết.
- Bài học quy trình đã áp dụng từ vòng này: KHÔNG gửi bản vẽ khi chưa tự render soi (dùng sharp-cli render offline khi browser pane đóng); đo tỷ lệ từ trace/ảnh thay vì áng chừng.

## Cập nhật 07/08/2026 — loại bỏ nhánh nét đứt và animation

Người dùng soi lại bộ asset và quyết: **nét đứt trang trí xấu, bỏ cả nhánh** — không phải gọt line khỏi hình mà xóa hẳn file và code sinh. Đã xóa: `flight-path-horizontal.svg`, `flight-path-to-dot.svg`, `pattern-{light,dark}.svg`, pose `flying` (2 file production + 2 file proto), module `motifs.mjs` + `motifs.test.mjs`, `generated-files.test.mjs`, khối sinh flight-path/pattern trong `generate-logo.mjs`, nhánh `flying` trong `assemble.mjs`.

Cùng lượt, người dùng đánh giá **animation cũng chưa đạt yêu cầu, bỏ hết, tính lại sau**: xóa `RangiSplash.tsx` + test + `rangi-splash.module.css`, xóa animation `breath` của `RangiLogo` (prop `animated`, `rangi-logo.module.css`, biến `--breath-scale`); trang chủ chuyển sang `RangiLogo` tĩnh.

Giữ lại: icon `learning-path` (nét đứt là nội dung của icon ở 24px, không phải họa tiết thương hiệu). Câu "Giữ nguyên: motifs/flight-path/pattern/lockup" ở mục trên là đánh giá 05/08 — nay đã bị quyết định sau ghi đè, giữ để truy vết lịch sử.

Điểm cần rút: cả hai lần loại bỏ (lockup dọc 06/08, nét đứt + animation 07/08) đều rơi vào thứ được sinh từ code theo spec mà **chưa ai chấm thẩm mỹ trước khi đưa vào bộ chuẩn** — đúng nguyên nhân gốc số 2 đã ghi ở trên (gate xanh ≠ đẹp). Hạng mục trang trí nên qua vòng render-và-duyệt của người dùng TRƯỚC khi được ghi vào sổ tay như motif chính thức.

## Cập nhật 07/08/2026 — tinh chỉnh cánh và glow theo ảnh mẫu

Người dùng gửi ảnh đom đóm tham chiếu, yêu cầu **glow chuyển mượt hơn** và **cánh giọt nước rủ xuống**. Chạy 4 vòng render-và-duyệt (bảng biến thể PNG, người dùng bẻ từng vòng), thông số chốt nằm trong hằng số đầu `assemble.mjs`:

| Thông số                        | Cũ                             | Mới                    |
| ------------------------------- | ------------------------------ | ---------------------- |
| Góc cánh (từ phương thẳng đứng) | trên 97° (chếch LÊN), dưới 66° | trên 50°, dưới 24°     |
| Hình cánh                       | cánh hoa, hai cặp KHÁC cỡ      | giọt nước, hai cặp CÙNG một hình (`WING_L` 62 × `WING_W` 34, `WING_BEND` 14) |
| Gốc cánh                        | sát mép thân (dính vào thân)   | lệch ra `WING_OFFSET` 13, cánh lấn vào rồi được gọt |
| Mép trong cánh                  | không gọt                      | gọt theo đường bao thân nở `WING_GAP` 4, dao nhòe `WING_CUT_SOFT` 3 |
| Khe đầu–thân                    | 8.3                            | 4.8 (`HEAD_CY` 73 → 76.5) |
| Khe râu–đầu                     | 10.8                           | 4.3 (hạ râu 6 đơn vị)  |
| Quầng sáng                      | 1 lớp, 5 mốc gradient          | 2 lớp (r 105 + r 88), 8 mốc, cả cụm qua `feGaussianBlur` 7 |
| Thân + đầu                      | đục hoàn toàn                  | `BODY_OPACITY` 0.92 để hòa vào glow |

Ba bài học phương pháp từ vòng này:

1. **Vẫn phải gọt, nhưng gọt bằng con dao nhòe.** Hành trình mất 3 vòng: (a) mask sắc cạnh → khe đều nhưng để lại mép cụt thô; (b) bỏ hẳn mask, chỉ đặt gốc cánh lệch ra ngoài → hết mép cụt nhưng mép trong cánh cắm thẳng, không còn ôm theo sườn thân; (c) đáp án: **giữ mask nhưng làm nhòe chính con dao** (`feGaussianBlur` trên nội dung mask) — mép trong vẫn cong đúng theo đường bao thân, còn chỗ giao giữa vết gọt và viền cánh thì tan mềm thay vì tạo góc nhọn. Bài học tổng quát: khi một vết cắt hình học là đúng về hình nhưng sai về cảm giác, hãy làm mềm CÔNG CỤ cắt chứ đừng bỏ vết cắt.
2. **Bảng biến thể rẻ hơn tranh luận.** Mỗi vòng render một lưới 9 ô PNG (2 trục × 3 mức) rồi để người dùng chỉ mặt, thay vì mô tả bằng lời. Hội tụ sau 4 vòng.
3. Thông số hình học phải nằm trong **hằng số có tên** ở đầu file sinh, không rải số ma thuật trong path — vòng sau chỉnh một dòng là xong.
