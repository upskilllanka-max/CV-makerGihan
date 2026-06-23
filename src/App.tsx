import React, { useState, useEffect } from "react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { 
  ResumeData, 
  PortfolioSettings, 
  AIFeedback, 
  TemplateId, 
  Experience, 
  Education, 
  Project, 
  Language, 
  Certification 
} from "./types";
import { initialResumeData, initialPortfolioSettings } from "./initialData";
import { generateHTML } from "./utils/htmlGenerator";

// Templates
import SlateProfessionalTemplate from "./components/templates/SlateProfessionalTemplate";
import MinimalistTechTemplate from "./components/templates/MinimalistTechTemplate";
import ExecutiveSerifTemplate from "./components/templates/ExecutiveSerifTemplate";
import CreativeGradientTemplate from "./components/templates/CreativeGradientTemplate";

// Icons
import {
  Sparkles,
  Printer,
  FileText,
  Briefcase,
  GraduationCap,
  Code,
  Languages,
  Award,
  Plus,
  Trash2,
  Check,
  ChevronRight,
  RefreshCw,
  Globe,
  Settings,
  Flame,
  User,
  ExternalLink,
  ChevronDown,
  Layout,
  Share2,
  Copy,
  AlertCircle,
  Download,
  FileImage
} from "lucide-react";

export default function App() {
  const [data, setData] = useState<ResumeData>(initialResumeData);
  const [settings, setSettings] = useState<PortfolioSettings>(initialPortfolioSettings);
  
  // App UI State
  const [viewMode, setViewMode] = useState<"resume" | "portfolio" | "android" | "image-preview">("resume");
  const [androidTab, setAndroidTab] = useState<"home" | "experience" | "projects" | "skills" | "builder">("home");
  const [androidTheme, setAndroidTheme] = useState<"indigo" | "emerald" | "rose" | "sky" | "amber">("indigo");
  const [androidBuildProgress, setAndroidBuildProgress] = useState<number>(-1);
  const [androidBuildLogs, setAndroidBuildLogs] = useState<string[]>([]);
  const [androidSheet, setAndroidSheet] = useState<{ open: boolean; title: string; text: string }>({ open: false, title: "", text: "" });
  const [activeTab, setActiveTab] = useState<"personal" | "experience" | "education" | "projects" | "skills" | "extras" | "export-tab">("personal");
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  
  // AI processing states
  const [aiGeneratingSummary, setAiGeneratingSummary] = useState(false);
  const [summaryTone, setSummaryTone] = useState<string>("Professional");
  
  // Skill recommendation state
  const [aiSuggestingSkills, setAiSuggestingSkills] = useState(false);
  
  // Bullet point improvement state
  const [improvingBulletId, setImprovingBulletId] = useState<{expId: string, index: number} | null>(null);
  const [aiBulletModal, setAiBulletModal] = useState<{
    show: boolean;
    original: string;
    improved: string;
    explanation: string;
    altOptions: string[];
    expId: string;
    bulletIndex: number;
  } | null>(null);

  // ATS Optimization & Feedback State
  const [gettingFeedback, setGettingFeedback] = useState(false);
  const [feedbackData, setFeedbackData] = useState<AIFeedback | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  // Status banners / error notifications
  const [statusMessage, setStatusMessage] = useState<{type: "success" | "error", text: string} | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Trigger Image Generation on demand
  useEffect(() => {
    let active = true;
    if (viewMode === "image-preview") {
      const renderPreview = async () => {
        setIsGeneratingPreview(true);
        try {
          const element = document.getElementById("resume-preview-card");
          if (element) {
            const dataUrl = await toPng(element, {
              backgroundColor: "#ffffff",
              style: {
                transform: "none",
                transformOrigin: "top left",
                margin: "0",
              },
              pixelRatio: 1.5,
              cacheBust: true,
            });
            if (active) {
              setImagePreviewUrl(dataUrl);
            }
          }
        } catch (err) {
          console.error("Failed to generate image preview URL:", err);
        } finally {
          if (active) {
            setIsGeneratingPreview(false);
          }
        }
      };
      
      const timer = setTimeout(renderPreview, 400);
      return () => {
        active = false;
        clearTimeout(timer);
      };
    }
  }, [viewMode, data, settings]);
  
  // New section inputs (temp states)
  const [tempSkillInput, setTempSkillInput] = useState("");

  const showStatus = (text: string, type: "success" | "error" = "success") => {
    setStatusMessage({ type, text });
    setTimeout(() => setStatusMessage(null), 4000);
  };

  // REST API: Improve Bullet Point with Gemini
  const handleAIImproveBullet = async (expId: string, bulletText: string, bulletIndex: number) => {
    if (!bulletText.trim()) return;
    setImprovingBulletId({ expId, index: bulletIndex });
    
    try {
      const exp = data.experiences.find(e => e.id === expId);
      const res = await fetch("/api/ai/improve-bullet-point", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bulletPoint: bulletText,
          jobTitle: exp?.role || data.personal.title,
          industry: "Technology & Professional Services"
        })
      });

      if (!res.ok) throw new Error("API call failed");
      const result = await res.json();
      
      setAiBulletModal({
        show: true,
        original: bulletText,
        improved: result.improvedBullet || "",
        explanation: result.explanation || "",
        altOptions: result.altOptions || [],
        expId,
        bulletIndex
      });
    } catch (err) {
      console.error(err);
      showStatus("Failed to reach Gemini AI optimizer. Check environment variables.", "error");
    } finally {
      setImprovingBulletId(null);
    }
  };

  // Replace bullet with AI version
  const applyAIImprovedBullet = (text: string) => {
    if (!aiBulletModal) return;
    const { expId, bulletIndex } = aiBulletModal;
    
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => {
        if (exp.id === expId) {
          const newBullets = [...exp.bullets];
          newBullets[bulletIndex] = text;
          return { ...exp, bullets: newBullets };
        }
        return exp;
      })
    }));

    setAiBulletModal(null);
    showStatus("Bullet point optimized with action-verbs!");
  };

  // REST API: Generate professional summary
  const generateAISummary = async () => {
    if (!data.personal.title) {
      showStatus("Please enter your Professional Title first to assist the AI model.", "error");
      return;
    }
    setAiGeneratingSummary(true);
    try {
      const res = await fetch("/api/ai/generate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: data.personal.title,
          experienceLevel: data.experiences.length > 2 ? "Senior" : "Mid-Level",
          keySkills: data.skills.slice(0, 8),
          tone: summaryTone
        })
      });

      if (!res.ok) throw new Error("API failed");
      const result = await res.json();
      
      if (result.summary) {
        setData(prev => ({
          ...prev,
          personal: {
            ...prev.personal,
            summary: result.summary
          }
        }));
        showStatus(`Generated premium ${summaryTone} bio introduction!`);
      }
    } catch (err) {
      console.error(err);
      showStatus("Could not generate summary. Check if your Gemini key is valid.", "error");
    } finally {
      setAiGeneratingSummary(false);
    }
  };

  // REST API: Suggest Relevant Skills
  const suggestAISkills = async () => {
    if (!data.personal.title) {
      showStatus("Provide a job title to suggest relevant skills.", "error");
      return;
    }
    setAiSuggestingSkills(true);
    try {
      const res = await fetch("/api/ai/suggest-skills", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobTitle: data.personal.title,
          industry: "Professional Services"
        })
      });

      if (!res.ok) throw new Error("API model error");
      const result = await res.json();
      
      if (result.skills && Array.isArray(result.skills)) {
        // filter out existing
        const uniqueSuggestions = result.skills.filter(s => !data.skills.includes(s));
        if (uniqueSuggestions.length === 0) {
          showStatus("Your list already has recommended skills!");
          return;
        }

        setData(prev => ({
          ...prev,
          skills: [...prev.skills, ...uniqueSuggestions]
        }));
        showStatus(`Added ${uniqueSuggestions.length} recommended tech keywords!`);
      }
    } catch (err) {
      console.error(err);
      showStatus("Unable to load skill recommendations.", "error");
    } finally {
      setAiSuggestingSkills(false);
    }
  };

  // REST API: Grade Application and deliver feedback
  const getCVFeedback = async () => {
    setGettingFeedback(true);
    try {
      const res = await fetch("/api/ai/optimize-cv-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cvData: data })
      });

      if (!res.ok) throw new Error("Lacking backend endpoint response");
      const result = await res.json();
      setFeedbackData(result);
      setShowFeedbackModal(true);
      showStatus("AI Coach Portfolio feedback loaded successfully!");
    } catch (err) {
      console.error(err);
      showStatus("Failed to perform complete CV audit.", "error");
    } finally {
      setGettingFeedback(false);
    }
  };

  // Simulated Android APK builder pipeline
  const triggerAppBuildAndroid = () => {
    if (androidBuildProgress >= 0) return;
    setAndroidBuildProgress(0);
    setAndroidBuildLogs([
      "🤖 Initializing Android Software Development Kit (SDK v34)...",
      "📂 Reading project source structures and assets...",
      "🗃️ Generating customized manifest package permissions..."
    ]);

    const steps = [
      { progress: 20, log: "📦 Compiling Material Design 3 theme system and XML vector grids..." },
      { progress: 45, log: "🔩 Optimizing dex compilers and compiling Kotlin application widgets..." },
      { progress: 70, log: "🔬 Resolving multi-threaded network configurations..." },
      { progress: 90, log: "🔏 Signing application binary package with release signatures..." },
      { progress: 100, log: "🎉 Success! APK generated successfully: craftcv-app-release.apk (7.2 MB)" }
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        const item = steps[currentStep];
        setAndroidBuildProgress(item.progress);
        setAndroidBuildLogs(prev => [...prev, item.log]);
        currentStep++;
      } else {
        clearInterval(interval);
      }
    }, 700);
  };

  // Dynamic Item Adders
  const addExperience = () => {
    const newExp: Experience = {
      id: `exp-${Date.now()}`,
      company: "New Company",
      role: "Software Professional",
      location: "Hybrid / Remote",
      startDate: "2024-01",
      endDate: "",
      current: true,
      bullets: ["Accomplished major features in collaboration with remote teams.", "Optimized processes to decrease delivery lag."]
    };
    setData(prev => ({ ...prev, experiences: [newExp, ...prev.experiences] }));
    showStatus("New work experience card added!");
  };

  const removeExperience = (id: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.filter(exp => exp.id !== id)
    }));
  };

  const addExperienceBullet = (expId: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => {
        if (exp.id === expId) {
          return { ...exp, bullets: [...exp.bullets, "New critical contribution achievement metrics."] };
        }
        return exp;
      })
    }));
  };

  const updateExperienceBullet = (expId: string, index: number, value: string) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => {
        if (exp.id === expId) {
          const newBullets = [...exp.bullets];
          newBullets[index] = value;
          return { ...exp, bullets: newBullets };
        }
        return exp;
      })
    }));
  };

  const removeExperienceBullet = (expId: string, index: number) => {
    setData(prev => ({
      ...prev,
      experiences: prev.experiences.map(exp => {
        if (exp.id === expId) {
          return { ...exp, bullets: exp.bullets.filter((_, i) => i !== index) };
        }
        return exp;
      })
    }));
  };

  const addEducation = () => {
    const newEdu: Education = {
      id: `edu-${Date.now()}`,
      institution: "State University",
      degree: "Bachelor of Science",
      fieldOfStudy: "Computer Engineering",
      location: "City, State",
      startDate: "2020-09",
      endDate: "2024-06",
      current: false,
    };
    setData(prev => ({ ...prev, education: [...prev.education, newEdu] }));
    showStatus("Education module added.");
  };

  const removeEducation = (id: string) => {
    setData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const addProject = () => {
    const newProj: Project = {
      id: `proj-${Date.now()}`,
      title: "Microservice Framework",
      description: "A fast routing server-side template providing automatic authentication, TLS management, and optimized Docker layers.",
      technologies: ["TypeScript", "Docker", "Node.js"],
      link: "https://demo-service.com",
      github: "https://github.com/yourusername/microservice-framework"
    };
    setData(prev => ({ ...prev, projects: [...prev.projects, newProj] }));
    showStatus("Portfolio project card added!");
  };

  const removeProject = (id: string) => {
    setData(prev => ({ ...prev, projects: prev.projects.filter(p => p.id !== id) }));
  };

  // Custom skills tags
  const handleAddSkillTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempSkillInput.trim()) return;
    if (data.skills.includes(tempSkillInput.trim())) {
      setTempSkillInput("");
      return;
    }
    setData(prev => ({
      ...prev,
      skills: [...prev.skills, tempSkillInput.trim()]
    }));
    setTempSkillInput("");
  };

  const removeSkillTag = (skillName: string) => {
    setData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillName)
    }));
  };

  // Auto populate sample high fidelity developer data
  const loadHighFidelityProfile = () => {
    setData(initialResumeData);
    showStatus("Loaded mock senior engineer credentials!");
  };

  const clearCredentials = () => {
    setData({
      personal: {
        fullName: "",
        title: "",
        email: "",
        phone: "",
        location: "",
        portfolioUrl: "",
        linkedinUrl: "",
        githubUrl: "",
        summary: "",
        photoUrl: "",
      },
      experiences: [],
      education: [],
      projects: [],
      skills: [],
      languages: [],
      certifications: []
    });
    showStatus("Cleared edit workspace. Feel free to build custom sections!", "success");
  };

  // Trigger local Print
  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPNG = async () => {
    setIsDownloading(true);
    try {
      const element = document.getElementById("resume-preview-card");
      if (!element) {
        showStatus("Resume content element not found.", "error");
        return;
      }

      const dataUrl = await toPng(element, {
        backgroundColor: "#ffffff",
        style: {
          transform: "none",
          transformOrigin: "top left",
          margin: "0",
        },
        pixelRatio: 2.5,
        cacheBust: true,
      });

      const safeName = data.personal.fullName ? data.personal.fullName.trim().replace(/\s+/g, '_') : "resume";
      const link = document.createElement("a");
      link.download = `${safeName}_resume_image.png`;
      link.href = dataUrl;
      link.click();

      showStatus("Resume Image (PNG) downloaded successfully!", "success");
    } catch (err) {
      console.error("PNG capturing failed:", err);
      showStatus("Image compilation failed. Try native print option to save as PDF.", "error");
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const element = document.getElementById("resume-preview-card");
      if (!element) {
        showStatus("Resume content element not found.", "error");
        return;
      }

      const safeName = data.personal.fullName ? data.personal.fullName.trim().replace(/\s+/g, '_') : "resume";
      const resumeHTML = element.innerHTML;

      // Extract template-specific background classes if any (such as ASCII Minimalist border box or professional theme styles)
      const printDoc = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${data.personal.fullName || "Resume"} - CV Document</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Space+Grotesk:wght@400;500;600;700&display=swap" />
  <script>
    tailwind.config = {
      theme: {
        extend: {
          fontFamily: {
            sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
            mono: ["JetBrains Mono", "ui-monospace", "monospace"],
            serif: ["Playfair Display", "Georgia", "serif"],
            display: ["Space Grotesk", "sans-serif"]
          },
          colors: {
            indigo: {
              50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#cbd5e1', 400: '#a855f7', 500: '#6366f1', 600: '#4f46e5', 650: '#4338ca', 700: '#3730a3', 800: '#1e1b4b'
            },
            emerald: {
              50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 650: '#047857', 700: '#065f46', 800: '#064e3b'
            },
            rose: {
              50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 650: '#be123c', 700: '#9f1239', 800: '#881337'
            },
            sky: {
              50: '#f0f9ff', 100: '#e0f2fe', 200: '#bae6fd', 300: '#7dd3fc', 400: '#38bdf8', 500: '#0ea5e9', 600: '#0284c7', 650: '#0369a1', 700: '#075985', 800: '#0c4a6e'
            },
            amber: {
              50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 650: '#b45309', 700: '#92400e', 800: '#78350f'
            },
            slate: {
              50: '#f8fafc', 100: '#f1f5f9', 200: '#e2e8f0', 300: '#cbd5e1', 400: '#94a3b8', 500: '#64748b', 600: '#475569', 650: '#334155', 700: '#1e293b', 800: '#0f172a'
            }
          }
        }
      }
    }
  </script>
  <style>
    @media print {
      body {
        background: white !important;
        color: black !important;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .no-print {
        display: none !important;
      }
      .print-padding-none {
        padding: 0 !important;
        margin: 0 !important;
      }
    }
    body {
      background-color: #0f172a;
    }
  </style>
</head>
<body class="min-h-screen text-slate-100 font-sans">
  <!-- Interactive instructions panel (hidden in print automatically) -->
  <div class="no-print bg-slate-900/95 backdrop-blur border-b border-white/10 sticky top-0 z-50 px-4 py-3.5 shadow-xl">
    <div class="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
      <div class="flex items-center gap-2">
        <span class="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping"></span>
        <span class="text-xs font-bold font-mono tracking-wide text-emerald-400 uppercase">HIGH FIDELITY VECTOR EXPORT</span>
        <span class="text-xs text-slate-400">| Complete style rendering loaded perfectly.</span>
      </div>
      <div class="flex items-center gap-2.5">
        <button onclick="window.print()" class="bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-2 px-4 rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-lg shadow-indigo-600/30 cursor-pointer">
          <svg class="w-3.5 h-3.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5"><path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M6 14h12v8H6z"/></svg>
          Print & Save PDF
        </button>
        <button onclick="window.close()" class="bg-white/10 hover:bg-white/20 text-slate-200 py-2 px-3 rounded-lg text-xs font-semibold cursor-pointer transition-all border border-white/5">
          Close Window
        </button>
      </div>
    </div>
  </div>

  <div class="container mx-auto px-2 sm:px-4 py-10 print:py-0 print:px-0">
    <div class="max-w-[800px] mx-auto bg-white text-slate-900 overflow-hidden shadow-2xl print:shadow-none print-padding-none rounded-2xl print:rounded-none">
      ${resumeHTML}
    </div>
  </div>

  <script>
    // Prompt print automatically with a small delay for styling compilation
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 600);
    });
  </script>
</body>
</html>
      `;

      // Create a Blob representing our compiled printable page
      const blob = new Blob([printDoc], { type: "text/html;charset=utf-8" });
      const blobUrl = URL.createObjectURL(blob);

      // Open at top-level window/tab to circumvent sandbox limits
      const newTab = window.open(blobUrl, "_blank");
      if (!newTab) {
        showStatus("Popup was blocked! Please authorize popups to export high fidelity PDFs.", "error");
      } else {
        showStatus("Opened resume PDF engine in new tab. Happy saving!", "success");
      }
    } catch (err) {
      console.error("PDF download tab prompt failed:", err);
      showStatus("Could not prompt export tab. Try 'Print PDF' options instead.", "error");
    }
  };

  const handleDownloadHTML = () => {
    try {
      const htmlContent = generateHTML(data, settings);
      const blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      const safeName = data.personal.fullName ? data.personal.fullName.trim().replace(/\s+/g, '_') : "resume";
      link.download = `${safeName}_website.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showStatus("Interactive HTML Website generated & downloaded successfully!", "success");
    } catch (err) {
      console.error(err);
      showStatus("Failed to export HTML portfolio website", "error");
    }
  };

  // Toggle visible sections
  const toggleSetting = (key: keyof PortfolioSettings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }) as any);
  };

  return (
    <div className="min-h-screen bg-[#0A0B0E] text-slate-100 flex flex-col font-sans relative selection:bg-blue-600/30 selection:text-white print:bg-white print:text-black">
      
      {/* GLOBAL STATUS TOAST */}
      {statusMessage && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3.5 rounded-xl flex items-center gap-3 shadow-2xl border transition-all transform scale-100 animate-bounce ${
          statusMessage.type === "success" 
            ? "bg-[#101918] border-emerald-500/30 text-emerald-400" 
            : "bg-[#251010] border-rose-500/30 text-rose-400"
        }`}>
          <AlertCircle size={18} />
          <span className="text-sm font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* HEADER NAVIGATION - Matches Elegant Dark Frame */}
      <header className="h-20 shrink-0 border-b border-white/5 flex items-center justify-between px-6 lg:px-12 z-20 no-print">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gradient-to-tr from-blue-600 to-indigo-400 rounded-lg flex items-center justify-center font-bold text-white shadow-md shadow-indigo-500/10">
            C
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-100 via-slate-100 to-indigo-100">
              CraftCV
            </span>
            <span className="text-[10px] text-slate-500 font-mono block -mt-1 tracking-wider uppercase">
              AI-Optimized • Portfolio Host
            </span>
          </div>
        </div>

        {/* Central static indicator */}
        <div className="hidden md:flex items-center gap-1.5 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full text-xs text-slate-300">
          <FileText size={14} className="text-indigo-400" />
          <span className="font-semibold text-slate-200 tracking-wider">Printable A4 Resume Mode</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Sample dataset injector */}
          <button 
            type="button" 
            onClick={loadHighFidelityProfile}
            className="text-xs bg-white/5 border border-white/10 hover:bg-white/10 text-slate-300 font-medium px-4 py-2 rounded-lg transition-all"
          >
            Demo Data
          </button>
          
          <button
            onClick={getCVFeedback}
            disabled={gettingFeedback}
            className="relative bg-gradient-to-tr from-blue-600 to-indigo-500 hover:from-blue-500 hover:to-indigo-400 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
          >
            {gettingFeedback ? (
              <RefreshCw className="animate-spin" size={12} />
            ) : (
              <Sparkles size={12} className="text-blue-200 animate-pulse" />
            )}
            Score My CV
          </button>
        </div>
      </header>

      {/* Hero Welcome Announcement */}
      <div className="bg-gradient-to-r from-blue-950/20 via-slate-950/20 to-indigo-950/20 border-b border-white/5 px-6 lg:px-12 py-3 hover:bg-slate-900/10 transition-colors duration-300 flex flex-wrap justify-between items-center gap-3 text-xs text-slate-400 no-print">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 inline-block animate-ping"></span>
          <span>CV is synchronized with real-time portfolio layout templates in 4 responsive colors.</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Local Storage: <strong className="text-emerald-400">Offline state ready</strong></span>
          <button onClick={clearCredentials} className="hover:text-rose-400 transition-colors">Reset Canvas</button>
        </div>
      </div>

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col xl:flex-row overflow-hidden print:overflow-visible">
        
        {/* LEFT COLUMN: THE CODE EDITOR & FORM (no-print) */}
        <section className="w-full xl:w-[48%] bg-[#0e1016] border-r border-white/5 flex flex-col overflow-y-auto no-print">
          
          {/* Editor Tabs navigation */}
          <div className="flex overflow-x-auto bg-slate-900/60 scrollbar-none border-b border-white/5 sticky top-0 z-10 select-none">
            {[
              { id: "personal", label: "Contact & Summary", icon: User },
              { id: "experience", label: "Experiences", icon: Briefcase },
              { id: "education", label: "Education", icon: GraduationCap },
              { id: "projects", label: "Projects Grid", icon: Code },
              { id: "skills", label: "Keywords / Skills", icon: Sparkles },
              { id: "extras", label: "Languages / Certs", icon: Award },
              { id: "export-tab", label: "Export HTML-CV", icon: Download }
            ].map((tab) => {
              const IconComp = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-4 text-xs font-semibold shrink-0 flex items-center gap-2 border-b-2 transition-all ${
                    activeTab === tab.id 
                      ? "border-blue-500 text-white bg-slate-800/40" 
                      : "border-transparent text-slate-400 hover:text-white hover:bg-slate-950/30"
                  }`}
                >
                  <IconComp size={14} className={activeTab === tab.id ? "text-blue-400" : "text-slate-500"} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6 space-y-8 flex-1">
            
            {/* TABS CONTENT: PERSONAL DETAILS */}
            {activeTab === "personal" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Personal Contact Card</h3>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400 font-mono">V_DETAILS</span>
                </div>

                {/* CV Picture Section */}
                <div className="border border-white/5 bg-white/[0.01] rounded-xl p-5 space-y-4">
                  <span className="text-xs font-bold text-white uppercase tracking-wider font-mono flex items-center gap-2">
                    <User size={14} className="text-blue-400" />
                    CV Profile Picture
                  </span>
                  
                  <div className="flex flex-col sm:flex-row gap-5 items-center">
                    {/* Visual Preview */}
                    <div className="relative group shrink-0 w-24 h-24 rounded-xl border-2 border-white/10 overflow-hidden bg-slate-900 flex items-center justify-center">
                      {data.personal.photoUrl ? (
                        <>
                          <img 
                            referrerPolicy="no-referrer"
                            src={data.personal.photoUrl} 
                            alt="CV Avatar Preview" 
                            className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-200"
                          />
                          <button
                            type="button"
                            onClick={() => setData(prev => ({ ...prev, personal: { ...prev.personal, photoUrl: "" } }))}
                            className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-rose-400 text-xs font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <div className="text-center p-2 text-slate-500 flex flex-col items-center">
                          <User size={24} className="mb-1 text-slate-400" />
                          <span className="text-[9px] uppercase font-mono">No Photo</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Control Actions / Drag & Drop area */}
                    <div className="flex-1 w-full space-y-3">
                      <div className="flex flex-wrap gap-2">
                        {/* Custom File Upload input */}
                        <label className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-3.5 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-sm active:scale-95 duration-100">
                          <Plus size={13} />
                          Upload Image File
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onload = (event) => {
                                  if (event.target?.result) {
                                    setData(prev => ({
                                      ...prev,
                                      personal: {
                                        ...prev.personal,
                                        photoUrl: event.target.result as string
                                      }
                                    }));
                                    showStatus("CV profile picture loaded successfully!");
                                  }
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                        
                        {/* URL input switcher */}
                        <button
                          type="button"
                          onClick={() => {
                            const url = window.prompt("Enter custom image link (https://...):", data.personal.photoUrl || "");
                            if (url !== null) {
                              setData(prev => ({
                                ...prev,
                                personal: {
                                  ...prev.personal,
                                  photoUrl: url
                                }
                              }));
                              showStatus("Profile photo URL set!");
                            }
                          }}
                          className="bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 font-medium text-xs px-3.5 py-2 rounded-lg transition-colors cursor-pointer"
                        >
                          Custom URL Link
                        </button>
                      </div>
                      
                      {/* Premium Pre-selected professional avatars option */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono block">Or use professional sample headshots:</span>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { name: "Executive Male", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=250&auto=format&fit=crop" },
                            { name: "Executive Female", url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=250&auto=format&fit=crop" },
                            { name: "Modern Tech Male", url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=250&auto=format&fit=crop" },
                            { name: "Modern Tech Female", url: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=250&auto=format&fit=crop" }
                          ].map((avatar, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setData(prev => ({
                                  ...prev,
                                  personal: {
                                    ...prev.personal,
                                    photoUrl: avatar.url
                                  }
                                }));
                                showStatus(`Selected professional ${avatar.name} option!`);
                              }}
                              className={`text-[10px] border px-2 py-1 rounded transition-all duration-150 font-mono select-none ${
                                data.personal.photoUrl === avatar.url 
                                  ? "border-blue-500 bg-blue-500/10 text-blue-400" 
                                  : "bg-transparent hover:bg-white/5 border-white/10 text-slate-400 hover:text-white"
                              }`}
                            >
                              {avatar.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase">Full Name</label>
                    <input 
                      type="text" 
                      value={data.personal.fullName}
                      onChange={e => setData(prev => ({ ...prev, personal: { ...prev.personal, fullName: e.target.value } }))}
                      placeholder="e.g. Alex Rivera"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/80 transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase">Professional Status Title</label>
                    <input 
                      type="text" 
                      value={data.personal.title}
                      onChange={e => setData(prev => ({ ...prev, personal: { ...prev.personal, title: e.target.value } }))}
                      placeholder="e.g. Senior Full Stack Engineer"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/80 transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase">Email Address</label>
                    <input 
                      type="email" 
                      value={data.personal.email}
                      onChange={e => setData(prev => ({ ...prev, personal: { ...prev.personal, email: e.target.value } }))}
                      placeholder="alex.rivera@example.com"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/80 transition-all font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase">Telephone Support</label>
                    <input 
                      type="text" 
                      value={data.personal.phone}
                      onChange={e => setData(prev => ({ ...prev, personal: { ...prev.personal, phone: e.target.value } }))}
                      placeholder="+1 (555) 019-2834"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/80 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase">Home Location</label>
                    <input 
                      type="text" 
                      value={data.personal.location}
                      onChange={e => setData(prev => ({ ...prev, personal: { ...prev.personal, location: e.target.value } }))}
                      placeholder="San Francisco, CA"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/80 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase">Personal Domain Hosting</label>
                    <input 
                      type="text" 
                      value={data.personal.portfolioUrl}
                      onChange={e => setData(prev => ({ ...prev, personal: { ...prev.personal, portfolioUrl: e.target.value } }))}
                      placeholder="https://alexrivera.dev"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/80 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase">LinkedIn Profile ID</label>
                    <input 
                      type="text" 
                      value={data.personal.linkedinUrl}
                      onChange={e => setData(prev => ({ ...prev, personal: { ...prev.personal, linkedinUrl: e.target.value } }))}
                      placeholder="linkedin.com/in/alex-rivera-dev"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/80 transition-all whitespace-nowrap"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-mono text-slate-400 uppercase">GitHub Code Account URL</label>
                    <input 
                      type="text" 
                      value={data.personal.githubUrl}
                      onChange={e => setData(prev => ({ ...prev, personal: { ...prev.personal, githubUrl: e.target.value } }))}
                      placeholder="github.com/alexrivera"
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500/80 transition-all"
                    />
                  </div>
                </div>

                {/* Profile Summary & AI generator section */}
                <div className="border border-white/5 bg-white/[0.02] rounded-xl p-4 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-indigo-400 animate-pulse" size={16} />
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">AI Professional Bio Summary</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-slate-400 font-mono">Tone:</span>
                      <select 
                        value={summaryTone} 
                        onChange={e => setSummaryTone(e.target.value)}
                        className="bg-slate-900 border border-white/10 text-[11px] px-2 py-1 rounded text-white focus:outline-none focus:border-blue-500"
                      >
                        <option value="Professional">Corporate / Senior</option>
                        <option value="Creative">Impact / Energetic</option>
                        <option value="High Technical">Geek / Detailed Stack</option>
                        <option value="Short & Direct">Direct / Concise</option>
                      </select>

                      <button
                        type="button"
                        onClick={generateAISummary}
                        disabled={aiGeneratingSummary}
                        className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-semibold text-[11px] px-3.5 py-1.5 rounded-md transition-all flex items-center gap-1 cursor-pointer"
                      >
                        {aiGeneratingSummary ? (
                          <RefreshCw className="animate-spin" size={10} />
                        ) : (
                          <>Generate</>
                        )}
                      </button>
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    Fills an impactful summary bio introducing your key technical values and objectives dynamically depending on title.
                  </p>

                  <textarea 
                    value={data.personal.summary}
                    onChange={e => setData(prev => ({ ...prev, personal: { ...prev.personal, summary: e.target.value } }))}
                    rows={4}
                    placeholder="Describe your background, leadership targets, and expertise specialties..."
                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-indigo-500/80 transition-all font-sans leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* TABS CONTENT: EXPERIENCE HISTORY */}
            {activeTab === "experience" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Professional Projects History</h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">List previous workplaces with metrics-oriented bullets</p>
                  </div>
                  <button 
                    onClick={addExperience}
                    className="text-xs bg-indigo-650 hover:bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Plus size={14} /> Add Role
                  </button>
                </div>

                {data.experiences.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                    <Briefcase className="mx-auto text-slate-600 mb-3" size={28} />
                    <p className="text-xs font-semibold text-slate-400">No experiences listed yet</p>
                    <button onClick={addExperience} className="text-xs text-indigo-400 font-bold underline mt-1">Add your current role</button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {data.experiences.map((exp) => (
                      <div key={exp.id} className="border border-white/5 bg-white/[0.01] p-5 rounded-2xl space-y-4 hover:border-white/10 transition-all">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] uppercase font-mono bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-md font-semibold font-mono">
                            Work Record Card
                          </span>
                          <button 
                            onClick={() => removeExperience(exp.id)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Delete Experience"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">Role / Job Title</label>
                            <input 
                              type="text" 
                              value={exp.role}
                              onChange={e => {
                                setData(prev => ({
                                  ...prev,
                                  experiences: prev.experiences.map(x => x.id === exp.id ? { ...x, role: e.target.value } : x)
                                }));
                              }}
                              className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">Corporation / Company Name</label>
                            <input 
                              type="text" 
                              value={exp.company}
                              onChange={e => {
                                setData(prev => ({
                                  ...prev,
                                  experiences: prev.experiences.map(x => x.id === exp.id ? { ...x, company: e.target.value } : x)
                                }));
                              }}
                              className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">Start period</label>
                            <input 
                              type="text" 
                              placeholder="YYYY-MM"
                              value={exp.startDate}
                              onChange={e => {
                                setData(prev => ({
                                  ...prev,
                                  experiences: prev.experiences.map(x => x.id === exp.id ? { ...x, startDate: e.target.value } : x)
                                }));
                              }}
                              className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">Termination Date / Present</label>
                            <div className="flex gap-2 items-center">
                              <input 
                                type="text"
                                placeholder={exp.current ? "Present" : "YYYY-MM"}
                                disabled={exp.current}
                                value={exp.current ? "" : exp.endDate}
                                onChange={e => {
                                  setData(prev => ({
                                    ...prev,
                                    experiences: prev.experiences.map(x => x.id === exp.id ? { ...x, endDate: e.target.value } : x)
                                  }));
                                }}
                                className="flex-1 bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                              />
                              <label className="flex items-center gap-1 text-[11px] text-slate-400 cursor-pointer shrink-0">
                                <input 
                                  type="checkbox" 
                                  checked={exp.current}
                                  onChange={e => {
                                    setData(prev => ({
                                      ...prev,
                                      experiences: prev.experiences.map(x => x.id === exp.id ? { ...x, current: e.target.checked, endDate: e.target.checked ? "" : "2024-05" } : x)
                                    }));
                                  }}
                                  className="rounded border-white/10 text-indigo-600 focus:ring-0 bg-slate-950" 
                                />
                                Present
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Bullets Sub-record List */}
                        <div className="space-y-3 pt-2 border-t border-white/5">
                          <div className="flex justify-between items-center">
                            <span className="text-[11px] font-bold text-slate-300 uppercase tracking-widest font-mono">Bullet Accomplishments</span>
                            <button 
                              type="button"
                              onClick={() => addExperienceBullet(exp.id)}
                              className="text-[10px] text-indigo-400 hover:text-indigo-300 font-mono underline"
                            >
                              + Add Achievement
                            </button>
                          </div>

                          <div className="space-y-2.5">
                            {exp.bullets.map((bullet, idx) => (
                              <div key={idx} className="flex gap-2 items-start bg-slate-950/40 p-2 rounded-lg border border-white/5">
                                <textarea
                                  value={bullet}
                                  onChange={e => updateExperienceBullet(exp.id, idx, e.target.value)}
                                  rows={2}
                                  className="flex-1 bg-transparent text-xs text-slate-200 focus:outline-none resize-none px-1"
                                />
                                
                                <div className="flex flex-col gap-1.5 shrink-0 justify-end h-full">
                                  {/* Delete bullet button */}
                                  <button
                                    onClick={() => removeExperienceBullet(exp.id, idx)}
                                    className="p-1 hover:text-rose-400 text-slate-500 transition-colors"
                                    title="Delete Bullet"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                  {/* AI helper sparkle button */}
                                  <button
                                    onClick={() => handleAIImproveBullet(exp.id, bullet, idx)}
                                    disabled={improvingBulletId?.expId === exp.id && improvingBulletId?.index === idx}
                                    className="p-1 text-slate-400 hover:text-indigo-400 bg-slate-900 border border-white/10 rounded transition-all flex items-center justify-center cursor-pointer"
                                    title="AI Professional Polish"
                                  >
                                    {improvingBulletId?.expId === exp.id && improvingBulletId?.index === idx ? (
                                      <RefreshCw size={11} className="animate-spin text-indigo-400" />
                                    ) : (
                                      <Sparkles size={11} className="text-indigo-400" />
                                    )}
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TABS CONTENT: EDUCATION */}
            {activeTab === "education" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Education Degrees</h3>
                    <p className="text-[11px] text-slate-500">Undergraduate, postgraduate academic achievements</p>
                  </div>
                  <button 
                    onClick={addEducation}
                    className="text-xs bg-indigo-650 hover:bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Plus size={14} /> Add Education
                  </button>
                </div>

                {data.education.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                    <GraduationCap className="mx-auto text-slate-600 mb-3" size={28} />
                    <p className="text-xs text-slate-400">No education entries listed yet</p>
                    <button onClick={addEducation} className="text-xs text-indigo-400 font-bold underline mt-1">Add education card</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.education.map((edu) => (
                      <div key={edu.id} className="border border-white/5 bg-white/[0.01] p-4 rounded-xl space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-mono bg-indigo-500/10 text-indigo-400 px-2.5 py-0.5 rounded-md font-semibold font-mono">
                            Academic Track
                          </span>
                          <button 
                            onClick={() => removeEducation(edu.id)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Delete education track"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">Degree</label>
                            <input 
                              type="text" 
                              value={edu.degree}
                              placeholder="e.g. Master of Science"
                              onChange={e => {
                                setData(prev => ({
                                  ...prev,
                                  education: prev.education.map(x => x.id === edu.id ? { ...x, degree: e.target.value } : x)
                                }));
                              }}
                              className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">Field of Study</label>
                            <input 
                              type="text" 
                              value={edu.fieldOfStudy}
                              placeholder="e.g. Computer Science"
                              onChange={e => {
                                setData(prev => ({
                                  ...prev,
                                  education: prev.education.map(x => x.id === edu.id ? { ...x, fieldOfStudy: e.target.value } : x)
                                }));
                              }}
                              className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">Institution / University</label>
                            <input 
                              type="text" 
                              value={edu.institution}
                              placeholder="Stanford University"
                              onChange={e => {
                                setData(prev => ({
                                  ...prev,
                                  education: prev.education.map(x => x.id === edu.id ? { ...x, institution: e.target.value } : x)
                                }));
                              }}
                              className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-slate-400 uppercase">Start year</label>
                              <input 
                                type="text" 
                                placeholder="YYYY"
                                value={edu.startDate}
                                onChange={e => {
                                  setData(prev => ({
                                    ...prev,
                                    education: prev.education.map(x => x.id === edu.id ? { ...x, startDate: e.target.value } : x)
                                  }));
                                }}
                                className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-mono text-slate-400 uppercase">End Year</label>
                              <input 
                                type="text" 
                                placeholder="YYYY"
                                value={edu.endDate}
                                onChange={e => {
                                  setData(prev => ({
                                    ...prev,
                                    education: prev.education.map(x => x.id === edu.id ? { ...x, endDate: e.target.value } : x)
                                  }));
                                }}
                                className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">Academic Score (Optional)</label>
                            <input 
                              type="text" 
                              value={edu.score}
                              placeholder="GPA 3.8 / First Class"
                              onChange={e => {
                                setData(prev => ({
                                  ...prev,
                                  education: prev.education.map(x => x.id === edu.id ? { ...x, score: e.target.value } : x)
                                }));
                              }}
                              className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TABS CONTENT: KEY PROJECTS */}
            {activeTab === "projects" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Released Products & Code Repos</h3>
                    <p className="text-[11px] text-slate-500">Perfect to display dynamic layout showcases</p>
                  </div>
                  <button 
                    onClick={addProject}
                    className="text-xs bg-indigo-650 hover:bg-indigo-600 text-white font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-all"
                  >
                    <Plus size={14} /> Add Project Check
                  </button>
                </div>

                {data.projects.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-white/5 rounded-2xl">
                    <Code className="mx-auto text-slate-600 mb-3" size={28} />
                    <p className="text-xs text-slate-400">No project logs yet</p>
                    <button onClick={addProject} className="text-xs text-indigo-400 font-bold underline mt-1">Add product showcase</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.projects.map((proj) => (
                      <div key={proj.id} className="border border-white/5 bg-white/[0.01] p-4 rounded-xl space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] uppercase font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-md font-semibold font-mono">
                            PROJ_STABILIZER
                          </span>
                          <button 
                            onClick={() => removeProject(proj.id)}
                            className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 p-1.5 rounded-lg transition-colors cursor-pointer"
                            title="Delete project card"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">Project Title Name</label>
                            <input 
                              type="text" 
                              value={proj.title}
                              onChange={e => {
                                setData(prev => ({
                                  ...prev,
                                  projects: prev.projects.map(x => x.id === proj.id ? { ...x, title: e.target.value } : x)
                                }));
                              }}
                              className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">Technologies (comma separated)</label>
                            <input 
                              type="text" 
                              value={proj.technologies.join(", ")}
                              placeholder="React, Redis, Rust"
                              onChange={e => {
                                const cleanArr = e.target.value.split(",").map(item => item.trim());
                                setData(prev => ({
                                  ...prev,
                                  projects: prev.projects.map(x => x.id === proj.id ? { ...x, technologies: cleanArr } : x)
                                }));
                              }}
                              className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="space-y-1 md:col-span-2">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">Brief Highlights Description</label>
                            <textarea
                              rows={2}
                              value={proj.description}
                              onChange={e => {
                                setData(prev => ({
                                  ...prev,
                                  projects: prev.projects.map(x => x.id === proj.id ? { ...x, description: e.target.value } : x)
                                }));
                              }}
                              className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">Deployment Link (Live Demo)</label>
                            <input 
                              type="text" 
                              placeholder="https://yourdomain.com/app"
                              value={proj.link || ""}
                              onChange={e => {
                                setData(prev => ({
                                  ...prev,
                                  projects: prev.projects.map(x => x.id === proj.id ? { ...x, link: e.target.value } : x)
                                }));
                              }}
                              className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-mono text-slate-400 uppercase">GitHub Source Repo Link</label>
                            <input 
                              type="text" 
                              placeholder="https://github.com/profile/repo"
                              value={proj.github || ""}
                              onChange={e => {
                                setData(prev => ({
                                  ...prev,
                                  projects: prev.projects.map(x => x.id === proj.id ? { ...x, github: e.target.value } : x)
                                }));
                              }}
                              className="w-full bg-slate-900 border border-white/15 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TABS CONTENT: CORE SKILLS */}
            {activeTab === "skills" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-2">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Expertise Domain Tags</h3>
                    <p className="text-[11px] text-slate-500">Add dynamic tags which index best inside ATS scanners</p>
                  </div>
                </div>

                {/* AI SKILL RECOMMENDATOR ENGINE */}
                <div className="bg-gradient-to-tr from-[#141521] to-[#1a132e] border border-indigo-500/10 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="text-indigo-400 animate-pulse" size={17} />
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider font-mono">
                        AI Skill Recommender Engine
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={suggestAISkills}
                      disabled={aiSuggestingSkills || !data.personal.title}
                      className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer flex items-center gap-1"
                    >
                      {aiSuggestingSkills ? (
                        <RefreshCw className="animate-spin text-white" size={11} />
                      ) : (
                        "Analyze Job Role"
                      )}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-normal">
                    Let Gemini read your current job title (<strong className="text-indigo-300">{data.personal.title || "Not specified yet"}</strong>) and automatically supply high-demand engineering credentials.
                  </p>
                </div>

                <form onSubmit={handleAddSkillTag} className="flex gap-2.5">
                  <input 
                    type="text"
                    value={tempSkillInput}
                    onChange={e => setTempSkillInput(e.target.value)}
                    placeholder="Enter competency (e.g. Next.js, Kubernetes)"
                    className="flex-1 bg-slate-900 border border-white/10 rounded-lg px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                  <button 
                    type="submit"
                    className="bg-indigo-650 hover:bg-indigo-600 px-4 py-2.5 text-xs text-white font-bold rounded-lg cursor-pointer"
                  >
                    Add tag
                  </button>
                </form>

                <div className="flex flex-wrap gap-2 pt-2">
                  {data.skills.map((skill, i) => (
                    <span 
                      key={i} 
                      className="inline-flex items-center gap-1.5 text-xs pl-3 pr-2 py-1.5 bg-slate-900 hover:border-slate-500 border border-white/5 rounded-full text-slate-300 font-medium transition-colors"
                    >
                      {skill}
                      <button 
                        type="button" 
                        onClick={() => removeSkillTag(skill)}
                        className="text-slate-500 hover:text-rose-400 p-0.5 rounded-full hover:bg-slate-800"
                      >
                        <Trash2 size={11} />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* TABS CONTENT: LANGUAGES & CERTIFICATES */}
            {activeTab === "extras" && (
              <div className="space-y-6">
                {/* Certifications Dynamic module */}
                <div className="space-y-4">
                  <div className="flex justify-between items-center border-b border-white/10 pb-2">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Industry Certifications</h3>
                      <p className="text-[11px] text-slate-500">Security certifications, cloud credentials</p>
                    </div>
                    <button 
                      onClick={() => {
                        const newCert: Certification = {
                          id: `cert-${Date.now()}`,
                          name: "Google Cloud Professional Architect",
                          issuer: "Google",
                          date: "2024-02"
                        };
                        setData(prev => ({ ...prev, certifications: [...prev.certifications, newCert] }));
                        showStatus("Added certification card.");
                      }}
                      className="text-[11px] text-indigo-400 font-bold underline"
                    >
                      + Add credentials
                    </button>
                  </div>

                  {data.certifications.length > 0 && (
                    <div className="space-y-3">
                      {data.certifications.map((cert) => (
                        <div key={cert.id} className="flex gap-2.5 items-center bg-slate-950/40 border border-white/5 px-3 py-2.5 rounded-xl">
                          <input 
                            type="text" 
                            value={cert.name} 
                            placeholder="Cert Name"
                            onChange={e => setData(prev => ({
                              ...prev,
                              certifications: prev.certifications.map(c => c.id === cert.id ? { ...c, name: e.target.value } : c)
                            }))}
                            className="bg-transparent text-xs text-white border-b border-transparent focus:border-indigo-500 pb-0.5 select-all focus:outline-none flex-grow"
                          />
                          <input 
                            type="text" 
                            value={cert.issuer} 
                            placeholder="GCP / AWS"
                            onChange={e => setData(prev => ({
                              ...prev,
                              certifications: prev.certifications.map(c => c.id === cert.id ? { ...c, issuer: e.target.value } : c)
                            }))}
                            className="bg-transparent text-xs text-slate-400 border-b border-transparent focus:border-indigo-500 pb-0.5 max-w-[100px] focus:outline-none"
                          />
                          <button 
                            type="button"
                            onClick={() => setData(prev => ({ ...prev, certifications: prev.certifications.filter(c => c.id !== cert.id) }))}
                            className="text-slate-500 hover:text-rose-400 p-1"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Languages Module */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex justify-between items-center pb-2">
                    <div>
                      <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Languages Spoken</h3>
                      <p className="text-[11px] text-slate-500">Native dialects or conversational languages</p>
                    </div>
                    <button 
                      onClick={() => {
                        const newLang: Language = {
                          id: `lang-${Date.now()}`,
                          name: "German",
                          proficiency: "Conversational"
                        };
                        setData(prev => ({ ...prev, languages: [...prev.languages, newLang] }));
                      }}
                      className="text-[11px] text-indigo-400 font-bold underline"
                    >
                      + Add Fluent language
                    </button>
                  </div>

                  <div className="space-y-3">
                    {data.languages.map((lang) => (
                      <div key={lang.id} className="flex gap-4 items-center justify-between bg-slate-950/20 px-3 py-2 rounded-xl border border-white/5">
                        <input 
                          type="text"
                          value={lang.name}
                          onChange={e => setData(prev => ({
                            ...prev,
                            languages: prev.languages.map(l => l.id === lang.id ? { ...l, name: e.target.value } : l)
                          }))}
                          className="bg-transparent text-xs text-white focus:outline-none max-w-[120px]"
                        />

                        <select
                          value={lang.proficiency}
                          onChange={e => setData(prev => ({
                            ...prev,
                            languages: prev.languages.map(l => l.id === lang.id ? { ...l, proficiency: e.target.value as any } : l)
                          }))}
                          className="bg-slate-900 border border-white/10 text-[11px] px-2.5 py-1 text-slate-300 focus:outline-none"
                        >
                          <option value="Native">Native</option>
                          <option value="Fluent">Fluent</option>
                          <option value="Professional">Professional</option>
                          <option value="Conversational">Conversational</option>
                          <option value="Basic">Basic</option>
                        </select>

                        <button 
                          onClick={() => setData(prev => ({ ...prev, languages: prev.languages.filter(l => l.id !== lang.id) }))}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "export-tab" && (
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">Export Standalone HTML</h3>
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-emerald-400 font-mono font-bold">LOCAL_SAVE</span>
                </div>

                <div className="border border-white/5 bg-white/[0.01] rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-400">
                      <Code size={20} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">Zero-Dependency Bundle</h4>
                      <p className="text-[10px] text-slate-400">Perfect for hosting, offline reading, or email attachments</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">
                    This compiler generates a singular, standalone <strong className="text-white">HTML file</strong> containing both your customized interactive Web Portfolio and your chosen classical Printable Resume.
                  </p>

                  <ul className="space-y-2 border-t border-white/5 pt-3">
                    <li className="flex gap-2.5 items-start text-xs text-slate-400">
                      <span className="text-emerald-400 select-none">✓</span>
                      <span>Includes chosen template layouts and current typography.</span>
                    </li>
                    <li className="flex gap-2.5 items-start text-xs text-slate-400">
                      <span className="text-emerald-400 select-none">✓</span>
                      <span>Embeds your profile photo natively as inline code (Data URL base64).</span>
                    </li>
                    <li className="flex gap-2.5 items-start text-xs text-slate-400">
                      <span className="text-emerald-400 select-none">✓</span>
                      <span>Supports offline desktop launch (no server required to open).</span>
                    </li>
                  </ul>

                  <button
                    onClick={handleDownloadHTML}
                    className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white py-3 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-[0.99] duration-100 cursor-pointer mt-2"
                  >
                    <Download size={15} />
                    Download Standalone Website HTML
                  </button>
                </div>

                {/* COPY SOURCE CODE SECTION */}
                <div className="border border-white/5 bg-slate-950/40 rounded-xl p-5 space-y-3">
                  <span className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-widest block">RAW HTML CONTENT SOURCE</span>
                  <p className="text-[11px] text-slate-500">
                    Directly copy the complete produced source code into your custom `index.html` file to deploy on GitHub Pages or hosting panels.
                  </p>
                  
                  <button
                    type="button"
                    onClick={() => {
                      const completeHTML = generateHTML(data, settings);
                      navigator.clipboard.writeText(completeHTML);
                      showStatus("Entire Standalone HTML code copied to clipboard!", "success");
                    }}
                    className="bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 py-1.5 px-3 rounded-lg text-xs font-semibold cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Copy size={12} />
                    Copy Standalone HTML Code
                  </button>
                </div>
              </div>
            )}

          </div>
        </section>

        {/* RIGHT COLUMN: INTERACTIVE PREVIEW PANEL (RESUME OR PORTFOLIO PORTAL) */}
        <section className="w-full xl:w-[52%] bg-[#0A0B0E] flex flex-col overflow-y-auto relative border-t xl:border-t-0 border-white/5 px-4 sm:px-8 py-6 print:w-full print:bg-white print:p-0 print:border-none">
          
          {/* Quick Toolbar (no-print) */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center bg-[#0d0e15] border border-white/5 p-4 rounded-xl mb-6 shadow-xl no-print">
            <div className="flex flex-wrap items-center gap-4">
              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block uppercase animate-pulse">Select Layout</span>
                <select 
                  value={settings.templateId} 
                  onChange={e => setSettings(prev => ({ ...prev, templateId: e.target.value as TemplateId }))}
                  className="bg-slate-900 border border-white/10 text-[11px] px-2 py-1 rounded text-white font-mono cursor-pointer"
                >
                  <option value="slate-professional">Slate Professional (Modern)</option>
                  <option value="minimalist-tech">Minimalist Tech (ASCII Style)</option>
                  <option value="executive-serif">Executive Serif (Classic Formal)</option>
                  <option value="creative-gradient">Creative Split-Sidebar (Stunning Visual)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Print Size</span>
                <select 
                  value={settings.spacingClass || "compact"} 
                  onChange={e => setSettings(prev => ({ ...prev, spacingClass: e.target.value as "compact" | "normal" | "spacious" }))}
                  className="bg-slate-900 border border-white/10 text-[11px] px-2 py-1 rounded text-white font-mono cursor-pointer"
                >
                  <option value="compact">Ultra-Fit (1-Pg)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Font Scale</span>
                <select 
                  value={settings.fontSize || "normal"} 
                  onChange={e => setSettings(prev => ({ ...prev, fontSize: e.target.value as "compact" | "normal" | "spacious" }))}
                  className="bg-slate-900 border border-white/10 text-[11px] px-2 py-1 rounded text-white font-mono cursor-pointer"
                >
                  <option value="compact">Compact text</option>
                  <option value="normal">Standard text</option>
                  <option value="spacious">Larger text</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-[10px] text-slate-500 font-mono block uppercase">Accent Color</span>
                <div className="flex gap-1.5 pt-0.5">
                  {["indigo", "emerald", "rose", "sky", "amber", "slate"].map((c) => (
                    <button
                      key={c}
                      onClick={() => setSettings(prev => ({ ...prev, accentColor: c }))}
                      className={`w-3.5 h-3.5 rounded-full border transition-all ${
                        settings.accentColor === c ? "border-white scale-110 ring-2 ring-indigo-500/30" : "border-transparent"
                      } ${
                        c === "indigo" ? "bg-indigo-500" :
                        c === "emerald" ? "bg-emerald-500" :
                        c === "rose" ? "bg-rose-500" :
                        c === "sky" ? "bg-sky-500" :
                        c === "amber" ? "bg-amber-500" : "bg-slate-700"
                      }`}
                      title={`Switch to ${c}`}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 self-end sm:self-auto">
              <button
                onClick={handlePrint}
                className="bg-white/10 hover:bg-white/20 text-white border border-white/10 px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                title="Open system print options"
              >
                <Printer size={13} />
                <span>Print & Save PDF</span>
              </button>

              <button
                onClick={handleDownloadPNG}
                disabled={isDownloading}
                className="bg-emerald-650 hover:bg-emerald-650 text-white px-3.5 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-emerald-950/40 hover:scale-[1.02] cursor-pointer disabled:opacity-50"
                title="Download high-resolution image of your resume"
              >
                {isDownloading ? (
                  <RefreshCw size={13} className="animate-spin" />
                ) : (
                  <FileImage size={13} />
                )}
                <span>{isDownloading ? "Compiling..." : "Download PNG"}</span>
              </button>
            </div>
          </div>

          {/* VIEW MODE TABS SELECTOR */}
          <div className="flex bg-[#0d0e15] border border-white/5 p-1 rounded-xl mb-4 gap-1 no-print">
            <button
              onClick={() => setViewMode("resume")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium font-mono transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                viewMode === "resume" ? "bg-indigo-600 text-white shadow font-semibold" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              📄 ATS Resume
            </button>
            <button
              onClick={() => setViewMode("image-preview")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium font-mono transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                viewMode === "image-preview" ? "bg-indigo-600 text-white shadow font-semibold" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              🖼️ Image Preview
            </button>
            <button
              onClick={() => setViewMode("portfolio")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium font-mono transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                viewMode === "portfolio" ? "bg-indigo-600 text-white shadow font-semibold" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              🌐 Portfolio
            </button>
            <button
              onClick={() => setViewMode("android")}
              className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium font-mono transition-all text-center cursor-pointer flex items-center justify-center gap-1.5 ${
                viewMode === "android" ? "bg-indigo-600 text-white shadow font-semibold" : "text-slate-400 hover:text-white hover:bg-white/5"
              }`}
            >
              📱 Mobile App
            </button>
          </div>

          <div className="print:hidden h-2 relative mb-2 select-none flex justify-center items-center gap-1">
            <span className="h-0.5 w-16 bg-white/5 rounded"></span>
            <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">PREVIEW SCREEN LAYER</span>
            <span className="h-0.5 w-16 bg-white/5 rounded"></span>
          </div>

          {/* PREVIEW CONTAINER ACCENT BOARD */}
          <div className="flex-1 bg-white/5 border border-white/5 rounded-2xl relative overflow-hidden flex flex-col shadow-2xl print:bg-white print:border-none print:shadow-none print_full">
            
            {/* 1. RESUME MODE VIEWER */}
            {viewMode === "resume" && (
              <div className="bg-slate-900/40 p-1 sm:p-5 flex-1 overflow-x-auto print:p-0 print:bg-white print_full">
                <div id="resume-preview-card" className="max-w-[800px] mx-auto overflow-hidden rounded-xl border border-white/5 shadow-2xl print:border-none print:shadow-none print:rounded-none">
                  {settings.templateId === "slate-professional" && (
                    <SlateProfessionalTemplate data={data} settings={settings} />
                  )}
                  {settings.templateId === "minimalist-tech" && (
                    <MinimalistTechTemplate data={data} settings={settings} />
                  )}
                  {settings.templateId === "executive-serif" && (
                    <ExecutiveSerifTemplate data={data} settings={settings} />
                  )}
                  {settings.templateId === "creative-gradient" && (
                    <CreativeGradientTemplate data={data} settings={settings} />
                  )}
                </div>
              </div>
            )}

            {/* 1.1 IMAGE PREVIEW MODE VIEWER */}
            {viewMode === "image-preview" && (
              <div className="bg-slate-950 p-4 sm:p-8 flex-grow flex flex-col items-center justify-start overflow-y-auto min-h-[400px]">
                {/* Header controls for Image Mode */}
                <div className="w-full max-w-[550px] mb-4 flex justify-between items-center bg-white/5 border border-white/10 p-3 rounded-lg">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-100">A4 Document Snapshot</span>
                    <span className="text-[10px] text-slate-400">High-fidelity static PNG rendering</span>
                  </div>
                  <button
                    onClick={() => {
                      const element = document.getElementById("resume-preview-card");
                      if (element) {
                        handleDownloadPNG();
                      }
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs px-2.5 py-1.5 rounded transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <FileImage size={12} />
                    Download PNG
                  </button>
                </div>

                {isGeneratingPreview ? (
                  <div className="flex-1 flex flex-col justify-center items-center gap-2 py-20 text-slate-400">
                    <RefreshCw size={24} className="animate-spin text-indigo-500" />
                    <span className="text-xs font-mono animate-pulse">Generating static rendering...</span>
                  </div>
                ) : imagePreviewUrl ? (
                  <div className="relative group max-w-[550px] w-full border border-white/15 rounded-lg shadow-2xl bg-white overflow-hidden transition-all duration-300">
                    <img 
                      src={imagePreviewUrl} 
                      alt="Resume Image Snapshot" 
                      className="w-full h-auto object-contain antialiased select-none"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                      <button
                        onClick={() => handleDownloadPNG()}
                        className="bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs px-4 py-2.5 rounded-lg shadow transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105"
                      >
                        <FileImage size={14} />
                        Get PNG Picture
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex-grow flex flex-col justify-center items-center gap-3 py-20 text-center px-4">
                    <div className="text-4xl text-slate-500">🖨️</div>
                    <span className="text-xs text-slate-400 max-w-sm leading-relaxed">
                      Go to the <button onClick={() => setViewMode("resume")} className="text-indigo-400 underline font-semibold whitespace-nowrap">ATS Resume Tab</button> first to initialize, then switch back to generate your image frame.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* 2. PORTFOLIO WEBSITE MODE VIEWER */}
            {viewMode === "portfolio" && (
              <div className="bg-[#0b0c10] text-[#c5c6c7] p-8 flex-1 flex flex-col justify-between selection:bg-cyan-500/20 selection:text-white relative">
                
                {/* Visual grid accent glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_15%,#1d283b_0%,transparent_50%)] opacity-30 pointer-events-none"></div>

                {/* Portfolio mock header */}
                <nav className="flex justify-between items-center pb-6 border-b border-slate-800 relative z-10 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm tracking-wider uppercase font-mono">&gt; {data.personal.fullName?.split(" ")[0] || "Rivera"}.dev_</span>
                  </div>
                  <div className="flex gap-4 text-slate-400 font-mono font-medium">
                    <a href="#about" className="hover:text-cyan-400 transition-colors">./About</a>
                    <a href="#projects" className="hover:text-cyan-400 transition-colors">./Projects</a>
                    <a href="#skills" className="hover:text-cyan-400 transition-colors">./Competencies</a>
                    <a href="#contact" className="hover:text-cyan-400 transition-colors">./Contact</a>
                  </div>
                </nav>

                {/* Main Hero bio Section */}
                <div className="my-10 space-y-5 relative z-10 max-w-xl">
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-cyan-500/10 border border-cyan-500/20 text-[10px] font-bold text-cyan-400 tracking-wider">
                    <span>AVAILABLE FOR REMOTE ROLES</span>
                  </div>

                  <h1 className="text-4xl font-extrabold tracking-tight text-white leading-none">
                    Hi, I'm <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">{data.personal.fullName || "Your Name"}</span>.
                  </h1>
                  <p className="text-lg font-semibold text-slate-300 tracking-tight">
                    {data.personal.title || "Elite Engineering Professional"}
                  </p>
                  
                  <p className="text-sm text-slate-450 leading-relaxed font-sans mt-2">
                    {data.personal.summary || "This section links dynamically from your custom CV Summary. Use our AI Summary assist to formulate rich career descriptions in one click."}
                  </p>

                  <div className="flex flex-wrap gap-4 text-xs font-mono pt-3 gap-y-2">
                    {data.personal.email && (
                      <span className="text-slate-400">
                        <strong className="text-white">EMAIL:</strong> {data.personal.email}
                      </span>
                    )}
                    {data.personal.location && (
                      <span className="text-slate-400">
                        <strong className="text-white">HQ:</strong> {data.personal.location}
                      </span>
                    )}
                  </div>
                </div>

                {/* Grid Projects in Portfolio view */}
                <div id="projects" className="space-y-4 pt-4 border-t border-slate-900 relative z-10">
                  <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">
                    // Selected Engineering Case Studies
                  </h3>
                  
                  {data.projects.length === 0 ? (
                    <p className="text-xs text-slate-500 italic">No projects visible. Turn on projects or add list tags to populate this card layout.</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {data.projects.map((proj) => (
                        <div key={proj.id} className="bg-[#12141c]/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 hover:bg-[#151824] transition-all">
                          <div>
                            <span className="text-[9px] uppercase font-mono text-cyan-400 tracking-widest block mb-1">RELEASE LOG</span>
                            <h4 className="font-bold text-white text-sm">{proj.title}</h4>
                            <p className="text-xs text-slate-400 mt-1 lines-clamp-3 leading-normal">{proj.description}</p>
                          </div>
                          
                          <div className="mt-4 pt-3 border-t border-slate-900/60">
                            <div className="flex flex-wrap gap-1 mb-2">
                              {proj.technologies.map((t, idx) => (
                                <span key={idx} className="text-[10px] font-mono bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                                  {t}
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-3 text-[10px] font-mono text-slate-500 mt-2">
                              {proj.link && <span className="hover:text-white cursor-pointer">&gt; live_url</span>}
                              {proj.github && <span className="hover:text-white cursor-pointer">&gt; source_code</span>}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Experience History under Portfolio view */}
                {data.experiences.length > 0 && (
                  <div className="space-y-4 mt-8 pt-4 border-t border-slate-900 relative z-10">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono">
                      // Professional Tenure Timeline
                    </h3>
                    <div className="space-y-4">
                      {data.experiences.slice(0, 2).map((exp, index) => (
                        <div key={index} className="flex gap-4 items-start select-none">
                          <span className="text-xs text-cyan-400 font-mono pt-1">0{index+1}.</span>
                          <div>
                            <p className="text-xs font-bold text-white font-mono">{exp.role} @ {exp.company}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5 uppercase tracking-wide">Period: {exp.startDate} - {exp.current ? "Active Tenure" : exp.endDate}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skill Keywords container */}
                {data.skills.length > 0 && (
                  <div className="mt-8 pt-4 border-t border-slate-900 relative z-10">
                    <h3 className="text-xs font-bold text-white uppercase tracking-widest font-mono mb-3">
                      // Professional Domain Stack
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {data.skills.slice(0, 15).map((skill, idx) => (
                        <span key={idx} className="text-xs bg-slate-900 border border-slate-800 text-slate-300 px-2.5 py-1 rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact visual component */}
                <div id="contact" className="mt-8 border border-cyan-500/15 bg-cyan-950/5 p-6 rounded-2xl relative overflow-hidden z-10 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <h4 className="text-sm font-bold text-white font-mono uppercase">Let's build a masterpiece next</h4>
                    <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">Reach out directly or check the standard channels to discuss remote technical contracts.</p>
                  </div>
                  <button 
                    onClick={() => {
                      if (data.personal.email) {
                        window.location.href = `mailto:${data.personal.email}`;
                      } else {
                        showStatus("Configure email contact details to utilize mail trigger.", "error");
                      }
                    }}
                    className="bg-cyan-500 hover:bg-cyan-400 text-[#0c0d12] font-bold text-xs px-4 py-2 rounded-lg cursor-pointer transition-all shrink-0 hover:scale-[1.02]"
                  >
                    Send Direct Mail
                  </button>
                </div>

                {/* Port mock footer */}
                <div className="pt-8 mt-8 border-t border-slate-900 text-[10px] text-slate-500 font-mono text-center flex justify-between uppercase">
                  <span>© {new Date().getFullYear()} FolioGen Systems INC</span>
                  <span>Responsive Web Portfolio Builder</span>
                </div>
              </div>
            )}

            {/* 3. SIMULATED RESUME MOBILE ANDROID APP PORTAL */}
            {viewMode === "android" && (() => {
              const aThemes = {
                indigo: { primary: "bg-indigo-600", text: "text-indigo-400", border: "border-indigo-600/30", bgSoft: "bg-indigo-50", textSoft: "text-indigo-700", accent: "bg-indigo-100 text-indigo-800", ring: "ring-indigo-600" },
                emerald: { primary: "bg-emerald-600", text: "text-emerald-400", border: "border-emerald-600/30", bgSoft: "bg-emerald-50", textSoft: "text-emerald-700", accent: "bg-emerald-100 text-emerald-800", ring: "ring-emerald-600" },
                rose: { primary: "bg-rose-500", text: "text-rose-400", border: "border-rose-500/30", bgSoft: "bg-rose-50", textSoft: "text-rose-700", accent: "bg-rose-100 text-rose-800", ring: "ring-rose-500" },
                sky: { primary: "bg-sky-600", text: "text-sky-400", border: "border-sky-600/30", bgSoft: "bg-sky-50", textSoft: "text-sky-700", accent: "bg-sky-100 text-sky-800", ring: "ring-sky-600" },
                amber: { primary: "bg-amber-500", text: "text-amber-500", border: "border-amber-500/30", bgSoft: "bg-amber-50", textSoft: "text-amber-900", accent: "bg-amber-100 text-amber-905", ring: "ring-amber-500" }
              };
              const theme = aThemes[androidTheme] || aThemes.indigo;
              const themeName = androidTheme.charAt(0).toUpperCase() + androidTheme.slice(1);

              return (
                <div className="bg-[#0b0d14]/75 p-3 sm:p-8 flex-1 flex flex-col items-center justify-center selection:bg-slate-800 select-none">
                  
                  {/* Smartphone Frame Wrapper */}
                  <div className="w-full max-w-[390px] bg-[#1e2025] rounded-[48px] p-3.5 border-[8px] border-slate-800 shadow-2xl relative">
                    
                    {/* Device Camera Island cut-out */}
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-24 h-5 bg-black rounded-full z-30 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900 absolute right-3 border border-slate-800 animate-pulse"></div>
                    </div>

                    {/* Smartphone Screen container */}
                    <div className="w-full bg-[#f1f2f6] rounded-[36px] overflow-hidden flex flex-col min-h-[600px] text-slate-800 border border-[#2d2f35] relative">
                      
                      {/* Android Notification Signal System Bar */}
                      <div className="h-8 bg-slate-900 flex justify-between px-5 items-center text-[10px] text-slate-300 relative z-20 font-bold">
                        <span className="font-mono">09:41</span>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3c-4.97 0-9 4.03-9 9c0 2.12.74 4.07 1.97 5.61L4.35 19.4a1 1 0 0 0 1.41 1.41l1.79-1.79C9.09 19.61 10.49 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6s6 2.69 6 6s-2.69 6-6 6z"/></svg>
                          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M2 22h20V2z"/></svg>
                          <span className="text-[9px] font-mono whitespace-nowrap pt-0.5">98%</span>
                        </div>
                      </div>

                      {/* Unified App top Navigation header */}
                      <div className={`p-4 ${theme.primary} text-white shadow relative overflow-hidden flex justify-between items-center`}>
                        <div>
                          <h2 className="text-[9px] font-mono opacity-85 uppercase tracking-wider font-extrabold leading-none">com.craftcv.companion</h2>
                          <h1 className="text-sm font-bold tracking-tight mt-0.5">CraftCV Android Profile</h1>
                        </div>
                        <span className="bg-white/10 rounded-full px-2.5 py-0.5 text-[9.5px] font-mono leading-none font-bold uppercase tracking-wider">{themeName} view</span>
                      </div>

                      {/* Material You Accent Color Switchboard selector */}
                      <div className="bg-white p-2.5 border-b border-slate-200.5 flex items-center justify-between text-xs font-semibold">
                        <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">Material DynamicAccent</span>
                        <div className="flex gap-2.5">
                          {(["indigo", "emerald", "rose", "sky", "amber"] as const).map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setAndroidTheme(color)}
                              className={`w-4.5 h-4.5 rounded-full border transition-all cursor-pointer ${
                                androidTheme === color ? "ring-2 ring-indigo-505 border-white scale-110" : "border-slate-200"
                              } ${
                                color === "indigo" ? "bg-indigo-600" :
                                color === "emerald" ? "bg-emerald-600" :
                                color === "rose" ? "bg-rose-500" :
                                color === "sky" ? "bg-sky-500" : "bg-amber-500"
                              }`}
                            />
                          ))}
                        </div>
                      </div>

                      {/* INTERACTIVE COMPANION APP SCREEN AREA */}
                      <div className="flex-1 p-4 overflow-y-auto max-h-[420px] min-h-[380px]">
                        
                        {/* TAB HOME */}
                        {androidTab === "home" && (
                          <div className="space-y-4">
                            
                            {/* Profile Bio Card */}
                            <div className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-4 text-white shadow relative overflow-hidden">
                              <div className="flex items-center gap-3">
                                <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-slate-950 flex items-center justify-center shrink-0">
                                  {data.personal.photoUrl ? (
                                    <img src={data.personal.photoUrl} alt="Avatar" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                                  ) : (
                                    <span className="text-xs uppercase font-bold font-mono text-slate-400">CV</span>
                                  )}
                                </div>
                                <div>
                                  <h3 className="text-sm font-extrabold tracking-tight truncate max-w-[180px]">{data.personal.fullName || "Your Credentials"}</h3>
                                  <p className="text-[10px] text-slate-350 font-mono font-semibold truncate max-w-[180px]">{data.personal.title || "Full Stack Architect"}</p>
                                </div>
                              </div>
                              <div className="mt-4 pt-3 border-t border-white/10 flex justify-between items-center text-[10px] text-slate-400 font-mono">
                                <span>📍 {data.personal.location || "San Francisco"}</span>
                                <span className="text-emerald-400 flex items-center gap-1 font-bold">● Active APK</span>
                              </div>
                            </div>

                            {/* Objective text Card */}
                            <div className="bg-white rounded-xl p-3 border border-slate-150 shadow-sm space-y-1">
                              <span className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Executive Summary</span>
                              <p className="text-xs text-slate-700 leading-relaxed font-normal">
                                {data.personal.summary || "Define short personal highlights right on the editor to sync with this Material You container app."}
                              </p>
                            </div>

                            {/* Pop-up dialog actions */}
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                type="button"
                                onClick={() => setAndroidSheet({ open: true, title: "Android Mail Launcher", text: `Opening default mail client and drafting a professional message target to ${data.personal.email || 'alex@example.com'}...` })}
                                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 text-left rounded-xl transition-all cursor-pointer"
                              >
                                <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-mono">Email Address</span>
                                <span className="text-xs font-bold text-slate-800 truncate block">{data.personal.email || "alex@example.com"}</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => setAndroidSheet({ open: true, title: "Device Telephony Dialer", text: `Establishing responsive carrier routing target to phone support cell ${data.personal.phone || '+1555-019-2834'}...` })}
                                className="bg-slate-50 hover:bg-slate-100 border border-slate-200 p-2 text-left rounded-xl transition-all cursor-pointer"
                              >
                                <span className="text-[9px] text-slate-400 uppercase tracking-widest block font-mono">Phone Number</span>
                                <span className="text-xs font-bold text-slate-800 truncate block">{data.personal.phone || "Not Configured"}</span>
                              </button>
                            </div>

                            {/* Personal site link action */}
                            {data.personal.portfolioUrl && (
                              <div className="bg-white border rounded-xl p-3 flex justify-between items-center shadow-sm">
                                <div>
                                  <span className="text-[8px] font-mono text-slate-405 block uppercase">Personal Web Host</span>
                                  <span className="text-xs font-bold text-slate-800">{data.personal.portfolioUrl}</span>
                                </div>
                                <a href={data.personal.portfolioUrl} target="_blank" rel="noreferrer" className="text-xs font-semibold text-indigo-650 hover:underline shrink-0">Browse</a>
                              </div>
                            )}

                          </div>
                        )}

                        {/* TAB EXPERIENCE */}
                        {androidTab === "experience" && (
                          <div className="space-y-3">
                            <h4 className="text-[11px] uppercase font-bold text-slate-405 tracking-wider font-mono">Work Record Cards</h4>
                            {data.experiences.length === 0 ? (
                              <p className="text-xs text-slate-550 italic text-center py-6">Add work history credentials inside form sheets to display portfolio timeline charts.</p>
                            ) : data.experiences.map((exp) => (
                              <div key={exp.id} className="bg-white border p-3.5 rounded-xl space-y-2 shadow-sm">
                                <div className="flex justify-between items-start gap-1">
                                  <div>
                                    <h5 className="text-xs font-extrabold text-slate-905">{exp.role}</h5>
                                    <p className="text-[10px] text-slate-500">{exp.company}</p>
                                  </div>
                                  <span className="text-[8.5px] bg-slate-100 px-1.5 py-0.5 rounded font-mono font-bold shrink-0">{exp.startDate} - {exp.current ? "Active" : exp.endDate}</span>
                                </div>
                                <ul className="text-[10px] text-slate-650 space-y-1 pl-3 list-disc border-t border-slate-100 pt-2 leading-relaxed">
                                  {exp.bullets.map((b, i) => (
                                    <li key={i}>{b}</li>
                                  ))}
                                </ul>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* TAB PROJECTS */}
                        {androidTab === "projects" && (
                          <div className="space-y-3">
                            <h4 className="text-[11px] uppercase font-bold text-slate-405 tracking-wider font-mono">Simulated Projects Grid</h4>
                            {data.projects.length === 0 ? (
                              <p className="text-xs text-slate-550 italic text-center py-6 block">No projects listed. Populate your custom project tags to preview them.</p>
                            ) : data.projects.map((proj) => (
                              <div key={proj.id} className="bg-white border p-3 rounded-xl shadow-sm space-y-2">
                                <div className="flex justify-between items-center bg-slate-50 p-1.5 rounded-lg border">
                                  <span className="text-xs font-extrabold text-slate-905 truncate max-w-[150px]">{proj.title}</span>
                                  <button
                                    type="button"
                                    onClick={() => setAndroidSheet({ open: true, title: "Android Sandbox Emulator", text: `Executing clean assembly container test for ${proj.title}. Static analysis validates responsive web targets, CSS viewport flex-bases, and client memory allocations correctly.` })}
                                    className="bg-slate-900 hover:bg-slate-800 text-white font-mono text-[9px] font-bold px-2.5 py-1 rounded select-none uppercase tracking-widest cursor-pointer"
                                  >
                                    Simulate
                                  </button>
                                </div>
                                <p className="text-[10px] text-slate-655 leading-normal">{proj.description}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* TAB SKILLS */}
                        {androidTab === "skills" && (
                          <div className="space-y-3">
                            <h4 className="text-[11px] uppercase font-bold text-slate-405 tracking-wider font-mono">Domain Skill Chips</h4>
                            <div className="bg-white border rounded-xl p-3.5 space-y-1.5 shadow-sm">
                              <span className="text-[9px] font-mono text-slate-450 block uppercase tracking-wider">Indexed Competencies tags:</span>
                              <div className="flex flex-wrap gap-1.5">
                                {data.skills.length === 0 ? (
                                  <p className="text-xs text-slate-405">Add keywords under "Keywords / Skills" tab to view interactive dynamic chips.</p>
                                ) : data.skills.map((skill, idx) => (
                                  <span key={idx} className={`text-[11px] font-mono font-bold ${theme.accent} px-2.5 py-0.5 rounded-full`}>
                                    🏷️ {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* TAB APK BUILDER */}
                        {androidTab === "builder" && (
                          <div className="space-y-3.5">
                            <h4 className="text-[11px] uppercase font-bold text-slate-405 tracking-wider font-mono">Digital APK Compilation Panel</h4>
                            
                            <div className="bg-white border rounded-xl p-3 shadow-sm space-y-3">
                              <div className="space-y-1">
                                <span className="text-[9.5px] font-mono text-slate-400 uppercase font-bold block">Android APK Namespace</span>
                                <input
                                  type="text"
                                  disabled
                                  value={`com.craftcv.${data.personal.fullName ? data.personal.fullName.toLowerCase().replace(/\s+/g, '') : "portfolio"}`}
                                  className="w-full bg-slate-100 border border-slate-205 rounded px-2.5 py-1.5 text-xs text-slate-800 font-mono focus:outline-none"
                                />
                              </div>

                              <div className="pt-1.5">
                                {androidBuildProgress >= 0 ? (
                                  <div className="space-y-1.5">
                                    <div className="flex justify-between text-[10px] font-mono font-bold text-slate-700">
                                      <span>Gradle Package Assembly...</span>
                                      <span>{androidBuildProgress}%</span>
                                    </div>
                                    <div className="w-full bg-slate-100 border rounded-full h-2 overflow-hidden">
                                      <div className={`${theme.primary} h-full transition-all duration-300`} style={{ width: `${androidBuildProgress}%` }} />
                                    </div>
                                  </div>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={triggerAppBuildAndroid}
                                    className={`w-full ${theme.primary} text-white font-extrabold uppercase py-2.5 px-4 rounded-xl text-xs shadow-md transition-all uppercase tracking-wider font-mono cursor-pointer active:scale-98`}
                                  >
                                    Compile APK Release File
                                  </button>
                                )}
                              </div>
                            </div>

                            {/* Scrolling compilation console outputs */}
                            {androidBuildLogs.length > 0 && (
                              <div className="bg-black text-[#5eec08] font-mono text-[9px] p-2.5 rounded-xl border border-slate-800 shadow shadow-inner space-y-1 leading-relaxed">
                                <div className="flex justify-between text-white border-b border-white/10 pb-1 mb-2 uppercase tracking-wide text-[8px] font-bold">
                                  <span>Compile Terminal logs</span>
                                  <span className="animate-pulse">● processing</span>
                                </div>
                                <div className="space-y-1 max-h-[120px] overflow-y-auto">
                                  {androidBuildLogs.map((log, idx) => (
                                    <div key={idx}>{log}</div>
                                  ))}
                                </div>

                                {androidBuildProgress === 100 && (
                                  <div className="mt-3 pt-3 border-t border-white/15 flex gap-2">
                                    <button
                                      type="button"
                                      onClick={() => setAndroidSheet({ open: true, title: "Simulated Installation", text: "APK file package signed with self-signed certificate. Assembly code correctly bundles the HTML resume data structures onto high-speed mobile modules." })}
                                      className="bg-emerald-605 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1.5 text-[9.5px] rounded font-bold uppercase tracking-wider flex-1 transition-all cursor-pointer"
                                    >
                                      Package Info
                                    </button>
                                    <a
                                      href="resume.html"
                                      target="_blank"
                                      className="bg-white/10 hover:bg-white/20 text-white border border-white/15 px-2.5 py-1.5 text-[9.5px] rounded text-center font-bold uppercase tracking-wider transition-all"
                                    >
                                      Launch APK
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        )}

                      </div>

                      {/* Overlapping mobile bottom sheet modal inside the phone screen */}
                      {androidSheet.open && (
                        <div className="absolute inset-x-0 bottom-0 bg-black/45 z-35 flex flex-col justify-end transition-all">
                          <div className="bg-white p-5 rounded-t-[28px] border-t shadow-2xl relative animate-slide-up pb-6">
                            <div className="w-12 h-1 bg-slate-350 rounded-full mx-auto mb-4" />
                            <div className="font-sans text-slate-800">
                              <h4 className="text-sm font-bold text-slate-900 mb-2">{androidSheet.title}</h4>
                              <p className="text-xs text-slate-550 mb-5 leading-relaxed font-normal">{androidSheet.text}</p>
                              <button
                                type="button"
                                onClick={() => setAndroidSheet({ open: false, title: "", text: "" })}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2 rounded-lg text-xs transition-colors uppercase tracking-wider select-none cursor-pointer"
                              >
                                Close Sheet
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Material Design 3 Bottom Navigation bar */}
                      <div className="h-16 bg-slate-900 border-t border-white/5 flex justify-around items-center px-1 text-[8.5px] font-bold text-slate-400 z-30 select-none">
                        <button
                          type="button"
                          onClick={() => setAndroidTab("home")}
                          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${androidTab === "home" ? "text-white" : "hover:text-slate-200"}`}
                        >
                          <svg className="w-4.5 h-4.5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                          <span>App Home</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAndroidTab("experience")}
                          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${androidTab === "experience" ? "text-white" : "hover:text-slate-200"}`}
                        >
                          <svg className="w-4.5 h-4.5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4.674 1.255a23.91 23.91 0 01-2 0M12 11h.01" /></svg>
                          <span>Work Recs</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAndroidTab("projects")}
                          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${androidTab === "projects" ? "text-white" : "hover:text-slate-200"}`}
                        >
                          <svg className="w-4.5 h-4.5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                          <span>Projects</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAndroidTab("skills")}
                          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${androidTab === "skills" ? "text-white" : "hover:text-slate-200"}`}
                        >
                          <svg className="w-4.5 h-4.5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>
                          <span>Skills</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setAndroidTab("builder")}
                          className={`flex flex-col items-center justify-center flex-1 py-1 transition-all cursor-pointer ${androidTab === "builder" ? "text-white" : "hover:text-slate-200"}`}
                        >
                          <svg className="w-4.5 h-4.5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          <span>APK Builder</span>
                        </button>
                      </div>

                    </div>
                  </div>
                </div>
              );
            })()}

          </div>
        </section>

      </div>

      {/* REUSABLE AI ACCLAIMED BULLET MODAL */}
      {aiBulletModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#12141c] border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2">
              <Sparkles className="text-indigo-400 animate-pulse" size={18} />
              <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono">Gemini AI Resume Recommendation</h3>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-500 block uppercase">Original bullet</span>
              <p className="text-xs text-slate-400 italic bg-white/[0.02] p-2.5 rounded border border-white/5">
                "{aiBulletModal.original}"
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono text-indigo-400 block uppercase">Generated Recommendation (Strong Impact)</span>
              <p className="text-xs text-white font-semibold bg-indigo-500/10 p-3 rounded border border-indigo-500/20 leading-relaxed">
                "{aiBulletModal.improved}"
              </p>
            </div>

            <div className="space-y-1 bg-white/[0.02] p-3 rounded-lg border border-white/5">
              <span className="text-[10px] font-mono text-slate-400 block uppercase">Coaching Insight</span>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                {aiBulletModal.explanation}
              </p>
            </div>

            {aiBulletModal.altOptions && aiBulletModal.altOptions.length > 0 && (
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono text-slate-500 block uppercase">Alternative phrasing drafts:</span>
                <div className="space-y-1">
                  {aiBulletModal.altOptions.map((opt, i) => (
                    <button 
                      key={i}
                      onClick={() => setAiBulletModal(prev => prev ? { ...prev, improved: opt } : null)}
                      className="w-full text-left text-[11px] text-indigo-300 py-1 px-2.5 bg-slate-900 border border-white/5 hover:border-indigo-500/40 rounded transition-colors block leading-relaxed"
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2 text-xs font-semibold">
              <button 
                onClick={() => setAiBulletModal(null)}
                className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2 rounded-lg"
              >
                Cancel / Tweak
              </button>
              <button 
                onClick={() => applyAIImprovedBullet(aiBulletModal.improved)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg"
              >
                Confirm & Replace
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ATS SCORE FEEDBACK AUDIT FLOATING MODAL */}
      {showFeedbackModal && feedbackData && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 flex items-center justify-center p-4 select-none">
          <div className="bg-[#10121a] border border-white/10 rounded-2xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative overflow-hidden">
            
            {/* Elegant dark gradient backing highlights */}
            <div className="absolute top-0 right-0 p-4 text-[11px] font-mono text-slate-500">
              ATS SEC_LOG // V_2.0
            </div>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 bg-indigo-500/10 border border-indigo-500/35 rounded-lg flex items-center justify-center font-bold text-indigo-400">
                <Sparkles size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-widest font-mono">AI Coach ATS Grade Audit</h3>
                <p className="text-[10px] text-slate-550">Dynamic matching algorithms evaluate structural keywords strengths</p>
              </div>
            </div>

            {/* Overall Score Meter */}
            <div className="bg-slate-950/60 p-5 rounded-2xl border border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">MATCH SCORE RATE</span>
                <p className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-400">
                  {feedbackData.overallScore}% MATCH
                </p>
                <div className="w-48 h-1.5 bg-slate-800 rounded-full mt-2 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full" style={{ width: `${feedbackData.overallScore}%` }}></div>
                </div>
              </div>

              <div className="text-xs text-slate-400 sm:max-w-xs leading-relaxed font-sans mt-1">
                {feedbackData.feedbackParagraph}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-sans">
              <div className="space-y-2 bg-emerald-950/5 border border-emerald-500/10 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider block font-bold">✓ Solid Core Strengths</span>
                <ul className="space-y-1.5">
                  {feedbackData.strengths.map((str, i) => (
                    <li key={i} className="text-slate-350 flex items-start gap-1.5">
                      <Check size={11} className="text-emerald-400 shrink-0 mt-0.5" />
                      <span>{str}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-2 bg-indigo-950/5 border border-indigo-500/10 p-4 rounded-xl">
                <span className="text-[10px] font-mono text-indigo-405 uppercase tracking-wider block font-bold">✦ Priority Action Actions</span>
                <ul className="space-y-1.5">
                  {feedbackData.improvements.map((imp, i) => (
                    <li key={i} className="text-slate-350 flex items-start gap-1.5">
                      <span className="text-indigo-400 shrink-0 mt-0.5">✦</span>
                      <span>{imp}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {feedbackData.missingKeywords && feedbackData.missingKeywords.length > 0 && (
              <div className="space-y-2 bg-slate-900/30 p-4 rounded-xl border border-white/5">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">MISSING INTEGRITY KEYWORDS</span>
                <div className="flex flex-wrap gap-1.5">
                  {feedbackData.missingKeywords.map((key, i) => (
                    <span key={i} className="text-xs bg-[#101217] text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md">
                      + {key}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setShowFeedbackModal(false)}
                className="bg-white hover:bg-slate-200 text-black font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                Accept Recommendations
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
