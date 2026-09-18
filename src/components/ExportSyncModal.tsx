import React, { useRef, useState } from 'react';
import { ShowEvent } from '../types';
import {
  X,
  HardDrive,
  Cloud,
  Download,
  Upload,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
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
    setTimeout(() => setMsg(null), 3000);
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-outfit text-base font-bold text-white">
                Sincronização & Backup
              </h2>
              <p className="text-[11px] text-slate-400">
                Armazenamento Offline (Dexie) e Nuvem
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

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-4 text-xs">
          {msg && (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-900/50 bg-emerald-950/40 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{msg}</span>
            </div>
          )}

          {/* Status cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-emerald-950/60 bg-emerald-950/20 p-4 ring-1 ring-emerald-500/20">
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                <HardDrive className="h-4 w-4" />
                <span>Banco Local (Dexie)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Armazenamento offline ultra-rápido no dispositivo. Seus shows e cachês ficam salvos mesmo sem internet.
              </p>
              <div className="mt-2 text-[11px] font-semibold text-emerald-300">
                Status: Ativo ({shows.length} eventos)
              </div>
            </div>

            <div className="rounded-2xl border border-sky-950/60 bg-sky-950/20 p-4 ring-1 ring-sky-500/20">
              <div className="flex items-center gap-2 text-sky-400 font-bold mb-1">
                <Cloud className="h-4 w-4" />
                <span>Nuvem (Firebase)</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Backup e sincronização multi-dispositivo quando conectado com sua conta Google ou cadastro.
              </p>
              <div className="mt-2 text-[11px] font-semibold text-sky-300">
                Status: Sincronizado
              </div>
            </div>
          </div>

          {/* APK Information */}
          <div className="rounded-2xl border border-slate-800 bg-slate-950 p-4 space-y-2">
            <div className="flex items-center gap-2 text-amber-400 font-bold">
              <Smartphone className="h-4 w-4" />
              <span>Instalação no Android (APK)</span>
            </div>
            <p className="text-slate-300 leading-relaxed">
              O projeto possui pipeline automatizado no GitHub Actions (<code className="text-amber-300 font-mono text-[10px]">build-apk.yml</code>). A cada push na branch principal, o APK Android é gerado e disponibilizado nas Releases do GitHub.
            </p>
          </div>

          {/* Backup Actions */}
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={handleExport}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 px-4 font-semibold text-white transition hover:bg-slate-800 active:scale-95"
            >
              <Download className="h-4 w-4 text-amber-400" />
              <span>Exportar Backup JSON</span>
            </button>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 py-2.5 px-4 font-semibold text-white transition hover:bg-slate-800 active:scale-95"
            >
              <Upload className="h-4 w-4 text-emerald-400" />
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
