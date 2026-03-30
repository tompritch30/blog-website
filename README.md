# Personal Blog

Personal site and blog. Next.js 16 (App Router) + Tailwind v4 + MDX + Vercel.

## Stack

- **Next.js 16** — App Router, static generation
- **Tailwind v4** — CSS-first config
- **next-mdx-remote** — MDX rendering in RSC
- **gray-matter** — frontmatter parsing
- **@tailwindcss/typography** — `prose` class for post body

Design: warm off-white (#FAFAF8) / near-black, Inter, dark mode via prefers-color-scheme, CSS custom properties
throughout.

To run locally:
export PATH="$HOME/.local/share/fnm:$PATH" && eval "$(fnm env)" && fnm use 22
npm run dev

Before going live: search for // TODO — there are ~6 placeholders for your name, domain, and GitHub handle. SETUP.md
covers Vercel + Cloudflare step by step.

## Local dev

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Writing a post

Create a `.mdx` file in `src/content/posts/`:

```mdx
---
title: "Your post title"
date: "2026-04-15"
description: "One-sentence summary shown in the post list."
tags: ["tag1", "tag2"]
---

Your content here. Full markdown + React components.
```

The filename becomes the URL slug — `my-post.mdx` → `/blog/my-post`.

Posts are sorted by date descending. The homepage shows the 3 most recent.

## TODO before going live

- [ ] Replace "Tom" placeholders in `Nav.tsx`, `Footer.tsx`, `layout.tsx`, `page.tsx`, `about/page.tsx`
- [ ] Update `metadata` in `layout.tsx` with your real domain
- [ ] Update GitHub link in `Nav.tsx`
- [ ] Fill in `about/page.tsx`
- [ ] Add a `favicon.ico` / `apple-touch-icon.png` in `public/`
- [ ] Consider `src/app/sitemap.ts` for SEO (trivial to add once you have a domain)

## Deployment

See `SETUP.md` for Vercel + Cloudflare domain setup.
