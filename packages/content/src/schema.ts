export type ContentRgbColor = {
  r: number;
  g: number;
  b: number;
};

export type PigmentDefinition = {
  id: string;
  label: string;
  rgb: ContentRgbColor;
};

export type FormulaEntryDefinition = {
  pigmentId: string;
  drops: number;
};

export type ChallengeDifficulty = "easy" | "medium" | "hard";

export type DiscriminateContextVariant = "neutral-studio" | "warm-gallery" | "cool-shadow";

export type SolveChallengeDefinition = {
  id: string;
  title: string;
  brief: string;
  difficulty: ChallengeDifficulty;
  maxDrops: number;
  palette: readonly string[];
  referenceRecipe: readonly FormulaEntryDefinition[];
};

export type PredictChallengeDefinition = {
  id: string;
  title: string;
  brief: string;
  difficulty: ChallengeDifficulty;
  formula: readonly FormulaEntryDefinition[];
  distractors: readonly (readonly FormulaEntryDefinition[])[];
  correctOptionSlot: number;
};

export type DiscriminateChallengeDefinition = {
  id: string;
  title: string;
  brief: string;
  difficulty: ChallengeDifficulty;
  contextVariant: DiscriminateContextVariant;
  target: ContentRgbColor;
  options: readonly ContentRgbColor[];
  correctOptionSlot: number;
};

export type ChallengePackDefinition = {
  id: string;
  title: string;
  challengeIds: readonly string[];
};

export type GameContentDefinition = {
  version: number;
  pigments: readonly PigmentDefinition[];
  solveChallenges: readonly SolveChallengeDefinition[];
  predictChallenges: readonly PredictChallengeDefinition[];
  discriminateChallenges: readonly DiscriminateChallengeDefinition[];
  packs?: readonly ChallengePackDefinition[];
};

export type ContentValidationIssue = {
  path: string;
  message: string;
};
