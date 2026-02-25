import { describe, expect, it } from "vitest";
import { rgbToHex } from "@colormix/color-engine";
import {
  SOLVE_CHALLENGES,
  buildWeightedInputsFromDrops,
  countDropsByPigment,
  evaluateSolveAttempt,
  getAttemptColorFromDrops,
  getCanvasPigmentsForPalette,
  selectNextChallenge,
  type SolvePigmentId
} from "./solve";

function expandRecipe(recipe: readonly { pigmentId: SolvePigmentId; drops: number }[]): SolvePigmentId[] {
  const dropIds: SolvePigmentId[] = [];

  for (const entry of recipe) {
    for (let index = 0; index < entry.drops; index += 1) {
      dropIds.push(entry.pigmentId);
    }
  }

  return dropIds;
}

describe("buildWeightedInputsFromDrops", () => {
  it("aggregates drop ids into weighted pigment inputs", () => {
    const weighted = buildWeightedInputsFromDrops([
      "cadmium-red",
      "hansa-yellow",
      "cadmium-red",
      "hansa-yellow",
      "cadmium-red"
    ]);

    const summary = weighted.map((entry) => ({ hex: rgbToHex(entry.color), weight: entry.weight }));

    expect(summary).toEqual([
      { hex: "#ff4c3a", weight: 3 },
      { hex: "#ffcc33", weight: 2 }
    ]);
  });
});

describe("getAttemptColorFromDrops", () => {
  it("returns null when no pigments were dropped", () => {
    expect(getAttemptColorFromDrops([])).toBeNull();
  });

  it("can reproduce challenge targets from reference recipes", () => {
    const challenge = SOLVE_CHALLENGES[0];

    if (!challenge) {
      throw new Error("Expected at least one solve challenge.");
    }

    const dropIds = expandRecipe(challenge.referenceRecipe);
    const attempt = getAttemptColorFromDrops(dropIds);

    expect(attempt).not.toBeNull();

    if (!attempt) {
      return;
    }

    const score = evaluateSolveAttempt(challenge, attempt);

    expect(score.band).toBe("perfect");
    expect(score.score).toBe(100);
    expect(score.deltaE00).toBeCloseTo(0, 8);
  });
});

describe("countDropsByPigment", () => {
  it("returns a complete per-pigment drop map", () => {
    const counts = countDropsByPigment(["mars-black", "mars-black", "ultramarine"]);

    expect(counts["mars-black"]).toBe(2);
    expect(counts["ultramarine"]).toBe(1);
    expect(counts["cadmium-red"]).toBe(0);
  });
});

describe("selectNextChallenge", () => {
  it("selects a different challenge when current id is provided", () => {
    const current = SOLVE_CHALLENGES[0];

    if (!current) {
      throw new Error("Expected at least one solve challenge.");
    }

    const selected = selectNextChallenge(SOLVE_CHALLENGES, current.id, () => 0);

    expect(selected.id).not.toBe(current.id);
  });
});

describe("getCanvasPigmentsForPalette", () => {
  it("generates canvas pigments for all palette entries", () => {
    const challenge = SOLVE_CHALLENGES[1];

    if (!challenge) {
      throw new Error("Expected at least two solve challenges.");
    }

    const pigments = getCanvasPigmentsForPalette(challenge.palette, 640, 360);

    expect(pigments).toHaveLength(challenge.palette.length);
    expect(pigments.every((pigment) => pigment.y > 0)).toBe(true);
  });
});
