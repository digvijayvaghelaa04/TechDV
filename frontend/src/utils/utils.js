import clsx from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
    return twMerge(clsx(inputs))
}

export const DEFAULT_COURSE_IMAGE = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800';
export const DEFAULT_AVATAR = 'https://ui-avatars.com/api/?background=random&color=fff&name=User';

export function getImgUrl(path, isAvatar = false) {
    if (!path || path === 'default-avatar.jpg') return isAvatar ? DEFAULT_AVATAR : DEFAULT_COURSE_IMAGE;
    if (path.startsWith('http')) return path;
    const baseUrl = import.meta.env.VITE_STORAGE_URL || 'http://localhost:5000';
    return `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
}
