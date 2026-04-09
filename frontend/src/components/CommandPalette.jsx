import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Command } from 'cmdk';
import { Search, Book, User, Settings, Layout, LogOut, Home } from 'lucide-react';

export function CommandPalette() {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const { user } = useSelector((state) => state.auth);

    useEffect(() => {
        const down = (e) => {
            if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };

        document.addEventListener('keydown', down);
        return () => document.removeEventListener('keydown', down);
    }, []);

    const runCommand = (command) => {
        setOpen(false);
        command();
    };

    return (
        <>
            {open && (
                <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh] p-4 sm:p-6 md:p-20">
                    <div
                        onClick={() => setOpen(false)}
                        className="fixed inset-0 bg-background/80 backdrop-blur-sm"
                    />

                    <div
                        className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                    >
                        <Command className="flex h-full w-full flex-col">
                            <div className="flex items-center border-b border-border px-4 py-3">
                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                <Command.Input
                                    placeholder="Type a command or search..."
                                    className="flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
                                    autoFocus
                                />
                            </div>
                            <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
                                <Command.Empty className="py-6 text-center text-sm">No results found.</Command.Empty>

                                <Command.Group heading="Suggestions" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                    <Command.Item
                                        onSelect={() => runCommand(() => navigate('/'))}
                                        className="flex cursor-pointer select-none items-center rounded-lg px-2 py-3 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                                    >
                                        <Home className="mr-2 h-4 w-4" />
                                        <span>Home</span>
                                    </Command.Item>
                                    <Command.Item
                                        onSelect={() => runCommand(() => navigate('/courses'))}
                                        className="flex cursor-pointer select-none items-center rounded-lg px-2 py-3 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                                    >
                                        <Book className="mr-2 h-4 w-4" />
                                        <span>Browse Courses</span>
                                    </Command.Item>
                                </Command.Group>

                                <Command.Group heading="Account" className="mt-2 px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                    <Command.Item
                                        onSelect={() => runCommand(() => navigate('/profile'))}
                                        className="flex cursor-pointer select-none items-center rounded-lg px-2 py-3 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                                    >
                                        <User className="mr-2 h-4 w-4" />
                                        <span>Profile</span>
                                    </Command.Item>
                                    <Command.Item
                                        onSelect={() => runCommand(() => navigate('/my-courses'))}
                                        className="flex cursor-pointer select-none items-center rounded-lg px-2 py-3 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                                    >
                                        <Layout className="mr-2 h-4 w-4" />
                                        <span>My Courses</span>
                                    </Command.Item>
                                </Command.Group>

                                {(user?.role === 'admin' || user?.role === 'super_admin') && (
                                    <>
                                        <Command.Separator className="my-2 h-px bg-border" />
                                        <Command.Group heading="System" className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                                            <Command.Item
                                                onSelect={() => runCommand(() => navigate('/admin/dashboard'))}
                                                className="flex cursor-pointer select-none items-center rounded-lg px-2 py-3 text-sm outline-none aria-selected:bg-accent aria-selected:text-accent-foreground"
                                            >
                                                <Settings className="mr-2 h-4 w-4" />
                                                <span>Admin Dashboard</span>
                                            </Command.Item>
                                        </Command.Group>
                                    </>
                                )}
                            </Command.List>
                        </Command>

                        <div className="flex items-center justify-between border-t border-border bg-muted/50 px-4 py-2 text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                            <span>TechDV Quick Search</span>
                            <div className="flex items-center gap-2">
                                <span>Esc to close</span>
                                <span className="bg-muted px-1 rounded">↵ Enter to select</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
