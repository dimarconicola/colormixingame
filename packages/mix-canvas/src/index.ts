import { clamp, findTopmostCircleAtPoint, isPointInCircle, pointerToCanvasPoint, type Point } from "./math";

export type MixCanvasPigmentInput = {
  id: string;
  color: string;
  x: number;
  y: number;
  radius?: number;
};

export type MixCanvasPigmentState = {
  id: string;
  color: string;
  x: number;
  y: number;
  radius: number;
};

export type MixCanvasBowl = {
  x: number;
  y: number;
  radius: number;
  fillColor: string;
  strokeColor: string;
};

export type MixCanvasDragEvent = {
  pigment: MixCanvasPigmentState;
  position: Point;
  pointerId: number;
  insideBowl: boolean;
};

export type MixCanvasDropEvent = MixCanvasDragEvent & {
  dropCount: number;
};

type MixCanvasInternalPigment = MixCanvasPigmentState & {
  homeX: number;
  homeY: number;
};

type MixCanvasDragState = {
  pointerId: number;
  pigmentId: string;
  grabOffsetX: number;
  grabOffsetY: number;
};

export type MixCanvasOptions = {
  container: HTMLElement;
  width: number;
  height: number;
  backgroundColor?: string;
  pigments?: readonly MixCanvasPigmentInput[];
  bowl?: Partial<Omit<MixCanvasBowl, "x" | "y" | "radius">> & {
    x?: number;
    y?: number;
    radius?: number;
  };
  onDragStart?: (event: MixCanvasDragEvent) => void;
  onDragMove?: (event: MixCanvasDragEvent) => void;
  onDropInBowl?: (event: MixCanvasDropEvent) => void;
  onDragEnd?: (event: MixCanvasDragEvent) => void;
};

const DEFAULT_BACKGROUND = "#f7f3e8";
const DEFAULT_PIGMENT_RADIUS = 24;

export class MixCanvas {
  #container: HTMLElement;
  #canvas: HTMLCanvasElement;
  #context: CanvasRenderingContext2D;
  #width: number;
  #height: number;
  #dpr: number;
  #backgroundColor: string;
  #pigments: MixCanvasInternalPigment[];
  #bowl: MixCanvasBowl;
  #dragState: MixCanvasDragState | null = null;
  #dropCount = 0;

  #onDragStart?: MixCanvasOptions["onDragStart"];
  #onDragMove?: MixCanvasOptions["onDragMove"];
  #onDropInBowl?: MixCanvasOptions["onDropInBowl"];
  #onDragEnd?: MixCanvasOptions["onDragEnd"];

  #boundPointerDown: (event: PointerEvent) => void;
  #boundPointerMove: (event: PointerEvent) => void;
  #boundPointerUp: (event: PointerEvent) => void;
  #boundPointerCancel: (event: PointerEvent) => void;

  constructor(options: MixCanvasOptions) {
    this.#container = options.container;
    this.#width = options.width;
    this.#height = options.height;
    this.#dpr = Math.max(1, window.devicePixelRatio || 1);
    this.#backgroundColor = options.backgroundColor ?? DEFAULT_BACKGROUND;

    this.#canvas = document.createElement("canvas");
    this.#canvas.style.display = "block";
    this.#canvas.style.width = `${this.#width}px`;
    this.#canvas.style.height = `${this.#height}px`;
    this.#canvas.style.touchAction = "none";
    this.#canvas.style.userSelect = "none";

    const context = this.#canvas.getContext("2d");

    if (!context) {
      throw new Error("MixCanvas requires a 2D canvas context.");
    }

    this.#context = context;

    this.#pigments = this.#normalizePigments(options.pigments);
    this.#bowl = this.#normalizeBowl(options.bowl);

    this.#onDragStart = options.onDragStart;
    this.#onDragMove = options.onDragMove;
    this.#onDropInBowl = options.onDropInBowl;
    this.#onDragEnd = options.onDragEnd;

    this.#boundPointerDown = (event) => this.#handlePointerDown(event);
    this.#boundPointerMove = (event) => this.#handlePointerMove(event);
    this.#boundPointerUp = (event) => this.#handlePointerUp(event);
    this.#boundPointerCancel = (event) => this.#handlePointerUp(event);

    this.#canvas.addEventListener("pointerdown", this.#boundPointerDown);
    this.#canvas.addEventListener("pointermove", this.#boundPointerMove);
    this.#canvas.addEventListener("pointerup", this.#boundPointerUp);
    this.#canvas.addEventListener("pointercancel", this.#boundPointerCancel);

    this.#container.append(this.#canvas);

    this.#updateCanvasResolution();
    this.#render();
  }

  resize(width: number, height: number): void {
    this.#width = width;
    this.#height = height;
    this.#dpr = Math.max(1, window.devicePixelRatio || 1);

    this.#canvas.style.width = `${this.#width}px`;
    this.#canvas.style.height = `${this.#height}px`;

    this.#bowl = this.#normalizeBowl({
      x: this.#bowl.x,
      y: this.#bowl.y,
      radius: this.#bowl.radius,
      fillColor: this.#bowl.fillColor,
      strokeColor: this.#bowl.strokeColor
    });

    for (const pigment of this.#pigments) {
      pigment.homeX = clamp(pigment.homeX, pigment.radius, this.#width - pigment.radius);
      pigment.homeY = clamp(pigment.homeY, pigment.radius, this.#height - pigment.radius);
      pigment.x = clamp(pigment.x, pigment.radius, this.#width - pigment.radius);
      pigment.y = clamp(pigment.y, pigment.radius, this.#height - pigment.radius);
    }

    this.#updateCanvasResolution();
    this.#render();
  }

  setPigments(pigments: readonly MixCanvasPigmentInput[]): void {
    this.#pigments = this.#normalizePigments(pigments);
    this.#dragState = null;
    this.#render();
  }

  setBowl(bowl: Partial<Omit<MixCanvasBowl, "x" | "y" | "radius">> & {
    x?: number;
    y?: number;
    radius?: number;
  }): void {
    this.#bowl = this.#normalizeBowl(bowl);
    this.#render();
  }

  getSize(): { width: number; height: number } {
    return {
      width: this.#width,
      height: this.#height
    };
  }

  getPigments(): MixCanvasPigmentState[] {
    return this.#pigments.map(({ id, color, x, y, radius }) => ({ id, color, x, y, radius }));
  }

  destroy(): void {
    this.#canvas.removeEventListener("pointerdown", this.#boundPointerDown);
    this.#canvas.removeEventListener("pointermove", this.#boundPointerMove);
    this.#canvas.removeEventListener("pointerup", this.#boundPointerUp);
    this.#canvas.removeEventListener("pointercancel", this.#boundPointerCancel);

    this.#canvas.remove();
    this.#dragState = null;
  }

  #normalizePigments(pigments?: readonly MixCanvasPigmentInput[]): MixCanvasInternalPigment[] {
    const fallbackY = this.#height - 46;

    const defaults: readonly MixCanvasPigmentInput[] = [
      { id: "cadmium-red", color: "#ff4c3a", x: 74, y: fallbackY },
      { id: "hansa-yellow", color: "#ffcc33", x: 146, y: fallbackY },
      { id: "ultramarine", color: "#3e66ff", x: 218, y: fallbackY },
      { id: "titanium-white", color: "#f5f5f5", x: 290, y: fallbackY }
    ];

    const source = pigments && pigments.length > 0 ? pigments : defaults;

    return source.map((pigment) => {
      const radius = pigment.radius ?? DEFAULT_PIGMENT_RADIUS;
      const x = clamp(pigment.x, radius, this.#width - radius);
      const y = clamp(pigment.y, radius, this.#height - radius);

      return {
        id: pigment.id,
        color: pigment.color,
        radius,
        x,
        y,
        homeX: x,
        homeY: y
      };
    });
  }

  #normalizeBowl(
    bowl?: Partial<Omit<MixCanvasBowl, "x" | "y" | "radius">> & {
      x?: number;
      y?: number;
      radius?: number;
    }
  ): MixCanvasBowl {
    const requestedRadius = bowl?.radius ?? 84;
    const maxRadius = Math.max(12, Math.min(this.#width, this.#height) * 0.5 - 2);
    const radius = clamp(requestedRadius, 12, maxRadius);
    const x = clamp(bowl?.x ?? this.#width * 0.72, radius, Math.max(radius, this.#width - radius));
    const y = clamp(bowl?.y ?? this.#height * 0.46, radius, Math.max(radius, this.#height - radius));

    return {
      x,
      y,
      radius,
      fillColor: bowl?.fillColor ?? "#fdf7e7",
      strokeColor: bowl?.strokeColor ?? "#d1a75b"
    };
  }

  #updateCanvasResolution(): void {
    this.#canvas.width = Math.round(this.#width * this.#dpr);
    this.#canvas.height = Math.round(this.#height * this.#dpr);

    this.#context.setTransform(this.#dpr, 0, 0, this.#dpr, 0, 0);
  }

  #pointerToCanvasPosition(event: PointerEvent): Point {
    const rect = this.#canvas.getBoundingClientRect();

    return pointerToCanvasPoint(event.clientX, event.clientY, rect, this.#width, this.#height);
  }

  #handlePointerDown(event: PointerEvent): void {
    event.preventDefault();

    const pointerPosition = this.#pointerToCanvasPosition(event);

    const selected = findTopmostCircleAtPoint(this.#pigments, pointerPosition);

    if (!selected) {
      return;
    }

    this.#dragState = {
      pointerId: event.pointerId,
      pigmentId: selected.id,
      grabOffsetX: pointerPosition.x - selected.x,
      grabOffsetY: pointerPosition.y - selected.y
    };

    try {
      this.#canvas.setPointerCapture(event.pointerId);
    } catch {
      // ignore capture errors in environments that do not support it.
    }

    this.#onDragStart?.({
      pigment: this.#toPigmentState(selected),
      position: pointerPosition,
      pointerId: event.pointerId,
      insideBowl: isPointInCircle(selected, this.#bowl)
    });

    this.#render();
  }

  #handlePointerMove(event: PointerEvent): void {
    if (!this.#dragState || this.#dragState.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();

    const pigment = this.#pigments.find((entry) => entry.id === this.#dragState?.pigmentId);

    if (!pigment) {
      return;
    }

    const pointerPosition = this.#pointerToCanvasPosition(event);

    pigment.x = clamp(
      pointerPosition.x - this.#dragState.grabOffsetX,
      pigment.radius,
      this.#width - pigment.radius
    );
    pigment.y = clamp(
      pointerPosition.y - this.#dragState.grabOffsetY,
      pigment.radius,
      this.#height - pigment.radius
    );

    this.#onDragMove?.({
      pigment: this.#toPigmentState(pigment),
      position: pointerPosition,
      pointerId: event.pointerId,
      insideBowl: isPointInCircle(pigment, this.#bowl)
    });

    this.#render();
  }

  #handlePointerUp(event: PointerEvent): void {
    if (!this.#dragState || this.#dragState.pointerId !== event.pointerId) {
      return;
    }

    event.preventDefault();

    const pigment = this.#pigments.find((entry) => entry.id === this.#dragState?.pigmentId);

    if (!pigment) {
      this.#dragState = null;
      return;
    }

    const pointerPosition = this.#pointerToCanvasPosition(event);
    const insideBowl = isPointInCircle(pigment, this.#bowl);

    if (insideBowl) {
      this.#dropCount += 1;

      this.#onDropInBowl?.({
        pigment: this.#toPigmentState(pigment),
        position: pointerPosition,
        pointerId: event.pointerId,
        insideBowl: true,
        dropCount: this.#dropCount
      });
    }

    pigment.x = pigment.homeX;
    pigment.y = pigment.homeY;

    this.#onDragEnd?.({
      pigment: this.#toPigmentState(pigment),
      position: pointerPosition,
      pointerId: event.pointerId,
      insideBowl
    });

    try {
      this.#canvas.releasePointerCapture(event.pointerId);
    } catch {
      // ignore capture errors in environments that do not support it.
    }

    this.#dragState = null;
    this.#render();
  }

  #toPigmentState(pigment: MixCanvasInternalPigment): MixCanvasPigmentState {
    return {
      id: pigment.id,
      color: pigment.color,
      x: pigment.x,
      y: pigment.y,
      radius: pigment.radius
    };
  }

  #render(): void {
    this.#context.clearRect(0, 0, this.#width, this.#height);

    this.#context.fillStyle = this.#backgroundColor;
    this.#context.fillRect(0, 0, this.#width, this.#height);

    this.#renderBowl();
    this.#renderPigments();
  }

  #renderBowl(): void {
    this.#context.beginPath();
    this.#context.arc(this.#bowl.x, this.#bowl.y, this.#bowl.radius, 0, Math.PI * 2);

    const gradient = this.#context.createRadialGradient(
      this.#bowl.x - this.#bowl.radius * 0.35,
      this.#bowl.y - this.#bowl.radius * 0.4,
      this.#bowl.radius * 0.2,
      this.#bowl.x,
      this.#bowl.y,
      this.#bowl.radius
    );
    gradient.addColorStop(0, "#fff9eb");
    gradient.addColorStop(1, this.#bowl.fillColor);

    this.#context.fillStyle = gradient;
    this.#context.fill();

    this.#context.lineWidth = 6;
    this.#context.strokeStyle = this.#bowl.strokeColor;
    this.#context.stroke();
  }

  #renderPigments(): void {
    const activePigmentId = this.#dragState?.pigmentId;

    for (const pigment of this.#pigments) {
      const isActive = activePigmentId === pigment.id;
      const radius = isActive ? pigment.radius * 1.05 : pigment.radius;

      this.#context.save();
      this.#context.beginPath();
      this.#context.arc(pigment.x, pigment.y, radius, 0, Math.PI * 2);
      this.#context.fillStyle = pigment.color;
      this.#context.shadowColor = "rgba(0, 0, 0, 0.18)";
      this.#context.shadowBlur = isActive ? 18 : 10;
      this.#context.shadowOffsetY = isActive ? 6 : 4;
      this.#context.fill();
      this.#context.restore();

      this.#context.beginPath();
      this.#context.arc(pigment.x, pigment.y, radius, 0, Math.PI * 2);
      this.#context.lineWidth = 2;
      this.#context.strokeStyle = "rgba(0, 0, 0, 0.2)";
      this.#context.stroke();
    }
  }
}

export { clamp, findTopmostCircleAtPoint, isPointInCircle, pointerToCanvasPoint } from "./math";
export type { Point } from "./math";
