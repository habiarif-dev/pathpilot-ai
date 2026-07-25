import {
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  Clock3,
  Minus,
  Plus,
} from "lucide-react";

const difficultyClasses = {
  Beginner:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  Intermediate:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  Advanced:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400",
};

function RoadmapCard({
  item,
  index,
  isExpanded,
  onToggleExpand,
  onIncreaseProgress,
  onDecreaseProgress,
  onToggleComplete,
}) {
  const Icon = item.icon;

  const isCompleted =
    item.completed || item.progress === 100;

  const status =
    isCompleted
      ? "Completed"
      : item.progress > 0
        ? "In Progress"
        : "Upcoming";

  const statusClasses =
    status === "Completed"
      ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      : status === "In Progress"
        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400"
        : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400";

  return (
    <article
      className={`overflow-hidden rounded-2xl border bg-white transition-all duration-300 dark:bg-slate-900 ${
        isExpanded
          ? "border-indigo-300 shadow-lg shadow-indigo-500/10 dark:border-indigo-700"
          : "border-slate-200 hover:border-indigo-300 hover:shadow-md dark:border-slate-800 dark:hover:border-indigo-800"
      }`}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Stage and icon */}

          <div className="relative flex-shrink-0">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-900/30">
              <Icon className="h-7 w-7 text-indigo-600 dark:text-indigo-400" />
            </div>

            <span className="absolute -right-2 -top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-indigo-600 px-1.5 text-xs font-bold text-white ring-4 ring-white dark:ring-slate-900">
              {index + 1}
            </span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Stage {index + 1}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${statusClasses}`}
                  >
                    {status}
                  </span>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      difficultyClasses[item.difficulty] ||
                      difficultyClasses.Beginner
                    }`}
                  >
                    {item.difficulty}
                  </span>
                </div>

                <h3 className="mt-3 text-lg font-bold text-slate-900 dark:text-white">
                  {item.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">
                  {item.description}
                </p>
              </div>

              <button
                type="button"
                onClick={onToggleExpand}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center self-end rounded-xl border border-slate-200 text-slate-500 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400 xl:self-start"
                aria-label={
                  isExpanded
                    ? `Collapse ${item.title}`
                    : `Expand ${item.title}`
                }
                aria-expanded={isExpanded}
              >
                {isExpanded ? (
                  <ChevronUp size={20} />
                ) : (
                  <ChevronDown size={20} />
                )}
              </button>
            </div>

            {/* Duration */}

            <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
              <span className="inline-flex items-center gap-1.5">
                <Clock3 size={15} />
                {item.duration}
              </span>

              <span>
                {item.progress}% complete
              </span>
            </div>

            {/* Progress */}

            <div className="mt-4">
              <div className="h-2.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isCompleted
                      ? "bg-emerald-500"
                      : "bg-indigo-600"
                  }`}
                  style={{
                    width: `${item.progress}%`,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Expanded details */}

      {isExpanded && (
        <div className="border-t border-slate-200 bg-slate-50 p-5 dark:border-slate-800 dark:bg-slate-950/40 sm:p-6">
          <div className="grid gap-5 lg:grid-cols-2">
            {/* Tasks */}

            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                What to focus on
              </h4>

              <div className="mt-3 space-y-3">
                {item.tasks.map((task, taskIndex) => (
                  <div
                    key={`${item.id}-task-${taskIndex}`}
                    className="flex items-start gap-3"
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                    ) : (
                      <Circle className="mt-0.5 h-5 w-5 flex-shrink-0 text-slate-400" />
                    )}

                    <p className="text-sm leading-6 text-slate-600 dark:text-slate-400">
                      {task}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress controls */}

            <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
              <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                Update your progress
              </h4>

              <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
                Increase or decrease progress as you work
                through this stage.
              </p>

              <div className="mt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={onDecreaseProgress}
                  disabled={item.progress <= 0}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
                  aria-label={`Decrease ${item.title} progress`}
                >
                  <Minus size={18} />
                </button>

                <div className="flex-1 text-center">
                  <span className="text-2xl font-bold text-slate-900 dark:text-white">
                    {item.progress}%
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onIncreaseProgress}
                  disabled={item.progress >= 100}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-600 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-400"
                  aria-label={`Increase ${item.title} progress`}
                >
                  <Plus size={18} />
                </button>
              </div>

              <button
                type="button"
                onClick={onToggleComplete}
                className={`mt-4 flex w-full items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                  isCompleted
                    ? "border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
                    : "bg-indigo-600 text-white hover:bg-indigo-700"
                }`}
              >
                {isCompleted ? (
                  <>
                    <Circle size={18} />
                    Mark as Incomplete
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={18} />
                    Mark Stage Complete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default RoadmapCard;