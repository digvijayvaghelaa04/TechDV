import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { QRCodeSVG } from 'qrcode.react';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { Loader2 } from 'lucide-react';

export default function PaymentPage() {
    const { courseId } = useParams();
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);
    const { success, error } = useToast();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [transactionId, setTransactionId] = useState('');
    const [screenshot, setScreenshot] = useState(''); // Just a text field for now or file upload if we implement it

    const UPI_ID = 'DV7353@OKSBI';

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const { data } = await api.get(`/courses/${courseId}`);
                if (data.success) {
                    setCourse(data.data);
                }
            } catch (err) {
                error('Failed to load course details');
                navigate('/courses');
            } finally {
                setLoading(false);
            }
        };

        if (courseId) {
            fetchCourse();
        }
    }, [courseId, navigate, error]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!transactionId) {
            error('Please enter Transaction ID');
            return;
        }

        setSubmitting(true);
        try {
            const { data } = await api.post('/payment/create', {
                courseId,
                amount: course.price,
                transactionId,
                screenshot,
                upiId: UPI_ID
            });

            if (data.success) {
                success('Payment submitted successfully! Waiting for approval.');
                navigate('/payment/history'); // Redirect to history
            }
        } catch (err) {
            error(err.response?.data?.error || 'Payment submission failed');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background text-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!course) return null;

    const upiLink = `upi://pay?pa=${UPI_ID}&pn=TechDV&am=${course.price}&tn=Course-${course.title}`;

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 bg-background text-foreground font-sans">
            <div className="max-w-md mx-auto bg-muted border border-border rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-black uppercase tracking-tighter mb-2">Complete Payment</h1>
                    <p className="text-foreground/60 text-sm">Secure UPI Transaction</p>
                </div>

                <div className="bg-card p-6 rounded-2xl border border-border mb-8 flex flex-col items-center">
                    <div className="bg-white p-4 rounded-xl mb-4">
                        <QRCodeSVG value={upiLink} size={180} />
                    </div>
                    <p className="font-mono text-primary font-bold text-lg mb-1">{UPI_ID}</p>
                    <p className="text-foreground/40 text-xs uppercase tracking-widest">Scan or Copy UPI ID</p>
                </div>

                <div className="mb-8 p-4 bg-secondary/10 border border-secondary/20 rounded-xl">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-foreground/60 text-xs uppercase tracking-wider">Course</span>
                        <span className="font-bold text-sm text-right">{course.title}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-foreground/60 text-xs uppercase tracking-wider">Amount</span>
                        <span className="font-black text-xl text-secondary">₹{course.price}</span>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60 mb-2">
                            Transaction ID (UTR)
                        </label>
                        <input
                            type="text"
                            value={transactionId}
                            onChange={(e) => setTransactionId(e.target.value)}
                            placeholder="Enter 12-digit UTR ID"
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder-white/20 focus:outline-none focus:border-primary transition-colors font-mono"
                            required
                        />
                    </div>

                    {/* Optional Screenshot URL input for now */}
                    {/* <div>
                        <label className="block text-xs font-bold uppercase tracking-widest text-foreground/60 mb-2">
                            Screenshot URL (Optional)
                        </label>
                        <input
                            type="text"
                            value={screenshot}
                            onChange={(e) => setScreenshot(e.target.value)}
                            placeholder="Paste image link"
                            className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder-white/20 focus:outline-none focus:border-primary transition-colors"
                        />
                    </div> */}

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-4 rounded-xl bg-primary text-foreground font-black uppercase tracking-[0.2em] shadow-[0_0_20px_rgba(var(--primary),0.4)] hover:shadow-[0_0_40px_rgba(var(--primary),0.6)] disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                        {submitting ? 'Verifying...' : 'Confirm Payment'}
                    </button>
                </form>

                <p className="text-center text-[10px] text-foreground/30 uppercase tracking-widest mt-6">
                    Payments are verified manually. Access granted upon approval.
                </p>
            </div>
        </div>
    );
}
