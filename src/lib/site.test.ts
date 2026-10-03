import { describe, expect, it } from "vitest";
import { siteUrl } from "./site";

describe("siteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL and drops any path or trailing slash", () => {
    expect(
      siteUrl({ NEXT_PUBLIC_SITE_URL: "https://thomas.example.dev/blog/", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" }),
    ).toBe("https://thomas.example.dev");
  });

  it("falls back to the Vercel production domain, then to the local dev server", () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "blog-website.vercel.app" })).toBe("https://blog-website.vercel.app");
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "  " })).toBe("http://localhost:3000");
  });

  it("fails loudly on a malformed NEXT_PUBLIC_SITE_URL", () => {
    expect(() => siteUrl({ NEXT_PUBLIC_SITE_URL: "thomas.example.dev" })).toThrow();
  });
});
