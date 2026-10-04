import { describe, expect, it } from "vitest";
import { cv } from "@/content/profile";
import { careerEntries, educationRows } from "./career";

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

describe("educationRows", () => {
  it("gives each degree its own row with its own year, so two degrees at one place never read as one course", () => {
    const rows = educationRows([
      { institution: "Imperial College London", credential: "MSc Computer Science (Distinction)", year: "2024" },
      { institution: "Imperial College London", credential: "BSc Biological Sciences (First Class Honours)", year: "2021" },
    ]);
    expect(rows.map((r) => [r.institution, r.year, r.degree.credential])).toEqual([
      ["Imperial College London", "2024", "MSc Computer Science (Distinction)"],
      ["Imperial College London", "2021", "BSc Biological Sciences (First Class Honours)"],
    ]);
    expect(JSON.stringify(rows)).not.toContain("2021–2024");
  });

  it("keeps the order given (the CV's, newest first) and carries each degree's note", () => {
    const rows = educationRows([
      { institution: "North University", credential: "MSc Physics", year: "2024" },
      { institution: "South College", credential: "Diploma", year: "2022" },
      { institution: "North University", credential: "BSc Biology", year: "2021", note: "Prize" },
    ]);
    expect(rows.map((r) => [r.institution, r.year, r.degree.note])).toEqual([
      ["North University", "2024", undefined],
      ["South College", "2022", undefined],
      ["North University", "2021", "Prize"],
    ]);
  });

  it("gives each row a key that differs between two degrees at the same place", () => {
    const keys = educationRows(cv.education).map((r) => r.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("shows the profile's Imperial degrees as the CV states them: MSc 2024 and BSc 2021, no span", () => {
    const imperial = educationRows(cv.education).filter((r) => r.institution === "Imperial College London");
    expect(imperial.map((r) => [r.degree.credential, r.year])).toEqual([
      ["MSc Computer Science (Distinction)", "2024"],
      ["BSc Biological Sciences (First Class Honours)", "2021"],
    ]);
  });
});
