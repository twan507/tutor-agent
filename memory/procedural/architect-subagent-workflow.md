---
name: architect-subagent-workflow
type: procedural
created: 2026-08-04
modified: 2026-08-07
description: Session chính là kiến trúc sư/quản lý; việc tay chân giao subagent Sonnet; task nhỏ tự làm
---

Phương pháp phân công đã chốt với người dùng (04/08/2026):

1. Session chính (Fable/Opus) là lớp kiến trúc sư — quản lý: hiểu yêu cầu, thiết kế, quyết định, giao việc, review.
2. Trước mỗi task tự đánh giá: task nhỏ (sửa 1-2 file, tra cứu nhanh) tự làm luôn — chính xác hơn và đỡ tốn token; việc tay chân khối lượng lớn (code nhiều file theo spec, khảo sát rộng, việc song song được) giao subagent chạy model **Sonnet**.
3. Đề bài giao subagent phải tự đủ: spec rõ, đường dẫn file, tiêu chí hoàn thành kiểm chứng được — subagent không có ngữ cảnh hội thoại.
4. Kết quả subagent phải được session chính review trước khi chấp nhận.
5. Không tham chiếu file ngoài repo trong bất kỳ tài liệu nào — tài liệu cần thiết phải chép vào `docs/`.

**Bổ sung 07/08/2026 — ranh giới "task nhỏ" hẹp hơn tôi tưởng.** Khi thực thi một plan nhiều task, tôi tự code hết Task 1-4 với lý do "mỗi task một file nhỏ, vòng TDD cần nhìn output ngay". Người dùng hỏi lại: "ơ tự code chứ không dùng subagent để code à?" — tức là **thực thi plan đã duyệt là việc tay chân, mặc định phải giao**, kể cả khi từng task nhỏ. Lý do "tôi làm nhanh hơn" không phải căn cứ; người dùng trả tiền cho kiến trúc sư đọc kết quả, không phải cho kiến trúc sư gõ phím.

Ranh giới thực tế rút ra: tự làm phần cần **nhìn output rồi quyết ngay** (vòng TDD đỏ→xanh đầu tiên của một seam mới, dò lỗi, so ảnh render); giao subagent phần đã có **spec/plan viết sẵn và tiêu chí kiểm chứng được** (sinh file hàng loạt, sửa tài liệu nhiều chỗ, chạy gate rồi commit). Xem thêm [[cong-khai-nhanh-dang-lam]].
