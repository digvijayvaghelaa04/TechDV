import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { Check, X, Loader2, Search, Filter } from 'lucide-react';

export default function AdminPayments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const { success, error } = useToast();

    useEffect(() => {
        fetchPayments();
    }, []);

    const fetchPayments = async () => {
        try {
            const { data } = await api.get('/payment/admin/all');
            if (data.success) {
                setPayments(data.data);
            }
        } catch (err) {
            error('Failed to load payments');
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (id) => {
        try {
            const { data } = await api.put(`/payment/admin/${id}/approve`);
            if (data.success) {
                success('Payment Approved & User Enrolled!');
                setPayments(payments.map(p => p._id === id ? { ...p, paymentStatus: 'success' } : p));
            }
        } catch (err) {
            error(err.response?.data?.error || 'Approval failed');
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Are you sure you want to reject this payment?')) return;
        try {
            const { data } = await api.put(`/payment/admin/${id}/reject`);
            if (data.success) {
                success('Payment Rejected');
                setPayments(payments.map(p => p._id === id ? { ...p, paymentStatus: 'rejected' } : p));
            }
        } catch (err) {
            error(err.response?.data?.error || 'Rejection failed');
        }
    };

    const filteredPayments = payments.filter(p =>
        p.transactionId.toLowerCase().includes(search.toLowerCase()) ||
        p.courseName.toLowerCase().includes(search.toLowerCase()) ||
        (p.user?.email || '').toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background text-foreground">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="bg-background min-h-screen text-foreground pt-32 pb-20 px-4 md:px-10 font-sans relative">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px]" />
            </div>
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
                    <div>
                        <h1 className="text-4xl font-display font-black text-foreground uppercase italic tracking-tighter mb-2">Transaction <span className="text-primary">Control</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Revenue & Authorization Auditing</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 mb-8 bg-card/40 backdrop-blur-xl p-4 rounded-2xl border border-border shadow-lg">
                    <Search className="h-5 w-5 text-primary" />
                    <input
                        type="text"
                        placeholder="Search sequence by Matrix ID, Profile Data, or Nomenclature..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="bg-transparent border-none outline-none text-foreground placeholder:text-foreground/30 w-full font-mono text-sm font-bold"
                    />
                </div>

                <div className="bg-card/40 backdrop-blur-xl border border-border rounded-[2.5rem] overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-card border-b border-border/50">
                                <tr>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Timestamp</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Profile Vector</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Target Asset</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Matrix ID</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Value</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Node Status</th>
                                    <th className="px-6 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60 text-right">Commands</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border/50">
                                {filteredPayments.map((payment) => (
                                    <tr key={payment._id} className="hover:bg-muted/30 transition-colors group">
                                        <td className="px-6 py-6 font-mono text-xs font-bold text-foreground/80 tracking-widest">
                                            {new Date(payment.createdAt).toLocaleDateString()}
                                            <br />
                                            <span className="text-[10px] text-foreground/40 font-black">{new Date(payment.createdAt).toLocaleTimeString()}</span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-foreground text-sm group-hover:text-primary transition-colors">{payment.user?.firstName} {payment.user?.lastName}</span>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">{payment.user?.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="font-black text-primary text-[10px] uppercase tracking-[0.2em] bg-primary/10 px-3 py-1.5 rounded-lg border border-primary/20">
                                                {payment.courseName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 font-mono text-xs font-black text-foreground/60 tracking-wider select-all group-hover:text-foreground transition-colors">
                                            {payment.transactionId}
                                        </td>
                                        <td className="px-6 py-6 font-black text-foreground text-lg">
                                            ₹{payment.amount}
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className={`inline-flex px-3 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border ${payment.paymentStatus === 'success' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]' :
                                                payment.paymentStatus === 'pending' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)] animate-pulse' :
                                                    'bg-destructive/10 text-destructive border-destructive/20 shadow-[0_0_10px_rgba(239,68,68,0.1)]'
                                                }`}>
                                                {payment.paymentStatus === 'success' ? 'Verified' : payment.paymentStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 text-right">
                                            {payment.paymentStatus === 'pending' && (
                                                <div className="flex items-center justify-end gap-3">
                                                    <button
                                                        onClick={() => handleApprove(payment._id)}
                                                        className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 hover:bg-emerald-500 hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                                                        title="Authorize Transfer"
                                                    >
                                                        <Check className="h-3 w-3 inline mr-1" /> Auth
                                                    </button>
                                                    <button
                                                        onClick={() => handleReject(payment._id)}
                                                        className="px-4 py-2 bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-sm"
                                                        title="Reject Transfer"
                                                    >
                                                        <X className="h-3 w-3 inline mr-1" /> Deny
                                                    </button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {filteredPayments.length === 0 && (
                        <div className="p-20 text-center text-foreground/40 font-medium italic border-t border-dashed border-border/50">
                            No related transfer events located via scan criteria.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
