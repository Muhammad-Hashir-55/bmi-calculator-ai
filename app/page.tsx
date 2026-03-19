'use client';

import { BmiCalculator } from '@/components/bmi/BmiCalculator';
import { HealthAssistant } from '@/components/chat/HealthAssistant';
import { CalorieCatcher } from '@/components/game/CalorieCatcher';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function Home() {
  return (
    <main className="min-h-screen relative p-4 md:p-6 lg:p-10 overflow-x-hidden selection:bg-emerald-500/30">
      {/* Background decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay"></div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10 w-full">

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col md:flex-row justify-between items-center gap-6 border-b border-white/5 pb-6"
        >
          <div className="text-center md:text-left">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black bg-clip-text text-transparent bg-gradient-to-r from-white via-white/90 to-white/60 tracking-tighter drop-shadow-sm">
              Aura <span className="text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.4)]">Health</span>
            </h1>
            <p className="text-white/60 font-medium mt-2 uppercase tracking-[0.2em] text-xs">
              AI-Powered Wellness Operating System
            </p>
          </div>
        </motion.header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column: BMI & Game */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 100 }}
            className="lg:col-span-5 xl:col-span-4 space-y-8 flex flex-col w-full"
          >
            <BmiCalculator />
            <CalorieCatcher />
          </motion.div>

          {/* Right Column: AI Assistant */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3, type: "spring", stiffness: 100 }}
            className="lg:col-span-7 xl:col-span-8 flex flex-col w-full h-full"
          >
            <HealthAssistant />
          </motion.div>

        </div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center pt-8 pb-4 text-xs text-white/40 font-medium tracking-wide uppercase"
        >
          <Sparkles size={12} className="inline mr-1 text-emerald-500/50" />
          Aura Health &copy; {new Date().getFullYear()} – Made for visual excellence
        </motion.footer>
      </div>
    </main>
  );
}
