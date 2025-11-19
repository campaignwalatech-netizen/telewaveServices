import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CheckCircle, ArrowLeft } from "lucide-react";

export default function OtpVerification() {
  const navigate = useNavigate();
  const location = useLocation();
  const phone = location.state?.phone || "";
  const userType = location.state?.userType || "";
  
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [error, setError] = useState("");
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!phone || !userType) {
      navigate("/");
    }
  }, [phone, userType, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setError("");

    // Auto-focus next input
    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 4);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, i) => {
      if (i < 4) newOtp[i] = char;
    });
    setOtp(newOtp);
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const otpCode = otp.join("");

    if (otpCode.length !== 4) {
      setError("Please enter complete OTP");
      return;
    }

    // Dummy verification - accept any 4 digit code
    console.log("=== OTP VERIFICATION SUCCESS ===");
    console.log("Setting localStorage...");
    console.log("phone:", phone);
    console.log("userType:", userType);
    
    // Clear any existing data first
    localStorage.clear();
    
    localStorage.setItem("isLoggedIn", "true");
    localStorage.setItem("userPhone", phone);
    localStorage.setItem("userType", userType);
    
    console.log("localStorage after setting:");
    console.log("isLoggedIn:", localStorage.getItem("isLoggedIn"));
    console.log("userPhone:", localStorage.getItem("userPhone"));
    console.log("userType:", localStorage.getItem("userType"));
    
    // Small delay to ensure localStorage is set
    setTimeout(() => {
      // Route to correct dashboard based on user type
      if (userType === "admin") {
        console.log("🚀 Navigating to /admin");
        navigate("/admin");
      } else if (userType === "user") {
        console.log("🚀 Navigating to /user");
        navigate("/user");
      }
    }, 100);
  };

  const handleResend = () => {
    setOtp(["", "", "", ""]);
    setResendTimer(30);
    setError("");
    inputRefs.current[0]?.focus();
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-border/50 p-6 shadow-2xl">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Login
          </button>

          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-xl flex items-center justify-center shadow-lg">
              <CheckCircle className="w-6 h-6 text-primary-foreground" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-center text-foreground mb-2">
            Verify OTP
          </h2>
          <p className="text-center text-sm text-muted-foreground mb-6">
            Enter the 4-digit code sent to<br />
            <span className="font-semibold text-foreground">{phone}</span>
          </p>

          <form onSubmit={handleVerify} className="space-y-5">
            <div className="flex gap-2 justify-center" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputRefs.current[index] = el)}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  className="w-10 h-12 text-center text-xl font-bold bg-background border-2 border-border rounded-lg focus:outline-none focus:ring-primary focus:border-primary text-foreground transition-all"
                  autoFocus={index === 0}
                />
              ))}
            </div>

            {error && (
              <p className="text-xs text-red-500 text-center">{error}</p>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all duration-200 font-semibold shadow-md hover:shadow-lg text-sm"
            >
              Verify & Continue
            </button>

            <div className="text-center">
              {resendTimer > 0 ? (
                <p className="text-xs text-muted-foreground">
                  Resend code in <span className="font-semibold text-foreground">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-xs text-primary hover:text-primary/80 font-semibold transition-colors"
                >
                  Resend Code
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
