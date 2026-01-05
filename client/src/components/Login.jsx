import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUserShield, FaUser, FaEnvelope, FaLock } from 'react-icons/fa';
import { API_URL } from '../config';
import './Login.css';

const Login = () => {
    const [isAdmin, setIsAdmin] = useState(false);
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const { email, password } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError('');

        // Basic frontend check - admin login requires specific domain usually, but we'll stick to role check
        if (isAdmin && !email.includes('@greeva.tech')) {
            // Just a visual cue, backend will prevent non-admins anyway if we check properly
        }

        try {
            const res = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.msg || 'Login failed');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('role', data.user.role);
            localStorage.setItem('userName', data.user.name);

            if (data.user.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }

        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div className="login-page">
            <div className="login-card">
                <div className="login-header">
                    <h2>{isAdmin ? 'Admin Portal' : 'User Login'}</h2>
                    <p>Welcome back to GreevaTech</p>
                </div>

                <div className="role-toggle">
                    <button
                        className={`toggle-btn ${!isAdmin ? 'active' : ''}`}
                        onClick={() => setIsAdmin(false)}
                    >
                        <FaUser /> User
                    </button>
                    <button
                        className={`toggle-btn ${isAdmin ? 'active' : ''}`}
                        onClick={() => setIsAdmin(true)}
                    >
                        <FaUserShield /> Admin
                    </button>
                </div>

                <form onSubmit={onSubmit}>
                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            placeholder={isAdmin ? "admin@greeva.tech" : "user@example.com"}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaLock className="input-icon" />
                        <input
                            type="password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    {error && <div className="submit-error">{error}</div>}

                    <button type="submit" className="btn-login">
                        {isAdmin ? 'Access Dashboard' : 'Sign In'}
                    </button>
                </form>

                <div className="forgot-password-link">
                    <span onClick={() => navigate('/forgot-password')}>Forgot Password?</span>
                </div>

                <div className="login-footer">
                    {!isAdmin && (
                        <>
                            Don't have an account? <span onClick={() => navigate('/signup')}>Sign Up</span>
                        </>
                    )}
                    {isAdmin && (
                        <p style={{ color: '#6c757d', fontSize: '0.9rem' }}>Admin access only</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Login;
