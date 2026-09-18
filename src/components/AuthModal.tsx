import React, { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import { UserProfile } from '../types';
import { sanitizeUsername, sanitizeName } from '../utils/textSanitizer';
import { APP_VERSION } from '../version';
import { DrumAppIcon } from './DrumAppIcon';
import {
  X,
  User,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  AtSign,
  Eye,
  EyeOff,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserProfile) => void;
  onOpenRecovery: () => void;
  isFullScreen?: boolean;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onOpenRecovery,
  isFullScreen = false,
}) => {
  const [tab, setTab] = useState<'login' | 'register'>('login');

  // Login form
  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form
  const [regName, setRegName] = useState('');
  const [regUsername, setRegUsername] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  if (!isOpen) return null;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanUser = sanitizeUsername(loginUsername.trim());
    if (!cleanUser || !loginPassword) {
      setError('Por favor, informe seu usuário e senha.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.login(cleanUser, loginPassword);
      if (res.success && res.user) {
        onSuccess(res.user);
        onClose();
      } else {
        setError(res.message || 'Falha ao autenticar.');
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao autenticar.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const cleanName = sanitizeName(regName.trim()).slice(0, 50);
    const cleanUser = sanitizeUsername(regUsername.trim().toLowerCase()).slice(0, 20);
    const cleanPass = regPassword.slice(0, 8);

    if (!cleanName) {
      setError('Informe seu nome completo (máx. 50 caracteres).');
      return;
    }

    if (!cleanUser || cleanUser.length < 3) {
      setError('Informe um usuário válido com no mínimo 3 e no máximo 20 caracteres.');
      return;
    }

    if (!cleanPass || cleanPass.length < 4) {
      setError('A senha deve ter entre 4 e 8 caracteres.');
      return;
    }

    try {
      setLoading(true);
      const res = await authService.register({
        name: cleanName,
        username: cleanUser,
        password: cleanPass,
      });
      if (res.success) {
        setSuccessMsg('Conta criada com sucesso! Faça o login para entrar.');
        setLoginUsername(cleanUser);
        setLoginPassword('');
        setRegName('');
        setRegUsername('');
        setRegPassword('');
        setTimeout(() => {
          setTab('login');
          setSuccessMsg(null);
        }, 1500);
      } else {
        setError(res.message || 'Falha ao criar conta.');
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao criar conta.');
    } finally {
      setLoading(false);
    }
  };

  const cardContent = (
    <div className="relative flex max-h-[92vh] w-full max-w-md flex-col overflow-hidden rounded-3xl border border-black dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xl transition">
      {/* Tab switch at the very top of the card */}
      <div className="grid grid-cols-2 border-b border-black dark:border-slate-800 bg-slate-100 dark:bg-slate-950/30 p-2 text-xs font-bold gap-2">
        <button
          type="button"
          onClick={() => {
            setTab('login');
            setError(null);
          }}
          className={`rounded-xl py-2.5 transition text-center whitespace-nowrap ${
            tab === 'login'
              ? 'bg-amber-500 text-slate-950 border border-black shadow-md font-black'
              : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          Entrar na Conta
        </button>
        <button
          type="button"
          onClick={() => {
            setTab('register');
            setError(null);
          }}
          className={`rounded-xl py-2.5 transition text-center whitespace-nowrap ${
            tab === 'register'
              ? 'bg-amber-500 text-slate-950 border border-black shadow-md font-black'
              : 'text-slate-700 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white'
          }`}
        >
          Criar Nova Conta
        </button>
      </div>

      {/* Body Content */}
      <div className="overflow-y-auto p-5 sm:p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-500 bg-red-50 dark:bg-red-950/40 p-3 text-xs text-red-900 dark:text-red-300 font-semibold">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
            <span>{error}</span>
          </div>
        )}

        {successMsg && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs text-emerald-900 dark:text-emerald-300 font-semibold">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form Content */}
        {tab === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-3.5">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-950 dark:text-slate-300">
                Usuário *
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400">
                  <AtSign className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={loginUsername}
                  onChange={(e) => setLoginUsername(sanitizeUsername(e.target.value))}
                  placeholder="Seu nome de usuário"
                  maxLength={20}
                  required
                  className="w-full rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 font-medium transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <div className="mb-1 flex items-center justify-between">
                <label className="text-xs font-bold text-slate-950 dark:text-slate-300">
                  Senha (máx. 8 dígitos) *
                </label>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenRecovery();
                  }}
                  className="text-[11px] font-bold text-amber-700 dark:text-amber-400 hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showLoginPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value.slice(0, 8))}
                  placeholder="Sua senha (até 8 caracteres)"
                  maxLength={8}
                  required
                  className="w-full rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 pl-9 pr-10 text-xs text-slate-950 dark:text-white placeholder-slate-400 font-medium transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowLoginPassword(!showLoginPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showLoginPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-black bg-amber-500 hover:bg-amber-400 py-2.5 text-xs font-black text-slate-950 shadow-md transition active:scale-95 disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'Entrando...' : 'Entrar na Agenda'}</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="space-y-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-950 dark:text-slate-300">
                  Nome Completo *
                </label>
                <span className="text-[10px] text-slate-500">
                  {regName.length}/50
                </span>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400">
                  <User className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(sanitizeName(e.target.value).slice(0, 50))}
                  placeholder="Ex: Henrique Silva"
                  maxLength={50}
                  required
                  className="w-full rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 font-medium transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-950 dark:text-slate-300">
                  Usuário *
                </label>
                <span className="text-[10px] text-slate-500">
                  {regUsername.length}/20
                </span>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400">
                  <AtSign className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  value={regUsername}
                  onChange={(e) => setRegUsername(sanitizeUsername(e.target.value).toLowerCase())}
                  placeholder="Ex: batera10 (sem espaços ou caracteres especiais)"
                  maxLength={20}
                  required
                  className="w-full rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 pl-9 pr-3 text-xs text-slate-950 dark:text-white placeholder-slate-400 font-medium transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>
              <p className="mt-1 text-[10px] text-slate-500 font-medium">
                Use apenas letras e números. Máximo 20 caracteres.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-950 dark:text-slate-300">
                  Senha *
                </label>
                <span className="text-[10px] text-slate-500">
                  {regPassword.length}/8
                </span>
              </div>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500 dark:text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value.slice(0, 8))}
                  placeholder="Crie sua senha (máximo 8 caracteres)"
                  maxLength={8}
                  required
                  className="w-full rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 py-2.5 pl-9 pr-10 text-xs text-slate-950 dark:text-white placeholder-slate-400 font-medium transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                  tabIndex={-1}
                >
                  {showRegPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-black bg-amber-500 hover:bg-amber-400 py-2.5 text-xs font-black text-slate-950 shadow-md transition active:scale-95 disabled:opacity-50 mt-4"
            >
              <span>{loading ? 'Cadastrando...' : 'Concluir Cadastro'}</span>
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );

  const layout = (
    <div className="flex flex-col items-center justify-center w-full max-w-md mx-auto py-4">
      {/* Brand Header */}
      <div className="flex flex-col items-center text-center mb-6">
        {/* Elegant Centered Icon with gorgeous shadow/glow */}
        <div className="relative group transition-transform hover:scale-105">
          <div className="absolute -inset-2 rounded-3xl bg-amber-500/30 blur-lg" />
          <DrumAppIcon size="xl" rounded="rounded-2xl" className="border-2 border-black dark:border-amber-400/40 relative shadow-xl" />
        </div>
        
        {/* Title */}
        <h1 className="font-outfit text-2xl sm:text-3xl font-black tracking-tight text-slate-950 dark:text-white mt-4">
          Agenda do Batera
        </h1>
        
        {/* Subtitle / Description */}
        <p className="mt-1.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-bold max-w-xs px-2">
          Controle a sua agenda de shows 100% offline
        </p>
      </div>

      {/* Main card */}
      {cardContent}

      {/* Version identifier centered at the bottom of the form */}
      <div className="mt-6 text-center">
        <span className="font-mono text-xs font-bold text-slate-400 dark:text-slate-600">
          Versão {APP_VERSION}
        </span>
      </div>
    </div>
  );

  if (isFullScreen) {
    return layout;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm overflow-y-auto">
      {layout}
    </div>
  );
};
