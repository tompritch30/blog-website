import type { Metadata } from "next";
import Container from "@/components/Container";
import PostList from "@/components/PostList";
import { motto } from "@/content/profile";
import { baseAlternates, baseOpenGraph } from "@/lib/metadata";
import { WRITING_PATH } from "@/lib/paths";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "Writing",
  description: `Posts by ${site.name} on building LLM systems.`,
  alternates: { ...baseAlternates, canonical: WRITING_PATH },
  openGraph: { ...baseOpenGraph, type: "website", url: WRITING_PATH },
};

// The reference's writing page: a large title, one line on what the posts are about, then the posts
// between hairlines. Its subscribe box is left out; a quiet RSS link under the list is the one way to
// follow by hand, and feed readers find the feed from the <link rel="alternate"> in every page's head.
export default function WritingPage() {
  return (
    <Container>
      <div className="page-head">
        <h1 className="display">Writing</h1>
        <p className="lead">{motto}</p>
      </div>
      <PostList posts={getAllPosts()} />
      <p className="feed">
        <a href="/feed.xml" className="quiet-link">
          RSS
        </a>
      </p>
    </Container>
  );
}
