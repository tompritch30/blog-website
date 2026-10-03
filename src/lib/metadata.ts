import type { Metadata } from "next";
import { site } from "@/lib/site";

// Next merges metadata shallowly: a page that sets openGraph or alternates replaces the
// layout's whole object, so pages spread these bases instead of repeating the site fields.
export const baseOpenGraph = {
  siteName: site.name,
  locale: site.locale,
} satisfies Metadata["openGraph"];

export const baseAlternates = {
  types: { "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} RSS feed` }] },
} satisfies Metadata["alternates"];
