# Drafts exist only in `next dev`

Status: accepted, 3 Oct 2026

A post with `draft: true` is listed and rendered when `NODE_ENV` is `development`, and nowhere else: production builds skip it in `generateStaticParams`, the home page, the sitemap, the feed and the share images, and `dynamicParams = false` makes its URL a 404 rather than rendering it on demand.

Considered: a separate `drafts/` folder (rejected: moving a file to publish loses its history and makes links between drafts awkward); Vercel preview deployments showing drafts (rejected for now: needs an environment flag and would expose drafts on a public preview URL).

Update, 4 Oct 2026 (owner): drafts are no longer listed in `next dev` either (`/writing`, the sitemap and the feed always exclude them), so the dev server looks like the live site; a draft still renders at its own URL in dev, under a Draft banner.

Consequence: to share a draft for review, run `npm run dev` locally; there is no hosted draft preview.

Drafts are hidden from the site, not from the repo: if the repo is public, anyone can read a draft's MDX on GitHub. Keep anything that must stay private out of the repo until it is ready.
