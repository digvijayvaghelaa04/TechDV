import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../utils/api';
import { Search, Filter, BookOpen, Sparkles, LayoutGrid, List } from 'lucide-react';
import CourseCard from '../components/CourseCard';
import { CourseCardSkeleton } from '../components/Skeleton';
import { cn } from '../utils/utils';

// Fetch Courses Function
const fetchCourses = async ({ queryKey }) => {
    const [_, params] = queryKey;
    const { data } = await api.get('/courses', { params });
    return data.data;
};

export default function Courses() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [viewMode, setViewMode] = useState('grid');

    const { data: courses, isLoading, isError, error } = useQuery({
        queryKey: ['courses', { search: searchTerm, category: selectedCategory === 'All' ? undefined : selectedCategory }],
        queryKeyHashFn: (queryKey) => JSON.stringify(queryKey),
        queryFn: fetchCourses,
        keepPreviousData: true,
        staleTime: 1000 * 60 * 5,
    });

    const categories = ['All', 'Development', 'Design', 'Programming', 'DevOps', 'Computer Science', 'Database', 'Marketing', 'Business', 'SaaS', 'AI'];

    return (
        <div className="min-h-screen bg-background pt-32 pb-20">
            {/* Background Ambience */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-0 right-[10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 left-[10%] w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px]" />
            </div>

            <div className="container mx-auto px-4 md:px-6 relative z-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
                    <div className="max-w-2xl">
                        <div
                            className="flex items-center gap-2 text-primary font-bold text-sm tracking-[0.2em] uppercase mb-4"
                        >
                            <Sparkles className="h-4 w-4" />
                            Start Learning
                        </div>
                        <h1
                            className="text-4xl md:text-6xl font-display font-black tracking-tight mb-6"
                        >
                            Learn New <span className="text-primary italic">Skills</span>.
                        </h1>
                        <p
                            className="text-muted-foreground text-lg md:text-xl leading-relaxed"
                        >
                            Explore our academy of curated courses. Built for modern learners, specialized for your growth.
                        </p>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setViewMode('grid')}
                            className={cn(
                                "p-3 rounded-xl border transition-all",
                                viewMode === 'grid' ? "bg-card border-border text-primary shadow-sm" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <LayoutGrid className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setViewMode('list')}
                            className={cn(
                                "p-3 rounded-xl border transition-all",
                                viewMode === 'list' ? "bg-card border-border text-primary shadow-sm" : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <List className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="sticky top-24 z-30 mb-12">
                    <div className="bg-card/50 backdrop-blur-xl border border-border p-2 rounded-2xl flex flex-col md:flex-row gap-4 items-center">
                        <div className="relative flex-1 w-full">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search courses..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-transparent border-none focus:ring-0 pl-12 pr-4 py-3 text-lg font-medium placeholder:text-muted-foreground/50"
                            />
                        </div>

                        <div className="h-8 w-px bg-border hidden md:block" />

                        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                            {categories.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "px-5 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all",
                                        selectedCategory === cat
                                            ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                                            : "text-muted-foreground hover:text-foreground hover:bg-accent"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Course Grid */}
                {isLoading ? (
                    <div
                        className={cn(
                            "gap-8",
                            viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col max-w-4xl mx-auto"
                        )}
                    >
                        {[1, 2, 3, 4, 5, 6].map((i) => (
                            <CourseCardSkeleton key={i} />
                        ))}
                    </div>
                ) : isError ? (
                    <div className="text-center py-20 border border-dashed border-border rounded-3xl bg-muted/5">
                        <p className="text-destructive font-bold">Error loading courses: {error.message}</p>
                    </div>
                ) : courses?.length === 0 ? (
                    <div className="text-center py-32 border border-dashed border-border rounded-4xl bg-muted/5">
                        <BookOpen className="h-16 w-16 text-muted-foreground mx-auto mb-6 opacity-20" />
                        <h3 className="text-2xl font-bold mb-2">No Courses Found</h3>
                        <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
                    </div>
                ) : (
                    <div
                        className={cn(
                            "gap-8",
                            viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "flex flex-col max-w-4xl mx-auto"
                        )}
                    >
                        {courses.map((course) => (
                            <div key={course._id}>
                                <CourseCard course={course} />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
