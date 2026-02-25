export type Point = {
  x: number;
  y: number;
};

export type Circle = Point & {
  radius: number;
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function isPointInCircle(point: Point, circle: Circle): boolean {
  const deltaX = point.x - circle.x;
  const deltaY = point.y - circle.y;

  return deltaX * deltaX + deltaY * deltaY <= circle.radius * circle.radius;
}

export function findTopmostCircleAtPoint<T extends Circle>(
  circles: readonly T[],
  point: Point
): T | undefined {
  for (let index = circles.length - 1; index >= 0; index -= 1) {
    const circle = circles[index];

    if (!circle) {
      continue;
    }

    if (isPointInCircle(point, circle)) {
      return circle;
    }
  }

  return undefined;
}

export function pointerToCanvasPoint(
  clientX: number,
  clientY: number,
  rect: Pick<DOMRectReadOnly, "left" | "top" | "width" | "height">,
  logicalWidth: number,
  logicalHeight: number
): Point {
  const scaleX = rect.width > 0 ? logicalWidth / rect.width : 1;
  const scaleY = rect.height > 0 ? logicalHeight / rect.height : 1;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}
