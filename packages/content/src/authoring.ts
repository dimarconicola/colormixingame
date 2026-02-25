import type {
  ChallengeDifficulty,
  ChallengePackDefinition,
  DiscriminateChallengeDefinition,
  PredictChallengeDefinition,
  SolveChallengeDefinition
} from "./schema.js";

export type AuthoringMode = "solve" | "predict" | "discriminate";

type ChallengeTemplate =
  | SolveChallengeDefinition
  | PredictChallengeDefinition
  | DiscriminateChallengeDefinition;

function ensureTitle(id: string, title?: string): string {
  if (title && title.trim().length > 0) {
    return title.trim();
  }

  return id
    .split("-")
    .filter((part) => part.length > 0)
    .map((part) => part[0]!.toUpperCase() + part.slice(1))
    .join(" ");
}

function assertDifficulty(value: string): ChallengeDifficulty {
  if (value === "easy" || value === "medium" || value === "hard") {
    return value;
  }

  throw new Error(`Unknown difficulty '${value}'. Expected easy, medium, or hard.`);
}

export function createChallengeTemplate(params: {
  mode: AuthoringMode;
  id: string;
  title?: string;
  difficulty?: ChallengeDifficulty;
}): ChallengeTemplate {
  const title = ensureTitle(params.id, params.title);
  const difficulty = params.difficulty ?? "easy";

  if (params.mode === "solve") {
    return {
      id: params.id,
      title,
      brief: "Describe the target mood and available constraints.",
      difficulty,
      maxDrops: difficulty === "hard" ? 9 : difficulty === "medium" ? 8 : 7,
      palette: ["cadmium-red", "hansa-yellow", "ultramarine", "titanium-white"],
      referenceRecipe: [
        { pigmentId: "cadmium-red", drops: 2 },
        { pigmentId: "hansa-yellow", drops: 2 },
        { pigmentId: "titanium-white", drops: 2 }
      ]
    };
  }

  if (params.mode === "predict") {
    return {
      id: params.id,
      title,
      brief: "Describe what the player should infer from the formula.",
      difficulty,
      formula: [
        { pigmentId: "cadmium-red", drops: 2 },
        { pigmentId: "titanium-white", drops: 2 }
      ],
      distractors: [
        [
          { pigmentId: "cadmium-red", drops: 1 },
          { pigmentId: "hansa-yellow", drops: 1 },
          { pigmentId: "titanium-white", drops: 3 }
        ],
        [
          { pigmentId: "cadmium-red", drops: 2 },
          { pigmentId: "hansa-yellow", drops: 1 },
          { pigmentId: "titanium-white", drops: 2 }
        ],
        [
          { pigmentId: "cadmium-red", drops: 1 },
          { pigmentId: "ultramarine", drops: 1 },
          { pigmentId: "titanium-white", drops: 3 }
        ]
      ],
      correctOptionSlot: 1
    };
  }

  return {
    id: params.id,
    title,
    brief: "Describe the contextual bias and twin-finding goal.",
    difficulty,
    contextVariant: "neutral-studio",
    target: { r: 160, g: 145, b: 130 },
    options: [
      { r: 166, g: 149, b: 133 },
      { r: 160, g: 145, b: 130 },
      { r: 154, g: 141, b: 127 },
      { r: 170, g: 152, b: 138 }
    ],
    correctOptionSlot: 1
  };
}

export function createPackTemplate(params: {
  id: string;
  title?: string;
  challengeIds?: readonly string[];
}): ChallengePackDefinition {
  return {
    id: params.id,
    title: ensureTitle(params.id, params.title),
    challengeIds:
      params.challengeIds && params.challengeIds.length > 0
        ? [...params.challengeIds]
        : ["solve-challenge-id", "predict-challenge-id"]
  };
}

export function parseAuthoringMode(value: string): AuthoringMode {
  if (value === "solve" || value === "predict" || value === "discriminate") {
    return value;
  }

  throw new Error(`Unknown mode '${value}'. Expected solve, predict, or discriminate.`);
}

export function parseChallengeDifficulty(value: string): ChallengeDifficulty {
  return assertDifficulty(value);
}
