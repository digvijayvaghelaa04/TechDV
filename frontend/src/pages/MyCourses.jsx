import React from 'react';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Play, BookOpen, Clock, Sparkles, Layout, ChevronRight, Zap, RefreshCcw, AlertTriangle } from 'lucide-react';
import api from '../utils/api';
import { cn } from '../utils/utils';

import CourseCard from '../components/CourseCard';

const fetchMyEnrollments = async () => {
    try {
        const { data } = await api.get('/enrollments/me');
        return data.data || [];
    } catch (error) {
        console.error("Course Access Error:", error);
        throw new Error(error.response?.data?.error || "Failed to load your courses.");
    }
};

export default function MyCourses() {
    const { user } = useSelector((state) => state.auth);
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Helper to route to learning path
    const enrolmentToPlayerId = (enrol) => enrol?.course?._id ? `${enrol.course._id}/learn` : null;

    const { data: enrollments, isLoading, isError, error, refetch } = useQuery({
        queryKey: ['myEnrollments'],
        queryFn: fetchMyEnrollments,
        enabled: !!user,
        retry: 1
    });

    if (!user) {
        navigate('/login');
        return null;
    }

    if (isLoading) return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Loading your courses...</p>
        </div>
    );

    if (isError) return (
        <div className="min-h-screen bg-background flex items-center justify-center p-6">
            <div className="max-w-md w-full p-10 rounded-[3rem] bg-card border border-rose-500/20 text-center shadow-2xl">
                <div className="h-20 w-20 rounded-[2rem] bg-rose-500/10 flex items-center justify-center mx-auto mb-8">
                    <AlertTriangle className="h-8 w-8 text-rose-500" />
                </div>
                <h2 className="text-3xl font-display font-black mb-4">Error Loading Page</h2>
                <p className="text-muted-foreground mb-10 font-medium">
                    {error?.message || "Something went wrong. Failed to load your courses."}
                </p>
                <button
                    onClick={() => refetch()}
                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                >
                    Retry Link <RefreshCcw className="h-4 w-4" />
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-background pt-40 pb-20">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-[-5%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-[-5%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                <div className="max-w-7xl mx-auto">
                    {/* Header Section */}
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
                        <div>
                            <div
                                className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.3em] mb-4"
                            >
                                <Layout className="h-3 w-3" />
                                My Enrolled Courses
                            </div>
                            <h1
                                className="text-4xl md:text-6xl font-display font-black tracking-tight italic"
                            >
                                Enrolled <span className="text-primary not-italic">Courses</span>.
                            </h1>
                        </div>
                        <div
                            className="flex items-center gap-6"
                        >
                            <button
                                onClick={() => refetch()}
                                className="p-4 rounded-2xl bg-muted/50 border border-border text-muted-foreground hover:text-foreground transition-all flex items-center gap-2 group"
                            >
                                <RefreshCcw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest">Refresh</span>
                            </button>
                            <div className="h-12 w-px bg-border mx-2" />
                            <div className="flex flex-col items-end">
                                <span className="text-foreground text-2xl font-black font-display font-mono tracking-tighter italic">{enrollments?.length || 0}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Active Courses</span>
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-emerald-500 text-2xl font-black font-display font-mono tracking-tighter italic">{enrollments?.filter(e => e.isCompleted).length || 0}</span>
                                <span className="text-[10px] font-bold uppercase tracking-widest opacity-50">Completed</span>
                            </div>
                        </div>
                    </div>

                    {enrollments?.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                            {enrollments.map((enrol) => (
                                <div key={enrol._id}>
                                    <CourseCard
                                        course={{
                                            ...enrol.course,
                                            _id: enrolmentToPlayerId(enrol)
                                        }}
                                        progress={enrol.progress}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div
                            className="bg-card/50 border border-border border-dashed rounded-[3rem] p-20 text-center"
                        >
                            <div className="h-20 w-20 rounded-[2rem] bg-muted flex items-center justify-center mx-auto mb-8">
                                <BookOpen className="h-8 w-8 text-muted-foreground" />
                            </div>
                            <h2 className="text-3xl font-display font-black mb-4">No Active Courses</h2>
                            <p className="text-muted-foreground max-w-sm mx-auto mb-10 font-medium font-display leading-relaxed tracking-tight text-lg">You haven't enrolled in any courses yet. Start your learning journey today.</p>
                            <Link
                                to="/courses"
                                className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                Browse Academy <Sparkles className="h-4 w-4" />
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
