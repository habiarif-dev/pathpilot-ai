import {
  AlertCircle,
  ArrowRight,
  Award,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  Compass,
  Flag,
  Flame,
  FolderKanban,
  History,
  Lightbulb,
  ListChecks,
  Loader2,
  Map,
  RefreshCcw,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  X,
  Zap,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import {
  calculateEarnedRoadmapXP,
  calculateRoadmapProgress,
  generateDailyMissionFromRoadmap,
  getCompletedTaskIds,
  getCurrentRoadmapPosition,
  getDailyMissionHistory,
  getSavedCareerRoadmap,
  getSavedDailyMission,
  isMissionFromToday,
  removeSavedDailyMission,
  saveCareerRoadmap,
  saveDailyMission,
  saveDailyMissionToHistory,
  updateRoadmapTaskStatus,
} from "../services/careerRoadmapService";

/* =========================================================
   Default Mission Preferences
========================================================= */

const defaultMissionPreferences = {
  availableMinutes: 60,
  preferredDifficulty: "Intermediate",
};

/* =========================================================
   XP and Streak Storage Keys
========================================================= */

const DAILY_MISSION_XP_KEY = "pathpilot_daily_mission_xp";
const DAILY_MISSION_STREAK_KEY = "pathpilot_daily_mission_streak";
const DAILY_MISSION_LAST_COMPLETED_KEY =
  "pathpilot_daily_mission_last_completed";

/* =========================================================
   Daily Mission Page
========================================================= */

function DailyMission() {
  const [roadmap, setRoadmap] = useState(null);
  const [mission, setMission] = useState(null);
  const [missionHistory, setMissionHistory] = useState([]);

  const [preferences, setPreferences] = useState(
    defaultMissionPreferences
  );

  const [isGenerating, setIsGenerating] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);

  const [expandedStepIndex, setExpandedStepIndex] = useState(0);
  const [completedStepIndexes, setCompletedStepIndexes] = useState([]);

  const [showPreferences, setShowPreferences] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [showNewMissionModal, setShowNewMissionModal] = useState(false);

  const [earnedMissionXP, setEarnedMissionXP] = useState(0);
  const [streak, setStreak] = useState(0);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  /* =========================================================
     Load Saved Data
  ========================================================= */

  useEffect(() => {
    const savedRoadmap = getSavedCareerRoadmap();
    const savedMission = getSavedDailyMission();
    const savedHistory = getDailyMissionHistory();

    setRoadmap(savedRoadmap);
    setMissionHistory(savedHistory);

    if (savedMission && isMissionFromToday(savedMission)) {
      setMission(savedMission);

      const completedSteps = Array.isArray(
        savedMission.completedStepIndexes
      )
        ? savedMission.completedStepIndexes
        : [];

      setCompletedStepIndexes(completedSteps);
    } else if (savedMission) {
      removeSavedDailyMission();
    }

    setEarnedMissionXP(getStoredMissionXP());
    setStreak(getStoredStreak());
  }, []);

  /* =========================================================
     Derived Roadmap Information
  ========================================================= */

  const roadmapProgress = useMemo(() => {
    return roadmap ? calculateRoadmapProgress(roadmap) : 0;
  }, [roadmap]);

  const roadmapXP = useMemo(() => {
    return roadmap ? calculateEarnedRoadmapXP(roadmap) : 0;
  }, [roadmap]);

  const currentPosition = useMemo(() => {
    return roadmap ? getCurrentRoadmapPosition(roadmap) : null;
  }, [roadmap]);

  const currentMilestone = useMemo(() => {
    if (!roadmap || !currentPosition) {
      return null;
    }

    return (
      roadmap.milestones?.[currentPosition.milestoneIndex] || null
    );
  }, [roadmap, currentPosition]);

  const currentWeek = useMemo(() => {
    if (!currentMilestone || !currentPosition) {
      return null;
    }

    return (
      currentMilestone.weeks?.[currentPosition.weekIndex] || null
    );
  }, [currentMilestone, currentPosition]);

  const completedTaskIds = useMemo(() => {
    return roadmap ? getCompletedTaskIds(roadmap) : [];
  }, [roadmap]);

  /* =========================================================
     Mission Progress
  ========================================================= */

  const missionSteps = useMemo(() => {
    if (!mission) {
      return [];
    }

    if (Array.isArray(mission.steps)) {
      return mission.steps;
    }

    return [];
  }, [mission]);

  const missionStepProgress = useMemo(() => {
    if (!missionSteps.length) {
      return 0;
    }

    return Math.round(
      (completedStepIndexes.length / missionSteps.length) * 100
    );
  }, [completedStepIndexes, missionSteps]);

  const allMissionStepsCompleted =
    missionSteps.length > 0 &&
    completedStepIndexes.length === missionSteps.length;

  const missionCompleted = Boolean(mission?.completed);

  /* =========================================================
     Generate Mission
  ========================================================= */

  async function handleGenerateMission() {
    if (!roadmap) {
      setError(
        "Create a Career Roadmap before generating your daily mission."
      );

      return;
    }

    if (mission && isMissionFromToday(mission) && !mission.completed) {
      setShowNewMissionModal(true);
      return;
    }

    await generateMission();
  }

  async function generateMission({ replaceExisting = false } = {}) {
    if (!roadmap) {
      return;
    }

    setIsGenerating(true);
    setError("");
    setSuccessMessage("");

    try {
      if (replaceExisting && mission) {
        saveDailyMissionToHistory({
          ...mission,
          archivedAt: new Date().toISOString(),
          archiveReason: "replaced",
        });
      }

      const generatedMission =
        await generateDailyMissionFromRoadmap({
          roadmap,
          completedTaskIds,
          availableMinutes: Number(preferences.availableMinutes),
          preferredDifficulty: preferences.preferredDifficulty,
        });

      const preparedMission = {
        ...generatedMission,
        id:
          generatedMission.id ||
          `mission-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`,
        createdAt:
          generatedMission.createdAt || new Date().toISOString(),
        completed: false,
        completedAt: null,
        completedStepIndexes: [],
      };

      saveDailyMission(preparedMission);

      setMission(preparedMission);
      setCompletedStepIndexes([]);
      setExpandedStepIndex(0);
      setShowNewMissionModal(false);

      setMissionHistory(getDailyMissionHistory());

      setSuccessMessage(
        "Your AI-powered daily mission is ready."
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to generate your daily mission."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  /* =========================================================
     Mission Step Toggle
  ========================================================= */

  function handleStepToggle(stepIndex) {
    if (!mission || mission.completed) {
      return;
    }

    setCompletedStepIndexes((previousIndexes) => {
      const alreadyCompleted =
        previousIndexes.includes(stepIndex);

      const updatedIndexes = alreadyCompleted
        ? previousIndexes.filter(
            (index) => index !== stepIndex
          )
        : [...previousIndexes, stepIndex].sort(
            (first, second) => first - second
          );

      const updatedMission = {
        ...mission,
        completedStepIndexes: updatedIndexes,
        progress: missionSteps.length
          ? Math.round(
              (updatedIndexes.length / missionSteps.length) * 100
            )
          : 0,
      };

      saveDailyMission(updatedMission);
      setMission(updatedMission);

      return updatedIndexes;
    });
  }

  /* =========================================================
     Complete Mission
  ========================================================= */

  async function handleCompleteMission() {
    if (!mission || mission.completed) {
      return;
    }

    if (!allMissionStepsCompleted) {
      setError(
        "Complete all mission steps before finishing today's mission."
      );

      return;
    }

    setIsCompleting(true);
    setError("");
    setSuccessMessage("");

    try {
      const completionTime = new Date().toISOString();

      const completedMission = {
        ...mission,
        completed: true,
        completedAt: completionTime,
        progress: 100,
        completedStepIndexes:
          missionSteps.map((_, index) => index),
      };

      let updatedRoadmap = roadmap;

      if (mission.roadmapTaskId && roadmap) {
        updatedRoadmap = updateRoadmapTaskStatus({
          roadmap,
          taskId: mission.roadmapTaskId,
          completed: true,
        });

        setRoadmap(updatedRoadmap);
        saveCareerRoadmap(updatedRoadmap);
      }

      saveDailyMission(completedMission);
      saveDailyMissionToHistory(completedMission);

      const missionXP = Number(mission.xpReward) || 0;
      const updatedMissionXP =
        getStoredMissionXP() + missionXP;

      saveStoredMissionXP(updatedMissionXP);
      setEarnedMissionXP(updatedMissionXP);

      const updatedStreak = updateMissionStreak();
      setStreak(updatedStreak);

      setMission(completedMission);
      setCompletedStepIndexes(
        missionSteps.map((_, index) => index)
      );

      setMissionHistory(getDailyMissionHistory());
      setShowCompletionModal(true);

      setSuccessMessage(
        `Mission completed. You earned ${missionXP} XP.`
      );
    } catch (completionError) {
      setError(
        completionError.message ||
          "Unable to complete your daily mission."
      );
    } finally {
      setIsCompleting(false);
    }
  }

  /* =========================================================
     Generate Another Mission
  ========================================================= */

  async function handleGenerateAnotherMission() {
    setShowCompletionModal(false);

    await generateMission({
      replaceExisting: true,
    });
  }

  async function handleConfirmReplaceMission() {
    await generateMission({
      replaceExisting: true,
    });
  }

  /* =========================================================
     Reset Current Mission
  ========================================================= */

  function handleResetMissionProgress() {
    if (!mission || mission.completed) {
      return;
    }

    const resetMission = {
      ...mission,
      progress: 0,
      completedStepIndexes: [],
    };

    saveDailyMission(resetMission);

    setMission(resetMission);
    setCompletedStepIndexes([]);
    setExpandedStepIndex(0);

    setSuccessMessage("Mission progress has been reset.");
  }

  /* =========================================================
     Clear Alerts
  ========================================================= */

  function clearMessages() {
    setError("");
    setSuccessMessage("");
  }

  /* =========================================================
     Page UI Starts Here
  ========================================================= */

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <DailyMissionHero
          mission={mission}
          streak={streak}
          earnedMissionXP={earnedMissionXP}
          roadmapXP={roadmapXP}
        />

        {error && (
          <AlertMessage
            type="error"
            message={error}
            onClose={clearMessages}
          />
        )}

        {successMessage && (
          <AlertMessage
            type="success"
            message={successMessage}
            onClose={clearMessages}
          />
        )}

        {!roadmap && (
          <NoRoadmapState />
        )}

        {roadmap && (
          <>
            <RoadmapConnectionSummary
              roadmap={roadmap}
              currentMilestone={currentMilestone}
              currentWeek={currentWeek}
              roadmapProgress={roadmapProgress}
              currentPosition={currentPosition}
            />

            {!mission && (
              <MissionGenerator
                preferences={preferences}
                setPreferences={setPreferences}
                showPreferences={showPreferences}
                setShowPreferences={setShowPreferences}
                isGenerating={isGenerating}
                onGenerate={handleGenerateMission}
              />
            )}

            {mission && (
              <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_330px]">
                <div className="space-y-6">
                  <TodayMissionCard
                    mission={mission}
                    missionStepProgress={missionStepProgress}
                    missionCompleted={missionCompleted}
                    completedStepIndexes={completedStepIndexes}
                    expandedStepIndex={expandedStepIndex}
                    setExpandedStepIndex={setExpandedStepIndex}
                    onStepToggle={handleStepToggle}
                    onCompleteMission={handleCompleteMission}
                    onResetProgress={handleResetMissionProgress}
                    allStepsCompleted={allMissionStepsCompleted}
                    isCompleting={isCompleting}
                  />

                  <MissionLearningSection mission={mission} />

                  <MissionDeliverableSection mission={mission} />
                </div>

                <MissionSidebar
                  mission={mission}
                  roadmap={roadmap}
                  roadmapProgress={roadmapProgress}
                  currentMilestone={currentMilestone}
                  currentWeek={currentWeek}
                  streak={streak}
                  earnedMissionXP={earnedMissionXP}
                  missionHistory={missionHistory}
                  showHistory={showHistory}
                  setShowHistory={setShowHistory}
                  isGenerating={isGenerating}
                  onGenerateNew={handleGenerateMission}
                />
              </section>
            )}
          </>
        )}
      </div>

      {showCompletionModal && (
        <MissionCompletionModal
          mission={mission}
          streak={streak}
          roadmapProgress={roadmapProgress}
          onClose={() => setShowCompletionModal(false)}
          onGenerateAnother={handleGenerateAnotherMission}
          isGenerating={isGenerating}
        />
      )}

      {showNewMissionModal && (
        <ReplaceMissionModal
          mission={mission}
          isGenerating={isGenerating}
          onClose={() => setShowNewMissionModal(false)}
          onConfirm={handleConfirmReplaceMission}
        />
      )}

          </main>
  );
}

/* =========================================================
   Daily Mission Hero
========================================================= */

function DailyMissionHero({
  mission,
  streak,
  earnedMissionXP,
  roadmapXP,
}) {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-xl sm:p-8">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-100">
            <Target size={18} />

            <span className="text-sm font-semibold">
              AI Daily Mission
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Turn your roadmap into daily progress
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-indigo-100">
            Complete one focused AI-generated mission from your current
            career milestone, earn XP and keep your learning streak active.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <HeroMetric
            icon={Flame}
            label="Current Streak"
            value={`${streak} ${streak === 1 ? "day" : "days"}`}
          />

          <HeroMetric
            icon={Zap}
            label="Mission XP"
            value={earnedMissionXP}
          />

          <HeroMetric
            icon={Trophy}
            label="Roadmap XP"
            value={roadmapXP}
            fullWidth
          />
        </div>
      </div>

      {mission && (
        <div className="mt-7 rounded-2xl border border-white/15 bg-white/10 p-5 backdrop-blur">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-indigo-100">
                Today&apos;s Mission
              </p>

              <h2 className="mt-2 text-xl font-bold">
                {mission.title}
              </h2>
            </div>

            <MissionStatusBadge completed={mission.completed} />
          </div>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   Alerts
========================================================= */

function AlertMessage({ type, message, onClose }) {
  const isError = type === "error";

  return (
    <div
      className={`mt-6 flex items-start justify-between gap-4 rounded-2xl border px-5 py-4 ${
        isError
          ? "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300"
          : "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300"
      }`}
    >
      <div className="flex items-start gap-3">
        {isError ? (
          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
        ) : (
          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0" />
        )}

        <p className="text-sm font-medium leading-6">
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className={`rounded-lg p-1 ${
          isError
            ? "hover:bg-rose-100 dark:hover:bg-rose-900/30"
            : "hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
        }`}
      >
        <X size={17} />
      </button>
    </div>
  );
}

/* =========================================================
   No Roadmap State
========================================================= */

function NoRoadmapState() {
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-12">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
        <Map className="text-indigo-600 dark:text-indigo-300" size={30} />
      </div>

      <h2 className="mt-6 text-2xl font-bold">
        Create your Career Roadmap first
      </h2>

      <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-500">
        Daily Mission uses your current roadmap milestone and weekly tasks
        to create a focused activity for today.
      </p>

      <a
        href="/career-roadmap"
        className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
      >
        <Map size={18} />
        Open Career Roadmap
        <ArrowRight size={18} />
      </a>
    </section>
  );
}

/* =========================================================
   Roadmap Connection Summary
========================================================= */

function RoadmapConnectionSummary({
  roadmap,
  currentMilestone,
  currentWeek,
  roadmapProgress,
  currentPosition,
}) {
  return (
    <section className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
            <Compass className="text-indigo-600 dark:text-indigo-300" />
          </div>

          <div>
            <p className="text-sm font-semibold text-indigo-600">
              Connected Career Roadmap
            </p>

            <h2 className="mt-1 text-xl font-bold">
              {roadmap.title}
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Your mission will be generated from the next incomplete task
              in your current milestone.
            </p>
          </div>
        </div>

        <a
          href="/career-roadmap"
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <Map size={17} />
          View Full Roadmap
        </a>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <ConnectionCard
          icon={Target}
          label="Overall Progress"
          value={`${roadmapProgress}%`}
        />

        <ConnectionCard
          icon={Flag}
          label="Current Milestone"
          value={
            currentMilestone
              ? `Month ${currentMilestone.monthNumber}`
              : "Completed"
          }
        />

        <ConnectionCard
          icon={CalendarDays}
          label="Current Week"
          value={
            currentWeek
              ? `Week ${currentWeek.weekNumber}`
              : "Completed"
          }
        />

        <ConnectionCard
          icon={ListChecks}
          label="Next Task"
          value={
            currentPosition?.task?.title || "All tasks completed"
          }
        />
      </div>

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm font-semibold">
            Roadmap Completion
          </span>

          <span className="text-sm font-bold text-indigo-600">
            {roadmapProgress}%
          </span>
        </div>

        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all duration-500"
            style={{
              width: `${roadmapProgress}%`,
            }}
          />
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Mission Generator
========================================================= */

function MissionGenerator({
  preferences,
  setPreferences,
  showPreferences,
  setShowPreferences,
  isGenerating,
  onGenerate,
}) {
  return (
    <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
            <Sparkles size={26} />
          </div>

          <div>
            <p className="text-sm font-semibold text-indigo-600">
              AI Mission Generator
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              Generate today&apos;s focused task
            </h2>

            <p className="mt-2 max-w-2xl leading-7 text-slate-500">
              PathPilot will review your roadmap progress and create one
              practical mission that fits your available time.
            </p>
          </div>
        </div>

        <div className="mt-8 rounded-3xl bg-gradient-to-r from-indigo-50 to-purple-50 p-6 dark:from-indigo-950/30 dark:to-purple-950/30">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />

            <div>
              <h3 className="font-bold text-indigo-900 dark:text-indigo-200">
                How today&apos;s mission is selected
              </h3>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MissionRule text="Uses your current milestone" />

                <MissionRule text="Chooses an incomplete roadmap task" />

                <MissionRule text="Matches your available time" />

                <MissionRule text="Includes steps and success criteria" />
              </div>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onGenerate}
          disabled={isGenerating}
          className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              Creating Your Mission...
            </>
          ) : (
            <>
              <Sparkles size={19} />
              Generate Today&apos;s Mission
            </>
          )}
        </button>
      </div>

      <div className="h-fit rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() =>
            setShowPreferences((previous) => !previous)
          }
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Compass className="text-purple-600 dark:text-purple-300" size={20} />
            </div>

            <div>
              <h3 className="font-bold">
                Mission Preferences
              </h3>

              <p className="mt-1 text-xs text-slate-500">
                Adjust time and difficulty
              </p>
            </div>
          </div>

          {showPreferences ? (
            <ChevronDown size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </button>

        {showPreferences && (
          <div className="mt-6 space-y-5 border-t border-slate-200 pt-6 dark:border-slate-800">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Available Time
              </span>

              <select
                value={preferences.availableMinutes}
                onChange={(event) =>
                  setPreferences((previous) => ({
                    ...previous,
                    availableMinutes: Number(event.target.value),
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950"
              >
                <option value={20}>20 minutes</option>
                <option value={30}>30 minutes</option>
                <option value={45}>45 minutes</option>
                <option value={60}>1 hour</option>
                <option value={90}>1.5 hours</option>
                <option value={120}>2 hours</option>
                <option value={180}>3 hours</option>
              </select>
            </label>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold">
                Preferred Difficulty
              </span>

              <select
                value={preferences.preferredDifficulty}
                onChange={(event) =>
                  setPreferences((previous) => ({
                    ...previous,
                    preferredDifficulty: event.target.value,
                  }))
                }
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Challenge me">Challenge me</option>
              </select>
            </label>
          </div>
        )}

        {!showPreferences && (
          <div className="mt-6 grid gap-3">
            <PreferenceSummary
              icon={Clock3}
              label="Available Time"
              value={`${preferences.availableMinutes} minutes`}
            />

            <PreferenceSummary
              icon={Target}
              label="Difficulty"
              value={preferences.preferredDifficulty}
            />
          </div>
        )}
      </div>
    </section>
  );
}

/* =========================================================
   Today's Mission Card
========================================================= */

function TodayMissionCard({
  mission,
  missionStepProgress,
  missionCompleted,
  completedStepIndexes,
  expandedStepIndex,
  setExpandedStepIndex,
  onStepToggle,
  onCompleteMission,
  onResetProgress,
  allStepsCompleted,
  isCompleting,
}) {
  const steps = Array.isArray(mission.steps)
    ? mission.steps
    : [];

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white sm:p-8">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                Today&apos;s Mission
              </span>

              {mission.difficulty && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  {mission.difficulty}
                </span>
              )}

              {mission.category && (
                <span className="rounded-full bg-white/15 px-3 py-1 text-xs font-semibold">
                  {mission.category}
                </span>
              )}
            </div>

            <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
              {mission.title}
            </h2>

            <p className="mt-3 max-w-3xl leading-7 text-indigo-100">
              {mission.description}
            </p>
          </div>

          <MissionStatusBadge completed={missionCompleted} />
        </div>

        <div className="mt-7 grid gap-3 sm:grid-cols-3">
          <MissionMetaCard
            icon={Clock3}
            label="Estimated Time"
            value={`${mission.estimatedMinutes || 60} min`}
          />

          <MissionMetaCard
            icon={Zap}
            label="XP Reward"
            value={`${mission.xpReward || 0} XP`}
          />

          <MissionMetaCard
            icon={ListChecks}
            label="Mission Steps"
            value={`${steps.length} steps`}
          />
        </div>
      </div>

      <div className="p-6 sm:p-8">
        {mission.whyThisMission && (
          <div className="rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900 dark:bg-indigo-950/30">
            <div className="flex items-start gap-3">
              <Compass className="mt-0.5 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />

              <div>
                <h3 className="font-bold text-indigo-900 dark:text-indigo-200">
                  Why this mission?
                </h3>

                <p className="mt-2 text-sm leading-6 text-indigo-700 dark:text-indigo-300">
                  {mission.whyThisMission}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-bold">
                Mission Progress
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Complete each step before finishing the mission.
              </p>
            </div>

            <span className="text-lg font-bold text-indigo-600">
              {missionStepProgress}%
            </span>
          </div>

          <div className="mt-4 h-3 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${missionStepProgress}%`,
              }}
            />
          </div>

          <p className="mt-2 text-xs font-semibold text-slate-500">
            {completedStepIndexes.length} of {steps.length} steps completed
          </p>
        </div>

        <div className="mt-8 space-y-4">
          {steps.map((step, index) => (
            <MissionStepCard
              key={step.id || `mission-step-${index}`}
              step={step}
              index={index}
              completed={completedStepIndexes.includes(index)}
              expanded={expandedStepIndex === index}
              missionCompleted={missionCompleted}
              onExpand={() =>
                setExpandedStepIndex(
                  expandedStepIndex === index ? null : index
                )
              }
              onToggle={() => onStepToggle(index)}
            />
          ))}
        </div>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {!missionCompleted ? (
            <>
              <button
                type="button"
                onClick={onResetProgress}
                disabled={!completedStepIndexes.length}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-5 py-3 font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                <RefreshCcw size={17} />
                Reset Progress
              </button>

              <button
                type="button"
                onClick={onCompleteMission}
                disabled={!allStepsCompleted || isCompleting}
                className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCompleting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Completing...
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={19} />
                    Complete Mission
                  </>
                )}
              </button>
            </>
          ) : (
            <div className="flex w-full items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300">
              <CheckCircle2 className="flex-shrink-0" />

              <div>
                <h3 className="font-bold">
                  Mission completed
                </h3>

                <p className="mt-1 text-sm">
                  Your roadmap progress and XP have been updated.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/* =========================================================
   Mission Step Card
========================================================= */

function MissionStepCard({
  step,
  index,
  completed,
  expanded,
  missionCompleted,
  onExpand,
  onToggle,
}) {
  const stepTitle =
    typeof step === "string"
      ? step
      : step.title || `Step ${index + 1}`;

  const stepDescription =
    typeof step === "string"
      ? ""
      : step.description || "";

  return (
    <article
      className={`overflow-hidden rounded-2xl border transition ${
        completed
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="flex items-start gap-4 p-5">
        <button
          type="button"
          onClick={onToggle}
          disabled={missionCompleted}
          className={`mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
            completed
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-slate-300 hover:border-indigo-500 dark:border-slate-600"
          } disabled:cursor-not-allowed`}
          aria-label={
            completed
              ? "Mark mission step incomplete"
              : "Mark mission step complete"
          }
        >
          {completed ? (
            <Check size={17} />
          ) : (
            <span className="text-xs font-bold">
              {index + 1}
            </span>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={onExpand}
            className="flex w-full items-start justify-between gap-4 text-left"
          >
            <div>
              <h4
                className={`font-bold ${
                  completed ? "line-through opacity-70" : ""
                }`}
              >
                {stepTitle}
              </h4>

              {stepDescription && (
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  {stepDescription}
                </p>
              )}
            </div>

            {expanded ? (
              <ChevronDown className="flex-shrink-0 text-slate-500" />
            ) : (
              <ChevronRight className="flex-shrink-0 text-slate-500" />
            )}
          </button>

          {expanded && typeof step !== "string" && (
            <div className="mt-5 space-y-4 border-t border-slate-200 pt-5 dark:border-slate-800">
              {step.action && (
                <StepDetail
                  icon={Rocket}
                  title="Action"
                  content={step.action}
                />
              )}

              {step.estimatedMinutes && (
                <StepDetail
                  icon={Clock3}
                  title="Estimated Time"
                  content={`${step.estimatedMinutes} minutes`}
                />
              )}

              {step.deliverable && (
                <StepDetail
                  icon={FolderKanban}
                  title="Deliverable"
                  content={step.deliverable}
                />
              )}

              {Array.isArray(step.successCriteria) &&
                step.successCriteria.length > 0 && (
                  <div>
                    <h5 className="flex items-center gap-2 font-bold">
                      <CheckCircle2
                        size={17}
                        className="text-emerald-600"
                      />
                      Success Criteria
                    </h5>

                    <div className="mt-3 space-y-2">
                      {step.successCriteria.map(
                        (criterion, criterionIndex) => (
                          <div
                            key={`criterion-${index}-${criterionIndex}`}
                            className="flex items-start gap-2 text-sm leading-6 text-slate-500"
                          >
                            <Circle className="mt-1 h-3.5 w-3.5 flex-shrink-0" />
                            {criterion}
                          </div>
                        )
                      )}
                    </div>
                  </div>
                )}

              {Array.isArray(step.tips) &&
                step.tips.length > 0 && (
                  <div className="rounded-xl bg-amber-50 p-4 dark:bg-amber-950/20">
                    <h5 className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                      <Lightbulb size={17} />
                      Helpful Tips
                    </h5>

                    <div className="mt-3 space-y-2">
                      {step.tips.map((tip, tipIndex) => (
                        <p
                          key={`tip-${index}-${tipIndex}`}
                          className="text-sm leading-6 text-amber-700 dark:text-amber-300"
                        >
                          • {tip}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          )}
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   Mission Learning Section
========================================================= */

function MissionLearningSection({ mission }) {
  const skills = Array.isArray(mission.skills)
    ? mission.skills
    : [];

  const concepts = Array.isArray(mission.learningObjectives)
    ? mission.learningObjectives
    : [];

  const resources = Array.isArray(mission.resources)
    ? mission.resources
    : [];

  if (
    !skills.length &&
    !concepts.length &&
    !resources.length
  ) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
          <BookOpen className="text-indigo-600 dark:text-indigo-300" />
        </div>

        <div>
          <p className="text-sm font-semibold text-indigo-600">
            Learning Focus
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            What you will develop
          </h2>

          <p className="mt-2 leading-7 text-slate-500">
            Use this section to understand the skills, concepts and
            resources connected to today&apos;s mission.
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        {concepts.length > 0 && (
          <LearningCard
            icon={Target}
            title="Learning Objectives"
            items={concepts}
          />
        )}

        {skills.length > 0 && (
          <LearningCard
            icon={Award}
            title="Skills Practised"
            items={skills}
          />
        )}
      </div>

      {resources.length > 0 && (
        <div className="mt-7">
          <div className="flex items-center gap-2">
            <BookOpen className="text-indigo-600" size={20} />

            <h3 className="text-xl font-bold">
              Suggested Resources
            </h3>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {resources.map((resource, index) => (
              <ResourceCard
                key={
                  resource.id ||
                  `mission-resource-${index}`
                }
                resource={resource}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

/* =========================================================
   Mission Deliverable Section
========================================================= */

function MissionDeliverableSection({ mission }) {
  const criteria = Array.isArray(mission.successCriteria)
    ? mission.successCriteria
    : [];

  const checklist = Array.isArray(mission.completionChecklist)
    ? mission.completionChecklist
    : [];

  if (
    !mission.deliverable &&
    !criteria.length &&
    !checklist.length
  ) {
    return null;
  }

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
          <FolderKanban className="text-purple-600 dark:text-purple-300" />
        </div>

        <div>
          <p className="text-sm font-semibold text-purple-600">
            Mission Outcome
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            What you should complete
          </h2>

          <p className="mt-2 leading-7 text-slate-500">
            Finish the expected deliverable and verify that it meets
            the mission success criteria.
          </p>
        </div>
      </div>

      {mission.deliverable && (
        <div className="mt-7 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 p-6 dark:from-purple-950/30 dark:to-indigo-950/30">
          <div className="flex items-start gap-3">
            <Rocket className="mt-0.5 flex-shrink-0 text-purple-600 dark:text-purple-300" />

            <div>
              <h3 className="font-bold text-purple-900 dark:text-purple-200">
                Final Deliverable
              </h3>

              <p className="mt-2 leading-7 text-purple-700 dark:text-purple-300">
                {mission.deliverable}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        {criteria.length > 0 && (
          <ChecklistCard
            title="Success Criteria"
            items={criteria}
          />
        )}

        {checklist.length > 0 && (
          <ChecklistCard
            title="Completion Checklist"
            items={checklist}
          />
        )}
      </div>
    </section>
  );
}

/* =========================================================
   Mission Sidebar
========================================================= */

function MissionSidebar({
  mission,
  roadmap,
  roadmapProgress,
  currentMilestone,
  currentWeek,
  streak,
  earnedMissionXP,
  missionHistory,
  showHistory,
  setShowHistory,
  isGenerating,
  onGenerateNew,
}) {
  return (
    <aside className="space-y-6 xl:sticky xl:top-24 xl:h-fit">
      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
            <Zap className="text-indigo-600 dark:text-indigo-300" />
          </div>

          <div>
            <h2 className="font-bold">
              Mission Overview
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Today&apos;s progress summary
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-3">
          <SidebarMetric
            icon={Clock3}
            label="Estimated Time"
            value={`${mission.estimatedMinutes || 60} min`}
          />

          <SidebarMetric
            icon={Target}
            label="Difficulty"
            value={mission.difficulty || "Intermediate"}
          />

          <SidebarMetric
            icon={Zap}
            label="XP Reward"
            value={`${mission.xpReward || 0} XP`}
          />

          <SidebarMetric
            icon={Flame}
            label="Current Streak"
            value={`${streak} ${streak === 1 ? "day" : "days"}`}
          />

          <SidebarMetric
            icon={Trophy}
            label="Total Mission XP"
            value={earnedMissionXP}
          />
        </div>

        <button
          type="button"
          onClick={onGenerateNew}
          disabled={isGenerating}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RefreshCcw size={17} />
              Generate New Mission
            </>
          )}
        </button>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
            <Map className="text-purple-600 dark:text-purple-300" />
          </div>

          <div>
            <h2 className="font-bold">
              Roadmap Position
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Where this mission belongs
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <RoadmapPositionItem
            label="Roadmap"
            value={roadmap.title}
          />

          <RoadmapPositionItem
            label="Milestone"
            value={
              currentMilestone
                ? `Month ${currentMilestone.monthNumber}: ${currentMilestone.title}`
                : "Roadmap completed"
            }
          />

          <RoadmapPositionItem
            label="Week"
            value={
              currentWeek
                ? `Week ${currentWeek.weekNumber}: ${currentWeek.title}`
                : "All weeks completed"
            }
          />
        </div>

        <div className="mt-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">
              Roadmap Progress
            </span>

            <span className="text-sm font-bold text-indigo-600">
              {roadmapProgress}%
            </span>
          </div>

          <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${roadmapProgress}%`,
              }}
            />
          </div>
        </div>

        <a
          href="/career-roadmap"
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <Map size={17} />
          Open Career Roadmap
        </a>
      </section>

      <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <button
          type="button"
          onClick={() =>
            setShowHistory((previous) => !previous)
          }
          className="flex w-full items-center justify-between gap-3 text-left"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/30">
              <History className="text-amber-600 dark:text-amber-300" />
            </div>

            <div>
              <h2 className="font-bold">
                Mission History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {missionHistory.length} saved missions
              </p>
            </div>
          </div>

          {showHistory ? (
            <ChevronDown size={20} />
          ) : (
            <ChevronRight size={20} />
          )}
        </button>

        {showHistory && (
          <div className="mt-6 space-y-3 border-t border-slate-200 pt-6 dark:border-slate-800">
            {missionHistory.length > 0 ? (
              missionHistory
                .slice(0, 8)
                .map((historyMission, index) => (
                  <MissionHistoryItem
                    key={
                      historyMission.id ||
                      `history-mission-${index}`
                    }
                    mission={historyMission}
                  />
                ))
            ) : (
              <div className="rounded-2xl bg-slate-50 p-5 text-center dark:bg-slate-950">
                <History className="mx-auto text-slate-400" />

                <p className="mt-3 text-sm font-semibold">
                  No mission history yet
                </p>

                <p className="mt-1 text-xs leading-5 text-slate-500">
                  Completed or replaced missions will appear here.
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </aside>
  );
}

/* =========================================================
   Mission History Item
========================================================= */

function MissionHistoryItem({ mission }) {
  const completed = Boolean(mission.completed);

  return (
    <article className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-950">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-bold">
            {mission.title || "Daily Mission"}
          </h3>

          <p className="mt-1 text-xs text-slate-500">
            {formatMissionDate(
              mission.completedAt ||
                mission.archivedAt ||
                mission.createdAt
            )}
          </p>
        </div>

        <span
          className={`flex-shrink-0 rounded-full px-2.5 py-1 text-[11px] font-bold ${
            completed
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
          }`}
        >
          {completed ? "Completed" : "Replaced"}
        </span>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
        <span className="flex items-center gap-1.5">
          <Clock3 size={13} />
          {mission.estimatedMinutes || 0} min
        </span>

        <span className="flex items-center gap-1.5 text-amber-600">
          <Zap size={13} />
          {mission.xpReward || 0} XP
        </span>
      </div>
    </article>
  );
}

/* =========================================================
   Mission Completion Modal
========================================================= */

function MissionCompletionModal({
  mission,
  streak,
  roadmapProgress,
  onClose,
  onGenerateAnother,
  isGenerating,
}) {
  return (
    <ModalOverlay>
      <div className="w-full max-w-lg rounded-3xl bg-white p-6 text-center shadow-2xl dark:bg-slate-900 sm:p-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg">
          <Trophy size={38} />
        </div>

        <p className="mt-6 text-sm font-bold uppercase tracking-wider text-emerald-600">
          Mission Completed
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          Excellent work!
        </h2>

        <p className="mt-3 leading-7 text-slate-500">
          You completed
          <span className="font-semibold text-slate-900 dark:text-white">
            {" "}
            {mission?.title}
          </span>
          . Your roadmap progress and experience points have been updated.
        </p>

        <div className="mt-7 grid grid-cols-3 gap-3">
          <CompletionMetric
            icon={Zap}
            label="XP Earned"
            value={`+${mission?.xpReward || 0}`}
          />

          <CompletionMetric
            icon={Flame}
            label="Streak"
            value={`${streak}d`}
          />

          <CompletionMetric
            icon={Map}
            label="Roadmap"
            value={`${roadmapProgress}%`}
          />
        </div>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 px-5 py-3 font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Close
          </button>

          <button
            type="button"
            onClick={onGenerateAnother}
            disabled={isGenerating}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Next Mission
              </>
            )}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* =========================================================
   Replace Mission Modal
========================================================= */

function ReplaceMissionModal({
  mission,
  isGenerating,
  onClose,
  onConfirm,
}) {
  return (
    <ModalOverlay>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
            <RefreshCcw className="text-amber-600 dark:text-amber-300" />
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="rounded-xl p-2 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <h2 className="mt-5 text-2xl font-bold">
          Replace today&apos;s mission?
        </h2>

        <p className="mt-3 leading-7 text-slate-500">
          Your current mission
          <span className="font-semibold text-slate-900 dark:text-white">
            {" "}
            “{mission?.title}”
          </span>{" "}
          will be moved to mission history and replaced with a new
          AI-generated task.
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
          <button
            type="button"
            onClick={onClose}
            disabled={isGenerating}
            className="flex-1 rounded-xl border border-slate-200 px-5 py-3 font-semibold transition hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Keep Mission
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isGenerating}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Replacing...
              </>
            ) : (
              <>
                <RefreshCcw size={18} />
                Replace Mission
              </>
            )}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

/* =========================================================
   Shared UI Components
========================================================= */

function HeroMetric({
  icon: Icon,
  label,
  value,
  fullWidth = false,
}) {
  return (
    <div
      className={`rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur ${
        fullWidth ? "col-span-2 sm:col-span-1" : ""
      }`}
    >
      <div className="flex items-center gap-2 text-indigo-100">
        <Icon size={15} />
        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-1 text-lg font-bold">
        {value}
      </p>
    </div>
  );
}

function MissionStatusBadge({ completed }) {
  return (
    <span
      className={`inline-flex items-center gap-2 self-start rounded-full px-3 py-1.5 text-xs font-bold ${
        completed
          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          : "bg-white/15 text-white"
      }`}
    >
      {completed ? (
        <CheckCircle2 size={14} />
      ) : (
        <Circle size={14} />
      )}

      {completed ? "Completed" : "In Progress"}
    </span>
  );
}

function ConnectionCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={16} />

        <span className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 line-clamp-2 font-bold">
        {value}
      </p>
    </div>
  );
}

function MissionRule({ text }) {
  return (
    <div className="flex items-start gap-2 text-sm leading-6 text-indigo-700 dark:text-indigo-300">
      <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0" />
      {text}
    </div>
  );
}

function PreferenceSummary({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={15} />
        <span className="text-xs font-semibold">
          {label}
        </span>
      </div>

      <p className="mt-2 font-bold">
        {value}
      </p>
    </div>
  );
}

function MissionMetaCard({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
      <div className="flex items-center gap-2 text-indigo-100">
        <Icon size={16} />
        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-2 font-bold">
        {value}
      </p>
    </div>
  );
}

function StepDetail({
  icon: Icon,
  title,
  content,
}) {
  return (
    <div>
      <h5 className="flex items-center gap-2 font-bold">
        <Icon size={17} className="text-indigo-600" />
        {title}
      </h5>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {content}
      </p>
    </div>
  );
}

function LearningCard({
  icon: Icon,
  title,
  items,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <Icon
            size={19}
            className="text-indigo-600 dark:text-indigo-300"
          />
        </div>

        <h3 className="font-bold">
          {title}
        </h3>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
          >
            <CheckCircle2
              size={17}
              className="mt-1 flex-shrink-0 text-emerald-600"
            />

            <span>
              {typeof item === "string"
                ? item
                : item.title ||
                  item.name ||
                  item.description ||
                  "Learning item"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ChecklistCard({
  title,
  items,
}) {
  return (
    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      <div className="flex items-center gap-2">
        <ListChecks
          size={19}
          className="text-purple-600"
        />

        <h3 className="font-bold">
          {title}
        </h3>
      </div>

      <div className="mt-5 space-y-3">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="flex items-start gap-3 text-sm leading-6 text-slate-600 dark:text-slate-300"
          >
            <Circle
              size={14}
              className="mt-1.5 flex-shrink-0 text-slate-400"
            />

            <span>
              {typeof item === "string"
                ? item
                : item.title ||
                  item.description ||
                  "Checklist item"}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ResourceCard({ resource }) {
  const resourceTitle =
    typeof resource === "string"
      ? resource
      : resource.title ||
        resource.name ||
        "Learning Resource";

  const resourceDescription =
    typeof resource === "string"
      ? ""
      : resource.description || "";

  const resourceType =
    typeof resource === "string"
      ? "Resource"
      : resource.type || "Resource";

  const resourceUrl =
    typeof resource === "string"
      ? ""
      : resource.url || "";

  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <BookOpen
            size={18}
            className="text-indigo-600 dark:text-indigo-300"
          />
        </div>

        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {resourceType}
        </span>
      </div>

      <h4 className="mt-4 font-bold">
        {resourceTitle}
      </h4>

      {resourceDescription && (
        <p className="mt-2 text-sm leading-6 text-slate-500">
          {resourceDescription}
        </p>
      )}

      {resourceUrl && (
        <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-indigo-600">
          Open resource
          <ArrowRight size={15} />
        </div>
      )}
    </>
  );

  if (resourceUrl) {
    return (
      <a
        href={resourceUrl}
        target="_blank"
        rel="noreferrer"
        className="block rounded-2xl border border-slate-200 p-5 transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:hover:border-indigo-700"
      >
        {content}
      </a>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 p-5 dark:border-slate-800">
      {content}
    </div>
  );
}

function SidebarMetric({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-slate-800">
      <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <Icon size={16} />

        <span className="text-sm font-medium">
          {label}
        </span>
      </div>

      <span className="text-sm font-bold">
        {value}
      </span>
    </div>
  );
}

function RoadmapPositionItem({
  label,
  value,
}) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold leading-6">
        {value}
      </p>
    </div>
  );
}

function CompletionMetric({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
      <Icon
        size={20}
        className="mx-auto text-indigo-600"
      />

      <p className="mt-2 text-lg font-bold">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {label}
      </p>
    </div>
  );
}

function ModalOverlay({ children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 px-4 py-8 backdrop-blur-sm">
      {children}
    </div>
  );
}

/* =========================================================
   Mission XP Storage Helpers
========================================================= */

function getStoredMissionXP() {
  try {
    const storedValue = localStorage.getItem(
      DAILY_MISSION_XP_KEY
    );

    const parsedValue = Number(storedValue);

    return Number.isFinite(parsedValue)
      ? parsedValue
      : 0;
  } catch (error) {
    console.error(
      "Unable to read Daily Mission XP:",
      error
    );

    return 0;
  }
}

function saveStoredMissionXP(xp) {
  try {
    const safeXP = Math.max(
      0,
      Number(xp) || 0
    );

    localStorage.setItem(
      DAILY_MISSION_XP_KEY,
      String(safeXP)
    );
  } catch (error) {
    console.error(
      "Unable to save Daily Mission XP:",
      error
    );
  }
}

/* =========================================================
   Mission Streak Storage Helpers
========================================================= */

function getStoredStreak() {
  try {
    const storedValue = localStorage.getItem(
      DAILY_MISSION_STREAK_KEY
    );

    const parsedValue = Number(storedValue);

    return Number.isFinite(parsedValue)
      ? parsedValue
      : 0;
  } catch (error) {
    console.error(
      "Unable to read Daily Mission streak:",
      error
    );

    return 0;
  }
}

function saveStoredStreak(streakValue) {
  try {
    const safeStreak = Math.max(
      0,
      Number(streakValue) || 0
    );

    localStorage.setItem(
      DAILY_MISSION_STREAK_KEY,
      String(safeStreak)
    );
  } catch (error) {
    console.error(
      "Unable to save Daily Mission streak:",
      error
    );
  }
}

function getLastMissionCompletionDate() {
  try {
    return localStorage.getItem(
      DAILY_MISSION_LAST_COMPLETED_KEY
    );
  } catch (error) {
    console.error(
      "Unable to read last mission completion date:",
      error
    );

    return null;
  }
}

function saveLastMissionCompletionDate(dateValue) {
  try {
    localStorage.setItem(
      DAILY_MISSION_LAST_COMPLETED_KEY,
      dateValue
    );
  } catch (error) {
    console.error(
      "Unable to save last mission completion date:",
      error
    );
  }
}

/* =========================================================
   Streak Calculation
========================================================= */

function updateMissionStreak() {
  const today = getLocalDateKey(new Date());

  const lastCompletedDate =
    getLastMissionCompletionDate();

  let updatedStreak = getStoredStreak();

  if (!lastCompletedDate) {
    updatedStreak = 1;
  } else if (lastCompletedDate === today) {
    updatedStreak = Math.max(
      updatedStreak,
      1
    );
  } else {
    const yesterday = new Date();

    yesterday.setDate(
      yesterday.getDate() - 1
    );

    const yesterdayKey =
      getLocalDateKey(yesterday);

    if (lastCompletedDate === yesterdayKey) {
      updatedStreak += 1;
    } else {
      updatedStreak = 1;
    }
  }

  saveStoredStreak(updatedStreak);
  saveLastMissionCompletionDate(today);

  return updatedStreak;
}

/* =========================================================
   Date Helpers
========================================================= */

function getLocalDateKey(dateValue) {
  const date =
    dateValue instanceof Date
      ? dateValue
      : new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const year = date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatMissionDate(dateValue) {
  if (!dateValue) {
    return "Date unavailable";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "Date unavailable";
  }

  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  ).format(date);
}

/* =========================================================
   Export
========================================================= */

export default DailyMission;