export const SOUND_ENABLED_STORAGE_KEY = "colormix.sound.enabled.v1";
export const HIGH_CONTRAST_STORAGE_KEY = "colormix.contrast.enabled.v1";
export const COLOR_ASSIST_STORAGE_KEY = "colormix.colorassist.enabled.v1";

type StorageLike = Pick<Storage, "getItem" | "setItem">;

export type SoundCue = "tap" | "start" | "success" | "error" | "save" | "delete";

type CueStep = {
  frequency: number;
  durationSeconds: number;
  gain: number;
  type?: OscillatorType;
};

const CUE_STEPS: Record<SoundCue, readonly CueStep[]> = {
  tap: [{ frequency: 620, durationSeconds: 0.05, gain: 0.024, type: "triangle" }],
  start: [{ frequency: 520, durationSeconds: 0.08, gain: 0.03, type: "sine" }],
  success: [
    { frequency: 610, durationSeconds: 0.07, gain: 0.03, type: "triangle" },
    { frequency: 760, durationSeconds: 0.09, gain: 0.032, type: "triangle" }
  ],
  error: [
    { frequency: 430, durationSeconds: 0.08, gain: 0.03, type: "sawtooth" },
    { frequency: 350, durationSeconds: 0.08, gain: 0.027, type: "sawtooth" }
  ],
  save: [{ frequency: 700, durationSeconds: 0.07, gain: 0.029, type: "triangle" }],
  delete: [{ frequency: 300, durationSeconds: 0.08, gain: 0.028, type: "sawtooth" }]
};

type AudioContextConstructorLike = {
  new (): AudioContext;
};

type GlobalAudioScope = typeof globalThis & {
  AudioContext?: AudioContextConstructorLike;
  webkitAudioContext?: AudioContextConstructorLike;
};

export type UiSoundPlayer = {
  play: (cue: SoundCue) => void;
};

function resolveAudioContextConstructor(): AudioContextConstructorLike | null {
  const scope = globalThis as GlobalAudioScope;

  return scope.AudioContext ?? scope.webkitAudioContext ?? null;
}

class WebAudioSoundPlayer implements UiSoundPlayer {
  private readonly audioContextConstructor: AudioContextConstructorLike | null;
  private audioContext: AudioContext | null = null;

  public constructor(audioContextConstructor: AudioContextConstructorLike | null) {
    this.audioContextConstructor = audioContextConstructor;
  }

  public play(cue: SoundCue): void {
    if (!this.audioContextConstructor) {
      return;
    }

    const context = this.getAudioContext();

    if (!context) {
      return;
    }

    if (context.state === "suspended") {
      void context.resume().catch(() => undefined);
    }

    const steps = CUE_STEPS[cue];
    let cursor = context.currentTime;

    for (const step of steps) {
      const oscillator = context.createOscillator();
      const gainNode = context.createGain();

      oscillator.type = step.type ?? "sine";
      oscillator.frequency.setValueAtTime(step.frequency, cursor);

      gainNode.gain.setValueAtTime(0.0001, cursor);
      gainNode.gain.exponentialRampToValueAtTime(step.gain, cursor + 0.012);
      gainNode.gain.exponentialRampToValueAtTime(0.0001, cursor + step.durationSeconds);

      oscillator.connect(gainNode);
      gainNode.connect(context.destination);

      oscillator.start(cursor);
      oscillator.stop(cursor + step.durationSeconds + 0.02);

      cursor += step.durationSeconds + 0.016;
    }
  }

  private getAudioContext(): AudioContext | null {
    if (!this.audioContext && this.audioContextConstructor) {
      this.audioContext = new this.audioContextConstructor();
    }

    return this.audioContext;
  }
}

export function parseSoundEnabled(rawValue: string | null | undefined): boolean {
  return parseBooleanPreference(rawValue, true);
}

export function parseHighContrastEnabled(rawValue: string | null | undefined): boolean {
  return parseBooleanPreference(rawValue, false);
}

export function parseColorAssistEnabled(rawValue: string | null | undefined): boolean {
  return parseBooleanPreference(rawValue, false);
}

function parseBooleanPreference(
  rawValue: string | null | undefined,
  fallback: boolean
): boolean {
  if (rawValue === "0" || rawValue === "false") {
    return false;
  }

  if (rawValue === "1" || rawValue === "true") {
    return true;
  }

  return fallback;
}

export function readSoundEnabled(storage: StorageLike | null | undefined): boolean {
  if (!storage) {
    return true;
  }

  return parseSoundEnabled(storage.getItem(SOUND_ENABLED_STORAGE_KEY));
}

export function writeSoundEnabled(
  enabled: boolean,
  storage: StorageLike | null | undefined
): void {
  if (!storage) {
    return;
  }

  storage.setItem(SOUND_ENABLED_STORAGE_KEY, enabled ? "1" : "0");
}

export function readHighContrastEnabled(storage: StorageLike | null | undefined): boolean {
  if (!storage) {
    return false;
  }

  return parseHighContrastEnabled(storage.getItem(HIGH_CONTRAST_STORAGE_KEY));
}

export function writeHighContrastEnabled(
  enabled: boolean,
  storage: StorageLike | null | undefined
): void {
  if (!storage) {
    return;
  }

  storage.setItem(HIGH_CONTRAST_STORAGE_KEY, enabled ? "1" : "0");
}

export function readColorAssistEnabled(storage: StorageLike | null | undefined): boolean {
  if (!storage) {
    return false;
  }

  return parseColorAssistEnabled(storage.getItem(COLOR_ASSIST_STORAGE_KEY));
}

export function writeColorAssistEnabled(
  enabled: boolean,
  storage: StorageLike | null | undefined
): void {
  if (!storage) {
    return;
  }

  storage.setItem(COLOR_ASSIST_STORAGE_KEY, enabled ? "1" : "0");
}

export function createUiSoundPlayer(): UiSoundPlayer {
  return new WebAudioSoundPlayer(resolveAudioContextConstructor());
}
