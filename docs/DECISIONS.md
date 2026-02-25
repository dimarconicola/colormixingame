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
