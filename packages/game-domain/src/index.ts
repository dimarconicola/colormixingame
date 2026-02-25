export type ChallengeMode = "solve" | "predict" | "discriminate" | "collect";

export type Challenge = {
  id: string;
  mode: ChallengeMode;
  difficulty: 1 | 2 | 3 | 4;
  title: string;
};

export type PlayerProgress = {
  unlockedPigments: string[];
  unlockedTools: string[];
  completedChallengeIds: string[];
};

export function markChallengeComplete(
  progress: PlayerProgress,
  challengeId: string
): PlayerProgress {
  if (progress.completedChallengeIds.includes(challengeId)) {
    return progress;
  }

  return {
    ...progress,
    completedChallengeIds: [...progress.completedChallengeIds, challengeId]
  };
}
