#!/usr/bin/env bash
# commit-msg gate: Conventional Commits subject, no emoji, no marketing words.
set -euo pipefail
subject=$(grep -v '^#' "$1" | head -n 1)
types='feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert'
if ! printf '%s' "$subject" | grep -Eq "^($types)(\([a-z0-9-]+\))?!?: .{1,72}$"; then
  echo "commit subject must be a Conventional Commit, e.g. 'fix(posts): format dates in UTC' (got: $subject)"
  exit 1
fi
if grep -v '^#' "$1" | grep -Eqi 'seamless|robust|powerful|leverag|cutting-edge|effortless|comprehensive'; then
  echo "commit message uses a banned marketing word"
  exit 1
fi
if grep -v '^#' "$1" | LC_ALL=C grep -q -P '[\xF0-\xF4]'; then
  echo "commit message contains emoji"
  exit 1
fi
