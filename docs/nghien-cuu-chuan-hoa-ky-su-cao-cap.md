# Nghiên cứu: Chuẩn hóa hành vi "kỹ sư phần mềm cao cấp" cho Claude Code trong repo

Ngày: 04/08/2026. Hai nguồn khảo sát song song: tài liệu chính thức Anthropic + thực tiễn cộng đồng. Kết luận đã áp dụng vào `CLAUDE.md` (mục "Quy tắc hành xử chuyên nghiệp") và `.claude/settings.json`.

## 1. Phát hiện cốt lõi: hai tầng quy tắc

Trích docs chính thức Anthropic (trang Memory): *"Claude coi CLAUDE.md là ngữ cảnh, không phải cấu hình cưỡng chế. Muốn chặn một hành động bất kể Claude quyết định gì, dùng PreToolUse hook."* Và trang Permissions: *"Permission rules được thực thi bởi Claude Code, không phải bởi model — chỉ dẫn trong prompt/CLAUDE.md định hình điều Claude cố làm, nhưng không thay đổi điều Claude Code cho phép."*

| Tầng | Cơ chế | Bản chất |
|---|---|---|
| Mềm (advisory) | CLAUDE.md, `.claude/rules/`, skills, subagent prompt | Agent tuân theo hầu hết thời gian; có thể "quên" khi context đầy hoặc rule bị chôn |
| Cứng (enforced) | `permissions.deny/ask` trong settings.json; hooks exit code 2; managed settings; sandbox | Harness thực thi tất định, model không thuyết phục để lách được |

Số liệu cộng đồng: skill chỉ tự kích hoạt ~20% trên 200+ prompt thử nghiệm (tăng lên 84% khi kết hợp hook auto-inject). Anthropic đóng issue "Claude tự bypass pre-commit bằng `--no-verify`" là *not planned* → kỷ luật thật phải nằm ở hook + CI, không trông cậy tự giác.

## 2. Bảng cơ chế → loại quy tắc (theo docs Anthropic)

| Cơ chế | Enforcement | Dùng cho | Ví dụ |
|---|---|---|---|
| CLAUDE.md (<200 dòng) | Mềm | Quy ước luôn đúng: lệnh build/test, style khác default, kiến trúc, workflow | "Run `npm test` before committing" |
| `.claude/rules/*.md` (path-scoped) | Mềm | Quy tắc theo thư mục/loại file, tránh phình CLAUDE.md | `paths: ["backend/**/*.py"]` |
| Skill (SKILL.md) | Mềm, load khi cần | Kiến thức tham chiếu hoặc workflow nhiều bước | api-conventions, /deploy |
| Hook (PreToolUse/PostToolUse/Stop) | **Cứng** | Quy tắc 100% không ngoại lệ | Chặn edit `.env`; Stop hook chạy test |
| Subagent (.claude/agents/) | Mềm + cô lập context, giới hạn tool | Review độc lập, chuyên môn hóa | code-reviewer chỉ có Read/Grep/Glob |
| settings.json permissions | **Cứng** | Chặn tool/lệnh/path cụ thể | `deny: ["Read(./.env)"]` |
| Slash command (`disable-model-invocation: true`) | Mềm, chỉ người gọi | Workflow side-effect cần người kiểm soát thời điểm | /deploy, /commit |

Tiêu chí CLAUDE.md tốt: "Nếu xóa dòng này Claude có làm sai không? Không thì xóa." Include: lệnh không đoán được, quy tắc khác default, gotcha, quyết định kiến trúc. Exclude: thứ đọc code suy ra được, convention chuẩn của ngôn ngữ, tài liệu API dài.

## 3. Best practices chính thức khác (Anthropic)

- **Luôn cho Claude cách tự kiểm chứng** (test/build/lint/screenshot); 4 cấp gate: prompt → goal xuyên session → Stop hook chặn cứng → subagent review độc lập.
- **Explore → Plan → Code → Commit**: dùng Plan Mode tách nghiên cứu khỏi thực thi; chỉ bỏ plan khi diff mô tả được trong 1 câu.
- **Adversarial review**: subagent context sạch review diff so với plan, chỉ báo gap ảnh hưởng đúng đắn.
- **5 lỗi cần tránh**: kitchen-sink session (không /clear giữa task không liên quan); sửa lặp >2 lần cùng lỗi (nên /clear + viết lại prompt); CLAUDE.md quá dài; trust-then-verify gap; exploration không scope.

## 4. Khảo sát cộng đồng

### Superpowers (obra/superpowers) — đã cài trên máy

Triết lý: *"Không thể build cái chưa thiết kế. Không thể thực thi cái chưa lên kế hoạch. Không thể ship cái chưa review."* Skill là gate bắt buộc, không phải gợi ý. Pipeline: brainstorming (người duyệt design) → git worktree → writing-plans (task 2-5 phút) → TDD (RED-GREEN-REFACTOR) → systematic-debugging → requesting-code-review → verification-before-completion → finishing-a-development-branch. Hai gate quan trọng nhất: **design được duyệt** và **failing test trước implementation**.

### Các framework khác

| Framework | Điểm đáng học |
|---|---|
| everything-claude-code | Agent chuyên biệt (planner, TDD-guide, security-reviewer); giới hạn <10 agent active để buộc lựa chọn có chủ đích |
| claude-code-templates | 600+ template; naming convention chặt; cấm hardcode secret tuyệt đối |
| SuperClaude | Persona/flag hệ thống — cộng đồng đánh giá thấp hơn (xem anti-pattern) |

### Xếp hạng pattern theo đồng thuận

1. **Hook cưỡng chế tất định** — "lớp duy nhất thực sự đáng tin cậy"
2. **Plan trước code + gate người duyệt** — quyết định trên giấy rẻ hơn refactor giữa chừng
3. **Review bằng agent độc lập context sạch** — "không viết patch đó nên bắt được ngụy biện của người viết"
4. **TDD gate** — model có xu hướng tự nhiên viết code trước rồi derive test; phải ép bằng gate
5. **Verification-before-completion** — evidence before assertions
6. **Git discipline** — worktree/nhánh riêng, conventional commits, PR nhỏ
7. **CLAUDE.md tinh gọn, chỉ thị cụ thể** — bổ trợ cho hook, không thay được

## 5. Anti-pattern (cộng đồng xác nhận không hiệu quả)

1. **Ảo tưởng "governance toàn diện qua hook"**: hook có lỗ hổng (không chạy ở một số mode; chặn Write thì model chuyển sang Bash heredoc). Kiểm soát thật cần thêm tầng hạ tầng: file permission, CI backstop, review trước merge.
2. **Persona/roleplay** ("hãy là senior dev") — làm bẩn context, thua đặc tả chính xác.
3. **Chỉ thị mơ hồ** ("code sạch đẹp") không đổi hành vi; chỉ phủ định kiểm tra được ("không tạo abstraction cho code dùng một lần") hoặc mục tiêu định lượng mới có tác dụng.
4. **Tối giản cực đoan** phản tác dụng (từng làm mất validation quan trọng) — giảm phạm vi ≠ giảm tính đúng đắn.
5. **Mọi rào chắn phải đo hiệu quả thật** — có hook "gợi ý dùng subagent" bị gỡ vì chưa từng thay đổi quyết định nào, chỉ gây over-delegation.

## 6. Đã áp dụng vào repo này

- `.claude/settings.json`: permissions.deny (đọc .env) + 2 PreToolUse hook
- `.claude/hooks/protect-files.sh`: chặn Edit/Write vào `.env*`, `.claude/settings*.json`, `.claude/hooks/`
- `.claude/hooks/guard-bash.sh`: chặn `--no-verify`, force push, `rm -rf`
- `.claude/agents/code-reviewer.md`: reviewer độc lập read-only, model sonnet
- CLAUDE.md mục "Quy tắc hành xử chuyên nghiệp" + quy trình feature 2 gate
- Chưa làm (đợi có code thật): Stop hook chạy test, PostToolUse auto-lint (ruff/eslint), `.claude/rules/` theo path frontend/backend

## Nguồn chính

- https://code.claude.com/docs/en/best-practices (bản gộp từ bài "Claude Code: Best practices for agentic coding")
- https://code.claude.com/docs/en/memory, /hooks-guide, /permissions, /sub-agents, /settings, /skills, /features-overview
- https://claude.com/blog/steering-claude-code-skills-hooks-rules-subagents-and-more
- https://github.com/obra/superpowers
- https://github.com/WorldFlowAI/everything-claude-code, https://github.com/davila7/claude-code-templates
- https://scottspence.com/posts/how-to-make-claude-code-skills-activate-reliably (số liệu 20%→84%)
- https://pydevtools.com/handbook/how-to/how-to-stop-ai-agents-from-bypassing-pre-commit-hooks/
- https://github.com/anthropics/claude-code/issues/40117 (bypass --no-verify: not planned)
- https://dev.to/boucle2026/what-claude-code-hooks-can-and-cannot-enforce-148o (lỗ hổng hook)
- https://mcp.directory/blog/stop-claude-code-over-engineering-2026 (anti-pattern chỉ thị mơ hồ)
