# Bộ nhận diện Rangi — assets

Tất cả file trong thư mục này (kể cả `logo-paths.ts` dùng bởi component React) là **GENERATED** — nguồn gốc duy nhất là `frontend/scripts/brand/generate-logo.mjs` (SVG + logo-paths.ts) và `frontend/scripts/brand/export-png.mjs` (PNG). **KHÔNG sửa tay các file trong thư mục này.** Muốn thay đổi: sửa generator rồi chạy lại:

```bash
cd frontend && pnpm brand:generate && pnpm brand:png
```

Spec đầy đủ: `docs/specs/2026-08-05-goi-logo-rangi.md`.

## SVG (12 file, thư mục này)

| File                            | Mô tả                                                                            | Dùng ở đâu                                                       |
| ------------------------------- | -------------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `rangi-wordmark-dark.svg`       | Wordmark "RANG" + chữ I tùy biến + chấm sáng, màu cho nền tối (đêm rừng)         | Header/footer trên nền tối, tài liệu in nền tối                  |
| `rangi-wordmark-light.svg`      | Wordmark, màu cho nền kem/trắng                                                  | Header trang chủ, tài liệu nền sáng — dùng ở `page.tsx` hiện tại |
| `rangi-wordmark-mono-black.svg` | Wordmark đơn sắc đen                                                             | In ấn 1 màu, fax, nền không thuộc hệ màu chuẩn                   |
| `rangi-wordmark-mono-white.svg` | Wordmark đơn sắc trắng                                                           | Overlay lên ảnh/video, nền tối bất kỳ                            |
| `rangi-icon-dark.svg`           | Icon vuông 48×48 bo góc, nền đêm rừng `#0A2E26` + chữ I + chấm                   | App icon nền tối, social avatar                                  |
| `rangi-icon-light.svg`          | Icon vuông, nền kem `#FBF6EA`                                                    | App icon nền sáng                                                |
| `rangi-icon-mono-black.svg`     | Icon đơn sắc đen, nền trong suốt                                                 | In ấn 1 màu, watermark nhạt                                      |
| `rangi-icon-mono-white.svg`     | Icon đơn sắc trắng, nền trong suốt                                               | Overlay trên ảnh/nền màu                                         |
| `rangi-lockup-slogan-dark.svg`  | Wordmark + slogan "Giỏi hơn chính mình hôm qua" (Be Vietnam Pro Medium), nền tối | Slide/tài liệu trình bày nền tối, banner                         |
| `rangi-lockup-slogan-light.svg` | Wordmark + slogan, nền sáng                                                      | Slide/tài liệu nền sáng, print                                   |
| `favicon.svg`                   | = `rangi-icon-dark.svg`, dùng làm favicon trình duyệt hiện đại                   | `<link rel="icon">`                                              |
| `og-image.svg`                  | 1200×630, nền đêm rừng, lockup slogan giữa khung                                 | Nguồn cho `png/og-image.png` (Open Graph/social share)           |

## PNG (8 file, `png/`)

Xuất từ `rangi-icon-dark.svg` (trừ khi ghi chú khác), dùng cho các bề mặt không nhận SVG (email, Zalo, app store, OG crawler).

| File                 | Kích thước | Dùng ở đâu                                        |
| -------------------- | ---------- | ------------------------------------------------- |
| `png/icon-16.png`    | 16×16      | Favicon fallback, tab trình duyệt cũ              |
| `png/icon-32.png`    | 32×32      | Favicon fallback độ phân giải cao                 |
| `png/icon-48.png`    | 48×48      | Windows site icon, PWA nhỏ                        |
| `png/icon-180.png`   | 180×180    | `apple-touch-icon` (iOS home screen)              |
| `png/icon-192.png`   | 192×192    | PWA manifest icon                                 |
| `png/icon-512.png`   | 512×512    | PWA manifest icon, splash screen                  |
| `png/og-image.png`   | 1200×630   | Open Graph / Twitter card (nguồn: `og-image.svg`) |
| `png/avatar-400.png` | 400×400    | Social avatar (Facebook/Zalo/TikTok)              |

## Quy tắc sử dụng

- **Vùng an toàn**: chừa khoảng trống tối thiểu quanh logo bằng đường kính quầng sáng (halo) quanh chấm — không đặt text/UI khác chồng vào vùng này.
- **Kích thước tối thiểu**: wordmark không hiển thị nhỏ hơn 120px chiều ngang — dưới ngưỡng đó, dùng biến thể `icon` thay vì thu nhỏ wordmark.
- **Cấm kéo méo** logo theo bất kỳ trục nào (giữ nguyên tỷ lệ khung `viewBox`).
- **Cấm đổi màu chấm sáng** ngoài 4 biến thể đã định nghĩa (dark/light/mono-white/mono-black).
- **Cấm đặt logo lên nền làm chìm quầng sáng** (nền cùng tông màu/độ sáng với halo khiến quầng không còn tương phản) — chọn đúng biến thể (dark/light/mono) theo nền thực tế.
- **Cấm thêm hiệu ứng bóng/glow ngoài hệ** (drop-shadow, text-shadow, SVG filter, v.v.) — quầng sáng đã được thiết kế sẵn bằng lớp circle opacity, không cần lớp hiệu ứng bổ sung.
