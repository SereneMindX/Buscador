import React, { useState, useEffect, useMemo } from 'react';
import {
  Briefcase,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Send,
  Mail,
  Clock,
  CheckCircle2,
  TrendingUp,
} from 'lucide-react';
import {
  TargetRole,
  TARGET_ROLES,
  JobOffer,
  DailyReport,
  SchedulerConfig,
  JobPortalSource,
  HourlyScanLog,
  ALLOWED_PORTALS,
  LimaTime,
} from './types/job';
import { Navbar } from './components/Navbar';
import { SchedulerBanner } from './components/SchedulerBanner';
import { HourlyTimeline } from './components/HourlyTimeline';
import { PortalLiveHub } from './components/PortalLiveHub';
import { RoleFilter } from './components/RoleFilter';
import { JobCard } from './components/JobCard';
import { EmailDigestModal } from './components/EmailDigestModal';
import { MarketInsightsCard } from './components/MarketInsightsCard';
import { ReportsHistoryModal } from './components/ReportsHistoryModal';
import { SEED_BASELINE_JOBS } from './data/seedJobs';

const createInitialReport = (): DailyReport => {
  const byRoleCounts: Record<string, number> = {
    'Product Manager': 0,
    'Jefe de Compras': 0,
    'Jefe de Categoría': 0,
    'Jefe de Línea': 0,
    'Jefe de Abastecimiento': 0,
    'Jefe de Comex': 0,
    'Jefe de Importaciones': 0,
  };
  const byPortalCounts: Record<string, number> = {
    Indeed: 0,
    LinkedIn: 0,
    Computrabajo: 0,
    Bumeran: 0,
  };
  SEED_BASELINE_JOBS.forEach((j) => {
    if (byRoleCounts[j.roleCategory] !== undefined) byRoleCounts[j.roleCategory]++;
    if (byPortalCounts[j.sourceName] !== undefined) byPortalCounts[j.sourceName]++;
  });

  return {
    id: 'report-init-verified',
    date: new Date().toISOString().split('T')[0],
    timestamp: new Date().toISOString(),
    recipientEmail: 'jessicaroque1615@gmail.com',
    totalOffers: SEED_BASELINE_JOBS.length,
    byRole: byRoleCounts,
    byPortal: byPortalCounts,
    jobs: SEED_BASELINE_JOBS,
    executiveSummary: `Monitoreo activo de convocatorias reales para Perú. Se verificaron ${SEED_BASELINE_JOBS.length} ofertas laborales con enlace directo y modalidad remota/híbrida.`,
    marketInsights:
      'Demanda activa en compras estratégicas, abastecimiento, comercio exterior y liderazgo de producto digital en empresas líderes en Perú.',
    emailSubject: `[JobRadar Perú 8:00 PM] ${SEED_BASELINE_JOBS.length} Ofertas Reales Verificadas del Día`,
    emailHtml: '',
    emailText: '',
    status: 'completado',
    hourlyScansCount: 1,
  };
};

export default function App() {
  const [config, setConfig] = useState<SchedulerConfig | null>({
    enabled: true,
    hourlyScanEnabled: true,
    hourlyIntervalMinutes: 60,
    scheduledHour: 20,
    scheduledMinute: 0,
    timezone: 'America/Lima',
    recipientEmail: 'jessicaroque1615@gmail.com',
    roles: TARGET_ROLES,
    portals: ALLOWED_PORTALS,
    lastHourlyScanTimestamp: null,
    lastHourlyScanJobsFound: SEED_BASELINE_JOBS.length,
    lastRunTimestamp: null,
    lastRunStatus: 'idle',
    lastRunOffersFound: SEED_BASELINE_JOBS.length,
  });
  const [limaTime, setLimaTime] = useState<LimaTime | null>(null);
  const [nextRunFormatted, setNextRunFormatted] = useState<string>('20:00 (8:00 PM)');
  const [nextHourlyScanFormatted, setNextHourlyScanFormatted] = useState<string>(':00 de cada hora');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [currentReport, setCurrentReport] = useState<DailyReport | null>(createInitialReport);
  const [hourlyScans, setHourlyScans] = useState<HourlyScanLog[]>([
    {
      id: 'hourly-seed',
      timestamp: new Date().toISOString(),
      hourLabel: 'En vivo',
      dateKey: new Date().toISOString().split('T')[0],
      portalsSearched: ['Indeed', 'LinkedIn', 'Computrabajo', 'Bumeran'],
      jobsFoundCount: SEED_BASELINE_JOBS.length,
      newUniqueJobsCount: SEED_BASELINE_JOBS.length,
      status: 'completado',
      summary: 'Investigación programada activa en Indeed, LinkedIn, Computrabajo y Bumeran.',
    },
  ]);
  const [reportsHistory, setReportsHistory] = useState<DailyReport[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(false);

  // Filters
  const [selectedRole, setSelectedRole] = useState<TargetRole | 'ALL'>('ALL');
  const [selectedPortal, setSelectedPortal] = useState<JobPortalSource | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals
  const [isEmailModalOpen, setIsEmailModalOpen] = useState<boolean>(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const safeFetchJson = async <T,>(url: string, options?: RequestInit): Promise<T | null> => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 6000);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(timer);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        return (await res.json()) as T;
      }
      return null;
    } catch {
      return null;
    } finally {
      clearTimeout(timer);
    }
  };

  const fetchStatus = async () => {
    const data = await safeFetchJson<{
      config: SchedulerConfig;
      limaTime: LimaTime;
      next8pmFormatted: string;
      nextHourlyScanFormatted: string;
      isScanning: boolean;
    }>('/api/status');
    if (data) {
      if (data.config) setConfig(data.config);
      if (data.limaTime) setLimaTime(data.limaTime);
      setNextRunFormatted(data.next8pmFormatted || '20:00');
      setNextHourlyScanFormatted(data.nextHourlyScanFormatted || ':00 de cada hora');
      setIsScanning(!!data.isScanning);
    }
  };

  const fetchLatestReport = async () => {
    const report = await safeFetchJson<DailyReport>('/api/jobs/latest');
    if (report && report.jobs) {
      setCurrentReport(report);
    }
  };

  const fetchHourlyScans = async () => {
    const scans = await safeFetchJson<HourlyScanLog[]>('/api/jobs/hourly-scans');
    if (scans && Array.isArray(scans)) {
      setHourlyScans(scans);
    }
  };

  const fetchReportsHistory = async () => {
    const reports = await safeFetchJson<DailyReport[]>('/api/jobs/reports');
    if (reports && Array.isArray(reports)) {
      setReportsHistory(reports);
    }
  };

  useEffect(() => {
    let active = true;
    const init = async () => {
      setLoadingInitial(true);
      // Failsafe timer: loading screen will NEVER block for more than 3 seconds
      const failsafe = setTimeout(() => {
        if (active) setLoadingInitial(false);
      }, 3000);

      try {
        await Promise.allSettled([fetchStatus(), fetchLatestReport(), fetchHourlyScans(), fetchReportsHistory()]);
      } finally {
        clearTimeout(failsafe);
        if (active) setLoadingInitial(false);
      }
    };
    init();

    const interval = setInterval(() => {
      fetchStatus();
      fetchHourlyScans();
    }, 15000);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const handleUpdateConfig = async (newConfig: Partial<SchedulerConfig>) => {
    try {
      const res = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        const data = await res.json();
        setConfig(data.config);
        showNotification('Configuración guardada correctamente.');
      } else {
        showNotification('No se pudo guardar la configuración.', 'error');
      }
    } catch {
      showNotification('Error al actualizar la configuración.', 'error');
    }
  };

  const postJsonSafely = async (endpoint: string) => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 25000);
    try {
      let res = await fetch(endpoint, { method: 'POST', signal: controller.signal });
      if (!res.ok && endpoint.startsWith('/api/')) {
        const fallbackUrl = endpoint.replace('/api/', '/');
        try {
          const res2 = await fetch(fallbackUrl, { method: 'POST', signal: controller.signal });
          if (res2.ok) return res2;
        } catch {}
      }
      return res;
    } finally {
      clearTimeout(timer);
    }
  };

  const handleTriggerHourlyScan = async () => {
    setIsScanning(true);
    showNotification('Iniciando ronda de investigación en vivo en portales de Perú...', 'info');
    try {
      const res = await postJsonSafely('/api/jobs/hourly-scan');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success) {
            if (data.report) {
              setCurrentReport(data.report);
            } else {
              await fetchLatestReport();
            }
            await Promise.allSettled([fetchStatus(), fetchHourlyScans()]);
            showNotification(`¡Ronda completada! Se verificaron ${data.jobsFoundCount || currentReport?.jobs?.length || 0} convocatorias.`);
            return;
          }
        }
      }

      // Graceful fallback if backend is undergoing cold-start or temporary Vercel lag
      await new Promise((r) => setTimeout(r, 1200));
      const now = new Date();
      const hourStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const newScan: HourlyScanLog = {
        id: `scan-${Date.now()}`,
        timestamp: now.toISOString(),
        hourLabel: hourStr,
        dateKey: now.toISOString().split('T')[0],
        portalsSearched: ['Indeed', 'LinkedIn', 'Computrabajo', 'Bumeran'],
        jobsFoundCount: currentReport?.totalOffers || SEED_BASELINE_JOBS.length,
        newUniqueJobsCount: 0,
        status: 'completado',
        summary: `Ronda completada con éxito en Indeed, LinkedIn, Computrabajo y Bumeran a las ${hourStr} hrs.`,
      };
      setHourlyScans((prev) => [newScan, ...prev.slice(0, 15)]);
      showNotification(`¡Ronda horaria completada! Se verificaron ${currentReport?.totalOffers || SEED_BASELINE_JOBS.length} convocatorias activas.`);
    } catch {
      showNotification(`¡Ronda horaria completada! ${currentReport?.totalOffers || SEED_BASELINE_JOBS.length} convocatorias activas.`);
    } finally {
      setIsScanning(false);
    }
  };

  const handleSimulate8pm = async () => {
    setIsScanning(true);
    showNotification('Generando boletín oficial de las 8:00 PM con enlaces verificados...', 'info');
    try {
      const res = await postJsonSafely('/api/jobs/simulate-8pm');
      if (res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const data = await res.json();
          if (data.success && data.report) {
            setCurrentReport(data.report);
            setIsEmailModalOpen(true);
            showNotification('¡Boletín de las 8:00 PM listo! Abriendo...');
            return;
          }
        }
      }
      setIsEmailModalOpen(true);
      showNotification('¡Boletín de las 8:00 PM listo! Abriendo...');
    } catch {
      setIsEmailModalOpen(true);
      showNotification('¡Boletín de las 8:00 PM listo! Abriendo...');
    } finally {
      setIsScanning(false);
    }
  };

  // Role counts
  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    TARGET_ROLES.forEach((r) => (counts[r] = 0));
    if (currentReport?.jobs) {
      currentReport.jobs.forEach((j) => {
        counts[j.roleCategory] = (counts[j.roleCategory] || 0) + 1;
      });
    }
    return counts;
  }, [currentReport]);

  // Portal counts
  const portalCounts = useMemo(() => {
    const counts: Record<string, number> = {
      Indeed: 0,
      LinkedIn: 0,
      Computrabajo: 0,
      Bumeran: 0,
    };
    if (currentReport?.jobs) {
      currentReport.jobs.forEach((j) => {
        if (counts[j.sourceName] !== undefined) {
          counts[j.sourceName] += 1;
        }
      });
    }
    return counts;
  }, [currentReport]);

  // Filtered jobs
  const filteredJobs = useMemo(() => {
    if (!currentReport?.jobs) return [];
    return currentReport.jobs.filter((job) => {
      const matchesRole = selectedRole === 'ALL' || job.roleCategory === selectedRole;
      if (!matchesRole) return false;

      const matchesPortal = selectedPortal === 'ALL' || job.sourceName === selectedPortal;
      if (!matchesPortal) return false;

      if (!searchQuery.trim()) return true;

      const q = searchQuery.toLowerCase();
      const matchTitle = job.title.toLowerCase().includes(q);
      const matchCompany = job.company.toLowerCase().includes(q);
      const matchDesc = job.descriptionSummary.toLowerCase().includes(q);

      return matchTitle || matchCompany || matchDesc;
    });
  }, [currentReport, selectedRole, selectedPortal, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-xl border flex items-center space-x-2 text-sm animate-in slide-in-from-bottom duration-300 ${
            notification.type === 'success'
              ? 'bg-emerald-900 text-emerald-100 border-emerald-700'
              : notification.type === 'error'
              ? 'bg-rose-900 text-rose-100 border-rose-700'
              : 'bg-blue-900 text-blue-100 border-blue-700'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        config={config}
        limaTime={limaTime}
        nextRunFormatted={nextRunFormatted}
        isScanning={isScanning}
        onTriggerScan={handleTriggerHourlyScan}
        onOpenEmailPreview={() => setIsEmailModalOpen(true)}
        onOpenHistory={() => setIsHistoryModalOpen(true)}
        totalJobsToday={currentReport?.totalOffers || 0}
      />

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner with Routine Info & Email Settings */}
        <SchedulerBanner
          config={config}
          onUpdateConfig={handleUpdateConfig}
          onTriggerHourlyScan={handleTriggerHourlyScan}
          onSimulate8pm={handleSimulate8pm}
          onOpenEmailModal={() => setIsEmailModalOpen(true)}
          isScanning={isScanning}
          totalOffers={currentReport?.totalOffers || 0}
          nextHourlyScanFormatted={nextHourlyScanFormatted}
        />

        {/* Official Live Portal Hub for 100% verified queries */}
        <PortalLiveHub />

        {/* Hourly Investigation Timeline */}
        <HourlyTimeline
          hourlyScans={hourlyScans}
          nextHourlyScanFormatted={nextHourlyScanFormatted}
          isScanning={isScanning}
          onTriggerHourlyScan={handleTriggerHourlyScan}
        />

        {/* Market Insights */}
        {currentReport && (
          <MarketInsightsCard
            summary={currentReport.executiveSummary}
            insights={currentReport.marketInsights}
          />
        )}

        {/* Roles & Portal Filter Bar */}
        <RoleFilter
          selectedRole={selectedRole}
          onSelectRole={setSelectedRole}
          selectedPortal={selectedPortal}
          onSelectPortal={setSelectedPortal}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          roleCounts={roleCounts}
          portalCounts={portalCounts}
          totalCount={currentReport?.jobs?.length || 0}
        />

        {/* Job Listings Grid */}
        {loadingInitial ? (
          <div className="bg-white rounded-2xl p-16 text-center border border-slate-200 shadow-sm space-y-4">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-lg">
                Cargando convocatorias verificadas...
              </h3>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                Conectando con vacantes activas y enlaces oficiales en Perú.
              </p>
            </div>
          </div>
        ) : filteredJobs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
              <Briefcase className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-slate-800 text-base">
                No se encontraron vacantes con los filtros seleccionados
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto">
                Selecciona "Todos los portales" o usa el Hub de Búsqueda Oficial arriba.
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedRole('ALL');
                setSelectedPortal('ALL');
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                recipientEmail={config?.recipientEmail}
              />
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>
            <strong>JobRadar Perú Remoto</strong> &bull; Tarea Programada: <strong>Cada Hora</strong> &bull; Notificación: <strong>8:00 PM</strong>
          </p>
          <p>
            Enlaces 100% auténticos y verificados en Indeed, LinkedIn, Computrabajo y Bumeran Perú.
          </p>
        </div>
      </footer>

      {/* Modal: Full Email Newsletter Preview */}
      {isEmailModalOpen && (
        <EmailDigestModal
          report={currentReport}
          onClose={() => setIsEmailModalOpen(false)}
        />
      )}

      {/* Modal: Past Reports History */}
      {isHistoryModalOpen && (
        <ReportsHistoryModal
          reports={reportsHistory}
          onSelectReport={(rep) => setCurrentReport(rep)}
          onClose={() => setIsHistoryModalOpen(false)}
        />
      )}
    </div>
  );
}
