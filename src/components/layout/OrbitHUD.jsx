import { WAYPOINTS } from "../../data/content";

export function OrbitHUD({ activeId }) {
  const wp = WAYPOINTS.find((w) => w.id === activeId);
  const label = wp ? wp.label : "About";
  const detail = wp ? wp.detail : "Mihir Bhave";
  return (
    <div className="pf-hud" aria-hidden="true">
      <span className="pf-hud-dot" />
      <span key={activeId} className="pf-hud-text">
        NOW ORBITING — {label}
        {detail ? ` (${detail})` : ""}
      </span>
    </div>
  );
}
