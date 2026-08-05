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
  if (process.platform === "win32") {
    // netstat -ano liệt kê MỌI kết nối (LISTENING, ESTABLISHED, TIME_WAIT…), không
    // chỉ cổng đang lắng nghe. Nếu chỉ tìm chuỗi "port" sẽ dính false positive với
    // các kết nối TIME_WAIT còn sót (ví dụ do curl trước đó) dù không ai lắng nghe
    // cổng đó — nên phải lọc đúng dòng có state LISTENING và khớp cổng ở Local Address.
    const out = capture("netstat", ["-ano"]);
    return out.split(/\r?\n/).some((line) => {
      if (!/\bLISTENING\b/.test(line)) return false;
      const m = line.match(/^\s*(?:TCP|UDP)\s+(\S+)/i);
      return !!m && m[1].endsWith(`:${port}`);
    });
  }
  const out = capture("ss", ["-ltn"]);
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

  // Django chạy NGOÀI Docker: phải trỏ 127.0.0.1 thay vì tên service "postgres"
  // (và thay vì "localhost" — trên máy này "localhost" phân giải ra ::1 trước,
  // không có gì lắng nghe ở đó nên mỗi kết nối mất ~10s chờ rồi mới rớt về IPv4),
  // và dùng settings dev (DEBUG, ALLOWED_HOSTS=*) thay vì prod.
  const beEnv = { ...process.env, ...env, POSTGRES_HOST: "127.0.0.1", DJANGO_SETTINGS_MODULE: "config.settings.dev" };

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

const COMMANDS = { "dev-start": devStart, "dev-stop": devStop, "docker-up": dockerUp, "docker-down": dockerDown, "docker-clean": dockerClean };

const cmd = process.argv[2];
if (!COMMANDS[cmd]) {
  console.log(`Dùng: node scripts/stack.mjs <lệnh>\n\nCác lệnh: ${Object.keys(COMMANDS).join(", ")}`);
  process.exit(cmd ? 1 : 0);
}
COMMANDS[cmd]();
