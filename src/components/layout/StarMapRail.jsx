import { Rocket } from "lucide-react";
import { WAYPOINTS } from "../../data/content";

export function StarMapRail({ activeId, progress, onNavigate, onHover }) {
  return (
    <div className="pf-starmap">
      <div className="pf-starmap-track" />
      {WAYPOINTS.map((wp, i) => (
        <button
          key={wp.id}
          type="button"
          className={`pf-starmap-dot ${activeId === wp.id ? "pf-starmap-dot-active" : ""}`}
          style={{ top: `${(i / (WAYPOINTS.length - 1)) * 100}%` }}
          onClick={() => onNavigate(wp.id)}
          onMouseEnter={onHover}
          aria-label={`Go to ${wp.label}`}
          title={wp.label}
        >
          <span className="pf-starmap-dot-label">{wp.label}</span>
        </button>
      ))}
      <button
        type="button"
        className="pf-starmap-ship"
        style={{ top: `${progress}%` }}
        onClick={() => onNavigate("hero")}
        onMouseEnter={onHover}
        aria-label="Back to home"
        title="Back to home"
      >
        <Rocket size={14} />
      </button>
    </div>
  );
}
