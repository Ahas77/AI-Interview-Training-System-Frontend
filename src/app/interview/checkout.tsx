import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FileText,
  Upload,
  CheckCircle2,
  Building2,
  Briefcase,
  GraduationCap,
  Bell,
  Settings,
  User,
  LogOut,
  ChevronDown,
  ArrowRight,
  Sparkles,
  Loader2,
  AlertCircle,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { toast } from "react-toastify";
import { clearAuthStorage, getStoredValue } from "../lib/authStorage";
import { usePageMetadata } from "../../context/PageContext";
import axiosInstance from "../lib/axiosInstance";
import { CVAnalysisCard, ParsedCVData } from "./CVAnalysisCard";

export default function InterviewCheckoutPage() {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { setPageMetadata } = usePageMetadata();


  const userName = getStoredValue("name") || "User";
  const userAvatar = getStoredValue("avatar");
  const userEmail = getStoredValue("email") || "user@example.com";

  const [cvFile, setCvFile] = useState<{ name: string; size?: string } | null>(null);
  const [company, setCompany] = useState("");
  const [customCompany, setCustomCompany] = useState("");
  const [location, setLocation] = useState("Sri Lanka");
  const [jobRole, setJobRole] = useState("Software Engineer");
  const [expertiseLevel, setExpertiseLevel] = useState("Intermediate");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  const [isSearchingReqs, setIsSearchingReqs] = useState(false);
  const [verifiedReqs, setVerifiedReqs] = useState<any[]>([]);
  const [verifiedPostingInfo, setVerifiedPostingInfo] = useState<{
    isVerified: boolean;
    sourceUrl?: string;
    jobTitle?: string;
    message?: string;
    jobPostingId?: number | null;
  } | null>(null);

  // CV Processing UI States: idle | uploading | extracting | ocr | analyzing | success | error
  const [uploadState, setUploadState] = useState<
    "idle" | "uploading" | "extracting" | "ocr" | "analyzing" | "success" | "error"
  >("idle");
  const [uploadProgressMsg, setUploadProgressMsg] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [cvAnalysisData, setCvAnalysisData] = useState<ParsedCVData | null>(null);
  const [isAutoApplied, setIsAutoApplied] = useState(false);

  const timer1Ref = useRef<NodeJS.Timeout | null>(null);
  const timer2Ref = useRef<NodeJS.Timeout | null>(null);

  const clearTimers = () => {
    if (timer1Ref.current) clearTimeout(timer1Ref.current);
    if (timer2Ref.current) clearTimeout(timer2Ref.current);
  };

  useEffect(() => {
    setPageMetadata({
      title: "Interview Setup",
      subtitle: "Start your personalized interview session",
    });

    const checkStatusAndLoad = async () => {
      try {
        const statusRes = await axiosInstance.get("/interview/user-status");
        if (statusRes.data && statusRes.data.success) {
          if (
            statusRes.data.interview_status === "technical_pending" &&
            statusRes.data.active_session_id
          ) {
            toast.info("Resuming your AI Technical Questionnaire Round (10 Questions)...");
            navigate(`/interview/technical/session/${statusRes.data.active_session_id}`, { replace: true });
            return;
          }

          if (
            statusRes.data.interview_status === "hr_pending" &&
            statusRes.data.active_session_id
          ) {
            toast.info("Resuming your active AI HR Questionnaire Round...");
            navigate(`/interview/session/${statusRes.data.active_session_id}`, { replace: true });
            return;
          }
        }
      } catch (statusErr) {
        console.error("Error checking user interview status:", statusErr);
      }

      fetchLatestCV();
    };

    checkStatusAndLoad();

    return () => {
      clearTimers();
    };
  }, [setPageMetadata, navigate]);

  const fetchLatestCV = async () => {
    try {
      const response = await axiosInstance.get("/cv/latest");
      if (response.data && response.data.success && response.data.data) {
        const latest = response.data.data;
        setCvAnalysisData(latest);
        setCvFile({ name: latest.file_name || "Uploaded_CV.pdf" });
        setUploadState("success");
      }
    } catch (err) {
      setUploadState("idle");
    }
  };

  const handleClearCV = () => {
    clearTimers();
    setCvFile(null);
    setCvAnalysisData(null);
    setUploadState("idle");
    setIsAutoApplied(false);
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    toast.info("CV analysis cleared.");
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size exceeds the 10MB limit.");
      return;
    }

    clearTimers();
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1) + " MB";
    setCvFile({ name: file.name, size: sizeInMB });
    setIsAutoApplied(false);
    setErrorMessage("");

    setUploadState("uploading");
    setUploadProgressMsg("Uploading your CV...");

    timer1Ref.current = setTimeout(() => {
      setUploadState("extracting");
      setUploadProgressMsg("Extracting CV text...");
    }, 600);

    timer2Ref.current = setTimeout(() => {
      setUploadState("analyzing");
      setUploadProgressMsg("Analyzing CV structure & skills with AI...");
    }, 1500);

    const formData = new FormData();
    formData.append("cv", file);

    try {
      const res = await axiosInstance.post("/cv/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      clearTimers();

      if (res.data && res.data.success) {
        const data = res.data.data;
        setCvAnalysisData(data);

        if (data.extraction_method === "pdf-ocr") {
          toast.info("Scanned CV detected. Extracted text via Tesseract OCR.");
        }

        setUploadState("success");
        toast.success("CV analyzed successfully!");
      } else {
        throw new Error(res.data?.message || "Failed to process CV");
      }
    } catch (error: any) {
      clearTimers();
      console.error("CV Upload error:", error);
      setUploadState("error");
      const errMsg =
        error.response?.data?.message || error.message || "Unable to analyze this CV right now. Please try again.";
      setErrorMessage(errMsg);
      toast.error(errMsg);
    }
  };

  const handleAutoApply = () => {
    if (!cvAnalysisData) return;

    const suggestedRoles =
      cvAnalysisData.suggested_job_roles ||
      (cvAnalysisData.suggested_role ? [cvAnalysisData.suggested_role] : []);
    const detectedRoleStr = suggestedRoles.length > 0 ? suggestedRoles[0] : "";

    if (/full\s*stack/i.test(detectedRoleStr)) {
      setJobRole("Full Stack Developer");
    } else if (/frontend|react|vue|ui|web/i.test(detectedRoleStr)) {
      setJobRole("Frontend Engineer");
    } else if (/backend|node|express|laravel|spring|java/i.test(detectedRoleStr)) {
      setJobRole("Backend Engineer");
    } else if (/qa|test|automation|quality/i.test(detectedRoleStr)) {
      setJobRole("QA / Test Automation Engineer");
    } else if (/devops|cloud|aws|kubernetes/i.test(detectedRoleStr)) {
      setJobRole("DevOps / Cloud Engineer");
    } else if (/mobile|ios|android|flutter|react native/i.test(detectedRoleStr)) {
      setJobRole("Mobile Application Developer");
    } else if (/data|ai|machine learning|python/i.test(detectedRoleStr)) {
      setJobRole("Data Engineer / AI Engineer");
    } else {
      setJobRole("Software Engineer");
    }

    const levelStr =
      cvAnalysisData.expertise_level ||
      cvAnalysisData.suggested_level ||
      (cvAnalysisData.parsed_data?.expertise_level ?? "");
    const expYears = cvAnalysisData.experience_years ?? cvAnalysisData.parsed_data?.experience_years ?? 0;

    if (/senior/i.test(levelStr) || expYears >= 5) {
      setExpertiseLevel("Senior");
    } else if (/lead|architect|principal|manager/i.test(levelStr)) {
      setExpertiseLevel("Lead Architect");
    } else if (/junior|intern|beginner/i.test(levelStr) || expYears <= 1) {
      setExpertiseLevel("Beginner");
    } else {
      setExpertiseLevel("Intermediate");
    }

    setIsAutoApplied(true);
    toast.success("Auto-applied CV analysis to interview setup!");
  };

  const handleLogout = () => {
    clearAuthStorage();
    toast.info("Logged out successfully");
    navigate("/signin");
  };

  const getSelectedCompany = () => {
    if (company === "Other") return customCompany.trim();
    return company.trim();
  };

  const handleVerifyRequirements = async () => {
    const activeComp = getSelectedCompany();
    if (!activeComp) {
      toast.info("Please select or enter a target company first.");
      return;
    }

    setIsSearchingReqs(true);
    setVerifiedPostingInfo(null);
    setVerifiedReqs([]);

    try {
      const res = await axiosInstance.post("/company-requirements/search", {
        company: activeComp,
        jobRole,
        seniority: expertiseLevel,
        location,
      });

      if (res.data && res.data.success) {
        setVerifiedPostingInfo({
          isVerified: res.data.isVerified,
          sourceUrl: res.data.sourceUrl,
          jobTitle: res.data.jobTitle,
          message: res.data.message,
          jobPostingId: res.data.jobPostingId,
        });

        if (Array.isArray(res.data.requirements)) {
          setVerifiedReqs(res.data.requirements);
        }

        if (res.data.isVerified) {
          toast.success(`Verified ${res.data.requirements.length} real hiring requirements for ${activeComp}!`);
        } else {
          toast.info(res.data.message || `No active job posting found for ${activeComp}. Standard criteria will be used.`);
        }
      }
    } catch (e: any) {
      console.error("Requirement search error:", e);
      toast.error(e.response?.data?.message || "Could not search company requirements.");
    } finally {
      setIsSearchingReqs(false);
    }
  };

  const handleStartInterview = async () => {
    setIsStarting(true);
    const activeComp = getSelectedCompany();

    try {
      const payload = {
        cvData: cvAnalysisData,
        cvId: cvAnalysisData?.id || null,
        company: activeComp || null,
        jobRole: jobRole || "Software Engineer",
        expertiseLevel: expertiseLevel || "Intermediate",
        location,
        jobPostingId: verifiedPostingInfo?.jobPostingId || null,
      };

      const res = await axiosInstance.post("/interview/start", payload);

      if (res.data && res.data.success && res.data.sessionId) {
        toast.success("Interview session initialized! Joining HR Room...");
        setTimeout(() => {
          navigate(`/interview/session/${res.data.sessionId}`);
        }, 500);
      } else {
        throw new Error(res.data?.message || "Failed to start interview session");
      }
    } catch (error: any) {
      console.error("Start interview error:", error);
      const errMsg =
        error.response?.data?.message || "Could not start interview session. Please try again.";
      toast.error(errMsg);
      setIsStarting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 flex flex-col font-['Roboto','Poppins',sans-serif]">
      {/* ── HEADER NAVIGATION BAR ── */}
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

      {/* ── MAIN CONTENT AREA ── */}
      <main className="flex-1 py-6 sm:py-8 px-4 sm:px-6 lg:px-12 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
          {/* Header Title */}
          <div className="text-center space-y-1.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#0B3538] tracking-tight font-['Poppins',sans-serif]">
              Start Your Personalized Interview
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm">
              Upload your resume and set your target context to generate tailored AI evaluation questions.
            </p>
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* ── CARD 1: CV UPLOAD & PROCESSOR ── */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 font-['Poppins',sans-serif]">
              <FileText className="w-5 h-5 text-[#0E8C86]" />
              Upload Your CV / Resume 
            </h2>

            {/* Upload States Rendering */}
            {uploadState === "uploading" || uploadState === "extracting" || uploadState === "analyzing" || uploadState === "ocr" ? (
              <div className="p-6 bg-teal-50/50 border border-teal-200 rounded-xl text-center space-y-3 animate-pulse">
                <Loader2 className="w-8 h-8 text-[#0E8C86] animate-spin mx-auto" />
                <div>
                  <p className="text-sm font-semibold text-[#0B3538]">{uploadProgressMsg}</p>
                  <p className="text-xs text-gray-500 mt-1 font-mono">{cvFile?.name}</p>
                </div>
              </div>
            ) : uploadState === "error" ? (
              <div className="p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-red-700 font-semibold text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <span>CV Processing Failed</span>
                </div>
                <p className="text-xs text-red-600">{errorMessage}</p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 text-xs font-semibold text-red-700 bg-white border border-red-300 rounded-lg hover:bg-red-100 flex items-center gap-1.5 cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Try Uploading Again
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCV}
                    className="px-3 py-1.5 text-xs font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    Clear Error
                  </button>
                </div>
              </div>
            ) : cvFile ? (
              <div className="flex flex-row items-center justify-between p-3.5 sm:p-4 bg-[#0E8C86]/5 border border-[#0E8C86]/20 rounded-xl gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-white border border-teal-200 flex items-center justify-center text-[#0E8C86] shrink-0 shadow-xs">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-semibold text-gray-900 text-xs sm:text-sm truncate">
                        CV Uploaded & Processed
                      </h3>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    </div>
                    <p className="text-xs text-gray-500 truncate mt-0.5 font-mono">
                      {cvFile.name} {cvFile.size && `(${cvFile.size})`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-[#0E8C86] transition-colors shadow-xs cursor-pointer"
                  >
                    Change CV
                  </button>
                  <button
                    type="button"
                    onClick={handleClearCV}
                    className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 transition-colors shadow-xs cursor-pointer flex items-center gap-1"
                    title="Clear CV Analysis"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 hover:border-[#0E8C86] bg-gray-50/50 hover:bg-teal-50/30 rounded-xl p-6 text-center cursor-pointer transition-all"
              >
                <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                <p className="text-xs sm:text-sm font-semibold text-gray-800">
                  Click to upload or drag & drop your CV
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">PDF, DOC, or DOCX (Max 10MB)</p>
              </div>
            )}

            {/* Parsed CV Analysis Card */}
            {cvAnalysisData && uploadState === "success" && (
              <div className="mt-4">
                <CVAnalysisCard
                  data={cvAnalysisData}
                  onAutoApply={handleAutoApply}
                  onClear={handleClearCV}
                  isApplied={isAutoApplied}
                />
              </div>
            )}
          </div>

          {/* ── CARD 2: INTERVIEW CONTEXT ── */}
          <div className="bg-white rounded-2xl border border-gray-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 flex items-center gap-2 font-['Poppins',sans-serif]">
              <Briefcase className="w-5 h-5 text-[#0E8C86]" />
              Interview Context
            </h2>

            <div className="space-y-4">
              {/* Target Company */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  Target Company:
                </label>
                <select
                  value={company}
                  onChange={(e) => {
                    setCompany(e.target.value);
                    setVerifiedPostingInfo(null);
                    setVerifiedReqs([]);
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#0E8C86]/30 focus:border-[#0E8C86] outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="">Select target company (Optional)</option>
                  <option value="Google">Google</option>
                  <option value="Microsoft">Microsoft</option>
                  <option value="Virtusa">Virtusa</option>
                  <option value="WSO2">WSO2</option>
                  <option value="IFS">IFS</option>
                  <option value="Dialog Axiata">Dialog Axiata</option>
                  <option value="Sysco LABS">Sysco LABS</option>
                  <option value="Other">Other / Type Any Company Name...</option>
                </select>

                {company === "Other" && (
                  <input
                    type="text"
                    value={customCompany}
                    onChange={(e) => {
                      setCustomCompany(e.target.value);
                      setVerifiedPostingInfo(null);
                    }}
                    placeholder="Enter company name (e.g. Amazon, Uber, Atlassian, PickMe)..."
                    className="mt-2 w-full px-3.5 py-2.5 bg-white border border-teal-300 rounded-xl text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#0E8C86]/30 focus:border-[#0E8C86] outline-none transition-all"
                  />
                )}
              </div>

              {/* Preferred Location */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  Hiring Location / Office:
                </label>
                <select
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#0E8C86]/30 focus:border-[#0E8C86] outline-none transition-all cursor-pointer"
                >
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="Remote">Remote</option>
                  <option value="Global">Global / Any</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Singapore">Singapore</option>
                </select>
              </div>

              {/* Job Role */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" />
                  Job Role:
                </label>
                <select
                  value={jobRole}
                  onChange={(e) => {
                    setJobRole(e.target.value);
                    setVerifiedPostingInfo(null);
                  }}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#0E8C86]/30 focus:border-[#0E8C86] outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="Software Engineer">Software Engineer</option>
                  <option value="Frontend Engineer">Frontend Engineer</option>
                  <option value="Backend Engineer">Backend Engineer</option>
                  <option value="Full Stack Developer">Full Stack Developer</option>
                  <option value="QA / Test Automation Engineer">QA / Test Automation Engineer</option>
                  <option value="DevOps / Cloud Engineer">DevOps / Cloud Engineer</option>
                  <option value="Mobile Application Developer">Mobile Application Developer</option>
                  <option value="Data Engineer / AI Engineer">Data Engineer / AI Engineer</option>
                </select>
              </div>

              {/* Expertise Level */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1 flex items-center gap-1.5">
                  <GraduationCap className="w-3.5 h-3.5 text-gray-400" />
                  Expertise Level:
                </label>
                <select
                  value={expertiseLevel}
                  onChange={(e) => setExpertiseLevel(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-800 focus:ring-2 focus:ring-[#0E8C86]/30 focus:border-[#0E8C86] outline-none transition-all cursor-pointer font-medium"
                >
                  <option value="Beginner">Beginner (0-2 years)</option>
                  <option value="Intermediate">Intermediate (2-5 years)</option>
                  <option value="Senior">Senior (5+ years)</option>
                  <option value="Lead Architect">Lead / Principal Architect</option>
                </select>
              </div>

              {/* Real-Time Company Requirements Intelligence Verification Bar */}
              {getSelectedCompany() && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-teal-50/40 border border-teal-200/80 rounded-xl">
                    <div className="space-y-0.5 min-w-0">
                      <p className="text-xs font-bold text-[#0B3538] flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-[#0E8C86]" />
                        <span>Company Job Requirements Intelligence</span>
                      </p>
                      <p className="text-[11px] text-gray-500 truncate">
                        Search verified hiring requirements for {getSelectedCompany()} {jobRole} from LinkedIn & Careers Archives.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleVerifyRequirements}
                      disabled={isSearchingReqs}
                      className="shrink-0 px-3.5 py-1.5 bg-[#0E8C86] hover:bg-[#0C7873] text-white text-xs font-semibold rounded-lg shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75"
                    >
                      {isSearchingReqs ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          <span>Searching...</span>
                        </>
                      ) : (
                        <>
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Verify Requirements</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Verification Results Feedback */}
                  {verifiedPostingInfo && (
                    <div className="mt-3 p-3 bg-white border border-gray-200 rounded-xl text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold flex items-center gap-1.5 ${
                            verifiedPostingInfo.isVerified ? "text-emerald-700" : "text-amber-700"
                          }`}
                        >
                          {verifiedPostingInfo.isVerified ? (
                            <>
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span>Verified Against Official Job Postings & LinkedIn Archive</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-4 h-4 text-amber-600" />
                              <span>Using Role-Based Evaluation Standards</span>
                            </>
                          )}
                        </span>
                        {verifiedPostingInfo.sourceUrl && (
                          <a
                            href={verifiedPostingInfo.sourceUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#0E8C86] hover:underline font-medium text-[11px]"
                          >
                            View Source ↗
                          </a>
                        )}
                      </div>

                      {verifiedReqs.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-[11px] font-semibold text-gray-500">
                            Discovered Requirements ({verifiedReqs.length}):
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {verifiedReqs.slice(0, 10).map((req: any, idx: number) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-[11px] font-mono"
                                title={req.evidence_excerpt || req.description}
                              >
                                {req.name || req.requirement_name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* ── ACTION BUTTON ── */}
          <button
            type="button"
            onClick={handleStartInterview}
            disabled={isStarting}
            className="w-full py-3 px-6 bg-[#0E8C86] hover:bg-[#0C7873] active:bg-[#0A625E] text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer disabled:opacity-75"
          >
            {isStarting ? (
              <span>Preparing Interview Session...</span>
            ) : (
              <>
                <span>Start Personalized Interview</span>
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
