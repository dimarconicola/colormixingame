import { describe, expect, it } from "vitest";
import { DEFAULT_GAME_CONTENT } from "./default-content.js";
import { validateGameContent } from "./validate.js";

describe("validateGameContent", () => {
  it("passes for the default content payload", () => {
    expect(validateGameContent(DEFAULT_GAME_CONTENT)).toEqual([]);
  });

  it("reports unknown pigment ids in solve recipes", () => {
    const invalidContent = {
      ...DEFAULT_GAME_CONTENT,
      solveChallenges: [
        {
          ...DEFAULT_GAME_CONTENT.solveChallenges[0],
          referenceRecipe: [{ pigmentId: "unknown-pigment", drops: 2 }]
        },
        ...DEFAULT_GAME_CONTENT.solveChallenges.slice(1)
      ]
    };

    const issues = validateGameContent(invalidContent);

    expect(issues.some((issue) => issue.path.includes("referenceRecipe[0].pigmentId"))).toBe(true);
  });

  it("reports duplicate formulas in predict challenge options", () => {
    const duplicatedFormula = DEFAULT_GAME_CONTENT.predictChallenges[0]?.formula ?? [];

    const invalidContent = {
      ...DEFAULT_GAME_CONTENT,
      predictChallenges: [
        {
          ...DEFAULT_GAME_CONTENT.predictChallenges[0],
          distractors: [duplicatedFormula, ...DEFAULT_GAME_CONTENT.predictChallenges[0].distractors.slice(1)]
        },
        ...DEFAULT_GAME_CONTENT.predictChallenges.slice(1)
      ]
    };

    const issues = validateGameContent(invalidContent);

    expect(issues.some((issue) => issue.message.includes("duplicate formulas"))).toBe(true);
  });
});
