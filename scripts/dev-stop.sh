#!/usr/bin/env bash
exec node "$(dirname "$0")/stack.mjs" dev-stop "$@"
