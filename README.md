# Flibby

Nền tảng gia sư AI parent-first cho thị trường Việt Nam. Bán quyền kiểm soát quá trình học cho phụ huynh: hệ thống tạo lộ trình, dạy, kiểm tra, đo, điều chỉnh và báo cáo.

- **MVP** (định hướng): Learning Sprint — ôn thi Toán THCS trong 7-14 ngày
- **Tech stack** (đã chốt 04/08/2026): Next.js + Django/django-ninja + Celery + PostgreSQL/pgvector + Nginx, Docker Compose trên VPS, R2

## Tài liệu

- [CLAUDE.md](CLAUDE.md) — quy tắc làm việc cho AI agent trong repo
- [docs/background/bao-cao-du-an-gia-su-ai-parent-first.md](docs/background/bao-cao-du-an-gia-su-ai-parent-first.md) — báo cáo tổng hợp dự án
- [docs/background/bao-cao-phap-ly-ai-du-an-gia-su.md](docs/background/bao-cao-phap-ly-ai-du-an-gia-su.md) — báo cáo pháp lý AI
- [docs/background/nhat-ky-hoi-thoai-du-an-flibby.md](docs/background/nhat-ky-hoi-thoai-du-an-flibby.md) — nhật ký brainstorm và quyết định

## Chạy dự án

Yêu cầu: Docker (Desktop hoặc Engine) đang chạy, và file `.env` ở gốc repo (copy từ `.env.example`, điền secret local).

```bash
make up
```

Lệnh này tạo network `tutor-net`, dựng tầng infra (Postgres/pgvector, đợi healthy) rồi build + dựng tầng app (backend Django, frontend Next.js, celery-worker, Nginx). Sau khi lên xong:

- `http://localhost/api/healthz` → `{"status": "ok"}`
- `http://localhost/` → trang Next.js
- `http://localhost/admin` → Django admin (tạo superuser trước bằng `docker compose -p tutor-app -f deploy/app/docker-compose.yml --env-file .env exec backend python manage.py createsuperuser`)

Máy không có lệnh `make`: dùng 3 lệnh tương đương ghi trong `Makefile` (`docker network create tutor-net`, rồi `docker compose -p tutor-infra -f deploy/infra/docker-compose.yml --env-file .env up -d --wait`, rồi `docker compose -p tutor-app -f deploy/app/docker-compose.yml --env-file .env up -d --build`).

Các lệnh khác:

```bash
make test   # pytest (backend) + vitest (frontend)
make lint   # ruff check/format (backend) + eslint/prettier (frontend)
make down-app  # dừng tầng app (giữ nguyên infra/data)
make logs   # tail log tầng app
```
