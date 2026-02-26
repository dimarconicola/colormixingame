import { DEFAULT_GAME_CONTENT } from "@colormix/content";
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
  getDailyDiaryPrompt,
  mergeDiaryEntries,
  parseDiaryEntries,
  prependDiaryEntry,
  readDiaryEntries,
  removeDiaryEntry,
  serializeDiaryEntries,
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
  createUiSoundPlayer,
  readBreakReminderEnabled,
  readColorAssistEnabled,
  readHighContrastEnabled,
  readSoundEnabled,
  writeBreakReminderEnabled,
  writeColorAssistEnabled,
  writeHighContrastEnabled,
  writeSoundEnabled,
  type SoundCue,
  type UiSoundPlayer
} from "./polish";
import {
  GUARDIAN_UNLOCK_DURATION_MS,
  createGuardianChallenge,
  isGuardianUnlockActive,
  verifyGuardianAnswer,
  type GuardianChallenge
} from "./guardian-gate";
import {
  createDefaultSessionInsights,
  readSessionInsights,
  recordDiaryAction,
  recordModeCompletion,
  recordModeStart,
  writeSessionInsights,
  type SessionInsights
} from "./insights";
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
type ChallengePackOption = {
  id: string;
  title: string;
  challengeIds: readonly string[];
};

const ALL_PACK_ID = "all";
const BREAK_REMINDER_INTERVAL_MS = 12 * 60 * 1000;

const CONTENT_PACKS: readonly ChallengePackOption[] = (DEFAULT_GAME_CONTENT.packs ?? []).map((pack) => ({
  id: pack.id,
  title: pack.title,
  challengeIds: pack.challengeIds
}));

function filterChallengePool<TChallenge extends { id: string }>(
  challenges: readonly TChallenge[],
  selectedPackId: string
): readonly TChallenge[] {
  if (selectedPackId === ALL_PACK_ID) {
    return challenges;
  }

  const pack = CONTENT_PACKS.find((candidate) => candidate.id === selectedPackId);

  if (!pack) {
    return challenges;
  }

  const allowedIds = new Set(pack.challengeIds);
  const filtered = challenges.filter((challenge) => allowedIds.has(challenge.id));

  return filtered.length > 0 ? filtered : challenges;
}

function formatAssistLabel(color: { r: number; g: number; b: number }): string {
  return `R${color.r} G${color.g} B${color.b}`;
}

export function App() {
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const soundPlayerRef = useRef<UiSoundPlayer | null>(null);
  const pendingGuardianActionRef = useRef<(() => void) | null>(null);

  const [mode, setMode] = useState<GameMode>("solve");
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [highContrastEnabled, setHighContrastEnabled] = useState(false);
  const [colorAssistEnabled, setColorAssistEnabled] = useState(false);
  const [breakReminderEnabled, setBreakReminderEnabled] = useState(false);
  const [breakReminderVisible, setBreakReminderVisible] = useState(false);
  const [selectedPackId, setSelectedPackId] = useState(ALL_PACK_ID);
  const [sessionInsights, setSessionInsights] = useState<SessionInsights>(() =>
    createDefaultSessionInsights()
  );
  const [guardianChallenge, setGuardianChallenge] = useState<GuardianChallenge>(() =>
    createGuardianChallenge()
  );
  const [guardianAnswer, setGuardianAnswer] = useState("");
  const [guardianError, setGuardianError] = useState<string | null>(null);
  const [guardianGateVisible, setGuardianGateVisible] = useState(false);
  const [guardianUnlockedAt, setGuardianUnlockedAt] = useState<number | null>(null);

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
  const [diaryImportError, setDiaryImportError] = useState<string | null>(null);

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

  const activeModeChallengeIds = useMemo(() => {
    if (mode === "solve") {
      return new Set(SOLVE_CHALLENGES.map((challenge) => challenge.id));
    }

    if (mode === "predict") {
      return new Set(PREDICT_CHALLENGES.map((challenge) => challenge.id));
    }

    if (mode === "discriminate") {
      return new Set(DISCRIMINATE_CHALLENGES.map((challenge) => challenge.id));
    }

    return new Set<string>();
  }, [mode]);

  const availablePackOptions = useMemo(() => {
    if (mode === "collect") {
      return [{ id: ALL_PACK_ID, title: "All Challenges" }];
    }

    const eligiblePacks = CONTENT_PACKS.filter((pack) =>
      pack.challengeIds.some((challengeId) => activeModeChallengeIds.has(challengeId))
    ).map((pack) => ({
      id: pack.id,
      title: pack.title
    }));

    return [{ id: ALL_PACK_ID, title: "All Challenges" }, ...eligiblePacks];
  }, [activeModeChallengeIds, mode]);

  const solveChallengePool = useMemo(
    () => filterChallengePool(SOLVE_CHALLENGES, selectedPackId),
    [selectedPackId]
  );
  const predictChallengePool = useMemo(
    () => filterChallengePool(PREDICT_CHALLENGES, selectedPackId),
    [selectedPackId]
  );
  const discriminateChallengePool = useMemo(
    () => filterChallengePool(DISCRIMINATE_CHALLENGES, selectedPackId),
    [selectedPackId]
  );

  const dailyDiaryPrompt = useMemo(() => getDailyDiaryPrompt(), []);
  const selectedPackTitle = useMemo(
    () =>
      availablePackOptions.find((option) => option.id === selectedPackId)?.title ?? "All Challenges",
    [availablePackOptions, selectedPackId]
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
  const guardianUnlocked = isGuardianUnlockActive(guardianUnlockedAt);

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
    const availablePackIds = new Set(availablePackOptions.map((option) => option.id));

    setSelectedPackId((current) => (availablePackIds.has(current) ? current : ALL_PACK_ID));
  }, [availablePackOptions]);

  useEffect(() => {
    if (solveChallengePool.some((challenge) => challenge.id === solveChallenge.id)) {
      return;
    }

    setSolveChallenge(selectNextChallenge(solveChallengePool));
    setSolvePhase("landing");
    setDroppedPigments([]);
    setSolveResult(null);
    setSolveSessionKey((previous) => previous + 1);
  }, [solveChallengePool, solveChallenge.id]);

  useEffect(() => {
    if (predictChallengePool.some((challenge) => challenge.id === predictChallenge.id)) {
      return;
    }

    setPredictChallenge(selectNextPredictChallenge(predictChallengePool));
    setPredictPhase("landing");
    setPredictSelectedOptionId(null);
    setPredictResult(null);
  }, [predictChallengePool, predictChallenge.id]);

  useEffect(() => {
    if (
      discriminateChallengePool.some((challenge) => challenge.id === discriminateChallenge.id)
    ) {
      return;
    }

    setDiscriminateChallenge(selectNextDiscriminateChallenge(discriminateChallengePool));
    setDiscriminatePhase("landing");
    setDiscriminateSelectedOptionId(null);
    setDiscriminateResult(null);
  }, [discriminateChallengePool, discriminateChallenge.id]);

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
    soundPlayerRef.current = createUiSoundPlayer();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    setSoundEnabled(readSoundEnabled(window.localStorage));
    setHighContrastEnabled(readHighContrastEnabled(window.localStorage));
    setColorAssistEnabled(readColorAssistEnabled(window.localStorage));
    setBreakReminderEnabled(readBreakReminderEnabled(window.localStorage));
    setSessionInsights(readSessionInsights(window.localStorage));

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
    if (typeof window === "undefined") {
      return;
    }

    writeSoundEnabled(soundEnabled, window.localStorage);
  }, [soundEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    writeHighContrastEnabled(highContrastEnabled, window.localStorage);
  }, [highContrastEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    writeColorAssistEnabled(colorAssistEnabled, window.localStorage);
  }, [colorAssistEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    writeBreakReminderEnabled(breakReminderEnabled, window.localStorage);
  }, [breakReminderEnabled]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    writeSessionInsights(sessionInsights, window.localStorage);
  }, [sessionInsights]);

  useEffect(() => {
    if (guardianUnlockedAt === null || typeof window === "undefined") {
      return;
    }

    const elapsedMs = Date.now() - guardianUnlockedAt;
    const remainingMs = Math.max(0, GUARDIAN_UNLOCK_DURATION_MS - elapsedMs);

    if (remainingMs <= 0) {
      setGuardianUnlockedAt(null);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setGuardianUnlockedAt(null);
    }, remainingMs);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [guardianUnlockedAt]);

  useEffect(() => {
    if (!breakReminderEnabled || typeof window === "undefined") {
      return;
    }

    const intervalId = window.setInterval(() => {
      setBreakReminderVisible(true);
    }, BREAK_REMINDER_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [breakReminderEnabled]);

  useEffect(() => {
    if (!selectedDiaryEntry) {
      setDiaryDraftTitle("");
      setDiaryDraftNote("");
      return;
    }

    setDiaryDraftTitle(selectedDiaryEntry.title);
    setDiaryDraftNote(selectedDiaryEntry.note);
  }, [selectedDiaryEntry]);

  const runWithGuardianGate = (action: () => void) => {
    if (isGuardianUnlockActive(guardianUnlockedAt)) {
      action();
      return;
    }

    pendingGuardianActionRef.current = action;
    setGuardianChallenge(createGuardianChallenge());
    setGuardianAnswer("");
    setGuardianError(null);
    setGuardianGateVisible(true);
  };

  const closeGuardianGate = () => {
    pendingGuardianActionRef.current = null;
    setGuardianAnswer("");
    setGuardianError(null);
    setGuardianGateVisible(false);
  };

  const submitGuardianGate = () => {
    if (!verifyGuardianAnswer(guardianChallenge, guardianAnswer)) {
      setGuardianError("That answer does not match. Ask a grown-up and try again.");
      playCue("error");
      return;
    }

    setGuardianUnlockedAt(Date.now());
    setGuardianError(null);
    setGuardianAnswer("");
    setGuardianGateVisible(false);
    playCue("success");

    const pendingAction = pendingGuardianActionRef.current;
    pendingGuardianActionRef.current = null;
    pendingAction?.();
  };

  const dismissBreakReminder = () => {
    setBreakReminderVisible(false);
    playCue("tap");
  };

  const disableBreakReminder = () => {
    setBreakReminderEnabled(false);
    setBreakReminderVisible(false);
    playCue("tap");
  };

  const startSolveChallenge = () => {
    setDroppedPigments([]);
    setSolveResult(null);
    setSolvePhase("mixing");
    setSolveSessionKey((previous) => previous + 1);
    setSessionInsights((current) => recordModeStart(current, "solve"));
    playCue("start");
  };

  const resetSolveMix = () => {
    setDroppedPigments([]);
    setSolveResult(null);
    setSolvePhase("mixing");
    setSolveSessionKey((previous) => previous + 1);
    playCue("tap");
  };

  const cycleSolveChallenge = (nextPhase: SolvePhase) => {
    setSolveChallenge((current) => selectNextChallenge(solveChallengePool, current.id));
    setDroppedPigments([]);
    setSolveResult(null);
    setSolvePhase(nextPhase);
    setSolveSessionKey((previous) => previous + 1);
    playCue("tap");
  };

  const submitSolveAttempt = () => {
    if (!attemptColor) {
      return;
    }

    const result = evaluateSolveAttempt(solveChallenge, attemptColor);

    setSolveResult(result);
    setSolvePhase("result");
    setSessionInsights((current) => recordModeCompletion(current, "solve"));
    playCue(result.passed ? "success" : "error");
  };

  const startPredictChallenge = () => {
    setPredictSelectedOptionId(null);
    setPredictResult(null);
    setPredictPhase("guessing");
    setSessionInsights((current) => recordModeStart(current, "predict"));
    playCue("start");
  };

  const cyclePredictChallenge = (nextPhase: PredictPhase) => {
    setPredictChallenge((current) => selectNextPredictChallenge(predictChallengePool, current.id));
    setPredictSelectedOptionId(null);
    setPredictResult(null);
    setPredictPhase(nextPhase);
    playCue("tap");
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
    setSessionInsights((current) => recordModeCompletion(current, "predict"));
    playCue(evaluation.isCorrect ? "success" : "error");
  };

  const startDiscriminateChallenge = () => {
    setDiscriminateSelectedOptionId(null);
    setDiscriminateResult(null);
    setDiscriminatePhase("guessing");
    setSessionInsights((current) => recordModeStart(current, "discriminate"));
    playCue("start");
  };

  const cycleDiscriminateChallenge = (nextPhase: DiscriminatePhase) => {
    setDiscriminateChallenge((current) =>
      selectNextDiscriminateChallenge(discriminateChallengePool, current.id)
    );
    setDiscriminateSelectedOptionId(null);
    setDiscriminateResult(null);
    setDiscriminatePhase(nextPhase);
    playCue("tap");
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
    setSessionInsights((current) => recordModeCompletion(current, "discriminate"));
    playCue(evaluation.isCorrect ? "success" : "error");
  };

  const playCue = (cue: SoundCue) => {
    if (!soundEnabled) {
      return;
    }

    soundPlayerRef.current?.play(cue);
  };

  const selectMode = (nextMode: GameMode) => {
    setMode(nextMode);
    playCue("tap");
  };

  const toggleSound = () => {
    setSoundEnabled((current) => {
      const next = !current;

      if (next) {
        soundPlayerRef.current?.play("tap");
      }

      return next;
    });
  };

  const toggleHighContrast = () => {
    setHighContrastEnabled((current) => !current);
    playCue("tap");
  };

  const toggleColorAssist = () => {
    setColorAssistEnabled((current) => !current);
    playCue("tap");
  };

  const toggleBreakReminder = () => {
    setBreakReminderEnabled((current) => !current);
    playCue("tap");
  };

  const exportDiaryToJson = () => {
    if (typeof window === "undefined") {
      return;
    }

    const payload = serializeDiaryEntries(diaryEntries);
    const blob = new Blob([payload], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    const dateStamp = new Date().toISOString().slice(0, 10);

    anchor.href = url;
    anchor.download = `colormix-diary-${dateStamp}.json`;
    anchor.click();

    window.URL.revokeObjectURL(url);
    setSessionInsights((current) => recordDiaryAction(current, "export"));
    playCue("save");
  };

  const importDiaryFromFile = async (file: File | null): Promise<void> => {
    if (!file) {
      return;
    }

    try {
      const rawText = await file.text();
      const importedEntries = parseDiaryEntries(rawText);

      if (importedEntries.length === 0) {
        throw new Error("No valid diary entries found in selected file.");
      }

      setDiaryEntries((current) => mergeDiaryEntries(current, importedEntries));
      setSelectedDiaryEntryId(importedEntries[0]?.id ?? null);
      setDiaryImportError(null);
      setSessionInsights((current) => recordDiaryAction(current, "import"));
      playCue("save");
    } catch (error) {
      setDiaryImportError(
        error instanceof Error ? error.message : "Unable to import diary file."
      );
      playCue("error");
    }
  };

  const applyDailyPromptToDraft = () => {
    if (!selectedDiaryEntry) {
      return;
    }

    setDiaryDraftNote((current) =>
      current.trim().length > 0 ? `${current.trim()}\n${dailyDiaryPrompt}` : dailyDiaryPrompt
    );
    playCue("tap");
  };

  const addDiaryEntry = (entry: DiaryEntry) => {
    setDiaryEntries((current) => prependDiaryEntry(current, entry));
    setSelectedDiaryEntryId(entry.id);
    setSessionInsights((current) => recordDiaryAction(current, "save"));
    setMode("collect");
    playCue("save");
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
    playCue("save");
  };

  const deleteSelectedDiaryEntry = () => {
    if (!selectedDiaryEntry) {
      return;
    }

    setDiaryEntries((current) => removeDiaryEntry(current, selectedDiaryEntry.id));
    playCue("delete");
  };

  const requestDiaryExport = () => {
    runWithGuardianGate(exportDiaryToJson);
  };

  const requestDiaryImport = (file: File | null) => {
    if (!file) {
      return;
    }

    runWithGuardianGate(() => {
      void importDiaryFromFile(file);
    });
  };

  const requestDeleteSelectedDiaryEntry = () => {
    runWithGuardianGate(deleteSelectedDiaryEntry);
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
    <main className={`app-shell ${highContrastEnabled ? "high-contrast" : ""}`}>
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
        {mode !== "collect" && <p className="pack-note">Current pack: {selectedPackTitle}</p>}

        <div className="mode-switch" role="tablist" aria-label="Game mode switch">
          <button
            type="button"
            role="tab"
            aria-selected={mode === "solve"}
            className={`mode-button ${mode === "solve" ? "active" : ""}`}
            onClick={() => selectMode("solve")}
          >
            Solve
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "predict"}
            className={`mode-button ${mode === "predict" ? "active" : ""}`}
            onClick={() => selectMode("predict")}
          >
            Predict
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "discriminate"}
            className={`mode-button ${mode === "discriminate" ? "active" : ""}`}
            onClick={() => selectMode("discriminate")}
          >
            Find the Twin
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "collect"}
            className={`mode-button ${mode === "collect" ? "active" : ""}`}
            onClick={() => selectMode("collect")}
          >
            Color Diary
          </button>
        </div>

        <div className="polish-controls">
          <label className="pack-select">
            Pack
            <select value={selectedPackId} onChange={(event) => setSelectedPackId(event.target.value)}>
              {availablePackOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            className={`sound-toggle ${soundEnabled ? "active" : ""}`}
            onClick={toggleSound}
            aria-pressed={soundEnabled}
          >
            Sound: {soundEnabled ? "On" : "Off"}
          </button>
          <button
            type="button"
            className={`sound-toggle ${highContrastEnabled ? "active" : ""}`}
            onClick={toggleHighContrast}
            aria-pressed={highContrastEnabled}
          >
            High Contrast: {highContrastEnabled ? "On" : "Off"}
          </button>
          <button
            type="button"
            className={`sound-toggle ${breakReminderEnabled ? "active" : ""}`}
            onClick={toggleBreakReminder}
            aria-pressed={breakReminderEnabled}
          >
            Break Reminder: {breakReminderEnabled ? "On" : "Off"}
          </button>
          <p className={`guardian-note ${guardianUnlocked ? "unlocked" : ""}`}>
            Grown-up actions: {guardianUnlocked ? "Unlocked" : "Locked"}
          </p>
          <p className="motion-note">Motion effects respect your system reduced-motion setting.</p>
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
            <button
              type="button"
              className={`sound-toggle ${colorAssistEnabled ? "active" : ""}`}
              onClick={toggleColorAssist}
              aria-pressed={colorAssistEnabled}
            >
              Color Assist: {colorAssistEnabled ? "On" : "Off"}
            </button>
            <div className="context-preview" style={{ background: discriminateContext.frameBackground }}>
              <span
                className="target-swatch large"
                style={{ backgroundColor: discriminateChallenge.targetHex }}
              />
              <span>{discriminateChallenge.targetHex}</span>
              {colorAssistEnabled && (
                <span className="assist-chip">{formatAssistLabel(discriminateChallenge.target)}</span>
              )}
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
                {colorAssistEnabled && (
                  <span className="assist-chip">{formatAssistLabel(discriminateChallenge.target)}</span>
                )}
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
                    {colorAssistEnabled && (
                      <span className="assist-chip">{formatAssistLabel(option.color)}</span>
                    )}
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
                {colorAssistEnabled && (
                  <span className="assist-chip">{formatAssistLabel(discriminateSelectedOption.color)}</span>
                )}
              </div>
            ) : (
              <p className="hint">Select the swatch that exactly matches the target.</p>
            )}
            <p className="hint">{discriminateContext.description}</p>
            <button
              type="button"
              className={`sound-toggle ${colorAssistEnabled ? "active" : ""}`}
              onClick={toggleColorAssist}
              aria-pressed={colorAssistEnabled}
            >
              Color Assist: {colorAssistEnabled ? "On" : "Off"}
            </button>
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
              {colorAssistEnabled && (
                <span className="assist-chip">{formatAssistLabel(discriminateChallenge.target)}</span>
              )}
            </div>
            <div className="swatch-card" style={{ background: discriminateContext.panelBackground }}>
              <span className="label">Your Pick</span>
              <span
                className="target-swatch large"
                style={{ backgroundColor: discriminateResult.selectedOption.hex }}
              />
              <span>{discriminateResult.selectedOption.hex}</span>
              {colorAssistEnabled && (
                <span className="assist-chip">
                  {formatAssistLabel(discriminateResult.selectedOption.color)}
                </span>
              )}
            </div>
            <div className="swatch-card" style={{ background: discriminateContext.panelBackground }}>
              <span className="label">Correct Twin</span>
              <span
                className="target-swatch large"
                style={{ backgroundColor: discriminateResult.correctOption.hex }}
              />
              <span>{discriminateResult.correctOption.hex}</span>
              {colorAssistEnabled && (
                <span className="assist-chip">
                  {formatAssistLabel(discriminateResult.correctOption.color)}
                </span>
              )}
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
            <p className="diary-prompt">Daily Prompt: {dailyDiaryPrompt}</p>
            <section className="insights-panel" aria-label="Session insights">
              <h3>Session Insights</h3>
              <p className="hint">
                Started {new Date(sessionInsights.startedAt).toLocaleTimeString()} | Updated{" "}
                {new Date(sessionInsights.updatedAt).toLocaleTimeString()}
              </p>
              <ul className="insights-list">
                <li>Challenges started: {sessionInsights.totalChallengesStarted}</li>
                <li>Challenges completed: {sessionInsights.totalChallengesCompleted}</li>
                <li>
                  Solve/Predict/Twin starts: {sessionInsights.modeStarts.solve}/
                  {sessionInsights.modeStarts.predict}/{sessionInsights.modeStarts.discriminate}
                </li>
                <li>Diary saves: {sessionInsights.diarySaves}</li>
                <li>Diary imports/exports: {sessionInsights.diaryImports}/{sessionInsights.diaryExports}</li>
              </ul>
            </section>

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

            <div className="action-row">
              <button type="button" className="button button-secondary" onClick={requestDiaryExport}>
                Export JSON
              </button>
              <label className="import-label">
                Import JSON
                <input
                  type="file"
                  accept="application/json,.json"
                  onChange={(event) => {
                    const input = event.target;
                    const file = input.files?.[0] ?? null;

                    requestDiaryImport(file);
                    input.value = "";
                  }}
                />
              </label>
            </div>
            {diaryImportError && <p className="limit-warning">{diaryImportError}</p>}

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
                  <button type="button" className="button button-secondary" onClick={applyDailyPromptToDraft}>
                    Apply Daily Prompt
                  </button>
                  <button type="button" className="button button-primary" onClick={saveDiaryDraft}>
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="button button-ghost"
                    onClick={requestDeleteSelectedDiaryEntry}
                  >
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

      {guardianGateVisible && (
        <div className="overlay" role="presentation">
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="guardian-gate-title"
          >
            <p className="eyebrow">Grown-up Check</p>
            <h2 id="guardian-gate-title">Ask a grown-up to unlock this action</h2>
            <p>Solve this quick check: {guardianChallenge.prompt}</p>
            <label>
              Answer
              <input
                type="text"
                inputMode="numeric"
                value={guardianAnswer}
                onChange={(event) => setGuardianAnswer(event.target.value)}
                placeholder="Type the result"
              />
            </label>
            {guardianError && <p className="limit-warning">{guardianError}</p>}
            <div className="action-row">
              <button type="button" className="button button-primary" onClick={submitGuardianGate}>
                Unlock for 10 Minutes
              </button>
              <button type="button" className="button button-ghost" onClick={closeGuardianGate}>
                Cancel
              </button>
            </div>
          </section>
        </div>
      )}

      {breakReminderVisible && (
        <div className="overlay" role="presentation">
          <section
            className="modal-card"
            role="dialog"
            aria-modal="true"
            aria-labelledby="break-reminder-title"
          >
            <p className="eyebrow">Wellbeing Pause</p>
            <h2 id="break-reminder-title">Time for a short eye break</h2>
            <p>
              Look away from the screen, stretch your shoulders, and rest for about 20 seconds.
              You can continue as soon as you are ready.
            </p>
            <div className="action-row">
              <button type="button" className="button button-primary" onClick={dismissBreakReminder}>
                Continue Playing
              </button>
              <button type="button" className="button button-ghost" onClick={disableBreakReminder}>
                Turn Reminder Off
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
