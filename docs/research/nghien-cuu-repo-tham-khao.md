# Kho repo tham khảo

**Ngày lập**: 07/08/2026 · Kho lưu link các repo/tài liệu đáng tham khảo đã khảo sát, kèm kết luận đã rút ra — để khi dự án mở rộng không phải nghiên cứu lại từ đầu. Gặp repo đáng giá mới → thêm dòng vào bảng, khảo sát sâu thì mở doc research riêng và trỏ link ở cột chi tiết.

## Danh sách

| Repo | Chủ đề | Giá trị | Chi tiết |
| --- | --- | --- | --- |
| [taovietducofficial/CI-CD-Beginner](https://github.com/taovietducofficial/CI-CD-Beginner) | CI/CD | Template GitHub Actions cho Node.js, nặng về supply-chain security; comment giải thích lý do thiết kế ngay trong YAML. Apache-2.0; tên "Beginner" nhưng nội dung advanced; deploy thật chỉ là placeholder | Mục CI/CD bên dưới (khảo sát 07/08/2026) |
| [mattpocock/skills](https://github.com/mattpocock/skills) | Agent skills | "Skills For Real Engineers" — bộ skill kỷ luật kỹ sư cho AI agent; nguồn của 6 kỹ thuật đã nhận vào harness (CONTEXT.md glossary, grilling frontier, debug kỷ luật, review hai trục, cắt tỉa tài liệu, redact secret khi debug) | [nghien-cuu-skills-mattpocock.md](nghien-cuu-skills-mattpocock.md) (khảo sát 05/08, rà lại 07/08/2026) |
| [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) | UI/UX skill | Database UI/UX tra cứu offline (84 styles, 192 palettes, 74 font pairings, 98 UX guidelines, 25 chart types, 22 stacks) + script search BM25 thuần Python stdlib, không gọi mạng. MIT | Mục UI/UX bên dưới — ĐÃ TÍCH HỢP v2.13.0 vào `.claude/skills/ui-ux-pro-max/` (07/08/2026) |
| [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) | React/Next.js | ~29.8k sao, maintain tích cực. Đáng giá nhất: `react-best-practices` — 70 rule perf, mỗi rule 1 file có code Incorrect/Correct, thuần markdown offline. ⚠️ License: MIT khai ở frontmatter từng SKILL.md, repo KHÔNG có file LICENSE (API /license trả 404) | Mục khảo sát skill bên dưới — `react-best-practices` CHỜ NGƯỜI DÙNG QUYẾT; `react-native-skills` chờ giai đoạn mobile |
| [Graphify-Labs/graphify](https://github.com/Graphify-Labs/graphify) | Knowledge graph | ~104k sao, Apache-2.0, offline thật (tree-sitter AST + networkx local, đã kiểm dependency không gọi mạng). Biến codebase/docs/PDF thành knowledge graph tra cứu | CHỜ: chỉ đáng cài khi codebase/docs phình to — hiện tại Grep vẫn đủ |
| [addyosmani/agent-skills](https://github.com/addyosmani/agent-skills) | SDLC pipeline | ~83k sao, MIT. Toàn bộ pipeline spec→ship TRÙNG superpowers — không cài; riêng `agents/security-auditor.md` (checklist auth/IDOR/PII/secrets cụ thể) đáng mượn MỘT FILE | CHỜ: mượn security-auditor.md khi có API xử lý dữ liệu trẻ em thật |

## CI/CD — CI-CD-Beginner dạy gì (tóm tắt đã kiểm chứng 07/08/2026)

- **CI**: lint/typecheck/test matrix Node 22+24 qua reusable workflow (`workflow_call`), lint tiêu đề PR theo Conventional Commits, CodeQL, dependency-review chặn CVE high, Trivy, zizmor (lint bảo mật cho chính file workflow).
- **CD**: release-please → build Docker multi-arch (buildx + QEMU, cache `type=gha`, SBOM + SLSA provenance) → smoke test container thật (boot + poll `/health`) → ký cosign keyless theo digest → deploy staging tự động → deploy production qua **GitHub Environment có required reviewer**.
- **Cổng deploy**: một script `verify-image.sh` dùng chung staging/production — `cosign verify` ghim cả workflow file lẫn ref, `gh attestation verify`, kiểm SBOM tồn tại.
- **Branch protection bằng Ruleset JSON** (`.github/rulesets/*.json`) import thẳng thay vì cấu hình tay trên UI — audit được, tái tạo được.
- **Bài học kiến trúc đắt nhất**: gộp release + build vào MỘT workflow. Nếu tách hai file cùng trigger trên `main`, commit của release-please làm cả hai chạy trên một commit → hai digest khác nhau, một cái được deploy, cái kia nhận tag version — race condition thật tác giả từng gặp.

## Đã áp dụng vào tutor-agent (đợt 1, 07/08/2026)

1. **Pin action theo full commit SHA** kèm comment version (`.github/workflows/ci.yml`) — tag `@v4` là mutable, repo action bị chiếm quyền thì tag repoint được; SHA thì không. Lấy SHA bằng `git ls-remote --tags <repo-url>` (tag annotated thì lấy dòng `^{}` — đó mới là commit SHA, Actions không nhận tag-object SHA).
2. **`permissions: contents: read` top-level** — bỏ token scope mặc định rộng; job nào cần write sau này khai riêng ở mức job.

## Chờ giai đoạn CD (đã đồng thuận hướng, chưa build)

Khi làm spec CD giai đoạn 2 (deploy VPS), mang các mục sau vào brainstorm/spec:

- **GitHub Environment `production` + required reviewer** — cơ chế native cho ràng buộc "production deploy phải người dùng approve" trong CLAUDE.md, không tự chế logic approve.
- **Smoke test container thật trong CI**: job `docker` hiện chỉ build; thêm bước boot container + curl health endpoint để bắt lỗi "build xanh nhưng không chạy được" trước khi lên VPS.
- **Branch protection bằng Ruleset JSON** trong repo thay vì click tay.
- **Mô hình deploy phù hợp stack đã chốt**: build/push image lên GHCR (dùng `GITHUB_TOKEN` sẵn, không cần secret riêng) → SSH vào VPS → `docker compose pull && up -d`; gate = CI xanh + Environment approval. VPS chỉ cần Docker, khớp quyết định trong nghien-cuu-tech-stack.md.
- **Nếu dùng release-please**: gộp release + build một workflow (xem race condition ở trên).

## Đã loại — và điều kiện xem lại

| Mục | Lý do loại | Xem lại khi |
| --- | --- | --- |
| Cosign + SLSA provenance + verify-reproducible | Bộ này bảo vệ image phân phối công khai (fork/redistribute); ta build image tự deploy lên VPS riêng — mức đe dọa khác hẳn, tốn ~30 phút CI/lần. Vi phạm "đơn giản trước tiên" | Image được phân phối ra ngoài, hoặc có yêu cầu compliance chuỗi cung ứng |
| Multi-arch build (amd64+arm64, QEMU) | VPS x86 thuần — chỉ tốn thời gian CI | VPS/target chạy ARM |
| CodeQL, zizmor, Trivy | Nice-to-have, chưa phải MVP; CodeQL nếu dùng phải thêm Python, không copy nguyên workflow JS | Codebase lớn hơn, có người dùng thật / trước beta công khai |

## UI/UX — ui-ux-pro-max-skill: chi tiết tích hợp (07/08/2026)

Tích hợp mức **project** tại `.claude/skills/ui-ux-pro-max/` (SKILL.md + data/ + scripts/ + references/, 42 file ~1.8MB). Đồng thời đã gỡ bản cài mức user (bản đó hỏng payload — symlink git checkout thành file text trên Windows) và dọn toàn bộ skill user-level khác theo quyết định "user chỉ giữ superpowers".

**Ba điều không suy ra được từ file, phải nhớ khi cập nhật skill này:**

1. **Không cài bằng CLI chính chủ** (`uipro init --ai claude`) — nó cài kèm 6 skill anh em không xin. Cách đúng: copy tay — SKILL.md + references/ lấy từ `.claude/skills/ui-ux-pro-max/` của repo nguồn (bản viết tay, số liệu đúng), data/ + scripts/ lấy từ `src/ui-ux-pro-max/` (nguồn canonical); KHÔNG lấy templates/ (chỉ CLI dùng, số liệu trong `templates/platforms/claude.json` đang lệch cũ).
2. **Phải sửa path trong SKILL.md sau khi copy**: bản gốc dùng `${CLAUDE_PLUGIN_ROOT}/...` — biến chỉ tồn tại khi cài dạng plugin marketplace; bản project skill phải đổi thành path tương đối từ gốc repo `.claude/skills/ui-ux-pro-max/scripts/search.py`. Đã kiểm chứng chạy thật từ gốc repo (exit 0).
3. **Rào brand đã chèn đầu SKILL.md**: cấm `--design-system` và domain `color`/`typography`/`google-fonts` trong repo này — skill không có cơ chế "bring your own design system", các lệnh đó sẽ đề xuất palette/font đè brand Rangi đã chốt. Cập nhật version mới phải chèn lại rào này.

## Khảo sát skill 07/08/2026 — kết luận toàn cảnh (3 subagent song song)

**Skill chính chủ Anthropic (`anthropics/skills`)**: có đúng 17 skill, môi trường người dùng ĐÃ CÓ ĐỦ 17/17 qua plugin anthropic-skills, pin đúng commit mới nhất (24/07/2026). Không thiếu gì — sau này chỉ cần soát lại khi Anthropic thêm skill mới.

**Đã khảo sát và LOẠI (kèm lý do — đừng nghiên cứu lại)**:

| Repo | Sao | Lý do loại |
| --- | --- | --- |
| multica-ai/andrej-karpathy-skills | ~200k | Đã hấp thụ 100% từ trước — chính là mục "Quy tắc làm việc (theo Karpathy guidelines)" trong CLAUDE.md |
| affaan-m/ECC, ruvnet/ruflo | ~238k, ~67k | Meta-harness đa agent, trùng phạm vi superpowers |
| JuliusBrussee/caveman | ~97k | ⚠️ CẢNH BÁO: nén CLAUDE.md/docs thành "caveman-speak" tiết kiệm token — kỹ thuật thật nhưng GHI ĐÈ file gốc, sẽ phá CLAUDE.md tiếng Việt mang sắc thái pháp lý. Không bao giờ cài |
| Leonxlnx/taste-skill | ~74k | Nội dung thật nhưng nhắm landing/portfolio SaaS, chồng phạm vi ui-ux-pro-max |
| mvanhorn/last30days-skill | ~58k | Gọi mạng Reddit/X/YouTube/HN lúc runtime — vi phạm tiêu chí offline |
| vercel: web-design-guidelines, writing-guidelines | — | Fetch-live ruleset từ internet mỗi lần chạy + trùng ui-ux-pro-max/frontend-design |
| vercel: vercel-optimize, deploy-to-vercel, CLI | — | Gắn hạ tầng Vercel; dự án dùng VPS + Docker |

**Khoảng trống đã xác nhận**: KHÔNG tồn tại bộ skill cộng đồng nổi tiếng nào cho Django/pytest/Celery/PDF đề thi/SymPy (kết quả cao nhất chỉ 2-46 sao) — mảng domain này phải tự viết skill khi cần.
