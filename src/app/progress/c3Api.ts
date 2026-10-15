import axiosInstance from "../lib/axiosInstance";

export type C3ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export type BaselineMetric = {
  mean: number;
  std: number;
  n: number;
};

export type C3Baseline = {
  id: number;
  user_id: number;
  session_id?: number | null;
  version: number;
  metrics: Record<string, BaselineMetric>;
  confidence: number | string;
  source?: string;
  created_at?: string;
};

export type C3SessionOverview = {
  session_id: number;
  session_number: number | null;
  date: string;
  average_delivery_deviation: number | null;
  average_answer_score: number | null;
  average_metrics: Record<string, number>;
  answered_question_count: number;
};

export type ProgressOverviewData = {
  status: "ready" | "insufficient data";
  message?: string;
  baseline?: C3Baseline;
  sessions?: C3SessionOverview[];
};

export type PerTypeItem = {
  question_type: string;
  status: "ready" | "insufficient data";
  count: number;
  average_score: number | null;
  average_delivery_deviation: number | null;
  average_metrics: Record<string, number>;
  difference_from_overall_delivery_deviation: number | null;
  trend: C3SessionOverview[];
};

export type PerTypeData = {
  status: "ready" | "insufficient data";
  message?: string;
  weakest_type?: string | null;
  analysis?: PerTypeItem[];
};

export type DriftEvent = {
  metric: string;
  question_type?: string | null;
  z_score: number;
  direction: "up" | "down";
  classification: "improvement" | "behaviour_shift" | "decline" | "none";
  detected_at_session_number?: number | null;
  explanation?: string;
  baseline_refresh_suggested?: boolean;
};

export type DriftData = {
  status: "ready" | "insufficient data";
  message?: string;
  events?: DriftEvent[];
};

export type ProgressComparisonData = {
  status: "ready" | "insufficient data";
  message?: string;
  fixed_threshold_progress?: {
    raw_average_answer_score_change: number | null;
    note?: string | null;
  };
  baseline_relative_progress?: {
    delivery_deviation_change: number | null;
    share_metrics_moved_closer_to_baseline: number | null;
  };
  latest_self_rating?: {
    improvement_rating?: number | null;
    tip_clarity_rating?: number | null;
    tip_usefulness_rating?: number | null;
    comment?: string | null;
  } | null;
};

export type QuestionMetricSummary = {
  status: "ok" | "no baseline" | "insufficient signal";
  mean?: number | null;
  peak?: number | null;
  peak_t_sec?: number | null;
  n?: number;
  baseline_mean?: number | null;
  baseline_std?: number | null;
  deviation?: number | null;
};

export type QuestionSummary = {
  qa_id: number;
  question_number: number;
  question_type: string;
  question_text: string;
  answer_score: number | null;
  answer_feedback?: string | null;
  answer_word_count: number | null;
  response_latency_sec: number | null;
  metrics: Record<string, QuestionMetricSummary>;
  signal_status: string;
  delivery_deviation: number | null;
};

export type SessionDetailData = {
  session: {
    id: number;
    session_number?: number | null;
    target_company?: string | null;
    job_role: string;
    expertise_level: string;
    created_at: string;
  };
  baseline?: C3Baseline | null;
  summaries: QuestionSummary[];
  coaching_tips: CoachingTip[];
};

export type CoachingTip = {
  id: number;
  user_id: number;
  session_id: number;
  qa_id?: number | null;
  question_type?: string | null;
  metric: string;
  before_value?: number | null;
  goal_text?: string | null;
  tip: string;
  why?: string | null;
  practice?: string | null;
  followed?: "yes" | "partly" | "no" | null;
  after_value?: number | null;
  outcome_status: "open" | "improved" | "no_change" | "worse";
  created_at?: string;
};

export type EvaluationRow = {
  user_id: number;
  session_id: number;
  session_number: number | null;
  fixed_threshold_progress: number | null;
  baseline_relative_progress: number | null;
  delivery_deviation: number | null;
  average_score: number | null;
  self_rated_improvement: number | null;
  tips_given: number;
  tips_followed: number;
  tip_outcomes: string;
};

export type CorrelationSummary = {
  status: "ready" | "insufficient data";
  message?: string;
  participant_count: number;
  fixed_threshold_spearman?: number | null;
  baseline_relative_spearman?: number | null;
};

export type SignalReading = {
  t_sec: number;
  source: "face" | "voice" | "text";
  metrics: Record<string, number>;
};

export const c3Api = {
  async analyzeAnswers(sessionId: string | number) {
    const res = await axiosInstance.post<C3ApiResponse<{ analyzed: number }>>(`/c3/session/${sessionId}/analyze`, {}, { timeout: 180000 });
    return res.data.data;
  },
  async getOverview() {
    const res = await axiosInstance.get<C3ApiResponse<ProgressOverviewData>>("/c3/progress/overview");
    return res.data.data;
  },
  async getPerType() {
    const res = await axiosInstance.get<C3ApiResponse<PerTypeData>>("/c3/progress/per-type");
    return res.data.data;
  },
  async getComparison() {
    const res = await axiosInstance.get<C3ApiResponse<ProgressComparisonData>>("/c3/progress/comparison");
    return res.data.data;
  },
  async getDrift() {
    const res = await axiosInstance.get<C3ApiResponse<DriftData>>("/c3/drift");
    return res.data.data;
  },
  async getSessionDetail(sessionId: string | number) {
    const res = await axiosInstance.get<C3ApiResponse<SessionDetailData>>(`/c3/session/${sessionId}`);
    return res.data.data;
  },
  async refreshBaseline(sessionId?: number | null) {
    const res = await axiosInstance.post<C3ApiResponse<{ baseline?: C3Baseline; status?: string }>>("/c3/baseline/refresh", { sessionId: sessionId || null });
    return res.data.data;
  },
  async createWarmup() {
    const res = await axiosInstance.post<C3ApiResponse<{ sessionId: number }>>("/c3/warmup", {});
    return res.data.data;
  },
  async buildBaseline(sessionId: number) {
    const res = await axiosInstance.post<C3ApiResponse<{ baseline?: C3Baseline; status?: string }>>("/c3/baseline/build", { sessionId });
    return res.data.data;
  },
  async sendSignals(sessionId: number, qaId: number | null, readings: SignalReading[]) {
    const res = await axiosInstance.post<C3ApiResponse<{ inserted: number }>>("/c3/signals", { sessionId, qaId, readings });
    return res.data.data;
  },
  async generateCoaching(sessionId: number) {
    const res = await axiosInstance.post<C3ApiResponse<{ status: string; tips?: CoachingTip[]; message?: string }>>(`/c3/coaching/${sessionId}/generate`);
    return res.data.data;
  },
  async getTips(sessionId?: number | null) {
    const url = sessionId ? `/c3/tips?sessionId=${sessionId}` : "/c3/tips";
    const res = await axiosInstance.get<C3ApiResponse<CoachingTip[]>>(url);
    return res.data.data;
  },
  async updateTipFollowed(tipId: number, followed: "yes" | "partly" | "no") {
    const res = await axiosInstance.patch<C3ApiResponse<{ tipId?: number; followed?: string }>>(`/c3/tips/${tipId}/followed`, { followed });
    return res.data.data;
  },
  async evaluateTips() {
    const res = await axiosInstance.post<C3ApiResponse<unknown[]>>("/c3/tips/evaluate");
    return res.data.data;
  },
  async getTipOutcomes() {
    const res = await axiosInstance.get<C3ApiResponse<CoachingTip[]>>("/c3/tips/outcomes");
    return res.data.data;
  },
  async saveSelfRating(payload: {
    sessionId: number;
    improvementRating: number;
    tipClarityRating?: number | null;
    tipUsefulnessRating?: number | null;
    comment?: string;
  }) {
    const res = await axiosInstance.post<C3ApiResponse<{ id?: number; session_id?: number }>>("/c3/self-rating", payload);
    return res.data.data;
  },
  async getEvaluationDataset(includeDemo: boolean) {
    const res = await axiosInstance.get<C3ApiResponse<EvaluationRow[]>>(`/c3/evaluation/dataset?includeDemo=${includeDemo}`);
    return res.data.data;
  },
  async getCorrelation(includeDemo: boolean) {
    const res = await axiosInstance.get<C3ApiResponse<CorrelationSummary>>(`/c3/evaluation/correlation?includeDemo=${includeDemo}`);
    return res.data.data;
  },
  async downloadCsv(includeDemo: boolean) {
    const res = await axiosInstance.get(`/c3/evaluation/csv?includeDemo=${includeDemo}`, { responseType: "blob" });
    return res.data as Blob;
  },
};
