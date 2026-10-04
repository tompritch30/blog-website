# Writing and releasing a post

Every post is a draft for now, so the live site shows none and `/writing` says "Articles coming soon." These are the steps to write one and put it live.

## 1. Create the file

Add `src/content/posts/<slug>.mdx`. The file name is the slug and the URL: `my-post.mdx` becomes `/writing/my-post`. A slug is lowercase letters and digits in words joined by single hyphens (`my-post`, `rag-in-2027`): no capitals, spaces, underscores or leading, trailing or double hyphens. The build stops and names the file if it breaks this rule.

## 2. Write the frontmatter

```mdx
---
title: "Your post title"
date: "2026-03-30"
description: "One sentence for the post list, the feed and share cards."
draft: true
---

The post, in Markdown. GitHub tables, code blocks and React components work.
```

- `title`: required, not empty.
- `date`: required, quoted, `"YYYY-MM-DD"`. Any date you like: backdating is fine, and posts are listed newest first by this date. An unquoted date fails the build with the file name.
- `description`: required, one sentence.
- `draft`: `true` while you write. Leave the line out, or set `draft: false`, to publish.

## 3. Preview it

Neither checkout has a `.claude/launch.json`, so start the dev server by hand from the repo folder:

```bash
npm run dev               # http://localhost:3005
npx next dev -p 3006      # or on 3006, as the kb worktree is served
```

The dev server renders a draft at its own URL, `http://localhost:3006/writing/<slug>`, with a "Draft" banner at the top. Nothing links to it: drafts are never listed on `/writing`, in dev either, so dev looks like the live site. A production build never builds, lists or feeds a draft: its URL is a 404.

## 4. Check it

```bash
scripts/ci.sh
```

It must end `ci: all gates green`. The slop lint checks the post's prose too (no em dashes, no marketing words).

## 5. Commit and push

```bash
git add src/content/posts/<slug>.mdx
git commit -m "feat(posts): add <slug>"
git push --no-verify origin main
```

A plain `git push origin main` is refused, by design: `scripts/setup-dev.sh` installs `scripts/hooks/pre-push`, which refuses every push with "push disabled: owner rule" so that no agent can push. `--no-verify` skips that hook. Only you push, by hand; agents never push (their guard hook blocks any `git push` before it runs).

Once the one-time setup in [deploy.md](deploy.md) is done, Vercel deploys every push to `main` by itself.

## Publishing an existing draft

Set `draft: false` in its frontmatter (or delete the `draft` line), then do steps 4 and 5. The post then appears on `/writing`, in `/feed.xml` and in the sitemap, and its URL works. The home page has no Writing section while writing is hidden, so it does not list posts.
