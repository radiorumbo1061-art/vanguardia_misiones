import React, { useState } from 'react';
import { 
  UsuarioAutorizado, 
  USUARIOS_INICIALES 
} from '../data/initialData';
import { MUNICIPIOS_MISIONES } from '../data/municipiosMisiones';
import { 
  ShieldCheck, 
  UserPlus, 
  Key, 
  Lock, 
  CheckCircle2, 
  UserCheck, 
  AlertTriangle, 
  HelpCircle,
  Eye,
  EyeOff,
  Sparkles,
  Trash2,
  Crown,
  UserX,
  AlertCircle,
  LayoutGrid,
  List
} from 'lucide-react';

interface UsuariosViewProps {
  usuarios: UsuarioAutorizado[];
  setUsuarios: React.Dispatch<React.SetStateAction<UsuarioAutorizado[]>>;
  currentUser: UsuarioAutorizado;
  setCurrentUser: (user: UsuarioAutorizado) => void;
}

export const UsuariosView: React.FC<UsuariosViewProps> = ({
  usuarios,
  setUsuarios,
  currentUser,
  setCurrentUser,
}) => {
  const [showRawPasswords, setShowRawPasswords] = useState(false);
  const [operatorViewMode, setOperatorViewMode] = useState<'cards' | 'table'>('table');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UsuarioAutorizado | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [newEmail, setNewEmail] = useState('');
  const [newNombre, setNewNombre] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newMunicipio, setNewMunicipio] = useState('TODOS');
  const [newRol, setNewRol] = useState<UsuarioAutorizado['rolSistema']>('Operador Universal');
  const [formError, setFormError] = useState<string | null>(null);

  // Compute a simple SHA-256 hex string in browser
  const computeClientSHA256 = async (str: string) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail || !newNombre || !newPassword) {
      setFormError('Por favor complete todos los campos obligatorios.');
      return;
    }

    // Check duplicate email
    if (usuarios.some(u => u.email.toLowerCase() === newEmail.trim().toLowerCase())) {
      setFormError('Ya existe un operador registrado con ese correo electrónico.');
      return;
    }

    const hash = await computeClientSHA256(newPassword);
    const newUser: UsuarioAutorizado = {
      id: `USR-${(usuarios.length + 1).toString().padStart(3, '0')}`,
      email: newEmail.trim().toLowerCase(),
      nombre: newNombre.trim(),
      passwordHash: hash,
      rawPasswordDemo: newPassword,
      municipioAsignado: newRol === 'Operador Universal' ? 'TODOS' : newMunicipio,
      rolSistema: newRol,
      estado: 'Activo',
      ultimoAcceso: 'Nunca',
    };

    setUsuarios(prev => [...prev, newUser]);
    setIsModalOpen(false);
    setNewEmail('');
    setNewNombre('');
    setNewPassword('');
    setNewMunicipio('TODOS');
    setNewRol('Operador Universal');
    setFormError(null);
    showToast(`Operador "${newUser.nombre}" creado exitosamente con rol ${newUser.rolSistema}.`, 'success');
  };

  const handleSwitchUser = (user: UsuarioAutorizado) => {
    setCurrentUser(user);
    showToast(`Sesión activa cambiada a: ${user.nombre} (${user.rolSistema}).`, 'success');
  };

  const handleSwitchToUniversal = () => {
    const universal = usuarios.find(u => u.rolSistema === 'Operador Universal') || usuarios[0];
    setCurrentUser(universal);
    showToast(`Modo Operador Universal activado: ${universal.nombre}`, 'success');
  };

  const handleDeleteUser = (user: UsuarioAutorizado) => {
    if (user.id === currentUser.id) {
      showToast('No es posible eliminar el operador con la sesión actualmente activa. Cambia a otro operador primero.', 'error');
      setUserToDelete(null);
      return;
    }

    if (usuarios.length <= 1) {
      showToast('No se puede eliminar el único operador restante del sistema.', 'error');
      setUserToDelete(null);
      return;
    }

    setUsuarios(prev => prev.filter(u => u.id !== user.id));
    showToast(`Operador "${user.nombre}" (${user.email}) ha sido eliminado del sistema.`, 'success');
    setUserToDelete(null);
  };

  const isCurrentUniversal = currentUser.rolSistema === 'Operador Universal';

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-3 shadow-md animate-fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
          <button onClick={() => setNotification(null)} className="font-bold opacity-60 hover:opacity-100 cursor-pointer">
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-purple-100 text-purple-800 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 text-purple-700" />
              Pestaña 3 • Gestión de Operadores y Accesos
            </span>
            <span className="text-xs text-slate-500">Google Sheets: Hoja "Usuarios_Autorizados"</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">Operadores Autorizados y Control de Acceso</h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Administre las altas y bajas de operadores territoriales, claves encriptadas SHA-256 y opere con facultades de Operador Universal para los 79 municipios.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {!isCurrentUniversal && (
            <button
              onClick={handleSwitchToUniversal}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 text-xs font-semibold shadow-xs transition cursor-pointer"
              title="Activar perfil de Operador Universal con control provincial total"
            >
              <Crown className="w-4 h-4 text-amber-600" />
              <span>Activar Operador Universal</span>
            </button>
          )}

          <button
            onClick={() => setShowRawPasswords(!showRawPasswords)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 transition cursor-pointer"
          >
            {showRawPasswords ? <EyeOff className="w-4 h-4 text-slate-500" /> : <Eye className="w-4 h-4 text-slate-500" />}
            <span>{showRawPasswords ? 'Ocultar Claves Demo' : 'Ver Claves Demo'}</span>
          </button>

          <button
            onClick={() => {
              setNewRol('Operador Universal');
              setNewMunicipio('TODOS');
              setIsModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-medium text-xs shadow-sm transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Nuevo Operador</span>
          </button>
        </div>
      </div>

      {/* Operador Universal Privileges Banner */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-purple-800/40 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 border border-purple-400/30 shadow-inner">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Operador Universal del Comando Electoral
                </h3>
                <span className="bg-amber-400/20 text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border border-amber-400/30">
                  Super Administrador Provincial
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
                El <strong>Operador Universal</strong> posee facultades absolutas para <strong>dar de alta y eliminar registros de operadores</strong>, gestionar la base completa de los <strong>79 municipios</strong> de Misiones sin restricción territorial, y supervisar la carga de autoridades, fiscales de mesa y fiscales generales.
              </p>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs px-4 py-3 rounded-xl border border-white/10 text-xs space-y-1 shrink-0">
            <div className="text-slate-400 text-[10px] uppercase tracking-wider font-semibold">Operador con Sesión Actual:</div>
            <div className="font-bold text-white flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              {currentUser.nombre}
            </div>
            <div className="text-purple-300 text-[11px] font-medium flex items-center gap-1">
              <span>{currentUser.rolSistema}</span>
              <span>•</span>
              <span>{currentUser.municipioAsignado === 'TODOS' ? '79 Municipios' : currentUser.municipioAsignado}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar for Operators List */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200/90 shadow-xs">
        <div>
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <span>Operadores Autorizados en el Sistema</span>
            <span className="bg-purple-100 text-purple-800 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
              {usuarios.length}
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Personal acreditado para auditoría en Hoja 'Usuarios_Autorizados' de Google Sheets.
          </p>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setOperatorViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer min-h-[36px] ${
              operatorViewMode === 'cards'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Vista en Tarjetas (Óptima para celulares)"
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Tarjetas</span>
          </button>

          <button
            type="button"
            onClick={() => setOperatorViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer min-h-[36px] ${
              operatorViewMode === 'table'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
            title="Vista en Tabla"
          >
            <List className="w-3.5 h-3.5" />
            <span>Tabla</span>
          </button>
        </div>
      </div>

      {/* Operators List: Cards or Table */}
      {operatorViewMode === 'cards' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {usuarios.map(u => {
            const isCurrent = currentUser.id === u.id;
            const isUniversal = u.rolSistema === 'Operador Universal';

            return (
              <div
                key={u.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all duration-200 flex flex-col justify-between gap-3 shadow-xs ${
                  isCurrent
                    ? 'border-purple-500 bg-purple-50/30 ring-2 ring-purple-400/20 shadow-md'
                    : 'border-slate-200/90 hover:border-slate-300'
                }`}
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {u.id}
                    </span>
                    <span className="bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                      {u.estado}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                      {isUniversal && <Crown className="w-4 h-4 text-amber-500 shrink-0" />}
                      <span>{u.nombre}</span>
                    </h4>
                    <p className="text-xs text-slate-500 font-mono mt-0.5 truncate" title={u.email}>
                      {u.email}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${
                      isUniversal
                        ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold'
                        : u.rolSistema === 'Administrador General'
                        ? 'bg-purple-100 text-purple-900 border-purple-200'
                        : 'bg-slate-100 text-slate-800 border-slate-200'
                    }`}>
                      {u.rolSistema}
                    </span>

                    <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2.5 py-0.5 rounded-full text-[11px] font-medium">
                      📍 {u.municipioAsignado === 'TODOS' ? '79 Municipios' : u.municipioAsignado}
                    </span>
                  </div>

                  {/* Password row */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs flex items-center justify-between gap-2">
                    <span className="text-slate-500 text-[11px]">Clave:</span>
                    {showRawPasswords ? (
                      <span className="bg-amber-100 text-amber-900 font-mono font-bold px-2 py-0.5 rounded text-[11px]">
                        {u.rawPasswordDemo}
                      </span>
                    ) : (
                      <span className="font-mono text-slate-400 text-[11px]">••••••••</span>
                    )}
                  </div>

                  <p className="text-[10px] text-slate-400 font-mono">
                    Último acceso: {u.ultimoAcceso || 'Nunca'}
                  </p>
                </div>

                {/* Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isCurrent ? (
                    <span className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white py-2 px-3 rounded-xl text-xs font-semibold shadow-xs min-h-[40px]">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Sesión Activa</span>
                    </span>
                  ) : (
                    <button
                      onClick={() => handleSwitchUser(u)}
                      className="flex-1 py-2 px-3 rounded-xl border border-purple-300 bg-purple-50/70 hover:bg-purple-100 text-purple-800 text-xs font-semibold transition cursor-pointer min-h-[40px]"
                      title="Iniciar sesión como este operador"
                    >
                      Usar Operador
                    </button>
                  )}

                  <button
                    onClick={() => setUserToDelete(u)}
                    disabled={isCurrent}
                    title={isCurrent ? "No puedes eliminar el operador activo" : `Eliminar a ${u.nombre}`}
                    aria-label={`Eliminar a ${u.nombre}`}
                    className={`p-2 rounded-xl border transition min-h-[40px] min-w-[40px] flex items-center justify-center ${
                      isCurrent
                        ? 'opacity-30 border-slate-200 text-slate-400 cursor-not-allowed'
                        : 'border-red-200 text-red-600 hover:bg-red-50 cursor-pointer'
                    }`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800 text-white uppercase text-[11px] tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-3">ID</th>
                  <th className="py-3 px-3">Correo Electrónico Oficial</th>
                  <th className="py-3 px-3">Nombre y Apellido</th>
                  <th className="py-3 px-3">Contraseña (Hash / Demo)</th>
                  <th className="py-3 px-3 bg-slate-900 text-purple-300">Municipio Asignado</th>
                  <th className="py-3 px-3">Rol en el Sistema</th>
                  <th className="py-3 px-3">Estado</th>
                  <th className="py-3 px-3">Último Acceso</th>
                  <th className="py-3 px-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {usuarios.map(u => {
                  const isCurrent = currentUser.id === u.id;
                  const isUniversal = u.rolSistema === 'Operador Universal';
                  return (
                    <tr
                      key={u.id}
                      className={`transition-colors ${
                        isCurrent ? 'bg-purple-50/70 font-medium' : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3 px-3 font-mono font-bold text-slate-600">
                        {u.id}
                      </td>
                      <td className="py-3 px-3 font-medium text-slate-900 whitespace-nowrap">
                        {u.email}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap font-medium text-slate-800">
                        <div className="flex items-center gap-1.5">
                          {isUniversal && <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />}
                          <span>{u.nombre}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 font-mono text-[11px] text-slate-500 max-w-[180px] truncate">
                        {showRawPasswords ? (
                          <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded">
                            {u.rawPasswordDemo}
                          </span>
                        ) : (
                          <span title={u.passwordHash}>{u.passwordHash.slice(0, 16)}...</span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap bg-purple-50/40">
                        {u.municipioAsignado === 'TODOS' ? (
                          <span className="bg-purple-100 text-purple-900 font-bold px-2 py-0.5 rounded text-[11px]">
                            TODOS (Provincial)
                          </span>
                        ) : (
                          <span className="bg-blue-100 text-blue-900 font-bold px-2 py-0.5 rounded text-[11px]">
                            {u.municipioAsignado}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                          isUniversal
                            ? 'bg-amber-100 text-amber-900 border-amber-300'
                            : u.rolSistema === 'Administrador General'
                            ? 'bg-purple-100 text-purple-900 border-purple-200'
                            : u.rolSistema === 'Coordinador Zonal'
                            ? 'bg-indigo-100 text-indigo-900 border-indigo-200'
                            : 'bg-slate-100 text-slate-800 border-slate-200'
                        }`}>
                          {u.rolSistema}
                        </span>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full text-[10px] font-bold">
                          {u.estado}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {u.ultimoAcceso || '-'}
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          {isCurrent ? (
                            <span className="inline-flex items-center gap-1 bg-emerald-600 text-white px-2.5 py-1.5 rounded-lg text-xs font-semibold shadow-xs min-h-[38px]">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Sesión Activa
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSwitchUser(u)}
                              className="px-2.5 py-1.5 rounded-lg border border-purple-200 text-purple-700 hover:bg-purple-100 text-xs font-medium transition cursor-pointer min-h-[38px]"
                              title="Cambiar sesión activa a este operador"
                            >
                              Usar Operador
                            </button>
                          )}

                          {/* Botón de Eliminación de Operador (Operador Universal / Administrador) */}
                          <button
                            onClick={() => setUserToDelete(u)}
                            disabled={isCurrent}
                            title={isCurrent ? "No puedes eliminar al operador con sesión activa" : `Eliminar a ${u.nombre}`}
                            aria-label={`Eliminar a ${u.nombre}`}
                            className={`p-2 rounded-lg border transition min-h-[38px] min-w-[38px] flex items-center justify-center ${
                              isCurrent
                                ? 'opacity-40 border-slate-200 text-slate-400 cursor-not-allowed'
                                : 'border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 cursor-pointer'
                            }`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-500 text-xs flex flex-col sm:flex-row justify-between items-center gap-2">
          <span>{usuarios.length} operadores registrados en la base interna</span>
          <span className="text-[11px] text-slate-500">
            Facultad de Operador Universal: Puede agregar nuevos operadores o eliminar registros existentes en cualquier momento.
          </span>
        </div>

      {/* Confirmation Modal to Delete Operator */}
      {userToDelete && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl p-6 relative">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-3">
              <UserX className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 text-center">
              ¿Eliminar Operador Autorizado?
            </h3>
            <p className="text-xs text-slate-600 text-center mt-2">
              Está a punto de dar de baja al operador <strong>"{userToDelete.nombre}"</strong> ({userToDelete.email}), con rol <strong>{userToDelete.rolSistema}</strong>.
            </p>
            <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200 mt-3 text-center">
              ⚠️ Esta acción revocará sus credenciales de acceso y ya no podrá realizar cargas ni firmar auditorías en el sistema electoral.
            </p>

            <div className="flex items-center justify-center gap-3 mt-5">
              <button
                type="button"
                onClick={() => setUserToDelete(null)}
                className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs font-medium hover:bg-slate-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => handleDeleteUser(userToDelete)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
              >
                Sí, Eliminar Operador
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal to add operator */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                  <UserPlus className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Crear Nuevo Operador</h3>
                  <span className="text-[11px] text-slate-500">Alta autorizada por Operador Universal</span>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-xl font-bold cursor-pointer">
                ✕
              </button>
            </div>

            {formError && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleAddUser} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rol en el Sistema <span className="text-red-500">*</span>
                </label>
                <select
                  value={newRol}
                  onChange={e => {
                    const rol = e.target.value as UsuarioAutorizado['rolSistema'];
                    setNewRol(rol);
                    if (rol === 'Operador Universal' || rol === 'Administrador General') {
                      setNewMunicipio('TODOS');
                    }
                  }}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-purple-500 font-medium"
                >
                  <option value="Operador Universal">⭐ Operador Universal (Super Admin - 79 Municipios)</option>
                  <option value="Administrador General">Administrador General (Provincial)</option>
                  <option value="Coordinador Zonal">Coordinador Zonal</option>
                  <option value="Operador Municipal">Operador Municipal</option>
                </select>
                <span className="text-[11px] text-purple-700 mt-0.5 block">
                  {newRol === 'Operador Universal'
                    ? 'Permite agregar y eliminar operadores, y gestionar dirigentes y fiscales en todos los municipios.'
                    : 'Permisos delimitados según la jurisdicción y municipio asignado.'}
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Electrónico Oficial <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  placeholder="operador.municipio@misiones.partido.ar"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre y Apellido del Operador <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Fernando Romero"
                  value={newNombre}
                  onChange={e => setNewNombre(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contraseña Inicial <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  placeholder="Contraseña segura para login modal"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-purple-500 font-mono"
                />
                <span className="text-[11px] text-slate-500 mt-0.5 block">
                  Se calculará en tiempo real su hash criptográfico SHA-256 para almacenamiento seguro.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Municipio Asignado
                </label>
                <select
                  disabled={newRol === 'Operador Universal' || newRol === 'Administrador General'}
                  value={newMunicipio}
                  onChange={e => setNewMunicipio(e.target.value)}
                  className={`w-full px-3 py-2 text-sm rounded-lg border border-slate-300 bg-white focus:outline-none focus:border-purple-500 ${
                    (newRol === 'Operador Universal' || newRol === 'Administrador General') ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''
                  }`}
                >
                  <option value="TODOS">TODOS (Ámbito Provincial - 79 Municipios)</option>
                  {MUNICIPIOS_MISIONES.map(m => (
                    <option key={m.id} value={m.nombre}>
                      {m.nombre} ({m.departamento})
                    </option>
                  ))}
                </select>
                {(newRol === 'Operador Universal' || newRol === 'Administrador General') && (
                  <span className="text-[11px] text-emerald-700 mt-0.5 block">
                    ✓ Asignación automática: Jurisdicción sobre los 79 municipios provinciales.
                  </span>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 text-slate-700 text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
                >
                  Guardar Operador
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
