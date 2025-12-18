const { Resend } = require('resend');

// Initialize Resend with your API key
const resend = new Resend('re_AEsctnAe_N4zaTur8WBh4JS4qMX8FeSNR');

// Configuration
const RESEND_CONFIG = {
    FROM_EMAIL: 'Freelancerwala <no-reply@freelancerwala.com>',
    FROM_NAME: 'Freelancerwala',
    COMPANY_NAME: 'Freelancerwala',
    SUPPORT_EMAIL: 'support@freelancerwala.com'
};

/**
 * Send OTP Email using Resend
 */
const sendOTPEmail = async (email, userName, otp, purpose = 'verification') => {
    console.log('\n📧 ===== SENDING OTP EMAIL =====');
    console.log('TO:', email);
    console.log('OTP:', otp);
    console.log('PURPOSE:', purpose);

    // Default response structure
    const baseResponse = {
        success: true,
        email: email,
        otp: otp,
        purpose: purpose
    };

    try {
        const purposeSubjects = {
            'registration': 'Complete Your Registration - Campaign Waala',
            'login': 'Your Login OTP - Campaign Waala',
            'password-reset': 'Reset Your Password - Campaign Waala',
            'verification': 'Your Verification Code - Campaign Waala'
        };

        const subject = purposeSubjects[purpose] || 'Your OTP Code - Campaign Waala';

        console.log('📤 Sending via Resend...');

        const { data, error } = await resend.emails.send({
            from: RESEND_CONFIG.FROM_EMAIL,
            to: email,
            subject: subject,
            html: generateOTPEmailHTML(userName, otp, purpose),
            text: generateOTPEmailText(userName, otp, purpose),
            headers: {
                'X-Priority': '1',
                'X-Mailer': 'CampaignWaala/1.0',
                'X-Entity-Ref-ID': `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }
        });

        if (error) {
            console.error('❌ Resend Error:', error);
            
            // Still successful from app perspective (OTP generated)
            return {
                ...baseResponse,
                emailSent: false,
                developmentMode: true,
                message: 'OTP generated (Email delivery failed)',
                resendError: error.message
            };
        }

        console.log('✅ EMAIL SENT SUCCESSFULLY!');
        console.log('📫 Message ID:', data.id);
        
        return {
            ...baseResponse,
            emailSent: true,
            developmentMode: false,
            message: 'OTP sent to your email',
            messageId: data.id,
            resendResponse: data
        };

    } catch (error) {
        console.error('❌ Unexpected email error:', error);
        
        // Fallback - always return OTP
        return {
            ...baseResponse,
            emailSent: false,
            developmentMode: true,
            message: 'OTP generated (Email service error)',
            error: error.message
        };
    }
};

/**
 * Generate HTML email template for OTP
 */
const generateOTPEmailHTML = (userName, otp, purpose) => {
    const purposeMessages = {
        'registration': 'Complete your registration',
        'login': 'Complete your login',
        'password-reset': 'Reset your password',
        'verification': 'Verify your account'
    };

    const actionMessage = purposeMessages[purpose] || 'verify your account';

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>OTP Verification - Campaign Waala</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f5f5f5; }
            .email-container { max-width: 600px; margin: 0 auto; background: white; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 40px 20px; text-align: center; }
            .header h1 { font-size: 32px; margin: 0 0 10px 0; }
            .header p { opacity: 0.9; margin: 0; }
            .content { padding: 40px; }
            .greeting { font-size: 18px; margin-bottom: 20px; }
            .otp-container { text-align: center; margin: 30px 0; }
            .otp-code { display: inline-block; font-size: 48px; font-weight: 800; color: #667eea; letter-spacing: 10px; font-family: monospace; background: #f8f9fa; padding: 20px 40px; border-radius: 10px; border: 2px dashed #667eea; }
            .otp-expiry { color: #666; margin-top: 10px; font-size: 14px; }
            .security-alert { background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 30px 0; color: #856404; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; border-top: 1px solid #eee; }
            @media (max-width: 480px) {
                .content { padding: 20px; }
                .otp-code { font-size: 36px; letter-spacing: 8px; padding: 15px 30px; }
                .header h1 { font-size: 24px; }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="header">
                <h1>Campaign Waala</h1>
                <p>${actionMessage.charAt(0).toUpperCase() + actionMessage.slice(1)}</p>
            </div>
            
            <div class="content">
                <div class="greeting">
                    <p>Hello <strong>${userName}</strong>,</p>
                </div>
                
                <p>Use the following One-Time Password (OTP) to ${actionMessage}:</p>
                
                <div class="otp-container">
                    <div class="otp-code">${otp}</div>
                    <div class="otp-expiry">⏰ Valid for 10 minutes</div>
                </div>
                
                <div class="security-alert">
                    <strong>🔒 Security Notice:</strong> Never share this OTP with anyone. Campaign Waala will never ask for your OTP, password, or other sensitive information.
                </div>
                
                <p>If you didn't request this OTP, please ignore this email or contact our support team.</p>
                
                <p>Need help? Contact us at: <a href="mailto:${RESEND_CONFIG.SUPPORT_EMAIL}">${RESEND_CONFIG.SUPPORT_EMAIL}</a></p>
                
                <p>Best regards,<br>
                <strong>The Campaign Waala Team</strong></p>
            </div>
            
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ${RESEND_CONFIG.COMPANY_NAME}. All rights reserved.</p>
                <p>This is an automated message, please do not reply to this email.</p>
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
        'registration': 'complete your registration',
        'login': 'complete your login',
        'password-reset': 'reset your password',
        'verification': 'verify your account'
    };

    const actionMessage = purposeMessages[purpose] || 'verify your account';

    return `
Campaign Waala - OTP Verification
=================================

Hello ${userName},

Use the following One-Time Password (OTP) to ${actionMessage}:

OTP: ${otp}

⏰ This OTP is valid for 10 minutes.

🔒 SECURITY NOTICE: Never share this OTP with anyone. 
Campaign Waala will never ask for your OTP, password, or other sensitive information.

If you didn't request this OTP, please ignore this email or contact our support team.

Need help? Contact: ${RESEND_CONFIG.SUPPORT_EMAIL}

=================================
Best regards,
The Campaign Waala Team

© ${new Date().getFullYear()} ${RESEND_CONFIG.COMPANY_NAME}. All rights reserved.
This is an automated message, please do not reply.
    `;
};

/**
 * Send Welcome Email
 */
const sendWelcomeEmail = async (email, userName) => {
    console.log('\n🎉 ===== SENDING WELCOME EMAIL =====');
    console.log('TO:', email);

    try {
        const { data, error } = await resend.emails.send({
            from: RESEND_CONFIG.FROM_EMAIL,
            to: email,
            subject: 'Welcome to Campaign Waala! 🎉',
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
                        <h1>Welcome to Campaign Waala! 🚀</h1>
                        <p>Your journey starts here</p>
                    </div>
                    <div class="content">
                        <p>Hello <strong>${userName}</strong>,</p>
                        <p>Welcome aboard! We're excited to have you join our community.</p>
                        <p>Get started by:</p>
                        <ul>
                            <li>📝 Completing your profile</li>
                            <li>🎯 Exploring available campaigns</li>
                            <li>💰 Start earning today</li>
                        </ul>
                        <p>If you have any questions, feel free to reach out to our support team.</p>
                        <p>Best regards,<br><strong>The Campaign Waala Team</strong></p>
                    </div>
                    <div class="footer">
                        <p>&copy; ${new Date().getFullYear()} ${RESEND_CONFIG.COMPANY_NAME}</p>
                    </div>
                </div>
            </body>
            </html>
            `,
            text: `
Welcome to Campaign Waala!

Hello ${userName},

Welcome aboard! We're excited to have you join our community.

Get started by:
1. 📝 Completing your profile
2. 🎯 Exploring available campaigns  
3. 💰 Start earning today

If you have any questions, feel free to reach out to our support team.

Best regards,
The Campaign Waala Team

© ${new Date().getFullYear()} ${RESEND_CONFIG.COMPANY_NAME}
            `
        });

        if (error) {
            console.error('❌ Welcome email failed:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Welcome email sent! ID:', data.id);
        return { success: true, messageId: data.id };

    } catch (error) {
        console.error('❌ Welcome email error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Test Resend connection
 */
const testResendConnection = async () => {
    console.log('🔧 Testing Resend connection...');
    
    try {
        // Try to send a test email
        const { data, error } = await resend.emails.send({
            from: RESEND_CONFIG.FROM_EMAIL,
            to: 'test@example.com',
            subject: 'Resend Connection Test',
            html: '<p>Testing Resend connection...</p>',
            text: 'Testing Resend connection...'
        });

        if (error) {
            console.log('⚠️ Resend test response:', error.name);
            // If it's a validation error, API is working
            if (error.name === 'validation_error' || error.message.includes('email')) {
                console.log('✅ Resend API is reachable');
                return { success: true, reachable: true };
            }
            console.error('❌ Resend connection test failed:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Resend connection test successful!');
        return { success: true, data: data };

    } catch (error) {
        console.error('❌ Resend connection error:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send test email to verify setup
 */
const sendTestEmail = async (toEmail = 'rajkumar6777y@gmail.com') => {
    console.log('\n🧪 ===== SENDING TEST EMAIL =====');
    console.log('TO:', toEmail);
    
    try {
        const { data, error } = await resend.emails.send({
            from: RESEND_CONFIG.FROM_EMAIL,
            to: toEmail,
            subject: 'Test Email from Campaign Waala',
            html: `
            <!DOCTYPE html>
            <html>
            <body>
                <div style="text-align: center; padding: 40px;">
                    <h1 style="color: #667eea;">✅ Email Service Working!</h1>
                    <p>Campaign Waala email service is configured correctly.</p>
                    <p>Time: ${new Date().toLocaleString()}</p>
                </div>
            </body>
            </html>
            `,
            text: 'Test email from Campaign Waala. Email service is working correctly.'
        });

        if (error) {
            console.error('❌ Test email failed:', error);
            return { success: false, error: error.message };
        }

        console.log('✅ Test email sent successfully!');
        console.log('📫 Message ID:', data.id);
        return { success: true, messageId: data.id };

    } catch (error) {
        console.error('❌ Test email error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOTPEmail,
    sendWelcomeEmail,
    testResendConnection,
    sendTestEmail,
    // Export for testing
    generateOTPEmailHTML,
    generateOTPEmailText
};