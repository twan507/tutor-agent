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
