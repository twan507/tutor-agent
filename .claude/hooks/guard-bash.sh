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

exit 0
