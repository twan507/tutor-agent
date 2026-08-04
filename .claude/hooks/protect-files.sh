#!/usr/bin/env bash
# PreToolUse hook (Edit|Write): chặn sửa các file được bảo vệ.
# Exit 2 = chặn tool call, stderr được đưa lại cho Claude.
# Ngoại lệ: .env.example là file template vô hại (chỉ placeholder) — cho phép.

input=$(cat)

path=$(printf '%s' "$input" \
  | grep -o '"file_path"[[:space:]]*:[[:space:]]*"[^"]*"' \
  | head -1 \
  | sed 's/.*:[[:space:]]*"//; s/"$//')

# Chuẩn hóa: backslash (kể cả \\ trong JSON) -> /, gộp // thành /
path=$(printf '%s' "$path" | tr '\\' '/' | tr -s '/')

case "$path" in
  *.env.example)
    exit 0
    ;;
  *.env|*/.env.*|*/.claude/settings.json|*/.claude/settings.local.json|*/.claude/hooks/*)
    echo "BLOCKED: '$path' là file được bảo vệ. Chỉ người dùng được sửa trực tiếp (quy tắc: .claude/settings.json)." >&2
    exit 2
    ;;
esac

exit 0