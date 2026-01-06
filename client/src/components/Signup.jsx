import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import './Login.css';

const Signup = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [showOTPModal, setShowOTPModal] = useState(false);
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [otpError, setOtpError] = useState('');
    const [resendTimer, setResendTimer] = useState(0);

    const { name, email, phone, password, confirmPassword } = formData;

    // Password strength calculation
    const getPasswordStrength = (pwd) => {
        let strength = 0;
        if (pwd.length >= 8) strength++;
        if (/[a-z]/.test(pwd)) strength++;
        if (/[A-Z]/.test(pwd)) strength++;
        if (/[0-9]/.test(pwd)) strength++;
        if (/[^a-zA-Z0-9]/.test(pwd)) strength++;
        return strength;
    };

    const passwordStrength = getPasswordStrength(password);
    const strengthLabels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const strengthColors = ['', '#ff5252', '#ff9800', '#ffd740', '#69f0ae', '#00e676'];

    // Validation
    const validateForm = () => {
        const newErrors = {};

        if (!name.trim()) newErrors.name = 'Name is required';

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) newErrors.email = 'Email is required';
        else if (!emailRegex.test(email)) newErrors.email = 'Invalid email format';

        const phoneRegex = /^[0-9]{10}$/;
        if (!phone) newErrors.phone = 'Phone number is required';
        else if (!phoneRegex.test(phone)) newErrors.phone = 'Phone must be 10 digits';

        if (!password) newErrors.password = 'Password is required';
        else if (password.length < 8) newErrors.password = 'Password must be at least 8 characters';

        if (!confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
        else if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        // Clear error for this field
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, phone, password })
            });

            const data = await res.json();

            if (res.ok) {
                setShowOTPModal(true);
                startResendTimer();
            } else {
                setErrors({ submit: data.msg || 'Signup failed' });
            }
        } catch (err) {
            setErrors({ submit: 'Server error. Please try again.' });
        }
        setLoading(false);
    };

    const startResendTimer = () => {
        setResendTimer(60);
        const interval = setInterval(() => {
            setResendTimer((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleOTPChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only digits

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setOtpError('');

        // Auto-focus next input
        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`).focus();
        }
    };

    const handleOTPKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`).focus();
        }
    };

    const handleVerifyOTP = async () => {
        const otpCode = otp.join('');
        if (otpCode.length !== 6) {
            setOtpError('Please enter complete OTP');
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp: otpCode })
            });

            const data = await res.json();

            if (res.ok) {
                setShowOTPModal(false);
                alert('Account verified successfully! Please login to continue.');
                navigate('/login');
            } else {
                if (data.msg === 'Account already verified') {
                    alert('Account is already verified! Redirecting to login...');
                    navigate('/login');
                } else {
                    setOtpError(data.msg || 'Invalid OTP');
                }
            }
        } catch (err) {
            setOtpError('Server error. Please try again.');
        }
        setLoading(false);
    };

    const handleResendOTP = async () => {
        if (resendTimer > 0) return;

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/resend-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (res.ok) {
                setOtp(['', '', '', '', '', '']);
                setOtpError('');
                startResendTimer();
                alert('OTP resent successfully!');
            } else {
                setOtpError(data.msg || 'Failed to resend OTP');
            }
        } catch (err) {
            setOtpError('Server error. Please try again.');
        }
        setLoading(false);
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <h2>Create Account</h2>
                <p className="subtitle">Join GreevaTech Hydroponics</p>

                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div className="input-group">
                        <FaUser className="input-icon" />
                        <input
                            type="text"
                            name="name"
                            placeholder="Full Name"
                            value={name}
                            onChange={handleChange}
                            className={errors.name ? 'error' : ''}
                        />
                        {errors.name && <span className="error-msg"><FaTimesCircle /> {errors.name}</span>}
                    </div>

                    {/* Email */}
                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email Address"
                            value={email}
                            onChange={handleChange}
                            className={errors.email ? 'error' : ''}
                        />
                        {errors.email && <span className="error-msg"><FaTimesCircle /> {errors.email}</span>}
                    </div>

                    {/* Phone */}
                    <div className="input-group">
                        <FaPhone className="input-icon" />
                        <input
                            type="tel"
                            name="phone"
                            placeholder="Phone Number (10 digits)"
                            value={phone}
                            onChange={handleChange}
                            maxLength="10"
                            className={errors.phone ? 'error' : ''}
                        />
                        {errors.phone && <span className="error-msg"><FaTimesCircle /> {errors.phone}</span>}
                    </div>

                    {/* Password */}
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            placeholder="Password"
                            value={password}
                            onChange={handleChange}
                            className={errors.password ? 'error' : ''}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {errors.password && <span className="error-msg"><FaTimesCircle /> {errors.password}</span>}
                    </div>

                    {/* Password Strength */}
                    {password && (
                        <div className="password-strength">
                            <div className="strength-bar">
                                <div
                                    className="strength-fill"
                                    style={{
                                        width: `${(passwordStrength / 5) * 100}%`,
                                        background: strengthColors[passwordStrength]
                                    }}
                                ></div>
                            </div>
                            <span style={{ color: strengthColors[passwordStrength] }}>
                                {strengthLabels[passwordStrength]}
                            </span>
                        </div>
                    )}

                    {/* Confirm Password */}
                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type={showConfirmPassword ? 'text' : 'password'}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={handleChange}
                            className={errors.confirmPassword ? 'error' : ''}
                        />
                        <button
                            type="button"
                            className="toggle-password"
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                        {errors.confirmPassword && <span className="error-msg"><FaTimesCircle /> {errors.confirmPassword}</span>}
                        {!errors.confirmPassword && confirmPassword && password === confirmPassword && (
                            <span className="success-msg"><FaCheckCircle /> Passwords match</span>
                        )}
                    </div>

                    {errors.submit && <div className="submit-error">{errors.submit}</div>}

                    <button type="submit" className="btn-login" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <div className="login-footer">
                    Already have an account? <span onClick={() => navigate('/login')}>Login</span>
                </div>
            </div>

            {/* OTP Modal */}
            {showOTPModal && (
                <div className="modal-overlay" onClick={() => setShowOTPModal(false)}>
                    <div className="modal-content otp-modal" onClick={(e) => e.stopPropagation()}>
                        <h3>Verify Your Email</h3>
                        <p>We've sent a 6-digit OTP to <strong>{email}</strong></p>

                        <div className="otp-inputs">
                            {otp.map((digit, index) => (
                                <input
                                    key={index}
                                    id={`otp-${index}`}
                                    type="text"
                                    maxLength="1"
                                    value={digit}
                                    onChange={(e) => handleOTPChange(index, e.target.value)}
                                    onKeyDown={(e) => handleOTPKeyDown(index, e)}
                                    className="otp-input"
                                />
                            ))}
                        </div>

                        {otpError && <div className="otp-error">{otpError}</div>}

                        <button
                            className="btn-verify"
                            onClick={handleVerifyOTP}
                            disabled={loading}
                        >
                            {loading ? 'Verifying...' : 'Verify OTP'}
                        </button>

                        <div className="resend-section">
                            {resendTimer > 0 ? (
                                <span>Resend OTP in {resendTimer}s</span>
                            ) : (
                                <button onClick={handleResendOTP} disabled={loading}>
                                    Resend OTP
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Signup;
