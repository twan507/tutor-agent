#!/usr/bin/env bash
exec node "$(dirname "$0")/scripts/stack.mjs" dev-stop "$@"
