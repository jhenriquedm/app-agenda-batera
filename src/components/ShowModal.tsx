import React, { useState, useEffect } from 'react';
import { ShowEvent, ModalityType, CacheStatusType, ShowStatusType } from '../types';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currencyMask';
import {
  X,
  Plus,
  DollarSign,
  Calendar,
  Clock,
  Mic,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  FileText,
  Drum,
  Save,
  Sparkles,
} from 'lucide-react';

interface ShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ShowEvent, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => Promise<void>;
  editingShow?: ShowEvent | null;
  existingSingers: string[];
  existingVenues: string[];
}

export const ShowModal: React.FC<ShowModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingShow,
  existingSingers,
  existingVenues,
}) => {
  const [cacheInput, setCacheInput] = useState('');
  const [datePart, setDatePart] = useState('');
  const [timePart, setTimePart] = useState('21:00');
  const [singerBand, setSingerBand] = useState('');
  const [venue, setVenue] = useState('');
  const [modality, setModality] = useState<ModalityType>('Barzinho/Restaurante');
  const [cacheStatus, setCacheStatus] = useState<CacheStatusType>('pendente');
  const [showStatus, setShowStatus] = useState<ShowStatusType>('pendente');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editingShow) {
      setCacheInput(formatCurrencyInput(editingShow.cacheValue));
      const dt = new Date(editingShow.showDate);
      if (!isNaN(dt.getTime())) {
        const year = dt.getFullYear();
        const month = String(dt.getMonth() + 1).padStart(2, '0');
        const day = String(dt.getDate()).padStart(2, '0');
        const hours = String(dt.getHours()).padStart(2, '0');
        const minutes = String(dt.getMinutes()).padStart(2, '0');
        setDatePart(`${year}-${month}-${day}`);
        setTimePart(`${hours}:${minutes}`);
      } else {
        setDatePart(new Date().toISOString().slice(0, 10));
        setTimePart('21:00');
      }
      setSingerBand(editingShow.singerBand);
      setVenue(editingShow.venue);
      setModality(editingShow.modality);
      setCacheStatus(editingShow.cacheStatus);
      setShowStatus(editingShow.showStatus);
      setNotes(editingShow.notes || '');
    } else {
      // Novo show com data padrão para o próximo fim de semana ou hoje
      setCacheInput('');
      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setDatePart(`${year}-${month}-${day}`);
      setTimePart('21:00');
      setSingerBand('');
      setVenue('');
      setModality('Barzinho/Restaurante');
      setCacheStatus('pendente');
      setShowStatus('pendente');
      setNotes('');
    }
    setError(null);
  }, [editingShow, isOpen]);

  if (!isOpen) return null;

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value);
    setCacheInput(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const numericCache = parseCurrencyInput(cacheInput);
    if (numericCache <= 0) {
      setError('Informe o valor do cachê do show.');
      return;
    }

    if (!singerBand.trim()) {
      setError('Informe o nome do cantor ou banda.');
      return;
    }

    if (!venue.trim()) {
      setError('Informe o nome do estabelecimento ou local.');
      return;
    }

    if (!datePart) {
      setError('Informe a data do show.');
      return;
    }

    const isoDateTime = `${datePart}T${timePart || '20:00'}:00`;

    setLoading(true);
    try {
      await onSave(
        {
          cacheValue: numericCache,
          showDate: isoDateTime,
          singerBand: singerBand.trim(),
          venue: venue.trim(),
          modality,
          cacheStatus,
          showStatus,
          notes: notes.trim() || undefined,
        },
        editingShow ? editingShow.id : undefined
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar show.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/80 p-0 backdrop-blur-sm sm:items-center sm:p-4">
      <div className="relative flex max-h-[92vh] w-full max-w-xl flex-col rounded-t-3xl border border-slate-800 bg-slate-900 shadow-2xl sm:rounded-3xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <Drum className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-outfit text-lg font-bold text-white">
                {editingShow ? 'Editar Show' : 'Cadastrar Novo Show'}
              </h2>
              <p className="text-xs text-slate-400">
                Preencha os dados do show e cachê do baterista
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-800 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-900/50 bg-red-950/30 p-3 text-xs text-red-300">
              {error}
            </div>
          )}

          {/* 1. Valor do Cachê */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Valor do Cachê (R$) *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-amber-400 font-bold text-sm">
                R$
              </div>
              <input
                type="text"
                inputMode="numeric"
                value={cacheInput}
                onChange={handleCurrencyChange}
                placeholder="0,00"
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-3 pl-12 pr-4 font-outfit text-xl font-bold text-white placeholder-slate-600 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>
          </div>

          {/* 2. Data e Horário do Show */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Data do Show *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Calendar className="h-4 w-4" />
                </div>
                <input
                  type="date"
                  value={datePart}
                  onChange={(e) => setDatePart(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-white transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Horário do Show
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                  <Clock className="h-4 w-4" />
                </div>
                <input
                  type="time"
                  value={timePart}
                  onChange={(e) => setTimePart(e.target.value)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-white transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>
          </div>

          {/* 3. Nome do Cantor / Banda */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Nome do Cantor / Banda *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mic className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={singerBand}
                onChange={(e) => setSingerBand(e.target.value)}
                placeholder="Ex: Lucas Sertanejo, Banda Tributo Rock..."
                list="modal-singers-list"
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <datalist id="modal-singers-list">
                {existingSingers.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </div>
          </div>

          {/* 4. Nome do Estabelecimento / Local */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Nome do Estabelecimento / Local *
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <MapPin className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                placeholder="Ex: Quintal do Espeto, Villa Country, Espaço Jardins..."
                list="modal-venues-list"
                required
                className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-white placeholder-slate-500 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
              <datalist id="modal-venues-list">
                {existingVenues.map((v) => (
                  <option key={v} value={v} />
                ))}
              </datalist>
            </div>
          </div>

          {/* 5. Modalidade: Particular ou Barzinho/Restaurante */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Modalidade do Show *
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setModality('Barzinho/Restaurante')}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-semibold transition ${
                  modality === 'Barzinho/Restaurante'
                    ? 'border-blue-500 bg-blue-500/15 text-blue-300 ring-1 ring-blue-500/30'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Building2 className="h-4 w-4" />
                <span>Barzinho / Restaurante</span>
              </button>

              <button
                type="button"
                onClick={() => setModality('Particular')}
                className={`flex items-center justify-center gap-2 rounded-xl border py-2.5 px-3 text-xs font-semibold transition ${
                  modality === 'Particular'
                    ? 'border-purple-500 bg-purple-500/15 text-purple-300 ring-1 ring-purple-500/30'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <Sparkles className="h-4 w-4" />
                <span>Particular (Casamento/Festa)</span>
              </button>
            </div>
          </div>

          {/* 3.1 Status: Cachê recebido/pendente & Show finalizado/pendente/cancelado */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              3.1 Status da Apresentação
            </h4>

            {/* Status do Cachê */}
            <div>
              <span className="text-[11px] font-medium text-slate-400 mb-1.5 block">
                Status do Cachê
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setCacheStatus('pendente')}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2 text-xs font-semibold transition ${
                    cacheStatus === 'pendente'
                      ? 'border-amber-500 bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <AlertCircle className="h-3.5 w-3.5" />
                  <span>Cachê Pendente</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCacheStatus('recebido')}
                  className={`flex items-center justify-center gap-2 rounded-xl border py-2 text-xs font-semibold transition ${
                    cacheStatus === 'recebido'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Cachê Recebido</span>
                </button>
              </div>
            </div>

            {/* Status do Show */}
            <div>
              <span className="text-[11px] font-medium text-slate-400 mb-1.5 block">
                Status do Show
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setShowStatus('pendente')}
                  className={`rounded-xl border py-2 text-xs font-semibold transition ${
                    showStatus === 'pendente'
                      ? 'border-sky-500 bg-sky-500/15 text-sky-300 ring-1 ring-sky-500/30'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  Pendente
                </button>

                <button
                  type="button"
                  onClick={() => setShowStatus('finalizado')}
                  className={`rounded-xl border py-2 text-xs font-semibold transition ${
                    showStatus === 'finalizado'
                      ? 'border-emerald-500 bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  Finalizado
                </button>

                <button
                  type="button"
                  onClick={() => setShowStatus('cancelado')}
                  className={`rounded-xl border py-2 text-xs font-semibold transition ${
                    showStatus === 'cancelado'
                      ? 'border-red-500 bg-red-500/15 text-red-300 ring-1 ring-red-500/30'
                      : 'border-slate-800 bg-slate-900 text-slate-400'
                  }`}
                >
                  Cancelado
                </button>
              </div>
            </div>
          </div>

          {/* Observações / Passagem de Som */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Observações do Baterista (Opcional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ex: Passagem de som às 18h, levar pratos e ferragens, repertório sertanejo atualizado..."
              className="w-full rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-white placeholder-slate-600 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-amber-500/25 transition hover:from-amber-400 hover:to-amber-500 active:scale-95 disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Salvando...' : editingShow ? 'Atualizar Show' : 'Salvar Show'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
