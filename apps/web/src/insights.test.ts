import { describe, expect, it } from "vitest";
import {
  SESSION_INSIGHTS_STORAGE_KEY,
  createDefaultSessionInsights,
  parseSessionInsights,
  readSessionInsights,
  recordDiaryAction,
  recordModeCompletion,
  recordModeStart,
  writeSessionInsights
} from "./insights";

function createStorageStub(initialRawValue: string | null = null): Storage {
  const store = new Map<string, string>();

  if (initialRawValue !== null) {
    store.set(SESSION_INSIGHTS_STORAGE_KEY, initialRawValue);
  }

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

describe("session insights parsing", () => {
  it("returns null for invalid payloads", () => {
    expect(parseSessionInsights("{bad")).toBeNull();
    expect(parseSessionInsights("{}")).toBeNull();
  });

  it("builds defaults when storage is missing/invalid", () => {
    expect(readSessionInsights(null).totalChallengesStarted).toBe(0);
    expect(readSessionInsights(createStorageStub("{bad")).totalChallengesStarted).toBe(0);
  });
});

describe("session insights updates", () => {
  it("tracks starts, completions, and diary actions", () => {
    let insights = createDefaultSessionInsights();

    insights = recordModeStart(insights, "solve");
    insights = recordModeCompletion(insights, "solve");
    insights = recordDiaryAction(insights, "save");
    insights = recordDiaryAction(insights, "export");
    insights = recordDiaryAction(insights, "import");

    expect(insights.totalChallengesStarted).toBe(1);
    expect(insights.totalChallengesCompleted).toBe(1);
    expect(insights.modeStarts.solve).toBe(1);
    expect(insights.modeCompletions.solve).toBe(1);
    expect(insights.diarySaves).toBe(1);
    expect(insights.diaryExports).toBe(1);
    expect(insights.diaryImports).toBe(1);
  });

  it("writes and reads from storage", () => {
    const storage = createStorageStub();
    const insights = recordModeStart(createDefaultSessionInsights(), "predict");

    writeSessionInsights(insights, storage);
    const loaded = readSessionInsights(storage);

    expect(loaded.modeStarts.predict).toBe(1);
  });
});
