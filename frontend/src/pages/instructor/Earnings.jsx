import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { useToast } from '../../context/ToastContext';
import { DollarSign, TrendingUp, Calendar, CreditCard } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

export default function Earnings() {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const { error } = useToast();

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await api.get('/instructors/dashboard');
                if (data.success) {
                    setStats(data.data);
                }
            } catch (err) {
                error('Failed to load earnings data');
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-background text-foreground relative">
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] animate-pulse" />
                </div>
                <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
            </div>
        );
    }

    if (!stats) return null;

    // Chart Data Preparation
    const earningsByDate = stats.recentEarnings?.reduce((acc, curr) => {
        const date = new Date(curr.createdAt).toLocaleDateString();
        acc[date] = (acc[date] || 0) + curr.amount;
        return acc;
    }, {});

    const chartData = {
        labels: Object.keys(earningsByDate || {}).reverse(),
        datasets: [
            {
                label: 'Daily Yield (₹)',
                data: Object.values(earningsByDate || {}).reverse(),
                borderColor: 'hsl(var(--primary))',
                backgroundColor: 'hsla(var(--primary), 0.2)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'hsl(var(--primary))',
                pointBorderColor: 'transparent',
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: 'white' }
            },
            title: {
                display: false,
            },
        },
        scales: {
            y: {
                ticks: { color: 'rgba(255,255,255,0.6)' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            },
            x: {
                ticks: { color: 'rgba(255,255,255,0.6)' },
                grid: { color: 'rgba(255,255,255,0.1)' }
            }
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-10 bg-background relative font-sans">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[140px]" />
            </div>

            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-12">
                    <h1 className="text-4xl font-display font-black text-foreground uppercase italic tracking-tighter mb-2">Revenue <span className="text-emerald-500">Analytics</span></h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Financial Performance Metrics</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-card/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/50 relative overflow-hidden group shadow-lg">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">Lifetime Yield</p>
                                <div className="p-3 bg-emerald-500/10 rounded-xl">
                                    <DollarSign className="h-5 w-5 text-emerald-500" />
                                </div>
                            </div>
                            <h2 className="text-4xl font-display font-black text-foreground italic">₹{stats.profile.lifetimeEarnings.toLocaleString()}</h2>
                        </div>
                    </div>

                    <div className="bg-card/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/50 relative overflow-hidden group shadow-lg">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] group-hover:bg-primary/20 transition-all pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">Liquid Assets</p>
                                <div className="p-3 bg-primary/10 rounded-xl">
                                    <CreditCard className="h-5 w-5 text-primary" />
                                </div>
                            </div>
                            <h2 className="text-4xl font-display font-black text-foreground italic">₹{stats.profile.balance.toLocaleString()}</h2>
                        </div>
                    </div>

                    <div className="bg-card/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/50 relative overflow-hidden group shadow-lg">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/10 rounded-full blur-[40px] group-hover:bg-secondary/20 transition-all pointer-events-none" />
                        <div className="relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/50">Total Enrollees</p>
                                <div className="p-3 bg-secondary/10 rounded-xl">
                                    <TrendingUp className="h-5 w-5 text-secondary" />
                                </div>
                            </div>
                            <h2 className="text-4xl font-display font-black text-foreground italic">{stats.metrics.totalStudents}</h2>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
                    <div className="lg:col-span-3 bg-card/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/50 shadow-lg">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-8 border-b border-border/50 pb-4">Yield Trajectory</h3>
                        <div className="h-[300px] w-full flex items-center justify-center">
                            <Line options={{ ...chartOptions, maintainAspectRatio: false }} data={chartData} />
                        </div>
                    </div>

                    <div className="lg:col-span-2 bg-card/40 backdrop-blur-xl p-8 rounded-[2.5rem] border border-border/50 shadow-lg flex flex-col">
                        <h3 className="text-sm font-black text-foreground uppercase tracking-widest mb-8 border-b border-border/50 pb-4">Recent Exchange Events</h3>
                        <div className="space-y-4 overflow-y-auto pr-2 flex-grow max-h-[300px] custom-scrollbar">
                            {stats.recentEarnings?.map((item) => (
                                <div key={item._id} className="flex justify-between items-center p-4 bg-background/50 border border-border/50 rounded-2xl hover:border-emerald-500/30 transition-colors group">
                                    <div>
                                        <p className="font-bold text-sm text-foreground/80 group-hover:text-foreground transition-colors mb-1">{item.description || 'Target Asset Acquisition'}</p>
                                        <div className="flex items-center gap-2 text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                                            <Calendar className="h-3 w-3" />
                                            <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                    <span className="font-black text-emerald-500 font-mono text-sm group-hover:scale-110 transition-transform">+₹{item.amount}</span>
                                </div>
                            ))}
                        </div>
                        {stats.recentEarnings?.length === 0 && (
                            <div className="flex-grow flex items-center justify-center">
                                <p className="text-foreground/30 text-[10px] font-black uppercase tracking-widest text-center border border-dashed border-border/50 rounded-2xl w-full py-10 italic bg-background/20">No data generated in current cycle.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
