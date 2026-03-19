'use client';

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
import { BmiGauge } from './BmiGauge';
import { motion, AnimatePresence } from 'framer-motion';

export function BmiCalculator() {
    const { bmiData, setBmiData, calculateBmi } = useAppStore();

    const handleCalculate = (e: React.FormEvent) => {
        e.preventDefault();
        calculateBmi();
    };

    return (
        <Card id="bmi-card" className="glass-panel relative overflow-hidden rounded-[2rem] border-slate-200/70 bg-white/70 shadow-[0_24px_90px_rgba(15,23,42,0.08)] group dark:border-white/10 dark:bg-white/5">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-cyan-500/5 opacity-70 transition-opacity group-hover:opacity-100" />
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/70 to-transparent dark:from-white/5" />

            <CardHeader>
                <CardTitle className="text-2xl font-black tracking-[-0.04em] text-slate-900 dark:text-white">
                    Body Composition
                </CardTitle>
                <CardDescription className="max-w-md text-sm leading-6 text-slate-600 dark:text-slate-300">
                    Enter your stats to get a cleaner BMI reading and a clearer
                    category summary.
                </CardDescription>
            </CardHeader>

            <CardContent className="relative z-10 space-y-6">
                <BmiGauge bmi={bmiData.bmi} />

                <AnimatePresence>
                    {bmiData.category && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: 10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/85 p-4 text-center shadow-inner dark:border-white/10 dark:bg-white/5"
                        >
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                                Status
                            </p>
                            <p className="text-xl font-black uppercase tracking-[0.18em] text-transparent bg-gradient-to-r from-blue-500 to-emerald-600 bg-clip-text dark:from-blue-400 dark:to-emerald-400">
                                {bmiData.category}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleCalculate} className="mt-4 space-y-5">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="ml-1 text-sm font-medium text-slate-700 dark:text-white/80">
                                Height (cm)
                            </label>
                            <Input
                                type="number"
                                placeholder="175"
                                value={bmiData.height}
                                onChange={(e) => setBmiData({ height: e.target.value })}
                                className="h-12 rounded-2xl border-slate-200/90 bg-white shadow-inner transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-black/30 dark:hover:bg-black/40"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="ml-1 text-sm font-medium text-slate-700 dark:text-white/80">
                                Weight (kg)
                            </label>
                            <Input
                                type="number"
                                placeholder="70"
                                value={bmiData.weight}
                                onChange={(e) => setBmiData({ weight: e.target.value })}
                                className="h-12 rounded-2xl border-slate-200/90 bg-white shadow-inner transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-black/30 dark:hover:bg-black/40"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <label className="ml-1 text-sm font-medium text-slate-700 dark:text-white/80">
                                Age
                            </label>
                            <Input
                                type="number"
                                placeholder="25"
                                value={bmiData.age}
                                onChange={(e) => setBmiData({ age: e.target.value })}
                                className="h-12 rounded-2xl border-slate-200/90 bg-white shadow-inner transition-all hover:bg-slate-50 dark:border-white/10 dark:bg-black/30 dark:hover:bg-black/40"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="ml-1 text-sm font-medium text-slate-700 dark:text-white/80">
                                Gender
                            </label>
                            <select
                                value={bmiData.gender}
                                onChange={(e) => setBmiData({ gender: e.target.value as typeof bmiData.gender })}
                                className="flex h-12 w-full rounded-2xl border border-slate-200/90 bg-white px-4 py-2 text-sm text-slate-900 shadow-inner transition-all hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 dark:border-white/10 dark:bg-black/30 dark:text-white dark:hover:bg-black/40"
                                required
                            >
                                <option value="" disabled className="text-slate-400 dark:bg-slate-900 dark:text-white/50">
                                    Select
                                </option>
                                <option value="male" className="dark:bg-slate-900">Male</option>
                                <option value="female" className="dark:bg-slate-900">Female</option>
                                <option value="other" className="dark:bg-slate-900">Other</option>
                            </select>
                        </div>
                    </div>

                    <div className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                        BMI is a quick screening metric, not a diagnosis. Use it
                        as a guide, then ask the AI coach for context.
                    </div>

                    <Button
                        type="submit"
                        className="mt-4 h-14 w-full rounded-2xl border border-blue-400/20 bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 text-base font-bold tracking-wide text-white shadow-[0_16px_40px_rgba(14,165,233,0.28)] transition-all hover:-translate-y-0.5 hover:from-blue-500 hover:via-cyan-500 hover:to-emerald-500"
                    >
                        Calculate BMI
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
