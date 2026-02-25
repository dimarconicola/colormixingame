import { describe, expect, it } from "vitest";
import {
  SOUND_ENABLED_STORAGE_KEY,
  parseSoundEnabled,
  readSoundEnabled,
  writeSoundEnabled
} from "./polish";

function createStorageStub(initialValue: string | null = null): Storage {
  const store = new Map<string, string>();

  if (initialValue !== null) {
    store.set(SOUND_ENABLED_STORAGE_KEY, initialValue);
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

describe("parseSoundEnabled", () => {
  it("accepts explicit true/false values", () => {
    expect(parseSoundEnabled("1")).toBe(true);
    expect(parseSoundEnabled("true")).toBe(true);
    expect(parseSoundEnabled("0")).toBe(false);
    expect(parseSoundEnabled("false")).toBe(false);
  });

  it("defaults to enabled for unknown values", () => {
    expect(parseSoundEnabled("unknown")).toBe(true);
    expect(parseSoundEnabled(null)).toBe(true);
  });
});

describe("sound preference storage", () => {
  it("reads from storage and defaults to enabled", () => {
    expect(readSoundEnabled(createStorageStub("1"))).toBe(true);
    expect(readSoundEnabled(createStorageStub("0"))).toBe(false);
    expect(readSoundEnabled(createStorageStub())).toBe(true);
    expect(readSoundEnabled(null)).toBe(true);
  });

  it("writes encoded values", () => {
    const storage = createStorageStub();

    writeSoundEnabled(false, storage);
    expect(storage.getItem(SOUND_ENABLED_STORAGE_KEY)).toBe("0");

    writeSoundEnabled(true, storage);
    expect(storage.getItem(SOUND_ENABLED_STORAGE_KEY)).toBe("1");
  });
});
