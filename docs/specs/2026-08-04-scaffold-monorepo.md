# Spec: Scaffold monorepo

Ngày: 04/08/2026. Trạng thái: CHỜ DUYỆT. Căn cứ: tech stack + chiến lược test đã chốt (CLAUDE.md).

## Mục tiêu

Dựng khung xương rỗng chạy được của toàn hệ thống theo stack đã chốt. Không chứa bất kỳ logic nghiệp vụ nào.

## Definition of Done (kiểm chứng được)

1. `make up` từ máy sạch có Docker → toàn cụm chạy: trang Next.js hiển thị tại `http://localhost`, `GET /api/healthz` trả `{"status": "ok"}`, đăng nhập được Django Admin tại `/admin`, Celery worker chạy được task thử `ping`
2. `make test` → pytest xanh (test mẫu healthz qua ninja TestClient) + vitest xanh (test mẫu component)
3. `make lint` → ruff + eslint + prettier sạch
4. Push lên GitHub → workflow CI xanh toàn bộ
5. Không có secret/giá trị thật nào trong repo — tất cả qua `.env` (có `.env.example`)

## Phiên bản pin (lý do: ổn định + hỗ trợ dài hạn)

| Thành phần | Phiên bản | Ghi chú |
|---|---|---|
| Python | 3.12 | An toàn nhất cho hệ sinh thái (SymPy, Celery) |
| Django | 5.2 LTS | Hỗ trợ tới 2028; không đu 6.x mới |
| django-ninja | 1.x mới nhất | |
| Node | 22 LTS | |
| Next.js | 15.x | App Router, TypeScript |
| PostgreSQL | image `pgvector/pgvector:pg16` | Có sẵn extension vector, pin pg16 |
| Celery | 5.x | Broker tạm dùng DB/không cấu hình Redis (theo quy tắc hoãn Redis) — worker chạy được với broker `memory://` cho task thử; broker thật cấu hình khi có job thật |
| uv / pnpm | mới nhất | Package manager 2 bên |

## Cấu trúc

```
tutor-agent/
├── backend/
│   ├── pyproject.toml            # uv; deps: django, django-ninja, celery, psycopg[binary], gunicorn, uvicorn
│   │                             # dev: pytest, pytest-django, factory-boy, ruff, respx
│   ├── .python-version
│   ├── manage.py
│   ├── config/
│   │   ├── settings/base.py      # đọc env qua os.environ; session trong DB; static config
│   │   ├── settings/dev.py
│   │   ├── settings/prod.py
│   │   ├── urls.py               # /admin + /api (ninja)
│   │   ├── api.py                # NinjaAPI, router healthz
│   │   ├── celery.py             # app Celery + task ping
│   │   ├── asgi.py / wsgi.py
│   ├── apps/core/                # app Django đầu tiên (rỗng, chỗ đặt healthz + test)
│   │   └── tests/test_healthz.py # ninja TestClient: GET /api/healthz == 200, body đúng
│   └── pytest.ini                # addopts: --reuse-db; DJANGO_SETTINGS_MODULE=config.settings.dev
├── frontend/
│   ├── package.json              # next 15, react, typescript; dev: vitest, @testing-library/react, eslint, prettier
│   ├── next.config.ts            # output: standalone (cho Docker)
│   ├── src/app/page.tsx          # trang chủ tối giản (tên trung tính "tutor-agent")
│   ├── src/lib/api/              # chỗ dành cho TS client sinh từ OpenAPI (README ghi chú, chưa sinh)
│   ├── src/components/Health.tsx + Health.test.tsx   # component mẫu + vitest test
│   └── vitest.config.ts, .eslintrc, .prettierrc
├── deploy/
│   ├── infra/docker-compose.yml  # postgres (pgvector:pg16), volume pgdata, healthcheck, network tutor-net external
│   ├── app/docker-compose.yml    # nginx, frontend, backend (gunicorn+uvicorn ASGI), celery-worker; network tutor-net external
│   ├── nginx/default.conf        # / → frontend; /api,/admin,/static → backend; SSE-ready (proxy_buffering off cho /api/stream/); client_max_body_size 20m
│   ├── backend.Dockerfile        # multi-stage, uv, non-root user
│   └── frontend.Dockerfile       # multi-stage, standalone output, non-root user
├── Makefile                      # up / down-app / deploy / test / lint / logs (KHÔNG có lệnh down infra)
├── .env.example                  # POSTGRES_*, DJANGO_SECRET_KEY, DJANGO_SETTINGS_MODULE, ALLOWED_HOSTS...
├── .pre-commit-config.yaml       # ruff + ruff-format (backend), prettier (frontend)
├── .github/workflows/ci.yml     # 3 job: backend (postgres service container, ruff + pytest + makemigrations --check),
│                                 # frontend (eslint + prettier check + vitest + next build), docker (build 2 image, không push)
└── .gitignore                    # bổ sung: node_modules, .next, .venv, __pycache__, *.pyc, .pytest_cache
```

## Quy tắc kiến trúc áp vào scaffold (từ CLAUDE.md)

- Stateless: session trong DB, không volume nào gắn vào app container ngoài static build
- Compose 2 tầng: CI chỉ biết `deploy/app/`; Makefile không có lệnh down infra; postgres pin version
- API-first: healthz nằm ở Django/ninja, frontend gọi API (không logic trong Next.js)
- Test: Postgres thật trong CI (service container); test mẫu có assert giá trị cụ thể
- Tên trung tính `tutor-agent` mọi nơi (project compose: `tutor-infra`/`tutor-app`, network `tutor-net`) — không dùng "Flibby"

## KHÔNG nằm trong scaffold (chống phình scope)

Auth models/consent tables; business logic bất kỳ; Redis; R2 wiring; Sentry/PostHog (chỉ để chỗ env var); Playwright suite (thêm khi có user flow thật đầu tiên); DeepEval/promptfoo/mutmut; CD lên VPS (giai đoạn 2); OpenAPI codegen pipeline (thêm khi có endpoint thật đầu tiên ngoài healthz).

## Cách thực thi

1. Kiến trúc sư (session chính) viết spec này — bạn duyệt
2. Giao subagent Sonnet dựng theo spec (việc tay chân nhiều file, đề bài tự đủ)
3. Session chính review diff + chạy verify: `make test`, `make lint`, build Docker nếu máy có Docker; CI xanh trên GitHub là bằng chứng cuối
4. Commit theo mốc: một commit `feat: scaffold monorepo per approved spec`

## Ghi chú TDD

Scaffold là hạ tầng/config, không phải logic — gate "test đỏ trước" không áp theo nghĩa đen; thay bằng Definition of Done kiểm chứng được ở trên. Test mẫu (healthz, component) chính là nền để mọi feature sau đi theo TDD thật.
