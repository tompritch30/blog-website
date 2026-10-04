import type { CaseStudy, Education, Role } from "@/content/profile";

// The home page's career timeline: each role with the case studies done there, and education as
// one row per degree, as the CV lists it.

export type CareerEntry = { id: string; role: Role; studies: CaseStudy[] };
export type EducationRow = { key: string; institution: string; year: string; degree: Education };

const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/** Roles in the order given (the CV's, newest first), each with its case studies in their own order. */
export function careerEntries(roles: Role[], studies: CaseStudy[]): CareerEntry[] {
  for (const s of studies) {
    if (!roles.some((r) => r.company === s.where)) {
      throw new Error(`case study "${s.slug}" names "${s.where}", which is not a role's company`);
    }
  }
  // Two roles can share a company (or a slug): later ones get -2, -3, so every heading's id is unique.
  const seen = new Map<string, number>();
  return roles.map((role) => {
    const base = `role-${slug(role.company)}`;
    const n = (seen.get(base) ?? 0) + 1;
    seen.set(base, n);
    return {
      id: n === 1 ? base : `${base}-${n}`,
      role,
      studies: studies.filter((s) => s.where === role.company),
    };
  });
}

/**
 * One row per degree, in the order given, each with its own year. Two degrees at one place stay
 * two rows: a span such as "2021–2024" would read as one course.
 */
export function educationRows(education: Education[]): EducationRow[] {
  return education.map((degree) => ({
    key: `${slug(degree.institution)}-${slug(degree.credential)}-${degree.year}`,
    institution: degree.institution,
    year: degree.year,
    degree,
  }));
}
