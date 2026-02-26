import { describe, expect, it } from "vitest";
import {
  BREAK_REMINDER_ENABLED_STORAGE_KEY,
  COLOR_ASSIST_STORAGE_KEY,
  HIGH_CONTRAST_STORAGE_KEY,
  SOUND_ENABLED_STORAGE_KEY,
  parseBreakReminderEnabled,
  parseColorAssistEnabled,
  parseHighContrastEnabled,
  parseSoundEnabled,
  readBreakReminderEnabled,
  readColorAssistEnabled,
  readHighContrastEnabled,
  readSoundEnabled,
  writeBreakReminderEnabled,
  writeColorAssistEnabled,
  writeHighContrastEnabled,
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

describe("parse contrast and assist preferences", () => {
  it("defaults to disabled for unknown values", () => {
    expect(parseHighContrastEnabled("unknown")).toBe(false);
    expect(parseColorAssistEnabled("unknown")).toBe(false);
  });

  it("accepts explicit true/false values", () => {
    expect(parseHighContrastEnabled("1")).toBe(true);
    expect(parseHighContrastEnabled("0")).toBe(false);
    expect(parseColorAssistEnabled("true")).toBe(true);
    expect(parseColorAssistEnabled("false")).toBe(false);
    expect(parseBreakReminderEnabled("1")).toBe(true);
    expect(parseBreakReminderEnabled("false")).toBe(false);
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

  it("reads and writes high contrast + color assist values", () => {
    const storage = createStorageStub();

    writeHighContrastEnabled(true, storage);
    writeColorAssistEnabled(true, storage);
    expect(storage.getItem(HIGH_CONTRAST_STORAGE_KEY)).toBe("1");
    expect(storage.getItem(COLOR_ASSIST_STORAGE_KEY)).toBe("1");
    expect(readHighContrastEnabled(storage)).toBe(true);
    expect(readColorAssistEnabled(storage)).toBe(true);
  });

  it("reads and writes break reminder values", () => {
    const storage = createStorageStub();

    writeBreakReminderEnabled(true, storage);
    expect(storage.getItem(BREAK_REMINDER_ENABLED_STORAGE_KEY)).toBe("1");
    expect(readBreakReminderEnabled(storage)).toBe(true);
    expect(parseBreakReminderEnabled("unknown")).toBe(false);
  });
});
