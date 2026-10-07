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
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
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
  text: string;
  userAnswer?: string;
}

interface SessionData {
  id: number;
  job_role: string;
  target_company?: string;
  expertise_level: string;
  total_questions: number;
  current_question_index: number;
  status: string;
}

export default function HRSessionPage() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

  // User state for header
  const userName = getStoredValue("name") || "User";
  const userAvatar = getStoredValue("avatar");
  const userEmail = getStoredValue("email") || "user@example.com";
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Media Hooks
  const { videoRef, hasPermission, isMicMuted, isVideoOff, toggleMic, toggleVideo } = useWebcamMic();
  const { transcript, setTranscript, isListening, isSupported, startListening, stopListening, resetTranscript } = useSpeechToText();
  const { isPlaying: isSpeakingAI, speakQuestion, stopSpeaking } = useTextToSpeech();

  // Page States
  const [session, setSession] = useState<SessionData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [answerInput, setAnswerInput] = useState("");
  const [autoPlayAudio, setAutoPlayAudio] = useState(true);

  // Synchronize transcript from SpeechToText hook to input box
  useEffect(() => {
    if (transcript) {
      setAnswerInput(transcript);
    }
  }, [transcript]);

  // Fetch session on load
  useEffect(() => {
    if (sessionId) {
      fetchSessionData(sessionId);
    }
  }, [sessionId]);

  // Auto-speak question when currentQuestion changes
  useEffect(() => {
    if (currentQuestion && currentQuestion.text && autoPlayAudio && !isCompleted) {
      const timer = setTimeout(() => {
        speakQuestion(currentQuestion.text);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentQuestion, autoPlayAudio, speakQuestion, isCompleted]);

  const fetchSessionData = async (id: string) => {
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/interview/session/${id}`);
      if (res.data && res.data.success) {
        setSession(res.data.session);
        if (res.data.session.status === "completed") {
          setIsCompleted(true);
        } else if (res.data.currentQuestion) {
          setCurrentQuestion(res.data.currentQuestion);
          setAnswerInput(res.data.currentQuestion.userAnswer || "");
        }
      } else {
        toast.error("Failed to load interview session.");
      }
    } catch (err: any) {
      console.error("Fetch session error:", err);
      toast.error(err.response?.data?.message || "Error fetching interview session.");
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
      toast.warning("Speech Recognition is not supported in this browser. You can type your response below.");
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
      toast.info("Please provide an answer (speak into the mic or type your response).");
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        sessionId: parseInt(sessionId, 10),
        qaId: currentQuestion.id,
        userAnswerText: finalAnswerText,
      };

      const res = await axiosInstance.post("/interview/submit-answer", payload);

      if (res.data && res.data.success) {
        if (res.data.isCompleted) {
          setIsCompleted(true);
          const thankYouText =
            "Thank you for completing your HR interview round! Your responses have been recorded successfully.";
          speakQuestion(thankYouText);
          toast.success("HR Interview Completed!");
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
        }
      } else {
        toast.error(res.data?.message || "Failed to submit answer.");
      }
    } catch (err: any) {
      console.error("Submit answer error:", err);
      toast.error(err.response?.data?.message || "Could not send answer. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50/70 flex items-center justify-center text-gray-800 font-['Roboto','Poppins',sans-serif]">
        <div className="text-center space-y-4 bg-white p-8 rounded-2xl border border-gray-200 shadow-sm">
          <Loader2 className="w-10 h-10 text-[#0E8C86] animate-spin mx-auto" />
          <p className="text-base font-semibold text-[#0B3538]">Preparing Your HR Interview Room...</p>
          <p className="text-xs text-gray-500">Configuring AI HR Agent and CV context...</p>
        </div>
      </div>
    );
  }

  const totalQ = session?.total_questions || 5;
  const currentQNum = currentQuestion?.questionNumber || session?.current_question_index || 1;
  const progressPercent = Math.min((currentQNum / totalQ) * 100, 100);

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-['Roboto','Poppins',sans-serif]">
      {/* ── HEADER NAVIGATION BAR (MATCHING SYSTEM LIGHT THEME) ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Brand Logo & Nav Links */}
          <div className="flex items-center gap-8">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#0E8C86] flex items-center justify-center text-white font-bold shadow-xs">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-[#0B3538] tracking-tight font-['Poppins',sans-serif]">
                Interview<span className="text-[#0E8C86]">AI</span>
              </span>
            </Link>

            {/* Navigation items */}
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-[#0E8C86] transition-colors py-2"
              >
                Dashboard
              </Link>
              <Link
                to="/interview-checkout"
                className="text-[#0E8C86] font-semibold border-b-2 border-[#0E8C86] py-2"
              >
                Interview
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-[#0E8C86] transition-colors py-2"
              >
                Results
              </Link>
              <Link
                to="/dashboard"
                className="text-gray-600 hover:text-[#0E8C86] transition-colors py-2"
              >
                Skill Gaps
              </Link>
            </nav>
          </div>

          {/* Right: Actions & User Avatar */}
          <div className="flex items-center gap-4">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-[#0E8C86] hover:bg-gray-100 rounded-full transition-colors relative cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>

            <button
              type="button"
              className="p-2 text-gray-500 hover:text-[#0E8C86] hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
              title="Settings"
            >
              <Settings className="w-5 h-5" />
            </button>

            {/* User Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-full hover:bg-gray-100 transition-colors cursor-pointer"
              >
                {userAvatar && userAvatar !== "null" ? (
                  <img
                    src={userAvatar}
                    alt={userName}
                    className="w-8 h-8 rounded-full object-cover border border-teal-200"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#0E8C86]/10 text-[#0E8C86] flex items-center justify-center font-bold text-sm">
                    {userName.charAt(0).toUpperCase()}
                  </div>
                )}
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                  <div className="px-4 py-2.5 border-b border-gray-100">
                    <p className="text-sm font-semibold text-gray-900 truncate">
                      {userName}
                    </p>
                    <p className="text-xs text-gray-500 truncate">{userEmail}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0E8C86]"
                  >
                    <User className="w-4 h-4" />
                    Dashboard
                  </Link>

                  <Link
                    to="/profile"
                    onClick={() => setIsDropdownOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#0E8C86]"
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-600 hover:bg-red-50 text-left cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ── MAIN CONTAINER ── */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-6">

        {/* ── SESSION SUB-HEADER BANNER (LIGHT THEME) ── */}
        <div className="bg-white border border-gray-200/90 rounded-2xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-lg sm:text-xl font-bold text-[#0B3538] font-['Poppins',sans-serif] flex items-center gap-2">
              <span>AI HR Questionnaire Round</span>
              <span className="px-2.5 py-0.5 rounded-full bg-[#0E8C86]/10 text-[#0E8C86] text-xs font-semibold">
                Live Active Session
              </span>
            </h1>
            <div className="flex items-center gap-3 text-xs text-gray-500 font-medium">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-[#0E8C86]" /> {session?.job_role || "Software Engineer"}
              </span>
              {session?.target_company && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-gray-600">
                    <Building2 className="w-3.5 h-3.5 text-gray-400" /> {session.target_company}
                  </span>
                </>
              )}
              <span>•</span>
              <span className="text-gray-500">Level: {session?.expertise_level || "Intermediate"}</span>
            </div>
          </div>

          <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-gray-100">
            <div className="flex flex-col items-end gap-1.5 min-w-[140px]">
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-700">
                <span>Question {currentQNum} of {totalQ}</span>
              </div>
              <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden border border-gray-200/80">
                <div
                  className="bg-[#0E8C86] h-full transition-all duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <button
              onClick={() => {
                if (window.confirm("Are you sure you want to end this interview session?")) {
                  navigate("/interview-checkout");
                }
              }}
              className="px-3.5 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 border border-red-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>End Session</span>
            </button>
          </div>
        </div>

        {/* ── COMPLETED STATE ("THANK YOU" SCREEN) ── */}
        {isCompleted ? (
          <div className="max-w-xl w-full mx-auto bg-white border border-gray-200 rounded-3xl p-8 text-center space-y-6 shadow-md my-auto animate-fade-in">
            <div className="w-20 h-20 rounded-full bg-[#0E8C86]/10 border-2 border-[#0E8C86] flex items-center justify-center mx-auto text-[#0E8C86] shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-[#0E8C86]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-[#0B3538] font-['Poppins',sans-serif]">
                Interview Completed!
              </h2>
              <p className="text-gray-600 text-sm font-medium">
                Thank you for completing your HR questionnaire round.
              </p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5 text-left space-y-3">
              <div className="flex items-center justify-between text-xs text-gray-700 pb-2 border-b border-gray-200 font-semibold">
                <span className="flex items-center gap-1.5 text-[#0E8C86]">
                  <Briefcase className="w-4 h-4" /> Role: {session?.job_role || "Software Engineer"}
                </span>
                {session?.target_company && (
                  <span className="flex items-center gap-1 text-gray-500">
                    <Building2 className="w-3.5 h-3.5" /> {session.target_company}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-600 leading-relaxed">
                Your responses have been saved in the database. Our HR team and evaluation algorithm will review your session logs.
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
              <Link
                to="/interview-checkout"
                className="py-3 px-6 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold rounded-xl transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4 text-gray-500" />
                <span>New Interview</span>
              </Link>
            </div>
          </div>
        ) : (
          /* ── ACTIVE INTERVIEW DUAL-PANEL LAYOUT (LIGHT THEME) ── */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">

            {/* ── LEFT PANEL: AI HR AGENT HUB (7 cols) ── */}
            <div className="lg:col-span-7 bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs space-y-6">
              <div className="space-y-5">
                {/* HR Agent Header & Audio Status */}
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-xl bg-[#0E8C86] flex items-center justify-center text-white font-bold text-base shadow-xs">
                        HR
                      </div>
                      {isSpeakingAI && (
                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0E8C86] opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-[#0E8C86]"></span>
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900 flex items-center gap-2 font-['Poppins',sans-serif]">
                        <span>Senior HR AI Interviewer</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-50 text-[#0E8C86] border border-teal-200 font-medium">
                          Active Agent
                        </span>
                      </h2>
                      <p className="text-xs text-gray-500">
                        {isSpeakingAI ? "🔊 Speaking question..." : "Waiting for your response..."}
                      </p>
                    </div>
                  </div>

                  {/* Audio Toggle & Replay */}
                  <button
                    type="button"
                    onClick={handleToggleVoicePlayback}
                    className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-xs border ${
                      isSpeakingAI
                        ? "bg-[#0E8C86]/10 text-[#0E8C86] border-[#0E8C86]/30 animate-pulse"
                        : "bg-white text-gray-700 hover:text-[#0E8C86] hover:bg-teal-50/50 border-gray-300"
                    }`}
                    title={isSpeakingAI ? "Stop Speaker" : "Replay Question Audio"}
                  >
                    {isSpeakingAI ? (
                      <>
                        <VolumeX className="w-4 h-4 text-[#0E8C86]" />
                        <span>Mute Voice</span>
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-[#0E8C86]" />
                        <span>Replay Question</span>
                      </>
                    )}
                  </button>
                </div>

                {/* HR Question Card */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 rounded-lg bg-[#0E8C86]/10 text-[#0E8C86] text-xs font-semibold border border-[#0E8C86]/20">
                      Question #{currentQNum}
                    </span>
                    <span className="text-xs text-gray-400">Tailored to candidate's CV</span>
                  </div>

                  <div className="bg-[#0E8C86]/5 border border-[#0E8C86]/20 rounded-2xl p-5 shadow-2xs">
                    <p className="text-base sm:text-lg font-semibold text-gray-900 leading-relaxed font-['Poppins',sans-serif]">
                      "{currentQuestion?.text || "Generating next question..."}"
                    </p>
                  </div>
                </div>
              </div>

              {/* Audio Controls & Visualizer */}
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-medium text-gray-600">AI Voice Speaker Ready</span>
                </div>
                <label className="flex items-center gap-2 cursor-pointer text-gray-600 select-none hover:text-gray-900 transition-colors">
                  <input
                    type="checkbox"
                    checked={autoPlayAudio}
                    onChange={(e) => setAutoPlayAudio(e.target.checked)}
                    className="rounded bg-white border-gray-300 text-[#0E8C86] focus:ring-[#0E8C86]"
                  />
                  <span className="text-xs">Auto-play speaker on new question</span>
                </label>
              </div>
            </div>

            {/* ── RIGHT PANEL: WEBCAM & MIC STREAM (5 cols) ── */}
            <div className="lg:col-span-5 bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 flex flex-col justify-between shadow-xs space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 font-['Poppins',sans-serif]">
                    <Video className="w-4 h-4 text-[#0E8C86]" />
                    <span>Candidate Video Feed</span>
                  </h3>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold flex items-center gap-1.5 ${
                      hasPermission
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "bg-amber-50 text-amber-700 border border-amber-200"
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${hasPermission ? "bg-emerald-600 animate-pulse" : "bg-amber-600"}`} />
                    {hasPermission ? "Live Stream" : "No Camera"}
                  </span>
                </div>

                {/* Video Player Box */}
                <div className="relative aspect-video bg-slate-900 rounded-xl overflow-hidden border border-gray-200 shadow-inner flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transform -scale-x-100 ${
                      isVideoOff || !hasPermission ? "hidden" : "block"
                    }`}
                  />

                  {(isVideoOff || !hasPermission) && (
                    <div className="text-center p-6 space-y-2">
                      <div className="w-14 h-14 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                        <VideoOff className="w-7 h-7" />
                      </div>
                      <p className="text-xs text-slate-300 font-medium">
                        {hasPermission === false
                          ? "Camera permission denied or unavailable"
                          : "Video stream is currently paused"}
                      </p>
                    </div>
                  )}

                  {/* Overlaid Mic Indicator */}
                  <div className="absolute bottom-3 left-3 px-3 py-1 bg-slate-900/85 backdrop-blur-md rounded-lg text-[11px] font-mono font-medium text-white border border-slate-700/60 flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isListening ? "bg-red-500 animate-ping" : "bg-emerald-400"}`} />
                    <span>{isListening ? "Recording Voice..." : "Mic Ready"}</span>
                  </div>
                </div>
              </div>

              {/* Quick Media Controls */}
              <div className="flex items-center justify-center gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={toggleMic}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer border shadow-2xs ${
                    isMicMuted
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-white text-gray-700 hover:text-[#0E8C86] border-gray-300 hover:bg-gray-50"
                  }`}
                  title={isMicMuted ? "Unmute Mic" : "Mute Mic"}
                >
                  {isMicMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>

                <button
                  type="button"
                  onClick={toggleVideo}
                  className={`p-2.5 rounded-xl transition-all cursor-pointer border shadow-2xs ${
                    isVideoOff
                      ? "bg-red-50 text-red-600 border-red-200"
                      : "bg-white text-gray-700 hover:text-[#0E8C86] border-gray-300 hover:bg-gray-50"
                  }`}
                  title={isVideoOff ? "Turn Video On" : "Turn Video Off"}
                >
                  {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* ── BOTTOM RESPONSE PANEL (SPEECH & TEXT INPUT - LIGHT THEME) ── */}
            <div className="lg:col-span-12 bg-white border border-gray-200/90 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-900 font-['Poppins',sans-serif]">Your Answer:</h3>
                  {isListening && (
                    <span className="text-xs text-red-600 flex items-center gap-1 font-semibold animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Recording voice live...
                    </span>
                  )}
                </div>

                <button
                  type="button"
                  onClick={handleMicToggleRecord}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-xs ${
                    isListening
                      ? "bg-red-600 hover:bg-red-700 text-white animate-pulse"
                      : "bg-[#0E8C86] hover:bg-[#0C7873] text-white"
                  }`}
                >
                  {isListening ? (
                    <>
                      <MicOff className="w-4 h-4" />
                      <span>Stop Recording Voice</span>
                    </>
                  ) : (
                    <>
                      <Mic className="w-4 h-4" />
                      <span>Click to Speak Answer</span>
                    </>
                  )}
                </button>
              </div>

              {/* Textarea for transcript review or manual typing */}
              <div className="relative">
                <textarea
                  value={answerInput}
                  onChange={(e) => setAnswerInput(e.target.value)}
                  placeholder="Speak using the microphone button above or type your answer here..."
                  rows={3}
                  className="w-full p-4 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-400 text-xs sm:text-sm focus:outline-none focus:border-[#0E8C86] focus:ring-2 focus:ring-[#0E8C86]/20 transition-all resize-none font-sans"
                />
              </div>

              {/* Action Row */}
              <div className="flex items-center justify-between flex-wrap gap-3 pt-1">
                <span className="text-xs text-gray-500">
                  Your answer will be stored directly in the database for the HR team.
                </span>

                <button
                  type="button"
                  onClick={handleSubmitAnswer}
                  disabled={isSubmitting || !answerInput.trim()}
                  className="px-6 py-2.5 bg-[#0E8C86] hover:bg-[#0C7873] disabled:opacity-50 text-white font-semibold rounded-xl shadow-xs transition-all flex items-center gap-2 text-xs sm:text-sm cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Submitting & Generating Next Question...</span>
                    </>
                  ) : (
                    <>
                      <span>Submit Answer & Next Question</span>
                      <Send className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
