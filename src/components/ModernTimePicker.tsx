import React, { useState, useRef, useEffect } from 'react';
import { Clock, Check, ChevronUp, ChevronDown, Sparkles } from 'lucide-react';

interface ModernTimePickerProps {
  value: string; // Formato 'HH:MM'
  onChange: (value: string) => void;
}

const COMMON_SHOW_TIMES = [
  '19:00',
  '19:30',
  '20:00',
  '20:30',
  '21:00',
  '21:30',
  '22:00',
  '22:30',
  '23:00',
  '00:00',
];

const MAIN_HOURS = [
  '18', '19', '20', '21', '22', '23', '00', '01', '02', '03'
];

const ALL_HOURS = Array.from({ length: 24 }).map((_, i) => String(i).padStart(2, '0'));

const MINUTE_PRESETS = ['00', '15', '30', '45'];

export const ModernTimePicker: React.FC<ModernTimePickerProps> = ({
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse time
  const [hour, setHour] = useState(() => {
    if (value && value.includes(':')) return value.split(':')[0];
    return '21';
  });

  const [minute, setMinute] = useState(() => {
    if (value && value.includes(':')) return value.split(':')[1];
    return '00';
  });

  const [showAllHours, setShowAllHours] = useState(false);

  // Sincroniza se o valor mudar externamente
  useEffect(() => {
    if (value && value.includes(':')) {
      const parts = value.split(':');
      setHour(parts[0]);
      setMinute(parts[1]);
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

  const updateTime = (newHour: string, newMinute: string) => {
    setHour(newHour);
    setMinute(newMinute);
    onChange(`${newHour}:${newMinute}`);
  };

  const handlePresetClick = (preset: string) => {
    const [h, m] = preset.split(':');
    updateTime(h, m);
    setIsOpen(false);
  };

  const stepMinute = (deltaMinutes: number) => {
    let totalMinutes = parseInt(hour, 10) * 60 + parseInt(minute, 10) + deltaMinutes;
    if (totalMinutes < 0) totalMinutes += 24 * 60;
    totalMinutes = totalMinutes % (24 * 60);

    const newH = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
    const newM = String(totalMinutes % 60).padStart(2, '0');
    updateTime(newH, newM);
  };

  const stepHour = (deltaHour: number) => {
    let hNum = (parseInt(hour, 10) + deltaHour) % 24;
    if (hNum < 0) hNum += 24;
    const newH = String(hNum).padStart(2, '0');
    updateTime(newH, minute);
  };

  // Período do dia
  const hourNum = parseInt(hour, 10);
  let periodLabel = 'Noite';
  if (hourNum >= 0 && hourNum < 6) periodLabel = 'Madrugada';
  else if (hourNum >= 6 && hourNum < 12) periodLabel = 'Manhã';
  else if (hourNum >= 12 && hourNum < 18) periodLabel = 'Tarde';

  return (
    <div className="relative" ref={containerRef}>
      {/* Gatilho estilizado */}
      <button
        type="button"
        id="btn-open-modern-timepicker"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full h-11 flex items-center justify-between rounded-xl border border-black dark:border-slate-800 bg-white dark:bg-slate-950 px-3.5 text-xs sm:text-sm text-slate-900 dark:text-white transition focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 hover:border-black/70 dark:hover:border-slate-700"
      >
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-amber-500 shrink-0" />
          <span className="font-bold text-slate-900 dark:text-white tracking-wide">
            {hour}:{minute}
          </span>
          <span className="rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
            {periodLabel}
          </span>
        </div>
        <div
          className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400"
          title="Selecionar horário"
        >
          <Clock className="h-3.5 w-3.5" />
        </div>
      </button>

      {/* Popover do Seletor Moderno de Horário */}
      {isOpen && (
        <div
          id="modern-timepicker-popover"
          className="absolute left-0 sm:right-0 sm:left-auto top-12 z-50 w-full sm:w-[320px] rounded-2xl border border-black dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Mostrador Digital Moderno com Steppers */}
          <div className="flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-black dark:border-slate-800 mb-3">
            {/* Hora com Steppers */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => stepHour(1)}
                className="p-1 text-slate-400 hover:text-amber-500 transition"
                title="+1 hora"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <span className="font-outfit text-3xl font-extrabold text-slate-900 dark:text-white tracking-wider">
                {hour}
              </span>
              <button
                type="button"
                onClick={() => stepHour(-1)}
                className="p-1 text-slate-400 hover:text-amber-500 transition"
                title="-1 hora"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <span className="font-outfit text-3xl font-bold text-amber-500 pb-1">:</span>

            {/* Minuto com Steppers */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => stepMinute(15)}
                className="p-1 text-slate-400 hover:text-amber-500 transition"
                title="+15 min"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <span className="font-outfit text-3xl font-extrabold text-slate-900 dark:text-white tracking-wider">
                {minute}
              </span>
              <button
                type="button"
                onClick={() => stepMinute(-15)}
                className="p-1 text-slate-400 hover:text-amber-500 transition"
                title="-15 min"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <div className="ml-2 pl-3 border-l border-black/20 dark:border-slate-800 text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Período
              </span>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                {periodLabel}
              </span>
            </div>
          </div>

          {/* Horários mais comuns de apresentações (Gigs) */}
          <div className="mb-3">
            <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              <Sparkles className="h-3 w-3 text-amber-500" />
              <span>Horários Frequentes para Shows</span>
            </div>
            <div className="grid grid-cols-5 gap-1.5">
              {COMMON_SHOW_TIMES.map((preset) => {
                const isSelected = `${hour}:${minute}` === preset;
                return (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => handlePresetClick(preset)}
                    className={`py-1 rounded-lg text-[11px] font-bold transition ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-amber-500/15 hover:text-amber-600 dark:hover:text-amber-400'
                    }`}
                  >
                    {preset}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seleção de Horas (Grid com scroll/toggle) */}
          <div className="mb-3">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5">
              <span>Hora ({hour}h)</span>
              <button
                type="button"
                onClick={() => setShowAllHours(!showAllHours)}
                className="text-[10px] text-amber-600 dark:text-amber-400 hover:underline"
              >
                {showAllHours ? 'Menos horas' : 'Ver todas (00-23h)'}
              </button>
            </div>
            <div className="grid grid-cols-6 sm:grid-cols-8 gap-1 max-h-28 overflow-y-auto pr-0.5">
              {(showAllHours ? ALL_HOURS : MAIN_HOURS).map((h) => {
                const isSelected = hour === h;
                return (
                  <button
                    key={h}
                    type="button"
                    onClick={() => updateTime(h, minute)}
                    className={`py-1 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {h}h
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seleção Rápida de Minutos */}
          <div className="mb-4">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mb-1.5 block">
              Minutos ({minute} min)
            </span>
            <div className="grid grid-cols-4 gap-1.5">
              {MINUTE_PRESETS.map((m) => {
                const isSelected = minute === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => updateTime(hour, m)}
                    className={`py-1.5 rounded-lg text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    :{m}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Botão de Confirmação */}
          <div className="pt-2 border-t border-black/20 dark:border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Definido: <strong className="text-slate-900 dark:text-white font-bold">{hour}:{minute}</strong>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-1.5 rounded-xl bg-amber-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition shadow-sm active:scale-95"
            >
              <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              <span>Confirmar</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
