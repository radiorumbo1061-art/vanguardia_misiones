import React, { useState, useMemo } from 'react';
import { 
  DirectorioItem, 
  ROLES_PRINCIPALES, 
  ESTADOS_DIRIGENTE, 
  UsuarioAutorizado,
  CATEGORIAS_ROLES
} from '../data/initialData';
import { MUNICIPIOS_MISIONES } from '../data/municipiosMisiones';
import { exportPlanillaPdf } from '../utils/pdfExport';
import { 
  Printer, 
  Download, 
  FileText, 
  Filter, 
  CheckCircle2, 
  MapPin, 
  Users, 
  Sparkles,
  ShieldAlert,
  Calendar,
  Layers
} from 'lucide-react';

interface PlanillasPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  directorio: DirectorioItem[];
  currentUser: UsuarioAutorizado;
  initialRole?: string; // Optional default pre-selected role
}

export const PlanillasPdfModal: React.FC<PlanillasPdfModalProps> = ({
  isOpen,
  onClose,
  directorio,
  currentUser,
  initialRole = 'TODOS',
}) => {
  const [selectedRole, setSelectedRole] = useState<string>(initialRole);
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');
  const [selectedMunicipio, setSelectedMunicipio] = useState<string>(
    currentUser.municipioAsignado !== 'TODOS' ? currentUser.municipioAsignado : 'TODOS'
  );
  const [selectedEstado, setSelectedEstado] = useState<string>('TODOS');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccessMessage, setDownloadSuccessMessage] = useState<string | null>(null);

  // Sync initialRole when opening
  React.useEffect(() => {
    if (isOpen) {
      setSelectedRole(initialRole);
      setDownloadSuccessMessage(null);
    }
  }, [initialRole, isOpen]);

  // Compute records count preview
  const previewCount = useMemo(() => {
    return directorio.filter(item => {
      const matchRol = selectedRole === 'TODOS' || item.rolPrincipal === selectedRole;
      const matchMun = selectedMunicipio === 'TODOS' || item.municipio === selectedMunicipio;
      const matchEst = selectedEstado === 'TODOS' || item.estado === selectedEstado;
      return matchRol && matchMun && matchEst;
    }).length;
  }, [directorio, selectedRole, selectedMunicipio, selectedEstado]);

  // Role stats map
  const roleCounts = useMemo(() => {
    const map: Record<string, number> = {};
    ROLES_PRINCIPALES.forEach(r => {
      map[r] = directorio.filter(item => {
        const matchRol = item.rolPrincipal === r;
        const matchMun = selectedMunicipio === 'TODOS' || item.municipio === selectedMunicipio;
        const matchEst = selectedEstado === 'TODOS' || item.estado === selectedEstado;
        return matchRol && matchMun && matchEst;
      }).length;
    });
    return map;
  }, [directorio, selectedMunicipio, selectedEstado]);

  // Filtered roles list based on category filter
  const displayedRoles = useMemo(() => {
    if (selectedCategoria === 'TODAS') return ROLES_PRINCIPALES;
    const catConfig = CATEGORIAS_ROLES.find(c => c.categoria === selectedCategoria);
    if (!catConfig) return ROLES_PRINCIPALES;
    return catConfig.roles;
  }, [selectedCategoria]);

  if (!isOpen) return null;

  const handleDownload = (targetRole: string = selectedRole) => {
    setIsGenerating(true);
    try {
      exportPlanillaPdf(directorio, {
        rol: targetRole,
        municipio: selectedMunicipio,
        estado: selectedEstado,
        usuarioResponsable: currentUser.email,
        partidoNombre: 'SISTEMA ELECTORAL DE MISIONES • COMANDO DE CAMPAÑA',
      });
      const roleName = targetRole === 'TODOS' ? 'Padrón General Consolidado' : targetRole;
      setDownloadSuccessMessage(`¡Planilla PDF de "${roleName}" generada exitosamente!`);
      setTimeout(() => setDownloadSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Error generating PDF:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const getRoleBadge = (rol: string) => {
    switch (rol) {
      case 'Gobernador':
        return { icon: '👑', bg: 'bg-amber-500', pill: 'bg-amber-100 text-amber-950 font-black' };
      case 'Vice Gobernador':
        return { icon: '🏛️', bg: 'bg-amber-600', pill: 'bg-amber-100 text-amber-900 font-bold' };
      case 'Senador Nacional':
        return { icon: '🇦🇷', bg: 'bg-blue-700', pill: 'bg-blue-100 text-blue-950 font-bold' };
      case 'Diputado Nacional':
        return { icon: '🏛️', bg: 'bg-blue-600', pill: 'bg-blue-100 text-blue-900 font-bold' };
      case 'Diputado Provincial':
        return { icon: '📜', bg: 'bg-sky-600', pill: 'bg-sky-100 text-sky-900 font-bold' };
      case 'Candidato a Intendente':
        return { icon: '🎯', bg: 'bg-purple-600', pill: 'bg-purple-100 text-purple-800 font-bold' };
      case 'Vice Intendente':
        return { icon: '🤝', bg: 'bg-fuchsia-600', pill: 'bg-fuchsia-100 text-fuchsia-900 font-bold' };
      case 'Candidato a Concejal':
        return { icon: '👥', bg: 'bg-indigo-600', pill: 'bg-indigo-100 text-indigo-800' };
      case 'Convencional Constituyente':
        return { icon: '⚖️', bg: 'bg-amber-600', pill: 'bg-amber-50 text-amber-950 font-bold' };
      case 'Defensor del Pueblo':
        return { icon: '🛡️', bg: 'bg-violet-600', pill: 'bg-violet-100 text-violet-900 font-bold' };
      case 'Jefe de Campaña':
        return { icon: '🎖️', bg: 'bg-red-600', pill: 'bg-red-100 text-red-900 font-bold' };
      case 'Apoderado Legal':
        return { icon: '⚖️', bg: 'bg-indigo-700', pill: 'bg-indigo-100 text-indigo-900 font-bold' };
      case 'Responsable Económico-Financiero':
        return { icon: '💼', bg: 'bg-emerald-700', pill: 'bg-emerald-100 text-emerald-950 font-bold' };
      case 'Responsable de Comunicación y Prensa':
        return { icon: '🎙️', bg: 'bg-pink-600', pill: 'bg-pink-100 text-pink-900 font-bold' };
      case 'Coordinador de Campaña Digital y Redes':
        return { icon: '📱', bg: 'bg-sky-600', pill: 'bg-sky-100 text-sky-900 font-bold' };
      case 'Presidente de Mesa Política':
        return { icon: '🏛️', bg: 'bg-blue-600', pill: 'bg-blue-100 text-blue-800 font-bold' };
      case 'Responsable de Logística':
        return { icon: '🚚', bg: 'bg-cyan-600', pill: 'bg-cyan-100 text-cyan-900' };
      case 'Coordinador de Movilización y Transporte':
        return { icon: '🚐', bg: 'bg-blue-600', pill: 'bg-blue-100 text-blue-900 font-bold' };
      case 'Referente Territorial':
        return { icon: '🚩', bg: 'bg-amber-600', pill: 'bg-amber-100 text-amber-800' };
      case 'Voluntario / Militante de Campaña':
        return { icon: '🤝', bg: 'bg-emerald-600', pill: 'bg-emerald-100 text-emerald-900' };
      case 'Coordinador General de Fiscalización':
        return { icon: '🛡️', bg: 'bg-teal-700', pill: 'bg-teal-100 text-teal-950 font-bold' };
      case 'Fiscal General':
        return { icon: '🛡️', bg: 'bg-teal-600', pill: 'bg-teal-100 text-teal-800' };
      case 'Fiscal de Mesa':
        return { icon: '🗳️', bg: 'bg-emerald-500', pill: 'bg-emerald-100 text-emerald-800' };
      case 'Fiscal Suplente / Relevo':
        return { icon: '🔄', bg: 'bg-cyan-500', pill: 'bg-cyan-100 text-cyan-800' };
      case 'Fiscal Informático / Cómputos':
        return { icon: '💻', bg: 'bg-slate-700', pill: 'bg-slate-100 text-slate-900 font-bold' };
      case 'Fiscal de Escrutinio Definitivo':
        return { icon: '⚖️', bg: 'bg-indigo-800', pill: 'bg-indigo-100 text-indigo-950 font-bold' };
      case 'Afiliado al Partido':
        return { icon: '🪪', bg: 'bg-rose-600', pill: 'bg-rose-100 text-rose-800' };
      default:
        return { icon: '📋', bg: 'bg-blue-600', pill: 'bg-blue-100 text-blue-800' };
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-slate-900 to-indigo-900 text-white p-4 sm:p-5 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-400/30">
              <Printer className="w-5 h-5 sm:w-6 sm:h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400/20 text-amber-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider">
                  Campaña Integral • 79 Municipios
                </span>
                <span className="text-[11px] text-slate-300 font-mono hidden sm:inline">Formato PDF A4 Horizontal</span>
              </div>
              <h2 className="text-lg sm:text-xl font-bold text-white mt-0.5">
                Descarga de Planillas Oficiales en PDF por Rol
              </h2>
              <p className="text-xs text-slate-300 hidden sm:block">
                Emisión de planillas oficiales con espacio para firmas y acreditación de fiscales, fórmulas ejecutivas y autoridades.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white text-xl font-bold p-1 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Cerrar modal de planillas"
          >
            ✕
          </button>
        </div>

        {/* Content body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {downloadSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{downloadSuccessMessage}</span>
            </div>
          )}

          {/* Scope Filters */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-800 uppercase tracking-wider">
              <Filter className="w-3.5 h-3.5 text-blue-600" />
              Filtros de Ámbito para la Emisión de la Planilla
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Jurisdicción / Municipio:
                </label>
                <select
                  value={selectedMunicipio}
                  onChange={e => setSelectedMunicipio(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="TODOS">Todos los 79 Municipios de Misiones</option>
                  {MUNICIPIOS_MISIONES.map(m => (
                    <option key={m.id} value={m.nombre}>
                      {m.nombre} ({m.departamento})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-semibold mb-1">
                  Estado de los Registros:
                </label>
                <select
                  value={selectedEstado}
                  onChange={e => setSelectedEstado(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="TODOS">Todos los Estados (Confirmados, Activos, etc.)</option>
                  <option value="Confirmado">Solo Confirmados (Listos para mesa)</option>
                  <option value="Activo">Solo Activos</option>
                  <option value="En Revisión">Solo En Revisión</option>
                  <option value="Suplente">Solo Suplentes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Consolidated Master Sheet Option */}
          <div
            className={`p-4 rounded-2xl border transition flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
              selectedRole === 'TODOS'
                ? 'border-blue-500 bg-blue-50/60 ring-2 ring-blue-500/20'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-base shrink-0 shadow-xs">
                📋
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    Padrón General Consolidado (Todos los {ROLES_PRINCIPALES.length} Roles)
                  </h4>
                  <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                    Documento Maestro
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Lista exhaustiva unificada de candidatos, comando de campaña, coordinadores y fiscales de mesa.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-between sm:justify-end">
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-3 py-1 rounded-lg">
                {previewCount} reg.
              </span>
              <button
                onClick={() => handleDownload('TODOS')}
                disabled={isGenerating}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar PDF</span>
              </button>
            </div>
          </div>

          {/* Category Filter Pills */}
          <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2.5">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-4 h-4 text-purple-600" />
                Seleccione el Rol Específico para Descargar su Planilla:
              </h3>
              <span className="text-[11px] text-slate-500">
                Mostrando {displayedRoles.length} de {ROLES_PRINCIPALES.length} roles
              </span>
            </div>

            {/* Filter buttons by pillar */}
            <div className="flex flex-wrap items-center gap-1.5 mb-3.5">
              <button
                onClick={() => setSelectedCategoria('TODAS')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                  selectedCategoria === 'TODAS'
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                }`}
              >
                Todos los Roles
              </button>
              {CATEGORIAS_ROLES.map(cat => (
                <button
                  key={cat.categoria}
                  onClick={() => setSelectedCategoria(cat.categoria)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer border ${
                    selectedCategoria === cat.categoria
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {cat.categoria} ({cat.roles.length})
                </button>
              ))}
            </div>

            {/* Individual Roles Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {displayedRoles.map(rol => {
                const count = roleCounts[rol] || 0;
                const isSelected = selectedRole === rol;
                const badge = getRoleBadge(rol);

                return (
                  <div
                    key={rol}
                    className={`p-3.5 rounded-2xl border transition flex items-center justify-between ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50/50 ring-2 ring-purple-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl ${badge.bg} text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-xs`}>
                        {badge.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 leading-tight">
                          {rol}
                        </h4>
                        <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md mt-1 ${badge.pill}`}>
                          {count} {count === 1 ? 'registro' : 'registros'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedRole(rol);
                        handleDownload(rol);
                      }}
                      disabled={isGenerating}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:border-purple-500 hover:bg-purple-600 hover:text-white text-slate-700 text-xs font-medium transition cursor-pointer"
                      title={`Descargar planilla PDF de ${rol}`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Features info callout */}
          <div className="bg-slate-900 text-slate-300 p-4 rounded-2xl text-xs space-y-1.5 border border-slate-800">
            <div className="flex items-center gap-2 text-white font-bold">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Características de la Planilla Oficial de Control Electoral:
            </div>
            <ul className="list-disc list-inside space-y-1 text-slate-300 pl-1">
              <li><strong>Firma / Acreditación:</strong> Columna en blanco con espacio para rubricar ante autoridades de mesa o comando de campaña.</li>
              <li><strong>Encabezado Institucional:</strong> Título oficial del rol, fecha/hora exacta de emisión, operador responsable y ámbito seleccionado.</li>
              <li><strong>Formato A4 Horizontal (Landscape):</strong> Optimizado para lectura clara y espacio cómodo de firmas en mesa.</li>
              <li><strong>Compatibilidad 100%:</strong> Sincronizado en tiempo real con las hojas de cálculo de Google Sheets.</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>Formato oficial de fiscalización • Provincia de Misiones</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold cursor-pointer transition"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
