import {
  Bot,
  BriefcaseBusiness,
  FileSearch,
  Flame,
  LayoutDashboard,
  Search,
  Settings,
  Target,
  User,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

const SEARCH_ITEMS = [
  {
    title: "Dashboard",
    description: "View your progress, XP, achievements, and roadmap.",
    path: "/dashboard",
    keywords: ["home", "overview", "progress", "xp"],
    icon: LayoutDashboard,
  },
  {
    title: "Daily Mission",
    description: "Complete today's learning mission.",
    path: "/daily-mission",
    keywords: ["task", "goal", "daily", "challenge"],
    icon: Target,
  },
  {
    title: "AI Projects",
    description: "Explore practical AI-powered projects.",
    path: "/ai-projects",
    keywords: ["project", "portfolio", "build", "ai"],
    icon: Bot,
  },
  {
    title: "Resume Analyzer",
    description: "Analyze and improve your resume.",
    path: "/resume-analyzer",
    keywords: ["resume", "cv", "ats", "job"],
    icon: FileSearch,
  },
  {
    title: "Profile",
    description: "View and update your personal profile.",
    path: "/profile",
    keywords: ["account", "personal", "skills", "bio"],
    icon: User,
  },
  {
    title: "Settings",
    description: "Manage appearance, preferences, and data.",
    path: "/settings",
    keywords: ["theme", "dark", "backup", "preferences"],
    icon: Settings,
  },
  {
    title: "Achievements",
    description: "Review your unlocked career achievements.",
    path: "/dashboard",
    keywords: ["badge", "reward", "milestone", "xp"],
    icon: BriefcaseBusiness,
  },
  {
    title: "Daily Streak",
    description: "Check your current and longest streak.",
    path: "/dashboard",
    keywords: ["streak", "days", "consistency", "reward"],
    icon: Flame,
  },
];

function GlobalSearch() {
  const navigate = useNavigate();
  const inputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return SEARCH_ITEMS;
    }

    return SEARCH_ITEMS.filter((item) => {
      const searchableText = [
        item.title,
        item.description,
        ...item.keywords,
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [query]);

  useEffect(() => {
    const handleKeyboardShortcut = (event) => {
      const isShortcut =
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k";

      if (isShortcut) {
        event.preventDefault();
        setIsOpen((previousValue) => !previousValue);
      }

      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyboardShortcut);

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyboardShortcut
      );
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setQuery("");
    setActiveIndex(0);

    window.setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const openItem = (item) => {
    navigate(item.path);
    setIsOpen(false);
  };

  const handleInputKeyDown = (event) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();

      setActiveIndex((previousIndex) =>
        Math.min(
          previousIndex + 1,
          filteredItems.length - 1
        )
      );
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();

      setActiveIndex((previousIndex) =>
        Math.max(previousIndex - 1, 0)
      );
    }

    if (
      event.key === "Enter" &&
      filteredItems[activeIndex]
    ) {
      event.preventDefault();
      openItem(filteredItems[activeIndex]);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="hidden min-w-64 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-500 transition hover:border-indigo-300 hover:bg-white md:flex dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400 dark:hover:border-indigo-600 dark:hover:bg-slate-800/80"
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4" />
          Search PathPilot
        </span>

        <kbd className="rounded-md border border-slate-200 bg-white px-2 py-0.5 text-xs font-semibold text-slate-400 dark:border-slate-600 dark:bg-slate-900">
          Ctrl K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 md:hidden dark:text-slate-400 dark:hover:bg-slate-800"
        aria-label="Open search"
      >
        <Search className="h-5 w-5" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[200] flex items-start justify-center bg-slate-950/70 p-4 pt-20 backdrop-blur-sm sm:pt-28"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setIsOpen(false);
            }
          }}
        >
          <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3 border-b border-slate-200 px-5 dark:border-slate-800">
              <Search className="h-5 w-5 text-slate-400" />

              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(event) =>
                  setQuery(event.target.value)
                }
                onKeyDown={handleInputKeyDown}
                placeholder="Search pages and features..."
                className="min-w-0 flex-1 bg-transparent py-5 text-base outline-none placeholder:text-slate-400"
              />

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-label="Close search"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[420px] overflow-y-auto p-3">
              {filteredItems.length > 0 ? (
                filteredItems.map((item, index) => {
                  const Icon = item.icon;
                  const isActive = index === activeIndex;

                  return (
                    <button
                      key={`${item.title}-${index}`}
                      type="button"
                      onMouseEnter={() =>
                        setActiveIndex(index)
                      }
                      onClick={() => openItem(item)}
                      className={`flex w-full items-center gap-4 rounded-2xl p-4 text-left transition ${
                        isActive
                          ? "bg-indigo-50 dark:bg-indigo-900/20"
                          : "hover:bg-slate-50 dark:hover:bg-slate-800/70"
                      }`}
                    >
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
                          isActive
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                      </div>

                      <div className="min-w-0">
                        <p className="font-semibold">
                          {item.title}
                        </p>

                        <p className="mt-1 truncate text-sm text-slate-500 dark:text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="px-5 py-14 text-center">
                  <Search className="mx-auto h-10 w-10 text-slate-300 dark:text-slate-700" />

                  <h3 className="mt-4 font-semibold">
                    No results found
                  </h3>

                  <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                    Try searching for dashboard, projects,
                    resume, profile, or settings.
                  </p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-4 border-t border-slate-200 px-5 py-3 text-xs text-slate-400 dark:border-slate-800">
              <span>↑ ↓ Navigate</span>
              <span>Enter Open</span>
              <span>Esc Close</span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default GlobalSearch;