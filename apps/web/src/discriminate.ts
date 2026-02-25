import { DEFAULT_GAME_CONTENT } from "@colormix/content";
import {
  rgbToHex,
  scorePerceptualMatch,
  type PerceptualMatchScore,
  type RgbColor
} from "@colormix/color-engine";
import { selectNextById } from "./challenge-runner";

export type DiscriminateOption = {
  id: string;
  label: string;
  color: RgbColor;
  hex: string;
};

export type DiscriminateContextVariant =
  | "neutral-studio"
  | "warm-gallery"
  | "cool-shadow";

export type DiscriminateContextPresentation = {
  title: string;
  description: string;
  frameBackground: string;
  panelBackground: string;
};

export type DiscriminateChallenge = {
  id: string;
  title: string;
  brief: string;
  difficulty: "easy" | "medium" | "hard";
  contextVariant: DiscriminateContextVariant;
  target: RgbColor;
  targetHex: string;
  options: readonly DiscriminateOption[];
  correctOptionId: string;
};

export type DiscriminateAttemptResult = {
  isCorrect: boolean;
  selectedOption: DiscriminateOption;
  correctOption: DiscriminateOption;
  perceptual: PerceptualMatchScore;
};

type DiscriminateChallengeDefinition = Omit<
  DiscriminateChallenge,
  "targetHex" | "options" | "correctOptionId"
> & {
  options: readonly RgbColor[];
  correctOptionSlot: 0 | 1 | 2 | 3;
};

type DiscriminateChallengeSource = (typeof DEFAULT_GAME_CONTENT.discriminateChallenges)[number];

const CONTEXT_PRESENTATIONS: Record<DiscriminateContextVariant, DiscriminateContextPresentation> = {
  "neutral-studio": {
    title: "Neutral Studio",
    description: "Balanced gray surrounds remove strong warm/cool bias.",
    frameBackground: "linear-gradient(145deg, #f0f0ef 0%, #d7dbdf 100%)",
    panelBackground: "#f5f6f6"
  },
  "warm-gallery": {
    title: "Warm Gallery",
    description: "Amber surroundings can push similar swatches toward cooler perception.",
    frameBackground: "linear-gradient(145deg, #f8e2ca 0%, #e9c4a0 100%)",
    panelBackground: "#f6dfc3"
  },
  "cool-shadow": {
    title: "Cool Shadow",
    description: "Blue-gray ambient context can make neutrals feel warmer.",
    frameBackground: "linear-gradient(145deg, #d8e2f1 0%, #b8c8e4 100%)",
    panelBackground: "#d2dff0"
  }
};

function assertOptionSlot(value: number): 0 | 1 | 2 | 3 {
  if (value === 0 || value === 1 || value === 2 || value === 3) {
    return value;
  }

  throw new Error(`Invalid discriminate option slot '${value}'. Expected 0..3.`);
}

function assertContextVariant(value: string): DiscriminateContextVariant {
  if (value === "neutral-studio" || value === "warm-gallery" || value === "cool-shadow") {
    return value;
  }

  throw new Error(`Unknown discriminate context variant '${value}'.`);
}

function normalizeDiscriminateChallengeDefinition(
  definition: DiscriminateChallengeSource
): DiscriminateChallengeDefinition {
  return {
    id: definition.id,
    title: definition.title,
    brief: definition.brief,
    difficulty: definition.difficulty,
    contextVariant: assertContextVariant(definition.contextVariant),
    target: definition.target,
    options: definition.options,
    correctOptionSlot: assertOptionSlot(definition.correctOptionSlot)
  };
}

function createDiscriminateChallenge(
  definition: DiscriminateChallengeDefinition
): DiscriminateChallenge {
  const options = definition.options.map((option, index) => ({
    id: `${definition.id}-option-${index}`,
    label: `Candidate ${String.fromCharCode(65 + index)}`,
    color: option,
    hex: rgbToHex(option)
  }));

  const correctOption = options[definition.correctOptionSlot];

  if (!correctOption) {
    throw new Error(`Discriminate challenge '${definition.id}' has no correct option configured.`);
  }

  return {
    id: definition.id,
    title: definition.title,
    brief: definition.brief,
    difficulty: definition.difficulty,
    contextVariant: definition.contextVariant,
    target: definition.target,
    targetHex: rgbToHex(definition.target),
    options,
    correctOptionId: correctOption.id
  };
}

const DISCRIMINATE_CHALLENGE_DEFINITIONS = DEFAULT_GAME_CONTENT.discriminateChallenges.map(
  normalizeDiscriminateChallengeDefinition
);

export const DISCRIMINATE_CHALLENGES: readonly DiscriminateChallenge[] =
  DISCRIMINATE_CHALLENGE_DEFINITIONS.map(createDiscriminateChallenge);

export function getDiscriminateContextPresentation(
  contextVariant: DiscriminateContextVariant
): DiscriminateContextPresentation {
  return CONTEXT_PRESENTATIONS[contextVariant];
}

export function selectNextDiscriminateChallenge(
  challenges: readonly DiscriminateChallenge[],
  currentChallengeId?: string,
  random: () => number = Math.random
): DiscriminateChallenge {
  return selectNextById(challenges, currentChallengeId, random);
}

export function evaluateDiscriminateAttempt(
  challenge: DiscriminateChallenge,
  selectedOptionId: string
): DiscriminateAttemptResult | null {
  const selectedOption = challenge.options.find((option) => option.id === selectedOptionId);

  if (!selectedOption) {
    return null;
  }

  const correctOption = challenge.options.find((option) => option.id === challenge.correctOptionId);

  if (!correctOption) {
    throw new Error(`Discriminate challenge '${challenge.id}' has no correct option configured.`);
  }

  return {
    isCorrect: selectedOption.id === correctOption.id,
    selectedOption,
    correctOption,
    perceptual: scorePerceptualMatch(challenge.target, selectedOption.color)
  };
}
