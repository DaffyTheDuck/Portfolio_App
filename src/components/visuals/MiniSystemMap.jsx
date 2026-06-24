import { WAYPOINTS } from "../../data/content";

/* ---------------------------------------------------------------
   A flat, lightweight stand-in for the 3D solar system — same
   waypoints, same navigation, same orbital motion and moons, just
   plain SVG instead of WebGL. Used inside the map modal so opening
   it never has to spin up a 3D scene.
---------------------------------------------------------------- */

export function MiniSystemMap({ activeId, onNavigate }) {
  const planets = WAYPOINTS.slice(1);
  const cx = 150;
  const cy = 150;

  return (
    <svg viewBox="0 0 300 300" className="pf-minimap" role="img" aria-label="Site map">
      {planets.map((wp, i) => (
        <circle key={wp.id} cx={cx} cy={cy} r={34 + i * 19} className="pf-minimap-orbit" />
      ))}

      <g
        className="pf-minimap-sun"
        onClick={() => onNavigate("hero")}
        role="button"
        tabIndex={0}
        aria-label="Home"
        onKeyDown={(e) => e.key === "Enter" && onNavigate("hero")}
      >
        <circle cx={cx} cy={cy} r={26} fill="#F2B872" />
        <circle cx={cx} cy={cy} r={36} fill="#F2B872" opacity="0.18" />
      </g>

      {planets.map((wp, i) => {
        const r = 34 + i * 19;
        const startAngle = (i / planets.length) * 360 - 90;
        const isActive = activeId === wp.id;
        return (
          <g
            key={wp.id}
            className={`pf-minimap-orbit-group pf-minimap-orbit-group-${i}`}
            style={{ transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${startAngle}deg)` }}
          >
            <g transform={`translate(${cx + r}, ${cy})`}>
              <g
                onClick={() => onNavigate(wp.id)}
                role="button"
                tabIndex={0}
                aria-label={wp.label}
                onKeyDown={(e) => e.key === "Enter" && onNavigate(wp.id)}
                className={`pf-minimap-planet ${isActive ? "pf-minimap-planet-active" : ""}`}
              >
                {isActive && <circle r={11} fill="none" className="pf-minimap-planet-ring" />}
                <circle r={7} fill={wp.colors[1]} />
              </g>

              {wp.moons > 0 &&
                Array.from({ length: wp.moons }).map((_, mi) => {
                  const moonStart = (mi / wp.moons) * 360;
                  return (
                    <g
                      key={mi}
                      className={`pf-minimap-moon-group pf-minimap-moon-group-${mi}`}
                      style={{ transformOrigin: "0px 0px", transform: `rotate(${moonStart}deg)` }}
                    >
                      <circle cx={13} cy={0} r={1.8} fill="#EAEDF5" opacity="0.85" />
                    </g>
                  );
                })}
            </g>
          </g>
        );
      })}
    </svg>
  );
}