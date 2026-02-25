export type ChallengePack = {
  id: string;
  title: string;
  challengeIds: string[];
};

export function validateChallengePack(pack: ChallengePack): string[] {
  const errors: string[] = [];

  if (pack.id.trim().length === 0) {
    errors.push("Pack id cannot be empty.");
  }

  if (pack.title.trim().length === 0) {
    errors.push("Pack title cannot be empty.");
  }

  if (pack.challengeIds.length === 0) {
    errors.push("Pack must include at least one challenge id.");
  }

  return errors;
}
