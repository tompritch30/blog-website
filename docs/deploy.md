# Going live on thomaspritchard.dev

Thomas runs these steps by hand, in this order. Agents working on this repo never push or deploy (see `CLAUDE.md`). The path is fixed: the domain from Cloudflare Registrar, the site on Vercel's free Hobby plan.

1. **Buy the domain.** In the Cloudflare dashboard, **Domain Registration → Register Domains**, buy `thomaspritchard.dev`. Cloudflare then runs its DNS; leave the zone empty for now.

2. **Push the site to a new public repo.** The private repo `tompritch30/blog-website` holds an old commit that must not go public (ADR 0002), so it is kept private under a new name and `site-v2-kb` becomes `main` of a new public repo. The local pre-push hook refuses every push by design, hence `--no-verify`:

   ```bash
   cd ~/dev/blog-website-kb && scripts/ci.sh   && gh repo rename blog-website-private-old --repo tompritch30/blog-website --yes   && gh repo create tompritch30/blog-website --public --description "Thomas Pritchard's personal site"   && git push --no-verify origin site-v2-kb:main
   ```

   Push only `site-v2-kb`. The other local branches still carry wording that must stay private.

3. **Import it into Vercel, with the site URL set before the first deploy.** At [vercel.com/new](https://vercel.com/new) (sign in with GitHub), import `tompritch30/blog-website`. If it is not listed, use **Adjust GitHub App Permissions** to give Vercel that one repo. The framework is detected as Next.js; leave the build settings alone (`package.json` pins Node 22). Before pressing **Deploy**, open **Environment Variables** and add `NEXT_PUBLIC_SITE_URL` = `https://thomaspritchard.dev` for **Production**. Canonical URLs, the sitemap, the feed and the share images are built with it, so it must be there for the first build. Then **Deploy**.

4. **Add the domain in Vercel.** Project **Settings → Domains → Add** `thomaspritchard.dev`, then add `www.thomaspritchard.dev` and choose to redirect it to `thomaspritchard.dev` (permanent, 308). Vercel then lists the DNS records each name needs.

5. **Create those records in Cloudflare, DNS only.** In Cloudflare, **DNS → Records → Add record**, enter exactly what Vercel shows (usually an `A` record for `thomaspritchard.dev` and a `CNAME` for `www`). Set each record's proxy status to **DNS only** (grey cloud), so Vercel can issue the HTTPS certificate and serve the site. Back in Vercel, both domains turn to **Valid Configuration** within minutes. `.dev` sites only load over HTTPS, so wait for the certificate before testing.

6. **Check the www redirect.** `curl -sI https://www.thomaspritchard.dev` should answer `308` with `location: https://thomaspritchard.dev/`.

7. **Verify the live site.**

   ```bash
   for p in / /about /writing /feed.xml /sitemap.xml /robots.txt; do curl -s -o /dev/null -w "%{http_code} $p\n" "https://thomaspritchard.dev$p"; done
   curl -sI https://thomaspritchard.dev/cv | grep -i -E "^HTTP|^location"     # 308 to /
   curl -s https://thomaspritchard.dev/sitemap.xml                            # URLs start https://thomaspritchard.dev
   curl -s https://thomaspritchard.dev/ | grep -o '<link rel="canonical"[^>]*>'
   ```

   Every page answers `200`; the sitemap and the canonical link use `https://thomaspritchard.dev`. Open the home page on a phone and press the pixel invader once.

After this, every push to `main` deploys to production by itself, and other branches get preview URLs. Writing a post: [writing-a-post.md](writing-a-post.md).

## Later, optional

- **Analytics:** Vercel Web Analytics needs no cookie banner for basic page views: `npm install @vercel/analytics`, add `<Analytics />` from `@vercel/analytics/next` inside `<body>` in `src/app/layout.tsx`, and turn it on in the project's **Analytics** tab.
- **The old GitHub Pages site** needs nothing: its repo is renamed `old-test-site`, so it no longer serves `tompritch30.github.io`.
