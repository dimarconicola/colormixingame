# Product Specification

## 1. Product Summary

`Color Mixing Game` is a premium play-and-learn app where players develop real color intuition through tactile mixing, prediction, discrimination, and collection loops.

Core promise: users leave with a sharper eye and a personal library of colors they created.

## 2. Objectives

### 2.1 Primary Objectives

1. Teach practical color intuition through play.
2. Deliver premium tactile quality from first release.
3. Support short, repeatable sessions (15-90 seconds).
4. Establish a reusable game framework for future content packs.

### 2.2 Secondary Objectives

1. Be classroom- and parent-friendly.
2. Appeal to older users who enjoy design and visual puzzles.
3. Prepare for optional iPad distribution without product rewrites.

## 3. Audience

### 3.1 Primary Segment

Kids age 5-10 (parent-approved, low-friction, safe-by-default).

### 3.2 Secondary Segment

Older kids and adults interested in design, painting, illustration, makeup, and photo editing.

## 4. Core Gameplay Pillars

1. `Solve`: recreate target colors from available pigments.
2. `Predict`: infer output color from input pigments and ratios.
3. `Discriminate`: identify exact matches among similar colors.
4. `Collect`: save and organize recipes/swatches in a personal diary.

## 5. Mode Definitions

## 5.1 Solve: Match the Target

Goal: create the target swatch using provided pigments/tools.

Progression bands:

1. Pigment selection only.
2. Pigment + quantity selection.
3. Minimum 3-pigment solutions.
4. Sparse/limited palette strategy packs.

Constraint examples:

1. Limited scoops/drops.
2. No undo.
3. Must use exactly N pigments.
4. Step-limited mixing chain.

## 5.2 Predict: Predict the Result

Goal: choose the resulting color for a given formula.

Progression bands:

1. Simple two-color outcomes.
2. Ratio-sensitive tint/shade outcomes.
3. Neutralization and temperature challenges.
4. Multi-step intermediate mixes.

## 5.3 Discriminate: Find the Twin

Goal: identify exact target among similar swatches.

Progression bands:

1. Large perceptual differences.
2. Smaller value/saturation differences.
3. More choices + tighter deltas.
4. Contextual perception (background and contrast effects).

## 5.4 Collect: Color Diary

Goal: convert mastery into personal artifacts.

Key features:

1. Save swatch + formula + optional name.
2. View cards with recipe and usage note.
3. Build collection wall by theme or date.
4. Support optional daily prompts.
5. Support parent-gated import/export and safe delete flows.

## 6. Session Loop

1. Choose mode.
2. Complete short challenge.
3. Receive feedback (accuracy + elegance).
4. Unlock progress or save discovery.
5. Return under new constraints.

## 7. Progression and Rewards

Progression is mastery-based, not grind-based.

Unlock categories:

1. Pigments (for richer challenge spaces).
2. Tools (dropper, knife, blender behaviors).
3. Challenge packs (sunset, skin tones, food, nature).
4. Lab rooms (pigment lab first, optional light lab later).

No loot boxes, no ad-driven economy, no manipulative retention patterns.

## 8. Scoring Model

Score components:

1. Perceptual accuracy band (primary).
2. Efficiency/elegance badges (secondary).
3. Streaks used for motivation only, never punishment.

Scoring constraints:

1. Must be deterministic.
2. Must map to human perception.
3. Must avoid false negatives from non-perceptual math.

## 9. UX Principles

1. The canvas is always the hero.
2. Controls never occlude key color feedback.
3. Motion and sound are subtle and informative.
4. UI language is simple enough for children.
5. Interaction must feel tactile, not abstract.

## 10. Accessibility and Inclusivity

V1 requirements:

1. High-contrast UI option for controls/text.
2. Color-blind-safe helper overlays for discrimination mode.
3. Touch target minimum size for children.
4. Hints must use plain language + visual cues.
5. Optional wellbeing break reminders for sustained sessions.

## 11. Privacy and Safety

1. Offline-first by default.
2. Minimal first-party analytics only when needed.
3. No ads, no tracking SDKs, no third-party profiling.
4. Parent-trust posture in all defaults and copy.
5. Parent-gate protection for adult-only actions (destructive/portability/outbound).

## 12. V1 Scope Boundary

Included in V1:

1. Four core modes.
2. Foundational progression and unlock loop.
3. Two curated challenge packs.
4. Color diary with save/view/edit basics.

Excluded from V1:

1. Multiplayer or social features.
2. UGC sharing network.
3. Full cloud account system.
4. Marketplace/economy complexity.

## 13. Success Metrics

1. Session completion rate per mode.
2. Retry rate by challenge band (healthy difficulty curve).
3. Median time-to-first-save in Color Diary.
4. D7 return rate for early users.
5. Error/crash rate and frame stability.

## 14. Risks and Mitigations

1. Risk: mixing feels fake.
   Mitigation: pigment-oriented model and continuous visual tuning.
2. Risk: difficulty feels unfair.
   Mitigation: perceptual delta calibration and validation tooling.
3. Risk: polished look but weak learning effect.
   Mitigation: explicit progression design and predict-mode emphasis.
4. Risk: over-scoped first release.
   Mitigation: strict V1 boundary and backlog discipline.
