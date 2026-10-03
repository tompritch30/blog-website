# Home page directions: blind judge record (3 Oct 2026)

- **Judge:** a fresh opus55-high agent, read-only, given only the screenshots and its brief; not told either designer's direction name or anyone's preference.
- **Input:** 16 screenshots, labelled X and Y only (1440x900 and 375x812, light and dark, viewport and full page). X and Y were assigned by a coin flip (`$RANDOM % 2`); the mapping was written to a file outside the judge's folder and read only after the verdict.
- **Mapping:** X = direction A, "the ledger" (branch `site-v2-dir-a`); Y = direction B, "the tear sheet" (branch `site-v2-dir-b`, tip 2427117, kept unmerged).
- **Criteria:** the plan's list plus the owner's 3 Oct additions ("visual, not text-heavy"; "credibility within 5 seconds"), the owner's anti-slop list and the brief's slop list as pass or fail, and a ranking of five headline candidates.
- **Choice:** X (the ledger), although Y scored 66 to X's 64: the judge weighted "reads as made by a person" and the failures on the checklists. The ledger was merged in `feat(design): merge the ledger direction`.
- **Applied after the verdict:** the judge's three fixes, the graft from Y (the vertical evaluation diagram with labelled branches, and a result line in the figure column for the card without a number), and headline 1 of its ranking.

Images here are downscaled to 640px wide; the full-size shots were in the judge's temporary folder.

## Verdict (verbatim)

Both pages fall short of the bar, but in different ways. X is the better base to fix, so it is my pick. Y scores two points higher overall, but it fails more of the two checklists and its weaknesses come from its font and layout system rather than where content sits. I read all 16 screenshots. The tool shrank the 375 full-page shots to roughly 135–160px wide, so I scored phone layout mainly from the 375 viewport shots.

| # | Criterion | X | Y |
|---|---|---|---|
| 1 | First impression | 6 | 7 |
| 2 | Made by a person | 8 | 6 |
| 3 | Typography | 8 | 6 |
| 4 | Restraint | 6 | 6 |
| 5 | Visual, not text-heavy | 4 | 6 |
| 6 | Credibility in 5 s | 4 | 8 |
| 7 | Content legibility in 30 s | 7 | 8 |
| 8 | Phone (375) | 6 | 8 |
| 9 | Dark theme | 7 | 6 |
| 10 | Memorability | 8 | 5 |
| | **Total** | **64** | **66** |

**Pass/fail, X**
- Owner's list: passes everything except one item. Fail, copy not hype-free: Writing section, "Not the demo. The real workflow:" is a copywriter's hook.
- Brief's list: passes everything.
- Dark-theme defect: Research section. The ForestVO chart is a pure white block on the near-black page.

**Pass/fail, Y**
- Owner's list: Fail, small grey filler text under headings: the column headers "Dates / Where / Role" under "Experience and education" and "When, where / Work / Result" under "Selected work" label things that are already obvious; the same under "Writing" ("Date / Post"). Fail, copy not hype-free: the same "Not the demo. The real workflow:" line. Everything else passes.
- Brief's list: passes everything.
- Typography defect: "Dean's List" renders as "Dearís" because the apostrophe collides with the n; "LinkedIn" and "Distinction" look like they have a capital I.
- Layout defect: the left column is empty for about 2,400px below the hero.
- Dark-theme defect: the chart is a light grey block on a blue-black theme; the dark palette is the stock "dev dark".

**Pick: X.** The owner's bar is "does not look generated". X's serif type, date gutter and colophon read as one person's page. Y's grotesk plus mono dates plus green accent is a familiar portfolio default.

**X's three most important fixes, worst first**
1. Nothing credible above the fold at 1440: only the headline, prose and two table rows, no number and no outcome. Move "Selected work" above "Work and study" so the "1 hour" result is in the first screen. Cut the third intro paragraph ("Before that I was a data scientist at Fletchers…"), because the table right below says the same thing.
2. Results are said twice: in the cards for 1 hour, 67% and 10%, the big number and the bold "Result." sentence carry the same fact. Delete the "Result." line wherever a number stands beside it, and keep it only on the evaluation card, which has no number.
3. The phone measure is too narrow: the date gutter takes about 85px, which leaves lines of about 28 characters. Below 600px, put each date as a small line above its block and let the text use the full width. Give the research chart a dark-mode version, or at least a paper-tone frame, instead of the white rectangle.

**What to take from Y:** its evaluation diagram. Y's version runs vertically, labels the fail and pass branches, and draws "Regression stopped" as a dashed box. X's horizontal version leaves "Regression stopped" floating with no branch condition. Also put Y's "Stopped AI report regressions reaching clients." in X's right-hand column so all four cards share one layout.

**Headline ranking**
1. "I put AI agents into production for law firms and wealth managers." It names the real buyers with a plain verb, sounds true, and matches what the page then shows.
2. "A week of report writing, now an hour. I build production AI for finance and law." It has the strongest evidence, but the opening fragment is a copywriting device and it takes two sentences to land.
3. "I build production AI for law and finance." It is plain and short, but "production AI" is generic and names no buyer or result.
4. "Agents that draft advice reports, check calls and win back lost leads. In production, for law and finance." It is too long, the list of three reads like a feature list, and "win back lost leads" is sales language.
5. "AI agents in production for wealth managers and law firms." It has no subject or verb, so it reads as a SaaS product tagline, not a person.
