import {
  AlertCircle,
  Archive,
  ArrowRight,
  Award,
  BookOpen,
  BriefcaseBusiness,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  Clock3,
  Code2,
  Compass,
  Flag,
  FolderKanban,
  GraduationCap,
  Layers3,
  Lightbulb,
  ListChecks,
  Loader2,
  Map,
  RefreshCcw,
  Rocket,
  Save,
  Sparkles,
  Target,
  Trash2,
  Trophy,
  Wrench,
  X,
  Zap,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import {
  calculateEarnedRoadmapXP,
  calculateMilestoneProgress,
  calculateRoadmapProgress,
  formatRoadmapDate,
  generateCareerRoadmap,
  getCurrentRoadmapPosition,
  getSavedCareerRoadmap,
  regenerateRoadmapMilestone,
  removeSavedCareerRoadmap,
  replaceRoadmapMilestone,
  saveCareerRoadmap,
  saveRoadmapToHistory,
  updateRoadmapTaskStatus,
} from "../services/careerRoadmapService";

import {
  downloadRoadmapDOCX,
  downloadRoadmapJSON,
  downloadRoadmapPDF,
} from "../utils/roadmapExporter";

const defaultForm = {
  careerGoal: "Become a Frontend Developer",
  targetRole: "Frontend Developer",
  currentLevel: "Beginner",
  currentSkills: "HTML, CSS, basic JavaScript",
  interests: "React, AI tools, responsive web design",
  durationMonths: 6,
  weeklyHours: 10,
  learningPreference:
    "A balanced mixture of learning, practice and projects",
};

function CareerRoadmap() {
  const [stage, setStage] = useState("setup");
  const [formData, setFormData] = useState(defaultForm);
  const [roadmap, setRoadmap] = useState(null);
  const [selectedMilestoneIndex, setSelectedMilestoneIndex] =
    useState(0);
  const [expandedWeekId, setExpandedWeekId] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingIndex, setRegeneratingIndex] = useState(null);
  const [regenerateModal, setRegenerateModal] = useState(null);
  const [regenerateFeedback, setRegenerateFeedback] = useState("");
  const [error, setError] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    const savedRoadmap = getSavedCareerRoadmap();

    if (savedRoadmap) {
      setRoadmap(savedRoadmap);
      setStage("roadmap");

      const position = getCurrentRoadmapPosition(savedRoadmap);

      setSelectedMilestoneIndex(position.milestoneIndex || 0);

      const currentWeek =
        savedRoadmap.milestones?.[position.milestoneIndex]?.weeks?.[
          position.weekIndex
        ];

      setExpandedWeekId(currentWeek?.id || null);
    }
  }, []);

  const progress = useMemo(() => {
    return roadmap ? calculateRoadmapProgress(roadmap) : 0;
  }, [roadmap]);

  const earnedXP = useMemo(() => {
    return roadmap ? calculateEarnedRoadmapXP(roadmap) : 0;
  }, [roadmap]);

  const selectedMilestone =
    roadmap?.milestones?.[selectedMilestoneIndex] || null;

  async function handleGenerateRoadmap() {
    if (!formData.careerGoal.trim()) {
      setError("Please enter your career goal.");
      return;
    }

    if (!formData.targetRole.trim()) {
      setError("Please enter your target role.");
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const generatedRoadmap = await generateCareerRoadmap({
        ...formData,
        durationMonths: Number(formData.durationMonths),
        weeklyHours: Number(formData.weeklyHours),
      });

      saveCareerRoadmap(generatedRoadmap);

      setRoadmap(generatedRoadmap);
      setSelectedMilestoneIndex(0);
      setExpandedWeekId(
        generatedRoadmap.milestones?.[0]?.weeks?.[0]?.id || null
      );
      setStage("roadmap");
    } catch (requestError) {
      setError(
        requestError.message || "Unable to generate your career roadmap."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  function handleTaskToggle(taskId, completed) {
    const updatedRoadmap = updateRoadmapTaskStatus({
      roadmap,
      taskId,
      completed,
    });

    setRoadmap(updatedRoadmap);
  }

  function handleSelectMilestone(index) {
    setSelectedMilestoneIndex(index);

    const milestone = roadmap?.milestones?.[index];

    setExpandedWeekId(milestone?.weeks?.[0]?.id || null);
  }

  function openRegenerateModal(index) {
    setRegenerateModal(index);
    setRegenerateFeedback("");
    setError("");
  }

  function closeRegenerateModal() {
    if (regeneratingIndex !== null) {
      return;
    }

    setRegenerateModal(null);
    setRegenerateFeedback("");
  }

  async function handleRegenerateMilestone() {
    if (regenerateModal === null || !roadmap) {
      return;
    }

    setRegeneratingIndex(regenerateModal);
    setError("");

    try {
      const milestone = await regenerateRoadmapMilestone({
        roadmap,
        milestoneIndex: regenerateModal,
        feedback: regenerateFeedback,
      });

      const updatedRoadmap = replaceRoadmapMilestone({
        roadmap,
        milestoneIndex: regenerateModal,
        milestone,
      });

      setRoadmap(updatedRoadmap);
      setSelectedMilestoneIndex(regenerateModal);
      setExpandedWeekId(milestone?.weeks?.[0]?.id || null);
      setRegenerateModal(null);
      setRegenerateFeedback("");
    } catch (requestError) {
      setError(
        requestError.message || "Unable to regenerate this milestone."
      );
    } finally {
      setRegeneratingIndex(null);
    }
  }

  function handleCreateNewRoadmap() {
    if (roadmap) {
      saveRoadmapToHistory(roadmap);
    }

    setStage("setup");
    setRoadmap(null);
    setSelectedMilestoneIndex(0);
    setExpandedWeekId(null);
    setError("");
  }

  function handleDeleteRoadmap() {
    removeSavedCareerRoadmap();

    setRoadmap(null);
    setStage("setup");
    setSelectedMilestoneIndex(0);
    setExpandedWeekId(null);
    setShowDeleteModal(false);
    setError("");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <RoadmapHero
          stage={stage}
          roadmap={roadmap}
          progress={progress}
          earnedXP={earnedXP}
        />

        {error && (
          <ErrorMessage message={error} onClose={() => setError("")} />
        )}

        {stage === "setup" && (
          <RoadmapSetup
            formData={formData}
            setFormData={setFormData}
            isGenerating={isGenerating}
            onGenerate={handleGenerateRoadmap}
          />
        )}

        {stage === "roadmap" && roadmap && (
          <>
            <RoadmapStats
              roadmap={roadmap}
              progress={progress}
              earnedXP={earnedXP}
            />

            <div className="mt-8 grid gap-6 xl:grid-cols-[310px_1fr]">
              <RoadmapSidebar
                roadmap={roadmap}
                selectedMilestoneIndex={selectedMilestoneIndex}
                onSelectMilestone={handleSelectMilestone}
                onCreateNew={handleCreateNewRoadmap}
                onDelete={() => setShowDeleteModal(true)}
              />

              <div className="space-y-6">
                <RoadmapOverview roadmap={roadmap} />

                {selectedMilestone && (
                  <MilestoneDetails
                    milestone={selectedMilestone}
                    milestoneIndex={selectedMilestoneIndex}
                    expandedWeekId={expandedWeekId}
                    setExpandedWeekId={setExpandedWeekId}
                    onTaskToggle={handleTaskToggle}
                    onRegenerate={() =>
                      openRegenerateModal(selectedMilestoneIndex)
                    }
                    isRegenerating={
                      regeneratingIndex === selectedMilestoneIndex
                    }
                  />
                )}

                <CareerPreparation roadmap={roadmap} />

                <CompletionSection roadmap={roadmap} />
              </div>
            </div>
          </>
        )}
      </div>

      {regenerateModal !== null && (
        <RegenerateModal
          milestone={roadmap?.milestones?.[regenerateModal]}
          feedback={regenerateFeedback}
          setFeedback={setRegenerateFeedback}
          isLoading={regeneratingIndex !== null}
          onClose={closeRegenerateModal}
          onSubmit={handleRegenerateMilestone}
        />
      )}

      {showDeleteModal && (
        <DeleteRoadmapModal
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteRoadmap}
        />
      )}
    </main>
  );
}

function RoadmapHero({ stage, roadmap, progress, earnedXP }) {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-xl sm:p-8">
      <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-100">
            <Map size={18} />
            <span className="text-sm font-semibold">
              AI Career Roadmap
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Build your personalised career path
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-indigo-100">
            Turn your career goal into structured milestones, weekly plans,
            practical projects and daily actions.
          </p>
        </div>

        {stage === "roadmap" && roadmap && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <HeroStat
              icon={Target}
              label="Progress"
              value={`${progress}%`}
            />

            <HeroStat icon={Zap} label="XP Earned" value={earnedXP} />

            <HeroStat
              icon={Clock3}
              label="Duration"
              value={`${roadmap.durationMonths} months`}
              fullWidth
            />
          </div>
        )}
      </div>
    </section>
  );
}

function RoadmapSetup({
  formData,
  setFormData,
  isGenerating,
  onGenerate,
}) {
  return (
    <section className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.75fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
            <Compass className="text-indigo-600 dark:text-indigo-300" />
          </div>

          <div>
            <h2 className="text-2xl font-bold">Create your roadmap</h2>

            <p className="mt-1 text-sm leading-6 text-slate-500">
              Tell PathPilot where you are now and where you want to go.
            </p>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          <div className="grid gap-5 sm:grid-cols-2">
            <FormInput
              label="Career Goal"
              value={formData.careerGoal}
              placeholder="Become a Frontend Developer"
              onChange={(value) =>
                updateForm(setFormData, "careerGoal", value)
              }
            />

            <FormInput
              label="Target Role"
              value={formData.targetRole}
              placeholder="Frontend Developer"
              onChange={(value) =>
                updateForm(setFormData, "targetRole", value)
              }
            />
          </div>

          <SelectField
            label="Current Experience Level"
            value={formData.currentLevel}
            options={[
              "Complete Beginner",
              "Beginner",
              "Intermediate",
              "Advanced",
            ]}
            onChange={(value) =>
              updateForm(setFormData, "currentLevel", value)
            }
          />

          <TextAreaField
            label="Current Skills"
            value={formData.currentSkills}
            placeholder="HTML, CSS, basic JavaScript"
            description="Separate skills with commas."
            onChange={(value) =>
              updateForm(setFormData, "currentSkills", value)
            }
          />

          <TextAreaField
            label="Career Interests"
            value={formData.interests}
            placeholder="React, AI tools, responsive design"
            description="Add subjects, tools or industries that interest you."
            onChange={(value) =>
              updateForm(setFormData, "interests", value)
            }
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Roadmap Duration"
              value={String(formData.durationMonths)}
              options={["1", "3", "6", "9", "12"]}
              formatOption={(option) =>
                `${option} ${option === "1" ? "month" : "months"}`
              }
              onChange={(value) =>
                updateForm(setFormData, "durationMonths", Number(value))
              }
            />

            <SelectField
              label="Weekly Study Time"
              value={String(formData.weeklyHours)}
              options={["3", "5", "10", "15", "20", "30"]}
              formatOption={(option) => `${option} hours`}
              onChange={(value) =>
                updateForm(setFormData, "weeklyHours", Number(value))
              }
            />
          </div>

          <SelectField
            label="Learning Preference"
            value={formData.learningPreference}
            options={[
              "A balanced mixture of learning, practice and projects",
              "Mostly practical projects and hands-on work",
              "Structured lessons followed by exercises",
              "Fast-paced learning with challenging projects",
              "Career preparation focused on employment",
            ]}
            onChange={(value) =>
              updateForm(setFormData, "learningPreference", value)
            }
          />

          <button
            type="button"
            disabled={isGenerating}
            onClick={onGenerate}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Building Your Roadmap...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate Career Roadmap
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
            What you will receive
          </p>

          <h2 className="mt-2 text-2xl font-bold">
            A complete plan for your goal
          </h2>

          <div className="mt-6 space-y-5">
            <FeatureItem
              icon={Flag}
              title="Monthly milestones"
              description="Clear stages that move you from your current level towards your target role."
            />

            <FeatureItem
              icon={ListChecks}
              title="Weekly tasks"
              description="Specific learning, practice and project activities with XP rewards."
            />

            <FeatureItem
              icon={FolderKanban}
              title="Portfolio projects"
              description="Practical work that demonstrates your abilities to employers and clients."
            />

            <FeatureItem
              icon={BriefcaseBusiness}
              title="Career preparation"
              description="Resume, interview, networking and job application actions."
            />
          </div>
        </div>

        <div className="rounded-3xl border border-indigo-200 bg-indigo-50 p-6 dark:border-indigo-900 dark:bg-indigo-950/30">
          <div className="flex items-start gap-3">
            <Lightbulb className="mt-0.5 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />

            <div>
              <h3 className="font-bold text-indigo-900 dark:text-indigo-200">
                Connected with Daily Mission
              </h3>

              <p className="mt-2 text-sm leading-6 text-indigo-700 dark:text-indigo-300">
                After creating your roadmap, Daily Mission will generate one
                focused task from your current milestone and week.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function RoadmapStats({ roadmap, progress, earnedXP }) {
  const completedMilestones = roadmap.milestones.filter(
    (milestone) => milestone.completed
  ).length;

  const completedTasks = roadmap.milestones.reduce(
    (total, milestone) =>
      total +
      milestone.weeks.reduce(
        (weekTotal, week) =>
          weekTotal +
          week.tasks.filter((task) => task.completed).length,
        0
      ),
    0
  );

  return (
    <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        icon={Target}
        label="Overall Progress"
        value={`${progress}%`}
        description="Roadmap completion"
      />

      <StatCard
        icon={CheckCircle2}
        label="Completed Tasks"
        value={`${completedTasks}/${roadmap.totalTasks}`}
        description="Practical activities"
      />

      <StatCard
        icon={Trophy}
        label="Milestones"
        value={`${completedMilestones}/${roadmap.milestones.length}`}
        description="Monthly stages"
      />

      <StatCard
        icon={Zap}
        label="XP Earned"
        value={`${earnedXP}/${roadmap.totalXP}`}
        description="Roadmap experience"
      />
    </section>
  );
}

function RoadmapSidebar({
  roadmap,
  selectedMilestoneIndex,
  onSelectMilestone,
  onCreateNew,
  onDelete,
}) {
  return (
    <aside className="h-fit rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 xl:sticky xl:top-24">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
          <Layers3 className="text-indigo-600 dark:text-indigo-300" />
        </div>

        <div>
          <h2 className="font-bold">Roadmap Milestones</h2>
          <p className="text-xs text-slate-500">
            {roadmap.milestones.length} stages
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-2">
        {roadmap.milestones.map((milestone, index) => {
          const milestoneProgress = calculateMilestoneProgress(milestone);
          const active = selectedMilestoneIndex === index;

          return (
            <button
              key={milestone.id}
              type="button"
              onClick={() => onSelectMilestone(index)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
                active
                  ? "border-indigo-300 bg-indigo-50 dark:border-indigo-700 dark:bg-indigo-950/40"
                  : "border-transparent hover:bg-slate-100 dark:hover:bg-slate-800"
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-sm font-bold ${
                    milestone.completed
                      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                      : active
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                  }`}
                >
                  {milestone.completed ? <Check size={17} /> : index + 1}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-slate-500">
                    Month {milestone.monthNumber}
                  </p>

                  <h3 className="mt-1 truncate text-sm font-bold">
                    {milestone.title}
                  </h3>

                  <div className="mt-3 flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                      <div
                        className="h-full rounded-full bg-indigo-600 transition-all"
                        style={{
                          width: `${milestoneProgress}%`,
                        }}
                      />
                    </div>

                    <span className="text-xs font-semibold text-slate-500">
                      {milestoneProgress}%
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-6 space-y-2 border-t border-slate-200 pt-5 dark:border-slate-800">
        <button
          type="button"
          onClick={onCreateNew}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          <RefreshCcw size={17} />
          Create New Roadmap
        </button>

        <button
          type="button"
          onClick={() => downloadRoadmapPDF(roadmap)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-indigo-200 px-4 py-3 text-sm font-semibold text-indigo-600 transition hover:bg-indigo-50 dark:border-indigo-800 dark:text-indigo-300 dark:hover:bg-indigo-950/30"
        >
          <Save size={17} />
          Download PDF
        </button>

        <button
          type="button"
          onClick={() => downloadRoadmapDOCX(roadmap)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold transition hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          <Save size={17} />
          Download DOCX
        </button>

        <button
          type="button"
          onClick={() => downloadRoadmapJSON(roadmap)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-200 px-4 py-3 text-sm font-semibold text-emerald-600 transition hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/30"
        >
          <Archive size={17} />
          Backup JSON
        </button>

        <button
          type="button"
          onClick={onDelete}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900 dark:hover:bg-rose-950/30"
        >
          <Trash2 size={17} />
          Delete Roadmap
        </button>
      </div>
    </aside>
  );
}

function RoadmapOverview({ roadmap }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            Your Career Destination
          </p>

          <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
            {roadmap.title}
          </h2>

          <p className="mt-3 max-w-3xl leading-7 text-slate-500">
            {roadmap.summary}
          </p>
        </div>

        <div className="rounded-2xl bg-slate-100 px-5 py-4 dark:bg-slate-800">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            Created
          </p>

          <p className="mt-1 font-bold">
            {formatRoadmapDate(roadmap.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          icon={Target}
          label="Career Goal"
          value={roadmap.careerGoal}
        />

        <InfoCard
          icon={BriefcaseBusiness}
          label="Target Role"
          value={roadmap.targetRole}
        />

        <InfoCard
          icon={GraduationCap}
          label="Current Level"
          value={roadmap.currentLevel}
        />

        <InfoCard
          icon={Clock3}
          label="Weekly Time"
          value={`${roadmap.weeklyHours} hours`}
        />
      </div>

      <div className="mt-7 rounded-2xl bg-indigo-50 p-5 dark:bg-indigo-950/30">
        <div className="flex items-start gap-3">
          <Rocket className="mt-1 flex-shrink-0 text-indigo-600 dark:text-indigo-300" />

          <div>
            <h3 className="font-bold text-indigo-900 dark:text-indigo-200">
              Career Outcome
            </h3>

            <p className="mt-2 leading-7 text-indigo-700 dark:text-indigo-300">
              {roadmap.careerOutcome}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-2">
        <TagSection
          title="Skills to Develop"
          icon={Code2}
          items={roadmap.skillsToDevelop}
        />

        <TagSection
          title="Recommended Tools"
          icon={Wrench}
          items={roadmap.recommendedTools}
        />
      </div>
    </section>
  );
}

function MilestoneDetails({
  milestone,
  milestoneIndex,
  expandedWeekId,
  setExpandedWeekId,
  onTaskToggle,
  onRegenerate,
  isRegenerating,
}) {
  const milestoneProgress = calculateMilestoneProgress(milestone);

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-purple-100 text-xl font-bold text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
            {milestoneIndex + 1}
          </div>

          <div>
            <p className="text-sm font-semibold text-purple-600">
              Month {milestone.monthNumber} · {milestone.theme}
            </p>

            <h2 className="mt-1 text-2xl font-bold">{milestone.title}</h2>

            <p className="mt-2 max-w-3xl leading-7 text-slate-500">
              {milestone.description}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onRegenerate}
          disabled={isRegenerating}
          className="flex flex-shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          {isRegenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCcw size={16} />
          )}

          Improve Milestone
        </button>
      </div>

      <div className="mt-7">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Milestone Progress</span>
          <span className="text-sm font-bold text-indigo-600">
            {milestoneProgress}%
          </span>
        </div>

        <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className="h-full rounded-full bg-indigo-600 transition-all"
            style={{
              width: `${milestoneProgress}%`,
            }}
          />
        </div>
      </div>

      <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
            Main Goal
          </p>

          <p className="mt-2 leading-7">{milestone.mainGoal}</p>
        </div>

        <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
          <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
            Milestone Reward
          </p>

          <div className="mt-2 flex items-center gap-2 text-xl font-bold">
            <Zap className="text-amber-500" />
            {milestone.milestoneXP} XP
          </div>
        </div>
      </div>

      <TagSection
        title="Skills in this milestone"
        icon={BookOpen}
        items={milestone.skillsToLearn}
        className="mt-7"
      />

      <div className="mt-8">
        <div className="flex items-center gap-2">
          <ListChecks className="text-indigo-600" />
          <h3 className="text-xl font-bold">Weekly Plan</h3>
        </div>

        <div className="mt-5 space-y-4">
          {milestone.weeks.map((week) => (
            <WeekCard
              key={week.id}
              week={week}
              expanded={expandedWeekId === week.id}
              onToggle={() =>
                setExpandedWeekId(
                  expandedWeekId === week.id ? null : week.id
                )
              }
              onTaskToggle={onTaskToggle}
            />
          ))}
        </div>
      </div>

      {milestone.milestoneProject && (
        <MilestoneProject project={milestone.milestoneProject} />
      )}

      {milestone.milestoneChecklist?.length > 0 && (
        <MilestoneChecklist items={milestone.milestoneChecklist} />
      )}
    </section>
  );
}

function WeekCard({ week, expanded, onToggle, onTaskToggle }) {
  const completedTasks = week.tasks.filter((task) => task.completed).length;
  const progress = week.tasks.length
    ? Math.round((completedTasks / week.tasks.length) * 100)
    : 0;

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center gap-4 bg-slate-50 p-5 text-left hover:bg-slate-100 dark:bg-slate-950 dark:hover:bg-slate-800"
      >
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl font-bold ${
            week.completed
              ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
              : "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
          }`}
        >
          {week.completed ? <Check size={18} /> : week.weekNumber}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500">
                Week {week.weekNumber}
              </p>

              <h4 className="mt-1 font-bold">{week.title}</h4>
            </div>

            <span className="text-xs font-semibold text-indigo-600">
              {completedTasks}/{week.tasks.length} tasks
            </span>
          </div>

          <div className="mt-3 flex items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-indigo-600"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>

            <span className="text-xs font-semibold text-slate-500">
              {progress}%
            </span>
          </div>
        </div>

        {expanded ? (
          <ChevronDown className="flex-shrink-0 text-slate-500" />
        ) : (
          <ChevronRight className="flex-shrink-0 text-slate-500" />
        )}
      </button>

      {expanded && (
        <div className="p-5">
          <div className="rounded-2xl bg-indigo-50 p-4 dark:bg-indigo-950/30">
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              Weekly Focus
            </p>

            <p className="mt-2 text-sm leading-6 text-indigo-700 dark:text-indigo-300">
              {week.focus}
            </p>
          </div>

          {week.objectives?.length > 0 && (
            <div className="mt-5">
              <h5 className="font-bold">Objectives</h5>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {week.objectives.map((objective, index) => (
                  <div
                    key={`${week.id}-objective-${index}`}
                    className="flex items-start gap-2 text-sm leading-6 text-slate-500"
                  >
                    <Target className="mt-1 h-4 w-4 flex-shrink-0 text-purple-600" />
                    {objective}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 space-y-3">
            {week.tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggle={() => onTaskToggle(task.id, !task.completed)}
              />
            ))}
          </div>

          {week.weeklyProject && (
            <div className="mt-6 rounded-2xl border border-purple-200 bg-purple-50 p-5 dark:border-purple-900 dark:bg-purple-950/30">
              <div className="flex items-start gap-3">
                <FolderKanban className="mt-0.5 flex-shrink-0 text-purple-600" />

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
                    Weekly Project
                  </p>

                  <h5 className="mt-2 font-bold">
                    {week.weeklyProject.title}
                  </h5>

                  <p className="mt-2 text-sm leading-6 text-purple-700 dark:text-purple-300">
                    {week.weeklyProject.description}
                  </p>

                  <p className="mt-3 text-xs font-semibold text-purple-600">
                    Estimated time: {week.weeklyProject.estimatedHours} hours
                  </p>

                  {week.weeklyProject.deliverables?.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {week.weeklyProject.deliverables.map(
                        (deliverable, index) => (
                          <div
                            key={`${week.id}-deliverable-${index}`}
                            className="flex items-start gap-2 text-sm text-purple-700 dark:text-purple-300"
                          >
                            <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                            {deliverable}
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

function TaskCard({ task, onToggle }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      className={`rounded-2xl border p-4 transition ${
        task.completed
          ? "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/20"
          : "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900"
      }`}
    >
      <div className="flex items-start gap-3">
        <button
          type="button"
          onClick={onToggle}
          className={`mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border-2 transition ${
            task.completed
              ? "border-emerald-600 bg-emerald-600 text-white"
              : "border-slate-300 hover:border-indigo-500 dark:border-slate-600"
          }`}
          aria-label={
            task.completed ? "Mark task incomplete" : "Mark task complete"
          }
        >
          {task.completed && <Check size={15} />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h5
                className={`font-bold ${
                  task.completed ? "line-through opacity-70" : ""
                }`}
              >
                {task.title}
              </h5>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                {task.description}
              </p>
            </div>

            <div className="flex flex-shrink-0 flex-wrap gap-2">
              <SmallBadge>{task.taskType}</SmallBadge>
              <SmallBadge>{task.difficulty}</SmallBadge>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold text-slate-500">
            <span className="flex items-center gap-1.5">
              <Clock3 size={14} />
              {task.estimatedMinutes} min
            </span>

            <span className="flex items-center gap-1.5 text-amber-600">
              <Zap size={14} />
              {task.xpReward} XP
            </span>

            <span className="flex items-center gap-1.5">
              <Layers3 size={14} />
              {task.skills?.length || 0} skills
            </span>
          </div>

          <button
            type="button"
            onClick={() => setExpanded((previous) => !previous)}
            className="mt-4 flex items-center gap-1.5 text-sm font-semibold text-indigo-600"
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            {expanded ? "Hide task details" : "View task details"}
          </button>

          {expanded && (
            <div className="mt-5 space-y-5 border-t border-slate-200 pt-5 dark:border-slate-800">
              <DetailBlock
                title="Deliverable"
                icon={FolderKanban}
                content={task.deliverable}
              />

              {task.successCriteria?.length > 0 && (
                <DetailList
                  title="Success Criteria"
                  icon={CheckCircle2}
                  items={task.successCriteria}
                />
              )}

              {task.skills?.length > 0 && (
                <TagSection
                  title="Skills"
                  icon={Code2}
                  items={task.skills}
                />
              )}

              {task.resources?.length > 0 && (
                <div>
                  <h6 className="flex items-center gap-2 font-bold">
                    <BookOpen size={17} className="text-indigo-600" />
                    Suggested Resources
                  </h6>

                  <div className="mt-3 space-y-2">
                    {task.resources.map((resource, index) => (
                      <div
                        key={`${task.id}-resource-${index}`}
                        className="rounded-xl bg-slate-100 p-3 dark:bg-slate-800"
                      >
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-sm font-semibold">
                            {resource.title}
                          </span>

                          <span className="text-xs font-semibold text-indigo-600">
                            {resource.type}
                          </span>
                        </div>

                        {resource.searchQuery && (
                          <p className="mt-2 text-xs leading-5 text-slate-500">
                            Search: {resource.searchQuery}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MilestoneProject({ project }) {
  return (
    <div className="mt-8 rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white sm:p-7">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15">
          <Rocket />
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-100">
            Monthly Milestone Project
          </p>

          <h3 className="mt-2 text-2xl font-bold">{project.title}</h3>

          <p className="mt-3 max-w-3xl leading-7 text-indigo-100">
            {project.description}
          </p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <ProjectList title="Recommended Features" items={project.features} />

        <ProjectList title="Project Deliverables" items={project.deliverables} />
      </div>
    </div>
  );
}

function MilestoneChecklist({ items }) {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2">
        <Award className="text-amber-600" />
        <h3 className="text-xl font-bold">Milestone Completion Checklist</h3>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950"
          >
            {item.completed ? (
              <CheckCircle2 className="mt-0.5 flex-shrink-0 text-emerald-600" />
            ) : (
              <Circle className="mt-0.5 flex-shrink-0 text-slate-400" />
            )}

            <p className="text-sm leading-6">{item.text}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function CareerPreparation({ roadmap }) {
  const sections = [
    {
      title: "Resume Actions",
      icon: Save,
      items: roadmap.jobPreparation?.resumeActions,
    },
    {
      title: "Interview Actions",
      icon: BriefcaseBusiness,
      items: roadmap.jobPreparation?.interviewActions,
    },
    {
      title: "Networking Actions",
      icon: Compass,
      items: roadmap.jobPreparation?.networkingActions,
    },
    {
      title: "Application Actions",
      icon: ArrowRight,
      items: roadmap.jobPreparation?.applicationActions,
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div>
        <p className="text-sm font-semibold text-indigo-600">
          Employment Preparation
        </p>

        <h2 className="mt-2 text-2xl font-bold">Career action plan</h2>

        <p className="mt-2 leading-7 text-slate-500">
          Complete these activities alongside your technical learning.
        </p>
      </div>

      <div className="mt-7 grid gap-5 md:grid-cols-2">
        {sections.map((section) => (
          <PreparationCard
            key={section.title}
            title={section.title}
            icon={section.icon}
            items={section.items}
          />
        ))}
      </div>
    </section>
  );
}

function CompletionSection({ roadmap }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
          <Trophy className="text-amber-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold">Roadmap completion outcome</h2>

          <p className="mt-2 leading-7 text-slate-500">
            {roadmap.finalPortfolioOutcome}
          </p>
        </div>
      </div>

      {roadmap.completionRequirements?.length > 0 && (
        <div className="mt-7">
          <h3 className="font-bold">Completion Requirements</h3>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {roadmap.completionRequirements.map((requirement, index) => (
              <div
                key={`requirement-${index}`}
                className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-950"
              >
                <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-600" />

                <p className="text-sm leading-6">{requirement}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-7 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 p-5 text-center dark:from-amber-950/20 dark:to-orange-950/20">
        <p className="font-semibold text-amber-800 dark:text-amber-300">
          {roadmap.motivationMessage}
        </p>
      </div>
    </section>
  );
}

function RegenerateModal({
  milestone,
  feedback,
  setFeedback,
  isLoading,
  onClose,
  onSubmit,
}) {
  return (
    <ModalOverlay>
      <div className="w-full max-w-xl rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-purple-600">
              Improve Milestone
            </p>

            <h2 className="mt-1 text-2xl font-bold">
              {milestone?.title || "Roadmap Milestone"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl p-2 hover:bg-slate-100 disabled:opacity-50 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <p className="mt-4 leading-7 text-slate-500">
          Tell the AI what should be changed. It will rebuild this milestone
          while keeping the rest of your roadmap unchanged.
        </p>

        <label className="mt-6 block">
          <span className="mb-2 block text-sm font-semibold">
            Your Feedback
          </span>

          <textarea
            rows={6}
            value={feedback}
            disabled={isLoading}
            onChange={(event) => setFeedback(event.target.value)}
            placeholder="For example: Add more React projects, reduce theory, and include freelance preparation."
            className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 leading-7 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950"
          />
        </label>

        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 px-5 py-3 font-semibold hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isLoading}
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Regenerating...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Regenerate Milestone
              </>
            )}
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function DeleteRoadmapModal({ onClose, onDelete }) {
  return (
    <ModalOverlay>
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900 sm:p-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-100 dark:bg-rose-900/30">
          <Trash2 className="text-rose-600" />
        </div>

        <h2 className="mt-5 text-center text-2xl font-bold">
          Delete career roadmap?
        </h2>

        <p className="mt-3 text-center leading-7 text-slate-500">
          This will remove the saved roadmap and its task progress from this
          browser.
        </p>

        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-5 py-3 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
          >
            Keep Roadmap
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="rounded-xl bg-rose-600 px-5 py-3 font-semibold text-white hover:bg-rose-700"
          >
            Delete Roadmap
          </button>
        </div>
      </div>
    </ModalOverlay>
  );
}

function ErrorMessage({ message, onClose }) {
  return (
    <div className="mt-6 flex items-start justify-between gap-4 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
      <div className="flex items-start gap-3">
        <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />

        <p className="text-sm font-medium leading-6">{message}</p>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="rounded-lg p-1 hover:bg-rose-100 dark:hover:bg-rose-900/30"
      >
        <X size={17} />
      </button>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">{label}</p>

          <p className="mt-2 text-2xl font-bold">{value}</p>

          <p className="mt-1 text-xs text-slate-500">{description}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
          <Icon className="text-indigo-600 dark:text-indigo-300" size={21} />
        </div>
      </div>
    </div>
  );
}

function HeroStat({ icon: Icon, label, value, fullWidth = false }) {
  return (
    <div
      className={`rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur ${
        fullWidth ? "col-span-2 sm:col-span-1" : ""
      }`}
    >
      <div className="flex items-center gap-2 text-indigo-100">
        <Icon size={15} />
        <span className="text-xs">{label}</span>
      </div>

      <p className="mt-1 text-lg font-bold">{value}</p>
    </div>
  );
}

function InfoCard({ icon: Icon, label, value }) {
  return (
    <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
      <div className="flex items-center gap-2 text-slate-500">
        <Icon size={16} />
        <span className="text-xs font-semibold uppercase tracking-wider">
          {label}
        </span>
      </div>

      <p className="mt-2 font-bold">{value}</p>
    </div>
  );
}

function FeatureItem({ icon: Icon, title, description }) {
  return (
    <div className="flex gap-4">
      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
        <Icon className="text-indigo-600 dark:text-indigo-300" size={20} />
      </div>

      <div>
        <h3 className="font-bold">{title}</h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </div>
  );
}

function PreparationCard({ title, icon: Icon, items = [] }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-950">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
          <Icon className="text-indigo-600 dark:text-indigo-300" size={18} />
        </div>

        <h3 className="font-bold">{title}</h3>
      </div>

      <div className="mt-4 space-y-3">
        {items?.length ? (
          items.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="flex items-start gap-2 text-sm leading-6 text-slate-500"
            >
              <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-emerald-600" />
              {item}
            </div>
          ))
        ) : (
          <p className="text-sm text-slate-500">No actions available.</p>
        )}
      </div>
    </div>
  );
}

function ProjectList({ title, items = [] }) {
  return (
    <div className="rounded-2xl bg-white/10 p-5">
      <h4 className="font-bold">{title}</h4>

      <div className="mt-4 space-y-3">
        {items?.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="flex items-start gap-2 text-sm leading-6 text-indigo-100"
          >
            <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function TagSection({
  title,
  icon: Icon,
  items = [],
  className = "",
}) {
  if (!items?.length) {
    return null;
  }

  return (
    <div className={className}>
      <h3 className="flex items-center gap-2 font-bold">
        <Icon size={18} className="text-indigo-600" />
        {title}
      </h3>

      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((item, index) => (
          <span
            key={`${title}-${index}`}
            className="rounded-full bg-indigo-100 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function DetailBlock({ title, icon: Icon, content }) {
  if (!content) {
    return null;
  }

  return (
    <div>
      <h6 className="flex items-center gap-2 font-bold">
        <Icon size={17} className="text-indigo-600" />
        {title}
      </h6>

      <p className="mt-2 text-sm leading-6 text-slate-500">{content}</p>
    </div>
  );
}

function DetailList({ title, icon: Icon, items = [] }) {
  return (
    <div>
      <h6 className="flex items-center gap-2 font-bold">
        <Icon size={17} className="text-indigo-600" />
        {title}
      </h6>

      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="flex items-start gap-2 text-sm leading-6 text-slate-500"
          >
            <CheckCircle2 className="mt-1 h-4 w-4 flex-shrink-0 text-emerald-600" />
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function SmallBadge({ children }) {
  return (
    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
      {children}
    </span>
  );
}

function FormInput({ label, value, placeholder, onChange }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950"
      />
    </label>
  );
}

function TextAreaField({
  label,
  value,
  placeholder,
  description,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>

      <textarea
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="w-full resize-none rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950"
      />

      {description && (
        <span className="mt-1.5 block text-xs text-slate-500">
          {description}
        </span>
      )}
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  formatOption = (option) => option,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">{label}</span>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {formatOption(option)}
          </option>
        ))}
      </select>
    </label>
  );
}

function ModalOverlay({ children }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      {children}
    </div>
  );
}

function updateForm(setFormData, field, value) {
  setFormData((previous) => ({
    ...previous,
    [field]: value,
  }));
}

export default CareerRoadmap; 