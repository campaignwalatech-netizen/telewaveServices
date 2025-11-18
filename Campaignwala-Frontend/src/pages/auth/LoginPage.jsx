"use client";
import { useState } from "react";
import { Eye, EyeOff, LogIn } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import authService from "../../services/authService";
import OtpModal from "../../components/OtpModal";

export default function LoginPage() {
  const { login, isLoading, error } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [tempLoginData, setTempLoginData] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false); // New state for OTP sending
  const [successMessage, setSuccessMessage] = useState(""); // Success message state

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setSuccessMessage(""); // Clear previous success message
    setSendingOtp(true); // Start loading
    
    try {
      // First attempt login - backend will send OTP based on user role
      const response = await authService.login({ phoneNumber, password });
      
      if (response.requireOTP) {
        // OTP required - show modal
        const otpType = response.otpType || 'email';
        
        if (otpType === 'mobile') {
          // Admin - Mobile OTP
          setUserEmail(`your mobile ${response.data?.phoneNumber || 'number'}`);
          setSuccessMessage("📱 OTP sent to your mobile number!");
        } else {
          // User - Email OTP
          setUserEmail(response.data?.email || 'your registered email');
          setSuccessMessage("📧 OTP sent to your email!");
        }
        
        setTempLoginData({ phoneNumber, password });
        setSendingOtp(false); // Stop loading
        setShowOtpModal(true);
        
        // Show OTP in development mode
        if (response.data?.otp) {
          console.log('🔑 Development OTP:', response.data.otp);
          if (otpType === 'mobile') {
            alert(`Admin Mobile OTP: ${response.data.otp}`);
          } else {
            console.log('📧 Check your email for OTP');
          }
        }
      } else if (response.success && response.data) {
        // Login successful without OTP (backward compatibility)
        // Store auth data
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', response.data.user?.role || 'user');
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setSendingOtp(false); // Stop loading
        
        // Redirect based on role
        if (response.data.user?.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/user';
        }
      }
    } catch (error) {
      // Error is handled by Redux state
      console.error('Login error:', error);
      setSendingOtp(false); // Stop loading on error
    }
  };

  const handleVerifyOTP = async (otp) => {
    try {
      // Login with OTP
      const response = await authService.login({
        ...tempLoginData,
        otp
      });
      
      if (response.success) {
        // Store auth data and redirect
        localStorage.setItem('accessToken', response.data.token);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userType', response.data.user.role);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        setShowOtpModal(false);
        
        // Redirect based on role
        if (response.data.user.role === 'admin') {
          window.location.href = '/admin';
        } else {
          window.location.href = '/user';
        }
      } else {
        throw new Error(response.message || 'OTP verification failed');
      }
    } catch (error) {
      console.error('OTP verification error:', error);
      throw error; // Re-throw to be handled by OtpModal
    }
  };

  const handleResendOTP = async () => {
    try {
      // Resend OTP by making login call again
      const response = await authService.login(tempLoginData);
      
      if (!response.requireOTP) {
        throw new Error('Failed to resend OTP');
      }
      
      // Success message based on OTP type
      console.log('✅ OTP resent successfully');
    } catch (error) {
      console.error('Error resending OTP:', error);
      throw error; // Re-throw to be handled by OtpModal
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* ---------- LEFT SECTION (Desktop Only) ---------- */}
      <div className="hidden md:flex md:w-1/2 bg-muted/30 flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="flex flex-col items-center justify-center gap-2 mb-8">
            <span className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-card border-2 border-primary overflow-hidden mb-2">
              <img src="/logo.jpeg" alt="Logo" className="h-full w-full object-cover" />
            </span>
            <h2 className="text-3xl font-bold text-foreground">Campaign Waala</h2>
          </div>

          {/* Image */}
          <div className="mb-8 w-64 mx-auto">
            <img
              src="https://leads.freelancerwaala.com/new_year.gif"
              alt="Campaign"
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Welcome text */}
          <h3 className="text-2xl font-bold text-foreground mb-4 text-left">
            Welcome to Campaign Waala!
          </h3>

          <div className="space-y-4 text-left">
            <p className="text-muted-foreground leading-relaxed">
              Ready to transform leads into success? Dive into your daily tasks,
              make those calls, and celebrate your victories! Check out your
              profile along the way.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Ready to boost your career? Join Campaign Waala today! Get
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
              <img src="/logo.jpeg" alt="Logo" className="h-full w-full object-cover" />
            </span>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Campaign Waala
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
            {error && (
              <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-50 border border-green-300 text-green-800 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <span>✅</span>
                <span>{successMessage}</span>
              </div>
            )}

            {/* Phone Number */}
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-foreground mb-2"
              >
                Phone Number
              </label>
              <input
                id="phoneNumber"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-background text-foreground font-medium placeholder:text-muted-foreground"
                required
                pattern="[0-9]{10}"
                maxLength="10"
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
                "LOGIN"
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
        onClose={() => setShowOtpModal(false)}
        onVerify={handleVerifyOTP}
        onResend={handleResendOTP}
        email={userEmail}
        purpose="login"
        darkMode={false}
      />
    </main>
  );
  
}
