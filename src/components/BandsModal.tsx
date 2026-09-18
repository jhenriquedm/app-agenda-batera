import React, { useState, useEffect } from 'react';
import { BandArtist, ShowEvent } from '../types';
import { BAND_PALETTE_COLORS, bandService } from '../services/bandService';
import { formatCleanTitleInput } from '../utils/formatters';
import {
  X,
  Plus,
  Mic,
  Trash2,
  Edit2,
  Check,
  Search,
  ChevronLeft,
  AlertCircle,
  Save,
} from 'lucide-react';

interface BandsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bands: BandArtist[];
  shows: ShowEvent[];
  onRefreshBands: () => Promise<void>;
  onSelectBandForShow?: (bandName: string, defaultCache?: number, bandId?: string) => void;
  userId?: string;
}

export const BandsModal: React.FC<BandsModalProps> = ({
  isOpen,
  onClose,
  bands,
  shows,
  onRefreshBands,
  onSelectBandForShow,
  userId,
}) => {
  const [viewMode, setViewMode] = useState<'list' | 'form'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingBandId, setEditingBandId] = useState<string | null>(null);

  // Form states - Simplificado: apenas Nome e Cor
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(BAND_PALETTE_COLORS[0].hex);

  // Confirmation for delete
  const [deletingBand, setDeletingBand] = useState<BandArtist | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  if (!isOpen) return null;

  const handleOpenCreate = () => {
    setEditingBandId(null);
    setName('');
    setSelectedColor(BAND_PALETTE_COLORS[Math.floor(Math.random() * BAND_PALETTE_COLORS.length)].hex);
    setErrorMessage(null);
    setViewMode('form');
  };

  const handleOpenEdit = (band: BandArtist) => {
    setEditingBandId(band.id);
    setName(band.name);
    setSelectedColor(band.color || BAND_PALETTE_COLORS[0].hex);
    setErrorMessage(null);
    setViewMode('form');
  };

  const handleSaveBand = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const cleanBandName = name.trim();
    if (!cleanBandName) {
      setErrorMessage('Por favor, informe o nome do cantor ou banda.');
      return;
    }

    // Check for duplicate names (case-insensitive)
    const normalizedNewName = cleanBandName.toLowerCase();
    const isDuplicate = bands.some(
      (b) => b.name.trim().toLowerCase() === normalizedNewName && b.id !== editingBandId
    );

    if (isDuplicate) {
      setErrorMessage('Já existe um cantor ou banda cadastrado com este nome.');
      return;
    }

    try {
      setIsSubmitting(true);

      if (editingBandId) {
        await bandService.updateBand(editingBandId, {
          name: cleanBandName,
          color: selectedColor,
        });
      } else {
        await bandService.addBand({
          name: cleanBandName,
          color: selectedColor,
        }, userId);
      }

      await onRefreshBands();
      setViewMode('list');
    } catch (err: any) {
      setErrorMessage(err?.message || 'Erro ao salvar o cantor ou banda.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteBand = async (bandId: string) => {
    try {
      await bandService.deleteBand(bandId);
      await onRefreshBands();
      setDeletingBand(null);
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  const filteredBands = bands.filter((b) => {
    const q = searchQuery.toLowerCase();
    return b.name.toLowerCase().includes(q);
  });

  return (
    <div
      id="bands-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto"
    >
      <div
        id="bands-modal-container"
        className="relative w-full max-w-lg rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl overflow-hidden my-8 transition"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-3.5 sm:py-4 bg-slate-50 dark:bg-slate-950/40 gap-2">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            {viewMode === 'form' ? (
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="flex h-8 w-8 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition shadow-xs"
                title="Voltar para a lista"
              >
                <ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            ) : (
              <div className="flex h-8 w-8 sm:h-10 sm:w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-400">
                <Mic className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-outfit text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-tight truncate">
                {viewMode === 'form'
                  ? editingBandId
                    ? 'Editar Cantor'
                    : 'Novo Cantor'
                  : 'Cantores & Bandas'}
              </h3>
              <p className="text-[10px] sm:text-xs text-slate-600 dark:text-slate-400 font-medium truncate">
                {viewMode === 'form'
                  ? 'Nome e cor de identificação visual'
                  : `${bands.length} ${bands.length === 1 ? 'artista cadastrado' : 'artistas cadastrados'}`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {viewMode === 'list' && (
              <button
                type="button"
                id="btn-new-band"
                onClick={handleOpenCreate}
                className="flex items-center gap-1 sm:gap-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 px-2.5 sm:px-3.5 py-1.5 text-xs font-bold text-slate-950 transition shadow-xs active:scale-95 whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4 stroke-[3]" />
                <span className="hidden sm:inline">Cadastrar Cantor</span>
                <span className="sm:hidden">Novo</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition shadow-xs"
            >
              <X className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        {viewMode === 'list' ? (
          <div className="p-4 sm:p-6 space-y-3 sm:space-y-4 max-h-[75vh] overflow-y-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3 h-4 w-4 text-slate-400" />
              <input
                type="text"
                id="search-band-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar cantor ou banda..."
                className="w-full h-10 sm:h-11 rounded-xl border border-slate-300 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-9 sm:pl-10 pr-4 text-xs text-slate-900 dark:text-white placeholder-slate-400 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
              />
            </div>

            {/* Empty State */}
            {bands.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-8 text-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mb-3 ring-1 ring-amber-500/20">
                  <Mic className="h-7 w-7" />
                </div>
                <h4 className="font-outfit text-base font-bold text-slate-900 dark:text-white">
                  Nenhum cantor cadastrado
                </h4>
                <p className="mt-1 max-w-sm text-xs text-slate-600 dark:text-slate-400">
                  Cadastre os cantores ou bandas parceiros com seu nome e uma cor de identificação para organizar seus shows e cachês.
                </p>
                <button
                  type="button"
                  onClick={handleOpenCreate}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-4 py-2 text-xs font-bold text-slate-950 shadow-md transition hover:from-amber-400 hover:to-amber-500 active:scale-95"
                >
                  <Plus className="h-4 w-4 stroke-[2.5]" />
                  <span>Cadastrar Primeiro Cantor</span>
                </button>
              </div>
            ) : filteredBands.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
                Nenhum resultado encontrado para &quot;{searchQuery}&quot;.
              </div>
            ) : (
              <div className="space-y-2.5">
                {filteredBands.map((band) => {
                  const metrics = bandService.calculateBandMetrics(band.name, shows);
                  return (
                    <div
                      key={band.id}
                      id={`band-card-${band.id}`}
                      className="group flex flex-col rounded-2xl border border-slate-200 dark:border-slate-800/80 bg-white dark:bg-slate-950/60 p-3 sm:p-3.5 transition-all hover:border-slate-300 dark:hover:border-slate-700 shadow-xs"
                    >
                      {/* Linha Principal: Cor/Avatar + Nome Completo + Contagem + Botões de Ação */}
                      <div className="flex items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          <div
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl font-outfit text-sm font-extrabold shadow-sm"
                            style={{
                              backgroundColor: band.color,
                              color: '#ffffff',
                            }}
                          >
                            <Mic className="h-4 w-4" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h4 className="font-outfit text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                              {band.name}
                            </h4>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                                {metrics.totalGigs} {metrics.totalGigs === 1 ? 'show na agenda' : 'shows na agenda'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Botões de Ação: Editar e Excluir */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(band)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 hover:border-amber-400 transition"
                            title="Editar Cantor / Banda"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingBand(band)}
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-400 transition"
                            title="Excluir Cantor / Banda"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Seletor de Banda (quando aberto durante a criação/edição de show) */}
                      {onSelectBandForShow && (
                        <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">
                            Usar este cantor no show
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              onSelectBandForShow(band.name, undefined, band.id);
                              onClose();
                            }}
                            className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3 py-1 text-xs font-bold text-slate-950 shadow-xs hover:from-amber-400 hover:to-amber-500 active:scale-95"
                          >
                            <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                            <span>Selecionar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ) : (
          /* FORM VIEW: Simplificado - Apenas Nome e Cor */
          <form onSubmit={handleSaveBand} className="p-5 sm:p-6 space-y-5 max-h-[75vh] overflow-y-auto">
            {errorMessage && (
              <div className="flex items-center gap-2 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-xs text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Nome do Cantor / Banda */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Nome do Cantor ou Banda <span className="text-amber-500">*</span>
              </label>
              <div className="relative">
                <Mic className="pointer-events-none absolute inset-y-0 left-0 my-auto ml-3.5 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  required
                  id="band-name-input"
                  value={name}
                  onChange={(e) => setName(formatCleanTitleInput(e.target.value, 50))}
                  maxLength={50}
                  placeholder="Ex: Lucas Sertanejo, Grupo Samba Bom, etc."
                  className="w-full h-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 pl-10 pr-4 text-sm text-slate-900 dark:text-white placeholder-slate-400 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            {/* 2. Cor de Identificação Visual (Estilo Categoria) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                Cor de Identificação Visual (Estilo Categoria) <span className="text-amber-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3">
                Esta cor será usada nos cards dos shows para identificar rapidamente este cantor na sua grade de apresentações.
              </p>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2.5">
                {BAND_PALETTE_COLORS.map((c) => {
                  const isSelected = selectedColor.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      onClick={() => setSelectedColor(c.hex)}
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
                        isSelected
                          ? 'ring-2 ring-amber-500 scale-110 shadow-md ring-offset-2 ring-offset-white dark:ring-offset-slate-900'
                          : 'opacity-80 hover:opacity-100 hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.hex }}
                      title={c.name}
                    >
                      {isSelected && <Check className="h-4 w-4 stroke-[3] text-white drop-shadow" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Visual Preview */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 p-3.5 flex items-center gap-3">
              <div
                className="h-9 w-9 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
                style={{ backgroundColor: selectedColor }}
              >
                <Mic className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                  Prévia da Categoria
                </span>
                <span className="font-outfit text-sm font-bold text-slate-900 dark:text-white truncate block">
                  {name.trim() || 'Nome do Cantor'}
                </span>
              </div>
            </div>

            {/* Form Footer Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800/80">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancelar
              </button>
              <button
                type="submit"
                id="btn-save-band"
                disabled={isSubmitting}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/20 transition hover:from-amber-400 hover:to-amber-500 active:scale-95 disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                <span>{editingBandId ? 'Atualizar Cantor' : 'Salvar Cantor'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Delete Confirmation Dialog */}
        {deletingBand && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/80 p-6 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 ring-1 ring-red-500/20">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h4 className="font-outfit text-base font-bold text-slate-900 dark:text-white">
                  Excluir &quot;{deletingBand.name}&quot;?
                </h4>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Os shows já registrados continuarão na sua grade, mas o cantor será removido da lista de categorias.
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingBand(null)}
                  className="flex-1 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 py-2.5 text-xs font-semibold text-slate-700 dark:text-slate-300 transition hover:bg-slate-200 dark:hover:bg-slate-800"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  id="btn-confirm-delete-band"
                  onClick={() => handleDeleteBand(deletingBand.id)}
                  className="flex-1 rounded-xl bg-red-600 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-red-500 active:scale-95"
                >
                  Confirmar Exclusão
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
