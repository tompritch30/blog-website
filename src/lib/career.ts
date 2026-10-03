import type { CaseStudy, Education, Role } from "@/content/profile";

// The home page's career timeline: each role with the case studies done there, and education
// grouped by institution (one entry per place, its degrees inside), as the layout reads them.

export type CareerEntry = { id: string; role: Role; studies: CaseStudy[] };
export type EducationGroup = { institution: string; years: string; degrees: Education[] };

const EN_DASH = "–";

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
  return roles.map((role) => ({
    id: `role-${slug(role.company)}`,
    role,
    studies: studies.filter((s) => s.where === role.company),
  }));
}

/** One group per institution, in first-seen order, with the span of its degrees' years. */
export function educationGroups(education: Education[]): EducationGroup[] {
  const groups: EducationGroup[] = [];
  for (const degree of education) {
    let group = groups.find((g) => g.institution === degree.institution);
    if (!group) {
      group = { institution: degree.institution, years: "", degrees: [] };
      groups.push(group);
    }
    group.degrees.push(degree);
  }
  for (const group of groups) {
    const years = group.degrees.map((d) => Number(d.year)).sort((a, b) => a - b);
    const first = years[0];
    const last = years[years.length - 1];
    group.years = first === last ? String(first) : `${first}${EN_DASH}${last}`;
  }
  return groups;
}
