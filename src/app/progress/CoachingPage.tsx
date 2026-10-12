import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/dashboardLayout/dashboard";
import { usePageMetadata } from "../../context/PageContext";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/c3/StateViews";
import { StatCard } from "../../components/c3/StatCard";
import { TipCard } from "../../components/c3/TipCard";
import { c3Api, CoachingTip } from "./c3Api";
import { CheckCircle2, ListChecks, TrendingUp } from "lucide-react";
import { getErrorMessage } from "./errorUtils";

export default function CoachingPage() {
  const { setPageMetadata } = usePageMetadata();
  const [tips, setTips] = useState<CoachingTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sessionFilter, setSessionFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [outcomeFilter, setOutcomeFilter] = useState("all");
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      await c3Api.evaluateTips().catch(() => null);
      const data = await c3Api.getTipOutcomes();
      setTips(data);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not load coaching tips."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageMetadata({ title: "Coaching", subtitle: "Explainable tips and outcomes" });
    load();
  }, [setPageMetadata]);

  const sessions = Array.from(new Set(tips.map((tip) => String(tip.session_id))));
  const types = Array.from(new Set(tips.map((tip) => tip.question_type).filter(Boolean))) as string[];
  const filteredTips = useMemo(
    () =>
      tips.filter((tip) => {
        if (sessionFilter !== "all" && String(tip.session_id) !== sessionFilter) return false;
        if (typeFilter !== "all" && tip.question_type !== typeFilter) return false;
        if (outcomeFilter !== "all" && tip.outcome_status !== outcomeFilter) return false;
        return true;
      }),
    [tips, sessionFilter, typeFilter, outcomeFilter],
  );

  const handleFollowed = async (tipId: number, followed: "yes" | "partly" | "no") => {
    try {
      setUpdatingId(tipId);
      await c3Api.updateTipFollowed(tipId, followed);
      toast.success("Tip status saved.");
      load();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to update tip status."));
    } finally {
      setUpdatingId(null);
    }
  };

  if (loading) return <DashboardLayout><LoadingSkeleton label="Loading coaching tips..." /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={load} /></DashboardLayout>;

  const followedCount = tips.filter((tip) => tip.followed === "yes" || tip.followed === "partly").length;
  const improvedCount = tips.filter((tip) => tip.outcome_status === "improved").length;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 text-sm leading-6 text-[#0B3538]">
          Tips are generated from measured delivery deviation and expression indicators compared with your own baseline. They are coaching support, not a diagnosis.
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard title="Tips given" value={String(tips.length)} icon={ListChecks} />
          <StatCard title="Tips followed" value={String(followedCount)} icon={CheckCircle2} />
          <StatCard title="Improved outcomes" value={String(improvedCount)} icon={TrendingUp} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <label className="text-sm font-semibold text-gray-700">
              Session
              <select value={sessionFilter} onChange={(e) => setSessionFilter(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2">
                <option value="all">All sessions</option>
                {sessions.map((session) => <option key={session} value={session}>Session {session}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Question type
              <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2">
                <option value="all">All types</option>
                {types.map((type) => <option key={type} value={type}>{type}</option>)}
              </select>
            </label>
            <label className="text-sm font-semibold text-gray-700">
              Outcome
              <select value={outcomeFilter} onChange={(e) => setOutcomeFilter(e.target.value)} className="mt-1 block w-full rounded-xl border border-gray-300 px-3 py-2">
                <option value="all">All outcomes</option>
                <option value="open">Open</option>
                <option value="improved">Improved</option>
                <option value="no_change">No change</option>
                <option value="worse">Worse</option>
              </select>
            </label>
          </div>
        </div>

        {filteredTips.length === 0 ? (
          <EmptyState title="No coaching tips yet" message="Generate coaching from a completed session detail page, then return here to track whether the tips helped." />
        ) : (
          <div className="space-y-4">
            {filteredTips.map((tip) => (
              <TipCard key={tip.id} tip={tip} onFollowedChange={handleFollowed} isUpdating={updatingId === tip.id} />
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
