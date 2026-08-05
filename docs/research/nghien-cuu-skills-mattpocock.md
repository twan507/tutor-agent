# Nghiên cứu: học gì từ repo mattpocock/skills cho harness của tutor-agent

**Ngày**: 05/08/2026 · **Trạng thái**: ĐÃ CHỐT và áp dụng cùng ngày (người dùng duyệt trong hội thoại)
**Nguồn khảo sát**: https://github.com/mattpocock/skills — bộ agent skills của Matt Pocock ("Skills For Real Engineers"), đọc toàn bộ README + các skill engineering/productivity chính (bản clone tại thời điểm khảo sát).

## Câu hỏi

Harness hiện tại (CLAUDE.md + superpowers + code-reviewer + memory/) đã ép agent hành xử như kỹ sư cao cấp. Repo của Pocock có kỹ thuật nào **thật sự mới** đáng bồi vào không — theo nguyên tắc hoàn thiện hơn, không bỏ cái cũ đang tốt?

## Kết luận: 5 kỹ thuật được nhận, 4 nhóm bị loại

### Đã nhận (áp dụng 05/08/2026)

**1. `CONTEXT.md` — glossary song ngữ (từ skill `domain-modeling`)** — giá trị nhất.

- **Lý do nhận**: dự án nặng domain (mastery, item, attempt, calibration, readiness…) và song ngữ — hội thoại tiếng Việt, code tiếng Anh, trước đó KHÔNG có nguồn nào nối hai bên → nguy cơ mỗi phiên dịch một kiểu, tên biến trôi dạt. Mục "Ngôn ngữ và thuật ngữ" trong CLAUDE.md thực chất đã là proto-glossary nhưng chỉ có vế cấm (`_Tránh_`), thiếu vế định nghĩa dương. Lợi ích phụ đã được Pocock kiểm chứng: agent nói ngắn lại ("materialization cascade" thay cho cả đoạn giải thích), đặt tên nhất quán, đỡ token suy nghĩ.
- **Cách áp dụng**: `CONTEXT.md` ở gốc repo, mỗi khái niệm = tên VN canonical + tên EN canonical + định nghĩa 1-2 câu + danh sách `_Tránh_`. Quy tắc "chỉ là glossary" giữ nguyên từ bản gốc (không nhét implementation detail). Định nghĩa rút từ docs/background + CLAUDE.md, không bịa mới.
- **Điều kiện đổi chiều**: nếu repo tách nhiều bounded context thật (ví dụ billing tách khỏi learning), nâng cấp lên mô hình `CONTEXT-MAP.md` + nhiều CONTEXT.md con như bản gốc mô tả.

**2. Grilling theo frontier (từ skill `grilling`)** — nâng cấp bước brainstorm.

- **Lý do nhận**: brainstorming của superpowers nói "làm rõ yêu cầu" nhưng không cho cơ chế; grilling cho đúng cái thiếu: mô hình cây quyết định + frontier (chỉ hỏi câu đã đủ tiền đề, câu phụ thuộc để vòng sau) + mỗi câu kèm đề xuất trả lời + tiêu chí dừng kiểm được (frontier rỗng = hết giả định ngầm). Phân công lao động rõ: fact agent tự tra, quyết định mới hỏi người dùng — khớp quy tắc Karpathy "không tự đoán thay người dùng" nhưng vận hành được.

**3. Debug có kỷ luật (từ skill `diagnosing-bugs`)** — bồi vào systematic-debugging.

- **Lý do nhận**: ba kỹ thuật không có trong harness cũ, đều có completion criterion kiểm được: (a) gate "chưa có lệnh đỏ được thì chưa được đặt giả thuyết" — chặn đúng thói xấu phổ biến nhất của agent là đọc code đoán mò; (b) 3-5 giả thuyết xếp hạng, mỗi cái falsifiable — chống anchor bias giả thuyết đầu tiên; (c) log debug gắn prefix `[DEBUG-xxxx]` — biến dọn dẹp thành một lệnh grep, chặn log rác lọt commit.

**4. Review hai trục Chuẩn + Spec (từ skill `code-review`)**.

- **Lý do nhận**: quy trình của mình LUÔN có spec được duyệt trong `docs/specs/` và đã có quy tắc "mỗi dòng diff truy ngược được về yêu cầu" — nhưng code-reviewer cũ không có ai kiểm tra hệ thống điều đó. Trục Spec (thiếu / sai / scope creep, trích dẫn dòng spec) lấp đúng lỗ. Kèm baseline 6 code smell Fowler chọn lọc (luôn là judgement call, quy tắc repo thắng baseline) và anti-pattern tautological test.
- **Điều chỉnh so với bản gốc**: bản gốc chạy 2 subagent song song rồi aggregate; mình gộp vào một agent code-reviewer duy nhất nhưng buộc báo cáo hai mục tách biệt, không gộp xếp hạng — đơn giản hơn, đủ cho quy mô hiện tại. Nếu review bắt đầu sót vì context dài, tách lại thành 2 subagent song song như bản gốc.

**5. Kỷ luật viết-cho-agent (từ skill `writing-for-agents`)** — áp vào vòng reflection memory.

- **Lý do nhận**: CLAUDE.md/MEMORY.md sẽ chỉ phình ra nếu không có phép thử xóa. Ba công cụ được nhận: (a) săn no-op — câu mà model mặc định đã làm đúng là câu vô nghĩa, xóa; (b) môi trường là source of truth — tài liệu chép lại thứ tra được từ config/code là cache dễ ôi; (c) bộ lọc 3 tiêu chí cho "quyết định lớn" (khó đảo ngược + gây ngạc nhiên nếu thiếu context + có trade-off thật) — trước đó quy tắc ba tầng tài liệu không có ngưỡng vào, nguy cơ mọi quyết định vặt cũng đòi một file research.

### Đã loại (và điều kiện xem lại)

1. **`to-tickets` khuyên "tránh ghi đường dẫn file cụ thể trong ticket vì mau ôi"** — ngược trực diện quy tắc plan của mình (nội dung file thật, lệnh thật, expected thật, không placeholder). Khác biệt có chủ đích: ticket của Pocock sống lâu trên tracker chờ agent bất kỳ nhặt; plan của mình viết xong là thực thi ngay trong ngày bởi subagent không có ngữ cảnh. **Giữ cách của mình.** Xem lại nếu chuyển sang mô hình backlog dài hạn nhiều agent nhặt việc.
2. **Hạ tầng tracker (`triage`, `wayfinder`, `setup`, label)** — thiết kế cho team dùng GitHub Issues/Linear; solo + TASKS.md thì là overhead thuần. Xem lại khi có thành viên thứ hai.
3. **`git-guardrails`** — `guard-bash.sh` hiện tại đã chặn rộng hơn (rm -rf, --no-verify, .env, docker volume) so với bản của Pocock (chỉ git).
4. **`tdd`, `handoff`, `research`, `prototype` (phần lớn nội dung)** — trùng superpowers TDD, cơ chế compact của Claude Code, quy ước `docs/research/` sẵn có. Chỉ nhặt hai mảnh từ `tdd`: khái niệm **seam chốt trước** (test đặt tại ranh giới public đã duyệt trong plan) và anti-pattern **tautological test** — cả hai đã vào quy tắc test số 10.

## Vị trí các thay đổi

| Kỹ thuật | File |
|---|---|
| Glossary song ngữ | `CONTEXT.md` (gốc repo) |
| Grilling frontier | `CLAUDE.md` mục Quy trình feature chuẩn |
| Debug kỷ luật | `CLAUDE.md` mục Quy tắc làm việc §5 |
| Review hai trục | `.claude/agents/code-reviewer.md` + dòng bước 5 quy trình |
| Bộ lọc quyết định lớn + cắt tỉa | `CLAUDE.md` mục Quy tắc bộ nhớ §5-6 |
| Seam + tautological test | `CLAUDE.md` mục Chiến lược test §10 |
