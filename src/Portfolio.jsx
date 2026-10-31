import { useState, useEffect, useRef } from "react";
import { Mail, Github, Linkedin, Download, ArrowDown, ArrowUp, ArrowRight, Volume2, VolumeX, BookOpen, Gamepad2, Map, Sun, Moon, Zap, ZapOff } from "lucide-react";
import { PROFILE, AVAILABILITY, HERO_STATS, ABOUT, NAV_ITEMS, EXPERIENCES, PROJECTS, SKILL_GROUPS, VOLUNTEERING, EDUCATION, WAYPOINTS, SECTION_IDS } from "./data/content";
import { useSpaceAudio } from "./hooks/useSpaceAudio";
import { Reveal } from "./components/ui/Reveal";
import { TypewriterText } from "./components/ui/TypewriterText";
import { TiltCard } from "./components/ui/TiltCard";
import { RevealField } from "./components/ui/RevealField";
import { SystemMapModal } from "./components/layout/SystemMapModal";
import { CursorTrail } from "./components/visuals/CursorTrail";
import { BootOverlay } from "./components/visuals/BootOverlay";
import { WarpOverlay } from "./components/layout/WarpOverlay";
import { OrbitHUD } from "./components/layout/OrbitHUD";
import { StarMapRail } from "./components/layout/StarMapRail";
import { DetailPage } from "./components/pages/DetailPage";
import { NotFound } from "./components/pages/NotFound";
import { CountUp } from "./components/ui/CountUp";
import { Toast } from "./components/ui/Toast";
import { usePrefs, hasSeenIntro, markIntroSeen } from "./hooks/usePrefs";
import { WorkPeek, ProjectPeek } from "./components/pages/Peek";
import { useHashRoute } from "./hooks/useHashRoute";
import "./index.css";

const DEFAULT_TITLE = document.title;

export default function Portfolio() {
  const [activeId, setActiveId] = useState("hero");
  const [progress, setProgress] = useState(0);
  const progressBar = useRef(null);
  const [warping, setWarping] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const seenBefore = useRef(hasSeenIntro()).current;
  const { theme, toggleTheme, effectsOff, toggleEffects, reduce } = usePrefs();
  const [booting, setBooting] = useState(!seenBefore);
  const [navHidden, setNavHidden] = useState(false);
  const [showTop, setShowTop] = useState(false);
  const [toast, setToast] = useState(null);
  const [bootExiting, setBootExiting] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);

  const [Cosmos, setCosmos] = useState(null);
  const { playBlip, playWhoosh, unlock } = useSpaceAudio(soundOn);

  const toastTimer = useRef(null);
  function showToast(message) {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 2000);
  }

  // The 3D scene is a separate chunk, loaded after first paint, and skipped on data-saver connections
  // and when the visitor turns effects off.
  useEffect(() => {
    const conn = navigator.connection;
    if (effectsOff || (conn && conn.saveData)) return;
    let cancelled = false;
    const load = () =>
      import("./components/visuals/CosmosBackground").then((m) => {
        if (!cancelled) setCosmos(() => m.CosmosBackground);
      });
    const useIdle = "requestIdleCallback" in window;
    const id = useIdle ? window.requestIdleCallback(load, { timeout: 1500 }) : window.setTimeout(load, 300);
    return () => {
      cancelled = true;
      if (useIdle) window.cancelIdleCallback(id);
      else window.clearTimeout(id);
    };
  }, [effectsOff]);

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
    if (reduce || seenBefore) {
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
    let lastY = window.scrollY;
    function onScroll() {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const doc = document.documentElement;
        const scrollTop = window.scrollY || doc.scrollTop;
        const height = doc.scrollHeight - doc.clientHeight;
        const pct = height > 0 ? Math.min(100, (scrollTop / height) * 100) : 0;
        // the bar is moved directly; React state (the star-map ship) only changes in whole percent steps
        if (progressBar.current) progressBar.current.style.width = `${pct}%`;
        setProgress(Math.round(pct));
        const delta = scrollTop - lastY;
        if (Math.abs(delta) > 6) {
          setNavHidden(scrollTop > 140 && delta > 0);
          lastY = scrollTop;
        }
        setShowTop(scrollTop > 900);
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  const { route: rawRoute, savedScroll, goHome } = useHashRoute();
  const detailItem = rawRoute ? (rawRoute.section === "work" ? EXPERIENCES : PROJECTS).find((x) => x.slug === rawRoute.slug) : null;
  const route = detailItem ? rawRoute : null;
  const notFound = !!rawRoute && !detailItem;
  const pendingScroll = useRef(null);
  const firstRoute = useRef(true);

  useEffect(() => {
    if (firstRoute.current) {
      firstRoute.current = false;
      if (route) setActiveId(route.section);
      return;
    }
    if (route) {
      setActiveId(route.section);
      window.scrollTo(0, 0);
    } else if (pendingScroll.current) {
      const id = pendingScroll.current;
      pendingScroll.current = null;
      window.requestAnimationFrame(() => scrollToSection(id));
    } else {
      window.requestAnimationFrame(() => window.scrollTo(0, savedScroll.current));
    }
  }, [route]);

  useEffect(() => {
    if (!route) {
      document.title = DEFAULT_TITLE;
      return;
    }
    document.title = `${route.section === "work" ? detailItem.role : detailItem.name} | Mihir Bhave`;
  }, [route, detailItem]);

  function scrollToSection(id) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  }

  function navigateTo(id) {
    if (!reduce) {
      setWarping(true);
      window.setTimeout(() => setWarping(false), 650);
    }
    playWhoosh();
    if (route) {
      pendingScroll.current = id;
      goHome();
      return;
    }
    scrollToSection(id);
  }

  function toggleSound() {
    unlock();
    setSoundOn((v) => !v);
  }

  return (
    <div className="pf-root" data-active={activeId} data-theme={theme} data-reduce={reduce ? "true" : "false"}>
      <a className="pf-skip" href="#main">
        Skip to content
      </a>
      {Cosmos && !effectsOff && <Cosmos theme={theme} hold={route ? SECTION_IDS.indexOf(route.section) : null} />}

      {booting && <BootOverlay exiting={bootExiting} />}
      {!reduce && <CursorTrail />}
      <OrbitHUD activeId={activeId} />

      <div className="pf-progress" ref={progressBar} />
      {warping && !reduce && <WarpOverlay />}
      <StarMapRail activeId={activeId} progress={progress} onNavigate={navigateTo} onHover={playBlip} />

      <nav className={`pf-nav ${navHidden ? "pf-nav-hidden" : ""}`} aria-label="Primary">
        <button type="button" className="pf-logo" onClick={() => navigateTo("hero")} aria-label="Scroll to top">
          MB
        </button>
        <div className="pf-nav-links">
          {NAV_ITEMS.map((item) => (
            <button key={item.id} type="button" aria-current={activeId === item.id ? "true" : undefined} className={`pf-nav-link ${activeId === item.id ? "pf-nav-link-active" : ""}`} onClick={() => navigateTo(item.id)} onMouseEnter={playBlip}>
              {item.label}
            </button>
          ))}
        </div>
        <div className="pf-nav-tools">
          <button type="button" className="pf-nav-tool pf-nav-tool-map" onClick={() => setMapOpen(true)} aria-label="Open map" title="Open map">
            <Map size={16} />
          </button>
          <button type="button" className="pf-nav-tool" onClick={toggleTheme} aria-label={theme === "light" ? "Switch to dark theme" : "Switch to light theme"} title={theme === "light" ? "Dark theme" : "Light theme"}>
            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
          </button>
          <button type="button" className="pf-nav-tool" onClick={toggleEffects} aria-pressed={effectsOff} aria-label={effectsOff ? "Turn effects on" : "Reduce effects"} title={effectsOff ? "Effects off (click to turn on)" : "Reduce effects"}>
            {effectsOff ? <ZapOff size={16} /> : <Zap size={16} />}
          </button>
          <button type="button" className="pf-nav-tool" onClick={toggleSound} aria-label={soundOn ? "Mute sound" : "Enable sound"} title={soundOn ? "Mute sound" : "Enable sound"}>
            {soundOn ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>
      </nav>

      {mapOpen && <SystemMapModal activeId={activeId} onNavigate={navigateTo} onClose={() => setMapOpen(false)} />}

      <main id="main" tabIndex={-1} hidden={!!rawRoute}>
        <section id="hero" className="pf-hero">
          <div className="pf-hero-content">
            <span className="pf-transmission-scan" aria-hidden="true" />
            <p className="pf-transmission-label">
              <span className="pf-transmission-dot" />
              Incoming transmission
            </p>
            <p className="pf-eyebrow">{PROFILE.title} · {PROFILE.location}</p>
            <h1 className="pf-name">Mihir Bhave</h1>
            <p className="pf-subhead">
              <TypewriterText instant={reduce || seenBefore} onDone={markIntroSeen} text="I build and run production systems, with a background in compliance tooling and large-scale data migrations. Currently at Trinamix, working on Documantra." startDelay={1300} />
            </p>
            <ul className="pf-hero-stats" aria-label="Highlights">
              {HERO_STATS.map((st) => (
                <li key={st.label}>
                  <span className={`pf-hero-stat-num ${st.compact ? "pf-hero-stat-num-compact" : ""}`}>
                    <CountUp value={st.num} instant={reduce} />
                  </span>
                  <span className="pf-hero-stat-label">{st.label}</span>
                </li>
              ))}
            </ul>
            <div className="pf-hero-actions">
              <button type="button" className="pf-btn pf-btn-primary" onClick={() => navigateTo("work")}>
                See the work
              </button>
              <button type="button" className="pf-btn pf-btn-ghost" onClick={() => navigateTo("contact")}>
                Get in touch
              </button>
              <a className="pf-btn pf-btn-ghost" href="/resume.pdf" download="Mihir_Bhave_Resume.pdf">
                <Download size={16} /> Resume
              </a>
            </div>
            <a
              className="pf-availability"
              href="#contact"
              onClick={(e) => {
                e.preventDefault();
                navigateTo("contact");
              }}
            >
              <span className="pf-availability-dot" />
              {AVAILABILITY}
              <ArrowRight size={14} />
            </a>
          </div>
          <button type="button" className="pf-scroll-hint" onClick={() => navigateTo("work")} aria-label="Scroll down">
            <ArrowDown size={16} />
          </button>
        </section>

        <section id="about" aria-labelledby="about-title" data-sec="about" className="pf-section pf-side-left">
          <Reveal className="pf-section-head">
            <div>
              <p className="pf-eyebrow">About</p>
              <h2 className="pf-h2" id="about-title">Not just the job title</h2>
            </div>
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

        <section id="work" aria-labelledby="work-title" data-sec="work" className="pf-section pf-side-right">
          <Reveal className="pf-section-head">
            <div>
              <p className="pf-eyebrow">Experience</p>
              <h2 className="pf-h2" id="work-title">Where the work happens</h2>
            </div>
          </Reveal>
          {EXPERIENCES.map((job, i) => (
            <Reveal key={job.slug} delay={i * 80}>
              <WorkPeek job={job} />
            </Reveal>
          ))}
        </section>

        <section id="projects" aria-labelledby="projects-title" data-sec="projects" className="pf-section pf-side-left">
          <Reveal className="pf-section-head">
            <div>
              <p className="pf-eyebrow">Projects</p>
              <h2 className="pf-h2" id="projects-title">Something built, not just listed</h2>
            </div>
          </Reveal>
          {PROJECTS.map((p, i) => (
            <Reveal key={p.slug} delay={i * 80}>
              <ProjectPeek project={p} />
            </Reveal>
          ))}
        </section>

        <section id="skills" aria-labelledby="skills-title" data-sec="skills" className="pf-section pf-side-right">
          <Reveal className="pf-section-head">
            <div>
              <p className="pf-eyebrow">Skills</p>
              <h2 className="pf-h2" id="skills-title">Tools of the trade</h2>
            </div>
          </Reveal>
          <Reveal className="pf-skill-board">
            {SKILL_GROUPS.map((group) => (
              <div key={group.label} className="pf-skill-row">
                <p className="pf-skill-label">{group.label}</p>
                <div className="pf-tags">
                  {group.items.map((item) => (
                    <span key={item} className="pf-tag-pill">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </Reveal>
        </section>

        <section id="volunteering" aria-labelledby="volunteering-title" data-sec="volunteering" className="pf-section pf-side-left">
          <Reveal className="pf-section-head">
            <div>
              <p className="pf-eyebrow">Volunteering</p>
              <h2 className="pf-h2" id="volunteering-title">Outside the day job</h2>
            </div>
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

        <section id="education" aria-labelledby="education-title" data-sec="education" className="pf-section pf-side-right">
          <Reveal className="pf-section-head">
            <div>
              <p className="pf-eyebrow">Education</p>
              <h2 className="pf-h2" id="education-title">How it started</h2>
            </div>
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

        <section id="contact" aria-labelledby="contact-title" data-sec="contact" className="pf-section pf-side-left pf-contact-section">
          <Reveal className="pf-section-head">
            <div>
              <p className="pf-eyebrow">Contact</p>
              <h2 className="pf-h2" id="contact-title">Say hello</h2>
              <p className="pf-contact-sub">Reach out directly, or grab the resume.</p>
            </div>
          </Reveal>
          <Reveal className="pf-contact-grid">
            <RevealField onCopied={showToast} icon={<Mail size={16} />} label="Email" value={PROFILE.email} href={`mailto:${PROFILE.email}`} />
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

      {route && <DetailPage section={route.section} item={detailItem} list={route.section === "work" ? EXPERIENCES : PROJECTS} onBack={goHome} onNavigate={navigateTo} />}
      {notFound && <NotFound onBack={goHome} />}

      <button type="button" className={`pf-totop ${showTop ? "pf-totop-show" : ""}`} onClick={() => window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" })} aria-label="Back to top" tabIndex={showTop ? 0 : -1}>
        <ArrowUp size={18} />
      </button>
      <Toast message={toast} />

      <footer className="pf-footer">
        <p>Built by Mihir Bhave · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}