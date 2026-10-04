import { getAllPosts } from "@/lib/posts";

// Whether any post is published. Until one is (owner, 4 Oct 2026), nothing links to /writing: the nav
// has no Writing link and the head no feed link, in `next dev` too. Publishing the first post brings
// both back with no code change.
export function writingIsLive(options: { dir?: string } = {}): boolean {
  return getAllPosts({ ...options, includeDrafts: false }).length > 0;
}
