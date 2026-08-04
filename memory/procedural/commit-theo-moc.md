---
name: commit-theo-moc
type: procedural
created: 2026-08-04
modified: 2026-08-04
description: Người dùng yêu cầu commit theo mốc tiến trình — mỗi quyết định/việc chốt xong là một commit riêng ngay lúc đó
---

Phản hồi người dùng (04/08/2026): "bạn phải commit chuẩn theo tiến trình để sau còn dễ truy diff" — sau khi tôi để 3 mốc (chốt tech stack, chốt test strategy, quy tắc mobile) dồn thành một đống uncommitted.

**Why:** diff của mỗi quyết định phải truy ngược được riêng; dồn nhiều mốc vào một commit làm mất khả năng đó.

**How to apply:** ngay khi một mốc hoàn thành (người dùng chốt một quyết định, một việc xong trọn vẹn) → commit riêng ngay + push, không chờ người dùng nhắc. Quy tắc đã ghi vào CLAUDE.md mục Kỷ luật git. Liên quan: [[architect-subagent-workflow]].
