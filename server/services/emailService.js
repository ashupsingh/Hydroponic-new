const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
};

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send Signup OTP Email
const sendSignupOTP = async (email, name, otp) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'GreevaTech <noreply@greeva.tech>',
        to: email,
        subject: 'Verify Your Email - GreevaTech Hydroponics',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #00e676 0%, #00c965 100%); padding: 30px; text-align: center; }
                    .header h1 { color: #000; margin: 0; font-size: 24px; }
                    .content { padding: 40px 30px; }
                    .otp-box { background: #f8f9fa; border: 2px dashed #00e676; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #00e676; letter-spacing: 8px; }
                    .footer { background: #1a1f2e; color: #6c757d; padding: 20px; text-align: center; font-size: 12px; }
                    .btn { display: inline-block; padding: 12px 30px; background: #00e676; color: #000; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style="display: inline-block; vertical-align: middle; margin-right: 10px;">
                            <path d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z" fill="#000"/>
                        </svg>
                        <h1 style="display: inline-block; vertical-align: middle;">GreevaTech Hydroponics</h1>
                    </div>
                    <div class="content">
                        <h2>Welcome, ${name}!</h2>
                        <p>Thank you for signing up with GreevaTech Hydroponics. To complete your registration, please verify your email address using the OTP below:</p>
                        
                        <div class="otp-box">
                            <p style="margin: 0; color: #6c757d; font-size: 14px;">Your OTP Code</p>
                            <div class="otp-code">${otp}</div>
                            <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 12px;">Valid for 5 minutes</p>
                        </div>
                        
                        <p>If you didn't request this, please ignore this email.</p>
                        <p style="color: #6c757d; font-size: 14px;">Best regards,<br>The GreevaTech Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 GreevaTech. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Signup OTP sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending signup OTP:', error);
        throw error;
    }
};

// Send Password Reset OTP Email
const sendPasswordResetOTP = async (email, name, otp) => {
    const transporter = createTransporter();

    const mailOptions = {
        from: process.env.EMAIL_FROM || 'GreevaTech <noreply@greeva.tech>',
        to: email,
        subject: 'Password Reset Request - GreevaTech Hydroponics',
        html: `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; background-color: #f4f4f4; margin: 0; padding: 0; }
                    .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    .header { background: linear-gradient(135deg, #ff5252 0%, #ff1744 100%); padding: 30px; text-align: center; }
                    .header h1 { color: #fff; margin: 0; font-size: 24px; }
                    .content { padding: 40px 30px; }
                    .otp-box { background: #fff3f3; border: 2px dashed #ff5252; border-radius: 8px; padding: 20px; text-align: center; margin: 30px 0; }
                    .otp-code { font-size: 32px; font-weight: bold; color: #ff5252; letter-spacing: 8px; }
                    .footer { background: #1a1f2e; color: #6c757d; padding: 20px; text-align: center; font-size: 12px; }
                    .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" style="display: inline-block; vertical-align: middle; margin-right: 10px;">
                            <path d="M12 17C10.89 17 10 16.1 10 15C10 13.89 10.89 13 12 13C13.1 13 14 13.89 14 15C14 16.1 13.1 17 12 17M18 20V10H6V20H18M18 8C19.11 8 20 8.9 20 10V20C20 21.11 19.11 22 18 22H6C4.89 22 4 21.1 4 20V10C4 8.9 4.89 8 6 8H7V6C7 3.24 9.24 1 12 1C14.76 1 17 3.24 17 6V8H18M12 3C10.34 3 9 4.34 9 6V8H15V6C15 4.34 13.66 3 12 3Z" fill="#fff"/>
                        </svg>
                        <h1 style="display: inline-block; vertical-align: middle;">Password Reset Request</h1>
                    </div>
                    <div class="content">
                        <h2>Hello, ${name}</h2>
                        <p>We received a request to reset your password. Use the OTP below to proceed:</p>
                        
                        <div class="otp-box">
                            <p style="margin: 0; color: #6c757d; font-size: 14px;">Your OTP Code</p>
                            <div class="otp-code">${otp}</div>
                            <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 12px;">Valid for 5 minutes</p>
                        </div>
                        
                        <div class="warning">
                            <strong>⚠️ Security Alert:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure.
                        </div>
                        
                        <p style="color: #6c757d; font-size: 14px;">Best regards,<br>The GreevaTech Team</p>
                    </div>
                    <div class="footer">
                        <p>© 2026 GreevaTech. All rights reserved.</p>
                        <p>This is an automated email. Please do not reply.</p>
                    </div>
                </div>
            </body>
            </html>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset OTP sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending password reset OTP:', error);
        throw error;
    }
};

module.exports = {
    generateOTP,
    sendSignupOTP,
    sendPasswordResetOTP
};
