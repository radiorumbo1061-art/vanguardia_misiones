import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DirectorioItem } from '../data/initialData';

export interface PdfExportOptions {
  rol?: string; // Specific role or 'TODOS'
  municipio?: string; // Specific municipality or 'TODOS'
  estado?: string; // Specific state or 'TODOS'
  usuarioResponsable: string;
  partidoNombre?: string;
}

/**
 * Genera y descarga una planilla oficial en formato PDF para el rol o lista solicitada
 */
export function exportPlanillaPdf(
  items: DirectorioItem[],
  options: PdfExportOptions
) {
  const {
    rol = 'TODOS',
    municipio = 'TODOS',
    estado = 'TODOS',
    usuarioResponsable,
    partidoNombre = 'PARTIDO POLÍTICO • PROVINCIA DE MISIONES'
  } = options;

  // Filtrar items según las opciones especificadas
  const filtered = items.filter(item => {
    const matchRol = rol === 'TODOS' || item.rolPrincipal === rol;
    const matchMun = municipio === 'TODOS' || item.municipio === municipio;
    const matchEst = estado === 'TODOS' || item.estado === estado;
    return matchRol && matchMun && matchEst;
  });

  // Crear documento PDF en formato A4 horizontal (landscape) para mejor espacio de firmas y datos
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Fecha y hora actual formateada
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const fechaStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;

  // Título del Rol
  const rolTitulo = rol === 'TODOS' ? 'PADRÓN GENERAL CONSOLIDADO - TODOS LOS ROLES' : `PLANILLA OFICIAL: ${rol.toUpperCase()}`;
  const ambitoTitulo = municipio === 'TODOS' ? 'Ámbito: Todos los 79 Municipios de Misiones' : `Municipio: ${municipio.toUpperCase()}`;

  // Encabezado decorativo institucional (colores alusivos de Misiones: Azul, Rojo y Blanco)
  // Barra superior azul
  doc.setFillColor(30, 58, 138); // Blue 900
  doc.rect(0, 0, pageWidth, 16, 'F');

  // Franja roja delgada inferior del banner
  doc.setFillColor(220, 38, 38); // Red 600
  doc.rect(0, 16, pageWidth, 2.5, 'F');

  // Texto del encabezado
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(partidoNombre, 14, 8);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('SISTEMA INTEGRAL DE GESTIÓN Y FISCALIZACIÓN ELECTORAL • 79 MUNICIPIOS', 14, 13);

  // Fecha de emisión a la derecha del banner
  doc.text(`Emisión: ${fechaStr}`, pageWidth - 14, 8, { align: 'right' });
  doc.text(`Operador Emisor: ${usuarioResponsable}`, pageWidth - 14, 13, { align: 'right' });

  // Título de la Planilla
  doc.setTextColor(15, 23, 42); // Slate 900
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(rolTitulo, 14, 25);

  // Subtítulo con metadata
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105); // Slate 600
  doc.text(`${ambitoTitulo}  |  Registros listados: ${filtered.length}  |  Estado: ${estado === 'TODOS' ? 'Todos los estados' : estado}`, 14, 30);

  // Preparar datos de la tabla
  const tableData = filtered.map((item, index) => [
    (index + 1).toString(),
    item.dni,
    item.nombreApellido,
    item.municipio,
    item.telefono || '-',
    item.rolPrincipal,
    item.detalleSubRol || 'Sin asignación específica',
    item.estado,
    '' // Espacio vacío para la FIRMA y ACREDITACIÓN
  ]);

  // Si no hay datos, agregar una fila indicativa
  if (tableData.length === 0) {
    tableData.push(['-', '-', 'No se encontraron registros para los filtros seleccionados', '-', '-', '-', '-', '-', '-']);
  }

  // Generar tabla profesional con jspdf-autotable
  autoTable(doc, {
    startY: 33,
    head: [[
      'N°',
      'DNI',
      'Apellido y Nombre',
      'Municipio',
      'Teléfono',
      'Rol Principal',
      'Detalle / Asignación (Mesa/Escuela)',
      'Estado',
      'Firma / Acreditación'
    ]],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [30, 41, 59], // Slate 800
      textColor: [255, 255, 255],
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'left',
      cellPadding: 2,
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 2,
      overflow: 'linebreak',
      textColor: [30, 41, 59],
      lineColor: [226, 232, 240], // Slate 200
      lineWidth: 0.2,
    },
    columnStyles: {
      0: { cellWidth: 9, halign: 'center', fontStyle: 'bold' }, // N°
      1: { cellWidth: 19, halign: 'center', fontStyle: 'bold' }, // DNI
      2: { cellWidth: 42, fontStyle: 'bold' }, // Apellido y Nombre
      3: { cellWidth: 26 }, // Municipio
      4: { cellWidth: 25 }, // Teléfono
      5: { cellWidth: 32 }, // Rol
      6: { cellWidth: 55 }, // Asignación / Subrol
      7: { cellWidth: 19, halign: 'center' }, // Estado
      8: { cellWidth: 42, halign: 'center' }, // Firma
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // Slate 50
    },
    didDrawPage: (data) => {
      // Pie de página en cada hoja
      doc.setFontSize(7.5);
      doc.setTextColor(148, 163, 184); // Slate 400
      const str = `Página ${data.pageNumber} • Sistema Electoral de Misiones • Documento Confidencial Partidario • Impreso por ${usuarioResponsable}`;
      doc.text(str, pageWidth / 2, pageHeight - 6, { align: 'center' });
    },
  });

  // Generar nombre de archivo amigable
  const sanitize = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
  const filename = `Planilla_${sanitize(rol)}_${sanitize(municipio)}_${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}.pdf`;

  // Descargar archivo
  doc.save(filename);
}
