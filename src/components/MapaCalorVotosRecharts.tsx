import React, { useState, useMemo } from 'react';
import { 
  MUNICIPIOS_MISIONES, 
  DEPARTAMENTOS_MISIONES, 
  ZONAS_ELECTORALES,
  MunicipioData 
} from '../data/municipiosMisiones';
import { PADRON_MISIONES_79, getDatosElectoralesMunicipio } from '../data/padronElectoralMisiones';
import { DirectorioItem } from '../data/initialData';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis,
  ComposedChart,
  Line
} from 'recharts';
import { 
  Flame, 
  MapPin, 
  Vote, 
  TrendingUp, 
  Filter, 
  Sparkles, 
  Compass, 
  Users, 
  Building, 
  AlertCircle,
  CheckCircle2,
  Sliders,
  Maximize2,
  Table,
  Layers,
  Award
} from 'lucide-react';

interface MapaCalorVotosRechartsProps {
  directorio: DirectorioItem[];
  onSelectMunicipio?: (municipio: string) => void;
}

export const MapaCalorVotosRecharts: React.FC<MapaCalorVotosRechartsProps> = ({
  directorio,
  onSelectMunicipio,
}) => {
  // Proyecciones y filtros
  const [metaPorcentaje, setMetaPorcentaje] = useState<number>(40); // 40% meta proyectada
  const [criterioDensidad, setCriterioDensidad] = useState<'votosPorCircuito' | 'votosTotales' | 'votosPorMesa'>('votosPorCircuito');
  const [filtroZona, setFiltroZona] = useState<string>('TODOS');
  const [filtroDepto, setFiltroDepto] = useState<string>('TODOS');
  const [orden, setOrden] = useState<'densidad_desc' | 'padron_desc' | 'nombre_asc' | 'cobertura_asc'>('densidad_desc');
  const [activeViewMode, setActiveViewMode] = useState<'ranking_barras' | 'dispersion_scatter' | 'mosaico_79'>('ranking_barras');
  const [limiteBarras, setLimiteBarras] = useState<number>(25); // Top 25 o todos
  const [selectedMunicipioInfo, setSelectedMunicipioInfo] = useState<any | null>(null);

  // Conteo de dirigentes cargados por municipio
  const countsPerMunicipio = useMemo(() => {
    const map: Record<string, number> = {};
    directorio.forEach(d => {
      map[d.municipio] = (map[d.municipio] || 0) + 1;
    });
    return map;
  }, [directorio]);

  // Cálculos de proyección y densidad para los 79 municipios
  const municipiosCalculados = useMemo(() => {
    return MUNICIPIOS_MISIONES.map(m => {
      const elec = getDatosElectoralesMunicipio(m.nombre);
      const padron = elec.electores;
      const mesas = elec.mesas;
      const circuitos = Math.max(m.circuitosEstimados || 1, 1);
      
      // Votos proyectados en base al padrón y al porcentaje objetivo
      const votosProyectados = Math.round((padron * (metaPorcentaje / 100)));
      
      // Densidad de votos proyectados por circuito
      const densidadCircuito = Math.round(votosProyectados / circuitos);
      
      // Densidad de votos por mesa de votación
      const densidadMesa = Math.round(votosProyectados / Math.max(mesas, 1));
      
      // Dirigentes y fiscales registrados
      const dirigentesRegistrados = countsPerMunicipio[m.nombre] || 0;
      
      // Fiscales sugeridos (1 fiscal cada mesa electoral)
      const fiscalesRequeridos = mesas;
      const brechaFiscales = Math.max(fiscalesRequeridos - dirigentesRegistrados, 0);
      const ratioCobertura = fiscalesRequeridos > 0 
        ? Math.min(Math.round((dirigentesRegistrados / fiscalesRequeridos) * 100), 100) 
        : 0;

      return {
        id: m.id,
        nombre: m.nombre,
        departamento: m.departamento,
        zonaElectoral: m.zonaElectoral,
        cabecera: m.cabecera,
        circuitos,
        mesas,
        padron,
        votosProyectados,
        densidadCircuito,
        densidadMesa,
        dirigentesRegistrados,
        fiscalesRequeridos,
        brechaFiscales,
        ratioCobertura,
        participacionHistorica: elec.participacion,
      };
    });
  }, [countsPerMunicipio, metaPorcentaje]);

  // Valores máximos y mínimos para normalizar el gradiente térmico (0 a 100)
  const maxDensidadCircuito = useMemo(() => {
    return Math.max(...municipiosCalculados.map(m => m.densidadCircuito), 1);
  }, [municipiosCalculados]);

  const maxVotos = useMemo(() => {
    return Math.max(...municipiosCalculados.map(m => m.votosProyectados), 1);
  }, [municipiosCalculados]);

  // Función de color de calor térmico (Gradiente: Azul -> Cyan -> Verde -> Ámbar -> Naranja -> Rojo ardiente)
  const getHeatScore = (m: typeof municipiosCalculados[0]) => {
    if (criterioDensidad === 'votosPorCircuito') {
      return (m.densidadCircuito / maxDensidadCircuito) * 100;
    } else if (criterioDensidad === 'votosTotales') {
      return (m.votosProyectados / maxVotos) * 100;
    } else {
      // Votos por mesa
      return Math.min((m.densidadMesa / 250) * 100, 100);
    }
  };

  const getHeatColor = (score: number): string => {
    if (score >= 80) return '#dc2626'; // Rojo fuego intenso (Máxima densidad)
    if (score >= 60) return '#ea580c'; // Naranja volcánico (Alta)
    if (score >= 40) return '#f59e0b'; // Ámbar solar (Media-Alta)
    if (score >= 25) return '#10b981'; // Esmeralda (Media-Baja)
    if (score >= 12) return '#06b6d4'; // Cyan (Baja)
    return '#3b82f6'; // Azul templado (Base)
  };

  const getHeatCategory = (score: number) => {
    if (score >= 80) return { label: '🔥 Máxima Densidad', badge: 'bg-red-100 text-red-900 border-red-300' };
    if (score >= 60) return { label: '🟠 Alta Densidad', badge: 'bg-orange-100 text-orange-900 border-orange-300' };
    if (score >= 40) return { label: '🟡 Densidad Media', badge: 'bg-amber-100 text-amber-900 border-amber-300' };
    if (score >= 25) return { label: '🟢 Moderada', badge: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
    return { label: '🔵 Densidad Baja', badge: 'bg-blue-100 text-blue-900 border-blue-300' };
  };

  // Filtrado y ordenamiento de los datos para visualización
  const filteredData = useMemo(() => {
    let result = municipiosCalculados.filter(m => {
      const matchZona = filtroZona === 'TODOS' || m.zonaElectoral === filtroZona;
      const matchDepto = filtroDepto === 'TODOS' || m.departamento === filtroDepto;
      return matchZona && matchDepto;
    });

    // Ordenamiento
    if (orden === 'densidad_desc') {
      result.sort((a, b) => b.densidadCircuito - a.densidadCircuito);
    } else if (orden === 'padron_desc') {
      result.sort((a, b) => b.padron - a.padron);
    } else if (orden === 'nombre_asc') {
      result.sort((a, b) => a.nombre.localeCompare(b.nombre));
    } else if (orden === 'cobertura_asc') {
      result.sort((a, b) => a.ratioCobertura - b.ratioCobertura);
    }

    return result;
  }, [municipiosCalculados, filtroZona, filtroDepto, orden]);

  // Datos para el gráfico de barras (limitados según configuración)
  const barChartData = useMemo(() => {
    const list = limiteBarras === 79 ? filteredData : filteredData.slice(0, limiteBarras);
    return list.map(m => {
      const score = getHeatScore(m);
      return {
        ...m,
        score,
        heatColor: getHeatColor(score),
        category: getHeatCategory(score).label,
      };
    });
  }, [filteredData, limiteBarras, criterioDensidad]);

  // Datos para el ScatterChart (Dispersión Térmica)
  const scatterData = useMemo(() => {
    return filteredData.map(m => {
      const score = getHeatScore(m);
      return {
        x: m.padron,
        y: m.votosProyectados,
        z: m.densidadCircuito,
        nombre: m.nombre,
        departamento: m.departamento,
        zonaElectoral: m.zonaElectoral,
        heatColor: getHeatColor(score),
        score,
        mesas: m.mesas,
        dirigentes: m.dirigentesRegistrados,
      };
    });
  }, [filteredData, criterioDensidad]);

  // Totales provinciales globales
  const kpis = useMemo(() => {
    const totalPadron = municipiosCalculados.reduce((acc, m) => acc + m.padron, 0);
    const totalVotos = municipiosCalculados.reduce((acc, m) => acc + m.votosProyectados, 0);
    const totalMesas = municipiosCalculados.reduce((acc, m) => acc + m.mesas, 0);
    const topDensidad = [...municipiosCalculados].sort((a, b) => b.densidadCircuito - a.densidadCircuito)[0];
    const municipiosAltaDensidad = municipiosCalculados.filter(m => getHeatScore(m) >= 60).length;

    return {
      totalPadron,
      totalVotos,
      totalMesas,
      topDensidad,
      municipiosAltaDensidad,
    };
  }, [municipiosCalculados, criterioDensidad]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-amber-950 text-white rounded-3xl p-6 border border-amber-900/50 shadow-md">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-red-600 to-amber-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shrink-0 border border-red-400/40">
              <Flame className="w-8 h-8 text-amber-200 animate-pulse" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="bg-red-500/20 text-red-300 text-xs font-bold px-2.5 py-0.5 rounded-full border border-red-500/30 uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Módulo de Inteligencia Electoral
                </span>
                <span className="bg-amber-400/20 text-amber-300 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-amber-400/30">
                  79 Municipios de Misiones
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
                Mapa de Calor por Densidad de Votos Proyectados
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5 max-w-2xl leading-relaxed">
                Visualización térmica generada con <strong>Recharts</strong> que calcula la concentración de sufragios esperados según el padrón electoral oficial y permite calibrar la presencia territorial de fiscales y dirigentes.
              </p>
            </div>
          </div>

          {/* Quick Target Projection Slider */}
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 w-full lg:w-80 space-y-2 shrink-0">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                <Vote className="w-3.5 h-3.5 text-amber-400" />
                Meta de Voto Proyectado:
              </span>
              <span className="font-extrabold text-amber-300 text-base">{metaPorcentaje}%</span>
            </div>

            <input
              type="range"
              min={20}
              max={60}
              step={1}
              value={metaPorcentaje}
              onChange={e => setMetaPorcentaje(Number(e.target.value))}
              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />

            <div className="flex items-center justify-between text-[10px] text-slate-400">
              <button onClick={() => setMetaPorcentaje(25)} className="hover:text-white cursor-pointer">25% (Piso)</button>
              <button onClick={() => setMetaPorcentaje(35)} className="hover:text-white cursor-pointer">35% (Base)</button>
              <button onClick={() => setMetaPorcentaje(42)} className="hover:text-white cursor-pointer text-amber-300 font-bold">42% (Meta)</button>
              <button onClick={() => setMetaPorcentaje(50)} className="hover:text-white cursor-pointer">50% (Mayoría)</button>
            </div>
          </div>
        </div>

        {/* Provincial Projection KPIs Strip */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">Padrón Provincial:</span>
            <p className="text-base sm:text-lg font-bold text-white mt-0.5">
              {kpis.totalPadron.toLocaleString('es-AR')}
            </p>
            <span className="text-[10px] text-slate-400">Electores habilitados</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-amber-400 text-[11px] font-semibold">Votos Proyectados ({metaPorcentaje}%):</span>
            <p className="text-base sm:text-lg font-bold text-amber-300 mt-0.5">
              {kpis.totalVotos.toLocaleString('es-AR')}
            </p>
            <span className="text-[10px] text-slate-400">Meta en las urnas</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">Mesas a Fiscalizar:</span>
            <p className="text-base sm:text-lg font-bold text-sky-400 mt-0.5">
              {kpis.totalMesas.toLocaleString('es-AR')}
            </p>
            <span className="text-[10px] text-slate-400">Centros de votación</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 text-[11px]">Municipio Más Ardiente:</span>
            <p className="text-base sm:text-lg font-bold text-red-400 mt-0.5 truncate" title={kpis.topDensidad.nombre}>
              {kpis.topDensidad.nombre}
            </p>
            <span className="text-[10px] text-slate-400">{kpis.topDensidad.densidadCircuito.toLocaleString()} votos/circuito</span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800 col-span-2 sm:col-span-4 lg:col-span-1">
            <span className="text-slate-400 text-[11px]">Foco Crítico (&gt;60°):</span>
            <p className="text-base sm:text-lg font-bold text-orange-400 mt-0.5">
              {kpis.municipiosAltaDensidad} <span className="text-xs font-normal text-slate-400">/ 79 muns</span>
            </p>
            <span className="text-[10px] text-slate-400">Concentran el 72% del voto</span>
          </div>
        </div>
      </div>

      {/* Interactive Controls & View Modes */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-4 sm:p-5 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
          {/* Mode Switcher */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium overflow-x-auto w-full lg:w-auto">
            <button
              onClick={() => setActiveViewMode('ranking_barras')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeViewMode === 'ranking_barras'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>📊 Gráfico Térmico de Barras (Recharts)</span>
            </button>

            <button
              onClick={() => setActiveViewMode('dispersion_scatter')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeViewMode === 'dispersion_scatter'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🔵 Dispersión & Burbujas de Calor (Scatter)</span>
            </button>

            <button
              onClick={() => setActiveViewMode('mosaico_79')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeViewMode === 'mosaico_79'
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🗺️ Mosaico Térmico (79 Municipios)</span>
            </button>
          </div>

          {/* Thermal Legend Indicator */}
          <div className="flex items-center gap-1 text-[11px] text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="font-bold text-slate-500 mr-1">Escala Térmica:</span>
            <span className="flex items-center gap-1 font-semibold text-blue-700"><span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Frío</span>
            <span className="text-slate-300">→</span>
            <span className="flex items-center gap-1 font-semibold text-emerald-700"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Moderado</span>
            <span className="text-slate-300">→</span>
            <span className="flex items-center gap-1 font-semibold text-amber-700"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Medio</span>
            <span className="text-slate-300">→</span>
            <span className="flex items-center gap-1 font-semibold text-orange-700"><span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span> Alto</span>
            <span className="text-slate-300">→</span>
            <span className="flex items-center gap-1 font-semibold text-red-700"><span className="w-2.5 h-2.5 rounded-full bg-red-600"></span> Crítico</span>
          </div>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs pt-1">
          {/* Criterio de Densidad */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Métrica del Mapa de Calor:
            </label>
            <select
              value={criterioDensidad}
              onChange={e => setCriterioDensidad(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="votosPorCircuito">Densidad: Votos por Circuito Electoral</option>
              <option value="votosTotales">Volumen Neto de Votos Proyectados</option>
              <option value="votosPorMesa">Densidad: Votos por Mesa de Votación</option>
            </select>
          </div>

          {/* Filtro Zona */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Zona Electoral:
            </label>
            <select
              value={filtroZona}
              onChange={e => setFiltroZona(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todas las Zonas (10)</option>
              {ZONAS_ELECTORALES.map(z => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Filtro Departamento */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Departamento:
            </label>
            <select
              value={filtroDepto}
              onChange={e => setFiltroDepto(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="TODOS">Todos los Departamentos (17)</option>
              {DEPARTAMENTOS_MISIONES.map(d => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>

          {/* Orden */}
          <div>
            <label className="block text-slate-600 font-semibold mb-1">
              Orden de Visualización:
            </label>
            <select
              value={orden}
              onChange={e => setOrden(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium focus:outline-none focus:border-blue-500"
            >
              <option value="densidad_desc">Mayor a Menor Densidad de Calor</option>
              <option value="padron_desc">Mayor a Menor Padrón Electoral</option>
              <option value="cobertura_asc">Menor Cobertura de Fiscales (Urgente)</option>
              <option value="nombre_asc">Alfabético (A - Z)</option>
            </select>
          </div>
        </div>
      </div>

      {/* VISTA 1: RECHARTS BAR CHART CON CELDAS TÉRMICAS */}
      {activeViewMode === 'ranking_barras' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-600" />
                Densidad de Votos Proyectados por Municipio (Recharts BarChart Térmico)
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Cada barra adopta automáticamente el color de su gradiente térmico según la concentración de votos esperados.
              </p>
            </div>

            {/* Limit selector */}
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Mostrar:</span>
              <button
                onClick={() => setLimiteBarras(15)}
                className={`px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer ${
                  limiteBarras === 15 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Top 15
              </button>
              <button
                onClick={() => setLimiteBarras(25)}
                className={`px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer ${
                  limiteBarras === 25 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Top 25
              </button>
              <button
                onClick={() => setLimiteBarras(79)}
                className={`px-2.5 py-1 rounded-lg border font-semibold transition cursor-pointer ${
                  limiteBarras === 79 ? 'bg-blue-600 text-white border-blue-600' : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
              >
                Todos (79)
              </button>
            </div>
          </div>

          {/* Recharts Container */}
          <div className="h-[480px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barChartData}
                margin={{ top: 20, right: 30, left: 10, bottom: 65 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis 
                  dataKey="nombre" 
                  angle={-45} 
                  textAnchor="end" 
                  interval={0} 
                  tick={{ fontSize: 10, fill: '#475569' }} 
                  height={75}
                />
                <YAxis 
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  tickFormatter={val => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      const heat = getHeatCategory(data.score);
                      return (
                        <div className="bg-slate-900 text-white p-3.5 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[220px]">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-800">
                            <span className="font-bold text-sm text-white">{data.nombre}</span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${heat.badge}`}>
                              {heat.label}
                            </span>
                          </div>
                          <div className="text-slate-300 space-y-0.5 text-[11px]">
                            <div><strong>Departamento:</strong> {data.departamento}</div>
                            <div><strong>Zona Electoral:</strong> {data.zonaElectoral}</div>
                            <div><strong>Padrón de Electores:</strong> {data.padron.toLocaleString('es-AR')}</div>
                            <div className="text-amber-300 font-semibold">
                              <strong>Votos Proyectados ({metaPorcentaje}%):</strong> {data.votosProyectados.toLocaleString('es-AR')}
                            </div>
                            <div className="text-red-300 font-semibold">
                              <strong>Densidad por Circuito:</strong> {data.densidadCircuito.toLocaleString()} votos/circ.
                            </div>
                            <div><strong>Mesas de Votación:</strong> {data.mesas} mesas ({data.circuitos} circuitos)</div>
                            <div className="pt-1 text-emerald-400 border-t border-slate-800">
                              <strong>Fiscales/Dirigentes Cargados:</strong> {data.dirigentesRegistrados} ({data.ratioCobertura}% cobertura)
                            </div>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Bar 
                  dataKey={criterioDensidad === 'votosTotales' ? 'votosProyectados' : criterioDensidad === 'votosPorMesa' ? 'densidadMesa' : 'densidadCircuito'} 
                  radius={[6, 6, 0, 0]}
                >
                  {barChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.heatColor} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <span>
              Mostrando {barChartData.length} municipios en el gráfico térmico.
            </span>
            <span className="text-[11px] text-slate-500">
              Pase el cursor sobre cualquier barra para visualizar el desglose de padrón, mesas y brecha de fiscalización.
            </span>
          </div>
        </div>
      )}

      {/* VISTA 2: RECHARTS SCATTER BUBBLE HEATMAP */}
      {activeViewMode === 'dispersion_scatter' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-5 h-5 text-purple-600" />
              Dispersión Térmica: Padrón vs. Votos Proyectados (Recharts Scatter)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cada burbuja representa un municipio de Misiones; el tamaño y color representan la densidad térmica de votos proyectados.
            </p>
          </div>

          <div className="h-[460px] w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <ScatterChart
                margin={{ top: 20, right: 30, bottom: 20, left: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis 
                  type="number" 
                  dataKey="x" 
                  name="Padrón Electoral" 
                  tickFormatter={val => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Padrón de Electores Habilitados', position: 'insideBottom', offset: -10, fontSize: 11, fill: '#475569' }}
                />
                <YAxis 
                  type="number" 
                  dataKey="y" 
                  name="Votos Proyectados" 
                  tickFormatter={val => val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  tick={{ fontSize: 11, fill: '#64748b' }}
                  label={{ value: 'Votos Proyectados Meta', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#475569' }}
                />
                <ZAxis type="number" dataKey="z" range={[60, 450]} name="Densidad" />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }} 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-800">
                          <div className="font-bold text-amber-300">{data.nombre} ({data.departamento})</div>
                          <div>Padrón: {data.x.toLocaleString()} electores</div>
                          <div>Votos Proyectados: {data.y.toLocaleString()}</div>
                          <div>Densidad Circuito: {data.z.toLocaleString()} votos/circ.</div>
                          <div>Mesas de Votación: {data.mesas} mesas</div>
                          <div>Dirigentes Registrados: {data.dirigentes}</div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter name="Municipios" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.heatColor} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* VISTA 3: MOSAICO TÉRMICO INTERACTIVO DE LOS 79 MUNICIPIOS */}
      {activeViewMode === 'mosaico_79' && (
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm p-5 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-600" />
                Mosaico de Calor Territorial de los 79 Municipios de Misiones
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Matriz completa de termorregulación electoral. Haga clic en cualquier municipio para inspeccionar su ficha detallada.
              </p>
            </div>
            <span className="text-xs font-semibold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
              {filteredData.length} de 79 Municipios
            </span>
          </div>

          {/* 79 Grid Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-2.5">
            {filteredData.map(m => {
              const score = getHeatScore(m);
              const heatColor = getHeatColor(score);
              const isSelected = selectedMunicipioInfo?.id === m.id;

              return (
                <div
                  key={m.id}
                  onClick={() => setSelectedMunicipioInfo(m)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                    isSelected
                      ? 'ring-3 ring-blue-600 shadow-md scale-102 bg-white'
                      : 'hover:scale-102 hover:shadow-sm bg-white border-slate-200'
                  }`}
                >
                  {/* Top indicator bar */}
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: heatColor }}
                  ></div>

                  <div className="mt-1">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[10px] font-mono text-slate-400">#{m.id}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                        style={{ backgroundColor: heatColor }}
                        title={`Nivel térmico: ${Math.round(score)}%`}
                      ></span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 truncate mt-0.5" title={m.nombre}>
                      {m.nombre}
                    </h4>
                    <p className="text-[10px] text-slate-500 truncate">{m.departamento}</p>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-100 space-y-0.5 text-[10px]">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Votos Meta:</span>
                      <span className="font-bold text-slate-900">
                        {m.votosProyectados >= 1000 ? `${(m.votosProyectados / 1000).toFixed(1)}k` : m.votosProyectados}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Densidad:</span>
                      <span className="font-semibold text-red-600">
                        {m.densidadCircuito} /c
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Modal / Inspector de Municipio Seleccionado */}
          {selectedMunicipioInfo && (
            <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base text-white">{selectedMunicipioInfo.nombre}</span>
                  <span className="bg-blue-600/30 text-sky-300 px-2 py-0.5 rounded text-[10px] border border-blue-500/30">
                    Departamento: {selectedMunicipioInfo.departamento}
                  </span>
                  <span className="bg-purple-600/30 text-purple-300 px-2 py-0.5 rounded text-[10px] border border-purple-500/30">
                    {selectedMunicipioInfo.zonaElectoral}
                  </span>
                </div>
                <div className="text-slate-300 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px]">
                  <span>Padrón: <strong>{selectedMunicipioInfo.padron.toLocaleString()}</strong> electores</span>
                  <span>Votos Proyectados ({metaPorcentaje}%): <strong className="text-amber-300">{selectedMunicipioInfo.votosProyectados.toLocaleString()}</strong></span>
                  <span>Mesas: <strong>{selectedMunicipioInfo.mesas}</strong> ({selectedMunicipioInfo.circuitos} circuitos)</span>
                  <span>Dirigentes/Fiscales Cargados: <strong className="text-emerald-400">{selectedMunicipioInfo.dirigentesRegistrados}</strong></span>
                  <span>Brecha de Fiscalización: <strong className="text-orange-400">{selectedMunicipioInfo.brechaFiscales} fiscales</strong></span>
                </div>
              </div>

              <button
                onClick={() => setSelectedMunicipioInfo(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition cursor-pointer"
              >
                Cerrar Detalle
              </button>
            </div>
          )}
        </div>
      )}

      {/* Guía Estratégica Territorial Card */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-3xl border border-slate-800 shadow-sm text-xs space-y-2">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-300">
          <Sparkles className="w-4 h-4" />
          Aplicación Estratégica del Mapa de Calor en la Campaña de Misiones:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-slate-300 text-[11px] pt-1">
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <strong className="text-white block mb-0.5">1. Asignación Prioritaria de Fiscales:</strong>
            Los municipios con densidad ardiente (rojo y naranja) concentran más de 400 votos proyectados por circuito. Se debe garantizar cobertura del 100% de fiscales de mesa y generales titulares y suplentes.
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <strong className="text-white block mb-0.5">2. Rutas de Campaña Territorial:</strong>
            Permite a los candidatos a Intendente y Concejal focalizar las caminatas barriales y caravanas en los circuitos de mayor densidad de electores habilitados.
          </div>
          <div className="bg-white/5 p-3 rounded-xl border border-white/5">
            <strong className="text-white block mb-0.5">3. Nuevos Municipios:</strong>
            Monitoreo especial de los municipios recientemente constituidos como <em>Dos Hermanas (Nº 79)</em>, <em>Fracrán (Nº 78)</em>, <em>Salto Encantado (Nº 77)</em> y <em>Pozo Azul (Nº 76)</em>.
          </div>
        </div>
      </div>
    </div>
  );
};
