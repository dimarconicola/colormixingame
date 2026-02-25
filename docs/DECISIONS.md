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
- Decision: Build web-first with React + Vite for app shell and PixiJS for real-time mixing canvas; keep domain logic framework-agnostic in workspace packages.
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
