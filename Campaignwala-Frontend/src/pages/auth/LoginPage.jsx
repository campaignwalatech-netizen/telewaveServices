"use client";
import { useState, useEffect } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useAuth } from "../../hooks/useAuth";
import OtpModal from "../../components/OtpModal";
import toast, { Toaster } from "react-hot-toast";
import {
  selectIsAuthenticated,
  selectUser,
  selectUserRole,
} from "../../redux/slices/authSlice";

export default function LoginPage() {
  const { login, verifyLoginOTP, isLoading, clearAuthError } = useAuth();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);

  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [sendingOtp, setSendingOtp] = useState(false);
  const [developmentOTP, setDevelopmentOTP] = useState("");
  const [formError, setFormError] = useState("");

  // Redirect if already authenticated AND approved
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user is approved
      if (user.registrationStatus !== 'approved') {
        navigate('/pending-approval', { replace: true });
        return;
      }
      
      // Map roles to dashboard routes
      const roleToRoute = {
        admin: "/admin",
        TL: "/tl",
        user: "/user",
      };
      const target = roleToRoute[userRole] || "/";

      if (user?.preferredRoute) {
        navigate(user.preferredRoute, { replace: true });
      } else {
        navigate(target, { replace: true });
      }
    }
  }, [isAuthenticated, userRole, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setDevelopmentOTP("");
    setSendingOtp(true);
    clearAuthError();
    setFormError("");

    try {
      const response = await login({ email, password });

      // Check if OTP is in response
      if (response?.data?.otp) {
        setDevelopmentOTP(response.data.otp);
        if (response.data.emailSent) {
          toast.success("📧 OTP sent to your email!");
        } else {
          toast.success(`🔑 OTP: ${response.data.otp} (Email service unavailable)`, {
            duration: 8000,
          });
        }
      }

      if (response?.requireOTP) {
        // OTP required - show modal
        setUserEmail(response.data?.email || email);
        if (!response.data?.otp) {
          toast.success("📧 OTP sent to your email!");
        }
        setSendingOtp(false);
        setShowOtpModal(true);
      } else {
        console.log("✅ Login successful without OTP");
        setSendingOtp(false);
      }
    } catch (err) {
      setSendingOtp(false);
      // Check for pending approval error from backend
      if (err.message?.includes('pending approval') || err.message?.includes('pending admin approval')) {
        setFormError(err.message);
        toast.error(err.message, {
          duration: 6000,
        });
      } else {
        const errorMsg = err.message || "Failed to send OTP. Please try again.";
        setFormError(errorMsg);
        toast.error(errorMsg);
      }
    }
  }; 

  const handleVerifyOTP = async (otp) => {
    try {
      // Verify OTP and complete login process
      const result = await verifyLoginOTP(userEmail, otp);
      
      // After OTP verification, check if user is approved
      if (result?.requiresApproval) {
        navigate('/pending-approval', { replace: true });
      }
    } catch (error) {
      console.error("OTP verification error:", error);
      throw error;
    }
  };

  const handleResendOTP = async () => {
    try {
      // Resend OTP by making login call again
      const response = await login({ email: userEmail, password });

      if (!response?.requireOTP) {
        throw new Error("Failed to resend OTP");
      }

      // Update success message based on development mode
      if (response.data?.developmentMode) {
        const devOtp = response.data.otp;
        setDevelopmentOTP(devOtp);
        toast.success(`🔑 OTP Regenerated: ${devOtp} (Email service unavailable)`, {
          duration: 8000,
        });
        console.log("🔑 New Development OTP:", devOtp);
      } else {
        toast.success("📧 OTP resent to your email!");
      }

      console.log("✅ OTP resent successfully");
    } catch (error) {
      console.error("Error resending OTP:", error);
      toast.error(error.message || "Failed to resend OTP");
      throw error;
    }
  };

  const handleCloseOtpModal = () => {
    setShowOtpModal(false);
    setDevelopmentOTP("");
  };

  return (
    <main className="min-h-screen bg-background flex flex-col md:flex-row">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
          success: {
            duration: 3000,
            style: {
              background: '#059669',
            },
          },
          error: {
            duration: 5000,
            style: {
              background: '#DC2626',
            },
          },
        }}
      />
      {/* ---------- LEFT SECTION (Desktop Only) ---------- */}
      <div className="hidden md:flex md:w-1/2 bg-muted/30 flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="flex flex-col items-center justify-center gap-2 mb-8">
            <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-card border-2 border-gray-400 overflow-hidden mb-2">
              <img src="/logo.jpeg" alt="Logo" className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            </span>
            <h1 className="text-5xl font-bold text-foreground">
            <span className="font-bold text-3xl">
                Freelancer Wala
              </span></h1>
          </div>

          {/* Image */}
          <div className="mb-8 w-64 mx-auto">
            <img
              src="https://leads.freelancerwaala.com/new_year.gif"
              alt="Freelancer"
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Welcome text */}
          <h3 className="text-2xl font-bold text-foreground mb-4 text-left">
            Welcome to Freelancer Wala!
          </h3>

          <div className="space-y-4 text-left">
            <p className="text-muted-foreground leading-relaxed">
              Ready to transform leads into success? Dive into your daily tasks,
              make those calls, and celebrate your victories! Check out your
              profile along the way.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Ready to boost your career? Join Freelancer Wala today! Get
              Started.
            </p>
          </div>
        </div>
      </div>

      {/* ---------- RIGHT SECTION (Login Form) ---------- */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-10 bg-background mb-16">
        <div className="w-full max-w-md">
          {/* Mobile Header */}
          <div className="md:hidden text-center mb-8">
            <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-card border-2 border-primary overflow-hidden mx-auto mb-4">
              <img src="/logo.jpeg" alt="Logo" className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            </span>
            <h1 className="text-3xl font-bold text-foreground mb-2">
            <span className="font-bold text-lg">
                Freelancer Wala
              </span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <LogIn size={28} className="text-primary" />
              <p className="text-2xl font-bold text-foreground">Login</p>
            </div>
          </div>

          {/* --------- FORM --------- */}
          <form
            onSubmit={handleSubmit}
            className="bg-card rounded-lg shadow-lg p-8 space-y-6 border border-border"
          >
            {formError && formError.includes('pending') && (
              <div className="bg-amber-500/10 border-amber-500/30 text-amber-600 px-4 py-3 rounded-lg text-sm border">
                <div className="flex items-start gap-2">
                  <span>⏳</span>
                  <div>
                    <div className="font-medium">{formError}</div>
                    <button
                      type="button"
                      onClick={() => navigate('/pending-approval')}
                      className="mt-2 text-sm text-blue-600 hover:underline"
                    >
                      Go to approval status page →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-background text-foreground font-medium placeholder:text-muted-foreground"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-background text-foreground font-medium placeholder:text-muted-foreground"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="text-right">
              <Link
                to="/forgot-password"
                className="text-sm font-medium text-primary hover:opacity-80 transition"
              >
                Forgot Password?
              </Link>
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading || sendingOtp}
              className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 flex items-center justify-center gap-2"
            >
              {sendingOtp ? (
                <>
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>SENDING OTP...</span>
                </>
              ) : isLoading ? (
                "LOGGING IN..."
              ) : (
                "SEND OTP & LOGIN"
              )}
            </button>

            {/* Register Link */}
            <div className="text-center pt-4 border-t border-border">
              <p className="text-muted-foreground">
                Don&apos;t have an account yet?{" "}
                <Link
                  to="/register"
                  className="font-medium text-primary hover:opacity-80 transition"
                >
                  Register
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* OTP Modal */}
      <OtpModal
        isOpen={showOtpModal}
        onClose={handleCloseOtpModal}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        email={userEmail}
        purpose="login"
        darkMode={false}
        developmentOTP={developmentOTP}
      />
    </main>
  );
}