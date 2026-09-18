import React, { useState } from 'react';
import { ShowEvent } from '../types';
import { formatBRL } from '../utils/currencyMask';
import { formatDateTime } from '../utils/formatters';
import {
  Calendar,
  Clock,
  MapPin,
  Mic,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  Share2,
  Check,
  Building2,
  Sparkles,
} from 'lucide-react';

interface ShowCardProps {
  show: ShowEvent;
  onEdit: (show: ShowEvent) => void;
  onDelete: (show: ShowEvent) => void;
  onToggleCache: (id: string, current: 'recebido' | 'pendente') => void;
  onCycleShowStatus: (id: string, current: 'pendente' | 'finalizado' | 'cancelado') => void;
}

export const ShowCard: React.FC<ShowCardProps> = ({
  show,
  onEdit,
  onDelete,
  onToggleCache,
  onCycleShowStatus,
}) => {
  const [copied, setCopied] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const dateTime = formatDateTime(show.showDate);

  const isCacheReceived = show.cacheStatus === 'recebido';

  const copyShowDetails = async () => {
    const text = `🥁 *Show: ${show.singerBand}*\n📅 Data: ${dateTime.dateFormatted} às ${dateTime.timeFormatted} (${dateTime.dayOfWeek})\n📍 Local: ${show.venue}\n🎭 Modalidade: ${show.modality}\n💰 Cachê: ${formatBRL(show.cacheValue)} (${isCacheReceived ? 'RECEBIDO ✅' : 'PENDENTE ⏳'})${show.notes ? `\n📝 Obs: ${show.notes}` : ''}`;

    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      // Fallback
    }
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-200 ${
        show.showStatus === 'cancelado'
          ? 'border-slate-800/80 bg-slate-950/40 opacity-70'
          : show.showStatus === 'finalizado'
          ? 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
          : 'border-slate-800 bg-slate-900/90 shadow-md hover:border-amber-500/30 hover:bg-slate-900'
      }`}
    >
      {/* Top Bar / Status & Modality */}
      <div className="flex items-center justify-between border-b border-slate-800/60 px-4 py-2.5 text-xs">
        <div className="flex items-center gap-2">
          {/* Modality Badge */}
          <span
            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[11px] font-semibold ${
              show.modality === 'Particular'
                ? 'bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/30'
                : 'bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30'
            }`}
          >
            <Building2 className="h-3 w-3" />
            {show.modality}
          </span>

          {/* Date relative indicator */}
          {dateTime.relative && (
            <span className="rounded-md bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-400 ring-1 ring-amber-500/30">
              {dateTime.relative}
            </span>
          )}
        </div>

        {/* Show Status Badge (Interactive) */}
        <button
          type="button"
          onClick={() => onCycleShowStatus(show.id, show.showStatus)}
          title="Clique para alternar status do show (Pendente / Finalizado / Cancelado)"
          className={`group/status flex items-center gap-1.5 rounded-lg px-2.5 py-0.5 text-[11px] font-semibold transition ${
            show.showStatus === 'finalizado'
              ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30 hover:bg-emerald-500/25'
              : show.showStatus === 'cancelado'
              ? 'bg-red-500/15 text-red-300 ring-1 ring-red-500/30 hover:bg-red-500/25'
              : 'bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30 hover:bg-sky-500/25'
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current"></span>
          <span className="capitalize">
            {show.showStatus === 'finalizado'
              ? 'Finalizado'
              : show.showStatus === 'cancelado'
              ? 'Cancelado'
              : 'Pendente'}
          </span>
        </button>
      </div>

      {/* Main Content */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Singer & Venue Info */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-400">
                <Mic className="h-4 w-4" />
              </div>
              <h3 className="font-outfit text-base font-bold tracking-tight text-white sm:text-lg">
                {show.singerBand}
              </h3>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 text-slate-500" />
                <span className="font-medium text-slate-300">{show.venue}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-400/80" />
                <span className="text-slate-300">
                  {dateTime.dayOfWeek}, {dateTime.dateFormatted}
                </span>
                <Clock className="ml-1 h-3.5 w-3.5 text-slate-500" />
                <span className="font-medium text-amber-300">{dateTime.timeFormatted}</span>
              </div>
            </div>
          </div>

          {/* Quick Share and Menu */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={copyShowDetails}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 transition hover:border-amber-500/40 hover:text-amber-400"
              title="Copiar informações do show para WhatsApp"
            >
              {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Share2 className="h-3.5 w-3.5" />}
            </button>
            <button
              type="button"
              onClick={() => onEdit(show)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 transition hover:border-slate-700 hover:text-white"
              title="Editar Show"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(show)}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-950 text-slate-400 transition hover:border-red-900/50 hover:bg-red-950/20 hover:text-red-400"
              title="Excluir Show"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Notes if present */}
        {show.notes && (
          <div className="mt-3 rounded-xl bg-slate-950/60 px-3 py-2 text-xs text-slate-400 ring-1 ring-slate-800/80">
            <span className="font-semibold text-slate-300">Obs do Batera: </span>
            {show.notes}
          </div>
        )}

        {/* Bottom Cache Value & Cache Status Toggle */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-950/70 p-3">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Valor do Cachê
            </span>
            <div className="font-outfit text-lg font-extrabold tracking-tight text-white sm:text-xl">
              {formatBRL(show.cacheValue)}
            </div>
          </div>

          {/* Interactive Cache Toggle Button */}
          <button
            type="button"
            onClick={() => onToggleCache(show.id, show.cacheStatus)}
            className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition active:scale-95 ${
              isCacheReceived
                ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/40 hover:bg-emerald-500/25'
                : 'bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/40 hover:bg-amber-500/25'
            }`}
            title="Toque para alternar entre Cachê Recebido e Pendente"
          >
            {isCacheReceived ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>Cachê Recebido</span>
              </>
            ) : (
              <>
                <AlertCircle className="h-4 w-4 text-amber-400" />
                <span>Cachê Pendente</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
