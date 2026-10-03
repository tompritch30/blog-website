import type { Metadata } from "next";
import Container from "@/components/Container";
import PostList from "@/components/PostList";
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

export default function WritingPage() {
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="mb-10 text-xl font-semibold tracking-tight text-fg">Writing</h1>
      <PostList posts={getAllPosts()} />
    </Container>
  );
}
