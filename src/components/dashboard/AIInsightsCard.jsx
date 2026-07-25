import {
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AIInsightsCard({
  insight,
}) {
  const navigate = useNavigate();

  const priorityColors = {
    high:
      "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30",
    medium:
      "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
    low:
      "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30",
  };

  return (
    <div
      className={`rounded-2xl border p-5 transition hover:shadow-lg ${
        priorityColors[insight.priority] ||
        priorityColors.medium
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Sparkles
          className="text-indigo-600"
          size={20}
        />

        <h3 className="font-bold">
          {insight.title}
        </h3>
      </div>

      <p className="text-sm text-slate-600 dark:text-slate-300 leading-6">
        {insight.message}
      </p>

      <button
        onClick={() =>
          navigate(insight.actionPath)
        }
        className="mt-4 flex items-center gap-2 text-indigo-600 font-semibold hover:gap-3 transition-all"
      >
        {insight.actionLabel}

        <ArrowRight size={16} />
      </button>
    </div>
  );
}
