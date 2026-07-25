import {
  ArrowRight,
  Bookmark,
  CheckCircle2,
  Clock,
  Code2,
  FolderKanban,
  Heart,
  Lightbulb,
  Loader2,
  Search,
  Sparkles,
  Star,
  Target,
  Trash2,
  Trophy,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";
import { generateAIProject } from "../services/aiProjectService";

const DEFAULT_USER = {
  name: "PathPilot User",
  careerGoal: "Web Developer",
  experience: "Beginner",
  skills: ["HTML", "CSS", "JavaScript"],
  interests: ["Web Development", "Artificial Intelligence"],
  dailyTime: "1 hour",
};

const difficultyStyles = {
  Beginner:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",

  Intermediate:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",

  Advanced:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

const statusStyles = {
  "Not Started":
    "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",

  "In Progress":
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",

  Completed:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
};

function parseLocalStorage(key, fallback) {
  try {
    const savedValue = localStorage.getItem(key);

    if (!savedValue) {
      return fallback;
    }

    return JSON.parse(savedValue);
  } catch (error) {
    console.error(`Unable to read ${key}:`, error);
    return fallback;
  }
}

function normaliseUser(user) {
  return {
    ...DEFAULT_USER,
    ...user,

    skills: Array.isArray(user?.skills)
      ? user.skills
      : DEFAULT_USER.skills,

    interests: Array.isArray(user?.interests)
      ? user.interests
      : DEFAULT_USER.interests,
  };
}

function normaliseAIProject(project) {
  return {
    id: project?.id || `ai-${Date.now()}`,

    title:
      project?.title ||
      "AI Generated Project",

    description:
      project?.description ||
      "A personalised project generated for your career goals.",

    category:
      project?.category ||
      "AI",

    difficulty:
      project?.difficulty ||
      "Intermediate",

    duration:
      project?.duration ||
      "5-7 Days",

    xp: Number(project?.xp) || 500,

    skills: Array.isArray(project?.skills)
      ? project.skills
      : [],

    features: Array.isArray(project?.features)
      ? project.features
      : [],

    steps: Array.isArray(project?.steps)
      ? project.steps
      : [],

    learningOutcomes: Array.isArray(
      project?.learningOutcomes
    )
      ? project.learningOutcomes
      : [],

    bonusChallenges: Array.isArray(
      project?.bonusChallenges
    )
      ? project.bonusChallenges
      : [],

    resumeImpact:
      project?.resumeImpact ||
      "",

    githubStructure:
      project?.githubStructure ||
      "",

    outcome:
      project?.outcome ||
      "A portfolio-ready project.",

    source: "ai",
  };
}

function AIProjects() {
  const [userData, setUserData] = useState(DEFAULT_USER);

  const [activeTab, setActiveTab] =
    useState("local");

  const [searchTerm, setSearchTerm] =
    useState("");

  const [selectedDifficulty, setSelectedDifficulty] =
    useState("All");

  const [projectStatus, setProjectStatus] =
    useState({});

  const [favourites, setFavourites] =
    useState([]);

  const [savedAIProjects, setSavedAIProjects] =
    useState([]);

  const [generatedProject, setGeneratedProject] =
    useState(null);

  const [selectedProject, setSelectedProject] =
    useState(null);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [generationError, setGenerationError] =
    useState("");

  const [projectForm, setProjectForm] =
    useState({
      goal: "",
      skills: "",
      experience: "",
      interests: "",
      dailyTime: "",
      projectType: "Portfolio Project",
    });

  useEffect(() => {
    const savedUser = parseLocalStorage(
      "pathpilot_user",
      DEFAULT_USER
    );

    const completeUser =
      normaliseUser(savedUser);

    setUserData(completeUser);

    setProjectForm({
      goal:
        completeUser.careerGoal ||
        "",

      skills:
        completeUser.skills.join(", "),

      experience:
        completeUser.experience ||
        "",

      interests:
        completeUser.interests.join(", "),

      dailyTime:
        completeUser.dailyTime ||
        "1 hour",

      projectType:
        "Portfolio Project",
    });

    setProjectStatus(
      parseLocalStorage(
        "pathpilot_project_status",
        {}
      )
    );

    setFavourites(
      parseLocalStorage(
        "pathpilot_favourite_projects",
        []
      )
    );

    setSavedAIProjects(
      parseLocalStorage(
        "pathpilot_saved_ai_projects",
        []
      )
    );
  }, []);

  const localProjects = useMemo(() => {
    const firstSkill =
      userData.skills?.[0] ||
      "Web Development";

    const secondSkill =
      userData.skills?.[1] ||
      "JavaScript";

    const firstInterest =
      userData.interests?.[0] ||
      "Artificial Intelligence";

    return [
      {
        id: "local-project-1",

        title: `${firstSkill} Skill Builder`,

        description:
          "Build a focused project that strengthens your main technical skill and gives you practical experience.",

        category: "Skill Building",
        difficulty: "Beginner",
        duration: "2-4 Days",
        xp: 200,

        skills: [
          firstSkill,
          "Problem Solving",
          "GitHub",
        ],

        features: [
          "Responsive user interface",
          "Reusable components",
          "Input validation",
          "Local data storage",
          "Project documentation",
        ],

        steps: [
          "Choose one problem to solve.",
          "Plan the main project features.",
          "Create the user interface.",
          "Build the main functionality.",
          "Test the application.",
          "Publish the project on GitHub.",
        ],

        learningOutcomes: [
          `Improve your ${firstSkill} skills.`,
          "Learn project planning.",
          "Practise GitHub workflow.",
        ],

        outcome:
          "A complete beginner-friendly portfolio project.",

        icon: Code2,
        source: "local",
      },

      {
        id: "local-project-2",

        title: `AI-Powered ${firstInterest} Assistant`,

        description:
          "Create an intelligent assistant that provides useful recommendations based on user input.",

        category: "AI",
        difficulty: "Intermediate",
        duration: "5-7 Days",
        xp: 450,

        skills: [
          "Artificial Intelligence",
          "Prompt Engineering",
          firstSkill,
          "API Integration",
        ],

        features: [
          "Interactive chat interface",
          "Personalised AI responses",
          "Loading and error states",
          "Conversation history",
          "Responsive design",
        ],

        steps: [
          "Define the assistant's purpose.",
          "Design the chat interface.",
          "Create the backend API.",
          "Connect the Gemini API.",
          "Add loading and error handling.",
          "Test different prompts.",
          "Deploy the application.",
        ],

        learningOutcomes: [
          "Learn Gemini API integration.",
          "Improve prompt-writing skills.",
          "Build an AI-powered interface.",
        ],

        outcome:
          "A working AI assistant suitable for your portfolio.",

        icon: Sparkles,
        source: "local",
      },

      {
        id: "local-project-3",

        title: `${secondSkill} Portfolio Application`,

        description:
          "Create a polished application that demonstrates your technical and design abilities.",

        category: "Portfolio",
        difficulty: "Intermediate",
        duration: "4-7 Days",
        xp: 350,

        skills: [
          secondSkill,
          "UI Design",
          "Responsive Design",
          "GitHub",
        ],

        features: [
          "Modern landing page",
          "Responsive layout",
          "Interactive sections",
          "Project showcase",
          "Contact form",
        ],

        steps: [
          "Choose an application idea.",
          "Create a simple wireframe.",
          "Build the page structure.",
          "Add responsive styling.",
          "Add interactions.",
          "Test on different devices.",
          "Publish the application.",
        ],

        learningOutcomes: [
          `Improve your ${secondSkill} knowledge.`,
          "Create professional UI designs.",
          "Build responsive applications.",
        ],

        outcome:
          "A polished project ready to add to your professional portfolio.",

        icon: FolderKanban,
        source: "local",
      },

      {
        id: "local-project-4",

        title: "Personal Productivity Dashboard",

        description:
          "Build a dashboard where users can manage goals, tasks, habits and daily progress.",

        category: "Productivity",
        difficulty: "Beginner",
        duration: "3-5 Days",
        xp: 250,

        skills: [
          "React",
          "State Management",
          "Local Storage",
          "UI Design",
        ],

        features: [
          "Task management",
          "Habit tracker",
          "Goal progress",
          "Daily statistics",
          "Persistent local data",
        ],

        steps: [
          "Design the dashboard layout.",
          "Create task components.",
          "Add habit tracking.",
          "Add progress statistics.",
          "Save data in localStorage.",
          "Test the complete dashboard.",
        ],

        learningOutcomes: [
          "Practise React state management.",
          "Learn localStorage.",
          "Build dashboard interfaces.",
        ],

        outcome:
          "A complete productivity dashboard with saved user progress.",

        icon: Trophy,
        source: "local",
      },

      {
        id: "local-project-5",

        title: "AI Learning Companion",

        description:
          "Create an AI study assistant that explains topics, generates quizzes and creates learning plans.",

        category: "Education",
        difficulty: "Intermediate",
        duration: "7-10 Days",
        xp: 550,

        skills: [
          "Artificial Intelligence",
          "React",
          "Prompt Engineering",
          "Education Technology",
        ],

        features: [
          "Topic explanations",
          "Quiz generator",
          "Study roadmap",
          "Progress tracking",
          "Personalised recommendations",
        ],

        steps: [
          "Choose supported subjects.",
          "Design the learning interface.",
          "Create reusable prompts.",
          "Connect the AI backend.",
          "Add quiz functionality.",
          "Add progress tracking.",
          "Test multiple learning topics.",
        ],

        learningOutcomes: [
          "Build educational AI tools.",
          "Improve prompt engineering.",
          "Create personalised learning experiences.",
        ],

        outcome:
          "An interactive AI learning application.",

        icon: Lightbulb,
        source: "local",
      },

      {
        id: "local-project-6",

        title: "Career Roadmap Generator",

        description:
          "Build a career-planning tool that creates personalised learning stages based on user goals.",

        category: "AI",
        difficulty: "Advanced",
        duration: "10-14 Days",
        xp: 750,

        skills: [
          "React",
          "Artificial Intelligence",
          "Backend Development",
          "Data Management",
        ],

        features: [
          "Career assessment form",
          "Personalised roadmap",
          "Learning milestones",
          "Progress tracking",
          "AI recommendations",
        ],

        steps: [
          "Create the onboarding form.",
          "Collect career information.",
          "Create the roadmap prompt.",
          "Build the backend endpoint.",
          "Display roadmap stages.",
          "Add milestone tracking.",
          "Save progress locally.",
          "Test different career goals.",
        ],

        learningOutcomes: [
          "Build personalised AI systems.",
          "Manage complex application state.",
          "Create roadmap interfaces.",
        ],

        outcome:
          "A complete AI career-planning application.",

        icon: Target,
        source: "local",
      },
    ];
  }, [userData]);

  const filteredLocalProjects =
    useMemo(() => {
      const search =
        searchTerm.toLowerCase().trim();

      return localProjects.filter(
        (project) => {
          const matchesSearch =
            !search ||
            project.title
              .toLowerCase()
              .includes(search) ||
            project.description
              .toLowerCase()
              .includes(search) ||
            project.skills.some((skill) =>
              skill
                .toLowerCase()
                .includes(search)
            );

          const matchesDifficulty =
            selectedDifficulty === "All" ||
            project.difficulty ===
              selectedDifficulty;

          return (
            matchesSearch &&
            matchesDifficulty
          );
        }
      );
    }, [
      localProjects,
      searchTerm,
      selectedDifficulty,
    ]);

  const getProjectStatus = (projectId) =>
    projectStatus[projectId] ||
    "Not Started";

  const updateProjectStatus = (
    projectId,
    newStatus
  ) => {
    setProjectStatus((previous) => {
      const updatedStatus = {
        ...previous,
        [projectId]: newStatus,
      };

      localStorage.setItem(
        "pathpilot_project_status",
        JSON.stringify(updatedStatus)
      );

      return updatedStatus;
    });
  };

  const handleProjectAction = (project) => {
    const currentStatus =
      getProjectStatus(project.id);

    if (currentStatus === "Not Started") {
      updateProjectStatus(
        project.id,
        "In Progress"
      );
      return;
    }

    if (currentStatus === "In Progress") {
      updateProjectStatus(
        project.id,
        "Completed"
      );
      return;
    }

    updateProjectStatus(
      project.id,
      "In Progress"
    );
  };

  const getActionLabel = (projectId) => {
    const status =
      getProjectStatus(projectId);

    if (status === "In Progress") {
      return "Mark Complete";
    }

    if (status === "Completed") {
      return "Reopen Project";
    }

    return "Start Project";
  };

  const toggleFavourite = (projectId) => {
    setFavourites((previous) => {
      const updatedFavourites =
        previous.includes(projectId)
          ? previous.filter(
              (id) => id !== projectId
            )
          : [...previous, projectId];

      localStorage.setItem(
        "pathpilot_favourite_projects",
        JSON.stringify(updatedFavourites)
      );

      return updatedFavourites;
    });
  };

  const handleGenerateProject =
    async () => {
      if (!projectForm.goal.trim()) {
        setGenerationError(
          "Please enter your career goal."
        );
        return;
      }

      setIsGenerating(true);
      setGenerationError("");

      try {
        const result =
          await generateAIProject(
            projectForm
          );

        const formattedProject =
          normaliseAIProject(result);

        setGeneratedProject(
          formattedProject
        );
      } catch (error) {
        console.error(error);

        setGenerationError(
          error.message ||
            "AI is currently unavailable. You can continue using local projects."
        );
      } finally {
        setIsGenerating(false);
      }
    };

  const saveGeneratedProject = () => {
    if (!generatedProject) {
      return;
    }

    const alreadySaved =
      savedAIProjects.some(
        (project) =>
          project.id ===
          generatedProject.id
      );

    if (alreadySaved) {
      return;
    }

    const updatedProjects = [
      generatedProject,
      ...savedAIProjects,
    ];

    setSavedAIProjects(
      updatedProjects
    );

    localStorage.setItem(
      "pathpilot_saved_ai_projects",
      JSON.stringify(updatedProjects)
    );
  };

  const deleteSavedAIProject = (
    projectId
  ) => {
    const updatedProjects =
      savedAIProjects.filter(
        (project) =>
          project.id !== projectId
      );

    setSavedAIProjects(
      updatedProjects
    );

    localStorage.setItem(
      "pathpilot_saved_ai_projects",
      JSON.stringify(updatedProjects)
    );

    if (
      generatedProject?.id === projectId
    ) {
      setGeneratedProject(null);
    }
  };

  const allProjects = [
    ...localProjects,
    ...savedAIProjects,
  ];

  const completedProjects =
    allProjects.filter(
      (project) =>
        getProjectStatus(project.id) ===
        "Completed"
    );

  const earnedXP =
    completedProjects.reduce(
      (total, project) =>
        total +
        (Number(project.xp) || 0),
      0
    );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6">
      <div className="mx-auto max-w-7xl">
        <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-xl sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-indigo-100">
                <Sparkles size={18} />

                <span className="text-sm font-semibold">
                  PathPilot Projects
                </span>
              </div>

              <h1 className="mt-3 text-3xl font-bold">
                Build. Learn. Grow.
              </h1>

              <p className="mt-3 max-w-2xl leading-7 text-indigo-100">
                Generate personalised AI
                projects or explore local
                projects that always remain
                available.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <StatCard
                label="Projects"
                value={allProjects.length}
              />

              <StatCard
                label="Completed"
                value={
                  completedProjects.length
                }
              />

              <StatCard
                label="XP"
                value={earnedXP}
              />
            </div>
          </div>
        </section>

        <section className="mt-8 grid grid-cols-2 gap-2 rounded-2xl border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            onClick={() =>
              setActiveTab("local")
            }
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition ${
              activeTab === "local"
                ? "bg-indigo-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <FolderKanban size={18} />
            Local Projects
          </button>

          <button
            type="button"
            onClick={() =>
              setActiveTab("ai")
            }
            className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition ${
              activeTab === "ai"
                ? "bg-purple-600 text-white"
                : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            }`}
          >
            <WandSparkles size={18} />
            AI Generator
          </button>
        </section>

        {activeTab === "local" && (
          <LocalProjectsSection
            projects={
              filteredLocalProjects
            }
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            selectedDifficulty={
              selectedDifficulty
            }
            setSelectedDifficulty={
              setSelectedDifficulty
            }
            favourites={favourites}
            getProjectStatus={
              getProjectStatus
            }
            getActionLabel={
              getActionLabel
            }
            toggleFavourite={
              toggleFavourite
            }
            handleProjectAction={
              handleProjectAction
            }
            setSelectedProject={
              setSelectedProject
            }
          />
        )}

        {activeTab === "ai" && (
          <AIProjectsSection
            projectForm={projectForm}
            setProjectForm={
              setProjectForm
            }
            generatedProject={
              generatedProject
            }
            savedAIProjects={
              savedAIProjects
            }
            generationError={
              generationError
            }
            isGenerating={
              isGenerating
            }
            handleGenerateProject={
              handleGenerateProject
            }
            saveGeneratedProject={
              saveGeneratedProject
            }
            deleteSavedAIProject={
              deleteSavedAIProject
            }
            setSelectedProject={
              setSelectedProject
            }
            setActiveTab={setActiveTab}
          />
        )}
      </div>

      {selectedProject && (
        <ProjectModal
          project={selectedProject}
          status={getProjectStatus(
            selectedProject.id
          )}
          actionLabel={getActionLabel(
            selectedProject.id
          )}
          onClose={() =>
            setSelectedProject(null)
          }
          onAction={() => {
            handleProjectAction(
              selectedProject
            );

            setSelectedProject(null);
          }}
        />
      )}
    </main>
  );
}

function LocalProjectsSection({
  projects,
  searchTerm,
  setSearchTerm,
  selectedDifficulty,
  setSelectedDifficulty,
  favourites,
  getProjectStatus,
  getActionLabel,
  toggleFavourite,
  handleProjectAction,
  setSelectedProject,
}) {
  return (
    <section className="mt-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />

            <input
              value={searchTerm}
              onChange={(event) =>
                setSearchTerm(
                  event.target.value
                )
              }
              placeholder="Search projects or skills..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 outline-none focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-950"
            />
          </div>

          <select
            value={selectedDifficulty}
            onChange={(event) =>
              setSelectedDifficulty(
                event.target.value
              )
            }
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="All">
              All Difficulties
            </option>

            <option value="Beginner">
              Beginner
            </option>

            <option value="Intermediate">
              Intermediate
            </option>

            <option value="Advanced">
              Advanced
            </option>
          </select>
        </div>
      </div>

      <div className="mb-5 mt-8">
        <p className="text-sm font-bold uppercase tracking-wider text-indigo-600">
          Always available
        </p>

        <h2 className="mt-1 text-2xl font-bold">
          Local Project Library
        </h2>

        <p className="mt-1 text-slate-500">
          These projects work even when
          Gemini is unavailable.
        </p>
      </div>

      {projects.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
          <Search className="mx-auto h-10 w-10 text-slate-400" />

          <h3 className="mt-4 text-lg font-bold">
            No projects found
          </h3>

          <p className="mt-2 text-slate-500">
            Try changing your search or
            difficulty filter.
          </p>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              status={getProjectStatus(
                project.id
              )}
              favourite={favourites.includes(
                project.id
              )}
              actionLabel={getActionLabel(
                project.id
              )}
              onFavourite={() =>
                toggleFavourite(project.id)
              }
              onDetails={() =>
                setSelectedProject(project)
              }
              onAction={() =>
                handleProjectAction(project)
              }
            />
          ))}
        </div>
      )}
    </section>
  );
}

function AIProjectsSection({
  projectForm,
  setProjectForm,
  generatedProject,
  savedAIProjects,
  generationError,
  isGenerating,
  handleGenerateProject,
  saveGeneratedProject,
  deleteSavedAIProject,
  setSelectedProject,
  setActiveTab,
}) {
  const generatedProjectSaved =
    generatedProject &&
    savedAIProjects.some(
      (project) =>
        project.id ===
        generatedProject.id
    );

  return (
    <section className="mt-8 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
            <WandSparkles className="text-purple-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              AI Project Generator
            </h2>

            <p className="text-sm text-slate-500">
              Generate a project based on
              your profile.
            </p>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <FormInput
            label="Career Goal"
            value={projectForm.goal}
            placeholder="Frontend Developer"
            onChange={(value) =>
              setProjectForm(
                (previous) => ({
                  ...previous,
                  goal: value,
                })
              )
            }
          />

          <FormInput
            label="Skills"
            value={projectForm.skills}
            placeholder="React, JavaScript, Tailwind"
            onChange={(value) =>
              setProjectForm(
                (previous) => ({
                  ...previous,
                  skills: value,
                })
              )
            }
          />

          <FormInput
            label="Interests"
            value={projectForm.interests}
            placeholder="AI, education, productivity"
            onChange={(value) =>
              setProjectForm(
                (previous) => ({
                  ...previous,
                  interests: value,
                })
              )
            }
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <FormInput
              label="Experience"
              value={
                projectForm.experience
              }
              placeholder="Beginner"
              onChange={(value) =>
                setProjectForm(
                  (previous) => ({
                    ...previous,
                    experience: value,
                  })
                )
              }
            />

            <FormInput
              label="Daily Time"
              value={projectForm.dailyTime}
              placeholder="1 hour"
              onChange={(value) =>
                setProjectForm(
                  (previous) => ({
                    ...previous,
                    dailyTime: value,
                  })
                )
              }
            />
          </div>

          <label className="block">
            <span className="mb-2 block text-sm font-semibold">
              Project Type
            </span>

            <select
              value={projectForm.projectType}
              onChange={(event) =>
                setProjectForm(
                  (previous) => ({
                    ...previous,
                    projectType:
                      event.target.value,
                  })
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none focus:border-purple-500 dark:border-slate-700 dark:bg-slate-950"
            >
              <option>
                Portfolio Project
              </option>

              <option>
                AI Project
              </option>

              <option>
                Learning Project
              </option>

              <option>
                Client-Ready Project
              </option>

              <option>
                Business Project
              </option>
            </select>
          </label>

          {generationError && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
              <p>{generationError}</p>

              <button
                type="button"
                onClick={() =>
                  setActiveTab("local")
                }
                className="mt-2 font-semibold underline"
              >
                Open local projects
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={
              handleGenerateProject
            }
            disabled={isGenerating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-5 py-3.5 font-semibold text-white transition hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={19} />
                Generate AI Project
              </>
            )}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {generatedProject ? (
          <GeneratedProjectCard
            project={generatedProject}
            saved={
              generatedProjectSaved
            }
            isGenerating={
              isGenerating
            }
            onDetails={() =>
              setSelectedProject(
                generatedProject
              )
            }
            onSave={
              saveGeneratedProject
            }
            onRegenerate={
              handleGenerateProject
            }
          />
        ) : (
          <div className="flex min-h-[440px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <div>
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
                <Sparkles className="h-8 w-8 text-purple-600" />
              </div>

              <h3 className="mt-5 text-xl font-bold">
                Your AI project will
                appear here
              </h3>

              <p className="mx-auto mt-2 max-w-md leading-6 text-slate-500">
                Enter your preferences
                and generate a personalised
                project with features,
                steps and learning outcomes.
              </p>
            </div>
          </div>
        )}

        {savedAIProjects.length > 0 && (
          <div>
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
                  Saved projects
                </p>

                <h2 className="text-xl font-bold">
                  My AI Projects
                </h2>
              </div>

              <span className="rounded-full bg-purple-100 px-3 py-1 text-sm font-bold text-purple-700">
                {savedAIProjects.length}
              </span>
            </div>

            <div className="space-y-3">
              {savedAIProjects.map(
                (project) => (
                  <div
                    key={project.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setSelectedProject(
                          project
                        )
                      }
                      className="min-w-0 text-left"
                    >
                      <h3 className="truncate font-bold hover:text-purple-600">
                        {project.title}
                      </h3>

                      <p className="mt-1 text-sm text-slate-500">
                        {
                          project.difficulty
                        }{" "}
                        • {project.duration}
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        deleteSavedAIProject(
                          project.id
                        )
                      }
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/30"
                      aria-label="Delete saved project"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                )
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ProjectCard({
  project,
  status,
  favourite,
  actionLabel,
  onFavourite,
  onDetails,
  onAction,
}) {
  const Icon =
    project.icon || Sparkles;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:border-indigo-400 hover:shadow-xl dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
          {status === "Completed" ? (
            <CheckCircle2 className="text-emerald-600" />
          ) : (
            <Icon className="text-indigo-600" />
          )}
        </div>

        <button
          type="button"
          onClick={onFavourite}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border ${
            favourite
              ? "border-rose-200 bg-rose-50 text-rose-500"
              : "border-slate-200 text-slate-400 dark:border-slate-700"
          }`}
        >
          <Heart
            size={18}
            fill={
              favourite
                ? "currentColor"
                : "none"
            }
          />
        </button>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
          {project.category}
        </Badge>

        <Badge
          className={
            difficultyStyles[
              project.difficulty
            ]
          }
        >
          {project.difficulty}
        </Badge>

        <Badge
          className={
            statusStyles[status]
          }
        >
          {status}
        </Badge>
      </div>

      <h2 className="mt-4 text-xl font-bold">
        {project.title}
      </h2>

      <p className="mt-3 flex-1 text-sm leading-6 text-slate-500">
        {project.description}
      </p>

      <div className="mt-5 flex items-center gap-4 text-sm text-slate-500">
        <span className="flex items-center gap-1.5">
          <Clock size={16} />
          {project.duration}
        </span>

        <span className="flex items-center gap-1.5">
          <Star size={16} />
          {project.xp} XP
        </span>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {project.skills
          .slice(0, 4)
          .map((skill) => (
            <span
              key={`${project.id}-${skill}`}
              className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300"
            >
              {skill}
            </span>
          ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onDetails}
          className="rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          View Details
        </button>

        <button
          type="button"
          onClick={onAction}
          className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-3 py-3 text-sm font-semibold text-white hover:bg-indigo-700"
        >
          {status === "Completed" ? (
            <Bookmark size={16} />
          ) : (
            <ArrowRight size={16} />
          )}

          {actionLabel}
        </button>
      </div>
    </article>
  );
}

function GeneratedProjectCard({
  project,
  saved,
  isGenerating,
  onDetails,
  onSave,
  onRegenerate,
}) {
  return (
    <article className="rounded-3xl border border-purple-200 bg-white p-6 shadow-lg shadow-purple-500/10 dark:border-purple-900 dark:bg-slate-900">
      <div className="flex items-start justify-between">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
          <Sparkles className="text-purple-600" />
        </div>

        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
          AI Generated
        </Badge>
      </div>

      <h2 className="mt-5 text-2xl font-bold">
        {project.title}
      </h2>

      <p className="mt-3 leading-7 text-slate-500">
        {project.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        <Badge
          className={
            difficultyStyles[
              project.difficulty
            ]
          }
        >
          {project.difficulty}
        </Badge>

        <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          {project.duration}
        </Badge>

        <Badge className="bg-amber-100 text-amber-700">
          {project.xp} XP
        </Badge>
      </div>

      {project.features.length > 0 && (
        <div className="mt-6">
          <h3 className="font-bold">
            Core Features
          </h3>

          <ul className="mt-3 space-y-2">
            {project.features
              .slice(0, 5)
              .map((feature) => (
                <li
                  key={feature}
                  className="flex items-start gap-2 text-sm text-slate-500"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-purple-600" />
                  {feature}
                </li>
              ))}
          </ul>
        </div>
      )}

      <div className="mt-6 flex flex-wrap gap-2">
        {project.skills
          .slice(0, 6)
          .map((skill) => (
            <span
              key={skill}
              className="rounded-lg bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700 dark:bg-purple-950/30 dark:text-purple-300"
            >
              {skill}
            </span>
          ))}
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3">
        <button
          type="button"
          onClick={onDetails}
          className="rounded-xl border border-slate-200 px-4 py-3 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
        >
          Full Details
        </button>

        <button
          type="button"
          onClick={onSave}
          disabled={saved}
          className="rounded-xl border border-purple-200 px-4 py-3 font-semibold text-purple-700 hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-purple-900 dark:text-purple-300"
        >
          {saved
            ? "Project Saved"
            : "Save Project"}
        </button>

        <button
          type="button"
          onClick={onRegenerate}
          disabled={isGenerating}
          className="flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-3 font-semibold text-white hover:bg-purple-700 disabled:opacity-60"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Zap size={17} />
          )}

          Generate Again
        </button>
      </div>
    </article>
  );
}

function ProjectModal({
  project,
  status,
  actionLabel,
  onClose,
  onAction,
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        aria-label="Close modal"
      />

      <div className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-white shadow-2xl dark:bg-slate-900">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 p-5 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-indigo-600">
              {project.category}
            </p>

            <h2 className="text-xl font-bold">
              {project.title}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <div className="flex flex-wrap gap-2">
            <Badge
              className={
                difficultyStyles[
                  project.difficulty
                ]
              }
            >
              {project.difficulty}
            </Badge>

            <Badge
              className={
                statusStyles[status]
              }
            >
              {status}
            </Badge>

            <Badge className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              {project.duration}
            </Badge>
          </div>

          <p className="mt-5 leading-7 text-slate-500">
            {project.description}
          </p>

          {project.outcome && (
            <DetailSection
              title="Expected Outcome"
              items={[project.outcome]}
            />
          )}

          {project.features?.length >
            0 && (
            <DetailSection
              title="Core Features"
              items={project.features}
            />
          )}

          {project.skills?.length > 0 && (
            <div className="mt-6">
              <h3 className="font-bold">
                Recommended Skills
              </h3>

              <div className="mt-3 flex flex-wrap gap-2">
                {project.skills.map(
                  (skill) => (
                    <span
                      key={skill}
                      className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-semibold text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300"
                    >
                      {skill}
                    </span>
                  )
                )}
              </div>
            </div>
          )}

          {project.steps?.length > 0 && (
            <DetailSection
              title="Project Steps"
              items={project.steps}
              numbered
            />
          )}

          {project.learningOutcomes
            ?.length > 0 && (
            <DetailSection
              title="Learning Outcomes"
              items={
                project.learningOutcomes
              }
            />
          )}

          {project.bonusChallenges
            ?.length > 0 && (
            <DetailSection
              title="Bonus Challenges"
              items={
                project.bonusChallenges
              }
            />
          )}

          {project.resumeImpact && (
            <DetailSection
              title="Resume Impact"
              items={[
                project.resumeImpact,
              ]}
            />
          )}

          {project.githubStructure && (
            <div className="mt-6">
              <h3 className="font-bold">
                Suggested GitHub Structure
              </h3>

              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-2xl bg-slate-950 p-4 text-sm text-slate-200">
                {project.githubStructure}
              </pre>
            </div>
          )}

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-5 py-3 font-semibold hover:bg-slate-100 dark:border-slate-700 dark:hover:bg-slate-800"
            >
              Close
            </button>

            <button
              type="button"
              onClick={onAction}
              className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700"
            >
              {actionLabel}
              <ArrowRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailSection({
  title,
  items,
  numbered = false,
}) {
  return (
    <div className="mt-6">
      <h3 className="font-bold">
        {title}
      </h3>

      <div className="mt-3 space-y-3">
        {items.map((item, index) => (
          <div
            key={`${title}-${index}`}
            className="flex items-start gap-3"
          >
            <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
              {numbered
                ? index + 1
                : "✓"}
            </div>

            <p className="pt-0.5 text-sm leading-6 text-slate-500">
              {item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FormInput({
  label,
  value,
  placeholder,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <input
        value={value}
        placeholder={placeholder}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 dark:border-slate-700 dark:bg-slate-950"
      />
    </label>
  );
}

function StatCard({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
      <p className="text-xs text-indigo-100">
        {label}
      </p>

      <p className="mt-1 text-xl font-bold">
        {value}
      </p>
    </div>
  );
}

function Badge({
  children,
  className = "",
}) {
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {children}
    </span>
  );
}

export default AIProjects;