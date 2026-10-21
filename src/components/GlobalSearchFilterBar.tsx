import React, { useRef, useEffect } from 'react';
import { 
  Search, 
  X, 
  MapPin, 
  Filter, 
  Users, 
  CheckCircle2, 
  Download, 
  Sparkles, 
  RotateCcw,
  SlidersHorizontal,
  ChevronDown,
  Building,
  Vote
} from 'lucide-react';
import { MUNICIPIOS_MISIONES } from '../data/municipiosMisiones';
import { ROLES_PRINCIPALES, ESTADOS_DIRIGENTE } from '../data/initialData';

interface GlobalSearchFilterBarProps {
  searchTerm: string;
  setSearchTerm: (s: string) => void;
  filterMunicipio: string;
  setFilterMunicipio: (m: string) => void;
  filterRol: string;
  setFilterRol: (r: string) => void;
  filterEstado: string;
  setFilterEstado: (e: string) => void;
  totalCount: number;
  filteredCount: number;
  onDownloadFilteredPdf: () => void;
}

export const GlobalSearchFilterBar: React.FC<GlobalSearchFilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  filterMunicipio,
  setFilterMunicipio,
  filterRol,
  setFilterRol,
  filterEstado,
  setFilterEstado,
  totalCount,
  filteredCount,
  onDownloadFilteredPdf,
}) => {
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener: '/' or 'Ctrl+K' focuses search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '/' && document.activeElement !== searchInputRef.current) || (e.ctrlKey && e.key === 'k')) {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === 'Escape' && document.activeElement === searchInputRef.current) {
        if (searchTerm) {
          setSearchTerm('');
        } else {
          searchInputRef.current?.blur();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchTerm, setSearchTerm]);

  const hasActiveFilters = Boolean(
    searchTerm.trim() ||
    filterMunicipio !== 'TODOS' ||
    filterRol !== 'TODOS' ||
    filterEstado !== 'TODOS'
  );

  const handleResetFilters = () => {
    setSearchTerm('');
    setFilterMunicipio('TODOS');
    setFilterRol('TODOS');
    setFilterEstado('TODOS');
    searchInputRef.current?.focus();
  };

  // Quick preset filter buttons
  const applyQuickPreset = (preset: 'all' | 'fiscales' | 'candidatos' | 'posadas' | 'obera') => {
    switch (preset) {
      case 'all':
        handleResetFilters();
        break;
      case 'fiscales':
        setSearchTerm('');
        setFilterRol('Fiscal de Mesa');
        break;
      case 'candidatos':
        setSearchTerm('');
        setFilterRol('Candidato a Intendente');
        break;
      case 'posadas':
        setFilterMunicipio('Posadas');
        break;
      case 'obera':
        setFilterMunicipio('Oberá');
        break;
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 space-y-4">
      {/* Title / Bar Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
            <Search className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              Buscador Global y Filtros Avanzados
              <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full">
                Nombre • DNI • Municipio
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Localice de forma instantánea cualquier postulante, fiscal o referente entre los 79 municipios provinciales.
            </p>
          </div>
        </div>

        {/* Live matching badge & PDF trigger */}
        <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          <div className="bg-slate-100 px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-700 border border-slate-200">
            Resultados: <span className="text-blue-700 font-bold">{filteredCount}</span>
            <span className="text-slate-400 font-normal"> / {totalCount}</span>
          </div>

          <button
            onClick={onDownloadFilteredPdf}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-semibold transition cursor-pointer"
            title="Descargar planilla PDF con los resultados filtrados"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            <span>Planilla PDF</span>
          </button>
        </div>
      </div>

      {/* Main Search Input: Searches Name, DNI and Municipality simultaneously */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-blue-500" />
        </div>

        <input
          ref={searchInputRef}
          type="text"
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder="Escriba Nombre, DNI (ej: 34892145) o Municipio (ej: Posadas, Oberá, Dos Hermanas, Fracrán)..."
          className="w-full pl-11 pr-24 py-3 bg-slate-50/80 hover:bg-white focus:bg-white text-sm text-slate-900 rounded-2xl border border-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all font-medium placeholder:text-slate-400"
        />

        <div className="absolute inset-y-0 right-0 pr-3 flex items-center gap-2">
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm('');
                searchInputRef.current?.focus();
              }}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition cursor-pointer"
              title="Borrar término de búsqueda"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <div className="hidden md:flex items-center gap-1 text-[11px] font-mono text-slate-400 bg-white border border-slate-200 px-2 py-0.5 rounded-md shadow-xs">
            <span>/</span>
          </div>
        </div>
      </div>

      {/* Selectors Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Selector 1: Municipio (Catálogo 79) */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-blue-600" />
            Filtrar por Municipio (79 Oficiales):
          </label>
          <div className="relative">
            <select
              value={filterMunicipio}
              onChange={e => setFilterMunicipio(e.target.value)}
              className="w-full py-2.5 px-3 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition"
            >
              <option value="TODOS">Todos los Municipios (79 de Misiones)</option>
              {MUNICIPIOS_MISIONES.map(m => (
                <option key={m.id} value={m.nombre}>
                  {m.nombre} • {m.departamento} ({m.zonaElectoral})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selector 2: Rol Principal */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-purple-600" />
            Filtrar por Rol en Campaña:
          </label>
          <div className="relative">
            <select
              value={filterRol}
              onChange={e => setFilterRol(e.target.value)}
              className="w-full py-2.5 px-3 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-800 font-semibold focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-100 transition"
            >
              <option value="TODOS">Todos los Roles ({ROLES_PRINCIPALES.length})</option>
              {ROLES_PRINCIPALES.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Selector 3: Estado de Validación */}
        <div>
          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Estado de Validación:
          </label>
          <div className="relative">
            <select
              value={filterEstado}
              onChange={e => setFilterEstado(e.target.value)}
              className="w-full py-2.5 px-3 text-xs sm:text-sm rounded-xl border border-slate-300 bg-white text-slate-800 font-medium focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 transition"
            >
              <option value="TODOS">Todos los Estados</option>
              {ESTADOS_DIRIGENTE.map(s => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Quick Access Preset Buttons & Active Filters Pill Strip */}
      <div className="pt-2 border-t border-slate-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        {/* Quick presets */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 no-scrollbar">
          <span className="text-[11px] text-slate-500 font-bold uppercase tracking-wider shrink-0 mr-1">
            Accesos Rápidos:
          </span>
          <button
            onClick={() => {
              setSearchTerm('');
              setFilterRol('Gobernador');
            }}
            className={`px-3 py-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center gap-1 shrink-0 min-h-[36px] ${
              filterRol === 'Gobernador'
                ? 'bg-amber-500 text-slate-950 border-amber-600 font-bold'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-200 font-medium'
            }`}
          >
            <span>👑</span> Gobernador
          </button>

          <button
            onClick={() => applyQuickPreset('fiscales')}
            className={`px-3 py-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center gap-1 shrink-0 min-h-[36px] ${
              filterRol === 'Fiscal de Mesa'
                ? 'bg-emerald-600 text-white border-emerald-600 font-bold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
            }`}
          >
            <span>🗳️</span> Fiscales de Mesa
          </button>

          <button
            onClick={() => applyQuickPreset('candidatos')}
            className={`px-3 py-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center gap-1 shrink-0 min-h-[36px] ${
              filterRol === 'Candidato a Intendente'
                ? 'bg-purple-600 text-white border-purple-600 font-bold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
            }`}
          >
            <span>🎯</span> Intendentes
          </button>

          <button
            onClick={() => applyQuickPreset('posadas')}
            className={`px-3 py-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center gap-1 shrink-0 min-h-[36px] ${
              filterMunicipio === 'Posadas'
                ? 'bg-blue-600 text-white border-blue-600 font-bold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
            }`}
          >
            <span>📍</span> Posadas
          </button>

          <button
            onClick={() => applyQuickPreset('obera')}
            className={`px-3 py-1.5 rounded-xl border text-xs transition cursor-pointer flex items-center gap-1 shrink-0 min-h-[36px] ${
              filterMunicipio === 'Oberá'
                ? 'bg-blue-600 text-white border-blue-600 font-bold'
                : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 font-medium'
            }`}
          >
            <span>📍</span> Oberá
          </button>
        </div>

        {/* Clear filters action */}
        {hasActiveFilters && (
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-slate-500 text-[11px]">Filtros activos</span>
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs transition cursor-pointer border border-red-200 min-h-[36px]"
            >
              <RotateCcw className="w-3.5 h-3.5 text-red-600" />
              <span>Restablecer todo</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
