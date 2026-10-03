"""Table tests for guard.py. Run: python3 .claude/hooks/test_guard.py

Each case runs the real hook as a subprocess with a real PreToolUse payload
and checks the exit code: 2 blocks, 0 allows.
"""

import json
import subprocess
import sys
from pathlib import Path

GUARD = Path(__file__).with_name("guard.py")

BLOCK = [
    # pushes, including option forms and alias/config/remote tricks
    ("Bash", {"command": "git push origin main"}),
    ("Bash", {"command": "cd x && git push"}),
    ("Bash", {"command": "git -C ~/dev/blog-website push origin release-prep"}),
    ("Bash", {"command": "git -c core.hooksPath=/dev/null push"}),
    ("Bash", {"command": "git --git-dir .git push --force"}),
    ("Bash", {"command": "git config alias.ship push && git ship"}),
    ("Bash", {"command": "git -c alias.p=push p origin main"}),
    ("Bash", {"command": "git remote add origin git@github.com:x/y.git"}),
    ("Bash", {"command": "git remote set-url --push origin https://github.com/x/y.git"}),
    ("Bash", {"command": "git config core.hooksPath /dev/null"}),
    ("Bash", {"command": "GIT_CONFIG_COUNT=1 GIT_CONFIG_KEY_0=alias.p git p"}),
    ("PowerShell", {"command": "wsl.exe -d Ubuntu -- bash -lc \"cd ~/dev/blog-website && git push\""}),
    # skipping hooks
    ("Bash", {"command": "git commit --no-verify -m 'feat: x'"}),
    ("Bash", {"command": "git commit -n -m 'feat: x'"}),
    # GitHub writes
    ("Bash", {"command": "gh repo create blog-website --public --source=. --push"}),
    ("Bash", {"command": "gh repo edit --visibility public"}),
    ("Bash", {"command": "gh repo delete tompritch30/tompritch30.github.io --yes"}),
    ("Bash", {"command": "gh pr create --fill"}),
    ("Bash", {"command": "gh api -X PATCH repos/x/y -F private=false"}),
    ("Bash", {"command": "gh api repos/x/y/pages -f source=main"}),
    ("Bash", {"command": "gh auth token"}),
    ("Bash", {"command": "gh secret set FOO"}),
    # deploys and publishing
    ("Bash", {"command": "vercel --prod"}),
    ("Bash", {"command": "npx vercel deploy"}),
    ("Bash", {"command": "vercel"}),
    ("Bash", {"command": "vercel env pull .env.local"}),
    ("Bash", {"command": "npm publish"}),
    # credentials
    ("Bash", {"command": "cat ~/.ssh/id_ed25519"}),
    ("Bash", {"command": "cat ~/.config/gh/hosts.yml"}),
    ("Bash", {"command": "cat ~/.local/share/com.vercel.cli/auth.json"}),
    ("Bash", {"command": "git credential fill"}),
    ("Bash", {"command": "echo $GITHUB_TOKEN"}),
    ("Read", {"file_path": "/home/tom/.claude/.credentials.json"}),
    ("Read", {"file_path": "/home/tom/.npmrc"}),
    ("Glob", {"pattern": "**/.ssh/*"}),
    # the guardrails themselves
    ("Edit", {"file_path": "/home/tom/dev/blog-website/.claude/hooks/guard.py", "old_string": "a", "new_string": "b"}),
    ("Write", {"file_path": "/home/tom/dev/blog-website/.claude/settings.json", "content": "{}"}),
    ("Write", {"file_path": "/home/tom/dev/blog-website/.claude/settings.local.json", "content": "{}"}),
    ("Write", {"file_path": "/home/tom/dev/blog-website/lefthook.yml", "content": ""}),
    ("Bash", {"command": "rm .git/hooks/pre-push"}),
    ("Bash", {"command": "echo 'exit 0' > scripts/hooks/pre-push"}),
    ("Bash", {"command": "sed -i 's/exit 1/exit 0/' .git/hooks/pre-push"}),
    ("Bash", {"command": "rm -f .claude/hooks/guard.py"}),
    # .env files
    ("Bash", {"command": "echo NEXT_PUBLIC_SITE_URL=https://real.example.org > .env.local"}),
    ("Bash", {"command": "printf 'X=1' | tee .env"}),
    ("Bash", {"command": "cat .env.local"}),
    ("Read", {"file_path": "/home/tom/dev/blog-website/.env.local"}),
    ("Write", {"file_path": "/home/tom/dev/blog-website/.env", "content": "A=1\n"}),
    ("Write", {"file_path": "/home/tom/dev/blog-website/.env.production", "content": "A=\n"}),
    ("Write", {"file_path": "/home/tom/dev/blog-website/.env.example", "content": "API_KEY=sk-live-123456\n"}),
    ("Edit", {"file_path": "/home/tom/dev/blog-website/.env.example", "old_string": "A=", "new_string": "A=hunter22"}),
]

ALLOW = [
    ("Bash", {"command": "git status"}),
    ("Bash", {"command": "git log --oneline release-prep"}),
    ("Bash", {"command": "git commit -m 'fix: format post dates in UTC'"}),
    ("Bash", {"command": "git config --get remote.origin.url"}),
    ("Bash", {"command": "git clone --branch release-prep /home/tom/dev/blog-website /tmp/blog-fresh"}),
    ("Bash", {"command": "gh pr list"}),
    ("Bash", {"command": "gh api repos/vercel/next.js/releases/latest"}),
    ("Bash", {"command": "npm ci && npm run build && npm start"}),
    ("Bash", {"command": "curl -s http://localhost:3000/"}),
    ("Bash", {"command": "ls public/vercel.svg"}),
    ("Bash", {"command": "cat .env.example"}),
    ("Bash", {"command": "grep -rn vercel.com docs/deploy.md"}),
    ("Read", {"file_path": "/home/tom/dev/blog-website/src/lib/posts.ts"}),
    ("Read", {"file_path": "/home/tom/dev/blog-website/.env.example"}),
    ("Write", {"file_path": "/home/tom/dev/blog-website/README.md", "content": "# Blog\n"}),
    ("Write", {"file_path": "/home/tom/dev/blog-website/.env.example",
               "content": "# Public URL of the site\nNEXT_PUBLIC_SITE_URL=\nOTHER=<your-value>\n"}),
    ("Glob", {"pattern": "src/**/*.tsx"}),
    ("Read", {"file_path": "/home/tom/dev/blog-website/.claude/hooks/guard.py"}),
    ("Bash", {"command": "cat lefthook.yml && python3 .claude/hooks/test_guard.py"}),
    ("Bash", {"command": "scripts/check-push-refusal.sh"}),
    ("WebFetch", {"url": "https://nextjs.org/docs", "prompt": "x"}),
]


def run(tool: str, inp: dict) -> int:
    payload = {"tool_name": tool, "tool_input": inp, "session_id": "test", "cwd": "/tmp"}
    p = subprocess.run([sys.executable, str(GUARD)], input=json.dumps(payload), capture_output=True,
                       text=True, timeout=20)
    return p.returncode


def main() -> int:
    bad = [("BLOCK", t, i) for t, i in BLOCK if run(t, i) != 2]
    bad += [("ALLOW", t, i) for t, i in ALLOW if run(t, i) != 0]
    garbage = subprocess.run([sys.executable, str(GUARD)], input="not json", capture_output=True, text=True)
    if garbage.returncode != 2:
        bad.append(("FAIL-CLOSED", "garbage payload", garbage.returncode))
    for kind, tool, inp in bad:
        print("WRONG:", kind, tool, str(inp)[:160])
    total = len(BLOCK) + len(ALLOW) + 1
    print(f"{total - len(bad)}/{total} ok")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main())
