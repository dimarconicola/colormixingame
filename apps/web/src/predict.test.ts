import { describe, expect, it } from "vitest";
import { PREDICT_CHALLENGES, evaluatePredictAttempt, selectNextPredictChallenge } from "./predict";

describe("PREDICT_CHALLENGES", () => {
  it("contains 4 options for each challenge", () => {
    for (const challenge of PREDICT_CHALLENGES) {
      expect(challenge.options).toHaveLength(4);
    }
  });

  it("includes the configured correct option in each challenge", () => {
    for (const challenge of PREDICT_CHALLENGES) {
      const match = challenge.options.find((option) => option.id === challenge.correctOptionId);

      expect(match).toBeDefined();
    }
  });
});

describe("evaluatePredictAttempt", () => {
  it("returns correct=true when user selects the target option", () => {
    const challenge = PREDICT_CHALLENGES[0];

    if (!challenge) {
      throw new Error("Expected at least one predict challenge.");
    }

    const result = evaluatePredictAttempt(challenge, challenge.correctOptionId);

    expect(result).not.toBeNull();

    if (!result) {
      return;
    }

    expect(result.isCorrect).toBe(true);
    expect(result.perceptual.band).toBe("perfect");
    expect(result.perceptual.deltaE00).toBeCloseTo(0, 8);
  });

  it("returns correct=false for wrong option ids", () => {
    const challenge = PREDICT_CHALLENGES[1];

    if (!challenge) {
      throw new Error("Expected at least two predict challenges.");
    }

    const wrongOption = challenge.options.find((option) => option.id !== challenge.correctOptionId);

    if (!wrongOption) {
      throw new Error("Expected at least one wrong option.");
    }

    const result = evaluatePredictAttempt(challenge, wrongOption.id);

    expect(result).not.toBeNull();

    if (!result) {
      return;
    }

    expect(result.isCorrect).toBe(false);
    expect(result.perceptual.deltaE00).toBeGreaterThan(0);
  });
});

describe("selectNextPredictChallenge", () => {
  it("returns a different challenge when current id is provided", () => {
    const current = PREDICT_CHALLENGES[0];

    if (!current) {
      throw new Error("Expected at least one predict challenge.");
    }

    const selected = selectNextPredictChallenge(PREDICT_CHALLENGES, current.id, () => 0);

    expect(selected.id).not.toBe(current.id);
  });
});
