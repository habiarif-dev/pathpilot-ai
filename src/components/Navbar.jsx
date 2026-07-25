import { Moon, Sparkles, Sun } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";

function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isDark = theme === "dark";

  const isHomePage = location.pathname === "/";

  return (
    <header
      className={`fixed left-0 right-0 top-0 z-50 border-b backdrop-blur-md transition-colors duration-300 ${
        isDark
          ? "border-slate-800 bg-slate-950/90"
          : "border-slate-200 bg-white/90"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* =========================
            LOGO
        ========================== */}

        <Link
          to="/"
          className="flex items-center gap-2"
        >
          {/* Logo Icon */}

          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
            <Sparkles size={20} />
          </div>

          {/* Logo Text */}

          <span
            className={`text-xl font-bold transition-colors ${
              isDark
                ? "text-white"
                : "text-slate-900"
            }`}
          >
            PathPilot
          </span>

          {/* AI Badge */}

          <span
            className={`hidden rounded-full px-2 py-1 text-xs font-semibold transition-colors sm:block ${
              isDark
                ? "bg-indigo-950 text-indigo-400"
                : "bg-indigo-50 text-indigo-600"
            }`}
          >
            AI
          </span>
        </Link>

        {/* =========================
            DESKTOP NAVIGATION
        ========================== */}

        <nav className="hidden items-center gap-8 md:flex">
          {isHomePage && (
            <>
              <a
                href="#features"
                className={`text-sm font-medium transition-colors ${
                  isDark
                    ? "text-slate-300 hover:text-indigo-400"
                    : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                Features
              </a>

              <a
                href="#how-it-works"
                className={`text-sm font-medium transition-colors ${
                  isDark
                    ? "text-slate-300 hover:text-indigo-400"
                    : "text-slate-600 hover:text-indigo-600"
                }`}
              >
                How It Works
              </a>
            </>
          )}
        </nav>

        {/* =========================
            RIGHT ACTIONS
        ========================== */}

        <div className="flex items-center gap-3">
          {/* Theme Toggle */}

          <button
            onClick={toggleTheme}
            className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-200 ${
              isDark
                ? "border-slate-700 bg-slate-900 text-yellow-400 hover:bg-slate-800"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
            }`}
            aria-label={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
            title={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {isDark ? (
              <Sun size={19} />
            ) : (
              <Moon size={19} />
            )}
          </button>

          {/* Get Started */}

          <Link
            to="/onboarding"
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
          >
            Get Started
          </Link>
        </div>
      </div>
    </header>
  );
}

export default Navbar;