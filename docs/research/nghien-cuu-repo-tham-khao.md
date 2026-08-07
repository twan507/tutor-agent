# Kho repo tham khảo

**Ngày lập**: 07/08/2026 · Kho lưu link các repo/tài liệu đáng tham khảo đã khảo sát, kèm kết luận đã rút ra — để khi dự án mở rộng không phải nghiên cứu lại từ đầu. Gặp repo đáng giá mới → thêm dòng vào bảng, khảo sát sâu thì mở doc research riêng và trỏ link ở cột chi tiết.

## Danh sách

| Repo | Chủ đề | Giá trị | Chi tiết |
| --- | --- | --- | --- |
| [taovietducofficial/CI-CD-Beginner](https://github.com/taovietducofficial/CI-CD-Beginner) | CI/CD | Template GitHub Actions cho Node.js, nặng về supply-chain security; comment giải thích lý do thiết kế ngay trong YAML. Apache-2.0; tên "Beginner" nhưng nội dung advanced; deploy thật chỉ là placeholder | Mục CI/CD bên dưới (khảo sát 07/08/2026) |
| [mattpocock/skills](https://github.com/mattpocock/skills) | Agent skills | "Skills For Real Engineers" — bộ skill kỷ luật kỹ sư cho AI agent; nguồn của 6 kỹ thuật đã nhận vào harness (CONTEXT.md glossary, grilling frontier, debug kỷ luật, review hai trục, cắt tỉa tài liệu, redact secret khi debug) | [nghien-cuu-skills-mattpocock.md](nghien-cuu-skills-mattpocock.md) (khảo sát 05/08, rà lại 07/08/2026) |

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
