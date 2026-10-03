import type { Metadata } from "next";
import Container from "@/components/Container";
import ExternalLink from "@/components/ExternalLink";
import { cv, links } from "@/content/profile";
import { baseAlternates, baseOpenGraph } from "@/lib/metadata";
import { site } from "@/lib/site";

export const metadata: Metadata = {
  title: "CV",
  description: `Work history, education and skills of ${site.name}.`,
  alternates: { ...baseAlternates, canonical: "/cv" },
  openGraph: { ...baseOpenGraph, type: "website", url: "/cv" },
};

const slug = (text: string) => text.toLowerCase().replace(/[^a-z0-9]+/g, "-");
const h2 = "mb-4 mt-12 text-lg font-semibold tracking-tight text-fg";

// Plain semantic skeleton from src/content/profile.ts: headings and lists, no table (none of it is
// tabular). The look and the print stylesheet come later (plan slices 6 and 7).
export default function CvPage() {
  const { roles, education, publication, skills, elsewhere } = cv;
  return (
    <Container className="py-12 sm:py-16">
      <h1 className="text-xl font-semibold tracking-tight text-fg">CV</h1>
      <p className="mt-2 text-fg">
        {site.name}. Code on <ExternalLink href={links.github}>GitHub</ExternalLink>, profile on{" "}
        <ExternalLink href={links.linkedin}>LinkedIn</ExternalLink>.
      </p>

      <section aria-labelledby="experience">
        <h2 id="experience" className={h2}>
          Experience
        </h2>
        <div className="space-y-10">
          {roles.map((role) => (
            <article key={role.company} aria-labelledby={`role-${slug(role.company)}`}>
              <h3 id={`role-${slug(role.company)}`} className="font-medium text-fg">
                {role.company}
              </h3>
              <p className="text-fg">
                {role.title}, {role.dates}
              </p>
              <p className="mb-3 text-sm text-secondary">{role.descriptor}</p>
              <ul className="list-disc space-y-2 pl-5 leading-relaxed text-fg">
                {role.bullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="education">
        <h2 id="education" className={h2}>
          Education
        </h2>
        <ul className="space-y-2 text-fg">
          {education.map((e) => (
            <li key={e.credential}>
              {e.credential}, {e.institution}, {e.year}
              {e.note ? `. ${e.note}` : ""}
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="publication">
        <h2 id="publication" className={h2}>
          Publication
        </h2>
        <p className="leading-relaxed text-fg">
          <ExternalLink href={publication.url}>{publication.title}</ExternalLink>. {publication.venue}, {publication.year}. {publication.note}
        </p>
      </section>

      <section aria-labelledby="skills">
        <h2 id="skills" className={h2}>
          Skills
        </h2>
        <dl className="space-y-3 text-fg">
          {skills.map((group) => (
            <div key={group.label}>
              <dt className="font-medium">{group.label}</dt>
              <dd>{group.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="elsewhere">
        <h2 id="elsewhere" className={h2}>
          Elsewhere
        </h2>
        <ul className="list-disc space-y-1 pl-5 text-fg">
          {elsewhere.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>
    </Container>
  );
}
