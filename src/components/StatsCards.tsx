import React from 'react';
import { ShowStats } from '../types';
import { formatBRL } from '../utils/currencyMask';
import { Wallet, CheckCircle2, Clock, CalendarDays, TrendingUp } from 'lucide-react';

interface StatsCardsProps {
  stats: ShowStats;
}

export const StatsCards: React.FC<StatsCardsProps> = ({ stats }) => {
  const percentReceived =
    stats.totalCacheExpected > 0
      ? Math.round((stats.totalCacheReceived / stats.totalCacheExpected) * 100)
      : 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      {/* Total Previsto */}
      <div className="group relative overflow-hidden rounded-2xl border border-black dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3.5 sm:p-4 shadow-xs transition hover:border-black/70 dark:hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Total Previsto</span>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            <Wallet className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="font-outfit text-lg sm:text-2xl font-black tracking-tight text-slate-950 dark:text-white">
            {formatBRL(stats.totalCacheExpected)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 dark:text-slate-400">
          <CalendarDays className="h-3 w-3 text-slate-500 dark:text-slate-400" />
          <span>{stats.totalShows} shows no período</span>
        </div>
      </div>

      {/* Cachê Recebido */}
      <div className="group relative overflow-hidden rounded-2xl border border-black dark:border-emerald-800/80 bg-emerald-50/90 dark:bg-emerald-950/20 p-3.5 sm:p-4 ring-1 ring-emerald-500/20 shadow-xs transition hover:border-black/70">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-emerald-900 dark:text-emerald-300">Cachê Recebido</span>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-emerald-100 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-400">
            <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="font-outfit text-lg sm:text-2xl font-black tracking-tight text-emerald-800 dark:text-emerald-400">
            {formatBRL(stats.totalCacheReceived)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-800 dark:text-emerald-400 font-bold">
          <TrendingUp className="h-3 w-3" />
          <span>{percentReceived}% do total recebido</span>
        </div>
      </div>

      {/* Cachê Pendente */}
      <div className="group relative overflow-hidden rounded-2xl border border-black dark:border-amber-800/80 bg-amber-50/90 dark:bg-amber-950/20 p-3.5 sm:p-4 ring-1 ring-amber-500/20 shadow-xs transition hover:border-black/70">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-amber-950 dark:text-amber-300">Cachê Pendente</span>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-amber-100 dark:bg-amber-500/15 text-amber-800 dark:text-amber-400">
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className="mt-2">
          <span className="font-outfit text-lg sm:text-2xl font-black tracking-tight text-amber-900 dark:text-amber-400">
            {formatBRL(stats.totalCachePending)}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-amber-900 dark:text-amber-400 font-bold">
          A receber dos contratantes
        </div>
      </div>

      {/* Resumo de Status */}
      <div className="group relative overflow-hidden rounded-2xl border border-black dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3.5 sm:p-4 shadow-xs transition hover:border-black/70 dark:hover:border-slate-700">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Situação dos Shows</span>
          <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-xl bg-sky-100 dark:bg-sky-500/15 text-sky-800 dark:text-sky-400">
            <CalendarDays className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-1.5">
          <span className="font-outfit text-lg sm:text-2xl font-black text-sky-700 dark:text-sky-400">
            {stats.pendingShows}
          </span>
          <span className="text-xs font-bold text-slate-600 dark:text-slate-400">a realizar</span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-400 font-semibold">
          <span className="text-emerald-700 dark:text-emerald-400 font-bold">{stats.finishedShows} feitos</span>
          {stats.canceledShows > 0 && (
            <span className="text-red-600 dark:text-red-400 font-bold">• {stats.canceledShows} canc.</span>
          )}
        </div>
      </div>
    </div>
  );
};
