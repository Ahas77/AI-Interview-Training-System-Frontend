import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  User,
  Lock,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Eye,
  EyeOff,
  ChevronLeft,
  Calendar,
  CreditCard,
} from "lucide-react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import { defaultConfig } from "../configs/common";

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile_contact_number: "",
    address: "",
    nic: "",
    dateOfBirth: "",
    gender: "",
    password: "",
    password_confirmation: "",
  });

  const navigate = useNavigate();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name === "mobile_contact_number") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, [name]: digitsOnly }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.password_confirmation) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);

    const nameParts = formData.fullName.trim().split(" ");
    const first_name = nameParts[0] || "";
    const last_name = nameParts.slice(1).join(" ") || first_name;

    const payload = {
      first_name,
      last_name,
      email: formData.email,
      mobile_contact_number: formData.mobile_contact_number,
      address: formData.address,
      nic: formData.nic,
      dateOfBirth: formData.dateOfBirth,
      gender: formData.gender,
      password: formData.password,
      password_confirmation: formData.password_confirmation,
    };

    try {
      const res = await axios.post(
        `${defaultConfig.BASE_API_URL}/register`,
        payload,
        { headers: { Accept: "application/json" } }
      );

      const data = res.data;

      if (!data?.success) {
        toast.error(data?.message || "Registration failed.");
        return;
      }

      toast.success("Account created successfully! Please sign in.");
      navigate("/signin");
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const responseData = error.response?.data;

        if (status === 422) {
          const validationErrors = responseData?.errors;
          if (validationErrors) {
            Object.values(validationErrors).forEach((errArray: any) =>
              errArray.forEach((err: string) => toast.error(err))
            );
          } else {
            toast.error(responseData?.message || "Validation error.");
          }
          return;
        }

        toast.error(responseData?.message || "Server error. Please try again.");
        return;
      }

      if (error instanceof Error) {
        toast.error(error.message);
        return;
      }

      toast.error("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const labelClass = "block mb-1.5 text-sm font-semibold text-gray-700";
  const inputClass =
    "block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] outline-none transition-all text-base text-gray-900 placeholder:text-gray-400 placeholder:text-sm";
  const iconWrap =
    "absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none";

  return (
    <div className="flex flex-col min-h-screen lg:flex-row lg:h-screen lg:overflow-hidden">
      {/* ── LEFT BANNER ── */}
      <div className="hidden lg:flex relative lg:w-[50%] lg:flex-none p-8 lg:p-12 flex-col justify-between text-white overflow-hidden lg:h-screen">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover opacity-60"
          style={{
            backgroundImage: "url('/images/building-4884852_640.jpg')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B3538]/95 via-[#0E8C86]/98 to-[#0B3538]/90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B3538] via-transparent to-transparent"></div>

        <div className="relative z-10">
          <Link
            to="/signin"
            className="inline-flex items-center text-xs text-gray-300 hover:text-white transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 transition-transform group-hover:-translate-x-1" />
            Back to Sign In
          </Link>
        </div>

        <div className="relative z-10 my-auto py-8 -ml-7 flex justify-center w-full">
          <img
            src="/images/"
            alt="SLF Logo"
            className="object-contain w-auto h-20 lg:h-40 mx-auto"
          />
        </div>

        <div className="relative z-10 mt-auto space-y-32">
          <div>
            <h1 className="text-3xl font-extrabold lg:text-4xl leading-tight">
              Begin Your <br />
              <span className="text-yellow-400">Educational Journey</span>
            </h1>
            <p className="text-gray-300 text-sm lg:text-base max-w-md mt-4 leading-relaxed font-light opacity-90">
              Create your account to access your personalized learning environment.
            </p>
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-xs text-gray-400">
              © 2026 Interviewr. All rights reserved.
            </p>
          </div>
        </div>
      </div>

      {/* ── RIGHT FORM CONTAINER ── */}
      <div className="flex-1 bg-gray-50/50 p-6 lg:p-12 overflow-y-auto lg:h-screen">
        <div className="mx-auto space-y-6">
          {/* Mobile Top Header */}
          <div className="flex items-center justify-between lg:hidden pb-3 border-b border-gray-200">
            <Link
              to="/signin"
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#0B3538] hover:text-[#0E8C86] transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Back to Sign In</span>
            </Link>
            <img
              src="/images/Group_56.png"
              alt="SLF Logo"
              className="h-8 object-contain"
            />
          </div>

          <div>
            <h2 className="text-2xl lg:text-3xl font-bold text-[#0B3538]">
              Create Account
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Please enter your details below to register your new account.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-xl p-5 lg:p-6 shadow-sm space-y-4">
              {/* Full Name */}
              <div>
                <label htmlFor="fullName" className={labelClass}>
                  Full Name *
                </label>
                <div className="relative">
                  <div className={iconWrap}>
                    <User className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="e.g. Kamal Perera"
                    className={inputClass}
                    required
                  />
                </div>
              </div>

              {/* Email Address & Phone Number */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="email" className={labelClass}>
                    Email Address *
                  </label>
                  <div className="relative">
                    <div className={iconWrap}>
                      <Mail className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="e.g. kamal.perera@gmail.com"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="mobile_contact_number" className={labelClass}>
                    Phone Number *
                  </label>
                  <div className="relative">
                    <div className={iconWrap}>
                      <Phone className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="tel"
                      id="mobile_contact_number"
                      name="mobile_contact_number"
                      value={formData.mobile_contact_number}
                      onChange={handleChange}
                      placeholder="e.g. 0712345678"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>
              </div>

              {/* NIC / Passport No., Date of Birth & Gender */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="nic" className={labelClass}>
                    NIC / Passport No. *
                  </label>
                  <div className="relative">
                    <div className={iconWrap}>
                      <CreditCard className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="nic"
                      name="nic"
                      value={formData.nic}
                      onChange={handleChange}
                      placeholder="e.g. 200012345678"
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className={labelClass}>
                    Date of Birth *
                  </label>
                  <div className="relative">
                    <div className={iconWrap}>
                      <Calendar className="w-4 h-4 text-gray-400" />
                    </div>
                    <input
                      type="date"
                      id="dateOfBirth"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                </div>

                
              </div>

              <div>
                  <label htmlFor="gender" className={labelClass}>
                    Gender *
                  </label>
                  <div className="relative">
                    <div className={iconWrap}>
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                    <select
                      id="gender"
                      name="gender"
                      value={formData.gender}
                      onChange={handleChange}
                      className={`${inputClass} appearance-none cursor-pointer bg-white`}
                      required
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

              {/* Address */}
              <div>
                <label htmlFor="address" className={labelClass}>
                  Address *
                </label>
                <div className="relative">
                  <div className="absolute top-3.5 left-3.5 pointer-events-none">
                    <MapPin className="w-5 h-5 text-gray-400" />
                  </div>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder="e.g. No. 25, Galle Road, Colombo 03"
                    rows={3}
                    className="block w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] outline-none transition-all text-base text-gray-900 placeholder:text-gray-400 placeholder:text-sm resize-none"
                    required
                  />
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="password" className={labelClass}>
                    Password *
                  </label>
                  <div className="relative">
                    <div className={iconWrap}>
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Minimum 8 characters"
                      className="block w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] outline-none text-base text-gray-900 placeholder:text-sm"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="password_confirmation" className={labelClass}>
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <div className={iconWrap}>
                      <Lock className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      id="password_confirmation"
                      name="password_confirmation"
                      value={formData.password_confirmation}
                      onChange={handleChange}
                      placeholder="Re-enter password"
                      className="block w-full pl-11 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-1 focus:ring-[#0B2C4D] focus:border-[#0B2C4D] outline-none text-base text-gray-900 placeholder:text-sm"
                      required
                      minLength={8}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((p) => !p)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0B3538] hover:bg-[#0E8C86] text-white font-medium py-3 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm text-sm disabled:opacity-75 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="w-4 h-4 text-white animate-spin"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

            {/* Sign In Link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link
                  to="/signin"
                  className="text-[#0E8C86] font-semibold hover:underline"
                >
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;