# TASKS — Flibby

Backlog theo dõi công việc. Quy ước: `[ ]` chưa làm, `[x]` xong, `[~]` đang làm. Mỗi mục ghi rõ ai làm (USER / AGENT / CẢ HAI). Việc từ tài liệu nháp chỉ là ứng viên — phải được người dùng chốt trước khi thực hiện.

## Quyết định đang chờ người dùng chốt

- [ ] **Tên dự án/thương hiệu**: "Flibby" chưa ưng — người dùng nghiên cứu thêm rồi chốt sau. Trong lúc chờ: code/infra dùng tên trung tính `tutor-agent` (USER)
- [ ] **Mục tiêu lịch beta**: hạn 15/08/2026 (lưới pháp lý 1) còn 11 ngày — phi thực tế từ repo trống. Lưới 2: đưa vào hoạt động trước 15/02/2027 → hạn nghĩa vụ 01/03/2027. Cần chốt mốc mới để kế hoạch bám theo. (USER)
- [ ] Khối lớp cụ thể cho use case đầu (tài liệu gợi ý lớp 8) (USER)

## Việc phi-code (từ báo cáo §18 — ứng viên, chưa chốt)

- [ ] Tra cứu nhãn hiệu tên thương hiệu tại Cục SHTT nhóm 41 và 9 — CHỜ chốt tên mới (nhật ký tra cứu Flibby cũ ở docs/background/nhat-ky-hoi-thoai-du-an-flibby.md mục 7 dùng làm tham chiếu quy trình) (USER)
- [ ] Lập danh sách 30-50 phụ huynh tiềm năng cho beta → lưu trong `private/`, KHÔNG commit (USER)
- [ ] Tìm giáo viên Toán quen kiểm chứng skill graph (USER)

## Việc kỹ thuật (ứng viên từ tài liệu nháp — làm sau khi nghiên cứu lại và chốt từng phần)

- [ ] Thiết kế accountability layer trên giấy (CẢ HAI)
- [ ] Skill graph Toán phạm vi một kỳ thi từ yêu cầu cần đạt GDPT 2018 (CẢ HAI)
- [ ] Pipeline sinh item + SymPy verification, thử 50 item, đo tỷ lệ lỗi (AGENT, sau khi có spec được duyệt)
- [ ] Parser đề cũ PDF-to-Markdown với 3-5 đề giữa kỳ (AGENT, sau khi có spec được duyệt)
- [ ] Prototype goal intake + report mẫu cho 5 phụ huynh xem (CẢ HAI)

## Hạ tầng repo (stack đã chốt — làm theo thứ tự khi bắt đầu code)

- [x] 04/08/2026 — Scaffold monorepo theo stack đã chốt: `frontend/` (Next.js) + `backend/` (Django + django-ninja + Celery) + `deploy/` (compose 2 tầng infra/app + Makefile) (AGENT, có spec duyệt trước)
- [x] 04/08/2026 — Toolchain: uv + ruff + pytest (backend); pnpm + eslint + prettier + vitest (frontend); pre-commit (AGENT)
- [x] 04/08/2026 — CI GitHub Actions giai đoạn 1: lint + test + `makemigrations --check` + codegen check + build image — ngay khi có code đầu tiên (AGENT)
- [x] 04/08/2026 — `.env.example` — khi có service cần env (AGENT)
- [ ] PostToolUse auto-lint hook + Stop hook chạy test — khi có linter/test thật (AGENT)
- [ ] Branch protection cho `main` trên GitHub + cài `gh` CLI — trước PR đầu tiên (USER + AGENT)
- [ ] CI/CD giai đoạn 2 (khi deploy VPS lần đầu): GHCR + staging auto + production approve tay; pgBackRest backup ra R2 + cron test restore; healthz + UptimeRobot + healthchecks.io cho Celery beat (AGENT)
- [ ] Hardening prod settings: fail-fast khi thiếu `DJANGO_SECRET_KEY`/`POSTGRES_PASSWORD` (kèm build-arg dummy cho `collectstatic` trong Dockerfile) — finding đã park từ review scaffold Task 1 (AGENT)
- [ ] CI/CD giai đoạn 3 (khi có người dùng trả tiền): zero-downtime deploy, Dependabot, pip-audit/npm audit, Trivy (AGENT)
- [ ] Cài DeepEval + promptfoo + mutmut và dựng pipeline eval nightly — khi có tính năng LLM thật đầu tiên (AGENT)

## Đã xong

- [x] 04/08/2026 — Bộ khung vận hành: CLAUDE.md (Karpathy + phân công architect/subagent + memory + hành xử chuyên nghiệp), memory/, docs/ + index, hooks cưỡng chế, code-reviewer agent, git + GitHub (đã chuyển private)
- [x] 04/08/2026 — **Chốt tech stack** sau 4 vòng phản biện: Next.js + Django/django-ninja + Celery + Postgres/pgvector + SSE + Nginx + Docker Compose 2 tầng trên VPS + R2 + CI/CD 3 giai đoạn (docs/research/nghien-cuu-tech-stack.md)
- [x] 04/08/2026 — **Chốt chiến lược test**: pytest/Vitest/Playwright-chromium + 9 quy tắc (mock LLM trong CI, Postgres thật, SymPy ground-truth, chống test giả, eval tách nightly) — CLAUDE.md mục Chiến lược test; checklist code-reviewer đã cập nhật
- [x] 04/08/2026 — **Scaffold monorepo thực thi xong**: 7 task theo `docs/plans/2026-08-04-scaffold-monorepo-plan.md` — backend Django/django-ninja/Celery, frontend Next.js, deploy compose 2 tầng + Nginx, Makefile/env/pre-commit, CI GitHub Actions, verify E2E trên Docker (4/4 tiêu chí DoD PASS) — bằng chứng: `.superpowers/sdd/2026-08-04-scaffold-monorepo-plan/task-7-report.md`
