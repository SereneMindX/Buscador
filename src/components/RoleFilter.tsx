import React from 'react';
import { Search, Globe, Calendar, Sparkles } from 'lucide-react';
import { TargetRole, TARGET_ROLES, JobPortalSource, ALLOWED_PORTALS } from '../types/job';
import { getLimaDateInfo } from '../utils/dateUtils';

export type DateFilterType = 'ALL' | '4DAYS' | '2DAYS' | 'TODAY';

interface RoleFilterProps {
  selectedRole: TargetRole | 'ALL';
  onSelectRole: (role: TargetRole | 'ALL') => void;
  selectedPortal: JobPortalSource | 'ALL';
  onSelectPortal: (portal: JobPortalSource | 'ALL') => void;
  selectedDateFilter?: DateFilterType;
  onSelectDateFilter?: (filter: DateFilterType) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleCounts: Record<string, number>;
  portalCounts: Record<string, number>;
  dateCounts?: {
    total: number;
    last4Days: number;
    last2Days: number;
    today: number;
  };
  totalCount: number;
}

export const RoleFilter: React.FC<RoleFilterProps> = ({
  selectedRole,
  onSelectRole,
  selectedPortal,
  onSelectPortal,
  selectedDateFilter = '4DAYS',
  onSelectDateFilter,
  searchQuery,
  onSearchChange,
  roleCounts,
  portalCounts,
  dateCounts,
  totalCount,
}) => {
  return (
    <div className="bg-white rounded-xl p-4 sm:p-5 shadow-xs border border-slate-200 mb-6 space-y-4">
      {/* Search and counters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar por cargo exacto, empresa o palabra clave (ej: Falabella, SAP, Kushki, SUNAT)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              Limpiar
            </button>
          )}
        </div>

        {/* Portal filter pills */}
        <div className="flex items-center space-x-1.5 flex-wrap">
          <span className="text-xs text-slate-500 font-semibold mr-1 flex items-center gap-1">
            <Globe className="w-3.5 h-3.5" /> Portal:
          </span>
          <button
            onClick={() => onSelectPortal('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
              selectedPortal === 'ALL'
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos
          </button>
          {ALLOWED_PORTALS.map((portal) => {
            const count = portalCounts[portal] || 0;
            const isSelected = selectedPortal === portal;
            return (
              <button
                key={portal}
                onClick={() => onSelectPortal(portal)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center space-x-1 ${
                  isSelected
                    ? 'bg-blue-600 text-white font-semibold'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                <span>{portal}</span>
                <span
                  className={`text-[10px] px-1 rounded ${
                    isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Date freshness filter pills */}
      {onSelectDateFilter && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 bg-slate-50/70 p-2.5 rounded-lg">
          <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mr-1">
            <Calendar className="w-3.5 h-3.5 text-blue-600" />
            Fecha de Publicación:
          </span>

          <button
            onClick={() => onSelectDateFilter('4DAYS')}
            className={`px-3 py-1 rounded-md text-xs font-bold transition flex items-center gap-1.5 shadow-xs ${
              selectedDateFilter === '4DAYS'
                ? 'bg-emerald-600 text-white ring-2 ring-emerald-400/30'
                : 'bg-white text-emerald-800 border border-emerald-300 hover:bg-emerald-50'
            }`}
          >
            <Sparkles className="w-3 h-3 text-amber-300" />
            <span>Últimos 4 días ({getLimaDateInfo().fourDaysRange})</span>
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                selectedDateFilter === '4DAYS'
                  ? 'bg-emerald-800 text-white'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {dateCounts?.last4Days ?? totalCount}
            </span>
          </button>

          <button
            onClick={() => onSelectDateFilter('2DAYS')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${
              selectedDateFilter === '2DAYS'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>Últimas 48 horas</span>
            {dateCounts?.last2Days !== undefined && (
              <span
                className={`text-[10px] px-1 rounded ${
                  selectedDateFilter === '2DAYS'
                    ? 'bg-blue-800 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {dateCounts.last2Days}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectDateFilter('TODAY')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${
              selectedDateFilter === 'TODAY'
                ? 'bg-blue-600 text-white font-bold'
                : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>Hoy ({getLimaDateInfo().shortDate})</span>
            {dateCounts?.today !== undefined && (
              <span
                className={`text-[10px] px-1 rounded ${
                  selectedDateFilter === 'TODAY'
                    ? 'bg-blue-800 text-white'
                    : 'bg-slate-200 text-slate-700'
                }`}
              >
                {dateCounts.today}
              </span>
            )}
          </button>

          <button
            onClick={() => onSelectDateFilter('ALL')}
            className={`px-2.5 py-1 rounded-md text-xs font-medium transition flex items-center gap-1 ${
              selectedDateFilter === 'ALL'
                ? 'bg-slate-900 text-white font-bold'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>Todas</span>
          </button>
        </div>
      )}

      {/* Role categories tabs */}
      <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-100">
        <button
          onClick={() => onSelectRole('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
            selectedRole === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>Todos los roles</span>
          <span
            className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              selectedRole === 'ALL'
                ? 'bg-slate-700 text-slate-200'
                : 'bg-slate-200 text-slate-600'
            }`}
          >
            {totalCount}
          </span>
        </button>

        {TARGET_ROLES.map((role) => {
          const count = roleCounts[role] || 0;
          const isSelected = selectedRole === role;

          return (
            <button
              key={role}
              onClick={() => onSelectRole(role)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition flex items-center space-x-1.5 ${
                isSelected
                  ? 'bg-blue-600 text-white font-semibold shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{role}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                  isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
