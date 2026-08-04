# Nghiên cứu chiến lược test (Django + Next.js + LLM)

Ngày: 04/08/2026. Trạng thái: **ĐÃ CHỐT 04/08/2026** — quy tắc rút gọn nằm trong CLAUDE.md mục "Chiến lược test"; file này giữ phân tích đầy đủ + nguồn. Bối cảnh: stack đã chốt (Django/django-ninja/Celery + Next.js + Postgres/pgvector + SSE), TDD gate + code-reviewer agent đã có trong quy trình.

## Bộ công cụ khuyến nghị

| Hạng mục | Công cụ | Ghi chú |
|---|---|---|
| Backend unit/integration | pytest + pytest-django | Chuẩn không tranh cãi; API test bằng `ninja.testing.TestClient` |
| Test data | factory_boy | Hợp quan hệ dữ liệu phức tạp (student/attempt/mastery); tránh fixture JSON tĩnh |
| Mock Anthropic SDK | `httpx.MockTransport` (cách chính chủ trong docs SDK) + respx cho matcher phức tạp | KHÔNG dùng `responses` (SDK dùng httpx, không phải requests); vcrpy chỉ cho vài golden-path integration test |
| Test Celery | Unit: mock `.delay()`/`.apply_async()`; Integration: worker thật qua pytest-celery | Docs Celery nói rõ `task_always_eager` "không phù hợp cho unit test" — chỉ là giả lập |
| Test DB | **Postgres thật** (service container trong CI) | Bắt buộc vì pgvector/JSONB không có trên SQLite — SQLite cho test xanh giả. Tăng tốc: `--reuse-db`, `--no-migrations`, pytest-xdist |
| Frontend | Vitest + React Testing Library | Vitest thay Jest cho App Router (ESM-first, watch nhanh 8x); MSW mock API tầng network |
| E2E | Playwright | Mặc định 2026 (song song miễn phí, đa browser); 10-20 smoke test critical path < 10 phút/PR; regression đầy đủ nightly |
| Eval chất lượng LLM | **DeepEval** ("pytest của LLM eval", local, free) | Xương sống eval |
| Red-team an toàn | **promptfoo** | Chống học sinh jailbreak chatbot ra khỏi vai gia sư — quan trọng với sản phẩm trẻ em |
| Chống test giả | **Mutation testing (mutmut)** định kỳ | Chạy nightly/weekly trên module deterministic quan trọng, không chạy mỗi CI |
| Coverage | pytest-cov, KHÔNG gate % cứng toàn repo | Goodhart's law; nếu gate thì theo diff; coverage là tín hiệu, không phải KPI |

## Quy tắc test đề xuất (đưa vào CLAUDE.md khi chốt)

1. **Phân tầng**: unit test (mock LLM/HTTP, transaction rollback) chạy mọi PR; smoke-eval nhỏ (10-20 case, model rẻ) chỉ chạy trên PR đụng tới prompt; eval đầy đủ + mutation testing chạy nightly/định kỳ; E2E smoke mọi PR.
2. **Không lời gọi LLM thật trong CI thường** — mock toàn bộ; eval là pipeline riêng.
3. **SymPy là ground-truth cho đúng/sai Toán; LLM-as-judge chỉ dùng cho định tính** (văn phong, trình bày) — nghiên cứu ghi nhận LLM-judge có bias hệ thống (thiên vị câu dài, thiên vị model tốt kể cả khi sai). Không đảo vai.
4. **Logic deterministic quan trọng** (SymPy verify, mastery, calibration) phải coverage cao có chủ đích + mutation testing định kỳ — chỗ "sai một ly đi một dặm".
5. **SSE**: test generator backend với stream giả lập; 1-2 E2E smoke xác nhận UI; KHÔNG cố mock EventSource trong Playwright (`page.route()` không intercept được — hạn chế đã biết).
6. **Async Server Component**: không cố unit test (jsdom không chạy được), để E2E cover — điểm yếu công cụ cả cộng đồng React thừa nhận.
7. **Chống test giả từ AI agent** (nghiên cứu TDAD: TDD hình thức không kèm ngữ cảnh làm regression TỆ HƠN +9.94%): (a) agent phải chứng minh test đỏ ĐÚNG LÝ DO trước khi viết implementation; (b) checklist reviewer: assert giá trị cụ thể (không chỉ status==200), có case biên/case sai, test fail nếu revert logic; (c) mutation testing làm trọng tài định kỳ.

## Anti-pattern (từ nghiên cứu, tránh)

- Coverage % cứng chặn merge toàn repo — khuyến khích test rỗng, đặc biệt nguy hiểm khi agent viết test
- SQLite cho test trong dự án pgvector/JSONB
- Trộn eval LLM (xác suất, tốn tiền) vào CI nhanh mọi PR — flaky, dạy thói quen bỏ qua CI đỏ
- Mock SSE tầng Playwright
- Chấp nhận "đã viết test TDD" mà không kiểm tra assertion có ý nghĩa
- LLM-as-judge làm trọng tài duy nhất cho tính đúng khách quan

## Phụ lục: kiểm chứng "Playwright nặng" và làn sóng công cụ agent-browser (04/08/2026)

Người dùng phản biện Playwright nặng và hỏi về công cụ browser chuyên cho AI agent. Kết quả kiểm chứng:

**"Playwright nặng" — hiểu nhầm phổ biến có nguồn gốc thật**: gói npm chỉ ~7-8MB; phần nặng là browser binaries — cài mặc định cả 3 engine là 1.0-1.6GB, nhưng **chỉ cài Chromium (`npx playwright install chromium`) thì 170-450MB, ngang Puppeteer**; Cypress còn nặng hơn (đóng gói Electron ~500MB). Tốc độ CI: 10-20 smoke test chạy ~3-5 phút với cache. Gotcha Docker: cần `--shm-size=1gb`.

**Các công cụ AI-native đã khảo sát** (Stagehand, browser-use, Magnitude, Shortest, TestDriver.ai, QA Wolf, Momentic, Meticulous, Lightpanda): KHÔNG cái nào thay được Playwright cho nhu cầu "smoke test deterministic, miễn phí, mỗi PR" vì: nhóm LLM-điều-khiển-browser tự vi phạm tính deterministic + tốn token mỗi lần chạy + chậm; nhóm hosted giá $2k-20k/tháng; Lightpanda còn beta không render CSS; Shortest đã ngừng cập nhật >1 năm; QA Wolf bản chất vẫn là Playwright thuê người viết hộ. Rủi ro "self-healing test" được ghi nhận: test tự sửa theo UI mới có thể đang test sai luồng mà vẫn pass.

**Kết luận giữ nguyên Playwright, thêm 2 điều chỉnh**: (1) chỉ cài Chromium cho CI; (2) ghi nhận vai trò bổ sung của agent-browser tool: Claude Code dùng browser tool/Playwright MCP **lúc dev** để tự xác minh UI và giúp viết/cập nhật bộ smoke test — công cụ agent nuôi bộ CI test, không thay thế nó.

## Mức độ đồng thuận (trung thực)

- **Cao**: pytest-django, Playwright, Postgres thật trong CI, tách unit/eval, phản đối coverage % cứng
- **Vừa, đang dịch chuyển**: Vitest thay Jest (Next.js docs vẫn hỗ trợ cả hai)
- **Chưa ngã ngũ**: cách test async Server Component; framework eval nào thắng cuối (DeepEval/promptfoo/Braintrust song song tồn tại); tooling test SSE chuẩn

## Nguồn chính

Django Ninja testing docs; Celery testing docs (cảnh báo task_always_eager); Anthropic SDK Python docs (MockTransport); respx/vcrpy docs; pythonspeed.com (SQLite vs Postgres test); Simon Willison (GH Actions postgres service); Vitest vs Jest 2026 (dev.to); MSW docs; Playwright vs Cypress (getautonoma); DeepEval/promptfoo docs + so sánh braintrust.dev; arXiv 2603.17973 (TDAD — TDD với agent); arXiv 2606.17507 + 2412.05579 (LLM-as-judge bias trong giáo dục); mutmut/cosmic-ray; Goodhart coverage (neatstack.substack.com). URL đầy đủ trong lịch sử hội thoại 04/08/2026.
