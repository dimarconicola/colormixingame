# Cloud Sync Architecture (Post-V1 Optional)

This document defines the optional cloud-sync track for future cross-device continuity.

V1 remains local-first; this plan introduces architecture and contracts without forcing backend coupling into current gameplay loops.

## 1. Goals

1. Preserve offline-first gameplay and diary behavior.
2. Enable cross-device continuity for diary entries and core progress.
3. Keep merge behavior deterministic and testable.
4. Minimize risk of data loss across reconnects and schema changes.

## 2. Non-Goals (Current Phase)

1. No account UI implementation in this phase.
2. No production backend rollout in this phase.
3. No requirement to sync challenge content packs in real time.

## 3. Sync Scope

Initial sync entities:

1. `diary-entry` (create/update/delete).
2. `player-progress` (completed challenge IDs and unlock state).

Out of initial scope:

1. High-frequency in-session telemetry.
2. Pixel/canvas replay payloads.

## 4. Canonical Envelope Contract

Domain contracts live in:

- `packages/game-domain/src/cloud-sync.ts`

Envelope fields:

1. `entityType`
2. `entityId`
3. `operation` (`upsert` | `delete`)
4. `payload` (`null` for deletes)
5. `updatedAt` (ISO UTC)
6. `deviceId`
7. `clock` (monotonic per-device logical counter)
8. `schemaVersion`

## 5. Conflict Resolution Policy

Conflict resolution uses deterministic last-write-wins:

1. Higher `clock` wins.
2. If clocks tie, later `updatedAt` wins.
3. If still tied, lexicographically higher `deviceId` wins.

This policy is implemented in `@colormix/game-domain` and covered by tests.

## 6. Client Architecture

1. Keep local-first writes immediate.
2. Append envelopes to an outbound queue.
3. Push queue opportunistically when online.
4. Pull remote envelopes by checkpoint.
5. Merge with deterministic policy and persist merged local state.

## 7. Storage Evolution Path

1. Current state: local persistence in browser storage for diary.
2. Migration target: IndexedDB-backed local store for sync queue + envelopes.
3. Migration rule: never delete pre-existing local entries during migration; preserve with idempotent transforms.

## 8. Privacy and Security Baseline

1. Sync only product data needed for continuity.
2. Encrypt transport (HTTPS only).
3. Authenticate requests with short-lived tokens when account system is introduced.
4. No third-party ad/tracking SDK dependencies.

## 9. Rollout Phases

1. Phase A: contract + merge logic finalized (this phase).
2. Phase B: local queue + checkpoint client implementation.
3. Phase C: backend endpoint integration and staging validation.
4. Phase D: opt-in user-facing sync rollout.

## 10. Open Questions

1. Anonymous-to-account merge strategy for first sign-in.
2. Maximum offline queue retention and compaction thresholds.
3. Export/import fallback for non-account users.
