# Deployment & Domain Setup

## 1. GitHub

Push this repo to GitHub first — Vercel deploys from it.

```bash
git init
git add .
git commit -m "init"
gh repo create your-blog --private --push --source=.
```

Or: create the repo on github.com, then:

```bash
git remote add origin git@github.com:yourusername/your-blog.git
git push -u origin main
```

---

## 2. Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import your GitHub repo
3. Framework preset auto-detects as **Next.js** — leave defaults
4. Click **Deploy**

That's it. Every `git push` to `main` auto-deploys.

**Preview deployments:** every PR gets its own preview URL automatically. Useful for checking posts before merging.

**Environment variables:** if you ever add analytics or other integrations requiring secrets, add them in Vercel → Project → Settings → Environment Variables. They're injected at build time.

---

## 3. Custom domain via Cloudflare

### Buy the domain

Use [Cloudflare Registrar](https://www.cloudflare.com/products/registrar/) — at-cost pricing (~£8–12/year for a `.com`). No markup, WHOIS privacy included free.

1. Create a Cloudflare account if you don't have one
2. Search for your domain → buy it
3. It's automatically added to your Cloudflare account

### Point it at Vercel

In **Vercel → Project → Settings → Domains**:

1. Click **Add**
2. Type your domain (e.g. `yourdomain.com`) → **Add**
3. Also add `www.yourdomain.com` → configure as a redirect to root

Vercel will show you the DNS records you need:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` |
| CNAME | `www` | `cname.vercel-dns.com` |

In **Cloudflare → yourdomain.com → DNS**:

1. Delete any existing A records for `@`
2. Add the A record Vercel gave you
3. Add the CNAME for `www`
4. Leave proxy status as **DNS only** (grey cloud) for the A record — Vercel handles SSL

SSL certificate issues: Vercel provisions Let's Encrypt automatically once DNS propagates. Usually takes <5 minutes, occasionally up to an hour.

---

## 4. Analytics (optional, later)

**Vercel Analytics** — one line to add, no cookie banner needed for basic metrics:

```bash
npm install @vercel/analytics
```

In `src/app/layout.tsx`:
```tsx
import { Analytics } from "@vercel/analytics/react";
// add inside <body>:
<Analytics />
```

Enable in Vercel → Project → Analytics tab.

**Alternatives:** Plausible (€9/mo, EU-hosted, fully private), Fathom (similar). Both are drop-in scripts, no GDPR headaches.

---

## 5. Sitemap (optional, good for SEO)

Add `src/app/sitemap.ts`:

```ts
import { getAllPosts } from "@/lib/posts";
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts();
  const base = "https://yourdomain.com";

  return [
    { url: base, lastModified: new Date() },
    { url: `${base}/blog`, lastModified: new Date() },
    ...posts.map((p) => ({
      url: `${base}/blog/${p.slug}`,
      lastModified: new Date(p.date),
    })),
  ];
}
```

Next.js serves it at `/sitemap.xml` automatically.

---

## 6. OG images (optional, nice to have)

Next.js has built-in OG image generation via `ImageResponse`. Add `src/app/blog/[slug]/opengraph-image.tsx` to auto-generate share images per post. Docs: [nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image](https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image).
