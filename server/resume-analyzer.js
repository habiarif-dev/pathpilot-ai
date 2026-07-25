import { GoogleGenAI } from "@google/genai";
import { PDFParse } from "pdf-parse";
import mammoth from "mammoth";

const MAX_FILE_SIZE = 20 * 1024 * 1024;
const MAX_RESUME_TEXT_LENGTH = 30000;

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".png",
  ".jpg",
  ".jpeg",
];

function getExtension(fileName = "") {
  const index = fileName.toLowerCase().lastIndexOf(".");
  return index === -1
    ? ""
    : fileName.toLowerCase().slice(index);
}

function clampScore(value, fallback = 70) {
  const parsedValue = Number(value);

  if (!Number.isFinite(parsedValue)) {
    return fallback;
  }

  return Math.max(0, Math.min(100, Math.round(parsedValue)));
}

function ensureStringArray(value, fallback = []) {
  if (!Array.isArray(value)) {
    return fallback;
  }

  return value
    .filter((item) => typeof item === "string")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 10);
}

function cleanJsonResponse(value = "") {
  return value
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .trim();
}

function normalizeAnalysis(result) {
  const sections = result?.sections || {};

  return {
    score: clampScore(result?.score),

    summary:
      typeof result?.summary === "string"
        ? result.summary.trim()
        : "Your resume was analyzed successfully. Review the recommendations below to improve its clarity, relevance, and ATS compatibility.",

    strengths: ensureStringArray(result?.strengths, [
      "The resume contains useful professional information",
    ]),

    improvements: ensureStringArray(result?.improvements, [
      "Add measurable achievements and role-specific keywords",
    ]),

    missingKeywords: ensureStringArray(
      result?.missingKeywords
    ),

    recommendedSkills: ensureStringArray(
      result?.recommendedSkills
    ),

    sections: {
      Contact: clampScore(sections.Contact, 75),
      Summary: clampScore(sections.Summary, 70),
      Experience: clampScore(sections.Experience, 70),
      Skills: clampScore(sections.Skills, 75),
      Projects: clampScore(sections.Projects, 65),
      Education: clampScore(sections.Education, 75),
    },

    atsChecks: Array.isArray(result?.atsChecks)
      ? result.atsChecks.slice(0, 8).map((check) => ({
          title:
            typeof check?.title === "string"
              ? check.title
              : "ATS check",

          passed: Boolean(check?.passed),

          description:
            typeof check?.description === "string"
              ? check.description
              : "Review this part of your resume.",
        }))
      : [],

    optimizedSummary:
      typeof result?.optimizedSummary === "string"
        ? result.optimizedSummary.trim()
        : "",

    grammarSuggestions: ensureStringArray(
      result?.grammarSuggestions
    ),

    suggestedProjects: ensureStringArray(
      result?.suggestedProjects
    ),

    certifications: ensureStringArray(
      result?.certifications
    ),

    interviewReadiness: clampScore(
      result?.interviewReadiness,
      65
    ),

    analysisMode: "ai",
  };
}

async function extractPdfText(buffer) {
  const parser = new PDFParse({
    data: new Uint8Array(buffer),
  });

  try {
    const result = await parser.getText();
    return result.text || "";
  } finally {
    await parser.destroy();
  }
}

async function extractDocxText(buffer) {
  const result = await mammoth.extractRawText({
    buffer,
  });

  return result.value || "";
}

function buildPrompt({
  resumeText,
  careerGoal,
  experience,
  skills,
  interests,
}) {
  return `
You are PathPilot AI, an expert resume reviewer, ATS specialist,
career coach, recruiter, and technical hiring advisor.

Analyze the resume honestly and professionally.

USER PROFILE

Career goal:
${careerGoal || "Not provided"}

Experience level:
${experience || "Not provided"}

Current skills:
${skills?.join(", ") || "Not provided"}

Interests:
${interests?.join(", ") || "Not provided"}

RESUME TEXT

${resumeText}

Return ONLY valid JSON using exactly this structure:

{
  "score": 0,
  "summary": "A detailed overall review",
  "strengths": [
    "Strength one",
    "Strength two"
  ],
  "improvements": [
    "Improvement one",
    "Improvement two"
  ],
  "missingKeywords": [
    "Keyword one",
    "Keyword two"
  ],
  "recommendedSkills": [
    "Skill one",
    "Skill two"
  ],
  "sections": {
    "Contact": 0,
    "Summary": 0,
    "Experience": 0,
    "Skills": 0,
    "Projects": 0,
    "Education": 0
  },
  "atsChecks": [
    {
      "title": "ATS check title",
      "passed": true,
      "description": "Explanation"
    }
  ],
  "optimizedSummary": "A rewritten professional resume summary",
  "grammarSuggestions": [
    "Grammar or writing suggestion"
  ],
  "suggestedProjects": [
    "Relevant portfolio project"
  ],
  "certifications": [
    "Relevant certification"
  ],
  "interviewReadiness": 0
}

Rules:

1. Every score must be from 0 to 100.
2. Base the review only on information actually present in the resume.
3. Do not invent employment, education, projects, achievements, or skills.
4. Explain missing content clearly.
5. Recommend keywords only when relevant to the career goal.
6. Provide four to six strengths.
7. Provide five to eight improvements.
8. Provide four to eight ATS checks.
9. Keep suggestions practical and suitable for the user's experience.
10. Do not include markdown or text outside the JSON object.
`;
}

async function analyzeTextResume({
  ai,
  resumeText,
  user,
}) {
  const response = await ai.models.generateContent({
    model:
      process.env.GEMINI_MODEL ||
      "gemini-3.6-flash",

    contents: buildPrompt({
      resumeText,
      careerGoal: user?.careerGoal,
      experience: user?.experience,
      skills: Array.isArray(user?.skills)
        ? user.skills
        : [],
      interests: Array.isArray(user?.interests)
        ? user.interests
        : [],
    }),

    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const responseText = cleanJsonResponse(
    response.text || ""
  );

  if (!responseText) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  return JSON.parse(responseText);
}

async function analyzeImageResume({
  ai,
  buffer,
  mimeType,
  user,
}) {
  const prompt = buildPrompt({
    resumeText:
      "Read and analyze the resume shown in the attached image.",
    careerGoal: user?.careerGoal,
    experience: user?.experience,
    skills: Array.isArray(user?.skills)
      ? user.skills
      : [],
    interests: Array.isArray(user?.interests)
      ? user.interests
      : [],
  });

  const response = await ai.models.generateContent({
   model: process.env.GEMINI_MODEL || "gemini-3.6-flash",

    contents: [
      {
        text: prompt,
      },
      {
        inlineData: {
          mimeType,
          data: buffer.toString("base64"),
        },
      },
    ],

    config: {
      responseMimeType: "application/json",
      temperature: 0.2,
    },
  });

  const responseText = cleanJsonResponse(
    response.text || ""
  );

  if (!responseText) {
    throw new Error(
      "Gemini returned an empty response."
    );
  }

  return JSON.parse(responseText);
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");

    return res.status(405).json({
      success: false,
      message: "Method not allowed.",
    });
  }

  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        success: false,
        fallback: true,
        message:
          "Gemini API is unavailable. Use the basic analyzer.",
      });
    }

    const {
      fileData,
      fileName,
      mimeType,
      user,
    } = req.body || {};

    if (!fileData || !fileName) {
      return res.status(400).json({
        success: false,
        fallback: true,
        message: "Resume file data is missing.",
      });
    }

    const extension = getExtension(fileName);

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return res.status(400).json({
        success: false,
        fallback: true,
        message:
          "AI analysis currently supports PDF, DOCX, PNG, JPG and JPEG files.",
      });
    }

    const base64Data = fileData.includes(",")
      ? fileData.split(",")[1]
      : fileData;

    const buffer = Buffer.from(base64Data, "base64");

    if (buffer.length === 0) {
      return res.status(400).json({
        success: false,
        fallback: true,
        message: "The uploaded resume is empty.",
      });
    }

    if (buffer.length > MAX_FILE_SIZE) {
      return res.status(413).json({
        success: false,
        fallback: true,
        message:
          "The resume is larger than 20 MB.",
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
    });

    let rawAnalysis;

    if (extension === ".pdf") {
      const resumeText =
        await extractPdfText(buffer);

      if (!resumeText.trim()) {
        throw new Error(
          "No readable text was found in the PDF."
        );
      }

      rawAnalysis = await analyzeTextResume({
        ai,
        resumeText: resumeText
          .slice(0, MAX_RESUME_TEXT_LENGTH)
          .trim(),
        user,
      });
    } else if (extension === ".docx") {
      const resumeText =
        await extractDocxText(buffer);

      if (!resumeText.trim()) {
        throw new Error(
          "No readable text was found in the DOCX file."
        );
      }

      rawAnalysis = await analyzeTextResume({
        ai,
        resumeText: resumeText
          .slice(0, MAX_RESUME_TEXT_LENGTH)
          .trim(),
        user,
      });
    } else {
      rawAnalysis = await analyzeImageResume({
        ai,
        buffer,
        mimeType:
          mimeType ||
          (extension === ".png"
            ? "image/png"
            : "image/jpeg"),
        user,
      });
    }

    const analysis =
      normalizeAnalysis(rawAnalysis);

    return res.status(200).json({
      success: true,
      analysis: {
        ...analysis,

        analyzedFile: {
          name: fileName,
          size: buffer.length,
          type: mimeType || extension,
        },

        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error(
      "Resume analyzer API error:",
      error
    );

    return res.status(500).json({
      success: false,
      fallback: true,
      message:
        "AI analysis could not be completed. The basic analyzer should be used instead.",
    });
  }
}