import React from 'react';
import { Search, Filter, Globe } from 'lucide-react';
import { TargetRole, TARGET_ROLES, JobPortalSource, ALLOWED_PORTALS } from '../types/job';

interface RoleFilterProps {
  selectedRole: TargetRole | 'ALL';
  onSelectRole: (role: TargetRole | 'ALL') => void;
  selectedPortal: JobPortalSource | 'ALL';
  onSelectPortal: (portal: JobPortalSource | 'ALL') => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  roleCounts: Record<string, number>;
  portalCounts: Record<string, number>;
  totalCount: number;
}

export const RoleFilter: React.FC<RoleFilterProps> = ({
  selectedRole,
  onSelectRole,
  selectedPortal,
  onSelectPortal,
  searchQuery,
  onSearchChange,
  roleCounts,
  portalCounts,
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
                <span className={`text-[10px] px-1 rounded ${
                  isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Role categories tabs */}
      <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
        <button
          onClick={() => onSelectRole('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
            selectedRole === 'ALL'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <span>Todos los roles</span>
          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
            selectedRole === 'ALL' ? 'bg-slate-700 text-slate-200' : 'bg-slate-200 text-slate-600'
          }`}>
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
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                isSelected ? 'bg-blue-700 text-white' : 'bg-slate-200 text-slate-600'
              }`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
