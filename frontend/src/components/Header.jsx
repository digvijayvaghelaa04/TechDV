import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
    Search,
    Bell,
    User,
    LogOut,
    BookOpen,
    LayoutDashboard,
    Menu,
    X,
    Sparkles,
    Zap,
    Smartphone,
    Layers,
    ChevronRight,
    Command,
    ShieldCheck
} from 'lucide-react';
import { logout, logoutSync, reset } from '../store/authSlice';
import { cn, getImgUrl, DEFAULT_AVATAR } from '../utils/utils';
import { useToast } from '../context/ToastContext';
import { CommandPalette } from './CommandPalette';
import ThemeToggle from './ThemeToggle';

export default function Header() {
    const [isOpen, setIsOpen] = useState(false);
    const [isVisible, setIsVisible] = useState(true);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const { user } = useSelector((state) => state.auth);
    const { success } = useToast();

    useEffect(() => {
        setIsOpen(false);
    }, [location]);

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 20) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const onLogout = async () => {
        try {
            await dispatch(logout()).unwrap();
        } catch (error) {
            console.error("Logout failed", error);
        }
        dispatch(logoutSync());
        dispatch(reset());
        navigate('/login');
    };

    const isCoursePlayer = location.pathname.includes('/learn');

    const navLinks = [
        { name: 'Courses', path: '/courses', icon: BookOpen },
        ...(user ? [{ name: 'My Learning', path: '/my-courses', icon: LayoutDashboard }] : []),
        ...(user?.role === 'admin' || user?.role === 'super_admin' ? [{ name: 'Admin', path: '/admin/dashboard', icon: ShieldCheck }] : []),
    ];

    if (isCoursePlayer) return null;

    return (
        <>
            <CommandPalette />

            <header
                className={cn(
                    "fixed top-0 inset-x-0 z-[100] transition-all duration-500",
                    isScrolled
                        ? "py-3 px-4 md:px-12"
                        : "py-6 px-4 md:px-8"
                )}
            >
                <div className={cn(
                    "container mx-auto flex items-center justify-between p-2 rounded-2xl transition-all duration-500",
                    isScrolled
                        ? "bg-background/85 backdrop-blur-xl border border-border shadow-[0_8px_30px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_30px_rgba(0,0,0,0.3)]"
                        : "bg-transparent border-transparent"
                )}>
                    <div className="flex items-center gap-10">
                        {/* Perfect Clear Logo */}
                        <Link to="/" className="flex items-center gap-2 group">
                            {/* TD Logo Typography Perfect Match */}
                            <div className="flex items-baseline font-display font-black text-4xl -tracking-[0.14em] select-none scale-y-110">
                                <span className="text-[#202A6B] z-10 drop-shadow-sm transition-transform group-hover:-translate-y-1 duration-300">T</span>
                                <span className="text-[#E2231A] -ml-1 drop-shadow-sm transition-transform group-hover:translate-x-1 duration-300">D</span>
                            </div>
                            <span className="text-2xl font-display font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors ml-1">
                                Tech<span className="text-slate-500 dark:text-slate-400">DV</span>
                            </span>
                        </Link>

                        {/* Cinematic Nav Links */}
                        <nav className="hidden lg:flex items-center gap-2">
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    className={cn(
                                        "relative px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 group overflow-hidden",
                                        location.pathname === link.path
                                            ? "text-foreground"
                                            : "text-foreground/50 hover:text-foreground"
                                    )}
                                >
                                    <span className="relative z-10">{link.name}</span>
                                    {location.pathname === link.path && (
                                        <div
                                            className="absolute inset-0 bg-muted backdrop-blur-md rounded-full border border-border"
                                        />
                                    )}
                                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-primary transition-all duration-300 group-hover:w-1/2" />
                                </Link>
                            ))}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Search Orb */}
                        <button
                            onClick={() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
                            className="hidden md:flex items-center gap-3 px-4 py-2 rounded-full border border-border bg-card text-foreground/40 hover:text-foreground transition-all hover:bg-muted hover:border-border group hover:shadow-[0_0_20px_rgba(255,255,255,0.05)]"
                        >
                            <Search className="h-4 w-4 transition-transform group-hover:scale-110" />
                            <span className="text-[10px] font-black uppercase tracking-widest">Dashboard</span>
                            <kbd className="hidden lg:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-background/50 px-2 font-mono text-[10px] font-medium">
                                <span className="opacity-50">⌘</span>K
                            </kbd>
                        </button>

                        <ThemeToggle />

                        <div className="h-8 w-[1px] bg-muted hidden md:block" />

                        {user ? (
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => success("No new system notifications.")}
                                    className="p-2.5 rounded-full hover:bg-muted text-foreground/60 hover:text-foreground transition-all relative group"
                                >
                                    <Bell className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                                    <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-primary shadow-[0_0_10px_rgba(var(--primary),1)]" />
                                </button>

                                <div className="relative group">
                                    <button
                                        className="flex items-center gap-3 p-1.5 pr-4 rounded-full border border-border bg-background/40 hover:bg-background/60 transition-all shadow-xl"
                                    >
                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-black border border-border flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(var(--primary),0.3)]">
                                            <span className="font-display font-black text-xs text-foreground/90 drop-shadow-[0_0_5px_rgba(var(--primary),0.8)] tracking-wide">
                                                {(user.firstName?.[0] || '')}{(user.lastName?.[0] || '')}
                                            </span>
                                        </div>
                                        <span className="hidden sm:inline text-[10px] font-black uppercase tracking-[0.2em]">{user.username}</span>
                                    </button>

                                    <div className="absolute right-0 top-full pt-3 w-64 opacity-0 translate-y-4 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto transition-all duration-500 ease-out">
                                        <div className="bg-background/80 backdrop-blur-3xl border border-border rounded-2xl shadow-xl overflow-hidden p-2">
                                            <div className="px-4 py-4 border-b border-border mb-2">
                                                <p className="text-xs font-black text-foreground uppercase tracking-widest leading-none mb-1">{user.firstName} {user.lastName}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                                                    <p className="text-[10px] text-foreground/40 uppercase tracking-[0.3em] font-bold">{user.role}</p>
                                                </div>
                                            </div>

                                            <Link to="/profile" className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/50 hover:text-foreground hover:bg-card transition-all group/item">
                                                <User className="h-4 w-4 group-hover/item:text-secondary" />
                                                <span className="text-xs font-bold uppercase tracking-widest">My Profile</span>
                                            </Link>

                                            <Link to={['instructor', 'admin', 'super_admin'].includes(user.role) ? "/instructor/dashboard" : "/instructor/apply"} className="flex items-center gap-3 px-4 py-3 rounded-xl text-foreground/50 hover:text-foreground hover:bg-card transition-all group/item">
                                                <BookOpen className="h-4 w-4 group-hover/item:text-emerald-500" />
                                                <span className="text-xs font-bold uppercase tracking-widest">
                                                    {['instructor', 'admin', 'super_admin'].includes(user.role) ? 'Instructor Panel' : 'Become Instructor'}
                                                </span>
                                            </Link>

                                            {(user.role === 'admin' || user.role === 'super_admin') && (
                                                <Link to="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-primary/70 hover:text-primary hover:bg-primary/10 transition-all group/item">
                                                    <LayoutDashboard className="h-4 w-4 transition-transform group-hover/item:scale-110" />
                                                    <span className="text-xs font-bold uppercase tracking-widest">Admin Panel</span>
                                                </Link>
                                            )}

                                            <button
                                                onClick={onLogout}
                                                className="w-full text-left flex items-center gap-3 px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 transition-all group/item mt-2"
                                            >
                                                <LogOut className="h-4 w-4 transition-transform group-hover/item:-translate-x-1" />
                                                <span className="text-[10px] font-black uppercase tracking-widest leading-none">Terminate Session</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Link
                                    to="/login"
                                    className="hidden sm:block px-6 py-2 text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 hover:text-foreground transition-colors"
                                >
                                    Login
                                </Link>
                                <Link
                                    to="/register"
                                    className="relative px-4 py-2 sm:px-8 sm:py-3 group overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-primary rounded-full transition-transform duration-500 group-hover:scale-105" />
                                    <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 blur-sm translate-y-1" />
                                    <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.3em] text-foreground">Join Now</span>
                                    <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Link>
                            </div>
                        )}

                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsOpen(true)}
                            className="lg:hidden p-2.5 rounded-full border border-border bg-card text-foreground transition-all hover:bg-muted"
                        >
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </div>
            </header>

            {isOpen && (
                <div
                    className="fixed inset-0 z-[60] bg-background/98 backdrop-blur-2xl md:hidden"
                >
                    <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between p-6 border-b border-border">
                            <div className="flex items-center gap-2">
                                <div className="flex items-baseline font-display font-black text-3xl -tracking-[0.14em] select-none scale-y-110">
                                    <span className="text-[#202A6B] z-10">T</span>
                                    <span className="text-[#E2231A] -ml-[3px]">D</span>
                                </div>
                                <span className="text-xl font-display font-bold tracking-tight text-slate-800 dark:text-slate-100 ml-1">
                                    Tech<span className="text-slate-500 dark:text-slate-400">DV</span>
                                </span>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="p-3 rounded-full bg-card text-foreground hover:bg-muted transition-colors"
                            >
                                <X className="h-6 w-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-6">
                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] mb-2">Systems Navigation</p>
                            {navLinks.map((link) => (
                                <Link
                                    key={link.path}
                                    to={link.path}
                                    onClick={() => setIsOpen(false)}
                                    className="flex items-center justify-between p-6 rounded-3xl bg-card border border-border hover:border-primary/50 transition-all duration-300 group"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className="h-12 w-12 rounded-2xl bg-muted border border-border flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                                            <link.icon className="h-6 w-6 text-foreground group-hover:text-primary" />
                                        </div>
                                        <span className="font-black text-xl text-foreground uppercase tracking-tight">{link.name}</span>
                                    </div>
                                    <ChevronRight className="h-6 w-6 text-foreground/20 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}

                            <div className="mt-8 pt-8 border-t border-border">
                                {user ? (
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-5 p-4 bg-card rounded-3xl border border-border">
                                            <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary/20 to-black border border-border flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                                                <span className="font-display font-black text-2xl text-foreground/90 drop-shadow-[0_0_10px_rgba(var(--primary),0.8)] tracking-wide">
                                                    {(user.firstName?.[0] || '')}{(user.lastName?.[0] || '')}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="font-black text-foreground uppercase tracking-tighter text-lg leading-none mb-1">{user.firstName} {user.lastName}</p>
                                                <div className="flex items-center gap-2">
                                                    <div className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                                                    <p className="text-[10px] text-foreground/40 uppercase tracking-[0.3em] font-black">{user.role}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <Link to="/profile" onClick={() => setIsOpen(false)} className="flex items-center justify-between p-5 rounded-2xl bg-card border border-border text-foreground/70 hover:text-foreground transition-all">
                                                <div className="flex items-center gap-4">
                                                    <User className="h-5 w-5" />
                                                    <span className="font-bold uppercase tracking-widest text-xs">Profile Settings</span>
                                                </div>
                                                <ChevronRight className="h-4 w-4" />
                                            </Link>
                                            <button onClick={onLogout} className="w-full py-5 rounded-2xl bg-destructive/10 text-destructive font-black uppercase tracking-[0.3em] text-xs border border-destructive/20 mt-4 active:scale-95 transition-transform">
                                                Sign Out of Academy
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 gap-4">
                                        <Link to="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center py-6 rounded-2xl bg-card border border-border text-foreground font-black uppercase tracking-[0.2em] text-sm">
                                            Login
                                        </Link>
                                        <Link to="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center py-6 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-[0.2em] text-sm shadow-[0_0_30px_rgba(var(--primary),0.3)]">
                                            Join Now
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-10 text-center border-t border-border">
                            <p className="text-[10px] text-foreground/20 font-black uppercase tracking-[0.4em]">© 2026 TechDV Collective</p>
                        </div>
                    </div>
                </div >
            )
            }

            {/* Floating Bottom Nav for Mobile */}
            <div
                className="fixed bottom-8 inset-x-8 z-50 md:hidden flex justify-center pointer-events-none"
            >
                <div className="bg-background/60 backdrop-blur-2xl border border-border rounded-3xl p-2 flex items-center gap-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto">
                    <Link to="/" className={cn("p-4 rounded-2xl transition-all", location.pathname === '/' ? "bg-muted text-foreground" : "text-foreground/40 hover:text-foreground")}>
                        <Search className="h-6 w-6" />
                    </Link>
                    <Link to="/courses" className={cn("p-5 rounded-2xl shadow-xl transition-all scale-110", location.pathname === '/courses' ? "bg-primary text-primary-foreground shadow-[0_0_30px_rgba(var(--primary),0.4)]" : "bg-card text-foreground/60")}>
                        <BookOpen className="h-7 w-7" />
                    </Link>
                    {user ? (
                        <Link to="/my-courses" className={cn("p-4 rounded-2xl transition-all", location.pathname === '/my-courses' ? "bg-muted text-foreground" : "text-foreground/40 hover:text-foreground")}>
                            <LayoutDashboard className="h-6 w-6" />
                        </Link>
                    ) : (
                        <Link to="/login" className="p-4 rounded-2xl text-foreground/40 hover:text-foreground transition-all">
                            <User className="h-6 w-6" />
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}
