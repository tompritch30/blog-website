# Site v2 plan (3 Oct 2026)

## Goal

"Turn Thomas Pritchard's blog into his personal site: about him, a web CV, his blog posts, a GitHub link. The reference is the shape of zkevinbai.com (pseudo-CV: who he is, key work, case studies, writing). The bar is a site with real taste that does NOT look AI-generated. Content and style matter most." Branch `site-v2` from `release-prep`; local only.

## Why

A visitor (someone who met his work, read a post or followed a link) should learn in under a minute who he is, what he has built, for whom and with what result, and be able to read how he thinks. A web CV and his writing sit one click away.

## Owner rules that bind this plan

- Truth rules (ADR 0003): facts only from his CV, his achievements record and his approved extras. Clients described, not named; CV-only names and employer money figures go on an owner-confirm list in `RELEASE-NOTES-FOR-OWNER.md` (gitignored), and stay off the site until he clears them.
- Public safety: no phone, email or other contact details beyond the GitHub and LinkedIn profiles; nothing about plans, pay or moves.
- Owner anti-slop list (3 Oct): no letter-spaced caps labels; rounded boxes only where they mean something; no buttons without a job (links are links; every control on a page listed with its job); no greyed filler under headings; all copy in Thomas's voice (read his posts, CV and stories first). Plus the brief's list: no gradient blobs, glassmorphism, emoji headings, eyebrow labels, all-caps labels, "Hi, I'm" heroes, three-card grids, generic icon rows, bento grids, testimonials, marketing words, em dashes in prose; sentence-case headings.

## Slices (in order; each fits one fresh context)

1. **Content** (agent, done in parallel with research): `src/content/profile.ts` (intro, case studies, CV data, links) and a new `src/content/about.mdx`. Lead reviews every line against the sources.
2. **Moodboard**: `design/MOODBOARD.md` (12-15 sites plus the 4 references, take/avoid per site, two candidate directions). No screenshots of other people's sites committed.
3. **Slop lint, red first** (TDD; split 3a rules on source, 3b built HTML and controls): `src/lib/slop.ts` pure rules; `scripts/lint-slop.mts` CLI; `npm run lint:slop`. Adapted from Hazel `design/lint/slop.mjs` (owner's own code; adopt, credited in the file). Scans: source (`src/**/*.{tsx,ts,mdx,css}`: Tailwind class tells and prose), and the built HTML and CSS under `.next/` when present (`--built` makes their absence an error; ci.sh runs it after build). Rules: em dash in prose; marketing words; exclamation; "Hi, I'm" openers; emoji in headings; all-caps strings of 3+ letters outside an acronym allowlist and spaced-letter caps ("B U T T O N"); `uppercase`, `tracking-wide*`, letter-spacing >= 0.05em; radius over 4px and `rounded-{md,lg,xl,2xl,3xl,full}` outside an allowlist by component with a reason; gradients and blurred blobs (`bg-gradient-*`, `radial-gradient`, `blur-2xl+`); glassmorphism (`backdrop-blur`, `backdrop-filter`); eyebrow classes and short labels directly above headings; muted short line directly under a heading with no number, date or link (filler subtitle); Title Case headings (sentence case rule, proper-noun allowlist); three or more `card` blocks or `grid-cols-3` with bordered children; bento (`row-span`/`col-span` mixes); testimonial markup; `lucide-react` (or any icon kit) imports; Hazel's colour tells (pure black/white surfaces, cream and clay defaults, purple gradients), default fonts (Inter, Roboto, etc. leading the stack), `transition: all`, overshoot easing, motion without a reduced-motion path. **Controls budget**: `design/CONTROLS.json` lists each route's interactive elements and the job of each; the lint counts `a[href]`, `button`, `input`, `select`, `textarea`, `[tabindex="0"]` per built page and fails on any unlisted control, any `<a>` without `href`, any `role="button"` on a link, and any button whose budget entry has no job. Planted pages in `src/lib/__fixtures__/slop/` (one per rule family) must each fail; a clean fixture passes; the real site passes.
4. **Routes skeleton** (no styling decisions): `/` home, `/cv`, `/writing` (list), `/writing/[slug]` (posts move from `/blog/<slug>`; permanent redirects from `/blog` and `/blog/:slug` in `next.config.ts`), `/about`, `not-found.tsx`. Sitemap, feed and OG updated to `/writing`. Glossary updated. Posts module unchanged apart from URLs. Remove `lucide-react` and the search box if the slop/controls rules reject them (search over two posts is a control without a job).
5. **Two directions, judged blind**: two opus55-high builders, each in its own git worktree under a `mktemp -d` dir, branch `site-v2-dir-a` / `site-v2-dir-b` from slice 4's commit. Each builds the home page plus nav and footer and its own tokens (colour light and dark, type scale, spacing, motion) from one moodboard direction, with the same content. Each passes lint, tsc, tests, lint:slop and build. Shots: home at 375 and 1440, light and dark, viewport and full page. A fresh read-only opus55-high judge gets the shots labelled X and Y only, plus the owner anti-slop list and the brief's rules, and scores both (criteria below). Winner merges into `site-v2`; the loser's branch stays unmerged and its tip hash is logged.
6. **Design system**: `design/SYSTEM.md` (owner rules on top, then the winner's tokens and why), tokens in `src/app/globals.css` (`@theme`), `design/MANIFEST.yaml` (fonts with source and licence, every original asset including the easter-egg sprites).
7. **Build out** in the winning direction: `/cv` (web CV from `profile.ts`, print stylesheet: no nav, footer, links printed as text, black on white, A4 and Letter safe), `/writing`, post pages, `/about`, 404, OG image and icon restyled.
8. **Easter egg** (parallel with 7, own worktree, merged after; prior art first, ADR 0004): hidden Space Invaders-style game. Pure engine `src/lib/invaders/engine.ts` (TDD: collision, invader march and edge reverse, wave advance and speed-up, bullets, score, game over); canvas renderer `src/components/invaders/Game.tsx` loaded with dynamic `import()` only on trigger. Trigger: a tiny original pixel alien a curious visitor can find (footer and the 404 page), a real button with a hover and focus hint whose job is "start the game", listed in CONTROLS.json; the Konami code as a bonus. Prior art searched first (ADR 0004). Page headings and post titles on the current page become the invaders (their text and boxes captured from the DOM, page dimmed beneath); a ship fires upward. Keyboard (arrows or A/D, space) and touch (drag to move, tap to fire). Escape or a close button restores the page and focus. `prefers-reduced-motion`: no animation; show a still frame of the scene with a "Play anyway" button. No sound. High score in `localStorage` inside try/catch. All art original (pixel grids in code), recorded in MANIFEST.yaml.
9. **Proof**: axe (WCAG AA incl. colour-contrast) on every page in both themes via `playwright-core` + `axe-core` devDependencies driving the cached Chromium (no browser download; path override by env); screenshots of every page at 375 and 1440, light and dark, into `design/shots/` (palette-reduced, each under 300KB); fresh clone of `site-v2` into a `mktemp -d` dir: `npm ci && npm test && npm run build && npm start` then curl every route; `npm run dev` on 3005.
10. **Review**: fresh opus55-high reviewer (did not write the code) on `git diff release-prep...site-v2`; fixes; gates; release notes.

## Seams under test

- `lintText`, `lintClasses`, `lintCss`, `lintHtml` (or one `lintFile`) in `src/lib/slop.ts`, driven by planted fixtures; the CLI's exit code on the planted folder.
- Invaders engine: `createGame`, `step(state, input, dt)`, `collides(a, b)`; worked examples for expected values.
- Existing seams keep their tests (`getAllPosts`, `getPost`, `formatDate`, `renderRss`, `siteUrl`); feed URL golden updated to `/writing/`.
- Pages: build output, curl, axe and screenshots, not unit tests.

## Judge criteria (1 to 10 each, blind X vs Y)

First impression for a visitor who works in the field; reads as made by a person (not generated defaults); typography (scale, measure, rhythm); restraint and hierarchy; content legibility (can a stranger say what he built, for whom, with what result in 30 seconds); phone layout; dark theme quality; and one pass/fail line per owner anti-slop item (letter-spaced caps, pill boxes, controls without a job, grey filler under headings, voice) and per brief slop item.

## Evidence

Raw output of: `scripts/ci.sh` (lint, tsc, tests, guard tests, build) plus `npm run lint:slop -- --built`; red runs before each green; the planted-failure run; axe JSON summary per page and theme; the screenshot list with sizes; fresh-clone build and curl output; `curl -sI localhost:3005`; judge verdict verbatim in `design/evidence/judge/`.

## Open questions

1. Post URLs move to `/writing/<slug>` with redirects. The site is not public yet, so nothing external links to `/blog/*`. Default: move.
2. The existing post has em dashes; the brief bans them in prose and the last review left them as "his own prose". Default: replace each with a comma, colon or full stop (punctuation only), list it for the owner.
3. Fonts via `next/font/google` (downloaded at build, self-hosted) versus vendored Fontsource woff2 with a SHA256SUMS file like Hazel. Default: `next/font/google` (already used, builds offline-cached on Vercel), record names and licences in MANIFEST.yaml.
4. axe and screenshots need a browser. `playwright-core` + `axe-core` as devDependencies, using the cached Chromium, adds about 10MB to `npm ci` for cloners. Alternative: a uv-run Python script like Hazel. Default: playwright-core (one toolchain).
5. The draft caching post stays a draft. Does a case study link to it? Default: no link until published.
6. Is the controls budget too strict for the post body (MDX links)? Default: links inside article prose are counted as one class ("prose links") per page, not listed one by one.
7. Should `/cv` offer a print button? A button that calls `window.print()` has a job; browsers already print. Default: no button; a print stylesheet only.

## Log

### 2026-10-03 grill (fresh read-only opus55-high griller, one round)

1. Blocker, employer money and live-deal facts in content: accept. Default content carries no employer money figures and no live deal; client sizes stay described. Each CV figure and CV-only name is offered to the owner in the gitignored release notes. The slop lint gains a money rule: `£` or `$` followed by a digit in `src/content` fails unless the exact string is in `design/slop-allow.json` with a reason.
2. Blocker, plan wording public: accept. Why and the safety bullet reworded; plan, Log, ADRs and commit messages stay about visitors, never about a search.
3. Blocker, ADR 0002 item 2 limits facts: accept. ADR 0003 supersedes it (sources: CV v27, achievements record, approved extras); CLAUDE.md guardrail 4 updated.
4. Next's own output trips text rules: accept. Text rules run on visible text only (strip script, style, template, noscript, `[hidden]`, pre, code, comments; MDX code and frontmatter keys); vendored CSS selectors (`.prose` plugin, `:where(` preflight, `::backdrop`) ignored; own `global-error.tsx`; lint sources, tests and fixtures excluded from the real-site run; a regression fixture from today's post page.
5. Heuristics hit real content: accept. Filler-subtitle rule on h2 and h3 only (and h1 lines with no number, date or link stay allowed only via allowlist); exemptions in `design/slop-allow.json` with reasons; Title Case rule skips `cite`.
6. "Real site passes" impossible at slice 3: accept. 3a ports rules on source and records the current hits as a baseline; source-only lint:slop joins ci.sh after slice 4; `--built` joins after slice 6.
7. Controls budget gaps: accept. Entries keyed by route pattern (`srcRoute`), `{kind, name or href, count, job}`, classes "prose links" and "scroll regions"; re-checked in Playwright on the rendered DOM at 375 and 1440 and after the game opens.
8. Worktrees in /tmp: accept. `npm ci --prefer-offline` per worktree; network for next/font checked first, else Fontsource with next/font/local; ports 3101 and 3102; check-push-refusal re-run; X and Y assigned by coin flip, mapping recorded after the verdict, filenames stripped.
9. Print: accept as slice 7a. Print block overrides the colour tokens and is exempt from the pure black/white rule; absolute URLs printed; Playwright print emulation in dark mode, PDFs at A4 and Letter, at most 2 pages, no nav or footer text.
10. Game proof: accept, with the owner's later trigger change (below). Pure `createTrigger` seam (Konami; text fields ignored); Playwright: no game chunk before the trigger, canvas after, Escape restores focus, reduced motion shows the still frame; axe with wcag22aa for target size.
11. Proof gaps: accept. curl `/blog/<slug>` 308 to `/writing/<slug>`, `/blog` to `/writing`, draft slug 404, no `/blog/` in feed or sitemap; directions keep the token names contrast.test.ts reads, or change the test in the same commit; screenshots shrunk with `sharp` (already a Next dependency) or uv Pillow, the builder says which.
12. Owner, reversible: (a) the blind judge picks, the owner can overrule from the shots; (b) em dashes in the existing post become commas, colons or full stops, and "biggest unlock" becomes plain wording; both listed for the owner.

Owner course corrections the same day (via the lead): the easter egg's main trigger is a small pixel alien a curious visitor can find and click (hover and focus hint), Konami is a bonus, typed "invade" is dropped; before writing the engine, search for MIT, CC0 or BSD Space Invaders-style JS or TS implementations, adopt one if clean (vendored with licence, original art) or reject each in one line, and record the decision in an ADR. Owner anti-slop list added to the lint and to SYSTEM.md; the judge scores against it. All helper agents run on Opus 5.5.

### 2026-10-03 easter egg build evidence (slice 8, worktree branch `site-v2-egg`)

Prior art: seven Space Invaders repos read (six MIT, one with no licence); none adopted, own engine written (ADR 0004). Assets recorded in `design/MANIFEST.yaml`.

Red, with stub modules exporting the seams (`npx vitest run src/lib/invaders`), 27 of 35 failing:

```
   × createTrigger (Konami code) > starts once on the full sequence
   × createTrigger (Konami code) > still starts when the visitor presses up one time too many first
   × createTrigger (Konami code) > does not let typing in a field break a sequence typed on the page
   × collides (axis-aligned boxes; edges that only touch do not count) > is true with a one pixel overlap
   × the invader march > drops and reverses instead of crossing the right edge
   × the invader march > drops and reverses at the left edge, moving the whole formation together
   × bullets > leave the ship's centre top, then move up at bullet speed
   × bullets > expire once fully above the field
   × hits and score > a hit removes the invader and the bullet and scores 10, even when the bullet moves further than the invader is tall
   × hits and score > keeps the best score: a higher stored best stays, a new best replaces it
   × waves > clearing a wave starts the next one with the same invaders, a faster march and no bullets
   × waves > each wave marches 1.25 times faster than the last
   × game over > ends when an invader reaches the ship's row
   × bombs > a bomb on the ship costs a life and clears the bombs; the last life ends the game
   × buildFormation > packs headings into rows from the top left when their page boxes do not fit
   (12 more)
⎯⎯⎯⎯⎯⎯ Failed Tests 27 ⎯⎯⎯⎯⎯⎯⎯
```

The 8 that passed against the stubs are the "nothing happens" cases (touching edges, broken sequence, keys in fields, modifier keys, finished game unchanged, kept formation); they gained meaning once the positive cases went green.

Green:

```
 ✓ src/lib/invaders/trigger.test.ts (9 tests) 16ms
 ✓ src/lib/invaders/engine.test.ts (26 tests) 36ms
 Test Files  2 passed (2)
      Tests  35 passed (35)
```

Decisions: touching edges do not collide; shots use a swept box, so a fast bullet cannot skip a thin heading; a new shot appears where it is fired and moves from the next step; bombs come from a seeded xorshift pick, so a seeded game replays exactly; three lives; the formation keeps the page positions of headings only when two or more sit in the top 55% of the screen with room to march, otherwise it packs them in rows. `design/CONTROLS.json` does not exist on this base yet: when slice 3 lands, the lead lists the alien button (job: start the game) and the game dialog's buttons (close, play again, play anyway).
