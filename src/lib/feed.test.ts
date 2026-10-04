import { describe, expect, it } from "vitest";
import { renderRss } from "./feed";
import type { PostMeta } from "./posts";

const post = (over: Partial<PostMeta>): PostMeta => ({
  slug: "a-post",
  title: "A post",
  date: "2026-03-30",
  description: "About a post.",
  draft: false,
  readingTime: "1 min read",
  ...over,
});

describe("renderRss", () => {
  it("renders an RSS 2.0 channel with one item per post, escaping XML", () => {
    const xml = renderRss({
      title: "Casey Example",
      description: "Notes & sums",
      url: "https://casey.example",
      posts: [post({ slug: "tea-vs-coffee", title: "Tea <vs> coffee", description: 'Say "when" & stop' })],
    });
    expect(xml).toBe(
      `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
<title>Casey Example</title>
<link>https://casey.example</link>
<description>Notes &amp; sums</description>
<language>en-gb</language>
<atom:link href="https://casey.example/feed.xml" rel="self" type="application/rss+xml"/>
<item>
<title>Tea &lt;vs&gt; coffee</title>
<link>https://casey.example/writing/tea-vs-coffee</link>
<guid isPermaLink="true">https://casey.example/writing/tea-vs-coffee</guid>
<pubDate>Mon, 30 Mar 2026 00:00:00 GMT</pubDate>
<description>Say &quot;when&quot; &amp; stop</description>
</item>
</channel>
</rss>
`,
    );
  });

  it("renders an empty channel when there are no posts", () => {
    const xml = renderRss({ title: "T", description: "D", url: "https://t.example", posts: [] });
    expect(xml).not.toContain("<item>");
    expect(xml).toContain("</channel>");
  });
});
