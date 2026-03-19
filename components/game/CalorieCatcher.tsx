'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Play, RotateCcw, Activity } from 'lucide-react';

const HEALTHY = ['🍎', '🥗', '🥑', '🥦', '🍌', '🥕'];
const UNHEALTHY = ['🍔', '🍩', '🍕', '🌭', '🍟', '🍦'];

type Item = { id: string; type: 'healthy' | 'unhealthy'; icon: string; x: number; y: number };

export function CalorieCatcher() {
    const { gameScore, highScore, setGameScore, setHighScore } = useAppStore();
    const [isPlaying, setIsPlaying] = useState(false);
    const [items, setItems] = useState<Item[]>([]);
    const itemsRef = useRef<Item[]>([]);
    const [playerX, setPlayerX] = useState(50);
    const playerXRef = useRef(50);
    const [flash, setFlash] = useState<'none' | 'green' | 'red'>('none');
    const gameAreaRef = useRef<HTMLDivElement>(null);
    const requestRef = useRef<number | null>(null);
    const lastTimeRef = useRef<number>(0);
    const speedMultiplierRef = useRef<number>(1);

    const startGame = () => {
        setIsPlaying(true);
        setGameScore(0);
        itemsRef.current = [];
        setItems([]);
        playerXRef.current = 50;
        setPlayerX(50);
        speedMultiplierRef.current = 1;
        lastTimeRef.current = performance.now();
    };

    const endGame = () => {
        setIsPlaying(false);
        if (gameScore > highScore) setHighScore(gameScore);
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isPlaying || !gameAreaRef.current) return;
        const rect = gameAreaRef.current.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const x = ((clientX - rect.left) / rect.width) * 100;
        const newX = Math.max(5, Math.min(95, x));
        playerXRef.current = newX;
        setPlayerX(newX);
    };

    const gameLoop = useCallback((time: number) => {
        if (!isPlaying) return;

        let activeItems = [...itemsRef.current];

        if (time - lastTimeRef.current > Math.max(400, 1000 - (speedMultiplierRef.current * 50))) {
            const isHealthy = Math.random() > 0.35;
            const iconList = isHealthy ? HEALTHY : UNHEALTHY;
            const newItem: Item = {
                id: Math.random().toString(),
                type: isHealthy ? 'healthy' : 'unhealthy',
                icon: iconList[Math.floor(Math.random() * iconList.length)],
                x: Math.random() * 80 + 10,
                y: -10,
            };
            activeItems.push(newItem);
            lastTimeRef.current = time;
        }

        let scoreGained = 0;
        let scoreLost = 0;

        for (let i = activeItems.length - 1; i >= 0; i--) {
            const item = activeItems[i];
            item.y += 1.2 * speedMultiplierRef.current; // Speed scaling

            // Collision logic
            if (item.y > 80 && item.y < 95 && Math.abs(item.x - playerXRef.current) < 12) {
                if (item.type === 'healthy') {
                    scoreGained += 10;
                    speedMultiplierRef.current += 0.05; // Game gets subtly faster
                } else {
                    scoreLost += 15;
                }
                activeItems.splice(i, 1);
            } else if (item.y > 110) {
                activeItems.splice(i, 1);
            }
        }

        if (scoreGained > 0) {
            setGameScore(s => s + scoreGained);
            setFlash('green');
            setTimeout(() => setFlash('none'), 150);
        }
        if (scoreLost > 0) {
            setGameScore(s => Math.max(0, s - scoreLost));
            setFlash('red');
            setTimeout(() => setFlash('none'), 150);
        }

        itemsRef.current = activeItems;
        setItems(activeItems);

        requestRef.current = requestAnimationFrame(gameLoop);
    }, [isPlaying, setGameScore]);

    useEffect(() => {
        if (isPlaying) {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying, gameLoop]);

    return (
        <Card className={`glass-panel border-slate-200 dark:border-white/10 bg-white/50 dark:bg-white/5 shadow-2xl relative overflow-hidden transition-colors duration-150 ${flash === 'green' ? 'bg-emerald-100 dark:bg-emerald-900/40' : flash === 'red' ? 'bg-red-100 dark:bg-red-900/40' : ''}`}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10 border-b border-slate-200 dark:border-white/5">
                <CardTitle className="text-xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                    <Activity className="text-primary" /> Calorie Catcher
                </CardTitle>
                <div className="flex items-center gap-4">
                    <div className="text-sm font-semibold text-slate-600 dark:text-white/80 flex items-center gap-1">
                        <Trophy size={14} className="text-yellow-500 dark:text-yellow-400" /> {highScore}
                    </div>
                    <div className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-emerald-600 dark:from-blue-400 dark:to-emerald-400 font-mono">
                        {gameScore.toString().padStart(4, '0')}
                    </div>
                </div>
            </CardHeader>

            <CardContent
                className="p-0 h-[400px] relative touch-none cursor-none bg-slate-100/50 dark:bg-black/40"
                onMouseMove={handleMouseMove}
                onTouchMove={handleMouseMove}
                ref={gameAreaRef}
            >
                {!isPlaying ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 dark:bg-black/60 backdrop-blur-sm z-20">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center space-y-4 p-6"
                        >
                            <h3 className="text-3xl font-black text-slate-800 dark:text-white mb-2">Ready?</h3>
                            <p className="text-slate-600 dark:text-white/70 max-w-[250px] text-sm mb-6">Catch healthy food 🍎 for points. Avoid junk food 🍔 or lose points!</p>
                            <Button
                                onClick={startGame}
                                size="lg"
                                className="bg-emerald-600 hover:bg-emerald-500 dark:neon-glow-emerald rounded-full px-8 h-14 font-bold text-lg text-white"
                            >
                                <Play className="mr-2" /> Start Game
                            </Button>
                        </motion.div>
                    </div>
                ) : (
                    <div className="absolute top-4 right-4 z-20">
                        <Button size="icon" variant="ghost" className="text-slate-500 hover:text-slate-800 hover:bg-slate-200 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10" onClick={endGame}>
                            <RotateCcw size={20} />
                        </Button>
                    </div>
                )}

                {/* Player Basket */}
                <AnimatePresence>
                    {isPlaying && (
                        <motion.div
                            className="absolute bottom-4 -ml-6 text-4xl filter drop-shadow-[0_0_10px_rgba(255,255,255,0.5)] z-10"
                            style={{ left: `${playerX}%` }}
                            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        >
                            🧺
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Falling Items */}
                {items.map(item => (
                    <div
                        key={item.id}
                        className="absolute -ml-4 text-3xl filter drop-shadow-md pointer-events-none"
                        style={{ left: `${item.x}%`, top: `${item.y}%` }}
                    >
                        {item.icon}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
