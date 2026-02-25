import { describe, expect, it } from "vitest";
import { clamp, findTopmostCircleAtPoint, isPointInCircle, pointerToCanvasPoint } from "./math";

describe("clamp", () => {
  it("bounds values to the provided range", () => {
    expect(clamp(10, 0, 5)).toBe(5);
    expect(clamp(-2, 0, 5)).toBe(0);
    expect(clamp(3, 0, 5)).toBe(3);
  });
});

describe("isPointInCircle", () => {
  it("returns true when point is inside or on edge", () => {
    expect(isPointInCircle({ x: 10, y: 10 }, { x: 10, y: 10, radius: 5 })).toBe(true);
    expect(isPointInCircle({ x: 15, y: 10 }, { x: 10, y: 10, radius: 5 })).toBe(true);
  });

  it("returns false when point is outside", () => {
    expect(isPointInCircle({ x: 16, y: 10 }, { x: 10, y: 10, radius: 5 })).toBe(false);
  });
});

describe("findTopmostCircleAtPoint", () => {
  it("selects the last matching circle to preserve topmost ordering", () => {
    const circles = [
      { x: 50, y: 50, radius: 30, value: "bottom" },
      { x: 55, y: 55, radius: 30, value: "top" }
    ] as const;

    const selected = findTopmostCircleAtPoint(circles, { x: 60, y: 60 });

    expect(selected?.value).toBe("top");
  });

  it("returns undefined when no circles include the point", () => {
    const circles = [{ x: 10, y: 10, radius: 5 }];

    expect(findTopmostCircleAtPoint(circles, { x: 100, y: 100 })).toBeUndefined();
  });
});

describe("pointerToCanvasPoint", () => {
  it("maps client coordinates into logical canvas coordinates", () => {
    const point = pointerToCanvasPoint(
      210,
      110,
      { left: 10, top: 10, width: 100, height: 50 },
      200,
      100
    );

    expect(point).toEqual({ x: 400, y: 200 });
  });
});
