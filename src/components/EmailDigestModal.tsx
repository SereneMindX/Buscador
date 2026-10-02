import React, { useState } from 'react';
import { X, Mail, Copy, Check, Download, ExternalLink, Send, FileText } from 'lucide-react';
import { DailyReport } from '../types/job';

interface EmailDigestModalProps {
  report: DailyReport | null;
  onClose: () => void;
}

export const EmailDigestModal: React.FC<EmailDigestModalProps> = ({ report, onClose }) => {
  const [activeTab, setActiveTab] = useState<'preview' | 'html' | 'text'>('preview');
  const [copied, setCopied] = useState<string | null>(null);

  if (!report) return null;

  const handleCopyText = (content: string, key: string) => {
    navigator.clipboard.writeText(content);
    setCopied(key);
    setTimeout(() => setCopied(null), 2500);
  };

  const handleOpenMailClient = () => {
    const to = encodeURIComponent(report.recipientEmail);
    const subject = encodeURIComponent(report.emailSubject);
    // Provide a neat text body with top highlights and link to the application
    const body = encodeURIComponent(report.emailText);
    window.location.href = `mailto:${to}?subject=${subject}&body=${body}`;
  };

  const handleDownloadFile = (type: 'html' | 'txt') => {
    const content = type === 'html' ? report.emailHtml : report.emailText;
    const blob = new Blob([content], { type: type === 'html' ? 'text/html' : 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boletin-empleos-peru-8pm-${report.date}.${type}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="p-4 sm:p-6 bg-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-500/40 flex items-center justify-center">
              <Mail className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">Boletín Oficial de las 8:00 PM</h2>
                <span className="text-[11px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full font-medium">
                  {report.totalOffers} ofertas listas
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Programado para: <strong className="text-slate-200 font-mono">{report.recipientEmail}</strong> &bull; Fecha: {report.date}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Email Meta bar */}
        <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 flex-1 min-w-[240px]">
            <span className="font-semibold text-slate-500 uppercase tracking-wider text-[11px]">Asunto:</span>
            <span className="font-medium text-slate-800 truncate select-all">{report.emailSubject}</span>
            <button
              onClick={() => handleCopyText(report.emailSubject, 'subject')}
              className="text-slate-400 hover:text-blue-600 p-1 rounded"
              title="Copiar asunto"
            >
              {copied === 'subject' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center space-x-1 bg-slate-200/80 p-0.5 rounded-lg text-xs">
            <button
              onClick={() => setActiveTab('preview')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'preview' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Vista Previa
            </button>
            <button
              onClick={() => setActiveTab('html')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'html' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Código HTML
            </button>
            <button
              onClick={() => setActiveTab('text')}
              className={`px-3 py-1 rounded-md font-medium transition ${
                activeTab === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Texto Plano
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-100/50">
          {activeTab === 'preview' && (
            <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div dangerouslySetInnerHTML={{ __html: report.emailHtml }} />
            </div>
          )}

          {activeTab === 'html' && (
            <div className="relative">
              <pre className="p-4 bg-slate-900 text-slate-100 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-[500px]">
                {report.emailHtml}
              </pre>
              <button
                onClick={() => handleCopyText(report.emailHtml, 'html')}
                className="absolute top-3 right-3 bg-blue-600 hover:bg-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow"
              >
                {copied === 'html' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'html' ? '¡Copiado!' : 'Copiar HTML'}</span>
              </button>
            </div>
          )}

          {activeTab === 'text' && (
            <div className="relative">
              <pre className="p-4 bg-white border border-slate-200 text-slate-800 rounded-xl text-xs font-mono overflow-x-auto whitespace-pre-wrap max-h-[500px]">
                {report.emailText}
              </pre>
              <button
                onClick={() => handleCopyText(report.emailText, 'text')}
                className="absolute top-3 right-3 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center space-x-1.5 shadow"
              >
                {copied === 'text' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied === 'text' ? '¡Copiado!' : 'Copiar Texto'}</span>
              </button>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-slate-200 flex flex-wrap items-center justify-between gap-3 shrink-0">
          <div className="flex items-center space-x-2 text-xs">
            <button
              onClick={() => handleDownloadFile('html')}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center space-x-1.5 transition"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .HTML</span>
            </button>
            <button
              onClick={() => handleDownloadFile('txt')}
              className="px-3 py-1.5 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg flex items-center space-x-1.5 transition"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Descargar .TXT</span>
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => handleCopyText(report.emailHtml, 'clipboard')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition"
            >
              {copied === 'clipboard' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
              <span>{copied === 'clipboard' ? 'Copiado para Correo' : 'Copiar para pegar en Gmail/Outlook'}</span>
            </button>

            <button
              onClick={handleOpenMailClient}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-md shadow-blue-500/20 transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>Abrir en mi Aplicación de Correo</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
