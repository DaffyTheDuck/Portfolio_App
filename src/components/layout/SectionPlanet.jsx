import { useMemo } from "react";
import { createPlanetSwatchURL } from "../../utils/planetTextures";

export function SectionPlanet({ colors, ring, glow, pulse, moons = 0, size = 64, texStyle = "cratered", active = true }) {
  const swatch = useMemo(() => createPlanetSwatchURL(colors[0], colors[2], texStyle), [colors, texStyle]);
  return (
    <div className={`pf-section-planet ${active ? "" : "pf-section-planet-unfocused"}`} style={{ width: size, height: size }} aria-hidden="true">
      {pulse && <span className="pf-section-planet-pulse" />}
      {ring && <span className="pf-section-planet-ring" />}
      <span
        className={`pf-section-planet-sphere ${glow ? "pf-section-planet-glow" : ""}`}
        style={{
          backgroundImage: `url(${swatch}), radial-gradient(circle at 32% 28%, ${colors[0]}, ${colors[1]} 45%, ${colors[2]} 100%)`,
          backgroundSize: "cover, cover",
        }}
      />
      {Array.from({ length: moons }).map((_, i) => (
        <span key={i} className={`pf-section-orbit pf-section-orbit-${i + 1}`}>
          <span className="pf-section-moon" />
        </span>
      ))}
    </div>
  );
}
