import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import { cn } from '../utils/utils';

export default function AiChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your TechDV AI Assistant. How can I help you evolve today?", sender: 'ai' }
    ]);
    const [input, setInput] = useState('');

    const handleSend = (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const newMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, newMsg]);
        setInput('');

        // Mock AI thinking
        setTimeout(() => {
            const aiResponse = { 
                id: Date.now() + 1, 
                text: "I am a simulated AI for this premium showcase. I'm analyzing your request to provide the most optimal learning path.", 
                sender: 'ai' 
            };
            setMessages(prev => [...prev, aiResponse]);
        }, 1200);
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="mb-4 w-[350px] sm:w-[400px] h-[500px] bg-card/80 backdrop-blur-3xl border border-border/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="px-6 py-4 border-b border-border/50 bg-background/50 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center relative">
                                    <Sparkles className="h-4 w-4 text-primary absolute animate-ping opacity-75" />
                                    <Bot className="h-5 w-5 text-primary relative z-10" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold tracking-widest uppercase text-foreground">TechDV AI</h3>
                                    <p className="text-[10px] text-primary tracking-widest uppercase animate-pulse">Online</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="h-8 w-8 rounded-full hover:bg-white/5 flex items-center justify-center transition-colors"
                            >
                                <X className="h-4 w-4 text-foreground/50 hover:text-foreground" />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                            {messages.map((msg) => (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id} 
                                    className={cn(
                                        "max-w-[85%] rounded-2xl px-4 py-3 text-sm flex-col gap-1",
                                        msg.sender === 'user' 
                                            ? "bg-primary text-primary-foreground self-end rounded-br-sm" 
                                            : "bg-muted/50 text-foreground self-start rounded-bl-sm border border-border/50"
                                    )}
                                >
                                    <p className="leading-relaxed">{msg.text}</p>
                                    <span className="text-[10px] opacity-50 mt-1 block">
                                        {msg.sender === 'ai' ? 'TechDV Core' : 'You'}
                                    </span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-background/50 border-t border-border/50">
                            <form onSubmit={handleSend} className="relative flex items-center">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Ask anything..."
                                    className="w-full bg-muted/50 border border-border/50 rounded-full pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 text-foreground placeholder:text-foreground/30 transition-all font-medium"
                                />
                                <button
                                    type="submit"
                                    disabled={!input.trim()}
                                    className="absolute right-2 h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground disabled:opacity-50 transition-all shadow-[0_0_15px_rgba(var(--primary),0.5)]"
                                >
                                    <Send className="h-4 w-4 ml-1" />
                                </button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="h-14 w-14 rounded-full bg-gradient-to-tr from-primary to-secondary shadow-[0_0_30px_rgba(var(--primary),0.5)] flex items-center justify-center overflow-hidden relative group"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                <MessageSquare className={cn(
                    "h-6 w-6 text-white relative z-10 transition-transform duration-300", 
                    isOpen && "rotate-180 scale-0 opacity-0"
                )} />
                <X className={cn(
                    "h-6 w-6 text-white absolute z-10 transition-transform duration-300 scale-0 opacity-0 rotate-180", 
                    isOpen && "rotate-0 scale-100 opacity-100"
                )} />
            </motion.button>
        </div>
    );
}
