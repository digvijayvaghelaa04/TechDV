import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../utils/api';

import { PageTransition } from '../components/PageTransition';

function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    const onEmailSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.post('/auth/forgotpassword', { email });
            if (res.data.success) {
                setStep(2);
                setMessage('OTP sent to your email. Please check your inbox.');
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong');
        }
        setLoading(false);
    };

    const onResetSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await api.put('/auth/resetpassword', { email, otp, password });
            if (res.data.success) {
                setMessage('Password reset successful! Redirecting to login...');
                setTimeout(() => navigate('/login'), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.error || 'Invalid OTP or expired');
        }
        setLoading(false);
    };


    return (
        <PageTransition>
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-24 px-4 bg-background">
                {/* Background Effects */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 h-[600px] w-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="w-full max-w-md bg-background/40 backdrop-blur-3xl p-10 rounded-[3rem] border border-border relative z-10 shadow-2xl overflow-hidden">
                    {/* Decorative scanning line */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scanline pointer-events-none" />

                    <div className="mb-8 text-center">
                        <h1 className="text-3xl font-display font-black text-foreground mb-4 tracking-tighter uppercase italic">
                            {step === 1 ? 'Forgot' : 'Reset'} <span className="text-primary italic">Password</span>
                        </h1>
                        <p className="text-foreground/40 text-sm font-medium">
                            {step === 1
                                ? "Enter your email to receive a recovery OTP."
                                : "Enter the OTP sent to your email and your new password."}
                        </p>
                    </div>

                    <Link to="/login" className="text-[10px] font-black text-foreground/40 hover:text-foreground mb-8 block transition-colors uppercase tracking-[0.2em] text-center">← Back to Login</Link>

                    {message && (
                        <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-500 text-[10px] font-black uppercase tracking-[0.1em] text-center">
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-500 text-[10px] font-black uppercase tracking-[0.1em] text-center">
                            {error}
                        </div>
                    )}

                    {step === 1 ? (
                        <form onSubmit={onEmailSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2 block">Email Address</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full bg-card border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground placeholder:text-foreground/10 focus:outline-none focus:border-primary transition-all"
                                    placeholder="yourname@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full h-16 rounded-2xl overflow-hidden cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-foreground group-hover:bg-primary transition-colors duration-500" />
                                <span className="relative z-10 text-background group-hover:text-foreground text-[10px] font-black uppercase tracking-[0.3em] transition-colors">
                                    {loading ? 'SENDING...' : 'SEND RECOVERY OTP'}
                                </span>
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={onResetSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2 block">OTP Code</label>
                                <input
                                    type="text"
                                    required
                                    maxLength="6"
                                    className="w-full bg-card border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground placeholder:text-foreground/10 focus:outline-none focus:border-primary font-mono tracking-[0.5em] text-center"
                                    placeholder="XXXXXX"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2 block">New Password</label>
                                <input
                                    type="password"
                                    required
                                    minLength="6"
                                    className="w-full bg-card border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground placeholder:text-foreground/10 focus:outline-none focus:border-primary transition-all"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full h-16 rounded-2xl overflow-hidden cursor-pointer"
                            >
                                <div className="absolute inset-0 bg-foreground group-hover:bg-primary transition-colors duration-500" />
                                <span className="relative z-10 text-background group-hover:text-foreground text-[10px] font-black uppercase tracking-[0.3em] transition-colors">
                                    {loading ? 'RESETTING...' : 'RESET PASSWORD'}
                                </span>
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </PageTransition>
    );
}

export default ForgotPassword;
