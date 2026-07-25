import { GoogleGenAI } from "@google/genai";

const SYSTEM_PROMPT = `
You are PathPilot AI, a practical career assessment coach for students,
beginner developers, freelancers, and early-career professionals.

Analyze the user's assessment answers and create realistic, personalized,
actionable career guidance.

Rules:
1. Base every recommendation on the user's actual answers.
2. Use supportive but professional language.
3. Do not promise jobs, income, clients, internships, or guaranteed success.
4. Keep the plan achievable for the user's available weekly time.
5. Recommend practical projects and measurable next steps.
6. Avoid vague motivational statements.
7. Return only valid JSON.
8. Do not include Markdown formatting or code fences.

Return this exact JSON structure:

{
  "profileTitle": "A short memorable career profile title",
  "summary": "A personalized assessment summary",
  "strengths": [
    "Strength one",
    "Strength two",
    "Strength three"
  ],
  "focusAreas": [
    "Focus area one",
    "Focus area two",
    "Focus area three"
  ],
  "recommendedSkills": [
    "Skill one",
    "Skill two",
    "Skill three",
    "Skill four"
  ],
  "recommendedActions": [
    "Action one",
    "Action two",
    "Action three",
    "Action four"
  ],
  "projectIdea": {
    "title": "Project title",
    "problem": "The real problem this project solves",
    "description": "A concise project description",
    "techStack": [
      "Technology one",
      "Technology two"
    ]
  },
  "weeklyPlan": [
    {
      "day": "Monday",
      "task": "A realistic task"
    }
  ],
  "nextAction": "One clear action the user should take today"
}
`;

function extractJson(text) {
  if (!text) {
    throw new Error("Gemini returned an empty response.");
  }

  const cleanedText = text
    .replace(/```json/gi, "")
    .replace(/```/g, "")
    .trim();

  const firstBrace = cleanedText.indexOf("{");
  const lastBrace = cleanedText.lastIndexOf("}");

  if (firstBrace === -1 || lastBrace === -1) {
    throw new Error("Gemini did not return valid JSON.");
  }

  return JSON.parse(
    cleanedText.slice(firstBrace, lastBrace + 1)
  );
}

export default async function handler(request, response) {
  if (request.method !== "POST") {
    return response.status(405).json({
      error: "Method not allowed.",
    });
  }

  if (!process.env.GEMINI_API_KEY) {
    return response.status(500).json({
      error: "Gemini API key is not configured.",
    });
  }

  try {
    const { answers } = request.body || {};

    if (
      !answers ||
      typeof answers !== "object" ||
      Object.keys(answers).length === 0
    ) {
      return response.status(400).json({
        error: "Assessment answers are required.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    const userPrompt = `
Generate a personalized PathPilot Career DNA assessment from these answers:

Career goal: ${answers.careerGoal || "Not provided"}
Experience level: ${answers.experience || "Not provided"}
Weekly study time: ${answers.weeklyTime || "Not provided"}
Learning style: ${answers.learningStyle || "Not provided"}
Main challenge: ${answers.mainChallenge || "Not provided"}
Preferred focus: ${answers.preferredFocus || "Not provided"}

The weekly plan must fit the user's available study time.
`;

    const geminiResponse =
      await ai.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3.6-flash",
        contents: userPrompt,
        config: {
          systemInstruction: SYSTEM_PROMPT,
          temperature: 0.6,
          maxOutputTokens: 1800,
        },
      });

    const result = extractJson(geminiResponse.text);

    return response.status(200).json({
      result: {
        ...result,
        answers,
        generatedBy: "Gemini",
        completedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
  console.error(error);

  // Handle Gemini quota exceeded
  if (
    error.message?.includes("RESOURCE_EXHAUSTED") ||
    error.message?.includes("429") ||
    error.message?.includes("quota")
  ) {
    return res.status(429).json({
      success: false,
      quotaExceeded: true,
      message:
        "The AI service has reached today's free usage limit. Please try again later.",
    });
  }

  return res.status(500).json({
    success: false,
    message: "Something went wrong. Please try again.",
  });
}
}