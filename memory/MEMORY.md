# MEMORY — chỉ mục bộ nhớ dự án Rangi (tutor-agent)

Trần cứng: 150 dòng. Vượt trần → phải thu gọn trước khi thêm entry mới.
Mỗi dòng: `- [name](đường-dẫn) — hook một câu`. Chi tiết nằm trong file, không nằm ở đây.

## Procedural (quy ước làm việc — ưu tiên đọc khi bắt đầu phiên)

- [architect-subagent-workflow](procedural/architect-subagent-workflow.md) — session chính là kiến trúc sư, tay chân giao Sonnet subagent, task nhỏ tự làm, không tham chiếu file ngoài repo
- [commit-theo-moc](procedural/commit-theo-moc.md) — mỗi mốc chốt xong = commit riêng ngay + push, không dồn; user nhắc 04/08
- [cong-khai-nhanh-dang-lam](procedural/cong-khai-nhanh-dang-lam.md) — luôn báo tên nhánh + thư mục làm việc ngay khi có nhánh/worktree mới (kể cả do app tự tạo); user nhắc 07/08
- [bay-moi-truong-dev](procedural/bay-moi-truong-dev.md) — CRLF gây báo động giả prettier (đã chữa bằng .gitattributes, đừng prettier --write hàng loạt); kho pnpm ngoài repo là bình thường
- [khong-de-kien-thuc-chet-theo-phien](procedural/khong-de-kien-thuc-chet-theo-phien.md) — mỗi quyết định lớn để lại 3 tầng tài liệu (research/brand-spec/CLAUDE.md); user không phải bộ nhớ dự phòng
- [viet-spec-va-bao-cao](procedural/viet-spec-va-bao-cao.md) — báo cáo thiết kế phải tường minh (user ghét ngắn gọn gây nhầm); DoD phải là bất biến, không phải con số gắn thời điểm

## Semantic (fact dự án: kiến trúc, quyết định sản phẩm)

- [docs-la-ban-nhap](semantic/docs-la-ban-nhap.md) — kiến trúc/kế hoạch trong docs bao-cao-* chỉ là demo, user chốt lại từng phần trước khi build; ràng buộc pháp lý vẫn giữ
- [tech-stack-da-chot](semantic/tech-stack-da-chot.md) — stack ĐÃ chốt 04/08 (Django/Next/Postgres/VPS, lý do từng vòng); tên đã đổi: RANGI chốt 05/08 (xem thuong-hieu-da-chot)
- [nao-ai-da-chot](semantic/nao-ai-da-chot.md) — 05/08: MiniMax M3 mọi vai (lý do ngân sách), harness tự viết ai_call()/routing/state-machine, điều kiện pseudonymize triệt để + kiểm ToS under-16
- [thuong-hieu-da-chot](semantic/thuong-hieu-da-chot.md) — 05/08: tên RANGI (chờ tra SHTT), màu hổ phách+lục bảo user tự chỉnh, font C (PhuDu display), đỏ-cho-câu-sai có bằng chứng, mascot đom đóm anti-Duolingo

## Episodic (nhật ký quyết định theo phiên — được phép cũ đi)

(chưa có)
