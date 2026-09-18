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
      <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-4 transition hover:border-slate-700/80 hover:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Total Previsto</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800/80 text-slate-300">
            <Wallet className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="font-outfit text-xl font-bold tracking-tight text-white sm:text-2xl">
            {formatBRL(stats.totalCacheExpected)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-400">
          <CalendarDays className="h-3 w-3 text-slate-500" />
          <span>{stats.totalShows} shows no período</span>
        </div>
      </div>

      {/* Cachê Recebido */}
      <div className="group relative overflow-hidden rounded-2xl border border-emerald-950/60 bg-emerald-950/20 p-4 ring-1 ring-emerald-500/20 transition hover:border-emerald-800/60 hover:bg-emerald-950/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-emerald-300">Cachê Recebido</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="font-outfit text-xl font-bold tracking-tight text-emerald-400 sm:text-2xl">
            {formatBRL(stats.totalCacheReceived)}
          </span>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-400/90">
          <TrendingUp className="h-3 w-3" />
          <span>{percentReceived}% do total recebido</span>
        </div>
      </div>

      {/* Cachê Pendente */}
      <div className="group relative overflow-hidden rounded-2xl border border-amber-950/60 bg-amber-950/20 p-4 ring-1 ring-amber-500/20 transition hover:border-amber-800/60 hover:bg-amber-950/30">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-amber-300">Cachê Pendente</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
            <Clock className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2.5">
          <span className="font-outfit text-xl font-bold tracking-tight text-amber-400 sm:text-2xl">
            {formatBRL(stats.totalCachePending)}
          </span>
        </div>
        <div className="mt-1 text-[11px] text-amber-400/80">
          A receber dos contratantes
        </div>
      </div>

      {/* Resumo de Status */}
      <div className="group relative overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/90 p-4 transition hover:border-slate-700/80 hover:bg-slate-900">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-slate-400">Situação dos Shows</span>
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
            <CalendarDays className="h-4 w-4" />
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-outfit text-xl font-bold text-sky-400 sm:text-2xl">
            {stats.pendingShows}
          </span>
          <span className="text-xs text-slate-400">a realizar</span>
        </div>
        <div className="mt-1 flex items-center gap-2 text-[11px] text-slate-400">
          <span className="text-emerald-400">{stats.finishedShows} realizados</span>
          {stats.canceledShows > 0 && (
            <span className="text-red-400">• {stats.canceledShows} cancelados</span>
          )}
        </div>
      </div>
    </div>
  );
};
