import React, { useState, useEffect, useRef } from 'react';
import { ShowEvent, ModalityType, CacheStatusType, ShowStatusType, BandArtist } from '../types';
import { formatCurrencyInput, parseCurrencyInput } from '../utils/currencyMask';
import { formatCleanTitleInput } from '../utils/formatters';
import { ModernDatePicker } from './ModernDatePicker';
import { ModernTimePicker } from './ModernTimePicker';
import {
  X,
  Plus,
  Calendar,
  Clock,
  Mic,
  MapPin,
  Building2,
  CheckCircle2,
  AlertCircle,
  Drum,
  Save,
  Sparkles,
  DollarSign,
  AlertTriangle,
  ChevronDown,
  Check,
} from 'lucide-react';

interface ShowModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<ShowEvent, 'id' | 'createdAt' | 'updatedAt'>, id?: string) => Promise<void>;
  editingShow?: ShowEvent | null;
  existingSingers: string[];
  existingVenues: string[];
  bands?: BandArtist[];
  onOpenBandsModal?: () => void;
  initialSinger?: { name: string; id?: string } | null;
}

export const ShowModal: React.FC<ShowModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingShow,
  existingSingers,
  existingVenues,
  bands = [],
  onOpenBandsModal,
  initialSinger,
}) => {
  // Ordered state:
  // 1. Estabelecimento
  const [venue, setVenue] = useState('');

  // 2. Cantor
  const [singerBand, setSingerBand] = useState('');
  const [singerBandId, setSingerBandId] = useState<string | undefined>(undefined);

  // 3. Modalidade
  const [modality, setModality] = useState<ModalityType>('Barzinho/Restaurante');

  // 4. Data & 5. Hora
  const [datePart, setDatePart] = useState('');
  const [timePart, setTimePart] = useState('21:00');

  // 6. Status (Show, Cachê e Valor)
  const [showStatus, setShowStatus] = useState<ShowStatusType>('pendente');
  const [cacheStatus, setCacheStatus] = useState<CacheStatusType>('pendente');
  const [cacheInput, setCacheInput] = useState('');

  // 7. Observação
  const [notes, setNotes] = useState('');

  // Dropdown states & Refs
  const [isSingerDropdownOpen, setIsSingerDropdownOpen] = useState(false);
  const singerDropdownRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Close singer dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        singerDropdownRef.current &&
        !singerDropdownRef.current.contains(event.target as Node)
      ) {
        setIsSingerDropdownOpen(false);
      }
    };
    if (isSingerDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isSingerDropdownOpen]);

  useEffect(() => {
    if (editingShow) {
      setVenue(editingShow.venue);
      setSingerBand(editingShow.singerBand);
      setSingerBandId(editingShow.singerBandId);
      setModality(editingShow.modality);

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

      setShowStatus(editingShow.showStatus || 'pendente');
      setCacheStatus(editingShow.cacheStatus);
      setCacheInput(formatCurrencyInput(editingShow.cacheValue));
      setNotes(editingShow.notes || '');
    } else {
      setVenue('');
      if (initialSinger) {
        setSingerBand(initialSinger.name);
        setSingerBandId(initialSinger.id);
      } else if (bands.length === 1) {
        setSingerBand(bands[0].name);
        setSingerBandId(bands[0].id);
      } else {
        setSingerBand('');
        setSingerBandId(undefined);
      }
      setModality('Barzinho/Restaurante');

      const today = new Date();
      const year = today.getFullYear();
      const month = String(today.getMonth() + 1).padStart(2, '0');
      const day = String(today.getDate()).padStart(2, '0');
      setDatePart(`${year}-${month}-${day}`);
      setTimePart('21:00');

      setShowStatus('pendente');
      setCacheStatus('pendente');
      setCacheInput('');
      setNotes('');
    }
    setError(null);
  }, [editingShow, isOpen, initialSinger, bands]);

  if (!isOpen) return null;

  const handleCurrencyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limita estritamente em no máximo 9 dígitos numéricos
    const rawDigits = e.target.value.replace(/\D/g, '').slice(0, 9);
    const num = Number(rawDigits) / 100;
    const formatted = formatCurrencyInput(num);
    setCacheInput(formatted);
  };

  const handleSelectBandChip = (band: BandArtist) => {
    setSingerBand(band.name);
    setSingerBandId(band.id);
    if (band.defaultCache && (!cacheInput || cacheInput === '0,00')) {
      setCacheInput(formatCurrencyInput(band.defaultCache));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 1. Estabelecimento validation
    if (!venue.trim()) {
      setError('Por favor, informe o Estabelecimento ou Local do show.');
      return;
    }

    // 2. Cantor validation (Obrigatório e verificação se tem cadastrado)
    if (!singerBand.trim()) {
      setError('O nome do Cantor ou Banda é obrigatório.');
      return;
    }

    if (bands.length === 0) {
      setError('Nenhum cantor ou banda cadastrado no sistema. Por favor, cadastre um cantor primeiro.');
      return;
    }

    // 4 & 5. Data e Hora validation
    if (!datePart) {
      setError('Por favor, selecione a Data do show.');
      return;
    }

    // 6. Cachê validation (Obrigatório e maior que zero)
    const numericCache = parseCurrencyInput(cacheInput || '0');
    if (isNaN(numericCache) || numericCache <= 0) {
      setError('O valor do cachê é obrigatório e deve ser maior que R$ 0,00.');
      return;
    }

    const isoDateTime = `${datePart}T${timePart || '21:00'}:00`;

    // Match band ID if not set
    let finalBandId = singerBandId;
    if (!finalBandId) {
      const match = bands.find((b) => b.name.toLowerCase() === singerBand.trim().toLowerCase());
      if (match) finalBandId = match.id;
    }

    try {
      setLoading(true);
      await onSave(
        {
          venue: venue.trim(),
          singerBand: singerBand.trim(),
          singerBandId: finalBandId,
          modality,
          showDate: isoDateTime,
          showStatus,
          cacheStatus,
          cacheValue: numericCache,
          notes: notes.trim() || undefined,
        },
        editingShow ? editingShow.id : undefined
      );
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Erro ao salvar o show.');
    } finally {
      setLoading(false);
    }
  };

  // Find color of the currently selected singer if any
  const selectedBandObj = bands.find(
    (b) =>
      (singerBandId && b.id === singerBandId) ||
      b.name.toLowerCase().trim() === singerBand.toLowerCase().trim()
  );

  return (
    <div
      id="show-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-3 sm:p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="show-modal-container"
        className="relative flex max-h-[94vh] w-full max-w-xl flex-col rounded-3xl overflow-hidden border border-black dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition my-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black dark:border-slate-800/80 px-5 sm:px-6 py-4 bg-slate-50 dark:bg-slate-950/40 rounded-t-3xl">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-black/20">
              <Drum className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-outfit text-lg font-bold text-slate-900 dark:text-white">
                {editingShow ? 'Editar Show' : 'Cadastrar Novo Show'}
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Organize sua agenda e cachê de apresentação
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-900 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body - STRICT ORDER: Estabelecimento, Cantor, Modalidade, Data, Hora, Status, Observação */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable form content */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 text-left scrollbar-thin">
            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500 dark:border-red-900/50 bg-red-50 dark:bg-red-950/30 p-2.5 text-xs font-bold text-red-900 dark:text-red-300">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{error}</span>
              </div>
            )}

            {/* ESTABELECIMENTO */}
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-300 mb-1">
                Estabelecimento / Local <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <MapPin className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-500" />
                <input
                  type="text"
                  id="show-venue-input"
                  value={venue}
                  onChange={(e) => setVenue(formatCleanTitleInput(e.target.value, 50))}
                  maxLength={50}
                  placeholder="Ex: Bar do Alemão, Villa Country, Rancho do Serjão..."
                  list="modal-venues-list"
                  required
                  className="w-full h-10 rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 pl-9 pr-4 text-sm text-slate-950 dark:text-white placeholder-slate-400 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <datalist id="modal-venues-list">
                  {existingVenues.map((v) => (
                    <option key={v} value={v} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* CANTOR (Obrigatório e com identificação de vazio) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-300">
                  Cantor ou Banda <span className="text-amber-500">*</span>
                </label>
                {onOpenBandsModal && (
                  <button
                    type="button"
                    id="btn-open-bands-from-show"
                    onClick={onOpenBandsModal}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400 transition hover:underline"
                    title="Gerenciar Cantores e Bandas"
                  >
                    <Plus className="h-3 w-3 stroke-[3]" />
                    <span>Gerenciar Cantores</span>
                  </button>
                )}
              </div>

              {/* Aviso quando não tem nenhum cadastrado */}
              {bands.length === 0 ? (
                <div
                  id="empty-bands-warning"
                  className="rounded-xl border border-amber-500 dark:border-amber-500/40 bg-amber-50 dark:bg-amber-500/10 p-3 space-y-2"
                >
                  <div className="flex items-start gap-2 text-amber-950 dark:text-amber-300">
                    <AlertTriangle className="h-4.5 w-4.5 shrink-0 mt-0.5 text-amber-600" />
                    <div className="text-xs">
                      <p className="font-bold">Nenhum cantor ou banda cadastrado!</p>
                      <p className="text-[11px] text-amber-900 dark:text-amber-400 mt-0.5">
                        O nome do cantor é obrigatório e define a cor de categoria do show na sua grade. Cadastre seu primeiro cantor para prosseguir.
                      </p>
                    </div>
                  </div>
                  {onOpenBandsModal && (
                    <button
                      type="button"
                      onClick={onOpenBandsModal}
                      className="flex w-full items-center justify-center gap-1 rounded-xl border border-black bg-amber-500 px-3 py-1.5 text-xs font-black text-slate-950 shadow-sm transition hover:bg-amber-400 active:scale-95"
                    >
                      <Plus className="h-3.5 w-3.5 stroke-[3]" />
                      <span>Cadastrar Cantor Agora</span>
                    </button>
                  )}
                </div>
              ) : (
                <div ref={singerDropdownRef} className="relative">
                  {/* Dropdown Trigger */}
                  <button
                    type="button"
                    id="show-singer-dropdown-trigger"
                    onClick={() => setIsSingerDropdownOpen((prev) => !prev)}
                    className="flex w-full h-10 items-center justify-between rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 px-3 text-left transition hover:border-amber-500/60 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  >
                    <div className="flex items-center gap-2 min-w-0 truncate">
                      {selectedBandObj ? (
                        <>
                          <span
                            className="h-3.5 w-3.5 rounded-full shadow-xs shrink-0 ring-1 ring-black"
                            style={{ backgroundColor: selectedBandObj.color }}
                          />
                          <span className="text-sm font-bold text-slate-950 dark:text-white truncate">
                            {selectedBandObj.name}
                          </span>
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4 text-slate-500 shrink-0" />
                          <span className="text-sm text-slate-500 truncate">
                            Selecione o cantor ou banda...
                          </span>
                        </>
                      )}
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 text-slate-600 transition-transform duration-200 shrink-0 ${
                        isSingerDropdownOpen ? 'rotate-180 text-amber-500' : ''
                      }`}
                    />
                  </button>

                  {/* Dropdown List with Scrollbar */}
                  {isSingerDropdownOpen && (
                    <div
                      id="show-singer-dropdown-menu"
                      className="absolute z-50 left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-900 p-1 shadow-xl space-y-0.5 divide-y divide-slate-100 dark:divide-slate-800/50"
                    >
                      {bands.map((b) => {
                        const isSelected =
                          (singerBandId && singerBandId === b.id) ||
                          singerBand.toLowerCase().trim() === b.name.toLowerCase().trim();
                        return (
                          <button
                            key={b.id}
                            type="button"
                            onClick={() => {
                              handleSelectBandChip(b);
                              setIsSingerDropdownOpen(false);
                            }}
                            className={`flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-xs transition ${
                              isSelected
                                ? 'bg-amber-50 dark:bg-amber-500/15 text-amber-950 dark:text-amber-200 font-bold border border-black/30'
                                : 'text-slate-800 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            <div className="flex items-center gap-2 min-w-0 truncate">
                              <span
                                className="h-3 w-3 rounded-full shadow-xs shrink-0"
                                style={{ backgroundColor: b.color }}
                              />
                              <span className="truncate text-xs font-bold">{b.name}</span>
                            </div>
                            {isSelected && (
                              <Check className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 shrink-0 ml-2" />
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* MODALIDADE */}
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-300 mb-1">
                Modalidade
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  id="btn-modality-bar"
                  onClick={() => setModality('Barzinho/Restaurante')}
                  className={`flex h-10 items-center justify-center gap-1.5 rounded-xl border px-2.5 text-xs transition ${
                    modality === 'Barzinho/Restaurante'
                      ? 'border-black bg-blue-500/15 text-blue-950 dark:text-blue-300 ring-1 ring-blue-500/30 font-black'
                      : 'border-black dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold'
                  }`}
                >
                  <Building2 className="h-3.5 w-3.5" />
                  <span>Barzinho / Restaurante</span>
                </button>

                <button
                  type="button"
                  id="btn-modality-particular"
                  onClick={() => setModality('Particular')}
                  className={`flex h-10 items-center justify-center gap-1.5 rounded-xl border px-2.5 text-xs transition ${
                    modality === 'Particular'
                      ? 'border-black bg-purple-500/15 text-purple-950 dark:text-purple-300 ring-1 ring-purple-500/30 font-black'
                      : 'border-black dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-800 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold'
                  }`}
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Particular (Festa/Evento)</span>
                </button>
              </div>
            </div>

            {/* DATA & HORA */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {/* Data */}
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-300 mb-1">
                  Data do Show <span className="text-amber-500">*</span>
                </label>
                <ModernDatePicker
                  value={datePart}
                  onChange={setDatePart}
                  required
                />
              </div>

              {/* Hora */}
              <div>
                <label className="block text-xs font-bold text-slate-900 dark:text-slate-300 mb-1">
                  Horário do Show
                </label>
                <ModernTimePicker
                  value={timePart}
                  onChange={setTimePart}
                />
              </div>
            </div>

            {/* STATUS & CACHÊ */}
            <div className="rounded-xl border border-black dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/40 p-3 space-y-2.5">
              <label className="block text-xs font-black text-slate-950 dark:text-slate-300">
                Status & Cachê
              </label>

              {/* Status do Show */}
              <div>
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-400 mb-1 block">
                  Status da Apresentação
                </span>
                <div className="grid grid-cols-3 gap-1.5">
                  <button
                    type="button"
                    id="btn-status-agendado"
                    onClick={() => setShowStatus('pendente')}
                    className={`h-9 rounded-xl border text-xs transition ${
                      showStatus === 'pendente'
                        ? 'border-black bg-sky-500/15 text-sky-950 dark:text-sky-300 ring-1 ring-sky-500/30 font-black'
                        : 'border-black dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-400 font-semibold'
                    }`}
                  >
                    Agendado
                  </button>

                  <button
                    type="button"
                    id="btn-status-realizado"
                    onClick={() => setShowStatus('finalizado')}
                    className={`h-9 rounded-xl border text-xs transition ${
                      showStatus === 'finalizado'
                        ? 'border-black bg-emerald-500/15 text-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/30 font-black'
                        : 'border-black dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-400 font-semibold'
                    }`}
                  >
                    Realizado
                  </button>

                  <button
                    type="button"
                    id="btn-status-cancelado"
                    onClick={() => setShowStatus('cancelado')}
                    className={`h-9 rounded-xl border text-xs transition ${
                      showStatus === 'cancelado'
                        ? 'border-black bg-red-500/15 text-red-950 dark:text-red-300 ring-1 ring-red-500/30 font-black'
                        : 'border-black dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-400 font-semibold'
                    }`}
                  >
                    Cancelado
                  </button>
                </div>
              </div>

              {/* Status do Cachê e Valor em Linha/Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-black/10 dark:border-slate-800/40">
                {/* Status do Cachê */}
                <div>
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-400 mb-1 block">
                    Pagamento do Cachê
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      id="btn-cache-pendente"
                      onClick={() => setCacheStatus('pendente')}
                      className={`h-9 flex items-center justify-center gap-1 rounded-xl border text-xs transition ${
                        cacheStatus === 'pendente'
                          ? 'border-black bg-amber-500/20 text-amber-950 dark:text-amber-300 ring-1 ring-amber-500/30 font-black'
                          : 'border-black dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-400 font-semibold'
                      }`}
                    >
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Pendente</span>
                    </button>

                    <button
                      type="button"
                      id="btn-cache-recebido"
                      onClick={() => setCacheStatus('recebido')}
                      className={`h-9 flex items-center justify-center gap-1 rounded-xl border text-xs transition ${
                        cacheStatus === 'recebido'
                          ? 'border-black bg-emerald-500/20 text-emerald-950 dark:text-emerald-300 ring-1 ring-emerald-500/30 font-black'
                          : 'border-black dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-400 font-semibold'
                      }`}
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Recebido</span>
                    </button>
                  </div>
                </div>

                {/* Valor do Cachê */}
                <div>
                  <span className="text-[11px] font-bold text-slate-900 dark:text-slate-300 mb-1 block">
                    Valor do Cachê (R$) <span className="text-amber-500">*</span>
                  </span>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 flex items-center text-xs font-black text-amber-700 dark:text-amber-400">
                      R$
                    </span>
                    <input
                      type="text"
                      inputMode="numeric"
                      id="show-cache-input"
                      value={cacheInput}
                      onChange={handleCurrencyChange}
                      maxLength={13}
                      placeholder="0,00"
                      required
                      className="w-full h-9 rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-900 pl-8 pr-3 text-sm font-black text-slate-950 dark:text-white placeholder-slate-400 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* OBSERVAÇÃO */}
            <div>
              <label className="block text-xs font-bold text-slate-900 dark:text-slate-300 mb-1">
                Observação (Opcional)
              </label>
              <textarea
                rows={2}
                id="show-notes-input"
                value={notes}
                onChange={(e) => setNotes(e.target.value.replace(/[<>{}%$&@\\^~+=|;"'`]/g, ''))}
                placeholder="Ex: Levar pratos e ferragens; passagem de som às 19h; setlist especial..."
                className="w-full rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 p-2.5 text-xs text-slate-950 dark:text-white placeholder-slate-400 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 resize-none font-medium"
              />
            </div>
          </div>

          {/* Fixed Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 px-5 sm:px-6 py-3.5 border-t border-black/20 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-950/40 rounded-b-3xl">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-bold text-slate-950 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              id="btn-submit-show"
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-black bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2 text-xs font-black text-slate-950 shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 active:scale-95 transition disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              <span>{loading ? 'Salvando...' : editingShow ? 'Atualizar' : 'Salvar Show'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
