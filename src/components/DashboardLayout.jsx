import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Sidebar from "./Sidebar";
import GlobalSearch from "./GlobalSearch";
import AIAssistant from "./AIAssistant/AIAssistant";

function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] =
    useState(() => {
      return (
        localStorage.getItem(
          "pathpilot_sidebar_collapsed"
        ) === "true"
      );
    });

  useEffect(() => {
    const updateSidebarState = () => {
      setIsSidebarCollapsed(
        localStorage.getItem(
          "pathpilot_sidebar_collapsed"
        ) === "true"
      );
    };

    window.addEventListener(
      "pathpilot-sidebar-change",
      updateSidebarState
    );

    window.addEventListener(
      "storage",
      updateSidebarState
    );

    return () => {
      window.removeEventListener(
        "pathpilot-sidebar-change",
        updateSidebarState
      );

      window.removeEventListener(
        "storage",
        updateSidebarState
      );
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 transition-colors dark:bg-slate-950">
      <Sidebar />

      <div
        className={`min-h-screen transition-all duration-300 ${
          isSidebarCollapsed
            ? "lg:pl-20"
            : "lg:pl-72"
        }`}
      >
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur-md sm:px-6 dark:border-slate-800 dark:bg-slate-900/90">
          <div className="lg:hidden">
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              PathPilot AI
            </span>
          </div>

          <div className="flex flex-1 items-center justify-end lg:justify-center">
            <GlobalSearch />
          </div>
        </header>

        <main className="min-h-[calc(100vh-5rem)]">
          <Outlet />
        </main>
      </div>

      {/* Available on every dashboard page */}
      <AIAssistant />
    </div>
  );
}

export default DashboardLayout;