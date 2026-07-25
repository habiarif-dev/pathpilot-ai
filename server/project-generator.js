import { GoogleGenAI } from "@google/genai";

export default async function projectGenerator(req, res) {
  try {
    const {
      goal,
      skills,
      experience,
      interests,
      dailyTime,
      projectType,
    } = req.body;

    if (!goal) {
      return res.status(400).json({
        error: "Career goal is required.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const prompt = `
You are an expert software architect, senior product designer, startup mentor, and career coach.

Generate ONE unique software project.

User Profile

Career Goal:
${goal}

Skills:
${skills}

Experience:
${experience}

Interests:
${interests}

Daily Learning Time:
${dailyTime}

Preferred Project:
${projectType}

Return ONLY valid JSON.

{
"title":"",
"description":"",
"category":"AI",
"difficulty":"",
"duration":"",
"xp":500,

"skills":[
"",
"",
"",
""
],

"features":[
"",
"",
"",
"",
""
],

"steps":[
"",
"",
"",
"",
"",
""
],

"learningOutcomes":[
"",
"",
""
],

"bonusChallenges":[
"",
""
],

"resumeImpact":"",

"githubStructure":"",

"outcome":""
}
`;

    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    let project;

    try {
      const responseText = response.text;

      if (!responseText) {
         throw new Error("Gemini returned an empty response.");
        }

       const cleanedText = responseText
        .replace(/^```json\s*/i, "")
        .replace(/^```\s*/i, "")
        .replace(/```$/i, "")
        .trim();

       project = JSON.parse(cleanedText);
    } catch (err) {
      return res.status(500).json({
        error: "Failed to parse AI response.",
      });
    }

    project.id = `ai-${Date.now()}`;

    if (!project.category)
      project.category = "AI";

    if (!project.xp)
      project.xp = 500;

    if (!project.duration)
      project.duration = "5-7 Days";

    if (!project.difficulty)
      project.difficulty = "Intermediate";

    if (!Array.isArray(project.skills))
      project.skills = [];

    if (!Array.isArray(project.features))
      project.features = [];

    if (!Array.isArray(project.steps))
      project.steps = [];

    if (!Array.isArray(project.learningOutcomes))
      project.learningOutcomes = [];

    if (!Array.isArray(project.bonusChallenges))
      project.bonusChallenges = [];

    res.json({
      success: true,
      project,
    });

  } catch (error) {
  console.error("PROJECT GENERATOR ERROR:");
  console.error(error);

  return res.status(500).json({
    success: false,
    error:
      error?.message ||
      "Unable to generate project at the moment.",
  });
  }
}