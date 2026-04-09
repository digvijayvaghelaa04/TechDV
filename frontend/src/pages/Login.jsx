import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { login, reset, resetError } from '../store/authSlice';
import { useToast } from '../context/ToastContext';
import Loader from '../components/Loader';
import { PageTransition } from '../components/PageTransition';

// ── Eye icon ────────────────────────────────────────────────────────────────────
const EyeIcon = ({ open }) => open ? (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
) : (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
);

// ══════════════════════════════════════════════════════════════════════════════
// LOGIN PAGE
// ══════════════════════════════════════════════════════════════════════════════
function Login() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();

    const { user, isLoading, isError, isSuccess, message, requireVerification, actualEmail } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);

    const queryParams = new URLSearchParams(location.search);
    const isInvalidated = queryParams.get('invalidated') === 'true';
    const isJustVerified = queryParams.get('verified') === 'true';

    // ── On mount: clear errors, show "verified" toast ─────────────────────────
    useEffect(() => {
        dispatch(resetError());

        if (isJustVerified) {
            toast.success('Email verified! Your account is now active. Please log in.');
        }

        // If already logged in, redirect
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser?.token) {
            navigate('/dashboard', { replace: true });
        }
    }, [dispatch, navigate, isJustVerified, toast]);

    // ── On login success ──────────────────────────────────────────────────────
    useEffect(() => {
        if (isSuccess || (user && user.token)) {
            dispatch(reset());
            navigate('/dashboard', { replace: true });
        }
    }, [user, isSuccess, navigate, dispatch]);

    const onSubmit = (e) => {
        e.preventDefault();
        if (!formData.email || !formData.password) return;
        dispatch(login(formData));
    };

    // ── Handle "Verify Now" redirect ──────────────────────────────────────────
    const handleVerifyNow = () => {
        const emailToUse = actualEmail || formData.email;
        navigate('/verify-otp', { state: { email: emailToUse } });
    };

    if (isLoading) return <Loader />;

    return (
        <PageTransition>
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-24 px-4 bg-background">
                {/* Background */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                <div className="absolute top-0 right-0 h-[600px] w-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 h-[600px] w-[600px] bg-secondary/10 rounded-full blur-[120px] pointer-events-none" />

                <div className="w-full max-w-md bg-background/40 backdrop-blur-3xl p-12 rounded-[3rem] border border-border relative z-10 shadow-2xl overflow-hidden">
                    {/* Scanning line */}
                    <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scanline pointer-events-none" />

                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-display font-black text-foreground mb-4 tracking-tighter uppercase italic">Login</h1>
                        <p className="text-foreground/40 text-sm font-medium tracking-tight">
                            Login to your account to continue learning.
                        </p>
                    </div>

                    {/* ── Invalidated session banner ── */}
                    {isInvalidated && (
                        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] mb-8 text-center">
                            Your session was ended from another device.
                        </div>
                    )}

                    {/* ── Verified success banner ── */}
                    {isJustVerified && !isError && (
                        <div className="bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-4 rounded-2xl text-xs font-bold mb-8 text-center">
                            ✓ Email verified! Your account is now active.
                        </div>
                    )}

                    {/* ── Unverified account banner ── */}
                    {isError && requireVerification && (
                        <div
                            id="login-unverified-banner"
                            className="bg-amber-500/10 border border-amber-500/30 text-amber-400 px-5 py-5 rounded-2xl mb-8 text-center space-y-3"
                            role="alert"
                        >
                            <p className="text-[11px] font-black uppercase tracking-widest">Email Not Verified</p>
                            <p className="text-xs font-medium text-amber-300/80">
                                {message || 'Please verify your email to continue.'}
                            </p>
                            <button
                                id="verify-now-btn"
                                type="button"
                                onClick={handleVerifyNow}
                                className="mt-1 inline-block bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-300 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.3em] transition-all"
                            >
                                Verify Now →
                            </button>
                        </div>
                    )}

                    {/* ── Generic error ── */}
                    {isError && !requireVerification && message && !isInvalidated && (
                        <div
                            id="login-error-message"
                            className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.1em] mb-8 text-center animate-shake"
                            role="alert"
                        >
                            {typeof message === 'string' ? message : 'Login failed.'}
                        </div>
                    )}

                    <form className="space-y-8" onSubmit={onSubmit}>
                        {/* Email */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">
                                Email Address
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full bg-card border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground placeholder:text-foreground/10 focus:outline-none focus:border-primary focus:bg-white/[0.03] transition-all"
                                placeholder="your@email.com"
                                required
                                autoComplete="email"
                            />
                        </div>

                        {/* Password */}
                        <div className="space-y-3">
                            <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPassword ? 'text' : 'password'}
                                    name="password"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full bg-card border border-border rounded-2xl px-6 py-4 pr-14 text-sm font-bold text-foreground placeholder:text-foreground/10 focus:outline-none focus:border-primary focus:bg-white/[0.03] transition-all"
                                    placeholder="••••••••"
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(v => !v)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground transition-colors"
                                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                                >
                                    <EyeIcon open={showPassword} />
                                </button>
                            </div>
                            <div className="flex justify-end pr-2">
                                <Link
                                    to="/forgot-password"
                                    className="text-[9px] font-black text-foreground/20 hover:text-foreground uppercase tracking-[0.2em] transition-colors"
                                >
                                    Forgot Password?
                                </Link>
                            </div>
                        </div>

                        <button
                            id="login-submit-btn"
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full h-16 rounded-2xl overflow-hidden cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <div className="absolute inset-0 bg-foreground group-hover:bg-primary transition-colors duration-500" />
                            <span className="relative z-10 text-background group-hover:text-foreground text-[10px] font-black uppercase tracking-[0.4em] transition-colors flex items-center justify-center gap-2">
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                        Processing...
                                    </>
                                ) : 'Login'}
                            </span>
                        </button>
                    </form>

                    <p className="text-center mt-12 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
                        New User?{' '}
                        <Link to="/register" className="text-primary font-black hover:text-foreground transition-colors">
                            Create Account
                        </Link>
                    </p>
                </div>
            </div>
        </PageTransition>
    );
}

export default Login;
