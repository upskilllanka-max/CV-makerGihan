import { ResumeData, PortfolioSettings } from "./types";

export const initialResumeData: ResumeData = {
  personal: {
    fullName: "Alex Rivera",
    title: "Senior Full Stack Engineer",
    email: "alex.rivera@example.com",
    phone: "+1 (555) 019-2834",
    location: "San Francisco, CA",
    portfolioUrl: "https://alexrivera.dev",
    linkedinUrl: "https://linkedin.com/in/alex-rivera-dev",
    githubUrl: "https://github.com/alexrivera",
    summary: "Strategic, action-oriented software engineer with 6+ years of experience leading high-scale product development. Specializes in building elegant React frontends powered by reliable Node.js microservices. Focused on clean architecture, optimal web performance, and mentoring junior talent.",
    photoUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop",
  },
  experiences: [
    {
      id: "exp-1",
      company: "Stripe",
      role: "Senior Software Engineer",
      location: "San Francisco, CA (Hybrid)",
      startDate: "2023-03",
      endDate: "",
      current: true,
      bullets: [
        "Architected and deployed a multi-region onboarding flow, reducing application drop-offs by 14% and boosting conversion rates.",
        "Refactored heavy client-side transaction visualizers, bringing Core Web Vitals to a 98+ score and cutting memory usage by 40%.",
        "Managed a team of 4 engineers to deliver an updated API billing component, processing over $3M in volume daily.",
        "Created an internal design token system, standardizing components across three critical full-stack merchant dashboards."
      ]
    },
    {
      id: "exp-2",
      company: "Vercel",
      role: "Software Engineer II",
      location: "Remote",
      startDate: "2021-02",
      endDate: "2023-02",
      current: false,
      bullets: [
        "Led developer experience improvements for Serverless Function loggers, speeding up log retrieval times by 3x.",
        "Co-authored community starter kits for Next.js, used by over 50,000 developers globally to boot up secure headless CMS web apps.",
        "Optimized Webpack configurations and transitioned core apps to Turbopack, accelerating hot-reload cycles for developers by 45%."
      ]
    }
  ],
  education: [
    {
      id: "edu-1",
      institution: "Stanford University",
      degree: "Master of Science",
      fieldOfStudy: "Computer Science",
      location: "Stanford, CA",
      startDate: "2018-09",
      endDate: "2020-06",
      current: false,
      score: "GPA 3.9"
    },
    {
      id: "edu-2",
      institution: "UC Berkeley",
      degree: "Bachelor of Science",
      fieldOfStudy: "Electrical Engineering & Computer Science",
      location: "Berkeley, CA",
      startDate: "2014-09",
      endDate: "2018-05",
      current: false,
    }
  ],
  projects: [
    {
      id: "proj-1",
      title: "Omni-Query Engine",
      description: "A fast, open-source GraphQL parsing engine that aggregates multi-source database queries, offering instant live caching and deduplication of parallel queries.",
      technologies: ["TypeScript", "GraphQL", "Redis", "Rust", "Vitest"],
      link: "https://query-engine.dev",
      github: "https://github.com/alexrivera/omni-query"
    },
    {
      id: "proj-2",
      title: "Tailwind UI Bento",
      description: "A comprehensive design system layout creator helper that automatically adjusts layout modules dynamically depending on drag-and-drop hierarchy.",
      technologies: ["React", "Tailwind CSS", "HTML5 Canvas", "Framer Motion"],
      link: "https://bento-builder.net",
      github: "https://github.com/alexrivera/tailwind-bento"
    }
  ],
  skills: [
    "TypeScript",
    "React / Next.js",
    "Tailwind CSS",
    "Node.js / Express",
    "Rust",
    "GraphQL / REST",
    "PostgreSQL",
    "Docker & K8s",
    "AWS",
    "CI/CD Pipelines",
    "CI / CD Automation",
    "Technical Leadership",
    "Agile Methodology"
  ],
  languages: [
    { id: "lang-1", name: "English", proficiency: "Native" },
    { id: "lang-2", name: "Spanish", proficiency: "Fluent" }
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Solutions Architect – Professional",
      issuer: "Amazon Web Services",
      date: "2024-04"
    },
    {
      id: "cert-2",
      name: "Certified ScrumMaster (CSM)",
      issuer: "Scrum Alliance",
      date: "2022-11"
    }
  ]
};

export const initialPortfolioSettings: PortfolioSettings = {
  templateId: "slate-professional",
  accentColor: "indigo", // indigo, emerald, rose, sky, amber, slate
  fontFamily: "Inter",
  showExperiences: true,
  showEducation: true,
  showProjects: true,
  showSkills: true,
  showLanguages: true,
  showCertifications: true,
  fontSize: "normal",
  spacingClass: "compact"
};
