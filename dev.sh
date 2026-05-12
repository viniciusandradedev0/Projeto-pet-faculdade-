#!/usr/bin/env bash
# Sobe API (.NET) em :5173 e front (npx serve) em :3000.
# Ctrl+C derruba os dois.

set -e

cd "$(dirname "$0")"

cleanup() {
  echo ""
  echo "Encerrando..."
  kill 0 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "→ Backend em http://localhost:5173"
( cd backend/PawsPlace.Api && dotnet run ) &

echo "→ Front em http://localhost:3000"
npx serve &

wait
