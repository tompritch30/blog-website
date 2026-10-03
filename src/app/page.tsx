import type { Metadata } from "next";
import Container from "@/components/Container";
import PostList from "@/components/PostList";
import { caseStudies, intro } from "@/content/profile";
import { baseAlternates, baseOpenGraph } from "@/lib/metadata";
import { getAllPosts } from "@/lib/posts";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  alternates: { ...baseAlternates, canonical: "/" },
  openGraph: { ...baseOpenGraph, type: "website", url: "/" },
};

// Plain semantic skeleton: the look comes later from the chosen design direction (plan slices 5 to 7).
export default function Home() {
  return (
    <Container className="py-14 sm:py-20">
      <h1 className="mb-6 text-xl font-semibold tracking-tight text-fg">{site.name}</h1>
      <div className="space-y-4 leading-relaxed text-fg">
        {intro.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <section aria-labelledby="case-studies" className="mt-14">
        <h2 id="case-studies" className="mb-6 text-lg font-semibold tracking-tight text-fg">
          Case studies
        </h2>
        <div className="space-y-10">
          {caseStudies.map((study) => (
            <article key={study.slug} aria-labelledby={`case-${study.slug}`}>
              <h3 id={`case-${study.slug}`} className="font-medium text-fg">
                {study.title}
              </h3>
              <p className="mb-3 text-sm text-secondary">
                {study.where}, {study.when}
              </p>
              <dl className="space-y-2 leading-relaxed text-fg">
                <div>
                  <dt className="font-medium">Problem</dt>
                  <dd>{study.problem}</dd>
                </div>
                <div>
                  <dt className="font-medium">What I built</dt>
                  <dd>{study.built}</dd>
                </div>
                <div>
                  <dt className="font-medium">Result</dt>
                  <dd>{study.result}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="writing" className="mt-14">
        <h2 id="writing" className="mb-4 text-lg font-semibold tracking-tight text-fg">
          Writing
        </h2>
        <PostList posts={getAllPosts()} />
      </section>
    </Container>
  );
}
