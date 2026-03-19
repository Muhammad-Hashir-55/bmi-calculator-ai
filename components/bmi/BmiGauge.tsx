'use client';

import { motion } from 'framer-motion';

interface BmiGaugeProps {
    bmi: number | null;
}

export function BmiGauge({ bmi }: BmiGaugeProps) {
    // Max cap around 40 for scale
    const clampedBmi = bmi ? Math.min(Math.max(bmi, 15), 40) : 15;

    // Calculate percentage for pointer (range 15-40 translates to 0-100%)
    const percentage = ((clampedBmi - 15) / (40 - 15)) * 100;

    return (
        <div className="w-full py-6 flex flex-col items-center gap-4">
            {/* Gauge Scale */}
            <div className="relative w-full h-4 rounded-full overflow-hidden bg-slate-200 dark:bg-white/10 flex">
                <div className="h-full bg-blue-500" style={{ width: '14%' }} /> {/* 15-18.5 */}
                <div className="h-full bg-green-500" style={{ width: '26%' }} /> {/* 18.5-25 */}
                <div className="h-full bg-yellow-500" style={{ width: '20%' }} /> {/* 25-30 */}
                <div className="h-full bg-red-500 flex-1" /> {/* 30+ */}
            </div>

            {/* Pointer */}
            <div className="relative w-full h-1 mt-1">
                {bmi !== null && (
                    <motion.div
                        initial={{ left: '0%' }}
                        animate={{ left: `${Math.max(0, Math.min(percentage, 100))}%` }}
                        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
                        className="absolute -top-6 -ml-3 w-6 h-6 flex items-center justify-center filter drop-shadow-md dark:drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]"
                    >
                        <div className="w-0 h-0 border-l-[8px] border-l-transparent border-t-[12px] border-t-slate-800 dark:border-t-white border-r-[8px] border-r-transparent" />
                    </motion.div>
                )}
            </div>

            {/* Score */}
            <div className="text-center mt-2 h-[80px]">
                {bmi ? (
                    <motion.div key={bmi} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                        <h2 className="text-5xl font-black bg-clip-text text-transparent bg-gradient-to-br from-slate-800 to-slate-500 dark:from-white dark:to-white/60 drop-shadow-sm dark:drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            {bmi.toFixed(1)}
                        </h2>
                    </motion.div>
                ) : (
                    <h2 className="text-5xl font-black text-slate-300 dark:text-white/20">--</h2>
                )}
                <p className="text-sm text-muted-foreground uppercase tracking-widest mt-2 font-medium">
                    Your BMI Score
                </p>
            </div>
        </div>
    );
}
