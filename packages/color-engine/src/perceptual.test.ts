import { describe, expect, it } from "vitest";
import {
  DEFAULT_PERCEPTUAL_BANDS,
  assertValidPerceptualBands,
  classifyDeltaE,
  deltaE00,
  rgbToLab,
  scorePerceptualMatch,
  type LabColor
} from "./perceptual";

function expectDeltaEToMatchReference(lab1: LabColor, lab2: LabColor, expected: number): void {
  const actual = deltaE00(lab1, lab2);

  expect(actual).toBeCloseTo(expected, 4);
}

describe("deltaE00", () => {
  it("matches known CIEDE2000 reference vectors", () => {
    expectDeltaEToMatchReference(
      { l: 50, a: 2.6772, b: -79.7751 },
      { l: 50, a: 0, b: -82.7485 },
      2.0425
    );

    expectDeltaEToMatchReference(
      { l: 50, a: 3.1571, b: -77.2803 },
      { l: 50, a: 0, b: -82.7485 },
      2.8615
    );

    expectDeltaEToMatchReference(
      { l: 50, a: -1.3802, b: -84.2814 },
      { l: 50, a: 0, b: -82.7485 },
      1
    );
  });

  it("returns zero for identical lab colors", () => {
    expect(deltaE00({ l: 65, a: 20, b: 40 }, { l: 65, a: 20, b: 40 })).toBeCloseTo(0, 10);
  });
});

describe("rgbToLab", () => {
  it("returns similar lightness values for neutral greys", () => {
    const lab = rgbToLab({ r: 128, g: 128, b: 128 });

    expect(lab.l).toBeGreaterThan(50);
    expect(Math.abs(lab.a)).toBeLessThan(1);
    expect(Math.abs(lab.b)).toBeLessThan(1);
  });
});

describe("classifyDeltaE", () => {
  it("maps deltaE values to calibrated default bands", () => {
    expect(classifyDeltaE(0.8)).toEqual({ band: "perfect", score: 100, passed: true });
    expect(classifyDeltaE(2.1)).toEqual({ band: "excellent", score: 90, passed: true });
    expect(classifyDeltaE(3.6)).toEqual({ band: "good", score: 75, passed: true });
    expect(classifyDeltaE(7.9)).toEqual({ band: "fair", score: 55, passed: true });
    expect(classifyDeltaE(8.1)).toEqual({ band: "miss", score: 0, passed: false });
  });

  it("rejects invalid band definitions", () => {
    expect(() =>
      assertValidPerceptualBands([
        { name: "perfect", maxDeltaE: 2, score: 100 },
        { name: "excellent", maxDeltaE: 1, score: 90 }
      ])
    ).toThrowError("Perceptual bands must be sorted by increasing maxDeltaE.");
  });
});

describe("scorePerceptualMatch", () => {
  it("scores exact rgb matches as perfect", () => {
    const result = scorePerceptualMatch({ r: 120, g: 70, b: 30 }, { r: 120, g: 70, b: 30 });

    expect(result.band).toBe("perfect");
    expect(result.score).toBe(100);
    expect(result.passed).toBe(true);
    expect(result.deltaE00).toBeCloseTo(0, 10);
  });

  it("marks clearly distant colors as miss", () => {
    const result = scorePerceptualMatch(
      { r: 245, g: 245, b: 245 },
      { r: 20, g: 20, b: 20 },
      DEFAULT_PERCEPTUAL_BANDS
    );

    expect(result.band).toBe("miss");
    expect(result.score).toBe(0);
    expect(result.passed).toBe(false);
    expect(result.deltaE00).toBeGreaterThan(8);
  });
});
