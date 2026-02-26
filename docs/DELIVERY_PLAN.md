# Delivery Plan

This plan is intentionally detailed on architecture and quality, while keeping feature quantity scoped for a strong first release.

## 1. Planning Assumptions

1. Team starts from concept/docs stage.
2. V1 prioritizes interaction quality over content volume.
3. Web delivery is primary; iPad packaging is planned but optional for V1.

## 1.1 Current Snapshot (2026-02-25)

1. M0-M3 core scope is functionally in place with four playable mode vertical slices (`Solve`, `Predict`, `Discriminate`, `Collect`).
2. M4 quality hardening is expanded and complete with sound/motion polish, accessibility controls, diary import/export, daily prompts, and baseline E2E coverage (`B-012`, `B-015`, `B-016`, `B-017`).
3. Content depth target is met with two curated packs and pack-aware in-app selection (`B-018`).
4. Content authoring tooling baseline is now available via `@colormix/content` template APIs and CLI scaffolding (`B-019`).
5. M5 optional packaging is scaffolded with Capacitor config/scripts and a runbook (`B-013`), pending local CocoaPods/Xcode bootstrap.
6. Optional post-V1 cloud sync architecture is defined with deterministic merge contracts (`B-014`).
7. Research-driven trust/wellbeing/reliability upgrades are now in place (`B-020` to `B-023`): guardian-gated adult diary actions, break reminders, local session insights, and resilient diary backup fallback.

## 2. Release Strategy

1. `Milestone M0`: Documentation and project bootstrap.
2. `Milestone M1`: Core engine and tactile mixing foundation.
3. `Milestone M2`: Solve + Predict modes production-ready.
4. `Milestone M3`: Discriminate + Collect modes production-ready.
5. `Milestone M4`: Content balancing, polish, and beta stabilization.
6. `Milestone M5`: Optional iPad packaging track.
7. `Milestone M6`: Benchmark-driven refinement and adaptive progression.

## 3. Milestone Details

## 3.1 M0 - Documentation + Bootstrap

Objectives:

1. Lock product specification and architecture boundaries.
2. Create monorepo scaffold and baseline CI.
3. Set coding and quality standards.

Deliverables:

1. Monorepo layout (`apps/`, `packages/`).
2. Toolchain (lint, test, format, typecheck).
3. Initial docs package and backlog process.

Exit criteria:

1. Clean CI on empty scaffold.
2. No unresolved architecture ambiguities for M1.

## 3.2 M1 - Core Color Engine + Mix Canvas

Objectives:

1. Implement deterministic mixing and perceptual scoring core.
2. Build interactive mix canvas prototype with strong touch response.
3. Establish performance instrumentation.

Deliverables:

1. `color-engine` package with tests.
2. `mix-canvas` package with input + render loop.
3. Basic tooling layer (scoop/dropper/drag).

Exit criteria:

1. Engine test suite stable.
2. Mix interactions feel responsive and consistent.
3. Performance overlay in place for profiling.

## 3.3 M2 - Solve and Predict Modes

Objectives:

1. Ship first two gameplay loops end-to-end.
2. Integrate scoring, progression, and feedback loops.

Deliverables:

1. Solve mode levels L1-L4 baseline set.
2. Predict mode easy-to-hard baseline set.
3. Shared challenge runner and results UI.

Exit criteria:

1. End-to-end automated tests for both modes.
2. Difficulty progression is coherent.
3. No major UX blockers in playtesting.

## 3.4 M3 - Discriminate and Collect Modes

Objectives:

1. Complete four-mode product shape.
2. Add collection and retention loops.

Deliverables:

1. Find the Twin level pipeline and fairness calibration.
2. Color Diary save/edit/view flow.
3. Collection wall and lightweight prompt hooks.

Exit criteria:

1. Diary persistence stable across refresh and version bump.
2. Discrimination mode calibrated by perceptual bands.
3. Four-mode navigation and progression unified.

## 3.5 M4 - Content + Polish + Beta

Objectives:

1. Add curated challenge packs.
2. Improve motion/sound/touch polish.
3. Harden reliability and performance.

Deliverables:

1. Two production-ready challenge packs.
2. Sound/motion polish pass.
3. Visual regression baseline and tuned thresholds.

Exit criteria:

1. Quality thresholds satisfied (see quality standards).
2. Open high-severity bugs resolved.
3. Beta-ready build candidate.

## 3.6 M5 - Optional iPad Packaging

Objectives:

1. Validate iOS packaging with minimal core code changes.
2. Document release and signing pipeline.

Deliverables:

1. Capacitor wrapper setup.
2. iPad UX verification report.
3. Packaging runbook.

Exit criteria:

1. Core loops function correctly in iPad runtime.
2. Packaging process repeatable.

## 3.7 M6 - Benchmark-Driven Refinement

Objectives:

1. Align product quality with top kids-app trust and polish benchmarks.
2. Use session insights to drive adaptive challenge progression.
3. Harden portability and reliability flows for parent confidence.

Deliverables:

1. Guardian-gated adult actions for portability/destructive diary operations.
2. Session wellbeing loop (break reminders) and insights-driven progression roadmap.
3. Reliability hardening for diary storage resilience and regression coverage.

Exit criteria:

1. Adult-only actions are parent-gated and tested.
2. Session reminders and insights persistence are stable.
3. Adaptive progression backlog is decomposed into implementation-ready items.

## 4. Cross-Cutting Workstreams

These run in parallel with milestones:

1. Test automation and CI hardening.
2. Performance profiling and optimization.
3. Accessibility and inclusivity improvements.
4. Privacy/compliance validation.
5. Backlog hygiene and risk management.

## 5. Risk Register (Top Risks)

1. Mixing realism falls below quality target.
   Response: treat color engine tuning as first-class milestone work.
2. Input latency undermines tactile feel.
   Response: prioritize render/input profiling early in M1.
3. Difficulty curve becomes frustrating.
   Response: add calibration tooling and playtest checkpoints.
4. Scope drift delays release.
   Response: strict V1 boundary, enforce backlog discipline.

## 6. Definition of Done by Feature

A feature is done only if:

1. Product behavior is documented.
2. Unit/integration tests are present.
3. E2E path is verified for critical flows.
4. Performance impact is measured and acceptable.
5. Backlog and changelog are updated.

## 7. Update Cadence

1. Backlog update: weekly minimum or after major decisions.
2. Plan update: at each milestone boundary.
3. README refresh: whenever scope or architecture changes.
