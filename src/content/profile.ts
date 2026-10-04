// Facts here come only from Thomas's CV and owner-approved extras (ADR 0003). Clients are described, not
// named, and employer money figures stay out until the owner clears each one.

export type CaseStudy = {
  slug: string;
  title: string;
  where: string;
  when: string;
  problem: string;
  built: string;
  result: string;
  // The one number a stranger should see at a glance, set large by the page; omit when there is none.
  figure?: { value: string; label: string };
};

// Candidate headlines for the top of the home page, all true to the CV. The blind judge ranks
// them; the page uses `headline` (the winner) and the others stay here for the owner.
export const headlines: string[] = [
  "I build production AI for law and finance.",
  "AI agents in production for wealth managers and law firms.",
  "I put AI agents into production for law firms and wealth managers.",
  "Agents that draft advice reports, check calls and win back lost leads. In production, for law and finance.",
  "A week of report writing, now an hour. I build production AI for finance and law.",
];

// The blind judge ranked headline 3 first (design/evidence/judge/README.md).
export const headline: string = headlines[2];

// Where he has worked and studied, for a quiet row of marks. Only Palindrome's own logo is used
// (see design/MANIFEST.yaml); the others' terms forbid reuse without consent, so they are set as
// plain wordmarks in the site's type.
export type Organisation = { name: string; short: string; logo?: { src: string; width: number; height: number } };

export const organisations: Organisation[] = [
  { name: "Palindrome", short: "Palindrome", logo: { src: "/logos/palindrome.svg", width: 215, height: 26 } },
  { name: "Fletchers Solicitors", short: "Fletchers" },
  { name: "Stark Software Group", short: "Stark" },
  { name: "Imperial College London", short: "Imperial" },
  { name: "IEEE Robotics and Automation Letters", short: "IEEE RA-L" },
];

// One figure from his own paper (accepted version on arXiv 2504.01261), shown under IEEE's author
// reuse terms with the credit line beside it.
export const paperFigure = {
  src: "/paper/forestvo-trajectory.png",
  width: 1253,
  height: 480,
  alt: "Plot of the camera path estimated by ForestVO against the ground truth path, in metres; the two lines stay close along the whole route.",
  credit: "© 2025 IEEE. From Pritchard et al., ForestVO, IEEE RA-L 2025.",
};

export type Role = {
  company: string;
  title: string;
  dates: string;
  descriptor: string;
  bullets: string[];
};

export type Education = {
  institution: string;
  credential: string;
  year: string;
  note?: string;
};

export type Publication = {
  title: string;
  venue: string;
  year: string;
  note: string;
  url: string;
};

export type SkillGroup = {
  label: string;
  items: string[];
};

// One thing outside work: what it is, and an optional note (when, or how often). The CV prints
// them as "head, note"; the home page sets the note beside the head.
export type Elsewhere = { head: string; note?: string };

export type Cv = {
  roles: Role[];
  education: Education[];
  publication: Publication;
  skills: SkillGroup[];
  elsewhere: Elsewhere[];
};

export const intro: string[] = [
  "I'm a founding Forward Deployed Engineer at Palindrome, where I build the AI agents that draft advice reports for UK wealth managers.",
  "I work with each client firm from scoping to production: learning how its advisers write, building the system that drafts the report, and testing it with evaluations before each release.",
  "Before that I was a data scientist at Fletchers Solicitors, a law firm, where I put LLM agents into production.",
];

// One line in his own words for the italic line under the intro: verbatim from src/content/about.mdx.
export const motto = "I write here about building with LLMs: what works, what it costs, and the maths behind it.";

export const caseStudies: CaseStudy[] = [
  {
    slug: "advice-reports",
    title: "AI advice reports in production for wealth managers",
    where: "Palindrome",
    when: "2026",
    problem:
      "Advisers at UK wealth managers wrote each client's advice report by hand, and a complex report took about a week.",
    built:
      "Shipped 5 AI advice-report products to production in 3 months for two wealth managers with £2bn+ in assets across 4 countries. AI agents draft each report from the client's records, and the adviser reviews it.",
    result: "Adviser report writing went from a week to an hour.",
    figure: { value: "1 hour", label: "for a report that took a week" },
  },
  {
    slug: "prompt-caching",
    title: "Cutting company-wide LLM costs with prompt caching",
    where: "Palindrome",
    when: "2026",
    problem:
      "The platform's most expensive LLM calls, for document generation, repeated the same instructions and client data on each request but were not getting cache hits.",
    built:
      "Reordered the prompts so shared instructions and client data come first and are cached, then rolled the change out across document generation, compliance checks, the chatbot and AI editing.",
    result: "Cut the LLM cost of generating an advice report by 67%, now live across every client.",
    figure: { value: "67%", label: "off the LLM cost of each report" },
  },
  {
    slug: "release-evals",
    title: "An evaluation system that gates each release",
    where: "Palindrome",
    when: "2026",
    problem:
      "Palindrome's clients are regulated wealth managers, so a regression in an AI advice report has to be caught before it reaches them.",
    built:
      "Built an evaluation system of synthetic client cases, scored by rule checks and an LLM judge, that gates each production release. The company refined it in workshops with the FCA as part of the regulator's AI Live Testing programme.",
    result: "Stopped AI report regressions reaching clients.",
  },
  {
    slug: "whatsapp-agent",
    title: "A WhatsApp agent that wins back written-off leads",
    where: "Fletchers Solicitors",
    when: "2024–2026",
    problem:
      "A UK personal-injury and medical-negligence law firm wrote off leads it had failed to reach by phone.",
    built:
      "Built a production WhatsApp agent in PydanticAI that answers each lead's questions from the firm's knowledge base and books them a call in Salesforce. A backend engineer built the Salesforce connection.",
    result: "Won back 10% of the leads the firm had written off.",
    figure: { value: "10%", label: "of written-off leads won back" },
  },
];

export const cv: Cv = {
  roles: [
    {
      company: "Palindrome",
      title: "Founding Forward Deployed Engineer",
      dates: "Apr 2026 – Present",
      descriptor: "AI platform for UK wealth managers, London",
      bullets: [
        "Cut adviser report writing from a week to an hour by shipping 5 AI advice-report products to production in 3 months for two wealth managers with £2bn+ in assets across 4 countries",
        "Represented Palindrome in the UK FCA's AI Live Testing programme alongside three major banks, and refined the company's AI report evaluation system in workshops with the regulator",
        "Cut the LLM cost of each AI advice report by 67% by restructuring prompts so shared instructions and client data are cached, then rolled it out to compliance checks, chatbot and AI editing",
        "Sped up new client report builds 10x, from 3 weeks to 2 days, by enforcing prompts-as-code standards and architecting a Claude Code system that compounds client lessons into shared skills",
        "Stopped AI report regressions reaching clients by building an evaluation system of synthetic client cases, scored by rule checks and an LLM judge, that gates each production release",
        "Scoped a prospect's AI rollout in pre-sales by breaking its 100-step client-review workflow into AI and human tasks and setting priorities with its team",
      ],
    },
    {
      company: "Fletchers Solicitors",
      title: "Data Scientist",
      dates: "Oct 2024 – Apr 2026",
      descriptor: "UK personal-injury and medical-negligence law firm, London",
      bullets: [
        "Won back 10% of written-off leads with a production PydanticAI WhatsApp agent that books each lead a call in Salesforce and answers questions from the firm's knowledge base",
        "Turned full-day case reviews into minutes by building an Azure transcription service with a custom legal glossary and LLM speaker relabelling via FastAPI on Azure Functions",
        "Ran the LLM analysis behind an EBITDA improvement case for the C-suite, testing an external consultancy's hypotheses on 5,000+ recorded calls for the behaviours behind conversion, to shape company-wide training",
        "Scaled call QA from 300 sampled calls to all 3,000 a month with an LLM rubric-scoring pipeline that retrieves transcript evidence per question, validated against human reviewers' scorecards",
      ],
    },
    {
      company: "Stark Software Group",
      title: "Asset Analyst",
      dates: "May 2023 – Sep 2023",
      descriptor: "London",
      bullets: [
        "Automated the monthly asset report on my own initiative, cutting it from 4 hours to 2 minutes with an automated Excel dashboard",
      ],
    },
  ],
  education: [
    {
      institution: "Imperial College London",
      credential: "MSc Computer Science (Distinction)",
      year: "2024",
    },
    {
      institution: "Imperial College London",
      credential: "BSc Biological Sciences (First Class Honours)",
      year: "2021",
      note: "Dean's List, Years 1 and 2",
    },
  ],
  publication: {
    title: "ForestVO: Enhancing Visual Odometry in Forest Environments through ForestGlue",
    venue: "IEEE Robotics and Automation Letters",
    year: "2025",
    note: "Co-first author. Baseline accuracy with 25% of keypoints.",
    url: "https://doi.org/10.1109/lra.2025.3557738",
  },
  skills: [
    {
      label: "LLMs and agents",
      items: [
        "Multi-agent systems",
        "PydanticAI",
        "LangChain",
        "Claude Code",
        "Codex",
        "RAG",
        "Evals",
        "Regression testing",
        "LLM-as-judge",
        "Guardrails",
        "Human-in-the-loop",
        "Prompt caching",
      ],
    },
    {
      label: "Engineering",
      items: [
        "Python",
        "SQL",
        "FastAPI",
        "Azure (Functions, OpenAI, Speech)",
        "Docker",
        "PostgreSQL",
        "PyTorch",
      ],
    },
  ],
  elsewhere: [
    { head: "Airbnb Superhost", note: "hosting weekly alongside work" },
    { head: "Ball boy at Wimbledon", note: "2015" },
    { head: "Volunteered in Malawi and Cambodia" },
  ],
};

// The home page's short About: the paragraphs it shares with src/content/about.mdx, kept here so no
// page carries its own copy of the facts. A paragraph is a list of plain text and links, in order;
// the one link (the paper) is off-site, so the page renders it with ExternalLink.
export type Inline = string | { text: string; href: string };

export const aboutShort: Inline[][] = [
  [
    "I started in biology. I studied Biological Sciences at Imperial College London and graduated in 2021 with a First, having made the Dean’s List in my first and second years.",
  ],
  [
    "I then moved into computing and went back to Imperial for an MSc in Computer Science, which I finished with a Distinction in 2024. I’m co-first author of ",
    { text: "ForestVO", href: cv.publication.url },
    ", published in IEEE Robotics and Automation Letters in 2025. Visual odometry works out how a camera moves from the images it records. Our method keeps baseline accuracy while using 25% of the keypoints.",
  ],
];

export const links = {
  github: "https://github.com/tompritch30",
  linkedin: "https://www.linkedin.com/in/thomas-pritchard-01a/",
} as const;

// His GitHub avatar (github.com/tompritch30.png at 460px), re-encoded at 400px without metadata.
export const portrait = {
  src: "/me/thomas.jpg",
  width: 400,
  height: 400,
  // Not his name: the site name in the header already says it, so a screen reader would hear it twice.
  alt: "Portrait photo",
} as const;
