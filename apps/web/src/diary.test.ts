import { describe, expect, it } from "vitest";
import {
  DIARY_BACKUP_STORAGE_KEY,
  DIARY_STORAGE_KEY,
  createDiaryEntryFromDiscriminate,
  createDiaryEntryFromPredict,
  createDiaryEntryFromSolve,
  getDailyDiaryPrompt,
  mergeDiaryEntries,
  parseDiaryEntries,
  prependDiaryEntry,
  readDiaryEntries,
  removeDiaryEntry,
  serializeDiaryEntries,
  selectDiaryEntries,
  updateDiaryEntry,
  writeDiaryEntries,
  type DiaryEntry
} from "./diary";
import { DISCRIMINATE_CHALLENGES, evaluateDiscriminateAttempt } from "./discriminate";
import { PREDICT_CHALLENGES, evaluatePredictAttempt } from "./predict";
import { SOLVE_CHALLENGES, evaluateSolveAttempt, getAttemptColorFromDrops } from "./solve";

function firstOrThrow<T>(value: T | null | undefined, message: string): T {
  if (value !== null && value !== undefined) {
    return value;
  }

  throw new Error(message);
}

function createStorageStub(initialValues: Record<string, string> = {}): Storage {
  const store = new Map<string, string>(Object.entries(initialValues));

  return {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key) {
      return store.get(key) ?? null;
    },
    key(index) {
      const keys = [...store.keys()];
      return keys[index] ?? null;
    },
    removeItem(key) {
      store.delete(key);
    },
    setItem(key, value) {
      store.set(key, value);
    }
  };
}

describe("parseDiaryEntries", () => {
  it("returns empty array for invalid payload", () => {
    expect(parseDiaryEntries("{oops")).toEqual([]);
    expect(parseDiaryEntries("{}")).toEqual([]);
  });

  it("filters invalid entries in mixed payloads", () => {
    const raw = JSON.stringify([
      {
        id: "a",
        sourceMode: "solve",
        challengeId: "x",
        title: "Entry",
        note: "",
        swatchHex: "#ffffff",
        summary: "ok",
        createdAt: "2026-01-01T10:00:00.000Z",
        updatedAt: "2026-01-01T10:00:00.000Z"
      },
      {
        id: "bad",
        sourceMode: "unknown"
      }
    ]);

    const parsed = parseDiaryEntries(raw);

    expect(parsed).toHaveLength(1);
    expect(parsed[0]?.id).toBe("a");
  });
});

describe("diary storage resilience", () => {
  it("writes primary and backup payloads", () => {
    const storage = createStorageStub();
    const entries: DiaryEntry[] = [
      {
        id: "storage-entry",
        sourceMode: "solve",
        challengeId: "solve-1",
        title: "Stored",
        note: "",
        swatchHex: "#abcdef",
        summary: "stored",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      }
    ];

    writeDiaryEntries(entries, storage);

    expect(storage.getItem(DIARY_STORAGE_KEY)).toBeTruthy();
    expect(storage.getItem(DIARY_BACKUP_STORAGE_KEY)).toBe(storage.getItem(DIARY_STORAGE_KEY));
  });

  it("falls back to backup payload when primary storage is corrupted", () => {
    const backupEntries: DiaryEntry[] = [
      {
        id: "backup-entry",
        sourceMode: "predict",
        challengeId: "predict-1",
        title: "Backup",
        note: "",
        swatchHex: "#112233",
        summary: "backup",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z"
      }
    ];
    const storage = createStorageStub({
      [DIARY_STORAGE_KEY]: "{broken-json",
      [DIARY_BACKUP_STORAGE_KEY]: JSON.stringify(backupEntries)
    });

    expect(readDiaryEntries(storage)).toEqual(backupEntries);
  });
});

describe("diary entry builders", () => {
  it("creates solve, predict, and discriminate entries", () => {
    const solveChallenge = firstOrThrow(SOLVE_CHALLENGES[0], "Expected solve challenge.");
    const dropIds = solveChallenge.referenceRecipe.flatMap((entry) =>
      Array.from({ length: entry.drops }, () => entry.pigmentId)
    );
    const attempt = firstOrThrow(
      getAttemptColorFromDrops(dropIds),
      "Expected solve attempt color from reference recipe."
    );
    const solveResult = evaluateSolveAttempt(solveChallenge, attempt);
    const solveEntry = createDiaryEntryFromSolve({
      challenge: solveChallenge,
      droppedPigments: dropIds,
      attemptHex: "#aabbcc",
      result: solveResult
    });

    const predictChallenge = firstOrThrow(PREDICT_CHALLENGES[0], "Expected predict challenge.");
    const predictResult = firstOrThrow(
      evaluatePredictAttempt(predictChallenge, predictChallenge.correctOptionId),
      "Expected predict result."
    );
    const predictEntry = createDiaryEntryFromPredict({
      challenge: predictChallenge,
      result: predictResult
    });

    const discriminateChallenge = firstOrThrow(
      DISCRIMINATE_CHALLENGES[0],
      "Expected discriminate challenge."
    );
    const discriminateResult = firstOrThrow(
      evaluateDiscriminateAttempt(discriminateChallenge, discriminateChallenge.correctOptionId),
      "Expected discriminate result."
    );
    const discriminateEntry = createDiaryEntryFromDiscriminate({
      challenge: discriminateChallenge,
      result: discriminateResult
    });

    expect(solveEntry.sourceMode).toBe("solve");
    expect(predictEntry.sourceMode).toBe("predict");
    expect(discriminateEntry.sourceMode).toBe("discriminate");
    expect(solveEntry.title.length).toBeGreaterThan(0);
    expect(predictEntry.summary).toContain("Pick:");
    expect(discriminateEntry.summary).toContain("Context:");
  });
});

describe("diary list operations", () => {
  const baseEntries: DiaryEntry[] = [
    {
      id: "e1",
      sourceMode: "solve",
      challengeId: "c1",
      title: "Sunset mix",
      note: "warm",
      swatchHex: "#ffaa99",
      summary: "solve summary",
      createdAt: "2026-01-02T10:00:00.000Z",
      updatedAt: "2026-01-02T10:00:00.000Z"
    },
    {
      id: "e2",
      sourceMode: "predict",
      challengeId: "c2",
      title: "Coral prediction",
      note: "close",
      swatchHex: "#dd8877",
      summary: "predict summary",
      createdAt: "2026-01-03T10:00:00.000Z",
      updatedAt: "2026-01-03T10:00:00.000Z"
    }
  ];

  it("prepends, updates, and removes entries", () => {
    const firstEntry = firstOrThrow(baseEntries[0], "Expected first diary entry.");

    const prepended = prependDiaryEntry(baseEntries, {
      ...firstEntry,
      id: "e0"
    });

    expect(prepended[0]?.id).toBe("e0");

    const updated = updateDiaryEntry(prepended, "e2", {
      title: "Updated",
      note: "notes"
    });

    expect(updated.find((entry) => entry.id === "e2")?.title).toBe("Updated");

    const removed = removeDiaryEntry(updated, "e1");

    expect(removed.some((entry) => entry.id === "e1")).toBe(false);
  });

  it("filters and sorts entries", () => {
    const visible = selectDiaryEntries(baseEntries, {
      filterMode: "predict",
      sort: "newest",
      searchQuery: "coral"
    });

    expect(visible).toHaveLength(1);
    expect(visible[0]?.id).toBe("e2");
  });

  it("merges imported entries and keeps latest updates by id", () => {
    const incoming: DiaryEntry[] = [
      {
        id: "e2",
        sourceMode: "predict",
        challengeId: "c2",
        title: "Coral prediction updated",
        note: "latest",
        swatchHex: "#dd8877",
        summary: "predict summary updated",
        createdAt: "2026-01-03T10:00:00.000Z",
        updatedAt: "2026-01-03T12:00:00.000Z"
      },
      {
        id: "e3",
        sourceMode: "discriminate",
        challengeId: "c3",
        title: "Twin capture",
        note: "",
        swatchHex: "#aabbcc",
        summary: "discriminate summary",
        createdAt: "2026-01-04T10:00:00.000Z",
        updatedAt: "2026-01-04T10:00:00.000Z"
      }
    ];

    const merged = mergeDiaryEntries(baseEntries, incoming);

    expect(merged).toHaveLength(3);
    expect(merged.find((entry) => entry.id === "e2")?.title).toBe("Coral prediction updated");
    expect(serializeDiaryEntries(merged)).toContain("Twin capture");
  });

  it("returns deterministic daily prompt by date", () => {
    const promptA = getDailyDiaryPrompt(new Date("2026-03-01T12:00:00.000Z"));
    const promptB = getDailyDiaryPrompt(new Date("2026-03-01T23:59:59.000Z"));

    expect(promptA).toBe(promptB);
    expect(promptA.length).toBeGreaterThan(10);
  });
});
