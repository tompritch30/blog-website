import type { PostMeta } from "@/lib/posts";

type Channel = { title: string; description: string; url: string; posts: PostMeta[] };

const ENTITIES: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" };

function escape(text: string): string {
  return text.replace(/[&<>"']/g, (c) => ENTITIES[c]);
}

function item(url: string, post: PostMeta): string {
  const link = `${url}/blog/${post.slug}`;
  return `<item>
<title>${escape(post.title)}</title>
<link>${link}</link>
<guid isPermaLink="true">${link}</guid>
<pubDate>${new Date(post.date).toUTCString()}</pubDate>
<description>${escape(post.description)}</description>
</item>
`;
}

export function renderRss({ title, description, url, posts }: Channel): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>${escape(title)}</title>
<link>${url}</link>
<description>${escape(description)}</description>
<language>en-gb</language>
<atom:link href="${url}/feed.xml" rel="self" type="application/rss+xml"/>
${posts.map((p) => item(url, p)).join("")}</channel>
</rss>
`;
}
