const nodemailer = require('nodemailer');

let transporter = null;

const createTransporter = () => {
    if (!transporter) {
        console.log('🔧 Creating SMTP Transporter for Gmail...');
        
        transporter = nodemailer.createTransport({
            service: 'gmail', // Use service instead of host/port
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            },
            pool: true,
            maxConnections: 5,
            connectionTimeout: 30000,
            greetingTimeout: 30000,
            socketTimeout: 45000,
            tls: {
                rejectUnauthorized: false
            }
        });

        // Verify connection
        transporter.verify(function(error, success) {
            if (error) {
                console.error('❌ Gmail SMTP Connection Failed:', error.message);
            } else {
                console.log('✅ Gmail SMTP Connected - Ready to send emails');
            }
        });
    }
    return transporter;
};

const sendOTPEmail = async (email, userName, otp, purpose = 'verification') => {
    console.log('\n📧 ===== SENDING OTP EMAIL =====');
    console.log('TO:', email);
    console.log('OTP:', otp);
    
    // Development mode check
    if (process.env.USE_STATIC_OTP === 'true') {
        console.log('🛠️  DEVELOPMENT MODE: Skipping email');
        return {
            success: true,
            developmentMode: true,
            data: { otp }
        };
    }

    // Check credentials
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        console.error('❌ Email credentials missing');
        return {
            success: true,
            developmentMode: true,
            data: { otp }
        };
    }

    try {
        const transporter = createTransporter();
        
        const purposeSubjects = {
            'registration': 'Complete Your Registration - Campaignwala',
            'login': 'Your Login OTP - Campaignwala'
        };

        const subject = purposeSubjects[purpose] || 'Your OTP Code';

        const mailOptions = {
            from: {
                name: 'Campaignwala',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: subject,
            html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background: #f4f4f4; padding: 20px; }
                    .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; padding: 30px; }
                    .header { background: #FF9500; color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0; }
                    .otp { font-size: 32px; font-weight: bold; color: #FF9500; text-align: center; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>Campaign Waala</h1>
                        <h2>Your OTP Code</h2>
                    </div>
                    <p>Hello <strong>${userName}</strong>,</p>
                    <p>Your One-Time Password (OTP) is:</p>
                    <div class="otp">${otp}</div>
                    <p>This OTP is valid for 10 minutes.</p>
                    <p><strong>Do not share this OTP with anyone.</strong></p>
                    <br>
                    <p>Best regards,<br>Campaign Waala Team</p>
                </div>
            </body>
            </html>
            `,
            text: `
            Campaign Waala OTP Verification
            
            Hello ${userName},
            
            Your OTP code is: ${otp}
            
            This OTP is valid for 10 minutes.
            
            Do not share this OTP with anyone.
            
            Best regards,
            Campaign Waala Team
            `
        };

        console.log('📤 Sending email via Gmail...');
        const info = await transporter.sendMail(mailOptions);
        
        console.log('✅ EMAIL SENT SUCCESSFULLY!');
        console.log('Message ID:', info.messageId);
        
        return {
            success: true,
            message: 'OTP sent to email',
            developmentMode: false,
            messageId: info.messageId
        };

    } catch (error) {
        console.error('❌ EMAIL SEND ERROR:', error.message);
        
        return {
            success: true,
            message: 'OTP generated (Email failed)',
            developmentMode: true,
            data: { otp },
            error: error.message
        };
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
                name: 'Campaignwala Team',
                address: process.env.EMAIL_USER
            },
            to: email,
            subject: 'Welcome to Campaignwala! 🎉',
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
                    <p>Welcome to Campaignwala! Your account has been successfully created and verified.</p>
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