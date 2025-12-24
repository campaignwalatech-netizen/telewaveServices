const { Resend } = require("resend");

// Initialize Resend with your API key
const resend = new Resend("re_AEsctnAe_N4zaTur8WBh4JS4qMX8FeSNR");

// Configuration
const RESEND_CONFIG = {
  FROM_EMAIL: "Freelancer Wala <no-reply@freelancerwala.com>", // Changed to match
  FROM_NAME: "Freelancer Wala", // Changed from 'Freelancerwala'
  COMPANY_NAME: "Freelancer Wala",
  SUPPORT_EMAIL: "support@freelancerwala.com",
};

/**
 * Send OTP Email using Resend
 */
const sendOTPEmail = async (email, userName, otp, purpose = "verification") => {
  console.log("\n📧 ===== SENDING OTP EMAIL =====");
  console.log("TO:", email);
  console.log("OTP:", otp);
  console.log("PURPOSE:", purpose);

  // Default response structure
  const baseResponse = {
    success: true,
    email: email,
    otp: otp,
    purpose: purpose,
  };

  try {
    const purposeSubjects = {
      registration: "Complete Your Registration - Freelancer Wala",
      login: "Your Login OTP - Freelancer Wala",
      "password-reset": "Reset Your Password - Freelancer Wala",
      verification: "Your Verification Code - Freelancer Wala",
    };

    const subject =
      purposeSubjects[purpose] || "Your OTP Code - Freelancer Wala";

    console.log("📤 Sending via Resend...");

    const { data, error } = await resend.emails.send({
      from: RESEND_CONFIG.FROM_EMAIL,
      to: email,
      subject: subject,
      html: generateOTPEmailHTML(userName, otp, purpose),
      text: generateOTPEmailText(userName, otp, purpose),
      headers: {
        "X-Priority": "1",
        "X-Mailer": "FreelancerWala/1.0",
        "X-Entity-Ref-ID": `${Date.now()}-${Math.random()
          .toString(36)
          .substr(2, 9)}`,
      },
    });

    if (error) {
      console.error("❌ Resend Error:", error);

      // Still successful from app perspective (OTP generated)
      return {
        ...baseResponse,
        emailSent: false,
        developmentMode: true,
        message: "OTP generated (Email delivery failed)",
        resendError: error.message,
      };
    }

    console.log("✅ EMAIL SENT SUCCESSFULLY!");
    console.log("📫 Message ID:", data.id);

    return {
      ...baseResponse,
      emailSent: true,
      developmentMode: false,
      message: "OTP sent to your email",
      messageId: data.id,
      resendResponse: data,
    };
  } catch (error) {
    console.error("❌ Unexpected email error:", error);

    // Fallback - always return OTP
    return {
      ...baseResponse,
      emailSent: false,
      developmentMode: true,
      message: "OTP generated (Email service error)",
      error: error.message,
    };
  }
};

const sendRegistrationTestEmail = async (email, userName, otp) => {
  console.log("\n🧪 ===== TESTING REGISTRATION EMAIL =====");
  console.log("TO:", email);
  console.log("NAME:", userName);
  console.log("OTP:", otp);

  try {
    const testResult = await sendOTPEmail(email, userName, otp, "registration");
    console.log("📊 Registration Email Test Result:", {
      success: testResult.success,
      emailSent: testResult.emailSent,
      error: testResult.resendError || testResult.error,
      developmentMode: testResult.developmentMode,
    });
    return testResult;
  } catch (error) {
    console.error("❌ Registration email test failed:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Generate HTML email template for OTP
 */
const generateOTPEmailHTML = (userName, otp, purpose) => {
  const purposeMessages = {
    registration: "complete your registration",
    login: "securely sign in to your account",
    "password-reset": "reset your password",
    verification: "verify your account",
  };

  const actionMessage = purposeMessages[purpose] || "verify your account";

  return `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>OTP Verification | Freelancer Wala</title>
<style>
  body {
    margin: 0;
    padding: 0;
    background: #f4f6fb;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  }
  .wrapper {
    padding: 40px 15px;
  }
  .card {
    max-width: 520px;
    margin: auto;
    background: #ffffff;
    border-radius: 14px;
    overflow: hidden;
    box-shadow: 0 20px 45px rgba(0,0,0,0.08);
  }
  .header {
    background: linear-gradient(135deg, #ff7a18, #ff3d00);
    padding: 30px 20px;
    text-align: center;
    color: #ffffff;
  }
  .header h1 {
    margin: 0;
    font-size: 26px;
    letter-spacing: 0.5px;
  }
  .content {
    padding: 30px 28px;
    color: #333;
    line-height: 1.7;
  }
  .content p {
    margin: 0 0 16px;
    font-size: 15px;
  }
  .otp-box {
    margin: 30px 0;
    padding: 18px;
    background: linear-gradient(135deg, #f5f7ff, #eef1ff);
    border-radius: 10px;
    text-align: center;
    font-size: 32px;
    font-weight: 700;
    letter-spacing: 8px;
    color: #1a237e;
  }
  .expiry {
    font-size: 13px;
    color: #555;
    text-align: center;
  }
  .security {
    margin-top: 25px;
    padding: 16px;
    background: #fff5f5;
    border-left: 5px solid #ff4d4f;
    border-radius: 6px;
    font-size: 13px;
    color: #333;
  }
  .footer {
    background: #fafafa;
    padding: 18px;
    text-align: center;
    font-size: 12px;
    color: #888;
  }
</style>
</head>

<body>
  <div class="wrapper">
    <div class="card">

      <div class="header">
        <h1>Freelancer Wala</h1>
      </div>

      <div class="content">
        <p>Hello <strong>${userName}</strong>,</p>

        <p>
          We received a request to <strong>${actionMessage}</strong>.
          Please use the One-Time Password (OTP) below to continue.
        </p>

        <div class="otp-box">${otp}</div>

        <p class="expiry">
          ⏳ This OTP is valid for <strong>10 minutes</strong>.
        </p>

        <div class="security">
          <strong>🔐 Security Alert</strong><br />
          Never share this OTP with anyone.
          <strong>Freelancer Wala</strong> will never ask for your OTP, password,
          or any sensitive details.
        </div>

        <p style="margin-top: 22px;">
          If you did not request this OTP, you can safely ignore this email.
        </p>

        <p>
          Warm regards,<br />
          <strong>The Freelancer Wala Team</strong>
        </p>
      </div>

      <div class="footer">
        © ${new Date().getFullYear()} Freelancer Wala • All rights reserved
      </div>

    </div>
  </div>
</body>
</html>
`;
};



/**
 * Generate plain text email for OTP
 */
const generateOTPEmailText = (userName, otp, purpose) => {
  const purposeMessages = {
    registration: "complete your registration",
    login: "sign in to your account",
    "password-reset": "reset your password",
    verification: "verify your account",
  };

  const actionMessage = purposeMessages[purpose] || "verify your account";

  return `
Freelancer Wala — OTP Verification
=================================

Hello ${userName},

We received a request to ${actionMessage}.
Please use the One-Time Password (OTP below):

---------------------------------
OTP: ${otp}
---------------------------------

⏳ This OTP is valid for 10 minutes.

🔐 Security Notice:
Never share this OTP with anyone.
Freelancer Wala will never ask for your OTP,
password, or any sensitive information.

If you didn’t request this OTP, you can safely ignore this email.

Need help?
Contact us at: ${RESEND_CONFIG.SUPPORT_EMAIL}

=================================
Warm regards,
The Freelancer Wala Team

© ${new Date().getFullYear()} ${RESEND_CONFIG.COMPANY_NAME}
This is an automated email. Please do not reply.
`;
};



/**
 * Send Welcome Email
 */
const sendWelcomeEmail = async (email, userName) => {
  console.log("\n🎉 ===== SENDING WELCOME EMAIL =====");
  console.log("TO:", email);

  try {
    const { data, error } = await resend.emails.send({
      from: RESEND_CONFIG.FROM_EMAIL,
      to: email,
      subject: "Welcome to Freelancer Wala! 🎉",
      html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; }
                    .hero { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 50px 20px; text-align: center; }
                    .hero h1 { font-size: 36px; margin: 0; }
                    .content { padding: 40px; }
                    .footer { text-align: center; padding: 20px; color: #666; border-top: 1px solid #eee; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="hero">
                        <h1>Welcome to Freelancer Wala! 🚀</h1>
                        <p>Your journey starts here</p>
                    </div>
                    <div class="content">
                        <p>Hello <strong>${userName}</strong>,</p>
                        <p>Welcome aboard! We're excited to have you join our community.</p>
                        <p>Get started by:</p>
                        <ul>
                            <li>📝 Completing your profile</li>
                            <li>🎯 Exploring available Freelancer</li>
                            <li>💰 Start earning today</li>
                        </ul>
                        <p>If you have any questions, feel free to reach out to our support team.</p>
                        <p>Best regards,<br><strong>The Freelancer Wala Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} ${
        RESEND_CONFIG.COMPANY_NAME
      }</p>
                    </div>
                </div>
            </body>
            </html>
            `,
      text: `
Welcome to Freelancer Wala!

Hello ${userName},

Welcome aboard! We're excited to have you join our community.

Get started by:
1. 📝 Completing your profile
2. 🎯 Exploring available Freelancer  
3. 💰 Start earning today

If you have any questions, feel free to reach out to our support team.

Best regards,
The Freelancer Wala Team

© ${new Date().getFullYear()} ${RESEND_CONFIG.COMPANY_NAME}
            `,
    });

    if (error) {
      console.error("❌ Welcome email failed:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Welcome email sent! ID:", data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("❌ Welcome email error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Test Resend connection
 */
const testResendConnection = async () => {
  console.log("🔧 Testing Resend connection...");

  try {
    // Try to send a test email
    const { data, error } = await resend.emails.send({
      from: RESEND_CONFIG.FROM_EMAIL,
      to: "test@example.com",
      subject: "Resend Connection Test",
      html: "<p>Testing Resend connection...</p>",
      text: "Testing Resend connection...",
    });

    if (error) {
      console.log("⚠️ Resend test response:", error.name);
      // If it's a validation error, API is working
      if (
        error.name === "validation_error" ||
        error.message.includes("email")
      ) {
        console.log("✅ Resend API is reachable");
        return { success: true, reachable: true };
      }
      console.error("❌ Resend connection test failed:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Resend connection test successful!");
    return { success: true, data: data };
  } catch (error) {
    console.error("❌ Resend connection error:", error);
    return { success: false, error: error.message };
  }
};

/**
 * Send test email to verify setup
 */
const sendTestEmail = async (toEmail = "rajkumar6777y@gmail.com") => {
  console.log("\n🧪 ===== SENDING TEST EMAIL =====");
  console.log("TO:", toEmail);

  try {
    const { data, error } = await resend.emails.send({
      from: RESEND_CONFIG.FROM_EMAIL,
      to: toEmail,
      subject: "Test Email from Freelancer Wala",
      html: `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="text-align: center; padding: 40px;">
                    <h1 style="color: #667eea;">✅ Email Service Working!</h1>
                    <p>Freelancer Wala email service is configured correctly.</p>
                    <p>Time: ${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
            `,
      text: "Test email from Freelancer Wala. Email service is working correctly.",
    });

    if (error) {
      console.error("❌ Test email failed:", error);
      return { success: false, error: error.message };
    }

    console.log("✅ Test email sent successfully!");
    console.log("📫 Message ID:", data.id);
    return { success: true, messageId: data.id };
  } catch (error) {
    console.error("❌ Test email error:", error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendOTPEmail,
  sendRegistrationTestEmail,
  sendWelcomeEmail,
  testResendConnection,
  sendTestEmail,
  // Export for testing
  generateOTPEmailHTML,
  generateOTPEmailText,
};
