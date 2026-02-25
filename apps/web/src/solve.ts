import {
  mixWeightedRgb,
  rgbToHex,
  scorePerceptualMatch,
  type PerceptualMatchScore,
  type RgbColor,
  type WeightedColorInput
} from "@colormix/color-engine";
import type { MixCanvasPigmentInput } from "@colormix/mix-canvas";

export type SolvePigment = {
  id: string;
  label: string;
  rgb: RgbColor;
};

export const SOLVE_PIGMENTS = [
  {
    id: "cadmium-red",
    label: "Cadmium Red",
    rgb: { r: 255, g: 76, b: 58 }
  },
  {
    id: "hansa-yellow",
    label: "Hansa Yellow",
    rgb: { r: 255, g: 204, b: 51 }
  },
  {
    id: "ultramarine",
    label: "Ultramarine",
    rgb: { r: 62, g: 102, b: 255 }
  },
  {
    id: "titanium-white",
    label: "Titanium White",
    rgb: { r: 245, g: 245, b: 245 }
  },
  {
    id: "mars-black",
    label: "Mars Black",
    rgb: { r: 32, g: 34, b: 38 }
  }
] as const satisfies readonly SolvePigment[];

export type SolvePigmentId = (typeof SOLVE_PIGMENTS)[number]["id"];

type RecipeEntry = {
  pigmentId: SolvePigmentId;
  drops: number;
};

export type SolveChallenge = {
  id: string;
  title: string;
  brief: string;
  target: RgbColor;
  targetHex: string;
  maxDrops: number;
  palette: readonly SolvePigmentId[];
  referenceRecipe: readonly RecipeEntry[];
};

const PIGMENT_INDEX = Object.fromEntries(
  SOLVE_PIGMENTS.map((pigment) => [pigment.id, pigment])
) as Record<SolvePigmentId, (typeof SOLVE_PIGMENTS)[number]>;

const PIGMENT_ID_SET = new Set<SolvePigmentId>(SOLVE_PIGMENTS.map((pigment) => pigment.id));

function createChallenge(definition: Omit<SolveChallenge, "target" | "targetHex">): SolveChallenge {
  const recipeInputs: WeightedColorInput[] = definition.referenceRecipe.map((recipe) => ({
    color: PIGMENT_INDEX[recipe.pigmentId].rgb,
    weight: recipe.drops
  }));

  const target = mixWeightedRgb(recipeInputs);

  return {
    ...definition,
    target,
    targetHex: rgbToHex(target)
  };
}

export const SOLVE_CHALLENGES: readonly SolveChallenge[] = [
  createChallenge({
    id: "sunset-peach",
    title: "Sunset Peach",
    brief: "Match a warm pastel by balancing red, yellow, and white.",
    maxDrops: 8,
    palette: ["cadmium-red", "hansa-yellow", "titanium-white", "mars-black"],
    referenceRecipe: [
      { pigmentId: "cadmium-red", drops: 2 },
      { pigmentId: "hansa-yellow", drops: 2 },
      { pigmentId: "titanium-white", drops: 3 }
    ]
  }),
  createChallenge({
    id: "storm-lilac",
    title: "Storm Lilac",
    brief: "Build a cool violet-grey with subtle dark neutralization.",
    maxDrops: 9,
    palette: ["cadmium-red", "ultramarine", "titanium-white", "mars-black"],
    referenceRecipe: [
      { pigmentId: "cadmium-red", drops: 2 },
      { pigmentId: "ultramarine", drops: 2 },
      { pigmentId: "titanium-white", drops: 4 },
      { pigmentId: "mars-black", drops: 1 }
    ]
  }),
  createChallenge({
    id: "moss-field",
    title: "Moss Field",
    brief: "Reach a muted natural green using yellow, blue, and black.",
    maxDrops: 8,
    palette: ["hansa-yellow", "ultramarine", "titanium-white", "mars-black"],
    referenceRecipe: [
      { pigmentId: "hansa-yellow", drops: 3 },
      { pigmentId: "ultramarine", drops: 2 },
      { pigmentId: "mars-black", drops: 1 }
    ]
  })
] as const;

export function isSolvePigmentId(value: string): value is SolvePigmentId {
  return PIGMENT_ID_SET.has(value as SolvePigmentId);
}

export function getSolvePigment(pigmentId: SolvePigmentId): (typeof SOLVE_PIGMENTS)[number] {
  return PIGMENT_INDEX[pigmentId];
}

export function getCanvasPigmentsForPalette(
  palette: readonly SolvePigmentId[],
  width: number,
  height: number
): MixCanvasPigmentInput[] {
  const clampedWidth = Math.max(width, 280);
  const y = Math.max(56, height - 52);
  const step = palette.length > 1 ? (clampedWidth - 120) / (palette.length - 1) : 0;

  return palette.map((pigmentId, index) => ({
    id: pigmentId,
    color: rgbToHex(PIGMENT_INDEX[pigmentId].rgb),
    x: 60 + step * index,
    y,
    radius: 24
  }));
}

export function buildWeightedInputsFromDrops(
  dropPigmentIds: readonly SolvePigmentId[]
): WeightedColorInput[] {
  const counts = new Map<SolvePigmentId, number>();

  for (const pigmentId of dropPigmentIds) {
    const nextCount = (counts.get(pigmentId) ?? 0) + 1;
    counts.set(pigmentId, nextCount);
  }

  const weightedInputs: WeightedColorInput[] = [];

  for (const [pigmentId, weight] of counts.entries()) {
    weightedInputs.push({
      color: PIGMENT_INDEX[pigmentId].rgb,
      weight
    });
  }

  return weightedInputs;
}

export function getAttemptColorFromDrops(dropPigmentIds: readonly SolvePigmentId[]): RgbColor | null {
  if (dropPigmentIds.length === 0) {
    return null;
  }

  return mixWeightedRgb(buildWeightedInputsFromDrops(dropPigmentIds));
}

export function countDropsByPigment(
  dropPigmentIds: readonly SolvePigmentId[]
): Record<SolvePigmentId, number> {
  const counts = Object.fromEntries(SOLVE_PIGMENTS.map((pigment) => [pigment.id, 0])) as Record<
    SolvePigmentId,
    number
  >;

  for (const pigmentId of dropPigmentIds) {
    counts[pigmentId] += 1;
  }

  return counts;
}

export function evaluateSolveAttempt(
  challenge: SolveChallenge,
  attemptColor: RgbColor
): PerceptualMatchScore {
  return scorePerceptualMatch(challenge.target, attemptColor);
}

export function selectNextChallenge(
  challenges: readonly SolveChallenge[],
  currentChallengeId?: string,
  random: () => number = Math.random
): SolveChallenge {
  if (challenges.length === 0) {
    throw new Error("selectNextChallenge requires at least one challenge.");
  }

  const firstChallenge = challenges[0];

  if (!firstChallenge) {
    throw new Error("selectNextChallenge requires at least one challenge.");
  }

  if (challenges.length === 1) {
    return firstChallenge;
  }

  const candidates = currentChallengeId
    ? challenges.filter((challenge) => challenge.id !== currentChallengeId)
    : challenges;

  const randomIndex = Math.floor(random() * candidates.length);
  const selected = candidates[randomIndex];

  if (!selected) {
    const fallback = candidates[0];

    if (!fallback) {
      return firstChallenge;
    }

    return fallback;
  }

  return selected;
}

export function formatBandLabel(band: PerceptualMatchScore["band"]): string {
  const labels: Record<PerceptualMatchScore["band"], string> = {
    perfect: "Perfect Match",
    excellent: "Excellent",
    good: "Good",
    fair: "Fair",
    miss: "Miss"
  };

  const label = labels[band];

  if (!label) {
    return "Unknown";
  }

  return label;
}
