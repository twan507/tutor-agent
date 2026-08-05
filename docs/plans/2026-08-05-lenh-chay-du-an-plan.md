# Bộ lệnh chạy dự án Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 5 lệnh gõ được (`dev-start`, `dev-stop`, `docker-up`, `docker-down`, `docker-clean`) thay Makefile, theo spec `docs/specs/2026-08-05-lenh-chay-du-an.md`.

**Architecture:** Node script `scripts/stack.mjs` chứa toàn bộ logic; `.bat` (Windows) và `.sh` (Linux) là vỏ một dòng. Không thêm dependency.

**Tech Stack:** Node 22+ (child_process, fs), Docker Compose v2, uv, pnpm.

## Global Constraints

- Nhánh `feat/dev-commands`; commit Conventional Commits; KHÔNG push cho tới task cuối
- **CẤM TUYỆT ĐỐI** cờ `-v`/`--volumes` trong mọi lệnh docker của script (hook `guard-bash.sh` chặn cứng, và đó là ranh giới dữ liệu)
- Máy Windows: chạy lệnh qua Git Bash; script phải chạy được cả trên Windows lẫn Linux
- Compose files: `deploy/infra/docker-compose.yml` (project `tutor-infra`), `deploy/app/docker-compose.yml` (project `tutor-app`), network external `tutor-net`
- Không thêm npm dependency nào — chỉ dùng module có sẵn của Node
- Prettier phải sạch (repo đã có `.gitattributes` ép LF; nếu format:check kêu hàng loạt file không liên quan → đọc CLAUDE.md mục "Môi trường dev — bẫy đã biết", KHÔNG chạy prettier --write hàng loạt)

---

### Task 1: Script lõi + 4 lệnh Docker (chưa có dev-start)

**Files:**
- Create: `scripts/stack.mjs`, `docker-up.bat`, `docker-down.bat`, `docker-clean.bat`, `docker-up.sh`, `docker-down.sh`, `docker-clean.sh`
- Delete: `Makefile`

**Interfaces:**
- Produces: `node scripts/stack.mjs <command>` với command ∈ {docker-up, docker-down, docker-clean} (dev-start/dev-stop thêm ở Task 2); hàm dùng chung `run()`, `readEnvFile()`, `ensureNetwork()`, `dockerDf()` — Task 2 dùng lại.

- [ ] **Step 1: Viết `scripts/stack.mjs`**

```js
#!/usr/bin/env node
import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const ENV_FILE = path.join(ROOT, ".env");
const INFRA = ["-p", "tutor-infra", "-f", "deploy/infra/docker-compose.yml", "--env-file", ".env"];
const APP = ["-p", "tutor-app", "-f", "deploy/app/docker-compose.yml", "--env-file", ".env"];
const NETWORK = "tutor-net";
const C = { be: "\x1b[36m", fe: "\x1b[35m", ok: "\x1b[32m", warn: "\x1b[33m", err: "\x1b[31m", dim: "\x1b[2m", off: "\x1b[0m" };

function log(msg, color = C.ok) {
  console.log(`${color}[stack]${C.off} ${msg}`);
}
function die(msg) {
  console.error(`${C.err}[stack] ${msg}${C.off}`);
  process.exit(1);
}
function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, { cwd: ROOT, stdio: "inherit", shell: process.platform === "win32", ...opts });
  if (r.status !== 0 && !opts.allowFail) die(`lệnh thất bại: ${cmd} ${args.join(" ")}`);
  return r.status;
}
function capture(cmd, args) {
  const r = spawnSync(cmd, args, { cwd: ROOT, encoding: "utf8", shell: process.platform === "win32" });
  return (r.stdout || "").trim();
}

function ensureEnv() {
  if (fs.existsSync(ENV_FILE)) return;
  const example = path.join(ROOT, ".env.example");
  if (!fs.existsSync(example)) die(".env và .env.example đều không tồn tại");
  fs.copyFileSync(example, ENV_FILE);
  log("đã tạo .env từ .env.example — nhớ điền giá trị thật", C.warn);
}
function readEnvFile() {
  ensureEnv();
  const out = {};
  for (const line of fs.readFileSync(ENV_FILE, "utf8").split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}
function ensureNetwork() {
  const nets = capture("docker", ["network", "ls", "--format", "{{.Name}}"]).split("\n");
  if (!nets.includes(NETWORK)) run("docker", ["network", "create", NETWORK]);
}
function portBusy(port) {
  const out = capture(process.platform === "win32" ? "netstat" : "ss", process.platform === "win32" ? ["-ano"] : ["-ltn"]);
  return new RegExp(`[.:]${port}\\s`).test(out);
}
function infraUp() {
  ensureNetwork();
  log("bật Postgres, chờ healthy…");
  run("docker", ["compose", ...INFRA, "up", "-d", "--wait"]);
}

function dockerUp() {
  ensureEnv();
  infraUp();
  log("build và chạy tầng app…");
  run("docker", ["compose", ...APP, "up", "-d", "--build"]);
  log(`xong — mở http://localhost  (API: http://localhost/api/healthz)`);
}

function dockerDown() {
  ensureEnv();
  log("gỡ container tầng app…");
  run("docker", ["compose", ...APP, "down"], { allowFail: true });
  log("gỡ container tầng infra (GIỮ volume dữ liệu)…");
  run("docker", ["compose", ...INFRA, "down"], { allowFail: true });
  const vols = capture("docker", ["volume", "ls", "--format", "{{.Name}}"]);
  if (!vols.includes("tutor-infra_pgdata")) die("CẢNH BÁO: volume tutor-infra_pgdata biến mất — kiểm tra ngay");
  log("đã gỡ container. Volume dữ liệu tutor-infra_pgdata còn nguyên.");
}

function dockerClean() {
  log("dung lượng TRƯỚC khi dọn:", C.dim);
  run("docker", ["system", "df"]);
  log("dọn build cache, image mồ côi, volume vô danh (KHÔNG đụng volume có tên)…");
  run("docker", ["builder", "prune", "-f"], { allowFail: true });
  run("docker", ["image", "prune", "-f"], { allowFail: true });
  run("docker", ["volume", "prune", "-f"], { allowFail: true });
  const vols = capture("docker", ["volume", "ls", "--format", "{{.Name}}"]);
  if (!vols.includes("tutor-infra_pgdata")) die("CẢNH BÁO: volume tutor-infra_pgdata đã biến mất sau khi dọn — KHÔNG được phép xảy ra");
  log("dung lượng SAU khi dọn:", C.dim);
  run("docker", ["system", "df"]);
  log("volume dữ liệu tutor-infra_pgdata: còn nguyên ✓");
}

const COMMANDS = { "docker-up": dockerUp, "docker-down": dockerDown, "docker-clean": dockerClean };

const cmd = process.argv[2];
if (!COMMANDS[cmd]) {
  console.log(`Dùng: node scripts/stack.mjs <lệnh>\n\nCác lệnh: ${Object.keys(COMMANDS).join(", ")}`);
  process.exit(cmd ? 1 : 0);
}
COMMANDS[cmd]();
```

- [ ] **Step 2: Tạo vỏ .bat và .sh**

`docker-up.bat` (tương tự cho `docker-down.bat`, `docker-clean.bat` — đổi tên lệnh):
```bat
@echo off
node "%~dp0scripts\stack.mjs" docker-up %*
```

`docker-up.sh` (tương tự cho 2 file còn lại):
```bash
#!/usr/bin/env bash
exec node "$(dirname "$0")/scripts/stack.mjs" docker-up "$@"
```

Cấp quyền chạy: `chmod +x docker-*.sh`

- [ ] **Step 3: Xóa Makefile** — `git rm Makefile`

- [ ] **Step 4: Verify 3 lệnh docker**

```bash
node scripts/stack.mjs docker-clean     # phải in 2 bảng df + xác nhận pgdata còn
node scripts/stack.mjs docker-up        # rồi: curl -s localhost/api/healthz  → {"status": "ok"}
curl -s -o /dev/null -w "%{http_code}" http://localhost/    # → 200
node scripts/stack.mjs docker-down      # rồi: docker ps -a | grep tutor  → rỗng
docker volume ls | grep tutor-infra_pgdata                  # → CÒN
```
Dán toàn bộ output vào report.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: replace Makefile with node stack script and docker commands"
```

---

### Task 2: `dev-start` và `dev-stop`

**Files:**
- Modify: `scripts/stack.mjs`
- Create: `dev-start.bat`, `dev-stop.bat`, `dev-start.sh`, `dev-stop.sh`

**Interfaces:**
- Consumes: `run/capture/readEnvFile/ensureNetwork/infraUp/portBusy` từ Task 1
- Produces: 2 lệnh mới trong `COMMANDS`

- [ ] **Step 1: Thêm vào `scripts/stack.mjs`** (đặt trước phần `const COMMANDS`)

```js
const children = [];
function spawnLabeled(label, cmd, args, cwd, env) {
  const color = C[label] || C.dim;
  const p = spawn(cmd, args, { cwd, env, shell: process.platform === "win32" });
  const pipe = (stream) => {
    let buf = "";
    stream.on("data", (d) => {
      buf += d.toString();
      const lines = buf.split(/\r?\n/);
      buf = lines.pop();
      for (const l of lines) console.log(`${color}[${label}]${C.off} ${l}`);
    });
  };
  pipe(p.stdout);
  pipe(p.stderr);
  p.on("exit", (code) => console.log(`${color}[${label}]${C.off} thoát với mã ${code}`));
  children.push(p);
  return p;
}

function killChildren() {
  for (const p of children) {
    if (p.exitCode !== null) continue;
    if (process.platform === "win32") spawnSync("taskkill", ["/pid", String(p.pid), "/T", "/F"], { stdio: "ignore" });
    else p.kill("SIGTERM");
  }
}

function devStart() {
  const env = readEnvFile();
  for (const [port, who] of [[5432, "Postgres"], [8000, "Django"], [3000, "Next.js"]]) {
    if (port !== 5432 && portBusy(port)) die(`cổng ${port} (${who}) đang bận — tắt tiến trình đang chiếm rồi chạy lại`);
  }
  infraUp();

  // Django chạy NGOÀI Docker: phải trỏ localhost thay vì tên service "postgres",
  // và dùng settings dev (DEBUG, ALLOWED_HOSTS=*) thay vì prod.
  const beEnv = { ...process.env, ...env, POSTGRES_HOST: "localhost", DJANGO_SETTINGS_MODULE: "config.settings.dev" };

  log("chạy migrate…");
  const mig = spawnSync("uv", ["run", "python", "manage.py", "migrate", "--noinput"], {
    cwd: path.join(ROOT, "backend"), env: beEnv, stdio: "inherit", shell: process.platform === "win32",
  });
  if (mig.status !== 0) die("migrate thất bại — xem log phía trên");

  log("bật Django :8000 và Next.js :3000 — Ctrl+C để tắt cả hai");
  spawnLabeled("be", "uv", ["run", "python", "manage.py", "runserver", "8000"], path.join(ROOT, "backend"), beEnv);
  spawnLabeled("fe", "pnpm", ["dev"], path.join(ROOT, "frontend"), process.env);

  let closing = false;
  process.on("SIGINT", () => {
    if (closing) return;
    closing = true;
    console.log("");
    log("đang tắt Django và Next.js… (Postgres vẫn chạy, dùng dev-stop để tắt hẳn)", C.warn);
    killChildren();
    setTimeout(() => process.exit(0), 800);
  });
}

function devStop() {
  ensureEnv();
  log("dừng container Postgres (giữ container và volume)…");
  run("docker", ["compose", ...INFRA, "stop"], { allowFail: true });
  log("xong — dev-start sẽ bật lại tức thì, dữ liệu nguyên vẹn");
}
```

Và cập nhật: `const COMMANDS = { "dev-start": devStart, "dev-stop": devStop, "docker-up": dockerUp, "docker-down": dockerDown, "docker-clean": dockerClean };`

- [ ] **Step 2: Tạo 4 vỏ** `dev-start.bat`, `dev-stop.bat`, `dev-start.sh`, `dev-stop.sh` theo đúng mẫu Task 1 Step 2 (đổi tên lệnh); `chmod +x dev-*.sh`

- [ ] **Step 3: Verify dev-start**

```bash
node scripts/stack.mjs dev-start     # chạy nền hoặc terminal riêng
# đợi ~15s rồi:
curl -s http://localhost:8000/api/healthz          # → {"status": "ok"}
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/   # → 200
```
Xác nhận log có nhãn `[be]`/`[fe]`. Gửi SIGINT (Ctrl+C hoặc kill -INT) → xác nhận không còn tiến trình python/node của dự án, container Postgres VẪN chạy.

- [ ] **Step 4: Verify dev-stop**

```bash
node scripts/stack.mjs dev-stop
docker ps -a --filter name=tutor-infra --format "{{.Names}} {{.Status}}"   # → Exited
docker volume ls | grep tutor-infra_pgdata                                 # → CÒN
```

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: add dev-start and dev-stop hot-reload commands"
```

---

### Task 3: Tài liệu + sửa quy tắc + verify tổng + push

**Files:**
- Modify: `CLAUDE.md`, `README.md`, `TASKS.md`, `docs/README.md`, `frontend/public/brand/README.md` (nếu còn nhắc make)

- [ ] **Step 1: Sửa quy tắc CLAUDE.md**

Tìm quy tắc kiến trúc cứng số 3 (`Cấm docker compose down -v với project infra; pin version Postgres`) và mục Tech stack nhắc `make up`/`make deploy`. Thay bằng:

- Quy tắc 3 mới: `**Ranh giới dữ liệu**: được phép stop/down container (dựng lại được); CẤM VĨNH VIỄN cờ -v/--volumes trong mọi lệnh docker — hook guard-bash.sh chặn cứng. Pin version Postgres, không dùng latest.`
- Mục Tech stack: thay `Makefile make up/make deploy` bằng `5 lệnh gõ: dev-start / dev-stop / docker-up / docker-down / docker-clean (scripts/stack.mjs; .bat cho Windows, .sh cho Linux). Deploy VPS KHÔNG dùng script này — gọi docker compose thuần qua SSH.`

- [ ] **Step 2: README.md gốc** — thay toàn bộ mục "Chạy dự án" bằng bảng 5 lệnh + ma trận tác động rút gọn (nguồn: spec mục "Ma trận tác động") + ghi rõ cổng của từng chế độ (dev: 3000/8000/5432; docker: 80/5432) + lưu ý PowerShell cần tiền tố `.\`.

- [ ] **Step 3: TASKS.md** — thêm vào mục Đã xong: `- [x] 05/08/2026 — **Bộ 5 lệnh chạy dự án** thay Makefile: dev-start (hot-reload, vá lỗ hổng POSTGRES_HOST/settings), dev-stop, docker-up, docker-down, docker-clean (spec/plan 2026-08-05)`

- [ ] **Step 4: docs/README.md** — thêm 2 dòng index cho spec và plan mới, trạng thái "đã thực thi 05/08/2026"

- [ ] **Step 5: Verify tổng + DoD đầy đủ**

Chạy trọn kịch bản DoD trong spec (8 mục), đặc biệt mục 6: sau `docker-down`, chạy lại `dev-start` và kiểm tra DB vẫn còn bảng cũ (`uv run python manage.py showmigrations | head`) — chứng minh volume sống sót qua chu kỳ xóa container.

Kèm: `cd frontend && pnpm test && pnpm lint && pnpm format:check && pnpm build` sạch.

- [ ] **Step 6: Commit + push nhánh**

```bash
git add -A && git commit -m "docs: document the five project commands and update data-boundary rule"
git push -u origin feat/dev-commands
```
DỪNG — controller final review rồi merge.
