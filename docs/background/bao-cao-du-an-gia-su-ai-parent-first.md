# Báo cáo tổng hợp dự án: Nền tảng gia sư AI parent-first cho thị trường Việt Nam

Phiên bản 1.0 — 02/07/2026
Tính chất: tài liệu bản đồ triển khai (living document), hợp nhất toàn bộ phân tích, phản biện và quyết định từ quá trình brainstorm. Tên dự án đã chốt: **Flibby**. Tên còn cần tra cứu nhãn hiệu chính thức tại Cục Sở hữu trí tuệ Việt Nam (nhóm 41 và nhóm 9) trước khi đăng ký hoặc in ấn — xem mục 16.

## 1. Tóm tắt điều hành

**Sản phẩm:** Hệ thống AI giáo dục cá nhân hóa do phụ huynh điều khiển. Phụ huynh đặt mục tiêu, AI chẩn đoán năng lực, tạo lộ trình riêng, dạy mỗi ngày, kiểm tra, đo lỗ hổng, điều chỉnh và báo cáo tiến bộ bằng bằng chứng. Không phải chatbot học tập.

**Thesis:** Gia sư tồn tại vì phụ huynh thiếu thời gian, thiếu chuyên môn và thiếu hệ thống để theo sát việc học của con. Nếu AI cung cấp được hệ thống đó với chi phí thấp hơn, minh bạch hơn và cá nhân hóa hơn, phần lớn nhu cầu gia sư phổ thông và kỹ năng hẹp có thể bị thay thế. Đây là thesis nội bộ, không phải thông điệp marketing.

**Wedge vào thị trường:** AI Learning Sprint — gói học ngắn hạn có mục tiêu rõ, deadline rõ, test đầu vào, lộ trình riêng, học mỗi ngày, test đầu ra và báo cáo ROI học tập. Use case đầu tiên khuyến nghị: ôn thi Toán THCS trong 7-14 ngày.

**Moat:** Không phải model AI (model là commodity). Moat gồm bốn tài sản tích lũy: learner profile theo thời gian, Assessment Intelligence Engine với item đã calibrate bằng dữ liệu thật, Mastery Tracking, và Parent Reporting tạo niềm tin. Dữ liệu học tập có cấu trúc là tài sản chính của công ty.

**Khách hàng trả tiền:** Phụ huynh chủ động, sẵn sàng chi cho giáo dục, muốn theo sát con nhưng thiếu thời gian hoặc chuyên môn, cần thấy bằng chứng tiến bộ. Không nhắm nhóm phụ huynh phó mặc.

**Tiêu chí sống chết của MVP:**

```text
Một phụ huynh trả tiền cho một mục tiêu cụ thể, con học đủ sprint,
và phụ huynh thấy bằng chứng tiến bộ rõ đến mức muốn mua tiếp.
```

**Giả thuyết rủi ro số 1 cần kiểm chứng trước tiên (trước cả chất lượng AI):** học sinh có hoàn thành sprint hay không khi không có người lớn ngồi cạnh. Toàn bộ giá trị của các engine phía sau phụ thuộc vào completion rate.

**Ba việc bắt buộc làm trước khi code tiếp:**

1. Thiết kế tầng accountability phụ huynh - học sinh vào luồng sprint (mục 6.9).
2. Đưa tính năng upload đề cũ / ma trận đề vào scope MVP (mục 6.4).
3. Xóa "phong cách học" khỏi learner profile, thay bằng biến có bằng chứng khoa học (mục 6.2).

**Timeline tổng thể (nếu làm part-time):** prototype 1-2 tháng, private beta 4-6 tháng, paid MVP 6-9 tháng, V1 ổn định 12-18 tháng.

## 2. Quá trình tiến hóa ý tưởng và các pivot

Ghi lại để không quay lại các ngõ cụt đã đi qua.

### 2.1 Phiên bản gốc (V0)

Nền tảng hai khối: khối phụ huynh/giáo viên/gia sư upload tài liệu, AI chuẩn hóa và đóng gói thành khóa học; khối học sinh học theo, lưu 100% lịch sử, AI adapt giáo trình. Tầm nhìn dài hạn: marketplace gia sư kiểu "Shopee cho giáo dục". Giả định ban đầu: "nền tảng không cần chứa dữ liệu gì, chỉ cần model AI tốt với MCP, tool và skill phù hợp".

### 2.2 Các pivot đã thực hiện và lý do

**Pivot 1 — Dữ liệu là moat, không phải model.** Giả định "không cần dữ liệu" mâu thuẫn với chính mô tả sản phẩm: tài liệu upload, khóa học đóng gói, lịch sử học, log chat, bộ tiêu chuẩn đánh giá đều là dữ liệu, và là phần giá trị nhất. Model AI mua được từ Anthropic, OpenAI, Google với giá như nhau cho mọi đối thủ; thứ không copy được là dữ liệu học tập có cấu trúc và learner profile tích lũy. Kết luận: đây là nền tảng dữ liệu học tập, AI chỉ là engine.

**Pivot 2 — Parent-first, không tutor-first, không student-first.** Bản gốc lấy gia sư/giáo viên làm khối cung cấp nội dung. Bản hiện tại xác định người trả tiền và người điều khiển là phụ huynh. Lý do: ví tiền nằm ở phụ huynh; nỗi đau rõ nhất là thiếu hệ thống theo sát con; đối thủ nội địa lan man đa tập khách hàng nên bỏ trống đúng khoảng này. Gia sư/giáo viên chuyển từ vai user sang vai kênh phân phối (referral có hoa hồng).

**Pivot 3 — Wedge hẹp thay vì nền tảng học mọi thứ.** Không launch bằng thông điệp "học mọi thứ với AI". Launch bằng Learning Sprint với một môn, một cấp, một loại mục tiêu. Engine thiết kế đủ tổng quát để mở sang skill sprint sau.

**Pivot 4 — Marketplace lùi về tầm nhìn xa.** Marketplace chỉ có nghĩa khi đã có supply (gia sư quen dùng công cụ) và demand (học sinh có hồ sơ năng lực trên nền tảng). Làm marketplace từ đầu là chết vì cold start. Network effect thật sự nằm ở hồ sơ năng lực học sinh xuyên khóa học, không phải cái chợ.

**Pivot 5 — Định vị công khai không dùng "thay thế gia sư".** Mục tiêu nội bộ giữ nguyên, nhưng thông điệp ra ngoài là "gia sư AI do phụ huynh điều khiển". Lý do: tạo kỳ vọng quá cao, dễ phản cảm, và mâu thuẫn nếu sau này mời gia sư làm kênh referral hoặc supply marketplace.

### 2.3 Nguyên tắc rút ra

- Người trả tiền và người dùng là hai người khác nhau (phụ huynh trả, học sinh dùng); sản phẩm phải thiết kế cho cả hai nhưng bán cho người trả.
- Mọi tính năng phải trả lời được: nó đóng góp gì vào bằng chứng tiến bộ mà phụ huynh nhìn thấy.
- Không đo giá trị bằng số lượt chat.

## 3. Thesis, định vị và thông điệp

### 3.1 Công thức sản phẩm

```text
Phụ huynh đặt mục tiêu
-> AI chẩn đoán năng lực
-> AI tạo lộ trình học riêng
-> AI dạy mỗi ngày
-> AI sinh bài tập và bài kiểm tra
-> AI đo lỗ hổng và tiến bộ
-> AI điều chỉnh lộ trình
-> AI báo cáo bằng chứng cho phụ huynh
```

### 3.2 Định vị công khai

```text
Bố mẹ đặt mục tiêu. Flibby tạo lộ trình học riêng, học cùng con mỗi ngày
và gửi báo cáo tiến bộ bằng bằng chứng rõ ràng.
```

Sản phẩm bán cho phụ huynh quyền kiểm soát quá trình học của con, không chỉ bán thêm một khóa học. Ba tầng giá trị theo thứ tự ưu tiên truyền thông: (1) kiểm soát và minh bạch, (2) bằng chứng tiến bộ cụ thể, (3) kết quả học tập.

### 3.3 Trả lời objection quan trọng nhất: "Sao phải trả tiền khi ChatGPT miễn phí?"

Đối thủ thật sự trong điện thoại học sinh không phải VioEdu hay Onluyen mà là ChatGPT và Gemini bản miễn phí, đã có chế độ học tập dẫn dắt từng bước. Câu trả lời phải nằm sẵn trong định vị và mọi cuộc demo:

1. ChatGPT trả lời câu con hỏi; hệ thống này biết con đang hổng gì để dạy đúng thứ con chưa hỏi. Chẩn đoán đầu vào, bản đồ lỗ hổng và lộ trình có cấu trúc là thứ chatbot thuần không có.
2. ChatGPT không đo lường: không có điểm đầu vào, không mastery theo kỹ năng, không đề mô phỏng chuẩn hóa, không before/after.
3. ChatGPT không báo cáo cho bố mẹ và không nhắc con học. Toàn bộ tầng accountability và Parent Reporting là giá trị phụ huynh mua.

Câu ngắn dùng khi bán: "ChatGPT là quyển bách khoa biết nói. Đây là hệ thống dạy học có kiểm soát: biết con hổng gì, dạy đúng chỗ đó, và chứng minh cho anh chị thấy con tiến bộ."

### 3.4 Ngôn ngữ cấm dùng trong sản phẩm và marketing

- "Thay thế gia sư" (kỳ vọng quá cao, phản cảm với kênh referral).
- "Dự đoán điểm thi" (đề mô phỏng nội bộ không align hoàn hảo với đề thật từng trường; báo cáo chỉ dùng "mức sẵn sàng theo đề mô phỏng").
- Mọi cam kết điểm số tuyệt đối.

## 4. Phân tích thị trường

### 4.1 Đặc điểm cầu

- Văn hóa học thêm ở Việt Nam tạo nhu cầu chi trả cho giáo dục ngoài nhà trường lớn và bền. Gia sư 1-1 có thể tốn vài triệu đồng mỗi tháng; đây là mỏ neo giá cho sản phẩm AI định giá vài trăm nghìn cho một sprint hoặc mỗi tháng.
- Phụ huynh trả tiền gia sư không chỉ mua kiến thức. Họ mua sự giám sát, kỷ luật, động lực và một người chịu trách nhiệm báo cáo. AI hiện thay tốt phần kiến thức và báo cáo; phần giám sát và động lực là lỗ hổng phải thiết kế bù (mục 6.9).
- Sau Thông tư 29, chi phí học thêm bên ngoài của nhiều gia đình tăng do giáo viên phải thuê mặt bằng và tuân thủ; một phân khúc phụ huynh đang chủ động tìm phương án khác — cửa sổ thuận lợi cho sản phẩm tự học có kiểm soát.

### 4.2 Tính mùa vụ của nhu cầu (chi phối toàn bộ kế hoạch marketing và doanh thu)

Sprint ôn thi bán theo sự kiện thi. Mỗi học sinh có khoảng 4 kỳ kiểm tra lớn mỗi năm học:

| Thời điểm | Sự kiện | Sản phẩm phù hợp |
|---|---|---|
| Tháng 10-11 | Giữa kỳ 1 | Sprint ôn thi 7-14 ngày |
| Tháng 12-1 | Cuối kỳ 1 | Sprint ôn thi |
| Tháng 3 | Giữa kỳ 2 | Sprint ôn thi |
| Tháng 4-5 | Cuối kỳ 2, thi chuyển cấp | Sprint ôn thi, gói luyện thi vào 10 |
| Tháng 6-8 | Hè | Gói lấy lại gốc 21 ngày, skill sprint |
| Giữa các kỳ | Không có deadline | Subscription giữ nhịp chống quên |

Hệ quả: doanh thu sprint thuần rất mùa vụ và LTV mỏng. Con đường sang subscription (mục 13) là bắt buộc, không phải tùy chọn.

### 4.3 Khách hàng mục tiêu

Phân khúc phù hợp: phụ huynh chủ động; sẵn sàng chi tiền cho giáo dục; muốn theo sát con nhưng không đủ thời gian hoặc chuyên môn; không muốn phó mặc hoàn toàn cho gia sư; muốn thấy bằng chứng tiến bộ; dành được 5-10 phút mỗi tuần xem báo cáo.

Không nhắm nhóm phụ huynh không quan tâm: khó tạo kết quả, khó giữ chân, dễ đổ lỗi cho sản phẩm.

Vai trò phụ huynh trong sản phẩm: đặt mục tiêu, duyệt lộ trình, theo dõi báo cáo, xem bằng chứng, thực hiện vài can thiệp nhỏ khi hệ thống yêu cầu. Phụ huynh không phải trở thành giáo viên.

Nhóm tuổi đầu tiên khuyến nghị: THCS. Lý do: phụ huynh còn theo sát con chặt (khác THPT), nhu cầu ôn thi và lấy lại gốc rõ, học sinh đủ lớn để tự thao tác với hệ thống (khác tiểu học).

ICP cho private beta: phụ huynh tại Hà Nội có con học THCS, con sắp có kỳ kiểm tra Toán trong 2-4 tuần tới, tuyển từ mạng lưới cá nhân và hội nhóm phụ huynh.

### 4.4 Môi trường pháp lý: hai văn bản chi phối

**a) Khung dạy thêm học thêm — Thông tư 29/2024/TT-BGDĐT và Thông tư 19/2026/TT-BGDĐT (hiệu lực 15/5/2026).**

Các ràng buộc lõi được giữ: giáo viên không được dạy thêm có thu tiền với học sinh mình đang dạy chính khóa; giáo viên công lập không được tham gia quản lý, điều hành việc dạy thêm ngoài nhà trường (nhưng được tham gia dạy); giáo viên dạy thêm ngoài trường phải báo cáo hiệu trưởng về môn, địa điểm, hình thức, thời gian; đường dây nóng tiếp nhận phản ánh ở mọi cấp.

Điểm quan trọng cho Dự án: các hoạt động giáo dục về văn hóa nghệ thuật, thể thao, ngoại ngữ, STEM, STEAM, năng lực số, trí tuệ nhân tạo, hướng nghiệp, kỹ năng sống không bị coi là dạy thêm và nằm ngoài phạm vi điều chỉnh.

Hàm ý:

- Giai đoạn AI tự học thuần túy (không có giáo viên người dạy trực tiếp) nhiều khả năng nằm ngoài phạm vi "dạy thêm"; wedge B (skill sprint, AI literacy, tiếng Anh qua sở thích) được loại trừ tường minh. Cần xác nhận lại với tư vấn pháp lý trước khi thu tiền, nhưng rủi ro thấp.
- Giai đoạn marketplace tương lai có gia sư người dạy môn văn hóa chắc chắn rơi vào phạm vi điều chỉnh: gia sư phải đủ điều kiện, giáo viên công lập không được đứng vai quản lý điều hành. Nền tảng nào giúp gia sư minh bạch hóa (hồ sơ, hợp đồng, hóa đơn, báo cáo hiệu trưởng) sẽ có lợi thế tuyển supply — ghi nhận cho giai đoạn 3+.

**b) Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15 (hiệu lực 1/1/2026) và Nghị định 356/2025/NĐ-CP (thay thế Nghị định 13/2023).**

Các điểm chạm trực tiếp vào sản phẩm:

- Với trẻ em, người đại diện theo pháp luật thay mặt thực hiện các quyền của chủ thể dữ liệu; xử lý dữ liệu trẻ em cần sự đồng ý của người đại diện, dữ liệu trẻ dưới 16 tuổi chịu yêu cầu nghiêm ngặt hơn.
- Chủ thể dữ liệu có quyền được biết, đồng ý, truy cập, chỉnh sửa, yêu cầu xóa, rút lại sự đồng ý. Kiến trúc phải hỗ trợ xóa/ẩn danh hóa theo yêu cầu.
- Log chat của học sinh là dữ liệu cá nhân và có thể chứa dữ liệu nhạy cảm (tâm sự, sức khỏe tinh thần). Nguyên tắc "lưu 100% lịch sử" đã sửa thành: lưu có mục đích, có phân quyền, có thời hạn, có quyền xóa và có cơ chế ẩn danh hóa.
- Gọi API LLM đặt máy chủ nước ngoài với nội dung chat của học sinh cấu thành chuyển dữ liệu cá nhân xuyên biên giới. Giảm thiểu: pseudonymize danh tính trước khi gửi (không gửi họ tên, trường, lớp trong prompt), rà soát nghĩa vụ đánh giá tác động chuyển dữ liệu theo Nghị định 356/2025 và các trường hợp miễn.
- Doanh nghiệp nhỏ, khởi nghiệp có thể được miễn chỉ định nhân sự bảo vệ dữ liệu chuyên trách khi đáp ứng điều kiện — kiểm tra điều kiện cụ thể khi đăng ký kinh doanh.

Kết luận pháp lý: không có rào cản chặn mô hình, nhưng consent và privacy phải thiết kế từ Sprint 1, không retrofit. Checklist chi tiết ở mục 8.

### 4.5 Bằng chứng khoa học về hiệu quả AI tutoring

Ba nghiên cứu RCT đáng tin cậy làm nền cho tính khả thi sư phạm:

- RCT tại Harvard (Kestin và cộng sự, công bố trên Scientific Reports 2025): sinh viên học bằng AI tutor thiết kế theo nguyên tắc sư phạm học được nhiều hơn trong thời gian ít hơn so với lớp active learning, đồng thời engagement và động lực cao hơn.
- RCT của Google LearnLM cùng Eedi tại 5 trường trung học Anh (N=165): học sinh được AI hỗ trợ (có gia sư người giám sát) đạt kết quả ít nhất ngang gia sư người trên mọi chỉ số, và giải bài mới ở chủ đề tiếp theo tốt hơn (66,2% so với 60,7%); 76,4% tin nhắn AI soạn được gia sư duyệt gần như không sửa.
- RCT của Stanford với công cụ Tutor CoPilot (900 gia sư, 1.800 học sinh): học sinh của gia sư dùng AI hỗ trợ tiến bộ hơn 4 điểm phần trăm; riêng nhóm gia sư yếu, mức cải thiện tới 9 điểm phần trăm.

Ba hàm ý thiết kế: (1) AI tutor hiệu quả khi có teaching policy chặt, không phải chat tự do; (2) mô hình lai người giám sát AI cho kết quả tốt — củng cố quyết định human review nội dung; (3) khoảng cách giữa kết quả nghiên cứu được kiểm soát và triển khai đại trà là thật, nên KPI phải đo kết quả học tập thực, không đo cảm nhận.

## 5. Phân tích cạnh tranh

### 5.1 Đối thủ nội địa

| Đối thủ | Điểm mạnh | Khác biệt so với concept | Mức đe dọa |
|---|---|---|---|
| VioEdu | Adaptive learning, dữ liệu học sinh, nội dung phổ thông, thương hiệu FPT, quy mô | Không parent-led từ mục tiêu tự nhiên, không learning sprint, chưa đánh long-tail skills | Cao nếu họ thêm AI tutor và parent goal builder |
| Onluyen.vn | Ngân hàng câu hỏi, đề kiểm tra, adaptive engine | Không parent-first, không tạo lộ trình từ mục tiêu tự do, không vận hành toàn bộ quá trình | Trung bình-cao, gần nhất với Assessment Engine |
| VMathAI | Cá nhân hóa học Toán, đã vào trường học | School/teacher-first, chưa phải hệ thống phụ huynh điều khiển | Trung bình, theo dõi nếu mở B2C |
| Gia sư AI (ĐHQGHN + Z.AI) | AI tutor dẫn dắt từng bước, uy tín thể chế, PoC 3/2026 đạt 8,7/10 điểm người dùng, định hướng K-12 đa môn kèm công cụ theo dõi cho học sinh, phụ huynh, giáo viên | Chưa thấy parent-led goal builder, assessment sprint, long-tail skills | Cao nếu thương mại hóa; không cạnh tranh trực diện về chatbot giải bài với họ |
| Aiducation.vn | Đã có nghiên cứu hiệu quả trên học sinh phổ thông Hà Nội và TP.HCM | Tương tự nhóm AI tutor, chưa parent-first | Trung bình |
| Vuihoc | Phụ huynh, gia sư, báo cáo, lộ trình | Vẫn xoay quanh giáo viên/gia sư thật | Cao ở ví tiền phụ huynh |
| HOCMAI | Nội dung, luyện thi, thương hiệu | Không trùng sâu concept AI parent-first | Trung bình, cạnh tranh attention và niềm tin |

### 5.2 Đối thủ thật sự: ChatGPT và Gemini miễn phí

Không cần bản địa hóa marketing, hai sản phẩm này đã nằm trong điện thoại học sinh Việt Nam, miễn phí, có chế độ học tập dẫn dắt từng bước. Mọi buổi demo với phụ huynh sẽ gặp câu hỏi này. Câu trả lời chuẩn ở mục 3.3. Về sản phẩm, mọi tính năng phải củng cố ba thứ chatbot thuần không có: cấu trúc lộ trình, đo lường khách quan, báo cáo bằng chứng.

### 5.3 Đối thủ quốc tế

Không ưu tiên phân tích cạnh tranh trực tiếp tại Việt Nam (bản địa hóa kém, ít quan tâm thị trường), nhưng dùng làm tham chiếu UX, AI tutor behavior, mascot, retention và parent dashboard: Khanmigo, LearnLM/Gemini for Education, Synthesis Tutor, Squirrel Ai.

### 5.4 Khoảng trống chiến lược và điều kiện giữ nó

```text
Phụ huynh muốn con đạt một mục tiêu học tập cụ thể.
Phụ huynh không biết thiết kế lộ trình.
Phụ huynh không muốn thuê gia sư hoặc không tin gia sư hoàn toàn.
Phụ huynh muốn thấy con tiến bộ bằng bằng chứng cụ thể.
```

Khoảng trống này chưa ai chiếm trọn, nhưng không có gì ngăn VioEdu hay Gia sư AI ĐHQGHN bước vào. Điều kiện giữ: tốc độ ra thị trường với wedge hẹp, trải nghiệm phụ huynh vượt trội (goal intake dưới 5 phút, báo cáo đọc trong 3 phút hiểu ngay), và vòng lặp dữ liệu calibration mà người đến sau phải mất thời gian tích lũy tương đương.

## 6. Kiến trúc sản phẩm: 8 engine và 1 tầng bổ sung

Sản phẩm không phải chatbot. Nó là hệ thống gồm các engine phối hợp; chat chỉ là một giao diện của AI Teaching Engine.

### 6.1 Goal Intake Engine

Nhận mục tiêu từ phụ huynh bằng ngôn ngữ tự nhiên, ví dụ: "Con tôi lớp 8, sắp kiểm tra Toán giữa kỳ trong 10 ngày, yếu hằng đẳng thức và phân tích đa thức, mỗi ngày học được 45 phút."

Engine hỏi bổ sung tối thiểu: tuổi/lớp, thời hạn, mục tiêu, trình độ hiện tại ước lượng, thời lượng học mỗi ngày, sở thích của con, mức phụ huynh muốn theo dõi. KPI: phụ huynh hoàn thành goal intake dưới 5 phút.

### 6.2 Learner Profiling Engine

Hồ sơ học tập của từng trẻ, là một phần moat dài hạn. Các trường: tuổi, lớp, mục tiêu, sở thích (để cá nhân hóa ví dụ), mức năng lực theo kỹ năng, attention span đo được từ hành vi thực, mức tự lập (tần suất cần hint), lịch sử học, lỗ hổng kiến thức, phản ứng với từng loại feedback, tốc độ làm bài, bằng chứng tiến bộ.

**Quyết định đã chốt: loại bỏ "phong cách học" (learning styles) khỏi profile.** Learning styles (visual/auditory/kinesthetic và các biến thể) là khái niệm đã bị bác bỏ trong nghiên cứu giáo dục — không có bằng chứng rằng dạy theo phong cách học cải thiện kết quả; đồng thuận khoa học xếp nó vào nhóm neuromyth. Giữ nó là đưa pseudoscience vào lõi hệ thống và lãng phí chiều dữ liệu. Các biến thay thế ở trên đều đo được từ hành vi và có giá trị dự báo thật.

### 6.3 Knowledge/Skill Graph Engine

Biến mục tiêu thành bản đồ kỹ năng cần học. Không có skill graph thì cá nhân hóa chỉ là đổi chủ đề bề mặt.

**Với chương trình phổ thông: dùng "yêu cầu cần đạt" theo môn, theo lớp của Chương trình GDPT 2018 làm xương sống taxonomy.** Đây là chuẩn quốc gia có sẵn, miễn phí, phụ huynh và giáo viên đều hiểu, và là ngôn ngữ chung khi báo cáo. Trên xương sống đó bổ sung tầng chi tiết: chủ đề, dạng bài, lỗi thường gặp, prerequisites giữa các node.

Với kỹ năng hẹp (giai đoạn sau): skill graph riêng cho speaking, writing, presentation, AI literacy, research, storytelling, critical thinking.

MVP chỉ cần một skill graph nhỏ cho đúng use case đầu tiên (ví dụ: chương trình Toán 8 học kỳ tương ứng kỳ thi), khoảng vài chục node, làm tay có kiểm chứng.

### 6.4 Assessment Intelligence Engine

Moat chính. Không chỉ sinh đề — nó tạo công cụ đo năng lực theo mục tiêu học, trả lời câu hỏi: con đang hổng gì, vì sao hổng, và cần học gì tiếp.

Các loại assessment: kiểm tra đầu vào (diagnostic), đầu ra, theo ngày, giữ nhịp chống quên, phân nhánh, đề mô phỏng, kiểm tra kỹ năng/project, rubric chấm tự luận, response analysis phân tích lỗi.

Cấu trúc một item: chủ đề, skill tags (map vào skill graph), độ khó, mục đích, đáp án, lời giải, rubric, lỗi thường gặp gắn distractor, prerequisites, thời gian dự kiến, trạng thái kiểm chứng.

Bốn quyết định thiết kế bổ sung sau phản biện:

**a) Vòng lặp calibration độ khó.** Độ khó do AI gán lúc sinh item là ước lượng, không phải độ khó thật; adaptive dựa trên độ khó đoán sẽ sai có hệ thống. Quy tắc: item đạt ngưỡng khoảng 30 lượt làm thì recalibrate độ khó từ tỷ lệ đúng thực tế; MVP chấp nhận adaptive thô khi chưa đủ dữ liệu. Dữ liệu calibration tích lũy chính là một phần moat.

**b) Math verification tự động trong pipeline sinh nội dung.** Lợi thế của việc chọn Toán làm môn đầu: AI sinh item, sau đó SymPy/code execution kiểm chứng đáp án số học tự động trước khi con người review. Giảm tỷ lệ item lỗi xuống mức founder chỉ cần review lời giải và ngữ nghĩa, không phải tính lại từng bài.

**c) Tính năng upload đề cũ / ma trận đề (bắt buộc trong MVP).** Đề kiểm tra THCS mỗi trường mỗi khác về ma trận và độ khó; gia sư người xử lý bằng cách xin đề cũ đúng trường. Nếu đề mô phỏng nội bộ lệch đề thật, phụ huynh sẽ quy kết sản phẩm sai khi điểm thi thật thấp. Tính năng: phụ huynh/học sinh upload đề cũ hoặc ma trận đề của trường, hệ thống trích xuất cấu trúc (pipeline PDF-to-text đã có sẵn từ kinh nghiệm trước) và align đề mô phỏng theo đó. Chi phí thấp, giá trị cao, đối thủ lớn khó cá nhân hóa đến mức này.

**d) Diagnostic đầu vào 15-20 câu theo blueprint chương sắp thi.** Dài hơn thì học sinh nản ngay buổi đầu. Chấp nhận độ chính xác vừa phải, tinh chỉnh ước lượng mastery qua các ngày học tiếp theo.

Giới hạn nhận diện: MVP luyện chủ yếu qua trắc nghiệm và điền đáp số (chấm tự động được), trong khi thi THCS phần lớn tự luận viết tay. Chấm ảnh bài viết tay tiếng Việt là bài toán vision khó — không làm ở MVP, ghi nhận rủi ro learning transfer, và tuyệt đối không hứa "dự đoán điểm thi" (mục 3.4).

### 6.5 Curriculum Planning Engine

Tạo lộ trình học cá nhân hóa từ kết quả diagnostic và skill graph. Mỗi lộ trình gồm: outcome cuối, milestone, lịch học ngày/tuần, bài học, bài luyện, bài kiểm tra, project hoặc artifact (với skill sprint), rubric, tiêu chí hoàn thành, điều kiện điều chỉnh (ví dụ: mastery kỹ năng X dưới ngưỡng sau ngày 4 thì chèn buổi ôn lại).

Output bắt buộc có cấu trúc (JSON theo schema) để hệ thống vận hành được; không để AI sinh giáo trình dạng văn bản tự do.

### 6.6 AI Teaching Engine

Phần thay gia sư trực tiếp, chạy theo teaching policy rõ ràng, không để model chat tự do:

- Giảng ngắn theo từng chunk, hỏi ngược sau mỗi chunk.
- Gợi ý từng tầng (hint ladder), không đưa đáp án quá sớm.
- Phát hiện học sinh đoán mò (trả lời đúng nhưng giải thích sai, tốc độ bất thường) và hỏi lại.
- Tạo ví dụ theo sở thích của con lấy từ learner profile.
- Chữa lỗi bám vào danh mục lỗi thường gặp của skill graph.
- Giao bài tiếp theo, tóm tắt buổi học, đẩy tín hiệu về Mastery Tracking và Parent Reporting.

Chống gian lận thiết kế ngay từ đầu: học sinh có thể dùng một AI khác làm hộ bài. Đối sách: đánh giá dựa trên quá trình trong nền tảng (ghi nhận từng bước làm, thời gian, hint), câu hỏi vấn đáp ngẫu nhiên kiểm tra hiểu ("giải thích lại vì sao con chọn bước này"), và trọng số mastery đặt vào hành vi quá trình thay vì chỉ đáp án cuối.

### 6.7 Mastery Tracking Engine

Ước lượng mức thành thạo theo từng kỹ năng. Giai đoạn đầu dùng heuristic từ: đúng/sai, số lần thử, hint đã dùng, thời gian làm, lỗi lặp lại, mức tự lập, độ khó câu hỏi (đã calibrate dần). Khi có dữ liệu thật đủ lớn, nâng cấp bằng các kỹ thuật knowledge tracing đã có 30 năm nghiên cứu (BKT, DKT) — không tự phát minh lại.

Mastery state tích lũy theo thời gian là switching cost chính của người dùng: đổi nền tảng là mất bản đồ năng lực của con.

### 6.8 Parent Reporting Engine

Phần bán tiền. Báo cáo không phải số bài hoàn thành hay điểm trung bình — là báo cáo ROI học tập: mục tiêu ban đầu, điểm đầu vào, lỗ hổng chính, tiến bộ sau từng giai đoạn, lỗi đã giảm (đếm được), kỹ năng còn yếu, mức sẵn sàng theo đề mô phỏng, bằng chứng cụ thể (bài làm before/after), hành động đề xuất cho phụ huynh.

Chuẩn một báo cáo tốt:

```text
Ngày 1 con làm đúng 42% bài chẩn đoán. Lỗi chính là hằng đẳng thức và dấu âm
khi phân tích đa thức. Sau 6 ngày, con đạt 78% ở đề mô phỏng, lỗi dấu âm giảm
từ 7 lần xuống 2 lần. Trong 3 ngày còn lại nên tập trung dạng nhóm hạng tử
và bài vận dụng 2 bước.
```

Nguyên tắc ngôn ngữ: cụ thể, đếm được, có next action; không tính từ sáo rỗng; không dự đoán điểm thi thật.

### 6.9 Accountability Layer (tầng bổ sung, xử lý rủi ro số 1)

Mâu thuẫn nội tại của mô hình parent-first: thesis nói phụ huynh thiếu thời gian theo sát con, nhưng vận hành lại giả định học sinh THCS tự ngồi học với AI mỗi ngày. Gia sư người giải quyết bằng hiện diện vật lý và áp lực xã hội — một nửa giá trị phụ huynh trả tiền, và là thứ AI không có. Nhắc nhẹ bằng mascot không đủ. Thiết kế tầng accountability tường minh:

- Cam kết ba bên lúc mua gói: phụ huynh, học sinh và hệ thống cùng xác nhận lịch học, khung giờ, hậu quả khi bỏ buổi (ví dụ: hệ thống báo phụ huynh ngay).
- Notification tức thời cho phụ huynh khi con bỏ buổi hoặc bỏ dở giữa chừng, kèm một hành động can thiệp gợi ý ("nhắc con hoàn thành 15 phút tối nay").
- Session ngắn 20-25 phút thay vì 45 phút để giảm ma sát bắt đầu; một ngày có thể hai session ngắn.
- Streak và tiến độ hiển thị cho cả hai phía; sprint mode có đếm ngược ngày thi.
- Lịch học chốt theo khung giờ cụ thể (không phải "học lúc nào cũng được") — cấu trúc tạo kỷ luật.

Completion rate của sprint là giả thuyết số 1 của private beta. Nếu completion thấp sau khi đã lặp 2-3 vòng thiết kế accountability, phải xem xét lại mô hình (ví dụ: bổ sung mentor người check-in 10 phút/tuần như một tier giá cao hơn) trước khi đầu tư thêm vào engine khác.

## 7. Chiến lược dữ liệu

### 7.1 Nguyên tắc

Dữ liệu là tài sản chính. Model AI thay thế được; dữ liệu học tập có cấu trúc và learner profile tích lũy thì không. Conversation là dữ liệu thô — giá trị nằm ở việc chuyển nó thành skill tags, lỗi, mastery, evidence và next action. Không chỉ lưu chat.

### 7.2 Các nhóm dữ liệu cốt lõi

Mục tiêu phụ huynh; child profile; learning path; assessment items (kèm lịch sử calibration); student attempts (từng bước, không chỉ đáp án); chat sessions; mastery states; parent reports; learning evidence; AI run logs; consent records.

### 7.3 Vòng lặp dữ liệu tạo moat

```text
Học sinh làm bài -> attempts có cấu trúc -> calibrate độ khó item
-> adaptive chính xác hơn -> kết quả tốt hơn -> nhiều phụ huynh hơn
-> nhiều attempts hơn
```

Người đến sau dù copy tính năng cũng phải tích lũy lại vòng lặp này từ đầu.

### 7.4 Nguồn dữ liệu sạch — và điều cấm

Cấm cào bài giảng, câu hỏi, lời giải, video transcript, ngân hàng đề hoặc nội dung sau đăng nhập/trả phí của VioEdu, Onluyen hay nền tảng khác. Lý do: rủi ro bản quyền, vi phạm điều khoản, rủi ro truy cập trái phép, khó gọi vốn với nền dữ liệu bẩn, nội dung cào không tạo moat, giảm uy tín founder.

Được phép ở mức competitive intelligence công khai: pricing, positioning, UX public, danh mục môn, thông điệp marketing, cách họ báo cáo phụ huynh.

Nguồn sạch: chương trình học công khai (yêu cầu cần đạt GDPT 2018), đề thi công khai, tài liệu mở có license, nội dung tự biên soạn, giáo viên/freelancer được trả phí, user upload có quyền (đề cũ của trường con họ — dùng để align, không tái xuất bản), AI tự sinh item từ skill graph có kiểm chứng. Không dùng nội dung sách giáo khoa nguyên văn (bản quyền NXB Giáo dục).

```text
Chiến lược đúng: không copy kho dữ liệu của đối thủ.
Xây engine sinh, kiểm chứng và đo lường bài học tốt hơn cho từng mục tiêu cụ thể.
```

## 8. Pháp lý, quyền riêng tư và an toàn trẻ em

Checklist tuân thủ, thiết kế từ Sprint 1:

### 8.1 Consent và phân quyền

- Phụ huynh (người đại diện theo pháp luật) tạo tài khoản, đồng ý tường minh cho việc xử lý dữ liệu của con; lưu consent record có timestamp và phiên bản chính sách.
- Phụ huynh quản lý tài khoản con; phân quyền rõ ba vai: phụ huynh, học sinh, admin.
- Cơ chế rút lại đồng ý và yêu cầu xóa dữ liệu: xóa hoặc ẩn danh hóa trong thời hạn luật định; thiết kế schema để xóa được theo child_id.

### 8.2 Thu thập và lưu trữ tối thiểu

- Lưu có mục đích, có thời hạn (retention policy công bố), không lưu quá mức cần thiết.
- Cảnh báo và lọc khi học sinh nhập thông tin nhạy cảm vào chat; nếu phát hiện tín hiệu đáng lo về sức khỏe tinh thần, escalate cho phụ huynh theo quy trình định trước thay vì để AI tự xử lý.
- Không dùng dữ liệu trẻ em để fine-tune model khi chưa có consent riêng, tường minh.
- Phân tích nội bộ dùng dữ liệu ẩn danh hóa.

### 8.3 Chuyển dữ liệu xuyên biên giới

- Prompt gửi API LLM nước ngoài: pseudonymize (không họ tên, trường, lớp, thông tin định danh); child_id nội bộ không map được từ bên ngoài.
- Rà soát nghĩa vụ đánh giá tác động chuyển dữ liệu xuyên biên giới theo Nghị định 356/2025/NĐ-CP và các trường hợp miễn trước khi thu tiền chính thức.

### 8.4 Pháp nhân và nghĩa vụ kinh doanh

- Đăng ký hộ kinh doanh hoặc công ty trước khi thu tiền; hóa đơn, kê khai thuế.
- Kiểm tra điều kiện miễn chỉ định nhân sự bảo vệ dữ liệu chuyên trách cho doanh nghiệp nhỏ/khởi nghiệp.
- Xác nhận với tư vấn pháp lý: mô hình AI tự học không giáo viên người nằm ngoài phạm vi "dạy thêm" của Thông tư 29/19 (đánh giá sơ bộ: nhiều khả năng ngoài phạm vi, rủi ro thấp).

## 9. Tech stack và kiến trúc kỹ thuật

### 9.1 Stack đã chốt cho MVP

```text
Frontend: Next.js App Router + TypeScript
UI: shadcn/ui + Tailwind
Backend: FastAPI
Database: MongoDB Atlas
Vector/RAG ban đầu: MongoDB Atlas Vector Search
Queue/cache: Redis
File storage: Cloudflare R2 hoặc S3
Deploy: Vercel (frontend), Cloud Run/Render/Fly/Railway (FastAPI)
Monitoring: Sentry + PostHog
AI logs: collection ai_runs riêng
```

Lý do chọn Next.js: cần landing page, dashboard, routing, streaming UI, auth flow, web responsive, deploy nhanh. Lý do chọn FastAPI thay NestJS: sản phẩm AI-heavy, Python thuận cho AI workflow, RAG, parsing, evaluation và math verification (SymPy); tránh phải thêm Python service sau. MongoDB dùng được với kỷ luật schema: Pydantic, schema version, indexes, collection rõ ràng, lưu event/log, không embed quá sâu, không để dữ liệu AI sinh trôi nổi.

### 9.2 Collections tối thiểu

```text
users, children, parent_child_links, learning_goals, learning_paths,
skill_graphs, assessment_blueprints, assessment_items, assessment_sessions,
student_attempts, learning_sessions, chat_messages, mastery_states,
parent_reports, ai_runs, files, consents, billing_records
```

Bổ sung so với bản trước: assessment_items cần các trường phục vụ calibration (attempt_count, correct_rate, difficulty_estimated, difficulty_calibrated, verification_status); files cần loại "đề cũ/ma trận đề" gắn school context.

### 9.3 Kiểm soát chi phí AI (model routing)

Chi phí inference trên mỗi học sinh hoạt động là biến số sống chết của unit economics. Nguyên tắc routing:

| Tác vụ | Tier model | Ghi chú |
|---|---|---|
| Chat hỏi đáp thường, nhắc học, tóm tắt buổi | Model rẻ/nhanh | Chiếm phần lớn volume |
| Giảng bài theo policy, phân tích attempt | Model trung | Cân bằng chất lượng/giá |
| Sinh khóa học, sinh item, chấm tự luận theo rubric, sinh báo cáo tuần | Model mạnh | Volume thấp, giá trị cao, chạy batch được |
| Verify đáp án Toán | SymPy/code, không LLM | Chi phí gần 0 |

Mọi lời gọi AI ghi vào ai_runs: model, token in/out, chi phí, mục đích, child_id (pseudonymized), latency, kết quả. Dashboard chi phí trên mỗi học sinh, mỗi sprint có từ ngày đầu. Đặt hard cap usage mỗi tài khoản để chặn abuse.

### 9.4 Không dùng sớm

Kubernetes; microservices phức tạp; self-host LLM; fine-tuning; custom vector DB; GraphQL; mobile native; marketplace; multi-agent framework nặng.

## 10. Kế hoạch MVP

### 10.1 Phát biểu MVP

```text
AI Learning Sprint cho phụ huynh.
Use case đầu tiên: ôn thi Toán THCS trong 7-14 ngày.
```

Wedge A (ôn thi cấp tốc) được chọn trước wedge B (kỹ năng hẹp qua sở thích) vì: nỗi đau rõ, deadline rõ, phụ huynh dễ trả tiền, kết quả dễ đo, khớp Assessment Engine, và deadline kỳ thi tự tạo enforcement cho học sinh. Wedge B giữ cho giai đoạn sau; engine thiết kế đủ tổng quát để mở sang.

### 10.2 Luồng MVP end-to-end

1. Phụ huynh nhập mục tiêu (goal intake).
2. Học sinh làm diagnostic test 15-20 câu.
3. AI phân tích lỗ hổng theo skill graph.
4. AI tạo kế hoạch học từng ngày (kèm khung giờ cam kết).
5. Học sinh học với AI tutor theo teaching policy, session 20-25 phút.
6. AI sinh bài luyện theo lỗi; item Toán qua math verification.
7. AI chấm và phân tích attempt từng bước.
8. AI cập nhật mastery; notification phụ huynh nếu bỏ buổi.
9. AI sinh đề mô phỏng (align theo đề cũ/ma trận nếu phụ huynh upload).
10. Phụ huynh nhận báo cáo ROI học tập.

### 10.3 Tính năng bắt buộc

Account phụ huynh/học sinh; goal intake; diagnostic test; learning path; AI teaching session; item generation kèm verification; upload đề cũ/ma trận đề; attempt analysis; accountability notifications; parent report; admin review và log; usage/cost tracking; consent flow.

### 10.4 Không làm trong MVP

Đa môn; marketplace; mobile native; voice realtime; video analysis; chấm ảnh bài viết tay; mentor layer; school dashboard; fine-tuning; gamification nặng.

### 10.5 Độ khó và nguồn lực

Một người giỏi sản phẩm, biết code, dùng coding agent mạnh làm được MVP hẹp (độ khó khoảng 6,5/10; sản phẩm đầy đủ 8-9/10 và cần team). Coding agent tăng tốc phần code nhưng không thay được: product judgment, sư phạm, rubric, assessment design, parent trust, student engagement, kiểm chứng nội dung, customer discovery. Phân bổ thời gian thực tế: khoảng một nửa cho nội dung/sư phạm/kiểm chứng và customer discovery, không phải code.

## 11. Lộ trình triển khai

Hai kịch bản thời gian; mốc dưới đây theo kịch bản part-time (dự án làm song song công việc chính).

```text
Full-time:  prototype 2-4 tuần | beta 8-12 tuần | paid MVP 3-5 tháng | V1 6-9 tháng
Part-time:  prototype 1-2 tháng | beta 4-6 tháng | paid MVP 6-9 tháng | V1 12-18 tháng
```

### Giai đoạn 0 — Prototype (part-time: 1-2 tháng)

Mục tiêu: luồng end-to-end chạy được với một use case.

Việc cần làm: landing page đơn giản; parent goal intake; diagnostic test mẫu; learning path generator; AI teaching session mẫu theo policy; parent report mẫu; Mongo schema cơ bản kèm consent; ai_runs logging; 1 skill graph nhỏ (Toán 8, phạm vi một kỳ thi) làm tay có kiểm chứng; pipeline sinh item + SymPy verification; parser đề cũ tận dụng pipeline PDF sẵn có.

Definition of done:

```text
Một phụ huynh nhập mục tiêu, con làm test đầu vào, AI tạo kế hoạch,
học một buổi mẫu, và phụ huynh xem được báo cáo mẫu — trên môi trường thật.
```

### Giai đoạn 1 — Private beta 20-50 phụ huynh (part-time: tháng 3-6)

Mục tiêu: kiểm chứng ba giả thuyết theo đúng thứ tự:

1. Completion: học sinh có hoàn thành sprint không (ngưỡng đề xuất ban đầu: ≥60% học sinh hoàn thành ≥80% số buổi; hiệu chỉnh sau cohort đầu).
2. Giá trị báo cáo: phụ huynh mở báo cáo và nói lại được con tiến bộ ở đâu.
3. Willingness to pay: phụ huynh nói sẵn sàng trả cho sprint tiếp theo, và trả thật ở cuối beta.

Việc cần làm: auth parent-child; kho item lớn hơn có blueprint; attempt analysis; mastery score đơn giản; accountability layer đầy đủ (cam kết ba bên, notification, streak); báo cáo tuần; admin dashboard; cost tracking; feedback loop; content review workflow (founder review sample và item quan trọng — không để AI tự publish toàn bộ).

Tuyển beta: mạng lưới cá nhân, đồng nghiệp có con THCS, hội nhóm phụ huynh Hà Nội; chọn gia đình có kỳ thi trong 2-4 tuần tới để sprint có deadline thật.

### Giai đoạn 2 — Paid MVP (part-time: tháng 6-9)

Mục tiêu: phụ huynh trả tiền cho sprint đầu tiên và mua lại hoặc giới thiệu.

Việc cần làm: payment; onboarding tốt hơn; báo cáo chất lượng hơn; nhiều sprint template hơn (giữa kỳ, cuối kỳ, lấy lại gốc); notification qua email/Zalo; kiểm soát chi phí AI theo hard cap; xử lý lỗi; hoàn thiện consent và privacy; 2-3 case study before/after (ẩn danh, có consent).

### Giai đoạn 3 — V1 và mở rộng (tháng 9-18)

- Subscription giữ nhịp chống quên giữa các kỳ thi (mục 13) — ưu tiên số 1 để thoát mùa vụ.
- Nâng Mastery Tracking bằng knowledge tracing khi đủ dữ liệu.
- Môn thứ hai (Lý hoặc Hóa — vẫn chấm khách quan được) hoặc mở rộng khối lớp trong môn Toán; chọn theo tín hiệu retention.
- Pilot wedge B: một skill sprint (gợi ý: AI literacy hoặc tiếng Anh qua sở thích — nằm ngoài phạm vi dạy thêm theo Thông tư 19/2026, bán được quanh năm kể cả hè).
- Thử nghiệm tier có mentor người check-in nếu completion là điểm nghẽn.

### Giai đoạn 4 — Tầm nhìn dài hạn (18-36 tháng, cần team)

- Đa môn; thứ tự theo độ khó chấm: Toán -> Lý/Hóa -> Tiếng Anh -> Văn (chấm tự luận, khó nhất).
- Tùy chọn B2B2C: license engine cho gia sư/trung tâm nhỏ dùng với học sinh của họ.
- Tùy chọn marketplace: chỉ khi hồ sơ năng lực học sinh đã tạo lock-in phía cầu và có supply gia sư quen công cụ; nền tảng gánh phần compliance cho gia sư (hồ sơ, hợp đồng, hóa đơn, báo cáo theo Thông tư 29/19) làm lợi thế tuyển supply. Hồ sơ năng lực xuyên khóa học là network effect thật, không phải cái chợ.

## 12. Kế hoạch go-to-market và marketing

### 12.1 Nguyên tắc

- CAC quảng cáo lạnh tới phụ huynh giáo dục rất đắt; sprint đầu giá vài trăm nghìn gần như chắc chắn lỗ CAC nếu chạy ads lạnh. Thứ tự kênh: quan hệ cá nhân -> referral -> content/organic -> ads trả phí (chỉ sau khi có LTV từ subscription).
- Sản phẩm marketing tốt nhất là chính bản báo cáo tiến bộ: mỗi báo cáo before/after là một quảng cáo phụ huynh muốn chia sẻ.
- Mọi chiến dịch bám lịch thi (mục 4.2); ngân sách và nội dung dồn vào 3-4 tuần trước mỗi đợt thi.

### 12.2 Tuyển private beta (giai đoạn 1)

- Nguồn: mạng lưới cá nhân và đồng nghiệp có con THCS; hội nhóm phụ huynh trên Zalo/Facebook tại Hà Nội; phụ huynh cùng trường/lớp con của người quen.
- Thông điệp tuyển: miễn phí một sprint ôn thi cá nhân hóa đổi lấy phản hồi chi tiết; nhấn "báo cáo cho bố mẹ thấy con hổng gì và tiến bộ ra sao".
- Tiêu chí chọn: có kỳ thi thật trong 2-4 tuần (sprint cần deadline thật), phụ huynh cam kết xem báo cáo và trả lời phỏng vấn 15 phút sau sprint.

### 12.3 Kênh phân phối xếp theo ưu tiên (giai đoạn 2+)

1. **Referral từ giáo viên và gia sư (kênh chủ lực).** Họ không phải user — họ là kênh có hoa hồng. Giáo viên biết chính xác học sinh nào hổng gì và phụ huynh nào chịu chi; một lời giới thiệu của giáo viên đáng giá hơn mọi quảng cáo. Cơ chế: mã giới thiệu, hoa hồng theo sprint bán được, báo cáo tiến bộ có thể chia sẻ ngược lại cho giáo viên nếu phụ huynh đồng ý.
2. **Referral phụ huynh - phụ huynh.** Ưu đãi hai chiều (tặng ngày subscription hoặc giảm giá sprint). Kích hoạt đúng lúc: ngay sau báo cáo cuối sprint có kết quả tốt.
3. **Hội nhóm phụ huynh Zalo/Facebook.** Không spam quảng cáo; chia sẻ case study ẩn danh và nội dung hữu ích (bản đồ lỗ hổng thường gặp Toán 8 trước giữa kỳ).
4. **Content/SEO.** Cụm từ khóa mùa vụ: "ôn thi giữa kỳ toán 8", "con mất gốc toán lớp 7", "đề thi giữa kỳ toán 8 có đáp án". Lead magnet: bài test chẩn đoán miễn phí 15 câu kèm bản đồ lỗ hổng gửi phụ huynh — vừa là marketing vừa là bước 1 của onboarding.
5. **Ads trả phí.** Chỉ bật khi subscription đã chứng minh LTV; target lookalike từ tập phụ huynh trả tiền.

### 12.4 Trust levers

- Human review badge: nội dung có kiểm chứng của con người, công bố tỷ lệ item lỗi được phát hiện và sửa.
- Minh bạch giới hạn: nói rõ đề mô phỏng là "mức sẵn sàng", không phải dự đoán điểm.
- Chính sách hoàn tiền (thử nghiệm ở giai đoạn 2): hoàn nếu con hoàn thành đủ sprint mà báo cáo không cho thấy tiến bộ đo được. Điều kiện "hoàn thành đủ" bảo vệ khỏi trường hợp bỏ học rồi đòi tiền; cấu trúc này đồng thời tạo động lực phụ huynh ép con học đủ — cùng chiều với accountability layer.
- Demo 10 phút cho phụ huynh: cho xem một báo cáo mẫu thật trước khi mua.

### 12.5 Kịch bản trả lời objection khi bán

| Objection | Trả lời |
|---|---|
| "ChatGPT miễn phí mà" | Ba luận điểm mục 3.3; chốt bằng câu bách khoa biết nói vs hệ thống dạy có kiểm soát |
| "Con tôi cần người kèm mới chịu học" | Đồng ý một phần; mô tả accountability layer: lịch cam kết, báo bố mẹ ngay khi bỏ buổi, session 20 phút. Nếu vẫn cần người: tier mentor (sau này) hoặc thẳng thắn giới thiệu gia sư — giữ niềm tin |
| "AI dạy sai thì sao" | Toán được kiểm chứng tự động bằng máy + con người review; công bố quy trình; báo lỗi được thưởng |
| "Đắt quá" | So mỏ neo: một buổi gia sư = cả sprint 7 ngày có báo cáo; tính theo giờ học thực tế |
| "Cháu dùng điện thoại nhiều rồi, sợ thêm màn hình" | Session 20-25 phút có cấu trúc, có giờ cố định, khác lướt mạng; phụ huynh nhìn thấy toàn bộ con làm gì |

### 12.6 Lịch marketing năm học (khung)

- Tháng 8-9: content "chuẩn bị năm học", test chẩn đoán miễn phí đầu năm.
- Tháng 10-11 và 3: cao điểm sprint giữa kỳ — đẩy referral, case study, ads (nếu đã bật).
- Tháng 12-1 và 4-5: cao điểm sprint cuối kỳ; riêng tháng 4-5 thêm luyện thi vào 10 (nếu đã mở khối 9).
- Sau mỗi đợt thi: chiến dịch chuyển đổi sang subscription "vá nốt lỗ hổng, giữ nhịp chống quên".
- Hè: gói lấy lại gốc 21 ngày và skill sprint.

## 13. Mô hình kinh doanh và unit economics

### 13.1 Cấu trúc gói

Gói sprint (mua theo sự kiện):

```text
Sprint ôn thi 7 ngày
Sprint ôn thi 14 ngày
Gói lấy lại gốc 21 ngày
Skill sprint 4 tuần (giai đoạn sau)
```

Gói subscription (cầu nối giữa các kỳ thi): 1 con, 1-2 lộ trình active, học giữ nhịp chống quên theo mastery map, báo cáo tuần, giới hạn AI usage, parent dashboard. Gói cao hơn: nhiều con, nhiều lộ trình, chấm bài nói/viết, project portfolio, báo cáo sâu, mentor review (sau này).

Con đường chuyển đổi sprint -> subscription (thiết kế tường minh, chống mùa vụ): báo cáo cuối sprint luôn chỉ ra các lỗ hổng chưa vá kèm lộ trình duy trì; đó là cửa bán subscription giá thấp. Mastery state tích lũy là switching cost giữ chân.

### 13.2 Định giá (giả thuyết, kiểm chứng ở beta và paid MVP)

Mỏ neo: gia sư 1-1 vài triệu đồng/tháng; một buổi gia sư vài trăm nghìn. Khung giả thuyết để test A/B:

```text
Sprint 7 ngày:   300.000 - 500.000 đ
Sprint 14 ngày:  500.000 - 900.000 đ
Lấy lại gốc 21 ngày: 700.000 - 1.200.000 đ
Subscription:    200.000 - 400.000 đ/tháng
```

Đây là giả thuyết, không phải kết luận; điểm giá chốt theo willingness-to-pay đo được. Không định giá như app học tập rẻ — sản phẩm bán quyền kiểm soát và bằng chứng, không bán quyền truy cập nội dung.

### 13.3 Unit economics

Công thức theo dõi từ ngày đầu (dashboard từ ai_runs + billing_records):

```text
Margin sprint = Giá bán − Chi phí AI của sprint − Phí thanh toán − CAC phân bổ
```

- Mục tiêu chi phí AI ≤ 25-30% giá bán sprint (giả thuyết; đo thật bằng ai_runs, tối ưu bằng model routing mục 9.3).
- Chi phí AI của một sprint xác định bởi: số session, độ dài session, tier model theo tác vụ, số item sinh mới so với tái sử dụng kho item đã calibrate. Kho item tái sử dụng tăng dần theo thời gian — chi phí biên giảm, đây là lợi thế kinh tế của moat dữ liệu.
- Hard cap usage mỗi tài khoản; cảnh báo khi một học sinh vượt ngưỡng chi phí.
- LTV mục tiêu: sprint đầu + ít nhất 1 chu kỳ subscription hoặc 1 sprint mua lại trong năm học; nếu LTV dừng ở một sprint, mô hình không đứng được vì mùa vụ.

## 14. KPI và tiêu chí sống chết

Không đo giá trị bằng số lượt chat.

### 14.1 KPI theo giai đoạn

| Giai đoạn | KPI | Ngưỡng gợi ý ban đầu |
|---|---|---|
| Prototype | Luồng end-to-end chạy; goal intake < 5 phút | Hoàn thành |
| Beta | Completion: % học sinh hoàn thành ≥80% số buổi | ≥60%, hiệu chỉnh sau cohort đầu |
| Beta | % phụ huynh mở báo cáo tuần | ≥70% |
| Beta | Phụ huynh nói lại được con tiến bộ ở đâu (phỏng vấn) | Đa số |
| Beta | Bằng chứng before/after rõ trong báo cáo | 100% sprint hoàn thành |
| Beta | Tỷ lệ item AI bị đánh dấu lỗi sau verification + review | Theo dõi, giảm dần |
| Paid MVP | Phụ huynh trả tiền sprint đầu | Có, lặp lại được |
| Paid MVP | Mua lại sprint hoặc chuyển subscription | Theo dõi làm north-star |
| Paid MVP | Chi phí AI mỗi học sinh < doanh thu tương ứng | Bắt buộc |
| Paid MVP | Referral: % khách mới từ giới thiệu | Theo dõi |
| V1 | Delta điểm thi thật before/after (thu thập từ phụ huynh) | Ground truth chống tự huyễn |
| V1 | Retention sau sprint đầu (subscription hoặc sprint 2) | Theo dõi làm chỉ số sức khỏe |

Chỉ số delta điểm thi thật quan trọng vì đề mô phỏng nội bộ dễ rơi vào teaching to the test của chính mình.

### 14.2 Tiêu chí sống chết và điều kiện pivot

```text
Sống: một phụ huynh trả tiền cho một mục tiêu cụ thể, con học đủ sprint,
phụ huynh thấy bằng chứng tiến bộ rõ đến mức muốn mua tiếp.
```

Điều kiện xem xét pivot: completion rate vẫn thấp sau 2-3 vòng lặp thiết kế accountability (xem xét tier mentor người, hoặc chuyển phân khúc); phụ huynh xem báo cáo nhưng không trả tiền (vấn đề willingness-to-pay — xem lại giá hoặc phân khúc); chi phí AI không ép xuống dưới doanh thu (xem lại kiến trúc routing).

## 15. Sổ rủi ro

| # | Rủi ro | Mức | Giảm thiểu | Tín hiệu cảnh báo sớm |
|---|---|---|---|---|
| 1 | Học sinh không hoàn thành sprint (không ai ép ngồi học) | Cao nhất | Accountability layer 6.9; session ngắn; deadline thi thật; thử tier mentor | Completion beta < ngưỡng |
| 2 | AI dạy sai/sinh item lỗi | Cao | Math verification tự động; human review; báo lỗi có thưởng; giới hạn môn chấm khách quan | Tỷ lệ item lỗi không giảm |
| 3 | Đề mô phỏng lệch đề thật của trường | Cao | Upload đề cũ/ma trận; ngôn ngữ "mức sẵn sàng"; thu delta điểm thật | Phụ huynh phàn nàn sau kỳ thi |
| 4 | ChatGPT/Gemini miễn phí hút học sinh | Cao | Định vị 3.3; giá trị nằm ở cấu trúc + đo lường + báo cáo, không ở chat | Phụ huynh hỏi objection này và không bị thuyết phục |
| 5 | Đối thủ lớn (VioEdu, Gia sư AI ĐHQGHN) thêm parent goal builder | Trung-cao | Tốc độ; wedge hẹp làm sâu; vòng lặp calibration tích lũy; UX phụ huynh | Đối thủ ra tính năng tương tự |
| 6 | Chi phí AI ăn hết margin | Trung-cao | Model routing; kho item tái sử dụng; hard cap; dashboard ai_runs | Chi phí/học sinh vượt 30% giá |
| 7 | Mùa vụ doanh thu | Trung | Subscription bridge; gói hè; skill sprint quanh năm | Doanh thu tháng thấp điểm về 0 |
| 8 | Vi phạm dữ liệu trẻ em / PDPL | Trung, hậu quả lớn | Checklist mục 8 từ Sprint 1; pseudonymize; tư vấn pháp lý trước khi thu tiền | Không có consent record đầy đủ |
| 9 | Học sinh dùng AI khác gian lận | Trung | Đánh giá theo quá trình; vấn đáp ngẫu nhiên; trọng số hành vi | Mastery tăng bất thường, thi thật thấp |
| 10 | Founder quá tải (part-time, một người) | Trung | Scope kỷ luật mục 10.4; coding agent cho code; ưu tiên nội dung một môn một khối | Trễ mốc 2 giai đoạn liên tiếp |
| 11 | Sai kiến thức gây khủng hoảng niềm tin (một ca lan truyền) | Thấp tần suất, hậu quả lớn | Quy trình xử lý sự cố: nhận lỗi nhanh, sửa, công bố; không phòng thủ | Phản ánh trên hội nhóm phụ huynh |

## 16. Thương hiệu

### 16.0 Tên đã chốt: Flibby

Tên thương hiệu đã chốt là **Flibby** (đọc "phli-bi"). Quyết định dựa trên định hướng thị trường thuần nội địa: ngôn ngữ gốc là tiếng Việt, tối đa thêm tiếng Anh; không có kế hoạch bán ra quốc tế ở giai đoạn hiện tại (nếu mở rộng quốc tế sau này khi công ty đủ lớn, có thể chọn tên riêng cho thị trường ngoài — thị trường Việt Nam và quốc tế khá độc lập).

Trạng thái kiểm tra độ sạch (tính đến thời điểm chốt):
- Hiện diện công khai tại Việt Nam: sạch. Không tìm thấy app, công ty, hay sản phẩm giáo dục nào tên "Flibby" trên store hoặc báo chí Việt Nam; không đụng đối thủ cùng ngành. Lưu ý bối cảnh: app "FLIP" (quản lý thời gian học, của Rinasoft) phổ biến với học sinh Việt — khác chữ và khác âm rõ ("phlíp" vs "phli-bi"), rủi ro nhầm lẫn thấp.
- Hiện diện quốc tế: có "Flibbo" — app AI tạo nội dung của một công ty Dubai, doanh thu định kỳ, giữ domain flibbo.com. Cách "Flibby" một nguyên âm và cùng ngành AI. Với thị trường nội địa, rủi ro nhầm lẫn/tìm kiếm thấp vì Flibbo không hiện diện tại Việt Nam; đây là rủi ro cần lưu ý nếu sau này ra quốc tế.
- Nhãn hiệu chính thức: CHƯA xác nhận. Việc không thấy Flibby công khai không có nghĩa chưa ai đăng ký nhãn hiệu. Bắt buộc tra Cục Sở hữu trí tuệ Việt Nam nhóm 41 (giáo dục) và nhóm 9/42 (phần mềm) trước khi đăng ký, mua domain dài hạn, hay in ấn.

Việc cần làm để khép phần tên (theo thứ tự):
1. Tra cứu nhãn hiệu tại Cục Sở hữu trí tuệ Việt Nam nhóm 41 và 9 (cổng tra cứu trực tuyến của Cục, hoặc thuê đơn vị dịch vụ nhãn hiệu tra và nộp đơn). Đây là việc chặn duy nhất còn lại.
2. Giữ chỗ định danh số ngay khi tra xong: domain (flibby.vn, flibby.edu.vn, getflibby.com hoặc flibby.app — flibby.com có thể đã bị giữ) và handle Facebook/Zalo/TikTok.
3. Cân nhắc nộp đơn đăng ký nhãn hiệu sớm (Việt Nam theo nguyên tắc ai nộp trước được ưu tiên), kể cả khi sản phẩm chưa hoàn thiện.

Mascot và slogan: chưa chốt. Xem 16.6 (hướng mascot) — tên mascot và slogan để mở, quyết định sau. Ý "khôn hơn mỗi ngày / con giỏi hơn chính mình hôm qua" (nảy trong quá trình chọn tên) là ứng viên slogan tốt, khớp triết lý đo tiến bộ theo từng con thay vì xếp hạng — cân nhắc khi chốt slogan.

### 16.1 Ràng buộc đặt tên đã thống nhất (giữ để tham chiếu)

1. Phụ huynh Việt nhìn chữ viết đọc đúng ngay lần đầu: ưu tiên 2 âm tiết mở, không cụm phụ âm đầu khó (sp-, st-, gl-).
2. Không đụng thương hiệu đã ăn sâu ở thị trường Việt Nam (không chỉ toàn cầu).
3. Giữ được một ẩn dụ lõi: ánh sáng dẫn đường, bản đồ lộ trình, hoặc tín hiệu báo cáo.
4. Làm được cả tên mascot lẫn tên công ty.

Định hướng bổ sung sau thảo luận: ưu tiên từ coined (tự chế, không phải từ tiếng Anh phổ thông) để sở hữu được domain, SEO và nhãn hiệu với chi phí thấp; từ coined tốt nhất giấu một gốc có nghĩa bên trong làm chuyện kể marketing (kiểu Zalo, Momo). Lưu ý pháp lý: từ phổ thông dùng cho ngành không liên quan vẫn đăng ký nhãn hiệu được (arbitrary mark), nên danh sách 1 không bị loại vì lý do pháp lý mà vì lý do ownability.

### 16.2 Lưu trữ lịch sử — danh sách 1 (từ có nghĩa, đã cân nhắc trước khi chốt Flibby)

| Tên | Ẩn dụ | Ghi chú |
|---|---|---|
| Lantern | Đèn soi lộ trình; gợi đèn Trung thu | Khớp positioning nhất; mascot đom đóm trong lồng đèn; yếu về ownability (domain, SEO) |
| Ori | "Ánh sáng của tôi" (gốc Hebrew) | Ngắn, không đọc sai được; trùng nhân vật game Microsoft; tra nhãn hiệu khó vì quá ngắn |
| Beacon | Đèn hiệu dẫn đường + phát tín hiệu (khớp Parent Reporting) | Hơi corporate, kém dễ thương với trẻ |
| Atlas | Bản đồ lộ trình; quen thuộc vì Atlát Địa lí | Mất theme ánh sáng; trùng MongoDB Atlas trong stack |
| Fira | Gốc fire/firefly | Phonetics Việt tốt; tên tự chế nên phải tự xây nghĩa; hơi nữ tính |
| Remi | Đồ rê mi + cậu bé Rê-mi trong Không gia đình (tuổi thơ thế hệ phụ huynh 8x-9x) | Narrative đẹp; rủi ro liên tưởng Rémy Martin |

### 16.3 Lưu trữ lịch sử — danh sách 2 (từ coined, đã cân nhắc trước khi chốt Flibby)

| Xếp hạng | Tên | Gốc ẩn | Ghi chú |
|---|---|---|---|
| 1 | Lanto | Lantern nén 2 âm tiết | Giữ trọn chuyện lồng đèn + đom đóm; sở hữu được; đọc "lan-tô" không sai được |
| 2 | Faro | "Hải đăng" (Tây Ban Nha/Bồ) — vô nghĩa với người Việt | Ẩn dụ hải đăng ngầm; cần tra Faro Technologies (khác ngành, nhóm 41 nhiều khả năng sạch) |
| 3 | Soyo | Động từ "soi" Việt hóa vỏ ngoại | Bản sắc Việt ngầm, đối thủ ngoại không copy chuyện kể được; hãng bo mạch Soyo cũ đã chết |
| 4 | Firo | Fire + o | Cứu concept mascot đốm lửa/đom đóm; trùng tên một đồng cryptocurrency (khác ngành) |
| 5 | Ori | Như danh sách 1 | Đạt chuẩn coined; giữ làm phương án |

### 16.4 Đã loại và lý do (không quay lại)

- Kudo: đọc tiếng Việt thành "cu-đô". Kite: người Việt đọc "ki-tê" dù ẩn dụ bố mẹ giữ dây rất đẹp. Cùng nhóm lỗi: Niko ("ni cô"), Aivy ("ai vậy").
- Nova, Milo, Orion, Pilot: đã bị Novaland, Nestlé, ChocoPie, bút Pilot chiếm tâm trí người Việt. Firefly: Adobe đã lấy. Luxo: đèn Pixar. Deno: runtime JavaScript.
- Gốc spark-, glow-, st-: cụm phụ âm đầu buộc người Việt chèn nguyên âm ("xì-pác").
- Tên nhà bác học (Newton, Edison...): trường tư đã đăng ký nhiều, nghe như trường học không phải app.
- Nhóm giả Latin cũ (Domigo, Domago...): mùi Tây Ban Nha, nhầm Domingo/Domino.
- Hướng thuần Việt: "Đốm" trước hết là tên chó dân dã, giảm cảm giác nghiêm túc với người trả tiền là phụ huynh; "Đèn Đom" sai từ vựng (từ đúng là "đom đóm"); nếu quay lại hướng Việt, "Đom Đóm" trực diện đáng cân nhắc hơn.

### 16.4b Nhật ký các tên đã tra cứu thực tế (trước khi chốt Flibby)

Ghi lại để không lặp lại; kết quả từ tra cứu web hiện diện công khai (app store, mạng xã hội, thương mại), chưa phải tra cứu nhãn hiệu chính thức.

| Tên | Kết quả | Lý do không chọn |
|---|---|---|
| Flibby | Sạch tại VN; quốc tế đụng Flibbo (app AI Dubai) cách 1 nguyên âm | ĐÃ CHỌN — chấp nhận rủi ro Flibbo vì định hướng nội địa |
| Lango | Đụng dày đặc AI language tutor (Lango, Langotalk, Langua...) | Trùng nhiều thực thể cùng ngành; nghĩa "language" khóa sai ngách đa môn |
| Wisefly | Sạch ngành (chỉ đụng công ty hàng không khác ngành) | "Wise" kéo mascot về con cú, đụng hình ảnh Duolingo; ngược mascot đom đóm |
| Glowfly | Đụng "Glowfly Tutors" (gia sư cùng ngành) + nhãn hiệu ® Resideo | Trùng gia sư cùng ngành; từ gần-mô-tả nên khó sở hữu |
| Lumify | Nhãn hiệu ® mạnh của Bausch + Lomb (thuốc nhỏ mắt), bảo hộ bằng sáng chế | Bị tập đoàn toàn cầu bảo hộ; mất liên hệ đom đóm |
| Lanify | Đụng Lanify.ai (dự án crypto) | Liên tưởng crypto ngược tông; tên rỗng không gợi đom đóm |
| Lanigo | Không đụng edtech trực tiếp nhưng nằm trong cụm Lango/Lingo | Vọng nghĩa "lingo/ngôn ngữ"; lặp lại vùng đã loại |
| Lani (làm tên công ty) | Đụng "Lani Learning", "Lani Learning Centre", "Lana Learn" (cùng ngành giáo dục) | Trùng cơ sở giáo dục cùng ngành — chỉ dùng được làm tên mascot, không làm tên thương hiệu |

Bài học rút ra (áp dụng nếu sau này cần đổi/thêm tên): (1) mọi từ tiếng Anh rõ nghĩa, dễ đọc trong lĩnh vực học tập (lang-, lingo-, glow-, wise-, firefly, lumi-) đều đã đông hoặc bị bảo hộ — từ càng rõ nghĩa càng nhiều người tới trước; (2) ghép "X + fly" đủ chữ vừa khó đọc (cụm phụ âm cuối) vừa gần-mô-tả nên dễ trùng; (3) tên tự chế rỗng nghĩa thì sạch hơn nhưng mất khả năng kể chuyện; (4) không có tên hoàn hảo trên mọi tiêu chí — chọn tên là chọn đánh đổi rủi ro nào chấp nhận được; (5) tên mascot và tên thương hiệu không nhất thiết là một từ — tách hai vai giải phóng nhiều ràng buộc.

### 16.5 Quy trình chốt tên (đã hoàn thành cho Flibby; giữ để tham chiếu nếu cần đổi tên)

1. Phép thử rẻ trước: viết từng tên ra giấy, đưa 5 phụ huynh đọc to; tên bị đọc sai dù một lần thì loại.
2. Checklist thẩm định: domain .vn và .com.vn; App Store; Google Play; Facebook/TikTok/YouTube/Zalo; tra nhãn hiệu Việt Nam nhóm 41 (giáo dục) và nhóm 9/42 (phần mềm/SaaS).
3. Lưu ý: các nhận định trùng thương hiệu ở trên là đánh giá sơ bộ chưa qua tra cứu chính thức; bước 2 là bắt buộc trước khi chốt.
4. Không cần chốt sớm: tên đúng sẽ rõ hơn sau khi nói chuyện với 20 phụ huynh đầu tiên.

### 16.6 Mascot (hướng — chưa chốt tên mascot)

Hướng nhất quán từ đầu: đốm sáng/đom đóm phát sáng theo tiến bộ học tập. Tránh cú mèo (Duolingo) — đây là lý do đã loại các hướng tên gợi "wise" (wise kéo về con cú). Tên thương hiệu Flibby không mang nghĩa "đom đóm" tường minh, nên mascot đom đóm và câu chuyện thương hiệu (ánh sáng dẫn đường, tri thức tỏa từ bên trong đứa trẻ) sẽ gánh phần kể chuyện đó.

Tính cách: thông minh, hơi tinh nghịch, nhắc học đều, không mắng, soi lỗi, khen bằng bằng chứng. Behavior: hoàn thành bài thì sáng hơn; sai thì soi ra lỗi; bỏ học thì nhắc nhẹ và báo phụ huynh theo accountability layer (lưu ý ràng buộc pháp lý ở báo cáo pháp lý: notification trần tần suất, giọng trung tính); ôn thi bật sprint mode; học kỹ năng mở project mode.

Tên mascot: để mở. Ứng viên "Lani" đã cân nhắc (dễ đọc, dễ thương, làm tên nhân vật tốt — không dùng làm tên công ty được vì trùng cơ sở giáo dục cùng ngành). Quyết định sau, có thể sau khi nói chuyện với 20 phụ huynh đầu tiên.

## 17. Quyết định đã chốt và còn mở

### 17.1 Đã chốt

```text
Chiến lược:   Parent-first, không tutor-first, không student-first.
Thesis:       Bán quyền kiểm soát quá trình học cho phụ huynh, không chỉ bán khóa học.
Sản phẩm:     Không phải chatbot. Hệ thống tạo lộ trình, dạy, kiểm tra, đo, điều chỉnh, báo cáo.
MVP:          Learning Sprint, ưu tiên ôn thi cấp tốc cá nhân hóa.
Moat:         Learner profile + Assessment Intelligence + Mastery Tracking + Parent Reporting.
Dữ liệu:      Là tài sản chính. Không cào dữ liệu đối thủ. Lưu có mục đích, có quyền xóa.
Tech stack:   Next.js + shadcn/ui + FastAPI + MongoDB Atlas + Redis + R2/S3.
Learner model: Loại bỏ learning styles; chỉ dùng biến hành vi có bằng chứng.
Assessment:   Có math verification tự động; có vòng lặp calibration; có upload đề cũ trong MVP.
Vận hành:     Có accountability layer; human review nội dung, AI không tự publish.
Ngôn ngữ:     Không dùng "thay thế gia sư" và "dự đoán điểm thi" trong truyền thông.
Phân phối:    Giáo viên/gia sư là kênh referral có hoa hồng, không phải user.
Branding:     Tên đã chốt: Flibby. Còn tra nhãn hiệu chính thức (mục 16.0). Mascot/slogan để mở.
```

### 17.2 Còn mở

- Tên thương hiệu: đã chốt Flibby; còn tra nhãn hiệu chính thức tại Cục Sở hữu trí tuệ Việt Nam nhóm 41 và 9 trước khi đăng ký/in ấn (mục 16.0).
- Tên mascot và slogan: để mở (ứng viên slogan "khôn hơn mỗi ngày"; ứng viên tên mascot "Lani").
- Use case đầu tiên: khuyến nghị ôn thi Toán THCS; xác nhận khối lớp cụ thể (gợi ý lớp 8: đủ khó để có giá trị, chưa áp lực chuyển cấp như lớp 9).
- Điểm giá cụ thể trong khung giả thuyết mục 13.2.
- Thử nghiệm chính sách hoàn tiền có điều kiện.
- Ngưỡng completion rate chính thức sau cohort beta đầu tiên.

## 18. Việc cần làm ngay (2 tuần tới)

1. Thiết kế chi tiết accountability layer (luồng cam kết ba bên, notification rules) — trên giấy trước khi code.
2. Xây skill graph Toán 8 phạm vi một kỳ thi từ yêu cầu cần đạt GDPT 2018, làm tay, nhờ một giáo viên Toán quen kiểm chứng.
3. Dựng pipeline sinh item + SymPy verification, chạy thử 50 item, đo tỷ lệ lỗi trước/sau verification.
4. Viết parser đề cũ (tận dụng pipeline PDF-to-Markdown sẵn có) với 3-5 đề giữa kỳ Toán 8 thu thập được.
5. Prototype goal intake + report mẫu; đưa report mẫu cho 5 phụ huynh quen xem, hỏi họ hiểu gì và có trả tiền cho thứ này không.
6. Tra cứu nhãn hiệu "Flibby" tại Cục Sở hữu trí tuệ Việt Nam nhóm 41 và 9 (việc chặn cuối cho phần tên); nếu sạch, giữ domain và handle social, cân nhắc nộp đơn đăng ký sớm.
7. Lập danh sách 30-50 phụ huynh tiềm năng cho beta từ mạng lưới cá nhân, ghi rõ con lớp mấy và kỳ thi gần nhất.

## Phụ lục A. Nguồn tham khảo chính

Bằng chứng hiệu quả AI tutoring:

- Kestin và cộng sự, "AI tutoring outperforms in-class active learning", Scientific Reports (Nature), 2025.
- LearnLM Team (Google) và Eedi, "AI tutoring can safely and effectively support students: An exploratory RCT in UK classrooms", 2025-2026.
- Stanford SCALE Initiative, nghiên cứu Tutor CoPilot với FEV Tutor (900 gia sư, 1.800 học sinh).

Pháp lý Việt Nam:

- Luật Bảo vệ dữ liệu cá nhân số 91/2025/QH15, hiệu lực 01/01/2026.
- Nghị định 356/2025/NĐ-CP hướng dẫn Luật BVDLCN, hiệu lực 01/01/2026, thay thế Nghị định 13/2023/NĐ-CP.
- Thông tư 29/2024/TT-BGDĐT về dạy thêm học thêm, hiệu lực 14/02/2025.
- Thông tư 19/2026/TT-BGDĐT sửa đổi Thông tư 29, hiệu lực 15/05/2026.
- Chương trình giáo dục phổ thông 2018 (yêu cầu cần đạt theo môn, lớp) — xương sống skill graph.

Thị trường và cạnh tranh:

- ĐHQGHN và Z.AI: dự án Gia sư AI, kết quả PoC công bố tháng 3-4/2026.
- Aiducation.vn: nghiên cứu hiệu quả trên 180 học sinh phổ thông Hà Nội và TP.HCM.
- VioEdu, Onluyen.vn, VMathAI, Vuihoc, HOCMAI: phân tích ở mục 5.1.

Ghi chú phương pháp: các con số định giá, ngưỡng KPI và tỷ lệ chi phí trong tài liệu là giả thuyết làm việc để kiểm chứng, không phải dữ liệu thị trường đã xác minh, và được đánh dấu tương ứng tại chỗ.
