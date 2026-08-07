# Chỉ mục tài liệu dự án

Quy tắc: mỗi file trong `docs/` phải có một dòng ở đây (tên + hook một câu). Thêm file mới → thêm dòng index cùng lúc. Đọc index trước, chỉ mở file khi cần chi tiết.

Cấu trúc: `background/` bản nháp định hướng (demo, chưa chốt) | `research/` nghiên cứu đã kiểm chứng | `brand/` sổ tay thương hiệu (canonical) | `specs/` spec tính năng | `plans/` implementation plan.

## background/ — bản nháp định hướng

- [background/bao-cao-du-an-gia-su-ai-parent-first.md](background/bao-cao-du-an-gia-su-ai-parent-first.md) — báo cáo tổng hợp dự án 18 mục: thesis, thị trường, cạnh tranh, 8 engine, MVP, GTM, unit economics, KPI, sổ rủi ro
- [background/nhat-ky-hoi-thoai-du-an-flibby.md](background/nhat-ky-hoi-thoai-du-an-flibby.md) — nhật ký brainstorm và phản biện; mục 8 là tổng kết quyết định; mục 7 là hành trình chọn tên (tham chiếu khi nghiên cứu tên mới)
- [background/bao-cao-phap-ly-ai-du-an-gia-su.md](background/bao-cao-phap-ly-ai-du-an-gia-su.md) — báo cáo pháp lý AI 12 mục: đối chiếu 3 mục Danh mục rủi ro cao (mục 4), bộ kiểm soát thiết kế (mục 7.1), checklist trước beta (mục 11)

## brand/ — sổ tay thương hiệu

- [brand/so-tay-thuong-hieu-rangi.md](brand/so-tay-thuong-hieu-rangi.md) — tài liệu chuẩn về Ý NGHĨA và CÁCH KỂ CHUYỆN thương hiệu Rangi: 3 tầng nghĩa của "Rang" + 3 tầng của chữ "i", 7 hướng khai thác marketing, mascot đom đóm (điển tích + quy tắc anti-Duolingo), câu chuyện màu (quang phổ đom đóm + ngọc bất trác), lý do chọn PhuDu, giải nghĩa từng chi tiết logo, triết lý, slogan, 4 trụ thông điệp, brand voice, ngôn ngữ cấm

## research/ — nghiên cứu đã kiểm chứng

- [research/nghien-cuu-tech-stack.md](research/nghien-cuu-tech-stack.md) — tech stack ĐÃ CHỐT 04/08/2026: Next.js + Django/django-ninja + Celery + Postgres/pgvector + SSE + Nginx + Compose 2 tầng trên VPS + R2 + CI/CD 3 giai đoạn; kèm toàn bộ các vòng phản biện
- [research/nghien-cuu-chien-luoc-test.md](research/nghien-cuu-chien-luoc-test.md) — chiến lược test ĐÃ CHỐT 04/08/2026: pytest/Vitest/Playwright-chromium/DeepEval/promptfoo/mutmut, 9 quy tắc + anti-pattern + kiểm chứng "Playwright nặng"
- [research/nghien-cuu-ky-thuat-agent-memory.md](research/nghien-cuu-ky-thuat-agent-memory.md) — khảo sát 9 hệ thống agent memory; kết luận: file-based + index trần cứng + phân loại 3 type + reflection loop
- [research/nghien-cuu-chuan-hoa-ky-su-cao-cap.md](research/nghien-cuu-chuan-hoa-ky-su-cao-cap.md) — chuẩn hóa hành vi senior engineer: 2 tầng quy tắc mềm/cứng, xếp hạng 7 pattern, anti-pattern
- [research/nghien-cuu-nao-ai-orchestrator.md](research/nghien-cuu-nao-ai-orchestrator.md) — "não" AI sản phẩm: kiểm chứng MiniMax M3 (⚠️ ToS under-16), so sánh orchestrator (đề xuất Gemini Flash + Sonnet fallback), chi phí/học sinh/tháng, harness tự viết + ai_call() + litellm (TRẠNG THÁI: đề xuất, chờ eval tiếng Việt nội bộ trước khi chốt model)
- [research/nghien-cuu-thuong-hieu.md](research/nghien-cuu-thuong-hieu.md) — vòng 11 branding: tên (top 3: Rangi/Compa/Yumo vs Flibby), màu hổ phách+navy (khoảng trống thị trường), mascot đom đóm (chưa ai chiếm, nguyên tắc anti-Duolingo), triết lý "ngọn đèn nhỏ", slogan, 4 trụ messaging, ⚠️ né cụm "Đèn Đom Đóm" của Dutch Lady (TRẠNG THÁI: đề xuất, chờ người dùng quyết)
- [research/nghien-cuu-skills-mattpocock.md](research/nghien-cuu-skills-mattpocock.md) — khảo sát repo skills của Matt Pocock 05/08/2026: 5 kỹ thuật đã nhận vào harness (CONTEXT.md glossary, grilling frontier, debug kỷ luật, review hai trục, cắt tỉa tài liệu) + 4 nhóm bị loại kèm lý do và điều kiện xem lại
- [research/nghien-cuu-he-mau-va-font.md](research/nghien-cuu-he-mau-va-font.md) — hệ màu UI 2 mode đầy đủ (ramp 11 bậc × 6 màu + semantic token + WCAG check + bằng chứng đỏ-cho-trẻ Merrick&Fyfe) và hệ font song ngữ (Be Vietnam Pro + Inter đề xuất chính, bài toán dấu tiếng Việt, KaTeX) (TRẠNG THÁI: đề xuất, chờ chốt)
- [research/danh-gia-tham-my-mascot-icon-2026-08-05.md](research/danh-gia-tham-my-mascot-icon-2026-08-05.md) — đánh giá chất lượng mascot/icon gói SVG 05/08 + nguyên nhân gốc; KẾT QUẢ vòng mockup v2 06/08: logo mềm LOẠI (giữ logo chính thức), mascot v2 tỷ lệ chuẩn từ trace "tạm ổn chưa chốt hẳn", prototype + hàm sinh SVG tại frontend/scripts/brand/proto-v2/

## specs/ — đặc tả tính năng

- [specs/2026-08-04-scaffold-monorepo.md](specs/2026-08-04-scaffold-monorepo.md) — spec scaffold khung monorepo theo stack đã chốt (TRẠNG THÁI: đã thực thi 04/08/2026)
- [specs/2026-08-05-goi-logo-rangi.md](specs/2026-08-05-goi-logo-rangi.md) — spec gói logo Rangi: generator fontkit → SVG, component React animation CSS, xuất PNG (TRẠNG THÁI: đã thực thi 05/08/2026; ⚠️ phần animation CSS đã bị gỡ 07/08/2026 — logo nay là SVG tĩnh)

- [specs/2026-08-05-lenh-chay-du-an.md](specs/2026-08-05-lenh-chay-du-an.md) — spec bộ 5 lệnh chạy dự án thay Makefile: dev-start/dev-stop/docker-up/docker-down/docker-clean, ma trận tác động, ranh giới dữ liệu (TRẠNG THÁI: đã thực thi 05/08/2026)
- [specs/2026-08-05-goi-mo-rong-nhan-dien-svg.md](specs/2026-08-05-goi-mo-rong-nhan-dien-svg.md) — spec gói mở rộng nhận diện SVG: pose sheet đom đóm geometric, motif đường bay, lockup dọc, 21 icon × 2 bộ outline/filled, pattern nền, animation RangiSplash (TRẠNG THÁI: đã duyệt + đã thực thi 05/08/2026; ⚠️ motif đường bay, pattern, lockup dọc, pose `flying` và RangiSplash ĐÃ BỊ LOẠI sau đó — spec giữ làm lịch sử, nguồn đúng hiện tại là sổ tay thương hiệu §3.3-3.4)

- [specs/2026-08-07-bo-icon-tabler.md](specs/2026-08-07-bo-icon-tabler.md) — spec thay 42 icon tự vẽ bằng Tabler Icons (MIT): vì sao Tabler thắng Phosphor/Material Symbols (outline vẽ bằng nét nên restyle được), bỏ quy tắc "mọi icon phải có hai bộ", danh mục 127 khái niệm 9 nhóm + bảng ánh xạ đầy đủ (TRẠNG THÁI: chờ duyệt)

## plans/ — kế hoạch thực thi

- [plans/2026-08-04-scaffold-monorepo-plan.md](plans/2026-08-04-scaffold-monorepo-plan.md) — implementation plan 8 task chi tiết từng file/lệnh/expected cho scaffold (TRẠNG THÁI: đã thực thi 04/08/2026 — verify E2E 4/4 tiêu chí DoD PASS, xem `.superpowers/sdd/2026-08-04-scaffold-monorepo-plan/task-7-report.md`)
- [plans/2026-08-05-goi-logo-rangi-plan.md](plans/2026-08-05-goi-logo-rangi-plan.md) — implementation plan 4 task cho gói logo Rangi: generator + SVG, component React, xuất PNG, tích hợp trang chủ + tài liệu (TRẠNG THÁI: đã thực thi 05/08/2026 — xem `.superpowers/sdd/2026-08-05-goi-logo-rangi-plan/task-4-report.md`)
- [plans/2026-08-05-lenh-chay-du-an-plan.md](plans/2026-08-05-lenh-chay-du-an-plan.md) — plan 3 task: script lõi + lệnh docker, dev-start/dev-stop hot-reload, tài liệu + verify (TRẠNG THÁI: đã thực thi 05/08/2026)
- [plans/2026-08-07-bo-icon-tabler-plan.md](plans/2026-08-07-bo-icon-tabler-plan.md) — plan 7 task cho bộ icon Tabler: manifest, rule mức manifest (TDD), generator (TDD), checker đọc manifest, sinh 220 file, giấy phép + tài liệu, review (TRẠNG THÁI: đang thực thi 07/08/2026)
- [plans/2026-08-05-goi-mo-rong-nhan-dien-svg-plan.md](plans/2026-08-05-goi-mo-rong-nhan-dien-svg-plan.md) — plan 11 task cho gói mở rộng nhận diện: motifs module TDD, flight path, lockup dọc, checker brand:check, 21 × 2 icon, mascot 4 pose, pattern, RangiSplash, docs + review + verify (TRẠNG THÁI: đã thực thi 05/08/2026; ⚠️ nhiều hạng mục đã bị loại sau đó — xem ghi chú ở dòng spec tương ứng)
