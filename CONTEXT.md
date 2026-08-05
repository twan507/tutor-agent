# CONTEXT — bảng thuật ngữ chung (ubiquitous language)

Glossary song ngữ của dự án Rangi: mỗi khái niệm domain có **một tên VN canonical** (dùng trong hội thoại, UI, tài liệu) và **một tên EN canonical** (dùng trong code: biến, hàm, model, bảng DB). Agent và người dùng cùng nói một ngôn ngữ — không dịch tùy hứng, không đồng nghĩa tùy tiện.

Quy tắc file này:

- **Chỉ là glossary.** Không chứa implementation detail, không làm scratch pad, không chép quy tắc đã có ở CLAUDE.md.
- **Có ý kiến.** Nhiều từ cùng nghĩa → chọn một từ tốt nhất, các từ còn lại vào `_Tránh_`.
- **Định nghĩa 1-2 câu.** Nói nó LÀ gì, không tả nó làm gì.
- Thuật ngữ mới xuất hiện hoặc bị thách thức trong hội thoại → cập nhật file này **ngay trong phiên**, không dồn cuối.
- Nguồn gốc định nghĩa: rút từ `docs/background/bao-cao-du-an-gia-su-ai-parent-first.md` và CLAUDE.md. Docs background là bản nháp định hướng — thuật ngữ ở đây là ngôn ngữ làm việc hiện hành, người dùng có quyền sửa bất kỳ lúc nào.

## Người và vai trò

**Phụ huynh** · `parent`:
Người mua và người đặt mục tiêu học — sản phẩm là parent-first, bán quyền kiểm soát quá trình học cho họ.
_Tránh_: khách hàng, user (khi chỉ phụ huynh)

**Học sinh** · `student`:
Trẻ đang học trên nền tảng; người dùng cuối của phần dạy học nhưng không phải người mua.
_Tránh_: learner (khi chỉ người), con (trong code), user

**Hồ sơ người học** · `learner_profile`:
Tập biến hành vi có bằng chứng khoa học về một học sinh: kiến thức nền, attention span đo được, phản ứng với feedback, tốc độ làm bài, mức phụ thuộc hint. KHÔNG BAO GIỜ chứa learning styles (visual/auditory/kinesthetic — đã bị bác bỏ) hay dữ liệu sinh trắc.
_Tránh_: learning style, student profile

## Học tập

**Sprint học** · `learning_sprint`:
Gói học ngắn hạn 7-14 ngày có mục tiêu rõ, deadline rõ, test đầu vào, lộ trình riêng, test đầu ra và báo cáo kết quả. Là wedge vào thị trường của MVP.
_Tránh_: khóa học, course, chương trình học

**Lộ trình học** · `learning_path`:
Kế hoạch học cá nhân hóa sinh từ kết quả chẩn đoán + skill graph: milestone, lịch học, bài học, bài luyện, bài kiểm tra, tiêu chí hoàn thành, điều kiện điều chỉnh.
_Tránh_: roadmap, curriculum, giáo trình

**Buổi học** · `learning_session`:
Một phiên tương tác dạy-học liên tục giữa học sinh và AI; state lưu Postgres mỗi turn.
_Tránh_: session (không định ngữ — trùng session auth), chat (buổi học ≠ đoạn chat)

**Skill graph** · `skill_graph`:
Bản đồ kỹ năng cần học dạng đồ thị có prerequisites, xương sống là yêu cầu cần đạt GDPT 2018. Không có nó thì "cá nhân hóa" chỉ là đổi chủ đề bề mặt.
_Tránh_: knowledge graph, cây kiến thức, syllabus

**Kỹ năng** · `skill`:
Một node trong skill graph — đơn vị nhỏ nhất được theo dõi mastery.
_Tránh_: topic, chủ đề (chủ đề là nhóm kỹ năng, không phải kỹ năng)

**Teaching policy** · `teaching_policy`:
State machine ở code quyết định bước dạy, chuyển bước, kéo học sinh về chủ đề — deterministic và test được; prompt chỉ lo diễn đạt.
_Tránh_: prompt dạy học, teaching flow

## Đánh giá

**Item** · `assessment_item`:
Đơn vị đánh giá nhỏ nhất: một câu hỏi/bài tập kèm skill tags, độ khó, đáp án, lời giải, distractor gắn lỗi thường gặp, trạng thái kiểm chứng. Item Toán phải qua verify tự động (SymPy) trước khi vào hàng review.
_Tránh_: câu hỏi, bài tập, question, exercise (dùng chung chung — item là thuật ngữ kỹ thuật có cấu trúc)

**Lượt làm** · `attempt`:
Một lần học sinh làm một item, ghi nhận từng bước làm, thời gian, hint đã dùng — không chỉ đáp án cuối. Là dữ liệu thô nuôi mastery và calibration.
_Tránh_: submission, answer, bài nộp

**Chẩn đoán đầu vào** · `diagnostic`:
Bài test 15-20 câu theo blueprint chương sắp thi, làm ở buổi đầu sprint để định vị lỗ hổng; chấp nhận độ chính xác vừa phải, tinh chỉnh dần qua các ngày học.
_Tránh_: placement test, bài kiểm tra đầu vào

**Blueprint** · `exam_blueprint`:
Ma trận đề: cấu trúc phân bố kỹ năng/độ khó của một kỳ thi cụ thể, dùng để sinh diagnostic và đề mô phỏng.
_Tránh_: ma trận (không định ngữ), cấu trúc đề

**Đề mô phỏng** · `mock_exam`:
Đề thi nội bộ mô phỏng theo blueprint — kết quả CHỈ được diễn đạt là "mức sẵn sàng theo đề mô phỏng".
_Tránh_: đề dự đoán, đề thi thử (gợi ý tương đương đề thật)

**Mức sẵn sàng** · `readiness`:
Ước lượng mức chuẩn bị của học sinh cho một kỳ thi dựa trên đề mô phỏng. Đây là từ BẮT BUỘC thay cho mọi biến thể "dự đoán điểm".
_Tránh_: dự đoán điểm thi, điểm dự kiến, predicted score

**Calibration** · `calibration`:
Vòng lặp hiệu chỉnh độ khó item từ dữ liệu lượt làm thật (ngưỡng ~30 attempts); độ khó AI gán lúc sinh chỉ là ước lượng. Dữ liệu calibration tích lũy là một phần moat.
_Tránh_: tinh chỉnh (chung chung), difficulty adjustment

**Kiểm chứng item** · `verification`:
Bước xác nhận đáp án/lời giải item bằng công cụ deterministic (SymPy, code execution) trước khi item vào hàng human review. SymPy là ground-truth đúng/sai Toán, không phải LLM.
_Tránh_: validation (trùng nghĩa validate form), AI check

## Theo dõi và báo cáo

**Mức thành thạo** · `mastery`:
Ước lượng mức nắm vững của học sinh trên TỪNG kỹ năng (không phải điểm trung bình), tính từ đúng/sai, số lần thử, hint, thời gian, lỗi lặp lại, độ khó item. Trạng thái lưu trữ: `mastery_state`; tích lũy theo thời gian là switching cost chính.
_Tránh_: điểm, score, proficiency, trình độ

**Bản đồ năng lực** · `mastery_map`:
Toàn cảnh mastery của một học sinh trên skill graph — thứ phụ huynh nhìn thấy tiến bộ, và là thứ mất đi nếu rời nền tảng.
_Tránh_: bảng điểm, learning report (đó là parent report)

**Báo cáo phụ huynh** · `parent_report`:
Báo cáo ROI học tập cho phụ huynh: mục tiêu ban đầu, điểm đầu vào, lỗ hổng chính, tiến bộ theo giai đoạn, lỗi đã giảm, mức sẵn sàng, bằng chứng before/after, hành động đề xuất. Đọc trong 3 phút hiểu ngay. Học sinh thấy đúng những gì phụ huynh thấy.
_Tránh_: report (không định ngữ), bảng điểm, thống kê học tập

**Digest** · `daily_digest`:
Thông báo tự động duy nhất mỗi ngày mỗi trẻ gửi phụ huynh, giọng trung tính mô tả sự kiện. Không realtime từng câu sai, không so sánh với trẻ khác.
_Tránh_: notification (chung chung), alert, cảnh báo

**Bằng chứng học tập** · `learning_evidence`:
Hiện vật cụ thể chứng minh tiến bộ: bài làm before/after, lỗi đã hết lặp lại — thứ làm báo cáo đáng tin thay cho lời khẳng định.
_Tránh_: kết quả học tập, thành tích

**Lỗi thường gặp** · `misconception`:
Một hiểu sai có hệ thống đã được danh mục hóa trong skill graph, gắn với distractor của item và dùng để chữa lỗi có địa chỉ.
_Tránh_: lỗi sai (chung chung), error, mistake
