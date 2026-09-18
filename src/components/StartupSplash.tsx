import React, { useEffect, useState } from 'react';
import { DrumAppIcon } from './DrumAppIcon';
import { APP_VERSION } from '../version';
import { motion, AnimatePresence } from 'motion/react';

interface StartupSplashProps {
  onFinish: () => void;
  minDurationMs?: number;
}

export const StartupSplash: React.FC<StartupSplashProps> = ({
  onFinish,
  minDurationMs = 1800,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, Math.round((elapsed / minDurationMs) * 100));
      setProgress(pct);

      if (elapsed >= minDurationMs) {
        clearInterval(interval);
        setTimeout(onFinish, 200);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [minDurationMs, onFinish]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0, scale: 1.05 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 px-6 py-12 text-white select-none overflow-hidden"
      >
        {/* Ambient Top Glow */}
        <div className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 rounded-full bg-amber-500/15 blur-[100px]" />

        {/* Top spacer */}
        <div className="w-full flex justify-end">
          <button
            type="button"
            onClick={onFinish}
            className="text-xs font-semibold text-slate-400 hover:text-amber-400 transition px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800"
          >
            Pular
          </button>
        </div>

        {/* Center Presentation Area */}
        <div className="flex flex-col items-center text-center my-auto">
          {/* Animated App Icon matching the user's drum image */}
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            transition={{ type: 'spring', damping: 15, stiffness: 180, delay: 0.1 }}
            className="relative"
          >
            <div className="absolute -inset-4 rounded-3xl bg-amber-500/20 blur-xl animate-pulse" />
            <DrumAppIcon
              size="2xl"
              rounded="rounded-3xl"
              className="border-2 border-black/80 shadow-[0_10px_35px_rgba(245,158,11,0.35)]"
            />
          </motion.div>

          {/* Title & Subtitle */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="font-outfit text-3xl sm:text-4xl font-black tracking-tight text-white mt-6"
          >
            Agenda do Batera
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.4 }}
            className="text-sm font-semibold text-amber-400/90 mt-2 max-w-xs"
          >
            Gestão de shows, cachês e apresentações
          </motion.p>

          {/* Progress bar */}
          <div className="w-44 bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-800 mt-8">
            <motion.div
              className="h-full bg-amber-500 rounded-full"
              style={{ width: `${progress}%` }}
              transition={{ ease: 'linear' }}
            />
          </div>
        </div>

        {/* Footer info */}
        <div className="flex flex-col items-center gap-1">
          <span className="text-[11px] font-mono font-bold tracking-wider text-slate-300">
            v{APP_VERSION}
          </span>
          <span className="text-[10px] text-slate-400">
            100% Offline & Sincronização em Nuvem
          </span>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
