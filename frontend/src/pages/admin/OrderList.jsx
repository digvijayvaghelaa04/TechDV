import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../components/Loader';

function OrderList() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || user.role !== 'super_admin') {
            navigate('/admin/dashboard');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await api.get('/orders');
                setOrders(response.data.data);
            } catch (error) {
                console.error(error);
            }
            setLoading(false);
        };

        fetchOrders();
    }, [user, navigate]);

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 md:px-10 relative">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px]" />
            </div>
            <div className="max-w-7xl mx-auto relative z-10">
                <div>
                    <Link to="/admin/dashboard" className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground mb-4 block transition-colors">← Dashboard Protocol</Link>
                    <h1 className="text-4xl font-display font-black text-foreground uppercase italic tracking-tighter mb-12">Transaction History</h1>
                </div>

                <div className="bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border p-8 overflow-hidden shadow-2xl">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left font-sans text-sm">
                            <thead>
                                <tr className="bg-card border-b border-border">
                                    <th className="px-6 py-5 font-bold text-muted-foreground uppercase tracking-wider">Order ID</th>
                                    <th className="px-6 py-5 font-bold text-muted-foreground uppercase tracking-wider">User</th>
                                    <th className="px-6 py-5 font-bold text-muted-foreground uppercase tracking-wider">Course</th>
                                    <th className="px-6 py-5 font-bold text-muted-foreground uppercase tracking-wider">Amount</th>
                                    <th className="px-6 py-5 font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-5 font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-6 py-6 font-mono text-[10px] font-black tracking-[0.3em] text-foreground/40">#{order._id.slice(-6).toUpperCase()}</td>
                                        <td className="px-6 py-6 font-bold text-foreground">{order.user?.firstName || 'Unknown'}</td>
                                        <td className="px-6 py-6 font-medium text-foreground/70">{order.orderItems?.map(item => item.title || item.course?.title).join(', ') || 'Unknown Course'}</td>
                                        <td className="px-6 py-6 font-display font-black text-foreground italic text-lg">₹{order.totalPrice}</td>
                                        <td className="px-6 py-6">
                                            <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${order.orderStatus === 'Paid' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border-rose-500/20'}`}>
                                                {order.orderStatus}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6 font-medium text-foreground/60 text-xs">{new Date(order.createdAt).toLocaleDateString()}</td>
                                    </tr>
                                ))}
                                {orders.length === 0 && (
                                    <tr>
                                        <td colSpan="6" className="p-16 text-center text-foreground/40 font-medium italic border border-dashed border-border rounded-2xl m-4">No transactions recorded.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default OrderList;
