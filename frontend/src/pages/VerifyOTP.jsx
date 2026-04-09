import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, useLocation } from 'react-router-dom';
import { verifyOTP, resendOTP, reset, clearOtpState } from '../store/authSlice';
import { useToast } from '../context/ToastContext';
import { PageTransition } from '../components/PageTransition';

// ─── Individual OTP digit input cell ──────────────────────────────────────────
const OTPDigitInput = ({ index, value, onChange, onKeyDown, onPaste, inputRef }) => (
    <input
        ref={inputRef}
        id={`otp-digit-${index}`}
        type="text"
        inputMode="numeric"
        maxLength={1}
        value={value}
        onChange={(e) => onChange(index, e.target.value)}
        onKeyDown={(e) => onKeyDown(index, e)}
        onPaste={index === 0 ? onPaste : undefined}
        onFocus={(e) => e.target.select()}
        className="w-12 h-14 sm:w-14 sm:h-16 text-center text-xl font-black bg-card border-2 border-border rounded-2xl text-foreground focus:outline-none focus:border-primary focus:bg-primary/5 transition-all duration-200 caret-transparent"
        aria-label={`OTP digit ${index + 1}`}
        autoComplete="one-time-code"
    />
);

// ─── Masked email helper ────────────────────────────────────────────────────────
const maskEmail = (email) => {
    if (!email) return '';
    const [local, domain] = email.split('@');
    if (!domain) return email;
    const visible = local.slice(0, 2);
    return `${visible}${'*'.repeat(Math.max(local.length - 2, 4))}@${domain}`;
};

// ══════════════════════════════════════════════════════════════════════════════
// VERIFY OTP PAGE
// ══════════════════════════════════════════════════════════════════════════════
function VerifyOTP() {
    const OTP_LENGTH = 6;
    const RESEND_COOLDOWN = 60; // seconds

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();

    const { isLoading, isError, isSuccess, message, tempEmail, actualEmail } = useSelector((state) => state.auth);

    // ── Get email from state or from navigation state ─────────────────────────
    // Navigation state is set when Register/Login redirects here
    const emailFromNav = location.state?.email || null;
    const maskedEmailFromNav = location.state?.maskedEmail || null;

    // Prefer real email from Redux state (for resend API), fallback to nav state
    const realEmail = actualEmail || emailFromNav || null;
    const displayMasked = tempEmail || maskedEmailFromNav || (realEmail ? maskEmail(realEmail) : null);

    // ── OTP digits state ──────────────────────────────────────────────────────
    const [digits, setDigits] = useState(Array(OTP_LENGTH).fill(''));
    const inputRefs = useRef([]);
    const [localError, setLocalError] = useState('');
    const [localSuccess, setLocalSuccess] = useState('');

    // ── Resend cooldown timer ─────────────────────────────────────────────────
    const [countdown, setCountdown] = useState(0);
    const [isResending, setIsResending] = useState(false);
    const timerRef = useRef(null);

    // ── Redirect if no email context ──────────────────────────────────────────
    useEffect(() => {
        if (!realEmail && !emailFromNav) {
            navigate('/register', { replace: true });
        }
    }, [realEmail, emailFromNav, navigate]);

    // ── Handle Redux success (OTP verified) ───────────────────────────────────
    useEffect(() => {
        if (isSuccess) {
            dispatch(reset());
            dispatch(clearOtpState());
            navigate('/login?verified=true', { replace: true });
        }
    }, [isSuccess, dispatch, navigate]);

    // ── Show Redux errors as local error ──────────────────────────────────────
    useEffect(() => {
        if (isError && message) {
            setLocalError(message);
            dispatch(reset());
        }
    }, [isError, message, dispatch]);

    // ── Countdown timer logic ─────────────────────────────────────────────────
    const startCountdown = useCallback(() => {
        setCountdown(RESEND_COOLDOWN);
        clearInterval(timerRef.current);
        timerRef.current = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timerRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    }, []);

    useEffect(() => () => clearInterval(timerRef.current), []);

    // ── OTP input handlers ────────────────────────────────────────────────────
    const handleDigitChange = (index, val) => {
        const cleaned = val.replace(/\D/g, '');
        if (!cleaned && val !== '') return; // reject non-digit

        const newDigits = [...digits];
        newDigits[index] = cleaned.slice(-1); // only last char
        setDigits(newDigits);
        setLocalError('');

        if (cleaned && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (digits[index]) {
                const newDigits = [...digits];
                newDigits[index] = '';
                setDigits(newDigits);
            } else if (index > 0) {
                inputRefs.current[index - 1]?.focus();
                const newDigits = [...digits];
                newDigits[index - 1] = '';
                setDigits(newDigits);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
        if (!pasted) return;
        const newDigits = Array(OTP_LENGTH).fill('');
        pasted.split('').forEach((ch, i) => { newDigits[i] = ch; });
        setDigits(newDigits);
        const lastFilled = Math.min(pasted.length, OTP_LENGTH - 1);
        inputRefs.current[lastFilled]?.focus();
        setLocalError('');
    };

    // ── Submit OTP ────────────────────────────────────────────────────────────
    const handleSubmit = (e) => {
        e.preventDefault();
        setLocalError('');
        setLocalSuccess('');

        const otp = digits.join('');
        if (otp.length < OTP_LENGTH) {
            setLocalError('Please enter the complete 6-digit OTP.');
            return;
        }
        if (!realEmail) {
            setLocalError('Email context lost. Please register again.');
            return;
        }

        dispatch(verifyOTP({ email: realEmail, otp }));
    };

    // ── Resend OTP ────────────────────────────────────────────────────────────
    const handleResend = async () => {
        if (countdown > 0 || isResending || !realEmail) return;

        setIsResending(true);
        setLocalError('');
        setLocalSuccess('');
        setDigits(Array(OTP_LENGTH).fill(''));
        inputRefs.current[0]?.focus();

        try {
            const result = await dispatch(resendOTP({ email: realEmail })).unwrap();
            setLocalSuccess(result.message || 'A new OTP has been sent to your email.');
            toast.success('New OTP sent successfully!');
            startCountdown();
        } catch (err) {
            setLocalError(typeof err === 'string' ? err : 'Failed to resend OTP. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    const otp = digits.join('');
    const isComplete = otp.length === OTP_LENGTH;

    return (
        <PageTransition>
            <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-24 px-4 bg-background">
                {/* Background glow effects */}
                <div className="absolute inset-0 bg-grid-pattern opacity-10 pointer-events-none" />
                <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[600px] bg-primary/10 rounded-full blur-[150px] pointer-events-none" />
                <div className="absolute bottom-0 left-0 h-[400px] w-[400px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

                <div className="w-full max-w-md relative z-10">
                    <div className="bg-background/40 backdrop-blur-3xl p-10 sm:p-12 rounded-[2.5rem] border border-border shadow-2xl overflow-hidden">
                        {/* Scanning line decoration */}
                        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent animate-scanline pointer-events-none" />

                        {/* Header */}
                        <div className="text-center mb-10">
                            <div className="h-20 w-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-primary/20 relative">
                                <span className="text-4xl">✉️</span>
                                <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full animate-ping opacity-75" />
                                <div className="absolute -top-1 -right-1 h-4 w-4 bg-primary rounded-full" />
                            </div>
                            <h1 className="text-3xl font-display font-black text-foreground mb-3 uppercase tracking-tighter">
                                Verify Email
                            </h1>
                            {displayMasked && (
                                <p className="text-foreground/50 text-sm font-medium">
                                    OTP sent to{' '}
                                    <span className="text-primary font-bold font-mono">{displayMasked}</span>
                                </p>
                            )}
                            <p className="text-foreground/30 text-xs mt-2 font-medium">
                                Enter the 6-digit code from your email. Valid for 10 minutes.
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            {/* ── OTP Digit Boxes ── */}
                            <div>
                                <label className="block text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] text-center mb-4">
                                    Verification Code
                                </label>
                                <div className="flex justify-center gap-2 sm:gap-3">
                                    {digits.map((digit, i) => (
                                        <OTPDigitInput
                                            key={i}
                                            index={i}
                                            value={digit}
                                            onChange={handleDigitChange}
                                            onKeyDown={handleKeyDown}
                                            onPaste={handlePaste}
                                            inputRef={(el) => (inputRefs.current[i] = el)}
                                        />
                                    ))}
                                </div>
                            </div>

                            {/* ── Error / Success Messages ── */}
                            {localError && (
                                <div
                                    id="otp-error-message"
                                    className="bg-red-500/10 border border-red-500/20 text-red-400 px-5 py-4 rounded-2xl text-xs font-bold text-center animate-shake"
                                    role="alert"
                                >
                                    {localError}
                                </div>
                            )}
                            {localSuccess && !localError && (
                                <div
                                    id="otp-success-message"
                                    className="bg-green-500/10 border border-green-500/30 text-green-400 px-5 py-4 rounded-2xl text-xs font-bold text-center"
                                    role="status"
                                >
                                    {localSuccess}
                                </div>
                            )}

                            {/* ── Verify Button ── */}
                            <button
                                id="verify-otp-btn"
                                type="submit"
                                disabled={isLoading || !isComplete}
                                className="group relative w-full h-14 rounded-2xl overflow-hidden shadow-2xl disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-300"
                            >
                                <div className={`absolute inset-0 transition-colors duration-500 ${isComplete ? 'bg-primary group-hover:bg-primary/80' : 'bg-border'}`} />
                                <span className="relative z-10 text-foreground text-[11px] font-black uppercase tracking-[0.4em] transition-colors flex items-center justify-center gap-2">
                                    {isLoading ? (
                                        <>
                                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                            </svg>
                                            Verifying...
                                        </>
                                    ) : 'Verify Email'}
                                </span>
                            </button>

                            {/* ── Resend OTP ── */}
                            <div className="text-center">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/20 mb-3">
                                    Didn&apos;t receive the code?
                                </p>
                                <button
                                    id="resend-otp-btn"
                                    type="button"
                                    onClick={handleResend}
                                    disabled={countdown > 0 || isResending || !realEmail}
                                    className="text-sm font-bold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                                >
                                    {isResending ? (
                                        <span className="text-foreground/40">Sending...</span>
                                    ) : countdown > 0 ? (
                                        <span className="text-foreground/30 font-mono">
                                            Resend in <span className="text-primary font-black">{countdown}s</span>
                                        </span>
                                    ) : (
                                        <span className="text-primary hover:text-foreground transition-colors">
                                            Resend OTP
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>

                        {/* ── Footer hint ── */}
                        <p className="text-center mt-8 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/15">
                            Wrong email?{' '}
                            <button
                                type="button"
                                onClick={() => { dispatch(clearOtpState()); navigate('/register'); }}
                                className="text-primary hover:text-foreground transition-colors"
                            >
                                Register Again
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

export default VerifyOTP;
