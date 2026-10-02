export type TargetRole =
  | 'Product Manager'
  | 'Jefe de Compras'
  | 'Jefe de Categoría'
  | 'Jefe de Línea'
  | 'Jefe de Abastecimiento'
  | 'Jefe de Comex'
  | 'Jefe de Importaciones';

export const TARGET_ROLES: TargetRole[] = [
  'Product Manager',
  'Jefe de Compras',
  'Jefe de Categoría',
  'Jefe de Línea',
  'Jefe de Abastecimiento',
  'Jefe de Comex',
  'Jefe de Importaciones',
];

export type JobPortalSource = 'Indeed' | 'LinkedIn' | 'Computrabajo' | 'Bumeran';

export interface LimaTime {
  dateKey: string;
  hour: number;
  minute: number;
  second: number;
  timeString: string;
  fullDateString: string;
  hourKey: string;
}

export const ALLOWED_PORTALS: JobPortalSource[] = [
  'Indeed',
  'LinkedIn',
  'Computrabajo',
  'Bumeran',
];

export interface JobOffer {
  id: string;
  roleCategory: TargetRole;
  title: string; // Título exacto e idéntico al publicado en la oferta
  originalRoleTitle?: string;
  company: string;
  location: string;
  remoteType: '100% Remoto' | 'Híbrido Flexible' | 'Remoto Perú';
  descriptionSummary: string;
  keyRequirements: string[];
  salaryRange?: string;
  sourceUrl: string;
  sourceName: JobPortalSource;
  postedDate?: string;
  scannedAtHour?: string; // ej: "18:00"
}

export interface HourlyScanLog {
  id: string;
  timestamp: string; // ISO
  hourLabel: string; // ej: "18:00"
  dateKey: string; // YYYY-MM-DD
  portalsSearched: JobPortalSource[];
  jobsFoundCount: number;
  newUniqueJobsCount: number;
  status: 'completado' | 'en_progreso' | 'error';
  summary?: string;
}

export interface DailyReport {
  id: string;
  date: string; // YYYY-MM-DD
  timestamp: string; // ISO
  recipientEmail: string;
  totalOffers: number;
  byRole: Record<string, number>;
  byPortal: Record<JobPortalSource, number>;
  jobs: JobOffer[];
  executiveSummary: string;
  marketInsights: string;
  emailSubject: string;
  emailHtml: string;
  emailText: string;
  status: 'completado' | 'en_progreso' | 'error';
  hourlyScansCount?: number;
}

export interface SchedulerConfig {
  enabled: boolean;
  hourlyScanEnabled: boolean; // Tarea programada para investigar empleos cada hora
  hourlyIntervalMinutes: number; // 60 minutos
  scheduledHour: number; // 20 (8 PM)
  scheduledMinute: number; // 0
  timezone: string; // "America/Lima"
  recipientEmail: string;
  roles: TargetRole[];
  portals: JobPortalSource[];
  lastHourlyScanTimestamp: string | null;
  lastHourlyScanJobsFound: number;
  lastRunTimestamp: string | null;
  lastRunStatus: 'success' | 'error' | 'idle';
  lastRunOffersFound: number;
}
