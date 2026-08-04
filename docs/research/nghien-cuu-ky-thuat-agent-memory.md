# Nghiên cứu: Kỹ thuật xây dựng bộ nhớ dài hạn cho AI Agent

Ngày: 04/08/2026. Mục đích: chọn kỹ thuật memory cho AI coding agent làm việc dài hạn trên repo này. Kết luận đã áp dụng vào mục "Quy tắc bộ nhớ" trong `CLAUDE.md`.

## 1. Tóm tắt repo `rohitg00/agentmemory`

Nguồn: https://github.com/rohitg00/agentmemory

**Định vị**: Memory engine dành riêng cho AI coding agent (Claude Code, Cursor, Copilot CLI, 30+ MCP client), chạy như MCP/REST server dùng chung cho nhiều agent, xây trên runtime "iii" (worker/function/trigger primitives).

**Kiến trúc 4 tầng consolidation** (mô phỏng quá trình củng cố trí nhớ khi ngủ):
1. Working Memory — quan sát thô từ tool-use
2. Episodic Memory — tóm tắt phiên làm việc ("chuyện gì đã xảy ra")
3. Semantic Memory — fact/pattern đã trích xuất ("tôi biết gì")
4. Procedural Memory — quy trình/quyết định ("làm thế nào")

**Cơ chế capture**: tự động qua 12 hook vòng đời agent (SessionStart/End, Pre/PostToolUse, PreCompact...). Luồng: dedup SHA-256 (cửa sổ 5 phút) → lọc privacy → lưu thô → nén bằng LLM → embedding vector + BM25 index.

**Retrieval**: "triple-stream hybrid" — BM25 + vector (local `all-MiniLM-L6-v2`) + graph traversal, hợp nhất bằng Reciprocal Rank Fusion (k=60).

**Consolidation/decay**: tóm tắt cuối phiên + trích xuất knowledge graph; decay kiểu Ebbinghaus (memory dùng thường xuyên được củng cố, memory cũ tự loại bỏ); có contradiction detection.

**Storage**: SQLite + vector index in-memory, không cần DB ngoài.

**Benchmark tự công bố** (chưa được bên thứ ba xác nhận): LongMemEval-S 95.2% R@5 / 98.6% R@10; giảm ~92% token so với nhồi full context; chi phí ~$10/năm với embedding local.

**Điểm mạnh**: zero-config, đa agent dùng chung, tiết kiệm token, audit tốt.

**Điểm yếu**: khóa chặt vào runtime "iii" khá ngách; chất lượng nén phụ thuộc LLM provider; cài trên Windows còn ma sát; graph extraction/consolidation vẫn experimental; khó tùy biến sâu.

## 2. Bảng so sánh các hệ thống

| Hệ thống | Kỹ thuật lõi | Ưu | Nhược | Hợp file-based coding agent? |
|---|---|---|---|---|
| **agentmemory** ([GitHub](https://github.com/rohitg00/agentmemory)) | Hybrid retrieval (BM25+vector+graph) + 4-tier consolidation + Ebbinghaus decay, SQLite | Zero external DB, đa agent share, benchmark tốt (tự báo) | Khóa vào runtime "iii", nhiều phần experimental | Trung bình — ý tưởng hay nhưng cả bộ máy quá nặng |
| **Letta / MemGPT** ([docs](https://docs.letta.com/)) | OS-style paging: Core (luôn trong context) / Recall (lịch sử) / Archival (cold storage, agent tự query) | Agent tự self-edit memory, ẩn dụ OS rõ ràng | Tốn lượt gọi LLM, cần hạ tầng archival | Cao về tư duy — "core luôn load + archival lazy-load" ≈ index + file chi tiết |
| **Mem0** ([GitHub](https://github.com/mem0ai/mem0)) | Extraction pipeline, ADD-only + entity linking, hybrid search, time-aware retrieval | LoCoMo 92.5, LongMemEval 94.4; token/query thấp (~7K vs ~26K full-context) | Cần vector DB; append-only dễ phình; mạnh cho chat assistant hơn coding | Thấp-trung bình |
| **Zep / Graphiti** ([GitHub](https://github.com/getzep/graphiti)) | Temporal knowledge graph bi-temporal: fact có validity window, mâu thuẫn đánh dấu invalid | Truy vấn "sự thật tại thời điểm X", incremental update | Cần graph DB (Neo4j...) — hạ tầng nặng; ít benchmark công khai | Thấp — coding agent hiếm khi cần bi-temporal reasoning |
| **LangMem** ([docs](https://docs.langchain.com/oss/python/concepts/memory)) | Taxonomy semantic (fact) / episodic (tóm tắt quá khứ) / procedural (instruction tự viết lại); hot path vs background manager | Phân loại memory rất rõ, dễ mượn sang thiết kế khác | Gắn với LangGraph, cần store | Cao — mượn taxonomy, không cần dùng chính nó |
| **A-MEM** ([arXiv 2502.12110](https://arxiv.org/abs/2502.12110)) | Zettelkasten: note atomic có attribute, tự động link chéo và cập nhật ngược memory cũ | Mạng tự làm giàu, NeurIPS 2025, vượt SOTA trên 6 model | LLM gọi liên tục để link → tốn kém | Trung bình — "atomic note + link chéo" ≈ file markdown link nhau |
| **MemoryBank** ([arXiv 2305.10250](https://arxiv.org/abs/2305.10250)) | Decay theo đường cong Ebbinghaus: truy cập tăng độ bền, không dùng thì suy giảm | Đơn giản, là gốc của nhiều hệ sau | Chỉ là cơ chế forgetting, không phải hệ đầy đủ | Cao (như kỹ thuật con, đơn giản hóa được) |
| **Generative Agents** ([arXiv 2304.03442](https://arxiv.org/abs/2304.03442)) | Memory stream append-only → retrieval (recency+importance+relevance) → **Reflection** định kỳ nén observation thành insight bậc cao | Ablation chứng minh reflection là thiết yếu cho nhất quán dài hạn | Stream tuyến tính không scale; thiết kế cho social simulation | Cao — reflection loop là kỹ thuật giá trị nhất để mượn |
| **Claude Code Auto Memory** ([docs](https://code.claude.com/docs/en/memory)) | File-based thuần: index MEMORY.md trần cứng 200 dòng/25KB luôn load, file chủ đề đọc on-demand | Không hạ tầng, minh bạch, git-diff được, có cưỡng chế giữ index gọn | Không có retrieval ngữ nghĩa, không decay tự động | Chính là baseline hiện tại — cần siết kỷ luật, không cần thay thế |

## 3. Phân tích kỹ thuật cốt lõi + bằng chứng

**a) Vector vs Graph vs File-based.** Vector/hybrid cho lift benchmark rõ trên hội thoại dài nhiều phiên (Mem0: LoCoMo 92.5) — nhưng benchmark đo multi-turn chat, khác bản chất "nhớ quy ước codebase". Graph mạnh khi cần suy luận thời gian ("X đúng lúc nào") — codebase hiếm khi cần. File-based không có semantic retrieval nhưng rẻ, minh bạch, không lock-in, git-diff được.

**b) Phân loại episodic/semantic/procedural.** Đồng thuận cao giữa LangMem, agentmemory, Letta. Giúp quyết định cái gì luôn load / lazy-load / được phép hết hạn. Làm được thuần bằng thư mục.

**c) Consolidation/reflection loop.** Bằng chứng mạnh nhất: ablation study của Generative Agents — bỏ reflection làm giảm rõ tính nhất quán dài hạn. Áp dụng: cuối phiên, LLM tự hỏi "có insight bậc cao nào từ các quan sát gần đây?" rồi ghi lại — thay vì chỉ chép fact rời rạc.

**d) Forgetting/decay.** Gốc từ MemoryBank (Ebbinghaus). Bằng chứng chủ yếu định tính. Với file-based, đơn giản hóa thành: timestamp trong frontmatter + rà soát trong reflection loop, memory sai/không dùng thì archive/xóa.

**e) Index-based recall.** Kỹ thuật có bằng chứng thực dụng rõ nhất, được Anthropic áp dụng chính thức (MEMORY.md trần cứng, lỗi nếu vượt). Không phải kỹ thuật cần học thêm mà là kỹ thuật cần siết kỷ luật.

## 4. Khuyến nghị (đã chốt áp dụng)

Xếp hạng theo giá trị/chi phí:

1. **Index nhỏ + lazy-load + trần cứng** — giá trị cao nhất, chi phí ~0
2. **Phân loại theo thư mục semantic/procedural/episodic** — chi phí thấp (quy ước đặt tên), giá trị cao
3. **Reflection loop cuối phiên** — chi phí trung bình, bằng chứng mạnh nhất
4. **Decay đơn giản hóa** — timestamp + rà soát thủ công trong reflection, không cần công thức
5. **Contradiction check thủ công** — khi ghi memory mới, đối chiếu memory cũ, đánh dấu cái còn hiệu lực

**Không áp dụng (overkill):** vector DB/embedding search; knowledge graph; runtime/server riêng kiểu "iii"; self-editing archival qua function-call kiểu Letta đầy đủ (Read/Grep file đã làm được việc tương đương rẻ hơn).

**Tổng kết một câu**: giữ hệ file-based, bổ sung 2 kỷ luật (trần cứng index + phân loại thư mục) và 1 quy trình (reflection định kỳ) — đó là ~80% giá trị của cả hệ sinh thái agent-memory với ~0% chi phí hạ tầng.
