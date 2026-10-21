import * as XLSX from 'xlsx';
import { MUNICIPIOS_MISIONES } from '../data/municipiosMisiones';
import { DirectorioItem, UsuarioAutorizado } from '../data/initialData';

export function exportFullSpreadsheet(
  directorio: DirectorioItem[],
  usuarios: UsuarioAutorizado[]
) {
  const wb = XLSX.utils.book_new();

  // 1. Directorio_General
  const dirRows = [
    [
      "DNI",
      "Nombre y Apellido",
      "Fecha de Nacimiento",
      "Teléfono",
      "Dirección",
      "Municipio",
      "Rol Principal",
      "Detalle / Sub-rol",
      "Estado",
      "Usuario Responsable",
      "Fecha y Hora de Carga"
    ],
    ...directorio.map(item => [
      item.dni,
      item.nombreApellido,
      item.fechaNacimiento,
      item.telefono,
      item.direccion,
      item.municipio,
      item.rolPrincipal,
      item.detalleSubRol,
      item.estado,
      item.usuarioResponsable,
      item.fechaHoraCarga
    ])
  ];
  const wsDirectorio = XLSX.utils.aoa_to_sheet(dirRows);
  // Column widths
  wsDirectorio['!cols'] = [
    { wch: 14 },
    { wch: 28 },
    { wch: 16 },
    { wch: 20 },
    { wch: 28 },
    { wch: 22 },
    { wch: 26 },
    { wch: 32 },
    { wch: 14 },
    { wch: 28 },
    { wch: 22 },
  ];
  XLSX.utils.book_append_sheet(wb, wsDirectorio, "Directorio_General");

  // 2. Municipios (79 Municipios de Misiones)
  const munRows = [
    [
      "ID",
      "Municipio",
      "Departamento",
      "Zona Electoral",
      "Cabecera",
      "Circuitos Estimados",
      "Observaciones"
    ],
    ...MUNICIPIOS_MISIONES.map(m => [
      m.id,
      m.nombre,
      m.departamento,
      m.zonaElectoral,
      m.cabecera ? "SI" : "NO",
      m.circuitosEstimados,
      m.nota || ""
    ])
  ];
  const wsMunicipios = XLSX.utils.aoa_to_sheet(munRows);
  wsMunicipios['!cols'] = [
    { wch: 6 },
    { wch: 24 },
    { wch: 26 },
    { wch: 22 },
    { wch: 10 },
    { wch: 18 },
    { wch: 30 },
  ];
  XLSX.utils.book_append_sheet(wb, wsMunicipios, "Municipios");

  // 3. Usuarios_Autorizados
  const usrRows = [
    [
      "ID Usuario",
      "Correo Electrónico",
      "Nombre y Apellido",
      "Contraseña (Hash/Simulada)",
      "Municipio Asignado",
      "Rol en el Sistema",
      "Estado",
      "Último Acceso"
    ],
    ...usuarios.map(u => [
      u.id,
      u.email,
      u.nombre,
      u.rawPasswordDemo, // for ready use in demo
      u.municipioAsignado,
      u.rolSistema,
      u.estado,
      u.ultimoAcceso
    ])
  ];
  const wsUsuarios = XLSX.utils.aoa_to_sheet(usrRows);
  wsUsuarios['!cols'] = [
    { wch: 12 },
    { wch: 32 },
    { wch: 28 },
    { wch: 22 },
    { wch: 22 },
    { wch: 22 },
    { wch: 12 },
    { wch: 20 },
  ];
  XLSX.utils.book_append_sheet(wb, wsUsuarios, "Usuarios_Autorizados");

  // Download
  XLSX.writeFile(wb, "Campana_Electoral_Misiones_79_Municipios.xlsx");
}
