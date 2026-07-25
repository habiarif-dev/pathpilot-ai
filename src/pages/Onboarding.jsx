import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Code2,
  Loader2,
  Sparkles,
  Target,
  User,
} from "lucide-react";

const TOTAL_STEPS = 4;

const INITIAL_FORM_DATA = {
  name: "",
  careerGoal: "",
  experience: "",
  skills: [],
  interests: [],
  dailyTime: "",
};

const CAREER_GOALS = [
  "Get a Job",
  "Become a Freelancer",
  "Improve My Skills",
  "Start a Business",
  "Explore Career Options",
];

const EXPERIENCE_LEVELS = [
  "Beginner",
  "Intermediate",
  "Advanced",
];

const SKILLS = [
  "HTML & CSS",
  "JavaScript",
  "React",
  "Python",
  "AI & Machine Learning",
  "UI/UX Design",
  "Digital Marketing",
  "Data Analysis",
  "Backend Development",
  "Mobile Development",
];

const INTERESTS = [
  "Web Development",
  "Artificial Intelligence",
  "Software Engineering",
  "Design",
  "Business",
  "Freelancing",
  "Data Science",
  "Cybersecurity",
];

const DAILY_TIME_OPTIONS = [
  "30 minutes",
  "1 hour",
  "2 hours",
  "3+ hours",
];

function getSavedUserData() {
  const savedUser = localStorage.getItem("pathpilot_user");

  if (!savedUser) {
    return INITIAL_FORM_DATA;
  }

  try {
    const parsedUser = JSON.parse(savedUser);

    return {
      name:
        typeof parsedUser.name === "string"
          ? parsedUser.name
          : "",
      careerGoal:
        typeof parsedUser.careerGoal === "string"
          ? parsedUser.careerGoal
          : "",
      experience:
        typeof parsedUser.experience === "string"
          ? parsedUser.experience
          : "",
      skills: Array.isArray(parsedUser.skills)
        ? parsedUser.skills
        : [],
      interests: Array.isArray(parsedUser.interests)
        ? parsedUser.interests
        : [],
      dailyTime:
        typeof parsedUser.dailyTime === "string"
          ? parsedUser.dailyTime
          : "",
    };
  } catch (error) {
    console.error(
      "Unable to load saved PathPilot user data:",
      error
    );

    return INITIAL_FORM_DATA;
  }
}

function Onboarding() {
  const navigate = useNavigate();
  const generationTimerRef = useRef(null);

  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] =
    useState(false);

  const [formData, setFormData] = useState(
    getSavedUserData
  );

  useEffect(() => {
    return () => {
      if (generationTimerRef.current) {
        window.clearTimeout(
          generationTimerRef.current
        );
      }
    };
  }, []);

  const updateField = (field, value) => {
    setFormData((previousData) => ({
      ...previousData,
      [field]: value,
    }));
  };

  const toggleSelection = (field, value) => {
    setFormData((previousData) => {
      const currentValues = Array.isArray(
        previousData[field]
      )
        ? previousData[field]
        : [];

      const valueAlreadySelected =
        currentValues.includes(value);

      return {
        ...previousData,
        [field]: valueAlreadySelected
          ? currentValues.filter(
              (item) => item !== value
            )
          : [...currentValues, value],
      };
    });
  };

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.trim().length >= 2;

      case 2:
        return Boolean(
          formData.careerGoal &&
            formData.experience
        );

      case 3:
        return formData.skills.length > 0;

      case 4:
        return Boolean(
          formData.interests.length > 0 &&
            formData.dailyTime
        );

      default:
        return false;
    }
  };

  const generateRoadmap = () => {
    if (!isStepValid() || isGenerating) {
      return;
    }

    setIsGenerating(true);

    const cleanedUserData = {
      ...formData,
      name: formData.name.trim(),
    };

    localStorage.setItem(
      "pathpilot_user",
      JSON.stringify(cleanedUserData)
    );

    /*
     * Temporary locally generated roadmap.
     *
     * This keeps the dashboard functional before the
     * Gemini API is connected. Later, replace this object
     * with the actual response from your AI service.
     */
    const temporaryRoadmap = {
      generatedAt: new Date().toISOString(),
      careerGoal: cleanedUserData.careerGoal,
      experience: cleanedUserData.experience,
      dailyTime: cleanedUserData.dailyTime,
      progress: 0,
      phases: [
        {
          id: "phase-1",
          title: "Build Strong Foundations",
          duration: "Weeks 1–2",
          description:
            "Strengthen the most important foundational skills for your selected career direction.",
          skills: cleanedUserData.skills.slice(
            0,
            3
          ),
          completed: false,
        },
        {
          id: "phase-2",
          title: "Develop Practical Skills",
          duration: "Weeks 3–5",
          description:
            "Apply your knowledge through structured practice and small real-world tasks.",
          skills: [
            cleanedUserData.interests[0],
            "Problem Solving",
            "Project Planning",
          ].filter(Boolean),
          completed: false,
        },
        {
          id: "phase-3",
          title: "Build Portfolio Projects",
          duration: "Weeks 6–8",
          description:
            "Create practical projects that demonstrate your abilities and career readiness.",
          skills: [
            "Portfolio Development",
            "GitHub",
            "Documentation",
          ],
          completed: false,
        },
        {
          id: "phase-4",
          title: "Prepare for Career Growth",
          duration: "Weeks 9–10",
          description:
            "Improve your professional profile and prepare for jobs, clients, or business opportunities.",
          skills: [
            "Resume Improvement",
            "Communication",
            "Personal Branding",
          ],
          completed: false,
        },
      ],
    };

    localStorage.setItem(
      "pathpilot_roadmap",
      JSON.stringify(temporaryRoadmap)
    );

    generationTimerRef.current =
      window.setTimeout(() => {
        navigate("/dashboard", {
          replace: true,
        });
      }, 2200);
  };

  const handleNextStep = () => {
    if (!isStepValid()) {
      return;
    }

    if (step < TOTAL_STEPS) {
      setStep((currentStep) => currentStep + 1);
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    generateRoadmap();
  };

  const handlePreviousStep = () => {
    if (step === 1) {
      navigate("/");
      return;
    }

    setStep((currentStep) =>
      Math.max(1, currentStep - 1)
    );

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const progressPercentage = Math.round(
    (step / TOTAL_STEPS) * 100
  );

  if (isGenerating) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6 text-gray-900 transition-colors dark:bg-gray-950 dark:text-white">
        <div
          className="max-w-lg text-center"
          aria-live="polite"
        >
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/30">
            <Sparkles className="h-10 w-10 animate-pulse text-white" />
          </div>

          <h1 className="mb-4 text-3xl font-bold">
            Building Your Career Roadmap
          </h1>

          <p className="mb-8 text-gray-600 dark:text-gray-400">
            PathPilot AI is analyzing your goals,
            skills, interests, and learning preferences
            to prepare your personalized career roadmap.
          </p>

          <div className="flex items-center justify-center gap-3 text-indigo-600 dark:text-indigo-400">
            <Loader2 className="h-5 w-5 animate-spin" />

            <span className="font-medium">
              Preparing your roadmap...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 text-gray-900 transition-colors dark:bg-gray-950 dark:text-white sm:py-12">
      <div className="mx-auto max-w-3xl">
        {/* Header */}

        <header className="mb-10 text-center">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="mb-4 inline-flex items-center gap-2"
            aria-label="Go to PathPilot homepage"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600">
              <Sparkles className="h-5 w-5 text-white" />
            </span>

            <span className="text-xl font-bold">
              PathPilot AI
            </span>
          </button>

          <h1 className="text-3xl font-bold md:text-4xl">
            Let&apos;s Build Your Career Roadmap
          </h1>

          <p className="mt-3 text-gray-600 dark:text-gray-400">
            Tell us about yourself so PathPilot can
            personalize your learning and career
            journey.
          </p>
        </header>

        {/* Progress */}

        <section
          className="mb-10"
          aria-label={`Onboarding step ${step} of ${TOTAL_STEPS}`}
        >
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Step {step} of {TOTAL_STEPS}
            </span>

            <span className="text-sm font-medium text-indigo-600 dark:text-indigo-400">
              {progressPercentage}%
            </span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-800">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all duration-500"
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>
        </section>

        {/* Main Form Card */}

        <main className="rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-800 dark:bg-gray-900 md:p-10">
          {/* Step 1 */}

          {step === 1 && (
            <section>
              <div className="mb-6 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-3 dark:bg-indigo-900/30">
                  <User className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    First, let&apos;s get to know you
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    What should PathPilot call you?
                  </p>
                </div>
              </div>

              <label
                htmlFor="user-name"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Your name
              </label>

              <input
                id="user-name"
                type="text"
                value={formData.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                onKeyDown={(event) => {
                  if (
                    event.key === "Enter" &&
                    isStepValid()
                  ) {
                    handleNextStep();
                  }
                }}
                placeholder="Enter your name"
                autoComplete="name"
                autoFocus
                maxLength={60}
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              />

              {formData.name.length > 0 &&
                formData.name.trim().length < 2 && (
                  <p className="mt-2 text-sm text-red-500">
                    Please enter at least two
                    characters.
                  </p>
                )}
            </section>
          )}

          {/* Step 2 */}

          {step === 2 && (
            <section>
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-3 dark:bg-indigo-900/30">
                  <Target className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    What is your main career goal?
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose the option that best matches
                    your current goal.
                  </p>
                </div>
              </div>

              <div className="mb-8 space-y-3">
                {CAREER_GOALS.map((goal) => {
                  const selected =
                    formData.careerGoal === goal;

                  return (
                    <button
                      type="button"
                      key={goal}
                      onClick={() =>
                        updateField(
                          "careerGoal",
                          goal
                        )
                      }
                      aria-pressed={selected}
                      className={`w-full rounded-xl border px-5 py-4 text-left transition ${
                        selected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                          : "border-gray-200 text-gray-700 hover:border-indigo-400 dark:border-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <span className="flex items-center justify-between gap-4">
                        {goal}

                        {selected && (
                          <Check className="h-5 w-5 flex-shrink-0" />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>

              <h3 className="mb-3 font-semibold">
                Your experience level
              </h3>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                {EXPERIENCE_LEVELS.map((level) => {
                  const selected =
                    formData.experience === level;

                  return (
                    <button
                      type="button"
                      key={level}
                      onClick={() =>
                        updateField(
                          "experience",
                          level
                        )
                      }
                      aria-pressed={selected}
                      className={`rounded-xl border px-4 py-3 transition ${
                        selected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                          : "border-gray-200 text-gray-700 hover:border-indigo-400 dark:border-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {level}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Step 3 */}

          {step === 3 && (
            <section>
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-3 dark:bg-indigo-900/30">
                  <Code2 className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    What skills do you already have?
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select all skills that currently
                    apply to you.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SKILLS.map((skill) => {
                  const selected =
                    formData.skills.includes(skill);

                  return (
                    <button
                      type="button"
                      key={skill}
                      onClick={() =>
                        toggleSelection(
                          "skills",
                          skill
                        )
                      }
                      aria-pressed={selected}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        selected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                          : "border-gray-200 text-gray-700 hover:border-indigo-400 dark:border-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <span>{skill}</span>

                      {selected && (
                        <Check className="h-5 w-5 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Step 4 */}

          {step === 4 && (
            <section>
              <div className="mb-8 flex items-center gap-3">
                <div className="rounded-xl bg-indigo-100 p-3 dark:bg-indigo-900/30">
                  <Clock className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
                </div>

                <div>
                  <h2 className="text-xl font-bold">
                    Customize your learning journey
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Select your interests and available
                    learning time.
                  </p>
                </div>
              </div>

              <h3 className="mb-3 font-semibold">
                Your interests
              </h3>

              <div className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {INTERESTS.map((interest) => {
                  const selected =
                    formData.interests.includes(
                      interest
                    );

                  return (
                    <button
                      type="button"
                      key={interest}
                      onClick={() =>
                        toggleSelection(
                          "interests",
                          interest
                        )
                      }
                      aria-pressed={selected}
                      className={`flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition ${
                        selected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                          : "border-gray-200 text-gray-700 hover:border-indigo-400 dark:border-gray-700 dark:text-gray-300"
                      }`}
                    >
                      <span>{interest}</span>

                      {selected && (
                        <Check className="h-5 w-5 flex-shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <h3 className="mb-3 font-semibold">
                Daily learning time
              </h3>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {DAILY_TIME_OPTIONS.map((time) => {
                  const selected =
                    formData.dailyTime === time;

                  return (
                    <button
                      type="button"
                      key={time}
                      onClick={() =>
                        updateField(
                          "dailyTime",
                          time
                        )
                      }
                      aria-pressed={selected}
                      className={`rounded-xl border px-4 py-3 transition ${
                        selected
                          ? "border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                          : "border-gray-200 text-gray-700 hover:border-indigo-400 dark:border-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {time}
                    </button>
                  );
                })}
              </div>
            </section>
          )}

          {/* Navigation */}

          <div className="mt-10 flex items-center justify-between gap-4 border-t border-gray-200 pt-6 dark:border-gray-800">
            <button
              type="button"
              onClick={handlePreviousStep}
              className="flex items-center gap-2 rounded-xl px-3 py-3 font-medium text-gray-600 transition hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800 sm:px-5"
            >
              <ArrowLeft className="h-5 w-5" />

              {step === 1 ? "Home" : "Back"}
            </button>

            <button
              type="button"
              onClick={handleNextStep}
              disabled={
                !isStepValid() || isGenerating
              }
              className={`flex items-center justify-center gap-2 rounded-xl px-4 py-3 font-semibold transition sm:px-6 ${
                isStepValid() && !isGenerating
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-700"
                  : "cursor-not-allowed bg-gray-200 text-gray-400 dark:bg-gray-800"
              }`}
            >
              <span>
                {step === TOTAL_STEPS
                  ? "Generate My Roadmap"
                  : "Continue"}
              </span>

              {step === TOTAL_STEPS ? (
                <Sparkles className="h-5 w-5" />
              ) : (
                <ArrowRight className="h-5 w-5" />
              )}
            </button>
          </div>
        </main>

        <p className="mt-6 text-center text-sm text-gray-500">
          Your information is stored locally in this
          browser and is used to personalize your
          PathPilot experience.
        </p>
      </div>
    </div>
  );
}

export default Onboarding;