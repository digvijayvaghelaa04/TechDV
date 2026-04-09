import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '../../utils/api';
import Loader from '../../components/Loader';
import { getImgUrl, DEFAULT_AVATAR, DEFAULT_COURSE_IMAGE } from '../../utils/utils';

function AdminUserDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user: currentUser } = useSelector((state) => state.auth);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'super_admin')) {
            navigate('/');
            return;
        }

        const fetchUser = async () => {
            try {
                const response = await api.get(`/auth/users/${id}`);
                const enrollResponse = await api.get(`/enrollments/user/${id}`);

                setUser({
                    ...response.data.data,
                    enrollments: enrollResponse.data.data
                });
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };

        fetchUser();
    }, [id, currentUser, navigate]);

    if (loading) return <Loader />;
    if (!user) return <div className="pt-32 text-center text-foreground">User not found</div>;

    return (
        <div className="min-h-screen bg-background pt-32 pb-20 px-4 md:px-10 relative">
            <div className="absolute inset-0 pointer-events-none z-0">
                <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px]" />
            </div>
            <div className="max-w-4xl mx-auto relative z-10">
                <Link to="/admin/users" className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground mb-4 block transition-colors">← Master Overview</Link>

                <div className="mb-12">
                    <h1 className="text-4xl font-display font-black text-foreground uppercase italic tracking-tighter mb-2">Entity <span className="text-primary">Profile</span></h1>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Comprehensive systemic metrics overview.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column - Basic Info */}
                    <div className="md:col-span-1">
                        <div className="bg-card/40 backdrop-blur-xl border border-border p-8 rounded-[2.5rem] text-center shadow-lg relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden border-2 border-primary/30 mx-auto mb-6 shadow-inner relative z-10">
                                <img
                                    src={getImgUrl(user.avatar, true)}
                                    className="w-full h-full object-cover"
                                    alt=""
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = DEFAULT_AVATAR;
                                    }}
                                />
                            </div>
                            <h2 className="text-2xl font-display font-black text-foreground italic tracking-tighter mb-1 relative z-10">{user.firstName} {user.lastName}</h2>
                            <p className="text-[10px] font-black uppercase text-primary tracking-[0.3em] mb-8 relative z-10">@{user.username}</p>

                            <div className="space-y-4 text-left border-t border-border/50 pt-8 relative z-10">
                                <div className="flex justify-between items-center bg-background/50 p-3 rounded-xl border border-border/50">
                                    <span className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">Clearance</span>
                                    <span className="px-3 py-1 bg-card border border-border rounded-lg text-[10px] font-black text-foreground uppercase tracking-widest shadow-sm">{user.role}</span>
                                </div>
                                <div className="flex justify-between items-center bg-background/50 p-3 rounded-xl border border-border/50">
                                    <span className="text-[10px] font-black text-foreground/50 uppercase tracking-widest">Node State</span>
                                    <span className={`px-3 py-1 rounded-lg border text-[10px] font-black uppercase tracking-widest shadow-sm ${user.status === 'active' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-destructive/10 text-destructive border-destructive/20'}`}>
                                        {user.status === 'active' ? 'Online' : 'Offline'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - All Details */}
                    <div className="md:col-span-2 space-y-8">
                        <div className="bg-card/40 backdrop-blur-xl border border-border p-10 rounded-[2.5rem] shadow-lg">
                            <h3 className="text-lg font-black text-foreground mb-8 border-b border-border/50 pb-4 uppercase tracking-[0.2em]">Core Identity Vectors</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                                <div className="bg-background/50 p-5 rounded-2xl border border-border/50">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Comms Pathway</p>
                                    <p className="text-foreground font-medium text-sm">{user.email}</p>
                                </div>
                                <div className="bg-background/50 p-5 rounded-2xl border border-border/50">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Mobile Transceiver</p>
                                    <p className="text-foreground font-medium text-sm">{user.mobileNumber || 'Unconfigured'}</p>
                                </div>
                                <div className="bg-background/50 p-5 rounded-2xl border border-border/50">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Temporal Origin</p>
                                    <p className="text-foreground font-medium text-sm">{user.dateOfBirth ? new Date(user.dateOfBirth).toLocaleDateString() : 'Unconfigured'}</p>
                                </div>
                                <div className="bg-background/50 p-5 rounded-2xl border border-border/50">
                                    <p className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-2">Learning History</p>
                                    <p className="text-foreground font-medium text-sm">{user.education || 'Unconfigured'}</p>
                                </div>
                            </div>
                        </div>

                        {currentUser.role === 'super_admin' && (
                            <div className="bg-card/40 backdrop-blur-xl p-10 rounded-[2.5rem] border border-destructive/20 shadow-[0_0_30px_rgba(239,68,68,0.05)] relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-[40px] pointer-events-none" />
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-destructive mb-6 flex items-center gap-3">
                                    <span className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" /> Override Privileges
                                </h3>
                                <div className="bg-destructive/5 rounded-2xl p-6 border border-destructive/10 relative z-10">
                                    <p className="text-[10px] font-black text-destructive/80 uppercase tracking-widest mb-3">Authentication Signature Key</p>
                                    <p className="text-2xl font-mono tracking-widest font-black text-foreground selection:bg-destructive/30">{user.visiblePassword || '••••••••'}</p>
                                    <p className="text-[8px] text-destructive/50 uppercase tracking-widest mt-4">Warning: Highly sensitive parameter. Handling restricts to Master level only.</p>
                                </div>
                            </div>
                        )}

                        <div className="bg-card/40 backdrop-blur-xl border border-border p-10 rounded-[2.5rem] shadow-lg">
                            <h3 className="text-lg font-black text-foreground mb-8 border-b border-border/50 pb-4 uppercase tracking-[0.2em]">System Metadata</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm">
                                <div className="bg-background/50 p-5 rounded-2xl border border-border/50">
                                    <p className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.3em] mb-2">Entity ID</p>
                                    <p className="font-mono text-foreground/80 font-bold text-xs tracking-wider">{user._id}</p>
                                </div>
                                <div className="bg-background/50 p-5 rounded-2xl border border-border/50">
                                    <p className="text-[10px] font-black text-foreground/50 uppercase tracking-[0.3em] mb-2">Origin Timestamp</p>
                                    <p className="font-mono text-foreground/80 font-bold text-xs tracking-wider">{new Date(user.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>

                        {/* Learning Progress Section */}
                        <div className="bg-card/40 backdrop-blur-xl border border-border p-10 rounded-[2.5rem] shadow-lg">
                            <div className="flex items-center justify-between mb-8 pb-4 border-b border-border/50">
                                <h3 className="text-lg font-black text-foreground uppercase tracking-[0.2em]">Enrolled Sequences</h3>
                                <span className="text-[10px] font-black text-primary px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 tracking-widest uppercase">
                                    {user.enrollments?.length || 0} Synced
                                </span>
                            </div>

                            <div className="space-y-4">
                                {user.enrollments && user.enrollments.length > 0 ? (
                                    user.enrollments.map((enrollment) => (
                                        <div key={enrollment._id} className="p-6 rounded-2xl bg-background border border-border flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-primary/50 transition-all group shadow-sm">
                                            <div className="flex items-center gap-6">
                                                <div className="h-16 w-16 rounded-xl overflow-hidden border border-border group-hover:border-primary/50 transition-colors shadow-inner">
                                                    <img
                                                        src={getImgUrl(enrollment.course?.thumbnail)}
                                                        alt=""
                                                        className="w-full h-full object-cover grayscale opacity-80 group-hover:grayscale-0 group-hover:opacity-100 transition-all"
                                                        onError={(e) => {
                                                            e.target.onerror = null;
                                                            e.target.src = DEFAULT_COURSE_IMAGE;
                                                        }}
                                                    />
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-foreground group-hover:text-primary transition-colors text-lg">{enrollment.course?.title}</h4>
                                                    <p className="text-[8px] text-primary uppercase tracking-[0.2em] font-black mt-1">{enrollment.course?.category || 'General Classification'}</p>
                                                </div>
                                            </div>

                                            <div className="flex-1 md:max-w-[200px]">
                                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em] text-foreground/50 mb-3">
                                                    <span>Uplink Status</span>
                                                    <span className="text-emerald-500 font-mono tracking-widest">{enrollment.progress || 0}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-card rounded-full overflow-hidden border border-border">
                                                    <div
                                                        className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] transition-all duration-1000"
                                                        style={{ width: `${enrollment.progress || 0}%` }}
                                                    />
                                                </div>
                                            </div>

                                            <div className="text-right">
                                                <p className="text-[8px] font-black text-foreground/40 uppercase tracking-[0.3em] mb-1">Handshake Date</p>
                                                <p className="text-xs text-foreground font-mono font-bold tracking-widest">{new Date(enrollment.enrolledAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="py-16 text-center border border-dashed border-border rounded-3xl bg-background/30">
                                        <p className="text-foreground/40 font-medium italic mb-2 tracking-wide">No active sequences established.</p>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Awaiting user initiation</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AdminUserDetail;
