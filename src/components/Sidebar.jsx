import { useEffect, useMemo, useState } from "react";
import {
  Briefcase,
  Brain,
  ChevronLeft,
  ChevronRight,
  FileText,
  Home,
  LogOut,
  Menu,
  Moon,
  Mic2,
  Map,
  Sparkles,
  Sun,
  Settings as SettingsIcon,
  Target,
  User,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

import { useTheme } from "../context/ThemeContext";

const DEFAULT_USER = {
  name: "PathPilot User",
  careerGoal: "Build Your Career",
};

const navigationItems = [
  {
    name: "Dashboard",
    path: "/dashboard",
    icon: Home,
  },
  {
  name: "Career Roadmap",
  path: "/career-roadmap",
  icon: Map,
  },
  {
    name: "Daily Mission",
    path: "/daily-mission",
    icon: Target,
  },
  {
    name: "Resume Analyzer",
    path: "/resume-analyzer",
    icon: FileText,
  },
  {
  name: "Career Assessment",
  path: "/career-assessment",
  icon: Brain,
  },
  {
    name: "AI Projects",
    path: "/ai-projects",
    icon: Briefcase,
  },
  {
    name: "Interview Simulator",
    path: "/interview-simulator",
    icon: Mic2,
  },
  {
  name: "Profile",
  path: "/profile",
  icon: User,
  },
  {
  name: "Settings",
  path: "/settings",
  icon: SettingsIcon,
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

function Sidebar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const isDark = theme === "dark";

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [user, setUser] = useState(DEFAULT_USER);
  const [roadmapProgress, setRoadmapProgress] = useState(0);

  useEffect(() => {
    const savedCollapsedState =
      localStorage.getItem("pathpilot_sidebar_collapsed") === "true";

    setIsCollapsed(savedCollapsedState);

    const storedUser = safelyParseJSON(
      localStorage.getItem("pathpilot_user"),
      DEFAULT_USER
    );

    const storedRoadmap = safelyParseJSON(
      localStorage.getItem("pathpilot_roadmap"),
      null
    );

    setUser({
      ...DEFAULT_USER,
      ...storedUser,
    });

    if (
      storedRoadmap &&
      Array.isArray(storedRoadmap.phases) &&
      storedRoadmap.phases.length > 0
    ) {
      const totalProgress = storedRoadmap.phases.reduce(
        (total, phase) => {
          const progress =
            typeof phase.progress === "number"
              ? Math.min(100, Math.max(0, phase.progress))
              : phase.completed
                ? 100
                : 0;

          return total + progress;
        },
        0
      );

      setRoadmapProgress(
        Math.round(totalProgress / storedRoadmap.phases.length)
      );
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMobileOpen ? "hidden" : "";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  const toggleCollapse = () => {
    setIsCollapsed((previousValue) => {
      const updatedValue = !previousValue;

     localStorage.setItem(
        "pathpilot_sidebar_collapsed",
         String(updatedValue)
      );

      window.dispatchEvent(
        new Event("pathpilot-sidebar-change")
      );

      return updatedValue;
    });
  };

  const initials = useMemo(() => {
    const name = user.name?.trim() || "PathPilot User";

    return name
      .split(" ")
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }, [user.name]);

  const handleLogout = () => {
    const confirmed = window.confirm(
      "Do you want to leave your PathPilot dashboard?"
    );

    if (!confirmed) {
      return;
    }

    setIsMobileOpen(false);
    navigate("/");
  };

  const closeMobileSidebar = () => {
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile top bar */}

      <header className="fixed left-0 right-0 top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white px-4 shadow-sm dark:border-slate-800 dark:bg-slate-950 lg:hidden">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
          aria-label="Go to PathPilot homepage"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Sparkles size={19} />
          </span>

          <span className="font-bold text-slate-900 dark:text-white">
            PathPilot AI
          </span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-yellow-400 dark:hover:bg-slate-800"
            aria-label={
              isDark
                ? "Switch to light mode"
                : "Switch to dark mode"
            }
          >
            {isDark ? <Sun size={19} /> : <Moon size={19} />}
          </button>

          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
            aria-label="Open navigation menu"
          >
            <Menu size={21} />
          </button>
        </div>
      </header>

      {/* Mobile overlay */}

      {isMobileOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={closeMobileSidebar}
          aria-label="Close navigation menu"
        />
      )}

      {/* Sidebar */}

      <aside
        className={`fixed bottom-0 left-0 top-0 z-50 flex flex-col border-r border-slate-200 bg-white transition-all duration-300 dark:border-slate-800 dark:bg-slate-950 ${
          isCollapsed ? "w-20" : "w-72"
        } ${
          isMobileOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Logo */}

        <div className="flex h-20 items-center justify-between border-b border-slate-200 px-4 dark:border-slate-800">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex min-w-0 items-center gap-3"
            aria-label="Go to PathPilot homepage"
          >
            <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-sm">
              <Sparkles size={20} />
            </span>

            {!isCollapsed && (
              <div className="min-w-0 text-left">
                <p className="truncate font-bold text-slate-900 dark:text-white">
                  PathPilot
                </p>

                <p className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
                  AI Career Guide
                </p>
              </div>
            )}
          </button>

          <button
            type="button"
            onClick={closeMobileSidebar}
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        {/* User information */}

        <div
          className={`border-b border-slate-200 dark:border-slate-800 ${
            isCollapsed ? "px-3 py-5" : "p-4"
          }`}
        >
          <div
            className={`flex items-center ${
              isCollapsed ? "justify-center" : "gap-3"
            }`}
          >
            <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-indigo-100 font-bold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              {initials}
            </div>

            {!isCollapsed && (
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                  {user.name}
                </p>

                <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                  {user.careerGoal}
                </p>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <div className="mt-4">
              <div className="mb-2 flex items-center justify-between text-xs">
                <span className="font-medium text-slate-500 dark:text-slate-400">
                  Career progress
                </span>

                <span className="font-semibold text-indigo-600 dark:text-indigo-400">
                  {roadmapProgress}%
                </span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                  style={{
                    width: `${roadmapProgress}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}

        <nav
          className="flex-1 space-y-2 overflow-y-auto p-3"
          aria-label="Dashboard navigation"
        >
          {navigationItems.map((item) => {
            const Icon = item.icon;

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={closeMobileSidebar}
                title={isCollapsed ? item.name : undefined}
                className={({ isActive }) =>
                  `flex min-h-12 items-center rounded-xl text-sm font-medium transition ${
                    isCollapsed
                      ? "justify-center px-3"
                      : "gap-3 px-4"
                  } ${
                    isActive
                      ? "bg-indigo-600 text-white shadow-md shadow-indigo-500/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                  }`
                }
              >
                <Icon size={20} className="flex-shrink-0" />

                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom actions */}

        <div className="space-y-2 border-t border-slate-200 p-3 dark:border-slate-800">
          <button
            type="button"
            onClick={toggleTheme}
            title={
              isCollapsed
                ? isDark
                  ? "Light mode"
                  : "Dark mode"
                : undefined
            }
            className={`flex min-h-12 w-full items-center rounded-xl text-sm font-medium text-slate-600 transition hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 ${
              isCollapsed
                ? "justify-center px-3"
                : "gap-3 px-4"
            }`}
          >
            {isDark ? (
              <Sun size={20} className="text-yellow-400" />
            ) : (
              <Moon size={20} />
            )}

            {!isCollapsed && (
              <span>
                {isDark ? "Light Mode" : "Dark Mode"}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={handleLogout}
            title={isCollapsed ? "Return home" : undefined}
            className={`flex min-h-12 w-full items-center rounded-xl text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 ${
              isCollapsed
                ? "justify-center px-3"
                : "gap-3 px-4"
            }`}
          >
            <LogOut size={20} />

            {!isCollapsed && <span>Return Home</span>}
          </button>

          <button
            type="button"
            onClick={toggleCollapse}
            className={`hidden min-h-11 w-full items-center rounded-xl text-sm font-medium text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:flex ${
              isCollapsed
                ? "justify-center px-3"
                : "justify-between px-4"
            }`}
            aria-label={
              isCollapsed
                ? "Expand sidebar"
                : "Collapse sidebar"
            }
          >
            {!isCollapsed && <span>Collapse sidebar</span>}

            {isCollapsed ? (
              <ChevronRight size={19} />
            ) : (
              <ChevronLeft size={19} />
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;