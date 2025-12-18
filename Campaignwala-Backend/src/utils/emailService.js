const nodemailer = require('nodemailer');

/**
 * Create a fresh transporter per email
 * (Brevo + Render SAFE)
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false, // MUST be false for port 587
        auth: {
            user: process.env.EMAIL_USER,      // 9e51dd001@smtp-brevo.com
            pass: process.env.EMAIL_PASSWORD   // Brevo SMTP key
        },
        connectionTimeout: 15000,
        greetingTimeout: 10000,
        socketTimeout: 15000
    });
};

/**
 * Send OTP Email
 */
const sendOTPEmail = async (email, userName, otp, purpose = 'verification') => {
    console.log('\n📧 ===== ATTEMPTING TO SEND OTP EMAIL =====');
    console.log('TO:', email);
    console.log('PURPOSE:', purpose);

    try {
        const transporter = createTransporter();

        const purposeSubjects = {
            registration: 'Complete Your Registration - Campaign Waala',
            login: 'Your Login OTP - Campaign Waala',
            verification: 'Your OTP Code - Campaign Waala'
        };

        const subject =
            purposeSubjects[purpose] || 'Your OTP Code - Campaign Waala';

        const mailOptions = {
            from:
                process.env.EMAIL_FROM ||
                'Campaign Waala <noreply@campaignwala.com>',
            to: email,
            subject,
            html: `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>OTP Verification</title>
</head>
<body style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: auto; padding: 20px;">
  <div style="background:#FF9500;color:white;padding:20px;text-align:center;border-radius:10px 10px 0 0">
    <h1>Campaign Waala</h1>
    <h2>Your OTP Code</h2>
  </div>

  <div style="border:1px solid #eee;padding:30px;border-radius:0 0 10px 10px">
    <p>Hello <strong>${userName}</strong>,</p>
    <p>Use the following OTP to complete your ${purpose}:</p>

    <div style="text-align:center;margin:30px 0">
      <div style="font-size:36px;font-weight:bold;letter-spacing:8px;color:#FF9500">
        ${otp}
      </div>
      <p style="color:#666">Valid for 10 minutes</p>
    </div>

    <p style="color:#666;font-size:14px">
      ⚠️ Never share this OTP with anyone. Campaign Waala will never ask for it.
    </p>

    <p style="font-size:12px;color:#999;margin-top:30px">
      If you didn’t request this OTP, please ignore this email.
    </p>

    <p style="margin-top:30px">
      Regards,<br />
      <strong>Campaign Waala Team</strong>
    </p>
  </div>
</body>
</html>`,
            text: `
Campaign Waala OTP Verification

Hello ${userName},

Your OTP for ${purpose} is: ${otp}

This OTP is valid for 10 minutes.

⚠️ Never share this OTP with anyone.

If you didn’t request this, please ignore this email.

— Campaign Waala Team
`
        };

        console.log('📤 Sending OTP email...');
        const info = await transporter.sendMail(mailOptions);

        console.log('✅ OTP EMAIL SENT');
        console.log('📫 Message ID:', info.messageId);

        return {
            success: true,
            message: 'OTP sent successfully',
            messageId: info.messageId
        };
    } catch (error) {
        console.error('❌ OTP EMAIL FAILED:', error.message);
        throw new Error(`Failed to send OTP email: ${error.message}`);
    }
};

/**
 * Send Welcome Email
 */
const sendWelcomeEmail = async (email, userName) => {
    try {
        const transporter = createTransporter();

        await transporter.sendMail({
            from:
                process.env.EMAIL_FROM ||
                'Campaign Waala <noreply@campaignwala.com>',
            to: email,
            subject: 'Welcome to Campaign Waala 🎉',
            html: `
            <h2>Welcome, ${userName}!</h2>
            <p>Your account has been successfully created.</p>
            <p>We’re excited to have you onboard.</p>
            <br/>
            <strong>Campaign Waala Team</strong>
            `
        });

        console.log('✅ Welcome email sent:', email);
        return { success: true };
    } catch (error) {
        console.error('❌ Welcome email failed:', error.message);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOTPEmail,
    sendWelcomeEmail
};
