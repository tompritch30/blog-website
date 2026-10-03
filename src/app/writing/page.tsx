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
// between hairlines. Its subscribe box is left out: the feed link sits in the footer of every page.
export default function WritingPage() {
  return (
    <Container>
      <div className="page-head">
        <h1 className="display">Writing</h1>
        <p className="lead">{motto}</p>
      </div>
      <PostList posts={getAllPosts()} />
    </Container>
  );
}
