export function MissionObjective({ title, codename, detail, stats, techStack }) {
  return (
    <div className="pf-mission-card">
      <div className="pf-mission-head">
        <span className="pf-mission-blip" />
        <span className="pf-mission-title">
          {title}
          {codename && <span className="pf-mission-codename">{codename}</span>}
        </span>
      </div>
      <div className="pf-mission-body pf-mission-body-open">
        <div className="pf-mission-detail">
          <p>{detail}</p>
          {stats && stats.length > 0 && (
            <div className="pf-mission-project-stats">
              {stats.map((s) => (
                <div className="pf-mission-stat" key={s.label}>
                  <span className={`pf-mission-stat-num ${s.compact ? "pf-mission-stat-num-compact" : ""}`}>{s.num}</span>
                  <span className="pf-mission-stat-label">{s.label}</span>
                </div>
              ))}
            </div>
          )}
          {techStack && techStack.length > 0 && (
            <div className="pf-mission-tech">
              <span className="pf-mission-tech-label">Stack</span>
              <div className="pf-mission-tech-tags">
                {techStack.map((t) => (
                  <span key={t} className="pf-tag-pill pf-mission-tech-tag">
                    {t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
