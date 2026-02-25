# Architecture Decisions (ADR Log)

Use this log for non-trivial product or technical decisions.

Template:

- `ADR-XXX`
- Date
- Status (`proposed`, `accepted`, `superseded`)
- Context
- Decision
- Alternatives considered
- Consequences

---

## ADR-001

- Date: 2026-02-25
- Status: accepted
- Context: Project needs fast iteration on desktop plus future iPad packaging, while preserving premium interaction quality.
- Decision: Build web-first with React + Vite for app shell and a workspace-isolated `MixCanvas` renderer for real-time interactions; keep domain logic framework-agnostic in workspace packages.
- Alternatives considered: full native-first iPad implementation from day one; Unity-first cross-platform build.
- Consequences: faster local iteration and easier early testing; strict engineering discipline needed to preserve tactile quality and performance.

## ADR-002

- Date: 2026-02-25
- Status: accepted
- Context: Color-match fairness and progression depend on perceptual correctness.
- Decision: Use perceptual color-distance scoring, not RGB-distance scoring.
- Alternatives considered: HSV/RGB Euclidean approximations.
- Consequences: better player trust and difficulty calibration; requires stronger test coverage and calibration tooling.

## ADR-003

- Date: 2026-02-25
- Status: accepted
- Context: Perceptual scoring needed concrete implementation details for stable gameplay thresholds and mode balancing.
- Decision: Implement CIEDE2000 (`DeltaE00`) in `@colormix/color-engine` and use initial acceptance bands at `1.0` (perfect), `2.2` (excellent), `4.0` (good), `8.0` (fair), else `miss`.
- Alternatives considered: CIE76-only scoring, ad hoc RGB/HSV thresholding.
- Consequences: stronger alignment with perceived differences and better calibration consistency; requires ongoing tuning against playtest data.

## ADR-004

- Date: 2026-02-25
- Status: accepted
- Context: The Solve mode vertical slice needed reliable pass/fail behavior without unsolvable targets caused by palette mismatch.
- Decision: Define each Solve challenge with a reference recipe and derive target colors from that recipe using the same mixing engine used for player attempts.
- Alternatives considered: hand-picked static target RGB values independent of recipe generation.
- Consequences: immediate fairness and reproducibility for challenge tuning; content tooling should preserve this pattern as challenge volume scales.

## ADR-005

- Date: 2026-02-25
- Status: accepted
- Context: Solve and Predict modes both need consistent challenge cycling behavior and deterministic fallback handling.
- Decision: Introduce a shared `selectNextById` challenge-runner utility and use it in both mode modules (`solve.ts`, `predict.ts`) instead of mode-specific duplicated selection logic.
- Alternatives considered: independent per-mode `selectNextChallenge` implementations.
- Consequences: lower duplication, consistent behavior across modes, and a clearer foundation for future mode additions.

## ADR-006

- Date: 2026-02-25
- Status: accepted
- Context: Mode content was embedded directly in app modules, which made balancing, validation, and CI integrity checks harder as content volume grows.
- Decision: Centralize challenge definitions in `@colormix/content` with explicit schema types, default content payload, validation utilities, and a CLI validation script enforced in CI.
- Alternatives considered: keep inline mode-local content definitions; introduce JSON-only content files without runtime validation utilities.
- Consequences: stronger content integrity and easier scaling for future packs; requires ESM-safe module import conventions and keeping validation rules aligned with gameplay constraints.

## ADR-007

- Date: 2026-02-25
- Status: accepted
- Context: B-009 required a curated starter pack with a defensible difficulty curve, not just a list of challenge IDs.
- Decision: Add explicit challenge difficulty tiers (`easy`, `medium`, `hard`) and enforce pack-balance constraints in content validation: non-decreasing difficulty order, solve/predict mode mix, starter-tier coverage targets, and perceptual distractor separation checks for predict challenges.
- Alternatives considered: manual difficulty labels without validation; validating only challenge existence/duplicates inside packs.
- Consequences: more reliable progression quality as content grows, with measurable balancing guardrails; future pack authoring must satisfy these constraints or tune rule bands intentionally.

## ADR-008

- Date: 2026-02-25
- Status: accepted
- Context: B-010 needed a Discriminate mode implementation that keeps challenge content scalable and objectively testable, including contextual perception effects.
- Decision: Add `discriminateChallenges` to `@colormix/content` with explicit context variants (`neutral-studio`, `warm-gallery`, `cool-shadow`) and enforce validation rules for twin correctness and distractor perceptual bands by difficulty. Implement web-mode logic in a dedicated `discriminate.ts` module reused by the app shell.
- Alternatives considered: inline discriminate challenge data in `App.tsx`; context variants only in UI without content validation constraints.
- Consequences: stronger long-term maintainability and consistency across modes, with measurable discrimination difficulty; future challenge authoring must satisfy perceptual band constraints or intentionally adjust the validation profiles.

## ADR-009

- Date: 2026-02-25
- Status: accepted
- Context: B-011 needed a Collect/Diary loop that works offline immediately and can capture outcomes from all gameplay modes without backend coupling.
- Decision: Implement a local-first diary model in `apps/web/src/diary.ts`, persist entries in browser `localStorage` (`colormix.diary.v1`), and expose mode-agnostic entry builders plus filter/sort/search selection helpers for UI reuse.
- Alternatives considered: postpone diary until cloud sync exists; embed diary mutations directly inside `App.tsx` without domain helpers.
- Consequences: fast, resilient offline retention loop with testable domain logic today; future cloud sync work must include migration/versioning strategy for locally persisted diary entries.

## ADR-010

- Date: 2026-02-25
- Status: accepted
- Context: B-015 required reliable end-to-end coverage for critical player journeys (mode switching and diary retention flow) beyond unit-level assertions.
- Decision: Adopt Playwright as the baseline E2E framework, add a Chromium smoke suite under `tests/e2e`, and enforce execution in CI with explicit browser installation before test run.
- Alternatives considered: keep only Vitest integration tests; defer E2E until post-polish milestone.
- Consequences: stronger regression protection for cross-mode UI behavior and persistence interactions; CI runtime increases slightly and local contributors must install Playwright browsers to run E2E tests.

## ADR-011

- Date: 2026-02-25
- Status: accepted
- Context: B-012 required a polish pass for feedback quality while preserving calm UX and accessibility constraints.
- Decision: Add subtle UI motion transitions and deterministic Web Audio cue playback with a persisted user toggle (`colormix.sound.enabled.v1`), while honoring system reduced-motion preferences via CSS.
- Alternatives considered: no audio/motion in V1; heavier animation and sample-based audio effects.
- Consequences: improved action feedback without clutter; behavior remains user-controllable and accessibility-safe, with small added client complexity.

## ADR-012

- Date: 2026-02-25
- Status: accepted
- Context: B-013 needed an iPad packaging track, but current repository Node baseline is `>=20.9.0`.
- Decision: Adopt Capacitor `v7` (`@capacitor/cli`, `@capacitor/core`, `@capacitor/ios`) with root-level config/scripts and a dedicated runbook, avoiding Node-22-only Capacitor `v8` for now.
- Alternatives considered: immediate upgrade to Node 22 and Capacitor v8; defer packaging entirely.
- Consequences: packaging track is usable under existing runtime constraints; future upgrade to Capacitor v8 can be treated as a discrete infra migration.

## ADR-013

- Date: 2026-02-25
- Status: accepted
- Context: B-014 required defining cloud sync architecture without introducing backend coupling into current local-first gameplay loops.
- Decision: Define deterministic sync envelope contracts and merge policy in `@colormix/game-domain` (`cloud-sync.ts`) and pair them with a dedicated architecture document (`docs/CLOUD_SYNC_ARCHITECTURE.md`).
- Alternatives considered: postpone sync architecture until backend implementation starts; define contracts only in docs without executable domain utilities.
- Consequences: clearer path for post-V1 cross-device continuity with testable merge behavior; implementation still requires queue storage, backend endpoints, and auth rollout in later phases.

## ADR-014

- Date: 2026-02-25
- Status: accepted
- Context: B-016 targeted accessibility gaps called out in product requirements, especially high-contrast readability and non-color-only cues in discrimination gameplay.
- Decision: Add persisted accessibility controls in the web app: high-contrast UI mode and a color-assist overlay that shows RGB labels for discriminate target/options/results.
- Alternatives considered: keep accessibility as a docs-only future task; add assist labels only in results, not active selection flow.
- Consequences: immediate accessibility uplift with low architectural risk; small UI complexity increase and additional preference persistence paths.

## ADR-015

- Date: 2026-02-25
- Status: accepted
- Context: B-017/B-018 aimed to improve retention and content depth without introducing backend dependencies.
- Decision: Add daily diary prompts plus diary JSON import/export/merge flow, and expand curated content with a second pack (`full-spectrum-lab`) plus in-app pack selection that filters challenge pools by mode.
- Alternatives considered: keep single-pack random challenge rotation; defer diary portability until cloud sync implementation.
- Consequences: richer replay loops and better player agency over challenge progression; requires stronger UI-state synchronization and additional regression coverage.

## ADR-016

- Date: 2026-02-25
- Status: accepted
- Context: Backlog explicitly retained a content authoring/editor tooling gap as content volume grows.
- Decision: Implement authoring tooling in `@colormix/content` as reusable template APIs plus a CLI (`authoring:template`) for challenge/pack scaffolding.
- Alternatives considered: hand-edit content only; build a full graphical editor immediately.
- Consequences: faster and more consistent content creation today with minimal maintenance overhead; full visual editor remains optional for future scale.
