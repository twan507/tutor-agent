# TASKS — Flibby

Backlog theo dõi công việc. Quy ước: `[ ]` chưa làm, `[x]` xong, `[~]` đang làm. Mỗi mục ghi rõ ai làm (USER / AGENT / CẢ HAI). Việc từ tài liệu nháp chỉ là ứng viên — phải được người dùng chốt trước khi thực hiện.

## Quyết định đang chờ người dùng chốt

- [ ] **Mục tiêu lịch beta**: hạn 15/08/2026 (lưới pháp lý 1) còn 11 ngày — phi thực tế từ repo trống. Lưới 2: đưa vào hoạt động trước 15/02/2027 → hạn nghĩa vụ 01/03/2027. Cần chốt mốc mới để kế hoạch bám theo. (USER)
- [ ] Khối lớp cụ thể cho use case đầu (tài liệu gợi ý lớp 8) (USER)
- [ ] Chốt stack thật cho từng phần trước khi build (hiện chỉ là định hướng nháp) (USER)

## Việc phi-code (từ báo cáo §18 — ứng viên, chưa chốt)

- [ ] Tra cứu nhãn hiệu "Flibby" tại Cục SHTT nhóm 41 và 9; nếu sạch: giữ domain + handle social, cân nhắc nộp đơn sớm (USER)
- [ ] Lập danh sách 30-50 phụ huynh tiềm năng cho beta → lưu trong `private/`, KHÔNG commit (USER)
- [ ] Tìm giáo viên Toán quen kiểm chứng skill graph (USER)

## Việc kỹ thuật (ứng viên từ tài liệu nháp — làm sau khi nghiên cứu lại và chốt từng phần)

- [ ] Thiết kế accountability layer trên giấy (CẢ HAI)
- [ ] Skill graph Toán phạm vi một kỳ thi từ yêu cầu cần đạt GDPT 2018 (CẢ HAI)
- [ ] Pipeline sinh item + SymPy verification, thử 50 item, đo tỷ lệ lỗi (AGENT, sau khi có spec được duyệt)
- [ ] Parser đề cũ PDF-to-Markdown với 3-5 đề giữa kỳ (AGENT, sau khi có spec được duyệt)
- [ ] Prototype goal intake + report mẫu cho 5 phụ huynh xem (CẢ HAI)

## Hạ tầng repo (hoãn có điều kiện — trigger ghi kèm)

- [ ] Scaffold monorepo + toolchain (pnpm/uv, lint, test runner) — khi chốt stack (AGENT)
- [ ] CI GitHub Actions lint + test — khi có code đầu tiên (AGENT)
- [ ] `.env.example` — khi có service cần env (AGENT)
- [ ] PostToolUse auto-lint hook + Stop hook chạy test — khi có linter/test thật (AGENT)
- [ ] Branch protection cho `main` trên GitHub + cài `gh` CLI — khi bắt đầu làm việc theo PR (USER + AGENT)

## Đã xong

- [x] 04/08/2026 — Bộ khung vận hành: CLAUDE.md (Karpathy + phân công architect/subagent + memory + hành xử chuyên nghiệp), memory/, docs/ + index, hooks cưỡng chế, code-reviewer agent, git + GitHub (đã chuyển private)
