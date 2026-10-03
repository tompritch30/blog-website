# Glossary

Words used in code, tests and plans. Use these names; add a line when a new term appears.

- **Post**: one MDX file in `src/content/posts/`. Its file name is its **slug** and its URL is `/blog/<slug>`.
- **Frontmatter**: the YAML block at the top of a post: `title`, `date` (quoted `YYYY-MM-DD`), `description`, optional `tags` and `draft`. Validated once, in `src/lib/posts.ts`.
- **Draft**: a post with `draft: true`. Shown by `next dev` only; never built, listed, put in the sitemap or the feed.
- **Published post**: any post that is not a draft.
- **Site config**: `src/lib/site.ts`: name, tagline, description, GitHub link and the **site URL**.
- **Site URL**: the public origin. `NEXT_PUBLIC_SITE_URL`, else Vercel's production domain, else `http://localhost:3000`.
- **Share image**: the Open Graph image generated at build time (`opengraph-image.tsx`); one for the site, one per post.
- **Feed**: the RSS 2.0 document at `/feed.xml`.
- **Colour token**: a CSS custom property in `globals.css` (`--text`, `--secondary`, `--muted`, ...). Text tokens must meet WCAG AA on every background token.
- **Guard**: `.claude/hooks/guard.py`, the PreToolUse hook that stops agents pushing, deploying, publishing or reading secrets.
- **Invaders game**: the hidden game in `src/components/invaders/Game.tsx`; the invaders are word blocks from `src/components/invaders/words.ts` (the things Thomas builds with). Its rules live in the pure engine, `src/lib/invaders/engine.ts`.
- **Alien trigger**: the small pixel-alien button (`AlienTrigger.tsx`) that starts the invaders game; the Konami code is a second way in.
