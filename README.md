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

## Engineering Strategy

The stack prioritizes visual fidelity, deterministic gameplay logic, and long-term maintainability.

Planned baseline:

1. App shell: `React + Vite + TypeScript`.
2. Real-time canvas/rendering: `PixiJS`.
3. State modeling: `XState` + lightweight global store (`Zustand`).
4. Persistence: `IndexedDB` through `Dexie`.
5. Testing: `Vitest`, `Playwright`, visual regression snapshots.
6. Monorepo/tooling: `pnpm + Turborepo`.

Architecture details: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

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

1. Keep only actionable items in `Now`.
2. Move completed work to changelog section.
3. Re-prioritize weekly based on quality gates and risk.

Backlog source of truth: [`docs/BACKLOG.md`](docs/BACKLOG.md).

## Documentation Index

1. Product specification: [`docs/PRODUCT_SPEC.md`](docs/PRODUCT_SPEC.md)
2. Technical architecture: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
3. Delivery plan: [`docs/DELIVERY_PLAN.md`](docs/DELIVERY_PLAN.md)
4. Quality standards: [`docs/QUALITY_STANDARDS.md`](docs/QUALITY_STANDARDS.md)
5. Backlog: [`docs/BACKLOG.md`](docs/BACKLOG.md)
6. Documentation maintenance rules: [`docs/DOCS_MAINTENANCE.md`](docs/DOCS_MAINTENANCE.md)

## Current Status

Current repository state:

1. Product concept is defined.
2. Project-level documentation baseline is established.
3. Engineering implementation scaffold has not been started yet.

## Source Notes

Original brainstorming/reference docs retained in repository root:

1. `product description.md`
2. `links and resource.md`

## Collaboration Rules

1. Any architecture/product decision must be reflected in docs before or with code changes.
2. `README.md` and `docs/BACKLOG.md` must be updated in the same PR for material scope changes.
3. Do not add features that bypass quality gates for short-term speed.

