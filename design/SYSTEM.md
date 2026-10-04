# Design system: the kb direction

The tokens in `src/app/globals.css` are the source of truth; this file says why each one is what it is. The kb direction follows the layout of the brief's shape reference (zkevinbai.com) with Thomas's own content, faces and colours. It was built on 3 Oct 2026 beside the ledger direction and picked by the owner on 4 Oct 2026; the ledger stays on its own branch, unmerged.

## Owner rules (binding; they override everything below)

The anti-slop list the owner set on 3 October 2026:

- **No letter-spaced caps.** Sentence case everywhere (the slop lint’s `headingCase` setting in `design/slop-allow.json` is "sentence"; "title" exists only to compare the two, see `design/shots/case-compare-*.png`, whose Title Case half rewrites the section headings, case-study and role titles, skills labels and post titles in the browser on the same build, and is never shipped). No `uppercase`, no `tracking-wide*`, no letter-spacing of 0.05em or more, no spaced-out capitals. Headings may tighten (down to -0.015em), never widen.
- **No pills or rounded boxes, except where they mean something.** Hairlines and space separate things; nothing is a card. Radius is 3px on code blocks and inline code only, and the lint fails anything over 4px. `design/slop-allow.json` has an empty radius list: any exception is listed there by component, with its reason, before it ships.
- **No controls without a job.** Links are links, buttons are buttons. Every link, button and focusable element on each page is listed with its job in `design/CONTROLS.json` (the controls budget); the built-page lint and the rendered check fail anything unlisted. No theme toggle (the site is light only), no search over a handful of posts, no print button.
- **No grey filler under headings.** A heading is followed by content, a date, a number or a link, never a muted tagline.
- **His voice.** All copy is first person, plain and specific, taken from his CV, his achievements record and the extras he approved (ADR 0003). Clients are described, never named.

The brief's list: no gradient blobs, glassmorphism, emoji headings, eyebrow labels, all-caps labels, "Hi, I'm" heroes, three-card grids, generic icon rows, bento grids, testimonials, marketing words or em dashes in prose. Headings are sentence case.

## Choices

### Layout and section order

- **Where it came from.** The reference's page structure, density, navigation and typographic feel, measured from the live page at 1440 and 375 wide (a content width of about 1016px, a serif at 72/42/22px over a 17px sans). No text, image, code or asset was taken from it.
- **Home, in the reference's order.** A two-column hero (the headline, the first intro sentence as the lead, his italic line and two text links, LinkedIn and GitHub, on the left, the portrait on the right); About with the paper's plot beside it; Work as a timeline of roles with their case studies; Outside work; Education and research; Skills; Writing.
- **Width.** `--page-max` is 63.5rem (1016px, the reference's width) inside `--pad` gutters of 1rem on phones and 2rem from 48rem. Prose and posts keep to `--measure`, 40rem.
- **Links once per page.** Each place is linked once on a page and one label never names two places (owner review, 4 October 2026). The nav carries Writing and About on every page; LinkedIn and GitHub sit in the home hero only, and other pages link them where they need them (the end of About). The in-page section index that stood under the hero is gone, with the after-list links to the CV, About and all writing, the post page's back link and the 404 page's two links: the nav already does each of those jobs. The built-page lint enforces it (`duplicate-href`, `duplicate-label`). Two links lead to one place when they match without query or fragment, scheme, `www.` or a trailing slash, an absolute link to the site's own origin counting as its path. Same-page anchors and links inside a post's body are exempt from the first rule (an essay may cite one source twice; footnotes need their anchors), and links inside a post's body from the second (two sources may both be "the paper"); the page chrome is held to both.
- **The timeline.** A mark column (`--mark-w`, 9rem), a 1px vertical hairline with a small ink square at each role, dates to the right in grey tabular figures. On phones the mark sits above its role.
- **Two-column rows** for Education and research and for Skills: the label in the heading face on the left (17rem), the content on the right, a hairline between rows. Education has one row per degree, each with its own year, as the CV lists them. Outside work is a two-column list between hairlines.
- **Other pages.** `/writing`, each post and `/about` use one centred reading column; the 404 page is a headline and one line pointing at the nav. The web CV page was dropped on 4 October 2026 (owner decision): `/cv` redirects home permanently (308), and the roles, education and skills it showed live on the home page.

### Translations from the reference

Each of the reference's patterns either became something the owner's rules allow or was dropped. The full list of 23 is in `plans/site-v2.md` (Log, "the kb variant"); the ones that shape the page:

- Uppercase eyebrow above the headline: none; the first intro sentence does its job as the lead.
- "Hello, I'm" greeting as the headline: the blind judge's headline from `src/content/profile.ts`.
- Coloured keywords in the hero: plain text; colour stays on links.
- Pill buttons with icons: a row of underlined text links (LinkedIn, GitHub).
- Sticky in-page section bar: removed on 4 October 2026; it repeated the nav's labels for other places.
- Round photo with a soft shadow: a square portrait in a 1px hairline mount, no shadow, no radius.
- Greyed logo strip: removed; each mark sits beside its role in the timeline.
- Eyebrow plus slogan heading on each section, grey subtitle under it: one plain sentence-case heading.
- Career cards, emoji bullets, bold keywords, chips: no cards; each case study is a title, the problem, what he built and one large figure.
- Chip clouds of skills: one comma-separated line per group.
- Newsletter box: a Writing section with recent posts. The feed is a quiet "RSS" link under the list on `/writing`, and every page's head carries the feed's `<link rel="alternate">` for feed readers.
- Footer with a name, a motto and icon buttons: no footer at all. A colophon line (the faces and a revised date) stood there until the owner's review of 4 October 2026 called it filler; with the feed link moved to `/writing`, nothing was left for a footer to hold, and each page ends a section's gap below its last line.
- Theme toggle: none, and no dark theme: the site is light only (owner decision, 4 October 2026).
- Content revealed on scroll: everything renders on load.

### Type

- **Newsreader** (Production Type, variable in weight and optical size) for headings, the name, case-study figures and the one italic line. Optical sizing means a 64px headline and a 19px case-study title are each drawn for their size. Picked because the reference's own pairing is on the moodboard's list of generated defaults and its sans fails the lint.
- **IBM Plex Sans** (400, 500, 600, roman and italic) for reading text, navigation and meta lines: a plain sans with some character, clearly distinct from the serif.
- **IBM Plex Mono** (400, 500, roman only) for code in posts only.
- Three faces in all, loaded once by the root layout on every page. Each comes through `next/font/google`, is self-hosted with the site (the browser makes no request to Google) and uses `display: swap`. Fallbacks: Iowan Old Style then Georgia for Newsreader, Segoe UI then system-ui for Plex Sans, ui-monospace for Plex Mono. The favicon and share cards are images drawn at build time by `next/og` in its bundled Geist, never sent as a font. Details and licences in `design/MANIFEST.yaml`.
- Figures that line up (dates, years) use `.num`: lining, tabular.

### Scale

Taken from the reference's steps, drawn in our faces:

| Token | Phone | From 48rem | Use |
|---|---|---|---|
| `--text-meta` | 14px | 14px | dates, captions, the feed link |
| `--text-nav` | 15px | 15px | header links, notes |
| `--text-body` | 16px | 17px | reading text, line height 1.7 |
| `--text-lead` | 18px | 21px | the lead under a headline |
| `--text-h4` | 19px | 19px | a case study's title |
| `--text-h3` | 21px | 23px | a role, a place, a post |
| `--text-h2` | 30px | 40px (fluid) | a section |
| `--text-figure` | 36px | 44px (fluid) | a case study's number |
| `--text-display` | 38px | 64px (fluid) | the page's headline, line height 1.04 |

Headings use line height 1.2 and `text-wrap: balance`; paragraphs use `text-wrap: pretty`.

### Colour

A cool grey-green paper, not the generated cream; a green-black ink, never pure black; one accent, a claret, spent on links and the current page only. Tokens are hex so `src/app/contrast.test.ts` can read them.

**Light only.** The owner decided on 4 October 2026 to "just default to light": there is no dark theme and no toggle, whatever the visitor's system setting. One palette also means one set of contrast ratios, one gold for the game and one set of screenshots to keep right. `color-scheme` is `light`, the stylesheet has no `prefers-color-scheme` block, and the contrast test fails if one comes back.

| Token | Value | Job |
|---|---|---|
| `--bg` | `#f3f4f0` | paper |
| `--text` | `#1a1e1c` | ink |
| `--secondary` | `#575e59` | pencil: dates, notes, captions |
| `--link` | `#8b2331` | links, the current page, focus |
| `--divider` | `#d3d7cf` | hairlines |
| `--surface` | `#fafaf7` | code blocks, the portrait mount |
| `--surface-soft` | `#e9ebe5` | inline code |
| `--plate` | `#fafaf7` | the light plate behind the paper's plot |

Contrast ratios, measured from the hex values in `globals.css` with the WCAG formula (the same one the contrast test uses). Every text colour meets AA (4.5:1) on every background:

| Text on | bg | surface | surface-soft |
|---|---|---|---|
| `--text` | 15.25 | 16.11 | 14.02 |
| `--secondary` | 6.03 | 6.37 | 5.55 |
| `--link` | 7.98 | 8.43 | 7.34 |

Hairlines are decoration, not text or a control edge: `--divider` is 1.32:1 on the paper. The game's gold mystery ship is a graphic that needs 3:1: `#9a6f00` is 4.09:1 on the paper. Print sets black text on white paper (21:1) with grey `#999999` rules, inside the print block only, which is why the lint exempts it from the pure black and white rule.

### Spacing

- Sections are `--section-gap` apart: 4rem on phones, 6rem from 48rem.
- Headlines get 3rem above and 2.5rem below on phones, 5.5rem and 3.5rem from 48rem.
- Rows and case studies are padded 1.75rem above and below their hairline; the timeline's entries are `--tl-gap` (2.5rem) apart.
- Steps are rem multiples of 0.25 throughout; there is no separate spacing scale because the page has few distinct gaps and each is named where it is used.

### Lines and radius

- 1px hairlines in `--divider` between rows, sections and posts, and around the portrait. No shadows anywhere on the page.
- Radius: 3px on code blocks and inline code, which sit on a tinted surface and read better with the corner softened; 0 everywhere else. The favicon uses 4px.

### Motion

- Colour only, on hover: link underlines darken and header links gain a hairline underline over `--dur-quick` (120ms) with an ease-out curve (`cubic-bezier(0.2, 0, 0, 1)`). No overshoot, no `transition: all`.
- Nothing moves on load or on scroll; the page renders complete.
- Under `prefers-reduced-motion: reduce`, `--dur-quick` is 0ms and smooth scrolling is off. The game shows a still frame of its scene with a "Play anyway" button instead of starting.

### Focus

- `:focus-visible` draws a 2px solid outline in `--link`, offset 2px, never animated. It meets 3:1 against the paper (the link colour's ratios above).
- A skip link is the first control on every page. The game is a modal dialog: Tab cycles its buttons and links. P or Escape pauses a running game; Escape on the pause screen, or Quit, closes it and focus returns to the alien that opened it.

### Images

- **Portrait.** His GitHub avatar (`https://github.com/tompritch30.png?size=460`), re-encoded as a 400px square `.jpg` with no metadata, stored in `public/me/` so the page makes no call to GitHub. Square, in a 1px hairline mount on `--surface`; 8rem wide above the text on phones, 15rem beside it from 48rem; on `/about`, 8rem above the text on phones and 13rem beside it from 64rem.
- **Palindrome mark.** Palindrome's own logo, made monochrome with `fill="currentColor"` and inlined at build time, so it takes the ink colour. It is the only organisation logo on the site; the others' terms forbid reuse, so Fletchers, Stark, Imperial and IEEE are wordmarks in the heading face.
- **Paper plot.** One trajectory figure from his own paper (accepted version, arXiv 2504.01261), shown under IEEE's author reuse terms with the credit line beside it: "© 2025 IEEE. From Pritchard et al., ForestVO, IEEE RA-L 2025." It keeps its own colours on a light plate.
- Origins, hashes and terms for every asset are in `design/MANIFEST.yaml`.

### The easter egg

- A pixel alien in the header nav, next to About, on every page, a 28px square button (above WCAG 2.2's 24px target size), in pencil grey; on hover or focus it turns to ink and looks aside. It is a real button whose one job is to start the game, listed in the controls budget. The Konami code is a second way in. On a 375px phone the nav's links and the alien still sit on one line under the name, with no sideways scroll; `npm run check:pages` measures it on every page at both widths.
- The game (ADR 0004) loads only when asked. It draws in the page's own ink and paper; all its art is original pixel grids in code, apart from the Palindrome mark.
- **The one glow.** The golden mystery ship carries the only soft shadow on the site (an 8px blur in its own gold), because it is the one thing worth chasing. Under reduced motion it has none.
- **A hit keeps you in the game.** A hit on the mystery ship never opens a tab or leaves the page (owner, 4 October 2026): a small notice says "Unlocked: GitHub" for about 2 seconds, the link joins the Unlocked list and the game runs on. The pause and game-over screens list the unlocked links as ordinary new-tab links; the rotation is the paper, GitHub, then LinkedIn.
- No sound. The high score and the Unlocked list live in `localStorage` inside try and catch.

## Gates

Run in the Linux checkout of the repo with Node 22.

- `scripts/ci.sh`: lint, the slop lint on source, typecheck, unit tests (including the contrast test and `src/lib/career.test.ts`), the guard hook tests, the production build, then `npm run lint:slop -- --built` (built pages, built CSS and the controls budget). It also lints this file.
- `npm run lint:slop -- design/SYSTEM.md`: this file passes the same prose rules as the site.
- Against a running production build (`npm run build && npx next start -p <port>`): `npm run check:pages -- http://localhost:<port>` runs axe (WCAG 2.2 AA) on every page at 375 and 1440 (light only), checks the rendered controls against the budget with the game open, and measures the nav on every page at both widths (its items and the alien on one line, the alien at least 28x28, no sideways scroll).
- `npm run shots -- http://localhost:<port>` does the same and writes every page at 375 and 1440 into `design/shots/` as `<page>-<width>-light.png`, palette-reduced to under 300KB each.

## Learnings

- Next 16 always prerenders its own static 500 page; `global-error.tsx` cannot replace it, so the built-page lint skips that one file while it carries Next's marker and says so.
- Tailwind v4 scans every file by default, so the slop lint's own rules and planted fixtures put banned utilities into the built CSS. `globals.css` scopes the source to `src/` and excludes them.
- `.prose table { overflow-x: auto }` made the chart's hidden data table a scroll region with no keyboard access; the chart's table now forces `overflow: hidden`.
- Grouping degrees by institution showed one span of years for two courses. Education is now one row per degree, each with its own year, exactly as the CV lists them.
- The share card and the favicon are drawn by `next/og`, which falls back to its bundled Geist Regular, not the site's faces. Setting them in Newsreader needs its font file read at build time; left as an open item.
