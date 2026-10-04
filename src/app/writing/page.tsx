import type { Metadata } from "next";
import Container from "@/components/Container";
import PostList from "@/components/PostList";
import { baseAlternates, baseOpenGraph } from "@/lib/metadata";
import { WRITING_PATH } from "@/lib/paths";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Writing",
  description: `Articles by ${site.name}, coming soon.`,
  alternates: { ...baseAlternates, canonical: WRITING_PATH },
  openGraph: { ...baseOpenGraph, type: "website", url: WRITING_PATH },
};

// Every post is a draft for now (owner, 4 Oct 2026), so a production build has nothing to list and the
// page says one plain line. Once a post is published (draft: false), the posts show between hairlines
// with a quiet RSS link under them; the head's <link rel="alternate"> and the nav's Writing link appear at the same time, in every
// page's head either way. Drafts are never listed, in `next dev` either, so dev looks like the live
// site; a draft is previewed at its own URL, under the Draft banner.
export default function WritingPage() {
  const posts = getAllPosts({ includeDrafts: false });
  return (
    <Container>
      <div className="page-head">
        <h1 className="display">Writing</h1>
      </div>
      {posts.length === 0 ? (
        <p>Articles coming soon.</p>
      ) : (
        <>
          <PostList posts={posts} />
          <p className="feed">
            <a href="/feed.xml" className="quiet-link">
              RSS
            </a>
          </p>
        </>
      )}
    </Container>
  );
}
