import React, { useState } from "react";
import {
  GraduationCap,
  BookOpen,
  Award,
  Sparkles,
  ExternalLink,
  Star,
  Clock,
  Target,
  Briefcase,
  Building2,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Layers,
  ShieldCheck,
  Code2,
  Bookmark,
  Share2,
} from "lucide-react";

export interface SkillItem {
  id: string;
  name: string;
  category: "Architecture" | "DevOps" | "Observability" | "Containers" | "Security";
  level: "Beginner" | "Intermediate" | "Advanced";
  priority: "High Priority Gap" | "Key Requirement" | "Recommended";
  description: string;
}

export interface CourseItem {
  id: string;
  title: string;
  platform: "Coursera" | "Udemy" | "Microsoft Learn" | "Pluralsight" | "edX";
  instructor: string;
  rating: number;
  reviewsCount: string;
  duration: string;
  level: "Intermediate" | "Advanced" | "All Levels";
  skillsCovered: string[];
  description: string;
  badge?: string;
  courseUrl: string;
  colorTheme: string;
}

export interface CertificationItem {
  id: string;
  title: string;
  code: string;
  issuer: "Microsoft" | "CNCF / Linux Foundation" | "AWS" | "HashiCorp";
  difficulty: "Expert" | "Associate" | "Professional";
  estimatedStudyTime: string;
  cost: string;
  badgeColor: string;
  skillsValidated: string[];
  description: string;
  officialUrl: string;
}

interface NextStepsRoadmapProps {
  jobRole?: string;
  targetCompany?: string;
  overallScore?: number;
}

export const NextStepsRoadmap: React.FC<NextStepsRoadmapProps> = ({
  jobRole = "Senior Cloud & DevOps Software Engineer",
  targetCompany = "Enterprise Cloud Services",
  overallScore = 72,
}) => {
  const [activeCourseCategory, setActiveCourseCategory] = useState<string>("All");

  // Hardcoded Mapped Skills
  const targetSkills: SkillItem[] = [
    {
      id: "sk-1",
      name: "Kubernetes & Azure AKS Management",
      category: "Containers",
      level: "Advanced",
      priority: "High Priority Gap",
      description: "Cluster configuration, pod scheduling, ingress control, and zero-downtime rolling upgrades on AKS.",
    },
    {
      id: "sk-2",
      name: "CI/CD Canary Pipelines & Automated Health-Gates",
      category: "DevOps",
      level: "Advanced",
      priority: "High Priority Gap",
      description: "Azure DevOps release automation, traffic shifting, automated rollbacks, and blue-green deployments.",
    },
    {
      id: "sk-3",
      name: "Distributed Tracing & Telemetry Instrumentation",
      category: "Observability",
      level: "Intermediate",
      priority: "Key Requirement",
      description: "Azure Application Insights, OpenTelemetry, correlation vectors across microservice boundaries.",
    },
    {
      id: "sk-4",
      name: "Horizontal Pod Autoscaling (HPA) & Metrics-Server",
      category: "Containers",
      level: "Intermediate",
      priority: "Key Requirement",
      description: "Resource quotas, CPU/Memory metrics, custom Prometheus metrics scaling and load shedding.",
    },
    {
      id: "sk-5",
      name: "Infrastructure as Code (Terraform & Bicep)",
      category: "Architecture",
      level: "Intermediate",
      priority: "Recommended",
      description: "Declarative infrastructure provisioning, state management, and modular cloud architecture.",
    },
    {
      id: "sk-6",
      name: "Cloud Native Zero-Trust Security & RBAC",
      category: "Security",
      level: "Advanced",
      priority: "Recommended",
      description: "Workload identities, secret management via Azure Key Vault, and container vulnerability scanning.",
    },
  ];

  // Hardcoded Mapped Courses
  const suggestedCourses: CourseItem[] = [
    {
      id: "crs-1",
      title: "Architecting Microsoft Azure Solutions (AZ-305)",
      platform: "Coursera",
      instructor: "Microsoft Worldwide Learning",
      rating: 4.8,
      reviewsCount: "14.2k",
      duration: "26 Hours",
      level: "Advanced",
      skillsCovered: ["Azure Architecture", "High Availability", "Microservices", "Disaster Recovery"],
      description: "Master modern enterprise architectures on Azure, scalable multi-region designs, and resilient cloud storage strategies.",
      badge: "Top Recommended",
      courseUrl: "https://www.coursera.org",
      colorTheme: "from-blue-600 to-indigo-700",
    },
    {
      id: "crs-2",
      title: "Mastering Kubernetes with Azure Kubernetes Service (AKS)",
      platform: "Udemy",
      instructor: "Cloud Native Academy",
      rating: 4.9,
      reviewsCount: "9.8k",
      duration: "18.5 Hours",
      level: "Intermediate",
      skillsCovered: ["Kubernetes", "AKS Cluster Deployments", "HPA Autoscaling", "Helm Charts"],
      description: "Hands-on deep dive into production Kubernetes deployments, storage classes, ingress routers, and pod autoscalers.",
      badge: "Best Seller",
      courseUrl: "https://www.udemy.com",
      colorTheme: "from-teal-600 to-emerald-700",
    },
    {
      id: "crs-3",
      title: "Designing & Implementing Microsoft DevOps Solutions (AZ-400)",
      platform: "Microsoft Learn",
      instructor: "Official Microsoft Curriculum",
      rating: 4.7,
      reviewsCount: "22.5k",
      duration: "32 Hours",
      level: "Advanced",
      skillsCovered: ["Azure Pipelines", "Canary Deployment", "GitOps", "Quality Health-Gates"],
      description: "End-to-end guidance on crafting resilient CI/CD pipelines, automated canary gates, and multi-stage testing suites.",
      badge: "Official Track",
      courseUrl: "https://learn.microsoft.com",
      colorTheme: "from-sky-600 to-cyan-700",
    },
    {
      id: "crs-4",
      title: "Production Observability: Distributed Tracing & Telemetry",
      platform: "Pluralsight",
      instructor: "Site Reliability Experts",
      rating: 4.8,
      reviewsCount: "6.1k",
      duration: "14 Hours",
      level: "Intermediate",
      skillsCovered: ["Application Insights", "OpenTelemetry", "Distributed Logs", "Grafana"],
      description: "Gain complete visibility into distributed microservices with trace spans, synthetic traffic, and incident triage runbooks.",
      badge: "Skill Builder",
      courseUrl: "https://www.pluralsight.com",
      colorTheme: "from-violet-600 to-purple-700",
    },
    {
      id: "crs-5",
      title: "Canary Deployments & Progressive Delivery with Argo & Istio",
      platform: "Udemy",
      instructor: "DevOps Masterclass",
      rating: 4.9,
      reviewsCount: "4.7k",
      duration: "12 Hours",
      level: "Advanced",
      skillsCovered: ["Argo Rollouts", "Istio Service Mesh", "Canary Releases", "Automated Rollbacks"],
      description: "Implement modern progressive delivery patterns with fine-grained traffic routing and automated canary verification.",
      badge: "Hot & New",
      courseUrl: "https://www.udemy.com",
      colorTheme: "from-amber-600 to-orange-700",
    },
    {
      id: "crs-6",
      title: "Cloud Native Infrastructure as Code with Terraform & Bicep",
      platform: "Coursera",
      instructor: "Cloud Architecture Council",
      rating: 4.7,
      reviewsCount: "8.3k",
      duration: "16 Hours",
      level: "Intermediate",
      skillsCovered: ["Terraform", "Azure Bicep", "State Management", "CI/CD GitOps"],
      description: "Write immutable, testable infrastructure configurations for enterprise Kubernetes clusters and networking backbones.",
      badge: "Practical Lab",
      courseUrl: "https://www.coursera.org",
      colorTheme: "from-emerald-600 to-teal-800",
    },
  ];

  // Hardcoded Mapped Certifications
  const targetCertifications: CertificationItem[] = [
    {
      id: "cert-1",
      title: "Microsoft Certified: DevOps Engineer Expert",
      code: "AZ-400",
      issuer: "Microsoft",
      difficulty: "Expert",
      estimatedStudyTime: "6 - 8 Weeks",
      cost: "$165 USD",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      skillsValidated: [
        "Continuous Delivery Pipelines",
        "Dependency Management",
        "Security & Compliance Policies",
        "Instrumentation & Telemetry",
      ],
      description:
        "The premier certification validating your ability to combine people, process, and technologies to continuously deliver valuable services.",
      officialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/devops-engineer/",
    },
    {
      id: "cert-2",
      title: "Certified Kubernetes Administrator (CKA)",
      code: "CKA-2025",
      issuer: "CNCF / Linux Foundation",
      difficulty: "Professional",
      estimatedStudyTime: "8 - 10 Weeks",
      cost: "$395 USD",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200",
      skillsValidated: [
        "Cluster Architecture & Installation",
        "Workloads & Scheduling",
        "Cluster Networking & Ingress",
        "Storage & Troubleshooting",
      ],
      description:
        "Industry gold-standard performance-based exam proving hands-on competence in deploying, configuring, and maintaining production Kubernetes.",
      officialUrl: "https://www.cncf.io/certification/cka/",
    },
    {
      id: "cert-3",
      title: "Microsoft Certified: Azure Solutions Architect Expert",
      code: "AZ-305",
      issuer: "Microsoft",
      difficulty: "Expert",
      estimatedStudyTime: "8 - 12 Weeks",
      cost: "$165 USD",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      skillsValidated: [
        "Identity & Governance Design",
        "Data Storage Architecture",
        "Business Continuity & Disaster Recovery",
        "Infrastructure Solutions",
      ],
      description:
        "Validates high-level architectural decision-making, security postures, scalable storage tiers, and compute orchestration.",
      officialUrl: "https://learn.microsoft.com/en-us/credentials/certifications/azure-solutions-architect/",
    },
    {
      id: "cert-4",
      title: "HashiCorp Certified: Terraform Associate",
      code: "TA-003",
      issuer: "HashiCorp",
      difficulty: "Associate",
      estimatedStudyTime: "4 - 5 Weeks",
      cost: "$70 USD",
      badgeColor: "bg-purple-50 text-purple-700 border-purple-200",
      skillsValidated: [
        "IaC Concepts & Workflows",
        "Terraform Modules & State",
        "Cloud Provisioning & Execution Plans",
      ],
      description:
        "Demonstrates proficiency in declarative cloud provisioning, modular infrastructure development, and automated state synchronization.",
      officialUrl: "https://www.hashicorp.com/certification/terraform-associate",
    },
  ];

  // Filtering for courses
  const filteredCourses =
    activeCourseCategory === "All"
      ? suggestedCourses
      : suggestedCourses.filter((c) =>
          c.skillsCovered.some((s) => s.toLowerCase().includes(activeCourseCategory.toLowerCase()))
        );

  return (
    <section id="next-steps-section" className="space-y-8 mt-10 pt-8 border-t-2 border-dashed border-teal-200/80">
      {/* ── HEADER BANNER ── */}
      <div className="bg-gradient-to-r from-[#0B3538] via-[#0E8C86] to-teal-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-1/3 -mb-20 w-80 h-80 bg-emerald-400/15 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/15 backdrop-blur-md border border-white/20 rounded-full text-xs font-semibold tracking-wide text-teal-100">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Personalized Post-Interview Growth Roadmap</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-['Poppins',sans-serif] tracking-tight text-white">
              Next Steps & Suggested Courses
            </h2>
            <p className="text-xs sm:text-sm text-teal-100/90 leading-relaxed">
              Based on your technical evaluation score of{" "}
              <strong className="text-white font-bold">{overallScore}%</strong>, here is your customized plan
              to eliminate key architectural skill gaps and qualify for senior roles at {targetCompany}.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 sm:p-5 flex items-center gap-4 shrink-0 shadow-inner">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center text-amber-300">
              <GraduationCap className="w-7 h-7" />
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider text-teal-200 font-semibold block">
                Recommended Focus
              </span>
              <span className="text-sm font-bold text-white block">
                AKS & Canary Pipelines
              </span>
              <span className="text-[11px] text-teal-200/80">3 Core Courses • 2 Certifications</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 1: TARGET JOB TITLE & ROLE EXPECTATIONS CARD ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-teal-50 border border-teal-200/80 flex items-center justify-center text-[#0E8C86]">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-teal-100/80 text-teal-900 rounded-md">
                  Target Career Role
                </span>
                <span className="text-xs text-gray-400">•</span>
                <span className="text-xs font-semibold text-gray-600 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-gray-400" />
                  {targetCompany}
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-[#0B3538] font-['Poppins',sans-serif]">
                {jobRole}
              </h3>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold self-start sm:self-auto">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Target Match: Intermediate to Senior</span>
          </div>
        </div>

        {/* Job Description & Core Expectations */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-[#0E8C86]" />
            <span>Role Description & Performance Expectations</span>
          </h4>
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-slate-50/70 p-4 rounded-xl border border-slate-200/70">
            As a <strong className="text-gray-900">{jobRole}</strong>, you will design, deploy, and operate high-concurrency cloud architectures.
            Your key accountabilities include deploying containerized microservices to <strong>Azure Kubernetes Service (AKS)</strong>, configuring automated <strong>Horizontal Pod Autoscalers (HPA)</strong>,
            instrumenting end-to-end <strong>Application Insights distributed telemetry</strong>, and driving automated <strong>Canary & Blue/Green deployment pipelines</strong> with automated health-gate verification.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
            <div className="p-3 bg-white border border-gray-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#0E8C86]" /> Cloud Orchestration
              </span>
              <p className="text-gray-600 text-[11px]">
                High-availability AKS clusters, multi-zone node pools, ingress controllers, and network policies.
              </p>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Production CI/CD
              </span>
              <p className="text-gray-600 text-[11px]">
                Multi-stage Azure Pipelines, canary rollouts, synthetic smoke tests, and rollback triggers.
              </p>
            </div>

            <div className="p-3 bg-white border border-gray-200 rounded-xl text-xs space-y-1">
              <span className="font-bold text-gray-900 block flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-blue-600" /> Observability & Health
              </span>
              <p className="text-gray-600 text-[11px]">
                Full-stack distributed tracing, Prometheus metrics scraping, and alert runbook automations.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: KEY SKILLS & SKILL GAP BREAKDOWN ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-[#0B3538] font-['Poppins',sans-serif] flex items-center gap-2">
              <Code2 className="w-5 h-5 text-[#0E8C86]" />
              <span>Critical Skills & Targeted Gap Analysis</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Identified competencies requiring reinforcement based on your interview answers and evaluator feedback.
            </p>
          </div>
          <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-3 py-1 rounded-full border border-teal-200 self-start sm:self-auto">
            {targetSkills.length} Core Competencies Mapped
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {targetSkills.map((skill) => {
            const isHighPriority = skill.priority === "High Priority Gap";
            const isKeyReq = skill.priority === "Key Requirement";

            return (
              <div
                key={skill.id}
                className={`p-4 rounded-xl border transition-all hover:shadow-sm ${
                  isHighPriority
                    ? "bg-rose-50/40 border-rose-200"
                    : isKeyReq
                    ? "bg-amber-50/40 border-amber-200"
                    : "bg-teal-50/30 border-teal-200"
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md ${
                      isHighPriority
                        ? "bg-rose-100 text-rose-800"
                        : isKeyReq
                        ? "bg-amber-100 text-amber-800"
                        : "bg-teal-100 text-teal-800"
                    }`}
                  >
                    {skill.priority}
                  </span>
                  <span className="text-[10px] font-medium text-gray-500 font-mono">
                    {skill.level}
                  </span>
                </div>

                <h5 className="text-xs sm:text-sm font-bold text-gray-900 mb-1 leading-snug">
                  {skill.name}
                </h5>

                <p className="text-[11px] text-gray-600 leading-relaxed mb-3">
                  {skill.description}
                </p>

                <div className="flex items-center justify-between text-[10px] text-gray-500 pt-2 border-t border-gray-200/60">
                  <span>Category: <strong>{skill.category}</strong></span>
                  <span className="text-[#0E8C86] font-semibold flex items-center gap-0.5">
                    Recommended <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── SECTION 3: SUGGESTED COURSES (CARD GRID) ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[11px] font-bold uppercase tracking-wider mb-1">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Recommended Learning Tracks</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0B3538] font-['Poppins',sans-serif]">
              Suggested Courses ("Suggest Courses")
            </h3>
            <p className="text-xs text-gray-500">
              Curated masterclasses and certification courses from top e-learning platforms to sharpen your skills.
            </p>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5">
            {["All", "Kubernetes", "Azure", "DevOps", "Telemetry"].map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setActiveCourseCategory(cat)}
                className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeCourseCategory === cat
                    ? "bg-[#0E8C86] text-white shadow-xs"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-600"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white border border-gray-200 hover:border-teal-400 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                {/* Course Header Banner */}
                <div className={`p-4 bg-gradient-to-r ${course.colorTheme} text-white relative`}>
                  <div className="flex items-center justify-between text-xs font-medium mb-1">
                    <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-xs font-semibold">
                      {course.platform}
                    </span>
                    {course.badge && (
                      <span className="px-2 py-0.5 rounded-md bg-amber-400 text-amber-950 font-bold text-[10px] tracking-wide">
                        {course.badge}
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-bold font-['Poppins',sans-serif] leading-tight mt-2 text-white">
                    {course.title}
                  </h4>
                  <p className="text-[11px] text-white/80 mt-1 truncate">
                    By {course.instructor}
                  </p>
                </div>

                {/* Course Details Body */}
                <div className="p-4 space-y-3">
                  {/* Rating & Duration */}
                  <div className="flex items-center justify-between text-xs text-gray-600 border-b border-gray-100 pb-2.5">
                    <div className="flex items-center gap-1 font-bold text-gray-800">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{course.rating}</span>
                      <span className="text-[10px] text-gray-400 font-normal">
                        ({course.reviewsCount})
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-gray-500 font-medium">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      <span>{course.duration}</span>
                    </div>

                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                      {course.level}
                    </span>
                  </div>

                  {/* Course Description */}
                  <p className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                    {course.description}
                  </p>

                  {/* Skills Covered Pills */}
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Skills You Will Gain:
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {course.skillsCovered.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-teal-50 text-[#0E8C86] rounded-md text-[10px] font-semibold border border-teal-100"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Course Action Bottom */}
              <div className="p-4 pt-0">
                <a
                  href={course.courseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-teal-50 hover:bg-[#0E8C86] text-[#0E8C86] hover:text-white border border-teal-200/80 hover:border-[#0E8C86] font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer group-hover:shadow-xs"
                >
                  <span>Explore Course & Syllabus</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── SECTION 4: INDUSTRY CERTIFICATIONS (CARD GRID) ── */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-800 text-[11px] font-bold uppercase tracking-wider mb-1">
              <Award className="w-3.5 h-3.5" />
              <span>Career Credentials</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-[#0B3538] font-['Poppins',sans-serif]">
              Recommended Industry Certifications
            </h3>
            <p className="text-xs text-gray-500">
              High-value cloud & DevOps credentials that directly match employer hiring benchmarks.
            </p>
          </div>
          <span className="text-xs text-gray-500 font-medium self-start sm:self-auto">
            Updated for 2025/2026 Standards
          </span>
        </div>

        {/* Certifications Card Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {targetCertifications.map((cert) => (
            <div
              key={cert.id}
              className="bg-white border border-gray-200 hover:border-indigo-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Top Badge & Issuer */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-[#0E8C86] text-white flex items-center justify-center shadow-xs">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
                        {cert.issuer}
                      </span>
                      <h4 className="text-sm sm:text-base font-bold text-gray-900 leading-snug">
                        {cert.title}
                      </h4>
                    </div>
                  </div>

                  <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border shrink-0 ${cert.badgeColor}`}>
                    {cert.code}
                  </span>
                </div>

                {/* Description */}
                <p className="text-xs text-gray-600 leading-relaxed">
                  {cert.description}
                </p>

                {/* Key Details Pill */}
                <div className="grid grid-cols-3 gap-2 bg-gray-50 p-2.5 rounded-xl text-center text-xs border border-gray-100">
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">Level</span>
                    <strong className="text-gray-800 text-[11px]">{cert.difficulty}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">Prep Time</span>
                    <strong className="text-gray-800 text-[11px]">{cert.estimatedStudyTime}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 block uppercase">Exam Fee</span>
                    <strong className="text-gray-800 text-[11px]">{cert.cost}</strong>
                  </div>
                </div>

                {/* Validated Skills */}
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">
                    Key Competencies Validated:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {cert.skillsValidated.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md text-[10px] font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Link */}
              <div className="pt-2">
                <a
                  href={cert.officialUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 text-gray-800 border border-gray-300 font-bold rounded-xl text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs"
                >
                  <span>Official Exam Blueprint & Prep</span>
                  <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
