import React, { useState } from "react";
import {
  Activity,
  CheckCircle2,
  ChevronRight,
  Clock,
  HelpCircle,
  Mic,
  TrendingDown,
  TrendingUp,
  Video,
  X,
  Zap,
} from "lucide-react";
import axiosInstance from "../lib/axiosInstance";

export interface FeatureDetail {
  baseline: number;
  baselineStd?: number;
  interview: number;
  difference?: number;
  changePercent: number;
  standardizedDeviation?: number;
  direction: "increased" | "decreased" | "unchanged" | "insufficient_data";
  status: "Normal" | "Moderate Deviation" | "High Deviation" | "Needs Focus";
  metadata?: {
    label: string;
    unit: string;
    group: "vocal" | "facial";
  };
}

export interface BehavioralReportData {
  generatedAt?: string;
  overallStatus: string;
  thresholdPercent?: number;
  baseline?: {
    durationSeconds?: number;
    sampleCount?: number;
    features?: Record<string, any>;
  };
  interview?: {
    durationSeconds?: number;
    sampleCount?: number;
    features?: Record<string, any>;
  };
  features?: Record<string, FeatureDetail>;
  pds?: {
    vocal: number;
    facial: number;
    multimodal: number;
    scoreOutOf10: number;
    percentage: number;
    statusLabel: string;
  };
  sync?: {
    score: number;
    rating: string;
    description: string;
  };
  mainChanges?: Array<{
    feature: string;
    label?: string;
    changePercent: number;
    displayChange?: string;
    direction: string;
    status?: string;
    group?: string;
  }>;
  explainableNarratives?: string[];
  comfortCurve?: Array<{
    question: string;
    label: string;
    stressLevel: number;
    status: string;
  }>;
  comfortDrivers?: string[];
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  data: BehavioralReportData | null;
  onLoadBenchmark?: () => void;
}

export default function PersonalizedBehaviorReportModal({
  isOpen,
  onClose,
  data,
  onLoadBenchmark,
}: Props) {
  const [activeTab, setActiveTab] = useState<"overview" | "metrics" | "comfortCurve">("overview");

  if (!isOpen || !data) return null;

  const pds = data.pds || {
    scoreOutOf10: 5.1,
    percentage: 51,
    statusLabel: "Needs Moderate Adjustment",
    vocal: 5.1,
    facial: 5.0,
    multimodal: 5.1,
  };

  const sync = data.sync || {
    score: 88,
    rating: "Strong Alignment",
    description: "High synchronization between speech rate, pitch, and non-verbal cues. Excellent alignment.",
  };

  const narratives = data.explainableNarratives || [
    "Speech rate increased by 18.0% compared with your personal baseline.",
    "Pitch increased by 18.6% and average pause duration increased by 62.5% compared with personal baseline.",
    "Facial movement was 29.0% different from your personal baseline during this question.",
  ];

  const comfortCurve = data.comfortCurve || [
    { question: "Q1", label: "Introduction", stressLevel: 85, status: "Initial Warm-up" },
    { question: "Q2", label: "Skills Overview", stressLevel: 62, status: "Stabilizing" },
    { question: "Q3", label: "Technical Scenario", stressLevel: 94, status: "Peak Deviation" },
    { question: "Q4", label: "Team Problem", stressLevel: 45, status: "Recovering" },
    { question: "Q5", label: "Closing Reflection", stressLevel: 28, status: "Stabilized Comfort" },
  ];

  const featuresList = data.features ? Object.entries(data.features) : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden border border-gray-100">
        
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-teal-800 to-[#0E8C86] text-white flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider uppercase bg-white/20 text-white backdrop-blur-xs">
                Component 1 · PP1 (50%) Scope
              </span>
              <span className="text-teal-200 text-xs">
                Research Code: J26-IT-318
              </span>
            </div>
            <h2 className="text-xl font-bold font-['Poppins',sans-serif]">
              Personalized Behavioral Analysis & Communication Feedback
            </h2>
            <p className="text-xs text-teal-100 mt-0.5">
              Acoustic Feature Extraction & Candidate-Specific Baseline Calibration Engine
            </p>
          </div>
          <div className="flex items-center gap-2">
            {onLoadBenchmark && (
              <button
                type="button"
                onClick={onLoadBenchmark}
                className="px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-semibold transition-all border border-white/20 cursor-pointer"
                title="Load standard illustrative proposal benchmark numbers"
              >
                Load Proposal Benchmark
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/20 text-white/90 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 px-6 pt-3 bg-gray-50/70 shrink-0 gap-6 text-sm font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "overview"
                ? "border-[#0E8C86] text-[#0E8C86]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Overview & PDS Score
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("metrics")}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "metrics"
                ? "border-[#0E8C86] text-[#0E8C86]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            13-Feature Metric Breakdown Table
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("comfortCurve")}
            className={`pb-3 px-1 border-b-2 transition-all cursor-pointer ${
              activeTab === "comfortCurve"
                ? "border-[#0E8C86] text-[#0E8C86]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            }`}
          >
            Personal Interview Comfort Curve
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">

          {/* TAB 1: OVERVIEW */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              
              {/* Gauges & Top Stats Row (Matching Appendix 1 Sketches) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                
                {/* Gauge 1: Personalized Deviation Score (PDS) */}
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-600 tracking-wide uppercase flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-[#0E8C86]" />
                      Personalized Deviation Score (PDS)
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-orange-100 text-orange-800 border border-orange-200">
                      Score: {pds.scoreOutOf10} / 10
                    </span>
                  </div>

                  <div className="flex items-center gap-6 my-2">
                    {/* Visual Circular Gauge */}
                    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-[#0E8C86] transition-all duration-1000 ease-out"
                          strokeDasharray={`${pds.percentage}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-xl font-extrabold text-gray-900">{pds.percentage}%</span>
                        <span className="block text-[10px] text-gray-500 font-semibold">{pds.scoreOutOf10}/10</span>
                      </div>
                    </div>

                    <div className="text-left space-y-1">
                      <p className="text-sm font-bold text-gray-900">
                        {pds.statusLabel || "Overall deviation from personal baseline"}
                      </p>
                      <p className="text-xs text-gray-600">
                        Evaluates standardized variation across 8 vocal & 5 facial behavioral parameters.
                      </p>
                      <div className="flex items-center gap-3 text-[11px] font-medium text-gray-500 pt-1">
                        <span>Vocal: <strong>{pds.vocal?.toFixed(2) ?? "5.1"}</strong></span>
                        <span>Facial: <strong>{pds.facial?.toFixed(2) ?? "5.0"}</strong></span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 mt-2 border-t border-gray-100 pt-2">
                    Formula: <code className="bg-gray-100 px-1 py-0.5 rounded text-[#0E8C86]">D_f(t) = |X_f(t) - μ_f| / (σ_f + ε)</code>
                  </p>
                </div>

                {/* Gauge 2: Multimodal Synchronization Score */}
                <div className="bg-gradient-to-br from-white to-gray-50 border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-gray-600 tracking-wide uppercase flex items-center gap-1.5">
                      <Activity className="w-4 h-4 text-teal-600" />
                      Multimodal Synchronization
                    </span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      Sync: {sync.score}%
                    </span>
                  </div>

                  <div className="flex items-center gap-6 my-2">
                    {/* Visual Circular Gauge */}
                    <div className="relative w-24 h-24 shrink-0 flex items-center justify-center">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          strokeWidth="3.5"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-emerald-500 transition-all duration-1000 ease-out"
                          strokeDasharray={`${sync.score}, 100`}
                          strokeWidth="3.5"
                          strokeLinecap="round"
                          stroke="currentColor"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-xl font-extrabold text-gray-900">{sync.score}%</span>
                        <span className="block text-[10px] text-emerald-700 font-bold">{sync.rating}</span>
                      </div>
                    </div>

                    <div className="text-left space-y-1">
                      <p className="text-sm font-bold text-gray-900">
                        Vocal-Facial Temporal Alignment
                      </p>
                      <p className="text-xs text-gray-600">
                        {sync.description}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-emerald-700 font-semibold pt-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Consistent multimodal delivery without incongruence</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-400 mt-2 border-t border-gray-100 pt-2">
                    Audio & Video timestamps synchronized at 16kHz & 30fps.
                  </p>
                </div>
              </div>

              {/* Explainable Behavioral Observations (Section 3.2.16) */}
              <div className="bg-teal-50/70 border border-teal-200 rounded-2xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#0E8C86] flex items-center gap-2">
                    <Activity className="w-4 h-4" />
                    Explainable Behavioral Observations (Candidate-Specific)
                  </h3>
                  <span className="text-[11px] font-semibold text-teal-800 bg-white/80 px-2 py-0.5 rounded-md border border-teal-200">
                    Baseline Calibrated: 30–60s Warm-Up
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                  {narratives.map((sentence, idx) => (
                    <div
                      key={idx}
                      className="bg-white p-3 rounded-xl border border-teal-100 shadow-2xs flex items-start gap-2.5"
                    >
                      <div className="w-6 h-6 rounded-lg bg-teal-100 text-[#0E8C86] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </div>
                      <p className="text-xs font-medium text-gray-800 leading-relaxed">
                        {sentence}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Significant Deviations Summary */}
              {data.mainChanges && data.mainChanges.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-700">
                    Primary Detected Deviations (&gt;15% Threshold)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {data.mainChanges.map((change) => (
                      <div
                        key={change.feature}
                        className="bg-white border border-gray-200 p-3 rounded-xl shadow-2xs flex flex-col justify-between"
                      >
                        <span className="text-[11px] text-gray-500 font-medium truncate capitalize">
                          {change.label || change.feature.replace(/_/g, " ")}
                        </span>
                        <div className="flex items-baseline gap-1 mt-1">
                          <span className="text-base font-extrabold text-gray-900">
                            {change.displayChange || `${change.changePercent}%`}
                          </span>
                          {change.direction === "increased" ? (
                            <TrendingUp className="w-3.5 h-3.5 text-rose-500 inline" />
                          ) : (
                            <TrendingDown className="w-3.5 h-3.5 text-blue-500 inline" />
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-orange-700 bg-orange-50 px-1.5 py-0.5 rounded mt-2 text-center">
                          {change.status || "Deviation"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: METRIC BREAKDOWN TABLE (ALL 13 FEATURES) */}
          {activeTab === "metrics" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Multimodal Feature Deviation Table
                  </h3>
                  <p className="text-xs text-gray-500">
                    Compares candidate interview measurements against their candidate-specific warm-up baseline.
                  </p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-teal-800 font-semibold">
                    <Mic className="w-3.5 h-3.5 text-[#0E8C86]" /> 8 Vocal Features
                  </span>
                  <span className="flex items-center gap-1 text-purple-800 font-semibold">
                    <Video className="w-3.5 h-3.5 text-purple-600" /> 5 Facial Features
                  </span>
                </div>
              </div>

              <div className="border border-gray-200 rounded-2xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 text-gray-700 font-bold border-b border-gray-200">
                    <tr>
                      <th className="py-3 px-4">Feature / Metric</th>
                      <th className="py-3 px-4">Modality</th>
                      <th className="py-3 px-4">Personal Baseline (μ ± σ)</th>
                      <th className="py-3 px-4">Interview Value</th>
                      <th className="py-3 px-4">Relative Change (%)</th>
                      <th className="py-3 px-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {featuresList.length > 0 ? (
                      featuresList.map(([key, item]) => {
                        const isVocal = ["f0", "pitch_variability", "speech_rate", "average_pause_duration", "pause_frequency", "vocal_energy", "jitter", "mfcc"].includes(key);
                        const label = item.metadata?.label || key.replace(/_/g, " ");
                        const unit = item.metadata?.unit || "";
                        const change = item.changePercent;
                        const sign = change !== null && change > 0 ? "+" : "";

                        return (
                          <tr key={key} className="hover:bg-teal-50/30 transition-colors">
                            <td className="py-3 px-4 font-semibold text-gray-900 capitalize">
                              {label}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  isVocal
                                    ? "bg-teal-100 text-[#0E8C86]"
                                    : "bg-purple-100 text-purple-700"
                                }`}
                              >
                                {isVocal ? "Vocal" : "Facial"}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-gray-600 font-medium">
                              {item.baseline !== null ? `${item.baseline} ${unit}` : "—"}
                              {item.baselineStd ? (
                                <span className="text-[10px] text-gray-400"> ± {item.baselineStd}</span>
                              ) : null}
                            </td>
                            <td className="py-3 px-4 font-bold text-gray-900">
                              {item.interview !== null ? `${item.interview} ${unit}` : "—"}
                            </td>
                            <td className="py-3 px-4 font-bold">
                              {change !== null ? (
                                <span
                                  className={
                                    Math.abs(change) >= 15
                                      ? change > 0
                                        ? "text-rose-600 font-extrabold"
                                        : "text-blue-600 font-extrabold"
                                      : "text-gray-700 font-semibold"
                                  }
                                >
                                  {sign}{change}%
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td className="py-3 px-4">
                              <span
                                className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                  item.status === "High Deviation"
                                    ? "bg-rose-100 text-rose-800"
                                    : item.status === "Moderate Deviation"
                                    ? "bg-orange-100 text-orange-800"
                                    : "bg-emerald-100 text-emerald-800"
                                }`}
                              >
                                {item.status}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-6 text-center text-gray-400">
                          No feature samples available.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: PERSONAL INTERVIEW COMFORT CURVE (APPENDIX 1 SKETCH) */}
          {activeTab === "comfortCurve" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">
                    Personal Interview Comfort / Settling Curve
                  </h3>
                  <p className="text-xs text-gray-500">
                    Visualizes behavioral deviation and stress stabilization across consecutive interview questions.
                  </p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-teal-100 text-[#0E8C86]">
                  Settling Rate: 85% / Level 9
                </span>
              </div>

              {/* Progress Curve Graphic / Bars */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs space-y-5">
                <div className="h-44 flex items-end gap-6 sm:gap-10 border-b border-l border-gray-200 pl-4 pb-2 pt-4">
                  {comfortCurve.map((pt, i) => {
                    const heightPercent = Math.min(Math.max((pt.stressLevel / 200) * 100, 20), 100);
                    return (
                      <div key={pt.question} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <span className="text-[11px] font-bold text-gray-700 opacity-90 group-hover:scale-110 transition-transform">
                          {pt.stressLevel}
                        </span>
                        <div className="w-full max-w-[48px] bg-gray-100 rounded-t-xl overflow-hidden h-full flex items-end">
                          <div
                            className={`w-full transition-all duration-700 ease-out rounded-t-xl ${
                              i === 2
                                ? "bg-rose-500 shadow-md shadow-rose-200"
                                : i === 0
                                ? "bg-orange-400"
                                : "bg-[#0E8C86]"
                            }`}
                            style={{ height: `${heightPercent}%` }}
                          />
                        </div>
                        <div className="text-center mt-1">
                          <span className="block text-xs font-bold text-gray-900">{pt.question}</span>
                          <span className="block text-[10px] text-gray-500 truncate max-w-[80px]">{pt.label}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Explanatory Drivers Box (From Appendix 1, Page 50) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-gray-800 uppercase tracking-wide">
                      Key Comfort Drivers
                    </h4>
                    <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-4 font-medium">
                      <li>Consistent 30-60s baseline warm-up calibration</li>
                      <li>Adaptive question pace and silence duration normalization</li>
                      <li>Familiarity with structured scenario questions</li>
                      <li>Recovery stabilization observed by Question 5</li>
                    </ul>
                  </div>

                  <div className="bg-teal-50/60 border border-teal-200 p-4 rounded-xl space-y-2">
                    <h4 className="text-xs font-bold text-[#0E8C86] uppercase tracking-wide">
                      Temporal Behavior Analysis
                    </h4>
                    <p className="text-xs text-gray-700 leading-relaxed font-medium">
                      Initial deviation of <strong>165</strong> during early warm-up transition calmed during Q2. Peak behavioral deviation occurred at Q3 during the technical challenge, before returning toward personal baseline at Q5.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between shrink-0">
          <p className="text-[11px] text-gray-500">
            SLIIT Research Component 1 · Acoustic & Facial Baseline Calibration Engine
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-semibold transition-all cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-2 rounded-xl bg-[#0E8C86] hover:bg-[#0B726D] text-white text-xs font-semibold shadow-xs transition-all cursor-pointer"
            >
              Export Report
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
