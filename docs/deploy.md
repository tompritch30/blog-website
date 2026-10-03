# Deploying on Vercel

Thomas runs these steps by hand. Agents working on this repo never push or deploy (see `CLAUDE.md`).

## 1. Get the branch onto GitHub

The private repo `tompritch30/blog-website` holds the original commit, which carries a personal email address and text that must not go public (ADR 0002). Keep it private under a new name and publish the clean `release-prep` branch as a new public repo with the original name. The local pre-push hook always refuses, so push with `--no-verify`:

```bash
cd ~/dev/blog-website
git switch release-prep
scripts/ci.sh
gh repo rename blog-website-private-old --repo tompritch30/blog-website --yes
gh repo create tompritch30/blog-website --public --description "Thomas Pritchard's personal site"
git push --no-verify origin release-prep:main
```

`origin` keeps pointing at `github.com/tompritch30/blog-website`, which is now the new public repo. After the push, `git branch -f main release-prep` makes the local `main` match if you want it to.

## 2. Create the Vercel project

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project**, then import `tompritch30/blog-website`. If it is not listed, use **Adjust GitHub App Permissions** to give Vercel access to that one repo.
3. Framework preset: **Next.js** (detected). Leave the build command (`next build`) and output settings as they are.
4. Node version: `package.json` sets `"engines": { "node": "22.x" }`, and Vercel uses that over the dashboard setting. To change it, edit `engines` (and `.nvmrc`), not the dashboard.
5. Environment variables: none needed for the first deploy. Canonical URLs, the sitemap and the feed use Vercel's production domain (`VERCEL_PROJECT_PRODUCTION_URL`) until you set `NEXT_PUBLIC_SITE_URL`.
6. **Deploy**. Then open `/`, `/about`, `/feed.xml` and `/sitemap.xml` on the production URL.

Every push to `main` then deploys to production, and every other branch gets a preview URL.

## 3. A custom domain (optional)

1. **Settings → Domains → Add**, enter the domain, and add the DNS records Vercel shows at your registrar. With Cloudflare, set the records to **DNS only** (grey cloud) so Vercel can issue the certificate.
2. Add the `www` variant and redirect it to the bare domain (or the other way round).
3. Set `NEXT_PUBLIC_SITE_URL` to `https://<your-domain>` for **Production** in **Settings → Environment Variables**, then redeploy so canonical URLs, the sitemap, the feed and share images use it.

## 4. The old GitHub Pages site

Already handled: the old `tompritch30.github.io` repo is renamed `old-test-site`, so it no longer serves that address.

## 5. Analytics (optional, later)

Vercel Web Analytics needs no cookie banner for basic page views: `npm install @vercel/analytics`, add `<Analytics />` from `@vercel/analytics/next` inside `<body>` in `src/app/layout.tsx`, and turn it on under the project's **Analytics** tab.
