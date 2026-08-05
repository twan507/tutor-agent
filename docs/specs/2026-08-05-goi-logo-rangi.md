# Spec: Gói logo Rangi (SVG vector + animation)

Ngày: 05/08/2026. Trạng thái: CHỜ DUYỆT. Căn cứ: CLAUDE.md mục "Bộ nhận diện thương hiệu"; wordmark đã được người dùng duyệt qua 3 vòng tinh chỉnh trực quan (in hoa PhuDu, chữ I rút ngắn, khe quang học).

## Mục tiêu

Bộ logo SVG hoàn chỉnh — nguồn gốc duy nhất là code sinh tự động (không file vẽ tay), nhúng được vào web app với animation CSS điều khiển bằng props, kèm bộ xuất PNG cho các bề mặt không nhận SVG.

## Thông số wordmark ĐÃ KHÓA (đơn vị em = tỷ lệ theo font-size)

```
Chữ:            "RANG" — PhuDu weight 700, in hoa, letter-spacing 0.033em
Chữ I tùy biến: thân rect cao 0.417em, rộng 0.167em, bo góc 0.033em,
                đáy chạm baseline
Chấm sáng:      circle r 0.125em, tâm cách baseline 0.608em
                (đỉnh chấm ngang cap-height — khối chữ phẳng đầu)
Quầng sáng:     circle r 0.225em cùng tâm, không vượt cap-height
Khe quang học:  khoảng cách G→thân I = 0.092em (letter-spacing + đệm nét mảnh)
```

Mọi biến thể/kích thước đều suy từ bộ tỷ lệ này. Chữ trong file SVG cuối là **path** (convert từ font), không phải text sống.

## Màu theo biến thể (từ hệ màu đã chốt)

| Biến thể | Chữ + thân I | Chấm | Quầng |
|---|---|---|---|
| dark (nền đêm rừng/tối) | #FBF6EA | #F5A623 | #F5A623 op .20 |
| light (nền kem/trắng) | #0A2E26 | #EF8D08 | #F5A623 op .28 |
| mono-white | #FFFFFF tất cả | #FFFFFF | không có |
| mono-black | #0B0B0B tất cả | #0B0B0B | không có |

## Deliverables

### 1. Generator (nguồn gốc duy nhất)

`frontend/scripts/brand/generate-logo.mjs` — Node script dùng **fontkit**:
- Đọc font: `frontend/scripts/brand/fonts/Phudu[wght].ttf` (variable, lấy instance wght=700) và `BeVietnamPro-Medium.ttf` (cho dòng slogan trong lockup) — tải từ repo google/fonts (giấy phép OFL, kèm file OFL.txt vào cùng thư mục)
- Convert "RANG" → path data; dựng I + chấm + quầng theo tỷ lệ khóa
- Sinh ra:
  - `frontend/src/components/brand/logo-paths.ts` (generated — path data + metrics cho component)
  - `frontend/public/brand/rangi-wordmark-{dark,light,mono-white,mono-black}.svg`
  - `frontend/public/brand/rangi-lockup-slogan-{dark,light}.svg` (wordmark + "Giỏi hơn chính mình hôm qua" Be Vietnam Pro Medium, path)
  - `frontend/public/brand/rangi-icon-{dark,light,mono-white,mono-black}.svg` (vuông 48×48: nền bo góc 11 [dark #0A2E26 / light #FBF6EA / mono trong suốt] + chữ I + chấm phóng to giữa khung — theo demo đã duyệt)
  - `frontend/public/brand/favicon.svg` (= icon dark)
  - `frontend/public/brand/og-image.svg` (1200×630: nền đêm rừng, lockup slogan giữa)
- **Deterministic**: chạy 2 lần cho output giống hệt (được phép ghi chú version fontkit)

### 2. Component React

`frontend/src/components/brand/RangiLogo.tsx` + `rangi-logo.module.css`:
- Props: `variant: 'wordmark' | 'icon'`, `theme: 'dark' | 'light' | 'mono-white' | 'mono-black'`, `progress?: number` (0-1), `animated?: boolean` (mặc định true), `className?`, `title?` (aria)
- Hành vi động (đúng quy tắc mascot đã chốt):
  - `progress` có giá trị → bán kính chấm + opacity/bán kính quầng scale theo (công thức như prototype đã duyệt: dot r = base×(1+0.6p), halo op = 0.06+0.3p, halo r = base×(1+p))
  - `progress === 0` → trạng thái nghỉ: chấm mờ op 0.35, KHÔNG hiệu ứng buồn/tội lỗi
  - `animated` → nhịp "thở" CSS keyframes (scale chấm ±6%), biên độ nhân theo mức sáng
  - `prefers-reduced-motion: reduce` → tắt keyframes hoàn toàn (CSS media query, không JS)
- Quầng sáng bằng lớp circle + opacity — CẤM SVG filter (feGaussianBlur) vì hiệu năng
- Accessibility: `role="img"` + `<title>`

### 3. Xuất PNG

`frontend/scripts/brand/export-png.mjs` dùng **sharp** (devDependency):
- icon: 16, 32, 48, 180 (apple-touch), 192, 512 (PWA) từ icon-dark
- og-image.png 1200×630; avatar.png 400×400 (icon-dark)
- Output: `frontend/public/brand/png/` — COMMIT vào git (bề mặt email/Zalo/store dùng trực tiếp)

### 4. Tích hợp + tài liệu

- `frontend/src/app/page.tsx`: thay `<h1>tutor-agent</h1>` bằng `<RangiLogo variant="wordmark" theme="light"/>`
- `frontend/public/brand/README.md`: bảng biến thể + quy tắc sử dụng (vùng an toàn = đường kính quầng; kích thước tối thiểu wordmark 120px ngang, dưới đó dùng icon; cấm kéo méo/đổi màu chấm/đặt lên nền làm chìm quầng)
- README gốc + docs index + TASKS cập nhật

## Definition of Done

1. `node scripts/brand/generate-logo.mjs` chạy sạch, sinh đủ 11 file SVG + logo-paths.ts; chạy lại lần 2 → git diff rỗng
2. `node scripts/brand/export-png.mjs` sinh đủ 8 PNG đúng kích thước (verify bằng sharp metadata)
3. Test component (Vitest) xanh: render đúng variant/theme, progress đổi thuộc tính chấm/quầng, reduced-motion không có class animation
4. `pnpm lint && pnpm format:check && pnpm test && pnpm build` sạch; trang chủ hiển thị wordmark
5. CI xanh trên GitHub

## Ghi chú quy trình

- Làm trên nhánh `feat/brand-logo` (lần đầu áp dụng kỷ luật nhánh — repo đã có code chạy); merge về main sau final review (merge local vì chưa có gh CLI/PR flow)
- Lưu ý pháp lý: KHÔNG đưa chữ "Rangi" vào tên package/identifier hạ tầng (giữ tutor-agent) — logo assets là tài sản thương hiệu, chấp nhận xuất hiện trong repo public (tên đã public trong docs); việc tra + nộp nhãn hiệu SHTT (TASKS) càng sớm càng tốt vì repo public
- KHÔNG làm trong gói này: animation Lottie/video, mascot dạng nhân vật đầy đủ (chỉ đốm sáng + chữ I), favicon .ico đa tầng (favicon.svg + PNG đủ cho trình duyệt hiện đại)

## Rủi ro kỹ thuật

fontkit API với variable font (lấy instance wght 700): nếu API khác dự kiến trong plan, implementer được điều chỉnh cách gọi trong phạm vi script, giữ nguyên output contract, ghi chú deviation trong report.
