'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function HealthAssistant() {
    const { messages, addMessage, setMessages, isTyping, setIsTyping, bmiData } = useAppStore();
    const [input, setInput] = useState('');
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const showStarterTips = messages.length <= 1;

    const isNearBottom = () => {
        const container = messagesContainerRef.current;
        if (!container) return true;

        const distanceFromBottom =
            container.scrollHeight - container.scrollTop - container.clientHeight;

        return distanceFromBottom < 120;
    };

    const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
        messagesEndRef.current?.scrollIntoView({ behavior });
    };

    useEffect(() => {
        if (isNearBottom()) {
            scrollToBottom();
        }
    }, [messages, isTyping]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { id: Date.now().toString(), role: 'user' as const, content: input.trim() };
        addMessage(userMessage);
        setInput('');
        setIsTyping(true);
        requestAnimationFrame(() => scrollToBottom('auto'));

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    messages: [...messages, userMessage],
                    bmiData,
                }),
            });

            if (!response.ok) throw new Error('API Error');

            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            if (!reader) throw new Error('No reader available');

            let assistantMessage = '';
            const assistantMessageId = (Date.now() + 1).toString();

            addMessage({ id: assistantMessageId, role: 'assistant', content: '' });

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                const chunk = decoder.decode(value);
                const lines = chunk.split('\n');

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const dataStr = line.replace('data: ', '');
                        if (dataStr === '[DONE]') break;

                        try {
                            const data = JSON.parse(dataStr);
                            const text = data.choices[0]?.delta?.content || '';
                            assistantMessage += text;

                            // Update the last message
                            setMessages(useAppStore.getState().messages.map(msg =>
                                msg.id === assistantMessageId ? { ...msg, content: assistantMessage } : msg
                            ));
                        } catch (err) {
                            console.error('Error parsing stream data:', err);
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Chat error:', error);
            addMessage({
                id: Date.now().toString(),
                role: 'system',
                content: 'Sorry, I encountered an error. Please verify the GROQ_API_KEY environment variable is set on the server.',
            });
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <Card className="glass-panel group relative flex h-[36rem] min-h-0 flex-col overflow-hidden rounded-[2rem] border-slate-200/70 bg-white/70 shadow-[0_24px_90px_rgba(15,23,42,0.08)] dark:border-white/10 dark:bg-white/5 md:h-[40rem]">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-200/20 dark:from-blue-900/10 via-transparent to-transparent pointer-events-none" />

            <CardHeader className="z-10 border-b border-slate-200/80 bg-slate-50/80 pb-4 dark:border-white/10 dark:bg-black/20">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-md dark:shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                        <Bot size={24} className="text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-black tracking-[-0.04em] text-slate-900 dark:text-white">
                            Health AI
                        </CardTitle>
                        <CardDescription className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                            Ask for food ideas, routines, BMI context, or weight
                            goals.
                        </CardDescription>
                        <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                            <span className="relative flex h-2 w-2">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75 dark:bg-emerald-400"></span>
                                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-600 dark:bg-emerald-500"></span>
                            </span>
                            Online Status
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="z-10 min-h-0 flex-1 p-0">
                <div
                    ref={messagesContainerRef}
                    className="scroll-shell h-full min-h-0 space-y-4 overflow-y-auto p-4 touch-pan-y sm:p-5"
                >
                    {showStarterTips && (
                        <div className="grid gap-2 sm:grid-cols-3">
                            {[
                                'Review my BMI result',
                                'Build a 7-day meal outline',
                                'Suggest a home workout routine',
                            ].map((tip) => (
                                <button
                                    key={tip}
                                    type="button"
                                    onClick={() => setInput(tip)}
                                    className="rounded-2xl border border-slate-200/80 bg-slate-50/90 px-4 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-emerald-400/30 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-200"
                                >
                                    {tip}
                                </button>
                            ))}
                        </div>
                    )}
                    <AnimatePresence initial={false}>
                        {messages.map((m) => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                className={`flex items-end gap-2.5 sm:gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                            >
                                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-lg ${m.role === 'user' ? 'border border-primary/50 bg-primary/20' :
                                        m.role === 'system' ? 'border border-red-300 bg-red-100 dark:border-red-500/50 dark:bg-red-500/20' :
                                            'border border-emerald-300 bg-emerald-100 dark:border-emerald-500/50 dark:bg-emerald-500/20'
                                    }`}>
                                    {m.role === 'user' ? <User size={16} className="text-primary" /> :
                                        m.role === 'system' ? <Bot size={16} className="text-red-500 dark:text-red-400" /> :
                                            <Bot size={16} className="text-emerald-600 dark:text-emerald-400" />}
                                </div>
                                <div className={`max-w-[88%] break-words rounded-[1.4rem] border p-3.5 text-sm leading-relaxed shadow-lg backdrop-blur-md sm:max-w-[82%] sm:p-4 ${m.role === 'user'
                                        ? 'rounded-br-sm border-primary-foreground/20 bg-primary/90 text-white'
                                        : m.role === 'system'
                                            ? 'rounded-bl-sm border-red-200 bg-red-50 text-red-800 dark:border-red-500/30 dark:bg-red-950/80 dark:text-red-200'
                                            : 'rounded-bl-sm border-slate-200 bg-white text-slate-800 dark:border-white/10 dark:bg-black/40 dark:text-white/90'
                                    }`}>
                                    {m.role === 'user' ? (
                                        <span className="whitespace-pre-wrap">{m.content}</span>
                                    ) : (
                                        <ReactMarkdown
                                            components={{
                                                h3: (props) => <h3 className="font-bold text-emerald-600 dark:text-emerald-400 text-base mt-3 mb-1 uppercase tracking-wider" {...props} />,
                                                ul: (props) => <ul className="list-disc ml-5 my-2 space-y-1 text-slate-700 dark:text-white/80" {...props} />,
                                                ol: (props) => <ol className="list-decimal ml-5 my-2 space-y-1 text-slate-700 dark:text-white/80" {...props} />,
                                                p: (props) => <p className="mb-3 last:mb-0" {...props} />,
                                                strong: (props) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                                                a: (props) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />
                                            }}
                                        >
                                            {m.content}
                                        </ReactMarkdown>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                        {isTyping && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-end gap-3"
                            >
                                <div className="flex h-8 w-8 items-center justify-center rounded-full border border-emerald-300 bg-emerald-100 animate-pulse dark:border-emerald-500/50 dark:bg-emerald-500/20">
                                    <Bot size={16} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm border border-slate-200 bg-white p-4 shadow-lg dark:border-white/10 dark:bg-black/40">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div ref={messagesEndRef} className="h-px" />
                </div>
            </CardContent>

            <div className="z-10 border-t border-slate-200/80 bg-slate-50/80 p-4 backdrop-blur-xl dark:border-white/10 dark:bg-black/20">
                <form onSubmit={handleSubmit} className="flex items-end gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your health..."
                        disabled={isTyping}
                        className="h-12 flex-1 rounded-2xl border-slate-200/90 bg-white text-slate-900 shadow-inner transition-all hover:bg-slate-50 focus:bg-white focus-visible:ring-emerald-500/50 dark:border-white/10 dark:bg-black/40 dark:text-white dark:placeholder:text-white/40 dark:hover:bg-black/60 dark:focus:bg-black/60"
                    />
                    <Button
                        type="submit"
                        disabled={isTyping || !input.trim()}
                        className="h-12 w-12 rounded-2xl border border-emerald-500 bg-emerald-600 p-0 text-white shadow-md transition-all hover:-translate-y-0.5 hover:bg-emerald-500 dark:border-emerald-400/30 dark:shadow-[0_0_15px_rgba(16,185,129,0.3)] dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                    >
                        {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </Button>
                </form>
            </div>
        </Card>
    );
}
