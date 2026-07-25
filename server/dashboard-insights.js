import { GoogleGenAI } from "@google/genai";

function extractResponseText(response) {
  if (typeof response?.text === "string") {
    return response.text.trim();
  }

  const parts = response?.candidates?.[0]?.content?.parts;

  if (Array.isArray(parts)) {
    return parts
      .map((part) =>
        typeof part?.text === "string" ? part.text : ""
      )
      .join("")
      .trim();
  }

  return "";
}

function cleanJSONResponse(value = "") {
  return value
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();
}

function buildFallbackInsights(data) {
  const insights = [];

  const roadmapProgress = Number(data.roadmapProgress || 0);
  const resumeScore = Number(data.resumeScore || 0);
  const completedMissions = Number(data.completedMissions || 0);
  const totalMissions = Number(data.totalMissions || 0);
  const currentStreak = Number(data.currentStreak || 0);

  if (roadmapProgress < 100) {
    insights.push({
      id: "roadmap-progress",
      type: "progress",
      title: "Keep moving through your roadmap",
      message: `You have completed ${roadmapProgress}% of your career roadmap.`,
      actionLabel: "Open Roadmap",
      actionPath: "/career-roadmap",
      priority: "high",
    });
  }

  if (!data.hasResumeAnalysis) {
    insights.push({
      id: "resume-review",
      type: "resume",
      title: "Review your resume",
      message:
        "Analyze your resume today to identify missing skills and improvement opportunities.",
      actionLabel: "Analyze Resume",
      actionPath: "/resume-analyzer",
      priority: "high",
    });
  } else if (resumeScore < 75) {
    insights.push({
      id: "resume-score",
      type: "resume",
      title: "Improve your resume score",
      message: `Your current resume score is ${resumeScore}. Focus on measurable achievements and role-specific keywords.`,
      actionLabel: "Improve Resume",
      actionPath: "/resume-analyzer",
      priority: "medium",
    });
  }

  if (completedMissions < totalMissions) {
    insights.push({
      id: "daily-mission",
      type: "mission",
      title: "Complete today’s mission",
      message: `${completedMissions} of ${totalMissions} daily missions are complete.`,
      actionLabel: "Open Mission",
      actionPath: "/daily-mission",
      priority: "high",
    });
  }

  if (currentStreak < 3) {
    insights.push({
      id: "streak",
      type: "streak",
      title: "Build your learning streak",
      message:
        "Complete one focused learning activity today to strengthen your consistency.",
      actionLabel: "Start Learning",
      actionPath: "/daily-mission",
      priority: "medium",
    });
  }

  insights.push({
    id: "recommended-skill",
    type: "skill",
    title: "Recommended next skill",
    message:
      data.recommendedSkill ||
      "Choose one skill connected to your target role and practice it through a small project.",
    actionLabel: "Generate Project",
    actionPath: "/ai-projects",
    priority: "medium",
  });

  return insights.slice(0, 4);
}

function normalizeInsights(value, fallbackData) {
  if (!Array.isArray(value)) {
    return buildFallbackInsights(fallbackData);
  }

  const validInsights = value
    .filter(
      (item) =>
        item &&
        typeof item.title === "string" &&
        typeof item.message === "string"
    )
    .slice(0, 4)
    .map((item, index) => ({
      id: item.id || `insight-${index + 1}`,
      type: item.type || "general",
      title: item.title.trim(),
      message: item.message.trim(),
      actionLabel:
        typeof item.actionLabel === "string"
          ? item.actionLabel.trim()
          : "View",
      actionPath:
        typeof item.actionPath === "string"
          ? item.actionPath.trim()
          : "/dashboard",
      priority: ["high", "medium", "low"].includes(item.priority)
        ? item.priority
        : "medium",
    }));

  return validInsights.length
    ? validInsights
    : buildFallbackInsights(fallbackData);
}

export default async function dashboardInsights(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });
  }

  try {
    const data = req.body || {};

    const apiKey = process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      return res.status(200).json({
        success: true,
        insights: buildFallbackInsights(data),
        generatedByAI: false,
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const model =
      process.env.GEMINI_MODEL?.trim() || "gemini-3.6-flash";

    const prompt = `
You are PathPilot AI, an intelligent career progress assistant.

Analyze the user data and return exactly 4 personalized dashboard insights.

USER DATA

Name: ${data.name || "PathPilot User"}
Career goal: ${data.careerGoal || "Not provided"}
Experience level: ${data.experience || "Beginner"}
Skills: ${
      Array.isArray(data.skills) && data.skills.length
        ? data.skills.join(", ")
        : "Not provided"
    }
Interests: ${
      Array.isArray(data.interests) && data.interests.length
        ? data.interests.join(", ")
        : "Not provided"
    }

Roadmap progress: ${Number(data.roadmapProgress || 0)}%
Completed roadmap stages: ${Number(
      data.completedRoadmapStages || 0
    )}
Total roadmap stages: ${Number(data.totalRoadmapStages || 0)}

Completed daily missions: ${Number(
      data.completedMissions || 0
    )}
Total daily missions: ${Number(data.totalMissions || 0)}

Current streak: ${Number(data.currentStreak || 0)} days
XP earned: ${Number(data.xp || 0)}

Resume analysis available: ${Boolean(data.hasResumeAnalysis)}
Resume score: ${Number(data.resumeScore || 0)}

Started projects: ${Number(data.startedProjects || 0)}
Completed projects: ${Number(data.completedProjects || 0)}

Return only valid JSON using this structure:

{
  "insights": [
    {
      "id": "unique-id",
      "type": "progress | mission | resume | skill | project | streak",
      "title": "Short title",
      "message": "One concise personalized recommendation",
      "actionLabel": "Button label",
      "actionPath": "/valid-route",
      "priority": "high | medium | low"
    }
  ]
}

Allowed action paths:
- /career-roadmap
- /daily-mission
- /resume-analyzer
- /ai-projects
- /interview-simulator
- /ai-assistant
- /dashboard

Rules:
1. Return exactly 4 insights.
2. Prioritize the most useful next actions.
3. Do not invent completed work or skills.
4. Keep every message under 160 characters.
5. Return JSON only.
`.trim();

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
      config: {
        temperature: 0.4,
        maxOutputTokens: 1000,
        responseMimeType: "application/json",
      },
    });

    const text = extractResponseText(response);

    if (!text) {
      throw new Error("Gemini returned an empty response.");
    }

    const parsed = JSON.parse(cleanJSONResponse(text));

    return res.status(200).json({
      success: true,
      insights: normalizeInsights(parsed.insights, data),
      generatedByAI: true,
    });
  } catch (error) {
    console.error("Dashboard insights error:", error);

    return res.status(200).json({
      success: true,
      insights: buildFallbackInsights(req.body || {}),
      generatedByAI: false,
    });
  }
}