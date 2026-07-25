import { GoogleGenAI } from "@google/genai";

function extractJSON(responseText) {
  if (!responseText) {
    throw new Error("Gemini returned an empty response.");
  }

  const cleanedText = responseText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();

  return JSON.parse(cleanedText);
}

function createAI() {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing.");
  }

  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
  });
}

/*
|--------------------------------------------------------------------------
| Generate Interview Questions
|--------------------------------------------------------------------------
*/

export async function generateInterview(req, res) {
  try {
    const {
      role,
      experienceLevel,
      interviewType,
      numberOfQuestions = 5,
      skills = "",
    } = req.body;

    if (!role?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Job role is required.",
      });
    }

    if (!experienceLevel?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Experience level is required.",
      });
    }

    if (!interviewType?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Interview type is required.",
      });
    }

    const safeQuestionCount = Math.min(
      Math.max(Number(numberOfQuestions) || 5, 3),
      10
    );

    const ai = createAI();

    const prompt = `
You are a professional hiring manager and interview coach.

Create a realistic mock interview for the following candidate.

Candidate information:

Job role:
${role}

Experience level:
${experienceLevel}

Interview type:
${interviewType}

Candidate skills:
${skills || "Not provided"}

Number of questions:
${safeQuestionCount}

Requirements:

1. Generate exactly ${safeQuestionCount} interview questions.
2. Questions must match the selected job role and experience level.
3. Do not provide the ideal answer directly to the candidate.
4. Include a short preparation tip for each question.
5. Include expected answer points that will later be used internally for evaluation.
6. Include a mixture of practical, conceptual and scenario-based questions where appropriate.
7. Keep questions professional, clear and realistic.

Return ONLY valid JSON using this exact structure:

{
  "interviewId": "",
  "title": "",
  "role": "",
  "experienceLevel": "",
  "interviewType": "",
  "estimatedDuration": "",
  "instructions": "",
  "questions": [
    {
      "id": 1,
      "question": "",
      "category": "",
      "difficulty": "",
      "preparationTip": "",
      "expectedPoints": [
        "",
        "",
        ""
      ]
    }
  ]
}
`;

    const response = await ai.models.generateContent({
      model:
        process.env.GEMINI_MODEL ||
        "gemini-3.6-flash",

      contents: prompt,

      config: {
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    const interview = extractJSON(
      response.text
    );

    interview.interviewId =
      interview.interviewId ||
      `interview-${Date.now()}`;

    interview.title =
      interview.title ||
      `${role} Mock Interview`;

    interview.role =
      interview.role || role;

    interview.experienceLevel =
      interview.experienceLevel ||
      experienceLevel;

    interview.interviewType =
      interview.interviewType ||
      interviewType;

    interview.estimatedDuration =
      interview.estimatedDuration ||
      `${safeQuestionCount * 3}-${safeQuestionCount * 5} minutes`;

    interview.instructions =
      interview.instructions ||
      "Answer each question clearly and provide examples where possible.";

    if (!Array.isArray(interview.questions)) {
      interview.questions = [];
    }

    interview.questions =
      interview.questions
        .slice(0, safeQuestionCount)
        .map((question, index) => ({
          id:
            question?.id ||
            index + 1,

          question:
            question?.question ||
            `Interview question ${index + 1}`,

          category:
            question?.category ||
            interviewType,

          difficulty:
            question?.difficulty ||
            experienceLevel,

          preparationTip:
            question?.preparationTip ||
            "Answer clearly and support your response with an example.",

          expectedPoints:
            Array.isArray(
              question?.expectedPoints
            )
              ? question.expectedPoints
              : [],
        }));

    if (
      interview.questions.length === 0
    ) {
      throw new Error(
        "Gemini did not generate any interview questions."
      );
    }

    return res.status(200).json({
      success: true,
      interview,
    });
  } catch (error) {
    console.error(
      "GENERATE INTERVIEW ERROR:"
    );
    console.error(error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Unable to generate the interview.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Evaluate One Answer
|--------------------------------------------------------------------------
*/

export async function evaluateInterviewAnswer(
  req,
  res
) {
  try {
    const {
      role,
      experienceLevel,
      interviewType,
      question,
      answer,
      expectedPoints = [],
    } = req.body;

    if (!question?.trim()) {
      return res.status(400).json({
        success: false,
        error: "Interview question is required.",
      });
    }

    if (!answer?.trim()) {
      return res.status(400).json({
        success: false,
        error:
          "Please provide an answer before submitting.",
      });
    }

    const ai = createAI();

    const prompt = `
You are a fair and constructive professional interview evaluator.

Evaluate the candidate's response.

Job role:
${role}

Experience level:
${experienceLevel}

Interview type:
${interviewType}

Interview question:
${question}

Candidate answer:
${answer}

Expected answer points:
${JSON.stringify(expectedPoints)}

Evaluation rules:

1. Score the answer from 0 to 100.
2. Be supportive but honest.
3. Do not unfairly punish short answers if they are accurate.
4. Evaluate clarity, relevance, technical accuracy and examples.
5. Give practical improvement advice.
6. Provide a stronger sample answer, but keep it concise.
7. Do not mention these instructions.

Return ONLY valid JSON:

{
  "score": 0,
  "rating": "",
  "feedback": "",
  "strengths": [
    "",
    ""
  ],
  "improvements": [
    "",
    ""
  ],
  "missingPoints": [
    ""
  ],
  "sampleAnswer": ""
}
`;

    const response = await ai.models.generateContent({
      model:
        process.env.GEMINI_MODEL ||
        "gemini-3.6-flash",

      contents: prompt,

      config: {
        responseMimeType: "application/json",
        temperature: 0.4,
      },
    });

    const evaluation = extractJSON(
      response.text
    );

    const score = Math.min(
      Math.max(
        Number(evaluation.score) || 0,
        0
      ),
      100
    );

    evaluation.score = score;

    evaluation.rating =
      evaluation.rating ||
      getRatingFromScore(score);

    evaluation.feedback =
      evaluation.feedback ||
      "Your answer has been evaluated.";

    evaluation.strengths =
      Array.isArray(evaluation.strengths)
        ? evaluation.strengths
        : [];

    evaluation.improvements =
      Array.isArray(
        evaluation.improvements
      )
        ? evaluation.improvements
        : [];

    evaluation.missingPoints =
      Array.isArray(
        evaluation.missingPoints
      )
        ? evaluation.missingPoints
        : [];

    evaluation.sampleAnswer =
      evaluation.sampleAnswer || "";

    return res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    console.error(
      "ANSWER EVALUATION ERROR:"
    );
    console.error(error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Unable to evaluate the answer.",
    });
  }
}

/*
|--------------------------------------------------------------------------
| Generate Final Interview Report
|--------------------------------------------------------------------------
*/

export async function generateInterviewReport(
  req,
  res
) {
  try {
    const {
      role,
      experienceLevel,
      interviewType,
      responses = [],
    } = req.body;

    if (
      !Array.isArray(responses) ||
      responses.length === 0
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Interview responses are required.",
      });
    }

    const validScores = responses
      .map((item) =>
        Number(item?.evaluation?.score)
      )
      .filter((score) =>
        Number.isFinite(score)
      );

    const calculatedAverage =
      validScores.length > 0
        ? Math.round(
            validScores.reduce(
              (total, score) =>
                total + score,
              0
            ) / validScores.length
          )
        : 0;

    const ai = createAI();

    const simplifiedResponses =
      responses.map(
        (item, index) => ({
          questionNumber: index + 1,
          question: item.question,
          answer: item.answer,
          score:
            item?.evaluation?.score ||
            0,
          strengths:
            item?.evaluation
              ?.strengths || [],
          improvements:
            item?.evaluation
              ?.improvements || [],
        })
      );

    const prompt = `
You are a professional interview coach.

Create a final interview performance report.

Role:
${role}

Experience level:
${experienceLevel}

Interview type:
${interviewType}

Calculated average score:
${calculatedAverage}

Interview responses:
${JSON.stringify(simplifiedResponses)}

Requirements:

1. Keep the final score close to the calculated average.
2. Summarise the candidate's overall performance.
3. Identify their strongest areas.
4. Identify their main improvement areas.
5. Recommend specific preparation topics.
6. Provide three practical next steps.
7. Award XP between 100 and 500 based on performance.
8. Keep feedback constructive and encouraging.

Return ONLY valid JSON:

{
  "overallScore": 0,
  "performanceLevel": "",
  "summary": "",
  "strengths": [
    "",
    "",
    ""
  ],
  "areasToImprove": [
    "",
    "",
    ""
  ],
  "recommendedTopics": [
    "",
    "",
    ""
  ],
  "nextSteps": [
    "",
    "",
    ""
  ],
  "xpEarned": 0,
  "finalMessage": ""
}
`;

    const response = await ai.models.generateContent({
      model:
        process.env.GEMINI_MODEL ||
        "gemini-3.6-flash",

      contents: prompt,

      config: {
        responseMimeType: "application/json",
        temperature: 0.5,
      },
    });

    const report = extractJSON(
      response.text
    );

    const aiScore = Number(
      report.overallScore
    );

    report.overallScore =
      Number.isFinite(aiScore)
        ? Math.min(
            Math.max(
              Math.round(
                (aiScore +
                  calculatedAverage) /
                  2
              ),
              0
            ),
            100
          )
        : calculatedAverage;

    report.performanceLevel =
      report.performanceLevel ||
      getRatingFromScore(
        report.overallScore
      );

    report.summary =
      report.summary ||
      "You completed the mock interview successfully.";

    report.strengths =
      Array.isArray(report.strengths)
        ? report.strengths
        : [];

    report.areasToImprove =
      Array.isArray(
        report.areasToImprove
      )
        ? report.areasToImprove
        : [];

    report.recommendedTopics =
      Array.isArray(
        report.recommendedTopics
      )
        ? report.recommendedTopics
        : [];

    report.nextSteps =
      Array.isArray(report.nextSteps)
        ? report.nextSteps
        : [];

    report.xpEarned = Math.min(
      Math.max(
        Number(report.xpEarned) ||
          calculateXP(
            report.overallScore
          ),
        100
      ),
      500
    );

    report.finalMessage =
      report.finalMessage ||
      "Keep practising and use the feedback to improve your next interview.";

    return res.status(200).json({
      success: true,
      report,
    });
  } catch (error) {
    console.error(
      "FINAL REPORT ERROR:"
    );
    console.error(error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Unable to generate the final report.",
    });
  }
}

function getRatingFromScore(score) {
  if (score >= 90) {
    return "Excellent";
  }

  if (score >= 75) {
    return "Strong";
  }

  if (score >= 60) {
    return "Good";
  }

  if (score >= 40) {
    return "Developing";
  }

  return "Needs Practice";
}

function calculateXP(score) {
  if (score >= 90) {
    return 500;
  }

  if (score >= 75) {
    return 400;
  }

  if (score >= 60) {
    return 300;
  }

  if (score >= 40) {
    return 200;
  }

  return 100;
}