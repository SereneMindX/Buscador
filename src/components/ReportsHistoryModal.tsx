import React from 'react';
import { X, Calendar, Mail, FileCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { DailyReport } from '../types/job';

interface ReportsHistoryModalProps {
  reports: DailyReport[];
  onSelectReport: (report: DailyReport) => void;
  onClose: () => void;
}

export const ReportsHistoryModal: React.FC<ReportsHistoryModalProps> = ({
  reports,
  onSelectReport,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">Historial de Reportes Diarios 8:00 PM</h2>
              <p className="text-xs text-slate-400">
                Registros de ejecuciones y boletines emitidos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List of reports */}
        <div className="flex-1 overflow-y-auto p-5 divide-y divide-slate-100">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-sm">
              No hay reportes previos aún. Se generará uno automáticamente hoy a las 8:00 PM.
            </div>
          ) : (
            reports.map((rep) => (
              <div
                key={rep.id}
                className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 hover:bg-slate-50 p-3 rounded-xl transition"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900 text-sm">
                      {rep.date} &bull; 20:00 hrs
                    </span>
                    <span className="text-[11px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full border border-emerald-200">
                      {rep.totalOffers} vacantes
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Notificado a: <span className="font-mono text-slate-700">{rep.recipientEmail}</span>
                  </p>
                  <p className="text-xs text-slate-600 line-clamp-1 italic">
                    "{rep.emailSubject}"
                  </p>
                </div>

                <button
                  onClick={() => {
                    onSelectReport(rep);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg flex items-center space-x-1 shrink-0 transition"
                >
                  <span>Ver Boletín</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg transition"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
};
