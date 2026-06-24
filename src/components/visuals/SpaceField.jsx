import { useRef, useEffect } from "react";

export function SpaceField() {
  const containerRef = useRef(null);
  const canvasRef = useRef(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = container.clientWidth || 1;
    let height = container.clientHeight || 1;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = container.clientWidth || 1;
      height = container.clientHeight || 1;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const STAR_COUNT = 150;
    const stars = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random(),
        y: Math.random(),
        r: 0.6 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        speed: 0.6 + Math.random() * 1.1,
        depth: 0.3 + Math.random() * 0.7,
      });
    }

    let burst = null;

    function handleMove(e) {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      };
    }
    function handleClick(e) {
      const rect = container.getBoundingClientRect();
      burst = { x: e.clientX - rect.left, y: e.clientY - rect.top, t: performance.now() };
    }

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("click", handleClick);
    window.addEventListener("resize", resize);

    let frameId;
    const start = performance.now();

    function draw(now) {
      const elapsed = (now - start) / 1000;
      ctx.clearRect(0, 0, width, height);

      const parallaxX = reducedMotion ? 0 : mouseRef.current.x * 14;
      const parallaxY = reducedMotion ? 0 : mouseRef.current.y * 10;

      stars.forEach((s) => {
        const px = s.x * width + parallaxX * s.depth;
        const py = s.y * height + parallaxY * s.depth;
        let alpha = 0.45 + Math.sin(elapsed * s.speed + s.phase) * 0.4;
        alpha = Math.max(0.12, alpha);
        ctx.beginPath();
        ctx.arc(px, py, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(234,237,245,${alpha})`;
        ctx.fill();
      });

      if (burst) {
        const age = now - burst.t;
        if (age < 600) {
          const p = age / 600;
          ctx.beginPath();
          ctx.arc(burst.x, burst.y, 4 + p * 26, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(242,184,114,${1 - p})`;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        } else {
          burst = null;
        }
      }

      if (!reducedMotion) frameId = requestAnimationFrame(draw);
    }

    if (reducedMotion) {
      draw(performance.now());
    } else {
      frameId = requestAnimationFrame(draw);
    }

    return () => {
      window.removeEventListener("resize", resize);
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("click", handleClick);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <div ref={containerRef} className="pf-space-field" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}