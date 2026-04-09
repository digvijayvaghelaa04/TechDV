import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { Filter, DollarSign, Clock, ArrowRight } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function PaymentHistory() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchPayments = async () => {
            try {
                const { data } = await api.get('/payment/my-payments');
                if (data.success) {
                    setPayments(data.data);
                }
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchPayments();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background text-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-24 px-4 md:px-12 bg-background text-foreground font-sans pb-12">
            <div className="max-w-6xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-black uppercase tracking-tighter mb-2 text-foreground">Payment History</h1>
                        <p className="text-foreground/40 text-xs uppercase tracking-widest pl-1">Your investment in knowledge</p>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border text-xs font-bold uppercase tracking-widest text-foreground/60">
                        <Filter className="h-3 w-3" />
                        <span>Filter</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {payments.length === 0 ? (
                        <div className="col-span-full text-center py-20 bg-card rounded-3xl border border-border border-dashed">
                            <DollarSign className="h-12 w-12 text-foreground/20 mx-auto mb-4" />
                            <p className="text-foreground/60 font-bold uppercase tracking-widest">No payment records found.</p>
                            <button
                                onClick={() => navigate('/courses')}
                                className="mt-6 px-6 py-3 bg-primary rounded-xl text-foreground font-black uppercase tracking-[0.2em] hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] transition-all"
                            >
                                Browse Courses
                            </button>
                        </div>
                    ) : (
                        payments.map((payment) => (
                            <div key={payment._id} className="group relative bg-muted border border-border rounded-3xl overflow-hidden hover:border-border transition-all hover:-translate-y-1 hover:shadow-2xl h-full flex flex-col justify-between">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 rounded-full blur-[50px] pointer-events-none" />

                                <div className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border ${payment.paymentStatus === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' :
                                                payment.paymentStatus === 'pending' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-500' :
                                                    'bg-primary/10 border-primary/20 text-primary'
                                            }`}>
                                            {payment.paymentStatus}
                                        </div>
                                        <span className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest font-mono">
                                            {payment.transactionId}
                                        </span>
                                    </div>

                                    <h3 className="text-xl font-bold font-display text-foreground mb-1 group-hover:text-primary transition-colors line-clamp-2">
                                        {payment.courseName}
                                    </h3>

                                    <div className="flex items-center gap-2 text-foreground/40 text-[10px] font-bold uppercase tracking-widest mb-6">
                                        <Clock className="h-3 w-3" />
                                        <span>{new Date(payment.createdAt).toLocaleDateString()}</span>
                                    </div>

                                    <div className="pt-6 border-t border-border flex items-end justify-between">
                                        <div>
                                            <p className="text-[10px] font-bold text-foreground/30 uppercase tracking-widest mb-1">Amount Paid</p>
                                            <p className="text-2xl font-black text-foreground font-mono">₹{payment.amount}</p>
                                        </div>
                                        {payment.paymentStatus === 'success' && (
                                            <button
                                                onClick={() => navigate(`/course/${payment.course}/learn`)}
                                                className="p-3 bg-card rounded-xl hover:bg-muted text-foreground transition-colors group/btn"
                                            >
                                                <ArrowRight className="h-5 w-5 group-hover/btn:translate-x-1 transition-transform" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
