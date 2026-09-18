import React from 'react';
import { UserProfile } from '../types';
import { DrumAppIcon } from './DrumAppIcon';
import {
  LogOut,
  User,
  Mic,
  Sun,
  Moon,
} from 'lucide-react';

interface HeaderProps {
  user: UserProfile | null;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onOpenBandsModal: () => void;
  bandsCount: number;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenAuthModal,
  onLogout,
  onOpenBandsModal,
  bandsCount,
  theme,
  onToggleTheme,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-black dark:border-slate-800/80 bg-white/95 dark:bg-slate-950/90 backdrop-blur-md transition-colors shadow-2xs">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-3 py-2 sm:px-6 sm:py-3 gap-2">
        {/* Brand / Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink min-w-0">
          <DrumAppIcon size="sm" rounded="rounded-xl" className="border border-black/60 shadow-xs shrink-0" />
          <h1 className="font-outfit text-sm sm:text-lg md:text-xl font-black tracking-tight text-slate-950 dark:text-white truncate">
            {user ? `Olá, ${user.name.trim().split(' ')[0]}` : 'Agenda do Batera'}
          </h1>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Alternador de Tema (Claro / Escuro) */}
          <button
            type="button"
            id="btn-toggle-theme"
            onClick={onToggleTheme}
            className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-black dark:border-slate-800 bg-white hover:bg-slate-100 dark:bg-slate-900 text-slate-950 dark:text-slate-300 hover:text-amber-600 dark:hover:text-amber-400 transition shrink-0"
            title={theme === 'dark' ? 'Ativar Modo Claro' : 'Ativar Modo Escuro'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-slate-950" />
            )}
          </button>

          {/* Cantores & Bandas */}
          <button
            type="button"
            id="btn-header-bands"
            onClick={onOpenBandsModal}
            className="flex h-8 sm:h-9 items-center gap-1 sm:gap-1.5 rounded-xl border border-black dark:border-slate-800 bg-white hover:bg-slate-100 dark:bg-slate-900/80 px-2 sm:px-2.5 text-xs font-bold text-slate-950 dark:text-slate-300 transition hover:text-amber-700 dark:hover:text-amber-400 shrink-0"
            title="Gerenciar Cantores e Bandas"
          >
            <Mic className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500 shrink-0" />
            <span className="hidden sm:inline font-bold">Cantores</span>
            <span className="rounded-full bg-amber-500/20 px-1.5 py-0.2 font-mono text-[10px] font-black text-amber-950 dark:text-amber-400 border border-black/20">
              {bandsCount}
            </span>
          </button>

          {/* Perfil / Login */}
          {user ? (
            <button
              type="button"
              onClick={onLogout}
              className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl border border-black dark:border-slate-800 bg-white hover:bg-red-50 dark:bg-slate-900 text-slate-950 dark:text-slate-400 hover:border-red-600 hover:text-red-600 transition shrink-0"
              title={`Conectado como ${user.name}. Sair`}
            >
              <LogOut className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={onOpenAuthModal}
              className="flex h-8 sm:h-9 items-center gap-1.5 rounded-xl border border-black dark:border-amber-500/40 bg-amber-400 dark:bg-amber-500/15 px-2.5 sm:px-3 text-xs font-black text-slate-950 dark:text-amber-400 transition hover:bg-amber-500 shrink-0"
            >
              <User className="h-3.5 w-3.5" />
              <span className="hidden xs:inline">Entrar</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

