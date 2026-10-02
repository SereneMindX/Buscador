import React from 'react';
import { Clock, CheckCircle2, RefreshCw, Globe, ArrowUpRight } from 'lucide-react';
import { HourlyScanLog } from '../types/job';

interface HourlyTimelineProps {
  hourlyScans: HourlyScanLog[];
  nextHourlyScanFormatted: string;
  isScanning: boolean;
  onTriggerHourlyScan: () => void;
}

export const HourlyTimeline: React.FC<HourlyTimelineProps> = ({
  hourlyScans,
  nextHourlyScanFormatted,
  isScanning,
  onTriggerHourlyScan,
}) => {
  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">
              Línea de Tiempo: Tarea Programada Cada Hora
            </h3>
            <p className="text-xs text-slate-500">
              Rastreos horarios automáticos en Indeed, LinkedIn, Computrabajo y Bumeran
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-xs font-medium text-slate-600 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
            Próximo escaneo horario: <strong className="text-indigo-600 font-semibold">{nextHourlyScanFormatted}</strong>
          </span>
          <button
            onClick={onTriggerHourlyScan}
            disabled={isScanning}
            className="inline-flex items-center space-x-1.5 px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-lg transition"
          >
            <RefreshCw className={`w-3 h-3 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'Escaneando...' : 'Forzar Escaneo Horario'}</span>
          </button>
        </div>
      </div>

      {hourlyScans.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-400">
          La tarea programada se ejecutará automáticamente en el cambio de hora. También puedes forzar una ronda ahora.
        </div>
      ) : (
        <div className="space-y-2.5">
          {hourlyScans.slice(0, 4).map((scan) => (
            <div
              key={scan.id}
              className="flex items-center justify-between p-2.5 bg-slate-50 hover:bg-slate-100/70 rounded-lg text-xs transition"
            >
              <div className="flex items-center space-x-3">
                <span className="font-mono font-bold text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-200">
                  {scan.hourLabel} hrs
                </span>
                <span className="flex items-center text-emerald-700 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mr-1" />
                  {scan.jobsFoundCount} ofertas reales detectadas ({scan.newUniqueJobsCount} nuevas únicas)
                </span>
              </div>

              <div className="flex items-center space-x-1.5">
                {scan.portalsSearched.map((portal) => (
                  <span
                    key={portal}
                    className="text-[10px] font-semibold px-2 py-0.5 rounded bg-white text-slate-700 border border-slate-200"
                  >
                    {portal}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
