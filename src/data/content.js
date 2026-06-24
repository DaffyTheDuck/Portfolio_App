export const PROFILE = {
  name: "Mihir Bhave",
  title: "Software Developer",
  location: "Mumbai, India",
  email: "bhavemihir7.work@gmail.com",
  phone: "+91 7021381113",
  linkedin: "https://www.linkedin.com/in/daffyduck/",
  github: "https://github.com/DaffyTheDuck",
};


export const ABOUT = {
  intro:
    "I'm Mihir, a software developer based in Mumbai. I currently work at Cere Labs, mostly on compliance tooling and a couple of large data migrations.",
  spaceNote: "The space theme is here because I like space. There's no bigger reason than that.",
  reading: ["Tharoorosaurus by Shashi Tharoor", "The Origin of Species by Charles Darwin"],
  playing:
    "Nothing at the moment. I've played most of the Resident Evil and Outlast games, the Call of Duty series up through WWII (that's where my PC stopped keeping up), and No Man's Sky.",
};


export const NAV_ITEMS = [
  { id: "about", label: "About" },
  { id: "work", label: "Work" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
  { id: "education", label: "Education" },
  { id: "contact", label: "Contact" },
];


export const EXPERIENCE = {
  role: "Software Developer",
  org: "Cere Labs",
  location: "Mumbai, India",
  start: "Jul 2025",
  end: "Present",
  overallStats: [
    { num: "5", label: "Engineers led" },
    { num: "4+", label: "Deployments shipped" },
    { num: "3", label: "Client training sessions" },
  ],
  highlights: [
    {
      title: "FDA eCTD Dossier Automation",
      detail:
        "I led a team of 5 on the pipeline that automates FDA eCTD dossier generation. Each dossier needs 100+ documents, most of which used to be done by hand. Part of this also involved restructuring the regulatory datasets that fed into it, since the raw data wasn't usable as is. It's currently in UAT, being tested against 15+ dossier types, more than the client typically produces in a year. One section that used to take about a week to compile now takes a couple of hours.",
      stats: [
        { num: "100+", label: "Docs / dossier" },
        { num: "Week → hours", label: "Section compile time", compact: true },
      ],
      techStack: ["Python", "React", "MySQL", "LLM", "OCR", "FastAPI"],
    },
    {
      title: "SAP-to-SAP & SQL-to-SQL Migration",
      codename: "Simple Data Sync",
      detail:
        "Worked on a SAP-to-SAP and SQL-to-SQL migration covering 50,000 tables. It had stalled after the original project owner left. I took it over and finished it.",
      stats: [{ num: "50K", label: "Tables migrated" }],
      techStack: ["Python", "React", "MySQL", "SAP HANA", "FastAPI"],
    },
  ],
  note: "There was also the regular day-to-day work: production releases on Docker, client calls, and being part of a 12-person Agile team (reviews, debugging, system design).",
};


export const PROJECTS = [
  {
    name: "ReguLens",
    tagline: "AI Compliance Copilot",
    description:
      "Checks whether internal policy lines up with regulatory guidelines, including RBI's, and flags gaps automatically. Built with Python and Streamlit.",
    bullets: [
      'Matching is done in two steps: a semantic search first, then a cross-encoder reranker that checks the language more closely, since it needs to tell a "must" from a "may".',
      "When a gap is found, Gemini 1.5 Flash drafts a remediation plan and summary, so there's a starting point instead of a blank page.",
    ],
    tags: ["Python", "Streamlit", "Vector Search", "Cross-Encoder", "Gemini 1.5 Flash"],
  },
];


export const SKILL_GROUPS = [
  { label: "Languages & Frameworks", items: ["Python", "SQL", "FastAPI", "React", "Agile"] },
  { label: "Technologies", items: ["Vector Databases", "Docker", "Git", "Linux", "RabbitMQ", "LLMs"] },
  { label: "Practices", items: ["Debugging", "Code Reviews", "Testing"] },
];


export const VOLUNTEERING = [
  {
    role: "Mentor",
    org: "Nakshatra (Unstop national hackathon)",
    date: "Apr 2026",
    desc: "Mentored 20 teams on their AI/ML and LLM projects.",
  },
  {
    role: "Contributor",
    org: "OpenWISP",
    date: "Dec 2019 – Jan 2020",
    desc: "Migrated OpenWISP-Users and OpenWISP-IPAM off Python 2 and Django 2. Most of the work was in dependency conflicts and broken tests, not the migration itself.",
  },
];


export const EDUCATION = [
  {
    school: "A.P. Shah Institute of Technology",
    degree: "B.E., Computer Science & Engineering (AI & ML)",
    date: "Dec 2021 – Jun 2025",
    detail: "CGPA 7.75 / 10.0",
  },
  { school: "Royal Junior College", degree: "HSC", date: "Jun 2021", detail: null },
  { school: "I.E.S Chandrakant Patkar Vidyalaya", degree: "SSC", date: "Jun 2019", detail: null },
];


export const SECTION_IDS = ["hero", "about", "work", "projects", "skills", "volunteering", "education", "contact"];

export const WAYPOINTS = [
  { id: "hero", label: "Home", detail: "Mihir Bhave", colors: ["#FFE3B0", "#F2B872", "#7A4A1A"], ring: true },
  { id: "work", label: "Work", detail: "Cere Labs", colors: ["#FFD8B8", "#D9763F", "#7A3A1E"], ring: false },
  { id: "projects", label: "Projects", detail: "ReguLens", colors: ["#CFE8FF", "#5B8FD9", "#2E4E80"], ring: true },
  { id: "skills", label: "Skills", detail: "Tools of the trade", colors: ["#EAD9FF", "#9A7AFF", "#5C3FA0"], ring: false, moons: 3 },
  { id: "volunteering", label: "Volunteering", detail: "Outside the day job", colors: ["#FFF3D6", "#E8B95E", "#9C7726"], ring: false, moons: 1 },
  { id: "education", label: "Education", detail: "How it started", colors: ["#E3F3E8", "#7FBE9E", "#3E7A5C"], ring: true },
  { id: "contact", label: "Contact", detail: "Say hello", colors: ["#FFFFFF", "#BFE8FF", "#5FA8D9"], ring: false, glow: true, pulse: true },
];

