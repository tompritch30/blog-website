import type { Metadata } from "next";
import Container from "@/components/Container";
import PostList from "@/components/PostList";
import { getAllPosts } from "@/lib/posts";
import { baseAlternates, baseOpenGraph } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { ...baseAlternates, canonical: "/" },
  openGraph: { ...baseOpenGraph, type: "website", url: "/" },
};

export default function Home() {
  return (
    <Container className="py-14 sm:py-20">
      <header className="mb-12">
        <h1 className="mb-1 text-xl font-semibold tracking-tight text-fg">{site.name}</h1>
        <p className="text-sm leading-relaxed text-secondary">{site.tagline}</p>
      </header>
      <section aria-labelledby="posts-heading">
        <h2 id="posts-heading" className="sr-only">
          Posts
        </h2>
        <PostList posts={getAllPosts()} />
      </section>
    </Container>
  );
}
