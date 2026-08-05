---
name: tech-stack-da-chot
type: semantic
created: 2026-08-04
modified: 2026-08-04
description: Tech stack đã chốt 04/08/2026 (Django/Next.js/Postgres/VPS) ; tên thương hiệu đã chốt RANGI 05/08 (xem thuong-hieu-da-chot)
---

Người dùng chốt tech stack ngày 04/08/2026 sau 4 vòng phản biện (chi tiết + lý do: `docs/research/nghien-cuu-tech-stack.md`, quy tắc: CLAUDE.md mục Tech stack):

Next.js (UI) + Django/django-ninja (BE, auth built-in, Admin cho human review) + Celery cùng codebase (SymPy/PDF/batch) + PostgreSQL/pgvector + SSE + Nginx + Docker Compose 2 tầng (infra tách khỏi app) trên VPS self-host + R2 + CI/CD GitHub Actions 3 giai đoạn.

Điểm cần nhớ về QUÁ TRÌNH (để không lặp lại tranh luận):
- FastAPI bị loại vì: fastapi-users maintenance-mode, Django Admin thắng lớn cho human-review, Celery cùng-codebase giải bài SymPy
- NestJS bị loại sau so sánh 9 mặt; điều kiện đổi chiều đã ghi trong docs
- Supabase/Neon/Cloud Run bị loại vì người dùng có VPS tự host
- WebSocket bị hoãn: SSE đủ cho turn-based learning; Channels thêm sau nếu có tính năng chat
- Người dùng từng thấy "Django trông phức tạp" — đã thuyết phục bằng dữ liệu; nếu ma sát thật xuất hiện khi code, ghi nhận lại

**CẬP NHẬT 05/08**: tên chốt RANGI (xem [[thuong-hieu-da-chot]]); code/infra vẫn `tutor-agent` tới khi tra xong nhãn hiệu SHTT. Nhật ký chọn tên cũ (10 vòng, các tên đã loại) ở docs/background/nhat-ky-hoi-thoai-du-an-flibby.md mục 7 — tham chiếu khi nghiên cứu tên mới để không tra lại tên đã loại.
