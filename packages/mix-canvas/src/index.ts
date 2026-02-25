export type MixCanvasOptions = {
  container: HTMLElement;
  width: number;
  height: number;
  backgroundColor?: string;
};

export class MixCanvas {
  #container: HTMLElement;
  #width: number;
  #height: number;

  constructor(options: MixCanvasOptions) {
    this.#container = options.container;
    this.#width = options.width;
    this.#height = options.height;

    this.#container.style.background = options.backgroundColor ?? "#f7f3e8";
  }

  resize(width: number, height: number): void {
    this.#width = width;
    this.#height = height;
  }

  getSize(): { width: number; height: number } {
    return {
      width: this.#width,
      height: this.#height
    };
  }

  destroy(): void {
    this.#container.removeAttribute("style");
  }
}
