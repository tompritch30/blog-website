import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import Mdx from "@/components/Mdx";
import { formatDate } from "@/lib/dates";
import { baseAlternates, baseOpenGraph } from "@/lib/metadata";
import { postPath, WRITING_PATH } from "@/lib/paths";
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

// A post in one centred reading column, as in the reference: a way back to the list, the date and
// reading time, the title, a hairline, then the text.
export default async function PostPage({ params }: Props) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const { meta, content } = post;

  return (
    <Container>
      <article className="article">
        <Link href={WRITING_PATH} className="back">
          <span aria-hidden="true">{"← "}</span>All writing
        </Link>
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
