'use client';

import { useAppStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card id="bmi-card" className="glass-panel border-white/10 shadow-2xl relative overflow-hidden group">
            {/* Decorative background glow */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-transparent opacity-50 transition-opacity group-hover:opacity-100 pointer-events-none" />

            <CardHeader>
                <CardTitle className="text-2xl font-bold tracking-tight text-glow">Body Composition</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6 relative z-10">
                <BmiGauge bmi={bmiData.bmi} />

                <AnimatePresence>
                    {bmiData.category && (
                        <motion.div
                            initial={{ opacity: 0, height: 0, y: 10 }}
                            animate={{ opacity: 1, height: 'auto', y: 0 }}
                            exit={{ opacity: 0, height: 0, y: -10 }}
                            className="text-center p-3 rounded-xl bg-white/5 border border-white/10 backdrop-blur-md shadow-inner"
                        >
                            <p className="text-xs text-muted-foreground mb-1 uppercase tracking-widest">Status</p>
                            <p className="text-xl font-bold tracking-wider uppercase bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
                                {bmiData.category}
                            </p>
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleCalculate} className="space-y-5 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80 ml-1">Height (cm)</label>
                            <Input
                                type="number"
                                placeholder="175"
                                value={bmiData.height}
                                onChange={(e) => setBmiData({ height: e.target.value })}
                                className="bg-black/30 border-white/10 focus-visible:ring-primary/50 text-white rounded-xl shadow-inner transition-all hover:bg-black/40"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80 ml-1">Weight (kg)</label>
                            <Input
                                type="number"
                                placeholder="70"
                                value={bmiData.weight}
                                onChange={(e) => setBmiData({ weight: e.target.value })}
                                className="bg-black/30 border-white/10 focus-visible:ring-primary/50 text-white rounded-xl shadow-inner transition-all hover:bg-black/40"
                                required
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80 ml-1">Age</label>
                            <Input
                                type="number"
                                placeholder="25"
                                value={bmiData.age}
                                onChange={(e) => setBmiData({ age: e.target.value })}
                                className="bg-black/30 border-white/10 focus-visible:ring-primary/50 text-white rounded-xl shadow-inner transition-all hover:bg-black/40"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-white/80 ml-1">Gender</label>
                            <select
                                value={bmiData.gender}
                                onChange={(e) => setBmiData({ gender: e.target.value as any })}
                                className="flex h-10 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 shadow-inner transition-all hover:bg-black/40"
                                required
                            >
                                <option value="" disabled className="bg-slate-900 text-white/50">Select</option>
                                <option value="male" className="bg-slate-900">Male</option>
                                <option value="female" className="bg-slate-900">Female</option>
                                <option value="other" className="bg-slate-900">Other</option>
                            </select>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        className="w-full mt-4 h-12 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold tracking-wide neon-glow transition-all hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] border border-white/10"
                    >
                        Calculate Impact
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
