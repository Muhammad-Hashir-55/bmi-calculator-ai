'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAppStore } from '@/lib/store';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
    ChevronLeft,
    ChevronRight,
    Heart,
    Play,
    RotateCcw,
    TimerReset,
    Trophy,
    Zap,
} from 'lucide-react';

type Lane = 0 | 1 | 2;
type GameMode = 'idle' | 'playing' | 'ended';
type FlashState = 'none' | 'good' | 'bad';

type ItemTemplate = {
    label: string;
    kind: 'good' | 'bad';
    basePoints: number;
};

type FallingItem = ItemTemplate & {
    id: string;
    lane: Lane;
    y: number;
};

const LANE_POSITIONS = [16.666, 50, 83.333] as const;
const ROUND_TIME = 45;
const MAX_LEVEL = 6;

const GOOD_ITEMS: ItemTemplate[] = [
    { label: 'Apple', kind: 'good', basePoints: 10 },
    { label: 'Oats', kind: 'good', basePoints: 12 },
    { label: 'Salad', kind: 'good', basePoints: 14 },
    { label: 'Water', kind: 'good', basePoints: 10 },
    { label: 'Yogurt', kind: 'good', basePoints: 12 },
];

const BAD_ITEMS: ItemTemplate[] = [
    { label: 'Soda', kind: 'bad', basePoints: -10 },
    { label: 'Donut', kind: 'bad', basePoints: -10 },
    { label: 'Fries', kind: 'bad', basePoints: -12 },
    { label: 'Burger', kind: 'bad', basePoints: -12 },
];

const laneClassNames: Record<number, string> = {
    0: 'left-0',
    1: 'left-1/3',
    2: 'left-2/3',
};

function randomItem(): ItemTemplate {
    const pool = Math.random() < 0.68 ? GOOD_ITEMS : BAD_ITEMS;
    return pool[Math.floor(Math.random() * pool.length)];
}

function laneValue(value: number): Lane {
    return Math.max(0, Math.min(2, value)) as Lane;
}

function itemClasses(item: FallingItem) {
    if (item.kind === 'good') {
        return 'border-emerald-300/70 bg-emerald-100/95 text-emerald-800 dark:border-emerald-400/30 dark:bg-emerald-400/15 dark:text-emerald-100';
    }

    return 'border-rose-300/70 bg-rose-100/95 text-rose-800 dark:border-rose-400/30 dark:bg-rose-400/15 dark:text-rose-100';
}

export function CalorieCatcher() {
    const { gameScore, highScore, setGameScore, setHighScore } = useAppStore();
    const [mode, setMode] = useState<GameMode>('idle');
    const [items, setItems] = useState<FallingItem[]>([]);
    const [playerLane, setPlayerLane] = useState<Lane>(1);
    const [lives, setLives] = useState(3);
    const [streak, setStreak] = useState(0);
    const [level, setLevel] = useState(1);
    const [timeLeft, setTimeLeft] = useState(ROUND_TIME);
    const [flash, setFlash] = useState<FlashState>('none');
    const [statusText, setStatusText] = useState('Catch clean fuel and dodge junk.');

    const frameRef = useRef<number | null>(null);
    const gameLoopRef = useRef<(time: number) => void>(() => undefined);
    const itemsRef = useRef<FallingItem[]>([]);
    const playerLaneRef = useRef<Lane>(1);
    const isPlayingRef = useRef(false);
    const lastFrameRef = useRef(0);
    const lastSpawnRef = useRef(0);
    const scoreRef = useRef(0);
    const livesRef = useRef(3);
    const streakRef = useRef(0);
    const levelRef = useRef(1);
    const timeLeftRef = useRef(ROUND_TIME);
    const flashTimeoutRef = useRef<number | null>(null);

    const progressWidth = useMemo(
        () => `${Math.max(0, (timeLeft / ROUND_TIME) * 100)}%`,
        [timeLeft]
    );

    const clearFlash = useCallback(() => {
        if (flashTimeoutRef.current) {
            window.clearTimeout(flashTimeoutRef.current);
        }
    }, []);

    const pulseFlash = useCallback((nextFlash: FlashState) => {
        clearFlash();
        setFlash(nextFlash);
        flashTimeoutRef.current = window.setTimeout(() => setFlash('none'), 180);
    }, [clearFlash]);

    const stopLoop = useCallback(() => {
        if (frameRef.current) {
            cancelAnimationFrame(frameRef.current);
            frameRef.current = null;
        }
        isPlayingRef.current = false;
    }, []);

    const finishGame = useCallback(() => {
        stopLoop();
        setMode('ended');
        setItems([]);
        itemsRef.current = [];
        if (scoreRef.current > highScore) {
            setHighScore(scoreRef.current);
        }
    }, [highScore, setHighScore, stopLoop]);

    const movePlayer = useCallback((direction: -1 | 1) => {
        if (!isPlayingRef.current) {
            return;
        }

        const nextLane = laneValue(playerLaneRef.current + direction);
        playerLaneRef.current = nextLane;
        setPlayerLane(nextLane);
    }, []);

    const jumpToLane = useCallback((lane: Lane) => {
        if (!isPlayingRef.current) {
            return;
        }

        playerLaneRef.current = lane;
        setPlayerLane(lane);
    }, []);

    const gameLoop = useCallback((time: number) => {
        if (!isPlayingRef.current) {
            return;
        }

        const delta = time - lastFrameRef.current;
        lastFrameRef.current = time;
        timeLeftRef.current = Math.max(0, timeLeftRef.current - delta / 1000);
        setTimeLeft(Number(timeLeftRef.current.toFixed(2)));

        if (time - lastSpawnRef.current >= Math.max(430, 980 - levelRef.current * 95)) {
            const template = randomItem();
            const newItem: FallingItem = {
                ...template,
                id: `${time}-${Math.random()}`,
                lane: Math.floor(Math.random() * 3) as Lane,
                y: -12,
            };
            itemsRef.current = [...itemsRef.current, newItem];
            lastSpawnRef.current = time;
        }

        const nextItems: FallingItem[] = [];
        const speed = (0.52 + levelRef.current * 0.08) * (delta / 16.667);

        for (const item of itemsRef.current) {
            const nextY = item.y + speed;
            const inCatchZone = nextY >= 76 && nextY <= 92;
            const isCaught = inCatchZone && item.lane === playerLaneRef.current;

            if (isCaught) {
                if (item.kind === 'good') {
                    const comboBonus = Math.min(streakRef.current, 4) * 2;
                    const gain = item.basePoints + comboBonus;
                    const nextScore = scoreRef.current + gain;
                    const nextStreak = streakRef.current + 1;
                    const nextLevel = Math.min(MAX_LEVEL, Math.floor(nextScore / 60) + 1);

                    scoreRef.current = nextScore;
                    streakRef.current = nextStreak;
                    levelRef.current = nextLevel;

                    setGameScore(nextScore);
                    setStreak(nextStreak);
                    setLevel(nextLevel);
                    setStatusText(`${item.label} secured. +${gain} points.`);
                    pulseFlash('good');
                } else {
                    const nextLives = Math.max(0, livesRef.current - 1);
                    const nextScore = Math.max(0, scoreRef.current + item.basePoints);

                    livesRef.current = nextLives;
                    streakRef.current = 0;
                    scoreRef.current = nextScore;

                    setLives(nextLives);
                    setStreak(0);
                    setGameScore(nextScore);
                    setStatusText(`${item.label} slipped in. Lose a life.`);
                    pulseFlash('bad');
                }

                continue;
            }

            if (nextY > 108) {
                if (item.kind === 'good' && streakRef.current !== 0) {
                    streakRef.current = 0;
                    setStreak(0);
                }
                continue;
            }

            nextItems.push({ ...item, y: nextY });
        }

        itemsRef.current = nextItems;
        setItems(nextItems);

        if (livesRef.current <= 0 || timeLeftRef.current <= 0) {
            finishGame();
            return;
        }

        frameRef.current = requestAnimationFrame(gameLoopRef.current);
    }, [finishGame, pulseFlash, setGameScore]);

    useEffect(() => {
        gameLoopRef.current = gameLoop;
    }, [gameLoop]);

    const startGame = useCallback(() => {
        clearFlash();
        stopLoop();
        setMode('playing');
        setItems([]);
        setPlayerLane(1);
        setLives(3);
        setStreak(0);
        setLevel(1);
        setTimeLeft(ROUND_TIME);
        setFlash('none');
        setStatusText('Catch clean fuel and dodge junk.');
        setGameScore(0);

        itemsRef.current = [];
        playerLaneRef.current = 1;
        scoreRef.current = 0;
        livesRef.current = 3;
        streakRef.current = 0;
        levelRef.current = 1;
        timeLeftRef.current = ROUND_TIME;
        lastFrameRef.current = performance.now();
        lastSpawnRef.current = performance.now();
        isPlayingRef.current = true;
        frameRef.current = requestAnimationFrame((time) => {
            lastFrameRef.current = time;
            frameRef.current = requestAnimationFrame(gameLoopRef.current);
        });
    }, [clearFlash, setGameScore, stopLoop]);

    useEffect(() => {
        return () => {
            clearFlash();
            stopLoop();
        };
    }, [clearFlash, stopLoop]);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (!isPlayingRef.current) {
                return;
            }

            if (event.key === 'ArrowLeft' || event.key.toLowerCase() === 'a') {
                event.preventDefault();
                movePlayer(-1);
            }

            if (event.key === 'ArrowRight' || event.key.toLowerCase() === 'd') {
                event.preventDefault();
                movePlayer(1);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [movePlayer]);

    return (
        <Card className={`glass-panel relative overflow-hidden rounded-[2rem] border-slate-200/70 bg-white/70 shadow-[0_24px_90px_rgba(15,23,42,0.08)] transition-colors dark:border-white/10 dark:bg-white/5 ${flash === 'good' ? 'bg-emerald-50/90 dark:bg-emerald-400/10' : ''} ${flash === 'bad' ? 'bg-rose-50/90 dark:bg-rose-400/10' : ''}`}>
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.3),transparent_40%)] dark:bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.12),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.04),transparent_40%)]" />

            <CardHeader className="relative z-10 border-b border-slate-200/80 pb-4 dark:border-white/10">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-xl font-black tracking-[-0.04em] text-slate-900 dark:text-white">
                            <Zap className="text-emerald-500" size={20} />
                            Fuel Rush
                        </CardTitle>
                        <CardDescription className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
                            Move across three lanes, catch healthy fuel, and avoid
                            junk traps before the round ends.
                        </CardDescription>
                    </div>

                    <div className="grid grid-cols-2 gap-2 sm:min-w-[13rem]">
                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                                Best
                            </p>
                            <p className="mt-1 flex items-center gap-1 text-lg font-black text-slate-900 dark:text-white">
                                <Trophy size={16} className="text-amber-500" />
                                {highScore}
                            </p>
                        </div>
                        <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                                Score
                            </p>
                            <p className="mt-1 text-lg font-black text-slate-900 dark:text-white">
                                {gameScore}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                            Level
                        </p>
                        <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">{level}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                            Streak
                        </p>
                        <p className="mt-1 text-base font-bold text-slate-900 dark:text-white">{streak}</p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                            Lives
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-base font-bold text-slate-900 dark:text-white">
                            <Heart size={14} className="fill-rose-500 text-rose-500" />
                            {lives}
                        </p>
                    </div>
                    <div className="rounded-2xl border border-slate-200/80 bg-slate-50/80 px-3 py-2 dark:border-white/10 dark:bg-white/5">
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                            Time
                        </p>
                        <p className="mt-1 flex items-center gap-1 text-base font-bold text-slate-900 dark:text-white">
                            <TimerReset size={14} className="text-sky-500" />
                            {Math.ceil(timeLeft)}s
                        </p>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="relative z-10 p-4 pt-4 sm:p-5">
                <div className="mb-4 h-2.5 overflow-hidden rounded-full bg-slate-200/80 dark:bg-white/10">
                    <div
                        className="h-full rounded-full bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 transition-all duration-300"
                        style={{ width: progressWidth }}
                    />
                </div>

                <div className="mb-4 rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm font-medium text-slate-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200">
                    {statusText}
                </div>

                <div className="relative h-[24rem] overflow-hidden rounded-[1.8rem] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(240,249,255,0.95),rgba(224,242,254,0.55)),radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_34%)] dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(2,6,23,0.92),rgba(15,23,42,0.74)),radial-gradient(circle_at_top,rgba(16,185,129,0.16),transparent_34%)] sm:h-[26rem]">
                    <div className="pointer-events-none absolute inset-y-0 left-1/3 w-px bg-slate-300/70 dark:bg-white/10" />
                    <div className="pointer-events-none absolute inset-y-0 left-2/3 w-px bg-slate-300/70 dark:bg-white/10" />

                    {([0, 1, 2] as Lane[]).map((lane) => (
                        <button
                            key={lane}
                            type="button"
                            aria-label={`Move to lane ${lane + 1}`}
                            onClick={() => jumpToLane(lane)}
                            className={`absolute inset-y-0 w-1/3 ${laneClassNames[lane]}`}
                        />
                    ))}

                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-950/14 to-transparent dark:from-slate-950/50" />

                    {items.map((item) => (
                        <div
                            key={item.id}
                            className={`absolute -ml-[2.7rem] w-[5.4rem] rounded-2xl border px-2 py-2 text-center text-xs font-bold shadow-lg backdrop-blur-sm transition ${itemClasses(item)}`}
                            style={{
                                left: `${LANE_POSITIONS[item.lane]}%`,
                                top: `${item.y}%`,
                            }}
                        >
                            <p className="leading-tight">{item.label}</p>
                            <p className="mt-1 text-[10px] uppercase tracking-[0.2em] opacity-80">
                                {item.kind === 'good' ? 'Fuel' : 'Trap'}
                            </p>
                        </div>
                    ))}

                    <motion.div
                        className="absolute bottom-5 -ml-12 w-24 rounded-[1.4rem] border border-slate-900/10 bg-white/90 px-3 py-3 text-center shadow-[0_16px_40px_rgba(15,23,42,0.18)] dark:border-white/10 dark:bg-slate-900/85"
                        animate={{ left: `${LANE_POSITIONS[playerLane]}%` }}
                        transition={{ type: 'spring', damping: 18, stiffness: 260 }}
                    >
                        <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                            Tray
                        </p>
                        <p className="mt-1 text-sm font-black text-slate-900 dark:text-white">Catch</p>
                    </motion.div>

                    {mode !== 'playing' && (
                        <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/72 p-6 backdrop-blur-md dark:bg-slate-950/78">
                            <div className="w-full max-w-xs rounded-[1.8rem] border border-slate-200/80 bg-white/90 p-5 text-center shadow-xl dark:border-white/10 dark:bg-slate-900/90">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.26em] text-emerald-600 dark:text-emerald-400">
                                    {mode === 'ended' ? 'Round complete' : 'Quick rules'}
                                </p>
                                <h3 className="mt-3 text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">
                                    {mode === 'ended' ? 'Run it again.' : 'Fuel Rush'}
                                </h3>
                                <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-300">
                                    Catch healthy food for points and combo bonuses.
                                    Junk items cost score and lives.
                                </p>
                                {mode === 'ended' && (
                                    <p className="mt-3 text-sm font-semibold text-slate-900 dark:text-white">
                                        Final score: {gameScore}
                                    </p>
                                )}
                                <Button
                                    onClick={startGame}
                                    size="lg"
                                    className="mt-5 h-12 w-full rounded-2xl bg-gradient-to-r from-emerald-600 via-cyan-600 to-blue-600 text-base font-bold text-white hover:from-emerald-500 hover:via-cyan-500 hover:to-blue-500"
                                >
                                    {mode === 'ended' ? (
                                        <>
                                            <RotateCcw className="mr-2" size={18} />
                                            Play Again
                                        </>
                                    ) : (
                                        <>
                                            <Play className="mr-2" size={18} />
                                            Start Round
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <Button
                        type="button"
                        onClick={() => movePlayer(-1)}
                        disabled={mode !== 'playing'}
                        variant="outline"
                        className="h-12 rounded-2xl border-slate-300/80 bg-white/80 text-sm font-semibold text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-emerald-400/30 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-200"
                    >
                        <ChevronLeft className="mr-1" size={18} />
                        Left
                    </Button>
                    <Button
                        type="button"
                        onClick={() => movePlayer(1)}
                        disabled={mode !== 'playing'}
                        variant="outline"
                        className="h-12 rounded-2xl border-slate-300/80 bg-white/80 text-sm font-semibold text-slate-700 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-emerald-400/30 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-200"
                    >
                        Right
                        <ChevronRight className="ml-1" size={18} />
                    </Button>
                    <Button
                        type="button"
                        onClick={startGame}
                        className="h-12 rounded-2xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
                    >
                        {mode === 'playing' ? 'Restart' : 'Play'}
                    </Button>
                    <div className="flex items-center justify-center rounded-2xl border border-slate-200/80 bg-slate-50/80 px-4 text-center text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                        Tap lanes or use A / D
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
