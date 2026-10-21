import React, { useMemo, useState } from 'react';
import { DirectorioItem } from '../data/initialData';
import { MUNICIPIOS_MISIONES, ZONAS_ELECTORALES } from '../data/municipiosMisiones';
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
  PieChart as RechartsPieChart,
  Pie,
  ComposedChart,
  Line
} from 'recharts';
import { 
  Users, 
  UserCheck, 
  MapPin, 
  TrendingUp, 
  Layers, 
  Compass, 
  Award, 
  ShieldCheck, 
  Vote, 
  Sparkles,
  PieChart as PieIcon,
  BarChart3,
  CheckCircle2
} from 'lucide-react';

interface ReporteDetalladoRechartsProps {
  directorio: DirectorioItem[];
  onSelectZona?: (zona: string) => void;
}

export const ReporteDetalladoRecharts: React.FC<ReporteDetalladoRechartsProps> = ({
  directorio,
  onSelectZona,
}) => {
  const [activeChartTab, setActiveChartTab] = useState<'densidad' | 'candidatos' | 'cobertura'>('densidad');

  // 1. Métricas clave calculadas
  const metrics = useMemo(() => {
    // Candidatos activos: Intendentes + Concejales con estado Confirmado o Activo
    const candidatosIntendenteActivos = directorio.filter(
      d => d.rolPrincipal === 'Candidato a Intendente' && (d.estado === 'Confirmado' || d.estado === 'Activo')
    ).length;

    const candidatosConcejalActivos = directorio.filter(
      d => d.rolPrincipal === 'Candidato a Concejal' && (d.estado === 'Confirmado' || d.estado === 'Activo')
    ).length;

    const totalCandidatosActivos = candidatosIntendenteActivos + candidatosConcejalActivos;

    // Afiliados al partido
    const totalAfiliados = directorio.filter(d => d.rolPrincipal === 'Afiliado al Partido').length;
    const afiliadosConfirmados = directorio.filter(
      d => d.rolPrincipal === 'Afiliado al Partido' && d.estado === 'Confirmado'
    ).length;

    // Autoridades de mesa
    const totalMesasPoliticas = directorio.filter(
      d => d.rolPrincipal === 'Presidente de Mesa Política'
    ).length;

    const totalReferentes = directorio.filter(
      d => d.rolPrincipal === 'Referente Territorial'
    ).length;

    // Densidad promedio provincial
    const densidadProvincial = Number((directorio.length / 79).toFixed(2));

    return {
      totalCandidatosActivos,
      candidatosIntendenteActivos,
      candidatosConcejalActivos,
      totalAfiliados,
      afiliadosConfirmados,
      totalMesasPoliticas,
      totalReferentes,
      densidadProvincial,
    };
  }, [directorio]);

  // 2. Data para Gráfico de Densidad por Zona Electoral
  const dataDensidadZonas = useMemo(() => {
    return ZONAS_ELECTORALES.map(zona => {
      const municipiosZona = MUNICIPIOS_MISIONES.filter(m => m.zonaElectoral === zona);
      const totalMunicipios = municipiosZona.length;
      const registrosZona = directorio.filter(d => {
        const mObj = MUNICIPIOS_MISIONES.find(m => m.nombre === d.municipio);
        return mObj ? mObj.zonaElectoral === zona : false;
      });

      const totalRegistros = registrosZona.length;
      const municipiosCubiertos = new Set(registrosZona.map(d => d.municipio)).size;
      const densidad = totalMunicipios > 0 ? Number((totalRegistros / totalMunicipios).toFixed(2)) : 0;
      const coberturaPct = totalMunicipios > 0 ? Math.round((municipiosCubiertos / totalMunicipios) * 100) : 0;

      // Candidatos activos en esta zona
      const candidatosActivosZona = registrosZona.filter(
        d => (d.rolPrincipal === 'Candidato a Intendente' || d.rolPrincipal === 'Candidato a Concejal') &&
             (d.estado === 'Confirmado' || d.estado === 'Activo')
      ).length;

      // Afiliados en esta zona
      const afiliadosZona = registrosZona.filter(d => d.rolPrincipal === 'Afiliado al Partido').length;

      // Short name for axis readability
      let shortName = zona
        .replace('Zona ', '')
        .replace(' / Capital', '/Cap');

      return {
        zona,
        shortName,
        densidad,
        totalRegistros,
        totalMunicipios,
        municipiosCubiertos,
        municipiosPendientes: totalMunicipios - municipiosCubiertos,
        coberturaPct,
        candidatosActivosZona,
        afiliadosZona,
      };
    }).sort((a, b) => b.densidad - a.densidad);
  }, [directorio]);

  // Zona líder en densidad
  const zonaMayorDensidad = dataDensidadZonas[0];

  // 3. Data para Desglose por Rol Principal y Candidatos
  const dataRoles = useMemo(() => {
    const rolesList = [
      { name: 'Vice Gobernador', color: '#d97706', short: 'Vice Gob.' },
      { name: 'Diputado Provincial', color: '#0284c7', short: 'Diputado' },
      { name: 'Candidato a Intendente', color: '#8b5cf6', short: 'Intendente' },
      { name: 'Vice Intendente', color: '#c026d3', short: 'Vice Int.' },
      { name: 'Candidato a Concejal', color: '#0ea5e9', short: 'Concejal' },
      { name: 'Defensor del Pueblo', color: '#7c3aed', short: 'Defensor' },
      { name: 'Presidente de Mesa Política', color: '#4f46e5', short: 'Mesa Política' },
      { name: 'Fiscal General', color: '#0d9488', short: 'Fiscal Gral.' },
      { name: 'Fiscal de Mesa', color: '#10b981', short: 'Fiscal Mesa' },
      { name: 'Referente Territorial', color: '#f59e0b', short: 'Referente' },
      { name: 'Afiliado al Partido', color: '#ec4899', short: 'Afiliado' },
    ];

    return rolesList.map(r => {
      const items = directorio.filter(d => d.rolPrincipal === r.name);
      const confirmados = items.filter(d => d.estado === 'Confirmado').length;
      const activos = items.filter(d => d.estado === 'Activo').length;
      const revision = items.filter(d => d.estado === 'En Revisión').length;
      const otros = items.length - confirmados - activos - revision;

      return {
        rol: r.short,
        fullRol: r.name,
        total: items.length,
        confirmados,
        activos,
        revision,
        otros,
        color: r.color,
      };
    });
  }, [directorio]);

  // Data for Donut Chart
  const dataDonutRoles = useMemo(() => {
    return dataRoles.map(r => ({
      name: r.rol,
      fullName: r.fullRol,
      value: r.total,
      color: r.color,
    }));
  }, [dataRoles]);

  // Custom Tooltip for Density
  const CustomDensityTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
          <p className="font-bold text-sky-400 text-sm border-b border-slate-700 pb-1">
            {d.zona}
          </p>
          <div className="pt-1 space-y-0.5">
            <p className="text-slate-200">
              <span className="text-slate-400">Densidad Electoral: </span>
              <strong className="text-emerald-400 font-mono text-sm">{d.densidad}</strong> registros / municipio
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Total de Registros: </span>
              <strong>{d.totalRegistros} dirigentes</strong>
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Cobertura: </span>
              {d.municipiosCubiertos} de {d.totalMunicipios} municipios ({d.coberturaPct}%)
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Candidatos Activos: </span>
              <strong className="text-purple-300">{d.candidatosActivosZona}</strong>
            </p>
            <p className="text-slate-300">
              <span className="text-slate-400">Afiliados Registrados: </span>
              <strong className="text-amber-300">{d.afiliadosZona}</strong>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  // Custom Tooltip for Roles
  const CustomRoleTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1">
          <p className="font-bold text-white text-sm border-b border-slate-700 pb-1">
            {d.fullRol || d.name}
          </p>
          <div className="pt-1 space-y-0.5">
            <p className="text-slate-200">
              <span className="text-slate-400">Total Registrados: </span>
              <strong className="text-white text-sm">{d.total || d.value}</strong>
            </p>
            {d.confirmados !== undefined && (
              <>
                <p className="text-emerald-400">
                  <span>Confirmados: </span>
                  <strong>{d.confirmados}</strong>
                </p>
                <p className="text-sky-400">
                  <span>Activos: </span>
                  <strong>{d.activos}</strong>
                </p>
                <p className="text-amber-400">
                  <span>En Revisión: </span>
                  <strong>{d.revision}</strong>
                </p>
              </>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards: Densidad y Candidatos Activos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Metric 1: Candidatos Activos */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/50 p-4 rounded-2xl border border-purple-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-purple-900 uppercase tracking-wider">
              Candidatos Activos
            </span>
            <div className="w-7 h-7 rounded-lg bg-purple-600 text-white flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-purple-950 mt-2">
            {metrics.totalCandidatosActivos}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-purple-800">
            <span>{metrics.candidatosIntendenteActivos} intendentes</span>
            <span>•</span>
            <span>{metrics.candidatosConcejalActivos} concejales</span>
          </div>
        </div>

        {/* Metric 2: Afiliados al Partido */}
        <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-2xl border border-amber-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-900 uppercase tracking-wider">
              Afiliados al Partido
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-amber-950 mt-2">
            {metrics.totalAfiliados}
          </p>
          <div className="flex items-center gap-1.5 mt-1 text-[11px] text-amber-800">
            <span className="font-medium text-emerald-700">
              {metrics.afiliadosConfirmados} confirmados
            </span>
            <span>•</span>
            <span>Padrón partidario</span>
          </div>
        </div>

        {/* Metric 3: Densidad Media Provincial */}
        <div className="bg-gradient-to-br from-blue-50 to-sky-50/50 p-4 rounded-2xl border border-blue-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-900 uppercase tracking-wider">
              Densidad Promedio
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-blue-950 mt-2">
            {metrics.densidadProvincial}
          </p>
          <div className="mt-1 text-[11px] text-blue-800">
            <span>Registros por municipio (base de 79)</span>
          </div>
        </div>

        {/* Metric 4: Zona con Mayor Densidad */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 p-4 rounded-2xl border border-emerald-200/80 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
              Mayor Densidad
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
          </div>
          <p className="text-base font-bold text-emerald-950 mt-2 truncate" title={zonaMayorDensidad?.zona}>
            {zonaMayorDensidad?.zona || 'Sin datos'}
          </p>
          <div className="mt-1 text-[11px] text-emerald-800">
            <strong className="font-bold">{zonaMayorDensidad?.densidad || 0}</strong> reg/mun ({zonaMayorDensidad?.totalRegistros || 0} total)
          </div>
        </div>
      </div>

      {/* Chart View Selector & Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4" />
              Gráficos Interactivos Recharts
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              Reporte Analítico Territorial de Misiones
            </h3>
          </div>

          {/* Toggle between specific Recharts visual views */}
          <div className="flex items-center p-1 bg-slate-100 rounded-xl text-xs font-medium">
            <button
              type="button"
              onClick={() => setActiveChartTab('densidad')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeChartTab === 'densidad'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              1. Densidad por Zona
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('candidatos')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeChartTab === 'candidatos'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              2. Candidatos & Roles
            </button>
            <button
              type="button"
              onClick={() => setActiveChartTab('cobertura')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
                activeChartTab === 'cobertura'
                  ? 'bg-white text-blue-700 font-bold shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              3. Cobertura Municipal
            </button>
          </div>
        </div>

        {/* VISTA 1: Densidad de Registros por Zona Electoral (Recharts BarChart) */}
        {activeChartTab === 'densidad' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
              <p>
                <strong>Densidad Territorial:</strong> Cantidad promedio de dirigentes registrados por cada municipio perteneciente a la zona.
              </p>
              <span className="text-slate-400">Ordenado de mayor a menor densidad</span>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataDensidadZonas}
                  margin={{ top: 15, right: 20, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="shortName" 
                    tick={{ fontSize: 11, fill: '#475569' }} 
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#475569' }}
                    label={{ 
                      value: 'Densidad (Reg / Municipio)', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 11, fill: '#64748b' }
                    }} 
                  />
                  <Tooltip content={<CustomDensityTooltip />} />
                  <Bar 
                    dataKey="densidad" 
                    radius={[6, 6, 0, 0]} 
                    name="Densidad (Reg / Municipio)"
                  >
                    {dataDensidadZonas.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={index === 0 ? '#1d4ed8' : index < 3 ? '#2563eb' : '#60a5fa'}
                        className="cursor-pointer hover:opacity-80 transition-opacity"
                        onClick={() => onSelectZona && onSelectZona(entry.zona)}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-xs text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-2">
              <span>
                💡 <strong>Análisis:</strong> Las zonas con menor densidad (barras claras) requieren despliegue prioritario para emparejar la cobertura provincial.
              </span>
              <span className="font-mono text-[11px] text-slate-500">
                Librería: Recharts ResponsiveContainer + BarChart
              </span>
            </div>
          </div>
        )}

        {/* VISTA 2: Total de Candidatos y Roles Activos (BarChart + PieChart Recharts) */}
        {activeChartTab === 'candidatos' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Stacked Bar Chart by Role */}
              <div className="lg:col-span-7 space-y-3">
                <p className="text-xs font-semibold text-slate-700">
                  Distribución por Rol y Estado de Validación:
                </p>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dataRoles}
                      layout="vertical"
                      margin={{ top: 10, right: 25, left: 45, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 11, fill: '#475569' }} />
                      <YAxis 
                        type="category" 
                        dataKey="rol" 
                        tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 600 }} 
                      />
                      <Tooltip content={<CustomRoleTooltip />} />
                      <Legend 
                        wrapperStyle={{ fontSize: 11, paddingTop: 10 }}
                      />
                      <Bar dataKey="confirmados" stackId="a" fill="#10b981" name="Confirmados" />
                      <Bar dataKey="activos" stackId="a" fill="#0284c7" name="Activos" />
                      <Bar dataKey="revision" stackId="a" fill="#f59e0b" name="En Revisión" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Donut Chart */}
              <div className="lg:col-span-5 space-y-3 border-t lg:border-t-0 lg:border-l border-slate-100 lg:pl-6">
                <p className="text-xs font-semibold text-slate-700">
                  Proporción Global de la Estructura:
                </p>
                <div className="h-60 w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Pie
                        data={dataDonutRoles}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={3}
                      >
                        {dataDonutRoles.map((entry, index) => (
                          <Cell key={`cell-donut-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomRoleTooltip />} />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend list */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {dataDonutRoles.map((r) => (
                    <div key={r.name} className="flex items-center gap-1.5 text-slate-700">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: r.color }} />
                      <span className="truncate" title={r.fullName}>{r.name}:</span>
                      <strong className="font-mono text-slate-900">{r.value}</strong>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Candidate & Affiliate Detail Box */}
            <div className="p-4 rounded-xl bg-purple-50/70 border border-purple-200/80 text-xs text-purple-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <p className="font-bold text-sm text-purple-900 flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-purple-600" />
                  Total Candidatos Activos: {metrics.totalCandidatosActivos} dirigentes
                </p>
                <p className="text-purple-800 mt-0.5">
                  Incluye candidatos a Intendente y Concejales con avales operativos validados para los comicios de Misiones.
                </p>
              </div>
              <div className="bg-white px-3 py-1.5 rounded-lg border border-purple-200 text-purple-900 font-semibold shrink-0">
                Afiliados al Partido: {metrics.totalAfiliados}
              </div>
            </div>
          </div>
        )}

        {/* VISTA 3: Cobertura Municipal por Zona (BarChart Apilado Recharts) */}
        {activeChartTab === 'cobertura' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs text-slate-500">
              <p>
                Comparativa de municipios con dirigentes asignados vs municipios pendientes en cada zona electoral.
              </p>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Con Presencia
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300"></span> Pendientes
                </span>
              </div>
            </div>

            <div className="h-80 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dataDensidadZonas}
                  margin={{ top: 15, right: 20, left: 0, bottom: 25 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="shortName" 
                    tick={{ fontSize: 11, fill: '#475569' }} 
                    angle={-20}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis 
                    tick={{ fontSize: 11, fill: '#475569' }}
                    label={{ 
                      value: 'Cantidad de Municipios', 
                      angle: -90, 
                      position: 'insideLeft',
                      style: { textAnchor: 'middle', fontSize: 11, fill: '#64748b' }
                    }} 
                  />
                  <Tooltip content={<CustomDensityTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
                  <Bar dataKey="municipiosCubiertos" stackId="a" fill="#10b981" name="Municipios Cubiertos" />
                  <Bar dataKey="municipiosPendientes" stackId="a" fill="#cbd5e1" name="Municipios Pendientes" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
