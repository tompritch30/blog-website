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
// with a quiet RSS link under them; feed readers find the feed from the <link rel="alternate"> in every
// page's head either way. In `next dev` drafts count, so the list shows there for previewing.
export default function WritingPage() {
  const posts = getAllPosts();
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
