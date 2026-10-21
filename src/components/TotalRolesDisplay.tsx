import React, { useState, useMemo } from 'react';
import { 
  DirectorioItem, 
  ROLES_PRINCIPALES,
  CATEGORIAS_ROLES 
} from '../data/initialData';
import { 
  Users, 
  CheckCircle2, 
  Clock, 
  MapPin, 
  FileText, 
  Download, 
  Sparkles,
  Shield,
  Vote,
  Award,
  UserCheck,
  UserPlus,
  Compass,
  Briefcase,
  HelpCircle,
  Truck,
  Scale
} from 'lucide-react';

interface TotalRolesDisplayProps {
  directorio: DirectorioItem[];
  activeFilterRol: string;
  onSelectFilterRol: (rol: string) => void;
  onOpenPdfModalForRole: (rol: string) => void;
  onOpenFiscalModal: () => void;
}

export const TotalRolesDisplay: React.FC<TotalRolesDisplayProps> = ({
  directorio,
  activeFilterRol,
  onSelectFilterRol,
  onOpenPdfModalForRole,
  onOpenFiscalModal,
}) => {
  const total = directorio.length;
  const [selectedCategoria, setSelectedCategoria] = useState<string>('TODAS');
  const [showAnalysisExplainer, setShowAnalysisExplainer] = useState(false);

  // Configuration helper per role
  const getRoleConfig = (rol: string) => {
    switch (rol) {
      case 'Gobernador':
        return {
          icon: '👑',
          colorClass: 'from-amber-500 to-yellow-600',
          badgeClass: 'bg-amber-100 text-amber-950 border-amber-400 font-black',
          barColor: 'bg-amber-500',
          tag: 'Poder Ejecutivo Provincial',
          categoria: 'Candidaturas'
        };
      case 'Vice Gobernador':
        return {
          icon: '🏛️',
          colorClass: 'from-amber-600 to-yellow-700',
          badgeClass: 'bg-amber-100 text-amber-950 border-amber-300 font-bold',
          barColor: 'bg-amber-500',
          tag: 'Fórmula Provincial',
          categoria: 'Candidaturas'
        };
      case 'Senador Nacional':
        return {
          icon: '🇦🇷',
          colorClass: 'from-blue-700 to-sky-800',
          badgeClass: 'bg-blue-100 text-blue-950 border-blue-400 font-bold',
          barColor: 'bg-blue-700',
          tag: 'Senado de la Nación',
          categoria: 'Candidaturas'
        };
      case 'Diputado Nacional':
        return {
          icon: '🏛️',
          colorClass: 'from-blue-600 to-sky-700',
          badgeClass: 'bg-blue-100 text-blue-950 border-blue-300 font-bold',
          barColor: 'bg-blue-600',
          tag: 'Cámara Diputados Nación',
          categoria: 'Candidaturas'
        };
      case 'Diputado Provincial':
        return {
          icon: '📜',
          colorClass: 'from-sky-700 to-blue-800',
          badgeClass: 'bg-sky-100 text-sky-900 border-sky-300 font-bold',
          barColor: 'bg-sky-600',
          tag: 'Cámara de Representantes',
          categoria: 'Candidaturas'
        };
      case 'Candidato a Intendente':
        return {
          icon: '🎯',
          colorClass: 'from-purple-700 to-fuchsia-800',
          badgeClass: 'bg-purple-100 text-purple-900 border-purple-300 font-bold',
          barColor: 'bg-purple-600',
          tag: 'Ejecutivo Municipal (79)',
          categoria: 'Candidaturas'
        };
      case 'Vice Intendente':
        return {
          icon: '🤝',
          colorClass: 'from-fuchsia-700 to-pink-800',
          badgeClass: 'bg-fuchsia-100 text-fuchsia-900 border-fuchsia-300 font-bold',
          barColor: 'bg-fuchsia-600',
          tag: 'Fórmula Municipal',
          categoria: 'Candidaturas'
        };
      case 'Candidato a Concejal':
        return {
          icon: '👥',
          colorClass: 'from-indigo-600 to-violet-700',
          badgeClass: 'bg-indigo-100 text-indigo-900 border-indigo-300',
          barColor: 'bg-indigo-600',
          tag: 'Concejo Deliberante',
          categoria: 'Candidaturas'
        };
      case 'Convencional Constituyente':
        return {
          icon: '⚖️',
          colorClass: 'from-amber-700 to-yellow-800',
          badgeClass: 'bg-amber-50 text-amber-950 border-amber-300 font-bold',
          barColor: 'bg-amber-600',
          tag: 'Carta Orgánica Municipal',
          categoria: 'Candidaturas'
        };
      case 'Defensor del Pueblo':
        return {
          icon: '🛡️',
          colorClass: 'from-violet-700 to-purple-800',
          badgeClass: 'bg-violet-100 text-violet-900 border-violet-300 font-bold',
          barColor: 'bg-violet-600',
          tag: 'Garantías Ciudadanas',
          categoria: 'Candidaturas'
        };
      case 'Jefe de Campaña':
        return {
          icon: '🎖️',
          colorClass: 'from-red-600 to-orange-700',
          badgeClass: 'bg-red-100 text-red-950 border-red-300 font-bold',
          barColor: 'bg-red-600',
          tag: 'Comando Estratégico',
          categoria: 'Comando y Legales'
        };
      case 'Apoderado Legal':
        return {
          icon: '⚖️',
          colorClass: 'from-indigo-800 to-purple-900',
          badgeClass: 'bg-indigo-100 text-indigo-950 border-indigo-300 font-bold',
          barColor: 'bg-indigo-700',
          tag: 'Tribunal Electoral',
          categoria: 'Comando y Legales'
        };
      case 'Responsable Económico-Financiero':
        return {
          icon: '💼',
          colorClass: 'from-emerald-700 to-teal-800',
          badgeClass: 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold',
          barColor: 'bg-emerald-700',
          tag: 'Ley Financiamiento 26.215',
          categoria: 'Comando y Legales'
        };
      case 'Responsable de Comunicación y Prensa':
        return {
          icon: '🎙️',
          colorClass: 'from-pink-600 to-rose-700',
          badgeClass: 'bg-pink-100 text-pink-950 border-pink-300 font-bold',
          barColor: 'bg-pink-600',
          tag: 'Vocería y Medios',
          categoria: 'Comando y Legales'
        };
      case 'Coordinador de Campaña Digital y Redes':
        return {
          icon: '📱',
          colorClass: 'from-sky-600 to-indigo-700',
          badgeClass: 'bg-sky-100 text-sky-950 border-sky-300 font-bold',
          barColor: 'bg-sky-600',
          tag: 'Redes, Ads y TikTok',
          categoria: 'Comando y Legales'
        };
      case 'Presidente de Mesa Política':
        return {
          icon: '🏛️',
          colorClass: 'from-blue-700 to-indigo-800',
          badgeClass: 'bg-blue-100 text-blue-900 border-blue-300',
          barColor: 'bg-blue-600',
          tag: 'Conducción Territorial',
          categoria: 'Logística y Territorio'
        };
      case 'Responsable de Logística':
        return {
          icon: '🚚',
          colorClass: 'from-cyan-600 to-teal-700',
          badgeClass: 'bg-cyan-100 text-cyan-950 border-cyan-300',
          barColor: 'bg-cyan-600',
          tag: 'Operativo Día D',
          categoria: 'Logística y Territorio'
        };
      case 'Coordinador de Movilización y Transporte':
        return {
          icon: '🚐',
          colorClass: 'from-blue-600 to-cyan-700',
          badgeClass: 'bg-blue-100 text-blue-900 border-blue-300 font-bold',
          barColor: 'bg-blue-600',
          tag: 'Flota y Traslado Votantes',
          categoria: 'Logística y Territorio'
        };
      case 'Referente Territorial':
        return {
          icon: '🚩',
          colorClass: 'from-amber-600 to-orange-700',
          badgeClass: 'bg-amber-100 text-amber-900 border-amber-300',
          barColor: 'bg-amber-500',
          tag: 'Despliegue Barrial',
          categoria: 'Logística y Territorio'
        };
      case 'Voluntario / Militante de Campaña':
        return {
          icon: '🤝',
          colorClass: 'from-emerald-600 to-green-700',
          badgeClass: 'bg-emerald-100 text-emerald-950 border-emerald-300',
          barColor: 'bg-emerald-500',
          tag: 'Reparto Boletas y Timbreo',
          categoria: 'Logística y Territorio'
        };
      case 'Coordinador General de Fiscalización':
        return {
          icon: '🛡️',
          colorClass: 'from-teal-700 to-emerald-800',
          badgeClass: 'bg-teal-100 text-teal-950 border-teal-300 font-bold',
          barColor: 'bg-teal-700',
          tag: 'Mando General de Fiscales',
          categoria: 'Fiscalización'
        };
      case 'Fiscal General':
        return {
          icon: '🛡️',
          colorClass: 'from-teal-600 to-cyan-700',
          badgeClass: 'bg-teal-100 text-teal-900 border-teal-300',
          barColor: 'bg-teal-500',
          tag: 'Coordinación de Escuela',
          categoria: 'Fiscalización'
        };
      case 'Fiscal de Mesa':
        return {
          icon: '🗳️',
          colorClass: 'from-emerald-600 to-teal-700',
          badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300',
          barColor: 'bg-emerald-500',
          tag: 'Fiscalización en Mesa',
          categoria: 'Fiscalización'
        };
      case 'Fiscal Suplente / Relevo':
        return {
          icon: '🔄',
          colorClass: 'from-cyan-600 to-emerald-700',
          badgeClass: 'bg-cyan-100 text-cyan-900 border-cyan-300',
          barColor: 'bg-cyan-500',
          tag: 'Reemplazo y Viandas',
          categoria: 'Fiscalización'
        };
      case 'Fiscal Informático / Cómputos':
        return {
          icon: '💻',
          colorClass: 'from-slate-700 to-slate-900',
          badgeClass: 'bg-slate-100 text-slate-950 border-slate-300',
          barColor: 'bg-slate-700',
          tag: 'Centro de Cómputos',
          categoria: 'Fiscalización'
        };
      case 'Fiscal de Escrutinio Definitivo':
        return {
          icon: '⚖️',
          colorClass: 'from-indigo-900 to-slate-900',
          badgeClass: 'bg-indigo-100 text-indigo-950 border-indigo-300 font-bold',
          barColor: 'bg-indigo-800',
          tag: 'Tribunal Recuento Definitivo',
          categoria: 'Fiscalización'
        };
      case 'Afiliado al Partido':
        return {
          icon: '🪪',
          colorClass: 'from-rose-600 to-pink-700',
          badgeClass: 'bg-rose-100 text-rose-900 border-rose-300',
          barColor: 'bg-rose-500',
          tag: 'Padrón de Afiliados',
          categoria: 'Padrón Partidario'
        };
      default:
        return {
          icon: '📋',
          colorClass: 'from-blue-600 to-indigo-600',
          badgeClass: 'bg-blue-100 text-blue-900 border-blue-200',
          barColor: 'bg-blue-600',
          tag: 'Electoral',
          categoria: 'Candidaturas'
        };
    }
  };

  // Breakdown by role
  const roleBreakdown = useMemo(() => {
    return ROLES_PRINCIPALES.map(rol => {
      const count = directorio.filter(d => d.rolPrincipal === rol).length;
      const percentage = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
      const confirmados = directorio.filter(d => d.rolPrincipal === rol && d.estado === 'Confirmado').length;
      const config = getRoleConfig(rol);

      return {
        rol,
        count,
        percentage,
        confirmados,
        config,
      };
    });
  }, [directorio, total]);

  // Overall status breakdown
  const statusStats = useMemo(() => {
    const confirmados = directorio.filter(d => d.estado === 'Confirmado').length;
    const activos = directorio.filter(d => d.estado === 'Activo').length;
    const revision = directorio.filter(d => d.estado === 'En Revisión').length;
    const suplentes = directorio.filter(d => d.estado === 'Suplente').length;
    const municipiosCount = new Set(directorio.map(d => d.municipio)).size;
    const totalFiscales = directorio.filter(d => 
      d.rolPrincipal === 'Fiscal de Mesa' || 
      d.rolPrincipal === 'Fiscal General' ||
      d.rolPrincipal === 'Fiscal Suplente / Relevo' ||
      d.rolPrincipal === 'Fiscal Informático / Cómputos' ||
      d.rolPrincipal === 'Fiscal de Escrutinio Definitivo' ||
      d.rolPrincipal === 'Coordinador General de Fiscalización'
    ).length;
    const totalCandidatos = directorio.filter(d => 
      d.rolPrincipal === 'Gobernador' ||
      d.rolPrincipal === 'Vice Gobernador' ||
      d.rolPrincipal === 'Senador Nacional' ||
      d.rolPrincipal === 'Diputado Nacional' ||
      d.rolPrincipal === 'Diputado Provincial' ||
      d.rolPrincipal === 'Candidato a Intendente' ||
      d.rolPrincipal === 'Vice Intendente' ||
      d.rolPrincipal === 'Candidato a Concejal' ||
      d.rolPrincipal === 'Convencional Constituyente' ||
      d.rolPrincipal === 'Defensor del Pueblo'
    ).length;
    return { confirmados, activos, revision, suplentes, municipiosCount, totalFiscales, totalCandidatos };
  }, [directorio]);

  // Filtered roles by category
  const filteredRoles = useMemo(() => {
    if (selectedCategoria === 'TODAS') return roleBreakdown;
    return roleBreakdown.filter(item => item.config.categoria === selectedCategoria);
  }, [roleBreakdown, selectedCategoria]);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden space-y-0">
      {/* Top Banner: Gran Total General */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-5 sm:p-6 border-b border-slate-800">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 text-amber-300 border border-amber-400/30 flex items-center justify-center text-3xl font-bold shadow-inner shrink-0">
              👑
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-amber-400/20 text-amber-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-amber-400/30 uppercase tracking-wider flex items-center gap-1">
                  <span>Fórmula Provincial & Campaña Integral</span>
                </span>
                <span className="bg-emerald-400/20 text-emerald-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  79 Municipios de Misiones
                </span>
                <span className="bg-blue-400/20 text-sky-300 text-xs font-medium px-2 py-0.5 rounded-full border border-blue-400/30">
                  {ROLES_PRINCIPALES.length} Roles Oficiales
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                Estructura de Campaña Electoral Completa: Total y Discriminación por Rol
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-2xl">
                Supervisión centralizada del padrón electoral: desde la fórmula provincial (Gobernador y Vice), senadores, diputados e intendentes, hasta el comando legal, movilización territorial y red integral de fiscales.
              </p>
            </div>
          </div>

          {/* Large KPI Counter & Quick Actions */}
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/15 shrink-0">
            <div>
              <div className="text-[11px] font-semibold text-sky-200 uppercase tracking-wider">
                Gran Total Registrados
              </div>
              <div className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-none mt-1">
                {total}
              </div>
              <div className="text-[11px] text-slate-300 mt-1">
                {statusStats.totalCandidatos} Candidatos • {statusStats.totalFiscales} Fiscales
              </div>
            </div>

            <div className="h-12 w-[1px] bg-white/20 mx-1"></div>

            <div className="flex flex-col gap-1.5">
              <button
                onClick={onOpenFiscalModal}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs transition cursor-pointer shadow-md"
                title="Carga Rápida de Fiscales de Mesa o Fiscales Generales"
              >
                <span>⚡ Cargar Fiscal</span>
              </button>

              <button
                onClick={() => setShowAnalysisExplainer(!showAnalysisExplainer)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-600/60 hover:bg-blue-600 text-white font-medium text-xs transition cursor-pointer border border-blue-400/30"
                title="Ver análisis estratégico de roles de campaña"
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>{showAnalysisExplainer ? 'Ocultar Análisis' : 'Análisis Roles'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Strategic Analysis Callout (Toggleable) */}
        {showAnalysisExplainer && (
          <div className="mt-5 p-4 rounded-2xl bg-slate-800/90 border border-amber-400/40 text-xs text-slate-200 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Análisis Estratégico: Roles Esenciales para Contemplar Toda la Campaña en Misiones</span>
              </div>
              <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-400/30 font-semibold">
                Ley Electoral de Misiones & Ley de Financiamiento Político 26.215
              </span>
            </div>

            <p className="text-slate-300 leading-relaxed">
              Para garantizar que no falte ningún aspecto operativo, legal o político en los 79 municipios, el sistema clasifica la campaña en <strong>5 pilares estratégicos</strong> con <strong>{ROLES_PRINCIPALES.length} roles especializados</strong>:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-slate-900/80 border border-amber-500/30">
                <div className="font-bold text-amber-300 flex items-center gap-1.5 mb-1">
                  <span>🏛️ 1. Candidaturas y Fórmulas</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  <strong>Gobernador y Vice Gobernador</strong> (fórmula provincial), <strong>Senador Nacional</strong> y <strong>Diputado Nacional</strong> (Congreso Nacional), <strong>Diputado Provincial</strong> (Cámara de Representantes), <strong>Candidato a Intendente y Vice</strong>, <strong>Concejales</strong>, <strong>Convencionales Constituyentes</strong> (reforma de Carta Orgánica) y <strong>Defensor del Pueblo</strong>.
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-red-500/30">
                <div className="font-bold text-red-300 flex items-center gap-1.5 mb-1">
                  <span>⚖️ 2. Comando Político, Legal y Financiero</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  <strong>Jefe de Campaña</strong> (estrategia y conducción), <strong>Apoderado Legal</strong> (ante Tribunal Electoral), <strong>Responsable Económico-Financiero</strong> (obligatorio por Ley 26.215 para rendición de cuentas y fondos), <strong>Responsable de Prensa</strong> (medios y vocería) y <strong>Coordinador Digital y Redes</strong> (TikTok, Meta Ads, WhatsApp).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-blue-500/30">
                <div className="font-bold text-sky-300 flex items-center gap-1.5 mb-1">
                  <span>🚚 3. Logística Territorial Día D</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  <strong>Presidente de Mesa Política</strong> (conducción de circuito), <strong>Responsable de Logística</strong> (materiales y boletas), <strong>Coordinador de Movilización y Transporte</strong> (remises, combis y traslado rural de votantes), <strong>Referentes Territoriales</strong> y <strong>Voluntarios / Militantes</strong> (timbreo y reparto de votos).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/30">
                <div className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                  <span>🛡️ 4. Cadena Integral de Fiscalización</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  <strong>Coordinador General de Fiscalización</strong>, <strong>Fiscal General</strong> (por escuela), <strong>Fiscal de Mesa</strong> (en mesa de votación), <strong>Fiscal Suplente / Relevo</strong> (rotación y descansos), <strong>Fiscal Informático</strong> (transmisión y cómputos) y <strong>Fiscal de Escrutinio Definitivo</strong> (defensa de votos en Posadas).
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/80 border border-rose-500/30 md:col-span-2 lg:col-span-2">
                <div className="font-bold text-rose-300 flex items-center gap-1.5 mb-1">
                  <span>🪪 5. Base y Padrón Partidario</span>
                </div>
                <p className="text-[11px] text-slate-300">
                  <strong>Afiliado al Partido</strong>: Padrón de simpatizantes y militantes empadronados para avales, fiscales suplentes y movilización espontánea comunitaria.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Global Status Counters Strip */}
        <div className="mt-5 pt-4 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2.5 text-xs">
          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-400">Confirmados:</span>
            <span className="font-bold text-emerald-400">{statusStats.confirmados}</span>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-400">Activos:</span>
            <span className="font-bold text-sky-400">{statusStats.activos}</span>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-400">En Revisión:</span>
            <span className="font-bold text-amber-400">{statusStats.revision}</span>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-400">Suplentes:</span>
            <span className="font-bold text-purple-400">{statusStats.suplentes}</span>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-400">Total Fiscales:</span>
            <span className="font-bold text-teal-300">{statusStats.totalFiscales}</span>
          </div>

          <div className="bg-slate-800/60 p-2.5 rounded-xl border border-slate-700/60 flex items-center justify-between">
            <span className="text-slate-400">Municipios:</span>
            <span className="font-bold text-indigo-300">{statusStats.municipiosCount} / 79</span>
          </div>
        </div>
      </div>

      {/* Breakdown by EVERY Role Separately in the Same Display */}
      <div className="p-5 sm:p-6 bg-slate-50/50 space-y-4">
        {/* Category Filter Pills & Active Filter Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              Detalle y Discriminación de los {ROLES_PRINCIPALES.length} Roles Electorales
            </h3>
            <p className="text-[11px] text-slate-500">
              Haga clic sobre cualquier rol para filtrar la tabla inferior o descargue directamente su planilla oficial en PDF.
            </p>
          </div>

          {activeFilterRol !== 'TODOS' && (
            <button
              onClick={() => onSelectFilterRol('TODOS')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 bg-blue-100 hover:bg-blue-200 px-3 py-1 rounded-xl transition cursor-pointer"
            >
              ✕ Quitar filtro activo ({activeFilterRol})
            </button>
          )}
        </div>

        {/* Pillar Categories Bar */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => setSelectedCategoria('TODAS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
              selectedCategoria === 'TODAS'
                ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:border-slate-400 hover:bg-slate-50'
            }`}
          >
            Todos los Roles ({roleBreakdown.length})
          </button>

          {CATEGORIAS_ROLES.map(cat => {
            const isCatActive = selectedCategoria === cat.categoria;
            const countInCat = directorio.filter(d => (cat.roles as readonly string[]).includes(d.rolPrincipal)).length;

            return (
              <button
                key={cat.categoria}
                onClick={() => setSelectedCategoria(cat.categoria)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer border flex items-center gap-1.5 ${
                  isCatActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white text-slate-700 border-slate-300 hover:border-blue-300 hover:bg-blue-50/50'
                }`}
              >
                <span>{cat.categoria}</span>
                <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${isCatActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {countInCat}
                </span>
              </button>
            );
          })}
        </div>

        {/* Roles Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredRoles.map(item => {
            const isSelected = activeFilterRol === item.rol;

            return (
              <div
                key={item.rol}
                className={`relative bg-white rounded-2xl p-4 border transition-all duration-200 flex flex-col justify-between gap-3 shadow-xs ${
                  isSelected
                    ? 'border-blue-600 ring-2 ring-blue-500/20 bg-blue-50/20'
                    : 'border-slate-200/90 hover:border-slate-300 hover:shadow-md'
                }`}
              >
                {/* Header card with icon and count */}
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xl shrink-0 p-1.5 bg-slate-100 rounded-xl">
                        {item.config.icon}
                      </span>
                      <div>
                        <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                          {item.config.tag}
                        </div>
                        <h4
                          onClick={() => onSelectFilterRol(isSelected ? 'TODOS' : item.rol)}
                          className="text-xs font-bold text-slate-900 hover:text-blue-600 transition cursor-pointer leading-tight"
                        >
                          {item.rol}
                        </h4>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xl font-extrabold text-slate-900 block leading-tight">
                        {item.count}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar representing share of total */}
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                    <div
                      className={`h-full ${item.config.barColor} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.max(Number(item.percentage), item.count > 0 ? 5 : 0)}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-1.5">
                    <span>{item.confirmados} confirmados</span>
                    <span>{total > 0 ? `${item.count} de ${total}` : '0'}</span>
                  </div>
                </div>

                {/* Bottom Actions: Filter & Download PDF */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => onSelectFilterRol(isSelected ? 'TODOS' : item.rol)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition cursor-pointer ${
                      isSelected
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isSelected ? '✓ Filtrado' : 'Filtrar'}
                  </button>

                  <button
                    onClick={() => onOpenPdfModalForRole(item.rol)}
                    className="flex items-center gap-1 text-[11px] font-medium text-purple-700 hover:text-purple-900 hover:bg-purple-50 px-2 py-1 rounded-lg border border-purple-200 transition cursor-pointer"
                    title={`Descargar planilla oficial en PDF para ${item.rol}`}
                  >
                    <Download className="w-3 h-3 text-purple-600" />
                    <span>Planilla PDF</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
