import { useState, useEffect } from "react";

const NUMERIC = /^(\d+)(\D*)$/;

/** Counts a leading integer up from 0 ("50K" -> 0K..50K). Anything else is shown as is. */
export function CountUp({ value, instant = false, delay = 500, duration = 1100 }) {
  const match = NUMERIC.exec(value);
  const target = match ? parseInt(match[1], 10) : 0;
  const suffix = match ? match[2] : "";
  const animate = !!match && !instant;
  const [n, setN] = useState(animate ? 0 : target);

  // Depends only on primitives. (A regex match object is new every render, which used to
  // restart this effect on every frame and kept the number from ever reaching its target.)
  useEffect(() => {
    if (!animate) {
      setN(target);
      return;
    }
    let frame;
    let start;
    const timer = setTimeout(() => {
      const tick = (now) => {
        if (start == null) start = now;
        const t = Math.min(1, (now - start) / duration);
        setN(Math.round(target * (1 - Math.pow(1 - t, 3))));
        if (t < 1) frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);
    }, delay);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(frame);
    };
  }, [animate, target, delay, duration]);

  if (!match) return <>{value}</>;
  return (
    <>
      <span className="pf-sr-only">{value}</span>
      <span aria-hidden="true">
        {n}
        {suffix}
      </span>
    </>
  );
}
