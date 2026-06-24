import { useRef } from "react";

export function WarpOverlay() {
  const lines = useRef(
    Array.from({ length: 16 }).map((_, i) => ({
      angle: (i / 16) * 360 + Math.random() * 8,
      duration: 0.35 + Math.random() * 0.25,
    }))
  ).current;

  return (
    <div className="pf-warp-overlay" aria-hidden="true">
      {lines.map((l, i) => (
        <span key={i} className="pf-warp-line" style={{ "--a": `${l.angle}deg`, "--d": `${l.duration}s` }} />
      ))}
    </div>
  );
}
