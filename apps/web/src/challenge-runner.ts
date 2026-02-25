export type ChallengeLike = {
  id: string;
};

export function selectNextById<T extends ChallengeLike>(
  challenges: readonly T[],
  currentChallengeId?: string,
  random: () => number = Math.random
): T {
  if (challenges.length === 0) {
    throw new Error("selectNextById requires at least one challenge.");
  }

  const firstChallenge = challenges[0];

  if (!firstChallenge) {
    throw new Error("selectNextById requires at least one challenge.");
  }

  if (challenges.length === 1) {
    return firstChallenge;
  }

  const candidates = currentChallengeId
    ? challenges.filter((challenge) => challenge.id !== currentChallengeId)
    : challenges;

  const randomIndex = Math.floor(random() * candidates.length);
  const selected = candidates[randomIndex];

  if (selected) {
    return selected;
  }

  const fallback = candidates[0];

  if (fallback) {
    return fallback;
  }

  return firstChallenge;
}
