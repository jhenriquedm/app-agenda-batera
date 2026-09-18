import React, { useState } from 'react';
import { authService } from '../services/authService';
import { formatCpf, validateCpf } from '../utils/cpfValidator';
import {
  X,
  KeyRound,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  UserCheck,
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
  const [method, setMethod] = useState<'email' | 'cpf'>('cpf');
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ message: string; target?: string } | null>(null);

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (method === 'cpf') {
      setInputValue(formatCpf(e.target.value));
    } else {
      setInputValue(e.target.value);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (method === 'cpf' && !validateCpf(inputValue)) {
      setError('CPF inválido. Por favor, confira os 11 números digitados.');
      return;
    }

    if (method === 'email' && !inputValue.includes('@')) {
      setError('Informe um endereço de e-mail válido.');
      return;
    }

    setLoading(true);
    try {
      const res = await authService.recoverPassword(inputValue);
      if (res.success) {
        setSuccessInfo({
          message: res.message,
          target: res.codeSentTo,
        });
      } else {
        setError(res.message);
      }
    } catch (err: any) {
      setError(err?.message || 'Falha ao solicitar recuperação.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="relative flex w-full max-w-md flex-col overflow-hidden rounded-3xl border border-slate-800 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-950/50">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400">
              <KeyRound className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-outfit text-base font-bold text-white">
                Recuperação de Senha
              </h2>
              <p className="text-[11px] text-slate-400">
                Redefinição segura via CPF ou E-mail
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
        <div className="p-6 space-y-4">
          {successInfo ? (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <div>
                <h3 className="font-outfit text-base font-bold text-white">
                  Instruções Enviadas!
                </h3>
                <p className="mt-1 text-xs text-slate-300">
                  {successInfo.message}
                </p>
              </div>

              <div className="rounded-xl border border-slate-800 bg-slate-950 p-3 text-xs text-slate-400">
                Verifique sua caixa de entrada e a pasta de spam. O link de redefinição é válido por 30 minutos.
              </div>

              <button
                type="button"
                onClick={() => {
                  setSuccessInfo(null);
                  onBackToLogin();
                }}
                className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-2.5 text-xs font-bold text-slate-950 shadow-md transition hover:from-amber-400 hover:to-amber-500"
              >
                Voltar para o Login
              </button>
            </div>
          ) : (
            <form onSubmit={handleRecover} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-xl border border-red-900/50 bg-red-950/40 p-3 text-xs text-red-300">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Toggle method: CPF or E-mail */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Como deseja recuperar seu acesso?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMethod('cpf');
                      setInputValue('');
                      setError(null);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs font-semibold transition ${
                      method === 'cpf'
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>Via CPF</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setMethod('email');
                      setInputValue('');
                      setError(null);
                    }}
                    className={`flex items-center justify-center gap-2 rounded-xl border py-2 px-3 text-xs font-semibold transition ${
                      method === 'email'
                        ? 'border-amber-500 bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/30'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <Mail className="h-4 w-4" />
                    <span>Via E-mail</span>
                  </button>
                </div>
              </div>

              {/* Input field */}
              <div>
                <label className="mb-1 block text-xs font-semibold text-slate-300">
                  {method === 'cpf' ? 'Número do seu CPF cadastrado' : 'Seu E-mail cadastrado'}
                </label>
                <input
                  type={method === 'cpf' ? 'text' : 'email'}
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={method === 'cpf' ? '000.000.000-00' : 'seuemail@exemplo.com'}
                  maxLength={method === 'cpf' ? 14 : undefined}
                  required
                  className="w-full rounded-xl border border-slate-800 bg-slate-950 py-2.5 pl-3 pr-3 text-xs text-white placeholder-slate-600 transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
                />
              </div>

              <div className="flex items-center gap-2 rounded-xl bg-slate-950 p-3 text-[11px] text-slate-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span>
                  Um link para definir sua nova senha será enviado com autenticação em duas etapas.
                </span>
              </div>

              <div className="flex items-center justify-between gap-3 pt-2">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-xs font-semibold text-slate-400 hover:text-white transition"
                >
                  Voltar ao Login
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 px-5 py-2.5 text-xs font-bold text-slate-950 shadow-md transition hover:from-amber-400 hover:to-amber-500 active:scale-95 disabled:opacity-50"
                >
                  <span>{loading ? 'Verificando...' : 'Recuperar Senha'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
