import { describe, expect, it } from "vitest";
import { bands, formatTick, linePath, linear, niceTicks } from "./chart";

// Expected values are worked by hand from the nice-step rule: step = 1, 2 or 5 times a power of ten,
// the one nearest the raw step (span / count), with the cut-offs at sqrt(50), sqrt(10) and sqrt(2).
describe("niceTicks", () => {
  it("picks a step of 50 for 0 to 200 in about 5 ticks (raw step 40, 4 >= sqrt(10) rounds to 5)", () => {
    expect(niceTicks(0, 200, 5)).toEqual({ min: 0, max: 200, step: 50, ticks: [0, 50, 100, 150, 200] });
  });

  it("widens 0 to 0.95 out to 1 with a step of 0.2 and no floating point dust", () => {
    expect(niceTicks(0, 0.95, 5)).toEqual({ min: 0, max: 1, step: 0.2, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1] });
  });

  it("extends both ends to whole steps when the data crosses zero", () => {
    expect(niceTicks(-3, 17, 5)).toEqual({ min: -5, max: 20, step: 5, ticks: [-5, 0, 5, 10, 15, 20] });
  });

  it("uses a step of 10 for 0 to 100 in 10 ticks", () => {
    expect(niceTicks(0, 100, 10).ticks).toEqual([0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]);
  });

  it("gives a flat series a unit span above its value instead of dividing by zero", () => {
    expect(niceTicks(0, 0, 5)).toEqual({ min: 0, max: 1, step: 0.2, ticks: [0, 0.2, 0.4, 0.6, 0.8, 1] });
  });

  it("accepts the ends in either order", () => {
    expect(niceTicks(200, 0, 5)).toEqual(niceTicks(0, 200, 5));
  });
});

describe("linear", () => {
  it("maps a domain onto a range", () => {
    expect(linear([0, 10], [0, 100])(2.5)).toBe(25);
  });

  it("inverts for a y axis drawn from the bottom up", () => {
    expect(linear([0, 200], [300, 0])(50)).toBe(225);
  });

  it("puts every value in the middle of the range when the domain is a single point", () => {
    expect(linear([4, 4], [0, 100])(4)).toBe(50);
  });
});

describe("bands", () => {
  it("splits a range into equal bands and gives each centre", () => {
    expect(bands(4, 0, 100)).toEqual({ width: 25, centres: [12.5, 37.5, 62.5, 87.5] });
  });

  it("handles an offset range", () => {
    expect(bands(2, 10, 50)).toEqual({ width: 20, centres: [20, 40] });
  });
});

describe("formatTick", () => {
  it("shows as many decimals as the step needs, the same on every tick of an axis", () => {
    expect(formatTick(0.4, 0.2)).toBe("0.4");
    expect(formatTick(1, 0.2)).toBe("1.0");
    expect(formatTick(0.75, 0.25)).toBe("0.75");
  });

  it("groups thousands and drops decimals for whole steps", () => {
    expect(formatTick(150, 50)).toBe("150");
    expect(formatTick(12000, 2000)).toBe("12,000");
  });

  it("writes minus as a minus sign and never prints -0", () => {
    expect(formatTick(-5, 5)).toBe("−5");
    expect(formatTick(-0, 5)).toBe("0");
  });
});

describe("linePath", () => {
  it("draws an SVG path through the points, rounded to two decimals", () => {
    expect(linePath([[0, 10], [5.1234, 7], [10, 2.005]])).toBe("M0 10L5.12 7L10 2.01");
  });

  it("is empty for no points", () => {
    expect(linePath([])).toBe("");
  });
});
