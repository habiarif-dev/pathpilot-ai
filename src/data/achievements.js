import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  FileCheck2,
  Flame,
  Medal,
  Rocket,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from "lucide-react";

export const ACHIEVEMENT_CATEGORIES = {
  ALL: "All",
  MISSIONS: "Missions",
  PROJECTS: "Projects",
  ROADMAP: "Roadmap",
  RESUME: "Resume",
  XP: "XP",
};

export const ACHIEVEMENTS = [
  {
    id: "first-mission",
    title: "First Step",
    description: "Complete your first daily mission.",
    category: ACHIEVEMENT_CATEGORIES.MISSIONS,
    icon: CheckCircle2,
    xpReward: 25,
    rarity: "Common",
    condition: ({ completedMissions }) =>
      completedMissions >= 1,
  },
  {
    id: "mission-starter",
    title: "Mission Starter",
    description: "Complete three daily missions.",
    category: ACHIEVEMENT_CATEGORIES.MISSIONS,
    icon: BookOpen,
    xpReward: 50,
    rarity: "Common",
    condition: ({ completedMissions }) =>
      completedMissions >= 3,
  },
  {
    id: "daily-champion",
    title: "Daily Champion",
    description:
      "Complete every mission in your daily plan.",
    category: ACHIEVEMENT_CATEGORIES.MISSIONS,
    icon: Flame,
    xpReward: 100,
    rarity: "Rare",
    condition: ({
      completedMissions,
      totalMissions,
    }) =>
      totalMissions > 0 &&
      completedMissions >= totalMissions,
  },
  {
    id: "project-explorer",
    title: "Project Explorer",
    description: "Start your first AI project.",
    category: ACHIEVEMENT_CATEGORIES.PROJECTS,
    icon: Briefcase,
    xpReward: 50,
    rarity: "Common",
    condition: ({ startedProjects }) =>
      startedProjects >= 1,
  },
  {
    id: "project-builder",
    title: "Project Builder",
    description: "Complete your first AI project.",
    category: ACHIEVEMENT_CATEGORIES.PROJECTS,
    icon: Rocket,
    xpReward: 150,
    rarity: "Rare",
    condition: ({ completedProjects }) =>
      completedProjects >= 1,
  },
  {
    id: "portfolio-pro",
    title: "Portfolio Pro",
    description: "Complete three portfolio projects.",
    category: ACHIEVEMENT_CATEGORIES.PROJECTS,
    icon: Trophy,
    xpReward: 300,
    rarity: "Epic",
    condition: ({ completedProjects }) =>
      completedProjects >= 3,
  },
  {
    id: "roadmap-beginner",
    title: "Roadmap Beginner",
    description:
      "Reach at least 25% overall roadmap progress.",
    category: ACHIEVEMENT_CATEGORIES.ROADMAP,
    icon: Target,
    xpReward: 50,
    rarity: "Common",
    condition: ({ roadmapProgress }) =>
      roadmapProgress >= 25,
  },
  {
    id: "roadmap-halfway",
    title: "Halfway There",
    description:
      "Reach 50% overall roadmap progress.",
    category: ACHIEVEMENT_CATEGORIES.ROADMAP,
    icon: Medal,
    xpReward: 150,
    rarity: "Rare",
    condition: ({ roadmapProgress }) =>
      roadmapProgress >= 50,
  },
  {
    id: "roadmap-master",
    title: "Roadmap Master",
    description:
      "Complete every stage in your career roadmap.",
    category: ACHIEVEMENT_CATEGORIES.ROADMAP,
    icon: Trophy,
    xpReward: 500,
    rarity: "Legendary",
    condition: ({
      completedRoadmapStages,
      totalRoadmapStages,
    }) =>
      totalRoadmapStages > 0 &&
      completedRoadmapStages >=
        totalRoadmapStages,
  },
  {
    id: "resume-ready",
    title: "Resume Ready",
    description:
      "Analyze your resume for the first time.",
    category: ACHIEVEMENT_CATEGORIES.RESUME,
    icon: FileCheck2,
    xpReward: 75,
    rarity: "Common",
    condition: ({ hasResumeAnalysis }) =>
      hasResumeAnalysis,
  },
  {
    id: "strong-resume",
    title: "Strong Resume",
    description:
      "Receive a resume score of 80 or higher.",
    category: ACHIEVEMENT_CATEGORIES.RESUME,
    icon: Award,
    xpReward: 150,
    rarity: "Rare",
    condition: ({ resumeScore }) =>
      resumeScore >= 80,
  },
  {
    id: "ats-expert",
    title: "ATS Expert",
    description:
      "Receive a resume score of 90 or higher.",
    category: ACHIEVEMENT_CATEGORIES.RESUME,
    icon: Sparkles,
    xpReward: 300,
    rarity: "Epic",
    condition: ({ resumeScore }) =>
      resumeScore >= 90,
  },
  {
    id: "xp-100",
    title: "Rising Learner",
    description: "Earn your first 100 XP.",
    category: ACHIEVEMENT_CATEGORIES.XP,
    icon: Zap,
    xpReward: 25,
    rarity: "Common",
    condition: ({ baseXp }) => baseXp >= 100,
  },
  {
    id: "xp-500",
    title: "Career Explorer",
    description: "Earn at least 500 XP.",
    category: ACHIEVEMENT_CATEGORIES.XP,
    icon: Star,
    xpReward: 75,
    rarity: "Rare",
    condition: ({ baseXp }) => baseXp >= 500,
  },
  {
    id: "xp-1000",
    title: "Growth Champion",
    description: "Earn at least 1,000 XP.",
    category: ACHIEVEMENT_CATEGORIES.XP,
    icon: Trophy,
    xpReward: 200,
    rarity: "Epic",
    condition: ({ baseXp }) => baseXp >= 1000,
  },
];

export function evaluateAchievements(progressData) {
  return ACHIEVEMENTS.map((achievement) => ({
    ...achievement,
    unlocked: Boolean(
      achievement.condition(progressData)
    ),
  }));
}

export function getUnlockedAchievements(
  progressData
) {
  return evaluateAchievements(progressData).filter(
    (achievement) => achievement.unlocked
  );
}

export function getLockedAchievements(progressData) {
  return evaluateAchievements(progressData).filter(
    (achievement) => !achievement.unlocked
  );
}

export function calculateAchievementXp(
  achievements
) {
  return achievements.reduce(
    (total, achievement) =>
      total + (achievement.xpReward || 0),
    0
  );
}

export function saveUnlockedAchievements(
  achievements
) {
  const achievementIds = achievements.map(
    (achievement) => achievement.id
  );

  localStorage.setItem(
    "pathpilot_achievements",
    JSON.stringify(achievementIds)
  );

  return achievementIds;
}

export function loadSavedAchievementIds() {
  const savedAchievements = localStorage.getItem(
    "pathpilot_achievements"
  );

  if (!savedAchievements) {
    return [];
  }

  try {
    const parsedAchievements = JSON.parse(
      savedAchievements
    );

    return Array.isArray(parsedAchievements)
      ? parsedAchievements
      : [];
  } catch (error) {
    console.error(
      "Unable to load saved achievements:",
      error
    );

    return [];
  }
}