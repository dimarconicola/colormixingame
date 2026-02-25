import { describe, expect, it } from "vitest";
import {
  createChallengeTemplate,
  createPackTemplate,
  parseAuthoringMode,
  parseChallengeDifficulty
} from "./authoring.js";

describe("authoring templates", () => {
  it("creates solve template with baseline fields", () => {
    const template = createChallengeTemplate({
      mode: "solve",
      id: "sunset-template",
      difficulty: "easy"
    });

    expect(template.id).toBe("sunset-template");
    expect("maxDrops" in template).toBe(true);
    expect("referenceRecipe" in template).toBe(true);
  });

  it("creates predict template with distractors", () => {
    const template = createChallengeTemplate({
      mode: "predict",
      id: "predict-template",
      difficulty: "medium"
    });

    expect("distractors" in template).toBe(true);
    expect("correctOptionSlot" in template).toBe(true);
  });

  it("creates discriminate template with context", () => {
    const template = createChallengeTemplate({
      mode: "discriminate",
      id: "discriminate-template",
      difficulty: "hard"
    });

    expect("contextVariant" in template).toBe(true);
    expect("options" in template).toBe(true);
  });

  it("creates pack template and keeps provided ids", () => {
    const pack = createPackTemplate({
      id: "my-pack",
      challengeIds: ["a", "b"]
    });

    expect(pack.challengeIds).toEqual(["a", "b"]);
  });
});

describe("authoring parsers", () => {
  it("parses mode and difficulty values", () => {
    expect(parseAuthoringMode("solve")).toBe("solve");
    expect(parseChallengeDifficulty("easy")).toBe("easy");
  });

  it("throws on unknown mode/difficulty", () => {
    expect(() => parseAuthoringMode("unknown")).toThrow(/Unknown mode/);
    expect(() => parseChallengeDifficulty("invalid")).toThrow(/Unknown difficulty/);
  });
});
