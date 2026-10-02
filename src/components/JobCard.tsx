import React from 'react';
import {
  Building2,
  MapPin,
  ExternalLink,
  Calendar,
  CheckCircle,
  Mail,
  Laptop,
  Clock,
  ShieldCheck,
} from 'lucide-react';
import { JobOffer, TargetRole, JobPortalSource } from '../types/job';
import { getLivePortalQueryUrl } from './PortalLiveHub';

interface JobCardProps {
  job: JobOffer;
  recipientEmail?: string;
}

const roleTheme: Record<TargetRole, { bg: string; text: string; border: string }> = {
  'Product Manager': { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  'Jefe de Compras': { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  'Jefe de Categoría': { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  'Jefe de Línea': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  'Jefe de Abastecimiento': { bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  'Jefe de Comex': { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
  'Jefe de Importaciones': { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
};

export const JobCard: React.FC<JobCardProps> = ({ job, recipientEmail }) => {
  const theme = roleTheme[job.roleCategory] || {
    bg: 'bg-slate-50',
    text: 'text-slate-700',
    border: 'border-slate-200',
  };

  const handleSendSingleJobEmail = () => {
    const subject = encodeURIComponent(`[Oferta Real Verificada] ${job.title} - ${job.company}`);
    const body = encodeURIComponent(
      `Hola,\n\nTe comparto esta vacante real y verificada en ${job.sourceName}:\n\n` +
      `Cargo exacto: ${job.title}\n` +
      `Empresa: ${job.company}\n` +
      `Categoría: ${job.roleCategory}\n` +
      `Modalidad: ${job.remoteType}\n` +
      `Ubicación: ${job.location}\n\n` +
      `Enlace directo verificado a la postulación oficial:\n${job.sourceUrl}\n\n` +
      `Detectado por JobRadar Perú.`
    );
    const to = recipientEmail ? encodeURIComponent(recipientEmail) : '';
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition duration-200 p-5 flex flex-col justify-between">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span
              className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-md border ${theme.bg} ${theme.text} ${theme.border}`}
            >
              {job.roleCategory}
            </span>
            <span className="inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded border bg-blue-50 text-blue-800 border-blue-200">
              <ShieldCheck className="w-3 h-3 text-blue-600" />
              <span>{job.sourceName} Oficial</span>
            </span>
          </div>

          <span className="inline-flex items-center space-x-1 text-[11px] font-medium px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
            <Laptop className="w-3 h-3 text-emerald-600" />
            <span>{job.remoteType}</span>
          </span>
        </div>

        {/* Title: EXACT title as published */}
        <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mb-1.5 hover:text-blue-600 transition">
          <a href={job.sourceUrl} target="_blank" rel="noopener noreferrer">
            {job.title}
          </a>
        </h3>

        {/* Company & Details */}
        <div className="flex flex-wrap items-center gap-y-1 gap-x-3 text-xs text-slate-600 mb-3.5">
          <span className="flex items-center space-x-1 font-semibold text-slate-800">
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.company}</span>
          </span>
          <span className="flex items-center space-x-1 text-slate-500">
            <MapPin className="w-3.5 h-3.5 text-slate-400" />
            <span>{job.location}</span>
          </span>
        </div>

        {/* Summary */}
        <p className="text-slate-600 text-xs sm:text-sm line-clamp-3 mb-4 leading-relaxed">
          {job.descriptionSummary}
        </p>

        {/* Direct Link Verification Box */}
        <div className="mb-4 bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
          <div className="font-semibold text-slate-700 flex items-center justify-between">
            <span>Enlace Oficial a la Convocatoria:</span>
            <span className="text-emerald-600 font-bold flex items-center gap-0.5">
              <CheckCircle className="w-3 h-3" /> Verificado
            </span>
          </div>
          <div className="font-mono text-slate-500 text-[10px] truncate bg-white p-1 rounded border border-slate-200 select-all">
            {job.sourceUrl}
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="space-y-3 pt-3 border-t border-slate-100">
        <div className="flex items-center justify-between gap-2">
          <button
            onClick={handleSendSingleJobEmail}
            className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 border border-slate-200 transition shrink-0"
            title="Compartir enlace oficial por correo"
          >
            <Mail className="w-4 h-4" />
          </button>

          <a
            href={job.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 inline-flex items-center justify-center space-x-1.5 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition"
          >
            <span>Abrir Oferta Real en {job.sourceName}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Other portals queries */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
          <span>Ver este rol en:</span>
          <div className="flex items-center space-x-2">
            <a
              href={getLivePortalQueryUrl('Indeed', job.roleCategory)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-indigo-600 hover:underline font-semibold"
            >
              Indeed
            </a>
            <span>&bull;</span>
            <a
              href={getLivePortalQueryUrl('Computrabajo', job.roleCategory)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-700 hover:underline font-semibold"
            >
              Computrabajo
            </a>
            <span>&bull;</span>
            <a
              href={getLivePortalQueryUrl('Bumeran', job.roleCategory)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-purple-700 hover:underline font-semibold"
            >
              Bumeran
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
