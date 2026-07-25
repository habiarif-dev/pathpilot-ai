import { GoogleGenAI } from "@google/genai";

/* =========================================================
   Helpers
========================================================= */

function createAIClient() {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is missing from the server environment."
    );
  }

  return new GoogleGenAI({
    apiKey,
  });
}

function getGeminiModel() {
  return (
    process.env.GEMINI_MODEL?.trim() ||
    "gemini-3.6-flash"
  );
}

function cleanJSONResponse(responseText) {
  if (!responseText || typeof responseText !== "string") {
    throw new Error("Gemini returned an empty response.");
  }

  return responseText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/```$/i, "")
    .trim();
}

function parseJSONResponse(responseText) {
  const cleanedText = cleanJSONResponse(responseText);

  try {
    return JSON.parse(cleanedText);
  } catch (error) {
    console.error("ROADMAP JSON PARSE ERROR:");
    console.error(cleanedText);

    throw new Error(
      "The AI returned an invalid roadmap format. Please try again."
    );
  }
}

function normaliseArray(value) {
  return Array.isArray(value) ? value : [];
}

function normaliseText(value, fallback = "") {
  return typeof value === "string" && value.trim()
    ? value.trim()
    : fallback;
}

function normaliseNumber(value, fallback = 0) {
  const number = Number(value);

  return Number.isFinite(number) ? number : fallback;
}

function clampNumber(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function createRoadmapId() {
  return `roadmap-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;
}

function createTaskId(monthIndex, weekIndex, taskIndex) {
  return `task-${monthIndex + 1}-${weekIndex + 1}-${taskIndex + 1}`;
}

function createWeekId(monthIndex, weekIndex) {
  return `week-${monthIndex + 1}-${weekIndex + 1}`;
}

function createMilestoneId(monthIndex) {
  return `milestone-${monthIndex + 1}`;
}

function calculateTotalTasks(milestones) {
  return milestones.reduce((milestoneTotal, milestone) => {
    const weeklyTasks = normaliseArray(milestone.weeks).reduce(
      (weekTotal, week) => {
        return weekTotal + normaliseArray(week.tasks).length;
      },
      0
    );

    return milestoneTotal + weeklyTasks;
  }, 0);
}

function calculateTotalXP(milestones) {
  return milestones.reduce((milestoneTotal, milestone) => {
    const weeklyXP = normaliseArray(milestone.weeks).reduce(
      (weekTotal, week) => {
        const taskXP = normaliseArray(week.tasks).reduce(
          (taskTotal, task) => {
            return taskTotal + normaliseNumber(task.xpReward, 0);
          },
          0
        );

        return weekTotal + taskXP;
      },
      0
    );

    return (
      milestoneTotal +
      weeklyXP +
      normaliseNumber(milestone.milestoneXP, 0)
    );
  }, 0);
}

/* =========================================================
   Roadmap Normalisation
========================================================= */

function normaliseTask(task, monthIndex, weekIndex, taskIndex) {
  const difficultyOptions = [
    "Beginner",
    "Intermediate",
    "Advanced",
  ];

  const taskTypeOptions = [
    "Learning",
    "Practice",
    "Project",
    "Review",
    "Research",
    "Career",
  ];

  const difficulty = difficultyOptions.includes(task?.difficulty)
    ? task.difficulty
    : "Beginner";

  const taskType = taskTypeOptions.includes(task?.taskType)
    ? task.taskType
    : "Practice";

  return {
    id:
      normaliseText(task?.id) ||
      createTaskId(monthIndex, weekIndex, taskIndex),

    title: normaliseText(
      task?.title,
      `Task ${taskIndex + 1}`
    ),

    description: normaliseText(
      task?.description,
      "Complete this roadmap activity."
    ),

    taskType,

    difficulty,

    estimatedMinutes: clampNumber(
      normaliseNumber(task?.estimatedMinutes, 30),
      10,
      240
    ),

    xpReward: clampNumber(
      normaliseNumber(task?.xpReward, 50),
      10,
      500
    ),

    skills: normaliseArray(task?.skills)
      .map((skill) => normaliseText(skill))
      .filter(Boolean),

    deliverable: normaliseText(
      task?.deliverable,
      "A completed learning activity."
    ),

    successCriteria: normaliseArray(task?.successCriteria)
      .map((item) => normaliseText(item))
      .filter(Boolean),

    resources: normaliseArray(task?.resources)
      .map((resource) => ({
        title: normaliseText(
          resource?.title,
          "Learning resource"
        ),

        type: normaliseText(
          resource?.type,
          "Documentation"
        ),

        searchQuery: normaliseText(
          resource?.searchQuery,
          ""
        ),
      }))
      .filter((resource) => resource.title),

    completed: false,

    completedAt: null,
  };
}

function normaliseWeek(week, monthIndex, weekIndex) {
  const tasks = normaliseArray(week?.tasks).map(
    (task, taskIndex) =>
      normaliseTask(
        task,
        monthIndex,
        weekIndex,
        taskIndex
      )
  );

  return {
    id:
      normaliseText(week?.id) ||
      createWeekId(monthIndex, weekIndex),

    weekNumber: weekIndex + 1,

    title: normaliseText(
      week?.title,
      `Week ${weekIndex + 1}`
    ),

    focus: normaliseText(
      week?.focus,
      "Develop the skills needed for this milestone."
    ),

    objectives: normaliseArray(week?.objectives)
      .map((objective) => normaliseText(objective))
      .filter(Boolean),

    tasks,

    weeklyProject: week?.weeklyProject
      ? {
          title: normaliseText(
            week.weeklyProject.title,
            "Weekly practical project"
          ),

          description: normaliseText(
            week.weeklyProject.description,
            "Apply this week's learning in a practical project."
          ),

          deliverables: normaliseArray(
            week.weeklyProject.deliverables
          )
            .map((deliverable) =>
              normaliseText(deliverable)
            )
            .filter(Boolean),

          estimatedHours: clampNumber(
            normaliseNumber(
              week.weeklyProject.estimatedHours,
              3
            ),
            1,
            40
          ),
        }
      : null,

    completed: false,

    progress: 0,
  };
}

function normaliseMilestone(milestone, monthIndex) {
  const weeks = normaliseArray(milestone?.weeks).map(
    (week, weekIndex) =>
      normaliseWeek(week, monthIndex, weekIndex)
  );

  return {
    id:
      normaliseText(milestone?.id) ||
      createMilestoneId(monthIndex),

    monthNumber: monthIndex + 1,

    title: normaliseText(
      milestone?.title,
      `Milestone ${monthIndex + 1}`
    ),

    theme: normaliseText(
      milestone?.theme,
      "Career development"
    ),

    description: normaliseText(
      milestone?.description,
      "Complete this stage of your career roadmap."
    ),

    mainGoal: normaliseText(
      milestone?.mainGoal,
      "Build the skills required for the next stage."
    ),

    skillsToLearn: normaliseArray(
      milestone?.skillsToLearn
    )
      .map((skill) => normaliseText(skill))
      .filter(Boolean),

    milestoneProject: milestone?.milestoneProject
      ? {
          title: normaliseText(
            milestone.milestoneProject.title,
            "Milestone project"
          ),

          description: normaliseText(
            milestone.milestoneProject.description,
            "Create a practical project using the skills learned."
          ),

          features: normaliseArray(
            milestone.milestoneProject.features
          )
            .map((feature) => normaliseText(feature))
            .filter(Boolean),

          deliverables: normaliseArray(
            milestone.milestoneProject.deliverables
          )
            .map((deliverable) =>
              normaliseText(deliverable)
            )
            .filter(Boolean),
        }
      : null,

    milestoneChecklist: normaliseArray(
      milestone?.milestoneChecklist
    )
      .map((item) => ({
        id:
          normaliseText(item?.id) ||
          `milestone-${monthIndex + 1}-check-${Math.random()
            .toString(36)
            .slice(2, 7)}`,

        text: normaliseText(
          item?.text,
          "Complete milestone requirement"
        ),

        completed: false,
      }))
      .filter((item) => item.text),

    milestoneXP: clampNumber(
      normaliseNumber(milestone?.milestoneXP, 300),
      100,
      2000
    ),

    weeks,

    completed: false,

    progress: 0,
  };
}

function normaliseRoadmap(aiRoadmap, requestData) {
  const milestones = normaliseArray(
    aiRoadmap?.milestones
  ).map((milestone, monthIndex) =>
    normaliseMilestone(milestone, monthIndex)
  );

  const roadmap = {
    id:
      normaliseText(aiRoadmap?.id) ||
      createRoadmapId(),

    title: normaliseText(
      aiRoadmap?.title,
      `${requestData.careerGoal} Career Roadmap`
    ),

    careerGoal: normaliseText(
      aiRoadmap?.careerGoal,
      requestData.careerGoal
    ),

    currentLevel: normaliseText(
      aiRoadmap?.currentLevel,
      requestData.currentLevel
    ),

    targetRole: normaliseText(
      aiRoadmap?.targetRole,
      requestData.targetRole || requestData.careerGoal
    ),

    durationMonths: clampNumber(
      normaliseNumber(
        aiRoadmap?.durationMonths,
        requestData.durationMonths
      ),
      1,
      12
    ),

    weeklyHours: clampNumber(
      normaliseNumber(
        aiRoadmap?.weeklyHours,
        requestData.weeklyHours
      ),
      1,
      80
    ),

    summary: normaliseText(
      aiRoadmap?.summary,
      "A personalised roadmap designed to help you achieve your career goal."
    ),

    careerOutcome: normaliseText(
      aiRoadmap?.careerOutcome,
      `Build the skills, projects and confidence required to pursue ${requestData.careerGoal}.`
    ),

    currentSkills: normaliseArray(
      aiRoadmap?.currentSkills
    ).length
      ? normaliseArray(aiRoadmap.currentSkills)
          .map((skill) => normaliseText(skill))
          .filter(Boolean)
      : requestData.currentSkills,

    skillsToDevelop: normaliseArray(
      aiRoadmap?.skillsToDevelop
    )
      .map((skill) => normaliseText(skill))
      .filter(Boolean),

    recommendedTools: normaliseArray(
      aiRoadmap?.recommendedTools
    )
      .map((tool) => normaliseText(tool))
      .filter(Boolean),

    milestones,

    completionRequirements: normaliseArray(
      aiRoadmap?.completionRequirements
    )
      .map((requirement) => normaliseText(requirement))
      .filter(Boolean),

    finalPortfolioOutcome: normaliseText(
      aiRoadmap?.finalPortfolioOutcome,
      "A collection of practical projects demonstrating the skills developed during the roadmap."
    ),

    jobPreparation: {
      resumeActions: normaliseArray(
        aiRoadmap?.jobPreparation?.resumeActions
      )
        .map((item) => normaliseText(item))
        .filter(Boolean),

      interviewActions: normaliseArray(
        aiRoadmap?.jobPreparation?.interviewActions
      )
        .map((item) => normaliseText(item))
        .filter(Boolean),

      networkingActions: normaliseArray(
        aiRoadmap?.jobPreparation?.networkingActions
      )
        .map((item) => normaliseText(item))
        .filter(Boolean),

      applicationActions: normaliseArray(
        aiRoadmap?.jobPreparation?.applicationActions
      )
        .map((item) => normaliseText(item))
        .filter(Boolean),
    },

    motivationMessage: normaliseText(
      aiRoadmap?.motivationMessage,
      "Stay consistent, track your progress and focus on completing one meaningful task at a time."
    ),

    totalTasks: calculateTotalTasks(milestones),

    totalXP: calculateTotalXP(milestones),

    progress: 0,

    currentMilestoneIndex: 0,

    currentWeekIndex: 0,

    createdAt: new Date().toISOString(),

    updatedAt: new Date().toISOString(),
  };

  return roadmap;
}

/* =========================================================
   Validation
========================================================= */

function validateRoadmapRequest(body) {
  const careerGoal = normaliseText(body?.careerGoal);
  const targetRole = normaliseText(body?.targetRole);
  const currentLevel = normaliseText(
    body?.currentLevel,
    "Beginner"
  );

  const currentSkills = Array.isArray(body?.currentSkills)
    ? body.currentSkills
        .map((skill) => normaliseText(skill))
        .filter(Boolean)
    : normaliseText(body?.currentSkills)
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);

  const interests = Array.isArray(body?.interests)
    ? body.interests
        .map((interest) => normaliseText(interest))
        .filter(Boolean)
    : normaliseText(body?.interests)
        .split(",")
        .map((interest) => interest.trim())
        .filter(Boolean);

  const durationMonths = clampNumber(
    normaliseNumber(body?.durationMonths, 6),
    1,
    12
  );

  const weeklyHours = clampNumber(
    normaliseNumber(body?.weeklyHours, 10),
    1,
    80
  );

  const learningPreference = normaliseText(
    body?.learningPreference,
    "A balanced mixture of learning, practice and projects"
  );

  if (!careerGoal) {
    return {
      valid: false,
      error: "Career goal is required.",
    };
  }

  return {
    valid: true,

    data: {
      careerGoal,
      targetRole: targetRole || careerGoal,
      currentLevel,
      currentSkills,
      interests,
      durationMonths,
      weeklyHours,
      learningPreference,
    },
  };
}

/* =========================================================
   Prompt
========================================================= */

function createRoadmapPrompt(data) {
  const approximateWeeks = Math.max(
    data.durationMonths * 4,
    4
  );

  return `
You are an expert career coach, curriculum designer, technical mentor and project-based learning specialist.

Create a detailed and practical career roadmap for this learner.

LEARNER INFORMATION

Career goal:
${data.careerGoal}

Target role:
${data.targetRole}

Current experience level:
${data.currentLevel}

Current skills:
${
  data.currentSkills.length
    ? data.currentSkills.join(", ")
    : "No specific skills provided"
}

Interests:
${
  data.interests.length
    ? data.interests.join(", ")
    : "No specific interests provided"
}

Roadmap duration:
${data.durationMonths} months

Available study time:
${data.weeklyHours} hours per week

Learning preference:
${data.learningPreference}

ROADMAP REQUIREMENTS

1. Create exactly ${data.durationMonths} monthly milestones.
2. Each milestone must contain exactly 4 weekly plans.
3. Each week must contain between 3 and 5 realistic tasks.
4. Tasks must fit within approximately ${data.weeklyHours} available hours per week.
5. Begin at the learner's current level and gradually increase the difficulty.
6. Include learning, hands-on practice, projects, revision and career preparation.
7. Make the roadmap specific to the target role.
8. Avoid vague tasks such as "learn coding" or "study more".
9. Each task must have:
   - a clear title
   - a practical description
   - task type
   - difficulty
   - estimated minutes
   - XP reward
   - relevant skills
   - a measurable deliverable
   - clear success criteria
   - useful resource search suggestions
10. Resource items must use search queries instead of invented links.
11. Include weekly mini-projects where appropriate.
12. Include one meaningful milestone project for each month.
13. Include portfolio building throughout the roadmap.
14. Include resume, interview, networking and job application preparation.
15. The roadmap should contain approximately ${approximateWeeks} weeks in total.
16. Keep the roadmap challenging but realistic.
17. Do not include markdown.
18. Return only valid JSON.

Use this exact JSON structure:

{
  "id": "",
  "title": "",
  "careerGoal": "",
  "targetRole": "",
  "currentLevel": "",
  "durationMonths": ${data.durationMonths},
  "weeklyHours": ${data.weeklyHours},
  "summary": "",
  "careerOutcome": "",
  "currentSkills": [""],
  "skillsToDevelop": [""],
  "recommendedTools": [""],
  "milestones": [
    {
      "id": "",
      "monthNumber": 1,
      "title": "",
      "theme": "",
      "description": "",
      "mainGoal": "",
      "skillsToLearn": [""],
      "weeks": [
        {
          "id": "",
          "weekNumber": 1,
          "title": "",
          "focus": "",
          "objectives": [""],
          "tasks": [
            {
              "id": "",
              "title": "",
              "description": "",
              "taskType": "Learning",
              "difficulty": "Beginner",
              "estimatedMinutes": 45,
              "xpReward": 50,
              "skills": [""],
              "deliverable": "",
              "successCriteria": [""],
              "resources": [
                {
                  "title": "",
                  "type": "Documentation",
                  "searchQuery": ""
                }
              ]
            }
          ],
          "weeklyProject": {
            "title": "",
            "description": "",
            "deliverables": [""],
            "estimatedHours": 3
          }
        }
      ],
      "milestoneProject": {
        "title": "",
        "description": "",
        "features": [""],
        "deliverables": [""]
      },
      "milestoneChecklist": [
        {
          "id": "",
          "text": ""
        }
      ],
      "milestoneXP": 300
    }
  ],
  "completionRequirements": [""],
  "finalPortfolioOutcome": "",
  "jobPreparation": {
    "resumeActions": [""],
    "interviewActions": [""],
    "networkingActions": [""],
    "applicationActions": [""]
  },
  "motivationMessage": ""
}
`;
}

/* =========================================================
   Generate Career Roadmap
========================================================= */

export async function generateCareerRoadmap(req, res) {
  try {
    const validation = validateRoadmapRequest(req.body);

    if (!validation.valid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    const requestData = validation.data;

    const ai = createAIClient();

    const prompt = createRoadmapPrompt(requestData);

    const response = await ai.models.generateContent({
      model: getGeminiModel(),

      contents: prompt,

      config: {
        responseMimeType: "application/json",
      
      },
    });

    const parsedRoadmap = parseJSONResponse(response.text);

    const roadmap = normaliseRoadmap(
      parsedRoadmap,
      requestData
    );

    if (!roadmap.milestones.length) {
      throw new Error(
        "The AI did not generate any roadmap milestones."
      );
    }

    return res.status(200).json({
      success: true,
      roadmap,
    });
  } catch (error) {
    console.error("CAREER ROADMAP GENERATION ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Unable to generate the career roadmap.",
    });
  }
}

/* =========================================================
   Regenerate One Milestone
========================================================= */

export async function regenerateRoadmapMilestone(req, res) {
  try {
    const {
      roadmap,
      milestoneIndex,
      feedback = "",
    } = req.body;

    if (!roadmap || typeof roadmap !== "object") {
      return res.status(400).json({
        success: false,
        error: "Roadmap data is required.",
      });
    }

    const index = Number(milestoneIndex);

    if (
      !Number.isInteger(index) ||
      index < 0 ||
      index >= normaliseArray(roadmap.milestones).length
    ) {
      return res.status(400).json({
        success: false,
        error: "A valid milestone index is required.",
      });
    }

    const currentMilestone = roadmap.milestones[index];

    const ai = createAIClient();

    const prompt = `
You are an expert career coach and curriculum designer.

Rewrite one milestone from an existing career roadmap.

ROADMAP INFORMATION

Career goal:
${roadmap.careerGoal}

Target role:
${roadmap.targetRole}

Current level:
${roadmap.currentLevel}

Weekly study hours:
${roadmap.weeklyHours}

Milestone number:
${index + 1}

Current milestone:
${JSON.stringify(currentMilestone)}

Learner feedback:
${normaliseText(feedback, "Improve the milestone while keeping it realistic.")}

REQUIREMENTS

1. Keep the milestone suitable for month ${index + 1}.
2. Include exactly 4 weekly plans.
3. Each week must include 3 to 5 practical tasks.
4. Keep tasks realistic for ${roadmap.weeklyHours} study hours per week.
5. Include measurable deliverables and success criteria.
6. Include practical project work.
7. Do not include markdown.
8. Return only valid JSON.

Use this exact structure:

{
  "id": "",
  "monthNumber": ${index + 1},
  "title": "",
  "theme": "",
  "description": "",
  "mainGoal": "",
  "skillsToLearn": [""],
  "weeks": [
    {
      "id": "",
      "weekNumber": 1,
      "title": "",
      "focus": "",
      "objectives": [""],
      "tasks": [
        {
          "id": "",
          "title": "",
          "description": "",
          "taskType": "Practice",
          "difficulty": "Beginner",
          "estimatedMinutes": 45,
          "xpReward": 50,
          "skills": [""],
          "deliverable": "",
          "successCriteria": [""],
          "resources": [
            {
              "title": "",
              "type": "Documentation",
              "searchQuery": ""
            }
          ]
        }
      ],
      "weeklyProject": {
        "title": "",
        "description": "",
        "deliverables": [""],
        "estimatedHours": 3
      }
    }
  ],
  "milestoneProject": {
    "title": "",
    "description": "",
    "features": [""],
    "deliverables": [""]
  },
  "milestoneChecklist": [
    {
      "id": "",
      "text": ""
    }
  ],
  "milestoneXP": 300
}
`;

    const response = await ai.models.generateContent({
      model: getGeminiModel(),

      contents: prompt,

      config: {
        responseMimeType: "application/json",
        
      },
    });

    const parsedMilestone = parseJSONResponse(response.text);

    const milestone = normaliseMilestone(
      parsedMilestone,
      index
    );

    return res.status(200).json({
      success: true,
      milestone,
    });
  } catch (error) {
    console.error("ROADMAP MILESTONE REGENERATION ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Unable to regenerate this roadmap milestone.",
    });
  }
}

/* =========================================================
   Generate Daily Mission From Roadmap
========================================================= */

export async function generateDailyMissionFromRoadmap(
  req,
  res
) {
  try {
    const {
      roadmap,
      completedTaskIds = [],
      availableMinutes = 60,
      preferredDifficulty = "",
    } = req.body;

    if (!roadmap || typeof roadmap !== "object") {
      return res.status(400).json({
        success: false,
        error: "A career roadmap is required.",
      });
    }

    const ai = createAIClient();

    const safeAvailableMinutes = clampNumber(
      normaliseNumber(availableMinutes, 60),
      15,
      240
    );

    const roadmapSummary = {
      careerGoal: roadmap.careerGoal,
      targetRole: roadmap.targetRole,
      currentLevel: roadmap.currentLevel,
      currentMilestoneIndex:
        roadmap.currentMilestoneIndex || 0,
      currentWeekIndex: roadmap.currentWeekIndex || 0,
      milestones: normaliseArray(roadmap.milestones),
    };

    const prompt = `
You are an AI career coach creating one focused daily mission.

CAREER ROADMAP

${JSON.stringify(roadmapSummary)}

COMPLETED TASK IDS

${JSON.stringify(completedTaskIds)}

USER AVAILABILITY

Available time:
${safeAvailableMinutes} minutes

Preferred difficulty:
${normaliseText(preferredDifficulty, "Match the current roadmap stage")}

REQUIREMENTS

1. Select or adapt one useful activity from the user's current roadmap stage.
2. Do not repeat completed tasks.
3. The mission must fit within ${safeAvailableMinutes} minutes.
4. Make the mission practical, measurable and directly connected to the career goal.
5. Include clear steps.
6. Include a final deliverable.
7. Include success criteria.
8. Include a short reflection question.
9. Award between 20 and 300 XP.
10. Return only valid JSON.
11. Do not include markdown.

Use this exact structure:

{
  "id": "",
  "title": "",
  "description": "",
  "roadmapTaskId": "",
  "milestoneId": "",
  "weekId": "",
  "careerGoal": "",
  "difficulty": "",
  "estimatedMinutes": ${safeAvailableMinutes},
  "xpReward": 50,
  "skills": [""],
  "steps": [
    {
      "id": "",
      "title": "",
      "description": "",
      "estimatedMinutes": 10
    }
  ],
  "deliverable": "",
  "successCriteria": [""],
  "reflectionQuestion": "",
  "encouragement": ""
}
`;

    const response = await ai.models.generateContent({
      model: getGeminiModel(),

      contents: prompt,

      config: {
        responseMimeType: "application/json",
        
      },
    });

    const parsedMission = parseJSONResponse(response.text);

    const mission = {
      id:
        normaliseText(parsedMission?.id) ||
        `mission-${Date.now()}`,

      title: normaliseText(
        parsedMission?.title,
        "Today's Career Mission"
      ),

      description: normaliseText(
        parsedMission?.description,
        "Complete this task to move forward in your career roadmap."
      ),

      roadmapTaskId: normaliseText(
        parsedMission?.roadmapTaskId
      ),

      milestoneId: normaliseText(
        parsedMission?.milestoneId
      ),

      weekId: normaliseText(parsedMission?.weekId),

      careerGoal: normaliseText(
        parsedMission?.careerGoal,
        roadmap.careerGoal
      ),

      difficulty: normaliseText(
        parsedMission?.difficulty,
        "Beginner"
      ),

      estimatedMinutes: clampNumber(
        normaliseNumber(
          parsedMission?.estimatedMinutes,
          safeAvailableMinutes
        ),
        10,
        safeAvailableMinutes
      ),

      xpReward: clampNumber(
        normaliseNumber(parsedMission?.xpReward, 50),
        20,
        300
      ),

      skills: normaliseArray(parsedMission?.skills)
        .map((skill) => normaliseText(skill))
        .filter(Boolean),

      steps: normaliseArray(parsedMission?.steps)
        .map((step, index) => ({
          id:
            normaliseText(step?.id) ||
            `mission-step-${index + 1}`,

          title: normaliseText(
            step?.title,
            `Step ${index + 1}`
          ),

          description: normaliseText(
            step?.description,
            "Complete this step."
          ),

          estimatedMinutes: clampNumber(
            normaliseNumber(step?.estimatedMinutes, 10),
            5,
            safeAvailableMinutes
          ),

          completed: false,
        }))
        .filter((step) => step.title),

      deliverable: normaliseText(
        parsedMission?.deliverable,
        "A completed practical activity."
      ),

      successCriteria: normaliseArray(
        parsedMission?.successCriteria
      )
        .map((item) => normaliseText(item))
        .filter(Boolean),

      reflectionQuestion: normaliseText(
        parsedMission?.reflectionQuestion,
        "What did you learn from today's mission?"
      ),

      encouragement: normaliseText(
        parsedMission?.encouragement,
        "Complete one focused task today and keep building momentum."
      ),

      status: "pending",

      completed: false,

      createdAt: new Date().toISOString(),

      completedAt: null,
    };

    if (!mission.steps.length) {
      mission.steps = [
        {
          id: "mission-step-1",
          title: "Complete the mission",
          description: mission.description,
          estimatedMinutes: mission.estimatedMinutes,
          completed: false,
        },
      ];
    }

    return res.status(200).json({
      success: true,
      mission,
    });
  } catch (error) {
    console.error("DAILY MISSION GENERATION ERROR:");
    console.error(error);

    return res.status(500).json({
      success: false,
      error:
        error?.message ||
        "Unable to generate today's mission.",
    });
  }
}

export default generateCareerRoadmap;