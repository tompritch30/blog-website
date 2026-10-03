# blog-website

Thomas Pritchard's personal site and blog: a small Next.js app that turns MDX files into static pages.

## Why

A personal site should be cheap to run, quick to load and easy to write for. Posts are plain MDX files in the repo, every page is built ahead of time, and Vercel serves the result. There is no database, CMS or client-side data fetching.

![The home page: name, tagline, search box and post list](docs/screenshot.jpg)

## Quickstart

You need Node 22 and npm. With nvm or fnm, `.nvmrc` selects the version and installs it if it is missing.

```bash
git clone https://github.com/tompritch30/blog-website.git
cd blog-website
nvm install        # or: fnm use --install-if-missing
npm ci
npm test
npm run build
npm start
```

Open http://localhost:3000. For writing, use `npm run dev` instead of build and start: it reloads on save and shows draft posts.

`npm ci` also installs this repo's git hooks through lefthook: lint, type check and tests before each commit, and a Conventional Commits check on the message.

## Writing a post

Add `src/content/posts/<slug>.mdx`. The file name is the URL: `my-post.mdx` becomes `/blog/my-post`.

```mdx
---
title: "Your post title"
date: "2026-10-03"
description: "One sentence for the post list, the feed and share cards."
tags: ["tag-one", "tag-two"]
draft: true
---

Markdown, GitHub tables and code blocks, and React components.
```

- `date` must be quoted `YYYY-MM-DD`; the build fails with the file name if it is not.
- `draft: true` shows the post in `npm run dev` only. Production builds, the sitemap and the feed leave it out. Delete the line to publish. The MDX file is still in the repo, so anyone can read a draft on GitHub if the repo is public.
- The About page is `src/content/about.mdx`.

## Configuration

| Setting | Where | Default | Purpose |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | environment variable | Vercel's production domain, else `http://localhost:3000` | Origin for canonical URLs, the sitemap, the RSS feed and share images. Set it once there is a custom domain. |
| Name, tagline, GitHub link | `src/lib/site.ts` | Thomas Pritchard | Shown in the header, home page, footer, metadata and share images. |
| Colours | `src/app/globals.css` | Warm off-white and near-black, with a dark mode | A test checks every text colour meets WCAG AA contrast. |
| Node version | `.nvmrc`, `package.json` `engines` | 22 | Vercel builds with the `engines` version. |

`.env.example` lists the environment variables.

## Deploying

Vercel's Next.js defaults work as they are. The step-by-step guide, including a custom domain and retiring the old GitHub Pages site, is in [docs/deploy.md](docs/deploy.md). In short: import the GitHub repo at vercel.com and deploy.

## How it works

```
src/content/posts/*.mdx --> src/lib/posts.ts --> pages under src/app/ --> static HTML at build time
   (frontmatter checked,      (drafts hidden       /, /about, /blog/<slug>,
    dates validated)           in production)      /feed.xml, /sitemap.xml, share images
```

- `src/lib/posts.ts` reads and validates the MDX files. `src/components/Mdx.tsx` renders them with GitHub-flavoured Markdown, heading anchors and code highlighting.
- `src/app/blog/[slug]/page.tsx` builds one page per published post. Unknown slugs return 404.
- `src/app/feed.xml/route.ts`, `sitemap.ts`, `robots.ts` and the `opengraph-image.tsx` files produce the feed, sitemap and share images.
- `scripts/ci.sh` runs every check: lint, type check, unit tests, the agent guard tests and a production build.

## Working on it with coding agents

`CLAUDE.md` holds the rules for agents: no pushing, deploying or publishing; no secrets or personal data. A hook in `.claude/hooks/guard.py` enforces them. Run `scripts/setup-dev.sh` once to install the git hooks and the pre-push refusal. `.claude/skills/` holds engineering skills adapted from [Matt Pocock's skills](https://github.com/mattpocock/skills) (MIT); each folder has its own `ATTRIBUTION.md` and `LICENSE`.

## Status and limitations

- A personal site with one author. It is not a template, though the code is free to reuse under the licence below.
- The About page bio, the tagline, the icon and the share images are placeholders.
- No comments, analytics, tag pages or pagination yet. All posts are listed on the home page.
- Search filters the post list in the browser by title, description and tags; it does not search post bodies.

## Licence

The code is under the [MIT licence](LICENSE). The writing in `src/content/` is © Thomas Pritchard, all rights reserved.
