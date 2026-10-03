# Site content sources

Status: accepted, 3 Oct 2026. Supersedes item 2 of ADR 0002.

The site grows from a blog into a personal site: an intro, case studies, a web CV, an About page and the writing. ADR 0002 allowed only three facts. Thomas set the wider sources for this version himself.

1. **Sources.** Facts about Thomas come only from his current CV, his own achievements record and a short list of extras he approved: the ForestVO paper (IEEE RA-L 2025, co-first author), the Imperial MSc in Computer Science (Distinction), the Imperial BSc in Biological Sciences (First, Dean's List), Airbnb Superhost (ongoing), Wimbledon ball boy (2015) and volunteering in Malawi and Cambodia. Nothing else is added without his word.
2. **Clients are described, never named.** "Two wealth managers across 4 countries", not a firm's name. Names that his CV carries but the site does not are offered to him privately, not committed.
3. **Employer money figures stay out by default.** Revenue, savings, deal values and business-case figures belong to his employers. The site uses outcome measures instead (time saved, percentages, volumes). He clears any money figure line by line; the slop lint fails on a currency figure in `src/content` that is not on its allowlist, so one cannot slip in.
4. **No contact details** beyond the GitHub and LinkedIn profiles.

Why: a public repo keeps its history, and ADR 0002 showed what rewriting it costs. A figure added later costs one commit; a figure removed later costs a history rewrite.
