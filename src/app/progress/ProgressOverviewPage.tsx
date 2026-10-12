import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, BarChart3, Brain, RefreshCw, TrendingUp } from "lucide-react";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/dashboardLayout/dashboard";
import { usePageMetadata } from "../../context/PageContext";
import { ChartCard } from "../../components/c3/ChartCard";
import { ConfirmModal } from "../../components/c3/ConfirmModal";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/c3/StateViews";
import { StatCard } from "../../components/c3/StatCard";
import { StatusBadge } from "../../components/c3/StatusBadge";
import { c3Api, DriftData, PerTypeData, ProgressComparisonData, ProgressOverviewData } from "./c3Api";
import { getErrorMessage } from "./errorUtils";

export default function ProgressOverviewPage() {
  const { setPageMetadata } = usePageMetadata();
  const [overview, setOverview] = useState<ProgressOverviewData | null>(null);
  const [perType, setPerType] = useState<PerTypeData | null>(null);
  const [drift, setDrift] = useState<DriftData | null>(null);
  const [comparison, setComparison] = useState<ProgressComparisonData | null>(null);
  const [selectedMetric, setSelectedMetric] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmRefresh, setConfirmRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const [overviewRes, perTypeRes, driftRes, comparisonRes] = await Promise.all([
        c3Api.getOverview(),
        c3Api.getPerType(),
        c3Api.getDrift(),
        c3Api.getComparison(),
      ]);
      setOverview(overviewRes);
      setPerType(perTypeRes);
      setDrift(driftRes);
      setComparison(comparisonRes);
      const firstMetric = Object.keys(overviewRes.sessions?.[0]?.average_metrics || {})[0] || "";
      setSelectedMetric((current) => current || firstMetric);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not load C3 progress data."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPageMetadata({ title: "Progress", subtitle: "Baseline-relative coaching analytics" });
    load();
  }, [setPageMetadata]);

  const sessions = useMemo(() => overview?.sessions || [], [overview?.sessions]);
  const metricNames = useMemo(() => {
    const names = new Set<string>();
    sessions.forEach((session) => Object.keys(session.average_metrics || {}).forEach((name) => names.add(name)));
    return Array.from(names);
  }, [sessions]);

  const trendData = {
    labels: sessions.map((session) => `S${session.session_number || session.session_id}`),
    datasets: [
      {
        label: "Delivery deviation",
        data: sessions.map((session) => session.average_delivery_deviation),
        borderColor: "#0E8C86",
        backgroundColor: "rgba(14,140,134,0.14)",
        tension: 0.35,
      },
      {
        label: "Average answer score",
        data: sessions.map((session) => session.average_answer_score),
        borderColor: "#C9A227",
        backgroundColor: "rgba(201,162,39,0.14)",
        tension: 0.35,
        yAxisID: "score",
        hidden: !sessions.some((session) => session.average_answer_score != null),
      },
    ],
  };

  const metricTrendData = {
    labels: sessions.map((session) => `S${session.session_number || session.session_id}`),
    datasets: [
      {
        label: selectedMetric || "Metric",
        data: sessions.map((session) => session.average_metrics?.[selectedMetric] ?? null),
        borderColor: "#0B3538",
        backgroundColor: "rgba(11,53,56,0.12)",
        tension: 0.35,
      },
    ],
  };

  const perTypeChartData = {
    labels: perType?.analysis?.map((item) => item.question_type) || [],
    datasets: [
      {
        label: "Delivery deviation",
        data: perType?.analysis?.map((item) => item.average_delivery_deviation) || [],
        backgroundColor: "#0E8C86",
      },
      {
        label: "Average score",
        data: perType?.analysis?.map((item) => item.average_score) || [],
        backgroundColor: "#C9A227",
      },
    ],
  };

  const handleRefreshBaseline = async () => {
    try {
      setRefreshing(true);
      await c3Api.refreshBaseline();
      toast.success("Baseline refresh created.");
      setConfirmRefresh(false);
      load();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to refresh baseline."));
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSkeleton /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={load} /></DashboardLayout>;
  if (!overview || overview.status === "insufficient data" || sessions.length === 0) {
    return (
      <DashboardLayout>
        <EmptyState title="Not enough progress data yet" message={overview?.message || "Complete a warm-up baseline and at least one interview session to see your coaching dashboard."} />
      </DashboardLayout>
    );
  }

  const firstSession = sessions[0];
  const latestSession = sessions[sessions.length - 1];
  const baselineConfidence = Number(overview.baseline?.confidence || 0);
  const driftEvents = drift?.events || [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 text-sm leading-6 text-[#0B3538]">
          These results show delivery deviation and expression indicators compared with your own warm-up baseline. They are coaching measurements, not a psychological assessment or hiring decision.
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard title="Interview sessions" value={String(sessions.length)} subtitle="Completed sessions with answered questions" icon={BarChart3} />
          <StatCard
            title="Latest vs first"
            value={
              firstSession.average_delivery_deviation != null && latestSession.average_delivery_deviation != null
                ? `${(latestSession.average_delivery_deviation - firstSession.average_delivery_deviation).toFixed(2)}`
                : "N/A"
            }
            subtitle="Delivery deviation change; lower is closer to baseline"
            icon={TrendingUp}
          />
          <StatCard title="Latest score" value={latestSession.average_answer_score?.toFixed(1) || "N/A"} subtitle="Average answer score when available" icon={Brain} />
          <StatCard title="Drift status" value={driftEvents.length ? `${driftEvents.length} flagged` : "Clear"} subtitle={drift?.status === "insufficient data" ? drift.message : "Recent sessions checked"} icon={Activity} />
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartCard
            title="Delivery Deviation Across Sessions"
            subtitle="Lower values are closer to your own baseline"
            data={trendData}
            options={{ scales: { score: { position: "right", beginAtZero: true, grid: { drawOnChartArea: false } } } }}
            summary={`Latest session S${latestSession.session_number} has delivery deviation ${latestSession.average_delivery_deviation ?? "N/A"}.`}
          />
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-bold text-[#0B3538]">Per-Metric Trend</h2>
                <p className="mt-1 text-xs text-gray-500">Render whatever expression indicators are returned by the backend.</p>
              </div>
              <select value={selectedMetric} onChange={(e) => setSelectedMetric(e.target.value)} className="rounded-xl border border-gray-300 px-3 py-2 text-sm">
                {metricNames.map((metric) => <option key={metric} value={metric}>{metric}</option>)}
              </select>
            </div>
            <ChartCard title="" data={metricTrendData} summary={`${selectedMetric || "Metric"} trend across completed sessions.`} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0B3538]">Active Baseline</h2>
              <p className="mt-1 text-sm text-gray-600">Version {overview.baseline?.version} from {overview.baseline?.source || "warm-up"} on {overview.baseline?.created_at ? new Date(overview.baseline.created_at).toLocaleDateString() : "N/A"}.</p>
            </div>
            <StatusBadge label={`Confidence ${(baselineConfidence * 100).toFixed(0)}%`} tone={baselineConfidence < 0.6 ? "warning" : "success"} />
          </div>
          {baselineConfidence < 0.6 && <p className="mt-3 text-sm text-amber-700">Low confidence: record a longer warm-up or add more readings before relying on this baseline.</p>}
          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Object.entries(overview.baseline?.metrics || {}).map(([metric, value]) => (
              <div key={metric} className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-sm">
                <p className="font-semibold text-[#0B3538]">{metric}</p>
                <p className="mt-1 text-gray-600">mean {value.mean}, spread {value.std}, n={value.n}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <ChartCard title="Per-Question-Type Analysis" type="bar" data={perTypeChartData} summary={`Weakest type: ${perType?.weakest_type || "not enough data"}.`} />
          <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                <tr>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Score</th>
                  <th className="px-4 py-3">Deviation</th>
                  <th className="px-4 py-3">Count</th>
                  <th className="px-4 py-3">Vs own avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {perType?.analysis?.map((item) => (
                  <tr key={item.question_type} className={item.question_type === perType.weakest_type ? "bg-amber-50/60" : "bg-white"}>
                    <td className="px-4 py-3 font-semibold text-[#0B3538]">{item.question_type}</td>
                    <td className="px-4 py-3">{item.average_score ?? "N/A"}</td>
                    <td className="px-4 py-3">{item.average_delivery_deviation ?? "N/A"}</td>
                    <td className="px-4 py-3">{item.count}</td>
                    <td className="px-4 py-3">{item.status === "insufficient data" ? "not enough data" : item.difference_from_overall_delivery_deviation ?? "N/A"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-[#0B3538]">Drift Events</h2>
              <p className="mt-1 text-sm text-gray-600">Recent expression indicators compared with reference sessions.</p>
            </div>
            {driftEvents.some((event) => event.baseline_refresh_suggested) && (
              <button type="button" onClick={() => setConfirmRefresh(true)} className="inline-flex items-center gap-2 rounded-xl bg-[#0E8C86] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0C7873]">
                <RefreshCw className="h-4 w-4" />
                Refresh baseline
              </button>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {drift?.status === "insufficient data" && <p className="text-sm text-gray-600">{drift.message}</p>}
            {driftEvents.length === 0 && drift?.status !== "insufficient data" && <p className="text-sm text-gray-600">No flagged drift events.</p>}
            {driftEvents.map((event, index) => (
              <div key={`${event.metric}-${index}`} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-semibold text-[#0B3538]">{event.metric}</span>
                  <StatusBadge label={event.classification.replace("_", " ")} tone={event.classification === "decline" ? "danger" : event.classification === "improvement" ? "success" : "warning"} />
                  <StatusBadge label={`z=${event.z_score}`} />
                </div>
                <p className="mt-2 text-sm text-gray-600">{event.explanation}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-bold text-[#0B3538]">Baseline-Relative vs Fixed-Threshold Progress</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">Fixed threshold</p>
              <p className="mt-2 text-xl font-bold text-[#0B3538]">{comparison?.fixed_threshold_progress?.raw_average_answer_score_change ?? "N/A"}</p>
              <p className="mt-1 text-xs text-gray-500">Raw score change.</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">Baseline-relative</p>
              <p className="mt-2 text-xl font-bold text-[#0B3538]">{comparison?.baseline_relative_progress?.delivery_deviation_change ?? "N/A"}</p>
              <p className="mt-1 text-xs text-gray-500">Change in closeness to own baseline.</p>
            </div>
            <div className="rounded-xl bg-gray-50 p-4">
              <p className="text-xs font-semibold uppercase text-gray-500">Self-rated improvement</p>
              <p className="mt-2 text-xl font-bold text-[#0B3538]">{comparison?.latest_self_rating?.improvement_rating ?? "N/A"}</p>
              <p className="mt-1 text-xs text-gray-500">Latest candidate rating.</p>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <div className="border-b border-gray-100 p-4">
            <h2 className="text-base font-bold text-[#0B3538]">Session History</h2>
          </div>
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Deviation</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3">Questions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sessions.map((session) => (
                <tr key={session.session_id}>
                  <td className="px-4 py-3">
                    <Link className="font-semibold text-[#0E8C86] hover:underline" to={`/progress/session/${session.session_id}`}>Session {session.session_number || session.session_id}</Link>
                  </td>
                  <td className="px-4 py-3">{new Date(session.date).toLocaleDateString()}</td>
                  <td className="px-4 py-3">{session.average_delivery_deviation ?? "N/A"}</td>
                  <td className="px-4 py-3">{session.average_answer_score ?? "N/A"}</td>
                  <td className="px-4 py-3">{session.answered_question_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <ConfirmModal
          isOpen={confirmRefresh}
          isBusy={refreshing}
          title="Refresh baseline?"
          message="This creates a new baseline version. It will not overwrite previous versions and only happens after this confirmation."
          confirmLabel="Create new baseline"
          onCancel={() => setConfirmRefresh(false)}
          onConfirm={handleRefreshBaseline}
        />
      </div>
    </DashboardLayout>
  );
}
