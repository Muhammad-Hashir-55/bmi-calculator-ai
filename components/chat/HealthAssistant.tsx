'use client';

import { useState, useRef, useEffect } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, User, Bot, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export function HealthAssistant() {
    const { messages, addMessage, setMessages, isTyping, setIsTyping, bmiData } = useAppStore();
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMessage = { id: Date.now().toString(), role: 'user' as const, content: input.trim() };
        addMessage(userMessage);
        setInput('');
        setIsTyping(true);

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
        <Card className="glass-panel bg-white/50 dark:bg-white/5 border-slate-200 dark:border-white/10 shadow-2xl h-[600px] flex flex-col overflow-hidden relative group">
            <div className="absolute inset-0 bg-gradient-to-t from-blue-200/20 dark:from-blue-900/10 via-transparent to-transparent pointer-events-none" />

            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-slate-200 dark:border-white/10 bg-slate-100/50 dark:bg-black/20 z-10">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-emerald-500 flex items-center justify-center shadow-md dark:shadow-[0_0_15px_rgba(16,185,129,0.5)]">
                        <Bot size={24} className="text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Health AI</CardTitle>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-medium">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 dark:bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600 dark:bg-emerald-500"></span>
                            </span>
                            Online Status
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-4 space-y-4 z-10 scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-white/10 scrollbar-track-transparent">
                <AnimatePresence initial={false}>
                    {messages.map((m) => (
                        <motion.div
                            key={m.id}
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            className={`flex items-end gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}
                        >
                            <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center shadow-lg ${m.role === 'user' ? 'bg-primary/20 border border-primary/50' :
                                    m.role === 'system' ? 'bg-red-100 dark:bg-red-500/20 border border-red-300 dark:border-red-500/50' :
                                        'bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/50'
                                }`}>
                                {m.role === 'user' ? <User size={16} className="text-primary" /> :
                                    m.role === 'system' ? <Bot size={16} className="text-red-500 dark:text-red-400" /> :
                                        <Bot size={16} className="text-emerald-600 dark:text-emerald-400" />}
                            </div>
                            <div className={`max-w-[85%] break-words rounded-2xl p-4 text-sm leading-relaxed shadow-lg backdrop-blur-md border ${m.role === 'user'
                                    ? 'bg-primary/90 text-white border-primary-foreground/20 rounded-br-sm'
                                    : m.role === 'system'
                                        ? 'bg-red-50 dark:bg-red-950/80 text-red-800 dark:text-red-200 border-red-200 dark:border-red-500/30 rounded-bl-sm'
                                        : 'bg-white dark:bg-black/40 text-slate-800 dark:text-white/90 border-slate-200 dark:border-white/10 rounded-bl-sm'
                                }`}>
                                {m.role === 'user' ? (
                                    <span className="whitespace-pre-wrap">{m.content}</span>
                                ) : (
                                    <ReactMarkdown
                                        components={{
                                            h3: ({ node, ...props }) => <h3 className="font-bold text-emerald-600 dark:text-emerald-400 text-base mt-3 mb-1 uppercase tracking-wider" {...props} />,
                                            ul: ({ node, ...props }) => <ul className="list-disc ml-5 my-2 space-y-1 text-slate-700 dark:text-white/80" {...props} />,
                                            ol: ({ node, ...props }) => <ol className="list-decimal ml-5 my-2 space-y-1 text-slate-700 dark:text-white/80" {...props} />,
                                            p: ({ node, ...props }) => <p className="mb-3 last:mb-0" {...props} />,
                                            strong: ({ node, ...props }) => <strong className="font-bold text-slate-900 dark:text-white" {...props} />,
                                            a: ({ node, ...props }) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />
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
                            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 border border-emerald-300 dark:border-emerald-500/50 flex items-center justify-center animate-pulse">
                                <Bot size={16} className="text-emerald-600 dark:text-emerald-400" />
                            </div>
                            <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-2xl rounded-bl-sm p-4 flex gap-1 items-center shadow-lg">
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce"></span>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </CardContent>

            <div className="p-4 bg-slate-100/50 dark:bg-black/20 border-t border-slate-200 dark:border-white/10 z-10 backdrop-blur-xl">
                <form onSubmit={handleSubmit} className="flex gap-2">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about your health..."
                        disabled={isTyping}
                        className="flex-1 bg-white dark:bg-black/40 border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/40 focus-visible:ring-emerald-500/50 rounded-xl h-12 shadow-inner transition-all hover:bg-slate-50 dark:hover:bg-black/60 focus:bg-white dark:focus:bg-black/60"
                    />
                    <Button
                        type="submit"
                        disabled={isTyping || !input.trim()}
                        className="h-12 w-12 p-0 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white shadow-md dark:shadow-[0_0_15px_rgba(16,185,129,0.3)] dark:hover:shadow-[0_0_20px_rgba(16,185,129,0.6)] transition-all border border-emerald-500 dark:border-emerald-400/30"
                    >
                        {isTyping ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
                    </Button>
                </form>
            </div>
        </Card>
    );
}
