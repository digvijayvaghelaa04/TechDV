import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/api';
import {
    Clock,
    Award,
    Infinity as InfinityIcon,
    CheckCircle2,
    PlayCircle,
    ChevronLeft,
    Lock,
    Zap,
    ShieldCheck,
    CreditCard,
    Smartphone,
    Smartphone as UpiIcon,
    CheckCircle,
    Star,
    MessageSquare
} from 'lucide-react';
import { cn, getImgUrl, DEFAULT_COURSE_IMAGE, DEFAULT_AVATAR } from '../utils/utils';
import { useToast } from '../context/ToastContext';


const fetchCourse = async (id) => {
    const { data } = await api.get(`/courses/${id}`);
    return data.data;
};

const checkEnrollment = async (id) => {
    const { data } = await api.get('/enrollments/me');
    return data.data.some(e => e.course._id === id || e.course === id);
};

import { PageTransition } from '../components/PageTransition';

export default function CourseDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useSelector((state) => state.auth);

    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [paymentStep, setPaymentStep] = useState(1);
    const [paymentMethod, setPaymentMethod] = useState('upi');
    const [isPlayingPromo, setIsPlayingPromo] = useState(false);
    const { error: toastError } = useToast();

    // Queries
    const { data: course, isLoading: courseLoading } = useQuery({
        queryKey: ['course', id],
        queryFn: () => fetchCourse(id),
    });

    const { data: isEnrolled, isLoading: enrollmentLoading } = useQuery({
        queryKey: ['enrollment', id],
        queryFn: () => checkEnrollment(id),
        enabled: !!user,
    });

    // Mutation for Enrollment
    const enrollmentMutation = useMutation({
        mutationFn: async () => {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Premium feel delay
            await api.post('/orders', {
                orderItems: [{ course: id, price: course.price, title: course.title, thumbnail: course.thumbnail }],
                totalPrice: course.price
            });
        },
        onSuccess: () => {
            setPaymentStep(4);
            queryClient.invalidateQueries(['enrollment', id]);
            setTimeout(() => {
                setShowPaymentModal(false);
                navigate(`/course/${id}/learn`);
            }, 1500);
        },
        onError: (error) => {
            toastError(error.response?.data?.error || 'Execution failed. Try again.');
            setShowPaymentModal(false);
        }
    });

    if (courseLoading) return (
        <div className="w-full min-h-screen bg-background p-8 flex flex-col gap-8 animate-pulse">
            <div className="h-10 w-32 bg-card rounded-full" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                <div className="md:col-span-2 space-y-6">
                    <div className="h-20 w-3/4 bg-card rounded-2xl" />
                    <div className="h-40 w-full bg-card rounded-2xl" />
                </div>
                <div className="h-96 w-full bg-card rounded-[3rem]" />
            </div>
        </div>
    );

    const stats = [
        { label: 'Duration', value: course.estimatedDuration ? `${Math.round(course.estimatedDuration / 60)}h` : '12h', icon: Clock },
        { label: 'Course Access', value: 'Lifetime Access', icon: InfinityIcon },
        { label: 'Certificate', value: 'Verified Certificate', icon: Award },
        { label: 'Available on', value: 'Mobile + Desktop', icon: Smartphone },
    ];

    return (
        <PageTransition>
            <div className="min-h-screen bg-background pb-32 overflow-hidden relative">
                {/* Visual Engine Base */}
                <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-[2px]" />
                    <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[150px]" />
                    <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-secondary/10 rounded-full blur-[150px]" />
                    <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                </div>

                <div className="container mx-auto px-4 md:px-6 relative z-10 pt-16">
                    <Link
                        to="/courses"
                        className="inline-flex items-center gap-3 text-foreground/40 hover:text-foreground transition-colors mb-12 font-black text-[10px] uppercase tracking-[0.3em] group"
                    >
                        <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                        Return to Courses
                    </Link>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                        {/* Main Interface */}
                        <div className="lg:col-span-8 space-y-12">
                            <div>
                                <div
                                    className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-[10px] uppercase tracking-[0.3em] mb-8"
                                >
                                    <Zap className="h-3 w-3" />
                                    {course.category} Category
                                </div>

                                <h1
                                    className="text-4xl md:text-7xl font-display font-black tracking-tighter text-foreground mb-6 leading-[0.9] uppercase italic"
                                >
                                    {course.title}
                                </h1>

                                <div className="flex items-center gap-6 mb-8">
                                    <div className="flex items-center gap-1.5">
                                        {[1, 2, 3, 4, 5].map((star) => (
                                            <Star key={star} className={cn("h-4 w-4", star <= Math.round(course.averageRating || 0) ? "text-yellow-500 fill-current" : "text-foreground/10")} />
                                        ))}
                                        <span className="text-sm font-bold text-foreground ml-2">{course.averageRating || '0.0'}</span>
                                        <span className="text-sm text-foreground/30">({course.totalReviews || 0} reviews)</span>
                                    </div>
                                    <div className="h-4 w-px bg-muted" />
                                    <div className="text-sm font-bold text-secondary uppercase tracking-widest">{course.level || 'All Levels'}</div>
                                </div>

                                <p
                                    className="text-lg md:text-xl text-foreground/50 leading-relaxed font-medium max-w-3xl"
                                >
                                    {course.description}
                                </p>

                                <div
                                    className="flex flex-wrap items-center gap-12 mt-12 pt-12 border-t border-border"
                                >
                                    <div className="flex items-center gap-6 group">
                                        <div className="h-16 w-16 rounded-2xl bg-card border border-border flex items-center justify-center overflow-hidden shadow-xl group-hover:border-primary/50 transition-all duration-500">
                                            <img
                                                src={getImgUrl(course.instructor?.avatar, true)}
                                                alt=""
                                                className="h-full w-full object-cover"
                                                onError={(e) => {
                                                    e.target.onerror = null;
                                                    e.target.src = DEFAULT_AVATAR;
                                                }}
                                            />
                                        </div>
                                        <div>
                                            <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.3em] mb-1">Instructor</p>
                                            <p className="text-xl font-bold text-foreground">{course.instructor?.firstName} {course.instructor?.lastName || 'Expert'}</p>
                                        </div>
                                    </div>
                                    <div className="h-12 w-px bg-muted hidden sm:block" />
                                    <div className="hidden sm:block">
                                        <p className="text-[10px] text-foreground/30 font-black uppercase tracking-[0.3em] mb-1">Total Lessons</p>
                                        <p className="text-xl font-bold text-foreground">
                                            {course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0)} Lessons
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Curriculum Module */}
                            <div
                                className="bg-card/40 border border-border backdrop-blur-xl rounded-[3rem] p-8 md:p-12"
                            >
                                <div className="flex items-center justify-between mb-12">
                                    <h2 className="text-2xl font-display font-black tracking-tight text-foreground uppercase italic">Course Content</h2>
                                    <div className="px-4 py-2 rounded-xl bg-secondary/10 border border-secondary/20 text-secondary text-[10px] font-black uppercase tracking-[0.2em]">Video Lessons</div>
                                </div>

                                <div className="space-y-4">
                                    {course.modules && course.modules.length > 0 ? (
                                        course.modules.map((module, i) => (
                                            <div key={i} className="group relative overflow-hidden rounded-3xl bg-background/50 border border-border hover:bg-muted/30 transition-all duration-500 cursor-default">
                                                <div className="relative z-10 flex items-start gap-6 p-6">
                                                    <div className="h-12 w-12 rounded-xl bg-card/50 border border-border flex items-center justify-center font-mono font-bold text-foreground/40 group-hover:text-foreground group-hover:border-primary/50 transition-colors">
                                                        {String(i + 1).padStart(2, '0')}
                                                    </div>
                                                    <div className="flex-1 pt-1">
                                                        <h4 className="text-xl font-bold text-foreground mb-2 group-hover:text-secondary transition-colors">{module.title}</h4>
                                                        <div className="flex items-center gap-4 text-[10px] font-black text-foreground/30 uppercase tracking-widest">
                                                            <span className="flex items-center gap-2"><PlayCircle className="h-3 w-3" /> {module.lessons?.length || 0} Lessons</span>
                                                            <div className="h-1 w-1 rounded-full bg-border" />
                                                            <span className="flex items-center gap-2 text-primary font-black"><Lock className="h-3 w-3" /> Locked</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-20 border border-dashed border-border rounded-[2rem] bg-card">
                                            <Lock className="h-12 w-12 mx-auto mb-6 text-foreground/20" />
                                            <p className="text-foreground/40 font-medium italic">Content loading...</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Reviews Section */}
                            <div className="space-y-12">
                                <div className="flex items-center gap-4">
                                    <h2 className="text-3xl font-display font-black tracking-tight text-foreground uppercase italic">Ratings & Reviews</h2>
                                    <div className="h-px flex-1 bg-card" />
                                </div>

                                {course.totalReviews > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {/* Real reviews would be fetched here, showing a placeholder layout for now */}
                                        <div className="p-8 rounded-[2.5rem] bg-card border border-border">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center font-black text-primary">A</div>
                                                <div>
                                                    <p className="font-bold text-foreground uppercase tracking-tight">Aditya V.</p>
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-3 w-3 text-yellow-500 fill-current" />)}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-foreground/40 text-sm leading-relaxed">The best technical training I've ever experienced. The practical projects are game changers.</p>
                                        </div>
                                        <div className="p-8 rounded-[2.5rem] bg-card border border-border">
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center font-black text-secondary">S</div>
                                                <div>
                                                    <p className="font-bold text-foreground uppercase tracking-tight">Sneha R.</p>
                                                    <div className="flex items-center gap-1">
                                                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className="h-3 w-3 text-yellow-500 fill-current" />)}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-foreground/40 text-sm leading-relaxed">TechDV transformed my understanding of cloud architecture. Highly recommend this path.</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-20 text-center border border-dashed border-border rounded-[2rem] bg-card">
                                        <MessageSquare className="h-12 w-12 mx-auto mb-6 text-foreground/10" />
                                        <p className="text-foreground/30 font-bold uppercase tracking-widest text-xs">No reviews for this laboratory yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Transaction Terminal */}
                        <div className="lg:col-span-4 relative">
                            <div className="sticky top-32">
                                <div className="bg-card/60 border border-border backdrop-blur-2xl rounded-[3rem] p-8 overflow-hidden relative group">
                                    <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent animate-scanline opacity-50" />

                                    {/* Thumbnail Hologram & Promo Video */}
                                    <div className="relative aspect-video rounded-3xl overflow-hidden mb-10 border border-border group-hover:border-primary/50 transition-colors duration-500 bg-background">
                                        {isPlayingPromo && course.promoVideo ? (
                                            <video src={course.promoVideo} className="w-full h-full object-contain" controls autoPlay />
                                        ) : (
                                            <>
                                                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity z-10 mix-blend-overlay pointer-events-none" />
                                                <img
                                                    src={getImgUrl(course.thumbnail)}
                                                    alt=""
                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 filter grayscale group-hover:grayscale-0"
                                                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_COURSE_IMAGE; }}
                                                />
                                                {course.promoVideo && (
                                                    <div className="absolute inset-0 flex items-center justify-center cursor-pointer z-20" onClick={() => setIsPlayingPromo(true)}>
                                                        <div className="h-20 w-20 rounded-full bg-background/50 border border-border backdrop-blur-md flex items-center justify-center group-hover:scale-110 transition-transform hover:bg-primary text-foreground shadow-[0_0_30px_hsl(var(--primary)/0.5)]">
                                                            <PlayCircle className="h-8 w-8 text-foreground relative ml-1" />
                                                        </div>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    <div className="space-y-10">
                                        <div>
                                            <div className="flex items-baseline justify-between mb-6">
                                                <span className="text-5xl font-display font-black tracking-tighter text-foreground">₹{course.price}</span>
                                                <div className="px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-widest animate-pulse">Best Value</div>
                                            </div>

                                            {isEnrolled ? (
                                                <Link
                                                    to={`/course/${id}/learn`}
                                                    className="w-full h-20 flex items-center justify-center bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] shadow-[0_0_40px_-5px_hsl(var(--emerald-500)/0.4)]"
                                                >
                                                    Resume Course
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={() => user ? setShowPaymentModal(true) : navigate('/login')}
                                                    className="group relative w-full h-20 bg-foreground hover:bg-primary text-background hover:text-foreground font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all duration-500 overflow-hidden"
                                                >
                                                    <span className="relative z-10">Enroll Now</span>
                                                    <div className="absolute inset-0 bg-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="space-y-6 pt-10 border-t border-border">
                                            <p className="text-[10px] font-black text-foreground/20 uppercase tracking-[0.4em] mb-4">Course Details</p>
                                            {stats.map((stat) => (
                                                <div key={stat.label} className="flex items-center justify-between group/stat">
                                                    <div className="flex items-center gap-4 text-foreground/40 group-hover/stat:text-foreground transition-colors">
                                                        <stat.icon className="h-4 w-4" />
                                                        <span className="text-xs font-bold uppercase tracking-wider">{stat.label}</span>
                                                    </div>
                                                    <span className="text-xs font-black text-foreground">{stat.value}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="p-4 rounded-2xl bg-card border border-border flex items-center justify-center gap-3 text-[10px] font-black text-foreground/40 uppercase tracking-widest">
                                            <ShieldCheck className="h-4 w-4 text-emerald-500" />
                                            Secure Payment
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cinematic Payment Modal */}
                {showPaymentModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div
                            onClick={() => enrollmentMutation.isLoading ? null : setShowPaymentModal(false)}
                            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
                        />

                        <div className="relative w-full max-w-xl bg-background border border-border rounded-[3rem] shadow-2xl overflow-hidden p-8 md:p-12">
                            <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
                                <CreditCard className="h-48 w-48 text-foreground rotate-12" />
                            </div>

                            {paymentStep < 4 && (
                                <div className="flex items-center justify-between mb-12 relative z-10">
                                    <div>
                                        <h3 className="text-3xl font-display font-black text-foreground uppercase italic">Checkout</h3>
                                        <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.2em] mt-2">Secure Payment Gateway</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-3xl font-black text-primary">₹{course.price}</p>
                                        <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.2em] mt-2">Total</p>
                                    </div>
                                </div>
                            )}

                            {paymentStep === 1 && (
                                <div className="space-y-6 relative z-10">
                                    <div className="grid gap-4">
                                        {['upi', 'card'].map((method) => (
                                            <button
                                                key={method}
                                                onClick={() => setPaymentMethod(method)}
                                                className={cn(
                                                    "flex items-center justify-between p-6 rounded-3xl border transition-all duration-300 group",
                                                    paymentMethod === method
                                                        ? "bg-foreground text-background border-foreground shadow-[0_0_30px_-5px_hsl(var(--foreground)/0.3)] scale-[1.02]"
                                                        : "bg-card border-border text-foreground/40 hover:bg-muted hover:text-foreground"
                                                )}
                                            >
                                                <div className="flex items-center gap-6">
                                                    <div className={cn(
                                                        "h-12 w-12 rounded-2xl flex items-center justify-center transition-colors",
                                                        paymentMethod === method ? "bg-background text-foreground" : "bg-muted text-foreground/40"
                                                    )}>
                                                        {method === 'upi' ? <UpiIcon className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                                                    </div>
                                                    <div className="text-left"><p className="font-black text-sm uppercase tracking-wider">{method === 'upi' ? 'UPI' : 'Credit Card'}</p></div>
                                                </div>
                                                {paymentMethod === method && <div className="h-4 w-4 bg-primary rounded-full animate-pulse" />}
                                            </button>
                                        ))}
                                    </div>
                                    <button onClick={() => setPaymentStep(2)} className="w-full h-16 mt-8 bg-primary text-foreground font-black text-[10px] uppercase tracking-[0.3em] rounded-3xl hover:opacity-90 transition-all active:scale-95">Confirm Method</button>
                                </div>
                            )}

                            {paymentStep === 2 && (
                                <div className="space-y-8 relative z-10 animate-fade-in-up">
                                    <button onClick={() => setPaymentStep(1)} className="text-[10px] font-black text-foreground/40 hover:text-foreground uppercase tracking-[0.2em] flex items-center gap-2 transition-colors"><ChevronLeft className="h-3 w-3" /> Back</button>
                                    <div className="space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.3em] ml-2">{paymentMethod === 'upi' ? 'VPA Address' : 'Card Number'}</label>
                                            <input type="text" placeholder={paymentMethod === 'upi' ? "user@upi" : "0000 0000 0000 0000"} className="w-full bg-card border border-border rounded-2xl p-6 font-bold text-lg text-foreground placeholder:text-foreground/10 focus:outline-none focus:border-primary transition-all" />
                                        </div>
                                        {paymentMethod === 'card' && (
                                            <div className="grid grid-cols-2 gap-6">
                                                <input type="text" placeholder="MM/YY" className="bg-card border border-border rounded-2xl p-6 font-bold text-lg text-foreground placeholder:text-foreground/10 focus:outline-none focus:border-primary transition-all" />
                                                <input type="password" placeholder="CVC" className="bg-card border border-border rounded-2xl p-6 font-bold text-lg text-foreground placeholder:text-foreground/10 focus:outline-none focus:border-primary transition-all" />
                                            </div>
                                        )}
                                    </div>
                                    <button onClick={() => setPaymentStep(3)} className="w-full h-16 bg-foreground text-background font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:bg-foreground/90 transition-all active:scale-95 shadow-xl">Authorize Payment</button>
                                </div>
                            )}

                            {paymentStep === 3 && (
                                <div className="py-12 text-center flex flex-col items-center relative z-10">
                                    {enrollmentMutation.isLoading ? (
                                        <div className="flex flex-col items-center">
                                            <div className="h-24 w-24 border-4 border-border border-t-primary rounded-full animate-spin mb-8" />
                                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tighter mb-2">Processing</h3>
                                            <p className="text-foreground/40 text-xs font-bold uppercase tracking-widest animate-pulse">Completing transaction...</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center w-full">
                                            <div className="h-24 w-24 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center animate-pulse mb-8"><ShieldCheck className="h-10 w-10 text-primary" /></div>
                                            <h3 className="text-3xl font-black text-foreground uppercase italic mb-4">Final Authorization</h3>
                                            <p className="text-foreground/40 text-sm font-medium px-8 mb-10 max-w-sm">Confirm transaction of ₹{course.price} to initialize laboratory access.</p>
                                            <button onClick={() => enrollmentMutation.mutate()} className="w-full h-16 bg-primary text-foreground font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl hover:scale-[1.02] transition-all shadow-[0_0_50px_-10px_hsl(var(--primary)/0.5)]">Execute</button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {paymentStep === 4 && (
                                <div className="py-12 text-center flex flex-col items-center animate-scale-in relative z-10">
                                    <div className="h-32 w-32 rounded-full bg-emerald-500 flex items-center justify-center shadow-[0_0_60px_-10px_rgba(16,185,129,0.5)] mb-8"><CheckCircle className="h-16 w-16 text-emerald-950" /></div>
                                    <h3 className="text-4xl font-display font-black text-foreground uppercase italic mb-4">Enrollment Successful</h3>
                                    <p className="text-emerald-400 font-bold uppercase tracking-widest text-xs">Taking you to your course...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </PageTransition>
    );
}
