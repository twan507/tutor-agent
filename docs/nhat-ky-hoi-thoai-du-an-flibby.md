# Nhật ký hội thoại: Dự án Flibby (nền tảng gia sư AI parent-first)

Lưu trữ toàn bộ quá trình brainstorm, phản biện, nghiên cứu pháp lý và chọn tên thương hiệu.
Thời gian: 02/07/2026 – 13/07/2026

Tài liệu này là bản ghi quá trình tư duy. Hai sản phẩm chính thức của quá trình này là:
- `bao-cao-du-an-gia-su-ai-parent-first.md` (báo cáo tổng hợp dự án, 18 mục)
- `bao-cao-phap-ly-ai-du-an-gia-su.md` (báo cáo pháp lý AI, 12 mục)

---

## MỤC LỤC

1. Ý tưởng gốc và phản biện đầu tiên
2. Bản kế hoạch V1 và phản biện lần hai
3. Báo cáo tổng hợp dự án (sản phẩm 1)
4. Nghiên cứu pháp lý: Luật TTNT và QĐ 33/2026 (sản phẩm 2)
5. Đánh giá tính khả thi và điều chỉnh lập luận
6. Tác động từ thông báo của Bộ GDĐT
7. Hành trình chọn tên thương hiệu (10 vòng)
8. Tổng kết các quyết định đã chốt

---

## 1. Ý TƯỞNG GỐC VÀ PHẢN BIỆN ĐẦU TIÊN

### 1.1 Ý tưởng ban đầu (V0)

Nền tảng giáo dục thay thế gia sư, gồm 2 khối chức năng:
- Khối 1 (phụ huynh/giáo viên/gia sư): upload tài liệu, AI chuẩn hóa bằng tư duy + web search, đóng gói thành khóa học
- Khối 2 (học sinh): tiếp nhận khóa học dưới nhiều hình thức (bài tập, lý thuyết, trắc nghiệm, tự luận), lưu 100% lịch sử học bao gồm chat, AI adapt giáo trình tiếp theo

Giả định ban đầu: "Nền tảng không cần chứa dữ liệu gì, chỉ cần một model AI tốt với các MCP, tool và skill phù hợp."

Tầm nhìn dài hạn: marketplace gia sư kiểu "Shopee cho giáo dục".

### 1.2 Phản biện: 5 điểm cốt lõi

**Mâu thuẫn cốt lõi: "nền tảng không cần chứa dữ liệu" là sai**

Mô tả sản phẩm tự chứng minh điều ngược lại: tài liệu upload, khóa học đóng gói, 100% lịch sử học, log chat, bộ tiêu chuẩn đánh giá — tất cả đều là dữ liệu, và là phần giá trị nhất. Model AI là commodity: Anthropic, OpenAI, Google bán cho tất cả mọi người cùng một giá; đối thủ copy được model trong một ngày.

Thứ không copy được:
1. Pipeline chuẩn hóa tài liệu thành khóa học có cấu trúc
2. Hồ sơ năng lực từng học sinh tích lũy theo thời gian
3. Bộ taxonomy và tiêu chuẩn đánh giá

Kết luận: đây là nền tảng dữ liệu học tập, AI chỉ là engine. Kiến trúc MongoDB event-sourced cho learner record phải thiết kế từ Sprint 1.

**Định vị "thay thế gia sư" sai cho thị trường Việt Nam**

Bằng chứng khoa học ủng hộ AI tutoring là có thật (RCT Harvard: sinh viên học nhiều hơn trong thời gian ngắn hơn so với lớp active learning; RCT LearnLM tại 5 trường Anh: học sinh được AI hỗ trợ giải bài mới tốt hơn học sinh học với gia sư người, 66,2% vs 60,7%).

Nhưng ở Việt Nam, phụ huynh trả tiền gia sư không chỉ mua kiến thức — họ mua **sự giám sát, kỷ luật, động lực và một người chịu trách nhiệm báo cáo**. AI chưa thay được ba thứ sau.

Định vị bán được: "nhân bản gia sư" — một gia sư giỏi dùng nền tảng để phục vụ 100 học sinh thay vì 10. Nhất quán với marketplace tương lai (không thể vừa tuyên bố thay thế gia sư vừa mời gia sư lên làm supply).

Dữ liệu RCT Stanford ủng hộ mô hình lai: gia sư dùng công cụ AI hỗ trợ giúp học sinh tiến bộ hơn 4 điểm phần trăm; riêng nhóm gia sư yếu cải thiện tới 9 điểm phần trăm — AI nâng sàn chất lượng gia sư.

**Adaptive learning khó hơn hình dung**

"AI adapt giáo trình" không tự xảy ra nhờ LLM đọc lịch sử chat. Cần ba tầng:
1. **Taxonomy kiến thức**: mỗi bài tập, câu hỏi gắn tag vào đơn vị năng lực cụ thể
2. **Mastery model**: ước lượng mức thành thạo từ dữ liệu làm bài (knowledge tracing đã có 30 năm nghiên cứu — đừng phát minh lại)
3. **Policy chọn nội dung tiếp theo**

Bỏ qua tầng 1 thì "adapt" chỉ là LLM đoán mò cảm tính.

Gợi ý cho K-12 Việt Nam: dùng **"yêu cầu cần đạt" theo môn, theo lớp của Chương trình GDPT 2018** làm xương sống taxonomy — chuẩn quốc gia có sẵn, miễn phí, phụ huynh và giáo viên đều hiểu.

Bắt đầu với một môn, một cấp: **Toán THCS** (chấm khách quan, nhu cầu cao nhất).

**Bốn lỗ hổng thiết kế chưa nhắc tới**

1. **Human-in-the-loop khi chuẩn hóa tài liệu**: AI "tư duy và web search" sẽ hallucinate; sai kiến thức trong giáo dục là lỗi không tha thứ được. Bắt buộc bước duyệt của người upload trước khi publish — biến giáo viên thành tầng QA.
2. **Chống gian lận**: học sinh sẽ dùng ChatGPT làm hộ bài. Đánh giá phải dựa trên quá trình (ghi nhận từng bước, hỏi vấn đáp ngẫu nhiên), không chỉ đáp án cuối.
3. **Báo cáo phụ huynh**: killer feature ở Việt Nam chưa được liệt kê — báo cáo tuần tự động chính là thứ gia sư dùng để giữ hợp đồng, và là thứ nền tảng làm tốt hơn con người.
4. **Chi phí inference**: chi phí LLM trên mỗi học sinh hoạt động có thể ăn hết margin. Cần model routing từ đầu.

**Pháp lý: hai điểm ảnh hưởng trực tiếp**

1. "Lưu 100% lịch sử" va chạm Luật BVDLCN 91/2025/QH15 (hiệu lực 1/1/2026): với trẻ em, người đại diện theo pháp luật thay mặt thực hiện quyền; dữ liệu trẻ em bảo vệ ở mức cao hơn; quyền yêu cầu xóa. Log chat có thể chứa dữ liệu nhạy cảm. Cần consent flow, chính sách lưu trữ, cơ chế xóa/ẩn danh hóa từ ngày đầu.
2. Khung dạy thêm (TT 29/2024, TT 19/2026 hiệu lực 15/5/2026) lại là **cơ hội**: giáo viên đang gánh chi phí tuân thủ đáng kể. Lưu ý: STEM, STEAM, năng lực số, AI, kỹ năng sống **không bị coi là dạy thêm**.

**Cạnh tranh: cửa chưa đóng nhưng đang hẹp lại**

ĐHQGHN hợp tác Z.AI phát triển Gia sư AI, PoC đạt 8,7/10 điểm tháng 3/2026, định hướng K-12 đa môn kèm công cụ theo dõi cho học sinh/phụ huynh/giáo viên. Cạnh tranh trực diện về chatbot giải bài là thua chắc.

Điểm khác biệt cần giữ chặt: (1) pipeline để gia sư tự đóng gói tài liệu thành khóa học chuẩn hóa; (2) hồ sơ năng lực học sinh xuyên khóa học.

**Lộ trình đề xuất**
- GĐ1: công cụ cho gia sư (B2B2C) — giải quyết cold start
- GĐ2: hoàn thiện learner model trên dữ liệu thật
- GĐ3: mở marketplace khi đã có supply + demand

**Về "Shopee giáo dục"**: phép so sánh này che mất bản chất moat. Udemy là marketplace thuần và bị commodity hóa. Network effect thật sự không phải cái chợ — mà là **hồ sơ năng lực học sinh đi theo các em xuyên qua mọi khóa học, mọi gia sư**. Học sinh đổi gia sư nhưng không rời nền tảng vì lịch sử học nằm ở đó.

---

## 2. BẢN KẾ HOẠCH V1 VÀ PHẢN BIỆN LẦN HAI

### 2.1 Những gì bản V1 đã sửa đúng

Bản kế hoạch (do AI khác soạn) đã tiếp thu ba phản biện cốt lõi:
- Dữ liệu là moat (sửa giả định "không cần dữ liệu")
- Pháp lý trẻ em (sửa "lưu 100% lịch sử")
- Human review nội dung

Và bổ sung các quyết định tốt:
- **Parent-first** thay vì tutor-first (chốt)
- **Wedge Learning Sprint**: gói học ngắn hạn có mục tiêu, deadline, test đầu vào/ra, báo cáo ROI
- 8 engine lõi: Goal Intake, Learner Profiling, Knowledge/Skill Graph, Assessment Intelligence, Curriculum Planning, AI Teaching, Mastery Tracking, Parent Reporting
- Tech stack: Next.js + shadcn/ui + FastAPI + MongoDB Atlas + Redis + R2/S3
- Danh sách "không làm sớm" (kỷ luật scope)

### 2.2 Phản biện lần hai: 5 vấn đề còn lại

**RỦI RO SỐ 1: Khoảng trống thực thi của mô hình parent-first**

Mâu thuẫn nội tại chưa được giải: thesis nói phụ huynh **thiếu thời gian** theo sát con, nhưng mô hình vận hành lại giả định học sinh THCS **tự ngồi học với AI 45 phút mỗi ngày trong 10-14 ngày liên tục**.

Ai ép con ngồi vào bàn?

Gia sư người giải quyết bằng hiện diện vật lý và áp lực xã hội — đây là **một nửa giá trị phụ huynh trả tiền**, và là thứ AI không có. "Mascot nhắc nhẹ" không đủ.

Cần thiết kế tầng accountability tường minh:
- Notification tức thời cho phụ huynh khi con bỏ buổi
- Cam kết ba bên lúc mua gói
- Session rút xuống 20-25 phút thay vì 45

**Đây phải là giả thuyết số 1 cần kiểm chứng ở private beta, trước cả chất lượng nội dung.** Nếu completion rate thấp, mọi engine phía sau vô nghĩa.

Liên quan: bỏ hướng tutor-first chấp nhận được về product, nhưng **đừng bỏ gia sư/giáo viên khỏi phương trình phân phối**. CAC quảng cáo tới phụ huynh giáo dục rất đắt; sprint đầu vài trăm nghìn gần như chắc chắn lỗ CAC nếu chạy ads lạnh. Kênh rẻ nhất: giáo viên và hội nhóm phụ huynh — giữ họ làm **kênh referral có hoa hồng**, không phải user.

**RỦI RO SỐ 2: Đối thủ thật bị bỏ sót**

Bản V1 gạt đối thủ quốc tế vì "không bản địa hóa" — sai. **ChatGPT và Gemini không cần bản địa hóa marketing vẫn đang nằm trong điện thoại học sinh Việt Nam, miễn phí, kèm study mode dẫn dắt từng bước.**

Câu hỏi định vị phải trả lời không phải "tại sao chọn X thay vì VioEdu" mà là **"tại sao trả 400 nghìn khi ChatGPT free đã giảng bài được"**.

Câu trả lời đúng — cấu trúc lộ trình, đo lường, báo cáo bằng chứng — cần viết thẳng vào định vị và sales script.

**RỦI RO SỐ 3: Alignment với đề thi thật của từng trường**

Wedge ôn thi là dao hai lưỡi: điểm thi thật là ground truth công khai xuất hiện ngay sau sprint. Nếu con đạt 78% đề mô phỏng nội bộ nhưng thi thật 6 điểm → phụ huynh đổ lỗi cho sản phẩm, word-of-mouth chết.

Vấn đề: đề kiểm tra THCS mỗi trường mỗi khác về ma trận và độ khó. Gia sư người xử lý bằng cách xin đề cũ của đúng trường đó.

**Thiếu hẳn feature này**: cho phụ huynh/học sinh upload đề cũ hoặc ma trận đề, AI align đề mô phỏng theo đó. Với pipeline PDF-to-Markdown sẵn có, đây là feature rẻ mà giá trị cao.

Gap format chưa nhận diện: MVP luyện qua trắc nghiệm/điền đáp số (chấm tự động), nhưng **thi THCS phần lớn là tự luận viết tay**. Chấm ảnh bài viết tay tiếng Việt là bài toán vision khó — chưa cần làm ở MVP, nhưng phải ghi nhận rủi ro learning transfer và **không hứa "đề mô phỏng dự đoán điểm thi"**. Dùng ngôn ngữ "mức sẵn sàng theo đề mô phỏng".

**LỖI CHUYÊN MÔN: "Phong cách học" trong Learner Profiling**

Learning styles (visual/auditory/kinesthetic) là **khái niệm đã bị bác bỏ** trong nghiên cứu giáo dục — không có bằng chứng rằng dạy theo "phong cách học" cải thiện kết quả; đồng thuận khoa học coi đây là neuromyth.

Đưa nó vào learner profile là đưa pseudoscience vào lõi hệ thống và lãng phí chiều dữ liệu.

Thay bằng các biến có evidence: kiến thức nền, attention span thực đo được, phản ứng với từng loại feedback, tốc độ làm bài, mức phụ thuộc hint.

**NÂNG CẤP ASSESSMENT ENGINE: hai vòng lặp còn thiếu**

1. **Item calibration**: "Độ khó" do AI gán lúc sinh item là ước lượng, không phải độ khó thật. Adaptive dựa trên độ khó đoán sẽ sai có hệ thống. Cần: item đạt ~30 attempts thì recalibrate độ khó từ tỷ lệ đúng thực tế.
2. **Math verification tự động**: lợi thế của việc chọn Toán — AI sinh item, SymPy/code execution verify đáp án số học tự động trước khi founder review.

Diagnostic test đầu vào: chốt 15-20 câu theo blueprint chương sắp thi. Dài hơn thì học sinh nản ngay buổi đầu.

**KINH TẾ SPRINT: mùa vụ và con đường sang subscription**

Sprint bán theo sự kiện thi — mỗi học sinh tối đa ~4 kỳ kiểm tra lớn/năm học. Doanh thu dồn vào tháng 10-12 và 3-5; hè gần như chết trừ gói lấy lại gốc. **LTV mô hình sprint thuần rất mỏng.**

Bản V1 có liệt kê subscription nhưng chưa thiết kế con đường chuyển đổi. Đề xuất: cuối mỗi sprint, báo cáo chỉ ra lỗ hổng chưa vá kèm lộ trình duy trì — đó là cửa bán subscription "giữ nhịp chống quên" giá thấp giữa các kỳ thi. Mastery state tích lũy là switching cost.

KPI bổ sung: **delta điểm thi thật trước/sau**, thu thập từ phụ huynh — đề mô phỏng nội bộ dễ rơi vào teaching to the test của chính mình.

### 2.3 Ba việc phải làm trước khi code tiếp

1. Thiết kế tầng accountability phụ huynh - học sinh vào luồng sprint
2. Thêm feature upload đề cũ / ma trận đề vào scope MVP
3. Xóa learning styles khỏi learner profile

**Giả thuyết cần kiểm chứng đầu tiên ở private beta không phải chất lượng AI — mà là liệu học sinh có hoàn thành sprint hay không.**

---

## 3. BÁO CÁO TỔNG HỢP DỰ ÁN (SẢN PHẨM 1)

File: `bao-cao-du-an-gia-su-ai-parent-first.md` — 18 mục + phụ lục.

Cấu trúc:
1. Tóm tắt điều hành
2. Quá trình tiến hóa ý tưởng và các pivot (5 pivot đã thực hiện)
3. Thesis, định vị và thông điệp (kèm kịch bản trả lời objection ChatGPT)
4. Phân tích thị trường (đặc điểm cầu, tính mùa vụ, khách hàng mục tiêu, pháp lý, bằng chứng khoa học)
5. Phân tích cạnh tranh (nội địa, ChatGPT/Gemini, quốc tế, khoảng trống chiến lược)
6. Kiến trúc sản phẩm: 8 engine + Accountability Layer
7. Chiến lược dữ liệu
8. Pháp lý, quyền riêng tư, an toàn trẻ em
9. Tech stack và kiến trúc kỹ thuật (kèm bảng model routing)
10. Kế hoạch MVP
11. Lộ trình triển khai (4 giai đoạn, 2 kịch bản full-time/part-time)
12. Go-to-market và marketing (kênh xếp theo CAC, lịch bám mùa thi)
13. Mô hình kinh doanh và unit economics
14. KPI và tiêu chí sống chết
15. Sổ rủi ro (11 rủi ro)
16. Thương hiệu
17. Quyết định đã chốt và còn mở
18. Việc cần làm ngay (2 tuần tới)

Lưu ý: mọi con số giá và ngưỡng KPI trong báo cáo được đánh dấu là **giả thuyết để kiểm chứng**, không phải kết luận.

---

## 4. NGHIÊN CỨU PHÁP LÝ: LUẬT TTNT VÀ QĐ 33/2026 (SẢN PHẨM 2)

File: `bao-cao-phap-ly-ai-du-an-gia-su.md` — 12 mục + 2 phụ lục.

### 4.1 Bối cảnh

Người dùng cung cấp bản scan Quyết định 33/2026/QĐ-TTg (5 trang) ban hành Danh mục hệ thống AI rủi ro cao. Yêu cầu: đọc, kiểm chứng trên internet, viết báo cáo pháp lý đầy đủ bao gồm cả hướng "lách" để tránh vi phạm.

### 4.2 Kết quả xác thực

Cả ba tầng văn bản đều là thật, đã kiểm chứng chéo:

| Văn bản | Hiệu lực | Nội dung |
|---|---|---|
| Luật Trí tuệ nhân tạo 134/2025/QH15 | 01/03/2026 | 8 chương 35 điều; phân loại 3 mức rủi ro; hành vi cấm; đánh giá sự phù hợp |
| Nghị định 142/2026/NĐ-CP | 01/05/2026 | Nguyên tắc phân loại; tiêu chí và loại trừ; hồ sơ phân loại rủi ro |
| Quyết định 33/2026/QĐ-TTg | 15/08/2026 | Danh mục AI rủi ro cao 6 lĩnh vực (giáo dục đứng đầu) |

QĐ 33 do Phó Thủ tướng Hồ Quốc Dũng ký ngày 30/06/2026, được Cổng TTĐT Chính phủ đưa tin 02/07/2026 — khớp bản scan.

Lưu ý: các điều kiện thu hẹp "Chỉ áp dụng khi..." chỉ có trong bản scan; báo chí không đăng. Cần đối chiếu bản Công báo.

### 4.3 Ba mục giáo dục trong Danh mục và cách dự án đứng ngoài

**Mục 1: AI cung cấp nội dung tự học, có sử dụng nguồn dữ liệu KHÔNG KIỂM SOÁT**

Điều kiện: (i) cung cấp nội dung tự động cho tự học theo chương trình giáo dục; (ii) dữ liệu nội dung đưa vào **không có kiểm soát**; (iii) triển khai quy mô lớn tạo rủi ro hệ thống.

Dự án phủ định (ii): pipeline có kiểm soát — nguồn giới hạn (GDPT 2018, item tự sinh từ skill graph), SymPy verification cho Toán, human review trước publish, trạng thái kiểm chứng trên từng item.

Ranh giới không vượt: cho AI tự do web search rồi publish thẳng nội dung học tập.

**Mục 2: AI tự động kiểm tra, đánh giá, XẾP HẠNG người học**

Điều kiện: (i) kiểm tra đánh giá tự động; (ii) kết quả dùng làm **căn cứ chính thức**; (iii) thực hiện **trong hệ thống giáo dục quốc dân**.

Dự án phủ định (ii) và (iii): đánh giá formative, không tạo hiệu lực chính thức; công cụ bổ trợ ngoài nhà trường.

Ba ranh giới thành chính sách sản phẩm:
1. Không ký hợp đồng với trường để điểm/mastery làm căn cứ đánh giá, xếp loại, lên lớp
2. **Không leaderboard xuyên học sinh**
3. Không ngôn ngữ "chứng chỉ", "tương đương điểm thi", "xếp loại học lực"

**Mục 3: AI GIÁM SÁT, PHÂN TÍCH HÀNH VI người học**

Điều kiện: dùng **dữ liệu sinh trắc học** (khuôn mặt, ánh mắt, hành vi, cảm xúc) HOẶC cơ chế **cảnh báo tự động tần suất cao** gây căng thẳng tâm lý/xâm phạm riêng tư.

Đây là mục sát dự án nhất (accountability layer đúng nghĩa là giám sát hành vi học tập).

Quy tắc cứng vĩnh viễn: **không camera, không mic, không nhận diện khuôn mặt/ánh mắt, không suy luận cảm xúc hay mức tập trung.**

Thiết kế notification phải phủ định "tần suất cao" và "gây căng thẳng":
- Trần cứng: tối đa 1 thông báo tự động/ngày/trẻ (dạng digest)
- Giọng trung tính, mô tả sự kiện, không so sánh với trẻ khác
- Minh bạch hai chiều: học sinh thấy đúng những gì phụ huynh thấy
- Không cảnh báo realtime từng câu sai

### 4.4 Phân loại đề xuất: RỦI RO TRUNG BÌNH

Dự án không thuộc Danh mục rủi ro cao, nhưng là hệ thống AI tương tác trực tiếp với người dùng → tự phân loại **rủi ro trung bình**:
1. Lập hồ sơ phân loại rủi ro (Điều 12 NĐ 142)
2. Minh bạch AI: hiển thị rõ đang tương tác với AI
3. Gắn nhãn nội dung AI khi bắt buộc
4. Sẵn sàng giải trình
5. Rà soát phân loại lại khi thay đổi đáng kể

### 4.5 CỬA SỔ THỜI GIAN CHIẾN LƯỢC

| Thời điểm đưa vào hoạt động | Nếu thuộc Danh mục → hạn hoàn thành nghĩa vụ |
|---|---|
| Trước 15/08/2026 | **01/09/2027** (lĩnh vực giáo dục) |
| 15/08/2026 – 15/02/2027 | 01/03/2027 |
| Sau 15/02/2027 | Tuân thủ trước khi đưa vào sử dụng |

→ **Đưa beta có người dùng thật trước 15/08/2026** = lưới an toàn 1 năm, chi phí gần bằng 0.

Bằng chứng "đưa vào hoạt động": người dùng thật ngoài nhóm phát triển, log phiên học, thỏa thuận beta có xác nhận của phụ huynh, landing page có dấu thời gian.

### 4.6 Về việc "lách" — ranh giới hợp pháp

**"Lách" đúng duy nhất là Hướng A: làm cho thực chất hệ thống nằm ngoài định nghĩa và giữ bằng chứng.** Đây là tuân thủ bằng thiết kế, không phải né luật.

Mọi lách hình thức đều **tự sập** vì ba van khóa:
1. Nhà cung cấp **tự phân loại và chịu trách nhiệm trước pháp luật** về tính chính xác của phân loại (Điều 5 NĐ 142) — phân loại sai có chủ đích là vi phạm độc lập
2. Sự cố nghiêm trọng **buộc phân loại lại** — thực tế vận hành tự phơi bày phân loại giả
3. Cơ quan quản lý có quyền **tạm dừng/chấm dứt** hệ thống có nguy cơ thiệt hại nghiêm trọng, kể cả trong thời hạn chuyển tiếp

Các kiểu lách không được làm:
- Ghi disclaimer "chỉ tham khảo" nhưng bán cho trường dùng làm căn cứ xếp loại → điều kiện xét theo **cách kết quả được sử dụng**, không theo tuyên bố
- Tách hệ thống thành nhiều pháp nhân → phân loại theo hệ thống và **mục đích sử dụng thực tế**
- Gọi giám sát hành vi bằng tên khác nhưng vẫn dùng camera → định nghĩa bám vào **dữ liệu và cơ chế**, không bám tên gọi
- Trì hoãn phân loại vì "đang beta" → beta có người dùng thật **là** đưa vào sử dụng

Thêm: khoản 2 Điều 29 Luật — **bên triển khai vẫn phải bồi thường ngay cả khi vận hành đúng quy định** (trách nhiệm gần như khách quan). Đây là lý do kinh tế mạnh nhất để giữ hệ thống ngoài phân loại rủi ro cao.

### 4.7 Ba hướng triển khai

- **Hướng A (khuyến nghị)**: ngoài phạm vi Danh mục bằng thiết kế, tự xếp rủi ro trung bình
- **Hướng B**: chấp nhận thuộc Danh mục, tuân thủ theo con đường **tự đánh giá** (cả 3 mục giáo dục đều theo điểm b khoản 2 Điều 13 — không phải chứng nhận bên thứ ba). Chỉ chọn khi doanh thu từ tính năng trong phạm vi đủ nuôi chi phí tuân thủ + rủi ro bồi thường.
- **Hướng C**: sandbox (Điều 21 Luật) cho bước nhảy B2B trường học tương lai

---

## 5. ĐÁNH GIÁ TÍNH KHẢ THI VÀ ĐIỀU CHỈNH LẬP LUẬN

Người dùng nhận định: "khá khả thi, không cần sửa nhiều vẫn lách được quy định, vì hệ thống không can thiệp quá sâu liên quan cá nhân hay để AI tự quyết nhiều, con người vẫn tham gia quá trình."

**Kết luận: khả thi — đồng ý. Nhưng 2/3 lý do là SAI, và điều này quan trọng vì scoping memo xây trên lý do sai sẽ tự sập khi bị chất vấn.**

**Lý do sai 1: "hệ thống không can thiệp sâu liên quan cá nhân"**

Ngược lại hoàn toàn. Hệ thống xử lý dữ liệu cá nhân trẻ em ở mức sâu nhất: toàn bộ lịch sử học, log chat, hồ sơ năng lực tích lũy — và đó chính là moat.

Gánh nặng tuân thủ thật sự nằm ở **Luật Bảo vệ dữ liệu cá nhân** (consent người đại diện, quyền xóa, pseudonymize trước khi gọi API nước ngoài), không phải Luật AI.

Lý do đúng khiến dự án ngoài Danh mục: **ba điều kiện bị phủ định** — nội dung có kiểm soát, đánh giá không làm căn cứ chính thức, không sinh trắc học.

**Đừng viết "hệ thống ít liên quan dữ liệu cá nhân" vào bất kỳ hồ sơ nào** — vừa sai vừa mâu thuẫn với kiến trúc sản phẩm.

**Lý do đúng một nửa: "con người vẫn tham gia quá trình"**

Human-in-the-loop chỉ tồn tại ở **pipeline nội dung** (duyệt item trước publish). Còn vòng vận hành lõi thì AI **tự quyết hoàn toàn**: điều chỉnh lộ trình, chọn bài tiếp theo, chấm attempt, gửi thông báo — không ai duyệt từng quyết định (và cũng không nên, sẽ giết mô hình chi phí).

Nếu cơ quan quản lý hỏi "ai duyệt quyết định điều chỉnh lộ trình của từng học sinh?" → lập luận vỡ.

**Lập luận đúng không phải mức độ tự quyết của AI mà là HỆ QUẢ PHÁP LÝ của quyết định**: chúng là formative, không tạo hiệu lực chính thức nào với quyền và nghĩa vụ của người học. Đó là điểm neo của mục 2 Danh mục.

**"Không cần sửa nhiều" — đúng về code, nhưng 5 việc bắt buộc:**
1. Trần tần suất notification + giọng trung tính
2. Quy tắc cứng cấm camera/mic/suy luận cảm xúc
3. Nhãn minh bạch AI trong giao diện
4. Hồ sơ phân loại rủi ro + scoping memo xong trước ngày mở beta
5. Không leaderboard xuyên học sinh

Kèm ràng buộc lịch: **beta có người dùng thật trước 15/8/2026**.

**Điều chỉnh khung nhìn**: câu hỏi "dự án có khả thi không" giờ không còn nằm ở pháp lý. Pháp lý đã được trả lời — chi phí tuân thủ thấp, đường đi rõ. Hai ràng buộc quyết định sống chết vẫn là: **học sinh có hoàn thành sprint không, và phụ huynh có trả tiền không.** Cảm giác thoải mái về pháp lý không được đổi chỗ cho hai giả thuyết chưa kiểm chứng đó.

---

## 6. TÁC ĐỘNG TỪ THÔNG BÁO CỦA BỘ GDĐT

### 6.1 Nội dung thông báo (năm học 2026-2027)

Bộ GDĐT thông báo:
- Đã ban hành **Khung năng lực số** (bao gồm cả năng lực AI) cho giáo viên, cán bộ quản lý và người học
- Các địa phương đã tổ chức tập huấn đồng loạt cho giáo viên sử dụng AI trong giảng dạy
- Bộ đang chỉ đạo xây dựng **Nền tảng giáo dục thông minh quốc gia ứng dụng AI có kiểm soát**, tập trung phát triển hai công nghệ chiến lược: **Gia sư thông minh (AI Tutor)** và nền tảng thực tế ảo (VR)
- Dự kiến đưa vào thử nghiệm diện rộng từ năm học mới

Xác thực: nội dung cốt lõi khớp với các nguồn độc lập (Việt Nam ưu tiên hệ thống giáo dục quốc gia thông minh; chương trình giáo dục AI cho học sinh phổ thông từ năm học 2026-2027; Khung năng lực số kèm TT 02/2025/TT-BGDĐT). Chưa truy được văn bản gốc để đối chiếu nguyên văn.

### 6.2 Ba tác động

**Đây KHÔNG phải quy định pháp lý mới ràng buộc — mà là tín hiệu Bộ sẽ trực tiếp bước vào thị trường sản phẩm với đúng thứ dự án đang làm.**

**1. Mối đe dọa nghiêm trọng hơn ChatGPT với đúng lõi sản phẩm**

Giờ là chính Bộ GDĐT đứng sau một nền tảng quốc gia, với AI Tutor là công nghệ chiến lược, gần như chắc chắn miễn phí/bao cấp, phủ trực tiếp qua trường học.

→ Nếu định vị vẫn là "AI dạy học sinh theo chương trình phổ thông" thì đang cạnh tranh trực diện với nhà nước ở phân khúc phổ thông đại trà. **Trận không nên đánh.**

**2. Điểm cứu dự án: sản phẩm quốc gia gần như chắc chắn là SCHOOL-FIRST, TEACHER-FIRST**

Bằng chứng ngay trong thông báo: tập huấn cho giáo viên, hướng dẫn tăng cường giảng dạy, triển khai qua trường. Đây là công cụ phục vụ hệ thống giáo dục quốc dân và giáo viên — **không phải công cụ bán quyền kiểm soát cho phụ huynh**.

→ Pivot parent-first đã chốt bây giờ trở thành **lá chắn khác biệt hóa**: Bộ làm nền tảng trong trường, dự án làm sản phẩm phụ huynh mua để theo sát con ngoài trường. Hai tập khách hàng khác nhau.

**3. Hệ quả pháp lý cộng hưởng**

Nền tảng quốc gia vận hành trong hệ thống giáo dục quốc dân với kết quả có thể dùng làm căn cứ chính thức → rơi thẳng vào **mục 2 Danh mục rủi ro cao**. Dự án thì đã cố tình đứng ngoài mục đó bằng ba ranh giới formative.

→ Hai vị trí thị trường khác nhau về bản chất: nhà nước gánh vai trò đánh giá chính thức + toàn bộ chế độ rủi ro cao; dự án giữ vai trò bổ trợ ngoài trường với gánh nặng tuân thủ nhẹ.

### 6.3 Điều chỉnh chiến lược

**Siết định vị ra khỏi vùng chồng lấn**: dịch trọng tâm messaging từ "dạy kiến thức phổ thông" sang ba thứ nền tảng quốc gia (school-first) sẽ làm kém hoặc không làm:
1. Theo sát và báo cáo cho phụ huynh
2. Cá nhân hóa sâu theo từng con ngoài khuôn khổ lớp học
3. **Ôn thi cấp tốc bám đề cũ từng trường** — nền tảng quốc gia triển khai diện rộng sẽ chuẩn hóa theo chương trình chung, khó cá nhân hóa tới mức align đề của đúng một trường trong hai tuần. **Đó là khe hở nền tảng quốc gia bỏ lại.**

**Cơ hội đi kèm**: Bộ tập huấn giáo viên dùng AI → giáo viên được nhà nước làm quen với công cụ AI miễn phí → **hạ rào cản chấp nhận cho kênh referral giáo viên**.

**Dòng theo dõi thêm vào sổ rủi ro**: bản chất, phạm vi, mô hình phân phối của Nền tảng giáo dục thông minh quốc gia khi thử nghiệm diện rộng; Thông tư về ứng xử sử dụng AI trong cơ sở giáo dục mà Bộ đang xây dựng. Nếu nền tảng quốc gia mở API/cho phép tích hợp bên thứ ba → **cơ hội phân phối chứ không chỉ là đối thủ**.

**Kết luận**: thông báo này không giết dự án, nhưng **giết phiên bản dự án dạy kiến thức phổ thông đại trà** — thứ đã rời bỏ từ pivot parent-first. Nó xác nhận pivot đó đúng và ép đi xa hơn theo cùng hướng.

---

## 7. HÀNH TRÌNH CHỌN TÊN THƯƠNG HIỆU (10 VÒNG)

### 7.1 Bốn ràng buộc đặt tên

1. Phụ huynh Việt nhìn chữ viết **đọc đúng ngay lần đầu** (ưu tiên 2 âm tiết mở, không cụm phụ âm đầu khó: sp-, st-, gl-, fl-)
2. Không đụng thương hiệu đã ăn sâu **ở thị trường Việt Nam** (không chỉ toàn cầu)
3. Giữ được **ẩn dụ lõi**: ánh sáng dẫn đường, bản đồ lộ trình, hoặc tín hiệu báo cáo
4. Làm được **cả tên mascot lẫn tên công ty**

Lý do chọn tên tiếng Anh: các consumer edtech thành công ở VN đều mang tên tiếng Anh (ELSA, Monkey, Mochi, Prep) — phụ huynh Việt mặc định English branding = chuẩn mực, hiện đại, đáng tiền hơn.

### 7.2 Vì sao ưu tiên từ COINED (tự chế) thay vì từ phổ thông

Về **luật nhãn hiệu**: từ phổ thông dùng cho ngành không liên quan vẫn đăng ký được (arbitrary mark — Apple không bán táo, Slack không bán sự lười).

Nhưng về **ownability**: với founder bootstrap, từ phổ thông là ác mộng — domain vĩnh viễn không mua nổi, SEO phải cạnh tranh hàng triệu kết quả, App Store search chìm nghỉm. Từ coined giải quyết cả ba với chi phí bằng không.

Từ coined tốt nhất **giấu một gốc có nghĩa bên trong** để marketing có chuyện kể, nhưng người đọc lần đầu không nhận ra (kiểu Zalo, Momo).

### 7.3 Phân tích văn hóa: từ nào hợp với con đom đóm

**Tầng nghĩa trực tiếp**: firefly, glowworm; Latin Lampyridae (gốc "lampein" = chiếu sáng, cùng gốc "lamp"); luci- (Latin lux/lucis = ánh sáng — tránh dùng nguyên vì gốc Lucifer).

**Tầng hành vi** (giàu nhất cho thương hiệu giáo dục):
- **Phát sáng từ bên trong** (bioluminescence): ánh sáng do chính nó tạo ra, không phản chiếu → ẩn dụ đẹp cho việc học: **tri thức phát ra từ bên trong đứa trẻ, không phải rót vào**. Đây là câu chuyện thương hiệu mạnh nhất, phân biệt với ẩn dụ "rót kiến thức" của dạy truyền thống.
- **Nhấp nháy trong đêm** (flicker/blink): tiến bộ từng bước, từng khoảnh khắc "aha". Mascot "sáng hơn khi con tiến bộ" nằm ở đây.
- **Dẫn đường trong bóng tối**: điểm sáng nhỏ chỉ lối → nối thẳng định vị "bố mẹ đặt mục tiêu, [tên] soi lộ trình cho con".

**Tầng văn hóa Việt Nam** (lợi thế mà tên tiếng Anh thuần không chạm được):
- Ký ức tuổi thơ đồng quê (bắt đom đóm đêm hè) — chạm đúng thế hệ phụ huynh 8x-9x đang là người mua
- **Tích "học trò nghèo bắt đom đóm làm đèn học"** — mô típ hiếu học kinh điển Á Đông (điển Xa Dận nước Tấn). **Đây là mỏ vàng định vị**: con đom đóm không chỉ dễ thương, nó là biểu tượng văn hóa của sự hiếu học và vươn lên bằng tri thức. Không đối thủ tên tiếng Anh nào kể được câu chuyện này.

**Tầng Á Đông rộng hơn**: ở Nhật (hotaru), Trung — đom đóm mang sắc thái phù du, mong manh, buồn. Đẹp trong thơ nhưng **không hợp thương hiệu giáo dục** cần cảm giác vươn lên. Tránh.

**Xếp hạng trục theo độ khớp**:
1. **Lantern/đèn soi** — gom cả ba: gọi ánh sáng đom đóm + ẩn dụ dẫn đường (đúng định vị parent-first) + bắc thẳng vào tích "đom đóm làm đèn học"
2. **Glow/phát sáng từ bên trong** — câu chuyện sâu nhất, liên hệ VN mỏng hơn
3. **Blink/flicker** — trực quan, dễ làm mascot động, ẩn dụ nông hơn

### 7.4 BẢNG TỔNG HỢP CÁC TÊN ĐÃ TRA CỨU

| # | Tên | Kết quả tra | Kết luận |
|---|---|---|---|
| 1 | **Flibby** | Sạch tại VN (không app/công ty/sản phẩm giáo dục nào); quốc tế đụng **Flibbo** (app AI tạo nội dung, công ty Dubai, doanh thu ~57.858 USD/tháng, giữ flibbo.com) — cách 1 nguyên âm, cùng ngành AI | **ĐÃ CHỌN** — chấp nhận rủi ro Flibbo vì định hướng nội địa |
| 2 | Lango | Đụng dày đặc AI language tutor: Lango (getlango.com, có AI Voice Tutor, gói 79,99 USD/năm), Lango.ai (luyện nói AI), Lango.co, LangO (edtech), Langotalk, Langua | LOẠI — trùng nhiều thực thể cùng ngành; nghĩa "language" khóa sai ngách đa môn |
| 3 | Wisefly | Sạch ngành (chỉ đụng WiseFly hàng không Ấn Độ, Wisefly Technologies Bangalore, wisefly.cn y tế) | LOẠI — "wise" kéo mascot về **con cú**, đụng hình ảnh Duolingo; ngược mascot đom đóm |
| 4 | Glowfly | Đụng **Glowfly Tutors** (dịch vụ gia sư trực tuyến, luyện thi — CÙNG NGÀNH); Glowfly® của Resideo (có nhãn hiệu đăng ký); Glowfly Media; GLOWFLY LIMITED | LOẠI — trùng gia sư cùng ngành; từ gần-mô-tả nên khó sở hữu |
| 5 | Lumify | **LUMIFY® của Bausch + Lomb** — thuốc nhỏ mắt, FDA phê duyệt 2018, bảo vệ bằng **4 bằng sáng chế Mỹ**, đã qua kiện tụng, độc quyền tới ~2030 | LOẠI — bị tập đoàn NYSE bảo hộ chủ động; mất liên hệ đom đóm |
| 6 | Lanify | Đụng **Lanify.ai** (dự án crypto/blockchain, proxy phi tập trung, có docs + X + domain .ai); lanify.vercel.app | LOẠI — liên tưởng crypto ngược tông; tên rỗng không gợi đom đóm |
| 7 | Lanigo | Không đụng edtech trực tiếp (chỉ shop Colombia, tiệm văn phòng phẩm Tây Ban Nha) nhưng nằm trong cụm **Lango/Lingo/Zlango** | LOẠI — vọng nghĩa "lingo/ngôn ngữ"; lặp lại vùng đã loại ở #2 |
| 8 | Lani (tên công ty) | Đụng **Lani Learning** (Nairobi, đào tạo công nghệ), **Lani Learning Centre**, **Lana Learn** (có chương trình tại Hà Nội) | LOẠI làm tên công ty — trùng cơ sở giáo dục cùng ngành. **Dùng được làm tên mascot** |
| 9 | Flippy | Đụng **Flippy • Learn Flashcards** (app học, 7K+ users, spaced repetition, nhập PDF/scan — GẦN TRÙNG MÔ HÌNH); **Flippy Campus** (edtech, ~6 triệu USD doanh thu 2026, ~1 triệu tải, Samsung cài sẵn); Flippy của Miso Robotics (robot AI nấu ăn, hợp tác NVIDIA); Flippy crypto; Flippy second-hand AI | LOẠI — bước lùi so với Flibby; trùng app học cùng ngách |
| 10 | Fira | Đụng **FIRA Education / FIRA RoboWorld Cup** (giáo dục robotics AI); **Fira (Y Combinator)** — nền tảng AI phân tích tài chính, có Fira MCP cắm vào Claude (trớ trêu: sát công việc phân tích đầu tư của chính người dùng); **FiRa Consortium** (UWB, 100+ thành viên); Fira Finance; Fira Digital; font Fira Sans/Code | LOẠI — bị chiếm dày, có thực thể giáo dục |
| — | Firra | Bản sao thừa chữ của Fira (đọc giống hệt "phi-ra", "rr" không đổi cách đọc) | LOẠI — cùng số phận Fira, chỉ khó gõ hơn |
| — | Firly | Chưa tra | LOẠI — cụm "rl" khó nhả với người Việt; "i" lưỡng lự (phi/phai) |
| — | Wiserfly | Chưa tra | LOẠI — "wiser" là dạng so sánh hơn của wise (không phải loại từ khác); đọc "oai-sơ-phlai" 4 âm tiết, KHÓ hơn Wisefly; vẫn kéo về con cú |

### 7.5 Các tên đã loại từ vòng ý tưởng (không cần tra)

**Lỗi đọc tiếng Việt**: Kudo → "cu-đô"; Kite → "ki-tê"; Niko → "ni cô"; Aivy → "ai vậy"; nhóm spark-/glow-/st- (cụm phụ âm đầu buộc chèn nguyên âm: "xì-pác")

**Đã bị chiếm tâm trí người Việt**: Nova (Novaland), Milo (Nestlé), Orion (ChocoPie), Pilot (bút), Firefly (Adobe), Luxo (đèn Pixar), Deno (JS runtime), Beko (đồ gia dụng)

**Tên nhà bác học** (Newton, Edison, Archimedes): trường tư Hà Nội đã đăng ký nhiều; nghe như trường học không phải app

**Nhóm giả Latin** (Domigo, Domago, Dovigo, Dumigo, Domilo, Domiko): mùi Tây Ban Nha, nhầm Domingo/Domino

**Nhóm Duo** (Duvigo, Tavigo, Paviko, Paligo, Dutigo): dùng "Duo" trực diện dễ bị kéo về Duolingo

**Hướng thuần Việt** (Đốm, Bé Đốm, Đèn Đom, Đốm Học, Nhà Đốm):
- "Đốm" trước hết là **tên chó dân dã** (Vàng, Mực, Đốm) → giảm cảm giác nghiêm túc với người trả tiền là phụ huynh
- "Đèn Đom" **sai từ vựng** — từ đúng là "đom đóm"; "đèn đóm" là danh từ chung nghĩa khác
- Nếu quay lại hướng Việt: "Đom Đóm" trực diện đáng cân nhắc hơn

**Nhóm -fly đủ chữ** (Sparkfly, Beamfly, Rayfly, Gleamfly, Glintfly, Emberfly, Flarefly, Blazefly, Lumafly, Beaconfly, Torchfly): **ngõ cụt có cấu trúc**
- "fly" luôn kéo cụm "fl" cuối → đọc "phờ-lai", 3-4 âm tiết trúc trắc
- Mọi từ sáng/đèn ghép fly đều tạo từ **gần-mô-tả con đom đóm** → ai cũng nghĩ ra → đã có người lấy (Glowfly đã chứng minh)
- Không từ nào thoát được đồng thời cả hai vấn đề

### 7.6 NĂM BÀI HỌC RÚT RA

1. **Mọi từ tiếng Anh rõ nghĩa, dễ đọc trong lĩnh vực học tập đều đã đông hoặc bị bảo hộ** (lang-, lingo-, glow-, wise-, firefly, lumi-, flip-). Từ càng rõ nghĩa càng nhiều người tới trước. Đây là hệ quả toán học, không phải xui.

2. **Ghép "X + fly" đủ chữ** vừa khó đọc (cụm phụ âm cuối) vừa gần-mô-tả nên dễ trùng.

3. **Tên tự chế rỗng nghĩa thì sạch hơn nhưng mất khả năng kể chuyện** (Lanify, Lanigo). Căng thẳng nội tại: giữ nghĩa thì dễ trùng, bỏ nghĩa thì rỗng.

4. **Không có tên hoàn hảo trên mọi tiêu chí** — chọn tên là **chọn đánh đổi rủi ro nào chấp nhận được**, không phải săn tên sạch tuyệt đối.

5. **Tên mascot và tên thương hiệu không nhất thiết là một từ** — tách hai vai giải phóng nhiều ràng buộc (Duolingo có mascot tên Duo). Tên mascot không cần đăng ký nhãn hiệu độc quyền như tên công ty.

### 7.7 QUYẾT ĐỊNH CUỐI: FLIBBY

**Lý do chọn** (lập luận của người dùng, được đánh giá là vững):
- Thị trường mục tiêu **thuần nội địa**; ngôn ngữ gốc tiếng Việt, tối đa thêm tiếng Anh
- Không có kế hoạch bán ra quốc tế ở giai đoạn hiện tại
- Nếu mở rộng quốc tế sau này khi công ty đủ lớn → có thể chọn tên riêng cho thị trường ngoài (thị trường VN và quốc tế khá độc lập)
- → Đối thủ trùng tên **duy nhất quan trọng là đối thủ có mặt ở Việt Nam**. Flibbo (Dubai) gần như vô hình với phụ huynh Việt.

**Trạng thái độ sạch**:
- Hiện diện công khai tại VN: **SẠCH** — không app, công ty, sản phẩm giáo dục nào tên Flibby; không đụng đối thủ cùng ngành
- Bối cảnh cần biết: app **FLIP** (quản lý thời gian học, Rinasoft) rất phổ biến với học sinh VN — khác chữ và khác âm rõ ("phlíp" vs "phli-bi"), rủi ro nhầm lẫn thấp
- Quốc tế: vướng **Flibbo** (app AI Dubai) — rủi ro thấp với thị trường nội địa, cần lưu ý nếu ra quốc tế
- Nhãn hiệu chính thức: **CHƯA XÁC NHẬN** — đây là việc chặn duy nhất còn lại

**Flibby vs Fliby (1 chữ b)**: chọn Flibby vì phụ âm đôi "bb" khóa âm tiết đầu thành âm ngắn dứt khoát → người Việt đọc "phli-bi" chắc chắn, không lưỡng lự "phli" hay "phlai". Đánh đổi: trông trẻ con hơn một chút.

**Trong tất cả tên đã tra, Flibby là tên DUY NHẤT sạch tại thị trường Việt Nam và không đụng đối thủ cùng ngành ở đó.** (Fira, Flippy, Lango, Glowfly đều đụng edtech; Lumify bị tập đoàn bảo hộ; Lani trùng cơ sở giáo dục.)

### 7.8 Ba việc còn lại để khép phần tên

1. **Tra cứu nhãn hiệu "Flibby" tại Cục Sở hữu trí tuệ Việt Nam, nhóm 41 (giáo dục) và nhóm 9/42 (phần mềm)** — việc chặn duy nhất. Tra được miễn phí trên cổng tra cứu trực tuyến của Cục, hoặc thuê đơn vị dịch vụ nhãn hiệu.
   - Lưu ý: việc không thấy Flibby công khai KHÔNG có nghĩa chưa ai đăng ký nhãn hiệu. Một cá nhân/công ty có thể đã nộp đơn mà chưa ra sản phẩm.
2. **Giữ chỗ định danh số**: domain (flibby.vn, flibby.edu.vn, getflibby.com hoặc flibby.app — flibby.com có thể đã bị giữ); handle Facebook/Zalo/TikTok
3. **Cân nhắc nộp đơn đăng ký nhãn hiệu sớm** — Việt Nam theo nguyên tắc **ai nộp trước được ưu tiên**

### 7.9 Mascot và slogan: CHƯA CHỐT

- **Mascot**: hướng đom đóm/đốm sáng phát sáng theo tiến bộ học tập. **Tránh cú mèo** (Duolingo) — đây là lý do loại các tên gợi "wise". Tên Flibby không mang nghĩa "đom đóm" tường minh → mascot và câu chuyện thương hiệu sẽ gánh phần kể chuyện đó.
- **Tên mascot**: ứng viên **Lani** (dễ đọc, dễ thương, làm tên nhân vật tốt; không dùng làm tên công ty được vì trùng cơ sở giáo dục)
- **Slogan**: ứng viên **"khôn hơn mỗi ngày" / "con giỏi hơn chính mình hôm qua"** (nảy ra trong vòng cân nhắc Wiserfly) — khớp triết lý đo tiến bộ theo từng con thay vì xếp hạng học sinh với nhau. Ý nghĩa này quá tốt để bỏ, nhưng **hợp làm slogan hơn làm tên** (ép thành danh từ thì gãy: "wiser" đặt câu hỏi treo "hơn ai?")

---

## 8. TỔNG KẾT CÁC QUYẾT ĐỊNH ĐÃ CHỐT

### 8.1 Chiến lược và sản phẩm

```text
Tên:          Flibby (còn tra nhãn hiệu tại Cục SHTT)
Chiến lược:   Parent-first, không tutor-first, không student-first
Thesis:       Bán quyền kiểm soát quá trình học cho phụ huynh, không chỉ bán khóa học
Sản phẩm:     Không phải chatbot. Hệ thống tạo lộ trình, dạy, kiểm tra, đo, điều chỉnh, báo cáo
MVP:          Learning Sprint — ôn thi Toán THCS 7-14 ngày
Moat:         Learner profile + Assessment Intelligence + Mastery Tracking + Parent Reporting
Dữ liệu:      Là tài sản chính. Không cào dữ liệu đối thủ. Lưu có mục đích, có quyền xóa
Tech stack:   Next.js + shadcn/ui + FastAPI + MongoDB Atlas + Redis + R2/S3
Phân phối:    Giáo viên/gia sư là kênh referral có hoa hồng, KHÔNG phải user
```

### 8.2 Ràng buộc thiết kế (từ phản biện + pháp lý)

```text
Learner model:  LOẠI BỎ learning styles; chỉ dùng biến hành vi có bằng chứng
Assessment:     Có math verification (SymPy); có vòng lặp calibration độ khó (~30 attempts);
                có upload đề cũ/ma trận đề trong MVP
Accountability: Cam kết ba bên; notification trần 1/ngày/trẻ dạng digest; giọng trung tính;
                minh bạch hai chiều; session 20-25 phút (không phải 45)
Quy tắc cứng:   CẤM VĨNH VIỄN camera/mic/sinh trắc học/suy luận cảm xúc và mức chú ý
Không làm:      Leaderboard xuyên học sinh; hợp đồng trường học dùng kết quả làm căn cứ học vụ
Vận hành:       Human review nội dung, AI không tự publish
Ngôn ngữ:       Không "thay thế gia sư"; không "dự đoán điểm thi" (dùng "mức sẵn sàng")
                Không "chứng chỉ", "tương đương điểm thi", "xếp loại học lực"
Phân loại AI:   Tự xếp RỦI RO TRUNG BÌNH; hồ sơ phân loại + scoping memo xong TRƯỚC ngày mở beta
```

### 8.3 Ràng buộc thời gian

**Beta có người dùng thật trước 15/08/2026** — nếu sau này bị xác định thuộc Danh mục AI rủi ro cao, hạn hoàn thành nghĩa vụ là 01/09/2027 thay vì phải tuân thủ ngay. Chi phí gần bằng 0, giá trị là 1 năm dự phòng pháp lý.

### 8.4 Hai giả thuyết sống chết (chưa kiểm chứng)

```text
1. COMPLETION: Học sinh có hoàn thành sprint không khi không có người lớn ngồi cạnh?
   → Giả thuyết số 1 của private beta, kiểm chứng TRƯỚC cả chất lượng AI
   → Ngưỡng gợi ý: ≥60% học sinh hoàn thành ≥80% số buổi

2. WILLINGNESS TO PAY: Phụ huynh có trả tiền không?
   → Tiêu chí sống: phụ huynh trả tiền cho một mục tiêu cụ thể, con học đủ sprint,
     phụ huynh thấy bằng chứng tiến bộ rõ đến mức muốn mua tiếp
```

**Cảm giác thoải mái về pháp lý không được đổi chỗ cho hai giả thuyết này.**

### 8.5 Việc cần làm ngay (2 tuần)

1. Thiết kế chi tiết accountability layer (trên giấy trước khi code)
2. Xây skill graph Toán 8 từ yêu cầu cần đạt GDPT 2018, nhờ giáo viên Toán kiểm chứng
3. Dựng pipeline sinh item + SymPy verification, chạy thử 50 item, đo tỷ lệ lỗi
4. Viết parser đề cũ (tận dụng pipeline PDF-to-Markdown sẵn có) với 3-5 đề giữa kỳ Toán 8
5. Prototype goal intake + report mẫu; đưa 5 phụ huynh quen xem, hỏi có trả tiền không
6. **Tra cứu nhãn hiệu "Flibby" tại Cục SHTT nhóm 41 và 9**
7. Lập danh sách 30-50 phụ huynh tiềm năng cho beta

### 8.6 Còn mở

- Tên mascot (ứng viên: Lani) và slogan (ứng viên: "khôn hơn mỗi ngày")
- Khối lớp cụ thể cho use case đầu (gợi ý lớp 8)
- Điểm giá cụ thể trong khung giả thuyết (sprint 7 ngày: 300-500k; 14 ngày: 500-900k; subscription: 200-400k/tháng)
- Chính sách hoàn tiền có điều kiện
- Ngưỡng completion rate chính thức sau cohort beta đầu

---

## PHỤ LỤC: NGUỒN THAM KHẢO CHÍNH

**Bằng chứng hiệu quả AI tutoring**
- Kestin và cộng sự, "AI tutoring outperforms in-class active learning", Scientific Reports (Nature), 2025
- LearnLM Team (Google) + Eedi, RCT tại 5 trường trung học Anh (N=165), 2025-2026
- Stanford SCALE Initiative, nghiên cứu Tutor CoPilot (900 gia sư, 1.800 học sinh)

**Pháp lý Việt Nam**
- Luật Trí tuệ nhân tạo 134/2025/QH15 (hiệu lực 01/03/2026)
- Nghị định 142/2026/NĐ-CP (hiệu lực 01/05/2026)
- Quyết định 33/2026/QĐ-TTg (hiệu lực 15/08/2026) — Danh mục AI rủi ro cao
- Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 + Nghị định 356/2025/NĐ-CP (hiệu lực 01/01/2026)
- Thông tư 29/2024/TT-BGDĐT + Thông tư 19/2026/TT-BGDĐT (dạy thêm học thêm)
- Chương trình GDPT 2018 (yêu cầu cần đạt) — xương sống skill graph

**Thị trường và cạnh tranh**
- Gia sư AI (ĐHQGHN + Z.AI) — PoC 8,7/10 điểm, tháng 3/2026
- Nền tảng giáo dục thông minh quốc gia (Bộ GDĐT) — AI Tutor + VR, thử nghiệm diện rộng từ năm học 2026-2027
- VioEdu, Onluyen.vn, VMathAI, Vuihoc, HOCMAI, Aiducation.vn
- ChatGPT/Gemini miễn phí — đối thủ thật sự trong điện thoại học sinh

---

*Ghi chú phương pháp: Các nhận định về trùng thương hiệu trong tài liệu này dựa trên tra cứu hiện diện công khai (app store, mạng xã hội, thương mại) — CHƯA phải tra cứu nhãn hiệu chính thức tại Cục Sở hữu trí tuệ Việt Nam. Các con số giá, ngưỡng KPI, tỷ lệ chi phí là giả thuyết làm việc để kiểm chứng, không phải dữ liệu thị trường đã xác minh.*
