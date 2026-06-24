import { useRef, useEffect } from "react";

export function ParallaxStars() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    let width = window.innerWidth;
    let height = window.innerHeight;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const LAYER_DEFS = [
      { count: 70, factor: 0.04, minR: 0.5, maxR: 1.1, minA: 0.25, maxA: 0.5 },
      { count: 45, factor: 0.11, minR: 0.8, maxR: 1.6, minA: 0.35, maxA: 0.65 },
      { count: 22, factor: 0.22, minR: 1.2, maxR: 2.2, minA: 0.5, maxA: 0.85 },
    ];

    let layers = [];
    function buildStars() {
      layers = LAYER_DEFS.map((def) =>
        Array.from({ length: def.count }, () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          r: def.minR + Math.random() * (def.maxR - def.minR),
          a: def.minA + Math.random() * (def.maxA - def.minA),
        }))
      );
    }

    resize();
    buildStars();

    let scrollY = window.scrollY;
    let ticking = false;
    let shootingStar = null;
    let shootTimer = null;
    let frameId = null;

    function drawStaticLayers() {
      LAYER_DEFS.forEach((def, li) => {
        const offset = scrollY * def.factor;
        layers[li].forEach((s) => {
          const y = (((s.y - offset) % height) + height) % height;
          ctx.beginPath();
          ctx.arc(s.x, y, s.r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(234,237,245,${s.a})`;
          ctx.fill();
        });
      });
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      drawStaticLayers();
      if (shootingStar) {
        const s = shootingStar;
        const tailX = s.x - s.vx * 7;
        const tailY = s.y - s.vy * 7;
        const grad = ctx.createLinearGradient(s.x, s.y, tailX, tailY);
        grad.addColorStop(0, "rgba(242,184,114,0.9)");
        grad.addColorStop(1, "rgba(242,184,114,0)");
        ctx.strokeStyle = grad;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();
      }
      ticking = false;
    }

    function animateShootingStar() {
      if (!shootingStar) return;
      shootingStar.x += shootingStar.vx;
      shootingStar.y += shootingStar.vy;
      shootingStar.life += 1;
      draw();
      if (shootingStar.life > 70 || shootingStar.x < -50 || shootingStar.x > width + 50 || shootingStar.y > height + 50) {
        shootingStar = null;
        frameId = null;
        scheduleNextShoot();
        return;
      }
      frameId = requestAnimationFrame(animateShootingStar);
    }

    function spawnShootingStar() {
      const fromLeft = Math.random() > 0.5;
      shootingStar = {
        x: fromLeft ? -20 : width + 20,
        y: Math.random() * height * 0.7,
        vx: (fromLeft ? 1 : -1) * (5 + Math.random() * 4),
        vy: 2.5 + Math.random() * 2.5,
        life: 0,
      };
      if (frameId == null) frameId = requestAnimationFrame(animateShootingStar);
    }

    function scheduleNextShoot() {
      if (reducedMotion) return;
      const delay = 9000 + Math.random() * 14000;
      shootTimer = window.setTimeout(spawnShootingStar, delay);
    }

    function onScroll() {
      scrollY = window.scrollY;
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(draw);
      }
    }

    function onResize() {
      resize();
      buildStars();
      draw();
    }

    draw();
    if (!reducedMotion) {
      window.addEventListener("scroll", onScroll, { passive: true });
      scheduleNextShoot();
    }
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      if (shootTimer) clearTimeout(shootTimer);
      if (frameId) cancelAnimationFrame(frameId);
    };
  }, []);

  return <canvas ref={canvasRef} className="pf-parallax-stars" aria-hidden="true" />;
}
