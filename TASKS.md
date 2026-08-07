# TASKS — Rangi (tutor-agent)

Backlog theo dõi công việc. Quy ước: `[ ]` chưa làm, `[x]` xong, `[~]` đang làm. Mỗi mục ghi rõ ai làm (USER / AGENT / CẢ HAI). Việc từ tài liệu nháp chỉ là ứng viên — phải được người dùng chốt trước khi thực hiện.

## Quyết định đang chờ người dùng chốt

- [x] 06/08/2026 — ~~Xem xét hướng "logo mềm" cho wordmark~~ **ĐÓNG: LOẠI** — đã prototype wordmark mềm vẽ tay thuần SVG đến nơi đến chốn, người dùng so với mẫu và quyết GIỮ logo chính thức (RANG in hoa + chữ i đốm sáng); motif đường bay dưới logo cũng loại. Hàm vẽ giữ làm tư liệu tại `frontend/scripts/brand/proto-v2/assemble.mjs`
- [x] 07/08/2026 — **Mascot v2 CHỐT** sau 5 vòng render-và-duyệt: cánh giọt nước rủ xuống dùng chung một hình cho cả hai cặp, gọt mép trong theo thân bằng dao nhòe, glow hai lớp qua blur, khe đầu–thân và râu–đầu thu hẹp, pose `resting` mờ và cụp cánh thật sự. Kèm sửa lỗi tiềm ẩn: `calc()`+`var()` không chạy ngoài trình duyệt nên mọi opacity theo `--rangi-glow` giờ ghi kèm số tĩnh. Thông số nằm trong hằng số đầu `frontend/scripts/brand/proto-v2/assemble.mjs`; lý do + bài học trong docs/research/danh-gia-tham-my-mascot-icon-2026-08-05.md
- [x] 07/08/2026 — **Tinh chỉnh icon v2 ĐÓNG: thay cả phương pháp** — thay vì sửa từng lỗi hình học (chữ ✗ mất trong `incorrect` filled, ẩn dụ lệch của `spark`, `learner-profile` cắt cằm, `learning-evidence` tràn mép), bỏ hẳn 42 icon tự vẽ, sinh 220 file (127 outline + 93 filled) từ Tabler Icons 1.2.38 (MIT) bằng `pnpm brand:icons` + `scripts/brand/icon-manifest.mjs`. Spec: `docs/specs/2026-08-07-bo-icon-tabler.md`; plan: `docs/plans/2026-08-07-bo-icon-tabler-plan.md`

- [ ] **Tra nhãn hiệu "RANGI" tại Cục SHTT** nhóm 41 (giáo dục) + 9/42 (phần mềm) — việc chặn cuối của tên; nếu sạch: giữ domain (rangi.vn / rangi.edu.vn / getrangi.com / rangi.app) + handle Facebook/Zalo/TikTok, cân nhắc nộp đơn đăng ký sớm (VN theo nguyên tắc nộp trước được ưu tiên). Quy trình tham chiếu: docs/background/nhat-ky mục 7.8 (USER)
- [ ] **Mục tiêu lịch beta**: hạn 15/08/2026 (lưới pháp lý 1) còn 11 ngày — phi thực tế từ repo trống. Lưới 2: đưa vào hoạt động trước 15/02/2027 → hạn nghĩa vụ 01/03/2027. Cần chốt mốc mới để kế hoạch bám theo. (USER)
- [ ] Khối lớp cụ thể cho use case đầu (tài liệu gợi ý lớp 8) (USER)

## Việc phi-code (từ báo cáo §18 — ứng viên, chưa chốt)

- [ ] Lập danh sách 30-50 phụ huynh tiềm năng cho beta → lưu trong `private/`, KHÔNG commit (USER)
- [ ] Tìm giáo viên Toán quen kiểm chứng skill graph (USER)

- [ ] **Kiểm chứng ToS API platform MiniMax về giới hạn tuổi (under-16)** khi đăng ký tài khoản API — trang ToS không fetch tự động được; nếu ToS API cấm end-user dưới 16 thì phải bàn lại model (USER)

## Việc kỹ thuật (ứng viên từ tài liệu nháp — làm sau khi nghiên cứu lại và chốt từng phần)

- [ ] Bộ eval tiếng Việt nội bộ 30-50 câu (Toán THCS + tình huống sư phạm) để VALIDATE chất lượng M3 — không còn là gate chọn model nhưng là bằng chứng chất lượng trước beta; dùng nền DeepEval (AGENT, khi có tính năng LLM đầu tiên)

- [ ] **Component `<Icon>` — làm KHI dựng màn hình UI đầu tiên, không làm trước.** Hiện file icon đã dùng được ngay bằng đường dẫn thẳng (`/brand/icons/outline/<tên>.svg`), nhưng chưa có lớp nào dịch tên: 4 alias trong `frontend/scripts/brand/icon-manifest.mjs` (`success`→`correct`, `privacy`→`locked`, `timer`→`clock`, `expand`→`chevron-down`) mới chỉ được `brand:check` canh cho trỏ đúng chỗ, chưa có code nào tiêu thụ. Component sẽ nhận tên (kể cả alias) + biến thể outline/filled rồi nhả SVG. Cố ý hoãn vì chưa dựng màn hình thật thì chưa biết nó cần props gì (cỡ, cách đổi màu, có cần inline để tô `currentColor` hay không) — spec `docs/specs/2026-08-07-bo-icon-tabler.md` §7 đã ghi là ngoài phạm vi (AGENT, khi có UI đầu tiên)
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
- [ ] Hardening prod settings trước deploy VPS đầu tiên (GATE chặn deploy): fail-fast khi thiếu `DJANGO_SECRET_KEY`/`POSTGRES_PASSWORD` (kèm build-arg dummy cho `collectstatic` trong Dockerfile); `SECURE_PROXY_SSL_HEADER` + `SESSION_COOKIE_SECURE` + `CSRF_COOKIE_SECURE` + HSTS khi có TLS; viết lại target `make deploy` cho GHCR (hiện là placeholder — compose pull fail với service chỉ có `build:`) — finding từ review scaffold (AGENT)
- [ ] CI/CD giai đoạn 3 (khi có người dùng trả tiền): zero-downtime deploy, Dependabot, pip-audit/npm audit, Trivy (AGENT)
- [ ] Cài DeepEval + promptfoo + mutmut và dựng pipeline eval nightly — khi có tính năng LLM thật đầu tiên (AGENT)

## Đã xong

- [x] 04/08/2026 — Bộ khung vận hành: CLAUDE.md (Karpathy + phân công architect/subagent + memory + hành xử chuyên nghiệp), memory/, docs/ + index, hooks cưỡng chế, code-reviewer agent, git + GitHub (đã chuyển private)
- [x] 04/08/2026 — **Chốt tech stack** sau 4 vòng phản biện: Next.js + Django/django-ninja + Celery + Postgres/pgvector + SSE + Nginx + Docker Compose 2 tầng trên VPS + R2 + CI/CD 3 giai đoạn (docs/research/nghien-cuu-tech-stack.md)
- [x] 04/08/2026 — **Chốt chiến lược test**: pytest/Vitest/Playwright-chromium + 9 quy tắc (mock LLM trong CI, Postgres thật, SymPy ground-truth, chống test giả, eval tách nightly) — CLAUDE.md mục Chiến lược test; checklist code-reviewer đã cập nhật
- [x] 05/08/2026 — **Chốt bộ nhận diện thương hiệu** (vòng nghiên cứu 11+12): tên RANGI (chờ tra SHTT), màu hổ phách+lục bảo với hệ ramp/semantic 2 mode đầy đủ, font phương án C (PhuDu display + Be Vietnam Pro + Inter + Lexend), mascot đom đóm anti-Duolingo, triết lý "ngọc bất trác"/"ngọn đèn nhỏ", slogan VN "Hoàn thiện hơn mỗi ngày" / EN "A little brighter every day" — CLAUDE.md mục Bộ nhận diện thương hiệu
- [x] 04/08/2026 — **Scaffold monorepo thực thi xong**: 7 task theo `docs/plans/2026-08-04-scaffold-monorepo-plan.md` — backend Django/django-ninja/Celery, frontend Next.js, deploy compose 2 tầng + Nginx, Makefile/env/pre-commit, CI GitHub Actions, verify E2E trên Docker (4/4 tiêu chí DoD PASS) — bằng chứng: `.superpowers/sdd/2026-08-04-scaffold-monorepo-plan/task-7-report.md`
- [x] 05/08/2026 — **Gói logo Rangi**: generator fontkit → 15 SVG + component RangiLogo (progress glow, reduced-motion) + 9 PNG exports, slogan fit-to-width + og:image riêng từng ngôn ngữ (spec/plan 2026-08-05)
- [x] 05/08/2026 — **Bộ 5 lệnh chạy dự án** thay Makefile: dev-start (hot-reload, vá lỗ hổng POSTGRES_HOST/settings), dev-stop, docker-up, docker-down, docker-clean (spec/plan 2026-08-05)
