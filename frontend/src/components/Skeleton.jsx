import React from 'react';
import { cn } from '../utils/utils';

export function Skeleton({ className, ...props }) {
    return (
        <div
            className={cn("animate-pulse rounded-md bg-muted", className)}
            {...props}
        />
    )
}

export function CourseCardSkeleton() {
    return (
        <div className="group relative h-full flex flex-col bg-muted/20 backdrop-blur-xl border border-border rounded-3xl md:rounded-[2rem] overflow-hidden shadow-xl md:shadow-2xl">
            {/* Thumbnail Skeleton */}
            <div className="relative aspect-[16/10] overflow-hidden bg-muted/30">
                <Skeleton className="w-full h-full rounded-none" />

                {/* Status Badges Skeleton */}
                <div className="absolute top-4 left-4 md:top-6 md:left-6 flex gap-2">
                    <Skeleton className="h-6 w-20 rounded-full bg-background/40" />
                    <Skeleton className="h-6 w-16 rounded-xl bg-background/40" />
                </div>

                {/* Price Tag Overlay Skeleton */}
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6">
                    <Skeleton className="h-8 md:h-10 w-24 bg-background/50 rounded-lg" />
                </div>
            </div>

            {/* Content Body Skeleton */}
            <div className="p-5 md:p-8 flex-1 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-5 w-16 rounded-lg" />
                    <Skeleton className="h-4 w-24 rounded-md" />
                </div>

                <Skeleton className="h-6 w-[80%] md:h-8 rounded-md" />
                <Skeleton className="h-6 w-[60%] md:h-8 rounded-md mb-2" />

                <div className="space-y-2 mb-6">
                    <Skeleton className="h-4 w-full rounded-md" />
                    <Skeleton className="h-4 w-[90%] rounded-md" />
                </div>

                {/* Footer Skeleton */}
                <div className="mt-auto pt-5 md:pt-8 border-t border-border flex items-center justify-between">
                    <div className="flex items-center gap-3 md:gap-4">
                        <Skeleton className="h-8 w-8 md:h-10 md:w-10 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-3 w-16 rounded-sm" />
                            <Skeleton className="h-4 w-24 rounded-sm" />
                        </div>
                    </div>

                    <Skeleton className="h-6 w-16 rounded-lg" />
                </div>
            </div>
        </div>
    )
}
