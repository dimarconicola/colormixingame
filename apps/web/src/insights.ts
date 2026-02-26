export const SESSION_INSIGHTS_STORAGE_KEY = "colormix.insights.v1";

export type InsightsMode = "solve" | "predict" | "discriminate";
export type DiaryInsightsAction = "save" | "export" | "import";

export type SessionInsights = {
  startedAt: string;
  updatedAt: string;
  totalChallengesStarted: number;
  totalChallengesCompleted: number;
  modeStarts: Record<InsightsMode, number>;
  modeCompletions: Record<InsightsMode, number>;
  diarySaves: number;
  diaryExports: number;
  diaryImports: number;
};

type StorageLike = Pick<Storage, "getItem" | "setItem">;

function nowIsoString(): string {
  return new Date().toISOString();
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isModeCounter(value: unknown): value is Record<InsightsMode, number> {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    typeof value.solve === "number" &&
    typeof value.predict === "number" &&
    typeof value.discriminate === "number"
  );
}

function isSessionInsights(value: unknown): value is SessionInsights {
  if (!isObjectRecord(value)) {
    return false;
  }

  return (
    typeof value.startedAt === "string" &&
    typeof value.updatedAt === "string" &&
    typeof value.totalChallengesStarted === "number" &&
    typeof value.totalChallengesCompleted === "number" &&
    isModeCounter(value.modeStarts) &&
    isModeCounter(value.modeCompletions) &&
    typeof value.diarySaves === "number" &&
    typeof value.diaryExports === "number" &&
    typeof value.diaryImports === "number"
  );
}

export function createDefaultSessionInsights(): SessionInsights {
  const timestamp = nowIsoString();

  return {
    startedAt: timestamp,
    updatedAt: timestamp,
    totalChallengesStarted: 0,
    totalChallengesCompleted: 0,
    modeStarts: {
      solve: 0,
      predict: 0,
      discriminate: 0
    },
    modeCompletions: {
      solve: 0,
      predict: 0,
      discriminate: 0
    },
    diarySaves: 0,
    diaryExports: 0,
    diaryImports: 0
  };
}

export function parseSessionInsights(rawValue: string): SessionInsights | null {
  try {
    const parsed = JSON.parse(rawValue) as unknown;

    if (!isSessionInsights(parsed)) {
      return null;
    }

    return parsed;
  } catch {
    return null;
  }
}

export function readSessionInsights(storage: StorageLike | null | undefined): SessionInsights {
  if (!storage) {
    return createDefaultSessionInsights();
  }

  const rawValue = storage.getItem(SESSION_INSIGHTS_STORAGE_KEY);

  if (!rawValue) {
    return createDefaultSessionInsights();
  }

  return parseSessionInsights(rawValue) ?? createDefaultSessionInsights();
}

export function writeSessionInsights(
  insights: SessionInsights,
  storage: StorageLike | null | undefined
): void {
  if (!storage) {
    return;
  }

  storage.setItem(SESSION_INSIGHTS_STORAGE_KEY, JSON.stringify(insights));
}

export function recordModeStart(insights: SessionInsights, mode: InsightsMode): SessionInsights {
  return {
    ...insights,
    updatedAt: nowIsoString(),
    totalChallengesStarted: insights.totalChallengesStarted + 1,
    modeStarts: {
      ...insights.modeStarts,
      [mode]: insights.modeStarts[mode] + 1
    }
  };
}

export function recordModeCompletion(insights: SessionInsights, mode: InsightsMode): SessionInsights {
  return {
    ...insights,
    updatedAt: nowIsoString(),
    totalChallengesCompleted: insights.totalChallengesCompleted + 1,
    modeCompletions: {
      ...insights.modeCompletions,
      [mode]: insights.modeCompletions[mode] + 1
    }
  };
}

export function recordDiaryAction(
  insights: SessionInsights,
  action: DiaryInsightsAction
): SessionInsights {
  const next = {
    ...insights,
    updatedAt: nowIsoString()
  };

  if (action === "save") {
    return {
      ...next,
      diarySaves: insights.diarySaves + 1
    };
  }

  if (action === "export") {
    return {
      ...next,
      diaryExports: insights.diaryExports + 1
    };
  }

  return {
    ...next,
    diaryImports: insights.diaryImports + 1
  };
}
