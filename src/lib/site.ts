type Env = Record<string, string | undefined>;

// The public origin used for canonical URLs, the sitemap, the feed and OG tags.
// NEXT_PUBLIC_SITE_URL wins (set it once a custom domain exists); on Vercel the
// production domain is the fallback; otherwise http://localhost:3000, where `npm start` serves.
export function siteUrl(env: Env = process.env): string {
  const explicit = env.NEXT_PUBLIC_SITE_URL?.trim();
  if (explicit) return new URL(explicit).origin;
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const site = {
  name: "Thomas Pritchard",
  tagline: "Founding Forward Deployed Engineer at Palindrome. I build LLM systems for clients.",
  description: "Thomas Pritchard, founding Forward Deployed Engineer at Palindrome. I put AI agents into production for law firms and wealth managers.",
  locale: "en_GB",
  url: siteUrl(),
};
