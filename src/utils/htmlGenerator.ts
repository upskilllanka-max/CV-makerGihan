import { ResumeData, PortfolioSettings } from "../types";

export function generateHTML(data: ResumeData, settings: PortfolioSettings): string {
  const { personal, experiences, education, projects, skills, languages, certifications } = data;

  // Colors mapping for Tailwind classes
  const colorsMap: Record<string, {
    primary: string;
    bgBadge: string;
    text: string;
    border: string;
    hoverBg: string;
    gradientFrom: string;
    gradientTo: string;
    portfolioAccent: string;
    ringColor: string;
  }> = {
    indigo: {
      primary: "indigo-600",
      bgBadge: "bg-indigo-50 border-indigo-200 text-indigo-600",
      text: "text-indigo-600",
      border: "border-indigo-600",
      hoverBg: "hover:bg-indigo-50",
      gradientFrom: "from-indigo-600",
      gradientTo: "to-blue-600",
      portfolioAccent: "indigo-500",
      ringColor: "ring-indigo-500/30",
    },
    emerald: {
      primary: "emerald-600",
      bgBadge: "bg-emerald-50 border-emerald-200 text-emerald-600",
      text: "text-emerald-600",
      border: "border-emerald-600",
      hoverBg: "hover:bg-emerald-50",
      gradientFrom: "from-emerald-600",
      gradientTo: "to-teal-600",
      portfolioAccent: "emerald-500",
      ringColor: "ring-emerald-500/30",
    },
    rose: {
      primary: "rose-600",
      bgBadge: "bg-rose-50 border-rose-200 text-rose-600",
      text: "text-rose-600",
      border: "border-rose-600",
      hoverBg: "hover:bg-rose-50",
      gradientFrom: "from-rose-600",
      gradientTo: "to-pink-600",
      portfolioAccent: "rose-500",
      ringColor: "ring-rose-500/30",
    },
    sky: {
      primary: "sky-600",
      bgBadge: "bg-sky-50 border-sky-200 text-sky-600",
      text: "text-sky-600",
      border: "border-sky-600",
      hoverBg: "hover:bg-sky-50",
      gradientFrom: "from-sky-600",
      gradientTo: "to-indigo-600",
      portfolioAccent: "sky-500",
      ringColor: "ring-sky-500/30",
    },
    amber: {
      primary: "amber-600",
      bgBadge: "bg-amber-50 border-amber-200 text-amber-600",
      text: "text-amber-600",
      border: "border-amber-600",
      hoverBg: "hover:bg-amber-50",
      gradientFrom: "from-amber-600",
      gradientTo: "to-orange-600",
      portfolioAccent: "amber-500",
      ringColor: "ring-amber-500/30",
    },
    slate: {
      primary: "slate-700",
      bgBadge: "bg-slate-100 border-slate-300 text-slate-700",
      text: "text-slate-800",
      border: "border-slate-800",
      hoverBg: "hover:bg-slate-100",
      gradientFrom: "from-slate-700",
      gradientTo: "to-slate-900",
      portfolioAccent: "slate-400",
      ringColor: "ring-slate-500/30",
    }
  };

  const activeColor = colorsMap[settings.accentColor] || colorsMap.indigo;

  // Compute font family setups for link & class injection
  const fontLink = {
    Inter: "family=Inter:wght@300;400;500;600;700;800",
    "Space Grotesk": "family=Space+Grotesk:wght@300;400;500;600;700",
    "Playfair Display": "family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400",
    "JetBrains Mono": "family=JetBrains+Mono:wght@300;400;500;600"
  }[settings.fontFamily] || "family=Inter:wght@300;400;500;600;700;800";

  const fontClass = {
    Inter: "font-sans",
    "Space Grotesk": "font-space",
    "Playfair Display": "font-serif",
    "JetBrains Mono": "font-mono"
  }[settings.fontFamily] || "font-sans";

  // Raw helper components generated in correct HTML structure based on active template
  function renderCVHeaderHTML(): string {
    const photoImg = personal.photoUrl ? `
      <img 
        src="${personal.photoUrl}" 
        alt="${personal.fullName}" 
        class="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-2 border-${activeColor.primary} shadow-md shrink-0" 
      />
    ` : "";

    const linksHTML = [
      personal.email ? `
        <span class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-${activeColor.primary}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
          <a href="mailto:${personal.email}" class="hover:underline">${personal.email}</a>
        </span>
      ` : "",
      personal.phone ? `
        <span class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-${activeColor.primary}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
          <span>${personal.phone}</span>
        </span>
      ` : "",
      personal.location ? `
        <span class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-${activeColor.primary}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
          <span>${personal.location}</span>
        </span>
      ` : "",
      personal.portfolioUrl ? `
        <span class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-${activeColor.primary}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
          <a href="${personal.portfolioUrl}" target="_blank" class="hover:underline">${personal.portfolioUrl}</a>
        </span>
      ` : "",
      personal.linkedinUrl ? `
        <span class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-${activeColor.primary}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/></svg>
          <a href="${personal.linkedinUrl}" target="_blank" class="hover:underline">LinkedIn</a>
        </span>
      ` : "",
      personal.githubUrl ? `
        <span class="flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5 text-${activeColor.primary}" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg>
          <a href="${personal.githubUrl}" target="_blank" class="hover:underline">GitHub</a>
        </span>
      ` : ""
    ].filter(Boolean).join("");

    if (settings.templateId === "executive-serif") {
      return `
        <div class="text-center border-b pb-6 mb-8">
          ${personal.photoUrl ? `
            <div class="flex justify-center mb-4">
              <img src="${personal.photoUrl}" alt="${personal.fullName}" class="w-24 h-24 rounded-full object-cover border border-slate-200 shadow-sm" />
            </div>
          ` : ""}
          <h1 class="text-4xl font-bold tracking-tight text-slate-900 font-serif italic">${personal.fullName || "Your Full Name"}</h1>
          <p class="text-sm uppercase tracking-widest text-slate-600 font-semibold mt-1.5">${personal.title || "Your Professional Title"}</p>
          <div class="flex flex-wrap justify-center items-center gap-x-5 gap-y-2 text-slate-500 text-xs mt-4">
            ${linksHTML}
          </div>
          ${personal.summary ? `
            <p class="mt-5 text-slate-600 leading-relaxed text-sm max-w-2xl mx-auto italic font-sans">
              "${personal.summary}"
            </p>
          ` : ""}
        </div>
      `;
    }

    if (settings.templateId === "minimalist-tech") {
      return `
        <div class="border border-slate-300 p-6 mb-8 rounded-lg relative overflow-hidden bg-slate-50/50">
          <div class="absolute top-0 right-0 p-3 text-[9px] font-mono text-slate-400 uppercase tracking-widest select-none font-bold">
            CONFIDENTIAL // SYSTEM RECORD
          </div>
          <div class="flex flex-col sm:flex-row gap-6 items-center sm:items-start">
            ${personal.photoUrl ? `
              <img src="${personal.photoUrl}" alt="${personal.fullName}" class="w-20 h-20 sm:w-24 sm:h-24 rounded-md object-cover border border-slate-300 shrink-0" />
            ` : ""}
            <div class="flex-1 w-full text-center sm:text-left space-y-2">
              <h1 class="text-3xl font-extrabold tracking-tight text-slate-900 font-mono uppercase">${personal.fullName || "Your Name"}</h1>
              <p class="text-xs font-semibold text-slate-500 uppercase tracking-widest flex items-center justify-center sm:justify-start gap-2">
                <span>${personal.title || "Developer"}</span>
                <span class="text-slate-300">|</span>
                <span class="lowercase text-slate-400">${personal.location}</span>
              </p>
              <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-1 gap-x-4 text-[11px] font-mono text-slate-600 pt-3 border-t border-dashed border-slate-200">
                ${linksHTML}
              </div>
            </div>
          </div>
          ${personal.summary ? `
            <div class="mt-4 pt-3 border-t border-slate-200">
              <span class="text-[10px] font-mono font-bold text-slate-400 block mb-1">EXEC_SUMMARY:</span>
              <p class="text-slate-600 text-xs sm:text-sm pl-4 border-l border-slate-300">${personal.summary}</p>
            </div>
          ` : ""}
        </div>
      `;
    }

    // Default: slate-professional
    return `
      <div class="border-b pb-6 mb-6">
        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          ${photoImg}
          <div class="flex-1 w-full text-center sm:text-left">
            <div class="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-3">
              <div>
                <h1 class="text-3xl font-bold tracking-tight text-slate-900">${personal.fullName || "Your Full Name"}</h1>
                <p class="text-lg font-medium mt-1 text-${activeColor.primary}">${personal.title || "Your Professional Title"}</p>
              </div>
              <div class="flex flex-wrap gap-y-1 gap-x-3.5 text-xs text-slate-500 max-w-sm lg:text-right lg:justify-end justify-center sm:justify-start">
                ${linksHTML}
              </div>
            </div>
          </div>
        </div>
        ${personal.summary ? `
          <p class="mt-4 text-slate-600 leading-relaxed text-sm italic border-l-2 pl-4 border-slate-200">
            ${personal.summary}
          </p>
        ` : ""}
      </div>
    `;
  }

  // Work Experience section
  let experiencesHTML = "";
  if (settings.showExperiences && experiences.length > 0) {
    experiencesHTML = `
      <div class="mb-6">
        <h2 class="${settings.templateId === "executive-serif" ? "font-serif border-b-2 border-slate-800" : "font-mono border-b"} text-slate-900 text-md font-bold tracking-wider uppercase pb-1.5 mb-4">
          Professional Experience
        </h2>
        <div class="space-y-4">
          ${experiences.map(exp => `
            <div class="relative">
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                <div>
                  <span class="font-bold text-slate-900 text-sm">${exp.role}</span>
                  <span class="text-slate-400 mx-1.5">•</span>
                  <span class="font-semibold text-slate-700 text-sm">${exp.company}</span>
                </div>
                <span class="text-xs text-slate-500 whitespace-nowrap">
                  ${exp.startDate} – ${exp.current ? "Present" : exp.endDate}
                </span>
              </div>
              ${exp.location ? `<p class="text-xs text-slate-400 mb-1.5">${exp.location}</p>` : ""}
              <ul class="list-disc pl-5 text-xs sm:text-sm text-slate-600 space-y-1">
                ${exp.bullets.map(bullet => `<li>${bullet}</li>`).join("")}
              </ul>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // Education Section
  let educationHTML = "";
  if (settings.showEducation && education.length > 0) {
    educationHTML = `
      <div class="mb-6">
        <h2 class="${settings.templateId === "executive-serif" ? "font-serif border-b-2 border-slate-800" : "font-mono border-b"} text-slate-900 text-md font-bold tracking-wider uppercase pb-1.5 mb-4">
          Education History
        </h2>
        <div class="space-y-3.5">
          ${education.map(edu => `
            <div>
              <div class="flex flex-col sm:flex-row sm:justify-between sm:items-baseline mb-1">
                <span class="font-bold text-slate-900 text-sm">${edu.degree} in ${edu.fieldOfStudy}</span>
                <span class="text-xs text-slate-500 whitespace-nowrap">${edu.startDate} – ${edu.endDate}</span>
              </div>
              <p class="text-xs sm:text-sm font-medium text-slate-700">
                ${edu.institution}${edu.location ? `, ${edu.location}` : ""}
              </p>
              ${edu.score ? `<p class="text-xs text-slate-500 italic mt-0.5">${edu.score}</p>` : ""}
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // Projects Section
  let projectsHTML = "";
  if (settings.showProjects && projects.length > 0) {
    projectsHTML = `
      <div class="mb-6">
        <h2 class="${settings.templateId === "executive-serif" ? "font-serif border-b-2 border-slate-800" : "font-mono border-b"} text-slate-900 text-md font-bold tracking-wider uppercase pb-1.5 mb-4">
          Key Projects
        </h2>
        <div class="grid grid-cols-1 gap-4">
          ${projects.map(proj => `
            <div class="border border-slate-100 rounded-lg p-3.5 bg-slate-50/50">
              <div class="flex justify-between items-baseline mb-1">
                <span class="font-bold text-slate-900 text-sm">${proj.title}</span>
                <div class="flex gap-2">
                  ${proj.link ? `<a href="${proj.link}" target="_blank" class="text-[10px] text-${activeColor.primary} font-medium hover:underline">Code/Demo</a>` : ""}
                </div>
              </div>
              <p class="text-xs text-slate-600 mb-2">${proj.description}</p>
              <div class="flex flex-wrap gap-1">
                ${proj.technologies.map(tech => `
                  <span class="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200">
                    ${tech}
                  </span>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // Skills section (styled for templates)
  let skillsHTML = "";
  if (settings.showSkills && skills.length > 0) {
    if (settings.templateId === "executive-serif") {
      skillsHTML = `
        <div class="mb-6">
          <h2 class="font-serif border-b-2 border-slate-800 text-slate-900 text-sm font-bold tracking-widest uppercase pb-1 mb-2">
            Core Competencies
          </h2>
          <p class="text-xs text-slate-700 tracking-tight leading-relaxed">
            ${skills.join(" • ")}
          </p>
        </div>
      `;
    } else {
      skillsHTML = `
        <div class="mb-6">
          <h2 class="font-mono border-b text-slate-900 text-md font-bold tracking-wider uppercase pb-1.5 mb-3">
            Core Key Skillset
          </h2>
          <div class="flex flex-wrap gap-1.5">
            ${skills.map(s => `
              <span class="text-xs px-2 py-0.5 rounded font-medium border border-slate-200 bg-slate-50 text-slate-700">
                ${s}
              </span>
            `).join("")}
          </div>
        </div>
      `;
    }
  }

  // Languages & Certifications
  let certsHTML = "";
  if (settings.showCertifications && certifications.length > 0) {
    certsHTML = `
      <div class="mb-5">
        <h2 class="font-mono border-b text-slate-900 text-md font-bold tracking-wider uppercase pb-1.5 mb-3">
          Certificates & Awards
        </h2>
        <div class="space-y-2.5">
          ${certifications.map(c => `
            <div class="text-xs">
              <p class="font-bold text-slate-900">${c.name}</p>
              <div class="flex justify-between text-slate-500 text-[10px] sm:text-xs">
                <span>${c.issuer}</span>
                <span>${c.date}</span>
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  let languagesHTML = "";
  if (settings.showLanguages && languages.length > 0) {
    languagesHTML = `
      <div class="mb-5">
        <h2 class="font-mono border-b text-slate-900 text-md font-bold tracking-wider uppercase pb-1.5 mb-3">
          Languages
        </h2>
        <div class="grid grid-cols-2 gap-2 text-xs">
          ${languages.map(l => `
            <div>
              <span class="font-bold text-slate-900">${l.name}</span>
              <p class="text-[10px] text-slate-500">${l.proficiency}</p>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }

  // Side columns configuration for CV Page (slate-professional as 2 column)
  let mainBodyContainer = "";
  if (settings.templateId === "slate-professional") {
    mainBodyContainer = `
      <div class="grid grid-cols-1 md:grid-cols-12 gap-8">
        <div class="md:col-span-8 space-y-6">
          ${experiencesHTML}
          ${projectsHTML}
        </div>
        <div class="md:col-span-4 space-y-6">
          ${skillsHTML}
          ${educationHTML}
          ${certsHTML}
          ${languagesHTML}
        </div>
      </div>
    `;
  } else {
    // Single column flow for Minimalist and Executive Serif
    mainBodyContainer = `
      <div class="space-y-6 max-w-3xl mx-auto">
        ${skillsHTML}
        ${experiencesHTML}
        ${projectsHTML}
        ${educationHTML}
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
          ${certsHTML}
          ${languagesHTML}
        </div>
      </div>
    `;
  }

  // Portfolio Page code
  const portfolioExpHTML = experiences.map(exp => `
    <div class="relative pl-6 pb-6 border-l border-slate-850 last:pb-0">
      <div class="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-500 ring-4 ring-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-950"></div>
      <div class="flex flex-wrap justify-between items-baseline gap-2 mb-1">
        <h4 class="text-sm font-semibold text-white tracking-wide">${exp.role} <span class="text-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-400">@ ${exp.company}</span></h4>
        <span class="text-[11px] text-slate-500 font-mono">${exp.startDate} - ${exp.current ? "Present" : exp.endDate}</span>
      </div>
      <p class="text-xs text-slate-500 mb-2">${exp.location || ""}</p>
      <ul class="list-disc pl-4 space-y-1 text-slate-400 text-xs sm:text-sm">
        ${exp.bullets.map(b => `<li>${b}</li>`).join("")}
      </ul>
    </div>
  `).join("");

  const portfolioProjectsHTML = projects.map(p => `
    <div class="group border border-slate-850 rounded-xl bg-slate-950/40 p-5 hover:border-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-500/30 transition-all duration-300">
      <div class="flex justify-between items-start mb-2">
        <h4 class="text-sm font-bold text-white group-hover:text-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-400 transition-colors">${p.title}</h4>
        <div class="flex gap-2.5">
          ${p.github ? `<a href="${p.github}" target="_blank" class="text-slate-500 hover:text-white transition-colors" title="GitHub Repository"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/></svg></a>` : ""}
          ${p.link ? `<a href="${p.link}" target="_blank" class="text-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-400 hover:text-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-300 transition-colors" title="Live Site"><svg class="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><path d="M15 3h6v6"/><path d="m10 14 11-11"/></svg></a>` : ""}
        </div>
      </div>
      <p class="text-xs text-slate-400 leading-relaxed mb-4">${p.description}</p>
      <div class="flex flex-wrap gap-1">
        ${p.technologies.map(tech => `<span class="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">${tech}</span>`).join("")}
      </div>
    </div>
  `).join("");

  const portfolioEduHTML = education.map(edu => `
    <div class="border border-slate-850 rounded-lg p-4 bg-slate-950/30">
      <div class="flex justify-between items-baseline mb-1">
        <h5 class="text-sm font-bold text-white">${edu.degree} in ${edu.fieldOfStudy}</h5>
        <span class="text-[10px] text-slate-500 font-mono">${edu.startDate} - ${edu.endDate}</span>
      </div>
      <p class="text-xs text-slate-400">${edu.institution}${edu.location ? `, ${edu.location}` : ""}</p>
    </div>
  `).join("");

  // Entire combined standalone HTML page skeleton
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${personal.fullName || "My CV Resume"} - CV Portfolio</title>
  
  <!-- Tailwind CSS Play CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  
  <!-- Font families setup -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?${fontLink}&family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet">
  
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ['Inter', 'sans-serif'],
            space: ['"Space Grotesk"', 'sans-serif'],
            serif: ['Georgia', 'serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          }
        }
      }
    }
  </script>

  <style>
    body {
      background-color: #0A0B0E;
    }
    @media print {
      .no-print {
        display: none !important;
      }
      body {
        background-color: white !important;
        color: black !important;
      }
      #cv-page {
        display: block !important;
        box-shadow: none !important;
        padding: 0 !important;
        margin: 0 !important;
      }
      #portfolio-page {
        display: none !important;
      }
    }
  </style>
</head>
<body class="min-h-screen text-slate-100 antialiased flex flex-col">

  <!-- Interactive top notification & control bar -->
  <header class="no-print bg-[#0e1016]/95 border-b border-white/5 h-16 sticky top-0 z-30 flex items-center justify-between px-6 lg:px-12 backdrop-blur-md">
    <div class="flex items-center gap-2">
      <div class="w-6 h-6 rounded bg-gradient-to-tr from-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-500 to-blue-600 flex items-center justify-center font-bold text-white text-xs">
        CV
      </div>
      <div>
        <span class="text-sm font-bold tracking-tight text-white">${personal.fullName || "My CV"}</span>
        <span class="text-[9px] text-slate-500 font-mono block -mt-1 uppercase tracking-wider">STANDALONE HTML EXPORT</span>
      </div>
    </div>

    <!-- Active render selection toggle buttons -->
    <div class="flex items-center gap-1 bg-white/5 border border-white/10 p-1 rounded-full text-xs">
      <button 
        id="btn-portfolio"
        onclick="switchView('portfolio')" 
        class="px-3.5 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 bg-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-600 text-white"
      >
        <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
        Web Portfolio
      </button>
      <button 
        id="btn-cv"
        onclick="switchView('cv')" 
        class="px-3.5 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 text-slate-400 hover:text-white"
      >
        <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
        Printable Resume
      </button>
    </div>

    <div>
      <button 
        onclick="window.print()" 
        class="bg-white hover:bg-slate-200 text-black px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 shadow"
      >
        <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
        <span>Print & Save PDF</span>
      </button>
    </div>
  </header>

  <!-- Content Containers -->
  <main class="flex-1 flex flex-col items-center">

    <!-- 1. INTERACTIVE HUB PORTFOLIO PAGE -->
    <section id="portfolio-page" class="w-full max-w-5xl mx-auto px-6 py-12 space-y-16">
      
      <!-- Hero Intro Block -->
      <div class="relative py-12 border-b border-slate-850 text-center sm:text-left flex flex-col sm:flex-row items-center gap-8 animate-fade-in">
        ${personal.photoUrl ? `
          <div class="relative shrink-0">
            <div class="absolute -inset-1 rounded-full bg-gradient-to-tr from-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-500 to-blue-500 blur opacity-30"></div>
            <img src="${personal.photoUrl}" alt="${personal.fullName}" class="relative w-28 h-28 md:w-32 md:h-32 rounded-full object-cover border-4 border-slate-900 shadow-xl" />
          </div>
        ` : ""}
        <div class="flex-1 space-y-4">
          <div class="inline-flex items-center gap-2 bg-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-500/10 border border-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-500/20 text-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-400 px-3 py-1 rounded-full text-xs font-mono">
            💻 Ready for Work
          </div>
          <h2 class="text-4xl sm:text-5xl font-extrabold tracking-tight text-white font-space">
            ${personal.fullName || "Professional Name"}
          </h2>
          <p class="text-lg sm:text-xl text-slate-300 font-medium tracking-wide">
            ${personal.title || "Subject Matter Developer"}
          </p>
          <p class="text-sm sm:text-base text-slate-400 max-w-2xl leading-relaxed">
            ${personal.summary || "A results-oriented engineer and design strategist."}
          </p>
          
          <div class="flex flex-wrap justify-center sm:justify-start gap-4 text-xs font-mono pt-2">
            ${personal.email ? `<a href="mailto:${personal.email}" class="text-slate-405 hover:text-white transition-colors bg-slate-900 px-3.5 py-2 rounded-lg border border-slate-800 flex items-center gap-2"><span>${personal.email}</span></a>` : ""}
            ${personal.location ? `<div class="text-slate-405 bg-slate-900 px-3.5 py-2 rounded-lg border border-slate-800 flex items-center gap-2"><span>📍 ${personal.location}</span></div>` : ""}
            ${personal.githubUrl ? `<a href="${personal.githubUrl}" target="_blank" class="text-cyan-400 hover:text-cyan-300 transition-colors bg-slate-900 px-3.5 py-2 rounded-lg border border-slate-800 flex items-center gap-2"><span>📂 GitHub</span></a>` : ""}
            ${personal.linkedinUrl ? `<a href="${personal.linkedinUrl}" target="_blank" class="text-cyan-400 hover:text-cyan-300 transition-colors bg-slate-900 px-3.5 py-2 rounded-lg border border-slate-800 flex items-center gap-2"><span>👔 LinkedIn</span></a>` : ""}
          </div>
        </div>
      </div>

      <!-- Main Columns Portfolio block -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        <!-- Left details list -->
        <div class="lg:col-span-8 space-y-12">
          
          <!-- Experience timeline -->
          ${experiences.length > 0 ? `
            <div class="space-y-6">
              <h3 class="text-lg font-bold uppercase tracking-wider font-space text-white flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded bg-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-500 inline-block"></span>
                Professional History
              </h3>
              <div class="space-y-6">
                ${portfolioExpHTML}
              </div>
            </div>
          ` : ""}

          <!-- Projects grid -->
          ${projects.length > 0 ? `
            <div class="space-y-6">
              <h3 class="text-lg font-bold uppercase tracking-wider font-space text-white flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded bg-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-500 inline-block"></span>
                Engineering Projects
              </h3>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                ${portfolioProjectsHTML}
              </div>
            </div>
          ` : ""}
          
        </div>

        <!-- Right specs section -->
        <div class="lg:col-span-4 space-y-8">
          
          <!-- Tech Stack skills -->
          ${skills.length > 0 ? `
            <div class="space-y-4 border border-slate-800 rounded-2xl bg-slate-950/20 p-6">
              <h3 class="text-sm font-bold uppercase tracking-widest text-white">SKILL SET MATRIX</h3>
              <div class="flex flex-wrap gap-1.5">
                ${skills.map(s => `<span class="text-xs px-2.5 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300 font-mono">${s}</span>`).join("")}
              </div>
            </div>
          ` : ""}

          <!-- Education -->
          ${education.length > 0 ? `
            <div class="space-y-4">
              <h3 class="text-sm font-bold uppercase tracking-widest text-white">EDUCATION DEGREE</h3>
              <div class="space-y-3">
                ${portfolioEduHTML}
              </div>
            </div>
          ` : ""}

          <!-- Certifications/Languages list -->
          ${certifications.length > 0 ? `
            <div class="space-y-3 border border-slate-800 rounded-xl p-5 bg-slate-950/10">
              <span class="text-xs text-slate-400 font-bold block uppercase tracking-wider">CERTIFICATES & BADGES</span>
              <ul class="text-xs space-y-3 font-mono text-slate-300">
                ${certifications.map(c => `
                  <li class="border-b border-slate-900 pb-2 last:border-none">
                    <p class="font-bold text-white">${c.name}</p>
                    <p class="text-[10px] text-slate-550">${c.issuer} (${c.date})</p>
                  </li>
                `).join("")}
              </ul>
            </div>
          ` : ""}

          ${languages.length > 0 ? `
            <div class="space-y-3">
              <span class="text-xs text-slate-400 font-bold block uppercase tracking-wider">LANGUAGES spoken</span>
              <div class="grid grid-cols-2 gap-2 text-xs">
                ${languages.map(l => `
                  <div class="bg-slate-900 border border-slate-800 p-2.5 rounded">
                    <p class="font-bold text-white">${l.name}</p>
                    <p class="text-[10px] text-slate-500">${l.proficiency}</p>
                  </div>
                `).join("")}
              </div>
            </div>
          ` : ""}

        </div>
      </div>
    </section>

    <!-- 2. HIGH FIDELITY PRINTABLE RESUME PAGE -->
    <section id="cv-page" class="hidden w-full max-w-[850px] mx-auto px-4 sm:px-8 py-8 md:py-12">
      <div class="bg-white text-slate-900 rounded-2xl shadow-2xl overflow-hidden p-8 sm:p-12 ${fontClass} border border-slate-200 min-h-[1050px]">
        
        <!-- Header module -->
        ${renderCVHeaderHTML()}

        <!-- Rest of CV layouts -->
        ${mainBodyContainer}
        
      </div>
    </section>

  </main>

  <!-- Interactive visual UI controller script -->
  <script>
    function switchView(tab) {
      const portPage = document.getElementById('portfolio-page');
      const cvPage = document.getElementById('cv-page');
      
      const btnPort = document.getElementById('btn-portfolio');
      const btnCV = document.getElementById('btn-cv');
      
      if (tab === 'portfolio') {
        portPage.style.display = 'block';
        cvPage.style.display = 'hidden';
        cvPage.classList.add('hidden');
        
        // Button toggles
        btnPort.className = "px-3.5 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 bg-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-600 text-white";
        btnCV.className = "px-3.5 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 text-slate-400 hover:text-white";
      } else {
        portPage.style.display = 'none';
        cvPage.classList.remove('hidden');
        cvPage.style.display = 'block';
        
        btnPort.className = "px-3.5 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 text-slate-400 hover:text-white";
        btnCV.className = "px-3.5 py-1.5 rounded-full font-semibold transition-all flex items-center gap-1.5 bg-${activeColor.primary.substring(0, activeColor.primary.indexOf('-')) || 'blue'}-600 text-white";
      }
    }
  </script>
</body>
</html>
`;
}
