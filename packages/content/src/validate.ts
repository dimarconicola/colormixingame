import type {
  ChallengePackDefinition,
  ContentRgbColor,
  ContentValidationIssue,
  FormulaEntryDefinition,
  GameContentDefinition,
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

function addIssue(issues: ContentValidationIssue[], path: string, message: string): void {
  issues.push({ path, message });
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
  pigmentIds: ReadonlySet<string>
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
}

function validatePack(
  issues: ContentValidationIssue[],
  pack: ChallengePackDefinition,
  index: number,
  challengeIds: ReadonlySet<string>
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

  for (const [index, pigment] of content.pigments.entries()) {
    const path = `pigments[${index}]`;

    if (!isNonEmptyString(pigment.id)) {
      addIssue(issues, `${path}.id`, "Pigment id cannot be empty.");
    }

    if (pigmentIds.has(pigment.id)) {
      addIssue(issues, `${path}.id`, `Duplicate pigment id '${pigment.id}'.`);
    }

    pigmentIds.add(pigment.id);

    if (!isNonEmptyString(pigment.label)) {
      addIssue(issues, `${path}.label`, "Pigment label cannot be empty.");
    }

    validateRgbColor(issues, `${path}.rgb`, pigment.rgb);
  }

  const solveIds = new Set<string>();

  for (const [index, challenge] of content.solveChallenges.entries()) {

    if (solveIds.has(challenge.id)) {
      addIssue(issues, `solveChallenges[${index}].id`, `Duplicate solve challenge id '${challenge.id}'.`);
    }

    solveIds.add(challenge.id);
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
    validatePredictChallenge(issues, challenge, index, pigmentIds);
  }

  if (content.packs) {
    const allChallengeIds = new Set<string>([...solveIds, ...predictIds]);
    const packIds = new Set<string>();

    for (const [index, pack] of content.packs.entries()) {

      if (packIds.has(pack.id)) {
        addIssue(issues, `packs[${index}].id`, `Duplicate pack id '${pack.id}'.`);
      }

      packIds.add(pack.id);
      validatePack(issues, pack, index, allChallengeIds);
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
