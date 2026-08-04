---
name: docs-la-ban-nhap
type: semantic
created: 2026-08-04
modified: 2026-08-04
description: Toàn bộ kiến trúc/kế hoạch/tech stack trong docs chỉ là bản nháp demo — user sẽ nghiên cứu lại từng phần trước khi triển khai
---

Người dùng tuyên bố (04/08/2026): kiến trúc dự án trong các tài liệu, kể cả kế hoạch triển khai, "tất cả chỉ là demo". Trong quá trình làm, người dùng sẽ nghiên cứu kỹ lại từng phần rồi mới triển khai.

Ngoại lệ đã chốt thật sau đó: **tech stack** (04/08/2026 — xem [[tech-stack-da-chot]]).

Hệ quả cho agent:
- KHÔNG coi chữ "đã chốt" trong `docs/background/*.md` là quyết định cuối — đó là trạng thái của bản nháp
- Mọi phần (stack, kiến trúc engine, lộ trình, giá) chỉ build sau khi người dùng xác nhận riêng phần đó trong hội thoại
- Các ràng buộc PHÁP LÝ (cấm sinh trắc học, formative-only, notification digest, dữ liệu trẻ em) vẫn giữ nguyên vì bắt nguồn từ luật, không phải từ lựa chọn kiến trúc
- Trạng thái repo: chuyển private 04/08/2026 sau khi phát hiện public → người dùng chủ động chuyển LẠI PUBLIC cùng ngày ("cho dễ kiểm thử, không sao cả") — đã cảnh báo docs/background chứa chiến lược/giá, người dùng chấp nhận; nếu giữ public lâu dài cân nhắc tách docs nhạy cảm
