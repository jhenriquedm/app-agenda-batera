import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { sanitizeUsername } from '../utils/textSanitizer';
import {
  X,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  AtSign,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';

interface RecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBackToLogin: () => void;
}

export const RecoveryModal: React.FC<RecoveryModalProps> = ({
  isOpen,
  onClose,
  onBackToLogin,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [username, setUsername] = useState('');
  const [foundUserFullName, setFoundUserFullName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  if (!isOpen) return null;

  const handleFindUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = sanitizeUsername(username.trim());
    if (!cleanUser) {
      setError('Informe seu nome de usuário.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.findUserForRecovery(cleanUser);
      if (res.success) {
        setFoundUserFullName(res.name || '');
        setStep(2);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao validar usuário.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = sanitizeUsername(username.trim());
    const cleanPassword = newPassword.slice(0, 8);

    if (!cleanPassword || cleanPassword.length < 4) {
      setError('A senha deve ter entre 4 e 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.resetPassword(cleanUser, cleanPassword);
      if (res.success) {
        setStep(3);
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao redefinir a senha.');
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setStep(1);
    setUsername('');
    setFoundUserFullName('');
    setNewPassword('');
    setShowPassword(false);
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto">
      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-black dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-black dark:border-slate-800 px-5 sm:px-6 py-4 bg-slate-50 dark:bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-black/30 dark:border-amber-500/30">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-outfit text-base font-extrabold text-slate-950 dark:text-white">
                Recuperação de Senha
              </h2>
              <p className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                Redefinição de acesso para seu usuário
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              resetState();
              onClose();
            }}
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-black dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 rounded-xl border border-red-500 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-900 dark:text-red-300 font-semibold animate-pulse">
              <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
              <span>{error}</span>
            </div>
          )}

          {step === 1 && (
            <form onSubmit={handleFindUser} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-bold text-slate-950 dark:text-slate-300">
                  Nome de Usuário Cadastrado *
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400">
                    <AtSign className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(sanitizeUsername(e.target.value))}
                    placeholder="Digite seu nome de usuário"
                    maxLength={20}
                    required
                    className="w-full rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 font-medium transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-50 dark:bg-slate-950 p-3 text-[11px] text-slate-700 dark:text-slate-400 border border-black dark:border-slate-800">
                <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                <span>
                  O sistema irá validar seu usuário local e liberar a digitação de uma nova senha.
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    resetState();
                    onBackToLogin();
                  }}
                  className="text-xs font-bold text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition"
                >
                  Voltar ao Login
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl border border-black bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  <span>{loading ? 'Buscando...' : 'Localizar Usuário'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="rounded-xl border border-black bg-emerald-50 dark:bg-emerald-950/30 p-3.5 text-xs text-slate-900 dark:text-slate-300 font-bold">
                <span className="text-emerald-600 dark:text-emerald-400 font-black">Usuário Localizado!</span>
                <p className="mt-1 font-medium text-[11px]">Olá, {foundUserFullName}. Digite sua nova senha de acesso abaixo.</p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-950 dark:text-slate-300">
                    Nova Senha (máx. 8 dígitos) *
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {newPassword.length}/8
                  </span>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400">
                    <Lock className="h-4 w-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value.slice(0, 8))}
                    placeholder="Sua nova senha de 4 a 8 caracteres"
                    maxLength={8}
                    required
                    className="w-full rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 pl-9 pr-10 text-xs text-slate-950 dark:text-white placeholder-slate-400 font-medium transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs font-bold text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white transition"
                >
                  Voltar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl border border-black bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-black text-slate-950 shadow-md transition active:scale-95 disabled:opacity-50"
                >
                  <span>{loading ? 'Gravando...' : 'Confirmar Nova Senha'}</span>
                  <CheckCircle2 className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}

          {step === 3 && (
            <div className="space-y-4 text-center py-2">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500 shadow-lg">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-outfit text-base font-extrabold text-slate-950 dark:text-white">
                  Senha Redefinida!
                </h3>
                <p className="mt-2 text-xs font-semibold text-slate-600 dark:text-slate-400">
                  Sua nova senha de acesso foi salva e está pronta para uso imediato.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  resetState();
                  onBackToLogin();
                }}
                className="w-full rounded-xl border border-black bg-amber-500 hover:bg-amber-400 py-2.5 text-xs font-black text-slate-950 shadow-md transition hover:scale-[1.02] active:scale-95"
              >
                Ir para o Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
