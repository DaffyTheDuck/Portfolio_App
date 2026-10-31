import { useRef, useState } from "react";

export function TiltCard({ children, className = "" }) {
  const ref = useRef(null);
  const [style, setStyle] = useState({});

  const handleMove = (e) => {
    const card = ref.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setStyle({
      transform: `perspective(1000px) rotateX(${(0.5 - py) * 10}deg) rotateY(${(px - 0.5) * 12}deg) translateZ(0)`,
      "--mx": `${px * 100}%`,
      "--my": `${py * 100}%`,
    });
  };
  const handleLeave = () => setStyle({ transform: "perspective(1000px) rotateX(0deg) rotateY(0deg)" });

  return (
    <div ref={ref} className={`pf-tilt ${className}`} style={style} onMouseMove={handleMove} onMouseLeave={handleLeave}>
      {children}
    </div>
  );
}
