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

1. `B-006` Implement Solve mode vertical slice (from challenge start to result screen).
2. `B-007` Implement Predict mode vertical slice reusing challenge runner.
3. `B-008` Define challenge content schema and validation script.

## 3. NEXT

1. `B-009` Create first curated challenge pack and balance pass.
2. `B-010` Implement Find the Twin mode with contextual perception variants.
3. `B-011` Implement Color Diary with save/edit/collection wall.
4. `B-012` Add sound and motion polish pass.

## 4. LATER

1. `B-013` Build optional iPad packaging track using Capacitor.
2. `B-014` Define optional cloud sync architecture (post-V1 only).

## 5. Completed

1. `B-005` Perceptual scoring module implemented in `@colormix/color-engine` with CIEDE2000 (`DeltaE00`) + calibrated acceptance bands (`1.0`, `2.2`, `4.0`, `8.0`) and coverage tests on 2026-02-25.
2. `B-004` `mix-canvas` upgraded to pointer-driven drag/drop interactions with bowl drop callbacks and web demo integration on 2026-02-25.
3. `B-003` Initial `color-engine` package skeleton and test harness created on 2026-02-25.
4. `B-002` Strict TypeScript/lint/format/test baseline and CI workflow created on 2026-02-25.
5. `B-001` Monorepo scaffold (`apps/web`, `packages/*`) and base tooling created on 2026-02-25.
6. `B-000` Documentation baseline (README + product/architecture/quality/delivery/backlog docs) created on 2026-02-25.

## 6. Next Review

Backlog review cadence:

1. Weekly (minimum).
2. At each milestone boundary.
3. Immediately after any major scope decision.
