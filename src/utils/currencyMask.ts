/**
 * Utilitários para formatação e máscara de moeda em tempo real (Padrão pt-BR)
 */
export const formatCurrencyInput = (raw: string | number): string => {
  if (typeof raw === 'number') {
    if (isNaN(raw) || raw === 0) return '0,00';
    return raw.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  const digits = (raw || '').replace(/\D/g, '');
  if (!digits) return '';

  // Limita o valor a no máximo 9 dígitos
  const trimmedDigits = digits.slice(0, 9);
  const cents = parseInt(trimmedDigits, 10);
  const value = cents / 100;
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const parseCurrencyInput = (formatted: string | number): number => {
  if (typeof formatted === 'number') return isNaN(formatted) ? 0 : formatted;
  const digits = (formatted || '').replace(/\D/g, '');
  if (!digits) return 0;
  return parseInt(digits, 10) / 100;
};

export const formatBRL = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value || 0);
};
