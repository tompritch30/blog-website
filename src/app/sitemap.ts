import type { MetadataRoute } from "next";
import { postPath, WRITING_PATH } from "@/lib/paths";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const posts = getAllPosts({ includeDrafts: false });
  return [
    { url: site.url, lastModified: posts[0]?.date },
    { url: `${site.url}${WRITING_PATH}`, lastModified: posts[0]?.date },
    { url: `${site.url}/about` },
    ...posts.map((p) => ({ url: `${site.url}${postPath(p.slug)}`, lastModified: p.date })),
  ];
}
