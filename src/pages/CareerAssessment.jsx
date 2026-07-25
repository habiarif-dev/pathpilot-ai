import {
  ArrowLeft,
  ArrowRight,
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Code2,
  GraduationCap,
  Lightbulb,
  LoaderCircle,
  RefreshCcw,
  Sparkles,
  Target,
  Wrench,
} from "lucide-react";
import { useMemo, useState } from "react";

const QUESTIONS = [
  {
    id: "careerGoal",
    title: "What career path interests you most?",
    description:
      "Choose the direction you currently want to explore.",
    options: [
      "Frontend Developer",
      "Full Stack Developer",
      "AI Engineer",
      "UI/UX Designer",
      "Data Analyst",
      "Freelancer",
    ],
  },
  {
    id: "experience",
    title: "What is your current experience level?",
    description:
      "This helps PathPilot adjust the difficulty of your roadmap.",
    options: [
      "Complete Beginner",
      "Beginner",
      "Intermediate",
      "Advanced",
    ],
  },
  {
    id: "weeklyTime",
    title: "How much time can you study each week?",
    description:
      "Choose a realistic amount so your plan stays achievable.",
    options: [
      "Less than 5 hours",
      "5–10 hours",
      "10–15 hours",
      "15–20 hours",
      "More than 20 hours",
    ],
  },
  {
    id: "learningStyle",
    title: "How do you learn best?",
    description:
      "PathPilot will shape your activities around your preferred style.",
    options: [
      "Watching tutorials",
      "Reading documentation",
      "Building projects",
      "Following structured courses",
      "Learning with a mentor",
    ],
  },
  {
    id: "mainChallenge",
    title: "What is your biggest career challenge?",
    description:
      "Choose the main problem you want PathPilot to help solve.",
    options: [
      "I do not know what to learn",
      "I struggle to stay consistent",
      "I need better projects",
      "My resume is weak",
      "I want freelance clients",
      "I need interview preparation",
    ],
  },
  {
    id: "preferredFocus",
    title: "What would you like to focus on first?",
    description:
      "Your first roadmap phase will prioritize this area.",
    options: [
      "Technical skills",
      "Portfolio projects",
      "Resume and LinkedIn",
      "Freelancing",
      "Job applications",
      "Interview preparation",
    ],
  },
];

function getSavedAssessment() {
  try {
    const savedResult = localStorage.getItem(
      "pathpilot_career_assessment"
    );

    return savedResult ? JSON.parse(savedResult) : null;
  } catch (error) {
    console.error("Could not read saved assessment:", error);
    return null;
  }
}

function getSavedAnswers() {
  try {
    const savedResult = localStorage.getItem(
      "pathpilot_career_assessment"
    );

    if (!savedResult) {
      return {};
    }

    const parsedResult = JSON.parse(savedResult);
    return parsedResult.answers || {};
  } catch {
    return {};
  }
}

function CareerAssessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState(getSavedAnswers);
  const [result, setResult] = useState(getSavedAssessment);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState("");

  const currentQuestion = QUESTIONS[currentStep];
  const selectedAnswer = answers[currentQuestion?.id];

  const progress = useMemo(() => {
    return ((currentStep + 1) / QUESTIONS.length) * 100;
  }, [currentStep]);

  const handleSelect = (option) => {
    setError("");

    setAnswers((previousAnswers) => ({
      ...previousAnswers,
      [currentQuestion.id]: option,
    }));
  };

  const handleNext = () => {
    if (!selectedAnswer || isGenerating) {
      return;
    }

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep((previousStep) => previousStep + 1);
      return;
    }

    generateAssessment();
  };

  const handleBack = () => {
    if (currentStep > 0 && !isGenerating) {
      setCurrentStep((previousStep) => previousStep - 1);
    }
  };

  const generateAssessment = async () => {
    setIsGenerating(true);
    setError("");

    try {
      const response = await fetch("/api/career-assessment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          answers,
        }),
      });

      let data;

      try {
        data = await response.json();
      } catch {
        throw new Error(
          "The AI server returned an invalid response."
        );
      }

      if (!response.ok) {
        throw new Error(
          data.error ||
            "Unable to generate your career assessment."
        );
      }

      if (!data.result) {
        throw new Error(
          "No assessment result was returned by the AI."
        );
      }

      const assessmentResult = {
        ...data.result,
        answers,
        completedAt:
          data.result.completedAt || new Date().toISOString(),
      };

      localStorage.setItem(
        "pathpilot_career_assessment",
        JSON.stringify(assessmentResult)
      );

      let existingUser = {};

      try {
        existingUser = JSON.parse(
          localStorage.getItem("pathpilot_user") || "{}"
        );
      } catch {
        existingUser = {};
      }

      localStorage.setItem(
        "pathpilot_user",
        JSON.stringify({
          ...existingUser,
          careerGoal: answers.careerGoal,
          experience: answers.experience,
          weeklyTime: answers.weeklyTime,
          learningStyle: answers.learningStyle,
          mainChallenge: answers.mainChallenge,
          preferredFocus: answers.preferredFocus,
        })
      );

      setResult(assessmentResult);
    } catch (requestError) {
      console.error("Assessment request failed:", requestError);

      setError(
        requestError instanceof Error
          ? requestError.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const restartAssessment = () => {
    setAnswers({});
    setCurrentStep(0);
    setResult(null);
    setError("");
    localStorage.removeItem(
      "pathpilot_career_assessment"
    );
  };

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 p-4 transition-colors dark:bg-slate-950 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 px-6 py-10 text-white sm:px-10">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
              <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-purple-300/20 blur-3xl" />

              <div className="relative">
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="flex items-center gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 backdrop-blur">
                      <Brain className="h-7 w-7" />
                    </div>

                    <div>
                      <p className="text-sm font-semibold text-indigo-100">
                        PathPilot Career DNA
                      </p>

                      <h1 className="mt-1 text-3xl font-bold sm:text-4xl">
                        {result.profileTitle ||
                          "Your Career Profile"}
                      </h1>
                    </div>
                  </div>

                  {result.generatedBy && (
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-sm font-semibold backdrop-blur">
                      <Sparkles className="h-4 w-4" />
                      Generated by {result.generatedBy}
                    </div>
                  )}
                </div>

                <p className="mt-6 max-w-4xl text-base leading-7 text-indigo-50 sm:text-lg">
                  {result.summary}
                </p>
              </div>
            </div>

            <div className="grid gap-6 p-6 sm:p-8 lg:grid-cols-3">
              <ResultCard
                icon={Sparkles}
                title="Your Strengths"
                items={result.strengths}
                iconClassName="text-emerald-500"
              />

              <ResultCard
                icon={Target}
                title="Focus Areas"
                items={result.focusAreas}
                iconClassName="text-indigo-500"
              />

              <ResultCard
                icon={Code2}
                title="Recommended Actions"
                items={result.recommendedActions}
                numbered
                iconClassName="text-violet-500"
              />
            </div>

            {result.recommendedSkills?.length > 0 && (
              <section className="mx-6 mb-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/60 sm:mx-8">
                <div className="flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Recommended Skills
                  </h2>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {result.recommendedSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-sm font-semibold text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-900/30 dark:text-indigo-300"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {result.projectIdea && (
              <section className="mx-6 mb-6 overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 sm:mx-8">
                <div className="border-b border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-800/60">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-5 w-5 text-amber-500" />
                    <h2 className="font-bold text-slate-900 dark:text-white">
                      AI Project Recommendation
                    </h2>
                  </div>
                </div>

                <div className="p-5">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                    {result.projectIdea.title}
                  </h3>

                  {result.projectIdea.problem && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Problem it solves
                      </p>
                      <p className="mt-1 text-slate-700 dark:text-slate-300">
                        {result.projectIdea.problem}
                      </p>
                    </div>
                  )}

                  {result.projectIdea.description && (
                    <div className="mt-4">
                      <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                        Project description
                      </p>
                      <p className="mt-1 leading-7 text-slate-700 dark:text-slate-300">
                        {result.projectIdea.description}
                      </p>
                    </div>
                  )}

                  {result.projectIdea.techStack?.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {result.projectIdea.techStack.map(
                        (technology) => (
                          <span
                            key={technology}
                            className="rounded-lg bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                          >
                            {technology}
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              </section>
            )}

            {result.weeklyPlan?.length > 0 && (
              <section className="mx-6 mb-6 rounded-2xl border border-slate-200 p-5 dark:border-slate-800 sm:mx-8">
                <div className="flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  <h2 className="font-bold text-slate-900 dark:text-white">
                    Personalized Weekly Plan
                  </h2>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {result.weeklyPlan.map((plan, index) => (
                    <div
                      key={`${plan.day}-${index}`}
                      className="rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/70"
                    >
                      <p className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                        {plan.day || `Day ${index + 1}`}
                      </p>

                      <p className="mt-2 text-sm leading-6 text-slate-700 dark:text-slate-300">
                        {plan.task}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {result.nextAction && (
              <section className="mx-6 mb-6 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 p-6 text-white sm:mx-8">
                <div className="flex items-start gap-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                    <ArrowRight className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-indigo-100">
                      Your next action
                    </p>

                    <p className="mt-2 text-lg font-bold leading-7">
                      {result.nextAction}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-6 py-5 dark:border-slate-800 sm:px-8">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                  Your result has been saved to your PathPilot
                  profile.
                </p>

                {result.completedAt && (
                  <p className="mt-1 text-xs text-slate-400">
                    Completed{" "}
                    {new Date(
                      result.completedAt
                    ).toLocaleDateString()}
                  </p>
                )}
              </div>

              <button
                type="button"
                onClick={restartAssessment}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                <RefreshCcw className="h-4 w-4" />
                Retake Assessment
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 transition-colors dark:bg-slate-950 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-indigo-600 dark:text-indigo-400">
                <Brain className="h-4 w-4" />
                PathPilot Career DNA
              </div>

              <h1 className="mt-2 text-3xl font-bold text-slate-900 dark:text-white">
                Discover your career direction
              </h1>

              <p className="mt-2 max-w-2xl text-slate-600 dark:text-slate-400">
                Answer six questions and let PathPilot create a
                personalized AI career profile for you.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <span className="font-bold text-indigo-600 dark:text-indigo-400">
                {currentStep + 1}
              </span>

              <span className="text-slate-400">
                {" "}
                / {QUESTIONS.length}
              </span>
            </div>
          </div>

          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-600 to-violet-600 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            {currentStep === 0 && (
              <GraduationCap className="h-7 w-7" />
            )}

            {currentStep === 1 && (
              <Code2 className="h-7 w-7" />
            )}

            {currentStep === 2 && (
              <Clock3 className="h-7 w-7" />
            )}

            {currentStep === 3 && (
              <Brain className="h-7 w-7" />
            )}

            {currentStep === 4 && (
              <Target className="h-7 w-7" />
            )}

            {currentStep === 5 && (
              <BriefcaseBusiness className="h-7 w-7" />
            )}
          </div>

          <p className="mt-6 text-sm font-semibold uppercase tracking-wide text-indigo-600 dark:text-indigo-400">
            Question {currentStep + 1}
          </p>

          <h2 className="mt-2 text-2xl font-bold text-slate-900 dark:text-white">
            {currentQuestion.title}
          </h2>

          <p className="mt-2 text-slate-600 dark:text-slate-400">
            {currentQuestion.description}
          </p>

          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            {currentQuestion.options.map((option) => {
              const isSelected = selectedAnswer === option;

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(option)}
                  disabled={isGenerating}
                  className={`rounded-2xl border p-4 text-left font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-2 ring-indigo-100 dark:bg-indigo-900/20 dark:text-indigo-300 dark:ring-indigo-900/40"
                      : "border-slate-200 bg-white text-slate-700 hover:border-indigo-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <span>{option}</span>

                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 shrink-0 text-indigo-600 dark:text-indigo-400" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {error && (
            <div
              role="alert"
              className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300"
            >
              <p className="font-semibold">
                Assessment could not be generated
              </p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {isGenerating && (
            <div className="mt-6 rounded-2xl border border-indigo-100 bg-indigo-50 p-4 dark:border-indigo-900/40 dark:bg-indigo-900/20">
              <div className="flex items-center gap-3">
                <LoaderCircle className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />

                <div>
                  <p className="font-semibold text-indigo-700 dark:text-indigo-300">
                    Analyzing your Career DNA
                  </p>

                  <p className="mt-1 text-sm text-indigo-600/80 dark:text-indigo-300/70">
                    PathPilot AI is creating your personalized
                    profile and weekly plan.
                  </p>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex items-center justify-between border-t border-slate-200 pt-6 dark:border-slate-800">
            <button
              type="button"
              onClick={handleBack}
              disabled={currentStep === 0 || isGenerating}
              className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 font-semibold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </button>

            <button
              type="button"
              onClick={handleNext}
              disabled={!selectedAnswer || isGenerating}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  {currentStep === QUESTIONS.length - 1
                    ? "Generate AI Result"
                    : "Continue"}

                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-slate-400">
          Your answers are used only to personalize your PathPilot
          career recommendations.
        </p>
      </div>
    </div>
  );
}

function ResultCard({
  icon: Icon,
  title,
  items = [],
  numbered = false,
  iconClassName = "text-indigo-500",
}) {
  if (!Array.isArray(items) || items.length === 0) {
    return null;
  }

  return (
    <section className="rounded-2xl bg-slate-50 p-5 dark:bg-slate-800/70">
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${iconClassName}`} />

        <h2 className="font-bold text-slate-900 dark:text-white">
          {title}
        </h2>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="flex gap-3 text-sm text-slate-600 dark:text-slate-300"
          >
            {numbered ? (
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
                {index + 1}
              </span>
            ) : (
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
            )}

            <span>{item}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default CareerAssessment;