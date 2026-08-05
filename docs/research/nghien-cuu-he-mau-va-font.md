# Nghiên cứu hệ màu UI (light/dark) + hệ font song ngữ Việt-Anh

Ngày: 05/08/2026. Trạng thái: ĐỀ XUẤT — chờ người dùng chốt. Nối tiếp bộ màu thương hiệu đã duyệt sơ (hổ phách #F5A623 + ngọc lục bảo #0E7A5A). Yêu cầu người dùng: brand cố định đủ tương phản 2 mode; hệ semantic đầy đủ (có ĐỎ cho câu sai — "xanh đỏ đi theo cặp"); font phủ mọi mục đích, hỗ trợ đầy đủ tiếng Việt.

## PHẦN 1 — HỆ MÀU

### Kiến trúc token (theo đồng thuận Radix/Material 3/shadcn/Tailwind v4)

2 lớp: **Ramp** (scale 11 bậc 50-950/màu, cố định, là "sơn nguyên liệu") → **Semantic token** (surface/text/brand/feedback — mỗi token trỏ bậc ramp KHÁC NHAU tùy light/dark). Component chỉ dùng semantic, không bao giờ hardcode hex/bậc ramp trong JSX.

### Ramp đầy đủ (hex thương hiệu được neo đúng bậc, không lệch)

**Amber** (brand, `amber-500` = #F5A623): 50 #FFFCF5 · 100 #FEF5DF · 200 #FDE3A2 · 300 #FCCD65 · 400 #FBBC3C · **500 #F5A623** · 600 #EF8D08 · 700 #CA700B · 800 #A75C11 · 900 #8D4E12 · 950 #67390F

**Emerald** (brand, `emerald-700` = #0E7A5A): 50 #F2FCF8 · 100 #DFF8EE · 200 #B8EED9 · 300 #84DEBE · 400 #4FC59D · 500 #20B585 · 600 #11966D · **700 #0E7A5A** · 800 #0F634A · 900 #0E533F · 950 #0A3328

**Neutral ấm** (khớp kem #FBF6EA): 50 #FDFDFC · 100 #F7F5F3 · 150 #EFECE7 · 200 #E2DDD5 · 300 #C7C0B2 · 400 #A39985 · 500 #827864 · 600 #645D4F · 700 #464239 · 800 #2C2A25 · 900 #1C1A17 · 950 #11100E

**Đỏ (SAI)** — hue 358° tách rõ khỏi coral #E07A5F (hue 13°): 50 #FDF6F7 · 100 #FAE5E6 · 200 #F6C5C7 · 300 #F09DA0 · 400 #E8686C · **500 #DE2127** · 600 #C31D23 · 700 #A4191D · 800 #81181C · 900 #671416 · 950 #450D0F

**Warning (cam cháy)** — tách hue khỏi amber CTA để 2 vai không đá nhau: 50 #FEF6F1 · 100 #FDE8D9 · 200 #FACFAE · 300 #F6AF79 · 400 #F39044 · 500 #F0710F · 600 #D3630D · 700 #B1530B · 800 #954609 · 900 #783808 · 950 #512605

**Info (xanh mực sách)** — hue mới, không lẫn emerald/amber: 50 #F4F7FB · 100 #E1EAF4 · 200 #BFD2E8 · 300 #92B3D9 · 400 #6090C7 · 500 #3C6FAA · 600 #346093 · 700 #2C517D · 800 #244366 · 900 #1C344F · 950 #132335

**Dark surfaces** (desaturate "đêm rừng" #0A2E26, KHÔNG đen tuyền): canvas #0C1311 · surface-1 #101917 · surface-2 #152320 · surface-3 #1B2C28 · surface-4 #243833 · border-subtle #314944 · border #3F5A54. #0A2E26 gốc chỉ dùng cho hero/splash đậm đặc, không làm canvas toàn app.

**Dark text**: high #F3F6F3 · default #DDE4DD · muted #A5B6A5 · subtle #738C73 · disabled #576B57

### Token semantic chính (light / dark)

| Token | Light | Dark |
|---|---|---|
| canvas | #FDFDFC (hoặc kem #FBF6EA cho vùng học) | #0C1311 |
| surface / raised | #FFFFFF / #F7F5F3 | #101917 / #152320 |
| text-primary / secondary | #0A2E26 / #645D4F | #F3F6F3 / #A5B6A5 |
| action-primary (CTA) | amber-500 + CHỮ TỐI #0A2E26 lên trên | amber desaturate #E6AC4C + chữ tối |
| link/brand | emerald-700 | emerald-300 #84DEBE |
| success (ĐÚNG) | solid emerald-700 · bg #DCF2E8 · text emerald-800 | solid emerald-500 · bg emerald-950 · text emerald-300 |
| error (SAI) | solid red-500 #DE2127 · bg red-100 · text red-700 | solid red-500 · bg red-950 · text red-400 #E8686C |
| warning | bg warn-100 · text warn-800 #954609 | bg warn-950 · text warn-300 |
| info | bg info-100 · text info-700 | bg info-950 · text info-300 |

### Màu SAI cho trẻ em — bằng chứng (phần giá trị nhất)

- **Merrick & Fyfe 2023** (Contemporary Educational Psychology, peer-reviewed, đúng đối tượng trẻ giải Toán): cảm xúc tiêu cực sau câu sai là THẬT và ảnh hưởng kiên trì; nhưng yếu tố quyết định là **mức độ "phán xét" của tổng thể phản hồi** (dấu X to, giọng điệu, có sửa được không) — KHÔNG phải bản thân màu đỏ. "Bút đỏ gây lo âu" có nghiên cứu nhưng hiệu ứng lên lo âu không có ý nghĩa thống kê.
- **Duolingo dùng đỏ thật** (~#FF4B4B "Cardinal") — sáng, "vui", kèm cơ chế không-mất-trắng. Trẻ em vốn đã liên tưởng đỏ = cần chú ý → đó là SỨC MẠNH nhận diện tức thời, không phải điểm yếu.
- → Kết luận: **người dùng đúng — dùng đỏ thật (#DE2127, L50 mềm hơn đỏ báo động) cho câu sai**; sự "nhẹ nhàng" nằm ở giọng ("Chưa đúng, thử lại nhé"), animation, cơ chế — không phải né màu. Coral #E07A5F hạ vai xuống trang trí/minh họa (nó cũng FAIL contrast 2.95:1 nên không làm text/nút được).
- **Bắt buộc accessibility**: đúng/sai không bao giờ chỉ dựa màu (mù màu đỏ-lục) — luôn kèm icon ✓/✗ + text.

### Contrast check chủ chốt (tính bằng công thức WCAG 2.x)

- Amber-500 trên trắng: **2.03:1 FAIL** → amber KHÔNG BAO GIỜ làm chữ; đúng cách: amber làm NỀN, chữ tối #0A2E26 lên trên (7.24:1 AAA)
- Emerald-700 trên trắng: 5.32:1 AA ✓ (làm text/link được); nhưng trên nền tối chỉ 3.54:1 → dark mode phải dùng emerald-300/400
- Red-500 trên trắng: 4.82:1 AA ✓; dark mode text dùng red-400
- Warn-500 FAIL cả 3:1 → warning text luôn dùng warn-700/800
- Dark mode: desaturate amber (#E6AC4C) cho fill diện tích lớn — WCAG số học pass nhưng amber gốc S91 gây chói trên nền tối

## PHẦN 2 — HỆ FONT

### Bài toán tiếng Việt (nguồn: Donny Trương "Vietnamese Typography" + TypeDrawers)

Tiếng Việt = 2 lớp dấu chồng (ă/â/ơ + sắc/huyền/hỏi/ngã/nặng → ế, ỗ, ở...). Font "có glyph Việt" ≠ "vẽ dấu đúng": 3 lỗi phổ biến — dấu va chạm/dính, dấu bị cắt khi line-height thấp, trọng lượng dấu lệch thân chữ. **Nunito có lỗi dấu Việt đã ghi nhận từ 2017 chưa fix** (loại khỏi body text). Line-height tiếng Việt: tối thiểu ~130% (rộng hơn tiếng Anh), tăng thêm khi chữ nhỏ/đậm. Test bắt buộc trước khi khóa font: chuỗi `ẩm ương, nghiêng ngả, tưởng tượng, ễnh ương, thuở` ở đúng size/weight thật.

### Đề xuất chính — Phương án A "an toàn, tối giản" ⭐

| Vai trò | Font | Lý do |
|---|---|---|
| Display/Heading | **Be Vietnam Pro** 600/700 | Thiết kế BỞI người Việt (LAM Type) — dấu vẽ đúng từ gốc, rủi ro thấp nhất; hiện đại mà ấm |
| Body (báo cáo, đoạn dài) | **Be Vietnam Pro** 400/500 | Cùng family — nhất quán + ít file tải |
| UI (nút, label, bảng) | **Inter** variable | Chuẩn UI toàn cầu, tabular figures sẵn |
| Số liệu dashboard | Inter + `font-variant-numeric: tabular-nums` | Không cần font mono riêng |
| Chat học sinh | Be Vietnam Pro (hoặc A/B thử **Lexend** — có RCT readability trên 2.684 học sinh, mạnh với người đọc yếu) | |

Tổng tải: 2 family ~5-6 file (chỉ load weight dùng thật), qua `next/font/google` với `subsets: ['latin','vietnamese']` — tự self-host lúc build, không round-trip CDN, hợp mạng VN.

Phương án B (cá tính hơn, rủi ro dấu chưa kiểm chứng): Space Grotesk + Literata + Plus Jakarta Sans. Phương án C (bản sắc Việt): thêm PhuDu (font Việt của Dương Trần) CHỈ cho hero/display.

### KaTeX (công thức Toán)

KaTeX dùng bộ font toán riêng (Computer Modern) — không đổi được ký hiệu lõi sang font UI, và đó là chuẩn ngành (chữ toán ≠ chữ đọc, người học quen mắt). Lưu ý: công thức cao hơn dòng thường ~1.21× + dấu Việt cần khoảng trên → đoạn có công thức inline cần line-height ≥130%. Self-host font KaTeX (không CDN).

## Giới hạn trung thực

Duolingo #FF4B4B là trích gián tiếp (trang chặn fetch); font-stack thực tế của edtech VN không xác minh được; đánh giá dấu của Manrope/Lora/Space Grotesk dựa uy tín nguồn, chưa kiểm chứng độc lập — trước khi khóa font phải tự test chuỗi ký tự khó; sắc độ chính xác của red-500/warn là gu có thể chỉnh ±5-10%.

## Nguồn

URL đầy đủ trong lịch sử hội thoại 05/08/2026: Radix Colors, Material 3 tonal surfaces, shadcn theming, Tailwind v4, Merrick & Fyfe 2023 (PMC10420002), NPR/Lycoming red-pen studies, think.design colorblindness, vietnamesetypography.com (Donny Trương), TypeDrawers, googlefonts/nunito#6, Google Design Lexend, TypeTogether Literata, KaTeX docs, Next.js font docs.
