import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { NextStepsRoadmap } from "./NextStepsRoadmap";
import {
  Sparkles,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Send,
  Loader2,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Briefcase,
  Building2,
  Code2,
  Terminal,
  Cpu,
  Layers,
  ChevronDown,
  ChevronUp,
  Bell,
  Settings,
  User,
  LogOut,
  HelpCircle,
  Trophy,
  Check,
  X,
  Lightbulb,
  Printer,
  BookOpen,
  Filter,
  BarChart3,
  Award,
} from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "../lib/axiosInstance";
import { clearAuthStorage, getStoredValue } from "../lib/authStorage";
import { useWebcamMic } from "../../hooks/useWebcamMic";
import { useSpeechToText } from "../../hooks/useSpeechToText";
import { useTextToSpeech } from "../../hooks/useTextToSpeech";

interface QuestionData {
  id: number;
  questionNumber: number;
  category?: string;
  text: string;
  contextHint?: string | null;
  codeSnippet?: string | null;
  userAnswer?: string;
}

interface RequirementItem {
  id?: number;
  requirement_category?: string;
  requirement_name?: string;
  requirement_type?: string;
  evidence_excerpt?: string;
}

interface SessionData {
  id: number;
  job_role: string;
  target_company?: string;
  expertise_level: string;
  total_questions: number;
  current_question_index: number;
  status: string;
  round_type?: string;
}

interface EvaluationItem {
  qaId: number;
  questionNumber: number;
  questionText: string;
  userAnswer: string;
  status: "correct" | "partially_correct" | "wrong";
  score: number;
  feedback: string;
  correctAnswer: string;
  category?: string;
}

interface SummaryData {
  session?: {
    id: number;
    targetCompany?: string;
    jobRole?: string;
    expertiseLevel?: string;
    status?: string;
  };
  overallScore: number;
  summary: string;
  totalQuestions: number;
  correctCount: number;
  partiallyCorrectCount: number;
  wrongCount: number;
  evaluations: EvaluationItem[];
}

export default function TechnicalSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  // User state
  const userName = getStoredValue("name") || "Candidate";
  const userAvatar = getStoredValue("avatar");
  const userEmail = getStoredValue("email") || "user@example.com";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Media Hooks
  const { videoRef, hasPermission, isMicMuted, isVideoOff, toggleMic, toggleVideo } = useWebcamMic();
  const { transcript, isListening, isSupported, startListening, stopListening, resetTranscript } = useSpeechToText();
  const { isPlaying: isSpeakingAI, speakQuestion, stopSpeaking } = useTextToSpeech();

  // Page States
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [companyRequirements, setCompanyRequirements] = useState<RequirementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [answerInput, setAnswerInput] = useState("");
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);

  // Summary and Evaluation States
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<"all" | "correct" | "partially_correct" | "wrong">("all");
  const [showModelAnswerMap, setShowModelAnswerMap] = useState<Record<number, boolean>>({});
  const nextStepsRef = useRef<HTMLDivElement>(null);

  const handleScrollToNextSteps = () => {
    if (nextStepsRef.current) {
      nextStepsRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Synchronize transcript from SpeechToText hook
  useEffect(() => {
    if (transcript) {
      setAnswerInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
    }
  }, [transcript]);

  // Fetch session on load
  useEffect(() => {
    if (sessionId) {
      fetchTechnicalSession(sessionId);
    }
  }, [sessionId]);

  // Auto-speak question when question changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.text && autoPlayAudio && !isCompleted) {
      const timer = setTimeout(() => {
        speakQuestion(currentQuestion.text);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, autoPlayAudio, speakQuestion, isCompleted]);

  const fetchSummary = async (id: string) => {
    setLoadingSummary(true);
    try {
      const res = await axiosInstance.get(`/interview/technical/summary/${id}`);
      if (res.data && res.data.success) {
        setSummaryData(res.data);
      }
    } catch (err: any) {
      console.error("Fetch summary error:", err);
      toast.error(err.response?.data?.message || "Could not load evaluation summary.");
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleEndSessionEarly = async () => {
    if (!sessionId) return;
    if (
      window.confirm(
        "Are you sure you want to end your technical interview now and view your answer evaluations?"
      )
    ) {
      try {
        setLoadingSummary(true);
        setIsCompleted(true);
        await axiosInstance.post("/interview/technical/complete", {
          sessionId: parseInt(sessionId, 10),
        });
        await fetchSummary(sessionId);
      } catch (err) {
        console.error("End session error:", err);
      } finally {
        setLoadingSummary(false);
      }
    }
  };

  const toggleModelAnswer = (questionNumber: number) => {
    setShowModelAnswerMap((prev) => ({
      ...prev,
      [questionNumber]: !prev[questionNumber],
    }));
  };

  const fetchTechnicalSession = async (id: string) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/interview/technical/session/${id}`);
      if (res.data && res.data.success) {
        setSession(res.data.session);
        if (res.data.companyRequirements) {
          setCompanyRequirements(res.data.companyRequirements);
        }
        if (
          res.data.session.status === "completed" ||
          res.data.session.status === "technical_completed"
        ) {
          setIsCompleted(true);
          if (res.data.summary) {
            setSummaryData(res.data.summary);
          } else {
            fetchSummary(id);
          }
        } else if (res.data.currentQuestion) {
          setCurrentQuestion(res.data.currentQuestion);
          setAnswerInput(res.data.currentQuestion.userAnswer || "");
        }
      } else {
        toast.error("Failed to load technical interview session.");
      }
    } catch (err: any) {
      console.error("Fetch technical session error:", err);
      toast.error(err.response?.data?.message || "Error fetching technical session.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuthStorage();
    toast.info("Logged out successfully");
    navigate("/signin");
  };

  const handleToggleVoicePlayback = () => {
    if (isSpeakingAI) {
      stopSpeaking();
    } else if (currentQuestion?.text) {
      speakQuestion(currentQuestion.text);
    }
  };

  const handleMicToggleRecord = () => {
    if (!isSupported) {
      toast.warning("Speech Recognition is not supported in this browser. Please type your code or response.");
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  };

  const handleSubmitAnswer = async () => {
    if (!sessionId || !currentQuestion) return;

    if (isListening) {
      stopListening();
    }
    stopSpeaking();

    const finalAnswerText = answerInput.trim();
    if (!finalAnswerText) {
      toast.info("Please provide your technical answer or code solution before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        sessionId: parseInt(sessionId, 10),
        qaId: currentQuestion.id,
        userAnswerText: finalAnswerText,
      };

      const res = await axiosInstance.post("/interview/technical/submit-answer", payload);

      if (res.data && res.data.success) {
        if (res.data.isCompleted) {
          setIsCompleted(true);
          if (res.data.summary) {
            setSummaryData(res.data.summary);
          } else {
            fetchSummary(sessionId);
          }
          const thankYouText =
            "Congratulations on completing your technical interview round! Your responses have been evaluated and your summary report is ready.";
          speakQuestion(thankYouText);
          toast.success("10-Question Technical Interview Completed!");
        } else if (res.data.currentQuestion) {
          setCurrentQuestion(res.data.currentQuestion);
          setAnswerInput("");
          resetTranscript();
          if (session) {
            setSession({
              ...session,
              current_question_index: res.data.currentQuestion.questionNumber,
            });
          }
          toast.success(`Question ${res.data.currentQuestion.questionNumber} of 10 Loaded`);
        }
      } else {
        toast.error(res.data?.message || "Failed to submit technical answer.");
      }
    } catch (err: any) {
      console.error("Submit technical answer error:", err);
      toast.error(err.response?.data?.message || "Could not send answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex items-center justify-center text-gray-800 font-['Roboto','Poppins',sans-serif]">
        <div className="text-center space-y-4 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm max-w-md">
          <Loader2 className="w-10 h-10 text-[#0E8C86] animate-spin mx-auto" />
          <p className="text-base font-semibold text-[#0B3538]">Configuring Technical Interview Room...</p>
          <p className="text-xs text-gray-500">Injecting CV projects and verified company requirements...</p>
        </div>
      </div>
    );
  }

  const totalQ = session?.total_questions || 10;
  const currentQNum = currentQuestion?.questionNumber || session?.current_question_index || 1;
  const progressPercent = Math.min((currentQNum / totalQ) * 100, 100);

  const filteredEvaluations = summaryData?.evaluations
    ? summaryData.evaluations.filter((item) => {
        if (selectedFilter === "all") return true;
        return item.status === selectedFilter;
      })
    : [];

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-['Roboto','Poppins',sans-serif]">
      {/* ── HEADER NAVIGATION BAR ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#0E8C86] flex items-center justify-center text-white font-bold shadow-xs">
                <Code2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-[#0B3538] tracking-tight font-['Poppins',sans-serif]">
                Interview<span className="text-[#0E8C86]">AI</span>
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 bg-teal-100 text-[#0E8C86] rounded-full uppercase tracking-wider">
                  Technical Round
                </span>
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link to="/dashboard" className="text-gray-600 hover:text-[#0E8C86] transition-colors py-2">
                Dashboard
              </Link>
              <span className="text-[#0E8C86] font-semibold border-b-2 border-[#0E8C86] py-2 cursor-pointer">
                Technical Interview (10 Questions)
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={handleLogout}
              className="text-xs font-semibold text-gray-600 hover:text-red-600 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col space-y-6">
        {/* Top Context & Progress Bar */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-700 font-medium">
            <span className="flex items-center gap-1.5 px-3 py-1 bg-teal-50 text-[#0E8C86] rounded-lg border border-teal-200 font-semibold">
              <Building2 className="w-3.5 h-3.5" />
              {session?.target_company || "Target Company"}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-700 rounded-lg border border-gray-200">
              <Briefcase className="w-3.5 h-3.5 text-gray-500" />
              {session?.job_role || "Software Engineer"}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-gray-50 text-gray-700 rounded-lg border border-gray-200">
              <Cpu className="w-3.5 h-3.5 text-gray-500" />
              {session?.expertise_level || "Intermediate"} Level
            </span>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {!isCompleted && (
              <button
                type="button"
                onClick={handleEndSessionEarly}
                className="text-xs font-semibold text-rose-700 hover:text-white hover:bg-rose-600 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
                title="End interview early and view evaluations"
              >
                <span>End Session</span>
              </button>
            )}

            <div className="text-right">
              <span className="text-xs font-bold text-[#0B3538] font-mono">
                {isCompleted ? "Session Complete" : `Question ${currentQNum} of ${totalQ}`}
              </span>
              <div className="w-32 sm:w-44 bg-gray-100 rounded-full h-2 mt-1 overflow-hidden border border-gray-200">
                <div
                  className="bg-[#0E8C86] h-full rounded-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        {/* ── COMPLETED EVALUATION REPORT STATE ── */}
        {isCompleted ? (
          loadingSummary || !summaryData ? (
            <div className="max-w-2xl w-full mx-auto bg-white border border-gray-200 rounded-3xl p-10 text-center space-y-6 shadow-sm my-12">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center mx-auto text-[#0E8C86]">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
              <div className="space-y-2">
                <h2 className="text-2xl font-bold text-[#0B3538] font-['Poppins',sans-serif]">
                  Analyzing Your Technical Answers...
                </h2>
                <p className="text-gray-600 text-sm max-w-md mx-auto">
                  Our AI Technical Evaluator is evaluating your code solutions and answers against {session?.target_company}'s engineering criteria and compiling the model solutions.
                </p>
              </div>
              <div className="w-48 bg-gray-100 rounded-full h-1.5 mx-auto overflow-hidden">
                <div className="bg-[#0E8C86] h-full rounded-full animate-pulse w-3/4"></div>
              </div>
            </div>
          ) : (
            <div className="w-full space-y-6">
              {/* ── TOP HERO SUMMARY BANNER ── */}
              <div className="bg-gradient-to-r from-[#0B3538] to-[#0E8C86] text-white rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>

                <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                  <div className="space-y-2 max-w-2xl">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-semibold uppercase tracking-wider text-teal-100 border border-white/20">
                      <Trophy className="w-3.5 h-3.5 text-amber-300" />
                      <span>Technical Evaluation & Solutions Report</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight font-['Poppins',sans-serif]">
                      Performance Summary & Answer Review
                    </h2>
                    <p className="text-teal-50/90 text-sm leading-relaxed">
                      Review all asked questions, your submitted answers, correctness assessments, and verified correct solutions tailored for <span className="font-semibold text-white">{session?.target_company}</span>.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white border border-white/30 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-sm shadow-xs"
                      title="Print or Save as PDF"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print / PDF</span>
                    </button>
                    <Link
                      to="/dashboard"
                      className="px-5 py-2.5 bg-white text-[#0B3538] hover:bg-gray-50 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <span>Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>

              {/* ── 4 KPI METRIC CARDS ── */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Overall Score */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Overall Score
                    </span>
                    <Award className="w-5 h-5 text-[#0E8C86]" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-[#0B3538] font-['Poppins',sans-serif]">
                        {summaryData.overallScore}%
                      </span>
                      <span
                        className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                          summaryData.overallScore >= 75
                            ? "bg-emerald-100 text-emerald-800"
                            : summaryData.overallScore >= 50
                            ? "bg-amber-100 text-amber-800"
                            : "bg-rose-100 text-rose-800"
                        }`}
                      >
                        {summaryData.overallScore >= 75
                          ? "Strong Hire"
                          : summaryData.overallScore >= 50
                          ? "Moderate"
                          : "Needs Review"}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Weighted technical competency
                    </p>
                  </div>
                </div>

                {/* Correct Answers */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Correct Answers
                    </span>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-emerald-600 font-['Poppins',sans-serif]">
                        {summaryData.correctCount}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        / {summaryData.totalQuestions} questions
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {Math.round(
                        (summaryData.correctCount / (summaryData.totalQuestions || 1)) * 100
                      )}
                      % technically accurate
                    </p>
                  </div>
                </div>

                {/* Partially Correct */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Partially Correct
                    </span>
                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-amber-600 font-['Poppins',sans-serif]">
                        {summaryData.partiallyCorrectCount}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        / {summaryData.totalQuestions} questions
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Key concepts present, minor gaps
                    </p>
                  </div>
                </div>

                {/* Needs Review / Wrong */}
                <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Needs Review
                    </span>
                    <XCircle className="w-5 h-5 text-rose-500" />
                  </div>
                  <div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-extrabold text-rose-600 font-['Poppins',sans-serif]">
                        {summaryData.wrongCount}
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        / {summaryData.totalQuestions} questions
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Study the correct solutions below
                    </p>
                  </div>
                </div>
              </div>

              {/* ── EXECUTIVE AI FEEDBACK ── */}
              {summaryData.summary && (
                <div className="bg-white border border-teal-200/80 rounded-2xl p-5 shadow-xs flex items-start gap-3.5 bg-gradient-to-r from-teal-50/40 to-white">
                  <div className="w-9 h-9 rounded-xl bg-[#0E8C86]/10 border border-[#0E8C86]/20 flex items-center justify-center text-[#0E8C86] shrink-0 mt-0.5">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-[#0B3538] font-['Poppins',sans-serif]">
                      AI Evaluator Assessment
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">
                      {summaryData.summary}
                    </p>
                  </div>
                </div>
              )}

              {/* ── FILTER TABS ── */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedFilter("all")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedFilter === "all"
                        ? "bg-[#0E8C86] text-white shadow-xs"
                        : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    All Questions ({summaryData.totalQuestions})
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFilter("correct")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedFilter === "correct"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Correct ({summaryData.correctCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFilter("partially_correct")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedFilter === "partially_correct"
                        ? "bg-amber-500 text-white shadow-xs"
                        : "bg-white text-amber-700 hover:bg-amber-50 border border-amber-200"
                    }`}
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Partially Correct ({summaryData.partiallyCorrectCount})</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedFilter("wrong")}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                      selectedFilter === "wrong"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "bg-white text-rose-700 hover:bg-rose-50 border border-rose-200"
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Needs Review ({summaryData.wrongCount})</span>
                  </button>
                </div>

                <span className="text-xs text-gray-500 font-medium">
                  Showing {filteredEvaluations.length} of {summaryData.totalQuestions} questions
                </span>
              </div>

              {/* ── QUESTION & ANSWER EVALUATION CARDS ── */}
              <div className="space-y-6">
                {filteredEvaluations.length === 0 ? (
                  <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-500 text-sm">
                    No questions match the selected filter.
                  </div>
                ) : (
                  filteredEvaluations.map((item) => {
                    const isCorrect = item.status === "correct";
                    const isPartial = item.status === "partially_correct";
                    const isModelExpanded =
                      showModelAnswerMap[item.questionNumber] ?? (!isCorrect);

                    return (
                      <div
                        key={item.qaId}
                        className={`bg-white rounded-2xl border transition-all shadow-xs overflow-hidden ${
                          isCorrect
                            ? "border-emerald-200 hover:border-emerald-300"
                            : isPartial
                            ? "border-amber-200 hover:border-amber-300"
                            : "border-rose-200 hover:border-rose-300"
                        }`}
                      >
                        {/* Card Header with Question Number, Category & Status Pill */}
                        <div
                          className={`p-4 sm:p-5 border-b flex flex-wrap items-center justify-between gap-3 ${
                            isCorrect
                              ? "bg-emerald-50/40 border-emerald-100"
                              : isPartial
                              ? "bg-amber-50/40 border-amber-100"
                              : "bg-rose-50/40 border-rose-100"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs ${
                                isCorrect
                                  ? "bg-emerald-600 text-white"
                                  : isPartial
                                  ? "bg-amber-500 text-white"
                                  : "bg-rose-500 text-white"
                              }`}
                            >
                              Q{item.questionNumber}
                            </span>
                            <span className="text-xs font-semibold text-gray-600">
                              {item.category || `Question #${item.questionNumber}`}
                            </span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-gray-600 px-2 py-0.5 bg-white border border-gray-200 rounded-md">
                              Score: {item.score}/100
                            </span>

                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${
                                isCorrect
                                  ? "bg-emerald-100 text-emerald-800 border-emerald-200"
                                  : isPartial
                                  ? "bg-amber-100 text-amber-800 border-amber-200"
                                  : "bg-rose-100 text-rose-800 border-rose-200"
                              }`}
                            >
                              {isCorrect ? (
                                <>
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>Correct Answer</span>
                                </>
                              ) : isPartial ? (
                                <>
                                  <AlertTriangle className="w-3.5 h-3.5" />
                                  <span>Partially Correct</span>
                                </>
                              ) : (
                                <>
                                  <XCircle className="w-3.5 h-3.5" />
                                  <span>Incorrect / Incomplete</span>
                                </>
                              )}
                            </span>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-5 sm:p-6 space-y-5">
                          {/* 1. Asked Question */}
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                              Asked Technical Question:
                            </span>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm sm:text-base font-semibold text-gray-900 leading-relaxed font-['Poppins',sans-serif]">
                              {item.questionText}
                            </div>
                          </div>

                          {/* 2. Candidate Answer */}
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                              Your Submitted Solution / Answer:
                            </span>
                            <div
                              className={`p-4 rounded-xl border text-xs sm:text-sm whitespace-pre-wrap leading-relaxed font-mono ${
                                isCorrect
                                  ? "bg-emerald-50/20 border-emerald-200 text-gray-800"
                                  : isPartial
                                  ? "bg-amber-50/20 border-amber-200 text-gray-800"
                                  : "bg-rose-50/20 border-rose-200 text-gray-800"
                              }`}
                            >
                              {item.userAnswer && item.userAnswer.trim() ? (
                                item.userAnswer
                              ) : (
                                <span className="italic text-rose-500">
                                  [No solution or code was provided for this question]
                                </span>
                              )}
                            </div>
                          </div>

                          {/* 3. AI Evaluator Feedback */}
                          {item.feedback && (
                            <div className="space-y-1.5">
                              <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                                AI Evaluator Feedback:
                              </span>
                              <div className="bg-blue-50/60 border border-blue-200/80 rounded-xl p-3.5 text-xs sm:text-sm text-blue-950 leading-relaxed">
                                {item.feedback}
                              </div>
                            </div>
                          )}

                          {/* 4. Correct Answer / Model Technical Solution */}
                          <div className="space-y-1.5 pt-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                                <Lightbulb className="w-3.5 h-3.5 text-emerald-600" />
                                {isCorrect
                                  ? "Model Technical Answer (Reference)"
                                  : "Correct Technical Solution (Study & Learn):"}
                              </span>
                              <button
                                type="button"
                                onClick={() => toggleModelAnswer(item.questionNumber)}
                                className="text-xs font-semibold text-[#0E8C86] hover:underline flex items-center gap-1 cursor-pointer"
                              >
                                <span>
                                  {isModelExpanded ? "Hide Model Solution" : "View Model Solution"}
                                </span>
                                {isModelExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>

                            {isModelExpanded && (
                              <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border-2 border-emerald-300/80 rounded-xl p-4 sm:p-5 text-xs sm:text-sm text-gray-900 leading-relaxed whitespace-pre-wrap font-sans shadow-inner">
                                <div className="flex items-center gap-2 mb-2 text-xs font-bold text-emerald-800">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span>Verified Correct Engineering Solution:</span>
                                </div>
                                <div className="text-gray-800 font-normal leading-relaxed">
                                  {item.correctAnswer}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* ── BOTTOM ACTIONS ── */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 mt-8">
                <div className="space-y-1 text-center sm:text-left">
                  <h4 className="text-sm font-bold text-[#0B3538] font-['Poppins',sans-serif]">
                    Ready to practice again or explore skill gaps?
                  </h4>
                  <p className="text-xs text-gray-500">
                    Your answers and ratings have been saved to your profile history.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await axiosInstance.post("/interview/reset");
                      } catch (e) {}
                      navigate("/interview-checkout");
                    }}
                    className="flex-1 sm:flex-initial py-2.5 px-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-gray-500" />
                    <span>New Interview</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleScrollToNextSteps}
                    className="flex-1 sm:flex-initial py-2.5 px-5 bg-gradient-to-r from-[#0E8C86] to-[#0A6B66] hover:from-[#0C7873] hover:to-[#085551] text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm hover:shadow"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    <span>Next Steps & Courses</span>
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  <Link
                    to="/dashboard"
                    className="flex-1 sm:flex-initial py-2.5 px-5 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                  >
                    <span>Back to Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* ── NEXT STEPS: SUGGESTED COURSES & CAREER ROADMAP ── */}
              <div ref={nextStepsRef}>
                <NextStepsRoadmap
                  jobRole={session?.job_role || summaryData?.session?.jobRole || "Senior Cloud & DevOps Software Engineer"}
                  targetCompany={session?.target_company || summaryData?.session?.targetCompany || "Enterprise Cloud Tech"}
                  overallScore={summaryData?.overallScore || 70}
                />
              </div>
            </div>
          )
        ) : (
          /* Dual Panel Technical Room */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
            {/* Left Panel: AI Technical Interviewer & Question (7 cols) */}
            <div className="lg:col-span-7 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs space-y-6">
              <div className="space-y-4">
                {/* AI Interviewer Bar */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-xl bg-[#0E8C86]/10 border border-[#0E8C86]/20 flex items-center justify-center text-[#0E8C86]">
                        <Cpu className="w-6 h-6" />
                      </div>
                      <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5 font-['Poppins',sans-serif]">
                        <span>AI Technical Evaluator</span>
                        <span className="text-[10px] bg-teal-50 text-[#0E8C86] px-2 py-0.5 rounded-full font-mono">
                          Live Active
                        </span>
                      </h3>
                      <p className="text-xs text-gray-500">
                        Assessing {session?.job_role} for {session?.target_company}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleToggleVoicePlayback}
                    className="p-2.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 transition-colors cursor-pointer"
                    title={isSpeakingAI ? "Mute question audio" : "Play question audio"}
                  >
                    {isSpeakingAI ? (
                      <VolumeX className="w-5 h-5 text-red-500" />
                    ) : (
                      <Volume2 className="w-5 h-5 text-[#0E8C86]" />
                    )}
                  </button>
                </div>

                {/* Category Pill */}
                {currentQuestion?.category && (
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50 text-amber-800 rounded-lg text-xs font-semibold border border-amber-200">
                    <Terminal className="w-3.5 h-3.5" />
                    <span>Focus: {currentQuestion.category}</span>
                  </div>
                )}

                {/* Question Box */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 space-y-3">
                  <p className="text-base sm:text-lg text-gray-900 font-medium leading-relaxed font-['Poppins',sans-serif]">
                    {currentQuestion?.text}
                  </p>

                  {/* Context Hint */}
                  {currentQuestion?.contextHint && (
                    <div className="flex items-start gap-2 text-xs text-gray-600 bg-white/80 p-2.5 rounded-lg border border-gray-200/80">
                      <HelpCircle className="w-4 h-4 text-[#0E8C86] shrink-0 mt-0.5" />
                      <span>{currentQuestion.contextHint}</span>
                    </div>
                  )}

                  {/* Code Snippet Box */}
                  {currentQuestion?.codeSnippet && (
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-gray-800 shadow-inner">
                      <pre>{currentQuestion.codeSnippet}</pre>
                    </div>
                  )}
                </div>

                {/* Verified Company Requirements Badges */}
                {companyRequirements && companyRequirements.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                      Verified {session?.target_company} Competencies:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {companyRequirements.slice(0, 8).map((req, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md text-[11px] font-medium transition-colors"
                          title={req.evidence_excerpt || req.requirement_name}
                        >
                          {req.requirement_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-gray-400 border-t border-gray-100 pt-3 flex items-center justify-between">
                <span>Technical Question {currentQNum} of 10</span>
                <span>Powered by Real-Time Company Intelligence</span>
              </div>
            </div>

            {/* Right Panel: Camera & Code/Text Answer Editor (5 cols) */}
            <div className="lg:col-span-5 bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs space-y-4">
              <div className="space-y-3">
                {/* Webcam Box */}
                <div className="relative aspect-video bg-gray-900 rounded-xl overflow-hidden border border-gray-300 shadow-xs">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover ${isVideoOff ? "hidden" : "block"}`}
                  />

                  {isVideoOff && (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 space-y-2">
                      <VideoOff className="w-8 h-8" />
                      <p className="text-xs">Camera is paused</p>
                    </div>
                  )}

                  {/* Floating Media Controls */}
                  <div className="absolute bottom-2.5 right-2.5 flex items-center gap-2 bg-black/60 backdrop-blur-xs p-1.5 rounded-xl">
                    <button
                      type="button"
                      onClick={toggleMic}
                      className={`p-2 rounded-lg text-white transition-colors cursor-pointer ${
                        isMicMuted ? "bg-red-500 hover:bg-red-600" : "hover:bg-white/20"
                      }`}
                      title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
                    >
                      {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                    </button>
                    <button
                      type="button"
                      onClick={toggleVideo}
                      className={`p-2 rounded-lg text-white transition-colors cursor-pointer ${
                        isVideoOff ? "bg-red-500 hover:bg-red-600" : "hover:bg-white/20"
                      }`}
                      title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                    >
                      {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Speech to Text Audio Recording Control */}
                <div className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleMicToggleRecord}
                      className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isListening
                          ? "bg-red-500 text-white animate-pulse"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {isListening ? (
                        <>
                          <Mic className="w-3.5 h-3.5" />
                          <span>Listening...</span>
                        </>
                      ) : (
                        <>
                          <Mic className="w-3.5 h-3.5" />
                          <span>Speak Answer</span>
                        </>
                      )}
                    </button>
                    <span className="text-[11px] text-gray-500">
                      {isListening ? "Transcribing speech..." : "Or type code below"}
                    </span>
                  </div>

                  {answerInput && (
                    <button
                      type="button"
                      onClick={() => setAnswerInput("")}
                      className="text-[11px] text-gray-400 hover:text-red-600 transition-colors cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                </div>

                {/* Code / Text Answer Editor */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                    <Code2 className="w-3.5 h-3.5 text-[#0E8C86]" />
                    <span>Your Technical Solution / Code Answer:</span>
                  </label>
                  <textarea
                    rows={7}
                    value={answerInput}
                    onChange={(e) => setAnswerInput(e.target.value)}
                    placeholder="Type your technical explanation, architectural approach, algorithm, or code snippet here..."
                    className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm font-mono text-gray-900 focus:ring-2 focus:ring-[#0E8C86]/30 focus:border-[#0E8C86] outline-none transition-all resize-y"
                  ></textarea>
                </div>
              </div>

              {/* Submit Action */}
              <button
                type="button"
                onClick={handleSubmitAnswer}
                disabled={isSubmitting || !answerInput.trim()}
                className="w-full py-3 px-5 bg-[#0E8C86] hover:bg-[#0C7873] active:bg-[#0A625E] text-white font-semibold rounded-xl shadow-xs transition-all flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Evaluating & Generating Question {currentQNum < 10 ? currentQNum + 1 : 10}...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Answer ({currentQNum} of 10)</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
