---
name: bay-moi-truong-dev
type: procedural
created: 2026-08-05
modified: 2026-08-05
description: Hai bẫy môi trường dev đã tốn thời gian nhiều phiên — CRLF gây báo động giả prettier, và kho pnpm nằm ngoài repo
---

**Bẫy 1 — CRLF gây báo động giả format (đã chữa 05/08/2026).**
Windows với `core.autocrlf=true` để CRLF trên đĩa; Prettier mặc định đòi LF → báo "sai format" hàng loạt file dù nội dung trong git hoàn toàn đúng và CI (Linux) luôn xanh. Đã tốn thời gian của 3 lượt agent khác nhau: reviewer Task 1 logo tưởng lỗi task, agent Task 4 chạy `prettier --write` ngoài phạm vi để "chữa", kiến trúc sư điều tra lại lần nữa.

**Why:** triệu chứng (nhiều file "sai format" cùng lúc, không ai sửa chúng) trông y hệt lỗi thật.

**How to apply:** repo đã có `.gitattributes` ép `* text=auto eol=lf` — máy mới clone về là đúng ngay. Nếu vẫn gặp: kiểm chứng bằng `pnpm exec prettier --check --end-of-line auto .` (sạch = báo động giả), chữa bằng `git rm --cached -r . && git reset --hard`. TUYỆT ĐỐI không `prettier --write` hàng loạt để dập triệu chứng — tạo diff rác toàn repo. Chi tiết: CLAUDE.md mục "Môi trường dev — bẫy đã biết".

**Bẫy 2 — kho pnpm ở ngoài repo.** `D:\.pnpm-store` (~1.9GB) sinh ra ở gốc ổ D là mặc định của pnpm (kho dùng chung phải cùng ổ với node_modules để hardlink). Người dùng đã hỏi và quyết định **để nguyên**. Không phải vi phạm quy tắc "mọi thứ trong repo" — quy tắc đó nói về tài liệu/dữ liệu dự án, không phải cache công cụ. Liên quan: [[commit-theo-moc]].
