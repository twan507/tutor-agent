# Rangi (repo: tutor-agent)

Nền tảng gia sư AI parent-first cho thị trường Việt Nam. Bán quyền kiểm soát quá trình học cho phụ huynh: hệ thống tạo lộ trình, dạy, kiểm tra, đo, điều chỉnh và báo cáo.

- **MVP** (định hướng): Learning Sprint — ôn thi Toán THCS trong 7-14 ngày
- **Tech stack** (đã chốt 04/08/2026): Next.js + Django/django-ninja + Celery + PostgreSQL/pgvector + Nginx, Docker Compose trên VPS, R2

## Tài liệu

- [CLAUDE.md](CLAUDE.md) — quy tắc làm việc cho AI agent trong repo
- [docs/background/bao-cao-du-an-gia-su-ai-parent-first.md](docs/background/bao-cao-du-an-gia-su-ai-parent-first.md) — báo cáo tổng hợp dự án
- [docs/background/bao-cao-phap-ly-ai-du-an-gia-su.md](docs/background/bao-cao-phap-ly-ai-du-an-gia-su.md) — báo cáo pháp lý AI
- [docs/background/nhat-ky-hoi-thoai-du-an-flibby.md](docs/background/nhat-ky-hoi-thoai-du-an-flibby.md) — nhật ký brainstorm và quyết định
- frontend/public/brand/ — bộ logo Rangi (SVG generated + PNG exports)

## Chạy dự án

Yêu cầu: Docker (Desktop hoặc Engine) đang chạy, Node.js (đã cần cho Next.js), [pnpm](https://pnpm.io/installation) (quản lý gói frontend), [uv](https://docs.astral.sh/uv/getting-started/installation/) (quản lý gói + venv backend), và file `.env` ở gốc repo (copy từ `.env.example`, điền secret local — script tự chép nếu thiếu).

**Chuẩn bị lần đầu** (sau khi clone): `cd frontend && pnpm install` — bắt buộc, vì `pnpm dev`/`pnpm build` sẽ lỗi nếu chưa có `node_modules`. Backend thì không cần bước tương ứng: `uv run ...` (được `dev-start` gọi bên trong) tự tạo/đồng bộ venv từ `backend/pyproject.toml` trước khi chạy.

Toàn bộ logic nằm trong `scripts/stack.mjs` (Node thuần, không thêm dependency); `package.json` ở gốc chỉ khai báo 5 tên lệnh trỏ vào đó. Gõ `pnpm <lệnh>` từ gốc repo — giống hệt nhau trên cmd, PowerShell, Linux/macOS, không cần tiền tố `.\`:

| Lệnh | Việc |
|---|---|
| `pnpm dev-start` | Postgres (Docker) + migrate + Django `:8000` + Next.js `:3000`, log gộp `[be]`/`[fe]`, Ctrl+C tắt sạch |
| `pnpm dev-stop` | Tắt tiến trình dev + **stop** container Postgres (giữ container và volume) |
| `pnpm docker-up` | Build + chạy cả cụm 5 container, truy cập `http://localhost` |
| `pnpm docker-down` | **Xóa container** cả 2 tầng (app + infra), **GIỮ volume dữ liệu** |
| `pnpm docker-clean` | Dọn build cache + image mồ côi + volume **vô danh**; in dung lượng trước/sau. KHÔNG đụng volume có tên |

> Gõ `pnpm run` không kèm gì để xem danh sách lệnh. Các wrapper `.bat`/`.sh` cũ được lưu trữ trong `scripts/` (vd `scripts\dev-start` trên Windows, `./scripts/dev-start.sh` trên Linux) — vẫn chạy được, nhưng `pnpm <lệnh>` là cửa vào chính thức.

### Hai chế độ, hai bộ cổng

- **`dev-start` (hot-reload, dùng hằng ngày khi code)**: Django chạy trực tiếp trên máy ở `:8000`, Next.js ở `:3000`, chỉ Postgres chạy trong Docker ở `:5432`. Sửa file thấy reload ngay, không cần rebuild image.
- **`docker-up` (mô phỏng production, dùng để kiểm tra trước khi deploy)**: cả cụm chạy trong container sau Nginx, chỉ có `:80` — `http://localhost/api/healthz` → `{"status": "ok"}`, `http://localhost/` → Next.js, `http://localhost/admin` → Django admin (tạo superuser trước bằng `docker compose -p tutor-app -f deploy/app/docker-compose.yml --env-file .env exec backend python manage.py createsuperuser`). Postgres vẫn expose `:5432`.

### Ma trận tác động (tra khi phân vân lệnh nào đụng gì)

| Thành phần | dev-start | dev-stop | docker-up | docker-down | docker-clean |
|---|---|---|---|---|---|
| Container Postgres | tạo/bật, chờ healthy | **stop** | tạo/bật, chờ healthy | **xóa** | không đụng |
| Volume `tutor-infra_pgdata` | giữ | giữ | giữ | **GIỮ** | **KHÔNG BAO GIỜ đụng** |
| Django (máy, `:8000`) | chạy hot-reload | tắt | không đụng | không đụng | không đụng |
| Next.js (máy, `:3000`) | chạy hot-reload | tắt | không đụng | không đụng | không đụng |
| 4 container app | không đụng | không đụng | build + chạy | **xóa** | không đụng |
| Build cache | không đụng | không đụng | dùng | không đụng | **xóa** |
| Image mồ côi `<none>` | — | — | — | — | **xóa** |
| Volume vô danh (mồ côi) | — | — | — | — | **xóa** |

### Dừng `dev-start`

Nhấn **Ctrl+C thật trong cửa sổ terminal** đang chạy lệnh — đây là cách duy nhất được kiểm chứng hoạt động trên Windows (đã kiểm chứng lại với `pnpm dev-start` ngày 07/08/2026: cả hai cổng tắt sạch, Postgres giữ nguyên). Có thể thấy dòng `Terminate batch job (Y/N)?` hiện ra — vô hại, tiến trình đã được tắt xong trước đó. **Không** dùng `kill -INT` từ Git Bash để gửi tín hiệu tới tiến trình `node.exe` — đã kiểm chứng tín hiệu đó không tới được tiến trình Node trên Windows, script sẽ không tắt sạch. Ctrl+C tắt cả Django lẫn Next.js, Postgres vẫn chạy (dùng `pnpm dev-stop` nếu muốn tắt luôn Postgres).

### Test / lint

Không còn `make test`/`make lint` (Makefile đã xóa) — gọi trực tiếp:

| Việc | Frontend (`cd frontend`) | Backend (`cd backend`) |
|---|---|---|
| Test | `pnpm test` | `uv run pytest` |
| Lint | `pnpm lint` | `uv run ruff check .` |
| Format check | `pnpm format:check` | — |
| Build | `pnpm build` | — |

### Ranh giới: máy lập trình vs. deploy VPS

Bộ 5 lệnh này chỉ dành cho **máy lập trình** (dev-start cần Node để chạy Django/Next.js ngoài Docker; docker-up/down/clean cần Docker). **Deploy VPS** (CI/CD giai đoạn 2) gọi thẳng `docker compose` qua SSH, không qua `scripts/stack.mjs` — VPS chỉ cần cài Docker, không cần Node.
