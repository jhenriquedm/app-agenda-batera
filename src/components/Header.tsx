import React from 'react';
import { UserProfile } from '../types';
import { Drum, LogOut, User, CloudCheck, HardDrive, Plus, Sparkles } from 'lucide-react';
import { APP_VERSION } from '../version';

interface HeaderProps {
  user: UserProfile | null;
  onOpenNewShowModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenSyncModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenNewShowModal,
  onOpenAuthModal,
  onLogout,
  onOpenSyncModal,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 text-slate-950 shadow-lg shadow-amber-500/20 ring-2 ring-amber-400/30">
            <Drum className="h-6 w-6 stroke-[2.2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-outfit text-xl font-bold tracking-tight text-white sm:text-2xl">
                Agenda do Batera
              </h1>
              <span className="hidden rounded-md bg-amber-500/10 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-amber-400 ring-1 ring-amber-500/30 sm:inline-block">
                v{APP_VERSION}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Controle de shows, cachês e apresentações
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Storage & Cloud Status */}
          <button
            type="button"
            onClick={onOpenSyncModal}
            className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/80 px-2.5 py-2 text-xs font-medium text-slate-300 transition-colors hover:border-slate-700 hover:bg-slate-850 hover:text-white"
            title="Armazenamento Local & Nuvem"
          >
            <HardDrive className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Local & Nuvem</span>
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          </button>

          {/* User Account / Profile */}
          {user ? (
            <div className="flex items-center gap-1.5 sm:gap-2">
              <div className="hidden flex-col text-right sm:flex">
                <span className="text-xs font-semibold text-white truncate max-w-[130px]">
                  {user.name}
                </span>
                <span className="text-[10px] text-amber-400 font-medium">
                  {user.instrument || 'Baterista'}
                </span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-800 bg-slate-900 text-slate-400 transition-colors hover:border-red-900/50 hover:bg-red-950/30 hover:text-red-400"
                title="Sair da conta"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20"
            >
              <User className="h-4 w-4" />
              <span>Entrar</span>
            </button>
          )}

          {/* Primary Quick Add Button */}
          <button
            type="button"
            onClick={onOpenNewShowModal}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-3.5 py-2 text-xs font-bold text-slate-950 shadow-md shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-lg hover:shadow-amber-500/30 active:scale-95 sm:text-sm"
          >
            <Plus className="h-4 w-4 stroke-[3]" />
            <span className="hidden xs:inline sm:inline">Novo Show</span>
          </button>
        </div>
      </div>
    </header>
  );
};
