---
name: viet-spec-va-bao-cao
type: procedural
created: 2026-08-05
modified: 2026-08-05
description: Hai bài học 05/08 — báo cáo thiết kế phải tường minh (user ghét ngắn gọn gây nhầm), và DoD phải là bất biến chứ không phải con số thời điểm
---

**1. Báo cáo thiết kế: tường minh hơn là ngắn gọn.**
Người dùng nói thẳng: *"các lệnh tường minh chút cho đỡ nhầm, bạn ngắn gọn quá lại nhầm"*. Khi trình một thiết kế để duyệt, phải có: tên đặt rõ nghĩa (`dev-start` chứ không `dev`), **bảng ma trận** nói chính xác từng lệnh động vào từng thành phần thế nào, và diễn giải bằng lời cho các trường hợp dễ nhầm. Ngắn gọn chỉ đúng khi báo cáo kết quả, không đúng khi trình phương án.

**Why:** người dùng phải ra quyết định dựa trên báo cáo đó; thiếu chi tiết là đẩy rủi ro hiểu nhầm sang họ.

**2. Tiêu chí nghiệm thu (DoD) phải là BẤT BIẾN, không phải con số thời điểm.**
Trong spec bộ lệnh, tôi viết hai tiêu chí sai và cả hai đều bị chính quá trình thực thi phơi bày:
- *"docker-clean giải phóng ≥10GB"* — con số lấy từ một lần đo build cache 15.75GB; chính các lần build ở task trước đã tiêu thụ hết nên tiêu chí thành bất khả thi. Đúng phải là: "in bảng trước/sau và volume có tên còn nguyên".
- *"kiểm tra cổng 5432 bận thì dừng"* — sai về bản chất: Postgres của chính dự án thường đang chiếm cổng đó, kiểm tra sẽ tự chặn mình.

**How to apply:** khi viết DoD, tự hỏi "tiêu chí này còn đúng sau 3 tháng, trên máy khác không?" Nếu phụ thuộc trạng thái máy tại một thời điểm → viết lại thành bất biến. Và mỗi điều kiện kiểm tra phải soi ngược: hệ thống chạy bình thường có vi phạm điều kiện này không?

Liên quan: [[bay-moi-truong-dev]], [[commit-theo-moc]].
