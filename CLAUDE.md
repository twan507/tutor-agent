# CLAUDE.md — Flibby

Quy tắc làm việc cho AI agent trong repo này. Áp dụng cho mọi phiên làm việc, mọi agent.

## Dự án

**Flibby** — nền tảng gia sư AI **parent-first** cho thị trường Việt Nam. Bán quyền kiểm soát quá trình học cho phụ huynh, không chỉ bán khóa học. Không phải chatbot: hệ thống tạo lộ trình, dạy, kiểm tra, đo, điều chỉnh, báo cáo.

- **MVP**: Learning Sprint — ôn thi Toán THCS (lớp 8) trong 7-14 ngày
- **Moat**: learner profile + assessment intelligence + mastery tracking + parent reporting
- **Hạn cứng**: beta có người dùng thật **trước 15/08/2026** (lưới an toàn pháp lý 1 năm theo QĐ 33/2026/QĐ-TTg)

## Mô hình phân công: kiến trúc sư và subagent

Session chính (Fable/Opus) là **lớp kiến trúc sư — quản lý**, không phải thợ code. Vai trò: hiểu yêu cầu, thiết kế, ra quyết định, giao việc, review kết quả.

- **Trước mỗi task, tự đánh giá mức độ phù hợp để quyết định giao hay tự làm:**
  - **Tự làm trực tiếp** khi task nhỏ: sửa 1-2 file, tra cứu nhanh, chỉnh config, trả lời câu hỏi — tự làm vừa chính xác vừa đỡ tốn token, giao subagent chỉ thêm overhead.
  - **Giao subagent (model Sonnet)** khi là việc tay chân khối lượng lớn: viết code nhiều file theo spec đã chốt, tìm kiếm/khảo sát rộng trong codebase, tác vụ lặp đi lặp lại, các việc độc lập chạy song song được.
- Khi giao việc: đề bài phải tự đủ (spec rõ, đường dẫn file, tiêu chí hoàn thành kiểm chứng được). Subagent không có ngữ cảnh hội thoại.
- Kết quả subagent trả về phải được session chính **review trước khi chấp nhận** — kiến trúc sư chịu trách nhiệm cuối cùng về chất lượng.

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

## Tech stack đã chốt

- Frontend: **Next.js + shadcn/ui**
- Backend: **FastAPI** (Python)
- Data: **MongoDB Atlas** (event-sourced learner record) + **Redis**
- Storage: **R2/S3**
- Chi phí LLM: có model routing từ đầu, không dùng một model đắt cho mọi việc.

Không đổi stack khi chưa bàn với người dùng.

## Tài liệu nguồn

Tất cả nằm trong repo, chỉ tham chiếu đường dẫn tương đối (không tham chiếu file ngoài repo):

- `docs/bao-cao-du-an-gia-su-ai-parent-first.md` — báo cáo tổng hợp dự án, 18 mục (nguồn chính về sản phẩm, thị trường, lộ trình)
- `docs/bao-cao-phap-ly-ai-du-an-gia-su.md` — báo cáo pháp lý AI, 12 mục (nguồn chính về ràng buộc pháp lý; mục 4 và 7.1 là bảng kiểm soát thiết kế)
- `docs/nhat-ky-hoi-thoai-du-an-flibby.md` — nhật ký quá trình brainstorm và các quyết định (đọc mục 8 để nắm quyết định đã chốt)

Khi phân vân về một quyết định sản phẩm, tra tài liệu nguồn trước khi hỏi lại từ đầu.
