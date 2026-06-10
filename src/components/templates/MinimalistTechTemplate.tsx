import React from "react";
import { ResumeData, PortfolioSettings } from "../../types";
import { MapPin, Check } from "lucide-react";

interface Props {
  data: ResumeData;
  settings: PortfolioSettings;
}

export default function MinimalistTechTemplate({ data, settings }: Props) {
  const { personal, experiences, education, projects, skills, languages, certifications } = data;

  const hexColorMap: Record<string, string> = {
    indigo: "text-indigo-600 bg-indigo-50/50 border-indigo-200",
    emerald: "text-emerald-600 bg-emerald-50/50 border-emerald-200",
    rose: "text-rose-600 bg-rose-50/50 border-rose-200",
    sky: "text-sky-600 bg-sky-50/50 border-sky-200",
    amber: "text-amber-600 bg-amber-50/50 border-amber-200",
    slate: "text-slate-700 bg-slate-100 border-slate-300",
  };

  const borderColMap: Record<string, string> = {
    indigo: "border-indigo-600",
    emerald: "border-emerald-600",
    rose: "border-rose-600",
    sky: "border-sky-600",
    amber: "border-amber-600",
    slate: "border-slate-800",
  };

  const textColMap: Record<string, string> = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    sky: "text-sky-600",
    amber: "text-amber-600",
    slate: "text-slate-800",
  };

  const badgeClass = hexColorMap[settings.accentColor] || hexColorMap.slate;
  const borderCol = borderColMap[settings.accentColor] || borderColMap.slate;
  const textCol = textColMap[settings.accentColor] || textColMap.slate;

  const fontSize = settings.fontSize || "normal";
  const spacingClass = settings.spacingClass || "normal";

  const sizeTextMap = {
    compact: "text-[12px] leading-snug",
    normal: "text-[13px] leading-relaxed",
    spacious: "text-[15.5px] leading-loose",
  }[fontSize];

  const spaceYBlocks = {
    compact: "space-y-4",
    normal: "space-y-8",
    spacious: "space-y-12",
  }[spacingClass];

  const headerSpacing = {
    compact: "p-4 mb-4",
    normal: "p-6 mb-8",
    spacious: "p-8 mb-10",
  }[spacingClass];

  const containerPadding = {
    compact: "p-5 sm:p-6",
    normal: "p-8",
    spacious: "p-12",
  }[spacingClass];

  // Compute font family style
  const fontStyle = {
    Inter: "font-sans",
    "Space Grotesk": "font-display",
    "Playfair Display": "font-serif",
    "JetBrains Mono": "font-mono"
  }[settings.fontFamily] || "font-mono";

  return (
    <div id="cv-print-area" className={`${containerPadding} bg-white min-h-[1050px] print:min-h-0 print:h-auto shadow-sm text-slate-800 ${fontStyle} print-full ${sizeTextMap}`}>
      {/* Header Info Block */}
      <div className={`border border-slate-200 ${headerSpacing} rounded-lg relative overflow-hidden bg-slate-50/30`}>
        <div className="absolute top-0 right-0 p-3 text-[10px] font-mono text-slate-400 select-none">
          SYS_ID // CORE
        </div>
        
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
          {personal.photoUrl && (
            <img 
              referrerPolicy="no-referrer"
              src={personal.photoUrl} 
              alt={personal.fullName} 
              className="w-20 h-20 md:w-24 md:h-24 rounded-md object-cover border border-slate-300 shrink-0 shadow-sm"
            />
          )}
          <div className="flex-1 w-full text-center sm:text-left space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 font-mono uppercase">
              {personal.fullName || "Your Name"}
            </h1>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
              <span>{personal.title || "Developer"}</span>
              <span className="text-slate-300">|</span>
              <span className="text-xs lowercase text-slate-400">{personal.location}</span>
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-1.5 gap-x-6 text-[11px] font-mono text-slate-500 mt-5 border-t border-dashed pt-4 border-slate-200">
          {personal.email && (
            <div>
              <span className={`font-bold mr-1 ${textCol}`}>EMAIL:</span>
              <a href={`mailto:${personal.email}`} className="hover:underline">{personal.email}</a>
            </div>
          )}
          {personal.phone && (
            <div>
              <span className={`font-bold mr-1 ${textCol}`}>PHONE:</span>
              <span>{personal.phone}</span>
            </div>
          )}
          {personal.portfolioUrl && (
            <div>
              <span className={`font-bold mr-1 ${textCol}`}>HOST:</span>
              <a href={personal.portfolioUrl} className="hover:underline">{personal.portfolioUrl}</a>
            </div>
          )}
          {personal.linkedinUrl && (
            <div>
              <span className={`font-bold mr-1 ${textCol}`}>LN_ID:</span>
              <span className="truncate">linkedin.com/id</span>
            </div>
          )}
          {personal.githubUrl && (
            <div>
              <span className={`font-bold mr-1 ${textCol}`}>GIT_ID:</span>
              <span className="truncate">github.com/id</span>
            </div>
          )}
        </div>
      </div>

      <div className={spaceYBlocks}>
        {/* Profile Summary */}
        {personal.summary && (
          <div>
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs font-mono font-bold py-0.5 px-2 rounded-sm text-white bg-slate-800`}>[01]</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 flex-grow pb-0.5 font-mono">
                Executive Profile
              </h2>
            </div>
            <p className="text-slate-600 pl-8 text-xs sm:text-sm">
              {personal.summary}
            </p>
          </div>
        )}

        {/* Technical Competencies */}
        {settings.showSkills && skills.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-mono font-bold py-0.5 px-2 rounded-sm text-white bg-slate-800`}>[02]</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 flex-grow pb-0.5 font-mono">
                Tech Stack & Core Skillset
              </h2>
            </div>
            
            <div className="pl-8 flex flex-wrap gap-1.5">
              {skills.map((skill, i) => (
                <span key={i} className="text-xs font-mono px-2 py-1 rounded border border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-800 transition-colors">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Experience Log */}
        {settings.showExperiences && experiences.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-mono font-bold py-0.5 px-2 rounded-sm text-white bg-slate-800`}>[03]</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 flex-grow pb-0.5 font-mono">
                Experience History
              </h2>
            </div>

            <div className="pl-0 md:pl-8 space-y-6">
              {experiences.map((exp) => (
                <div key={exp.id} className="border-l-2 border-slate-100 pl-4 relative">
                  {/* Decorative dot */}
                  <div className={`absolute -left-[6px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 border-2 border-white`}></div>
                  
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                    <div>
                      <span className="font-bold text-slate-900 text-sm font-mono">&gt; {exp.role}</span>
                      <span className="text-slate-400 text-xs font-mono mx-2">@ {exp.company}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400 whitespace-nowrap bg-slate-50 border px-1.5 py-0.5 rounded">
                      {exp.startDate} – {exp.current ? "ACTIVE" : exp.endDate}
                    </span>
                  </div>

                  {exp.location && (
                    <p className="text-[11px] font-mono text-slate-400 mt-0.5 mb-2 lowercase">
                      #{exp.location.replace(/\s+/g, '-')}
                    </p>
                  )}

                  <ul className="space-y-1.5 text-xs text-slate-600 mt-2 font-sans">
                    {exp.bullets.filter(b => b.trim() !== "").map((bullet, idx) => (
                      <li key={idx} className="flex gap-2 items-start">
                        <span className={`text-[10px] font-mono select-none shrink-0 mt-0.5 ${textCol}`}>■</span>
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Projects Dashboard */}
        {settings.showProjects && projects.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className={`text-xs font-mono font-bold py-0.5 px-2 rounded-sm text-white bg-slate-800`}>[04]</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 flex-grow pb-0.5 font-mono">
                Selected Releases & Projects
              </h2>
            </div>

            <div className="pl-0 md:pl-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {projects.map((proj) => (
                <div key={proj.id} className="border border-slate-200 rounded p-4 flex flex-col justify-between bg-slate-50/20 hover:bg-slate-50 hover:border-slate-400 transition-all">
                  <div>
                    <div className="flex justify-between items-start mb-1.5">
                      <span className="font-extrabold text-slate-900 text-xs font-mono">{proj.title}</span>
                    </div>
                    <p className="text-xs text-slate-500 leading-normal mb-3 font-sans">{proj.description}</p>
                  </div>
                  
                  <div className="space-y-2 mt-auto">
                    <div className="flex flex-wrap gap-1">
                      {proj.technologies.slice(0, 4).map((tech, i) => (
                        <span key={i} className="text-[10px] font-mono bg-slate-100 text-slate-600 px-1 rounded">
                          {tech}
                        </span>
                      ))}
                    </div>
                    <div className="flex gap-3 text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-100">
                      {proj.github && <a href={proj.github} className="hover:underline hover:text-slate-800">&gt; src_repo</a>}
                      {proj.link && <a href={proj.link} className="hover:underline hover:text-slate-800">&gt; deploy_link</a>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education & Qualifications */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-mono font-bold py-0.5 px-2 rounded-sm text-white bg-slate-800">[05]</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 flex-grow pb-0.5 font-mono">
                Education
              </h2>
            </div>
            
            <div className="pl-8 space-y-4">
              {education.map((edu) => (
                <div key={edu.id} className="text-xs">
                  <p className="font-bold text-slate-900 uppercase font-mono">{edu.degree}</p>
                  <p className="text-slate-600 font-medium font-mono lowercase">{edu.fieldOfStudy} @ {edu.institution.replace(/\s+/g, '-').toLowerCase()}</p>
                  <p className="text-slate-400 text-[10px] font-mono mt-0.5">{edu.startDate} – {edu.endDate} {edu.score && `• ${edu.score}`}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xs font-mono font-bold py-0.5 px-2 rounded-sm text-white bg-slate-800">[06]</span>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 border-b border-slate-200 flex-grow pb-0.5 font-mono">
                Certifications
              </h2>
            </div>
            
            <div className="pl-8 space-y-3">
              {certifications.slice(0, 3).map((cert) => (
                <div key={cert.id} className="text-xs">
                  <p className="font-bold text-slate-800 font-mono flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
                    {cert.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-mono ml-2.5">{cert.issuer} • {cert.date}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
