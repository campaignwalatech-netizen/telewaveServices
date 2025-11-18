import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export default function RegisterPage() {
  const { register, requestOTP, isLoading, error } = useAuth();
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [info, setInfo] = useState("");
  const [formError, setFormError] = useState("");
  const [otpData, setOtpData] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const STATIC_OTP = import.meta.env.VITE_STATIC_OTP || "1006";

  const sendOtp = async (e) => {
  e.preventDefault();
  setFormError("");
  setInfo("");

  console.log('📞 Send OTP clicked, phone:', phone);

  if (!phone || phone.length !== 10) {
    console.log('❌ Phone validation failed:', phone);
    setFormError("Please enter a valid 10-digit phone number");
    return;
  }

  console.log('✅ Phone validation passed, calling requestOTP...');

  try {
    // For registration flow, we need to handle new users
    const response = await requestOTP(phone);
    console.log('✅ OTP Response received:', response);
    setOtpData(response);
    
    // Show OTP in development mode
    if (response.otp) {
      setInfo(`OTP sent: ${response.otp}`);
    } else {
      setInfo(`OTP sent to ${phone}`);
    }
    
    console.log('✅ Moving to OTP step');
    setStep("otp");
  } catch (err) {
    console.error('❌ Send OTP Error:', err);
    
    // Handle the "user not found" error specifically for registration
    if (err.message.includes('User not found') && err.message.includes('register first')) {
      // This is actually OK for registration - generate OTP locally
      const staticOtp = "1006"; // or generate a random one
      setInfo(`OTP for registration: ${staticOtp}`);
      setOtpData({ otp: staticOtp, isNewUser: true });
      setStep("otp");
    } else {
      setFormError(err.message || "Failed to send OTP");
    }
  }
};

  const verifyOtp = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!otp || otp.length !== 4) {
      setFormError("Please enter the 4-digit OTP");
      return;
    }

    // For registration, just verify OTP locally (user doesn't exist yet in DB)
    if (otp !== STATIC_OTP) {
      setFormError("Invalid OTP. Please try again.");
      return;
    }

    // OTP is correct, move to details step
    setInfo("OTP verified! Please complete your registration.");
    setStep("details");
  };

  const completeRegistration = async (e) => {
    e.preventDefault();
    setFormError("");

    console.log('=== REGISTRATION FORM SUBMITTED ===');
    console.log('Current State Values:');
    console.log('  phone:', phone);
    console.log('  otp:', otp);
    console.log('  name:', name);
    console.log('  email:', email);
    console.log('  password:', password ? '***' : 'EMPTY');

    // Validation
    if (!name || !email || !password) {
      console.log('❌ Validation failed: Missing name/email/password');
      setFormError("All fields are required");
      return;
    }

    if (password.length < 6) {
      console.log('❌ Validation failed: Password too short');
      setFormError("Password must be at least 6 characters long");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('❌ Validation failed: Invalid email format');
      setFormError("Please enter a valid email address");
      return;
    }

    // Debug: Check if phone and OTP are available
    if (!phone || !otp) {
      console.log('❌ Validation failed: Missing phone or OTP');
      setFormError("Session expired. Please start registration again.");
      setStep("phone");
      return;
    }

    console.log('✅ All validations passed');

    try {
      // Complete registration with all details
      const registrationData = {
        phoneNumber: phone,
        otp: otp,
        name: name,
        email: email,
        password: password
      };
      
      console.log('🔍 Registration data before sending:', registrationData);
      
      await register(registrationData);
      console.log('✅ Registration successful!');
      // Navigation handled by useAuth hook
    } catch (err) {
      console.error('❌ Registration error:', err);
      setFormError(err.message || "Registration failed. Please try again.");
    }
  };

  return (
    <main className="min-h-screen bg-background flex flex-col md:flex-row">
      {/* ---------- LEFT PANEL ---------- */}
      <div className="hidden md:flex md:w-1/2 bg-muted/30 flex-col items-center justify-center p-8">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-2 mb-8">
            <svg className="w-10 h-10" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="40" height="40" rx="8" fill="#FF9500" />
              <text x="20" y="26" fontSize="20" fontWeight="bold" fill="white" textAnchor="middle">
                C
              </text>
            </svg>
            <h2 className="text-3xl font-bold text-foreground">Campaign Waala</h2>
          </div>

          <div className="mb-8 w-64 mx-auto">
            <img
              src="https://leads.freelancerwaala.com/new_year.gif"
              alt="Campaign Illustration"
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-4 text-left">Welcome to Campaign Waala!</h3>
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
            {info && <p className="text-sm text-muted-foreground mt-2">{info}</p>}
          </div>

          {step === "phone" ? (
            <form onSubmit={sendOtp} className="bg-card rounded-lg shadow-lg p-8 space-y-6 border border-border">
              {(error || formError) && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error || formError}
                </div>
              )}

              {info && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                  {info}
                </div>
              )}

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
                  className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary bg-background text-foreground font-medium placeholder:text-muted-foreground"
                  required
                  pattern="[0-9]{10}"
                  maxLength="10"
                />
                <p className="text-xs text-muted-foreground mt-1">Enter a 10-digit phone number to receive OTP</p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {isLoading ? "SENDING OTP..." : "SEND OTP"}
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
          ) : step === "otp" ? (
            <form onSubmit={verifyOtp} className="bg-card rounded-lg shadow-lg p-8 space-y-6 border border-border">
              {(error || formError) && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error || formError}
                </div>
              )}

              {info && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                  {info}
                </div>
              )}

              <div className="text-center">
                <p className="font-semibold text-foreground mb-2">Enter the 4-digit OTP sent to {phone}</p>
                <div className="flex justify-center gap-3">
                  {[...Array(4)].map((_, i) => (
                    <input
                      key={i}
                      type="text"
                      maxLength="1"
                      value={otp[i] || ""}
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "");
                        const newOtp = otp.split("");
                        newOtp[i] = val;
                        setOtp(newOtp.join(""));
                        
                        // Auto-focus next input
                        if (val && i < 3) {
                          const nextInput = e.target.parentElement.children[i + 1];
                          if (nextInput) nextInput.focus();
                        }
                      }}
                      onKeyDown={(e) => {
                        // Handle backspace
                        if (e.key === 'Backspace' && !otp[i] && i > 0) {
                          const prevInput = e.target.parentElement.children[i - 1];
                          if (prevInput) prevInput.focus();
                        }
                      }}
                      className="w-12 h-12 text-center text-lg font-bold text-foreground border border-border rounded-md focus:ring-2 focus:ring-primary focus:border-primary bg-background"
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {otpData?.otp ? `Use OTP: ${otpData.otp}` : 'Check your phone for OTP'}
                </p>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {isLoading ? "VERIFYING..." : "VERIFY OTP"}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                Didn't get the OTP?{" "}
                <button 
                  type="button" 
                  onClick={() => {
                    setStep("phone");
                    setOtp("");
                    setFormError("");
                  }} 
                  className="font-semibold text-primary hover:opacity-80 transition"
                >
                  Try Again
                </button>
              </p>
            </form>
          ) : (
            <form onSubmit={completeRegistration} className="bg-card rounded-lg shadow-lg p-8 space-y-6 border border-border">
              {(error || formError) && (
                <div className="bg-destructive/10 border border-destructive/30 text-destructive px-4 py-3 rounded-lg text-sm">
                  {error || formError}
                </div>
              )}

              {info && (
                <div className="bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 px-4 py-3 rounded-lg text-sm">
                  {info}
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
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-primary-foreground font-bold py-3 px-4 rounded-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {isLoading ? "CREATING ACCOUNT..." : "COMPLETE REGISTRATION"}
              </button>

              <p className="text-center text-sm text-muted-foreground">
                <button 
                  type="button" 
                  onClick={() => setStep("otp")} 
                  className="font-semibold text-primary hover:opacity-80 transition"
                >
                  ← Back to OTP
                </button>
              </p>

              <div className="text-center pt-4 border-t border-border">
                <p className="text-muted-foreground">
                  Already have an account?{" "}
                  <Link to="/" className="font-medium text-primary hover:opacity-80 transition">
                    Login
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
