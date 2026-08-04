# CLAUDE.md — Flibby

Quy tắc làm việc cho AI agent trong repo này. Áp dụng cho mọi phiên làm việc, mọi agent.

## Dự án

**Flibby** — nền tảng gia sư AI **parent-first** cho thị trường Việt Nam. Bán quyền kiểm soát quá trình học cho phụ huynh, không chỉ bán khóa học. Không phải chatbot: hệ thống tạo lộ trình, dạy, kiểm tra, đo, điều chỉnh, báo cáo.

- **MVP** (định hướng): Learning Sprint — ôn thi Toán THCS trong 7-14 ngày
- **Moat**: learner profile + assessment intelligence + mastery tracking + parent reporting

**QUAN TRỌNG — trạng thái tài liệu**: toàn bộ kiến trúc, kế hoạch triển khai, tech stack trong `docs/` là **bản nháp định hướng (demo)**, KHÔNG phải quyết định cuối. Trước khi triển khai bất kỳ phần nào, người dùng sẽ nghiên cứu lại phần đó và chốt riêng. Agent không được coi chữ "đã chốt" trong docs là căn cứ để tự build — mọi phần chỉ build sau khi người dùng xác nhận trong hội thoại.

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
2. **Kỷ luật git**: khi dự án đã có code chạy, làm feature/fix trên nhánh riêng (`feat/...`, `fix/...`), không commit thẳng main. Commit theo Conventional Commits (`feat:`, `fix:`, `docs:`, `chore:`, `test:`...), commit nhỏ một mục đích. Chỉ commit/push khi người dùng yêu cầu.
3. **Không bypass cơ chế kiểm soát**: cấm `--no-verify`, force push, `rm -rf`, sửa `.env*` / `.claude/settings.json` / `.claude/hooks/` — các lệnh này đã bị chặn cứng bằng hook trong `.claude/settings.json`; gặp chặn thì báo người dùng, không tìm đường vòng.
4. **Không tuyên bố hoàn thành khi chưa có bằng chứng**: chạy lệnh kiểm chứng (test/lint/build), xem output thật, rồi mới báo xong kèm output đó. Test fail thì báo fail nguyên trạng.

**Quy trình feature chuẩn** (dùng skill superpowers có sẵn):

```
brainstorm (skill brainstorming)
→ plan — NGƯỜI DÙNG DUYỆT trước khi code (skill writing-plans)
→ TDD: test đỏ trước, code sau (skill test-driven-development)
→ review bằng subagent code-reviewer (.claude/agents/code-reviewer.md, context sạch)
→ verify bằng chứng thật (skill verification-before-completion)
→ merge
```

Spec/design doc lưu tại `docs/specs/YYYY-MM-DD-<chủ-đề>.md` (nhớ thêm dòng vào `docs/README.md`). Backlog công việc theo dõi trong `TASKS.md` ở gốc repo.

Hai gate không được nhảy qua: **plan phải được duyệt** và **test phải đỏ trước khi viết implementation**.

## Quy tắc bộ nhớ (memory/)

Bộ nhớ dự án là file-based, nằm trong repo tại `memory/`, git-track được. Không dùng vector DB, không dùng knowledge graph — quy mô memory của một dự án không cần đến (xem `docs/nghien-cuu-ky-thuat-agent-memory.md`).

**Cấu trúc:**

```
memory/
├── MEMORY.md      # chỉ mục — TRẦN CỨNG 150 dòng, đọc đầu mỗi phiên làm việc
├── semantic/      # fact dự án: kiến trúc, quyết định sản phẩm đã chốt
├── procedural/    # quy ước làm việc: cách phân công, deploy, test
└── episodic/      # nhật ký quyết định theo phiên (được phép cũ đi)
```

**Bốn quy tắc:**

1. **Index nhỏ, lazy-load chi tiết**: `MEMORY.md` chỉ chứa mỗi memory một dòng (tên + hook). Trần cứng 150 dòng — vượt là phải thu gọn trước khi thêm mới. Chi tiết nằm trong file con, chỉ đọc khi cần.
2. **Mỗi memory một file**, có frontmatter: `name`, `type` (semantic/procedural/episodic), `created`, `modified`, `description` một dòng. Đặt file đúng thư mục theo type.
3. **Reflection cuối phiên lớn**: trước khi kết thúc phiên làm việc có thay đổi đáng kể, tự hỏi: (a) có insight bậc cao nào đáng ghi thay vì chỉ fact rời rạc? (b) memory mới có mâu thuẫn với memory cũ nào không? (c) memory nào đã sai/hết hạn cần sửa hoặc xóa? Rồi cập nhật memory/ tương ứng.
4. **Memory sai thì sửa hoặc xóa ngay khi phát hiện**, không để tồn. Không ghi vào memory những gì repo đã ghi (code, git history, CLAUDE.md) — memory chỉ chứa thứ không suy ra được từ repo.

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
- Ngôn ngữ sản phẩm — không bao giờ dùng:
  - ~~"thay thế gia sư"~~ → định vị là công cụ bổ trợ ngoài nhà trường
  - ~~"dự đoán điểm thi"~~ → dùng **"mức sẵn sàng theo đề mô phỏng"**
  - ~~"chứng chỉ"~~, ~~"tương đương điểm thi"~~, ~~"xếp loại học lực"~~
- Giao diện phải có nhãn minh bạch AI (người dùng biết đang tương tác với AI).

## Tech stack (định hướng — chốt lại từng phần trước khi build)

- Frontend: Next.js + shadcn/ui
- Backend: FastAPI (Python)
- Data: MongoDB Atlas + Redis
- Storage: R2/S3
- Chi phí LLM: có model routing từ đầu, không dùng một model đắt cho mọi việc.

Đây là định hướng từ bản nháp, không phải cam kết. Trước khi dựng phần nào (scaffold, CI, toolchain), xác nhận lại stack của phần đó với người dùng.

## Dữ liệu nhạy cảm — quy tắc cứng

**Dữ liệu cá nhân thật không bao giờ vào git**, kể cả khi repo private — đây là nghĩa vụ theo Luật BVDLCN, không chỉ vệ sinh kỹ thuật:

- Danh sách phụ huynh/học sinh thật, số điện thoại, email, tên trẻ em → chỉ để trong `private/` (đã gitignore) hoặc ngoài repo
- Đề thi thu thập có thông tin định danh trường/học sinh → ẩn danh trước khi đưa vào repo
- Secret, API key, connection string → `.env` (đã gitignore + chặn đọc), không hardcode
- Trước mỗi commit, soát staged files: có dữ liệu cá nhân/secret thì dừng và báo người dùng

## Tài liệu nguồn

Tất cả tài liệu nằm trong `docs/`, tra cứu qua chỉ mục **`docs/README.md`** — mỗi file một dòng kèm hook. Quy tắc: thêm file vào `docs/` thì phải thêm dòng index cùng lúc; không tham chiếu file ngoài repo; không duy trì danh sách tài liệu ở nơi thứ hai (index là nguồn duy nhất).

Khi phân vân về một quyết định sản phẩm hoặc pháp lý, tra `docs/README.md` trước khi hỏi lại từ đầu.
