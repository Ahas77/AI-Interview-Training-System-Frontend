import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { MessageSquare, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import DashboardLayout from "../../components/dashboardLayout/dashboard";
import { usePageMetadata } from "../../context/PageContext";
import { ChartCard } from "../../components/c3/ChartCard";
import { EmptyState, ErrorState, LoadingSkeleton } from "../../components/c3/StateViews";
import { StatusBadge } from "../../components/c3/StatusBadge";
import { TipCard } from "../../components/c3/TipCard";
import { SelfRatingModal } from "../../components/c3/SelfRatingModal";
import { c3Api, SessionDetailData } from "./c3Api";
import { getErrorMessage } from "./errorUtils";

export default function SessionDetailPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const { setPageMetadata } = usePageMetadata();
  const [detail, setDetail] = useState<SessionDetailData | null>(null);
  const [selectedQaId, setSelectedQaId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);
  const [ratingOpen, setRatingOpen] = useState(false);

  const load = useCallback(async () => {
    if (!sessionId) return;
    try {
      setLoading(true);
      setError("");
      const data = await c3Api.getSessionDetail(sessionId);
      setDetail(data);
      setSelectedQaId((current) => current || data.summaries[0]?.qa_id || null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, "Could not load session detail."));
    } finally {
      setLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    setPageMetadata({ title: "Session Detail", subtitle: "Question-level delivery deviation and coaching" });
    load();
  }, [setPageMetadata, load]);

  const selectedQuestion = useMemo(
    () => detail?.summaries.find((summary) => summary.qa_id === selectedQaId) || detail?.summaries[0],
    [detail, selectedQaId],
  );

  const metricChartData = {
    labels: Object.keys(selectedQuestion?.metrics || {}),
    datasets: [
      {
        label: "Question mean",
        data: Object.values(selectedQuestion?.metrics || {}).map((metric) => metric.mean ?? null),
        backgroundColor: "#0E8C86",
      },
      {
        label: "Baseline mean",
        data: Object.values(selectedQuestion?.metrics || {}).map((metric) => metric.baseline_mean ?? null),
        backgroundColor: "#C9A227",
      },
    ],
  };

  const generateCoaching = async () => {
    if (!detail?.session.id) return;
    try {
      setGenerating(true);
      const result = await c3Api.generateCoaching(detail.session.id);
      if (result.status !== "ready") {
        toast.info(result.message || "Not enough data for coaching yet.");
      } else {
        toast.success("Coaching tips generated.");
      }
      load();
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Failed to generate coaching tips."));
    } finally {
      setGenerating(false);
    }
  };

  if (loading) return <DashboardLayout><LoadingSkeleton label="Loading session detail..." /></DashboardLayout>;
  if (error) return <DashboardLayout><ErrorState message={error} onRetry={load} /></DashboardLayout>;
  if (!detail) return <DashboardLayout><EmptyState title="Session not found" message="The session may not belong to this account or may not have enough data yet." /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="rounded-2xl border border-teal-200 bg-teal-50/70 p-4 text-sm leading-6 text-[#0B3538]">
          Delivery deviation and expression indicators are compared with your own baseline. This is not a psychological assessment.
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-bold text-[#0B3538]">Session {detail.session.session_number || detail.session.id}</h1>
              <p className="mt-1 text-sm text-gray-600">
                {detail.session.target_company || "Target company not set"} · {detail.session.job_role} · {detail.session.expertise_level}
              </p>
              <p className="mt-1 text-xs text-gray-500">{new Date(detail.session.created_at).toLocaleString()}</p>
            </div>
            <button type="button" onClick={() => setRatingOpen(true)} className="rounded-xl bg-[#0E8C86] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0C7873]">
              Edit self-rating
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <div className="space-y-4">
            {detail.summaries.length === 0 && (
              <EmptyState title="No answered questions yet" message="Complete an interview session before opening question-level analysis." />
            )}
            {detail.summaries.map((question) => (
              <button
                type="button"
                key={question.qa_id}
                onClick={() => setSelectedQaId(question.qa_id)}
                className={`w-full rounded-2xl border p-4 text-left shadow-sm transition-colors ${selectedQaId === question.qa_id ? "border-[#0E8C86] bg-teal-50/60" : "border-gray-200 bg-white hover:bg-gray-50"}`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <StatusBadge label={`Q${question.question_number}`} tone="info" />
                  <StatusBadge label={question.question_type} />
                  {question.signal_status !== "available" && <StatusBadge label="insufficient signal" tone="warning" />}
                </div>
                <p className="mt-3 text-sm font-semibold leading-6 text-[#0B3538]">{question.question_text}</p>
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600 md:grid-cols-4">
                  <span>Score: {question.answer_score ?? "N/A"}</span>
                  <span>Latency: {question.response_latency_sec ?? "N/A"}s</span>
                  <span>Words: {question.answer_word_count ?? "N/A"}</span>
                  <span>Deviation: {question.delivery_deviation ?? "N/A"}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {Object.entries(question.metrics || {}).map(([metric, value]) => (
                    <span key={metric} className={`rounded-lg border px-2.5 py-1 text-xs font-medium ${value.status === "insufficient signal" ? "border-amber-200 bg-amber-50 text-amber-700" : "border-gray-200 bg-white text-gray-700"}`}>
                      {metric}: {value.deviation ?? value.status}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>

          <div className="space-y-6">
            <ChartCard
              title="Selected Question Indicators"
              type="bar"
              data={metricChartData}
              summary="The backend currently returns per-question metric summaries, peaks, and baseline means, not raw signal time-series points. This chart avoids inventing data and compares returned question means with baseline means."
            />
            {selectedQuestion && (
              <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
                <h2 className="text-base font-bold text-[#0B3538]">Peak Points</h2>
                <div className="mt-3 space-y-2">
                  {Object.entries(selectedQuestion.metrics || {}).map(([metric, value]) => (
                    <div key={metric} className="flex items-center justify-between rounded-xl bg-gray-50 px-3 py-2 text-sm">
                      <span className="font-semibold text-gray-700">{metric}</span>
                      <span className="text-gray-600">peak {value.peak ?? "N/A"} at {value.peak_t_sec ?? "N/A"}s</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold text-[#0B3538]">Coaching Tips</h2>
              <p className="mt-1 text-sm text-gray-600">Each tip includes evidence so the dashboard can explain why it appeared.</p>
            </div>
            {detail.coaching_tips.length === 0 && (
              <button type="button" onClick={generateCoaching} disabled={generating} className="inline-flex items-center gap-2 rounded-xl bg-[#0E8C86] px-4 py-2 text-sm font-semibold text-white hover:bg-[#0C7873] disabled:opacity-70">
                <MessageSquare className="h-4 w-4" />
                {generating ? "Generating..." : "Generate coaching"}
              </button>
            )}
            {detail.coaching_tips.length > 0 && (
              <button type="button" onClick={load} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50">
                <RefreshCw className="h-4 w-4" />
                Refresh
              </button>
            )}
          </div>
          <div className="mt-4 space-y-3">
            {detail.coaching_tips.length === 0 ? (
              <p className="text-sm text-gray-600">No coaching tips for this session yet.</p>
            ) : (
              detail.coaching_tips.map((tip) => <TipCard key={tip.id} tip={tip} />)
            )}
          </div>
        </div>

        <SelfRatingModal sessionId={detail.session.id} isOpen={ratingOpen} onClose={() => setRatingOpen(false)} />
      </div>
    </DashboardLayout>
  );
}
