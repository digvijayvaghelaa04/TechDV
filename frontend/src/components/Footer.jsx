import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Sparkles, Twitter, Linkedin, Mail, ArrowUpRight } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Footer() {
    const { success } = useToast();
    const location = useLocation();

    const isCoursePlayer = location.pathname.includes('/learn');

    if (isCoursePlayer) return null;

    return (
        <footer className="relative z-10 bg-background border-t border-border pt-32 pb-16 overflow-hidden">
            {/* Background Decorative Glow */}
            <div className="absolute bottom-0 right-0 w-[800px] h-[800px] bg-slate-100 dark:bg-primary/5 rounded-full blur-[160px] pointer-events-none" />
            <div className="absolute top-0 left-1/4 w-[400px] h-[400px] bg-slate-50 dark:bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 mb-24">
                    {/* Brand Meta */}
                    <div className="lg:col-span-4">
                        <Link to="/" className="inline-flex items-center gap-2 mb-10 group">
                            <div className="flex items-baseline font-display font-black text-4xl -tracking-[0.14em] select-none scale-y-110">
                                <span className="text-[#202A6B] z-10 drop-shadow-sm transition-transform group-hover:-translate-y-1 duration-300">T</span>
                                <span className="text-[#E2231A] -ml-1 drop-shadow-sm transition-transform group-hover:translate-x-1 duration-300">D</span>
                            </div>
                            <span className="text-2xl font-display font-bold tracking-tight text-slate-800 dark:text-slate-100 transition-colors ml-1">
                                Tech<span className="text-slate-500 dark:text-slate-400">DV</span>
                            </span>
                        </Link>
                        <p className="text-foreground/40 text-lg leading-relaxed mb-10 max-w-sm font-medium">
                            The high-performance academy for modern digital mastery. <span className="text-foreground/60">Practical learning. Expert guidance.</span>
                        </p>
                        <div className="flex gap-4">
                            {[Twitter, Linkedin, Mail].map((Icon, i) => (
                                <a key={i} href="#" className="h-12 w-12 rounded-2xl bg-card border border-border flex items-center justify-center text-foreground/50 hover:bg-primary hover:text-foreground hover:border-primary hover:-translate-y-1 transition-all duration-300">
                                    <Icon className="h-5 w-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation Clusters */}
                    <div className="lg:col-span-4 grid grid-cols-2 gap-8">
                        <div>
                            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-foreground/30 mb-8">Platform</h4>
                            <ul className="space-y-4">
                                {['Courses', 'Mentors', 'Pricing', 'Live'].map((item) => (
                                    <li key={item}>
                                        <Link to={`/${item.toLowerCase()}`} className="text-foreground/40 hover:text-primary font-bold text-sm transition-colors flex items-center gap-2 group">
                                            {item}
                                            <ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-foreground/30 mb-8">Information</h4>
                            <ul className="space-y-4">
                                {['About', 'Careers', 'Blog', 'Contact'].map((item) => (
                                    <li key={item}>
                                        <Link to={`/${item.toLowerCase()}`} className="text-foreground/40 hover:text-primary font-bold text-sm transition-colors flex items-center gap-2 group">
                                            {item}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Neural Intake */}
                    <div className="lg:col-span-4">
                        <h4 className="font-black text-[10px] uppercase tracking-[0.4em] text-foreground/30 mb-8">Newsletter</h4>
                        <p className="text-foreground/40 text-sm mb-8 font-medium">Get the latest updates and course announcements direct to your inbox.</p>
                        <form
                            className="relative group/form"
                            onSubmit={(e) => {
                                e.preventDefault();
                                success('🎉 Success! You have been subscribed.');
                            }}
                        >
                            <input
                                type="email"
                                required
                                placeholder="your@email.com"
                                className="w-full bg-card border border-border rounded-2xl px-6 py-5 text-xs font-black tracking-widest text-foreground placeholder:text-foreground/20 focus:outline-none focus:border-primary focus:bg-white/[0.08] transition-all"
                            />
                            <button
                                type="submit"
                                className="absolute right-2 top-2 bottom-2 px-8 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-foreground transition-all active:scale-95"
                            >
                                Subscribe
                            </button>
                        </form>
                    </div>
                </div>

                <div className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3 text-foreground/20 text-[10px] font-black uppercase tracking-[0.4em]">
                        <span>© 2026 TechDV Academy</span>
                        <div className="h-1 w-1 rounded-full bg-primary animate-pulse" />
                        <span>All Rights Reserved</span>
                    </div>
                    <div className="flex gap-10">
                        {['Privacy', 'Service', 'Cookies'].map((item) => (
                            <Link key={item} to="/privacy" className="text-foreground/20 hover:text-foreground text-[10px] font-black uppercase tracking-[0.4em] transition-colors">{item}</Link>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}
