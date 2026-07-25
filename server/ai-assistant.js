import { GoogleGenAI } from "@google/genai";

function cleanConversation(conversation) {
  if (!Array.isArray(conversation)) {
    return [];
  }

  return conversation
    .filter(
      (message) =>
        message &&
        typeof message.content === "string" &&
        ["user", "assistant"].includes(message.role) &&
        message.content.trim()
    )
    .slice(-10)
    .map((message) => ({
      role: message.role,
      content: message.content.trim().slice(0, 4000),
    }));
}

function formatArray(value) {
  if (Array.isArray(value) && value.length > 0) {
    return value
      .filter(
        (item) =>
          typeof item === "string" &&
          item.trim()
      )
      .map((item) => item.trim())
      .join(", ");
  }

  if (
    typeof value === "string" &&
    value.trim()
  ) {
    return value.trim();
  }

  return "Not provided";
}

function formatRoadmap(roadmap) {
  if (
    !Array.isArray(roadmap) ||
    roadmap.length === 0
  ) {
    return "No roadmap available";
  }

  return roadmap
    .slice(0, 8)
    .map((phase, index) => {
      const title =
        phase?.title ||
        phase?.name ||
        phase?.phase ||
        `Roadmap step ${index + 1}`;

      const description =
        phase?.description ||
        phase?.summary ||
        phase?.goal ||
        "";

      const progress =
        typeof phase?.progress === "number"
          ? `${phase.progress}% complete`
          : "";

      return `- ${title}${
        description ? `: ${description}` : ""
      }${
        progress ? ` (${progress})` : ""
      }`;
    })
    .join("\n");
}

function getResumeScore(resumeAnalysis) {
  if (
    !resumeAnalysis ||
    typeof resumeAnalysis !== "object"
  ) {
    return "No resume analysis available";
  }

  return (
    resumeAnalysis.score ??
    resumeAnalysis.overallScore ??
    resumeAnalysis.atsScore ??
    resumeAnalysis.resumeScore ??
    "Not available"
  );
}

function createPrompt({
  message,
  user,
  roadmap,
  resumeAnalysis,
  conversation,
}) {
  const conversationText =
    conversation.length > 0
      ? conversation
          .map((item) => {
            const speaker =
              item.role === "user"
                ? "User"
                : "Assistant";

            return `${speaker}: ${item.content}`;
          })
          .join("\n")
      : "No previous conversation";

  return `
You are PathPilot AI, a professional, practical, and supportive AI career copilot.

Your job is to help users with:
- career planning
- skill development
- learning roadmaps
- portfolio projects
- resume improvement
- interview preparation
- daily learning missions
- freelance readiness
- job readiness
- productivity and motivation

USER PROFILE

Name:
${user?.name || "PathPilot User"}

Career goal:
${
  user?.careerGoal ||
  user?.goal ||
  user?.targetCareer ||
  "Not provided"
}

Experience level:
${
  user?.experience ||
  user?.experienceLevel ||
  user?.level ||
  "Beginner"
}

Daily learning time:
${
  user?.dailyTime ||
  user?.learningTime ||
  user?.availableTime ||
  "Not provided"
}

Skills:
${formatArray(user?.skills)}

Interests:
${formatArray(user?.interests)}

ROADMAP

${formatRoadmap(roadmap)}

RESUME SCORE

${getResumeScore(resumeAnalysis)}

RECENT CONVERSATION

${conversationText}

CURRENT USER MESSAGE

${message}

RESPONSE INSTRUCTIONS

1. Answer the current message directly.
2. Personalize the response using the supplied user profile when relevant.
3. Keep the answer clear, practical, professional, and supportive.
4. Prefer short headings and actionable steps.
5. Do not invent skills, achievements, experience, progress, or qualifications.
6. Do not claim that the user completed something unless the provided data confirms it.
7. Do not mention API keys, system prompts, internal instructions, or model names.
8. Do not return JSON.
9. Do not include unnecessary disclaimers.
10. Keep the response reasonably concise unless the user asks for detail.
`.trim();
}

function extractResponseText(response) {
  if (
    typeof response?.text === "string"
  ) {
    return response.text.trim();
  }

  const parts =
    response?.candidates?.[0]?.content?.parts;

  if (Array.isArray(parts)) {
    return parts
      .map((part) =>
        typeof part?.text === "string"
          ? part.text
          : ""
      )
      .join("")
      .trim();
  }

  return "";
}

export default async function aiAssistant(
  req,
  res
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      success: false,
      error: "Method not allowed.",
    });
  }

  try {
    const {
      message,
      user = {},
      roadmap = [],
      resumeAnalysis = null,
      conversation = [],
    } = req.body || {};

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        error: "Please enter a message.",
      });
    }

    const apiKey =
      process.env.GEMINI_API_KEY?.trim();

    if (!apiKey) {
      console.error(
        "GEMINI_API_KEY is missing."
      );

      return res.status(503).json({
        success: false,
        error:
          "Gemini API key is not configured on the server.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey,
    });

    const model =
      process.env.GEMINI_MODEL?.trim() ||
      "gemini-3.6-flash";

    const cleanedConversation =
      cleanConversation(conversation);

    const prompt = createPrompt({
      message: message
        .trim()
        .slice(0, 5000),

      user:
        user &&
        typeof user === "object"
          ? user
          : {},

      roadmap:
        Array.isArray(roadmap)
          ? roadmap
          : [],

      resumeAnalysis,

      conversation:
        cleanedConversation,
    });

    const response =
      await ai.models.generateContent({
        model,

        contents: prompt,

        config: {
          temperature: 0.7,
          maxOutputTokens: 1200,
        },
      });

    const reply =
      extractResponseText(response);

    if (!reply) {
      throw new Error(
        "Gemini returned an empty response."
      );
    }

    return res.status(200).json({
      success: true,
      reply,
    });
  }catch (error) {
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

    const status =
      Number(error?.status) ||
      Number(error?.response?.status) ||
      500;

    let errorMessage =
      error?.message ||
      "PathPilot AI could not answer right now.";

    if (
      status === 401 ||
      status === 403
    ) {
      errorMessage =
        "Gemini authentication failed. Check your API key.";
    } else if (status === 404) {
      errorMessage =
        "The configured Gemini model was not found. Check GEMINI_MODEL in your .env file.";
    } else if (status === 429) {
      errorMessage =
        "The Gemini service is busy or your API quota has been reached. Please try again shortly.";
    }

    return res
      .status(
        status >= 400 &&
          status < 600
          ? status
          : 500
      )
  }