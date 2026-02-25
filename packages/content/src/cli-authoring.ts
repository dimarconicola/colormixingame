import { mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import {
  createChallengeTemplate,
  createPackTemplate,
  parseAuthoringMode,
  parseChallengeDifficulty
} from "./authoring.js";

type CliOptions = {
  kind: "challenge" | "pack";
  mode?: string;
  id?: string;
  title?: string;
  difficulty?: string;
  output?: string;
  challengeIds?: string[];
};

function printHelp(): void {
  console.error(
    [
      "Usage:",
      "  pnpm --filter @colormix/content run authoring:template -- --kind challenge --mode solve --id my-id [--difficulty easy] [--title \"My Title\"] [--output path.json]",
      "  pnpm --filter @colormix/content run authoring:template -- --kind pack --id my-pack [--title \"My Pack\"] [--challenge-ids a,b,c] [--output path.json]"
    ].join("\n")
  );
}

function parseArgs(argv: readonly string[]): CliOptions {
  const options: CliOptions = {
    kind: "challenge"
  };

  for (let index = 0; index < argv.length; index += 1) {
    const current = argv[index];
    const next = argv[index + 1];

    if (!current) {
      continue;
    }

    if (current === "--kind" && next) {
      if (next === "challenge" || next === "pack") {
        options.kind = next;
      }
      index += 1;
      continue;
    }

    if (current === "--mode" && next) {
      options.mode = next;
      index += 1;
      continue;
    }

    if (current === "--id" && next) {
      options.id = next;
      index += 1;
      continue;
    }

    if (current === "--title" && next) {
      options.title = next;
      index += 1;
      continue;
    }

    if (current === "--difficulty" && next) {
      options.difficulty = next;
      index += 1;
      continue;
    }

    if (current === "--output" && next) {
      options.output = next;
      index += 1;
      continue;
    }

    if (current === "--challenge-ids" && next) {
      options.challengeIds = next
        .split(",")
        .map((value) => value.trim())
        .filter((value) => value.length > 0);
      index += 1;
    }
  }

  return options;
}

async function main(): Promise<void> {
  const options = parseArgs(process.argv.slice(2));

  if (!options.id) {
    printHelp();
    throw new Error("Missing required --id.");
  }

  const template =
    options.kind === "pack"
      ? createPackTemplate({
          id: options.id,
          ...(options.title ? { title: options.title } : {}),
          ...(options.challengeIds ? { challengeIds: options.challengeIds } : {})
        })
      : createChallengeTemplate({
          mode: parseAuthoringMode(options.mode ?? "solve"),
          id: options.id,
          ...(options.title ? { title: options.title } : {}),
          ...(options.difficulty
            ? { difficulty: parseChallengeDifficulty(options.difficulty) }
            : {})
        });

  const payload = `${JSON.stringify(template, null, 2)}\n`;

  if (options.output) {
    const absoluteOutputPath = resolve(options.output);
    await mkdir(dirname(absoluteOutputPath), { recursive: true });
    await writeFile(absoluteOutputPath, payload, "utf8");
    console.log(`Template written to ${absoluteOutputPath}`);
    return;
  }

  process.stdout.write(payload);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});
