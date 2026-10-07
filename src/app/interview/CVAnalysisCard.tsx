import React from "react";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  Wrench,
  Clock,
  Layers,
  Award,
  Trash2,
} from "lucide-react";

export interface ParsedCVData {
  id?: number;
  file_name?: string;
  candidate?: {
    full_name?: string | null;
    email?: string | null;
    phone?: string | null;
    location?: string | null;
    linkedin?: string | null;
    github?: string | null;
  };
  professional_summary?: string | null;
  skills?: string[];
  technical_skills?: string[];
  soft_skills?: string[];
  experience_years?: number | null;
  expertise_level?: string | null;
  suggested_job_roles?: string[];
  suggested_role?: string | null;
  suggested_level?: string | null;
  education?: Array<{
    degree?: string | null;
    institution?: string | null;
    year?: string | null;
  }>;
  work_experience?: Array<{
    job_title?: string | null;
    company?: string | null;
    start_date?: string | null;
    end_date?: string | null;
  }>;
  parsed_data?: any;
}

interface CVAnalysisCardProps {
  data: ParsedCVData;
  onAutoApply: () => void;
  onClear?: () => void;
  isApplied?: boolean;
}

export const CVAnalysisCard: React.FC<CVAnalysisCardProps> = ({
  data,
  onAutoApply,
  onClear,
  isApplied = false,
}) => {
  const candidate = data.candidate || data.parsed_data?.candidate || {};
  const name = candidate.full_name || "Candidate Profile";
  const email = candidate.email;
  const phone = candidate.phone;
  const summary = data.professional_summary || data.parsed_data?.professional_summary;

  const techSkills =
    data.technical_skills?.length
      ? data.technical_skills
      : data.skills?.length
      ? data.skills
      : data.parsed_data?.technical_skills || data.parsed_data?.skills || [];

  const softSkills = data.soft_skills || data.parsed_data?.soft_skills || [];

  const expYears =
    data.experience_years !== undefined && data.experience_years !== null
      ? data.experience_years
      : data.parsed_data?.experience_years;

  const suggestedRoles =
    data.suggested_job_roles?.length
      ? data.suggested_job_roles
      : data.parsed_data?.suggested_job_roles || [];
  const primaryRole =
    data.suggested_role || (suggestedRoles.length > 0 ? suggestedRoles[0] : "Software Engineer");

  const level = data.suggested_level || data.expertise_level || data.parsed_data?.expertise_level || "Junior";

  return (
    <div className="bg-gradient-to-br from-white via-teal-50/20 to-emerald-50/10 border border-teal-200/80 rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 animate-fadeIn">
      {/* Card Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-[#0E8C86] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-bold text-[#0B3538] font-['Poppins',sans-serif]">
                {name}
              </h3>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-100 text-[#0E8C86]">
                CV Analyzed
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-600 mt-1">
              {email && (
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-[#0E8C86]" />
                  {email}
                </span>
              )}
              {phone && (
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#0E8C86]" />
                  {phone}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-2">
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors shadow-2xs flex items-center gap-1.5 cursor-pointer"
              title="Clear CV Analysis"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Result</span>
            </button>
          )}

          <button
            type="button"
            onClick={onAutoApply}
            className={`px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer ${
              isApplied
                ? "bg-emerald-600 text-white"
                : "bg-[#0E8C86] hover:bg-[#0C7873] text-white"
            }`}
          >
            {isApplied ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Auto-applied to Context</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Auto-apply to Interview</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Professional Summary */}
      {summary && (
        <div className="bg-white/80 rounded-xl p-3.5 border border-teal-100 text-xs sm:text-sm text-gray-700 leading-relaxed">
          <p className="font-semibold text-gray-900 mb-1 flex items-center gap-1.5 text-xs text-[#0E8C86] uppercase tracking-wider">
            <User className="w-3.5 h-3.5" /> Summary
          </p>
          {summary}
        </div>
      )}

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-xl p-3 border border-gray-200/80 shadow-2xs">
          <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mb-1">
            <Briefcase className="w-3.5 h-3.5 text-[#0E8C86]" />
            Suggested Role
          </p>
          <p className="font-bold text-gray-900 text-xs sm:text-sm truncate">
            {primaryRole}
          </p>
        </div>

        <div className="bg-white rounded-xl p-3 border border-gray-200/80 shadow-2xs">
          <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mb-1">
            <GraduationCap className="w-3.5 h-3.5 text-[#0E8C86]" />
            Expertise Level
          </p>
          <p className="font-bold text-teal-800 text-xs sm:text-sm">
            {level}
          </p>
        </div>

        <div className="bg-white rounded-xl p-3 border border-gray-200/80 shadow-2xs col-span-2 sm:col-span-1">
          <p className="text-[11px] font-semibold text-gray-500 flex items-center gap-1 mb-1">
            <Clock className="w-3.5 h-3.5 text-[#0E8C86]" />
            Experience
          </p>
          <p className="font-bold text-gray-900 text-xs sm:text-sm">
            {expYears !== null && expYears !== undefined ? `${expYears} Years` : "Extracted from CV"}
          </p>
        </div>
      </div>

      {/* Technical Skills Badges */}
      {techSkills.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 font-['Poppins',sans-serif]">
            <Wrench className="w-3.5 h-3.5 text-[#0E8C86]" />
            Detected Technical Skills ({techSkills.length})
          </p>
          <div className="flex flex-wrap gap-1.5">
            {techSkills.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-teal-50 text-[#0E8C86] border border-teal-200/80 text-xs font-medium shadow-2xs"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Soft Skills */}
      {softSkills.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 font-['Poppins',sans-serif]">
            <Layers className="w-3.5 h-3.5 text-[#0E8C86]" />
            Soft Skills
          </p>
          <div className="flex flex-wrap gap-1.5">
            {softSkills.map((skill: string, idx: number) => (
              <span
                key={idx}
                className="px-2.5 py-1 rounded-lg bg-gray-100 text-gray-700 border border-gray-200 text-xs font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Job Roles List */}
      {suggestedRoles.length > 1 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-gray-700 flex items-center gap-1.5 font-['Poppins',sans-serif]">
            <Award className="w-3.5 h-3.5 text-[#0E8C86]" />
            Other Matching Roles
          </p>
          <div className="flex flex-wrap gap-2 text-xs text-gray-600">
            {suggestedRoles.slice(1).map((role: string, idx: number) => (
              <span key={idx} className="bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                {role}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
