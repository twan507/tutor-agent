# Spec: Gói mở rộng bộ nhận diện SVG (đom đóm đầy đủ, đường bay, icon set, pattern, animation)

**Ngày**: 05/08/2026 · **Trạng thái**: ĐÃ DUYỆT + ĐÃ THỰC THI 05/08/2026 (người dùng ghi chú: chấp nhận bộ icon sẽ chỉnh sửa theo nhu cầu thật về sau)
**Nguồn quyết định**: review brand board của agent ngoài (hội thoại 05/08/2026) → chốt mascot hai-địa-bàn + motif đường bay (sổ tay thương hiệu §3.3); grilling vòng 1 chốt phạm vi đầy đủ, icon làm CẢ HAI bộ outline + filled.

## 1. Mục tiêu

Bổ sung các hạng mục nhận diện còn thiếu so với danh mục chuẩn của một brand system, giữ nguyên toàn bộ nguyên tắc đã chốt (wordmark, màu, font, quy tắc mascot Forest). Mọi asset là SVG, đúng semantic token, dùng được ngay trong frontend Next.js.

## 2. Phạm vi — 6 hạng mục

### A. Đom đóm đầy đủ (pose sheet, 4 pose)

- SVG tĩnh vẽ tay, phong cách **geometric tối giản** (hình cơ bản: ellipse thân, cánh hình lá, đốm sáng hổ phách bụng). KHÔNG baby-face, mắt là chấm nhỏ hình học, không tròng trắng/mắt to.
- 4 pose: `firefly-flying` (bay, kèm được đường bay), `firefly-glowing` (đậu + phát sáng), `firefly-resting` (nghỉ — mờ trung tính, KHÔNG biểu cảm buồn), `firefly-greeting` (chào/hướng dẫn — dùng onboarding, empty state).
- Độ sáng đốm điều khiển bằng CSS variable `--rangi-glow` (0→1, mặc định 1) trên opacity của lớp halo — phục vụ cơ chế "sáng dần theo tiến bộ" và trạng thái nghỉ.
- Màu: thân/cánh dùng token emerald (qua `currentColor` hoặc CSS var), đốm sáng `var(--rangi-spark, #F5A623)`. Hoạt động trên cả nền sáng lẫn nền đêm rừng.
- Vị trí: `frontend/public/brand/mascot/`.

### B. Motif đường bay chấm gạch (flight path)

- Hàm sinh trong pipeline `generate-logo.mjs` (tách module dùng chung): nhận tham số (điểm đầu/cuối, độ cong, mật độ nét đứt) → trả `<path>` với `stroke-dasharray`, đầu nét bo tròn.
- Xuất 2 asset mẫu dùng ngay: `flight-path-horizontal.svg` (trang trí section), `flight-path-to-dot.svg` (đường bay kết thúc tại một đốm sáng — khung tĩnh của câu chuyện "bay rồi đậu").
- Structure có `id` cho từng phần (path, spark) để CSS/SMIL animate được.

### C. Lockup dọc (biến thể logo còn thiếu)

- Bố cục: icon (chữ i + chấm sáng + quầng) ở trên, khối chữ RANG**i** ở dưới, thẳng trục giữa; tùy chọn kèm slogan fit-to-width theo quy tắc lockup hiện hành.
- Sinh từ code trong `generate-logo.mjs` (không vẽ tay), đủ 4 biến thể màu như bộ ngang: `rangi-lockup-vertical-{dark,light,mono-black,mono-white}.svg` + 2 bản kèm slogan `-slogan-{vi,en}` cho dark/light.
- Wordmark ngang GIỮ NGUYÊN — không đụng tham số hiện có.

### D. Bộ icon UI — 21 icon × 2 bộ (outline + filled)

_(đính chính khi thực thi: nhóm Đánh giá có 6 icon nên tổng là 21; student-profile đổi learner-profile theo CONTEXT.md)_

- **Hai bộ song song cùng danh mục**: `outline/` (nét 1.75px, lưới 24px, cap/join bo tròn) và `filled/` (đặc, cùng silhouette) — chọn bộ theo ngữ cảnh UI sau này (outline = mặc định UI; filled = trạng thái active/nhấn mạnh).
- Màu: toàn bộ nét/fill chính = `currentColor`; duy nhất đốm sáng hổ phách (ở icon có nó) = `var(--icon-accent, #F5A623)`. KHÔNG hardcode hex khác.
- Danh mục 21 icon, tên file theo tên EN canonical trong `CONTEXT.md`:
  - _Học tập_: `lesson`, `learning-path`, `goal`, `learning-session`, `learning-sprint`
  - _Đánh giá_: `assessment-item`, `correct` (✓ emerald khi dùng), `incorrect` (✗ đỏ khi dùng — icon luôn đi kèm màu theo quy tắc mù màu), `hint`, `timer`, `mock-exam`
  - _Tiến bộ_: `mastery-map`, `progress-chart`, `spark` (đốm sáng/streak), `badge`, `learning-evidence`
  - _Hệ thống_: `parent-report`, `daily-digest`, `learner-profile`, `settings`, `calendar`
- Vị trí: `frontend/public/brand/icons/{outline,filled}/<tên>.svg`.
- **Script kiểm chuẩn tự động** `scripts/brand/check-icons.mjs`: viewBox `0 0 24 24`, có `currentColor`, không hex ngoài whitelist (`#F5A623` trong var fallback), có `fill="none"` đúng chỗ (outline), tên file thuộc danh mục đã duyệt. Chạy được trong CI (`pnpm brand:check`).

### E. Pattern nền

- 1 tile SVG lặp vô hạn (seamless): vài đốm sáng + đoạn đường bay chấm gạch, mật độ thưa, làm nền section/empty state.
- 2 biến thể: `pattern-light.svg` (trên nền kem) và `pattern-dark.svg` (trên nền đêm rừng), độ tương phản thấp (trang trí, không tranh chữ).

### F. Animation "bay rồi đậu thành chấm chữ i"

- React component `RangiSplash` (cạnh `RangiLogo` hiện có): đom đóm dạng đơn giản hóa bay theo flight path (CSS `offset-path`), đậu xuống đúng vị trí chấm chữ i của wordmark, quầng sáng bừng lên; chữ RANG hiện dần.
- Tôn trọng `prefers-reduced-motion`: giảm còn fade-in tĩnh.
- Tích hợp demo trên trang chủ dev hiện có (chỗ RangiLogo đang đứng) — có thể bật/tắt qua prop.

## 3. Không thuộc phạm vi

- Không đổi wordmark ngang, app icon, favicon, og-image hiện có (trừ khi lỗi phát hiện trong lúc làm — báo trước).
- Không làm mockup in ấn/biển hiệu (chờ tra nhãn hiệu SHTT).
- Không thêm icon ngoài danh mục 21 (thiếu thì đề xuất bổ sung danh mục trước, không tự thêm).
- Không thêm dependency ngoài devDependencies hiện có + SVGO (nếu cần optimize — hỏi trước khi thêm).

## 4. Ràng buộc bắt buộc (kế thừa, nhắc để reviewer soi)

1. Mascot: quy tắc Forest §3.2-3.3 sổ tay — không mắt to, không biểu cảm buồn, dạng đầy đủ KHÔNG vào wordmark/app icon.
2. Màu: chỉ token/`currentColor`/var có fallback thuộc bảng đã chốt; amber không bao giờ làm chữ.
3. `correct`/`incorrect` phải khác nhau về HÌNH, không chỉ màu (mù màu đỏ-lục).
4. Mọi SVG sinh từ code phải regenerate được: sửa tham số → chạy `pnpm brand:generate` → toàn bộ cập nhật, không sửa tay file output.

## 5. Definition of Done (bất biến, kiểm chứng được)

1. `pnpm brand:generate` chạy sạch, xuất đủ file mục B + C; chạy lại 2 lần liên tiếp cho output y hệt (deterministic).
2. `pnpm brand:check` pass trên toàn bộ 42 icon (21 × 2 bộ) và fail được khi cố tình đưa icon sai chuẩn (có test chứng minh cả hai chiều).
3. Đủ 4 pose mascot + 2 pattern + 2 flight path asset, mỗi file render đúng trên cả nền sáng và nền tối (kiểm bằng browser tool, chụp bằng chứng).
4. `RangiSplash` chạy trên trang chủ dev: animation kết thúc với đom đóm đúng vị trí chấm chữ i (sai số ≤1px so với tọa độ `dotCx/dotCy` của generator); bật `prefers-reduced-motion` thì không có chuyển động.
5. Test hiện có không hỏng: `pnpm test` (frontend) pass toàn bộ.
6. `docs/README.md` có dòng index cho spec + plan; sổ tay thương hiệu bổ sung mục sử dụng icon/pattern (tầng "cách dùng").

## 6. Rủi ro đã thấy trước

- Generator hiện lỗi `ERR_MODULE_NOT_FOUND` (chưa cài dependency trên máy này) — task đầu của plan phải là `pnpm install` + chạy lại baseline để xác nhận pipeline sống trước khi mở rộng.
- Icon filled dễ trôi khỏi silhouette của outline — check script so khớp danh mục hai bộ, review bằng mắt trên trang so sánh song song.
- `offset-path` CSS cần kiểm tra hỗ trợ trình duyệt mục tiêu; fallback là SMIL hoặc keyframe transform — quyết trong plan sau khi thử.
