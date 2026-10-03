#!/usr/bin/env bash
# Gate: the installed pre-push hook exists, is executable, and refuses with the owner-rule message.
set -euo pipefail
cd "${1:-.}"
hook="$(git rev-parse --git-path hooks)/pre-push"
if [ ! -x "$hook" ]; then
  echo "pre-push hook missing or not executable: $hook (run scripts/setup-dev.sh)"
  exit 1
fi
set +e
out=$(printf 'refs/heads/x 0 refs/heads/x 0\n' | "$hook" origin https://example.invalid 2>&1)
code=$?
set -e
if [ "$code" -eq 0 ]; then
  echo "pre-push hook let a push through: $hook"
  exit 1
fi
case "$out" in
  *"push disabled: owner rule"*) echo "pre-push: refuses ($hook)" ;;
  *) echo "pre-push hook exited $code without the owner-rule refusal: $out"; exit 1 ;;
esac
