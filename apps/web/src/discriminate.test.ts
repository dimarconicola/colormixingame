import { describe, expect, it } from "vitest";
import {
  DISCRIMINATE_CHALLENGES,
  evaluateDiscriminateAttempt,
  getDiscriminateContextPresentation,
  selectNextDiscriminateChallenge
} from "./discriminate";

describe("discriminate challenges", () => {
  it("contains 4 options and a valid correct option", () => {
    for (const challenge of DISCRIMINATE_CHALLENGES) {
      expect(challenge.options).toHaveLength(4);
      expect(challenge.options.some((option) => option.id === challenge.correctOptionId)).toBe(true);
    }
  });

  it("returns context presentation metadata for each challenge", () => {
    for (const challenge of DISCRIMINATE_CHALLENGES) {
      const presentation = getDiscriminateContextPresentation(challenge.contextVariant);
      expect(presentation.title.length).toBeGreaterThan(0);
      expect(presentation.description.length).toBeGreaterThan(0);
    }
  });
});

describe("evaluateDiscriminateAttempt", () => {
  it("returns a correct result for the configured twin", () => {
    const challenge = DISCRIMINATE_CHALLENGES[0];

    if (!challenge) {
      throw new Error("Expected at least one discriminate challenge.");
    }

    const result = evaluateDiscriminateAttempt(challenge, challenge.correctOptionId);

    expect(result).not.toBeNull();

    if (!result) {
      return;
    }

    expect(result.isCorrect).toBe(true);
    expect(result.perceptual.deltaE00).toBeLessThanOrEqual(0.3);
  });

  it("returns an incorrect result for a non-matching option", () => {
    const challenge = DISCRIMINATE_CHALLENGES[1];

    if (!challenge) {
      throw new Error("Expected at least two discriminate challenges.");
    }

    const wrongOption = challenge.options.find((option) => option.id !== challenge.correctOptionId);

    if (!wrongOption) {
      throw new Error("Expected at least one incorrect option.");
    }

    const result = evaluateDiscriminateAttempt(challenge, wrongOption.id);

    expect(result).not.toBeNull();

    if (!result) {
      return;
    }

    expect(result.isCorrect).toBe(false);
    expect(result.perceptual.deltaE00).toBeGreaterThan(0.25);
  });
});

describe("selectNextDiscriminateChallenge", () => {
  it("returns a different challenge when current id is provided", () => {
    const current = DISCRIMINATE_CHALLENGES[0];

    if (!current) {
      throw new Error("Expected at least one discriminate challenge.");
    }

    const selected = selectNextDiscriminateChallenge(DISCRIMINATE_CHALLENGES, current.id, () => 0);

    expect(selected.id).not.toBe(current.id);
  });
});
