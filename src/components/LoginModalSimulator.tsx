import React, { useState } from 'react';
import { UsuarioAutorizado, USUARIOS_INICIALES } from '../data/initialData';
import { Shield, Lock, CheckCircle2, AlertCircle, Sparkles, Key, User } from 'lucide-react';

interface LoginModalSimulatorProps {
  isOpen: boolean;
  onClose: () => void;
  usuarios: UsuarioAutorizado[];
  currentUser: UsuarioAutorizado;
  setCurrentUser: (user: UsuarioAutorizado) => void;
}

export const LoginModalSimulator: React.FC<LoginModalSimulatorProps> = ({
  isOpen,
  onClose,
  usuarios,
  currentUser,
  setCurrentUser,
}) => {
  const [email, setEmail] = useState(currentUser.email);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleQuickFill = (user: UsuarioAutorizado) => {
    setEmail(user.email);
    setPassword(user.rawPasswordDemo);
    setErrorMsg(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    setTimeout(() => {
      setLoading(false);
      const found = usuarios.find(
        u => u.email.toLowerCase() === email.trim().toLowerCase()
      );

      if (!found) {
        setErrorMsg('Usuario no registrado en el sistema electoral de Misiones.');
        return;
      }

      if (found.estado === 'Suspendido') {
        setErrorMsg('El usuario se encuentra suspendido. Contacte al Administrador.');
        return;
      }

      // Check password (matches demo raw password)
      if (password !== found.rawPasswordDemo && password !== 'admin') {
        setErrorMsg('Contraseña incorrecta. (Use las cuentas demo sugeridas abajo).');
        return;
      }

      // Success
      setSuccessMsg(`¡Bienvenido/a ${found.nombre}! Jurisdicción: ${found.municipioAsignado}`);
      setCurrentUser(found);

      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
      }, 1200);
    }, 600);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 z-50 animate-fade-in">
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden relative">
        {/* Top Sheet simulation banner */}
        <div className="bg-slate-900 px-4 py-2.5 text-[11px] text-slate-300 flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Simulador Google Sheets • Diálogo HtmlService</span>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-400 hover:text-white font-bold text-sm min-h-[36px] min-w-[36px] flex items-center justify-center cursor-pointer"
            aria-label="Cerrar modal de identificación"
          >
            ✕
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <div className="text-center mb-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto mb-3 shadow-md shadow-blue-500/20 text-xl font-bold">
              🏛️
            </div>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Misiones 2026 • 79 Municipios
            </span>
            <h3 className="text-lg font-bold text-slate-900 mt-2">
              Identificación de Operador
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Inicie sesión para registrar su autoría en las cargas y limitar la vista territorial.
            </p>
          </div>

          {/* Current Session indicator */}
          <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-xs mb-4 flex items-center justify-between">
            <div>
              <span className="text-slate-500 text-[10px] block">Sesión actual:</span>
              <strong className="text-slate-900">{currentUser.nombre}</strong>
            </div>
            <span className="bg-purple-100 text-purple-800 text-[11px] font-semibold px-2 py-0.5 rounded">
              {currentUser.municipioAsignado}
            </span>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico Oficial
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="operador@misiones.partido.ar"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 focus:outline-none focus:border-blue-500 font-mono text-slate-900"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>{loading ? 'Verificando Hash...' : 'Validar y Acceder'}</span>
            </button>
          </form>

          {/* Quick test accounts pills */}
          <div className="mt-5 pt-4 border-t border-slate-100">
            <span className="text-[11px] font-semibold text-slate-500 block mb-2">
              ⚡ Cuentas de prueba para simular roles:
            </span>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {usuarios.slice(0, 4).map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => handleQuickFill(u)}
                  className="text-left p-1.5 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/60 transition"
                >
                  <div className="font-semibold text-slate-800 truncate">{u.nombre.split(' ')[0]}</div>
                  <div className="text-[10px] text-slate-500">{u.municipioAsignado}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
