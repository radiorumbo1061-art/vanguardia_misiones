import React, { useState } from 'react';
import { 
  BookOpen, 
  Copy, 
  CheckCircle2, 
  Table, 
  Check, 
  Sparkles, 
  HelpCircle, 
  Calculator,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const FormulasDocView: React.FC = () => {
  const [copiedFormula, setCopiedFormula] = useState<string | null>(null);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedFormula(id);
    setTimeout(() => setCopiedFormula(null), 2500);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="bg-emerald-100 text-emerald-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Documentación Técnica Oficial
          </span>
          <span className="text-xs text-slate-500">Google Sheets Specification • Misiones 2026</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          Estructura de Columnas, Validaciones y Fórmulas
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Especificación detallada de campos, formatos nativos de Google Sheets, listas desplegables, auditoría por disparador y fórmulas dinámicas de cruce entre pestañas.
        </p>
      </div>

      {/* SECCIÓN 1: ESTRUCTURA EXACTA DE COLUMNAS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
            1
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            Estructura Exacta de Columnas por Pestaña
          </h2>
        </div>

        {/* TABLA 1: Directorio_General */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-sm flex items-center gap-2">
              <Table className="w-4 h-4 text-sky-400" />
              Pestaña 1: "Directorio_General" (Base Central de Carga)
            </span>
            <span className="text-xs text-slate-400">11 Columnas • Filas 2 a 1000+</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Columna</th>
                  <th className="py-2.5 px-3">Nombre Encabezado</th>
                  <th className="py-2.5 px-3">Tipo de Dato</th>
                  <th className="py-2.5 px-3">Formato / Validación</th>
                  <th className="py-2.5 px-3">Ancho Sugerido</th>
                  <th className="py-2.5 px-3">Propósito y Reglas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-blue-600">A</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">DNI</td>
                  <td className="py-2 px-3">Texto / Numérico</td>
                  <td className="py-2 px-3 font-mono text-[11px]">Formato "@" (Texto)</td>
                  <td className="py-2 px-3">100 px</td>
                  <td className="py-2 px-3">Documento Nacional de Identidad sin puntos (7-8 dígitos). Clave primaria de búsqueda.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-blue-600">B</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Nombre y Apellido</td>
                  <td className="py-2 px-3">Texto</td>
                  <td className="py-2 px-3">Obligatorio</td>
                  <td className="py-2 px-3">200 px</td>
                  <td className="py-2 px-3">Nombre completo del dirigente o candidato.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-blue-600">C</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Fecha de Nacimiento</td>
                  <td className="py-2 px-3">Fecha</td>
                  <td className="py-2 px-3 font-mono text-[11px]">dd/MM/yyyy</td>
                  <td className="py-2 px-3">130 px</td>
                  <td className="py-2 px-3">Permite calcular rango etario y perfil de padrón electoral.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-blue-600">D</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Teléfono</td>
                  <td className="py-2 px-3">Texto</td>
                  <td className="py-2 px-3 font-mono text-[11px]">Formato Internacional</td>
                  <td className="py-2 px-3">140 px</td>
                  <td className="py-2 px-3">Línea móvil o WhatsApp institucional (+54 9 376 / 3755 / etc.).</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-blue-600">E</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Dirección</td>
                  <td className="py-2 px-3">Texto</td>
                  <td className="py-2 px-3">Libre</td>
                  <td className="py-2 px-3">210 px</td>
                  <td className="py-2 px-3">Domicilio barrial, paraje, calle o punto de referencia territorial.</td>
                </tr>
                <tr className="bg-blue-50/40">
                  <td className="py-2 px-3 font-mono font-bold text-blue-700">F</td>
                  <td className="py-2 px-3 font-bold text-blue-900">Municipio</td>
                  <td className="py-2 px-3">Lista Desplegable</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-blue-800">=Municipios!$B$2:$B$80</td>
                  <td className="py-2 px-3">160 px</td>
                  <td className="py-2 px-3 font-medium text-blue-900">
                    <strong>Restricción estricta:</strong> Solo permite seleccionar uno de los 79 municipios oficiales de Misiones.
                  </td>
                </tr>
                <tr className="bg-indigo-50/40">
                  <td className="py-2 px-3 font-mono font-bold text-indigo-700">G</td>
                  <td className="py-2 px-3 font-bold text-indigo-900">Rol Principal</td>
                  <td className="py-2 px-3">Lista Desplegable</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-indigo-800">27 opciones oficiales</td>
                  <td className="py-2 px-3">190 px</td>
                  <td className="py-2 px-3 font-medium text-indigo-900">
                    <strong>5 Pilares de Campaña:</strong><br />
                    1) <em>Candidaturas:</em> Gobernador, Vice Gobernador, Senador Nacional, Diputado Nacional, Diputado Provincial, Candidato a Intendente, Vice Intendente, Candidato a Concejal, Convencional Constituyente, Defensor del Pueblo.<br />
                    2) <em>Comando y Legal:</em> Jefe de Campaña, Apoderado Legal, Responsable Económico-Financiero (Ley 26.215), Responsable de Comunicación y Prensa, Coordinador Digital y Redes.<br />
                    3) <em>Logística y Territorio:</em> Presidente de Mesa Política, Responsable de Logística, Coordinador de Movilización y Transporte, Referente Territorial, Voluntario / Militante.<br />
                    4) <em>Fiscalización:</em> Coordinador General de Fiscalización, Fiscal General, Fiscal de Mesa, Fiscal Suplente / Relevo, Fiscal Informático / Cómputos, Fiscal de Escrutinio Definitivo.<br />
                    5) <em>Padrón Partidario:</em> Afiliado al Partido.
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-blue-600">H</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Detalle / Sub-rol</td>
                  <td className="py-2 px-3">Texto</td>
                  <td className="py-2 px-3">Libre</td>
                  <td className="py-2 px-3">230 px</td>
                  <td className="py-2 px-3">Especificación de escuela asignada, número de sublema o circuito barrial.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-blue-600">I</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Estado</td>
                  <td className="py-2 px-3">Lista Desplegable</td>
                  <td className="py-2 px-3 font-mono text-[11px]">Confirmado, Activo...</td>
                  <td className="py-2 px-3">120 px</td>
                  <td className="py-2 px-3">Estado operativo con formato condicional de colores.</td>
                </tr>
                <tr className="bg-emerald-50/60 font-medium">
                  <td className="py-2 px-3 font-mono font-bold text-emerald-700">J</td>
                  <td className="py-2 px-3 font-bold text-emerald-950">Usuario Responsable</td>
                  <td className="py-2 px-3">Auditoría Automática</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-emerald-800">Escrito por onEdit(e)</td>
                  <td className="py-2 px-3">200 px</td>
                  <td className="py-2 px-3 text-emerald-900">
                    <strong>Auditoría:</strong> Correo del operador que cargó o modificó la fila. Protegido contra borrado manual.
                  </td>
                </tr>
                <tr className="bg-emerald-50/60 font-medium">
                  <td className="py-2 px-3 font-mono font-bold text-emerald-700">K</td>
                  <td className="py-2 px-3 font-bold text-emerald-950">Fecha y Hora de Carga</td>
                  <td className="py-2 px-3">Auditoría Automática</td>
                  <td className="py-2 px-3 font-mono text-[11px] text-emerald-800">dd/MM/yyyy HH:mm:ss</td>
                  <td className="py-2 px-3">160 px</td>
                  <td className="py-2 px-3 text-emerald-900">
                    <strong>Marca de tiempo:</strong> Timestamp exacto en zona horaria America/Argentina/Buenos_Aires.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLA 2: Municipios */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="bg-sky-900 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-sm flex items-center gap-2">
              <Table className="w-4 h-4 text-sky-300" />
              Pestaña 2: "Municipios" (Catálogo Maestro de los 79 Municipios de Misiones)
            </span>
            <span className="text-xs text-sky-200">7 Columnas • 80 Filas (1 Encabezado + 79 Municipios)</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Columna</th>
                  <th className="py-2 px-3">Nombre</th>
                  <th className="py-2 px-3">Tipo</th>
                  <th className="py-2 px-3">Ejemplo</th>
                  <th className="py-2 px-3">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-sky-700">A</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">ID</td>
                  <td className="py-2 px-3">Entero (1-79)</td>
                  <td className="py-2 px-3 font-mono">1, 2, ... 79</td>
                  <td className="py-2 px-3">Identificador secuencial del municipio.</td>
                </tr>
                <tr className="bg-sky-50/50">
                  <td className="py-2 px-3 font-mono font-bold text-sky-700">B</td>
                  <td className="py-2 px-3 font-bold text-sky-950">Municipio</td>
                  <td className="py-2 px-3">Texto Único</td>
                  <td className="py-2 px-3 font-semibold text-sky-900">"Posadas", "Oberá", "Dos Hermanas"</td>
                  <td className="py-2 px-3 text-sky-900">
                    <strong>Fuente del desplegable:</strong> Rango B2:B80 referenciado por la Columna F de Directorio_General.
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-sky-700">C</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Departamento</td>
                  <td className="py-2 px-3">Texto</td>
                  <td className="py-2 px-3">"Capital", "Guaraní", "Cainguás"</td>
                  <td className="py-2 px-3">Uno de los 17 departamentos provinciales de Misiones.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-sky-700">D</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Zona Electoral</td>
                  <td className="py-2 px-3">Texto</td>
                  <td className="py-2 px-3">"Zona Sur / Capital", "Zona Centro"</td>
                  <td className="py-2 px-3">Región de coordinación partidaria.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-sky-700">E</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Cabecera</td>
                  <td className="py-2 px-3">Texto (SI / NO)</td>
                  <td className="py-2 px-3">"SI"</td>
                  <td className="py-2 px-3">Indica si es ciudad cabecera departamental.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-sky-700">F</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Circuitos Estimados</td>
                  <td className="py-2 px-3">Entero</td>
                  <td className="py-2 px-3">32</td>
                  <td className="py-2 px-3">Cantidad aproximada de circuitos de votación.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-sky-700">G</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Observaciones</td>
                  <td className="py-2 px-3">Texto</td>
                  <td className="py-2 px-3">"Municipio Nº 79 (2024)"</td>
                  <td className="py-2 px-3">Notas legislativas sobre creación reciente o parajes.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* TABLA 3: Usuarios_Autorizados */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="bg-purple-950 text-white px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-sm flex items-center gap-2">
              <Table className="w-4 h-4 text-purple-300" />
              Pestaña 3: "Usuarios_Autorizados" (Control de Operadores)
            </span>
            <span className="text-xs text-purple-300">8 Columnas • Hoja Ocultable o Protegida</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
                <tr>
                  <th className="py-2 px-3">Columna</th>
                  <th className="py-2 px-3">Nombre</th>
                  <th className="py-2 px-3">Tipo</th>
                  <th className="py-2 px-3">Ejemplo</th>
                  <th className="py-2 px-3">Descripción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-600">
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-purple-700">A</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">ID Usuario</td>
                  <td className="py-2 px-3">Texto</td>
                  <td className="py-2 px-3 font-mono">"USR-001"</td>
                  <td className="py-2 px-3">Identificador interno del operador.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-purple-700">B</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Correo Electrónico</td>
                  <td className="py-2 px-3">Email</td>
                  <td className="py-2 px-3">operador.obera@misiones.partido.ar</td>
                  <td className="py-2 px-3">Usuario utilizado para autenticar en el login modal.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-purple-700">C</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Nombre y Apellido</td>
                  <td className="py-2 px-3">Texto</td>
                  <td className="py-2 px-3">Esteban Hillebrand</td>
                  <td className="py-2 px-3">Nombre del responsable de carga.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-purple-700">D</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Contraseña (Hash)</td>
                  <td className="py-2 px-3">Hash SHA-256</td>
                  <td className="py-2 px-3 font-mono text-[10px]">5e884898da280471...</td>
                  <td className="py-2 px-3">Hash cifrado de seguridad contra accesos no autorizados.</td>
                </tr>
                <tr className="bg-purple-50/50">
                  <td className="py-2 px-3 font-mono font-bold text-purple-700">E</td>
                  <td className="py-2 px-3 font-bold text-purple-950">Municipio Asignado</td>
                  <td className="py-2 px-3">Texto / Desplegable</td>
                  <td className="py-2 px-3 font-semibold text-purple-900">"Oberá" o "TODOS"</td>
                  <td className="py-2 px-3 text-purple-900">
                    Jurisdicción municipal permitida para este operador.
                  </td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-purple-700">F</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Rol Sistema</td>
                  <td className="py-2 px-3">Texto</td>
                  <td className="py-2 px-3 font-medium text-purple-900">"Operador Universal", "Administrador General", "Coordinador Zonal", "Operador Municipal"</td>
                  <td className="py-2 px-3">Nivel de privilegio. El Operador Universal posee permisos de alta y baja de operadores y acceso total a los 79 municipios.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-purple-700">G</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Estado</td>
                  <td className="py-2 px-3">Texto</td>
                  <td className="py-2 px-3">"Activo" / "Suspendido"</td>
                  <td className="py-2 px-3">Permite habilitar o deshabilitar operadores al instante.</td>
                </tr>
                <tr>
                  <td className="py-2 px-3 font-mono font-bold text-purple-700">H</td>
                  <td className="py-2 px-3 font-semibold text-slate-900">Último Acceso</td>
                  <td className="py-2 px-3">Timestamp</td>
                  <td className="py-2 px-3 font-mono">20/10/2026 09:15:22</td>
                  <td className="py-2 px-3">Actualizado automáticamente en cada login exitoso.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: FÓRMULAS DE VALIDACIÓN Y CRUCE EN GOOGLE SHEETS */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs">
            2
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            Fórmulas de Validación y Automatización en Google Sheets
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Card 1: Validación de Municipio */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="bg-blue-100 text-blue-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase">
                Validación de Celda (Columna F)
              </span>
              <button
                onClick={() => copyToClipboard('=Municipios!$B$2:$B$80', 'val-mun')}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
              >
                {copiedFormula === 'val-mun' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Rango</span>
              </button>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Restricción Desplegable de 79 Municipios
            </h3>
            <p className="text-xs text-slate-600">
              En Google Sheets: selecciona las celdas <code className="bg-slate-100 px-1 py-0.5 rounded text-blue-700">F2:F1000</code> &gt; Datos &gt; Validación de datos &gt; Criterio: "Lista a partir de un intervalo".
            </p>
            <div className="bg-slate-900 text-sky-300 font-mono text-xs p-3 rounded-xl border border-slate-800 flex items-center justify-between">
              <code>=Municipios!$B$2:$B$80</code>
            </div>
            <p className="text-[11px] text-slate-500">
              Configurar con "Rechazar entrada" y "Mostrar botón de lista desplegable en la celda".
            </p>
          </div>

          {/* Card 2: Validación de Rol Principal */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="bg-indigo-100 text-indigo-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase">
                Validación de Celda (Columna G)
              </span>
              <button
                onClick={() => copyToClipboard('Presidente de Mesa Política, Candidato a Intendente, Candidato a Concejal, Referente Territorial, Afiliado al Partido', 'val-rol')}
                className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
              >
                {copiedFormula === 'val-rol' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Lista</span>
              </button>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Restricción Desplegable de Roles Principales
            </h3>
            <p className="text-xs text-slate-600">
              En Google Sheets: selecciona <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-700">G2:G1000</code> &gt; Datos &gt; Validación de datos &gt; Criterio: "Lista de elementos".
            </p>
            <div className="bg-slate-900 text-indigo-300 font-mono text-xs p-3 rounded-xl border border-slate-800 break-all">
              <code>Presidente de Mesa Política, Candidato a Intendente, Candidato a Concejal, Referente Territorial, Afiliado al Partido</code>
            </div>
            <p className="text-[11px] text-slate-500">
              Garantiza que no existan discrepancias tipográficas en la clasificación electoral.
            </p>
          </div>

          {/* Card 3: Cruce Dinámico XLOOKUP / BUSCARV */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="bg-purple-100 text-purple-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase">
                Fórmula de Cruce de Datos
              </span>
              <button
                onClick={() => copyToClipboard('=BUSCARV(F2; Municipios!$B$2:$D$80; 2; FALSO)', 'f-lookup')}
                className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1 cursor-pointer"
              >
                {copiedFormula === 'f-lookup' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Fórmula</span>
              </button>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Obtener Departamento Automáticamente
            </h3>
            <p className="text-xs text-slate-600">
              Si se desea agregar una columna calculada de Departamento en Directorio_General basada en el municipio seleccionado:
            </p>
            <div className="bg-slate-900 text-purple-300 font-mono text-xs p-3 rounded-xl border border-slate-800">
              <code>=BUSCARV(F2; Municipios!$B$2:$D$80; 2; FALSO)</code>
            </div>
            <p className="text-[11px] text-slate-500">
              O con la moderna <code className="font-mono">=XLOOKUP(F2; Municipios!$B$2:$B$80; Municipios!$C$2:$C$80; "No encontrado")</code>.
            </p>
          </div>

          {/* Card 4: Conteo de Dirigentes por Municipio en Hoja Municipios */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2 py-0.5 rounded-full uppercase">
                Métricas Electorales (Hoja Municipios)
              </span>
              <button
                onClick={() => copyToClipboard('=CONTAR.SI(Directorio_General!$F$2:$F$1000; B2)', 'f-count')}
                className="text-xs text-emerald-600 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
              >
                {copiedFormula === 'f-count' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Fórmula</span>
              </button>
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Total de Dirigentes por Municipio
            </h3>
            <p className="text-xs text-slate-600">
              Colocada en la columna de conteo de la hoja <em>Municipios</em> para monitorear qué localidades tienen cobertura partidaria:
            </p>
            <div className="bg-slate-900 text-emerald-300 font-mono text-xs p-3 rounded-xl border border-slate-800">
              <code>=CONTAR.SI(Directorio_General!$F$2:$F$1000; B2)</code>
            </div>
            <p className="text-[11px] text-slate-500">
              Para contar solo los confirmados: <code className="font-mono text-emerald-600">=CONTAR.SI.CONJUNTO(Directorio_General!$F$2:$F$1000; B2; Directorio_General!$I$2:$I$1000; "Confirmado")</code>.
            </p>
          </div>
        </div>
      </div>

      {/* SECCIÓN 3: REGLAS DE FORMATO CONDICIONAL POR COLOR */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
            3
          </span>
          <h2 className="text-lg font-bold text-slate-900">
            Reglas de Formato Condicional en Google Sheets
          </h2>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
          <p className="text-xs text-slate-600 mb-4">
            Seleccionar el rango <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-800 font-mono">I2:I1000</code> en <em>Directorio_General</em> &gt; Menú Formato &gt; Formato condicional &gt; "El texto es exactamente":
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-emerald-300 bg-emerald-50 text-emerald-900 space-y-1">
              <span className="font-bold text-sm block">1. "Confirmado"</span>
              <p className="text-[11px] text-emerald-800">Fondo: <code className="font-mono font-bold">#DCFCE7</code></p>
              <p className="text-[11px] text-emerald-800">Texto: <code className="font-mono font-bold">#15803D</code></p>
              <span className="text-[10px] text-emerald-700 block italic">Listo para mesa electoral</span>
            </div>

            <div className="p-3 rounded-xl border border-blue-300 bg-blue-50 text-blue-900 space-y-1">
              <span className="font-bold text-sm block">2. "Activo"</span>
              <p className="text-[11px] text-blue-800">Fondo: <code className="font-mono font-bold">#E0F2FE</code></p>
              <p className="text-[11px] text-blue-800">Texto: <code className="font-mono font-bold">#0369A1</code></p>
              <span className="text-[10px] text-blue-700 block italic">Militante / referente operativo</span>
            </div>

            <div className="p-3 rounded-xl border border-amber-300 bg-amber-50 text-amber-900 space-y-1">
              <span className="font-bold text-sm block">3. "En Revisión"</span>
              <p className="text-[11px] text-amber-800">Fondo: <code className="font-mono font-bold">#FEF9C3</code></p>
              <p className="text-[11px] text-amber-800">Texto: <code className="font-mono font-bold">#A16207</code></p>
              <span className="text-[10px] text-amber-700 block italic">Pendiente validación de DNI</span>
            </div>

            <div className="p-3 rounded-xl border border-red-300 bg-red-50 text-red-900 space-y-1">
              <span className="font-bold text-sm block">4. "Baja"</span>
              <p className="text-[11px] text-red-800">Fondo: <code className="font-mono font-bold">#FEE2E2</code></p>
              <p className="text-[11px] text-red-800">Texto: <code className="font-mono font-bold">#B91C1C</code></p>
              <span className="text-[10px] text-red-700 block italic">Desafectado de la campaña</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
