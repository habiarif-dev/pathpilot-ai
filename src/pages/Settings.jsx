import {
  AlertTriangle,
  Bell,
  Check,
  Download,
  Info,
  Laptop,
  Moon,
  Palette,
  RefreshCcw,
  Save,
  ShieldCheck,
  Sun,
  Upload,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTheme } from "../context/ThemeContext";

const DEFAULT_SETTINGS = {
  dailyReminder: true,
  achievementPopups: true,
  autoSave: true,
};

const DEFAULT_USER = {
  name: "PathPilot User",
  email: "",
  careerGoal: "Build Your Career",
};

const SETTINGS_KEY = "pathpilot_settings";

function safelyParseJSON(value, fallback) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch (error) {
    console.error("Unable to parse saved data:", error);
    return fallback;
  }
}

function Settings() {
  const { theme, toggleTheme } = useTheme();

  const importInputRef = useRef(null);

  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [account, setAccount] = useState(DEFAULT_USER);
  const [savedMessage, setSavedMessage] = useState("");
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConfirmation, setResetConfirmation] = useState("");

  useEffect(() => {
    const storedSettings = safelyParseJSON(
      localStorage.getItem(SETTINGS_KEY),
      DEFAULT_SETTINGS
    );

    const storedUser = safelyParseJSON(
      localStorage.getItem("pathpilot_user"),
      DEFAULT_USER
    );

    setSettings({
      ...DEFAULT_SETTINGS,
      ...storedSettings,
    });

    setAccount({
      ...DEFAULT_USER,
      ...storedUser,
    });
  }, []);

  const showMessage = (message) => {
    setSavedMessage(message);

    window.setTimeout(() => {
      setSavedMessage("");
    }, 2500);
  };

  const handleAccountChange = (event) => {
    const { name, value } = event.target;

    setAccount((previousAccount) => ({
      ...previousAccount,
      [name]: value,
    }));
  };

  const togglePreference = (settingName) => {
    setSettings((previousSettings) => ({
      ...previousSettings,
      [settingName]: !previousSettings[settingName],
    }));
  };

  const saveSettings = () => {
    const existingUser = safelyParseJSON(
      localStorage.getItem("pathpilot_user"),
      {}
    );

    const updatedUser = {
      ...existingUser,
      name: account.name.trim() || "PathPilot User",
      email: account.email.trim(),
      careerGoal:
        account.careerGoal.trim() || "Build Your Career",
    };

    localStorage.setItem(
      "pathpilot_user",
      JSON.stringify(updatedUser)
    );

    localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify(settings)
    );

    setAccount((previousAccount) => ({
      ...previousAccount,
      ...updatedUser,
    }));

    showMessage("Settings saved successfully");
  };

  const exportProgress = () => {
    const pathPilotData = {};

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (key?.startsWith("pathpilot_")) {
        pathPilotData[key] = localStorage.getItem(key);
      }
    }

    const exportPackage = {
      app: "PathPilot AI",
      version: "1.0.0",
      exportedAt: new Date().toISOString(),
      data: pathPilotData,
    };

    const jsonContent = JSON.stringify(exportPackage, null, 2);
    const blob = new Blob([jsonContent], {
      type: "application/json",
    });

    const downloadUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = downloadUrl;
    link.download = `pathpilot-backup-${new Date()
      .toISOString()
      .split("T")[0]}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(downloadUrl);

    showMessage("Progress exported successfully");
  };

  const importProgress = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    if (file.type && file.type !== "application/json") {
      window.alert("Please select a valid JSON backup file.");
      event.target.value = "";
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      try {
        const importedPackage = JSON.parse(String(reader.result));

        if (
          !importedPackage.data ||
          typeof importedPackage.data !== "object"
        ) {
          throw new Error("Invalid PathPilot backup format.");
        }

        Object.entries(importedPackage.data).forEach(
          ([key, value]) => {
            if (
              key.startsWith("pathpilot_") &&
              typeof value === "string"
            ) {
              localStorage.setItem(key, value);
            }
          }
        );

        showMessage("Progress imported successfully");

        window.setTimeout(() => {
          window.location.reload();
        }, 900);
      } catch (error) {
        console.error("Import failed:", error);

        window.alert(
          "The selected file is not a valid PathPilot backup."
        );
      }
    };

    reader.onerror = () => {
      window.alert("Unable to read the selected backup file.");
    };

    reader.readAsText(file);
    event.target.value = "";
  };

  const resetAllData = () => {
    if (resetConfirmation.trim().toUpperCase() !== "RESET") {
      return;
    }

    const keysToRemove = [];

    for (let index = 0; index < localStorage.length; index += 1) {
      const key = localStorage.key(index);

      if (key?.startsWith("pathpilot_")) {
        keysToRemove.push(key);
      }
    }

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });

    setShowResetModal(false);
    setResetConfirmation("");

    window.location.href = "/onboarding";
  };

  const preferenceItems = [
    {
      key: "dailyReminder",
      title: "Daily reminder",
      description:
        "Display reminders that encourage you to complete daily missions.",
      icon: Bell,
    },
    {
      key: "achievementPopups",
      title: "Achievement popups",
      description:
        "Show a celebration popup whenever a new achievement is unlocked.",
      icon: ShieldCheck,
    },
    {
      key: "autoSave",
      title: "Auto-save progress",
      description:
        "Automatically save your roadmap, missions, projects, and profile.",
      icon: Save,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-white">
      {savedMessage && (
        <div className="fixed right-5 top-24 z-[120] flex items-center gap-3 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-xl">
          <Check className="h-5 w-5" />
          {savedMessage}
        </div>
      )}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white shadow-xl shadow-indigo-500/15 md:p-8">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <div className="mb-3 flex items-center gap-2 text-indigo-100">
              <Palette className="h-5 w-5" />
              <span className="text-sm font-semibold">
                Personalize PathPilot
              </span>
            </div>

            <h1 className="text-3xl font-bold md:text-4xl">
              Settings
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-indigo-100 md:text-base">
              Manage your account, appearance, preferences, and
              saved PathPilot progress.
            </p>
          </div>
        </section>

        <div className="mt-8 space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-indigo-100 p-2.5 dark:bg-indigo-900/30">
                <User className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Account information
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Update your basic personal and career details.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <label>
                <span className="mb-2 block text-sm font-semibold">
                  Full name
                </span>

                <input
                  type="text"
                  name="name"
                  value={account.name}
                  onChange={handleAccountChange}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>

              <label>
                <span className="mb-2 block text-sm font-semibold">
                  Email address
                </span>

                <input
                  type="email"
                  name="email"
                  value={account.email}
                  onChange={handleAccountChange}
                  placeholder="you@example.com"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>

              <label className="md:col-span-2">
                <span className="mb-2 block text-sm font-semibold">
                  Career goal
                </span>

                <input
                  type="text"
                  name="careerGoal"
                  value={account.careerGoal}
                  onChange={handleAccountChange}
                  placeholder="Become a professional frontend developer"
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-purple-100 p-2.5 dark:bg-purple-900/30">
                <Palette className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Appearance
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Choose the theme that feels most comfortable.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => {
                  if (theme !== "light") {
                    toggleTheme();
                  }
                }}
                className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${
                  theme === "light"
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:bg-indigo-900/20"
                    : "border-slate-200 hover:border-indigo-300 dark:border-slate-700"
                }`}
              >
                <div className="rounded-xl bg-amber-100 p-3">
                  <Sun className="h-6 w-6 text-amber-600" />
                </div>

                <div>
                  <p className="font-bold">Light theme</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Bright and clean interface.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (theme !== "dark") {
                    toggleTheme();
                  }
                }}
                className={`flex items-center gap-4 rounded-2xl border p-5 text-left transition ${
                  theme === "dark"
                    ? "border-indigo-500 bg-indigo-50 ring-2 ring-indigo-500/20 dark:bg-indigo-900/20"
                    : "border-slate-200 hover:border-indigo-300 dark:border-slate-700"
                }`}
              >
                <div className="rounded-xl bg-slate-800 p-3">
                  <Moon className="h-6 w-6 text-white" />
                </div>

                <div>
                  <p className="font-bold">Dark theme</p>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Comfortable for low-light environments.
                  </p>
                </div>
              </button>
            </div>

            <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500 dark:bg-slate-800/60 dark:text-slate-400">
              <Laptop className="h-4 w-4" />
              Current theme:{" "}
              <span className="font-semibold capitalize text-slate-700 dark:text-slate-200">
                {theme}
              </span>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-emerald-100 p-2.5 dark:bg-emerald-900/30">
                <Bell className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Preferences
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Control how PathPilot behaves.
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {preferenceItems.map((item) => {
                const Icon = item.icon;
                const isEnabled = settings[item.key];

                return (
                  <div
                    key={item.key}
                    className="flex items-center justify-between gap-5 py-5 first:pt-0 last:pb-0"
                  >
                    <div className="flex items-start gap-3">
                      <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">
                        <Icon className="h-5 w-5 text-slate-600 dark:text-slate-300" />
                      </div>

                      <div>
                        <h3 className="font-semibold">
                          {item.title}
                        </h3>

                        <p className="mt-1 max-w-xl text-sm leading-6 text-slate-500 dark:text-slate-400">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => togglePreference(item.key)}
                      className={`relative h-7 w-12 shrink-0 rounded-full transition ${
                        isEnabled
                          ? "bg-indigo-600"
                          : "bg-slate-300 dark:bg-slate-700"
                      }`}
                      aria-label={`Toggle ${item.title}`}
                      aria-pressed={isEnabled}
                    >
                      <span
                        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow transition ${
                          isEnabled ? "left-6" : "left-1"
                        }`}
                      />
                    </button>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-blue-100 p-2.5 dark:bg-blue-900/30">
                <Download className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  Data management
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Export, restore, or reset your locally saved progress.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <button
                type="button"
                onClick={exportProgress}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-indigo-400 hover:bg-indigo-50 dark:border-slate-700 dark:hover:bg-indigo-900/20"
              >
                <Download className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />

                <div>
                  <p className="font-bold">Export progress</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Download a JSON backup.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => importInputRef.current?.click()}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 p-5 text-left transition hover:border-emerald-400 hover:bg-emerald-50 dark:border-slate-700 dark:hover:bg-emerald-900/20"
              >
                <Upload className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />

                <div>
                  <p className="font-bold">Import progress</p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Restore from a backup.
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                className="flex items-center gap-3 rounded-2xl border border-red-200 p-5 text-left transition hover:border-red-400 hover:bg-red-50 dark:border-red-900/60 dark:hover:bg-red-900/20"
              >
                <RefreshCcw className="h-6 w-6 text-red-600 dark:text-red-400" />

                <div>
                  <p className="font-bold text-red-600 dark:text-red-400">
                    Reset all data
                  </p>
                  <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    Permanently restart PathPilot.
                  </p>
                </div>
              </button>
            </div>

            <input
              ref={importInputRef}
              type="file"
              accept=".json,application/json"
              onChange={importProgress}
              className="hidden"
            />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5 dark:bg-slate-800">
                <Info className="h-5 w-5 text-slate-600 dark:text-slate-300" />
              </div>

              <div>
                <h2 className="text-lg font-bold">
                  About PathPilot
                </h2>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Application and development information.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Application
                </p>
                <p className="mt-1 font-semibold">PathPilot AI</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Version
                </p>
                <p className="mt-1 font-semibold">1.0.0</p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Technology
                </p>
                <p className="mt-1 font-semibold">
                  React + Tailwind CSS
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Developer
                </p>
                <p className="mt-1 font-semibold">Habiba Arif</p>
              </div>
            </div>
          </section>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={saveSettings}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:bg-indigo-700"
            >
              <Save className="h-5 w-5" />
              Save Settings
            </button>
          </div>
        </div>
      </main>

      {showResetModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl dark:bg-slate-900">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 dark:bg-red-900/30">
              <AlertTriangle className="h-7 w-7 text-red-600 dark:text-red-400" />
            </div>

            <h2 className="mt-5 text-xl font-bold">
              Reset all PathPilot data?
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500 dark:text-slate-400">
              This removes your profile, roadmap, missions, projects,
              achievements, streak, resume analysis, settings, and XP.
              This action cannot be undone.
            </p>

            <label className="mt-5 block">
              <span className="mb-2 block text-sm font-semibold">
                Type RESET to confirm
              </span>

              <input
                type="text"
                value={resetConfirmation}
                onChange={(event) =>
                  setResetConfirmation(event.target.value)
                }
                placeholder="RESET"
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 outline-none transition focus:border-red-500 focus:ring-2 focus:ring-red-500/20 dark:border-slate-700 dark:bg-slate-950"
              />
            </label>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  setShowResetModal(false);
                  setResetConfirmation("");
                }}
                className="rounded-xl border border-slate-300 px-5 py-3 font-semibold transition hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={resetAllData}
                disabled={
                  resetConfirmation.trim().toUpperCase() !== "RESET"
                }
                className="rounded-xl bg-red-600 px-5 py-3 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Reset Everything
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Settings;