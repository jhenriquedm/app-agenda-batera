import React, { useRef, useState, useEffect } from 'react';
import { ShowEvent } from '../types';
import {
  X,
  HardDrive,
  Download,
  Upload,
  Smartphone,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';

interface ExportSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  shows: ShowEvent[];
  onImportShows: (imported: ShowEvent[]) => Promise<void>;
}

export const ExportSyncModal: React.FC<ExportSyncModalProps> = ({
  isOpen,
  onClose,
  shows,
  onImportShows,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    if (msg) {
      const timer = setTimeout(() => {
        setMsg(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [msg]);

  if (!isOpen) return null;

  const handleExport = () => {
    const dataStr = JSON.stringify(shows, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `agenda-batera-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setMsg('Backup exportado com sucesso!');
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (Array.isArray(parsed)) {
        await onImportShows(parsed);
        setMsg(`${parsed.length} shows importados com sucesso!`);
      } else {
        setMsg('Formato de arquivo inválido.');
      }
    } catch {
      setMsg('Erro ao ler arquivo de backup.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-5 sm:px-6 py-4 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-outfit text-base font-bold text-slate-900 dark:text-white">
                Armazenamento & Backup
              </h2>
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                Banco 100% Local no Dispositivo (Offline-First)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-5 sm:p-6 space-y-4 text-xs">
          {msg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-300 dark:border-emerald-900/50 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-semibold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          {/* Local storage focus card */}
          <div className="rounded-2xl border border-emerald-300 dark:border-emerald-950/60 bg-emerald-50/90 dark:bg-emerald-950/20 p-4 ring-1 ring-emerald-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-emerald-900 dark:text-emerald-300 font-bold text-sm">
                <HardDrive className="h-4 w-4 text-emerald-700 dark:text-emerald-400" />
                <span>Banco Offline Dexie (IndexedDB)</span>
              </div>
              <span className="rounded-full bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold text-emerald-800 dark:text-emerald-300">
                100% Offline
              </span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              Todos os seus shows, cachês, cantores e configurações são armazenados estritamente na memória local do seu dispositivo. Seus dados nunca são enviados para a nuvem, garantindo velocidade instantânea e privacidade total.
            </p>
            <div className="mt-3 flex items-center gap-2 pt-2 border-t border-emerald-200 dark:border-emerald-900/50 text-[11px] font-bold text-emerald-900 dark:text-emerald-300">
              <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>{shows.length} shows registrados com segurança local</span>
            </div>
          </div>

          {/* APK Information */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs">
              <Smartphone className="h-4 w-4" />
              <span>Instalação no Android (APK)</span>
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              O projeto nativo funciona 100% offline no celular com suporte completo a compilação automatizada via Capacitor e GitHub Actions (<code className="text-amber-800 dark:text-amber-300 font-mono text-[10px] font-bold">build-apk.yml</code>).
            </p>
          </div>

          {/* Backup Actions */}
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={handleExport}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 font-bold text-slate-900 dark:text-white transition hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs active:scale-95"
            >
              <Download className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Exportar Backup JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 py-2.5 px-4 font-bold text-slate-900 dark:text-white transition hover:bg-slate-100 dark:hover:bg-slate-700 shadow-xs active:scale-95"
            >
              <Upload className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Importar Backup</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
