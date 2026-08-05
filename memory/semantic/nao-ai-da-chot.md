---
name: nao-ai-da-chot
type: semantic
created: 2026-08-05
modified: 2026-08-05
description: Não AI sản phẩm đã chốt 05/08 — MiniMax M3 cho mọi vai (ngân sách), harness tự viết 5 nguyên tắc, điều kiện pseudonymize triệt để
---

Người dùng chốt 05/08/2026 (chi tiết: CLAUDE.md mục "Não AI sản phẩm" + docs/research/nghien-cuu-nao-ai-orchestrator.md):

- **MiniMax M3 cho cả orchestrator lẫn worker** — lý do NGÂN SÁCH: "model duy nhất tôi afford được với mức độ thông minh đủ dùng". Không phải kết luận kỹ thuật thuần — nghiên cứu từng đề xuất Gemini 3 Flash (LearnLM) làm não to; giữ làm tham khảo nếu ngân sách đổi. Routing table thiết kế sẵn để nâng cấp chỉ bằng config.
- **Harness tự viết** (ai_call() một cửa, routing table, teaching policy = state machine ở code, retry/fallback, guardrail 2 lớp) — cấm framework agent.
- **Rủi ro M3 người dùng đã biết và chấp nhận có điều kiện**: privacy policy consumer MiniMax ghi "không cho dưới 16 tuổi" (học sinh ta 11-15) + rủi ro nhận thức model TQ. Điều kiện đổi lại: pseudonymize TRIỆT ĐỂ enforce tại ai_call() + minh bạch với phụ huynh + kiểm ToS API khi đăng ký (TASKS.md — nếu ToS API cũng cấm under-16 end-user thì phải bàn lại).
- Eval tiếng Việt nội bộ chuyển vai: từ "gate chọn model" → "validate chất lượng M3 trước beta".
