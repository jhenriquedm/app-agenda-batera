import React, { useState } from 'react';
import { ShowEvent, BandArtist } from '../types';
import { formatBRL } from '../utils/currencyMask';
import { formatDateTime } from '../utils/formatters';
import {
  Clock,
  MapPin,
  Mic,
  CheckCircle2,
  Edit2,
  Trash2,
  Building2,
  MoreVertical,
} from 'lucide-react';

interface ShowCardProps {
  show: ShowEvent;
  onEdit: (show: ShowEvent) => void;
  onDelete: (show: ShowEvent) => void;
  onToggleCache: (id: string, current: 'recebido' | 'pendente') => void;
  onCycleShowStatus: (id: string, current: 'pendente' | 'finalizado' | 'cancelado') => void;
  band?: BandArtist;
}

export const ShowCard: React.FC<ShowCardProps> = ({
  show,
  onEdit,
  onDelete,
  onToggleCache,
  onCycleShowStatus,
  band,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const dateTime = formatDateTime(show.showDate);
  const isCacheReceived = show.cacheStatus === 'recebido';

  const dateObj = new Date(show.showDate);
  const dayNumber = isNaN(dateObj.getTime()) ? '--' : String(dateObj.getDate()).padStart(2, '0');
  const monthShort = isNaN(dateObj.getTime())
    ? ''
    : dateObj.toLocaleString('pt-BR', { month: 'short' }).replace('.', '').toUpperCase();

  return (
    <div
      id={`show-card-${show.id}`}
      className={`group relative rounded-2xl border transition-all duration-200 p-3 sm:p-3.5 shadow-xs ${
        show.showStatus === 'cancelado'
          ? 'bg-slate-100/80 dark:bg-slate-900/40 border-black dark:border-slate-800/80 opacity-70'
          : show.showStatus === 'finalizado'
          ? 'bg-white dark:bg-slate-900/70 border-black dark:border-slate-800 hover:border-black/70 dark:hover:border-slate-700'
          : 'bg-white dark:bg-slate-900 border-black dark:border-slate-800 hover:border-amber-500/80 dark:hover:border-amber-500/50'
      }`}
    >
      {/* Top Header: Data / Status / Menu Kebab Vertical */}
      <div className="flex items-start justify-between gap-2.5 mb-2">
        {/* Bloco de Data Compacto e Elegante */}
        <div className="flex items-center gap-2.5">
          <div className="flex flex-col items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800/90 px-2.5 py-1 min-w-[44px] border border-black dark:border-slate-700/60 shadow-xs">
            <span className="font-outfit text-sm sm:text-base font-black leading-none text-slate-950 dark:text-white">
              {dayNumber}
            </span>
            <span className="text-[9px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 mt-0.5">
              {monthShort}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-slate-300 font-bold">
              <span>{dateTime.dayOfWeek}</span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-950 dark:text-slate-200 font-extrabold">
                <Clock className="h-3 w-3 text-slate-600 dark:text-slate-400" />
                {dateTime.timeFormatted}
              </span>
              {dateTime.relative && (
                <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 text-[9px] font-extrabold text-amber-900 dark:text-amber-400 border border-black/30 dark:border-amber-500/30 ml-0.5">
                  {dateTime.relative}
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-700 dark:text-slate-400 font-semibold flex items-center gap-1 mt-0.5">
              <Building2 className="h-2.5 w-2.5 text-slate-600" />
              <span>{show.modality}</span>
            </div>
          </div>
        </div>

        {/* Status do Show e Menu Kebab Vertical em Evidência */}
        <div className="flex items-center gap-1.5 relative">
          <button
            type="button"
            id={`btn-cycle-status-${show.id}`}
            onClick={() => onCycleShowStatus(show.id, show.showStatus)}
            title="Alternar status: Pendente / Realizado / Cancelado"
            className={`rounded-full px-2 py-0.5 text-[10px] font-bold transition active:scale-95 shadow-xs border border-black dark:border-transparent ${
              show.showStatus === 'finalizado'
                ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/40'
                : show.showStatus === 'cancelado'
                ? 'bg-red-100 dark:bg-red-500/20 text-red-950 dark:text-red-300 ring-1 ring-red-500/40'
                : 'bg-sky-100 dark:bg-sky-500/20 text-sky-950 dark:text-sky-300 ring-1 ring-sky-500/40'
            }`}
          >
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-current mr-1 align-middle"></span>
            <span className="capitalize">
              {show.showStatus === 'finalizado'
                ? 'Realizado'
                : show.showStatus === 'cancelado'
                ? 'Cancelado'
                : 'Agendado'}
            </span>
          </button>

          {/* Botão de Menu Kebab Vertical Destacado */}
          <div className="relative">
            <button
              type="button"
              id={`btn-menu-${show.id}`}
              onClick={() => setShowMenu(!showMenu)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-black dark:border-slate-700/80 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-amber-500/10 transition shadow-xs"
              title="Opções do show"
            >
              <MoreVertical className="h-4 w-4 stroke-[2.4]" />
            </button>

            {showMenu && (
              <div
                className="absolute right-0 top-9 z-20 w-40 rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 p-1.5 shadow-xl text-xs"
                onMouseLeave={() => setShowMenu(false)}
              >
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onEdit(show);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-slate-900 dark:text-slate-200 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition text-left"
                >
                  <Edit2 className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                  <span>Editar Detalhes</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onDelete(show);
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-red-700 dark:text-red-400 font-bold hover:bg-red-50 dark:hover:bg-red-950/40 transition text-left"
                >
                  <Trash2 className="h-3.5 w-3.5 text-red-600" />
                  <span>Excluir Show</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Conteúdo Central: Estabelecimento/Local e Cantor/Banda Compactos */}
      <div className="space-y-1.5 my-1.5">
        <h3 className="font-outfit text-sm sm:text-base font-extrabold tracking-tight text-slate-950 dark:text-white flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
          <span className="truncate">{show.venue}</span>
        </h3>

        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="inline-flex items-center gap-1.5 rounded-lg px-2 py-0.5 bg-slate-100 dark:bg-slate-800/90 border border-black dark:border-slate-700/60 text-xs font-bold">
            <span
              className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
              style={{ backgroundColor: band?.color || '#f59e0b' }}
              title={band?.genre ? `${band.name} (${band.genre})` : show.singerBand}
            />
            <Mic className="h-3 w-3 text-slate-600 shrink-0" />
            <span className="text-slate-950 dark:text-slate-100 truncate max-w-[170px]">
              {show.singerBand}
            </span>
          </div>

          {band?.genre && (
            <span
              className="rounded-md px-1.5 py-0.2 text-[9px] font-bold border border-black/20"
              style={{
                backgroundColor: `${band.color}20`,
                color: band.color,
              }}
            >
              {band.genre}
            </span>
          )}
        </div>

        {show.notes && (
          <p className="text-[11px] text-slate-700 dark:text-slate-400 italic line-clamp-1 pt-0.5 font-medium">
            "{show.notes}"
          </p>
        )}
      </div>

      {/* Rodapé do Card: Valor do Cachê e Badge de Pagamento */}
      <div className="mt-2.5 pt-2 border-t border-black/20 dark:border-slate-800/80 flex items-center justify-between">
        <div>
          <span className="text-[9px] font-extrabold uppercase tracking-wider text-slate-600 dark:text-slate-400">
            Cachê
          </span>
          <div className="font-outfit text-base sm:text-lg font-black tracking-tight text-slate-950 dark:text-white">
            {formatBRL(show.cacheValue)}
          </div>
        </div>

        {/* Botão de Alternar Cachê */}
        <button
          type="button"
          id={`btn-toggle-cache-${show.id}`}
          onClick={() => onToggleCache(show.id, show.cacheStatus)}
          title="Toque para alternar: Recebido / A receber"
          className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-[11px] font-black transition active:scale-95 shadow-xs border border-black dark:border-transparent ${
            isCacheReceived
              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-200 dark:hover:bg-emerald-500/30'
              : 'bg-amber-100 dark:bg-amber-500/20 text-amber-950 dark:text-amber-300 ring-1 ring-amber-500/40 hover:bg-amber-200 dark:hover:bg-amber-500/30'
          }`}
        >
          {isCacheReceived ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700 dark:text-emerald-400" />
              <span>Recebido</span>
            </>
          ) : (
            <>
              <Clock className="h-3.5 w-3.5 text-amber-700 dark:text-amber-400" />
              <span>A Receber</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
