export interface PersonalDetails {
  fullName: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  portfolioUrl: string;
  linkedinUrl: string;
  githubUrl: string;
  summary: string;
  photoUrl?: string;
}

export interface Experience {
  id: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  bullets: string[];
}

export interface Education {
  id: string;
  institution: string;
  degree: string;
  fieldOfStudy: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  score?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  github?: string;
}

export interface Language {
  id: string;
  name: string;
  proficiency: "Native" | "Fluent" | "Professional" | "Conversational" | "Basic";
}

export interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  link?: string;
}

export interface ResumeData {
  personal: PersonalDetails;
  experiences: Experience[];
  education: Education[];
  projects: Project[];
  skills: string[];
  languages: Language[];
  certifications: Certification[];
}

export type TemplateId = "slate-professional" | "minimalist-tech" | "executive-serif" | "creative-gradient";

export interface PortfolioSettings {
  templateId: TemplateId;
  accentColor: string; // Tailwind colour class or HEX
  fontFamily: "Inter" | "Space Grotesk" | "Playfair Display" | "JetBrains Mono";
  avatarUrl?: string;
  showExperiences: boolean;
  showEducation: boolean;
  showProjects: boolean;
  showSkills: boolean;
  showLanguages: boolean;
  showCertifications: boolean;
  fontSize?: "compact" | "normal" | "spacious";
  spacingClass?: "compact" | "normal" | "spacious";
}

export interface AIFeedback {
  overallScore: number;
  strengths: string[];
  improvements: string[];
  missingKeywords: string[];
  feedbackParagraph: string;
}
