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

export default function App() {
  const [config, setConfig] = useState<SchedulerConfig | null>(null);
  const [limaTime, setLimaTime] = useState<LimaTime | null>(null);
  const [nextRunFormatted, setNextRunFormatted] = useState<string>('20:00 (8:00 PM)');
  const [nextHourlyScanFormatted, setNextHourlyScanFormatted] = useState<string>(':00 de cada hora');
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [currentReport, setCurrentReport] = useState<DailyReport | null>(null);
  const [hourlyScans, setHourlyScans] = useState<HourlyScanLog[]>([]);
  const [reportsHistory, setReportsHistory] = useState<DailyReport[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);

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
    try {
      const res = await fetch(url, options);
      const contentType = res.headers.get('content-type');
      if (res.ok && contentType && contentType.includes('application/json')) {
        return (await res.json()) as T;
      }
      return null;
    } catch {
      return null;
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
    const init = async () => {
      setLoadingInitial(true);
      await Promise.all([fetchStatus(), fetchLatestReport(), fetchHourlyScans(), fetchReportsHistory()]);
      setLoadingInitial(false);
    };
    init();

    const interval = setInterval(() => {
      fetchStatus();
      fetchHourlyScans();
    }, 12000);
    return () => clearInterval(interval);
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
    let res = await fetch(endpoint, { method: 'POST' });
    if (!res.ok && endpoint.startsWith('/api/')) {
      const fallbackUrl = endpoint.replace('/api/', '/');
      try {
        const res2 = await fetch(fallbackUrl, { method: 'POST' });
        if (res2.ok) return res2;
      } catch {}
    }
    return res;
  };

  const handleTriggerHourlyScan = async () => {
    setIsScanning(true);
    showNotification('Consultando vacantes reales en vivo en los portales oficiales...', 'info');
    try {
      const res = await postJsonSafely('/api/jobs/hourly-scan');
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Respuesta no válida del servidor.');
      }
      const data = await res.json();
      if (data.success) {
        if (data.report) setCurrentReport(data.report);
        await Promise.all([fetchStatus(), fetchHourlyScans()]);
        showNotification(`¡Ronda horaria completada! Se verificaron ${data.jobsFoundCount} convocatorias reales.`);
      } else {
        showNotification(data.error || 'Error al ejecutar ronda horaria.', 'error');
      }
    } catch (e: any) {
      showNotification(e.message || 'Error de conexión.', 'error');
    } finally {
      setIsScanning(false);
    }
  };

  const handleSimulate8pm = async () => {
    setIsScanning(true);
    showNotification('Generando boletín oficial de las 8:00 PM con enlaces verificados...', 'info');
    try {
      const res = await postJsonSafely('/api/jobs/simulate-8pm');
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Respuesta no válida del servidor.');
      }
      const data = await res.json();
      if (data.success && data.report) {
        setCurrentReport(data.report);
        await Promise.all([fetchStatus(), fetchReportsHistory()]);
        showNotification('¡Boletín de las 8:00 PM listo! Abriendo...');
        setIsEmailModalOpen(true);
      } else {
        showNotification(data.error || 'Error al compilar reporte de 8:00 PM.', 'error');
      }
    } catch (e: any) {
      showNotification(e.message || 'Error de conexión.', 'error');
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
