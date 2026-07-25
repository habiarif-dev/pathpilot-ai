import "dotenv/config";

import express from "express";
import cors from "cors";

import resumeAnalyzer from "./resume-analyzer.js";
import careerAssessment from "./career-assessment.js";
import aiAssistant from "./ai-assistant.js";
import projectGenerator from "./project-generator.js";
import {
  generateInterview,
  evaluateInterviewAnswer,
  generateInterviewReport,
} from "./interview-simulator.js";
import {
  generateCareerRoadmap,
  regenerateRoadmapMilestone,
  generateDailyMissionFromRoadmap,
} from "./career-roadmap.js";
import dashboardInsights from "./dashboard-insights.js";

const app = express();

app.use(cors());

app.use(
  express.json({
    limit: "25mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "25mb",
  })
);

app.post(
  "/api/resume-analyzer",
  resumeAnalyzer
);

app.post(
  "/api/career-assessment",
  careerAssessment
);

app.post(
  "/api/ai-assistant",
  aiAssistant
);

app.post("/api/project-generator", projectGenerator);

app.post(
  "/api/interview-simulator/generate",
  generateInterview
);

app.post(
  "/api/interview-simulator/evaluate",
  evaluateInterviewAnswer
);

app.post(
  "/api/interview-simulator/report",
  generateInterviewReport
);

app.post(
  "/api/career-roadmap/generate",
  generateCareerRoadmap
);

app.post(
  "/api/career-roadmap/regenerate-milestone",
  regenerateRoadmapMilestone
);

app.post(
  "/api/career-roadmap/daily-mission",
  generateDailyMissionFromRoadmap
);

app.post(
  "/api/dashboard-insights",
  dashboardInsights
);

app.get("/", (req, res) => {
  res.send("✅ PathPilot AI Server Running");
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "PathPilot AI backend is running.",
    geminiConfigured: Boolean(
      process.env.GEMINI_API_KEY
    ),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: "Route not found.",
  });
});

app.use((error, req, res, next) => {
  console.error("Server error:", error);

  res.status(error?.status || 500).json({
    success: false,
    error:
      error?.message ||
      "An unexpected server error occurred.",
  });
});

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );

  console.log(
    process.env.GEMINI_API_KEY
      ? "✅ Gemini API key loaded"
      : "❌ Gemini API key missing"
  );
});