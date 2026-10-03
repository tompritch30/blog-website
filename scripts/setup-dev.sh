#!/usr/bin/env bash
# Contributor setup: dependencies, git hooks (lefthook), and the pre-push refusal.
# Not needed to run or deploy the site; `npm ci` alone is enough for that.
set -euo pipefail
cd "$(dirname "$0")/.."
npm ci --no-audit --no-fund
npx lefthook install
# After lefthook, so nothing it installs can replace the refusal.
install -m 0755 scripts/hooks/pre-push "$(git rev-parse --git-path hooks)/pre-push"
scripts/check-push-refusal.sh
