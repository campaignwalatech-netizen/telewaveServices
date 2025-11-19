import { useState } from "react";

export default function ResetPasswordForm() {
  const [formData, setFormData] = useState({
    phoneNumber: "",
    newPassword: "",
    confirmPassword: "",
    otp: ""
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    if (formData.otp.length !== 4 || !/^\d{4}$/.test(formData.otp)) {
      alert("Please enter a valid 4-digit OTP!");
      return;
    }
    console.log("Reset Password Data:", formData);
    alert("Password reset successfully!");
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="h-full flex flex-col p-3 sm:p-4">
      {/* Header with Title */}
      <div className="mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Reset User Password</h2>
      </div>
      
      {/* Form */}
      <div className="flex-1 overflow-y-auto scrollbar-custom min-h-0">
      <form onSubmit={handleSubmit} className="bg-card rounded-lg border border-border p-4 sm:p-6 max-w-2xl">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
            <input
              type="text"
              name="userId"
              value={formData.userId}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter Phone Number"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
            <input
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter new password"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Confirm new password"
              required
              minLength={8}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">OTP Verification</label>
            <input
              type="text"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              placeholder="Enter 4-digit OTP"
              required
              maxLength={4}
              pattern="[0-9]{6}"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Enter the 4-digit OTP sent to the user's registered email/phone
            </p>
          </div>

          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <p className="text-xs text-yellow-800 dark:text-yellow-200">
              <strong>Warning:</strong> This action will immediately reset the user's password. Valid OTP verification is required. The user will need to use the new password for their next login.
            </p>
          </div>
        </div>

        <div className="flex gap-3 mt-5">
          <button
            type="submit"
            className="px-5 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors font-semibold"
          >
            Reset Password
          </button>
          <button
            type="button"
            className="px-5 py-2 text-sm bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/80 transition-colors font-semibold"
          >
            Cancel
          </button>
        </div>
      </form>
      </div>
    </div>
  );
}
