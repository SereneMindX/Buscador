import React, { useState } from 'react';
import { Mail, Clock, CheckCircle2, Send, Edit2, Check, Sparkles, RefreshCw, ShieldCheck } from 'lucide-react';
import { SchedulerConfig, TARGET_ROLES, ALLOWED_PORTALS, JobPortalSource } from '../types/job';

interface SchedulerBannerProps {
  config: SchedulerConfig | null;
  onUpdateConfig: (newConfig: Partial<SchedulerConfig>) => Promise<void>;
  onTriggerHourlyScan: () => Promise<void>;
  onSimulate8pm: () => Promise<void>;
  onOpenEmailModal: () => void;
  isScanning: boolean;
  totalOffers: number;
  nextHourlyScanFormatted: string;
}

export const SchedulerBanner: React.FC<SchedulerBannerProps> = ({
  config,
  onUpdateConfig,
  onTriggerHourlyScan,
  onSimulate8pm,
  onOpenEmailModal,
  isScanning,
  totalOffers,
  nextHourlyScanFormatted,
}) => {
  const [isEditingEmail, setIsEditingEmail] = useState(false);
  const [emailInput, setEmailInput] = useState(config?.recipientEmail || 'jessicaroque1615@gmail.com');
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const handleSaveEmail = async () => {
    if (!emailInput || !emailInput.includes('@')) {
      alert('Por favor ingresa un correo electrónico válido');
      return;
    }
    try {
      await onUpdateConfig({ recipientEmail: emailInput.trim() });
      setIsEditingEmail(false);
      setSaveStatus('Correo actualizado');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (e) {
      alert('Error guardando la configuración');
    }
  };

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-6 shadow-xl border border-slate-700/80 mb-6 relative overflow-hidden">
      {/* Background ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Column: Routine Description */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" style={{ animationDuration: '6s' }} />
              <span>Investigación Programada: Cada Hora</span>
            </span>

            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <Mail className="w-3 h-3 text-emerald-400" />
              <span>Notificación Diaria: 8:00 PM (Hora Perú)</span>
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Radar de Empleos Remotos en Perú &bull; Tarea Horaria
          </h1>

          <p className="text-slate-300 text-sm leading-relaxed">
            Rastreo automatizado cada 60 minutos en <strong className="text-white">Indeed</strong>,{' '}
            <strong className="text-white">LinkedIn</strong>, <strong className="text-white">Computrabajo</strong> y{' '}
            <strong className="text-white">Bumeran</strong>. Conserva el rol exacto de cada publicación original y notifica a las{' '}
            <strong className="text-cyan-300 font-semibold underline decoration-cyan-400">8:00 PM</strong> el consolidado del día.
          </p>

          {/* Email recipient bar */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-xs sm:text-sm">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-blue-400" />
              Enviar boletín a:
            </span>

            {isEditingEmail ? (
              <div className="flex items-center gap-1.5 bg-slate-900/90 p-1 rounded-lg border border-blue-500">
                <input
                  type="email"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  className="bg-transparent text-white px-2 py-1 text-xs sm:text-sm outline-none w-56 sm:w-64"
                  placeholder="ejemplo@correo.com"
                  autoFocus
                />
                <button
                  onClick={handleSaveEmail}
                  className="bg-blue-600 hover:bg-blue-500 text-white p-1 rounded-md transition"
                  title="Guardar correo"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 bg-slate-800/90 px-3 py-1.5 rounded-lg border border-slate-700 text-white font-mono font-medium">
                <span>{config?.recipientEmail || 'jessicaroque1615@gmail.com'}</span>
                <button
                  onClick={() => {
                    setEmailInput(config?.recipientEmail || 'jessicaroque1615@gmail.com');
                    setIsEditingEmail(true);
                  }}
                  className="text-slate-400 hover:text-white transition ml-1"
                  title="Cambiar correo de destino"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {saveStatus && (
              <span className="text-emerald-400 text-xs flex items-center gap-1">
                <Check className="w-3 h-3" /> {saveStatus}
              </span>
            )}
          </div>
        </div>

        {/* Right Column: Actions */}
        <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 min-w-[240px]">
          <button
            onClick={onOpenEmailModal}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 transition active:scale-95"
          >
            <Mail className="w-4 h-4" />
            <span>Ver Boletín de las 8:00 PM</span>
          </button>

          <button
            onClick={onTriggerHourlyScan}
            disabled={isScanning}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 hover:text-white font-medium text-xs rounded-xl transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isScanning ? 'animate-spin' : ''}`} />
            <span>Ejecutar Escaneo Horario Ahora</span>
          </button>

          <button
            onClick={onSimulate8pm}
            disabled={isScanning}
            className="flex items-center justify-center space-x-2 px-4 py-2 bg-slate-900/80 hover:bg-slate-800 border border-indigo-500/40 text-cyan-300 font-medium text-xs rounded-xl transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Simular Envío de las 8:00 PM</span>
          </button>
        </div>
      </div>

      {/* Target Portals & Strict Verification Notice */}
      <div className="mt-5 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-semibold uppercase text-[11px] tracking-wider">
            Portales consultados:
          </span>
          {ALLOWED_PORTALS.map((portal) => (
            <span
              key={portal}
              className="px-2.5 py-0.5 rounded-md font-semibold bg-slate-800 text-slate-200 border border-slate-700"
            >
              {portal}
            </span>
          ))}
        </div>

        <div className="flex items-center space-x-1.5 text-emerald-400">
          <ShieldCheck className="w-4 h-4" />
          <span>Scrapers Directos Activos: Computrabajo (Canónicos) + Bumeran (API v2) + LinkedIn Oficial</span>
        </div>
      </div>
    </div>
  );
};
