import type { RgbColor } from "./types.js";

export type LabColor = {
  l: number;
  a: number;
  b: number;
};

export type PerceptualBandName = "perfect" | "excellent" | "good" | "fair" | "miss";

export type PerceptualBand = {
  name: Exclude<PerceptualBandName, "miss">;
  maxDeltaE: number;
  score: number;
};

export type PerceptualMatchScore = {
  deltaE00: number;
  band: PerceptualBandName;
  score: number;
  passed: boolean;
};

const REF_X = 95.047;
const REF_Y = 100;
const REF_Z = 108.883;

const DELTA_E_KL = 1;
const DELTA_E_KC = 1;
const DELTA_E_KH = 1;

export const DEFAULT_PERCEPTUAL_BANDS: readonly PerceptualBand[] = [
  {
    name: "perfect",
    maxDeltaE: 1,
    score: 100
  },
  {
    name: "excellent",
    maxDeltaE: 2.2,
    score: 90
  },
  {
    name: "good",
    maxDeltaE: 4,
    score: 75
  },
  {
    name: "fair",
    maxDeltaE: 8,
    score: 55
  }
] as const;

function toLinearSrgb(channel: number): number {
  const normalized = channel / 255;

  if (normalized <= 0.04045) {
    return normalized / 12.92;
  }

  return ((normalized + 0.055) / 1.055) ** 2.4;
}

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, value));
}

export function rgbToLab(color: RgbColor): LabColor {
  const linearR = toLinearSrgb(clampChannel(color.r));
  const linearG = toLinearSrgb(clampChannel(color.g));
  const linearB = toLinearSrgb(clampChannel(color.b));

  const x = (linearR * 0.4124564 + linearG * 0.3575761 + linearB * 0.1804375) * 100;
  const y = (linearR * 0.2126729 + linearG * 0.7151522 + linearB * 0.072175) * 100;
  const z = (linearR * 0.0193339 + linearG * 0.119192 + linearB * 0.9503041) * 100;

  const xRatio = x / REF_X;
  const yRatio = y / REF_Y;
  const zRatio = z / REF_Z;

  const fx = xyzToLabComponent(xRatio);
  const fy = xyzToLabComponent(yRatio);
  const fz = xyzToLabComponent(zRatio);

  return {
    l: 116 * fy - 16,
    a: 500 * (fx - fy),
    b: 200 * (fy - fz)
  };
}

function xyzToLabComponent(value: number): number {
  const epsilon = 216 / 24389;
  const kappa = 24389 / 27;

  if (value > epsilon) {
    return Math.cbrt(value);
  }

  return (kappa * value + 16) / 116;
}

export function deltaE00(lab1: LabColor, lab2: LabColor): number {
  const avgLightness = (lab1.l + lab2.l) / 2;

  const chroma1 = Math.sqrt(lab1.a * lab1.a + lab1.b * lab1.b);
  const chroma2 = Math.sqrt(lab2.a * lab2.a + lab2.b * lab2.b);
  const avgChroma = (chroma1 + chroma2) / 2;

  const chromaAdjustment = 0.5 * (1 - Math.sqrt((avgChroma ** 7) / (avgChroma ** 7 + 25 ** 7)));

  const adjustedA1 = (1 + chromaAdjustment) * lab1.a;
  const adjustedA2 = (1 + chromaAdjustment) * lab2.a;

  const adjustedChroma1 = Math.sqrt(adjustedA1 * adjustedA1 + lab1.b * lab1.b);
  const adjustedChroma2 = Math.sqrt(adjustedA2 * adjustedA2 + lab2.b * lab2.b);
  const avgAdjustedChroma = (adjustedChroma1 + adjustedChroma2) / 2;

  const hueAngle1 = calculateHueAngle(adjustedA1, lab1.b);
  const hueAngle2 = calculateHueAngle(adjustedA2, lab2.b);

  const deltaLightness = lab2.l - lab1.l;
  const deltaChroma = adjustedChroma2 - adjustedChroma1;

  const deltaHueAngle = calculateDeltaHueAngle(hueAngle1, hueAngle2, adjustedChroma1, adjustedChroma2);
  const deltaHue =
    2 * Math.sqrt(adjustedChroma1 * adjustedChroma2) * Math.sin(degreesToRadians(deltaHueAngle / 2));

  const avgHueAngle =
    calculateAverageHueAngle(hueAngle1, hueAngle2, adjustedChroma1, adjustedChroma2) ??
    hueAngle1 + hueAngle2;

  const lightnessTerm =
    1 + (0.015 * (avgLightness - 50) * (avgLightness - 50)) /
      Math.sqrt(20 + (avgLightness - 50) * (avgLightness - 50));

  const chromaTerm = 1 + 0.045 * avgAdjustedChroma;

  const hueTerm =
    1 +
    0.015 *
      avgAdjustedChroma *
      (1 -
        0.17 * Math.cos(degreesToRadians(avgHueAngle - 30)) +
        0.24 * Math.cos(degreesToRadians(2 * avgHueAngle)) +
        0.32 * Math.cos(degreesToRadians(3 * avgHueAngle + 6)) -
        0.2 * Math.cos(degreesToRadians(4 * avgHueAngle - 63)));

  const rotationDelta = 30 * Math.exp(-(((avgHueAngle - 275) / 25) ** 2));
  const rotationTerm =
    -2 *
    Math.sqrt((avgAdjustedChroma ** 7) / (avgAdjustedChroma ** 7 + 25 ** 7)) *
    Math.sin(degreesToRadians(2 * rotationDelta));

  const normalizedLightness = deltaLightness / (DELTA_E_KL * lightnessTerm);
  const normalizedChroma = deltaChroma / (DELTA_E_KC * chromaTerm);
  const normalizedHue = deltaHue / (DELTA_E_KH * hueTerm);

  return Math.sqrt(
    normalizedLightness * normalizedLightness +
      normalizedChroma * normalizedChroma +
      normalizedHue * normalizedHue +
      rotationTerm * normalizedChroma * normalizedHue
  );
}

export function classifyDeltaE(
  deltaE: number,
  bands: readonly PerceptualBand[] = DEFAULT_PERCEPTUAL_BANDS
): { band: PerceptualBandName; score: number; passed: boolean } {
  assertValidPerceptualBands(bands);

  for (const band of bands) {
    if (deltaE <= band.maxDeltaE) {
      return {
        band: band.name,
        score: band.score,
        passed: true
      };
    }
  }

  return {
    band: "miss",
    score: 0,
    passed: false
  };
}

export function scorePerceptualMatch(
  target: RgbColor,
  attempt: RgbColor,
  bands: readonly PerceptualBand[] = DEFAULT_PERCEPTUAL_BANDS
): PerceptualMatchScore {
  const targetLab = rgbToLab(target);
  const attemptLab = rgbToLab(attempt);
  const deltaE = deltaE00(targetLab, attemptLab);
  const classification = classifyDeltaE(deltaE, bands);

  return {
    deltaE00: deltaE,
    ...classification
  };
}

export function assertValidPerceptualBands(bands: readonly PerceptualBand[]): void {
  if (bands.length === 0) {
    throw new Error("Perceptual bands must contain at least one entry.");
  }

  let previousMax = -Infinity;

  for (const band of bands) {
    if (!Number.isFinite(band.maxDeltaE) || band.maxDeltaE <= 0) {
      throw new Error("Perceptual band maxDeltaE must be a positive finite number.");
    }

    if (band.maxDeltaE <= previousMax) {
      throw new Error("Perceptual bands must be sorted by increasing maxDeltaE.");
    }

    if (!Number.isFinite(band.score) || band.score < 0 || band.score > 100) {
      throw new Error("Perceptual band score must be between 0 and 100.");
    }

    previousMax = band.maxDeltaE;
  }
}

function calculateHueAngle(a: number, b: number): number {
  if (a === 0 && b === 0) {
    return 0;
  }

  const angle = radiansToDegrees(Math.atan2(b, a));

  return angle >= 0 ? angle : angle + 360;
}

function calculateDeltaHueAngle(
  hue1: number,
  hue2: number,
  chroma1: number,
  chroma2: number
): number {
  if (chroma1 === 0 || chroma2 === 0) {
    return 0;
  }

  const hueDelta = hue2 - hue1;

  if (Math.abs(hueDelta) <= 180) {
    return hueDelta;
  }

  if (hueDelta > 180) {
    return hueDelta - 360;
  }

  return hueDelta + 360;
}

function calculateAverageHueAngle(
  hue1: number,
  hue2: number,
  chroma1: number,
  chroma2: number
): number | null {
  if (chroma1 === 0 || chroma2 === 0) {
    return null;
  }

  if (Math.abs(hue1 - hue2) <= 180) {
    return (hue1 + hue2) / 2;
  }

  if (hue1 + hue2 < 360) {
    return (hue1 + hue2 + 360) / 2;
  }

  return (hue1 + hue2 - 360) / 2;
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value: number): number {
  return (value * 180) / Math.PI;
}
