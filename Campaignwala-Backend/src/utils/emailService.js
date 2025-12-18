const nodemailer = require('nodemailer');

/**
 * Create transporter with production-ready settings
 */
const createTransporter = () => {
    return nodemailer.createTransport({
        host: 'smtp-relay.brevo.com',
        port: 587,
        secure: false,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        },
        tls: {
            rejectUnauthorized: false,
            ciphers: 'SSLv3'
        },
        connectionTimeout: 15000,
        greetingTimeout: 1000,
        socketTimeout: 15000,
        debug: true,
        logger: true
    });
};

/**
 * Generate OTP email HTML
 */
const generateOTPEmailHTML = (userName, otp, purpose) => {
    return `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Hello ${userName},</h2>
            <p>Your OTP for ${purpose} is:</p>
            <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; margin: 20px 0;">
                <strong>${otp}</strong>
            </div>
            <p>This OTP is valid for 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <br/>
            <p>Best regards,</p>
            <p><strong>Campaign Waala Team</strong></p>
        </div>
    `;
};

/**
 * Generate OTP email text
 */
const generateOTPEmailText = (userName, otp, purpose) => {
    return `Hello ${userName},\n\nYour OTP for ${purpose} is: ${otp}\n\nThis OTP is valid for 10 minutes.\n\nBest regards,\nCampaign Waala Team`;
};

/**
 * Send OTP Email with robust fallback
 */
const sendOTPEmail = async (email, userName, otp, purpose = 'verification') => {
    console.log(`📧 Sending OTP to ${email} for ${purpose}`);
    
    try {
        const transporter = createTransporter();
        
        // Test connection first
        await transporter.verify();
        console.log('✅ SMTP Connection verified');
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || '<noreply@freelancerwala.com>',
            to: email,
            subject: `Your OTP Code - ${otp}`,
            html: generateOTPEmailHTML(userName, otp, purpose),
            text: generateOTPEmailText(userName, otp, purpose)
        };
        
        const info = await transporter.sendMail(mailOptions);
        console.log(`✅ Email sent: ${info.messageId}`);
        
        return {
            success: true,
            message: 'OTP sent successfully',
            messageId: info.messageId,
            otp: otp,
            emailSent: true
        };
        
    } catch (error) {
        console.error(`❌ Email failed: ${error.message}`);
        
        return {
            success: true,
            message: 'OTP generated. Email service temporarily unavailable.',
            developmentMode: true,
            otp: otp,
            emailSent: false,
            error: error.message
        };
    }
};

/**
 * Send Welcome Email
 */
const sendWelcomeEmail = async (email, userName) => {
    try {
        const transporter = createTransporter();

        await transporter.sendMail({
            from: process.env.EMAIL_FROM || '<noreply@freelancerwala.com>',
            to: email,
            subject: 'Welcome to Freelancer Wala 🎉',
            html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2>Welcome, ${userName}!</h2>
                <p>Your account has been successfully created.</p>
                <p>We're excited to have you onboard.</p>
                <br/>
                <strong>Campaign Waala Team</strong>
            </div>
            `
        });

        console.log('✅ Welcome email sent:', email);
        return { success: true };
    } catch (error) {
        console.error('❌ Welcome email failed:', error.message);
        return { success: false, error: error.message };
    }
};

// Export using CommonJS syntax
module.exports = {
    sendOTPEmail,
    sendWelcomeEmail
};