import { describe, expect, it } from "vitest";
import { cv, links } from "@/content/profile";
import { displayUrl, educationLine, elsewhereLine } from "./cv";

// The web CV's lines, set the way a printed CV sets them. Expected values are written out by hand.
describe("displayUrl", () => {
  it("shows a profile address the way a printed CV does: no scheme, no www, no trailing slash", () => {
    expect(displayUrl("https://www.linkedin.com/in/casey-example-01/")).toBe("linkedin.com/in/casey-example-01");
    expect(displayUrl("https://github.com/casey")).toBe("github.com/casey");
    expect(displayUrl("http://example.org/a/b")).toBe("example.org/a/b");
  });

  it("gives the profile's own links as the CV header prints them", () => {
    expect([displayUrl(links.github), displayUrl(links.linkedin)]).toEqual(["github.com/tompritch30", "linkedin.com/in/thomas-pritchard-01a"]);
  });
});

describe("educationLine", () => {
  it("puts the credential after the institution and the note after the credential", () => {
    expect(educationLine({ institution: "North University", credential: "BSc Botany (First)", year: "2019", note: "Prize for fieldwork" })).toEqual({
      institution: "North University",
      rest: "BSc Botany (First), Prize for fieldwork",
    });
  });

  it("leaves the note out when there is none", () => {
    expect(educationLine({ institution: "North University", credential: "MSc Maths", year: "2021" }).rest).toBe("MSc Maths");
  });
});

describe("elsewhereLine", () => {
  it("joins the items into sentences, each head with its note after a comma", () => {
    expect(elsewhereLine([{ head: "Choir tenor", note: "weekly" }, { head: "Ran a marathon" }])).toBe("Choir tenor, weekly. Ran a marathon.");
  });

  it("is empty when there is nothing outside work", () => {
    expect(elsewhereLine([])).toBe("");
  });

  it("sets the profile's three items on one line", () => {
    expect(elsewhereLine(cv.elsewhere)).toBe("Airbnb Superhost, hosting weekly alongside work. Ball boy at Wimbledon, 2015. Volunteered in Malawi and Cambodia.");
  });
});
