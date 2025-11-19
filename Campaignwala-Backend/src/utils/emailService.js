const nodemailer = require('nodemailer');

// Create transporter with email configuration (singleton with connection pooling)
let transporter = null;

const createTransporter = () => {
    if (!transporter) {
        // Use explicit SMTP configuration instead of 'service: gmail'
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || 'smtp.gmail.com',
            port: process.env.SMTP_PORT || 587,
            secure: false, // Use TLS
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            pool: true, // Use connection pooling
            maxConnections: 5,
            maxMessages: 100,
            connectionTimeout: 15000, // 15 seconds timeout
            greetingTimeout: 15000,
            socketTimeout: 15000,
            // Add retry logic
            retries: 3,
            // Better TLS handling
            tls: {
                rejectUnauthorized: false // For development, set to true in production
            }
        });

        // Verify transporter on creation
        transporter.verify(function(error, success) {
            if (error) {
                console.error('❌ SMTP Connection verification failed:', error);
            } else {
                console.log('✅ SMTP Server is ready to take our messages');
            }
        });
    }
    return transporter;
};

// HTML template for OTP email with enhanced styling
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
        },
        'verification': {
            title: 'Account Verification OTP',
            greeting: 'Hello',
            message: 'Please use the OTP below to verify your account:',
            action: 'Verify Account'
        },
        'profile-update': {
            title: 'Profile Update OTP',
            greeting: 'Hello',
            message: 'You requested to update your profile. Please use the OTP below to authorize this change:',
            action: 'Update Profile'
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
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                line-height: 1.6;
                color: #333;
                background-color: #f8f9fa;
                margin: 0;
                padding: 20px;
            }
            .email-container {
                max-width: 600px;
                margin: 0 auto;
                background: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            }
            .email-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px;
                text-align: center;
                color: white;
            }
            .logo {
                font-size: 32px;
                font-weight: bold;
                margin-bottom: 10px;
            }
            .email-title {
                font-size: 24px;
                font-weight: 600;
                margin-bottom: 5px;
            }
            .email-subtitle {
                font-size: 16px;
                opacity: 0.9;
            }
            .email-body {
                padding: 40px 30px;
            }
            .greeting {
                font-size: 18px;
                color: #2d3748;
                margin-bottom: 20px;
            }
            .message {
                color: #4a5568;
                font-size: 16px;
                margin-bottom: 30px;
                line-height: 1.6;
            }
            .otp-container {
                text-align: center;
                margin: 30px 0;
            }
            .otp-label {
                font-size: 14px;
                color: #718096;
                margin-bottom: 10px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .otp-code {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                font-size: 42px;
                font-weight: bold;
                letter-spacing: 8px;
                padding: 20px;
                border-radius: 12px;
                margin: 15px 0;
                display: inline-block;
                min-width: 280px;
                text-align: center;
                box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
            }
            .action-text {
                font-size: 16px;
                color: #4a5568;
                margin-bottom: 25px;
                font-weight: 500;
            }
            .warning-box {
                background: #fff3cd;
                border: 1px solid #ffeaa7;
                border-radius: 8px;
                padding: 20px;
                margin: 25px 0;
                text-align: center;
            }
            .warning-icon {
                font-size: 24px;
                margin-bottom: 10px;
            }
            .warning-text {
                color: #856404;
                font-size: 14px;
                line-height: 1.5;
            }
            .info-box {
                background: #d1ecf1;
                border: 1px solid #bee5eb;
                border-radius: 8px;
                padding: 15px;
                margin: 20px 0;
                text-align: center;
            }
            .info-text {
                color: #0c5460;
                font-size: 14px;
            }
            .button {
                display: inline-block;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 14px 35px;
                text-decoration: none;
                border-radius: 25px;
                font-weight: 600;
                font-size: 16px;
                margin: 20px 0;
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
            }
            .email-footer {
                background: #f8f9fa;
                padding: 25px 30px;
                text-align: center;
                border-top: 1px solid #e9ecef;
            }
            .footer-text {
                color: #6c757d;
                font-size: 12px;
                line-height: 1.5;
                margin-bottom: 10px;
            }
            .support-link {
                color: #667eea;
                text-decoration: none;
            }
            .social-links {
                margin: 20px 0;
            }
            .social-icon {
                display: inline-block;
                margin: 0 10px;
                color: #667eea;
                text-decoration: none;
                font-weight: 500;
            }
            @media (max-width: 600px) {
                body {
                    padding: 10px;
                }
                .email-body {
                    padding: 30px 20px;
                }
                .otp-code {
                    font-size: 32px;
                    letter-spacing: 6px;
                    padding: 15px;
                    min-width: 240px;
                }
                .email-header {
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <!-- Header -->
            <div class="email-header">
                <div class="logo">🚀 Campaignwala</div>
                <h1 class="email-title">${config.title}</h1>
                <p class="email-subtitle">Secure your account with OTP verification</p>
            </div>
            
            <!-- Body -->
            <div class="email-body">
                <p class="greeting">${config.greeting} <strong>${userName}</strong>,</p>
                
                <p class="message">${config.message}</p>
                
                <div class="otp-container">
                    <div class="otp-label">Your One-Time Password</div>
                    <div class="otp-code">${otp}</div>
                    <div class="action-text">Valid for 10 minutes only</div>
                </div>
                
                <div class="warning-box">
                    <div class="warning-icon">⚠️</div>
                    <div class="warning-text">
                        <strong>Security Notice:</strong> Never share this OTP with anyone. 
                        Campaignwala team will never ask for your OTP, password, or other sensitive information.
                    </div>
                </div>
                
                <div class="info-box">
                    <div class="info-text">
                        <strong>Didn't request this?</strong> If you didn't initiate this request, 
                        please ignore this email and ensure your account password is secure.
                    </div>
                </div>
                
                <div style="text-align: center;">
                    <a href="#" class="button">${config.action}</a>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="email-footer">
                <div class="social-links">
                    <a href="#" class="social-icon">Website</a>
                    <a href="#" class="social-icon">Support</a>
                    <a href="#" class="social-icon">Privacy</a>
                </div>
                <p class="footer-text">
                    © ${new Date().getFullYear()} Campaignwala. All rights reserved.<br>
                    This email was sent to ${userName} as part of our account security services.<br>
                    Please do not reply to this automated message.
                </p>
                <p class="footer-text">
                    Need help? <a href="mailto:support@campaignwala.com" class="support-link">Contact our support team</a>
                </p>
            </div>
        </div>
    </body>
    </html>
    `;
};

// Enhanced sendOTPEmail with better error handling and logging
const sendOTPEmail = async (email, userName, otp, purpose = 'verification') => {
    try {
        console.log('📧 ===== EMAIL SERVICE =====');
        console.log('📧 Preparing to send OTP email...');
        console.log('   FROM:', process.env.EMAIL_USER);
        console.log('   TO:', email);
        console.log('   NAME:', userName);
        console.log('   OTP:', otp);
        console.log('   PURPOSE:', purpose);
        console.log('   TIMESTAMP:', new Date().toISOString());
        
        // Check if email credentials are configured
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.error('❌ Email credentials not configured in environment variables');
            throw new Error('EMAIL_SERVICE_NOT_CONFIGURED: Email credentials missing in environment variables');
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            console.error('❌ Invalid email format:', email);
            throw new Error('INVALID_EMAIL_FORMAT: Please provide a valid email address');
        }

        // Create SMTP transporter (reuses pooled connection)
        const transporter = createTransporter();
        
        // Prepare email subject based on purpose
        const purposeSubjects = {
            'registration': 'Complete Your Registration - Campaignwala',
            'login': 'Your Login OTP - Campaignwala', 
            'password-reset': 'Password Reset OTP - Campaignwala',
            'verification': 'Account Verification OTP - Campaignwala',
            'profile-update': 'Profile Update OTP - Campaignwala'
        };

        const subject = purposeSubjects[purpose] || purposeSubjects['verification'];

        // Email options with enhanced configuration
        const mailOptions = {
            from: {
                name: 'Campaignwala Security',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: subject,
            html: getOTPEmailTemplate(userName, otp, purpose),
            // Add priority and tracking headers
            headers: {
                'X-Priority': '1',
                'X-MSMail-Priority': 'High',
                'Importance': 'high',
                'X-Auto-Response-Suppress': 'OOF, AutoReply',
                'Precedence': 'bulk'
            },
            // Add text version for email clients that don't support HTML
            text: `
            Campaignwala OTP Verification
            
            Hello ${userName},
            
            Your One-Time Password (OTP) for ${purpose} is: ${otp}
            
            This OTP is valid for 10 minutes. Please do not share this OTP with anyone.
            
            If you didn't request this OTP, please ignore this email.
            
            Best regards,
            Campaignwala Team
            `
        };

        console.log('📤 Attempting to send email...');
        
        // Enhanced retry logic with exponential backoff
        let lastError;
        const maxRetries = 3;
        const baseDelay = 2000; // 2 seconds

        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`   🔄 Attempt ${attempt} of ${maxRetries}...`);
                
                const info = await transporter.sendMail(mailOptions);
                
                console.log('✅ Email sent successfully!');
                console.log('   📨 Message ID:', info.messageId);
                console.log('   📋 Response:', info.response);
                console.log('   ✅ Accepted:', info.accepted);
                console.log('   ❌ Rejected:', info.rejected);
                
                return {
                    success: true,
                    message: `OTP sent to ${email} successfully`,
                    messageId: info.messageId,
                    purpose: purpose,
                    timestamp: new Date().toISOString()
                };
                
            } catch (retryError) {
                lastError = retryError;
                console.warn(`   ⚠️ Attempt ${attempt} failed:`, retryError.message);
                
                if (attempt < maxRetries) {
                    // Exponential backoff with jitter
                    const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
                    console.log(`   ⏳ Waiting ${delay}ms before retry...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        }
        
        // All retries failed
        console.error('❌ All email sending attempts failed');
        throw lastError;
        
    } catch (error) {
        console.error('❌ ===== EMAIL SENDING FAILED =====');
        console.error('❌ Error:', error.message);
        console.error('❌ Stack:', error.stack);
        
        // Enhanced error categorization
        let errorMessage = 'Failed to send OTP email';
        let errorCode = 'EMAIL_SEND_FAILED';

        if (error.message.includes('Invalid login')) {
            errorMessage = 'Email service authentication failed. Please check email credentials.';
            errorCode = 'EMAIL_AUTH_FAILED';
        } else if (error.message.includes('ENOTFOUND')) {
            errorMessage = 'Email server not found. Please check SMTP configuration.';
            errorCode = 'SMTP_SERVER_NOT_FOUND';
        } else if (error.message.includes('ETIMEDOUT')) {
            errorMessage = 'Email server connection timeout. Please try again later.';
            errorCode = 'SMTP_CONNECTION_TIMEOUT';
        } else if (error.message.includes('ECONNREFUSED')) {
            errorMessage = 'Email server refused connection. Please check SMTP settings.';
            errorCode = 'SMTP_CONNECTION_REFUSED';
        }

        throw new Error(`${errorCode}: ${errorMessage}`);
    }
};

// Enhanced welcome email function
const sendWelcomeEmail = async (email, userName) => {
    try {
        console.log('🎉 Preparing to send welcome email...');
        console.log('   TO:', email);
        console.log('   NAME:', userName);

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            console.log('⚠️ Email service not configured. Skipping welcome email.');
            return { 
                success: false, 
                error: 'EMAIL_SERVICE_NOT_CONFIGURED' 
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
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        line-height: 1.6;
                        color: #333;
                        background-color: #f8f9fa;
                        margin: 0;
                        padding: 20px;
                    }
                    .email-container {
                        max-width: 600px;
                        margin: 0 auto;
                        background: #ffffff;
                        border-radius: 12px;
                        overflow: hidden;
                        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                    }
                    .email-header {
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        padding: 40px 30px;
                        text-align: center;
                        color: white;
                    }
                    .logo {
                        font-size: 42px;
                        font-weight: bold;
                        margin-bottom: 15px;
                    }
                    .welcome-title {
                        font-size: 28px;
                        font-weight: 600;
                        margin-bottom: 10px;
                    }
                    .email-body {
                        padding: 40px 30px;
                    }
                    .greeting {
                        font-size: 20px;
                        color: #2d3748;
                        margin-bottom: 20px;
                    }
                    .message {
                        color: #4a5568;
                        font-size: 16px;
                        margin-bottom: 25px;
                        line-height: 1.6;
                    }
                    .features {
                        background: #f7fafc;
                        border-radius: 8px;
                        padding: 25px;
                        margin: 30px 0;
                    }
                    .feature-item {
                        margin: 15px 0;
                        padding-left: 25px;
                        position: relative;
                    }
                    .feature-item:before {
                        content: '✅';
                        position: absolute;
                        left: 0;
                    }
                    .cta-button {
                        display: inline-block;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        color: white;
                        padding: 15px 40px;
                        text-decoration: none;
                        border-radius: 25px;
                        font-weight: 600;
                        font-size: 16px;
                        margin: 20px 0;
                        transition: transform 0.2s;
                    }
                    .cta-button:hover {
                        transform: translateY(-2px);
                    }
                    .email-footer {
                        background: #f8f9fa;
                        padding: 25px 30px;
                        text-align: center;
                        border-top: 1px solid #e9ecef;
                    }
                    .footer-text {
                        color: #6c757d;
                        font-size: 12px;
                        line-height: 1.5;
                    }
                </style>
            </head>
            <body>
                <div class="email-container">
                    <div class="email-header">
                        <div class="logo">🚀 Campaignwala</div>
                        <h1 class="welcome-title">Welcome Aboard!</h1>
                        <p>We're excited to have you with us</p>
                    </div>
                    
                    <div class="email-body">
                        <p class="greeting">Hello <strong>${userName}</strong>,</p>
                        
                        <p class="message">
                            Welcome to Campaignwala! Your account has been successfully created and verified. 
                            We're thrilled to have you join our community of digital marketers and campaign creators.
                        </p>
                        
                        <div class="features">
                            <h3 style="color: #2d3748; margin-bottom: 20px;">Here's what you can do now:</h3>
                            <div class="feature-item">Create and manage marketing campaigns</div>
                            <div class="feature-item">Track performance with real-time analytics</div>
                            <div class="feature-item">Access exclusive offers and leads</div>
                            <div class="feature-item">Connect with other marketers</div>
                            <div class="feature-item">Earn rewards for successful campaigns</div>
                        </div>
                        
                        <p class="message">
                            Get started by exploring your dashboard and setting up your first campaign. 
                            Our team is here to help you succeed!
                        </p>
                        
                        <div style="text-align: center;">
                            <a href="#" class="cta-button">Explore Your Dashboard</a>
                        </div>
                    </div>
                    
                    <div class="email-footer">
                        <p class="footer-text">
                            © ${new Date().getFullYear()} Campaignwala. All rights reserved.<br>
                            Transforming digital marketing, one campaign at a time.
                        </p>
                    </div>
                </div>
            </body>
            </html>
            `,
            text: `
            Welcome to Campaignwala!
            
            Hello ${userName},
            
            Welcome to Campaignwala! Your account has been successfully created and verified.
            
            We're excited to have you join our community of digital marketers and campaign creators.
            
            Get started by exploring your dashboard and setting up your first campaign.
            
            Best regards,
            The Campaignwala Team
            `
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
            error: error.message 
        };
    }
};

// Additional utility function for sending general notifications
const sendNotificationEmail = async (email, userName, subject, message, actionLink = null) => {
    try {
        console.log('📢 Preparing to send notification email...');
        
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
            throw new Error('EMAIL_SERVICE_NOT_CONFIGURED');
        }

        const transporter = createTransporter();
        
        const mailOptions = {
            from: {
                name: 'Campaignwala Notifications',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: subject,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    /* Include the same styles as welcome email */
                    body { font-family: 'Segoe UI', sans-serif; background: #f8f9fa; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white; }
                    .body { padding: 30px; }
                    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 Notification</h1>
                        <p>${subject}</p>
                    </div>
                    <div class="body">
                        <p>Hello <strong>${userName}</strong>,</p>
                        <p>${message}</p>
                        ${actionLink ? `<a href="${actionLink}" style="display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; margin: 15px 0;">Take Action</a>` : ''}
                    </div>
                    <div class="footer">
                        <p>© ${new Date().getFullYear()} Campaignwala</p>
                    </div>
                </div>
            </body>
            </html>
            `
        };

        await transporter.sendMail(mailOptions);
        console.log('✅ Notification email sent successfully');
        return { success: true };
    } catch (error) {
        console.error('❌ Notification email error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendOTPEmail,
    sendWelcomeEmail,
    sendNotificationEmail,
    createTransporter // Export for testing purposes
};