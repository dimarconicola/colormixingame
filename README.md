# Color Mixing Game

A premium, web-first color play-and-learn app designed for kids and design-minded adults.

The product goal is simple: make color theory feel tactile, intuitive, and replayable through high-quality game interactions, not textbook lessons.

## Product Vision

Build a "color alchemist" experience with toy-grade interaction quality and puzzle-grade learning loops.

The app is built around four pillars:

1. `Solve`: Match target colors under constraints.
2. `Predict`: Predict outcomes from pigment inputs.
3. `Collect`: Save recipes and build a personal color diary.
4. `Discriminate`: Identify subtle color differences.

## Core Functionalities

1. Real-time tactile mixing canvas with paint-like behavior.
2. `Match the Target` mode with progression from simple to constrained/hard variants.
3. `Predict the Result` mode for mental model training.
4. `Find the Twin` mode for perception/discrimination skill.
5. `Color Diary` mode with saved swatches, formulas, and collection wall.
6. Unlock-based progression (pigments, tools, challenge packs, lab rooms).
7. Non-toxic scoring using perceptual accuracy and elegance badges.
8. Offline-first architecture and child-safe product constraints.

Full details: [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md).

## Quality Bar (Non-Negotiable)

1. Mixing must feel physically plausible and responsive.
2. Scoring must use perceptual color distance, not naive RGB deltas.
3. Core game loops must work offline and load quickly.
4. UI must stay calm, uncluttered, and touch-first.
5. Every shipped feature must meet test and performance gates.

Full standards: [`docs/QUALITY_STANDARDS.md`](docs/QUALITY_STANDARDS.md).

## Platform Strategy

### Primary: Web App

Use a web-first approach so the game is easy to test locally on desktop and tablets.

### Secondary: iPad Distribution Path

Keep architecture compatible with iOS packaging later via a thin native shell (Capacitor), without rewriting the gameplay core.

Platform details: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

## Engineering Baseline (Implemented)

1. Monorepo: `pnpm` workspaces + `Turborepo` task graph.
2. App shell: `React + Vite + TypeScript` under `apps/web`.
3. Package boundaries: `color-engine`, `game-domain`, `mix-canvas`, `ui`, `content`.
4. `mix-canvas` pointer interaction baseline: drag pigments into a bowl with callback events.
5. `color-engine` perceptual scoring baseline: CIEDE2000 (`DeltaE00`) with calibrated acceptance bands.
6. Solve mode vertical slice in `apps/web`: challenge lobby, active mix flow, and scored result screen.
7. Predict mode vertical slice in `apps/web`: formula-driven multiple-choice round and scored results.
8. Find the Twin (`Discriminate`) mode vertical slice in `apps/web`: contextual perception challenge flow with twin selection and scored results.
9. Color Diary (`Collect`) mode vertical slice in `apps/web`: local-first save/edit/delete flow, filter/sort/search controls, and collection wall UI.
10. `content` package baseline: typed challenge schema, curated default content, validation API, and CLI integrity check.
11. Curated starter pack balancing: challenge difficulty tiers (`easy`/`medium`/`hard`) and validation rules for progression, mode mix, and perceptual distractor spacing.
12. Tooling: strict TypeScript, ESLint (flat config), Prettier, Vitest.
13. CI: GitHub Actions pipeline for lint/typecheck/test/content validation/build.

## Repository Layout

```text
.
├─ .github/workflows/ci.yml
├─ apps/
│  └─ web/
├─ packages/
│  ├─ color-engine/
│  ├─ content/
│  ├─ game-domain/
│  ├─ mix-canvas/
│  └─ ui/
├─ docs/
└─ README.md
```

## Getting Started

Prerequisites:

1. Node.js `>=20.9.0`
2. `pnpm` `9.x`

Install and run:

```bash
pnpm install
pnpm dev
```

The web app runs from `apps/web` through the monorepo `dev` task.

## Workspace Commands

1. `pnpm dev` - run workspace dev tasks.
2. `pnpm lint` - run ESLint across workspaces.
3. `pnpm typecheck` - run strict TypeScript checks.
4. `pnpm test` - run Vitest suites.
5. `pnpm build` - build all workspace packages/apps.
6. `pnpm content:validate` - run content schema/integrity validation.
7. `pnpm format` - check formatting.
8. `pnpm format:write` - write formatting fixes.

## Delivery Plan

Delivery is phase-based with strict quality gates.

1. Foundation and tooling.
2. Color engine and tactile mixing core.
3. Mode implementation in sequence: Solve, Predict, Discriminate, Collect.
4. Content pipeline and balancing.
5. Packaging and beta hardening.

Detailed plan: [`docs/DELIVERY_PLAN.md`](docs/DELIVERY_PLAN.md).

## Backlog Management

Backlog is intentionally lightweight but always current.

1. Keep only actionable items in `NOW`.
2. Move completed work to history with date.
3. Re-prioritize weekly based on quality gates and risk.

Backlog source of truth: [`docs/BACKLOG.md`](docs/BACKLOG.md).

## Documentation Index

1. Product specification: [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md)
2. Technical architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
3. Delivery plan: [`docs/DELIVERY_PLAN.md`](docs/DELIVERY_PLAN.md)
4. Quality standards: [`docs/QUALITY_STANDARDS.md`](docs/QUALITY_STANDARDS.md)
5. Backlog: [`docs/BACKLOG.md`](docs/BACKLOG.md)
6. Documentation maintenance rules: [`docs/DOCS_MAINTENANCE.md`](docs/DOCS_MAINTENANCE.md)
7. Architecture decisions: [`docs/DECISIONS.md`](docs/DECISIONS.md)

## Current Status

Current repository state:

1. Product and architecture documentation baseline is established.
2. Monorepo scaffold and CI baseline are implemented.
3. Initial web app shell and shared package skeletons are implemented.
4. `mix-canvas` supports pointer-driven drag/drop with bowl drop events.
5. `color-engine` now includes perceptual color scoring via `DeltaE00` and calibrated quality bands.
6. Solve, Predict, Find the Twin, and Color Diary mode vertical slices are implemented in `apps/web`.
7. Challenge content schema and validation pipeline are implemented in `@colormix/content` and wired into CI.
8. First curated starter challenge pack + balancing pass is implemented in `@colormix/content`.
9. Current implementation focus is M4 polish (`B-012`) and coverage hardening (`B-015`) before optional packaging work.

## Source Notes

Original brainstorming/reference docs retained in repository root:

1. `product description.md`
2. `links and resource.md`

## Collaboration Rules

1. Any architecture/product decision must be reflected in docs before or with code changes.
2. `README.md` and `docs/BACKLOG.md` must be updated in the same PR for material scope changes.
3. Do not add features that bypass quality gates for short-term speed.
