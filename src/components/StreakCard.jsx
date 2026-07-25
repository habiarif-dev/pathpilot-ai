import {
  Award,
  Flame,
  Trophy,
} from "lucide-react";

function StreakCard({
  currentStreak,
  longestStreak,
  nextReward,
  progressToNextReward,
  streakXp,
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-orange-200 bg-white p-6 dark:border-orange-900/50 dark:bg-slate-900">
      <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-orange-400/10 blur-3xl" />

      <div className="relative">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Daily Streak
            </p>

            <h2 className="mt-1 flex items-center gap-2 text-3xl font-bold">
              {currentStreak}{" "}
              {currentStreak === 1
                ? "Day"
                : "Days"}

              <Flame className="h-7 w-7 text-orange-500" />
            </h2>

            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Keep opening PathPilot every day to
              protect your streak.
            </p>
          </div>

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 dark:bg-orange-900/30">
            <Flame className="h-7 w-7 text-orange-600 dark:text-orange-400" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Longest Streak
            </p>

            <p className="mt-1 flex items-center gap-2 font-bold">
              <Trophy className="h-4 w-4 text-amber-500" />
              {longestStreak} days
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-800/60">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Streak Bonus
            </p>

            <p className="mt-1 flex items-center gap-2 font-bold">
              <Award className="h-4 w-4 text-indigo-500" />
              {streakXp} XP
            </p>
          </div>
        </div>

        {nextReward ? (
          <div className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                  Next Reward
                </p>

                <p className="mt-1 font-semibold">
                  {nextReward.title}
                </p>
              </div>

              <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                {currentStreak}/{nextReward.days}
              </span>
            </div>

            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-orange-400 to-red-500 transition-all duration-500"
                style={{
                  width: `${progressToNextReward}%`,
                }}
              />
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl bg-amber-50 p-4 dark:bg-amber-900/20">
            <p className="font-semibold text-amber-700 dark:text-amber-400">
              All streak rewards unlocked!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default StreakCard;