import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import {
    Sparkles,
    ArrowRight,
    Play,
    ShieldCheck,
    Cpu,
    Globe,
    Zap,
    CheckCircle2,
    TrendingUp,
    Search
} from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { CourseCardSkeleton } from '../components/Skeleton';
import { FadeInScroll } from '../components/PageTransition';
import { cn } from '../utils/utils';

const fetchFeaturedCourses = async () => {
    const { data } = await api.get('/courses?limit=3');
    return data.data;
};

const CinematicText = ({ children, className }) => (
    <div className={cn("relative group", className)}>
        <span className="absolute -inset-2 bg-gradient-to-r from-primary/50 via-primary/50 to-secondary/50 opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-500" />
        <h1 className="relative font-display font-black tracking-tighter leading-[0.85] text-balance">
            {children}
        </h1>
    </div>
);

const fetchPlatformStats = async () => {
    const { data } = await api.get('/analytics/stats');
    return data.data;
};

export default function Home() {
    const [searchTerm, setSearchTerm] = useState('');

    const { data: platformStats } = useQuery({
        queryKey: ['platformStats'],
        queryFn: fetchPlatformStats,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const { data: featuredCourses, isLoading } = useQuery({
        queryKey: ['featuredCourses'],
        queryFn: fetchFeaturedCourses,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });

    const { data: statsData } = useQuery({
        queryKey: ['publicStats'],
        queryFn: async () => {
            const { data } = await api.get('/analytics/public');
            return data.data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const formatCount = (num) => {
        if (!num) return '0+';
        if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'k+';
        return num + '+';
    };

    const stats = [
        { label: 'Learners', value: formatCount(statsData?.learners), icon: Globe },
        { label: 'Courses', value: formatCount(statsData?.courses), icon: Play },
        { label: 'Experts', value: formatCount(statsData?.experts), icon: Zap },
        { label: 'Success Rate', value: statsData?.successRate ? `${statsData.successRate}%` : '98%', icon: TrendingUp },
    ];

    const features = [
        {
            title: 'Personalized Learning',
            description: 'AI-driven courses adapted to your learning speed and goals.',
            icon: Cpu,
            color: 'text-primary'
        },
        {
            title: 'Verified Certificates',
            description: 'Get industry-recognized certificates for your professional growth.',
            icon: ShieldCheck,
            color: 'text-primary'
        },
        {
            title: 'Live Mentorship',
            description: 'Interative real-time sessions with industry professionals.',
            icon: Sparkles,
            color: 'text-secondary'
        }
    ];

    return (
        <div className="relative bg-transparent overflow-x-hidden">
            {/* Hero Section */}
            <section className="relative z-10 flex flex-col items-center min-h-[100dvh] pt-32 px-4 md:px-6">
                <div className="container mx-auto flex-1 flex flex-col justify-center w-full">
                    <div className="flex flex-col items-center text-center max-w-[90vw] md:max-w-6xl mx-auto py-8">
                        <div
                            className="inline-flex items-center gap-2 md:gap-3 px-4 py-1.5 md:px-6 md:py-2 rounded-full border border-border bg-background/40 backdrop-blur-3xl mb-6 md:mb-12 mt-4 md:mt-0"
                        >
                            <div className="h-1.5 w-1.5 md:h-2 md:w-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary), 1)]" />
                            <span className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-foreground/50">TechDV Academy v2.0</span>
                        </div>

                        <div>
                            <CinematicText className="text-5xl sm:text-7xl md:text-8xl lg:text-[9rem] xl:text-[10rem] mb-6 md:mb-12">
                                <span className="text-foreground">EVOLVE</span><br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary to-secondary animate-pulse">BEYOND_</span>
                            </CinematicText>
                        </div>

                        <p
                            className="text-sm sm:text-lg md:text-2xl text-foreground/40 font-medium leading-relaxed mb-8 md:mb-16 max-w-3xl text-balance tracking-tight px-2"
                        >
                            Premium learning platform for the next generation of creators and engineers.
                            <span className="text-foreground/80 md:block"> Master modern skills. Build your future.</span>
                        </p>

                        <div
                            className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 w-full justify-center px-4"
                        >
                            <Link
                                to="/courses"
                                className="relative w-full sm:w-auto px-8 py-4 md:px-12 md:py-6 group"
                            >
                                <div className="absolute inset-0 bg-primary rounded-xl md:rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-1" />
                                <div className="absolute inset-0 bg-background translate-x-1 translate-y-1 rounded-xl md:rounded-2xl -z-10 group-hover:translate-x-2 group-hover:translate-y-2 transition-all" />
                                <span className="relative z-10 text-foreground font-black text-sm md:text-xl uppercase tracking-[0.15em] md:tracking-[0.2em] flex items-center justify-center gap-2 md:gap-3">
                                    Explore Courses
                                    <ArrowRight className="h-4 w-4 md:h-6 md:w-6 group-hover:translate-x-1 md:group-hover:translate-x-2 transition-transform" />
                                </span>
                            </Link>

                            <Link
                                to="/register"
                                className="relative w-full sm:w-auto px-8 py-4 md:px-12 md:py-6 group"
                            >
                                <div className="absolute inset-0 bg-card backdrop-blur-3xl border border-border rounded-xl md:rounded-2xl group-hover:bg-muted transition-all" />
                                <span className="relative z-10 text-foreground font-black text-sm md:text-xl uppercase tracking-[0.15em] md:tracking-[0.2em]">Join Now</span>
                            </Link>
                        </div>
                    </div>
                </div>

                {/* Animated Scroll Indicator */}
                <div
                    className="mt-auto pt-16 pb-8 hidden sm:flex flex-col items-center gap-4 opacity-40 hover:opacity-100 transition-opacity animate-bounce"
                >
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground">Scroll to Explore</span>
                    <div className="w-[1px] h-12 bg-gradient-to-b from-foreground to-transparent" />
                </div>
            </section>

            {/* Stats Section with Glassmorphic Floating Grid */}
            <FadeInScroll className="relative z-10 border-y border-border bg-background/40 backdrop-blur-3xl">
                <div className="container mx-auto px-4 md:px-6">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-card">
                        {stats.map((stat) => (
                            <div key={stat.label} className="bg-background/20 py-12 md:py-20 flex flex-col items-center justify-center text-center group hover:bg-white/[0.02] transition-colors">
                                <stat.icon className="h-6 w-6 text-primary mb-6 opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                                <span className="text-3xl md:text-6xl font-display font-black text-foreground mb-2 tracking-tighter group-hover:animate-pulse">{stat.value}</span>
                                <p className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-foreground/30">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </FadeInScroll>

            {/* Features Section - Hexagonal Grid Feel */}
            <FadeInScroll className="relative z-10 py-16 md:py-24 px-4 md:px-6">
                <div className="container mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10">
                        {features.map((feature, i) => (
                            <div
                                key={feature.title}
                                className="group relative p-8 md:p-12 rounded-[2rem] md:rounded-[3rem] bg-muted/30 border border-border backdrop-blur-xl hover:border-border transition-all duration-500 overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className={cn("h-12 w-12 md:h-16 md:w-16 rounded-xl md:rounded-2xl bg-background border border-border flex items-center justify-center mb-6 md:mb-10 group-hover:scale-110 group-hover:border-primary/50 transition-all duration-500 shadow-2xl", feature.color)}>
                                    <feature.icon className="h-6 w-6 md:h-8 md:w-8" />
                                </div>
                                <h3 className="text-xl md:text-3xl font-display font-black text-foreground mb-4 md:mb-6 uppercase tracking-wider group-hover:text-primary transition-colors">{feature.title}</h3>
                                <p className="text-foreground/40 text-base md:text-lg leading-relaxed font-medium group-hover:text-foreground/60 transition-colors">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </FadeInScroll>

            {/* Showcase Section with Depth Sorting */}
            <FadeInScroll className="relative z-10 py-16 md:py-24 px-4 md:px-6 bg-white/[0.02] border-y border-border">
                <div className="container mx-auto">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 md:gap-12 mb-16 md:mb-24">
                        <div className="max-w-3xl">
                            <span className="text-[8px] md:text-[10px] font-black text-primary uppercase tracking-[0.3em] md:tracking-[0.5em] mb-4 md:mb-6 block">Course Catalog</span>
                            <h2 className="text-4xl sm:text-6xl md:text-8xl font-display font-black tracking-tighter text-foreground mb-6 md:mb-8 leading-[0.85]">
                                RECENT<br /><span className="text-foreground/20 italic">COURSES_</span>
                            </h2>
                            <p className="text-foreground/40 text-base md:text-xl leading-relaxed max-w-xl font-medium">The newest curriculum modules designed for practical learning and immediate career impact.</p>
                        </div>
                        <Link to="/courses" className="flex items-center gap-4 group">
                            <span className="text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-foreground/50 group-hover:text-foreground transition-colors">Browse Academy</span>
                            <div className="h-10 w-10 md:h-14 md:w-14 flex items-center justify-center rounded-xl md:rounded-2xl bg-card border border-border group-hover:bg-primary group-hover:border-primary group-hover:rotate-12 transition-all duration-500">
                                <ArrowRight className="h-4 w-4 md:h-6 md:w-6 text-foreground" />
                            </div>
                        </Link>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {[1, 2, 3].map(i => (
                                <CourseCardSkeleton key={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12">
                            {featuredCourses?.map((course) => (
                                <CourseCard key={course._id} course={course} />
                            ))}
                        </div>
                    )}
                </div>
            </FadeInScroll>

            {/* CTA Section - The Singularity */}
            <FadeInScroll className="relative z-10 py-16 md:py-24 px-4 md:px-6">
                <div className="container mx-auto">
                    <div className="relative rounded-[2rem] md:rounded-[4rem] overflow-hidden p-8 sm:p-12 md:p-20 border border-border bg-background group">
                        {/* Interactive Background Effects */}
                        <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] dark:opacity-10" />
                        <div className="absolute -top-12 -right-12 md:-top-24 md:-right-24 h-[300px] w-[300px] md:h-[600px] md:w-[600px] bg-slate-200/50 dark:bg-primary/20 rounded-full blur-[80px] md:blur-[120px] group-hover:bg-slate-300/50 dark:group-hover:opacity-40 transition-all duration-500 animate-pulse" />
                        <div className="absolute -bottom-12 -left-12 md:-bottom-24 md:-left-24 h-[300px] w-[300px] md:h-[600px] md:w-[600px] bg-slate-100/80 dark:bg-secondary/20 rounded-full blur-[80px] md:blur-[120px] transition-opacity" />

                        <div className="relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto">
                            <h2 className="text-4xl sm:text-6xl md:text-8xl font-display font-black text-foreground mb-6 md:mb-10 tracking-tighter leading-none">
                                READY TO<br /><span className="text-primary group-hover:animate-glitch">BEGIN?</span>
                            </h2>
                            <p className="text-foreground/40 text-base sm:text-xl md:text-2xl mb-10 md:mb-16 font-medium leading-relaxed">Join a community of learners pushing the boundaries of what's possible in the digital world.</p>

                            <Link
                                to="/register"
                                className="group relative flex items-center justify-center px-8 py-4 md:px-12 md:py-5 bg-foreground text-background rounded-full font-bold text-sm md:text-lg tracking-widest uppercase transition-all duration-300 hover:scale-[1.02] hover:bg-foreground/90 active:scale-[0.98] shadow-sm hover:shadow-md"
                            >
                                <span>Join Now</span>
                            </Link>

                            <div className="mt-16 md:mt-24 flex flex-wrap justify-center gap-x-6 gap-y-4 md:gap-x-12 md:gap-y-6">
                                {[
                                    { label: 'Full Access', icon: CheckCircle2 },
                                    { label: 'Verified ID', icon: ShieldCheck },
                                    { label: 'Completed', icon: Sparkles },
                                ].map((item) => (
                                    <div key={item.label} className="flex items-center gap-2 md:gap-3 text-foreground/20 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.4em] group/item hover:text-foreground/80 transition-colors">
                                        <item.icon className="h-3 w-3 md:h-4 md:w-4 text-primary" />
                                        {item.label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </FadeInScroll>
        </div>
    );
}
