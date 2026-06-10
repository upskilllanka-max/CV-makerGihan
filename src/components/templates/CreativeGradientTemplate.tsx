import React from "react";
import { ResumeData, PortfolioSettings } from "../../types";
import { Mail, Phone, MapPin, Globe, Linkedin, Github, Award, BookOpen } from "lucide-react";

interface Props {
  data: ResumeData;
  settings: PortfolioSettings;
}

export default function CreativeGradientTemplate({ data, settings }: Props) {
  const { personal, experiences, education, projects, skills, languages, certifications } = data;

  const fontStyle = {
    Inter: "font-sans",
    "Space Grotesk": "font-display",
    "Playfair Display": "font-serif",
    "JetBrains Mono": "font-mono"
  }[settings.fontFamily] || "font-sans";

  // Accent-specific sub-styles
  const lightTextColMap: Record<string, string> = {
    indigo: "text-indigo-300",
    emerald: "text-emerald-300",
    rose: "text-rose-300",
    sky: "text-sky-300",
    amber: "text-amber-350 text-amber-300",
    slate: "text-slate-300",
  };

  const borderColMap: Record<string, string> = {
    indigo: "border-indigo-500",
    emerald: "border-emerald-500",
    rose: "border-rose-500",
    sky: "border-sky-500",
    amber: "border-amber-500",
    slate: "border-slate-500",
  };

  const bgColMap: Record<string, string> = {
    indigo: "bg-[#1f2d3d]",
    emerald: "bg-[#183533]",
    rose: "bg-[#2c1d27]",
    sky: "bg-[#142e3f]",
    amber: "bg-[#292215]",
    slate: "bg-[#242b35]",
  };

  const accentColorTextMap: Record<string, string> = {
    indigo: "text-indigo-600",
    emerald: "text-emerald-600",
    rose: "text-rose-600",
    sky: "text-sky-600",
    amber: "text-amber-600",
    slate: "text-slate-700",
  };

  const accentText = accentColorTextMap[settings.accentColor] || accentColorTextMap.indigo;
  const lightAccentText = lightTextColMap[settings.accentColor] || lightTextColMap.indigo;
  const borderCol = borderColMap[settings.accentColor] || borderColMap.indigo;
  const sidebarHeroBg = bgColMap[settings.accentColor] || "bg-[#1e293b]";

  const fontSize = settings.fontSize || "normal";
  const spacingClass = settings.spacingClass || "normal";

  const sizeTextMap = {
    compact: "text-[11.5px] leading-snug",
    normal: "text-[13px] leading-relaxed",
    spacious: "text-[15px] leading-loose",
  }[fontSize];

  const col8P = {
    compact: "p-4 space-y-4",
    normal: "p-8 space-y-7",
    spacious: "p-12 space-y-9",
  }[spacingClass];

  const col4P = {
    compact: "p-4 space-y-4",
    normal: "p-6 space-y-7",
    spacious: "p-8 space-y-9",
  }[spacingClass];

  return (
    <div 
      id="cv-print-area" 
      className={`w-full bg-white text-slate-800 ${fontStyle} min-h-[1050px] print:min-h-0 print:h-auto shadow-sm print-full ${sizeTextMap} overflow-hidden flex`}
    >
      {/* TWO-COLUMN SPLIT CONTAINER */}
      <div className="grid grid-cols-12 w-full min-h-[1050px] print:min-h-0">
        
        {/* LEFT COLUMN: DARK SIDEBAR */}
        <div 
          className={`col-span-4 bg-[#1a2530] text-slate-100 ${col4P} flex flex-col print:bg-[#1a2530] print:text-white print:min-h-0`}
          style={{ 
            printColorAdjust: "exact", 
            WebkitPrintColorAdjust: "exact",
            backgroundColor: "#1a2530" 
          }}
        >
          {/* Circular profile photo with elegant outline */}
          <div className="flex flex-col items-center text-center space-y-4 pt-4">
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-white/90 bg-[#121a22] flex items-center justify-center shadow-lg">
              {personal.photoUrl ? (
                <img 
                  referrerPolicy="no-referrer"
                  src={personal.photoUrl} 
                  alt={personal.fullName} 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <span className="text-2xl font-bold uppercase tracking-widest text-slate-400 font-mono">
                  {personal.fullName ? personal.fullName.substring(0, 2) : "CV"}
                </span>
              )}
            </div>
            
            <div className="space-y-1">
              <h1 className="text-xl font-bold tracking-tight text-white">{personal.fullName || "Your Name"}</h1>
              <p className={`text-xs font-semibold uppercase tracking-wider ${lightAccentText}`}>{personal.title || "Your Profession"}</p>
            </div>
          </div>

          {/* CONTACT SECTION */}
          {(personal.email || personal.phone || personal.location) && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold tracking-widest text-white uppercase border-b border-white/10 pb-1">
                Contact
              </h3>
              <div className="space-y-2 text-[11.5px] text-slate-200">
                {personal.phone && (
                  <div className="flex items-center gap-2">
                    <Phone size={12} className={lightAccentText} />
                    <span>{personal.phone}</span>
                  </div>
                )}
                {personal.email && (
                  <div className="flex items-center gap-2 overflow-hidden">
                    <Mail size={12} className={lightAccentText} />
                    <span className="truncate hover:underline cursor-pointer select-all">{personal.email}</span>
                  </div>
                )}
                {personal.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={12} className={lightAccentText} />
                    <span>{personal.location}</span>
                  </div>
                )}
                {personal.portfolioUrl && (
                  <div className="flex items-center gap-2">
                    <Globe size={12} className={lightAccentText} />
                    <span className="truncate hover:underline cursor-pointer">{personal.portfolioUrl}</span>
                  </div>
                )}
                {personal.linkedinUrl && (
                  <div className="flex items-center gap-3 font-mono text-[10px] pt-1">
                    <span className="opacity-60 text-white font-sans text-xs">LinkedIn:</span>
                    <a href={personal.linkedinUrl} target="_blank" rel="noreferrer" className={`hover:underline shrink-0 ${lightAccentText}`}>
                      {personal.linkedinUrl.replace(/https?:\/\/(www\.)?linkedin\.com\/in\//, "")}
                    </a>
                  </div>
                )}
                {personal.githubUrl && (
                  <div className="flex items-center gap-3 font-mono text-[10px]">
                    <span className="opacity-60 text-white font-sans text-xs">GitHub:</span>
                    <a href={personal.githubUrl} target="_blank" rel="noreferrer" className={`hover:underline shrink-0 ${lightAccentText}`}>
                      {personal.githubUrl.replace(/https?:\/\/(www\.)?github\.com\//, "")}
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SKILLS SECTION */}
          {settings.showSkills && skills.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold tracking-widest text-white uppercase border-b border-white/10 pb-1">
                Skills
              </h3>
              <div className="space-y-1.5">
                {skills.map((skill, index) => (
                  <div key={index} className="flex items-center text-[12px] text-slate-250">
                    <span className={`mr-2.5 text-[15px] leading-none ${lightAccentText}`}>○</span>
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LANGUAGES SECTION */}
          {settings.showLanguages && languages.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold tracking-widest text-white uppercase border-b border-white/10 pb-1">
                Languages
              </h3>
              <div className="space-y-1.5">
                {languages.map((lang) => (
                  <div key={lang.id} className="flex items-center justify-between text-[12px] text-slate-250">
                    <div className="flex items-center">
                      <span className={`mr-2.5 text-[15px] leading-none ${lightAccentText}`}>○</span>
                      <span>{lang.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 italic">({lang.proficiency})</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* HOBBIES OR CERTIFICATIONS AT BOTTOM LEFT */}
          {settings.showCertifications && certifications.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <h3 className="text-xs font-bold tracking-widest text-white uppercase border-b border-white/10 pb-1">
                Certificates
              </h3>
              <div className="space-y-2 text-[11px] text-slate-300">
                {certifications.map((cert) => (
                  <div key={cert.id} className="flex items-start gap-1">
                    <span className={`mr-1 text-[13px] leading-none shrink-0 ${lightAccentText}`}>○</span>
                    <div>
                      <p className="font-bold text-white line-clamp-1 leading-tight">{cert.name}</p>
                      <p className="text-[10px] opacity-75">{cert.issuer} • {cert.date}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: LIGHT BODY CONTENT */}
        <div className={`col-span-8 bg-white text-slate-800 ${col8P} flex flex-col print:bg-white print:min-h-0`}>
          
          {/* PROFILE SUMMARY */}
          {personal.summary && (
            <div className="space-y-2">
              <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase border-b border-slate-200 pb-1.5">
                Profile
              </h2>
              <p className="text-slate-600 text-[12.5px] leading-relaxed pr-2 font-normal text-justify">
                {personal.summary}
              </p>
            </div>
          )}

          {/* WORK EXPERIENCE */}
          {settings.showExperiences && experiences.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase border-b border-slate-200 pb-1.5">
                Work Experience
              </h2>
              <div className="space-y-4 pr-1">
                {experiences.map((exp) => (
                  <div key={exp.id} className="space-y-1">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-slate-900 text-[13.5px] leading-tight">
                        {exp.role}
                      </h4>
                      <span className="text-xs text-slate-550 font-medium font-mono whitespace-nowrap ml-2">
                        {exp.startDate} – {exp.current ? "Present" : exp.endDate}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center text-[11px] text-slate-500 font-medium">
                      <span>{exp.company} {exp.location ? `— ${exp.location}` : ""}</span>
                    </div>

                    <ul className="list-disc pl-4 space-y-1 text-xs text-slate-600 leading-normal mt-1.5 font-sans pr-1">
                      {exp.bullets.filter(b => b.trim() !== "").map((bullet, idx) => (
                        <li key={idx} className="text-justify">{bullet}</li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PROJECTS PANEL */}
          {settings.showProjects && projects.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase border-b border-slate-200 pb-1.5">
                Projects
              </h2>
              <div className="grid grid-cols-1 gap-3.5 pr-1">
                {projects.map((proj) => (
                  <div key={proj.id} className="p-3 border border-slate-150 rounded-lg bg-slate-50 shadow-sm">
                    <div className="flex justify-between items-baseline pb-1">
                      <span className="font-bold text-slate-900 text-[13px]">{proj.title}</span>
                      <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                        {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className={`${accentText} hover:underline`}>Demo</a>}
                        {proj.github && <a href={proj.github} target="_blank" rel="noreferrer" className={`${accentText} hover:underline`}>GitHub</a>}
                      </div>
                    </div>
                    <p className="text-xs text-slate-600 mb-1.5 leading-relaxed text-justify">{proj.description}</p>
                    {proj.technologies.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {proj.technologies.map((tech, i) => (
                          <span key={i} className="text-[9.5px] font-mono bg-white border border-slate-200 text-slate-650 px-1.5 py-0.2 rounded font-medium">
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

          {/* EDUCATION PANEL */}
          {settings.showEducation && education.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-bold tracking-wider text-slate-900 uppercase border-b border-slate-200 pb-1.5">
                Education
              </h2>
              <div className="space-y-3.5 pr-1">
                {education.map((edu) => (
                  <div key={edu.id} className="space-y-0.5">
                    <div className="flex justify-between items-start">
                      <h4 className="font-bold text-slate-900 text-[13px] leading-tight">
                        {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                      </h4>
                      <span className="text-xs text-slate-550 font-medium font-mono whitespace-nowrap ml-2">
                        {edu.startDate} – {edu.current ? "Present" : edu.endDate}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs text-slate-600 italic">
                      <span>{edu.institution} {edu.location ? `— ${edu.location}` : ""}</span>
                      {edu.score && <span className="text-slate-500 text-[10.5px] font-semibold font-mono font-sans not-italic">GPA: {edu.score}</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
