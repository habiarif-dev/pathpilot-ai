const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

/* =========================================================
   Shared Request Helper
========================================================= */

async function postRequest(endpoint, payload) {
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
  } catch (error) {
    throw new Error(
      "Unable to connect to the PathPilot server. Make sure the backend is running."
    );
  }

  let result;

  try {
    result = await response.json();
  } catch (error) {
    throw new Error(
      "The server returned an invalid response. Please try again."
    );
  }

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.error || "The request could not be completed."
    );
  }

  return result;
}

/* =========================================================
   Generate Career Roadmap
========================================================= */

export async function generateCareerRoadmap(roadmapData) {
  const result = await postRequest(
    "/api/career-roadmap/generate",
    roadmapData
  );

  if (!result.roadmap) {
    throw new Error(
      "The server did not return a career roadmap."
    );
  }

  return result.roadmap;
}

/* =========================================================
   Regenerate One Milestone
========================================================= */

export async function regenerateRoadmapMilestone({
  roadmap,
  milestoneIndex,
  feedback = "",
}) {
  const result = await postRequest(
    "/api/career-roadmap/regenerate-milestone",
    {
      roadmap,
      milestoneIndex,
      feedback,
    }
  );

  if (!result.milestone) {
    throw new Error(
      "The server did not return a regenerated milestone."
    );
  }

  return result.milestone;
}

/* =========================================================
   Generate Daily Mission From Roadmap
========================================================= */

export async function generateDailyMissionFromRoadmap({
  roadmap,
  completedTaskIds = [],
  availableMinutes = 60,
  preferredDifficulty = "",
}) {
  const result = await postRequest(
    "/api/career-roadmap/daily-mission",
    {
      roadmap,
      completedTaskIds,
      availableMinutes,
      preferredDifficulty,
    }
  );

  if (!result.mission) {
    throw new Error(
      "The server did not return a daily mission."
    );
  }

  return result.mission;
}

/* =========================================================
   Local Storage Keys
========================================================= */

export const CAREER_ROADMAP_STORAGE_KEY =
  "pathpilot_career_roadmap";

export const ROADMAP_HISTORY_STORAGE_KEY =
  "pathpilot_roadmap_history";

export const DAILY_MISSION_STORAGE_KEY =
  "pathpilot_daily_mission";

export const DAILY_MISSION_HISTORY_STORAGE_KEY =
  "pathpilot_daily_mission_history";

/* =========================================================
   Local Storage Helpers
========================================================= */

export function saveCareerRoadmap(roadmap) {
  if (!roadmap) {
    return;
  }

  const updatedRoadmap = {
    ...roadmap,
    updatedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    CAREER_ROADMAP_STORAGE_KEY,
    JSON.stringify(updatedRoadmap)
  );

  return updatedRoadmap;
}

export function getSavedCareerRoadmap() {
  try {
    const savedRoadmap = localStorage.getItem(
      CAREER_ROADMAP_STORAGE_KEY
    );

    return savedRoadmap ? JSON.parse(savedRoadmap) : null;
  } catch (error) {
    console.error(
      "Unable to read the saved career roadmap:",
      error
    );

    return null;
  }
}

export function removeSavedCareerRoadmap() {
  localStorage.removeItem(CAREER_ROADMAP_STORAGE_KEY);
}

export function saveRoadmapToHistory(roadmap) {
  if (!roadmap) {
    return;
  }

  try {
    const currentHistory = getRoadmapHistory();

    const historyItem = {
      ...roadmap,
      archivedAt: new Date().toISOString(),
    };

    const filteredHistory = currentHistory.filter(
      (item) => item.id !== roadmap.id
    );

    const updatedHistory = [
      historyItem,
      ...filteredHistory,
    ].slice(0, 10);

    localStorage.setItem(
      ROADMAP_HISTORY_STORAGE_KEY,
      JSON.stringify(updatedHistory)
    );

    return updatedHistory;
  } catch (error) {
    console.error(
      "Unable to save roadmap history:",
      error
    );

    return [];
  }
}

export function getRoadmapHistory() {
  try {
    const savedHistory = localStorage.getItem(
      ROADMAP_HISTORY_STORAGE_KEY
    );

    const parsedHistory = savedHistory
      ? JSON.parse(savedHistory)
      : [];

    return Array.isArray(parsedHistory)
      ? parsedHistory
      : [];
  } catch (error) {
    console.error(
      "Unable to read roadmap history:",
      error
    );

    return [];
  }
}

export function deleteRoadmapFromHistory(roadmapId) {
  const updatedHistory = getRoadmapHistory().filter(
    (item) => item.id !== roadmapId
  );

  localStorage.setItem(
    ROADMAP_HISTORY_STORAGE_KEY,
    JSON.stringify(updatedHistory)
  );

  return updatedHistory;
}

/* =========================================================
   Daily Mission Storage
========================================================= */

export function saveDailyMission(mission) {
  if (!mission) {
    return;
  }

  localStorage.setItem(
    DAILY_MISSION_STORAGE_KEY,
    JSON.stringify(mission)
  );

  return mission;
}

export function getSavedDailyMission() {
  try {
    const savedMission = localStorage.getItem(
      DAILY_MISSION_STORAGE_KEY
    );

    return savedMission ? JSON.parse(savedMission) : null;
  } catch (error) {
    console.error(
      "Unable to read the saved daily mission:",
      error
    );

    return null;
  }
}

export function removeSavedDailyMission() {
  localStorage.removeItem(DAILY_MISSION_STORAGE_KEY);
}

export function saveDailyMissionToHistory(mission) {
  if (!mission) {
    return [];
  }

  try {
    const currentHistory = getDailyMissionHistory();

    const filteredHistory = currentHistory.filter(
      (item) => item.id !== mission.id
    );

    const updatedHistory = [
      mission,
      ...filteredHistory,
    ].slice(0, 30);

    localStorage.setItem(
      DAILY_MISSION_HISTORY_STORAGE_KEY,
      JSON.stringify(updatedHistory)
    );

    return updatedHistory;
  } catch (error) {
    console.error(
      "Unable to save daily mission history:",
      error
    );

    return [];
  }
}

export function getDailyMissionHistory() {
  try {
    const savedHistory = localStorage.getItem(
      DAILY_MISSION_HISTORY_STORAGE_KEY
    );

    const parsedHistory = savedHistory
      ? JSON.parse(savedHistory)
      : [];

    return Array.isArray(parsedHistory)
      ? parsedHistory
      : [];
  } catch (error) {
    console.error(
      "Unable to read daily mission history:",
      error
    );

    return [];
  }
}

/* =========================================================
   Roadmap Progress Helpers
========================================================= */

export function calculateRoadmapProgress(roadmap) {
  if (!roadmap?.milestones?.length) {
    return 0;
  }

  const tasks = roadmap.milestones.flatMap((milestone) =>
    (milestone.weeks || []).flatMap(
      (week) => week.tasks || []
    )
  );

  if (!tasks.length) {
    return 0;
  }

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  return Math.round(
    (completedTasks / tasks.length) * 100
  );
}

export function calculateWeekProgress(week) {
  const tasks = Array.isArray(week?.tasks)
    ? week.tasks
    : [];

  if (!tasks.length) {
    return 0;
  }

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  return Math.round(
    (completedTasks / tasks.length) * 100
  );
}

export function calculateMilestoneProgress(milestone) {
  const tasks = (milestone?.weeks || []).flatMap(
    (week) => week.tasks || []
  );

  if (!tasks.length) {
    return 0;
  }

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  return Math.round(
    (completedTasks / tasks.length) * 100
  );
}

export function getCompletedTaskIds(roadmap) {
  if (!roadmap?.milestones?.length) {
    return [];
  }

  return roadmap.milestones.flatMap((milestone) =>
    (milestone.weeks || []).flatMap((week) =>
      (week.tasks || [])
        .filter((task) => task.completed)
        .map((task) => task.id)
    )
  );
}

export function getAllRoadmapTasks(roadmap) {
  if (!roadmap?.milestones?.length) {
    return [];
  }

  return roadmap.milestones.flatMap(
    (milestone, milestoneIndex) =>
      (milestone.weeks || []).flatMap(
        (week, weekIndex) =>
          (week.tasks || []).map(
            (task, taskIndex) => ({
              ...task,
              milestoneId: milestone.id,
              milestoneTitle: milestone.title,
              milestoneIndex,
              weekId: week.id,
              weekTitle: week.title,
              weekIndex,
              taskIndex,
            })
          )
      )
  );
}

export function getNextIncompleteTask(roadmap) {
  const tasks = getAllRoadmapTasks(roadmap);

  return (
    tasks.find((task) => !task.completed) || null
  );
}

export function getCurrentRoadmapPosition(roadmap) {
  if (!roadmap?.milestones?.length) {
    return {
      milestoneIndex: 0,
      weekIndex: 0,
      taskIndex: 0,
      task: null,
    };
  }

  for (
    let milestoneIndex = 0;
    milestoneIndex < roadmap.milestones.length;
    milestoneIndex += 1
  ) {
    const milestone =
      roadmap.milestones[milestoneIndex];

    for (
      let weekIndex = 0;
      weekIndex < (milestone.weeks || []).length;
      weekIndex += 1
    ) {
      const week = milestone.weeks[weekIndex];

      const taskIndex = (week.tasks || []).findIndex(
        (task) => !task.completed
      );

      if (taskIndex !== -1) {
        return {
          milestoneIndex,
          weekIndex,
          taskIndex,
          task: week.tasks[taskIndex],
        };
      }
    }
  }

  return {
    milestoneIndex:
      roadmap.milestones.length - 1,
    weekIndex:
      roadmap.milestones.at(-1)?.weeks?.length - 1 || 0,
    taskIndex: -1,
    task: null,
  };
}

/* =========================================================
   Update Roadmap Task
========================================================= */

export function updateRoadmapTaskStatus({
  roadmap,
  taskId,
  completed,
}) {
  if (!roadmap || !taskId) {
    return roadmap;
  }

  const updatedMilestones = roadmap.milestones.map(
    (milestone) => {
      const updatedWeeks = milestone.weeks.map(
        (week) => {
          const updatedTasks = week.tasks.map(
            (task) => {
              if (task.id !== taskId) {
                return task;
              }

              return {
                ...task,
                completed,
                completedAt: completed
                  ? new Date().toISOString()
                  : null,
              };
            }
          );

          const progress = calculateWeekProgress({
            ...week,
            tasks: updatedTasks,
          });

          return {
            ...week,
            tasks: updatedTasks,
            progress,
            completed: progress === 100,
          };
        }
      );

      const progress = calculateMilestoneProgress({
        ...milestone,
        weeks: updatedWeeks,
      });

      return {
        ...milestone,
        weeks: updatedWeeks,
        progress,
        completed: progress === 100,
      };
    }
  );

  const roadmapWithUpdatedTasks = {
    ...roadmap,
    milestones: updatedMilestones,
    updatedAt: new Date().toISOString(),
  };

  const currentPosition = getCurrentRoadmapPosition(
    roadmapWithUpdatedTasks
  );

  const updatedRoadmap = {
    ...roadmapWithUpdatedTasks,
    progress: calculateRoadmapProgress(
      roadmapWithUpdatedTasks
    ),
    currentMilestoneIndex:
      currentPosition.milestoneIndex,
    currentWeekIndex: currentPosition.weekIndex,
  };

  saveCareerRoadmap(updatedRoadmap);

  return updatedRoadmap;
}

/* =========================================================
   Update Whole Milestone
========================================================= */

export function replaceRoadmapMilestone({
  roadmap,
  milestoneIndex,
  milestone,
}) {
  if (
    !roadmap ||
    !milestone ||
    !Number.isInteger(milestoneIndex)
  ) {
    return roadmap;
  }

  const updatedMilestones = [
    ...roadmap.milestones,
  ];

  updatedMilestones[milestoneIndex] = milestone;

  const updatedRoadmap = {
    ...roadmap,
    milestones: updatedMilestones,
    progress: calculateRoadmapProgress({
      ...roadmap,
      milestones: updatedMilestones,
    }),
    updatedAt: new Date().toISOString(),
  };

  saveCareerRoadmap(updatedRoadmap);

  return updatedRoadmap;
}

/* =========================================================
   XP Helpers
========================================================= */

export function calculateEarnedRoadmapXP(roadmap) {
  if (!roadmap?.milestones?.length) {
    return 0;
  }

  return roadmap.milestones.reduce(
    (roadmapTotal, milestone) => {
      const taskXP = (milestone.weeks || []).reduce(
        (weekTotal, week) => {
          return (
            weekTotal +
            (week.tasks || []).reduce(
              (taskTotal, task) =>
                taskTotal +
                (task.completed
                  ? Number(task.xpReward) || 0
                  : 0),
              0
            )
          );
        },
        0
      );

      const milestoneXP = milestone.completed
        ? Number(milestone.milestoneXP) || 0
        : 0;

      return roadmapTotal + taskXP + milestoneXP;
    },
    0
  );
}

/* =========================================================
   Date Helpers
========================================================= */

export function isMissionFromToday(mission) {
  if (!mission?.createdAt) {
    return false;
  }

  const missionDate = new Date(
    mission.createdAt
  ).toDateString();

  const today = new Date().toDateString();

  return missionDate === today;
}

export function formatRoadmapDate(dateValue) {
  if (!dateValue) {
    return "";
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(dateValue));
}