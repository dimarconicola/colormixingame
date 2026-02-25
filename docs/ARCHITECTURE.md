# Technical Architecture

## 1. Architecture Goals

1. Web-first local development with fast iteration.
2. Premium interaction quality and stable frame times.
3. Deterministic gameplay logic for fair scoring and testing.
4. Clean path to optional iPad packaging later.
5. Infrastructure that supports content growth without rewrites.

## 2. Stack Selection

## 2.1 Frontend App Shell

1. `React` for UI composition.
2. `Vite` for fast development and build performance.
3. `TypeScript` with strict settings for long-term safety.

## 2.2 Real-Time Rendering and Input

1. Custom `MixCanvas` package built on `HTMLCanvasElement` 2D context.
2. Pointer-event drag/drop interaction model with deterministic bowl-drop callbacks.
3. Package boundary kept renderer-agnostic so future GPU backends remain possible.

## 2.3 State and Game Flow

1. React state + pure domain modules for deterministic mode behavior.
2. Shared mode utilities in app-layer modules (challenge runner, evaluation helpers).
3. Domain contracts in workspace packages for future state-machine extraction if complexity grows.

## 2.4 Data and Persistence

1. Local-first browser storage for diary and polish preferences.
2. Versioned key strategy to support safe data migrations.
3. Optional cloud-sync architecture defined for post-V1 rollout.

## 2.5 Tooling and Monorepo

1. `pnpm` workspaces.
2. `Turborepo` for build/test orchestration.
3. Unified lint/format/test gates in CI.
4. Content authoring template tooling in `@colormix/content` for challenge/pack scaffolding.

## 3. Proposed Repository Structure

```text
.
├─ apps/
│  └─ web/                       # React app shell and routing
├─ packages/
│  ├─ color-engine/              # Mixing, color conversion, scoring
│  ├─ game-domain/               # Level schema, progression, rewards
│  ├─ mix-canvas/                # Canvas interaction/render system
│  ├─ ui/                        # Reusable design system components
│  └─ content/                   # Challenge packs, validation, authoring templates
├─ docs/
│  ├─ PRODUCT_SPEC.md
│  ├─ ARCHITECTURE.md
│  ├─ DELIVERY_PLAN.md
│  ├─ QUALITY_STANDARDS.md
│  ├─ BACKLOG.md
│  └─ DOCS_MAINTENANCE.md
└─ README.md
```

## 4. Core Domain Boundaries

## 4.1 Color Engine

Responsibilities:

1. Pigment-oriented mixing function(s).
2. Color space conversion utilities.
3. Perceptual distance scoring.
4. Deterministic normalization and clamping logic.

Constraints:

1. No UI dependencies.
2. Pure functions where possible.
3. Stable outputs for identical inputs.

## 4.2 Game Domain

Responsibilities:

1. Level definitions and constraints.
2. Difficulty banding.
3. Reward and unlock policies.
4. Session scoring aggregation.

Constraints:

1. No render framework coupling.
2. Serializable state for save/load and telemetry.

## 4.3 Mix Canvas

Responsibilities:

1. Render bowl, pigments, and tool interactions.
2. Drive tactile feedback loops and transitions.
3. Produce snapshots/events for scoring and replay.

Constraints:

1. Frame-time budget compliance.
2. Graceful degradation on lower-power devices.

## 5. Data Model Overview

Core entities:

1. `Pigment`: id, metadata, behavior coefficients.
2. `Recipe`: ordered inputs, ratios, step chain.
3. `Challenge`: target color, constraints, difficulty band.
4. `SessionResult`: attempts, score, badges, duration.
5. `DiaryEntry`: swatch, recipe, label, timestamp, notes.
6. `UnlockState`: available pigments/tools/packs.

## 6. Rendering Pipeline Principles

1. UI layer and mixing canvas are separate to avoid cross-coupled regressions.
2. Input processing uses requestAnimationFrame-coordinated updates.
3. Expensive calculations are precomputed or memoized when possible.
4. Visual effects are optional layers with performance toggles.

## 7. Testing Architecture

## 7.1 Unit Tests

1. Color conversions.
2. Mixing invariants.
3. Perceptual scoring thresholds.
4. Progression and reward logic.

## 7.2 Integration Tests

1. End-to-end mode completion paths.
2. Save/load and migration safety.
3. Cross-mode progression behavior.

## 7.3 E2E + Visual Regression

1. Main player journeys in Playwright.
2. Key UI/canvas states in visual snapshots.
3. Tolerance gates to catch unintended rendering drift.

## 8. Performance and Reliability Targets

1. 60 FPS target on iPad-class devices for core interactions.
2. Frame spikes over 32ms should be rare and measurable.
3. Cold start under 2.5s on modern desktop browsers.
4. Crash-free sessions above 99.5% during beta.

## 9. Observability Strategy

1. Local debug overlay for fps, frame time, and event traces.
2. Development-only instrumentation hooks in key pipelines.
3. Minimal production telemetry focused on quality and stability.

## 10. iPad Packaging Strategy (Later Phase)

1. Keep runtime browser-compatible from day one.
2. Use a `Capacitor` wrapper and iOS runbook once core loops stabilize.
3. Verify touch, audio lifecycle, and persistence behavior in iOS WebView.
4. Keep packaging shell thin and avoid platform-specific logic in core modules.

Packaging runbook: `docs/IPAD_PACKAGING.md`.

## 11. Cloud Sync Strategy (Optional Post-V1)

1. Keep local-first behavior as source of truth for immediate UX.
2. Use deterministic envelope merge policy in `@colormix/game-domain`.
3. Roll out cloud sync in explicit phases after backend readiness.

Cloud sync architecture: `docs/CLOUD_SYNC_ARCHITECTURE.md`.

## 12. Content Authoring Strategy

1. Keep runtime content typed and validated through `@colormix/content`.
2. Use template scaffolding to accelerate challenge/pack authoring while preserving schema consistency.
3. Treat validation rules as release gates for new content.

Authoring guide: `docs/CONTENT_AUTHORING.md`.

## 13. Security and Privacy Baseline

1. No ad/tracking SDKs in V1.
2. Store only necessary local user data.
3. Avoid collecting personal identifiers by default.
4. Keep all telemetry first-party and documented.

## 14. ADR Process

Any non-trivial technical decision should be logged as an Architecture Decision Record:

1. Context.
2. Decision.
3. Alternatives considered.
4. Consequences.

Decision log file: `docs/DECISIONS.md`.
