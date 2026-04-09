import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Clock, Star, Users, Play, ShieldCheck } from 'lucide-react';
import { getImgUrl, DEFAULT_COURSE_IMAGE, DEFAULT_AVATAR } from '../utils/utils';

const CourseCard = ({ course, progress }) => {
    const navigate = useNavigate();
    const imageUrl = getImgUrl(course.thumbnail);

    const handleCardClick = () => {
        navigate(`/course/${course._id}`);
    };

    return (
        <Link
            to={`/course/${course._id}`}
            className="group relative h-full flex flex-col bg-muted/50 backdrop-blur-xl border border-border rounded-3xl md:rounded-[2rem] overflow-hidden hover:border-primary/30 transition-all duration-500 shadow-xl md:shadow-2xl hover:shadow-[0_20px_80px_-20px_rgba(var(--primary),0.15)] block"
        >
            {/* Thumbnail with Cinematic Overlay */}
            <div className="relative aspect-[16/10] overflow-hidden">
                <img
                    src={imageUrl}
                    alt={course.title}
                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                    loading="lazy"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = DEFAULT_COURSE_IMAGE;
                    }}
                />

                <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent opacity-90" />

                {/* Status Badges */}
                <div className="absolute top-4 left-4 md:top-6 md:left-6 flex flex-wrap gap-2 md:gap-3">
                    {course.isPublished && (
                        <div className="bg-primary/20 backdrop-blur-md px-3 md:px-4 py-1.5 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-primary border border-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.3)]">
                            Operational
                        </div>
                    )}
                    <div className="bg-background/60 backdrop-blur-md px-3 md:px-4 py-1.5 rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70 border border-border">
                        {course.level}
                    </div>
                </div>

                {/* Price Tag Overlay */}
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                    <span className="text-xl md:text-3xl font-display font-black text-foreground tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">₹{course.price}</span>
                </div>
            </div>

            {/* Content Body */}
            <div className="p-5 md:p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-3 md:gap-4 text-[8px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-foreground/40 mb-4 md:mb-6">
                    <div className="flex items-center gap-1.5 px-2 md:px-3 py-1 rounded-lg bg-card border border-border text-primary">
                        <Star className="h-3 w-3 fill-current" />
                        {course.averageRating?.toFixed(1) || '4.5'}
                    </div>
                    <span>({course.totalReviews || 120} units)</span>
                </div>

                <h3 className="text-lg md:text-2xl font-display font-black text-foreground mb-2 md:mb-3 line-clamp-2 leading-tight group-hover:text-primary transition-colors duration-300">
                    {course.title}
                </h3>

                <p className="text-foreground/40 text-xs md:text-sm mb-6 md:mb-10 line-clamp-2 leading-relaxed font-medium italic">
                    {course.description}
                </p>

                {/* Progress Interface if in learning mode */}
                {progress !== undefined && (
                    <div className="mb-10 space-y-4">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-foreground/20">Sync Progress</span>
                            <span className="text-primary font-display font-black italic text-xl">{progress}%</span>
                        </div>
                        <div className="h-2 w-full bg-card rounded-full overflow-hidden p-[1px] border border-border">
                            <div
                                style={{ width: `${progress}%` }}
                                className="h-full bg-gradient-to-r from-primary to-secondary rounded-full shadow-[0_0_15px_rgba(var(--primary),0.4)] transition-all duration-1000"
                            />
                        </div>
                    </div>
                )}

                {/* Instructor & Metadata Footer */}
                <div className="mt-auto pt-5 md:pt-8 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                        <div className="h-8 w-8 md:h-10 md:w-10 rounded-full bg-card border border-border flex items-center justify-center overflow-hidden">
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
                        <div className="flex flex-col">
                            <span className="text-[8px] md:text-[10px] font-black text-foreground/20 uppercase tracking-widest leading-none mb-1">Lead Expert</span>
                            <span className="text-[10px] md:text-xs font-bold text-foreground/70 group-hover:text-foreground transition-colors">
                                {course.instructor?.firstName} {course.instructor?.lastName}
                            </span>
                        </div>
                    </div>

                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1.5 md:gap-2 text-[8px] md:text-[10px] font-black text-foreground/30 uppercase tracking-widest bg-card px-2 md:px-3 py-1 md:py-1.5 rounded-lg md:rounded-xl border border-border">
                            <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
                            {course.estimatedDuration ? `${Math.round(course.estimatedDuration / 60)}H` : '12H'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Play Button Overlay (Hover only) */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-500 scale-50 group-hover:scale-100 pointer-events-none z-20">
                <div className="h-16 w-16 md:h-24 md:w-24 flex items-center justify-center rounded-full bg-primary/10 backdrop-blur-3xl border border-primary/40 shadow-[0_0_60px_rgba(var(--primary),0.4)]">
                    <Play className="h-6 w-6 md:h-8 md:w-8 text-foreground fill-current" />
                </div>
            </div>
        </Link>
    );
};

export default CourseCard;
