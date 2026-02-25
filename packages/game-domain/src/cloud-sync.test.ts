import { describe, expect, it } from "vitest";
import {
  collapseEnvelopeQueue,
  mergeEnvelope,
  shouldApplyRemoteEnvelope,
  type SyncEnvelope
} from "./cloud-sync";

type Payload = {
  value: string;
};

function createEnvelope(overrides: Partial<SyncEnvelope<Payload>> = {}): SyncEnvelope<Payload> {
  return {
    entityType: "diary-entry",
    entityId: "entry-1",
    operation: "upsert",
    payload: { value: "base" },
    updatedAt: "2026-02-25T12:00:00.000Z",
    deviceId: "device-a",
    clock: 1,
    schemaVersion: 1,
    ...overrides
  };
}

describe("shouldApplyRemoteEnvelope", () => {
  it("applies when local envelope is missing", () => {
    expect(shouldApplyRemoteEnvelope(null, createEnvelope())).toBe(true);
  });

  it("prefers higher logical clock", () => {
    const local = createEnvelope({ clock: 5 });
    const remoteNewer = createEnvelope({ clock: 6 });
    const remoteOlder = createEnvelope({ clock: 4 });

    expect(shouldApplyRemoteEnvelope(local, remoteNewer)).toBe(true);
    expect(shouldApplyRemoteEnvelope(local, remoteOlder)).toBe(false);
  });

  it("uses updatedAt then deviceId as deterministic tie-breakers", () => {
    const local = createEnvelope({ clock: 8, updatedAt: "2026-02-25T12:00:00.000Z", deviceId: "device-a" });
    const remoteByTime = createEnvelope({
      clock: 8,
      updatedAt: "2026-02-25T12:00:01.000Z",
      deviceId: "device-z"
    });
    const remoteByDevice = createEnvelope({
      clock: 8,
      updatedAt: "2026-02-25T12:00:00.000Z",
      deviceId: "device-z"
    });

    expect(shouldApplyRemoteEnvelope(local, remoteByTime)).toBe(true);
    expect(shouldApplyRemoteEnvelope(local, remoteByDevice)).toBe(true);
  });
});

describe("mergeEnvelope", () => {
  it("returns the newer envelope", () => {
    const local = createEnvelope({ clock: 3, payload: { value: "old" } });
    const remote = createEnvelope({ clock: 4, payload: { value: "new" } });

    expect(mergeEnvelope(local, remote)).toEqual(remote);
  });
});

describe("collapseEnvelopeQueue", () => {
  it("keeps only the newest envelope per entity", () => {
    const envelopes = [
      createEnvelope({ entityId: "entry-1", clock: 2, payload: { value: "v1" } }),
      createEnvelope({ entityId: "entry-1", clock: 4, payload: { value: "v2" } }),
      createEnvelope({ entityId: "entry-2", clock: 1, payload: { value: "x1" } }),
      createEnvelope({ entityId: "entry-2", clock: 3, payload: { value: "x2" } })
    ];

    const collapsed = collapseEnvelopeQueue(envelopes);

    expect(collapsed).toHaveLength(2);
    expect(collapsed.find((envelope) => envelope.entityId === "entry-1")?.payload?.value).toBe("v2");
    expect(collapsed.find((envelope) => envelope.entityId === "entry-2")?.payload?.value).toBe("x2");
  });
});
