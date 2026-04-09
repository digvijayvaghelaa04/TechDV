import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { useToast } from '../../context/ToastContext';

function InstructorApplications() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);
    const [loading, setLoading] = useState(true);
    const { success, error } = useToast();

    const fetchApplications = async () => {
        try {
            const response = await api.get('/instructors/applications?status=pending');
            setApplications(response.data.data);
            setLoading(false);
        } catch (err) {
            console.error(err);
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
            navigate('/');
            return;
        }
        fetchApplications();
    }, [user, navigate]);

    const handleStatusUpdate = async (id, status) => {
        if (!window.confirm(`Are you sure you want to ${status} this application?`)) return;

        try {
            await api.put(`/instructors/${id}/status`, { status });
            success(`Application ${status} successfully`);
            fetchApplications();
        } catch (err) {
            error(err.response?.data?.error || 'Update failed');
        }
    };

    if (loading) return <Loader />;

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 md:px-10 relative">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px]" />
            </div>
            <div className="max-w-7xl mx-auto relative z-10">
                <Link to="/admin/dashboard" className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground mb-4 block transition-colors">← Dashboard Protocol</Link>

                <div className="flex justify-between items-center mb-12">
                    <div>
                        <h1 className="text-4xl font-display font-black text-foreground uppercase italic tracking-tighter mb-2">Mentor <span className="text-primary">Applications</span></h1>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Pending Reviews: {applications.length}</p>
                    </div>
                </div>

                <div className="grid gap-8">
                    {applications.length === 0 ? (
                        <div className="bg-card/40 backdrop-blur-xl p-24 text-center rounded-[3rem] border border-border mt-4 shadow-2xl">
                            <p className="text-foreground/40 font-medium italic text-lg">No pending applications detected in the queue.</p>
                        </div>
                    ) : (
                        applications.map((app) => (
                            <div key={app._id} className="bg-card/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-border shadow-lg transition-all hover:shadow-primary/5 group relative overflow-hidden">
                                <div className="absolute top-0 left-0 w-2 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
                                <div className="flex flex-col md:flex-row gap-10 pl-4">
                                    {/* User Info */}
                                    <div className="min-w-[250px] md:border-r border-border md:pr-10">
                                        <div className="flex items-center gap-6 mb-6">
                                            <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-3xl font-black text-primary uppercase shadow-inner">
                                                {app.user?.firstName?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <h3 className="text-2xl font-display font-black text-foreground italic uppercase tracking-tighter">{app.user?.firstName || 'Unknown'} {app.user?.lastName || 'Applicant'}</h3>
                                                <p className="text-[10px] font-bold tracking-widest text-foreground/50 mt-1">{app.user?.email || 'No email provided'}</p>
                                            </div>
                                        </div>
                                        <div className="space-y-4 text-[10px] font-black uppercase tracking-widest text-foreground/40 bg-background/50 p-4 rounded-xl border border-border/50">
                                            <p className="flex justify-between"><span>Submitted:</span> <span className="text-foreground">{new Date(app.createdAt).toLocaleDateString()}</span></p>
                                            <p className="flex justify-between"><span>Status:</span> <span className="text-amber-500">Pending Review</span></p>
                                        </div>
                                    </div>

                                    {/* Application Details */}
                                    <div className="flex-1 space-y-8">
                                        <div>
                                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Core Expertise</h4>
                                            <div className="flex flex-wrap gap-3">
                                                {(app.expertise || []).map((skill, idx) => (
                                                    <span key={idx} className="px-4 py-2 rounded-xl bg-background border border-border text-[10px] font-black uppercase tracking-widest text-foreground/80 shadow-sm">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {(!app.expertise || app.expertise.length === 0) && <span className="text-foreground/30 text-xs italic font-medium">Unspecified parameters</span>}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4">Professional Overview</h4>
                                            <p className="text-foreground/80 bg-background p-6 rounded-2xl border border-border text-sm leading-relaxed font-medium shadow-inner">{app.bio || 'No profile data provided.'}</p>
                                        </div>
                                        <div className="pt-4 border-t border-border/50">
                                            <h4 className="text-[10px] font-black text-foreground/60 uppercase tracking-[0.3em] mb-4">Terminal Commands</h4>
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => handleStatusUpdate(app._id, 'approved')}
                                                    className="px-8 py-3 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-lg hover:shadow-emerald-500/20 hover:-translate-y-0.5"
                                                >
                                                    Authorize Mentor
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(app._id, 'rejected')}
                                                    className="px-8 py-3 bg-destructive/10 border border-destructive/20 text-destructive hover:bg-destructive hover:text-white rounded-xl font-black text-[10px] uppercase tracking-[0.2em] transition-all"
                                                >
                                                    Deny Access
                                                </button>
                                            </div>
                                        </div>
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

export default InstructorApplications;
