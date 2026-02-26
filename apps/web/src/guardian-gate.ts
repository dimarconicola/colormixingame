export const GUARDIAN_UNLOCK_DURATION_MS = 10 * 60 * 1000;

export type GuardianChallenge = {
  left: number;
  right: number;
  prompt: string;
  expectedAnswer: string;
};

type RandomSource = () => number;

function randomInt(minInclusive: number, maxInclusive: number, random: RandomSource): number {
  const range = maxInclusive - minInclusive + 1;
  return minInclusive + Math.floor(random() * range);
}

export function createGuardianChallenge(random: RandomSource = Math.random): GuardianChallenge {
  const left = randomInt(6, 12, random);
  const right = randomInt(4, 9, random);
  const expectedAnswer = String(left + right);

  return {
    left,
    right,
    prompt: `${left} + ${right}`,
    expectedAnswer
  };
}

export function sanitizeGuardianAnswer(rawValue: string): string {
  return rawValue.trim().replace(/\s+/g, "");
}

export function verifyGuardianAnswer(challenge: GuardianChallenge, rawAnswer: string): boolean {
  return sanitizeGuardianAnswer(rawAnswer) === challenge.expectedAnswer;
}

export function isGuardianUnlockActive(
  unlockedAtEpochMs: number | null,
  nowEpochMs: number = Date.now(),
  unlockDurationMs: number = GUARDIAN_UNLOCK_DURATION_MS
): boolean {
  if (unlockedAtEpochMs === null) {
    return false;
  }

  if (!Number.isFinite(unlockedAtEpochMs)) {
    return false;
  }

  return nowEpochMs - unlockedAtEpochMs < unlockDurationMs;
}
