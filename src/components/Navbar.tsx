import React, { useEffect, useState } from 'react';
import { Briefcase, Clock, Bell, Sparkles, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SchedulerConfig } from '../types/job';

interface NavbarProps {
  config: SchedulerConfig | null;
  limaTime: { timeString: string; fullDateString: string } | null;
  nextRunFormatted: string;
  isScanning: boolean;
  onTriggerScan: () => void;
  onOpenEmailPreview: () => void;
  onOpenHistory: () => void;
  totalJobsToday: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  config,
  limaTime,
  nextRunFormatted,
  isScanning,
  onTriggerScan,
  onOpenEmailPreview,
  onOpenHistory,
  totalJobsToday,
}) => {
  const [localClock, setLocalClock] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const str = new Intl.DateTimeFormat('es-PE', {
          timeZone: 'America/Lima',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(now);
        setLocalClock(str);
      } catch (e) {
        // fallback
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  JobRadar Perú
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
                  Remoto
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Monitoreo programado diario &bull; 8:00 PM (UTC-5)
              </p>
            </div>
          </div>

          {/* Time & Scheduler Status Indicator */}
          <div className="hidden md:flex items-center space-x-4 bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700/60 text-xs">
            <div className="flex items-center space-x-1.5 text-slate-300">
              <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
              <span>Hora Perú:</span>
              <span className="font-mono font-bold text-cyan-300">
                {localClock || limaTime?.timeString || '--:--'}
              </span>
            </div>
            <div className="h-3 w-px bg-slate-700" />
            <div className="flex items-center space-x-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400">Próxima alerta 8:00 PM:</span>
              <span className="text-slate-200 font-medium">{nextRunFormatted}</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2.5">
            <button
              onClick={onOpenHistory}
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
              title="Historial de reportes emitidos a las 8 PM"
            >
              <span>Historial</span>
            </button>

            <button
              onClick={onOpenEmailPreview}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-blue-200 hover:text-white bg-blue-950/60 hover:bg-blue-900/80 rounded-lg border border-blue-800/70 transition"
            >
              <Bell className="w-3.5 h-3.5 text-blue-400" />
              <span className="hidden sm:inline">Ver Boletín 8 PM</span>
              <span className="sm:hidden">Boletín</span>
              {totalJobsToday > 0 && (
                <span className="bg-blue-500 text-white text-[10px] font-bold px-1.5 py-0.2 rounded-full">
                  {totalJobsToday}
                </span>
              )}
            </button>

            <button
              onClick={onTriggerScan}
              disabled={isScanning}
              className={`inline-flex items-center space-x-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg shadow-md transition ${
                isScanning
                  ? 'bg-indigo-700/60 text-indigo-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/25 active:scale-95'
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'Investigando...' : 'Escanear Ahora'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
