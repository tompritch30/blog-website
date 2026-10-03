# Deploying on Vercel

Thomas runs these steps by hand. Agents working on this repo never push or deploy (see `CLAUDE.md`).

## 1. Get the branch onto GitHub

The repo's `origin` is `github.com/tompritch30/blog-website`. The local pre-push hook always refuses, so push with `--no-verify`:

```bash
git switch main
git merge --ff-only release-prep
git push --no-verify origin main
```

Vercel can deploy a private repo, so making the repo public is a separate choice:

```bash
gh repo edit tompritch30/blog-website --visibility public --accept-visibility-change-consequences
```

## 2. Create the Vercel project

1. Sign in at [vercel.com](https://vercel.com) with GitHub.
2. **Add New → Project**, then import `tompritch30/blog-website`. If it is not listed, use **Adjust GitHub App Permissions** to give Vercel access to that one repo.
3. Framework preset: **Next.js** (detected). Leave the build command (`next build`) and output settings as they are.
4. Under **Settings → Build and Deployment → Node.js Version**, choose **22.x**. `package.json` also asks for Node 20.9 or later.
5. Environment variables: none needed for the first deploy. Canonical URLs, the sitemap and the feed use Vercel's production domain (`VERCEL_PROJECT_PRODUCTION_URL`) until you set `NEXT_PUBLIC_SITE_URL`.
6. **Deploy**. Then open `/`, `/about`, `/feed.xml` and `/sitemap.xml` on the production URL.

Every push to `main` then deploys to production, and every other branch gets a preview URL.

## 3. A custom domain (optional)

1. **Settings → Domains → Add**, enter the domain, and add the DNS records Vercel shows at your registrar. With Cloudflare, set the records to **DNS only** (grey cloud) so Vercel can issue the certificate.
2. Add the `www` variant and redirect it to the bare domain (or the other way round).
3. Set `NEXT_PUBLIC_SITE_URL` to `https://<your-domain>` for **Production** in **Settings → Environment Variables**, then redeploy so canonical URLs, the sitemap, the feed and share images use it.

## 4. Replacing tompritch30.github.io

The old site lives in the `tompritch30/tompritch30.github.io` repo. Once the new site is live, the options are:

- turn the old site into a redirect: replace its `index.html` with a page that has `<link rel="canonical" href="https://<new-url>/">` and `<meta http-equiv="refresh" content="0; url=https://<new-url>/">`;
- or archive the repo and unpublish GitHub Pages under its **Settings → Pages**.

GitHub Pages cannot send a real 301, so the redirect page is the closest option. Either way, nothing here changes the old site; that is a separate step.

## 5. Analytics (optional, later)

Vercel Web Analytics needs no cookie banner for basic page views: `npm install @vercel/analytics`, add `<Analytics />` from `@vercel/analytics/next` inside `<body>` in `src/app/layout.tsx`, and turn it on under the project's **Analytics** tab.
