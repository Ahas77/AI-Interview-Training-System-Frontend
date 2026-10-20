import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
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
  ArrowRight,
  RefreshCw,
  Briefcase,
  Building2,
  Code2,
  Terminal,
  Cpu,
  Layers,
  ChevronDown,
  Bell,
  Settings,
  User,
  LogOut,
  HelpCircle,
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

  const fetchTechnicalSession = async (id: string) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/interview/technical/session/${id}`);
      if (res.data && res.data.success) {
        setSession(res.data.session);
        if (res.data.companyRequirements) {
          setCompanyRequirements(res.data.companyRequirements);
        }
        if (res.data.session.status === "completed" || res.data.session.status === "technical_completed") {
          setIsCompleted(true);
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
          const thankYouText =
            "Congratulations on completing all 10 questions in your technical interview round! Your responses have been recorded.";
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

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="text-right">
              <span className="text-xs font-bold text-[#0B3538] font-mono">
                Question {currentQNum} of {totalQ}
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

        {/* Completed State */}
        {isCompleted ? (
          <div className="max-w-xl w-full mx-auto bg-white border border-gray-200 rounded-3xl p-8 text-center space-y-6 shadow-md my-auto">
            <div className="w-20 h-20 rounded-full bg-[#0E8C86]/10 border-2 border-[#0E8C86] flex items-center justify-center mx-auto text-[#0E8C86] shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-[#0E8C86]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#0B3538] font-['Poppins',sans-serif]">
                Technical Interview Completed!
              </h2>
              <p className="text-gray-600 text-sm font-medium">
                You have successfully completed all 10 technical questions for {session?.target_company}.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left space-y-2 text-xs text-gray-600">
              <p className="font-semibold text-gray-800">
                ✅ HR Questionnaire Round: Complete (5 Questions)
              </p>
              <p className="font-semibold text-gray-800">
                ✅ Technical Questionnaire Round: Complete (10 Questions)
              </p>
              <p className="pt-2 text-gray-500">
                Your code solutions, architectural trade-offs, and voice explanations have been recorded. Our AI evaluator will compile your skill gap & performance matrix.
              </p>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Link
                to="/dashboard"
                className="flex-1 py-3 px-6 bg-[#0E8C86] hover:bg-[#0C7873] text-white font-bold rounded-xl shadow-sm hover:shadow transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={async () => {
                  try {
                    await axiosInstance.post("/interview/reset");
                  } catch (e) {}
                  navigate("/interview-checkout");
                }}
                className="py-3 px-6 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-gray-500" />
                <span>New Interview</span>
              </button>
            </div>
          </div>
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
