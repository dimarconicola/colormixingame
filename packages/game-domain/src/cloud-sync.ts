export type SyncEntityType = "diary-entry" | "player-progress";
export type SyncOperation = "upsert" | "delete";

export type SyncEnvelope<TPayload> = {
  entityType: SyncEntityType;
  entityId: string;
  operation: SyncOperation;
  payload: TPayload | null;
  updatedAt: string;
  deviceId: string;
  clock: number;
  schemaVersion: number;
};

function compareEnvelopeRecency<TPayload>(
  left: SyncEnvelope<TPayload>,
  right: SyncEnvelope<TPayload>
): number {
  if (left.clock !== right.clock) {
    return left.clock - right.clock;
  }

  if (left.updatedAt !== right.updatedAt) {
    return left.updatedAt.localeCompare(right.updatedAt);
  }

  return left.deviceId.localeCompare(right.deviceId);
}

export function shouldApplyRemoteEnvelope<TPayload>(
  localEnvelope: SyncEnvelope<TPayload> | null | undefined,
  remoteEnvelope: SyncEnvelope<TPayload>
): boolean {
  if (!localEnvelope) {
    return true;
  }

  return compareEnvelopeRecency(localEnvelope, remoteEnvelope) < 0;
}

export function mergeEnvelope<TPayload>(
  localEnvelope: SyncEnvelope<TPayload> | null | undefined,
  remoteEnvelope: SyncEnvelope<TPayload>
): SyncEnvelope<TPayload> {
  if (!localEnvelope || shouldApplyRemoteEnvelope(localEnvelope, remoteEnvelope)) {
    return remoteEnvelope;
  }

  return localEnvelope;
}

export function envelopeEntityKey<TPayload>(envelope: SyncEnvelope<TPayload>): string {
  return `${envelope.entityType}:${envelope.entityId}`;
}

export function collapseEnvelopeQueue<TPayload>(
  envelopes: readonly SyncEnvelope<TPayload>[]
): SyncEnvelope<TPayload>[] {
  const latestByEntityKey = new Map<string, SyncEnvelope<TPayload>>();

  for (const envelope of envelopes) {
    const entityKey = envelopeEntityKey(envelope);
    const current = latestByEntityKey.get(entityKey);

    if (!current || shouldApplyRemoteEnvelope(current, envelope)) {
      latestByEntityKey.set(entityKey, envelope);
    }
  }

  return [...latestByEntityKey.values()].sort((left, right) => {
    if (left.updatedAt !== right.updatedAt) {
      return left.updatedAt.localeCompare(right.updatedAt);
    }

    if (left.clock !== right.clock) {
      return left.clock - right.clock;
    }

    return left.deviceId.localeCompare(right.deviceId);
  });
}
