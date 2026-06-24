import { useState, useEffect } from "react";
import { Mail, Phone, Github, Linkedin, Download, ArrowDown, Volume2, VolumeX, BookOpen, Gamepad2, Map } from "lucide-react";
import { PROFILE, ABOUT, NAV_ITEMS, EXPERIENCE, PROJECTS, SKILL_GROUPS, VOLUNTEERING, EDUCATION, WAYPOINTS, SECTION_IDS } from "./data/content";
import { useSpaceAudio } from "./hooks/useSpaceAudio";
import { Reveal } from "./components/ui/Reveal";
import { TypewriterText } from "./components/ui/TypewriterText";
import { TiltCard } from "./components/ui/TiltCard";
import { RevealField } from "./components/ui/RevealField";
import { ParallaxStars } from "./components/visuals/ParallaxStars";
import { SpaceField } from "./components/visuals/SpaceField";
import { SolarSystem3D } from "./components/visuals/SolarSystem3D";
import { SystemMapModal } from "./components/layout/SystemMapModal";
import { CursorTrail } from "./components/visuals/CursorTrail";
import { BootOverlay } from "./components/visuals/BootOverlay";
import { WarpOverlay } from "./components/layout/WarpOverlay";
import { OrbitHUD } from "./components/layout/OrbitHUD";
import { SectionPlanet } from "./components/layout/SectionPlanet";
import { StarMapRail } from "./components/layout/StarMapRail";
import { MissionObjective } from "./components/layout/MissionObjective";
import "./index.css";

export default function Portfolio() {
  const [activeId, setActiveId] = useState("hero");
  const [progress, setProgress] = useState(0);
  const [warping, setWarping] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [booting, setBooting] = useState(true);
  const [bootExiting, setBootExiting] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== "undefined" && window.innerWidth < 760);

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 760);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);
  const { playBlip, playWhoosh, unlock } = useSpaceAudio(soundOn);

  useEffect(() => {
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">' +
      '<rect width="64" height="64" rx="14" fill="#030305"/>' +
      '<circle cx="32" cy="32" r="19" fill="#F2B872"/>' +
      '<circle cx="26" cy="25" r="7" fill="#FFE3B0" opacity="0.45"/>' +
      "</svg>";
    const href = "data:image/svg+xml," + encodeURIComponent(svg);
    let link = document.querySelector("link[rel~='icon']");
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    link.type = "image/svg+xml";
    link.href = href;
  }, []);

  useEffect(() => {
    const banner = "color:#F2B872;font-family:monospace;font-size:14px;";
    const body = "color:#8A93A8;font-family:monospace;font-size:12px;line-height:1.6;";
    console.log("%c✦ ·˖ ✧ ˖· ✦  you found the console  ✦ ·˖ ✧ ˖· ✦", banner);
    console.log("%cHi, I'm Mihir. Thanks for actually looking under the hood.\nCode: https://github.com/DaffyTheDuck\nSay hello: bhavemihir7.work@gmail.com", body);
  }, []);

  useEffect(() => {
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      setBooting(false);
      return;
    }
    const t1 = setTimeout(() => setBootExiting(true), 700);
    const t2 = setTimeout(() => setBooting(false), 1050);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && setActiveId(entry.target.id)),
      { rootMargin: "-40% 0px -50% 0px", threshold: 0 }
    );
    SECTION_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    let frame;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrollTop = window.scrollY || doc.scrollTop;
        const height = doc.scrollHeight - doc.clientHeight;
        setProgress(height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function navigateTo(id) {
    const reducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!reducedMotion) {
      setWarping(true);
      window.setTimeout(() => setWarping(false), 650);
    }
    playWhoosh();
    scrollToSection(id);
  }

  function toggleSound() {
    unlock();
    setSoundOn((v) => !v);
  }

  return (
    <div className="pf-root">
      <ParallaxStars />

      {booting && <BootOverlay exiting={bootExiting} />}
      <CursorTrail />
      <OrbitHUD activeId={activeId} />

      <div className="pf-progress" style={{ width: `${progress}%` }} />
      {warping && <WarpOverlay />}
      <StarMapRail activeId={activeId} progress={progress} onNavigate={navigateTo} onHover={playBlip} />

      <nav className="pf-nav">
        <button type="button" className="pf-logo" onClick={() => navigateTo("hero")} aria-label="Scroll to top">
          MB
        </button>
        <div className="pf-nav-links">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} type="button" className={`pf-nav-link ${activeId === item.id ? "pf-nav-link-active" : ""}`} onClick={() => navigateTo(item.id)} onMouseEnter={playBlip}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="pf-nav-tools">
          <button type="button" className="pf-nav-tool pf-nav-tool-map" onClick={() => setMapOpen(true)} aria-label="Open map" title="Open map">
            <Map size={16} />
          </button>
          <button type="button" className="pf-nav-tool" onClick={toggleSound} aria-label={soundOn ? "Mute sound" : "Enable sound"} title={soundOn ? "Mute sound" : "Enable sound"}>
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </nav>

      {mapOpen && <SystemMapModal activeId={activeId} onNavigate={navigateTo} onClose={() => setMapOpen(false)} />}

      <main>
        <section id="hero" className="pf-hero">
          {!isMobile && (
            <div className="pf-hero-visual">
              <SpaceField />
              <SolarSystem3D onNavigate={navigateTo} />
            </div>
          )}
          <div className="pf-hero-content">
            <span className="pf-transmission-scan" aria-hidden="true" />
            <p className="pf-transmission-label">
              <span className="pf-transmission-dot" />
              Incoming transmission
            </p>
            <p className="pf-eyebrow">Software Developer · Mumbai, India</p>
            <h1 className="pf-name">Mihir Bhave</h1>
            <p className="pf-subhead">
              <TypewriterText text="I work on compliance tooling, large-scale data migrations, and production systems, currently at Cere Labs in Mumbai." startDelay={1300} />
            </p>
            <div className="pf-hero-actions">
              <button type="button" className="pf-btn pf-btn-primary" onClick={() => navigateTo("work")}>
                See the work
              </button>
              <button type="button" className="pf-btn pf-btn-ghost" onClick={() => navigateTo("contact")}>
                Get in touch
              </button>
            </div>
          </div>
          <button type="button" className="pf-scroll-hint" onClick={() => navigateTo("work")} aria-label="Scroll down">
            <ArrowDown size={16} />
          </button>
        </section>

        <section id="about" className="pf-section">
          <Reveal className="pf-section-head">
            <div>
              <p className="pf-eyebrow">About</p>
              <h2 className="pf-h2">Not just the job title</h2>
            </div>
            <SectionPlanet colors={["#FFE3B0", "#F2B872", "#7A4A1A"]} glow texStyle="glow" active={activeId === "about"} />
          </Reveal>
          <Reveal className="pf-about-grid">
            <div className="pf-about-text">
              <p className="pf-about-intro">{ABOUT.intro}</p>
              <p className="pf-about-space">{ABOUT.spaceNote}</p>
            </div>
            <div className="pf-now-cards">
              <TiltCard className="pf-now-card">
                <BookOpen size={18} />
                <p className="pf-now-card-label">Currently Reading..</p>
                <p className="pf-now-card-value">{ABOUT.reading.join(", ")}</p>
              </TiltCard>
              <TiltCard className="pf-now-card">
                <Gamepad2 size={18} />
                <p className="pf-now-card-label">Currently Playing..</p>
                <p className="pf-now-card-value">{ABOUT.playing}</p>
              </TiltCard>
            </div>
          </Reveal>
        </section>

        <section id="work" className="pf-section">
          <Reveal className="pf-section-head">
            <div>
              <p className="pf-eyebrow">Experience</p>
              <h2 className="pf-h2">Where the work happens</h2>
            </div>
            <SectionPlanet colors={WAYPOINTS[1].colors} ring={WAYPOINTS[1].ring} texStyle="cratered" active={activeId === "work"} />
          </Reveal>
          <Reveal className="pf-job">
            <div className="pf-job-header">
              <div>
                <h3 className="pf-job-role">{EXPERIENCE.role}</h3>
                <p className="pf-job-org">
                  {EXPERIENCE.org} · {EXPERIENCE.location}
                </p>
              </div>
            </div>

            <div className="pf-mission-status">
              <span className="pf-mission-status-left">
                <span className="pf-mission-dot" />
                <span className="pf-mission-active">Active</span>
                <span className="pf-mission-sep">·</span>
                <span>
                  Day {Math.max(0, Math.floor((Date.now() - new Date(2025, 6, 1).getTime()) / 86400000))} in role
                </span>
              </span>
              <span className="pf-mission-status-right">
                {EXPERIENCE.start} — {EXPERIENCE.end}
              </span>
            </div>

            <div className="pf-mission-stats">
              {EXPERIENCE.overallStats.map((s) => (
                <div className="pf-mission-stat" key={s.label}>
                  <span className={`pf-mission-stat-num ${s.compact ? "pf-mission-stat-num-compact" : ""}`}>{s.num}</span>
                  <span className="pf-mission-stat-label">{s.label}</span>
                </div>
              ))}
            </div>

            <div className="pf-mission-list">
              {EXPERIENCE.highlights.map((h) => (
                <MissionObjective
                  key={h.title}
                  title={h.title}
                  codename={h.codename}
                  detail={h.detail}
                  stats={h.stats}
                  techStack={h.techStack}
                />
              ))}
            </div>

            <p className="pf-work-note">
              <span className="pf-work-note-tag">Log:</span> {EXPERIENCE.note}
            </p>
          </Reveal>
        </section>

        <section id="projects" className="pf-section">
          <Reveal className="pf-section-head">
            <div>
              <p className="pf-eyebrow">Projects</p>
              <h2 className="pf-h2">Something built, not just listed</h2>
            </div>
            <SectionPlanet colors={WAYPOINTS[2].colors} ring={WAYPOINTS[2].ring} texStyle="bands" active={activeId === "projects"} />
          </Reveal>
          {PROJECTS.map((p, i) => (
            <Reveal key={p.name} delay={i * 80}>
              <TiltCard className="pf-project-card">
                <div className="pf-project-head">
                  <h3 className="pf-project-name">{p.name}</h3>
                  <p className="pf-project-tagline">{p.tagline}</p>
                </div>
                <p className="pf-project-desc">{p.description}</p>
                <ul className="pf-bullets">
                  {p.bullets.map((b, bi) => (
                    <li key={bi}>{b}</li>
                  ))}
                </ul>
                <div className="pf-tags">
                  {p.tags.map((t) => (
                    <span key={t} className="pf-tag-pill">
                      {t}
                    </span>
                  ))}
                </div>
              </TiltCard>
            </Reveal>
          ))}
        </section>

        <section id="skills" className="pf-section">
          <Reveal className="pf-section-head">
            <div>
              <p className="pf-eyebrow">Skills</p>
              <h2 className="pf-h2">Tools of the trade</h2>
            </div>
            <SectionPlanet colors={WAYPOINTS[3].colors} ring={WAYPOINTS[3].ring} moons={WAYPOINTS[3].moons || 0} texStyle="swirl" active={activeId === "skills"} />
          </Reveal>
          <div className="pf-skill-groups">
            {SKILL_GROUPS.map((group, gi) => (
              <Reveal key={group.label} delay={gi * 90} className="pf-skill-group">
                <p className="pf-skill-label">{group.label}</p>
                <div className="pf-tags">
                  {group.items.map((item) => (
                    <span key={item} className="pf-tag-pill">
                      {item}
                    </span>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="volunteering" className="pf-section">
          <Reveal className="pf-section-head">
            <div>
              <p className="pf-eyebrow">Volunteering</p>
              <h2 className="pf-h2">Outside the day job</h2>
            </div>
            <SectionPlanet colors={WAYPOINTS[4].colors} ring={WAYPOINTS[4].ring} moons={WAYPOINTS[4].moons || 0} texStyle="cratered" active={activeId === "volunteering"} />
          </Reveal>
          <div className="pf-timeline">
            {VOLUNTEERING.map((v, i) => (
              <Reveal key={v.org} delay={i * 80} className="pf-timeline-row">
                <span className="pf-tag-mono pf-timeline-date">{v.date}</span>
                <div>
                  <p className="pf-timeline-title">
                    {v.role} · {v.org}
                  </p>
                  <p className="pf-timeline-desc">{v.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="education" className="pf-section">
          <Reveal className="pf-section-head">
            <div>
              <p className="pf-eyebrow">Education</p>
              <h2 className="pf-h2">How it started</h2>
            </div>
            <SectionPlanet colors={WAYPOINTS[5].colors} ring={WAYPOINTS[5].ring} texStyle="bands" active={activeId === "education"} />
          </Reveal>
          <div className="pf-timeline">
            {EDUCATION.map((ed, i) => (
              <Reveal key={ed.school} delay={i * 80} className="pf-timeline-row">
                <span className="pf-tag-mono pf-timeline-date">{ed.date}</span>
                <div>
                  <p className="pf-timeline-title">{ed.school}</p>
                  <p className="pf-timeline-desc">
                    {ed.degree}
                    {ed.detail ? ` · ${ed.detail}` : ""}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="contact" className="pf-section pf-contact-section">
          <Reveal className="pf-section-head">
            <div>
              <p className="pf-eyebrow">Contact</p>
              <h2 className="pf-h2">Say hello</h2>
              <p className="pf-contact-sub">Reach out directly, or grab the resume.</p>
            </div>
            <SectionPlanet colors={WAYPOINTS[6].colors} ring={WAYPOINTS[6].ring} glow={WAYPOINTS[6].glow} pulse={WAYPOINTS[6].pulse} texStyle="glow" active={activeId === "contact"} />
          </Reveal>
          <Reveal className="pf-contact-grid">
            <RevealField icon={<Mail size={16} />} label="Email" value={PROFILE.email} href={`mailto:${PROFILE.email}`} />
            <RevealField icon={<Phone size={16} />} label="Phone" value={PROFILE.phone} href={`tel:${PROFILE.phone.replace(/\s+/g, "")}`} />
            <a className="pf-social-link" href={PROFILE.linkedin} target="_blank" rel="noopener noreferrer">
              <Linkedin size={16} /> LinkedIn
            </a>
            <a className="pf-social-link" href={PROFILE.github} target="_blank" rel="noopener noreferrer">
              <Github size={16} /> GitHub
            </a>
            <a className="pf-btn pf-btn-ghost pf-resume-btn" href="/resume.pdf" download="Mihir_Bhave_Resume.pdf">
              <Download size={16} /> Download resume
            </a>
          </Reveal>
        </section>
      </main>

      <footer className="pf-footer">
        <p>Built by Mihir Bhave · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}