import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Mail, Users, TrendingUp, ShieldCheck, Zap, Laptop, ArrowRight, Video } from 'lucide-react';
import { cn } from '../utils/utils';
import api from '../utils/api';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const SimplePage = ({ title, subtitle, content, icon: Icon = Sparkles }) => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen pt-40 pb-32 px-4 relative overflow-hidden bg-background">
            {/* Immersive Background */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-0 right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px]" />
                <div className="absolute bottom-0 left-[-10%] w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[140px]" />
            </div>

            <div className="container mx-auto max-w-5xl relative z-10">
                <div
                    className="text-center mb-20"
                >
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-6">
                        <Icon className="h-3 w-3" />
                        TechDV Education
                    </div>
                    <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-tight mb-8">
                        {title} <span className="text-primary italic">Academy</span>.
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-medium">
                        {subtitle}
                    </p>
                </div>

                <div
                    className="p-10 md:p-16 rounded-[4rem] bg-card/40 border border-border backdrop-blur-2xl shadow-2xl"
                >
                    <div className="prose prose-invert prose-primary max-w-none text-muted-foreground leading-loose">
                        {content}
                    </div>
                </div>
            </div>
        </div>
    );
};

export const About = () => (
    <SimplePage
        title="Elite"
        subtitle="We are on a mission to democratize premium education for the next generation of creative technologists."
        icon={Zap}
        content={
            <div className="space-y-12">
                <section>
                    <h2 className="text-3xl font-display font-bold text-foreground mb-6">Our DNA</h2>
                    <p className="text-lg">TechDV was born from the belief that curiosity shouldn't be gated by geographical or financial barriers. We use cutting-edge technology to create an immersive learning environment that feels less like a classroom and more like a collective journey.</p>
                </section>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 rounded-3xl bg-muted/30 border border-border">
                        <h3 className="text-xl font-bold mb-4 text-primary">Open Access</h3>
                        <p className="text-sm leading-relaxed">Curating the world's most specialized knowledge and making it accessible to anyone with an internet connection.</p>
                    </div>
                    <div className="p-8 rounded-3xl bg-muted/30 border border-border">
                        <h3 className="text-xl font-bold mb-4 text-secondary">Elite Execution</h3>
                        <p className="text-sm leading-relaxed">Beyond theory. We focus on industrial-grade skills that drive real-world output.</p>
                    </div>
                </div>
            </div>
        }
    />
);

export const Careers = () => (
    <SimplePage
        title="Pricing"
        subtitle="Join our global team and help shape the future of asynchronous learning."
        icon={TrendingUp}
        content={
            <div className="text-center py-20">
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-8">
                    <TrendingUp className="h-10 w-10 text-primary" />
                </div>
                <h2 className="text-3xl font-display font-bold text-foreground mb-4 italic">No Current Openings</h2>
                <p className="text-lg max-w-md mx-auto">We are currently operating at full capacity, but we are always looking for visionary educators.</p>
                <button className="mt-12 px-10 py-4 bg-foreground text-background font-black rounded-2xl hover:scale-105 transition-all">Send Manifest</button>
            </div>
        }
    />
);

export const Contact = () => (
    <SimplePage
        title="Contact"
        subtitle="Have questions? Reach out to our support team."
        icon={Mail}
        content={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-16">
                <div className="space-y-10">
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6">Email Support</h3>
                        <div className="space-y-4">
                            <p className="flex items-center gap-4 text-foreground font-bold italic text-sm break-all"><Mail className="h-5 w-5 text-muted-foreground shrink-0" /> the.techdv.ceo1@gmail.com</p>
                        </div>
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-widest text-primary mb-6">HQ Coordinates</h3>
                        <p className="text-muted-foreground leading-relaxed">TechDV Academy, Sector 44,<br />Cyber City, India 122003</p>
                    </div>
                </div>
                <form className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest pl-1">Full Name</label>
                        <input type="text" className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest pl-1">Your Message</label>
                        <textarea rows="4" className="w-full bg-muted/50 border border-border rounded-2xl px-6 py-4 focus:border-primary outline-none transition-all"></textarea>
                    </div>
                    <button type="button" className="w-full py-5 bg-primary text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-all">SEND MESSAGE</button>
                </form>
            </div>
        }
    />
);

export const Mentors = () => (
    <SimplePage
        title="Expert"
        subtitle="Learn from the architects of the modern digital landscape. Industry titans only."
        icon={Users}
        content={
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                {[
                    { name: 'Digvijay Vaghela', role: 'Founder', bio: 'Expertise in high-performance systems and modern architecture.' },
                    { name: 'Rimpal Jadhav', role: 'Core Strategist', bio: 'Specialized in product psychology and growth-oriented UX engineering.' }
                ].map((m, i) => (
                    <div key={i} className="group p-10 rounded-[3rem] bg-muted/30 border border-border hover:border-primary/50 transition-all">
                        <div className="h-20 w-20 rounded-3xl bg-background border border-border flex items-center justify-center text-4xl mb-8 group-hover:rotate-6 transition-transform">👤</div>
                        <h3 className="text-2xl font-bold mb-2 italic">{m.name}</h3>
                        <p className="text-primary text-xs font-black uppercase tracking-widest mb-6">{m.role}</p>
                        <p className="text-sm leading-relaxed mb-8">{m.bio}</p>
                        <div className="h-px w-full bg-border mb-8" />
                        <Link to="/courses" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-foreground hover:text-primary transition-colors">
                            View Courses <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                ))}
            </div>
        }
    />
);

export const Pricing = () => (
    <SimplePage
        title="Pricing"
        subtitle="Upgrade your learning experience with our premium plans."
        icon={TrendingUp}
        content={
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="p-10 rounded-[3rem] border border-border bg-background flex flex-col items-center text-center">
                    <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-8"><Laptop className="h-6 w-6" /></div>
                    <h3 className="text-2xl font-bold mb-2 italic">Basic Plan</h3>
                    <p className="text-4xl font-display font-black mb-6">FREE</p>
                    <p className="text-sm text-balance mb-12">Universal access to browse all course modules. Pay only for what you learn.</p>
                    <Link to="/register" className="w-full">
                        <button className="w-full py-5 bg-foreground text-background font-black rounded-2xl hover:scale-[1.02] transition-all">CREATE ACCOUNT</button>
                    </Link>
                </div>
                <div className="p-10 rounded-[3rem] border border-primary/30 bg-primary shadow-2xl shadow-primary/20 flex flex-col items-center text-center relative overflow-hidden group">
                    <div className="absolute top-0 right-0 h-32 w-32 bg-muted rounded-full blur-2xl -mr-16 -mt-16" />
                    <div className="h-14 w-14 rounded-2xl bg-white/20 flex items-center justify-center mb-8"><Zap className="h-6 w-6 text-foreground" /></div>
                    <h3 className="text-2xl font-bold mb-2 italic text-foreground">Pro Plan</h3>
                    <p className="text-4xl font-display font-black mb-6 text-foreground">₹999 <span className="text-sm opacity-60">/mo</span></p>
                    <p className="text-sm text-balance mb-12 text-foreground/80">Full unrestricted access to every course, live sessions, and the elite Discord community.</p>
                    <Link to="/register" className="w-full">
                        <button className="w-full py-5 bg-white text-primary font-black rounded-2xl hover:scale-105 transition-all">ACTIVATE PRO</button>
                    </Link>
                </div>
            </div>
        }
    />
);

export const Blog = () => (
    <SimplePage
        title="Blog"
        subtitle="Latest updates and articles from our team."
        icon={Zap}
        content={
            <div className="space-y-16">
                {[1, 2, 3].map(i => (
                    <div key={i} className="group cursor-pointer">
                        <span className="text-primary text-[10px] font-black uppercase tracking-[0.3em] block mb-4">Academy Pulse • Day {i + 10}</span>
                        <h3 className="text-3xl font-display font-bold text-foreground mb-4 italic group-hover:text-primary transition-colors">The 2026 Shift: AI in Education</h3>
                        <p className="text-lg leading-relaxed text-muted-foreground line-clamp-2">Analyzing how adaptive learning systems are outperforming traditional asynchronous video courses in retention tests...</p>
                        <div className="flex items-center gap-4 mt-8 opacity-0 group-hover:opacity-100 transition-all translate-x-[-10px] group-hover:translate-x-0">
                            <span className="text-xs font-black uppercase tracking-widest text-foreground">Read Post</span>
                            <div className="h-px flex-1 bg-border" />
                            <ArrowRight className="h-5 w-5" />
                        </div>
                    </div>
                ))}
            </div>
        }
    />
);

export const Live = () => {
    const [broadcasts, setBroadcasts] = React.useState([]);
    const [loading, setLoading] = React.useState(true);
    const { user } = useSelector(state => state.auth);
    const navigate = useNavigate();

    React.useEffect(() => {
        const fetchLive = async () => {
            try {
                const { data } = await api.get('/live');
                setBroadcasts(data.data || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchLive();
    }, []);

    const handleCreateBroadcast = async () => {
        try {
            const { data } = await api.post('/live', {
                title: `${user.name}'s Neural Sync Session`,
                description: 'Real-time mentorship and architectural deep dive.'
            });
            navigate(`/live/${data.data.channelName}`);
        } catch (err) {
            alert('Failed to initialize broadcast protocol.');
        }
    };

    return (
        <SimplePage
            title="Stream"
            subtitle="Live synchronization sessions with industry architects."
            icon={Zap}
            content={
                <div className="py-12">
                    <div className="flex items-center justify-between mb-12">
                        <h2 className="text-3xl font-display font-black text-foreground italic">Active Transmissions</h2>
                        {(user?.role === 'instructor' || user?.role === 'super_admin') && (
                            <button onClick={handleCreateBroadcast} className="px-6 py-3 bg-primary text-primary-foreground font-black uppercase text-[10px] tracking-widest rounded-xl hover:scale-105 transition-transform flex items-center gap-2">
                                <Video className="h-4 w-4" /> Start Broadcast
                            </button>
                        )}
                    </div>

                    {loading ? (
                        <div className="flex justify-center p-12">
                            <Zap className="h-10 w-10 text-primary animate-pulse" />
                        </div>
                    ) : broadcasts.length === 0 ? (
                        <div className="text-center py-24 flex flex-col items-center border border-border/50 rounded-3xl bg-muted/20">
                            <div className="h-24 w-24 rounded-[2rem] bg-rose-500/10 border border-rose-500/20 flex items-center justify-center animate-pulse mb-8">
                                <div className="h-4 w-4 rounded-full bg-rose-500" />
                            </div>
                            <h2 className="text-4xl font-display font-black text-foreground mb-4 italic">No Active Streams</h2>
                            <p className="text-xl text-muted-foreground font-medium">There are currently no active instructor broadcasts. Check back later.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {broadcasts.map(b => (
                                <div key={b._id} className="p-6 rounded-3xl border border-border bg-card hover:border-primary/50 transition-colors group relative overflow-hidden">
                                    <div className="absolute top-4 right-4 flex items-center gap-2">
                                        <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
                                        <span className="text-[8px] font-black uppercase text-rose-500 tracking-widest leading-none">LIVE</span>
                                    </div>
                                    <div className="h-12 w-12 rounded-xl bg-muted border border-border mb-6 flex items-center justify-center">
                                        <Video className="h-6 w-6 text-foreground/50 group-hover:text-primary transition-colors" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-foreground truncate">{b.title}</h3>
                                    <p className="text-xs text-foreground/50 font-bold uppercase tracking-widest mb-6">Host: {b.instructor?.name || 'Instructor'}</p>
                                    <button onClick={() => navigate(`/live/${b.channelName}`)} className="w-full py-3 bg-foreground text-background font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-primary transition-colors">
                                        Join Session
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            }
        />
    );
};

export const Privacy = () => (
    <SimplePage
        title="Safety"
        subtitle="Data integrity and privacy protection policies."
        icon={ShieldCheck}
        content={
            <div className="space-y-12">
                <section className="p-8 rounded-[2rem] bg-muted/30 border border-border">
                    <h3 className="text-xl font-bold mb-4 text-foreground italic flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-primary" /> 1. Data Integrity</h3>
                    <p className="text-lg">At TechDV, we take your privacy seriously. This policy outlines how we handle your personal information when you use our platform.</p>
                </section>
                <section className="p-8 rounded-[2rem] bg-muted/30 border border-border">
                    <h3 className="text-xl font-bold mb-4 text-foreground italic flex items-center gap-2"><Zap className="h-5 w-5 text-secondary" /> 2. Data Collection</h3>
                    <p className="text-lg">We only collect data that enhances your learning experience. No third-party sharing. No data leaks.</p>
                </section>
            </div>
        }
    />
);
