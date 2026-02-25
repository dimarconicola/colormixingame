import { rgbToHex, type PerceptualMatchScore } from "@colormix/color-engine";
import { MixCanvas } from "@colormix/mix-canvas";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  SOLVE_CHALLENGES,
  countDropsByPigment,
  evaluateSolveAttempt,
  formatBandLabel,
  getAttemptColorFromDrops,
  getCanvasPigmentsForPalette,
  getSolvePigment,
  isSolvePigmentId,
  selectNextChallenge,
  type SolveChallenge,
  type SolvePigmentId
} from "./solve";

type SolvePhase = "landing" | "mixing" | "result";

export function App() {
  const canvasHostRef = useRef<HTMLDivElement | null>(null);

  const [phase, setPhase] = useState<SolvePhase>("landing");
  const [challenge, setChallenge] = useState<SolveChallenge>(() => selectNextChallenge(SOLVE_CHALLENGES));
  const [droppedPigments, setDroppedPigments] = useState<SolvePigmentId[]>([]);
  const [result, setResult] = useState<PerceptualMatchScore | null>(null);
  const [mixSessionKey, setMixSessionKey] = useState(0);

  const attemptColor = useMemo(() => getAttemptColorFromDrops(droppedPigments), [droppedPigments]);
  const attemptHex = attemptColor ? rgbToHex(attemptColor) : "#f0ebe0";
  const dropCounts = useMemo(() => countDropsByPigment(droppedPigments), [droppedPigments]);

  const dropsUsed = droppedPigments.length;
  const dropsRemaining = Math.max(0, challenge.maxDrops - dropsUsed);
  const canSubmit = Boolean(attemptColor);
  const dropLimitReached = dropsUsed >= challenge.maxDrops;

  useEffect(() => {
    if (phase !== "mixing") {
      return;
    }

    const hostElement = canvasHostRef.current;

    if (!hostElement) {
      return;
    }

    const calculateSize = () => {
      const width = Math.max(320, Math.min(760, hostElement.clientWidth));
      const height = Math.round(width * 0.58);

      return { width, height };
    };

    const initialSize = calculateSize();

    const mixCanvas = new MixCanvas({
      container: hostElement,
      width: initialSize.width,
      height: initialSize.height,
      pigments: getCanvasPigmentsForPalette(challenge.palette, initialSize.width, initialSize.height),
      onDropInBowl: (event) => {
        if (!isSolvePigmentId(event.pigment.id)) {
          return;
        }

        const pigmentId = event.pigment.id;

        setDroppedPigments((previous) => {
          if (previous.length >= challenge.maxDrops) {
            return previous;
          }

          return [...previous, pigmentId];
        });
      }
    });

    const resize = () => {
      const size = calculateSize();
      mixCanvas.resize(size.width, size.height);
      mixCanvas.setPigments(getCanvasPigmentsForPalette(challenge.palette, size.width, size.height));
    };

    let resizeObserver: ResizeObserver | null = null;

    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(resize);
      resizeObserver.observe(hostElement);
    } else {
      window.addEventListener("resize", resize);
    }

    return () => {
      if (resizeObserver) {
        resizeObserver.disconnect();
      } else {
        window.removeEventListener("resize", resize);
      }

      mixCanvas.destroy();
    };
  }, [phase, challenge, mixSessionKey]);

  const startChallenge = () => {
    setDroppedPigments([]);
    setResult(null);
    setPhase("mixing");
    setMixSessionKey((previous) => previous + 1);
  };

  const resetMix = () => {
    setDroppedPigments([]);
    setResult(null);
    setPhase("mixing");
    setMixSessionKey((previous) => previous + 1);
  };

  const cycleChallenge = (nextPhase: SolvePhase) => {
    setChallenge((current) => selectNextChallenge(SOLVE_CHALLENGES, current.id));
    setDroppedPigments([]);
    setResult(null);
    setPhase(nextPhase);
    setMixSessionKey((previous) => previous + 1);
  };

  const submitAttempt = () => {
    if (!attemptColor) {
      return;
    }

    setResult(evaluateSolveAttempt(challenge, attemptColor));
    setPhase("result");
  };

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Color Mixing Game</p>
        <h1>Solve Mode Vertical Slice</h1>
        <p>
          Match the target swatch by dragging pigments into the bowl, then submit your mix for
          perceptual scoring using <code>DeltaE00</code>.
        </p>
      </header>

      {phase === "landing" && (
        <section className="board board-intro">
          <div className="intro-main">
            <h2>{challenge.title}</h2>
            <p>{challenge.brief}</p>
            <p className="challenge-meta">Drop budget: {challenge.maxDrops}</p>
            <div className="action-row">
              <button type="button" className="button button-primary" onClick={startChallenge}>
                Start Challenge
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => cycleChallenge("landing")}
              >
                New Target
              </button>
            </div>
          </div>
          <aside className="intro-side">
            <h3>Target</h3>
            <div className="target-preview">
              <span className="target-swatch large" style={{ backgroundColor: challenge.targetHex }} />
              <span>{challenge.targetHex}</span>
            </div>
            <h3>Palette</h3>
            <ul className="palette-list">
              {challenge.palette.map((pigmentId) => {
                const pigment = getSolvePigment(pigmentId);

                return (
                  <li key={pigment.id}>
                    <span
                      className="target-swatch"
                      style={{ backgroundColor: rgbToHex(pigment.rgb) }}
                      aria-hidden="true"
                    />
                    <span>{pigment.label}</span>
                  </li>
                );
              })}
            </ul>
          </aside>
        </section>
      )}

      {phase === "mixing" && (
        <section className="board board-mixing">
          <div className="canvas-panel">
            <div ref={canvasHostRef} className="mix-canvas-host" />
          </div>

          <aside className="control-panel" aria-live="polite">
            <h2>{challenge.title}</h2>
            <p>{challenge.brief}</p>

            <div className="swatch-grid">
              <div className="swatch-card">
                <span className="label">Target</span>
                <span className="target-swatch large" style={{ backgroundColor: challenge.targetHex }} />
                <span>{challenge.targetHex}</span>
              </div>
              <div className="swatch-card">
                <span className="label">Your Mix</span>
                <span className="target-swatch large" style={{ backgroundColor: attemptHex }} />
                <span>{attemptHex}</span>
              </div>
            </div>

            <p className="challenge-meta">
              Drops used: {dropsUsed}/{challenge.maxDrops}
            </p>
            {dropLimitReached && (
              <p className="limit-warning">Drop budget reached. Submit or reset your mix.</p>
            )}

            <ul className="drop-breakdown">
              {challenge.palette.map((pigmentId) => {
                const pigment = getSolvePigment(pigmentId);

                return (
                  <li key={pigment.id}>
                    <span
                      className="target-swatch"
                      style={{ backgroundColor: rgbToHex(pigment.rgb) }}
                      aria-hidden="true"
                    />
                    <span>{pigment.label}</span>
                    <span className="drop-count">x {dropCounts[pigment.id]}</span>
                  </li>
                );
              })}
            </ul>

            <div className="action-row">
              <button
                type="button"
                className="button button-primary"
                onClick={submitAttempt}
                disabled={!canSubmit}
              >
                Submit Match
              </button>
              <button type="button" className="button button-secondary" onClick={resetMix}>
                Reset Mix
              </button>
              <button
                type="button"
                className="button button-ghost"
                onClick={() => cycleChallenge("mixing")}
              >
                New Target
              </button>
            </div>

            <p className="hint">Drops remaining: {dropsRemaining}</p>
          </aside>
        </section>
      )}

      {phase === "result" && result && (
        <section className="board board-result">
          <p className="eyebrow">Result</p>
          <h2>{challenge.title}</h2>
          <p className={`band-pill band-${result.band}`}>{formatBandLabel(result.band)}</p>

          <div className="result-stats">
            <article>
              <h3>Score</h3>
              <p>{result.score}</p>
            </article>
            <article>
              <h3>DeltaE00</h3>
              <p>{result.deltaE00.toFixed(2)}</p>
            </article>
            <article>
              <h3>Verdict</h3>
              <p>{result.passed ? "Pass" : "Try Again"}</p>
            </article>
          </div>

          <div className="result-swatches">
            <div className="swatch-card">
              <span className="label">Target</span>
              <span className="target-swatch large" style={{ backgroundColor: challenge.targetHex }} />
              <span>{challenge.targetHex}</span>
            </div>
            <div className="swatch-card">
              <span className="label">Your Mix</span>
              <span className="target-swatch large" style={{ backgroundColor: attemptHex }} />
              <span>{attemptHex}</span>
            </div>
          </div>

          <div className="action-row">
            <button type="button" className="button button-primary" onClick={resetMix}>
              Retry Same Target
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => cycleChallenge("mixing")}
            >
              Next Challenge
            </button>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => {
                setPhase("landing");
                setDroppedPigments([]);
                setResult(null);
              }}
            >
              Back to Lobby
            </button>
          </div>
        </section>
      )}
    </main>
  );
}
