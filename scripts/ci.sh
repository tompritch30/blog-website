#!/usr/bin/env bash
# The whole local gate, the same checks as the git hooks plus a production build.
# Usage: scripts/ci.sh
set -euo pipefail
cd "$(dirname "$0")/.."
step() { printf '\n== %s\n' "$*"; }

step "node $(node --version)"
case "$(node --version)" in
  v2[2-9].*|v[3-9][0-9].*) ;;
  *) echo "Node 22 or later expected (see .nvmrc)"; exit 1 ;;
esac

step "git hooks: pre-push refuses"
scripts/check-push-refusal.sh

step "lint"
npm run lint

step "slop lint (source)"
npm run lint:slop

step "slop lint (design system and release process)"
npm run lint:slop -- design/SYSTEM.md docs/writing-a-post.md

step "typecheck"
npm run typecheck

step "unit tests"
npm test

step "guard hook tests"
python3 .claude/hooks/test_guard.py

step "build"
npm run build

step "slop lint (built pages, CSS and controls budget)"
npm run lint:slop -- --built

echo
echo "ci: all gates green"
