import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import Mdx from "@/components/Mdx";
import { formatDate } from "@/lib/dates";
import { draftBanner } from "@/lib/draft";
import { baseAlternates, baseOpenGraph } from "@/lib/metadata";
import { postPath } from "@/lib/paths";
import { getAllPosts, getPost } from "@/lib/posts";

// Only slugs from generateStaticParams exist; anything else, drafts included, is a 404.
export const dynamicParams = false;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  const { slug, title, description, date } = post.meta;
  return {
    title,
    description,
    alternates: { ...baseAlternates, canonical: postPath(slug) },
    openGraph: {
      ...baseOpenGraph,
      type: "article",
      url: postPath(slug),
      title,
      description,
      publishedTime: date,
    },
  };
}

// A post in one centred reading column, as in the reference: the date and reading time, the title, a
// hairline, then the text. The way back to the list is the nav's Writing link, marked current here.
export default async function PostPage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const { meta, content } = post;
  const banner = draftBanner(meta);

  return (
    <Container>
      {banner ? <p className="draft-banner">{banner}</p> : null}
      <article className="article">
        <div className="article-head">
          <p className="post-meta">
            <time dateTime={meta.date}>{formatDate(meta.date)}</time> · {meta.readingTime}
          </p>
          <h1 className="article-title">{meta.title}</h1>
        </div>
        <Mdx source={content} />
      </article>
    </Container>
  );
}
