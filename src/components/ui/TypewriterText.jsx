import { useState, useEffect } from "react";

export function TypewriterText({ text, speed = 18, startDelay = 400 }) {
  const [count, setCount] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setCount(text.length);
      setShowCursor(false);
      return;
    }
    let i = 0;
    let intervalId;
    let endTimer;
    const startTimer = setTimeout(() => {
      intervalId = setInterval(() => {
        i += 1;
        setCount(i);
        if (i >= text.length) {
          clearInterval(intervalId);
          endTimer = setTimeout(() => setShowCursor(false), 1200);
        }
      }, speed);
    }, startDelay);
    return () => {
      clearTimeout(startTimer);
      clearTimeout(endTimer);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return (
    <>
      {text.slice(0, count)}
      {showCursor && <span className="pf-typewriter-cursor">▍</span>}
    </>
  );
}
