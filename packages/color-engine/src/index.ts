export type RgbColor = {
  r: number;
  g: number;
  b: number;
};

export type WeightedColorInput = {
  color: RgbColor;
  weight: number;
};

function clampChannel(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

export function mixWeightedRgb(inputs: readonly WeightedColorInput[]): RgbColor {
  if (inputs.length === 0) {
    throw new Error("mixWeightedRgb requires at least one input.");
  }

  let totalWeight = 0;
  let r = 0;
  let g = 0;
  let b = 0;

  for (const input of inputs) {
    if (input.weight <= 0) {
      continue;
    }

    totalWeight += input.weight;
    r += input.color.r * input.weight;
    g += input.color.g * input.weight;
    b += input.color.b * input.weight;
  }

  if (totalWeight === 0) {
    throw new Error("mixWeightedRgb requires at least one positive weight.");
  }

  return {
    r: clampChannel(r / totalWeight),
    g: clampChannel(g / totalWeight),
    b: clampChannel(b / totalWeight)
  };
}

export function rgbToHex(color: RgbColor): string {
  const channels = [color.r, color.g, color.b].map((value) =>
    clampChannel(value).toString(16).padStart(2, "0")
  );

  return `#${channels.join("")}`;
}
