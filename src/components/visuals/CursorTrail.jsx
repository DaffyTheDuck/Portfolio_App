import { useRef, useEffect } from "react";

export function CursorTrail() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      canvas.width = window.innerWidth * dpr;
      canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener("resize", resize);

    let particles = [];
    let lastSpawn = 0;

    function handleMove(e) {
      const now = performance.now();
      if (now - lastSpawn < 35) return;
      lastSpawn = now;
      particles.push({
        x: e.clientX,
        y: e.clientY,
        vx: (Math.random() - 0.5) * 0.4,
        vy: -0.3 - Math.random() * 0.3,
        life: 0,
        maxLife: 50 + Math.random() * 20,
        size: 1 + Math.random() * 1.6,
      });
      if (particles.length > 60) particles.splice(0, particles.length - 60);
    }
    window.addEventListener("mousemove", handleMove);

    let frameId;
    function draw() {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 1;
      });
      particles = particles.filter((p) => p.life < p.maxLife);
      particles.forEach((p) => {
        const t = p.life / p.maxLife;
        const alpha = (1 - t) * 0.65;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - t * 0.4), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(242,184,114,${alpha})`;
        ctx.fill();
      });
      frameId = requestAnimationFrame(draw);
    }
    frameId = requestAnimationFrame(draw);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMove);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="pf-cursor-trail" aria-hidden="true" />;
}
