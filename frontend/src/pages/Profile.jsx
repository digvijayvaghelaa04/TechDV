import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    User,
    Settings,
    Camera,
    Mail,
    Phone,
    Calendar,
    GraduationCap,
    Trash2,
    Save,
    ChevronLeft,
    ShieldCheck,
    Zap,
    Globe,
    Download,
    CreditCard,
    CheckCircle
} from 'lucide-react';
import { logout, updateUser } from '../store/authSlice';
import api from '../utils/api';
import { cn, getImgUrl, DEFAULT_AVATAR, DEFAULT_COURSE_IMAGE } from '../utils/utils';
import { useToast } from '../context/ToastContext';
import { PageTransition } from '../components/PageTransition';

const fetchProfile = async () => {
    const { data } = await api.get('/auth/me');
    return data.data;
};

const fetchMyOrders = async () => {
    const { data } = await api.get('/orders/my');
    return data.data;
};

const fetchMyEnrollments = async () => {
    const { data } = await api.get('/enrollments/me');
    return data.data;
};

export default function Profile() {
    const queryClient = useQueryClient();
    const { success: toastSuccess, error: toastError } = useToast();
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        mobileNumber: user?.mobileNumber || '',
        username: user?.username || '',
        dateOfBirth: user?.dateOfBirth ? user.dateOfBirth.split('T')[0] : '',
        education: user?.education || ''
    });

    const { data: profile, isLoading } = useQuery({
        queryKey: ['profile'],
        queryFn: fetchProfile,
        onSuccess: (data) => {
            setFormData({
                firstName: data.firstName || '',
                lastName: data.lastName || '',
                email: data.email || '',
                mobileNumber: data.mobileNumber || '',
                username: data.username || '',
                dateOfBirth: data.dateOfBirth ? data.dateOfBirth.split('T')[0] : '',
                education: data.education || ''
            });
            dispatch(updateUser(data));
        }
    });

    const { data: enrollments, isLoading: isEnrolledLoading } = useQuery({
        queryKey: ['my-enrollments'],
        queryFn: fetchMyEnrollments
    });

    const { data: orders, isLoading: isOrdersLoading } = useQuery({
        queryKey: ['my-orders'],
        queryFn: fetchMyOrders
    });

    const updateMutation = useMutation({
        mutationFn: async (updatedData) => {
            const { data } = await api.put('/auth/updatedetails', updatedData);
            return data.data;
        },
        onSuccess: (data) => {
            toastSuccess('Profile updated successfully.');
            queryClient.setQueryData(['profile'], data);
            dispatch(updateUser(data));
        },
        onError: (err) => {
            toastError(err.response?.data?.error || 'Synchronization failed.');
        }
    });

    const uploadAvatarMutation = useMutation({
        mutationFn: async (file) => {
            const fd = new FormData();
            fd.append('avatar', file);
            const { data } = await api.post('/upload/avatar', fd);
            return data.data;
        },
        onSuccess: (data) => {
            toastSuccess('Avatar updated.');
            queryClient.invalidateQueries(['profile']);
            dispatch(updateUser({ avatar: data.avatar }));
        }
    });

    const onChange = (e) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleAvatarChange = (e) => {
        if (e.target.files[0]) {
            uploadAvatarMutation.mutate(e.target.files[0]);
        }
    };

    const LearningProtocolList = () => {
        if (isEnrolledLoading) return <div className="py-12 flex justify-center"><div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

        if (!enrollments || enrollments.length === 0) {
            return (
                <div className="text-center py-12 bg-muted/20 rounded-[2rem] border border-dashed border-border group hover:bg-muted/30 transition-all">
                    <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20 group-hover:opacity-40 transition-opacity" />
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-[10px] mb-4">No active learning protocols</p>
                    <Link to="/courses" className="text-primary font-black text-xs uppercase tracking-widest hover:underline">Browse Courses &rarr;</Link>
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {enrollments.map((enrollment) => (
                    <Link
                        key={enrollment._id}
                        to={`/course/${enrollment.course?._id}/learn`}
                        className="p-4 rounded-[2.5rem] bg-card border border-border group hover:border-primary/30 transition-all shadow-lg hover:shadow-primary/5"
                    >
                        <div className="flex gap-4">
                            <div className="h-24 w-32 rounded-2xl overflow-hidden border border-border group-hover:border-primary/50 transition-colors shrink-0">
                                <img
                                    src={getImgUrl(enrollment.course?.thumbnail)}
                                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                    alt=""
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = DEFAULT_COURSE_IMAGE;
                                    }}
                                />
                            </div>
                            <div className="flex-1 flex flex-col justify-between py-1">
                                <div>
                                    <h4 className="font-bold text-sm leading-tight group-hover:text-primary transition-colors line-clamp-1">{enrollment.course?.title}</h4>
                                    <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mt-1">
                                        Instructor: {enrollment.course?.instructor?.firstName}
                                    </p>
                                </div>
                                <div className="space-y-1.5">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[8px] font-black uppercase tracking-widest text-muted-foreground">Sync Progress</span>
                                        <span className="text-[10px] font-black italic text-primary">{enrollment.progress || 0}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-primary transition-all duration-1000 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
                                            style={{ width: `${enrollment.progress || 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>
        );
    };

    const TransactionHistoryList = () => {
        if (isOrdersLoading) return <div className="py-12 flex justify-center"><div className="h-8 w-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

        if (!orders || orders.length === 0) {
            return (
                <div className="text-center py-12 bg-muted/20 rounded-[2rem] border border-dashed border-border">
                    <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                    <p className="text-muted-foreground font-medium uppercase tracking-widest text-xs">No transactions found</p>
                </div>
            );
        }

        return (
            <div className="space-y-4">
                {orders.map((order) => (
                    <div key={order._id} className="p-6 rounded-[2rem] bg-muted/30 border border-border group hover:bg-muted/50 transition-all">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20">
                                    <CheckCircle className="h-6 w-6 text-primary" />
                                </div>
                                <div>
                                    <h4 className="font-bold text-lg leading-tight uppercase tracking-tight italic">
                                        {order.orderItems?.map(item => item.title).join(', ') || 'Course Purchase'}
                                    </h4>
                                    <p className="text-xs text-muted-foreground font-mono mt-1">
                                        Order ID: {order._id.slice(-8).toUpperCase()} • {new Date(order.paidAt || order.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-between md:justify-end gap-8">
                                <div className="text-right">
                                    <span className="text-2xl font-black italic">₹{order.totalPrice}</span>
                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-1">Successful</p>
                                </div>
                                <button className="h-12 w-12 rounded-2xl bg-foreground text-background flex items-center justify-center hover:scale-110 transition-transform">
                                    <Download className="h-5 w-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    if (isLoading) return <div className="min-h-screen bg-background flex items-center justify-center"><div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>;

    return (
        <PageTransition>
            <div className="min-h-screen bg-background pt-32 pb-20 overflow-x-hidden relative">
                {/* Visual Engine Base */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[150px]" />
                    <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                </div>

                <div className="container mx-auto px-4 md:px-6 relative z-10 max-w-6xl">
                    <Link
                        to="/"
                        className="inline-flex items-center gap-3 text-foreground/40 hover:text-foreground transition-all mb-12 font-black text-[10px] uppercase tracking-[0.3em] group"
                    >
                        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Protocol Exit
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                        {/* Sidebar Info */}
                        <div className="lg:col-span-4 space-y-8">
                            <div
                                className="p-10 rounded-[3rem] bg-card/40 backdrop-blur-xl border border-border shadow-2xl text-center relative overflow-hidden group/profile"
                            >
                                <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-scanline opacity-50" />

                                <div className="relative inline-block mb-8 group/avatar">
                                    <div className="h-44 w-44 rounded-full bg-background border-4 border-card overflow-hidden relative shadow-[0_0_50px_-10px_hsl(var(--primary)/0.3)] transition-transform duration-700 group-hover/profile:scale-105">
                                        <img
                                            src={getImgUrl(profile.avatar, true)}
                                            alt=""
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = DEFAULT_AVATAR;
                                            }}
                                        />
                                        <label className="absolute inset-0 bg-background/80 flex flex-col items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity cursor-pointer text-foreground">
                                            <Camera className="h-8 w-8 mb-2 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-[0.3em]">Update Sync</span>
                                            <input type="file" className="hidden" onChange={handleAvatarChange} accept="image/*" />
                                        </label>
                                    </div>
                                </div>

                                <h2 className="text-3xl font-display font-black tracking-tight mb-2 italic uppercase text-foreground">{profile?.firstName} {profile?.lastName}</h2>
                                <div className="flex items-center justify-center gap-2 text-foreground/30 font-black text-[10px] uppercase tracking-[0.4em] mb-8">
                                    <Globe className="h-3 w-3" />
                                    id://{profile?.username}
                                </div>

                                <div className="space-y-3 pt-8 border-t border-border">
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border group/role hover:border-primary/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <ShieldCheck className="h-4 w-4 text-primary" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Classification</span>
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full">{profile?.role}</span>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border group/spent hover:border-emerald-500/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <Zap className="h-4 w-4 text-amber-500" />
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Total Credit</span>
                                        </div>
                                        <span className="text-[8px] font-black uppercase tracking-widest px-3 py-1 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-full">₹{profile?.totalSpent || 0}</span>
                                    </div>
                                </div>
                            </div>

                            <div
                                className="p-10 rounded-[3.5rem] bg-foreground text-background shadow-2xl relative group overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 group-hover:scale-110 transition-transform duration-700">
                                    <ShieldCheck className="h-24 w-24" />
                                </div>
                                <h3 className="text-2xl font-display font-black mb-4 relative z-10 italic uppercase">Upgrade Protocol</h3>
                                <p className="text-background/60 text-xs font-bold mb-8 relative z-10 leading-relaxed uppercase tracking-widest">Access all premium laboratories and 1:1 mentorship sessions.</p>
                                <button className="w-full h-16 bg-background text-foreground font-black rounded-2xl hover:bg-primary transition-colors relative z-10 text-[10px] uppercase tracking-[0.3em] shadow-xl">Activate Pro</button>
                            </div>
                        </div>

                        {/* Main settings form */}
                        <div className="lg:col-span-8 space-y-12">
                            <div
                                className="p-10 md:p-14 rounded-[3rem] bg-card/40 border border-border backdrop-blur-xl shadow-2xl relative"
                            >
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16">
                                    <div>
                                        <h2 className="text-4xl font-display font-black tracking-tighter italic">Edit Profile</h2>
                                        <p className="text-muted-foreground font-medium mt-2">Update your personal details and account preferences.</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => updateMutation.mutate(formData)}
                                            disabled={updateMutation.isLoading}
                                            className="px-8 h-14 bg-foreground text-background font-black rounded-2xl flex items-center gap-2 hover:shadow-xl transition-all disabled:opacity-50"
                                        >
                                            {updateMutation.isLoading ? <div className="h-4 w-4 border-2 border-background/20 border-t-background rounded-full animate-spin" /> : <Save className="h-5 w-5" />}
                                            Save Changes
                                        </button>
                                    </div>
                                </div>

                                <form className="space-y-12">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">First Name</label>
                                            <div className="relative">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <input name="firstName" value={formData.firstName} onChange={onChange} className="w-full bg-muted/40 border border-border rounded-2xl pl-14 pr-6 py-4 font-bold focus:border-primary transition-all outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Last Name</label>
                                            <div className="relative">
                                                <User className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <input name="lastName" value={formData.lastName} onChange={onChange} className="w-full bg-muted/40 border border-border rounded-2xl pl-14 pr-6 py-4 font-bold focus:border-primary transition-all outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <input name="email" value={formData.email} onChange={onChange} className="w-full bg-muted/40 border border-border rounded-2xl pl-14 pr-6 py-4 font-bold focus:border-primary transition-all outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Phone Number</label>
                                            <div className="relative">
                                                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <input name="mobileNumber" value={formData.mobileNumber} onChange={onChange} className="w-full bg-muted/40 border border-border rounded-2xl pl-14 pr-6 py-4 font-bold focus:border-primary transition-all outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Date of Birth</label>
                                            <div className="relative">
                                                <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={onChange} className="w-full bg-muted/40 border border-border rounded-2xl pl-14 pr-6 py-4 font-bold focus:border-primary transition-all outline-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] pl-1">Education</label>
                                            <div className="relative">
                                                <GraduationCap className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                                                <input name="education" value={formData.education} onChange={onChange} className="w-full bg-muted/40 border border-border rounded-2xl pl-14 pr-6 py-4 font-bold focus:border-primary transition-all outline-none" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="pt-12 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-8">
                                        <div className="text-sm text-muted-foreground italic max-w-sm">Note: Updating your profile details will reflect across your certificate and dashboard.</div>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (window.confirm('Are you absolutely sure you want to delete this account?')) {
                                                    // Delete account logic...
                                                }
                                            }}
                                            className="text-destructive font-black text-xs uppercase tracking-widest flex items-center gap-2 hover:bg-destructive/5 px-6 py-3 rounded-xl transition-all"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                            Delete Account
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Learning Protocol Section */}
                            <div
                                className="p-10 md:p-14 rounded-[3rem] bg-card/40 border border-border backdrop-blur-xl shadow-2xl relative"
                            >
                                <h2 className="text-4xl font-display font-black tracking-tighter italic mb-8">Learning Protocol</h2>
                                <LearningProtocolList />
                            </div>

                            {/* Transaction History Section */}
                            <div
                                className="p-10 md:p-14 rounded-[3rem] bg-card/40 border border-border backdrop-blur-xl shadow-2xl relative"
                            >
                                <h2 className="text-4xl font-display font-black tracking-tighter italic mb-8">Transaction History</h2>
                                <TransactionHistoryList />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}
