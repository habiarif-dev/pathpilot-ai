import {
  AlertCircle,
  ArrowRight,
  Award,
  BarChart3,
  Briefcase,
  CheckCircle2,
  Clock,
  FileCheck2,
  FileImage,
  FileText,
  Lightbulb,
  Loader2,
  RefreshCw,
  SearchCheck,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Upload,
  WandSparkles,
  X,
  Zap,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const DEFAULT_USER = {
  name: "PathPilot User",
  careerGoal: "Build My Career",
  experience: "Beginner",
  skills: [],
  interests: [],
};

const MAX_FILE_SIZE = 20 * 1024 * 1024;

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".docx",
  ".jpg",
  ".jpeg",
  ".png",
];

const SCORE_LABEL_STYLES = {
  Excellent:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Good:
    "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
  "Needs Improvement":
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  "Needs Attention":
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

function safelyParseJSON(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error(
      "Failed to parse saved PathPilot data:",
      error
    );

    return fallback;
  }
}

function formatFileSize(size) {
  if (!Number.isFinite(size)) {
    return "Unknown size";
  }

  if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(1)} KB`;
  }

  return `${(size / 1024 / 1024).toFixed(2)} MB`;
}

function getFileExtension(fileName) {
  const normalizedName = fileName.toLowerCase();
  const extensionIndex = normalizedName.lastIndexOf(".");

  if (extensionIndex === -1) {
    return "";
  }

  return normalizedName.slice(extensionIndex);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result !== "string") {
        reject(
          new Error("The selected resume could not be read.")
        );
        return;
      }

      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(
        new Error("The selected resume could not be read.")
      );
    };

    reader.readAsDataURL(file);
  });
}

function ResumeAnalyzer() {
  const navigate = useNavigate();

  const [userData, setUserData] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState("");
  const [analysisNotice, setAnalysisNotice] =
    useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedUser = safelyParseJSON(
      localStorage.getItem("pathpilot_user"),
      null
    );

    const storedAnalysis = safelyParseJSON(
      localStorage.getItem("pathpilot_resume_analysis"),
      null
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

    if (
      storedAnalysis &&
      typeof storedAnalysis === "object"
    ) {
      setAnalysis(storedAnalysis);
    }

    setIsLoading(false);
  }, [navigate]);

  const user = userData || DEFAULT_USER;

  const getScoreLabel = (score) => {
    if (score >= 85) {
      return "Excellent";
    }

    if (score >= 75) {
      return "Good";
    }

    if (score >= 60) {
      return "Needs Improvement";
    }

    return "Needs Attention";
  };

  const validateFile = (file) => {
    if (!file) {
      return false;
    }

    const extension = getFileExtension(file.name);

    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      setSelectedFile(null);
      setError(
        "Only PDF, DOCX, PNG, JPG, or JPEG resume files are allowed."
      );

      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setError(
        "Your resume must be smaller than 20 MB."
      );

      return false;
    }

    if (file.size === 0) {
      setSelectedFile(null);
      setError(
        "The selected file is empty. Please choose another resume."
      );

      return false;
    }

    setSelectedFile(file);
    setError("");
    setAnalysisNotice("");

    return true;
  };

  const handleFileChange = (event) => {
    const file = event.target.files?.[0];

    if (file) {
      validateFile(file);
    }

    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();

    if (
      event.currentTarget.contains(
        event.relatedTarget
      )
    ) {
      return;
    }

    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0];

    if (file) {
      validateFile(file);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
    setAnalysisNotice("");
  };

  const generateAnalysis = () => {
    const skills = Array.isArray(user.skills)
      ? user.skills
      : [];

    const interests = Array.isArray(user.interests)
      ? user.interests
      : [];

    const recommendedSkills =
      skills.length > 0
        ? skills.slice(0, 6)
        : [
            "Communication",
            "Problem Solving",
            "Technical Skills",
            "Teamwork",
            "Adaptability",
            "Project Management",
          ];

    const missingKeywords =
      interests.length > 0
        ? interests.slice(0, 5)
        : [
            "Leadership",
            "Collaboration",
            "Problem Solving",
            "Project Management",
            "Innovation",
          ];

    const calculatedScore =
      70 +
      Math.min(skills.length * 3, 12) +
      Math.min(interests.length * 2, 6);

    const score = Math.min(
      94,
      Math.max(68, calculatedScore)
    );

    return {
      score,
      summary: `Your resume has a solid foundation for your goal of ${
        user.careerGoal || "professional growth"
      }. Improving measurable achievements, project descriptions, keyword alignment, and section clarity can make it more competitive and ATS-friendly.`,
      strengths: [
        "Clear career direction based on your selected goal",
        "Relevant technical and professional skills identified",
        "Good foundation for building a focused personal brand",
        "Strong potential for project-based experience",
      ],
      improvements: [
        "Add measurable achievements instead of only listing responsibilities",
        "Begin experience and project bullets with strong action verbs",
        "Include portfolio projects that demonstrate practical experience",
        "Match important keywords from each job description",
        "Keep formatting simple and consistent for ATS systems",
      ],
      missingKeywords,
      recommendedSkills,
      sections: {
        Contact: 92,
        Summary: 76,
        Experience: 70,
        Skills: 86,
        Projects: 68,
        Education: 82,
      },
      atsChecks: [
        {
          title: "Readable structure",
          passed: true,
          description:
            "The resume appears to use clear and recognizable sections.",
        },
        {
          title: "Relevant skill keywords",
          passed: skills.length > 0,
          description:
            skills.length > 0
              ? "Skills selected during onboarding are reflected in the analysis."
              : "Add more role-specific skills and technical keywords.",
        },
        {
          title: "Measurable achievements",
          passed: false,
          description:
            "Add numbers, percentages, users, time saved, or project results.",
        },
        {
          title: "Project evidence",
          passed: false,
          description:
            "Include two or three strong projects with tools, actions, and outcomes.",
        },
      ],
      analyzedFile: selectedFile
        ? {
            name: selectedFile.name,
            size: selectedFile.size,
            type:
              selectedFile.type ||
              getFileExtension(selectedFile.name),
          }
        : null,
      analyzedAt: new Date().toISOString(),
      analysisMode: "basic",
    };
  };

  const analyzeResume = async () => {
    if (!selectedFile) {
      setError(
        "Please upload your resume before starting the analysis."
      );

      return;
    }

    setError("");
    setAnalysisNotice("");
    setIsAnalyzing(true);

    try {
      const fileData = await fileToBase64(
        selectedFile
      );

      const response = await fetch(
        "https://pathpilot-ai-backend-x4w8.onrender.com/api/resume-analyzer",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileData,
            fileName: selectedFile.name,
            mimeType:
              selectedFile.type ||
              "application/octet-stream",
            user: {
              name: user.name,
              careerGoal: user.careerGoal,
              experience: user.experience,
              skills: Array.isArray(user.skills)
                ? user.skills
                : [],
              interests: Array.isArray(
                user.interests
              )
                ? user.interests
                : [],
            },
          }),
        }
      );

      const data = await response.json().catch(
        () => null
      );

      if (
        !response.ok ||
        !data?.success ||
        !data?.analysis
      ) {
        throw new Error(
          data?.message ||
            "AI analysis is temporarily unavailable."
        );
      }

      const result = {
        ...data.analysis,
        analysisMode: "ai",
      };

      setAnalysis(result);
      setAnalysisNotice(
        "Your resume was analyzed with Gemini AI."
      );

      localStorage.setItem(
        "pathpilot_resume_analysis",
        JSON.stringify(result)
      );
    } catch (apiError) {
      console.error(
        "AI resume analysis failed:",
        apiError
      );

      const fallbackResult = {
        ...generateAnalysis(),
        analysisMode: "basic",
        fallbackReason:
          apiError instanceof Error
            ? apiError.message
            : "AI analysis is temporarily unavailable.",
      };

      setAnalysis(fallbackResult);
      setAnalysisNotice(
        "Gemini AI was unavailable, so PathPilot completed a basic profile-based analysis instead."
      );

      localStorage.setItem(
        "pathpilot_resume_analysis",
        JSON.stringify(fallbackResult)
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAnalysis = () => {
    const hasData = selectedFile || analysis;

    if (!hasData) {
      return;
    }

    const confirmed = window.confirm(
      "Are you sure you want to remove this resume analysis?"
    );

    if (!confirmed) {
      return;
    }

    setSelectedFile(null);
    setAnalysis(null);
    setError("");
    setAnalysisNotice("");
    setIsAnalyzing(false);

    localStorage.removeItem(
      "pathpilot_resume_analysis"
    );
  };

  const sectionEntries = useMemo(
    () =>
      analysis?.sections
        ? Object.entries(analysis.sections)
        : [],
    [analysis]
  );

  const averageSectionScore = useMemo(() => {
    if (sectionEntries.length === 0) {
      return 0;
    }

    return Math.round(
      sectionEntries.reduce(
        (total, [, score]) => total + score,
        0
      ) / sectionEntries.length
    );
  }, [sectionEntries]);

  const scoreLabel = analysis
    ? getScoreLabel(analysis.score)
    : "Not Analyzed";

  const analyzedDate = analysis?.analyzedAt
    ? new Date(analysis.analyzedAt)
    : null;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600">
            <Sparkles className="h-7 w-7 animate-pulse text-white" />
          </div>

          <p className="font-medium text-slate-600 dark:text-slate-400">
            Preparing your resume analyzer...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero */}

        <section className="mb-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-xl shadow-indigo-500/15 md:p-8">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

            <div className="absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-white/5 blur-3xl" />

            <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <WandSparkles className="h-5 w-5" />

                  <span className="text-sm font-medium text-indigo-100">
                    AI Resume Analysis
                  </span>
                </div>

                <h1 className="text-2xl font-bold md:text-3xl">
                  Make Your Resume Stand Out
                </h1>

                <p className="mt-3 max-w-2xl leading-7 text-indigo-100">
                  Upload your resume to review
                  ATS compatibility, strengths,
                  missing keywords, section
                  quality, and alignment with{" "}
                  {user.careerGoal}.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs text-indigo-100">
                    ATS Score
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {analysis
                      ? `${analysis.score}%`
                      : "—"}
                  </p>
                </div>

                <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs text-indigo-100">
                    Sections
                  </p>

                  <p className="mt-1 text-xl font-bold">
                    {analysis
                      ? sectionEntries.length
                      : 6}
                  </p>
                </div>

                <div className="col-span-2 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-sm sm:col-span-1">
                  <p className="text-xs text-indigo-100">
                    Status
                  </p>

                  <p className="mt-1 truncate text-lg font-bold">
                    {analysis
                      ? scoreLabel
                      : "Ready"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Career target */}

        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:col-span-2 dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                <Target className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Career Target
                </p>

                <p className="mt-1 text-lg font-bold">
                  {user.careerGoal}
                </p>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Feedback is personalized for
                  this direction.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
              <Briefcase className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Experience
            </p>

            <p className="mt-1 text-xl font-bold">
              {user.experience}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/30">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              Upload Limit
            </p>

            <p className="mt-1 text-xl font-bold">
              20 MB
            </p>
          </div>
        </section>

        {/* Upload area */}

        {!analysis && !isAnalyzing && (
          <section className="mb-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900 sm:p-8">
              <div className="mx-auto max-w-3xl text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
                  <FileText className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
                </div>

                <h2 className="mt-4 text-2xl font-bold">
                  Upload Your Resume
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Supported formats: PDF, DOCX,
                  PNG, JPG, and JPEG. Maximum
                  file size: 20 MB.
                </p>
              </div>

              {!selectedFile ? (
                <label
                  htmlFor="resume-file-input"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`mx-auto mt-8 flex max-w-3xl cursor-pointer flex-col items-center justify-center rounded-3xl border-2 border-dashed px-6 py-12 text-center transition ${
                    isDragging
                      ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30"
                      : "border-slate-300 bg-slate-50 hover:border-indigo-400 hover:bg-indigo-50/50 dark:border-slate-700 dark:bg-slate-950/40 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/20"
                  }`}
                >
                  <div
                    className={`flex h-16 w-16 items-center justify-center rounded-2xl ${
                      isDragging
                        ? "bg-indigo-600 text-white"
                        : "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                    }`}
                  >
                    <Upload className="h-8 w-8" />
                  </div>

                  <h3 className="mt-5 text-lg font-bold">
                    {isDragging
                      ? "Drop your resume here"
                      : "Drag and drop your resume"}
                  </h3>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    or click to choose a file
                    from your device
                  </p>

                  <span className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20">
                    <Upload size={17} />
                    Choose Resume
                  </span>

                  <input
                    id="resume-file-input"
                    type="file"
                    accept=".pdf,.docx,.png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              ) : (
                <div className="mx-auto mt-8 max-w-3xl rounded-2xl border border-indigo-200 bg-indigo-50 p-5 dark:border-indigo-900 dark:bg-indigo-950/30">
                  <div className="flex items-center gap-4">
                    <div className="flex h-13 w-13 flex-shrink-0 items-center justify-center rounded-xl bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400">
                      {[".jpg", ".jpeg"].includes(
                        getFileExtension(
                          selectedFile.name
                        )
                      ) ? (
                        <FileImage className="h-6 w-6" />
                      ) : (
                        <FileText className="h-6 w-6" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-bold text-slate-900 dark:text-white">
                        {selectedFile.name}
                      </p>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span>
                          {formatFileSize(
                            selectedFile.size
                          )}
                        </span>

                        <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 size={14} />
                          Ready to analyze
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={removeFile}
                      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-100 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400"
                      aria-label="Remove selected resume"
                    >
                      <X size={19} />
                    </button>
                  </div>
                </div>
              )}

              {error && (
                <div className="mx-auto mt-5 flex max-w-3xl items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-400">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />

                  <p className="text-sm leading-6">
                    {error}
                  </p>
                </div>
              )}

              <div className="mx-auto mt-6 flex max-w-3xl flex-col gap-3 sm:flex-row sm:justify-center">
                <button
                  type="button"
                  onClick={analyzeResume}
                  disabled={!selectedFile}
                  className={`flex items-center justify-center gap-2 rounded-xl px-6 py-3 font-semibold transition ${
                    selectedFile
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-700"
                      : "cursor-not-allowed bg-slate-200 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
                  }`}
                >
                  <Sparkles className="h-5 w-5" />
                  Analyze Resume
                </button>

                {selectedFile && (
                  <label
                    htmlFor="replace-resume-input"
                    className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Replace File

                    <input
                      id="replace-resume-input"
                      type="file"
                      accept=".pdf,.docx,.png,.jpg,.jpeg"
                      onChange={handleFileChange}
                      className="sr-only"
                    />
                  </label>
                )}
              </div>
            </div>
          </section>
        )}

        {/* Analyzing */}

        {isAnalyzing && (
          <section className="mb-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-900 sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
                <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
              </div>

              <h2 className="mt-5 text-2xl font-bold">
                Analyzing Your Resume
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500 dark:text-slate-400">
                PathPilot is reviewing your
                structure, keywords, experience,
                skills, projects, and career
                alignment.
              </p>

              <div className="mx-auto mt-7 max-w-xl space-y-3 text-left">
                {[
                  "Reviewing resume structure",
                  "Checking ATS compatibility",
                  "Comparing career keywords",
                  "Preparing improvement suggestions",
                ].map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50"
                  >
                    {index < 2 ? (
                      <CheckCircle2 className="h-5 w-5 flex-shrink-0 text-emerald-500" />
                    ) : (
                      <Loader2 className="h-5 w-5 flex-shrink-0 animate-spin text-indigo-500" />
                    )}

                    <span className="text-sm font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Analysis results */}

        {analysis && !isAnalyzing && (
          <>
            <section className="mb-5">
              <div
                className={`flex items-start gap-3 rounded-2xl border p-4 ${
                  analysis.analysisMode === "ai"
                    ? "border-indigo-200 bg-indigo-50 text-indigo-800 dark:border-indigo-900 dark:bg-indigo-950/30 dark:text-indigo-300"
                    : "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300"
                }`}
              >
                {analysis.analysisMode === "ai" ? (
                  <Sparkles className="mt-0.5 h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0" />
                )}

                <div>
                  <p className="font-semibold">
                    {analysis.analysisMode === "ai"
                      ? "Gemini AI Analysis"
                      : "Basic Fallback Analysis"}
                  </p>

                  <p className="mt-1 text-sm leading-6">
                    {analysisNotice ||
                      (analysis.analysisMode === "ai"
                        ? "This result was generated by Gemini AI using the uploaded resume."
                        : "This result is a basic profile-based analysis. Upload and analyze again when the AI service is available for document-specific feedback.")}
                  </p>
                </div>
              </div>
            </section>

            <section className="mb-8 grid gap-4 lg:grid-cols-3">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                  <div className="relative flex h-32 w-32 flex-shrink-0 items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="absolute inset-0 rounded-full"
                      style={{
                        background: `conic-gradient(rgb(79 70 229) ${
                          analysis.score * 3.6
                        }deg, transparent 0deg)`,
                      }}
                    />

                    <div className="absolute inset-2 rounded-full bg-white dark:bg-slate-900" />

                    <div className="relative text-center">
                      <p className="text-3xl font-bold">
                        {analysis.score}
                      </p>

                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        out of 100
                      </p>
                    </div>
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-2xl font-bold">
                        Resume Score
                      </h2>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          SCORE_LABEL_STYLES[
                            scoreLabel
                          ]
                        }`}
                      >
                        {scoreLabel}
                      </span>
                    </div>

                    <p className="mt-3 leading-7 text-slate-600 dark:text-slate-400">
                      {analysis.summary}
                    </p>

                    {analysis.analyzedFile && (
                      <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1.5">
                          <FileCheck2 size={15} />
                          {
                            analysis.analyzedFile
                              .name
                          }
                        </span>

                        {analyzedDate && (
                          <span className="inline-flex items-center gap-1.5">
                            <Clock size={15} />
                            {analyzedDate.toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-100 dark:bg-purple-900/30">
                  <BarChart3 className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>

                <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
                  Average Section Score
                </p>

                <p className="mt-1 text-3xl font-bold">
                  {averageSectionScore}%
                </p>

                <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-purple-600"
                    style={{
                      width: `${averageSectionScore}%`,
                    }}
                  />
                </div>

                <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Across {sectionEntries.length}{" "}
                  resume sections
                </p>
              </div>
            </section>

            {/* Section scores */}

            <section className="mb-8">
              <div className="mb-5">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                  Section analysis
                </span>

                <h2 className="mt-1 text-2xl font-bold">
                  Resume Section Scores
                </h2>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Review which resume sections
                  need the most attention.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {sectionEntries.map(
                  ([section, score]) => (
                    <div
                      key={section}
                      className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900"
                    >
                      <div className="flex items-center justify-between">
                        <p className="font-semibold">
                          {section}
                        </p>

                        <span
                          className={`text-lg font-bold ${
                            score >= 80
                              ? "text-emerald-600 dark:text-emerald-400"
                              : score >= 70
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {score}%
                        </span>
                      </div>

                      <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                        <div
                          className={`h-full rounded-full ${
                            score >= 80
                              ? "bg-emerald-500"
                              : score >= 70
                                ? "bg-indigo-600"
                                : "bg-amber-500"
                          }`}
                          style={{
                            width: `${score}%`,
                          }}
                        />
                      </div>
                    </div>
                  )
                )}
              </div>
            </section>

            {/* Strengths and improvements */}

            <section className="mb-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 dark:border-emerald-900 dark:bg-emerald-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-900/40">
                    <Award className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>

                  <div>
                    <h2 className="font-bold text-emerald-900 dark:text-emerald-300">
                      Resume Strengths
                    </h2>

                    <p className="text-sm text-emerald-700 dark:text-emerald-400">
                      Areas already supporting
                      your profile
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {analysis.strengths.map(
                    (strength) => (
                      <div
                        key={strength}
                        className="flex items-start gap-3"
                      >
                        <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-600 dark:text-emerald-400" />

                        <p className="text-sm leading-6 text-emerald-800 dark:text-emerald-300">
                          {strength}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/20">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-900/40">
                    <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                  </div>

                  <div>
                    <h2 className="font-bold text-amber-900 dark:text-amber-300">
                      Recommended Improvements
                    </h2>

                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      Changes that can strengthen
                      your resume
                    </p>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {analysis.improvements.map(
                    (improvement) => (
                      <div
                        key={improvement}
                        className="flex items-start gap-3"
                      >
                        <Lightbulb className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />

                        <p className="text-sm leading-6 text-amber-800 dark:text-amber-300">
                          {improvement}
                        </p>
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>

            {/* ATS checks */}

            <section className="mb-8">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                    <SearchCheck className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <div>
                    <h2 className="font-bold">
                      ATS Readiness Checks
                    </h2>

                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Important checks for
                      applicant tracking systems
                    </p>
                  </div>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  {analysis.atsChecks.map(
                    (check) => (
                      <div
                        key={check.title}
                        className="flex items-start gap-3 rounded-2xl bg-slate-50 p-4 dark:bg-slate-800/50"
                      >
                        {check.passed ? (
                          <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                        ) : (
                          <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-500" />
                        )}

                        <div>
                          <h3 className="text-sm font-bold">
                            {check.title}
                          </h3>

                          <p className="mt-1 text-sm leading-6 text-slate-500 dark:text-slate-400">
                            {check.description}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </section>

            {/* Keywords */}

            <section className="mb-8 grid gap-6 lg:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100 dark:bg-rose-900/30">
                    <Zap className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                  </div>

                  <h2 className="font-bold">
                    Keywords to Consider
                  </h2>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Add these only when they
                  accurately represent your
                  experience.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {analysis.missingKeywords.map(
                    (keyword) => (
                      <span
                        key={keyword}
                        className="rounded-xl bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 dark:bg-rose-900/20 dark:text-rose-400"
                      >
                        {keyword}
                      </span>
                    )
                  )}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                    <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <h2 className="font-bold">
                    Recommended Skills
                  </h2>
                </div>

                <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
                  Highlight relevant skills with
                  evidence from projects,
                  education, or experience.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {analysis.recommendedSkills.map(
                    (skill) => (
                      <span
                        key={skill}
                        className="rounded-xl bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            </section>

            {/* Actions */}

            <section className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={resetAnalysis}
                className="flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:border-rose-900 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
              >
                <RefreshCw className="h-4 w-4" />
                Analyze Another Resume
              </button>

              <button
                type="button"
                onClick={() =>
                  navigate("/ai-projects")
                }
                className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700"
              >
                Build Portfolio Projects
                <ArrowRight className="h-5 w-5" />
              </button>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default ResumeAnalyzer;