import React from 'react';
import { TrendingUp, Lightbulb, ShieldCheck, Award } from 'lucide-react';

interface MarketInsightsCardProps {
  summary: string;
  insights: string;
}

export const MarketInsightsCard: React.FC<MarketInsightsCardProps> = ({ summary, insights }) => {
  return (
    <div className="bg-gradient-to-r from-blue-900/10 via-indigo-900/10 to-slate-900/5 rounded-2xl border border-blue-200/70 p-5 sm:p-6 mb-8">
      <div className="flex items-start space-x-3.5">
        <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-600 shrink-0">
          <Lightbulb className="w-5 h-5" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="flex items-center space-x-2">
            <h3 className="font-bold text-slate-900 text-sm sm:text-base">
              Análisis del Mercado Laboral Remoto &bull; Perú
            </h3>
            <span className="text-[11px] bg-blue-100 text-blue-800 font-semibold px-2 py-0.5 rounded-full">
              Headhunter Report
            </span>
          </div>

          <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
            {summary}
          </p>

          {insights && (
            <div className="pt-2 text-xs text-slate-600 border-t border-blue-100/60 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
              <span><strong>Observación estratégica:</strong> {insights}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3">
            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-blue-500" />
                <span>Requisitos Más Demandados</span>
              </div>
              <p className="text-xs text-slate-700">
                SAP MM/ERP, Excel Avanzado, Inglés B2/C1, Negociación con Navieras/Agentes de Aduana.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                <span>Rango Salarial Promedio</span>
              </div>
              <p className="text-xs text-slate-700">
                Jefaturas y PMs: <strong>S/. 7,500 – S/. 14,000 PEN</strong> mensuales según tamaño de empresa.
              </p>
            </div>

            <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs">
              <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                <span>Modalidad Remota Perú</span>
              </div>
              <p className="text-xs text-slate-700">
                Contratos planilla Ley 728 con teletrabajo formal bajo Ley del Teletrabajo N° 31572.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
