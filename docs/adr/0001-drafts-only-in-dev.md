# Drafts exist only in `next dev`

Status: accepted, 3 Oct 2026

A post with `draft: true` is listed and rendered when `NODE_ENV` is `development`, and nowhere else: production builds skip it in `generateStaticParams`, the home page, the sitemap, the feed and the share images, and `dynamicParams = false` makes its URL a 404 rather than rendering it on demand.

Considered: a separate `drafts/` folder (rejected: moving a file to publish loses its history and makes links between drafts awkward); Vercel preview deployments showing drafts (rejected for now: needs an environment flag and would expose drafts on a public preview URL).

Consequence: to share a draft for review, run `npm run dev` locally; there is no hosted draft preview.
