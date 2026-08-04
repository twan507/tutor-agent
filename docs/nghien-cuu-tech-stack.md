# Nghiên cứu tech stack — ĐÃ CHỐT 04/08/2026

Tiêu chí do người dùng đặt: **scale tới hàng trăm nghìn người dùng không phải đập đi xây lại**, kèm velocity solo founder, chi phí, workload AI-heavy, ràng buộc PDPL.

## QUYẾT ĐỊNH CUỐI (người dùng chốt 04/08/2026)

```
Frontend:   Next.js (chỉ UI; TS client sinh tự động từ OpenAPI)
Backend:    Django + django-ninja (auth built-in, Django Admin cho human review, LLM orchestration)
Worker:     Celery — CÙNG CODEBASE Django, process riêng (SymPy verify, PDF parsing, batch)
Database:   PostgreSQL + pgvector, self-host
Streaming:  SSE (không WebSocket ở MVP; Django Channels là đường nâng cấp khi cần liên lạc 2 chiều)
Proxy:      Nginx (SSE: proxy_buffering off; nâng client_max_body_size cho upload PDF)
Hạ tầng:    VPS self-host, Docker Compose 2 tầng: infra (postgres — CI không bao giờ đụng)
            + app (nginx/next/django/celery); Makefile `make up` (dựng cả cụm 1 lệnh) / `make deploy` (CI)
Storage:    Cloudflare R2 | Monitoring: Sentry + PostHog | Redis: thêm khi cần, không dựng trước
CI/CD:      GitHub Actions (ruff/eslint, pytest/vitest, makemigrations --check, codegen check, build image)
            + branch protection main; staging auto trên cùng VPS, production approve tay; 3 giai đoạn
```

Các vòng phản biện của người dùng dẫn tới quyết định cuối (giữ lại để hiểu vì sao):

1. **Supabase/Neon/Cloud Run bị loại** — người dùng có VPS, tự host toàn bộ FE/BE/DB. Phần khảo sát managed services bên dưới giữ làm tham khảo nếu sau này rời VPS.
2. **NestJS vs Django** (sau khi loại FastAPI vì fastapi-users đã maintenance-mode và Next.js-as-BE bị loại đúng): Django thắng vì (a) Django Admin gần như miễn phí cho tính năng bắt buộc human-review nội dung AI (chênh cả tuần công so với AdminJS/tự build); (b) auth built-in 20 năm chinh chiến; (c) SymPy/PDF chạy Celery worker **cùng codebase** — tách process nhưng không tách repo/ngôn ngữ/ORM, hơn hẳn NestJS + Python microservice (2 codebase, API contract phải đồng bộ); (d) solo-dev velocity (ít boilerplate, AI agent code Django rất thạo). Điều kiện đổi chiều đã ghi: thuê dev TS, admin hóa đơn giản, hoặc LLM-verify thay được SymPy.
3. **SSE thay WebSocket**: phiên học là turn-based (mỗi lượt một stream ngắn) — đúng pattern SSE; WebSocket cần Channels + Redis backplane + quản lý kết nối, chỉ đáng khi tính năng chat 2 chiều được chốt vào roadmap (thêm sau không bị cản).
4. **Nginx** làm reverse proxy + load balancer — công cụ người dùng đã làm chủ; thang scale 5 bậc: 1 VPS → scale dọc → tách DB → nginx upstream nhiều VPS app → (xa) K8s.

**Quy tắc kiến trúc cứng đi kèm** (ghi trong CLAUDE.md): app stateless (session trong DB, file lên R2, không ghi disk local, config qua env); migration backward-compatible; cấm `docker compose down -v` với project infra; pin version Postgres; backup ra R2 + test restore định kỳ.

**Lưu ý tên dự án**: "Flibby" CHƯA chốt (người dùng đang xem xét lại) — code/infra dùng tên trung tính `tutor-agent` cho tới khi có tên cuối.

---

Phần dưới đây là các nghiên cứu gốc dẫn tới quyết định (một số khuyến nghị trung gian như Supabase/Cloud Run/TS-backbone đã bị các vòng phản biện phía trên thay thế).

## Tóm tắt đề xuất

| Lớp | Bản nháp | Đề xuất mới | Lý do chính |
|---|---|---|---|
| Database | MongoDB Atlas | **PostgreSQL (Supabase) + pgvector** | Dữ liệu lõi (parent-child-goal-attempt-consent) là quan hệ chặt; ACID gốc cho billing/consent; cascade delete + RLS khớp nghĩa vụ PDPL xóa dữ liệu trẻ em; path scale đã chứng minh (Notion/Figma tới hàng tỷ dòng); rẻ hơn Atlas ở mọi mốc; chiều migrate cộng đồng là Mongo→Postgres, không phải ngược lại |
| Vector/RAG | Atlas Vector Search | **pgvector** (chung DB) | Đủ chín tới 10-50M vector; join trực tiếp với dữ liệu quan hệ; không tốn phí dịch vụ riêng |
| Backend | FastAPI cho toàn bộ | **Next.js full-stack TypeScript làm xương sống + Python sidecar siêu nhỏ** (SymPy verify + PDF parsing, stateless) | Solo founder không nên gánh 2 hệ sinh thái toàn phần; Vercel AI SDK đã đủ chín cho streaming/tool-calling; SymPy không có thay thế JS đủ tốt (equivalence checking là bài toán khó) nên giữ Python nhưng khoanh vùng thành 1 service nhỏ ít thay đổi |
| Queue/Redis | Redis từ đầu | **Hoãn** — Postgres tự lo (job table + SKIP LOCKED); thêm Upstash/BullMQ khi có tín hiệu thật | Tránh thêm hạ tầng sớm; Postgres đủ tới hàng chục nghìn user |
| Auth | (bản nháp bỏ trống) | **Supabase Auth** + bảng consent phụ huynh-con tự thiết kế; SMS OTP qua gateway VN (eSMS/SpeedSMS, rẻ hơn Firebase/Twilio 3-6 lần); Zalo OAuth để sau | Không vendor nào có sẵn mô hình "phụ huynh đại diện consent cho con" theo PDPL — phải tự xây dù chọn ai; Supabase Pro $25/tháng đã gồm 100k MAU (Auth0 ~$5.250/tháng, Clerk ~$1.000+/tháng ở mốc đó) |
| Deploy backend | Cloud Run/Render/Fly/Railway (treo) | **Cloud Run, region Singapore** | Container chuẩn không lock-in; scale-to-zero + free tier lớn cho beta; scale tới 100k chỉ bằng config; SSE timeout tới 60 phút |
| Deploy frontend | Vercel | **Vercel** (giữ), tách LLM streaming ra Cloud Run | Tránh giới hạn timeout + chi phí function invocation phình ở scale; đường lui OpenNext self-host nếu bill vượt ngưỡng |
| Storage | R2 hoặc S3 | **R2** (chốt) | Egress $0 — chi phí không phình theo lượt xem/tải đề |
| Monitoring | Sentry + PostHog | Giữ nguyên | Không có lý do đổi |
| Lucia Auth | — | KHÔNG dùng (đã deprecated đầu 2025); nếu tự build sau này: Better Auth | Cập nhật trạng thái hệ sinh thái |

## Kiến trúc đề xuất (hình dung tổng thể)

```
[Người dùng VN]
   │
   ├─ Vercel (Next.js: landing, dashboard, UI) ── CDN Cloudflare/Vercel Edge
   │
   ├─ Cloud Run Singapore (TS service: API nặng, LLM streaming SSE, batch jobs)
   │       │
   │       ├─ Anthropic/OpenAI API (qua pipeline pseudonymize — nghĩa vụ CTIA)
   │       └─ Python sidecar (Cloud Run scale-to-zero): SymPy verify, PDF parsing (Docling/Marker)
   │
   ├─ Supabase Singapore: Postgres (+pgvector, RLS, partition bảng log) + Auth + consent tables
   └─ Cloudflare R2: file đề thi PDF
```

## Phát hiện quan trọng từng mảng

### Database (chi tiết trong nghiên cứu)

- Dữ liệu chia 3 lớp: quan hệ chặt (users/links/goals/consents) — append-only log (attempts/chat/ai_runs) — bán cấu trúc (items, JSONB lo được). Cả Mongo lẫn Postgres đều phải tự mô hình hóa event sourcing; không ai có lợi thế riêng ở đó.
- Bảng log là bài toán vòng đời dữ liệu bất kể engine: ở 100k user hoạt động, log đạt hàng chục GB/ngày → bắt buộc partition theo thời gian (pg_partman) + archive sang cold storage khi vượt ~10-50GB/bảng. Kỷ luật này phải có từ thiết kế schema đầu tiên.
- Transaction Mongo là tính năng "bù đắp" (giới hạn 60s, phức tạp trên sharded cluster); Postgres ACID gốc — quan trọng cho billing/consent.
- Chi phí OLTP ước tính: 1k users: Atlas ~$57 vs Supabase $25 | 10k: ~$450-600 vs ~$300-800 | 100k: hàng nghìn-chục nghìn vs ~$2.000-6.000/tháng.
- Rủi ro Postgres: học SQL/ORM nếu quen Mongo (giảm bằng Drizzle/Prisma); vacuum/bloat trên bảng log nếu không partition sớm; sharding thủ công ở mức triệu+ users (ngoài phạm vi mục tiêu).

### Backend (chi tiết trong nghiên cứu)

- Python vẫn là first-class của AI SDK (TS trễ 1-4 tuần với tính năng mới), nhưng use case của ta (gọi LLM, streaming, tool-calling, không cần LangGraph/multi-agent nặng) thì Vercel AI SDK ở TS đủ tốt.
- SymPy không thể thay bằng mathjs/Algebrite/Nerdamer — equivalence checking (x+1 ≡ 1+x, 2(x+3) ≡ 2x+6) là chỗ các thư viện JS fail; chấm sai đáp án là lỗi chết người với sản phẩm giáo dục.
- PDF đề thi có công thức/bảng/scan: hệ Python vượt trội (Docling, Marker, Unstructured) — dùng chung sidecar.
- FastAPI scale được (Uber/Netflix) nhưng đầy async-gotcha (một call blocking đóng băng event loop); vấn đề tránh được hoàn toàn khi không dùng FastAPI làm xương sống.
- "Thuế 2 ngôn ngữ" với solo founder: 2 toolchain, 2 deploy, 2 dependency graph, 2 kiểu log lúc 2h sáng — đồng thuận cộng đồng: chỉ polyglot ở điểm khoanh vùng hẹp.
- Đường lui: nếu 6-12 tháng tới cần RAG/multi-agent phức tạp thật sự → ranh giới sidecar phình → cân nhắc lại full Python. Theo dõi tín hiệu này.

### Hạ tầng + auth + pháp lý (chi tiết trong nghiên cứu)

- Latency VN: Singapore là region mặc định đúng; rủi ro đứt cáp quang biển là có thật → UX cần retry/fallback cho streaming.
- Cloudflare có PoP Hà Nội/HCM nhưng chỉ peer trực tiếp với FPT — user Viettel/VNPT vẫn có thể đi vòng Singapore; CDN vẫn đáng bật vì gần miễn phí.
- Vercel Fluid Compute: timeout 300-800s — đủ cho từng lượt hỏi-đáp streaming, không đủ cho WebSocket 25 phút → kiến trúc mỗi lượt là 1 SSE request ngắn, không WebSocket xuyên phiên.
- PDPL: **không bắt buộc lưu dữ liệu trong VN**; cơ chế là hồ sơ đánh giá chuyển xuyên biên giới (CTIA, nộp trong 60 ngày từ lần chuyển đầu). Vì gọi LLM nước ngoài là chuyển xuyên biên giới, nghĩa vụ CTIA **không tránh được bất kể chọn cloud nào** → chọn hạ tầng theo tiêu chí kỹ thuật, đầu tư vào pipeline pseudonymize + hồ sơ CTIA + consent log. Cloud VN (Viettel/FPT/VNG) không cần thiết ở B2C; chỉ cân nhắc nếu sau này B2B trường học đòi residency.
- Nghị định 356/2025: "dữ liệu hành vi/theo dõi trên nền tảng số" vào diện nhạy cảm — dữ liệu học tập trẻ em nhiều khả năng cần DPIA.

## Rủi ro tổng hợp của đề xuất mới

1. Sidecar Python là điểm lỗi mới (down = không chấm được Toán) → cần retry/circuit breaker + test kỹ.
2. Đề xuất đảo 2 quyết định lớn của bản nháp (Mongo→Postgres, FastAPI→TS) — nếu người dùng đã có kỹ năng/sở thích mạnh về Python hoặc Mongo, cần cân nhắc yếu tố con người trước khi chốt.
3. Supabase là "nhiều trứng một giỏ" (DB + Auth + storage tùy chọn) — đổi lại ít vendor phải quản; đường lui: Postgres chuẩn + Auth tự build (Better Auth) đều migrate được.
4. Cold start Cloud Run ảnh hưởng phiên học đầu → min-instances giờ cao điểm (tốn thêm ít).
5. Luật PDPL/CTIA còn non (hiệu lực 1/1/2026), diễn giải có thể đổi → cần tư vấn pháp lý khi có traction.

## Nguồn

Ba báo cáo subagent đầy đủ có URL nguồn từng mục (Notion/Figma sharding case studies, benchmark pgvector, pricing Atlas/Supabase/Neon/Auth0/Clerk, Vercel AI SDK docs, SymPy equivalence checking, Cloud Run/Fly/Railway/Render so sánh, Nghị định 356/2025, Vietnam Briefing/EY/ITIF về CTIA...). Chi tiết giữ trong lịch sử hội thoại 04/08/2026; các URL chính đã nêu inline ở trên theo từng mảng.
