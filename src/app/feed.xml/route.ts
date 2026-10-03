import { renderRss } from "@/lib/feed";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export const dynamic = "force-static";

export function GET() {
  const xml = renderRss({ title: site.name, description: site.description, url: site.url, posts: getAllPosts() });
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
