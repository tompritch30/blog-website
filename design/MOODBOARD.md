# Moodboard: personal site, typography-led

Researched 3 October 2026. Every site below was loaded with Playwright at 1440 x 900 and 375 x 812, light and emulated dark. Sizes and colours are computed values read from the live page, not guesses. Screenshots stay outside the repo (copyright); the lead has the paths.

The bar: a page that reads as made by one person with opinions, not assembled from a kit. Typography carries it; colour and decoration are close to absent.

## Reference sites

### paco.me
- Link: https://paco.me/
- Take: everything at one size (16/28px), hierarchy from weight and grey only; a 640px column; work as three text columns (Building, Projects, Writing), each item an underlined title plus a one-line grey description, with a small arrow only on external links; one italic serif phrase (Newsreader) dropped into a sans paragraph.
- Avoid: the three narrow columns collapse to two on a phone and clip the third off the right edge; at 16px for everything the name has no presence at all.

### stephango.com
- Link: https://stephango.com/
- Take: a warm paper ground (#fffcf0, his Flexoki palette) with near-black ink and a single warm grey; sections (Latest, Topics, Writing) split by full-width 1px hairlines; the writing list with dates as "2025 · 10" in a fixed grey column so the titles align; topics as one comma-separated inline run of underlined words rather than chips.
- Avoid: on a phone the date column is dropped and replaced by bullets, which loses the best detail; keep the dates at every width.

### leerob.com
- Link: https://leerob.com/
- Take: a system serif (Iowan Old Style, no web font download) at 17/27px in a 600px column; blog list as title left, date right, hairline under each row; the "Default / Long" toggle that swaps a short bio for a long one in place.
- Avoid: the "@leerob" handle as the h1 and the full-height commissioned city illustration; both are about his brand, not a model for ours.

### thesephist.com (Linus Lee)
- Link: https://thesephist.com/
- Take: the whole home page is six first-person paragraphs in IBM Plex Serif 18/29px at a 700px measure, with links doing the navigation inside the prose; the h1 is a plain sentence ("My name is Linus.") at only 27px; one-line text nav (posts, projects, rss).
- Avoid: the dense link underlining in a teal tint makes some paragraphs read as a link farm; with our mix of finance and AI work, prose alone would bury the case studies.

### emilkowal.ski
- Link: https://emilkowal.ski/
- Take: section labels as plain words in medium weight ("Today", "Projects"), each project as name plus one line, and very generous vertical space (80px or more) between groups.
- Avoid: grey body text (#63635e) on off-white for everything, and this exact layout is the shape of the Vercel portfolio starter, so it now reads as a template.

### rsms.me (Rasmus Andersson)
- Link: https://rsms.me/
- Take: the nav set large (32px) in light grey and stacked vertically as content, not as a header bar; three equal text columns (Projects, Thoughts, a 20px bio statement); dates as small grey text trailing the excerpt ("Jan 2017"); counts instead of stats ("See all 75 projects").
- Avoid: Inter is his own typeface, so for anyone else it reads as the default; the single P3 orange dot is his signature, do not borrow it.

### sive.rs (Derek Sivers)
- Link: https://sive.rs/
- Take: "Me in 10 seconds" as a life summary in four lines, each prefixed by a tiny grey year range in brackets ("(1998-2008):"), then one plain sentence with a hard number; Georgia 20/32px at a 560px measure; a "Me in 10 minutes?" link that hands off to the long version.
- Avoid: the salmon page tint (#fff1e5) is the Financial Times colour, a bad borrow for someone selling into finance; the dark navy default-looking links.

### gwern.net
- Link: https://gwern.net/
- Take: small-caps section headings in Source Serif 4 with a rule drawn under each; link lists in two columns with a custom bullet; a centred asterism between major groups; 20/32px body.
- Avoid: the boxed small-caps nav buttons and the floating icon toolbar, which on a phone sits on top of the body text; far too much metadata for a CV-shaped site.

### danluu.com
- Link: https://danluu.com/
- Take: no stylesheet at all; every post on one page, dates as "09/26" in a left gutter, default blue links; it proves the content list alone can be the design.
- Avoid: no max-width, so on a wide screen the eye has nowhere to rest; no name or bio on the home page, which a visitor needs in the first second.

### frankchimero.com
- Link: https://frankchimero.com/
- Take: the entire home page fits one screen: name and role top left, five items top right, each a title plus a grey meta line ("Book · 2012", "Collages · 2017-2020"); one typeface (Courier, 13px) on a dark green-grey ground (#3d4340).
- Avoid: 13px grey on grey is roughly 2:1 contrast and fails accessibility; monospace for a whole page reads as a terminal costume on an engineer's site.

### lynnandtonic.com (Lynn Fisher)
- Link: https://lynnandtonic.com/
- Take: the nav is a table of contents with dot leaders and roman numerals (About ..... I), and a version number at the foot ("v. XIX") because she redesigns once a year; the dark mode turns the whole page red on black rather than inverting.
- Avoid: the rough display face and blackletter-ish small caps are a costume that only works for an illustrator; borrow the device, not the dress.

### rauno.me
- Link: https://rauno.me/
- Take: a one-sentence bio set huge (about 56px) with each line indented to a different position, so the sentence reads as a shape; one tick-mark ruler at the top as the only chrome.
- Avoid: the yellow disc and the sideways-scrolling strip of cards are his signature and break on a phone (the page overflows horizontally at 375px by design).

### maggieappleton.com
- Link: https://maggieappleton.com/
- Take: the headline is the bio ("Maggie makes visual essays about programming, design, and anthropology.") in Canela Deck at about 82px, with only her name set bold in the same face; a deep plum link colour (#5f023e) on cream (#f6f5f1).
- Avoid: Lato at 15px in light grey (#8e8f94) for subtitles is too faint; the digital-garden apparatus (growth stages, dropdown nav, 76 images on the home page).

### simonwillison.net
- Link: https://simonwillison.net/
- Take: entries grouped under a bold date heading ("Oct. 1, 2026") rather than a date on every item; a Highlights column of link plus date; tags with post counts in small grey figures.
- Avoid: the purple nav band, sponsor bar, pill-shaped tags and the full search box above the fold; it is a working blog, not a first impression.

### karpathy.ai
- Link: https://karpathy.ai/
- Take: the career as a vertical timeline: year ranges right-aligned in a grey left gutter ("2017 - 2022"), a 1px vertical line, and one plain paragraph per role written in the first person with the real outcome.
- Avoid: the large circular headshot, the row of round social icons, emoji in the tagline and the coloured company logo tiles beside each entry.

### Also loaded, not used

- brittanychiang.com: the navy two-column layout with a sticky left nav, "2024 - PRESENT" gutters and teal tech pills is the most cloned portfolio on GitHub; it now reads as a template even on the original.
- joshwcomeau.com: a 3D mascot, sky gradient and confetti dots; well made but a product brand, not a model for a CV site.
- robinrendle.com: the home page is now a fake file browser of photos; re-drawn app chrome.
- craigmod.com: newsletter form, award laurels and book shop above the essays; a writer's storefront.
- patrickcollison.com: 15 right-aligned links in 13px Myriad and nothing else; a good joke but not enough for a stranger.
- ciechanow.ski: the blue header bar is fine; the value is the interactive essays, which we will not have.
- jvns.ca: orange striped frame and stacked uppercase nav; strongly hers, wrong voice for finance.
- minimal.gallery: an index, not a site; its own front page (pill filters, email capture, Inter on black) shows the current house style.

## The four shape references

The owner's verdict is that these read as AI-generated. The concrete reasons:

### zkevinbai.com
- Why it reads generated: Fraunces 72px plus Inter 21px on cream (#fbf7f0) with a terracotta accent, which is the default "warm editorial" pairing models reach for; a tracked uppercase eyebrow in the accent colour above the h1 and above every section ("ABOUT", "CAREER", "GIVING BACK"); "Hello, I'm Kevin." beside a round headshot with a soft drop shadow; a pill row (filled LinkedIn, outlined Email and Pod) with icons; a greyed logo strip ("Built, advised & studied at"); slogan h2s ("I speak customer, executive, and engineer."); emoji as bullets, flag emoji for languages, bold keywords inside bullets, chip clouds of skills; the content is hidden until scrolled into view, so a full-page capture is blank below the fold.
- Shape worth taking: the order (one line of who, three domains he knows, then career with employer, place and dates on a meta line, then a section for public speaking with dated entries, then writing). Dated, specific, first person.

### jackhughes.ai
- Why it reads generated: near-black with a faint grid-line background and neon green accent; JetBrains Mono for nav, eyebrows and buttons ("01. about"); a centred hero with a ring-framed headshot and a typewriter word that rotates ("I'm a Maker." then "Communicator.") with a blinking caret; three buttons; a fake code window with traffic-light dots ("const role = ..."); stat counters ("60+", "2,000+"); client logos in coloured tiles; a tech-icon grid; "Let's Build Something" to close.
- Shape worth taking: a "Corporate projects" section that handles confidential client work honestly: each entry is the problem, what was built and the outcome, with a "confidential" note instead of a client name.

### smritisingh26.github.io
- Why it reads generated: DM Serif Display plus DM Sans; pill nav with a filled "Resume" pill; a pink-to-mint gradient wash behind the hero; round photo; bio inside a card with a coloured left stripe; a short accent underline below "What I've Built"; a three-column grid of bordered cards each with an emoji in a tinted square and a row of chips; a row of stat tiles ("10+ Publications", "95+ Citations").
- Shape worth taking: the work is titled by capability rather than project name ("Custom evaluation harnesses", "End-to-end agentic pipelines"), which tells a visitor what she can do before they read a word of detail.

### anilpervaiz.com/resume
- Why it reads generated: Geist at 100px with -4.5px tracking and the second half of the headline greyed out ("10+ years of shipping, in one page."); near-black with blue and purple radial glows, a dot-matrix world map and glowing pixel cells; a floating pill nav with an avatar "Hire me" button; a floating chat bubble; a "RESUME" pill tag; "The numbers behind it." stat block; a four-column footer. A cookie banner appears mid-scroll (left untouched).
- Shape worth taking: the CV itself as real HTML text, single column, with a monospace meta line per role (employer, place, dates) and a DOCX download beside it.

## Patterns that read as generated

Seen on the reference pages above, not theory:

- A tracked uppercase eyebrow in the accent colour above every heading, often numbered ("01. about").
- "Hello, I'm Name." next to a circular headshot with a ring or soft shadow.
- A row of pill buttons: one filled, two outlined, each with an icon (LinkedIn, Email, Resume).
- Fraunces or DM Serif Display paired with Inter or DM Sans; or Geist set huge with heavy negative tracking.
- Cream with terracotta or rose; or near-black with neon green, or with purple and blue glow.
- A headline where one word is coloured, half is greyed, or a word types itself out with a caret.
- Stat tiles: "10+", "95+", "$2M", "2,000+".
- Emoji as bullets, card icons or language flags.
- Skills as an icon grid or chip cloud grouped by category.
- A greyed logo strip of employers or clients.
- Every job and project in a bordered, rounded card; three cards per row; a card with a coloured left stripe.
- Fake code windows with traffic-light dots; grid-line or dot-matrix backgrounds.
- Content that fades in on scroll, so the page is empty until you move.
- Floating pill nav, floating chat button.
- Slogan section titles ("Let's Build Something", "The numbers behind it", "Leadership beyond the job").
- Bold keywords scattered through bullet points.

## Patterns that read as made by a person

- One typeface doing nearly all the work at two or three sizes (paco, emil, stephango, thesephist).
- Dates treated as data with a format the author chose: "2025 · 10", "09/26", "(1998-2008):", right-aligned year ranges in a gutter.
- Lists of text, not cards: a title and one line under it.
- Hairline rules between sections instead of boxes and shadows.
- A slightly tinted ground (#fffcf0, #f8f8f8, #ededed, #e4e2d7) and a warm near-black for dark mode (#1b1a19, #100f0f), never pure white or pure black.
- Colour spent almost entirely on links: one ink colour, underlined.
- A bio in first-person sentences with one hard, specific fact, not a tagline.
- One idiosyncratic device tied to the person: a table of contents with roman numerals and a version number, a short/long bio toggle, an asterism, an indented sentence.
- Counts and "see all" links instead of stat tiles.
- Pages that render instantly, with nothing animated on load.

## Two directions for the home page

### A. The ledger

- Type: Literata (Google Fonts, variable with optical sizes) for everything; headings are the same face at 22 to 26px in semibold, never a separate display face; dates and figures use Literata's tabular lining numerals.
- Palette: paper oklch(97.5% 0.008 85) warm off-white, ink oklch(22% 0.01 60), secondary grey oklch(52% 0.01 60), rules oklch(88% 0.01 80); one link colour, iron-gall blue-black oklch(40% 0.09 255), underlined at 1px with a 3px offset. Dark: ground oklch(18% 0.008 60), ink oklch(90% 0.01 85).
- Layout: a single 34em column with a 7ch left gutter that holds dates ("2024-", "2019-23") set in grey tabular figures; above it, a three-sentence bio at 20/32px; below, sections for work, case studies and writing split by hairlines, each entry a title plus one line.
- Memorable detail: the gutter figures line up from top to bottom of the page like a ledger, and the foot carries a colophon ("Set in Literata. Last revised 3 October 2026.").

### B. The tear sheet

- Type: Schibsted Grotesk (Google Fonts) for the name, statement and body; Fragment Mono (Google Fonts) at 13px only for column heads, dates and figures.
- Palette: paper oklch(98.5% 0.003 95), ink a navy-black oklch(21% 0.02 260), rules oklch(86% 0.008 260), and one ledger green oklch(48% 0.09 160) used only to mark the current role row. Dark: ground oklch(17% 0.015 260), ink oklch(93% 0.005 95).
- Layout: an asymmetric 12-column grid; the left four columns hold the name and a two-sentence statement at about 40px, fixed while the right eight columns scroll; work is a real HTML table (Year, Sector, Problem, Result) with a hairline under each row, case studies and writing as further tables. On a phone it becomes one column and each table row stacks into a short block.
- Memorable detail: the work table reads like a fund factsheet, which is the native document of the finance clients he serves, and the only colour on the page is the green marker on the row that says what he is doing now.
