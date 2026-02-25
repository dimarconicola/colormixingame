import { rgbToHex, type PerceptualMatchScore } from "@colormix/color-engine";
import { MixCanvas } from "@colormix/mix-canvas";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  DISCRIMINATE_CHALLENGES,
  evaluateDiscriminateAttempt,
  getDiscriminateContextPresentation,
  selectNextDiscriminateChallenge,
  type DiscriminateAttemptResult,
  type DiscriminateChallenge
} from "./discriminate";
import {
  createDiaryEntryFromDiscriminate,
  createDiaryEntryFromPredict,
  createDiaryEntryFromSolve,
  prependDiaryEntry,
  readDiaryEntries,
  removeDiaryEntry,
  selectDiaryEntries,
  updateDiaryEntry,
  writeDiaryEntries,
  type DiaryEntry,
  type DiaryFilterMode,
  type DiarySort
} from "./diary";
import {
  PREDICT_CHALLENGES,
  evaluatePredictAttempt,
  formatFormulaEntry,
  selectNextPredictChallenge,
  type PredictAttemptResult,
  type PredictChallenge
} from "./predict";
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

type GameMode = "solve" | "predict" | "discriminate" | "collect";
type SolvePhase = "landing" | "mixing" | "result";
type PredictPhase = "landing" | "guessing" | "result";
type DiscriminatePhase = "landing" | "guessing" | "result";

export function App() {
  const canvasHostRef = useRef<HTMLDivElement | null>(null);

  const [mode, setMode] = useState<GameMode>("solve");

  const [solvePhase, setSolvePhase] = useState<SolvePhase>("landing");
  const [solveChallenge, setSolveChallenge] = useState<SolveChallenge>(() =>
    selectNextChallenge(SOLVE_CHALLENGES)
  );
  const [droppedPigments, setDroppedPigments] = useState<SolvePigmentId[]>([]);
  const [solveResult, setSolveResult] = useState<PerceptualMatchScore | null>(null);
  const [solveSessionKey, setSolveSessionKey] = useState(0);

  const [predictPhase, setPredictPhase] = useState<PredictPhase>("landing");
  const [predictChallenge, setPredictChallenge] = useState<PredictChallenge>(() =>
    selectNextPredictChallenge(PREDICT_CHALLENGES)
  );
  const [predictSelectedOptionId, setPredictSelectedOptionId] = useState<string | null>(null);
  const [predictResult, setPredictResult] = useState<PredictAttemptResult | null>(null);

  const [discriminatePhase, setDiscriminatePhase] = useState<DiscriminatePhase>("landing");
  const [discriminateChallenge, setDiscriminateChallenge] = useState<DiscriminateChallenge>(() =>
    selectNextDiscriminateChallenge(DISCRIMINATE_CHALLENGES)
  );
  const [discriminateSelectedOptionId, setDiscriminateSelectedOptionId] = useState<string | null>(null);
  const [discriminateResult, setDiscriminateResult] = useState<DiscriminateAttemptResult | null>(null);

  const [diaryEntries, setDiaryEntries] = useState<DiaryEntry[]>([]);
  const [diaryFilterMode, setDiaryFilterMode] = useState<DiaryFilterMode>("all");
  const [diarySort, setDiarySort] = useState<DiarySort>("newest");
  const [diarySearchQuery, setDiarySearchQuery] = useState("");
  const [selectedDiaryEntryId, setSelectedDiaryEntryId] = useState<string | null>(null);
  const [diaryDraftTitle, setDiaryDraftTitle] = useState("");
  const [diaryDraftNote, setDiaryDraftNote] = useState("");

  const attemptColor = useMemo(() => getAttemptColorFromDrops(droppedPigments), [droppedPigments]);
  const attemptHex = attemptColor ? rgbToHex(attemptColor) : "#f0ebe0";
  const dropCounts = useMemo(() => countDropsByPigment(droppedPigments), [droppedPigments]);
  const dropsUsed = droppedPigments.length;
  const dropsRemaining = Math.max(0, solveChallenge.maxDrops - dropsUsed);
  const canSubmitSolve = Boolean(attemptColor);
  const dropLimitReached = dropsUsed >= solveChallenge.maxDrops;

  const predictSelectedOption = useMemo(
    () =>
      predictSelectedOptionId
        ? predictChallenge.options.find((option) => option.id === predictSelectedOptionId) ?? null
        : null,
    [predictChallenge.options, predictSelectedOptionId]
  );

  const discriminateSelectedOption = useMemo(
    () =>
      discriminateSelectedOptionId
        ? discriminateChallenge.options.find((option) => option.id === discriminateSelectedOptionId) ??
          null
        : null,
    [discriminateChallenge.options, discriminateSelectedOptionId]
  );

  const discriminateContext = useMemo(
    () => getDiscriminateContextPresentation(discriminateChallenge.contextVariant),
    [discriminateChallenge.contextVariant]
  );

  const visibleDiaryEntries = useMemo(
    () =>
      selectDiaryEntries(diaryEntries, {
        filterMode: diaryFilterMode,
        sort: diarySort,
        searchQuery: diarySearchQuery
      }),
    [diaryEntries, diaryFilterMode, diarySort, diarySearchQuery]
  );

  const selectedDiaryEntry = useMemo(
    () => diaryEntries.find((entry) => entry.id === selectedDiaryEntryId) ?? null,
    [diaryEntries, selectedDiaryEntryId]
  );

  useEffect(() => {
    if (visibleDiaryEntries.length === 0) {
      setSelectedDiaryEntryId(null);
      return;
    }

    setSelectedDiaryEntryId((current) => {
      if (current && visibleDiaryEntries.some((entry) => entry.id === current)) {
        return current;
      }

      return visibleDiaryEntries[0]?.id ?? null;
    });
  }, [visibleDiaryEntries]);

  useEffect(() => {
    if (mode !== "solve" || solvePhase !== "mixing") {
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
      pigments: getCanvasPigmentsForPalette(
        solveChallenge.palette,
        initialSize.width,
        initialSize.height
      ),
      onDropInBowl: (event) => {
        if (!isSolvePigmentId(event.pigment.id)) {
          return;
        }

        const pigmentId = event.pigment.id;

        setDroppedPigments((previous) => {
          if (previous.length >= solveChallenge.maxDrops) {
            return previous;
          }

          return [...previous, pigmentId];
        });
      }
    });

    const resize = () => {
      const size = calculateSize();
      mixCanvas.resize(size.width, size.height);
      mixCanvas.setPigments(getCanvasPigmentsForPalette(solveChallenge.palette, size.width, size.height));
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
  }, [mode, solvePhase, solveChallenge, solveSessionKey]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const entries = readDiaryEntries(window.localStorage);
    setDiaryEntries(entries);
    setSelectedDiaryEntryId(entries[0]?.id ?? null);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    writeDiaryEntries(diaryEntries, window.localStorage);
  }, [diaryEntries]);

  useEffect(() => {
    if (!selectedDiaryEntry) {
      setDiaryDraftTitle("");
      setDiaryDraftNote("");
      return;
    }

    setDiaryDraftTitle(selectedDiaryEntry.title);
    setDiaryDraftNote(selectedDiaryEntry.note);
  }, [selectedDiaryEntry]);

  const startSolveChallenge = () => {
    setDroppedPigments([]);
    setSolveResult(null);
    setSolvePhase("mixing");
    setSolveSessionKey((previous) => previous + 1);
  };

  const resetSolveMix = () => {
    setDroppedPigments([]);
    setSolveResult(null);
    setSolvePhase("mixing");
    setSolveSessionKey((previous) => previous + 1);
  };

  const cycleSolveChallenge = (nextPhase: SolvePhase) => {
    setSolveChallenge((current) => selectNextChallenge(SOLVE_CHALLENGES, current.id));
    setDroppedPigments([]);
    setSolveResult(null);
    setSolvePhase(nextPhase);
    setSolveSessionKey((previous) => previous + 1);
  };

  const submitSolveAttempt = () => {
    if (!attemptColor) {
      return;
    }

    setSolveResult(evaluateSolveAttempt(solveChallenge, attemptColor));
    setSolvePhase("result");
  };

  const startPredictChallenge = () => {
    setPredictSelectedOptionId(null);
    setPredictResult(null);
    setPredictPhase("guessing");
  };

  const cyclePredictChallenge = (nextPhase: PredictPhase) => {
    setPredictChallenge((current) => selectNextPredictChallenge(PREDICT_CHALLENGES, current.id));
    setPredictSelectedOptionId(null);
    setPredictResult(null);
    setPredictPhase(nextPhase);
  };

  const submitPredictAttempt = () => {
    if (!predictSelectedOptionId) {
      return;
    }

    const evaluation = evaluatePredictAttempt(predictChallenge, predictSelectedOptionId);

    if (!evaluation) {
      return;
    }

    setPredictResult(evaluation);
    setPredictPhase("result");
  };

  const startDiscriminateChallenge = () => {
    setDiscriminateSelectedOptionId(null);
    setDiscriminateResult(null);
    setDiscriminatePhase("guessing");
  };

  const cycleDiscriminateChallenge = (nextPhase: DiscriminatePhase) => {
    setDiscriminateChallenge((current) =>
      selectNextDiscriminateChallenge(DISCRIMINATE_CHALLENGES, current.id)
    );
    setDiscriminateSelectedOptionId(null);
    setDiscriminateResult(null);
    setDiscriminatePhase(nextPhase);
  };

  const submitDiscriminateAttempt = () => {
    if (!discriminateSelectedOptionId) {
      return;
    }

    const evaluation = evaluateDiscriminateAttempt(discriminateChallenge, discriminateSelectedOptionId);

    if (!evaluation) {
      return;
    }

    setDiscriminateResult(evaluation);
    setDiscriminatePhase("result");
  };

  const addDiaryEntry = (entry: DiaryEntry) => {
    setDiaryEntries((current) => prependDiaryEntry(current, entry));
    setSelectedDiaryEntryId(entry.id);
    setMode("collect");
  };

  const saveSolveResultToDiary = () => {
    if (!solveResult) {
      return;
    }

    addDiaryEntry(
      createDiaryEntryFromSolve({
        challenge: solveChallenge,
        droppedPigments,
        attemptHex,
        result: solveResult
      })
    );
  };

  const savePredictResultToDiary = () => {
    if (!predictResult) {
      return;
    }

    addDiaryEntry(
      createDiaryEntryFromPredict({
        challenge: predictChallenge,
        result: predictResult
      })
    );
  };

  const saveDiscriminateResultToDiary = () => {
    if (!discriminateResult) {
      return;
    }

    addDiaryEntry(
      createDiaryEntryFromDiscriminate({
        challenge: discriminateChallenge,
        result: discriminateResult
      })
    );
  };

  const saveDiaryDraft = () => {
    if (!selectedDiaryEntry) {
      return;
    }

    setDiaryEntries((current) =>
      updateDiaryEntry(current, selectedDiaryEntry.id, {
        title: diaryDraftTitle,
        note: diaryDraftNote
      })
    );
  };

  const deleteSelectedDiaryEntry = () => {
    if (!selectedDiaryEntry) {
      return;
    }

    setDiaryEntries((current) => removeDiaryEntry(current, selectedDiaryEntry.id));
  };

  const modeDescription =
    mode === "solve"
      ? "Match the target swatch by dragging pigments into the bowl, then submit your mix for perceptual scoring using DeltaE00."
      : mode === "predict"
        ? "Predict the resulting swatch from a pigment formula, then verify your intuition with the same perceptual scoring model."
        : mode === "discriminate"
          ? "Find the exact twin swatch under contextual perception variants where surrounding colors can bias your eye."
          : "Review and edit your saved swatches, formulas, and notes in a local-first color diary.";

  return (
    <main className="app-shell">
      <header className="hero">
        <p className="eyebrow">Color Mixing Game</p>
        <h1>
          {mode === "solve"
            ? "Solve Mode"
            : mode === "predict"
              ? "Predict Mode"
              : mode === "discriminate"
                ? "Find the Twin Mode"
                : "Color Diary"}{" "}
          Vertical Slice
        </h1>
        <p>{modeDescription}</p>

        <div className="mode-switch" role="tablist" aria-label="Game mode switch">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "solve"}
            className={`mode-button ${mode === "solve" ? "active" : ""}`}
            onClick={() => setMode("solve")}
          >
            Solve
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "predict"}
            className={`mode-button ${mode === "predict" ? "active" : ""}`}
            onClick={() => setMode("predict")}
          >
            Predict
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "discriminate"}
            className={`mode-button ${mode === "discriminate" ? "active" : ""}`}
            onClick={() => setMode("discriminate")}
          >
            Find the Twin
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "collect"}
            className={`mode-button ${mode === "collect" ? "active" : ""}`}
            onClick={() => setMode("collect")}
          >
            Color Diary
          </button>
        </div>
      </header>

      {mode === "solve" && solvePhase === "landing" && (
        <section className="board board-intro">
          <div className="intro-main">
            <h2>{solveChallenge.title}</h2>
            <p>{solveChallenge.brief}</p>
            <p className="challenge-meta">Drop budget: {solveChallenge.maxDrops}</p>
            <div className="action-row">
              <button type="button" className="button button-primary" onClick={startSolveChallenge}>
                Start Challenge
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => cycleSolveChallenge("landing")}
              >
                New Target
              </button>
            </div>
          </div>
          <aside className="intro-side">
            <h3>Target</h3>
            <div className="target-preview">
              <span
                className="target-swatch large"
                style={{ backgroundColor: solveChallenge.targetHex }}
              />
              <span>{solveChallenge.targetHex}</span>
            </div>
            <h3>Palette</h3>
            <ul className="palette-list">
              {solveChallenge.palette.map((pigmentId) => {
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

      {mode === "solve" && solvePhase === "mixing" && (
        <section className="board board-mixing">
          <div className="canvas-panel">
            <div ref={canvasHostRef} className="mix-canvas-host" />
          </div>

          <aside className="control-panel" aria-live="polite">
            <h2>{solveChallenge.title}</h2>
            <p>{solveChallenge.brief}</p>

            <div className="swatch-grid">
              <div className="swatch-card">
                <span className="label">Target</span>
                <span
                  className="target-swatch large"
                  style={{ backgroundColor: solveChallenge.targetHex }}
                />
                <span>{solveChallenge.targetHex}</span>
              </div>
              <div className="swatch-card">
                <span className="label">Your Mix</span>
                <span className="target-swatch large" style={{ backgroundColor: attemptHex }} />
                <span>{attemptHex}</span>
              </div>
            </div>

            <p className="challenge-meta">
              Drops used: {dropsUsed}/{solveChallenge.maxDrops}
            </p>
            {dropLimitReached && (
              <p className="limit-warning">Drop budget reached. Submit or reset your mix.</p>
            )}

            <ul className="drop-breakdown">
              {solveChallenge.palette.map((pigmentId) => {
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
                onClick={submitSolveAttempt}
                disabled={!canSubmitSolve}
              >
                Submit Match
              </button>
              <button type="button" className="button button-secondary" onClick={resetSolveMix}>
                Reset Mix
              </button>
              <button
                type="button"
                className="button button-ghost"
                onClick={() => cycleSolveChallenge("mixing")}
              >
                New Target
              </button>
            </div>

            <p className="hint">Drops remaining: {dropsRemaining}</p>
          </aside>
        </section>
      )}

      {mode === "solve" && solvePhase === "result" && solveResult && (
        <section className="board board-result">
          <p className="eyebrow">Result</p>
          <h2>{solveChallenge.title}</h2>
          <p className={`band-pill band-${solveResult.band}`}>{formatBandLabel(solveResult.band)}</p>

          <div className="result-stats">
            <article>
              <h3>Score</h3>
              <p>{solveResult.score}</p>
            </article>
            <article>
              <h3>DeltaE00</h3>
              <p>{solveResult.deltaE00.toFixed(2)}</p>
            </article>
            <article>
              <h3>Verdict</h3>
              <p>{solveResult.passed ? "Pass" : "Try Again"}</p>
            </article>
          </div>

          <div className="result-swatches">
            <div className="swatch-card">
              <span className="label">Target</span>
              <span className="target-swatch large" style={{ backgroundColor: solveChallenge.targetHex }} />
              <span>{solveChallenge.targetHex}</span>
            </div>
            <div className="swatch-card">
              <span className="label">Your Mix</span>
              <span className="target-swatch large" style={{ backgroundColor: attemptHex }} />
              <span>{attemptHex}</span>
            </div>
          </div>

          <div className="action-row">
            <button type="button" className="button button-primary" onClick={resetSolveMix}>
              Retry Same Target
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => cycleSolveChallenge("mixing")}
            >
              Next Challenge
            </button>
            <button type="button" className="button button-secondary" onClick={saveSolveResultToDiary}>
              Save to Diary
            </button>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => {
                setSolvePhase("landing");
                setDroppedPigments([]);
                setSolveResult(null);
              }}
            >
              Back to Lobby
            </button>
          </div>
        </section>
      )}

      {mode === "predict" && predictPhase === "landing" && (
        <section className="board board-intro">
          <div className="intro-main">
            <h2>{predictChallenge.title}</h2>
            <p>{predictChallenge.brief}</p>

            <h3 className="section-label">Formula</h3>
            <ul className="formula-list">
              {predictChallenge.formula.map((entry) => (
                <li key={`${entry.pigmentId}-${entry.drops}`}>
                  <span
                    className="target-swatch"
                    style={{ backgroundColor: rgbToHex(getSolvePigment(entry.pigmentId).rgb) }}
                    aria-hidden="true"
                  />
                  <span>{formatFormulaEntry(entry)}</span>
                </li>
              ))}
            </ul>

            <div className="action-row">
              <button type="button" className="button button-primary" onClick={startPredictChallenge}>
                Start Prediction
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => cyclePredictChallenge("landing")}
              >
                New Formula
              </button>
            </div>
          </div>

          <aside className="intro-side">
            <h3>Answer Format</h3>
            <p>Pick 1 swatch from 4 options. Correct picks score perfect perceptual alignment.</p>
            <h3>Options</h3>
            <p className="hint">You will see four candidate swatches in the next step.</p>
          </aside>
        </section>
      )}

      {mode === "predict" && predictPhase === "guessing" && (
        <section className="board board-predict">
          <div className="predict-main">
            <h2>{predictChallenge.title}</h2>
            <p>{predictChallenge.brief}</p>

            <h3 className="section-label">Formula</h3>
            <ul className="formula-list">
              {predictChallenge.formula.map((entry) => (
                <li key={`${entry.pigmentId}-${entry.drops}`}>
                  <span
                    className="target-swatch"
                    style={{ backgroundColor: rgbToHex(getSolvePigment(entry.pigmentId).rgb) }}
                    aria-hidden="true"
                  />
                  <span>{formatFormulaEntry(entry)}</span>
                </li>
              ))}
            </ul>

            <h3 className="section-label">Choose the resulting swatch</h3>
            <div className="option-grid" role="radiogroup" aria-label="Predict options">
              {predictChallenge.options.map((option, index) => {
                const isSelected = option.id === predictSelectedOptionId;

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`option-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setPredictSelectedOptionId(option.id)}
                  >
                    <span className="option-token">Option {String.fromCharCode(65 + index)}</span>
                    <span className="target-swatch large" style={{ backgroundColor: option.hex }} />
                    <span>{option.hex}</span>
                  </button>
                );
              })}
            </div>

            <div className="action-row">
              <button
                type="button"
                className="button button-primary"
                onClick={submitPredictAttempt}
                disabled={!predictSelectedOptionId}
              >
                Submit Prediction
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => cyclePredictChallenge("guessing")}
              >
                New Formula
              </button>
              <button
                type="button"
                className="button button-ghost"
                onClick={() => {
                  setPredictPhase("landing");
                  setPredictSelectedOptionId(null);
                  setPredictResult(null);
                }}
              >
                Back to Lobby
              </button>
            </div>
          </div>

          <aside className="predict-side">
            <h3>Current Selection</h3>
            {predictSelectedOption ? (
              <div className="selected-preview">
                <span
                  className="target-swatch large"
                  style={{ backgroundColor: predictSelectedOption.hex }}
                />
                <span>{predictSelectedOption.hex}</span>
              </div>
            ) : (
              <p className="hint">Select an option to preview your guess.</p>
            )}
          </aside>
        </section>
      )}

      {mode === "predict" && predictPhase === "result" && predictResult && (
        <section className="board board-result">
          <p className="eyebrow">Result</p>
          <h2>{predictChallenge.title}</h2>
          <p className={`status-pill ${predictResult.isCorrect ? "status-correct" : "status-wrong"}`}>
            {predictResult.isCorrect ? "Correct Pick" : "Incorrect Pick"}
          </p>
          <p className={`band-pill band-${predictResult.perceptual.band}`}>
            {formatBandLabel(predictResult.perceptual.band)}
          </p>

          <div className="result-stats">
            <article>
              <h3>Score</h3>
              <p>{predictResult.perceptual.score}</p>
            </article>
            <article>
              <h3>DeltaE00</h3>
              <p>{predictResult.perceptual.deltaE00.toFixed(2)}</p>
            </article>
            <article>
              <h3>Verdict</h3>
              <p>{predictResult.isCorrect ? "Exact" : "Different"}</p>
            </article>
          </div>

          <div className="result-swatches">
            <div className="swatch-card">
              <span className="label">Your Pick</span>
              <span
                className="target-swatch large"
                style={{ backgroundColor: predictResult.selectedOption.hex }}
              />
              <span>{predictResult.selectedOption.hex}</span>
            </div>
            <div className="swatch-card">
              <span className="label">Correct</span>
              <span
                className="target-swatch large"
                style={{ backgroundColor: predictResult.correctOption.hex }}
              />
              <span>{predictResult.correctOption.hex}</span>
            </div>
          </div>

          <div className="action-row">
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                setPredictSelectedOptionId(null);
                setPredictResult(null);
                setPredictPhase("guessing");
              }}
            >
              Retry Formula
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => cyclePredictChallenge("guessing")}
            >
              Next Formula
            </button>
            <button type="button" className="button button-secondary" onClick={savePredictResultToDiary}>
              Save to Diary
            </button>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => {
                setPredictPhase("landing");
                setPredictSelectedOptionId(null);
                setPredictResult(null);
              }}
            >
              Back to Lobby
            </button>
          </div>
        </section>
      )}

      {mode === "discriminate" && discriminatePhase === "landing" && (
        <section className="board board-intro">
          <div className="intro-main">
            <h2>{discriminateChallenge.title}</h2>
            <p>{discriminateChallenge.brief}</p>

            <p className="challenge-meta">
              Difficulty: {discriminateChallenge.difficulty.toUpperCase()} | Context:{" "}
              {discriminateContext.title}
            </p>

            <div className="action-row">
              <button type="button" className="button button-primary" onClick={startDiscriminateChallenge}>
                Start Twin Hunt
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => cycleDiscriminateChallenge("landing")}
              >
                New Challenge
              </button>
            </div>
          </div>

          <aside className="intro-side">
            <h3>Context Variant</h3>
            <p>{discriminateContext.description}</p>
            <div className="context-preview" style={{ background: discriminateContext.frameBackground }}>
              <span
                className="target-swatch large"
                style={{ backgroundColor: discriminateChallenge.targetHex }}
              />
              <span>{discriminateChallenge.targetHex}</span>
            </div>
          </aside>
        </section>
      )}

      {mode === "discriminate" && discriminatePhase === "guessing" && (
        <section className="board board-discriminate">
          <div className="predict-main">
            <h2>{discriminateChallenge.title}</h2>
            <p>{discriminateChallenge.brief}</p>

            <p className="challenge-meta">
              Difficulty: {discriminateChallenge.difficulty.toUpperCase()} | Context:{" "}
              {discriminateContext.title}
            </p>

            <h3 className="section-label">Target</h3>
            <div className="context-preview" style={{ background: discriminateContext.frameBackground }}>
              <div
                className="context-panel"
                style={{ background: discriminateContext.panelBackground }}
              >
                <span
                  className="target-swatch large"
                  style={{ backgroundColor: discriminateChallenge.targetHex }}
                />
                <span>{discriminateChallenge.targetHex}</span>
              </div>
            </div>

            <h3 className="section-label">Choose the exact twin</h3>
            <div className="option-grid" role="radiogroup" aria-label="Discriminate options">
              {discriminateChallenge.options.map((option, index) => {
                const isSelected = option.id === discriminateSelectedOptionId;

                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    className={`option-card ${isSelected ? "selected" : ""}`}
                    onClick={() => setDiscriminateSelectedOptionId(option.id)}
                    style={{ background: discriminateContext.panelBackground }}
                  >
                    <span className="option-token">Option {String.fromCharCode(65 + index)}</span>
                    <span className="target-swatch large" style={{ backgroundColor: option.hex }} />
                    <span>{option.hex}</span>
                  </button>
                );
              })}
            </div>

            <div className="action-row">
              <button
                type="button"
                className="button button-primary"
                onClick={submitDiscriminateAttempt}
                disabled={!discriminateSelectedOptionId}
              >
                Submit Twin Pick
              </button>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => cycleDiscriminateChallenge("guessing")}
              >
                New Challenge
              </button>
              <button
                type="button"
                className="button button-ghost"
                onClick={() => {
                  setDiscriminatePhase("landing");
                  setDiscriminateSelectedOptionId(null);
                  setDiscriminateResult(null);
                }}
              >
                Back to Lobby
              </button>
            </div>
          </div>

          <aside className="predict-side">
            <h3>Current Selection</h3>
            {discriminateSelectedOption ? (
              <div className="selected-preview">
                <div className="context-panel" style={{ background: discriminateContext.panelBackground }}>
                  <span
                    className="target-swatch large"
                    style={{ backgroundColor: discriminateSelectedOption.hex }}
                  />
                </div>
                <span>{discriminateSelectedOption.hex}</span>
              </div>
            ) : (
              <p className="hint">Select the swatch that exactly matches the target.</p>
            )}
            <p className="hint">{discriminateContext.description}</p>
          </aside>
        </section>
      )}

      {mode === "discriminate" && discriminatePhase === "result" && discriminateResult && (
        <section className="board board-result">
          <p className="eyebrow">Result</p>
          <h2>{discriminateChallenge.title}</h2>
          <p className={`status-pill ${discriminateResult.isCorrect ? "status-correct" : "status-wrong"}`}>
            {discriminateResult.isCorrect ? "Exact Twin Found" : "Not the Twin"}
          </p>
          <p className={`band-pill band-${discriminateResult.perceptual.band}`}>
            {formatBandLabel(discriminateResult.perceptual.band)}
          </p>

          <div className="result-stats">
            <article>
              <h3>Score</h3>
              <p>{discriminateResult.perceptual.score}</p>
            </article>
            <article>
              <h3>DeltaE00</h3>
              <p>{discriminateResult.perceptual.deltaE00.toFixed(2)}</p>
            </article>
            <article>
              <h3>Verdict</h3>
              <p>{discriminateResult.isCorrect ? "Exact" : "Off-Tone"}</p>
            </article>
          </div>

          <div className="result-swatches">
            <div className="swatch-card" style={{ background: discriminateContext.panelBackground }}>
              <span className="label">Target</span>
              <span
                className="target-swatch large"
                style={{ backgroundColor: discriminateChallenge.targetHex }}
              />
              <span>{discriminateChallenge.targetHex}</span>
            </div>
            <div className="swatch-card" style={{ background: discriminateContext.panelBackground }}>
              <span className="label">Your Pick</span>
              <span
                className="target-swatch large"
                style={{ backgroundColor: discriminateResult.selectedOption.hex }}
              />
              <span>{discriminateResult.selectedOption.hex}</span>
            </div>
            <div className="swatch-card" style={{ background: discriminateContext.panelBackground }}>
              <span className="label">Correct Twin</span>
              <span
                className="target-swatch large"
                style={{ backgroundColor: discriminateResult.correctOption.hex }}
              />
              <span>{discriminateResult.correctOption.hex}</span>
            </div>
          </div>

          <div className="action-row">
            <button
              type="button"
              className="button button-primary"
              onClick={() => {
                setDiscriminateSelectedOptionId(null);
                setDiscriminateResult(null);
                setDiscriminatePhase("guessing");
              }}
            >
              Retry Same Challenge
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={() => cycleDiscriminateChallenge("guessing")}
            >
              Next Challenge
            </button>
            <button
              type="button"
              className="button button-secondary"
              onClick={saveDiscriminateResultToDiary}
            >
              Save to Diary
            </button>
            <button
              type="button"
              className="button button-ghost"
              onClick={() => {
                setDiscriminatePhase("landing");
                setDiscriminateSelectedOptionId(null);
                setDiscriminateResult(null);
              }}
            >
              Back to Lobby
            </button>
          </div>
        </section>
      )}

      {mode === "collect" && (
        <section className="board board-diary">
          <div className="diary-main">
            <h2>Color Diary</h2>
            <p>Save and organize your favorite outcomes from Solve, Predict, and Find the Twin.</p>

            <div className="diary-toolbar">
              <label>
                Mode
                <select
                  value={diaryFilterMode}
                  onChange={(event) => setDiaryFilterMode(event.target.value as DiaryFilterMode)}
                >
                  <option value="all">All</option>
                  <option value="solve">Solve</option>
                  <option value="predict">Predict</option>
                  <option value="discriminate">Find the Twin</option>
                </select>
              </label>

              <label>
                Sort
                <select
                  value={diarySort}
                  onChange={(event) => setDiarySort(event.target.value as DiarySort)}
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                </select>
              </label>

              <label className="grow">
                Search
                <input
                  type="search"
                  value={diarySearchQuery}
                  onChange={(event) => setDiarySearchQuery(event.target.value)}
                  placeholder="Search title, note, hex, summary"
                />
              </label>
            </div>

            {visibleDiaryEntries.length === 0 ? (
              <p className="hint">
                Diary is empty for this filter. Save any result screen to start your collection wall.
              </p>
            ) : (
              <ul className="diary-grid">
                {visibleDiaryEntries.map((entry) => {
                  const isSelected = entry.id === selectedDiaryEntryId;

                  return (
                    <li key={entry.id}>
                      <button
                        type="button"
                        className={`diary-card ${isSelected ? "selected" : ""}`}
                        onClick={() => setSelectedDiaryEntryId(entry.id)}
                      >
                        <span className="target-swatch large" style={{ backgroundColor: entry.swatchHex }} />
                        <strong>{entry.title}</strong>
                        <span className="diary-meta">
                          {entry.sourceMode} | {new Date(entry.createdAt).toLocaleDateString()}
                        </span>
                        <span className="diary-meta">{entry.swatchHex}</span>
                        <span className="diary-summary">{entry.summary}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <aside className="diary-side">
            {selectedDiaryEntry ? (
              <>
                <h3>Edit Entry</h3>
                <p className="hint">
                  Created {new Date(selectedDiaryEntry.createdAt).toLocaleString()} | Updated{" "}
                  {new Date(selectedDiaryEntry.updatedAt).toLocaleString()}
                </p>

                <div className="selected-preview">
                  <span
                    className="target-swatch large"
                    style={{ backgroundColor: selectedDiaryEntry.swatchHex }}
                  />
                  <span>{selectedDiaryEntry.swatchHex}</span>
                </div>

                <label>
                  Title
                  <input
                    type="text"
                    value={diaryDraftTitle}
                    onChange={(event) => setDiaryDraftTitle(event.target.value)}
                  />
                </label>

                <label>
                  Note
                  <textarea
                    rows={6}
                    value={diaryDraftNote}
                    onChange={(event) => setDiaryDraftNote(event.target.value)}
                    placeholder="Add your recipe note, comparison thought, or reminder."
                  />
                </label>

                <p className="hint">{selectedDiaryEntry.summary}</p>

                <div className="action-row">
                  <button type="button" className="button button-primary" onClick={saveDiaryDraft}>
                    Save Changes
                  </button>
                  <button type="button" className="button button-ghost" onClick={deleteSelectedDiaryEntry}>
                    Delete Entry
                  </button>
                </div>
              </>
            ) : (
              <>
                <h3>Entry Details</h3>
                <p className="hint">Select a diary card to edit title and notes.</p>
              </>
            )}
          </aside>
        </section>
      )}
    </main>
  );
}
