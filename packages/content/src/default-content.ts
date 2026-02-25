import type { GameContentDefinition } from "./schema.js";

export const DEFAULT_GAME_CONTENT = {
  version: 1,
  pigments: [
    {
      id: "cadmium-red",
      label: "Cadmium Red",
      rgb: { r: 255, g: 76, b: 58 }
    },
    {
      id: "hansa-yellow",
      label: "Hansa Yellow",
      rgb: { r: 255, g: 204, b: 51 }
    },
    {
      id: "ultramarine",
      label: "Ultramarine",
      rgb: { r: 62, g: 102, b: 255 }
    },
    {
      id: "titanium-white",
      label: "Titanium White",
      rgb: { r: 245, g: 245, b: 245 }
    },
    {
      id: "mars-black",
      label: "Mars Black",
      rgb: { r: 32, g: 34, b: 38 }
    }
  ],
  solveChallenges: [
    {
      id: "sunset-peach",
      title: "Sunset Peach",
      brief: "Match a warm pastel by balancing red, yellow, and white.",
      maxDrops: 8,
      palette: ["cadmium-red", "hansa-yellow", "titanium-white", "mars-black"],
      referenceRecipe: [
        { pigmentId: "cadmium-red", drops: 2 },
        { pigmentId: "hansa-yellow", drops: 2 },
        { pigmentId: "titanium-white", drops: 3 }
      ]
    },
    {
      id: "storm-lilac",
      title: "Storm Lilac",
      brief: "Build a cool violet-grey with subtle dark neutralization.",
      maxDrops: 9,
      palette: ["cadmium-red", "ultramarine", "titanium-white", "mars-black"],
      referenceRecipe: [
        { pigmentId: "cadmium-red", drops: 2 },
        { pigmentId: "ultramarine", drops: 2 },
        { pigmentId: "titanium-white", drops: 4 },
        { pigmentId: "mars-black", drops: 1 }
      ]
    },
    {
      id: "moss-field",
      title: "Moss Field",
      brief: "Reach a muted natural green using yellow, blue, and black.",
      maxDrops: 8,
      palette: ["hansa-yellow", "ultramarine", "titanium-white", "mars-black"],
      referenceRecipe: [
        { pigmentId: "hansa-yellow", drops: 3 },
        { pigmentId: "ultramarine", drops: 2 },
        { pigmentId: "mars-black", drops: 1 }
      ]
    }
  ],
  predictChallenges: [
    {
      id: "predict-coral-flare",
      title: "Coral Flare",
      brief: "Pick the resulting swatch for this warm coral recipe.",
      formula: [
        { pigmentId: "cadmium-red", drops: 2 },
        { pigmentId: "hansa-yellow", drops: 1 },
        { pigmentId: "titanium-white", drops: 2 }
      ],
      distractors: [
        [
          { pigmentId: "cadmium-red", drops: 2 },
          { pigmentId: "hansa-yellow", drops: 2 },
          { pigmentId: "titanium-white", drops: 1 }
        ],
        [
          { pigmentId: "cadmium-red", drops: 1 },
          { pigmentId: "hansa-yellow", drops: 1 },
          { pigmentId: "titanium-white", drops: 4 }
        ],
        [
          { pigmentId: "cadmium-red", drops: 2 },
          { pigmentId: "ultramarine", drops: 1 },
          { pigmentId: "titanium-white", drops: 2 }
        ]
      ],
      correctOptionSlot: 1
    },
    {
      id: "predict-river-stone",
      title: "River Stone",
      brief: "Predict a muted cool neutral from the listed formula.",
      formula: [
        { pigmentId: "ultramarine", drops: 2 },
        { pigmentId: "titanium-white", drops: 3 },
        { pigmentId: "mars-black", drops: 1 }
      ],
      distractors: [
        [
          { pigmentId: "ultramarine", drops: 2 },
          { pigmentId: "titanium-white", drops: 2 }
        ],
        [
          { pigmentId: "ultramarine", drops: 1 },
          { pigmentId: "titanium-white", drops: 4 },
          { pigmentId: "mars-black", drops: 1 }
        ],
        [
          { pigmentId: "cadmium-red", drops: 1 },
          { pigmentId: "ultramarine", drops: 1 },
          { pigmentId: "titanium-white", drops: 3 },
          { pigmentId: "mars-black", drops: 1 }
        ]
      ],
      correctOptionSlot: 2
    },
    {
      id: "predict-moss-mint",
      title: "Moss Mint",
      brief: "Estimate the green output when yellow and blue are cooled and softened.",
      formula: [
        { pigmentId: "hansa-yellow", drops: 2 },
        { pigmentId: "ultramarine", drops: 1 },
        { pigmentId: "titanium-white", drops: 2 },
        { pigmentId: "mars-black", drops: 1 }
      ],
      distractors: [
        [
          { pigmentId: "hansa-yellow", drops: 3 },
          { pigmentId: "ultramarine", drops: 1 },
          { pigmentId: "titanium-white", drops: 1 }
        ],
        [
          { pigmentId: "hansa-yellow", drops: 2 },
          { pigmentId: "ultramarine", drops: 2 },
          { pigmentId: "titanium-white", drops: 2 }
        ],
        [
          { pigmentId: "hansa-yellow", drops: 2 },
          { pigmentId: "ultramarine", drops: 1 },
          { pigmentId: "titanium-white", drops: 3 }
        ]
      ],
      correctOptionSlot: 0
    }
  ],
  packs: [
    {
      id: "starter-essentials",
      title: "Starter Essentials",
      challengeIds: [
        "sunset-peach",
        "storm-lilac",
        "moss-field",
        "predict-coral-flare",
        "predict-river-stone",
        "predict-moss-mint"
      ]
    }
  ]
} as const satisfies GameContentDefinition;
