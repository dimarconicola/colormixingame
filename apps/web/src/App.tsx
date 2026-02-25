import { useEffect, useRef, useState } from "react";
import { MixCanvas, type MixCanvasDropEvent } from "@colormix/mix-canvas";

const MAX_DROP_LOG_ITEMS = 6;

export function App() {
  const canvasHostRef = useRef<HTMLDivElement | null>(null);
  const [dropEvents, setDropEvents] = useState<MixCanvasDropEvent[]>([]);

  useEffect(() => {
    const hostElement = canvasHostRef.current;

    if (!hostElement) {
      return;
    }

    const calculateSize = () => {
      const width = Math.max(320, Math.min(680, hostElement.clientWidth));
      const height = Math.round(width * 0.58);

      return { width, height };
    };

    const initialSize = calculateSize();

    const mixCanvas = new MixCanvas({
      container: hostElement,
      width: initialSize.width,
      height: initialSize.height,
      onDropInBowl: (event) => {
        setDropEvents((previous) => [event, ...previous].slice(0, MAX_DROP_LOG_ITEMS));
      }
    });

    const resize = () => {
      const size = calculateSize();
      mixCanvas.resize(size.width, size.height);
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
  }, []);

  return (
    <main className="app-shell">
      <section className="hero">
        <p className="eyebrow">Color Mixing Game</p>
        <h1>Drag pigments into the bowl</h1>
        <p>
          <code>mix-canvas</code> now includes pointer-driven drag and drop interactions for the
          first tactile gameplay baseline.
        </p>
      </section>

      <section className="playground">
        <div className="canvas-panel">
          <div ref={canvasHostRef} className="mix-canvas-host" />
        </div>

        <aside className="event-panel" aria-live="polite">
          <h2>Recent Bowl Drops</h2>
          {dropEvents.length === 0 ? (
            <p className="empty-state">Drag any pigment circle into the bowl to log events.</p>
          ) : (
            <ul className="drop-list">
              {dropEvents.map((event) => (
                <li key={`${event.dropCount}-${event.pigment.id}`}>
                  <span
                    className="swatch"
                    style={{ backgroundColor: event.pigment.color }}
                    aria-hidden="true"
                  />
                  <span>{event.pigment.id} dropped in bowl</span>
                  <span className="drop-count">#{event.dropCount}</span>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </section>
    </main>
  );
}
