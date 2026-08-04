# Scaffold Monorepo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Dựng khung monorepo rỗng chạy được: Next.js + Django/django-ninja + Celery + Postgres/pgvector + Nginx, Docker Compose 2 tầng, CI GitHub Actions — đúng spec `docs/specs/2026-08-04-scaffold-monorepo.md`.

**Architecture:** Compose 2 tầng (infra chứa Postgres — CI không đụng; app chứa nginx/frontend/backend/celery). Backend Django ASGI (uvicorn) + whitenoise cho static, API-first qua django-ninja. Frontend Next.js standalone output. Không logic nghiệp vụ.

**Tech Stack:** Python 3.12, Django 5.2 LTS, django-ninja 1.x, Celery 5.x, uv, ruff, pytest; Node 22, Next.js 15, pnpm, Vitest, RTL; pgvector/pgvector:pg16; nginx:1.27-alpine.

## Global Constraints

- Tên trung tính mọi nơi: `tutor-agent`, compose project `tutor-infra`/`tutor-app`, network `tutor-net` — KHÔNG dùng "Flibby"
- Python `>=3.12,<3.13`; Django `>=5.2,<5.3`; Node 22; Next 15; image Postgres pin `pgvector/pgvector:pg16`
- Không secret thật trong repo; mọi config qua env; `.env` đã gitignore
- Makefile KHÔNG có lệnh down/stop cho infra
- Test theo CLAUDE.md: assert giá trị cụ thể; Postgres thật trong CI; không gọi HTTP/LLM thật
- Commit mỗi task xong (Conventional Commits); làm trực tiếp trên `main` (repo chưa có code chạy — lần cuối được phép; sau scaffold là bắt buộc nhánh feature)
- Máy dev là Windows: chạy lệnh trong Git Bash (Bash tool); đường dẫn dùng `/`

---

### Task 0: Kiểm tra công cụ máy dev

**Files:** không tạo file.

- [ ] **Step 1: Kiểm tra toolchain**

Run: `uv --version; node --version; corepack --version; docker --version`
Expected: uv >= 0.5, node v22.x (v20 chấp nhận được cho dev), corepack có, docker có.

- [ ] **Step 2: Bật pnpm qua corepack**

Run: `corepack enable pnpm; pnpm --version`
Expected: pnpm 9.x hoặc 10.x

**Nếu thiếu bất kỳ tool nào: DỪNG, báo lại — người dùng quyết định cài (không tự cài phần mềm hệ thống).**

---

### Task 1: Backend Django skeleton + healthz (TDD)

**Files:**
- Create: `backend/pyproject.toml`, `backend/.python-version`, `backend/pytest.ini`, `backend/manage.py`, `backend/config/__init__.py`, `backend/config/settings/__init__.py`, `backend/config/settings/base.py`, `backend/config/settings/dev.py`, `backend/config/settings/prod.py`, `backend/config/urls.py`, `backend/config/api.py`, `backend/config/asgi.py`, `backend/config/wsgi.py`, `backend/apps/__init__.py`, `backend/apps/core/__init__.py`, `backend/apps/core/apps.py`, `backend/apps/core/tests/__init__.py`
- Test: `backend/apps/core/tests/test_healthz.py`

**Interfaces:**
- Produces: endpoint `GET /api/healthz` → `200 {"status": "ok"}`; module `config.settings.{dev,prod}`; app Django `apps.core`. Task 2 sẽ thêm `config/celery.py` và sửa `config/__init__.py`.

- [ ] **Step 1: Tạo project files (chưa có api.py, urls.py chỉ có admin)**

`backend/pyproject.toml`:

```toml
[project]
name = "backend"
version = "0.1.0"
requires-python = ">=3.12,<3.13"
dependencies = [
    "django>=5.2,<5.3",
    "django-ninja>=1.3",
    "celery>=5.4",
    "psycopg[binary]>=3.2",
    "uvicorn[standard]>=0.30",
    "whitenoise>=6.7",
]

[dependency-groups]
dev = [
    "pytest>=8.3",
    "pytest-django>=4.9",
    "factory-boy>=3.3",
    "ruff>=0.8",
    "respx>=0.21",
]

[tool.uv]
package = false

[tool.ruff]
line-length = 100
target-version = "py312"

[tool.ruff.lint]
select = ["E", "F", "I", "B", "DJ"]
```

`backend/.python-version`:

```text
3.12
```

`backend/pytest.ini`:

```ini
[pytest]
DJANGO_SETTINGS_MODULE = config.settings.dev
addopts = --reuse-db
python_files = test_*.py
```

`backend/manage.py`:

```python
#!/usr/bin/env python
import os
import sys


def main():
    os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")
    from django.core.management import execute_from_command_line

    execute_from_command_line(sys.argv)


if __name__ == "__main__":
    main()
```

`backend/config/__init__.py`: (file rỗng — Task 2 sẽ thêm import celery)

`backend/config/settings/__init__.py`: file rỗng.

`backend/config/settings/base.py`:

```python
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = os.environ.get("DJANGO_SECRET_KEY", "dev-only-insecure-key")
DEBUG = False
ALLOWED_HOSTS = os.environ.get("DJANGO_ALLOWED_HOSTS", "localhost").split(",")
CSRF_TRUSTED_ORIGINS = [
    o for o in os.environ.get("DJANGO_CSRF_TRUSTED_ORIGINS", "http://localhost").split(",") if o
]

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "apps.core",
]

MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"

TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

ASGI_APPLICATION = "config.asgi.application"
WSGI_APPLICATION = "config.wsgi.application"

DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("POSTGRES_DB", "tutor"),
        "USER": os.environ.get("POSTGRES_USER", "tutor"),
        "PASSWORD": os.environ.get("POSTGRES_PASSWORD", "tutor"),
        "HOST": os.environ.get("POSTGRES_HOST", "localhost"),
        "PORT": os.environ.get("POSTGRES_PORT", "5432"),
    }
}

AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

LANGUAGE_CODE = "vi"
TIME_ZONE = "Asia/Ho_Chi_Minh"
USE_I18N = True
USE_TZ = True

STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "whitenoise.storage.CompressedManifestStaticFilesStorage"},
}

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

CELERY_BROKER_URL = os.environ.get("CELERY_BROKER_URL", "memory://")
CELERY_RESULT_BACKEND = "cache+memory://"
```

`backend/config/settings/dev.py`:

```python
from .base import *  # noqa: F403

DEBUG = True
ALLOWED_HOSTS = ["*"]
STORAGES = {
    "default": {"BACKEND": "django.core.files.storage.FileSystemStorage"},
    "staticfiles": {"BACKEND": "django.contrib.staticfiles.storage.StaticFilesStorage"},
}
```

`backend/config/settings/prod.py`:

```python
from .base import *  # noqa: F403

DEBUG = False
```

`backend/config/urls.py` (bước này CHƯA có api — để test healthz fail đúng lý do):

```python
from django.contrib import admin
from django.urls import path

urlpatterns = [
    path("admin/", admin.site.urls),
]
```

`backend/config/asgi.py`:

```python
import os

from django.core.asgi import get_asgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.prod")

application = get_asgi_application()
```

`backend/config/wsgi.py`:

```python
import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.prod")

application = get_wsgi_application()
```

`backend/apps/__init__.py`: file rỗng.
`backend/apps/core/__init__.py`: file rỗng.
`backend/apps/core/tests/__init__.py`: file rỗng.

`backend/apps/core/apps.py`:

```python
from django.apps import AppConfig


class CoreConfig(AppConfig):
    name = "apps.core"
```

- [ ] **Step 2: Cài dependency, tạo lockfile**

Run: `cd backend && uv sync`
Expected: tạo `backend/uv.lock` + `.venv`, không lỗi.

- [ ] **Step 3: Viết failing test healthz**

`backend/apps/core/tests/test_healthz.py`:

```python
from django.test import Client


def test_healthz_returns_ok():
    client = Client()
    response = client.get("/api/healthz")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}
```

- [ ] **Step 4: Chạy test, xác nhận fail đúng lý do**

Run: `cd backend && uv run pytest apps/core/tests/test_healthz.py -v`
Expected: FAIL — `assert 404 == 200` (route /api/ chưa tồn tại). Nếu fail vì lý do khác (import error, DB error) → sửa trước khi đi tiếp. Test này không đụng DB nên không cần Postgres chạy.

- [ ] **Step 5: Implement api.py + nối vào urls**

`backend/config/api.py`:

```python
from ninja import NinjaAPI

api = NinjaAPI(title="tutor-agent API", version="0.1.0")


@api.get("/healthz")
def healthz(request):
    return {"status": "ok"}
```

Sửa `backend/config/urls.py` thành:

```python
from django.contrib import admin
from django.urls import path

from config.api import api

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/", api.urls),
]
```

- [ ] **Step 6: Chạy test, xác nhận pass**

Run: `cd backend && uv run pytest apps/core/tests/test_healthz.py -v`
Expected: PASS (1 passed).

- [ ] **Step 7: Lint sạch**

Run: `cd backend && uv run ruff check . && uv run ruff format .`
Expected: không lỗi (ruff format tự sửa format lần đầu).

- [ ] **Step 8: Commit**

```bash
git add backend/
git commit -m "feat: scaffold Django backend with ninja healthz endpoint"
```

---

### Task 2: Celery app + task ping (TDD)

**Files:**
- Create: `backend/config/celery.py`
- Modify: `backend/config/__init__.py`
- Test: `backend/apps/core/tests/test_celery_ping.py`

**Interfaces:**
- Consumes: `config.settings.dev` (Task 1); settings đã có `CELERY_BROKER_URL`/`CELERY_RESULT_BACKEND`.
- Produces: Celery app `config.celery:app`; task tên `core.ping` trả `"pong"`. Docker (Task 4) chạy worker bằng `celery -A config worker`.

- [ ] **Step 1: Viết failing test**

`backend/apps/core/tests/test_celery_ping.py`:

```python
from config.celery import ping


def test_ping_task_returns_pong():
    result = ping.apply()
    assert result.successful()
    assert result.get() == "pong"
```

- [ ] **Step 2: Chạy test, xác nhận fail đúng lý do**

Run: `cd backend && uv run pytest apps/core/tests/test_celery_ping.py -v`
Expected: FAIL — `ModuleNotFoundError: No module named 'config.celery'` (hoặc ImportError khi collect).

- [ ] **Step 3: Implement celery app**

`backend/config/celery.py`:

```python
import os

from celery import Celery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings.dev")

app = Celery("tutor_agent")
app.config_from_object("django.conf:settings", namespace="CELERY")
app.autodiscover_tasks()


@app.task(name="core.ping")
def ping():
    return "pong"
```

Sửa `backend/config/__init__.py` thành:

```python
from .celery import app as celery_app

__all__ = ["celery_app"]
```

- [ ] **Step 4: Chạy toàn bộ test backend, xác nhận pass**

Run: `cd backend && uv run pytest -v`
Expected: 2 passed (healthz + ping). `ping.apply()` chạy đồng bộ local — hợp lệ cho scaffold; test worker thật để khi có Redis.

- [ ] **Step 5: Lint + commit**

Run: `cd backend && uv run ruff check . && uv run ruff format .`

```bash
git add backend/
git commit -m "feat: add Celery app with ping task"
```

---

### Task 3: Frontend Next.js skeleton + Health component (TDD)

**Files:**
- Create: `frontend/package.json`, `frontend/tsconfig.json`, `frontend/next.config.ts`, `frontend/eslint.config.mjs`, `frontend/.prettierrc.json`, `frontend/.prettierignore`, `frontend/vitest.config.ts`, `frontend/vitest.setup.ts`, `frontend/src/app/layout.tsx`, `frontend/src/app/page.tsx`, `frontend/src/lib/api/README.md`, `frontend/public/.gitkeep`
- Test: `frontend/src/components/Health.test.tsx`, sau đó `frontend/src/components/Health.tsx`

**Interfaces:**
- Produces: component `Health({ status: string })` render `data-testid="health-status"` với text `API: {status}`; Next.js `output: "standalone"` (Task 4 Dockerfile dựa vào). Không gọi API thật (API-first client sinh sau, xem README trong src/lib/api).

- [ ] **Step 1: Tạo config files**

`frontend/package.json`:

```json
{
  "name": "frontend",
  "version": "0.1.0",
  "private": true,
  "packageManager": "pnpm@9.15.4",
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "test": "vitest run"
  },
  "dependencies": {
    "next": "^15.1.6",
    "react": "^19.0.0",
    "react-dom": "^19.0.0"
  },
  "devDependencies": {
    "@eslint/eslintrc": "^3.2.0",
    "@testing-library/jest-dom": "^6.6.3",
    "@testing-library/react": "^16.1.0",
    "@types/node": "^22.10.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "@vitejs/plugin-react": "^4.3.4",
    "eslint": "^9.17.0",
    "eslint-config-next": "^15.1.6",
    "jsdom": "^25.0.1",
    "prettier": "^3.4.2",
    "typescript": "^5.7.2",
    "vitest": "^2.1.8"
  }
}
```

`frontend/tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

`frontend/next.config.ts`:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
};

export default nextConfig;
```

`frontend/eslint.config.mjs`:

```js
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({ baseDirectory: __dirname });

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  { ignores: [".next/**", "node_modules/**"] },
];

export default eslintConfig;
```

`frontend/.prettierrc.json`:

```json
{ "semi": true, "singleQuote": false, "printWidth": 100 }
```

`frontend/.prettierignore`:

```text
.next
node_modules
pnpm-lock.yaml
```

`frontend/vitest.config.ts`:

```ts
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
```

`frontend/vitest.setup.ts`:

```ts
import "@testing-library/jest-dom/vitest";
```

`frontend/src/app/layout.tsx`:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "tutor-agent",
  description: "Nền tảng gia sư AI parent-first",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body>{children}</body>
    </html>
  );
}
```

`frontend/src/app/page.tsx`:

```tsx
import { Health } from "@/components/Health";

export default function Home() {
  return (
    <main>
      <h1>tutor-agent</h1>
      <p>Khung dự án đã chạy.</p>
      <Health status="unknown" />
    </main>
  );
}
```

`frontend/src/lib/api/README.md`:

```markdown
# API client

Chỗ dành cho TypeScript client sinh tự động từ OpenAPI schema của django-ninja
(quy tắc API-first trong CLAUDE.md). Pipeline codegen sẽ được thêm khi backend
có endpoint thật đầu tiên ngoài healthz. KHÔNG viết client tay ở đây.
```

`frontend/public/.gitkeep`: file rỗng.

- [ ] **Step 2: Cài dependency**

Run: `cd frontend && corepack enable pnpm && pnpm install`
Expected: tạo `pnpm-lock.yaml`, không lỗi.

- [ ] **Step 3: Viết failing test cho Health**

`frontend/src/components/Health.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import { Health } from "./Health";

test("hiển thị trạng thái API được truyền vào", () => {
  render(<Health status="ok" />);
  expect(screen.getByTestId("health-status")).toHaveTextContent("API: ok");
});
```

- [ ] **Step 4: Chạy test, xác nhận fail đúng lý do**

Run: `cd frontend && pnpm test`
Expected: FAIL — `Failed to resolve import "./Health"` (component chưa tồn tại).

- [ ] **Step 5: Implement Health component**

`frontend/src/components/Health.tsx`:

```tsx
export function Health({ status }: { status: string }) {
  return <p data-testid="health-status">API: {status}</p>;
}
```

- [ ] **Step 6: Chạy test + lint + build, xác nhận pass**

Run: `cd frontend && pnpm test && pnpm lint && pnpm format:check && pnpm build`
Expected: test 1 passed; lint sạch; format sạch (nếu format lệch chạy `pnpm format` rồi check lại); build thành công tạo `.next/standalone`.

- [ ] **Step 7: Commit**

```bash
git add frontend/
git commit -m "feat: scaffold Next.js frontend with Health component"
```

---

### Task 4: Docker — Dockerfiles, compose 2 tầng, nginx

**Files:**
- Create: `deploy/backend.Dockerfile`, `deploy/frontend.Dockerfile`, `backend/.dockerignore`, `frontend/.dockerignore`, `deploy/infra/docker-compose.yml`, `deploy/app/docker-compose.yml`, `deploy/nginx/default.conf`

**Interfaces:**
- Consumes: backend uvicorn ASGI `config.asgi:application` (Task 1), celery app `config` (Task 2), frontend standalone build (Task 3).
- Produces: network external `tutor-net`; service names `postgres`, `backend`, `frontend`, `nginx`, `celery-worker`; cổng public duy nhất `80` (nginx). Makefile (Task 5) gọi 2 compose file này với project `tutor-infra`/`tutor-app`.

- [ ] **Step 1: Tạo Dockerfiles + dockerignore**

`deploy/backend.Dockerfile`:

```dockerfile
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
WORKDIR /app
ENV UV_COMPILE_BYTECODE=1 UV_LINK_MODE=copy PYTHONUNBUFFERED=1
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev
COPY . .
ENV PATH="/app/.venv/bin:$PATH"
RUN DJANGO_SETTINGS_MODULE=config.settings.prod python manage.py collectstatic --noinput
RUN useradd -m appuser && chown -R appuser /app
USER appuser
EXPOSE 8000
CMD ["sh", "-c", "python manage.py migrate --noinput && exec uvicorn config.asgi:application --host 0.0.0.0 --port 8000 --workers 2"]
```

`backend/.dockerignore`:

```text
.venv
__pycache__
*.pyc
.pytest_cache
staticfiles
```

`deploy/frontend.Dockerfile`:

```dockerfile
FROM node:22-alpine AS deps
RUN corepack enable pnpm
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

FROM node:22-alpine AS build
RUN corepack enable pnpm
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

FROM node:22-alpine AS run
WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
USER node
EXPOSE 3000
CMD ["node", "server.js"]
```

`frontend/.dockerignore`:

```text
node_modules
.next
```

- [ ] **Step 2: Compose infra**

`deploy/infra/docker-compose.yml`:

```yaml
services:
  postgres:
    image: pgvector/pgvector:pg16
    restart: unless-stopped
    environment:
      POSTGRES_DB: ${POSTGRES_DB:-tutor}
      POSTGRES_USER: ${POSTGRES_USER:-tutor}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD:?POSTGRES_PASSWORD must be set in .env}
    ports:
      - "127.0.0.1:5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${POSTGRES_USER:-tutor} -d ${POSTGRES_DB:-tutor}"]
      interval: 5s
      timeout: 3s
      retries: 10
    networks:
      - tutor-net

volumes:
  pgdata:

networks:
  tutor-net:
    external: true
```

- [ ] **Step 3: Compose app**

`deploy/app/docker-compose.yml`:

```yaml
services:
  backend:
    build:
      context: ../../backend
      dockerfile: ../deploy/backend.Dockerfile
    restart: unless-stopped
    env_file: ../../.env
    networks:
      - tutor-net

  celery-worker:
    build:
      context: ../../backend
      dockerfile: ../deploy/backend.Dockerfile
    restart: unless-stopped
    command: celery -A config worker --loglevel=info
    env_file: ../../.env
    networks:
      - tutor-net

  frontend:
    build:
      context: ../../frontend
      dockerfile: ../deploy/frontend.Dockerfile
    restart: unless-stopped
    networks:
      - tutor-net

  nginx:
    image: nginx:1.27-alpine
    restart: unless-stopped
    ports:
      - "80:80"
    volumes:
      - ../nginx/default.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on:
      - backend
      - frontend
    networks:
      - tutor-net

networks:
  tutor-net:
    external: true
```

- [ ] **Step 4: Nginx config**

`deploy/nginx/default.conf`:

```nginx
server {
    listen 80;
    client_max_body_size 20m;

    location /api/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
        proxy_read_timeout 3600s;
    }

    location /admin/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        proxy_pass http://backend:8000;
        proxy_set_header Host $host;
    }

    location / {
        proxy_pass http://frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

- [ ] **Step 5: Build thử 2 image**

Run (từ gốc repo): `docker build -f deploy/backend.Dockerfile backend && docker build -f deploy/frontend.Dockerfile frontend`
Expected: cả hai build thành công.

- [ ] **Step 6: Commit**

```bash
git add deploy/ backend/.dockerignore frontend/.dockerignore
git commit -m "feat: add two-tier docker compose, dockerfiles and nginx config"
```

---

### Task 5: Makefile + .env.example + .gitignore + pre-commit

**Files:**
- Create: `Makefile`, `.env.example`, `.pre-commit-config.yaml`
- Modify: `.gitignore`

**Interfaces:**
- Consumes: compose files Task 4.
- Produces: `make up|deploy|down-app|logs|test|lint`. CI (Task 6) không dùng Makefile (chạy lệnh trực tiếp) nhưng dev/VPS dùng.

- [ ] **Step 1: Makefile (LƯU Ý: thụt đầu dòng bằng TAB, không phải space)**

`Makefile`:

```makefile
COMPOSE_INFRA = docker compose -p tutor-infra -f deploy/infra/docker-compose.yml --env-file .env
COMPOSE_APP   = docker compose -p tutor-app -f deploy/app/docker-compose.yml --env-file .env

.PHONY: up network deploy down-app logs test lint

network:
	-docker network create tutor-net

up: network
	$(COMPOSE_INFRA) up -d --wait
	$(COMPOSE_APP) up -d --build

deploy:
	$(COMPOSE_APP) pull
	$(COMPOSE_APP) up -d

down-app:
	$(COMPOSE_APP) down

logs:
	$(COMPOSE_APP) logs -f --tail=100

test:
	cd backend && uv run pytest
	cd frontend && pnpm test

lint:
	cd backend && uv run ruff check . && uv run ruff format --check .
	cd frontend && pnpm lint && pnpm format:check
```

(Không có lệnh down/stop cho infra — cố ý, theo CLAUDE.md.)

- [ ] **Step 2: .env.example**

`.env.example`:

```text
# Postgres (compose infra + Django)
POSTGRES_DB=tutor
POSTGRES_USER=tutor
POSTGRES_PASSWORD=change-me-in-production
POSTGRES_HOST=postgres
POSTGRES_PORT=5432

# Django
DJANGO_SECRET_KEY=change-me-generate-a-real-one
DJANGO_SETTINGS_MODULE=config.settings.prod
DJANGO_ALLOWED_HOSTS=localhost
DJANGO_CSRF_TRUSTED_ORIGINS=http://localhost

# Celery (Redis chưa dùng — thêm khi có job thật)
CELERY_BROKER_URL=memory://

# Monitoring (chưa nối — placeholder)
# SENTRY_DSN=
# POSTHOG_KEY=
```

- [ ] **Step 3: Bổ sung .gitignore**

Thêm vào cuối `.gitignore` hiện có:

```text
# Python
backend/.venv/
__pycache__/
*.pyc
.pytest_cache/
backend/staticfiles/

# Node
frontend/node_modules/
frontend/.next/
```

- [ ] **Step 4: pre-commit**

`.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/astral-sh/ruff-pre-commit
    rev: v0.8.4
    hooks:
      - id: ruff
        args: [--fix]
        files: ^backend/
      - id: ruff-format
        files: ^backend/
  - repo: local
    hooks:
      - id: prettier-check
        name: prettier check (frontend)
        entry: bash -c 'cd frontend && pnpm format:check'
        language: system
        files: ^frontend/
        pass_filenames: false
```

- [ ] **Step 5: Tạo .env local từ example + verify make (nếu máy có make)**

Run: `cp .env.example .env` rồi `make lint` (nếu `make --version` không có trên Windows: chạy trực tiếp 2 lệnh lint trong Makefile và ghi chú lại — trên VPS/CI luôn có make).
Expected: lint sạch cả hai bên.

- [ ] **Step 6: Commit**

```bash
git add Makefile .env.example .pre-commit-config.yaml .gitignore
git commit -m "feat: add makefile, env template and pre-commit config"
```

---

### Task 6: CI GitHub Actions

**Files:**
- Create: `.github/workflows/ci.yml`

**Interfaces:**
- Consumes: cấu trúc backend/frontend + Dockerfiles các task trước.
- Produces: 3 job `backend`, `frontend`, `docker` chạy trên push main + mọi PR.

- [ ] **Step 1: Workflow**

`.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: backend
    services:
      postgres:
        image: pgvector/pgvector:pg16
        env:
          POSTGRES_DB: tutor
          POSTGRES_USER: tutor
          POSTGRES_PASSWORD: tutor
        ports:
          - 5432:5432
        options: >-
          --health-cmd "pg_isready -U tutor -d tutor"
          --health-interval 5s
          --health-timeout 3s
          --health-retries 10
    env:
      POSTGRES_HOST: localhost
      DJANGO_SECRET_KEY: ci-only-secret
    steps:
      - uses: actions/checkout@v4
      - uses: astral-sh/setup-uv@v5
      - run: uv sync --frozen
      - run: uv run ruff check .
      - run: uv run ruff format --check .
      - run: uv run python manage.py makemigrations --check --dry-run
      - run: uv run pytest

  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: frontend
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: pnpm
          cache-dependency-path: frontend/pnpm-lock.yaml
      - run: pnpm install --frozen-lockfile
      - run: pnpm lint
      - run: pnpm format:check
      - run: pnpm test
      - run: pnpm build

  docker:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: docker build -f deploy/backend.Dockerfile backend
      - run: docker build -f deploy/frontend.Dockerfile frontend
```

- [ ] **Step 2: Commit + push, xác nhận CI xanh**

```bash
git add .github/
git commit -m "ci: add lint, test, migration-check and docker build pipeline"
git push
```

Expected: cả 3 job xanh trên GitHub Actions (xem tab Actions của repo). Nếu job nào đỏ: đọc log, sửa, commit `fix: ...` — KHÔNG bỏ qua.

---

### Task 7: Verify end-to-end trên Docker + cập nhật tài liệu

**Files:**
- Modify: `TASKS.md`, `docs/README.md` (trạng thái spec/plan), `README.md` (thêm hướng dẫn chạy)

**Interfaces:**
- Consumes: toàn bộ các task trước.

- [ ] **Step 1: Dựng cả cụm**

Run (từ gốc repo, đã có `.env` từ Task 5): `make up` (hoặc chạy 3 lệnh tương đương nếu không có make: `docker network create tutor-net`; `docker compose -p tutor-infra -f deploy/infra/docker-compose.yml --env-file .env up -d --wait`; `docker compose -p tutor-app -f deploy/app/docker-compose.yml --env-file .env up -d --build`)
Expected: mọi container Up; postgres healthy.

- [ ] **Step 2: Verify 4 tiêu chí DoD**

```bash
curl -s http://localhost/api/healthz
# Expected: {"status": "ok"}

curl -s -o /dev/null -w "%{http_code}" http://localhost/
# Expected: 200 (trang Next.js)

docker compose -p tutor-app -f deploy/app/docker-compose.yml --env-file .env exec backend sh -c "DJANGO_SUPERUSER_PASSWORD=admin-local-only python manage.py createsuperuser --noinput --username admin --email admin@example.com" 
# rồi mở http://localhost/admin đăng nhập admin/admin-local-only → vào được trang admin

docker compose -p tutor-app -f deploy/app/docker-compose.yml --env-file .env logs celery-worker | grep -E "core.ping|ready"
# Expected: log worker "ready" và danh sách task có [core.ping]
```

Tất cả output dán lại làm bằng chứng verify (quy tắc verification-before-completion).

- [ ] **Step 3: Cập nhật tài liệu**

- `TASKS.md`: tick task scaffold + toolchain + CI giai đoạn 1 sang Đã xong (kèm ngày)
- `docs/README.md`: spec + plan scaffold → trạng thái "đã thực thi"
- `README.md` gốc: thêm mục "Chạy dự án" (yêu cầu Docker + `.env` + `make up`; `make test`/`make lint`)

- [ ] **Step 4: Commit cuối + push**

```bash
git add TASKS.md docs/README.md README.md
git commit -m "docs: mark scaffold executed and add run instructions"
git push
```

---

## Self-review (đã chạy)

- Spec coverage: DoD 5 tiêu chí ↔ Task 1 (healthz+test), 3 (frontend+test), 4-5 (make up), 6 (CI), 7 (verify tổng); phạm vi "không làm" tôn trọng — không auth/Redis/R2/Playwright/codegen.
- Placeholder scan: không còn TBD/"tự thêm"; mọi file có nội dung đầy đủ.
- Type consistency: `config.celery:ping` (name `core.ping`) dùng nhất quán Task 2/4/7; `Health({status})` + testid `health-status` nhất quán Task 3; service name `backend/frontend/postgres/nginx/celery-worker` nhất quán Task 4/7; network `tutor-net` + project `tutor-infra`/`tutor-app` nhất quán Task 4/5/7.
- Điểm cần lưu ý khi thực thi: phiên bản pin trong package.json/pyproject là floor `^`/`>=` — lockfile sinh ra mới là chốt thật; nếu `uv sync`/`pnpm install` gặp lỗi tương thích phiên bản, được phép nâng patch/minor trong cùng major, ghi chú lại trong báo cáo task.
