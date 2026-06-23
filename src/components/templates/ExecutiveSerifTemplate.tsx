import React from "react";
import { ResumeData, PortfolioSettings } from "../../types";
import { Mail, Phone, MapPin, Globe, Award } from "lucide-react";

interface Props {
  data: ResumeData;
  settings: PortfolioSettings;
}

export default function ExecutiveSerifTemplate({ data, settings }: Props) {
  const { personal, experiences, education, projects, skills, languages, certifications } = data;

  const textColMap: Record<string, string> = {
    indigo: "text-indigo-900 border-indigo-900/40",
    emerald: "text-emerald-950 border-emerald-950/40",
    rose: "text-rose-950 border-rose-950/40",
    sky: "text-sky-950 border-sky-950/40",
    amber: "text-amber-950 border-amber-950/40",
    slate: "text-slate-900 border-slate-900/40",
  };

  const borderColMap: Record<string, string> = {
    indigo: "border-indigo-800",
    emerald: "border-emerald-800",
    rose: "border-rose-800",
    sky: "border-sky-800",
    amber: "border-amber-800",
    slate: "border-slate-800",
  };

  const textCol = textColMap[settings.accentColor] || textColMap.slate;
  const borderCol = borderColMap[settings.accentColor] || borderColMap.slate;

  // Serif template forces serif feel for structural elegance, but lets settings tweak it slightly.
  const fontStyle = "font-serif";

  const fontSize = settings.fontSize || "normal";
  const spacingClass = settings.spacingClass || "normal";

  const sizeTextMap = {
    compact: "text-[12.5px] leading-snug",
    normal: "text-[13.5px] leading-relaxed",
    spacious: "text-[15.5px] leading-loose",
  }[fontSize];

  const spaceYBlocks = {
    compact: "space-y-4",
    normal: "space-y-6",
    spacious: "space-y-8",
  }[spacingClass];

  const headerSpacing = {
    compact: "pb-4 mb-4",
    normal: "pb-5 mb-6",
    spacious: "pb-6 mb-8",
  }[spacingClass];

  const containerPadding = {
    compact: "p-6 sm:p-8",
    normal: "p-10",
    spacious: "p-14",
  }[spacingClass];

  return (
    <div id="cv-print-area" className={`${containerPadding} bg-white min-h-[1050px] print:min-h-0 print:h-auto shadow-sm text-slate-900 ${fontStyle} print-full ${sizeTextMap}`}>
      {/* Header - Traditional Centered Layout */}
      <div className={`text-center border-b ${headerSpacing}`}>
        {personal.photoUrl && (
          <div className="flex justify-center mb-3">
            <img 
              referrerPolicy="no-referrer"
              src={personal.photoUrl} 
              alt={personal.fullName} 
              className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-slate-100 shadow-sm"
            />
          </div>
        )}
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 italic font-serif select-none">
          {personal.fullName || "Your Full Name"}
        </h1>
        <p className="text-xs uppercase tracking-widest text-slate-500 font-semibold mt-1">
          {personal.title || "Your Professional Title"}
        </p>

        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-slate-500 text-xs mt-3">
          {personal.email && (
            <span className="flex items-center gap-1">
              <Mail size={12} className="text-slate-400" />
              <span>{personal.email}</span>
            </span>
          )}
          {personal.phone && (
            <span className="flex items-center gap-1">
              <Phone size={12} className="text-slate-400" />
              <span>{personal.phone}</span>
            </span>
          )}
          {personal.location && (
            <span className="flex items-center gap-1">
              <MapPin size={12} className="text-slate-400" />
              <span>{personal.location}</span>
            </span>
          )}
        </div>

        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-slate-500 text-xs mt-1.5 pt-1.5 border-t border-slate-100 max-w-xl mx-auto">
          {personal.portfolioUrl && (
            <span className="flex items-center gap-1">
              <Globe size={12} className="text-slate-400" />
              <span>{personal.portfolioUrl}</span>
            </span>
          )}
          {personal.linkedinUrl && (
            <span className="text-slate-400 hover:text-slate-700">LinkedIn</span>
          )}
          {personal.githubUrl && (
            <span className="text-slate-400 hover:text-slate-700 font-sans">GitHub</span>
          )}
        </div>

        {personal.summary && (
          <p className="mt-4 text-slate-600 leading-relaxed text-sm max-w-2xl mx-auto italic font-sans antialiased">
            "{personal.summary}"
          </p>
        )}
      </div>

      {/* Traditional Single Column Structured Layout */}
      <div className={`${spaceYBlocks} max-w-3xl mx-auto text-left`}>
        {/* Core Competencies bar */}
        {settings.showSkills && skills.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-800 pb-1 mb-2 font-serif">
              Core Competencies & Leadership
            </h2>
            <p className="text-xs text-slate-700 font-sans tracking-tight leading-relaxed">
              {skills.join(" • ")}
            </p>
          </div>
        )}

        {/* Work Experience */}
        {settings.showExperiences && experiences.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-800 pb-1 mb-3">
              Professional Experience
            </h2>
            
            <div className="space-y-4">
              {experiences.map((exp) => (
                <div key={exp.id}>
                  <div className="flex justify-between items-baseline">
                    <div>
                      <span className="font-bold text-slate-900 text-sm italic">{exp.role}</span>
                      <span className="text-slate-400 mx-1.5">|</span>
                      <span className="font-semibold text-slate-700 text-xs uppercase tracking-wider">{exp.company}</span>
                    </div>
                    <span className="text-xs text-slate-500 italic whitespace-nowrap">
                      {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                    </span>
                  </div>
                  {exp.location && (
                    <p className="text-[11px] text-slate-400 italic mb-2">{exp.location}</p>
                  )}
                  <ul className="list-disc pl-5 space-y-1 text-xs text-slate-700 font-sans">
                    {exp.bullets.filter(b => b.trim() !== "").map((bullet, idx) => (
                      <li key={idx} className="leading-relaxed">{bullet}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Key Projects */}
        {settings.showProjects && projects.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-800 pb-1 mb-3">
              Selected Initiatives & Case Studies
            </h2>

            <div className="grid grid-cols-1 gap-3 font-sans">
              {projects.map((proj) => (
                <div key={proj.id} className="border-l border-slate-300 pl-3.5 py-1">
                  <div className="flex justify-between items-baseline font-serif">
                    <span className="font-bold text-slate-900 text-xs italic">{proj.title}</span>
                    <span className="text-slate-400 text-[10px] uppercase font-sans tracking-widest">Case Profile</span>
                  </div>
                  <p className="text-xs text-slate-600 my-1 leading-normal">{proj.description}</p>
                  <p className="text-[10px] text-slate-400">
                    <strong className="text-slate-500 font-medium">Stack: </strong>{proj.technologies.join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Academic Record */}
        {settings.showEducation && education.length > 0 && (
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-slate-800 border-b-2 border-slate-800 pb-1 mb-3">
              Education & Academic Credentials
            </h2>

            <div className="space-y-3">
              {education.map((edu) => (
                <div key={edu.id} className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-slate-900 italic">{edu.degree} in {edu.fieldOfStudy}</p>
                    <p className="text-xs text-slate-600 font-medium font-sans">{edu.institution} • {edu.location}</p>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <p className="text-xs text-slate-400 italic">{edu.startDate} – {edu.current ? "Present" : edu.endDate}</p>
                    {edu.score && <p className="text-[10px] text-slate-500 font-sans">{edu.score}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Certifications and Languages in double grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {settings.showCertifications && certifications.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 border-b border-slate-300 pb-1 mb-2 font-serif">
                Professional Credentials
              </h3>
              <ul className="space-y-1 text-xs text-slate-600 font-sans">
                {certifications.map((cert) => (
                  <li key={cert.id} className="flex gap-1">
                    <span className="text-slate-400 shrink-0">•</span>
                    <span>
                      <strong className="text-slate-800 font-medium">{cert.name}</strong> ({cert.issuer}, {cert.date})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {settings.showLanguages && languages.length > 0 && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-800 border-b border-slate-300 pb-1 mb-2 font-serif">
                Languages
              </h3>
              <ul className="space-y-1 text-xs text-slate-600 font-sans">
                {languages.map((lang) => (
                  <li key={lang.id} className="flex justify-between">
                    <span className="text-slate-800">{lang.name}</span>
                    <span className="text-slate-400 italic text-[11px]">{lang.proficiency}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
