import { ArrowRight } from "lucide-react";
import { TiltCard } from "../ui/TiltCard";

function daysBetween(from, to) {
  return Math.max(0, Math.floor((to.getTime() - from.getTime()) / 86400000));
}

export function WorkPeek({ job }) {
  const active = !job.endDate;
  return (
    <div className="pf-job pf-peek pf-peek-click">
      <div className="pf-job-header">
        <div>
          <h3 className="pf-job-role">{job.role}</h3>
          <p className="pf-job-org">{[job.org, job.location].filter(Boolean).join(" · ")}</p>
        </div>
        <span className="pf-mission-status-right">
          {job.start} — {job.end}
        </span>
      </div>
      <p className="pf-mission-status-left pf-peek-status">
        <span className={`pf-mission-dot ${active ? "" : "pf-mission-dot-done"}`} />
        <span className="pf-mission-active">{active ? "Active" : "Completed"}</span>
        <span className="pf-mission-sep">·</span>
        <span>{active ? `Day ${daysBetween(job.startDate, new Date())} in role` : `${daysBetween(job.startDate, job.endDate)} days in role`}</span>
      </p>
      <p className="pf-peek-text">{job.peek}</p>
      <a className="pf-more" href={`#/work/${job.slug}`} aria-label={`More details: ${job.role} at ${job.org}`}>
        More details <ArrowRight size={16} />
      </a>
    </div>
  );
}

export function ProjectPeek({ project }) {
  return (
    <TiltCard className="pf-project-card pf-peek pf-peek-click">
      <div className="pf-project-head">
        <h3 className="pf-project-name">{project.name}</h3>
        <p className="pf-project-tagline">{project.tagline}</p>
      </div>
      <div className="pf-project-badges">
        {project.stage && (
          <span className="pf-stage-pill">
            <span className="pf-stage-dot" />
            {project.stage}
          </span>
        )}
        {project.status && <span className="pf-project-status">{project.status}</span>}
      </div>
      <p className="pf-peek-text">{project.peek}</p>
      <div className="pf-tags pf-peek-tags">
        {project.tags.slice(0, 4).map((t) => (
          <span key={t} className="pf-tag-pill">
            {t}
          </span>
        ))}
        {project.tags.length > 4 && <span className="pf-tag-pill pf-tag-more">+{project.tags.length - 4}</span>}
      </div>
      <a className="pf-more" href={`#/projects/${project.slug}`} aria-label={`More details: ${project.name}`}>
        More details <ArrowRight size={16} />
      </a>
    </TiltCard>
  );
}
