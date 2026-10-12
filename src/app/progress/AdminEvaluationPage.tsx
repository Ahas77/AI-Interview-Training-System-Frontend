import { useCallback, useEffect, useState } from "react";
import { Download, Users } from "lucide-react";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/dashboardLayout/dashboard";
import { usePageMetadata } from "../../context/PageContext";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/c3/StateViews";
import { StatCard } from "../../components/c3/StatCard";
import { StatusBadge } from "../../components/c3/StatusBadge";
import { c3Api, CorrelationSummary, EvaluationRow } from "./c3Api";
import { getErrorMessage } from "./errorUtils";

export default function AdminEvaluationPage() {
  const { setPageMetadata } = usePageMetadata();
  const [includeDemo, setIncludeDemo] = useState(false);
  const [rows, setRows] = useState<EvaluationRow[]>([]);
  const [correlation, setCorrelation] = useState<CorrelationSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [dataset, corr] = await Promise.all([
        c3Api.getEvaluationDataset(includeDemo),
        c3Api.getCorrelation(includeDemo),
      ]);
      setRows(dataset);
      setCorrelation(corr);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not load evaluation data."));
    } finally {
      setLoading(false);
    }
  }, [includeDemo]);

  useEffect(() => {
    setPageMetadata({ title: "Evaluation", subtitle: "Research export and exploratory correlations" });
    load();
  }, [setPageMetadata, load]);

  const handleDownload = async () => {
    try {
      setDownloading(true);
      const blob = await c3Api.downloadCsv(includeDemo);
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "c3-evaluation.csv";
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to download CSV."));
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSkeleton label="Loading evaluation dataset..." /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={load} /></DashboardLayout>;

  const participantCount = new Set(rows.map((row) => row.user_id)).size;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
          These results are exploratory and intended for a small pilot research sample. Export rows are pseudonymised with user ids only; no names or emails are shown.
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard title="Participants" value={String(participantCount)} subtitle="Unique user ids in current dataset" icon={Users} />
          <StatCard title="Fixed threshold rho" value={correlation?.fixed_threshold_spearman?.toString() || "N/A"} subtitle={correlation?.status === "insufficient data" ? correlation.message : "Spearman vs self-rating"} icon={Users} />
          <StatCard title="Baseline-relative rho" value={correlation?.baseline_relative_spearman?.toString() || "N/A"} subtitle={correlation?.status === "insufficient data" ? correlation.message : "Spearman vs self-rating"} icon={Users} />
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <input type="checkbox" checked={includeDemo} onChange={(e) => setIncludeDemo(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-[#0E8C86]" />
              Include seeded demo users
            </label>
            <button type="button" onClick={handleDownload} disabled={downloading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0E8C86] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0C7873] disabled:opacity-70">
              <Download className="h-4 w-4" />
              {downloading ? "Downloading..." : "Download CSV"}
            </button>
          </div>
          {correlation?.status === "insufficient data" && (
            <div className="mt-4">
              <StatusBadge label="Not enough participants" tone="warning" />
              <p className="mt-2 text-sm text-gray-600">{correlation.message}</p>
            </div>
          )}
        </div>

        {rows.length === 0 ? (
          <EmptyState title="No evaluation rows" message="Complete sessions, self-ratings, and coaching activity before exporting the research dataset." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">User ID</th>
                  <th className="px-4 py-3">Session</th>
                  <th className="px-4 py-3">Fixed</th>
                  <th className="px-4 py-3">Baseline-relative</th>
                  <th className="px-4 py-3">Deviation</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Self-rating</th>
                  <th className="px-4 py-3">Tips</th>
                  <th className="px-4 py-3">Followed</th>
                  <th className="px-4 py-3">Outcomes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => (
                  <tr key={`${row.user_id}-${row.session_id}`}>
                    <td className="px-4 py-3">{row.user_id}</td>
                    <td className="px-4 py-3">{row.session_number}</td>
                    <td className="px-4 py-3">{row.fixed_threshold_progress ?? "N/A"}</td>
                    <td className="px-4 py-3">{row.baseline_relative_progress ?? "N/A"}</td>
                    <td className="px-4 py-3">{row.delivery_deviation ?? "N/A"}</td>
                    <td className="px-4 py-3">{row.average_score ?? "N/A"}</td>
                    <td className="px-4 py-3">{row.self_rated_improvement ?? "N/A"}</td>
                    <td className="px-4 py-3">{row.tips_given}</td>
                    <td className="px-4 py-3">{row.tips_followed}</td>
                    <td className="px-4 py-3">{row.tip_outcomes || "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
