---
name: 2026-08-07-docker-desktop-ket-va-chuyen-pnpm-scripts
type: episodic
created: 2026-08-07
modified: 2026-08-07
description: Chuyển 5 lệnh gõ sang pnpm scripts + sự cố Docker Desktop kẹt do file socket mồ côi và cách chữa
---

# 07/08/2026 — chuyển pnpm scripts, sự cố Docker Desktop

## Quyết định: bỏ wrapper .bat/.sh ở gốc, dùng pnpm scripts

- User chê 10 file lệnh ở gốc repo lộn xộn → khảo sát chuẩn ngành → chốt `package.json` gốc với 5 scripts trỏ `scripts/stack.mjs`. Wrapper cũ KHÔNG xóa mà lưu trữ trong `scripts/` (yêu cầu user), đã sửa `%~dp0` để vẫn chạy được.
- Đã kiểm chứng thật trên Windows cả 5 lệnh qua pnpm, gồm cả Ctrl+C với `pnpm dev-start`: tắt sạch hai cổng, Postgres giữ nguyên. Kỹ thuật test Ctrl+C không cần bấm tay: helper PowerShell `FreeConsole → AttachConsole(pid) → GenerateConsoleCtrlEvent(CTRL_C, 0)` — mô phỏng đúng cơ chế phím thật, dùng lại được cho test sau.
- Hệ quả phụ: pnpm tự tạo `pnpm-lock.yaml` + `node_modules/` ở gốc → Next.js cảnh báo "multiple lockfiles" → đã ghim `outputFileTracingRoot` trong `frontend/next.config.ts`. Commit `8266f19` nhánh `chore/pnpm-scripts`.

## Bẫy môi trường: Docker Desktop kẹt (máy Windows hiện tại)

Triệu chứng → nguyên nhân → cách chữa (đã xảy ra và chữa thành công phiên này):

1. Docker Desktop bật nhưng engine không bao giờ lên (mọi lệnh `docker` treo vô hạn, `wsl -l -v` thấy `docker-desktop` Stopped hơn 20 phút) → phải kill cưỡng bức + `wsl --shutdown`.
2. **Kill cưỡng bức để lại file socket mồ côi** `%LOCALAPPDATA%\Docker\run\dockerInference` → lần khởi động sau backend crash ngay ("The file cannot be accessed by the system", log tại `%LOCALAPPDATA%\Docker\log\host\com.docker.backend.exe.log`, timestamp UTC).
3. File socket hỏng này không xóa được bằng mọi cách thường (Remove-Item, `del \\?\...`, fsutil đều Error 1920) **khi driver còn giữ khóa**; sau khi WSL hồi/reboot thì user xóa được bằng tay bình thường.
4. Dialog lỗi của Docker Desktop có nút "Reset to factory defaults" — **cấm bấm**, sẽ xóa volume `tutor-infra_pgdata`.
5. Lưu ý agent: classifier chặn agent xóa/đổi tên file trong `AppData\Local\Docker` — phần đó phải nhờ user tự chạy.
