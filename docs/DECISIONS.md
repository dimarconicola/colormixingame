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

