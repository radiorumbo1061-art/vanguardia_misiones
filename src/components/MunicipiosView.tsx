import React, { useState, useMemo } from 'react';
import { 
  MUNICIPIOS_MISIONES, 
  DEPARTAMENTOS_MISIONES, 
  ZONAS_ELECTORALES,
  MunicipioData 
} from '../data/municipiosMisiones';
import { DirectorioItem } from '../data/initialData';
import { 
  Search, 
  MapPin, 
  Landmark, 
  Layers, 
  Compass, 
  Sparkles, 
  CheckCircle2, 
  Info, 
  Copy,
  Vote,
  BarChart3,
  TrendingUp,
  PieChart,
  Filter,
  ShieldCheck,
  ChevronRight,
  Maximize2,
  Minimize2,
  Table,
  HelpCircle,
  AlertTriangle,
  Flame,
  LayoutGrid,
  List
} from 'lucide-react';
import { ReporteDetalladoRecharts } from './ReporteDetalladoRecharts';
import { MapaCalorVotosRecharts } from './MapaCalorVotosRecharts';

interface MunicipiosViewProps {
  directorio: DirectorioItem[];
}

export const MunicipiosView: React.FC<MunicipiosViewProps> = ({ directorio }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepto, setFilterDepto] = useState<string>('TODOS');
  const [filterZona, setFilterZona] = useState<string>('TODOS');
  const [copied, setCopied] = useState(false);
  const [catalogViewMode, setCatalogViewMode] = useState<'cards' | 'table'>('table');
  const [activeDashboardTab, setActiveDashboardTab] = useState<'calor' | 'reporte' | 'zonas' | 'municipios' | 'departamentos'>('calor');
  const [municipioRankingMode, setMunicipioRankingMode] = useState<'top' | 'todos' | 'pendientes'>('top');
  const [showFormulaHelper, setShowFormulaHelper] = useState(false);

  // 1. Conteo de dirigentes por municipio y por estado
  const { countsPerMunicipio, statusPerMunicipio } = useMemo(() => {
    const counts: Record<string, number> = {};
    const statuses: Record<string, { confirmados: number; activos: number; revision: number }> = {};

    MUNICIPIOS_MISIONES.forEach(m => {
      counts[m.nombre] = 0;
      statuses[m.nombre] = { confirmados: 0, activos: 0, revision: 0 };
    });

    directorio.forEach(d => {
      counts[d.municipio] = (counts[d.municipio] || 0) + 1;
      if (!statuses[d.municipio]) {
        statuses[d.municipio] = { confirmados: 0, activos: 0, revision: 0 };
      }
      if (d.estado === 'Confirmado') statuses[d.municipio].confirmados += 1;
      else if (d.estado === 'Activo') statuses[d.municipio].activos += 1;
      else if (d.estado === 'En Revisión') statuses[d.municipio].revision += 1;
    });

    return { countsPerMunicipio: counts, statusPerMunicipio: statuses };
  }, [directorio]);

  // 2. Agrupación y conteo por Zona Electoral
  const statsPorZona = useMemo(() => {
    return ZONAS_ELECTORALES.map(zona => {
      const municipiosEnZona = MUNICIPIOS_MISIONES.filter(m => m.zonaElectoral === zona);
      const totalMunicipios = municipiosEnZona.length;
      
      let totalDirigentes = 0;
      let confirmados = 0;
      let activos = 0;
      let revision = 0;
      let municipiosConPresencia = 0;

      municipiosEnZona.forEach(m => {
        const c = countsPerMunicipio[m.nombre] || 0;
        totalDirigentes += c;
        if (c > 0) municipiosConPresencia += 1;

        const st = statusPerMunicipio[m.nombre];
        if (st) {
          confirmados += st.confirmados;
          activos += st.activos;
          revision += st.revision;
        }
      });

      const porcentajeCobertura = totalMunicipios > 0 ? (municipiosConPresencia / totalMunicipios) * 100 : 0;

      return {
        zona,
        totalMunicipios,
        municipiosConPresencia,
        porcentajeCobertura,
        totalDirigentes,
        confirmados,
        activos,
        revision,
      };
    }).sort((a, b) => b.totalDirigentes - a.totalDirigentes);
  }, [countsPerMunicipio, statusPerMunicipio]);

  // Max dirigentes in a zone for bar scale
  const maxDirigentesZona = useMemo(() => {
    return Math.max(...statsPorZona.map(z => z.totalDirigentes), 1);
  }, [statsPorZona]);

  // 3. Ranking de Municipios
  const municipiosRanking = useMemo(() => {
    return MUNICIPIOS_MISIONES.map(m => {
      const count = countsPerMunicipio[m.nombre] || 0;
      const st = statusPerMunicipio[m.nombre] || { confirmados: 0, activos: 0, revision: 0 };
      return {
        ...m,
        totalDirigentes: count,
        ...st,
      };
    });
  }, [countsPerMunicipio, statusPerMunicipio]);

  // Filtered ranking according to mode and filters
  const displayedMunicipiosRanking = useMemo(() => {
    let list = [...municipiosRanking];

    if (filterZona !== 'TODOS') {
      list = list.filter(m => m.zonaElectoral === filterZona);
    }
    if (filterDepto !== 'TODOS') {
      list = list.filter(m => m.departamento === filterDepto);
    }

    if (municipioRankingMode === 'top') {
      return list.sort((a, b) => b.totalDirigentes - a.totalDirigentes).slice(0, 10);
    } else if (municipioRankingMode === 'pendientes') {
      return list.filter(m => m.totalDirigentes === 0);
    } else {
      return list.sort((a, b) => b.totalDirigentes - a.totalDirigentes);
    }
  }, [municipiosRanking, municipioRankingMode, filterZona, filterDepto]);

  const maxDirigentesMunicipio = useMemo(() => {
    return Math.max(...municipiosRanking.map(m => m.totalDirigentes), 1);
  }, [municipiosRanking]);

  // 4. Conteo por Departamento (17)
  const statsPorDepartamento = useMemo(() => {
    return DEPARTAMENTOS_MISIONES.map(depto => {
      const municipiosEnDepto = MUNICIPIOS_MISIONES.filter(m => m.departamento === depto);
      const totalMunicipios = municipiosEnDepto.length;
      let totalDirigentes = 0;
      let cubiertos = 0;

      municipiosEnDepto.forEach(m => {
        const c = countsPerMunicipio[m.nombre] || 0;
        totalDirigentes += c;
        if (c > 0) cubiertos += 1;
      });

      return {
        departamento: depto,
        totalMunicipios,
        cubiertos,
        porcentaje: (cubiertos / totalMunicipios) * 100,
        totalDirigentes,
      };
    }).sort((a, b) => b.totalDirigentes - a.totalDirigentes);
  }, [countsPerMunicipio]);

  // Overall metrics
  const totalRegistros = directorio.length;
  const coveredCount = useMemo(() => {
    return Object.values(countsPerMunicipio).filter(c => c > 0).length;
  }, [countsPerMunicipio]);

  const topZona = statsPorZona[0];

  // Filtered table list
  const filteredMunicipiosTable = useMemo(() => {
    return MUNICIPIOS_MISIONES.filter(m => {
      const matchSearch =
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.departamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.zonaElectoral.toLowerCase().includes(searchTerm.toLowerCase());

      const matchDepto = filterDepto === 'TODOS' || m.departamento === filterDepto;
      const matchZona = filterZona === 'TODOS' || m.zonaElectoral === filterZona;

      return matchSearch && matchDepto && matchZona;
    });
  }, [searchTerm, filterDepto, filterZona]);

  const copyMunicipiosList = () => {
    const text = MUNICIPIOS_MISIONES.map(
      m => `${m.id}\t${m.nombre}\t${m.departamento}\t${m.zonaElectoral}\t${m.cabecera ? 'SI' : 'NO'}\t${countsPerMunicipio[m.nombre] || 0}`
    ).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-sky-100 text-sky-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Pestaña 2 • Catálogo & Dashboard
            </span>
            <span className="text-xs text-slate-500">Google Sheets: Hoja "Municipios"</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1 flex items-center gap-2">
            <span>Análisis Territorial • 79 Municipios de Misiones</span>
            <span className="bg-blue-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              Dashboard Activo
            </span>
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Monitoreo en tiempo real del despliegue electoral con gráficos de barras por zona electoral, ranking de municipios y cobertura territorial.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setShowFormulaHelper(!showFormulaHelper)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 font-medium text-xs hover:bg-sky-100 transition cursor-pointer"
          >
            <Sparkles className="w-4 h-4 text-sky-600" />
            <span>Fórmulas para Gráficos en Sheets</span>
          </button>

          <button
            onClick={copyMunicipiosList}
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs transition cursor-pointer"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? '¡Copiado!' : 'Copiar Catálogo'}</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 uppercase">Total Dirigentes</span>
            <TrendingUp className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl font-bold text-slate-900 mt-2">{totalRegistros}</p>
          <span className="text-xs text-slate-500">Cargados en Directorio General</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-600 uppercase">Municipios Cubiertos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-emerald-700 mt-2">
            {coveredCount} <span className="text-sm font-normal text-slate-400">/ 79</span>
          </p>
          <span className="text-xs text-emerald-600 font-medium">
            {((coveredCount / 79) * 100).toFixed(1)}% de cobertura provincial
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-purple-600 uppercase">Zona Líder</span>
            <Compass className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-base font-bold text-purple-900 mt-2 truncate" title={topZona?.zona}>
            {topZona?.zona || 'Sin datos'}
          </p>
          <span className="text-xs text-slate-500">
            {topZona?.totalDirigentes || 0} dirigentes ({topZona?.municipiosConPresencia}/{topZona?.totalMunicipios} muns)
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-amber-600 uppercase">Municipios Pendientes</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-amber-700 mt-2">
            {79 - coveredCount}
          </p>
          <span className="text-xs text-slate-500">Sin referentes designados aún</span>
        </div>
      </div>

      {/* Formula Helper Collapsible Card */}
      {showFormulaHelper && (
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-5 border border-indigo-800 shadow-md animate-fade-in text-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-indigo-900">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              <strong className="text-sm font-bold text-white">
                Cómo Replicar estos Gráficos de Barras Nativos en Google Sheets:
              </strong>
            </div>
            <button
              onClick={() => setShowFormulaHelper(false)}
              className="text-slate-400 hover:text-white font-bold"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <p className="font-semibold text-sky-300 mb-1">
                1. Minigráfico de Barras en Celda (Fórmula SPARKLINE):
              </p>
              <p className="text-slate-300 mb-2">
                Agrega una columna en la pestaña <em>Municipios</em> y pega esta fórmula en la celda H2:
              </p>
              <code className="block bg-slate-950 p-2.5 rounded-lg text-emerald-400 font-mono text-[11px] select-all border border-slate-800">
                =SPARKLINE(CONTAR.SI(Directorio_General!$F$2:$F$1000; B2); &#123;"charttype", "bar"; "max", 15; "color1", "#0284c7"&#125;)
              </code>
              <p className="text-slate-400 text-[10px] mt-1.5">
                Dibuja automáticamente una barra horizontal proporcional al volumen de dirigentes en cada fila.
              </p>
            </div>

            <div className="bg-slate-800/80 p-3.5 rounded-xl border border-slate-700">
              <p className="font-semibold text-sky-300 mb-1">
                2. Gráfico de Barras por Zona Electoral (Menú Insertar):
              </p>
              <p className="text-slate-300 mb-2">
                Genera la tabla dinámica o usa la fórmula QUERY:
              </p>
              <code className="block bg-slate-950 p-2.5 rounded-lg text-emerald-400 font-mono text-[11px] select-all border border-slate-800">
                =QUERY(Directorio_General!A2:K1000; "SELECT F, COUNT(A) WHERE F IS NOT NULL GROUP BY F ORDER BY COUNT(A) DESC LABEL COUNT(A) 'Total'")
              </code>
              <p className="text-slate-400 text-[10px] mt-1.5">
                Luego selecciona los datos y ve a <strong>Insertar &gt; Gráfico &gt; Gráfico de barras horizontales</strong>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* DASHBOARD SECTION: Interactive Bar Charts */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" />
              Módulo de Analítica Territorial
            </span>
            <h2 className="text-lg font-bold text-slate-900 mt-0.5">
              Gráficos de Barras de Despliegue de Campaña
            </h2>
          </div>

          {/* Subtab Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium overflow-x-auto max-w-full">
            <button
              onClick={() => setActiveDashboardTab('calor')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeDashboardTab === 'calor'
                  ? 'bg-gradient-to-r from-red-600 to-amber-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-amber-200" />
              <span>🔥 Mapa de Calor de Votos (Recharts)</span>
              <span className="bg-amber-400 text-slate-950 font-bold px-1.5 py-0.2 rounded text-[9px]">Destacado</span>
            </button>
            <button
              onClick={() => setActiveDashboardTab('reporte')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeDashboardTab === 'reporte'
                  ? 'bg-blue-600 text-white font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
              <span>Reporte Territorial (Recharts)</span>
            </button>
            <button
              onClick={() => setActiveDashboardTab('zonas')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                activeDashboardTab === 'zonas'
                  ? 'bg-white text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Por Zona Electoral (10)
            </button>
            <button
              onClick={() => setActiveDashboardTab('municipios')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                activeDashboardTab === 'municipios'
                  ? 'bg-white text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Ranking de Municipios
            </button>
            <button
              onClick={() => setActiveDashboardTab('departamentos')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer whitespace-nowrap ${
                activeDashboardTab === 'departamentos'
                  ? 'bg-white text-blue-700 font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Por Departamento (17)
            </button>
          </div>
        </div>

        {/* 0. MAPA DE CALOR POR DENSIDAD DE VOTOS PROYECTADOS (RECHARTS) */}
        {activeDashboardTab === 'calor' && (
          <MapaCalorVotosRecharts
            directorio={directorio}
            onSelectMunicipio={(mun) => {
              setSearchTerm(mun);
            }}
          />
        )}

        {/* 1. REPORTE DETALLADO (RECHARTS) */}
        {activeDashboardTab === 'reporte' && (
          <ReporteDetalladoRecharts
            directorio={directorio}
            onSelectZona={(zona) => {
              setFilterZona(zona);
              // scroll to table smoothly
            }}
          />
        )}

        {/* 1. GRÁFICO POR ZONA ELECTORAL */}
        {activeDashboardTab === 'zonas' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
              <p>
                Visualización de volumen de dirigentes cargados en cada una de las <strong>10 Zonas Electorales</strong> de Misiones.
              </p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Confirmados
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-sky-500"></span> Activos
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> En Revisión
                </span>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {statsPorZona.map((z, idx) => {
                const widthPercent = (z.totalDirigentes / maxDirigentesZona) * 100;
                const isSelected = filterZona === z.zona;

                return (
                  <div
                    key={z.zona}
                    onClick={() => {
                      if (filterZona === z.zona) {
                        setFilterZona('TODOS');
                      } else {
                        setFilterZona(z.zona);
                      }
                    }}
                    className={`p-3 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50/60'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold flex items-center justify-center text-[10px]">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {z.zona}
                        </span>
                        {isSelected && (
                          <span className="bg-blue-600 text-white text-[10px] px-1.5 py-0.2 rounded font-semibold">
                            Filtro Aplicado
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-slate-500">
                          {z.municipiosConPresencia} de {z.totalMunicipios} municipios cubiertos ({z.porcentajeCobertura.toFixed(0)}%)
                        </span>
                        <div className="font-bold text-slate-900 font-mono text-sm bg-slate-100 px-2.5 py-0.5 rounded-md">
                          {z.totalDirigentes} {z.totalDirigentes === 1 ? 'dirigente' : 'dirigentes'}
                        </div>
                      </div>
                    </div>

                    {/* Horizontal Bar Chart with Segments */}
                    <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden flex relative">
                      {z.totalDirigentes > 0 ? (
                        <div
                          style={{ width: `${Math.max(widthPercent, 4)}%` }}
                          className="h-full rounded-full flex overflow-hidden transition-all duration-500"
                        >
                          {/* Segment Confirmados */}
                          {z.confirmados > 0 && (
                            <div
                              style={{ width: `${(z.confirmados / z.totalDirigentes) * 100}%` }}
                              className="bg-emerald-500 h-full hover:opacity-90 transition-opacity"
                              title={`Confirmados: ${z.confirmados}`}
                            />
                          )}
                          {/* Segment Activos */}
                          {z.activos > 0 && (
                            <div
                              style={{ width: `${(z.activos / z.totalDirigentes) * 100}%` }}
                              className="bg-sky-500 h-full hover:opacity-90 transition-opacity"
                              title={`Activos: ${z.activos}`}
                            />
                          )}
                          {/* Segment En Revisión */}
                          {z.revision > 0 && (
                            <div
                              style={{ width: `${(z.revision / z.totalDirigentes) * 100}%` }}
                              className="bg-amber-400 h-full hover:opacity-90 transition-opacity"
                              title={`En Revisión: ${z.revision}`}
                            />
                          )}
                        </div>
                      ) : (
                        <div className="h-full w-full flex items-center pl-2 text-[10px] text-slate-400 italic">
                          Sin carga registrada en esta zona electoral
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-400 text-center pt-1">
              💡 Consejo: Haz clic en cualquiera de las barras para filtrar automáticamente el catálogo inferior por esa zona electoral.
            </p>
          </div>
        )}

        {/* 2. GRÁFICO RANKING DE MUNICIPIOS */}
        {activeDashboardTab === 'municipios' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <p className="text-xs text-slate-500">
                Comparativa de cantidad de dirigentes por localidad.
              </p>

              {/* Mode Selector */}
              <div className="flex items-center gap-1.5 text-xs">
                <button
                  onClick={() => setMunicipioRankingMode('top')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    municipioRankingMode === 'top'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Top 10 Municipios
                </button>
                <button
                  onClick={() => setMunicipioRankingMode('todos')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    municipioRankingMode === 'todos'
                      ? 'bg-blue-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Todos con Carga
                </button>
                <button
                  onClick={() => setMunicipioRankingMode('pendientes')}
                  className={`px-2.5 py-1 rounded-lg transition ${
                    municipioRankingMode === 'pendientes'
                      ? 'bg-amber-600 text-white font-semibold'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  Sin Carga (Pendientes: {79 - coveredCount})
                </button>
              </div>
            </div>

            {displayedMunicipiosRanking.length === 0 ? (
              <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-xl">
                No hay municipios que coincidan con los filtros seleccionados.
              </div>
            ) : (
              <div className="space-y-2.5 pt-1">
                {displayedMunicipiosRanking.map((m, idx) => {
                  const widthPercent = (m.totalDirigentes / maxDirigentesMunicipio) * 100;
                  const isZero = m.totalDirigentes === 0;

                  return (
                    <div
                      key={m.id}
                      className="p-2.5 rounded-xl border border-slate-100 hover:border-slate-300 hover:bg-slate-50/70 transition"
                    >
                      <div className="flex items-center justify-between text-xs mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-md bg-slate-100 text-slate-700 font-mono font-bold flex items-center justify-center text-[10px]">
                            #{idx + 1}
                          </span>
                          <span className="font-bold text-slate-900 text-sm">
                            {m.nombre}
                          </span>
                          <span className="text-slate-400 text-xs">
                            ({m.departamento} • {m.zonaElectoral})
                          </span>
                          {m.cabecera && (
                            <span className="bg-blue-50 text-blue-700 text-[9px] px-1.5 py-0.2 rounded font-bold border border-blue-200">
                              Cabecera
                            </span>
                          )}
                          {m.nota && (
                            <span className="bg-amber-50 text-amber-800 text-[9px] px-1.5 py-0.2 rounded font-bold border border-amber-200">
                              {m.nota}
                            </span>
                          )}
                        </div>

                        <div className="font-bold text-slate-900 font-mono text-sm bg-slate-100 px-2 py-0.5 rounded">
                          {m.totalDirigentes}
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                        {!isZero ? (
                          <div
                            style={{ width: `${Math.max(widthPercent, 5)}%` }}
                            className="bg-gradient-to-r from-blue-600 to-indigo-600 h-full rounded-full transition-all duration-500"
                          />
                        ) : (
                          <div className="h-full w-full bg-amber-50 border border-dashed border-amber-200 flex items-center px-2 text-[10px] text-amber-700">
                            Pendiente de carga de autoridades partidarias
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* 3. GRÁFICO POR DEPARTAMENTO */}
        {activeDashboardTab === 'departamentos' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-500">
              Despliegue y porcentaje de municipios cubiertos en los <strong>17 Departamentos</strong> de la Provincia de Misiones.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {statsPorDepartamento.map(d => {
                const isFull = d.cubiertos === d.totalMunicipios;
                return (
                  <div
                    key={d.departamento}
                    onClick={() => {
                      if (filterDepto === d.departamento) setFilterDepto('TODOS');
                      else setFilterDepto(d.departamento);
                    }}
                    className={`p-3 rounded-xl border transition cursor-pointer ${
                      filterDepto === d.departamento
                        ? 'border-indigo-500 bg-indigo-50/40 shadow-xs'
                        : 'border-slate-100 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-slate-900">
                        Depto. {d.departamento}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-800">
                        {d.totalDirigentes} {d.totalDirigentes === 1 ? 'dirigente' : 'dirigentes'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1.5">
                      <span>Municipios con presencia:</span>
                      <span className={isFull ? 'text-emerald-700 font-bold' : 'text-slate-700'}>
                        {d.cubiertos} de {d.totalMunicipios} ({d.porcentaje.toFixed(0)}%)
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${Math.max(d.porcentaje, 4)}%` }}
                        className={`h-full rounded-full transition-all duration-500 ${
                          isFull
                            ? 'bg-emerald-500'
                            : d.cubiertos > 0
                            ? 'bg-indigo-600'
                            : 'bg-slate-300'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Filter and Search Bar for Table */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Table className="w-4 h-4 text-sky-600" />
            Catálogo Oficial de los 79 Municipios
          </span>
          <span className="text-xs text-slate-500">
            Mostrando <strong>{filteredMunicipiosTable.length}</strong> municipios
          </span>
        </div>

        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Buscar municipio, departamento o zona..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="w-full md:w-60">
            <select
              value={filterDepto}
              onChange={e => setFilterDepto(e.target.value)}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos los Departamentos (17)</option>
              {DEPARTAMENTOS_MISIONES.map(d => (
                <option key={d} value={d}>
                  Depto. {d}
                </option>
              ))}
            </select>
          </div>

          <div className="w-full md:w-60">
            <select
              value={filterZona}
              onChange={e => setFilterZona(e.target.value)}
              className="w-full py-2 px-3 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todas las Zonas Electorales</option>
              {ZONAS_ELECTORALES.map(z => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button if any is set */}
        {(searchTerm || filterDepto !== 'TODOS' || filterZona !== 'TODOS') && (
          <div className="flex items-center justify-between pt-1 text-xs text-slate-500">
            <div className="flex items-center gap-2">
              <span>Filtros activos:</span>
              {filterDepto !== 'TODOS' && (
                <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-200">
                  Depto: {filterDepto}
                </span>
              )}
              {filterZona !== 'TODOS' && (
                <span className="bg-sky-50 text-sky-700 px-2 py-0.5 rounded-full border border-sky-200">
                  Zona: {filterZona}
                </span>
              )}
            </div>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterDepto('TODOS');
                setFilterZona('TODOS');
              }}
              className="text-blue-600 hover:underline cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* Catalog Header with View Mode Toggle */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Table className="w-4 h-4 text-sky-600" />
            <span>Catálogo Oficial de los 79 Municipios</span>
            <span className="bg-sky-100 text-sky-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
              {filteredMunicipiosTable.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Base oficial de referencia (Hoja 'Municipios' de Google Sheets, rango B2:B80).
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setCatalogViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer min-h-[36px] ${
              catalogViewMode === 'cards'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Vista en Tarjetas (Óptima para celulares)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Tarjetas</span>
          </button>

          <button
            type="button"
            onClick={() => setCatalogViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer min-h-[36px] ${
              catalogViewMode === 'table'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Vista en Tabla"
          >
            <List className="w-3.5 h-3.5" />
            <span>Tabla</span>
          </button>
        </div>
      </div>

      {/* Main Catalog Rendering: Cards or Table */}
      {catalogViewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredMunicipiosTable.map(m => {
            const count = countsPerMunicipio[m.nombre] || 0;
            return (
              <div
                key={m.id}
                className="bg-white rounded-2xl p-4 border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="font-mono text-xs font-bold text-slate-400">
                      #{m.id.toString().padStart(2, '0')}
                    </span>
                    {m.cabecera && (
                      <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        CABECERA
                      </span>
                    )}
                  </div>

                  <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>{m.nombre}</span>
                  </h4>

                  <p className="text-xs text-slate-600 mt-1 font-medium">
                    Depto. {m.departamento}
                  </p>

                  <div className="mt-2 flex flex-wrap items-center gap-1.5">
                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded-lg text-[11px] font-medium border border-slate-200">
                      {m.zonaElectoral}
                    </span>
                    <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-lg text-[11px] font-mono">
                      {m.circuitosEstimados} circ.
                    </span>
                  </div>

                  {m.nota && (
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2 font-medium">
                      {m.nota}
                    </p>
                  )}
                </div>

                <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 text-[11px]">Dirigentes:</span>
                  {count > 0 ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold text-xs">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{count} {count === 1 ? 'dirigente' : 'dirigentes'}</span>
                    </span>
                  ) : (
                    <span className="text-slate-400 text-xs italic bg-slate-50 px-2.5 py-1 rounded-full border border-dashed border-slate-200">
                      Sin carga aún
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-sky-900 text-white uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3">ID (Col A)</th>
                  <th className="py-3 px-3">Municipio (Col B)</th>
                  <th className="py-3 px-3">Departamento (Col C)</th>
                  <th className="py-3 px-3">Zona Electoral (Col D)</th>
                  <th className="py-3 px-3 text-center">Cabecera</th>
                  <th className="py-3 px-3 text-center">Circuitos Est.</th>
                  <th className="py-3 px-3 text-center bg-sky-950 text-sky-200">Dirigentes Cargados</th>
                  <th className="py-3 px-3">Observaciones / Creación</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredMunicipiosTable.map(m => {
                  const count = countsPerMunicipio[m.nombre] || 0;
                  return (
                    <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-slate-500">
                        #{m.id.toString().padStart(2, '0')}
                      </td>
                      <td className="py-3 px-3 font-bold text-slate-900 whitespace-nowrap">
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-sky-600" />
                          {m.nombre}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-700 whitespace-nowrap">
                        {m.departamento}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full text-[11px] font-medium border border-slate-200">
                          {m.zonaElectoral}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {m.cabecera ? (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            CABECERA
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-center font-mono font-medium text-slate-600">
                        {m.circuitosEstimados}
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap bg-sky-50/40">
                        {count > 0 ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold text-[11px]">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            {count} {count === 1 ? 'dirigente' : 'dirigentes'}
                          </span>
                        ) : (
                          <span className="inline-block text-slate-400 text-[11px] italic">
                            Sin carga
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {m.nota ? (
                          <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded text-[11px] font-medium">
                            {m.nota}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="p-3 bg-slate-50 border-t border-slate-200 text-slate-500 text-xs flex justify-between items-center">
            <span>Mostrando {filteredMunicipiosTable.length} de 79 municipios oficiales</span>
            <span className="text-[11px] font-mono">Total Departamentos: 17 • Zonas: 10</span>
          </div>
        </div>
      )}
    </div>
  );
};
