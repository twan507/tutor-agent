# Chỉ mục tài liệu dự án Flibby

Quy tắc: mỗi file trong `docs/` phải có một dòng ở đây (tên + hook một câu). Thêm file mới → thêm dòng index cùng lúc. Đọc index trước, chỉ mở file khi cần chi tiết.

## Sản phẩm & thị trường

- [bao-cao-du-an-gia-su-ai-parent-first.md](bao-cao-du-an-gia-su-ai-parent-first.md) — báo cáo tổng hợp dự án 18 mục: thesis, thị trường, cạnh tranh, 8 engine, MVP, GTM, unit economics, KPI, sổ rủi ro
- [nhat-ky-hoi-thoai-du-an-flibby.md](nhat-ky-hoi-thoai-du-an-flibby.md) — nhật ký brainstorm và phản biện; mục 8 là tổng kết quyết định đã chốt; mục 7 là hành trình chọn tên Flibby

## Pháp lý

- [bao-cao-phap-ly-ai-du-an-gia-su.md](bao-cao-phap-ly-ai-du-an-gia-su.md) — báo cáo pháp lý AI 12 mục: đối chiếu 3 mục Danh mục rủi ro cao (mục 4), bộ kiểm soát thiết kế (mục 7.1), checklist trước beta (mục 11); hạn cứng beta 15/08/2026

## Kỹ thuật

- [nghien-cuu-tech-stack.md](nghien-cuu-tech-stack.md) — tech stack ĐÃ CHỐT 04/08/2026: Next.js + Django/django-ninja + Celery + Postgres/pgvector + SSE + Nginx + Compose 2 tầng trên VPS + R2 + CI/CD 3 giai đoạn; kèm toàn bộ nghiên cứu và các vòng phản biện dẫn tới quyết định

- [nghien-cuu-chien-luoc-test.md](nghien-cuu-chien-luoc-test.md) — chiến lược test ĐÃ CHỐT 04/08/2026: pytest/Vitest/Playwright-chromium/DeepEval/promptfoo/mutmut, 9 quy tắc + anti-pattern + kiểm chứng "Playwright nặng"

## Specs & Plans

- [specs/2026-08-04-scaffold-monorepo.md](specs/2026-08-04-scaffold-monorepo.md) — spec scaffold khung monorepo theo stack đã chốt (TRẠNG THÁI: chờ duyệt)
- [plans/2026-08-04-scaffold-monorepo-plan.md](plans/2026-08-04-scaffold-monorepo-plan.md) — implementation plan 8 task chi tiết từng file/lệnh/expected cho scaffold (TRẠNG THÁI: chờ duyệt)

## Vận hành agent

- [nghien-cuu-ky-thuat-agent-memory.md](nghien-cuu-ky-thuat-agent-memory.md) — khảo sát 9 hệ thống agent memory; kết luận: file-based + index trần cứng + phân loại 3 type + reflection loop, không cần vector DB/graph
- [nghien-cuu-chuan-hoa-ky-su-cao-cap.md](nghien-cuu-chuan-hoa-ky-su-cao-cap.md) — khảo sát chuẩn hóa hành vi senior engineer: 2 tầng quy tắc mềm/cứng, xếp hạng 7 pattern, anti-pattern, những gì đã áp dụng vào repo
