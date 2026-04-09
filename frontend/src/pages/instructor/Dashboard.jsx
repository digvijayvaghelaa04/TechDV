import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import { FaUserGraduate, FaMoneyBillWave, FaChartLine, FaCheckCircle, FaTimesCircle, FaClock } from 'react-icons/fa';

const InstructorDashboard = () => {
    const { user } = useSelector((state) => state.auth);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [applicationStatus, setApplicationStatus] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                // First check if user is instructor
                if (user.role === 'user') {
                    // Check application status
                    try {
                        const { data } = await api.get('/instructors/me');
                        setApplicationStatus(data.data.status);
                    } catch (err) {
                        // No profile implies no application
                        setApplicationStatus('none');
                    }
                    setLoading(false);
                    return;
                }

                // If instructor, get stats
                const { data } = await api.get('/instructors/dashboard');
                setStats(data.data);
                setApplicationStatus('approved');
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, [user]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen bg-background relative z-50">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    // CASE 1: NOT AN INSTRUCTOR (SHOW APPLICATION CTA)
    if (user.role !== 'instructor' && user.role !== 'admin' && user.role !== 'super_admin') {
        return (
            <div className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
                    <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px]" />
                </div>
                <div className="max-w-4xl mx-auto bg-card/40 backdrop-blur-xl rounded-[3rem] border border-border p-12 text-center relative z-10 shadow-2xl">
                    <h1 className="text-4xl font-display font-black text-foreground mb-4 italic uppercase tracking-tighter">Become a Mentor</h1>
                    <p className="text-foreground/60 mb-8 max-w-2xl mx-auto font-medium">
                        Share your knowledge with millions of students. Apply today to start creating courses and earning revenue.
                    </p>

                    {applicationStatus === 'pending' ? (
                        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8 inline-block">
                            <FaClock className="text-4xl text-yellow-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-yellow-500 mb-2">Application Pending</h3>
                            <p className="text-foreground/60 text-sm">Our team is reviewing your application. Please check back later.</p>
                        </div>
                    ) : applicationStatus === 'rejected' ? (
                        <div className="bg-destructive/10 border border-destructive/20 rounded-2xl p-8 inline-block">
                            <FaTimesCircle className="text-4xl text-destructive mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-destructive mb-2">Application Rejected</h3>
                            <p className="text-foreground/60 text-sm">Unfortunately your application was not approved at this time.</p>
                        </div>
                    ) : (
                        <Link
                            to="/instructor/apply"
                            className="bg-foreground text-background hover:bg-primary font-black py-4 px-10 rounded-[2rem] transition-all transform hover:scale-105 hover:shadow-xl hover:shadow-primary/20 inline-block text-[10px] uppercase tracking-[0.3em]"
                        >
                            Apply Now
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    // CASE 2: INSTRUCTOR DASHBOARD
    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-8 relative">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px]" />
            </div>
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12">
                    <h1 className="text-4xl font-display font-black text-foreground italic">Mentor Dashboard</h1>
                    <Link to="/admin/create-course" className="bg-foreground text-background hover:bg-primary font-black px-8 py-4 rounded-[2rem] transition-all hover:scale-105 hover:-translate-y-1 shadow-xl hover:shadow-primary/20 text-[10px] uppercase tracking-[0.3em]">
                        Initialize Course Unit
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-card/40 backdrop-blur-xl p-6 rounded-[2rem] border border-border hover:border-emerald-500/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-foreground/40 font-black text-[10px] uppercase tracking-widest">Total Revenue</h3>
                            <div className="p-3 bg-emerald-500/10 rounded-xl">
                                <FaMoneyBillWave className="text-emerald-500 text-xl" />
                            </div>
                        </div>
                        <p className="text-3xl font-display font-black text-foreground italic">₹{stats?.profile?.lifetimeEarnings || 0}</p>
                        <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest mt-2">Lifetime Earnings</p>
                    </div>

                    <div className="bg-card/40 backdrop-blur-xl p-6 rounded-[2rem] border border-border hover:border-blue-500/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-foreground/40 font-black text-[10px] uppercase tracking-widest">Total Students</h3>
                            <div className="p-3 bg-blue-500/10 rounded-xl">
                                <FaUserGraduate className="text-blue-500 text-xl" />
                            </div>
                        </div>
                        <p className="text-3xl font-display font-black text-foreground italic">{stats?.metrics?.totalStudents || 0}</p>
                        <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest mt-2">Enrolled Students</p>
                    </div>

                    <div className="bg-card/40 backdrop-blur-xl p-6 rounded-[2rem] border border-border hover:border-amber-500/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-foreground/40 font-black text-[10px] uppercase tracking-widest">Avg Rating</h3>
                            <div className="p-3 bg-amber-500/10 rounded-xl">
                                <FaCheckCircle className="text-amber-500 text-xl" />
                            </div>
                        </div>
                        <p className="text-3xl font-display font-black text-foreground italic">{stats?.metrics?.averageRating?.toFixed(1) || '0.0'}</p>
                        <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest mt-2">Course Rating</p>
                    </div>

                    <div className="bg-card/40 backdrop-blur-xl p-6 rounded-[2rem] border border-border hover:border-purple-500/50 transition-colors">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-foreground/40 font-black text-[10px] uppercase tracking-widest">Balance</h3>
                            <div className="p-3 bg-purple-500/10 rounded-xl">
                                <FaChartLine className="text-purple-500 text-xl" />
                            </div>
                        </div>
                        <p className="text-3xl font-display font-black text-foreground italic">₹{stats?.profile?.balance || 0}</p>
                        <p className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest mt-2">Available for Payout</p>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Recent Earnings */}
                    <div className="bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border p-8">
                        <h2 className="text-2xl font-display font-black text-foreground mb-6 italic">Recent Earnings</h2>
                        {stats?.recentEarnings?.length > 0 ? (
                            <div className="space-y-4">
                                {stats.recentEarnings.map((earning) => (
                                    <div key={earning._id} className="flex justify-between items-center bg-muted/30 hover:bg-muted/50 transition-colors p-4 rounded-2xl border border-border">
                                        <div>
                                            <p className="text-foreground font-bold text-sm">{earning.description || 'Course Sale'}</p>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mt-1">{new Date(earning.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <span className={`font-black tracking-wider ${earning.type === 'payout' ? 'text-destructive' : 'text-emerald-500'}`}>
                                            {earning.type === 'payout' ? '-' : '+'}₹{earning.amount}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-foreground/40 text-center py-12 font-medium italic">No earnings yet. Start promoting your courses!</p>
                        )}
                    </div>

                    {/* My Courses */}
                    <div className="bg-card/40 backdrop-blur-xl rounded-[2rem] border border-border p-8">
                        <h2 className="text-2xl font-display font-black text-foreground mb-6 italic">My Courses</h2>
                        {stats?.coursesSummary?.length > 0 ? (
                            <div className="space-y-4">
                                {stats.coursesSummary.map((course) => (
                                    <div key={course.id} className="flex justify-between items-center bg-muted/30 hover:bg-muted/50 transition-colors p-4 rounded-2xl border border-border">
                                        <div>
                                            <Link to={`/admin/edit-course/${course.id}`} className="text-primary hover:text-primary/80 font-bold transition-colors">{course.title}</Link>
                                            <div className="flex items-center space-x-3 mt-1.5 text-[10px] font-black uppercase tracking-widest text-foreground/40">
                                                <span>{course.enrollments} Syncs</span>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span className={course.status === 'Published' ? 'text-emerald-500' : 'text-amber-500'}>{course.status}</span>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-amber-500 text-sm font-black flex items-center justify-end gap-1">
                                                <span className="text-[10px]">★</span> {course.rating.toFixed(1)}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-12 border border-dashed border-border rounded-2xl">
                                <p className="text-foreground/40 mb-4 font-medium italic">You haven't created any courses yet.</p>
                                <Link to="/admin/create-course" className="text-primary font-black text-[10px] uppercase tracking-[0.2em] hover:text-primary/80 transition-colors">Create your first course &rarr;</Link>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InstructorDashboard;
