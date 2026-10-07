import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { User, Camera, KeyRound, ChevronLeft, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";
import axiosInstance from "../../app/lib/axiosInstance";
import { defaultConfig } from "../../app/configs/common";

type ProfileState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  studentId: string;
  status: string;
  avatar: string | null;
  qrCode?: string;
};

type ProfileApiResponse = {
  success: boolean;
  data?: {
    username?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    mobile_contact_number?: string | null;
    dateOfBirth?: string | null;
    gender?: string | null;
    status?: string | null;
    avatar?: string | null;
    qr_code?: string | null;
  };
  message?: string;
};

function Profile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<ProfileState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    studentId: "",
    status: "",
    avatar: null,
    qrCode: "",
  });

  const [activeTab, setActiveTab] = useState<"personal" | "security">(
    "personal",
  );
  const [passwordData, setPasswordData] = useState({
    new: "",
    confirm: "",
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resolveAvatarUrl = (avatarPath?: string | null) => {
    if (!avatarPath) return null;
    if (avatarPath.startsWith("http")) return avatarPath;
    return `${defaultConfig.BASE_ASSEST_URL}/${String(avatarPath).replace(/^\/+/, "")}`;
  };

  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoadingProfile(true);
      try {
        const res = await axiosInstance.get<ProfileApiResponse>("/profile");
        const user = res.data?.data;

        if (!user) {
          toast.error("Failed to load profile data.");
          return;
        }

        const avatarUrl = resolveAvatarUrl(user.avatar);

        setProfile({
          firstName: user.first_name ?? "",
          lastName: user.last_name ?? "",
          email: user.email ?? "",
          phone: user.mobile_contact_number ?? "",
          dateOfBirth: user.dateOfBirth ?? "",
          gender: user.gender ?? "",
          studentId: user.username ?? "",
          status: user.status ?? "approved",
          avatar: avatarUrl,
          qrCode: user.qr_code ?? "",
        });
      } catch (error) {
        toast.error("Error fetching profile data.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4 bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0B2C4D] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  const handleProfileChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setProfile((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!passwordData.new || !passwordData.confirm) {
      toast.error("Please fill both password fields.");
      return;
    }

    if (passwordData.new !== passwordData.confirm) {
      toast.error("New passwords do not match.");
      return;
    }

    if (passwordData.new.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }

    try {
      setIsUpdatingPassword(true);
      const response = await axiosInstance.post("/profile-reset-password", {
        new_password: passwordData.new,
        confirm_password: passwordData.confirm,
      });

      if (response.data?.success) {
        toast.success(response.data?.message || "Password updated successfully.");
        setPasswordData({ new: "", confirm: "" });
      } else {
        toast.error(response.data?.message || "Failed to update password.");
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors as Record<string, string[]>;
        Object.values(validationErrors).forEach((errArray) => {
          errArray.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error("Failed to update password.");
      }
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSaveChanges = () => setShowSaveConfirm(true);

  const confirmSaveChanges = async () => {
    try {
      setIsSavingProfile(true);
      const response = await axiosInstance.post("/update_profile", {
        first_name: profile.firstName.trim(),
        last_name: profile.lastName.trim(),
        email: profile.email.trim(),
        mobile_contact_number: profile.phone.trim(),
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
      });

      if (response.data?.success) {
        const fullName = `${profile.firstName} ${profile.lastName}`.trim();
        localStorage.setItem("name", fullName);
        localStorage.setItem("email", profile.email.trim());

        toast.success(response.data?.message || "Profile updated successfully.");
        setShowSaveConfirm(false);
        return;
      }

      toast.error(response.data?.message || "Failed to update profile.");
      setShowSaveConfirm(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors as Record<string, string[]>;
        Object.values(validationErrors).forEach((errArray) => {
          errArray.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error("Failed to update profile. Please try again.");
      }
      setShowSaveConfirm(false);
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, avatar: previewUrl }));

    const formData = new FormData();
    formData.append("avatar", file);

    try {
      setIsUploadingAvatar(true);
      const response = await axiosInstance.post("/update_profile_avatar", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (!response.data?.success) {
        toast.error(response.data?.message || "Failed to update profile image.");
        return;
      }

      const avatarPath = response.data?.data?.avatar as string | undefined;
      const resolvedAvatar = resolveAvatarUrl(avatarPath ?? null);
      setProfile((prev) => ({ ...prev, avatar: resolvedAvatar }));

      if (avatarPath) {
        localStorage.setItem("avatar", avatarPath);
      }

      toast.success(response.data?.message || "Profile image updated successfully.");
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.errors) {
        const validationErrors = error.response.data.errors as Record<string, string[]>;
        Object.values(validationErrors).forEach((errArray) => {
          errArray.forEach((msg) => toast.error(msg));
        });
      } else {
        toast.error("Failed to upload avatar. Please try again.");
      }
    } finally {
      setIsUploadingAvatar(false);
      e.target.value = "";
      URL.revokeObjectURL(previewUrl);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 font-['Roboto','Poppins',sans-serif]">
      <div className="mb-6 mt-2">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 bg-gray-200 px-4 py-2 rounded-lg text-gray-600 hover:text-[#0B1D35] mb-4 transition-colors font-medium cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>
      </div>

      {showSaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirm Changes
            </h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to save these changes?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSaveConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors text-sm font-medium cursor-pointer"
                disabled={isSavingProfile}
              >
                Cancel
              </button>
              <button
                onClick={confirmSaveChanges}
                className="px-4 py-2 bg-[#0B2C4D] text-white rounded-md hover:bg-[#1e293b] transition-colors text-sm font-medium disabled:opacity-60 cursor-pointer"
                disabled={isSavingProfile}
              >
                {isSavingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-6 max-w-7xl mx-auto">
        <div className="w-full lg:w-72 bg-white border border-gray-200 rounded-lg p-6 lg:p-8 flex flex-col">
          <div className="flex flex-col items-center mb-10">
            <div
              className="w-28 h-28 bg-gray-400 rounded-full mb-4 flex items-center justify-center relative cursor-pointer group overflow-hidden"
              onClick={handleAvatarClick}
            >
              {profile.avatar ? (
                <img
                  src={profile.avatar}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={52} className="text-white" />
              )}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                {isUploadingAvatar ? (
                  <span className="text-xs text-white font-semibold">Uploading...</span>
                ) : (
                  <Camera size={28} className="text-white" />
                )}
              </div>
            </div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpg,image/jpeg,image/webp"
              className="hidden"
            />
            <h2 className="text-xl font-semibold text-gray-900 text-center">
              {profile.firstName} {profile.lastName}
            </h2>
            <p className="text-sm text-gray-500 mt-1 text-center">
              Username: {profile.studentId || "N/A"}
            </p>
            <span className="mt-3 px-4 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-md capitalize">
              {profile.status || "approved"}
            </span>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => setActiveTab("personal")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                activeTab === "personal"
                  ? "bg-[#09131d25] text-[#0B2C4D] font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Personal Info</span>
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-left text-sm transition-colors cursor-pointer ${
                activeTab === "security"
                  ? "bg-[#09131d25] text-[#0B2C4D] font-semibold"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Security</span>
            </button>
          </nav>

          {/* Student QR Pass Section */}
          {/* <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col items-center">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 text-center flex items-center gap-1.5 justify-center">
              <svg className="w-4 h-4 text-[#0B2C4D]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5.01 20H7a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              Student QR Pass
            </h3>
            {profile.studentId ? (
              (() => {
                const verifyUrl = `${window.location.origin}/verify-student/${profile.studentId}`;
                const qrCodeSource = profile.qrCode || `https://quickchart.io/qr?text=${encodeURIComponent(verifyUrl)}&size=160&margin=1`;
                const qrCodeDownloadSource = profile.qrCode ? profile.qrCode.replace("size=160", "size=300") : `https://quickchart.io/qr?text=${encodeURIComponent(verifyUrl)}&size=300&margin=1`;
                return (
                  <>
                    <div className="bg-white border border-gray-100 p-2.5 rounded-lg shadow-sm">
                      <img
                        src={qrCodeSource}
                        alt="Student QR Code"
                        className="w-40 h-40 object-contain"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        fetch(qrCodeDownloadSource)
                          .then((response) => response.blob())
                          .then((blob) => {
                            const url = window.URL.createObjectURL(blob);
                            const a = document.createElement("a");
                            a.href = url;
                            a.download = `student-${profile.studentId.replace(/\//g, "_")}-qr.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
                            window.URL.revokeObjectURL(url);
                          })
                          .catch(() => toast.error("Failed to download QR code."));
                      }}
                      className="mt-3 w-full flex items-center justify-center gap-2 bg-[#0B2C4D] hover:bg-[#1e293b] text-white text-xs font-semibold py-2 px-4 rounded-lg transition-colors shadow-sm cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Download QR
                    </button>
                  </>
                );
              })()
            ) : (
              <p className="text-xs text-gray-400">QR code unavailable</p>
            )}
          </div> */}
        </div>

        <div className="flex-1 p-6 lg:p-8 bg-white border border-gray-200 rounded-lg">
          {activeTab === "personal" && (
            <div className="w-full">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Personal Information</h1>
                  <p className="text-sm text-gray-500 mt-1">
                    Update your details used when student accounts are created by admin.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={profile.firstName}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B2C4D] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={profile.lastName}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B2C4D] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profile.email}
                      readOnly
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp Number</label>
                    <input
                      type="text"
                      name="phone"
                      value={profile.phone}
                      onChange={handleProfileChange}
                      maxLength={10}
                      inputMode="numeric"
                      placeholder="0712345678"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B2C4D] focus:border-transparent"
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be 10 digits and unique.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={profile.dateOfBirth}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B2C4D] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select
                      name="gender"
                      value={profile.gender}
                      onChange={handleProfileChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B2C4D] focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleSaveChanges}
                  className="mt-4 sm:mt-0 px-4 py-2 bg-[#0B2C4D] text-white text-sm font-medium rounded-md hover:bg-[#1e293b] transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div className="w-full">
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">Security Settings</h1>
                <p className="text-sm text-gray-500 mt-1">Update your account password.</p>
              </div>

              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <KeyRound className="text-orange-600" size={20} />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
                    <p className="text-sm text-gray-500">Password must be at least 8 characters.</p>
                  </div>
                </div>

                <form onSubmit={handlePasswordSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          name="new"
                          value={passwordData.new}
                          onChange={handlePasswordChange}
                          placeholder="New password"
                          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B2C4D] focus:border-transparent placeholder-gray-400"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                          aria-label="Toggle new password visibility"
                        >
                          {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="confirm"
                          value={passwordData.confirm}
                          onChange={handlePasswordChange}
                          placeholder="Confirm new password"
                          className="w-full pl-3 pr-10 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0B2C4D] focus:border-transparent placeholder-gray-400"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 focus:outline-none cursor-pointer"
                          aria-label="Toggle confirm password visibility"
                        >
                          {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#0B2C4D] text-white text-sm font-medium rounded-md hover:bg-[#1e293b] transition-colors disabled:opacity-60 cursor-pointer"
                      disabled={isUpdatingPassword}
                    >
                      {isUpdatingPassword ? "Updating..." : "Update Password"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
