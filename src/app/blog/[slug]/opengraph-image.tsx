import { notFound } from "next/navigation";
import { ogImage, ogSize } from "@/lib/og";
import { getAllPosts, getPost } from "@/lib/posts";
import { site } from "@/lib/site";

export const alt = `A post by ${site.name}`;
export const size = ogSize;
export const contentType = "image/png";

// Rendered at build time like the posts, so the server never reads the content folder.
export const dynamicParams = false;

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  return ogImage(post.meta.title, site.name);
}
