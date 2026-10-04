import type { Metadata } from "next";
import { site } from "@/lib/site";
import { writingIsLive } from "@/lib/writing";

// Next merges metadata shallowly: a page that sets openGraph or alternates replaces the
// layout's whole object, so pages spread these bases instead of repeating the site fields.
export const baseOpenGraph = {
  siteName: site.name,
  locale: site.locale,
} satisfies Metadata["openGraph"];

// The feed's <link rel="alternate"> appears only once a post is published: while nothing links to
// /writing, the head does not point readers at an empty feed either (owner, 4 Oct 2026).
export const baseAlternates: Metadata["alternates"] = writingIsLive()
  ? { types: { "application/rss+xml": [{ url: "/feed.xml", title: `${site.name} RSS feed` }] } }
  : {};
