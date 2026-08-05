# CLAUDE.md — tutor-agent

Quy tắc làm việc cho AI agent trong repo này. Áp dụng cho mọi phiên làm việc, mọi agent.

## Dự án

Nền tảng gia sư AI **parent-first** cho thị trường Việt Nam. Bán quyền kiểm soát quá trình học cho phụ huynh, không chỉ bán khóa học. Không phải chatbot: hệ thống tạo lộ trình, dạy, kiểm tra, đo, điều chỉnh, báo cáo.

- **Tên thương hiệu: RANGI** (chốt 05/08/2026) — "Rang" = rạng sáng/rạng rỡ/rạng danh; "i" = đốm sáng mascot (chấm chữ i) + "i tờ" (bước học đầu tiên) + chính mình. CHỜ tra nhãn hiệu Cục SHTT nhóm 41+9 trước khi dùng công khai/mua domain; code/infra vẫn dùng `tutor-agent` cho tới khi tra xong. "Flibby" cũ đã bỏ.
- **MVP** (định hướng): Learning Sprint — ôn thi Toán THCS trong 7-14 ngày
- **Moat**: learner profile + assessment intelligence + mastery tracking + parent reporting

**Trạng thái tài liệu**: kiến trúc, kế hoạch triển khai trong `docs/background/*.md` là **bản nháp định hướng (demo)** — người dùng nghiên cứu lại từng phần rồi mới chốt. Ngoại lệ đã chốt thật: **tech stack** (04/08/2026, mục Tech stack bên dưới). Agent không được coi chữ "đã chốt" trong docs nháp là căn cứ tự build — mọi phần chỉ build sau khi người dùng xác nhận trong hội thoại.

## Mô hình phân công: kiến trúc sư và subagent

Session chính (Fable/Opus) là **lớp kiến trúc sư — quản lý**, không phải thợ code. Vai trò: hiểu yêu cầu, thiết kế, ra quyết định, giao việc, review kết quả.

- **Trước mỗi task, tự đánh giá mức độ phù hợp để quyết định giao hay tự làm:**
  - **Tự làm trực tiếp** khi task nhỏ: sửa 1-2 file, tra cứu nhanh, chỉnh config, trả lời câu hỏi — tự làm vừa chính xác vừa đỡ tốn token, giao subagent chỉ thêm overhead.
  - **Giao subagent (model Sonnet)** khi là việc tay chân khối lượng lớn: viết code nhiều file theo spec đã chốt, tìm kiếm/khảo sát rộng trong codebase, tác vụ lặp đi lặp lại, các việc độc lập chạy song song được.
- Khi giao việc: đề bài phải tự đủ (spec rõ, đường dẫn file, tiêu chí hoàn thành kiểm chứng được). Subagent không có ngữ cảnh hội thoại.
- Kết quả subagent trả về phải được session chính **review trước khi chấp nhận** — kiến trúc sư chịu trách nhiệm cuối cùng về chất lượng.

## Quy tắc hành xử chuyên nghiệp

Nguyên tắc gốc: **hành xử như kỹ sư cao cấp trong một team — mọi hành động phải giải trình được, không có hành động "tiện tay".**

1. **Không hành động ngoài phạm vi yêu cầu trực tiếp.** Việc phát sinh trong lúc làm (thêm file mới, thêm dependency, đưa tài nguyên từ ngoài repo vào, đổi cấu trúc thư mục, đổi cách làm đã thống nhất) → nêu rõ và hỏi trước, không tự quyết rồi báo sau.
2. **Kỷ luật git**: khi dự án đã có code chạy, làm feature/fix trên nhánh riêng (`feat/...`, `fix/...`), không commit thẳng main. Commit theo Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`...), commit nhỏ một mục đích. **Commit theo mốc tiến trình**: mỗi mốc hoàn thành (một quyết định được chốt, một việc xong) = một commit riêng ngay lúc đó — không dồn nhiều mốc vào một commit, để diff truy ngược được từng quyết định. Push sau khi commit.
3. **Không bypass cơ chế kiểm soát**: cấm `--no-verify`, force push, `rm -rf`, sửa `.env*` / `.claude/settings.json` / `.claude/hooks/` — agent gõ trực tiếp các lệnh này đã bị hook trong `.claude/settings.json` chặn cứng; gặp chặn thì báo người dùng, không tìm đường vòng. Riêng `docker volume rm/prune` là ngoại lệ có kiểm soát: hook chặn agent gõ trực tiếp, nhưng lệnh `docker-clean` (chạy `docker volume prune` bên trong `scripts/stack.mjs`) là lệnh hợp lệ, được cho phép — có hàng rào riêng bên trong script (kiểm tra phiên bản Docker Engine trước khi prune, kiểm tra bất biến volume `tutor-infra_pgdata` trước/sau).
4. **Không tuyên bố hoàn thành khi chưa có bằng chứng**: chạy lệnh kiểm chứng (test/lint/build), xem output thật, rồi mới báo xong kèm output đó. Test fail thì báo fail nguyên trạng.

**Quy trình feature chuẩn — KHÔNG NHẢY CÓC BƯỚC NÀO** (dùng skill superpowers có sẵn):

```
1. brainstorm (skill brainstorming) — làm rõ yêu cầu
2. SPEC → docs/specs/YYYY-MM-DD-<chủ-đề>.md — NGƯỜI DÙNG DUYỆT
3. PLAN (skill writing-plans) → docs/plans/YYYY-MM-DD-<chủ-đề>-plan.md
   — bẻ spec thành task nhỏ có nội dung file thật / lệnh thật / expected thật,
   KHÔNG placeholder. Spec nói "cái gì", plan nói "chính xác làm thế nào".
   Giao subagent khi chưa có plan là nguồn lệch chính — CẤM.
4. THỰC THI theo plan (skill subagent-driven-development hoặc executing-plans)
   — TDD trong từng task: test đỏ đúng lý do trước, code sau
5. REVIEW bằng subagent code-reviewer (.claude/agents/code-reviewer.md, context sạch)
   — review HAI TRỤC: Chuẩn (đúng đắn/ràng buộc/test) + Spec (thiếu/sai/scope creep so với spec đã duyệt)
6. VERIFY bằng chứng thật (skill verification-before-completion) — dán output
7. merge + commit theo mốc
```

Ba gate không được nhảy: **spec được duyệt**, **plan tồn tại trước khi giao việc**, **test đỏ trước khi viết implementation**. Cả spec lẫn plan đều thêm dòng vào `docs/README.md`. Backlog theo dõi trong `TASKS.md` ở gốc repo.

**Cách brainstorm — grilling theo frontier** (bổ sung 05/08/2026, áp dụng trong bước 1):

- Mô hình hóa buổi làm rõ yêu cầu thành **cây quyết định**: mỗi quyết định mở ra các quyết định con phụ thuộc nó.
- Hỏi theo **vòng**: mỗi vòng hỏi TOÀN BỘ frontier — các câu đã đủ tiền đề trả lời ngay. Câu phụ thuộc câu còn mở thì để vòng sau, không hỏi gộp.
- Mỗi câu đánh số, **kèm đề xuất trả lời của agent** để người dùng chỉ cần xác nhận hoặc bẻ.
- **Fact thì agent tự tra** (codebase, docs, web — giao subagent nếu rộng), chỉ **quyết định** mới đặt cho người dùng. Không bao giờ hỏi thứ tự tra được.
- Xong khi frontier rỗng — không còn nhánh nào bị giả định ngầm. Thuật ngữ mới nảy ra trong buổi grilling → cập nhật `CONTEXT.md` ngay.

## Quy tắc bộ nhớ (memory/)

Bộ nhớ dự án là file-based, nằm trong repo tại `memory/`, git-track được. Không dùng vector DB, không dùng knowledge graph — quy mô memory của một dự án không cần đến (xem `docs/research/nghien-cuu-ky-thuat-agent-memory.md`).

**Cấu trúc:**

```
memory/
├── MEMORY.md      # chỉ mục — TRẦN CỨNG 150 dòng, đọc đầu mỗi phiên làm việc
├── semantic/      # fact dự án: kiến trúc, quyết định sản phẩm đã chốt
├── procedural/    # quy ước làm việc: cách phân công, deploy, test
└── episodic/      # nhật ký quyết định theo phiên (được phép cũ đi)
```

**Sáu quy tắc:**

1. **Index nhỏ, lazy-load chi tiết**: `MEMORY.md` chỉ chứa mỗi memory một dòng (tên + hook). Trần cứng 150 dòng — vượt là phải thu gọn trước khi thêm mới. Chi tiết nằm trong file con, chỉ đọc khi cần.
2. **Mỗi memory một file**, có frontmatter: `name`, `type` (semantic/procedural/episodic), `created`, `modified`, `description` một dòng. Đặt file đúng thư mục theo type.
3. **Reflection cuối phiên lớn**: trước khi kết thúc phiên làm việc có thay đổi đáng kể, tự hỏi: (a) có insight bậc cao nào đáng ghi thay vì chỉ fact rời rạc? (b) memory mới có mâu thuẫn với memory cũ nào không? (c) memory nào đã sai/hết hạn cần sửa hoặc xóa? (d) **có kiến thức nào chỉ tồn tại trong hội thoại này không** — lý lẽ, cách kể, insight vừa khám phá? Nếu có: nó sẽ MẤT khi phiên đóng, phải ghi ra file ngay (xem quy tắc 5). Rồi cập nhật memory/ tương ứng.
4. **Memory sai thì sửa hoặc xóa ngay khi phát hiện**, không để tồn. Không ghi vào memory những gì repo đã ghi (code, git history, CLAUDE.md) — memory chỉ chứa thứ không suy ra được từ repo.

5. **Chốt quyết định lớn = ghi cả LÝ DO và CÁCH DÙNG, không chỉ kết luận.** Kết luận (bảng màu, tên font, tên lệnh) là phần dễ ghi và cũng là phần ít giá trị nhất — lý lẽ đằng sau mới là thứ không tái tạo được ở phiên sau. Mỗi quyết định có sức sống dài phải để lại **ba tầng tài liệu**:
   - `docs/research/` — **vì sao chọn** (các phương án đã cân nhắc, bằng chứng, đánh đổi, điều kiện đổi chiều)
   - `docs/brand/` hoặc `docs/specs/` — **ý nghĩa và cách dùng** (giải nghĩa, cách kể chuyện, thông số áp dụng)
   - `CLAUDE.md` — **quy tắc bắt buộc** rút gọn (thứ agent phải tuân khi build)

   Tiền lệ: bộ nhận diện Rangi chốt xong nhưng toàn bộ phần giải nghĩa (ba tầng nghĩa của tên, các hướng khai thác marketing, điển tích văn hóa) suýt chết theo phiên vì chỉ tồn tại trong hội thoại — người dùng phải tự nhớ và yêu cầu mới có `docs/brand/so-tay-thuong-hieu-rangi.md`. **Không được để người dùng phải là bộ nhớ dự phòng.**

   **Bộ lọc "quyết định lớn"** (đủ CẢ BA mới đáng một file research; thiếu một → chỉ cần dòng episodic hoặc commit message): (a) khó đảo ngược — đổi ý sau này tốn kém thật; (b) gây ngạc nhiên nếu thiếu context — người đọc sau sẽ hỏi "sao lại làm thế này?"; (c) có trade-off thật — có phương án thay thế nghiêm túc đã bị loại vì lý do cụ thể.

6. **Kỷ luật cắt tỉa khi reflection** (bổ sung 05/08/2026): tài liệu cho agent đọc (CLAUDE.md, MEMORY.md, CONTEXT.md) mặc định sẽ bồi lắng — thêm thì thấy an toàn, xóa thì thấy rủi ro. Hai phép thử khi soát: (a) **săn no-op** — câu lệnh mà model mặc định đã làm đúng thì tốn token để nói điều vô nghĩa, xóa cả câu; (b) **môi trường là source of truth** — thứ tra được từ config/`--help`/cấu trúc thư mục/code mà tài liệu chép lại là cache dễ ôi, chỉ ghi thứ KHÔNG tra được: quy ước bất thành văn, lý do, bẫy.

## Quy tắc làm việc (theo Karpathy guidelines)

### 1. Nghĩ trước khi code

- Nêu rõ giả định trước khi bắt đầu. Không chắc thì hỏi, không tự đoán thay người dùng.
- Yêu cầu có nhiều cách hiểu → trình bày các cách hiểu, không tự chọn ngầm.
- Thấy hướng đơn giản hơn hướng được yêu cầu → phải nói ra trước khi làm.
- Còn điểm mơ hồ ảnh hưởng kết quả → dừng lại hỏi, không code tiếp.

### 2. Đơn giản trước tiên

- Code tối thiểu giải đúng bài toán được yêu cầu. Không có gì "phòng xa".
- Không thêm tính năng ngoài yêu cầu, không abstraction cho thứ chỉ dùng một lần, không xử lý edge case không xảy ra.
- Bài test: senior engineer nhìn vào có thấy overcomplicated không? 50 dòng làm được thì không viết 200 dòng.

### 3. Sửa đúng chỗ

- Chỉ chạm vào phần phải chạm. Giữ style code hiện có, không "tiện tay cải thiện" phần xung quanh.
- Không refactor phần không liên quan đến yêu cầu. Chỉ dọn import/biến thừa do chính thay đổi của mình tạo ra.
- Mỗi dòng diff phải truy ngược được về yêu cầu của người dùng.

### 4. Làm theo mục tiêu kiểm chứng được

- Biến yêu cầu mơ hồ thành tiêu chí thành công cụ thể, đo được, trước khi bắt đầu.
- Việc nhiều bước: nêu kế hoạch đánh số, mỗi bước có cách verify.
- Lặp đến khi verify đạt. Không tuyên bố "xong" khi chưa chạy kiểm chứng.

### 5. Debug có kỷ luật (bổ sung 05/08/2026, dùng cùng skill systematic-debugging)

- **Chưa có "lệnh đỏ" thì chưa được đặt giả thuyết.** Trước khi đọc code xây lý thuyết, phải nêu được MỘT lệnh (test/curl/script) đã chạy thật ít nhất một lần, deterministic, nhanh (giây, không phút), và đỏ đúng triệu chứng người dùng mô tả — không phải "chạy không lỗi". Bug chập chờn: không cần repro sạch, cần **nâng tỷ lệ tái hiện** (lặp 100×, stress, thu hẹp timing) đến mức debug được. Thật sự không dựng được vòng lặp → dừng, liệt kê đã thử gì, xin người dùng artifact (log, HAR, recording) — không đoán mò tiếp.
- **Sinh 3-5 giả thuyết xếp hạng trước khi kiểm bất kỳ cái nào** — bám giả thuyết đầu tiên là anchor bias. Mỗi giả thuyết phải falsifiable: "nếu X là nguyên nhân thì đổi Y bug biến mất". Không phát biểu được dự đoán → đó là cảm giác, loại. Đưa danh sách cho người dùng xem (họ hay re-rank tức thì), nhưng không block nếu họ vắng.
- **Mọi log debug gắn prefix duy nhất** kiểu `[DEBUG-a4f2]` — dọn dẹp cuối cùng là một lệnh grep; log không tag sẽ sống sót lọt vào commit. Trước khi báo xong: repro gốc hết tái hiện, regression test pass, grep prefix ra 0 kết quả.

## Ràng buộc sản phẩm bất biến

Đây là ranh giới pháp lý và thiết kế đã chốt (Luật TTNT 134/2025/QH15, QĐ 33/2026/QĐ-TTg, Luật BVDLCN 91/2025/QH15). **Không code nào được vượt qua, kể cả prototype:**

1. **CẤM VĨNH VIỄN**: camera, mic, nhận diện khuôn mặt/ánh mắt, mọi dữ liệu sinh trắc học, suy luận cảm xúc hay mức tập trung của học sinh.
2. **Không leaderboard xuyên học sinh.** Chỉ so sánh học sinh với chính mình trong quá khứ.
3. **Đánh giá luôn là formative**: không làm căn cứ chính thức cho xếp loại, lên lớp, học vụ. Không ký hợp đồng trường học dùng kết quả làm căn cứ đánh giá.
4. **Notification cho phụ huynh**: tối đa 1 thông báo tự động/ngày/trẻ, dạng digest; giọng trung tính, mô tả sự kiện; không so sánh với trẻ khác; không cảnh báo realtime từng câu sai. Minh bạch hai chiều: học sinh thấy đúng những gì phụ huynh thấy.
5. **Nội dung học tập**: human review trước publish, AI không tự publish. Nguồn có kiểm soát (GDPT 2018, item tự sinh từ skill graph) — không để AI web search tự do rồi publish thẳng.
6. **Learner model**: KHÔNG dùng learning styles (visual/auditory/kinesthetic — đã bị khoa học bác bỏ). Chỉ dùng biến hành vi có bằng chứng: kiến thức nền, attention span đo được, phản ứng với feedback, tốc độ làm bài, mức phụ thuộc hint.
7. **Dữ liệu trẻ em**: lưu có mục đích, có consent người đại diện, có quyền xóa; pseudonymize trước khi gọi API AI nước ngoài. Không cào dữ liệu đối thủ.
8. **Assessment**: item Toán phải qua verify tự động (SymPy/code execution) trước khi vào hàng review; độ khó item recalibrate từ dữ liệu thật khi đạt ~30 attempts.

## Ngôn ngữ và thuật ngữ

- Giao tiếp với người dùng repo này bằng **tiếng Việt**. Code, tên biến, commit message bằng tiếng Anh.
- **Thuật ngữ domain tra `CONTEXT.md`** (glossary song ngữ, nguồn duy nhất): hội thoại/UI dùng tên VN canonical, code dùng tên EN canonical, không dùng từ trong danh sách `_Tránh_`. Khái niệm domain mới xuất hiện hoặc hai người đang gọi một thứ bằng hai tên → chốt tên và cập nhật `CONTEXT.md` ngay trong phiên. `CONTEXT.md` chỉ là glossary — không nhét implementation detail hay quy tắc vào đó.
- Ngôn ngữ sản phẩm — không bao giờ dùng:
  - ~~"thay thế gia sư"~~ → định vị là công cụ bổ trợ ngoài nhà trường
  - ~~"dự đoán điểm thi"~~ → dùng **"mức sẵn sàng theo đề mô phỏng"**
  - ~~"chứng chỉ"~~, ~~"tương đương điểm thi"~~, ~~"xếp loại học lực"~~
- Giao diện phải có nhãn minh bạch AI (người dùng biết đang tương tác với AI).

## Tech stack — ĐÃ CHỐT (04/08/2026, xem docs/research/nghien-cuu-tech-stack.md)

- Frontend: **Next.js** (chỉ UI; TS client sinh tự động từ OpenAPI, không viết tay)
- Backend: **Django + django-ninja** — auth dùng built-in của Django; Django Admin là công cụ human-review nội dung
- Worker: **Celery cùng codebase Django**, process riêng — SymPy verify, PDF parsing, batch job. Không tách thành service/repo riêng
- Database: **PostgreSQL + pgvector** self-host
- Streaming: **SSE** (không WebSocket ở MVP — Channels chỉ thêm khi tính năng liên lạc 2 chiều được chốt)
- Proxy: **Nginx**; hạ tầng: **VPS + Docker Compose 2 tầng** — `infra` (postgres, CI không bao giờ đụng) + `app`; **5 lệnh gõ**: `dev-start` / `dev-stop` / `docker-up` / `docker-down` / `docker-clean` (logic trong `scripts/stack.mjs`; `.bat` cho Windows, `.sh` cho Linux — xem README.md mục "Chạy dự án"). Deploy VPS **KHÔNG** dùng script này — CI/CD giai đoạn 2 gọi thẳng `docker compose` qua SSH, VPS chỉ cần Docker, không cần Node.
- Storage: **Cloudflare R2**; Monitoring: Sentry + PostHog; Redis: chỉ thêm khi có nhu cầu thật
- CI/CD: GitHub Actions (lint, test, `makemigrations --check`, codegen check, build) + branch protection main; production deploy phải người dùng approve
- Chi phí LLM: model routing từ đầu, không dùng một model đắt cho mọi việc

**Quy tắc kiến trúc cứng:**

1. App **stateless**: session trong DB, file user upload lên R2 (không ghi disk local), config qua env var
2. Migration **backward-compatible**: thêm cột nullable trước, xóa cột sau ít nhất 1 release; không sửa migration đã merge
3. **Ranh giới dữ liệu**: được phép `stop`/`down` container (dựng lại được, kể cả tầng infra); **CẤM VĨNH VIỄN** cờ `-v`/`--volumes` trong mọi lệnh docker — đó là ranh giới giữa "xóa container" và "mất dữ liệu"; hook `guard-bash.sh` chặn cứng. Pin version Postgres cụ thể (không `latest`)
4. Backup Postgres ra R2 + test restore định kỳ — nghĩa vụ pháp lý với dữ liệu trẻ em
5. SSE endpoint: nhớ `proxy_buffering off` phía nginx
6. **API-first cho mobile tương lai**: mọi business logic nằm sau API Django (django-ninja) — Next.js là thin client, KHÔNG nhét logic nghiệp vụ vào server actions/server components. App Android/iOS (dự kiến React Native + Expo) sẽ dùng chung đúng API này; auth thiết kế sẵn sàng cho token-based bên cạnh session cookie

Đổi bất kỳ phần nào của stack phải bàn với người dùng trước.

**Môi trường dev — bẫy đã biết (đọc trước khi báo lỗi):**

1. **Line ending**: repo có `.gitattributes` ép LF (`* text=auto eol=lf`). Nếu clone lên máy Windows mới mà `pnpm format:check` báo lỗi format HÀNG LOẠT file dù không ai sửa gì → đó là CRLF do `core.autocrlf`, KHÔNG phải lỗi thật. Kiểm chứng bằng `pnpm exec prettier --check --end-of-line auto .` (sạch = đúng là báo động giả), chữa bằng `git rm --cached -r . && git reset --hard` để checkout lại theo `.gitattributes`. Đừng chạy `prettier --write` hàng loạt để "sửa" — sẽ tạo diff rác toàn repo.
2. **Kho gói pnpm nằm ngoài repo** (`D:\.pnpm-store` trên máy hiện tại): đây là mặc định của pnpm — kho dùng chung phải cùng ổ đĩa với `node_modules` để hardlink được. Không phải cấu hình sai, không đưa vào repo. Dọn rác kho: `pnpm store prune`.

## Não AI sản phẩm — ĐÃ CHỐT (05/08/2026, xem docs/research/nghien-cuu-nao-ai-orchestrator.md)

**Model: MiniMax M3** cho cả orchestrator lẫn worker (quyết định ngân sách của người dùng — $0.30/$1.20 per 1M token). Routing table giữ nguyên thiết kế: nâng cấp/thêm não to sau này chỉ là sửa config, không sửa code.

**Harness: TỰ VIẾT, cấm framework agent** (LangGraph/CrewAI/AutoGen — theo Anthropic guidance + pattern Khanmigo/Duolingo). 5 nguyên tắc cứng:

1. **Một cửa duy nhất `ai_call()`**: mọi lời gọi LLM đi qua đúng một hàm — pseudonymize → hard-cap check → adapter (litellm SDK bọc trong) → log `ai_runs` (model, token, chi phí, mục đích, latency) → trả kết quả. CẤM gọi SDK provider rải rác ngoài hàm này.
2. **`routing_table` là config**: map (loại tác vụ → model_id); không hardcode model name trong logic nghiệp vụ.
3. **Teaching policy là state machine ở code** — bước dạy, chuyển bước, kéo về chủ đề đều deterministic và test được; prompt chỉ lo diễn đạt; session state lưu Postgres mỗi turn, không giữ RAM.
4. **Retry/fallback trong ai_call()**: backoff + jitter, circuit breaker, provider dự phòng sau cùng interface.
5. **Guardrail trẻ em ở CẢ prompt LẪN code**: post-check "không đưa đáp án trực tiếp", lớp chống jailbreak độc lập ngoài prompt.

**Điều kiện bắt buộc đi kèm M3** (do rủi ro ToS under-16 + model Trung Quốc, người dùng chấp nhận với điều kiện code bảo vệ):

- Pseudonymize **TRIỆT ĐỂ**: không tên thật, không định danh, không thông tin liên hệ, không dữ liệu nào truy ngược được về trẻ rời khỏi hệ thống tới API — enforce tại `ai_call()`, có test riêng cho lớp này
- Minh bạch với phụ huynh: công bố model nào xử lý phần dữ liệu nào
- Kiểm chứng ToS API MiniMax về giới hạn tuổi khi đăng ký tài khoản (TASKS.md)

## Bộ nhận diện thương hiệu — ĐÃ CHỐT (05/08/2026)

Chi tiết + lý do: docs/research/nghien-cuu-thuong-hieu.md và nghien-cuu-he-mau-va-font.md. Tóm tắt ràng buộc khi build UI/nội dung:

- **Tên**: Rangi. Wordmark: "Rang" + chữ "i" có chấm sáng hổ phách = mascot. App icon/favicon = riêng cái chấm sáng.
- **Màu brand (cố định)**: hổ phách `#F5A623` (amber-500) + ngọc lục bảo `#0E7A5A` (emerald-700) + đêm rừng `#0A2E26` (chỉ hero/splash) + kem trang sách `#FBF6EA`. Ramp đầy đủ 11 bậc × 6 màu + semantic token 2 mode: theo bảng trong research doc — component CHỈ dùng semantic token, không hardcode hex.
- **Quy tắc màu cứng**: amber KHÔNG BAO GIỜ làm chữ (fail contrast) — chỉ làm nền, chữ tối `#0A2E26` đè lên; câu SAI dùng đỏ `#DE2127` (light) / red-400 (dark text) — LUÔN kèm icon ✗ (mù màu đỏ-lục); ĐÚNG dùng emerald + icon ✓; warning dùng cam cháy (KHÔNG dùng amber — đá vai CTA); dark mode: emerald text → bậc 300/400, amber fill lớn → desaturate `#E6AC4C`; coral `#E07A5F` chỉ trang trí.
- **Font (phương án C)**: **PhuDu** 500/700 — CHỈ display ≥24px (hero, tiêu đề section, song ngữ — một font cho cả Việt lẫn Anh, không đổi font theo locale); **Be Vietnam Pro** 400/500/700 — heading thường + body; **Inter** variable — UI + số liệu (`font-variant-numeric: tabular-nums`); **Lexend** 400 — chat học sinh. Qua `next/font/google`, subsets `['latin','vietnamese']`, chỉ load weight dùng thật. Line-height tiếng Việt ≥130%; đoạn chứa công thức KaTeX inline cũng ≥130% (KaTeX giữ font toán riêng — chuẩn ngành). CẤM Nunito cho body (lỗi dấu Việt đã ghi nhận).
- **Mascot**: đom đóm/đốm sáng, sáng dần theo tiến bộ. Mô hình cảm xúc **Forest, không Duolingo**: thưởng cộng dồn, nghỉ = mờ trung tính; CẤM mắt to nhìn chằm chằm (gợi giám sát), CẤM biểu cảm buồn/thất vọng khi sai/nghỉ (trừng phạt cảm xúc). Hai dạng: đốm sáng tối giản (icon) + dạng đầy đủ geometric cho teen (không baby-face).
- **Triết lý**: "Ngọc bất trác bất thành khí" + "ngọn đèn nhỏ đủ soi một trang sách" — tiến bộ nhỏ đo được, con chỉ so với chính mình hôm qua. **Slogan (chốt 05/08/2026)**: VN **"Hoàn thiện hơn mỗi ngày"** · EN **"A little brighter every day"**. Trong lockup, slogan luôn fit-to-width bằng khối chữ RANGI; mỗi ngôn ngữ có og:image riêng (`og-image.svg` VN / `og-image-en.svg` EN), không gộp hai ngôn ngữ vào một khung.
- **CẤM trong branding**: cụm "Đèn Đom Đóm" (trùng chương trình Dutch Lady); mọi ngôn ngữ cấm trong mục Ràng buộc sản phẩm bất biến vẫn áp dụng.

## Chiến lược test — ĐÃ CHỐT (04/08/2026, xem docs/research/nghien-cuu-chien-luoc-test.md)

**Công cụ**: pytest + pytest-django + factory_boy (backend; API qua `ninja.testing.TestClient`) | Vitest + React Testing Library + MSW (frontend) | Playwright **chỉ cài Chromium** (E2E: 10-20 smoke test critical path, <10 phút/PR) | DeepEval (eval LLM) + promptfoo (red-team jailbreak) + mutmut (mutation testing) — 3 món sau chỉ cài khi có tính năng LLM thật.

**Quy tắc:**

1. **Không lời gọi LLM/HTTP thật trong CI** — mock bằng `httpx.MockTransport` (cách chính chủ của Anthropic SDK) hoặc respx. KHÔNG dùng thư viện `responses` (SDK dùng httpx).
2. **Eval tách khỏi CI**: smoke-eval nhỏ (10-20 case, model rẻ) chỉ chạy trên PR đụng tới prompt; eval đầy đủ + mutation testing chạy nightly/định kỳ.
3. **Test DB là Postgres thật** (service container trong CI) — không SQLite (pgvector/JSONB sẽ cho test xanh giả). Tăng tốc: `--reuse-db`, `--no-migrations`.
4. **Celery**: unit test mock `.delay()`/`.apply_async()`; integration test dùng worker thật (pytest-celery). `task_always_eager` không được coi là bằng chứng đã test.
5. **SymPy là ground-truth đúng/sai Toán; LLM-as-judge chỉ chấm định tính** (văn phong, trình bày) — LLM-judge có bias hệ thống đã ghi nhận, không bao giờ đảo vai.
6. **SSE**: test generator backend với stream giả lập + 1-2 E2E smoke xác nhận UI; không cố mock EventSource trong Playwright. **Async Server Component**: không unit test, để E2E cover.
7. **Chống test giả (TDD với agent)**: trước khi viết implementation, phải chạy test và nêu rõ assertion nào đỏ, vì sao — không chấp nhận "đã có test đỏ" hình thức. Assert giá trị cụ thể (không chỉ `status==200`/không-throw). Mỗi test có ít nhất một case biên hoặc case sai.
8. **Coverage không có ngưỡng % cứng** — chỉ là tín hiệu tham khảo. Riêng module deterministic quan trọng (SymPy verify, mastery, calibration) chủ đích giữ coverage cao + mutation testing định kỳ.
9. **Dev-time**: agent dùng browser tool tự xác minh UI ngay sau khi sửa, rồi cập nhật smoke test tương ứng — công cụ agent nuôi bộ CI test, không thay thế nó.
10. **Seam chốt trước, test tại seam** (bổ sung 05/08/2026): test đặt tại ranh giới public (interface mà caller thật đi qua), KHÔNG test internals; các seam sẽ test phải được liệt kê trong plan và được duyệt cùng plan — không viết test tại seam chưa chốt. Nhận diện thêm một dạng test giả: **tautological test** — expected value tự tính lại theo đúng cách code tính (`expect(add(a,b)).toBe(a+b)`), pass by construction; expected phải đến từ nguồn độc lập (literal đã biết đúng, ví dụ giải tay, spec).

## Dữ liệu nhạy cảm — quy tắc cứng

**Dữ liệu cá nhân thật không bao giờ vào git**, kể cả khi repo private — đây là nghĩa vụ theo Luật BVDLCN, không chỉ vệ sinh kỹ thuật:

- Danh sách phụ huynh/học sinh thật, số điện thoại, email, tên trẻ em → chỉ để trong `private/` (đã gitignore) hoặc ngoài repo
- Đề thi thu thập có thông tin định danh trường/học sinh → ẩn danh trước khi đưa vào repo
- Secret, API key, connection string → `.env` (đã gitignore + chặn đọc), không hardcode
- Trước mỗi commit, soát staged files: có dữ liệu cá nhân/secret thì dừng và báo người dùng

## Tài liệu nguồn

Tất cả tài liệu nằm trong `docs/`, tra cứu qua chỉ mục **`docs/README.md`** — mỗi file một dòng kèm hook. Quy tắc: thêm file vào `docs/` thì phải thêm dòng index cùng lúc; không tham chiếu file ngoài repo; không duy trì danh sách tài liệu ở nơi thứ hai (index là nguồn duy nhất).

Khi phân vân về một quyết định sản phẩm hoặc pháp lý, tra `docs/README.md` trước khi hỏi lại từ đầu.
