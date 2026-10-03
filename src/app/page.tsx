import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ExternalLink from "@/components/ExternalLink";
import EvalGateDiagram from "@/components/home/EvalGateDiagram";
import OrgMark, { organisation } from "@/components/home/OrgMark";
import { caseStudies, cv, headline, intro, links, paperFigure } from "@/content/profile";
import { formatShortDate, yearSpan } from "@/lib/dates";
import { baseAlternates, baseOpenGraph } from "@/lib/metadata";
import { postPath } from "@/lib/paths";
import { getAllPosts } from "@/lib/posts";

export const metadata: Metadata = {
  alternates: { ...baseAlternates, canonical: "/" },
  openGraph: { ...baseOpenGraph, type: "website", url: "/" },
};

// The ledger: dates down the left column, particulars in the middle, the figure on the right.

// An intro sentence that names an employer gets that role's years in the date column.
function introYears(sentence: string): string {
  const role = cv.roles.find((r) => sentence.includes(r.company));
  return role ? yearSpan(role.dates) : "";
}

type RecordLine = { years: string; org: string; what: string; note: string };

// Work and study in date order, newest first, each beside its organisation's mark.
function recordLines(): RecordLine[] {
  const work = cv.roles.map((r) => ({
    years: yearSpan(r.dates),
    org: r.company,
    what: r.title,
    note: r.descriptor,
    start: Number(r.dates.match(/\d{4}/)?.[0] ?? 0),
  }));
  const study = cv.education.map((e) => ({
    years: e.year,
    org: e.institution,
    what: e.credential,
    note: e.note ?? "",
    start: Number(e.year),
  }));
  return [...work, ...study].sort((a, b) => b.start - a.start).map(({ years, org, what, note }) => ({ years, org, what, note }));
}

const where = (name: string) => organisation(name).short;

export default function Home() {
  const posts = getAllPosts().slice(0, 3);
  const paper = cv.publication;

  return (
    <div className="page">
      {/* The headline stands above the ruled page; the margin rule starts with the first dated line. */}
      <h1 className="hero headline">{headline}</h1>
      <div className="ledger">
        <div className="intro">
          {intro.map((sentence) => (
            <div key={sentence} className="row">
              <p className="date">{introYears(sentence)}</p>
              <p className="c-main">{sentence}</p>
            </div>
          ))}
        </div>

        <section className="section" aria-labelledby="record">
          <div className="row section-head">
            <h2 id="record" className="c-wide section-title">
              Work and study
            </h2>
          </div>
          <ol>
            {recordLines().map((line) => (
              <li key={`${line.org}-${line.what}`} className="row entry entry-tight">
                <p className="date">{line.years}</p>
                <div className="c-main record">
                  <OrgMark name={line.org} />
                  <p>
                    <span className="role">{line.what}</span>
                    {line.note ? <span className="role-note">{line.note}</span> : null}
                  </p>
                </div>
              </li>
            ))}
          </ol>
          <div className="row">
            <p className="c-main more">
              <Link href="/cv" className="link">
                Full CV
              </Link>
              <ExternalLink href={links.linkedin}>LinkedIn</ExternalLink>
            </p>
          </div>
        </section>

        <section className="section" aria-labelledby="work">
          <div className="row section-head">
            <h2 id="work" className="c-wide section-title">
              Selected work
            </h2>
          </div>
          {caseStudies.map((study) => (
            <article key={study.slug} className="row case" aria-labelledby={`case-${study.slug}`}>
              <p className="date">
                {study.when}
                <span className="date-where">{where(study.where)}</span>
              </p>
              <h3 id={`case-${study.slug}`} className="case-title">
                {study.title}
              </h3>
              {study.figure ? (
                <p className="figure">
                  <span className="figure-value">{study.figure.value}</span>
                  <span className="figure-label">{study.figure.label}</span>
                </p>
              ) : null}
              <div className="case-body">
                <p>
                  <span className="runin">Problem.</span> {study.problem}
                </p>
                <p>
                  <span className="runin">What I built.</span> {study.built}
                </p>
                <p>
                  <span className="runin">Result.</span> {study.result}
                </p>
              </div>
              {study.slug === "release-evals" ? <EvalGateDiagram /> : null}
            </article>
          ))}
        </section>

        <section className="section" aria-labelledby="research">
          <div className="row section-head">
            <h2 id="research" className="c-wide section-title">
              Research
            </h2>
          </div>
          <div className="row paper">
            <p className="date">{paper.year}</p>
            <div className="c-main record">
              <OrgMark name="IEEE Robotics and Automation Letters" />
              <p>
                <ExternalLink href={paper.url}>{paper.title}</ExternalLink>
                <span className="role-note">{paper.note}</span>
              </p>
            </div>
          </div>
          <figure className="row paper-figure">
            <div className="c-main plate">
              <Image
                src={paperFigure.src}
                width={paperFigure.width}
                height={paperFigure.height}
                alt={paperFigure.alt}
                loading="eager"
                sizes="(min-width: 64rem) 30rem, calc(100vw - 6rem)"
              />
            </div>
            <figcaption className="c-main credit">{paperFigure.credit}</figcaption>
          </figure>
        </section>

        <section className="section" aria-labelledby="writing">
          <div className="row section-head">
            <h2 id="writing" className="c-wide section-title">
              Writing
            </h2>
          </div>
          <ol>
            {posts.map((post) => (
              <li key={post.slug} className="row entry">
                <p className="date">
                  <time dateTime={post.date}>{formatShortDate(post.date)}</time>
                </p>
                <div className="c-main">
                  <p className="post-title">
                    <Link href={postPath(post.slug)} className="link">
                      {post.title}
                    </Link>
                  </p>
                  <p className="post-description">{post.description}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
