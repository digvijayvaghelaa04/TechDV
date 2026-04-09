import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register, resetError } from '../store/authSlice';
import { useToast } from '../context/ToastContext';
import { PageTransition } from '../components/PageTransition';

// ── Password strength helper ────────────────────────────────────────────────────
const getPasswordStrength = (pass) => {
    if (!pass) return { level: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/\d/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    const map = [
        { level: 0, label: '', color: '' },
        { level: 1, label: 'Weak', color: 'bg-red-500' },
        { level: 2, label: 'Fair', color: 'bg-yellow-500' },
        { level: 3, label: 'Good', color: 'bg-blue-500' },
        { level: 4, label: 'Strong', color: 'bg-green-500' },
    ];
    return map[score] || map[0];
};

// ── Reusable Input ──────────────────────────────────────────────────────────────
const FormInput = ({ label, name, type = 'text', value, onChange, placeholder, required, children }) => (
    <div className="space-y-3">
        <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">
            {label}
        </label>
        <div className="relative">
            <input
                id={`register-${name}`}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                className="w-full bg-card border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary focus:bg-white/[0.03] transition-all"
                placeholder={placeholder}
                required={required}
                autoComplete={name}
            />
            {children}
        </div>
    </div>
);

// ── Eye icon toggle ─────────────────────────────────────────────────────────────
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
// REGISTER PAGE
// ══════════════════════════════════════════════════════════════════════════════
function Register() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const toast = useToast();

    const { isLoading, isError, isOtpSent, tempEmail, actualEmail, message } = useSelector((state) => state.auth);

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        email: '',
        mobileNumber: '',
        password: '',
        confirmPassword: '',
        dateOfBirth: '',
        education: ''
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [clientErrors, setClientErrors] = useState({});

    // Clear errors on mount
    useEffect(() => {
        dispatch(resetError());
    }, [dispatch]);

    // ── Redirect to verify-otp after successful registration ─────────────────
    useEffect(() => {
        if (isOtpSent) {
            toast.success('OTP sent! Please check your email.');
            navigate('/verify-otp', {
                state: {
                    email: formData.email,
                    maskedEmail: tempEmail
                }
            });
        }
    }, [isOtpSent, navigate, toast, formData.email, tempEmail]);

    const onChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
        if (clientErrors[e.target.name]) {
            setClientErrors(prev => ({ ...prev, [e.target.name]: '' }));
        }
    };

    // ── Client-side validation ────────────────────────────────────────────────
    const validate = () => {
        const errors = {};
        if (!formData.firstName.trim()) errors.firstName = 'First name is required';
        if (!formData.lastName.trim()) errors.lastName = 'Last name is required';
        if (!formData.username.trim() || formData.username.length < 3) errors.username = 'Username must be at least 3 characters';
        if (!formData.email.trim() || !/^\S+@\S+\.\S+$/.test(formData.email)) errors.email = 'Valid email is required';
        if (!formData.mobileNumber.trim() || formData.mobileNumber.length < 10) errors.mobileNumber = 'Valid mobile number is required';

        const pwdStrength = getPasswordStrength(formData.password);
        if (!formData.password) {
            errors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            errors.password = 'Password must be at least 8 characters';
        } else if (pwdStrength.level < 3) {
            errors.password = 'Password must include uppercase, number, and special character';
        }

        if (formData.password !== formData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        return errors;
    };

    const onSubmit = (e) => {
        e.preventDefault();
        const errors = validate();
        if (Object.keys(errors).length > 0) {
            setClientErrors(errors);
            return;
        }
        setClientErrors({});
        // Send confirmPassword to backend for double-check
        dispatch(register(formData));
    };

    const strength = getPasswordStrength(formData.password);

    return (
        <PageTransition>
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-24 px-4 bg-background">
                {/* Background */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                <div className="absolute top-0 left-0 h-[800px] w-[800px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
                <div className="absolute bottom-0 right-0 h-[800px] w-[800px] bg-primary/5 rounded-full blur-[160px] pointer-events-none" />

                <div className="w-full max-w-4xl bg-background/40 backdrop-blur-3xl p-12 md:p-16 rounded-[3rem] border border-border relative z-10 shadow-2xl overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <span className="text-[10px] font-black text-foreground/10 uppercase tracking-[0.5em]">JOIN TECHDV</span>
                    </div>

                    <div className="text-center mb-12">
                        <h1 className="text-5xl font-display font-black text-foreground mb-4 tracking-tighter uppercase italic">
                            Create Account
                        </h1>
                        <p className="text-foreground/40 text-lg font-medium tracking-tight">
                            Create your account to start learning today.
                        </p>
                    </div>

                    {/* ── Server Error ── */}
                    {isError && message && (
                        <div
                            id="register-error"
                            className="bg-red-500/10 border border-red-500/20 text-red-400 px-6 py-4 rounded-2xl text-xs font-bold uppercase tracking-widest mb-10 text-center animate-shake"
                            role="alert"
                        >
                            {typeof message === 'string' ? message : 'Registration failed. Please try again.'}
                        </div>
                    )}

                    <form className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8" onSubmit={onSubmit} noValidate>
                        {/* ── Left Column ── */}
                        <div className="space-y-8">
                            {/* First Name */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">First Name</label>
                                <input
                                    id="register-firstName"
                                    type="text" name="firstName" value={formData.firstName} onChange={onChange}
                                    className="w-full bg-card border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary transition-all"
                                    placeholder="First Name" required
                                />
                                {clientErrors.firstName && <p className="text-red-400 text-xs ml-2">{clientErrors.firstName}</p>}
                            </div>

                            {/* Last Name */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">Last Name</label>
                                <input
                                    id="register-lastName"
                                    type="text" name="lastName" value={formData.lastName} onChange={onChange}
                                    className="w-full bg-card border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary transition-all"
                                    placeholder="Last Name" required
                                />
                                {clientErrors.lastName && <p className="text-red-400 text-xs ml-2">{clientErrors.lastName}</p>}
                            </div>

                            {/* Username */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">Username</label>
                                <input
                                    id="register-username"
                                    type="text" name="username" value={formData.username} onChange={onChange}
                                    className="w-full bg-card border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary transition-all"
                                    placeholder="Username" required
                                />
                                {clientErrors.username && <p className="text-red-400 text-xs ml-2">{clientErrors.username}</p>}
                            </div>

                            {/* Email */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">Email Address</label>
                                <input
                                    id="register-email"
                                    type="email" name="email" value={formData.email} onChange={onChange}
                                    className="w-full bg-card border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary transition-all"
                                    placeholder="Email Address" required
                                />
                                {clientErrors.email && <p className="text-red-400 text-xs ml-2">{clientErrors.email}</p>}
                            </div>
                        </div>

                        {/* ── Right Column ── */}
                        <div className="space-y-8">
                            {/* Phone */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">Phone Number</label>
                                <input
                                    id="register-mobileNumber"
                                    type="tel" name="mobileNumber" value={formData.mobileNumber} onChange={onChange}
                                    className="w-full bg-card border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary transition-all"
                                    placeholder="Phone Number" required
                                />
                                {clientErrors.mobileNumber && <p className="text-red-400 text-xs ml-2">{clientErrors.mobileNumber}</p>}
                            </div>

                            {/* Date of Birth */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">Date of Birth</label>
                                <input
                                    id="register-dateOfBirth"
                                    type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={onChange}
                                    className="w-full bg-card border border-border rounded-2xl px-6 py-4 text-sm font-bold text-foreground focus:outline-none focus:border-primary transition-all"
                                />
                            </div>

                            {/* Password */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">Password</label>
                                <div className="relative">
                                    <input
                                        id="register-password"
                                        type={showPassword ? 'text' : 'password'}
                                        name="password" value={formData.password} onChange={onChange}
                                        className="w-full bg-card border border-border rounded-2xl px-6 py-4 pr-14 text-sm font-bold text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary transition-all"
                                        placeholder="Min. 8 characters" required
                                    />
                                    <button type="button" onClick={() => setShowPassword(v => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground transition-colors">
                                        <EyeIcon open={showPassword} />
                                    </button>
                                </div>
                                {/* Strength bar */}
                                {formData.password && (
                                    <div className="space-y-1 px-1">
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4].map(s => (
                                                <div key={s} className={`h-1 flex-1 rounded-full transition-all ${s <= strength.level ? strength.color : 'bg-border'}`} />
                                            ))}
                                        </div>
                                        <p className={`text-[10px] font-bold uppercase tracking-widest ${strength.level <= 1 ? 'text-red-400' : strength.level === 2 ? 'text-yellow-400' : strength.level === 3 ? 'text-blue-400' : 'text-green-400'}`}>
                                            {strength.label}
                                        </p>
                                    </div>
                                )}
                                {clientErrors.password && <p className="text-red-400 text-xs ml-2">{clientErrors.password}</p>}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">Confirm Password</label>
                                <div className="relative">
                                    <input
                                        id="register-confirmPassword"
                                        type={showConfirm ? 'text' : 'password'}
                                        name="confirmPassword" value={formData.confirmPassword} onChange={onChange}
                                        className={`w-full bg-card border rounded-2xl px-6 py-4 pr-14 text-sm font-bold text-foreground placeholder:text-foreground/20 focus:outline-none transition-all ${
                                            formData.confirmPassword
                                                ? formData.confirmPassword === formData.password ? 'border-green-500/50 focus:border-green-500' : 'border-red-500/50 focus:border-red-500'
                                                : 'border-border focus:border-primary'
                                        }`}
                                        placeholder="Repeat your password" required
                                    />
                                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground transition-colors">
                                        <EyeIcon open={showConfirm} />
                                    </button>
                                    {formData.confirmPassword && (
                                        <span className={`absolute right-12 top-1/2 -translate-y-1/2 text-sm ${formData.confirmPassword === formData.password ? 'text-green-400' : 'text-red-400'}`}>
                                            {formData.confirmPassword === formData.password ? '✓' : '✗'}
                                        </span>
                                    )}
                                </div>
                                {clientErrors.confirmPassword && <p className="text-red-400 text-xs ml-2">{clientErrors.confirmPassword}</p>}
                            </div>
                        </div>

                        {/* ── Submit ── */}
                        <div className="md:col-span-2 mt-4">
                            <button
                                id="register-submit-btn"
                                type="submit"
                                disabled={isLoading}
                                className="group relative w-full h-16 rounded-2xl overflow-hidden shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                <div className="absolute inset-0 bg-foreground group-hover:bg-primary transition-colors duration-500" />
                                <span className="relative z-10 text-background group-hover:text-foreground text-sm font-black uppercase tracking-[0.4em] transition-colors flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Creating Account...
                                        </>
                                    ) : 'Create Account'}
                                </span>
                            </button>
                        </div>
                    </form>

                    <p className="text-center mt-10 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-black hover:text-foreground transition-colors">
                            Login Now
                        </Link>
                    </p>
                </div>
            </div>
        </PageTransition>
    );
}

export default Register;
