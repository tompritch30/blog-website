# Release prep plan (3 Oct 2026)

Goal: the repo is ready for Thomas to make it public and deploy it on Vercel as his personal site (later replacing tompritch30.github.io). A stranger can clone it, follow the README, and run it. Nothing is pushed or deployed by agents.

## What a new reader or user needs

- Visitor: a home page with his name, a post list, an About page, readable on a phone, usable by keyboard and screen reader, shareable links (title, description, OG image), a feed.
- Cloner: README quickstart that works on Node 22 with `npm ci && npm run dev`, a licence, a short "how it works".
- Thomas: Vercel deploy steps he runs himself; a list of placeholders to fill; a 10-minute skim list.
- Agents: CLAUDE.md, skills, guard hook, gates (the Hazel standard, scaled to a small TS site).

## Findings so far (baseline on `release-prep` at 9e9a517)

- Sole author tompritch30; no LICENSE; scaffold is create-next-app (Next 16.2.1, now 16.3.8 after 3d9d379); no third-party template.
- History sweep: no secrets; no phone, address or personal email in files. The commit author email is a personal address (git metadata).
- `npm run lint` fails (2 unescaped apostrophes in about page); `tsc --noEmit` and `npm run build` pass.
- Node: system Node is 18; Next 16 needs >= 20.9. No `engines` or `.nvmrc`.
- Bugs/gaps: `formatDate` parses `YYYY-MM-DD` as UTC midnight then formats in local time, so a US-timezone server shows the previous day; `/blog/[slug]` has `dynamicParams` on, so once drafts exist an unlisted slug would render on demand; frontmatter is not validated; `PostCard.tsx` is dead; create-next-app SVGs in `public/` are unused; `overflow-x: hidden` on html and body can break the sticky nav; muted text colour fails WCAG AA contrast (about 1.6:1 light, 2.2:1 dark); search input has no label and no focus ring; home page has no `h1`; About page states unverified facts and a placeholder GitHub URL; "Tom" placeholders everywhere.
- The uncommitted `px-1 sm:px-2` gutter is committed as-is first (lead decision). On a 375px phone `px-1` leaves 4px between text and the screen edge; plan: `px-4 sm:px-2` (16px phone gutter, his tighter value from `sm` up), held in one `Container` component.

## Order of work (one commit each, Conventional Commits)

1. **Toolchain:** `engines.node >=20.9`, `.nvmrc` = 22; add Vitest (dev) and `npm test`; `typecheck` script.
2. **Posts module (TDD, seam = `src/lib/posts.ts` public functions):** red tests first on real fixture MDX files in `src/lib/__fixtures__/posts/`:
   - published posts listed newest first; `draft: true` excluded unless `includeDrafts`;
   - `getPost` returns null for a draft (when drafts excluded) and for a missing slug;
   - invalid frontmatter (missing title, bad date) throws naming the file;
   - `formatDate("2026-03-30")` is "30 March 2026" under `TZ=America/New_York` (red first: current code gives 29 March).
   Then `dynamicParams = false` on the post route. Drafts show in `next dev` only (`includeDrafts = NODE_ENV === "development"`, decided in one place).
3. **Site config:** `src/lib/site.ts` (name "Thomas Pritchard", tagline, GitHub `tompritch30`, URL from `NEXT_PUBLIC_SITE_URL`, else Vercel's `VERCEL_PROJECT_PRODUCTION_URL`, else localhost). Replace every "Tom"/placeholder.
4. **Layout and a11y:** Tailwind theme colour tokens instead of inline `style`, AA contrast for muted text in both themes, `Container`, skip link, `h1` on home, labelled search input with visible focus ring, `aria-current` in nav, decorative icons and separators hidden, `lang="en-GB"`, `overflow-x: clip`, GitHub link same tab. Delete `PostCard.tsx` and unused SVGs.
5. **About:** content in `src/content/about.mdx` (rendered with the same MDX pipeline), placeholder bio with clearly marked gaps; no facts beyond name, "software engineer" and his public GitHub handle.
6. **SEO:** `metadataBase`, title template, canonical URLs, post `openGraph` type article; `opengraph-image.tsx` placeholder (name + tagline via `next/og`); `sitemap.ts`; `robots.ts`; RSS at `/feed.xml` (route handler, `force-static`, pure `renderRss` with a golden test). Prior art: `feed` npm package (rejected: RSS 2.0 for five fields is ~30 lines plus one escape function, tested by a golden file; one fewer dependency).
7. **Draft post:** `src/content/posts/what-prompt-caching-actually-saves.mdx`, `draft: true`. Public pricing from official docs with links and an access date, the cache-hit maths, and one worked example on synthetic numbers. Numbers computed by a script, not by hand. Nothing about any employer or client. Test: draft not in build output, sitemap or feed.
8. **Docs:** README per the rules (what, why, screenshot placeholder, quickstart, configuration table, how it works, status, licence) with Vercel steps; SETUP.md moved to `docs/deploy.md` and corrected; `CONTEXT.md` glossary; `docs/adr/0001-drafts-excluded-from-production.md`; LICENSE (see open questions).
9. **Hazel-standard agent setup:** CLAUDE.md (< 60 lines, keeps the Next 16 "read node_modules/next/dist/docs" rule), AGENTS.md = See CLAUDE.md; `.claude/skills/` (9 Pocock-derived skills with ATTRIBUTION + LICENSE, local notes rewritten); `.claude/agents/griller.md`; `.claude/settings.json` PreToolUse guard; `.claude/hooks/guard.py` + `test_guard.py` (blocks git push, `--no-verify`, remote/alias/hookspath changes, gh writes, `vercel` deploys, npm publish, credential paths, `.env` writes with values; fails closed); `lefthook.yml` (pre-commit: lint, tsc, vitest, guard test; commit-msg: conventional check); `scripts/hooks/pre-push` refusal installed by `scripts/setup-dev.sh`; `scripts/ci.sh` = same gates + build; `.claude/settings.local.json` gitignored.
10. **Review and proof:** fresh-context code review (not the builder); fix; fresh clone in /tmp, `npm ci && npm run build && npm start`, curl `/`, `/about`, `/feed.xml`, `/sitemap.xml`, and the draft slug (expect 404). RELEASE-NOTES-FOR-OWNER.md (gitignored).

## Seams under test

- `getAllPosts`, `getPost`, `formatDate` (posts module), `renderRss` (feed), `guard.py` via its stdin/exit-code contract. Pages are proven by build output and curl, not unit tests.

## Evidence

Raw output of `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build`, `python3 .claude/hooks/test_guard.py`, the red test run before each fix, the history sweep, and the fresh-clone curl.

## Open questions

1. Licence: MIT for code, and what for post text? Default: MIT for code; posts and About text "all rights reserved" unless Thomas picks CC BY 4.0. Reversible.
2. The existing post "How I actually use Claude Code day-to-day" makes first-person claims (production SaaS, Alembic migrations). Keep published, or mark draft until Thomas confirms? Default: keep (it is his commit), flag first in the skim list.
3. Home tagline wording is a placeholder; Thomas decides.
4. The commit author email in history is personal. Options for Thomas: publish as-is, or start the public repo from a fresh squashed commit under a GitHub noreply address. Not changed by agents.
5. Vitest adds a dev dependency; the alternative is Node's built-in runner, which cannot resolve the `@/` alias without a loader. Default: Vitest.
6. Should drafts be previewable in `next dev`? Default yes.
7. Does the guard need to block anything Vercel-specific beyond `vercel` CLI deploys (e.g. `vercel env pull` writes `.env.local` with real values)? Default: block `vercel env pull` too.

## Log

### 2026-10-03 grill (fresh read-only griller, one round)

Deviation noted: commit 3d9d379 (Next 16.2.1 -> 16.3.8 for a critical advisory, Vitest, lefthook, engines, .nvmrc) landed before the grill. Kept: it is a security patch; baseline build re-run green on 16.3.8.

1. Fresh-clone proof follows the README word for word, including `npm test`: accept. README quickstart = select Node 22, `npm ci`, `npm test`, `npm run build && npm start` (and `npm run dev` for writing).
2. Secret, slop and personal-data sweeps re-run after the last commit, over the full history: accept.
3. Order deviation (above): accept, recorded.
4. RELEASE-NOTES-FOR-OWNER.md lists the exact publish commands, including how the owner gets past the pre-push refusal: accept.
5. Guard, settings, pre-push and setup-dev first; guard protects its own files; ci.sh checks the push refusal: accept (guard written and tested before any src change).
6. Skill bodies pointed at Hazel files: already rewritten by the copy step (grill-plan, implement, code-review); griller.md adapted the same way: accept.
7. `formatDate` moves to `src/lib/dates.ts` (client-safe, no `fs`), formats in UTC; the re-export from posts.ts goes: accept.
8. Posts functions take optional `{ dir, includeDrafts }`; invalid fixtures in their own folder; an unquoted YAML date is rejected with the file name: accept.
9. Contrast proved by a Vitest test that reads the colour tokens from globals.css and asserts >= 4.5:1 in both themes; 375px and keyboard checks by screenshot: accept.
10. One shared base metadata object; post `openGraph` spreads it; RSS `alternates.types`; curl a built post for og:image, og:type, og:site_name and canonical: accept.
11. `scripts/prompt-cache-maths.mjs` (plain Node) produces every number in the draft post; its output goes in this log: accept.
12. Owner items stay parked with defaults (licence, tagline, existing post, author email). Lefthook installing hooks into a stranger's clone on `npm ci`: keep, say so in the README.

Plan changes: the ADR is `docs/adr/0001-drafts-only-in-dev.md`; the posts fixtures live in `src/lib/__fixtures__/`; SETUP.md became `docs/deploy.md`; `engines.node` is `22.x` (Vercel follows `engines` over its dashboard).

### 2026-10-03 build evidence

- Red before green, posts slice (8 failing of 9; the date bug was real):
  `AssertionError: expected '29 March 2026' to be '30 March 2026'` and `Tests  8 failed | 1 passed (9)`.
- Red before green, contrast: old tokens `Tests  6 failed | 16 passed (22)` (muted text 1.6:1 light, 2.2:1 dark).
- Red before green, RSS: `Error: Cannot find module './feed'` then golden test green.
- Guard: mutation check (push and Vercel rules removed) `53/62 ok, exit 1`; review cases `75/85 ok` red, then `85/85 ok`.
- Slug validation: `1 failed | 9 passed (10)` red, then green.
- `site.ts` and its test were written together, not red first.
- Maths script output (feeds every number in the draft post): break-even 21.7% / 52.6% / 20.8% / 51.3%; example A $160.00 vs $52.55 a day, 67.2% saving, ceiling 67.5%; example B $0.40 / $0.50 / $0.116; bill saving at 95% hits 16.8% / 42.1% / 67.4% / 80.0%.
- Screenshots (375px dark and light, sticky nav after scroll, skip link and search focus by keyboard, desktop About with aria-current) checked in the browser pane; the README screenshot is `docs/screenshot.jpg`.
- npm audit --omit=dev: clean after Next 16.3.8.

### 2026-10-03 fresh-context code review (separate agent, did not write the code)

Accepted and fixed: LEFTHOOK=0 / lefthook uninstall bypass and guard false positives on quoted text and `-n` (fix(agents)); `nvm use` fails without Node 22 installed, now `nvm install`; Vercel follows `engines`, now `22.x`; post files with non-slug names were listed but 404ed (fix(posts), red first); tracing comment corrected; `tr` warning in the hook command; `.env` reads via grep/cp; `I = re.IGNORECASE` inlined; `--muted` collapsed into `--secondary`; post link names shortened; Nav no longer imports server config; unused maths output removed; drafts readable on GitHub noted in README, ADR and owner notes; ADR filename in this plan.
Rejected: CLAUDE.md's "Windows host, repo inside WSL" line stays (agents on this machine need it; it is not personal data).
Parked for the owner: the OpenAI write-premium and Gemini figures in the draft post must be checked against the linked docs before publishing.
