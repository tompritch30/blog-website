import type { Metadata } from "next";
import Image from "next/image";
import { Fragment } from "react";
import ExternalLink from "@/components/ExternalLink";
import EvalGateDiagram from "@/components/home/EvalGateDiagram";
import OrgMark from "@/components/home/OrgMark";
import { aboutShort, caseStudies, cv, headline, intro, links, paperFigure, portrait, type CaseStudy } from "@/content/profile";
import { careerEntries, educationRows } from "@/lib/career";
import { baseAlternates, baseOpenGraph } from "@/lib/metadata";

export const metadata: Metadata = {
  alternates: { ...baseAlternates, canonical: "/" },
  openGraph: { ...baseOpenGraph, type: "website", url: "/" },
};

// The kb layout, in the reference's order: a two-column hero (who he is, then his photo), About with a
// figure beside it, Work as a timeline of roles with their case studies, Outside work, Education and
// research, and Skills. While every post is a draft (owner, 4 Oct 2026) there is no Writing section and
// no line about writing; /writing says articles are coming. Each place is linked once on the page (owner review, 4 Oct 2026): the
// nav carries Writing and About, the hero carries LinkedIn and GitHub, and the paper is linked from
// its row in Education and research. There is no in-page section index.

function Study({ study }: { study: CaseStudy }) {
  return (
    <li className="study" aria-labelledby={`case-${study.slug}`}>
      <h4 id={`case-${study.slug}`} className="study-title">
        {study.title}
      </h4>
      {study.figure ? (
        <p className="figure">
          <span className="figure-value">{study.figure.value}</span>
          <span className="figure-label">{study.figure.label}</span>
        </p>
      ) : null}
      <div className="study-body">
        <p>
          <span className="runin">Problem.</span> {study.problem}
        </p>
        <p>
          <span className="runin">What I built.</span> {study.built}
        </p>
        {/* Where a number stands beside the account, it already says the result. */}
        {study.figure ? null : (
          <p>
            <span className="runin">Result.</span> {study.result}
          </p>
        )}
      </div>
      {study.slug === "release-evals" ? <EvalGateDiagram /> : null}
    </li>
  );
}

export default function Home() {
  const paper = cv.publication;

  return (
    <>
      <section className="page hero" aria-labelledby="headline">
        <div>
          <h1 id="headline" className="display">
            {headline}
          </h1>
          <p className="lead">
            {intro[0]} {intro[1]}
          </p>
          <p className="link-row">
            <ExternalLink href={links.linkedin}>LinkedIn</ExternalLink>
            <ExternalLink href={links.github}>GitHub</ExternalLink>
          </p>
        </div>
        <div className="hero-portrait">
          <div className="portrait">
            <Image src={portrait.src} width={portrait.width} height={portrait.height} alt={portrait.alt} priority sizes="(min-width: 48rem) 15rem, 8rem" />
          </div>
        </div>
      </section>

      <section id="about" className="page section" aria-labelledby="about-title">
        <h2 id="about-title" className="section-title">
          About
        </h2>
        <div className="about">
          <div className="about-text">
            <p>{intro[2]}</p>
            {aboutShort.map((paragraph, i) => (
              <p key={i}>
                {paragraph.map((part, j) =>
                  typeof part === "string" ? (
                    <Fragment key={j}>{part}</Fragment>
                  ) : (
                    <ExternalLink key={j} href={part.href}>
                      {part.text}
                    </ExternalLink>
                  ),
                )}
              </p>
            ))}
          </div>
          <figure>
            <div className="plate">
              <Image src={paperFigure.src} width={paperFigure.width} height={paperFigure.height} alt={paperFigure.alt} sizes="(min-width: 64rem) 20rem, 100vw" />
            </div>
            <figcaption className="caption">
              The camera path ForestVO estimated, against the ground truth, in metres. {paperFigure.credit}
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="work" className="page section" aria-labelledby="work-title">
        <h2 id="work-title" className="section-title">
          Work
        </h2>
        <ol className="timeline">
          {careerEntries(cv.roles, caseStudies).map(({ id, role, studies }) => (
            <li key={id} className="tl-entry">
              <div className="tl-mark">
                <OrgMark name={role.company} />
              </div>
              <div>
                <div className="role-head">
                  <h3 id={id} className="role-title">
                    {role.title}
                  </h3>
                  <p className="dates">{role.dates}</p>
                </div>
                <p className="role-where">{role.descriptor}</p>
                {studies.length > 0 ? (
                  <ol className="studies">
                    {studies.map((study) => (
                      <Study key={study.slug} study={study} />
                    ))}
                  </ol>
                ) : (
                  <ul className="bullets">
                    {role.bullets.map((b) => (
                      <li key={b}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section id="outside" className="page section" aria-labelledby="outside-title">
        <h2 id="outside-title" className="section-title">
          Outside work
        </h2>
        <ul className="pairs">
          {cv.elsewhere.map(({ head, note }) => (
            <li key={head}>
              <span className="pair-head">{head}</span>
              {note ? <span className="note">{note}</span> : null}
            </li>
          ))}
        </ul>
      </section>

      <section id="education" className="page section" aria-labelledby="education-title">
        <h2 id="education-title" className="section-title">
          Education and research
        </h2>
        <div className="rows">
          {educationRows(cv.education).map(({ key, institution, year, degree }) => (
            <div key={key}>
              <div>
                <h3 className="row-title">{institution}</h3>
                <p className="row-sub dates">{year}</p>
              </div>
              <p className="row-items">
                <span>
                  <strong>{degree.credential}</strong>
                  {degree.note ? <span className="note">{degree.note}</span> : null}
                </span>
              </p>
            </div>
          ))}
          <div>
            <div>
              <h3 className="row-title">{paper.venue}</h3>
              <p className="row-sub dates">{paper.year}</p>
            </div>
            <p className="row-items">
              <span>
                <ExternalLink href={paper.url}>{paper.title}</ExternalLink>
                <span className="note">{paper.note}</span>
              </span>
            </p>
          </div>
        </div>
      </section>

      <section id="skills" className="page section" aria-labelledby="skills-title">
        <h2 id="skills-title" className="section-title">
          Skills
        </h2>
        <dl className="rows">
          {cv.skills.map((group) => (
            <div key={group.label}>
              <dt className="row-title">{group.label}</dt>
              <dd>{group.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

    </>
  );
}
