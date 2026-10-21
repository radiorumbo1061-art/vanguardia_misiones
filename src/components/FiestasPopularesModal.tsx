import React, { useState, useMemo } from 'react';
import { 
  FIESTAS_POPULARES_MISIONES, 
  FiestaPopular, 
  MESES_ANO, 
  CATEGORIAS_FIESTAS,
  getFiestasProximas 
} from '../data/fiestasPopularesMisiones';
import { MUNICIPIOS_MISIONES } from '../data/municipiosMisiones';
import { 
  PartyPopper, 
  Calendar, 
  MapPin, 
  Search, 
  Filter, 
  Copy, 
  Check, 
  Sparkles, 
  Share2, 
  Users, 
  Flame, 
  Compass, 
  X, 
  ExternalLink,
  ChevronRight,
  Award,
  Bell,
  Clock,
  Briefcase
} from 'lucide-react';

interface FiestasPopularesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onFilterMunicipioInDirectorio?: (municipio: string) => void;
}

export const FiestasPopularesModal: React.FC<FiestasPopularesModalProps> = ({
  isOpen,
  onClose,
  onFilterMunicipioInDirectorio,
}) => {
  const currentMonth = new Date().getMonth() + 1; // 1 to 12
  const [selectedMes, setSelectedMes] = useState<number | 'TODOS'>(currentMonth);
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>('TODOS');
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Proximity data (current month and next month)
  const { mesActual, mesProximo, mesActualNombre, mesProximoNombre } = useMemo(() => {
    return getFiestasProximas();
  }, []);

  // Filtered festivals
  const filteredFiestas = useMemo(() => {
    return FIESTAS_POPULARES_MISIONES.filter(fiesta => {
      // Month filter
      if (selectedMes !== 'TODOS' && fiesta.mes !== selectedMes) {
        return false;
      }

      // Municipality filter
      if (selectedMunicipio !== 'TODOS' && fiesta.municipio !== selectedMunicipio) {
        return false;
      }

      // Category filter
      if (selectedCategoria !== 'TODAS' && fiesta.categoria !== selectedCategoria) {
        return false;
      }

      // Search query
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchNombre = fiesta.nombre.toLowerCase().includes(query);
        const matchMun = fiesta.municipio.toLowerCase().includes(query);
        const matchDepto = fiesta.departamento.toLowerCase().includes(query);
        const matchDesc = fiesta.descripcion.toLowerCase().includes(query);
        const matchLugar = fiesta.lugarPredio.toLowerCase().includes(query);
        return matchNombre || matchMun || matchDepto || matchDesc || matchLugar;
      }

      return true;
    });
  }, [selectedMes, selectedMunicipio, selectedCategoria, searchTerm]);

  if (!isOpen) return null;

  const handleCopyGreeting = (fiesta: FiestaPopular) => {
    navigator.clipboard.writeText(fiesta.mensajeSaludoPredeterminado);
    setCopiedId(fiesta.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-5xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[94vh]">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-600 via-rose-600 to-indigo-900 text-white p-5 sm:p-6 flex items-start justify-between relative shrink-0">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md text-amber-100 flex items-center justify-center text-2xl font-bold shadow-inner shrink-0 border border-white/20">
              🎉
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-white/30 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-300" />
                  Agenda Cultural & Territorial Misionera
                </span>
                <span className="bg-amber-400 text-slate-950 text-xs font-black px-2.5 py-0.5 rounded-full">
                  {FIESTAS_POPULARES_MISIONES.length} Fiestas en los 79 Municipios
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Recordatorio de Fiestas Populares de Misiones
              </h2>
              <p className="text-xs sm:text-sm text-rose-100 mt-0.5 max-w-2xl">
                Calendario estratégico anual de festivales nacionales, provinciales y productivos: presencia de candidatos, recomendaciones de despliegue territorial y mensajes de saludo institucional.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-white/80 hover:text-white text-xl font-bold p-1.5 rounded-xl hover:bg-white/10 transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            title="Cerrar ventana"
            aria-label="Cerrar calendario de fiestas populares"
          >
            ✕
          </button>
        </div>

        {/* Proximity Alert Banner: Fiestas of current month (Octubre) & upcoming (Noviembre) */}
        <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/10 to-indigo-500/10 border-b border-amber-200/80 p-4 shrink-0">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                <Bell className="w-4 h-4 text-slate-950 animate-bounce" />
              </div>
              <div>
                <span className="text-xs font-bold text-amber-950 uppercase tracking-wider block">
                  Alertas de Proximidad de Campaña ({mesActualNombre}):
                </span>
                <p className="text-xs text-slate-700">
                  Hay <strong>{mesActual.length} fiestas populares este mes</strong> ({mesActual.map(f => f.municipio).join(', ')}) y <strong>{mesProximo.length} en {mesProximoNombre}</strong>.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => setSelectedMes(currentMonth)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                  selectedMes === currentMonth
                    ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                    : 'bg-white text-amber-900 border-amber-300 hover:bg-amber-50'
                }`}
              >
                <span>📅 Ver Fiestas de {mesActualNombre} ({mesActual.length})</span>
              </button>

              <button
                onClick={() => setSelectedMes(currentMonth === 12 ? 1 : currentMonth + 1)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border flex items-center gap-1.5 ${
                  selectedMes === (currentMonth === 12 ? 1 : currentMonth + 1)
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                    : 'bg-white text-indigo-900 border-indigo-300 hover:bg-indigo-50'
                }`}
              >
                <span>🚀 Próximas en {mesProximoNombre} ({mesProximo.length})</span>
              </button>
            </div>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 space-y-3 shrink-0">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Search Input */}
            <div className="lg:col-span-2 relative">
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Buscar por Nombre o Producto:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  placeholder="Ej: Yerba Mate, Té, Orquídea, Cerveza, Madera, Mandioca..."
                  className="w-full pl-9 pr-8 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 font-medium text-xs sm:text-sm text-slate-900"
                />
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>

            {/* Municipality Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Municipio Sede (79):
              </label>
              <select
                value={selectedMunicipio}
                onChange={e => setSelectedMunicipio(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 font-medium text-xs sm:text-sm text-slate-900"
              >
                <option value="TODOS">Todos los Municipios</option>
                {MUNICIPIOS_MISIONES.map(m => (
                  <option key={m.id} value={m.nombre}>
                    {m.nombre} ({m.departamento})
                  </option>
                ))}
              </select>
            </div>

            {/* Category Selector */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Tipo / Categoría:
              </label>
              <select
                value={selectedCategoria}
                onChange={e => setSelectedCategoria(e.target.value)}
                className="w-full px-3 py-2 bg-white rounded-xl border border-slate-300 focus:outline-none focus:border-amber-500 font-medium text-xs sm:text-sm text-slate-900"
              >
                <option value="TODAS">Todas las Categorías</option>
                {CATEGORIAS_FIESTAS.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Month Selector Pills Strip */}
          <div className="pt-2 border-t border-slate-200/80 flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 mr-1">
              Mes:
            </span>
            <button
              onClick={() => setSelectedMes('TODOS')}
              className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer border ${
                selectedMes === 'TODOS'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              Todo el Año ({FIESTAS_POPULARES_MISIONES.length})
            </button>

            {MESES_ANO.map(m => {
              const countInMonth = FIESTAS_POPULARES_MISIONES.filter(f => f.mes === m.id).length;
              const isCurrent = m.id === currentMonth;
              const isSelected = selectedMes === m.id;

              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMes(m.id)}
                  className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition cursor-pointer border flex items-center gap-1 ${
                    isSelected
                      ? 'bg-amber-600 text-white border-amber-600 font-bold shadow-xs'
                      : isCurrent
                      ? 'bg-amber-100 text-amber-950 border-amber-300 font-bold'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  <span>{m.nombre}</span>
                  {countInMonth > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${isSelected ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      {countInMonth}
                    </span>
                  )}
                  {isCurrent && !isSelected && (
                    <span className="text-[9px] text-amber-600 font-extrabold uppercase">Hoy</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Festivals List */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
            <span>
              Mostrando <strong>{filteredFiestas.length}</strong> fiestas populares
              {selectedMes !== 'TODOS' && ` en ${MESES_ANO.find(m => m.id === selectedMes)?.nombre}`}
              {selectedMunicipio !== 'TODOS' && ` en ${selectedMunicipio}`}
            </span>

            {(selectedMes !== 'TODOS' || selectedMunicipio !== 'TODOS' || selectedCategoria !== 'TODAS' || searchTerm) && (
              <button
                onClick={() => {
                  setSelectedMes('TODOS');
                  setSelectedMunicipio('TODOS');
                  setSelectedCategoria('TODAS');
                  setSearchTerm('');
                }}
                className="text-amber-700 hover:text-amber-900 font-semibold cursor-pointer underline text-[11px]"
              >
                Limpiar filtros
              </button>
            )}
          </div>

          {filteredFiestas.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-300 p-8 space-y-3">
              <span className="text-4xl block">🔍</span>
              <h3 className="font-bold text-slate-800 text-base">No se encontraron fiestas populares</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                No hay festividades registradas para los filtros seleccionados. Intente seleccionar "Todo el Año" o cambiar el municipio.
              </p>
              <button
                onClick={() => {
                  setSelectedMes('TODOS');
                  setSelectedMunicipio('TODOS');
                  setSelectedCategoria('TODAS');
                  setSearchTerm('');
                }}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-xs"
              >
                Ver Todas las Fiestas Populares
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredFiestas.map(fiesta => {
                const isCopied = copiedId === fiesta.id;
                const isCurrentMonth = fiesta.mes === currentMonth;

                // Category badges
                const catBadgeClass = fiesta.categoria === 'Nacional'
                  ? 'bg-amber-100 text-amber-950 border-amber-300 font-black'
                  : fiesta.categoria === 'Productiva / Agrícola'
                  ? 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold'
                  : fiesta.categoria === 'Cultural y Colectividades'
                  ? 'bg-purple-100 text-purple-950 border-purple-300 font-bold'
                  : fiesta.categoria === 'Gastronómica'
                  ? 'bg-rose-100 text-rose-950 border-rose-300 font-bold'
                  : 'bg-sky-100 text-sky-950 border-sky-300 font-bold';

                const impBadgeClass = fiesta.importanciaPolitica === 'Máxima'
                  ? 'bg-red-500 text-white font-extrabold'
                  : fiesta.importanciaPolitica === 'Alta'
                  ? 'bg-blue-600 text-white font-bold'
                  : 'bg-slate-200 text-slate-800 font-medium';

                return (
                  <div
                    key={fiesta.id}
                    className={`bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between gap-3 shadow-xs hover:shadow-md ${
                      isCurrentMonth
                        ? 'border-amber-400 ring-2 ring-amber-400/20 bg-gradient-to-br from-amber-50/20 to-white'
                        : 'border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Top badging */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex flex-wrap items-center gap-1.5">
                          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full border ${catBadgeClass}`}>
                            {fiesta.categoria}
                          </span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full shadow-xs ${impBadgeClass}`}>
                            Impacto Político: {fiesta.importanciaPolitica}
                          </span>
                          {isCurrentMonth && (
                            <span className="text-[10px] bg-red-600 text-white font-black px-2 py-0.5 rounded-full animate-pulse">
                              ¡Este Mes!
                            </span>
                          )}
                        </div>

                        <span className="text-2xl shrink-0 p-1.5 bg-slate-100 rounded-xl">
                          {fiesta.icono}
                        </span>
                      </div>

                      {/* Title & Municipality */}
                      <h3 className="text-base font-extrabold text-slate-900 leading-snug">
                        {fiesta.nombre}
                      </h3>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600 mt-1.5">
                        <span className="font-bold text-blue-800 flex items-center gap-1 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                          <MapPin className="w-3.5 h-3.5 text-blue-600" />
                          {fiesta.municipio} ({fiesta.departamento})
                        </span>
                        <span className="font-semibold text-slate-700 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-amber-600" />
                          {fiesta.mesNombre} • {fiesta.fechasAproximadas}
                        </span>
                      </div>

                      {/* Location & Crowd */}
                      <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                        <p><strong>Predio / Lugar:</strong> {fiesta.lugarPredio}</p>
                        <p><strong>Concurrencia estimada:</strong> {fiesta.afluenciaEstimada}</p>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50/80 p-2.5 rounded-xl border border-slate-100">
                        {fiesta.descripcion}
                      </p>

                      {/* Strategic Campaign Recommendations Box */}
                      <div className="mt-3 p-3 rounded-xl bg-amber-50/80 border border-amber-200/90 text-xs text-amber-950 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-amber-900">
                          <Briefcase className="w-3.5 h-3.5 text-amber-600" />
                          <span>Estrategia & Recomendación para Dirigentes:</span>
                        </div>
                        <p className="text-[11px] text-amber-900/90 leading-relaxed">
                          {fiesta.recomendacionCampana}
                        </p>
                      </div>
                    </div>

                    {/* Footer Actions: Copy Greeting Template & View Candidates */}
                    <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                      <button
                        onClick={() => handleCopyGreeting(fiesta)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border ${
                          isCopied
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-200'
                        }`}
                        title="Copiar texto de saludo oficial para redes y WhatsApp"
                      >
                        {isCopied ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>¡Saludo Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-600" />
                            <span>Copiar Saludo de Campaña</span>
                          </>
                        )}
                      </button>

                      {onFilterMunicipioInDirectorio && (
                        <button
                          onClick={() => {
                            onFilterMunicipioInDirectorio(fiesta.municipio);
                            onClose();
                          }}
                          className="flex items-center gap-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200 transition cursor-pointer"
                          title={`Ver fiscales y candidatos de ${fiesta.municipio} en el Directorio`}
                        >
                          <Users className="w-3.5 h-3.5 text-blue-600" />
                          <span>Dirigentes de {fiesta.municipio}</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Comando Electoral Central:</span>
            <span>Planifique giras y caravanas en coordinación con los presidentes de mesa política de cada municipio.</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition cursor-pointer w-full sm:w-auto"
          >
            Cerrar Calendario
          </button>
        </div>
      </div>
    </div>
  );
};
