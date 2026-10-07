import {
  Award,
  Package,
  Clock,
  Target,
  Users,
  Video,
  Plus,
  Calendar,
  ChevronRight,
  ArrowRight,
  Check,
  CreditCard,
} from "lucide-react";
import DashboardLayout from "../../components/dashboardLayout/dashboard";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axiosInstance from "../../app/lib/axiosInstance";
import { defaultConfig } from "../../app/configs/common";
import { usePageMetadata } from "../../context/PageContext";
import { getStoredValue } from "../lib/authStorage";
import { checkIsSessionExpired, isLiveClassJoinDisabled } from "../lib/sessionUtils";
import { toast } from "react-toastify";

interface Course {
  id: string;
  title: string;
  description: string;
  image: string;
  badgeType: "Beginner" | "Intermediate" | "Advanced" | "DIPLOMA" | "CERTIFICATE";
  badgeColor: string;
  month: string;
  buttonStyle: "primary" | "secondary";
  intakeName?: string;
  intakeId?: string;
}

type EnrolledCourseApi = {
  course_description: string | null | undefined;
  id: number;
  name: string;
  description?: string | null;
  overview?: string | null;
  class_avatar?: string | null;
  class_type?: string | null;
  subscription_type?: string | null;
  enrollmentsStudent?: Array<{
    subscription_expiration_date?: string | null;
    intake?: {
      id: number;
      name: string;
    } | null;
  }>;
  enrollments_student?: Array<{
    subscription_expiration_date?: string | null;
    intake?: {
      id: number;
      name: string;
    } | null;
  }>;
};

interface LiveSession {
  id: string;
  videoId: number;
  title: string;
  subtitle: string;
  icon: string;
  iconBgColor: string;
  status: "Live Soon" | "Upcoming";
  statusColor: string;
  date: string;
  time: string;
  instructor: string;
  meetingLink?: string;
  buttonStyle: "primary" | "secondary";
  start_time?: string;
  end_time?: string;
}

const DashboardPage = () => {
  const navigate = useNavigate();
  const [userName, setUserName] = useState<string>("User");
  const [courses, setCourses] = useState<Course[]>([]);
  const [liveSessions, setLiveSessions] = useState<LiveSession[]>([]);
  const [practicalSessions, setPracticalSessions] = useState<any[]>([]);
  const [markedVideoIds, setMarkedVideoIds] = useState<number[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { setPageMetadata } = usePageMetadata();

  useEffect(() => {
    const storedName = getStoredValue("name");
    if (storedName && storedName.trim() !== "" && storedName !== "null") {
      setUserName(storedName.trim());
    }

    setPageMetadata({
      title: "Dashboard",
      subtitle: "Welcome back, continue your learning journey.",
    });

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        // Fetch attendance logs to see what has been marked
        try {
          const attRes = await axiosInstance.get("/student-attendance-history");
          const logs = attRes?.data?.data?.logs || [];
          const presentVideoIds = logs
            .filter((log: any) => log.attendance_type === "zoom" && log.status === "present")
            .map((log: any) => Number(log.session_id));
          setMarkedVideoIds(presentVideoIds);
        } catch (e) {
          console.error("Failed to fetch attendance logs:", e);
        }

        const coursesRes = await axiosInstance.get("/get-enroll-class-list", {
          params: {
            pageLimit: 12,
            page: 1,
            class_type: "",
            sort_by: "name_asc",
          },
        });

        const hasUnpaidRegFee = coursesRes?.data?.data?.has_unpaid_registration_fee;
        if (hasUnpaidRegFee) {
          toast.warning("Please pay the registration fee first to access your courses.", {
            toastId: "reg-fee-warning",
          });
          const unpaidCourseId = coursesRes?.data?.data?.unpaid_course_id;
          const unpaidIntakeId = coursesRes?.data?.data?.unpaid_intake_id;
          setTimeout(() => {
            navigate("/payments", {
              state: {
                initialCourseId: unpaidCourseId,
                initialIntakeId: unpaidIntakeId,
              },
            });
          }, 3000);
        }

        const classesPayload = coursesRes?.data?.data?.classesList;
        const classesRaw: EnrolledCourseApi[] = Array.isArray(classesPayload?.data)
          ? classesPayload.data
          : Array.isArray(classesPayload)
            ? classesPayload
            : [];

        const normalizeBadgeType = (
          subscriptionType?: string | null,
          classType?: string | null
        ): Course["badgeType"] => {
          const levelMap: Record<string, Course["badgeType"]> = {
            "1": "Beginner",
            "2": "Intermediate",
            "3": "Advanced",
          };

          const level = String(subscriptionType ?? "").trim();
          if (levelMap[level]) return levelMap[level];

          const normalized = String(classType ?? "").trim().toUpperCase();
          if (normalized === "DIPLOMA") return "DIPLOMA";
          return "CERTIFICATE";
        };

        const getBadgeColor = (badgeType: Course["badgeType"]) => {
          if (badgeType === "DIPLOMA") return "bg-brand-navy";
          if (badgeType === "Advanced") return "bg-purple-600";
          if (badgeType === "Intermediate") return "bg-orange-500";
          if (badgeType === "Beginner") return "bg-green-600";
          return "bg-brand";
        };

        const formatDateLabel = (dateString?: string | null) => {
          if (!dateString) return "Enrolled";
          const parsed = new Date(dateString);
          if (Number.isNaN(parsed.getTime())) return "Enrolled";
          return `Valid till ${parsed.toLocaleDateString()}`;
        };

        const mappedCourses: Course[] = classesRaw.map((item) => {
          const avatar = item.class_avatar
            ? item.class_avatar.startsWith("http")
              ? item.class_avatar
              : `${defaultConfig.BASE_ASSEST_URL}/${String(item.class_avatar).replace(/^\/+/, "")}`
            : "/images/no-found.jpg";

          const badgeType = normalizeBadgeType(item.subscription_type, item.class_type);

          const enrollment = item.enrollments_student?.[0] || item.enrollmentsStudent?.[0];
          const intakeId =
            (enrollment as any)?.intake_id ||
            enrollment?.intake?.id ||
            (typeof enrollment?.intake !== "object" ? enrollment?.intake : undefined);

          return {
            id: String(item.id),
            title: item.name || "Untitled Course",
            description: String(item.course_description ?? item.overview ?? item.description ?? "").trim(),
            image: avatar,
            badgeType,
            badgeColor: getBadgeColor(badgeType),
            month: formatDateLabel(enrollment?.subscription_expiration_date ?? null),
            buttonStyle: "primary",
            intakeName: enrollment?.intake?.name || "",
            intakeId: intakeId ? String(intakeId) : undefined,
          };
        });

        const formatLiveDateLabel = (date: Date): string => {
          const today = new Date();
          const isSameDay =
            today.getFullYear() === date.getFullYear() &&
            today.getMonth() === date.getMonth() &&
            today.getDate() === date.getDate();
          if (isSameDay) return "Today";

          const tomorrow = new Date(today);
          tomorrow.setDate(today.getDate() + 1);
          const isTomorrow =
            tomorrow.getFullYear() === date.getFullYear() &&
            tomorrow.getMonth() === date.getMonth() &&
            tomorrow.getDate() === date.getDate();
          if (isTomorrow) return "Tomorrow";

          return date.toLocaleDateString();
        };

        const liveRes = await axiosInstance.get("/get-live-class-list-live-class", {
          params: {
            pageLimit: 50,
            page: 1,
          },
        });

        const livePayload = liveRes?.data?.data?.classesList;
        const liveClassesRaw = Array.isArray(livePayload?.data)
          ? livePayload.data
          : Array.isArray(livePayload)
            ? livePayload
            : [];

        const now = new Date();
        const upcomingSessions = liveClassesRaw.flatMap((course: any) => {
          const teacher =
            Array.isArray(course?.teachers) && course.teachers.length > 0
              ? course.teachers[0]
              : null;
          const teacherName = String(
            teacher?.name ||
              `${String(teacher?.first_name || "").trim()} ${String(
                teacher?.last_name || "",
              ).trim()}`.trim() ||
              "Instructor",
          );

          const enrollment = course?.enrollments_student?.[0] || course?.enrollmentsStudent?.[0];
          const intakeName = enrollment?.intake?.name || "";

          const courseModules = Array.isArray(course?.classLinksType)
            ? course.classLinksType
            : Array.isArray(course?.class_links_type)
              ? course.class_links_type
              : [];

          return courseModules.flatMap((module: any) => {
            const videos = Array.isArray(module?.classVideos)
              ? module.classVideos
              : Array.isArray(module?.class_videos)
                ? module.class_videos
                : [];

            return videos
              .map((video: any) => {
                const type = String(video?.type || "").toLowerCase();
                if (!["zoom", "zoom_meet", "google_meet"].includes(type)) return null;

                const startRaw = String(video?.start_time || "");
                if (!startRaw) return null;
                const start = new Date(startRaw);
                if (Number.isNaN(start.getTime())) return null;

                const endRaw = String(video?.end_time || "");
                const end = endRaw ? new Date(endRaw) : null;
                if (end && now > end) return null;

                const isLive = now >= start && (!end || now <= end);
                const dateLabel = formatLiveDateLabel(start);
                const timeLabel = end
                  ? `${start.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })} - ${end.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}`
                  : start.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

                return {
                  session: {
                    id: `${course?.id || "c"}-${video?.id || "v"}`,
                    videoId: Number(video?.id),
                    title: String(video?.name || module?.name || "Live Session"),
                    subtitle: intakeName
                      ? `${String(course?.name || "Course")} - ${intakeName}`
                      : String(course?.name || "Course"),
                    icon: type === "google_meet" ? "target" : "package",
                    iconBgColor:
                      type === "google_meet" ? "bg-brand" : "bg-brand-navy",
                    status: isLive ? ("Live Soon" as const) : ("Upcoming" as const),
                    statusColor: isLive
                      ? "bg-red-100 text-red-600"
                      : "bg-blue-100 text-blue-600",
                    date: dateLabel,
                    time: timeLabel,
                    instructor: teacherName,
                    meetingLink: String(video?.video_id || "").trim() || undefined,
                    buttonStyle: isLive ? "primary" : ("secondary" as const),
                    start_time: video?.start_time ? String(video.start_time) : undefined,
                    end_time: video?.end_time ? String(video.end_time) : undefined,
                  },
                  startTime: start.getTime(),
                };
              })
              .filter(Boolean) as Array<{ session: LiveSession; startTime: number }>;
          });
        });

        const mappedLiveSessions = upcomingSessions
          .sort((a: { startTime: number }, b: { startTime: number }) => a.startTime - b.startTime)
          .slice(0, 4)
          .map((item: { session: any }) => item.session);

        setCourses(mappedCourses);
        setLiveSessions(mappedLiveSessions);

        // Fetch practical sessions
        try {
          const practicalRes = await axiosInstance.get("/practical-sessions");
          setPracticalSessions(practicalRes?.data?.data || []);
        } catch (e) {
          console.error("Failed to fetch practical sessions:", e);
          setPracticalSessions([]);
        }
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error);
        setCourses([]);
        setLiveSessions([]);
        setPracticalSessions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [setPageMetadata]);

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: any } = {
      package: Package,
      target: Target,
      award: Award,
    };
    return icons[iconName] || Package;
  };


  const handleJoinSession = (session: LiveSession) => {
    if (!session.meetingLink) return;
    window.open(session.meetingLink, "_blank", "noopener,noreferrer");
  };

  const handleMarkAttendance = async (videoId: number) => {
    try {
      const res = await axiosInstance.post("/mark-zoom-attendance", {
        class_video_id: videoId,
      });
      if (res?.data?.success) {
        toast.success("Attendance marked successfully!");
        setMarkedVideoIds((prev) => [...prev, videoId]);
      } else {
        toast.error(res?.data?.message || "Failed to mark attendance");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to mark attendance");
    }
  };

  const handleContinueLesson = (courseId: string, intakeId?: string | any) => {
    let resolvedIntakeId = intakeId;
    if (typeof intakeId === "object" && intakeId !== null) {
      resolvedIntakeId = intakeId.id || intakeId.intake_id;
    }

    if (resolvedIntakeId && String(resolvedIntakeId) !== "[object Object]") {
      navigate(`/my-courses/${courseId}?intake_id=${resolvedIntakeId}`);
    } else {
      navigate(`/my-courses/${courseId}`);
    }
  };

  const handleConfirmParticipation = async (sessionId: number) => {
    try {
      const res = await axiosInstance.post(`/practical-sessions/${sessionId}/confirm`);
      if (res?.data?.success) {
        toast.success("Participation confirmed successfully!");
        setPracticalSessions((prev) =>
          prev.map((session) =>
            session.id === sessionId ? { ...session, participation_status: "Confirmed" } : session
          )
        );
      } else {
        toast.error(res?.data?.message || "Failed to confirm participation");
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to confirm participation");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="bg-gray-50 min-h-screen">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-brand-navy via-brand to-brand rounded-2xl shadow-lg p-6 sm:p-8 mb-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-full h-full pointer-events-none">
            <img
              src="/images/fade.png"
              className="absolute -top-5 -right-24 md:-top-24 md:-right-8 w-[320px] h-[200px] sm:w-[480px] sm:h-[400px] opacity-10"
            />
          </div>
          <div className="relative z-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 py-2 sm:py-6">
                Welcome back, {userName}!
              </h1>
            </div>
            <div className="relative">
              <Link to="/my-courses">
                <button className="relative z-20 bg-brand-dark text-white hover:bg-brand-darker px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition duration-200 shadow-md flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  <span>Browse All Courses</span>
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Course Progress Section */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-brand-navy">
              Course Progress
            </h2>
            <Link
              to="/my-courses"
              className="text-brand hover:text-brand-dark font-semibold text-sm transition-colors"
            >
              View All Courses
            </Link>
          </div>

          {courses.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Package className="h-16 w-16 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No courses enrolled yet</p>
              <p className="text-sm mt-1">Browse courses to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {courses.map((course) => (
                <div
                  key={course.id}
                  className="flex flex-col sm:flex-row gap-4 sm:gap-6 p-4 sm:p-6 bg-gray-50 rounded-2xl hover:shadow-lg transition-all border border-gray-100"
                >
                  {/* Image */}
                  <div className="relative w-full sm:w-56 h-40 sm:h-48 flex-shrink-0">
                    <img
                      src={course.image}
                      alt={course.title}
                      className="w-full h-full object-cover rounded-xl"
                      onError={(e) => {
                        e.currentTarget.src = "/images/no-found.jpg";
                      }}
                    />
                    {course.intakeName && (
                      <span className="absolute top-3 left-3 px-3 py-1 text-xs font-semibold rounded-lg bg-brand text-white shadow-md z-10">
                        {course.intakeName}
                      </span>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div className="flex-1">
                      {/* Title and Month */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4 mb-3 sm:mb-4">
                        <div>
                          <h3 className="font-bold text-[#0B2C4D] text-lg sm:text-xl leading-snug">
                            {course.title}
                          </h3>
                        </div>
                        <span className="text-xs sm:text-sm text-[#6B7280] font-semibold whitespace-nowrap flex-shrink-0">
                          {course.month}
                        </span>
                      </div>

                      {/* Overview */}
                      {course.description && (
                        <div
                          className="mb-6 text-sm leading-relaxed text-[#6B7280] sm:text-base break-words [overflow-wrap:anywhere] whitespace-normal line-clamp-4"
                          dangerouslySetInnerHTML={{ __html: course.description }}
                        />
                      )}
                    </div>

                    {/* Button - Larger and more prominent */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <button
                        onClick={() => handleContinueLesson(course.id, course.intakeId)}
                        className="px-6 sm:px-8 py-2 sm:py-2 rounded-lg text-sm sm:text-base font-semibold transition duration-200 flex items-center justify-center gap-2 flex-shrink-0 bg-[#0B2C4D] hover:bg-[#1e293b] text-white shadow-md hover:shadow-lg"
                      >
                        <span>Continue Lesson</span>
                        <ArrowRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Live Sessions */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Upcoming Live Sessions
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Don't miss your scheduled classes
              </p>
            </div>
            <Link to="/live-classes">
              <button className="text-brand-navy hover:text-brand-dark font-semibold text-sm sm:text-base flex items-center gap-1 whitespace-nowrap transition-all duration-300 group">
                View All
                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </button>
            </Link>
          </div>

          {liveSessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Video className="h-16 w-16 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No upcoming sessions</p>
              <p className="text-sm mt-1">
                Check back later for scheduled classes
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {liveSessions.map((session) => {
                const IconComponent = getIconComponent(session.icon);
                return (
                  <div
                    key={session.id}
                    className="border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 bg-white flex flex-col"
                  >
                    {/* Header with Icon and Status */}
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <div
                        className={`w-12 h-12 sm:w-14 sm:h-14 ${session.iconBgColor} rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm`}
                      >
                        <IconComponent className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg leading-snug max-w-xs">
                            {session.title}
                          </h3>
                          <span
                            className={
                              isLiveClassJoinDisabled(session)
                                ? "bg-gray-100 text-gray-700 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 inline-flex items-center gap-1"
                                : `${session.statusColor} text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 inline-flex items-center gap-1`
                            }
                          >
                            {!isLiveClassJoinDisabled(session) && session.status === "Live Soon" && (
                              <span className="inline-block w-1.5 h-1.5 bg-red-600 rounded-full animate-pulse"></span>
                            )}
                            {isLiveClassJoinDisabled(session) ? "Ended" : session.status}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed">
                          {session.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="mb-6 text-xs sm:text-sm text-gray-700 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Calendar className="h-4 w-4 text-brand flex-shrink-0" />
                          <span className="font-medium">{session.date}</span>
                          <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
                          <Clock className="h-4 w-4 text-brand flex-shrink-0" />
                          <span className="font-medium">{session.time}</span>
                        </div>
                        <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Users className="h-4 w-4 text-brand flex-shrink-0" />
                          <span className="font-medium">{session.instructor}</span>
                        </div>
                      </div>
                    </div>

                    {/* Join / Mark Attendance Action Button Row */}
                    <div className="flex gap-2 w-full mt-auto">
                      {markedVideoIds.includes(session.videoId) ? (
                        <span className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-green-50 px-4 py-2.5 sm:py-3 text-xs font-semibold text-green-700 border border-green-200">
                          <Check className="w-4 h-4" />
                          Marked
                        </span>
                      ) : (
                        <button
                          onClick={() => handleMarkAttendance(session.videoId)}
                          className="flex-1 px-4 py-2.5 sm:py-3 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg font-semibold text-xs sm:text-sm transition-all"
                        >
                          Mark Attendance
                        </button>
                      )}
                      {(() => {
                        const isJoinDisabled = isLiveClassJoinDisabled(session) || !session.meetingLink;
                        return (
                          <button
                            onClick={() => handleJoinSession(session)}
                            disabled={isJoinDisabled}
                            className={`flex-1 px-4 py-2.5 sm:py-3 rounded-lg font-semibold text-xs sm:text-sm transition-all duration-200 flex items-center justify-center gap-1 ${
                              isJoinDisabled
                                ? "bg-gray-200 text-gray-500 border border-gray-300 cursor-not-allowed"
                                : "bg-brand-dark hover:bg-brand-darker text-white shadow-md hover:shadow-lg"
                            }`}
                          >
                            <Video className="h-4 w-4" />
                            <span>{isLiveClassJoinDisabled(session) ? "Ended" : "Join Session"}</span>
                          </button>
                        );
                      })()}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Upcoming Practical Sessions */}
        <div className="bg-white rounded-2xl shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                Upcoming Practical Sessions
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Confirm your attendance for upcoming practical workshops
              </p>
            </div>
          </div>

          {practicalSessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Calendar className="h-16 w-16 mx-auto mb-3 opacity-30" />
              <p className="font-medium">No upcoming practical sessions</p>
              <p className="text-sm mt-1">
                Check back later for scheduled practical classes
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {practicalSessions.map((session) => {
                return (
                  <div
                    key={session.id}
                    className="border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-300 bg-white flex flex-col"
                  >
                    {/* Header with Icon and Status */}
                    <div className="flex items-start gap-3 sm:gap-4 mb-4">
                      <div className="w-12 h-12 sm:w-14 sm:h-14 bg-brand-navy rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
                        <Users className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                          <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg leading-snug max-w-xs">
                            {session.session_name}
                          </h3>
                          <span
                            className={`text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap flex-shrink-0 inline-flex items-center gap-1 ${
                              session.participation_status === "Confirmed"
                                ? "bg-green-50 text-green-700 border border-green-200"
                                : checkIsSessionExpired(session.session_date, session.session_time, session.is_expired) || session.participation_status === "Expired"
                                ? "bg-red-50 text-red-700 border border-red-200"
                                : "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            }`}
                          >
                            {session.participation_status === "Confirmed"
                              ? "Confirmed"
                              : checkIsSessionExpired(session.session_date, session.session_time, session.is_expired) || session.participation_status === "Expired"
                              ? "Expired"
                              : "Pending"}
                          </span>
                        </div>
                        <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-semibold">
                          Course: {session.courses ? session.courses.map((c: any) => c.name).join(', ') : (session.course?.name || "N/A")}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5 font-medium">
                          Intake: {session.intake?.name || "N/A"}
                        </p>
                        {session.subject && (
                          <p className="text-xs text-gray-500 mt-0.5">
                            Subject: {session.subject}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Details Section */}
                    <div className="mb-6 text-xs sm:text-sm text-gray-700 flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Calendar className="h-4 w-4 text-brand flex-shrink-0" />
                          <span className="font-medium">{session.session_date}</span>
                          <div className="hidden sm:block h-4 w-px bg-gray-300"></div>
                          <Clock className="h-4 w-4 text-brand flex-shrink-0" />
                          <span className="font-medium">{session.session_time}</span>
                        </div>
                      </div>
                      {session.description && (
                        <p className="text-xs text-gray-500 mt-2 italic">
                          {session.description}
                        </p>
                      )}
                    </div>

                    {/* Confirm Button Row */}
                    <div className="flex gap-2 w-full mt-auto">
                      {session.participation_status === "Confirmed" ? (
                        <span className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-green-50 px-4 py-2.5 sm:py-3 text-xs font-semibold text-green-700 border border-green-200">
                          <Check className="w-4 h-4" />
                          Participation Confirmed
                        </span>
                      ) : checkIsSessionExpired(session.session_date, session.session_time, session.is_expired) || session.participation_status === "Expired" ? (
                        <button
                          disabled
                          className="flex-1 px-4 py-2.5 sm:py-3 bg-gray-200 text-gray-500 border border-gray-300 rounded-lg font-semibold text-xs sm:text-sm cursor-not-allowed"
                        >
                          Expired
                        </button>
                      ) : session.is_payment_satisfied === false ? (
                        <button
                          onClick={() => navigate("/payments", { state: { initialCourseId: session.course_id, initialIntakeId: session.intake_id } })}
                          className="flex-1 px-4 py-2.5 sm:py-3 bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 rounded-lg font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-1.5"
                          title={session.payment_message || "Please complete payment first"}
                        >
                          <CreditCard className="w-4 h-4 text-red-500" />
                          Pay Fee to Confirm
                        </button>
                      ) : (
                        <button
                          onClick={() => handleConfirmParticipation(session.id)}
                          className="flex-1 px-4 py-2.5 sm:py-3 bg-brand-dark hover:bg-brand-darker text-white rounded-lg font-semibold text-xs sm:text-sm transition-all"
                        >
                          Confirm Participation
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;