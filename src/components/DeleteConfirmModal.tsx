import React from 'react';
import { ShowEvent } from '../types';
import { formatBRL } from '../utils/currencyMask';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  show: ShowEvent | null;
  onClose: () => void;
  onConfirm: (id: string) => Promise<void>;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  show,
  onClose,
  onConfirm,
}) => {
  const [loading, setLoading] = React.useState(false);

  if (!isOpen || !show) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm(show.id);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-red-500/15 text-red-500 ring-1 ring-red-500/30">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-outfit text-base font-bold text-slate-900 dark:text-white">Excluir Show?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Esta ação não poderá ser desfeita.</p>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-3 text-xs text-slate-700 dark:text-slate-300 space-y-1">
          <div className="font-bold text-slate-900 dark:text-white">{show.singerBand}</div>
          <div className="text-slate-500 dark:text-slate-400">{show.venue}</div>
          <div className="font-mono text-amber-600 dark:text-amber-400 font-bold">{formatBRL(show.cacheValue)}</div>
        </div>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-xl border border-slate-200 dark:border-slate-800 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-xs font-bold text-white shadow-md shadow-red-600/20 transition hover:bg-red-500 active:scale-95 disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />
            <span>{loading ? 'Excluindo...' : 'Sim, Excluir'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
