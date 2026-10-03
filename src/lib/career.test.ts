import { describe, expect, it } from "vitest";
import { careerEntries, educationGroups } from "./career";

const roles = [
  { company: "Acme Labs", title: "Engineer", dates: "Apr 2026 – Present", descriptor: "d1", bullets: ["a1", "a2"] },
  { company: "Brook & Co", title: "Analyst", dates: "Oct 2024 – Apr 2026", descriptor: "d2", bullets: ["b1"] },
  { company: "Cedar", title: "Intern", dates: "May 2023 – Sep 2023", descriptor: "d3", bullets: ["c1"] },
];

const study = (slug: string, where: string) => ({
  slug,
  title: slug,
  where,
  when: "2026",
  problem: "p",
  built: "b",
  result: "r",
});

describe("careerEntries", () => {
  it("puts each case study under the role it was done in, in the order given, newest role first", () => {
    const entries = careerEntries(roles, [study("one", "Acme Labs"), study("two", "Brook & Co"), study("three", "Acme Labs")]);
    expect(entries.map((e) => [e.role.company, e.studies.map((s) => s.slug)])).toEqual([
      ["Acme Labs", ["one", "three"]],
      ["Brook & Co", ["two"]],
      ["Cedar", []],
    ]);
  });

  it("gives each role an id for its heading, from the company name", () => {
    expect(careerEntries(roles, []).map((e) => e.id)).toEqual(["role-acme-labs", "role-brook-co", "role-cedar"]);
  });

  it("refuses a case study whose workplace is not one of the roles, so a typo cannot hide it", () => {
    expect(() => careerEntries(roles, [study("lost", "Acme")])).toThrow(/lost.*Acme/);
  });
});

describe("educationGroups", () => {
  it("groups degrees by institution, keeping the first-seen order of both", () => {
    const groups = educationGroups([
      { institution: "North University", credential: "MSc Physics", year: "2024" },
      { institution: "South College", credential: "Diploma", year: "2022" },
      { institution: "North University", credential: "BSc Biology", year: "2021", note: "Prize" },
    ]);
    expect(groups.map((g) => [g.institution, g.degrees.map((d) => d.credential)])).toEqual([
      ["North University", ["MSc Physics", "BSc Biology"]],
      ["South College", ["Diploma"]],
    ]);
  });

  it("spans the years from the earliest degree to the latest", () => {
    const [north] = educationGroups([
      { institution: "North University", credential: "MSc", year: "2024" },
      { institution: "North University", credential: "BSc", year: "2021" },
    ]);
    expect(north.years).toBe("2021–2024");
  });

  it("shows a single year when there is one degree", () => {
    expect(educationGroups([{ institution: "South College", credential: "Diploma", year: "2022" }])[0].years).toBe("2022");
  });
});
