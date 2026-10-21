import React, { useState, useRef } from 'react';
import { DirectorioItem, ROLES_PRINCIPALES, ESTADOS_DIRIGENTE, UsuarioAutorizado } from '../data/initialData';
import { MUNICIPIOS_MISIONES } from '../data/municipiosMisiones';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Download, 
  AlertCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingDirectorio: DirectorioItem[];
  onImportSuccess: (newItems: DirectorioItem[], updatedCount: number) => void;
  currentUser: UsuarioAutorizado;
}

interface ParsedRow {
  rowNumber: number;
  dni: string;
  nombreApellido: string;
  fechaNacimiento: string;
  telefono: string;
  direccion: string;
  municipio: string;
  rolPrincipal: string;
  detalleSubRol: string;
  estado: string;
  isValid: boolean;
  isDuplicateInFile: boolean;
  isDuplicateInDatabase: boolean;
  existingRecordName?: string;
  errors: string[];
}

export const CsvImportModal: React.FC<CsvImportModalProps> = ({
  isOpen,
  onClose,
  existingDirectorio,
  onImportSuccess,
  currentUser,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [csvRawText, setCsvRawText] = useState<string>('');
  const [activeInputMode, setActiveInputMode] = useState<'upload' | 'paste'>('upload');
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [hasParsed, setHasParsed] = useState(false);
  const [duplicatePolicy, setDuplicatePolicy] = useState<'skip' | 'overwrite' | 'reject'>('skip');
  const [parseError, setParseError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Set of valid municipality names (lowercased for flexible matching)
  const validMunicipiosMap = new Map<string, string>();
  MUNICIPIOS_MISIONES.forEach(m => {
    validMunicipiosMap.set(m.nombre.toLowerCase().trim(), m.nombre);
  });

  // Set of existing DNIs in database
  const existingDniMap = new Map<string, DirectorioItem>();
  existingDirectorio.forEach(item => {
    const cleanDni = item.dni.replace(/\D/g, '');
    if (cleanDni) existingDniMap.set(cleanDni, item);
  });

  // Download Sample CSV Template
  const handleDownloadTemplate = () => {
    const headers = [
      "DNI",
      "Nombre y Apellido",
      "Fecha de Nacimiento",
      "Teléfono",
      "Dirección",
      "Municipio",
      "Rol Principal",
      "Detalle / Sub-rol",
      "Estado"
    ];

    const sampleRows = [
      ["36123456", "Juan Ignacio Benítez", "1991-04-15", "+54 9 376 411-2233", "Av. San Martín 123", "Posadas", "Presidente de Mesa Política", "Escuela Nº 1", "Confirmado"],
      ["38990112", "Miriam Roxana Krause", "1994-08-22", "+54 9 3755 45-6677", "Calle Belgrano 450", "Oberá", "Candidato a Concejal", "Sublema Vecinal", "Confirmado"],
      ["40123899", "Marcos Daniel Sauer", "1997-11-03", "+54 9 3751 49-8800", "Km 9 Centro", "Eldorado", "Referente Territorial", "Zona Este", "Activo"],
      ["32456781", "Elena Noemí Da Silva", "1986-02-19", "+54 9 3757 42-1100", "Barrio Villa Alta", "Puerto Iguazú", "Presidente de Mesa Política", "Escuela Nº 675", "Confirmado"],
      ["42890123", "Franco Emanuel Antúnez", "2000-06-10", "+54 9 3741 42-9911", "Cruce Ruta 17", "Dos Hermanas", "Referente Territorial", "Municipio Nº 79", "Activo"],
      ["37123987", "Valeria Soledad Krawczyk", "1993-01-30", "+54 9 3755 41-0022", "Barrio Yerbal", "Campo Viera", "Afiliado al Partido", "Padrón Partidario Misiones", "Activo"]
    ];

    const csvContent = "data:text/csv;charset=utf-8," + 
      [headers.join(";"), ...sampleRows.map(r => r.join(";"))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Plantilla_Carga_Candidatos_Misiones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Process raw text into structured rows with strict DNI and format validation
  const processCsvText = (text: string) => {
    setParseError(null);
    if (!text.trim()) {
      setParseError("El contenido CSV está vacío.");
      return;
    }

    const lines = text.split(/\r\n|\n|\r/).filter(l => l.trim().length > 0);
    if (lines.length < 2) {
      setParseError("El archivo debe contener al menos una fila de encabezados y una fila de datos.");
      return;
    }

    // Detect delimiter: semicolon or comma or tab
    const firstLine = lines[0];
    let delimiter = ';';
    if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';
    else if (firstLine.includes(',') && !firstLine.includes(';')) delimiter = ',';
    else if (firstLine.includes('\t')) delimiter = '\t';
    else if ((firstLine.match(/;/g) || []).length >= (firstLine.match(/,/g) || []).length) delimiter = ';';
    else delimiter = ',';

    // Parse CSV line accounting for quoted fields
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let cur = '';
      let inQuotes = false;
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === delimiter && !inQuotes) {
          result.push(cur.trim().replace(/^"|"$/g, ''));
          cur = '';
        } else {
          cur += char;
        }
      }
      result.push(cur.trim().replace(/^"|"$/g, ''));
      return result;
    };

    const headerCols = parseLine(lines[0]).map(h => h.toLowerCase().trim());
    
    // Find column indexes
    let dniIdx = headerCols.findIndex(h => h.includes('dni') || h.includes('documento'));
    let nombreIdx = headerCols.findIndex(h => h.includes('nombre') || h.includes('apellido'));
    let fechaIdx = headerCols.findIndex(h => h.includes('nacimiento') || h.includes('fecha'));
    let telIdx = headerCols.findIndex(h => h.includes('tel') || h.includes('celular') || h.includes('whatsapp'));
    let dirIdx = headerCols.findIndex(h => h.includes('dir') || h.includes('domicilio') || h.includes('calle'));
    let munIdx = headerCols.findIndex(h => h.includes('mun') || h.includes('localidad') || h.includes('ciudad'));
    let rolIdx = headerCols.findIndex(h => h.includes('rol') || h.includes('cargo') || h.includes('funcion'));
    let subRolIdx = headerCols.findIndex(h => h.includes('sub') || h.includes('detalle') || h.includes('escuela') || h.includes('sublema'));
    let estadoIdx = headerCols.findIndex(h => h.includes('estado') || h.includes('status'));

    // Fallbacks if standard sequential order
    if (dniIdx === -1) dniIdx = 0;
    if (nombreIdx === -1) nombreIdx = 1;
    if (fechaIdx === -1) fechaIdx = 2;
    if (telIdx === -1) telIdx = 3;
    if (dirIdx === -1) dirIdx = 4;
    if (munIdx === -1) munIdx = 5;
    if (rolIdx === -1) rolIdx = 6;
    if (subRolIdx === -1) subRolIdx = 7;
    if (estadoIdx === -1) estadoIdx = 8;

    const fileDniSet = new Set<string>();
    const rows: ParsedRow[] = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = parseLine(lines[i]);
      if (cols.length === 0 || cols.every(c => c === '')) continue;

      const rawDni = (cols[dniIdx] || '').trim();
      const cleanDni = rawDni.replace(/\D/g, '');
      const nombre = (cols[nombreIdx] || '').trim();
      const fecha = (cols[fechaIdx] || '').trim();
      const tel = (cols[telIdx] || '').trim();
      const dir = (cols[dirIdx] || '').trim();
      const rawMun = (cols[munIdx] || '').trim();
      const rawRol = (cols[rolIdx] || '').trim();
      const subRol = (cols[subRolIdx] || '').trim();
      const rawEstado = (cols[estadoIdx] || 'Confirmado').trim();

      const errors: string[] = [];
      let isDuplicateInFile = false;
      let isDuplicateInDatabase = false;
      let existingRecordName: string | undefined = undefined;

      // 1. DNI VALIDATION & UNIQUENESS CHECK
      if (!cleanDni) {
        errors.push("DNI ausente o inválido.");
      } else if (cleanDni.length < 6 || cleanDni.length > 9) {
        errors.push(`DNI con longitud inusual (${cleanDni.length} dígitos).`);
      } else {
        // Check duplication in this file
        if (fileDniSet.has(cleanDni)) {
          isDuplicateInFile = true;
          errors.push(`DNI ${cleanDni} repetido dentro del mismo archivo CSV.`);
        } else {
          fileDniSet.add(cleanDni);
        }

        // Check duplication in existing database
        if (existingDniMap.has(cleanDni)) {
          isDuplicateInDatabase = true;
          const existItem = existingDniMap.get(cleanDni)!;
          existingRecordName = `${existItem.nombreApellido} (${existItem.municipio})`;
          errors.push(`DNI ya registrado en el sistema: pertenece a ${existItem.nombreApellido} en ${existItem.municipio}.`);
        }
      }

      // 2. Nombre
      if (!nombre) {
        errors.push("Nombre y Apellido es obligatorio.");
      }

      // 3. Municipio Validation against 79 official Misiones municipalities
      let matchedMunicipio = validMunicipiosMap.get(rawMun.toLowerCase());
      if (!matchedMunicipio) {
        // try partial match
        const found = MUNICIPIOS_MISIONES.find(m => 
          m.nombre.toLowerCase().includes(rawMun.toLowerCase()) || 
          rawMun.toLowerCase().includes(m.nombre.toLowerCase())
        );
        if (found) {
          matchedMunicipio = found.nombre;
        } else {
          errors.push(`Municipio "${rawMun}" no reconocido en el catálogo de los 79 municipios de Misiones.`);
        }
      }

      let matchedRol = ROLES_PRINCIPALES.find(r => r.toLowerCase() === rawRol.toLowerCase());
      if (!matchedRol) {
        const norm = rawRol.toLowerCase().replace(/[^a-z0-9]/g, '');
        if (norm.includes('vicegob') || norm.includes('vicegobernador') || norm.includes('vicegober')) {
          matchedRol = 'Vice Gobernador';
        } else if (norm === 'gobernador' || (norm.includes('goberna') && !norm.includes('vice'))) {
          matchedRol = 'Gobernador';
        } else if (norm.includes('diputadonac') || norm.includes('diputadanac') || norm.includes('nacional')) {
          matchedRol = 'Diputado Nacional';
        } else if (norm.includes('diputad')) {
          matchedRol = 'Diputado Provincial';
        } else if (norm.includes('jefecamp') || norm.includes('jefedecamp') || norm.includes('coordinadorgeneral')) {
          matchedRol = 'Jefe de Campaña';
        } else if (norm.includes('logist') || norm.includes('transporte')) {
          matchedRol = 'Responsable de Logística';
        } else if (norm.includes('informatic') || norm.includes('computo') || norm.includes('escrutinio')) {
          matchedRol = 'Fiscal Informático / Cómputos';
        } else if (norm.includes('apoderad') || norm.includes('legal') || norm.includes('juridic')) {
          matchedRol = 'Apoderado Legal';
        } else if (norm.includes('viceinten')) {
          matchedRol = 'Vice Intendente';
        } else if (norm.includes('defensor')) {
          matchedRol = 'Defensor del Pueblo';
        } else {
          const found = ROLES_PRINCIPALES.find(r => 
            r.toLowerCase().includes(rawRol.toLowerCase()) || 
            rawRol.toLowerCase().includes(r.toLowerCase())
          );
          matchedRol = found || 'Referente Territorial';
        }
      }

      // 5. Estado validation
      let matchedEstado = ESTADOS_DIRIGENTE.find(e => e.toLowerCase() === rawEstado.toLowerCase()) || 'Confirmado';

      // Format date if needed
      let formattedFecha = fecha;
      if (fecha.includes('/')) {
        const parts = fecha.split('/');
        if (parts.length === 3) {
          // If DD/MM/YYYY to YYYY-MM-DD
          if (parts[2].length === 4) {
            formattedFecha = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
          }
        }
      }

      const isValid = errors.filter(e => !e.includes('DNI repetido') && !e.includes('DNI ya registrado')).length === 0;

      rows.push({
        rowNumber: i + 1,
        dni: cleanDni || rawDni,
        nombreApellido: nombre,
        fechaNacimiento: formattedFecha,
        telefono: tel,
        direccion: dir,
        municipio: matchedMunicipio || rawMun,
        rolPrincipal: matchedRol,
        detalleSubRol: subRol,
        estado: matchedEstado,
        isValid,
        isDuplicateInFile,
        isDuplicateInDatabase,
        existingRecordName,
        errors,
      });
    }

    setParsedRows(rows);
    setHasParsed(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;

    setFile(uploadedFile);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvRawText(text);
      processCsvText(text);
    };
    reader.readAsText(uploadedFile);
  };

  const handleManualParse = () => {
    processCsvText(csvRawText);
  };

  // Counts of validation outcomes
  const stats = {
    total: parsedRows.length,
    valid: parsedRows.filter(r => r.isValid && !r.isDuplicateInFile && !r.isDuplicateInDatabase).length,
    duplicateInDb: parsedRows.filter(r => r.isDuplicateInDatabase).length,
    duplicateInFile: parsedRows.filter(r => r.isDuplicateInFile).length,
    hasErrors: parsedRows.filter(r => !r.isValid).length,
  };

  const getNowFormatted = () => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // Final Action: Execute Import
  const handleExecuteImport = () => {
    if (parsedRows.length === 0) return;

    if (duplicatePolicy === 'reject' && (stats.duplicateInDb > 0 || stats.duplicateInFile > 0)) {
      alert("No se puede importar: Hay DNIs duplicados y la política de importación seleccionada es 'Rechazar si hay duplicados'.");
      return;
    }

    const auditUser = currentUser.email;
    const auditTimestamp = getNowFormatted();
    const newItems: DirectorioItem[] = [];
    let updatedCount = 0;

    parsedRows.forEach((row, idx) => {
      if (!row.isValid) return; // skip rows with invalid required fields
      if (row.isDuplicateInFile && duplicatePolicy !== 'overwrite') return; // skip file dupes

      if (row.isDuplicateInDatabase) {
        if (duplicatePolicy === 'skip') {
          return; // skip existing
        } else if (duplicatePolicy === 'overwrite') {
          updatedCount += 1;
        }
      }

      newItems.push({
        id: `DIR-CSV-${Date.now().toString().slice(-4)}-${idx + 1}`,
        dni: row.dni,
        nombreApellido: row.nombreApellido,
        fechaNacimiento: row.fechaNacimiento || '1990-01-01',
        telefono: row.telefono || '-',
        direccion: row.direccion || '',
        municipio: row.municipio,
        rolPrincipal: row.rolPrincipal as DirectorioItem['rolPrincipal'],
        detalleSubRol: row.detalleSubRol,
        estado: row.estado as DirectorioItem['estado'],
        usuarioResponsable: auditUser,
        fechaHoraCarga: auditTimestamp,
      });
    });

    onImportSuccess(newItems, updatedCount);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl p-4 sm:p-6 relative my-4 sm:my-6 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                Importador Masivo CSV
              </span>
              <span className="text-xs text-slate-500">Validador de DNI Único y Catálogo de 79 Municipios</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 mt-1 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
              Carga Masiva de Candidatos y Dirigentes
            </h3>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
            aria-label="Cerrar modal de importación"
          >
            ✕
          </button>
        </div>

        {/* Content Body (Scrollable) */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4 pr-1">
          {/* Step 1: Template and Input Mode */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div>
              <p className="font-semibold text-slate-900">
                ¿Aún no tienes el archivo con el formato exacto?
              </p>
              <p className="text-slate-500 mt-0.5">
                Descarga la plantilla oficial con encabezados compatibles y 5 ejemplos de dirigentes de Misiones.
              </p>
            </div>
            <button
              onClick={handleDownloadTemplate}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-semibold transition shrink-0 cursor-pointer shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Descargar Plantilla CSV</span>
            </button>
          </div>

          {/* Mode Switcher: Upload File or Paste Text */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-2 text-xs font-semibold">
            <button
              onClick={() => setActiveInputMode('upload')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeInputMode === 'upload'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Subir Archivo .CSV</span>
            </button>
            <button
              onClick={() => setActiveInputMode('paste')}
              className={`px-3 py-1.5 rounded-lg transition cursor-pointer flex items-center gap-1.5 ${
                activeInputMode === 'paste'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Pegar Texto CSV / Excel</span>
            </button>
          </div>

          {activeInputMode === 'upload' ? (
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-300 hover:border-blue-500 bg-slate-50/50 hover:bg-blue-50/30 rounded-2xl p-6 text-center cursor-pointer transition space-y-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={handleFileUpload}
              />
              <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto">
                <UploadCloud className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-slate-800">
                {file ? `Archivo seleccionado: ${file.name}` : 'Haz clic para seleccionar o arrastra tu archivo .CSV aquí'}
              </p>
              <p className="text-xs text-slate-500">
                Soporta delimitadores por coma (,), punto y coma (;) o tabulaciones
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <textarea
                rows={5}
                value={csvRawText}
                onChange={e => setCsvRawText(e.target.value)}
                placeholder="Pega aquí las filas de tu CSV o copia directamente las celdas desde Excel o Google Sheets..."
                className="w-full p-3 font-mono text-xs border border-slate-300 rounded-xl focus:outline-none focus:border-blue-500 bg-white"
              />
              <button
                onClick={handleManualParse}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold rounded-xl transition cursor-pointer flex items-center gap-1.5"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Analizar y Validar Contenido</span>
              </button>
            </div>
          )}

          {parseError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {parseError}
            </div>
          )}

          {/* PARSED PREVIEW & VALIDATION SUMMARY */}
          {hasParsed && (
            <div className="space-y-4 pt-2">
              {/* Duplicate Handling Policy Bar */}
              <div className="bg-slate-900 text-white p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Control de Unicidad de DNI:</span>
                  <span className="font-semibold text-white">¿Qué hacer si un DNI ya existe en la base?</span>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setDuplicatePolicy('skip')}
                    className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                      duplicatePolicy === 'skip'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Omitir Duplicados ({stats.duplicateInDb})
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuplicatePolicy('overwrite')}
                    className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                      duplicatePolicy === 'overwrite'
                        ? 'bg-amber-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Actualizar / Sobrescribir
                  </button>
                  <button
                    type="button"
                    onClick={() => setDuplicatePolicy('reject')}
                    className={`px-2.5 py-1 rounded text-xs transition cursor-pointer ${
                      duplicatePolicy === 'reject'
                        ? 'bg-red-600 text-white font-bold'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Rechazar Todo
                  </button>
                </div>
              </div>

              {/* Validation Counters */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-500 block">Total Filas</span>
                  <span className="text-xl font-bold text-slate-900">{stats.total}</span>
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <span className="text-emerald-700 block font-medium">Nuevos & Válidos</span>
                  <span className="text-xl font-bold text-emerald-800">{stats.valid}</span>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                  <span className="text-amber-700 block font-medium">DNI Ya en Base</span>
                  <span className="text-xl font-bold text-amber-800">{stats.duplicateInDb}</span>
                </div>

                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs">
                  <span className="text-red-700 block font-medium">DNI Duplicado en Archivo</span>
                  <span className="text-xl font-bold text-red-800">{stats.duplicateInFile}</span>
                </div>
              </div>

              {/* Preview Table */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 flex justify-between items-center">
                  <span>Vista Previa de Filas Analizadas</span>
                  <span className="text-[11px] text-slate-500 font-normal">
                    Se auditarán bajo el usuario: <strong className="text-slate-800">{currentUser.email}</strong>
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 text-[11px] sticky top-0">
                      <tr>
                        <th className="py-2 px-2.5">Fila</th>
                        <th className="py-2 px-2.5">DNI</th>
                        <th className="py-2 px-2.5">Nombre y Apellido</th>
                        <th className="py-2 px-2.5">Municipio</th>
                        <th className="py-2 px-2.5">Rol</th>
                        <th className="py-2 px-2.5">Estado Validación</th>
                        <th className="py-2 px-2.5">Observaciones / Alertas</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-700">
                      {parsedRows.map((row) => {
                        const isDbDup = row.isDuplicateInDatabase;
                        const isFileDup = row.isDuplicateInFile;
                        const hasErr = !row.isValid;

                        return (
                          <tr
                            key={row.rowNumber}
                            className={`transition-colors ${
                              isDbDup
                                ? 'bg-amber-50/50'
                                : isFileDup || hasErr
                                ? 'bg-red-50/40'
                                : 'hover:bg-slate-50/60'
                            }`}
                          >
                            <td className="py-2 px-2.5 font-mono text-slate-400">
                              #{row.rowNumber}
                            </td>
                            <td className="py-2 px-2.5 font-mono font-bold text-slate-900 whitespace-nowrap">
                              {row.dni}
                            </td>
                            <td className="py-2 px-2.5 font-medium text-slate-800 whitespace-nowrap">
                              {row.nombreApellido || <span className="text-red-500 italic">Vacío</span>}
                            </td>
                            <td className="py-2 px-2.5 whitespace-nowrap">
                              <span className="bg-blue-50 text-blue-800 px-2 py-0.5 rounded text-[11px] font-medium">
                                {row.municipio}
                              </span>
                            </td>
                            <td className="py-2 px-2.5 text-slate-600 whitespace-nowrap">
                              {row.rolPrincipal}
                            </td>
                            <td className="py-2 px-2.5 whitespace-nowrap">
                              {isDbDup ? (
                                <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                                  DNI Existente
                                </span>
                              ) : isFileDup ? (
                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  <XCircle className="w-3 h-3 text-red-600" />
                                  DNI Duplicado
                                </span>
                              ) : hasErr ? (
                                <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  <XCircle className="w-3 h-3 text-red-600" />
                                  Error
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                                  Listo
                                </span>
                              )}
                            </td>
                            <td className="py-2 px-2.5 text-[11px] max-w-xs truncate" title={row.errors.join(' | ')}>
                              {row.errors.length > 0 ? (
                                <span className="text-red-700 font-medium">
                                  {row.errors[0]}
                                </span>
                              ) : (
                                <span className="text-emerald-700">DNI único verificado</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition cursor-pointer"
          >
            Cancelar
          </button>

          <div className="flex items-center gap-2">
            {hasParsed && (
              <button
                type="button"
                onClick={handleExecuteImport}
                disabled={stats.valid === 0 && (duplicatePolicy !== 'overwrite' || stats.duplicateInDb === 0)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition disabled:opacity-50 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  Confirmar e Importar {duplicatePolicy === 'overwrite' ? stats.valid + stats.duplicateInDb : stats.valid} Registros
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
