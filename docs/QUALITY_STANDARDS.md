# Quality Standards

This document defines minimum quality bars required for shipping.

## 1. Product Experience Standards

1. Interaction clarity: players always understand what to do next.
2. Tactile response: drag and mixing interactions feel immediate.
3. Visual hierarchy: color canvas remains primary focus.
4. Calm UI: no clutter, no manipulative prompts.
5. Session flow: start-to-finish challenge loop stays under 90 seconds for standard levels.

## 2. Color and Scoring Standards

1. Mixing behavior must be pigment-oriented, not naive RGB interpolation.
2. Accuracy scoring must use a perceptual metric.
3. Difficulty tiers must map to perceptual distance bands.
4. Similar challenge levels must have consistent acceptance thresholds.

## 3. Engineering Standards

1. TypeScript strict mode enabled.
2. Linting and formatting enforced in CI.
3. No new feature without tests at appropriate levels.
4. Public package APIs documented and versioned.
5. No implicit runtime coupling between domain and rendering modules.

## 4. Testing Standards

Minimum coverage expectations:

1. Unit tests for color math, scoring, progression logic.
2. Integration tests for mode flow and persistence boundaries.
3. End-to-end tests for critical user paths.
4. Visual regression tests for key UI/canvas states.

Test quality expectations:

1. Deterministic inputs and assertions.
2. No flaky tests merged without issue tracking.
3. Reproducible bug cases converted into regression tests.

## 5. Performance Standards

Target budgets:

1. 60 FPS for core interactions on target tablet-class hardware.
2. Main interaction frames should not exceed 32ms except rare spikes.
3. First meaningful render under 2.5s on modern desktop browser.
4. Avoid memory growth across long sessions.

Performance workflow:

1. Measure before optimizing.
2. Track regressions against baseline.
3. Block releases on unresolved high-impact performance defects.

## 6. Accessibility Standards

1. Readable text and control contrast.
2. Touch targets suitable for children.
3. Clear visual plus textual feedback for outcomes.
4. Non-color-only cues in critical gameplay feedback when possible.
5. Adult-only actions (destructive, portability, outbound) must use a parent-gate flow.

## 7. Reliability Standards

1. Crash-free sessions >= 99.5% in beta.
2. Save/load operations must be transaction-safe.
3. Schema migrations must preserve existing diary and progression state.
4. Recoverable error paths should not trap user sessions.
5. Critical local data must support corruption-tolerant fallback reads.

## 8. Privacy and Trust Standards

1. Offline-first behavior and local-first data storage.
2. Minimal first-party telemetry only when justified.
3. No ad network SDKs.
4. Clear parent-friendly defaults and language.
5. Release checklist must include Apple Kids Category and Google Play Families compliance checks.

## 9. Release Gates

A release candidate is blocked if any condition below is true:

1. High-severity known defects in core loops.
2. Unresolved scoring fairness issues.
3. Reproducible performance regressions beyond budget.
4. Missing documentation for changed architecture or game logic.

## 10. Ownership Rules

1. Feature owner must update docs and tests.
2. Reviewer validates quality gates before approval.
3. Backlog status must reflect shipped vs pending work.
