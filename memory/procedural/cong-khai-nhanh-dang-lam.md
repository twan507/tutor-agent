---
name: cong-khai-nhanh-dang-lam
type: procedural
created: 2026-08-07
modified: 2026-08-07
description: Người dùng yêu cầu luôn được báo tên nhánh + thư mục làm việc ngay khi có nhánh/worktree mới, để tự kiểm tra được
---

Phản hồi người dùng (07/08/2026): "lập nhánh mới thì repo hiển thị phải hiển thị cho tôi nhánh đang làm việc, vậy tôi mới check được." Bối cảnh: desktop app Claude Code tự tạo worktree `claude/<slug-phiên>-<mã>` cho mỗi phiên mới, người dùng không biết mình đang ở nhánh nào cho tới khi hỏi lại, tưởng có việc dở dang chưa merge.

**Why:** người dùng kiểm soát cây nhánh bằng mắt. Nhánh sinh ra âm thầm thì họ mất khả năng đối chiếu "code tôi thấy" với "code đang được sửa" — và với worktree tự tạo, họ còn nghi ngờ mình quên merge.

**How to apply:** ngay khi có nhánh mới hoặc chuyển nhánh (kể cả nhánh do công cụ tự tạo, không chỉ nhánh mình lập), nói rõ trong phản hồi: tên nhánh, đường dẫn thư mục làm việc, và nhánh gốc cắt ra. Push sớm để nhánh hiện trên remote. Đầu phiên: nếu phát hiện đang ở worktree/nhánh không phải nơi người dùng nghĩ, báo trước khi làm bất cứ việc gì. Đã ghi thành quy tắc trong CLAUDE.md mục Kỷ luật git. Liên quan: [[commit-theo-moc]].
