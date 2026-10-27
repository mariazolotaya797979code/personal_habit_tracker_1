#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
ROOT="."
if [ -f dist/index.html ]; then ROOT="dist"; fi
PORT="${PORT:-8765}"
if command -v python3 >/dev/null 2>&1; then
  (sleep 1; command -v open >/dev/null && open "http://127.0.0.1:$PORT/" || xdg-open "http://127.0.0.1:$PORT/" >/dev/null 2>&1 || true) &
  python3 -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT"
elif command -v python >/dev/null 2>&1; then
  (sleep 1; command -v open >/dev/null && open "http://127.0.0.1:$PORT/" || true) &
  python -m http.server "$PORT" --bind 127.0.0.1 --directory "$ROOT"
else
  echo "Нужен Python 3, чтобы открыть приложение локально."
  exit 1
fi
