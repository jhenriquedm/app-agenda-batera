import React, { useState } from 'react';
import { ShowFilters, BandArtist } from '../types';
import { MONTH_NAMES } from '../utils/formatters';
import { Filter, X, Mic, MapPin, ChevronDown, ChevronUp } from 'lucide-react';

interface FilterBarProps {
  filters: ShowFilters;
  onFilterChange: (newFilters: ShowFilters) => void;
  availableSingers: string[];
  availableVenues: string[];
  totalResultsCount: number;
  bands?: BandArtist[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onFilterChange,
  availableSingers,
  availableVenues,
  totalResultsCount,
  bands = [],
}) => {
  const [isExpandedMobile, setIsExpandedMobile] = useState(false);

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
    <div className="rounded-2xl border border-black dark:border-slate-800 bg-white dark:bg-slate-900/90 p-3.5 sm:p-4 shadow-xs backdrop-blur-sm transition">
      <div className="flex flex-col gap-3">
        {/* Cabeçalho do Filtro */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-amber-500" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-slate-200">
              Filtros
            </span>
            <span className="rounded-full bg-slate-200/80 dark:bg-slate-800 px-2 py-0.5 text-[11px] font-bold text-slate-800 dark:text-slate-300">
              {totalResultsCount} {totalResultsCount === 1 ? 'show' : 'shows'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-400 hover:underline"
              >
                <X className="h-3.5 w-3.5" />
                <span>Limpar</span>
              </button>
            )}

            {/* Toggle sanfona para economizar espaço no celular */}
            <button
              type="button"
              onClick={() => setIsExpandedMobile(!isExpandedMobile)}
              className="sm:hidden flex items-center gap-1 rounded-lg border border-black dark:border-slate-700 px-2 py-1 text-xs font-bold text-slate-900 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <span>{isExpandedMobile ? 'Menos' : 'Mais'}</span>
              {isExpandedMobile ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>

        {/* Inputs de Filtro (responsivos) */}
        <div className={`grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4 ${isExpandedMobile ? 'block' : 'hidden sm:grid'}`}>
          {/* 1. Nome do Cantor */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600 dark:text-slate-400">
              <Mic className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={filters.singerBand}
              onChange={(e) => onFilterChange({ ...filters, singerBand: e.target.value.replace(/[<>{}%$&@\\^~+=|;"'`]/g, '') })}
              placeholder="Cantor / banda..."
              list="singers-list"
              className="w-full rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 py-2 pl-9 pr-3 text-xs text-slate-950 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 font-medium transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
            <datalist id="singers-list">
              {bands.map((b) => (
                <option key={b.id} value={b.name} />
              ))}
              {availableSingers
                .filter((s) => !bands.some((b) => b.name.toLowerCase() === s.toLowerCase()))
                .map((s) => (
                  <option key={s} value={s} />
                ))}
            </datalist>
          </div>

          {/* 2. Nome do Estabelecimento */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-600 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5" />
            </div>
            <input
              type="text"
              value={filters.venue}
              onChange={(e) => onFilterChange({ ...filters, venue: e.target.value.replace(/[<>{}%$&@\\^~+=|;"'`]/g, '') })}
              placeholder="Local / estabelecimento..."
              list="venues-list"
              className="w-full rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 py-2 pl-9 pr-3 text-xs text-slate-950 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 font-medium transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
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
              className="w-full rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 px-2.5 py-2 text-xs text-slate-950 dark:text-white font-medium transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            >
              <option value={0}>Mês: Todos</option>
              {MONTH_NAMES.map((name, idx) => (
                <option key={name} value={idx + 1}>
                  {name}
                </option>
              ))}
            </select>

            <input
              type="text"
              inputMode="numeric"
              maxLength={4}
              value={filters.year === 0 ? '' : String(filters.year)}
              onChange={(e) => {
                const numericOnly = e.target.value.replace(/\D/g, '').slice(0, 4);
                onFilterChange({ ...filters, year: numericOnly ? Number(numericOnly) : 0 });
              }}
              placeholder="Ano (ex: 2026)"
              title="Filtrar por ano (apenas números, até 4 dígitos)"
              className="w-full rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 px-2.5 py-2 text-xs text-slate-950 dark:text-white placeholder-slate-500 dark:placeholder-slate-400 font-medium transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* 4. Modalidade */}
          <select
            value={filters.modality}
            onChange={(e) => onFilterChange({ ...filters, modality: e.target.value as any })}
            className="w-full rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 px-3 py-2 text-xs text-slate-950 dark:text-white font-medium transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          >
            <option value="todos">Todas as Modalidades</option>
            <option value="Particular">Particular (Eventos)</option>
            <option value="Barzinho/Restaurante">Barzinho / Restaurante</option>
          </select>
        </div>

        {/* Chips de Status (Cachê e Show) - Show organizado abaixo de Cachê */}
        <div className="flex flex-col gap-2.5 pt-2.5 border-t border-black/20 dark:border-slate-800/80 text-xs">
          {/* Linha Cachê */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-300 w-12 shrink-0">Cachê:</span>
            <button
              type="button"
              onClick={() =>
                onFilterChange({
                  ...filters,
                  cacheStatus: filters.cacheStatus === 'recebido' ? 'todos' : 'recebido',
                })
              }
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition border ${
                filters.cacheStatus === 'recebido'
                  ? 'bg-emerald-600 text-white border-black shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 border-black dark:border-slate-700'
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
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition border ${
                filters.cacheStatus === 'pendente'
                  ? 'bg-amber-500 text-slate-950 border-black shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 border-black dark:border-slate-700'
              }`}
            >
              Pendente
            </button>
          </div>

          {/* Linha Show (Abaixo de Cachê) */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[11px] font-bold text-slate-900 dark:text-slate-300 w-12 shrink-0">Show:</span>
            <button
              type="button"
              onClick={() =>
                onFilterChange({
                  ...filters,
                  showStatus: filters.showStatus === 'pendente' ? 'todos' : 'pendente',
                })
              }
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition border ${
                filters.showStatus === 'pendente'
                  ? 'bg-sky-600 text-white border-black shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 border-black dark:border-slate-700'
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
              className={`rounded-lg px-2.5 py-1 text-xs font-bold transition border ${
                filters.showStatus === 'finalizado'
                  ? 'bg-slate-900 text-white dark:bg-slate-200 dark:text-slate-900 border-black shadow-xs'
                  : 'bg-white hover:bg-slate-100 text-slate-900 dark:bg-slate-800/80 dark:text-slate-300 border-black dark:border-slate-700'
              }`}
            >
              Realizado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
