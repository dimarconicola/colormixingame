import type { PerceptualMatchScore } from "@colormix/color-engine";
import type { DiscriminateAttemptResult, DiscriminateChallenge } from "./discriminate";
import type { PredictAttemptResult, PredictChallenge } from "./predict";
import type { SolveChallenge, SolvePigmentId } from "./solve";

export const DIARY_STORAGE_KEY = "colormix.diary.v1";

export type DiarySourceMode = "solve" | "predict" | "discriminate";

export type DiaryEntry = {
  id: string;
  sourceMode: DiarySourceMode;
  challengeId: string;
  title: string;
  note: string;
  swatchHex: string;
  summary: string;
  createdAt: string;
  updatedAt: string;
};

export type DiaryFilterMode = "all" | DiarySourceMode;
export type DiarySort = "newest" | "oldest";

type DiaryStorageLike = Pick<Storage, "getItem" | "setItem">;

function nowIsoString(): string {
  return new Date().toISOString();
}

function createDiaryEntryId(): string {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }

  return `entry-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function normalizeText(value: string): string {
  return value.trim().toLowerCase();
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isDiaryEntry(value: unknown): value is DiaryEntry {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    typeof value.id === "string" &&
    (value.sourceMode === "solve" || value.sourceMode === "predict" || value.sourceMode === "discriminate") &&
    typeof value.challengeId === "string" &&
    typeof value.title === "string" &&
    typeof value.note === "string" &&
    typeof value.swatchHex === "string" &&
    typeof value.summary === "string" &&
    typeof value.createdAt === "string" &&
    typeof value.updatedAt === "string"
  );
}

export function parseDiaryEntries(rawValue: string): DiaryEntry[] {
  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!Array.isArray(parsed)) {
      return [];
    }

    const entries: DiaryEntry[] = [];

    for (const entry of parsed) {
      if (!isDiaryEntry(entry)) {
        continue;
      }

      entries.push(entry);
    }

    return entries;
  } catch {
    return [];
  }
}

export function readDiaryEntries(storage: DiaryStorageLike | null | undefined): DiaryEntry[] {
  if (!storage) {
    return [];
  }

  const rawValue = storage.getItem(DIARY_STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  return parseDiaryEntries(rawValue);
}

export function writeDiaryEntries(
  entries: readonly DiaryEntry[],
  storage: DiaryStorageLike | null | undefined
): void {
  if (!storage) {
    return;
  }

  storage.setItem(DIARY_STORAGE_KEY, JSON.stringify(entries));
}

export function serializeDiaryEntries(entries: readonly DiaryEntry[]): string {
  return JSON.stringify(entries, null, 2);
}

export function createDiaryEntryFromSolve(params: {
  challenge: SolveChallenge;
  droppedPigments: readonly SolvePigmentId[];
  attemptHex: string;
  result: PerceptualMatchScore;
}): DiaryEntry {
  const timestamp = nowIsoString();

  return {
    id: createDiaryEntryId(),
    sourceMode: "solve",
    challengeId: params.challenge.id,
    title: `${params.challenge.title} Mix`,
    note: "",
    swatchHex: params.attemptHex,
    summary: `Drops: ${params.droppedPigments.length} | DeltaE00: ${params.result.deltaE00.toFixed(2)} | Score: ${params.result.score}`,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function createDiaryEntryFromPredict(params: {
  challenge: PredictChallenge;
  result: PredictAttemptResult;
}): DiaryEntry {
  const timestamp = nowIsoString();

  return {
    id: createDiaryEntryId(),
    sourceMode: "predict",
    challengeId: params.challenge.id,
    title: `${params.challenge.title} Prediction`,
    note: "",
    swatchHex: params.result.selectedOption.hex,
    summary: `Pick: ${params.result.selectedOption.hex} | Correct: ${params.result.isCorrect ? "yes" : "no"} | DeltaE00: ${params.result.perceptual.deltaE00.toFixed(2)}`,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function createDiaryEntryFromDiscriminate(params: {
  challenge: DiscriminateChallenge;
  result: DiscriminateAttemptResult;
}): DiaryEntry {
  const timestamp = nowIsoString();

  return {
    id: createDiaryEntryId(),
    sourceMode: "discriminate",
    challengeId: params.challenge.id,
    title: `${params.challenge.title} Twin Check`,
    note: "",
    swatchHex: params.result.selectedOption.hex,
    summary: `Context: ${params.challenge.contextVariant} | Correct: ${params.result.isCorrect ? "yes" : "no"} | DeltaE00: ${params.result.perceptual.deltaE00.toFixed(2)}`,
    createdAt: timestamp,
    updatedAt: timestamp
  };
}

export function prependDiaryEntry(entries: readonly DiaryEntry[], entry: DiaryEntry): DiaryEntry[] {
  return [entry, ...entries];
}

export function updateDiaryEntry(
  entries: readonly DiaryEntry[],
  entryId: string,
  patch: { title: string; note: string }
): DiaryEntry[] {
  const timestamp = nowIsoString();

  return entries.map((entry) => {
    if (entry.id !== entryId) {
      return entry;
    }

    return {
      ...entry,
      title: patch.title.trim(),
      note: patch.note,
      updatedAt: timestamp
    };
  });
}

export function removeDiaryEntry(entries: readonly DiaryEntry[], entryId: string): DiaryEntry[] {
  return entries.filter((entry) => entry.id !== entryId);
}

export function mergeDiaryEntries(
  existingEntries: readonly DiaryEntry[],
  incomingEntries: readonly DiaryEntry[]
): DiaryEntry[] {
  const byId = new Map<string, DiaryEntry>();

  for (const entry of existingEntries) {
    byId.set(entry.id, entry);
  }

  for (const entry of incomingEntries) {
    const current = byId.get(entry.id);

    if (!current || current.updatedAt.localeCompare(entry.updatedAt) < 0) {
      byId.set(entry.id, entry);
    }
  }

  return [...byId.values()].sort((left, right) => right.createdAt.localeCompare(left.createdAt));
}

const DAILY_PROMPTS = [
  "Capture a swatch that feels like morning light.",
  "Save a color that could be a forest shadow.",
  "Find a mix that looks like vintage paper.",
  "Create a calm palette and note what makes it feel balanced.",
  "Try a warm-cool contrast and save your favorite result.",
  "Record a neutral color that still feels expressive.",
  "Build a color inspired by your favorite fruit."
] as const;

function dayOfYearUtc(date: Date): number {
  const startOfYearUtc = Date.UTC(date.getUTCFullYear(), 0, 1);
  const dateUtc = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());

  return Math.floor((dateUtc - startOfYearUtc) / 86_400_000);
}

export function getDailyDiaryPrompt(date: Date = new Date()): string {
  const index = dayOfYearUtc(date) % DAILY_PROMPTS.length;
  return DAILY_PROMPTS[index] ?? DAILY_PROMPTS[0];
}

export function selectDiaryEntries(
  entries: readonly DiaryEntry[],
  options: {
    filterMode: DiaryFilterMode;
    sort: DiarySort;
    searchQuery: string;
  }
): DiaryEntry[] {
  const searchQuery = normalizeText(options.searchQuery);

  const filtered = entries.filter((entry) => {
    if (options.filterMode !== "all" && entry.sourceMode !== options.filterMode) {
      return false;
    }

    if (!searchQuery) {
      return true;
    }

    const haystack = normalizeText(`${entry.title} ${entry.note} ${entry.summary} ${entry.swatchHex}`);

    return haystack.includes(searchQuery);
  });

  return [...filtered].sort((left, right) => {
    if (options.sort === "oldest") {
      return left.createdAt.localeCompare(right.createdAt);
    }

    return right.createdAt.localeCompare(left.createdAt);
  });
}
