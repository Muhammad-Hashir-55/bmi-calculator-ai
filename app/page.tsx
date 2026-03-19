'use client';

import { BmiCalculator } from '@/components/bmi/BmiCalculator';
import { HealthAssistant } from '@/components/chat/HealthAssistant';
import { ThemeToggle } from '@/components/ThemeToggle';
import { CalorieCatcher } from '@/components/game/CalorieCatcher';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import {
  Activity,
  Bot,
  Gamepad2,
  Sparkles,
} from 'lucide-react';

const navLinks = [
  { href: '#bmi', label: 'BMI Lab' },
  { href: '#coach', label: 'AI Coach' },
  { href: '#game', label: 'Game Zone' },
];

const heroStats = [
  {
    icon: Activity,
    label: 'Track faster',
    value: 'BMI in seconds',
  },
  {
    icon: Bot,
    label: 'Ask smarter',
    value: 'Live health prompts',
  },
  {
    icon: Gamepad2,
    label: 'Stay engaged',
    value: 'Touch-friendly challenge',
  },
];

export default function Home() {
  return (
    <main className="relative min-h-screen overflow-x-clip px-4 pb-10 pt-4 sm:px-6 sm:pb-12 lg:px-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-[36rem] bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.2),_transparent_28%),linear-gradient(180deg,_rgba(255,255,255,0.78),_transparent_68%)] dark:bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.22),_transparent_36%),radial-gradient(circle_at_top_right,_rgba(96,165,250,0.18),_transparent_28%),linear-gradient(180deg,_rgba(2,6,23,0.84),_transparent_68%)]" />
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.45),transparent_18%),radial-gradient(circle_at_80%_15%,rgba(255,255,255,0.28),transparent_14%),linear-gradient(120deg,transparent_0%,rgba(148,163,184,0.08)_50%,transparent_100%)] opacity-70 dark:opacity-40" />

      <div className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-6 sm:gap-8">
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: 'easeOut' }}
          className="flex flex-col gap-4 rounded-[2rem] border border-slate-200/70 bg-white/70 px-4 py-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 sm:px-6"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-emerald-300/60 bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.28em] text-emerald-700 dark:border-emerald-400/20 dark:bg-emerald-400/10 dark:text-emerald-300">
                <Sparkles size={12} />
                Aura Health
              </div>
              <div className="space-y-2">
                <h1 className="max-w-3xl text-4xl font-black tracking-[-0.06em] text-slate-950 dark:text-white sm:text-5xl lg:text-6xl">
                  Health tools that feel good on mobile, not cramped and broken.
                </h1>
                <p className="max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300 sm:text-base">
                  Check BMI, talk to the AI coach, and play a sharper mini-game
                  in one touch-friendly flow with smoother scrolling and a much
                  cleaner interface.
                </p>
              </div>
            </div>
            <ThemeToggle />
          </div>

          <div className="flex flex-wrap gap-2">
            {navLinks.map((link) => (
              <Button
                key={link.href}
                asChild
                variant="outline"
                className="h-10 rounded-full border-slate-300/80 bg-white/75 px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-400 hover:bg-emerald-50 hover:text-emerald-700 dark:border-white/10 dark:bg-white/5 dark:text-slate-200 dark:hover:border-emerald-400/40 dark:hover:bg-emerald-400/10 dark:hover:text-emerald-200"
              >
                <a href={link.href}>{link.label}</a>
              </Button>
            ))}
          </div>
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="rounded-[2rem] border border-slate-200/70 bg-white/75 p-5 shadow-[0_24px_90px_rgba(15,23,42,0.08)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-950/55 sm:p-7"
        >
          <div className="grid gap-3 sm:grid-cols-3">
            {heroStats.map((stat) => {
              const Icon = stat.icon;

              return (
                <div
                  key={stat.label}
                  className="rounded-[1.5rem] border border-slate-200/70 bg-slate-50/80 p-4 dark:border-white/10 dark:bg-white/5"
                >
                  <div className="mb-3 flex size-10 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20">
                    <Icon size={18} />
                  </div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    {stat.label}
                  </p>
                  <p className="mt-2 text-base font-semibold text-slate-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
              );
            })}
          </div>
        </motion.section>

        <div className="grid items-start gap-6 lg:grid-cols-12">
          <motion.div
            initial={{ opacity: 0, x: -24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="space-y-6 lg:col-span-5 xl:col-span-4"
          >
            <section id="bmi" className="scroll-mt-24 space-y-3">
              <div className="px-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  BMI Lab
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">
                  Calculate fast, read clearly.
                </h2>
              </div>
              <BmiCalculator />
            </section>

            <section id="game" className="scroll-mt-24 space-y-3">
              <div className="px-1">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                  Game Zone
                </p>
                <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">
                  Reflex game with better feedback.
                </h2>
              </div>
              <CalorieCatcher />
            </section>
          </motion.div>

          <motion.section
            id="coach"
            initial={{ opacity: 0, x: 24 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="scroll-mt-24 space-y-3 lg:col-span-7 xl:col-span-8"
          >
            <div className="px-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
                AI Coach
              </p>
              <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-slate-950 dark:text-white">
                Responsive chat with smoother reading.
              </h2>
            </div>
            <div className="lg:sticky lg:top-6">
              <HealthAssistant />
            </div>
          </motion.section>
        </div>

        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.55 }}
          className="pb-2 pt-2 text-center text-xs font-medium uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400"
        >
          Aura Health {new Date().getFullYear()} | rebuilt for smooth mobile use
        </motion.footer>
      </div>
    </main>
  );
}
