import { useState } from "react";
import { ChevronDown, ChevronUp, Target } from "lucide-react";
import { CoachingTip } from "../../app/progress/c3Api";
import { StatusBadge } from "./StatusBadge";
import type { StatusBadgeTone } from "./StatusBadge";

type TipCardProps = {
  tip: CoachingTip;
  onFollowedChange?: (tipId: number, followed: "yes" | "partly" | "no") => void;
  isUpdating?: boolean;
};

function outcomeTone(outcome: string): StatusBadgeTone {
  if (outcome === "improved") return "success";
  if (outcome === "worse") return "danger";
  if (outcome === "no_change") return "warning";
  return "neutral";
}

export function TipCard({ tip, onFollowedChange, isUpdating }: TipCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge label={tip.metric.replace(/_/g, " ")} tone="info" />
            {tip.question_type && <StatusBadge label={tip.question_type} />}
            <StatusBadge label={tip.outcome_status.replace("_", " ")} tone={outcomeTone(tip.outcome_status)} />
          </div>
          <p className="mt-3 text-sm font-semibold leading-6 text-[#0B3538]">{tip.tip}</p>
          {tip.practice && (
            <div className="mt-3 rounded-xl bg-teal-50/70 p-3 text-sm leading-6 text-gray-700">
              <span className="font-semibold text-[#0E8C86]">Practice: </span>
              {tip.practice}
            </div>
          )}
        </div>
        <div className="flex shrink-0 flex-col gap-2">
          <label className="text-xs font-semibold text-gray-600" htmlFor={`follow-${tip.id}`}>Did you try it?</label>
          <select
            id={`follow-${tip.id}`}
            value={tip.followed || ""}
            disabled={isUpdating}
            onChange={(event) => onFollowedChange?.(tip.id, event.target.value as "yes" | "partly" | "no")}
            className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 focus:border-[#0E8C86] focus:outline-none focus:ring-2 focus:ring-[#0E8C86]/20"
          >
            <option value="">Select</option>
            <option value="yes">Yes</option>
            <option value="partly">Partly</option>
            <option value="no">No</option>
          </select>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#0E8C86] hover:text-[#0B3538]"
        aria-expanded={open}
      >
        {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        Why this tip?
      </button>

      {open && (
        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
          <div className="mb-2 flex items-center gap-2 font-semibold text-[#0B3538]">
            <Target className="h-4 w-4 text-[#0E8C86]" />
            Evidence
          </div>
          <p>{tip.why || "No evidence text was returned for this tip."}</p>
          <p className="mt-2 text-xs text-gray-500">
            {tip.metric === "answer_score" ? "Answer score (higher is better)" : "Distance from baseline (lower is closer)"}: {tip.before_value ?? "N/A"}, later: {tip.after_value ?? "not evaluated yet"}.
          </p>
        </div>
      )}
    </div>
  );
}
