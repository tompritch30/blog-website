#!/usr/bin/env python3
"""PreToolUse guard for agents working on this repo. Fires in every permission mode.

Reads the hook payload on stdin and exits 2 with a reason on stderr to block.
The owner publishes and deploys by hand, so agents may not push, change GitHub,
deploy to Vercel, publish packages, read credentials, or write real values into
.env files. Adapted from the Hazel repo's guard, scaled down for a small site.

Fails closed: an unparseable payload or an internal error blocks the call.
"""

import json
import re
import sys

I = re.IGNORECASE

GIT_PREFIX = (
    r"\bgit(?:\s+(?:-[cC]\s+\S+|--(?:git-dir|work-tree|namespace|exec-path|config-env)\s+\S+|"
    r"--[\w-]+(?:=\S+)?|-\w+))*\s+"
)
GIT_PUSH = re.compile(GIT_PREFIX + r"(push|send-email)\b")
GIT_NO_VERIFY = re.compile(
    GIT_PREFIX + r"(commit|merge|rebase|cherry-pick|am|revert)\b[^|;&]*\s(--no-verify\b|-n\b)"
)
GIT_CONF = re.compile(
    GIT_PREFIX + r"(remote\s+(add|set-url|rename)\b|config\b(?![^|;&]*\s--(get|list|get-regexp)\b)"
    r"[^|;&]*(alias\.|pushurl|insteadof|hookspath|remote\.\S*\.url))|"
    r"\bgit\b[^|;&]*\s-c\s+\S*(alias\.|pushurl|insteadof|hookspath)|GIT_CONFIG_(PARAMETERS|COUNT)",
    I,
)
GH_WRITE = re.compile(
    r"\bgh\s+(?:-\S+\s+)*[\w-]+\s+(create|edit|delete|rename|merge|close|reopen|comment|review|fork|sync|"
    r"archive|unarchive|set|set-default|upload|run|rerun|cancel|enable|disable|transfer|ready|deploy|add|remove)\b|"
    r"\bgh\s+(secret|variable|ssh-key|gpg-key|browse)\b|\bgh\s+auth\s+(token|refresh|login|setup-git)\b"
)
GH_API_WRITE = re.compile(r"\bgh\s+api\b[^|;&]*(\s(-X|--method)[\s=]*['\"]?(?!(?i:GET|HEAD)\b)[A-Za-z]|\s(-f|-F|--field|--raw-field|--input)[\s=])")
VERCEL = re.compile(r"(^|[\s;&|(])(npx\s+|pnpm\s+dlx\s+|bunx\s+)?vercel(\s|$)(?!\s*(--version|-v|help|whoami)\b)", I)
PUBLISH = re.compile(r"\b(npm|pnpm|yarn|bun)\s+publish\b")
CREDENTIAL_PATHS = re.compile(
    r"(\.credentials|\.ssh[/\\]|\.aws[/\\]|gh[/\\]hosts\.yml|\.netrc|\.git-credentials|\.npmrc|\.pypirc|"
    r"\.docker[/\\]config\.json|\bid_(rsa|ed25519|ecdsa)\b|com\.vercel\.cli|vercel[/\\]auth\.json|"
    r"Login Data|cookies\.sqlite|logins\.json|\.gnupg[/\\]|keychain)",
    I,
)
CREDENTIAL_CMDS = re.compile(
    r"\bgit\s+credential\b|\bcmdkey\b|\bsecret-tool\b|\bsecurity\s+find-|"
    r"(printenv|echo)\s+\$?\{?\w*(TOKEN|SECRET|API_?KEY|PASSWORD)",
    I,
)
ENV_FILE = re.compile(r"(^|[/\\])\.env(\.[\w.-]+)?$")
ENV_EXAMPLE = re.compile(r"(^|[/\\])\.env\.example$")
SHELL_ENV_WRITE = re.compile(r"(>>?|\btee\b(\s+-a)?)\s*['\"]?\S*\.env(\.(?!example\b)[\w.-]+)?['\"]?(\s|$)")
SHELL_ENV_READ = re.compile(
    r"\b(cat|less|more|head|tail|bat|Get-Content|source)\s+[^|;&]*\.env(\.(?!example\b)[\w.-]+)?(\s|$)", I
)
PLACEHOLDER = re.compile(r"^(|<[^>]*>|your[-_ ].*|changeme|example.*|https?://localhost\S*|xxx+)$", I)

PROTECTED = r"(\.claude[/\\](hooks\b|settings[\w.]*\.json)|\.git[/\\](hooks|config)\b|scripts[/\\]hooks\b|lefthook\.yml)"
PROTECTED_RX = re.compile(PROTECTED, I)
PROTECTED_WRITE = re.compile(
    r"(sed\s+-i|\btee\b|\brm\b|\bmv\b|\bcp\b|\binstall\b|chmod|truncate|\bln\b|Set-Content|Add-Content|Out-File|"
    r"Remove-Item|Move-Item|Copy-Item|>)[^|;&]*" + PROTECTED,
    I,
)
GUARDRAIL_FILES = "guardrail files (.claude/hooks, .claude/settings*, .git/hooks, scripts/hooks, lefthook.yml) are owner-only"

SHELL_RULES: list[tuple[re.Pattern[str], str]] = [
    (PROTECTED_WRITE, GUARDRAIL_FILES),
    (GIT_PUSH, "no git push: the owner pushes by hand"),
    (GIT_NO_VERIFY, "git hooks are mandatory: no --no-verify / -n"),
    (GIT_CONF, "no changing git remotes, push URLs, aliases or hook paths"),
    (GH_WRITE, "no GitHub writes (repo create/edit/delete, PRs, secrets, auth tokens)"),
    (GH_API_WRITE, "no GitHub writes through gh api"),
    (VERCEL, "no Vercel CLI: the owner deploys by hand"),
    (PUBLISH, "no publishing packages"),
    (SHELL_ENV_WRITE, "no writing .env files: only .env.example, with placeholder values"),
    (SHELL_ENV_READ, "no reading .env files: they may hold real secrets"),
]


def block(reason: str) -> None:
    print(f"BLOCKED by repo guard: {reason}", file=sys.stderr)
    sys.exit(2)


def check_shell(cmd: str) -> None:
    for rx, why in SHELL_RULES:
        if rx.search(cmd):
            block(why)
    if CREDENTIAL_PATHS.search(cmd) or CREDENTIAL_CMDS.search(cmd):
        block("no reading credentials, tokens or browser profiles")


def env_values_are_placeholders(text: str) -> bool:
    for line in text.splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        value = line.split("=", 1)[1].strip().strip("'\"")
        if not PLACEHOLDER.match(value):
            return False
    return True


def written_text(inp: dict) -> str:
    parts = [inp.get("content"), inp.get("new_string")]
    parts += [e.get("new_string") for e in inp.get("edits") or [] if isinstance(e, dict)]
    return "\n".join(str(p) for p in parts if p)


def check_file_tool(tool: str, inp: dict) -> None:
    path = str(inp.get("file_path") or inp.get("notebook_path") or inp.get("path") or "")
    pattern = str(inp.get("pattern") or "") if tool == "Glob" else ""
    if CREDENTIAL_PATHS.search(path) or CREDENTIAL_PATHS.search(pattern):
        block("no reading credentials, tokens or browser profiles")
    if tool not in ("Write", "Edit", "MultiEdit"):
        if ENV_FILE.search(path) and not ENV_EXAMPLE.search(path):
            block("no reading .env files: they may hold real secrets")
        return
    if PROTECTED_RX.search(path):
        block(GUARDRAIL_FILES)
    if ENV_EXAMPLE.search(path):
        if not env_values_are_placeholders(written_text(inp)):
            block(".env.example holds placeholders only, never real values")
    elif ENV_FILE.search(path):
        block("no writing .env files: only .env.example, with placeholder values")


def check(tool: str, inp: dict) -> None:
    if tool in ("Bash", "PowerShell"):
        check_shell(" ".join(str(inp.get("command", "")).split()))
    elif tool in ("Read", "Grep", "Glob", "Write", "Edit", "MultiEdit", "NotebookEdit"):
        check_file_tool(tool, inp)


def main() -> None:
    try:
        payload = json.load(sys.stdin)
        check(str(payload.get("tool_name", "")), payload.get("tool_input") or {})
    except SystemExit:
        raise
    except Exception as e:  # fail closed: a guard that crashes must not let the call through
        block(f"guard error, failing closed: {type(e).__name__}: {e}")


if __name__ == "__main__":
    main()
