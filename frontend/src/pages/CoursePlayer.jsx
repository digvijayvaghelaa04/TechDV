import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ReactPlayer from 'react-player';
import confetti from 'canvas-confetti';
import {
    PlayCircle,
    CheckCircle2,
    ChevronLeft,
    LayoutList,
    FileText,
    Lock,
    Zap,
    Clock,
    Settings,
    ChevronDown,
    Check,
    CheckCircle,
    XCircle,
    ShieldCheck
} from 'lucide-react';
import { cn } from '../utils/utils';
import api from '../utils/api';
import { useToast } from '../context/ToastContext';
import { PageTransition } from '../components/PageTransition';

// API Functions
const fetchCoursePlayer = async (id) => {
    const { data } = await api.get(`/courses/${id}`);
    return data.data;
};

const fetchProgress = async (courseId) => {
    const { data } = await api.get(`/progress/${courseId}`);
    return data.data;
};

export default function CoursePlayer() {
    const { id: courseId } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { success, error: toastError } = useToast();
    const { user } = useSelector((state) => state.auth);

    const [currentLesson, setCurrentLesson] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const playerRef = useRef(null);

    // Queries
    const { data: course, isLoading: courseLoading } = useQuery({
        queryKey: ['coursePlayer', courseId],
        queryFn: () => fetchCoursePlayer(courseId),
    });

    const { data: progress, isLoading: progressLoading } = useQuery({
        queryKey: ['progress', courseId],
        queryFn: () => fetchProgress(courseId),
        enabled: !!courseId,
    });

    // Mutations
    const completeMutation = useMutation({
        mutationFn: (lessonId) => api.post(`/progress/${courseId}/lesson/${lessonId}/complete`),
        onSuccess: () => {
            queryClient.invalidateQueries(['progress', courseId]);
            confetti({
                particleCount: 150,
                spread: 80,
                origin: { y: 0.6 },
                colors: ['#ff003c', '#ffffff', '#00e5ff']
            });
            success('Lesson completed successfully.');
        },
        onError: () => toastError('Failed to sync progress.')
    });

    const watchMutation = useMutation({
        mutationFn: ({ lessonId, position }) => api.post(`/progress/${courseId}/lesson/${lessonId}/watch`, { position }),
    });

    // Effect to set initial lesson
    useEffect(() => {
        if (course?.modules?.length > 0 && !currentLesson) {
            // Check if there's a last watched lesson
            if (progress?.lastWatchedLesson) {
                // Find that lesson in the modules
                let found = false;
                course.modules.forEach(m => {
                    const l = m.lessons.find(lesson => lesson._id === progress.lastWatchedLesson);
                    if (l) {
                        setCurrentLesson(l);
                        found = true;
                    }
                });
                if (!found) setCurrentLesson(course.modules[0].lessons[0]);
            } else {
                setCurrentLesson(course.modules[0].lessons[0]);
            }
        }
    }, [course, progress]);

    // Anti-Piracy Protection Measures
    useEffect(() => {
        const handleContextMenu = (e) => e.preventDefault();

        const handleKeyDown = (e) => {
            // Prevent F12, Ctrl+Shift+I, Ctrl+Shift+C, Ctrl+Shift+J, Ctrl+U, Ctrl+S
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.key === 'J' || e.key === 'j' || e.key === 'C' || e.key === 'c')) ||
                (e.ctrlKey && (e.key === 'U' || e.key === 'u' || e.key === 'S' || e.key === 's'))
            ) {
                e.preventDefault();
                return false;
            }
        };

        // Add event listeners for the document block
        document.addEventListener('contextmenu', handleContextMenu);
        document.addEventListener('keydown', handleKeyDown);

        return () => {
            document.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, []);

    // Handle video progress
    const handleProgress = (state) => {
        // Only update every 10 seconds or so to avoid spamming the API
        if (Math.round(state.playedSeconds) % 10 === 0 && currentLesson) {
            watchMutation.mutate({ lessonId: currentLesson._id, position: state.playedSeconds });
        }

        // Auto-complete if at 95%
        if (state.played >= 0.95 && currentLesson && !progress?.completedLessons?.includes(currentLesson._id)) {
            completeMutation.mutate(currentLesson._id);
        }
    };

    if (courseLoading || !course) return (
        <div className="h-screen bg-background flex items-center justify-center">
            <div className="h-12 w-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
    );

    const isCompleted = (lessonId) => progress?.completedLessons?.includes(lessonId);
    const progressPercent = progress?.progressPercentage || 0;

    // Format media URLs because they might be relative to backend
    const getMediaUrl = (url) => {
        if (!url) return '';
        const tokenToken = localStorage.getItem('token') ? localStorage.getItem('token').replace(/"/g, '') : '';
        let mediaUrl = url;
        if (url.startsWith('/')) {
            mediaUrl = import.meta.env.VITE_API_URL.replace('/api/v1', '') + url;
        }
        return `${mediaUrl}?token=${encodeURIComponent(tokenToken)}`;
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '12:00';
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <PageTransition>
            <div className="h-screen bg-background flex flex-col md:flex-row overflow-hidden relative">
                {/* Background Ambience */}
                <div className="absolute inset-0 pointer-events-none z-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[120px]" />
                </div>
                {/* Sidebar: Curriculum Protocol */}
                {isSidebarOpen && (
                    <div
                        className="md:w-96 bg-card/60 backdrop-blur-2xl border-r border-border flex flex-col h-full z-20 relative"
                    >
                        <div className="p-8 border-b border-border bg-background/20">
                            <button
                                onClick={() => navigate(`/course/${courseId}`)}
                                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 hover:text-foreground transition-colors mb-8 group"
                            >
                                <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                Mission Dashboard
                            </button>
                            <h2 className="text-2xl font-display font-black tracking-tight mb-6 italic text-foreground leading-tight">{course.title}</h2>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.3em]">
                                    <span className="text-foreground/40">Synchronization</span>
                                    <span className="text-primary">{progressPercent}%</span>
                                </div>
                                <div className="h-1.5 w-full bg-muted/30 rounded-full overflow-hidden p-[1px] border border-border/50">
                                    <div
                                        style={{ width: `${progressPercent}%` }}
                                        className="h-full bg-primary rounded-full shadow-[0_0_10px_hsl(var(--primary)/0.5)] transition-all duration-1000"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {course.modules?.map((module, mIdx) => (
                                <div key={mIdx} className="border-b border-border/50">
                                    <div className="px-6 py-4 bg-muted/20 flex items-center justify-between">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Module {mIdx + 1}</span>
                                        <span className="text-[10px] font-mono opacity-50">{module.lessons?.length} Lessons</span>
                                    </div>
                                    <div className="px-6 py-2 bg-muted/10 font-bold text-xs uppercase tracking-tight text-foreground/80 border-b border-border/20">
                                        {module.title}
                                    </div>
                                    <div>
                                        {module.lessons?.map((lesson, lIdx) => (
                                            <button
                                                key={lIdx}
                                                onClick={() => setCurrentLesson(lesson)}
                                                className={cn(
                                                    "group w-full px-8 py-6 flex items-start gap-4 text-left transition-all border-l-4 relative overflow-hidden",
                                                    currentLesson?._id === lesson?._id
                                                        ? "bg-primary/5 border-primary"
                                                        : "border-transparent hover:bg-muted/30"
                                                )}
                                            >
                                                {currentLesson?._id === lesson?._id && (
                                                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-transparent pointer-events-none" />
                                                )}
                                                <div className={cn(
                                                    "h-8 w-8 rounded-xl flex items-center justify-center mt-0.5 border-2 transition-all shrink-0 relative z-10",
                                                    isCompleted(lesson._id)
                                                        ? "bg-emerald-500 border-emerald-500 text-emerald-950"
                                                        : currentLesson?._id === lesson?._id
                                                            ? "bg-primary border-primary text-foreground shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                                                            : "border-border text-foreground/20 bg-background group-hover:border-foreground/30"
                                                )}>
                                                    {isCompleted(lesson._id) ? <Check className="h-4 w-4 stroke-[3px]" /> : currentLesson?._id === lesson?._id ? <PlayCircle className="h-4 w-4" /> : <span className="text-[10px] font-black">{lIdx + 1}</span>}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className={cn("text-sm font-bold truncate", currentLesson?._id === lesson?._id ? "text-foreground" : "text-muted-foreground")}>
                                                        {lesson.title}
                                                    </p>
                                                    <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-muted-foreground/60 uppercase">
                                                        <Clock className="h-3 w-3" /> {formatDuration(lesson.videoDuration)}
                                                        <span className="h-1 w-1 rounded-full bg-border" />
                                                        <span className={isCompleted(lesson._id) ? "text-emerald-500" : ""}>
                                                            {isCompleted(lesson._id) ? "Completed" : "Lesson"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Main Player Engine */}
                <div className="flex-1 flex flex-col relative bg-background">
                    {/* Top Control Bar */}
                    <div className="h-16 border-b border-border bg-background/60 backdrop-blur-xl flex items-center justify-between px-6 z-10">
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-3 bg-muted/20 hover:bg-muted/40 rounded-xl transition-all text-foreground border border-border/50 active:scale-95"
                        >
                            <LayoutList className="h-4 w-4" />
                        </button>

                        <div className="flex items-center gap-4">
                            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-[8px] font-black uppercase tracking-[0.2em] text-primary">
                                <span className="h-1.5 w-1.5 bg-primary rounded-full animate-pulse" />
                                Active Signal
                            </div>
                            <div className="h-6 w-[1px] bg-border" />
                            <button className="text-foreground/30 hover:text-foreground transition-colors p-2"><Settings className="h-4 w-4" /></button>
                        </div>
                    </div>

                    {/* Video/Content Surface */}
                    <div className="flex-1 relative group overflow-hidden bg-[#050505] flex flex-col">
                        {!currentLesson ? (
                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-12">
                                <div className="h-24 w-24 rounded-[2rem] bg-primary/10 border border-primary/20 flex items-center justify-center mb-8 animate-pulse">
                                    <Lock className="h-10 w-10 text-primary" />
                                </div>
                                <h3 className="text-3xl font-display font-black text-foreground italic mb-4">Select a Lesson</h3>
                                <p className="text-muted-foreground max-w-md">Choose a lesson from the sidebar to start learning.</p>
                            </div>
                        ) : (
                            <div className="w-full h-full flex flex-col" style={{ userSelect: 'none' }}>
                                {currentLesson.type === 'video' ? (
                                    <div className="w-full h-full relative group/video">
                                        <video
                                            ref={playerRef}
                                            src={getMediaUrl(currentLesson.videoUrl)}
                                            className="w-full h-full outline-none"
                                            controls
                                            controlsList="nodownload"
                                            autoPlay
                                            onTimeUpdate={(e) => handleProgress({ playedSeconds: e.target.currentTime, played: e.target.currentTime / e.target.duration })}
                                            onEnded={() => completeMutation.mutate(currentLesson._id)}
                                        >
                                            Your browser does not support the video tag.
                                        </video>

                                        {/* Dynamic User Watermark Overlay */}
                                        <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-[100] transition-opacity duration-1000 opacity-20">
                                            <div
                                                className="text-foreground text-3xl font-black uppercase tracking-[0.5em] whitespace-nowrap transform -rotate-45"
                                                style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.8)' }}
                                            >
                                                DO NOT SHARE - {user?.email} - {user?._id}
                                            </div>
                                        </div>
                                        <div className="absolute top-10 right-10 pointer-events-none flex items-center justify-center overflow-hidden z-[100] opacity-30">
                                            <div className="text-foreground text-xs font-mono drop-shadow-[0_2px_2px_rgba(0,0,0,1)]">
                                                UID: {user?._id}
                                            </div>
                                        </div>
                                    </div>
                                ) : currentLesson.type === 'article' || currentLesson.type === 'text' ? (
                                    <div className="flex-1 overflow-y-auto p-12 md:p-20 bg-background text-foreground selection:bg-primary/30">
                                        <div className="max-w-4xl mx-auto">
                                            <div className="flex items-center gap-3 mb-10">
                                                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                                    <FileText className="h-5 w-5" />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/30">Scientific Article</span>
                                            </div>
                                            <h1 className="text-4xl md:text-6xl font-display font-black tracking-tight mb-12 italic">{currentLesson.title}</h1>
                                            <div className="prose prose-invert prose-lg max-w-none text-foreground/60 font-medium leading-[2] tracking-wide first-letter:text-7xl first-letter:font-black first-letter:text-primary first-letter:mr-3 first-letter:float-left">
                                                {currentLesson.content || "Initializing content protocol..."}
                                            </div>

                                            <div className="mt-20 pt-10 border-t border-border flex justify-center">
                                                <button
                                                    onClick={() => completeMutation.mutate(currentLesson._id)}
                                                    className="px-12 py-5 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-primary hover:text-foreground transition-all shadow-[0_0_50px_-10px_rgba(255,255,255,0.2)]"
                                                >
                                                    Mark Lesson as Read
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ) : currentLesson.type === 'pdf' ? (
                                    <div className="flex-1 flex flex-col bg-muted">
                                        <div className="bg-background/40 p-4 border-b border-border flex justify-between items-center">
                                            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/30">Resource: Secured PDF Document</span>
                                            <a href={currentLesson.resources?.length > 0 ? getMediaUrl(currentLesson.resources[0].url) : getMediaUrl(currentLesson.videoUrl)} download target="_blank" className="text-[10px] font-black text-primary hover:text-foreground transition-colors uppercase tracking-widest bg-primary/10 px-4 py-2 rounded-lg border border-primary/20">Download PDF</a>
                                        </div>
                                        <iframe
                                            src={currentLesson.resources?.length > 0 ? getMediaUrl(currentLesson.resources[0].url) : getMediaUrl(currentLesson.videoUrl)}
                                            className="flex-1 w-full border-none"
                                            title="PDF Viewer"
                                        />
                                    </div>
                                ) : currentLesson.type === 'quiz' ? (
                                    <QuizEngine
                                        lesson={currentLesson}
                                        onComplete={() => completeMutation.mutate(currentLesson._id)}
                                    />
                                ) : null}
                            </div>
                        )}

                        {/* Player Overlays */}
                        <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>

                    {/* Bottom Metadata & Controls */}
                    <div className="bg-card/40 backdrop-blur-3xl border-t border-border p-10 md:px-16 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
                        <div className="max-w-xl">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black uppercase tracking-widest text-primary">
                                    <Zap className="h-3 w-3" /> Unit Active
                                </div>
                                {isCompleted(currentLesson?._id) && (
                                    <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-500">
                                        <CheckCircle className="h-3 w-3" /> Completed
                                    </div>
                                )}
                            </div>
                            <h3 className="text-3xl md:text-4xl font-display font-black tracking-tight uppercase italic text-foreground mb-4">{currentLesson?.title || "Initialize Unit..."}</h3>
                            <p className="text-foreground/40 text-sm leading-relaxed font-medium">
                                {course.description}
                            </p>
                            {/* Notes / Resources Display */}
                            {currentLesson?.resources?.length > 0 && (
                                <div className="mt-10 flex flex-wrap gap-3">
                                    {currentLesson.resources.map((res, i) => (
                                        <a
                                            key={i}
                                            href={getMediaUrl(res.url)}
                                            target="_blank"
                                            rel="noreferrer"
                                            download
                                            className="group flex items-center gap-3 px-6 py-3 bg-muted/30 hover:bg-primary hover:text-foreground text-foreground/60 border border-border rounded-2xl transition-all text-[10px] font-black uppercase tracking-widest"
                                        >
                                            <FileText className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                            {res.title || 'Download Notes'}
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <button className="flex-1 md:flex-none px-10 h-20 bg-muted/40 border border-border rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] hover:bg-muted transition-all active:scale-95 text-foreground/60">
                                Add Note
                            </button>
                            <button
                                disabled={isCompleted(currentLesson?._id) || completeMutation.isPending}
                                onClick={() => completeMutation.mutate(currentLesson._id)}
                                className={cn(
                                    "flex-1 md:flex-none px-12 h-20 rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 active:scale-95",
                                    isCompleted(currentLesson?._id)
                                        ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                                        : "bg-foreground text-background hover:bg-primary hover:text-foreground shadow-[0_20px_40px_-10px_rgba(255,255,255,0.1)] hover:shadow-primary/20"
                                )}
                            >
                                {isCompleted(currentLesson?._id) ? "Completed" : "Initialize Completion"}
                                {isCompleted(currentLesson?._id) ? <Check className="h-4 w-4 stroke-[3px]" /> : <ShieldCheck className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </PageTransition>
    );
}

// --- Quiz Engine Component ---
const QuizEngine = ({ lesson, onComplete }) => {
    const [started, setStarted] = useState(false);
    const [currentQ, setCurrentQ] = useState(0);
    const [selected, setSelected] = useState(null);
    const [score, setScore] = useState(0);
    const [showResults, setShowResults] = useState(false);
    const [feedback, setFeedback] = useState(null); // 'correct' | 'wrong'

    const questions = (lesson.quizQuestions && lesson.quizQuestions.length > 0) ? lesson.quizQuestions : [
        {
            question: "Technical Diagnostic: What is the primary purpose of this architecture?",
            options: ["Data Isolation", "Synchronous Protocol", "Neural Mapping", "System Integrity"],
            correctAnswer: 3,
            explanation: "System Integrity ensures the stability of the entire network."
        },
        {
            question: "Which component handles data flow transitions?",
            options: ["The Core", "Gatekeeper", "Data Stream", "Bus Interface"],
            correctAnswer: 1,
            explanation: "The Gatekeeper manages all entry and exit signals."
        }
    ];

    const handleStart = () => setStarted(true);

    const handleSelect = (idx) => {
        if (feedback) return;
        setSelected(idx);

        if (idx === questions[currentQ].correctAnswer) {
            setFeedback('correct');
            setScore(prev => prev + 1);
        } else {
            setFeedback('wrong');
        }

        setTimeout(() => {
            if (currentQ < questions.length - 1) {
                setCurrentQ(prev => prev + 1);
                setSelected(null);
                setFeedback(null);
            } else {
                setShowResults(true);
            }
        }, 1500);
    };

    if (!started) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background p-12">
                <div className="max-w-2xl w-full text-center p-12 px-16 rounded-[4rem] bg-card border border-border backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-scanline" />
                    <div className="relative z-10">
                        <Zap className="h-24 w-24 text-primary mx-auto mb-10 animate-pulse drop-shadow-[0_0_20px_rgba(255,0,60,0.5)]" />
                        <h2 className="text-5xl font-display font-black text-foreground italic mb-6 tracking-tight uppercase">Diagnostic Test</h2>
                        <p className="text-foreground/40 mb-12 font-medium text-lg leading-relaxed">
                            Initializing evaluation protocol for: <br />
                            <span className="text-foreground font-black">{lesson.title}</span>
                        </p>
                        <button
                            onClick={handleStart}
                            className="px-20 py-7 bg-white text-black font-black uppercase tracking-[0.4em] text-sm rounded-3xl hover:bg-primary hover:text-foreground transition-all transform hover:scale-105 active:scale-95 shadow-[0_20px_50px_-10px_rgba(255,255,255,0.2)]"
                        >
                            Start Neural Sync
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (showResults) {
        const passed = score / questions.length >= 0.7;
        return (
            <div className="flex-1 flex items-center justify-center bg-background p-12">
                <div className="max-w-3xl w-full text-center p-16 rounded-[4rem] bg-muted/50 border border-border backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                    <div className={`absolute top-0 inset-x-0 h-2 bg-gradient-to-r ${passed ? 'from-emerald-500 to-cyan-500' : 'from-rose-500 to-primary'}`} />

                    <div className="relative z-10">
                        <div className={`h-32 w-32 rounded-full mx-auto mb-10 flex items-center justify-center border-4 ${passed ? 'border-emerald-500/30 bg-emerald-500/10' : 'border-rose-500/30 bg-rose-500/10'} shadow-2xl`}>
                            {passed ? <CheckCircle className="h-16 w-16 text-emerald-500" /> : <XCircle className="h-16 w-16 text-rose-500" />}
                        </div>

                        <h2 className="text-6xl font-display font-black text-foreground mb-4 italic uppercase tracking-tighter">
                            {passed ? 'Sync Complete' : 'Sync Failed'}
                        </h2>

                        <div className="grid grid-cols-2 gap-8 mb-16 max-w-sm mx-auto">
                            <div className="p-6 rounded-3xl bg-card border border-border">
                                <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mb-1">Score</p>
                                <p className="text-4xl font-display font-black text-foreground">{Math.round((score / questions.length) * 100)}%</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-card border border-border">
                                <p className="text-[10px] font-black text-foreground/20 uppercase tracking-widest mb-1">Accuracy</p>
                                <p className="text-4xl font-display font-black text-foreground">{score}/{questions.length}</p>
                            </div>
                        </div>

                        {passed ? (
                            <button
                                onClick={onComplete}
                                className="px-16 py-7 bg-emerald-500 text-emerald-950 font-black uppercase tracking-[0.4em] text-sm rounded-3xl hover:bg-emerald-400 transition-all transform hover:scale-105 active:scale-95 shadow-[0_20px_60px_-15px_rgba(16,185,129,0.5)]"
                            >
                                Finalize Unit
                            </button>
                        ) : (
                            <button
                                onClick={() => {
                                    setStarted(false);
                                    setCurrentQ(0);
                                    setScore(0);
                                    setShowResults(false);
                                    setFeedback(null);
                                    setSelected(null);
                                }}
                                className="px-16 py-7 bg-rose-500 text-foreground font-black uppercase tracking-[0.4em] text-sm rounded-3xl hover:bg-rose-400 transition-all"
                            >
                                Re-initialize Protocol
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    const q = questions[currentQ];

    return (
        <div className="flex-1 flex items-center justify-center bg-background p-6 md:p-12">
            <div className="max-w-4xl w-full">
                <div className="p-10 md:p-16 rounded-[4rem] bg-muted/50 border border-border backdrop-blur-3xl shadow-2xl relative overflow-hidden">
                    <h2 className="text-3xl md:text-4xl font-display font-black text-foreground mb-16 tracking-tight leading-tight uppercase italic relative z-10">
                        {q.question}
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                        {q.options.map((option, idx) => (
                            <button
                                key={idx}
                                onClick={() => handleSelect(idx)}
                                disabled={feedback !== null}
                                className={`
                                    p-8 rounded-3xl border text-left transition-all duration-300 group
                                    ${selected === idx
                                        ? (feedback === 'correct' ? 'bg-emerald-500/20 border-emerald-500 shadow-[0_0_30px_rgba(16,185,129,0.3)]' : 'bg-rose-500/20 border-rose-500 shadow-[0_0_30px_rgba(255,0,60,0.3)]')
                                        : 'bg-card border-border hover:border-primary/50 hover:bg-muted'
                                    }
                                `}
                            >
                                <div className="flex items-center justify-between gap-4">
                                    <span className={`text-lg font-bold ${selected === idx ? 'text-foreground' : 'text-foreground/60 group-hover:text-foreground'}`}>{option}</span>
                                    {selected === idx && (
                                        feedback === 'correct' ? <CheckCircle className="h-6 w-6 text-emerald-500" /> : <XCircle className="h-6 w-6 text-rose-500" />
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {feedback && (
                        <div className={`mt-12 p-8 rounded-3xl border animate-in fade-in slide-in-from-bottom-5 duration-500 ${feedback === 'correct' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                            <p className="text-[10px] font-black uppercase tracking-widest mb-2">Protocol Instruction</p>
                            <p className="font-bold text-sm leading-relaxed italic">{q.explanation}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
