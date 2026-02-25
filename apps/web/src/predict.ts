import {
  mixWeightedRgb,
  rgbToHex,
  scorePerceptualMatch,
  type PerceptualMatchScore,
  type RgbColor,
  type WeightedColorInput
} from "@colormix/color-engine";
import { selectNextById } from "./challenge-runner";
import { getSolvePigment, type SolvePigmentId } from "./solve";

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

export const PREDICT_CHALLENGES: readonly PredictChallenge[] = [
  createPredictChallenge({
    id: "predict-coral-flare",
    title: "Coral Flare",
    brief: "Pick the resulting swatch for this warm coral recipe.",
    formula: [
      { pigmentId: "cadmium-red", drops: 2 },
      { pigmentId: "hansa-yellow", drops: 1 },
      { pigmentId: "titanium-white", drops: 2 }
    ],
    distractors: [
      [
        { pigmentId: "cadmium-red", drops: 2 },
        { pigmentId: "hansa-yellow", drops: 2 },
        { pigmentId: "titanium-white", drops: 1 }
      ],
      [
        { pigmentId: "cadmium-red", drops: 1 },
        { pigmentId: "hansa-yellow", drops: 1 },
        { pigmentId: "titanium-white", drops: 4 }
      ],
      [
        { pigmentId: "cadmium-red", drops: 2 },
        { pigmentId: "ultramarine", drops: 1 },
        { pigmentId: "titanium-white", drops: 2 }
      ]
    ],
    correctOptionSlot: 1
  }),
  createPredictChallenge({
    id: "predict-river-stone",
    title: "River Stone",
    brief: "Predict a muted cool neutral from the listed formula.",
    formula: [
      { pigmentId: "ultramarine", drops: 2 },
      { pigmentId: "titanium-white", drops: 3 },
      { pigmentId: "mars-black", drops: 1 }
    ],
    distractors: [
      [
        { pigmentId: "ultramarine", drops: 2 },
        { pigmentId: "titanium-white", drops: 2 }
      ],
      [
        { pigmentId: "ultramarine", drops: 1 },
        { pigmentId: "titanium-white", drops: 4 },
        { pigmentId: "mars-black", drops: 1 }
      ],
      [
        { pigmentId: "cadmium-red", drops: 1 },
        { pigmentId: "ultramarine", drops: 1 },
        { pigmentId: "titanium-white", drops: 3 },
        { pigmentId: "mars-black", drops: 1 }
      ]
    ],
    correctOptionSlot: 2
  }),
  createPredictChallenge({
    id: "predict-moss-mint",
    title: "Moss Mint",
    brief: "Estimate the green output when yellow and blue are cooled and softened.",
    formula: [
      { pigmentId: "hansa-yellow", drops: 2 },
      { pigmentId: "ultramarine", drops: 1 },
      { pigmentId: "titanium-white", drops: 2 },
      { pigmentId: "mars-black", drops: 1 }
    ],
    distractors: [
      [
        { pigmentId: "hansa-yellow", drops: 3 },
        { pigmentId: "ultramarine", drops: 1 },
        { pigmentId: "titanium-white", drops: 1 }
      ],
      [
        { pigmentId: "hansa-yellow", drops: 2 },
        { pigmentId: "ultramarine", drops: 2 },
        { pigmentId: "titanium-white", drops: 2 }
      ],
      [
        { pigmentId: "hansa-yellow", drops: 2 },
        { pigmentId: "ultramarine", drops: 1 },
        { pigmentId: "titanium-white", drops: 3 }
      ]
    ],
    correctOptionSlot: 0
  })
] as const;

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
