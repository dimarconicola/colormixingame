import { DEFAULT_GAME_CONTENT } from "@colormix/content";
import {
  mixWeightedRgb,
  rgbToHex,
  scorePerceptualMatch,
  type PerceptualMatchScore,
  type RgbColor,
  type WeightedColorInput
} from "@colormix/color-engine";
import { selectNextById } from "./challenge-runner";
import { assertSolvePigmentId, getSolvePigment, type SolvePigmentId } from "./solve";

export type PredictFormulaEntry = {
  pigmentId: SolvePigmentId;
  drops: number;
};

export type PredictOption = {
  id: string;
  label: string;
  color: RgbColor;
  hex: string;
};

export type PredictChallenge = {
  id: string;
  title: string;
  brief: string;
  formula: readonly PredictFormulaEntry[];
  target: RgbColor;
  targetHex: string;
  options: readonly PredictOption[];
  correctOptionId: string;
};

export type PredictAttemptResult = {
  isCorrect: boolean;
  selectedOption: PredictOption;
  correctOption: PredictOption;
  perceptual: PerceptualMatchScore;
};

type PredictChallengeDefinition = {
  id: string;
  title: string;
  brief: string;
  formula: readonly PredictFormulaEntry[];
  distractors: readonly (readonly PredictFormulaEntry[])[];
  correctOptionSlot: 0 | 1 | 2 | 3;
};

type PredictChallengeSource = (typeof DEFAULT_GAME_CONTENT.predictChallenges)[number];

function buildWeightedInputsFromFormula(
  formula: readonly PredictFormulaEntry[]
): readonly WeightedColorInput[] {
  return formula.map((entry) => ({
    color: getSolvePigment(entry.pigmentId).rgb,
    weight: entry.drops
  }));
}

function colorFromFormula(formula: readonly PredictFormulaEntry[]): RgbColor {
  return mixWeightedRgb(buildWeightedInputsFromFormula(formula));
}

function assertPredictOptionSlot(value: number): 0 | 1 | 2 | 3 {
  if (value === 0 || value === 1 || value === 2 || value === 3) {
    return value;
  }

  throw new Error(`Invalid predict option slot '${value}'. Expected 0..3.`);
}

function normalizePredictChallengeDefinition(
  definition: PredictChallengeSource
): PredictChallengeDefinition {
  return {
    id: definition.id,
    title: definition.title,
    brief: definition.brief,
    formula: definition.formula.map((entry) => ({
      pigmentId: assertSolvePigmentId(entry.pigmentId),
      drops: entry.drops
    })),
    distractors: definition.distractors.map((formula) =>
      formula.map((entry) => ({
        pigmentId: assertSolvePigmentId(entry.pigmentId),
        drops: entry.drops
      }))
    ),
    correctOptionSlot: assertPredictOptionSlot(definition.correctOptionSlot)
  };
}

function createPredictChallenge(definition: PredictChallengeDefinition): PredictChallenge {
  const target = colorFromFormula(definition.formula);
  const correctOption: PredictOption = {
    id: `${definition.id}-option-correct`,
    label: "Correct Formula",
    color: target,
    hex: rgbToHex(target)
  };

  const distractorOptions: PredictOption[] = definition.distractors.map((formula, index) => {
    const distractorColor = colorFromFormula(formula);

    return {
      id: `${definition.id}-option-d${index + 1}`,
      label: `Alternative ${index + 1}`,
      color: distractorColor,
      hex: rgbToHex(distractorColor)
    };
  });

  const options = [...distractorOptions];
  options.splice(definition.correctOptionSlot, 0, correctOption);

  return {
    id: definition.id,
    title: definition.title,
    brief: definition.brief,
    formula: definition.formula,
    target,
    targetHex: rgbToHex(target),
    options,
    correctOptionId: correctOption.id
  };
}

const PREDICT_CHALLENGE_DEFINITIONS = DEFAULT_GAME_CONTENT.predictChallenges.map(
  normalizePredictChallengeDefinition
);

export const PREDICT_CHALLENGES: readonly PredictChallenge[] = PREDICT_CHALLENGE_DEFINITIONS.map(
  createPredictChallenge
);

export function selectNextPredictChallenge(
  challenges: readonly PredictChallenge[],
  currentChallengeId?: string,
  random: () => number = Math.random
): PredictChallenge {
  return selectNextById(challenges, currentChallengeId, random);
}

export function evaluatePredictAttempt(
  challenge: PredictChallenge,
  selectedOptionId: string
): PredictAttemptResult | null {
  const selectedOption = challenge.options.find((option) => option.id === selectedOptionId);

  if (!selectedOption) {
    return null;
  }

  const correctOption = challenge.options.find((option) => option.id === challenge.correctOptionId);

  if (!correctOption) {
    throw new Error(`Predict challenge '${challenge.id}' has no correct option configured.`);
  }

  return {
    isCorrect: selectedOption.id === correctOption.id,
    selectedOption,
    correctOption,
    perceptual: scorePerceptualMatch(challenge.target, selectedOption.color)
  };
}

export function formatFormulaEntry(entry: PredictFormulaEntry): string {
  const pigment = getSolvePigment(entry.pigmentId);
  const noun = entry.drops === 1 ? "drop" : "drops";

  return `${entry.drops} ${noun} ${pigment.label}`;
}
