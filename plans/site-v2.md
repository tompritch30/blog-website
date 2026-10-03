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

### 2026-10-03 build evidence: slice 3a (slop rules on source)

Prior art: Hazel `design/lint/slop.mjs` adopted (colour maths, filler list, text and CSS declaration rules; credited in `src/lib/slop.ts`). Rule sources: hallmark `slop-test.md` and `anti-patterns.md`. TS and TSX are parsed with the TypeScript compiler API (already a dev dependency) rather than regexes. Rejected: htmlparser2 or parse5 as a new dependency for the HTML part (Hazel stays dependency-free, and the pages are React's well-formed output). The CLI is `scripts/lint-slop.mts`, run by Node 22 type stripping (checked first: an `.mts` file importing a `.ts` module runs on v22.23.3 without flags or warnings), so `tsconfig.json` gains `allowImportingTsExtensions`; planted fixtures are excluded from tsc and eslint. Dropped from Hazel's list: "harness" (a test harness is a real thing) and the mono-labels rule (code needs a mono face).

Red, `npx vitest run src/lib/slop.test.ts` against a stub that returns no hits:

```
   × planted fixtures > em-dash.mdx fails with em-dash 84ms
   × planted fixtures > marketing.mdx fails with marketing 25ms
   × planted fixtures > heading.mdx fails with title-case, emoji-heading 4ms
   × planted fixtures > exclamation.tsx fails with exclamation 1ms
   × planted fixtures > hi-im.tsx fails with hi-im 1ms
   × planted fixtures > caps.tsx fails with uppercase, letter-spacing, all-caps, spaced-caps 18ms
   × planted fixtures > caps.css fails with uppercase, letter-spacing 1ms
   × planted fixtures > radius.tsx fails with radius 1ms
   × planted fixtures > radius.css fails with radius 2ms
   × planted fixtures > filler-subtitle.tsx fails with filler-subtitle 15ms
   × planted fixtures > eyebrow.tsx fails with eyebrow 2ms
   × planted fixtures > content/money.ts fails with money 2ms
   × planted fixtures > gradient.tsx fails with gradient, blur-blob, glass 3ms
   × planted fixtures > gradient.css fails with gradient, purple-gradient, blur-blob, glass 1ms
   × planted fixtures > cards.tsx fails with three-card-grid, card-grid, bento, testimonial 5ms
   × planted fixtures > icon-kit.tsx fails with icon-kit 1ms
   × planted fixtures > colour.css fails with pure-bw, cream-default, clay-default 1ms
   × planted fixtures > font.css fails with default-font 1ms
   × planted fixtures > font.tsx fails with default-font 1ms
   × planted fixtures > motion.css fails with motion-no-reduce, transition-all, overshoot 1ms
   × planted fixtures > motion.tsx fails with transition-all, hover-scale, motion-no-reduce 1ms
   ✓ planted fixtures > clean/Clean.tsx passes 1ms
   ✓ planted fixtures > clean/clean.mdx passes 0ms
   ✓ planted fixtures > clean/clean.css passes 0ms
   × planted fixtures > reports file, line, rule, message and excerpt 5ms
   × lintText > counts lines from the given start line 1ms
   ✓ lintText > leaves en dashes, acronyms on the list and plain words alone 0ms
   × lintText > flags capitals outside the acronym list but not short ones or plurals 1ms
   × lintText > catches a Hi or Hello opener after a sentence too 6ms
   × lintText > only applies the money rule to content 1ms
   × lintClasses > reads Tailwind variants and arbitrary values 1ms
   ✓ lintClasses > allows small radii, tight tracking and plain colours 0ms
   × lintClasses > allows a radius only in the component its allowlist entry names 1ms
   ✓ lintCss > exempts print styles from the pure black and white rule 0ms
   × lintCss > follows var() to the token it names 1ms
   × lint-slop CLI > fails on the planted folder and names every planted rule 124ms
   × lint-slop CLI > passes on the clean folder 105ms
⎯⎯⎯⎯⎯⎯ Failed Tests 31 ⎯⎯⎯⎯⎯⎯⎯
      Tests  31 failed | 6 passed (37)
```

Green after implementing: `Tests  41 passed (41)` (37 at that point).

The first baseline run on the real source showed three false-positive classes; each became a worked-example test first. Red:

```
   × lintText > reads capitals followed by a file extension as a file name, not shouting 37ms
   × titleCaseWords > lets month names, single-letter labels and words after a colon keep their capitals 2ms
   × lintCss > tells the warm cream default from a neutral off-white 3ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected [ { file: 'f.mdx', line: 1, …(3) } ] to deeply equal []
AssertionError: expected [ 'October' ] to deeply equal []
AssertionError: expected [ [ 'cream-default', 2 ], …(1) ] to deeply equal [ [ 'cream-default', 3 ] ]
      Tests  3 failed | 38 passed (41)
```

Fixes: capitals followed by a file extension are file names (`CLAUDE.md`); single-letter labels and month and day names keep their capitals in sentence case; cream needs a warm tint (red above blue), so the neutral `#f4f4f2` passes. `design/slop-allow.json` gains `YYYY` (the date format in a posts.ts error message) and two money entries: the draft caching post's public list prices and synthetic examples, and `£2bn+` in `src/content/profile.ts` (client assets, not employer money; listed for the owner to confirm). Then green: `Tests  41 passed (41)`.

Baseline on the real source after those fixes (`npm run lint:slop`, exit 1), all true positives that slice 4 removes:

```
src/app/blog/[slug]/page.tsx:4 icon-kit icon kit import "lucide-react" | import { ArrowLeft } from "lucide-react";
src/app/globals.css:11 pure-bw pure white | --surface: #ffffff
src/app/globals.css:29 default-font default face "inter" leads the stack | --font-sans: var(--font-inter)
src/app/globals.css:48 default-font default face "inter" leads the stack | font-family: var(--font-inter), system-ui, sans-serif
src/app/icon.tsx:21 radius radius over 4px outside the radius allowlist | border-radius: 6px
src/app/layout.tsx:2 default-font default face "inter" from next/font | import { Geist_Mono, Inter } from "next/font/google";
src/components/PostList.tsx:5 icon-kit icon kit import "lucide-react" | import { Search } from "lucide-react";
src/content/posts/claude-code-workflow.mdx:8 em-dash em dash in prose; use a comma, colon or full stop | I've been using Claude Code as my primary development tool for a few months now. This isn'
src/content/posts/claude-code-workflow.mdx:12 em-dash em dash in prose; use a comma, colon or full stop | The thing that makes Claude Code different from a chat interface is that it has *agency* o
src/content/posts/claude-code-workflow.mdx:26 em-dash em dash in prose; use a comma, colon or full stop | **Boilerplate and scaffolding.** New API endpoints, new database migrations, new React com
src/content/posts/claude-code-workflow.mdx:28 em-dash em dash in prose; use a comma, colon or full stop | **Cross-file refactors.** Renaming a function that's called in 40 places, changing a type
src/content/posts/claude-code-workflow.mdx:42 em-dash em dash in prose; use a comma, colon or full stop | The biggest unlock was writing a file at the root of the project. This is a file Claude Co
src/content/posts/claude-code-workflow.mdx:42 marketing marketing word "unlock" | The biggest unlock was writing a file at the root of the project. This is a file Claude Co
src/content/posts/claude-code-workflow.mdx:53 em-dash em dash in prose; use a comma, colon or full stop | Claude Code has made me faster at the parts of software development that are more mechanic
FAIL  src/app/blog/[slug]/page.tsx  1 hit
FAIL  src/app/globals.css  3 hits
FAIL  src/app/icon.tsx  1 hit
FAIL  src/app/layout.tsx  1 hit
FAIL  src/components/PostList.tsx  1 hit
FAIL  src/content/posts/claude-code-workflow.mdx  7 hits
slop: 14 hits in 6 of 38 files
```

### 2026-10-03 build evidence: slice 3b (built HTML and the controls budget)

`--built [dir]` (default `.next`) lints every prerendered page under `server/app` and every CSS file under `static`. Page text rules see visible text only (head, script, style, template, noscript, `[hidden]`, pre, code, svg and comments stripped, grill item 4); built CSS skips the vendored selectors (`.prose`, `:where(`, `::backdrop`). No build output exits 2. The controls budget (`design/CONTROLS.json`, keyed by the prerender manifest's `srcRoute`, shared `layout` entries plus per-route entries `{kind, href or name, count, job}`, classes "prose links" and "scroll regions") counts `a[href]`, button, input, select, textarea, summary, iframe, `role=button` and `tabindex=0`, and fails unlisted controls (`control-unlisted`), `<a>` without href (`a-no-href`), `role=button` on a link (`role-button-link`) and entries without a job (`control-no-job`). Planted pages for each failure in `src/lib/__fixtures__/slop/built-planted/`, a passing build in `built-clean/`. `src/lib/__fixtures__/slop/built-regression/claude-code-workflow.html` is the post page from the build of 3 Oct 2026 (before the slice 4 edits): its only hits must be the six text runs with em dashes, the one "unlock" and the lucide arrow, with nothing from code, scripts or the hidden div. `src/app/global-error.tsx` replaces Next's default (Roboto on pure white).

Red, the new tests against the 3a code:

```
   × lintHtml (built pages) > lints visible text only: not head, scripts, hidden, pre, code, template, noscript or comments 37ms
   × lintHtml (built pages) > finds eyebrows, filler subtitles, class, icon and inline-style tells in markup 64ms
   × lintHtml (built pages) > finds only the real tells on the post page as built on 3 Oct 2026 13ms
   × controls budget > counts links, buttons, inputs and focusable regions, marking links inside prose 2ms
   × controls budget > fails each control the route's budget does not list 13ms
   × controls budget > passes when every control is listed, prose links and scroll regions as classes 5ms
   × controls budget > fails a second control beyond an entry's count, and every control on an unbudgeted route 10ms
   × controls budget > fails an <a> without href, a link with role=button, and an entry without a job 4ms
   × lint-slop CLI > --built fails each planted control page and the planted CSS 4856ms
   × lint-slop CLI > --built passes a clean build, vendored CSS selectors included 3100ms
   × lint-slop CLI > --built with no build output exits 2 and says so 2387ms
⎯⎯⎯⎯⎯⎯ Failed Tests 11 ⎯⎯⎯⎯⎯⎯⎯
      Tests  11 failed | 42 passed (53)
```

Two of the red runs taught the code something: a short muted line between two headings was flagged both as the first heading's filler subtitle and as an eyebrow for the second (it now counts as the first heading's subtitle only), and a control inside `<pre>` lost its name because control names used the visible-text walk (they now use all text). Green: `Tests  53 passed (53)`.

### 2026-10-03 build evidence: slice 4 (routes skeleton) and CI wiring

Feed golden test moved to `/writing/` first. Red:

```
   × renderRss > renders an RSS 2.0 channel with one item per post, escaping XML 27ms
   ✓ renderRss > renders an empty channel when there are no posts 2ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
      Tests  1 failed | 1 passed (2)
- <link>https://casey.example/writing/tea-vs-coffee</link>
+ <link>https://casey.example/blog/tea-vs-coffee</link>
- <guid isPermaLink="true">https://casey.example/writing/tea-vs-coffee</guid>
+ <guid isPermaLink="true">https://casey.example/blog/tea-vs-coffee</guid>
```

Green after `feed.ts` used `postPath` (`src/lib/paths.ts`): 2 passed. Routes: `/writing` and `/writing/[slug]` (moved with `git mv`, `dynamicParams = false` kept), permanent redirects `/blog` and `/blog/:slug` in `next.config.ts`, `/` and `/cv` from `src/content/profile.ts` (headings, paragraphs, lists and description lists; no table, nothing there is tabular), `/about` unchanged, `not-found.tsx`. lucide-react and the post search box removed, Inter replaced by a system stack (Geist Mono kept for code), `--surface` `#ffffff` to `#fdfdfb` under the same name (contrast test green), favicon radius 6px to 4px.

Post edits in `src/content/posts/claude-code-workflow.mdx` (grill item 12b; punctuation only, plus the one wording change), for the owner:

- "This isn't a getting-started guide — there are plenty of those." -> "This isn't a getting-started guide. There are plenty of those."
- "code back and forth — you describe what you want" -> "code back and forth: you describe what you want"
- "follow your established patterns — these take 20% of the thought" -> "follow your established patterns. These take 20% of the thought"
- "moving a module — the kind of work" -> "moving a module: the kind of work"
- "The biggest unlock was writing a "CLAUDE.md" file" -> "What helped most was writing a "CLAUDE.md" file"
- "at the start of every session — your permanent context." -> "at the start of every session: your permanent context."
- "more mechanical than creative — scaffolding, refactors" -> "more mechanical than creative: scaffolding, refactors"
- "real design thinking — what to build, how to structure a system, what the right trade-off is — those are still on me." -> "real design thinking: what to build, how to structure a system, what the right trade-off is. Those are still on me."

First `--built` run on the real build found two problems that were not the site's, both now fixed with a test first:

1. Next 16.3.8 always prerenders its own static 500 page as `_global-error.html` (`next/dist/client/components/builtin/app-error.js`, wired in `next/dist/build/route-discovery.js`): Roboto and Helvetica in the stack, `#fff`, a 6px button. `src/app/global-error.tsx` handles runtime errors but cannot replace that page, so the premise in the brief does not hold. The CLI skips that file only while it carries Next's `id="__next_error__"` marker and prints a `skip` line. Red:

```
   ✓ lintHtml (built pages) > lints visible text only: not head, scripts, hidden, pre, code, template, noscript or comments 43ms
   ✓ lintHtml (built pages) > finds eyebrows, filler subtitles, class, icon and inline-style tells in markup 7ms
   ✓ lintHtml (built pages) > passes a clean page whose slop sits only in head, scripts, hidden and code 2ms
   ✓ lintHtml (built pages) > finds only the real tells on the post page as built on 3 Oct 2026 46ms
   ✓ lint-slop CLI > --built fails each planted control page and the planted CSS  4101ms
   × lint-slop CLI > --built passes a clean build, vendored CSS selectors included 6253ms
   × lint-slop CLI > --built skips Next's own static 500 page, which global-error.tsx cannot replace, and says so 2031ms
   ✓ lint-slop CLI > --built with no build output exits 2 and says so  5263ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 2 ⎯⎯⎯⎯⎯⎯⎯
      Tests  2 failed | 6 passed | 46 skipped (54)
```

2. Tailwind v4 scans every file, so the planted fixtures and the rule source (which name every banned class) put gradients, backdrop blur, `uppercase` and `rounded-xl` utilities into the built CSS. `globals.css` now uses `@import "tailwindcss" source("..")` (src only) with `@source not` for `slop.ts`, `slop.test.ts` and `__fixtures__/slop`.

`design/CONTROLS.json` lists every control per route with its job. The real build then passes `--built` (0 hits), so `npm run lint:slop -- --built` joins `scripts/ci.sh` after the build now (earlier than the grill's slice 6), and the source lint joins ci.sh and the lefthook pre-commit. `scripts/ci.sh`:

```
== node v22.23.3
== git hooks: pre-push refuses
== lint
== slop lint (source)
slop: 0 hits in 0 of 42 files
== typecheck
== unit tests
      Tests  84 passed (84)
== guard hook tests
== build
== slop lint (built pages, CSS and controls budget)
skip  .next/server/app/_global-error.html  Next's built-in static 500 page (not replaceable by src/app/global-error.tsx)
pass  .next/server/app/_not-found.html
pass  .next/server/app/about.html
pass  .next/server/app/cv.html
pass  .next/server/app/index.html
pass  .next/server/app/writing/claude-code-workflow.html
pass  .next/server/app/writing.html
pass  .next/static/chunks/2zw4dkmxvpkx8.css
slop: 0 hits in 0 of 7 files
ci: all gates green
```

### 2026-10-03 build evidence: slice 9 tooling (check-pages)

Prior art, one line each:

- `playwright-core` 1.62.1, pinned: adopt. Its Chromium build (revision 1234, headless shell) is already in `~/.cache/ms-playwright` (another local project uses the same version), so nothing is downloaded; 1.53 (revision 1179) was also cached but is older.
- `axe-core` 4.13.0: adopt, injected with `page.addScriptTag`. `@axe-core/playwright` rejected: a third package for the ten lines that inject and run axe.
- `sharp` (already installed with Next 16): adopt for palette-reduced PNGs. uv-run Pillow rejected: a second toolchain.
- Pa11y and Lighthouse CI: rejected, each brings its own browser download.
- PDF page count: pdf-lib and pdf.js rejected; Chromium writes one `/Type /Page` object per page, counted in `pdfPageCount` (checked against the real CV PDF: `/Count 3`, three page objects).

`src/lib/check-pages.ts` holds the parts that need no browser (route list and patterns, screenshot names, which axe violations block, WCAG contrast and dark-on-light, PDF page count, choosing a cached Chromium); `scripts/check-pages.mts` drives the browser and reuses `findControls`, `entriesFor` and `lintControls` from `src/lib/slop.ts`, so the rendered check and `lint:slop -- --built` count controls the same way. Browser: `CHECK_PAGES_CHROMIUM`, else playwright-core's own cached build, else the newest cached headless shell or Chromium (tried with `PLAYWRIGHT_BROWSERS_PATH` pointing at only revision 1179: it launched Chromium 138.0.7204.23 from there).

Red, `npx vitest run src/lib/check-pages.test.ts` against stubs:

```
   × pageRoutes > lists every page with the route pattern CONTROLS.json keys it by and a screenshot name 129ms
   × shotFile > names a screenshot <route>-<width>-<theme>.png 7ms
   × blocking > keeps serious and critical violations and every colour-contrast one, whatever its impact 3ms
   × colour checks > reads rgb() and rgba() as Chromium serialises computed colours 14ms
   × colour checks > knows the contrast of black on white and of the light theme's grey on white 4ms
   × colour checks > calls text dark on light only when it is darker than the paper and meets 4.5:1 3ms
   × pdfPageCount > counts page objects, not the page tree 29ms
   × pickChromium > prefers the newest cached headless shell 2ms
   × pickChromium > falls back to an older shell's layout, then to full Chromium, when newer folders are incomplete 40ms
   ✓ pickChromium > returns null when nothing usable is cached 9ms
```

Green: all 10 pass. The first real run counted the visually hidden skip link as printed text (its padding widens the sr-only box past 1px); the print check now treats `clip-path: inset(50%)` and a zero `clip` rect as hidden.

Run against the skeleton (`npm run build && npm start -p 3119`, then `npm run shots -- http://localhost:3119 --out <mktemp -d>`; screenshots not committed), exit 1:

```
check-pages: http://localhost:3119 with Chromium 151.0.7922.34 from playwright-core's own build in the cache
controls: pass on all 6 routes at 375 and at 1440 (/, /cv, /writing, /writing/claude-code-workflow, /about, /check-pages-missing-page as /_not-found)
axe: 0 violations, 0 blocking on all 6 routes x 375, 1440 x light, dark (24 runs)
FAIL  print /cv A4: 3 pages (41 KB)
FAIL  print /cv Letter: 3 pages (41 KB)
FAIL  print /cv: nav or footer printed: <nav> "Thomas Pritchard Writing CV About GitHub"; <footer> "© 2026 Thomas Pritchard RSS feed"
FAIL  print /cv: 2 text colours on white paper, 2 not dark on light: rgb(240, 240, 238) ("Thomas Pritchard"); rgb(138, 138, 136) ("Writing")
shots: 24 files, 7 KB (writing-375-light) to 152 KB (writing-claude-code-workflow-1440-dark), all at 256 colours, none over 300KB
check-pages: 6 pages x 2 widths x 2 themes, 4 problems
```

The print failures are the skeleton's: it has no print stylesheet yet (slice 7a). The check runs in about two minutes with screenshots.
