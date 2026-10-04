import type { Metadata } from "next";
import Container from "@/components/Container";
import ExternalLink from "@/components/ExternalLink";
import OrgMark from "@/components/home/OrgMark";
import { cv, links } from "@/content/profile";
import { careerEntries, educationRows } from "@/lib/career";
import { baseAlternates, baseOpenGraph } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "CV",
  description: `Work history, education and skills of ${site.name}.`,
  alternates: { ...baseAlternates, canonical: "/cv" },
  openGraph: { ...baseOpenGraph, type: "website", url: "/cv" },
};

// The web CV in the home page's shapes: Experience as the same timeline of marks and roles, the rest
// as two-column rows. On paper (globals.css, @media print) the header, section bar and footer drop
// away, the name prints at the top, links print their addresses and the page is black on white.
export default function CvPage() {
  const { roles, publication, skills, elsewhere } = cv;
  return (
    <Container>
      <div className="page-head">
        <h1 className="display no-print">CV</h1>
        {/* On paper the name heads the page (the header does not print); on screen the header carries it. */}
        <p className="print-only cv-name">{site.name}</p>
        <p className="lead">
          Code on <ExternalLink href={links.github}>GitHub</ExternalLink>, profile on <ExternalLink href={links.linkedin}>LinkedIn</ExternalLink>.
        </p>
      </div>

      <section className="cv-section" aria-labelledby="experience">
        <h2 id="experience" className="cv-title">
          Experience
        </h2>
        <ol className="timeline">
          {careerEntries(roles, []).map(({ id, role }) => (
            <li key={id} className="tl-entry">
              <div className="tl-mark">
                <OrgMark name={role.company} />
              </div>
              <div>
                <div className="role-head">
                  <h3 id={id} className="role-title">
                    {role.title}
                    <span className="print-only-inline">, {role.company}</span>
                  </h3>
                  <p className="dates">{role.dates}</p>
                </div>
                <p className="role-where">{role.descriptor}</p>
                <ul className="bullets">
                  {role.bullets.map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="cv-section" aria-labelledby="education">
        <h2 id="education" className="cv-title">
          Education
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
        </div>
      </section>

      <section className="cv-section" aria-labelledby="publication">
        <h2 id="publication" className="cv-title">
          Publication
        </h2>
        <div className="rows">
          <div>
            <div>
              <h3 className="row-title">{publication.venue}</h3>
              <p className="row-sub dates">{publication.year}</p>
            </div>
            <p className="row-items">
              <span>
                <ExternalLink href={publication.url}>{publication.title}</ExternalLink>
                <span className="note">{publication.note}</span>
              </span>
            </p>
          </div>
        </div>
      </section>

      <section className="cv-section" aria-labelledby="skills">
        <h2 id="skills" className="cv-title">
          Skills
        </h2>
        <dl className="rows">
          {skills.map((group) => (
            <div key={group.label}>
              <dt className="row-title">{group.label}</dt>
              <dd>{group.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="cv-section" aria-labelledby="elsewhere">
        <h2 id="elsewhere" className="cv-title">
          Elsewhere
        </h2>
        <ul className="bullets">
          {elsewhere.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
