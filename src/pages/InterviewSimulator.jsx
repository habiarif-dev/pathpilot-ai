import {
  ArrowLeft,
  ArrowRight,
  Award,
  Brain,
  CheckCircle2,
  Clock3,
  Loader2,
  Mic2,
  RefreshCcw,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import {
  evaluateAnswer,
  generateInterview,
  generateInterviewReport,
} from "../services/interviewService";

const defaultSetup = {
  role: "Frontend Developer",
  experienceLevel: "Beginner",
  interviewType: "Technical",
  skills: "React, JavaScript, HTML, CSS",
  numberOfQuestions: 5,
};

function InterviewSimulator() {
  const [stage, setStage] = useState("setup");

  const [setup, setSetup] = useState(
    defaultSetup
  );

  const [interview, setInterview] =
    useState(null);

  const [currentQuestionIndex, setCurrentQuestionIndex] =
    useState(0);

  const [answer, setAnswer] =
    useState("");

  const [responses, setResponses] =
    useState([]);

  const [currentEvaluation, setCurrentEvaluation] =
    useState(null);

  const [finalReport, setFinalReport] =
    useState(null);

  const [isGenerating, setIsGenerating] =
    useState(false);

  const [isEvaluating, setIsEvaluating] =
    useState(false);

  const [isGeneratingReport, setIsGeneratingReport] =
    useState(false);

  const [error, setError] =
    useState("");

  const [secondsElapsed, setSecondsElapsed] =
    useState(0);

  useEffect(() => {
    if (stage !== "interview") {
      return undefined;
    }

    const timer = setInterval(() => {
      setSecondsElapsed(
        (previous) => previous + 1
      );
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [stage]);

  const currentQuestion =
    interview?.questions?.[
      currentQuestionIndex
    ];

  const progress = useMemo(() => {
    if (
      !interview?.questions?.length
    ) {
      return 0;
    }

    return Math.round(
      ((currentQuestionIndex + 1) /
        interview.questions.length) *
        100
    );
  }, [
    currentQuestionIndex,
    interview,
  ]);

  const formattedTime = useMemo(() => {
    const minutes = Math.floor(
      secondsElapsed / 60
    );

    const seconds =
      secondsElapsed % 60;

    return `${String(minutes).padStart(
      2,
      "0"
    )}:${String(seconds).padStart(
      2,
      "0"
    )}`;
  }, [secondsElapsed]);

  async function handleStartInterview() {
    if (!setup.role.trim()) {
      setError(
        "Please enter a job role."
      );
      return;
    }

    setIsGenerating(true);
    setError("");

    try {
      const result =
        await generateInterview({
          role: setup.role,
          experienceLevel:
            setup.experienceLevel,
          interviewType:
            setup.interviewType,
          skills: setup.skills,
          numberOfQuestions:
            Number(
              setup.numberOfQuestions
            ),
        });

      setInterview(result);
      setCurrentQuestionIndex(0);
      setResponses([]);
      setAnswer("");
      setCurrentEvaluation(null);
      setFinalReport(null);
      setSecondsElapsed(0);
      setStage("interview");
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to generate the interview."
      );
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSubmitAnswer() {
    if (!answer.trim()) {
      setError(
        "Please write an answer before submitting."
      );
      return;
    }

    if (!currentQuestion) {
      return;
    }

    setIsEvaluating(true);
    setError("");

    try {
      const evaluation =
        await evaluateAnswer({
          role: interview.role,
          experienceLevel:
            interview.experienceLevel,
          interviewType:
            interview.interviewType,
          question:
            currentQuestion.question,
          answer,
          expectedPoints:
            currentQuestion.expectedPoints,
        });

      setCurrentEvaluation(
        evaluation
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to evaluate your answer."
      );
    } finally {
      setIsEvaluating(false);
    }
  }

  async function handleNextQuestion() {
    if (!currentEvaluation) {
      return;
    }

    const responseEntry = {
      questionId:
        currentQuestion.id,

      question:
        currentQuestion.question,

      answer,

      evaluation:
        currentEvaluation,
    };

    const updatedResponses = [
      ...responses,
      responseEntry,
    ];

    setResponses(
      updatedResponses
    );

    const isLastQuestion =
      currentQuestionIndex ===
      interview.questions.length - 1;

    if (isLastQuestion) {
      await handleGenerateFinalReport(
        updatedResponses
      );
      return;
    }

    setCurrentQuestionIndex(
      (previous) => previous + 1
    );

    setAnswer("");
    setCurrentEvaluation(null);
    setError("");
  }

  async function handleGenerateFinalReport(
    completedResponses
  ) {
    setIsGeneratingReport(true);
    setError("");

    try {
      const report =
        await generateInterviewReport({
          role: interview.role,
          experienceLevel:
            interview.experienceLevel,
          interviewType:
            interview.interviewType,
          responses:
            completedResponses,
        });

      setFinalReport(report);
      setStage("report");

      saveInterviewHistory(
        report,
        completedResponses
      );
    } catch (requestError) {
      setError(
        requestError.message ||
          "Unable to generate the final report."
      );
    } finally {
      setIsGeneratingReport(false);
    }
  }

  function saveInterviewHistory(
    report,
    completedResponses
  ) {
    try {
      const savedHistory =
        JSON.parse(
          localStorage.getItem(
            "pathpilot_interview_history"
          ) || "[]"
        );

      const newRecord = {
        id: `interview-${Date.now()}`,
        role: interview.role,
        experienceLevel:
          interview.experienceLevel,
        interviewType:
          interview.interviewType,
        score:
          report.overallScore,
        performanceLevel:
          report.performanceLevel,
        xpEarned:
          report.xpEarned,
        date:
          new Date().toISOString(),
        responses:
          completedResponses,
      };

      localStorage.setItem(
        "pathpilot_interview_history",
        JSON.stringify([
          newRecord,
          ...savedHistory,
        ])
      );
    } catch (storageError) {
      console.error(
        "Unable to save interview history:",
        storageError
      );
    }
  }

  function handleRestart() {
    setStage("setup");
    setInterview(null);
    setCurrentQuestionIndex(0);
    setAnswer("");
    setResponses([]);
    setCurrentEvaluation(null);
    setFinalReport(null);
    setSecondsElapsed(0);
    setError("");
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-slate-950 dark:text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <HeroSection
          stage={stage}
          formattedTime={formattedTime}
          progress={progress}
        />

        {error && (
          <div className="mt-6 rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-medium text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        )}

        {stage === "setup" && (
          <SetupStage
            setup={setup}
            setSetup={setSetup}
            isGenerating={
              isGenerating
            }
            onStart={
              handleStartInterview
            }
          />
        )}

        {stage === "interview" &&
          interview &&
          currentQuestion && (
            <InterviewStage
              interview={interview}
              currentQuestion={
                currentQuestion
              }
              currentQuestionIndex={
                currentQuestionIndex
              }
              progress={progress}
              answer={answer}
              setAnswer={setAnswer}
              evaluation={
                currentEvaluation
              }
              isEvaluating={
                isEvaluating
              }
              isGeneratingReport={
                isGeneratingReport
              }
              onSubmit={
                handleSubmitAnswer
              }
              onNext={
                handleNextQuestion
              }
              onRestart={
                handleRestart
              }
            />
          )}

        {stage === "report" &&
          finalReport && (
            <ReportStage
              report={finalReport}
              interview={interview}
              responses={responses}
              onRestart={
                handleRestart
              }
            />
          )}
      </div>
    </main>
  );
}

function HeroSection({
  stage,
  formattedTime,
  progress,
}) {
  return (
    <section className="overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 p-6 text-white shadow-xl sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-indigo-100">
            <Mic2 size={18} />

            <span className="text-sm font-semibold">
              AI Interview Simulator
            </span>
          </div>

          <h1 className="mt-3 text-3xl font-bold sm:text-4xl">
            Practise interviews with AI
          </h1>

          <p className="mt-3 max-w-2xl leading-7 text-indigo-100">
            Answer realistic interview
            questions, receive instant
            feedback and improve your
            confidence.
          </p>
        </div>

        {stage === "interview" && (
          <div className="grid grid-cols-2 gap-3">
            <HeroStat
              icon={Clock3}
              label="Time"
              value={formattedTime}
            />

            <HeroStat
              icon={Target}
              label="Progress"
              value={`${progress}%`}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function SetupStage({
  setup,
  setSetup,
  isGenerating,
  onStart,
}) {
  return (
    <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
            <Brain className="text-indigo-600" />
          </div>

          <div>
            <h2 className="text-xl font-bold">
              Interview Setup
            </h2>

            <p className="text-sm text-slate-500">
              Choose the interview that
              matches your goal.
            </p>
          </div>
        </div>

        <div className="mt-7 space-y-5">
          <FormInput
            label="Job Role"
            value={setup.role}
            placeholder="Frontend Developer"
            onChange={(value) =>
              setSetup(
                (previous) => ({
                  ...previous,
                  role: value,
                })
              )
            }
          />

          <FormInput
            label="Your Skills"
            value={setup.skills}
            placeholder="React, JavaScript, HTML, CSS"
            onChange={(value) =>
              setSetup(
                (previous) => ({
                  ...previous,
                  skills: value,
                })
              )
            }
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Experience Level"
              value={
                setup.experienceLevel
              }
              options={[
                "Beginner",
                "Intermediate",
                "Advanced",
              ]}
              onChange={(value) =>
                setSetup(
                  (previous) => ({
                    ...previous,
                    experienceLevel:
                      value,
                  })
                )
              }
            />

            <SelectField
              label="Interview Type"
              value={
                setup.interviewType
              }
              options={[
                "Technical",
                "HR",
                "Behavioural",
                "Mixed",
              ]}
              onChange={(value) =>
                setSetup(
                  (previous) => ({
                    ...previous,
                    interviewType:
                      value,
                  })
                )
              }
            />
          </div>

          <SelectField
            label="Number of Questions"
            value={String(
              setup.numberOfQuestions
            )}
            options={[
              "3",
              "5",
              "7",
              "10",
            ]}
            onChange={(value) =>
              setSetup(
                (previous) => ({
                  ...previous,
                  numberOfQuestions:
                    Number(value),
                })
              )
            }
          />

          <button
            type="button"
            onClick={onStart}
            disabled={isGenerating}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating Interview...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Start AI Interview
              </>
            )}
          </button>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <p className="text-xs font-bold uppercase tracking-wider text-purple-600">
          How it works
        </p>

        <h2 className="mt-2 text-2xl font-bold">
          Your interview journey
        </h2>

        <div className="mt-6 space-y-5">
          <FeatureItem
            number="1"
            title="AI creates questions"
            description="Questions match your role, level and selected interview type."
          />

          <FeatureItem
            number="2"
            title="You answer each question"
            description="Write clear answers and include examples where possible."
          />

          <FeatureItem
            number="3"
            title="Receive instant feedback"
            description="AI scores each answer and shows strengths and improvements."
          />

          <FeatureItem
            number="4"
            title="Get a final report"
            description="Review your overall score, skills, preparation topics and XP."
          />
        </div>
      </div>
    </section>
  );
}

function InterviewStage({
  interview,
  currentQuestion,
  currentQuestionIndex,
  progress,
  answer,
  setAnswer,
  evaluation,
  isEvaluating,
  isGeneratingReport,
  onSubmit,
  onNext,
  onRestart,
}) {
  const isLastQuestion =
    currentQuestionIndex ===
    interview.questions.length - 1;

  return (
    <section className="mt-8">
      <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-indigo-600">
            {interview.title}
          </p>

          <h2 className="mt-1 text-2xl font-bold">
            Question{" "}
            {currentQuestionIndex + 1}{" "}
            of{" "}
            {interview.questions.length}
          </h2>
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800"
        >
          <ArrowLeft size={17} />
          Exit Interview
        </button>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className="h-full rounded-full bg-indigo-600 transition-all"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.75fr]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex flex-wrap gap-2">
            <Badge>
              {currentQuestion.category}
            </Badge>

            <Badge>
              {currentQuestion.difficulty}
            </Badge>
          </div>

          <h3 className="mt-5 text-2xl font-bold leading-9">
            {currentQuestion.question}
          </h3>

          <div className="mt-5 rounded-2xl bg-indigo-50 p-4 text-sm leading-6 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
            <strong>
              Preparation tip:
            </strong>{" "}
            {
              currentQuestion.preparationTip
            }
          </div>

          <label className="mt-6 block">
            <span className="mb-2 block text-sm font-semibold">
              Your Answer
            </span>

            <textarea
              rows={10}
              value={answer}
              disabled={
                Boolean(evaluation)
              }
              onChange={(event) =>
                setAnswer(
                  event.target.value
                )
              }
              placeholder="Write your answer here. Explain your thinking and include examples where possible."
              className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 leading-7 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 disabled:opacity-70 dark:border-slate-700 dark:bg-slate-950"
            />
          </label>

          {!evaluation ? (
            <button
              type="button"
              onClick={onSubmit}
              disabled={
                isEvaluating ||
                !answer.trim()
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isEvaluating ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Evaluating Answer...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Submit Answer
                </>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={onNext}
              disabled={
                isGeneratingReport
              }
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
            >
              {isGeneratingReport ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating Final Report...
                </>
              ) : (
                <>
                  {isLastQuestion
                    ? "Finish Interview"
                    : "Next Question"}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          )}
        </div>

        <div>
          {evaluation ? (
            <EvaluationCard
              evaluation={evaluation}
            />
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 dark:bg-purple-900/30">
                <Brain className="text-purple-600" />
              </div>

              <h3 className="mt-5 text-lg font-bold">
                Feedback will appear here
              </h3>

              <p className="mt-2 leading-6 text-slate-500">
                Submit your answer to
                receive an AI score,
                strengths, improvements
                and a sample answer.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function EvaluationCard({
  evaluation,
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-purple-600">
            AI Evaluation
          </p>

          <h3 className="mt-1 text-xl font-bold">
            {evaluation.rating}
          </h3>
        </div>

        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
          {evaluation.score}
        </div>
      </div>

      <p className="mt-5 leading-7 text-slate-500">
        {evaluation.feedback}
      </p>

      <FeedbackList
        title="Strengths"
        items={
          evaluation.strengths
        }
        positive
      />

      <FeedbackList
        title="Improvements"
        items={
          evaluation.improvements
        }
      />

      {evaluation.sampleAnswer && (
        <div className="mt-6">
          <h4 className="font-bold">
            Sample Answer
          </h4>

          <div className="mt-3 rounded-2xl bg-slate-100 p-4 text-sm leading-7 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
            {
              evaluation.sampleAnswer
            }
          </div>
        </div>
      )}
    </div>
  );
}

function ReportStage({
  report,
  interview,
  responses,
  onRestart,
}) {
  return (
    <section className="mt-8 space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 text-center dark:border-slate-800 dark:bg-slate-900 sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
          <Trophy className="h-8 w-8 text-amber-600" />
        </div>

        <p className="mt-5 text-sm font-semibold text-indigo-600">
          Interview Completed
        </p>

        <h2 className="mt-2 text-3xl font-bold">
          {report.performanceLevel}
        </h2>

        <div className="mx-auto mt-6 flex h-36 w-36 items-center justify-center rounded-full border-[12px] border-indigo-100 bg-indigo-50 text-4xl font-bold text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300">
          {report.overallScore}
        </div>

        <p className="mx-auto mt-6 max-w-2xl leading-7 text-slate-500">
          {report.summary}
        </p>

        <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-5 py-2.5 font-bold text-amber-700">
          <Award size={19} />
          +{report.xpEarned} XP
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ReportList
          title="Your Strengths"
          items={report.strengths}
        />

        <ReportList
          title="Areas to Improve"
          items={
            report.areasToImprove
          }
        />

        <ReportList
          title="Recommended Topics"
          items={
            report.recommendedTopics
          }
        />

        <ReportList
          title="Next Steps"
          items={report.nextSteps}
        />
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="text-xl font-bold">
          Interview Summary
        </h3>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <SummaryItem
            label="Role"
            value={interview.role}
          />

          <SummaryItem
            label="Interview Type"
            value={
              interview.interviewType
            }
          />

          <SummaryItem
            label="Questions"
            value={responses.length}
          />
        </div>

        <div className="mt-7 rounded-2xl bg-indigo-50 p-5 text-center font-medium text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
          {report.finalMessage}
        </div>

        <button
          type="button"
          onClick={onRestart}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3.5 font-semibold text-white hover:bg-indigo-700"
        >
          <RefreshCcw size={18} />
          Start Another Interview
        </button>
      </div>
    </section>
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
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold">
        {label}
      </span>

      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 dark:border-slate-700 dark:bg-slate-950"
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function HeroStat({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="rounded-2xl border border-white/15 bg-white/10 px-5 py-4 backdrop-blur">
      <div className="flex items-center gap-2 text-indigo-100">
        <Icon size={16} />
        <span className="text-xs">
          {label}
        </span>
      </div>

      <p className="mt-1 text-xl font-bold">
        {value}
      </p>
    </div>
  );
}

function FeatureItem({
  number,
  title,
  description,
}) {
  return (
    <div className="flex gap-4">
      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
        {number}
      </div>

      <div>
        <h3 className="font-bold">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-slate-500">
          {description}
        </p>
      </div>
    </div>
  );
}

function Badge({
  children,
}) {
  return (
    <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
      {children}
    </span>
  );
}

function FeedbackList({
  title,
  items = [],
  positive = false,
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="mt-6">
      <h4 className="font-bold">
        {title}
      </h4>

      <div className="mt-3 space-y-2">
        {items.map(
          (item, index) => (
            <div
              key={`${title}-${index}`}
              className="flex items-start gap-2 text-sm leading-6 text-slate-500"
            >
              <CheckCircle2
                className={`mt-1 h-4 w-4 flex-shrink-0 ${
                  positive
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              />

              {item}
            </div>
          )
        )}
      </div>
    </div>
  );
}

function ReportList({
  title,
  items = [],
}) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="text-lg font-bold">
        {title}
      </h3>

      <div className="mt-4 space-y-3">
        {items.map(
          (item, index) => (
            <div
              key={`${title}-${index}`}
              className="flex items-start gap-3"
            >
              <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-300">
                {index + 1}
              </div>

              <p className="pt-0.5 text-sm leading-6 text-slate-500">
                {item}
              </p>
            </div>
          )
        )}
      </div>
    </div>
  );
}

function SummaryItem({
  label,
  value,
}) {
  return (
    <div className="rounded-2xl bg-slate-100 p-4 dark:bg-slate-800">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </p>

      <p className="mt-2 font-bold">
        {value}
      </p>
    </div>
  );
}

export default InterviewSimulator;