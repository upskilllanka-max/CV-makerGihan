import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-loaded Google Gen AI client helper
let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not defined in the environment secrets.");
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiInstance;
}

// Ensure error response helper
function sendError(res: express.Response, error: any, message: string) {
  console.error(message, error);
  res.status(500).json({
    error: true,
    message: message,
    details: error instanceof Error ? error.message : String(error),
  });
}

// API Routes
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// 1. AI Resume Bullet Point Improver
app.post("/api/ai/improve-bullet-point", async (req, res) => {
  const { bulletPoint, jobTitle, industry } = req.body;

  if (!bulletPoint) {
    return res.status(400).json({ error: "bulletPoint is required." });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `You are an expert resume writer and career coach. Improve this resume bullet point to make it more impactful, metric-oriented, and action-verb focused.
Job Title: ${jobTitle || "Not Specified"}
Industry: ${industry || "Not Specified"}
Original Bullet Point: "${bulletPoint}"

Provide your output in structural JSON format:
{
  "improvedBullet": "The improved, high-impact bullet point starting with a strong action verb and including measurable outcomes if applicable.",
  "explanation": "Brief reasoning of what was changed and why (e.g. added action verb, emphasized metric, made concise).",
  "altOptions": ["Alternative option A", "Alternative option B"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedData = JSON.parse(response.text.trim());
    res.json(parsedData);
  } catch (error) {
    sendError(res, error, "Failed to improve bullet point with Gemini AI.");
  }
});

// 2. AI General Resume Summary Generator
app.post("/api/ai/generate-summary", async (req, res) => {
  const { keySkills, experienceLevel, jobTitle, tone } = req.body;

  if (!jobTitle) {
    return res.status(400).json({ error: "jobTitle is required." });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `You are an executive recruiter. Write a compelling, high-converting professional summary/bio for a resume.
Job Title: ${jobTitle}
Experience Level: ${experienceLevel || "Mid-Level"}
Key Skills: ${Array.isArray(keySkills) ? keySkills.join(", ") : keySkills || "Not Specified"}
Tone of voice: ${tone || "Professional, confident"}

Provide your output in standard JSON format:
{
  "summary": "The generated professional summary (3-4 sentences, high impact, no generic fluff)."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedData = JSON.parse(response.text.trim());
    res.json(parsedData);
  } catch (error) {
    sendError(res, error, "Failed to generate summary with Gemini AI.");
  }
});

// 3. AI Skill Recommender
app.post("/api/ai/suggest-skills", async (req, res) => {
  const { jobTitle, industry } = req.body;

  if (!jobTitle) {
    return res.status(400).json({ error: "jobTitle is required." });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Suggest a list of relevant tech, soft, or industry skills a professional should list on their resume for this role:
Job Title: ${jobTitle}
Industry: ${industry || "Technology"}

Provide your output in standard JSON format:
{
  "skills": ["Skill 1", "Skill 2", "Skill 3", "Skill 4", "Skill 5", "Skill 6", "Skill 7", "Skill 8"]
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedData = JSON.parse(response.text.trim());
    res.json(parsedData);
  } catch (error) {
    sendError(res, error, "Failed to suggest skills with Gemini AI.");
  }
});

// 4. AI Feedback on Entire CV / Portfolio
app.post("/api/ai/optimize-cv-feedback", async (req, res) => {
  const { cvData } = req.body;

  if (!cvData) {
    return res.status(400).json({ error: "cvData is required." });
  }

  try {
    const ai = getGeminiClient();
    const prompt = `Analyze this candidate's resume/portfolio structure and content. Highlight strengths, find gaps, and suggest specific actionable improvements (such as adding key sections, improving clarity, or tailoring for professional templates).

CV Data:
${JSON.stringify(cvData, null, 2)}

Provide your output in structural JSON format:
{
  "overallScore": 85, // out of 100
  "strengths": ["Strength 1", "Strength 2"],
  "improvements": ["Improvement 1", "Improvement 2"],
  "missingKeywords": ["Suggested Keyword 1", "Suggested Keyword 2"],
  "feedbackParagraph": "A supportive coaching text of 3-4 sentences providing clear encouragement and a quick next step."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      },
    });

    const parsedData = JSON.parse(response.text.trim());
    res.json(parsedData);
  } catch (error) {
    sendError(res, error, "Failed to optimize CV with Gemini AI.");
  }
});

// Integrate Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server running on http://localhost:${PORT}`);
  });
}

startServer();
