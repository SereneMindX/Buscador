import React from 'react';
import { ExternalLink, Globe, Search, ShieldCheck } from 'lucide-react';
import { TARGET_ROLES, TargetRole, JobPortalSource } from '../types/job';

export function getLivePortalQueryUrl(portal: JobPortalSource, role: TargetRole): string {
  const enc = encodeURIComponent(role);
  switch (portal) {
    case 'Indeed':
      // Indeed Peru with Remote filter
      return `https://pe.indeed.com/jobs?q=${enc}&l=Per%C3%BA&sc=0kf%3Aattr%28DSQF7%29%3B`;
    case 'Computrabajo':
      // Computrabajo Peru with teletrabajo=1 filter
      return `https://pe.computrabajo.com/empleos-en-peru?q=${enc}&teletrabajo=1`;
    case 'Bumeran':
      // Bumeran Peru
      return `https://www.bumeran.com.pe/empleos-busqueda.html?q=${enc}`;
    case 'LinkedIn':
    default:
      // LinkedIn Jobs Peru with Remote filter f_WT=2
      return `https://www.linkedin.com/jobs/search/?keywords=${enc}&location=Peru&f_WT=2`;
  }
}

export const PortalLiveHub: React.FC = () => {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-xs mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="font-extrabold text-slate-900 text-base sm:text-lg">
              Hub de Enlaces Oficiales en Vivo por Rol
            </h3>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              100% Coincidencia Real
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Abre directamente la búsqueda oficial y filtrada para modalidad remota en cada uno de los 4 portales. Además, los servicios especializados de <strong>Computrabajo Perú</strong> (<code>/ofertas-de-trabajo/...</code>) y <strong>Bumeran Perú</strong> (<code>/empleos/[slug]-[id].html</code>) extraen enlaces canónicos directos a cada aviso sin pasar por buscadores genéricos.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
        {TARGET_ROLES.map((role) => (
          <div
            key={role}
            className="p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200 flex flex-col justify-between transition"
          >
            <div className="mb-2.5">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Rol Monitoreado
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{role}</h4>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <a
                href={getLivePortalQueryUrl('LinkedIn', role)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-xs rounded-lg border border-blue-200 flex items-center justify-between transition"
                title={`Ver ${role} en LinkedIn con filtro Remoto`}
              >
                <span>LinkedIn</span>
                <ExternalLink className="w-3 h-3 text-blue-500" />
              </a>

              <a
                href={getLivePortalQueryUrl('Indeed', role)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 font-semibold text-xs rounded-lg border border-indigo-200 flex items-center justify-between transition"
                title={`Ver ${role} en Indeed con filtro Remoto`}
              >
                <span>Indeed</span>
                <ExternalLink className="w-3 h-3 text-indigo-500" />
              </a>

              <a
                href={getLivePortalQueryUrl('Computrabajo', role)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 font-semibold text-xs rounded-lg border border-amber-200 flex items-center justify-between transition"
                title={`Ver ${role} en Computrabajo con filtro Teletrabajo`}
              >
                <span>Computrabajo</span>
                <ExternalLink className="w-3 h-3 text-amber-600" />
              </a>

              <a
                href={getLivePortalQueryUrl('Bumeran', role)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1.5 bg-purple-50 hover:bg-purple-100 text-purple-900 font-semibold text-xs rounded-lg border border-purple-200 flex items-center justify-between transition"
                title={`Ver ${role} en Bumeran Perú`}
              >
                <span>Bumeran</span>
                <ExternalLink className="w-3 h-3 text-purple-600" />
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
