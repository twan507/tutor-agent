#!/usr/bin/env bash
# PreToolUse hook (Bash): chặn các lệnh vi phạm kỷ luật git / phá hoại.
# Exit 2 = chặn tool call, stderr được đưa lại cho Claude.

input=$(cat)

block() {
  echo "BLOCKED: $1 (quy tắc: .claude/settings.json)" >&2
  exit 2
}

if printf '%s' "$input" | grep -qE -- '--no-verify'; then
  block "cấm bypass hook/verify bằng --no-verify"
fi

if printf '%s' "$input" | grep -qE 'git[^"]*push[^"]*(--force|-f[ "])'; then
  block "cấm force push"
fi

if printf '%s' "$input" | grep -qE 'rm[[:space:]]+-[a-zA-Z]*r[a-zA-Z]*f|rm[[:space:]]+-[a-zA-Z]*f[a-zA-Z]*r'; then
  block "cấm rm -rf; nếu thật sự cần xóa đệ quy, người dùng tự chạy"
fi

# Ranh giới sống còn của dữ liệu: xóa container thì dựng lại được,
# xóa VOLUME là mất dữ liệu vĩnh viễn.
if printf '%s' "$input" | grep -qE 'docker[^"]*compose[^"]*down[^"]*(-v|--volume)'; then
  block "cấm 'docker compose down -v' — xóa volume là mất sạch dữ liệu DB; dùng down/stop không cờ -v"
fi

if printf '%s' "$input" | grep -qE 'docker[[:space:]]+volume[[:space:]]+(rm|prune)'; then
  block "cấm 'docker volume rm/prune' — có thể xóa volume dữ liệu DB; người dùng tự chạy nếu thật sự cần"
fi

if printf '%s' "$input" | grep -qE 'docker[[:space:]]+system[[:space:]]+prune[^"]*--volume'; then
  block "cấm 'docker system prune --volumes' — cuốn theo cả volume dữ liệu"
fi

exit 0