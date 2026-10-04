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

### 2026-10-03 build evidence: MDX components for posts (Figure, Chart, Quote, code and tables)

Prior art, one line each:

- Chart library (Recharts, Chart.js, d3-scale): rejected; a client bundle or five d3 packages for one static line chart. The tick step follows d3-array's `tickIncrement` (ISC, after Heckbert's nice numbers), re-implemented in `src/lib/chart.ts` and credited there.
- Chart text: an SVG stretched over its box (`preserveAspectRatio="none"`, `vector-effect: non-scaling-stroke`) with HTML labels placed by percentage, so labels stay the page's size and face at 375 and 1440 instead of shrinking with a viewBox.
- `react-tweet`: rejected; it fetches from X's syndication API and shows avatars. `Quote` is a static blockquote.
- Tailwind `sr-only`: adopt for the chart's data table and the new-tab notice.
- `next/image` (read `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md`): `Figure` uses it for images, with `sizes` set to the article width.
- next-mdx-remote 6 strips JS expressions by default (`blockJS: true`), which would drop a chart's `x={[...]}` data. Posts are files in this repo, so `Mdx.tsx` sets `blockJS: false` and keeps `blockDangerousJS` on.

Red, `npx vitest run src/lib/chart.test.ts src/components/mdx` against stubs:

```
   × niceTicks > picks a step of 50 for 0 to 200 in about 5 ticks (raw step 40, 4 >= sqrt(10) rounds to 5) 75ms
   × niceTicks > widens 0 to 0.95 out to 1 with a step of 0.2 and no floating point dust 16ms
   × niceTicks > extends both ends to whole steps when the data crosses zero 22ms
   × niceTicks > uses a step of 10 for 0 to 100 in 10 ticks 14ms
   × niceTicks > gives a flat series a unit span above its value instead of dividing by zero 16ms
   × niceTicks > accepts the ends in either order 8ms
   × linear > maps a domain onto a range 8ms
   × linear > inverts for a y axis drawn from the bottom up 1ms
   × linear > puts every value in the middle of the range when the domain is a single point 2ms
   × bands > splits a range into equal bands and gives each centre 2ms
   × bands > handles an offset range 9ms
   × formatTick > shows as many decimals as the step needs, the same on every tick of an axis 3ms
   × formatTick > groups thousands and drops decimals for whole steps 6ms
   × formatTick > writes minus as a minus sign and never prints -0 1ms
   × linePath > draws an SVG path through the points, rounded to two decimals 1ms
   × linePath > is empty for no points 2ms
   × Chart > is one image to assistive tech, named by its title and described by its description 25ms
   × Chart > carries the numbers in a visually hidden table outside the image 9ms
   × Chart > draws one line per series and a reference line, coloured only through CSS custom properties 1ms
   × Chart > labels the axes and the ticks 10ms
   × Chart > draws a bar per value in a bar chart, starting from zero 12ms
   × Quote > quotes the post as a plain blockquote that cites the original 4ms
   × Quote > links to the original in a new tab, safely, and says so to screen readers 10ms
   ✓ Quote > loads nothing from X: no script, image or frame 1ms
   × Figure > wraps its content with a caption and a linked credit line 59ms
   ✓ Figure > leaves the credit line out when there is none 2ms
   × Pre > makes a code block a keyboard-scrollable region that keeps its classes and code 7ms
```

Green: 16 chart and 11 component tests pass (`vitest.config.mts` gives tests the `@/` alias). `npm run shots` against `next dev` (drafts shown) then found two real faults on the draft post, axe `scrollable-region-focusable` (serious): the post's price table scrolls at 375 with no keyboard access, and the chart's hidden data table became a scroll region because `.prose table { overflow-x: auto }` in globals.css beats `sr-only`. A `Table` test went red first:

```
   × Table > makes a Markdown table a keyboard-scrollable region, since wide tables scroll inside the article on a phone 5ms
AssertionError: expected undefined to be '0' // Object.is equality
      Tests  1 failed | 11 passed (12)
```

Then `Table` (tabindex 0, a "scroll regions" control in CONTROLS.json like `Pre`) and `overflow-hidden!` on the chart's table. Rerun on the draft post: axe 0 violations at 375 and 1440 in both themes, controls pass, page width equals the viewport at 375 and 1440, screenshots 188 to 245 KB.

The draft caching post gains one chart, plotted from `node scripts/prompt-cache-maths.mjs` (new last section):

```
## Prefix cost against hit rate, as a share of the price without caching (read 0.1x; the post's chart)
hit rate | 5-minute entry (write 1.25x) | 1-hour entry (write 2x)
0.0% | 125.0% | 200.0%
10.0% | 113.5% | 181.0%
20.0% | 102.0% | 162.0%
30.0% | 90.5% | 143.0%
40.0% | 79.0% | 124.0%
50.0% | 67.5% | 105.0%
60.0% | 56.0% | 86.0%
70.0% | 44.5% | 67.0%
80.0% | 33.0% | 48.0%
90.0% | 21.5% | 29.0%
100.0% | 10.0% | 10.0%
```

No bar chart: Example B's three numbers already read clearly as a table. The post stays `draft: true`.

No `Quote` added. The relevant post found is Anthropic's launch of prompt caching on X (https://x.com/AnthropicAI/status/1823751314444021899, 14 August 2024), verified word for word from X's public logged-out syndication endpoint (`cdn.syndication.twimg.com/tweet-result`). Its text has an emoji and an em dash ("more instructive prompts—all while reducing costs by up to 90%"), which the slop lint fails as prose; quoting it means either a lint exemption for quoted words or changing them, and changing a quote is not allowed. Left for the owner: allow verbatim third-party text inside `Quote` (a lint change with a test), then add it next to the post's opening line.

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

Sprites (`src/components/invaders/sprites.test.ts`), red against empty stubs then green:

```
   × pixel grids > are rectangular and use only # and .
   × pixel grids > the alien looks aside on hover: only the eye row changes
   × pixel grids > cells lists each filled pixel as column and row
   × pixel grids > gridPath draws one unit square per filled pixel
      Tests  4 failed (4)
 ✓ src/components/invaders/sprites.test.ts (4 tests) 14ms
      Tests  4 passed (4)
```

Browser run (Playwright, cached Chromium, `next start` on 3107), first pass 32 of 41: Escape left empty `style=""` attributes behind, Tab left the native modal for the browser's own controls, and the march took minutes on a 1440 screen. Fixed by saving and restoring style attributes byte for byte, trapping Tab across the dialog's buttons, and pacing the march to the screen (about five seconds per crossing, about twelve drops to the ship). Second pass 42 of 42.

Owner change (3 Oct, via the lead): the invaders are no longer the page's headings, which read flat, but word blocks naming the tech he has shipped and his work, from an editable list in `src/components/invaders/words.ts`. The "headings stay where they sit" mode is gone (the page's headings stand in only if the list is emptied). Sprites carry `kind: "word" | "image"` and an optional `src`, a typed hook for a later row of small monochrome logos; none is fetched. The dialog is named "A game: shoot down the things I build with" and its help line starts with the same words. The word blocks are filled with the page background so the dimmed page does not show through.

Red for the engine part (`npx vitest run src/lib/invaders`), 3 failing:

```
   × invader sprites > carry their kind and image source through play and into the next wave
   × packFormation > keeps rows within a width limit, so the formation has room to march
   × packFormation > centres the block in the field and each row in the block when asked
```

Green: `Test Files  2 passed (2)`, `Tests  38 passed (38)`. Browser run on the new build: 50 of 50, including the dialog's name and help text, and the page's headings left untouched while playing.

Owner round 2 (3 Oct, via the lead): play like the real game. Three invader types per row band (top row the VO beetle, two rows of the IC drifter, two rows of the Palindrome mark); original pixel creatures with two frames each; the Palindrome mark copied byte for byte from the lead's monochrome SVG (sha256 007da003...73bc) and drawn in the page's ink; no Fletchers, Stark or Imperial logo used or redrawn. A heartbeat march (slowest 0.8s with all 55, fastest 0.05s with one left, linear, 0.9x per wave for four waves, each of those waves starting 12px lower); bombs from the lowest invader of a column, a third of them aimed at the ship's column; four eroding shields; a golden mystery ship every 18s whose hits open the paper, /cv and GitHub in rotation. `words.ts` removed. Wave-1 bombs every 1.8s (1.2s killed a still ship in 14 game seconds, before the first mystery pass).

Popup check: `window.open(url, "_blank", "noopener,noreferrer")` returns null even when the tab opens, so a blocked popup cannot be told apart. `openTarget` opens without the features and sets `opener = null` on the new tab; null still means blocked, and then the game pauses with a focused link ("Open the paper", "Open my CV", "Open my GitHub") and a Resume button. That panel is proven by unit tests (`openTarget` with a fake open), not in the browser: a mystery hit cannot be staged there without a test hook in the page.

Red (`npx vitest run src/lib/invaders`, the round 1 engine plus stubs for the new names), 26 of 50 failing:

```
 ✓ src/lib/invaders/trigger.test.ts (9 tests) 71ms
   × mystery ship link targets > are the paper, the CV and GitHub, each with a sentence-case link text 69ms
   × mystery ship link targets > rotate: the nth hit opens target n, wrapping round 1ms
   × openTarget > opens the link in a new tab, cuts the new tab's link back to this page, and reports success 2ms
   ✓ openTarget > reports a blocked popup when the browser returns null 7ms
   ✓ collides (axis-aligned boxes; edges that only touch do not count) > is false when boxes share only an edge or a corner 19ms
   ✓ collides (axis-aligned boxes; edges that only touch do not count) > is true with a one pixel overlap, or when one box contains the other 1ms
   ✓ collides (axis-aligned boxes; edges that only touch do not count) > is false when apart 1ms
   × invaderGrid (the formation) > lays out rows x columns, each sprite centred in its cell 111ms
   × invaderGrid (the formation) > has three types: the top row type 3, the next two type 2, the bottom two type 1 5ms
   × createGame > places the ship centred above the bottom edge and starts at wave 1 23ms
   × the march tempo (the heartbeat) > is slowest with the full formation and fastest with one invader left 13ms
   × the march tempo (the heartbeat) > only ever gets faster as invaders die 6ms
   × the march tempo (the heartbeat) > is a little faster each wave, up to a cap 7ms
   × the march tempo (the heartbeat) > starts later waves a little lower, up to a cap 18ms
   × the invader march > moves one step per tick, not before, and flips the animation frame 61ms
   × the invader march > drops and reverses instead of crossing the right edge 14ms
   ✓ the invader march > drops and reverses at the left edge, moving the whole formation together 1ms
   × the invader march > ticks faster as invaders die 3ms
   ✓ the ship > moves left and right at ship speed and stays on the field 10ms
   ✓ the ship > follows a touch target without overshooting it 1ms
   ✓ bullets > leave the ship's centre top, then move up at bullet speed 6ms
   ✓ bullets > respect the fire cooldown while fire is held 1ms
   ✓ bullets > expire once fully above the field 11ms
   ✓ hits and score > a hit removes the invader and the bullet, even when the bullet moves further than the invader is tall 1ms
   × hits and score > scores 10, 20 and 30 for types 1, 2 and 3 3ms
   ✓ hits and score > keeps the best score: a higher stored best stays, a new best replaces it 1ms
   × waves > clearing a wave starts the next one with the same invaders, a little lower, shields restored and no bullets 15ms
   ✓ game over > ends when an invader reaches the ship's row 1ms
   ✓ game over > does not end while invaders are above the ship's row 0ms
   ✓ game over > a finished game no longer changes 0ms
   × bombs > drop from the lowest invader of a column, from its bottom centre, on the bomb timer 40ms
   × bombs > a bomb on the ship costs a life and clears the bombs; the last life ends the game 13ms
   × shields > placeShields spaces them evenly across the field 2ms
   × shields > a bullet from below clears the cell it hits and a small crater above it, and stops 15ms
   × shields > a bomb from above clears the cell it hits and a crater below it, and stops 7ms
   × shields > a cleared column lets the next bullet through 1ms
   × shields > invaders that reach a shield eat the cells they touch 14ms
   × the mystery ship > crosses the top at intervals, first from the left, and is gone once off the field 2ms
   × the mystery ship > no hit, no event 12ms
   × the mystery ship > a hit scores, removes it and reports the next link target in rotation 38ms
   × the mystery ship > events last one step 1ms
⎯⎯⎯⎯⎯⎯ Failed Tests 26 ⎯⎯⎯⎯⎯⎯⎯
 Test Files  2 failed | 1 passed (3)
      Tests  26 failed | 24 passed (50)
```

Green: `Test Files  3 passed (3)`, `Tests  50 passed (50)`. Sprites: red 2 of 6 (`are rectangular`, `each pixel creature has two frames`) against empty stubs, then 6 of 6. Browser run: 60 of 60, including the Palindrome mark fetched only after the trigger and the golden ship seen crossing in both themes.

### 2026-10-03 build evidence: slice 7 (build-out in the ledger direction)

#### Quote exemption (grill item: verbatim third-party words)

Text inside the `Quote` MDX component is someone else's words, quoted verbatim, so the slop text rules skip it: in source MDX between `<Quote ...>` and `</Quote>` (the tags and the prose around them are still checked), and in built HTML inside any element carrying `data-verbatim`, which `Quote` renders on its blockquote (classes and styles there are still the page's and are still checked; the caption is ours and is checked). Fixtures `quote.mdx` and `quote.html` in `src/lib/__fixtures__/slop/` each plant one em dash outside a quote and slop inside one. Red:

```
   × Quote > marks the quoted words as verbatim, so the slop lint leaves someone else's words as written 8ms
   × planted fixtures > quote.mdx fails with em-dash 15ms
   × planted fixtures > quote.html fails with em-dash 5ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected [ [ 'all-caps', 10 ], …(5) ] to deeply equal [ [ 'em-dash', 15 ] ]
AssertionError: expected [ [ 'all-caps', 7 ], …(3) ] to deeply equal [ [ 'em-dash', 8 ] ]
AssertionError: expected undefined to be 'quote' // Object.is equality
      Tests  3 failed | 67 passed (70)
```

Green: `Test Files  2 passed (2)`, `Tests  70 passed (70)`.

The draft caching post now quotes Anthropic's launch post next to its opening line (https://x.com/AnthropicAI/status/1823751314444021899, 14 August 2024). Text taken from X's public oEmbed endpoint (`publish.twitter.com/oembed`, logged out) and compared paragraph by paragraph with the post by a script: equal. The emoji and the em dash are kept as written. The only omission is the trailing `t.co` short link at the end of the post, which points back to Anthropic's announcement; the caption links the original instead. The post stays `draft: true`.

#### For the owner: copy changed in slice 7

- `src/content/posts/claude-code-workflow.mdx` description (the judge failed it as a hook): "Not the demo. The real workflow: where Claude Code saves hours on a real codebase, and where it still falls flat." -> "Where Claude Code saves hours on a real codebase, and where it still falls flat."

### 2026-10-03 the kb variant (branch `site-v2-kb`, for side-by-side comparison with the ledger)

Owner brief (3 Oct): follow the layout reference's page structure, section order, density, navigation and typographic feel with Thomas's own content; no text, images, code or assets taken from it; owner rules on top. The reference was loaded with Playwright (cached Chromium) at 1440x900 and 375x812, home, writing list and one post, full page; screenshots stayed in the builder's temporary folder. It has no dark theme of its own beyond a toggle; its content width is about 1016px; headings are a serif at 72/42/22px over a 17px sans.

Prior art: fonts from Google Fonts through next/font (adopt: Newsreader for headings and figures, IBM Plex Sans for text, IBM Plex Mono for code; the reference's own pairing is on the moodboard's generated list and its sans is banned by the lint). No layout library: the reference's structure is a few CSS grids.

Red, `npx vitest run src/lib/career.test.ts` against stubs (the one new piece of logic: case studies under their roles, degrees grouped by institution):

```
   × careerEntries > puts each case study under the role it was done in, in the order given, newest role first 8ms
   × careerEntries > gives each role an id for its heading, from the company name 1ms
   × careerEntries > refuses a case study whose workplace is not one of the roles, so a typo cannot hide it 2ms
   × educationGroups > groups degrees by institution, keeping the first-seen order of both 1ms
   × educationGroups > spans the years from the earliest degree to the latest 0ms
   × educationGroups > shows a single year when there is one degree 0ms
      Tests  6 failed (6)
```

Green: `Tests  6 passed (6)`.

Translations, reference pattern -> what the kb variant does:

1. Uppercase letter-spaced eyebrow above the h1 (role and employer) -> no label; its job is done by the first intro sentence, set as the lead under the headline.
2. "Hello, I'm" greeting as the h1 -> the judged headline from `profile.ts` (`headline`).
3. Coloured keywords in the hero paragraph -> plain text; colour stays on links.
4. Italic serif motto line -> kept as a slot, filled with his own line from `about.mdx` (`motto`).
5. Pill buttons (one filled, two outlined, with icons) -> a row of underlined text links: LinkedIn, GitHub (both new tab), CV.
6. Round photo with a soft drop shadow -> square portrait in a 1px hairline mount, no shadow, no radius.
7. Greyed logo strip ("built and studied at") -> removed; each mark sits beside its role in the Work timeline (Palindrome's logo in ink, wordmarks for the others in the heading face).
8. Sticky in-page section bar with a filled pill on the active item -> a row of plain anchor links between two hairlines, sticky from 48rem, no active state (no scroll script).
9. Uppercase eyebrow plus slogan h2 on each section -> one plain sentence-case h2 per section (About, Work, Outside work, Education and research, Skills, Writing).
10. Grey subtitle under section headings -> dropped (owner rule: no grey filler).
11. About's globe of cities -> the ForestVO trajectory plot on a light plate with its credit, beside the About text.
12. Outline pill links under About -> one text link to the long version (/about).
13. Career cards with rounded borders, logo tiles on a vertical line, accent dates -> no cards: a mark column, a 1px vertical hairline with a small ink square at each role, dates right in grey tabular figures, hairlines between case studies.
14. Emoji bullets, bold keywords, chips inside career cards -> case studies (title, problem, what I built, result only where no number) with the one figure set large on the right; the Stark role keeps its CV bullet.
15. "Giving back" two-column grid of rounded cards with tinted icons -> "Outside work" as a two-column list between hairlines, no icons.
16. Education cards (crest tile, name, subject in accent, bullets) -> two-column rows: institution in the heading face with its years, degrees and notes on the right; the paper as its own row.
17. Toolkit chip clouds, flag and logo tiles, uppercase group labels -> Skills as two-column rows, group name in the heading face, items as one comma-separated line.
18. Centred newsletter box with an icon and a filled subscribe pill -> the Writing section: recent posts between hairlines and an "All writing" link; RSS stays in the footer.
19. Writing page: uppercase eyebrow, slogan h1, grey lede, subscribe box, topic pills, "Read" links -> h1 "Writing", his line as the lead in ink, posts with date, reading time and tags as plain words, the title as the only link.
20. Post page: "originally published" box and "By" line -> left out (the name stays once per page); back link, meta line, title, hairline and a centred reading column kept.
21. Footer with the name, a motto and round icon buttons -> no name; the colophon line (faces and revision date), the RSS link, and the pixel alien (28x28) on the right.
22. Theme toggle in the nav -> left out; both themes follow the system setting (a toggle would be a control whose job the system already does).
23. Content revealed on scroll -> everything renders on load; motion is colour on hover only.

Slop allowlist (for the owner): acronym `IBM` (the font's name in the colophon); proper nouns `Forward Deployed Engineer`, `Data Scientist`, `Asset Analyst` (his job titles, set as h3 in the timeline as the reference does) and `IEEE Robotics and Automation Letters` (a journal name, set as h3).

Cherry-picked from `site-v2`: `0dc3e04 feat(arcade)` (clean), and the script half of `e975bb7 fix(proof)` (the focus check raced the game's next-frame focus return on this branch; its plan lines stay on `site-v2`).

The arcade registry (`src/components/arcade/games.ts`, the alien opening the one game directly) stays: the owner asked for it on 3 Oct, so a review finding that it is more structure than one game needs is noted and left as is (2026-10-04 review).

Gates: `scripts/ci.sh` (tail) and `npm run shots` against `npm start -p 3122` (screenshots not committed):

```
slop: 0 hits in 0 of 70 files
      Tests  201 passed (201)
slop: 0 hits in 0 of 7 files
ci: all gates green
pass  game / 1440 with the game open (reduced motion: no-preference): Escape closes it and focus is back on the alien
pass  game / 1440 with the game open (reduced motion: reduce): Escape closes it and focus is back on the alien
pass  print /cv A4: 2 pages (110 KB)
pass  print /cv Letter: 2 pages (110 KB)
pass  print /cv: no nav or footer on the page
pass  print /cv: 1 text colour on white paper, all dark on light
check-pages: 6 pages x 2 widths x 2 themes, 0 problems
axe: 24 of 24 runs with 0 violations; controls: 14 passes; shots: 24 files
```

### 2026-10-04 polish

#### Education as one row per degree

The home page grouped degrees by institution and showed "2021–2024" beside Imperial, which reads as one course. The CV lists two degrees, each with its own year: "Imperial College London: MSc Computer Science (Distinction), 2024" and "Imperial College London: BSc Biological Sciences (First Class Honours), 2021". `educationGroups` is replaced by `educationRows` in `src/lib/career.ts` (one row per degree, in the CV's order, with its own year and a unique key), used by both `/` and `/cv`; the credentials in `src/content/profile.ts` now use the CV's wording. `/about` already says 2021 and 2024 separately.

Red, `npx vitest run src/lib/career.test.ts` against a stub returning no rows:

```
 ✓ careerEntries > puts each case study under the role it was done in, in the order given, newest role first 2ms
 ✓ careerEntries > gives each role an id for its heading, from the company name 0ms
 ✓ careerEntries > refuses a case study whose workplace is not one of the roles, so a typo cannot hide it 1ms
 × educationRows > gives each degree its own row with its own year, so two degrees at one place never read as one course 10ms
 × educationRows > keeps the order given (the CV's, newest first) and carries each degree's note 2ms
 ✓ educationRows > gives each row a key that differs between two degrees at the same place 0ms
 × educationRows > shows the profile's Imperial degrees as the CV states them: MSc 2024 and BSc 2021, no span 1ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 3 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected [] to deeply equal [ [ …(3) ], [ …(3) ] ]
AssertionError: expected [] to deeply equal [ [ 'North University', …(2) ], …(2) ]
AssertionError: expected [] to deeply equal [ [ …(2) ], [ …(2) ] ]
      Tests  3 failed | 4 passed (7)
```

The key test passes against the stub (no rows, no clashes); it gained meaning once rows existed. Green: `Tests  7 passed (7)`. Rendered on the dev server, `/` and `/cv` now read "Imperial College London, 2024, MSc Computer Science (Distinction)" and "Imperial College London, 2021, BSc Biological Sciences (First Class Honours), Dean's List, Years 1 and 2".

#### Design system, manifest and final screenshots

`design/SYSTEM.md` written for the kb direction (owner rules on top, then each choice with its reason, gates and learnings); `scripts/ci.sh` now runs `npm run lint:slop -- design/SYSTEM.md`, which passes (the first run caught "Oct" in a heading and two unlisted capital words; reworded). `design/MANIFEST.yaml` lists every loaded font with files, upstream, licence, weights, styles and subsets, including Geist, which `next/og` bundles and falls back to for the favicon and share cards (an open item in SYSTEM.md); the portrait, the Palindrome logo, the paper plot and the wordmarks have entries; every path in the file exists, so none was removed.

Gates from a fresh `git clone --local` of `site-v2-kb` at d604647 in a `mktemp -d` folder (`npm ci --prefer-offline`, hooks installed as `scripts/setup-dev.sh` does), so the owner's dev server on 3006 kept its `.next`. `scripts/ci.sh`: `slop: 0 hits in 0 of 70 files`, `pass  design/SYSTEM.md`, `Tests  202 passed (202)`, built pages `slop: 0 hits in 0 of 7 files`, `ci: all gates green`. Then `npx next start -p 3016` from the clone, `npm run shots -- http://localhost:3016 --out <clone>/design/shots` and `npm run check:pages -- http://localhost:3016`:

```
pass  controls / 1440 with the game open (reduced motion: no-preference): dialog has "Close"
pass  game / 1440 with the game open (reduced motion: no-preference): Escape closes it and focus is back on the alien
pass  controls / 1440 with the game open (reduced motion: reduce): dialog has "Close", "Play anyway"
pass  game / 1440 with the game open (reduced motion: reduce): Escape closes it and focus is back on the alien
pass  print /cv A4: 2 pages (111 KB)
pass  print /cv Letter: 2 pages (111 KB)
pass  print /cv: no nav or footer on the page
pass  print /cv: 1 text colour on white paper, all dark on light
check-pages: 6 pages x 2 widths x 2 themes, 0 problems
```

axe: 24 of 24 runs with 0 violations; controls: 12 page passes plus 2 with the game open. The 24 screenshots (11 KB to 212 KB, all at 256 colours) are committed in `design/shots/`.

### 2026-10-04 review fixes

Findings from a fresh code review of `site-v2-kb` at 5eefa3e, fixed by an agent that did not write the reviewed code. One commit per finding.

#### Mystery ship: the site's own page in the same tab

The CV is a page of this site, so the site's link rule (own pages in the same tab, other sites in a new one) applies to the mystery ship too. `followTarget` in `src/lib/invaders/links.ts` replaces `openTarget`: an internal path (`/cv`; `//host` counts as another site) closes the game, which puts the page back, and loads the page with `location.assign`; the paper and GitHub still open with `window.open(href, "_blank")` and the opener cut by hand. Choice: the same-tab load sends the referrer as any same-site link does; it only names this site's own page, so it is accepted rather than stripped. The blocked-popup link in the game now only ever shows an off-site target, and carries the arrow and the visually hidden "(opens in a new tab)" like `ExternalLink`; the `/cv` entry left `dialogs.invaders` in `design/CONTROLS.json`, since that link can no longer appear.

Red, `npx vitest run src/lib/invaders/links.test.ts` against stubs (`isInternal` always false, `followTarget` always "blocked"):

```
   ✓ mystery ship link targets > are the paper, the CV and GitHub, each with a sentence-case link text 2ms
   ✓ mystery ship link targets > rotate: the nth hit opens target n, wrapping round 0ms
   × isInternal > is true for a path on this site and false for another site, protocol-relative ones included 9ms
   × followTarget > goes to a page on this site in the same tab, opening no new tab 3ms
   × followTarget > opens another site in a new tab, cuts the new tab's link back to this page, and reports it 1ms
   × followTarget > reports a blocked popup when the browser returns null for another site 1ms
   × followTarget > treats a protocol-relative address as another site 1ms
AssertionError: expected [ false, false, false, false, false ] to deeply equal [ true, true, false, false, false ]
AssertionError: expected 'blocked' to be 'same-tab' // Object.is equality
AssertionError: expected 'blocked' to be 'new-tab' // Object.is equality
AssertionError: expected [] to deeply equal [ Array(1) ]
AssertionError: expected 'blocked' to be 'new-tab' // Object.is equality
      Tests  5 failed | 2 passed (7)
```

Green: `Tests  7 passed (7)`.

#### Figure credit links follow the new-tab rule

`Figure`'s source link was a bare `<a>`, so an off-site credit opened in the same tab with no warning. It now renders through `ExternalLink` when the href starts with `http`, and stays a plain same-tab link for a page of this site.

Red, `npx vitest run src/components/mdx/mdx.test.tsx -t Figure`:

```
   ✓ Figure > wraps its content with a caption and a linked credit line 8ms
   × Figure > opens an off-site credit link in a new tab, safely, and says so to screen readers 13ms
   ✓ Figure > keeps a credit link to a page of this site in the same tab, with no new-tab hint 1ms
   ✓ Figure > leaves the credit line out when there is none 1ms
AssertionError: expected undefined to be '_blank' // Object.is equality
      Tests  1 failed | 3 passed | 11 skipped (15)
```

The same-tab test passes before and after: it guards the internal half of the split. Green: `Tests  15 passed (15)`.

#### Game copy

The alien's button, the dialog's name and the help line still described the word-block version ("shoot down the things I build with"). Now: button "Play space invaders", dialog "A game of space invaders", help "Left and right or A and D to move, space to fire, Escape to quit." (touch: "Drag to move, tap to fire."). `design/CONTROLS.json` and the alien locator in `scripts/check-pages.mts` follow.

#### Game resize and rotation

The game sized itself once, on open, so turning a phone or resizing the window left the canvas stretched and the pointer mapped to the old column. A `resize` and an `orientationchange` listener (removed on close) now re-size the canvas, re-run `layout`, rebuild the sprite paths, reset the pointer and start a fresh game, at most once per animation frame and only when the size or pixel ratio changed. After game over the panel keeps the final score until Play again.

Proof is a new step in `scripts/check-pages.mts`: with the game open at 1440x900, the viewport becomes 375x812 and the canvas must match the new size times the pixel ratio within 2 s. Red, `npm run check:pages -- http://localhost:3006` (the owner's dev server, read only) before the listener:

```
FAIL  game / 1440 with the game open (reduced motion: no-preference): resized to 375x812, canvas 1440x900
check-pages: 7 pages x 2 widths x 2 themes, 1 problem
  game / 1440 with the game open (reduced motion: no-preference): canvas not re-laid out after a resize (1440x900)
```

Green after: `pass  game / 1440 with the game open (reduced motion: no-preference): resized to 375x812, canvas 375x812` and `0 problems` (7 pages there because `next dev` lists drafts).

#### Money rule on built pages

The money rule ran on source content only, so a figure reaching a page from anywhere else (a component, a prop) went unchecked. `lintHtml` with `built` now runs it over visible text and the alt, title, placeholder and aria-label attributes. A built page is not the source file an allowlist entry's `file` names, so on built pages entries match by text alone. React splits text around expressions with `<!-- -->` ("$<!-- -->40k"), so each run of adjacent text nodes is joined first. Fixtures: `built-money.html` (allowlisted "£2bn+" with a `file` key, "$5m", the split "$40k", "€6m" in an alt, and figures in a script, code, hidden and verbatim text that must not count) and a planted `built-planted/server/app/money.html` for the CLI; the clean build's post gained "$2.50", allowlisted for the caching post, which passes by its text.

Red, `npx vitest run src/lib/slop.test.ts` (one run with the external-link tests below; these are the money lines):

```
   × lintHtml (built pages) > applies the money rule to a built page's visible text and alt text, matching the allowlist by text alone 3ms
   × lint-slop CLI > --built fails each planted control page and the planted CSS 638ms
AssertionError: expected [] to deeply equal [ Array(3) ]
AssertionError: expected 'src/lib/__fixtures__/slop/built-plant…' to contain 'src/lib/__fixtures__/slop/built-plant…'
```

Green: `Tests  59 passed (59)`.

#### External-link rule on built pages

New rule `external-link` in `lintHtml` with `built`: an `<a>` whose href starts with `http://` or `https://` (the site links its own pages by path) fails unless it has `target="_blank"`, a `rel` with both `noopener` and `noreferrer`, and a descendant `.sr-only` carrying "(opens in a new tab)", which is what `ExternalLink` renders. One hit per link, naming what is missing. Fixtures: `built-external.html` (a good link, then one missing each part, then `/cv`, `#main` and `mailto:` links and a head `<link>` that must not count) and a planted `built-planted/server/app/external.html` for the CLI. The two 3 Oct regression pages each carry one bare footer GitHub link from the old design, so their expectations now name it; the clean build's post link became `ExternalLink`'s markup.

Red, same run as above (external-link lines):

```
   × lintHtml (built pages) > finds only the real tells on the post page as built on 3 Oct 2026 46ms
   × lintHtml (built pages) > finds nothing on the same post page rebuilt after the slice 4 fixes but its bare footer GitHub link, payload scripts and code included 8ms
   × lintHtml (built pages) > fails a built off-site link without target=_blank, rel noopener noreferrer and the hidden new-tab hint 2ms
   × lint-slop CLI > --built fails each planted control page and the planted CSS 638ms
AssertionError: expected { 'em-dash': 6, 'icon-kit': 1, …(1) } to deeply equal { 'em-dash': 6, marketing: 1, …(2) }
AssertionError: expected [] to deeply equal [ [ 'external-link', …(1) ] ]
AssertionError: expected [] to deeply equal [ [ 'external-link', 3 ], …(2) ]
      Tests  5 failed | 56 passed (61)
```

Green: `Tests  61 passed (61)`. Real hits on the site: the only bare off-site anchor in the source was `Figure`'s credit link, fixed above; the built pages' result is in the gate run at the end of this section.

#### Footer revised date from the last commit

The footer's "Revised" date was a constant (`2026-10-03`) that would go stale with the next commit. Kept rather than removed, because it tells a visitor the site is current and the colophon line is part of the design; now it cannot drift. `src/lib/revised.ts`: `lastCommitDate` runs `git log -1 --format=%cs` (null when git or the history is missing) and `revisedDate` returns it when it is a `YYYY-MM-DD`, else the build day in UTC. The footer reads it once per build, so every static page carries the same day. On Vercel the build may have no `.git` (its environment gives a commit SHA, not a date), and then the build day is shown, which is the day the deployed pages were made.

Red, `npx vitest run src/lib/revised.test.ts` against stubs returning "stub":

```
   × revisedDate > is the last commit's date when git gives one 10ms
   × revisedDate > falls back to the build day when git is not there (a build without the repo's history) 1ms
   × revisedDate > falls back to the build day when git answers with something that is not a date 1ms
   × lastCommitDate > reads this repository's last commit date, as git itself prints it 8ms
   × lastCommitDate > gives null outside a git repository instead of throwing 2ms
AssertionError: expected 'stub' to be '2026-10-04' // Object.is equality
AssertionError: expected 'stub' to be '2026-11-02' // Object.is equality
AssertionError: expected 'stub' to be '2026-11-02' // Object.is equality
AssertionError: expected 'stub' to be '2026-10-04' // Object.is equality
AssertionError: expected 'stub' to be null
      Tests  5 failed (5)
```

Green: `Tests  5 passed (5)`. Commit attempt one failed in the pre-commit hook: git sets `GIT_DIR` for hooks, so `git log` in `/` still found the repo (`AssertionError: expected '2026-10-04' to be null`); the test now runs that call in a fresh temporary folder with the `GIT_*` variables cleared, as a build has them. The dev server's footer then read `Revised <time dateTime="2026-10-04">4 October 2026</time>`, matching `git log -1 --format=%cs`.

#### Smaller review items

- `check-pages.mts`: the header said to start the site on 3119 while the default base URL was 3005. 3005 is `npm run dev` (ADR 0002 item 8), so the default stays and the header and the "nothing answers" message now say so.
- `loadMark` in the game revokes its object URL in a `finally`, so a failed decode no longer leaks it.
- `Chart`'s data table keys its rows by index and x value, so two equal x labels cannot share a key.
- `careerEntries` gives a second role at the same company `-2` (then `-3`), so heading ids stay unique after a promotion. Red, `npx vitest run src/lib/career.test.ts`:

```
   × careerEntries > keeps the ids unique when two roles share a company (a promotion), so each heading has its own anchor 9ms
AssertionError: expected [ 'role-acme-labs', …(3) ] to deeply equal [ 'role-acme-labs', …(3) ]
      Tests  1 failed | 7 passed (8)
```

  Green: `Tests  8 passed (8)`.
- The arcade registry stays as the owner asked on 3 Oct (noted in the kb section above).
- For the owner: the evaluation diagram on the home page (`src/components/home/EvalGateDiagram.tsx`, under the release-evals case study) is new visual content drawn from that case study's facts; it needs his confirmation like any new copy.

#### Gates after the review fixes

From a fresh `git clone --local` of `site-v2-kb` at c1b3028 in a `mktemp -d` folder (`npm ci --prefer-offline`, hooks as `scripts/setup-dev.sh` installs them), so the owner's dev server on 3006 kept its `.next`. `scripts/ci.sh` exit 0: built pages `slop: 0 hits in 0 of 7 files` with the money and external-link rules on (every off-site anchor in the build carries `target="_blank" rel="noopener noreferrer"` and the hint), `ci: all gates green`. The built home page's About paragraphs and both Outside work lists are byte-identical to the dev server's render before the moves. Then `npx next start -p 3016` from the clone, `npm run check:pages -- http://localhost:3016` (exit 0):

```
pass  game / 1440 with the game open (reduced motion: no-preference): resized to 375x812, canvas 375x812
pass  game / 1440 with the game open (reduced motion: no-preference): Escape closes it and focus is back on the alien
pass  game / 1440 with the game open (reduced motion: reduce): Escape closes it and focus is back on the alien
pass  print /cv A4: 2 pages (110 KB)
pass  print /cv Letter: 2 pages (110 KB)
check-pages: 6 pages x 2 widths x 2 themes, 0 problems
```

axe: 24 of 24 runs pass. `npm run shots` refreshed the 24 screenshots in `design/shots/` (11 KB to 211 KB): the committed ones still showed the CV lines removed above, the old portrait text and the old footer date.

### 2026-10-04 owner review

Four owner changes, then two more from the same review (via the lead): links once per page, and a Title Case comparison that does not change the site. A fresh agent reviews; the builder does not review its own work.

#### Tags out of post meta

The meta line on `/writing`, the home list and post pages is now the date and reading time. The feed never emitted `<category>`, so its golden test was untouched; nothing else read tags, so `tags` left the `Post` type, the frontmatter validation and the post page's Open Graph `article:tag`. Decision: the parser reads only the keys it knows and ignores the rest, so a stale `tags:` line is harmless; the two real posts lose theirs, and the `older-post.mdx` fixture keeps one to prove it is ignored. CONTEXT.md's Frontmatter entry says so. Red, `npx vitest run src/lib/posts.test.ts`:

```
   × getAllPosts > lists published posts newest first and leaves drafts out 28ms
   × getAllPosts > ignores frontmatter keys it does not read, such as an old tags line, instead of carrying them onto the page 2ms
AssertionError: expected { slug: 'older-post', …(6) } to deeply equal { slug: 'older-post', …(5) }
AssertionError: expected [ Array(7) ] to deeply equal [ Array(6) ]
      Tests  2 failed | 9 passed (11)
```

Green: `Tests  13 passed (13)` with the feed test.

#### Footer gone, alien in the nav, GitHub out of the nav

The colophon line went, and with it `src/lib/revised.ts` and its tests (nothing else used them). Choice for RSS: a quiet "RSS" link under the post list on `/writing`, not a footer link, because with the colophon and the alien gone a footer would have held one word; the people who look for a feed look where the posts are, and feed readers find it from the `<link rel="alternate">` that every page's head still carries. The footer element is deleted and `main` ends a section's gap below its last line.

The alien moved into the nav next to About (Writing, CV, About, alien), with the Konami listener; the 404 page keeps its second alien. GitHub left the nav (owner item A). `scripts/check-pages.mts` opens the game from the nav's alien, expects focus back there after Escape, measures the nav on every page at both widths (items on one line, alien at least 28x28, no sideways scroll), and wants the printed CV on exactly one page like the PDF. Red, `npm run check:pages -- http://localhost:3006` (the owner's dev server, read only) before the move:

```
FAIL  nav / 375: 4 items, one line, right edge 268/375px, no alien (no alien button in the header nav)
FAIL  nav / 1440: 4 items, one line, right edge 1228/1440px, no alien (no alien button in the header nav)
FAIL  game / 1440 with the game open (reduced motion: no-preference): no alien button in the header nav to open the game from
FAIL  game / 1440 with the game open (reduced motion: reduce): no alien button in the header nav to open the game from
FAIL  print /cv A4: 2 pages, want 1 (110 KB, /tmp/check-pages-print-kkf8E8/cv-A4.pdf)
FAIL  print /cv Letter: 2 pages, want 1 (110 KB, /tmp/check-pages-print-kkf8E8/cv-Letter.pdf)
check-pages: 7 pages x 2 widths x 2 themes, 18 problems
```

(14 nav lines in all, one per page and width.) Green in the gate run below. At 375 the nav row ends at 233px of 375 with the alien's button 28x28.

#### Links once per page

The home page had three overlapping sets of links, and its section index used "About" and "Writing" for other places than the nav. Removed: the section index (and its CSS), the hero's CV link, the "longer version", "every role" and "all writing" links, the About paragraph's paper link (its row in Education and research links it), the post page's back link and the 404 page's two links. Two rules in `lintControls` keep it so, on built pages and in check-pages: `duplicate-href` (a second link to the same address, trailing slash ignored; same-page anchors exempt, since they move within the page and the skip link and footnote references need them) and `duplicate-label` (one visible label, read without aria-hidden glyphs and sr-only hints, on links to two places; anchors count here, so an "About" anchor beside the nav's About fails). The page did not feel too long without the index, so no section was cut. Red, `npx vitest run src/lib/slop.test.ts`:

```
   × controls budget > fails a second control beyond an entry's count, and every control on an unbudgeted route 13ms
   × links appear once per page > fails a second link to the same address, a trailing slash or not, but not same-page anchors 2ms
   × links appear once per page > fails two links with the same visible label that lead to different places, reading only the visible text 1ms
   × lint-slop CLI > --built fails each planted control page and the planted CSS 752ms
AssertionError: expected [ [ 'control-unlisted', 2 ] ] to deeply equal [ [ 'control-unlisted', 2 ], …(1) ]
AssertionError: expected [] to deeply equal [ [ 'duplicate-href', 2 ], …(1) ]
AssertionError: expected [] to deeply equal [ [ 'duplicate-label', 2 ], …(1) ]
      Tests  4 failed | 60 passed (64)
```

Green: `Tests  64 passed (64)`. The `feat(pages)` commit's body was cut short by shell quoting; the next commit says so rather than rewriting history.

#### /cv like the PDF CV

Prior art: the PDF's own template and stylesheet (his CV build) give the layout and measures; Charis SIL, its face, is OFL and on Google Fonts, so it is adopted through `next/font/google`, loaded by `/cv` only (MANIFEST.yaml, SYSTEM.md). The page is a US Letter sheet of paper in both themes (in dark a step dimmer, `#e6e9e3`, with the colour tokens redefined inside it so links and focus are drawn for paper); in print it takes the PDF's margins and fits one page on A4 and Letter. Small line helpers in `src/lib/cv.ts`. Red, `npx vitest run src/lib/cv.test.ts` against stubs:

```
   × displayUrl > shows a profile address the way a printed CV does: no scheme, no www, no trailing slash 10ms
   × displayUrl > gives the profile's own links as the CV header prints them 4ms
   × educationLine > puts the credential after the institution and the note after the credential 2ms
   × educationLine > leaves the note out when there is none 1ms
   × elsewhereLine > joins the items into sentences, each head with its note after a comma 1ms
   × elsewhereLine > is empty when there is nothing outside work 1ms
   × elsewhereLine > sets the profile's three items on one line 1ms
      Tests  7 failed (7)
```

Green: 7 passed. The sheet's tokens went into `contrast.test.ts` first (6 failing: the tokens did not exist), then green at 25 of 25.

Differences from the PDF that remain, and why: no summary (the public `cv` has none); no phone, email or address, GitHub and LinkedIn only (ADR 0003); clients described and money figures off, so several bullets read differently and one is absent; a Stark role and an Elsewhere line the PDF does not have; headings in sentence case at 12pt instead of spaced capitals (owner rule); the name not letter-spaced; skills items keep the profile's capitals; the BSc line runs to two lines because of its Dean's List note; Google's build of Charis SIL sets bold a touch wider than the desktop font the PDF used; on screen, links are claret with the new-tab arrow.

`scripts/cv-compare.mts` makes `design/shots/cv-compare-1440.png` and `cv-compare-print.png` (the sheet beside the PDF's first page at 96 dpi; the PDF's contact line painted over). They carry the private PDF, so `.gitignore` keeps them out of the repo; they are on the owner's disk only.

#### Heading case as a setting

`design/slop-allow.json` gains `headingCase` ("sentence", the default, or "title"). In title mode `sentenceCaseWords` names the words a Title Case heading gets wrong (small words lower case unless first or after a colon) and the rule is `sentence-case`. The site stays sentence case. Red:

```
   × sentenceCaseWords (Title Case mode) > names the words a Title Case heading leaves in lower case, small words apart 14ms
   × sentenceCaseWords (Title Case mode) > names a small word capitalised in the middle, but not one that opens the heading or follows a colon 1ms
   × heading case setting > in title mode passes Title Case headings and fails sentence-case ones 2ms
   × heading case setting > in title mode reads the planted heading fixture the other way round 2ms
   × heading case setting > applies to built pages too 2ms
   × lint-slop CLI > refuses an allowlist whose headingCase is neither sentence nor title 641ms
      Tests  6 failed | 66 passed (72)
```

Green: 72 passed (one proper-noun case added after green, as a guard). `design/shots/case-compare-1440.png` and `case-compare-375.png` put the home page in sentence case beside a throwaway Title Case variant (section headings and case-study titles only), built in a copy of the gate clone and never committed. On the judge criteria, sentence case wins: the brief's own list asks for sentence-case headings, and "reads as made by a person" and "restraint and hierarchy" favour it, since Title Case on every heading reads as a template; Title Case only helps the case-study titles scan as titles.

#### Gates

From a fresh `git clone --local` of `site-v2-kb` at 094cecb in a `mktemp -d` folder (`npm ci --prefer-offline`, `scripts/setup-dev.sh`), so the owner's dev server on 3006 kept its `.next`: `scripts/ci.sh` ends `slop: 0 hits in 0 of 8 files` and `ci: all gates green`. Then `npx next start -p 3016`, `npm run check:pages -- http://localhost:3016` (exit 0): controls and nav pass on all 6 routes at 375 and 1440, axe 24 of 24 runs pass, the game opens from the nav alien and gives focus back to it, `print /cv A4: 1 page, want 1` and `print /cv Letter: 1 page, want 1`, `0 problems`. `npm run shots` refreshed the 24 screenshots (8 KB to 204 KB, 256 colours).

### 2026-10-04 review fixes, round 2

A fresh review of the owner-review work (via the lead) found thirteen items. The builder here did not write the reviewed code.

#### Two commit messages reworded

`5780fae` (`feat(pages)`) had a body cut off mid-sentence and no Co-Authored-By trailer, and `85f00fd` (`feat(slop)`) carried a paragraph apologising for it. The branch is local and unpushed, so the lead allowed a one-off rewrite of those two messages only: `git branch -f site-v2-kb-pre-reword HEAD`, then `git filter-branch --msg-filter` over `ac2abdf..site-v2-kb` with a script that matches the two original subject lines and prints a complete message written from each commit's diff; every other message passes through `cat` unchanged. Proof:

```
--- git diff site-v2-kb-pre-reword site-v2-kb (bytes):
0
--- commit count:
7
--- Co-Authored-By count:
7
--- per-commit message compare:
identical  feat(posts): drop tags from post meta, the feed and the Post type
identical  feat(layout): move the alien into the nav and drop the footer
REWRITTEN  feat(pages): link each place once per page
REWRITTEN  feat(slop): fail a page that links one place twice or names two alike
identical  feat(cv): lay /cv out like the PDF CV, as a paper sheet
identical  feat(slop): make heading case a setting, sentence by default
identical  docs(design): log the owner review and refresh the screenshots
--- dates/authors old vs new:
      7 same
```

The first two commits kept their hashes; `refs/original` was deleted afterwards. The line in "Links once per page" above about the next commit saying so is history: that paragraph is gone.

#### Link rules: footnotes, address forms, the post body

Three gaps in `duplicate-href` and `duplicate-label`:

- remark-gfm draws every footnote's way back as "↩" linking to its own anchor, so a post with two footnotes failed `duplicate-label`. Footnote links (`data-footnote-ref`, `data-footnote-backref`) are skipped by the label rule, and two same-page anchors may share a label. Decision: an anchor named like a link to another place still fails (an "About" anchor beside the nav's About page), because that was the owner's complaint about the old section index; anchors never clash with each other, since neither leads anywhere.
- Addresses are compared by `placeKey`: query and fragment stripped (a bare `#...` stays exempt), scheme and `www.` dropped, trailing slash ignored, and an absolute link to the page's own origin read as its path. The origin comes from the page's canonical link or `og:url`, and check-pages also passes its base URL.
- Judgement 10: links inside `.prose` are exempt from `duplicate-href`, since an essay may cite one source twice; the page chrome still may not repeat. The old test that expected a prose link repeating the chrome's GitHub link to fail now expects it to pass.

The footnote fixture (`src/lib/__fixtures__/slop/footnotes.html`) is real remark-gfm output, rendered through `@mdx-js/mdx` and React as the site does. Red, `npx vitest run src/lib/slop.test.ts`:

```
   × links appear once per page > fails a second link to the same address, a trailing slash or not, but not same-page anchors or the post body 15ms
   × links appear once per page > passes a post with two GFM footnotes, as remark-gfm renders them 3ms
   × links appear once per page > compares addresses without query or fragment, scheme, www. or a trailing slash, and reads the page's own origin as a path 3ms
   × links appear once per page > resolves the site's own origin from an option when the page has no canonical link 1ms
   × links appear once per page > lets a post's body cite one source twice, but not the page chrome 4ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected [ [ 'duplicate-href', 2 ], …(1) ] to deeply equal [ [ 'duplicate-href', 2 ] ]
AssertionError: expected [ [ 'duplicate-label', 10 ] ] to deeply equal []
AssertionError: expected [ [ 'duplicate-href', 8 ] ] to deeply equal [ [ 'duplicate-href', 2 ], …(4) ]
AssertionError: expected [] to deeply equal [ [ 'duplicate-href', 2 ] ]
AssertionError: expected [ [ 'duplicate-href', 2 ], …(2) ] to deeply equal [ [ 'duplicate-href', 3 ] ]
      Tests  5 failed | 71 passed (76)
```

Green: `Tests  76 passed (76)`.

#### The client-size figure out until the owner clears it

The home case study and the CV bullet read "for two wealth managers across 4 countries"; the rest of each sentence is unchanged. The allowlist entry that let the figure through is gone, so the slop lint now fails it anywhere in content. The CLI's planted money page shows the allowlist matching by text with the caching post's "$2.50" instead. Red, `npm run lint:slop` and `npx vitest run src/lib/slop.test.ts` with the entry removed and the copy not yet changed:

```
> node scripts/lint-slop.mts

src/content/profile.ts:110 money currency figure "£2bn+" in content is not on the money allowlist | "Shipped 5 AI advice-report products to production in 3 months for two wealth managers wit
src/content/profile.ts:159 money currency figure "£2bn+" in content is not on the money allowlist | "Cut adviser report writing from a week to an hour by shipping 5 AI advice-report products

FAIL  src/content/profile.ts  2 hits

slop: 2 hits in 1 of 71 files
   × lint-slop CLI > --built fails each planted control page and the planted CSS 925ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected [ …(10) ] to have a length of 9 but got 10
      Tests  1 failed | 75 passed (76)
```

Green: `slop: 0 hits in 0 of 71 files` and `Tests  76 passed (76)`.

#### The web CV dropped (owner decision, 4 Oct)

Mid-round the owner dropped `/cv`, so items 4 (print headroom) and 5 (the Charis italic) are void: a red test for the Letter headroom (`printBox`, `printHeadroom`) had been written and was discarded with them. Removed: the route, its CSS and the CV rules in the print block (the generic print rules stay: no nav, links print their address), the sheet colour tokens and their contrast tests, the Charis SIL font and its MANIFEST entry, the nav's CV link and the CONTROLS entries, `/cv` in the sitemap and in check-pages' routes, the print check and the colour and PDF helpers only it used (with their tests), `src/lib/cv.ts` and its tests, `scripts/cv-compare.mts` and the four `design/shots/cv-*.png`. `next.config.ts` redirects `/cv` to `/` permanently. The `cv` data in the profile stays: the home page reads every field of it. The `.gitignore` line for the cv-compare images stays, since those private images are still on the owner's disk. SYSTEM.md, CONTEXT.md and README follow; the README also loses the `tags:` line, the search line and the stale `/blog` path, and its configuration row now names what `src/lib/site.ts` holds, since `site.github` (unused) is gone.

#### The mystery ship keeps the player in the game (owner, 4 Oct)

A hit no longer calls `window.open` or leaves the page, and the blocked-popup panel is gone with `followTarget` and `isInternal`. Instead the target joins an Unlocked list (`unlock`, no duplicates, in the order won), a notice "Unlocked: GitHub" shows for about 2 seconds (aria-hidden; the polite live region says the same), and the game runs on. P pauses and resumes; Escape pauses a running game and quits from any other screen; the top bar has Pause (a phone has no P key) and Quit (was Close). The pause and game-over screens list the unlocked links through `ExternalLink` (new tab, said so). The list lives in `localStorage` under `invaders-unlocked` (`readUnlocked`, `saveUnlocked`, both inside try and catch, reading only known targets). The rotation is the paper, GitHub, LinkedIn, taken from the profile. CONTROLS.json's dialog entries are Pause, Quit, Resume, Play again, Play anyway and the three links. check-pages seeds all three as won, presses P, wants "Paused.", Resume focused and the three new-tab links, then Escape closes and focus is back on the alien; the dialog's links are compared with each other for the duplicate rules, since the page behind a modal dialog is inert. Red, `npx vitest run src/lib/invaders/links.test.ts`:

```
   × mystery ship link targets > are the paper, GitHub and LinkedIn, each named in sentence case 8ms
   × mystery ship link targets > rotate: the nth hit unlocks target n, paper, GitHub, LinkedIn, then round again 1ms
   × unlock > adds a hit's target to the unlocked list once, in the order they were won 0ms
   × the stored unlocked list > round-trips through storage, so it survives a replay or a reload 0ms
   × the stored unlocked list > reads nothing from an empty, corrupt or foreign value, keeping only known targets once 0ms
   × the stored unlocked list > survives storage that throws, on reaching it, reading or writing 0ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 6 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected [ [ …(2) ], [ '/cv', 'my CV' ], …(1) ] to deeply equal [ [ …(2) ], [ …(2) ], [ …(2) ] ]
AssertionError: expected [ …(5) ] to deeply equal [ …(5) ]
TypeError: (0 , unlock) is not a function
TypeError: (0 , saveUnlocked) is not a function
TypeError: (0 , readUnlocked) is not a function
TypeError: (0 , readUnlocked) is not a function
     59|       throw new Error("SecurityError");
      Tests  6 failed (6)
```

Green: `Tests  52 passed (52)` for `src/lib/invaders`. "unlock" is on the slop lint's marketing list, so the copy says "win a link"; "Unlocked:" (the owner's word) passes.

#### The 404 page's second alien, and Pass and Fail on the diagram

The 404 page lost its own alien button and the `.lost` CSS (the nav carries one on every page); its CONTROLS entry has no controls left. The evaluation diagram on the home page now branches out of the release gate: "Pass" to a "Production release" box, "Fail" to a "Regression stopped" box, the fail line and its box dashed (`.dg-dash`), in both drawings (across from 40rem, down below it, where the two outcomes sit side by side at 14px); the screen-reader title says the same. Checked on the owner's dev server at 1440 and 375: layout as intended, but that server's CSS had not picked up the new rule (no `.dg-dash` in its stylesheets), so the dashes are proven on the clone's production build below.

#### Gates, screenshots and the case comparison

One fresh `git clone --local` of `site-v2-kb` at 5301127 in a `mktemp -d` folder (`npm ci --prefer-offline`, `scripts/setup-dev.sh`); the owner's dev server on 3006 was left alone. `scripts/ci.sh` ends `slop: 0 hits in 0 of 6 files` and `ci: all gates green`. Then `npx next start -p 3016`:

```
--- curl -sI /cv
HTTP/1.1 308 Permanent Redirect
location: /
--- sitemap
<loc>http://localhost:3000</loc>
<loc>http://localhost:3000/writing</loc>
<loc>http://localhost:3000/about</loc>
<loc>http://localhost:3000/writing/claude-code-workflow</loc>
--- pound sign on built pages
no page carries a pound sign
.dg-dash{stroke-dasharray:5 4}
check-pages: 5 pages x 2 widths x 2 themes, 0 problems
```

`npm run shots -- http://localhost:3016 --out <tmp>` passed every check (axe 20 of 20 runs, controls and nav on 5 routes at both widths, the game paused by P with Resume focused and the three won links, Escape back to the alien; `0 problems`). The lead asked for only home and About at 1440 light and 375 dark to save time, but the run writes every page anyway, so all 20 replace the old ones (the 404 and post pages changed too); the four `cv-*.png` were deleted with the CV. `case-compare-1440.png` and `case-compare-375.png` were regenerated by a throwaway script in the clone (not committed): the same build screenshotted twice, the second time with the section headings, case-study and role titles, skills labels and post titles rewritten to Title Case in the browser, so the comparison now converts those too. The clone's server was stopped by PID and the clone removed.

### 2026-10-04 review fixes, round 3

Seven findings from a further review (via the lead), fixed by an agent that did not write the reviewed code.

#### Held keys let go when play stops

Keyups were dropped outside play mode, so a key held while pausing stayed down on resume. `src/lib/invaders/input.ts` now holds the input as pure updates: `releasedInput()` (nothing held, a fresh object) and `keyInput(input, key, down, { playing, onControl })` (presses only while playing, releases in any mode; space on a focused control stays the control's, though its release still lets go of fire). `Game.tsx` resets the input and the pointer whenever the mode is not play, and on window blur. Red, `npx vitest run src/lib/invaders/input.test.ts` against a stub:

```
   × releasedInput > lets go of every key, the tap and the drag target, so nothing is still held after a pause 28ms
   × releasedInput > gives a fresh object each time, so one game's input never leaks into the next 3ms
   × keyInput > presses and releases the arrows and A and D while playing; a key press drops the drag target 2ms
   × keyInput > ignores key presses outside play, but applies key releases in any mode, so a key let go while paused is up on resume 1ms
   × keyInput > leaves space on a focused button or link to that control, but still lets go of fire when space comes up there 2ms
   ✓ keyInput > returns null for any other key and never changes the input it was given 1ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 5 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected { left: true, right: false, …(3) } to deeply equal { left: false, right: false, …(3) }
AssertionError: expected { left: true, right: false, …(3) } to deeply equal { left: false, right: false, …(3) }
AssertionError: expected null to deeply equal { left: false, right: true, …(3) }
AssertionError: expected null to deeply equal { left: true, right: false, …(3) }
AssertionError: expected null to deeply equal { left: true, right: true, …(3) }
      Tests  5 failed | 1 passed (6)
```

Green: `Tests  6 passed (6)`.

#### The first hit of a game wins a link not yet won

`mysteryHits` restarts at 0 each game, so the first hit always picked the paper, already won by a returning player. `createGame` now takes the stored `unlocked` list; a hit wins `nextTarget(unlocked, mysteryHits)` (`src/lib/invaders/links.ts`): the first target in rotation not yet won, or, once all three are, the rotation by hit count. The state carries the grown list and the event says `newLink`. `Game.tsx` shows "Unlocked: ..." and saves only when the list grows; once all are won a hit shows a plain "Mystery ship: 100 points". Red, `npx vitest run src/lib/invaders/links.test.ts src/lib/invaders/engine.test.ts` with `nextTarget` stubbed to the old rotation and the engine unchanged:

```
   × nextTarget > is the first target in rotation not yet won, whatever this game's hit count, so a returning player wins something new 58ms
   × the mystery ship > a hit scores, removes it and wins the first link not yet won 71ms
   × the mystery ship > starts from the links won in earlier games, so a new game's first hit is not the paper again 17ms
   × the mystery ship > once all three are won, keeps rotating and says no new link was won 11ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 4 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected [ { type: 'mystery-hit', …(2) } ] to deeply equal [ { type: 'mystery-hit', …(3) } ]
AssertionError: expected [ { type: 'mystery-hit', …(2) } ] to deeply equal [ { type: 'mystery-hit', …(3) } ]
AssertionError: expected { type: 'mystery-hit', …(2) } to match object { target: { …(2) }, newLink: false }
AssertionError: expected 'https://www.linkedin.com/in/thomas-pr…' to be 'https://doi.org/10.1109/lra.2025.3557…' // Object.is equality
      Tests  4 failed | 44 passed (48)
```

Green: `Tests  63 passed (63)` for `src/lib/invaders`.

#### Labels inside a post body are the author's

`duplicate-label` now skips links inside `.prose`, as `duplicate-href` already did: a post may call two sources "the paper" or link an older post as "Writing". The chrome is still held to one label per place. Fixture `src/lib/__fixtures__/slop/prose-labels.html` (a post page whose body reuses a label for two places and a nav label, then a chrome "About" to another place). Red, `npx vitest run src/lib/slop.test.ts -t "links appear once"`:

```
   × links appear once per page > lets a post's body reuse a label for two places, or a nav label, but not the page chrome 26ms
⎯⎯⎯⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯⎯⎯⎯
AssertionError: expected [ [ 'duplicate-label', 2 ], …(3) ] to deeply equal [ [ 'duplicate-label', 4 ] ]
      Tests  1 failed | 7 passed | 69 skipped (77)
```

Green: `Tests  77 passed (77)`.

#### Smaller fixes and gates

README: a current home page screenshot (the top 1440x900 of `design/shots/home-1440-light.png` at 1200px, 58 KB JPEG) with alt text saying what it shows, `/writing/<slug>` and `src/app/writing/[slug]/page.tsx` for the old `/blog` paths, the gate list as `scripts/ci.sh` runs it, and "CMS" spelt out (the slop lint's all-caps hit). MANIFEST.yaml: the Palindrome logo is on `/` only. `scripts/check-pages.mts` takes `MYSTERY_TARGETS` and `UNLOCKED_KEY` from `src/lib/invaders/links.ts`, which now imports the profile by a relative path with its extension so plain Node loads it. The duplicate-href fixture uses `/about` for the gone `/cv`; the `.gitignore` comment says only what the comparison images are.

Gates from one fresh `git clone --local` at 7e4a68f in a `mktemp -d` folder (`npm ci --prefer-offline`, `scripts/setup-dev.sh`): `scripts/ci.sh` ends `slop: 0 hits in 0 of 6 files` and `ci: all gates green` (`Tests  235 passed (235)`). `npx next start -p 3016` and `npm run check:pages -- http://localhost:3016` exit 0: the game pauses on P with Resume focused and the three won links, resizes, and gives focus back to the alien on Escape; `check-pages: 5 pages x 2 widths x 2 themes, 0 problems`. The server was stopped by PID and the clone removed; the dev server on 3006 was left alone.
