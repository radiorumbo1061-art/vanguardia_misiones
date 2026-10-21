import React, { useState, useMemo } from 'react';
import { 
  DirectorioItem, 
  ROLES_PRINCIPALES, 
  ESTADOS_DIRIGENTE, 
  UsuarioAutorizado 
} from '../data/initialData';
import { MUNICIPIOS_MISIONES } from '../data/municipiosMisiones';
import { 
  Search, 
  Filter, 
  Plus, 
  CheckCircle2, 
  Clock, 
  User, 
  Phone, 
  MapPin, 
  ShieldAlert, 
  Trash2, 
  Edit3, 
  AlertCircle,
  Copy,
  Info,
  Calendar,
  Sparkles,
  UploadCloud,
  FileSpreadsheet,
  Download,
  Printer,
  Vote,
  Shield,
  Building,
  UserCheck,
  Cake,
  PartyPopper,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  PhoneCall,
  MessageCircle
} from 'lucide-react';
import { CsvImportModal } from './CsvImportModal';
import { PlanillasPdfModal } from './PlanillasPdfModal';
import { TotalRolesDisplay } from './TotalRolesDisplay';
import { GlobalSearchFilterBar } from './GlobalSearchFilterBar';
import { NotificacionesCumpleanosWidget } from './NotificacionesCumpleanosWidget';
import { FiestasPopularesModal } from './FiestasPopularesModal';
import { getActiveBirthdayNotifications } from '../utils/birthdayUtils';
import { getFiestasProximas } from '../data/fiestasPopularesMisiones';

interface DirectorioViewProps {
  directorio: DirectorioItem[];
  setDirectorio: React.Dispatch<React.SetStateAction<DirectorioItem[]>>;
  currentUser: UsuarioAutorizado;
  initialSearchQuery?: string;
}

export const DirectorioView: React.FC<DirectorioViewProps> = ({
  directorio,
  setDirectorio,
  currentUser,
  initialSearchQuery,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearchQuery || '');
  const [filterMunicipio, setFilterMunicipio] = useState<string>('TODOS');
  const [filterRol, setFilterRol] = useState<string>('TODOS');
  const [filterEstado, setFilterEstado] = useState<string>('TODOS');

  // Modales y Panels
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [isBirthdayDrawerOpen, setIsBirthdayDrawerOpen] = useState(false);
  const [isFiestasModalOpen, setIsFiestasModalOpen] = useState(false);
  const [pdfModalInitialRole, setPdfModalInitialRole] = useState<string>('TODOS');
  const [editingItem, setEditingItem] = useState<DirectorioItem | null>(null);
  const [importNotification, setImportNotification] = useState<{ count: number; updated: number } | null>(null);

  // Responsive View Mode & Pagination
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(15);

  // Sync external search query if provided
  React.useEffect(() => {
    if (initialSearchQuery !== undefined) {
      setSearchTerm(initialSearchQuery);
    }
  }, [initialSearchQuery]);

  // Reset page when filters or search change
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterMunicipio, filterRol, filterEstado]);

  // Birthday statistics for current week
  const { records: birthdayRecords } = useMemo(() => {
    return getActiveBirthdayNotifications(directorio);
  }, [directorio]);

  // Fiestas populares de Misiones for current and next month
  const { mesActual: fiestasMesActual, mesActualNombre: nombreMesActual, mesProximo: fiestasMesProximo } = useMemo(() => {
    return getFiestasProximas();
  }, []);

  // Form State
  const [formData, setFormData] = useState({
    dni: '',
    nombreApellido: '',
    fechaNacimiento: '',
    telefono: '',
    direccion: '',
    municipio: currentUser.municipioAsignado !== 'TODOS' ? currentUser.municipioAsignado : 'Posadas',
    rolPrincipal: 'Fiscal de Mesa' as DirectorioItem['rolPrincipal'],
    detalleSubRol: '',
    estado: 'Confirmado' as DirectorioItem['estado'],
  });

  // Specialized fiscal fields
  const [fiscalTipo, setFiscalTipo] = useState<'Titular' | 'Suplente' | 'General de Escuela'>('Titular');
  const [fiscalEscuela, setFiscalEscuela] = useState('');
  const [fiscalMesa, setFiscalMesa] = useState('');
  const [fiscalCircuito, setFiscalCircuito] = useState('');

  const [formError, setFormError] = useState<string | null>(null);
  const [copyFeedback, setCopyFeedback] = useState<string | null>(null);

  // Live duplicate detection as user types DNI
  const currentCleanDni = formData.dni.replace(/\D/g, '');
  const duplicateCandidate = useMemo(() => {
    if (!currentCleanDni || currentCleanDni.length < 6) return null;
    return directorio.find(
      item => item.dni.replace(/\D/g, '') === currentCleanDni && (!editingItem || item.id !== editingItem.id)
    );
  }, [currentCleanDni, directorio, editingItem]);

  // Format current timestamp in Argentina/Buenos Aires format
  const getNowFormatted = () => {
    const d = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  };

  // Filtered Items (Global Search across Nombre, DNI, Municipio, Sub-rol y Rol)
  const filteredData = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    const termDigits = searchTerm.replace(/\D/g, '');

    return directorio.filter(item => {
      let matchSearch = true;
      if (term) {
        const matchName = item.nombreApellido.toLowerCase().includes(term);
        const matchDni = item.dni.toLowerCase().includes(term) || (termDigits.length >= 3 && item.dni.replace(/\D/g, '').includes(termDigits));
        const matchMun = item.municipio.toLowerCase().includes(term);
        const matchSubRol = item.detalleSubRol.toLowerCase().includes(term);
        const matchRolName = item.rolPrincipal.toLowerCase().includes(term);
        matchSearch = matchName || matchDni || matchMun || matchSubRol || matchRolName;
      }

      const matchMun = filterMunicipio === 'TODOS' || item.municipio === filterMunicipio;
      const matchRol = filterRol === 'TODOS' || item.rolPrincipal === filterRol;
      const matchEstado = filterEstado === 'TODOS' || item.estado === filterEstado;

      return matchSearch && matchMun && matchRol && matchEstado;
    });
  }, [directorio, searchTerm, filterMunicipio, filterRol, filterEstado]);

  // Paginated Data
  const totalPages = Math.max(1, Math.ceil(filteredData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, currentPage, pageSize]);

  const handleOpenNew = () => {
    setEditingItem(null);
    setFormData({
      dni: '',
      nombreApellido: '',
      fechaNacimiento: '1990-01-15',
      telefono: '+54 9 376 ',
      direccion: '',
      municipio: currentUser.municipioAsignado !== 'TODOS' ? currentUser.municipioAsignado : 'Posadas',
      rolPrincipal: 'Presidente de Mesa Política',
      detalleSubRol: '',
      estado: 'Confirmado',
    });
    setFiscalTipo('Titular');
    setFiscalEscuela('');
    setFiscalMesa('');
    setFiscalCircuito('');
    setFormError(null);
    setIsModalOpen(true);
  };

  // Dedicated Open for Fiscal Registration
  const handleOpenFiscalNew = (tipo: 'Fiscal de Mesa' | 'Fiscal General' = 'Fiscal de Mesa') => {
    setEditingItem(null);
    setFormData({
      dni: '',
      nombreApellido: '',
      fechaNacimiento: '1992-05-20',
      telefono: '+54 9 376 ',
      direccion: '',
      municipio: currentUser.municipioAsignado !== 'TODOS' ? currentUser.municipioAsignado : 'Posadas',
      rolPrincipal: tipo,
      detalleSubRol: tipo === 'Fiscal General' ? 'Fiscal General de Establecimiento' : 'Mesa Nº  [Titular]',
      estado: 'Confirmado',
    });
    setFiscalTipo(tipo === 'Fiscal General' ? 'General de Escuela' : 'Titular');
    setFiscalEscuela('');
    setFiscalMesa(tipo === 'Fiscal General' ? 'Mesas 1 a 8' : 'Mesa Nº 1');
    setFiscalCircuito('Circuito 1');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: DirectorioItem) => {
    setEditingItem(item);
    setFormData({
      dni: item.dni,
      nombreApellido: item.nombreApellido,
      fechaNacimiento: item.fechaNacimiento,
      telefono: item.telefono,
      direccion: item.direccion,
      municipio: item.municipio,
      rolPrincipal: item.rolPrincipal,
      detalleSubRol: item.detalleSubRol,
      estado: item.estado,
    });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, nombre: string) => {
    if (window.confirm(`¿Confirma eliminar a "${nombre}" del Directorio General?`)) {
      setDirectorio(prev => prev.filter(item => item.id !== id));
    }
  };

  // Helper to build fiscal subrol string
  const handleApplyFiscalDetails = () => {
    const parts: string[] = [];
    if (fiscalEscuela.trim()) parts.push(fiscalEscuela.trim());
    if (fiscalMesa.trim()) parts.push(fiscalMesa.trim().startsWith('Mesa') ? fiscalMesa.trim() : `Mesa Nº ${fiscalMesa.trim()}`);
    if (fiscalCircuito.trim()) parts.push(fiscalCircuito.trim());
    if (fiscalTipo) parts.push(`[${fiscalTipo}]`);

    const result = parts.join(' - ');
    if (result) {
      setFormData(prev => ({ ...prev, detalleSubRol: result }));
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.dni || !formData.nombreApellido || !formData.municipio || !formData.rolPrincipal) {
      setFormError('Por favor complete los campos obligatorios: DNI, Nombre y Apellido, Municipio y Rol.');
      return;
    }

    if (formData.dni.replace(/\D/g, '').length < 6) {
      setFormError('El DNI debe contener al menos 6 o 7 dígitos.');
      return;
    }

    // Uniqueness validation: DNI must not exist for another person
    const cleanDni = formData.dni.replace(/\D/g, '');
    const duplicate = directorio.find(item => 
      item.dni.replace(/\D/g, '') === cleanDni && (!editingItem || item.id !== editingItem.id)
    );
    if (duplicate) {
      setFormError(`El DNI ${cleanDni} ya está registrado para "${duplicate.nombreApellido}" en ${duplicate.municipio}. En Google Sheets cada registro debe tener DNI único.`);
      return;
    }

    // Auto apply fiscal details if subrol is empty but fiscal fields were typed
    let finalSubRol = formData.detalleSubRol;
    const isFiscal = formData.rolPrincipal === 'Fiscal de Mesa' || formData.rolPrincipal === 'Fiscal General';
    if (isFiscal && (!finalSubRol || finalSubRol.trim() === '') && (fiscalEscuela || fiscalMesa)) {
      const parts: string[] = [];
      if (fiscalEscuela.trim()) parts.push(fiscalEscuela.trim());
      if (fiscalMesa.trim()) parts.push(fiscalMesa.trim().startsWith('Mesa') ? fiscalMesa.trim() : `Mesa Nº ${fiscalMesa.trim()}`);
      if (fiscalCircuito.trim()) parts.push(fiscalCircuito.trim());
      parts.push(`[${fiscalTipo}]`);
      finalSubRol = parts.join(' - ');
    }

    const auditUser = currentUser.email;
    const auditTimestamp = getNowFormatted();

    if (editingItem) {
      // Update
      setDirectorio(prev =>
        prev.map(item =>
          item.id === editingItem.id
            ? {
                ...item,
                ...formData,
                detalleSubRol: finalSubRol,
                usuarioResponsable: auditUser,
                fechaHoraCarga: auditTimestamp,
              }
            : item
        )
      );
    } else {
      // Create new
      const newItem: DirectorioItem = {
        id: `DIR-${Date.now().toString().slice(-5)}`,
        ...formData,
        detalleSubRol: finalSubRol,
        usuarioResponsable: auditUser,
        fechaHoraCarga: auditTimestamp,
      };
      setDirectorio(prev => [newItem, ...prev]);
    }

    setIsModalOpen(false);
  };

  const handleImportSuccess = (newItems: DirectorioItem[], updatedCount: number) => {
    setDirectorio(prev => {
      const newDniSet = new Set(newItems.map(item => item.dni.replace(/\D/g, '')));
      const remaining = prev.filter(item => !newDniSet.has(item.dni.replace(/\D/g, '')));
      return [...newItems, ...remaining];
    });

    setImportNotification({
      count: newItems.length,
      updated: updatedCount,
    });
    setTimeout(() => setImportNotification(null), 6000);
  };

  const copyRowSummary = (item: DirectorioItem) => {
    const text = `*DIRIGENTE DE CAMPAÑA MISIONES*\n` +
      `👤 *Nombre:* ${item.nombreApellido}\n` +
      `🪪 *DNI:* ${item.dni}\n` +
      `📍 *Municipio:* ${item.municipio}\n` +
      `🎯 *Rol:* ${item.rolPrincipal} (${item.detalleSubRol})\n` +
      `📞 *Tel:* ${item.telefono}\n` +
      `🏷️ *Estado:* ${item.estado}\n` +
      `🛡️ *Auditoría:* ${item.usuarioResponsable} [${item.fechaHoraCarga}]`;
    navigator.clipboard.writeText(text);
    setCopyFeedback(item.id);
    setTimeout(() => setCopyFeedback(null), 2500);
  };

  const openPdfForRole = (rol: string) => {
    setPdfModalInitialRole(rol);
    setIsPdfModalOpen(true);
  };

  const isFiscalSelected = 
    formData.rolPrincipal === 'Fiscal de Mesa' || 
    formData.rolPrincipal === 'Fiscal General' ||
    formData.rolPrincipal === 'Fiscal Suplente / Relevo' ||
    formData.rolPrincipal === 'Fiscal Informático / Cómputos' ||
    formData.rolPrincipal === 'Fiscal de Escrutinio Definitivo' ||
    formData.rolPrincipal === 'Coordinador General de Fiscalización';

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              Pestaña 1 • Base Central
            </span>
            <span className="text-xs text-slate-500">Google Sheets: Hoja "Directorio_General"</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Directorio General de Campaña</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Registro unificado de fiscales, autoridades y candidatos en los 79 municipios de Misiones con auditoría automatizada y descarga de planillas en PDF.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          {/* Birthday Notifications Button */}
          <button
            onClick={() => setIsBirthdayDrawerOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-600 hover:to-rose-600 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-amber-500/25 transition cursor-pointer"
            title="Abrir panel lateral de notificaciones de cumpleaños de la semana"
          >
            <Cake className="w-4 h-4 text-white animate-bounce" />
            <span>Cumpleaños ({birthdayRecords.length})</span>
          </button>

          {/* Fiestas Populares Reminder Button */}
          <button
            onClick={() => setIsFiestasModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-700 hover:to-amber-700 text-white font-semibold text-xs sm:text-sm shadow-sm shadow-rose-600/25 transition cursor-pointer"
            title="Abrir recordatorio de fiestas populares y agenda cultural de Misiones"
          >
            <PartyPopper className="w-4 h-4 text-amber-200" />
            <span>Fiestas Populares ({fiestasMesActual.length})</span>
          </button>

          {/* PDF Planillas Button */}
          <button
            onClick={() => openPdfForRole('TODOS')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs sm:text-sm shadow-sm shadow-purple-600/30 transition cursor-pointer"
            title="Descargar planillas oficiales en PDF por cada rol"
          >
            <Printer className="w-4 h-4" />
            <span>Descargar Planillas PDF</span>
          </button>

          {/* Quick Fiscal Registration */}
          <button
            onClick={() => handleOpenFiscalNew('Fiscal de Mesa')}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs sm:text-sm shadow-sm shadow-teal-600/30 transition cursor-pointer"
            title="Carga especializada de Fiscal de Mesa o Fiscal General"
          >
            <Vote className="w-4 h-4" />
            <span>Cargar Fiscal</span>
          </button>

          {/* Mass CSV Import */}
          <button
            onClick={() => setIsImportModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium text-xs sm:text-sm shadow-sm shadow-emerald-600/30 transition cursor-pointer"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Importar CSV</span>
          </button>

          {/* General New Record */}
          <button
            onClick={handleOpenNew}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm shadow-sm shadow-blue-600/30 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nuevo Registro</span>
          </button>
        </div>
      </div>

      {/* CSV Import Success Notification */}
      {importNotification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs flex items-center justify-between gap-3 shadow-xs animate-fade-in">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-sm text-emerald-950">
                ¡Importación masiva completada exitosamente!
              </p>
              <p className="text-emerald-800 mt-0.5">
                Se incorporaron <strong>{importNotification.count}</strong> registros con validación de DNI único y sellado automático de auditoría a nombre de <strong>{currentUser.email}</strong>.
                {importNotification.updated > 0 && ` (${importNotification.updated} registros existentes fueron actualizados).`}
              </p>
            </div>
          </div>
          <button
            onClick={() => setImportNotification(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold p-1 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Sección de Notificaciones: Cumpleaños de la Semana */}
      <NotificacionesCumpleanosWidget
        directorio={directorio}
        variant="inline-dashboard"
        onSelectCandidate={(dni) => {
          setSearchTerm(dni);
          const tableEl = document.getElementById('directorio-table-container');
          tableEl?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Prominent Unified Display: Total Registrados & Detalle de Todos los Roles por Separado */}
      <TotalRolesDisplay
        directorio={directorio}
        activeFilterRol={filterRol}
        onSelectFilterRol={setFilterRol}
        onOpenPdfModalForRole={openPdfForRole}
        onOpenFiscalModal={() => handleOpenFiscalNew('Fiscal de Mesa')}
      />

      {/* Audit Banner Notice */}
      <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0"></div>
          <div>
            <span className="font-semibold text-emerald-400">Trigger onEdit(e) de Google Apps Script Activo: </span>
            <span className="text-slate-300">
              Cualquier fila cargada o editada sella automáticamente en Columna J el usuario <strong className="text-white">({currentUser.email})</strong> y en Columna K la fecha y hora exacta con zona horaria de Misiones.
            </span>
          </div>
        </div>
        {currentUser.municipioAsignado !== 'TODOS' ? (
          <span className="hidden md:inline bg-purple-950 text-purple-300 px-2 py-0.5 rounded border border-purple-800 font-medium shrink-0">
            Jurisdicción: {currentUser.municipioAsignado}
          </span>
        ) : (
          <span className="hidden md:inline bg-amber-950/80 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-800 font-medium shrink-0">
            ⭐ Operador Universal: 79 Municipios
          </span>
        )}
      </div>

      {/* Popular Festivals Campaign Reminder Banner */}
      {fiestasMesActual.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-purple-500/15 p-4 rounded-2xl border border-amber-300/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-xl shrink-0 shadow-xs">
              🎉
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-950 bg-amber-200/90 px-2 py-0.5 rounded-md border border-amber-300">
                  Recordatorio de Fiestas Populares • {nombreMesActual}
                </span>
                <span className="text-xs text-rose-800 font-bold">
                  {fiestasMesActual.length} festividades estratégicas este mes
                </span>
              </div>
              <p className="text-xs text-slate-800 font-medium mt-1">
                {fiestasMesActual.map(f => `${f.nombre} (${f.municipio})`).join(' • ')}.
              </p>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Oportunidad para presencia territorial de candidatos, stands institucionales y saludos oficiales a las comisiones organizadoras.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsFiestasModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer shrink-0"
          >
            <span>Ver Agenda de Fiestas</span>
            <Sparkles className="w-3.5 h-3.5 text-amber-200" />
          </button>
        </div>
      )}

      {/* Global Search and Filter Bar */}
      <GlobalSearchFilterBar
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterMunicipio={filterMunicipio}
        setFilterMunicipio={setFilterMunicipio}
        filterRol={filterRol}
        setFilterRol={setFilterRol}
        filterEstado={filterEstado}
        setFilterEstado={setFilterEstado}
        totalCount={directorio.length}
        filteredCount={filteredData.length}
        onDownloadFilteredPdf={() => openPdfForRole(filterRol)}
      />

      {/* Main Container with View Mode Toggle & Pagination */}
      <div id="directorio-table-container" className="space-y-4 scroll-mt-6">
        {/* Controls Bar: View Mode Switcher + Page Size + Count */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>Registros Electorales</span>
              <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-[11px] font-extrabold">
                {filteredData.length}
              </span>
            </span>
            <span className="text-slate-300">|</span>
            <span className="text-xs text-slate-500">
              Página {currentPage} de {totalPages}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
            {/* Page Size Selector */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span className="hidden md:inline font-medium text-[11px]">Por pág:</span>
              <select
                value={pageSize}
                onChange={e => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1.5 rounded-xl border border-slate-300 bg-white text-xs font-medium focus:outline-none focus:border-blue-500"
              >
                <option value={15}>15 por pág.</option>
                <option value={30}>30 por pág.</option>
                <option value={50}>50 por pág.</option>
                <option value={filteredData.length || 100}>Ver Todos</option>
              </select>
            </div>

            {/* View Mode Toggle: Cards vs Table */}
            <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer min-h-[36px] ${
                  viewMode === 'cards'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vista en Fichas / Tarjetas (Óptima para celulares y tablets)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Fichas</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer min-h-[36px] ${
                  viewMode === 'table'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vista en Tabla Completa (11 Columnas con desplazamiento horizontal)"
              >
                <List className="w-3.5 h-3.5" />
                <span>Tabla</span>
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredData.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-500 space-y-3 shadow-xs">
            <User className="w-12 h-12 mx-auto text-slate-300" />
            <h3 className="text-base font-bold text-slate-800">
              No se encontraron registros electorales
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              No hay postulantes, fiscales ni autoridades que coincidan con los filtros aplicados.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterMunicipio('TODOS');
                setFilterRol('TODOS');
                setFilterEstado('TODOS');
              }}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              Restablecer todos los filtros
            </button>
          </div>
        ) : viewMode === 'cards' ? (
          /* ============================================================== */
          /* CARD / FICHAS VIEW (OPTIMAL FOR PHONES, TABLETS & DESKTOPS)   */
          /* ============================================================== */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {paginatedData.map(item => {
              const cleanPhone = item.telefono?.replace(/\D/g, '') || '';
              const whatsappUrl = cleanPhone ? `https://wa.me/${cleanPhone.startsWith('54') ? cleanPhone : '549' + cleanPhone}` : null;
              const isConfirmed = item.estado === 'Confirmado';
              const isFiscal = item.rolPrincipal.includes('Fiscal');

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between gap-3 shadow-xs hover:shadow-md ${
                    isConfirmed ? 'border-slate-200/90 hover:border-emerald-300' : 'border-slate-200'
                  }`}
                >
                  <div className="space-y-2.5">
                    {/* Header Row: DNI + Status Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                        DNI {item.dni}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        item.estado === 'Confirmado'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : item.estado === 'Activo'
                          ? 'bg-sky-100 text-sky-800 border border-sky-300'
                          : item.estado === 'En Revisión'
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : item.estado === 'Suplente'
                          ? 'bg-purple-100 text-purple-800 border border-purple-300'
                          : 'bg-red-100 text-red-800 border border-red-300'
                      }`}>
                        {item.estado}
                      </span>
                    </div>

                    {/* Candidate Name */}
                    <div>
                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {item.nombreApellido}
                      </h3>
                      {item.fechaNacimiento && (
                        <p className="text-[11px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          <span>Nacimiento: {item.fechaNacimiento}</span>
                        </p>
                      )}
                    </div>

                    {/* Role & Municipality Badges */}
                    <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                      <span className={`px-2.5 py-1 rounded-xl text-xs font-bold border ${
                        item.rolPrincipal === 'Gobernador'
                          ? 'bg-amber-100 text-amber-950 border-amber-400 font-black'
                          : item.rolPrincipal === 'Vice Gobernador'
                          ? 'bg-amber-100 text-amber-950 border-amber-300 font-bold'
                          : item.rolPrincipal === 'Senador Nacional' || item.rolPrincipal === 'Diputado Nacional'
                          ? 'bg-blue-100 text-blue-950 border-blue-400 font-bold'
                          : item.rolPrincipal === 'Diputado Provincial'
                          ? 'bg-sky-100 text-sky-950 border-sky-300 font-bold'
                          : item.rolPrincipal === 'Candidato a Intendente'
                          ? 'bg-purple-100 text-purple-900 border-purple-300 font-bold'
                          : item.rolPrincipal === 'Vice Intendente'
                          ? 'bg-fuchsia-100 text-fuchsia-950 border-fuchsia-300 font-bold'
                          : item.rolPrincipal === 'Candidato a Concejal'
                          ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
                          : isFiscal
                          ? 'bg-emerald-100 text-emerald-950 border-emerald-300 font-semibold'
                          : 'bg-slate-100 text-slate-900 border-slate-200 font-medium'
                      }`}>
                        {item.rolPrincipal}
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-1 rounded-xl">
                        <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
                        <span>{item.municipio}</span>
                      </span>
                    </div>

                    {/* Subrol / Escuela / Mesa Box */}
                    {item.detalleSubRol && (
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80 text-xs text-slate-700">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-0.5">
                          Asignación / Sub-rol:
                        </span>
                        <p className="font-medium text-slate-800">
                          {item.detalleSubRol}
                        </p>
                      </div>
                    )}

                    {/* Address if exists */}
                    {item.direccion && (
                      <p className="text-xs text-slate-500 truncate" title={item.direccion}>
                        📍 <span className="text-slate-600">{item.direccion}</span>
                      </p>
                    )}

                    {/* Phone & Direct Mobile Actions */}
                    {item.telefono && item.telefono !== '-' && (
                      <div className="flex items-center gap-2 pt-1">
                        <a
                          href={`tel:${item.telefono}`}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition cursor-pointer min-h-[40px] border border-slate-200"
                          title="Llamar por teléfono"
                        >
                          <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                          <span>Llamar</span>
                        </a>

                        {whatsappUrl && (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition cursor-pointer min-h-[40px]"
                            title="Enviar mensaje de WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5 fill-white" />
                            <span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Card Bottom: Audit info + Card Action Buttons */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="truncate max-w-[170px]" title={`Usuario responsable: ${item.usuarioResponsable}`}>
                        Audit: {item.usuarioResponsable.split('@')[0]}
                      </span>
                      <span>{item.fechaHoraCarga.split(' ')[0]}</span>
                    </div>

                    <div className="flex items-center justify-between gap-1.5 pt-1">
                      <button
                        onClick={() => copyRowSummary(item)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-medium transition cursor-pointer min-h-[40px]"
                        title="Copiar ficha de dirigente"
                      >
                        {copyFeedback === item.id ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="text-emerald-700 font-bold">Copiado</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-slate-500" />
                            <span>Copiar</span>
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="flex-1 flex items-center justify-center gap-1 py-2 px-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition cursor-pointer min-h-[40px]"
                        title="Editar ficha"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                        <span>Editar</span>
                      </button>

                      <button
                        onClick={() => handleDelete(item.id, item.nombreApellido)}
                        className="p-2 rounded-xl border border-red-200 hover:bg-red-50 text-red-600 transition cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                        title="Eliminar de base"
                        aria-label={`Eliminar a ${item.nombreApellido}`}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ============================================================== */
          /* TABLE VIEW (FULL 11-COLUMN GOOGLE SHEETS SPREADSHEET VIEW)     */
          /* ============================================================== */
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-900 text-white uppercase text-[11px] tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-3">DNI</th>
                    <th className="py-3 px-3">Nombre y Apellido</th>
                    <th className="py-3 px-3">Nacimiento</th>
                    <th className="py-3 px-3">Teléfono</th>
                    <th className="py-3 px-3">Dirección</th>
                    <th className="py-3 px-3 bg-blue-900/60 text-sky-200">Municipio (79)</th>
                    <th className="py-3 px-3 bg-indigo-900/60 text-indigo-200">Rol Principal</th>
                    <th className="py-3 px-3">Detalle / Sub-rol (Escuela/Mesa)</th>
                    <th className="py-3 px-3">Estado</th>
                    <th className="py-3 px-3 bg-emerald-950/70 text-emerald-300">Usuario Auditor</th>
                    <th className="py-3 px-3 bg-emerald-950/70 text-emerald-300">Timestamp</th>
                    <th className="py-3 px-3 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {paginatedData.map(item => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* Col A: DNI */}
                      <td className="py-3 px-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                        {item.dni}
                      </td>

                      {/* Col B: Nombre y Apellido */}
                      <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">
                        {item.nombreApellido}
                      </td>

                      {/* Col C: Nacimiento */}
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {item.fechaNacimiento}
                      </td>

                      {/* Col D: Teléfono */}
                      <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {item.telefono || '-'}
                      </td>

                      {/* Col E: Dirección */}
                      <td className="py-3 px-3 text-slate-600 max-w-[140px] truncate" title={item.direccion}>
                        {item.direccion || '-'}
                      </td>

                      {/* Col F: Municipio */}
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-blue-800 bg-blue-50/30">
                        {item.municipio}
                      </td>

                      {/* Col G: Rol Principal */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[11px] border ${
                          item.rolPrincipal === 'Gobernador'
                            ? 'bg-amber-100 text-amber-950 border-amber-400 font-black'
                            : item.rolPrincipal === 'Vice Gobernador'
                            ? 'bg-amber-100 text-amber-950 border-amber-300 font-bold'
                            : item.rolPrincipal === 'Senador Nacional'
                            ? 'bg-blue-100 text-blue-950 border-blue-400 font-bold'
                            : item.rolPrincipal === 'Diputado Nacional'
                            ? 'bg-blue-100 text-blue-950 border-blue-300 font-bold'
                            : item.rolPrincipal === 'Diputado Provincial'
                            ? 'bg-sky-100 text-sky-950 border-sky-300 font-bold'
                            : item.rolPrincipal === 'Candidato a Intendente'
                            ? 'bg-purple-100 text-purple-900 border-purple-200 font-bold'
                            : item.rolPrincipal === 'Vice Intendente'
                            ? 'bg-fuchsia-100 text-fuchsia-950 border-fuchsia-300 font-bold'
                            : item.rolPrincipal === 'Candidato a Concejal'
                            ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
                            : item.rolPrincipal === 'Convencional Constituyente'
                            ? 'bg-amber-50 text-amber-950 border-amber-300 font-bold'
                            : item.rolPrincipal === 'Defensor del Pueblo'
                            ? 'bg-violet-100 text-violet-950 border-violet-300 font-bold'
                            : item.rolPrincipal === 'Jefe de Campaña'
                            ? 'bg-red-100 text-red-950 border-red-300 font-bold'
                            : item.rolPrincipal === 'Apoderado Legal'
                            ? 'bg-indigo-100 text-indigo-950 border-indigo-300 font-bold'
                            : item.rolPrincipal === 'Responsable Económico-Financiero'
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-300 font-bold'
                            : item.rolPrincipal === 'Responsable de Comunicación y Prensa'
                            ? 'bg-pink-100 text-pink-950 border-pink-300 font-bold'
                            : item.rolPrincipal === 'Coordinador de Campaña Digital y Redes'
                            ? 'bg-sky-100 text-sky-950 border-sky-300 font-bold'
                            : item.rolPrincipal === 'Presidente de Mesa Política'
                            ? 'bg-blue-100 text-blue-900 border-blue-200'
                            : item.rolPrincipal === 'Responsable de Logística'
                            ? 'bg-cyan-100 text-cyan-950 border-cyan-300 font-bold'
                            : item.rolPrincipal === 'Coordinador de Movilización y Transporte'
                            ? 'bg-blue-100 text-blue-900 border-blue-300 font-bold'
                            : item.rolPrincipal === 'Referente Territorial'
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : item.rolPrincipal === 'Voluntario / Militante de Campaña'
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                            : item.rolPrincipal === 'Coordinador General de Fiscalización'
                            ? 'bg-teal-100 text-teal-950 border-teal-300 font-bold'
                            : item.rolPrincipal === 'Fiscal General'
                            ? 'bg-teal-100 text-teal-900 border-teal-300 font-semibold'
                            : item.rolPrincipal === 'Fiscal de Mesa'
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-semibold'
                            : item.rolPrincipal === 'Fiscal Suplente / Relevo'
                            ? 'bg-cyan-100 text-cyan-900 border-cyan-300'
                            : item.rolPrincipal === 'Fiscal Informático / Cómputos'
                            ? 'bg-slate-100 text-slate-900 border-slate-300 font-bold'
                            : item.rolPrincipal === 'Fiscal de Escrutinio Definitivo'
                            ? 'bg-indigo-100 text-indigo-950 border-indigo-300 font-bold'
                            : item.rolPrincipal === 'Afiliado al Partido'
                            ? 'bg-rose-100 text-rose-900 border-rose-200'
                            : 'bg-slate-100 text-slate-900 border-slate-200'
                        }`}>
                          {item.rolPrincipal}
                        </span>
                      </td>

                      {/* Col H: Detalle / Sub-rol */}
                      <td className="py-3 px-3 text-slate-600 max-w-[200px] truncate" title={item.detalleSubRol}>
                        {item.detalleSubRol || '-'}
                      </td>

                      {/* Col I: Estado */}
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.estado === 'Confirmado'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.estado === 'Activo'
                            ? 'bg-sky-100 text-sky-800'
                            : item.estado === 'En Revisión'
                            ? 'bg-amber-100 text-amber-800'
                            : item.estado === 'Suplente'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {item.estado}
                        </span>
                      </td>

                      {/* Col J: Usuario Responsable (Auditoría) */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap bg-emerald-50/20">
                        {item.usuarioResponsable}
                      </td>

                      {/* Col K: Fecha y Hora Carga */}
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap bg-emerald-50/20">
                        {item.fechaHoraCarga}
                      </td>

                      {/* Actions with accessible touch targets */}
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => copyRowSummary(item)}
                            title="Copiar ficha de dirigente"
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                            aria-label="Copiar resumen"
                          >
                            {copyFeedback === item.id ? (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>

                          <button
                            onClick={() => handleOpenEdit(item)}
                            title="Editar ficha"
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                            aria-label="Editar registro"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => handleDelete(item.id, item.nombreApellido)}
                            title="Eliminar de base"
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center"
                            aria-label="Eliminar registro"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Responsive Pagination Bar */}
        {filteredData.length > 0 && (
          <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="text-slate-600 font-medium">
              Mostrando registros <strong>{Math.min((currentPage - 1) * pageSize + 1, filteredData.length)}</strong> a <strong>{Math.min(currentPage * pageSize, filteredData.length)}</strong> de <strong>{filteredData.length}</strong>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition min-h-[40px] cursor-pointer"
                aria-label="Página anterior"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Anterior</span>
              </button>

              <div className="px-3 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold font-mono">
                {currentPage} / {totalPages}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 font-semibold disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-100 transition min-h-[40px] cursor-pointer"
                aria-label="Página siguiente"
              >
                <span>Siguiente</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Carga / Edición de Registros y Fiscales */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl p-4 sm:p-6 relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                  {editingItem ? 'Editar Registro' : isFiscalSelected ? 'Carga Especializada de Fiscal' : 'Nueva Carga de Dirigente'}
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  {editingItem ? 'Modificar Ficha Electoral' : 'Formulario de Carga y Fiscalización Electoral'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xl font-bold p-1 cursor-pointer min-h-[40px] min-w-[40px] flex items-center justify-center"
                aria-label="Cerrar ventana de carga"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            {/* Live Duplicate Warning */}
            {duplicateCandidate && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-300 rounded-xl text-xs text-amber-900 flex items-start gap-2 shadow-xs">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong>⚠️ DNI Existente en el Sistema:</strong> El DNI {currentCleanDni} ya está asignado a <strong>"{duplicateCandidate.nombreApellido}"</strong> ({duplicateCandidate.municipio} • {duplicateCandidate.rolPrincipal}).
                </div>
              </div>
            )}

            {/* Jurisdiction Warning if Operator tries to pick another municipality */}
            {currentUser.municipioAsignado !== 'TODOS' && formData.municipio !== currentUser.municipioAsignado && (
              <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
                <span>
                  <strong>Atención de Auditoría:</strong> Tu usuario tiene asignada la jurisdicción de <strong>{currentUser.municipioAsignado}</strong>. En Google Sheets, el trigger registrará una advertencia al modificar municipios ajenos.
                </span>
              </div>
            )}

            <form onSubmit={handleSave} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* DNI */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    DNI <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: 35123456"
                    value={formData.dni}
                    onChange={e => setFormData({ ...formData, dni: e.target.value.replace(/\D/g, '') })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>

                {/* Nombre y Apellido */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre y Apellido <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: Laura Beatriz Fernández"
                    value={formData.nombreApellido}
                    onChange={e => setFormData({ ...formData, nombreApellido: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Fecha Nacimiento */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fecha de Nacimiento
                  </label>
                  <input
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={e => setFormData({ ...formData, fechaNacimiento: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 text-slate-700"
                  />
                </div>

                {/* Teléfono */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Teléfono (WhatsApp de contacto)
                  </label>
                  <input
                    type="text"
                    placeholder="+54 9 376 4..."
                    value={formData.telefono}
                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* Dirección */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dirección / Barrio
                </label>
                <input
                  type="text"
                  placeholder="Calle, número, barrio o paraje"
                  value={formData.direccion}
                  onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Municipio (Dropdown de 79) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Municipio (Catálogo oficial 79) <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.municipio}
                    onChange={e => setFormData({ ...formData, municipio: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-blue-300 bg-blue-50/30 text-blue-900 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    {MUNICIPIOS_MISIONES.map(m => (
                      <option key={m.id} value={m.nombre}>
                        {m.nombre} - {m.departamento}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Rol Principal (Incluye Fiscal de Mesa, Fiscal General, etc.) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Rol Principal en Campaña <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.rolPrincipal}
                    onChange={e => {
                      const rol = e.target.value as DirectorioItem['rolPrincipal'];
                      setFormData({ ...formData, rolPrincipal: rol });
                      if (rol === 'Fiscal General' || rol === 'Coordinador General de Fiscalización') {
                        setFiscalTipo('General de Escuela');
                      } else if (rol === 'Fiscal Suplente / Relevo') {
                        setFiscalTipo('Suplente');
                      } else if (rol === 'Fiscal de Mesa') {
                        setFiscalTipo('Titular');
                      }
                    }}
                    className={`w-full px-3 py-2 text-sm rounded-lg border font-semibold focus:outline-none ${
                      isFiscalSelected
                        ? 'border-emerald-400 bg-emerald-50/50 text-emerald-900 focus:border-emerald-500'
                        : 'border-indigo-300 bg-indigo-50/30 text-indigo-900 focus:border-indigo-500'
                    }`}
                  >
                    {ROLES_PRINCIPALES.map(r => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* SECCIÓN ESPECIAL PARA CARGA DE FISCALES */}
              {isFiscalSelected && (
                <div className="bg-emerald-50/80 p-4 rounded-2xl border border-emerald-200/90 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-xs">
                        🗳️
                      </div>
                      <span className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                        Asignación Específica de Fiscalización Electoral
                      </span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100 px-2 py-0.5 rounded">
                      Misiones 2026
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div>
                      <label className="block font-semibold text-emerald-900 mb-1">
                        Tipo de Fiscal
                      </label>
                      <select
                        value={fiscalTipo}
                        onChange={e => setFiscalTipo(e.target.value as any)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white font-medium"
                      >
                        {formData.rolPrincipal === 'Fiscal General' || formData.rolPrincipal === 'Coordinador General de Fiscalización' ? (
                          <>
                            <option value="General de Escuela">Fiscal General de Escuela</option>
                            <option value="General de Circuito">Fiscal General de Circuito</option>
                            <option value="General Suplente">Fiscal General Suplente</option>
                          </>
                        ) : formData.rolPrincipal === 'Fiscal Suplente / Relevo' ? (
                          <>
                            <option value="Suplente">Fiscal de Mesa Suplente / Relevo</option>
                            <option value="General Suplente">Fiscal General Suplente</option>
                          </>
                        ) : (
                          <>
                            <option value="Titular">Fiscal de Mesa Titular</option>
                            <option value="Suplente">Fiscal de Mesa Suplente</option>
                          </>
                        )}
                      </select>
                    </div>

                    <div>
                      <label className="block font-semibold text-emerald-900 mb-1">
                        Escuela / Establecimiento
                      </label>
                      <input
                        type="text"
                        placeholder="Ej: Escuela Nº 185"
                        value={fiscalEscuela}
                        onChange={e => setFiscalEscuela(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block font-semibold text-emerald-900 mb-1">
                        Mesa Asignada
                      </label>
                      <input
                        type="text"
                        placeholder={formData.rolPrincipal === 'Fiscal General' ? 'Mesas 1 a 12' : 'Mesa Nº 4'}
                        value={fiscalMesa}
                        onChange={e => setFiscalMesa(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-emerald-300 bg-white"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-emerald-800">
                      Complete los datos de la escuela y mesa para armar automáticamente la asignación.
                    </span>
                    <button
                      type="button"
                      onClick={handleApplyFiscalDetails}
                      className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs transition cursor-pointer"
                    >
                      Aplicar a Detalle
                    </button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Detalle / Sub-rol */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Detalle / Sub-rol (Escuela, sublema, cargo o mesa)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Escuela Nº 105 - Mesa 12 [Titular]"
                    value={formData.detalleSubRol}
                    onChange={e => setFormData({ ...formData, detalleSubRol: e.target.value })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Estado */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estado de Validación
                  </label>
                  <select
                    value={formData.estado}
                    onChange={e => setFormData({ ...formData, estado: e.target.value as DirectorioItem['estado'] })}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-blue-500"
                  >
                    {ESTADOS_DIRIGENTE.map(s => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Live Audit Preview Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-3.5 border border-slate-800 text-xs space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Auditoría Automática de Apps Script (onEdit simulado):
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] pt-1">
                  <div>
                    <span className="text-slate-400">Columna J (Usuario): </span>
                    <strong className="text-slate-200">{currentUser.email}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Columna K (Timestamp): </span>
                    <strong className="text-slate-200 font-mono">{getNowFormatted()}</strong>
                  </div>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-sm hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition cursor-pointer"
                >
                  {editingItem ? 'Guardar Cambios' : 'Registrar en Directorio'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        existingDirectorio={directorio}
        onImportSuccess={handleImportSuccess}
        currentUser={currentUser}
      />

      {/* PDF Role Sheets Modal */}
      <PlanillasPdfModal
        isOpen={isPdfModalOpen}
        onClose={() => setIsPdfModalOpen(false)}
        directorio={directorio}
        currentUser={currentUser}
        initialRole={pdfModalInitialRole}
      />

      {/* Lateral Drawer for Birthday Notifications */}
      <NotificacionesCumpleanosWidget
        directorio={directorio}
        variant="sidebar-drawer"
        isOpen={isBirthdayDrawerOpen}
        onClose={() => setIsBirthdayDrawerOpen(false)}
        onSelectCandidate={(dni) => {
          setSearchTerm(dni);
          const tableEl = document.getElementById('directorio-table-container');
          tableEl?.scrollIntoView({ behavior: 'smooth' });
        }}
      />

      {/* Fiestas Populares de Misiones Reminder Modal */}
      <FiestasPopularesModal
        isOpen={isFiestasModalOpen}
        onClose={() => setIsFiestasModalOpen(false)}
        onFilterMunicipioInDirectorio={(mun) => {
          setFilterMunicipio(mun);
          setSearchTerm('');
          const tableEl = document.getElementById('directorio-table-container');
          tableEl?.scrollIntoView({ behavior: 'smooth' });
        }}
      />
    </div>
  );
};
