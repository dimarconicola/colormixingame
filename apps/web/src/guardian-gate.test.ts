import { describe, expect, it } from "vitest";
import {
  GUARDIAN_UNLOCK_DURATION_MS,
  createGuardianChallenge,
  isGuardianUnlockActive,
  sanitizeGuardianAnswer,
  verifyGuardianAnswer
} from "./guardian-gate";

describe("createGuardianChallenge", () => {
  it("builds deterministic sums when random source is provided", () => {
    const challenge = createGuardianChallenge(() => 0);

    expect(challenge.left).toBe(6);
    expect(challenge.right).toBe(4);
    expect(challenge.prompt).toBe("6 + 4");
    expect(challenge.expectedAnswer).toBe("10");
  });
});

describe("verifyGuardianAnswer", () => {
  it("accepts trimmed numeric answers", () => {
    const challenge = {
      left: 8,
      right: 7,
      prompt: "8 + 7",
      expectedAnswer: "15"
    };

    expect(verifyGuardianAnswer(challenge, "15")).toBe(true);
    expect(verifyGuardianAnswer(challenge, "  15  ")).toBe(true);
    expect(verifyGuardianAnswer(challenge, "1 5")).toBe(true);
    expect(verifyGuardianAnswer(challenge, "14")).toBe(false);
  });

  it("normalizes whitespace in helper parser", () => {
    expect(sanitizeGuardianAnswer(" 1 2 ")).toBe("12");
  });
});

describe("isGuardianUnlockActive", () => {
  it("returns true only inside unlock duration", () => {
    const start = 1_000;

    expect(isGuardianUnlockActive(start, start + 1_000)).toBe(true);
    expect(isGuardianUnlockActive(start, start + GUARDIAN_UNLOCK_DURATION_MS - 1)).toBe(true);
    expect(isGuardianUnlockActive(start, start + GUARDIAN_UNLOCK_DURATION_MS)).toBe(false);
  });

  it("rejects null and non-finite timestamps", () => {
    expect(isGuardianUnlockActive(null, 2_000)).toBe(false);
    expect(isGuardianUnlockActive(Number.NaN, 2_000)).toBe(false);
  });
});
