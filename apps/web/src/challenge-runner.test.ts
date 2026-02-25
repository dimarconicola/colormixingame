import { describe, expect, it } from "vitest";
import { selectNextById } from "./challenge-runner";

describe("selectNextById", () => {
  it("throws when no challenges are provided", () => {
    expect(() => selectNextById([])).toThrowError("selectNextById requires at least one challenge.");
  });

  it("returns the only challenge when collection length is one", () => {
    const challenge = { id: "one", name: "Only" };

    expect(selectNextById([challenge])).toEqual(challenge);
  });

  it("returns a different challenge when current id is provided", () => {
    const challenges = [
      { id: "a", name: "A" },
      { id: "b", name: "B" },
      { id: "c", name: "C" }
    ] as const;

    const selected = selectNextById(challenges, "a", () => 0);

    expect(selected.id).toBe("b");
  });
});
