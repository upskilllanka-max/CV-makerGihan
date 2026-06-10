import React from "react";
import { ResumeData, PortfolioSettings } from "../../types";
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Award, CheckCircle } from "lucide-react";

interface Props {
  data: ResumeData;
  settings: PortfolioSettings;
}

export default function SlateProfessionalTemplate({ data, settings }: Props) {
  const { personal, experiences, education, projects, skills, languages, certifications } = data;
  
  // Mapping accent colors
  const colorMap: Record<string, string> = {
    indigo: "text-indigo-600 bg-indigo-50 border-indigo-200 hover:bg-indigo-100",
    emerald: "text-emerald-600 bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
    rose: "text-rose-600 bg-rose-50 border-rose-200 hover:bg-rose-100",
    sky: "text-sky-600 bg-sky-50 border-sky-200 hover:bg-sky-100",
    amber: "text-amber-600 bg-amber-50 border-amber-200 hover:bg-amber-100",
    slate: "text-slate-700 bg-slate-100 border-slate-300 hover:bg-slate-200",
  };

  const borderColMap: Record<string, string> = {
    indigo: "border-indigo-600",
    emerald: "border-emerald-600",
    rose: "border-rose-600",
    sky: "border-sky-600",
    amber: "border-amber-600",
    slate: "border-slate-600",
  };

  const textColMap: Record<string, string> = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    sky: "text-sky-600",
    amber: "text-amber-600",
    slate: "text-slate-700",
  };

  const badgeClass = colorMap[settings.accentColor] || colorMap.indigo;
  const borderCol = borderColMap[settings.accentColor] || borderColMap.indigo;
  const textCol = textColMap[settings.accentColor] || textColMap.indigo;

  // Compute font family style
  const fontStyle = {
    Inter: "font-sans",
    "Space Grotesk": "font-display",
    "Playfair Display": "font-serif",
    "JetBrains Mono": "font-mono"
  }[settings.fontFamily] || "font-sans";

  const fontSize = settings.fontSize || "normal";
  const spacingClass = settings.spacingClass || "normal";

  const sizeTextMap = {
    compact: "text-[12.5px] leading-snug",
    normal: "text-[14px] leading-relaxed",
    spacious: "text-[16.5px] leading-loose",
  }[fontSize];

  const gapColClass = {
    compact: "gap-4",
    normal: "gap-6",
    spacious: "gap-8",
  }[spacingClass];

  const colSpanClass = {
    compact: "col-span-1 md:col-span-8 space-y-4",
    normal: "col-span-1 md:col-span-8 space-y-6",
    spacious: "col-span-1 md:col-span-8 space-y-8",
  }[spacingClass];

  const colSpan4Class = {
    compact: "col-span-1 md:col-span-4 space-y-4",
    normal: "col-span-1 md:col-span-4 space-y-6",
    spacious: "col-span-1 md:col-span-4 space-y-8",
  }[spacingClass];

  const headerSpacing = {
    compact: "pb-4 mb-4",
    normal: "pb-6 mb-6",
    spacious: "pb-8 mb-8",
  }[spacingClass];

  const containerPadding = {
    compact: "p-5 sm:p-6",
    normal: "p-8",
    spacious: "p-12",
  }[spacingClass];

  return (
    <div id="cv-print-area" className={`${containerPadding} bg-white min-h-[1050px] print:min-h-0 print:h-auto shadow-sm text-slate-800 ${fontStyle} print-full ${sizeTextMap}`}>
      {/* Header */}
      <div className={`border-b ${headerSpacing}`}>
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {personal.photoUrl && (
            <img 
              referrerPolicy="no-referrer"
              src={personal.photoUrl} 
              alt={personal.fullName} 
              className={`w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 shadow-sm shrink-0 ${borderCol}`} 
            />
          )}
          <div className="flex-1 w-full text-center sm:text-left">
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">{personal.fullName || "Your Full Name"}</h1>
                <p className={`text-lg font-medium mt-1 ${textCol}`}>{personal.title || "Your Professional Title"}</p>
              </div>
              
              <div className="flex flex-wrap gap-y-1 gap-x-3 text-xs text-slate-500 max-w-sm md:text-right md:justify-end justify-center sm:justify-start">
            {personal.email && (
              <span className="flex items-center gap-1">
                <Mail size={12} className={textCol} /> {personal.email}
              </span>
            )}
            {personal.phone && (
              <span className="flex items-center gap-1">
                <Phone size={12} className={textCol} /> {personal.phone}
              </span>
            )}
            {personal.location && (
              <span className="flex items-center gap-1">
                <MapPin size={12} className={textCol} /> {personal.location}
              </span>
            )}
            {personal.portfolioUrl && (
              <span className="flex items-center gap-1">
                <Globe size={12} className={textCol} /> {personal.portfolioUrl}
              </span>
            )}
            {personal.linkedinUrl && (
              <span className="flex items-center gap-1">
                <Linkedin size={12} className={textCol} />
                <span className="truncate max-w-[120px]">LinkedIn</span>
              </span>
            )}
            {personal.githubUrl && (
              <span className="flex items-center gap-1">
                <Github size={12} className={textCol} />
                <span className="truncate max-w-[120px]">GitHub</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </div>

        {personal.summary && (
          <p className="mt-4 text-slate-600 leading-relaxed text-sm italic border-l-2 pl-4 border-slate-200">
            {personal.summary}
          </p>
        )}
      </div>

      {/* Main Two-Column Layout */}
      <div className={`grid grid-cols-1 md:grid-cols-12 ${gapColClass}`}>
        {/* Left Column - Experience & Projects */}
        <div className={colSpanClass}>
          {/* Work Experience */}
          {settings.showExperiences && experiences.length > 0 && (
            <div>
              <h2 className="text-md font-bold text-slate-900 tracking-wider uppercase border-b pb-1 mb-3">
                Professional Experience
              </h2>
              <div className="space-y-4">
                {experiences.map((exp) => (
                  <div key={exp.id} className="relative group">
                    <div className="flex justify-between items-baseline mb-1">
                      <div>
                        <span className="font-bold text-slate-900 text-sm">{exp.role}</span>
                        <span className="text-slate-400 mx-1.5">•</span>
                        <span className="font-semibold text-slate-700 text-sm">{exp.company}</span>
                      </div>
                      <span className="text-xs text-slate-500 whitespace-nowrap ml-2">
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    {exp.location && (
                      <p className="text-xs text-slate-400 mb-2 flex items-center gap-0.5">
                        <MapPin size={10} /> {exp.location}
                      </p>
                    )}
                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600">
                      {exp.bullets.filter(b => b.trim() !== "").map((bullet, idx) => (
                        <li key={idx}>{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects */}
          {settings.showProjects && projects.length > 0 && (
            <div>
              <h2 className="text-md font-bold text-slate-900 tracking-wider uppercase border-b pb-1 mb-3">
                Key Projects
              </h2>
              <div className="space-y-4">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-3 border border-slate-100 rounded-md bg-slate-50/50">
                    <div className="flex justify-between items-baseline pb-1">
                      <span className="font-bold text-slate-900 text-sm">{proj.title}</span>
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {proj.link && <span className="hover:text-slate-600 transition-colors text-slate-500">Demo</span>}
                        {proj.github && <span className="hover:text-slate-600 transition-colors text-slate-500">Source</span>}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-2">{proj.description}</p>
                    {proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.map((tech, i) => (
                          <span key={i} className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded">
                            {tech}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column - Skills, Education, Certs & Languages */}
        <div className={colSpan4Class}>
          {/* Skills */}
          {settings.showSkills && skills.length > 0 && (
            <div>
              <h2 className="text-md font-bold text-slate-900 tracking-wider uppercase border-b pb-1 mb-3">
                Core Expertise
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {skills.map((skill, index) => (
                  <span
                    key={index}
                    className={`text-xs px-2.5 py-1 rounded-md font-medium border transition-colors ${badgeClass}`}
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {settings.showEducation && education.length > 0 && (
            <div>
              <h2 className="text-md font-bold text-slate-900 tracking-wider uppercase border-b pb-1 mb-3">
                Education
              </h2>
              <div className="space-y-3">
                {education.map((edu) => (
                  <div key={edu.id}>
                    <p className="text-xs font-bold text-slate-900">{edu.degree} in {edu.fieldOfStudy}</p>
                    <p className="text-xs font-semibold text-slate-600">{edu.institution}</p>
                    <div className="flex justify-between items-center text-[11px] text-slate-400 mt-0.5">
                      <span>{edu.startDate} – {edu.current ? "Present" : edu.endDate}</span>
                      {edu.score && <span className="text-slate-500">{edu.score}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Certifications */}
          {settings.showCertifications && certifications.length > 0 && (
            <div>
              <h2 className="text-md font-bold text-slate-900 tracking-wider uppercase border-b pb-1 mb-3">
                Certifications
              </h2>
              <div className="space-y-2.5">
                {certifications.map((cert) => (
                  <div key={cert.id} className="flex gap-2">
                    <Award size={14} className={`shrink-0 mt-0.5 ${textCol}`} />
                    <div>
                      <p className="text-xs font-bold text-slate-900 leading-tight">{cert.name}</p>
                      <p className="text-[11px] text-slate-500">{cert.issuer} • {cert.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Languages */}
          {settings.showLanguages && languages.length > 0 && (
            <div>
              <h2 className="text-md font-bold text-slate-900 tracking-wider uppercase border-b pb-1 mb-3">
                Languages
              </h2>
              <div className="space-y-1.5">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-slate-700">{lang.name}</span>
                    <span className="text-slate-400 text-[11px]">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Printable Footer subtle mark */}
      <div className="hidden print:block border-t pt-4 mt-8 text-center text-[10px] text-slate-400 no-print">
        Generated with Resume & Portfolio Creator • {personal.portfolioUrl || "alexrivera.dev"}
      </div>
    </div>
  );
}
