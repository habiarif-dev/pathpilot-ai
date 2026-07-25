import useAchievements from "../hooks/useAchievements";
import AchievementCard from "../components/AchievementCard";
import useStreak from "../hooks/useStreak";
import StreakCard from "../components/StreakCard";
import { getDashboardInsights } from "../services/dashboardInsightsService";
import AIInsightsCard from "../components/dashboard/AIInsightsCard";
import {
  ArrowRight,
  BookOpen,
  Briefcase,
  CheckCircle2,
  Circle,
  Clock,
  FileText,
  Flame,
  RefreshCw,
  Sparkles,
  Target,
  TrendingUp,
  Trophy,
} from "lucide-react";
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";

import RoadmapCard from "../components/RoadmapCard";

const DEFAULT_USER = {
  name: "PathPilot User",
  careerGoal: "Build Your Career",
  experience: "Beginner",
  skills: [],
  interests: [],
  dailyTime: "1 hour",
};

const DEFAULT_ROADMAP = [
  {
    id: "phase-1",
    title: "Strengthen Your Core Skills",
    description:
      "Build a strong foundation based on your current skill level and career goals.",
    duration: "Weeks 1–2",
    progress: 25,
    completed: false,
    difficulty: "Beginner",
    tasks: [
      "Review the fundamentals of your main career skill.",
      "Complete at least three focused practice sessions.",
      "Write short notes about the concepts you learn.",
    ],
    icon: BookOpen,
  },
  {
    id: "phase-2",
    title: "Build Real-World Projects",
    description:
      "Apply your knowledge by creating practical projects for your portfolio.",
    duration: "Weeks 3–5",
    progress: 0,
    completed: false,
    difficulty: "Intermediate",
    tasks: [
      "Choose one portfolio-ready project idea.",
      "Break the project into manageable milestones.",
      "Publish your progress and final work on GitHub.",
    ],
    icon: Briefcase,
  },
  {
    id: "phase-3",
    title: "Improve Your Professional Profile",
    description:
      "Prepare your resume, portfolio, and professional presence for opportunities.",
    duration: "Weeks 6–8",
    progress: 0,
    completed: false,
    difficulty: "Intermediate",
    tasks: [
      "Improve your resume with measurable achievements.",
      "Update your LinkedIn and GitHub profiles.",
      "Add your strongest projects to your portfolio.",
    ],
    icon: FileText,
  },
  {
    id: "phase-4",
    title: "Prepare for Career Opportunities",
    description:
      "Practice interviews, improve communication, and prepare for your target career.",
    duration: "Weeks 9–10",
    progress: 0,
    completed: false,
    difficulty: "Advanced",
    tasks: [
      "Practice common interview questions.",
      "Prepare a clear introduction about your skills.",
      "Apply to suitable internships, jobs, or client projects.",
    ],
    icon: Target,
  },
];

const DAILY_MISSION_TEMPLATES = [
  {
    id: 1,
    title: "Complete a 30-minute learning session",
    category: "Learning",
  },
  {
    id: 2,
    title: "Practice one skill from your roadmap",
    category: "Practice",
  },
  {
    id: 3,
    title: "Work on your current project",
    category: "Project",
  },
];

function safelyParseJSON(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Unable to parse PathPilot data:", error);
    return fallback;
  }
}

function getRoadmapIcon(index) {
  const icons = [
    BookOpen,
    Briefcase,
    FileText,
    Target,
  ];

  return icons[index] || Target;
}

function getRoadmapDifficulty(index) {
  const difficulties = [
    "Beginner",
    "Intermediate",
    "Intermediate",
    "Advanced",
  ];

  return difficulties[index] || "Beginner";
}

function getRoadmapTasks(phase, index) {
  if (
    Array.isArray(phase.tasks) &&
    phase.tasks.length > 0
  ) {
    return phase.tasks;
  }

  const fallbackTasks = [
    [
      "Learn the key concepts required for this stage.",
      "Complete focused practice sessions.",
      "Track the topics you understand and those needing review.",
    ],
    [
      "Choose a practical project idea.",
      "Divide it into smaller milestones.",
      "Document and publish your completed work.",
    ],
    [
      "Improve your resume and portfolio.",
      "Update your professional profiles.",
      "Present your skills and projects clearly.",
    ],
    [
      "Practice interview and communication skills.",
      "Search for relevant opportunities.",
      "Prepare and submit strong applications.",
    ],
  ];

  return fallbackTasks[index] || fallbackTasks[0];
}

function Dashboard() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [aiInsights, setAiInsights] = useState([]);
  const [loadingInsights, setLoadingInsights] = useState(true);
  const [roadmap, setRoadmap] = useState([]);
  const [completedTasks, setCompletedTasks] =
    useState([]);
  const [expandedRoadmapId, setExpandedRoadmapId] =
    useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = safelyParseJSON(
      localStorage.getItem("pathpilot_user"),
      null
    );

    const storedRoadmap = safelyParseJSON(
      localStorage.getItem("pathpilot_roadmap"),
      null
    );

    const storedTasks = safelyParseJSON(
      localStorage.getItem(
        "pathpilot_completed_tasks"
      ),
      []
    );

    if (!storedUser) {
      navigate("/onboarding", {
        replace: true,
      });

      return;
    }

    setUserData({
      ...DEFAULT_USER,
      ...storedUser,
      skills: Array.isArray(storedUser.skills)
        ? storedUser.skills
        : [],
      interests: Array.isArray(storedUser.interests)
        ? storedUser.interests
        : [],
    });

    let normalizedRoadmap = DEFAULT_ROADMAP;

    if (
      storedRoadmap &&
      Array.isArray(storedRoadmap.phases) &&
      storedRoadmap.phases.length > 0
    ) {
      normalizedRoadmap =
        storedRoadmap.phases.map(
          (phase, index) => {
            const progress =
              typeof phase.progress === "number"
                ? Math.min(
                    100,
                    Math.max(0, phase.progress)
                  )
                : phase.completed
                  ? 100
                  : index === 0
                    ? 25
                    : 0;

            return {
              id:
                phase.id ||
                `phase-${index + 1}`,
              title:
                phase.title ||
                `Roadmap Phase ${index + 1}`,
              description:
                phase.description ||
                "Continue developing the skills needed for your career journey.",
              duration:
                phase.duration ||
                "Flexible timeline",
              progress,
              completed:
                phase.completed ||
                progress === 100,
              difficulty:
                phase.difficulty ||
                getRoadmapDifficulty(index),
              tasks: getRoadmapTasks(
                phase,
                index
              ),
              icon: getRoadmapIcon(index),
            };
          }
        );
    }

    setRoadmap(normalizedRoadmap);
    setExpandedRoadmapId(
      normalizedRoadmap[0]?.id || null
    );

    setCompletedTasks(
      Array.isArray(storedTasks)
        ? storedTasks.filter((taskId) =>
            DAILY_MISSION_TEMPLATES.some(
              (mission) =>
                mission.id === taskId
            )
          )
        : []
    );

    setIsLoading(false);
  }, [navigate]);

  const user = userData || DEFAULT_USER;

  const saveRoadmap = (updatedRoadmap) => {
    setRoadmap(updatedRoadmap);

    const roadmapForStorage =
      updatedRoadmap.map((item) => ({
        id: item.id,
        title: item.title,
        description: item.description,
        duration: item.duration,
        progress: item.progress,
        completed: item.completed,
        difficulty: item.difficulty,
        tasks: item.tasks,
      }));

    localStorage.setItem(
      "pathpilot_roadmap",
      JSON.stringify({
        phases: roadmapForStorage,
        updatedAt: new Date().toISOString(),
      })
    );
  };

  const updateRoadmapProgress = (
    roadmapId,
    amount
  ) => {
    const updatedRoadmap = roadmap.map(
      (item) => {
        if (item.id !== roadmapId) {
          return item;
        }

        const updatedProgress = Math.min(
          100,
          Math.max(
            0,
            item.progress + amount
          )
        );

        return {
          ...item,
          progress: updatedProgress,
          completed: updatedProgress === 100,
        };
      }
    );

    saveRoadmap(updatedRoadmap);
  };

  const toggleRoadmapComplete = (
    roadmapId
  ) => {
    const updatedRoadmap = roadmap.map(
      (item) => {
        if (item.id !== roadmapId) {
          return item;
        }

        const willBeCompleted =
          !item.completed;

        return {
          ...item,
          completed: willBeCompleted,
          progress: willBeCompleted
            ? 100
            : 0,
        };
      }
    );

    saveRoadmap(updatedRoadmap);
  };

  const dailyMissions = useMemo(
    () =>
      DAILY_MISSION_TEMPLATES.map(
        (mission) => ({
          ...mission,
          completed:
            completedTasks.includes(
              mission.id
            ),
        })
      ),
    [completedTasks]
  );

  const toggleTask = (taskId) => {
    setCompletedTasks(
      (previousTasks) => {
        const updatedTasks =
          previousTasks.includes(taskId)
            ? previousTasks.filter(
                (id) => id !== taskId
              )
            : [
                ...previousTasks,
                taskId,
              ];

        localStorage.setItem(
          "pathpilot_completed_tasks",
          JSON.stringify(updatedTasks)
        );

        return updatedTasks;
      }
    );
  };

  const completedCount =
    dailyMissions.filter(
      (mission) => mission.completed
    ).length;

  const dailyProgress =
    dailyMissions.length > 0
      ? Math.round(
          (completedCount /
            dailyMissions.length) *
            100
        )
      : 0;

  const overallRoadmapProgress =
    roadmap.length > 0
      ? Math.round(
          roadmap.reduce(
            (total, item) =>
              total + item.progress,
            0
          ) / roadmap.length
        )
      : 0;

  const completedRoadmapStages =
    roadmap.filter(
      (item) =>
        item.completed ||
        item.progress === 100
    ).length;

           const projectStatusData = useMemo(() => {
    const storedProjects = safelyParseJSON(
      localStorage.getItem(
        "pathpilot_project_status"
      ),
      {}
    );

    if (Array.isArray(storedProjects)) {
      return storedProjects;
    }

    if (
      storedProjects &&
      typeof storedProjects === "object"
    ) {
      return Object.values(storedProjects);
    }

    return [];
  }, []);

  const resumeAnalysis = useMemo(
    () =>
      safelyParseJSON(
        localStorage.getItem(
          "pathpilot_resume_analysis"
        ),
        null
      ),
    []
  );

  const normalizeProjectStatus = (project) => {
    if (typeof project === "string") {
      return project.toLowerCase();
    }

    if (
      project &&
      typeof project === "object"
    ) {
      return String(
        project.status ||
          project.progressStatus ||
          project.state ||
          ""
      ).toLowerCase();
    }

    return "";
  };

  const startedProjects =
    projectStatusData.filter((project) => {
      const status =
        normalizeProjectStatus(project);

      return [
        "started",
        "in-progress",
        "in progress",
        "active",
        "completed",
        "complete",
      ].includes(status);
    }).length;

  const completedProjects =
    projectStatusData.filter((project) => {
      const status =
        normalizeProjectStatus(project);

      return [
        "completed",
        "complete",
        "finished",
      ].includes(status);
    }).length;

  const resumeScore = Number(
    resumeAnalysis?.score ||
      resumeAnalysis?.overallScore ||
      resumeAnalysis?.atsScore ||
      0
  );

  const baseXp =
    overallRoadmapProgress * 10 +
    completedCount * 50 +
    startedProjects * 75 +
    completedProjects * 150;

  const achievementData = useMemo(
    () => ({
      completedMissions: completedCount,
      totalMissions: dailyMissions.length,

      startedProjects,
      completedProjects,

      roadmapProgress:
        overallRoadmapProgress,
      completedRoadmapStages,
      totalRoadmapStages: roadmap.length,

      hasResumeAnalysis:
        Boolean(resumeAnalysis),
      resumeScore,

      baseXp,
    }),
    [
      completedCount,
      dailyMissions.length,
      startedProjects,
      completedProjects,
      overallRoadmapProgress,
      completedRoadmapStages,
      roadmap.length,
      resumeAnalysis,
      resumeScore,
      baseXp,
    ]
  );

  const {
    recentAchievements,
    unlockedCount,
    totalCount,
    achievementProgress,
    achievementXp,
    newAchievement,
    dismissNewAchievement,
  } = useAchievements(achievementData);

  const {
  currentStreak,
  longestStreak,
  nextReward,
  streakXp,
  progressToNextReward,
 } = useStreak();

   const xp =
  baseXp +
  achievementXp +
  streakXp;

  const level = Math.floor(xp / 500) + 1;

  const resetJourney = () => {
    const confirmed = window.confirm(
      "Are you sure you want to restart your PathPilot journey? Your saved roadmap, missions, and project progress will be removed."
    );

    if (!confirmed) {
      return;
    }

    localStorage.removeItem(
      "pathpilot_user"
    );
    localStorage.removeItem(
      "pathpilot_roadmap"
    );
    localStorage.removeItem(
      "pathpilot_completed_tasks"
    );
    localStorage.removeItem(
      "pathpilot_project_status"
    );
    localStorage.removeItem(
      "pathpilot_resume_analysis"
    );
        localStorage.removeItem(
      "pathpilot_achievements"
    );
    localStorage.removeItem(
      "pathpilot_streak"
    );

    navigate("/onboarding", {
      replace: true,
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600">
            <Sparkles className="h-7 w-7 animate-pulse text-white" />
          </div>

          <p className="font-medium text-slate-600 dark:text-slate-400">
            Loading your PathPilot
            dashboard...
          </p>
        </div>
      </div>
    );
  }

  useEffect(() => {
  if (!userData) return;

  async function loadInsights() {
    try {
      setLoadingInsights(true);

      const insights = await getDashboardInsights({
        name: user.name,
        careerGoal: user.careerGoal,
        experience: user.experience,
        skills: user.skills,
        interests: user.interests,

        roadmapProgress: overallRoadmapProgress,
        completedRoadmapStages,
        totalRoadmapStages: roadmap.length,

        completedMissions: completedCount,
        totalMissions: dailyMissions.length,

        currentStreak,

        xp,

        hasResumeAnalysis: Boolean(resumeAnalysis),
        resumeScore,

        startedProjects,
        completedProjects,
      });

      setAiInsights(insights);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingInsights(false);
    }
  }

  loadInsights();
}, [
  userData,
  overallRoadmapProgress,
  completedRoadmapStages,
  roadmap.length,
  completedCount,
  dailyMissions.length,
  currentStreak,
  xp,
  resumeAnalysis,
  resumeScore,
  startedProjects,
  completedProjects,
]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Welcome section */}

        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-xl shadow-indigo-500/15 md:p-8">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />

                  <span className="text-sm font-medium text-indigo-100">
                    Your AI Career Dashboard
                  </span>
                </div>

                <h1 className="text-2xl font-bold md:text-3xl">
                  Welcome back, {user.name}! 👋
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-indigo-100">
                  Keep learning, complete your
                  roadmap stages, and move one
                  step closer to{" "}
                  {user.careerGoal}.
                </p>
              </div>

              <div className="flex-shrink-0">
                <div className="flex h-24 w-24 items-center justify-center rounded-full border border-white/20 bg-white/10 backdrop-blur-sm">
                  <TrendingUp className="h-10 w-10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
              <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Career Goal
            </p>

            <h3 className="mt-1 line-clamp-2 font-semibold">
              {user.careerGoal}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Roadmap Progress
            </p>

            <h3 className="mt-1 font-semibold">
              {overallRoadmapProgress}%
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {completedRoadmapStages} of{" "}
              {roadmap.length} stages completed
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <Clock className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Daily Learning
            </p>

            <h3 className="mt-1 font-semibold">
              {user.dailyTime}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30">
              <Trophy className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Current Level
            </p>

            <h3 className="mt-1 font-semibold">
              Level {level}
            </h3>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {xp} XP earned
            </p>
          </div>
        </section>

                     {/* Achievement progress */}

        <section className="mb-8">
          <div className="relative overflow-hidden rounded-2xl border border-amber-200 bg-white p-6 dark:border-amber-900/50 dark:bg-slate-900">
            <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-amber-400/10 blur-3xl" />

            <div className="relative">
              <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
                    <Trophy className="h-7 w-7 text-amber-600 dark:text-amber-400" />
                  </div>

                  <div>
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      Achievement Progress
                    </p>

                    <h2 className="mt-1 text-2xl font-bold">
                      {unlockedCount} of {totalCount} unlocked
                    </h2>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {achievementProgress}%
                  </p>

                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {achievementXp} bonus XP earned
                  </p>
                </div>
              </div>

              <div className="mt-5 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-500"
                  style={{
                    width: `${achievementProgress}%`,
                  }}
                />
              </div>

              <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
                Complete missions, projects, roadmap
                stages, and resume analyses to unlock
                more rewards.
              </p>
            </div>
          </div>
        </section>

                          

        {/* Daily streak */}

        <section className="mb-8">
          <StreakCard
            currentStreak={currentStreak}
            longestStreak={longestStreak}
            nextReward={nextReward}
            progressToNextReward={
              progressToNextReward
            }
            streakXp={streakXp}
          />
        </section>

        

        {/* Dashboard grid */}

        <section className="grid grid-cols-1 gap-8 xl:grid-cols-3">
          {/* Roadmap */}

          <div className="xl:col-span-2">
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Career journey
                </span>

                <h2 className="mt-1 text-2xl font-bold">
                  Your Career Roadmap
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Open each stage to update
                  progress and review your tasks.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/daily-mission")
                }
                className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 transition-all hover:gap-3 dark:text-indigo-400"
              >
                View Missions
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-4">
              {roadmap.map(
                (item, index) => (
                  <RoadmapCard
                    key={item.id}
                    item={item}
                    index={index}
                    isExpanded={
                      expandedRoadmapId ===
                      item.id
                    }
                    onToggleExpand={() =>
                      setExpandedRoadmapId(
                        (currentId) =>
                          currentId === item.id
                            ? null
                            : item.id
                      )
                    }
                    onIncreaseProgress={() =>
                      updateRoadmapProgress(
                        item.id,
                        10
                      )
                    }
                    onDecreaseProgress={() =>
                      updateRoadmapProgress(
                        item.id,
                        -10
                      )
                    }
                    onToggleComplete={() =>
                      toggleRoadmapComplete(
                        item.id
                      )
                    }
                  />
                )
              )}
            </div>
          </div>

          {/* Right column */}

          <div className="space-y-6">
            {/* Progress card */}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold">
                    Journey Progress
                  </h2>

                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Your complete career journey
                  </p>
                </div>

                <div className="rounded-xl bg-indigo-100 p-2 dark:bg-indigo-900/30">
                  <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>

              <div className="mt-5 flex items-end justify-between">
                <span className="text-3xl font-bold">
                  {overallRoadmapProgress}%
                </span>

                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                  Level {level}
                </span>
              </div>

              <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width: `${overallRoadmapProgress}%`,
                  }}
                />
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    XP Earned
                  </p>

                  <p className="mt-1 font-bold">
                    {xp}
                  </p>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-800/60">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Stages
                  </p>

                  <p className="mt-1 font-bold">
                    {completedRoadmapStages}/
                    {roadmap.length}
                  </p>
                </div>
              </div>
            </div>

            {/* Daily mission */}

            <div>
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    Daily Mission
                  </h2>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Small steps. Big progress.
                  </p>
                </div>

                <div className="rounded-xl bg-orange-100 p-2 dark:bg-orange-900/30">
                  <Flame className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>

              <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Today&apos;s Progress
                  </span>

                  <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                    {dailyProgress}%
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{
                      width: `${dailyProgress}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  {completedCount} of{" "}
                  {dailyMissions.length} missions
                  completed
                </p>
              </div>

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
                {dailyMissions.map(
                  (mission, index) => (
                    <button
                      type="button"
                      key={mission.id}
                      onClick={() =>
                        toggleTask(mission.id)
                      }
                      className={`flex w-full items-start gap-3 p-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                        index !==
                        dailyMissions.length - 1
                          ? "border-b border-slate-200 dark:border-slate-800"
                          : ""
                      }`}
                      aria-pressed={
                        mission.completed
                      }
                    >
                      <div className="mt-0.5">
                        {mission.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            mission.completed
                              ? "text-slate-400 line-through"
                              : ""
                          }`}
                        >
                          {mission.title}
                        </p>

                        <span className="text-xs text-slate-500 dark:text-slate-400">
                          {mission.category}
                        </span>
                      </div>
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                onClick={() =>
                  navigate("/daily-mission")
                }
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                Open Daily Mission
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

                        {/* Recent achievements */}

        <section className="mt-8">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                Milestones
              </span>

              <h2 className="mt-1 text-2xl font-bold">
                Recent Achievements
              </h2>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Your latest rewards and career
                milestones.
              </p>
            </div>

            <div className="rounded-xl bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
              {unlockedCount}/{totalCount} unlocked
            </div>
          </div>

          {recentAchievements.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {recentAchievements.map(
                (achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    achievement={achievement}
                    compact
                  />
                )
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
                <Trophy className="h-7 w-7 text-amber-600 dark:text-amber-400" />
              </div>

              <h3 className="mt-4 font-bold">
                Your first achievement is waiting
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500 dark:text-slate-400">
                Complete a daily mission or make
                progress on your roadmap to unlock
                your first achievement.
              </p>
            </div>
          )}
        </section>


        {/* Skills and interests */}

        <section className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold">
              Your Skills
            </h2>

            <div className="flex flex-wrap gap-2">
              {user.skills.length > 0 ? (
                user.skills.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No skills added yet.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <h2 className="mb-4 text-lg font-bold">
              Your Interests
            </h2>

            <div className="flex flex-wrap gap-2">
              {user.interests.length > 0 ? (
                user.interests.map(
                  (interest) => (
                    <span
                      key={interest}
                      className="rounded-xl bg-purple-50 px-3 py-2 text-sm font-medium text-purple-700 dark:bg-purple-900/20 dark:text-purple-400"
                    >
                      {interest}
                    </span>
                  )
                )
              ) : (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No interests added yet.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Quick actions */}

        <section className="mt-8">
          <h2 className="mb-5 text-xl font-bold">
            Quick Actions
          </h2>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <button
              type="button"
              onClick={() =>
                navigate("/daily-mission")
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-indigo-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <BookOpen className="mb-4 h-7 w-7 text-indigo-600 dark:text-indigo-400" />

              <h3 className="font-semibold">
                Daily Mission
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Complete today&apos;s personalized
                learning tasks.
              </p>

              <ArrowRight className="mt-4 h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/ai-projects")
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-indigo-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <Briefcase className="mb-4 h-7 w-7 text-indigo-600 dark:text-indigo-400" />

              <h3 className="font-semibold">
                AI Projects
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Discover projects that match
                your career path.
              </p>

              <ArrowRight className="mt-4 h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" />
            </button>

            <button
              type="button"
              onClick={() =>
                navigate("/resume-analyzer")
              }
              className="group rounded-2xl border border-slate-200 bg-white p-5 text-left transition hover:border-indigo-500 hover:shadow-md dark:border-slate-800 dark:bg-slate-900"
            >
              <FileText className="mb-4 h-7 w-7 text-indigo-600 dark:text-indigo-400" />

              <h3 className="font-semibold">
                Resume Analyzer
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                Analyze and improve your resume
                for better opportunities.
              </p>

              <ArrowRight className="mt-4 h-5 w-5 text-slate-400 transition group-hover:translate-x-1 group-hover:text-indigo-600" />
            </button>
          </div>
        </section>

        {/* Restart */}

        <section className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={resetJourney}
            className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-medium text-slate-700 transition hover:border-red-300 hover:bg-red-50 hover:text-red-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-red-900 dark:hover:bg-red-950/30 dark:hover:text-red-400"
          >
            <RefreshCw className="h-4 w-4" />
            Restart Journey
          </button>
        </section>
                     {newAchievement &&
                        JSON.parse(
                         localStorage.getItem("pathpilot_settings") || "{}"
                        ).achievementPopups !== false && (
          <div className="fixed bottom-5 left-4 right-4 z-[100] sm:left-auto sm:right-6 sm:w-[390px]">
            <div className="relative overflow-hidden rounded-2xl border border-amber-300 bg-gradient-to-r from-amber-500 to-orange-500 p-5 text-white shadow-2xl shadow-orange-500/25">
              <div className="absolute -right-10 -top-10 h-28 w-28 rounded-full bg-white/20 blur-2xl" />

              <div className="relative flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                  <Trophy className="h-6 w-6" />
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold uppercase tracking-widest text-amber-100">
                    Achievement Unlocked
                  </p>

                  <h3 className="mt-1 text-lg font-bold">
                    {newAchievement.title}
                  </h3>

                  <p className="mt-1 text-sm leading-6 text-white/90">
                    {newAchievement.description}
                  </p>

                  <p className="mt-2 text-sm font-bold">
                    +{newAchievement.xpReward} XP
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    dismissNewAchievement
                  }
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-white/10 text-lg transition hover:bg-white/20"
                  aria-label="Dismiss achievement notification"
                >
                  ×
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default Dashboard;