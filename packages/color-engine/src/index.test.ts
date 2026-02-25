import { describe, expect, it } from "vitest";
import { mixWeightedRgb, rgbToHex } from "./index";

describe("mixWeightedRgb", () => {
  it("returns deterministic weighted channel averages", () => {
    const mixed = mixWeightedRgb([
      { color: { r: 255, g: 0, b: 0 }, weight: 1 },
      { color: { r: 0, g: 0, b: 255 }, weight: 1 }
    ]);

    expect(mixed).toEqual({ r: 128, g: 0, b: 128 });
  });

  it("skips non-positive weights", () => {
    const mixed = mixWeightedRgb([
      { color: { r: 20, g: 40, b: 60 }, weight: 0 },
      { color: { r: 100, g: 150, b: 200 }, weight: 2 }
    ]);

    expect(mixed).toEqual({ r: 100, g: 150, b: 200 });
  });
});

describe("rgbToHex", () => {
  it("converts rgb channels to a lower-case hex string", () => {
    expect(rgbToHex({ r: 20, g: 125, b: 248 })).toBe("#147df8");
  });
});
