---
name: khong-de-kien-thuc-chet-theo-phien
type: procedural
description: Kết luận thì dễ ghi, lý lẽ mới là thứ mất — mỗi quyết định lớn phải để lại 3 tầng tài liệu; người dùng không phải bộ nhớ dự phòng
metadata:
  type: feedback
---

Người dùng chất vấn cuối phiên 05/08/2026: *"các kiến thức đều được cập nhật đúng quy trình sẽ không sót gì như sổ tay Rangi trong các phiên sau chứ, vì không phải lúc nào tôi cũng nhớ mà nhắc bạn đâu."*

Sự thật lúc đó: quy tắc cũ KHÔNG đảm bảo được. Nó phủ `memory/` (chỉ mục ngắn) và bắt `docs/` có dòng index, nhưng không bắt tài liệu giải nghĩa phải TỒN TẠI. Nên phần "vì sao" và "cách kể chuyện" rơi vào khoảng trống — bộ nhận diện Rangi chốt xong mà toàn bộ ý nghĩa (ba tầng nghĩa của tên, 7 hướng marketing, điển tích văn hóa) chỉ sống trong hội thoại, suýt chết theo phiên.

**Why:** kết luận (hex màu, tên font, tên lệnh) là phần dễ ghi nhất và cũng ít giá trị nhất — phiên sau đọc code là ra. Lý lẽ đằng sau thì không tái tạo được, mà đó mới là thứ dùng khi viết quảng cáo, brief designer, hay bảo vệ quyết định trước chất vấn.

**How to apply:** đã thành quy tắc 5 trong CLAUDE.md mục Quy tắc bộ nhớ — mỗi quyết định có sức sống dài để lại 3 tầng: `docs/research/` (vì sao chọn, đánh đổi, điều kiện đổi chiều) → `docs/brand/` hoặc `docs/specs/` (ý nghĩa, cách dùng) → `CLAUDE.md` (quy tắc bắt buộc rút gọn). Và reflection cuối phiên có thêm câu hỏi (d): *có kiến thức nào chỉ tồn tại trong hội thoại này không?*

Lưu ý trung thực: đây là quy tắc MỀM (agent tự giác), không phải hook cưỡng chế được — xem [[bay-moi-truong-dev]] về giới hạn của quy tắc mềm. Lưới thứ hai là câu hỏi cuối phiên; người dùng KHÔNG phải là lưới đó.
