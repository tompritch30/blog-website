import type { Metadata } from "next";
import { Charis_SIL } from "next/font/google";
import { Fragment } from "react";
import ExternalLink from "@/components/ExternalLink";
import { cv, links } from "@/content/profile";
import { careerEntries, educationRows } from "@/lib/career";
import { displayUrl, educationLine, elsewhereLine } from "@/lib/cv";
import { baseAlternates, baseOpenGraph } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "CV",
  description: `Work history, education and skills of ${site.name}.`,
  alternates: { ...baseAlternates, canonical: "/cv" },
  openGraph: { ...baseOpenGraph, type: "website", url: "/cv" },
};

// Charis SIL (SIL Open Font License 1.1), the face his PDF CV is set in, loaded on this page only.
const charis = Charis_SIL({
  variable: "--font-charis",
  subsets: ["latin"],
  weight: ["400", "700"],
  style: ["normal", "italic"],
  display: "swap",
});

// The web CV laid out like his PDF CV (owner review, 4 Oct 2026): a US Letter sheet with the name, a
// line of profile links, then Experience, Education, Publication, Skills and Elsewhere, each under a
// bold heading with a rule; "Title, Company" in bold with the dates to the right, the descriptor
// under it, bullets that run to two lines, and skills as label and items in two columns. On screen
// it is a paper sheet in both themes; on paper (globals.css, @media print) the site's header drops
// away and the sheet's margins become the page's. The content is the public-safe `cv` in
// src/content/profile.ts: no phone, email or address, clients described, no employer money figures.
export default function CvPage() {
  const { roles, education, publication, skills, elsewhere } = cv;
  return (
    <div className={`page cv-page ${charis.variable}`}>
      <article className="cv-sheet" aria-labelledby="cv-name">
        <div className="cv-head">
          <h1 id="cv-name" className="cv-name">
            {site.name}
          </h1>
          <p className="cv-contact">
            <ExternalLink href={links.github}>{displayUrl(links.github)}</ExternalLink>
            <span className="cv-sep" aria-hidden="true">
              |
            </span>
            <ExternalLink href={links.linkedin}>{displayUrl(links.linkedin)}</ExternalLink>
          </p>
        </div>

        <section className="cv-section" aria-labelledby="experience">
          <h2 id="experience" className="cv-heading">
            Experience
          </h2>
          {careerEntries(roles, []).map(({ id, role }) => (
            <div key={id} className="cv-role">
              <div className="cv-role-head">
                <h3 id={id} className="cv-role-title">
                  {role.title}, {role.company}
                </h3>
                <p className="cv-dates">{role.dates}</p>
              </div>
              <p className="cv-descriptor">{role.descriptor}</p>
              <ul className="cv-bullets">
                {role.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </section>

        <section className="cv-section" aria-labelledby="education">
          <h2 id="education" className="cv-heading">
            Education
          </h2>
          {educationRows(education).map(({ key, year, degree }) => {
            const line = educationLine(degree);
            return (
              <div key={key} className="cv-line">
                <p>
                  <strong>{line.institution}</strong>, {line.rest}
                </p>
                <p className="cv-dates">{year}</p>
              </div>
            );
          })}
        </section>

        <section className="cv-section" aria-labelledby="publication">
          <h2 id="publication" className="cv-heading">
            Publication
          </h2>
          <p>
            <ExternalLink href={publication.url}>{publication.title}</ExternalLink>. {publication.venue}, {publication.year}. {publication.note}
          </p>
        </section>

        <section className="cv-section" aria-labelledby="skills">
          <h2 id="skills" className="cv-heading">
            Skills
          </h2>
          <dl className="cv-skills">
            {skills.map((group) => (
              <Fragment key={group.label}>
                <dt>{group.label}</dt>
                <dd>{group.items.join(", ")}</dd>
              </Fragment>
            ))}
          </dl>
        </section>

        <section className="cv-section" aria-labelledby="elsewhere">
          <h2 id="elsewhere" className="cv-heading">
            Elsewhere
          </h2>
          <p>{elsewhereLine(elsewhere)}</p>
        </section>
      </article>
    </div>
  );
}
