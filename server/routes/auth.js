const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { generateOTP, sendSignupOTP, sendPasswordResetOTP } = require('../services/emailService');

const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey123';

// POST /api/auth/signup - Register new user and send OTP
router.post('/signup', async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        // Validation
        if (!name || !email || !phone || !password) {
            return res.status(400).json({ msg: 'Please provide all required fields' });
        }

        // Check if user already exists
        let user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ msg: 'User already exists with this email' });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create user (unverified)
        user = new User({
            name,
            email,
            phone,
            password: hashedPassword,
            role: 'user',
            isVerified: false,
            otp,
            otpExpiry
        });

        await user.save();

        // Send OTP email
        try {
            await sendSignupOTP(email, name, otp);
            res.json({
                msg: 'OTP sent to your email. Please verify to complete registration.',
                email: email
            });
        } catch (emailError) {
            // If email fails, delete the user
            await User.findByIdAndDelete(user._id);
            console.error('Email sending failed:', emailError);
            return res.status(500).json({ msg: 'Failed to send OTP email. Please try again.' });
        }

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/auth/verify-otp - Verify OTP and activate account
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ msg: 'Please provide email and OTP' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ msg: 'Account already verified' });
        }

        // Check OTP expiry
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });
        }

        // Verify OTP
        if (user.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        // Activate account efficiently
        await User.findByIdAndUpdate(user._id, {
            $set: { isVerified: true },
            $unset: { otp: 1, otpExpiry: 1 }
        });

        res.json({ msg: 'Account verified successfully! You can now login.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/auth/resend-otp - Resend OTP
router.post('/resend-otp', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: 'Please provide email' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ msg: 'Account already verified' });
        }

        // Generate new OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send OTP email
        await sendSignupOTP(email, user.name, otp);

        res.json({ msg: 'OTP resent successfully' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/auth/login - Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ msg: 'Please provide email and password' });
        }

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Check role
        if (role && user.role !== role) {
            return res.status(403).json({ msg: `This account is not registered as ${role}` });
        }

        // Check if verified (only for regular users, not admins)
        if (user.role === 'user' && !user.isVerified) {
            return res.status(403).json({ msg: 'Please verify your email before logging in' });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create JWT
        const payload = {
            user: {
                id: user.id,
                role: user.role
            }
        };

        jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' }, (err, token) => {
            if (err) throw err;
            res.json({
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            });
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/auth/forgot-password - Send password reset OTP
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ msg: 'Please provide email' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'No account found with this email' });
        }

        // Generate OTP
        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);

        user.otp = otp;
        user.otpExpiry = otpExpiry;
        await user.save();

        // Send password reset OTP
        await sendPasswordResetOTP(email, user.name, otp);

        res.json({ msg: 'Password reset OTP sent to your email', email: email });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/auth/verify-reset-otp - Verify password reset OTP
router.post('/verify-reset-otp', async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ msg: 'Please provide email and OTP' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        // Check OTP expiry
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });
        }

        // Verify OTP
        if (user.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        res.json({ msg: 'OTP verified. You can now reset your password.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

// POST /api/auth/reset-password - Reset password after OTP verification
router.post('/reset-password', async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;

        if (!email || !otp || !newPassword) {
            return res.status(400).json({ msg: 'Please provide all required fields' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ msg: 'User not found' });
        }

        // Check OTP expiry
        if (new Date() > user.otpExpiry) {
            return res.status(400).json({ msg: 'OTP has expired. Please request a new one.' });
        }

        // Verify OTP
        if (user.otp !== otp) {
            return res.status(400).json({ msg: 'Invalid OTP' });
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password and clear OTP
        user.password = hashedPassword;
        user.otp = null;
        user.otpExpiry = null;
        await user.save();

        res.json({ msg: 'Password reset successfully. You can now login with your new password.' });

    } catch (err) {
        console.error(err.message);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;
