import { ArrowLeft, ArrowRight, ChevronRight } from "lucide-react";
import { Reveal } from "../ui/Reveal";
import { MissionObjective } from "../layout/MissionObjective";

function daysBetween(from, to) {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 86400000));
}

function WorkBody({ job }) {
  const active = !job.endDate;
  return (
    <>
      <div className="pf-mission-status">
        <span className="pf-mission-status-left">
          <span className={`pf-mission-dot ${active ? "" : "pf-mission-dot-done"}`} />
          <span className="pf-mission-active">{active ? "Active" : "Completed"}</span>
          <span className="pf-mission-sep">·</span>
          <span>{active ? `Day ${daysBetween(job.startDate, new Date())} in role` : `${daysBetween(job.startDate, job.endDate)} days in role`}</span>
        </span>
        <span className="pf-mission-status-right">
          {job.start} — {job.end}
        </span>
      </div>

      {job.summary && <p className="pf-job-summary">{job.summary}</p>}

      {job.overallStats.length > 0 && (
        <div className="pf-mission-stats">
          {job.overallStats.map((s) => (
            <div className="pf-mission-stat" key={s.label}>
              <span className={`pf-mission-stat-num ${s.compact ? "pf-mission-stat-num-compact" : ""}`}>{s.num}</span>
              <span className="pf-mission-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      )}

      {job.highlights.length > 0 && (
        <div className="pf-mission-list">
          {job.highlights.map((h) => (
            <MissionObjective key={h.title} title={h.title} codename={h.codename} detail={h.detail} stats={h.stats} techStack={h.techStack} />
          ))}
        </div>
      )}

      {job.note && (
        <p className="pf-work-note">
          <span className="pf-work-note-tag">Log:</span> {job.note}
        </p>
      )}
    </>
  );
}

function ProjectBody({ project }) {
  return (
    <>
      <div className="pf-project-badges">
        {project.stage && (
          <span className="pf-stage-pill">
            <span className="pf-stage-dot" />
            {project.stage}
          </span>
        )}
        {project.status && <span className="pf-project-status">{project.status}</span>}
      </div>
      <p className="pf-project-desc">{project.description}</p>
      <ul className="pf-bullets">
        {project.bullets.map((b, i) => (
          <li key={i}>{b}</li>
        ))}
      </ul>
      <div className="pf-tags">
        {project.tags.map((t) => (
          <span key={t} className="pf-tag-pill">
            {t}
          </span>
        ))}
      </div>
    </>
  );
}

function PagerLink({ section, item, dir }) {
  const label = section === "work" ? item.role : item.name;
  const sub = section === "work" ? item.org : item.tagline;
  // replace, so Back still returns to the home page rather than stepping through every detail page
  const go = (e) => {
    e.preventDefault();
    window.location.replace(`#/${section}/${item.slug}`);
  };
  return (
    <a className={`pf-pager-link pf-pager-${dir}`} href={`#/${section}/${item.slug}`} onClick={go}>
      <span className="pf-pager-dir">
        {dir === "prev" && <ArrowLeft size={14} />}
        {dir === "prev" ? "Previous" : "Next"}
        {dir === "next" && <ArrowRight size={14} />}
      </span>
      <span className="pf-pager-title">{label}</span>
      <span className="pf-pager-sub">{sub}</span>
    </a>
  );
}

export function DetailPage({ section, item, list, onBack, onNavigate }) {
  const isWork = section === "work";
  const index = list.findIndex((x) => x.slug === item.slug);
  const prev = index > 0 ? list[index - 1] : null;
  const next = index < list.length - 1 ? list[index + 1] : null;
  const crumbTitle = isWork ? item.role : item.name;
  return (
    <main id="main" tabIndex={-1} className="pf-detail">
      <section data-sec={section} className={`pf-section ${isWork ? "pf-side-right" : "pf-side-left"}`} aria-labelledby="detail-title">
        <div className="pf-detail-top">
          <button type="button" className="pf-back" onClick={onBack}>
            <ArrowLeft size={16} /> Back
          </button>
          <nav className="pf-crumbs" aria-label="Breadcrumb">
            <ol>
              <li>
                <button type="button" onClick={() => onNavigate("hero")}>
                  Home
                </button>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} />
              </li>
              <li>
                <button type="button" onClick={() => onNavigate(section)}>
                  {isWork ? "Work" : "Projects"}
                </button>
              </li>
              <li aria-hidden="true">
                <ChevronRight size={14} />
              </li>
              <li aria-current="page">{crumbTitle}</li>
            </ol>
          </nav>
        </div>
        <Reveal className="pf-section-head">
          <div>
            <p className="pf-eyebrow">{isWork ? "Experience" : "Project"}</p>
            <h1 className="pf-h2 pf-detail-title" id="detail-title">
              {crumbTitle}
            </h1>
            <p className="pf-detail-sub">{isWork ? [item.org, item.location].filter(Boolean).join(" · ") : item.tagline}</p>
          </div>
        </Reveal>
        <Reveal className={isWork ? "pf-job" : "pf-project-card"}>{isWork ? <WorkBody job={item} /> : <ProjectBody project={item} />}</Reveal>
        {(prev || next) && (
          <nav className="pf-pager" aria-label={isWork ? "Other roles" : "Other projects"}>
            {prev ? <PagerLink section={section} item={prev} dir="prev" /> : <span />}
            {next ? <PagerLink section={section} item={next} dir="next" /> : <span />}
          </nav>
        )}
      </section>
    </main>
  );
}
