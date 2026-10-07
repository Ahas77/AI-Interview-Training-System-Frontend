import { useState, useEffect } from "react";
import {
  Eye,
  EyeOff,
  Mail,
  Phone,
  Lock,
  ArrowRight,
  ArrowLeft,
  // LogIn ,
} from "lucide-react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { defaultConfig } from "../configs/common";
import { setAuthStorage } from "../lib/authStorage";

type LaravelValidationErrors = Record<string, string[]>;

type LaravelErrorResponse = {
  message?: string;
  errors?: LaravelValidationErrors;
};

function SigninPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: "email",
    value: "",
    password: "",
  });
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotForm, setForgotForm] = useState({
    email: "",
    otp: "",
    password: "",
    password_confirmation: "",
  });
  const [rememberMe, setRememberMe] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(0);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;

    if (name === "value" && formData.type === "mobile_contact_number") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, value: digitsOnly }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleForgotChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForgotForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.type === "mobile_contact_number" && !/^0\d{9}$/.test(formData.value)) {
      toast.error("Mobile number must start with 0 and be exactly 10 digits.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(`${defaultConfig.BASE_API_URL}/login`, {
        value: formData.value,
        password: formData.password,
        type: formData.type,
      });

      const data = response.data;

      if (!data.success) {
        toast.error(data.message || "An error occurred");
        setLoading(false);
        return;
      }

      const { token } = response.data;
      const name = response.data.data.name;
      const avatar = response.data.data.avatar;
      const role = response.data.data.role;
      const user_id = response.data.data.user_id;
      const email = response.data.data.email;

      if (token) {
        setAuthStorage(
          {
            authToken: String(token || ""),
            name: String(name || ""),
            avatar: String(avatar || ""),
            role: String(role || ""),
            user_id: String(user_id || ""),
            email: String(email || ""),
          },
          rememberMe,
        );

        toast.success(response?.data?.message);
        navigate("/interview-checkout", {
          state: { email: data?.data?.email },
        });
      } else {
        throw new Error("Token not found in response");
      }

      setError(null);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const responseData = error.response?.data as LaravelErrorResponse | undefined;
        const errorMessage = responseData?.message || "Server error occurred";

        if (error.response?.status === 422) {
          const validationErrors = responseData?.errors;
          if (validationErrors) {
            Object.values(validationErrors).forEach((errArray) => {
              errArray.forEach((err) => toast.error(err));
            });
          } else {
            toast.error(errorMessage);
          }
        } else if (error.response?.status === 400) {
          toast.error(errorMessage);
        } else {
          toast.error(errorMessage);
        }
      } else if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("An unexpected error occurred");
      }
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotOtp = async () => {
    if (!forgotForm.email) {
      toast.error("Please enter your email address.");
      return;
    }
    setForgotLoading(true);

    try {
      const response = await axios.post(
        `${defaultConfig.BASE_API_URL}/forgotpassword`,
        {
          email: forgotForm.email,
        },
      );

      if (!response.data?.success) {
        toast.error(response.data?.message || "Unable to send OTP.");
        return;
      }

      toast.success(response.data?.message || "OTP emailed successfully.");
      setTimeLeft(60);
      setForgotStep(2);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.message || "Failed to send OTP.");
      } else {
        toast.error("Failed to send OTP.");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetForgotPassword = async () => {
    if (!forgotForm.otp || !forgotForm.password || !forgotForm.password_confirmation) {
      toast.error("Please fill in all verification fields.");
      return;
    }
    if (forgotForm.password.length < 8) {
      toast.error("Password must be at least 8 characters long.");
      return;
    }
    if (forgotForm.password !== forgotForm.password_confirmation) {
      toast.error("Passwords do not match.");
      return;
    }

    setForgotLoading(true);

    try {
      const response = await axios.post(
        `${defaultConfig.BASE_API_URL}/otpforgotpassword`,
        forgotForm,
      );

      if (!response.data?.status && !response.data?.success) {
        toast.error(response.data?.message || "Unable to reset password.");
        return;
      }

      toast.success(response.data?.message || "Password changed successfully.");
      setShowForgotPassword(false);
      setForgotStep(1);
      setForgotForm({
        email: "",
        otp: "",
        password: "",
        password_confirmation: "",
      });
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const validationErrors = error.response?.data?.errors;
        if (validationErrors) {
          Object.values(validationErrors).forEach((errArray: any) => {
            if (Array.isArray(errArray)) {
              errArray.forEach((err: string) => toast.error(err));
            }
          });
        } else {
          toast.error(
            error.response?.data?.message || "Failed to reset password.",
          );
        }
      } else {
        toast.error("Failed to reset password.");
      }
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen lg:flex-row lg:h-screen lg:overflow-hidden">
      {/* Promo Hero Section (Desktop Only) */}
      <div className="hidden lg:flex relative bg-gradient-to-br from-[#0B3538] via-[#0E8C86] to-[#0B3538] lg:w-1/2 lg:flex-none p-8 lg:p-16 flex-col justify-between text-white overflow-hidden lg:h-screen">
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover"
          style={{
            backgroundImage: "url('/images/building-4884852_640.jpg')",
          }}
        ></div>
        <div className="absolute inset-0 bg-gradient-to-br from-[#0B3538]/95 via-[#0E8C86]/98 to-[#0B3538]/90"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B3538] via-transparent to-transparent"></div>

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 bg-[#0E8C86] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#0E8C86] rounded-full blur-3xl"></div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-2/3 opacity-20">
          <div className="absolute bottom-0 left-[10%] w-32 h-48 bg-gradient-to-t from-[#0B3538] to-transparent"></div>
          <div className="absolute bottom-0 left-[25%] w-24 h-64 bg-gradient-to-t from-[#0B3538] to-transparent"></div>
          <div className="absolute bottom-0 left-[40%] w-28 h-56 bg-gradient-to-t from-[#0B3538] to-transparent"></div>
          <div className="absolute bottom-0 left-[60%] w-20 h-72 bg-gradient-to-t from-[#0B3538] to-transparent"></div>
          <div className="absolute bottom-0 left-[75%] w-32 h-60 bg-gradient-to-t from-[#0B3538] to-transparent"></div>
        </div>

        <div className="relative z-10 mb-8 lg:mb-0">
          <div className="flex items-center">
            {/* <img
              src="/images/logo-1.png"
              alt="Sri Lankan Festival (Pvt) Ltd"
              className="object-contain w-auto h-12 lg:h-16"
            /> */}
          </div>
        </div>

        <div className="relative z-10">
          <h2 className="text-2xl font-bold lg:text-3xl xl:text-4xl">
            Build a Strong Tech Career{" "}
          </h2>
          <h2 className="mb-6 text-2xl font-bold lg:text-3xl xl:text-4xl">
            <span className="text-[#0E8C86]">with Professional Training</span>
          </h2>
          <p className="text-[#D1D5DB] text-base lg:text-lg max-w-lg mt-16">
            Join over 5,000+ professionals advancing their careers through our
            industry-recognized diploma programs and certifications.
          </p>
        </div>
      </div>

      {/* Main Login Form Stage */}
      <div className="flex items-center justify-center flex-1 p-6 lg:p-12 bg-gray-50 min-h-screen lg:min-h-0 lg:overflow-y-auto">
        <div className="w-full">
          {/* Back to Home Action Button */}
          <div className="flex items-center justify-between mb-4">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-sans font-extrabold text-[#0B3538] hover:text-white bg-slate-100 hover:bg-[#0B3538] px-3.5 py-2 rounded-xl transition-all shadow-sm group"
            >
              <ArrowLeft size={16} className="text-[#0E8C86] group-hover:text-white transition-colors" />
              <span>Back to Home</span>
            </Link>
          </div>

          <div className="bg-white border border-gray-200 shadow-sm rounded-2xl p-6 lg:p-8">
            <div className="flex justify-start mb-6">
              <div className="flex items-center justify-center w-full">
                <img
                  src="/images/Group_56.png"
                  alt="Sri Lankan Festival (Pvt) Ltd"
                  className="object-contain h-12 lg:h-16 mx-auto"
                />
              </div>
            </div>

            {!showForgotPassword ? (
              <>
                <h2 className="text-3xl lg:text-4xl font-bold text-[#0B3538] text-left mb-2">
                  Welcome back
                </h2>
                <p className="mb-8 text-left text-gray-500">
                  Please enter your details to access your dashboard.
                </p>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="block mb-2 text-sm font-medium text-gray-700">
                      Sign in with
                    </label>

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, type: "email" })}
                        className={`px-4 py-2 rounded-lg border ${formData.type === "email"
                            ? "bg-[#0E8C86] text-white"
                            : "bg-white text-gray-700"
                          }`}
                      >
                        Email
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, type: "mobile_contact_number" })
                        }
                        className={`px-4 py-2 rounded-lg border ${formData.type === "mobile_contact_number"
                            ? "bg-[#0E8C86] text-white"
                            : "bg-white text-gray-700"
                          }`}
                      >
                        Mobile Number
                      </button>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="value"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      {formData.type === "mobile_contact_number"
                        ? "Mobile Number"
                        : "Email"}
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        {formData.type === "mobile_contact_number" ? (
                          <Phone className="w-5 h-5 text-gray-400" />
                        ) : (
                          <Mail className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <input
                        type={formData.type === "mobile_contact_number" ? "tel" : "email"}
                        id="value"
                        name="value"
                        value={formData.value}
                        onChange={handleChange}
                        placeholder={
                          formData.type === "mobile_contact_number"
                            ? "e.g. 0712345678"
                            : "e.g. student@slf.lk"
                        }
                        inputMode={formData.type === "mobile_contact_number" ? "numeric" : undefined}
                        maxLength={formData.type === "mobile_contact_number" ? 10 : undefined}
                        autoComplete={formData.type === "mobile_contact_number" ? "tel" : "email"}
                        pattern={formData.type === "mobile_contact_number" ? "0\\d{9}" : undefined}
                        className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E8C86] focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                        required
                      />
                    </div>
                    {formData.type === "mobile_contact_number" && (
                      <p className="mt-1 text-xs text-gray-500">Must start with 0 and be exactly 10 digits</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="password"
                      className="block mb-2 text-sm font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        autoComplete="current-password"
                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 placeholder:text-gray-400 rounded-lg focus:ring-2 focus:ring-[#0E8C86] focus:border-transparent outline-none transition-all text-gray-900"
                        required
                      />
                      <button
                        type="button"
                        onClick={togglePasswordVisibility}
                        aria-label={showPassword ? "Hide password" : "Show password"}
                        className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 transition-colors hover:text-gray-600"
                      >
                        {showPassword ? (
                          <EyeOff className="w-5 h-5" />
                        ) : (
                          <Eye className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <input
                        id="remember-me"
                        name="remember-me"
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="h-4 w-4 text-[#0E8C86] border-gray-500 rounded cursor-pointer"
                      />
                      <label
                        htmlFor="remember-me"
                        className="block ml-2 text-sm text-gray-700 cursor-pointer"
                      >
                        Remember me
                      </label>
                    </div>
                    <div>
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setForgotStep(1);
                          if (formData.type === "email" && formData.value) {
                            setForgotForm((prev) => ({ ...prev, email: formData.value }));
                          }
                        }}
                        className="text-sm text-[#0E8C86] hover:text-[#0B3538] font-medium transition-colors"
                      >
                        Forgot password?
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="group w-full bg-[#0B3538] hover:bg-[#0E8C86] text-white font-medium py-3.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <>
                        <svg
                          className="w-5 h-5 text-white animate-spin"
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
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Logging in...</span>
                      </>
                    ) : (
                      <>
                        <span>Log In to Dashboard</span>
                        <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                      </>
                    )}
                  </button>
                </form>

                <div className="flex items-center my-6">
                  <div className="flex-grow h-px bg-gray-300"></div>
                  <span className="mx-4 text-sm text-gray-500 font-medium">or</span>
                  <div className="flex-grow h-px bg-gray-300"></div>
                </div>

                {/* Create Account */}
                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Need an account?{" "}
                    <Link to="/register" className="text-[#0E8C86] font-medium hover:underline">
                      Create one
                    </Link>
                  </p>
                </div>
              </>
            ) : (
              <>
                {forgotStep === 1 ? (
                  <>
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#0B3538] text-left mb-2">
                      Reset Password
                    </h2>
                    <p className="mb-8 text-left text-gray-500 text-sm">
                      Enter your registered email address below, and we will send you a 6-digit OTP code to reset your password.
                    </p>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendForgotOtp();
                      }}
                      className="space-y-5"
                    >
                      <div>
                        <label htmlFor="forgot-email" className="block mb-2 text-sm font-medium text-gray-700">
                          Email Address
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            id="forgot-email"
                            name="email"
                            value={forgotForm.email}
                            onChange={handleForgotChange}
                            placeholder="e.g. student@eyeschool.lk"
                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E8C86] focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                            required
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="group w-full bg-[#0B3538] hover:bg-[#0E8C86] text-white font-medium py-3.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {forgotLoading ? (
                          <>
                            <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Sending OTP...</span>
                          </>
                        ) : (
                          <>
                            <span>Send OTP to Email</span>
                            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                          </>
                        )}
                      </button>

                      <div className="text-center mt-6">
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(false);
                            setForgotForm({ email: "", otp: "", password: "", password_confirmation: "" });
                          }}
                          className="text-sm text-gray-600 hover:text-[#0E8C86] font-medium transition-colors"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    </form>
                  </>
                ) : (
                  <>
                    <h2 className="text-3xl lg:text-4xl font-bold text-[#0B3538] text-left mb-2">
                      Verify OTP
                    </h2>
                    <p className="mb-8 text-left text-gray-500 text-sm">
                      We have sent a 6-digit verification code to <span className="font-semibold text-gray-700">{forgotForm.email}</span>. Please check your inbox.
                    </p>

                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleResetForgotPassword();
                      }}
                      className="space-y-5"
                    >
                      <div>
                        <label htmlFor="forgot-otp" className="block mb-2 text-sm font-medium text-gray-700">
                          6-Digit OTP
                        </label>
                        <input
                          type="text"
                          id="forgot-otp"
                          name="otp"
                          value={forgotForm.otp}
                          onChange={handleForgotChange}
                          placeholder="e.g. 123456"
                          maxLength={6}
                          required
                          className="block w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E8C86] focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400 text-center font-mono text-lg tracking-widest"
                        />
                        <div className="mt-2 text-right flex justify-end items-center h-6">
                          {timeLeft > 0 ? (
                            <span className="text-xs text-gray-500 font-medium flex items-center gap-1.5 bg-gray-50 border border-gray-100 rounded-full px-3 py-1 animate-pulse">
                              <span className="w-1.5 h-1.5 bg-[#0E8C86] rounded-full animate-ping"></span>
                              Resend code in <span className="font-mono font-bold text-[#0E8C86]">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendForgotOtp}
                              disabled={forgotLoading}
                              className="text-xs text-[#0E8C86] hover:text-[#0B3538] font-bold transition-all flex items-center gap-1 hover:scale-105 active:scale-95 disabled:opacity-50"
                            >
                              {forgotLoading ? (
                                <span className="flex items-center gap-1">
                                  <svg className="w-3.5 h-3.5 text-[#0E8C86] animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                  </svg>
                                  Sending...
                                </span>
                              ) : (
                                "Didn't receive code? Resend OTP"
                              )}
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label htmlFor="forgot-password" className="block mb-2 text-sm font-medium text-gray-700">
                          New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Lock className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            id="forgot-password"
                            name="password"
                            value={forgotForm.password}
                            onChange={handleForgotChange}
                            placeholder="Min. 8 characters"
                            required
                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E8C86] focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="forgot-password-conf" className="block mb-2 text-sm font-medium text-gray-700">
                          Confirm New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Lock className="w-5 h-5 text-gray-400" />
                          </div>
                          <input
                            type="password"
                            id="forgot-password-conf"
                            name="password_confirmation"
                            value={forgotForm.password_confirmation}
                            onChange={handleForgotChange}
                            placeholder="••••••••"
                            required
                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0E8C86] focus:border-transparent outline-none transition-all text-gray-900 placeholder:text-gray-400"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        disabled={forgotLoading}
                        className="group w-full bg-[#0B3538] hover:bg-[#0E8C86] text-white font-medium py-3.5 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                      >
                        {forgotLoading ? (
                          <>
                            <svg className="w-5 h-5 text-white animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <span>Resetting Password...</span>
                          </>
                        ) : (
                          <>
                            <span>Verify OTP & Reset Password</span>
                            <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
                          </>
                        )}
                      </button>

                      <div className="flex justify-between items-center mt-6">
                        <button
                          type="button"
                          onClick={() => setForgotStep(1)}
                          className="text-sm text-gray-600 hover:text-[#0E8C86] font-medium transition-colors"
                        >
                          Change Email
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setShowForgotPassword(false);
                            setForgotForm({ email: "", otp: "", password: "", password_confirmation: "" });
                          }}
                          className="text-sm text-gray-600 hover:text-[#0E8C86] font-medium transition-colors"
                        >
                          Back to Sign In
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SigninPage;
