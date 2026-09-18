import React from 'react';
import { ShowFilters } from '../types';
import { MONTH_NAMES } from '../utils/formatters';
import { Search, Filter, X, Mic, MapPin, Calendar, Sparkles } from 'lucide-react';

interface FilterBarProps {
  filters: ShowFilters;
  onFilterChange: (newFilters: ShowFilters) => void;
  availableSingers: string[];
  availableVenues: string[];
  totalResultsCount: number;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  availableSingers,
  availableVenues,
  totalResultsCount,
}) => {
  const currentYear = new Date().getFullYear();
  const years = [currentYear - 1, currentYear, currentYear + 1];

  const hasActiveFilters =
    filters.singerBand !== '' ||
    filters.venue !== '' ||
    filters.month !== 0 ||
    filters.year !== 0 ||
    filters.modality !== 'todos' ||
    filters.cacheStatus !== 'todos' ||
    filters.showStatus !== 'todos' ||
    filters.searchQuery !== '';

  const resetFilters = () => {
    onFilterChange({
      singerBand: '',
      venue: '',
      month: 0,
      year: 0,
      modality: 'todos',
      cacheStatus: 'todos',
      showStatus: 'todos',
      searchQuery: '',
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm backdrop-blur-sm">
      <div className="flex flex-col gap-3">
        {/* Top Search & Filter Heading */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Filtros de Shows
            </span>
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-400">
              {totalResultsCount} {totalResultsCount === 1 ? 'show' : 'shows'}
            </span>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-400 transition hover:text-amber-300"
            >
              <X className="h-3.5 w-3.5" />
              <span>Limpar filtros</span>
            </button>
          )}
        </div>

        {/* Primary Filter Grid */}
        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {/* 1. Nome do Cantor */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <Mic className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={filters.singerBand}
              onChange={(e) => onFilterChange({ ...filters, singerBand: e.target.value })}
              placeholder="Nome do cantor / banda..."
              list="singers-list"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <datalist id="singers-list">
              {availableSingers.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
          </div>

          {/* 2. Nome do Estabelecimento */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={filters.venue}
              onChange={(e) => onFilterChange({ ...filters, venue: e.target.value })}
              placeholder="Nome do estabelecimento / local..."
              list="venues-list"
              className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2 pl-9 pr-3 text-xs text-white placeholder-slate-500 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <datalist id="venues-list">
              {availableVenues.map((v) => (
                <option key={v} value={v} />
              ))}
            </datalist>
          </div>

          {/* 3. Mês e Ano */}
          <div className="grid grid-cols-2 gap-2">
            <select
              value={filters.month}
              onChange={(e) => onFilterChange({ ...filters, month: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-white transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value={0}>Mês: Todos</option>
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>

            <select
              value={filters.year}
              onChange={(e) => onFilterChange({ ...filters, year: Number(e.target.value) })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950 px-2.5 py-2 text-xs text-white transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value={0}>Ano: Todos</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* 4. Modalidade (Particular ou Barzinho/Restaurante) */}
          <select
            value={filters.modality}
            onChange={(e) => onFilterChange({ ...filters, modality: e.target.value as any })}
            className="w-full rounded-xl border border-slate-800 bg-slate-950 px-3 py-2 text-xs text-white transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="todos">Modalidade: Todas</option>
            <option value="Particular">Particular (Casamentos, Eventos)</option>
            <option value="Barzinho/Restaurante">Barzinho / Restaurante</option>
          </select>
        </div>

        {/* Secondary Quick Pill Filters (Status do Cachê & Status do Show) */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/60 text-xs">
          <span className="text-[11px] font-medium text-slate-500">Cachê:</span>
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                cacheStatus: filters.cacheStatus === 'recebido' ? 'todos' : 'recebido',
              })
            }
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              filters.cacheStatus === 'recebido'
                ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Recebido
          </button>
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                cacheStatus: filters.cacheStatus === 'pendente' ? 'todos' : 'pendente',
              })
            }
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              filters.cacheStatus === 'pendente'
                ? 'bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/40'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Pendente
          </button>

          <span className="ml-2 text-[11px] font-medium text-slate-500">Show:</span>
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                showStatus: filters.showStatus === 'pendente' ? 'todos' : 'pendente',
              })
            }
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              filters.showStatus === 'pendente'
                ? 'bg-sky-500/20 text-sky-300 ring-1 ring-sky-500/40'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Agendado
          </button>
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                showStatus: filters.showStatus === 'finalizado' ? 'todos' : 'finalizado',
              })
            }
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              filters.showStatus === 'finalizado'
                ? 'bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/40'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Finalizado
          </button>
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                showStatus: filters.showStatus === 'cancelado' ? 'todos' : 'cancelado',
              })
            }
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition ${
              filters.showStatus === 'cancelado'
                ? 'bg-red-500/20 text-red-300 ring-1 ring-red-500/40'
                : 'bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
            }`}
          >
            Cancelado
          </button>
        </div>
      </div>
    </div>
  );
};
