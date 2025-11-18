import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Mail, Lock } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { requestPasswordReset, resetUserPassword, isLoading, error } = useAuth();
  const [step, setStep] = useState("phone"); // phone, otp, success
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");
  const [otpData, setOtpData] = useState(null);

  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!phone || phone.length !== 10) {
      setFormError("Please enter a valid 10-digit phone number");
      return;
    }

    try {
      const response = await requestPasswordReset(phone);
      setOtpData(response);
      setStep("otp");
    } catch (err) {
      setFormError(err.message || "Failed to send OTP");
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!otp || otp.length !== 4) {
      setFormError("Please enter the 4-digit OTP");
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    if (newPassword !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    try {
      await resetUserPassword({
        phoneNumber: phone,
        otp: otp,
        newPassword: newPassword
      });
      setStep("success");
    } catch (err) {
      setFormError(err.message || "Failed to reset password");
    }
  };

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <button
          onClick={() => navigate("/login")}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6 transition"
        >
          <ArrowLeft size={20} />
          Back to Login
        </button>

        <div className="bg-card rounded-lg shadow-lg p-8 border border-border">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-primary via-primary/90 to-primary/70 rounded-full flex items-center justify-center mx-auto mb-4">
              {step === "success" ? <Lock className="w-8 h-8 text-primary-foreground" /> : <Mail className="w-8 h-8 text-primary-foreground" />}
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {step === "phone" && "Forgot Password?"}
              {step === "otp" && "Reset Password"}
              {step === "success" && "Password Reset!"}
            </h1>
            <p className="text-muted-foreground">
              {step === "phone" && "Enter your phone number to receive OTP"}
              {step === "otp" && "Enter OTP and create new password"}
              {step === "success" && "Your password has been reset successfully"}
            </p>
          </div>

          {(error || formError) && (
            <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm mb-4">
              {error || formError}
            </div>
          )}

          {step === "phone" && (
            <form onSubmit={handleRequestOTP} className="space-y-6">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-foreground mb-2">
                  Phone Number
                </label>
                <input
                  id="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition bg-background text-foreground placeholder:text-muted-foreground"
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter your registered 10-digit phone number</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 hover:opacity-90"
              >
                {isLoading ? "SENDING..." : "SEND RESET OTP"}
              </button>
            </form>
          )}

          {step === "otp" && (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  OTP Code
                </label>
                <input
                  type="text"
                  placeholder="Enter 4-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground text-center text-lg tracking-widest font-bold"
                  required
                  maxLength="4"
                />
                <p className="text-xs text-muted-foreground mt-1 text-center">
                  {otpData?.otp ? `Use OTP: ${otpData.otp}` : 'Check your phone for OTP'}
                </p>
              </div>

              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-foreground mb-2">
                  New Password
                </label>
                <input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                  minLength="6"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-foreground mb-2">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary bg-background text-foreground"
                  required
                  minLength="6"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg transition disabled:opacity-50 hover:opacity-90"
              >
                {isLoading ? "RESETTING..." : "RESET PASSWORD"}
              </button>
            </form>
          )}

          {step === "success" && (
            <div className="text-center space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg">
                Your password has been reset successfully!
              </div>
              <Link
                to="/login"
                className="block w-full text-center bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg transition hover:opacity-90"
              >
                Go to Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
