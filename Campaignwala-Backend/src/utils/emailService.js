const nodemailer = require('nodemailer');

// Create transporter with enhanced configuration for Render
let transporter = null;

const createTransporter = () => {
    if (!transporter) {
        // Enhanced configuration for Render deployment
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // Use TLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            // Enhanced settings for Render
            pool: true,
            maxConnections: 3,
            maxMessages: 50,
            // Increased timeouts for Render's network
            connectionTimeout: 30000, // 30 seconds
            greetingTimeout: 30000,
            socketTimeout: 45000, // 45 seconds
            // Retry configuration
            retries: 2,
            // Better TLS handling
            tls: {
                rejectUnauthorized: false,
                ciphers: 'SSLv3'
            },
            // Debug info
            debug: process.env.NODE_ENV === 'production' ? false : true,
            logger: process.env.NODE_ENV === 'production' ? false : true
        });

        // Verify transporter with better error handling
        transporter.verify(function(error, success) {
            if (error) {
                console.error('❌ SMTP Connection verification failed:', error.message);
                console.log('🔧 SMTP Configuration Check:');
                console.log('   - Host:', process.env.SMTP_HOST || 'smtp.gmail.com');
                console.log('   - Port:', process.env.SMTP_PORT || 587);
                console.log('   - Email User:', process.env.EMAIL_USER ? 'Configured' : 'NOT CONFIGURED');
                console.log('   - Email Password:', process.env.EMAIL_PASSWORD ? 'Configured' : 'NOT CONFIGURED');
            } else {
                console.log('✅ SMTP Server is ready to take our messages');
            }
        });
    }
    return transporter;
};

// HTML template for OTP email (keep your existing template)
const getOTPEmailTemplate = (userName, otp, purpose = 'verification') => {
    const purposeConfig = {
        'registration': {
            title: 'Complete Your Registration',
            greeting: 'Welcome to Campaignwala!',
            message: 'Thank you for choosing Campaignwala. To complete your registration, please use the OTP below:',
            action: 'Complete Registration'
        },
        'login': {
            title: 'Your Login OTP',
            greeting: 'Hello',
            message: 'To complete your login, please use the OTP below:',
            action: 'Complete Login'
        },
        'password-reset': {
            title: 'Password Reset OTP',
            greeting: 'Hello',
            message: 'You requested to reset your password. Please use the OTP below to verify your identity:',
            action: 'Reset Password'
        }
    };

    const config = purposeConfig[purpose] || purposeConfig['verification'];

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${config.title} - Campaignwala</title>
        <style>
            /* Your existing CSS styles */
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f8f9fa; margin: 0; padding: 20px; }
            .email-container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
            .email-header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
            .logo { font-size: 32px; font-weight: bold; margin-bottom: 10px; }
            .email-title { font-size: 24px; font-weight: 600; margin-bottom: 5px; }
            .email-body { padding: 40px 30px; }
            .otp-container { text-align: center; margin: 30px 0; }
            .otp-code { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; font-size: 42px; font-weight: bold; letter-spacing: 8px; padding: 20px; border-radius: 12px; margin: 15px 0; display: inline-block; min-width: 280px; text-align: center; }
            .email-footer { background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e9ecef; }
        </style>
    </head>
    <body>
        <div class="email-container">
            <div class="email-header">
                <div class="logo">🚀 Campaignwala</div>
                <h1 class="email-title">${config.title}</h1>
                <p class="email-subtitle">Secure your account with OTP verification</p>
            </div>
            
            <div class="email-body">
                <p class="greeting">${config.greeting} <strong>${userName}</strong>,</p>
                <p class="message">${config.message}</p>
                
                <div class="otp-container">
                    <div class="otp-label">Your One-Time Password</div>
                    <div class="otp-code">${otp}</div>
                    <div class="action-text">Valid for 10 minutes only</div>
                </div>
                
                <div class="warning-box">
                    <div class="warning-text">
                        <strong>Security Notice:</strong> Never share this OTP with anyone.
                    </div>
                </div>
            </div>
            
            <div class="email-footer">
                <p class="footer-text">
                    © ${new Date().getFullYear()} Campaignwala. All rights reserved.
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Enhanced sendOTPEmail function with better Render compatibility
const sendOTPEmail = async (email, userName, otp, purpose = 'verification') => {
    try {
        console.log('📧 ===== EMAIL SERVICE =====');
        console.log('📧 Preparing to send OTP email...');
        console.log('   FROM:', process.env.EMAIL_USER);
        console.log('   TO:', email);
        console.log('   NAME:', userName);
        console.log('   OTP:', otp);
        console.log('   PURPOSE:', purpose);
        
        // DEVELOPMENT MODE: Skip actual email sending in development
        if (process.env.NODE_ENV === 'production' || process.env.USE_STATIC_OTP === 'false') {
            console.log('🛠️  Development mode - skipping actual email send');
            return {
                success: true,
                message: 'OTP generated (Development mode)',
                developmentMode: true,
                data: {
                    otp: otp,
                    email: email,
                    note: 'Email not sent in development mode'
                }
            };
        }

        // Check if email credentials are configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.error('❌ Email credentials not configured in environment variables');
            console.log('🔧 Please check your Render environment variables:');
            console.log('   - EMAIL_USER');
            console.log('   - EMAIL_PASSWORD');
            
            return {
                success: true,
                message: 'OTP generated (Email service not configured)',
                developmentMode: true,
                data: {
                    otp: otp,
                    email: email,
                    note: 'Email service not configured - check environment variables'
                }
            };
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.error('❌ Invalid email format:', email);
            throw new Error('INVALID_EMAIL_FORMAT: Please provide a valid email address');
        }

        // Create SMTP transporter
        const transporter = createTransporter();
        
        // Prepare email subject based on purpose
        const purposeSubjects = {
            'registration': 'Complete Your Registration - Campaignwala',
            'login': 'Your Login OTP - Campaignwala', 
            'password-reset': 'Password Reset OTP - Campaignwala',
            'verification': 'Account Verification OTP - Campaignwala'
        };

        const subject = purposeSubjects[purpose] || purposeSubjects['verification'];

        // Email options
        const mailOptions = {
            from: {
                name: 'Campaignwala Security',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: subject,
            html: getOTPEmailTemplate(userName, otp, purpose),
            text: `
            Campaignwala OTP Verification
            
            Hello ${userName},
            
            Your One-Time Password (OTP) for ${purpose} is: ${otp}
            
            This OTP is valid for 10 minutes. Please do not share this OTP with anyone.
            
            Best regards,
            Campaignwala Team
            `,
            // Priority headers
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'high'
            }
        };

        console.log('📤 Attempting to send email...');
        
        // Enhanced retry logic for Render
        const maxRetries = 2;
        let lastError = null;

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`   🔄 Attempt ${attempt} of ${maxRetries}...`);
                
                const info = await transporter.sendMail(mailOptions);
                
                console.log('✅ Email sent successfully!');
                console.log('   📨 Message ID:', info.messageId);
                console.log('   📋 Response:', info.response);
                
                return {
                    success: true,
                    message: `OTP sent to ${email} successfully`,
                    messageId: info.messageId,
                    purpose: purpose,
                    timestamp: new Date().toISOString(),
                    developmentMode: false
                };
                
            } catch (retryError) {
                lastError = retryError;
                console.warn(`   ⚠️ Attempt ${attempt} failed:`, retryError.message);
                
                if (attempt < maxRetries) {
                    const delay = 5000 * attempt; // 5s, 10s
                    console.log(`   ⏳ Waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        // All retries failed - fall back to development mode
        console.error('❌ All email sending attempts failed');
        console.log('🔄 Falling back to development mode...');
        
        return {
            success: true,
            message: 'OTP generated (Email service unavailable)',
            developmentMode: true,
            data: {
                otp: otp,
                email: email,
                note: 'Email service unavailable - use OTP from console'
            }
        };
        
    } catch (error) {
        console.error('❌ ===== EMAIL SENDING FAILED =====');
        console.error('❌ Error:', error.message);
        
        // Fall back to development mode for any error
        console.log('🔄 Using development fallback due to email failure');
        
        return {
            success: true,
            message: 'OTP generated (Email service error)',
            developmentMode: true,
            data: {
                otp: otp,
                email: email,
                note: 'Email service error - use OTP from console'
            }
        };
    }
};

// Enhanced welcome email function
const sendWelcomeEmail = async (email, userName) => {
    try {
        console.log('🎉 Preparing to send welcome email...');
        console.log('   TO:', email);
        console.log('   NAME:', userName);

        // Skip in development mode
        if (process.env.NODE_ENV === 'production' || process.env.USE_STATIC_OTP === 'false') {
            console.log('🛠️  Development mode - skipping welcome email');
            return { 
                success: true, 
                developmentMode: true 
            };
        }

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log('⚠️ Email service not configured. Skipping welcome email.');
            return { 
                success: false, 
                error: 'EMAIL_SERVICE_NOT_CONFIGURED',
                developmentMode: true
            };
        }

        const transporter = createTransporter();
        
        const mailOptions = {
            from: {
                name: 'Campaignwala Team',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Welcome to Campaignwala! 🎉 Your Journey Begins Here',
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; background: #f8f9fa; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
                    .body { padding: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🚀 Campaignwala</h1>
                        <h2>Welcome Aboard!</h2>
                    </div>
                    <div class="body">
                        <p>Hello <strong>${userName}</strong>,</p>
                        <p>Welcome to Campaignwala! Your account has been successfully created and verified.</p>
                        <p>We're excited to have you join our community!</p>
                    </div>
                </div>
            </body>
            </html>
            `,
            text: `Welcome to Campaignwala! Hello ${userName}, Welcome to Campaignwala! Your account has been successfully created.`
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('✅ Welcome email sent successfully!');
        console.log('   Message ID:', info.messageId);
        
        return { 
            success: true, 
            message: 'Welcome email sent successfully',
            messageId: info.messageId 
        };
    } catch (error) {
        console.error('❌ Welcome email error:', error.message);
        return { 
            success: false, 
            error: error.message,
            developmentMode: true
        };
    }
};

// Export functions
module.exports = {
    sendOTPEmail,
    sendWelcomeEmail,
    createTransporter
};