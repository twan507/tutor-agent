---
name: architect-subagent-workflow
type: procedural
created: 2026-08-04
modified: 2026-08-04
description: Session chính là kiến trúc sư/quản lý; việc tay chân giao subagent Sonnet; task nhỏ tự làm
---

Phương pháp phân công đã chốt với người dùng (04/08/2026):

1. Session chính (Fable/Opus) là lớp kiến trúc sư — quản lý: hiểu yêu cầu, thiết kế, quyết định, giao việc, review.
2. Trước mỗi task tự đánh giá: task nhỏ (sửa 1-2 file, tra cứu nhanh) tự làm luôn — chính xác hơn và đỡ tốn token; việc tay chân khối lượng lớn (code nhiều file theo spec, khảo sát rộng, việc song song được) giao subagent chạy model **Sonnet**.
3. Đề bài giao subagent phải tự đủ: spec rõ, đường dẫn file, tiêu chí hoàn thành kiểm chứng được — subagent không có ngữ cảnh hội thoại.
4. Kết quả subagent phải được session chính review trước khi chấp nhận.
5. Không tham chiếu file ngoài repo trong bất kỳ tài liệu nào — tài liệu cần thiết phải chép vào `docs/`.
