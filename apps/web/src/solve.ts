import { DEFAULT_GAME_CONTENT } from "@colormix/content";
import {
  mixWeightedRgb,
  rgbToHex,
  scorePerceptualMatch,
  type PerceptualMatchScore,
  type RgbColor,
  type WeightedColorInput
} from "@colormix/color-engine";
import type { MixCanvasPigmentInput } from "@colormix/mix-canvas";
import { selectNextById } from "./challenge-runner";

export type SolvePigment = (typeof DEFAULT_GAME_CONTENT.pigments)[number];

export const SOLVE_PIGMENTS = DEFAULT_GAME_CONTENT.pigments;

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
) as Record<SolvePigmentId, SolvePigment>;

const PIGMENT_ID_SET = new Set<SolvePigmentId>(SOLVE_PIGMENTS.map((pigment) => pigment.id));

type SolveChallengeDefinition = Omit<SolveChallenge, "target" | "targetHex">;

type SolveChallengeSource = (typeof DEFAULT_GAME_CONTENT.solveChallenges)[number];

function createChallenge(definition: SolveChallengeDefinition): SolveChallenge {
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

function normalizeSolveChallengeDefinition(definition: SolveChallengeSource): SolveChallengeDefinition {
  return {
    id: definition.id,
    title: definition.title,
    brief: definition.brief,
    maxDrops: definition.maxDrops,
    palette: definition.palette.map((pigmentId) => assertSolvePigmentId(pigmentId)),
    referenceRecipe: definition.referenceRecipe.map((recipe) => ({
      pigmentId: assertSolvePigmentId(recipe.pigmentId),
      drops: recipe.drops
    }))
  };
}

const SOLVE_CHALLENGE_DEFINITIONS = DEFAULT_GAME_CONTENT.solveChallenges.map(
  normalizeSolveChallengeDefinition
);

export const SOLVE_CHALLENGES: readonly SolveChallenge[] = SOLVE_CHALLENGE_DEFINITIONS.map(
  createChallenge
);

export function isSolvePigmentId(value: string): value is SolvePigmentId {
  return PIGMENT_ID_SET.has(value as SolvePigmentId);
}

export function assertSolvePigmentId(value: string): SolvePigmentId {
  if (!isSolvePigmentId(value)) {
    throw new Error(`Unknown solve pigment id '${value}'.`);
  }

  return value;
}

export function getSolvePigment(pigmentId: SolvePigmentId): SolvePigment {
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
    counts[pigmentId] = (counts[pigmentId] ?? 0) + 1;
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
  return selectNextById(challenges, currentChallengeId, random);
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
