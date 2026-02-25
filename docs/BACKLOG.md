# Backlog

This backlog is intentionally lightweight and always current.

## 1. Rules

1. Keep this file focused on actionable work.
2. Use short item IDs for easy references.
3. Update statuses as part of each meaningful change.
4. Move completed work to `Completed` with date.

Status values:

1. `NOW`: actively prioritized.
2. `NEXT`: queued for upcoming milestone.
3. `LATER`: not blocked, lower immediate priority.
4. `DONE`: completed and moved to history.

## 2. NOW

1. No active backlog items in this plan slice.

## 3. NEXT

1. No queued items in this plan slice.

## 4. LATER

1. No deferred items in this plan slice.

## 5. Completed

1. `B-019` Challenge authoring tooling shipped in `@colormix/content` with reusable template APIs, a CLI generator (`authoring:template`), and tests on 2026-02-25.
2. `B-018` Curated content expansion completed with second challenge pack (`full-spectrum-lab`) and in-app pack selection for mode-specific challenge pools on 2026-02-25.
3. `B-017` Color Diary retention loop upgraded with daily prompts and JSON import/export plus merge-safe entry ingestion on 2026-02-25.
4. `B-016` Accessibility and readability pass shipped with high-contrast mode, discriminate color-assist overlays, persisted user preferences, and E2E coverage on 2026-02-25.
5. `B-014` Optional cloud sync architecture defined with dedicated architecture doc and deterministic sync envelope contracts in `@colormix/game-domain` on 2026-02-25.
6. `B-013` Optional iPad packaging track scaffolded with Capacitor (`@capacitor` dependencies, `capacitor.config.ts`, packaging scripts, and runbook) on 2026-02-25; native bootstrap requires local CocoaPods installation before `cap add ios`.
7. `B-012` Sound and motion polish pass shipped in `apps/web` with Web Audio cues, persistent sound toggle, and reduced-motion-safe transitions on 2026-02-25.
8. `B-015` Baseline E2E coverage implemented with Playwright (Chromium) for top-level mode switching and diary save/edit/delete flow, wired into CI via browser install + test execution on 2026-02-25.
9. `B-011` Color Diary (`Collect`) mode vertical slice implemented in `apps/web` with local-first persistence, save-from-results actions (Solve/Predict/Discriminate), filter/sort/search collection wall, and edit/delete support on 2026-02-25.
10. `B-010` Find the Twin (`Discriminate`) mode vertical slice implemented in `apps/web` with contextual perception variants (`neutral-studio`, `warm-gallery`, `cool-shadow`), scoring/results flow, challenge tests, and content validation guardrails on 2026-02-25.
11. `B-009` First curated starter challenge pack and balancing pass implemented with difficulty tiers (`easy`/`medium`/`hard`), ordered progression validation, mode-mix validation, and perceptual distractor distance checks on 2026-02-25.
12. `B-008` Challenge content package implemented with schema types, curated default content, validation API, CLI validation script, tests, and CI validation gate on 2026-02-25.
13. `B-007` Predict mode vertical slice implemented in `apps/web` (formula lobby, multiple-choice prediction round, and scored result screen) reusing shared challenge-runner selection logic on 2026-02-25.
14. `B-006` Solve mode vertical slice implemented in `apps/web` (challenge lobby, active mixing flow, and scored result screen) with `DeltaE00` scoring + coverage tests on 2026-02-25.
15. `B-005` Perceptual scoring module implemented in `@colormix/color-engine` with CIEDE2000 (`DeltaE00`) + calibrated acceptance bands (`1.0`, `2.2`, `4.0`, `8.0`) and coverage tests on 2026-02-25.
16. `B-004` `mix-canvas` upgraded to pointer-driven drag/drop interactions with bowl drop callbacks and web demo integration on 2026-02-25.
17. `B-003` Initial `color-engine` package skeleton and test harness created on 2026-02-25.
18. `B-002` Strict TypeScript/lint/format/test baseline and CI workflow created on 2026-02-25.
19. `B-001` Monorepo scaffold (`apps/web`, `packages/*`) and base tooling created on 2026-02-25.
20. `B-000` Documentation baseline (README + product/architecture/quality/delivery/backlog docs) created on 2026-02-25.

## 6. Next Review

Backlog review cadence:

1. Weekly (minimum).
2. At each milestone boundary.
3. Immediately after any major scope decision.
