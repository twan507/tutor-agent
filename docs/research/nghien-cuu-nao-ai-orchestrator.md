# Nghiên cứu: "Não" AI của sản phẩm — chọn model orchestrator/worker + xây harness

Ngày: 05/08/2026. Trạng thái: **ĐÃ CHỐT 05/08/2026** — người dùng chọn **MiniMax M3 cho cả orchestrator lẫn worker** (lý do ngân sách; đề xuất Gemini Flash trong mục 6 giữ làm tham khảo nâng cấp), kèm điều kiện pseudonymize triệt để. Harness chốt theo mục 5. Quy tắc rút gọn: CLAUDE.md mục "Não AI sản phẩm". Bối cảnh: kiến trúc orchestrator ("não to") + worker nhỏ; người dùng đề xuất MiniMax M3 làm worker; tiêu chí: tối ưu chi phí, tiếng Việt, edtech trẻ em VN.

## 1. Kiểm chứng MiniMax M3 (worker do người dùng đề xuất)

- **Có thật**: ra cuối 05/2026, MoE 428B/23B active, context 512K-1M, đa phương thức. Giá $0.30/$1.20 per 1M token in/out. Tool calling tốt (74.5% Claw-Eval). Open-weight nhưng 428B — không tự host nổi ở quy mô startup.
- **3 vấn đề phải cân nhắc**:
  1. **DeepSeek V3.2 rẻ hơn cả hai chiều** ($0.28/$0.42) với context 164K đã thừa cho vai worker (chấm bài, chat ngắn) — M3 chỉ thắng nếu cần 1M context hoặc agentic tin cậy vượt trội (chưa có bằng chứng áp dụng cho workload này)
  2. **Tiếng Việt chưa được kiểm toán độc lập** — không có benchmark VN nào cho M3
  3. ⚠️ **Privacy policy MiniMax ghi dịch vụ "không dành cho trẻ dưới 16 tuổi"** — học sinh THCS là 11-15 tuổi. Cần kiểm tra kỹ điều khoản API platform (khác consumer app) trước khi cam kết; nếu ToS API cũng vậy thì M3 bị loại về pháp lý bất kể kỹ thuật.

## 2. Ứng viên "não to" (giá $/1M in/out, 08/2026)

| Model | Giá | Nhận xét |
|---|---|---|
| Claude Sonnet 5 | $3/$15 (promo $2/$10 đến 31/8) | Sư phạm mạnh nhất; ToS US rõ ràng; đắt nhất nhóm |
| Claude Haiku 4.5 | $1/$5 | "Orchestrator rút gọn" hoặc worker sạch ToS (đắt hơn M3 ~3x) |
| **Gemini 3 Flash** | **$0.5/$3** | Rẻ hơn Sonnet ~5x; **thừa hưởng LearnLM** (nghiên cứu sư phạm của Google đã sáp nhập vào Gemini 2.5+ — lợi thế edtech không model nào khác có) |
| Gemini 3.1 Pro | $2-4/$12-18 | Mạnh nhưng đắt; cache có phí storage theo giờ (khác Anthropic/OpenAI) |
| DeepSeek V3.2 | $0.21-0.28/$0.32-0.42 | Rẻ nhất; công ty TQ — rủi ro nhận thức (đã bị nhiều nước cấm trên thiết bị công) |
| GPT-5.x mini/nano | $0.75/$4.5, $0.20/$1.25 | Flagship chưa tra được giá |

**Lỗ hổng dữ liệu quan trọng**: KHÔNG tồn tại benchmark tiếng Việt công khai đáng tin cho bất kỳ model nào → **bắt buộc tự xây bộ eval tiếng Việt nội bộ (30-50 câu Toán THCS + tình huống sư phạm) chấm chéo trước khi chốt** — khớp sẵn với kế hoạch DeepEval đã chốt trong chiến lược test.

## 3. Chi phí/học sinh/tháng (22 session × 25 phút, ~30 lượt, có prompt caching)

| Cấu hình | $/học sinh/tháng (session) |
|---|---|
| Sonnet 5 toàn bộ | ~$4.65 (~121k VNĐ) |
| Sonnet 5 (30%) + M3 (70%) | ~$1.69 (~44k VNĐ) |
| **Gemini 3 Flash (30%) + M3 (70%)** | **~$0.55 (~14k VNĐ)** |
| DeepSeek toàn bộ | ~$0.27 (~7k VNĐ) |

Workload khác (sinh item, báo cáo tuần, phân tích attempt) cộng thêm ~10-15%. Đòn bẩy chi phí lớn nhất: **prompt caching** (giảm 70-90% input; Anthropic/OpenAI/DeepSeek cache read ~10% giá; Gemini có thêm phí storage) + context trimming + routing động.

→ Với giá sprint dự kiến 300-900k VNĐ, chi phí AI 14-44k/tháng/học sinh là **unit economics sống được** ở mọi cấu hình trừ Sonnet-toàn-bộ.

## 4. Pháp lý + nhận thức (trẻ em VN)

- Model TQ (MiniMax/DeepSeek/Qwen/GLM/Kimi): endpoint quốc tế tách riêng, nhưng công ty mẹ chịu luật TQ; DeepSeek từng bị Đài/Hàn/Ấn/Mỹ cấm trên thiết bị công → **rủi ro truyền thông với phụ huynh** cho sản phẩm parent-first, dù rủi ro kỹ thuật sau pseudonymize là thấp
- Giảm thiểu nếu dùng: chỉ gửi dữ liệu pseudonymize triệt để; minh bạch với phụ huynh model nào xử lý gì
- Pseudonymize trước khi gọi API (đã là quy tắc) + consent phụ huynh có log là nền bắt buộc

## 5. Harness: tự viết loop mỏng, KHÔNG dùng framework nặng

**Đồng thuận đáng tin nhất** (Anthropic "Building Effective Agents" + khảo sát 2026): hệ có các bước rõ ràng theo policy = workflow, không cần "autonomous agent framework"; framework lớn (LangGraph/CrewAI/AutoGen) thêm lớp trừu tượng khó nhét đúng chỗ 3 yêu cầu bắt buộc của ta (ai_runs logging, hard cap, pseudonymize). AutoGen đã vào maintenance mode.

**Bằng chứng từ sản phẩm thật**: Khanmigo (RAG-grounding vào thư viện nội dung + routing model theo latency, Langfuse observability), Duolingo Max (30+ template prompt theo loại bài + model nội bộ riêng cho adaptive; guardrail "kéo hội thoại về chủ đề" nằm ở CODE không chỉ prompt), Squirrel AI/CK-12 (teaching policy nằm ở tầng thuật toán mastery, LLM chỉ là lớp giao tiếp) → **không sản phẩm thương mại lớn nào dùng multi-agent hội thoại**; tất cả dùng routing + template + grounding.

**Kiến trúc khuyến nghị cho Django/Celery:**

```
Luồng (a) session dạy học: Django async view (request-scope, SSE) — KHÔNG qua Celery
Luồng (b) batch sinh item/báo cáo: Celery task — tái dùng CÙNG orchestrator module
Luồng (c) phân tích attempt: Celery task, model rẻ theo routing

Thành phần dùng chung (điểm hội tụ duy nhất):
- ai_call() — hàm duy nhất mọi lời gọi LLM đi qua: pseudonymize → hard-cap check
  → gọi qua adapter (litellm SDK bọc trong) → ghi ai_runs (async) → stream về
- routing_table.py — map (loại tác vụ, độ khó, ngân sách) → model_id; đổi não/worker
  chỉ sửa config, không sửa luồng
- teaching_policy — state machine Python thuần (phần cứng ở code, phần diễn đạt ở prompt);
  session state lưu Postgres mỗi turn, không giữ RAM
- retry/fallback: backoff + jitter + Retry-After + circuit breaker + provider dự phòng
  sau cùng interface
```

**Guardrail trẻ em từ thực tiễn**: "không đưa đáp án trực tiếp" ở cả prompt LẪN post-check trong code; chống jailbreak roleplay bằng lớp kiểm tra độc lập ngoài prompt; nghiên cứu ghi nhận AI không guardrail có thể LÀM GIẢM học tập dù tăng điểm ngắn hạn — củng cố các quyết định formative-only đã chốt.

**KHÔNG dùng**: LangGraph/CrewAI/AutoGen làm trục; multi-agent hội thoại cho session 1-1; state chỉ trong RAM; gọi SDK rải rác ngoài ai_call().

## 6. Khuyến nghị tổng hợp

1. **Orchestrator**: Gemini 3 Flash làm mặc định (rẻ + gen sư phạm LearnLM) + Sonnet 5 làm fallback cho tình huống sư phạm khó (routing động) — CHỐT SAU KHI có kết quả eval tiếng Việt nội bộ
2. **Worker**: chưa vội chốt M3 — chạy eval tiếng Việt M3 vs DeepSeek V3.2 vs Haiku 4.5, và **kiểm tra ToS API MiniMax về under-16 trước** (có thể là yếu tố loại trực tiếp)
3. **Harness**: tự viết loop mỏng + litellm bọc trong `ai_call()` duy nhất; teaching policy = state machine ở code; theo pattern Khanmigo/Duolingo (routing + template + grounding)
4. **Việc chặn trước khi chốt model**: xây bộ eval tiếng Việt nội bộ 30-50 câu (dùng nền DeepEval đã chốt) + đo latency streaming thực tế từ VN cho từng provider

## Nguồn

Đầy đủ URL trong lịch sử hội thoại 05/08/2026: MiniMax blog/HF/OpenRouter, bảng giá các provider (Finout/CloudZero/OpenRouter), Anthropic Building Effective Agents + multi-agent research system, Khan Academy blog + Langfuse case study, Duolingo Max, LearnLM technical report + sáp nhập Gemini, Nghị định 13/2023 + privacy policy MiniMax, khảo sát framework 2026 (LangGraph/Pydantic AI/OpenAI Agents SDK), litellm docs.
