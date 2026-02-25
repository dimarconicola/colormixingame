import { mixWeightedRgb, scorePerceptualMatch, type WeightedColorInput } from "@colormix/color-engine";
import type {
  ChallengeDifficulty,
  ChallengePackDefinition,
  ContentRgbColor,
  ContentValidationIssue,
  FormulaEntryDefinition,
  GameContentDefinition,
  PigmentDefinition,
  PredictChallengeDefinition,
  SolveChallengeDefinition
} from "./schema.js";

function isNonEmptyString(value: string): boolean {
  return value.trim().length > 0;
}

function isPositiveInteger(value: number): boolean {
  return Number.isInteger(value) && value > 0;
}

function isByteChannel(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= 255;
}

function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

function addIssue(issues: ContentValidationIssue[], path: string, message: string): void {
  issues.push({ path, message });
}

const DIFFICULTY_ORDER: Record<ChallengeDifficulty, number> = {
  easy: 0,
  medium: 1,
  hard: 2
};

const CHALLENGE_DIFFICULTIES = new Set<ChallengeDifficulty>(["easy", "medium", "hard"]);

type SolveBalanceProfile = {
  maxDrops: readonly [min: number, max: number];
  recipeTotalDrops: readonly [min: number, max: number];
  uniqueRecipePigments: readonly [min: number, max: number];
};

const SOLVE_BALANCE_PROFILES: Record<ChallengeDifficulty, SolveBalanceProfile> = {
  easy: {
    maxDrops: [6, 8],
    recipeTotalDrops: [6, 8],
    uniqueRecipePigments: [2, 3]
  },
  medium: {
    maxDrops: [7, 9],
    recipeTotalDrops: [5, 8],
    uniqueRecipePigments: [3, 4]
  },
  hard: {
    maxDrops: [8, 10],
    recipeTotalDrops: [8, 10],
    uniqueRecipePigments: [4, 5]
  }
};

type PredictBalanceProfile = {
  formulaTotalDrops: readonly [min: number, max: number];
  uniqueFormulaPigments: readonly [min: number, max: number];
  minDistractorDeltaE00: readonly [min: number, max: number];
};

const PREDICT_BALANCE_PROFILES: Record<ChallengeDifficulty, PredictBalanceProfile> = {
  easy: {
    formulaTotalDrops: [4, 6],
    uniqueFormulaPigments: [2, 3],
    minDistractorDeltaE00: [6, 14]
  },
  medium: {
    formulaTotalDrops: [5, 7],
    uniqueFormulaPigments: [3, 4],
    minDistractorDeltaE00: [8, 14]
  },
  hard: {
    formulaTotalDrops: [5, 7],
    uniqueFormulaPigments: [3, 4],
    minDistractorDeltaE00: [4, 8]
  }
};

type ChallengeMode = "solve" | "predict";

type ChallengeMetadata = {
  mode: ChallengeMode;
  difficulty: ChallengeDifficulty;
};

function isChallengeDifficulty(value: string): value is ChallengeDifficulty {
  return CHALLENGE_DIFFICULTIES.has(value as ChallengeDifficulty);
}

function validateDifficulty(
  issues: ContentValidationIssue[],
  path: string,
  difficulty: string
): difficulty is ChallengeDifficulty {
  if (isChallengeDifficulty(difficulty)) {
    return true;
  }

  addIssue(issues, path, "Difficulty must be one of: easy, medium, hard.");
  return false;
}

function validateBalanceRange(
  issues: ContentValidationIssue[],
  path: string,
  metricName: string,
  value: number,
  range: readonly [number, number]
): void {
  const [min, max] = range;

  if (isInRange(value, min, max)) {
    return;
  }

  addIssue(
    issues,
    path,
    `${metricName} must be between ${min} and ${max} for assigned difficulty (received ${value}).`
  );
}

function getFormulaStats(formula: readonly FormulaEntryDefinition[]): {
  totalDrops: number;
  uniquePigments: number;
} {
  return {
    totalDrops: formula.reduce((total, entry) => total + entry.drops, 0),
    uniquePigments: new Set(formula.map((entry) => entry.pigmentId)).size
  };
}

function buildFormulaMixInputs(
  formula: readonly FormulaEntryDefinition[],
  pigmentById: ReadonlyMap<string, PigmentDefinition>
): WeightedColorInput[] | null {
  const weightedInputs: WeightedColorInput[] = [];

  for (const entry of formula) {
    const pigment = pigmentById.get(entry.pigmentId);

    if (!pigment) {
      return null;
    }

    weightedInputs.push({
      color: pigment.rgb,
      weight: entry.drops
    });
  }

  return weightedInputs;
}

function validateRgbColor(
  issues: ContentValidationIssue[],
  path: string,
  color: ContentRgbColor
): void {
  if (!isByteChannel(color.r)) {
    addIssue(issues, `${path}.r`, "RGB channel must be an integer between 0 and 255.");
  }

  if (!isByteChannel(color.g)) {
    addIssue(issues, `${path}.g`, "RGB channel must be an integer between 0 and 255.");
  }

  if (!isByteChannel(color.b)) {
    addIssue(issues, `${path}.b`, "RGB channel must be an integer between 0 and 255.");
  }
}

function normalizeFormulaKey(formula: readonly FormulaEntryDefinition[]): string {
  const counts = new Map<string, number>();

  for (const entry of formula) {
    counts.set(entry.pigmentId, (counts.get(entry.pigmentId) ?? 0) + entry.drops);
  }

  return [...counts.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([pigmentId, drops]) => `${pigmentId}:${drops}`)
    .join("|");
}

function validateFormula(
  issues: ContentValidationIssue[],
  path: string,
  formula: readonly FormulaEntryDefinition[],
  pigmentIds: ReadonlySet<string>,
  allowedPaletteIds?: ReadonlySet<string>
): void {
  if (formula.length === 0) {
    addIssue(issues, path, "Formula must contain at least one entry.");
    return;
  }

  for (const [index, entry] of formula.entries()) {
    const entryPath = `${path}[${index}]`;

    if (!isNonEmptyString(entry.pigmentId)) {
      addIssue(issues, `${entryPath}.pigmentId`, "Pigment id cannot be empty.");
    }

    if (!pigmentIds.has(entry.pigmentId)) {
      addIssue(
        issues,
        `${entryPath}.pigmentId`,
        `Unknown pigment id '${entry.pigmentId}' referenced in formula.`
      );
    }

    if (allowedPaletteIds && !allowedPaletteIds.has(entry.pigmentId)) {
      addIssue(
        issues,
        `${entryPath}.pigmentId`,
        `Formula pigment '${entry.pigmentId}' must exist in challenge palette.`
      );
    }

    if (!isPositiveInteger(entry.drops)) {
      addIssue(
        issues,
        `${entryPath}.drops`,
        "Drops must be a positive integer greater than zero."
      );
    }
  }
}

function validateSolveChallenge(
  issues: ContentValidationIssue[],
  challenge: SolveChallengeDefinition,
  index: number,
  pigmentIds: ReadonlySet<string>
): void {
  const path = `solveChallenges[${index}]`;

  if (!isNonEmptyString(challenge.id)) {
    addIssue(issues, `${path}.id`, "Challenge id cannot be empty.");
  }

  if (!isNonEmptyString(challenge.title)) {
    addIssue(issues, `${path}.title`, "Challenge title cannot be empty.");
  }

  if (!isNonEmptyString(challenge.brief)) {
    addIssue(issues, `${path}.brief`, "Challenge brief cannot be empty.");
  }

  const hasValidDifficulty = validateDifficulty(
    issues,
    `${path}.difficulty`,
    challenge.difficulty
  );

  if (!isPositiveInteger(challenge.maxDrops)) {
    addIssue(issues, `${path}.maxDrops`, "maxDrops must be a positive integer.");
  }

  if (challenge.palette.length < 2) {
    addIssue(issues, `${path}.palette`, "Solve challenge palette must contain at least 2 pigments.");
  }

  const paletteSet = new Set<string>();

  for (const [paletteIndex, pigmentId] of challenge.palette.entries()) {

    if (!isNonEmptyString(pigmentId)) {
      addIssue(issues, `${path}.palette[${paletteIndex}]`, "Palette pigment id cannot be empty.");
      continue;
    }

    if (!pigmentIds.has(pigmentId)) {
      addIssue(
        issues,
        `${path}.palette[${paletteIndex}]`,
        `Unknown pigment id '${pigmentId}' referenced in palette.`
      );
    }

    if (paletteSet.has(pigmentId)) {
      addIssue(issues, `${path}.palette[${paletteIndex}]`, `Duplicate palette pigment '${pigmentId}'.`);
    }

    paletteSet.add(pigmentId);
  }

  validateFormula(issues, `${path}.referenceRecipe`, challenge.referenceRecipe, pigmentIds, paletteSet);

  const recipeTotalDrops = challenge.referenceRecipe.reduce((total, recipe) => total + recipe.drops, 0);
  const uniqueRecipePigments = new Set(challenge.referenceRecipe.map((recipe) => recipe.pigmentId)).size;

  if (hasValidDifficulty) {
    const profile = SOLVE_BALANCE_PROFILES[challenge.difficulty];

    validateBalanceRange(
      issues,
      `${path}.maxDrops`,
      "maxDrops",
      challenge.maxDrops,
      profile.maxDrops
    );
    validateBalanceRange(
      issues,
      `${path}.referenceRecipe`,
      "Reference recipe total drops",
      recipeTotalDrops,
      profile.recipeTotalDrops
    );
    validateBalanceRange(
      issues,
      `${path}.referenceRecipe`,
      "Unique pigments in reference recipe",
      uniqueRecipePigments,
      profile.uniqueRecipePigments
    );
  }

  if (isPositiveInteger(challenge.maxDrops) && recipeTotalDrops > challenge.maxDrops) {
    addIssue(
      issues,
      `${path}.referenceRecipe`,
      "Reference recipe total drops must not exceed maxDrops for fair solvability."
    );
  }
}

function validatePredictChallenge(
  issues: ContentValidationIssue[],
  challenge: PredictChallengeDefinition,
  index: number,
  pigmentIds: ReadonlySet<string>,
  pigmentById: ReadonlyMap<string, PigmentDefinition>
): void {
  const path = `predictChallenges[${index}]`;

  if (!isNonEmptyString(challenge.id)) {
    addIssue(issues, `${path}.id`, "Challenge id cannot be empty.");
  }

  if (!isNonEmptyString(challenge.title)) {
    addIssue(issues, `${path}.title`, "Challenge title cannot be empty.");
  }

  if (!isNonEmptyString(challenge.brief)) {
    addIssue(issues, `${path}.brief`, "Challenge brief cannot be empty.");
  }

  const hasValidDifficulty = validateDifficulty(
    issues,
    `${path}.difficulty`,
    challenge.difficulty
  );

  validateFormula(issues, `${path}.formula`, challenge.formula, pigmentIds);

  if (challenge.distractors.length !== 3) {
    addIssue(issues, `${path}.distractors`, "Predict challenges must define exactly 3 distractors.");
  }

  for (const [distractorIndex, distractor] of challenge.distractors.entries()) {
    validateFormula(
      issues,
      `${path}.distractors[${distractorIndex}]`,
      distractor,
      pigmentIds
    );
  }

  if (!Number.isInteger(challenge.correctOptionSlot) || challenge.correctOptionSlot < 0) {
    addIssue(
      issues,
      `${path}.correctOptionSlot`,
      "correctOptionSlot must be a non-negative integer."
    );
  }

  const maxOptionIndex = challenge.distractors.length;

  if (challenge.correctOptionSlot > maxOptionIndex) {
    addIssue(
      issues,
      `${path}.correctOptionSlot`,
      "correctOptionSlot must fit into the final option list (distractors + correct option)."
    );
  }

  const formulaKeys = [normalizeFormulaKey(challenge.formula)];

  for (const distractor of challenge.distractors) {
    formulaKeys.push(normalizeFormulaKey(distractor));
  }

  const keySet = new Set<string>();

  for (const key of formulaKeys) {
    if (keySet.has(key)) {
      addIssue(
        issues,
        `${path}.distractors`,
        "Predict challenge contains duplicate formulas between correct and distractor options."
      );
      break;
    }

    keySet.add(key);
  }

  const formulaStats = getFormulaStats(challenge.formula);
  const targetInputs = buildFormulaMixInputs(challenge.formula, pigmentById);
  const distractorDeltaE00Values: number[] = [];

  if (targetInputs) {
    const targetColor = mixWeightedRgb(targetInputs);

    for (const [distractorIndex, distractor] of challenge.distractors.entries()) {
      const distractorInputs = buildFormulaMixInputs(distractor, pigmentById);

      if (!distractorInputs) {
        continue;
      }

      const distractorColor = mixWeightedRgb(distractorInputs);
      const deltaE00 = scorePerceptualMatch(targetColor, distractorColor).deltaE00;
      distractorDeltaE00Values.push(deltaE00);

      if (!Number.isFinite(deltaE00)) {
        addIssue(
          issues,
          `${path}.distractors[${distractorIndex}]`,
          "Distractor perceptual distance could not be computed."
        );
      }
    }
  }

  if (hasValidDifficulty) {
    const profile = PREDICT_BALANCE_PROFILES[challenge.difficulty];

    validateBalanceRange(
      issues,
      `${path}.formula`,
      "Formula total drops",
      formulaStats.totalDrops,
      profile.formulaTotalDrops
    );
    validateBalanceRange(
      issues,
      `${path}.formula`,
      "Unique pigments in formula",
      formulaStats.uniquePigments,
      profile.uniqueFormulaPigments
    );

    if (distractorDeltaE00Values.length > 0) {
      const minDeltaE00 = Math.min(...distractorDeltaE00Values);

      validateBalanceRange(
        issues,
        `${path}.distractors`,
        "Minimum distractor DeltaE00",
        minDeltaE00,
        profile.minDistractorDeltaE00
      );
    }
  }
}

function validatePack(
  issues: ContentValidationIssue[],
  pack: ChallengePackDefinition,
  index: number,
  challengeIds: ReadonlySet<string>,
  challengeMetadataById: ReadonlyMap<string, ChallengeMetadata>
): void {
  const path = `packs[${index}]`;

  if (!isNonEmptyString(pack.id)) {
    addIssue(issues, `${path}.id`, "Pack id cannot be empty.");
  }

  if (!isNonEmptyString(pack.title)) {
    addIssue(issues, `${path}.title`, "Pack title cannot be empty.");
  }

  if (pack.challengeIds.length === 0) {
    addIssue(issues, `${path}.challengeIds`, "Pack must include at least one challenge id.");
  }

  const seenIds = new Set<string>();
  const difficultyCounts: Record<ChallengeDifficulty, number> = { easy: 0, medium: 0, hard: 0 };
  const modeCounts: Record<ChallengeMode, number> = { solve: 0, predict: 0 };
  let previousDifficultyOrder = -1;
  let consecutiveModeCount = 0;
  let previousMode: ChallengeMode | null = null;

  for (const [challengeIndex, challengeId] of pack.challengeIds.entries()) {

    if (!isNonEmptyString(challengeId)) {
      addIssue(
        issues,
        `${path}.challengeIds[${challengeIndex}]`,
        "Challenge id in pack cannot be empty."
      );
      continue;
    }

    if (!challengeIds.has(challengeId)) {
      addIssue(
        issues,
        `${path}.challengeIds[${challengeIndex}]`,
        `Pack references unknown challenge id '${challengeId}'.`
      );
    }

    if (seenIds.has(challengeId)) {
      addIssue(
        issues,
        `${path}.challengeIds[${challengeIndex}]`,
        `Pack contains duplicate challenge id '${challengeId}'.`
      );
    }

    seenIds.add(challengeId);

    const metadata = challengeMetadataById.get(challengeId);

    if (!metadata) {
      continue;
    }

    modeCounts[metadata.mode] += 1;
    difficultyCounts[metadata.difficulty] += 1;

    const currentDifficultyOrder = DIFFICULTY_ORDER[metadata.difficulty];

    if (currentDifficultyOrder < previousDifficultyOrder) {
      addIssue(
        issues,
        `${path}.challengeIds[${challengeIndex}]`,
        "Pack difficulty progression must be non-decreasing (easy -> medium -> hard)."
      );
    }

    previousDifficultyOrder = currentDifficultyOrder;

    if (previousMode === metadata.mode) {
      consecutiveModeCount += 1;
    } else {
      consecutiveModeCount = 1;
      previousMode = metadata.mode;
    }

    if (consecutiveModeCount > 2) {
      addIssue(
        issues,
        `${path}.challengeIds[${challengeIndex}]`,
        "Pack should not include more than 2 consecutive challenges from the same mode."
      );
    }
  }

  if (modeCounts.solve === 0 || modeCounts.predict === 0) {
    addIssue(
      issues,
      `${path}.challengeIds`,
      "Pack must include at least one solve and one predict challenge."
    );
  }

  if (pack.id === "starter-essentials") {
    if (difficultyCounts.easy < 2 || difficultyCounts.medium < 2 || difficultyCounts.hard < 2) {
      addIssue(
        issues,
        `${path}.challengeIds`,
        "Starter pack must include at least 2 easy, 2 medium, and 2 hard challenges."
      );
    }
  }
}

export function validateGameContent(content: GameContentDefinition): ContentValidationIssue[] {
  const issues: ContentValidationIssue[] = [];

  if (!isPositiveInteger(content.version)) {
    addIssue(issues, "version", "version must be a positive integer.");
  }

  if (content.pigments.length === 0) {
    addIssue(issues, "pigments", "Content must define at least one pigment.");
  }

  const pigmentIds = new Set<string>();
  const pigmentById = new Map<string, PigmentDefinition>();

  for (const [index, pigment] of content.pigments.entries()) {
    const path = `pigments[${index}]`;

    if (!isNonEmptyString(pigment.id)) {
      addIssue(issues, `${path}.id`, "Pigment id cannot be empty.");
    }

    if (pigmentIds.has(pigment.id)) {
      addIssue(issues, `${path}.id`, `Duplicate pigment id '${pigment.id}'.`);
    }

    pigmentIds.add(pigment.id);
    pigmentById.set(pigment.id, pigment);

    if (!isNonEmptyString(pigment.label)) {
      addIssue(issues, `${path}.label`, "Pigment label cannot be empty.");
    }

    validateRgbColor(issues, `${path}.rgb`, pigment.rgb);
  }

  const solveIds = new Set<string>();
  const challengeMetadataById = new Map<string, ChallengeMetadata>();

  for (const [index, challenge] of content.solveChallenges.entries()) {

    if (solveIds.has(challenge.id)) {
      addIssue(issues, `solveChallenges[${index}].id`, `Duplicate solve challenge id '${challenge.id}'.`);
    }

    solveIds.add(challenge.id);
    if (isChallengeDifficulty(challenge.difficulty)) {
      challengeMetadataById.set(challenge.id, {
        mode: "solve",
        difficulty: challenge.difficulty
      });
    }
    validateSolveChallenge(issues, challenge, index, pigmentIds);
  }

  const predictIds = new Set<string>();

  for (const [index, challenge] of content.predictChallenges.entries()) {

    if (predictIds.has(challenge.id)) {
      addIssue(
        issues,
        `predictChallenges[${index}].id`,
        `Duplicate predict challenge id '${challenge.id}'.`
      );
    }

    predictIds.add(challenge.id);
    if (isChallengeDifficulty(challenge.difficulty)) {
      challengeMetadataById.set(challenge.id, {
        mode: "predict",
        difficulty: challenge.difficulty
      });
    }
    validatePredictChallenge(issues, challenge, index, pigmentIds, pigmentById);
  }

  if (content.packs) {
    const allChallengeIds = new Set<string>([...solveIds, ...predictIds]);
    const packIds = new Set<string>();

    for (const [index, pack] of content.packs.entries()) {

      if (packIds.has(pack.id)) {
        addIssue(issues, `packs[${index}].id`, `Duplicate pack id '${pack.id}'.`);
      }

      packIds.add(pack.id);
      validatePack(issues, pack, index, allChallengeIds, challengeMetadataById);
    }
  }

  return issues;
}

export function formatValidationIssues(issues: readonly ContentValidationIssue[]): string {
  return issues.map((issue) => `- ${issue.path}: ${issue.message}`).join("\n");
}

export function assertValidGameContent(content: GameContentDefinition): void {
  const issues = validateGameContent(content);

  if (issues.length === 0) {
    return;
  }

  throw new Error(`Invalid game content (${issues.length} issues)\n${formatValidationIssues(issues)}`);
}
