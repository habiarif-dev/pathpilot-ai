import {
  ArrowRight,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  FileText,
  Sparkles,
  Target,
} from "lucide-react";

import { Link } from "react-router-dom";

import Navbar from "../components/Navbar";
import { useTheme } from "../context/ThemeContext";

const FEATURES = [
  {
    icon: Brain,
    title: "AI Career Assessment",
    description:
      "Understand your current strengths, skill gaps, and career readiness with AI-powered analysis.",
  },
  {
    icon: Target,
    title: "Personalized Roadmap",
    description:
      "Get a structured learning path based on your goals, current skills, and available time.",
  },
  {
    icon: CheckCircle2,
    title: "Daily Missions",
    description:
      "Turn your long-term career goal into focused, achievable tasks you can complete every day.",
  },
  {
    icon: BriefcaseBusiness,
    title: "AI Project Generator",
    description:
      "Discover practical projects designed to help you build real-world skills and strengthen your portfolio.",
  },
  {
    icon: FileText,
    title: "Resume Analyzer",
    description:
      "Compare your resume with your target career and discover areas where you can improve.",
  },
];

const HOW_IT_WORKS = [
  {
    number: 1,
    title: "Tell us your goal",
    description:
      "Share your career goal, current skills, experience, available time, and target timeline.",
  },
  {
    number: 2,
    title: "Get your AI roadmap",
    description:
      "PathPilot analyzes your information and creates a personalized path toward your career goal.",
  },
  {
    number: 3,
    title: "Take action",
    description:
      "Follow daily missions, build projects, track progress, and improve your resume.",
  },
];

const TRUST_ITEMS = [
  "Personalized guidance",
  "AI-powered insights",
  "Built for your goals",
];

function Home() {
  const { theme } = useTheme();

  const isDark = theme === "dark";

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isDark
          ? "bg-slate-950 text-slate-100"
          : "bg-slate-50 text-slate-900"
      }`}
    >
      <Navbar />

      <main>
        {/* Hero Section */}

        <section className="relative overflow-hidden pb-20 pt-32">
          <div
            className={`absolute inset-0 -z-10 transition-colors duration-300 ${
              isDark
                ? "bg-gradient-to-b from-indigo-950 via-slate-950 to-slate-950"
                : "bg-gradient-to-b from-indigo-50 via-white to-slate-50"
            }`}
          />

          <div
            className={`absolute left-1/2 top-20 -z-10 h-72 w-72 -translate-x-1/2 rounded-full blur-3xl ${
              isDark
                ? "bg-indigo-900/30"
                : "bg-indigo-200/30"
            }`}
          />

          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-4xl text-center">
              <div
                className={`mb-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium shadow-sm transition-colors ${
                  isDark
                    ? "border-indigo-800 bg-slate-900 text-indigo-400"
                    : "border-indigo-100 bg-white text-indigo-600"
                }`}
              >
                <Sparkles size={16} />
                AI-powered career planning
              </div>

              <h1
                className={`text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                Turn your career goal into a

                <span className="block text-indigo-500">
                  personalized roadmap.
                </span>
              </h1>

              <p
                className={`mx-auto mt-6 max-w-2xl text-lg leading-8 ${
                  isDark
                    ? "text-slate-300"
                    : "text-slate-600"
                }`}
              >
                PathPilot AI helps students and early-career
                professionals understand what to learn, what to
                build, and what to do next on their journey toward
                the career they want.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/onboarding"
                  className="flex items-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700"
                >
                  Build My Roadmap
                  <ArrowRight size={18} />
                </Link>

                <a
                  href="#features"
                  className={`rounded-xl border px-7 py-3.5 font-semibold transition ${
                    isDark
                      ? "border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  Explore Features
                </a>
              </div>

              <div className="mt-10 flex flex-wrap items-center justify-center gap-6">
                {TRUST_ITEMS.map((item) => (
                  <div
                    key={item}
                    className={`flex items-center gap-2 text-sm ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-500"
                    }`}
                  >
                    <CheckCircle2
                      size={17}
                      className="text-green-500"
                    />

                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}

        <section
          id="features"
          className={`scroll-mt-16 border-y py-24 transition-colors duration-300 ${
            isDark
              ? "border-slate-800 bg-slate-900/50"
              : "border-slate-200 bg-white"
          }`}
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-2xl text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
                Everything you need
              </p>

              <h2
                className={`mt-3 text-3xl font-bold sm:text-4xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                From career confusion to clear action.
              </h2>

              <p
                className={`mt-4 ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                PathPilot combines AI-powered guidance with
                practical planning to help you move forward
                with confidence.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className={`rounded-2xl border p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg ${
                      isDark
                        ? "border-slate-700 bg-slate-900 hover:border-indigo-700"
                        : "border-slate-200 bg-white hover:border-indigo-200"
                    }`}
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        isDark
                          ? "bg-indigo-950 text-indigo-400"
                          : "bg-indigo-50 text-indigo-600"
                      }`}
                    >
                      <Icon size={24} />
                    </div>

                    <h3
                      className={`mt-6 text-xl font-semibold ${
                        isDark
                          ? "text-white"
                          : "text-slate-900"
                      }`}
                    >
                      {feature.title}
                    </h3>

                    <p
                      className={`mt-3 leading-7 ${
                        isDark
                          ? "text-slate-400"
                          : "text-slate-600"
                      }`}
                    >
                      {feature.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}

        <section
          id="how-it-works"
          className={`scroll-mt-16 py-24 transition-colors duration-300 ${
            isDark
              ? "bg-slate-950"
              : "bg-slate-50"
          }`}
        >
          <div className="mx-auto max-w-7xl px-6">
            <div className="text-center">
              <p className="text-sm font-semibold uppercase tracking-wider text-indigo-500">
                How it works
              </p>

              <h2
                className={`mt-3 text-3xl font-bold sm:text-4xl ${
                  isDark
                    ? "text-white"
                    : "text-slate-900"
                }`}
              >
                Your journey starts with three simple steps.
              </h2>

              <p
                className={`mx-auto mt-4 max-w-2xl ${
                  isDark
                    ? "text-slate-400"
                    : "text-slate-600"
                }`}
              >
                Start with where you are today and let
                PathPilot AI help you understand where to go
                next.
              </p>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-3">
              {HOW_IT_WORKS.map((item) => (
                <article
                  key={item.number}
                  className="text-center"
                >
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 font-bold text-white shadow-lg shadow-indigo-500/20">
                    {item.number}
                  </div>

                  <h3
                    className={`mt-5 text-xl font-semibold ${
                      isDark
                        ? "text-white"
                        : "text-slate-900"
                    }`}
                  >
                    {item.title}
                  </h3>

                  <p
                    className={`mt-3 ${
                      isDark
                        ? "text-slate-400"
                        : "text-slate-600"
                    }`}
                  >
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}

        <section
          className={`py-24 transition-colors duration-300 ${
            isDark
              ? "bg-slate-950"
              : "bg-slate-50"
          }`}
        >
          <div className="mx-auto max-w-5xl px-6">
            <div className="relative overflow-hidden rounded-3xl bg-indigo-600 px-8 py-16 text-center shadow-xl shadow-indigo-500/20 sm:px-16">
              <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

              <div className="relative">
                <Sparkles
                  size={30}
                  className="mx-auto mb-5 text-indigo-100"
                />

                <h2 className="text-3xl font-bold text-white sm:text-4xl">
                  Ready to build your path?
                </h2>

                <p className="mx-auto mt-4 max-w-2xl text-indigo-100">
                  Tell PathPilot where you want to go, and
                  let AI help you figure out what to do next.
                </p>

                <Link
                  to="/onboarding"
                  className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-indigo-600 transition hover:bg-indigo-50"
                >
                  Start Your Journey
                  <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}

      <footer
        className={`border-t py-8 transition-colors duration-300 ${
          isDark
            ? "border-slate-800 bg-slate-950"
            : "border-slate-200 bg-white"
        }`}
      >
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <Sparkles
              size={18}
              className="text-indigo-500"
            />

            <span
              className={`font-semibold ${
                isDark
                  ? "text-white"
                  : "text-slate-900"
              }`}
            >
              PathPilot AI
            </span>
          </div>

          <p className="text-sm text-slate-500">
            Built to help you find your next step.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;