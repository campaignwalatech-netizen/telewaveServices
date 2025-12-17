const nodemailer = require('nodemailer');

let transporter = null;

const createTransporter = () => {
    if (!transporter) {
        console.log('🔧 Creating SMTP Transporter...');
        
        // Enhanced configuration with better timeout handling
        transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            pool: true,
            maxConnections: 3,
            maxMessages: 100,
            rateDelta: 1000,
            rateLimit: 5,
            // Increased timeouts
            connectionTimeout: 60000,  // 60 seconds
            greetingTimeout: 30000,    // 30 seconds
            socketTimeout: 90000,      // 90 seconds
            // TLS options
            tls: {
                rejectUnauthorized: false,
                ciphers: 'SSLv3',
                minVersion: 'TLSv1.2'
            },
            // Debug logging
            logger: true,
            debug: true
        });

        // Verify connection asynchronously
        transporter.verify((error, success) => {
            if (error) {
                console.error('❌ SMTP Connection Failed:', error.message);
                console.error('Check: 1) App password 2) Less secure apps setting');
            } else {
                console.log('✅ SMTP Connection Successful - Ready to send emails');
            }
        });
    }
    return transporter;
};


const sendOTPEmail = async (email, userName, otp, purpose = 'verification') => {
    console.log('\n📧 ===== ATTEMPTING TO SEND OTP EMAIL =====');
    console.log('TO:', email);
    console.log('PURPOSE:', purpose);
    
    // ALWAYS TRY TO SEND EMAIL - NO DEVELOPMENT MODE FALLBACK
    try {
        const transporter = createTransporter();
        
        const purposeSubjects = {
            'registration': 'Complete Your Registration - Campaign Waala',
            'login': 'Your Login OTP - Campaign Waala',
            'verification': 'Your OTP Code - Campaign Waala'
        };

        const subject = purposeSubjects[purpose] || 'Your OTP Code - Campaign Waala';

        const mailOptions = {
            from: process.env.EMAIL_FROM || 'Campaign Waala <campaignwalatech@gmail.com>',
            to: email,
            subject: subject,
            html: `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>OTP Verification</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #FF9500, #FF6B00); color: white; padding: 25px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 28px; font-weight: bold;">Campaign Waala</h1>
        <h2 style="margin: 10px 0 0; font-size: 20px; font-weight: normal;">Your OTP Code</h2>
    </div>
    
    <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 12px rgba(0,0,0,0.1); border: 1px solid #e0e0e0;">
        <p style="font-size: 16px; margin-bottom: 20px;">Hello <strong style="color: #FF9500;">${userName}</strong>,</p>
        
        <p style="font-size: 16px; margin-bottom: 25px;">Use the following OTP to complete your ${purpose}:</p>
        
        <div style="text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 2px dashed #FF9500;">
            <div style="font-size: 36px; font-weight: bold; color: #FF9500; letter-spacing: 8px; margin-bottom: 10px;">${otp}</div>
            <div style="font-size: 14px; color: #666;">Valid for 10 minutes</div>
        </div>
        
        <div style="background: #fff8e1; border-left: 4px solid #FF9500; padding: 15px; margin: 25px 0; border-radius: 4px;">
            <p style="margin: 0; font-size: 14px; color: #333;">
                <strong>⚠️ Security Notice:</strong> Never share this OTP with anyone. Campaign Waala will never ask for your OTP.
            </p>
        </div>
        
        <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
            If you didn't request this OTP, please ignore this email or contact our support team immediately.
        </p>
        
        <div style="margin-top: 30px; text-align: center;">
            <p style="font-size: 14px; color: #999;">Best regards,<br>
            <strong style="color: #FF9500;">Campaign Waala Team</strong></p>
        </div>
    </div>
    
    <div style="text-align: center; margin-top: 20px; padding: 15px; font-size: 12px; color: #999; border-top: 1px solid #eee;">
        <p>This is an automated message, please do not reply to this email.</p>
        <p>© ${new Date().getFullYear()} Campaign Waala. All rights reserved.</p>
    </div>
</body>
</html>`,
            text: `
Campaign Waala OTP Verification
===============================

Hello ${userName},

Your OTP code for ${purpose} is: ${otp}

This OTP is valid for 10 minutes.

⚠️ SECURITY NOTICE: Never share this OTP with anyone. Campaign Waala will never ask for your OTP.

If you didn't request this OTP, please ignore this email or contact our support team immediately.

Best regards,
Campaign Waala Team
------------------------------
This is an automated message, please do not reply to this email.
© ${new Date().getFullYear()} Campaign Waala. All rights reserved.
            `
        };

        console.log('📤 Attempting to send email...');
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ EMAIL SENT SUCCESSFULLY!');
        console.log('📫 Message ID:', info.messageId);
        console.log('📬 Response:', info.response ? info.response.substring(0, 100) + '...' : 'No response');
        
        return {
            success: true,
            message: 'OTP sent to email',
            developmentMode: false,
            messageId: info.messageId
        };

    } catch (error) {
        console.error('❌ EMAIL SEND FAILED:', error.message);
        console.error('🔍 Full error:', error);
        
        // THROW ERROR INSTEAD OF FALLING BACK TO CONSOLE
        throw new Error(`Failed to send OTP email: ${error.message}. Please try again or contact support.`);
    }
};

const sendWelcomeEmail = async (email, userName) => {
    try {
        if (process.env.USE_STATIC_OTP === 'true') {
            return { success: true, developmentMode: true };
        }

        const transporter = createTransporter();
        
        const mailOptions = {
            from: {
                name: 'Freelancerwala Team',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Welcome to Freelancerwala! 🎉',
            html: `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px;">
                    <div style="background: #FF9500; color: white; padding: 20px; text-align: center; border-radius: 10px;">
                        <h1>🚀 Campaign Waala</h1>
                        <h2>Welcome Aboard!</h2>
                    </div>
                    <p>Hello <strong>${userName}</strong>,</p>
                    <p>Welcome to Freelancerwala! Your account has been successfully created and verified.</p>
                    <p>We're excited to have you join our community!</p>
                    <br>
                    <p>Best regards,<br>Campaign Waala Team</p>
                </div>
            </body>
            </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent to:', email);
        return { success: true };
        
    } catch (error) {
        console.error('Welcome email error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOTPEmail,
    sendWelcomeEmail
};