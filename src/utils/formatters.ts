export const MONTH_NAMES = [
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

export const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function formatDateTime(isoString: string): {
  dateFormatted: string;
  timeFormatted: string;
  dayOfWeek: string;
  relative: string;
} {
  if (!isoString) {
    return { dateFormatted: '', timeFormatted: '', dayOfWeek: '', relative: '' };
  }

  const d = new Date(isoString);
  if (isNaN(d.getTime())) {
    return { dateFormatted: isoString, timeFormatted: '', dayOfWeek: '', relative: '' };
  }

  const day = String(d.getDate()).padStart(2, '0');
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const dayOfWeek = WEEKDAYS_SHORT[d.getDay()];

  const dateFormatted = `${day} de ${month}, ${year}`;
  const timeFormatted = `${hours}:${minutes}h`;

  const today = new Date();
  const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const showDateZero = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round((showDateZero.getTime() - todayZero.getTime()) / (1000 * 60 * 60 * 24));

  let relative = '';
  if (diffDays === 0) relative = 'Hoje';
  else if (diffDays === 1) relative = 'Amanhã';
  else if (diffDays === -1) relative = 'Ontem';
  else if (diffDays > 1 && diffDays <= 7) relative = `Em ${diffDays} dias`;
  else if (diffDays < -1) relative = `Há ${Math.abs(diffDays)} dias`;

  return {
    dateFormatted,
    timeFormatted,
    dayOfWeek,
    relative,
  };
}

export function getMonthYearKey(dateStr: string): { month: number; year: number } {
  const d = new Date(dateStr);
  return {
    month: d.getMonth() + 1,
    year: d.getFullYear(),
  };
}
