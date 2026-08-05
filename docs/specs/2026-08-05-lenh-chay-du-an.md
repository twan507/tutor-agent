# Spec: Bộ lệnh chạy dự án (dev / docker / clean)

Ngày: 05/08/2026. Trạng thái: ĐÃ DUYỆT (người dùng chốt qua hội thoại). Thay thế Makefile hiện tại — máy dev không có `make`.

## Vấn đề đang giải

1. `Makefile` hiện tại **chưa từng chạy được** trên máy người dùng (Windows không có `make`) — lệnh `make up` trong README là lệnh chết.
2. **Chưa có chế độ dev hot-reload**. Chạy `manage.py runserver` ngoài Docker sẽ không kết nối được DB: `.env` khai `POSTGRES_HOST=postgres` (tên service trong mạng Docker) và Django không đọc `.env` (không có dotenv) nên rơi về default sai mật khẩu.
3. Thiếu lệnh dọn rác Docker → người dùng có thói quen cũ "xóa hết volume cho lành", nguy hiểm khi DB dev nằm trong volume. Đo thực tế trên máy: build cache 15.75 GB + 632 MB volume mồ côi, trong khi volume DB chỉ 48 MB.

## Năm lệnh

| Lệnh | Windows (cmd) | Linux/VPS | Việc |
|---|---|---|---|
| `dev-start` | `dev-start` | `./dev-start.sh` | Postgres (Docker) + migrate + Django :8000 + Next :3000, log gộp, Ctrl+C tắt sạch |
| `dev-stop` | `dev-stop` | `./dev-stop.sh` | Tắt tiến trình dev + **stop** container Postgres (giữ container và volume) |
| `docker-up` | `docker-up` | `./docker-up.sh` | Build + chạy cả cụm 5 container, truy cập `http://localhost` |
| `docker-down` | `docker-down` | `./docker-down.sh` | **Xóa container** cả 2 tầng (app + infra), **GIỮ volume dữ liệu** |
| `docker-clean` | `docker-clean` | `./docker-clean.sh` | Dọn build cache + image mồ côi + volume **vô danh**; in dung lượng trước/sau. KHÔNG đụng volume có tên |

## Ma trận tác động (nguồn chân lý khi nghi ngờ lệnh nào làm gì)

| Thành phần | dev-start | dev-stop | docker-up | docker-down | docker-clean |
|---|---|---|---|---|---|
| Container Postgres | tạo/bật, chờ healthy | **stop** | tạo/bật, chờ healthy | **xóa** | không đụng |
| Volume `tutor-infra_pgdata` | giữ | giữ | giữ | **GIỮ** | **KHÔNG BAO GIỜ đụng** |
| Django (máy, :8000) | chạy hot-reload | tắt | không đụng | không đụng | không đụng |
| Next.js (máy, :3000) | chạy hot-reload | tắt | không đụng | không đụng | không đụng |
| 4 container app | không đụng | không đụng | build + chạy | **xóa** | không đụng |
| Build cache | không đụng | không đụng | dùng | không đụng | **xóa** |
| Image mồ côi `<none>` | — | — | — | — | **xóa** |
| Volume vô danh (mồ côi) | — | — | — | — | **xóa** |

## Kiến trúc

```
scripts/stack.mjs        ← TOÀN BỘ logic (Node thuần, không thêm dependency)
dev-start.bat            ← 1 dòng gọi node scripts/stack.mjs dev-start
dev-stop.bat  docker-up.bat  docker-down.bat  docker-clean.bat
dev-start.sh  dev-stop.sh  docker-up.sh  docker-down.sh  docker-clean.sh   ← cho Linux/VPS
Makefile                 ← XÓA
```

Lý do chọn Node làm động cơ: dự án vốn đã bắt buộc có Node (Next.js chạy trên nó) → không thêm phụ thuộc mới, khác với việc bắt cài `make`. Logic nằm một chỗ duy nhất; `.bat` và `.sh` chỉ là hai cánh cửa vào cùng một phòng.

**Ranh giới phải ghi rõ trong tài liệu**: `stack.mjs` là công cụ cho **máy lập trình**. Deploy production (CI/CD giai đoạn 2) gọi thẳng `docker compose` qua SSH — VPS chỉ cần Docker, không cần Node.

## Chi tiết `dev-start`

Thứ tự thực hiện:

1. Thiếu `.env` → tự chép từ `.env.example`, in cảnh báo yêu cầu điền, tiếp tục
2. Tạo network `tutor-net` nếu chưa có
3. `docker compose -p tutor-infra ... up -d --wait` (chờ healthy, không chạy tiếp khi DB chưa sẵn sàng)
4. Chạy `migrate` (đã chốt: có)
5. Spawn Django: `uv run python manage.py runserver 8000` với env = `.env` đã đọc + **ép `POSTGRES_HOST=localhost`** + **ép `DJANGO_SETTINGS_MODULE=config.settings.dev`** → vá đúng lỗ hổng nêu ở mục Vấn đề
6. Spawn Next: `pnpm dev` trong `frontend/`
7. Log gộp, mỗi dòng có nhãn `[be]`/`[fe]` màu khác nhau
8. Ctrl+C → tắt cả hai tiến trình con (Windows dùng `taskkill /T /F` để giết cả cây tiến trình, tránh để lại `node.exe` ma); Postgres **vẫn chạy**

Kiểm tra trước khi chạy: cổng 5432/8000/3000 bận → báo rõ tên cổng và dừng, không để người dùng nhận lỗi khó hiểu.

## Chi tiết `docker-clean`

```
docker system df                     (in bảng TRƯỚC)
docker builder prune -f
docker image prune -f
docker volume prune -f               (KHÔNG có -a: chỉ xóa volume vô danh)
docker system df                     (in bảng SAU + tổng dung lượng giải phóng)
```

Script tự kiểm tra: sau khi chạy, volume `tutor-infra_pgdata` phải vẫn tồn tại — không còn thì báo lỗi to (đây là bất biến quan trọng nhất của lệnh này).

## Sửa quy tắc CLAUDE.md (đã được duyệt)

Thay quy tắc cũ *"Makefile KHÔNG có lệnh down/stop cho infra"* bằng:

> Được phép `stop` và `down` với tầng infra (xóa container dựng lại được). **CẤM VĨNH VIỄN** cờ `-v`/`--volumes` trong mọi lệnh docker — đó là ranh giới giữa "xóa container" và "mất dữ liệu". Hook `guard-bash.sh` đã chặn cứng (người dùng tự sửa 05/08/2026, đã kiểm thử 6 ca).

## Definition of Done (chạy thật, không nhận báo cáo suông)

1. `dev-start` → `curl localhost:8000/api/healthz` trả `{"status":"ok"}`; `curl localhost:3000` trả 200; sửa một file frontend thấy hot-reload; log có nhãn `[be]`/`[fe]`
2. Ctrl+C → không còn tiến trình `python`/`node` của dự án; container Postgres vẫn chạy
3. `dev-stop` → container Postgres `Exited`; volume vẫn còn
4. `docker-up` → `curl localhost` trả 200, `curl localhost/api/healthz` trả ok
5. `docker-down` → `docker ps -a` không còn container dự án; `docker volume ls` **vẫn còn** `tutor-infra_pgdata`
6. `dev-start` lại sau `docker-down` → DB vẫn còn dữ liệu cũ (chứng minh volume sống sót)
7. `docker-clean` → in bảng trước/sau, giải phóng ≥ 10 GB (build cache 15.75 GB đang có), `tutor-infra_pgdata` còn nguyên
8. `pnpm test && pnpm lint && pnpm format:check && pnpm build` sạch; CI xanh

## Không làm

- **Celery worker trong `dev-start`**: broker `memory://` không dùng liên tiến trình được — bật lên chỉ tốn RAM và tạo ảo giác. Thêm cùng Redis ở tính năng job nền đầu tiên.
- Root `package.json` / `pnpm dev-start`: đã cân nhắc, bỏ vì gây cảnh báo workspace root cho Next.js.
- Lệnh deploy VPS: thuộc CI/CD giai đoạn 2, dùng docker compose thuần.
