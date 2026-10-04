# Glossary

Words used in code, tests and plans. Use these names; add a line when a new term appears.

- **Post**: one MDX file in `src/content/posts/`. Its file name is its **slug**.
- **Post URL**: `/writing/<slug>` (`postPath` in `src/lib/paths.ts`); `/writing` lists the published posts. The old `/blog` and `/blog/<slug>` URLs redirect there permanently (308, `next.config.ts`).
- **Frontmatter**: the YAML block at the top of a post: `title`, `date` (quoted `YYYY-MM-DD`), `description` and optional `draft`. Validated once, in `src/lib/posts.ts`; any other key (an old `tags` line, say) is ignored. Posts have no tags: the site shows none.
- **Draft**: a post with `draft: true`. Shown by `next dev` only; never built, listed, put in the sitemap or the feed.
- **Published post**: any post that is not a draft.
- **Profile**: `src/content/profile.ts`, the facts about Thomas the pages render: the intro, the case studies, his roles, education, paper and skills (`cv`, which the home page reads; the web CV page was dropped on 4 Oct 2026 and `/cv` redirects home) and his profile links. Sources and limits in ADR 0003.
- **Case study**: one piece of his work told as problem, what he built and the result, with where and when (`caseStudies` in the profile); shown on the home page. Clients are described, never named.
- **Site config**: `src/lib/site.ts`: name, tagline, description, locale and the **site URL**.
- **Site URL**: the public origin. `NEXT_PUBLIC_SITE_URL`, else Vercel's production domain, else `http://localhost:3000`.
- **Share image**: the Open Graph image generated at build time (`opengraph-image.tsx`); one for the site, one per post.
- **Feed**: the RSS 2.0 document at `/feed.xml`.
- **Colour token**: a CSS custom property in `globals.css` (`--text`, `--secondary`, `--link`, ...). Text tokens must meet WCAG AA on every background token. There is one set: the site is light only, with no dark theme and no toggle (owner decision, 4 Oct 2026).
- **Slop lint**: `npm run lint:slop` (`src/lib/slop.ts`, `scripts/lint-slop.mts`): rules for the tells of generated design and copy (em dashes, marketing words, letter-spaced caps, big radii, filler subtitles, money figures in content, default fonts, pure black and white, and more). Exemptions, each with a reason, in `design/slop-allow.json`. `--built` lints the production build's pages and CSS.
- **Controls budget**: `design/CONTROLS.json`, every link, button and focusable element each built page may have, with its job, keyed by route pattern. `lint:slop -- --built` fails a control that is not listed.
- **Guard**: `.claude/hooks/guard.py`, the PreToolUse hook that stops agents pushing, deploying, publishing or reading secrets.
- **Invaders game**: the hidden game in `src/components/invaders/Game.tsx`, played like the arcade original. Its rules live in the pure engine, `src/lib/invaders/engine.ts`.
- **Invader types**: 1 the Palindrome mark (bottom rows, 10 points), 2 the drifter marked IC (middle rows, 20), 3 the beetle marked VO (top row, 30).
- **Heartbeat**: the march interval, slowest with the full formation and fastest with one invader left (`marchInterval`).
- **Shield**: one of four eroding pixel bunkers above the ship.
- **Mystery ship**: the golden airship crossing the top; each hit unlocks the next link in rotation (the paper, GitHub, LinkedIn) without leaving the game (`src/lib/invaders/links.ts`).
- **Unlocked list**: the links won from the mystery ship, kept in `localStorage` and shown as new-tab links on the game's pause and game-over screens.
- **Alien trigger**: the small pixel-alien button (`AlienTrigger.tsx`) that starts the invaders game; the Konami code is a second way in.
