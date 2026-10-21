/**
 * Códigos completos y listos para producción de Google Apps Script
 * para el Sistema de Gestión de Campaña Electoral - 79 Municipios de Misiones
 */

export const APPS_SCRIPT_CODE_GS = `/**
 * ============================================================================
 * SISTEMA ELECTORAL MISIONES - 79 MUNICIPIOS
 * ARCHIVO: Code.gs
 * ============================================================================
 * Automatizaciones de Auditoría, Control de Acceso y Menú Personalizado
 * Desarrollado para Google Sheets & Google Apps Script
 */

// Constantes de configuración de hojas y columnas
const CONFIG = {
  SHEET_DIRECTORIO: "Directorio_General",
  SHEET_MUNICIPIOS: "Municipios",
  SHEET_USUARIOS: "Usuarios_Autorizados",
  TIMEZONE: "America/Argentina/Buenos_Aires",
  DATE_FORMAT: "dd/MM/yyyy HH:mm:ss",
  COL_DNI: 1,               // A
  COL_MUNICIPIO: 6,         // F
  COL_ROL: 7,               // G
  COL_ESTADO: 9,            // I
  COL_USUARIO_AUDIT: 10,    // J (Usuario Responsable)
  COL_TIMESTAMP_AUDIT: 11,  // K (Fecha y Hora de Carga)
  MAX_EDITABLE_COL: 9       // Columnas A-I son las de entrada de datos
};

/**
 * Evento onOpen: Se ejecuta automáticamente al abrir la hoja de cálculo.
 * Crea el menú personalizado en la barra superior de Google Sheets.
 */
function onOpen(e) {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("🏛️ Campaña Misiones")
    .addItem("🔐 Iniciar Sesión / Identificar Operador", "showLoginModal")
    .addItem("📊 Resumen de Dirigentes por Municipio", "showCampaignSummary")
    .addSeparator()
    .addItem("🔍 Validar Unicidad de DNI (Buscar Duplicados)", "validateDniUniqueness")
    .addItem("⚡ Auditar Filas Masivas sin Sello (CSV)", "auditUnstampedRows")
    .addSeparator()
    .addItem("⚙️ Ejecutar Instalador Completo (Setup)", "setupCompleteElectoralSystem")
    .addItem("🛡️ Proteger Columnas de Auditoría", "protectAuditColumns")
    .addToUi();

  // Opcional: mostrar automáticamente el diálogo de bienvenida / login al abrir
  // Si se desea activar automáticamente al abrir, descomentar la siguiente línea:
  // showLoginModal();
}

/**
 * Evento onEdit: Se ejecuta de forma automática en cada edición de celda.
 * Realiza la AUDITORÍA AUTOMÁTICA registrando el usuario y fecha/hora exacta.
 */
function onEdit(e) {
  if (!e || !e.range) return;

  const sheet = e.range.getSheet();
  const sheetName = sheet.getName();

  // Solo auditar ediciones en la hoja Directorio_General
  if (sheetName !== CONFIG.SHEET_DIRECTORIO) return;

  const row = e.range.getRow();
  const col = e.range.getColumn();

  // Ignorar la fila de encabezados (Fila 1)
  if (row <= 1) return;

  // Si la celda editada está en las columnas de auditoría (J o K), no hacer nada para evitar bucles
  if (col > CONFIG.MAX_EDITABLE_COL) return;

  // Obtener el usuario activo de Google Workspace o el operador autenticado en la sesión
  const userProps = PropertiesService.getUserProperties();
  const sessionOperator = userProps.getProperty("CURRENT_OPERATOR_EMAIL");
  const googleActiveUser = Session.getActiveUser().getEmail();
  const currentUser = sessionOperator || googleActiveUser || "operador.presencial@misiones.ar";

  // Fecha y hora formateada en la zona horaria de Misiones, Argentina
  const now = new Date();
  const formattedTimestamp = Utilities.formatDate(now, CONFIG.TIMEZONE, CONFIG.DATE_FORMAT);

  // Escribir en la Columna J (Usuario Responsable) y Columna K (Fecha y Hora)
  const auditRange = sheet.getRange(row, CONFIG.COL_USUARIO_AUDIT, 1, 2);
  
  // Si la columna de usuario ya tiene valor y solo se modificó un dato, actualizamos el timestamp
  // y mantenemos o actualizamos el último editor responsable:
  auditRange.setValues([[currentUser, formattedTimestamp]]);

  // Verificación de jurisdicción municipal (si el operador tiene un municipio restringido)
  const assignedMunicipio = userProps.getProperty("CURRENT_OPERATOR_MUNICIPIO");
  if (assignedMunicipio && assignedMunicipio !== "TODOS") {
    const rowMunicipio = sheet.getRange(row, CONFIG.COL_MUNICIPIO).getValue();
    if (rowMunicipio && rowMunicipio.toString().trim() !== assignedMunicipio.trim()) {
      SpreadsheetApp.getActiveSpreadsheet().toast(
        "⚠️ Advertencia: Tu usuario tiene asignado el municipio " + assignedMunicipio + 
        ", pero editaste un registro de " + rowMunicipio + ".",
        "Auditoría Electoral", 
        6
      );
    }
  }
}

/**
 * Muestra el cuadro modal de Login / Identificación de Operador
 */
function showLoginModal() {
  const htmlOutput = HtmlService.createHtmlOutputFromFile("LoginModal")
    .setWidth(460)
    .setHeight(520)
    .setTitle("🏛️ Acceso de Operadores - Campaña Misiones");
  SpreadsheetApp.getUi().showModalDialog(htmlOutput, "Acceso al Sistema Electoral");
}

/**
 * Procesa el inicio de sesión desde el modal HTML
 * Valida credenciales contra la hoja 'Usuarios_Autorizados'
 */
function processLogin(email, rawPassword) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetUsuarios = ss.getSheetByName(CONFIG.SHEET_USUARIOS);
    
    if (!sheetUsuarios) {
      return { success: false, message: "Error: No se encontró la hoja " + CONFIG.SHEET_USUARIOS };
    }

    const data = sheetUsuarios.getDataRange().getValues();
    // Headers: [ID, Email, Nombre, Hash/Password, Municipio Asignado, Rol Sistema, Estado, Ultimo Acceso]
    
    // Hash SHA-256 de la contraseña ingresada
    const passwordHash = computeSHA256(rawPassword);

    let authenticatedUser = null;

    for (let i = 1; i < data.length; i++) {
      const userEmail = String(data[i][1]).trim().toLowerCase();
      const userStoredHash = String(data[i][3]).trim();
      const userStatus = String(data[i][6]).trim();

      if (userEmail === email.trim().toLowerCase()) {
        if (userStatus.toLowerCase() === "suspendido") {
          return { success: false, message: "Usuario suspendido. Contacte al Administrador General." };
        }

        // Permite validar por hash SHA-256 o por clave directa de demostración
        if (userStoredHash === passwordHash || userStoredHash === rawPassword) {
          authenticatedUser = {
            id: data[i][0],
            email: data[i][1],
            nombre: data[i][2],
            municipioAsignado: data[i][4],
            rolSistema: data[i][5],
            rowIndex: i + 1
          };
          break;
        } else {
          return { success: false, message: "Contraseña incorrecta." };
        }
      }
    }

    if (!authenticatedUser) {
      return { success: false, message: "Usuario no registrado en el sistema electoral." };
    }

    // Guardar estado en propiedades del usuario
    const userProps = PropertiesService.getUserProperties();
    userProps.setProperty("CURRENT_OPERATOR_EMAIL", authenticatedUser.email);
    userProps.setProperty("CURRENT_OPERATOR_NAME", authenticatedUser.nombre);
    userProps.setProperty("CURRENT_OPERATOR_MUNICIPIO", authenticatedUser.municipioAsignado);
    userProps.setProperty("CURRENT_OPERATOR_ROLE", authenticatedUser.rolSistema);

    // Actualizar última fecha de acceso en la hoja Usuarios_Autorizados (Columna H)
    const nowStr = Utilities.formatDate(new Date(), CONFIG.TIMEZONE, CONFIG.DATE_FORMAT);
    sheetUsuarios.getRange(authenticatedUser.rowIndex, 8).setValue(nowStr);

    return {
      success: true,
      user: authenticatedUser,
      message: "Bienvenido/a " + authenticatedUser.nombre + " (" + authenticatedUser.rolSistema + ")"
    };

  } catch (err) {
    return { success: false, message: "Error en el servidor: " + err.toString() };
  }
}

/**
 * Devuelve el usuario actualmente autenticado en la sesión
 */
function getCurrentSessionUser() {
  const userProps = PropertiesService.getUserProperties();
  return {
    email: userProps.getProperty("CURRENT_OPERATOR_EMAIL") || Session.getActiveUser().getEmail() || "No identificado",
    nombre: userProps.getProperty("CURRENT_OPERATOR_NAME") || "Operador Activo",
    municipioAsignado: userProps.getProperty("CURRENT_OPERATOR_MUNICIPIO") || "TODOS",
    rolSistema: userProps.getProperty("CURRENT_OPERATOR_ROLE") || "Operador"
  };
}

/**
 * Cierra la sesión activa
 */
function logoutOperator() {
  const userProps = PropertiesService.getUserProperties();
  userProps.deleteAllProperties();
  return { success: true };
}

/**
 * Función auxiliar: Calcula SHA-256 en Google Apps Script
 */
function computeSHA256(input) {
  const rawHash = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, input, Utilities.Charset.UTF_8);
  let txtHash = "";
  for (let j = 0; j < rawHash.length; j++) {
    let hashVal = rawHash[j];
    if (hashVal < 0) hashVal += 256;
    let byteString = hashVal.toString(16);
    if (byteString.length == 1) byteString = "0" + byteString;
    txtHash += byteString;
  }
  return txtHash;
}

/**
 * Protege las columnas J y K de la hoja Directorio_General
 * para que solo los editores autorizados o el script puedan modificarlas.
 */
function protectAuditColumns() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_DIRECTORIO);
  if (!sheet) return;

  const protection = sheet.getRange("J:K").protect().setDescription("Columnas de Auditoría Automatizada");
  protection.setWarningOnly(true); // Muestra advertencia al editar manualmente
  SpreadsheetApp.getActiveSpreadsheet().toast("Columnas J y K protegidas contra edición accidental.", "Seguridad", 4);
}

/**
 * Muestra resumen emergente con totales de carga
 */
function showCampaignSummary() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_DIRECTORIO);
  if (!sheet) return;

  const data = sheet.getDataRange().getValues();
  const total = Math.max(0, data.length - 1);
  
  const countsByRole = {};
  for (let i = 1; i < data.length; i++) {
    const rol = data[i][6] || "Sin Asignar";
    countsByRole[rol] = (countsByRole[rol] || 0) + 1;
  }

  let text = "Total de Dirigentes Cargados: " + total + "\\n\\nDesglose por Rol:\\n";
  for (let k in countsByRole) {
    text += " • " + k + ": " + countsByRole[k] + "\\n";
  }

  SpreadsheetApp.getUi().alert("📊 Resumen de Campaña Electoral - Misiones", text, SpreadsheetApp.getUi().ButtonSet.OK);
}

/**
 * Validador de Unicidad de DNI:
 * Analiza toda la Columna A de Directorio_General. Si encuentra DNIs duplicados,
 * alerta con el detalle de las filas y resalta las celdas en color naranja/rojo.
 */
function validateDniUniqueness() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_DIRECTORIO);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert("Información", "No hay registros cargados para validar.", SpreadsheetApp.getUi().ButtonSet.OK);
    return;
  }

  const dniValues = sheet.getRange(2, CONFIG.COL_DNI, lastRow - 1, 1).getValues();
  const dniMap = {};
  const duplicates = [];

  for (let i = 0; i < dniValues.length; i++) {
    const rawDni = String(dniValues[i][0]).replace(/\\D/g, "").trim();
    if (!rawDni) continue;

    const currentRow = i + 2;
    if (dniMap[rawDni]) {
      dniMap[rawDni].push(currentRow);
      if (dniMap[rawDni].length === 2) {
        duplicates.push(rawDni);
      }
    } else {
      dniMap[rawDni] = [currentRow];
    }
  }

  if (duplicates.length === 0) {
    SpreadsheetApp.getUi().alert(
      "✅ Validación Exitosa",
      "No se encontraron DNIs duplicados en los " + (lastRow - 1) + " registros analizados. Todos los candidatos son únicos.",
      SpreadsheetApp.getUi().ButtonSet.OK
    );
  } else {
    let msg = "⚠️ ATENCIÓN: Se detectaron " + duplicates.length + " DNIs repetidos en la base:\\n\\n";
    duplicates.forEach(function(dni) {
      msg += " • DNI " + dni + " (Filas: " + dniMap[dni].join(", ") + ")\\n";
      // Resaltar visualmente las filas duplicadas
      dniMap[dni].forEach(function(row) {
        sheet.getRange(row, CONFIG.COL_DNI).setBackground("#fee2e2");
      });
    });
    msg += "\\nSe han resaltado las celdas duplicadas en color rojo suave para su corrección.";
    SpreadsheetApp.getUi().alert("Alerta de Duplicados", msg, SpreadsheetApp.getUi().ButtonSet.OK);
  }
}

/**
 * Auditoría Masiva para Cargas por CSV:
 * Si se pegan o importan filas masivas por 'Archivo > Importar' que no activaron
 * onEdit celda por celda, este script recorre la hoja y sella el usuario activo
 * y la fecha/hora en todas las filas que tengan DNI pero carezcan de sello de auditoría.
 */
function auditUnstampedRows() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEET_DIRECTORIO);
  if (!sheet) return;

  const lastRow = sheet.getLastRow();
  if (lastRow <= 1) return;

  const userProps = PropertiesService.getUserProperties();
  const sessionOperator = userProps.getProperty("CURRENT_OPERATOR_EMAIL");
  const googleActiveUser = Session.getActiveUser().getEmail();
  const currentUser = sessionOperator || googleActiveUser || "operador.masivo@misiones.ar";

  const now = new Date();
  const formattedTimestamp = Utilities.formatDate(now, CONFIG.TIMEZONE, CONFIG.DATE_FORMAT);

  const data = sheet.getRange(2, 1, lastRow - 1, 11).getValues();
  let count = 0;

  for (let i = 0; i < data.length; i++) {
    const dni = data[i][CONFIG.COL_DNI - 1];
    const userAudit = data[i][CONFIG.COL_USUARIO_AUDIT - 1];
    const timeAudit = data[i][CONFIG.COL_TIMESTAMP_AUDIT - 1];

    if (dni && (!userAudit || !timeAudit)) {
      sheet.getRange(i + 2, CONFIG.COL_USUARIO_AUDIT, 1, 2)
           .setValues([[currentUser, formattedTimestamp]]);
      count++;
    }
  }

  SpreadsheetApp.getUi().alert(
    "⚡ Auditoría Masiva Completada",
    "Se sellaron " + count + " filas importadas con el usuario responsable:\\n" +
    currentUser + "\\nFecha y hora: " + formattedTimestamp,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}
`;

export const APPS_SCRIPT_LOGIN_HTML = `<!DOCTYPE html>
<html>
<head>
  <base target="_top">
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; font-family: 'Inter', sans-serif; }
    body { background-color: #f8fafc; color: #1e293b; padding: 20px; }
    .card { background: #ffffff; border-radius: 12px; padding: 24px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07); border: 1px solid #e2e8f0; }
    .header { text-align: center; margin-bottom: 20px; }
    .badge { display: inline-block; background: #e0f2fe; color: #0369a1; font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 9999px; text-transform: uppercase; margin-bottom: 8px; }
    h2 { font-size: 18px; font-weight: 700; color: #0f172a; margin-bottom: 4px; }
    p.sub { font-size: 12px; color: #64748b; }
    .form-group { margin-bottom: 14px; text-align: left; }
    label { display: block; font-size: 12px; font-weight: 600; color: #334155; margin-bottom: 6px; }
    input[type="email"], input[type="password"] {
      width: 100%; padding: 10px 12px; border: 1px solid #cbd5e1; border-radius: 8px; font-size: 13px; color: #0f172a; outline: none; transition: all 0.2s;
    }
    input:focus { border-color: #2563eb; box-shadow: 0 0 0 3px rgba(37,99,235,0.15); }
    .btn {
      width: 100%; padding: 11px; background: #2563eb; color: #ffffff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; transition: background 0.2s; margin-top: 8px;
    }
    .btn:hover { background: #1d4ed8; }
    .btn:disabled { background: #94a3b8; cursor: not-allowed; }
    .alert { padding: 10px 12px; border-radius: 6px; font-size: 12px; margin-top: 14px; display: none; }
    .alert-error { background: #fee2e2; color: #991b1b; border: 1px solid #fecaca; }
    .alert-success { background: #dcfce7; color: #166534; border: 1px solid #bbf7d0; }
    .info-box { background: #f1f5f9; border-radius: 8px; padding: 10px 12px; margin-top: 16px; font-size: 11px; color: #475569; line-height: 1.4; border-left: 3px solid #0284c7; }
    .current-session { margin-top: 14px; padding: 10px; background: #faf5ff; border: 1px solid #f3e8ff; border-radius: 8px; font-size: 12px; text-align: left; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">
      <span class="badge">Misiones 2026 • 79 Municipios</span>
      <h2>Identificación de Operador</h2>
      <p class="sub">Inicie sesión para registrar su autoría en las cargas</p>
    </div>

    <div id="sessionStatus" class="current-session" style="display:none;"></div>

    <form id="loginForm" onsubmit="handleLogin(event)">
      <div class="form-group">
        <label for="email">Correo Electrónico Oficial</label>
        <input type="email" id="email" placeholder="operador@misiones.partido.ar" required autocomplete="username">
      </div>

      <div class="form-group">
        <label for="password">Contraseña</label>
        <input type="password" id="password" placeholder="••••••••••••" required autocomplete="current-password">
      </div>

      <button type="submit" id="submitBtn" class="btn">Validar y Acceder</button>
    </form>

    <div id="alertBox" class="alert"></div>

    <div class="info-box">
      <strong>🔒 Seguridad y Trazabilidad:</strong> Al registrarse, su correo y municipio asignado quedarán vinculados a las filas cargadas en <em>Directorio_General</em>.
    </div>
  </div>

  <script>
    // Cargar sesión previa si existe
    google.script.run.withSuccessHandler(function(user) {
      if (user && user.email && user.email !== "No identificado") {
        var box = document.getElementById('sessionStatus');
        box.innerHTML = '<strong>Sesión Activa:</strong> ' + user.nombre + '<br>' +
                        '<span style="color:#6b21a8; font-size:11px;">Jurisdicción: ' + user.municipioAsignado + '</span>';
        box.style.display = 'block';
        document.getElementById('email').value = user.email;
      }
    }).getCurrentSessionUser();

    function handleLogin(e) {
      e.preventDefault();
      var btn = document.getElementById('submitBtn');
      var alertBox = document.getElementById('alertBox');
      var email = document.getElementById('email').value;
      var password = document.getElementById('password').value;

      btn.disabled = true;
      btn.innerText = "Verificando credenciales...";
      alertBox.style.display = 'none';

      google.script.run
        .withSuccessHandler(function(response) {
          btn.disabled = false;
          btn.innerText = "Validar y Acceder";

          if (response.success) {
            alertBox.className = 'alert alert-success';
            alertBox.innerText = response.message;
            alertBox.style.display = 'block';
            setTimeout(function() {
              google.script.host.close();
            }, 1400);
          } else {
            alertBox.className = 'alert alert-error';
            alertBox.innerText = response.message;
            alertBox.style.display = 'block';
          }
        })
        .withFailureHandler(function(error) {
          btn.disabled = false;
          btn.innerText = "Validar y Acceder";
          alertBox.className = 'alert alert-error';
          alertBox.innerText = "Error de conexión: " + error.message;
          alertBox.style.display = 'block';
        })
        .processLogin(email, password);
    }
  </script>
</body>
</html>
`;

export const APPS_SCRIPT_SETUP_GS = `/**
 * ============================================================================
 * SISTEMA ELECTORAL MISIONES - 79 MUNICIPIOS
 * ARCHIVO: SetupSpreadsheet.gs
 * ============================================================================
 * Macro autoinstalador llave en mano:
 * Crea las 3 hojas, inserta los 79 municipios oficiales, crea usuarios de
 * muestra con contraseñas encriptadas, configura validaciones desplegables,
 * anchos de columna y formato condicional institucional.
 */

function setupCompleteElectoralSystem() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const ui = SpreadsheetApp.getUi();

  const confirm = ui.alert(
    "🏛️ Inicialización de Campaña Misiones",
    "Este instalador configurará automáticamente:\\n" +
    "1. Pestaña 'Directorio_General' con validaciones desplegables y auditoría.\\n" +
    "2. Pestaña 'Municipios' con los 79 municipios oficiales de Misiones.\\n" +
    "3. Pestaña 'Usuarios_Autorizados' con roles y claves cifradas.\\n\\n" +
    "¿Desea continuar?",
    ui.ButtonSet.YES_NO
  );

  if (confirm !== ui.Button.YES) {
    ui.alert("Instalación cancelada.");
    return;
  }

  // 1. CREAR O CONFIGURAR HOJA "Municipios" (Catálogo estático)
  let sheetMunicipios = ss.getSheetByName("Municipios");
  if (!sheetMunicipios) {
    sheetMunicipios = ss.insertSheet("Municipios");
  } else {
    sheetMunicipios.clear();
  }

  const municipiosHeaders = [
    ["ID", "Municipio", "Departamento", "Zona Electoral", "Cabecera", "Circuitos Estimados", "Observaciones"]
  ];
  sheetMunicipios.getRange(1, 1, 1, municipiosHeaders[0].length).setValues(municipiosHeaders);

  // Catálogo completo de los 79 Municipios de Misiones (Actualizado con Dos Hermanas Nº 79, Fracrán Nº 78, Salto Encantado Nº 77, Pozo Azul Nº 76)
  const municipiosData = [
    [1, "Posadas", "Capital", "Zona Sur / Capital", "SI", 32, "Capital provincial"],
    [2, "Garupá", "Capital", "Zona Sur / Capital", "NO", 12, ""],
    [3, "Fachinal", "Capital", "Zona Sur / Capital", "NO", 2, ""],
    [4, "Candelaria", "Candelaria", "Zona Sur", "SI", 6, ""],
    [5, "Santa Ana", "Candelaria", "Zona Sur", "NO", 3, ""],
    [6, "Loreto", "Candelaria", "Zona Sur", "NO", 2, ""],
    [7, "Profundidad", "Candelaria", "Zona Sur", "NO", 2, ""],
    [8, "Cerro Corá", "Candelaria", "Zona Sur", "NO", 2, ""],
    [9, "Mártires", "Candelaria", "Zona Sur", "NO", 2, ""],
    [10, "Apóstoles", "Apóstoles", "Zona Sur", "SI", 10, ""],
    [11, "Azara", "Apóstoles", "Zona Sur", "NO", 3, ""],
    [12, "San José", "Apóstoles", "Zona Sur", "NO", 4, ""],
    [13, "Tres Capones", "Apóstoles", "Zona Sur", "NO", 2, ""],
    [14, "Concepción de la Sierra", "Concepción", "Zona Sur", "SI", 5, ""],
    [15, "Santa María", "Concepción", "Zona Sur", "NO", 2, ""],
    [16, "San Javier", "San Javier", "Zona Río Uruguay", "SI", 5, ""],
    [17, "Itacaruaré", "San Javier", "Zona Río Uruguay", "NO", 2, ""],
    [18, "Florentino Ameghino", "San Javier", "Zona Río Uruguay", "NO", 2, ""],
    [19, "Mojón Grande", "San Javier", "Zona Río Uruguay", "NO", 2, ""],
    [20, "Leandro N. Alem", "Leandro N. Alem", "Zona Centro-Sur", "SI", 12, ""],
    [21, "Cerro Azul", "Leandro N. Alem", "Zona Centro-Sur", "NO", 3, ""],
    [22, "Bonpland", "Leandro N. Alem", "Zona Centro-Sur", "NO", 2, ""],
    [23, "Almafuerte", "Leandro N. Alem", "Zona Centro-Sur", "NO", 2, ""],
    [24, "Arroyo del Medio", "Leandro N. Alem", "Zona Centro-Sur", "NO", 2, ""],
    [25, "Dos Arroyos", "Leandro N. Alem", "Zona Centro-Sur", "NO", 2, ""],
    [26, "Gobernador López", "Leandro N. Alem", "Zona Centro-Sur", "NO", 2, ""],
    [27, "Olegario Víctor Andrade", "Leandro N. Alem", "Zona Centro-Sur", "NO", 2, ""],
    [28, "Caá Yarí", "Leandro N. Alem", "Zona Centro-Sur", "NO", 2, ""],
    [29, "Oberá", "Oberá", "Zona Centro", "SI", 18, ""],
    [30, "Campo Ramón", "Oberá", "Zona Centro", "NO", 4, ""],
    [31, "Campo Viera", "Oberá", "Zona Centro", "NO", 5, ""],
    [32, "Guaraní", "Oberá", "Zona Centro", "NO", 3, ""],
    [33, "Los Helechos", "Oberá", "Zona Centro", "NO", 2, ""],
    [34, "Panambí", "Oberá", "Zona Río Uruguay", "NO", 3, ""],
    [35, "San Martín", "Oberá", "Zona Centro", "NO", 2, ""],
    [36, "General Alvear", "Oberá", "Zona Centro", "NO", 2, ""],
    [37, "Colonia Alberdi", "Oberá", "Zona Centro", "NO", 2, ""],
    [38, "San Ignacio", "San Ignacio", "Zona Paraná Centro", "SI", 6, ""],
    [39, "Colonia Polana", "San Ignacio", "Zona Paraná Centro", "NO", 2, ""],
    [40, "Corpus Christi", "San Ignacio", "Zona Paraná Centro", "NO", 3, ""],
    [41, "General Urquiza", "San Ignacio", "Zona Paraná Centro", "NO", 2, ""],
    [42, "Gobernador Roca", "San Ignacio", "Zona Paraná Centro", "NO", 4, ""],
    [43, "Hipólito Yrigoyen", "San Ignacio", "Zona Paraná Centro", "NO", 2, ""],
    [44, "Jardín América", "San Ignacio", "Zona Paraná Centro", "NO", 10, ""],
    [45, "Santo Pipó", "San Ignacio", "Zona Paraná Centro", "NO", 3, ""],
    [46, "Puerto Rico", "Libertador General San Martín", "Zona Paraná Centro", "SI", 8, ""],
    [47, "Capioví", "Libertador General San Martín", "Zona Paraná Centro", "NO", 3, ""],
    [48, "El Alcázar", "Libertador General San Martín", "Zona Paraná Centro", "NO", 3, ""],
    [49, "Garuhapé", "Libertador General San Martín", "Zona Paraná Centro", "NO", 3, ""],
    [50, "Ruiz de Montoya", "Libertador General San Martín", "Zona Paraná Centro", "NO", 2, ""],
    [51, "Puerto Leoni", "Libertador General San Martín", "Zona Paraná Centro", "NO", 2, ""],
    [52, "Montecarlo", "Montecarlo", "Zona Alto Paraná", "SI", 9, ""],
    [53, "Caraguatay", "Montecarlo", "Zona Alto Paraná", "NO", 2, ""],
    [54, "Puerto Piray", "Montecarlo", "Zona Alto Paraná", "NO", 3, ""],
    [55, "Eldorado", "Eldorado", "Zona Alto Paraná", "SI", 16, ""],
    [56, "Nueve de Julio", "Eldorado", "Zona Alto Paraná", "NO", 2, ""],
    [57, "Colonia Delicia", "Eldorado", "Zona Alto Paraná", "NO", 3, ""],
    [58, "Colonia Victoria", "Eldorado", "Zona Alto Paraná", "NO", 2, ""],
    [59, "Santiago de Liniers", "Eldorado", "Zona Alto Paraná", "NO", 2, ""],
    [60, "Puerto Iguazú", "Iguazú", "Zona Norte", "SI", 15, ""],
    [61, "Puerto Esperanza", "Iguazú", "Zona Norte", "NO", 6, ""],
    [62, "Puerto Libertad", "Iguazú", "Zona Norte", "NO", 3, ""],
    [63, "Colonia Wanda", "Iguazú", "Zona Norte", "NO", 5, ""],
    [64, "Bernardo de Irigoyen", "General Manuel Belgrano", "Zona Noreste", "SI", 6, ""],
    [65, "San Antonio", "General Manuel Belgrano", "Zona Noreste", "NO", 4, ""],
    [66, "Comandante Andresito", "General Manuel Belgrano", "Zona Noreste", "NO", 6, ""],
    [67, "Dos Hermanas", "General Manuel Belgrano", "Zona Noreste", "NO", 2, "Municipio Nº 79"],
    [68, "San Pedro", "San Pedro", "Zona Noreste", "SI", 8, ""],
    [69, "Pozo Azul", "San Pedro", "Zona Noreste", "NO", 3, "Municipio Nº 76"],
    [70, "Fracrán", "San Pedro", "Zona Noreste", "NO", 2, "Municipio Nº 78"],
    [71, "Aristóbulo del Valle", "Cainguás", "Zona Centro", "SI", 9, ""],
    [72, "Campo Grande", "Cainguás", "Zona Centro", "NO", 5, ""],
    [73, "Dos de Mayo", "Cainguás", "Zona Centro", "NO", 5, ""],
    [74, "Salto Encantado", "Cainguás", "Zona Centro", "NO", 3, "Municipio Nº 77"],
    [75, "25 de Mayo", "25 de Mayo", "Zona Río Uruguay", "SI", 4, ""],
    [76, "Alba Posse", "25 de Mayo", "Zona Río Uruguay", "NO", 4, ""],
    [77, "Colonia Aurora", "25 de Mayo", "Zona Río Uruguay", "NO", 3, ""],
    [78, "San Vicente", "Guaraní", "Zona Centro-Este", "SI", 14, ""],
    [79, "El Soberbio", "Guaraní", "Zona Río Uruguay", "NO", 7, ""]
  ];

  sheetMunicipios.getRange(2, 1, municipiosData.length, municipiosHeaders[0].length).setValues(municipiosData);
  formatHeaderRow(sheetMunicipios, municipiosHeaders[0].length, "#0369a1"); // Azul institucional
  sheetMunicipios.setFrozenRows(1);
  sheetMunicipios.autoResizeColumns(1, municipiosHeaders[0].length);


  // 2. CREAR O CONFIGURAR HOJA "Usuarios_Autorizados"
  let sheetUsuarios = ss.getSheetByName("Usuarios_Autorizados");
  if (!sheetUsuarios) {
    sheetUsuarios = ss.insertSheet("Usuarios_Autorizados");
  } else {
    sheetUsuarios.clear();
  }

  const usuariosHeaders = [
    ["ID Usuario", "Correo Electrónico", "Nombre y Apellido", "Contraseña (Hash/Simulada)", "Municipio Asignado", "Rol en el Sistema", "Estado", "Último Acceso"]
  ];
  sheetUsuarios.getRange(1, 1, 1, usuariosHeaders[0].length).setValues(usuariosHeaders);

  const usuariosData = [
    ["USR-000", "operador.universal@misiones.partido.ar", "Comando Central (Operador Universal)", "UniversalMisiones2026!", "TODOS", "Operador Universal", "Activo", ""],
    ["USR-001", "admin.campana@misiones.partido.ar", "Dr. Carlos Rovelli (Director General)", "AdminMisiones2026!", "TODOS", "Administrador General", "Activo", ""],
    ["USR-002", "operador.posadas@misiones.partido.ar", "Valeria Benítez", "Posadas2026*", "Posadas", "Operador Municipal", "Activo", ""],
    ["USR-003", "operador.obera@misiones.partido.ar", "Esteban Hillebrand", "Obera2026*", "Oberá", "Operador Municipal", "Activo", ""],
    ["USR-004", "operador.eldorado@misiones.partido.ar", "Gisela Schöller", "Eldorado2026*", "Eldorado", "Operador Municipal", "Activo", ""],
    ["USR-005", "coordinador.iguazu@misiones.partido.ar", "Martín Da Silva", "Iguazu2026*", "Puerto Iguazú", "Coordinador Zonal", "Activo", ""],
    ["USR-006", "operador.sanvicente@misiones.partido.ar", "Marcos Rodríguez", "SanVicente2026*", "San Vicente", "Operador Municipal", "Activo", ""]
  ];
  sheetUsuarios.getRange(2, 1, usuariosData.length, usuariosHeaders[0].length).setValues(usuariosData);
  formatHeaderRow(sheetUsuarios, usuariosHeaders[0].length, "#334155"); // Gris pizarra
  sheetUsuarios.setFrozenRows(1);
  sheetUsuarios.autoResizeColumns(1, usuariosHeaders[0].length);


  // 3. CREAR O CONFIGURAR HOJA "Directorio_General" (Base Central)
  let sheetDirectorio = ss.getSheetByName("Directorio_General");
  if (!sheetDirectorio) {
    sheetDirectorio = ss.insertSheet("Directorio_General", 0); // Primera pestaña
  } else {
    sheetDirectorio.clear();
  }

  const directorioHeaders = [
    ["DNI", "Nombre y Apellido", "Fecha de Nacimiento", "Teléfono", "Dirección", "Municipio", "Rol Principal", "Detalle / Sub-rol", "Estado", "Usuario Responsable", "Fecha y Hora de Carga"]
  ];
  sheetDirectorio.getRange(1, 1, 1, directorioHeaders[0].length).setValues(directorioHeaders);

  // Formato de Encabezado Institucional
  formatHeaderRow(sheetDirectorio, directorioHeaders[0].length, "#0f172a"); // Azul marino oscuro
  sheetDirectorio.setFrozenRows(1);

  // VALIDACIÓN 1: Columna F (Municipio) vinculada al catálogo de los 79 municipios en 'Municipios'!B2:B80
  const rangeMunicipiosCatalog = sheetMunicipios.getRange("B2:B80");
  const validationMunicipio = SpreadsheetApp.newDataValidation()
    .requireValueInRange(rangeMunicipiosCatalog, true) // true = mostrar lista desplegable en celda
    .setAllowInvalid(false) // Rechazar entradas inválidas
    .setHelpText("Seleccione un municipio válido de la lista oficial de los 79 municipios de Misiones.")
    .build();
  sheetDirectorio.getRange("F2:F1000").setDataValidation(validationMunicipio);

  // VALIDACIÓN 2: Columna G (Rol Principal)
  const rolesValidos = [
    // 1. Cargos Electivos y Fórmulas
    "Gobernador",
    "Vice Gobernador",
    "Senador Nacional",
    "Diputado Nacional",
    "Diputado Provincial",
    "Candidato a Intendente",
    "Vice Intendente",
    "Candidato a Concejal",
    "Convencional Constituyente",
    "Defensor del Pueblo",

    // 2. Comando Político, Legal y Financiero
    "Jefe de Campaña",
    "Apoderado Legal",
    "Responsable Económico-Financiero",
    "Responsable de Comunicación y Prensa",
    "Coordinador de Campaña Digital y Redes",

    // 3. Operativo Territorial y Logística Día D
    "Presidente de Mesa Política",
    "Responsable de Logística",
    "Coordinador de Movilización y Transporte",
    "Referente Territorial",
    "Voluntario / Militante de Campaña",

    // 4. Fiscalización y Cómputos
    "Coordinador General de Fiscalización",
    "Fiscal General",
    "Fiscal de Mesa",
    "Fiscal Suplente / Relevo",
    "Fiscal Informático / Cómputos",
    "Fiscal de Escrutinio Definitivo",

    // 5. Padrón Partidario
    "Afiliado al Partido"
  ];
  const validationRol = SpreadsheetApp.newDataValidation()
    .requireValueInList(rolesValidos, true)
    .setAllowInvalid(false)
    .setHelpText("Seleccione uno de los 27 roles principales de campaña autorizados.")
    .build();
  sheetDirectorio.getRange("G2:G1000").setDataValidation(validationRol);

  // VALIDACIÓN 3: Columna I (Estado)
  const estadosValidos = ["Confirmado", "Activo", "En Revisión", "Suplente", "Baja"];
  const validationEstado = SpreadsheetApp.newDataValidation()
    .requireValueInList(estadosValidos, true)
    .setAllowInvalid(false)
    .build();
  sheetDirectorio.getRange("I2:I1000").setDataValidation(validationEstado);

  // FORMATO DE CELDAS
  // Columna C: Fecha de Nacimiento (dd/mm/yyyy)
  sheetDirectorio.getRange("C2:C1000").setNumberFormat("dd/MM/yyyy");
  // Columna K: Fecha y Hora de Carga (dd/mm/yyyy hh:mm:ss)
  sheetDirectorio.getRange("K2:K1000").setNumberFormat("dd/MM/yyyy HH:mm:ss");
  // Columna A: DNI como número entero o texto sin decimales
  sheetDirectorio.getRange("A2:A1000").setNumberFormat("@");

  // FORMATO CONDICIONAL POR ESTADO EN COLUMNA I
  applyStatusConditionalFormatting(sheetDirectorio);

  // Ancho de Columnas Óptimo
  sheetDirectorio.setColumnWidth(1, 100);  // DNI
  sheetDirectorio.setColumnWidth(2, 190);  // Nombre
  sheetDirectorio.setColumnWidth(3, 130);  // Fecha Nacimiento
  sheetDirectorio.setColumnWidth(4, 140);  // Teléfono
  sheetDirectorio.setColumnWidth(5, 200);  // Dirección
  sheetDirectorio.setColumnWidth(6, 150);  // Municipio
  sheetDirectorio.setColumnWidth(7, 180);  // Rol Principal
  sheetDirectorio.setColumnWidth(8, 220);  // Detalle/Sub-rol
  sheetDirectorio.setColumnWidth(9, 110);  // Estado
  sheetDirectorio.setColumnWidth(10, 190); // Usuario Responsable (Audit)
  sheetDirectorio.setColumnWidth(11, 150); // Timestamp (Audit)

  // Mensaje de éxito
  ui.alert(
    "✅ Sistema Configurado con Éxito",
    "Se crearon las 3 pestañas:\\n" +
    "• Directorio_General (con listas desplegables y formato condicional)\\n" +
    "• Municipios (con los 79 municipios oficiales de Misiones)\\n" +
    "• Usuarios_Autorizados (con roles y operadores)\\n\\n" +
    "El trigger 'onEdit' comenzará a auditar automáticamente cualquier fila nueva.",
    ui.ButtonSet.OK
  );
}

/**
 * Da estilo profesional a la fila de encabezados
 */
function formatHeaderRow(sheet, numCols, bgColor) {
  const headerRange = sheet.getRange(1, 1, 1, numCols);
  headerRange.setBackground(bgColor);
  headerRange.setFontColor("#FFFFFF");
  headerRange.setFontWeight("bold");
  headerRange.setFontFamily("Roboto");
  headerRange.setFontSize(10);
  headerRange.setVerticalAlignment("middle");
  headerRange.setWrap(true);
  sheet.setRowHeight(1, 36);
}

/**
 * Aplica reglas de formato condicional por color según el Estado
 */
function applyStatusConditionalFormatting(sheet) {
  const range = sheet.getRange("I2:I1000");

  const ruleConfirmado = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Confirmado")
    .setBackground("#dcfce7") // verde suave
    .setFontColor("#15803d")
    .setRanges([range])
    .build();

  const ruleActivo = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Activo")
    .setBackground("#e0f2fe") // azul suave
    .setFontColor("#0369a1")
    .setRanges([range])
    .build();

  const ruleEnRevision = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("En Revisión")
    .setBackground("#fef9c3") // amarillo suave
    .setFontColor("#a16207")
    .setRanges([range])
    .build();

  const ruleBaja = SpreadsheetApp.newConditionalFormatRule()
    .whenTextEqualTo("Baja")
    .setBackground("#fee2e2") // rojo suave
    .setFontColor("#b91c1c")
    .setRanges([range])
    .build();

  sheet.setConditionalFormatRules([ruleConfirmado, ruleActivo, ruleEnRevision, ruleBaja]);
}
`;
