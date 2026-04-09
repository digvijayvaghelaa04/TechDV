import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { FaUserPlus, FaMoneyBillWave, FaChalkboardTeacher, FaChartLine } from 'react-icons/fa';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

const Dashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
            navigate('/');
            return;
        }

        const fetchAnalytics = async () => {
            try {
                const { data } = await api.get('/analytics/admin');
                setAnalytics(data.data);
            } catch (error) {
                console.error("Error fetching analytics", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [user, navigate]);

    if (loading) return <Loader />;

    // Prepare Chart Data
    const chartData = {
        labels: analytics?.revenue.chart.map(d => `${d._id.month}/${d._id.year}`) || [],
        datasets: [
            {
                label: 'Monthly Revenue',
                data: analytics?.revenue.chart.map(d => d.amount) || [],
                borderColor: '#8b5cf6', // Violet
                backgroundColor: 'rgba(139, 92, 246, 0.5)',
                tension: 0.4,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: { color: 'white' }
            },
            title: {
                display: true,
                text: 'Revenue Growth',
                color: 'white'
            },
        },
        scales: {
            y: {
                grid: { color: '#333' },
                ticks: { color: '#9ca3af' }
            },
            x: {
                grid: { color: '#333' },
                ticks: { color: '#9ca3af' }
            }
        }
    };

    return (
        <div className="min-h-screen pt-32 pb-20 px-4 md:px-10 bg-background relative">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px]" />
            </div>
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-4xl font-display font-bold text-foreground mb-2">Admin <span className="text-gradient">Dashboard</span></h1>
                        <p className="text-muted-foreground">Overview of platform performance.</p>
                    </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-card/40 backdrop-blur-xl p-6 rounded-[2rem] border border-border hover:border-primary/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-foreground/60 text-xs font-black uppercase tracking-widest">Total Revenue</h3>
                            <div className="p-3 bg-emerald-500/10 rounded-xl">
                                <FaMoneyBillWave className="text-emerald-500 text-xl" />
                            </div>
                        </div>
                        <p className="text-3xl font-display font-black text-foreground italic">₹{analytics?.revenue.total.toLocaleString()}</p>
                    </div>

                    <div className="bg-card/40 backdrop-blur-xl p-6 rounded-[2rem] border border-border hover:border-blue-500/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-foreground/60 text-xs font-black uppercase tracking-widest">Total Students</h3>
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <FaUserPlus className="text-blue-500 text-xl" />
                            </div>
                        </div>
                        <p className="text-3xl font-display font-black text-foreground italic">{analytics?.users.total.toLocaleString()}</p>
                    </div>

                    <div className="bg-card/40 backdrop-blur-xl p-6 rounded-[2rem] border border-border hover:border-purple-500/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-foreground/60 text-xs font-black uppercase tracking-widest">Instructors</h3>
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                                <FaChalkboardTeacher className="text-purple-500 text-xl" />
                            </div>
                        </div>
                        <p className="text-3xl font-display font-black text-foreground italic">{analytics?.users.instructors.toLocaleString()}</p>
                    </div>

                    <div className="bg-card/40 backdrop-blur-xl p-6 rounded-[2rem] border border-border hover:border-amber-500/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-foreground/60 text-xs font-black uppercase tracking-widest">Top Course</h3>
                            <div className="p-3 bg-amber-500/10 rounded-xl">
                                <FaChartLine className="text-amber-500 text-xl" />
                            </div>
                        </div>
                        <p className="text-xl font-bold text-foreground truncate">{analytics?.topCourses[0]?.title || 'N/A'}</p>
                        <p className="text-xs text-foreground/40 mt-2 font-mono">{analytics?.topCourses[0]?.totalEnrollments || 0} students</p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Chart Section */}
                    <div className="lg:col-span-2 bg-card/40 backdrop-blur-xl p-8 rounded-[2rem] border border-border">
                        <Line options={chartOptions} data={chartData} />
                    </div>

                    {/* Top Performing Courses */}
                    <div className="bg-card/40 backdrop-blur-xl p-8 rounded-[2rem] border border-border flex flex-col">
                        <h2 className="text-2xl font-display font-black text-foreground mb-8 italic">Top Performing Courses</h2>
                        <div className="space-y-6 flex-1">
                            {analytics?.topCourses.map((course, index) => (
                                <div key={course._id} className="flex items-start justify-between p-4 rounded-2xl bg-muted/30 border border-border hover:border-primary/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center font-black text-primary">
                                            {index + 1}
                                        </div>
                                        <div>
                                            <p className="text-foreground font-bold text-sm line-clamp-1">{course.title}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mt-1">{course.totalEnrollments} enrollments</p>
                                        </div>
                                    </div>
                                    <div className="text-right pl-4">
                                        <p className="text-emerald-500 font-black flex items-center gap-1"><span className="text-[10px]">★</span> {course.averageRating.toFixed(1)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-8 pt-6 border-t border-border flex justify-center">
                            <Link to="/admin/courses" className="text-primary hover:text-primary/80 text-[10px] font-black uppercase tracking-[0.3em] transition-colors">
                                View All Courses &rarr;
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Management Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                    <Link to="/admin/users" className="p-6 bg-card/40 backdrop-blur-md hover:bg-card border border-border rounded-2xl transition-all hover:scale-105 hover:border-primary/50 text-center group shadow-lg hover:shadow-primary/20">
                        <span className="text-3xl mb-3 block group-hover:-translate-y-1 transition-transform">👥</span>
                        <span className="text-foreground font-black text-[10px] uppercase tracking-widest">Users</span>
                    </Link>
                    <Link to="/admin/instructors" className="p-6 bg-card/40 backdrop-blur-md hover:bg-card border border-border rounded-2xl transition-all hover:scale-105 hover:border-primary/50 text-center group shadow-lg hover:shadow-primary/20">
                        <span className="text-3xl mb-3 block group-hover:-translate-y-1 transition-transform">👨‍🏫</span>
                        <span className="text-foreground font-black text-[10px] uppercase tracking-widest">Mentors</span>
                    </Link>
                    <Link to="/admin/courses" className="p-6 bg-card/40 backdrop-blur-md hover:bg-card border border-border rounded-2xl transition-all hover:scale-105 hover:border-primary/50 text-center group shadow-lg hover:shadow-primary/20">
                        <span className="text-3xl mb-3 block group-hover:-translate-y-1 transition-transform">📚</span>
                        <span className="text-foreground font-black text-[10px] uppercase tracking-widest">Courses</span>
                    </Link>
                    <Link to="/admin/orders" className="p-6 bg-card/40 backdrop-blur-md hover:bg-card border border-border rounded-2xl transition-all hover:scale-105 hover:border-primary/50 text-center group shadow-lg hover:shadow-primary/20">
                        <span className="text-3xl mb-3 block group-hover:-translate-y-1 transition-transform">💰</span>
                        <span className="text-foreground font-black text-[10px] uppercase tracking-widest">Revenue</span>
                    </Link>
                    <Link to="/admin/instructor-applications" className="p-6 bg-card/40 backdrop-blur-md hover:bg-card border border-border rounded-2xl transition-all hover:scale-105 hover:border-primary/50 text-center group shadow-lg hover:shadow-primary/20">
                        <span className="text-3xl mb-3 block group-hover:-translate-y-1 transition-transform">📝</span>
                        <span className="text-foreground font-black text-[10px] uppercase tracking-widest">Requests</span>
                    </Link>
                    <Link to="/instructor/dashboard" className="p-6 bg-card/40 backdrop-blur-md hover:bg-card border border-border rounded-2xl transition-all hover:scale-105 hover:border-primary/50 text-center group shadow-lg hover:shadow-primary/20">
                        <span className="text-3xl mb-3 block group-hover:-translate-y-1 transition-transform">🎓</span>
                        <span className="text-foreground font-black text-[10px] uppercase tracking-widest">Teaching</span>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
