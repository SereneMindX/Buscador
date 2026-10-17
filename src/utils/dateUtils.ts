/**
 * Utilidades de fecha y hora oficial de Perú (America/Lima)
 */

export interface LimaDateInfo {
  fullDate: string; // ej: "Viernes, 16 de Octubre de 2026"
  shortDate: string; // ej: "16/10/2026"
  dayName: string; // ej: "Viernes"
  monthName: string; // ej: "Octubre"
  year: number;
  timeString: string; // ej: "20:39:00"
  fourDaysRange: string; // ej: "12 al 16 de Octubre"
}

export function getLimaDateInfo(baseDate: Date = new Date()): LimaDateInfo {
  const timeZone = 'America/Lima';

  // Nombre de día
  const dayNameRaw = new Intl.DateTimeFormat('es-PE', { timeZone, weekday: 'long' }).format(baseDate);
  const dayName = dayNameRaw.charAt(0).toUpperCase() + dayNameRaw.slice(1);

  // Fecha completa
  const fullDateRaw = new Intl.DateTimeFormat('es-PE', {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(baseDate);
  const fullDate = fullDateRaw.charAt(0).toUpperCase() + fullDateRaw.slice(1);

  // Corta
  const shortDate = new Intl.DateTimeFormat('es-PE', {
    timeZone,
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(baseDate);

  // Mes
  const monthRaw = new Intl.DateTimeFormat('es-PE', { timeZone, month: 'long' }).format(baseDate);
  const monthName = monthRaw.charAt(0).toUpperCase() + monthRaw.slice(1);

  // Hora
  const timeString = new Intl.DateTimeFormat('es-PE', {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(baseDate);

  // Rango últimos 4 días
  const fourDaysAgo = new Date(baseDate.getTime() - 4 * 24 * 60 * 60 * 1000);
  const startDay = new Intl.DateTimeFormat('es-PE', { timeZone, day: 'numeric' }).format(fourDaysAgo);
  const endDay = new Intl.DateTimeFormat('es-PE', { timeZone, day: 'numeric' }).format(baseDate);
  const fourDaysRange = `${startDay} al ${endDay} de ${monthName}`;

  return {
    fullDate,
    shortDate,
    dayName,
    monthName,
    year: baseDate.getFullYear(),
    timeString,
    fourDaysRange,
  };
}

export function getRelativeJobDateLabel(daysAgo: number = 0, baseDate: Date = new Date()): string {
  const targetDate = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  const shortDate = new Intl.DateTimeFormat('es-PE', {
    timeZone: 'America/Lima',
    day: '2-digit',
    month: '2-digit',
  }).format(targetDate);

  if (daysAgo === 0) {
    return `Publicado hoy (${shortDate})`;
  } else if (daysAgo === 1) {
    return `Hace 1 día (${shortDate})`;
  } else {
    return `Hace ${daysAgo} días (${shortDate})`;
  }
}
