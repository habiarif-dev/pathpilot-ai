import {
  CheckCircle2,
  Lock,
  Sparkles,
  Star,
} from "lucide-react";

const RARITY_STYLES = {
  Common: {
    badge:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    icon:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400",
    border:
      "border-slate-200 dark:border-slate-800",
  },
  Rare: {
    badge:
      "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
    icon:
      "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400",
    border:
      "border-indigo-200 dark:border-indigo-900",
  },
  Epic: {
    badge:
      "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    icon:
      "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400",
    border:
      "border-purple-200 dark:border-purple-900",
  },
  Legendary: {
    badge:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    icon:
      "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
    border:
      "border-amber-300 dark:border-amber-900",
  },
};

function AchievementCard({
  achievement,
  compact = false,
}) {
  const {
    title,
    description,
    category,
    icon: Icon,
    xpReward,
    rarity = "Common",
    unlocked = false,
  } = achievement;

  const rarityStyle =
    RARITY_STYLES[rarity] ||
    RARITY_STYLES.Common;

  if (compact) {
    return (
      <article
        className={`flex items-center gap-3 rounded-2xl border bg-white p-4 transition dark:bg-slate-900 ${
          unlocked
            ? rarityStyle.border
            : "border-slate-200 opacity-70 dark:border-slate-800"
        }`}
      >
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${
            unlocked
              ? rarityStyle.icon
              : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
          }`}
        >
          {unlocked ? (
            <Icon className="h-5 w-5" />
          ) : (
            <Lock className="h-5 w-5" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-bold">
              {title}
            </h3>

            {unlocked && (
              <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-500" />
            )}
          </div>

          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
            {unlocked
              ? `Unlocked · +${xpReward} XP`
              : description}
          </p>
        </div>
      </article>
    );
  }

  return (
    <article
      className={`relative overflow-hidden rounded-2xl border bg-white p-5 transition-all duration-300 dark:bg-slate-900 ${
        unlocked
          ? `${rarityStyle.border} hover:-translate-y-1 hover:shadow-lg`
          : "border-slate-200 opacity-75 dark:border-slate-800"
      }`}
    >
      {unlocked && rarity === "Legendary" && (
        <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-amber-300/20 blur-2xl" />
      )}

      <div className="relative">
        <div className="flex items-start justify-between gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
              unlocked
                ? rarityStyle.icon
                : "bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-600"
            }`}
          >
            {unlocked ? (
              <Icon className="h-6 w-6" />
            ) : (
              <Lock className="h-6 w-6" />
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                unlocked
                  ? rarityStyle.badge
                  : "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500"
              }`}
            >
              {rarity}
            </span>

            {unlocked && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Unlocked
              </span>
            )}
          </div>
        </div>

        <div className="mt-5">
          <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            {category}
          </p>

          <h3 className="mt-1 text-lg font-bold">
            {title}
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            {description}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4 dark:border-slate-800">
          <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-600 dark:text-amber-400">
            <Star className="h-4 w-4" />
            {xpReward} XP
          </span>

          {unlocked ? (
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
              <Sparkles className="h-4 w-4" />
              Achievement earned
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-500">
              <Lock className="h-3.5 w-3.5" />
              Locked
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

export default AchievementCard;