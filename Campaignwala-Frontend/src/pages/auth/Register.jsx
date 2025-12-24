import { useState, useEffect } from "react";
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

export default function RegisterPage() {
  const { register, verifyRegistrationOTP, isLoading, error, clearAuthError } = useAuth();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);
  const userRole = useSelector(selectUserRole);

  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [formError, setFormError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [registrationEmail, setRegistrationEmail] = useState("");
  const [developmentOTP, setDevelopmentOTP] = useState("");
  const [pendingApproval, setPendingApproval] = useState(false);

  // Redirect if already authenticated AND approved
  useEffect(() => {
    if (isAuthenticated && user) {
      // Check if user is approved
      if (user.role !== 'admin' && user.status !== 'approved') {
        navigate('/pending-approval', { replace: true });
        return;
      }
      
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
    setFormError("");
    setDevelopmentOTP("");
    setPendingApproval(false);
    clearAuthError();

    console.log("=== REGISTRATION FORM SUBMITTED ===");
    console.log("Form Data:", {
      name,
      email,
      password: password ? "***" : "EMPTY",
      confirmPassword: confirmPassword ? "***" : "EMPTY",
      phoneNumber,
    });

    // Validation
    if (!name || !email || !password || !confirmPassword || !phoneNumber) {
      const errorMsg = "All fields are required";
      setFormError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (password !== confirmPassword) {
      const errorMsg = "Passwords do not match";
      setFormError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (password.length < 6) {
      const errorMsg = "Password must be at least 6 characters long";
      setFormError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      const errorMsg = "Please enter a valid email address";
      setFormError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    if (!/^[0-9]{10}$/.test(phoneNumber)) {
      const errorMsg = "Phone number must be 10 digits";
      setFormError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    console.log("✅ All validations passed");

    try {
      const registrationData = {
        name,
        email,
        phoneNumber,
        password,
        confirmPassword,
      };

      console.log("🔍 Registration data before sending:", registrationData);

      const result = await register(registrationData);
      console.log("✅ Registration step 1 successful!", result);

      if (result?.requireOTP) {
        // Show OTP modal
        setRegistrationEmail(email);

        // Show appropriate message based on development mode
        if (result.data?.developmentMode) {
          const devOtp = result.data.otp;
          setDevelopmentOTP(devOtp);
          toast.success(`🔑 OTP Generated: ${devOtp} (Email service unavailable - use this OTP)`, {
            duration: 8000,
          });
          console.log("🔑 Development OTP:", devOtp);
        } else {
          toast.success("📧 OTP sent to your email! Please verify to complete registration.");
        }

        setShowOtpModal(true);
      } else {
        // Should not happen with new flow
        toast.success("Registration successful! Redirecting...");
        setTimeout(() => {
          window.location.href = "/user";
        }, 2000);
      }
    } catch (err) {
      console.error("❌ Registration error:", err);
      const errorMsg = err.message || "Registration failed. Please try again.";
      setFormError(errorMsg);
      toast.error(errorMsg);
    }
  };

  const handleVerifyOTP = async (otp) => {
  try {
    console.log("🔑 Verifying registration OTP:", otp);
    const result = await verifyRegistrationOTP(registrationEmail, otp);
    
    if (result?.requiresAdminApproval) {
      // Show message about pending admin approval
      setPendingApproval(true);
      toast.success("✅ Registration successful! Your account is now pending admin approval. You will be notified once approved.", {
        duration: 5000,
      });
      
      // Clear OTP modal and redirect after delay
      setTimeout(() => {
        setShowOtpModal(false);
        setDevelopmentOTP("");
        navigate('/pending-approval', { replace: true });
      }, 2000); // Reduced delay for better UX
    } else {
      // Standard redirect - verifyRegistrationOTP should handle navigation
      console.log("✅ Registration completed successfully!");
      toast.success("✅ Registration completed successfully!");
    }
  } catch (error) {
    console.error("OTP verification error:", error);
    toast.error(error.message || "Failed to verify OTP. Please try again.");
    throw error;
  }
};

  const handleResendOTP = async () => {
    try {
      // Resend OTP by making registration call again
      const registrationData = {
        name,
        email: registrationEmail,
        password,
        confirmPassword,
        phoneNumber,
      };

      const result = await register(registrationData);

      if (!result?.requireOTP) {
        throw new Error("Failed to resend OTP");
      }

      // Update success message based on development mode
      if (result.data?.developmentMode) {
        const devOtp = result.data.otp;
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
    if (!pendingApproval) {
      setShowOtpModal(false);
      setDevelopmentOTP("");
    }
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
      {/* ---------- LEFT PANEL ---------- */}
      <div className="hidden md:flex md:w-1/2 bg-muted/30 flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="flex flex-col items-center justify-center gap-2 mb-8">
            <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-card border-2 border-gray-400 overflow-hidden mb-2">
              <img src="/logo.jpeg" alt="Logo" className="h-full w-full object-cover" onError={(e) => { e.target.style.display = 'none'; }} />
            </span>
            <h1 className="text-3xl font-bold text-foreground">
            <span className="font-bold text-lg">
                Freelancer<span className="text-yellow-500"> Wala</span>
              </span>
            </h1>
          </div>

          {/* Image */}
          <div className="mb-8 w-64 mx-auto">
            <img
              src="https://leads.freelancerwaala.com/new_year.gif"
              alt="Freelancer"
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-4 text-left">Welcome to Freelancer Wala!</h3>
          <p className="text-muted-foreground leading-relaxed">
            Ready to transform leads into success? Dive into your daily tasks and celebrate your victories!
          </p>
        </div>
      </div>

      {/* ---------- RIGHT PANEL ---------- */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 md:p-10 bg-background">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground">Register</h1>
            <p className="text-sm text-muted-foreground mt-2">
              Create your account with email and password
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-card rounded-lg shadow-lg p-8 space-y-6 border border-border">
            {(error || formError) && !formError.includes('pending') && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                {error || formError}
              </div>
            )}

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-foreground mb-2">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground font-medium placeholder:text-muted-foreground"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-foreground mb-2">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground font-medium placeholder:text-muted-foreground"
                required
              />
            </div>

            <div>
              <label htmlFor="phoneNumber" className="block text-sm font-medium text-foreground mb-2">
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground font-medium placeholder:text-muted-foreground"
                required
                pattern="[0-9]{10}"
                maxLength="10"
              />
              <p className="text-xs text-muted-foreground mt-1">10-digit phone number without country code</p>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-foreground mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Create a password (min 6 characters)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground font-medium placeholder:text-muted-foreground pr-12"
                  required
                  minLength="6"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268 2.943-9.542-7z" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Password must be at least 6 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground font-medium placeholder:text-muted-foreground"
                required
                minLength="6"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || pendingApproval}
              className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
            >
              {isLoading ? "SENDING OTP..." : "SEND OTP & REGISTER"}
            </button>

            <div className="text-center pt-4 border-t border-border">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link to="/" className="font-medium text-primary hover:opacity-80 transition">
                  Login
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
        email={registrationEmail}
        purpose="registration"
        darkMode={false}
        developmentOTP={developmentOTP}
        isPendingApproval={pendingApproval}
      />
    </main>
  );
}