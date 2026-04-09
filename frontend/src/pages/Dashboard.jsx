import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
    Cpu,
    BookOpen,
    User,
    Settings,
    LogOut,
    Zap,
    ShieldCheck,
    Activity,
    ChevronRight
} from 'lucide-react';


export default function Dashboard() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();

    const menuItems = [
        { title: 'My Courses', subtitle: 'View enrolled courses', icon: BookOpen, path: '/my-courses', color: 'text-primary' },
        { title: 'My Profile', subtitle: 'Account settings', icon: User, path: '/profile', color: 'text-secondary' },
        {
            title: ['instructor', 'admin', 'super_admin'].includes(user?.role) ? 'Instructor Panel' : 'Become Instructor',
            subtitle: 'Share your knowledge',
            icon: Zap,
            path: ['instructor', 'admin', 'super_admin'].includes(user?.role) ? '/instructor/dashboard' : '/instructor/apply',
            color: 'text-emerald-500'
        },
        ...(user?.role === 'admin' || user?.role === 'super_admin' ? [
            { title: 'Admin Panel', subtitle: 'Manage platform', icon: ShieldCheck, path: '/admin/dashboard', color: 'text-primary' }
        ] : []),
        { title: 'Account Settings', subtitle: 'Manage preferences', path: '/profile', icon: Settings, color: 'text-foreground' }
    ];

    return (
        <div className="min-h-screen bg-background text-foreground relative overflow-hidden pt-32 pb-20">
            {/* Visual Engine */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[150px]" />
            </div>

            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-4xl mx-auto">
                    <div
                        className="mb-16"
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-16 w-16 rounded-2xl bg-muted border border-border flex items-center justify-center backdrop-blur-md">
                                <Cpu className="h-8 w-8 text-primary animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-4xl md:text-6xl font-display font-black uppercase italic tracking-tighter">Dashboard</h1>
                                <p className="text-foreground/40 text-sm font-bold uppercase tracking-widest">Welcome back, {user?.firstName}</p>
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {menuItems.map((item, i) => (
                            <Link to={item.path} key={i} className="group relative">
                                <div
                                    className="relative z-10 bg-card/40 border border-border/50 hover:border-primary/30 backdrop-blur-xl p-8 rounded-[2.5rem] transition-all duration-300 group-hover:bg-muted shadow-lg overflow-hidden group-hover:shadow-[0_0_30px_rgba(var(--primary),0.1)]"
                                >
                                    <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-[0.03] transition-opacity transform group-hover:scale-110 duration-500">
                                        <item.icon className="h-32 w-32" />
                                    </div>

                                    <div className="flex items-start justify-between mb-8">
                                        <div className={`p-4 rounded-2xl bg-background/50 border border-border ${item.color}`}>
                                            <item.icon className="h-8 w-8" />
                                        </div>
                                        <div className="h-10 w-10 rounded-full border border-border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                            <ChevronRight className="h-4 w-4 text-foreground" />
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-2xl font-black uppercase tracking-tight mb-1">{item.title}</h3>
                                        <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest">{item.subtitle}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}

                        {/* Recent Activity / Status */}
                        <div
                            className="md:col-span-2 mt-8 bg-card/40 border border-border/50 rounded-[2.5rem] p-8 backdrop-blur-xl shadow-lg"
                        >
                            <div className="flex items-center gap-3 text-destructive font-black text-xs uppercase tracking-widest mb-6">
                                <Activity className="h-4 w-4" />
                                System Status
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                                    <span className="text-foreground/60 font-medium">Session Status</span>
                                    <span className="text-emerald-500 font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                        Connected
                                    </span>
                                </div>
                                <div className="flex items-center justify-between p-4 rounded-xl bg-card border border-border">
                                    <span className="text-foreground/60 font-medium">Encryption Level</span>
                                    <span className="text-foreground font-bold uppercase text-xs tracking-wider flex items-center gap-2">
                                        <ShieldCheck className="h-4 w-4 text-foreground" />
                                        Secure Access Verified
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
