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
      difficulty: "easy",
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
      difficulty: "hard",
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
      difficulty: "medium",
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
      difficulty: "easy",
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
      difficulty: "hard",
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
      difficulty: "medium",
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
  discriminateChallenges: [
    {
      id: "twin-coral-sunset",
      title: "Coral Sunset Twin",
      brief: "Find the exact coral target among warm near-matches.",
      difficulty: "easy",
      contextVariant: "warm-gallery",
      target: { r: 232, g: 128, b: 103 },
      options: [
        { r: 208, g: 120, b: 122 },
        { r: 244, g: 151, b: 126 },
        { r: 232, g: 128, b: 103 },
        { r: 222, g: 110, b: 84 }
      ],
      correctOptionSlot: 2
    },
    {
      id: "twin-sage-field",
      title: "Sage Field Twin",
      brief: "Pick the exact sage swatch while value and hue shifts are subtle.",
      difficulty: "medium",
      contextVariant: "neutral-studio",
      target: { r: 114, g: 157, b: 118 },
      options: [
        { r: 121, g: 160, b: 113 },
        { r: 114, g: 157, b: 118 },
        { r: 104, g: 147, b: 126 },
        { r: 107, g: 153, b: 121 }
      ],
      correctOptionSlot: 1
    },
    {
      id: "twin-lilac-mist",
      title: "Lilac Mist Twin",
      brief: "Identify the exact muted lilac in a cool ambient context.",
      difficulty: "hard",
      contextVariant: "cool-shadow",
      target: { r: 164, g: 154, b: 172 },
      options: [
        { r: 162, g: 152, b: 169 },
        { r: 164, g: 154, b: 172 },
        { r: 160, g: 150, b: 170 },
        { r: 168, g: 156, b: 175 }
      ],
      correctOptionSlot: 1
    }
  ],
  packs: [
    {
      id: "starter-essentials",
      title: "Starter Essentials (Curated Path)",
      challengeIds: [
        "sunset-peach",
        "predict-coral-flare",
        "moss-field",
        "predict-moss-mint",
        "storm-lilac",
        "predict-river-stone"
      ]
    }
  ]
} as const satisfies GameContentDefinition;
