import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight, Check } from 'lucide-react';

interface ModernDatePickerProps {
  value: string; // Formato 'YYYY-MM-DD'
  onChange: (value: string) => void;
  required?: boolean;
}

const MONTH_NAMES = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

const WEEK_DAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export const ModernDatePicker: React.FC<ModernDatePickerProps> = ({
  value,
  onChange,
  required = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse do valor atual ou fallback para hoje
  const selectedDate = value ? new Date(`${value}T12:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(selectedDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(selectedDate.getMonth());

  // Atualiza visão quando o valor mudar externamente
  useEffect(() => {
    if (value) {
      const d = new Date(`${value}T12:00:00`);
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Fechar ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear(viewYear - 1);
    } else {
      setViewMonth(viewMonth - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear(viewYear + 1);
    } else {
      setViewMonth(viewMonth + 1);
    }
  };

  const handleSelectDay = (day: number) => {
    const m = String(viewMonth + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    const formatted = `${viewYear}-${m}-${d}`;
    onChange(formatted);
    setIsOpen(false);
  };

  const setShortcut = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    onChange(formatted);
    setViewYear(year);
    setViewMonth(d.getMonth());
    setIsOpen(false);
  };

  const setNextSaturday = () => {
    const d = new Date();
    const currentDay = d.getDay(); // 0 Dom, 6 Sab
    const daysUntilSaturday = currentDay === 6 ? 7 : (6 - currentDay);
    d.setDate(d.getDate() + daysUntilSaturday);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    onChange(formatted);
    setViewYear(year);
    setViewMonth(d.getMonth());
    setIsOpen(false);
  };

  // Cálculos do Grid do Mês
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfWeek = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Domingo
  const daysInPrevMonth = new Date(viewYear, viewMonth, 0).getDate();

  // Data atual de referência para marcação
  const today = new Date();
  const isCurrentMonth = today.getFullYear() === viewYear && today.getMonth() === viewMonth;
  const todayDay = isCurrentMonth ? today.getDate() : -1;

  // Formatação legível para exibir no input
  let displayLabel = 'Selecione a data';
  if (value) {
    const parts = value.split('-');
    if (parts.length === 3) {
      const d = new Date(`${value}T12:00:00`);
      if (!isNaN(d.getTime())) {
        const weekDayShort = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()];
        displayLabel = `${parts[2]}/${parts[1]}/${parts[0]} (${weekDayShort})`;
      } else {
        displayLabel = `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    }
  }

  return (
    <div className="relative" ref={containerRef}>
      {/* Botão de Disparo estilizado */}
      <button
        type="button"
        id="btn-open-modern-datepicker"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 flex items-center justify-between rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 text-xs sm:text-sm text-slate-950 dark:text-white transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
      >
        <div className="flex items-center gap-2 truncate">
          <Calendar className="h-4 w-4 text-amber-600 dark:text-amber-500 shrink-0" />
          <span className={value ? 'font-bold' : 'text-slate-500'}>{displayLabel}</span>
        </div>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-black/20"
          title="Abrir calendário"
        >
          <Calendar className="h-3.5 w-3.5" />
        </div>
      </button>

      {/* Input oculto para validação nativa de formulário se necessário */}
      <input
        type="text"
        required={required}
        value={value}
        onChange={() => {}}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />

      {/* Popover do Calendário Moderno */}
      {isOpen && (
        <div
          id="modern-datepicker-popover"
          className="absolute left-0 top-12 z-50 w-full sm:w-[320px] rounded-2xl border border-black dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Cabeçalho do Mês e Navegação */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-black/20 dark:border-slate-800">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Mês anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            <span className="font-outfit text-sm font-bold text-slate-900 dark:text-white">
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              type="button"
              onClick={handleNextMonth}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title="Próximo mês"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {/* Atalhos Rápidos */}
          <div className="flex items-center gap-1.5 mb-3 flex-wrap">
            <button
              type="button"
              onClick={() => setShortcut(0)}
              className="rounded-lg px-2 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-300 hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400 transition border border-black/30 dark:border-transparent"
            >
              Hoje
            </button>
            <button
              type="button"
              onClick={() => setShortcut(1)}
              className="rounded-lg px-2 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-300 hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400 transition border border-black/30 dark:border-transparent"
            >
              Amanhã
            </button>
            <button
              type="button"
              onClick={setNextSaturday}
              className="rounded-lg px-2 py-1 text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-300 hover:bg-amber-500/15 hover:text-amber-700 dark:hover:text-amber-400 transition border border-black/30 dark:border-transparent"
            >
              Próximo Sábado
            </button>
          </div>

          {/* Dias da Semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {WEEK_DAYS.map((wd, i) => (
              <span
                key={i}
                className={`text-[10px] font-bold uppercase ${
                  i === 0 || i === 6 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-400'
                }`}
              >
                {wd}
              </span>
            ))}
          </div>

          {/* Grid dos Dias */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Dias do mês anterior */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => {
              const dayNum = daysInPrevMonth - firstDayOfWeek + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="flex h-8 items-center justify-center text-xs text-slate-300 dark:text-slate-700"
                >
                  {dayNum}
                </div>
              );
            })}

            {/* Dias do mês atual */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const mStr = String(viewMonth + 1).padStart(2, '0');
              const dStr = String(day).padStart(2, '0');
              const thisIso = `${viewYear}-${mStr}-${dStr}`;
              const isSelected = value === thisIso;
              const isToday = day === todayDay;

              return (
                <button
                  key={`day-${day}`}
                  type="button"
                  onClick={() => handleSelectDay(day)}
                  className={`flex h-8 w-full items-center justify-center rounded-xl text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-amber-500 text-slate-950 font-black shadow-md'
                      : isToday
                      ? 'border border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-500/10'
                      : 'text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Rodapé de Fechamento */}
          <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white px-2 py-1 rounded-lg"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
